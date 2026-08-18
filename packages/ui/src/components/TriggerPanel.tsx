import type { TriggerSpec } from '@sc/core';
import { CONTENT, MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';

export interface TriggerPanelProps {
  readonly specs: readonly TriggerSpec[];
  readonly active: ReadonlySet<string>;
  readonly locale: Locale;
  readonly onToggle: (id: string) => void;
}

/**
 * Панель наблюдаемых событий.
 *
 * Разгоняющие и успокаивающие разведены по группам и по цвету. Второй тип
 * обязателен: без него панель превращается в машину нагнетания (ТЗ §5).
 * Автоматически ничего не включается никогда — отметка это суждение
 * пользователя, а не факт из ленты.
 */
export function TriggerPanel({ specs, active, locale, onToggle }: TriggerPanelProps) {
  const t = MESSAGES[locale];
  const copy = CONTENT[locale].triggers;

  const groups = [
    { calming: false, title: t.triggers.accelerating, items: specs.filter((s) => !s.calming) },
    { calming: true, title: t.triggers.calming, items: specs.filter((s) => s.calming) },
  ];

  return (
    <>
      {groups.map((group) => (
        <section key={String(group.calming)} className="trigger-group">
          {/* h2, а не h3: на странице триггеров это первый уровень после
              заголовка страницы, и пропуск ступени ломает порядок заголовков. */}
          <h2>{group.title}</h2>
          <div className="trigs">
            {group.items.map((spec) => {
              const text = copy[spec.id];
              const on = active.has(spec.id);
              return (
                <label
                  key={spec.id}
                  className={`trig${group.calming ? ' calming' : ''}${on ? ' on' : ''}`}
                >
                  <input type="checkbox" checked={on} onChange={() => onToggle(spec.id)} />
                  <span className="tx">
                    {text?.title ?? spec.id}
                    <small>{text?.criterion}</small>
                    <span className="fx tabular">{text?.effect}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
