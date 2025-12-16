const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false
});

const docsPath = path.join(__dirname, 'docs');
const reportsPath = path.join(__dirname, 'reports');

// Create reports directory if it doesn't exist
if (!fs.existsSync(reportsPath)) {
  fs.mkdirSync(reportsPath, { recursive: true });
  console.log(`Created directory: ${reportsPath}`);
}

// HTML template
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: #2c3e50;
    }
    h1 { font-size: 2.2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.8em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h3 { font-size: 1.5em; }
    p { margin: 1em 0; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      padding: 0.2em 0.4em;
      font-size: 85%;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 16px;
      overflow: auto;
      line-height: 1.45;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }
    blockquote {
      border-left: 4px solid #dfe2e5;
      color: #6a737d;
      padding: 0 1em;
      margin: 0 0 16px 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    img {
      max-width: 100%;
      box-sizing: content-box;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

// Process all markdown files
fs.readdir(docsPath, (err, files) => {
  if (err) {
    console.error('Error reading docs directory:', err);
    process.exit(1);
  }

  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  if (mdFiles.length === 0) {
    console.log('No markdown files found in the docs directory.');
    return;
  }

  console.log(`Found ${mdFiles.length} markdown files to convert.`);
  
  mdFiles.forEach(file => {
    const mdFilePath = path.join(docsPath, file);
    const htmlFileName = path.basename(file, '.md') + '.html';
    const htmlFilePath = path.join(reportsPath, htmlFileName);
    
    try {
      // Read markdown file
      const markdown = fs.readFileSync(mdFilePath, 'utf8');
      
      // Convert markdown to HTML
      const content = marked(markdown);
      const title = path.basename(file, '.md').replace(/[-_]/g, ' ');
      const html = htmlTemplate(title, content);
      
      // Write HTML file
      fs.writeFileSync(htmlFilePath, html, 'utf8');
      console.log(`Converted: ${file} -> ${htmlFileName}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  console.log('\nConversion complete!');
  console.log(`HTML files have been saved to: ${reportsPath}`);
});
