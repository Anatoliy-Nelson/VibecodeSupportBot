---
title: "VibecodeSupportBot — Полный анализ проекта"
aliases: [project-analysis, architecture-overview, support-bot]
tags: [project, architecture, nextjs, supabase, telegram, vercel, knowledge-base]
sources:
  - "Полный анализ проекта от 2026-04-13"
created: 2026-04-13
updated: 2026-04-13
---

# VibecodeSupportBot — Полный анализ проекта

## 📋 Обзор

**VibecodeSupportBot** — это система поддержки пользователей Telegram с админ-панелью на Next.js, базой данных Supabase и автоматизированной базой знаний, которая компилирует разговоры с AI в структурированные знания.

**Основная цель:** Обеспечить поддержку пользователей Telegram через бота с возможностью управления через веб-админку.

---

## 🏗️ Архитектура системы

### Высокоуровневая схема

```
Пользователь Telegram
       ↓ webhook (POST)
Supabase Edge Function (Deno/TypeScript)
       ↓ INSERT через service_role key
PostgreSQL (Supabase)
  ├── messages
  ├── admin_users
  └── password_reset_tokens
       ↑ SELECT через anon key
support-admin (Next.js 16.2.2)
       ↓ хостинг
Vercel
```

### Три основных компонента

1. **Telegram Bot** — приём сообщений от пользователей
2. **Support Admin** — Next.js админ-панель для управления
3. **Knowledge Base** — автоматическая система управления знаниями

---

## 📁 Структура проекта

```
VibecodeSupportBot/
│
├── .claude/                     # Claude Memory Compiler hooks
│   └── settings.json            # SessionStart, PreCompact, SessionEnd
│
├── .qwen/                       # Qwen Code конфигурация
│   └── settings.json            # Разрешённые bash-команды
│
├── daily/                       # Ежедневные логи разговоров (auto)
├── knowledge/                   # Скомпилированные знания (auto)
│   ├── concepts/                # Атомарные знания
│   ├── connections/             # Перекрёстные связи
│   └── qa/                      # Сохранённые ответы
│
├── hooks/                       # Claude Code hooks (Python)
│   ├── session-start.py         # Инжекция knowledge в сессию
│   ├── session-end.py           # Сохранение разговора в daily/
│   └── pre-compact.py           # Страховка от потери контекста
│
├── scripts/                     # CLI инструменты
│   ├── auto-lint.ps1            # Авто-lint через Task Scheduler (22:00)
│   ├── auto-log-to-wiki.ps1     # Git post-commit hook → wiki log
│   ├── compile.py               # Компилятор daily → knowledge
│   ├── config.py                # Константы путей
│   ├── flush.py                 # Memory flush agent
│   ├── lint.py                  # 7 health checks
│   ├── query.py                 # Index-guided retrieval
│   ├── setup-lint-task.ps1      # Создание задачи в Task Scheduler
│   ├── state.json               # Runtime state
│   └── utils.py                 # Общие утилиты
│
├── supabase/                    # Supabase конфигурация и миграции
│   ├── config.toml              # project_id="SupportBot", DB v17
│   ├── functions/
│   │   └── telegram-webhook/    # Deno Edge Function
│   │       ├── index.ts         # Обработка Telegram webhook
│   │       └── deno.json        # Import map
│   └── migrations/
│       ├── 20260330212523_create_messages_table.sql
│       ├── 20260330220839_add_rls_to_messages.sql
│       ├── 20260406000000_create_admin_users_table.sql
│       └── 20260406000001_create_password_reset_tokens.sql
│
├── support-admin/               # Next.js админ-панель
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── admin/managers/
│   │   │   │   │   └── route.ts       # CRUD менеджеров
│   │   │   │   └── auth/
│   │   │   │       ├── login/route.ts
│   │   │   │       ├── logout/route.ts
│   │   │   │       ├── google/route.ts
│   │   │   │       ├── forgot-password/route.ts
│   │   │   │       └── reset-password/route.ts
│   │   │   ├── auth/
│   │   │   │   ├── sign-in/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── reset-password/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── messages/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       └── managers/page.tsx
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── FormElements/
│   │   │   ├── Layouts/
│   │   │   ├── MessageGroup.tsx         # Группировка сообщений
│   │   │   └── ThemeProvider.tsx
│   │   └── lib/
│   │       ├── supabase.ts              # Supabase клиент
│   │       └── utils.ts
│   ├── middleware.ts              # Cookie-based auth
│   └── package.json               # Next.js 16.2.2, React 19.2.4
│
├── Vibecoding_Incubator/          # Ручная база знаний (wiki)
│   ├── wiki/
│   │   ├── concepts/
│   │   ├── entities/
│   │   ├── topics/
│   │   └── synthesis/
│   ├── raw/                       # Сырые источники
│   ├── QWEN.md                    # Инструкции для LLM wiki-агента
│   ├── index.md                   # Навигация по wiki
│   └── log.md                     # Журнал изменений
│
├── docs/
│   └── C4_DIAGRAMS.md             # C4-диаграммы (Mermaid)
│
├── etc/                           # Временные файлы (не в Git)
│
├── AGENTS.md                      # Схема Claude Memory Compiler
├── README.md                      # Общая документация
├── pyproject.toml                 # Python зависимости
└── vercel.json                    # Vercel маршрутизация
```

