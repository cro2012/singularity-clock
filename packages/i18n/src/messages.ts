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

  chart: {
    asChart: 'График',
    asTable: 'Таблица',
    year: 'Год',
    horizon: 'Горизонт',
    metrPoint: 'Точка METR',
    minutes: 'мин',
    today: 'сегодня',
    by: 'к',
    horizonTitle: 'Горизонт автономной задачи и его экстраполяция',
    horizonSubtitle:
      'Точки — оценки METR (до 2025 приблизительные, методика TH1/TH1.1). Линия закреплена в последней точке и построена по вашему времени удвоения — она не подогнана под историю, поэтому и расходится с ранними точками. Шкала логарифмическая: прямая = экспонента.',
    horizonSummary:
      'Опорная точка {anchor}, время удвоения {doubling} дней. Выбранный порог {target} достигается в {date}.',
    horizonReadout: '{date}: горизонт {horizon}',
    riskTitle: 'Накопленная вероятность события каждого уровня',
    riskSubtitle:
      'P(событие этого уровня или хуже произошло к году t), считая с сегодняшнего дня. Каждая кривая включает всё, что выше по лестнице, поэтому нижняя всегда лежит над верхней. Плато справа — следствие окна уязвимости: пережили переход — риск падает.',
    riskSummaryPrefix: 'Накопленная вероятность к 2050 и 2100 годам:',
  },
  keyboardHint: 'График фокусируется с клавиатуры: стрелки двигают курсор, Shift — шаг в десять лет, Esc убирает.',

  nav: {
    home: 'Счётчики',
    singularity: 'Сингулярность',
    catastrophe: 'Лестница катастроф',
    triggers: 'Триггеры',
    countries: 'Страны',
    compare: 'Сравнение',
    model: 'Как это считается',
  },
  navLabel: 'Разделы',
  scenarioKept: 'Сценарий сохраняется при переходе между разделами.',

  items: {
    functionColumn: 'Вид деятельности',
    industryColumn: 'Отрасль',
    progress: 'Прогресс',
    overtaken: 'Обгон',
    difficulty: 'Коэффициент сложности',
    lag: 'Лаг внедрения',
    years: 'лет',
    progressValue: 'Полоса',
    estimateNote:
      'Оценка: {date}, {relative}. Коэффициент и лаг — экспертное суждение, а не измерение.',
    inThePast: 'уже позади',
    inTheFuture: 'ещё впереди',
    functionsTitle: 'По видам мыслительной деятельности',
    industriesTitle: 'По отраслям и профессиям',
    howComputed: 'Как считается дата для каждой строки',
    formulaNote:
      'Горизонт METR измерен на задачах программной инженерии. Для остального задан коэффициент сложности относительно этой базы — во сколько раз более длинную цепочку рассуждений требует область, — и лаг внедрения в годах: время на железо, капитал, доверие и регуляторов после того, как способность технически появилась. Коэффициенты — экспертное суждение автора модели. Это самое слабое место всей конструкции, и оно ровно там, где вам, скорее всего, захочется спорить. Так и задумано.',
  },

  tiers: {
    median: 'медиана',
    noMedian: 'P < 50% до конца горизонта',
    pBy: 'P к',
    deaths: 'жертвы',
    damage: 'ущерб',
    nestedNote:
      'Каждая ступень — вероятность события этого уровня или хуже, поэтому нижняя всегда выше верхней. 34% локального включают в себя 3% глобального, а не идут вместо них.',
    formulaTitle: 'Формула интенсивности риска',
    formulaNote:
      'cᵢ(t) — способность: логистическая функция от логарифма горизонта относительно порога ступени. d(t) — подключённость, насыщающаяся экспонента. eᵢ — потолок эффективности митигации: 0,80 для локального, 0,60 для регионального, 0,45 для глобального. aᵢ(t) — затухание после насыщения способностей. Итог: P = 1 − exp(−∫λ dt), шаг интегрирования — год.',
    formulaHonesty:
      'Обратите внимание, что произведение четырёх множителей, каждый из которых вы задали на глаз, даёт величину с точностью в лучшем случае порядка. Все знаки после запятой в датах — вежливая ложь интерфейса.',
  },

  triggers: {
    accelerating: 'Разгоняющие',
    calming: 'Успокаивающие',
    intro:
      'Наблюдаемые события, каждое из которых сдвигает модель. Отмечайте то, что, по-вашему, уже произошло, — и смотрите, как прыгают даты. Это, пожалуй, единственная честная часть конструкции: не прогноз, а список того, за чем осмысленно следить. Автоматически здесь не включается ничего: отметка — ваше суждение.',
  },

  countries: {
    intro:
      'Семь компонентов, каждый нормирован в 0–100. Итог — взвешенная сумма, и веса задаёте вы. Это не украшение: вся содержательная разница между публичными индексами AI-лидерства сводится к весам, и прятать это было бы нечестно.',
    provisionalTitle: 'Данные не выверены.',
    provisional:
      'Баллы в таблице — заготовка под структуру рейтинга, а не измерение. До сверки с AI Index, Tortoise и OECD ни числа, ни порядок мест ничего не значат. Связь с моделью риска по этой причине выключена по умолчанию.',
    equalWeights: 'Равные веса',
    tableCaption: 'Рейтинг стран по AI-лидерству',
    country: 'Страна',
    score: 'Балл',
    breakdown: 'Доля от лидера',
    raceTitle: 'Индекс гонки',
    raceNote:
      'Концентрация лидерства по Херфиндалю–Хиршману на топ-5. Единица — пятеро равных, ноль — один доминирующий игрок.',
    geopoliticsToggle: 'Учитывать геополитику в модели риска',
    geopoliticsNote:
      'Допущение автора модели, а не установленный факт: чем ровнее гонка, тем труднее договориться. При включении потолок митигации умножается на (1 − {penalty} · индекс гонки), сейчас это −{effect}.',
    components: {
      research: 'Исследования',
      patents: 'Патенты и ИС',
      talent: 'Талант',
      infrastructure: 'Инфраструктура',
      investment: 'Инвестиции',
      commercialization: 'Коммерциализация',
      governance: 'Управление и регулирование',
    },
    componentHints: {
      research: 'Публикации, цитируемость, доля на топ-конференциях.',
      patents: 'Заявки, выданные патенты, доля в мировом объёме.',
      talent: 'Численность исследователей, приток и отток.',
      infrastructure: 'Доступный компьют, дата-центры, доступ к передовым чипам.',
      investment: 'Частные и государственные вложения, число сделок.',
      commercialization: 'Компании, выручка, проникновение в экономику.',
      governance: 'Зрелость регулирования, институты оценки, участие в договорах.',
    },
    names: {
      USA: 'США',
      CHN: 'Китай',
      GBR: 'Великобритания',
      KOR: 'Южная Корея',
      DEU: 'Германия',
      FRA: 'Франция',
      JPN: 'Япония',
      CAN: 'Канада',
      ISR: 'Израиль',
      IND: 'Индия',
      SGP: 'Сингапур',
      NLD: 'Нидерланды',
    } as Record<string, string>,
  },

  compare: {
    intro:
      'Две колонки с одинаковой структурой. Смысл не в том, чтобы узнать, какая дата «правильная», а в том, чтобы увидеть, насколько она зависит от того, во что вы верите. Отличающиеся допущения подсвечены.',
    sideA: 'Слева',
    sideB: 'Справа',
    swap: 'Поменять местами',
    assumption: 'Допущение',
    chartTitle: 'Накопленная вероятность: два сценария наложены',
    chartSubtitle:
      'Цвет закреплён за ступенью, а не за колонкой: сплошная и пунктирная линии одного цвета — это одна и та же величина при разных допущениях. Разные цвета читались бы как разные величины.',
    singularity: 'До сингулярности',
    catastrophe: 'До первой катастрофы',
    doomsday: 'Минут до полуночи',
    deaths: 'Ожидаемые жертвы к {year}',
    usd: 'Ожидаемый ущерб к {year}',
    identical: 'Сценарии совпадают — выберите разные, иначе сравнивать нечего.',
  },
  singularityIntro:
    'Определение здесь операциональное, а не мистическое: сингулярность наступила, когда ИИ выполняет самостоятельно, без человека в цикле, задачу заданной длины в заданной доле видов деятельности. Никакого «пробуждения сознания» — только момент, после которого прогнозировать экономику по человеческому труду становится бессмысленно.',
  catastropheIntro:
    '«Апокалипсис» — не событие, а шкала. Три порога, у каждого свой критерий, своя вероятность и свой доминирующий механизм: внизу лестницы правит злой умысел человека, наверху — отказ контроля. Модель считает не дату, а интенсивность риска λ(t), из неё — накопленную вероятность и медианную дату.',

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

  chart: {
    asChart: 'Chart',
    asTable: 'Table',
    year: 'Year',
    horizon: 'Horizon',
    metrPoint: 'METR point',
    minutes: 'min',
    today: 'today',
    by: 'by',
    horizonTitle: 'The autonomous task horizon and its extrapolation',
    horizonSubtitle:
      'Points are METR estimates (pre-2025 approximate, methodology TH1/TH1.1). The line is anchored at the latest point and drawn from your doubling time — it is not fitted to history, which is why it diverges from the early points. The scale is logarithmic: a straight line is an exponential.',
    horizonSummary:
      'Anchor {anchor}, doubling time {doubling} days. The selected threshold of {target} is reached in {date}.',
    horizonReadout: '{date}: horizon {horizon}',
    riskTitle: 'Cumulative probability of an event at each level',
    riskSubtitle:
      'P(an event at this level or worse has occurred by year t), counting from today. Each curve includes everything above it on the ladder, so the bottom rung always sits above the top one. The plateau on the right follows from the window of vulnerability: survive the transition and risk falls.',
    riskSummaryPrefix: 'Cumulative probability by 2050 and 2100:',
  },
  keyboardHint: 'The chart is keyboard focusable: arrows move the cursor, Shift jumps ten years, Esc clears it.',

  nav: {
    home: 'Counters',
    singularity: 'Singularity',
    catastrophe: 'Ladder of catastrophes',
    triggers: 'Triggers',
    countries: 'Countries',
    compare: 'Comparison',
    model: 'How it is computed',
  },
  navLabel: 'Sections',
  scenarioKept: 'Your scenario is carried across sections.',

  items: {
    functionColumn: 'Kind of activity',
    industryColumn: 'Industry',
    progress: 'Progress',
    overtaken: 'Overtaken',
    difficulty: 'Difficulty coefficient',
    lag: 'Deployment lag',
    years: 'years',
    progressValue: 'Bar',
    estimateNote:
      'Estimate: {date}, {relative}. The coefficient and the lag are expert judgement, not measurement.',
    inThePast: 'already behind us',
    inTheFuture: 'still ahead',
    functionsTitle: 'By kind of cognitive activity',
    industriesTitle: 'By industry and profession',
    howComputed: 'How each row gets its date',
    formulaNote:
      "METR's horizon is measured on software engineering tasks. Everything else gets a difficulty coefficient relative to that base — how many times longer a chain of reasoning the domain demands — and a deployment lag in years: the time for hardware, capital, trust and regulators after the capability technically exists. The coefficients are the author's expert judgement. This is the weakest point of the whole construction, and it is exactly where you will most likely want to argue. That is the intent.",
  },

  tiers: {
    median: 'median',
    noMedian: 'P < 50% within the horizon',
    pBy: 'P by',
    deaths: 'deaths',
    damage: 'damage',
    nestedNote:
      'Each rung is the probability of an event at that level or worse, so the bottom rung always sits above the top one. 34% local includes the 3% global, it does not replace it.',
    formulaTitle: 'The risk intensity formula',
    formulaNote:
      'cᵢ(t) is capability: a logistic function of the log horizon relative to the rung threshold. d(t) is wiring, a saturating exponential. eᵢ is the mitigation ceiling: 0.80 local, 0.60 regional, 0.45 global. aᵢ(t) is decay after capability saturation. Result: P = 1 − exp(−∫λ dt), integrated in yearly steps.',
    formulaHonesty:
      'Note that a product of four multipliers, each of which you set by eye, yields a quantity accurate to an order of magnitude at best. Every decimal place in these dates is a polite lie told by the interface.',
  },

  triggers: {
    accelerating: 'Accelerating',
    calming: 'Calming',
    intro:
      'Observable events, each of which moves the model. Tick what you believe has already happened and watch the dates jump. This is arguably the only honest part of the construction: not a forecast, but a list of what is worth watching. Nothing is ever ticked automatically — the mark is your judgement.',
  },

  countries: {
    intro:
      'Seven components, each normalised to 0–100. The total is a weighted sum, and you set the weights. That is not decoration: the entire substantive difference between public AI-leadership indices comes down to weights, and hiding that would be dishonest.',
    provisionalTitle: 'These figures are not verified.',
    provisional:
      'The scores in this table are a placeholder for the structure of the ranking, not a measurement. Until they are reconciled with AI Index, Tortoise and OECD, neither the numbers nor the ordering mean anything. For that reason the link to the risk model is off by default.',
    equalWeights: 'Equal weights',
    tableCaption: 'Country ranking by AI leadership',
    country: 'Country',
    score: 'Score',
    breakdown: 'Share of the leader',
    raceTitle: 'Race index',
    raceNote:
      'Herfindahl–Hirschman concentration of leadership across the top five. One means five equals, zero means a single dominant player.',
    geopoliticsToggle: 'Account for geopolitics in the risk model',
    geopoliticsNote:
      "The author's assumption, not an established fact: the tighter the race, the harder it is to agree. When on, the mitigation ceiling is multiplied by (1 − {penalty} × race index), currently −{effect}.",
    components: {
      research: 'Research',
      patents: 'Patents and IP',
      talent: 'Talent',
      infrastructure: 'Infrastructure',
      investment: 'Investment',
      commercialization: 'Commercialisation',
      governance: 'Governance and regulation',
    },
    componentHints: {
      research: 'Publications, citations, share at top conferences.',
      patents: 'Applications, grants, share of the world total.',
      talent: 'Researcher headcount, inflow and outflow.',
      infrastructure: 'Available compute, data centres, access to frontier chips.',
      investment: 'Private and public funding, deal count.',
      commercialization: 'Companies, revenue, penetration into the economy.',
      governance: 'Regulatory maturity, evaluation institutions, treaty participation.',
    },
    names: {
      USA: 'United States',
      CHN: 'China',
      GBR: 'United Kingdom',
      KOR: 'South Korea',
      DEU: 'Germany',
      FRA: 'France',
      JPN: 'Japan',
      CAN: 'Canada',
      ISR: 'Israel',
      IND: 'India',
      SGP: 'Singapore',
      NLD: 'Netherlands',
    },
  },

  compare: {
    intro:
      'Two columns with the same structure. The point is not to find out which date is "right" but to see how much it depends on what you believe. Assumptions that differ are highlighted.',
    sideA: 'Left',
    sideB: 'Right',
    swap: 'Swap sides',
    assumption: 'Assumption',
    chartTitle: 'Cumulative probability: two scenarios overlaid',
    chartSubtitle:
      'Colour belongs to the rung, not to the column: a solid and a dashed line of the same colour are the same quantity under different assumptions. Two different colours would read as two different quantities.',
    singularity: 'To singularity',
    catastrophe: 'To the first catastrophe',
    doomsday: 'Minutes to midnight',
    deaths: 'Expected deaths by {year}',
    usd: 'Expected damage by {year}',
    identical: 'The scenarios are identical — pick different ones, otherwise there is nothing to compare.',
  },
  singularityIntro:
    'The definition here is operational, not mystical: singularity has arrived when AI completes, unaided and with no human in the loop, a task of a given length across a given share of activities. No "awakening of consciousness" — only the point past which forecasting the economy in terms of human labour stops making sense.',
  catastropheIntro:
    '"Apocalypse" is not an event but a scale. Three thresholds, each with its own criterion, its own probability and its own dominant mechanism: human malice rules the bottom of the ladder, control failure the top. The model computes not a date but a risk intensity, and from it a cumulative probability and a median date.',

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
