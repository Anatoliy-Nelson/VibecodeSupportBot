import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // Начало OAuth — редирект на Google
  if (url.pathname === "/api/auth/google") {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId!);
    googleAuthUrl.searchParams.set("redirect_uri", `${appUrl}/api/auth/google/callback`);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Callback от Google
  if (url.pathname === "/api/auth/google/callback") {
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=NoCode", url));
    }

    // Обмениваем code на access_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=GoogleAuth", url));
    }

    // Получаем данные пользователя
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();

    if (!userData.email) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=NoEmail", url));
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Проверяем, существует ли пользователь
    const { data: existingUsers } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", userData.email)
      .limit(1);

    let user: any;

    if (existingUsers && existingUsers.length > 0) {
      // Пользователь уже есть
      user = existingUsers[0];
    } else {
      // Создаём нового менеджера
      const randomPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const { data: newUser, error } = await supabase
        .from("admin_users")
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          role: "manager",
          full_name: userData.name || userData.email.split("@")[0],
        })
        .select()
        .single();

      if (error) {
        return NextResponse.redirect(new URL("/auth/sign-in?error=CreateFailed", url));
      }
      user = newUser;
    }

    // Устанавливаем cookie авторизации
    const response = NextResponse.redirect(new URL("/dashboard/messages", url));

    response.cookies.set("auth_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

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

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
