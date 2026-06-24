/**
 * Dune theme pointer: spring–damper body + mouth at hotspot.
 * States blend via **morphing geometry** (ellipse → ring + teeth + trail), not cross-fades.
 */

const ROOT_ID = "sandworm-cursor-root";

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixHex(a: string, b: string, t: number): string {
  const p = (h: string) => {
    const n = h.slice(1);
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const A = p(a);
  const B = p(b);
  const u = Math.max(0, Math.min(1, t));
  const r = Math.round(A[0] + (B[0] - A[0]) * u);
  const g = Math.round(A[1] + (B[1] - A[1]) * u);
  const bl = Math.round(A[2] + (B[2] - A[2]) * u);
  return `rgb(${r},${g},${bl})`;
}

/** Visual scale — base radii were ~6px and disappeared on the page */
const S = 2.85;

const SEGMENTS = 22;
const REST_LENGTH = 6;
const FIXED_DT = 1 / 120;
const MAX_STEPS = 10;

const K_CHAIN = 520;
const DAMP_CHAIN = 14;

/** Open state only — thick enough to read against bright bg */
const MAX_BODY_WIDTH = 11;
const MIN_BODY_WIDTH = 2;

/** Open maw: wider than tall (reads as mouth; a circle + black center reads as an eye) */
const OPEN_RX = 7.1 * S;
const OPEN_RY = 4.55 * S;
const OPEN_VOID_RX = 2.45 * S;
const OPEN_VOID_RY = 1.05 * S;
const OPEN_TOOTH_COUNT = 20;

const CLOSED_RX = 3.6 * S;
const CLOSED_RY = 2 * S;

const WORM = {
  hideDark: "#2a221c",
  hideMid: "#3d332b",
  hideLight: "#524840",
  ridge: "rgba(255, 255, 255, 0.12)",
  rimOuter: "#3a322c",
  rimInner: "#5a4e44",
  tooth: "rgba(252, 246, 236, 0.98)",
  toothShadow: "rgba(40, 28, 22, 0.35)",
  gum: "rgba(110, 72, 62, 0.88)",
  abyss: "#1a1411",
  lip: "#3d342e",
  lipHi: "rgba(255, 255, 255, 0.22)",
};

function isDuneTheme(): boolean {
  return document.documentElement.getAttribute("data-theme") === "dune";
}

function getRoot(): HTMLElement | null {
  return document.getElementById(ROOT_ID);
}

function setActive(active: boolean): void {
  document.documentElement.classList.toggle("sandworm-cursor-active", active);
  document.body.classList.toggle("sandworm-cursor-active", active);
}

/** Target under pointer, ignoring our overlay */
function elementUnderPointer(
  x: number,
  y: number,
  root: HTMLElement,
): Element | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (el === root || root.contains(el)) continue;
    return el;
  }
  return null;
}

/** Block-level giants with cursor:pointer are usually layout, not a precise hit target */
function isOversizedBlock(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  const vArea = window.innerWidth * window.innerHeight;
  if (r.width * r.height > vArea * 0.34) return true;
  if (r.width > window.innerWidth * 0.9 || r.height > window.innerHeight * 0.88)
    return true;
  return false;
}

