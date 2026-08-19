/**
 * Свойства модели, которые обязаны держаться при любых допущениях (ТЗ §2.7).
 *
 * Здесь проверяется не «то же ли число, что вчера», а «может ли модель вообще
 * выдать бессмыслицу». Перебор крайних положений ползунков — буквальное
 * требование ТЗ; property-тесты добавляют к нему случайные точки внутри
 * диапазонов.
 */

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { loadModelConfig } from '@sc/data/node';
import { computeModel } from '../compute.ts';
import { anchorOptionFor } from '../horizon.ts';
import { probabilityAt } from '../risk.ts';
import type { Assumptions, ModelConfig, ModelResult, RangedAssumption } from '../types.ts';

const NOW = Date.UTC(2026, 7, 17);
const CONFIG = loadModelConfig();
const SECOND = 1000;

const RANGED: readonly RangedAssumption[] = [
  'doublingDays',
  'friction',
  'singularityPct',
  'malicePct',
  'alignFailPct',
  'mitigationPct',
  'dep0Pct',
  'tauYears',
  'adaptWindowYears',
];

/** Все числа результата, до которых может дотянуться интерфейс. */
function everyNumber(result: ModelResult): number[] {
  const out: number[] = [
    result.singularity.passedShare,
    result.expected.deaths,
    result.expected.usd,
    result.doomsday.minutesToMidnight,
    ...Object.values(result.effective.tierMultipliers),
    ...Object.values(result.effective.groupMultipliers),
    result.effective.doublingDays,
    result.effective.malice,
    result.effective.alignFail,
    result.effective.mitigation,
    result.effective.dep0,
  ];
  if (result.singularity.date !== null) out.push(result.singularity.date);
  if (result.anyLevel.medianDate !== null) out.push(result.anyLevel.medianDate);
  for (const item of result.items) out.push(item.date, item.progress);
  for (const tier of result.tiers) {
    if (tier.medianDate !== null) out.push(tier.medianDate);
    for (const p of tier.curve) out.push(p.p);
    for (const p of tier.ownCurve) out.push(p.p);
  }
  for (const p of result.anyLevel.curve) out.push(p.p);
  return out;
}

/**
 * Проверки без `expect`: перебор крайних положений — это десятки тысяч
 * прогонов, и вызов матчера на каждую точку кривой превращает секунды в минуты.
 * Здесь нужен быстрый предикат, а не красивый отчёт; отчёт даёт сообщение
 * исключения.
 */
function assertSane(result: ModelResult, label: string): void {
  for (const value of everyNumber(result)) {
    if (!Number.isFinite(value)) throw new Error(`${label}: не число — ${String(value)}`);
  }
  for (const item of result.items) {
    if (!(item.progress >= 0 && item.progress <= 1)) {
      throw new Error(`${label}: прогресс ${item.id} вне [0,1] — ${item.progress}`);
    }
  }
  for (const tier of result.tiers) {
    let previous = -1;
    for (const point of tier.curve) {
      if (!(point.p >= 0 && point.p <= 1)) {
        throw new Error(`${label} / ${tier.id}: P вне [0,1] в ${point.year} — ${point.p}`);
      }
      // Накопленная вероятность не убывает: это накопление, а не мгновенная.
      if (point.p + 1e-12 < previous) {
        throw new Error(`${label} / ${tier.id}: P убывает в ${point.year}`);
      }
      previous = point.p;
    }
  }
}

function withValues(values: Partial<Assumptions>): Assumptions {
  return { ...CONFIG.presets.base!, ...values };
}

describe('перебор крайних положений всех ползунков', () => {
  // 2⁹ сочетаний границ девяти ползунков × оба порога надёжности
  // × три состояния панели триггеров.
  const corners: Partial<Assumptions>[] = [];
  for (let mask = 0; mask < 1 << RANGED.length; mask++) {
    const combo: Record<string, number> = {};
    RANGED.forEach((key, bit) => {
      const range = CONFIG.ranges[key];
      combo[key] = mask & (1 << bit) ? range.max : range.min;
    });
    corners.push(combo as Partial<Assumptions>);
  }

  const triggerSets: readonly [string, ReadonlySet<string>][] = [
    ['без триггеров', new Set()],
    ['все триггеры', new Set(CONFIG.triggers.map((t) => t.id))],
    ['только успокаивающие', new Set(CONFIG.triggers.filter((t) => t.calming).map((t) => t.id))],
  ];

  it.each(triggerSets)('%s: ни одного NaN и Infinity', (label, triggers) => {
    let checked = 0;
    for (const corner of corners) {
      for (const reliability of [50, 80] as const) {
        for (const target of CONFIG.targets) {
          const assumptions = withValues({
            ...corner,
            reliability,
            targetMinutes: target.minutes,
            triggers,
            anchorId: CONFIG.anchors[0]!.id,
          });
          assertSane(
            computeModel({ assumptions, config: CONFIG, now: NOW }),
            `${label} / ${JSON.stringify(corner)}`,
          );
          checked++;
        }
      }
    }
    // 2⁹ границ × 2 надёжности × 4 порога задачи.
    expect(checked).toBe(corners.length * 2 * CONFIG.targets.length);
  });
});

