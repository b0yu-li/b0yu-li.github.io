/** Shared cover render engine (browser canvas + Node @napi-rs/canvas). */

/** Design + export size (OG / Chirpy header ratio). */
export const SCALE = 1;
export const W = 1200 * SCALE;
export const H = 630 * SCALE;

/** JPEG quality 0–100 (CLI) / 0–1 (browser). Max quality to limit banding on flats. */
export const JPEG_QUALITY = 100;

export const PALETTES = {
  violet: {
    top: "#0a0612",
    mid: "#2a1048",
    accent: "#c44dff",
    glow: "#ff2bd6",
    hill: ["#1a0a2e", "#2d1450", "#4a2080", "#6b3aad"],
    title: "#ffffff",
    subtitle: "#e8b8ff",
  },
  "indigo-lime": {
    top: "#3d2a6b",
    mid: "#2a1a4a",
    accent: "#b8f000",
    glow: "#7a5cff",
    hill: ["#1a1030", "#2a1a48", "#3d2a6b", "#5a4088", "#7a5aa0"],
    title: "#b8f000",
    subtitle: "#ffffff",
  },
  "navy-gold": {
    top: "#020812",
    mid: "#0a1a3a",
    accent: "#f5b942",
    glow: "#3d7cff",
    hill: ["#020812", "#061428", "#0c2448", "#143868", "#1e4a80"],
    title: "#f5b942",
    subtitle: "#ffffff",
  },
  "forest-coral": {
    top: "#1a4a28",
    mid: "#0f3a1c",
    accent: "#f0a090",
    glow: "#5cdb7a",
    hill: ["#0a2814", "#145028", "#1e6a38", "#2a8048"],
    blob: ["#2ecc71", "#1a5c2e", "#a8e6b0", "#0d3a1a", "#4cd964"],
    title: "#ffffff",
    subtitle: "#f0a090",
  },
  teal: {
    top: "#041820",
    mid: "#0a2a32",
    accent: "#7ee0d0",
    glow: "#2ec4b6",
    hill: ["#03141a", "#0a2830", "#123840", "#1a4850"],
    title: "#ffffff",
    subtitle: "#7ee0d0",
  },
  "navy-ember": {
    top: "#050508",
    mid: "#0a1428",
    accent: "#ff4433",
    glow: "#ff6644",
    hill: ["#050508", "#0a1020", "#101c38", "#182848"],
    title: "#ff4433",
    subtitle: "#ffffff",
  },
};

export function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexAlpha(hex, a) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function fillBase(ctx, p) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, p.top);
  g.addColorStop(0.55, p.mid);
  g.addColorStop(1, p.hill[p.hill.length - 1] || p.mid);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function hillPath(ctx, yBase, amp, freq, phase, steps) {
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, yBase);
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const y =
      yBase +
      Math.sin(i * freq + phase) * amp +
      Math.sin(i * freq * 0.37 + phase * 2.1) * amp * 0.35;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
}

function drawGlow(ctx, p, rand) {
  fillBase(ctx, p);

  const veil = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  veil.addColorStop(0, "rgba(0,0,0,0.85)");
  veil.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H * 0.55);

  const bandY = H * (0.58 + rand() * 0.08);
  for (let i = 0; i < 5; i++) {
    const spread = (40 + i * 55) * SCALE;
    const grad = ctx.createRadialGradient(
      W * 0.5,
      bandY,
      10 * SCALE,
      W * 0.5,
      bandY,
      W * 0.65 + spread
    );
    const alpha = 0.28 - i * 0.045;
    grad.addColorStop(0, hexAlpha(p.glow, alpha));
    grad.addColorStop(0.35, hexAlpha(p.accent, alpha * 0.7));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(W * 0.5, bandY, W * 0.72, spread, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHills(ctx, p, rand) {
  fillBase(ctx, p);

  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.45);
  sky.addColorStop(0, p.top);
  sky.addColorStop(1, p.hill[Math.min(2, p.hill.length - 1)]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.5);

  const layers = p.hill;
  const count = layers.length;
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    const yBase = H * (0.32 + t * 0.42);
    const amp = (28 + (1 - t) * 55 + rand() * 20) * SCALE;
    const freq = 0.18 + rand() * 0.12;
    const phase = rand() * Math.PI * 2;
    hillPath(ctx, yBase, amp, freq, phase, 48);
    ctx.fillStyle = layers[i];
    ctx.fill();
  }

  ctx.globalCompositeOperation = "screen";
  const hi = ctx.createLinearGradient(0, H * 0.4, 0, H);
  hi.addColorStop(0, "rgba(255,255,255,0)");
  hi.addColorStop(0.5, hexAlpha(p.glow || p.accent, 0.08));
  hi.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hi;
  ctx.fillRect(0, H * 0.35, W, H * 0.65);
  ctx.globalCompositeOperation = "source-over";
}

