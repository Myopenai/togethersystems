# Sicherheit — Richtlinie (DE)

Ziele:
- Kryptoebenen: AES‑256, ChaCha20‑Poly1305, RSA‑4096, ECC.
- Geheimnisse niemals im Klartext commiten.
- Integrität über Hashes/Signaturen prüfen (STAMP‑SHA256).

Prüfpunkte (Auszug):
- Abhängigkeiten signieren/verifizieren (SBOM/Attestations).
- Prinzip der geringsten Rechte (Least Privilege).
- Eingaben validieren, Ausgaben escapen.


