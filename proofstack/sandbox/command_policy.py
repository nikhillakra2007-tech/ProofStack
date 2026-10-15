"""
ProofStack Command Policy
Enforces strict allowlist of executable binaries and limits per Section P (page 38).
"""

from __future__ import annotations
from pathlib import Path
from typing import List, Optional, Tuple

ALLOWED_BINARIES = {"python", "python3", "pytest", "pyperf", "git"}
ALLOWED_GIT_SUBCOMMANDS = {"status", "diff", "log", "checkout", "apply", "rev-parse", "show"}
MAX_OUTPUT_BYTES = 1048576  # 1 MB


class CommandPolicyViolation(Exception):
    pass


class CommandPolicy:
    @staticmethod
    def validate_command(cmd: List[str]) -> Tuple[bool, Optional[str]]:
        if not cmd:
            return False, "Empty command"

        binary_name = Path(cmd[0]).name.lower()
        if binary_name.endswith(".exe"):
            binary_name = binary_name[:-4]

        if binary_name not in ALLOWED_BINARIES:
            return False, f"Banned executable '{binary_name}'. Only {sorted(ALLOWED_BINARIES)} allowed."

        if binary_name == "git":
            if len(cmd) < 2:
                return False, "Missing git subcommand"
            subcmd = cmd[1].lower()
            if subcmd not in ALLOWED_GIT_SUBCOMMANDS:
                return False, f"Git subcommand '{subcmd}' is not allowed in sandbox. Only {sorted(ALLOWED_GIT_SUBCOMMANDS)} allowed."

        # Scan arguments for illegal shell piping or redirection attempts
        for arg in cmd:
            if any(char in arg for char in [";", "|", "&", ">", "<", "`", "$("]):
                return False, f"Command contains forbidden shell metacharacters in argument: {arg}"

        return True, None
