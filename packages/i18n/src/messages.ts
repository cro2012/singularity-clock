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
  eyebrow: 'A half-joking interface for a serious uncertainty',
  title: 'The Singularity Clock and the Ladder of Catastrophes',
  lede:
    "Two countdowns derived from a single extrapolation: METR's autonomous task horizon. Everything below is a formalised judgement, not a measurement of the future. Move the sliders: if a date shifts by twenty years that easily, it was never a forecast.",

  presetLabel: 'Preset',
  presets: {
    base: 'Author baseline',
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

  clockTitle: 'The totally unofficial AI Risk Clock',
  clockNote:
    'to midnight. The model puts global catastrophe by {year} at {p}. The dial is logarithmic: five minutes of hand per order of magnitude of probability, so the range people actually argue over is visible instead of bunched up against the top. The hand position is not the probability \u2014 read the percentage. Not affiliated with the real Doomsday Clock of the Bulletin of the Atomic Scientists.',
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
      'Points are METR 50% time-horizon estimates, all from the Time Horizon 1.1 measurement round. The line is anchored at the point you selected above and drawn from your doubling time — it is not fitted to history, which is why it diverges from the early points. The scale is logarithmic: a straight line is an exponential.',
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
    rung: 'Rung',
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
    reveal: 'Show unverified prototype data',
    hidden:
      'The country table is hidden by default. The numbers below have not been reconciled with any source, and a screenshot of them would travel further than this warning.',
    provisional:
      'The scores in this table are a placeholder for the structure of the ranking, not a measurement. Until they are reconciled with AI Index, Tortoise and OECD, neither the numbers nor the ordering mean anything. For that reason the link to the risk model is off by default.',
    equalWeights: 'Equal weights',
    tableCaption: 'Country ranking by AI leadership',
    country: 'Country',
    score: 'Score',
    breakdown: 'Share of the leader',
    raceTitle: 'AI race competitiveness',
    raceNote:
      'Derived as 1 − normalised Herfindahl–Hirschman concentration across the top five. 1 means an evenly matched race, 0 means a single dominant leader. Note the inversion: plain HHI rises with concentration, this index falls with it.',
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
  purpose: {
    kicker: 'The date is not the result. The sensitivity is.',
    lead:
      'This is an interactive stress test for AI futures, not a forecasting service. It starts from one measured quantity \u2014 how long a task frontier AI can finish on its own \u2014 extrapolates it, and then asks you for everything the extrapolation cannot answer: how fast capability gets deployed, how often it gets misused, whether a failure can be rolled back, how well any of it can be mitigated.',
    steps: [
      {
        title: 'It starts from measured data',
        body:
          'METR measures the length of software, ML and security tasks that frontier models complete unaided. That number is external, dated and sourced.',
      },
      {
        title: 'You supply the assumptions',
        body:
          'Everything after that measurement is judgement: transfer to other domains, deployment lags, misuse, control failure, mitigation. All of it sits on sliders instead of being buried in the code.',
      },
      {
        title: 'The point is how much the answer moves',
        body:
          'Move one slider and a date can jump by decades; move another and it barely twitches. Which sliders matter is the actual output of this service. The dates are a by-product.',
      },
    ],
    takeaway:
      'Most arguments about AI risk look like arguments about dates. They are almost always arguments about two or three hidden assumptions. This is a place to find out which ones.',
  },

  sensitivity: {
    title: 'What actually drives this result?',
    subtitle:
      'Each assumption is nudged by a fifth of its range in both directions, with everything else held where you left it, and the bar shows how far {metric} moves. Long bar means the argument is about that assumption; short bar means it is not worth having.',
    metric: 'global catastrophe risk by {year}',
    assumption: 'Assumption',
    effect: 'Effect',
    negligible: 'below 0.1 pp',
  },

  provenance: {
    measured: 'MEASURED',
    extrapolated: 'EXTRAPOLATED',
    assumed: 'ASSUMED',
    unverified: 'UNVERIFIED',
    measuredNote: 'An external observation with a source and a date.',
    extrapolatedNote: 'A mathematical continuation of an observed trend, not an observation.',
    assumedNote: 'An expert judgement by the author of the model. Contestable by design.',
    unverifiedNote: 'Draft data that has not been reconciled with any source. Treat as illustrative.',
    legend: 'Every number on this site is one of four kinds:',
  },

  impliedReduction: {
    title: 'Implied risk reduction',
    note:
      'The slider is a strength, not a percentage of risk removed. Each rung caps how much mitigation can achieve, and the cap is lowest where the event has never happened before.',
  },

  metrCaveat: {
    title: 'What METR measures, and what this model adds on top',
    body:
      'METR\u2019s task suite is primarily software engineering, machine learning and cybersecurity, with self-contained tasks and automatic success criteria. METR is explicit that a horizon of N hours does not mean AI can do every N-hour human job: real work carries prior context, human interaction and success criteria nobody can score automatically. Everything past software here \u2014 all thirty rows below \u2014 is reached through transfer coefficients and deployment lags defined by the author of this model, not by METR. METR also warns that measurements above 16 hours are unreliable on the current suite, which is well short of the month and year thresholds this page lets you select.',
  },

  anchor: {
    title: 'The measured anchor',
    lead:
      'Everything here is extrapolated from one measurement: how long a task a frontier model finishes on its own, half the time. Every other number on this site is a judgement, so this one gets a source, a date and a choice.',
    cutoff: 'METR data cutoff',
    anchorIs: 'Anchor',
    ci: '95% CI',
    released: 'measured on the model released {date}',
    pick: 'Anchor point',
    useLatest: 'Use latest METR frontier',
    whyTitle: 'Why this anchor and not the highest one?',
    whyBody:
      'The default is the most recent measurement METR still stands behind. METR warns that anything above 16 hours is unreliable on its current task suite, and the frontier point sits above that line with a confidence interval spanning most of an order of magnitude. You can select it anyway \u2014 that is why this is a switch and not a constant buried in a config file.',
    beyondReliable:
      'Above METR\u2019s 16-hour reliability line. METR does not vouch for this measurement on the current task suite.',
    shiftTitle: 'How much does the anchor matter?',
    shiftBody:
      'Less than you would think, and that is worth knowing. The measured horizon differs by a factor of 3.6 between the oldest and the newest anchor offered here, yet the singularity date moves by about nine months and global risk by a few tenths of a percentage point. A newer measurement is both higher up and later in time, and the two effects largely cancel. The doubling time and the risk assumptions move the answer by decades. Keeping the datum fresh is a matter of honesty, not of leverage.',
    source: 'Source',
  },

  operationalNote:
    'Operational definition used by this model. Not consciousness, not recursive self-improvement, not AGI in any of its usual senses.',

  baselineNote:
    'The default scenario is the author\u2019s, not a consensus. It puts global catastrophe risk near 20% by 2100, whereas surveys of AI researchers cluster around 5\u201310%. Treat it as one contestable position among several, and move the sliders.',

  singularityIntro:
    'The definition here is operational, not mystical: singularity has arrived when AI completes, unaided and with no human in the loop, a task of a given length across a given share of activities. No "awakening of consciousness" — only the point past which forecasting the economy in terms of human labour stops making sense.',
  catastropheIntro:
    '"Apocalypse" is not an event but a scale. Three thresholds, each with its own criterion, its own probability and its own dominant mechanism: human malice rules the bottom of the ladder, control failure the top. The model computes not a date but a risk intensity, and from it a cumulative probability and a median date.',

  expectedTitle: 'Illustrative severity by {year}',
  expectedRangeNote:
    'Ranges, not an expected value. A single number would hide two things: the cumulative probability of an event is not a count of events, and every rung is defined with an OR \u2014 an event can clear the damage limb while killing nobody.',
  exactLevelNote:
    'Each row is the probability of an event at exactly this level and nothing worse, which is why the rows add up to the probability of an event at any level. It is the difference between two rungs of the cumulative table above: P(this level or worse) \u2212 P(the next level or worse). So "exactly local" is lower than "local or worse": the worlds where a regional or global event also happened are counted in those rows, not in this one.',
  expectedDeaths:
    'expected deaths: summed over three levels, probability × geometric mean of the range',
  expectedUsd: 'expected direct damage in 2026 dollars',

  sliders: {
    doublingDays: {
      label: 'Horizon doubling time',
      unit: 'd',
      hint: 'METR fits 188 days across its full sample since 2019 and 129 days counting from 2023, with a confidence interval of 104\u2013158 days; that fit leaves out the points METR considers unreliable. This is the only slider continuing a measurement rather than stating an opinion, and it moves the date far more than the choice of anchor does.',
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
      label: 'Misuse pressure',
      unit: '/ 100',
      hint: 'How readily people turn available capability to harm. A model input on an arbitrary scale, not a share of users, models or requests. Main driver of the bottom rung.',
    },
    alignFailPct: {
      label: 'Control-failure pressure',
      unit: '/ 100',
      hint: 'How strongly loss-of-control scenarios feed the risk. A model input, not a probability that AI loses control: it is multiplied by rung weight, capability, wiring and mitigation before it means anything. Main driver of the top rung.',
    },
    mitigationPct: {
      label: 'Mitigation strength',
      unit: '/ 100',
      hint: 'Regulation, audit, kill switches, treaties. Not a percentage of risk removed: every rung has its own ceiling, and the implied reduction is shown below.',
    },
    dep0Pct: {
      label: 'Current wiring into critical systems',
      unit: '/ 100',
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
