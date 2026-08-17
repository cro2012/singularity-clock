import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Assumptions, ModelConfig, RangedAssumption } from '@sc/core';
import { matchPreset } from '@sc/core';
import {
  endSentence,
  formatCountdown,
  formatCompact,
  formatFullDate,
  formatNumber,
  formatPercent,
  formatUsd,
  interpolate,
  MESSAGES,
  pluralize,
  type Locale,
} from '@sc/i18n';
import { Counter } from './Counter.tsx';
import { DoomsdayClock } from './DoomsdayClock.tsx';
import { ControlGroup, Segmented, Slider } from './controls.tsx';
import { createScenarioStore, createTicker } from '../store.ts';

export interface FirstScreenProps {
  readonly config: ModelConfig;
  readonly locale: Locale;
  /** Время сборки. На клиенте заменяется настоящим после монтирования. */
  readonly now: number;
}

const SPEED_SLIDERS: readonly RangedAssumption[] = ['doublingDays', 'friction', 'singularityPct'];
const RISK_SLIDERS: readonly RangedAssumption[] = [
  'malicePct',
  'alignFailPct',
  'mitigationPct',
  'dep0Pct',
  'tauYears',
  'adaptWindowYears',
];

export function FirstScreen({ config, locale, now }: FirstScreenProps) {
  const t = MESSAGES[locale];

  const store = useMemo(
    () =>
      createScenarioStore({
        config,
        now,
        onEncoded: (encoded) => {
          if (typeof window === 'undefined') return;
          const url = new URL(window.location.href);
          url.searchParams.set('s', encoded);
          window.history.replaceState(null, '', url);
        },
      }),
    [config, now],
  );

  const ticker = useMemo(() => createTicker(now), [now]);

  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const clock = useSyncExternalStore(ticker.subscribe, ticker.getSnapshot, () => now);

  // Настоящее время и сценарий из адресной строки приезжают после монтирования:
  // на сервере их нет, и попытка прочитать их при первом рендере развалила бы
  // гидратацию.
  useEffect(() => {
    store.hydrate({
      now: Date.now(),
      encoded: new URLSearchParams(window.location.search).get('s'),
    });
  }, [store]);

  const { assumptions, model } = state;
  const activePreset = matchPreset(assumptions, config);

  const totalItems = model.items.length;
  const number = (value: number) => formatNumber(locale, value);

  const singularity = formatCountdown(locale, model.singularity.date, clock, {
    never: t.neverInModel,
    past: t.alreadyHappened,
  });
  const catastrophe = formatCountdown(locale, model.anyLevel.medianDate, clock, {
    never: t.neverInModel,
    past: t.alreadyHappened,
  });

  const minutes = model.doomsday.minutesToMidnight;
  const wholeMinutes = Math.floor(minutes);
  const clockText =
    minutes >= 1
      ? `${number(wholeMinutes)} ${pluralize(locale, wholeMinutes, t.minutes)} ${number(Math.round((minutes % 1) * 60))} ${pluralize(locale, Math.round((minutes % 1) * 60), t.seconds)}`
      : `${number(Math.round(minutes * 60))} ${pluralize(locale, Math.round(minutes * 60), t.seconds)}`;

  const pGlobal = 1 - minutes / config.constants.doomsday.scaleMinutes;

  return (
    <>
      {state.linkRejected ? (
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
            aria-pressed={activePreset === name}
            onClick={() => store.replace(config.presets[name]!)}
          >
            {t.presets[name] ?? name}
          </button>
        ))}
        {activePreset === null ? <span className="lbl">· {t.customScenario}</span> : null}
        <ShareButton getLink={() => store.encode()} labels={{ copy: t.copyLink, done: t.copied }} />
      </div>

      <div className="hero">
        <Counter
          label={t.singularityCard}
          countdown={singularity}
          note={
            <>
              {model.singularity.date !== null && singularity.kind === 'future' ? (
                <>
                  {t.dateIs}: <b>{endSentence(formatFullDate(locale, model.singularity.date))}</b>{' '}
                </>
              ) : null}
              {interpolate(t.singularityNote, {
                pct: formatPercent(locale, assumptions.singularityPct / 100, 0),
                total: number(totalItems),
                passed: formatPercent(locale, model.singularity.passedShare, 0),
              })}
            </>
          }
        />
        <Counter
          label={t.catastropheCard}
          countdown={catastrophe}
          note={
            <>
              {model.anyLevel.medianDate !== null ? (
                <>
                  {t.dateIs}: <b>{endSentence(formatFullDate(locale, model.anyLevel.medianDate))}</b>{' '}
                </>
              ) : (
                <>{t.neverInModelHint}. </>
              )}
              {t.catastropheNote}
            </>
          }
        />
      </div>

      <div className="card clockcard">
        <DoomsdayClock minutesToMidnight={minutes} label={`${t.clockTitle}: ${clockText}`} />
        <div>
          <p className="card-label">{t.clockTitle}</p>
          <p className="bignum tabular clock-min">{clockText}</p>
          <p className="datenote">
            {interpolate(t.clockNote, { p: formatPercent(locale, pGlobal) })}
          </p>
          <p>
            <span className={`badge alert-${model.doomsday.alertLevel}`}>
              <span className="ic" aria-hidden="true">
                ●
              </span>
              {t.alert[model.doomsday.alertLevel]}
            </span>
          </p>
        </div>
      </div>

      <div className="card expected">
        <div>
          <p className="card-label">
            {interpolate(t.expectedTitle, {
              year: formatNumber(locale, model.expected.atYear, { useGrouping: false }),
            })}
          </p>
          <p className="bignum tabular exp-num">{formatCompact(locale, model.expected.deaths)}</p>
          <p className="datenote">{t.expectedDeaths}</p>
        </div>
        <div>
          <p className="card-label" aria-hidden="true">
            &nbsp;
          </p>
          <p className="bignum tabular exp-num">{formatUsd(locale, model.expected.usd)}</p>
          <p className="datenote">{t.expectedUsd}</p>
        </div>
      </div>

      <ControlGroup title={t.controlsSingularity}>
        {SPEED_SLIDERS.map((key) => (
          <SliderFor key={key} id={key} config={config} locale={locale} assumptions={assumptions} onChange={store.set} />
        ))}
        <Segmented
          legend={t.targetLabel}
          hint={t.targetHint}
          value={assumptions.targetMinutes}
          options={config.targets.map((target) => ({
            value: target.minutes,
            label: t.targets[target.key] ?? target.key,
          }))}
          onChange={(targetMinutes) => store.set({ targetMinutes })}
        />
        <Segmented
          legend={t.reliabilityLabel}
          hint={t.reliabilityHint}
          value={assumptions.reliability}
          options={[
            { value: 50 as const, label: t.reliability50 },
            { value: 80 as const, label: t.reliability80 },
          ]}
          onChange={(reliability) => store.set({ reliability })}
        />
      </ControlGroup>

      <ControlGroup title={t.controlsRisk}>
        {RISK_SLIDERS.map((key) => (
          <SliderFor key={key} id={key} config={config} locale={locale} assumptions={assumptions} onChange={store.set} />
        ))}
      </ControlGroup>

      <div className="disclaimer">
        <b>{t.disclaimerTitle}</b> {t.disclaimer}
      </div>

      <p className="datenote">{t.milestoneNote}</p>
    </>
  );
}

function SliderFor({
  id,
  config,
  locale,
  assumptions,
  onChange,
}: {
  id: RangedAssumption;
  config: ModelConfig;
  locale: Locale;
  assumptions: Assumptions;
  onChange: (patch: Partial<Assumptions>) => void;
}) {
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

function ShareButton({
  getLink,
  labels,
}: {
  getLink: () => string;
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
        url.searchParams.set('s', getLink());
        void navigator.clipboard?.writeText(url.toString()).then(() => setCopied(true));
      }}
    >
      {copied ? labels.done : labels.copy}
    </button>
  );
}
