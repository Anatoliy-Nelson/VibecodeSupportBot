import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Только POST запросы от Telegram
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { message } = await req.json();

  // Если нет текста — игнорируем (фото, стикер и т.д.)
  if (!message?.text) {
    return new Response("OK", { status: 200 });
  }

  console.log(
    `Получено сообщение от ${message.from.first_name}: ${message.text}`,
  );

  // Создаём клиент Supabase
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || Deno.env.get("DB_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!
  );

  // Сохраняем сообщение в БД
  const { error } = await supabase.from("messages").insert({
    telegram_chat_id: message.chat.id,
    username: message.from.first_name || "Unknown",
    text: message.text,
  });

  if (error) {
    console.error("Ошибка записи в БД:", error.message);
  } else {
    console.log("Сообщение сохранено в БД");
  }

  // Отправляем эхо-ответ пользователю
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: `🤖 Вы написали: ${message.text}`,
    }),
  });

  console.log(`Эхо-ответ отправлен в чат ${message.chat.id}`);

  return new Response("OK", { status: 200 });
});
