/**
 * Обработчик команды /start
 */

import { sendTelegramMessage } from "../utils/telegram.ts";

const WELCOME_MESSAGE = "Здравствуйте! Опишите вашу проблему, и мы поможем.";

/**
 * Проверить, является ли текст командой /start
 */
export function isStartCommand(text: string): boolean {
  return text === "/start";
}

/**
 * Обработать команду /start
 */
export async function handleStartCommand(
  botToken: string,
  chatId: number,
): Promise<boolean> {
  console.log(`Обработка команды /start для чата ${chatId}`);
  return await sendTelegramMessage(botToken, chatId, WELCOME_MESSAGE);
}