function isElementInteractive(el: Element | null): boolean {
  if (!el) return false;

  if (el instanceof HTMLElement) {
    try {
      const c = window.getComputedStyle(el).cursor;
      if (c === "pointer" || c === "grab") {
        const block = ["DIV", "SECTION", "MAIN", "ARTICLE", "HEADER", "FOOTER"];
        if (block.includes(el.tagName) && isOversizedBlock(el)) {
          /* rely on semantic walk below */
        } else {
          return true;
        }
      }
    } catch {
      /* ignore */
    }
  }

  let node: Element | null = el;
  for (let d = 0; d < 14 && node; d++) {
    const tag = node.tagName;

    if (tag === "A") {
      const a = node as HTMLAnchorElement;
      if (a.href && !(a as HTMLElement).closest?.("[aria-disabled='true']")) {
        return true;
      }
    }
    if (tag === "BUTTON") {
      if (!(node as HTMLButtonElement).disabled) return true;
    }
    if (tag === "INPUT") {
      const inp = node as HTMLInputElement;
      if (inp.disabled || inp.type === "hidden") {
        node = node.parentElement;
        continue;
      }
      const t = inp.type;
      if (
        [
          "button",
          "submit",
          "reset",
          "checkbox",
          "radio",
          "file",
          "image",
        ].includes(t)
      ) {
        return true;
      }
      if (
        [
          "text",
          "search",
          "email",
          "url",
          "password",
          "number",
          "tel",
          "date",
          "time",
        ].includes(t)
      ) {
        return true;
      }
    }
    if (tag === "SELECT" && !(node as HTMLSelectElement).disabled) {
      return true;
    }
    if (tag === "TEXTAREA" && !(node as HTMLTextAreaElement).disabled) {
      return true;
    }
    if (tag === "LABEL" || tag === "SUMMARY") return true;

    const role = node.getAttribute("role");
    if (
      role === "button" ||
      role === "link" ||
      role === "tab" ||
      role === "menuitem" ||
      role === "option"
    ) {
      return true;
    }

    if (
      (node as HTMLElement).isContentEditable &&
      node.getAttribute("contenteditable") === "true"
    ) {
      return true;
    }

    node = node.parentElement;
  }
  return false;
}

/**
 * t ∈ [0,1]: morphs closed seam → **elliptical** maw (wide jaws), radial teeth, slit throat.
 */
