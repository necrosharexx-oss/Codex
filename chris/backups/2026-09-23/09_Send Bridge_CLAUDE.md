# Agent Instructions — Send Bridge

The **send half** of the outreach system. `Outreach Engine` generates the plan and
the drafts; **this project turns due steps into things a human sends.** It is the
"separate, explicitly named, separately gated" send bridge that `Outreach Engine/CLAUDE.md`
says a sender must live in.

## The rule that overrides everything

**This project sends only through a human hand, and it stores no credentials.**

- It builds `.eml` files (you press Send), Gmail compose links (you press Send), a
  paste-ready console for LinkedIn (you paste and Send), and an export for an email
  sequencer **you** authorize. It does **not** log into LinkedIn, does not drive a
  LinkedIn session, does not hold your password or session cookie, and never clicks
  Send for you.
- **LinkedIn has no sanctioned send API.** Automating personal LinkedIn DMs/invites
  violates LinkedIn's User Agreement and risks the account. So LinkedIn stays manual
  (the console). Do not add a headless/cookie LinkedIn auto-sender to this project.
  If Chris ever accepts that risk, it belongs in yet another, separately-named project
  he operates himself.
- **Email is the automatable channel.** `.eml` + sequencer CSV are legitimate. A
  sequencer (Instantly/Smartlead/HubSpot/Outreach) is authorized by Chris, not by us.
- The anchor thread's first message stays hand-written (`Outreach Engine/OUTREACH_SPEC.md §9.9`).
  This project sends what is already drafted; it does not invent new copy.

## Layout

```
input/    outreach_database.csv  -> self-contained snapshot of the Outreach Engine
          export (same ICP, same contacts). Refresh by dropping a new export here.
config/   senders.csv, channels.csv (caps + windows), send_log.csv (what you sent)
tools/    stdlib Python, run from the project root
output/   generated queues, .eml files, console HTML (gitignored)
```

## How to operate

1. Refresh `input/outreach_database.csv` from the latest Outreach Engine export when
   the plan changes. Same ICP and contacts, no re-scoring here.
2. `python tools/paths.py` to sanity-check paths and the database.
3. `python tools/daily_queue.py` -> today's due steps (respects caps + `sent`).
4. `python tools/build_console.py` -> the click-copy-send page for the day.
5. `python tools/build_emails.py` -> `.eml` files + sequencer CSV for the email steps.
6. Work the console. Then `python tools/log_send.py --uid ST-##### --outcome sent`
   for each one worked (or bulk later), so tomorrow's queue skips them.

## Python house style

Matches the sibling projects: stdlib only (`argparse, csv, email, pathlib, urllib`),
module docstring with a `Usage:` block, parser named `ap`, `utf-8-sig` on every CSV,
bare `print()` logging, resumable via `config/send_log.csv`. No credentials in code,
config, or logs — ever.
