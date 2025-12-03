# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  TOGETHERSYSTEMS DOCKERFILE                                               ║
# ║  [.TTT T,.&T,,.T,,,.T.] INTERNATIONAL TTT                                 ║
# ║                                                                           ║
# ║  Reproduzierbarer Build-Container                                         ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# ═══════════════════════════════════════════════════════════════════════════════
# STAGE 1: BUILD
# ═══════════════════════════════════════════════════════════════════════════════
FROM pandoc/core:3.1 AS builder

# Installiere zusätzliche Tools
RUN apk add --no-cache \
    bash \
    coreutils \
    findutils \
    git \
    nodejs \
    npm \
    python3

WORKDIR /site

# Kopiere Projektdateien
COPY . .

# Mache Skripte ausführbar
RUN chmod +x scripts/*.sh 2>/dev/null || true

# Baue Docs
RUN ./scripts/build_docs.sh .

# ═══════════════════════════════════════════════════════════════════════════════
# STAGE 2: SERVE
# ═══════════════════════════════════════════════════════════════════════════════
FROM python:3.11-alpine AS server

WORKDIR /app

# Kopiere Build-Artefakte
COPY --from=builder /site/docs_build /app/docs_build

# Expose Port
EXPOSE 8080

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Starte Python HTTP Server
CMD ["python3", "-m", "http.server", "8080", "--directory", "/app/docs_build", "--bind", "0.0.0.0"]

# ═══════════════════════════════════════════════════════════════════════════════
# LABELS
# ═══════════════════════════════════════════════════════════════════════════════
LABEL maintainer="Raymond Demitrio Tel <gentlyoverdone@outlook.com>"
LABEL org.opencontainers.image.title="TogetherSystems"
LABEL org.opencontainers.image.description="[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT"
LABEL org.opencontainers.image.url="https://github.com/Myopenai/togethersystems"
LABEL org.opencontainers.image.source="https://github.com/Myopenai/togethersystems"
LABEL org.opencontainers.image.vendor="TogetherSystems International TTT"

