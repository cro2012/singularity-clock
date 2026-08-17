/**
 * Локализация. Язык определяется префиксом пути, не заголовком браузера:
 * ссылка обязана вести туда, куда её отправили (ТЗ §12).
 *
 * Склонения — через Intl.PluralRules, а не через остаток от деления.
 * В прототипе была рукописная функция plural; она здесь не воспроизводится.
 */

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Формы для Intl.PluralRules. Ключи — категории CLDR, которые есть в локали. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>;

/**
 * Выбирает форму слова по числу.
 *
 * pluralize('ru', 2, { one: 'год', few: 'года', many: 'лет' }) → 'года'
 */
export function pluralize(locale: Locale, n: number, forms: PluralForms): string {
  const rule = new Intl.PluralRules(locale).select(n);
  const form = forms[rule] ?? forms.other;
  if (form === undefined) {
    throw new Error(`Нет формы «${rule}» для числа ${n} в локали ${locale}`);
  }
  return form;
}

export function formatNumber(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
