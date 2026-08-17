import type { ModelResult, TierId, TierSpec } from '@sc/core';
import {
  CONTENT,
  formatCompact,
  formatMonthYear,
  formatPercent,
  formatUsd,
  MESSAGES,
} from '@sc/i18n';
import type { Locale } from '@sc/i18n';

const TIER_COLOR: Record<TierId, string> = {
  local: 'var(--tier-local)',
  regional: 'var(--tier-regional)',
  global: 'var(--tier-global)',
};

export interface TierCardsProps {
  readonly model: ModelResult;
  readonly specs: readonly TierSpec[];
  readonly locale: Locale;
}

export function TierCards({ model, specs, locale }: TierCardsProps) {
  const t = MESSAGES[locale];
  const content = CONTENT[locale].tiers;
  const specById = new Map(specs.map((spec) => [spec.id, spec]));

  const at = (curve: ModelResult['tiers'][number]['curve'], year: number) =>
    curve.find((p) => p.year === year)?.p ?? curve[curve.length - 1]?.p ?? 0;

  return (
    <div className="tiergrid">
      {model.tiers.map((tier) => {
        const spec = specById.get(tier.id)!;
        const copy = content[tier.id]!;
        return (
          <article key={tier.id} className="tier" style={{ ['--tc' as string]: TIER_COLOR[tier.id] }}>
            <h3>
              <span className="dot" aria-hidden="true" />
              {copy.name}
            </h3>
            <p className="thresh">{copy.threshold}</p>
            <p className="med tabular">
              {tier.medianDate === null ? `> ${model.tiers[0]!.curve.at(-1)?.year}` : formatMonthYear(locale, tier.medianDate)}{' '}
              <small>{tier.medianDate === null ? t.tiers.noMedian : t.tiers.median}</small>
            </p>
            <p className="probs tabular">
              <span>{t.tiers.pBy} 2035</span> {formatPercent(locale, at(tier.curve, 2035))}
              {' · '}
              <span>2050</span> {formatPercent(locale, at(tier.curve, 2050))}
              {' · '}
              <span>2100</span> {formatPercent(locale, at(tier.curve, 2100))}
            </p>
            <p className="probs tabular">
              <span>{t.tiers.deaths}</span> {formatCompact(locale, spec.deaths[0])}–
              {formatCompact(locale, spec.deaths[1])}
              {' · '}
              <span>{t.tiers.damage}</span> {formatUsd(locale, spec.usd[0])}–{formatUsd(locale, spec.usd[1])}
            </p>
            <p className="scen">{copy.mechanisms}</p>
          </article>
        );
      })}
    </div>
  );
}
