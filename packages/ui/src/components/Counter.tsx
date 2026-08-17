import type { Countdown } from '@sc/i18n';
import type { ReactNode } from 'react';

export interface CounterProps {
  readonly label: string;
  readonly countdown: Countdown;
  readonly note: ReactNode;
}

/**
 * Обратный отсчёт.
 *
 * Секунды помечены aria-hidden, а доступное имя счётчика — крупная строка без
 * них. Иначе скринридер зачитывал бы «четырнадцать лет двести двенадцать дней
 * ноль девять двадцать три сорок семь» раз в секунду до конца сеанса.
 * Табличные цифры — чтобы тикающие секунды не дёргали ширину строки.
 */
export function Counter({ label, countdown, note }: CounterProps) {
  return (
    <div className="card hero-card">
      <p className="card-label">{label}</p>
      <p className="bignum tabular">{countdown.headline}</p>
      {countdown.ticker ? (
        <p className="clockline tabular pulse" aria-hidden="true">
          {countdown.ticker}
        </p>
      ) : null}
      <p className="datenote">{note}</p>
    </div>
  );
}
