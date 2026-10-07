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

// Debug: Check if canvas is properly initialized
console.log('Canvas element:', els.canvas);
console.log('Canvas dimensions:', els.canvas.width, 'x', els.canvas.height);
console.log('Context:', ctx);

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
  try {
    const state = getState();
    console.log('Render state:', state);
    
    const palette = PALETTES[state.palette];
    console.log('Palette:', state.palette, palette);
    
    if (!palette) {
      console.error('Palette not found:', state.palette);
      ctx.fillStyle = '#1a1e28';
      ctx.fillRect(0, 0, 2400, 1260);
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Palette not found: ${state.palette}`, 1200, 630);
      return;
    }
    
    renderCover(ctx, state);
    console.log('Render complete');
  } catch (error) {
    console.error('Render failed:', error);
    // Draw a simple fallback
    ctx.fillStyle = '#1a1e28';
    ctx.fillRect(0, 0, 2400, 1260);
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Render error - check console', 1200, 630);
  }
}

function download() {
  render();
  const slug = slugify(els.slug.value || "cover");
  
  try {
    els.canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          alert('Failed to generate image. Please try again.');
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${slug}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        console.log(`Downloaded: ${slug}.png`);
      },
      "image/png"
    );
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
  }
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

// Ensure fonts are loaded before rendering
async function init() {
  try {
    console.log('Initializing cover generator...');
    console.log('Engine imports:', { JPEG_QUALITY, PALETTES, renderCover, slugify });
    
    // Test canvas
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);
    console.log('Canvas test: Drew red square at top-left');
    
    if (document.fonts && document.fonts.ready) {
      console.log('Waiting for fonts to load...');
      await document.fonts.ready;
      console.log('Fonts loaded:', Array.from(document.fonts).map(f => f.family).join(', '));
      // Small delay to ensure fonts are fully available
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Calling render...');
    render();
    console.log('Cover generator initialized successfully');
  } catch (error) {
    console.error('Failed to initialize cover generator:', error);
    // Try rendering anyway as fallback
    render();
  }
}

init();
