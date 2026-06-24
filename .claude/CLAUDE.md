# personal-website

Astro 5 static site with MDX content, Tailwind 4, and Three.js.

## Build & Test

```bash
npm run dev          # Astro dev server
npm run build        # Static build
npm run preview      # Local preview of build
npm run check        # Astro type check
```

## Stack

- Framework: Astro 5 (static SSG + MDX)
- Styling: Tailwind CSS 4
- 3D: Three.js
- Content: MDX pages/posts
- Package manager: npm

## Conventions

- Blog posts as MDX in content directory
- Astro components for layout, MDX for content
- Tailwind for all styling; use CSS variables for theming
- Three.js for interactive 3D elements
- Static output; no server runtime
