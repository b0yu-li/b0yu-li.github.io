/** Shared cover render engine (browser canvas + Node @napi-rs/canvas). */

/** Design + export size (OG / Chirpy header ratio). SCALE=2 → 2400×1260 retina PNG. */
export const SCALE = 2;
export const W = 1200 * SCALE;
export const H = 630 * SCALE;

/** JPEG quality 0–100 (CLI) / 0–1 (browser). Max quality to limit banding on flats. */
export const JPEG_QUALITY = 100;

/**
 * Abstract background themes (shape language — pick independently from palette).
 * hills/waves share undulating silhouettes; the rest are intentionally different.
 */
export const STYLES = [
  "glow",
  "hills",
  "blobs",
  "waves",
  "aurora",
  "rings",
  "mesh",
  "beams",
];

/** Background + default title/subtitle color combinations. */
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
  "plum-cream": {
    top: "#1a0e28",
    mid: "#2e1848",
    accent: "#f3e6d0",
    glow: "#a86bff",
    hill: ["#140a20", "#241438", "#3a2060", "#563088", "#6e48a0"],
    title: "#f3e6d0",
    subtitle: "#d4b8f0",
  },
  "midnight-cyan": {
    top: "#020618",
    mid: "#061830",
    accent: "#4df0ff",
    glow: "#2a7cff",
    hill: ["#020610", "#061428", "#0a2440", "#103858", "#184868"],
    title: "#4df0ff",
    subtitle: "#e8f8ff",
  },
  "wine-rose": {
    top: "#14080e",
    mid: "#2a1018",
    accent: "#ff8fa8",
    glow: "#ff4d6d",
    hill: ["#10060a", "#1e0c14", "#32101c", "#4a1828", "#602030"],
    title: "#ffe4ec",
    subtitle: "#ff8fa8",
  },
  "violet-cyan": {
    top: "#0c0618",
    mid: "#1a0a38",
    accent: "#5ef0d8",
    glow: "#b44dff",
    hill: ["#0a0414", "#160a30", "#2a1460", "#3d2088", "#5430a8"],
    title: "#5ef0d8",
    subtitle: "#e8d4ff",
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

/** Vertical aurora ribbons — not hills. */
function drawAurora(ctx, p, rand) {
  fillBase(ctx, p);

  const veil = ctx.createLinearGradient(0, 0, 0, H);
  veil.addColorStop(0, "rgba(0,0,0,0.55)");
  veil.addColorStop(0.45, "rgba(0,0,0,0)");
  veil.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 6; i++) {
    const cx = W * (0.12 + i * 0.15 + rand() * 0.04);
    const tilt = (rand() - 0.5) * 0.35;
    const bandW = (70 + rand() * 90) * SCALE;
    ctx.save();
    ctx.translate(cx, H * 0.5);
    ctx.rotate(tilt);
    const g = ctx.createLinearGradient(0, -H * 0.55, 0, H * 0.55);
    const c = i % 2 === 0 ? p.glow : p.accent;
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.25, hexAlpha(c, 0.05));
    g.addColorStop(0.5, hexAlpha(c, 0.45));
    g.addColorStop(0.75, hexAlpha(c, 0.12));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-bandW / 2, -H * 0.55, bandW, H * 1.1);
    ctx.restore();
  }
  ctx.restore();
}

/** Concentric rings / pulse — club / drop energy. */
function drawRings(ctx, p, rand) {
  fillBase(ctx, p);

  const cx = W * (0.5 + (rand() - 0.5) * 0.12);
  const cy = H * (0.55 + (rand() - 0.5) * 0.1);

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55);
  core.addColorStop(0, hexAlpha(p.glow, 0.35));
  core.addColorStop(0.35, hexAlpha(p.accent, 0.12));
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 7; i++) {
    const r = (90 + i * 55 + rand() * 12) * SCALE;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(i % 2 === 0 ? p.accent : p.glow, 0.18 - i * 0.018);
    ctx.lineWidth = (2.5 + (i % 3)) * SCALE;
    ctx.stroke();
  }

  const edge = ctx.createRadialGradient(cx, cy, W * 0.2, cx, cy, W * 0.75);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, H);
}

/** Soft node mesh / constellation grid. */
function drawMesh(ctx, p, rand) {
  fillBase(ctx, p);

  const cols = 6;
  const rows = 4;
  const nodes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      nodes.push({
        x: W * ((col + 0.5) / cols) + (rand() - 0.5) * 40 * SCALE,
        y: H * ((row + 0.35) / rows) + (rand() - 0.5) * 30 * SCALE,
      });
    }
  }

  ctx.lineWidth = 1.5 * SCALE;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist > W * 0.28) continue;
      ctx.strokeStyle = hexAlpha(p.accent, 0.08 + (1 - dist / (W * 0.28)) * 0.14);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const r = (4 + rand() * 6) * SCALE;
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 6);
    g.addColorStop(0, hexAlpha(i % 3 === 0 ? p.glow : p.accent, 0.55));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(n.x, n.y, r * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hexAlpha("#ffffff", 0.55);
    ctx.beginPath();
    ctx.arc(n.x, n.y, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Diagonal light beams / shards. */
function drawBeams(ctx, p, rand) {
  fillBase(ctx, p);

  const originX = W * (0.15 + rand() * 0.2);
  const originY = H * (0.75 + rand() * 0.15);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 9; i++) {
    const angle = -1.15 + i * 0.18 + (rand() - 0.5) * 0.05;
    const len = W * (0.9 + rand() * 0.25);
    const spread = (18 + i * 4 + rand() * 10) * SCALE;
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    const c = i % 2 === 0 ? p.glow : p.accent;
    g.addColorStop(0, hexAlpha(c, 0.5));
    g.addColorStop(0.45, hexAlpha(c, 0.18));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, -spread);
    ctx.lineTo(len, spread);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  const fade = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  fade.addColorStop(0, "rgba(0,0,0,0.5)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H * 0.4);
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

  if (state.style === "hills" || state.style === "waves" || state.style === "beams") {
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
    case "aurora":
      drawAurora(ctx, p, rand);
      break;
    case "rings":
      drawRings(ctx, p, rand);
      break;
    case "mesh":
      drawMesh(ctx, p, rand);
      break;
    case "beams":
      drawBeams(ctx, p, rand);
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
