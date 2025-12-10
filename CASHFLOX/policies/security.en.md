# Security — Policy (EN)

Goals:
- Crypto layers: AES‑256, ChaCha20‑Poly1305, RSA‑4096, ECC.
- Never commit secrets in clear text.
- Verify integrity via hashes/signatures (STAMP‑SHA256).

Checks (excerpt):
- Sign/verify dependencies (SBOM/attestations).
- Principle of least privilege.
- Validate inputs, escape outputs.


