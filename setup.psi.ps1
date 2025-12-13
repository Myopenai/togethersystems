# Create the setup.ps1 file
@'
# Create directory structure
Write-Host "📂 Creating directory structure..." -ForegroundColor Cyan
$directories = @(
    "src\components",
    "src\pages",
    "src\services",
    "src\utils",
    "src\context",
    "tests\__tests__",
    "scripts",
    "db",
    "public\css",
    "public\js",
    "public\images"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Initialize npm
Write-Host "📦 Initializing npm project..." -ForegroundColor Cyan
npm init -y | Out-Null

# Install dependencies
Write-Host "🔧 Installing dependencies..." -ForegroundColor Cyan
npm install express sqlite3 cors helmet morgan dotenv --save
npm install --save-dev nodemon jest supertest

# Create .env file
Write-Host "🔑 Creating .env file..." -ForegroundColor Cyan
@"
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
"@ | Out-File -FilePath ".env" -Encoding utf8

# Create server.js
Write-Host "💻 Creating server.js..." -ForegroundColor Cyan
@"
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database('./db/kean.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/regions', (req, res) => {
  db.all('SELECT * FROM regions', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:${PORT}\`);
});

module.exports = { app, db, server };
"@ | Out-File -FilePath "src\server.js" -Encoding utf8

# Create seed script
Write-Host "🌱 Creating database seed script..." -ForegroundColor Cyan
@"
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/kean.db');

// Create tables
db.serialize(() => {
  db.run(\`DROP TABLE IF EXISTS forum_topics\`);
  db.run(\`DROP TABLE IF EXISTS projects\`);
  db.run(\`DROP TABLE IF EXISTS regions\`);
  db.run(\`DROP TABLE IF EXISTS users\`);

  // Create regions table
  db.run(\`CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
  )\`);

  // Create projects table
  db.run(\`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('planning', 'in_progress', 'compliance', 'completed')),
    region_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
  )\`);

  // Create users table
  db.run(\`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )\`);

  // Create forum_topics table
  db.run(\`CREATE TABLE IF NOT EXISTS forum_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )\`);

  console.log('✅ Created database tables');

  // Insert sample data
  const regions = [
    { name: 'Nijmegen', slug: 'nijmegen', description: 'A vibrant city in the Netherlands' },
    { name: 'Arnhem', slug: 'arnhem', description: 'Capital of Gelderland province' },
    { name: 'Cleve', slug: 'cleve', description: 'Historic German town near the Dutch border' }
  ];

  const insertRegion = db.prepare('INSERT INTO regions (name, slug, description) VALUES (?, ?, ?)');
  regions.forEach(region => {
    insertRegion.run(region.name, region.slug, region.description);
  });
  insertRegion.finalize();

  // Insert a test user
  db.run(
    \"INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)\",
    ['testuser', 'test@example.com', 'hashed_password_placeholder'],
    function(err) {
      if (err) return console.error('❌ Error inserting user:', err);
      
      const userId = this.lastID;
      
      // Insert projects
      const projects = [
        { 
          title: 'City Center Renovation', 
          description: 'Revitalizing the historic city center with modern infrastructure', 
          status: 'in_progress',
          region_id: 1
        },
        { 
          title: 'Bike Lane Expansion', 
          description: 'Adding 20km of new bike lanes across the city', 
          status: 'planning',
          region_id: 2
        }
      ];

      const insertProject = db.prepare('INSERT INTO projects (title, description, status, region_id) VALUES (?, ?, ?, ?)');
      projects.forEach(project => {
        insertProject.run(project.title, project.description, project.status, project.region_id);
      });
      insertProject.finalize();

      // Insert forum topics
      const topics = [
        {
          title: 'Welcome to KEAN Platform',
          content: 'Introduce yourself and share your thoughts about the platform',
          user_id: userId,
          category: 'General Discussion'
        }
      ];

      const insertTopic = db.prepare('INSERT INTO forum_topics (title, content, user_id, category) VALUES (?, ?, ?, ?)');
      topics.forEach(topic => {
        insertTopic.run(topic.title, topic.content, topic.user_id, topic.category);
      });
      insertTopic.finalize();

      console.log('✅ Sample data inserted successfully!');
    }
  );
});

db.close();
"@ | Out-File -FilePath "scripts\seed.js" -Encoding utf8

# Create test file
Write-Host "🧪 Creating test file..." -ForegroundColor Cyan
@"
const request = require('supertest');
const { app, server } = require('../../src/server');

describe('API Endpoints', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/health', () => {
    it('should return server status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /api/regions', () => {
    it('should return all regions', async () => {
      const res = await request(app).get('/api/regions');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });
});
"@ | Out-File -FilePath "tests\__tests__\api.test.js" -Encoding utf8

# Create index.html
Write-Host "🌐 Creating index.html..." -ForegroundColor Cyan
@"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KEAN Platform</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <h1>Welcome to KEAN Platform</h1>
    <p>Your development server is running! 🚀</p>
    
    <div class="status">
        <strong>API Status:</strong> 
        <span id="api-status">Checking...</span>
    </div>

    <h2>Available Endpoints</h2>
    <ul>
        <li><a href="/api/health" target="_blank">/api/health</a> - Check API status</li>
        <li><a href="/api/regions" target="_blank">/api/regions</a> - List all regions</li>
    </ul>

    <script>
        // Check API status
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                document.getElementById('api-status').textContent = 
                    data.status === 'ok' ? '✅ Running' : '❌ Error';
            })
            .catch(() => {
                document.getElementById('api-status').textContent = 
                    '❌ Could not connect to API';
            });
    </script>
</body>
</html>
"@ | Out-File -FilePath "public\index.html" -Encoding utf8

# Create CSS file
Write-Host "🎨 Creating styles..." -ForegroundColor Cyan
@"
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1, h2, h3 {
    color: #2c3e50;
}

a {
    color: #3498db;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.container {
    padding: 20px;
}

.status {
    padding: 10px;
    background: #e8f5e9;
    border-left: 4px solid #4caf50;
    margin: 20px 0;
}
"@ | Out-File -FilePath "public\css\styles.css" -Encoding utf8

# Update package.json
Write-Host "📝 Updating package.json..." -ForegroundColor Cyan
@"
{
  \"name\": \"kean-platform\",
  \"version\": \"1.0.0\",
  \"description\": \"KEAN Platform - Connecting Communities\",
  \"main\": \"src/server.js\",
  \"scripts\": {
    \"start\": \"node src/server.js\",
    \"dev\": \"nodemon src/server.js\",
    \"test\": \"jest --detectOpenHandles\",
    \"seed\": \"node scripts/seed.js\"
  },
  \"keywords\": [],
  \"author\": \"\",
  \"license\": \"ISC\",
  \"dependencies\": {
    \"cors\": \"^2.8.5\",
    \"dotenv\": \"^16.0.3\",
    \"express\": \"^4.18.2\",
    \"helmet\": \"^7.0.0\",
    \"morgan\": \"^1.10.0\",
    \"sqlite3\": \"^5.1.6\"
  },
  \"devDependencies\": {
    \"jest\": \"^29.5.0\",
    \"nodemon\": \"^2.0.22\",
    \"supertest\": \"^6.3.3\"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8

# Create README.md
Write-Host "📖 Creating README.md..." -ForegroundColor Cyan
@"
# KEAN Platform

A platform for connecting communities across borders.

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm (v6+)

### Installation
1. Clone the repository
2. Run the setup script in PowerShell:
   \`\`\`powershell
   .\setup.ps1
   \`\`\`

### Available Scripts
- \`npm start\` - Start the server in production mode
- \`npm run dev\` - Start the server in development mode with hot-reload
- \`npm test\` - Run tests
- \`npm run seed\` - Seed the database with sample data

### API Endpoints
- \`GET /api/health\` - Health check
- \`GET /api/regions\` - Get all regions

## License
This project is licensed under the ISC License.
"@ | Out-File -FilePath "README.md" -Encoding utf8

Write-Host \"`n✨ Setup complete! ✨\" -ForegroundColor Green
Write-Host \"`nTo start the development server, run:\" -ForegroundColor Cyan
Write-Host \"  npm run dev\" -ForegroundColor Yellow
Write-Host \"`nThen open http://localhost:3000 in your browser\" -ForegroundColor Cyan
Write-Host \"`nTo run tests:\" -ForegroundColor Cyan
Write-Host \"  npm test\" -ForegroundColor Yellow
Write-Host \"`nTo seed the database:\" -ForegroundColor Cyan
Write-Host \"  npm run seed\" -ForegroundColor Yellow
Write-Host \"`nHappy coding! 🚀\" -ForegroundColor Green
'@ | Out-File -FilePath "setup.ps1" -Encoding utf8

# Run the setup script
Write-Host "🚀 Running setup script..." -ForegroundColor Green
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\setup.ps1