"""Experiment selector. Score(e) = D(e) / (T(e) + S(e) + R(e)); every cost is in seconds-equivalent.

D(e) = fraction of alive hypothesis PAIRS whose predicted outcomes differ for e (0..1). It is a transparent
heuristic, not 'optimal information gain'. Ties break on outcome-partition entropy, then experiment id.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from itertools import combinations
from math import inf, log2

RISK_S = {"network": 30.0, "nondeterministic": 20.0, "new_dependency": 15.0, "destructive": inf, "writes_outside_workspace": inf}


@dataclass(frozen=True)
class Experiment:
    id: str
    est_runtime_s: float
    setup_s: float = 0.0
    risks: tuple = ()
    predictions: dict = field(default_factory=dict)          # hypothesis_id -> predicted outcome label


def discrimination(e: Experiment, alive: list) -> float:
    pairs = [(a, b) for a, b in combinations(alive, 2) if a in e.predictions and b in e.predictions]
    return sum(e.predictions[a] != e.predictions[b] for a, b in pairs) / len(pairs) if pairs else 0.0


def entropy_bits(e: Experiment, alive: list) -> float:
    c = Counter(e.predictions[h] for h in alive if h in e.predictions)
    n = sum(c.values())
    return -sum(v / n * log2(v / n) for v in c.values()) if n else 0.0


def cost_s(e: Experiment) -> float:
    return e.est_runtime_s + e.setup_s + sum(RISK_S[r] for r in e.risks)


def score(e: Experiment, alive: list) -> float:
    c = cost_s(e)
    return 0.0 if c == inf or c <= 0 else discrimination(e, alive) / c


def next_experiment(experiments, alive, budget_s: float):
    """Best affordable experiment that separates at least one pair, else None (=> INCONCLUSIVE)."""
    ranked = sorted(((score(e, alive), entropy_bits(e, alive), e) for e in experiments
                     if e.est_runtime_s + e.setup_s <= budget_s),
                    key=lambda t: (-t[0], -t[1], t[2].id))
    return ranked[0][2] if ranked and ranked[0][0] > 0 else None


def survivors(alive: list, e: Experiment, observed: str) -> list:
    """Keep hypotheses whose prediction matched the observation; empty list = all falsified."""
    return [h for h in alive if e.predictions.get(h) == observed]
