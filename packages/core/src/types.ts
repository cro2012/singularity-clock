/**
 * Типы расчётного ядра.
 *
 * Разделение принципиальное:
 *   Assumptions — то, что двигает пользователь. Ровно это кодируется в URL.
 *   ModelConfig — экспертные суждения, живут в репозитории под версией.
 *   ModelResult — только числа, никакого форматирования.
 *
 * Обоснование: docs/architecture.md §2.
 */

export type TargetMinutes = 480 | 2400 | 9600 | 115200;
export type Reliability = 50 | 80;
export type TierId = 'local' | 'regional' | 'global';
export type GroupId = 'phys' | 'sci' | 'soc';
export type AlertLevel = 'calm' | 'watchful' | 'serious' | 'critical';

/** Компоненты странового рейтинга (ТЗ §6.1). */
export type ComponentId =
  | 'research'
  | 'patents'
  | 'talent'
  | 'infrastructure'
  | 'investment'
  | 'commercialization'
  | 'governance';

export type ComponentWeights = Readonly<Record<ComponentId, number>>;

/** Всё, что двигает пользователь. */
export interface Assumptions {
  readonly doublingDays: number;
  /**
   * На сколько процентов время удвоения меняется за год.
   * Ноль — прямая в логарифме; больше нуля — замедление вплоть до плато.
   */
  readonly bendPctPerYear: number;
  readonly friction: number;
  readonly targetMinutes: TargetMinutes;
  readonly reliability: Reliability;
  readonly singularityPct: number;
  readonly malicePct: number;
  readonly alignFailPct: number;
  readonly mitigationPct: number;
  readonly dep0Pct: number;
  readonly tauYears: number;
  readonly adaptWindowYears: number;
  readonly triggers: ReadonlySet<string>;
  /** Идентификатор опорной точки METR из config.anchors. */
  readonly anchorId: string;
  /** false — геополитика не учитывается (значение по умолчанию, ТЗ §6.2). */
  readonly geopolitics: false | { readonly weights: ComponentWeights };
}

/** Вид деятельности или отрасль. */
/**
 * Вид деятельности или отрасль.
 *
 * Необязательные поля объявлены как `| undefined`, а не просто через `?`:
 * при exactOptionalPropertyTypes это единственная форма, совместимая с тем,
 * что отдаёт валидатор конфига.
 */
export interface Item {
  readonly id: string;
  /** Коэффициент сложности относительно программной инженерии (= 1,0). */
  readonly m: number;
  /** Лаг внедрения в годах. */
  readonly lag: number;
  readonly group?: GroupId | undefined;
  /** Якорь раздела в docs/model.md. Без обоснования коэффициент не живёт. */
  readonly rationale: string;
}

export interface TierSpec {
  readonly id: TierId;
  readonly capabilityThresholdMinutes: number;
  readonly maliceWeight: number;
  readonly controlFailWeight: number;
  readonly mitigationCeiling: number;
  readonly deaths: readonly [number, number];
  readonly usd: readonly [number, number];
}

export interface TriggerEffects {
  readonly doubling?: number | undefined;
  readonly align?: number | undefined;
  readonly mitigationAdd?: number | undefined;
  readonly dep?: number | undefined;
  readonly local?: number | undefined;
  readonly regional?: number | undefined;
  readonly global?: number | undefined;
  readonly phys?: number | undefined;
  readonly sci?: number | undefined;
  readonly soc?: number | undefined;
}

export interface TriggerSpec {
  readonly id: string;
  readonly calming?: boolean | undefined;
  readonly effects: TriggerEffects;
}

export interface MetrPoint {
  readonly at: number;
  readonly model: string;
  readonly horizonMinutes: number;
  readonly methodology: string;
  readonly approx: boolean;
}

