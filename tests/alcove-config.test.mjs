import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAlcove,
  DEFAULT_CONFIG,
  DIMENSIONS,
  formatLength,
  layoutFor,
  normalizeConfig,
  quoteFor,
} from '../src/features/space-configurator/alcove-config.ts';

test('all selectable dimensions produce finite parts, constant posts, and a fixed-size reference table', () => {
  let cases = 0;
  for (let width = 24; width <= 48; width++)
    for (let depth = 20; depth <= 36; depth++)
      for (let height = 22; height <= 30; height++) {
        const config = {
          ...DEFAULT_CONFIG,
          width: width / 10,
          depth: depth / 10,
          height: height / 10,
          heater: true,
          light: true,
        };
        const parts = buildAlcove(config);
        assert.equal(parts.filter((part) => part.name === 'post').length, 4);
        parts
          .filter((part) => part.name === 'post')
          .forEach((part) => {
            assert.equal(part.size[0], 0.085);
            assert.equal(part.size[2], 0.085);
          });
        assert.deepEqual(parts.find((part) => part.name === 'tabletop').size, [0.74, 0.045, 0.56]);
        parts.forEach((part) => {
          assert.ok(part.size.every((value) => Number.isFinite(value) && value > 0));
          assert.ok(part.position.every(Number.isFinite));
        });
        const counts = {};
        parts.forEach((part) => {
          const key = `${part.shape}:${part.material}`;
          counts[key] = (counts[key] ?? 0) + 1;
        });
        assert.ok(
          Object.values(counts).every((count) => count <= 128),
          'instance pool capacity',
        );
        cases++;
      }
  assert.equal(cases, 3825);
});

test('size changes regenerate the canopy count and preserve even spacing', () => {
  const small = { ...DEFAULT_CONFIG, depth: 2 },
    large = { ...DEFAULT_CONFIG, depth: 3.6 };
  assert.ok(layoutFor(large).roofCount > layoutFor(small).roofCount);
  for (const config of [small, large]) {
    const blades = buildAlcove(config).filter((part) => part.name === 'canopy blade');
    for (let i = 1; i < blades.length; i++)
      assert.ok(
        Math.abs(blades[i].position[2] - blades[i - 1].position[2] - layoutFor(config).roofPitch) <
          1e-10,
      );
  }
});

test('every dimension increases the estimate monotonically', () => {
  for (const [key, range] of Object.entries(DIMENSIONS)) {
    let previous = 0;
    for (let step = Math.round(range.min * 10); step <= Math.round(range.max * 10); step++) {
      const quote = quoteFor({ ...DEFAULT_CONFIG, [key]: step / 10 });
      assert.ok(quote.total > previous);
      assert.equal(
        quote.total,
        quote.items.reduce((sum, item) => sum + item.amount, 0),
      );
      previous = quote.total;
    }
  }
});

test('accessory state changes both actual geometry and exact price increments', () => {
  const base = quoteFor(DEFAULT_CONFIG).total;
  for (const [heater, light, delta] of [
    [true, false, 280],
    [false, true, 160],
    [true, true, 440],
  ]) {
    const config = { ...DEFAULT_CONFIG, heater, light };
    const parts = buildAlcove(config);
    assert.equal(
      parts.some((part) => part.name === 'heater body'),
      heater,
    );
    assert.equal(
      parts.some((part) => part.name === 'light diffuser'),
      light,
    );
    assert.equal(quoteFor(config).total - base, delta);
  }
});

test('units and bounds are deterministic, including imperial inch carry', () => {
  assert.equal(formatLength(3.6576, 'imperial'), '12′ 0″');
  assert.equal(formatLength(3.2, 'metric'), '3.2 m');
  const config = normalizeConfig({
    ...DEFAULT_CONFIG,
    width: Infinity,
    depth: 99,
    height: -2,
    angle: 100,
  });
  assert.equal(config.width, 2.4);
  assert.equal(config.depth, 3.6);
  assert.equal(config.height, 2.2);
  assert.equal(config.angle, 65);
});
