/**
 * Обёртка острова «Countries».
 *
 * Конфиг подставляется здесь, а не приходит пропом из Astro: пропы острова
 * сериализуются в атрибут HTML, и полный ModelConfig весил бы 12 КБ на каждой
 * странице каждой локали. Внутри компонента он попадает в JS-бандл — один раз
 * и с кешированием между страницами.
 */

import { CountriesScreen } from '@sc/ui';
import type { Locale } from '@sc/i18n';
import { MODEL_CONFIG } from '../model-config.ts';
import { COUNTRY_DATASET } from '@sc/data/countries';

export function Countries({ locale, now }: { locale: Locale; now: number }) {
  return <CountriesScreen config={MODEL_CONFIG} locale={locale} now={now} countries={COUNTRY_DATASET.countries} provisional={COUNTRY_DATASET.provisional} />;
}
