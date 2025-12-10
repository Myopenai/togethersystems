#!/bin/bash
# PostgreSQL/MariaDB Setup für Apple-Pi System
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

set -e

DB_TYPE="${1:-postgresql}"  # postgresql oder mariadb
DB_NAME="apple_pi"
DB_USER="apple_pi_user"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"

echo "═══════════════════════════════════════════════════════════"
echo "  APPLE-PI DATABASE SETUP"
echo "  Version: 3.0.0"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$DB_TYPE" = "postgresql" ]; then
    echo "📊 Installiere PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    
    echo "🔧 Erstelle Datenbank und Benutzer..."
    sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
    
    echo "✅ PostgreSQL Setup abgeschlossen"
    echo "   Datenbank: $DB_NAME"
    echo "   Benutzer: $DB_USER"
    echo "   Passwort: $DB_PASSWORD"
    
elif [ "$DB_TYPE" = "mariadb" ]; then
    echo "📊 Installiere MariaDB..."
    sudo apt-get update
    sudo apt-get install -y mariadb-server
    
    echo "🔧 Erstelle Datenbank und Benutzer..."
    sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    echo "✅ MariaDB Setup abgeschlossen"
    echo "   Datenbank: $DB_NAME"
    echo "   Benutzer: $DB_USER"
    echo "   Passwort: $DB_PASSWORD"
else
    echo "❌ Unbekannter DB-Typ: $DB_TYPE"
    echo "   Verwende: postgresql oder mariadb"
    exit 1
fi

echo ""
echo "📝 Erstelle Tabellen..."
psql -h localhost -U $DB_USER -d $DB_NAME -f schema.sql 2>/dev/null || \
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < schema.sql 2>/dev/null || \
echo "⚠️ Schema-Datei nicht gefunden - Tabellen müssen manuell erstellt werden"

echo ""
echo "✅ Datenbank-Setup abgeschlossen"
echo ""
echo "BRANDING: .T. TogetherSystems - ModularFlux Architecture"
echo "STANDARD: IBM STANDARD - PERMANENT AKTIV"


