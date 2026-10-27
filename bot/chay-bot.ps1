# Chạy Trợ lý GVCN: nạp biến từ .env (thư mục gốc dự án) rồi chạy OpenClaw gateway ở cửa sổ này.
# Dùng: mở PowerShell, chạy  .\bot\chay-bot.ps1   (Ctrl+C để dừng)
$root = Split-Path -Parent $PSScriptRoot
Get-Content (Join-Path $root ".env") | ForEach-Object {
    if ($_ -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$') {
        [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
    }
}
foreach ($k in @("ZALO_BOT_TOKEN", "GVCN_APPS_SCRIPT_URL", "GVCN_APPS_SCRIPT_SECRET")) {
    if (-not [Environment]::GetEnvironmentVariable($k, "Process")) { Write-Warning "Thiếu $k trong .env" }
}
openclaw gateway
