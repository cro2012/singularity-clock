import { MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';

export type ProvenanceKind = 'measured' | 'extrapolated' | 'assumed' | 'unverified';

/**
 * Откуда взялось число.
 *
 * Без этого читатель не отличает измерение METR от коэффициента, который автор
 * выставил на глаз, — а разница между ними и есть главное содержание сервиса.
 * Плашка стоит рядом с числом, а не в методологии: до методологии доходят
 * единицы.
 */
export function Badge({ kind, locale }: { kind: ProvenanceKind; locale: Locale }) {
  const t = MESSAGES[locale].provenance;
  const note = {
    measured: t.measuredNote,
    extrapolated: t.extrapolatedNote,
    assumed: t.assumedNote,
    unverified: t.unverifiedNote,
  }[kind];

  return (
    <span className={`prov prov-${kind}`} title={note}>
      {t[kind]}
      <span className="visually-hidden">. {note}</span>
    </span>
  );
}

export function ProvenanceLegend({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale].provenance;
  const kinds: ProvenanceKind[] = ['measured', 'extrapolated', 'assumed', 'unverified'];
  const notes = {
    measured: t.measuredNote,
    extrapolated: t.extrapolatedNote,
    assumed: t.assumedNote,
    unverified: t.unverifiedNote,
  };

  return (
    <section className="prov-legend">
      <p className="card-label">{t.legend}</p>
      <dl>
        {kinds.map((kind) => (
          <div key={kind}>
            <dt>
              <span className={`prov prov-${kind}`}>{t[kind]}</span>
            </dt>
            <dd>{notes[kind]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
