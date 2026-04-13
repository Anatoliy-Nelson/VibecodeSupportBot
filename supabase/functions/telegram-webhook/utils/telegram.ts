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
