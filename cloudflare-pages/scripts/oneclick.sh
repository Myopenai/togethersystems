#!/usr/bin/env bash
set -euo pipefail

echo "==> One-click: scaffold, normalize UTF-8/NFC, checksum, zip, publish (Cloudflare Pages)"
ROOT="$(pwd)"

# 1) Ensure structure
mkdir -p public/assets public/downloads functions/api/voucher functions/api/presence scripts

# 2-6) Files already created, skip

# 7) NFC normalize (UTF-8 umlauts)
echo "==> Normalizing UTF-8/NFC..."
if command -v node &> /dev/null; then
  node -e "
  const fs=require('fs'),p=require('path');
  function norm(f){const t=fs.readFileSync(f,'utf8').normalize('NFC');fs.writeFileSync(f,t,'utf8');}
  function walk(d){for(const f of fs.readdirSync(d)){const x=p.join(d,f);const s=fs.statSync(x);if(s.isDirectory())walk(x);else if(/\.(html|css|js|json|txt|toml)$/i.test(f))norm(x);}}
  walk('public'); walk('functions'); walk('.');
  console.log('NFC normalization complete.');
  "
else
  echo "  ⚠️  Node.js not found, skipping NFC normalization"
fi

# 8) Generate checksums.json and bundle.zip
echo "==> Generating checksums and bundle zip"
cd public/downloads

# checksums
if command -v python3 &> /dev/null; then
  python3 - <<'PY' || true
import os, json, hashlib
def sha256(path):
  h=hashlib.sha256()
  with open(path,'rb') as f:
    for chunk in iter(lambda: f.read(8192), b''):
      h.update(chunk)
  return h.hexdigest()
files=[f for f in os.listdir('.') if os.path.isfile(f) and f != 'bundle.zip' and f != 'checksums.json']
data={f: sha256(f) for f in files}
with open('checksums.json','w',encoding='utf-8') as w:
  json.dump(data,w,ensure_ascii=False,indent=2)
print('checksums.json written')
PY
else
  echo "  ⚠️  Python3 not found, skipping checksums generation"
fi

# zip bundle (all downloads except bundle.zip and checksums.json)
if command -v zip &> /dev/null; then
  rm -f bundle.zip
  zip -qr bundle.zip . -x "bundle.zip" -x "checksums.json" || true
  echo "  ✅ bundle.zip created"
else
  echo "  ⚠️  zip command not found, skipping bundle creation"
fi

cd "$ROOT"

echo ""
echo "==> All set. To publish:"
echo "   1) npm install"
echo "   2) npm run publish"
echo "Local dev (Functions + static): npm run dev"
