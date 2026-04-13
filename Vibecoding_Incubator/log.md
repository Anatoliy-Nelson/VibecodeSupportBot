# 📝 Log — Журнал изменений

## 2026-04-13

### [2026-04-13] init | Создание базы знаний
- **QWEN.md** — инструкции для LLM wiki-агента
- **index.md** — главная навигационная страница
- **log.md** — журнал изменений (этот файл)
- **Добро пожаловать.md** — обновлён с ссылками на основные файлы
- Создана структура папок: `raw/`, `raw/assets/`, `wiki/`, `wiki/entities/`, `wiki/concepts/`, `wiki/topics/`, `wiki/synthesis/`

### [2026-04-13] ingest | LLM Wiki Pattern (Karpathy)
- **Источник:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- **Создана заметка:** [[wiki/concepts/llm-wiki-pattern-karpathy]]
- **Тип:** concept
- **Содержание:** Полное описание архитектуры LLM Wiki, операций ingest/query/lint, индексирования, логирования
- **Ключевые концепции:** RAG vs Wiki, три слоя (источники/wiki/схема), Obsidian как IDE, Memex Ванневара Буша
- **Теги:** #llm #wiki #knowledge-management #pattern #karpathy

### [2026-04-13] refactor | Реструктуризация базы знаний
- **Причина:** Изначальная структура была минимальной, добавлены папки по паттерну Карпаты
- **Изменения:**
  - Созданы папки: `raw/`, `raw/assets/`, `wiki/`, `wiki/entities/`, `wiki/concepts/`, `wiki/topics/`, `wiki/synthesis/`
  - Перемещена заметка `llm-wiki-pattern-karpathy.md` → `wiki/concepts/`
  - Обновлён `QWEN.md` с детальными инструкциями по структуре
  - Обновлён `index.md` с таблицами по категориям
  - Добавлен `.gitkeep` во все папки для отслеживания Git

### [2026-04-13] feat | Автоматизация логирования кода в wiki
- **Автор:** Anatoliy Manzhola
- **Скрипты:** `scripts/auto-log-to-wiki.ps1`, `.git/hooks/post-commit`
- **Что делает:**
  - Git hook после каждого коммита анализирует изменения
  - Фильтрует технические файлы (wiki, .gitkeep, log.md)
  - Определяет тип: feat, fix, refactor, docs, update
  - Записывает в log.md дату, автора, хеш коммита, список файлов
- **Коммиты:** `614a56f`, `416c3f8`, `a6b97d4` (тестовые)


### [2026-04-13] update | удалены тестовые файлы auto-log hook
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"a031ba3f08f7788222339f3b75b945838e8d50ef\"
- **Изменённые файлы:**
- \"D\" \"support-admin/test-hook-2.js\"
- \"D\" \"support-admin/test-hook.js\"


### [2026-04-13] fix | исправлено дублирование типа коммита и улучшена обработка путей
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"d5042b5683d6856cc57a93e17e2f9bdd18de5a73\"
- **Изменённые файлы:**
- \"M\" \"scripts/auto-log-to-wiki.ps1\"

### [2026-04-13] ingest | Claude Memory Compiler
- **Источник:** https://github.com/coleam00/claude-memory-compiler.git
- **Создана заметка:** [[wiki/concepts/claude-memory-compiler]]
- **Тип:** concept
- **Содержание:** Автоматическая система компиляции разговоров с LLM в базу знаний
- **Ключевые концепции:** 
  - Архитектура: daily logs → compile → knowledge base (index-guided, no RAG)
  - Hooks: session-start, session-end, pre-compact
  - Flush: фоновое извлечение знаний через Claude Agent SDK
  - Compile: инкрементальная сборка с SHA-256 трекингом
  - Query: индекс-управляемый поиск (лучше векторного на масштабе 50-500 статей)
  - Lint: 7 проверок здоровья базы знаний
- **Теги:** #memory #automation #claude #karpathy #llm
- **Стоимость:** $0.45-0.65 за компиляцию одного daily log


