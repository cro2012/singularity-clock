/**
 * Схема конфига модели.
 *
 * Валидация здесь — не формальность. Константы модели правятся руками через
 * pull request, и опечатка в коэффициенте сложности не выдаст себя ничем,
 * кроме сдвинувшейся даты. Схема ловит то, что можно поймать машинно:
 * отсутствие обоснования, неизвестный порог задачи, ступени не по возрастанию.
 */

import { z } from 'zod';

const isoDate = z
  .string()
  .refine((s) => Number.isFinite(Date.parse(s)), 'Ожидалась дата в формате ISO')
  .transform((s) => Date.parse(s));

const positive = z.number().positive();
const unitInterval = z.number().min(0).max(1);

const groupId = z.enum(['phys', 'sci', 'soc']);
const targetMinutes = z.union([
  z.literal(480),
  z.literal(2400),
  z.literal(9600),
  z.literal(115200),
]);

const item = z.object({
  id: z.string().min(1),
  m: positive,
  lag: z.number().min(0),
  group: groupId.optional(),
  // Пустое обоснование роняет сборку: см. docs/architecture.md §9.
  rationale: z.string().min(1, 'Коэффициент без обоснования в модель не попадает'),
});

const tier = z.object({
  id: z.enum(['local', 'regional', 'global']),
  capabilityThresholdMinutes: positive,
  maliceWeight: unitInterval,
  controlFailWeight: unitInterval,
  mitigationCeiling: unitInterval,
  deaths: z.tuple([positive, positive]),
  usd: z.tuple([positive, positive]),
});

const triggerEffects = z
  .object({
    doubling: positive.optional(),
    align: positive.optional(),
    mitigationAdd: z.number().optional(),
    dep: positive.optional(),
    local: positive.optional(),
    regional: positive.optional(),
    global: positive.optional(),
    phys: positive.optional(),
    sci: positive.optional(),
    soc: positive.optional(),
  })
  .refine((fx) => Object.keys(fx).length > 0, 'Триггер без эффекта бессмыслен');

const preset = z.object({
  doublingDays: positive,
  friction: positive,
  targetMinutes,
  reliability: z.union([z.literal(50), z.literal(80)]),
  singularityPct: z.number().min(0).max(100),
  malicePct: z.number().min(0).max(100),
  alignFailPct: z.number().min(0).max(100),
  mitigationPct: z.number().min(0).max(100),
  dep0Pct: z.number().min(0).max(100),
  tauYears: positive,
  adaptWindowYears: positive,
  anchorId: z.string().min(1).optional(),
});

const range = z
  .object({ min: z.number(), max: z.number(), step: positive })
  .refine((r) => r.max > r.min, 'Верхняя граница должна быть больше нижней');

