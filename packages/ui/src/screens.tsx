/**
 * Экраны разделов.
 *
 * Каждая страница монтирует ровно один остров. Общего состояния между
 * страницами нет — его переносит параметр `s` в адресе (см. useScenario).
 */

import type { ComponentId, ModelConfig } from '@sc/core';
import { EQUAL_WEIGHTS, raceIndex } from '@sc/core';
import {

  endSentence,
  formatCompact,
  formatCountdown,
  formatFullDate,
  formatNumber,
  formatPercent,
  formatUsd,
  interpolate,
  MESSAGES,
  pluralize,
  type Locale,
} from '@sc/i18n';
import { Counter } from './components/Counter.tsx';
import { CountryPanel } from './components/CountryPanel.tsx';
import { DoomsdayClock } from './components/DoomsdayClock.tsx';
import { HorizonChart } from './components/HorizonChart.tsx';
import { ItemTable } from './components/ItemTable.tsx';
import { RiskChart } from './components/RiskChart.tsx';
import { ScenarioBar, SliderFor } from './components/ScenarioBar.tsx';
import { TierCards } from './components/TierCards.tsx';
import { TriggerPanel } from './components/TriggerPanel.tsx';
import { ControlGroup, Segmented } from './components/controls.tsx';
import { useScenario } from './useScenario.ts';
import type { CountryScores } from '@sc/core';

export interface ScreenProps {
  readonly config: ModelConfig;
  readonly locale: Locale;
  /** Время сборки. На клиенте заменяется настоящим после монтирования. */
  readonly now: number;
}

/* ============================ главная ============================ */

export function HomeScreen({ config, locale, now }: ScreenProps) {
  const t = MESSAGES[locale];
  const { store, state, clock } = useScenario(config, now);
  const { assumptions, model } = state;

  const number = (value: number) => formatNumber(locale, value);
  const labels = { never: t.neverInModel, past: t.alreadyHappened };
  const singularity = formatCountdown(locale, model.singularity.date, clock, labels);
  const catastrophe = formatCountdown(locale, model.anyLevel.medianDate, clock, labels);

  const minutes = model.doomsday.minutesToMidnight;
  const whole = Math.floor(minutes);
  const seconds = Math.round((minutes % 1) * 60);
  const clockText =
    minutes >= 1
      ? `${number(whole)} ${pluralize(locale, whole, t.minutes)} ${number(seconds)} ${pluralize(locale, seconds, t.seconds)}`
      : `${number(Math.round(minutes * 60))} ${pluralize(locale, Math.round(minutes * 60), t.seconds)}`;
  const pGlobal = 1 - minutes / config.constants.doomsday.scaleMinutes;

  return (
    <>
      <ScenarioBar
        config={config}
        assumptions={assumptions}
        locale={locale}
        store={store}
        linkRejected={state.linkRejected}
      />

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
                total: number(model.items.length),
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
                <>{endSentence(t.neverInModelHint)} </>
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
          <p className="datenote">{interpolate(t.clockNote, { p: formatPercent(locale, pGlobal) })}</p>
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

      <div className="disclaimer">
        <b>{t.disclaimerTitle}</b> {t.disclaimer}
      </div>
    </>
  );
}

/* ========================= сингулярность ========================= */

