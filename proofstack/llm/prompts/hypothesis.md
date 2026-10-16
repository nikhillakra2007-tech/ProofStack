TASK
mode: {{mode}}        target: {{target}}        budget: at most {{max_hypotheses}} hypotheses, at most {{max_experiments}} experiments

BASELINE (measured by the controller, not by you)
{{baseline_summary}}

PROFILE (top functions by cumulative time) AND TRACEMALLOC TOP ALLOCATORS
{{profile_summary}}

AUDIT FINDINGS (probe fingerprints reproduced on the baseline)
{{audit_findings}}

EXPERIMENT CATALOG (you may only choose from these; est_runtime_s is the controller's estimate)
{{experiment_catalog}}

CODE UNDER INVESTIGATION
{{code_slice}}

Produce a HypothesisSet:
- 1 to {{max_hypotheses}} COMPETING hypotheses (H1..), each with root_cause_category, taxonomy (CWE and/or PERF tag),
  a statement, evidence_refs that point at the profile, the AST slice, or a probe finding, and a falsifiable_prediction.
- 1 to {{max_experiments}} experiments (E1..) chosen from the catalog; for EVERY experiment give a predicted outcome label
  (from that experiment's label vocabulary) for EVERY hypothesis. Choose experiments that make hypotheses predict different
  labels; an experiment on which all hypotheses agree has no value.
- Do not state probabilities or confidence numbers.
Schema: HypothesisSet (hypothesis-set.v1.json).
