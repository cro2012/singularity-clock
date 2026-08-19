/**
 * Локальная чувствительность результата к каждому допущению.
 *
 * Смысл сервиса в том, что дата зависит от допущений сильнее, чем от исходной
 * цифры METR. Но пока это утверждение написано словами, пользователь крутит
 * не те ползунки: крайние положения времени удвоения двигают глобальный риск
 * на пять процентных пунктов, а отказ контроля — на пятьдесят пять.
 *
 * Считается локально, вокруг текущей точки, а не по всему диапазону: важно,
 * что двигает результат ЗДЕСЬ, при уже выставленных допущениях.
 */

import { computeModel } from './compute.ts';
import { probabilityAt } from './risk.ts';
import { clamp } from './time.ts';
import type { ComputeArgs, ModelResult, RangedAssumption } from './types.ts';

export interface SensitivityEntry {
  readonly id: RangedAssumption;
  /** Метрика при сдвиге вниз и вверх. */
  readonly low: number;
  readonly high: number;
  /** Размах: насколько метрика меняется от края к краю пробы. */
  readonly spread: number;
}

/** Доля диапазона ползунка, на которую он сдвигается в каждую сторону. */
export const SENSITIVITY_STEP = 0.2;

/** Метрика по умолчанию: вероятность глобальной катастрофы к концу горизонта. */
export function globalRiskMetric(result: ModelResult, horizonYear: number): number {
  const global = result.tiers[result.tiers.length - 1];
  return global ? probabilityAt(global.ownCurve, horizonYear) : 0;
}

export function sensitivity(
  args: ComputeArgs,
  metric: (result: ModelResult) => number = (r) =>
    globalRiskMetric(r, args.config.constants.doomsday.horizonYear),
): readonly SensitivityEntry[] {
  const keys = Object.keys(args.config.ranges) as RangedAssumption[];

  return keys
    .map((id) => {
      const range = args.config.ranges[id];
      const step = (range.max - range.min) * SENSITIVITY_STEP;
      const at = (value: number) =>
        metric(
          computeModel({
            ...args,
            assumptions: { ...args.assumptions, [id]: clamp(value, range.min, range.max) },
          }),
        );

      const low = at(args.assumptions[id] - step);
      const high = at(args.assumptions[id] + step);
      return { id, low, high, spread: Math.abs(high - low) };
    })
    .sort((a, b) => b.spread - a.spread);
}
