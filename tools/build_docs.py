"""Expand {{include ...}} / {{jsonl ...}} placeholders in docs_src/*.md, assemble the catalog and the master spec,
and proportion pipe-table column widths (pandoc sizes wide tables from the dash counts in the separator row)."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INC = re.compile(r"^\{\{include (?P<p>\S+?)(?::(?P<a>\d+)-(?P<b>\d+))?(?: lang=(?P<l>\w+))?\}\}$", re.M)
JL = re.compile(r"^\{\{jsonl (?P<p>\S+) (?P<n>\d+)\}\}$", re.M)
LANG = {"py": "python", "json": "json", "jsonl": "json", "txt": "text", "md": "markdown", "yaml": "yaml", "sh": "bash"}
FRONT = re.compile(r"\A---\n.*?\n---\n", re.S)


def inc(m):
    path = os.path.join(ROOT, m["p"])
    lines = open(path).read().rstrip("\n").splitlines()
    if m["a"]:
        lines = lines[int(m["a"]) - 1:int(m["b"])]
    return f"```{m['l'] or LANG.get(path.rsplit('.', 1)[-1], '')}\n" + "\n".join(lines) + "\n```"


def jl(m):
    obj = json.loads(open(os.path.join(ROOT, m["p"])).read().splitlines()[int(m["n"])])
    return "```json\n" + json.dumps(obj, indent=2) + "\n```"


def split_row(line):
    cells, cur, tick, esc = [], "", False, False
    for ch in line.strip().strip("|") if False else line.strip()[1:-1]:
        if esc:
            cur += ch; esc = False
        elif ch == "\\":
            cur += ch; esc = True
        elif ch == "`":
            tick = not tick; cur += ch
        elif ch == "|" and not tick:
            cells.append(cur); cur = ""
        else:
            cur += ch
    return cells + [cur]


def fix_tables(text):
    out, lines, i, fence = [], text.split("\n"), 0, False
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("```"):
            fence = not fence
        if not fence and ln.startswith("|") and i + 1 < len(lines) and re.fullmatch(r"\|(\s*:?-{3,}:?\s*\|)+", lines[i + 1].strip()):
            j = i
            while j < len(lines) and lines[j].startswith("|"):
                j += 1
            rows = [split_row(l) for k, l in enumerate(lines[i:j]) if k != 1]
            n = len(split_row(lines[i + 1]))
            w = []
            for c in range(n):
                col = [len(r[c].strip()) for r in rows if c < len(r)]
                w.append(max(6, min(46, round(0.5 * sum(col) / len(col) + 0.5 * max(col)))))
            sep = "|" + "|".join("-" * x for x in w) + "|"
            out += [lines[i], sep] + lines[i + 2:j]
            i = j
            continue
        out.append(ln)
        i += 1
    return "\n".join(out)


def expand(text):
    return fix_tables(JL.sub(jl, INC.sub(inc, text)))


def read(name):
    return open(os.path.join(ROOT, "docs_src", name)).read()


if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    docs = {"00_STRATEGIC_AUDIT.md": read("00_STRATEGIC_AUDIT.md"), "PRD.md": read("PRD.md"), "ARCHITECTURE.md": read("ARCHITECTURE.md"),
            "VERIFICATION_CATALOG.md": read("VERIFICATION_CATALOG_A.md") + "\n" + read("VERIFICATION_CATALOG_B.md") + "\n" + read("VERIFICATION_CATALOG_C.md"),
            "API_SPEC.md": read("API_SPEC.md"), "UI_UX_DESIGN_SYSTEM.md": read("UI_UX_DESIGN_SYSTEM.md"),
            "AI_PIPELINE.md": read("AI_PIPELINE.md"), "EXECUTION_PLAN.md": read("EXECUTION_PLAN.md"), "README.md": read("README.md")}
    built = {k: expand(v) for k, v in docs.items()}
    for k, v in built.items():
        open(os.path.join(out, k), "w").write(v)
    master = ("---\ntitle: \"ProofStack Specification Suite\"\nsubtitle: \"Evidence-driven verification of AI-written code: strategy, product, architecture, "
              "19-problem catalog, contracts, cockpit, AI pipeline, execution plan\"\nauthor: \"ProofStack team (working name in the checklist: PerfProof)\"\n"
              "date: \"13 October 2026\"\n---\n\n")
    order = ["README.md", "00_STRATEGIC_AUDIT.md", "PRD.md", "ARCHITECTURE.md", "VERIFICATION_CATALOG.md", "API_SPEC.md",
             "UI_UX_DESIGN_SYSTEM.md", "AI_PIPELINE.md", "EXECUTION_PLAN.md"]
    master += "\n\\newpage\n\n".join(FRONT.sub("", built[k]).strip() + "\n" for k in order)
    open(os.path.join(out, "PROOFSTACK_MASTER_SPEC.md"), "w").write(master)
    open(os.path.join(out, "pdf-header.tex"), "w").write(open(os.path.join(ROOT, "docs_src", "pdf-header.tex")).read())
    for k in [*built, "PROOFSTACK_MASTER_SPEC.md"]:
        print("built", k, os.path.getsize(os.path.join(out, k)) // 1024, "KiB")
