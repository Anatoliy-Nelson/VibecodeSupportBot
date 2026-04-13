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

---
*Последнее обновление: 2026-04-13*
