# 📊 Logging-System - Digitales Notariat

## 🔍 Übersicht

Das Digitales Notariat verfügt über ein umfassendes Logging-System, das kontinuierlich alle Systemaktivitäten überwacht und protokolliert.

---

## 🚀 Installation & Start

### One-Click Installation
```bash
# Windows
install.bat

# Linux/macOS
chmod +x install.sh
./install.sh
```

### Manuelle Installation
```bash
# Abhängigkeiten installieren
pnpm install

# Entwicklungsserver starten
pnpm run dev
```

---

## 📁 Log-Struktur

### Verzeichnisstruktur
```
Notar/
├── logs/                          # Log-Verzeichnis
│   ├── notariat-2025-01-02.log   # Tages-Logs
│   ├── notariat-2025-01-03.log   # Tages-Logs
│   └── ...                        # Weitere Log-Dateien
├── logger.js                      # Logging-System
├── install.bat                    # Windows Install-Skript
├── install.sh                     # Linux/macOS Install-Skript
└── LOGGING.md                     # Diese Dokumentation
```

### Log-Datei Format
```json
{
  "timestamp": "2025-01-02T10:30:00.000Z",
  "level": "INFO",
  "message": "System Status",
  "data": {
    "memory": {
      "rss": 12345678,
      "heapTotal": 9876543,
      "heapUsed": 5432109
    },
    "uptime": 3600,
    "pid": 1234,
    "nodeVersion": "v18.17.0",
    "platform": "win32",
    "arch": "x64"
  },
  "pid": 1234,
  "memory": {...},
  "uptime": 3600
}
```

---

## 🔧 Logging-Funktionen

### Log-Level
- **INFO** (Blau): Allgemeine Informationen
- **SUCCESS** (Grün): Erfolgreiche Operationen
- **WARNING** (Gelb): Warnungen
- **ERROR** (Rot): Fehler
- **DEBUG** (Cyan): Debug-Informationen

### Spezielle Logging-Funktionen

#### System-Monitoring
```javascript
logger.logSystemStatus();
// Loggt: Memory, Uptime, PID, Node.js Version, Platform, etc.
```

#### Performance-Monitoring
```javascript
logger.logPerformance('database_query', 150, { 
  table: 'clients', 
  records: 1000 
});
```

#### Security-Logging
```javascript
logger.logSecurity('login_attempt', {
  ip: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  success: false
});
```

#### Database-Logging
```javascript
logger.logDatabase('insert_record', {
  table: 'notarial_records',
  recordId: 'abc123',
  type: 'identity_verification'
});
```

#### Backup-Logging
```javascript
logger.logBackup('automatic', {
  records: 1500,
  size: '2.5MB',
  checksum: 'abc123def456'
});
```

#### 2FA-Logging
```javascript
logger.log2FA('verification_success', {
  action: 'document_notarization',
  ip: '192.168.1.100'
});
```

---

## 📊 Log-Management

### Automatische Log-Rotation
- **Maximale Log-Datei Größe**: 10MB
- **Maximale Anzahl Log-Dateien**: 30 Tage
- **Automatische Bereinigung**: Alte Logs werden automatisch gelöscht

### Log-Statistiken abrufen
```javascript
const stats = logger.getLogStats();
console.log(stats);
// Output: { lines: 1500, size: 2048576, errors: 5, warnings: 12, info: 1200, success: 283 }
```

### Log-Export
```javascript
const logs = logger.exportLogs('2025-01-01', '2025-01-31');
// Exportiert alle Logs zwischen den angegebenen Daten
```

---

## 🔍 Log-Analyse

### Häufige Log-Einträge

#### System-Start
```json
{
  "timestamp": "2025-01-02T09:00:00.000Z",
  "level": "SUCCESS",
  "message": "Installation abgeschlossen!",
  "data": null
}
```

#### 2FA-Aktivierung
```json
{
  "timestamp": "2025-01-02T10:15:30.000Z",
  "level": "INFO",
  "message": "2FA: verification_success",
  "data": {
    "action": "identity_verification",
    "ip": "192.168.1.100"
  }
}
```

