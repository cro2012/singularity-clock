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

export const CONTENT: Record<Locale, ContentDict> = { en: enContent };
