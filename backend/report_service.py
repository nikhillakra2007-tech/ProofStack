"""Report generation from persisted evidence."""
import uuid
import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend import models


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def generate(self, run_id: str, fmt: str, schema_version: str = "1.0") -> models.Report:
        run = self.db.query(models.Run).filter(models.Run.id == run_id).first()
        if not run:
            raise ValueError("Run not found")

        task = self.db.query(models.Task).filter(models.Task.id == run.task_id).first()
        gates = self.db.query(models.Gate).filter(models.Gate.run_id == run_id).order_by(models.Gate.execution_order).all()
        findings = self.db.query(models.Finding).filter(models.Finding.run_id == run_id).all()
        artifacts = self.db.query(models.Artifact).filter(models.Artifact.run_id == run_id).all()
        baselines = self.db.query(models.Baseline).filter(models.Baseline.run_id == run_id).all()
        decision = self.db.query(models.Decision).filter(models.Decision.run_id == run_id).first()

        if fmt == "markdown":
            content = self._render_markdown(run, task, gates, findings, artifacts, baselines, decision)
            content_json = None
        elif fmt == "json":
            content = None
            content_json = self._render_json(run, task, gates, findings, artifacts, baselines, decision, schema_version)
        else:
            raise ValueError(f"unsupported format: {fmt}")

        hash_payload = json.dumps({"run_id": run_id, "format": fmt, "content": content or content_json}, sort_keys=True)
        det_hash = hashlib.sha256(hash_payload.encode()).hexdigest()

        report = models.Report(
            id=str(uuid.uuid4()),
            run_id=run_id,
            report_type="investigation",
            format=fmt,
            schema_version=schema_version,
            content=content,
            content_json=content_json,
            decision_id=decision.id if decision else None,
            deterministic_hash=det_hash,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def _render_markdown(self, run, task, gates, findings, artifacts, baselines, decision) -> str:
        lines = [
            f"# ProofStack Investigation Report",
            f"",
            f"**Run ID:** `{run.id}`",
            f"**Status:** {run.status.value}",
            f"**Final Verdict:** {run.final_verdict.value if run.final_verdict else 'N/A'}",
            f"**Mode:** {task.mode if task else 'N/A'}",
            f"**Baseline Commit:** `{run.requested_baseline}`",
            f"**Policy Version:** {run.policy_version or 'N/A'}",
            f"",
            f"## Verdict Reason",
            f"",
            run.verdict_reason or "N/A",
            f"",
            f"## Gate Results",
            f"",
            f"| Gate | Family | Status | Probe | Evidence |",
            f"|------|--------|--------|-------|----------|",
        ]
        for g in gates:
            lines.append(f"| {g.gate_id} | {g.family} | {g.status.value} | {g.probe_id or '-'} | {g.failure_reason or '-'} |")

        lines.extend([
            f"",
            f"## Findings",
            f"",
        ])
        for f in findings:
            lines.append(f"- **{f.probe_id}**: {'EXPLOIT PROVEN' if f.found else 'NOT REPRODUCED'} ({', '.join(f.families)})")

        lines.extend([
            f"",
            f"## Artifacts",
            f"",
        ])
        for a in artifacts:
            lines.append(f"- `{a.original_filename or a.storage_key}` ({a.artifact_type}, {a.size_bytes} bytes, SHA-256: {a.sha256 or 'N/A'})")

        lines.extend([
            f"",
            f"## Environment Fingerprint",
            f"",
            f"```json",
            json.dumps(run.environment_fingerprint or {}, indent=2),
            f"```",
            f"",
            f"## Limitations",
            f"",
            f"- External sandbox integrations not exercised in this environment.",
            f"- PostgreSQL concurrency not verified.",
            f"- SARIF exports not implemented.",
        ])
        return "\n".join(lines)

    def _render_json(self, run, task, gates, findings, artifacts, baselines, decision, schema_version) -> dict:
        return {
            "schema_version": schema_version,
            "run_id": run.id,
            "status": run.status.value,
            "final_verdict": run.final_verdict.value if run.final_verdict else None,
            "verdict_reason": run.verdict_reason,
            "mode": task.mode if task else None,
            "baseline_commit": run.requested_baseline,
            "candidate_commit": run.requested_candidate,
            "policy_version": run.policy_version,
            "environment_fingerprint": run.environment_fingerprint,
            "gates": [
                {
                    "gate_id": g.gate_id,
                    "family": g.family,
                    "status": g.status.value,
                    "probe_id": g.probe_id,
                    "failure_reason": g.failure_reason,
                    "evidence": g.evidence,
                    "metrics": g.metrics,
                }
                for g in gates
            ],
            "findings": [
                {
                    "probe_id": f.probe_id,
                    "found": f.found,
                    "status": f.status,
                    "families": f.families,
                    "fingerprint": f.fingerprint,
                }
                for f in findings
            ],
            "artifacts": [
                {
                    "id": a.id,
                    "artifact_type": a.artifact_type,
                    "original_filename": a.original_filename,
                    "size_bytes": a.size_bytes,
                    "sha256": a.sha256,
                    "media_type": a.media_type,
                }
                for a in artifacts
            ],
            "baselines": [
                {
                    "source_revision": b.source_revision,
                    "sample_count": b.sample_count,
                    "median_ns": b.median_ns,
                    "rel_mad": b.rel_mad,
                    "stability_assessment": b.stability_assessment,
                }
                for b in baselines
            ],
            "decision": {
                "verdict": decision.verdict.value if decision else None,
                "policy_version": decision.policy_version if decision else None,
                "reasons": decision.reasons if decision else None,
                "waiver_ids": decision.waiver_ids if decision else None,
            } if decision else None,
            "limitations": [
                "External sandbox integrations not exercised.",
                "PostgreSQL concurrency not verified.",
                "SARIF exports not implemented.",
            ],
        }