---

## 🛠️ Технологии

### Языки программирования

| Язык | Где используется |
|------|-----------------|
| **Python 3.12+** | Все скрипты knowledge base (compile, query, lint, flush, hooks) |
| **TypeScript 5** | Supabase Edge Functions, Next.js support-admin |
| **Deno (runtime)** | Supabase Edge Functions (telegram-webhook) |
| **PowerShell** | Автоматизация Windows (auto-lint, auto-log-to-wiki) |
| **SQL** | Supabase миграции (PostgreSQL 17) |

### Фреймворки и библиотеки

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Next.js** | 16.2.2 | Веб-приложение админ-панели |
| **React** | 19.2.4 | UI components |
| **TailwindCSS** | 3.4.19 | Стилизация |
| **@supabase/supabase-js** | 2.101.1 | Клиент Supabase для Next.js |
| **@auth/supabase-adapter** | 1.11.1 | Auth.js интеграция с Supabase |
| **bcryptjs** | 3.0.3 | Хеширование паролей |
| **claude-agent-sdk** | >=0.1.29 | LLM-компиляция знаний, query, lint |
| **python-dotenv** | >=1.0.0 | Загрузка .env файлов |
| **ApexCharts** | 4.5.0 | Графики (в шаблоне dashboard) |

### Базы данных

| Технология | Версия | Назначение |
|------------|--------|------------|
| **PostgreSQL** | 17 | Основная БД через Supabase |
| **Supabase** | project_id="SupportBot" | Облачная БД + API + Auth + Edge Functions |

### Инфраструктура

| Сервис | Назначение |
|--------|------------|
| **Vercel** | Хостинг Next.js приложения |
| **Supabase Edge Functions** | Deno функции для Telegram webhook |
| **Telegram Bot API** | Приём сообщений от пользователей |
| **Windows Task Scheduler** | Ежедневный auto-lint в 22:00 |
| **Git hooks (post-commit)** | Авто-логирование изменений в wiki |

### Пакетные менеджеры

| Менеджер | Где используется |
|----------|-----------------|
| **uv** | Python зависимости (pyproject.toml) |
| **pnpm** | support-admin |

---

## 📊 База данных (Supabase)

### Таблица: `messages`

```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL,
  username TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON messages FOR SELECT USING (true);
```

**Назначение:** Хранение сообщений от пользователей Telegram.

### Таблица: `admin_users`

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'manager',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Назначение:** Учётные записи администраторов/менеджеров.

### Таблица: `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);
```

**Назначение:** Токены для сброса пароля администраторов.

---

## 🔌 API Endpoints

### Supabase Edge Function (Telegram Webhook)

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/functions/v1/telegram-webhook` | Telegram webhook (CORS-enabled) |

