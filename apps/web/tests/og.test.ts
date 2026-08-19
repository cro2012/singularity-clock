/**
 * OG-функция — единственный серверный код сервиса и главный канал
 * распространения. Тест проверяет, что она отдаёт настоящий PNG нужного
 * размера, а не «что-то похожее»: сломанная картинка в мессенджере не выдаёт
 * себя ничем, кроме пустого прямоугольника.
 */

import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import og from '../netlify/functions/og.mts';

// OG_DUMP=<каталог> — сохранить отрендеренные картинки, чтобы посмотреть
// глазами. Проверить PNG-магию тест может, а вёрстку — нет.
const DUMP = process.env.OG_DUMP;

const PNG_MAGIC = '89504e470d0a1a0a';

async function render(query: string) {
  const response = await og(new Request(`https://example.test/og${query}`));
  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    status: response.status,
    type: response.headers.get('content-type'),
    isPng: bytes.subarray(0, 8).toString('hex') === PNG_MAGIC,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes,
  };
}

function dump(name: string, bytes: Buffer) {
  if (DUMP) writeFileSync(`${DUMP}/og-${name}.png`, bytes);
}

describe('OG-картинка', () => {
  it('без параметров отдаёт базовый пресет размером 1200×630', async () => {
    const image = await render('');
    expect(image.status).toBe(200);
    expect(image.type).toBe('image/png');
    expect(image.isPng).toBe(true);
    expect([image.width, image.height]).toEqual([1200, 630]);
    dump('base', image.bytes);
  });

  it('разные сценарии дают разные картинки', async () => {
    const base = await render('?l=ru');
    const doomsday = await render('?l=ru&s=AR0FAggySwoUBDcAAA');
    expect(doomsday.isPng).toBe(true);
    expect(base.bytes.equals(doomsday.bytes)).toBe(false);
    dump('doomsday', doomsday.bytes);
  });

  it('устаревший параметр локали не ломает картинку и ничего не меняет', () => {
    // Сайт был двуязычным, ссылки с ?l= успели разойтись. Параметр теперь
    // ничего не значит, но обязан молча игнорироваться, а не ронять функцию.
    return Promise.all([render(''), render('?l=ru'), render('?l=en')]).then(([plain, ru, en]) => {
      expect(plain.isPng && ru.isPng && en.isPng).toBe(true);
      expect(ru.bytes.equals(plain.bytes)).toBe(true);
      expect(en.bytes.equals(plain.bytes)).toBe(true);
    });
  });

  it('битая строка сценария не роняет функцию, а даёт базовый пресет', async () => {
    const broken = await render('?s=!!!!не-сценарий!!!!');
    const base = await render('');
    expect(broken.status).toBe(200);
    expect(broken.bytes.equals(base.bytes)).toBe(true);
  });
});
