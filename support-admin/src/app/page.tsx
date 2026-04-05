import { supabase } from "@/lib/supabase";

export default async function MessagesPage() {
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

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
