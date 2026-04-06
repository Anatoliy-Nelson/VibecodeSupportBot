import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function getAdminUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, role, full_name, created_at")
    .order("created_at", { ascending: false });

  return { data, error };
}

export default async function ManagersPage() {
  const { data: users, error } = await getAdminUsers();

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-7 dark:text-white">
          Управление менеджерами
        </h1>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
          + Добавить менеджера
        </button>
      </div>

      {/* Таблица */}
      <div className="rounded-[10px] bg-white shadow-card dark:bg-dark-2">
        <div className="overflow-x-auto">
          {users && users.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-3 dark:border-gray-6">
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Менеджер
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Email
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Создан
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3 dark:divide-gray-6">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-1 dark:hover:bg-dark-3"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-7 dark:text-white">
                          {user.full_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-6 dark:text-gray-4">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === "super_admin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {user.role === "super_admin" ? "Супер-админ" : "Менеджер"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-5 dark:text-gray-4">
                      {new Date(user.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-gray-5 hover:text-red dark:text-gray-4 dark:hover:text-red">
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-12 text-center text-gray-5 dark:text-gray-4">
              {error ? `Ошибка: ${error.message}` : "Менеджеров пока нет"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
