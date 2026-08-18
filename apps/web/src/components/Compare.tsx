/**
 * Обёртка острова «Сравнение». Конфиг подставляется здесь, а не приходит
 * пропом Astro: пропы острова сериализуются в HTML.
 */

import { CompareScreen } from '@sc/ui';
import type { Locale } from '@sc/i18n';
import { MODEL_CONFIG } from '../model-config.ts';

export function Compare({ locale, now }: { locale: Locale; now: number }) {
  return <CompareScreen config={MODEL_CONFIG} locale={locale} now={now} />;
}
