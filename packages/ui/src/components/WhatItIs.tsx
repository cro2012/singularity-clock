import { MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';

/**
 * «Что это и чем это не является».
 *
 * Блок стоит на главной, а не спрятан в разделе «как считается», по одной
 * причине: сервис показывает числа жертв и обратный отсчёт до катастрофы.
 * Человек, попавший сюда впервые, должен узнать, чего эта штука НЕ утверждает,
 * до того как увидит цифру, а не после.
 *
 * Правая колонка не мельче левой и не спрятана под раскрывашку намеренно:
 * оговорки, которые надо разворачивать, читаются как оговорки для галочки.
 */
export function WhatItIs({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale].what;

  return (
    <section className="whatis" aria-labelledby="whatis-is whatis-isnot">
      <div className="whatis-col">
        <h2 id="whatis-is">{t.isTitle}</h2>
        <ul>
          {t.is.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div className="whatis-col whatis-not">
        <h2 id="whatis-isnot">{t.isNotTitle}</h2>
        <ul>
          {t.isNot.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
