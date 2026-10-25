# Agent Instructions

This project follows the **WAT framework** (Workflows, Agents, Tools): markdown SOPs in `workflows/` define the outreach system, you (the agent) decide when and how to run each step, and stdlib Python in `tools/` does the deterministic work, building sequence plans, scoring signals, rendering drafts and enforcing guardrails.

It is the engine that turns a contact list into a multi-channel, multi-threaded outreach plan. It is **not** a campaign, and it is **not** a sender.

## The two rules that override everything

1. **This engine generates, it never sends.** No SMTP, no LinkedIn session, no SMS gateway, no Apollo sequence push. `tools/test_integrations.py` scans every script for send paths and fails the build if one appears. If Chris wants a send bridge later it belongs in a separate, explicitly named, separately gated project.
2. **The spec wins over the code.** If `workflows/OUTREACH_SPEC.md` and a tool disagree, the tool is the bug. Fix the tool, or change the spec deliberately and note it in `CHANGELOG.md`. The sibling `Ag Enrichment US` project already shows what happens otherwise: its spec says T1 ≥ 55 while `score_companies.py:335` uses ≥ 41, and the data follows the code.

## Layout

```
workflows/      # SOPs. OUTREACH_SPEC.md is the authority, cited by code as §
library/        # The reusable engine content: plays, steps, templates,
                #   signal types, talking-point map, CTA ladder, objections.
                #   SHIPS POPULATED.
config/         # Guardrail data: approved claims, banned phrases, length
                #   limits, beliefs, differentiators, competitors, channels,
                #   senders, blackouts. SHIPS POPULATED, mostly generated.
input/          # What you drop in. Templates are header-only; real inputs
                #   are gitignored.
tools/          # Python, run from the project root
.tmp/           # Disposable intermediates, regenerated as needed
archive/        # Superseded CSVs, date-stamped, never deleted
.env            # API keys (never commit)
master_*.csv    # Deliverables. SHIP HEADER-ONLY and are gitignored once populated.
```

## The blank-contacts rule

`master_*.csv` at the root ship with **exactly one line each, the header**. That is deliberate: this is a reusable engine, not one campaign. The logic ships populated, the people do not.

Populated masters are gitignored. After any run against real data, the working copies stay local. Do not commit a file with a real person in it, and do not "helpfully" seed the masters with sample contacts.

## How to operate

1. Read `workflows/OUTREACH_SPEC.md` before touching scoring, orchestration or schema logic. Tools reference it by section number.
2. Look in `tools/` before writing a new script.
3. Run tools from the project root. Several read `.env` and CLI paths relative to the current working directory.
4. Editing voice rules: **edit the source markdown in the sibling `Linkedin Agent` project, then run `python tools/sync_voice_assets.py`.** Do not hand-edit `config/approved_claims.csv`, `banned_phrases.csv`, `length_limits.csv`, `beliefs.csv` or `differentiators.csv`. The next sync reverts hand edits. `sync_voice_assets.py --check` fails on drift.
5. Superseded CSVs go to `archive/` date-stamped `*_YYYY-MM-DD_<reason>.csv`, not deleted. That history has been useful for debugging drift in the sibling projects.
6. Never invent a claim, a number, a signal date or an evidence URL. A signal without a date and a URL is not a signal (`OUTREACH_SPEC.md` §9.5). Mark it pending and say so.
7. Free signals before paid ones. Score the whole file on free signals, then spend credits only on band A/B accounts. Enriching a HOLD account is wasted money.
8. Credit-consuming tools (`harvest_jobs.py --paid`, `harvest_news.py`, `harvest_people.py`) must state the estimated spend and ask before running at scale.

## What the plan is, and is not

`master_sequence_plan.csv` is a **proposal**, and `message_draft` is a **starting point**.

The anchor thread's first message is hand-written by the agent or by Chris (`OUTREACH_SPEC.md` §9.9). The renderer emits three variants in three different hook families precisely so someone chooses rather than pastes. A run of forty structurally identical emails fails the voice guide even when every lint rule passes.

Until the loop-closing tools land (`log_touch.py`, `advance_sequence.py`, `daily_queue.py`, `audit_sequence.py`, deferred to pass two), **nothing automatically knows when a prospect replies.** Chris reconciles the plan by hand before executing. Sequencing a second thread into an account where the anchor already replied is the worst failure this system can produce.

## Python house style

Matches the sibling enrichment projects exactly.

- Stdlib only: `argparse`, `csv`, `urllib.request`, `time`, `collections`, `pathlib`, `hashlib`, `re`. No pandas, no requests, no python-dotenv.
- Module docstring at line 1 with a `Usage:` block of literal command lines, citing spec sections by `§`.
- Parser always named `ap`, no `description=`. Defaults from module-level UPPER_SNAKE constants.
- `encoding="utf-8-sig"` on every CSV read and write. `csv.DictReader` materialized to a list. `csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")` with `newline=""`.
- Paths and `.env` come from `tools/paths.py`. Everything else is copy-pasted or sibling-imported (`from lint_messages import load_claims`), matching how `next_best_fit.py` imports from `apollo_search.py` next door.
- Logging is bare `print()`: per-row `[i/N] name: outcome`, tail `--- {n} rows -> {out}`, `=== SECTION ===` Counter blocks, warnings prefixed `  !! `.
- Resumable: read your own `--out` on start, skip done rows, print `Resuming: N already done.`
- Multi-value cells are `"; "`-joined. Provenance columns follow the `*_source` / `fit_quality` / `found_via` style.
- Structure: docstring → imports → CONSTANTS → helpers → `def main():` → `if __name__ == "__main__": main()`.
- HTTP is `urllib.request` with `timeout=45`. Rate limit with a fixed `time.sleep()`. On 429, sleep 20 and retry once, then log and skip the row keeping it unmodified so a resume pass can retry.
