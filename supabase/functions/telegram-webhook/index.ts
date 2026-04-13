import { serve } from "std/http";
import { handleCorsPreflight, createMethodNotAllowedResponse, hasTextMessage, parseRequestBody, createOkResponse } from "./utils/validation.ts";
import { handleStartCommand, isStartCommand } from "./handlers/start-command.ts";
import { 
  upsertTelegramUser, 
  getOpenTicket, 
  addConversationMessage, 
  getTicketWithManager 
} from "./services/database.ts";
import { sendTelegramMessage, sendStatusMessage, escapeHtml } from "./utils/telegram.ts";

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
    `Получено сообщение от ${message.from.first_name} (@${message.from.username || 'no-username'}): ${message.text}`,
  );

  // Обработка команды /start
  if (isStartCommand(message.text)) {
    await handleStartCommand(BOT_TOKEN, message.chat.id);
    return createOkResponse();
  }

  // ============================================
  // НОВАЯ ЛОГИКА: система тикетов
  // ============================================

  // 1. Создаём или обновляем пользователя
  const userResult = await upsertTelegramUser(
    message.chat.id,
    message.from.username,
    message.from.first_name,
    message.from.last_name,
  );

  if (!userResult.success || !userResult.data) {
    console.error("Не удалось создать/обновить пользователя:", userResult.error);
    await sendTelegramMessage(
      BOT_TOKEN,
      message.chat.id,
      "⚠️ Произошла ошибка. Попробуйте позже.",
    );
    return createOkResponse();
  }

  const user = userResult.data;

  // 2. Проверяем, есть ли открытый тикет
  const { hasTicket, ticket } = await getOpenTicket(user.id);

  if (hasTicket && ticket) {
    // Есть открытый тикет → добавляем сообщение в conversation
    await addConversationMessage(
      ticket.id,
      "user",
      user.id,
      message.text,
    );

    // Проверяем, назначен ли менеджер
    const { manager } = await getTicketWithManager(ticket.id);

    if (manager) {
      // Менеджер назначен → отвечаем accordingly
      await sendStatusMessage(BOT_TOKEN, message.chat.id, "reply", {
        managerName: "Менеджер", // TODO: получить из admin_users
      });
    } else {
      // Менеджер не назначен → просто подтверждаем
      await sendStatusMessage(BOT_TOKEN, message.chat.id, "received");
    }
  } else {
    // Нет открытого тикета → просто подтверждаем получение
    // (тикет создаётся вручную менеджером в админ-панели)
    await sendStatusMessage(BOT_TOKEN, message.chat.id, "received");
  }

  return createOkResponse();
});
