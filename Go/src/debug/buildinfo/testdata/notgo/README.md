notgo.base64 is a base64-encoded C hello world binary used to test
debug/buildinfo errors on non-Go binaries.

The binary is base64 encoded to hide it from security scanners that might not
like it.

Generate notgo.base64 on linux-amd64 with:

$ cc -o notgo main.c
$ base64 notgo > notgo.base64
$ rm notgo

The current binary was built with "gcc version 14.2.0 (Debian 14.2.0-3+build4)".

TODO(prattmic): Ideally this would be built on the fly to better cover all
executable formats, but then we need to encode the intricacies of calling each
platform's C compiler.


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
