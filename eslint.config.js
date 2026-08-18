import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Границы между пакетами (docs/architecture.md §1):
 *   core  →  ничего
 *   i18n  →  core
 *   data  →  core
 *   ui    →  core, i18n
 *   apps  →  всё
 *
 * Проверяется здесь по имени пакета плюс отдельным скриптом
 * scripts/check-core-deps.mjs по содержимому package.json. Двойная проверка
 * не избыточна: линтер ловит импорт, скрипт — зависимость, добавленную
 * «на будущее» и пока не использованную.
 */
const forbid = (packages, message) => ({
  'no-restricted-imports': [
    'error',
    { patterns: packages.map((name) => ({ group: [name, `${name}/*`], message })) },
  ],
});

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      // Сгенерированный бандл функции: тысячи строк чужого кода.
      '**/dist-functions/**',
      '**/node_modules/**',
      '**/.astro/**',
      '**/*.generated.*',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  {
    files: ['packages/core/**/*.ts'],
    rules: {
      ...forbid(
        ['@sc/data', '@sc/ui', '@sc/i18n'],
        'Ядро не знает про остальные пакеты. Передай значение параметром.',
      ),
      // Ядро обязано быть чистым: без DOM, без сети, без часов.
      // Иначе оно перестанет одинаково исполняться в браузере, в Node и в тестах,
      // а golden-тесты перестанут быть воспроизводимыми (ТЗ §2).
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'localStorage', 'fetch', 'navigator', 'performance'].map(
          (name) => ({ name, message: 'Ядро не обращается к среде исполнения.' }),
        ),
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.object.name="Date"][callee.property.name="now"]',
          message: 'Текущее время передаётся параметром now, иначе тесты невоспроизводимы.',
        },
        {
          selector: 'NewExpression[callee.name="Date"][arguments.length=0]',
          message: 'Текущее время передаётся параметром now, иначе тесты невоспроизводимы.',
        },
        {
          selector: 'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
          message: 'Ядро детерминировано.',
        },
      ],
    },
  },

  {
    files: ['packages/i18n/**/*.ts'],
    rules: forbid(['@sc/data', '@sc/ui'], 'i18n зависит только от core.'),
  },
  {
    files: ['packages/data/**/*.ts'],
    rules: forbid(['@sc/ui', '@sc/i18n'], 'data не знает про интерфейс.'),
  },
  {
    files: ['packages/ui/**/*.ts', 'packages/ui/**/*.tsx'],
    rules: forbid(['@sc/data'], 'ui получает данные пропсами, а не читает их сам.'),
  },

  // Скрипты сборки и загрузчики данных исполняются в Node.
  {
    files: [
      'scripts/**',
      'packages/ui/scripts/**',
      'packages/data/**/*.ts',
      'apps/web/scripts/**',
      'apps/web/netlify/**',
      'apps/web/astro.config.mjs',
      'eslint.config.js',
    ],
    languageOptions: { globals: globals.node },
  },

  {
    files: ['**/*.test.ts', 'packages/ui/scripts/**', 'scripts/**', 'apps/web/scripts/**'],
    rules: { 'no-console': 'off', 'no-restricted-syntax': 'off' },
  },

  // Тестам ядра нужен настоящий конфиг модели, иначе константы пришлось бы
  // дублировать в фикстурах — и тест перестал бы ловить их правку. Гарантия
  // «ядро без зависимостей» относится к рантайму и проверяется отдельно
  // скриптом check-core-deps.mjs, который смотрит только dependencies.
  {
    files: ['packages/core/**/*.test.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
);
