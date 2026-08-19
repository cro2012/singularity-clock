import { anchorOptionFor } from '@sc/core';
import type { Assumptions, ModelConfig } from '@sc/core';
import { formatFullDate, formatHours, interpolate, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';
import { Badge } from './Provenance.tsx';
import type { ScenarioStore } from '../store.ts';

export interface AnchorPickerProps {
  readonly config: ModelConfig;
  readonly assumptions: Assumptions;
  readonly locale: Locale;
  readonly store: ScenarioStore;
}

/**
 * Опорная точка METR: единственное измерение во всей модели.
 *
 * Раньше она была константой в конфиге, и это было неправильно сразу по двум
 * причинам. Во-первых, у читателя не было способа увидеть, на каком замере и
 * какой свежести всё построено, — а от этого зависит, стоит ли вообще
 * доверять остальному. Во-вторых, замер устаревает быстрее, чем сайт
 * пересобирается, и «зашитая» точка тихо превращается в позапрошлогоднюю.
 *
 * Поэтому выбор точки — часть сценария и уезжает в ссылку: спор о том, какой
 * замер брать за основу, ничем не хуже спора о времени удвоения, и его тоже
 * надо уметь расшарить. Обоснование: docs/adr/0006-metr-anchor.md.
 */
export function AnchorPicker({ config, assumptions, locale, store }: AnchorPickerProps) {
  const t = MESSAGES[locale].anchor;
  const current = anchorOptionFor(config, assumptions.anchorId);
  // Самый свежий замер, а не самый большой: у METR они не совпадают, и вся
  // разница между ними — предмет соседнего абзаца «why this anchor».
  const frontier = config.anchors.reduce((a, b) => (b.at > a.at ? b : a));
  const onFrontier = current.id === frontier.id;

  return (
    <section className="card anchor">
      <p className="card-label">
        {t.title} <Badge kind="measured" locale={locale} />
      </p>
      <p>{t.lead}</p>

      <dl className="anchor-facts">
        <div>
          <dt>{t.cutoff}</dt>
          <dd className="tabular">{formatFullDate(locale, config.metrSource.dataCutoff)}</dd>
        </div>
        <div>
          <dt>{t.anchorIs}</dt>
          <dd>
            <b>{current.model}</b> · <span className="tabular">{formatHours(locale, current.horizonMinutes)}</span>
          </dd>
        </div>
        <div>
          <dt>{t.ci}</dt>
          <dd className="tabular">
            {formatHours(locale, current.ci[0])} – {formatHours(locale, current.ci[1])}
          </dd>
        </div>
        <div>
          <dt>{t.source}</dt>
          <dd>
            <a href={config.metrSource.url} rel="noopener noreferrer" target="_blank">
              metr.org
            </a>
          </dd>
        </div>
      </dl>

      <fieldset className="ctl seg-field anchor-pick">
        <legend>{t.pick}</legend>
        <div className="seg" role="none">
          {config.anchors.map((option) => (
            <label key={option.id} className="seg-item">
              <input
                type="radio"
                name="metr-anchor"
                checked={option.id === current.id}
                onChange={() => store.set({ anchorId: option.id })}
              />
              <span>
                {option.model} · {formatHours(locale, option.horizonMinutes)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p>
        <button
          type="button"
          className="preset"
          aria-pressed={onFrontier}
          onClick={() => store.set({ anchorId: frontier.id })}
        >
          {t.useLatest}
        </button>{' '}
        <span className="lbl">
          {interpolate(t.released, { date: formatFullDate(locale, current.at) })}
        </span>
      </p>

      {current.beyondReliable ? (
        <p className="notice" role="status">
          {t.beyondReliable}
        </p>
      ) : null}

      <details>
        <summary>{t.whyTitle}</summary>
        <p>{t.whyBody}</p>
      </details>

      <details>
        <summary>{t.shiftTitle}</summary>
        <p>{t.shiftBody}</p>
      </details>
    </section>
  );
}
