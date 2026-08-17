import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

/**
 * Полностью статическая сборка. Модель считается на этапе сборки и попадает
 * в HTML готовыми числами и нарисованными SVG; гидратация только оживляет
 * ползунки. Серверного рендера по запросу нет — см. ADR-0001.
 */
export default defineConfig({
  output: 'static',
  // site нужен карте сайта. На сборке в Netlify URL — это основной адрес
  // сайта, то есть боевой домен; запасное значение для локальной сборки.
  site: process.env.URL ?? 'https://aiapocalypse.now',
  integrations: [react(), sitemap()],
  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: true },
  },
  build: { format: 'directory' },
});
