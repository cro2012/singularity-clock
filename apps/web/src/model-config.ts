/**
 * Конфиг модели для страниц.
 *
 * Разбирается и валидируется на сборке плагином model-config-plugin.ts:
 * если YAML не пройдёт схему, упадёт сборка, а не страница у пользователя.
 * В бандл попадает готовый объект, а не парсер YAML вместе с исходником.
 */

// @ts-expect-error — виртуальный модуль, его создаёт плагин Vite на сборке.
import { MODEL_CONFIG as VIRTUAL_CONFIG } from 'virtual:model-config';
import type { ModelConfig } from '@sc/core';

export const MODEL_CONFIG: ModelConfig = VIRTUAL_CONFIG;
