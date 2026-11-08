#!/usr/bin/env node
/**
 * Bespoke "Trance Breakdown" cover:
 *   engine renderCover (waves / violet-cyan) for base + title,
 *   then an abstract energy curve + highlighted Breakdown band
 *   in the lower zone, below the text.
 *
 * Usage: node render-breakdown.mjs [seed] [--out path]
 * Defaults: seed 42, out ../../assets/images/headers/trance-breakdown.png
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { W, H, SCALE, PALETTES, mulberry32, renderCover, slugify } from "./engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DEFAULT_OUT = path.join(ROOT, "assets/images/headers/trance-breakdown.png");

const argv = process.argv.slice(2);
const seed = Number(argv.find((a, i) => i === 0 && !a.startsWith("--"))) || 42;
const outArgIdx = argv.indexOf("--out");
const outPath = path.resolve(outArgIdx >= 0 ? argv[outArgIdx + 1] : DEFAULT_OUT);

try { GlobalFonts.registerFromPath(path.join(__dirname, "fonts/Fraunces-Bold.ttf"), "Fraunces"); } catch {}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

/* ---------- engine base + title (identical to `--style waves --palette violet-cyan`) ---------- */
renderCover(
  ctx,
  {
    title: "Trance Breakdown",
    subtitle: "What · Why · How · When",
    style: "waves",
    palette: "violet-cyan",
    titleSize: 88,
    seed,
  },
  { fontFamily: "Fraunces", fontWeight: 800 }
);

/* ---------- breakdown highlight band (starts below the title block) ---------- */
const BX0 = W * 0.3;
const BX1 = W * 0.46;
const BAND_TOP = H * 0.61;
ctx.fillStyle = "rgba(180,77,255,0.10)"; // violet glow tint
ctx.fillRect(BX0, BAND_TOP, BX1 - BX0, H - BAND_TOP);
ctx.strokeStyle = "rgba(94,240,216,0.35)";
ctx.lineWidth = 1.5 * SCALE;
ctx.beginPath();
ctx.moveTo(BX0, BAND_TOP); ctx.lineTo(BX0, H);
ctx.moveTo(BX1, BAND_TOP); ctx.lineTo(BX1, H);
ctx.stroke();

/* ---------- abstract energy curve ---------- */
// sections: [start, end, energy] — intro / theme / BREAKDOWN / build / drop / outro
const SECTIONS = [
  [0.0, 0.1, 0.12],
  [0.1, 0.28, 0.62],
  [0.28, 0.46, 0.15], // the breakdown trough, inside the band
  [0.46, 0.55, 0.82], // build
  [0.55, 0.8, 1.0],   // drop peak
  [0.8, 1.0, 0.3],    // outro
];
const energyAt = (t) =>
  SECTIONS.find(([a, b]) => t >= a && t <= b)?.[2] ?? 0.2;

const N = 900;
const K = 60;
const raw = Array.from({ length: N + 1 }, (_, i) => energyAt(i / N));
const smoothed = raw.map((_, i) => {
  const lo = Math.max(0, i - K), hi = Math.min(N, i + K);
  let wsum = 0, ssum = 0;
  for (let j = lo; j <= hi; j++) {
    const w = Math.exp(-((j - i) ** 2) / (2 * (K / 2.5) ** 2));
    wsum += w; ssum += raw[j] * w;
  }
  return ssum / wsum;
});

const Y0 = H * 0.82;
const RANGE = H * 0.17;
const pts = smoothed.map((e, i) => [(i / N) * W, Y0 - e * RANGE]);

// soft fill under the curve
ctx.beginPath();
ctx.moveTo(pts[0][0], pts[0][1]);
for (const [x, y] of pts) ctx.lineTo(x, y);
ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
ctx.fillStyle = "rgba(94,240,216,0.05)";
ctx.fill();

// glowing gradient stroke: violet -> cyan
const stroke = ctx.createLinearGradient(0, 0, W, 0);
stroke.addColorStop(0, PALETTES["violet-cyan"].glow);
stroke.addColorStop(0.55, "#7ab8ff");
stroke.addColorStop(1, PALETTES["violet-cyan"].accent);
ctx.beginPath();
ctx.moveTo(pts[0][0], pts[0][1]);
for (const [x, y] of pts) ctx.lineTo(x, y);
ctx.strokeStyle = stroke;
ctx.lineWidth = 5 * SCALE;
ctx.lineJoin = "round";
ctx.shadowColor = "rgba(94,240,216,0.9)";
ctx.shadowBlur = 26 * SCALE;
ctx.stroke();
ctx.shadowBlur = 0;

/* ---------- save ---------- */
const buf = canvas.toBuffer("image/png");
await writeFile(outPath, buf);
console.log(`Wrote ${outPath} (${W}×${H}, seed ${seed})`);
