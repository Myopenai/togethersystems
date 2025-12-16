const fs = require('fs');
const path = require('path');

function walk(dir, exts, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full, exts, cb);
    } else {
      if (exts.includes(path.extname(entry.name))) cb(full);
    }
  }
}

function cleanFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('```')) return false;

  // Remove leading and trailing code fences if present
  // Remove any lines that are exactly ``` or ```lang
  const lines = content.split(/\r?\n/);
  const filtered = lines.filter((ln, idx) => {
    const t = ln.trim();
    if (t.startsWith('```')) return false;
    return true;
  });

  const newContent = filtered.join('\n');
  const outFile = file + '.cleaned';
  fs.writeFileSync(outFile, newContent, 'utf8');
  console.log('Created cleaned file:', outFile);
  return true;
}

const root = process.cwd();
const exts = ['.ps1', '.js', '.ts'];
walk(root, exts, (file) => {
  try {
    cleanFile(file);
  } catch (err) {
    console.error('Error cleaning', file, err.message);
  }
});

console.log('Done scanning. Cleaned files have ".cleaned" suffix. Review before replacing originals.');