#### Backup-Erstellung
```json
{
  "timestamp": "2025-01-02T12:00:00.000Z",
  "level": "INFO",
  "message": "Backup: automatic",
  "data": {
    "records": 1500,
    "size": "2.5MB",
    "checksum": "abc123def456"
  }
}
```

#### Performance-Warnung
```json
{
  "timestamp": "2025-01-02T14:30:00.000Z",
  "level": "WARNING",
  "message": "Performance: database_query",
  "data": {
    "operation": "database_query",
    "duration": 2500,
    "table": "clients",
    "records": 50000
  }
}
```

---

## 🛠️ Konfiguration

### Log-Verzeichnis ändern
```javascript
// In logger.js
this.logDir = path.join(__dirname, 'custom_logs');
```

### Log-Datei Größe anpassen
```javascript
// In logger.js
this.maxLogSize = 20 * 1024 * 1024; // 20MB
```

### Log-Retention anpassen
```javascript
// In logger.js
this.maxLogFiles = 60; // 60 Tage
```

---

## 📈 Monitoring & Alerting

### Automatisches System-Monitoring
- **Intervall**: Alle 5 Minuten
- **Überwachte Metriken**: Memory, Uptime, PID, Platform
- **Log-Eintrag**: Automatischer System-Status

### Performance-Thresholds
```javascript
// Beispiel: Warnung bei langsamen Datenbankabfragen
if (duration > 2000) {
  logger.warning('Slow database query detected', { duration, operation });
}
```

### Security-Monitoring
```javascript
// Beispiel: Warnung bei verdächtigen Login-Versuchen
if (failedAttempts > 5) {
  logger.error('Multiple failed login attempts', { ip, attempts: failedAttempts });
}
```

---

## 🔒 Sicherheit

### Log-Verschlüsselung
- Log-Dateien werden im Klartext gespeichert
- Sensible Daten werden automatisch maskiert
- Log-Verzeichnis sollte entsprechend geschützt werden

### Zugriffskontrolle
```bash
# Log-Verzeichnis schützen (Linux/macOS)
chmod 750 logs/
chown notary:notary logs/
```

### Log-Rotation
- Automatische Rotation bei 10MB
- Alte Logs werden nach 30 Tagen gelöscht
- Manuelle Rotation möglich

---

## 🚨 Troubleshooting

### Häufige Probleme

#### Log-Datei zu groß
```bash
# Manuelle Rotation
mv logs/notariat-2025-01-02.log logs/notariat-2025-01-02-archive.log
```

#### Keine Schreibberechtigung
```bash
# Berechtigungen prüfen
ls -la logs/
chmod 755 logs/
```

#### Log-Verzeichnis nicht gefunden
```bash
# Verzeichnis erstellen
mkdir -p logs/
chmod 755 logs/
```

### Log-Analyse-Tools

#### Log-Filterung
```bash
# Nur Fehler anzeigen
grep '"level":"ERROR"' logs/notariat-2025-01-02.log

# Nur 2FA-Events anzeigen
grep '2FA:' logs/notariat-2025-01-02.log

# Performance-Probleme finden
grep '"level":"WARNING"' logs/notariat-2025-01-02.log | grep "Performance"
```

#### Log-Statistiken
```bash
# Anzahl Log-Einträge pro Level
grep -o '"level":"[^"]*"' logs/notariat-2025-01-02.log | sort | uniq -c
```

---

## 📞 Support

Bei Problemen mit dem Logging-System:

1. **Log-Dateien prüfen**: `logs/notariat-YYYY-MM-DD.log`
2. **System-Status**: Automatische Logs alle 5 Minuten
3. **Performance-Probleme**: Suche nach WARNING/ERROR Einträgen
4. **Security-Events**: Suche nach "Security Event" Einträgen

### Kontakt
- **E-Mail**: support@digitales-notariat.de
- **Dokumentation**: Vollständige Dokumentation im Projekt
- **Issues**: GitHub Issues für Bug-Reports 