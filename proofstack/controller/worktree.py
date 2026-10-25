"""
ProofStack Worktree Manager
Creates and cleans up isolated worktrees for baseline and candidate runs.
"""

from __future__ import annotations
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional


class WorktreeError(Exception):
    pass


class WorktreeManager:
    def __init__(self, repo_path: Path):
        self.repo_path = repo_path.resolve()
        self.active_worktrees: list[Path] = []

    def create_worktree(self, commit: str, name_prefix: str = "proofstack_wt_") -> Path:
        """
        Creates an isolated git worktree checked out at the given commit.
        Falls back to safe copy if git worktree command fails or repo is not git.
        """
        temp_dir = Path(tempfile.mkdtemp(prefix=name_prefix))
        try:
            cmd = ["git", "worktree", "add", "--detach", str(temp_dir), commit]
            res = subprocess.run(cmd, cwd=self.repo_path, capture_output=True, text=True, check=False)
            if res.returncode == 0:
                self.active_worktrees.append(temp_dir)
                return temp_dir
        except Exception:
            pass

        # Fallback to file copy if worktree add is not supported in the environment
        if self.repo_path.exists():
            shutil.copytree(self.repo_path, temp_dir, dirs_exist_ok=True, ignore=shutil.ignore_patterns(".git", "__pycache__"))
            self.active_worktrees.append(temp_dir)
            return temp_dir

        raise WorktreeError(f"Failed to create worktree for repo {self.repo_path}")

    def apply_patch(self, worktree_path: Path, patch_diff: str) -> bool:
        """
        Tests and applies a unified diff patch inside the worktree.
        """
        patch_file = worktree_path / ".proofstack_candidate.patch"
        patch_file.write_text(patch_diff, encoding="utf-8")
        try:
            check_res = subprocess.run(
                ["git", "apply", "--check", str(patch_file.name)],
                cwd=worktree_path,
                capture_output=True,
                text=True
            )
            if check_res.returncode != 0:
                return False

            apply_res = subprocess.run(
                ["git", "apply", str(patch_file.name)],
                cwd=worktree_path,
                capture_output=True,
                text=True
            )
            return apply_res.returncode == 0
        finally:
            if patch_file.exists():
                patch_file.unlink()

    def cleanup(self) -> None:
        for wt in self.active_worktrees:
            try:
                subprocess.run(["git", "worktree", "remove", "--force", str(wt)], cwd=self.repo_path, capture_output=True)
            except Exception:
                pass
            if wt.exists():
                shutil.rmtree(wt, ignore_errors=True)
        self.active_worktrees.clear()
