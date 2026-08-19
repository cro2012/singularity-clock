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

import { dateForLog2Horizon, log2HorizonAt, type Trend } from './horizon.ts';
import { clamp, YEAR_MS } from './time.ts';
import type {
  Assumptions,
  EffectiveParams,
  Item,
  ItemKind,
  ItemResult,
  ModelConstants,
} from './types.ts';

export interface ItemContext {
  readonly trend: Trend;
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

export function itemResult(item: Item, kind: ItemKind, ctx: ItemContext): ItemResult {
  const { trend, constants, now } = ctx;

  const log2Required = requiredLog2(item, ctx);
  // При положительном изгибе горизонт упирается в плато, и часть строк не
  // закрывается никогда. Это содержательный ответ, а не сбой: +Infinity
  // доезжает до интерфейса и печатается как «never in this model».
  const capabilityDate = dateForLog2Horizon(log2Required, trend);
  const lag = lagMs(item, ctx);
  const date = Number.isFinite(capabilityDate) ? capabilityDate + lag : null;

  // Полоса прогресса: 12 удвоений «разбега» до требования, затем оставшийся
  // хвост съедает лаг внедрения. Иначе строка с большим лагом упиралась бы
  // в 100% задолго до того, как область реально закрыта.
  const window = constants.progressWindowDoublings;
  let progress = (log2HorizonAt(now, trend) - log2Required + window) / window;

  if (progress >= 1 && lag > 0) {
    const passed = clamp((now - capabilityDate) / lag, 0, 1);
    const base = constants.progressLagTailBase;
    progress = base + (1 - base) * passed;
  }

  return {
    id: item.id,
    kind,
    date,
    progress: clamp(progress, 0, 1),
    passed: date !== null && date <= now,
  };
}
