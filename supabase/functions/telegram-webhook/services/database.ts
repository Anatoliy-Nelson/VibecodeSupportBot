/**
 * Сервис работы с базой данных Supabase
 * Расширен для поддержки системы тикетов
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Получить Singleton экземпляр Supabase клиента
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabaseInstance = createClient(supabaseUrl, serviceRoleKey);
    console.log("Supabase клиент инициализирован");
  }

  return supabaseInstance;
}

/**
 * Сохранить сообщение в таблицу messages (старая логика, для обратной совместимости)
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

// ============================================
// НОВЫЕ МЕТОДЫ для системы тикетов
// ============================================

/**
 * Создать или получить пользователя Telegram
 */
export async function upsertTelegramUser(
  telegramChatId: number,
  username: string | undefined,
  firstName: string | undefined,
  lastName: string | undefined,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    // Проверяем, существует ли пользователь
    const { data: existingUser, error: fetchError } = await supabase
      .from("telegram_users")
      .select("*")
      .eq("telegram_chat_id", telegramChatId)
      .single();

    if (existingUser) {
      // Обновляем данные пользователя
      const { data: updatedUser, error: updateError } = await supabase
        .from("telegram_users")
        .update({
          telegram_username: username || existingUser.telegram_username,
          telegram_first_name: firstName || existingUser.telegram_first_name,
          telegram_last_name: lastName || existingUser.telegram_last_name,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, data: updatedUser };
    }

    // Создаём нового пользователя
    const { data: newUser, error: insertError } = await supabase
      .from("telegram_users")
      .insert({
        telegram_chat_id: telegramChatId,
        telegram_username: username,
        telegram_first_name: firstName,
        telegram_last_name: lastName,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, data: newUser };
  } catch (error) {
    console.error("Ошибка upsert пользователя:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Проверить, есть ли открытый тикет у пользователя
 */
export async function getOpenTicket(
  userId: string,
): Promise<{ hasTicket: boolean; ticket?: any }> {
  try {
    const supabase = getSupabaseClient();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["new", "open", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !ticket) {
      return { hasTicket: false };
    }

    return { hasTicket: true, ticket };
  } catch (error) {
    console.error("Ошибка проверки тикета:", error);
    return { hasTicket: false };
  }
}

/**
 * Добавить сообщение в conversation (переписку)
 */
export async function addConversationMessage(
  ticketId: string,
  senderType: "user" | "manager" | "bot",
  senderId: string | null,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("conversations")
      .insert({
        ticket_id: ticketId,
        sender_type: senderType,
        sender_id: senderId,
        text,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Ошибка добавления сообщения:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Получить информацию о тикете и назначенном менеджере
 */
export async function getTicketWithManager(
  ticketId: string,
): Promise<{ ticket?: any; manager?: any }> {
  try {
    const supabase = getSupabaseClient();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        *,
        managers (
          id,
          admin_user_id,
          telegram_chat_id,
          is_online
        )
      `)
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return {};
    }

    return { ticket, manager: ticket.managers };
  } catch (error) {
    console.error("Ошибка получения тикета:", error);
    return {};
  }
}

/**
 * Обновить статус тикета
 */
export async function updateTicketStatus(
  ticketId: string,
  status: "new" | "open" | "pending" | "closed",
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "closed") {
      updates.closed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", ticketId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Ошибка обновления статуса:", error);
    return { success: false, error: String(error) };
  }
}
