/**
 * Страновой рейтинг и индекс гонки.
 *
 * Из рейтинга считается концентрация лидерства по Херфиндалю–Хиршману на
 * топ-N странах. Чем ровнее гонка, тем труднее договориться и тем ниже потолок
 * эффективности митигации (ТЗ §6.2).
 *
 *   доля_i = балл_i / Σ(баллы топ-N)
 *   HHI    = Σ доля_i²                  ∈ [1/N … 1]
 *   норм   = (HHI − 1/N) / (1 − 1/N)    ∈ [0 … 1]
 *   индекс = 1 − норм
 *
 * Пять равных игроков → индекс 1 → потолок митигации падает на 40%.
 * Один доминирующий → индекс 0 → митигация не трогается.
 */

import { clamp } from './time.ts';
import type { ComponentId, ComponentWeights, CountryScores } from './types.ts';

export const COMPONENTS: readonly ComponentId[] = [
  'research',
  'patents',
  'talent',
  'infrastructure',
  'investment',
  'commercialization',
  'governance',
];

export const EQUAL_WEIGHTS: ComponentWeights = Object.fromEntries(
  COMPONENTS.map((c) => [c, 1]),
) as ComponentWeights;

/** Взвешенный балл страны. Веса нормируются, так что их масштаб не важен. */
export function countryScore(country: CountryScores, weights: ComponentWeights): number {
  let total = 0;
  let weightSum = 0;
  for (const component of COMPONENTS) {
    const w = weights[component];
    if (w <= 0) continue;
    total += w * country.components[component];
    weightSum += w;
  }
  return weightSum > 0 ? total / weightSum : 0;
}

export function rankCountries(
  countries: readonly CountryScores[],
  weights: ComponentWeights,
): readonly { readonly iso3: string; readonly score: number }[] {
  return countries
    .map((c) => ({ iso3: c.iso3, score: countryScore(c, weights) }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Индекс гонки. `null`, если данных недостаточно, чтобы число что-то значило:
 * интерфейс в этом случае обязан показать прочерк, а не ноль.
 */
export function raceIndex(
  countries: readonly CountryScores[] | undefined,
  weights: ComponentWeights,
  topN: number,
): number | null {
  if (!countries || countries.length < 2) return null;

  const top = rankCountries(countries, weights)
    .slice(0, topN)
    .filter((c) => c.score > 0);
  if (top.length < 2) return null;

  const total = top.reduce((acc, c) => acc + c.score, 0);
  if (total <= 0) return null;

  const hhi = top.reduce((acc, c) => acc + (c.score / total) ** 2, 0);
  const floor = 1 / top.length;
  return clamp(1 - (hhi - floor) / (1 - floor), 0, 1);
}
