import { supabase } from "@/lib/supabase";
import MessageGroup from "@/components/MessageGroup";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="rounded-[10px] bg-white p-8 shadow-card dark:bg-gray-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Переменные окружения не настроены
          </h1>
          <p className="mt-2 text-dark-5 dark:text-dark-6">
            Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY
          </p>
        </div>
      </div>
    );
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-[10px] bg-white p-8 shadow-card dark:bg-gray-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Ошибка загрузки</h1>
          <p className="mt-2 text-dark-5 dark:text-dark-6">{error.message}</p>
        </div>
      </div>
    );
  }

  const groupedMessages = messages?.reduce<Record<string, typeof messages>>((acc, msg) => {
    const chatId = String(msg.telegram_chat_id);
    if (!acc[chatId]) acc[chatId] = [];
    acc[chatId].push(msg);
    return acc;
  }, {}) || {};

  const totalMessages = messages?.length || 0;
  const uniqueUsers = Object.keys(groupedMessages).length;

  return (
    <div className="space-y-6">
      {/* Счётчики */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[10px] bg-white p-6 shadow-card dark:bg-gray-dark">
          <p className="text-sm text-dark-5 dark:text-dark-6">Всего сообщений</p>
          <p className="mt-2 text-3xl font-bold text-dark dark:text-white">{totalMessages}</p>
        </div>
        <div className="rounded-[10px] bg-white p-6 shadow-card dark:bg-gray-dark">
          <p className="text-sm text-dark-5 dark:text-dark-6">Пользователей</p>
          <p className="mt-2 text-3xl font-bold text-dark dark:text-white">{uniqueUsers}</p>
        </div>
      </div>

      {/* Таблица сообщений */}
      <div className="rounded-[10px] bg-white shadow-card dark:bg-gray-dark">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-dark dark:text-white">
            Сообщения
          </h2>
        </div>

        <div className="p-6">
          {Object.keys(groupedMessages).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([chatId, userMessages]) => (
                <MessageGroup
                  key={chatId}
                  chatId={chatId}
                  messages={userMessages!}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-dark-5 dark:text-dark-6">
              Сообщений пока нет
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
