/**
 * Экстраполяция горизонта автономной задачи.
 *
 * Ядро нигде не хранит сам горизонт H — оно хранит log₂H. Причина:
 * при минимально достижимом эффективном удвоении (60 дн. × трение 0,5 ×
 * два ускоряющих триггера ≈ 17 дн.) до 2100 года набегает около 1590
 * удвоений, а 2^1590 = Infinity. Работа в логарифме снимает переполнение
 * конструктивно. Обоснование: docs/adr/0002-model-semantics.md §3.
 *
 * Время удвоения не обязано быть постоянным. Прямая в логарифме — сама по
 * себе сильное допущение, и до появления изгиба скептик не мог выразить
 * позицию «тренд выйдет на плато»: любое значение ползунка всё равно давало
 * бесконечный рост, просто медленнее. Обоснование: docs/adr/0007-trend-bend.md.
 */

import { DAY_MS, YEAR_DAYS } from './time.ts';
import type { AnchorOption, ModelConfig } from './types.ts';

/** Опорная точка: момент времени и логарифм горизонта в этот момент. */
export interface Anchor {
  readonly at: number;
  readonly log2Horizon: number;
}

/**
 * Кривая роста горизонта целиком: откуда считаем, как быстро и как этот
 * темп меняется со временем.
 *
 * Собран в один объект намеренно. Пока это были три отдельных аргумента,
 * добавление третьего означало бы обойти все вызовы вручную и где-нибудь
 * забыть — а забытый изгиб выглядел бы как рабочая программа с тихо
 * неправильным ответом.
 */
export interface Trend {
  readonly anchor: Anchor;
  readonly doublingDays: number;
  /**
   * На сколько процентов время удвоения меняется за год.
   * 0 — прямая в логарифме; больше нуля — замедление и плато;
   * меньше нуля — ускорение.
   */
  readonly bendPctPerYear: number;
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

/** Основание изгиба: во сколько раз время удвоения множится за год. */
function ratio(trend: Trend): number {
  return 1 + trend.bendPctPerYear / 100;
}

/**
 * Сколько удвоений набежало за τ дней от опорной точки.
 *
 *   D(u) = D · r^(u / Y),  где r — годовой множитель, Y — дней в году
 *   Φ(τ) = ∫₀^τ du / D(u) = Y · (1 − r^(−τ/Y)) / (D · ln r)
 *
 * При r = 1 интеграл вырождается в τ/D — ровно прежняя прямая. Проверка идёт
 * не на равенство единице, а на близость: ln r возле нуля теряет точность, и
 * при 0,01% в год разница с прямой заведомо меньше ошибки самой модели.
 *
 * При r > 1 значение ограничено сверху: Φ(∞) = Y / (D · ln r). Это и есть
 * плато — горизонт упирается в потолок, и часть порогов не достигается
 * никогда.
 */
export function doublingsSince(days: number, trend: Trend): number {
  const r = ratio(trend);
  if (Math.abs(r - 1) < 1e-9) return days / trend.doublingDays;
  const lnR = Math.log(r);
  return (YEAR_DAYS * (1 - Math.pow(r, -days / YEAR_DAYS))) / (trend.doublingDays * lnR);
}

/** log₂ горизонта в момент t. */
export function log2HorizonAt(t: number, trend: Trend): number {
  return trend.anchor.log2Horizon + doublingsSince((t - trend.anchor.at) / DAY_MS, trend);
}

/**
 * Момент, когда log₂ горизонта достигнет заданного значения.
 *
 * Возвращает +Infinity, если значение лежит выше плато: это не ошибка, а
 * содержательный ответ «в этом сценарии — никогда». Все потребители обязаны
 * его пережить; NaN не возвращается ни при каких аргументах.
 */
export function dateForLog2Horizon(log2Horizon: number, trend: Trend): number {
  const delta = log2Horizon - trend.anchor.log2Horizon;
  const r = ratio(trend);

  if (Math.abs(r - 1) < 1e-9) {
    return trend.anchor.at + delta * trend.doublingDays * DAY_MS;
  }

  const lnR = Math.log(r);
  const k = 1 - (delta * trend.doublingDays * lnR) / YEAR_DAYS;
  if (k <= 0) return Number.POSITIVE_INFINITY;

  const days = (-YEAR_DAYS * Math.log(k)) / lnR;
  return trend.anchor.at + days * DAY_MS;
}

/** Момент, когда горизонт достигнет заданной длины в минутах. */
export function dateForHorizon(minutes: number, trend: Trend): number {
  return dateForLog2Horizon(Math.log2(minutes), trend);
}

/**
 * Горизонт в минутах. Единственное место, где происходит потенцирование —
 * подсказка графика, где значение заведомо мало. В расчётах не использовать.
 */
export function horizonAt(t: number, trend: Trend): number {
  return Math.pow(2, log2HorizonAt(t, trend));
}
