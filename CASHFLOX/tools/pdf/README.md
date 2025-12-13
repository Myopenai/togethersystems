# Fabrikage PDF Processor

Redact text across a PDF (e.g., “6544 WS”, “NIJMEGEN”), add a Fabrikage header/logo, and stamp metadata + report.

Requirements (Windows/PowerShell 7):

```powershell
python --version
pip install -r tools/pdf/requirements.txt
```

Usage:

```powershell
# Example: replace the file name below with your RABO PDF path
$in  = "D:\path\RA_A_NL42RABO0157848272_EUR_20250101_20251204.pdf"
$out = "D:\path\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf"

python tools/pdf/fabrikage_pdf.py `
  --input  $in `
  --output $out `
  --config "config/fabrikage_pdf.config.json"
```

One‑shot (installs Python 3.12 if needed, creates venv, installs deps, runs tool):

```powershell
.\tools\pdf\run_fabrikage_pdf.ps1 `
  -Input  "D:\path\RA_A_NL42RABO0157848272_EUR_20250101_20251204.pdf" `
  -Output "D:\path\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf"
```

Results:
- Output PDF with removed text fragments and Fabrikage header.
- Side-car JSON report: same name as output with `.report.json`, including SHA-256 and stamp.

Notes:
- Configure patterns and header in `config/fabrikage_pdf.config.json`.
- To use a custom logo image, set `"logo.path"` to an existing image path (PNG recommended).
- The tool preserves original content; redaction is done via overlay redactions.
```json
{
  "remove_text_patterns": ["6544 WS", "NIJMEGEN"],
  "header": { "enabled": true, "label": "FABRIKAGE — TogetherSystems" }
}
```


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
