import type { ReactNode } from 'react';
import { useId } from 'react';

export interface SliderProps {
  readonly label: string;
  /** Плашка происхождения значения; рисуется под подписью. */
  readonly badge?: ReactNode;
  readonly hint: string;
  readonly value: number;
  readonly display: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
}

export function Slider({ label, badge, hint, value, display, min, max, step, onChange }: SliderProps) {
  const hintId = useId();
  return (
    <div className="ctl">
      <label>
        <span>{label}</span>
        <span className="val tabular">{display}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={hintId}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
      <p className="hint" id={hintId}>
        {badge ? <>{badge} </> : null}
        {hint}
      </p>
    </div>
  );
}

export interface SegmentedOption<T extends string | number> {
  readonly value: T;
  readonly label: string;
}

export interface SegmentedProps<T extends string | number> {
  readonly legend: string;
  readonly hint?: string | undefined;
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/**
 * Переключатель на радиокнопках, а не на кнопках с aria-pressed.
 * Группа радиокнопок обходится стрелками из коробки; набор кнопок пришлось бы
 * учить этому вручную, и в прототипе он этого не умел.
 */
export function Segmented<T extends string | number>({
  legend,
  hint,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const name = useId();
  const hintId = useId();
  return (
    <fieldset className="ctl seg-field">
      <legend>{legend}</legend>
      <div className="seg" role="none" aria-describedby={hint ? hintId : undefined}>
        {options.map((option) => (
          <label key={String(option.value)} className="seg-item">
            <input
              type="radio"
              name={name}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {hint ? (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

export function ControlGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="control-group">
      <h2>{title}</h2>
      <div className="controls">{children}</div>
    </section>
  );
}
