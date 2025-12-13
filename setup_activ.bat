# Create the setup.ps1 file
@'
# IBM Standard Node.js Application Setup
$IBM_APP_NAME = "kean-platform"
$IBM_APP_PORT = 3000

# Create basic directory structure
$directories = @(
    "src",
    "src/controllers",
    "src/middleware",
    "src/models",
    "src/routes",
    "src/utils",
    "test/unit",
    "test/integration",
    "logs"
)

# Create directories
Write-Host "📂 Creating directory structure..." -ForegroundColor Cyan
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Initialize npm project
Write-Host "📦 Initializing Node.js project..." -ForegroundColor Cyan
npm init -y | Out-Null

# Install basic dependencies
Write-Host "🔧 Installing dependencies..." -ForegroundColor Cyan
npm install express helmet cors dotenv winston | Out-Null
npm install --save-dev nodemon jest supertest | Out-Null

# Create .env file
Write-Host "🔑 Creating .env file..." -ForegroundColor Cyan
@"
# Server Configuration
PORT=$IBM_APP_PORT
NODE_ENV=development

# Security
JWT_SECRET=$([guid]::NewGuid())
PASSWORD_SALT_ROUNDS=10

# Logging
LOG_LEVEL=info
"@ | Out-File -FilePath ".env" -Encoding utf8

# Create basic server.js
Write-Host "💻 Creating server.js..." -ForegroundColor Cyan
@"
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || $IBM_APP_PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// Start server
app.listen(PORT, () => {
    console.log(\`Server is running on http://localhost:\${PORT}\`);
});
"@ | Out-File -FilePath "src/server.js" -Encoding utf8

# Create basic package.json
Write-Host "📝 Updating package.json..." -ForegroundColor Cyan
@"
{
  \"name\": \"$IBM_APP_NAME\",
  \"version\": \"1.0.0\",
  \"description\": \"KEAN Platform - IBM Standard\",
  \"main\": \"src/server.js\",
  \"scripts\": {
    \"start\": \"node src/server.js\",
    \"dev\": \"nodemon src/server.js\",
    \"test\": \"jest\"
  },
  \"dependencies\": {
    \"cors\": \"^2.8.5\",
    \"dotenv\": \"^16.0.3\",
    \"express\": \"^4.18.2\",
    \"helmet\": \"^7.0.0\",
    \"winston\": \"^3.8.2\"
  },
  \"devDependencies\": {
    \"jest\": \"^29.5.0\",
    \"nodemon\": \"^2.0.22\",
    \"supertest\": \"^6.3.3\"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8

Write-Host "`n✨ Setup complete! ✨" -ForegroundColor Green
Write-Host "`nTo start the development server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "`nThen open http://localhost:$IBM_APP_PORT/health in your browser" -ForegroundColor Cyan
'@ | Out-File -FilePath "setup.ps1" -Encoding utf8

Write-Host "✅ setup.ps1 created successfully!" -ForegroundColor Green