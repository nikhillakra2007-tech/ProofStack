---
title: "ProofStack: Evidence Cockpit and Demo Specification (UI_UX_DESIGN_SYSTEM.md)"
subtitle: "Document 05 of the ProofStack specification suite"
version: "1.0"
date: "13 October 2026"
---

# 6. Production web cockpit and demo

## 6.1 Design thesis

The cockpit is a **case file, not a chat**. Judges and reviewers should read it the way an auditor reads a chain-of-custody record: ordered stages, measured values, a signature at the end. Nothing on screen is a model's opinion; every number, badge and line of text is traceable to a ledger entry (or visibly marked as a model proposal).

**The one memorable element is the Interlock** (section 6.5): a four-segment gauge for Performance, Security, Correctness and Concurrency. The Zero-Compromise rule is a conjunction, so it is drawn as a mechanism that only engages when all four segments are seated. When a faster patch leaks data, the Performance segment is visibly seated and the Security segment is visibly breached; the bolt stays out. That picture is the product.

Everything else stays quiet: a cool blueprint-paper ground, ink-dark type, hairline rules, flat panels, one measured accent per verdict state.

**Deliberately avoided** (so it does not read as templated): violet or blue-violet gradients, glass blur, grids of identical rounded cards, emoji or sparkle icons, chat bubbles, all-caps letter-spaced eyebrow labels, neon-on-black terminal imitation, and default Tremor or shadcn styling. Tremor is used only for chart primitives and is re-skinned with the tokens below.

## 6.2 Stack and structure

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, React Server Components for static shells, client components for Monaco and charts |
| Styling | Tailwind CSS with CSS variables as the single source of design tokens (`@theme`/`tailwind.config` maps `--ps-*`) |
| Code views | Monaco `DiffEditor`, dynamically imported, read-only, custom themes `proofstack-light` and `proofstack-dark` |
| Charts | Tremor `AreaChart`/`BarList` behind our own wrapper components; sample strips, discrimination matrix and the Interlock are custom SVG |
| Data | Read-only API served by `proofstack serve` (localhost): REST for runs and artifacts, SSE for live events; the cockpit never writes to the ledger |
| Types | Generated from `schemas/*.json` with `json-schema-to-typescript` at build time |
| Fonts | Atkinson Hyperlegible Next (interface) and Atkinson Hyperlegible Mono (code, hashes), self-hosted woff2, so the demo needs no network; fallback stacks below. Confirm the files and the OFL license on the build day |

Routes: `/` run list; `/runs/[runId]` the case file (four viewports); `/runs/[runId]/ledger` chain browser; `/demo` deterministic replay of a recorded ledger (`?ledger=...&speed=1x`).

Server API: `GET /api/runs`, `GET /api/runs/{id}`, `GET /api/runs/{id}/ledger`, `GET /api/runs/{id}/events` (SSE), `GET /api/runs/{id}/artifacts/{path}` (path-joined under the run directory, no traversal, `Content-Security-Policy: default-src 'self'`).

## 6.3 Design tokens

```css
:root {                                  /* light is the default */
  --ps-paper: #E9EEF2;  --ps-sheet: #F7F9FB;  --ps-ink: #13202B;  --ps-ink-2: #3F5262;
  --ps-rule: #B8C6D1;   --ps-edge: #6F8392;   /* edge: control borders, 3.7:1 on sheet */
  --ps-focus: #0B5CAD;  --ps-seated: #0F6B4F; --ps-breach: #B42318;
  --ps-hold: #8A5A00;   --ps-notrun: #566775;
  --ps-font-ui: "Atkinson Hyperlegible Next", "Source Sans 3", system-ui, sans-serif;
  --ps-font-mono: "Atkinson Hyperlegible Mono", "Source Code Pro", ui-monospace, monospace;
  --ps-radius: 2px;  --ps-space: 4px;  --ps-rule-w: 1px;
}
:root[data-theme="dark"], @media (prefers-color-scheme: dark) {
  --ps-paper: #0F1A22;  --ps-sheet: #16242E;  --ps-ink: #E6EDF2;  --ps-ink-2: #A9BAC7;
  --ps-rule: #33495A;   --ps-edge: #6F8798;   --ps-focus: #6CB0F5; --ps-seated: #4FC594;
  --ps-breach: #FF8A80; --ps-hold: #E8B04A;   --ps-notrun: #8FA2B1;
}
```

