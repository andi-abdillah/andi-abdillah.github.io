# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview production build locally
npm run lint       # run ESLint
npm run deploy     # build then publish to GitHub Pages (gh-pages -d dist)
```

No test suite is configured.

## Architecture

Single-page portfolio site built with React 18 + Vite. All sections are rendered directly in [src/main.jsx](src/main.jsx) inside a `HashRouter` (required for GitHub Pages routing). There are no routes — everything is one scrollable page with anchor-link navigation.

**Section order** (top to bottom): `Navbar → Home → Services → Portfolio → Abilities → Certificate → Contact → Footer`

Each section lives in [src/sections/](src/sections/) and is a standalone component with its own `id` attribute for anchor scrolling.

### Visual concept — "devices & hardware"

The site frames its content through real-device metaphors. Keep this language consistent when extending the UI:

- **Home** ([src/sections/Home.jsx](src/sections/Home.jsx)) — the four most recent portfolio screenshots are rendered as **laptop mockups** fanned out like a hand of cards (symmetric `rotate` values, negative `marginRight` overlap, `transformOrigin: "50% 90%"`). They have a continuous floating animation driven by `requestAnimationFrame` + a sine wave (each card offset by a `phase`), and a `drop-shadow` filter. The scale-in entrance replays on scroll via an `IntersectionObserver` (`cardsInView`). On mobile they wrap to a 2×2 grid; desktop keeps them in one row. The `CARDS` array at the top of the file must be kept in sync with the four newest entries in `portfolioData.json`.
- **Abilities** ([src/sections/Abilities.jsx](src/sections/Abilities.jsx)) — each skill category is a card styled as an **iPhone**: thick black bezel (`border`), rounded `2.5rem` corners, a faux status bar (9:41 + wifi/battery SVGs), and a per-card gradient "wallpaper". Each card carries its own `gradient` + `textColor` in the `cards` array. Cards have a fixed `min-h` so they don't shrink on mobile, and lift + rotate-ring on hover.

When adding new visual sections, prefer extending this device language rather than introducing unrelated styles.

### Data

Static content for the Portfolio and Certificate sections lives in JSON files under [src/data/](src/data/):
- [portfolioData.json](src/data/portfolioData.json) — project entries (`name`, `description`, `image`, `year`, `link`, optional `linkNote`). An empty `link` opens a modal instead of a URL; the `linkNote` field (`"localhost"` or `"private"`) selects which message the modal shows (see `LINK_NOTE_CONTENT` in [Portfolio.jsx](src/sections/Portfolio.jsx)).
- [certificatesData.json](src/data/certificatesData.json) — certificate entries (`name`, `organization`, `logo`, `url`).

Images for both are resolved at build time using Vite's `import.meta.glob`:
```js
const images = import.meta.glob("../assets/portfolio/*", { eager: true });
// usage: images[`../assets/portfolio/${item.image}`]?.default
```

Add new portfolio images to [src/assets/portfolio/](src/assets/portfolio/) and certificate logos to [src/assets/certificates/](src/assets/certificates/).

### Styling

Tailwind CSS with two custom theme tokens defined in [tailwind.config.js](tailwind.config.js):
- `primary` → `#741ce8` (purple)
- `secondary` → `#ffcb05` (yellow)

Two fonts only — keep new UI within these:
- `font-inter` → **Inter**, self-hosted via `@fontsource/inter` (imported in [src/main.jsx](src/main.jsx)), applied globally on the root div. Do NOT use Google Fonts for Inter — it was removed to eliminate render-blocking external requests.
- `font-futura` → **FuturaNowHeadline**, self-hosted in [public/fonts/](public/fonts/) via an `@font-face` in [src/index.css](src/index.css); used for headings and uppercase labels. The font file is preloaded in [index.html](index.html) via `<link rel="preload">` to reduce critical path latency.

Device-themed gradients in the Abilities cards should stay within the purple/yellow brand palette to avoid clashing with the rest of the site.

