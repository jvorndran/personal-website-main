# Repository Guidelines

## Project Structure & Module Organization

- **Framework**: Astro v5 + Tailwind CSS v4 + Three.js — static site builder with content collections.
- **Entrypoint**: `src/pages/index.astro` composes all sections into a single-page scrolling portfolio.
- **Layouts**: `src/layouts/BaseLayout.astro` (main shell), `src/layouts/BlogPostLayout.astro` (article pages).
- **Components**: `src/components/` — organized into `layout/`, `ui/`, `sections/`, `three/`, `boot/`.
- **Styles**: `src/styles/global.css` (Tailwind v4 @theme tokens), `animations.css`, `hud.css`, `arcade.css` (Arcade theme overrides).
- **Content**: `src/content/` — Astro content collections for `projects/` (Markdown), `blog/` (MDX), plus `experience.json` and `skills.json`.
- **Scripts**: `src/scripts/` — TypeScript modules for theme toggle, boot sequence, particle network, HUD nav, scroll reveal, `arcade-easter-eggs.ts` (keyboard Easter eggs when Arcade UI is present).
- **Static assets**: `public/` — images, CNAME, robots.txt, site.webmanifest. Deployed as-is to `dist/`.
- **CI/CD**: `.github/workflows/pages.yml` builds + deploys; `quality.yml` runs lint, spellcheck, typecheck.

## Build, Test, and Development Commands

- `npm run dev` — local Astro dev server with HMR.
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview built site locally.
- `npm run check` — Astro type checking.
- `codespell --ignore-words-list adn,aman,thanvi,doj,ustp,cisa,nasa,umd,sdls,cfs,nos3,ccds,ngn,scan,ltsc,eoust,govt,config,astro,oklch --skip .git,node_modules,dist,.astro` — spellcheck.

## Coding Style & Naming Conventions

- Two-space indentation; Astro component naming in PascalCase.
- Tailwind utility classes preferred; custom CSS in `src/styles/` for animations/HUD effects.
- Section-based accent color system via `--section-accent` CSS custom property.
- Semantic HTML (`section`, `main`, `nav`) with descriptive `aria-*` labels.
- File names lowercase with hyphens; components in PascalCase.

## Testing Guidelines

- Run `npm run build` + `npm run check` before committing.
- Manual checks: light/dark/auto themes, responsive widths, `prefers-reduced-motion`.
- Performance budget: <500KB total, <3s LCP, Three.js gzipped ~117KB.
- Accessibility: skip links, focus outlines, keyboard nav, ARIA labels.

## Commit & Pull Request Guidelines

- Conventional Commits: `feat|fix|refactor|docs|chore|style|perf|test` with optional scope.
- PRs: describe user-facing impact, include before/after screenshots for visual changes.
- Wait for GitHub Actions green before merge.

## Key Architecture Decisions

- **Tailwind v4**: CSS-first config via `@theme` blocks in `global.css`. No `tailwind.config.js`.
- **Section accents**: Each section sets `--section-accent` / `--section-glow` CSS vars; child components reference them generically.
- **Three.js**: Dynamic-imported after DOMContentLoaded, gated on `!prefers-reduced-motion`. Particle colors interpolate based on scroll position.
- **Boot sequence**: Plays once per session (sessionStorage gate), respects reduced-motion.
- **Theme**: Multi-option `data-theme` on `<html>` (`auto`, `dark`, `light`, `dune`, `arcade`). FOUC prevention inline script in `<head>`.
- **Credits / third-party**: See [`CREDITS.md`](CREDITS.md) for fonts, libraries, and game-homage disclaimers.
