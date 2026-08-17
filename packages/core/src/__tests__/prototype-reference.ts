/**
 * Дословный порт расчётного ядра прототипа (reference/prototype.html,
 * строки 526–618). Используется только в тестах.
 *
 * Цель — не переиспользование, а доказательство. Новое ядро считает горизонт в
 * логарифмическом пространстве и складывает интенсивности ступеней; прототип
 * возводит двойку в степень и считает ступени независимо. Тест паритета
 * прогоняет оба через одни и те же допущения и сверяет числа. Если перенос
 * где-то соврал, разойдутся именно здесь, а не в интерфейсе через месяц.
 *
 * Поэтому этот файл СОЗНАТЕЛЬНО написан в стиле прототипа: те же имена, тот же
 * порядок операций, те же зашитые константы. Не рефакторить.
 */

import type { Assumptions, ModelConfig } from '../types.ts';

const DAY = 86400000;
const YR = 365.2425 * DAY;

export interface RefEffective {
  D: number;
  align: number;
  malice: number;
  mitig: number;
  dep0: number;
}

export interface RefItem {
  m: number;
  lag: number;
  grp?: string | undefined;
}

export interface RefTier {
  id: string;
  req: number;
  wm: number;
  wu: number;
  eff: number;
  deaths: readonly [number, number];
  usd: readonly [number, number];
}

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export function refEff(S: Assumptions): RefEffective {
  return {
    D: S.doublingDays * S.friction,
    align: clamp(S.alignFailPct / 100, 0, 1),
    malice: S.malicePct / 100,
    mitig: clamp(S.mitigationPct / 100, 0, 1),
    dep0: clamp(S.dep0Pct / 100, 0, 0.95),
  };
}

const relFactor = (S: Assumptions) => (S.reliability === 80 ? 5 : 1);
const horizonAt = (t: number, T0: number, H0: number, E: RefEffective) =>
  H0 * Math.pow(2, (t - T0) / (DAY * E.D));
const dateFor = (H: number, T0: number, H0: number, E: RefEffective) =>
  T0 + E.D * DAY * Math.log2(H / H0);

export function refItemDate(
  it: RefItem,
  S: Assumptions,
  E: RefEffective,
  T0: number,
  H0: number,
): number {
  const req = it.m * S.targetMinutes * relFactor(S);
  return dateFor(req, T0, H0, E) + it.lag * YR;
}

export function refItemProgress(
  it: RefItem,
  S: Assumptions,
  E: RefEffective,
  T0: number,
  H0: number,
  now: number,
): number {
  const req = it.m * S.targetMinutes * relFactor(S);
  const H = horizonAt(now, T0, H0, E);
  let p = (Math.log2(H) - Math.log2(req) + 12) / 12;
  if (p >= 1 && it.lag > 0) {
    const passed = (now - dateFor(req, T0, H0, E)) / (it.lag * YR);
    p = 0.88 + 0.12 * clamp(passed, 0, 1);
  }
  return clamp(p, 0, 1);
}

export interface RefPoint {
  y: number;
  p: number;
}

export function refRiskCurve(
  t: RefTier,
  S: Assumptions,
  E: RefEffective,
  T0: number,
  H0: number,
  now: number,
  startYear: number,
  endYear: number,
): RefPoint[] {
  const tsat = dateFor(t.req * 8, T0, H0, E);
  let cum = 0;
  const pts: RefPoint[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const tm = Date.UTC(y, 6, 1);
    const c =
      1 / (1 + Math.exp(-0.8 * (Math.log2(horizonAt(tm, T0, H0, E)) - Math.log2(t.req))));
    const dep = E.dep0 + (1 - E.dep0) * (1 - Math.exp(-Math.max(0, (tm - now) / YR) / S.tauYears));
    const ad = Math.exp(-Math.max(0, (tm - tsat) / YR) / S.adaptWindowYears);
    const lam = (t.wm * E.malice + t.wu * E.align) * c * dep * (1 - E.mitig * t.eff) * ad;
    cum += Math.max(0, lam);
    pts.push({ y, p: 1 - Math.exp(-cum) });
  }
  return pts;
}

export function refMedianDate(pts: readonly RefPoint[]): number | null {
  for (let i = 0; i < pts.length; i++) {
    if (pts[i]!.p >= 0.5) {
      const prev = i ? pts[i - 1]! : { y: pts[0]!.y - 1, p: 0 };
      const f = (0.5 - prev.p) / (pts[i]!.p - prev.p || 1);
      return Date.UTC(prev.y, 6, 1) + f * YR;
    }
  }
  return null;
}

export function refPAt(pts: readonly RefPoint[], year: number): number {
  const r = pts.find((p) => p.y === year);
  return r ? r.p : pts[pts.length - 1]!.p;
}

/** Ступени прототипа, собранные из конфига, чтобы веса не расходились. */
export function refTiers(config: ModelConfig): RefTier[] {
  return config.tiers.map((t) => ({
    id: t.id,
    req: t.capabilityThresholdMinutes,
    wm: t.maliceWeight,
    wu: t.controlFailWeight,
    eff: t.mitigationCeiling,
    deaths: t.deaths,
    usd: t.usd,
  }));
}
