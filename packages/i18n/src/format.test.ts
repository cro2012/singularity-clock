import { describe, expect, it } from 'vitest';
import { endSentence, formatCountdown, formatHorizon, pluralize } from './format.ts';

const LABELS = { never: 'beyond the model', past: 'already happened' };

describe('plural forms', () => {
  const days = { one: 'day', other: 'days' };

  it.each([
    [0, 'days'],
    [1, 'day'],
    [2, 'days'],
    [11, 'days'],
    [21, 'days'],
  ])('%i → %s', (n, expected) => {
    expect(pluralize('en', n, days)).toBe(expected);
  });

  // Правило берётся из Intl, а не из остатка от деления: словарь второго языка
  // может иметь до шести форм, и рукописная функция это не переживёт.
  it('falls back to "other" when the form is missing', () => {
    expect(pluralize('en', 1, { other: 'units' })).toBe('units');
  });
});

describe('countdown', () => {
  const now = Date.UTC(2026, 7, 17);

  it('shows years and days together', () => {
    const target = now + (2 * 365.2425 + 3) * 86400000;
    expect(formatCountdown('en', target, now, LABELS).headline).toBe('2 years 3 days');
  });

  it('drops the year part under a year', () => {
    expect(formatCountdown('en', now + 5 * 86400000, now, LABELS).headline).toBe('5 days');
  });

  it('keeps the ticker eight characters wide', () => {
    expect(formatCountdown('en', now + 1234567, now, LABELS).ticker).toMatch(/^\d\d:\d\d:\d\d$/);
  });

  it('does not count backwards for a past event', () => {
    const result = formatCountdown('en', now - 1000, now, LABELS);
    expect(result.kind).toBe('past');
    expect(result.ticker).toBe('');
  });

  it('refuses to answer rather than showing zero when there is no date', () => {
    const result = formatCountdown('en', null, now, LABELS);
    expect(result.kind).toBe('never');
    expect(result.headline).toBe(LABELS.never);
  });
});

describe('horizon', () => {
  // Считается рабочее время: день — 8 часов, месяц — четыре рабочие недели.
  it.each([
    [30, '30 min'],
    [120, '2 h'],
    [960, '2 d'],
    [19200, '2 mo'],
    [230400, '2 yr'],
  ])('%i minutes → %s', (minutes, expected) => {
    expect(formatHorizon('en', minutes)).toBe(expected);
  });
});

describe('sentence ending', () => {
  it('adds a full stop only when one is missing', () => {
    expect(endSentence('17 August 2026')).toBe('17 August 2026.');
    expect(endSentence('17 Aug. 2026.')).toBe('17 Aug. 2026.');
  });
});
