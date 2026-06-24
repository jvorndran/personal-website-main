const STORAGE_KEY = "theme";
const STATES = ["auto", "dark", "light", "dune", "arcade"] as const;
type Theme = (typeof STATES)[number];

export { STATES, type Theme };

export function getStoredTheme(): Theme {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val && STATES.includes(val as Theme)) return val as Theme;
  } catch {
    // localStorage unavailable
  }
  return "auto";
}

const DARK_THEMES: ReadonlySet<string> = new Set(["dark", "arcade"]);

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);

  // Set color-scheme so browser chrome (scrollbars, inputs) matches the theme
  const isDark =
    DARK_THEMES.has(theme) ||
    (theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable
  }
  window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme } }));
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
}

export function initThemeToggle(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  // Apply stored theme on init
  const current = getStoredTheme();
  applyTheme(current);

  // Sync when system preference changes (for auto mode)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getStoredTheme() === "auto") {
        applyTheme("auto");
      }
    });
}
