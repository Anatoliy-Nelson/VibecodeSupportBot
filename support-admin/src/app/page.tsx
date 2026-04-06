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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          SupportBot — Сообщения
        </h1>

        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">
                    {msg.username}
                  </span>
                  <time className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleString("ru-RU")}
                  </time>
                </div>
                <p className="text-gray-700 mb-2">{msg.text}</p>
                <span className="text-xs text-gray-400 font-mono">
                  chat_id: {msg.telegram_chat_id}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Сообщений пока нет</p>
        )}
      </div>
    </div>
  );
}
