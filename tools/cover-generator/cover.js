import { JPEG_QUALITY, PALETTES, renderCover, slugify } from "./engine.mjs";

const els = {
  canvas: document.getElementById("stage"),
  title: document.getElementById("title"),
  subtitle: document.getElementById("subtitle"),
  slug: document.getElementById("slug"),
  style: document.getElementById("style"),
  palette: document.getElementById("palette"),
  titleColor: document.getElementById("titleColor"),
  subtitleColor: document.getElementById("subtitleColor"),
  titleSize: document.getElementById("titleSize"),
  seed: document.getElementById("seed"),
  randomize: document.getElementById("randomize"),
  redraw: document.getElementById("redraw"),
  download: document.getElementById("download"),
};

const ctx = els.canvas.getContext("2d");

function applyPaletteColors() {
  const p = PALETTES[els.palette.value];
  if (!p) return;
  els.titleColor.value = p.title;
  els.subtitleColor.value = p.subtitle;
}

function getState() {
  return {
    title: els.title.value.trim() || "Untitled",
    subtitle: els.subtitle.value,
    style: els.style.value,
    palette: els.palette.value,
    titleColor: els.titleColor.value,
    subtitleColor: els.subtitleColor.value,
    titleSize: Number(els.titleSize.value),
    seed: Number(els.seed.value) || 1,
  };
}

function render() {
  renderCover(ctx, getState());
}

function download() {
  render();
  const slug = slugify(els.slug.value || "cover");
  els.canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    "image/jpeg",
    JPEG_QUALITY / 100
  );
}

function bind() {
  const redrawIds = [
    "title",
    "subtitle",
    "style",
    "palette",
    "titleColor",
    "subtitleColor",
    "titleSize",
    "seed",
  ];
  for (const id of redrawIds) {
    els[id].addEventListener("input", () => {
      if (id === "palette") applyPaletteColors();
      render();
    });
    els[id].addEventListener("change", () => {
      if (id === "palette") applyPaletteColors();
      render();
    });
  }
  els.randomize.addEventListener("click", () => {
    els.seed.value = String(Math.floor(Math.random() * 99999));
    render();
  });
  els.redraw.addEventListener("click", render);
  els.download.addEventListener("click", download);
}

applyPaletteColors();
bind();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(render);
} else {
  render();
}
