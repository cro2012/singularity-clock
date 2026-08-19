/**
 * Локали сервиса.
 *
 * Сейчас язык один. Механизм оставлен целиком — форматирование чисел, дат и
 * склонений нужно и при одном языке, а добавление второго сводится к словарю
 * и записи здесь, без правок компонентов (ТЗ §12).
 */
export const LOCALES = ['en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
