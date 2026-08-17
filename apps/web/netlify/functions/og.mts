/**
 * OG-картинка сценария.
 *
 * Единственный серверный код сервиса и единственная причина, по которой сайт
 * не полностью статичен: краулеры мессенджеров не исполняют JS, а
 * предгенерировать 10²⁰ сценариев нельзя.
 *
 * Функция чистая: URL-параметры → PNG. Никакого чтения данных, никакого
 * состояния. Модель считается тем же ядром, что и на клиенте, поэтому
 * картинка не может разойтись со страницей.
 *
 * Satori переводит текст в контуры, поэтому растеризатору шрифты уже не нужны
 * — иначе пришлось бы тащить fontconfig в лямбду.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import type { ReactNode } from 'react';
import sharp from 'sharp';
import { computeModel, decodeScenario, matchPreset } from '@sc/core';
import { parseModelConfig } from '@sc/data';
import {
  CONTENT,
  formatCountdown,
  formatMonthYear,
  formatPercent,
  MESSAGES,
  type Locale,
} from '@sc/i18n';

/**
 * Каталог с шрифтами и конфигом.
 *
 * В исходниках он лежит рядом с функцией, в собранной лямбде — там, куда его
 * положил included_files, то есть относительно корня проекта. Проверяем
 * кандидатов и падаем с внятным сообщением, а не с ENOENT в глубине satori.
 */
const ASSETS = (() => {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, '..', 'assets'),
    join(here, 'assets'),
    resolve(process.cwd(), 'apps/web/netlify/assets'),
    resolve(process.cwd(), 'netlify/assets'),
  ];
  const found = candidates.find((path) => existsSync(join(path, 'model.v1.yaml')));
  if (!found) {
    throw new Error(`Ассеты OG-функции не найдены. Проверены пути: ${candidates.join(', ')}`);
  }
  return found;
})();

const font = (name: string) => readFileSync(join(ASSETS, name));

const MODEL_CONFIG = parseModelConfig(readFileSync(join(ASSETS, 'model.v1.yaml'), 'utf8'));

/**
 * Кириллица и латиница — разные подмножества Inter, и имена у них разные
 * намеренно: Satori выбирает шрифт по имени и внутри одного имени между
 * файлами не переключается. Одинаковые имена дали бы «NO GLYPH» на всей
 * кириллице. Разные имена плюс список в fontFamily — и подстановка по глифам
 * работает.
 */
const FAMILY = 'Inter, InterCyrillic';

