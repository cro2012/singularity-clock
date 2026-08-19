import { describe, expect, it } from 'vitest';
import { loadModelConfig } from './node.ts';

const config = loadModelConfig();

describe('model.v1.yaml проходит схему', () => {
  it('загружается', () => {
    expect(config.version).toBe('1.0.0');
  });

  it('содержит 12 видов деятельности и 18 отраслей — ровно как в приложении А', () => {
    expect(config.functions).toHaveLength(12);
    expect(config.industries).toHaveLength(18);
  });

  it('содержит 12 триггеров, из них 2 успокаивающих', () => {
    expect(config.triggers).toHaveLength(12);
    expect(config.triggers.filter((t) => t.calming)).toHaveLength(2);
  });

  it('содержит 5 пресетов', () => {
    expect(Object.keys(config.presets)).toHaveLength(5);
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
