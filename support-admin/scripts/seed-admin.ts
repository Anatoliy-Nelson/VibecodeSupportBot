import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function seedSuperAdmin() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const email = "admin@supportbot.ru";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from("admin_users")
    .insert({
      email,
      password_hash: passwordHash,
      role: "super_admin",
      full_name: "Супер Админ",
    });

  if (error) {
    console.error("Ошибка:", error.message);
  } else {
    console.log("✅ Супер-админ создан!");
    console.log(`Email: ${email}`);
    console.log(`Пароль: ${password}`);
  }
}

seedSuperAdmin();
