# Credits, attributions, and third-party notices

This file documents open-source dependencies, fonts, and how this site references game culture. **Nothing here is legal advice.**

## Open-source software

| Project | Use | License (see package / upstream) |
|--------|-----|----------------------------------|
| [Astro](https://astro.build/) | Static site generator | MIT |
| [Tailwind CSS](https://tailwindcss.com/) | Styling | MIT |
| [Three.js](https://threejs.org/) | Background particle field | MIT |
| [TypeScript](https://www.typescriptlang.org/) | Language | Apache-2.0 |

Exact versions are pinned in [`package.json`](package.json). Full license texts live in `node_modules/` after `npm install`.

## Fonts (served from Google Fonts)

| Font | Role | Source |
|------|------|--------|
| JetBrains Mono | Body / UI monospace | [JetBrains](https://www.jetbrains.com/lp/mono/) (SIL Open Font License 1.1) |
| Marcellus | Heading (Dune theme) | [Google Fonts](https://fonts.google.com/specimen/Marcellus) (Open Font License) |
| Silkscreen | Heading (Arcade theme) | [Google Fonts — Silkscreen](https://fonts.google.com/specimen/Silkscreen) (Open Font License) |

## Brand assets

| Asset | Use | Source / notice |
|-------|-----|-----------------|
| Google Cloud logo | Certification badge icon | [VectorLogoZone](https://www.vectorlogo.zone/logos/google_cloud/index.html); Google Cloud and related marks are trademarks of Google LLC. |
| Dun & Bradstreet logo | Experience card logo | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dun_and_Bradstreet_wordmark.svg), source listed as dnb.com; Dun & Bradstreet and related marks are trademarks of their owner. |
| BAMM Tickets logo | Experience card logo | [BAMM Tickets](https://bammtickets.com/home/); BAMM Tickets and related marks are trademarks of their owner. |
| Georgia Tech logo | Education card logo | [Georgia Tech Brand Guide](https://brand.gatech.edu/brand-assets/logos); Georgia Tech and related marks are trademarks of their owner. |
| University of North Florida logo | Education card logo | [UNF Brand Center](https://www.unf.edu/brand/logo.html); UNF and related marks are trademarks of their owner. |

## Arcade theme and Easter eggs (homage, not endorsement)

The **Arcade** theme (`data-theme="arcade"`) is original CSS and typography: CRT-style atmosphere, neon accents, and HUD-style scanlines. It does **not** include art, music, or executable content from any commercial game.

**Arcade mouse cursors** (`public/cursors/arcade-default.svg`, `arcade-pointer.svg`): shapes are a **pixellated** treatment of the [Material Design Icons](https://pictogrammers.com/library/mdi/) glyphs *cursor-default* and *cursor-pointer* (Apache License 2.0)—rasterized to 32×32, then outlined in black with a white fill to echo standard UI pointers.

Keyboard Easter eggs (e.g. typed phrases, classic cheat-code sequence) are **original UI responses** meant as a nod to common online-game culture. They intentionally **exclude** Nintendo-owned franchises (e.g. Pokémon, Mario, Zelda) from copy and prompts.

### Cultural / mechanic references (unofficial)

The following are **not** sponsors or licensors of this site. Names below identify inspiration only:

| Inspiration (genre / title family) | Rights holder (common) | Notes |
|-----------------------------------|-------------------------|--------|
| Tactical / competitive FPS culture (matchmaking, rounds, economy jokes) | [Valve Corporation](https://www.valvesoftware.com/) (*Counter-Strike* series) | Trademarks include e.g. Counter-Strike, CS2. |
| Action RPG / “one more map” grind culture | [Grinding Gear Games](https://www.grindinggear.com/) (*Path of Exile*) | *Path of Exile* is a trademark of GGG. |
| 4X / technology and civic “research queue” jokes | [Take-Two Interactive Software, Inc.](https://www.take2games.com/) / [Firaxis Games](https://firaxis.com/) (*Sid Meier’s Civilization* series) | *Civilization* and related marks are property of their owners. |
| “Konami code” (↑↑↓↓←→←→BA) cheat sequence | [Konami Group Corporation](https://www.konami.com/) (popularized with *Contra* and many others) | Sequence is widely used as an Easter egg in software; this site implements an independent toast/visual only—**not** Nintendo-related. |

**Disclaimer:** This is an independent personal portfolio. It is **not** affiliated with, endorsed by, or sponsored by Valve, Grinding Gear Games, Take-Two, Firaxis, Konami, or any game publisher. All trademarks are the property of their respective owners.

If a rights holder prefers a specific credit line changed, open an issue or contact the site owner.

## Repository documentation

- Contributor-oriented overview: [`AGENTS.md`](AGENTS.md)
- This file: [`CREDITS.md`](CREDITS.md)
