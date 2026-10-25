# Michael Page Design System — how to build with it

Brand system for **Michael Page / Technology by PageGroup**. Voice: straight-talking,
confident, warm, human. Build UIs from the components below — don't hand-roll brand styling.

## Setup — wrap once in `MPProvider`

Every screen must sit inside `<MPProvider>`. It establishes the `.mp-root` scope that
carries the brand tokens, base font (Aptos) and text colour. Components read the design
tokens from this scope; without it they fall back to unstyled defaults.

```jsx
import { MPProvider, Button, Card, CardBody, Heading, Text, Badge } from "@michael-page/design-system";

<MPProvider>
  <Card>
    <Badge tone="aqua">Technology</Badge>
    <Heading level="bodyHeading">Senior Data Engineer</Heading>
    <CardBody>Bogotá · Hybrid · Permanent.</CardBody>
    <Button variant="primary" iconRight="arrow-right">View role</Button>
  </Card>
</MPProvider>
```

## Styling idiom — props first, tokens for your own layout

Components are styled through **props**, not utility classes. Never invent class names.
- `Button` — `variant` (`primary` = Energised Blue, `secondary` = Confident Blue, `outline`, `ghost`), `size` (`sm`/`md`/`lg`), `iconLeft`/`iconRight`.
- `Badge` — `tone` (`neutral`, `accent`, `aqua`, `mint`, `lilac`, `coral`, `sand`, `lemon`).
- `Card` — `variant` (`default`, `elevated`, `feature`); compose with `CardMedia`/`CardBody`/`CardFooter`.
- `Heading` — `level` (`title`, `subtitle`, `heading`, `bodyHeading`, `sectionHeader`). `Text` — `variant` (`body`, `muted`, `caption`, `quote`).
- `Input` (`label`/`hint`/`error`), `Checkbox` (`label`), `Alert` (`tone`: `info`/`success`/`warning`/`error`), `Avatar` (`name`/`src`/`size`), `Icon` (`name`/`size`), `Logo` (`variant`: `colour`/`white`).
- `Graphic` (`name`/`width`) — brand illustrations & product spot art (appliedJob, savedJobs, uploadCv, jobMatch, benchmarks, chooseGuide, nps, purpose, values, expression* motifs…) plus 8 square job-ad expression backgrounds (`jobAdBg1`–`jobAdBg8`). See the Graphic gallery.

For **your own** layout/glue, style with the brand CSS variables (all under the `.mp-root` scope):
- Colour: `--mp-confident-blue` `#22174E`, `--mp-energised-blue` `#6059FF`, `--mp-ink`, `--mp-text-muted`, `--mp-surface`, `--mp-border`, `--mp-cloud`; secondary tones `--mp-ava-aqua`, `--mp-monty-mint`, `--mp-luca-lilac`, `--mp-carson-coral`, `--mp-siena-sand`, `--mp-lucy-lemon`, `--mp-peyton-plum`, `--mp-eli-emerald`, `--mp-iona-indigo`, `--mp-gigi-gold`, `--mp-riley-rose`.
- Type: `--mp-font-heading`, `--mp-font-body`. Radius: `--mp-radius-sm/md/lg/pill`. Space: `--mp-space-xs/sm/md/lg/xl`. Elevation: `--mp-shadow-sm/md/lg`.

Example: `<div style={{ background: "var(--mp-cloud)", padding: "var(--mp-space-lg)", borderRadius: "var(--mp-radius-lg)" }}>`.

## Where the truth lives
- `styles.css` (+ its `@import` closure `_ds_bundle.css`, `fonts/`) — the full token + component-class source. Read it before styling.
- Each component's `components/components/<Name>/<Name>.prompt.md` (usage) and `.d.ts` (exact prop API).

## Notes
- Typography is **Aptos** throughout (bundled): headings render in **Aptos Bold** (weight 700), body in Aptos regular.
- `Logo` and the brand colours are fixed brand assets — don't recolour the logo or introduce off-palette colours.

# MichaelPageDS (@michael-page/design-system@0.1.0)

This design system is the published @michael-page/design-system React library, bundled as a single
browser global. All 12 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.MichaelPageDS`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.MichaelPageDS.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { Alert } = window.MichaelPageDS;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Alert />);
```

Wrap the tree in the provider — most components read theme/i18n from context:

```jsx
<MPProvider>{children}</MPProvider>
```

## Tokens

41 CSS custom properties from @michael-page/design-system. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (2): `--mp-surface`, `--mp-text-muted`
- **spacing** (5): `--mp-space-xs`, `--mp-space-sm`, `--mp-space-md`, …
- **typography** (2): `--mp-font-heading`, `--mp-font-body`
- **radius** (4): `--mp-radius-sm`, `--mp-radius-md`, `--mp-radius-lg`, …
- **shadow** (3): `--mp-shadow-sm`, `--mp-shadow-md`, `--mp-shadow-lg`
- **other** (25): `--mp-confident-blue`, `--mp-energised-blue`, `--mp-white`, …

## Components

### components
- `Alert` — Inline message banner, coloured from the brand palette.
- `Avatar` — Circular user avatar with an initials fallback.
- `Badge` — Small pill label for status, categories or tags.
- `Button` — Primary call-to-action control, styled to the Michael Page brand.
- `Card` — Content container. feature inverts to the Confident Blue brand surface.
- `Checkbox` — Brand checkbox  checked state fills with Energised Blue.
- `Graphic` — Renders a Michael Page brand graphic / illustration (spot art, expression
- `Heading` — Brand headline (Agrandir Tight Bold / Inter fallback).
- `Icon` — Line icon that inherits text colour. Set title to make it announced.
- `Input` — Labelled text field with hint / error states.
- `Logo` — The Michael Page wordmark logo.
- `Text` — Body copy (Inter), with muted, caption and quote variants.
