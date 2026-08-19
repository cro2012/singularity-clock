import { MESSAGES } from '@sc/i18n';
import type { Locale } from '@sc/i18n';

/**
 * Зачем этот сервис существует.
 *
 * Стоит выше счётчиков намеренно. Человек, попавший сюда впервые, видит
 * обратный отсчёт до катастрофы с точностью до секунды и мгновенно читает его
 * как прогноз — никакой дисклеймер ниже этого уже не отменит. Объяснение
 * должно стоять до числа, а не после.
 */
export function Purpose({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale].purpose;

  return (
    <section className="purpose">
      <p className="purpose-kicker">{t.kicker}</p>
      <p className="purpose-lead">{t.lead}</p>
      <ol className="purpose-steps">
        {t.steps.map((step, i) => (
          <li key={step.title}>
            <span className="purpose-num" aria-hidden="true">
              {i + 1}
            </span>
            <b>{step.title}</b>
            <span>{step.body}</span>
          </li>
        ))}
      </ol>
      <p className="purpose-takeaway">{t.takeaway}</p>
    </section>
  );
}
