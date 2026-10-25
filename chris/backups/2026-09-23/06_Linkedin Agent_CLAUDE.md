# Agent Instructions

This project follows the **WAT framework** (Workflows, Agents, Tools) with one deliberate naming exception: the SOP folder is `docs/`, not `workflows/`.

**Why the exception:** the global `linkedin-agent` skill (`~/.claude/skills/linkedin-agent/SKILL.md`) hardcodes paths like `docs/VOICE.md`, `docs/POSITIONING.md`, `docs/PILLARS.md`, etc. for every mode (`strategy`, `draft`, `ideas`, `calendar`, `radar`, `engage`, `profile`). Renaming `docs/` to `workflows/` would silently break the skill. Keep `docs/` as the SOP folder here; treat it as this project's `workflows/` equivalent.

## Layout

```
docs/           # SOPs (WAT's "workflows/", kept under this name for skill compatibility)
  VOICE.md, POSITIONING.md, PILLARS.md, ALGORITHM.md, HOOKS.md,
  FRAMEWORKS.md, FUNNEL.md, COMPETITORS.md, SOURCES.md, PROFILE.md
content/        # Deliverables and working state
  STRATEGY.md, calendar.md, ideas.csv, signals.csv, inbox.md, archive.csv, posts/
tools/          # Empty for now — no local scripts; the linkedin-agent skill is the execution layer
.tmp/           # Disposable intermediates, regenerated as needed
CHANGELOG.md    # Project history
```

## How to operate

1. Use the `linkedin-agent` skill for all content work — it already knows which `docs/*.md` file to load per mode (see the table at the top of its SKILL.md).
2. Run `strategy` first if `content/STRATEGY.md` doesn't exist yet — every other mode except `profile` gates on it.
3. Always check `content/inbox.md` before generating ideas — it holds raw material Chris drops in that hasn't been converted yet.
4. If you ever do add local scripts (e.g. to auto-post or pull analytics), put them in `tools/` and document the process in a new file — but don't touch the `docs/` naming without checking the skill first.
