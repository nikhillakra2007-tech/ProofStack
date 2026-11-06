// Canonical gate taxonomy, rendered from schemas/gates.v1.json (repo root).
// Do not fork gate names or descriptions in UI copy; change the schema instead.
import gatesSchema from "../../../schemas/gates.v1.json";

export interface GateInfo {
  id: string;
  name: string;
  description: string;
  catches: string;
}

export const GATES: GateInfo[] = gatesSchema.gates;
