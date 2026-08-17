/**
 * Конфиг модели для страниц.
 *
 * YAML инлайнится сборщиком как текст и разбирается на этапе сборки: если он
 * не пройдёт схему, упадёт сборка, а не страница у пользователя. Файловой
 * системы в рантайме нет — сайт статический.
 */

import { parseModelConfig } from '@sc/data';
import source from '@sc/data/config/model.v1.yaml?raw';

export const MODEL_CONFIG = parseModelConfig(source);
