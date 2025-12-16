# Convert Markdown files to HTML
$docsPath = "d:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\docs"
$reportsPath = "d:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\reports"

# Create reports directory if it doesn't exist
if (-not (Test-Path -Path $reportsPath)) {
    New-Item -ItemType Directory -Path $reportsPath | Out-Null
    Write-Host "Created directory: $reportsPath"
}

# Get all markdown files in the docs directory
$mdFiles = Get-ChildItem -Path $docsPath -Filter "*.md" -File

foreach ($file in $mdFiles) {
    $htmlFile = Join-Path $reportsPath ($file.BaseName + ".html")
    
    # Read markdown content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Convert markdown to HTML (using basic conversion, you might want to use a proper markdown processor)
    $html = "<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <title>$($file.BaseName)</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #2c3e50; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
$($content -replace '\r?\n', '<br>' -replace '`([^`]+)`', '<code>$1</code>' -replace '\*\*([^*]+)\*\*', '<strong>$1</strong>' -replace '\*([^*]+)\*', '<em>$1</em>' -replace '^# (.*?)$', '<h1>$1</h1>' -replace '^## (.*?)$', '<h2>$1</h2>' -replace '^### (.*?)$', '<h3>$1</h3>' -replace '!\[([^\]]*)\]\(([^)]+)\)', '<img src="$2" alt="$1">' -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>')
</body>
</html>"

    # Save HTML file
    $html | Out-File -FilePath $htmlFile -Encoding utf8
    Write-Host "Created: $htmlFile"
}

Write-Host "\nConversion complete! HTML files have been saved to: $reportsPath"
