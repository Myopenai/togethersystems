// fix-umlauts-and-encoding.js
// Node.js script to fix umlaut and encoding errors in HTML, JS, and MD files (including OSTOSOS and root)
// Usage: node fix-umlauts-and-encoding.js

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const exts = ['.html', '.js', '.md'];
const replacements = [
  ['ä', 'ä'], ['Ä', 'Ä'], ['ö', 'ö'], ['Ö', 'Ö'],
  ['ü', 'ü'], ['Ü', 'Ü'], ['ß', 'ß'],
  ['à', 'à'], ['á', 'á'], ['â', 'â'], ['ã', 'ã'],
  ['é', 'é'], ['è', 'è'], ['ê', 'ê'], ['ë', 'ë'],
  ['ù', 'ù'], ['ú', 'ú'], ['û', 'û'], ['ñ', 'ñ'],
  ['❌', '❌'], ['–', '–'], ['—', '—'], ['„', '„'],
  ['“', '“'], ['”', '”'], ['‘', '‘'], ['’', '’'],
  ['•', '•'], ['…', '…'], ['€', '€'], ['', ''],
  ['', '']
];

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (exts.includes(path.extname(file).toLowerCase())) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

const files = walk(rootDir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  replacements.forEach(([from, to]) => {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
console.log('All umlaut and encoding errors fixed in HTML/JS/MD files.');
