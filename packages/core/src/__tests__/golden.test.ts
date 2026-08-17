/**
 * Golden-фикстуры на рабочем конфиге (вложенные ступени, интегрирование с
 * текущего года).
 *
 * Про «побайтово» из ТЗ §2.7: буквально это невыполнимо, потому что Math.exp и
 * Math.log2 не гарантируют бит-в-бит результат между версиями движка — тест
 * начал бы падать при обновлении Node, и падение выглядело бы как изменение
 * модели. Поэтому сравниваются округлённые до отображаемой точности значения,
 * зато строго: любая правка константы сдвинет их на много порядков больше,
 * чем разница между реализациями экспоненты.
 */

import { describe, expect, it } from 'vitest';
import { loadModelConfig } from '@sc/data/node';
import { computeModel } from '../compute.ts';
import { probabilityAt } from '../risk.ts';
import type { ModelResult } from '../types.ts';

const NOW = Date.UTC(2026, 7, 17);
const CONFIG = loadModelConfig();

const ym = (ms: number | null): string | null =>
  ms === null ? null : new Date(ms).toISOString().slice(0, 7);

const pct = (p: number): string => `${(p * 100).toFixed(1)}%`;

const sci = (x: number): string => x.toExponential(4);

function summarize(result: ModelResult) {
  return {
    сингулярность: {
      дата: ym(result.singularity.date),
      пройдено: pct(result.singularity.passedShare),
    },
    любойУровень: { медиана: ym(result.anyLevel.medianDate) },
    ступени: result.tiers.map((t) => ({
      уровень: t.id,
      медиана: ym(t.medianDate),
      p2035: pct(probabilityAt(t.curve, 2035)),
      p2050: pct(probabilityAt(t.curve, 2050)),
      p2100: pct(probabilityAt(t.curve, 2100)),
    })),
    ожидание2050: { жертвы: sci(result.expected.deaths), ущерб: sci(result.expected.usd) },
    часы: {
      минутДоПолуночи: result.doomsday.minutesToMidnight.toFixed(3),
      тревога: result.doomsday.alertLevel,
    },
    первыеПятьСтрок: result.items.slice(0, 5).map((i) => `${i.id} ${ym(i.date)}`),
    последниеПятьСтрок: result.items.slice(-5).map((i) => `${i.id} ${ym(i.date)}`),
  };
}

describe.each(Object.entries(CONFIG.presets))('golden: пресет «%s»', (name, preset) => {
  it('совпадает с зафиксированным выходом', () => {
    const result = computeModel({ assumptions: preset, config: CONFIG, now: NOW });
    expect(summarize(result)).toMatchSnapshot(name);
  });
});

describe('golden: триггеры', () => {
  it('все разгоняющие включены', () => {
    const accelerating = CONFIG.triggers.filter((t) => !t.calming).map((t) => t.id);
    const result = computeModel({
      assumptions: { ...CONFIG.presets.base!, triggers: new Set(accelerating) },
      config: CONFIG,
      now: NOW,
    });
    expect(summarize(result)).toMatchSnapshot('все разгоняющие');
  });

  it('оба успокаивающих включены', () => {
    const calming = CONFIG.triggers.filter((t) => t.calming).map((t) => t.id);
    const result = computeModel({
      assumptions: { ...CONFIG.presets.base!, triggers: new Set(calming) },
      config: CONFIG,
      now: NOW,
    });
    expect(summarize(result)).toMatchSnapshot('оба успокаивающих');
  });
});
