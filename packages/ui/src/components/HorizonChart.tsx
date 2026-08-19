import { useMemo } from 'react';
import { anchorFrom, anchorOptionFor, dateForLog2Horizon, log2HorizonAt, YEAR_MS } from '@sc/core';
import type { Trend } from '@sc/core';
import type { EffectiveParams, ModelConfig, TargetMinutes } from '@sc/core';
import { formatHorizon, formatMonthYear, formatNumber, interpolate, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';
import { ChartFrame } from './chart/ChartFrame.tsx';
import { useCrosshair } from './chart/useCrosshair.ts';

const W = 900;
const H = 340;
const L = 58;
const R = 112;
const T = 16;
const B = 34;
const SAMPLES = 160;

const Y_MIN = Math.log10(0.5);
const Y_MAX = Math.log10(3e5);

export interface HorizonChartProps {
  readonly config: ModelConfig;
  readonly effective: EffectiveParams;
  readonly targetMinutes: TargetMinutes;
  /** Опорная точка METR, выбранная в сценарии. */
  readonly anchorId: string;
  /** Изгиб тренда: на сколько процентов время удвоения меняется за год. */
  readonly bendPctPerYear: number;
  readonly locale: Locale;
  readonly now: number;
}

export function HorizonChart({
  config,
  effective,
  targetMinutes,
  anchorId,
  bendPctPerYear,
  locale,
  now,
}: HorizonChartProps) {
  const t = MESSAGES[locale];
  const metrAnchor = anchorOptionFor(config, anchorId);
  const D = effective.doublingDays;
  const trend: Trend = useMemo(
    () => ({
      anchor: anchorFrom(metrAnchor.at, metrAnchor.horizonMinutes),
      doublingDays: D,
      bendPctPerYear,
    }),
    [metrAnchor.at, metrAnchor.horizonMinutes, D, bendPctPerYear],
  );
  const factor = effective.reliabilityFactor;

  const x0 = Date.UTC(2023, 0, 1);
  const longest = config.targets[config.targets.length - 1]!.minutes * factor;
  // На плато дата самого длинного порога уходит в бесконечность, и правая
  // граница окна должна остаться конечной.
  const longestDate = dateForLog2Horizon(Math.log2(longest), trend);
  const x1 = Math.min(
    Date.UTC(2060, 0, 1),
    Math.max(
      now + 2 * YEAR_MS,
      Number.isFinite(longestDate) ? longestDate + 1.2 * YEAR_MS : 0,
    ),
  );

  const X = (time: number) => L + ((time - x0) / (x1 - x0)) * (W - L - R);
  const Y = (minutes: number) =>
    T + (1 - (Math.log10(minutes) - Y_MIN) / (Y_MAX - Y_MIN)) * (H - T - B);
  const yLog2 = (log2: number) =>
    T + (1 - ((log2 * Math.LN2) / Math.LN10 - Y_MIN) / (Y_MAX - Y_MIN)) * (H - T - B);

  const samples = useMemo(
    () =>
      Array.from({ length: SAMPLES }, (_, i) => {
        const time = x0 + ((x1 - x0) * i) / (SAMPLES - 1);
        return { time, log2: log2HorizonAt(time, trend) };
      }),
    [trend, x0, x1],
  );

  const crosshair = useCrosshair({ count: SAMPLES, plot: { left: L, right: W - R, width: W } });
  const active = crosshair.index === null ? null : samples[crosshair.index]!;

  const path = (from: number, to: number) =>
    samples
      .filter((s) => s.time >= from && s.time <= to)
      .map((s, i) => `${i === 0 ? 'M' : 'L'} ${X(s.time).toFixed(1)} ${yLog2(s.log2).toFixed(1)}`)
      .join(' ');

  const targetDate = dateForLog2Horizon(Math.log2(targetMinutes * factor), trend);
  const yearStep = (x1 - x0) / YEAR_MS > 22 ? 5 : (x1 - x0) / YEAR_MS > 11 ? 2 : 1;
  const gridYears: number[] = [];
  for (let y = 2024; y <= 2060; y += yearStep) {
    const time = Date.UTC(y, 0, 1);
    if (time >= x0 && time <= x1) gridYears.push(y);
  }

  const readout = active
    ? interpolate(t.chart.horizonReadout, {
        date: formatMonthYear(locale, active.time),
        horizon: formatHorizon(locale, Math.pow(2, Math.min(active.log2, 1023))),
      })
    : '';

  const summary = interpolate(t.chart.horizonSummary, {
    anchor: formatHorizon(locale, metrAnchor.horizonMinutes),
    doubling: formatNumber(locale, Math.round(D)),
    target: formatHorizon(locale, targetMinutes * factor),
    date: formatMonthYear(locale, targetDate),
  });

  const tableRows = gridYears.map((year) => {
    const time = Date.UTC(year, 6, 1);
    // В одном году точек METR бывает несколько; таблица обязана показать
    // все, иначе она молча теряет замеры, которые видно на графике.
    const points = config.metrPoints.filter((p) => new Date(p.at).getUTCFullYear() === year);
    return [
      formatNumber(locale, year, { useGrouping: false }),
      formatHorizon(locale, Math.pow(2, Math.min(log2HorizonAt(time, trend), 1023))),
      points.length > 0
        ? points.map((p) => `${p.model} · ${formatHorizon(locale, p.horizonMinutes)}`).join(', ')
        : '—',
    ];
  });

  return (
    <ChartFrame
      title={t.chart.horizonTitle}
      subtitle={t.chart.horizonSubtitle}
      summary={summary}
      readout={readout}
      labels={{ chart: t.chart.asChart, table: t.chart.asTable }}
      table={{
        caption: t.chart.horizonTitle,
        head: [t.chart.year, t.chart.horizon, t.chart.metrPoint],
        rows: tableRows,
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
        {gridYears.map((year) => {
          const x = X(Date.UTC(year, 0, 1));
          return (
            <g key={year}>
              <line x1={x} y1={T} x2={x} y2={H - B} stroke="var(--grid)" strokeWidth={1} />
              <text x={x} y={H - B + 18} fill="var(--muted)" fontSize={11} textAnchor="middle">
                {year}
              </text>
            </g>
          );
        })}

        {[1, 10, 100, 1000, 10000, 100000].map((v) => (
          <text key={v} x={L - 9} y={Y(v) + 4} fill="var(--muted)" fontSize={11} textAnchor="end">
            {v >= 1000 ? `${v / 1000}k` : v}
          </text>
        ))}
        <text x={L - 9} y={T - 2} fill="var(--muted)" fontSize={10.5} textAnchor="end">
          {t.chart.minutes}
        </text>

        {config.targets.map((target) => {
          const y = Y(target.minutes * factor);
          if (y < T || y > H - B) return null;
          const on = target.minutes === targetMinutes;
          return (
            <g key={target.key}>
              <line
                x1={L}
                y1={y}
                x2={W - R}
                y2={y}
                stroke="var(--axis)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <text
                x={W - R + 8}
                y={y + 4}
                fill={on ? 'var(--ink)' : 'var(--muted)'}
                fontSize={11.5}
                fontWeight={on ? 600 : 400}
              >
                {t.targets[target.key] ?? target.key}
              </text>
            </g>
          );
        })}

        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--axis)" strokeWidth={1} />

        <path d={path(x0, now)} fill="none" stroke="var(--series-1)" strokeWidth={2} opacity={0.85} />
        <path
          d={path(now, x1)}
          fill="none"
          stroke="var(--series-1)"
          strokeWidth={2}
          strokeDasharray="6 5"
        />

        <line x1={X(now)} y1={T} x2={X(now)} y2={H - B} stroke="var(--ink-2)" strokeWidth={1} opacity={0.45} />
        <text x={X(now) + 6} y={T + 12} fill="var(--ink-2)" fontSize={11}>
          {t.chart.today}
        </text>

        {config.metrPoints
          .filter((p) => p.at >= x0)
          .map((p) => (
            <circle
              key={p.model}
              cx={X(p.at)}
              cy={Y(p.horizonMinutes)}
              r={5}
              fill="var(--series-1)"
              stroke="var(--surface-1)"
              strokeWidth={2}
            />
          ))}

        {targetDate > x0 && targetDate < x1 ? (
          <g>
            <circle
              cx={X(targetDate)}
              cy={Y(targetMinutes * factor)}
              r={6.5}
              fill="none"
              stroke="var(--graphic-warning)"
              strokeWidth={2}
            />
            <text
              x={X(targetDate) + (X(targetDate) > W - R - 90 ? -11 : 11)}
              y={Y(targetMinutes * factor) - 11}
              fill="var(--graphic-warning)"
              fontSize={11.5}
              fontWeight={600}
              textAnchor={X(targetDate) > W - R - 90 ? 'end' : 'start'}
            >
              {formatMonthYear(locale, targetDate)}
            </text>
          </g>
        ) : null}

        {active ? (
          <g>
            <line
              x1={X(active.time)}
              y1={T}
              x2={X(active.time)}
              y2={H - B}
              stroke="var(--ink)"
              strokeWidth={1}
              opacity={0.5}
            />
            <circle cx={X(active.time)} cy={yLog2(active.log2)} r={4} fill="var(--ink)" />
          </g>
        ) : null}
      </svg>
    </ChartFrame>
  );
}
