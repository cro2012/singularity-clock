import { useCallback, useEffect, useMemo, useState } from 'react';
import { computeModel, decodeScenario, encodeScenario } from '@sc/core';
import type { Assumptions, ModelConfig, ModelResult } from '@sc/core';

/**
 * Два сценария рядом.
 *
 * Отдельно от useScenario намеренно: здесь нечего редактировать ползунками,
 * колонки выбираются целиком. Источник истины тот же — адресная строка, только
 * параметров два: `a` и `b`.
 */
export interface ComparePair {
  readonly a: { readonly assumptions: Assumptions; readonly model: ModelResult };
  readonly b: { readonly assumptions: Assumptions; readonly model: ModelResult };
  readonly setSide: (side: 'a' | 'b', assumptions: Assumptions) => void;
  readonly swap: () => void;
}

export function useCompare(config: ModelConfig, now: number): ComparePair {
  const presets = Object.keys(config.presets);
  const fallbackA = config.presets[presets[0]!]!;
  const fallbackB = config.presets[presets[presets.length - 1]!] ?? fallbackA;

  const [pair, setPair] = useState<{ a: Assumptions; b: Assumptions }>({
    a: fallbackA,
    b: fallbackB,
  });
  const [clock, setClock] = useState(now);

  // Как и на остальных страницах: адресную строку и настоящее время читаем
  // после монтирования, иначе разметка разойдётся с серверной.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const decode = (key: string, fallback: Assumptions) => {
      const raw = params.get(key);
      return (raw ? decodeScenario(raw, config) : null) ?? fallback;
    };
    setPair({ a: decode('a', fallbackA), b: decode('b', fallbackB) });
    setClock(Date.now());
    // Зависимость только от config: fallbackA и fallbackB выведены из него
    // и меняются вместе с ним.
  }, [config]);

  const write = useCallback(
    (next: { a: Assumptions; b: Assumptions }) => {
      setPair(next);
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.searchParams.set('a', encodeScenario(next.a, config));
      url.searchParams.set('b', encodeScenario(next.b, config));
      window.history.replaceState(null, '', url);
    },
    [config],
  );

  return useMemo(
    () => ({
      a: { assumptions: pair.a, model: computeModel({ assumptions: pair.a, config, now: clock }) },
      b: { assumptions: pair.b, model: computeModel({ assumptions: pair.b, config, now: clock }) },
      setSide: (side, assumptions) => write({ ...pair, [side]: assumptions }),
      swap: () => write({ a: pair.b, b: pair.a }),
    }),
    [pair, config, clock, write],
  );
}
