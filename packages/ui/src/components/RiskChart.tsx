import type { ModelResult, TierId } from '@sc/core';
import { CONTENT, formatNumber, formatPercent, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';
import { ChartFrame } from './chart/ChartFrame.tsx';
import { useCrosshair } from './chart/useCrosshair.ts';

const W = 900;
const H = 320;
const L = 46;
const R = 140;
const T = 16;
const B = 34;

/**
 * Порядковая шкала: один тон, три светлоты плюс различающийся штрих.
 * Штрих — второй канал: при дейтеранопии светлота остаётся, но чем больше
 * независимых каналов, тем лучше (ADR-0003).
 */
const TIER_STYLE: Record<TierId, { color: string; dash: string }> = {
  local: { color: 'var(--tier-local)', dash: '2 5' },
  regional: { color: 'var(--tier-regional)', dash: '7 4' },
  global: { color: 'var(--tier-global)', dash: '' },
};

export interface RiskChartProps {
  readonly model: ModelResult;
  readonly locale: Locale;
}

export function RiskChart({ model, locale }: RiskChartProps) {
  const t = MESSAGES[locale];
  const content = CONTENT[locale];
  const years = model.tiers[0]?.curve.map((p) => p.year) ?? [];

  const y0 = years[0] ?? 2026;
  const y1 = years[years.length - 1] ?? 2100;
  const X = (year: number) => L + ((year - y0) / Math.max(1, y1 - y0)) * (W - L - R);
  const Y = (p: number) => T + (1 - p) * (H - T - B);

  const crosshair = useCrosshair({
    count: years.length,
    plot: { left: L, right: W - R, width: W },
  });
  const activeYear = crosshair.index === null ? null : years[crosshair.index];

  const readout =
    activeYear === undefined || activeYear === null
      ? ''
      : `${formatNumber(locale, activeYear, { useGrouping: false })}: ${model.tiers
          .map(
            (tier) =>
              `${content.tiers[tier.id]!.name} ${formatPercent(locale, tier.curve[crosshair.index!]!.p)}`,
          )
          .join(' · ')}`;

  const at = (tier: (typeof model.tiers)[number], year: number) =>
    tier.curve.find((p) => p.year === year)?.p ?? tier.curve[tier.curve.length - 1]?.p ?? 0;

  const summary = model.tiers
    .map(
      (tier) =>
        `${content.tiers[tier.id]!.name}: ${formatPercent(locale, at(tier, 2050))} ${t.chart.by} 2050, ${formatPercent(locale, at(tier, 2100))} ${t.chart.by} 2100`,
    )
    .join('. ');

  const tableYears = years.filter((y) => y % 5 === 0 || y === y0 || y === y1);

  // Прямые подписи в конце линий: когда кривые сходятся, подписи налезают друг
  // на друга. Разводим сверху вниз с минимальным зазором — легенда дублирует
  // их, но прямая подпись читается быстрее и терять её не хочется.
  const LABEL_GAP = 30;
  const labelY = new Map<TierId, number>();
  let previous = -Infinity;
  for (const tier of [...model.tiers].sort(
    (a, b) => (b.curve.at(-1)?.p ?? 0) - (a.curve.at(-1)?.p ?? 0),
  )) {
    const wanted = Y(tier.curve.at(-1)?.p ?? 0);
    const placed = Math.max(wanted, previous + LABEL_GAP);
    labelY.set(tier.id, placed);
    previous = placed;
  }

  return (
    <ChartFrame
      title={t.chart.riskTitle}
      subtitle={t.chart.riskSubtitle}
      summary={`${t.chart.riskSummaryPrefix} ${summary}.`}
      readout={readout}
      labels={{ chart: t.chart.asChart, table: t.chart.asTable }}
      legend={model.tiers.map((tier) => (
        <span key={tier.id}>
          <i style={{ background: TIER_STYLE[tier.id].color }} aria-hidden="true" />
          {content.tiers[tier.id]!.name}
        </span>
      ))}
      table={{
        caption: t.chart.riskTitle,
        head: [t.chart.year, ...model.tiers.map((tier) => content.tiers[tier.id]!.name)],
        rows: tableYears.map((year) => [
          formatNumber(locale, year, { useGrouping: false }),
          ...model.tiers.map((tier) => formatPercent(locale, at(tier, year))),
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
              <line
                x1={X(year)}
                y1={T}
                x2={X(year)}
                y2={H - B}
                stroke="var(--grid)"
                strokeWidth={1}
                opacity={0.6}
              />
              <text x={X(year)} y={H - B + 18} fill="var(--muted)" fontSize={11} textAnchor="middle">
                {year}
              </text>
            </g>
          ))}

        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--axis)" strokeWidth={1} />
        <line
          x1={L}
          y1={Y(0.5)}
          x2={W - R}
          y2={Y(0.5)}
          stroke="var(--ink-2)"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />

        {model.tiers.map((tier) => {
          const style = TIER_STYLE[tier.id];
          const d = tier.curve
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.year).toFixed(1)} ${Y(p.p).toFixed(1)}`)
            .join(' ');
          const end = tier.curve[tier.curve.length - 1];
          return (
            <g key={tier.id}>
              <path
                d={d}
                fill="none"
                stroke={style.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={style.dash}
              />
              {end ? (
                <>
                  {/* Полка от конца линии к отведённой подписи, если её сдвинули. */}
                  <line
                    x1={W - R}
                    y1={Y(end.p)}
                    x2={W - R + 6}
                    y2={labelY.get(tier.id)! - 3}
                    stroke={style.color}
                    strokeWidth={1}
                    opacity={0.6}
                  />
                  <rect
                    x={W - R + 8}
                    y={labelY.get(tier.id)! - 10}
                    width={9}
                    height={9}
                    rx={2}
                    fill={style.color}
                  />
                  <text
                    x={W - R + 22}
                    y={labelY.get(tier.id)! - 2}
                    fill="var(--ink)"
                    fontSize={11.5}
                    fontWeight={600}
                  >
                    {content.tiers[tier.id]!.name}
                  </text>
                  <text x={W - R + 22} y={labelY.get(tier.id)! + 12} fill="var(--muted)" fontSize={10.5}>
                    {formatPercent(locale, end.p, 0)} {t.chart.by} {y1}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}

        {activeYear !== null && activeYear !== undefined ? (
          <>
            <line
              x1={X(activeYear)}
              y1={T}
              x2={X(activeYear)}
              y2={H - B}
              stroke="var(--ink)"
              strokeWidth={1}
              opacity={0.5}
            />
            {model.tiers.map((tier) => (
              <circle
                key={tier.id}
                cx={X(activeYear)}
                cy={Y(tier.curve[crosshair.index!]!.p)}
                r={4}
                fill={TIER_STYLE[tier.id].color}
                stroke="var(--surface-1)"
                strokeWidth={1.5}
              />
            ))}
          </>
        ) : null}
      </svg>
    </ChartFrame>
  );
}
