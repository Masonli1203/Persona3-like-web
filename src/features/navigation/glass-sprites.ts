import type { GlassShard } from './glass-geometry';

export const GREEN_GLASS = {
  '--glass-glow': '#233c17',
  '--glass-dark': '#101e0d',
  '--glass-black': '#050a04',
  '--glass-dial': '#091109',
  '--glass-muted': '#8aaf69',
  '--glass-light': '#eeffdd',
  '--glass-accent': '#baf28c',
};

export function boundShard(shard: GlassShard) {
  const left = Math.floor(Math.min(...shard.points.map((p) => p.x))) - 1;
  const top = Math.floor(Math.min(...shard.points.map((p) => p.y))) - 1;
  const width = Math.ceil(Math.max(...shard.points.map((p) => p.x))) - left + 1;
  const height = Math.ceil(Math.max(...shard.points.map((p) => p.y))) - top + 1;
  return { ...shard, left, top, width, height };
}

// Rasterize one complete surface once, then crop small transparent textures.
// The moving elements never redraw SVG, run JS physics, or allocate full-screen textures.
export async function prepareGlassSprites(
  svg: SVGSVGElement,
  canvases: HTMLCanvasElement[],
  shards: ReturnType<typeof boundShard>[],
  width: number,
  height: number,
  signal: AbortSignal,
) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  Object.entries(GREEN_GLASS).forEach(([name, value]) => clone.style.setProperty(name, value));
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }),
  );
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (signal.aborted) return;
    // Bound texture memory on 4K/high-DPI displays; the intact clock stays vector sharp.
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      Math.sqrt(3_000_000 / (width * height)),
    );
    const surface = document.createElement('canvas');
    surface.width = Math.ceil(width * ratio);
    surface.height = Math.ceil(height * ratio);
    const source = surface.getContext('2d');
    if (!source) throw new Error('Canvas unavailable');
    source.drawImage(image, 0, 0, surface.width, surface.height);
    for (let i = 0; i < shards.length; i++) {
      if (signal.aborted) break;
      const shard = shards[i],
        canvas = canvases[i];
      canvas.width = Math.ceil(shard.width * ratio);
      canvas.height = Math.ceil(shard.height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.scale(ratio, ratio);
      ctx.translate(-shard.left, -shard.top);
      ctx.beginPath();
      shard.points.forEach((p, n) => (n ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(surface, 0, 0, width, height);
      ctx.strokeStyle = 'rgba(186,242,140,.65)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Spread preparation across frames while the intact clock is running.
      if (i % 6 === 5) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    surface.width = 0;
    surface.height = 0;
  } finally {
    URL.revokeObjectURL(url);
    image.src = '';
  }
}
