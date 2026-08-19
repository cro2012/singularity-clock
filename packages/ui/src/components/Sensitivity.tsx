import { useMemo } from 'react';
import { sensitivity } from '@sc/core';
import type { Assumptions, ModelConfig } from '@sc/core';
import { formatNumber, interpolate, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';

export interface SensitivityProps {
  readonly config: ModelConfig;
  readonly assumptions: Assumptions;
  readonly locale: Locale;
  readonly now: number;
}

/**
 * Какое допущение двигает результат сильнее всех.
 *
 * Это, по-хорошему, главный вывод сервиса: спорят обычно про дату появления
 * AGI, а результат определяется тем, можно ли остановить систему после сбоя.
 * Пока это утверждение только в тексте, человек крутит не те ползунки.
 *
 * Считается двадцатью вызовами ядра — оно чистое и дешёвое, поэтому проще
 * посчитать честно, чем угадывать веса аналитически.
 */
export function Sensitivity({ config, assumptions, locale, now }: SensitivityProps) {
  const t = MESSAGES[locale];
  const entries = useMemo(
    () => sensitivity({ assumptions, config, now }),
    [assumptions, config, now],
  );

  const max = entries[0]?.spread ?? 0;
  if (max <= 0) return null;

  const metric = interpolate(t.sensitivity.metric, {
    year: formatNumber(locale, config.constants.doomsday.horizonYear, { useGrouping: false }),
  });

  return (
    <section className="sens">
      <h2>{t.sensitivity.title}</h2>
      <p className="sub">{interpolate(t.sensitivity.subtitle, { metric })}</p>
      <table className="data sens-table">
        <thead>
          <tr>
            <th scope="col">{t.sensitivity.assumption}</th>
            <th scope="col">{t.sensitivity.effect}</th>
            <th scope="col" className="sens-num">
              {metric}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const pp = entry.spread * 100;
            return (
              <tr key={entry.id}>
                <th scope="row">{t.sliders[entry.id].label}</th>
                <td>
                  <span className="bar" aria-hidden="true">
                    <i style={{ width: `${(entry.spread / max) * 100}%` }} />
                  </span>
                </td>
                <td className="tabular sens-num">
                  {pp < 0.1
                    ? t.sensitivity.negligible
                    : `\u00b1${formatNumber(locale, pp / 2, { maximumFractionDigits: 1 })} pp`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
