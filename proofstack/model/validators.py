"""
ProofStack Model Output Semantic Validators
Performs multi-stage validation:
1. Strips markdown fences & parses JSON
2. Draft 2020-12 JSON Schema validation
3. Semantic validation: evidence IDs exist, code refs in range, allowed experiments,
   patch hygiene (writable vs protected paths), and G0 pre-gate cleanliness.
"""

from __future__ import annotations
import json
import re
from typing import Any, Dict, List, Optional, Tuple
import jsonschema


def strip_code_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Strip opening fence (e.g., ```json)
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned


def parse_and_validate_json(raw_text: str, schema: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    cleaned = strip_code_fences(raw_text)
    try:
        data = json.loads(cleaned)
    except Exception as e:
        return False, None, f"JSON parse error: {str(e)}"

    try:
        validator = jsonschema.Draft202012Validator(schema)
        errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
        if errors:
            first_err = errors[0]
            path = ".".join(str(p) for p in first_err.path) or "root"
            return False, data, f"Schema validation error at {path}: {first_err.message}"
    except Exception as e:
        return False, data, f"Schema validation failed: {str(e)}"

    return True, data, None


class SemanticValidator:
    @staticmethod
    def validate_patch_hygiene(
        diff_text: str,
        writable_paths: Optional[List[str]] = None,
        protected_paths: Optional[List[str]] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        G7 patch hygiene enforcement: ensures diff touches only writable paths,
        and never touches tests/, benchmarks/, probes/, or configs.
        """
        protected = set(protected_paths or ["tests/", "benchmarks/", "probes/", "config/"])
        # Extract files from unified diff headers
        changed_files = re.findall(r"^\+\+\+ [b/]*(.*?)(?:\t.*)?$", diff_text, flags=re.MULTILINE)

        for file_path in changed_files:
            file_clean = file_path.strip()
            # Check protected paths
            for p in protected:
                if file_clean.startswith(p):
                    return False, f"Patch modifies protected path '{file_clean}'"

            # Check writable paths if restricted
            if writable_paths:
                allowed = any(file_clean.startswith(w) or file_clean == w for w in writable_paths)
                if not allowed:
                    return False, f"File '{file_clean}' is not in writable paths: {writable_paths}"

        return True, None

    @staticmethod
    def validate_evidence_refs(
        evidence_refs: List[str],
        known_artifact_ids: List[str]
    ) -> Tuple[bool, Optional[str]]:
        known_set = set(known_artifact_ids)
        for ref in evidence_refs:
            if not re.match(r"^art_[0-9a-f]{12}$", ref):
                return False, f"Invalid artifact ID format: {ref}"
            if ref not in known_set:
                return False, f"Evidence ref '{ref}' does not exist in artifact table"
        return True, None
