/**
 * Экстраполяция горизонта автономной задачи.
 *
 * Ядро нигде не хранит сам горизонт H — оно хранит log₂H. Причина:
 * при минимально достижимом эффективном удвоении (60 дн. × трение 0,5 ×
 * два ускоряющих триггера ≈ 17 дн.) до 2100 года набегает около 1590
 * удвоений, а 2^1590 = Infinity. Работа в логарифме снимает переполнение
 * конструктивно. Обоснование: docs/adr/0002-model-semantics.md §3.
 */

import { DAY_MS } from './time.ts';
import type { AnchorOption, ModelConfig } from './types.ts';

/** Опорная точка: момент времени и логарифм горизонта в этот момент. */
export interface Anchor {
  readonly at: number;
  readonly log2Horizon: number;
}

/**
 * Выбранная опорная точка METR.
 *
 * Неизвестный идентификатор — это не ошибка вызова, а старая ссылка или
 * якорь, выбывший из набора при обновлении данных. Возвращаем нулевой:
 * он по контракту всегда значение по умолчанию.
 */
export function anchorOptionFor(config: ModelConfig, id: string): AnchorOption {
  return config.anchors.find((a) => a.id === id) ?? config.anchors[0]!;
}

export function anchorFrom(at: number, horizonMinutes: number): Anchor {
  return { at, log2Horizon: Math.log2(horizonMinutes) };
}

/** log₂ горизонта в момент t при эффективном времени удвоения в днях. */
export function log2HorizonAt(t: number, anchor: Anchor, doublingDays: number): number {
  return anchor.log2Horizon + (t - anchor.at) / (doublingDays * DAY_MS);
}

/** Момент, когда log₂ горизонта достигнет заданного значения. */
export function dateForLog2Horizon(
  log2Horizon: number,
  anchor: Anchor,
  doublingDays: number,
): number {
  return anchor.at + (log2Horizon - anchor.log2Horizon) * doublingDays * DAY_MS;
}

/** Момент, когда горизонт достигнет заданной длины в минутах. */
export function dateForHorizon(minutes: number, anchor: Anchor, doublingDays: number): number {
  return dateForLog2Horizon(Math.log2(minutes), anchor, doublingDays);
}

/**
 * Горизонт в минутах. Единственное место, где происходит потенцирование —
 * подсказка графика, где значение заведомо мало. В расчётах не использовать.
 */
export function horizonAt(t: number, anchor: Anchor, doublingDays: number): number {
  return Math.pow(2, log2HorizonAt(t, anchor, doublingDays));
}
