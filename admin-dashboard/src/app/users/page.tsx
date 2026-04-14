"use client";

import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

interface User {
  id: string;
  telegram_chat_id: number;
  telegram_username: string | null;
  telegram_first_name: string;
  telegram_last_name: string | null;
  assigned_manager_id: string | null;
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:54321";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatIdSearch, setChatIdSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For dropdown
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownUsers, setDropdownUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all users for dropdown
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin-api/users?limit=200`);
      const data = await response.json();

      if (data.users) {
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Filter dropdown users based on input
  useEffect(() => {
    if (!searchQuery && !chatIdSearch) {
      setDropdownUsers(allUsers.slice(0, 20));
    } else {
      const query = (searchQuery || chatIdSearch).toString().toLowerCase();
      setDropdownUsers(
        allUsers
          .filter((u) =>
            u.telegram_username?.toLowerCase().includes(query) ||
            u.telegram_first_name.toLowerCase().includes(query) ||
            u.telegram_last_name?.toLowerCase().includes(query) ||
            u.telegram_chat_id.toString().includes(query)
          )
          .slice(0, 20)
      );
    }
    setSelectedIndex(-1);
  }, [searchQuery, chatIdSearch, allUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || dropdownUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, dropdownUsers.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectUser(dropdownUsers[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const selectUser = (user: User) => {
    setSearchQuery(user.telegram_username || user.telegram_first_name);
    setChatIdSearch(user.telegram_chat_id.toString());
    setShowDropdown(false);
    handleChatIdSearch(new Event("submit") as any);
  };

  // Search users by username
  const searchUsers = async (query: string) => {
    if (!query && !chatIdSearch) return;
    
    try {
      setLoading(true);
      
      const url = chatIdSearch
        ? `${API_URL}/admin-api/users/search?chat_id=${chatIdSearch}`
        : `${API_URL}/admin-api/users/search?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchQuery);
  };

  const handleChatIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(chatIdSearch);
  };

  return (
    <>
      <Breadcrumb pageName="Пользователи" />

      {/* Search Forms */}
      <div className="mb-6 relative z-50">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск по username, имени или Chat ID..."
            value={searchQuery || chatIdSearch}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setChatIdSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (dropdownUsers.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-stroke bg-white dark:bg-meta-4 px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary dark:border-strokedark"
          />
          <button
            onClick={() => {
              if (chatIdSearch || searchQuery) {
                searchUsers(searchQuery);
                setShowDropdown(false);
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-4 py-1 text-sm font-medium text-white hover:bg-primary/90"
          >
            Поиск
          </button>

          {/* Dropdown */}
          {showDropdown && dropdownUsers.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark"
              style={{ minHeight: "120px" }}
            >
              {dropdownUsers.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => selectUser(user)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    index === selectedIndex
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "hover:bg-gray-50 dark:hover:bg-meta-4"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        @{user.telegram_username || user.telegram_first_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.telegram_first_name} {user.telegram_last_name}
                      </p>
                    </div>
                    <code className="rounded bg-gray-100 dark:bg-meta-4 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                      {user.telegram_chat_id}
                    </code>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#1F2A37] text-left">
                <th className="min-w-[200px] px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Username
                </th>
                <th className="min-w-[150px] px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Имя
                </th>
                <th className="min-w-[150px] px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Chat ID
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Менеджер
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Регистрация
                </th>
                <th className="px-4 py-4 font-semibold text-gray-700 dark:text-white">
                  Действия
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Пользователи не найдены. Введите username или Chat ID для поиска.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-stroke dark:border-strokedark dark:hover:bg-meta-4">
                    <td className="px-4 py-4">
                      <p className="font-medium text-black dark:text-white">
                        @{user.telegram_username || "no-username"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-black dark:text-white">
                        {user.telegram_first_name} {user.telegram_last_name}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-meta-4">
                        {user.telegram_chat_id}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      {user.assigned_manager_id ? (
                        <span className="text-sm text-black dark:text-white">
                          #{user.assigned_manager_id.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Не назначен</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-black hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
}

// ============================================
// USER DETAIL MODAL
// ============================================
function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:54321"}/admin-api/tickets?user_id=${user.id}`
        );
        const data = await response.json();
        
        if (data.tickets) {
          setUserTickets(data.tickets);
        }
      } catch (error) {
        console.error("Error fetching user tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user.id]);

  const statusLabels: Record<string, string> = {
    new: "Новый",
    open: "В работе",
    pending: "Ожидание",
    closed: "Закрыт",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "open": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Профиль пользователя
        </h3>

        {/* User Info */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-black dark:text-white">
                @{user.telegram_username || "no-username"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Имя</p>
              <p className="font-medium text-black dark:text-white">
                {user.telegram_first_name} {user.telegram_last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Chat ID</p>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-meta-4">
                {user.telegram_chat_id}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Менеджер</p>
              <p className="font-medium text-black dark:text-white">
                {user.assigned_manager_id ? `#${user.assigned_manager_id.slice(0, 8)}` : "Не назначен"}
              </p>
            </div>
          </div>
        </div>

        {/* User Tickets */}
        <div>
          <h4 className="mb-3 font-medium text-black dark:text-white">
            Тикеты пользователя ({userTickets.length})
          </h4>

          {loading ? (
            <p className="text-center text-meta-3">Загрузка...</p>
          ) : userTickets.length === 0 ? (
            <p className="text-center text-gray-500">Тикетов нет</p>
          ) : (
            <div className="space-y-2">
              {userTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg border border-stroke p-3 dark:border-strokedark"
                >
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {ticket.subject}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
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
