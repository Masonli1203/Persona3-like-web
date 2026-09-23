/** Original portfolio concept. All dimensions are metres; prices are fictional USD. */
export type Finish = 'graphite' | 'chalk' | 'clay';
export type AlcoveConfig = {
  width: number;
  depth: number;
  height: number;
  angle: number;
  finish: Finish;
  heater: boolean;
  light: boolean;
};

export const DEFAULT_CONFIG: AlcoveConfig = {
  width: 3.2,
  depth: 2.6,
  height: 2.5,
  angle: 25,
  finish: 'graphite',
  heater: false,
  light: false,
};
export const DIMENSIONS = {
  width: { label: 'Width', min: 2.4, max: 4.8, step: 0.1 },
  depth: { label: 'Depth', min: 2, max: 3.6, step: 0.1 },
  height: { label: 'Height', min: 2.2, max: 3, step: 0.1 },
} as const;
export const FINISHES = {
  graphite: { label: 'Graphite', color: '#343e42' },
  chalk: { label: 'Chalk', color: '#d9d4c5' },
  clay: { label: 'Clay', color: '#9f5945' },
} as const;

export function normalizeConfig(config: AlcoveConfig): AlcoveConfig {
  const snap = (value: number, min: number, max: number, step: number) =>
    Number(
      (
        Math.round(Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)) / step) * step
      ).toFixed(4),
    );
  return {
    ...config,
    width: snap(config.width, 2.4, 4.8, 0.1),
    depth: snap(config.depth, 2, 3.6, 0.1),
    height: snap(config.height, 2.2, 3, 0.1),
    angle: snap(config.angle, 0, 65, 1),
    finish: config.finish in FINISHES ? config.finish : 'graphite',
    heater: Boolean(config.heater),
    light: Boolean(config.light),
  };
}

export function layoutFor(config: AlcoveConfig) {
  const { width, depth } = normalizeConfig(config);
  const roofCount = Math.ceil((depth - 0.2) / 0.17);
  return {
    roofCount,
    roofPitch: (depth - 0.2) / roofCount,
    screenCount: Math.floor(((width - 0.4) * 0.52) / 0.115),
    deckCount: Math.ceil((width + 0.24) / 0.16),
    seatCount: Math.max(2, Math.floor((width - 0.65) / 0.72)),
    postSize: 0.085,
  };
}

export function quoteFor(config: AlcoveConfig) {
  const c = normalizeConfig(config);
  const layout = layoutFor(c);
  const items = [
    {
      label: 'Structure & joinery',
      amount: Math.round(720 + (2 * c.width + 2 * c.depth + 4 * c.height) * 38),
    },
    {
      label: 'Deck & built-in seating',
      amount: Math.round(c.width * c.depth * 115 + (c.width - 0.4) * 145),
    },
    { label: 'Timber canopy', amount: Math.round(layout.roofCount * (c.width - 0.1) * 18) },
    { label: 'Radiant heater', amount: c.heater ? 280 : 0 },
    { label: 'Linear light', amount: c.light ? 160 : 0 },
  ];
  return { items, total: items.reduce((sum, item) => sum + item.amount, 0) };
}

