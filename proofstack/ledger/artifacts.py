"""
ProofStack Artifact Store
Manages cryptographic artifacts with IDs matching art_[0-9a-f]{12}
and tracks SHA-256 integrity hashes for each item.
"""

from __future__ import annotations
import os
import secrets
import hashlib
from pathlib import Path
from typing import Dict, Optional, Union


class ArtifactStore:
    def __init__(self, base_dir: Optional[Union[str, Path]] = None):
        if base_dir is None:
            base_dir = Path(".proofstack_artifacts")
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._index: Dict[str, Dict[str, str]] = {}

    def generate_artifact_id(self) -> str:
        return f"art_{secrets.token_hex(6)}"

    def store(self, content: Union[str, bytes], custom_id: Optional[str] = None) -> tuple[str, str]:
        """
        Stores content (string or raw bytes).
        Returns (artifact_id, sha256_hash).
        """
        data = content.encode("utf-8") if isinstance(content, str) else content
        sha256 = hashlib.sha256(data).hexdigest()

        art_id = custom_id or self.generate_artifact_id()
        file_path = self.base_dir / f"{art_id}.bin"
        file_path.write_bytes(data)

        self._index[art_id] = {
            "path": str(file_path),
            "sha256": sha256,
            "size": str(len(data))
        }
        return art_id, sha256

    def retrieve(self, artifact_id: str) -> Optional[bytes]:
        file_path = self.base_dir / f"{artifact_id}.bin"
        if not file_path.exists():
            return None
        return file_path.read_bytes()

    def retrieve_text(self, artifact_id: str) -> Optional[str]:
        raw = self.retrieve(artifact_id)
        if raw is None:
            return None
        return raw.decode("utf-8", errors="replace")

    def get_hash(self, artifact_id: str) -> Optional[str]:
        if artifact_id in self._index:
            return self._index[artifact_id]["sha256"]
        raw = self.retrieve(artifact_id)
        if raw is not None:
            h = hashlib.sha256(raw).hexdigest()
            self._index[artifact_id] = {"path": str(self.base_dir / f"{artifact_id}.bin"), "sha256": h, "size": str(len(raw))}
            return h
        return None
