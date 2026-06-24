/**
 * Keyboard Easter eggs (classic cheat sequence + typed phrases) and a one-time
 * Arcade theme console banner. Homages intentionally avoid Nintendo IP; see
 * CREDITS.md for trademark / inspiration notes.
 */

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

/** Longest-first so shorter words don’t steal matches (e.g. glhf vs gg). */
const PHRASE_TOASTS: readonly { pattern: string; message: string }[] = [
  { pattern: "onemoreturn", message: "One more turn… then sleep. Promise." },
  { pattern: "lootfilter", message: "Loot filter mindset: rares only." },
  { pattern: "techtree", message: "Still researching — queue looks civil." },
  { pattern: "forcebuy", message: "Eco’s tight? Next round decides." },
  { pattern: "rushb", message: "Your defaults are your business." },
  { pattern: "ggwp", message: "Good game, well played." },
  { pattern: "glhf", message: "Good luck — have fun." },
].sort((a, b) => b.pattern.length - a.pattern.length);

const CONSOLE_SESSION_KEY = "arcade-console-banner";
const CHEAT_ATTR = "data-arcade-cheat";
const CHEAT_KONAMI_VALUE = "konami";
const KONAMI_CLEAR_MS = 30_000;
const PHRASE_BUFFER_MAX = 16;
const PHRASE_RESET_MS = 950;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function keyMatchesKonamiStep(key: string, expected: string): boolean {
  if (expected.startsWith("Arrow")) return key === expected;
  return key.toLowerCase() === expected;
}

function showToast(message: string): void {
  const el = document.getElementById("arcade-toast");
  if (!el) return;
  el.textContent = message;
  el.removeAttribute("hidden");
  window.clearTimeout(Number(el.dataset.hideTimer));
  const t = window.setTimeout(() => {
    el.setAttribute("hidden", "");
    el.textContent = "";
    delete el.dataset.hideTimer;
  }, 4200);
  el.dataset.hideTimer = String(t);
}

let konamiIndex = 0;
let phraseBuffer = "";
let phraseTimer: number | null = null;
let konamiClearTimer: number | null = null;

function tryPhraseToasts(): void {
  for (const { pattern, message } of PHRASE_TOASTS) {
    if (phraseBuffer.includes(pattern)) {
      phraseBuffer = "";
      showToast(message);
      return;
    }
  }
}

function onKeyDown(e: KeyboardEvent): void {
  if (isTypingTarget(e.target)) return;

  const key = e.key;

  /* Classic ↑↑↓↓←→←→BA sequence (popularized by Konami titles — not Nintendo). */
  const expected = KONAMI_SEQUENCE[konamiIndex];
  if (expected !== undefined && keyMatchesKonamiStep(key, expected)) {
    konamiIndex += 1;
    if (konamiIndex >= KONAMI_SEQUENCE.length) {
      konamiIndex = 0;
      document.documentElement.setAttribute(CHEAT_ATTR, CHEAT_KONAMI_VALUE);
      showToast("CLASSIC CODE — bonus shimmer");
      if (konamiClearTimer !== null) window.clearTimeout(konamiClearTimer);
      konamiClearTimer = window.setTimeout(() => {
        document.documentElement.removeAttribute(CHEAT_ATTR);
        konamiClearTimer = null;
      }, KONAMI_CLEAR_MS);
    }
  } else {
    const first = KONAMI_SEQUENCE[0];
    konamiIndex =
      first !== undefined && keyMatchesKonamiStep(key, first) ? 1 : 0;
  }

  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    phraseBuffer = (phraseBuffer + key.toLowerCase()).slice(
      -PHRASE_BUFFER_MAX,
    );
    tryPhraseToasts();
    if (phraseTimer !== null) window.clearTimeout(phraseTimer);
    phraseTimer = window.setTimeout(() => {
      phraseBuffer = "";
      phraseTimer = null;
    }, PHRASE_RESET_MS);
  }
}

const ARCADE_BANNER = `
  █████╗ ██████╗  ██████╗ █████╗ ██████╗ ███████╗
 ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝
 ███████║██████╔╝██║     ███████║██║  ██║█████╗
 ██╔══██║██╔══██╗██║     ██╔══██║██║  ██║██╔══╝
 ██║  ██║██║  ██║╚██████╗██║  ██║██████╔╝███████╗
 ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═════╝ ╚══════╝
`;

function logArcadeConsoleBannerOnce(): void {
  if (document.documentElement.getAttribute("data-theme") !== "arcade") return;
  try {
    if (sessionStorage.getItem(CONSOLE_SESSION_KEY) === "1") return;
    sessionStorage.setItem(CONSOLE_SESSION_KEY, "1");
  } catch {
    return;
  }
  console.log(
    "%c" + ARCADE_BANNER,
    "font-family: monospace; color: #34d399; line-height: 1.2;",
  );
  console.log(
    "%c ARPG grinds · tac FPS banter · one-more-turn strategy — unofficial homage; not endorsed.",
    "color: #94a3b8; font-size: 11px;",
  );
  console.log(
    "%c Trademarks belong to their owners. See CREDITS.md in the repo.",
    "color: #64748b; font-size: 11px;",
  );
}

function onThemeChange(): void {
  logArcadeConsoleBannerOnce();
}

declare global {
  interface Window {
    __arcadeEasterEggsInit?: boolean;
  }
}

export function initArcadeEasterEggs(): void {
  if (typeof window !== "undefined" && window.__arcadeEasterEggsInit) return;
  if (typeof window !== "undefined") window.__arcadeEasterEggsInit = true;

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("theme-change", onThemeChange);
  logArcadeConsoleBannerOnce();
}
