import { useEffect, useState } from 'react';
import { matchPreset } from '@sc/core';
import type { Assumptions, ModelConfig, RangedAssumption } from '@sc/core';
import { formatNumber, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';
import { Slider } from './controls.tsx';
import type { ScenarioStore } from '../store.ts';

export interface ScenarioBarProps {
  readonly config: ModelConfig;
  readonly assumptions: Assumptions;
  readonly locale: Locale;
  readonly store: ScenarioStore;
  readonly linkRejected: boolean;
}

/**
 * Пресеты и кнопка ссылки. Одинаковы на всех страницах: сценарий здесь
 * общий, а не свой у каждого раздела.
 */
export function ScenarioBar({ config, assumptions, locale, store, linkRejected }: ScenarioBarProps) {
  const t = MESSAGES[locale];
  const active = matchPreset(assumptions, config);

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
          >
            {t.presets[name] ?? name}
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
