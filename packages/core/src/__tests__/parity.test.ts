/**
 * Паритет с прототипом.
 *
 * Прототип объявлен эталоном формул (ТЗ §0), поэтому перенос обязан
 * воспроизводить его число в число — в режиме `exact` и при интегрировании с
 * 2026 года, то есть при выключенных правках ADR-0002.
 *
 * Тест сравнивает новое ядро с дословным портом прототипа
 * (prototype-reference.ts), а не с записанными когда-то числами. Разница
 * существенная: записанные числа доказывают, что ядро не изменилось,
 * а этот тест — что оно с самого начала считает то же самое.
 */

import { describe, expect, it } from 'vitest';
import { loadModelConfig } from '@sc/data/node';
import { computeModel } from '../compute.ts';
import { probabilityAt } from '../risk.ts';
import type { Assumptions, ModelConfig } from '../types.ts';
import {
  refEff,
  refItemDate,
  refItemProgress,
  refMedianDate,
  refPAt,
  refRiskCurve,
  refTiers,
} from './prototype-reference.ts';

const NOW = Date.UTC(2026, 7, 17);
const BASE = loadModelConfig();

/** Конфиг с выключенными правками ADR-0002 — ровно поведение прототипа. */
function prototypeMode(config: ModelConfig): ModelConfig {
  return {
    ...config,
    tierSemantics: 'exact',
    constants: {
      ...config.constants,
      integration: { ...config.constants.integration, startFromNow: false },
      // Логарифмическая шкала часов — сознательная правка (ADR-0005);
      // паритет проверяется против прототипной линейной.
      doomsday: { ...config.constants.doomsday, scale: 'linear' as const },
    },
  };
}

const CONFIG = prototypeMode(BASE);
const ANCHOR = CONFIG.anchors[0]!;
const T0 = ANCHOR.at;
const H0 = ANCHOR.horizonMinutes;
const PRESETS = Object.entries(BASE.presets);

/** Относительное расхождение. Абсолютный ноль сравнивается напрямую. */
function relativeDiff(a: number, b: number): number {
  if (a === b) return 0;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b));
}

