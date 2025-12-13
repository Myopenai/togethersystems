# Cloudflare Pages Portal: One-Click, Plug-and-Play Code Bundle

Complete, copy-paste code for a Cloudflare Pages project with:

- Portal pages (index, manifest) using .T. branding
- Voucher and Presence APIs via Pages Functions
- A downloads hub with checksums and a one-click zip download
- UTF-8/NFC normalization for proper umlauts
- A single script to scaffold, checksum, zip, and publish

## Project Structure

```
cloudflare-pages/
├── public/
│   ├── index.html
│   ├── manifest-portal.html
│   ├── assets/
│   │   └── osoto.css
│   └── downloads/
│       ├── index.html
│       ├── README.txt
│       ├── sample.txt
│       ├── checksums.json (auto-generated)
│       └── bundle.zip (auto-generated)
├── functions/
│   └── api/
│       ├── voucher/
│       │   ├── list.js
│       │   └── redeem.js
│       └── presence/
│           └── status.js
├── scripts/
│   ├── oneclick.sh (Linux/macOS)
│   └── oneclick.ps1 (Windows)
├── wrangler.toml
├── package.json
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run One-Click Script

**Linux/macOS:**
```bash
chmod +x scripts/oneclick.sh
bash scripts/oneclick.sh
```

**Windows:**
```powershell
pwsh -ExecutionPolicy Bypass -File scripts/oneclick.ps1
```

### 3. Publish to Cloudflare Pages

```bash
npm run publish
```

### 4. Local Development

```bash
npm run dev
```

## Features

- ✅ Portal pages with .T. branding
- ✅ Voucher API (`/api/voucher/list`, `/api/voucher/redeem`)
- ✅ Presence API (`/api/presence/status`)
- ✅ Downloads hub with checksums
- ✅ One-click bundle download
- ✅ UTF-8/NFC normalization for proper umlauts
- ✅ Responsive design
- ✅ Dark theme with gradient backgrounds

## URLs

After publishing, your Cloudflare Pages site will be available at:

- `/` - Main dashboard
- `/manifest-portal.html` - Manifest portal
- `/downloads/` - Downloads hub
- `/api/voucher/list` - List vouchers
- `/api/voucher/redeem?id=v-100` - Redeem voucher
- `/api/presence/status` - Presence status

## Customization

- Edit `public/assets/osoto.css` for styling
- Modify `functions/api/*.js` for API logic
- Add files to `public/downloads/` for downloads
- Run the one-click script to regenerate checksums and bundle

## License

[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT


---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---