Measured WCAG contrast (text and status colours against the panel `sheet`; the page `paper` is within 0.6 of each):

| Token | Light | Dark |
|---|---|---|
| ink | 15.7 | 13.4 |
| ink-2 | 7.7 | 8.0 |
| focus | 6.3 | 6.9 |
| seated | 6.2 | 7.4 |
| breach | 6.2 | 6.9 |
| hold | 5.6 | 8.1 |
| notrun | 5.5 | 6.0 |

All are at or above 4.5:1. Status is never colour alone: each state also has a shape and a word (below).

Type scale (px / line-height): 13/18 meta, 14/20 body, 16/24 section lead, 20/28 stage title, 28/34 verdict, 44/48 headline numeral. Numerals use `font-variant-numeric: tabular-nums`. Headings and labels are sentence case. Radii 2 px on controls, 0 on panels; panels are separated by 1 px rules, not shadows. Spacing is a 4 px scale (4, 8, 12, 16, 24, 32, 48, 64). Motion: 120 ms ease-out for state changes; the Interlock seating animation is 280 ms and runs only when a gate result arrives; all motion is disabled under `prefers-reduced-motion`.

Status vocabulary (enum, displayed label, glyph):

| Enum | Displayed | Glyph | Colour token |
|---|---|---|---|
| `PASS` / `SECURITY_CLEAR` etc. | Seated | filled square with notch | seated |
| `FAIL` / `EXPLOIT_PROVEN` / `REGRESSION_DETECTED` | Breached / Exploit proven | square, open top edge, offset bar | breach |
| `INCONCLUSIVE` | Held | half-filled square | hold |
| `NOT_RUN` | Not run | dashed square | notrun |
| `NOT_APPLICABLE` | Not applicable | hairline square | ink-2 |
| `BASELINE_REPRODUCED`, `HYPOTHESIS_TESTED` | Baseline reproduced, Hypothesis tested | outline square with tick | focus |

## 6.4 Layout

```text
+--------------------------------------------------------------------------------------+
| ProofStack   run 0001  invoice-cache-idor   backend nebius-sandboxes   ledger 3199..  |  header 48 px
+-------------+------------------------------------------------------------------------+
| Chain       |  INTERLOCK  [Performance][Security][Correctness][Concurrency]  Verdict  |  sticky 96 px
| 0 run       +------------------------------------------------------------------------+
| 1 baseline  |  1  Baseline and profile                                                |
| 2 audit     |     sample strips | variance meter | flame/icicle + call stack          |
| 3 hypotheses+------------------------------------------------------------------------+
| 4 experiment|  2  Hypotheses and experiments                                          |
| 5 patch     |     hypothesis rows | discrimination matrix | score breakdown            |
| 6 gates     +------------------------------------------------------------------------+
| 7 verdict   |  3  Patch and exploit inspector                                         |
|             |     Monaco diff (left, wide) | exploit trace / console / probe JSON      |
| [verify]    +------------------------------------------------------------------------+
|             |  4  Verdict console                                                     |
|             |     gate table | reasons | badges | export | chain strip                 |
+-------------+------------------------------------------------------------------------+
```

Rail 280 px; content column max 1120 px; at widths under 768 px the rail becomes a bottom sheet, sections stack, and the diff becomes inline (unified). Stages appear as evidence arrives; stages without data show a plain "Waiting for baseline" line, never a skeleton shimmer.

## 6.5 The four viewports

### Viewport 1: baseline and profiler

Purpose: show that the baseline was reproduced and how trustworthy the measurement is.

