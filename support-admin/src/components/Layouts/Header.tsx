"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const r = getCookie("user_role");
    if (r) setRole(r);
    const name = getCookie("user_full_name");
    if (name) setFullName(name);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/sign-in";
  };

  const roleLabel = role === "super_admin" ? "Супер-админ" : "Менеджер";
  const initials = fullName ? fullName.charAt(0).toUpperCase() : "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-3 bg-white px-6 dark:border-gray-6 dark:bg-dark-2">
      <h1 className="text-lg font-semibold text-gray-7 dark:text-white">
        Админ-панель
      </h1>

      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-3 text-gray-5 hover:bg-gray-1 dark:border-gray-6 dark:text-gray-4 dark:hover:bg-dark-3"
            aria-label="Переключить тему"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        )}

        {/* Роль */}
        {role && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            role === "super_admin"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          }`}>
            {roleLabel}
          </span>
        )}

        {/* Аватар */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
          {initials}
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-5 hover:text-red dark:text-gray-4 dark:hover:text-red"
        >
          Выйти
        </button>
      </div>
    </header>
  );
}
