"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type Manager = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
};

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "manager" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("admin_users")
      .select("id, email, role, full_name, created_at")
      .order("created_at", { ascending: false });
    if (data) setManagers(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const res = await fetch("/api/admin/managers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (json.success) {
      setShowModal(false);
      setForm({ email: "", password: "", full_name: "", role: "manager" });
      setSuccessMsg("Менеджер создан!");
      loadManagers();
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setFormError(json.error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-7 dark:text-white">
          Управление менеджерами
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          + Добавить менеджера
        </button>
      </div>

      {/* Уведомление */}
      {successMsg && (
        <div className="rounded-lg border border-green bg-green-light-7 px-4 py-3 text-sm text-green-dark">
          ✅ {successMsg}
        </div>
      )}

      {/* Таблица */}
      <div className="rounded-[10px] bg-white shadow-card dark:bg-dark-2">
        <div className="overflow-x-auto">
          {!loading && managers.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-3 dark:border-gray-6">
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Менеджер
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Email
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-5 dark:text-gray-4">
                    Создан
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3 dark:divide-gray-6">
                {managers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-1 dark:hover:bg-dark-3"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-7 dark:text-white">
                          {user.full_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-6 dark:text-gray-4">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === "super_admin"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {user.role === "super_admin" ? "Супер-админ" : "Менеджер"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-5 dark:text-gray-4">
                      {new Date(user.created_at).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-12 text-center text-gray-5 dark:text-gray-4">
              {loading ? "Загрузка..." : "Менеджеров пока нет"}
            </p>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-dark-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-7 dark:text-white">
                Новый менеджер
              </h2>
              <button
                onClick={() => { setShowModal(false); setFormError(""); }}
                className="text-gray-5 hover:text-gray-7 dark:text-gray-4"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-6 dark:text-gray-4">
                  Имя
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-3 bg-white px-3 py-2 text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                  placeholder="Иван Петров"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-6 dark:text-gray-4">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-3 bg-white px-3 py-2 text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                  placeholder="ivan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-6 dark:text-gray-4">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-3 bg-white px-3 py-2 text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-6 dark:text-gray-4">
                  Роль
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-3 bg-white px-3 py-2 text-gray-7 dark:border-gray-6 dark:bg-dark-3 dark:text-white"
                >
                  <option value="manager">Менеджер</option>
                  <option value="super_admin">Супер-админ</option>
                </select>
              </div>

              {formError && (
                <p className="text-sm text-red">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(""); }}
                  className="flex-1 rounded-lg border border-gray-3 px-4 py-2 text-sm font-medium text-gray-6 hover:bg-gray-1 dark:border-gray-6 dark:text-gray-4 dark:hover:bg-dark-3"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
                >
                  {saving ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
