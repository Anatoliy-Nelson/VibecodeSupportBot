---
title: "Claude Memory Compiler"
aliases: [memory-compiler, claude-memory]
tags: [llm, memory, automation, knowledge-base, claude, karpathy]
sources:
  - "https://github.com/coleam00/claude-memory-compiler.git"
created: 2026-04-13
updated: 2026-04-13
---

# Claude Memory Compiler

Автоматическая система компиляции разговоров с LLM в персональную базу знаний. Адаптирована из архитектуры Карпаты, но вместо веб-статей использует ваши собственные разговоры с Claude Code.

## 🎯 Ключевая идея

**Разговоры с AI компилируются сами в поисговую базу знаний.**

Когда сессия заканчивается (или происходит авто-компактизация), hooks захватывают разговор и используют Claude Agent SDK для извлечения важного:
- Решений и их обоснований
- Усвоенных уроков
- Паттернов и gotchas
- Действий и follow-ups

Всё это автоматически добавляется в ежедневный лог, который затем компилируется в структурированные статьи базы знаний.

## 🏗️ Архитектура

### Аналогия с компилятором

```
daily/          = исходный код    (ваши разговоры)
LLM             = компилятор      (извлекает и организует знания)
knowledge/      = исполняемый файл (структурированная база знаний)
lint            = тесты           (проверки целостности)
queries         = runtime         (использование знаний)
```

### Три слоя

1. **`daily/`** — Ежедневные логи разговоров (неизменяемые)
2. **`knowledge/`** — Скомпилированные знания (LLM владеет полностью)
   - `index.md` — Мастер-каталог всех статей
   - `log.md` — Хронологический журнал сборки
   - `concepts/` — Атомарные знания
   - `connections/` — Перекрёстные связи
   - `qa/` — Ответы на вопросы
3. **`AGENTS.md`** — Схема компилятора (как LLM должен поддерживать базу)

## 🔄 Как работает

### 1. Hooks (автоматический захват)

| Hook | Когда срабатывает | Что делает |
|------|-------------------|------------|
| `session-start.py` | Начало сессии | Инжектирует index.md в контекст сессии |
| `session-end.py` | Конец сессии | Копирует транскрипт, запускает flush.py |
| `pre-compact.py` | Перед авто-компактизацией | Страховка от потери контекста |

### 2. Flush (извлечение знаний)

`flush.py` работает как полностью откреплённый фоновый процесс:
1. Устанавливает `CLAUDE_INVOKED_BY=memory_flush` (защита от рекурсии)
2. Читает контекст разговора из временного файла
3. Вызывает Claude Agent SDK (`query()` с `allowed_tools=[]`)
4. Claude решает, что стоит сохранить — возвращает структурированные пункты
5. Добавляет результат в `daily/YYYY-MM-DD.md`
6. **Авто-компиляция в 18:00** — если сегодня есть новые записи, запускает `compile.py`

### 3. Compile (сборка знаний)

`compile.py` обрабатывает ежедневные логи:
- Читает daily log
- Анализирует текущее состояние index.md
- Для каждого фрагмента знаний:
  - Если есть существующая статья — **обновляет** её
  - Если новая тема — **создаёт** статью в `concepts/`
- При обнаружении неочевидных связей — создаёт `connections/`
- Обновляет index.md и log.md

### 4. Query (использование)

`query.py` отвечает на вопросы без RAG:
1. Читает `knowledge/index.md` (мастер-каталог)
2. Определяет 3-10 релевантных статей
3. Читает их полностью
4. Синтезирует ответ с `[[wikilink]]` цитатами
5. С `--file-back` — сохраняет ответ в `qa/`

### 5. Lint (проверка здоровья)

7 проверок:
1. **Broken links** — `[[wikilinks]]` на несуществующие статьи
2. **Orphan pages** — Статьи без входящих ссылок
3. **Orphan sources** — daily логи, которые ещё не скомпилированы
4. **Stale articles** — Изменённые source логи после компиляции
5. **Contradictions** — Конфликтующие утверждения (требует LLM)
6. **Missing backlinks** — A ссылается на B, но B не на A
7. **Sparse articles** — Меньше 200 слов

## 💰 Стоимость

| Операция | Стоимость |
|----------|-----------|
| Компиляция одного daily log | $0.45-0.65 |
| Query (без file-back) | ~$0.15-0.25 |
| Query (с file-back) | ~$0.25-0.40 |
| Full lint (с противоречиями) | ~$0.15-0.25 |
| Structural lint | $0.00 |
| Memory flush (за сессию) | ~$0.02-0.05 |

**Важно:** Для личного использования Claude Agent SDK покрыт подпиской Claude (Max, Team, Enterprise) — отдельные API кредиты не нужны.

## 🛠️ Ключевые команды

```bash
uv run python scripts/compile.py              # компиляция новых daily logs
uv run python scripts/compile.py --all        # перекомпиляция всего
uv run python scripts/query.py "вопрос"       # запрос к базе знаний
uv run python scripts/query.py "вопрос" --file-back  # + сохранение ответа
uv run python scripts/lint.py                 # все проверки
uv run python scripts/lint.py --structural-only  # только структурные (бесплатно)
```

## 🔍 Почему No RAG?

Инсайт Карпаты: на личном масштабе (50-500 статей) LLM, читающий структурированный `index.md`, превосходит векторное сходство. 

- LLM понимает, что вы **действительно** спрашиваете
- Cosine similarity находит **похожие слова**
- RAG становится необходимым только при ~2000+ статьях

## 📂 Структура проекта

```
llm-personal-kb/
|-- .claude/settings.json          # Hook конфигурация
|-- daily/                         # Исходный код (разговоры, immutable)
|-- knowledge/                     # Исполняемый файл (LLM-owned)
|   |-- index.md                   # Мастер-каталог
|   |-- log.md                     # Append-only build log
|   |-- concepts/                  # Атомарные знания
|   |-- connections/               # Перекрёстные связи
|   |-- qa/                        # Сохранённые ответы
|-- scripts/                       # CLI инструменты
|   |-- compile.py                 # Компилятор daily -> knowledge
|   |-- query.py                   # Index-guided retrieval
|   |-- lint.py                    # 7 health checks
|   |-- flush.py                   # Извлечение памяти из разговоров
|-- hooks/                         # Claude Code hooks
|   |-- session-start.py           # Инжекция знаний в сессию
|   |-- session-end.py             # Разговор -> daily log
|   |-- pre-compact.py             # Страховка от потери контекста
```

## 🔗 Связи

- [[llm-wiki-pattern-karpathy]] — оригинальная архитектура Карпаты
- [[index]] — навигация по базе знаний
- [[log]] — журнал изменений

## 🔗 Источники

- [GitHub: claude-memory-compiler](https://github.com/coleam00/claude-memory-compiler.git)
- [Karpathy's LLM Knowledge Base](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)

---
*Создано: 2026-04-13*