const FONTS = [
  { name: 'Inter', data: font('inter-latin-400.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font('inter-latin-600.ttf'), weight: 600 as const, style: 'normal' as const },
  { name: 'InterCyrillic', data: font('inter-cyrillic-400.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'InterCyrillic', data: font('inter-cyrillic-600.ttf'), weight: 600 as const, style: 'normal' as const },
];

const WIDTH = 1200;
const HEIGHT = 630;

const TIER_COLORS: Record<string, string> = {
  local: '#3d6fae',
  regional: '#4a92e8',
  global: '#86b6ef',
};

const COLORS = {
  plane: '#0d0d0d',
  surface: '#1a1a19',
  ink: '#ffffff',
  ink2: '#c3c2b7',
  muted: '#908e87',
  border: 'rgba(255,255,255,0.10)',
  accent: '#4a92e8',
};

function panel(label: string, value: string, note: string) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: '26px 28px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { fontSize: 19, color: COLORS.muted, letterSpacing: 2, textTransform: 'uppercase' },
            children: label,
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: 58, fontWeight: 600, color: COLORS.ink, marginTop: 14, lineHeight: 1.05 },
            children: value,
          },
        },
        {
          type: 'div',
          props: { style: { fontSize: 20, color: COLORS.ink2, marginTop: 12 }, children: note },
        },
      ],
    },
  };
}

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get('l');
  const locale: Locale = localeParam === 'en' ? 'en' : 'ru';
  const t = MESSAGES[locale];

  const encoded = url.searchParams.get('s');
  const assumptions = (encoded ? decodeScenario(encoded, MODEL_CONFIG) : null) ?? MODEL_CONFIG.presets.base!;

  // Время округляется до суток: иначе каждая перезагрузка предпросмотра давала
  // бы новую картинку и кэш мессенджера был бы бесполезен.
  const now = Math.floor(Date.now() / 86_400_000) * 86_400_000;
  const model = computeModel({ assumptions, config: MODEL_CONFIG, now });

  const labels = { never: t.neverInModel, past: t.alreadyHappened };
  const singularity = formatCountdown(locale, model.singularity.date, now, labels).headline;
  const catastrophe = formatCountdown(locale, model.anyLevel.medianDate, now, labels).headline;
  const preset = matchPreset(assumptions, MODEL_CONFIG);
  const presetName = preset ? (t.presets[preset] ?? preset) : t.customScenario;

  const minutes = model.doomsday.minutesToMidnight;
  const pGlobal = 1 - minutes / MODEL_CONFIG.constants.doomsday.scaleMinutes;
  const tierName = CONTENT[locale].tiers.global.name.toLowerCase();
  const at = (curve: (typeof model.tiers)[number]['curve'], year: number) =>
    curve.find((p) => p.year === year)?.p ?? curve[curve.length - 1]?.p ?? 0;
  const dateNote = (date: number | null) =>
    date === null ? t.neverInModelHint : `${t.dateIs}: ${formatMonthYear(locale, date)}`;

  // Satori типизирует вход как ReactNode, но в рантайме принимает и обычное
  // дерево объектов — так функции не нужен JSX и рантайм React.
  const tree = {
      type: 'div',
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          background: COLORS.plane,
          color: COLORS.ink,
          fontFamily: FAMILY,
          padding: 56,
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: 16, fontSize: 21, color: COLORS.muted },
              children: [
                { type: 'div', props: { children: t.title } },
                { type: 'div', props: { style: { color: COLORS.accent }, children: `· ${presetName}` } },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: 22, marginTop: 34 },
              children: [
                panel(t.singularityCard, singularity, dateNote(model.singularity.date)),
                panel(t.catastropheCard, catastrophe, dateNote(model.anyLevel.medianDate)),
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: 22, marginTop: 22 },
              children: model.tiers.map((tier) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    borderLeft: `3px solid ${TIER_COLORS[tier.id]}`,
                    paddingLeft: 16,
                  },
                  children: [
                    {
                      type: 'div',
                      props: { style: { fontSize: 19, color: COLORS.muted }, children: CONTENT[locale].tiers[tier.id]!.name },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: 34, fontWeight: 600, color: COLORS.ink, marginTop: 6 },
                        children: formatPercent(locale, at(tier.curve, 2050), 0),
                      },
                    },
                    {
                      type: 'div',
                      props: { style: { fontSize: 17, color: COLORS.muted, marginTop: 2 }, children: `${t.tiers.pBy} 2050` },
                    },
                  ],
                },
              })),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                marginTop: 'auto',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: 22,
                color: COLORS.ink2,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    children: `${t.clockTitle}: ${minutes.toFixed(1)} · P(${tierName}) ${formatPercent(locale, pGlobal, 0)} ${t.chart.by} ${MODEL_CONFIG.constants.doomsday.horizonYear}`,
                  },
                },
                { type: 'div', props: { style: { color: COLORS.muted }, children: `v${MODEL_CONFIG.version}` } },
              ],
            },
          },
        ],
      },
  };

  const svg = await satori(tree as unknown as ReactNode, {
    width: WIDTH,
    height: HEIGHT,
    fonts: FONTS,
    embedFont: true,
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      // Ключ кэша задаётся адресом; версия конфига в нём обязательна, иначе
      // после правки констант в мессенджерах застынет старая картинка.
      'cache-control': 'public, max-age=86400, s-maxage=604800, immutable',
    },
  });
};
