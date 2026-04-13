"use client";

import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:54321";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/admin-api/stats`);
        const data = await response.json();
        
        if (data.totals) {
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-meta-3">Загрузка...</div>
      </div>
    );
  }

  const totals = stats?.totals || {};
  const managers = stats?.managers || [];

  return (
    <>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Support Bot Dashboard
        </h1>
        <p className="text-gray-500">Обзор системы поддержки</p>
      </div>

      {/* Overview Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tickets */}
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Всего тикетов</p>
              <p className="mt-1 text-3xl font-semibold text-black dark:text-white">
                {totals.total || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* New Tickets */}
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Новые</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">
                {totals.new || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">В работе</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">
                {totals.open || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Closed Tickets */}
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Закрытые</p>
              <p className="mt-1 text-3xl font-semibold text-gray-600">
                {totals.closed || 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Stats Table */}
      {managers.length > 0 && (
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Статистика по менеджерам
            </h2>
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-6 py-4 font-medium text-black dark:text-white">
                    Менеджер
                  </th>
                  <th className="px-6 py-4 font-medium text-black dark:text-white">
                    Онлайн
                  </th>
                  <th className="px-6 py-4 font-medium text-black dark:text-white">
                    Новые
                  </th>
                  <th className="px-6 py-4 font-medium text-black dark:text-white">
                    В работе
                  </th>
                  <th className="px-6 py-4 font-medium text-black dark:text-white">
                    Ожидание
                  </th>
                  <th className="px-6 py-4 font-medium text-black dark:text-white">
                    Закрытые
                  </th>
                  <th className="px-6 py-4 font-medium text-black dark:text-white">
                    Нагрузка
                  </th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager: any) => (
                  <tr key={manager.manager_id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-6 py-4">
                      <p className="font-medium text-black dark:text-white">
                        {manager.manager_name || manager.manager_email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        manager.is_online
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${manager.is_online ? "bg-green-500" : "bg-gray-500"}`}></span>
                        {manager.is_online ? "Да" : "Нет"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-black dark:text-white">
                      {manager.new_tickets || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-black dark:text-white">
                      {manager.open_tickets || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-black dark:text-white">
                      {manager.pending_tickets || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-black dark:text-white">
                      {manager.closed_tickets || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-black dark:text-white">
                          {manager.current_tickets} / {manager.max_tickets}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-meta-4">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${(manager.current_tickets / manager.max_tickets) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <a
          href="/tickets"
          className="flex items-center gap-4 rounded-lg border border-stroke bg-white p-6 shadow-default hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-meta-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-black dark:text-white">Управление тикетами</h3>
            <p className="text-sm text-gray-500">Создание, назначение и ответы</p>
          </div>
        </a>

        <a
          href="/users"
          className="flex items-center gap-4 rounded-lg border border-stroke bg-white p-6 shadow-default hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-meta-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-black dark:text-white">Пользователи</h3>
            <p className="text-sm text-gray-500">Поиск и просмотр профилей</p>
          </div>
        </a>

        <a
          href="/managers"
          className="flex items-center gap-4 rounded-lg border border-stroke bg-white p-6 shadow-default hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:hover:bg-meta-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-black dark:text-white">Менеджеры</h3>
            <p className="text-sm text-gray-500">Управление командой</p>
          </div>
        </a>
      </div>
    </>
  );
}