export interface ModelConstants {
  readonly capabilitySlope: number;
  readonly saturationMultiple: number;
  readonly progressWindowDoublings: number;
  readonly progressLagTailBase: number;
  readonly reliability80Factor: number;
  readonly maxDependency: number;
  readonly expectedAtYear: number;
  readonly doomsday: {
    readonly scaleMinutes: number;
    readonly floorMinutes: number;
    readonly horizonYear: number;
    /**
     * 'linear' — как в прототипе, минуты пропорциональны (1 − P);
     * 'logarithmic' — фиксированный ход стрелки за порядок вероятности.
     * Обоснование: docs/adr/0005-clock-scale.md.
     */
    readonly scale: 'linear' | 'logarithmic';
    /** Вероятность, при которой стрелка стоит на пятнадцати минутах. */
    readonly probabilityFloor: number;
    /** Сколько порядков вероятности укладывается в полный ход стрелки. */
    readonly decades: number;
  };
  /** Пороги бейджа тревоги: [calm, watchful, serious]. */
  readonly alertThresholds: readonly [number, number, number];
  readonly integration: {
    readonly startFromNow: boolean;
    readonly startYear: number;
    readonly endYear: number;
    readonly yearAnchorMonth: number;
    readonly yearAnchorDay: number;
  };
  readonly geopolitics: {
    readonly mitigationPenalty: number;
    readonly topN: number;
  };
}

/**
 * 'nested' — кривая ступени означает «событие не ниже этого уровня»;
 * 'exact'  — три независимые кривые, как в прототипе.
 * Решение и последствия: docs/adr/0002-model-semantics.md.
 */
export type TierSemantics = 'nested' | 'exact';

