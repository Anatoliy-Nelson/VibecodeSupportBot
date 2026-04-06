import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("auth_token", "", { maxAge: 0 });
  response.cookies.set("user_role", "", { maxAge: 0 });
  response.cookies.set("user_id", "", { maxAge: 0 });
  response.cookies.set("user_full_name", "", { maxAge: 0 });

  return response;
}
