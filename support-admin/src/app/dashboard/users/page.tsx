import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type UserStats = {
  telegram_chat_id: number;
  username: string;
  message_count: number;
  last_active: string;
};

export default async function UsersPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="rounded-[10px] bg-white p-8 shadow-card dark:bg-dark-2">
        <p className="text-center text-red">Переменные окружения не настроены</p>
      </div>
    );
  }

  // Получаем все сообщения и группируем по пользователям
  const { data: messages, error } = await supabase
    .from("messages")
    .select("telegram_chat_id, username, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-[10px] bg-white p-8 shadow-card dark:bg-dark-2">
        <p className="text-center text-red">Ошибка загрузки: {error.message}</p>
      </div>
    );
  }

  // Группируем по telegram_chat_id
  const userMap = new Map<number, UserStats>();

  messages?.forEach((msg) => {
    const chatId = msg.telegram_chat_id;
    const existing = userMap.get(chatId);

    if (!existing) {
      userMap.set(chatId, {
        telegram_chat_id: chatId,
        username: msg.username,
        message_count: 1,
        last_active: msg.created_at,
      });
    } else {
      existing.message_count += 1;
      // last_active уже самый свежий, т.к. сортировка descending
    }
  });

  const users = Array.from(userMap.values()).sort(
    (a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[10px] bg-white shadow-card dark:bg-dark-2">
        <div className="border-b border-gray-3 px-6 py-4 dark:border-gray-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-7 dark:text-white">
              Пользователи
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              {users.length} чел.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {users.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-3 dark:border-gray-6">
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Chat ID
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Сообщений
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Последняя активность
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3 dark:divide-gray-6">
                {users.map((user) => (
                  <tr
                    key={user.telegram_chat_id}
                    className="hover:bg-gray-1 dark:hover:bg-dark-3"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-7 dark:text-white">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-gray-1 px-2 py-1 text-sm text-gray-6 dark:bg-dark-3 dark:text-gray-4">
                        {user.telegram_chat_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-gray-7 dark:text-white">
                      {user.message_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-5 dark:text-gray-4">
                      {new Date(user.last_active).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-12 text-center text-gray-5 dark:text-gray-4">
              Пользователей пока нет
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
