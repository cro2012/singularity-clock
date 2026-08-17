/** Работа со временем. Всё в миллисекундах UTC, никаких локальных зон. */

export const DAY_MS = 86_400_000;

/** Григорианский средний год. То же значение, что в прототипе. */
export const YEAR_MS = 365.2425 * DAY_MS;

/** Середина года — точка, в которой берётся отсчёт при интегрировании по годам. */
export function yearAnchor(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day);
}

/** Год, содержащий момент времени. */
export function yearOf(ms: number): number {
  return new Date(ms).getUTCFullYear();
}

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}
