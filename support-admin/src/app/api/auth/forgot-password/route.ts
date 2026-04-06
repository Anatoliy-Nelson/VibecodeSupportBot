import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { email } = await req.json();

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ищем пользователя
  const { data: users } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("email", email)
    .limit(1);

  // Всегда возвращаем success (security: не раскрываем существование email)
  if (!users || users.length === 0) {
    return NextResponse.json({ success: true });
  }

  const user = users[0];
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 мин

  // Сохраняем токен
  await supabase.from("password_reset_tokens").insert({
    user_id: user.id,
    token,
    expires_at: expiresAt,
  });

  // В production тут была бы отправка email
  // В dev-режиме возвращаем токен в ответе
  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json({
    success: true,
    ...(isDev && { resetToken: token }),
  });
}
