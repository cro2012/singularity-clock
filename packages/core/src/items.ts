/**
 * Даты обгона по видам деятельности и отраслям.
 *
 * дата = дата(коэф · порог · надёжность) + лаг · множитель_группы
 *
 * Коэффициент сложности говорит, во сколько раз более длинную цепочку
 * рассуждений требует область относительно программной инженерии; лаг
 * внедрения — сколько лет уходит на железо, капитал, доверие и регуляторов
 * после того, как способность технически появилась.
 */

import { dateForLog2Horizon, log2HorizonAt, type Anchor } from './horizon.ts';
import { clamp, YEAR_MS } from './time.ts';
import type { Assumptions, EffectiveParams, Item, ItemResult, ModelConstants } from './types.ts';

export interface ItemContext {
  readonly anchor: Anchor;
  readonly assumptions: Assumptions;
  readonly effective: EffectiveParams;
  readonly constants: ModelConstants;
  readonly now: number;
}

/** log₂ горизонта, при котором область считается пройденной. */
function requiredLog2(item: Item, ctx: ItemContext): number {
  return Math.log2(item.m * ctx.assumptions.targetMinutes * ctx.effective.reliabilityFactor);
}

/** Лаг внедрения в миллисекундах с учётом группового множителя триггеров. */
function lagMs(item: Item, ctx: ItemContext): number {
  const groupMultiplier = item.group === undefined ? 1 : ctx.effective.groupMultipliers[item.group];
  return item.lag * groupMultiplier * YEAR_MS;
}

export function itemResult(item: Item, ctx: ItemContext): ItemResult {
  const { anchor, constants, now } = ctx;
  const doublingDays = ctx.effective.doublingDays;

  const log2Required = requiredLog2(item, ctx);
  const capabilityDate = dateForLog2Horizon(log2Required, anchor, doublingDays);
  const lag = lagMs(item, ctx);
  const date = capabilityDate + lag;

  // Полоса прогресса: 12 удвоений «разбега» до требования, затем оставшийся
  // хвост съедает лаг внедрения. Иначе строка с большим лагом упиралась бы
  // в 100% задолго до того, как область реально закрыта.
  const window = constants.progressWindowDoublings;
  let progress = (log2HorizonAt(now, anchor, doublingDays) - log2Required + window) / window;

  if (progress >= 1 && lag > 0) {
    const passed = clamp((now - capabilityDate) / lag, 0, 1);
    const base = constants.progressLagTailBase;
    progress = base + (1 - base) * passed;
  }

  return {
    id: item.id,
    date,
    progress: clamp(progress, 0, 1),
    passed: date <= now,
  };
}
