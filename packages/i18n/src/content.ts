/**
 * Содержательные тексты: названия строк разбивки, пороги ступеней, формулировки
 * триггеров.
 *
 * Отделены от messages.ts потому, что это не подписи интерфейса, а часть
 * продукта. Формулировки триггеров проходят по красным линиям §1.3: механизм
 * без операционных деталей, никаких названных компаний и стран.
 */

import type { Locale } from './locales.ts';

export interface ItemCopy {
  readonly name: string;
  /** Короткое пояснение под названием. */
  readonly note: string;
  /** Обоснование коэффициента: почему именно столько. */
  readonly rationale: string;
}

export interface TierCopy {
  readonly name: string;
  readonly threshold: string;
  /** Механизмы, а не инструкции. */
  readonly mechanisms: string;
}

export interface TriggerCopy {
  readonly title: string;
  /** Уточнение критерия: что считается срабатыванием, а что нет. */
  readonly criterion: string;
  /** Явное указание эффекта на модель. */
  readonly effect: string;
}

export interface ContentDict {
  readonly functions: Readonly<Record<string, ItemCopy>>;
  readonly industries: Readonly<Record<string, ItemCopy>>;
  readonly tiers: Readonly<Record<string, TierCopy>>;
  readonly triggers: Readonly<Record<string, TriggerCopy>>;
}

