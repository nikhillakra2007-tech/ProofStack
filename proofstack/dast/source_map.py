"""
ProofStack DAST Source Mapper & Origin Classifier
Implements Section K.5 (page 27).
Maps live diagnostic findings to repository source files and classifies origin
into code, infrastructure, or unknown.
"""

from __future__ import annotations
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from proofstack.schemas import DastFindingSchema, SourceCandidate


class SourceMapper:
    def __init__(self, repo_dir: Path):
        self.repo_dir = repo_dir

    def map_finding(self, finding: DastFindingSchema) -> List[SourceCandidate]:
        candidates: List[SourceCandidate] = []
        check_id = finding.check_id

        # 1. Config / Headers / CORS (D-01, D-02, D-03, D-04, D-08, D-09)
        if check_id in ("D-01", "D-02", "D-03", "D-04", "D-08", "D-09"):
            config_candidates = [
                "next.config.js",
                "next.config.mjs",
                "next.config.ts",
                "middleware.ts",
                "middleware.js",
                "server.js",
                "app.js",
                "src/server.ts",
                "vercel.json",
                "netlify.toml"
            ]
            for rel_path in config_candidates:
                full_path = self.repo_dir / rel_path
                if full_path.exists():
                    candidates.append(SourceCandidate(
                        file=rel_path,
                        line_start=1,
                        line_end=min(50, len(full_path.read_text(encoding="utf-8", errors="ignore").splitlines())),
                        why="Framework configuration / middleware file controlling response headers, cookies, or CORS"
                    ))

        # 2. Exposed Client-Side Secrets / Storage Tokens (D-05, D-11)
        elif check_id in ("D-05", "D-11"):
            # Grep for env handling or keys
            for root, _, files in os.walk(self.repo_dir):
                for f in files:
                    if f.endswith((".js", ".ts", ".jsx", ".tsx", ".env.example", ".json")):
                        rel_file = Path(root, f).relative_to(self.repo_dir)
                        if any(ignored in str(rel_file) for ignored in ["node_modules", ".git", "dist", ".next"]):
                            continue
                        try:
                            content = (self.repo_dir / rel_file).read_text(encoding="utf-8", errors="ignore")
                            if finding.evidence.redacted_preview and finding.evidence.redacted_preview[:4] in content:
                                candidates.append(SourceCandidate(
                                    file=str(rel_file),
                                    line_start=1,
                                    line_end=20,
                                    why="Contains matching secret token prefix"
                                ))
                            elif check_id == "D-11" and ("localStorage" in content or "sessionStorage" in content):
                                candidates.append(SourceCandidate(
                                    file=str(rel_file),
                                    line_start=1,
                                    line_end=30,
                                    why="Client-side authentication storage call"
                                ))
                        except Exception:
                            pass

        # 3. DOM-XSS Sinks (D-06)
        elif check_id == "D-06":
            for root, _, files in os.walk(self.repo_dir):
                for f in files:
                    if f.endswith((".js", ".ts", ".jsx", ".tsx", ".html")):
                        rel_file = Path(root, f).relative_to(self.repo_dir)
                        if any(ignored in str(rel_file) for ignored in ["node_modules", ".git"]):
                            continue
                        try:
                            content = (self.repo_dir / rel_file).read_text(encoding="utf-8", errors="ignore")
                            for sink in ["innerHTML", "dangerouslySetInnerHTML", "document.write", "location.hash"]:
                                if sink in content:
                                    candidates.append(SourceCandidate(
                                        file=str(rel_file),
                                        line_start=1,
                                        line_end=50,
                                        why=f"Contains raw DOM sink or hash read '{sink}'"
                                    ))
                                    break
                        except Exception:
                            pass

        # 4. Sensitive Files and Routes (D-07)
        elif check_id == "D-07":
            # Check public or static directory
            for path_str in [".env", "public/.env", "static/.env", ".git", "public/admin"]:
                if (self.repo_dir / path_str).exists():
                    candidates.append(SourceCandidate(
                        file=path_str,
                        line_start=1,
                        line_end=10,
                        why="Sensitive resource located directly in public web root"
                    ))

        return candidates

    @staticmethod
    def classify_origin(
        reproduced_in_local_rebuild: bool,
        rebuild_succeeded: bool
    ) -> str:
        """
        Origin classification rule (Section K.5):
        - origin = code if problem reproduces after local rebuild of the repo.
        - origin = infrastructure if present on live target but absent in local rebuild (CDN, reverse proxy).
        - origin = unknown if local rebuild cannot be made to work.
        """
        if not rebuild_succeeded:
            return "unknown"
        if reproduced_in_local_rebuild:
            return "code"
        return "infrastructure"
