/**
 * Чтение конфига с диска. Только для тестов, скриптов и фоновых заданий.
 *
 * Приложения так конфиг не читают: сборщик инлайнит YAML как текст и зовёт
 * parseModelConfig. Иначе после сборки файла рядом не окажется, а node:fs
 * попадёт в клиентский бандл.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ModelConfig } from '@sc/core';
import { parseModelConfig } from './index.ts';

export const MODEL_CONFIG_PATH = fileURLToPath(
  new URL('../config/model.v1.yaml', import.meta.url),
);

export function loadModelConfig(path: string = MODEL_CONFIG_PATH): ModelConfig {
  return parseModelConfig(readFileSync(path, 'utf8'));
}
