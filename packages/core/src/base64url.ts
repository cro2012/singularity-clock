/**
 * base64url без обращения к среде.
 *
 * `btoa` и `Buffer` есть в браузере и в Node соответственно, но ядро не
 * обращается к среде исполнения вообще — иначе оно перестанет одинаково
 * работать в браузере, в функции и в тестах. Двадцать строк дешевле, чем
 * ветвление по платформе.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const REVERSE = new Map<string, number>(
  [...ALPHABET].map((char, index) => [char, index] as const),
);

export function bytesToBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    out += ALPHABET[b0 >> 2]!;
    out += ALPHABET[((b0 & 0b11) << 4) | ((b1 ?? 0) >> 4)]!;
    if (b1 === undefined) break;
    out += ALPHABET[((b1 & 0b1111) << 2) | ((b2 ?? 0) >> 6)]!;
    if (b2 === undefined) break;
    out += ALPHABET[b2 & 0b111111]!;
  }
  return out;
}

/** `null`, если строка содержит символы вне алфавита или имеет негодную длину. */
export function base64UrlToBytes(text: string): Uint8Array | null {
  if (text.length % 4 === 1) return null;

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of text) {
    const value = REVERSE.get(char);
    if (value === undefined) return null;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}