const assumptionsArb = (): fc.Arbitrary<Assumptions> =>
  fc
    .record({
      doublingDays: fc.double({ ...CONFIG.ranges.doublingDays, noNaN: true }),
      friction: fc.double({ ...CONFIG.ranges.friction, noNaN: true }),
      singularityPct: fc.double({ ...CONFIG.ranges.singularityPct, noNaN: true }),
      malicePct: fc.double({ ...CONFIG.ranges.malicePct, noNaN: true }),
      alignFailPct: fc.double({ ...CONFIG.ranges.alignFailPct, noNaN: true }),
      mitigationPct: fc.double({ ...CONFIG.ranges.mitigationPct, noNaN: true }),
      anchorId: fc.constantFrom(...CONFIG.anchors.map((a) => a.id)),
      dep0Pct: fc.double({ ...CONFIG.ranges.dep0Pct, noNaN: true }),
      tauYears: fc.double({ ...CONFIG.ranges.tauYears, noNaN: true }),
      adaptWindowYears: fc.double({ ...CONFIG.ranges.adaptWindowYears, noNaN: true }),
      reliability: fc.constantFrom(50 as const, 80 as const),
      targetMinutes: fc.constantFrom(...CONFIG.targets.map((t) => t.minutes)),
      triggers: fc
        .subarray(CONFIG.triggers.map((t) => t.id))
        .map((ids) => new Set(ids) as ReadonlySet<string>),
    })
    .map((r) => ({ ...r, geopolitics: false as const }));

const run = (assumptions: Assumptions, config: ModelConfig = CONFIG): ModelResult =>
  computeModel({ assumptions, config, now: NOW });

/** Отсутствие даты — это «позже 2100», а не «раньше всего». */
const asTime = (date: number | null): number => date ?? Number.POSITIVE_INFINITY;

