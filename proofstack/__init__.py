"""
ProofStack / PerfProof
Autonomous verification engine with Zero-Compromise Gate & Live-Target DAST
"""

__version__ = "0.1.0"

from proofstack.core.acceptance import Gate, decide
from proofstack.core.ledger import Ledger, make_entry
from proofstack.core.selector import Experiment, next_experiment, score, survivors
from proofstack.core.perf_gate import decide as perf_decide, rel_mad, bootstrap_ratio_ci

LEVELS = ("NORMAL", "WATCH", "WARNING", "CRITICAL")
