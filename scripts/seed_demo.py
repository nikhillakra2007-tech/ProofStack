"""Seed or reset the deterministic ProofStack IDOR demo fixture via CLI.

Usage:
    python scripts/seed_demo.py [--reset] [--force]
"""
import sys
import os
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import SessionLocal
from backend.demo_service import seed_demo_fixture, reset_demo_fixture, is_demo_seeded



def main():
    parser = argparse.ArgumentParser(description="ProofStack Demo Fixture CLI")
    parser.add_argument("--reset", action="store_true", help="Remove demo fixture records cleanly")
    parser.add_argument("--force", action="store_true", help="Force re-seeding even if already present")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.reset:
            print("[INFO] Resetting demo fixture records...")
            res = reset_demo_fixture(db)
            print(f"[SUCCESS] {res['message']}")
            return

        print(f"[INFO] Seeding deterministic demo fixture (force={args.force})...")
        res = seed_demo_fixture(db, force=args.force)
        print("=" * 60)
        print("PROOFSTACK DEMO FIXTURE SUMMARY")
        print("=" * 60)
        print(f"Status:       {res['status']}")
        print(f"Project ID:   {res['project_id']}")
        print(f"Task ID:      {res['task_id']}")
        print(f"Run ID:       {res['run_id']}")
        print(f"Provenance:   {res['provenance']}")
        print(f"Verdict:      {res['verdict']}")
        print(f"Ledger Chain: {res['entry_count']} hash-chained entries")
        print("=" * 60)
        print(f"Demo Cockpit URL: http://localhost:3000/runs/{res['run_id']}")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    main()