| Component | Content | Notes |
|---|---|---|
| `SampleStrip` | One dot per sample for baseline and candidate on a shared axis; median tick; 95% bootstrap interval as a whisker | Custom SVG; log axis toggle; hover shows exact ns |
| `VarianceMeter` | Relative MAD with the 0.10 threshold marked; label Stable or Unstable | Unstable keeps every dependent stage at Held |
| `BaselineFacts` | Commit, test status, sample count, Python and CPU, sandbox backend and image id | From `BASELINE` and `RUN_STARTED` entries |
| `ProfileIcicle` | cProfile call tree as an icicle chart (canvas), top functions list, `tracemalloc` top allocators | Click selects a function and highlights its lines in viewport 3 |
| `ScalingCurve` | Time versus input size with fitted exponent (P04) or growth ratios (P01) | Tremor `AreaChart` wrapper, dashed fit line |

### Viewport 2: hypotheses and experiment timeline

Purpose: show competing explanations and why the next experiment was chosen.

- `HypothesisRow` (up to 3): id, category, CWE or performance tag, statement, evidence links (each opens the profile line or probe artifact), falsifiable prediction, state Alive, Falsified (struck through, with the observation) or Supported.
- `DiscriminationMatrix`: hypotheses as rows, experiments as columns, each cell the predicted outcome label; the chosen experiment's column is outlined; cells that separated hypotheses are filled. It makes "why this experiment" visible without a model's explanation.
- `ScoreBreakdown`: for each experiment the equation $D/(T+S+R)$ with the four numbers, so the ranking can be re-derived by eye.
- `ExperimentTimeline`: command (argv), duration, observation, survivors after the observation. Model proposals are labelled "Proposed by Nemotron" and visually distinct (outline, no fill) from executed observations (solid).

### Viewport 3: Monaco diff and exploit inspector

```text
+------------------------------------------------+-----------------------------------+
| a/app/invoices.py            | b/app/invoices.py| [Exploit] [Console] [Probe JSON]   |
|  8  def get_object(...):     |  8  def get_obj..|                                    |
|  9      row = _slow_fetch()  |  9  + if id in _C|  P03  Exploit proven               |
| 10      if row is None or .. | 10  +    return _C|  1 alice  GET invoice 1  -> 200   |
|                              |       ^ flagged   |  2 bob    GET invoice 1  -> 200   |
|                              |                   |    returned owner=alice  (leak)   |
+------------------------------------------------+-----------------------------------+
| gate strip: G0 seated  G3 seated  G4 breached (P03)  G7 seated        run 4.2 s      |
+--------------------------------------------------------------------------------------+
```

- Monaco `DiffEditor`: `readOnly: true`, `renderSideBySide` at widths of 1100 px and above, `minimap: false`, `wordWrap: "on"`, `originalEditable: false`, fonts from the mono token. Gutter decorations mark lines flagged by AST triggers (hollow marker) and by probe evidence (solid marker with the probe id). Selecting a decoration scrolls the right panel to the matching trace step.
- `ExploitTrace`: the probe's evidence rendered as numbered steps with request, principal, response and the offending field highlighted; payloads are shown as inert text (canaries) with a "benign canary, ran in sandbox" note.
- `ConsoleStream`: virtualized list (windowed), sandbox stdout and stderr with timestamps, level filter, sticky tail, copy line. Capped at 10,000 lines in memory; the full stream is a downloadable artifact.
- `ProbeJson`: the validated `ProbeFinding`, read-only.

### Viewport 4: Zero-Compromise verdict console

- **Interlock** (also pinned in the header): four equal segments with measured captions, for example "Performance: 2.0x, CI 1.98 to 2.1" or "Security: 1 exploit reproduced (P03)". A bolt bar under the segments engages only when all four are seated, in which case the label reads Accepted; otherwise it stays retracted and the label names the blocker: "Blocked by Security: P03 reproduced". A segment can be Seated, Breached, Held (inconclusive), Not run or Not applicable.

