# AGENTS.md - Personal Knowledge Base Schema (VibecodeSupportBot)

> Интеграция Claude Memory Compiler в проект VibecodeSupportBot.
> Адаптировано из [Karpathy's LLM Knowledge Base](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) и [claude-memory-compiler](https://github.com/coleam00/claude-memory-compiler).

## The Compiler Analogy

```
daily/          = исходный код    (ваши разговоры с AI)
LLM             = компилятор      (извлекает знания)
knowledge/      = исполняемый файл (структурированная база знаний)
lint            = тесты           (проверки целостности)
queries         = runtime         (использование знаний)
```

## Architecture

### Layer 1: `daily/` - Ежедневные логи (Immutable)

```
daily/
├── 2026-04-13.md
├── 2026-04-14.md
```

### Layer 2: `knowledge/` - Compiled Knowledge (LLM-Owned)

```
knowledge/
├── index.md              # Мастер-каталог
├── log.md                # Append-only build log
├── concepts/             # Атомарные знания
├── connections/          # Перекрёстные связи
└── qa/                   # Сохранённые ответы
```

### Layer 3: This File (AGENTS.md)

Схема компилятора — как LLM должен компилировать и поддерживать базу знаний.

## Core Operations

### 1. Compile (daily/ -> knowledge/)

1. Read the daily log
2. Read `knowledge/index.md`
3. Extract concepts, create/update articles
4. Update index.md and log.md

### 2. Query

1. Read `knowledge/index.md`
2. Identify 3-10 relevant articles
3. Synthesize answer with citations
4. Optionally file to `qa/`

### 3. Lint

7 checks: broken links, orphans, stale, contradictions, missing backlinks, sparse articles

## Conventions

- **Wikilinks:** `[[path/to/article]]` без `.md`
- **File naming:** lowercase, hyphens
- **Frontmatter:** title, sources, created, updated
- **Dates:** ISO 8601 (YYYY-MM-DD)

## Scripts

```bash
uv run python scripts/memory-compile.py              # компиляция daily logs
uv run python scripts/memory-query.py "вопрос"       # запрос к базе
uv run python scripts/memory-query.py "вопрос" --file-back  # + сохранение
uv run python scripts/memory-lint.py                 # все проверки
uv run python scripts/memory-lint.py --structural-only  # бесплатные проверки
```

## Hooks

Настроены в `.claude/settings.json`:
- **SessionStart** — инжектирует knowledge index в сессию
- **SessionEnd** — сохраняет разговор в daily log
- **PreCompact** — страховка от потери контекста

## Vibecoding_Incubator Integration

Этот проект также использует `Vibecoding_Incubator/` для ручной базы знаний:
- Ручные заметки: `Vibecoding_Incubator/wiki/`
- Автоматические знания: `knowledge/` (из разговоров с AI)
- Git hook логирует изменения кода: `Vibecoding_Incubator/log.md`
