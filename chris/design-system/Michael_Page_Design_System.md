# Michael Page — Design System (Unified Source of Truth)

**Last unified: 2026-09-28** · Owner: Chris (Christian) · Brand: Michael Page / Technology by PageGroup

This is the single reference for anything branded Michael Page — decks, posts, carousels,
docs, web, job ads. It merges four scattered sources into one. When any older file
disagrees with this document, **this document wins.**

---

## 0. What this replaced (source map)

| Source | What it was | Status |
|---|---|---|
| **Claude DS bundle** (`aa6f2610-…`) | Published `@michael-page/design-system@0.1.0` React library, synced via DesignSync CLI | **PRIMARY — current** |
| `7. Design System\1. New Design\` (OneDrive) | Real logo files, colors.png, fonts.png, brand voice + font `.txt` | Asset source (logos, graphics, guidelines) — folded in here |
| `pagegroup-slide-design-system.html` (Documents\Codex) | An HTML/CSS token draft (`#002B49`/`#003A70`) | **Superseded** — do not use its palette |
| Old `michael-page-brand` skill (`#003A8F` all-blue) | Legacy text guide | **Retired** |

**Live copies in this folder:**
- `bundle/` — the DS bundle (`_ds_bundle.css`, `_ds_bundle.js`, `styles.css`, `fonts/`, `README.md`, `_ds_manifest.json`)
- `logos/` — Michael Page logo files (colour, white, X/Twitter, Viva Engage, .ai jpg)

**Larger asset libraries stay in OneDrive** (too big to duplicate) at
`OneDrive\Escritorio\Chris - PC\3. Michael Page\7. Design System\1. New Design\`:
- `2. Graphics\` — illustrations, expression motifs, job-ad backgrounds, brand icons
- `3. Icons\` — full line-icon library (FontAwesome-style SVGs)
- `5. Teams Background\` — branded Teams backgrounds
- `1. Deck template\` — official 2026 PowerPoint templates (Michael Page + Page Executive)

The DS bundle is maintained in the claude.ai project (id `aa6f2610-9199-4bc3-bf8e-d0491dc5b976`).
When it changes, re-export the zip and re-sync `bundle/` here.

---

## 1. Color palette (authoritative hex)

### Core brand
| Token | Name | HEX | Use |
|---|---|---|---|
| `--mp-confident-blue` / `--mp-ink` | Confident Blue | `#22174E` | Primary dark, headlines, body text, feature surfaces |
| `--mp-energised-blue` / `--mp-accent` | Energised Blue | `#6059FF` | Primary CTA, links, active states, accent |
| `--mp-white` | White | `#FFFFFF` | Backgrounds, clean space |
| `--mp-energised-blue-t1` | Energised Blue Tint 1 | `#F7F7FF` | Ghost hover, info alert bg |
| `--mp-energised-blue-t2` | Energised Blue Tint 2 | `#E5E0F9` | Accent badge bg, focus ring |

### Neutrals
| Token | Name | HEX | Use |
|---|---|---|---|
| `--mp-slate` / `--mp-text-muted` | Slate | `#5A5570` | Muted/secondary text |
| `--mp-mist` / `--mp-border` | Mist | `#E7E6EE` | Borders, dividers |
| `--mp-cloud` | Cloud | `#F4F4F8` | Section backgrounds, neutral badge |

### Recruitment secondary (Michael Page)
| Token | Name | HEX |
|---|---|---|
| `--mp-ava-aqua` | Ava Aqua | `#8FE9FF` |
| `--mp-monty-mint` | Monty Mint | `#ABF4AB` |
| `--mp-luca-lilac` | Luca Lilac | `#E19FFF` |
| `--mp-carson-coral` | Carson Coral | `#FF7061` |
| `--mp-siena-sand` | Siena Sand | `#FFC88F` |
| `--mp-lucy-lemon` | Lucy Lemon | `#FFFFA9` (50%: `#FEFFD8`) |

### Enterprise secondary
| Token | Name | HEX |
|---|---|---|
| `--mp-peyton-plum` | Peyton Plum | `#840660` |
| `--mp-eli-emerald` | Eli Emerald | `#265149` |
| `--mp-iona-indigo` | Iona Indigo | `#451968` |

### Page Executive secondary
| Token | Name | HEX |
|---|---|---|
| `--mp-gigi-gold` | Gigi Gold | `#DDBC72` |
| `--mp-riley-rose` | Riley Rose | `#FFCFE1` |

**Rules**
- Primary duo carries everything: Confident Blue `#22174E` + Energised Blue `#6059FF` on white.
- Secondary tones are pastel accents for badges, illustration, category coding — pick sparingly, don't rainbow.
- Never introduce off-palette colours. Never recolour the logo.

---

## 2. Typography

### Official brand fonts (design/web, when available)
- **Headlines:** Agrandir Tight Bold (hero typeface)
- **Body:** Inter (black or white depending on background)
- **Asian:** TT ZhiHei CHS Variable Bold (headlines) / Source Han Sans (body)

