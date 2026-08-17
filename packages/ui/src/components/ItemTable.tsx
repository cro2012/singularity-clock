import { useState } from 'react';
import type { Item, ItemKind, ItemResult } from '@sc/core';
import { CONTENT, formatMonthYear, formatNumber, formatPercent, interpolate, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';

export interface ItemTableProps {
  readonly kind: ItemKind;
  readonly items: readonly ItemResult[];
  /** Спецификации из конфига: коэффициент, лаг, якорь обоснования. */
  readonly specs: readonly Item[];
  readonly locale: Locale;
  readonly now: number;
}

/**
 * Строки разбивки: название, полоса прогресса, дата обгона.
 *
 * Строка раскрывается по клику и с клавиатуры — внутри коэффициент сложности,
 * лаг и обоснование. Обоснование обязательно: коэффициенты здесь самое слабое
 * место модели, и прятать их за «экспертным суждением» нечестно.
 */
export function ItemTable({ kind, items, specs, locale, now }: ItemTableProps) {
  const t = MESSAGES[locale];
  const copy = kind === 'function' ? CONTENT[locale].functions : CONTENT[locale].industries;
  const rows = items.filter((item) => item.kind === kind);
  const specById = new Map(specs.map((spec) => [spec.id, spec]));

  return (
    <div className="rows">
      <div className="rowhead" aria-hidden="true">
        <span>{kind === 'function' ? t.items.functionColumn : t.items.industryColumn}</span>
        <span>{t.items.progress}</span>
        <span className="eta">{t.items.overtaken}</span>
      </div>
      {rows.map((row) => (
        <ItemRow
          key={`${row.kind}-${row.id}`}
          row={row}
          spec={specById.get(row.id)}
          copy={copy[row.id]}
          locale={locale}
          now={now}
        />
      ))}
    </div>
  );
}

function ItemRow({
  row,
  spec,
  copy,
  locale,
  now,
}: {
  row: ItemResult;
  spec: Item | undefined;
  copy: { name: string; note: string; rationale: string } | undefined;
  locale: Locale;
  now: number;
}) {
  const t = MESSAGES[locale];
  const [open, setOpen] = useState(false);
  const name = copy?.name ?? row.id;
  const year = new Date(row.date).getUTCFullYear();

  return (
    <div className={`row-wrap${open ? ' open' : ''}`}>
      <button
        type="button"
        className="row"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="nm">
          {name}
          {copy?.note ? <small>{copy.note}</small> : null}
        </span>
        <span className="bar" aria-hidden="true">
          <i
            style={{
              width: `${(row.progress * 100).toFixed(1)}%`,
              background: row.passed ? 'var(--graphic-good)' : 'var(--series-1)',
            }}
          />
        </span>
        <span className={`eta${row.passed ? ' done' : ''}`}>
          {row.passed
            ? `✓ ${formatNumber(locale, year, { useGrouping: false })}`
            : formatMonthYear(locale, row.date)}
        </span>
      </button>

      {open && spec ? (
        <div className="row-detail">
          <dl>
            <div>
              <dt>{t.items.difficulty}</dt>
              <dd className="tabular">×{formatNumber(locale, spec.m)}</dd>
            </div>
            <div>
              <dt>{t.items.lag}</dt>
              <dd className="tabular">
                {spec.lag === 0 ? '—' : `${formatNumber(locale, spec.lag)} ${t.items.years}`}
              </dd>
            </div>
            <div>
              <dt>{t.items.progressValue}</dt>
              <dd className="tabular">{formatPercent(locale, row.progress, 0)}</dd>
            </div>
          </dl>
          <p>{copy?.rationale}</p>
          <p className="estimate">
            {interpolate(t.items.estimateNote, {
              date: formatMonthYear(locale, row.date),
              relative:
                row.date <= now ? t.items.inThePast : t.items.inTheFuture,
            })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
