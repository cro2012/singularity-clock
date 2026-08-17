/**
 * Интенсивность катастрофического риска и накопленная вероятность.
 *
 *   λᵢ(t) = (умысел·wᵢ + отказ_контроля·uᵢ) · cᵢ(t) · d(t) · (1 − митигация·eᵢ)
 *           · aᵢ(t) · множитель_триггеров
 *   Λᵢ(T) = Σ λᵢ по годам от старта до T
 *   Pᵢ(T) = 1 − exp(−Λᵢ(T))
 *
 * Множитель затухания aᵢ в ТЗ §2.5 потерян, в прототипе есть — берём как в
 * прототипе (docs/model-review.md §1.1). Без него любая кривая уходит в 100%
 * и «окно уязвимости» перестаёт что-либо значить.
 *
 * Ступени вложены: кривая уровня — это «событие не ниже этого уровня»
 * (ADR-0002). Сложение интенсивностей гарантирует вложенность арифметически.
 */

import { dateForLog2Horizon, log2HorizonAt, type Anchor } from './horizon.ts';
import { YEAR_MS, yearAnchor, yearOf } from './time.ts';
import type {
  Assumptions,
  Curve,
  EffectiveParams,
  ModelConfig,
  TierId,
  TierResult,
  TierSpec,
} from './types.ts';

export interface RiskContext {
  readonly anchor: Anchor;
  readonly assumptions: Assumptions;
  readonly effective: EffectiveParams;
  readonly config: ModelConfig;
  readonly now: number;
}

/** Годы, по которым идёт интегрирование. */
export function integrationYears(config: ModelConfig, now: number): readonly number[] {
  const { integration } = config.constants;
  // Начинаем с текущего года, а не с зашитой константы: иначе через несколько
  // лет модель накапливала бы риск за годы, которые заведомо пережиты
  // (ADR-0002 §2).
  const start = integration.startFromNow ? yearOf(now) : integration.startYear;
  const years: number[] = [];
  for (let y = start; y <= integration.endYear; y++) years.push(y);
  return years;
}

/** Момент внутри года, в который берётся отсчёт. */
function momentOf(year: number, config: ModelConfig): number {
  const { yearAnchorMonth, yearAnchorDay } = config.constants.integration;
  return yearAnchor(year, yearAnchorMonth, yearAnchorDay);
}

/**
 * Накопленная интенсивность Λᵢ по годам для одной ступени.
 * Возвращает массив, выровненный с `years`.
 */
export function cumulativeHazard(
  tier: TierSpec,
  years: readonly number[],
  ctx: RiskContext,
): readonly number[] {
  const { anchor, assumptions, effective, config, now } = ctx;
  const { constants } = config;
  const doublingDays = effective.doublingDays;

  const log2Threshold = Math.log2(tier.capabilityThresholdMinutes);

  // Насыщение способности: момент, когда горизонт превысит порог в
  // saturationMultiple раз, то есть c ≈ 0,92. После него мир начинает
  // приспосабливаться и риск затухает с периодом «окна уязвимости».
  const saturationDate = dateForLog2Horizon(
    log2Threshold + Math.log2(constants.saturationMultiple),
    anchor,
    doublingDays,
  );

  const intent = tier.maliceWeight * effective.malice + tier.controlFailWeight * effective.alignFail;
  const mitigated = 1 - effective.mitigation * tier.mitigationCeiling;
  const tierMultiplier = effective.tierMultipliers[tier.id];

  const out: number[] = [];
  let cumulative = 0;

  for (const year of years) {
    const t = momentOf(year, config);

    // Способность: логистика от логарифма горизонта относительно порога.
    // На краях даёт ровно 0 или 1 без NaN — экспонента насыщается.
    const capability =
      1 / (1 + Math.exp(-constants.capabilitySlope * (log2HorizonAt(t, anchor, doublingDays) - log2Threshold)));

    // Подключённость к критическим системам: насыщающаяся экспонента от сегодня.
    const elapsedYears = Math.max(0, (t - now) / YEAR_MS);
    const dependency =
      effective.dep0 + (1 - effective.dep0) * (1 - Math.exp(-elapsedYears / assumptions.tauYears));

    // Затухание после насыщения способностей — «время опасностей».
    const sinceSaturation = Math.max(0, (t - saturationDate) / YEAR_MS);
    const adaptation = Math.exp(-sinceSaturation / assumptions.adaptWindowYears);

    const lambda = intent * capability * dependency * mitigated * adaptation * tierMultiplier;
    cumulative += Math.max(0, lambda);
    out.push(cumulative);
  }

  return out;
}

function curveFrom(years: readonly number[], hazard: readonly number[]): Curve {
  return years.map((year, i) => ({ year, p: 1 - Math.exp(-hazard[i]!) }));
}

/**
 * Кривые всех ступеней.
 *
 * Ступени в конфиге идут по возрастанию порога — это проверяет схема, — поэтому
 * «не ниже уровня i» складывает интенсивности с индексами от i и выше.
 */
export function tierCurves(ctx: RiskContext): {
  readonly years: readonly number[];
  readonly tiers: readonly TierResult[];
  readonly anyLevel: Curve;
} {
  const { config } = ctx;
  const years = integrationYears(config, ctx.now);
  const hazards = config.tiers.map((tier) => cumulativeHazard(tier, years, ctx));

  const suffixSum = (from: number): readonly number[] =>
    years.map((_, i) => hazards.slice(from).reduce((acc, h) => acc + h[i]!, 0));

  const tiers: TierResult[] = config.tiers.map((tier, index) => {
    const own = curveFrom(years, hazards[index]!);
    const curve =
      config.tierSemantics === 'nested' ? curveFrom(years, suffixSum(index)) : own;
    return {
      id: tier.id,
      curve,
      ownCurve: own,
      medianDate: medianCrossing(curve, config),
    };
  });

  // Событие любого уровня — это сложение всех интенсивностей. Тождественно
  // прототипному 1 − Π(1 − Pᵢ); при вложенных ступенях совпадает с нижней.
  const anyLevel = curveFrom(years, suffixSum(0));

  return { years, tiers, anyLevel };
}

/** Линейная интерполяция года, в котором кривая пересекает 0,5. */
export function medianCrossing(curve: Curve, config: ModelConfig): number | null {
  for (let i = 0; i < curve.length; i++) {
    const current = curve[i]!;
    if (current.p < 0.5) continue;

    const previous = i > 0 ? curve[i - 1]! : { year: current.year - 1, p: 0 };
    const span = current.p - previous.p;
    const fraction = span > 0 ? (0.5 - previous.p) / span : 0;
    return momentOf(previous.year, config) + fraction * YEAR_MS;
  }
  return null;
}

/** Значение кривой в заданном году; за пределами — ближайшее известное. */
export function probabilityAt(curve: Curve, year: number): number {
  if (curve.length === 0) return 0;
  const first = curve[0]!;
  if (year <= first.year) return first.p;
  const exact = curve.find((p) => p.year === year);
  return exact ? exact.p : curve[curve.length - 1]!.p;
}

export type { TierId };