export function SingularityScreen({ config, locale, now }: ScreenProps) {
  const t = MESSAGES[locale];
  const { store, state, clock } = useScenario(config, now);
  const { assumptions, model } = state;

  return (
    <>
      <ScenarioBar
        config={config}
        assumptions={assumptions}
        locale={locale}
        store={store}
        linkRejected={state.linkRejected}
      />

      <ControlGroup title={t.controlsSingularity}>
        {(['doublingDays', 'friction', 'singularityPct'] as const).map((id) => (
          <SliderFor
            key={id}
            id={id}
            config={config}
            locale={locale}
            assumptions={assumptions}
            onChange={store.set}
          />
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

      <HorizonChart
        config={config}
        effective={model.effective}
        targetMinutes={assumptions.targetMinutes}
        locale={locale}
        now={clock}
      />
      <p className="datenote">{t.keyboardHint}</p>

      <h2 className="section-h">{t.items.functionsTitle}</h2>
      <ItemTable
        kind="function"
        items={model.items}
        specs={config.functions}
        locale={locale}
        now={clock}
      />

      <h2 className="section-h">{t.items.industriesTitle}</h2>
      <ItemTable
        kind="industry"
        items={model.items}
        specs={config.industries}
        locale={locale}
        now={clock}
      />

      <details>
        <summary>{t.items.howComputed}</summary>
        <div className="body">
          <p>
            <code>дата = t₀ + D · log₂(коэф · порог · надёжность / H₀) + лаг</code>
          </p>
          <p>{t.items.formulaNote}</p>
        </div>
      </details>
    </>
  );
}

/* ======================= лестница катастроф ======================= */

export function CatastropheScreen({ config, locale, now }: ScreenProps) {
  const t = MESSAGES[locale];
  const { store, state } = useScenario(config, now);
  const { assumptions, model } = state;

  return (
    <>
      <ScenarioBar
        config={config}
        assumptions={assumptions}
        locale={locale}
        store={store}
        linkRejected={state.linkRejected}
      />

      <ControlGroup title={t.controlsRisk}>
        {(
          ['malicePct', 'alignFailPct', 'mitigationPct', 'dep0Pct', 'tauYears', 'adaptWindowYears'] as const
        ).map((id) => (
          <SliderFor
            key={id}
            id={id}
            config={config}
            locale={locale}
            assumptions={assumptions}
            onChange={store.set}
          />
        ))}
      </ControlGroup>

      <p className="datenote nested-note">{t.tiers.nestedNote}</p>
      <TierCards model={model} specs={config.tiers} locale={locale} />

      <RiskChart model={model} locale={locale} />
      <p className="datenote">{t.keyboardHint}</p>

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

      <details>
        <summary>{t.tiers.formulaTitle}</summary>
        <div className="body">
          <p>
            <code>
              λᵢ(t) = (умысел·wᵢ + отказ контроля·uᵢ) · cᵢ(t) · d(t) · (1 − митигация·eᵢ) · aᵢ(t)
            </code>
          </p>
          <p>{t.tiers.formulaNote}</p>
          <p>{t.tiers.formulaHonesty}</p>
        </div>
      </details>
    </>
  );
}

/* ============================ триггеры ============================ */

export function TriggersScreen({ config, locale, now }: ScreenProps) {
  const t = MESSAGES[locale];
  const { store, state, clock } = useScenario(config, now);
  const { assumptions, model } = state;
  const labels = { never: t.neverInModel, past: t.alreadyHappened };

  return (
    <>
      <ScenarioBar
        config={config}
        assumptions={assumptions}
        locale={locale}
        store={store}
        linkRejected={state.linkRejected}
      />

      <p className="sub">{t.triggers.intro}</p>

      <div className="mini-hero">
        <div>
          <p className="card-label">{t.singularityCard}</p>
          <p className="bignum tabular mini-num">
            {formatCountdown(locale, model.singularity.date, clock, labels).headline}
          </p>
        </div>
        <div>
          <p className="card-label">{t.catastropheCard}</p>
          <p className="bignum tabular mini-num">
            {formatCountdown(locale, model.anyLevel.medianDate, clock, labels).headline}
          </p>
        </div>
      </div>

      <TriggerPanel
        specs={config.triggers}
        active={assumptions.triggers}
        locale={locale}
        onToggle={store.toggleTrigger}
      />
    </>
  );
}

/* ============================= страны ============================= */

export interface CountriesScreenProps extends ScreenProps {
  readonly countries: readonly CountryScores[];
  readonly provisional: boolean;
}

export function CountriesScreen({
  config,
  locale,
  now,
  countries,
  provisional,
}: CountriesScreenProps) {
  const t = MESSAGES[locale];
  const { store, state } = useScenario(config, now);
  const { assumptions, model } = state;
  const weights = assumptions.geopolitics === false ? EQUAL_WEIGHTS : assumptions.geopolitics.weights;

  // Индекс гонки считается и при выключенном переключателе: пользователь
  // должен видеть число до того, как решит подключить его к модели риска.
  const preview =
    model.raceIndex ?? raceIndex(countries, weights, config.constants.geopolitics.topN);

  return (
    <>
      <ScenarioBar
        config={config}
        assumptions={assumptions}
        locale={locale}
        store={store}
        linkRejected={state.linkRejected}
      />
      <p className="sub">{t.countries.intro}</p>

      <CountryPanel
        countries={countries}
        weights={weights}
        geopoliticsOn={assumptions.geopolitics !== false}
        raceIndex={preview}
        mitigationPenalty={config.constants.geopolitics.mitigationPenalty}
        provisional={provisional}
        locale={locale}
        onWeight={(component: ComponentId, value: number) =>
          store.set({ geopolitics: { weights: { ...weights, [component]: value } } })
        }
        onToggleGeopolitics={(on) => store.set({ geopolitics: on ? { weights } : false })}
        onEqualWeights={() =>
          store.set({
            geopolitics: assumptions.geopolitics === false ? false : { weights: EQUAL_WEIGHTS },
          })
        }
      />
    </>
  );
}
