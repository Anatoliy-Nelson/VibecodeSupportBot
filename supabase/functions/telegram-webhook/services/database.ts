/**
 * Сервис работы с базой данных Supabase
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Получить Singleton экземпляр Supabase клиента
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("DB_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabaseInstance = createClient(supabaseUrl, serviceRoleKey);
    console.log("Supabase клиент инициализирован");
  }

  return supabaseInstance;
}

/**
 * Сохранить сообщение в таблицу messages
 */
export async function saveMessageToDatabase(
  telegramChatId: number,
  username: string | undefined,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("messages").insert({
      telegram_chat_id: telegramChatId,
      username: username || "Unknown",
      text,
    });

    if (error) {
      console.error("Ошибка записи в БД:", error.message);
      return { success: false, error: error.message };
    }

    console.log("Сообщение сохранено в БД");
    return { success: true };
  } catch (error) {
    console.error("Неожиданная ошибка при записи в БД:", error);
    return { success: false, error: String(error) };
  }
}
