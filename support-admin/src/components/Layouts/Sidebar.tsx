"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

const navItems = [
  {
    label: "Сообщения",
    href: "/dashboard/messages",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V4z" />
      </svg>
    ),
  },
  {
    label: "Пользователи",
    href: "/dashboard/users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
      </svg>
    ),
  },
];

const superAdminItems = [
  {
    label: "Менеджеры",
    href: "/dashboard/managers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const r = getCookie("user_role");
    if (r) setRole(r);
  }, []);

  const allItems = role === "super_admin" ? [...navItems, ...superAdminItems] : navItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-3 bg-white dark:border-gray-6 dark:bg-dark-2">
      {/* Лого */}
      <div className="flex h-16 items-center border-b border-gray-3 px-6 dark:border-gray-6">
        <Link href="/dashboard" className="text-lg font-bold text-gray-7 dark:text-white">
          SupportBot
        </Link>
      </div>

      {/* Навигация */}
      <nav className="space-y-1 p-4">
        {allItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-gray-5 hover:bg-gray-1 hover:text-gray-7 dark:text-gray-4 dark:hover:bg-dark-3 dark:hover:text-white",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