**Логика telegram-webhook:**
1. Принимает POST от Telegram webhook
2. Обрабатывает команду `/start` (приветствие)
3. Сохраняет сообщение в таблицу `messages` через service_role key
4. Отправляет эхо-ответ пользователю

### Next.js Support Admin API Routes

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/auth/login` | Аутентификация по email/password |
| POST | `/api/auth/logout` | Логаут |
| POST | `/api/auth/google` | Google OAuth callback |
| POST | `/api/auth/forgot-password` | Запрос токена сброса пароля |
| POST | `/api/auth/reset-password` | Сброс пароля по токену |
| GET/POST | `/api/admin/managers` | CRUD менеджеров |

### Vercel Route Configuration

```json
{ "src": "/api/(.*)", "dest": "/vercel/api/$1.ts" }
```

---

## 🌐 Support Admin — Маршруты

### Публичные страницы

| Путь | Описание |
|------|----------|
| `/auth/sign-in` | Страница входа (email/password + Google OAuth) |
| `/auth/forgot-password` | Запрос сброса пароля |
| `/auth/reset-password` | Установка нового пароля |

### Защищённые страницы (требуют auth)

| Путь | Описание |
|------|----------|
| `/dashboard` | Главная дашборда |
| `/dashboard/messages` | Просмотр сообщений поддержки (группировка по chat_id) |
| `/dashboard/users` | Управление пользователями Telegram |
| `/dashboard/managers` | Управление менеджерами (CRUD) |

---

## 🤖 Knowledge Base System

### Claude Memory Compiler (Автоматическая)

**Архитектура по аналогии с компилятором:**

```
daily/          = исходный код    (разговоры с AI)
LLM             = компилятор      (извлекает знания)
knowledge/      = исполняемый файл (структурированная база знаний)
lint.py         = тесты           (проверки целостности)
query.py        = runtime         (использование знаний)
```

**Hooks (автоматически):**
- **SessionStart** — инжектирует knowledge index в сессию
- **SessionEnd** — сохраняет разговор в daily/
- **PreCompact** — сохраняет контекст перед авто-компактизацией
- **Авто-компиляция** — каждый день в 00:05

**Команды:**

```bash
uv run python scripts/compile.py              # компиляция daily logs
uv run python scripts/query.py "вопрос"       # запрос к базе
uv run python scripts/lint.py --structural-only  # проверки
```

### Vibecoding_Incubator (Ручная)

Ручные заметки в формате Obsidian markdown.

**Структура:**
- `wiki/concepts/` — Концепции и паттерны
- `wiki/entities/` — Сущности (люди, организации)
- `wiki/topics/` — Обзорные страницы по темам
- `wiki/synthesis/` — Синтез, сравнения, аналитика

**Авто-логирование:** Git hook (post-commit) логирует изменения кода в `log.md`

### Авто-lint по расписанию

- **Windows Task Scheduler:** `VibecodeSupportBot-DailyLint`
- **Расписание:** каждый день в 22:00
- **Скрипт:** `scripts/auto-lint.ps1`
- **Режим:** `--structural-only` (бесплатно)

---

## 💰 Стоимость операций

| Операция | Стоимость |
|----------|-----------|
| Компиляция одного daily log | $0.45-0.65 |
| Query (без file-back) | ~$0.15-0.25 |
| Query (с file-back) | ~$0.25-0.40 |
| Full lint (с противоречиями) | ~$0.15-0.25 |
| Structural lint | $0.00 |
| Memory flush (за сессию) | ~$0.02-0.05 |

> **Примечание:** Для личного использования Claude Agent SDK покрыт подпиской Claude (Max, Team, Enterprise).

---

## 🔗 Связи

- [[llm-wiki-pattern-karpathy]] — оригинальная архитектура Карпаты
- [[claude-memory-compiler]] — автоматическая компиляция разговоров
- [[index]] — навигация по базе знаний
- [[log]] — журнал изменений

---
*Создано: 2026-04-13*
