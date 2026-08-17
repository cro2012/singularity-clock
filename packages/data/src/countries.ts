/**
 * Страновой датасет.
 *
 * Он ручной по природе, а не временно: AI Index — годовой PDF, Tortoise —
 * публикация без API, OECD — разрозненные выгрузки. Автоматизировать нечего
 * (docs/architecture.md §3.4). Поэтому у файла есть флаг `provisional` и дата
 * сверки, и интерфейс обязан их показывать.
 */

import { z } from 'zod';
import type { ComponentId, CountryScores } from '@sc/core';
import raw from '../datasets/countries.json' with { type: 'json' };

const COMPONENT_IDS = [
  'research',
  'patents',
  'talent',
  'infrastructure',
  'investment',
  'commercialization',
  'governance',
] as const satisfies readonly ComponentId[];

const score = z.number().min(0).max(100);

export const countryDatasetSchema = z.object({
  provisional: z.boolean(),
  checkedAt: z.string().nullable(),
  note: z.string().min(1),
  sources: z
    .array(z.object({ id: z.string(), title: z.string(), url: z.string().url() }))
    .min(1),
  countries: z
    .array(
      z.object({
        iso3: z.string().length(3),
        components: z.object(
          Object.fromEntries(COMPONENT_IDS.map((id) => [id, score])) as Record<
            ComponentId,
            typeof score
          >,
        ),
      }),
    )
    .min(2),
});

export type CountryDataset = z.infer<typeof countryDatasetSchema> & {
  readonly countries: readonly CountryScores[];
};

export const COUNTRY_DATASET: CountryDataset = countryDatasetSchema.parse(raw) as CountryDataset;
