"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";

// Types
interface Ticket {
  id: string;
  user_id: string;
  manager_id: string | null;
  status: "new" | "open" | "pending" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  subject: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  telegram_users: {
    id: string;
    telegram_chat_id: number;
    telegram_username: string | null;
    telegram_first_name: string;
  } | null;
  managers: {
    id: string;
    admin_user_id: string;
    is_online: boolean;
  } | null;
}

interface Manager {
  id: string;
  admin_user_id: string;
  telegram_chat_id: number | null;
  is_online: boolean;
  max_tickets: number;
  current_tickets: number;
  admin_users: {
    email: string;
    full_name: string | null;
    role: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:54321";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Fetch tickets
  const fetchTickets = async (status?: string) => {
    try {
      setLoading(true);
      const url = status && status !== "all"
        ? `${API_URL}/admin-api/tickets?status=${status}`
        : `${API_URL}/admin-api/tickets`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch managers
  const fetchManagers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin-api/managers`);
      const data = await response.json();
      
      if (data.managers) {
        setManagers(data.managers);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  useEffect(() => {
    fetchTickets(statusFilter);
    fetchManagers();
  }, [statusFilter]);

  // Create ticket
  const handleCreateTicket = async (formData: any) => {
    try {
      const response = await fetch(`${API_URL}/admin-api/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        fetchTickets(statusFilter);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  // Assign manager
  const handleAssignManager = async (ticketId: string, managerId: string) => {
    try {
      const response = await fetch(`${API_URL}/admin-api/tickets/${ticketId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manager_id: managerId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowTicketModal(false);
        fetchTickets(statusFilter);
      }
    } catch (error) {
      console.error("Error assigning manager:", error);
    }
  };

  // Update status
  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/admin-api/tickets/${ticketId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchTickets(statusFilter);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Filter tickets by search
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const username = ticket.telegram_users?.telegram_username?.toLowerCase() || "";
    const firstName = ticket.telegram_users?.telegram_first_name?.toLowerCase() || "";
    const subject = ticket.subject?.toLowerCase() || "";
    
    return username.includes(query) || firstName.includes(query) || subject.includes(query);
  });

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "open": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // Status labels (Russian)
  const statusLabels: Record<string, string> = {
    new: "Новый",
    open: "В работе",
    pending: "Ожидание",
    closed: "Закрыт",
  };

  const priorityLabels: Record<string, string> = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    urgent: "Срочный",
  };

  return (
    <>
      <Breadcrumb pageName="Тикеты" />

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Поиск по username или имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="open">В работе</option>
            <option value="pending">Ожидание</option>
            <option value="closed">Закрытые</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Создать тикет
        </button>
      </div>

      {/* Tickets Table */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#1F2A37] text-left">
                <th className="min-w-[220px] px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Пользователь
                </th>
                <th className="min-w-[200px] px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Тема
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Статус
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Приоритет
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Менеджер
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Создан
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-meta-3">
                    Загрузка...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Тикеты не найдены
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-stroke dark:border-strokedark dark:hover:bg-meta-4">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-black dark:text-white">
                          @{ticket.telegram_users?.telegram_username || "no-username"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {ticket.telegram_users?.telegram_first_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-black dark:text-white">{ticket.subject}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {statusLabels[ticket.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {ticket.managers?.admin_user_id ? (
                        <span className="text-sm text-black dark:text-white">
                          Менеджер #{ticket.managers.admin_user_id.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Не назначен</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketModal(true);
                          }}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-black hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                          Подробнее
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTicket}
          managers={managers}
        />
      )}

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
          }}
          onAssign={handleAssignManager}
          onStatusChange={handleUpdateStatus}
          managers={managers}
        />
      )}
    </>
  );
}

// ============================================
// CREATE TICKET MODAL
// ============================================
function CreateTicketModal({ onClose, onSubmit, managers }: any) {
  const [formData, setFormData] = useState({
    user_chat_id: "",
    manager_id: "",
    subject: "",
    priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, find user by chat_id
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:54321"}/admin-api/users/search?chat_id=${formData.user_chat_id}`
      );
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        onSubmit({
          user_id: data.users[0].id,
          manager_id: formData.manager_id || null,
          subject: formData.subject,
          priority: formData.priority,
        });
      } else {
        alert("Пользователь с таким chat_id не найден");
      }
    } catch (error) {
      console.error("Error searching user:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Создать тикет
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Telegram Chat ID *
            </label>
            <input
              type="number"
              value={formData.user_chat_id}
              onChange={(e) => setFormData({ ...formData, user_chat_id: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Тема
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Менеджер
            </label>
            <select
              value={formData.manager_id}
              onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">Без менеджера</option>
              {managers.map((m: Manager) => (
                <option key={m.id} value={m.id}>
                  {m.admin_users.full_name || m.admin_users.email} ({m.current_tickets}/{m.max_tickets})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Приоритет
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочный</option>
            </select>
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

// ============================================
// TICKET DETAIL MODAL
// ============================================
function TicketDetailModal({ ticket, onClose, onAssign, onStatusChange, managers }: any) {
  const [selectedManager, setSelectedManager] = useState(ticket.manager_id || "");
  const [replyText, setReplyText] = useState("");

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:54321"}/admin-api/tickets/${ticket.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: replyText,
            manager_id: ticket.manager_id,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setReplyText("");
        // Refresh conversation (would need additional fetch)
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Тикет #{ticket.id.slice(0, 8)}
        </h3>

        <div className="space-y-4">
          {/* User Info */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
            <h4 className="mb-2 font-medium text-black dark:text-white">Пользователь</h4>
            <p className="text-sm text-black dark:text-white">
              @{ticket.telegram_users?.telegram_username || "no-username"}
            </p>
            <p className="text-sm text-gray-500">
              {ticket.telegram_users?.telegram_first_name} {ticket.telegram_users?.telegram_last_name}
            </p>
            <p className="text-xs text-gray-400">Chat ID: {ticket.telegram_users?.telegram_chat_id}</p>
          </div>

          {/* Assign Manager */}
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Назначить менеджера
            </label>
            <div className="flex gap-2">
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="flex-1 rounded-lg border border-stroke bg-white px-4 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
              >
                <option value="">Не назначен</option>
                {managers.map((m: Manager) => (
                  <option key={m.id} value={m.id}>
                    {m.admin_users.full_name || m.admin_users.email} ({m.current_tickets}/{m.max_tickets})
                  </option>
                ))}
              </select>
              <button
                onClick={() => onAssign(ticket.id, selectedManager)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Назначить
              </button>
            </div>
          </div>

          {/* Status Actions */}
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Статус
            </label>
            <div className="flex gap-2">
              {ticket.status !== "open" && (
                <button
                  onClick={() => onStatusChange(ticket.id, "open")}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                >
                  В работу
                </button>
              )}
              {ticket.status !== "pending" && (
                <button
                  onClick={() => onStatusChange(ticket.id, "pending")}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                >
                  Ожидание
                </button>
              )}
              {ticket.status !== "closed" && (
                <button
                  onClick={() => onStatusChange(ticket.id, "closed")}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Закрыть
                </button>
              )}
            </div>
          </div>

          {/* Reply Box */}
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Ответить
            </label>
              <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
              placeholder="Введите ответ менеджеру..."
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Отправить ответ
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