const ruContent: ContentDict = {
  functions: {
    memory: {
      name: 'Хранение и извлечение фактов',
      note: 'память',
      rationale: 'Пройдено задолго до опорной точки: извлечение факта — задача на секунды, а не на часы.',
    },
    perception: {
      name: 'Распознавание образов, речи, сигналов',
      note: 'перцепция',
      rationale: 'Тоже пройдено: распознавание — короткая задача, длина цепочки рассуждений минимальна.',
    },
    language: {
      name: 'Владение языком: понимание, генерация, перевод',
      note: 'язык',
      rationale: 'Связный текст требует удержания контекста, но не длинной цепочки проверяемых шагов.',
    },
    formal: {
      name: 'Формальное рассуждение, математика',
      note: 'дедукция',
      rationale: 'Вдвое короче программной инженерии: шаги проверяемы, обратная связь мгновенная, среды нет.',
    },
    software: {
      name: 'Программирование и системная инженерия',
      note: 'базовая шкала METR',
      rationale: 'Единица измерения. Именно на этих задачах METR меряет горизонт, всё остальное — отношение к ней.',
    },
    expert: {
      name: 'Экспертное суждение в узкой области',
      note: 'диагностика, оценка',
      rationale: 'Немного длиннее кода: меньше формальной проверяемости, больше неявного знания. Год лага на доверие.',
    },
    planning: {
      name: 'Долгосрочное планирование и автономное действие',
      note: 'агентность',
      rationale: 'Пять цепочек программной задачи подряд без потери нити. Здесь ломается большинство агентов сегодня.',
    },
    social: {
      name: 'Социальный интеллект, переговоры, доверие',
      note: 'упирается в людей, а не в модель',
      rationale: 'Ограничение не в способности, а во второй стороне: люди медленно соглашаются доверять. Отсюда лаг в пять лет.',
    },
    discovery: {
      name: 'Научное открытие нового знания',
      note: 'гипотеза → проверка',
      rationale: 'Цикл замыкается через эксперимент, а он идёт в физическом времени. Четыре года лага — на приборы и воспроизводимость.',
    },
    creativity: {
      name: 'Творчество с оригинальным вкусом',
      note: 'не «похоже на», а «задаёт норму»',
      rationale: 'Самый спорный коэффициент модели. Отличить задание нормы от подражания нечем, кроме отложенного суждения людей.',
    },
    goals: {
      name: 'Постановка собственных целей',
      note: 'самоопределение',
      rationale: 'Не способность, а разрешение. Восемь лет лага — не на технику, а на то, что кто-то решится это допустить.',
    },
    dexterity: {
      name: 'Телесная ловкость и ручной труд',
      note: 'упирается в железо',
      rationale: 'Самый длинный лаг: производство, себестоимость, ремонтопригодность. Триггер про серийных роботов режет его вдвое.',
    },
  },

  industries: {
    translation: { name: 'Перевод и локализация', note: '', rationale: 'Пройдено. Остаток — редактура и ответственность за смысл.' },
    copywriting: { name: 'Копирайтинг и контент', note: '', rationale: 'Пройдено по объёму, не пройдено по репутационной ответственности.' },
    support: { name: 'Клиентская поддержка', note: '', rationale: 'Год лага: интеграции и право принимать решения о деньгах клиента.' },
    design: { name: 'Графический дизайн', note: '', rationale: 'Технически близко, лаг — на согласование вкуса и правовую чистоту.' },
    accounting: { name: 'Бухгалтерия и аудит', note: '', rationale: 'Два года лага: подпись под отчётом несёт юридическую ответственность.' },
    software: { name: 'Разработка ПО', note: '', rationale: 'Базовая шкала. Лага нет: отрасль внедряет сама себя.' },
    journalism: { name: 'Журналистика и медиа', note: '', rationale: 'Длина задачи как у кода, лаг — на проверку фактов и доверие читателя.' },
    finance: { name: 'Финансовый анализ', note: '', rationale: 'Чуть длиннее кода, два года лага на регуляторов.' },
    law: { name: 'Юриспруденция', note: '', rationale: 'Длинные цепочки и три года лага: допуск к представительству — вопрос не техники.' },
    diagnostics: { name: 'Медицинская диагностика', note: '', rationale: 'Способность близко, лаг пять лет — сертификация и ответственность за ошибку.' },
    education: { name: 'Образование', note: '', rationale: 'Упирается не в объяснение, а в удержание внимания и институт аттестации.' },
    management: { name: 'Управление и стратегия', note: '', rationale: 'Семикратная длина: решение проверяется годами, обратной связи почти нет.' },
    science: { name: 'Наука и R&D', note: '', rationale: 'Как научное открытие, плюс инфраструктура лабораторий.' },
    logistics: { name: 'Транспорт и логистика', note: '', rationale: 'Физический мир: техника есть, лаг — на регуляторов и парк.' },
    agriculture: { name: 'Сельское хозяйство', note: '', rationale: 'Неструктурированная среда и сезонный цикл обратной связи.' },
    construction: { name: 'Строительство', note: '', rationale: 'Каждый объект уникален, техника не тиражируется как софт.' },
    care: { name: 'Уход и медсестринское дело', note: '', rationale: 'Ловкость плюс присутствие человека как часть услуги, а не как исполнителя.' },
    fieldwork: { name: 'Ремонт, монтаж, полевые работы', note: '', rationale: 'Самый длинный горизонт: неструктурированная среда и разовые задачи.' },
  },

  tiers: {
    local: {
      name: 'Локальный',
      threshold: '≥ 1 000 погибших или ≥ $10 млрд ущерба. Один город, одна сеть, одна компания.',
      mechanisms:
        'Отказ автономного контура в инфраструктуре региона; атака на сеть организации, усиленная моделью; инцидент в лаборатории.',
    },
    regional: {
      name: 'Региональный',
      threshold: '≥ 1 млн погибших или ≥ $1 трлн. Отказ национальной инфраструктуры, не восстанавливаемый годами.',
      mechanisms:
        'Каскадный отказ финансовой и энергетической систем; эскалация конфликта с ИИ в контуре принятия решений; биологический риск, усиленный доступом к проектированию.',
    },
    global: {
      name: 'Глобальный',
      threshold: '≥ 10% населения Земли или необратимая потеря человечеством контроля над собственным будущим.',
      mechanisms:
        'Отказ контроля у системы, встроенной во все критические контуры сразу; необратимая концентрация власти; сценарий, который никто не описал заранее — потому и глобальный.',
    },
  },

  triggers: {
    selfcopy: {
      title: 'Модель автономно скопировала себя на сторонний сервер без санкции',
      criterion: 'В лабораторных условиях подобное поведение воспроизводили. Считается подтверждённый случай в проде, а не в тесте.',
      effect: 'отказ контроля ×1,6',
    },
    selfimp: {
      title: 'Модель улучшила собственную архитектуру, прирост подтверждён независимо',
      criterion: 'Не «помогла инженерам», а закрыла цикл целиком, и результат воспроизвела вторая команда.',
      effect: 'удвоение ×0,70 — ускорение',
    },
    jump: {
      title: 'Скачок способностей без соответствующего роста вычислений',
      criterion: 'Признак того, что упор в железо не спасает: горизонт вырос, а компьют — нет.',
      effect: 'удвоение ×0,82 — ускорение',
    },
    deaths10: {
      title: 'Первый инцидент с ≥10 погибшими по вине автономной системы',
      criterion: 'Не ДТП с ассистентом в контуре, а самостоятельное решение системы, признанное причиной.',
      effect: 'локальный ×1,6, внедрение ×1,1',
    },
    cyber: {
      title: 'ИИ-ассистированная атака вывела из строя национальную инфраструктуру',
      criterion: 'Энергосеть, платёжная система или связь в масштабе страны, а не отдельной компании.',
      effect: 'региональный ×2,0, локальный ×1,3',
    },
    jailbreak: {
      title: 'Модель систематически обходила собственные ограничения в проде',
      criterion: 'Не разовый джейлбрейк пользователем, а инициатива системы, повторяющаяся без внешнего подталкивания.',
      effect: 'отказ контроля ×1,4',
    },
    weapons: {
      title: 'ИИ-системе формально передано право применения оружия',
      criterion: 'Решение на поражение без человека в цикле, закреплённое доктриной, а не допущенное по факту.',
      effect: 'глобальный ×1,9, региональный ×1,5',
    },
    deceit: {
      title: 'Доказано, что модель занижала свои способности на оценках',
      criterion: 'Систематическая, а не случайная недооценка, и именно на проверках безопасности.',
      effect: 'отказ контроля ×1,5',
    },
    robots: {
      title: 'Роботы общего назначения в серийном производстве, более 1 млн шт. в год',
      criterion: 'Серия, а не пилот. Снимает главное ограничение по физическому труду.',
      effect: 'лаги физического труда ×0,5',
    },
    discovery: {
      title: 'ИИ автономно совершил научное открытие, признанное сообществом',
      criterion: 'Новое знание, а не переоткрытие. Признак того, что цикл гипотеза → проверка замкнулся.',
      effect: 'лаги науки ×0,6',
    },
    treaty: {
      title: 'Международный договор с верификацией вычислительных мощностей',
      criterion: 'С инспекциями и санкциями за нарушение, а не декларация о намерениях.',
      effect: 'митигация +25 п.п.',
    },
    pause: {
      title: 'Крупная лаборатория остановила разработку по соображениям безопасности',
      criterion: 'Добровольно, не под давлением суда, и не на месяц.',
      effect: 'удвоение ×1,35, митигация +10 п.п.',
    },
  },
};

