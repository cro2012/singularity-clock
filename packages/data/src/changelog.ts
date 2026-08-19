/**
 * История версий модели.
 *
 * Не список коммитов. Сюда попадает только то, что меняет числа на экране или
 * их смысл: правка формулы, обновление измерения, новый параметр. Правки
 * вёрстки, текстов и инфраструктуры здесь не нужны — для них есть git.
 *
 * Версия наверху списка обязана совпадать с `version` в model.v1.yaml, и это
 * проверяется тестом. Иначе история разойдётся с тем, что реально считается.
 *
 * Живёт обычным модулем, а не YAML со схемой: файл читает одна статическая
 * страница на этапе сборки, разбирать его в браузере незачем.
 */

export type ChangeKind = 'model' | 'data' | 'fix' | 'feature';

export interface ChangelogEntry {
  readonly version: string;
  /** Дата выпуска, ISO. */
  readonly date: string;
  /** Срез данных METR, на котором считает эта версия. */
  readonly dataCutoff: string;
  /** Опорная точка по умолчанию — она задаёт все даты. */
  readonly anchor: string;
  readonly changes: readonly { readonly kind: ChangeKind; readonly text: string }[];
}

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2026-08-19',
    dataCutoff: '2026-05-08',
    anchor: 'Claude Opus 4.6 · 12.0 h',
    changes: [
      {
        kind: 'data',
        text: 'All METR values re-read from the published measurement file instead of being transcribed by hand. The previous anchor was recorded as 320 minutes where METR reports 293.0, and the historical points mixed two measurement rounds. Fifteen points, one round, no approximations.',
      },
      {
        kind: 'feature',
        text: 'The anchor is now a choice rather than a constant: four METR measurements, the data cutoff, the confidence interval and the source shown next to it. The default is the most recent measurement METR still stands behind; the frontier point is one button away, with a warning.',
      },
      {
        kind: 'model',
        text: 'Severity by level now reports the probability of an event at exactly that level and nothing worse — the difference between adjacent cumulative rungs. The previous figure ignored competing risk and could not be summed across levels.',
      },
      {
        kind: 'fix',
        text: 'The clock caption derived probability backwards from the hand position, which stopped being valid when the dial went logarithmic. It announced 76.9% where the model computed 20.1%. The probability now comes from the model core directly.',
      },
      {
        kind: 'model',
        text: 'Baseline horizon doubling time 131 → 129 days, matching METR’s point estimate for the trend since 2023.',
      },
      {
        kind: 'model',
        text: 'Trend bend: the doubling time can now change year on year, so a straight line on a log scale is a setting rather than an assumption baked into the code. A positive bend makes the horizon converge on a ceiling, and rows above it are never reached at all. It also shows something counter-intuitive — slowing the trend raises global risk by 2100, because the window of vulnerability stays open longer instead of closing.',
      },
      {
        kind: 'feature',
        text: 'A survey-calibrated preset that differs from the author’s baseline by exactly one slider, and each preset button now shows the global risk it produces.',
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-08-19',
    dataCutoff: '2026-01-29',
    anchor: 'Claude Opus 4.5 · 320 min',
    changes: [
      {
        kind: 'model',
        text: 'The clock dial became logarithmic: five minutes of hand per order of magnitude. On the linear scale the entire range people argue over sat inside three minutes of dial.',
      },
      {
        kind: 'feature',
        text: 'Sensitivity analysis on the front page: every assumption nudged by a fifth of its range, sorted by how far it moves global risk. This is the output the service actually exists for.',
      },
      {
        kind: 'feature',
        text: 'Provenance labels — measured, extrapolated, assumed, unverified — on every slider and every dataset.',
      },
      {
        kind: 'model',
        text: 'Sliders renamed to what they are: pressures and strengths on an arbitrary scale, not probabilities. “Probability of control failure — 20%” read as a claim about the world; it is a multiplier.',
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-08-17',
    dataCutoff: '2026-01-29',
    anchor: 'Claude Opus 4.5 · 320 min',
    changes: [
      {
        kind: 'model',
        text: 'First public model. Catastrophe rungs are nested — each curve means “an event at this level or worse” — and integration starts from the current year rather than a fixed one.',
      },
      {
        kind: 'model',
        text: 'The horizon is extrapolated in log₂ space. At the fastest settings the linear form overflows a double before 2100.',
      },
    ],
  },
];
