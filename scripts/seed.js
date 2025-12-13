const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/kean.db');

// Create tables
db.serialize(() => {
  // Drop existing tables if they exist
  db.run(\DROP TABLE IF EXISTS forum_topics\);
  db.run(\DROP TABLE IF EXISTS projects\);
  db.run(\DROP TABLE IF EXISTS regions\);
  db.run(\DROP TABLE IF EXISTS users\);

  // Create regions table
  db.run(\CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
  )\);

  // Create projects table
  db.run(\CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('planning', 'in_progress', 'compliance', 'completed')),
    region_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
  )\);

  // Create users table
  db.run(\CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )\);

  // Create forum_topics table
  db.run(\CREATE TABLE IF NOT EXISTS forum_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )\);

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
