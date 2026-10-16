TASK
mode: {{mode}}        cycle: {{cycle}} of {{max_cycles}}        writable files: {{writable_files}}
limits: at most {{max_diff_lines}} changed lines, at most {{max_files}} files; protected paths (never touch): {{protected_paths}}

CONTEXT PACK (controller-assembled evidence and constraints)
{{context_pack}}

SURVIVING HYPOTHESIS AND THE OBSERVATION THAT SUPPORTS IT
{{hypothesis}}

SOURCE (line-numbered; the only code you may change)
{{source}}

Produce a minimal patch as a unified diff against the repository root (a/ and b/ prefixes, no binary content).
Respond with JSON: {"patch": "<unified diff>", "touches": ["<file>", ...], "invariants_kept": ["<invariant from the pack>", ...],
"rationale": "<at most 3 sentences>"}.
The patch must satisfy every invariant in the context pack and use none of its forbidden moves.
