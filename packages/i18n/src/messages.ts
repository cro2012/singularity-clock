/**
 * Словари интерфейса.
 *
 * Тип выводится из русского словаря, поэтому английский не скомпилируется,
 * пока в нём не окажется каждый ключ. Это единственная проверка, которую
 * может сделать машина; качество перевода — человеческая работа, машинный
 * перевод текстов триггеров и сценариев запрещён (ТЗ §12).
 */

import type { PluralForms } from './format.ts';
import type { Locale } from './locales.ts';

export const ru = {
  eyebrow: 'Полушуточный прогнозный аппарат',
  title: 'Часы Сингулярности и Лестница Катастроф',
  lede:
    'Два обратных отсчёта, посчитанных из одной экстраполяции: горизонта автономных задач METR. Всё, что вы видите ниже, — оформленное суждение, а не измерение будущего. Крутите ползунки: если дата легко сдвигается на двадцать лет, значит она никогда и не была прогнозом.',

  presetLabel: 'Пресет',
  presets: {
    base: 'Базовый',
    optimist: 'Оптимист',
    skeptic: 'Скептик',
    anxious: 'Тревожный',
    doomsday: 'Судный день',
  } as Record<string, string>,
  customScenario: 'Свой сценарий',

  singularityCard: 'До сингулярности',
  catastropheCard: 'До первой катастрофы любого уровня',
  neverInModel: 'за пределами модели',
  neverInModelHint: 'вероятность не доходит до 50% к 2100 году',
  alreadyHappened: 'уже наступило',

  singularityNote: 'Момент, когда ИИ обгонит медианного профессионала в {pct} из {total} видов деятельности. Уже пройдено: {passed}.',
  catastropheNote: 'Медианная дата первого события уровня «локальный» и выше. Это не конец света — это первая ступень лестницы.',
  dateIs: 'Дата',

  clockTitle: 'Часы судного дня, пересчитанные моделью',
  clockNote:
    'до полуночи. Шкала: 15 минут — глобальная катастрофа исключена, полночь — гарантирована. Сейчас модель даёт {p} на глобальный уровень до 2100 года.',
  minutes: { one: 'минута', few: 'минуты', many: 'минут', other: 'минуты' } as PluralForms,
  seconds: { one: 'секунда', few: 'секунды', many: 'секунд', other: 'секунды' } as PluralForms,
  alert: {
    calm: 'Спокойно',
    watchful: 'Настороженно',
    serious: 'Серьёзно',
    critical: 'Критично',
  },

  controlsSingularity: 'Допущения о скорости',
  controlsRisk: 'Допущения о риске',

  expectedTitle: 'Математическое ожидание к {year} году',
  expectedDeaths:
    'ожидаемое число погибших: сумма по трём уровням, вероятность × геометрическое среднее диапазона',
  expectedUsd: 'ожидаемый прямой ущерб в долларах 2026 года',

  sliders: {
    doublingDays: {
      label: 'Время удвоения горизонта',
      unit: 'дн.',
      hint: 'METR: 196 дн. на всей выборке с 2019, 131 дн. если считать с 2023, 89 дн. если с 2024.',
    },
    friction: {
      label: 'Трение реального мира',
      unit: '',
      hint: 'Во сколько раз бенчмарк оптимистичнее жизни: энергосети, чипы, данные, регуляторы, инерция людей. 1,0 — «график и есть реальность».',
    },
    singularityPct: {
      label: 'Порог сингулярности',
      unit: '%',
      hint: 'Какая доля из 30 видов деятельности должна быть пройдена, чтобы объявить дату.',
    },
    malicePct: {
      label: 'Доля злонамеренного применения',
      unit: '%',
      hint: 'Насколько охотно люди направят доступную мощность во вред. Главный драйвер нижней ступени.',
    },
    alignFailPct: {
      label: 'Вероятность отказа контроля',
      unit: '%',
      hint: 'Что система в критический момент делает не то, для чего её ставили, и это не откатывается. Главный драйвер верхней ступени.',
    },
    mitigationPct: {
      label: 'Эффективность митигации',
      unit: '%',
      hint: 'Регулирование, аудит, рубильники, договоры. На верхней ступени работает хуже: предотвращать нужно то, чего ещё не было.',
    },
    dep0Pct: {
      label: 'Подключённость к критическим системам сейчас',
      unit: '%',
      hint: 'Какая доля энергетики, финансов, логистики, оружия и медицины уже отдана автономным контурам.',
    },
    tauYears: {
      label: 'Время насыщения внедрения',
      unit: 'лет',
      hint: 'За сколько лет подключённость доходит до потолка.',
    },
    adaptWindowYears: {
      label: 'Окно уязвимости',
      unit: 'лет',
      hint: 'После того как способности упёрлись в потолок, мир учится с ними жить, и риск затухает с этим периодом. Поставьте 100 — и он не затухает никогда.',
    },
  },

  targetLabel: 'Порог задачи',
  targetHint: 'Какой длины непрерывную работу человека ИИ должен закрывать сам, чтобы считалось. Считается рабочее время, не календарное.',
  targets: { day: '1 день', week: '1 неделя', month: '1 месяц', year: '1 год' } as Record<string, string>,

  reliabilityLabel: 'Требуемая надёжность',
  reliabilityHint:
    'METR меряет горизонт при 50% успеха. Планка 80% отодвигает дату примерно на 2,3 удвоения: считать надёжной систему с монеткой нельзя.',
  reliability50: '50% успеха',
  reliability80: '80% успеха',

  reset: 'Сбросить к базовому',
  copyLink: 'Скопировать ссылку на сценарий',
  copied: 'Скопировано',
  linkFromOtherVersion: 'Ссылка сделана в другой версии модели, сценарий не восстановлен. Показан базовый пресет.',

  disclaimerTitle: 'Отдельно и без иронии.',
  disclaimer:
    'Этот аппарат не предсказывает будущее и не может. У события, которое не происходило ни разу, нет обучающей выборки, нет валидации и нет способа отличить хорошую модель от красивой. Всё, что тут делается, — это раскладывание допущений по полочкам так, чтобы стало видно, какое из них несёт всю нагрузку. Если ползунок «отказ контроля» двигает глобальную дату на сорок лет, а «удвоение горизонта» — на пять, то спорить надо про первое. В этом вся ценность; даты — побочный продукт.',

  anchorNote: 'Опорная точка: 50%-горизонт {horizon} минут, {model}, {date}.',
  estimateMark: 'оценка',
  milestoneNote: 'Разбивка по видам деятельности, графики и панель триггеров появятся на следующем шаге.',
};

