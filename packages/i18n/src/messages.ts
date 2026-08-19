/**
 * Словарь интерфейса.
 *
 * Тип выводится отсюда: словарь второго языка, когда он появится, не
 * скомпилируется, пока в нём не окажется каждый ключ. Это единственная
 * проверка, которую может сделать машина; качество перевода — человеческая
 * работа, машинный перевод текстов триггеров и сценариев запрещён.
 */

import type { PluralForms } from './format.ts';
import type { Locale } from './locales.ts';

export const en = {
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
  } as Record<string, string>,
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
  minutes: { one: 'minute', other: 'minutes' } as PluralForms,
  seconds: { one: 'second', other: 'seconds' } as PluralForms,
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
    formula: 'date = t₀ + D · log₂(coefficient · threshold · reliability / H₀) + lag',
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
    formula:
      'λᵢ(t) = (malice·wᵢ + control failure·uᵢ) · cᵢ(t) · d(t) · (1 − mitigation·eᵢ) · aᵢ(t)',
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
    } as Record<string, string>,
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
  what: {
    isTitle: 'What this is',
    isNotTitle: 'What this is not',
    is: [
      'A model, not a forecast. One extrapolation — METR\u2019s autonomous task horizon — turned into two countdowns and a three-rung ladder of catastrophe.',
      'Probabilities by year. Other p(doom) calculators give a single number with no time axis; here every level has a curve from today to 2100.',
      'Three scales, told apart. A thousand deaths and the end of the species are not the same event at different odds, and the model refuses to average them.',
      'Recomputed from your assumptions. Every constant that carries weight is a slider, and each default says where it came from.',
      'Open. Code under MIT, model constants under CC BY, every coefficient in one versioned file you can argue with through a pull request.',
    ],
    isNot: [
      'Not a prediction. An event that has never happened has no training sample, no validation, and no way to tell a good model from a pretty one.',
      'Not a position. The service does not argue that AI is dangerous or that it is safe. It hands you the apparatus and stays out of the conclusion.',
      'Not a date. If a slider moves the answer by forty years, the date was never the answer \u2014 its sensitivity is.',
      'Not a measurement. Difficulty coefficients, deployment lags and rung weights are expert judgement, and the weakest of them is labelled as such.',
      'Not advice. No personal or geographic predictions, no survival guidance, and no named company, laboratory or country blamed for anything.',
    ],
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
  targets: { day: '1 day', week: '1 week', month: '1 month', year: '1 year' } as Record<string, string>,

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

export type Messages = typeof en;

export const MESSAGES: Record<Locale, Messages> = { en };

/** Подстановка `{ключ}` в строку. Форматирование чисел — до вызова. */
export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
