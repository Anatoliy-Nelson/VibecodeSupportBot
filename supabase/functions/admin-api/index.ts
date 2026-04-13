/**
 * Admin API - endpoints для админ-панели
 * 
 * Endpoints:
 * POST /admin-api/tickets - создать тикет
 * GET  /admin-api/tickets - список тикетов (с фильтрацией)
 * GET  /admin-api/tickets/:id - детали тикета + conversation
 * POST /admin-api/tickets/:id/assign - назначить менеджера
 * POST /admin-api/tickets/:id/status - обновить статус
 * POST /admin-api/tickets/:id/reply - ответить от имени менеджера
 * GET  /admin-api/users/search - поиск пользователя по username/chat_id
 * GET  /admin-api/users/:id - детали пользователя
 * GET  /admin-api/managers - список менеджеров
 * POST /admin-api/tickets/:id/close - закрыть тикет
 */

import { serve } from "std/http";
import { createClient } from "@supabase/supabase-js";

// ============================================
// Инициализация Supabase
// ============================================
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("DB_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// ============================================
// CORS
// ============================================
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function handleCors() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// ============================================
// Helpers
// ============================================
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

async function parseBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    throw new Error("Invalid JSON body");
  }
}

// ============================================
// ROUTER
// ============================================
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    const supabase = getSupabaseClient();

    // ============================================
    // POST /admin-api/tickets - создать тикет
    // ============================================
    if (method === "POST" && path === "/admin-api/tickets") {
      const body = await parseBody(req);
      const { user_id, manager_id, subject, priority = "medium" } = body;

      if (!user_id) {
        return errorResponse("user_id is required");
      }

      // Проверяем, существует ли пользователь
      const { data: user, error: userError } = await supabase
        .from("telegram_users")
        .select("*")
        .eq("id", user_id)
        .single();

      if (userError || !user) {
        return errorResponse("User not found");
      }

      // Создаём тикет
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .insert({
          user_id,
          manager_id: manager_id || null,
          subject: subject || `Тикет для @${user.telegram_username || user.telegram_first_name}`,
          priority,
          status: manager_id ? "open" : "new",
        })
        .select()
        .single();

      if (ticketError) {
        return errorResponse(ticketError.message);
      }

      // Отправляем уведомление пользователю, если менеджер назначен
      if (manager_id) {
        await notifyUserAboutAssignment(supabase, ticket, user);
      }

      return jsonResponse({ success: true, ticket }, 201);
    }

    // ============================================
    // GET /admin-api/tickets - список тикетов
    // ============================================
    if (method === "GET" && path === "/admin-api/tickets") {
      const status = url.searchParams.get("status");
      const managerId = url.searchParams.get("manager_id");
      const userId = url.searchParams.get("user_id");
      const limit = parseInt(url.searchParams.get("limit") || "50");

      let query = supabase
        .from("tickets")
        .select(`
          *,
          telegram_users (
            id,
            telegram_chat_id,
            telegram_username,
            telegram_first_name
          ),
          managers (
            id,
            admin_user_id,
            is_online
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq("status", status);
      }
      if (managerId) {
        query = query.eq("manager_id", managerId);
      }
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: tickets, error } = await query;

      if (error) {
        return errorResponse(error.message);
      }

      return jsonResponse({ tickets });
    }

    // ============================================
    // GET /admin-api/tickets/:id - детали тикета
    // ============================================
    const ticketDetailMatch = path.match(/^\/admin-api\/tickets\/([^\/]+)$/);
    if (method === "GET" && ticketDetailMatch) {
      const ticketId = ticketDetailMatch[1];

      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          *,
          telegram_users (
            id,
            telegram_chat_id,
            telegram_username,
            telegram_first_name,
            telegram_last_name
          ),
          managers (
            id,
            admin_user_id,
            is_online,
            telegram_chat_id
          )
        `)
        .eq("id", ticketId)
        .single();

      if (ticketError || !ticket) {
        return errorResponse("Ticket not found", 404);
      }

      // Получаем conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (convError) {
        return errorResponse(convError.message);
      }

      return jsonResponse({ ticket, conversation: conversation || [] });
    }

    // ============================================
    // POST /admin-api/tickets/:id/assign - назначить менеджера
    // ============================================
    const assignMatch = path.match(/^\/admin-api\/tickets\/([^\/]+)\/assign$/);
    if (method === "POST" && assignMatch) {
      const ticketId = assignMatch[1];
      const body = await parseBody(req);
      const { manager_id } = body;

      if (!manager_id) {
        return errorResponse("manager_id is required");
      }

      // Проверяем, существует ли менеджер
      const { data: manager, error: managerError } = await supabase
        .from("managers")
        .select("*")
        .eq("id", manager_id)
        .single();

      if (managerError || !manager) {
        return errorResponse("Manager not found");
      }

      // Проверяем нагрузку
      if (manager.current_tickets >= manager.max_tickets) {
        return errorResponse("Manager has reached maximum ticket capacity");
      }

      // Обновляем тикет
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .update({
          manager_id,
          status: "open",
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)
        .select(`
          *,
          telegram_users (
            id,
            telegram_chat_id,
            telegram_username,
            telegram_first_name
          )
        `)
        .single();

      if (ticketError) {
        return errorResponse(ticketError.message);
      }

      // Уведомляем пользователя
      await notifyUserAboutAssignment(supabase, ticket, ticket.telegram_users);

      return jsonResponse({ success: true, ticket });
    }

    // ============================================
    // POST /admin-api/tickets/:id/status - обновить статус
    // ============================================
    const statusMatch = path.match(/^\/admin-api\/tickets\/([^\/]+)\/status$/);
    if (method === "POST" && statusMatch) {
      const ticketId = statusMatch[1];
      const body = await parseBody(req);
      const { status } = body;

      if (!status || !["new", "open", "pending", "closed"].includes(status)) {
        return errorResponse("Invalid status. Must be: new, open, pending, closed");
      }

      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "closed") {
        updates.closed_at = new Date().toISOString();
      }

      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .update(updates)
        .eq("id", ticketId)
        .select(`
          *,
          telegram_users (
            id,
            telegram_chat_id,
            telegram_username,
            telegram_first_name
          )
        `)
        .single();

      if (ticketError) {
        return errorResponse(ticketError.message);
      }

      // Если закрыли → уведомляем пользователя
      if (status === "closed") {
        await notifyUserAboutClosure(supabase, ticket);
      }

      return jsonResponse({ success: true, ticket });
    }

    // ============================================
    // POST /admin-api/tickets/:id/reply - ответить от менеджера
    // ============================================
    const replyMatch = path.match(/^\/admin-api\/tickets\/([^\/]+)\/reply$/);
    if (method === "POST" && replyMatch) {
      const ticketId = replyMatch[1];
      const body = await parseBody(req);
      const { text, manager_id } = body;

      if (!text) {
        return errorResponse("text is required");
      }

      // Проверяем тикет
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (ticketError || !ticket) {
        return errorResponse("Ticket not found", 404);
      }

      if (ticket.status === "closed") {
        return errorResponse("Cannot reply to closed ticket");
      }

      // Добавляем сообщение в conversation
      const { error: convError } = await supabase
        .from("conversations")
        .insert({
          ticket_id: ticketId,
          sender_type: "manager",
          sender_id: manager_id || null,
          text,
        });

      if (convError) {
        return errorResponse(convError.message);
      }

      // Отправляем сообщение пользователю через Telegram
      await sendToUserViaBot(ticket.user_id, text, ticketId);

      return jsonResponse({ success: true });
    }

    // ============================================
    // GET /admin-api/users/search - поиск пользователя
    // ============================================
    if (method === "GET" && path === "/admin-api/users/search") {
      const query = url.searchParams.get("q");
      const chatId = url.searchParams.get("chat_id");

      if (!query && !chatId) {
        return errorResponse("Provide 'q' (username) or 'chat_id' parameter");
      }

      let users;

      if (chatId) {
        // Поиск по chat_id
        const { data, error } = await supabase
          .from("telegram_users")
          .select("*")
          .eq("telegram_chat_id", parseInt(chatId))
          .limit(10);

        if (error) {
          return errorResponse(error.message);
        }
        users = data;
      } else {
        // Поиск по username или имени
        const { data, error } = await supabase
          .from("telegram_users")
          .select("*")
          .or(
            `telegram_username.ilike.%${query}%,telegram_first_name.ilike.%${query}%,telegram_last_name.ilike.%${query}%`
          )
          .limit(20);

        if (error) {
          return errorResponse(error.message);
        }
        users = data;
      }

      return jsonResponse({ users });
    }

    // ============================================
    // GET /admin-api/users/:id - детали пользователя
    // ============================================
    const userDetailMatch = path.match(/^\/admin-api\/users\/([^\/]+)$/);
    if (method === "GET" && userDetailMatch) {
      const userId = userDetailMatch[1];

      const { data: user, error: userError } = await supabase
        .from("telegram_users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return errorResponse("User not found", 404);
      }

      // Получаем тикеты пользователя
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (ticketsError) {
        return errorResponse(ticketsError.message);
      }

      return jsonResponse({ user, tickets: tickets || [] });
    }

    // ============================================
    // GET /admin-api/managers - список менеджеров
    // ============================================
    if (method === "GET" && path === "/admin-api/managers") {
      const { data: managers, error } = await supabase
        .from("managers")
        .select(`
          *,
          admin_users (
            id,
            email,
            full_name,
            role
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        return errorResponse(error.message);
      }

      return jsonResponse({ managers });
    }

    // ============================================
    // POST /admin-api/managers - создать менеджера
    // ============================================
    if (method === "POST" && path === "/admin-api/managers") {
      const body = await parseBody(req);
      const { admin_user_id, telegram_chat_id, max_tickets = 10 } = body;

      if (!admin_user_id) {
        return errorResponse("admin_user_id is required");
      }

      // Проверяем, существует ли admin_user
      const { data: adminUser, error: adminUserError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", admin_user_id)
        .single();

      if (adminUserError || !adminUser) {
        return errorResponse("Admin user not found");
      }

      // Создаём менеджера
      const { data: manager, error: managerError } = await supabase
        .from("managers")
        .insert({
          admin_user_id,
          telegram_chat_id: telegram_chat_id || null,
          max_tickets,
        })
        .select()
        .single();

      if (managerError) {
        return errorResponse(managerError.message);
      }

      return jsonResponse({ success: true, manager }, 201);
    }

    // ============================================
    // GET /admin-api/stats - статистика
    // ============================================
    if (method === "GET" && path === "/admin-api/stats") {
      const { data: stats, error } = await supabase
        .from("ticket_statistics")
        .select("*");

      if (error) {
        return errorResponse(error.message);
      }

      // Общая статистика
      const { data: totalStats, error: totalError } = await supabase
        .from("tickets")
        .select("status")
        .then((res) => {
          if (res.error) return { data: null, error: res.error };
          const counts = {
            total: res.data.length,
            new: res.data.filter((t) => t.status === "new").length,
            open: res.data.filter((t) => t.status === "open").length,
            pending: res.data.filter((t) => t.status === "pending").length,
            closed: res.data.filter((t) => t.status === "closed").length,
          };
          return { data: counts, error: null };
        });

      if (totalError) {
        return errorResponse(totalError.message);
      }

      return jsonResponse({
        managers: stats || [],
        totals: totalStats,
      });
    }

    // ============================================
    // 404 - Not Found
    // ============================================
    return errorResponse("Endpoint not found", 404);

  } catch (error) {
    console.error("Admin API Error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Отправить сообщение пользователю через Telegram Bot
 */
async function sendToUserViaBot(
  userId: string,
  text: string,
  ticketId: string,
) {
  try {
    const supabase = getSupabaseClient();
    const botToken = Deno.env.get("BOT_TOKEN");

    if (!botToken) {
      console.error("BOT_TOKEN not configured");
      return;
    }

    // Получаем chat_id пользователя
    const { data: user, error } = await supabase
      .from("telegram_users")
      .select("telegram_chat_id")
      .eq("id", userId)
      .single();

    if (error || !user) {
      console.error("User not found:", error);
      return;
    }

    // Отправляем сообщение
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user.telegram_chat_id,
        text: `💬 <b>Ответ менеджера:</b>\n\n${escapeHtml(text)}`,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      console.error("Failed to send message to user:", response.status);
    }
  } catch (error) {
    console.error("Error sending message to user:", error);
  }
}

/**
 * Уведомить пользователя о назначении менеджера
 */
async function notifyUserAboutAssignment(
  supabase: any,
  ticket: any,
  user: any,
) {
  try {
    const botToken = Deno.env.get("BOT_TOKEN");
    if (!botToken || !user?.telegram_chat_id) return;

    // Получаем имя менеджера
    let managerName = "Менеджер";
    if (ticket.manager_id) {
      const { data: manager } = await supabase
        .from("managers")
        .select(`admin_users (full_name, email)`)
        .eq("id", ticket.manager_id)
        .single();

      if (manager?.admin_users?.full_name) {
        managerName = manager.admin_users.full_name;
      }
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user.telegram_chat_id,
        text: `👋 <b>Менеджер назначен!</b>\n\n` +
          `Ваш вопрос курирует: <b>${escapeHtml(managerName)}</b>\n` +
          `Тикет: <code>#${ticket.id.slice(0, 8)}</code>`,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Error notifying user:", error);
  }
}

/**
 * Уведомить пользователя о закрытии тикета
 */
async function notifyUserAboutClosure(supabase: any, ticket: any) {
  try {
    const botToken = Deno.env.get("BOT_TOKEN");
    if (!botToken) return;

    const { data: user } = await supabase
      .from("telegram_users")
      .select("telegram_chat_id")
      .eq("id", ticket.user_id)
      .single();

    if (!user?.telegram_chat_id) return;

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user.telegram_chat_id,
        text: `🔒 <b>Тикет закрыт</b>\n\n` +
          `Ваш тикет <code>#${ticket.id.slice(0, 8)}</code> был закрыт.\n` +
          `Если нужна ещё помощь — напишите снова!`,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Error notifying user about closure:", error);
  }
}

/**
 * Экранировать HTML
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
