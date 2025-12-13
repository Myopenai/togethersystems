We have been working inside Google on a fork of Go that uses
BoringCrypto (the core of [BoringSSL](https://boringssl.googlesource.com/boringssl/))
for various crypto primitives, in furtherance of some work related to FIPS 140.
We have heard that some external users of Go would be
interested in this code as well, so we have published this code
here in the main Go repository behind the setting GOEXPERIMENT=boringcrypto.

Use of GOEXPERIMENT=boringcrypto outside Google is _unsupported_.
This mode is not part of the [Go 1 compatibility rules](https://go.dev/doc/go1compat),
and it may change incompatibly or break in other ways at any time.

To be clear, we are not making any statements or representations about
the suitability of this code in relation to the FIPS 140 standard.
Interested users will have to evaluate for themselves whether the code
is useful for their own purposes.

---

This directory holds the core of the BoringCrypto implementation
as well as the build scripts for the module itself: syso/*.syso.

syso/goboringcrypto_linux_amd64.syso is built with:

	GOARCH=amd64 ./build.sh

syso/goboringcrypto_linux_arm64.syso is built with:

	GOARCH=arm64 ./build.sh

Both run using Docker.

For the arm64 build to run on an x86 system, you need

	apt-get install qemu-user-static qemu-binfmt-support

to allow the x86 kernel to run arm64 binaries via QEMU.

For the amd64 build to run on an Apple Silicon macOS, you need Rosetta 2.

See build.sh for more details about the build.


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
