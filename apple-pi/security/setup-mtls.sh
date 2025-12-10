#!/bin/bash
# mTLS Setup für Apple-Pi System
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

set -e

CA_DIR="/opt/apple-pi/security/ca"
CERT_DIR="/opt/apple-pi/security/certs"

echo "═══════════════════════════════════════════════════════════"
echo "  APPLE-PI mTLS SETUP"
echo "  Version: 3.0.0"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verzeichnisse erstellen
mkdir -p $CA_DIR $CERT_DIR

# CA erstellen
echo "🔐 Erstelle Certificate Authority (CA)..."
openssl genrsa -out $CA_DIR/ca-key.pem 4096
openssl req -new -x509 -days 3650 -key $CA_DIR/ca-key.pem -out $CA_DIR/ca-cert.pem \
    -subj "/CN=Apple-Pi CA/O=TogetherSystems/C=DE"

# Server-Zertifikat
echo "🔐 Erstelle Server-Zertifikat..."
openssl genrsa -out $CERT_DIR/server-key.pem 4096
openssl req -new -key $CERT_DIR/server-key.pem -out $CERT_DIR/server.csr \
    -subj "/CN=apple-pi.local/O=TogetherSystems/C=DE"

openssl x509 -req -days 365 -in $CERT_DIR/server.csr -CA $CA_DIR/ca-cert.pem \
    -CAkey $CA_DIR/ca-key.pem -CAcreateserial -out $CERT_DIR/server-cert.pem

# Client-Zertifikat (Beispiel)
echo "🔐 Erstelle Client-Zertifikat..."
openssl genrsa -out $CERT_DIR/client-key.pem 4096
openssl req -new -key $CERT_DIR/client-key.pem -out $CERT_DIR/client.csr \
    -subj "/CN=mac-client/O=TogetherSystems/C=DE"

openssl x509 -req -days 365 -in $CERT_DIR/client.csr -CA $CA_DIR/ca-cert.pem \
    -CAkey $CA_DIR/ca-key.pem -CAcreateserial -out $CERT_DIR/client-cert.pem

# PKCS12 für macOS/iOS
echo "🔐 Erstelle PKCS12 für macOS/iOS..."
openssl pkcs12 -export -out $CERT_DIR/client.p12 -inkey $CERT_DIR/client-key.pem \
    -in $CERT_DIR/client-cert.pem -certfile $CA_DIR/ca-cert.pem -passout pass:

echo ""
echo "✅ mTLS Setup abgeschlossen"
echo ""
echo "📁 Zertifikate:"
echo "   CA: $CA_DIR/ca-cert.pem"
echo "   Server: $CERT_DIR/server-cert.pem"
echo "   Client: $CERT_DIR/client-cert.pem"
echo "   Client (PKCS12): $CERT_DIR/client.p12"
echo ""
echo "📱 macOS/iOS Installation:"
echo "   1. Öffne $CERT_DIR/client.p12"
echo "   2. Installiere in Keychain"
echo "   3. Markiere als vertrauenswürdig"
echo ""
echo "BRANDING: .T. TogetherSystems - ModularFlux Architecture"
echo "STANDARD: IBM STANDARD - PERMANENT AKTIV"


