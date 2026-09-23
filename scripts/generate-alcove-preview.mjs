import { mkdir, writeFile } from 'node:fs/promises';
import { buildAlcove, DEFAULT_CONFIG, FINISHES } from '../src/lib/alcove-config.ts';
import { dot, painterOrder, planeOf } from './lib/preview-visibility.mjs';

// The cover is generated from the same original assembly as the interactive demo.
const colors = {
  frame: FINISHES.graphite.color,
  wood: '#ba9367',
  woodEdge: '#a98257',
  deck: '#b18b5b',
  fabric: '#ece3cc',
  fabricEdge: '#b8b49f',
  accent: '#9b6753',
  metal: '#7d827c',
  stone: '#c6bdad',
  dark: '#303b3b',
  light: '#ffefc4',
  heat: '#df8755',
  leaf: '#49644a',
  ceramic: '#c7c9b9',
};
const yaw = 0.66,
  pitch = 0.43,
  scale = 177;
const project = ([x, y, z]) => [
  600 + (x * Math.cos(yaw) - z * Math.sin(yaw)) * scale,
  507 -
    ((y - 1.22) * Math.cos(pitch) - (x * Math.sin(yaw) + z * Math.cos(yaw)) * Math.sin(pitch)) *
      scale,
];
const viewDirection = [
  Math.sin(yaw) * Math.cos(pitch),
  Math.sin(pitch),
  Math.cos(yaw) * Math.cos(pitch),
];
const shade = (hex, factor) =>
  '#' +
  [1, 3, 5]
    .map((start) =>
      Math.min(255, Math.round(parseInt(hex.slice(start, start + 2), 16) * factor))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
const transform = (point, part) => {
  let [x, y, z] = point.map((value, index) => value * part.size[index]);
  const [a, b, c] = part.rotation ?? [0, 0, 0];
  // Match Three.js's default XYZ Euler order (Z, then Y, then X on a point).
  [x, y] = [x * Math.cos(c) - y * Math.sin(c), x * Math.sin(c) + y * Math.cos(c)];
  [x, z] = [x * Math.cos(b) + z * Math.sin(b), -x * Math.sin(b) + z * Math.cos(b)];
  [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
  return [x + part.position[0], y + part.position[1], z + part.position[2]];
};
const cube = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, 0.5, 0.5],
  [-0.5, 0.5, 0.5],
];
const faces = [
  [0, 3, 2, 1],
  [4, 5, 6, 7],
  [0, 4, 7, 3],
  [1, 2, 6, 5],
  [3, 7, 6, 2],
  [0, 1, 5, 4],
];
const polygons = [];
const addPolygon = (points, color) => {
  const plane = planeOf(points);
  if (!plane || dot(plane.normal, viewDirection) <= 1e-7) return;
  const projected = points.map(project);
  const area =
    Math.abs(
      projected.reduce((sum, point, i) => {
        const next = projected[(i + 1) % projected.length];
        return sum + point[0] * next[1] - point[1] * next[0];
      }, 0),
    ) / 2;
  polygons.push({ points, plane, area, color });
};
for (const part of buildAlcove(DEFAULT_CONFIG)) {
  if (part.shape === 'sphere') {
    // Actual ellipsoid surfaces let foliage participate in the depth order.
    const point = (latitude, longitude) =>
      transform(
        [
          0.5 * Math.sin(latitude) * Math.cos(longitude),
          0.5 * Math.cos(latitude),
          0.5 * Math.sin(latitude) * Math.sin(longitude),
        ],
        part,
      );
    for (let ring = 0; ring < 4; ring++)
      for (let side = 0; side < 8; side++) {
        const a = point((ring * Math.PI) / 4, (side * Math.PI) / 4);
        const b = point(((ring + 1) * Math.PI) / 4, (side * Math.PI) / 4);
        const c = point(((ring + 1) * Math.PI) / 4, ((side + 1) * Math.PI) / 4);
        const d = point((ring * Math.PI) / 4, ((side + 1) * Math.PI) / 4);
        addPolygon([a, d, c], colors[part.material]);
        addPolygon([a, c, b], colors[part.material]);
      }
    continue;
  }
  const isBox = part.shape === 'box' || part.shape === 'softBox';
  const vertices = isBox
    ? cube
    : Array.from({ length: 24 }, (_, i) => {
        const a = ((i % 12) * Math.PI) / 6;
        return [
          Math.cos(a) * (i < 12 ? 0.44 : 0.5),
          i < 12 ? -0.5 : 0.5,
          Math.sin(a) * (i < 12 ? 0.44 : 0.5),
        ];
      });
  const surfaces = isBox
    ? faces
    : [
        ...Array.from({ length: 12 }, (_, i) => [i, i + 12, ((i + 1) % 12) + 12, (i + 1) % 12]),
        Array.from({ length: 12 }, (_, i) => 23 - i),
        Array.from({ length: 12 }, (_, i) => i),
      ];
  const transformed = vertices.map((vertex) => transform(vertex, part));
  surfaces.forEach((face, index) => {
    const points = face.map((i) => transformed[i]);
    const factor = isBox
      ? [0.78, 0.91, 0.8, 1.04, 1.13, 0.7][index]
      : index === 12
        ? 1.12
        : 0.85 + (index / 12) * 0.16;
    addPolygon(points, shade(colors[part.material], factor));
  });
}
const ordered = painterOrder(polygons, viewDirection);
// Matching fill/stroke hides subpixel seams between fragments of a split face.
const artwork = ordered
  .map(
    ({ points, color }) =>
      `<polygon points="${points
        .map((p) =>
          project(p)
            .map((v) => v.toFixed(2))
            .join(','),
        )
        .join(
          ' ',
        )}" fill="${color}" stroke="${color}" stroke-width=".35" stroke-linejoin="round"/>`,
  )
  .join('');
const w1 = project([-1.6, 0.01, 1.7]),
  w2 = project([1.6, 0.01, 1.7]);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><radialGradient id="bg"><stop stop-color="#f6f7ef"/><stop offset="1" stop-color="#dce4d7"/></radialGradient></defs><rect width="1200" height="900" fill="url(#bg)"/><g fill="#385045" font-family="monospace" font-size="16"><text x="54" y="60">ORIGINAL CONCEPT / 001</text><text x="1146" y="60" text-anchor="end">PARAMETRIC SPACES</text></g><ellipse cx="600" cy="717" rx="360" ry="79" fill="#879781" opacity=".14"/>${artwork}<g stroke="#748774" fill="none" stroke-width="1.5"><path d="M${w1.join(' ')}L${w2.join(' ')}"/><path d="M${w1[0]} ${w1[1] - 7}v14 M${w2[0]} ${w2[1] - 7}v14"/></g><text x="${(w1[0] + w2[0]) / 2}" y="${(w1[1] + w2[1]) / 2 + 27}" text-anchor="middle" fill="#385045" font-family="monospace" font-size="15">3.2 m</text><g fill="#253d33"><text x="54" y="827" font-family="Arial,sans-serif" font-size="43" font-weight="700" letter-spacing="-2">ALCOVE / 01</text><text x="54" y="861" font-family="monospace" font-size="15">A SMALL SPACE. YOUR PROPORTIONS.</text><text x="1146" y="850" text-anchor="end" font-family="monospace" font-size="15">3.2 × 2.6 × 2.5 m</text></g></svg>`;
const directory = new URL('../public/resources/projects/parametric-spaces/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('alcove.svg', directory), svg);
console.log(`Generated original Alcove preview: ${Buffer.byteLength(svg)} bytes.`);
