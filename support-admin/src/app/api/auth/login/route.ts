import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// По умолчанию для первого входа
const DEFAULT_ADMIN_EMAIL = "admin@supportbot.ru";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const DEFAULT_ADMIN_HASH = "$2a$10$X7qJ9Z8K5Y3W2V1U0T9S8eR7Q6P5O4N3M2L1K0J9I8H7G6F5E4D3C"; // bcrypt("admin123")

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ищем пользователя в БД
  const { data: users, error } = await supabase
    .from("admin_users")
    .select("id, email, password_hash, role, full_name")
    .eq("email", email)
    .limit(1);

  let user: { id: string; email: string; password_hash: string; role: string; full_name: string | null } | null = null;

  if (error || !users || users.length === 0) {
    // Если таблица пустая — проверяем дефолтного админа (для первого входа)
    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      user = {
        id: "00000000-0000-0000-0000-000000000000",
        email: DEFAULT_ADMIN_EMAIL,
        password_hash: DEFAULT_ADMIN_HASH,
        role: "super_admin",
        full_name: "Супер Админ",
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Неверный email или пароль" },
        { status: 401 }
      );
    }
  } else {
    user = users[0];
  }

  // Проверяем пароль
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: "Неверный email или пароль" },
      { status: 401 }
    );
  }

  // Создаём сессию
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
  });

  // Сохраняем роль и id в cookie
  response.cookies.set("auth_token", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("user_role", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