```text
 ACCEPTED         [ Performance ][ Security ][ Correctness ][ Concurrency ]
                  [   seated    ][  seated   ][   seated    ][   seated    ]
                  =========================== bolt engaged ===============

 REJECTED         [ Performance ][ Security ][ Correctness ][ Concurrency ]
                  [   seated    ][ BREACHED  ][   seated    ][ not applic. ]
                  ==== bolt retracted:  blocked by Security: P03 reproduced
```

- `GateTable`: every gate with family, status glyph and word, probe id, one-line evidence, fingerprint (copy), sandbox operation id. Rows for unrun required gates read Not run; the verdict cannot be Accepted while any such row exists.
- `BadgeStrip`: Baseline reproduced, Exploit proven, Hypothesis tested, Correctness pass, Security clear, Concurrency clear, Performance supported, Regression detected, then the final verdict Accepted, Rejected or Inconclusive. A single "verified" badge never exists.
- `LedgerChain`: entries as linked tags (sequence, type, first 8 hash characters); selecting one shows its JSON; **Verify in browser** recomputes every hash with `crypto.subtle` using the same canonicalization (sorted keys, no whitespace, UTF-8) and shows the head; test vectors are shared with the Python implementation.
- Export: Markdown report, JSON, SARIF, PR comment, ledger file, sealed head.

## 6.6 Live event contract

SSE `GET /api/runs/{id}/events`; each event is `{type, run_id, seq, ts, data}` where `data` is the matching ledger entry or a stream line. Replay (`proofstack replay`) emits the same events from a recorded ledger with original relative timing scaled by `--speed`.

| `type` | `data` | Viewport updated |
|---|---|---|
| `run.started` | `RUN_STARTED` entry | header |
| `baseline.sample` | `{label, ns}` | 1 |
| `baseline.complete` | `BASELINE` entry | 1 |
| `audit.finding` | `AUDIT_FINDING` entry (ProbeFinding) | 1, 3 |
| `hypotheses.created` | `HypothesisSet` | 2 |
| `experiment.started`, `experiment.finished` | experiment id, command, observation, survivors | 2 |
| `patch.proposed` | `PATCH_PROPOSED` entry (diff, model call) | 3 |
| `gate.started`, `gate.finished` | gate id, status, evidence | 3, 4 |
| `log.line` | `{stream, text, ts}` | 3 console |
| `ledger.appended` | `{seq, hash}` | 4 chain |
| `verdict.final` | `FINAL_VERDICT` entry | header, 4 |

## 6.7 States, accessibility, performance

- **States.** Every viewport has loading, empty, error and partial states in plain text. Inconclusive is a first-class result with its reason. Errors show the failing command, exit code and artifact link.
- **Truthfulness.** Unrun checks are Not run, never green; model-authored text is labelled; numbers are formatted from ledger values, never recomputed in the UI except for display rounding.
- **Accessibility.** WCAG 2.2 AA; full keyboard operation (rail, tabs, matrix cells, diff decorations); `aria-live="polite"` on verdict changes; Interlock exposes a text alternative ("Performance seated, Security breached by P03, bolt retracted"); focus ring 2 px `--ps-focus` with 2 px offset; targets at least 24 by 24 px; reduced-motion honoured.
- **Performance budgets.** First contentful paint under 1.5 s on the demo laptop; Monaco loaded on demand (only when viewport 3 enters the viewport); console windowed; charts capped at 2,000 points; no layout shift when events arrive (stage heights reserved).

## 6.8 Component inventory

