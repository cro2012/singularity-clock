/**
 * Сборка Netlify-функций в самодостаточные файлы.
 *
 * Зачем свой шаг вместо штатного бандлера: пакеты `packages/*` отдают сырой
 * TypeScript (`"exports": { ".": "./src/index.ts" }`). Vite это разворачивает,
 * потому что транспилирует весь граф; сборщик функций Netlify так не умеет —
 * он транспилирует файл функции на месте и трассирует зависимости как обычные
 * пакеты. Импорт `@sc/core` в результате не разрешался, модуль падал при
 * загрузке, и рантайм откатывался к поиску `exports.handler` — отсюда
 * «D.handler is not a function» и 502 на проде.
 *
 * Здесь esbuild собирает функцию со всеми пакетами внутрь одного .mjs.
 * Снаружи остаётся только sharp: нативный модуль, его нельзя бандлить, он
 * доезжает через external_node_modules.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', 'netlify', 'functions');
const out = join(here, '..', 'netlify', 'dist-functions');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [join(source, 'og.mts')],
  outfile: join(out, 'og.mjs'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  // sharp — нативный биндинг, бандлить нельзя.
  external: ['sharp'],
  // yaml и часть транзитивных пакетов — CommonJS, и внутри они зовут require.
  // В ESM-выводе его нет, поэтому возвращаем через createRequire: без этого
  // бандл падает на «Dynamic require of "process" is not supported».
  banner: {
    js: "import { createRequire as __scRequire } from 'node:module'; const require = __scRequire(import.meta.url);",
  },
  logLevel: 'warning',
});

// Проверяем, что бандл действительно самодостаточен: импортируем его в чистом
// процессе Node и рендерим картинку. Если внутрь что-то не попало, узнаем
// здесь, а не по 502 на проде.
const probe = `
import og from ${JSON.stringify(pathToFileURL(join(out, 'og.mjs')).href)};
const response = await og(new Request('https://example.test/og'));
const bytes = Buffer.from(await response.arrayBuffer());
const isPng = bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
if (response.status !== 200 || !isPng) {
  throw new Error('Собранная функция не отдала PNG: ' + response.status);
}
console.log('og.mjs: PNG ' + bytes.readUInt32BE(16) + 'x' + bytes.readUInt32BE(20) + ', ' + Math.round(bytes.length / 1024) + ' КБ');
`;
execFileSync(process.execPath, ['--input-type=module', '--eval', probe], { stdio: 'inherit' });
