import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { parseModelConfig } from '@sc/data';
import { COUNTRY_DATASET } from '@sc/data/countries';

/**
 * Минимум из контракта плагина, который нам нужен.
 *
 * Тип Plugin из 'vite' не импортируется намеренно: Astro тянет свою копию
 * Vite, и отдельно установленная версия расходится с ней по типам. Здесь
 * достаточно addWatchFile, чтобы правка YAML пересобирала страницу.
 */
interface LoadContext {
  addWatchFile(id: string): void;
}

interface HotUpdateContext {
  readonly file: string;
  readonly server: {
    readonly moduleGraph: {
      getModuleById(id: string): object | undefined;
      invalidateModule(mod: object): void;
    };
    readonly ws?: { send(payload: { type: 'full-reload' }): void };
  };
}

const CONFIG = 'virtual:model-config';
const COUNTRIES = 'virtual:country-dataset';
const RESOLVED_CONFIG = '\0' + CONFIG;
const RESOLVED_COUNTRIES = '\0' + COUNTRIES;

/**
 * Конфиг модели разбирается на сборке, а не в браузере.
 *
 * Раньше страница импортировала YAML через `?raw` и звала parseModelConfig
 * при загрузке модуля. Работало, но в клиентский бандл уезжали парсер YAML,
 * zod и весь YAML вместе с комментариями — 248 КБ, больше самого React,
 * ради объекта констант, который не меняется после сборки.
 *
 * Здесь тот же parseModelConfig выполняется один раз в Node: валидация
 * остаётся на месте и по-прежнему роняет сборку при негодном YAML, а в бандл
 * попадает готовый объект.
 *
 * Единственная тонкость — Set: триггеры пресетов сериализуются массивами
 * и собираются обратно пятью строками рантайма.
 */
export function modelConfigPlugin() {
  const require = createRequire(import.meta.url);
  const yamlPath = require.resolve('@sc/data/config/model.v1.yaml');

  return {
    name: 'sc:model-config',
    resolveId(id: string) {
      if (id === CONFIG) return RESOLVED_CONFIG;
      if (id === COUNTRIES) return RESOLVED_COUNTRIES;
      return null;
    },
    /**
     * Правка YAML обязана перерисовать страницу.
     *
     * Одного addWatchFile мало: Vite узнаёт про изменение файла, но
     * виртуальный модуль, который его прочитал, остаётся в графе прежним.
     * На практике это выглядит как свежий код поверх устаревшего конфига —
     * например, новый ползунок падает на отсутствующем диапазоне. В сборке
     * такого не бывает, поэтому ошибка живёт только в разработке и тем
     * неприятнее.
     */
    handleHotUpdate(ctx: HotUpdateContext): void {
      if (ctx.file !== yamlPath) return;
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_CONFIG);
      if (mod) ctx.server.moduleGraph.invalidateModule(mod);
      ctx.server.ws?.send({ type: 'full-reload' });
    },
    load(this: LoadContext, id: string) {
      // Страновой датасет — тот же случай: JSON проверяется схемой один раз
      // на сборке, а в браузер уезжает готовый объект, а не zod следом за ним.
      if (id === RESOLVED_COUNTRIES) {
        return `export const COUNTRY_DATASET = ${JSON.stringify(COUNTRY_DATASET)};`;
      }
      if (id !== RESOLVED_CONFIG) return null;
      this.addWatchFile(yamlPath);

      const config = parseModelConfig(readFileSync(yamlPath, 'utf8'));
      const serialisable = {
        ...config,
        presets: Object.fromEntries(
          Object.entries(config.presets).map(([name, preset]) => [
            name,
            { ...preset, triggers: [...preset.triggers] },
          ]),
        ),
      };

      return [
        `const raw = ${JSON.stringify(serialisable)};`,
        'export const MODEL_CONFIG = {',
        '  ...raw,',
        '  presets: Object.fromEntries(',
        '    Object.entries(raw.presets).map(([name, preset]) => [',
        '      name,',
        '      { ...preset, triggers: new Set(preset.triggers) },',
        '    ]),',
        '  ),',
        '};',
      ].join('\n');
    },
  };
}