describe('свойства', () => {
  it('случайные допущения не ломают модель', () => {
    fc.assert(
      fc.property(assumptionsArb(), (assumptions) => {
        assertSane(run(assumptions), 'случайные допущения');
      }),
      { numRuns: 300 },
    );
  });

  it('без умысла и без отказа контроля все вероятности строго нулевые', () => {
    fc.assert(
      fc.property(assumptionsArb(), (assumptions) => {
        const result = run({ ...assumptions, malicePct: 0, alignFailPct: 0 });
        for (const tier of result.tiers) {
          for (const point of tier.curve) expect(point.p).toBe(0);
          expect(tier.medianDate).toBeNull();
        }
        expect(result.anyLevel.medianDate).toBeNull();
        expect(result.expected.deaths).toBe(0);
        expect(result.doomsday.minutesToMidnight).toBe(
          CONFIG.constants.doomsday.scaleMinutes,
        );
      }),
      { numRuns: 100 },
    );
  });

  it('рост отказа контроля не отодвигает глобальную дату', () => {
    fc.assert(
      fc.property(assumptionsArb(), fc.double({ min: 0, max: 100, noNaN: true }), (a, extra) => {
        const higher = Math.max(a.alignFailPct, extra);
        const before = asTime(run(a).tiers[2]!.medianDate);
        const after = asTime(run({ ...a, alignFailPct: higher }).tiers[2]!.medianDate);
        expect(after).toBeLessThanOrEqual(before + SECOND);
      }),
      { numRuns: 200 },
    );
  });

  it('рост митигации не приближает ни одну дату катастрофы', () => {
    fc.assert(
      fc.property(assumptionsArb(), fc.double({ min: 0, max: 100, noNaN: true }), (a, extra) => {
        const higher = Math.max(a.mitigationPct, extra);
        const before = run(a);
        const after = run({ ...a, mitigationPct: higher });
        for (let i = 0; i < before.tiers.length; i++) {
          expect(asTime(after.tiers[i]!.medianDate)).toBeGreaterThanOrEqual(
            asTime(before.tiers[i]!.medianDate) - SECOND,
          );
        }
      }),
      { numRuns: 200 },
    );
  });

  it('рост трения отодвигает даты, которые ещё впереди', () => {
    // Оговорка «ещё впереди» существенна и не является поблажкой тесту.
    // Линия закреплена в опорной точке, поэтому большее трение делает наклон
    // положе: будущие пересечения уезжают вправо, а уже пройденные — глубже
    // в прошлое. Это верное поведение, и подпись к графику обязана его
    // объяснять (ТЗ §3: «линия закреплена в последней точке»).
    const items = [...CONFIG.functions, ...CONFIG.industries];

    fc.assert(
      fc.property(assumptionsArb(), (a) => {
        const before = run(a);
        const after = run({ ...a, friction: a.friction * 1.5 });
        const factor = before.effective.reliabilityFactor;
        // Закреплена именно та точка, которую выбрал сценарий: с другим
        // якорем «уже пройдено» проходит по другой границе.
        const anchorLog2 = Math.log2(anchorOptionFor(CONFIG, a.anchorId).horizonMinutes);

        for (const item of items) {
          const required = Math.log2(item.m * a.targetMinutes * factor);
          if (required <= anchorLog2) continue;

          const dateOf = (r: ModelResult, id: string) =>
            r.items.filter((x) => x.id === id).map((x) => x.date);
          const wasDates = dateOf(before, item.id);
          const nowDates = dateOf(after, item.id);
          for (let i = 0; i < wasDates.length; i++) {
            expect(Math.max(...nowDates)).toBeGreaterThanOrEqual(wasDates[i]! - SECOND);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('вложенность ступеней (ADR-0002)', () => {
  it('нижняя ступень никогда не ниже верхней', () => {
    fc.assert(
      fc.property(assumptionsArb(), (assumptions) => {
        const { tiers, anyLevel } = run(assumptions);
        for (let year = 0; year < tiers[0]!.curve.length; year++) {
          const local = tiers[0]!.curve[year]!.p;
          const regional = tiers[1]!.curve[year]!.p;
          const global = tiers[2]!.curve[year]!.p;
          expect(local + 1e-12).toBeGreaterThanOrEqual(regional);
          expect(regional + 1e-12).toBeGreaterThanOrEqual(global);
          // Головной счётчик — это ровно нижняя ступень лестницы.
          expect(Math.abs(anyLevel.curve[year]!.p - local)).toBeLessThan(1e-12);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('в режиме exact вложенность не гарантируется — ради этого правка и была', () => {
    // Контрпример из docs/model-review.md §2.1: нулевой умысел выключает вклад,
    // на который у нижней ступени приходится основной вес.
    const exact: ModelConfig = { ...CONFIG, tierSemantics: 'exact' };
    const assumptions = withValues({ malicePct: 0, alignFailPct: 90, mitigationPct: 50 });
    const { tiers } = run(assumptions, exact);
    const local = tiers[0]!.curve.at(-1)!.p;
    const global = tiers[2]!.curve.at(-1)!.p;
    expect(global).toBeGreaterThan(local);
  });
});

describe('индекс гонки', () => {
  const components = {
    research: 1,
    patents: 1,
    talent: 1,
    infrastructure: 1,
    investment: 1,
    commercialization: 1,
    governance: 1,
  };
  const weights = components;
  const country = (iso3: string, level: number) => ({
    iso3,
    components: Object.fromEntries(Object.keys(components).map((k) => [k, level])) as never,
  });

  const withGeo = (countries: ReturnType<typeof country>[]) =>
    computeModel({
      assumptions: { ...CONFIG.presets.base!, geopolitics: { weights } },
      config: CONFIG,
      now: NOW,
      countries,
    });

  it('пять равных игроков дают ровную гонку', () => {
    const result = withGeo(['a', 'b', 'c', 'd', 'e'].map((i) => country(i, 50)));
    expect(result.raceIndex).toBeCloseTo(1, 12);
  });

  it('один доминирующий игрок гонку почти обнуляет', () => {
    const result = withGeo([country('a', 100), ...['b', 'c', 'd', 'e'].map((i) => country(i, 0.01))]);
    expect(result.raceIndex).toBeLessThan(0.05);
  });

  it('ровная гонка опускает потолок митигации на заданный коэффициент', () => {
    const countries = ['a', 'b', 'c', 'd', 'e'].map((i) => country(i, 50));
    const off = computeModel({ assumptions: CONFIG.presets.base!, config: CONFIG, now: NOW, countries });
    const on = withGeo(countries);
    expect(on.effective.mitigation).toBeCloseTo(
      off.effective.mitigation * (1 - CONFIG.constants.geopolitics.mitigationPenalty),
      12,
    );
  });

  it('без данных по странам индекс равен null и ни на что не влияет', () => {
    const on = computeModel({
      assumptions: { ...CONFIG.presets.base!, geopolitics: { weights } },
      config: CONFIG,
      now: NOW,
    });
    expect(on.raceIndex).toBeNull();
    expect(on.effective.mitigation).toBe(
      computeModel({ assumptions: CONFIG.presets.base!, config: CONFIG, now: NOW }).effective
        .mitigation,
    );
  });
});

describe('вероятность события ровно этого уровня', () => {
  // Собственная кривая ступени (1 − exp(−Λᵢ)) считает и те миры, где заодно
  // случилась катастрофа крупнее, поэтому складывать её по ступеням нельзя.
  // Отдельная exactCurve появилась после того, как таблица тяжести показала
  // «ровно локальная — 53,9%» рядом с вложенными 67,7 и 29,9: разность
  // 67,7 − 29,9 = 37,8, и числа на одной странице друг другу противоречили.

  it('сумма по ступеням равна событию любого уровня', () => {
    fc.assert(
      fc.property(assumptionsArb(), (assumptions) => {
        const { tiers, anyLevel } = run(assumptions);
        for (let i = 0; i < anyLevel.curve.length; i++) {
          const sum = tiers.reduce((acc, t) => acc + t.exactCurve[i]!.p, 0);
          expect(Math.abs(sum - anyLevel.curve[i]!.p)).toBeLessThan(1e-12);
        }
      }),
      { numRuns: 60 },
    );
  });

  it('совпадает с разностью соседних вложенных кривых', () => {
    fc.assert(
      fc.property(assumptionsArb(), (assumptions) => {
        const { tiers } = run(assumptions);
        for (const [index, tier] of tiers.entries()) {
          const above = tiers[index + 1];
          for (let i = 0; i < tier.curve.length; i++) {
            const difference = tier.curve[i]!.p - (above ? above.curve[i]!.p : 0);
            expect(Math.abs(tier.exactCurve[i]!.p - difference)).toBeLessThan(1e-12);
          }
        }
      }),
      { numRuns: 60 },
    );
  });

  it('никогда не превышает собственную кривую ступени', () => {
    fc.assert(
      fc.property(assumptionsArb(), (assumptions) => {
        for (const tier of run(assumptions).tiers) {
          for (let i = 0; i < tier.curve.length; i++) {
            expect(tier.exactCurve[i]!.p).toBeGreaterThanOrEqual(0);
            expect(tier.exactCurve[i]!.p).toBeLessThanOrEqual(tier.ownCurve[i]!.p + 1e-12);
          }
        }
      }),
      { numRuns: 60 },
    );
  });

  it('при независимых ступенях совпадает с собственной кривой', () => {
    const independent: ModelConfig = { ...CONFIG, tierSemantics: 'exact' };
    for (const tier of computeModel({
      assumptions: CONFIG.presets.base!,
      config: independent,
      now: NOW,
    }).tiers) {
      expect(tier.exactCurve).toEqual(tier.ownCurve);
    }
  });
});

describe('часы судного дня', () => {
  // Минуты выражают положение стрелки, а не вероятность. При логарифмической
  // шкале обратный пересчёт 1 − минуты/15 даёт совсем другое число — главная
  // некоторое время показывала именно его и называла «оценкой риска».

  it('pGlobal — это вероятность глобальной катастрофы к горизонту', () => {
    fc.assert(
      fc.property(assumptionsArb(), (assumptions) => {
        const result = run(assumptions);
        const expected = probabilityAt(
          result.tiers[result.tiers.length - 1]!.ownCurve,
          CONFIG.constants.doomsday.horizonYear,
        );
        expect(result.doomsday.pGlobal).toBe(expected);
      }),
      { numRuns: 60 },
    );
  });

  it('на логарифмической шкале положение стрелки — не вероятность', () => {
    const { doomsday } = computeModel({
      assumptions: CONFIG.presets.base!,
      config: CONFIG,
      now: NOW,
    });
    const backDerived = 1 - doomsday.minutesToMidnight / CONFIG.constants.doomsday.scaleMinutes;
    expect(backDerived).toBeCloseTo(doomsday.position, 12);
    expect(Math.abs(backDerived - doomsday.pGlobal)).toBeGreaterThan(0.3);
  });

  it('на линейной шкале положение стрелки совпадает с вероятностью', () => {
    const linear: ModelConfig = {
      ...CONFIG,
      constants: {
        ...CONFIG.constants,
        doomsday: { ...CONFIG.constants.doomsday, scale: 'linear' },
      },
    };
    const { doomsday } = computeModel({ assumptions: CONFIG.presets.base!, config: linear, now: NOW });
    expect(doomsday.position).toBeCloseTo(doomsday.pGlobal, 12);
  });
});
