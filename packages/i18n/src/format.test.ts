import { describe, expect, it } from 'vitest';
import { formatCountdown, pluralize } from './format.ts';

const LABELS = { never: 'за пределами модели', past: 'уже наступило' };

describe('склонение числительных', () => {
  const years = { one: 'год', few: 'года', many: 'лет', other: 'года' };
  it.each([
    [1, 'год'],
    [2, 'года'],
    [5, 'лет'],
    [11, 'лет'],
    [21, 'год'],
    [22, 'года'],
    [111, 'лет'],
    [0, 'лет'],
  ])('%i год(а/лет)', (n, expected) => {
    expect(pluralize('ru', n, years)).toBe(expected);
  });

  it('в английском хватает двух форм', () => {
    const days = { one: 'day', other: 'days' };
    expect(pluralize('en', 1, days)).toBe('day');
    expect(pluralize('en', 2, days)).toBe('days');
  });
});

describe('обратный отсчёт', () => {
  const now = Date.UTC(2026, 7, 17);

  it('склоняет и годы, и дни', () => {
    const target = now + (2 * 365.2425 + 3) * 86400000;
    expect(formatCountdown('ru', target, now, LABELS).headline).toBe('2 года 3 дня');
  });

  it('до года показывает только дни', () => {
    const target = now + 5 * 86400000;
    expect(formatCountdown('ru', target, now, LABELS).headline).toBe('5 дней');
  });

  it('тикающая часть всегда восемь символов', () => {
    const target = now + 1234567;
    expect(formatCountdown('ru', target, now, LABELS).ticker).toMatch(/^\d\d:\d\d:\d\d$/);
  });

  it('прошедшее событие не отсчитывается назад', () => {
    const result = formatCountdown('ru', now - 1000, now, LABELS);
    expect(result.kind).toBe('past');
    expect(result.ticker).toBe('');
  });

  it('отсутствие даты — отказ отвечать, а не ноль', () => {
    const result = formatCountdown('ru', null, now, LABELS);
    expect(result.kind).toBe('never');
    expect(result.headline).toBe(LABELS.never);
  });
});
