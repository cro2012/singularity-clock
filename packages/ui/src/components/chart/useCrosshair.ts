import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, RefObject } from 'react';

/**
 * Курсор по оси X, работающий и мышью, и с клавиатуры.
 *
 * Подсказка на наведении и клавиатурная навигация — не два разных механизма,
 * а один: и мышь, и стрелки двигают один и тот же индекс, и оба пути пишут
 * в один статусный элемент с aria-live. В прототипе подсказка была только
 * мышиная, то есть недоступна с клавиатуры (ТЗ §13).
 */
export interface Crosshair {
  readonly index: number | null;
  readonly svgRef: RefObject<SVGSVGElement | null>;
  readonly handlers: {
    onPointerMove: (event: PointerEvent<SVGSVGElement>) => void;
    onPointerLeave: () => void;
    onKeyDown: (event: KeyboardEvent<SVGSVGElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    tabIndex: number;
  };
}

export interface CrosshairOptions {
  /** Число точек по оси X. */
  readonly count: number;
  /** Границы области построения в единицах viewBox. */
  readonly plot: { readonly left: number; readonly right: number; readonly width: number };
}

export function useCrosshair({ count, plot }: CrosshairOptions): Crosshair {
  const [index, setIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const move = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(count - 1, next))),
    [count],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || count === 0) return;
      // Геометрия читается из события, а не при рендере: компонент обязан
      // одинаково рендериться на сервере, где никакого DOM нет.
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;
      const x = ((event.clientX - rect.left) / rect.width) * plot.width;
      if (x < plot.left || x > plot.right) {
        setIndex(null);
        return;
      }
      const fraction = (x - plot.left) / (plot.right - plot.left);
      move(Math.round(fraction * (count - 1)));
    },
    [count, move, plot.left, plot.right, plot.width],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<SVGSVGElement>) => {
      if (count === 0) return;
      const current = index ?? 0;
      const step = event.shiftKey ? 10 : 1;
      switch (event.key) {
        case 'ArrowRight':
          move(current + step);
          break;
        case 'ArrowLeft':
          move(current - step);
          break;
        case 'Home':
          move(0);
          break;
        case 'End':
          move(count - 1);
          break;
        case 'Escape':
          setIndex(null);
          return;
        default:
          return;
      }
      event.preventDefault();
    },
    [count, index, move],
  );

  return {
    index,
    svgRef,
    handlers: {
      onPointerMove,
      onPointerLeave: () => setIndex(null),
      onKeyDown,
      onFocus: () => setIndex((current) => current ?? 0),
      onBlur: () => setIndex(null),
      tabIndex: 0,
    },
  };
}
