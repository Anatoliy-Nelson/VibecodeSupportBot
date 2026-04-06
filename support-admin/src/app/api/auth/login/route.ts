import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    // Дефолтный супер-админ (если таблица пуста)
    const defaultHash = await bcrypt.hash("admin123", 10);
    user = {
      id: "00000000-0000-0000-0000-000000000000",
      email: "admin@supportbot.ru",
      password_hash: defaultHash,
      role: "super_admin",
      full_name: "Супер Админ",
    };
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

  response.cookies.set("auth_token", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  // role и full_name — без httpOnly, чтобы читались из JS
  response.cookies.set("user_role", user.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("user_full_name", user.full_name || "", {
    httpOnly: false,
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
