import { useState } from 'react';

/**
 * Экраны разделов.
 *
 * Каждая страница монтирует ровно один остров. Общего состояния между
 * страницами нет — его переносит параметр `s` в адресе (см. useScenario).
 */

import type { Assumptions, ComponentId, ModelConfig, RangedAssumption, TierId } from '@sc/core';
import { EQUAL_WEIGHTS, encodeScenario, matchPreset, probabilityAt, raceIndex } from '@sc/core';
import {
  CONTENT,
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
import { CompareRiskChart } from './components/CompareRiskChart.tsx';
import { ScenarioBar, SliderFor } from './components/ScenarioBar.tsx';
import { TierCards } from './components/TierCards.tsx';
import { TriggerPanel } from './components/TriggerPanel.tsx';
import { AnchorPicker } from './components/Anchor.tsx';
import { Purpose } from './components/Purpose.tsx';
import { ProvenanceLegend } from './components/Provenance.tsx';
import { Sensitivity } from './components/Sensitivity.tsx';
import { WhatItIs } from './components/WhatItIs.tsx';
import { ControlGroup, Segmented } from './components/controls.tsx';
import { useCompare } from './useCompare.ts';
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

  return (
    <>
      <Purpose locale={locale} />

      <ScenarioBar
        config={config}
        assumptions={assumptions}
        locale={locale}
        store={store}
        linkRejected={state.linkRejected}
        now={now}
      />
      <p className="datenote baseline-note">{t.baselineNote}</p>

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
          <p className="datenote">
            {interpolate(t.clockNote, {
              p: formatPercent(locale, model.doomsday.pGlobal),
              year: formatNumber(locale, config.constants.doomsday.horizonYear, {
                useGrouping: false,
              }),
            })}
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

      <Sensitivity config={config} assumptions={assumptions} locale={locale} now={clock} />

      <WhatItIs locale={locale} />

      <ProvenanceLegend locale={locale} />

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
        now={now}
      />

      <AnchorPicker config={config} assumptions={assumptions} locale={locale} store={store} />

      <ControlGroup title={t.controlsSingularity}>
        {(['doublingDays', 'bendPctPerYear', 'friction', 'singularityPct'] as const).map((id) => (
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

      <p className="datenote operational-note">{t.operationalNote}</p>

      <HorizonChart
        config={config}
        effective={model.effective}
        targetMinutes={assumptions.targetMinutes}
        anchorId={assumptions.anchorId}
        bendPctPerYear={assumptions.bendPctPerYear}
        locale={locale}
        now={clock}
      />
      <p className="datenote">{t.keyboardHint}</p>

      <div className="notice metr-caveat" role="note">
        <b>{t.metrCaveat.title}</b> {t.metrCaveat.body}
      </div>

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
            <code>{t.items.formula}</code>
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
        now={now}
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

      <section className="card expected">
        <p className="card-label">
          {interpolate(t.expectedCardTitle, {
            year: formatNumber(locale, model.expected.atYear, { useGrouping: false }),
          })}
        </p>
        <div className="expected-pair">
          <div>
            <p className="bignum tabular">{formatCompact(locale, model.expected.deaths)}</p>
            <p className="datenote">{t.expectedDeaths}</p>
          </div>
          <div>
            <p className="bignum tabular">{formatUsd(locale, model.expected.usd)}</p>
            <p className="datenote">{t.expectedUsd}</p>
          </div>
        </div>
        <p className="datenote caveat">{t.expectedCaveat}</p>
      </section>

      <section className="card severity">
        <p className="card-label">
          {interpolate(t.expectedTitle, {
            year: formatNumber(locale, model.expected.atYear, { useGrouping: false }),
          })}
        </p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">{t.tiers.rung}</th>
                <th scope="col">
                  {t.tiers.pBy} {model.expected.atYear}
                </th>
                <th scope="col">{t.tiers.deaths}</th>
                <th scope="col">{t.tiers.damage}</th>
              </tr>
            </thead>
            <tbody>
              {model.tiers.map((tier, index) => {
                const spec = config.tiers[index]!;
                const p =
                  tier.exactCurve.find((point) => point.year === model.expected.atYear)?.p ?? 0;
                return (
                  <tr key={tier.id}>
                    <th scope="row">{CONTENT[locale].tiers[tier.id]!.name}</th>
                    <td className="tabular">{formatPercent(locale, p)}</td>
                    <td className="tabular">
                      {formatCompact(locale, spec.deaths[0])}&ndash;{formatCompact(locale, spec.deaths[1])}
                    </td>
                    <td className="tabular">
                      {formatUsd(locale, spec.usd[0])}&ndash;{formatUsd(locale, spec.usd[1])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="datenote">{t.expectedRangeNote}</p>
        <p className="datenote">{t.exactLevelNote}</p>
      </section>

      <section className="card implied">
        <p className="card-label">{t.impliedReduction.title}</p>
        <ul>
          {model.tiers.map((tier, index) => (
            <li key={tier.id}>
              <span>{CONTENT[locale].tiers[tier.id]!.name}</span>
              <b className="tabular">
                &minus;{formatPercent(locale, model.effective.mitigation * config.tiers[index]!.mitigationCeiling, 0)}
              </b>
            </li>
          ))}
        </ul>
        <p className="datenote">{t.impliedReduction.note}</p>
      </section>

      <details>
        <summary>{t.tiers.formulaTitle}</summary>
        <div className="body">
          <p>
            <code>{t.tiers.formula}</code>
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
        now={now}
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
  // Черновые баллы спрятаны за явным действием. Предупреждение рядом с
  // таблицей читают не все, а скриншот таблицы уезжает дальше предупреждения.
  const [revealed, setRevealed] = useState(!provisional);
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
        now={now}
      />
      <p className="sub">{t.countries.intro}</p>

      {revealed ? null : (
        <div className="notice notice-strong reveal" role="note">
          <p>
            <b>{t.countries.provisionalTitle}</b> {t.countries.hidden}
          </p>
          <button type="button" className="preset" onClick={() => setRevealed(true)}>
            {t.countries.reveal}
          </button>
        </div>
      )}

      {revealed ? (
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
      ) : null}
    </>
  );
}

/* =========================== сравнение =========================== */

/**
 * Строки риска в сравнении.
 *
 * Нижняя ступень к 2050 показывает, насколько скоро вообще что-то случается,
 * верхняя к 2100 — во что упирается спор. Кривые вложенные, то есть каждая
 * означает «событие этого уровня или хуже».
 */
const RISK_ROWS: readonly { tier: TierId; year: number }[] = [
  { tier: 'local', year: 2050 },
  { tier: 'regional', year: 2050 },
  { tier: 'global', year: 2050 },
  { tier: 'global', year: 2100 },
];

const COMPARED: readonly RangedAssumption[] = [
  'doublingDays',
  'bendPctPerYear',
  'friction',
  'singularityPct',
  'malicePct',
  'alignFailPct',
  'mitigationPct',
  'dep0Pct',
  'tauYears',
  'adaptWindowYears',
];

export function CompareScreen({ config, locale, now }: ScreenProps) {
  const t = MESSAGES[locale];
  const pair = useCompare(config, now);
  const labels = { never: t.neverInModel, past: t.alreadyHappened };

  const nameOf = (assumptions: Assumptions) => {
    const preset = matchPreset(assumptions, config);
    return preset ? (t.presets[preset] ?? preset) : t.customScenario;
  };
  const nameA = nameOf(pair.a.assumptions);
  const nameB = nameOf(pair.b.assumptions);
  const identical = encodeScenario(pair.a.assumptions, config) === encodeScenario(pair.b.assumptions, config);

  const countdown = (date: number | null) => formatCountdown(locale, date, now, labels).headline;
  const number = (value: number) => formatNumber(locale, value);

  const rows: { label: string; a: string; b: string }[] = [
    { label: t.compare.singularity, a: countdown(pair.a.model.singularity.date), b: countdown(pair.b.model.singularity.date) },
    { label: t.compare.catastrophe, a: countdown(pair.a.model.anyLevel.medianDate), b: countdown(pair.b.model.anyLevel.medianDate) },
    {
      label: t.compare.doomsday,
      a: number(Math.round(pair.a.model.doomsday.minutesToMidnight * 10) / 10),
      b: number(Math.round(pair.b.model.doomsday.minutesToMidnight * 10) / 10),
    },
    // Раньше здесь стояли ожидаемые жертвы и ущерб. Их убрали со всех
    // остальных страниц как псевдоточные, и оставлять чёрный ход через
    // сравнение бессмысленно: человек всё равно получил бы то самое число.
    // Сравнивать сценарии полезнее по риску, который и есть предмет спора.
    ...RISK_ROWS.map(({ tier, year }) => {
      const index = config.tiers.findIndex((spec) => spec.id === tier);
      const at = (side: typeof pair.a) =>
        formatPercent(locale, probabilityAt(side.model.tiers[index]!.curve, year));
      return {
        label: interpolate(t.compare.riskRow, {
          tier: CONTENT[locale].tiers[tier]!.name,
          year: formatNumber(locale, year, { useGrouping: false }),
        }),
        a: at(pair.a),
        b: at(pair.b),
      };
    }),
    {
      label: interpolate(t.compare.deaths, {
        year: formatNumber(locale, pair.a.model.expected.atYear, { useGrouping: false }),
      }),
      a: formatCompact(locale, pair.a.model.expected.deaths),
      b: formatCompact(locale, pair.b.model.expected.deaths),
    },
    {
      label: interpolate(t.compare.usd, {
        year: formatNumber(locale, pair.a.model.expected.atYear, { useGrouping: false }),
      }),
      a: formatUsd(locale, pair.a.model.expected.usd),
      b: formatUsd(locale, pair.b.model.expected.usd),
    },
  ];

  const assumptionRows = COMPARED.map((id) => {
    const copy = MESSAGES[locale].sliders[id];
    const decimals = (String(config.ranges[id].step).split('.')[1] ?? '').length;
    const show = (value: number) =>
      `${formatNumber(locale, value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${copy.unit ? ` ${copy.unit}` : ''}`;
    return {
      label: copy.label,
      a: show(pair.a.assumptions[id]),
      b: show(pair.b.assumptions[id]),
    };
  });

  const picker = (side: 'a' | 'b', current: Assumptions) => (
    <div className="presets">
      <span className="lbl">{side === 'a' ? t.compare.sideA : t.compare.sideB}</span>
      {Object.keys(config.presets).map((name) => (
        <button
          key={name}
          type="button"
          className="preset"
          aria-pressed={matchPreset(current, config) === name}
          onClick={() => pair.setSide(side, config.presets[name]!)}
        >
          {t.presets[name] ?? name}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Вступление живёт в шапке страницы (lede), здесь его повторять незачем. */}
      {picker('a', pair.a.assumptions)}
      {picker('b', pair.b.assumptions)}
      <p className="row-actions">
        <button type="button" className="preset" onClick={pair.swap}>
          {t.compare.swap}
        </button>
      </p>

      {identical ? (
        <p className="notice" role="status">
          {t.compare.identical}
        </p>
      ) : null}

      <div className="table-scroll">
        <table className="data compare-table">
          <thead>
            <tr>
              <th scope="col">{t.compare.assumption}</th>
              <th scope="col">{nameA}</th>
              <th scope="col">{nameB}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="compare-result">
                <th scope="row">{row.label}</th>
                <td>{row.a}</td>
                <td className={row.a === row.b ? undefined : 'differs'}>{row.b}</td>
              </tr>
            ))}
            {assumptionRows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.a}</td>
                <td className={row.a === row.b ? undefined : 'differs'}>{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CompareRiskChart
        a={pair.a.model}
        b={pair.b.model}
        labels={{ a: nameA, b: nameB }}
        locale={locale}
      />
      <p className="datenote">{t.keyboardHint}</p>
    </>
  );
}