Prettier is configured with `prettier-plugin-tailwindcss` ([.prettierrc](.prettierrc)), which auto-sorts Tailwind class names on save.

### Contact Form

[src/sections/Contact.jsx](src/sections/Contact.jsx) uses EmailJS (`@emailjs/browser`) to send emails without a backend. Credentials are stored in `.env.local` and accessed via `import.meta.env.VITE_EMAILJS_*`.

### Shared Components

- `Modal` — wraps Headless UI `Dialog` with transition animations; accepts `show`, `onClose`, `maxWidth`, `closeable`.
- `TextInput` / `TextArea` — controlled inputs with a `hasError` prop that switches the focus ring to red.
- `InputLabel` / `InputError` — simple label and error message display components.

### Deployment

The site is deployed on **Vercel** at `https://www.aminabdillah.com/`. The canonical URL is set in [index.html](index.html) via `<link rel="canonical">`. Do NOT use `npm run deploy` (that pushes to GitHub Pages via `gh-pages`, which is a separate legacy deployment). Just push to `main` — Vercel auto-deploys.

## Performance & Image Standards

### Image pipeline — always follow this when adding images

**Format:** All images must be **WebP**. Never commit PNG, JPG, or JFIF to `src/assets/`. Convert using `sharp` (already a dev dependency):

```js
const sharp = require('sharp');
// Portfolio screenshots
sharp('input.png').resize(800, 460, { fit: 'inside' }).webp({ quality: 82 }).toFile('output.webp');
// Certificate logos (displayed at 40px, 3× retina headroom)
sharp('logo.png').resize(120, 120, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile('logo.webp');
// Navbar logo (displayed at 24px)
sharp('logo.png').resize(48, 48, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile('logo.webp');
```

**Target sizes:**
| Location | Displayed size | Max output size |
|---|---|---|
| Portfolio screenshots ([src/assets/portfolio/](src/assets/portfolio/)) | ~664px wide | 800×460px |
| Certificate logos ([src/assets/certificates/](src/assets/certificates/)) | 40px (h-10 w-10) | 120×120px |
| Navbar logo | 24px (h-6) | 48×48px |

**After converting:** delete the original file, update the filename in `portfolioData.json` or `certificatesData.json` to use `.webp`.

### Image attributes (every `<img>`)

- Always set explicit `width` and `height` attributes matching the file's natural aspect ratio (e.g. portfolio screenshots `width="800" height="460"`, certificate logos `width="40" height="40"`). This reserves layout space and prevents CLS. Pair with `w-auto`/`h-auto` in CSS so the visual size stays responsive.
- Logos that are NOT square must use `object-contain` so they are not stretched when placed in a square box (e.g. certificate logos in `h-10 w-10`).

### Lazy loading

All images below the fold must have `loading="lazy"`. Images in the initial viewport (Home section laptop cards) must NOT have `loading="lazy"` — they are critical for LCP.

### Bundle & asset hygiene

- **No unused files** in `public/` or `src/assets/` — everything in `public/` ships verbatim to every visitor. Before committing, confirm new assets are actually referenced.
- **Fonts:** Inter is imported latin-subset only (`@fontsource/inter/latin-400.css` etc. in [src/main.jsx](src/main.jsx)), NOT the full `@fontsource/inter/400.css` which ships ~28 unused Cyrillic/Greek/Vietnamese files. The site is English/Indonesian (Latin only).
- **Favicon/icons** are generated from `src/assets/logo.png` source and kept small. `favicon.ico` must stay under ~15KB (use `png-to-ico` from 32+48 PNGs). Also generate `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` into `public/`, referenced by [index.html](index.html) and [public/site.webmanifest](public/site.webmanifest). Never ship a multi-hundred-KB `.ico`.

### Game components

All game components in [src/sections/games/](src/sections/games/) are loaded with `React.lazy()` + `Suspense` in [src/sections/games/index.jsx](src/sections/games/index.jsx). Keep this pattern when adding new games — never import them eagerly.

### Animation performance

