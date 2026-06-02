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
- `font-inter` → **Inter** (loaded via Google Fonts in [index.html](index.html)), applied globally on the root div in [main.jsx](src/main.jsx) so it is the default body font.
- `font-futura` → **FuturaNowHeadline**, self-hosted in [public/fonts/](public/fonts/) via an `@font-face` in [src/index.css](src/index.css); used for headings and uppercase labels.

Device-themed gradients in the Abilities cards should stay within the purple/yellow brand palette to avoid clashing with the rest of the site.

Prettier is configured with `prettier-plugin-tailwindcss` ([.prettierrc](.prettierrc)), which auto-sorts Tailwind class names on save.

### Contact Form

[src/sections/Contact.jsx](src/sections/Contact.jsx) uses Formik + Yup for validation and EmailJS (`@emailjs/browser`) to send emails without a backend. The EmailJS service ID, template ID, and public key are hardcoded in that file.

### Shared Components

- `Modal` — wraps Headless UI `Dialog` with transition animations; accepts `show`, `onClose`, `maxWidth`, `closeable`.
- `TextInput` / `TextArea` — controlled inputs with a `hasError` prop that switches the focus ring to red.
- `InputLabel` / `InputError` — simple label and error message display components.

### Deployment

Deploys to GitHub Pages under `https://andi-abdillah.github.io/` via the `gh-pages` package. The `homepage` field in [package.json](package.json) must match the deployed URL.