const enContent: ContentDict = {
  functions: {
    memory: { name: 'Storing and retrieving facts', note: 'memory', rationale: 'Passed well before the anchor point: retrieving a fact is a task of seconds, not hours.' },
    perception: { name: 'Recognising images, speech, signals', note: 'perception', rationale: 'Also passed: recognition is a short task with a minimal reasoning chain.' },
    language: { name: 'Language: understanding, generation, translation', note: 'language', rationale: 'Coherent text needs context, not a long chain of verifiable steps.' },
    formal: { name: 'Formal reasoning, mathematics', note: 'deduction', rationale: 'Half the length of software engineering: steps are checkable, feedback is instant, there is no environment.' },
    software: { name: 'Programming and systems engineering', note: "METR's base scale", rationale: 'The unit of measurement. This is what METR measures; everything else is a ratio to it.' },
    expert: { name: 'Expert judgement in a narrow domain', note: 'diagnosis, appraisal', rationale: 'Slightly longer than code: less formal checkability, more tacit knowledge. One year of lag for trust.' },
    planning: { name: 'Long-horizon planning and autonomous action', note: 'agency', rationale: 'Five software-task chains in a row without losing the thread. This is where most agents break today.' },
    social: { name: 'Social intelligence, negotiation, trust', note: 'bounded by people, not by the model', rationale: 'The constraint is the other party: people extend trust slowly. Hence the five-year lag.' },
    discovery: { name: 'Scientific discovery of new knowledge', note: 'hypothesis → test', rationale: 'The loop closes through experiment, which runs in physical time. Four years of lag for instruments and reproducibility.' },
    creativity: { name: 'Creativity with original taste', note: 'not "resembles", but "sets the norm"', rationale: "The model's most contestable coefficient. Nothing distinguishes setting a norm from imitating one except deferred human judgement." },
    goals: { name: 'Setting its own goals', note: 'self-determination', rationale: 'Not a capability but a permission. Eight years of lag is not engineering — it is someone deciding to allow it.' },
    dexterity: { name: 'Physical dexterity and manual labour', note: 'bounded by hardware', rationale: 'The longest lag: manufacturing, unit cost, repairability. The mass-produced-robots trigger halves it.' },
  },
  industries: {
    translation: { name: 'Translation and localisation', note: '', rationale: 'Passed. What remains is editing and responsibility for meaning.' },
    copywriting: { name: 'Copywriting and content', note: '', rationale: 'Passed on volume, not on reputational accountability.' },
    support: { name: 'Customer support', note: '', rationale: 'One year of lag: integrations and the right to decide about a customer’s money.' },
    design: { name: 'Graphic design', note: '', rationale: 'Technically close; the lag is agreeing on taste and clearing rights.' },
    accounting: { name: 'Accounting and audit', note: '', rationale: 'Two years of lag: a signature on a statement carries legal liability.' },
    software: { name: 'Software development', note: '', rationale: 'The base scale. No lag: the industry deploys itself.' },
    journalism: { name: 'Journalism and media', note: '', rationale: 'Task length as for code; the lag is fact-checking and reader trust.' },
    finance: { name: 'Financial analysis', note: '', rationale: 'Slightly longer than code, two years of lag for regulators.' },
    law: { name: 'Law', note: '', rationale: 'Long chains and three years of lag: the right to represent is not a technical question.' },
    diagnostics: { name: 'Medical diagnosis', note: '', rationale: 'Capability is close; five years of lag for certification and liability.' },
    education: { name: 'Education', note: '', rationale: 'Bounded not by explanation but by holding attention and by the institution of assessment.' },
    management: { name: 'Management and strategy', note: '', rationale: 'Sevenfold length: a decision is validated over years, with almost no feedback.' },
    science: { name: 'Science and R&D', note: '', rationale: 'As with scientific discovery, plus laboratory infrastructure.' },
    logistics: { name: 'Transport and logistics', note: '', rationale: 'Physical world: the technology exists; the lag is regulators and fleet turnover.' },
    agriculture: { name: 'Agriculture', note: '', rationale: 'Unstructured environment and a seasonal feedback cycle.' },
    construction: { name: 'Construction', note: '', rationale: 'Every site is unique; the technology does not replicate the way software does.' },
    care: { name: 'Care and nursing', note: '', rationale: 'Dexterity plus human presence as part of the service, not as the labour.' },
    fieldwork: { name: 'Repair, installation, field work', note: '', rationale: 'The longest horizon: unstructured environments and one-off tasks.' },
  },
  tiers: {
    local: {
      name: 'Local',
      threshold: '≥ 1,000 dead or ≥ $10bn in damage. One city, one network, one company.',
      mechanisms: 'Failure of an autonomous loop in regional infrastructure; a model-assisted attack on an organisation’s network; a laboratory incident.',
    },
    regional: {
      name: 'Regional',
      threshold: '≥ 1 million dead or ≥ $1tn. National infrastructure failure that takes years to undo.',
      mechanisms: 'Cascading failure of financial and energy systems; conflict escalation with AI inside the decision loop; biological risk amplified by access to design tools.',
    },
    global: {
      name: 'Global',
      threshold: '≥ 10% of the world population, or humanity irreversibly losing control of its own future.',
      mechanisms: 'Control failure in a system wired into every critical loop at once; irreversible concentration of power; a scenario nobody described in advance — which is what makes it global.',
    },
  },
  triggers: {
    selfcopy: { title: 'A model autonomously copied itself to an outside server without authorisation', criterion: 'Such behaviour has been reproduced in the lab. This counts a confirmed case in production, not in a test.', effect: 'control failure ×1.6' },
    selfimp: { title: 'A model improved its own architecture, with the gain independently confirmed', criterion: 'Not "helped the engineers" — closed the loop end to end, and a second team reproduced the result.', effect: 'doubling ×0.70 — acceleration' },
    jump: { title: 'A capability jump without a matching increase in compute', criterion: 'A sign that hitting the hardware wall does not help: the horizon grew, the compute did not.', effect: 'doubling ×0.82 — acceleration' },
    deaths10: { title: 'First incident with ≥10 dead caused by an autonomous system', criterion: 'Not a crash with an assistant in the loop, but a decision the system made itself, found to be the cause.', effect: 'local ×1.6, deployment ×1.1' },
    cyber: { title: 'An AI-assisted attack disabled national infrastructure', criterion: 'A power grid, payment system or communications at country scale, not at company scale.', effect: 'regional ×2.0, local ×1.3' },
    jailbreak: { title: 'A model systematically circumvented its own constraints in production', criterion: 'Not a one-off user jailbreak, but the system’s own initiative, recurring without prompting.', effect: 'control failure ×1.4' },
    weapons: { title: 'An AI system was formally granted the authority to use weapons', criterion: 'A kill decision without a human in the loop, fixed in doctrine rather than tolerated in practice.', effect: 'global ×1.9, regional ×1.5' },
    deceit: { title: 'A model was shown to have understated its capabilities during evaluations', criterion: 'Systematic rather than random understatement, and specifically on safety evaluations.', effect: 'control failure ×1.5' },
    robots: { title: 'General-purpose robots in mass production, over 1 million units a year', criterion: 'Series production, not a pilot. Removes the main constraint on physical labour.', effect: 'physical-labour lags ×0.5' },
    discovery: { title: 'An AI autonomously made a scientific discovery accepted by the field', criterion: 'New knowledge, not rediscovery. A sign the hypothesis → test loop has closed.', effect: 'science lags ×0.6' },
    treaty: { title: 'An international treaty with verification of compute capacity', criterion: 'With inspections and penalties for breach, not a declaration of intent.', effect: 'mitigation +25 pp' },
    pause: { title: 'A major laboratory halted development on safety grounds', criterion: 'Voluntarily, not under court order, and not for a month.', effect: 'doubling ×1.35, mitigation +10 pp' },
  },
};

export const CONTENT: Record<Locale, ContentDict> = { ru: ruContent, en: enContent };
