export type GlassPoint = { x: number; y: number };
export type GlassShard = {
  points: GlassPoint[];
  centerX: number;
  centerY: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  spin: number;
  delay: number;
};

// Deterministic clipped Voronoi cells tile the entire viewport, without radial symmetry.
// A few cells split into acute triangles to mix broad glass plates with smaller splinters.
export function makeGlassShards(width: number, height: number): GlassShard[] {
  let seed = 17423;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const sites: GlassPoint[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++)
      sites.push({
        x: (width * (col + 0.12 + random() * 0.76)) / 5,
        y: (height * (row + 0.12 + random() * 0.76)) / 4,
      });
  }
  for (let i = 0; i < 7; i++)
    sites.push({ x: width * (0.34 + random() * 0.28), y: height * (0.32 + random() * 0.34) });
  const cells: GlassPoint[][] = [];
  sites.forEach((site, index) => {
    let polygon: GlassPoint[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
    sites.forEach((other, otherIndex) => {
      if (index === otherIndex || !polygon.length) return;
      const a = other.x - site.x,
        b = other.y - site.y;
      const c = (other.x ** 2 + other.y ** 2 - site.x ** 2 - site.y ** 2) / 2;
      const clipped: GlassPoint[] = [];
      polygon.forEach((start, i) => {
        const end = polygon[(i + 1) % polygon.length];
        const from = a * start.x + b * start.y - c;
        const to = a * end.x + b * end.y - c;
        if (from <= 0) clipped.push(start);
        if (from <= 0 !== to <= 0) {
          const t = from / (from - to);
          clipped.push({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t });
        }
      });
      polygon = clipped;
    });
    if (polygon.length < 3) return;
    if (index % 9 === 2) {
      polygon.forEach((p, i) => cells.push([site, p, polygon[(i + 1) % polygon.length]]));
    } else cells.push(polygon);
  });
  return cells.map((points) => {
    const center = points.reduce(
      (sum, p) => ({ x: sum.x + p.x / points.length, y: sum.y + p.y / points.length }),
      { x: 0, y: 0 },
    );
    const angle = Math.atan2(center.y - height * 0.48, center.x - width * 0.48);
    const distance = Math.hypot(width, height) * (0.8 + random() * 0.35);
    const drift = Math.min(width, height) * (0.006 + random() * 0.013);
    return {
      points,
      centerX: center.x,
      centerY: center.y,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance + height * 0.08,
      driftX: Math.cos(angle) * drift,
      driftY: Math.sin(angle) * drift,
      spin: (random() - 0.5) * 90,
      delay: random() * 0.035,
    };
  });
}