- The Home section parallax tilt reads `getBoundingClientRect()` from a cached `cardsRectRef` (updated only on resize), not on every `mousemove`. Keep this pattern for any new animation that needs element bounds.
- Continuous `requestAnimationFrame` loops must pause when their section is offscreen. The Home floating/tilt loop is gated on `cardsInView` (from an `IntersectionObserver`) so it stops burning CPU/battery when scrolled away. Any new rAF-driven animation must do the same.

## SEO Standards

### Meta tags

[index.html](index.html) contains: `<meta name="description">`, OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale`, `og:image:width/height/alt`), Twitter Card, `<meta name="robots" content="index, follow, max-image-preview:large">`, and `<link rel="canonical" href="https://www.aminabdillah.com/">`. The canonical URL is critical — do not remove it. It tells Google that `aminabdillah.com` is the authoritative URL, not the Vercel preview URL.

`og:image` points to `/og-image.png` (1200×630), a branded card mirroring the hero (purple gradient + "AMIN ABDILLAH" + role + tech stack). Regenerate it with `sharp` from an SVG if the branding changes — keep it exactly 1200×630.

### Structured data & crawl files

- [index.html](index.html) contains a JSON-LD `@graph` with linked `Person`, `WebSite`, and `ProfilePage` schemas (tied by `@id`). The `Person` node carries name, jobTitle, location, `knowsAbout`, and `sameAs` (LinkedIn + GitHub). This builds the "Amin Abdillah" entity for Google and is the main lever for ranking the real domain above the Vercel URL. Keep `sameAs` and contact details in sync with the actual links.
- [public/sitemap.xml](public/sitemap.xml) lists the single root URL (hash routes are not separate URLs). [public/robots.txt](public/robots.txt) references it. Keep both present.

### Heading hierarchy

Every section heading must follow a sequential hierarchy. `<h1>` is used only once — in the Home section for "AMIN ABDILLAH". All other section headings use `<h2>`. Sub-headings within sections use `<h3>`. Never skip levels (h1 → h3 without h2).

Current mapping:
- Home: `h1` ("AMIN ABDILLAH")
- Services, Portfolio, Abilities, Certificate, Contact, Mini Games: `h2`
- Service card titles, project names, game titles: `h3`

### Landmarks

The page uses semantic HTML landmarks:
- `<main>` wraps all sections except Navbar and Footer (set in [src/main.jsx](src/main.jsx))
- `<footer>` is used for the Footer section
- All social icon links have `aria-label`

## Accessibility Standards

- All interactive elements must have a visible label or `aria-label`. Icon-only buttons and links must have `aria-label`.
- Game action buttons (catch bug, close tab, answer trivia) must have `aria-label` describing the action.
- Images must have meaningful `alt` text. Decorative images use `aria-hidden="true"`.
- Avoid `text-white/40` or lower opacity on colored backgrounds — contrast ratio falls below the 4.5:1 WCAG minimum. Minimum safe opacity on `bg-primary` (#741ce8) is approximately `text-white/70`.

## Writing Standards

All user-visible text in this project (UI copy, descriptions, chat messages, game content, labels) must follow these rules. These apply to every string that appears on screen — not code comments or variable names.

**Forbidden characters and patterns:**
- `—` (em dash) — use a comma, period, or rewrite the sentence instead
- `–` (en dash) — same rule
- `…` (ellipsis character) — use `...` if needed, or rewrite to avoid trailing off
- `"` `"` `'` `'` (curly/smart quotes) — use straight quotes `"` and `'` only
- Excessive `!` — one exclamation mark maximum per sentence, and only when genuinely needed
- Filler openers like "Certainly!", "Absolutely!", "Great question!", "Of course!" — never use these in UI copy
- Hedging phrases like "This might be...", "Perhaps consider...", "It's worth noting that..." — cut them
- Redundant affirmations like "Feel free to..." — just say what the thing does

**Tone:**
- Direct and clear. Say what you mean without softening filler.
- No AI-typical overly polished phrasing. Write like a person, not a press release.
- Short sentences preferred over long ones joined by em dashes or semicolons.
