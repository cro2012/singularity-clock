/**
 * Ядро обязано иметь пустые зависимости: оно должно одинаково исполняться
 * в браузере, в Node и в тестах без единого полифилла (ТЗ §2, §9.2).
 *
 * Линтер ловит импорт, этот скрипт — зависимость, добавленную «на будущее»
 * и пока не использованную.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkgPath = fileURLToPath(new URL('../packages/core/package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const offenders = ['dependencies', 'peerDependencies', 'optionalDependencies'].flatMap((field) =>
  Object.keys(pkg[field] ?? {}).map((name) => `${field}.${name}`),
);

if (offenders.length > 0) {
  console.error('У пакета @sc/core появились зависимости:');
  for (const o of offenders) console.error(`  ${o}`);
  console.error('\nЯдро обязано оставаться без зависимостей. См. docs/architecture.md §1.');
  process.exit(1);
}

console.log('@sc/core: зависимостей нет');
