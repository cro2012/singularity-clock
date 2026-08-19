/**
 * Форматирование чисел, дат и обратного отсчёта.
 *
 * Ядро отдаёт только числа; всё, что касается запятой как десятичного
 * разделителя, склонений и названий месяцев, живёт здесь. Склонения — через
 * Intl.PluralRules, а не через остаток от деления: в прототипе была рукописная
 * функция, и она не переживёт третий язык.
 */

import type { Locale } from './locales.ts';

const DAY_MS = 86_400_000;
const YEAR_DAYS = 365.2425;

export interface PluralForms {
  readonly one?: string;
  readonly few?: string;
  readonly many?: string;
  readonly other: string;
}

export function pluralize(locale: Locale, n: number, forms: PluralForms): string {
  const rule = new Intl.PluralRules(locale).select(n);
  return forms[rule as keyof PluralForms] ?? forms.other;
}

export function formatNumber(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatMonthYear(locale: Locale, ms: number): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(ms));
}

export function formatFullDate(locale: Locale, ms: number): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(ms));
}

export function formatPercent(locale: Locale, fraction: number, digits = 1): string {
  return formatNumber(locale, fraction, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Компактная запись больших чисел: 6,6 млрд, 84 трлн. */
export function formatCompact(locale: Locale, value: number): string {
  return formatNumber(locale, value, {
    notation: 'compact',
    maximumFractionDigits: value >= 1e10 ? 0 : 1,
  });
}

export function formatUsd(locale: Locale, value: number): string {
  return formatNumber(locale, value, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: value >= 1e13 ? 0 : 1,
  });
}

/**
 * Ставит точку в конце, если её там ещё нет.
 *
 * Нужно потому, что длинная русская дата уже заканчивается точкой («25 июля
 * 2032 г.»), а английская — нет. Своя точка после первой даёт «г..».
 */
export function endSentence(text: string): string {
  return text.endsWith('.') ? text : `${text}.`;
}

const HORIZON_UNITS: Record<Locale, { min: string; hour: string; day: string; month: string; year: string }> = {
  en: { min: 'min', hour: 'h', day: 'd', month: 'mo', year: 'yr' },
};

/**
 * Горизонт задачи в человеческих единицах.
 *
 * Считается рабочее время, а не календарное: рабочий день — 8 часов, месяц —
 * четыре рабочие недели. Иначе «1 год = 115 200 минут» читается как ошибка.
 */
export function formatHorizon(locale: Locale, minutes: number): string {
  const u = HORIZON_UNITS[locale];
  const one = (value: number, unit: string, digits = 1) =>
    `${formatNumber(locale, value, { maximumFractionDigits: digits })} ${unit}`;

  if (!Number.isFinite(minutes)) return '∞';
  if (minutes < 60) return one(minutes, u.min, minutes < 10 ? 1 : 0);
  if (minutes < 480) return one(minutes / 60, u.hour);
  if (minutes < 9600) return one(minutes / 480, u.day);
  if (minutes < 115200) return one(minutes / 9600, u.month);
  return one(minutes / 115200, u.year);
}

export interface Countdown {
  readonly kind: 'future' | 'past' | 'never';
  /** Крупная строка: «14 лет 212 дней». */
  readonly headline: string;
  /** Тикающая часть ЧЧ:ММ:СС. Пустая, если отсчитывать нечего. */
  readonly ticker: string;
}

const YEARS: Record<Locale, PluralForms> = {
  en: { one: 'year', other: 'years' },
};

const DAYS: Record<Locale, PluralForms> = {
  en: { one: 'day', other: 'days' },
};

const pad2 = (n: number): string => String(Math.floor(n)).padStart(2, '0');

/**
 * Обратный отсчёт. `target === null` означает, что событие не наступает в
 * пределах модели — это не ноль и не бесконечность, а отказ отвечать.
 */
export function formatCountdown(
  locale: Locale,
  target: number | null,
  now: number,
  labels: { readonly never: string; readonly past: string },
): Countdown {
  if (target === null) return { kind: 'never', headline: labels.never, ticker: '' };

  const remaining = target - now;
  if (remaining <= 0) return { kind: 'past', headline: labels.past, ticker: '' };

  const totalDays = remaining / DAY_MS;
  const years = Math.floor(totalDays / YEAR_DAYS);
  const days = Math.floor(totalDays - years * YEAR_DAYS);
  const rest = remaining - (years * YEAR_DAYS + days) * DAY_MS;

  const dayPart = `${formatNumber(locale, days)} ${pluralize(locale, days, DAYS[locale])}`;
  const headline =
    years > 0
      ? `${formatNumber(locale, years)} ${pluralize(locale, years, YEARS[locale])} ${dayPart}`
      : dayPart;

  const ticker = [
    pad2((rest / 3_600_000) % 24),
    pad2((rest / 60_000) % 60),
    pad2((rest / 1000) % 60),
  ].join(':');

  return { kind: 'future', headline, ticker };
}
