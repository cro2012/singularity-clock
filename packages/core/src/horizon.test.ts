import { describe, expect, it } from 'vitest';
import {
  anchorFrom,
  dateForHorizon,
  dateForLog2Horizon,
  doublingsSince,
  horizonAt,
  log2HorizonAt,
  type Trend,
} from './horizon.ts';
import { DAY_MS, YEAR_DAYS } from './time.ts';

const ANCHOR = anchorFrom(Date.UTC(2025, 10, 24), 320);
const straight = (doublingDays: number): Trend => ({
  anchor: ANCHOR,
  doublingDays,
  bendPctPerYear: 0,
});
const bent = (doublingDays: number, bendPctPerYear: number): Trend => ({
  anchor: ANCHOR,
  doublingDays,
  bendPctPerYear,
});

describe('экстраполяция горизонта', () => {
  it('в опорной точке даёт опорный горизонт', () => {
    expect(horizonAt(ANCHOR.at, straight(131))).toBeCloseTo(320, 9);
  });

  it('за одно время удвоения горизонт удваивается', () => {
    const t = ANCHOR.at + 131 * DAY_MS;
    expect(horizonAt(t, straight(131))).toBeCloseTo(640, 6);
  });

  it('дата достижения порога обратна экстраполяции', () => {
    const t = dateForHorizon(9600, straight(131));
    expect(horizonAt(t, straight(131))).toBeCloseTo(9600, 6);
  });

  it('не переполняется на минимально достижимом удвоении до 2100 года', () => {
    // 60 дн. × трение 0,5 × 0,70 (самоулучшение) × 0,82 (скачок) ≈ 17,2 дн.
    const fastest = 60 * 0.5 * 0.7 * 0.82;
    const l2 = log2HorizonAt(Date.UTC(2100, 0, 1), straight(fastest));
    expect(Number.isFinite(l2)).toBe(true);
    expect(l2).toBeGreaterThan(1000);
  });
});

describe('изгиб тренда', () => {
  it('нулевой изгиб тождествен прямой', () => {
    for (const days of [10, 100, 1000, 10000, -500]) {
      expect(doublingsSince(days, straight(131))).toBeCloseTo(days / 131, 12);
    }
  });

  it('на границе ветвей нет разрыва', () => {
    // Возле r = 1 логарифм теряет точность, поэтому ветка выбирается по
    // близости к единице, а не по равенству. Слева и справа от этой границы
    // значения обязаны сходиться, иначе ползунок дёргал бы результат на
    // ровном месте. Порог сравнения — 1e-9 в долях процента за год.
    const days = 4000;
    const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
    const flat = doublingsSince(days, straight(131));
    // Сравнение относительное: значение порядка тридцати, и абсолютный допуск
    // здесь измерял бы не разрыв, а величину самой функции.
    expect(rel(doublingsSince(days, bent(131, 9e-10)), flat)).toBeLessThan(1e-8);
    expect(rel(doublingsSince(days, bent(131, 1.1e-9)), flat)).toBeLessThan(1e-8);
  });

  it('замедление уменьшает набранные удвоения, ускорение увеличивает', () => {
    const days = 3 * YEAR_DAYS;
    const slow = doublingsSince(days, bent(131, 10));
    const flat = doublingsSince(days, straight(131));
    const fast = doublingsSince(days, bent(131, -5));
    expect(slow).toBeLessThan(flat);
    expect(fast).toBeGreaterThan(flat);
  });

  it('замедление упирается в потолок Y / (D · ln r)', () => {
    const trend = bent(131, 10);
    const ceiling = YEAR_DAYS / (131 * Math.log(1.1));
    expect(doublingsSince(1e9, trend)).toBeCloseTo(ceiling, 6);
    expect(doublingsSince(1e12, trend)).toBeLessThanOrEqual(ceiling);
  });

  it('порог выше плато не достигается никогда', () => {
    const trend = bent(131, 25);
    const ceiling = YEAR_DAYS / (131 * Math.log(1.25));
    const unreachable = ANCHOR.log2Horizon + ceiling + 1;
    expect(dateForLog2Horizon(unreachable, trend)).toBe(Number.POSITIVE_INFINITY);
    // Ровно на потолке — тоже никогда: он достигается лишь в пределе.
    expect(dateForLog2Horizon(ANCHOR.log2Horizon + ceiling, trend)).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  it('обратная функция остаётся обратной при любом изгибе', () => {
    for (const bend of [-8, -3, 0, 5, 12, 27]) {
      const trend = bent(131, bend);
      for (const target of [400, 2000, 9600, 60000]) {
        const t = dateForLog2Horizon(Math.log2(target), trend);
        if (!Number.isFinite(t)) continue;
        expect(Math.pow(2, log2HorizonAt(t, trend))).toBeCloseTo(target, 4);
      }
    }
  });

  it('прошлое считается тем же выражением и остаётся конечным', () => {
    const trend = bent(131, 15);
    const past = log2HorizonAt(ANCHOR.at - 2 * YEAR_DAYS * DAY_MS, trend);
    expect(Number.isFinite(past)).toBe(true);
    expect(past).toBeLessThan(ANCHOR.log2Horizon);
    const back = dateForLog2Horizon(past, trend);
    expect(back).toBeCloseTo(ANCHOR.at - 2 * YEAR_DAYS * DAY_MS, -4);
  });

  it('ни при каких аргументах не возвращает NaN', () => {
    for (const bend of [-10, -1, 0, 1, 30]) {
      for (const days of [-100000, -1, 0, 1, 100000, 1e9]) {
        expect(Number.isNaN(doublingsSince(days, bent(60, bend)))).toBe(false);
      }
      for (const l2 of [-50, 0, 8.3, 100, 5000]) {
        expect(Number.isNaN(dateForLog2Horizon(l2, bent(300, bend)))).toBe(false);
      }
    }
  });
});
