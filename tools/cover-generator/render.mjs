#!/usr/bin/env node
/**
 * Render a Rooby post cover to JPG.
 *
 * Usage:
 *   node render.mjs --title "The Compounding System" --slug compounding-system
 *   node render.mjs --title "Life Is\nAn Infinite Game" --style glow --palette violet --out ../../assets/images/headers/foo.jpg
 *
 * Defaults write to ../../assets/images/headers/<slug>.jpg
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { H, JPEG_QUALITY, PALETTES, STYLES, W, renderCover, slugify } from "./engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DEFAULT_OUT_DIR = path.join(ROOT, "assets/images/headers");

/** Prefer editorial / chic display faces, then solid sans fallbacks. */
const FONT_CANDIDATES = [
  {
    id: "fraunces",
    family: "Fraunces",
    paths: [path.join(__dirname, "fonts/Fraunces-Bold.ttf")],
  },
  {
    id: "didot",
    family: "Didot",
    paths: ["/System/Library/Fonts/Supplemental/Didot.ttc"],
  },
  {
    id: "newyork",
    family: "NewYork",
    paths: ["/System/Library/Fonts/NewYork.ttf"],
  },
  {
    id: "hoefler",
    family: "Hoefler Text",
    paths: ["/System/Library/Fonts/Supplemental/Hoefler Text.ttc"],
  },
  {
    id: "baskerville",
    family: "Baskerville",
    paths: ["/System/Library/Fonts/Supplemental/Baskerville.ttc"],
  },
  {
    id: "arial",
    family: "Arial",
    paths: [
      "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
      "/System/Library/Fonts/Supplemental/Arial.ttf",
    ],
  },
];

function parseArgs(argv) {
  const out = {
    title: "The Compounding\nSystem",
    subtitle: "",
    slug: "compounding-system",
    style: "hills",
    palette: "indigo-lime",
    titleColor: "",
    subtitleColor: "",
    titleSize: 78,
    seed: 42,
    font: "fraunces",
    out: "",
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--title":
        out.title = next().replace(/\\n/g, "\n");
        break;
      case "--subtitle":
        out.subtitle = next();
        break;
      case "--slug":
        out.slug = next();
        break;
      case "--style":
        out.style = next();
        break;
      case "--palette":
        out.palette = next();
        break;
      case "--title-color":
        out.titleColor = next();
        break;
      case "--subtitle-color":
        out.subtitleColor = next();
        break;
      case "--title-size":
        out.titleSize = Number(next());
        break;
      case "--seed":
        out.seed = Number(next());
        break;
      case "--font":
        out.font = next().toLowerCase();
        break;
      case "--out":
        out.out = next();
        break;
      case "--help":
      case "-h":
        out.help = true;
        break;
      default:
        if (a.startsWith("-")) throw new Error(`Unknown flag: ${a}`);
    }
  }
  return out;
}

function registerFont(preferredId) {
  const ordered = [
    ...FONT_CANDIDATES.filter((f) => f.id === preferredId),
    ...FONT_CANDIDATES.filter((f) => f.id !== preferredId),
  ];

  for (const font of ordered) {
    for (const file of font.paths) {
      try {
        GlobalFonts.registerFromPath(file, font.family);
        return { family: font.family, id: font.id, file };
      } catch {
        /* try next path */
      }
    }
  }
  return { family: "sans-serif", id: "system", file: null };
}

function printHelp() {
  const palettes = Object.keys(PALETTES).join(", ");
  const styles = STYLES.join("|");
  const fonts = FONT_CANDIDATES.map((f) => f.id).join(", ");
  console.log(`Rooby cover renderer

Options:
  --title "Line one\\nLine two"
  --subtitle "Optional"
  --slug compounding-system
  --style ${styles}
  --palette ${palettes}
  --font ${fonts}
  --title-color #f3e6d0
  --subtitle-color #ffffff
  --title-size 78
  --seed 42
  --out path/to/file.jpg
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!STYLES.includes(args.style)) {
    throw new Error(`Unknown style "${args.style}". Choose: ${STYLES.join(", ")}`);
  }

  if (!PALETTES[args.palette]) {
    throw new Error(
      `Unknown palette "${args.palette}". Choose: ${Object.keys(PALETTES).join(", ")}`
    );
  }

  const font = registerFont(args.font);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const p = PALETTES[args.palette];
  // Fraunces: heavy display weight (the bold look). Thin fashion serifs stay lighter.
  const weight =
    font.id === "fraunces" ? 800 : font.id === "arial" || font.id === "system" ? 800 : 600;

  renderCover(
    ctx,
    {
      title: args.title,
      subtitle: args.subtitle,
      style: args.style,
      palette: args.palette,
      titleColor: args.titleColor || p.title,
      subtitleColor: args.subtitleColor || p.subtitle,
      titleSize: args.titleSize,
      seed: args.seed,
    },
    { fontFamily: font.family, fontWeight: weight }
  );

  const slug = slugify(args.slug || args.title.split("\n")[0]);
  const outPath = path.resolve(
    args.out || path.join(DEFAULT_OUT_DIR, `${slug}.png`)
  );

  await mkdir(path.dirname(outPath), { recursive: true });
  const ext = path.extname(outPath).toLowerCase();
  const buf =
    ext === ".png"
      ? await canvas.encode("png")
      : await canvas.encode("jpeg", JPEG_QUALITY);
  await writeFile(outPath, buf);
  console.log(
    `Wrote ${outPath} (${W}×${H}, ${ext === ".png" ? "png" : `jpeg q${JPEG_QUALITY}`}, font=${font.id})`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