describe.each(PRESETS)('пресет «%s» совпадает с прототипом', (_name, preset: Assumptions) => {
  const result = computeModel({ assumptions: preset, config: CONFIG, now: NOW });
  const E = refEff(preset);
  const items = [...CONFIG.functions, ...CONFIG.industries];

  it('даты обгона по всем 30 строкам', () => {
    for (const item of items) {
      const expected = refItemDate(item, preset, E, T0, H0);
      const actual = result.items.find((r) => r.id === item.id && r.date === expected);
      // Идентификатор «software» есть и в видах деятельности, и в отраслях;
      // сверяем по значению, поэтому достаточно найти совпадение.
      expect(
        actual ?? result.items.filter((r) => r.id === item.id).map((r) => r.date),
        `строка ${item.id}`,
      ).toBeTruthy();
    }
  });

  it('даты обгона совпадают с точностью до миллисекунды', () => {
    const expected = items.map((i) => refItemDate(i, preset, E, T0, H0)).sort((a, b) => a - b);
    const actual = result.items.map((r) => r.date);
    expect(actual).toHaveLength(expected.length);
    for (let i = 0; i < expected.length; i++) {
      expect(relativeDiff(actual[i]!, expected[i]!)).toBeLessThan(1e-12);
    }
  });

  it('полосы прогресса', () => {
    for (const item of items) {
      const expected = refItemProgress(item, preset, E, T0, H0, NOW);
      const candidates = result.items.filter((r) => r.id === item.id).map((r) => r.progress);
      expect(candidates.some((p) => relativeDiff(p, expected) < 1e-12), `строка ${item.id}`).toBe(
        true,
      );
    }
  });

  const refCurves = refTiers(CONFIG).map((t) =>
    refRiskCurve(t, preset, E, T0, H0, NOW, 2026, 2100),
  );

  it('накопленные вероятности всех трёх ступеней по всем годам', () => {
    refCurves.forEach((expected, index) => {
      const actual = result.tiers[index]!.curve;
      expect(actual).toHaveLength(expected.length);
      for (let i = 0; i < expected.length; i++) {
        expect(actual[i]!.year).toBe(expected[i]!.y);
        expect(relativeDiff(actual[i]!.p, expected[i]!.p)).toBeLessThan(1e-12);
      }
    });
  });

  it('медианные даты ступеней', () => {
    refCurves.forEach((expected, index) => {
      const refMedian = refMedianDate(expected);
      const actual = result.tiers[index]!.medianDate;
      if (refMedian === null) {
        expect(actual).toBeNull();
      } else {
        expect(actual).not.toBeNull();
        expect(relativeDiff(actual!, refMedian)).toBeLessThan(1e-12);
      }
    });
  });

  it('вероятность события любого уровня', () => {
    // Прототип: 1 − Π(1 − Pᵢ). Ядро складывает интенсивности.
    // Тождество, но проверить его — весь смысл упражнения.
    const first = refCurves[0]!;
    for (let i = 0; i < first.length; i++) {
      const expected = 1 - refCurves.reduce((acc, c) => acc * (1 - c[i]!.p), 1);
      expect(relativeDiff(result.anyLevel.curve[i]!.p, expected)).toBeLessThan(1e-9);
    }
  });

  it('математическое ожидание к 2050 году', () => {
    let deaths = 0;
    let usd = 0;
    refTiers(CONFIG).forEach((t, index) => {
      const p = refPAt(refCurves[index]!, 2050);
      deaths += p * Math.sqrt(t.deaths[0] * t.deaths[1]);
      usd += p * Math.sqrt(t.usd[0] * t.usd[1]);
    });
    expect(relativeDiff(result.expected.deaths, deaths)).toBeLessThan(1e-12);
    expect(relativeDiff(result.expected.usd, usd)).toBeLessThan(1e-12);
  });

  it('часы судного дня', () => {
    const pGlobal = refPAt(refCurves[2]!, 2100);
    const minutes = Math.max(0.2, 15 * (1 - pGlobal));
    expect(relativeDiff(result.doomsday.minutesToMidnight, minutes)).toBeLessThan(1e-12);
  });

  it('дата сингулярности как перцентиль по разбивке', () => {
    const all = items.map((i) => refItemDate(i, preset, E, T0, H0)).sort((a, b) => a - b);
    const idx = Math.min(all.length - 1, Math.ceil((all.length * preset.singularityPct) / 100) - 1);
    expect(relativeDiff(result.singularity.date!, all[Math.max(0, idx)]!)).toBeLessThan(1e-12);
  });
});

describe('логарифмическое пространство ничего не меняет численно', () => {
  it('на крайнем ускорении прототип переполняется, а ядро — нет', () => {
    // Минимальное удвоение × минимальное трение × два ускоряющих триггера.
    const extreme: Assumptions = {
      ...BASE.presets.doomsday!,
      doublingDays: BASE.ranges.doublingDays.min,
      friction: BASE.ranges.friction.min,
      triggers: new Set(['selfimp', 'jump']),
    };
    const result = computeModel({ assumptions: extreme, config: CONFIG, now: NOW });

    // Прототип считал бы H = 320 · 2^(…) и на 2100 год ушёл бы в Infinity.
    const D = result.effective.doublingDays;
    expect(D).toBeLessThan(20);
    const H2100 = 320 * Math.pow(2, (Date.UTC(2100, 0, 1) - T0) / (86400000 * D));
    expect(H2100).toBe(Number.POSITIVE_INFINITY);

    // Ядро работает с логарифмом и остаётся конечным.
    for (const tier of result.tiers) {
      for (const point of tier.curve) expect(Number.isFinite(point.p)).toBe(true);
    }
    for (const item of result.items) {
      expect(Number.isFinite(item.date)).toBe(true);
      expect(Number.isFinite(item.progress)).toBe(true);
    }
    expect(Number.isFinite(result.expected.deaths)).toBe(true);
    expect(Number.isFinite(probabilityAt(result.tiers[2]!.ownCurve, 2100))).toBe(true);
  });
});
