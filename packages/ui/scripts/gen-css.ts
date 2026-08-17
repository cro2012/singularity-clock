/**
 * Генерирует tokens.generated.css из tokens.ts.
 *
 * CSS не редактируется руками: CI перегенерирует его и падает на git diff,
 * если файл разошёлся с источником. Иначе тест контраста проверял бы одни
 * значения, а страница использовала другие.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SURFACES, TOKENS } from '../src/tokens.ts';

const lines = [
  '/* Сгенерировано из tokens.ts. Не редактировать: pnpm gen:css. */',
  ':root {',
  '  color-scheme: dark;',
  ...Object.entries(SURFACES).map(([name, value]) => `  --${kebab(name)}: ${value};`),
  ...TOKENS.map((t) => `  --${t.name}: ${t.value};${t.note ? ` /* ${t.note} */` : ''}`),
  '  --border: rgba(255, 255, 255, 0.1);',
  '}',
  '',
];

function kebab(name: string): string {
  return name.replace(/([a-z])(\d)/g, '$1-$2');
}

const out = fileURLToPath(new URL('../src/tokens.generated.css', import.meta.url));
writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`tokens.generated.css: ${TOKENS.length} токенов`);
