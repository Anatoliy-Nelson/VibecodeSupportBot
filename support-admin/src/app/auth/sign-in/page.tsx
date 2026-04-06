"use client";

import Signin from "@/components/Auth/Signin";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SignIn() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-2 p-4 dark:bg-dark">
      {/* Кнопка переключения темы */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed right-6 top-6 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-3 bg-white text-gray-6 shadow-sm hover:bg-gray-1 dark:border-gray-6 dark:bg-dark-2 dark:text-gray-4 dark:hover:bg-dark-3"
          aria-label="Переключить тему"
        >
          {theme === "dark" ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      )}

      <div className="w-full max-w-[450px] rounded-[10px] bg-white shadow-card dark:bg-dark-2">
        <div className="w-full p-8 sm:p-12.5">
          {/* Лого */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-7 dark:text-white">
              SupportBot
            </h1>
            <p className="mt-2 text-sm text-gray-5 dark:text-gray-4">
              Войдите в админ-панель
            </p>
          </div>

          <Signin />
        </div>
      </div>
    </div>
  );
}
