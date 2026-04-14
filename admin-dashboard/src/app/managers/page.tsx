"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

interface Manager {
  id: string;
  admin_user_id: string;
  telegram_chat_id: number | null;
  is_online: boolean;
  max_tickets: number;
  current_tickets: number;
  created_at: string;
  updated_at: string;
  admin_users: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  };
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:54321";

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Fetch managers
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin-api/managers`);
      const data = await response.json();
      
      if (data.managers) {
        setManagers(data.managers);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin-api/stats`);
      const data = await response.json();
      
      if (data.totals) {
        setStats(data.totals);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchStats();
  }, []);

  // Create manager
  const handleCreateManager = async (formData: any) => {
    try {
      const response = await fetch(`${API_URL}/admin-api/managers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        fetchManagers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error creating manager:", error);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Менеджеры" />

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Всего тикетов</p>
                <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                  {stats.total || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Новые</p>
                <p className="mt-1 text-2xl font-semibold text-blue-600">
                  {stats.new || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">В работе</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">
                  {stats.open || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Закрытые</p>
                <p className="mt-1 text-2xl font-semibold text-gray-600">
                  {stats.closed || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Добавить менеджера
        </button>
      </div>

      {/* Managers Table */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 dark:bg-dark-2 text-left">
                <th className="min-w-[200px] px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Менеджер
                </th>
                <th className="min-w-[200px] px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Email
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Telegram Chat ID
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Статус
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Нагрузка
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Роль
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-meta-3">
                    Загрузка...
                  </td>
                </tr>
              ) : managers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Менеджеров пока нет. Добавьте первого!
                  </td>
                </tr>
              ) : (
                managers.map((manager) => {
                  const loadPercentage = (manager.current_tickets / manager.max_tickets) * 100;
                  const loadColor = loadPercentage >= 90 ? "bg-red-500" : loadPercentage >= 70 ? "bg-yellow-500" : "bg-green-500";

                  return (
                    <tr key={manager.id} className="border-b border-stroke dark:border-strokedark dark:hover:bg-meta-4">
                      <td className="px-4 py-4">
                        <p className="font-medium text-black dark:text-white">
                          {manager.admin_users.full_name || "Без имени"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-black dark:text-white">{manager.admin_users.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        {manager.telegram_chat_id ? (
                          <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-meta-4">
                            {manager.telegram_chat_id}
                          </code>
                        ) : (
                          <span className="text-sm text-gray-500">Не указан</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          manager.is_online
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${manager.is_online ? "bg-green-500" : "bg-gray-500"}`}></span>
                          {manager.is_online ? "Онлайн" : "Офлайн"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-black dark:text-white">
                              {manager.current_tickets} / {manager.max_tickets}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-meta-4">
                            <div
                              className={`h-2 rounded-full ${loadColor}`}
                              style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {manager.admin_users.role === "super_admin" ? "Супер-админ" : "Менеджер"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Manager Modal */}
      {showCreateModal && (
        <CreateManagerModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateManager}
        />
      )}
    </>
  );
}

// ============================================
// CREATE MANAGER MODAL
// ============================================
function CreateManagerModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    admin_user_id: "",
    telegram_chat_id: "",
    max_tickets: "10",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      admin_user_id: formData.admin_user_id,
      telegram_chat_id: formData.telegram_chat_id ? parseInt(formData.telegram_chat_id) : null,
      max_tickets: parseInt(formData.max_tickets),
    });
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Добавить менеджера
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Admin User ID *
            </label>
            <input
              type="text"
              value={formData.admin_user_id}
              onChange={(e) => setFormData({ ...formData, admin_user_id: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
              placeholder="UUID из таблицы admin_users"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Сначала создайте пользователя в таблице admin_users
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Telegram Chat ID
            </label>
            <input
              type="number"
              value={formData.telegram_chat_id}
              onChange={(e) => setFormData({ ...formData, telegram_chat_id: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
              placeholder="Для уведомлений"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Максимум тикетов
            </label>
            <input
              type="number"
              value={formData.max_tickets}
              onChange={(e) => setFormData({ ...formData, max_tickets: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
              min="1"
              max="100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
