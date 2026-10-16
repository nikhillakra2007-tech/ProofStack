TASK
mode: {{mode}}        cycle: {{cycle}} of {{max_cycles}}  (cycles remaining after this one: {{cycles_left}})

YOUR PREVIOUS PATCH
{{previous_patch}}

GATE THAT REJECTED IT
gate: {{gate_id}}    probe: {{probe_id}}    family: {{family}}    fingerprint: {{fingerprint}}

MINIMAL COUNTEREXAMPLE (reproduced in the sandbox; this is a fact, not an opinion)
{{counterexample}}

DIFFERENTIAL (baseline behaviour versus your patch on the same input)
{{differential}}

GATES THAT PASSED AND MUST KEEP PASSING
{{passing_gates}}

CONTEXT PACK (unchanged)
{{context_pack}}

Revise the patch so the counterexample no longer reproduces WITHOUT regressing any passing gate and WITHOUT weakening tests,
benchmarks or policy. Do not argue with the counterexample. Respond with the same JSON object as the patch prompt plus
"addresses": "<which step of the counterexample your change eliminates>".