### [2026-04-13] feat | интегрирован Claude Memory Compiler hooks
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"794b14a899ee14b4e4c28ceccf58eb4fdba88fac\"
- **Изменённые файлы:**
- \"A\" \".claude/settings.json\"
- \"M\" \".gitignore\"
- \"A\" \"AGENTS.md\"
- \"A\" \"hooks/pre-compact.py\"
- \"A\" \"hooks/session-end.py\"
- \"A\" \"hooks/session-start.py\"
- \"A\" \"pyproject.toml\"
- \"A\" \"scripts/memory-compile.py\"
- \"A\" \"scripts/memory-config.py\"
- \"A\" \"scripts/memory-flush.py\"
- \"A\" \"scripts/memory-lint.py\"
- \"A\" \"scripts/memory-query.py\"
- \"A\" \"scripts/memory-utils.py\"


### [2026-04-13] fix | исправлены импорты в скриптах (переименованы memory-*.py → *.py)
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"e5565600d9b2c33c8bee2ef3105a452516049789\"
- **Изменённые файлы:**
- \"M\" \".claude/settings.json\"
- \"A\" \"scripts/__pycache__/config.cpython-314.pyc\"
- \"A\" \"scripts/__pycache__/utils.cpython-314.pyc\"
- \"A\" \"scripts/compile.py\"
- \"A\" \"scripts/config.py\"
- \"A\" \"scripts/flush.py\"
- \"A\" \"scripts/lint.py\"
- \"D\" \"scripts/memory-compile.py\"
- \"D\" \"scripts/memory-config.py\"
- \"D\" \"scripts/memory-flush.py\"
- \"D\" \"scripts/memory-lint.py\"
- \"D\" \"scripts/memory-query.py\"
- \"D\" \"scripts/memory-utils.py\"
- \"A\" \"scripts/query.py\"
- \"A\" \"scripts/state.json\"
- \"A\" \"scripts/utils.py\"


### [2026-04-13] docs | добавлен README с командами для работы с базой знаний
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"8ac349a831cabe603955df644056383cb55a4170\"
- **Изменённые файлы:**
- \"A\" \"README.md\"


### [2026-04-13] update | изменено время авто-компиляции с 18:00 на 00:05
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"a3e1889b6e6e9b2c339202574e878650dd36f46e\"
- **Изменённые файлы:**
- \"M\" \"README.md\"
- \"M\" \"scripts/flush.py\"


### [2026-04-13] feat | добавлен авто-lint через Windows Task Scheduler (каждый день в 10:00)
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"a7f68ff9f9de3775e1723c67dffc804126afda60\"
- **Изменённые файлы:**
- \"M\" \"README.md\"
- \"A\" \"scripts/auto-lint.ps1\"
- \"A\" \"scripts/setup-lint-task.ps1\"


### [2026-04-13] update | изменено время авто-lint с 10:00 на 22:00
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"c0f2d5acb2372e635ecba1e4a31bd58101bcc323\"
- **Изменённые файлы:**
- \"M\" \"README.md\"
- \"M\" \"scripts/setup-lint-task.ps1\"

### [2026-04-13] analysis | Полный анализ проекта VibecodeSupportBot
- **Создана заметка:** [[wiki/topics/vibecode-support-bot-project-analysis]]
- **Тип:** topic
- **Содержание:**
  - Полная структура проекта (все файлы и папки)
  - Технологии: Next.js 16.2.2, React 19.2.4, Supabase (PostgreSQL 17), Deno Edge Functions
  - База данных: 3 таблицы (messages, admin_users, password_reset_tokens) с RLS
  - API Endpoints: Telegram webhook, auth routes (login, logout, Google OAuth, forgot/reset password), managers CRUD
  - Support Admin маршруты: /auth/* (публичные), /dashboard/* (защищённые)
  - Knowledge Base System: Claude Memory Compiler (авто) + Vibecoding_Incubator wiki (ручная)
  - Автоматизация: Git hook post-commit (log.md), Windows Task Scheduler (lint в 22:00)
  - Инфраструктура: Vercel хостинг, Supabase облако, Telegram Bot API
  - C4-диаграммы в docs/ (System, Container, Component, Code уровни)
- **Теги:** #project #architecture #nextjs #supabase #telegram #vercel #knowledge-base


### [2026-04-13] docs | созданы полноценные C4 диаграммы (4 уровня по стандарту)
- **Автор:** Anatoliy Manzhola
- **Коммит:** \"28fb458b7c9d8dda958233e1284e6132da9553f8\"
- **Изменённые файлы:**
- \"M\" \"docs/C4_DIAGRAMS.md\"

---
*Последнее обновление: 2026-04-13*
