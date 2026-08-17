/**
 * Состояние сценария.
 *
 * Стор живёт вне React намеренно. Пересчёт модели должен происходить один раз
 * на изменение допущения, а не на каждый рендер каждого компонента, и подписки
 * на него должны быть отделены от секундного тика: тик обновляет две строки и
 * не имеет права трогать расчёт (docs/architecture.md §4.1).
 */

import { computeModel, decodeScenario, encodeScenario, type Assumptions, type ModelConfig, type ModelResult } from '@sc/core';

export interface ScenarioState {
  readonly assumptions: Assumptions;
  readonly model: ModelResult;
  /** Ссылка была из другой версии кодека и не восстановлена. */
  readonly linkRejected: boolean;
}

type Listener = () => void;

export interface ScenarioStore {
  subscribe(listener: Listener): () => void;
  getSnapshot(): ScenarioState;
  set(patch: Partial<Assumptions>): void;
  replace(assumptions: Assumptions): void;
  toggleTrigger(id: string): void;
  encode(): string;
  /**
   * Догрузка того, чего не было на сервере: настоящего времени и сценария из
   * адресной строки. Вызывается один раз после монтирования — если сделать это
   * при первом рендере, разметка разойдётся с серверной.
   */
  hydrate(patch: { readonly now?: number; readonly encoded?: string | null }): void;
}

export interface StoreOptions {
  readonly config: ModelConfig;
  /** Время расчёта. Фиксируется на старте: модель не должна дрожать от тика. */
  readonly now: number;
  readonly initial?: Assumptions | undefined;
  /** Строка сценария из URL. Неразобранная строка не роняет страницу. */
  readonly encoded?: string | null | undefined;
  /** Как записать сценарий обратно в адресную строку. */
  readonly onEncoded?: ((encoded: string) => void) | undefined;
}

export function createScenarioStore(options: StoreOptions): ScenarioStore {
  const { config } = options;
  let now = options.now;

  const decode = (encoded: string | null | undefined) => {
    const parsed = encoded ? decodeScenario(encoded, config) : null;
    return { parsed, rejected: Boolean(encoded) && parsed === null };
  };

  const first = decode(options.encoded);
  const start = first.parsed ?? options.initial ?? config.presets.base!;

  const listeners = new Set<Listener>();
  let state: ScenarioState = {
    assumptions: start,
    model: computeModel({ assumptions: start, config, now }),
    linkRejected: first.rejected,
  };

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const recompute = (assumptions: Assumptions, linkRejected: boolean): void => {
    state = { assumptions, model: computeModel({ assumptions, config, now }), linkRejected };
    notify();
  };

  const publish = (assumptions: Assumptions): void => {
    // Отказ показывается один раз: как только пользователь что-то тронул,
    // сообщение про чужую версию перестаёт быть правдой.
    recompute(assumptions, false);
    options.onEncoded?.(encodeScenario(assumptions, config));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    set: (patch) => publish({ ...state.assumptions, ...patch }),
    replace: (assumptions) => publish(assumptions),
    toggleTrigger(id) {
      const triggers = new Set(state.assumptions.triggers);
      if (!triggers.delete(id)) triggers.add(id);
      publish({ ...state.assumptions, triggers });
    },
    encode: () => encodeScenario(state.assumptions, config),
    hydrate(patch) {
      if (patch.now !== undefined) now = patch.now;
      const link = 'encoded' in patch ? decode(patch.encoded) : { parsed: null, rejected: false };
      recompute(link.parsed ?? state.assumptions, link.rejected);
    },
  };
}

/**
 * Секундный тик, отдельный от стора сценария.
 *
 * Единственный таймер на странице: каждый счётчик со своим интервалом
 * разъехался бы по фазе, и цифры моргали бы вразнобой.
 */
export function createTicker(startNow: number): {
  subscribe(listener: Listener): () => void;
  getSnapshot(): number;
} {
  const listeners = new Set<Listener>();
  let value = startNow;
  let timer: ReturnType<typeof setInterval> | undefined;

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (timer === undefined) {
        timer = setInterval(() => {
          value = Date.now();
          for (const l of listeners) l();
        }, 1000);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
    getSnapshot: () => value,
  };
}
