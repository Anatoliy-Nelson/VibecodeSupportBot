import { supabase } from "@/lib/supabase";

export default async function MessagesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Переменные окружения не настроены
          </h1>
          <p className="text-gray-600">
            Добавьте в Vercel Dashboard:
          </p>
          <ul className="text-left mt-4 text-sm text-gray-500 space-y-2">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          </ul>
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
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Ошибка загрузки</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Группировка по chat_id
  const groupedMessages = messages?.reduce<Record<string, typeof messages>>((acc, msg) => {
    const chatId = String(msg.telegram_chat_id);
    if (!acc[chatId]) acc[chatId] = [];
    acc[chatId].push(msg);
    return acc;
  }, {}) || {};

  // Счётчики
  const totalMessages = messages?.length || 0;
  const uniqueUsers = Object.keys(groupedMessages).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          SupportBot — Сообщения
        </h1>

        {/* Счётчики */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500">Всего сообщений</p>
            <p className="text-3xl font-bold text-gray-900">{totalMessages}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500">Уникальных пользователей</p>
            <p className="text-3xl font-bold text-gray-900">{uniqueUsers}</p>
          </div>
        </div>

        {Object.keys(groupedMessages).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([chatId, userMessages]) => (
              <div key={chatId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Заголовок группы */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {userMessages![0]?.username}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      chat_id: {chatId}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {userMessages!.length} сообщ.
                  </span>
                </div>

                {/* Сообщения пользователя */}
                <div className="divide-y divide-gray-100">
                  {userMessages?.map((msg) => (
                    <div key={msg.id} className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <time className="text-xs text-gray-400">
                          {new Date(msg.created_at).toLocaleString("ru-RU")}
                        </time>
                      </div>
                      <p className="text-gray-700">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Сообщений пока нет</p>
        )}
      </div>
    </div>
  );
}
