import type { ModelResult, TierId } from '@sc/core';
import { CONTENT, formatNumber, formatPercent, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';
import { ChartFrame } from './chart/ChartFrame.tsx';
import { useCrosshair } from './chart/useCrosshair.ts';

const W = 900;
const H = 320;
const L = 46;
const R = 24;
const T = 16;
const B = 34;

/**
 * Цвет закреплён за ступенью, а не за колонкой сравнения.
 *
 * Требование ТЗ §8.3 и оно же здравый смысл: пара «сплошная и пунктирная
 * одного цвета» читается как «одно и то же при разных допущениях». Два разных
 * цвета читались бы как две разные величины.
 */
const TIER_COLOR: Record<TierId, string> = {
  local: 'var(--tier-local)',
  regional: 'var(--tier-regional)',
  global: 'var(--tier-global)',
};

export interface CompareRiskChartProps {
  readonly a: ModelResult;
  readonly b: ModelResult;
  readonly labels: { readonly a: string; readonly b: string };
  readonly locale: Locale;
}

export function CompareRiskChart({ a, b, labels, locale }: CompareRiskChartProps) {
  const t = MESSAGES[locale];
  const tiers = CONTENT[locale].tiers;
  const years = a.tiers[0]?.curve.map((p) => p.year) ?? [];
  const y0 = years[0] ?? 2026;
  const y1 = years[years.length - 1] ?? 2100;

  const X = (year: number) => L + ((year - y0) / Math.max(1, y1 - y0)) * (W - L - R);
  const Y = (p: number) => T + (1 - p) * (H - T - B);

  const crosshair = useCrosshair({ count: years.length, plot: { left: L, right: W - R, width: W } });
  const index = crosshair.index;
  const activeYear = index === null ? null : years[index];

  const at = (model: ModelResult, tier: number, year: number) =>
    model.tiers[tier]?.curve.find((p) => p.year === year)?.p ?? 0;

  const readout =
    activeYear === undefined || activeYear === null
      ? ''
      : `${formatNumber(locale, activeYear, { useGrouping: false })}: ` +
        a.tiers
          .map(
            (tier, i) =>
              `${tiers[tier.id]!.name} ${formatPercent(locale, a.tiers[i]!.curve[index!]!.p, 0)} ${'\u2192'} ${formatPercent(locale, b.tiers[i]!.curve[index!]!.p, 0)}`,
          )
          .join(' · ');

  const summary = a.tiers
    .map(
      (tier, i) =>
        `${tiers[tier.id]!.name}: ${labels.a} ${formatPercent(locale, at(a, i, 2050))}, ${labels.b} ${formatPercent(locale, at(b, i, 2050))} ${t.chart.by} 2050`,
    )
    .join('. ');

  const tableYears = years.filter((y) => y % 10 === 0 || y === y0 || y === y1);

  const path = (model: ModelResult, tier: number) =>
    (model.tiers[tier]?.curve ?? [])
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.year).toFixed(1)} ${Y(p.p).toFixed(1)}`)
      .join(' ');

  return (
    <ChartFrame
      title={t.compare.chartTitle}
      subtitle={t.compare.chartSubtitle}
      summary={summary}
      readout={readout}
      labels={{ chart: t.chart.asChart, table: t.chart.asTable }}
      legend={
        <>
          {a.tiers.map((tier) => (
            <span key={tier.id}>
              <i style={{ background: TIER_COLOR[tier.id] }} aria-hidden="true" />
              {tiers[tier.id]!.name}
            </span>
          ))}
          <span className="legend-style">
            <svg width="34" height="10" aria-hidden="true">
              <line x1="0" y1="5" x2="30" y2="5" stroke="var(--ink-2)" strokeWidth="2" />
            </svg>
            {labels.a}
          </span>
          <span className="legend-style">
            <svg width="34" height="10" aria-hidden="true">
              <line
                x1="0"
                y1="5"
                x2="30"
                y2="5"
                stroke="var(--ink-2)"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
            </svg>
            {labels.b}
          </span>
        </>
      }
      table={{
        caption: t.compare.chartTitle,
        head: [
          t.chart.year,
          ...a.tiers.flatMap((tier) => [
            `${tiers[tier.id]!.name} · ${labels.a}`,
            `${tiers[tier.id]!.name} · ${labels.b}`,
          ]),
        ],
        rows: tableYears.map((year) => [
          formatNumber(locale, year, { useGrouping: false }),
          ...a.tiers.flatMap((_, i) => [
            formatPercent(locale, at(a, i, year), 0),
            formatPercent(locale, at(b, i, year), 0),
          ]),
        ]),
      }}
    >
      <svg
        ref={crosshair.svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={summary}
        className="chart"
        {...crosshair.handlers}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line x1={L} y1={Y(p)} x2={W - R} y2={Y(p)} stroke="var(--grid)" strokeWidth={1} />
            <text x={L - 9} y={Y(p) + 4} fill="var(--muted)" fontSize={11} textAnchor="end">
              {formatPercent(locale, p, 0)}
            </text>
          </g>
        ))}
        {years
          .filter((year) => year % 10 === 0)
          .map((year) => (
            <g key={year}>
              <line x1={X(year)} y1={T} x2={X(year)} y2={H - B} stroke="var(--grid)" strokeWidth={1} opacity={0.6} />
              <text x={X(year)} y={H - B + 18} fill="var(--muted)" fontSize={11} textAnchor="middle">
                {year}
              </text>
            </g>
          ))}
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--axis)" strokeWidth={1} />
        <line x1={L} y1={Y(0.5)} x2={W - R} y2={Y(0.5)} stroke="var(--ink-2)" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />

        {a.tiers.map((tier, i) => (
          <g key={tier.id}>
            <path d={path(a, i)} fill="none" stroke={TIER_COLOR[tier.id]} strokeWidth={2} strokeLinecap="round" />
            <path
              d={path(b, i)}
              fill="none"
              stroke={TIER_COLOR[tier.id]}
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeLinecap="round"
            />
          </g>
        ))}

        {activeYear !== undefined && activeYear !== null ? (
          <line x1={X(activeYear)} y1={T} x2={X(activeYear)} y2={H - B} stroke="var(--ink)" strokeWidth={1} opacity={0.5} />
        ) : null}
      </svg>
    </ChartFrame>
  );
}
