import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { status: 405 });
  }

  const { message } = await req.json();
  if (!message?.text) {
    return new NextResponse('OK', { status: 200 });
  }

  console.log(`Получено сообщение от ${message.from.first_name}: ${message.text}`);

  // 1. Создаём клиент Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 2. Сохраняем сообщение в БД
  const { error } = await supabase.from('messages').insert({
    telegram_chat_id: message.chat.id,
    username: message.from.first_name || 'Unknown',
    text: message.text,
  });

  if (error) {
    console.error('Ошибка записи в БД:', error.message);
  } else {
    console.log('Сообщение сохранено в БД');
  }

  // 3. Отправляем эхо-ответ пользователю
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: `🤖 Вы написали: ${message.text}`,
    }),
  });

  console.log(`Эхо-ответ отправлен в чат ${message.chat.id}`);

  return new NextResponse('OK', { status: 200 });
}