/** Диапазон ползунка. Property-тесты перебирают крайние положения отсюда. */
export interface Range {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

/** Числовые допущения, у которых есть ползунок. */
export type RangedAssumption =
  | 'doublingDays'
  | 'bendPctPerYear'
  | 'friction'
  | 'singularityPct'
  | 'malicePct'
  | 'alignFailPct'
  | 'mitigationPct'
  | 'dep0Pct'
  | 'tauYears'
  | 'adaptWindowYears';

/** Опорная точка METR: измерение, от которого модель отсчитывает горизонт. */
export interface AnchorOption {
  readonly id: string;
  readonly model: string;
  readonly at: number;
  readonly horizonMinutes: number;
  /** Доверительный интервал METR по 50%-горизонту, минуты. */
  readonly ci: readonly [number, number];
  /** true — центральная оценка выше 16 часов, где METR не ручается за замер. */
  readonly beyondReliable: boolean;
}

export interface ModelConfig {
  readonly version: string;
  readonly tierSemantics: TierSemantics;
  /**
   * Опорные точки METR, между которыми можно переключаться.
   *
   * Порядок значим: индекс попадает в ссылку сценария, поэтому новые якоря
   * добавляются только в конец, а нулевой навсегда остаётся значением по
   * умолчанию (docs/adr/0006-metr-anchor.md).
   */
  readonly anchors: readonly AnchorOption[];
  /** Дата, на которую сняты измерения METR, и ссылка на источник. */
  readonly metrSource: { readonly dataCutoff: number; readonly url: string };
  readonly constants: ModelConstants;
  readonly targets: readonly { readonly minutes: TargetMinutes; readonly key: string }[];
  readonly metrPoints: readonly MetrPoint[];
  readonly functions: readonly Item[];
  readonly industries: readonly Item[];
  readonly tiers: readonly TierSpec[];
  readonly triggers: readonly TriggerSpec[];
  readonly presets: Readonly<Record<string, Assumptions>>;
  readonly ranges: Readonly<Record<RangedAssumption, Range>>;
}

/** Параметры после применения триггеров. */
export interface EffectiveParams {
  /** Эффективное время удвоения в днях: удвоение × трение × триггеры. */
  readonly doublingDays: number;
  readonly malice: number;
  readonly alignFail: number;
  readonly mitigation: number;
  readonly dep0: number;
  readonly tierMultipliers: Readonly<Record<TierId, number>>;
  readonly groupMultipliers: Readonly<Record<GroupId, number>>;
  /** Множитель требуемого горизонта из-за планки надёжности. */
  readonly reliabilityFactor: number;
}

export type ItemKind = 'function' | 'industry';

export interface ItemResult {
  readonly id: string;
  /**
   * Идентификатор `software` есть и среди видов деятельности, и среди
   * отраслей: по одному id строку не отличить, а тексты у них разные.
   */
  readonly kind: ItemKind;
  /**
   * Дата обгона или `null`, если в этом сценарии она не наступает никогда.
   *
   * Null, а не +Infinity: при изгибе тренда горизонт упирается в плато, и
   * недостижимость — обычный исход, а не край диапазона. Тип обязан заставить
   * каждого потребителя её обработать, иначе `new Date(Infinity)` роняет
   * форматирование в первом же месте, где о ней забыли.
   */
  readonly date: number | null;
  readonly progress: number;
  readonly passed: boolean;
}

export interface CurvePoint {
  readonly year: number;
  readonly p: number;
}

export type Curve = readonly CurvePoint[];

export interface TierResult {
  readonly id: TierId;
  /**
   * Кривая, которую показывает интерфейс. При tierSemantics = 'nested' это
   * «событие не ниже этого уровня», при 'exact' — только этот уровень.
   */
  readonly curve: Curve;
  /**
   * Вероятность события ровно этого уровня: 1 − exp(−Λ_i). Нужна для
   * математического ожидания, чтобы глобальная катастрофа не была
   * посчитана трижды. При 'exact' совпадает с curve.
   */
  readonly ownCurve: Curve;
  /**
   * Вероятность события ровно этого уровня и не хуже: P(≥ i) − P(≥ i+1).
   *
   * Именно она идёт в математическое ожидание и в таблицу тяжести. От
   * ownCurve отличается тем, что учитывает конкурирующий риск: собственная
   * кривая ступени считает и те миры, где заодно случилась катастрофа
   * крупнее, поэтому суммировать её по ступеням нельзя. Сумма exactCurve
   * по всем ступеням равна кривой «событие любого уровня».
   */
  readonly exactCurve: Curve;
  readonly medianDate: number | null;
}

/** Нормированные баллы страны по компонентам рейтинга, 0…100. */
export interface CountryScores {
  readonly iso3: string;
  readonly components: Readonly<Record<ComponentId, number>>;
}

export interface ModelResult {
  readonly effective: EffectiveParams;
  readonly singularity: {
    readonly date: number | null;
    readonly passedShare: number;
    readonly percentile: number;
  };
  readonly items: readonly ItemResult[];
  readonly tiers: readonly TierResult[];
  readonly anyLevel: { readonly curve: Curve; readonly medianDate: number | null };
  /**
   * Математическое ожидание жертв и ущерба к atYear.
   *
   * Σ P(ровно этот уровень) × геометрическое среднее объявленного диапазона.
   * Величина заведомо грубая: накопленная вероятность события не является
   * числом событий, а ступень задана через ИЛИ. Показывать её можно только
   * вместе с оговоркой (messages.expectedCaveat) и рядом с диапазонами
   * тяжести, из которых она собрана.
   */
  readonly expected: { readonly deaths: number; readonly usd: number; readonly atYear: number };
  readonly doomsday: {
    readonly minutesToMidnight: number;
    /**
     * P(глобальная катастрофа к horizonYear). Хранится явно, потому что при
     * логарифмической шкале обратно из минут её не достать: минуты выражают
     * положение стрелки, а не вероятность.
     */
    readonly pGlobal: number;
    /** Положение стрелки от 0 до 1 — то, во что шкала превращает pGlobal. */
    readonly position: number;
    readonly alertLevel: AlertLevel;
  };
  readonly raceIndex: number | null;
}

export interface ComputeArgs {
  readonly assumptions: Assumptions;
  readonly config: ModelConfig;
  /** Текущее время в мс UTC. Обязательный параметр: Date.now() в ядре запрещён. */
  readonly now: number;
  /**
   * Страновые баллы для индекса гонки. Это измеряемые данные, а не константы
   * модели, поэтому они приходят отдельно от конфига. Без них индекс гонки
   * равен null, а переключатель геополитики ни на что не влияет.
   */
  readonly countries?: readonly CountryScores[] | undefined;
}
