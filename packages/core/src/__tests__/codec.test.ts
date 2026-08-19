import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { loadModelConfig } from '@sc/data/node';
import { base64UrlToBytes, bytesToBase64Url } from '../base64url.ts';
import { decodeScenario, encodeScenario, matchPreset, SCENARIO_CODEC_VERSION } from '../codec.ts';
import type { Assumptions } from '../types.ts';

const CONFIG = loadModelConfig();

describe('base64url', () => {
  it('круговое преобразование любых байтов', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 64 }), (bytes) => {
        const back = base64UrlToBytes(bytesToBase64Url(bytes));
        expect(back).not.toBeNull();
        expect([...back!]).toEqual([...bytes]);
      }),
    );
  });

  it('не выдаёт символов, требующих экранирования в URL', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 64 }), (bytes) => {
        const text = bytesToBase64Url(bytes);
        expect(text).toBe(encodeURIComponent(text));
      }),
    );
  });

  it('отвергает мусор', () => {
    expect(base64UrlToBytes('!!!!')).toBeNull();
    expect(base64UrlToBytes('A')).toBeNull();
  });
});

describe('кодек сценария', () => {
  it('базовый сценарий укладывается в 19 символов', () => {
    // Было 18; изгиб тренда добавил байт, и base64url вырос на символ.
    // Порог существует ради того, чтобы ссылка не переносилась в мессенджере,
    // и запас до этого ещё огромный — но расти молча она не должна.
    const encoded = encodeScenario(CONFIG.presets.base!, CONFIG);
    expect(encoded.length).toBeLessThanOrEqual(19);
  });

  it('круговое преобразование сохраняет все пресеты в точности', () => {
    for (const [name, preset] of Object.entries(CONFIG.presets)) {
      const back = decodeScenario(encodeScenario(preset, CONFIG), CONFIG);
      expect(back, name).toEqual(preset);
    }
  });

  it('круговое преобразование сохраняет произвольные допущения', () => {
    const arb: fc.Arbitrary<Assumptions> = fc
      .record({
        doublingDays: fc.integer(CONFIG.ranges.doublingDays),
        bendPctPerYear: fc.integer(CONFIG.ranges.bendPctPerYear),
        friction: fc.integer({ min: 0, max: 35 }).map((n) => Number((0.5 + n * 0.1).toFixed(1))),
        singularityPct: fc.integer({ min: 2, max: 19 }).map((n) => n * 5),
        malicePct: fc.integer(CONFIG.ranges.malicePct),
        alignFailPct: fc.integer(CONFIG.ranges.alignFailPct),
        mitigationPct: fc.integer(CONFIG.ranges.mitigationPct),
        dep0Pct: fc.integer(CONFIG.ranges.dep0Pct),
        tauYears: fc.integer(CONFIG.ranges.tauYears),
        adaptWindowYears: fc.integer(CONFIG.ranges.adaptWindowYears),
        anchorId: fc.constantFrom(...CONFIG.anchors.map((a) => a.id)),
        reliability: fc.constantFrom(50 as const, 80 as const),
        targetMinutes: fc.constantFrom(...CONFIG.targets.map((t) => t.minutes)),
        triggers: fc
          .subarray(CONFIG.triggers.map((t) => t.id))
          .map((ids) => new Set(ids) as ReadonlySet<string>),
      })
      .map((r) => ({ ...r, geopolitics: false as const }));

    fc.assert(
      fc.property(arb, (assumptions) => {
        expect(decodeScenario(encodeScenario(assumptions, CONFIG), CONFIG)).toEqual(assumptions);
      }),
      { numRuns: 500 },
    );
  });

  it('веса стран переживают круговое преобразование с точностью байта', () => {
    const weights = {
      research: 1,
      patents: 0.5,
      talent: 0.25,
      infrastructure: 1,
      investment: 0,
      commercialization: 0.75,
      governance: 0.1,
    };
    const source: Assumptions = { ...CONFIG.presets.base!, geopolitics: { weights } };
    const back = decodeScenario(encodeScenario(source, CONFIG), CONFIG);
    expect(back?.geopolitics).not.toBe(false);
    const decoded = (back!.geopolitics as { weights: typeof weights }).weights;
    for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
      expect(decoded[key]).toBeCloseTo(weights[key], 2);
    }
  });

  it('неизвестная версия отвергается целиком, а не разбирается частично', () => {
    const bytes = base64UrlToBytes(encodeScenario(CONFIG.presets.base!, CONFIG))!;
    bytes[0] = SCENARIO_CODEC_VERSION + 1;
    expect(decodeScenario(bytesToBase64Url(bytes), CONFIG)).toBeNull();
  });

  it('обрезанная и мусорная строка отвергаются', () => {
    expect(decodeScenario('', CONFIG)).toBeNull();
    expect(decodeScenario('AAAA', CONFIG)).toBeNull();
    expect(decodeScenario('!!!!!!!!!!!!!!!!!!', CONFIG)).toBeNull();
  });

  it('распознаёт пресет по сценарию', () => {
    for (const name of Object.keys(CONFIG.presets)) {
      expect(matchPreset(CONFIG.presets[name]!, CONFIG)).toBe(name);
    }
    const custom: Assumptions = { ...CONFIG.presets.base!, malicePct: 41 };
    expect(matchPreset(custom, CONFIG)).toBeNull();
  });
});

