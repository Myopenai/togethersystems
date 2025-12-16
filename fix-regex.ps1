# Fix the regex in build.js
$buildJsPath = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\docs\multi-industry-docs\build.js"

# Read the file content
$content = Get-Content -Path $buildJsPath -Raw

# Fix the regex pattern
$fixedContent = $content -replace 'file\.replace\(/\\\.js\$'"'"', '"'"'\.min\.js/\)', 'file.replace(/\.js$/, ".min.js")'

# Write the fixed content back to the file
$fixedContent | Set-Content -Path $buildJsPath -NoNewline

Write-Host "✅ Fixed the regex in build.js" -ForegroundColor Green