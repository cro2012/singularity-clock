/**
 * Сборка полного результата модели.
 *
 * Функция чистая: те же аргументы — тот же результат, включая `now`.
 * Форматирования здесь нет и быть не может — только числа. Запятая как
 * десятичный разделитель, склонения и названия месяцев живут в @sc/i18n.
 */

import { effectiveParams } from './effective.ts';
import { anchorFrom, anchorOptionFor } from './horizon.ts';
import { itemResult, type ItemContext } from './items.ts';
import { medianCrossing, probabilityAt, tierCurves, type RiskContext } from './risk.ts';
import { raceIndex } from './countries.ts';
import type { AlertLevel, ComputeArgs, ItemResult, ModelConstants, ModelResult } from './types.ts';

/** Геометрическое среднее диапазона: честнее арифметического на логарифмах. */
function geometricMean([low, high]: readonly [number, number]): number {
  return Math.sqrt(low * high);
}

/**
 * Положение стрелки от 0 до 1.
 *
 * Линейная шкала при 4% даёт 14,4 минуты, при 20% — 11,95. То есть на всём
 * интервале, где спорят живые люди, стрелка почти неподвижна, а главный
 * визуальный элемент сервиса ничего не показывает. Логарифмическая шкала
 * отдаёт фиксированный ход за каждый порядок вероятности.
 */
function clockPosition(p: number, constants: ModelConstants): number {
  const { scale, probabilityFloor, decades } = constants.doomsday;
  if (scale === 'linear') return p;
  if (p <= probabilityFloor) return 0;
  return Math.min(1, Math.log10(p / probabilityFloor) / decades);
}

function alertLevelFor(p: number, thresholds: ModelConstants['alertThresholds']): AlertLevel {
  const [calm, watchful, serious] = thresholds;
  if (p < calm) return 'calm';
  if (p < watchful) return 'watchful';
  if (p < serious) return 'serious';
  return 'critical';
}

export function computeModel(args: ComputeArgs): ModelResult {
  const { assumptions, config, now, countries } = args;
  const { constants } = config;

  const race =
    assumptions.geopolitics === false
      ? null
      : raceIndex(countries, assumptions.geopolitics.weights, constants.geopolitics.topN);

  const effective = effectiveParams(assumptions, config, race);
  const metrAnchor = anchorOptionFor(config, assumptions.anchorId);
  const anchor = anchorFrom(metrAnchor.at, metrAnchor.horizonMinutes);

  // --- строки разбивки ---
  const itemCtx: ItemContext = { anchor, assumptions, effective, constants, now };
  const items: readonly ItemResult[] = [
    ...config.functions.map((item) => itemResult(item, 'function', itemCtx)),
    ...config.industries.map((item) => itemResult(item, 'industry', itemCtx)),
  ].sort((a, b) => a.date - b.date);

  // --- сингулярность: перцентиль по датам, а не отдельная формула ---
  // Головной счётчик выводится из разбивки, поэтому в него всегда можно ткнуть
  // и увидеть, из чего он собран (ТЗ §2.4).
  const percentileIndex = Math.max(
    0,
    Math.min(items.length - 1, Math.ceil((items.length * assumptions.singularityPct) / 100) - 1),
  );
  const singularityDate = items[percentileIndex]?.date ?? null;
  const passedShare = items.length > 0 ? items.filter((i) => i.passed).length / items.length : 0;

  // --- лестница катастроф ---
  const riskCtx: RiskContext = { anchor, assumptions, effective, config, now };
  const { tiers, anyLevel } = tierCurves(riskCtx);

  // --- математическое ожидание ---
  // По вероятности события ровно этого уровня, иначе глобальная катастрофа
  // была бы посчитана трижды. Именно exactCurve, а не ownCurve: собственная
  // кривая ступени не знает про конкурирующий риск и переоценивает мелкие
  // уровни (см. TierResult.exactCurve).
  let deaths = 0;
  let usd = 0;
  for (const [index, spec] of config.tiers.entries()) {
    const p = probabilityAt(tiers[index]!.exactCurve, constants.expectedAtYear);
    deaths += p * geometricMean(spec.deaths);
    usd += p * geometricMean(spec.usd);
  }

  // --- часы судного дня ---
  const globalTier = tiers[tiers.length - 1]!;
  const pGlobal = probabilityAt(globalTier.ownCurve, constants.doomsday.horizonYear);
  const position = clockPosition(pGlobal, constants);
  const minutesToMidnight = Math.max(
    constants.doomsday.floorMinutes,
    constants.doomsday.scaleMinutes * (1 - position),
  );

  return {
    effective,
    singularity: {
      date: singularityDate,
      passedShare,
      percentile: assumptions.singularityPct,
    },
    items,
    tiers,
    // При вложенных ступенях это ровно нижняя ступень лестницы; при 'exact'
    // считается отдельно, потому что там кривые независимы.
    anyLevel: {
      curve: anyLevel,
      medianDate: medianCrossing(anyLevel, config),
    },
    expected: { deaths, usd, atYear: constants.expectedAtYear },
    doomsday: {
      minutesToMidnight,
      pGlobal,
      position,
      alertLevel: alertLevelFor(pGlobal, constants.alertThresholds),
    },
    raceIndex: race,
  };
}