export type Messages = typeof ru;

export const en: Messages = {
  eyebrow: 'A half-joking forecasting apparatus',
  title: 'The Singularity Clock and the Ladder of Catastrophes',
  lede:
    "Two countdowns derived from a single extrapolation: METR's autonomous task horizon. Everything below is a formalised judgement, not a measurement of the future. Move the sliders: if a date shifts by twenty years that easily, it was never a forecast.",

  presetLabel: 'Preset',
  presets: {
    base: 'Baseline',
    optimist: 'Optimist',
    skeptic: 'Sceptic',
    anxious: 'Anxious',
    doomsday: 'Doomsday',
  },
  customScenario: 'Custom scenario',

  singularityCard: 'To singularity',
  catastropheCard: 'To the first catastrophe of any level',
  neverInModel: 'beyond the model',
  neverInModelHint: 'probability stays under 50% through 2100',
  alreadyHappened: 'already happened',

  singularityNote:
    'The moment AI overtakes the median professional in {pct} of {total} kinds of activity. Already passed: {passed}.',
  catastropheNote:
    'Median date of the first event at the local level or worse. This is not the end of the world — it is the bottom rung of the ladder.',
  dateIs: 'Date',

  clockTitle: 'The Doomsday Clock, recomputed by the model',
  clockNote:
    'to midnight. Scale: 15 minutes means global catastrophe is ruled out, midnight means it is certain. The model currently gives {p} for the global level through 2100.',
  minutes: { one: 'minute', other: 'minutes' },
  seconds: { one: 'second', other: 'seconds' },
  alert: { calm: 'Calm', watchful: 'Watchful', serious: 'Serious', critical: 'Critical' },

  controlsSingularity: 'Assumptions about speed',
  controlsRisk: 'Assumptions about risk',

  expectedTitle: 'Expected value by {year}',
  expectedDeaths:
    'expected deaths: summed over three levels, probability × geometric mean of the range',
  expectedUsd: 'expected direct damage in 2026 dollars',

  sliders: {
    doublingDays: {
      label: 'Horizon doubling time',
      unit: 'd',
      hint: 'METR: 196 days across the full sample since 2019, 131 days counting from 2023, 89 days from 2024.',
    },
    friction: {
      label: 'Real-world friction',
      unit: '',
      hint: 'How much more optimistic the benchmark is than life: power grids, chips, data, regulators, human inertia. 1.0 means the chart is reality.',
    },
    singularityPct: {
      label: 'Singularity threshold',
      unit: '%',
      hint: 'What share of the 30 kinds of activity must be passed before a date is declared.',
    },
    malicePct: {
      label: 'Share of malicious use',
      unit: '%',
      hint: 'How readily people will turn available capability to harm. The main driver of the bottom rung.',
    },
    alignFailPct: {
      label: 'Probability of control failure',
      unit: '%',
      hint: 'The system does something other than what it was deployed for at a critical moment, and it cannot be rolled back. The main driver of the top rung.',
    },
    mitigationPct: {
      label: 'Mitigation effectiveness',
      unit: '%',
      hint: 'Regulation, audit, kill switches, treaties. Works worse on the top rung: you have to prevent something that has never happened.',
    },
    dep0Pct: {
      label: 'Current wiring into critical systems',
      unit: '%',
      hint: 'What share of energy, finance, logistics, weapons and medicine is already handed to autonomous loops.',
    },
    tauYears: {
      label: 'Time to deployment saturation',
      unit: 'yr',
      hint: 'How many years it takes for wiring to reach its ceiling.',
    },
    adaptWindowYears: {
      label: 'Window of vulnerability',
      unit: 'yr',
      hint: 'Once capability plateaus, the world learns to live with it and risk decays over this period. Set it to 100 and it never decays.',
    },
  },

  targetLabel: 'Task threshold',
  targetHint:
    'How long a stretch of human work AI must complete unaided for it to count. Working time, not calendar time.',
  targets: { day: '1 day', week: '1 week', month: '1 month', year: '1 year' },

  reliabilityLabel: 'Required reliability',
  reliabilityHint:
    'METR measures the horizon at 50% success. An 80% bar pushes the date out by roughly 2.3 doublings: a coin-flip system cannot be called reliable.',
  reliability50: '50% success',
  reliability80: '80% success',

  reset: 'Reset to baseline',
  copyLink: 'Copy a link to this scenario',
  copied: 'Copied',
  linkFromOtherVersion:
    'This link was made in a different model version and could not be restored. Showing the baseline preset.',

  disclaimerTitle: 'Separately, and without irony.',
  disclaimer:
    'This apparatus does not predict the future and cannot. An event that has never occurred has no training sample, no validation, and no way to tell a good model from a pretty one. All that happens here is that assumptions get laid out so you can see which one carries the whole load. If the control-failure slider moves the global date by forty years and the doubling-time slider moves it by five, then the argument is about the first one. That is the entire value; the dates are a by-product.',

  anchorNote: 'Anchor point: a 50% horizon of {horizon} minutes, {model}, {date}.',
  estimateMark: 'estimate',
  milestoneNote:
    'The activity breakdown, charts and trigger panel arrive in the next step.',
};

export const MESSAGES: Record<Locale, Messages> = { ru, en };

/** Подстановка `{ключ}` в строку. Форматирование чисел — до вызова. */
export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
