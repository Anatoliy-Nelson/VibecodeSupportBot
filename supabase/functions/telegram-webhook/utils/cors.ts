/**
 * CORS (Cross-Origin Resource Sharing) утилиты
 * Обработка preflight запросов и заголовков
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

/**
 * Создать ответ на CORS preflight запрос (OPTIONS)
 */
export function handleCorsPreflight(): Response {
  return new Response("OK", {
    status: 200,
    headers: CORS_HEADERS,
  });
}

/**
 * Добавить CORS заголовки к ответу
 */
export function withCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
