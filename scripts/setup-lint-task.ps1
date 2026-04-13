# Setup Auto-Lint Task in Windows Task Scheduler
# Запускает lint каждый день в 10:00

$TaskName = "VibecodeSupportBot-DailyLint"
$ScriptPath = "f:\IT-Incubator-Projects\VibecodeSupportBot\scripts\auto-lint.ps1"
$StartTime = [datetime]::Today.AddHours(22) # 10:00 PM

# Проверяем, существует ли уже задача
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "🗑️  Удаляем старую задачу: $TaskName"
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Создаём действие
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`""

# Создаём триггер (ежедневно в 10:00)
$Trigger = New-ScheduledTaskTrigger -Daily -At $StartTime

# Настройки
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Регистрируем задачу
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Automatically runs lint.py --structural-only для VibecodeSupportBot knowledge base"

Write-Host "✅ Задача '$TaskName' создана!"
Write-Host "   Расписание: каждый день в 10:00"
Write-Host "   Скрипт: $ScriptPath"
Write-Host ""
Write-Host "📋 Управление:"
Write-Host "   Посмотреть задачу: Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "   Запустить вручную: Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "   Удалить задачу: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
