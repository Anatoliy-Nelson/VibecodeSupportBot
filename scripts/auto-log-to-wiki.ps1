# Auto-Log to Wiki PowerShell Script
# Вызывается Git hook post-commit для автоматического логирования изменений в базу знаний

$ErrorActionPreference = "Continue"

# Пути
$ScriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$ProjectRoot = Split-Path $ScriptDir -Parent
$WikiRoot = Join-Path $ProjectRoot "Vibecoding_Incubator"
$LogFile = Join-Path $WikiRoot "log.md"

# Debug (раскомментируйте для отладки)
# Write-Host "🔍 ScriptDir: $ScriptDir"
# Write-Host "🔍 ProjectRoot: $ProjectRoot"
# Write-Host "🔍 WikiRoot: $WikiRoot"
# Write-Host "🔍 LogFile: $LogFile"

# Проверяем, что wiki существует
if (-not (Test-Path $WikiRoot)) {
    Write-Host "⏭️ Wiki не найдена по пути: $WikiRoot"
    exit 0
}

# Получаем информацию о последнем коммите
$CommitHash = git rev-parse HEAD
$CommitMsg = git log -1 --pretty=%B | Out-String -Width 200
$CommitDate = git log -1 --pretty=%ci
$CommitAuthor = git log -1 --pretty=%an

# Получаем список изменённых файлов (используем git diff-tree с правильным выводом)
$ChangedFiles = git diff-tree --no-commit-id --name-status -r HEAD 2>&1 | Out-String

# Фильтруем: исключаем технические изменения (log.md, .gitkeep, и т.д.)
$SignificantChanges = @()
foreach ($line in ($ChangedFiles -split "`n")) {
    $line = $line.Trim()
    if ($line -and 
        $line -notmatch "log\.md$" -and 
        $line -notmatch "\.gitkeep$" -and
        $line -notmatch "Vibecoding_Incubator/") {
        $SignificantChanges += $line
    }
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

# Убираем префикс типа из сообщения для чистоты
$CleanMsg = $CommitMsg -replace "^(feat|feature|fix|refactor|docs|chore|test|style|perf)\s*:\s*", ""
$CleanMsg = $CleanMsg.Trim()

# Форматируем дату
$FormattedDate = Get-Date $CommitDate -Format "yyyy-MM-dd"
$Time = Get-Date $CommitDate -Format "HH:mm"

# Создаём запись для log.md
$FilesList = ($SignificantChanges | ForEach-Object {
    $parts = $_ -split "\s+"
    $status = $parts[0]
    $file = $parts[1]
    # Убираем префикс пути проекта (работает для Windows)
    $file = $file -replace [regex]::Escape($ProjectRoot + "\"), ""
    $file = $file -replace [regex]::Escape($ProjectRoot), ""
    return "- \`"$status\`" \`"$file\`""
}) -join "`n"

$LogEntry = @"

### [$FormattedDate] $Type | $CleanMsg
- **Автор:** $CommitAuthor
- **Коммит:** \`"$CommitHash\`"
- **Изменённые файлы:**
$FilesList
"@

# Читаем текущий log.md
if (Test-Path $LogFile) {
    $Content = Get-Content $LogFile -Raw -Encoding UTF8
    
    # Проверяем, нет ли уже этой записи (по хешу коммита)
    if ($Content -match [regex]::Escape($CommitHash.Substring(0, 7))) {
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
    $NewContent = "# 📝 Log — Журнал изменений`n`n## $FormattedDate`n$LogEntry`n`n---`n*Последнее обновление: $FormattedDate*"
}

# Записываем обратно (UTF8 без BOM)
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($LogFile, $NewContent, $Utf8NoBom)

Write-Host "✅ Запись добавлена в wiki/log.md: $Type | $CleanMsg"
