"use client";

import { PasswordIcon } from "@/assets/icons";
import { useState } from "react";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const json = await res.json();

    if (json.success) {
      setSuccess(true);
    } else {
      setError(json.error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-2 p-4 dark:bg-dark">
        <a href="/auth/sign-in" className="fixed left-6 top-6 text-sm text-gray-5 hover:text-gray-7 dark:text-gray-4 dark:hover:text-white">
          ← Назад к входу
        </a>

        <div className="w-full max-w-[450px] rounded-[10px] bg-white p-8 shadow-card dark:bg-dark-2">
          <div className="text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="text-2xl font-bold text-gray-7 dark:text-white">
              Пароль обновлён
            </h1>
            <p className="mt-2 text-sm text-gray-5 dark:text-gray-4">
              Теперь вы можете войти с новым паролем
            </p>
            <a
              href="/auth/sign-in"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Перейти ко входу
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

      <div className="w-full max-w-[450px] rounded-[10px] bg-white shadow-card dark:bg-dark-2">
        <div className="w-full p-8 sm:p-12.5">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-7 dark:text-white">
              Новый пароль
            </h1>
            <p className="mt-2 text-sm text-gray-5 dark:text-gray-4">
              Введите код и новый пароль
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-6 dark:text-gray-4">
                Код сброса
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-lg border border-gray-3 bg-white px-4 py-3 font-mono text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                placeholder="Вставьте код из письма"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-6 dark:text-gray-4">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-3 bg-white px-10 py-3 text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                  placeholder="Минимум 6 символов"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-4">
                  <PasswordIcon />
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-6 dark:text-gray-4">
                Повторите пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-3 bg-white px-10 py-3 text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                  placeholder="Повторите пароль"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-4">
                  <PasswordIcon />
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-light-3 bg-red-light-5 px-4 py-3 text-sm text-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-primary py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Обновление..." : "Обновить пароль"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
