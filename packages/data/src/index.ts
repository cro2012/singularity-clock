/**
 * Разбор и валидация конфига модели. Точка входа без обращений к файловой
 * системе: работает в браузере, в воркере и на этапе сборки одинаково.
 *
 * Чтение с диска живёт в отдельной точке входа `@sc/data/node` — иначе
 * node:fs утягивается в клиентский бандл через первый же импорт.
 *
 * Пакет core не умеет читать YAML и не должен: он принимает готовый объект.
 */

import { parse as parseYaml } from 'yaml';
import type { Assumptions, ModelConfig } from '@sc/core';
import { modelConfigSchema, type RawModelConfig } from './schema.ts';

export { modelConfigSchema } from './schema.ts';
export type { RawModelConfig } from './schema.ts';

/** Достраивает пресет до полного набора допущений. */
function toAssumptions(
  preset: RawModelConfig['presets'][string],
  defaultAnchorId: string,
): Assumptions {
  return {
    ...preset,
    anchorId: preset.anchorId ?? defaultAnchorId,
    triggers: new Set<string>(),
    geopolitics: false,
  };
}

export function parseModelConfig(source: string): ModelConfig {
  const raw = modelConfigSchema.parse(parseYaml(source));
  const defaultAnchorId = raw.anchors[0]!.id;
  return {
    ...raw,
    presets: Object.fromEntries(
      Object.entries(raw.presets).map(([name, p]) => [name, toAssumptions(p, defaultAnchorId)]),
    ),
  };
}
