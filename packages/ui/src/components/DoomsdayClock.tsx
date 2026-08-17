export interface DoomsdayClockProps {
  readonly minutesToMidnight: number;
  readonly label: string;
}

const CENTER = 80;
const RADIUS = 62;

/**
 * Циферблат: часовая стрелка стоит на двенадцати, минутная отложена назад от
 * полуночи на заданное число минут. Чем ближе стрелки, тем хуже дела.
 *
 * Цвет стрелки — второй канал после положения, а не единственный: положение
 * несёт ту же информацию, поэтому дальтонизм ничего не ломает.
 */
export function DoomsdayClock({ minutesToMidnight, label }: DoomsdayClockProps) {
  const angle = (minutesToMidnight / 60) * Math.PI * 2;
  const handX = CENTER - Math.sin(angle) * (RADIUS - 14);
  const handY = CENTER - Math.cos(angle) * (RADIUS - 14);

  const handColor =
    minutesToMidnight < 3
      ? 'var(--graphic-critical)'
      : minutesToMidnight < 7
        ? 'var(--graphic-serious)'
        : 'var(--graphic-warning)';

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const outer = RADIUS - 6;
    const inner = RADIUS - (i % 3 === 0 ? 13 : 9);
    return {
      key: i,
      x1: CENTER + Math.sin(a) * outer,
      y1: CENTER - Math.cos(a) * outer,
      x2: CENTER + Math.sin(a) * inner,
      y2: CENTER - Math.cos(a) * inner,
      width: i % 3 === 0 ? 2 : 1,
    };
  });

  return (
    <svg viewBox="0 0 160 160" className="ddclock" role="img" aria-label={label}>
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--axis)" strokeWidth={2} />
      {ticks.map((t) => (
        <line
          key={t.key}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="var(--muted)"
          strokeWidth={t.width}
        />
      ))}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={CENTER}
        y2={CENTER - RADIUS + 26}
        stroke="var(--ink-2)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        x1={CENTER}
        y1={CENTER}
        x2={handX}
        y2={handY}
        stroke={handColor}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={CENTER} cy={CENTER} r={4} fill="var(--ink)" />
    </svg>
  );
}
