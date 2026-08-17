import { describe, expect, it } from 'vitest';
import { anchorFrom, dateForHorizon, horizonAt, log2HorizonAt } from './horizon.ts';
import { DAY_MS } from './time.ts';

const ANCHOR = anchorFrom(Date.UTC(2025, 10, 24), 320);

describe('экстраполяция горизонта', () => {
  it('в опорной точке даёт опорный горизонт', () => {
    expect(horizonAt(ANCHOR.at, ANCHOR, 131)).toBeCloseTo(320, 9);
  });

  it('за одно время удвоения горизонт удваивается', () => {
    const t = ANCHOR.at + 131 * DAY_MS;
    expect(horizonAt(t, ANCHOR, 131)).toBeCloseTo(640, 6);
  });

  it('дата достижения порога обратна экстраполяции', () => {
    const t = dateForHorizon(9600, ANCHOR, 131);
    expect(horizonAt(t, ANCHOR, 131)).toBeCloseTo(9600, 6);
  });

  it('не переполняется на минимально достижимом удвоении до 2100 года', () => {
    // 60 дн. × трение 0,5 × 0,70 (самоулучшение) × 0,82 (скачок) ≈ 17,2 дн.
    const fastest = 60 * 0.5 * 0.7 * 0.82;
    const l2 = log2HorizonAt(Date.UTC(2100, 0, 1), ANCHOR, fastest);
    expect(Number.isFinite(l2)).toBe(true);
    expect(l2).toBeGreaterThan(1000);
  });
});
