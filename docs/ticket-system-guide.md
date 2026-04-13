# Support Ticket System - Руководство по развёртыванию

## 📋 Что реализовано

### 1. База данных

**Новые таблицы:**
- `telegram_users` — пользователи Telegram
- `tickets` — тикеты поддержки
- `conversations` — переписка менеджер ↔ пользователь
- `managers` — профили менеджеров (расширение `admin_users`)

**View:**
- `ticket_statistics` — сводная статистика по менеджерам

**Триггеры:**
- Автоматический подсчёт тикетов у менеджера
- Обновление `updated_at` при изменении записей

### 2. Telegram Bot (Edge Functions)

**telegram-webhook** (обновлён):
- Создаёт/обновляет пользователя при первом сообщении
- Проверяет наличие открытого тикета
- Отправляет статус-сообщения вместо зеркалирования:
  - ✅ "Сообщение получено"
  - 👋 "Менеджер назначен"
  - 💬 "Ответ менеджера"
  - 🔒 "Тикет закрыт"

**admin-api** (новый):
```
POST   /admin-api/tickets              - создать тикет
GET    /admin-api/tickets              - список тикетов (с фильтрацией)
GET    /admin-api/tickets/:id          - детали тикета + conversation
POST   /admin-api/tickets/:id/assign   - назначить менеджера
POST   /admin-api/tickets/:id/status   - обновить статус
POST   /admin-api/tickets/:id/reply    - ответить от менеджера
GET    /admin-api/users/search         - поиск пользователя
GET    /admin-api/users/:id            - детали пользователя
GET    /admin-api/managers             - список менеджеров
POST   /admin-api/managers             - создать менеджера
GET    /admin-api/stats                - общая статистика
```

### 3. Админ-панель (Next.js)

**Страницы:**
- `/` — Dashboard с общей статистикой
- `/tickets` — управление тикетами (создание, назначение, ответы)
- `/users` — поиск пользователей по username/chat_id
- `/managers` — управление менеджерами и их нагрузкой

---

## 🚀 Развёртывание

### Шаг 1: Применить миграции БД

```bash
# Локально
supabase db push

# Или конкретный файл
supabase migration up
```

### Шаг 2: Настроить Edge Functions

**telegram-webhook** (уже был, обновлён):
```bash
supabase functions deploy telegram-webhook \
  --import-map supabase/functions/telegram-webhook/deno.json \
  --env-file .env
```

**admin-api** (новый):
```bash
supabase functions deploy admin-api \
  --import-map supabase/functions/admin-api/deno.json \
  --env-file .env
```

**Необходимые переменные окружения:**
```env
BOT_TOKEN=your-telegram-bot-token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Шаг 3: Запустить админ-панель

```bash
cd admin-dashboard

# Установить зависимости
npm install

# Скопировать env
cp .env.local.example .env.local

# Запустить dev сервер
npm run dev
```

Открыть: http://localhost:3000

### Шаг 4: Настроить webhook Telegram

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.supabase.co/functions/v1/telegram-webhook"}'
```

---

## 📊 Как это работает

### Пользовательский сценарий

1. **Пользователь пишет боту** → сообщение сохраняется, бот отвечает: *"Сообщение получено ✅"*
2. **Менеджер создаёт тикет** в админ-панели (поиск по chat_id)
3. **Менеджер назначается** на тикет → пользователь получает: *"Менеджер @name назначен"*
4. **Менеджер отвечает** в админ-панели → сообщение приходит пользователю через бота
5. **Пользователь отвечает** в Telegram → сообщение добавляется в conversation
6. **Менеджер закрывает тикет** → пользователь получает: *"Тикет закрыт 🔒"*

### Админ-панель

**Создание тикета:**
1. Нажать "+ Создать тикет"
2. Ввести Telegram Chat ID пользователя
3. (Опционально) Назначить менеджера
4. Указать тему и приоритет

**Поиск пользователя:**
1. Ввести username (без @) или Chat ID
2. Нажать "Поиск"
3. Выбрать пользователя из результатов

**Назначение менеджера:**
1. Открыть тикет → "Подробнее"
2. Выбрать менеджера из dropdown
3. Нажать "Назначить"

**Ответ пользователю:**
1. Открыть тикет
2. Ввести текст в поле "Ответить"
3. Нажать "Отправить ответ"
4. Сообщение автоматически придёт пользователю через бота

---

## 🧪 Тестирование

### 1. Создать тестового пользователя

Откройте бота в Telegram и напишите любое сообщение. Бот ответит:
```
✅ Сообщение получено!
Ваше сообщение записано. Менеджер ответит вам в ближайшее время. 🕐
```

### 2. Проверить в БД

```sql
SELECT * FROM telegram_users;
```

### 3. Создать тикет через API

```bash
curl -X POST http://localhost:54321/functions/v1/admin-api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_UUID_FROM_DB",
    "subject": "Тестовый тикет",
    "priority": "medium"
  }'
```

### 4. Проверить в админ-панели

Откройте http://localhost:3000/tickets

---

## 🔧 troubleshooting

### Бот не отвечает

1. Проверьте webhook:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

2. Проверьте логи функции:
```bash
supabase functions logs telegram-webhook
```

### Ошибка "Missing Supabase environment variables"

Убедитесь, что переменные окружения настроены:
```bash
supabase secrets list
supabase secrets set BOT_TOKEN=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Админ-панель не подключается к API

1. Проверьте `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:54321/functions/v1
```

2. Для продакшена замените на реальный URL функций

---

## 📝 Следующие шаги (опционально)

- [ ] Добавить аутентификацию в админ-панель (сейчас open access)
- [ ] Прикрутить Supabase Auth для менеджеров
- [ ] Добавить уведомления в Telegram для менеджеров
- [ ] Реализовать AI-автоответы на FAQ
- [ ] Добавить attachement'ы (фото, файлы)
- [ ] Добавить шаблонные ответы
- [ ] SLA-таймеры (время ответа)
- [ ] Экспорт тикетов в CSV/Excel

---

## 🏗️ Архитектура

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Telegram      │────────▶│  telegram-webhook │────────▶│   Supabase      │
│   User          │◀────────│  (Edge Function)  │         │   Database      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                              ▲
┌─────────────────┐         ┌──────────────────┐              │
│   Manager       │────────▶│  admin-api        │──────────────┘
│   Browser       │◀────────│  (Edge Function)  │
└─────────────────┘         └──────────────────┘
         ▲
         │
┌─────────────────┐
│  Admin Panel    │
│  (Next.js)      │
└─────────────────┘
```

---

## 📚 Связанные файлы

**Миграции:**
- `supabase/migrations/20260413000000_create_ticket_system.sql`

**Функции:**
- `supabase/functions/telegram-webhook/index.ts` (обновлён)
- `supabase/functions/admin-api/index.ts` (новый)
- `supabase/functions/telegram-webhook/services/database.ts` (обновлён)
- `supabase/functions/telegram-webhook/utils/telegram.ts` (обновлён)

**Админ-панель:**
- `admin-dashboard/src/app/tickets/page.tsx`
- `admin-dashboard/src/app/users/page.tsx`
- `admin-dashboard/src/app/managers/page.tsx`
- `admin-dashboard/src/app/(home)/page.tsx` (обновлён)
