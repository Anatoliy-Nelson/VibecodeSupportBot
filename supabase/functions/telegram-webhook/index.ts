import { serve } from "std/http";
import { handleCorsPreflight, createMethodNotAllowedResponse, hasTextMessage, parseRequestBody, createOkResponse } from "./utils/validation.ts";
import { handleStartCommand, isStartCommand } from "./handlers/start-command.ts";
import { saveMessageToDatabase } from "./services/database.ts";
import { sendTelegramMessage } from "./utils/telegram.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === "OPTIONS") {
    return handleCorsPreflight();
  }

  // Только POST запросы от Telegram
  if (req.method !== "POST") {
    return createMethodNotAllowedResponse();
  }

  // Парсинг тела запроса
  const body = await parseRequestBody(req);
  const { message } = body;

  // Если нет текста — игнорируем (фото, стикер и т.д.)
  if (!hasTextMessage(body)) {
    return createOkResponse();
  }

  console.log(
    `Получено сообщение от ${message.from.first_name}: ${message.text}`,
  );

  // Обработка команды /start
  if (isStartCommand(message.text)) {
    await handleStartCommand(BOT_TOKEN, message.chat.id);
    return createOkResponse();
  }

  // Сохраняем сообщение в БД
  await saveMessageToDatabase(
    message.chat.id,
    message.from.first_name,
    message.text,
  );

  // Отправляем эхо-ответ пользователю
  await sendTelegramMessage(
    BOT_TOKEN,
    message.chat.id,
    `🤖 Вы написали: ${message.text}`,
  );

  return createOkResponse();
});
