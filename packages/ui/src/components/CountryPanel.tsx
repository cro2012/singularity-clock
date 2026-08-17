import { COMPONENTS, rankCountries } from '@sc/core';
import type { ComponentId, ComponentWeights, CountryScores } from '@sc/core';
import { formatNumber, formatPercent, interpolate, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';
import { Slider } from './controls.tsx';

export interface CountryPanelProps {
  readonly countries: readonly CountryScores[];
  readonly weights: ComponentWeights;
  readonly geopoliticsOn: boolean;
  readonly raceIndex: number | null;
  readonly mitigationPenalty: number;
  readonly provisional: boolean;
  readonly locale: Locale;
  readonly onWeight: (component: ComponentId, value: number) => void;
  readonly onToggleGeopolitics: (on: boolean) => void;
  readonly onEqualWeights: () => void;
}

/**
 * Рейтинг стран и индекс гонки.
 *
 * Веса настраиваются пользователем не ради интерактивности: вся содержательная
 * разница между публичными индексами AI-лидерства сводится к весам, и сервис
 * должен это показать, а не спрятать (ТЗ §6.1).
 */
export function CountryPanel({
  countries,
  weights,
  geopoliticsOn,
  raceIndex,
  mitigationPenalty,
  provisional,
  locale,
  onWeight,
  onToggleGeopolitics,
  onEqualWeights,
}: CountryPanelProps) {
  const t = MESSAGES[locale];
  const ranked = rankCountries(countries, weights);
  const top = ranked[0]?.score ?? 1;

  return (
    <>
      {provisional ? (
        <p className="notice notice-strong" role="note">
          <b>{t.countries.provisionalTitle}</b> {t.countries.provisional}
        </p>
      ) : null}

      <div className="controls country-weights">
        {COMPONENTS.map((component) => (
          <Slider
            key={component}
            label={t.countries.components[component]}
            hint={t.countries.componentHints[component]}
            value={weights[component]}
            display={formatNumber(locale, weights[component], { maximumFractionDigits: 2 })}
            min={0}
            max={2}
            step={0.05}
            onChange={(value) => onWeight(component, value)}
          />
        ))}
      </div>

      <p className="row-actions">
        <button type="button" className="preset" onClick={onEqualWeights}>
          {t.countries.equalWeights}
        </button>
      </p>

      <div className="table-scroll">
        <table className="data country-table">
          <caption className="visually-hidden">{t.countries.tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{t.countries.country}</th>
              <th scope="col">{t.countries.score}</th>
              <th scope="col">{t.countries.breakdown}</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row, index) => (
              <tr key={row.iso3}>
                <td className="tabular">{index + 1}</td>
                <th scope="row">{t.countries.names[row.iso3] ?? row.iso3}</th>
                <td className="tabular">{formatNumber(locale, row.score, { maximumFractionDigits: 1 })}</td>
                <td>
                  <span className="bar" aria-hidden="true">
                    <i style={{ width: `${(row.score / Math.max(top, 1)) * 100}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card race">
        <p className="card-label">{t.countries.raceTitle}</p>
        <p className="bignum tabular exp-num">
          {raceIndex === null ? '—' : formatNumber(locale, raceIndex, { maximumFractionDigits: 2 })}
        </p>
        <p className="datenote">{t.countries.raceNote}</p>

        <label className="switch">
          <input
            type="checkbox"
            checked={geopoliticsOn}
            onChange={(event) => onToggleGeopolitics(event.target.checked)}
          />
          <span>{t.countries.geopoliticsToggle}</span>
        </label>

        <p className="datenote">
          {interpolate(t.countries.geopoliticsNote, {
            penalty: formatPercent(locale, mitigationPenalty, 0),
            effect:
              raceIndex === null
                ? '—'
                : formatPercent(locale, mitigationPenalty * raceIndex, 0),
          })}
        </p>
      </div>
    </>
  );
}
