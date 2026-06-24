interface NavSection {
  id: string;
  label: string;
  accent: string;
}

const SECTIONS: NavSection[] = [
  { id: 'hero', label: 'Home', accent: 'var(--color-accent-hero)' },
  { id: 'projects', label: 'Projects', accent: 'var(--color-accent-projects)' },
  { id: 'experience', label: 'Experience', accent: 'var(--color-accent-experience)' },
  { id: 'skills', label: 'Skills', accent: 'var(--color-accent-skills)' },
];

export function initHudNav(): void {
  const nav = document.getElementById('hud-nav');
  if (!nav) return;

  const dots = nav.querySelectorAll<HTMLElement>('[data-section]');
  const sectionEls = SECTIONS.map((s) => document.getElementById(s.id)).filter(
    Boolean,
  ) as HTMLElement[];

  if (sectionEls.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const section = SECTIONS.find((s) => s.id === id);
          if (!section) return;

          dots.forEach((dot) => {
            const isActive = dot.dataset.section === id;
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            if (isActive) {
              dot.style.setProperty('--dot-color', section.accent);
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
  );

  sectionEls.forEach((el) => observer.observe(el));

  // Smooth scroll on click
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.section || '');
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
