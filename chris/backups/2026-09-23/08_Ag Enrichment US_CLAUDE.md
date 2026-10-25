# Agent Instructions

This project follows the **WAT framework** (Workflows, Agents, Tools): markdown SOPs in `workflows/` describe the enrichment process, you (the agent) decide when and how to run each step, and Python scripts in `tools/` do the deterministic work — API calls to Apollo/FullEnrich/ZoomInfo, CSV building, auditing.

## Layout

```
companies/      # Company/account master data, one pair per universe
  master_companies.csv        US core-ICP accounts (200)
  master_companies_gb.csv     GB/Globant inbound accounts (983)
  master_issues.csv           Company-level QA gaps (regenerate: audit_master.py -> company_issues.py)

contacts/       # Contact master data, one pair per universe
  master_contacts.csv         US core-ICP contacts
  master_contacts_gb.csv      GB/Globant inbound contacts

sequences/      # THE PLAN - message copy, cadence, channel, angle
  sequence_plan_<date>.csv    Bilingual (en/es) message plan, one row per send step

crm/            # ENGAGEMENT STATE - what's been sent, replied, or suppressed - and the live working doc
  crm_workbook.xlsx           THE FILE TO OPEN. Stable name, always overwritten in place by
                               build_combined_workbook.py. Work in its "Engagement" tab, then run
                               sync_engagement_to_csv.py before the next regen.
  engagement_log_<date>.csv   Per-step send/reply tracking (SENT_yes_no, date_sent, reply_yes_no) -
                               canonical source of truth behind the Engagement tab
  excluded_accounts.csv       Living suppression list (vendor/non-ICP/departed) - append, don't delete

reports/        # One-off point-in-time reports only (dashboards, rosters, pivots) - empty unless
                # something's been generated since the last cleanup. Nothing here is wired to any
                # tool's default input path - if a report stops being useful, archive it.

workflows/      # SOPs, starting with ICP_SPEC.md — the ICP definition and data schema
tools/          # Python scripts, run from the project root (e.g. python tools/apollo_search.py ...)
.tmp/           # Disposable intermediates, regenerated as needed
.env            # Apollo / FullEnrich / ZoomInfo API keys (never commit)
archive/        # Superseded snapshots, mirrors the tree above (archive/companies/, archive/crm/, ...)
                #   - master_* files: snapshotted before every in-place edit
                #   - sequences/crm/reports files: superseded dated exports moved here as-is
```

## How to operate

1. Read `workflows/ICP_SPEC.md` before touching persona or scoring logic.
2. **Tool list drifts — don't trust a hardcoded list.** Run `ls tools/` and read each script's module docstring. Current groups:
   - **Search/discovery**: `apollo_company_search.py`, `apollo_search.py`, `apollo_linkedin_org_resolve.py`, `next_best_fit.py`, `apollo_match_by_name.py`, `apify_linkedin_search.py`, `apify_person_lookup.py`
   - **Reveal/enrichment**: `apollo_reveal_email.py`, `apollo_reveal_phone.py`, `fullenrich_reveal.py`
   - **Merge/finalize**: `dedupe_contacts.py`, `finalize_contacts.py`, `merge_fallback_contacts.py`, `merge_gb_enrichment.py`, `add_contact_counts.py`
   - **Scoring/tiering**: `score_companies.py`, `tier_gb_leads_v2.py`
   - **QA**: `audit_master.py`, `company_issues.py` (run in that order to regenerate `companies/master_issues.csv`)
   - **Reporting**: `build_combined_workbook.py`, `sync_engagement_to_csv.py`
   - **Misc**: `test_integrations.py`, `webhook_receiver.py`
   - **Archived (reference only, do not use)**: `archive/tools/`
3. Run tools from the project root — several read `.env` and CLI-supplied file paths relative to the current working directory.
4. **`score_companies.py` and `tier_gb_leads_v2.py` have no `--help`/dry-run gate — they run for real the moment you invoke them and overwrite `companies/master_companies*.csv` + `contacts/master_*_gb.csv` outright.** Never invoke either "just to check" something (e.g. a path change) without first snapshotting the files they write to `archive/`. (Every other script here uses `argparse`, so `--help` is safe on those.)
5. Superseded data files go to the matching `archive/` subfolder, not deleted — that history has been useful for debugging drift.
6. API keys live only in `.env` (see `.env.example` for the expected keys). Never hardcode credentials in `tools/`.
7. `sequences/` (the plan) and `crm/` (engagement state + suppression) are deliberately separate: edit the plan when cadence/copy changes, edit `crm/` when a send actually happens or an account gets excluded. Never write send/reply status back into `sequences/`.
8. **`crm/crm_workbook.xlsx` is the one file the user works in day to day — its "Engagement" tab mirrors `crm/engagement_log_<date>.csv`.** After marking sends/replies in Excel, run `python tools/sync_engagement_to_csv.py` to write those four columns (`SENT_yes_no`, `date_sent`, `reply_yes_no`, `reply_notes`) back into the CSV, matched by `step_uid`, *before* regenerating the workbook — `build_combined_workbook.py` overwrites `crm_workbook.xlsx` in place and unsynced edits are lost. This is the only file in the project meant to be hand-edited directly.
9. `reports/` is for disconnected, point-in-time snapshots only — nothing there feeds back into the pipeline. When in doubt about whether a file belongs in `reports/` vs. one of the connected folders (`companies/`, `contacts/`, `sequences/`, `crm/`), ask: does any tool read this file back in, or does anything sync into it? If not, it's a report.