export const modelConfigSchema = z
  .object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Ожидалась семантическая версия'),
    tierSemantics: z.enum(['nested', 'exact']),
    metrSource: z.object({ dataCutoff: isoDate, url: z.string().url() }),
    anchors: z
      .array(
        z.object({
          id: z.string().min(1),
          model: z.string().min(1),
          at: isoDate,
          horizonMinutes: positive,
          ci: z.tuple([positive, positive]),
          beyondReliable: z.boolean(),
        }),
      )
      .min(1),
    constants: z.object({
      capabilitySlope: positive,
      saturationMultiple: positive,
      progressWindowDoublings: positive,
      progressLagTailBase: unitInterval,
      reliability80Factor: positive,
      maxDependency: unitInterval,
      expectedAtYear: z.number().int(),
      doomsday: z.object({
        scaleMinutes: positive,
        floorMinutes: positive,
        horizonYear: z.number().int(),
        scale: z.enum(['linear', 'logarithmic']),
        probabilityFloor: z.number().gt(0).lt(1),
        decades: positive,
      }),
      alertThresholds: z.tuple([unitInterval, unitInterval, unitInterval]),
      integration: z.object({
        startFromNow: z.boolean(),
        startYear: z.number().int(),
        endYear: z.number().int(),
        yearAnchorMonth: z.number().int().min(1).max(12),
        yearAnchorDay: z.number().int().min(1).max(31),
      }),
      geopolitics: z.object({
        mitigationPenalty: unitInterval,
        topN: z.number().int().positive(),
      }),
    }),
    targets: z.array(z.object({ minutes: targetMinutes, key: z.string().min(1) })).min(1),
    metrPoints: z
      .array(
        z.object({
          at: isoDate,
          model: z.string().min(1),
          horizonMinutes: positive,
          methodology: z.string().min(1),
          approx: z.boolean(),
        }),
      )
      .min(1),
    functions: z.array(item).min(1),
    industries: z.array(item).min(1),
    tiers: z.tuple([tier, tier, tier]),
    triggers: z
      .array(z.object({ id: z.string().min(1), calming: z.boolean().optional(), effects: triggerEffects }))
      .min(1),
    presets: z.record(z.string(), preset),
    ranges: z.object({
      doublingDays: range,
      friction: range,
      singularityPct: range,
      malicePct: range,
      alignFailPct: range,
      mitigationPct: range,
      dep0Pct: range,
      tauYears: range,
      adaptWindowYears: range,
    }),
  })
  .superRefine((cfg, ctx) => {
    const addIssue = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: 'custom', message, path });

    // Пороги ступеней обязаны возрастать: иначе «лестница» перестаёт быть лестницей.
    for (let i = 1; i < cfg.tiers.length; i++) {
      const prev = cfg.tiers[i - 1]!;
      const cur = cfg.tiers[i]!;
      if (cur.capabilityThresholdMinutes <= prev.capabilityThresholdMinutes) {
        addIssue(`Порог ступени ${cur.id} не выше предыдущей`, ['tiers', i]);
      }
    }

    for (const t of cfg.tiers) {
      if (t.deaths[1] <= t.deaths[0]) addIssue(`Диапазон жертв ${t.id} вырожден`, ['tiers']);
      if (t.usd[1] <= t.usd[0]) addIssue(`Диапазон ущерба ${t.id} вырожден`, ['tiers']);
    }

    const dupIds = (list: readonly { id: string }[], where: string) => {
      const seen = new Set<string>();
      for (const x of list) {
        if (seen.has(x.id)) addIssue(`Повторяющийся id «${x.id}»`, [where]);
        seen.add(x.id);
      }
    };
    dupIds(cfg.functions, 'functions');
    dupIds(cfg.industries, 'industries');
    dupIds(cfg.triggers, 'triggers');
    dupIds(cfg.anchors, 'anchors');

    // Якорь — единственное измерение в модели, поэтому он обязан совпадать с
    // точкой METR: и по горизонту, и по дате. Иначе «measured» на плашке врёт.
    for (const [i, a] of cfg.anchors.entries()) {
      const point = cfg.metrPoints.find((p) => p.at === a.at && p.horizonMinutes === a.horizonMinutes);
      if (!point) addIssue(`Якорь «${a.id}» не совпадает ни с одной точкой METR`, ['anchors', i]);
      if (a.ci[0] > a.horizonMinutes || a.ci[1] < a.horizonMinutes) {
        addIssue(`Якорь «${a.id}»: оценка вне собственного интервала`, ['anchors', i]);
      }
      // Шестнадцать часов — граница, за которой METR не ручается за замер.
      if (a.beyondReliable !== a.horizonMinutes > 16 * 60) {
        addIssue(`Якорь «${a.id}»: beyondReliable не соответствует горизонту`, ['anchors', i]);
      }
    }

    // Нулевой якорь едет в старых ссылках как значение по умолчанию, поэтому
    // он не может быть тем, за который METR не ручается.
    if (cfg.anchors[0]!.beyondReliable) {
      addIssue('Якорь по умолчанию не может быть за границей надёжности', ['anchors', 0]);
    }

    // Данные не могут быть свежее среза, на котором они сняты.
    for (const [i, p] of cfg.metrPoints.entries()) {
      if (p.at > cfg.metrSource.dataCutoff) {
        addIssue(`Точка «${p.model}» новее среза данных`, ['metrPoints', i]);
      }
    }

    const anchorIds = new Set(cfg.anchors.map((a) => a.id));
    for (const [name, p] of Object.entries(cfg.presets)) {
      if (p.anchorId !== undefined && !anchorIds.has(p.anchorId)) {
        addIssue(`Пресет «${name}»: неизвестный якорь «${p.anchorId}»`, ['presets', name]);
      }
    }

    // Порог задачи в пресете должен быть одним из объявленных.
    const targets = new Set(cfg.targets.map((t) => t.minutes));
    for (const [name, p] of Object.entries(cfg.presets)) {
      if (!targets.has(p.targetMinutes)) {
        addIssue(`Пресет «${name}»: порог ${p.targetMinutes} не объявлен в targets`, ['presets', name]);
      }
    }

    // Каждый пресет обязан лежать внутри диапазонов своих ползунков —
    // иначе интерфейс не сможет его показать, не расширив ползунок молча.
    for (const [name, p] of Object.entries(cfg.presets)) {
      for (const [key, r] of Object.entries(cfg.ranges)) {
        const value = p[key as keyof typeof p];
        if (typeof value === 'number' && (value < r.min || value > r.max)) {
          addIssue(`Пресет «${name}»: ${key} = ${value} вне диапазона ${r.min}…${r.max}`, [
            'presets',
            name,
            key,
          ]);
        }
      }
    }
  });

export type RawModelConfig = z.infer<typeof modelConfigSchema>;
