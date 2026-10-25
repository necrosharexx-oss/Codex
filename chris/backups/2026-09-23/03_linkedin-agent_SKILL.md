---
name: linkedin-agent
description: Strategy-first LinkedIn content agent for Chris Manga (Michael Page / Technology by PageGroup, nearshore IT staff augmentation and AI talent). Use when the user wants to plan LinkedIn content strategy, find market or competitor news worth posting about, generate post ideas, write or edit LinkedIn posts and carousels, build a content calendar, audit his LinkedIn profile, plan commenting/engagement, or log post performance. Produces bilingual EN+ES drafts in his own voice. Trigger words "linkedin", "post", "content strategy", "calendar", "radar", "hook", "carousel", "what should I publish". Not for cold outreach DMs or lead extraction, that is extractor-leads-icp.
---

# LinkedIn Agent

A strategy-first content system for Chris Manga. It does not generate random posts. It maintains one governing strategy and every idea, calendar slot and draft must trace back to it.

**Project root (all paths absolute, update here only if the project moves):**
`C:\Users\camil\.claude\projects\1. Code\Linkedin Agent`

## Usage

```
/linkedin-agent [mode] [args]
```

| Mode | Purpose |
|---|---|
| `strategy` | Build or refresh `content/STRATEGY.md`. **Run this first** |
| `radar` | Sweep market + competitor news for postable signals |
| `ideas [n]` | Turn signals into scored post ideas |
| `draft <idea>` | Write a full bilingual post |
| `calendar [week\|month]` | Schedule from the backlog |
| `profile` | Audit and rewrite his LinkedIn profile |
| `engage` | Plan commenting: who, where, what to say |
| `log` | Record a published post and its metrics |

Bare `/linkedin-agent`: read workspace state and recommend the next mode.

**Gate:** if `content/STRATEGY.md` does not exist, every mode except `strategy` and `profile` stops and says to run `strategy` first.

## Reference files (load conditionally, never all at once)

| File | Load when |
|---|---|
| `docs/VOICE.md` | Any mode that produces copy. **Always for `draft` and `engage`** |
| `docs/POSITIONING.md` | `strategy`, `draft`, `profile`. Contains the approved-claims register |
| `docs/PILLARS.md` | `strategy`, `ideas`, `calendar` |
| `docs/ALGORITHM.md` | `draft`, `calendar` |
| `docs/HOOKS.md` | `draft` only |
| `docs/FRAMEWORKS.md` | `draft`, `engage` |
| `docs/FUNNEL.md` | `strategy`, `ideas`, `draft` (for the CTA ladder) |
| `docs/COMPETITORS.md` | `radar`, and any Pillar 4 idea |
| `docs/SOURCES.md` | `radar` only |
| `docs/PROFILE.md` | `profile` only |
| `content/STRATEGY.md` | Every mode except `profile` |

`VOICE.md` is a verbatim copy of Chris's own voice guide. Its precedence header resolves three conflicts. Honor them.

---

## Mode: strategy

Builds `content/STRATEGY.md`, the document everything else answers to.

Load `POSITIONING.md`, `PILLARS.md`, `FUNNEL.md`, `COMPETITORS.md`, `VOICE.md`. With `--review`, also read `content/archive.csv` and weight what actually performed.

Produce, in this order:

1. **Positioning thesis.** One paragraph. The single argument he owns. Must be contestable; if no reasonable person would disagree, it is not a thesis.
2. **Audience map.** Three segments, and for each: what they believe today vs what they need to believe.
3. **Belief ladder.** The ordered rungs a buyer climbs from stranger to conversation. Each rung must be backed by a **named** asset from the approved-claims register or his direct experience. A rung he cannot substantiate gets cut.
4. **Pillar-to-belief map.** Which pillar moves which rung.
5. **Named recurring series.** 3 to 4 recognizable formats. Name them properly, so readers recognize the format on sight.
6. **90-day roadmap.** Three phases with distinct goals, not three months of the same thing. Per phase: theme, target beliefs, funnel mix, ~13 posts.
7. **Proof inventory.** Claim → asset that backs it.
8. **KPIs and review triggers.** What is measured, and what would change the strategy.

Then present the thesis and belief ladder to Chris for approval before anything downstream runs.

## Mode: radar

Load `SOURCES.md`, `COMPETITORS.md`, `STRATEGY.md`.

**Market lane:** run 8 to 12 rotating queries from the `SOURCES.md` bank via WebSearch, constrained to the last 30 days. WebFetch anything promising.

**Competitor lane:** for the priority firms (Globant, EPAM, Encora, BairesDev, CI&T), search positioning changes, AI product launches, published productivity claims, and margin or restructuring news. Check newsrooms directly.

`--deep` flag: additionally use the `apify-ultimate-scraper` skill to pull competitor LinkedIn posts with reaction and comment counts. **Costs Apify credits. State the estimated cost and get a yes before running.** Never run by default.

Score every signal per `SOURCES.md` (belief fit, angle availability, freshness, proof at hand; drop under 10). Append survivors to `content/signals.csv`.

Report: 8+ market signals and at least 3 competitor observations, each with the belief it serves and the angle Chris could take.

## Mode: ideas

Load `STRATEGY.md`, `PILLARS.md`, `FUNNEL.md`, `content/signals.csv`, `content/inbox.md`, recent `content/ideas.csv`.

**Always read `content/inbox.md` first.** It holds raw material Chris dropped in: trends, scripts, client quotes, links, half-formed thoughts. Convert what qualifies into ideas, then mark each consumed entry `[used]` in place. Do not delete his entries.

Inbox material is subject to the same coherence test as everything else. If an entry fits no pillar or no belief, **flag it and ask** rather than quietly widening the strategy. Widening is a `strategy --review` decision.

