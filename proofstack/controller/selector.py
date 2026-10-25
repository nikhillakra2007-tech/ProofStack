"""
ProofStack Deterministic Experiment Selector
Heuristic scoring:
score(e) = discrimination_value(e) / (estimated_runtime(e) + setup_cost(e) + risk_penalty(e))
Per Section G of AI Agents Brief.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Tuple


DEFAULT_RUNTIMES = {
    "static_ast": 0.5,
    "counter_probe": 3.0,
    "scaling_sweep": 15.0,
    "race_harness": 10.0,
    "tracemalloc_run": 8.0,
    "pyperf_full": 45.0,
    "exploit_probe": 4.0,
}


@dataclass
class HypothesisPrediction:
    hypothesis_id: str
    predicted_outcome: str  # "CONFIRMED", "REFUTED", "INCONCLUSIVE"


@dataclass
class CandidateExperiment:
    experiment_id: str
    kind: str
    setup_cost: int  # 0, 2, 5
    risk_penalty: int  # 0, 3, 10
    is_destructive: bool = False
    predictions: Dict[str, str] = None  # hypothesis_id -> outcome

    def __post_init__(self):
        if self.predictions is None:
            self.predictions = {}

    @property
    def estimated_runtime(self) -> float:
        return DEFAULT_RUNTIMES.get(self.kind, 5.0)


class ExperimentSelector:
    def __init__(self, hypotheses: List[str]):
        self.hypotheses = sorted(hypotheses)

    def calculate_discrimination_value(self, experiment: CandidateExperiment) -> int:
        """
        Count pairs (hi, hj) whose predicted outcome category for e differ.
        """
        count = 0
        n = len(self.hypotheses)
        for i in range(n):
            for j in range(i + 1, n):
                h_i = self.hypotheses[i]
                h_j = self.hypotheses[j]
                pred_i = experiment.predictions.get(h_i)
                pred_j = experiment.predictions.get(h_j)
                if pred_i is not None and pred_j is not None and pred_i != pred_j:
                    count += 1
        return count

    def score(self, experiment: CandidateExperiment) -> float:
        if experiment.is_destructive:
            return -1.0  # EXCLUDED

        disc = self.calculate_discrimination_value(experiment)
        denominator = experiment.estimated_runtime + experiment.setup_cost + experiment.risk_penalty
        if denominator <= 0:
            return 0.0
        return disc / denominator

    def select_best(
        self,
        candidates: List[CandidateExperiment],
        remaining_budget_seconds: float = 600.0,
        separated_pairs: Optional[Set[Tuple[str, str]]] = None
    ) -> Optional[CandidateExperiment]:
        """
        Selects the highest scoring experiment.
        Tie-break: lower runtime, then lexicographic experiment id.
        Stops if:
        - top score <= 0
        - budget < cheapest runtime
        - all pairs already separated
        """
        valid_candidates = []
        for c in candidates:
            if c.is_destructive:
                continue
            if c.estimated_runtime > remaining_budget_seconds:
                continue
            score = self.score(c)
            if score > 0:
                valid_candidates.append((score, c.estimated_runtime, c.experiment_id, c))

        if not valid_candidates:
            return None

        # Sort: max score desc (-score), then runtime asc (+runtime), then id asc (+id)
        valid_candidates.sort(key=lambda item: (-item[0], item[1], item[2]))
        return valid_candidates[0][3]
