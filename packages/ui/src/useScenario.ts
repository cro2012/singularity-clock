import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ModelConfig } from '@sc/core';
import { createScenarioStore, createTicker, type ScenarioState, type ScenarioStore } from './store.ts';

/**
 * Сценарий на любой странице сервиса.
 *
 * Страницы статические и у каждой свой остров, поэтому общего состояния между
 * ними нет и быть не может. Единственный носитель — параметр `s` в адресе:
 * он же источник истины для OG-картинки и для расшаренной ссылки. Отсюда
 * следствие: любая внутренняя ссылка обязана его нести, иначе переход между
 * разделами молча сбросит сценарий.
 */
export interface Scenario {
  readonly store: ScenarioStore;
  readonly state: ScenarioState;
  /** Текущее время для счётчиков. Обновляется раз в секунду. */
  readonly clock: number;
}

/** Проставляет текущий сценарий во все внутренние ссылки. */
export function syncScenarioLinks(encoded: string): void {
  if (typeof document === 'undefined') return;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-scenario]')) {
    const url = new URL(link.href, window.location.origin);
    url.searchParams.set('s', encoded);
    link.href = `${url.pathname}${url.search}`;
  }
}

export function useScenario(config: ModelConfig, now: number): Scenario {
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
          syncScenarioLinks(encoded);
        },
      }),
    [config, now],
  );

  const ticker = useMemo(() => createTicker(now), [now]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const clock = useSyncExternalStore(ticker.subscribe, ticker.getSnapshot, () => now);

  // Настоящее время и сценарий из адресной строки приезжают после
  // монтирования: на сервере их нет, и чтение при первом рендере развалило бы
  // гидратацию.
  useEffect(() => {
    store.hydrate({
      now: Date.now(),
      encoded: new URLSearchParams(window.location.search).get('s'),
    });
    syncScenarioLinks(store.encode());
  }, [store]);

  return { store, state, clock };
}