| Component | Props (TypeScript sketch) | States |
|---|---|---|
| `Interlock` | `{families: Record<'PERF'\|'SEC'\|'CORR'\|'CONC', {status, caption}>, verdict}` | seated, breached, held, not-run, n/a; engaged or retracted |
| `StatusGlyph` | `{status, size}` | six statuses |
| `SampleStrip` | `{base: number[], cand?: number[], ci?: [number, number], log?: boolean}` | empty, partial, complete |
| `VarianceMeter` | `{relMad: string, max: string}` | stable, unstable |
| `ProfileIcicle` | `{tree, onSelect}` | loading, ready, too-large (falls back to table) |
| `HypothesisRow` | `{h, state, observation?}` | alive, falsified, supported |
| `DiscriminationMatrix` | `{hypotheses, experiments, chosen}` | static, highlighting |
| `MonacoDiff` | `{original, modified, markers, theme}` | loading (plain text fallback), ready |
| `ExploitTrace` | `{steps, fingerprint}` | proven, not reproduced |
| `ConsoleStream` | `{lines, filter}` | live, paused, truncated |
| `GateTable` | `{gates}` | sortable by family, status |
| `LedgerChain` | `{entries, onVerify}` | verified, failed at seq N |

## 6.9 The 2:50 demo script

Rules require a public video under three minutes. The three acts are timed to 2:50. The fixture is tuned (`SLOW_FETCH_MS`) so the cached read is roughly 10 to 20 times faster; the on-screen and narrated numbers are **read from the ledger by the replay driver, never typed in**. `proofstack replay` is the fallback recording path.

| Time | Act | Screen | Action | Narration (draft, read the numbers from the ledger) |
|---|---|---|---|---|
| 0:00 to 0:08 | I. The trap | Cockpit idle, CI log with all green | Cut from a passing CI run | "These pull requests passed every unit test." |
| 0:08 to 0:22 | I | Terminal | `proofstack scan examples/webapp --require-backend nebius` | "ProofStack audits them in a Nebius sandbox with the network turned off." Output shows `nebius-sandboxes`, operation ids, `networking disabled` |
| 0:22 to 0:40 | I | Viewport 1 and 3: P01 | Growth chart; badge Exploit proven | "A 23-character string takes {t22} ms; every two characters multiply the time by {ratio}. That is a denial of service hiding in an email validator." |
| 0:40 to 0:58 | I | Viewport 3: P02 | Query counter 100; the AI batching fix: count 1, leaked rows {n} | "The obvious fix is one query. It also lets a hostile filter read {n} rows it should not. Red state, proven, not guessed." |
| 0:58 to 1:12 | II. The climax | Viewport 2 | `proofstack verify --task invoice-cache-idor.json --synthesize` | "Nemotron proposes explanations. The controller picks the experiment that separates them by score; no model grades itself." Matrix and score breakdown on screen |
| 1:12 to 1:30 | II | Viewport 3 diff, viewport 1 | Patch proposed (cache); benchmark | "The patch is {speedup} times faster; statistics say that is real." Performance segment seats |
| 1:30 to 1:56 | II | Exploit trace; Interlock | Alice warms the cache, Bob reads Alice's invoice | "Bob just read Alice's invoice. Faster, and wrong. Zero-Compromise: Rejected." Bolt stays retracted: blocked by Security: P03 |
| 1:56 to 2:20 | III. Safe acceptance | Viewport 2 and 3 | Counterexample feedback; cycle 2 patch keyed by principal and object | "The exploit trace goes back to the model as evidence. The new cache is keyed per tenant." Four segments seat; bolt engages: Accepted, speedup {s2} with interval |
| 2:20 to 2:38 | III | Terminal and chain strip | `proofstack ledger verify ledger.jsonl` then flip one byte and verify again | "Every step is a hash-chained entry. Change one byte and verification fails." Exit code 4 shown |
| 2:38 to 2:50 | III | Export, closing card | `proofstack report ledger.jsonl --format pr-comment`; SARIF | "Reports drop into the pull request. ProofStack: a patch is accepted only when every domain agrees." Repo URL and license |

Recording protocol: 1920 by 1080, 30 fps, system dark or light theme fixed to light for legibility; narration at most 400 words (about 150 words per minute); rehearse against `proofstack replay` at 1x so timing is identical across takes; capture a fallback recording of the full replay; subtitles burned in; verify the final cut is under 3:00 before upload.

\newpage
