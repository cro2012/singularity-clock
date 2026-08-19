import { describe, expect, it } from 'vitest';
import { CHANGELOG } from './changelog.ts';
import { loadModelConfig } from './node.ts';

const config = loadModelConfig();

describe('model.v1.yaml проходит схему', () => {
  it('загружается', () => {
    expect(config.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('содержит 12 видов деятельности и 18 отраслей — ровно как в приложении А', () => {
    expect(config.functions).toHaveLength(12);
    expect(config.industries).toHaveLength(18);
  });

  it('содержит 12 триггеров, из них 2 успокаивающих', () => {
    expect(config.triggers).toHaveLength(12);
    expect(config.triggers.filter((t) => t.calming)).toHaveLength(2);
  });

  it('содержит 6 пресетов', () => {
    expect(Object.keys(config.presets)).toHaveLength(6);
  });

  it('пресет по опросам отличается от базового ровно одним ползунком', () => {
    // В этом весь его смысл: он показывает, какое единственное допущение
    // разводит позицию автора (20%) и медиану опросов (5–10%).
    const base = config.presets.base!;
    const survey = config.presets.survey!;
    const differing = Object.keys(config.ranges).filter(
      (key) => base[key as keyof typeof base] !== survey[key as keyof typeof survey],
    );
    expect(differing).toEqual(['alignFailPct']);
  });

  it('якорь по умолчанию — самая свежая точка METR внутри надёжного диапазона', () => {
    // Не «самая большая»: METR прямо пишет, что выше шестнадцати часов
    // нынешний набор задач замер не держит, и брать такую точку за
    // единственное измерение модели нельзя. Самая свежая из тех, за которые
    // METR ручается, — да.
    const reliable = config.metrPoints
      .filter((p) => p.horizonMinutes <= 16 * 60)
      .reduce((a, b) => (b.at >= a.at ? b : a));
    const anchor = config.anchors[0]!;
    expect(anchor.horizonMinutes).toBe(reliable.horizonMinutes);
    expect(anchor.at).toBe(reliable.at);
  });

  it('каждый якорь ссылается на существующую точку METR', () => {
    for (const anchor of config.anchors) {
      const point = config.metrPoints.find(
        (p) => p.at === anchor.at && p.horizonMinutes === anchor.horizonMinutes,
      );
      expect(point, anchor.id).toBeTruthy();
    }
  });

  it('пресеты считаются от якоря по умолчанию', () => {
    for (const [name, preset] of Object.entries(config.presets)) {
      expect(preset.anchorId, name).toBe(config.anchors[0]!.id);
    }
  });

  it('программная инженерия — базовая шкала с коэффициентом 1,0', () => {
    expect(config.functions.find((f) => f.id === 'software')?.m).toBe(1);
    expect(config.industries.find((i) => i.id === 'software')?.m).toBe(1);
  });

  it('во всех пресетах порог задачи — месяц, порог сингулярности — 50%', () => {
    for (const p of Object.values(config.presets)) {
      expect(p.targetMinutes).toBe(9600);
      expect(p.singularityPct).toBe(50);
    }
  });

  it('семантика ступеней — вложенная (ADR-0002)', () => {
    expect(config.tierSemantics).toBe('nested');
    expect(config.constants.integration.startFromNow).toBe(true);
  });

  it('пресеты приходят без включённых триггеров и без геополитики', () => {
    for (const p of Object.values(config.presets)) {
      expect(p.triggers.size).toBe(0);
      expect(p.geopolitics).toBe(false);
    }
  });
});

describe('история версий', () => {
  it('верхняя запись совпадает с версией конфига', () => {
    // Иначе страница методологии рассказывает про одну модель, а считает
    // другая: расхождение никак иначе не заметно.
    expect(CHANGELOG[0]!.version).toBe(config.version);
  });

  it('версии идут по убыванию и не повторяются', () => {
    const seen = new Set<string>();
    for (const [i, entry] of CHANGELOG.entries()) {
      expect(seen.has(entry.version), entry.version).toBe(false);
      seen.add(entry.version);
      const previous = CHANGELOG[i - 1];
      if (previous) expect(entry.date <= previous.date, entry.version).toBe(true);
    }
  });

  it('срез данных верхней записи совпадает с конфигом', () => {
    expect(Date.parse(CHANGELOG[0]!.dataCutoff)).toBe(config.metrSource.dataCutoff);
  });

  it('у каждой записи есть хотя бы одно изменение', () => {
    for (const entry of CHANGELOG) {
      expect(entry.changes.length, entry.version).toBeGreaterThan(0);
    }
  });
});
