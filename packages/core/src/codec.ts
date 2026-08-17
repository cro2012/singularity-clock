/**
 * Кодировка сценария в URL.
 *
 * Требования: компактно (ссылка должна влезать в мессенджер без переносов),
 * без бэкенда, без протухания. Формат — фиксированный порядок квантованных
 * полей, битовая маска триггеров, base64url. Базовый сценарий — 13 байт,
 * то есть 18 символов.
 *
 * Жёсткие правила формата:
 *   1. Порядок полей внутри версии неизменен. Новое поле = новая версия.
 *   2. Неизвестная версия — отказ целиком (`null`). Молчаливого частичного
 *      разбора не бывает: лучше показать «ссылка из другой версии», чем
 *      бесшумно подставить чужие допущения.
 *   3. Порядок триггеров берётся из конфига и закреплён тестом. Новые триггеры
 *      добавляются только в конец списка, иначе старые ссылки поменяют смысл.
 */

import { base64UrlToBytes, bytesToBase64Url } from './base64url.ts';
import { COMPONENTS } from './countries.ts';
import { clamp } from './time.ts';
import type {
  Assumptions,
  ComponentWeights,
  ModelConfig,
  Range,
  Reliability,
  TargetMinutes,
} from './types.ts';

export const SCENARIO_CODEC_VERSION = 1;

/** Максимум триггеров, помещающихся в двухбайтовую маску. */
export const MAX_TRIGGERS = 16;

/** Квантование: значение → байт по диапазону и шагу ползунка. */
function quantize(value: number, range: Range): number {
  const steps = Math.round((clamp(value, range.min, range.max) - range.min) / range.step);
  return clamp(steps, 0, 255);
}

function dequantize(byte: number, range: Range): number {
  const value = range.min + byte * range.step;
  // Шаг может быть дробным (трение — 0,1), а двоичная дробь его не представляет
  // точно. Округляем до разрядности шага, иначе 1.8 приезжает как
  // 1.8000000000000003 и ломает сравнение с пресетом.
  const decimals = (String(range.step).split('.')[1] ?? '').length;
  return clamp(Number(value.toFixed(decimals)), range.min, range.max);
}

function weightsToBytes(weights: ComponentWeights): number[] {
  const max = Math.max(...COMPONENTS.map((c) => weights[c]), 0);
  if (max <= 0) return COMPONENTS.map(() => 0);
  return COMPONENTS.map((c) => clamp(Math.round((weights[c] / max) * 255), 0, 255));
}

function bytesToWeights(bytes: Uint8Array, offset: number): ComponentWeights {
  const entries = COMPONENTS.map((c, i) => [c, (bytes[offset + i] ?? 0) / 255] as const);
  return Object.fromEntries(entries) as ComponentWeights;
}

export function encodeScenario(assumptions: Assumptions, config: ModelConfig): string {
  const r = config.ranges;
  const targetIndex = config.targets.findIndex((t) => t.minutes === assumptions.targetMinutes);

  const flags =
    (targetIndex < 0 ? 0 : targetIndex & 0b11) |
    (assumptions.reliability === 80 ? 0b100 : 0) |
    (assumptions.geopolitics === false ? 0 : 0b1000);

  const triggerOrder = config.triggers.map((t) => t.id);
  let mask = 0;
  triggerOrder.forEach((id, index) => {
    if (index < MAX_TRIGGERS && assumptions.triggers.has(id)) mask |= 1 << index;
  });

  const bytes = [
    SCENARIO_CODEC_VERSION,
    quantize(assumptions.doublingDays, r.doublingDays),
    quantize(assumptions.friction, r.friction),
    flags,
    quantize(assumptions.singularityPct, r.singularityPct),
    quantize(assumptions.malicePct, r.malicePct),
    quantize(assumptions.alignFailPct, r.alignFailPct),
    quantize(assumptions.mitigationPct, r.mitigationPct),
    quantize(assumptions.dep0Pct, r.dep0Pct),
    quantize(assumptions.tauYears, r.tauYears),
    quantize(assumptions.adaptWindowYears, r.adaptWindowYears),
    mask & 0xff,
    (mask >> 8) & 0xff,
  ];

  if (assumptions.geopolitics !== false) {
    bytes.push(...weightsToBytes(assumptions.geopolitics.weights));
  }

  return bytesToBase64Url(new Uint8Array(bytes));
}

const BASE_LENGTH = 13;

export function decodeScenario(text: string, config: ModelConfig): Assumptions | null {
  const bytes = base64UrlToBytes(text);
  if (!bytes || bytes.length < BASE_LENGTH) return null;
  if (bytes[0] !== SCENARIO_CODEC_VERSION) return null;

  const r = config.ranges;
  const flags = bytes[3]!;

  const target = config.targets[flags & 0b11];
  if (!target) return null;

  const hasGeopolitics = (flags & 0b1000) !== 0;
  if (hasGeopolitics && bytes.length < BASE_LENGTH + COMPONENTS.length) return null;

  const mask = bytes[11]! | (bytes[12]! << 8);
  const triggers = new Set<string>();
  config.triggers.forEach((spec, index) => {
    if (index < MAX_TRIGGERS && (mask & (1 << index)) !== 0) triggers.add(spec.id);
  });

  return {
    doublingDays: dequantize(bytes[1]!, r.doublingDays),
    friction: dequantize(bytes[2]!, r.friction),
    targetMinutes: target.minutes as TargetMinutes,
    reliability: ((flags & 0b100) !== 0 ? 80 : 50) as Reliability,
    singularityPct: dequantize(bytes[4]!, r.singularityPct),
    malicePct: dequantize(bytes[5]!, r.malicePct),
    alignFailPct: dequantize(bytes[6]!, r.alignFailPct),
    mitigationPct: dequantize(bytes[7]!, r.mitigationPct),
    dep0Pct: dequantize(bytes[8]!, r.dep0Pct),
    tauYears: dequantize(bytes[9]!, r.tauYears),
    adaptWindowYears: dequantize(bytes[10]!, r.adaptWindowYears),
    triggers,
    geopolitics: hasGeopolitics
      ? { weights: bytesToWeights(bytes, BASE_LENGTH) }
      : false,
  };
}

/** Имя пресета, если сценарий совпадает с ним; иначе `null`. */
export function matchPreset(assumptions: Assumptions, config: ModelConfig): string | null {
  for (const [name, preset] of Object.entries(config.presets)) {
    if (encodeScenario(assumptions, config) === encodeScenario(preset, config)) return name;
  }
  return null;
}
