import fs from 'node:fs';

if (!fs.existsSync('index.html')) {
  console.error('[lint] index.html missing'); process.exit(1);
}

console.log('[lint] OK');

