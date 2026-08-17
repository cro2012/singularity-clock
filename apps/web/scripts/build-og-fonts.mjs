/**
 * Готовит шрифты для OG-картинки.
 *
 * Fontsource раздаёт только woff2, а Satori умеет ttf/otf/woff. Здесь woff2
 * распаковывается в ttf и кладётся рядом с функцией. Файлы коммитятся: сборка
 * на Netlify не должна зависеть от того, доступен ли распаковщик в её среде.
 *
 * Inter распространяется по OFL-1.1, лицензия копируется рядом.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decompress } from 'wawoff2';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
// Ассеты лежат РЯДОМ с каталогом функций, а не внутри: Netlify считает
// функцией каждый файл и каталог внутри functions/, и `assets` с точками
// в именах ронял сборку с «Incorrect function names».
const out = join(here, '..', 'netlify', 'assets');
mkdirSync(out, { recursive: true });

// Латиница и кириллица лежат в разных подмножествах. Satori принимает список
// шрифтов и выбирает по покрытию глифов, поэтому нужны оба.
const SUBSETS = [
  ['latin', 600],
  ['cyrillic', 600],
  ['latin', 400],
  ['cyrillic', 400],
];

for (const [subset, weight] of SUBSETS) {
  const source = require.resolve(`@fontsource/inter/files/inter-${subset}-${weight}-normal.woff2`);
  const ttf = await decompress(readFileSync(source));
  const target = join(out, `inter-${subset}-${weight}.ttf`);
  writeFileSync(target, ttf);
  console.log(`${target} — ${(ttf.length / 1024).toFixed(1)} КБ`);
}

copyFileSync(require.resolve('@fontsource/inter/LICENSE'), join(out, 'Inter-LICENSE.txt'));
console.log('лицензия Inter скопирована');

// Функция не может импортировать YAML через `?raw` — это возможность сборщика,
// а не Node. Кладём файл рядом и читаем с диска: источник истины остаётся один.
copyFileSync(require.resolve('@sc/data/config/model.v1.yaml'), join(out, 'model.v1.yaml'));
console.log('конфиг модели скопирован');
