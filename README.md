# VibecodeSupportBot

Поддержка Vibecoding Incubator — проект с AI-ассистентом.

## 📚 База знаний

Проект включает две системы управления знаниями:

### 1. Vibecoding_Incubator (Ручная база знаний)

Персональная wiki для заметок, паттернов и идей.

- **Расположение:** `Vibecoding_Incubator/`
- **Структура:** `wiki/concepts/`, `wiki/entities/`, `wiki/topics/`, `wiki/synthesis/`
- **Лог изменений:** `Vibecoding_Incubator/log.md`

### 2. Claude Memory Compiler (Автоматическая база знаний)

Автоматическая компиляция разговоров с AI в структурированные знания.

- **Ежедневные логи:** `daily/`
- **Скомпилированные знания:** `knowledge/concepts/`, `knowledge/connections/`, `knowledge/qa/`

## 🚀 Команды для работы с базой знаний

### Компиляция разговоров в знания

```bash
uv run python scripts/compile.py              # компиляция новых daily logs
uv run python scripts/compile.py --all        # перекомпиляция всего
uv run python scripts/compile.py --file daily/2026-04-13.md  # конкретный файл
uv run python scripts/compile.py --dry-run    # тест без записи
```

### Запрос к базе знаний

```bash
uv run python scripts/query.py "ваш вопрос"                        # простой запрос
uv run python scripts/query.py "ваш вопрос" --file-back            # запрос + сохранение ответа
```

### Проверка здоровья базы знаний

```bash
uv run python scripts/lint.py                 # все проверки (включая LLM, стоит $$$)
uv run python scripts/lint.py --structural-only  # только структурные проверки (бесплатно)
```

### Git автоматизация

После каждого `git commit` автоматически:
- Анализируются изменения
- Фильтруются технические файлы
- Добавляется запись в `Vibecoding_Incubator/log.md`

## 📁 Структура проекта

```
VibecodeSupportBot/
├── Vibecoding_Incubator/      # Ручная база знаний (wiki)
│   ├── wiki/                  # LLM-генерированные страницы
│   │   ├── concepts/          # Концепции и паттерны
│   │   ├── entities/          # Сущности
│   │   ├── topics/            # Обзорные страницы
│   │   └── synthesis/         # Синтез и аналитика
│   ├── raw/                   # Сырые источники
│   ├── QWEN.md                # Инструкции для LLM wiki-агента
│   ├── index.md               # Навигация по wiki
│   └── log.md                 # Журнал изменений
│
├── knowledge/                 # Автоматическая база знаний (из разговоров с AI)
│   ├── concepts/              # Атомарные знания
│   ├── connections/           # Перекрёстные связи
│   └── qa/                    # Сохранённые ответы
├── daily/                     # Ежедневные логи разговоров (auto)
├── hooks/                     # Claude Code hooks
├── scripts/                   # CLI инструменты
├── .claude/settings.json      # Hook конфигурация
├── AGENTS.md                  # Схема компилятора
└── pyproject.toml             # Python зависимости
```

## 🔧 Установка зависимостей

```bash
uv sync
```

Зависимости: `claude-agent-sdk`, `python-dotenv`, `tzdata`

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

## 📖 Документация

- [[Vibecoding_Incubator/QWEN.md]] — инструкции для LLM wiki-агента
- [[Vibecoding_Incubator/index.md]] — навигация по ручной базе знаний
- [[Vibecoding_Incubator/log.md]] — журнал всех изменений
- [[AGENTS.md]] — схема Claude Memory Compiler
- [[claude-memory-compiler/README.md]] — документация оригинального проекта

## 🔗 Полезные ссылки

- [Karpathy's LLM Knowledge Base](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Claude Memory Compiler](https://github.com/coleam00/claude-memory-compiler)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
