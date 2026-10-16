"""
ProofStack Hardware and Software Environment Fingerprinting.

Gathers deterministic, verifiable environmental evidence for reproducibility:
- Host CPU, core counts, architecture, operating system, and runtime versions.
- NVIDIA GPU detection via NVML (ctypes) and nvidia-smi fallback without external dependencies.
- Software lockfile / dependency hash and benchmark configuration.
- Deterministic canonical serialization and SHA-256 digest calculation.
"""
from __future__ import annotations

import ctypes
import hashlib
import json
import os
import platform
import subprocess
import sys
from typing import Any, Dict, List, Optional


def get_cpu_info() -> Dict[str, Any]:
    """Retrieve host CPU architecture, model, and core counts."""
    info = {
        "architecture": platform.machine() or "unknown",
        "processor": platform.processor() or "unknown",
        "logical_cpus": os.cpu_count() or 1,
        "system": platform.system(),
        "release": platform.release(),
        "version": platform.version(),
        "python_version": platform.python_version(),
        "python_implementation": platform.python_implementation(),
    }
    # On Windows, query friendly processor name from registry if processor string is generic
    if platform.system() == "Windows":
        try:
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
            cpu_name, _ = winreg.QueryValueEx(key, "ProcessorNameString")
            winreg.CloseKey(key)
            if cpu_name:
                info["model_name"] = str(cpu_name).strip()
        except Exception:
            info["model_name"] = info["processor"]
    else:
        info["model_name"] = info["processor"]

    return info


def detect_nvidia_gpus() -> Dict[str, Any]:
    """
    Detect NVIDIA GPUs using NVML via ctypes (preferred) or nvidia-smi CLI fallback.
    Never fabricates hardware specs: returns gpu_available=False if no NVIDIA device exists.
    """
    # 1. Attempt NVML ctypes query
    nvml_result = _detect_via_nvml()
    if nvml_result is not None:
        return nvml_result

    # 2. Attempt nvidia-smi fallback
    smi_result = _detect_via_nvidia_smi()
    if smi_result is not None:
        return smi_result

    # 3. Explicitly report unavailable hardware
    return {
        "gpu_available": False,
        "gpu_count": 0,
        "detection_method": "none",
        "devices": [],
        "driver_version": None,
        "cuda_version": None,
        "reason": "NO_NVIDIA_DEVICE_OR_NVML_UNAVAILABLE",
    }


def _detect_via_nvml() -> Optional[Dict[str, Any]]:
    """Attempt direct query of nvml.dll (Windows) or libnvidia-ml.so (Linux) via ctypes."""
    lib_names = ["nvml.dll"] if platform.system() == "Windows" else ["libnvidia-ml.so.1", "libnvidia-ml.so"]
    nvml = None
    for name in lib_names:
        try:
            nvml = ctypes.CDLL(name)
            break
        except Exception:
            continue

    if nvml is None:
        return None

    try:
        init_res = nvml.nvmlInit_v2()
        if init_res != 0:
            return None

        device_count = ctypes.c_uint()
        nvml.nvmlDeviceGetCount_v2(ctypes.byref(device_count))
        count = device_count.value

        driver_buf = ctypes.create_string_buffer(64)
        nvml.nvmlSystemGetDriverVersion(driver_buf, 64)
        driver_str = driver_buf.value.decode("utf-8", "ignore").strip()

        cuda_v = ctypes.c_int()
        cuda_str = None
        if hasattr(nvml, "nvmlSystemGetCudaDriverVersion"):
            if nvml.nvmlSystemGetCudaDriverVersion(ctypes.byref(cuda_v)) == 0:
                # 13020 -> 13.2
                major = cuda_v.value // 1000
                minor = (cuda_v.value % 1000) // 10
                cuda_str = f"{major}.{minor}"

        devices: List[Dict[str, Any]] = []
        for i in range(count):
            handle = ctypes.c_void_p()
            if nvml.nvmlDeviceGetHandleByIndex_v2(i, ctypes.byref(handle)) != 0:
                continue

            name_buf = ctypes.create_string_buffer(64)
            nvml.nvmlDeviceGetName(handle, name_buf, 64)
            name_str = name_buf.value.decode("utf-8", "ignore").strip()

            # Memory
            class MemoryV2(ctypes.Structure):
                _fields_ = [
                    ("version", ctypes.c_uint),
                    ("total", ctypes.c_ulonglong),
                    ("free", ctypes.c_ulonglong),
                    ("used", ctypes.c_ulonglong),
                ]
            class MemoryV1(ctypes.Structure):
                _fields_ = [
                    ("total", ctypes.c_ulonglong),
                    ("free", ctypes.c_ulonglong),
                    ("used", ctypes.c_ulonglong),
                ]

            mem_total = 0
            mem_free = 0
            mem_used = 0
            mem1 = MemoryV1()
            if hasattr(nvml, "nvmlDeviceGetMemoryInfo"):
                if nvml.nvmlDeviceGetMemoryInfo(handle, ctypes.byref(mem1)) == 0:
                    mem_total = mem1.total
                    mem_free = mem1.free
                    mem_used = mem1.used

            # Compute capability
            major_cc = ctypes.c_int()
            minor_cc = ctypes.c_int()
            cc_str = "unknown"
            if hasattr(nvml, "nvmlDeviceGetCudaComputeCapability"):
                if nvml.nvmlDeviceGetCudaComputeCapability(handle, ctypes.byref(major_cc), ctypes.byref(minor_cc)) == 0:
                    cc_str = f"{major_cc.value}.{minor_cc.value}"

            devices.append({
                "index": i,
                "name": name_str,
                "memory_total_bytes": mem_total,
                "memory_total_mb": round(mem_total / (1024 * 1024), 1) if mem_total else 0,
                "memory_free_bytes": mem_free,
                "memory_used_bytes": mem_used,
                "compute_capability": cc_str,
            })

        nvml.nvmlShutdown()

        return {
            "gpu_available": count > 0,
            "gpu_count": count,
            "detection_method": "nvml_ctypes",
            "driver_version": driver_str,
            "cuda_version": cuda_str,
            "devices": devices,
            "reason": "OK" if count > 0 else "NO_DEVICES_FOUND",
        }
    except Exception:
        return None


