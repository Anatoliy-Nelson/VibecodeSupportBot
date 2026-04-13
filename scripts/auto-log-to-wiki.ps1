# Auto-Log to Wiki PowerShell Script
# Вызывается Git hook post-commit для автоматического логирования изменений в базу знаний

$ErrorActionPreference = "SilentlyContinue"

# Пути
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent)
$WikiRoot = Join-Path $ProjectRoot "Vibecoding_Incubator"
$LogFile = Join-Path $WikiRoot "log.md"

# Проверяем, что wiki существует
if (-not (Test-Path $WikiRoot)) {
    Write-Host "⏭️ Wiki не найдена, пропускаем логирование"
    exit 0
}

# Получаем информацию о последнем коммите
$CommitHash = git rev-parse HEAD
$CommitMsg = git log -1 --pretty=%B
$CommitDate = git log -1 --pretty=%ci
$CommitAuthor = git log -1 --pretty=%an

# Получаем список изменённых файлов
$ChangedFiles = git diff-tree --no-commit-id --name-status -r HEAD | Out-String

# Фильтруем: исключаем технические изменения (log.md, .gitkeep, и т.д.)
$SignificantChanges = $ChangedFiles -split "`n" | Where-Object {
    $_ -and 
    $_ -notmatch "log\.md$" -and 
    $_ -notmatch "\.gitkeep$" -and
    $_ -notmatch "Vibecoding_Incubator/"
}

# Если нет значимых изменений — пропускаем
if ($SignificantChanges.Count -eq 0) {
    Write-Host "⏭️ Нет значимых изменений, пропускаем"
    exit 0
}

# Определяем тип изменений
$Type = if ($CommitMsg -match "feat|feature") { "feat" }
        elseif ($CommitMsg -match "fix") { "fix" }
        elseif ($CommitMsg -match "refactor") { "refactor" }
        elseif ($CommitMsg -match "docs") { "docs" }
        else { "update" }

# Форматируем дату
$FormattedDate = Get-Date $CommitDate -Format "yyyy-MM-dd"
$Time = Get-Date $CommitDate -Format "HH:mm"

# Создаём запись для log.md
$FilesList = ($SignificantChanges | ForEach-Object {
    $parts = $_ -split "\s+"
    $status = $parts[0]
    $file = $parts[1] -replace "^$([regex]::Escape($ProjectRoot))\", ""
    return "- \`"$status\`" \`"$file\`""
}) -join "`n"

$LogEntry = @"

### [$FormattedDate] $Type | $CommitMsg
- **Автор:** $CommitAuthor
- **Коммит:** \`"$CommitHash\`"
- **Изменённые файлы:**
$FilesList
"@

# Читаем текущий log.md
if (Test-Path $LogFile) {
    $Content = Get-Content $LogFile -Raw -Encoding UTF8
    
    # Проверяем, нет ли уже этой записи (по хешу коммита)
    if ($Content -match [regex]::Escape($CommitHash)) {
        Write-Host "✅ Запись уже существует, пропускаем"
        exit 0
    }
    
    # Вставляем перед последней строкой (---)
    if ($Content -match "(?s)(.*)(---\s*\*Последнее обновление:.*)") {
        $Before = $Matches[1]
        $After = $Matches[2]
        $NewContent = "$Before$LogEntry`n`n$After"
    } else {
        $NewContent = "$Content`n$LogEntry`n`n---`n*Последнее обновление: $FormattedDate*"
    }
} else {
    $NewContent = "# 📝 Log — Журнал изменений`n`n$LogEntry`n`n---`n*Последнее обновление: $FormattedDate*"
}

# Записываем обратно
$NewContent | Set-Content $LogFile -Encoding UTF8 -NoNewline

Write-Host "✅ Запись добавлена в wiki/log.md: $Type | $CommitMsg"