export function formatLength(metres: number, units: 'metric' | 'imperial') {
  if (units === 'metric') return `${metres.toFixed(1)} m`;
  const inches = Math.round(metres / 0.0254);
  return `${Math.floor(inches / 12)}′ ${inches % 12}″`;
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
export const formatPrice = (value: number) => priceFormatter.format(value);

type Vector = [number, number, number];
export type PartMaterial =
  | 'frame'
  | 'wood'
  | 'woodEdge'
  | 'deck'
  | 'fabric'
  | 'fabricEdge'
  | 'accent'
  | 'dark'
  | 'metal'
  | 'stone'
  | 'light'
  | 'heat'
  | 'leaf'
  | 'ceramic';
export type Part = {
  name: string;
  shape: 'box' | 'softBox' | 'cylinder' | 'sphere' | 'pot' | 'torus';
  material: PartMaterial;
  position: Vector;
  size: Vector;
  rotation?: Vector;
};

/** Regenerates individual lengths and repeated parts, never scales a finished model. */
export function buildAlcove(config: AlcoveConfig): Part[] {
  const c = normalizeConfig(config);
  const { width: w, depth: d, height: h } = c;
  const { roofCount, roofPitch, screenCount, deckCount, seatCount, postSize: p } = layoutFor(c);
  const parts: Part[] = [];
  const add = (
    name: string,
    material: PartMaterial,
    position: Vector,
    size: Vector,
    rotation?: Vector,
    shape: Part['shape'] = 'box',
  ) => parts.push({ name, material, position, size, rotation, shape });
  // Floating timber platform, four slender portals, visible feet and collars.
  add('platform base', 'frame', [0, 0.075, 0], [w + 0.24, 0.15, d + 0.24]);
  const deckPitch = (w + 0.24) / deckCount;
  for (let i = 0; i < deckCount; i++)
    add(
      'deck board',
      'deck',
      [-w / 2 - 0.12 + deckPitch * (i + 0.5), 0.166, 0],
      [deckPitch - 0.006, 0.032, d + 0.24],
    );
  for (const z of [-1, 1])
    add(
      'recessed timber fascia',
      'woodEdge',
      [0, 0.105, z * (d / 2 + 0.122)],
      [w + 0.21, 0.066, 0.012],
    );
  for (const x of [-1, 1])
    add('platform edge reveal', 'dark', [x * (w / 2 + 0.124), 0.133, 0], [0.008, 0.012, d + 0.24]);
  for (const x of [-1, 1])
    for (const z of [-1, 1]) {
      const px = x * (w / 2 - p / 2),
        pz = z * (d / 2 - p / 2);
      add('post', 'frame', [px, (0.18 + h - 0.1) / 2, pz], [p, h - 0.28, p]);
      add('foot', 'dark', [px, 0.19, pz], [0.13, 0.02, 0.13]);
      add('joint collar', 'frame', [px, h - 0.25, pz], [0.105, 0.13, 0.105]);
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          add(
            'base fixing',
            'metal',
            [px + sx * 0.048, 0.203, pz + sz * 0.048],
            [0.014, 0.008, 0.014],
            undefined,
            'cylinder',
          );
      add('post cap', 'metal', [px, h - 0.102, pz], [0.087, 0.007, 0.087]);
    }
  for (const z of [-1, 1])
    add('width beam', 'frame', [0, h - 0.16, z * (d / 2 - p / 2)], [w, 0.18, p]);
  for (const x of [-1, 1])
    add('depth beam', 'frame', [x * (w / 2 - p / 2), h - 0.16, 0], [p, 0.18, d - 2 * p]);
  // Timber blades have a constant section and evenly redistributed spacing.
  for (let i = 0; i < roofCount; i++) {
    const z = -(d - 0.2) / 2 + roofPitch * (i + 0.5);
    add(
      'canopy blade',
      i % 5 === 0 ? 'woodEdge' : 'wood',
      [0, h - 0.08, z],
      [w - 0.13, 0.034, 0.145],
      [(-c.angle * Math.PI) / 180, 0, 0],
    );
    for (const x of [-1, 1])
      add(
        'canopy pivot',
        'metal',
        [x * (w / 2 - 0.078), h - 0.08, z],
        [0.022, 0.04, 0.022],
        [0, 0, Math.PI / 2],
        'cylinder',
      );
  }
  // A partial vertical screen and an integrated bench make this an original garden room.
  const screenWidth = (w - 0.4) * 0.52;
  for (let i = 0; i < screenCount; i++) {
    add(
      'back screen slat',
      i % 4 === 0 ? 'woodEdge' : 'wood',
      [-w / 2 + 0.2 + ((i + 0.5) * screenWidth) / screenCount, (h + 0.1) / 2, -d / 2 + 0.105],
      [0.055, h - 0.36, 0.04],
    );
  }
  for (const y of [0.48, h - 0.4])
    add(
      'screen backing rail',
      'frame',
      [-w / 2 + 0.2 + screenWidth / 2, y, -d / 2 + 0.075],
      [screenWidth, 0.035, 0.035],
    );
  add('bench frame', 'frame', [0, 0.51, -d / 2 + 0.45], [w - 0.4, 0.11, 0.62]);
  for (const x of [-1, 1])
    add('bench support', 'frame', [x * (w / 2 - 0.42), 0.34, -d / 2 + 0.45], [0.055, 0.34, 0.5]);
  add('bench timber edge', 'wood', [0, 0.58, -d / 2 + 0.45], [w - 0.34, 0.035, 0.66]);
  for (const x of [-1, 1]) {
    add(
      'timber armrest',
      'wood',
      [x * (w / 2 - 0.22), 0.88, -d / 2 + 0.45],
      [0.09, 0.055, 0.66],
      undefined,
      'softBox',
    );
    for (const z of [-0.22, 0.22])
      add(
        'armrest support',
        'frame',
        [x * (w / 2 - 0.22), 0.735, -d / 2 + 0.45 + z],
        [0.025, 0.26, 0.025],
      );
  }
  const seatWidth = (w - 0.5) / seatCount;
  for (let i = 0; i < seatCount; i++) {
    const x = -(w - 0.5) / 2 + seatWidth * (i + 0.5);
    add(
      'cushion welt',
      'fabricEdge',
      [x, 0.644, -d / 2 + 0.45],
      [seatWidth - 0.018, 0.04, 0.578],
      undefined,
      'softBox',
    );
    add(
      'seat cushion',
      'fabric',
      [x, 0.661, -d / 2 + 0.45],
      [seatWidth - 0.025, 0.13, 0.57],
      undefined,
      'softBox',
    );
    add(
      'back cushion',
      'fabric',
      [x, 0.9, -d / 2 + 0.24],
      [seatWidth - 0.035, 0.38, 0.13],
      [-0.12, 0, 0],
      'softBox',
    );
  }
  for (const side of [-1, 1])
    add(
      'loose pillow',
      side < 0 ? 'accent' : 'fabricEdge',
      [(side * (w - 0.97)) / 2, 0.91, -d / 2 + 0.5],
      [0.38, 0.38, 0.15],
      [-0.2, side * 0.08, side * -0.15],
      'softBox',
    );
  add(
    'folded throw',
    'accent',
    [-w / 2 + 0.75, 0.737, -d / 2 + 0.57],
    [0.34, 0.022, 0.4],
    undefined,
    'softBox',
  );
  add('throw drape', 'accent', [-w / 2 + 0.75, 0.65, -d / 2 + 0.767], [0.34, 0.17, 0.014]);
  // Fixed-size table provides a stable scale reference as the room changes.
  add('tabletop', 'woodEdge', [0.22, 0.6, 0.3], [0.74, 0.045, 0.56], undefined, 'softBox');
  for (const x of [-0.29, 0.29])
    for (const z of [-0.2, 0.2])
      add('table leg', 'frame', [0.22 + x, 0.39, 0.3 + z], [0.035, 0.42, 0.035]);
  add('table stretcher', 'frame', [0.22, 0.3, 0.3], [0.59, 0.025, 0.025]);
  add('book cover', 'accent', [0.08, 0.63, 0.28], [0.2, 0.006, 0.28], [0, 0.15, 0]);
  add('book', 'ceramic', [0.08, 0.645, 0.28], [0.19, 0.024, 0.27], [0, 0.15, 0]);
  add('cup', 'ceramic', [0.43, 0.67, 0.39], [0.075, 0.09, 0.075], undefined, 'pot');
  add('cup handle', 'ceramic', [0.475, 0.674, 0.39], [0.055, 0.055, 0.026], undefined, 'torus');
  add(
    'nesting table top',
    'stone',
    [0.77, 0.465, 0.67],
    [0.34, 0.035, 0.34],
    undefined,
    'cylinder',
  );
  add(
    'nesting table pedestal',
    'stone',
    [0.77, 0.32, 0.67],
    [0.16, 0.27, 0.16],
    undefined,
    'cylinder',
  );
  const plantX = -w / 2 + 0.4,
    plantZ = d / 2 - 0.42;
  add('planter', 'ceramic', [plantX, 0.39, plantZ], [0.35, 0.42, 0.35], undefined, 'pot');
  add('soil', 'dark', [plantX, 0.602, plantZ], [0.29, 0.008, 0.29], undefined, 'cylinder');
  add(
    'plant stem',
    'woodEdge',
    [plantX, 0.88, plantZ],
    [0.014, 0.61, 0.014],
    undefined,
    'cylinder',
  );
  for (let i = 0; i < 11; i++) {
    const a = i * 2.4,
      y = 0.73 + i * 0.036,
      spread = 0.13 + (i % 3) * 0.025;
    add(
      'foliage',
      'leaf',
      [plantX + Math.cos(a) * spread, y, plantZ + Math.sin(a) * spread],
      [0.3, 0.075, 0.14],
      [0.28, -a, Math.sin(a) * 0.45],
      'sphere',
    );
  }
  if (c.light) {
    add('light housing', 'dark', [0, h - 0.265, d / 2 - 0.11], [w - 0.32, 0.04, 0.05]);
    add('light diffuser', 'light', [0, h - 0.287, d / 2 - 0.11], [w - 0.36, 0.01, 0.036]);
  }
  if (c.heater) {
    // Suspended panel on the side portal, intentionally distinct from client accessories.
    add('heater bracket', 'frame', [w / 2 - 0.12, h - 0.34, -0.05], [0.06, 0.24, 0.52]);
    add(
      'heater body',
      'dark',
      [w / 2 - 0.22, h - 0.45, -0.05],
      [0.18, 0.11, 0.78],
      [0, 0, -0.18],
      'softBox',
    );
    for (const z of [-0.45, 0.35])
      add(
        'heater end cap',
        'metal',
        [w / 2 - 0.22, h - 0.45, z],
        [0.18, 0.1, 0.016],
        [0, 0, -0.18],
        'softBox',
      );
    add('heater element', 'heat', [w / 2 - 0.23, h - 0.51, -0.05], [0.13, 0.012, 0.67]);
    for (let i = 0; i < 12; i++)
      add(
        'heater grille',
        'frame',
        [w / 2 - 0.23, h - 0.522, -0.37 + i * 0.057],
        [0.15, 0.012, 0.009],
      );
  }
  return parts;
}
