"use client";

import { EmailIcon } from "@/assets/icons";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ success: boolean; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const json = await res.json();

    if (json.success) {
      setResult(json);
    } else {
      setError(json.error);
    }
    setLoading(false);
  };

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-2 p-4 dark:bg-dark">
        <a href="/auth/sign-in" className="fixed left-6 top-6 text-sm text-gray-5 hover:text-gray-7 dark:text-gray-4 dark:hover:text-white">
          ← Назад к входу
        </a>

        <div className="w-full max-w-[450px] rounded-[10px] bg-white p-8 shadow-card dark:bg-dark-2">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-7 dark:text-white">
              ✉️ Код отправлен
            </h1>
          </div>

          <p className="mb-4 text-center text-sm text-gray-5 dark:text-gray-4">
            {result.resetToken
              ? "Это токен для сброса пароля (только dev-режим):"
              : "Если аккаунт существует, вы получите письмо со ссылкой для сброса пароля."}
          </p>

          {result.resetToken && (
            <div className="mb-6 rounded-lg border-2 border-dashed border-primary bg-primary/5 p-4 text-center">
              <p className="mb-2 text-xs font-medium text-gray-5 dark:text-gray-4">
                Скопируйте этот код:
              </p>
              <code className="break-all font-mono text-sm text-primary">
                {result.resetToken}
              </code>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {result.resetToken && (
              <a
                href="/auth/reset-password"
                className="w-full text-center rounded-lg bg-primary py-3 font-medium text-white transition hover:bg-opacity-90"
              >
                Перейти к сбросу пароля →
              </a>
            )}
            <a
              href="/auth/sign-in"
              className="w-full text-center rounded-lg border border-gray-3 py-3 text-sm text-gray-6 hover:bg-gray-1 dark:border-gray-6 dark:text-gray-4 dark:hover:bg-dark-3"
            >
              Вернуться ко входу
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-2 p-4 dark:bg-dark">
      <a href="/auth/sign-in" className="fixed left-6 top-6 text-sm text-gray-5 hover:text-gray-7 dark:text-gray-4 dark:hover:text-white">
        ← Назад к входу
      </a>

      <div className="w-full max-w-[450px] rounded-[10px] bg-white p-8 shadow-card dark:bg-dark-2">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-7 dark:text-white">
            Сброс пароля
          </h1>
          <p className="mt-2 text-sm text-gray-5 dark:text-gray-4">
            Введите email, мы отправим код для сброса
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-6 dark:text-gray-4">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-3 bg-white px-10 py-3 text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                placeholder="your@email.com"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-4">
                <EmailIcon />
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-light-3 bg-red-light-5 px-4 py-3 text-sm text-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-primary py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Отправка..." : "Отправить код"}
          </button>
        </form>
      </div>
    </div>
  );
}
