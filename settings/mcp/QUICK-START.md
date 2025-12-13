# MCP Quick Start Guide

## ✅ Current Status

**Fabrikation Centrale is CONNECTED and ready to use!**

---

## 🚀 Quick Commands

### Check MCP Status
```bash
# View registry
cat settings/mcp/mcp-registry.json

# Or use Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync('settings/mcp/mcp-registry.json', 'utf-8')))"
```

### Connect to Fabrikation Centrale
```bash
node settings/mcp/connect-fabrikation-centrale-simple.js
```

### Detect All Available MCPs
```bash
node settings/mcp/detect-all-mcps.js
```

---

## 📋 Available MCP Capabilities

### Fabrikation Centrale (Connected)

**Factory Operations:**
- `factory_build` - Build factory artifacts
- `factory_validate` - Validate configurations  
- `factory_deploy` - Deploy outputs
- `factory_monitor` - Monitor operations
- `factory_audit` - Audit processes

**Manifest & Pipeline:**
- `manifest_parse` - Parse manifest files
- `pipeline_execute` - Execute pipelines
- `toolchain_detect` - Detect toolchains

**Security & Compliance:**
- `sbom_generate` - Generate SBOM
- `provenance_sign` - Sign attestations

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `settings/config/mcp-config.json` | Basic MCP server configuration |
| `settings/config/mcp-config-extended.json` | Extended tool registry with dimensions |
| `settings/mcp/mcp-registry.json` | Active MCP registry |
| `settings/schemas/mcp.tool.json` | JSON schema for MCP tools |

---

## 📊 System Information

- **Total MCPs:** 1
- **Connected:** 1 (Fabrikation Centrale)
- **Available:** 1
- **XXXXL MCPs:** 1

---

## 🌐 Network Endpoints

### Localhost
- **Fabrikation Centrale:** `http://localhost:8080`

### Cloudflare Functions (Available)
- `/api/presence/*` - Presence API
- `/api/telbank/*` - Telbank services
- `/api/voucher/*` - Voucher management
- `/api/mortgage/*` - Mortgage services
- `/api/contracts/*` - Contract management
- `/api/mcp/*` - MCP endpoints

---

## 📝 Next Steps

1. **Use Fabrikation Centrale:**
   - Access factory operations via MCP
   - Execute factory pipelines
   - Generate SBOMs and attestations

2. **Discover More MCPs:**
   - Run `detect-all-mcps.js` to find all available MCPs
   - Check Cloudflare Functions for API endpoints
   - Scan local Node.js servers

3. **Monitor Status:**
   - Check `mcp-registry.json` for current status
   - Review `MCP-SYSTEM-OVERVIEW.md` for details

---

## 🔗 Documentation

- [MCP System Overview](./MCP-SYSTEM-OVERVIEW.md)
- [Connection Status](./MCP-CONNECTION-STATUS.md)
- [Industrial Factory Guide](../../Farbriqautions/TTT/INDUSTRIAL-FACTORY-GUIDE.md)

---

**Last Updated:** 2025-01-27


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
