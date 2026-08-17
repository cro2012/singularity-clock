/**
 * Дизайн-токены. Источник истины: отсюда генерируется tokens.generated.css
 * и отсюда же тест берёт значения для проверки контраста.
 *
 * Роль токена — не украшение, а обещание. `text` гарантирует 4,5:1 на любой
 * разрешённой поверхности, `graphic` — 3:1. Разделение введено потому, что
 * критический красный #d03b3b проходит для рамки и не проходит для подписи,
 * и ничто, кроме типа, не мешает поставить его в подпись.
 *
 * Обоснование значений: docs/adr/0003-palette.md.
 */

export type SurfaceId = 'plane' | 'surface1' | 'surface2';
export type TokenRole = 'text' | 'graphic';

export const SURFACES: Readonly<Record<SurfaceId, string>> = {
  plane: '#0d0d0d',
  surface1: '#1a1a19',
  surface2: '#212120',
};

export interface Token {
  readonly name: string;
  readonly value: string;
  readonly role: TokenRole;
  /** Поверхности, на которых токен разрешён. Тест проверяет каждую. */
  readonly on: readonly SurfaceId[];
  readonly note?: string;
}

const ALL_SURFACES: readonly SurfaceId[] = ['plane', 'surface1', 'surface2'];

export const TOKENS: readonly Token[] = [
  // --- текст ---
  { name: 'ink', value: '#ffffff', role: 'text', on: ALL_SURFACES },
  { name: 'ink-2', value: '#c3c2b7', role: 'text', on: ALL_SURFACES },
  {
    name: 'muted',
    value: '#908e87',
    role: 'text',
    on: ALL_SURFACES,
    note: 'светлее прототипного #898781: тот давал 4,49:1 на surface-2',
  },

  // --- порядковая шкала ступеней риска: один тон, равные шаги светлоты ---
  { name: 'tier-local', value: '#3d6fae', role: 'graphic', on: ALL_SURFACES },
  { name: 'tier-regional', value: '#4a92e8', role: 'graphic', on: ALL_SURFACES },
  { name: 'tier-global', value: '#86b6ef', role: 'graphic', on: ALL_SURFACES },

  // --- серия графика экстраполяции ---
  { name: 'series-1', value: '#3987e5', role: 'graphic', on: ALL_SURFACES },

  // --- статусы: текстовые и графические версии различаются ---
  { name: 'text-good', value: '#0ca30c', role: 'text', on: ALL_SURFACES },
  { name: 'text-warning', value: '#fab219', role: 'text', on: ALL_SURFACES },
  { name: 'text-serious', value: '#ec835a', role: 'text', on: ALL_SURFACES },
  {
    name: 'text-critical',
    value: '#e56a6a',
    role: 'text',
    on: ALL_SURFACES,
    note: 'светлее графического: #d03b3b даёт лишь 3,6:1 и в текст не годится',
  },
  { name: 'graphic-good', value: '#0ca30c', role: 'graphic', on: ALL_SURFACES },
  { name: 'graphic-warning', value: '#fab219', role: 'graphic', on: ALL_SURFACES },
  { name: 'graphic-serious', value: '#ec835a', role: 'graphic', on: ALL_SURFACES },
  { name: 'graphic-critical', value: '#d03b3b', role: 'graphic', on: ALL_SURFACES },

  // --- линии сетки: к ним требований по контрасту нет, они обязаны быть тихими ---
  { name: 'grid', value: '#2c2c2a', role: 'graphic', on: [] },
  { name: 'axis', value: '#383835', role: 'graphic', on: [] },
];

/** Порядковая шкала ступеней. Порядок значим: от нижней ступени к верхней. */
export const TIER_RAMP: readonly string[] = ['tier-local', 'tier-regional', 'tier-global'];

/** Минимальный контраст по роли токена. */
export const MIN_CONTRAST: Readonly<Record<TokenRole, number>> = {
  text: 4.5,
  graphic: 3,
};
