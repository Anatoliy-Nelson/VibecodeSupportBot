# Auto-Lint PowerShell Script
# Запускается по расписанию через Windows Task Scheduler

$ErrorActionPreference = "SilentlyContinue"

# Пути
$ProjectRoot = "f:\IT-Incubator-Projects\VibecodeSupportBot"
$ScriptsDir = Join-Path $ProjectRoot "scripts"
$UvPath = "C:\Users\Sithe\.local\bin\uv.exe"

# Проверяем, что uv установлен
if (-not (Test-Path $UvPath)) {
    Write-Host "⏭️ uv не найден по пути: $UvPath"
    exit 0
}

# Переходим в директорию проекта
Set-Location $ProjectRoot

# Запускаем lint
$env:Path = "$([System.IO.Path]::GetDirectoryName($UvPath));$env:Path"
& uv run python scripts/lint.py --structural-only

Write-Host "✅ Auto-lint завершён: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
