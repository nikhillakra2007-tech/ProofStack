// Canonical gate taxonomy, rendered from schemas/gates.v1.json (repo root).
// Do not fork gate names or descriptions in UI copy; change the schema instead.
// Vercel builds only see files inside the project's root directory, so the
// schema is vendored at src/lib/gates.v1.json; tests/test_gates_schema_sync.py
// asserts the vendored copy matches the repo-root canonical file.
import gatesSchema from "./gates.v1.json";

export interface GateInfo {
  id: string;
  name: string;
  description: string;
  catches: string;
}

export const GATES: GateInfo[] = gatesSchema.gates;
