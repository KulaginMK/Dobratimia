import { describe, expect, test } from '@jest/globals';
import { COVERED_MS, DONE_MS, FIRE_MS, FLAME_LAYERS, bandOf, bandTop, durationOf, flameEdge } from './fire';

const BACK = FLAME_LAYERS[0];

describe('огонь после «Отпустить»', () => {
  test('в момент смены экрана и ±100 мс вокруг задний слой закрывает экран сплошным телом', () => {
    for (const ms of [COVERED_MS - 100, COVERED_MS, COVERED_MS + 100]) {
      const top = bandTop(ms / FIRE_MS, bandOf(BACK));
      expect(top + BACK.tongues).toBeLessThanOrEqual(0);
      expect(top + BACK.tongues + BACK.body).toBeGreaterThanOrEqual(1);
    }
  });

  test('слой начинает под экраном, уходит за верх целиком, и огонь кончается, когда ушли все слои', () => {
    expect(bandTop(0, bandOf(BACK))).toBe(1);
    expect(bandTop(1, bandOf(BACK)) + bandOf(BACK)).toBeCloseTo(0);
    expect(durationOf(BACK)).toBe(FIRE_MS);
    for (const layer of FLAME_LAYERS) expect(layer.delayMs + durationOf(layer)).toBeLessThanOrEqual(DONE_MS);
  });

  test('языки не вылезают за свою SVG: их не обрежет', () => {
    let seed = 1;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (const height of [100, 400]) {
      const ys = flameEdge(412, height, random)
        .replace(/[A-Z]/g, ' ')
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter((_, i) => i % 2 === 1);
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...ys)).toBeLessThanOrEqual(height);
    }
  });
});
