/**
 * Расчёт контраста по WCAG 2.1 и светлоты по CIE L*.
 *
 * Светлота нужна не для проверки, а для порядковой шкалы: три ступени риска
 * обязаны идти равными шагами, иначе две из них читаются как пара.
 * Обоснование: docs/adr/0003-palette.md.
 */

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export function parseHex(hex: string): Rgb {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Ожидался цвет вида #rrggbb, получено: ${hex}`);
  const n = Number.parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Относительная яркость Y по WCAG. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Контраст двух цветов, от 1 до 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** Светлота CIE L*, от 0 до 100. */
export function cieLightness(hex: string): number {
  const y = relativeLuminance(hex);
  const f = y > 216 / 24389 ? Math.cbrt(y) : (24389 / 27) * y / 116 + 16 / 116;
  return 116 * f - 16;
}
