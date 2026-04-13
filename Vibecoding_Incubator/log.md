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

---
*Последнее обновление: 2026-04-13*