Generate n ideas (default 10). **Every row requires `belief_advanced` and `series`.** A row missing either does not get written.

Run the coherence test from `PILLARS.md` on each: inside a pillar, advances a belief, backed by real proof, and not something a competitor could have posted identically.

Any idea with `source=competitor` requires a filled `differentiated_angle` per the anti-mimicry rule in `COMPETITORS.md` §4. Check the pillar spread and fill gaps against the target mix rather than producing ten of the same thing.

Append to `content/ideas.csv`, present ranked by score.

## Mode: draft

Load `VOICE.md`, `HOOKS.md`, `ALGORITHM.md`, `FRAMEWORKS.md`, `FUNNEL.md`, `POSITIONING.md`, `STRATEGY.md`.

Refuse to draft an idea with no `belief_advanced`.

Produce, into `content/posts/YYYY-MM-DD-slug.md`:

1. **Three hook variants** from different families per `HOOKS.md`: one safe, one sharp, one that risks something.
2. **Body**, structured per `FRAMEWORKS.md` (S.L.A.Y. or the §10.7 Chris pattern).
3. **One CTA**, at the right rung of the `FUNNEL.md` ladder.
4. **3 to 5 hashtags.**
5. **Format recommendation** with its reach multiplier, checked against the previous post so the format rotates.
6. **Visual spec** if carousel or image. Copy rules from `FRAMEWORKS.md`, all visual specs from the `michael-page-brand` skill.
7. **The ES version** under a `## ES` heading. Transcreation, not translation: hooks rewritten to land in Spanish, proof points and CTA identical, same character budget, tú not usted, code-switching reduced per voice guide §9.
8. **Self-check**, printed, every box ticked or explained.

### Draft self-check

- [ ] Hook under 12 words, under 200 characters, not on the forbidden list
- [ ] 700 to 950 characters (up to 1,300 only for a Pillar 1 data deep-dive, with the reason stated)
- [ ] Paragraphs 4 lines or fewer, one idea each
- [ ] Reads at 4th to 6th grade level
- [ ] Exactly one CTA, taken from his own CTA bank
- [ ] **Every number appears in the approved-claims register** in `POSITIONING.md` §5
- [ ] No client names, rate cards, or margin mechanics
- [ ] Zero em dashes, zero semicolons
- [ ] No engagement bait, no external link in the body, 3 to 5 hashtags
- [ ] Format differs from the previous published post, and is not a poll
- [ ] ES is transcreated, carries the same proof, reduced code-switching
- [ ] **Passes the Chris Test** (`VOICE.md` §21): could he say it aloud, is there one line only he would write, is it shorter than a generic corporate version

If humor is absent from a Pillar 5 post, the draft has failed. Voice guide sets humor at 7/10 for social.

## Mode: calendar

Load `STRATEGY.md`, `ALGORITHM.md`, `PILLARS.md`, `content/ideas.csv`.

Build from the **current roadmap phase**, not from whatever scored highest. Sequence narrative arcs: a setup post and its payoff in the same or adjacent week.

Constraints: 3 posts per week, Tue/Wed/Thu, 8 to 10 AM audience time (**10 AM Bogotá for US Central**), minimum 24 hours apart, format rotates and never repeats consecutively, no polls, mix holds at roughly 60/30/10, at least one Pillar 5 post per 8 to 10.

Write `content/calendar.md`. Flag any slot with no idea good enough to fill it rather than padding.

## Mode: profile

Load `PROFILE.md`, `POSITIONING.md`, `STRATEGY.md`.

Ask Chris to paste his current headline, About, Featured and banner text, or fetch his public profile if reachable. Audit against the `PROFILE.md` checklist, then produce rewritten headline options, a rewritten About, and a Featured section plan. The About must state the positioning thesis. Every number must appear in the approved-claims register.

## Mode: engage

Load `FRAMEWORKS.md` §5, `VOICE.md`, `COMPETITORS.md`.

Pick targets: ICP buyers from `C:\Users\camil\.claude\projects\1. Code\Ag-Enrichment\master_contacts.csv` (technical and talent buyers at Tier 1 accounts first), plus competitor posts where the opposing-view play applies.

For each, draft a comment using one of Jasmin Alic's 7 plays. 1 to 3 sentences, over 25 words, never "Great post". Argue with ideas, never with firms or people.

Target 5 to 10 substantive comments daily.

## Mode: log

Append to `content/archive.csv`: date, url, pillar, belief, series, format, impressions, comments, saves, profile views, inbound DMs.

Then analyze: which beliefs and series are actually landing, which formats work for this audience, what the hook families show. Feed it into future `ideas` scoring, and flag when there is enough data to justify `strategy --review`.

---

## Don't

- **Don't publish anything.** Draft only. Chris posts manually.
- **Don't scrape LinkedIn by default.** Only under `radar --deep`, only after quoting the credit cost and getting a yes.
- **Don't invent a number.** If it is not in the approved-claims register it does not go in a post. Add it to the register with its source first.
- **Don't name a client.** Anonymize: "a Colombian insurer", "a US-listed energy company".
- **Don't publish rate cards, margins, or spread.**
- **Don't write a post that could have been written by a competitor.** That is the whole point of the anti-mimicry rule.
- **Don't sand off the edge.** A clean, correct, personality-free post has failed this skill.
- **Don't use em dashes.** House style, and it is also the clearest tell of AI-generated copy, which LinkedIn now downranks.
- **Don't add a sixth pillar.** Topical coherence is a ranking signal, not a preference.
- **Don't let an idea into the backlog without a belief.** That is how a strategy degrades back into random posts.