function drawMouthMorphed(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number,
): void {
  const shapeT = t * t * (3 - 2 * t);
  const rx = lerp(CLOSED_RX, OPEN_RX, shapeT);
  const ry = lerp(CLOSED_RY, OPEN_RY, shapeT);
  const seamFade = (1 - shapeT) * (1 - shapeT);
  const ringAlpha = smoothstep(0.22, 0.72, shapeT);
  const toothAmt = smoothstep(0.35, 0.92, shapeT);
  const rm = Math.min(rx, ry);

  const holeRx = lerp(rm * 0.12, OPEN_VOID_RX + 1.15 * S, shapeT);
  const holeRy = lerp(rm * 0.08, OPEN_VOID_RY + 0.55 * S, shapeT);
  const voidRx = lerp(Math.max(2.2, 0.9 * S), OPEN_VOID_RX * 0.92, shapeT);
  const voidRy = lerp(Math.max(1.1, 0.55 * S), OPEN_VOID_RY * 0.88, shapeT);

  const gumPad = 0.42 * S;
  const outerEx = rx - 1.85;
  const outerEy = ry - 1.85;

  ctx.save();
  ctx.translate(cx, cy);

  const sb = 9 + 5 * shapeT;
  ctx.shadowColor = `rgba(0, 0, 0, ${0.32 + 0.12 * shapeT})`;
  ctx.shadowBlur = sb;
  ctx.shadowOffsetY = 2 + 1.5 * shapeT;

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = mixHex(WORM.lip, WORM.rimOuter, Math.pow(shapeT, 0.82));
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  if (ringAlpha > 0.02) {
    ctx.globalAlpha = ringAlpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx - 0.65, ry - 0.55, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, holeRx, holeRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = WORM.rimInner;
    ctx.fill("evenodd");
    ctx.globalAlpha = 1;
  }

  if (toothAmt > 0.03 && shapeT > 0.3) {
    ctx.globalAlpha = toothAmt;
    const innerEx = holeRx + gumPad;
    const innerEy = holeRy + gumPad;
    ctx.lineCap = "round";
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass === 0 ? WORM.toothShadow : WORM.tooth;
      ctx.lineWidth = pass === 0 ? 2.4 : 1.35 + 0.25 * shapeT;
      ctx.globalAlpha = toothAmt * (pass === 0 ? 0.4 : 1);
      for (let i = 0; i < OPEN_TOOTH_COUNT; i++) {
        const ang = (i / OPEN_TOOTH_COUNT) * Math.PI * 2 + 0.06;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        ctx.beginPath();
        ctx.moveTo(c * outerEx, s * outerEy);
        ctx.lineTo(c * innerEx, s * innerEy);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  if (shapeT > 0.38) {
    ctx.globalAlpha = smoothstep(0.38, 0.85, shapeT);
    ctx.strokeStyle = WORM.gum;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.ellipse(0, 0, holeRx + 0.25 * S, holeRy + 0.2 * S, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, voidRx);
  g.addColorStop(0, "#0f0c0a");
  g.addColorStop(0.55, WORM.abyss);
  g.addColorStop(1, "#241c18");
  ctx.beginPath();
  ctx.ellipse(0, 0, voidRx, voidRy, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  if (shapeT > 0.42) {
    ctx.strokeStyle = "rgba(55, 40, 34, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-voidRx * 0.88, 0);
    ctx.lineTo(voidRx * 0.88, 0);
    ctx.stroke();
  }

  if (seamFade > 0.04) {
    ctx.globalAlpha = seamFade;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.65, 0);
    ctx.quadraticCurveTo(0, ry * 0.28, rx * 0.65, 0);
    ctx.strokeStyle = "rgba(15, 12, 10, 0.92)";
    ctx.lineWidth = 1.35;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (shapeT < 0.55) {
    ctx.globalAlpha = 0.35 + 0.4 * (1 - shapeT);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx - 1.2, ry - 0.9, 0, 0, Math.PI * 2);
    ctx.strokeStyle = WORM.lipHi;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.34)";
  ctx.lineWidth = 1.15 + 0.2 * shapeT;
  ctx.stroke();

  ctx.restore();
}

function initReducedMotionDot(root: HTMLElement): () => void {
  const dot = document.createElement("div");
  dot.id = "sandworm-cursor-dot";
  dot.setAttribute("aria-hidden", "true");

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let targetOpen = 0;
  let morph = 0;
  let last = performance.now();
  let rafLoop = 0;

  const W_O = 30;
  const H_O = 19;
  const W_C = 22;
  const H_C = 12;

  function applyMorph(): void {
    const k = morph * morph * (3 - 2 * morph);
    const w = lerp(W_C, W_O, k);
    const h = lerp(H_C, H_O, k);
    const rad = k > 0.88 ? `${Math.min(w, h) / 2}px` : "999px";
    const bg = mixHex(WORM.lip, WORM.abyss, Math.pow(k, 0.75));
    const border = lerp(2, 0, k);
    const inset = lerp(0, 5, k);
    dot.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      `width:${w}px`,
      `height:${h}px`,
      `margin:${-h / 2}px 0 0 ${-w / 2}px`,
      `border-radius:${rad}`,
      `background:${bg}`,
      `box-shadow:0 2px 8px rgba(0,0,0,${0.28 + 0.12 * k}),0 0 0 ${border}px rgba(0,0,0,0.22), inset 0 0 0 ${inset}px ${k > 0.4 ? WORM.rimInner : "transparent"}`,
      "pointer-events:none",
      "z-index:2",
      "will-change:transform",
    ].join(";");
    dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  }

  function tick(now: number): void {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = targetOpen;
    const lambda = t > morph ? 15 : 9;
    morph += (t - morph) * (1 - Math.exp(-dt * lambda));
    if (Math.abs(morph - t) < 0.0008) morph = t;
    applyMorph();
    rafLoop = requestAnimationFrame(tick);
  }

  function onPointer(e: MouseEvent): void {
    pos.x = e.clientX;
    pos.y = e.clientY;
    const el = elementUnderPointer(pos.x, pos.y, root);
    targetOpen = isElementInteractive(el) ? 1 : 0;
  }

  last = performance.now();
  morph = 0;
  applyMorph();
  root.appendChild(dot);
  rafLoop = requestAnimationFrame(tick);

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("mousemove", onPointer, { passive: true });

  return () => {
    cancelAnimationFrame(rafLoop);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("mousemove", onPointer);
    dot.remove();
  };
}

export function initSandwormCursor(root: HTMLElement): () => void {
  let canvas: HTMLCanvasElement | null = null;
  let ctx2d: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let lastFrameTime = performance.now();
  let accum = 0;

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let hoverInteractive = false;
  /** Smoothed 0–1 toward interactive; drives morph + body coalescence */
  let mouthOpen = 0;

  const pos = new Float32Array(SEGMENTS * 2);
  const vel = new Float32Array(SEGMENTS * 2);
  const acc = new Float32Array(SEGMENTS * 2);

  for (let i = 0; i < SEGMENTS; i++) {
    pos[i * 2] = mouse.x - i * REST_LENGTH * 0.98;
    pos[i * 2 + 1] = mouse.y;
  }

  function resize(): void {
    if (!canvas || !ctx2d) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function step(dt: number): void {
    pos[0] = mouse.x;
    pos[1] = mouse.y;
    vel[0] = 0;
    vel[1] = 0;

    acc.fill(0);

    for (let i = 1; i < SEGMENTS; i++) {
      const ix = i * 2;
      const jx = (i - 1) * 2;
      const dx = pos[jx] - pos[ix];
      const dy = pos[jx + 1] - pos[ix + 1];
      const dist = Math.hypot(dx, dy) || 1e-6;
      const stretch = dist - REST_LENGTH;
      const fx = (K_CHAIN * stretch * dx) / dist;
      const fy = (K_CHAIN * stretch * dy) / dist;
      acc[ix] += fx;
      acc[ix + 1] += fy;
      if (jx !== 0) {
        acc[jx] -= fx;
        acc[jx + 1] -= fy;
      }
    }

    for (let i = 1; i < SEGMENTS; i++) {
      const ix = i * 2;
      acc[ix] -= DAMP_CHAIN * vel[ix];
      acc[ix + 1] -= DAMP_CHAIN * vel[ix + 1];
      vel[ix] += acc[ix] * dt;
      vel[ix + 1] += acc[ix + 1] * dt;
      pos[ix] += vel[ix] * dt;
      pos[ix + 1] += vel[ix + 1] * dt;
    }

    pos[0] = mouse.x;
    pos[1] = mouse.y;
    vel[0] = 0;
    vel[1] = 0;
  }

  function draw(): void {
    if (!ctx2d || !canvas) return;
    const ctx = ctx2d;
    ctx.globalCompositeOperation = "source-over";
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const hx = pos[0];
    const hy = pos[1];

    const bodyAmt = smoothstep(0.06, 0.92, mouthOpen);
    if (bodyAmt > 0.015) {
      const bx = pos[2] - pos[0];
      const by = pos[3] - pos[1];
      const bl = Math.hypot(bx, by) || 1e-6;
      const ubx = bx / bl;
      const uby = by / bl;
      const shapeT = mouthOpen * mouthOpen * (3 - 2 * mouthOpen);
      const neckCap = lerp(CLOSED_RX * 1.1, OPEN_RX + 3, shapeT);
      const neckDist = Math.min(bl * 0.92, neckCap);
      const nax = hx + ubx * neckDist;
      const nay = hy + uby * neckDist;

      ctx.save();
      ctx.globalAlpha = bodyAmt;

      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 9 * bodyAmt;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(nax, nay);
      for (let i = 2; i < SEGMENTS; i++) {
        ctx.lineTo(pos[i * 2], pos[i * 2 + 1]);
      }
      ctx.stroke();

      for (let i = 1; i < SEGMENTS - 1; i++) {
        const segT = i / (SEGMENTS - 2);
        const plate = 1 + Math.sin(i * 0.95) * 0.1;
        const weight = (1 - segT) * (1 - segT);
        const width =
          (MAX_BODY_WIDTH * weight + MIN_BODY_WIDTH * (1 - weight)) *
          plate *
          0.48 *
          bodyAmt;

        let x0 = pos[i * 2];
        let y0 = pos[i * 2 + 1];
        let x1 = pos[(i + 1) * 2];
        let y1 = pos[(i + 1) * 2 + 1];

        if (i === 1) {
          x0 = nax;
          y0 = nay;
        }

        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.hypot(dx, dy) || 1e-6;
        const px = (-dy / len) * width;
        const py = (dx / len) * width;

        const g = ctx.createLinearGradient(x0 - px, y0 - py, x0 + px, y0 + py);
        g.addColorStop(0, WORM.hideDark);
        g.addColorStop(0.5, WORM.hideMid);
        g.addColorStop(1, WORM.hideLight);

        ctx.beginPath();
        ctx.moveTo(x0 - px * 0.4, y0 - py * 0.4);
        ctx.lineTo(x1 - px * 0.36, y1 - py * 0.36);
        ctx.lineTo(x1 + px * 0.36, y1 + py * 0.36);
        ctx.lineTo(x0 + px * 0.4, y0 + py * 0.4);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.strokeStyle = WORM.ridge;
      ctx.lineWidth = 1.1 * bodyAmt;
      ctx.beginPath();
      ctx.moveTo(nax, nay);
      for (let i = 2; i < SEGMENTS; i++) {
        ctx.lineTo(pos[i * 2], pos[i * 2 + 1]);
      }
      ctx.stroke();

      ctx.restore();
    }

    drawMouthMorphed(ctx, hx, hy, mouthOpen);
  }

  function onPointer(e: MouseEvent): void {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    const t = elementUnderPointer(mouse.x, mouse.y, root);
    hoverInteractive = isElementInteractive(t);
  }

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;

    const target = hoverInteractive ? 1 : 0;
    const lambda = target > mouthOpen ? 15 : 9;
    mouthOpen += (target - mouthOpen) * (1 - Math.exp(-dt * lambda));
    if (Math.abs(mouthOpen - target) < 0.0008) mouthOpen = target;

    accum += dt;
    let steps = 0;
    while (accum >= FIXED_DT && steps < MAX_STEPS) {
      step(FIXED_DT);
      accum -= FIXED_DT;
      steps++;
    }
    draw();
  }

  canvas = document.createElement("canvas");
  canvas.id = "sandworm-cursor-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    "width:100%",
    "height:100%",
    "pointer-events:none",
    "opacity:1",
    "visibility:visible",
    "touch-action:none",
    "display:block",
  ].join(";");

  ctx2d = canvas.getContext("2d", { alpha: true });

  if (!ctx2d) {
    canvas.remove();
    return initReducedMotionDot(root);
  }

  root.appendChild(canvas);

  resize();
  hoverInteractive = isElementInteractive(
    elementUnderPointer(mouse.x, mouse.y, root),
  );
  mouthOpen = hoverInteractive ? 1 : 0;
  draw();
  lastFrameTime = performance.now();

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("mousemove", onPointer, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("mousemove", onPointer);
    window.removeEventListener("resize", resize);
    canvas?.remove();
    canvas = null;
    ctx2d = null;
  };
}

export function mountSandwormCursorController(): () => void {
  let innerDispose: (() => void) | null = null;

  const sync = (): void => {
    innerDispose?.();
    innerDispose = null;
    setActive(false);

    if (!isDuneTheme()) return;

    const root = getRoot();
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setActive(true);
    innerDispose = reduced
      ? initReducedMotionDot(root)
      : initSandwormCursor(root);
  };

  sync();

  const mo = new MutationObserver(sync);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const onReduce = (): void => sync();
  const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
  mqR.addEventListener("change", onReduce);

  return () => {
    mo.disconnect();
    mqR.removeEventListener("change", onReduce);
    innerDispose?.();
    innerDispose = null;
    setActive(false);
  };
}
