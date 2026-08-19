/**
 * В собранном сайте не должно быть кириллицы.
 *
 * Сайт одноязычный, английский, но рабочий язык проекта русский: словари,
 * комментарии и сообщения сборки. Достаточно один раз положить строку мимо
 * словаря — прямо в JSX, — и она уедет на прод незамеченной. Ровно так и
 * случилось с двумя формулами: миграция на английский их не увидела, а ручная
 * проверка `grep -P` с диапазоном \x{0400} в этом окружении молча возвращала
 * пусто, то есть подтверждала чистоту, которой не было.
 *
 * Отсюда правило: проверяет сборка, а не человек.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../apps/web/dist', import.meta.url));
const CHECKED = new Set(['.html', '.js', '.css', '.xml', '.txt', '.json']);
const CYRILLIC = /[\u0400-\u04FF]/;

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const offenders = [];
for (const path of walk(DIST)) {
  if (!CHECKED.has(extname(path))) continue;
  const text = readFileSync(path, 'utf8');
  if (!CYRILLIC.test(text)) continue;
  const samples = [...text.matchAll(/[\u0400-\u04FF][^<>"']{0,70}/g)].slice(0, 5);
  offenders.push({ path: path.slice(DIST.length + 1), samples: samples.map((m) => m[0].trim()) });
}

if (offenders.length > 0) {
  console.error('Кириллица в собранном сайте:\n');
  for (const { path, samples } of offenders) {
    console.error(`  ${path}`);
    for (const sample of samples) console.error(`      ${sample}`);
  }
  console.error('\nПользовательский текст живёт в словаре packages/i18n, а не в JSX.');
  process.exit(1);
}

console.log('Сборка без кириллицы');
