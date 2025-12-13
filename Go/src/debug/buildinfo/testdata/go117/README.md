go117.base64 is a base64-encoded Go 1.17 hello world binary used to test
debug/buildinfo of pre-1.18 buildinfo encoding.

The binary is base64 encoded to hide it from security scanners that believe a
Go 1.17 is inherently insecure.

Generate go117.base64 with:

$ GOTOOLCHAIN=go1.17 GOOS=linux GOARCH=amd64 go build -trimpath
$ base64 go117 > go117.base64
$ rm go117

TODO(prattmic): Ideally this would be built on the fly to better cover all
executable formats, but then we need a network connection to download an old Go
toolchain.


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
