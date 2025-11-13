# Quick Deploy - Installs existing APK without rebuilding
# Use this when you've already run npm run build and npx cap sync

Write-Host "⚡ Quick Deploy to Android" -ForegroundColor Cyan
Write-Host ""

$ADB = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$APK_PATH = "C:\Users\jide\desktop\hippiekit-frontend\hippiekit\client\android\app\build\outputs\apk\debug\app-debug.apk"
$PACKAGE_NAME = "com.hippiekit.app"

# Check if APK exists
if (-not (Test-Path $APK_PATH)) {
    Write-Host "❌ APK not found. Run the full deploy-android.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Restarting ADB..." -ForegroundColor Yellow
& $ADB kill-server | Out-Null
Start-Sleep -Seconds 1
& $ADB start-server | Out-Null
Start-Sleep -Seconds 1

Write-Host "🗑️  Uninstalling old version..." -ForegroundColor Yellow
& $ADB uninstall $PACKAGE_NAME 2>$null | Out-Null

Write-Host "📲 Installing..." -ForegroundColor Yellow
$result = & $ADB install -r $APK_PATH

if ($result -match "Success") {
    Write-Host "✅ Installed!" -ForegroundColor Green
    Write-Host "🚀 Launching..." -ForegroundColor Yellow
    & $ADB shell am start -n "$PACKAGE_NAME/.MainActivity" | Out-Null
    Write-Host "✨ Done! Check your emulator." -ForegroundColor Green
} else {
    Write-Host "❌ Failed!" -ForegroundColor Red
    Write-Host $result
}
