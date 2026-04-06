import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { success: false, error: "Токен и пароль обязательны" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { success: false, error: "Пароль минимум 6 символов" },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ищем токен
  const { data: tokens } = await supabase
    .from("password_reset_tokens")
    .select("user_id, expires_at, used_at")
    .eq("token", token)
    .limit(1);

  if (!tokens || tokens.length === 0) {
    return NextResponse.json(
      { success: false, error: "Неверный или истёкший код" },
      { status: 400 }
    );
  }

  const tokenRecord = tokens[0];

  // Проверяем не использован ли
  if (tokenRecord.used_at) {
    return NextResponse.json(
      { success: false, error: "Код уже использован" },
      { status: 400 }
    );
  }

  // Проверяем срок действия
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return NextResponse.json(
      { success: false, error: "Срок действия кода истёк" },
      { status: 400 }
    );
  }

  // Хешируем новый пароль
  const passwordHash = await bcrypt.hash(password, 10);

  // Обновляем пароль
  const { error: updateError } = await supabase
    .from("admin_users")
    .update({ password_hash: passwordHash })
    .eq("id", tokenRecord.user_id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: "Ошибка обновления" },
      { status: 500 }
    );
  }

  // Помечаем токен как использованный
  await supabase
    .from("password_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token);

  return NextResponse.json({ success: true });
}
