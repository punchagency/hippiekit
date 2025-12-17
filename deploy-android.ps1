# Android Deployment Helper Script
# This script helps deploy your Capacitor app to the Android emulator

Write-Host "🚀 Hippiekit Android Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ADB = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$APK_PATH = "C:\Users\jide\desktop\hippiekit-frontend\hippiekit\client\android\app\build\outputs\apk\debug\app-debug.apk"
$PACKAGE_NAME = "com.hippiekit.app"

# Check if ADB exists
if (-not (Test-Path $ADB)) {
    Write-Host "❌ Error: ADB not found at $ADB" -ForegroundColor Red
    Write-Host "Please install Android Studio and SDK" -ForegroundColor Yellow
    exit 1
}

# Check connected devices
Write-Host "📱 Checking connected devices..." -ForegroundColor Yellow
$devices = & $ADB devices
Write-Host $devices

if ($devices -notmatch "device$") {
    Write-Host "❌ No devices connected. Please start your emulator first." -ForegroundColor Red
    exit 1
}

# Build the app
Write-Host ""
Write-Host "🔨 Building the app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Sync Capacitor
Write-Host ""
Write-Host "🔄 Syncing with Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# Build Android APK
Write-Host ""
Write-Host "📦 Building Android APK..." -ForegroundColor Yellow
Set-Location android
./gradlew assembleDebug
Set-Location ..
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Android build failed!" -ForegroundColor Red
    exit 1
}

# Check if APK exists
if (-not (Test-Path $APK_PATH)) {
    Write-Host "❌ APK not found at $APK_PATH" -ForegroundColor Red
    exit 1
}

# Kill and restart ADB server
Write-Host ""
Write-Host "🔄 Restarting ADB server..." -ForegroundColor Yellow
& $ADB kill-server
Start-Sleep -Seconds 2
& $ADB start-server
Start-Sleep -Seconds 2

# Uninstall old version
Write-Host ""
Write-Host "🗑️  Uninstalling old version..." -ForegroundColor Yellow
& $ADB uninstall $PACKAGE_NAME 2>$null
Start-Sleep -Seconds 1

# Install new version
Write-Host ""
Write-Host "📲 Installing new version..." -ForegroundColor Yellow
$installResult = & $ADB install -r $APK_PATH
Write-Host $installResult

if ($installResult -match "Success") {
    Write-Host "✅ Installation successful!" -ForegroundColor Green
    
    # Launch the app
    Write-Host ""
    Write-Host "🚀 Launching app..." -ForegroundColor Yellow
    & $ADB shell am start -n "$PACKAGE_NAME/.MainActivity"
    
    Write-Host ""
    Write-Host "✨ Deployment complete! Check your emulator." -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Useful commands:" -ForegroundColor Cyan
    Write-Host "  View logs: & '$ADB' logcat | Select-String 'Capacitor'" -ForegroundColor Gray
    Write-Host "  Clear app data: & '$ADB' shell pm clear $PACKAGE_NAME" -ForegroundColor Gray
    Write-Host "  Uninstall: & '$ADB' uninstall $PACKAGE_NAME" -ForegroundColor Gray
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    exit 1
}