### Office + system fallback (PPT, Word, and the DS bundle)
- **Headlines:** Aptos Display Bold / Aptos Bold (weight 700)
- **Body:** Aptos Light / Aptos regular
- The DS bundle ships **Aptos** throughout (`bundle/fonts/`), tokens `--mp-font-heading` / `--mp-font-body`.

### Type scale (from DS bundle)
| Level | Class | Size |
|---|---|---|
| Title | `.mp-heading--title` | 3.5rem (~56px) |
| Subtitle | `.mp-heading--subtitle` | 2.5rem (~40px) |
| Heading | `.mp-heading--heading` | 2rem (~32px) |
| Body heading | `.mp-heading--bodyHeading` | 1.5rem (~24px) |
| Section header | `.mp-heading--sectionHeader` | 1.125rem (~18px), body font, bold |
| Body | `.mp-text` | 1rem (16px) |
| Quote | `.mp-text--quote` | 1.25rem, italic, Energised Blue, left rule |
| Caption | `.mp-text--caption` | 0.8125rem (~13px), muted |

Headings: weight 700, letter-spacing −0.02em, line-height 1.05. Body line-height 1.5.

---

## 3. Layout tokens

**Radius:** sm `6px` · md `12px` · lg `20px` · pill `999px`
**Spacing:** xs `4px` · sm `8px` · md `16px` · lg `24px` · xl `40px`
**Shadow:** sm `0 1px 2px rgba(34,23,78,.08)` · md `0 4px 16px rgba(34,23,78,.1)` · lg `0 12px 32px rgba(34,23,78,.14)`
Cards use radius-lg + shadow-sm; buttons/badges use pill radius.

---

## 4. Components (12) — for web/HTML builds

Wrap everything in `<MPProvider>` (or `.mp-root` in plain HTML). Style via **props/classes**, never invent class names. Load once:
```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```
Components then live at `window.MichaelPageDS.*`.

| Component | Key options |
|---|---|
| `Button` | `variant`: primary (Energised Blue) / secondary (Confident Blue) / outline / ghost · `size`: sm/md/lg · `iconLeft`/`iconRight` |
| `Badge` | `tone`: neutral, accent, aqua, mint, lilac, coral, sand, lemon |
| `Card` | `variant`: default / elevated / feature (inverts to Confident Blue) · slots: CardMedia/CardBody/CardFooter |
| `Heading` | `level`: title / subtitle / heading / bodyHeading / sectionHeader |
| `Text` | `variant`: body / muted / caption / quote |
| `Input` | `label` / `hint` / `error` |
| `Checkbox` | `label` (checked fills Energised Blue) |
| `Alert` | `tone`: info / success / warning / error |
| `Avatar` | `name` / `src` / `size` |
| `Icon` | `name` / `size` (inherits text colour) |
| `Logo` | `variant`: colour / white |
| `Graphic` | `name` / `width` — brand illustrations + spot art |

Per-component API: `bundle/components/components/<Name>/<Name>.prompt.md` and `.d.ts`
(note: the components/ folder lives in the claude.ai project; re-export if you need the JSX/types locally).

`Graphic` names: appliedJob, savedJobs, uploadCv, jobMatch, benchmarks, chooseGuide, nps,
purpose, values, expression* motifs, and job-ad backgrounds `jobAdBg1`–`jobAdBg8`.

---

## 5. Logos

In `logos/`:
- `MichaelPage_colour.png` — primary, on white/light
- `MichaelPage_white.png` — on dark/Confident Blue
- `MichaelPageColourai.jpg` — high-res colour
- `Michael Page Logo X_Twitter.png.png` — social avatar
- `Viva Engage - Michael Page Logo Colombia.png.png` — internal Colombia

**Rules:** never stretch, recolour, add effects, or place on busy backgrounds. Clear space
≥ height of the "M". Min digital width 120px. Colour on white; white on Confident Blue.

---

## 6. Brand voice

Four principles: **straight talking · leading with confidence · staying sharp · good company.**

Honest, clear, down-to-earth, assured, purposeful, energetic, warm, human. Never corporate;
always personal, bold, emotionally intelligent.

**Do:** everyday language, get to the point, active voice, confident and decisive, warm and
helpful, make the next action clear, bring energy.
**Don't:** jargon/buzzwords, corporate fluff, passive/vague/hesitant, arrogant or boastful,
padding, hard-to-scan copy, cold/robotic/formal, clever at the expense of clear.

> Detailed voice for messages/posts/emails: `~/.claude/chris/voice/Chris_Voice_Source_of_Truth.md`
> and the `christian-writing-style` skill. This section is the brand-level layer; that file is Chris's personal voice.

Hard rules everywhere: no em dashes, no semicolons, only verified facts, never sound AI-generated.

---

## 7. Quick checklist before delivering anything

- [ ] Colours from Section 1 only (Confident Blue + Energised Blue lead)?
- [ ] Aptos (or Agrandir/Inter where available)?
- [ ] Logo correct variant, clear space, not recoloured?
- [ ] Voice: short, clear, confident, warm, human? No jargon/fluff?
- [ ] No em dashes / semicolons? Verified facts only?
- [ ] Clear next step / CTA?
