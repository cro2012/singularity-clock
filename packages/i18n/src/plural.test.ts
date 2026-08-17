import { describe, expect, it } from 'vitest';
import { pluralize } from './index.ts';

const YEARS = { one: 'год', few: 'года', many: 'лет', other: 'года' };

describe('склонение числительных', () => {
  it.each([
    [1, 'год'],
    [2, 'года'],
    [5, 'лет'],
    [11, 'лет'],
    [21, 'год'],
    [22, 'года'],
    [25, 'лет'],
    [111, 'лет'],
    [0, 'лет'],
  ])('%i → %s', (n, expected) => {
    expect(pluralize('ru', n, YEARS)).toBe(expected);
  });

  it('в английской локали хватает двух форм', () => {
    const days = { one: 'day', other: 'days' };
    expect(pluralize('en', 1, days)).toBe('day');
    expect(pluralize('en', 2, days)).toBe('days');
  });
});