describe('закреплённые ссылки', () => {
  // Эти строки уходят в мессенджеры и в поисковую выдачу. Если тест упал,
  // значит либо изменился формат, либо переставлены триггеры в конфиге —
  // и все ранее расшаренные ссылки поменяли смысл. Обновлять значения можно
  // только вместе с версией кодека.
  it('кодировка пресетов не менялась', () => {
    const encoded = Object.fromEntries(
      Object.entries(CONFIG.presets).map(([name, p]) => [name, encodeScenario(p, CONFIG)]),
    );
    expect(encoded).toMatchInlineSnapshot(`
      {
        "anxious": "AjIIAggyKB4UBiMAAAo",
        "base": "AkUNAggoFC0MChQAAAo",
        "doomsday": "Ah0FAggySwoUBDcAAAo",
        "optimist": "AogZBggUBVAKEgoAAAo",
        "skeptic": "Ar4eBggjAzwIFwcAAAo",
        "survey": "AkUNAggoAy0MChQAAAo",
      }
    `);
  });

  it('ссылки, выпущенные до появления якорей, читаются как раньше', () => {
    // Индекс якоря METR занял свободные биты байта флагов без смены версии
    // кодека. Условие, при котором это законно ровно одно: в старых ссылках
    // там нули, и нуль обязан означать прежнее поведение — якорь по
    // умолчанию. Строка ниже настоящая, из ссылки на пресет «doomsday»,
    // выпущенной до этой правки.
    const before = decodeScenario('AR0FAggySwoUBDcAAA', CONFIG);
    expect(before).not.toBeNull();
    expect(before!.anchorId).toBe(CONFIG.anchors[0]!.id);
    expect(before!.doublingDays).toBe(89);
    expect(before!.alignFailPct).toBe(75);
  });

  it('каждый якорь переживает круговое преобразование', () => {
    for (const anchor of CONFIG.anchors) {
      const scenario = { ...CONFIG.presets.base!, anchorId: anchor.id };
      expect(decodeScenario(encodeScenario(scenario, CONFIG), CONFIG)?.anchorId).toBe(anchor.id);
    }
  });

  it('ссылка на несуществующий якорь отвергается целиком', () => {
    // Ссылка из сборки, где якорей было больше. Подставить якорь по умолчанию
    // значило бы молча подменить единственное измерение в модели.
    const bytes = base64UrlToBytes(encodeScenario(CONFIG.presets.base!, CONFIG))!;
    bytes[3] = (bytes[3]! & 0b1111) | (0b111 << 4);
    expect(decodeScenario(bytesToBase64Url(bytes), CONFIG)).toBeNull();
  });

  it('порядок триггеров в конфиге закреплён: новые добавляются только в конец', () => {
    expect(CONFIG.triggers.map((t) => t.id)).toEqual([
      'selfcopy',
      'selfimp',
      'jump',
      'deaths10',
      'cyber',
      'jailbreak',
      'weapons',
      'deceit',
      'robots',
      'discovery',
      'treaty',
      'pause',
    ]);
  });
});