function drawBlobs(ctx, p, rand) {
  const colors = p.blob || [p.accent, p.mid, p.glow, p.top, p.hill[1]];
  ctx.fillStyle = p.mid;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 7; i++) {
    const cx = W * (0.35 + rand() * 0.55);
    const cy = H * (0.15 + rand() * 0.55);
    const rx = (120 + rand() * 280) * SCALE;
    const ry = (90 + rand() * 220) * SCALE;
    const color = colors[i % colors.length];
    const g = ctx.createRadialGradient(cx, cy, 10 * SCALE, cx, cy, Math.max(rx, ry));
    g.addColorStop(0, hexAlpha(color, 0.55));
    g.addColorStop(0.55, hexAlpha(color, 0.22));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWaves(ctx, p, rand) {
  fillBase(ctx, p);

  const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.7);
  topFade.addColorStop(0, p.top);
  topFade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topFade;
  ctx.fillRect(0, 0, W, H * 0.7);

  for (let i = 0; i < 4; i++) {
    const yBase = H * (0.62 + i * 0.08);
    const amp = (18 + i * 8 + rand() * 10) * SCALE;
    hillPath(ctx, yBase, amp, 0.22 + i * 0.04, rand() * 6, 40);
    ctx.fillStyle = hexAlpha(p.accent, 0.08 + i * 0.04);
    ctx.fill();
  }
}

function wrapLines(ctx, text, maxWidth, font) {
  ctx.font = font;
  const raw = text.replace(/\r/g, "").split("\n");
  const lines = [];
  for (const paragraph of raw) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = words[0] || "";
    for (let i = 1; i < words.length; i++) {
      const test = `${line} ${words[i]}`;
      if (ctx.measureText(test).width <= maxWidth) line = test;
      else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
  }
  return lines;
}

function drawText(ctx, state, fontFamily, fontWeight = 800) {
  const family = fontFamily || "Inter, system-ui, sans-serif";
  // titleSize is in design units (baseline 1200-wide); scale for export res
  const titlePx = state.titleSize * SCALE;
  const titleFont = `${fontWeight} ${titlePx}px ${family}`;
  const subSize = Math.round(titlePx * 0.42);
  const subFont = `${Math.min(fontWeight, 700)} ${subSize}px ${family}`;
  const maxW = W * 0.82;

  const titleLines = wrapLines(ctx, state.title, maxW, titleFont);
  const sub = (state.subtitle || "").trim();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const titleLineH = titlePx * 1.12;
  const blockH =
    titleLines.length * titleLineH + (sub ? subSize * 1.6 + 18 * SCALE : 0);
  let y = H * 0.48 - blockH / 2 + titleLineH / 2;

  if (state.style === "hills" || state.style === "waves") {
    y -= H * 0.04;
  }

  ctx.fillStyle = state.titleColor;
  ctx.font = titleFont;
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, y);
    y += titleLineH;
  }

  if (sub) {
    y += 8 * SCALE;
    ctx.fillStyle = state.subtitleColor;
    ctx.font = subFont;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0.04em";
    ctx.fillText(sub, W / 2, y + subSize * 0.2);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state
 * @param {{ fontFamily?: string, fontWeight?: number }} [opts]
 */
export function renderCover(ctx, state, opts = {}) {
  const paletteKey = state.palette || "indigo-lime";
  const p = PALETTES[paletteKey];
  if (!p) throw new Error(`Unknown palette: ${paletteKey}`);

  const resolved = {
    title: (state.title || "Untitled").trim(),
    subtitle: state.subtitle || "",
    style: state.style || "hills",
    palette: paletteKey,
    titleColor: state.titleColor || p.title,
    subtitleColor: state.subtitleColor || p.subtitle,
    titleSize: Number(state.titleSize) || 78,
    seed: Number(state.seed) || 1,
  };

  const rand = mulberry32(resolved.seed >>> 0);
  ctx.clearRect(0, 0, W, H);

  switch (resolved.style) {
    case "glow":
      drawGlow(ctx, p, rand);
      break;
    case "blobs":
      drawBlobs(ctx, p, rand);
      break;
    case "waves":
      drawWaves(ctx, p, rand);
      break;
    case "hills":
    default:
      drawHills(ctx, p, rand);
      break;
  }

  drawText(ctx, resolved, opts.fontFamily, opts.fontWeight ?? 800);
  return resolved;
}

export function slugify(input) {
  return (
    String(input || "cover")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cover"
  );
}
