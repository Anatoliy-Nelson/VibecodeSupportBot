import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);
  // 1. Получаем данные от Telegram
  const contentType = req.headers.get("content-type") || "";
  let data;
  
  if (contentType.includes("application/json")) {
    const text = await req.text();
    data = text ? JSON.parse(text) : {};
  } else {
    data = {};
  }
  
  const { message } = data;

  // Если нет текста — игнорируем (фото, стикер и т.д.)
  if (!message?.text) {
    return new Response("OK", { status: 200 });
  }

  console.log(`Получено сообщение от ${message.from.first_name}: ${message.text}`);

  // 2. Отправляем эхо-ответ обратно пользователю
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: `🤖 Вы написали: ${message.text}`,
    }),
  });

  console.log(`Эхо-ответ отправлен в чат ${message.chat.id}`);

  // 3. Возвращаем 200 — Telegram должен знать что мы получили
  return new Response("OK", { status: 200 });
});