"use client";

import { useState } from "react";

type Message = {
  id: string;
  username: string;
  text: string;
  created_at: string;
  telegram_chat_id: number;
};

export default function MessageGroup({
  chatId,
  messages,
}: {
  chatId: string;
  messages: Message[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Заголовок группы — кликабельный */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">
            {isOpen ? "▼" : "▶"}
          </span>
          <span className="font-semibold text-gray-900">
            {messages[0]?.username}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            chat_id: {chatId}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {messages.length} сообщ.
        </span>
      </button>

      {/* Сообщения пользователя (разворачиваются) */}
      {isOpen && (
        <div className="divide-y divide-gray-100">
          {messages.map((msg) => (
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
      )}
    </div>
  );
}
