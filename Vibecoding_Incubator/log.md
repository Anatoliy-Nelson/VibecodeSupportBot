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

---
*Последнее обновление: 2026-04-13*
