/**
 * Генератор OG-картинок.
 *
 * Единственный серверный код в V0 и единственная причина, по которой сайт не
 * полностью статичен: краулеры мессенджеров не исполняют JS, а предгенерировать
 * все сценарии нельзя. Функция чистая — никакого чтения данных, никакого
 * состояния.
 *
 * M0: заглушка. Отрисовка через Satori приезжает в M3 вместе с кодеком сценария.
 */

export default (request: Request): Response => {
  const url = new URL(request.url);

  // Ключ кэша обязан включать версию конфига: иначе после правки констант
  // в мессенджерах навсегда застынет старая картинка (docs/architecture.md §2.3).
  const scenario = url.searchParams.get('s') ?? '';
  const configVersion = url.searchParams.get('v') ?? '';

  return new Response(
    JSON.stringify({ status: 'not implemented', milestone: 'M3', scenario, configVersion }),
    { status: 501, headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
};
