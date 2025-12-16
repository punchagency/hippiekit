# Rebuild Android app after configuration changes
Write-Host "Building client..." -ForegroundColor Cyan
npm run build

Write-Host "`nSyncing Capacitor..." -ForegroundColor Cyan
npx cap sync android

Write-Host "`n✓ Done! Now rebuild in Android Studio:" -ForegroundColor Green
Write-Host "  1. Build → Clean Project" -ForegroundColor Yellow
Write-Host "  2. Build → Rebuild Project" -ForegroundColor Yellow
Write-Host "  3. Run app on device/emulator" -ForegroundColor Yellow
