# Tests direkt gegen Online-URL ausführen (ohne lokalen Server)
Write-Host "Running Playwright Tests against ONLINE URL..." -ForegroundColor Green
Write-Host "Base URL: https://ts-portal.pages.dev" -ForegroundColor Yellow

cd "businessconnecthub-playwright-tests-full"
$env:PLAYWRIGHT_BASE_URL = "https://ts-portal.pages.dev"
npx playwright test --project=Chromium --reporter=list

Write-Host "Tests completed!" -ForegroundColor Green

