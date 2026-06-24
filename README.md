# Jacob Vorndran Personal Site

Static portfolio built with [Astro](https://astro.build/) v5, [Tailwind CSS](https://tailwindcss.com/) v4, and [Three.js](https://threejs.org/) for an optional background. The homepage is a single scrolling portfolio for Jacob Vorndran's software engineering work, deployed to GitHub Pages.

## Quick Start

```bash
npm ci
npm run dev
```

Other scripts: `npm run build` (output in `dist/`), `npm run preview`, `npm run check`. See [`AGENTS.md`](AGENTS.md) for CI, spellcheck, and pre-commit expectations.

## Repository Layout

| Path | Purpose |
|------|---------|
| [`src/pages/`](src/pages/) | Routes: [`index.astro`](src/pages/index.astro), [`404.astro`](src/pages/404.astro) |
| [`src/components/`](src/components/) | Layout, sections, UI, Three.js |
| [`src/content/`](src/content/) | Project collection plus [`experience.json`](src/content/experience.json) and [`skills.json`](src/content/skills.json) |
| [`src/styles/`](src/styles/) | Global Tailwind theme tokens and section styles |
| [`public/`](public/) | Static assets copied to the deployed site root (`robots.txt`, `site.webmanifest`, images under `public/images/`) |

## Editing Content

- **Projects**: Markdown under [`src/content/projects/`](src/content/projects/).
- **Experience and skills**: JSON in [`src/content/`](src/content/).
- **Hero and section copy**: Astro components under [`src/components/sections/`](src/components/sections/).
- **Profile photo**: add `public/images/profile.jpg` and wire it back into the hero if a current headshot is available.

## Deployment

Pushes to `main` (or manual [`workflow_dispatch`](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow)) run [`.github/workflows/pages.yml`](.github/workflows/pages.yml): `npm ci`, `npm run build`, then deploy the `dist` artifact to GitHub Pages.

The production project URL is `https://jvorndran.github.io/personal-website-main/`. Astro is configured with `site: https://jvorndran.github.io` and `base: /personal-website-main`.

## Accessibility, Performance, And Privacy

Semantic HTML, keyboard navigation, theme and motion preferences are part of the design. Performance and manual test notes live in [`AGENTS.md`](AGENTS.md). There are no analytics trackers or cookies; the site loads webfonts from Google Fonts (JetBrains Mono, Sora, Marcellus, Silkscreen; see [`src/components/layout/BaseHead.astro`](src/components/layout/BaseHead.astro)).

## Credits And Contributing

Third-party licenses, font attribution, and game-culture homage disclaimers are in [`CREDITS.md`](CREDITS.md). Contributor workflow and tooling are in [`AGENTS.md`](AGENTS.md).