def _detect_via_nvidia_smi() -> Optional[Dict[str, Any]]:
    """Fallback query via nvidia-smi CLI."""
    try:
        cmd = [
            "nvidia-smi",
            "--query-gpu=name,driver_version,memory.total,memory.free,memory.used,compute_cap",
            "--format=csv,noheader,nounits",
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
        if res.returncode != 0 or not res.stdout.strip():
            return None

        lines = [line.strip() for line in res.stdout.strip().splitlines() if line.strip()]
        devices = []
        driver_version = None
        for i, line in enumerate(lines):
            parts = [p.strip() for p in line.split(",")]
            if len(parts) >= 6:
                name, drv, total_mb, free_mb, used_mb, cc = parts[:6]
                driver_version = drv
                devices.append({
                    "index": i,
                    "name": name,
                    "memory_total_bytes": int(float(total_mb) * 1024 * 1024),
                    "memory_total_mb": float(total_mb),
                    "memory_free_bytes": int(float(free_mb) * 1024 * 1024),
                    "memory_used_bytes": int(float(used_mb) * 1024 * 1024),
                    "compute_capability": cc,
                })

        return {
            "gpu_available": len(devices) > 0,
            "gpu_count": len(devices),
            "detection_method": "nvidia_smi_cli",
            "driver_version": driver_version,
            "cuda_version": None,
            "devices": devices,
            "reason": "OK" if devices else "NO_DEVICES_FOUND",
        }
    except Exception:
        return None


def get_dependency_fingerprint(root_dir: str) -> str:
    """Compute SHA-256 fingerprint over critical dependencies and lockfiles."""
    h = hashlib.sha256()
    target_files = [
        "requirements.txt",
        "pyproject.toml",
        "frontend/package.json",
        "frontend/package-lock.json",
    ]
    for rel_path in target_files:
        full_path = os.path.join(root_dir, rel_path)
        if os.path.isfile(full_path):
            h.update(rel_path.encode())
            with open(full_path, "rb") as f:
                h.update(f.read())
    return h.hexdigest()[:16]


class EnvironmentFingerprint:
    """Complete, immutable environment fingerprint for benchmark reproducibility."""

    def __init__(
        self,
        workload_id: str,
        root_dir: Optional[str] = None,
        custom_config: Optional[Dict[str, Any]] = None,
    ):
        self.workload_id = workload_id
        self.root_dir = root_dir or os.getcwd()
        self.cpu = get_cpu_info()
        self.nvidia = detect_nvidia_gpus()
        self.dependency_hash = get_dependency_fingerprint(self.root_dir)
        self.harness_version = "1.0.0"
        self.custom_config = custom_config or {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to stable dictionary representation."""
        return {
            "schema_version": "1.0",
            "workload_id": self.workload_id,
            "harness_version": self.harness_version,
            "dependency_hash": self.dependency_hash,
            "cpu": self.cpu,
            "nvidia": self.nvidia,
            "config": self.custom_config,
        }

    def canonical_json(self) -> str:
        """Deterministic canonical JSON with sorted keys."""
        # Exclude volatile dynamic fields (free memory, used memory) from stable digest
        d = self.to_dict()
        stable_nvidia = dict(d["nvidia"])
        stable_devices = []
        for dev in stable_nvidia.get("devices", []):
            dev_copy = dict(dev)
            dev_copy.pop("memory_free_bytes", None)
            dev_copy.pop("memory_used_bytes", None)
            stable_devices.append(dev_copy)
        stable_nvidia["devices"] = stable_devices

        stable_repr = {
            "schema_version": d["schema_version"],
            "workload_id": d["workload_id"],
            "harness_version": d["harness_version"],
            "dependency_hash": d["dependency_hash"],
            "cpu": d["cpu"],
            "nvidia": stable_nvidia,
            "config": d["config"],
        }
        return json.dumps(stable_repr, sort_keys=True, separators=(",", ":"))

    def digest(self) -> str:
        """SHA-256 fingerprint digest of the environment."""
        return hashlib.sha256(self.canonical_json().encode()).hexdigest()
