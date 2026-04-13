/**
 * Валидация входящих запросов от Telegram
 */

/**
 * Проверить, что запрос является POST запросом
 */
export function isPostRequest(method: string): boolean {
  return method === "POST";
}

/**
 * Распарсить JSON тело запроса
 */
export async function parseRequestBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch (error) {
    console.error("Ошибка парсинга JSON:", error);
    throw new Error("Invalid JSON body");
  }
}

/**
 * Проверить, что сообщение содержит текст (не фото/стикер)
 */
export function hasTextMessage(body: any): body is { message: { text: string; chat: { id: number }; from: { first_name?: string } } } {
  return body?.message?.text != null;
}

/**
 * Создать ответ на невалидный запрос
 */
export function createMethodNotAllowedResponse(): Response {
  return new Response("Method not allowed", { status: 405 });
}

export function createOkResponse(): Response {
  return new Response("OK", { status: 200 });
}
