import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { email, password, full_name, role = "manager" } = await req.json();

  if (!email || !password || !full_name) {
    return NextResponse.json(
      { success: false, error: "Все поля обязательны" },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Хешируем пароль
  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from("admin_users")
    .insert({
      email,
      password_hash: passwordHash,
      role,
      full_name,
    });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, error: "Email уже используется" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
