import { useEffect, useMemo, useState } from 'react';
import { computeModel, matchPreset, probabilityAt } from '@sc/core';
import type { Assumptions, ModelConfig, RangedAssumption } from '@sc/core';
import { formatNumber, formatPercent, interpolate, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';
import { Badge, type ProvenanceKind } from './Provenance.tsx';
import { Slider } from './controls.tsx';
import type { ScenarioStore } from '../store.ts';

export interface ScenarioBarProps {
  readonly config: ModelConfig;
  readonly assumptions: Assumptions;
  readonly locale: Locale;
  readonly store: ScenarioStore;
  readonly linkRejected: boolean;
  /** Время расчёта. Нужно, чтобы подписать кнопки риском каждого пресета. */
  readonly now: number;
}

/**
 * Пресеты и кнопка ссылки. Одинаковы на всех страницах: сценарий здесь
 * общий, а не свой у каждого раздела.
 */
export function ScenarioBar({
  config,
  assumptions,
  locale,
  store,
  linkRejected,
  now,
}: ScenarioBarProps) {
  const t = MESSAGES[locale];
  const active = matchPreset(assumptions, config);

  // Название пресета — это темперамент, а темперамент не проверишь. Число
  // рядом с ним проверить можно: это тот самый глобальный риск, ради спора о
  // котором сюда и приходят. Считается один раз на конфиг, а не на рендер.
  const risk = useMemo(() => {
    const horizon = config.constants.doomsday.horizonYear;
    return Object.fromEntries(
      Object.entries(config.presets).map(([name, preset]) => {
        const model = computeModel({ assumptions: preset, config, now });
        return [name, probabilityAt(model.tiers[model.tiers.length - 1]!.ownCurve, horizon)];
      }),
    );
  }, [config, now]);

  return (
    <>
      {linkRejected ? (
        <p className="notice" role="status">
          {t.linkFromOtherVersion}
        </p>
      ) : null}
      <div className="presets">
        <span className="lbl">{t.presetLabel}</span>
        {Object.keys(config.presets).map((name) => (
          <button
            key={name}
            type="button"
            className="preset"
            aria-pressed={active === name}
            onClick={() => store.replace(config.presets[name]!)}
            title={interpolate(t.presetRisk, {
              p: formatPercent(locale, risk[name] ?? 0),
              year: formatNumber(locale, config.constants.doomsday.horizonYear, {
                useGrouping: false,
              }),
            })}
          >
            {t.presets[name] ?? name}
            <span className="preset-risk tabular">{formatPercent(locale, risk[name] ?? 0)}</span>
          </button>
        ))}
        {active === null ? <span className="lbl">· {t.customScenario}</span> : null}
        <ShareButton store={store} labels={{ copy: t.copyLink, done: t.copied }} />
      </div>
    </>
  );
}

function ShareButton({
  store,
  labels,
}: {
  store: ScenarioStore;
  labels: { copy: string; done: string };
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className="preset share"
      onClick={() => {
        const url = new URL(window.location.href);
        url.searchParams.set('s', store.encode());
        void navigator.clipboard?.writeText(url.toString()).then(() => setCopied(true));
      }}
    >
      {copied ? labels.done : labels.copy}
    </button>
  );
}

/**
 * Откуда взялось значение по умолчанию у каждого ползунка.
 *
 * Время удвоения — продолжение измеренного тренда METR, всё остальное —
 * суждение автора модели. Сама опорная точка помечена measured и живёт
 * отдельным блоком на странице сингулярности. Плашка стоит у ползунка, чтобы разница читалась
 * без похода в методологию.
 */
const PROVENANCE: Record<RangedAssumption, ProvenanceKind> = {
  doublingDays: 'extrapolated',
  friction: 'assumed',
  singularityPct: 'assumed',
  malicePct: 'assumed',
  alignFailPct: 'assumed',
  mitigationPct: 'assumed',
  dep0Pct: 'assumed',
  tauYears: 'assumed',
  adaptWindowYears: 'assumed',
};

export interface SliderForProps {
  readonly id: RangedAssumption;
  readonly config: ModelConfig;
  readonly locale: Locale;
  readonly assumptions: Assumptions;
  readonly onChange: (patch: Partial<Assumptions>) => void;
}

export function SliderFor({ id, config, locale, assumptions, onChange }: SliderForProps) {
  const copy = MESSAGES[locale].sliders[id];
  const range = config.ranges[id];
  const value = assumptions[id];
  const decimals = (String(range.step).split('.')[1] ?? '').length;
  const shown = formatNumber(locale, value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Slider
      label={copy.label}
      badge={<Badge kind={PROVENANCE[id]} locale={locale} />}
      hint={copy.hint}
      value={value}
      display={copy.unit ? `${shown} ${copy.unit}` : `×${shown}`}
      min={range.min}
      max={range.max}
      step={range.step}
      onChange={(next) => onChange({ [id]: next } as Partial<Assumptions>)}
    />
  );
}
