import { useId, useState } from 'react';
import type { ReactNode } from 'react';

export interface ChartTable {
  readonly caption: string;
  readonly head: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export interface ChartFrameProps {
  readonly title: string;
  readonly subtitle: ReactNode;
  /** Текстовое резюме графика для тех, кто его не видит. */
  readonly summary: string;
  readonly table: ChartTable;
  readonly labels: { readonly chart: string; readonly table: string };
  /** Строка, объявляемая при движении курсора. Пустая — курсор вне графика. */
  readonly readout: string;
  readonly legend?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Оболочка графика: заголовок, переключатель «график / таблица», скрытое
 * резюме и статусная строка для курсора.
 *
 * Режим таблицы — переключатель, а не раскрывающийся блок: таблица здесь не
 * дополнение для любопытных, а равноправный способ прочитать те же данные.
 */
export function ChartFrame({
  title,
  subtitle,
  summary,
  table,
  labels,
  readout,
  legend,
  children,
}: ChartFrameProps) {
  const [asTable, setAsTable] = useState(false);
  const summaryId = useId();
  const name = useId();

  return (
    <figure className="chartbox">
      <figcaption>
        <div className="chart-head">
          <p className="chart-title">{title}</p>
          <div className="seg chart-mode">
            {[
              { value: false, label: labels.chart },
              { value: true, label: labels.table },
            ].map((option) => (
              <label key={String(option.value)} className="seg-item">
                <input
                  type="radio"
                  name={name}
                  checked={asTable === option.value}
                  onChange={() => setAsTable(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        <p className="chart-sub">{subtitle}</p>
      </figcaption>

      <p className="visually-hidden" id={summaryId}>
        {summary}
      </p>

      {asTable ? (
        <div className="table-scroll">
          <table className="data">
            <caption className="visually-hidden">{table.caption}</caption>
            <thead>
              <tr>
                {table.head.map((cell) => (
                  <th key={cell} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  {row.slice(1).map((cell, i) => (
                    <td key={`${row[0]}-${i}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {children}
          {legend ? <div className="legend">{legend}</div> : null}
          <p className="chart-readout tabular" role="status" aria-live="polite">
            {readout || ' '}
          </p>
        </>
      )}
    </figure>
  );
}
