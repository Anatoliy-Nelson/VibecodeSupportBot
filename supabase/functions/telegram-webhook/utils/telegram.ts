/**
 * Утилиты для работы с Telegram Bot API
 */

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

/**
 * Отправить сообщение через Telegram Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
): Promise<boolean> {
  const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      console.error(
        `Ошибка отправки сообщения: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    console.log(`Сообщение отправлено в чат ${chatId}`);
    return true;
  } catch (error) {
    console.error("Ошибка вызова Telegram API:", error);
    return false;
  }
}

/**
 * Отправить статус-сообщение (для пользователя)
 */
export async function sendStatusMessage(
  botToken: string,
  chatId: number,
  statusType: "received" | "assigned" | "closed" | "reply",
  additionalInfo?: { managerName?: string; ticketId?: string },
): Promise<boolean> {
  const messages = {
    received: "✅ <b>Сообщение получено!</b>\n\n" +
      "Ваше сообщение записано. Менеджер ответит вам в ближайшее время. 🕐",
    
    assigned: "👋 <b>Менеджер назначен!</b>\n\n" +
      (additionalInfo?.managerName 
        ? `Ваш вопрос курирует менеджер: <b>${additionalInfo.managerName}</b>\n` 
        : "Ваш вопрос назначен на менеджера.\n") +
      (additionalInfo?.ticketId 
        ? `Номер тикета: <code>#${additionalInfo.ticketId.slice(0, 8)}</code>` 
        : ""),
    
    closed: "🔒 <b>Тикет закрыт</b>\n\n" +
      "Ваш вопрос был решён. Если нужна ещё помощь — напишите снова!",
    
    reply: "💬 <b>Ответ менеджера:</b>\n\n{text}",
  };

  let text = messages[statusType];
  
  if (statusType === "reply" && additionalInfo?.managerName) {
    text = `<b>${additionalInfo.managerName}</b> отвечает:\n\n${additionalInfo.text || ""}`;
  }

  return sendTelegramMessage(botToken, chatId, text);
}

/**
 * Экранировать HTML теги в сообщении пользователя
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
