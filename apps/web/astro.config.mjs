import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

/**
 * Полностью статическая сборка. Модель считается на этапе сборки и попадает
 * в HTML готовыми числами и нарисованными SVG; гидратация только оживляет
 * ползунки. Серверного рендера по запросу нет — см. ADR-0001.
 */
export default defineConfig({
  output: 'static',
  integrations: [react()],
  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: true },
  },
  build: { format: 'directory' },
});
