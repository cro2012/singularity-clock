import { describe, expect, it } from 'vitest';
import { cieLightness, contrastRatio } from './contrast.ts';
import { MIN_CONTRAST, SURFACES, TIER_RAMP, TOKENS } from './tokens.ts';

const byName = new Map(TOKENS.map((t) => [t.name, t]));

describe('контраст токенов', () => {
  const cases = TOKENS.flatMap((token) =>
    token.on.map((surface) => ({ token, surface, bg: SURFACES[surface] })),
  );

  it.each(cases)('$token.name на $surface', ({ token, bg }) => {
    const ratio = contrastRatio(token.value, bg);
    expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST[token.role]);
  });
});

describe('порядковая шкала ступеней', () => {
  const lightness = TIER_RAMP.map((name) => {
    const token = byName.get(name);
    if (!token) throw new Error(`Токен ${name} не найден`);
    return cieLightness(token.value);
  });

  it('идёт от тёмного к светлому', () => {
    for (let i = 1; i < lightness.length; i++) {
      expect(lightness[i]!).toBeGreaterThan(lightness[i - 1]!);
    }
  });

  it('имеет равные шаги светлоты: расхождение не более 3 единиц L*', () => {
    const steps = lightness.slice(1).map((l, i) => l - lightness[i]!);
    const spread = Math.max(...steps) - Math.min(...steps);
    expect(spread).toBeLessThanOrEqual(3);
  });

  it('шаг достаточно велик, чтобы ступени различались', () => {
    const steps = lightness.slice(1).map((l, i) => l - lightness[i]!);
    for (const step of steps) expect(step).toBeGreaterThanOrEqual(10);
  });
});

describe('разделение текстовых и графических токенов', () => {
  it('графический критический красный не годится в текст', () => {
    // Смысл разделения ролей: если бы это утверждение перестало быть верным,
    // два токена можно было бы схлопнуть в один.
    const graphic = byName.get('graphic-critical')!;
    expect(contrastRatio(graphic.value, SURFACES.surface1)).toBeLessThan(MIN_CONTRAST.text);
  });
});
