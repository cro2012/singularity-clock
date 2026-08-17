/**
 * Применение триггеров к допущениям.
 *
 * Триггеры — это множители: разгоняющие делают числа хуже, успокаивающие лучше.
 * Единственное исключение — митигация, которая прибавляется в процентных
 * пунктах, а не умножается: договор с верификацией добавляет возможности, а не
 * усиливает существующие.
 */

import type { Assumptions, EffectiveParams, ModelConfig } from './types.ts';
import { clamp } from './time.ts';

const MULTIPLICATIVE = [
  'doubling',
  'align',
  'dep',
  'local',
  'regional',
  'global',
  'phys',
  'sci',
  'soc',
] as const;

type MultiplicativeKey = (typeof MULTIPLICATIVE)[number];
type Multipliers = Record<MultiplicativeKey, number> & { mitigationAdd: number };

export function triggerMultipliers(
  assumptions: Assumptions,
  config: ModelConfig,
): Readonly<Multipliers> {
  const m: Multipliers = {
    doubling: 1,
    align: 1,
    dep: 1,
    local: 1,
    regional: 1,
    global: 1,
    phys: 1,
    sci: 1,
    soc: 1,
    mitigationAdd: 0,
  };

  for (const spec of config.triggers) {
    if (!assumptions.triggers.has(spec.id)) continue;
    for (const key of MULTIPLICATIVE) {
      const value = spec.effects[key];
      if (value !== undefined) m[key] *= value;
    }
    if (spec.effects.mitigationAdd !== undefined) m.mitigationAdd += spec.effects.mitigationAdd;
  }

  return m;
}

/**
 * Сводит допущения и триггеры в параметры, которыми пользуется весь остальной
 * расчёт.
 *
 * `raceIndex` приходит снаружи и применяется только при включённом
 * переключателе геополитики. Это допущение автора модели, а не установленный
 * факт, и по умолчанию оно выключено (ТЗ §6.2).
 */
export function effectiveParams(
  assumptions: Assumptions,
  config: ModelConfig,
  raceIndex: number | null,
): EffectiveParams {
  const m = triggerMultipliers(assumptions, config);
  const { constants } = config;

  const mitigationBase = clamp(assumptions.mitigationPct / 100 + m.mitigationAdd, 0, 1);
  const geopoliticsFactor =
    assumptions.geopolitics !== false && raceIndex !== null
      ? 1 - constants.geopolitics.mitigationPenalty * raceIndex
      : 1;

  return {
    doublingDays: assumptions.doublingDays * assumptions.friction * m.doubling,
    malice: clamp(assumptions.malicePct / 100, 0, 1),
    alignFail: clamp((assumptions.alignFailPct / 100) * m.align, 0, 1),
    mitigation: clamp(mitigationBase * geopoliticsFactor, 0, 1),
    dep0: clamp((assumptions.dep0Pct / 100) * m.dep, 0, constants.maxDependency),
    tierMultipliers: { local: m.local, regional: m.regional, global: m.global },
    groupMultipliers: { phys: m.phys, sci: m.sci, soc: m.soc },
    reliabilityFactor: assumptions.reliability === 80 ? constants.reliability80Factor : 1,
  };
}
