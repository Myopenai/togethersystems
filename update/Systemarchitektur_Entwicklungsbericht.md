# 🏭 Fabrikplattform - Gesamtsystemarchitektur & CI/CD-Integration

## 1. Gesamtarchitektur

### 1.1 Technologiestack
- **Frontend**: 
  - React.js mit TypeScript
  - Zustand/Redux für State Management
  - Material-UI Komponenten
  - Responsive Design für alle Geräte

- **Backend**:
  - Node.js mit Express/NestJS
  - .NET Core für rechenintensive Dienste
  - gRPC für service-interne Kommunikation
  - OAuth 2.0 / OpenID Connect

- **Datenbanken**:
  - PostgreSQL für Transaktionsdaten
  - MongoDB für dokumentenbasierte Daten
  - Redis für Caching und Sitzungsverwaltung
  - InfluxDB für Zeitreihendaten

- **Echtzeitkommunikation**:
  - MQTT für IoT-Device-Kommunikation
  - WebSockets für Echtzeit-Updates
  - GraphQL für flexible Datenabfragen

### 1.2 Architekturdiagramm
```mermaid
graph TD
    A[Frontend] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[Produktionsservice]
    B --> E[KI-Service]
    B --> F[IIoT-Service]
    C --> G[(Identity DB)]
    D --> H[(Produktions-DB)]
    E --> I[(ML Models)]
    F --> J[(IoT Data Lake)]
    K[Monitoring] -->|Metriken| L[Prometheus]
    L --> M[Grafana]
    N[Logging] -->|Logs| O[ELK Stack]
    P[Tracing] -->|Traces| Q[Jaeger]
```

## 2. CI/CD-Integration

### 2.1 Pipeline-Übersicht
```mermaid
graph LR
    A[Code Commit] --> B[Lint & Build]
    B --> C[Unit Tests]
    C --> D[Integration Tests]
    D --> E[Container Build]
    E --> F[Deploy to Staging]
    F --> G[E2E Tests]
    G --> H[Approval]
    H --> I[Deploy to Production]
    I --> J[Smoke Tests]
    J --> K[Monitor]
```

### 2.2 CI/CD-Komponenten
- **Watchdog-Service**: Überwacht Änderungen im Arbeitsverzeichnis
- **Build-Service**: Containerisierung mit Docker, Build mit Maven/Node
- **Test-Service**: Automatisierte Testausführung
- **Deployment-Service**: Ansible/Kubernetes-basierte Bereitstellung
- **Health-Monitor**: Echtzeit-Überwachung der Dienste
- **Rollback-Manager**: Automatische Rückfallmechanismen

## 3. Sicherheitskonzept

### 3.1 Zugriffskontrolle
- **Rollenbasierte Zugriffskontrolle (RBAC)**
- Multi-Faktor-Authentifizierung
- JWT-basierte Sitzungsverwaltung
- Netzwerksegmentierung

### 3.2 Datensicherheit
- Verschlüsselung im Ruhezustand (AES-256)
- TLS 1.3 für Datenübertragung
- Regelmäßige Sicherheitsaudits
- Penetrationstests

## 4. Monitoring & Logging

### 4.1 Metriken
- Systemressourcen (CPU, RAM, Disk)
- Anwendungsmetriken
- Benutzeraktivitäten
- Geschäftsmetriken

### 4.2 Alerting
- E-Mail-Benachrichtigungen
- Slack-Integration
- PagerDuty-Eskalation
- Automatische Benachrichtigungsketten

## 5. Notfallwiederherstellung

### 5.1 Backup-Strategie
- **Datenbanken**: 
  - Tägliche inkrementelle Backups
  - Wöchentliche Vollbackups
  - Georedundante Speicherung

- **Konfiguration**:
  - Versionskontrolle aller Konfigurationsdateien
  - Automatische Sicherung bei Änderungen

### 5.2 Disaster Recovery
- **RTO (Recovery Time Objective)**: 2 Stunden
- **RPO (Recovery Point Objective)**: 15 Minuten
- Automatisierte Wiederherstellungsprozesse

## 6. Skalierbarkeit

### 6.1 Horizontale Skalierung
- Automatische Skalierung von Microservices
- Lastverteilung über mehrere Verfügbarkeitszonen
- Caching-Strategien für hohe Auslastung

### 6.2 Performance-Optimierung
- Datenbankindizierung
- Abfrageoptimierung
- Caching-Ebenen
- Lazy Loading

## 7. Dokumentation

### 7.1 Systemdokumentation
- Architekturdiagramme
- API-Referenz
- Installationsanleitungen
- Betriebshandbuch

### 7.2 Entwicklerdokumentation
- Code-Konventionen
- Entwicklungsumgebung
- Testrichtlinien
- Release-Prozess

## 8. Support & Wartung

### 8.1 Support-Level
- **24/7 Notfall-Support**
- Geschäftliche Unterstützung (Mo-Fr, 9-17 Uhr)
- E-Mail-Support
- Remote-Unterstützung

### 8.2 Wartungsfenster
- Regelmäßige Wartung: Sonntags 02:00-06:00 Uhr
- Notfallwartung: Nach Bedarf
- Geplante Wartung: 14 Tage Vorankündigung

## 9. Anhang

### 9.1 Glossar
- **CI/CD**: Kontinuierliche Integration/Continuous Deployment
- **RBAC**: Role-Based Access Control
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective

### 9.2 Wichtige Kontakte
- Technischer Support: support@fabrikplattform.de
- Sicherheitsvorfälle: security@fabrikplattform.de
- Notfallnummer: +49 123 456 789

*Letzte Aktualisierung: 14.12.2025, 17:20 Uhr*

### 1.1 Hardware
- **Entwicklungsumgebung**:
  - CPU: 4+ Kerne
  - RAM: 16GB+ (32GB empfohlen)
  - Festplatte: 100GB freier Speicher
  - Betriebssystem: Windows 10/11, macOS 10.15+, Linux

- **Produktionsumgebung**:
  - CPU: 8+ Kerne
  - RAM: 32GB+
  - Festplatte: 500GB+ SSD
  - Betriebssystem: Ubuntu Server 20.04 LTS

### 1.2 Software
- Node.js 18.x
- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.24+
- Helm 3.0+
- Git 2.30+
- Python 3.9+
- .NET 6.0 SDK

## 2. Repository-Setup

### 2.1 Repository klonen
```bash
git clone https://github.com/fabrikplattform/core.git
cd core
git submodule update --init --recursive
```

### 2.2 Umgebungsvariablen einrichten
Erstellen Sie eine `.env`-Datei im Stammverzeichnis:
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/fabrik
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
```

## 3. Datenbank-Setup

### 3.1 PostgreSQL Datenbank
```bash
# Docker-Container starten
docker run --name fabrik-db -e POSTGRES_PASSWORD=securepassword -p 5432:5432 -d postgres:14

# Datenbank erstellen
docker exec -it fabrik-db psql -U postgres -c "CREATE DATABASE fabrik;"
```

### 3.2 Redis Cache
```bash
docker run --name fabrik-redis -p 6379:6379 -d redis:7
```

## 4. Backend-Setup

### 4.1 Abhängigkeiten installieren
```bash
cd backend
npm install
```

### 4.2 Datenbank-Migrationen
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4.3 Backend starten
```bash
npm run start:dev
```

## 5. Frontend-Setup

### 5.1 Abhängigkeiten installieren
```bash
cd ../frontend
npm install
```

### 5.2 Entwicklungsserver starten
```bash
npm run dev
```

## 6. Kubernetes-Bereitstellung

### 6.1 Kubernetes-Cluster einrichten
```bash
# Minikube für lokale Entwicklung
minikube start --cpus=4 --memory=8192mb --disk-size=50g
kubectl create namespace fabrik
```

### 6.2 Helm-Charts installieren
```bash
# Nginx Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx -n kube-system

# Cert-Manager für TLS
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.10.0/cert-manager.yaml
```

### 6.3 Anwendung bereitstellen
```bash
cd ../kubernetes
kubectl apply -f namespaces/
kubectl apply -f configs/
kubectl apply -f deployments/
kubectl apply -f services/
kubectl apply -f ingress/
```

## 7. CI/CD-Pipeline

### 7.1 GitHub Actions Workflow
Erstellen Sie `.github/workflows/main.yml`:
```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - run: npm test
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        push: true
        tags: fabrikplattform/app:latest
```

## 8. Überwachung und Logging

### 8.1 Prometheus und Grafana
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
```

### 8.2 ELK-Stack
```bash
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging
helm install kibana elastic/kibana -n logging
helm install filebeat elastic/filebeat -n logging
```

## 9. Sicherheitseinstellungen

### 9.1 Netzwerkrichtlinien
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: fabrik
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

### 9.2 Pod-Sicherheitsrichtlinien
```yaml
# psp.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'secret'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
```

## 10. Backup und Wiederherstellung

### 10.1 Datenbank-Backup
```bash
# Tägliches Backup
0 2 * * * pg_dump -U postgres -d fabrik > /backups/fabrik_$(date +\%Y\%m\%d).sql
```

### 10.2 Kubernetes-Ressourcen sichern
```bash
# Alle Ressourcen sichern
kubectl get all --all-namespaces -o yaml > k8s-backup-$(date +%Y%m%d).yaml

# PV-Daten sichern
kubectl get pv,pvc --all-namespaces -o yaml > pv-backup-$(date +%Y%m%d).yaml
```

## 11. Notfallwiederherstellung

### 11.1 Datenbank-Wiederherstellung
```bash
# Datenbank wiederherstellen
psql -U postgres -d fabrik < /backups/fabrik_20231214.sql
```

### 11.2 Kubernetes-Wiederherstellung
```bash
# Ressourcen wiederherstellen
kubectl apply -f k8s-backup-20231214.yaml
```

## 12. Wartung

### 12.1 Regelmäßige Wartungsaufgaben
- Sicherungen überprüfen
- Logs auf Fehler überprüfen
- Sicherheitsupdates einspielen
- Ressourcennutzung überwachen

### 12.2 Update-Prozess
1. Sicherung erstellen
2. Neue Version testen
3. Update durchführen
4. Funktionsprüfung
5. Alte Version archivieren

## 13. Fehlerbehebung

### 13.1 Häufige Probleme
- **Datenbank-Verbindungsfehler**: 
  - Prüfen Sie die Datenbank-URL
  - Firewall-Einstellungen überprüfen
  - Datenbank-Logs überprüfen

- **Kubernetes-Pods starten nicht**:
  ```bash
  kubectl describe pod <pod-name> -n <namespace>
  kubectl logs <pod-name> -n <namespace>
  ```

## 14. Anhang

### 14.1 Nützliche Befehle
```bash
# Logs anzeigen
kubectl logs -f deployment/fabrik-backend -n fabrik

# In Pod einsteigen
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash

# Port-Forwarding
kubectl port-forward svc/fabrik-frontend 8080:80 -n fabrik
```

### 14.2 Wichtige Dateien
- `docker-compose.yml`: Lokale Entwicklung
- `kustomization.yaml`: Kubernetes-Konfiguration
- `package.json`: Abhängigkeiten
- `prisma/schema.prisma`: Datenbankschema

### 14.3 Support
- Dokumentation: https://docs.fabrikplattform.de
- Support: support@fabrikplattform.de
- Notfallnummer: +49 123 456 789

*Letzte Aktualisierung: 14.12.2025, 16:10 Uhr*

### 2.1 Gesamtarchitektur
- **Frontend**: Web-basierte Benutzeroberfläche für alle Nutzerrollen
- **Backend**: Microservices-Architektur mit folgenden Hauptkomponenten:
  - Produktionssteuerung
  - Datenanalyse & KI-Integration
  - Geschäftsprozessmanagement
  - Geräteanbindung (IIoT)
  - Benutzerverwaltung & Sicherheit

### 2.2 Technologiestack
- **Frontend**: React.js mit TypeScript
- **Backend**: .NET Core / Node.js
- **Datenbank**: Zeitreihendatenbank (InfluxDB) + Dokumentendatenbank (MongoDB)
- **Echtzeitkommunikation**: MQTT + WebSockets
- **Containerisierung**: Docker + Kubernetes
- **CI/CD**: GitLab CI/CD

## 3. Kernkomponenten

### 3.1 AI_Integration/
- Machine Learning Modelle für vorausschauende Wartung
- NLP für natürlichsprachliche Eingaben
- Computer Vision für Qualitätskontrolle

### 3.2 Core/
- Geschäftslogik
- API-Schnittstellen
- Datenmodellierung
- Sicherheitskomponenten

### 3.3 FABRIQUE/
- Fabriksteuerung
- Produktionsplanung
- Materialflusssteuerung
- Qualitätssicherung

## 4. Datenmodell

### 4.1 Hauptentitäten
- Produkt
- Maschine/Anlage
- Produktionsauftrag
- Qualitätsprüfung
- Wartungsplan
- Benutzer & Berechtigungen

## 5. Integrationen

### 5.1 Externe Systeme
- ERP-Systeme (SAP, Odoo)
- MES-Systeme
- Warenwirtschaftssysteme
- Lieferkettenmanagement

### 5.2 Protokolle
- OPC UA
- MQTT
- REST APIs
- GraphQL

## 6. Sicherheitskonzept

### 6.1 Zugriffskontrolle
- Rollenbasierte Zugriffskontrolle (RBAC)
- Zwei-Faktor-Authentifizierung
- Verschlüsselung aller Daten

### 6.2 Datenschutz
- DSGVO-Konformität
- Datenanonymisierung
- Audit-Logging

## 7. Skalierbarkeit & Performance

### 7.1 Horizontale Skalierung
- Containerbasierte Architektur
- Lastverteilung
- Caching-Strategien

### 7.2 Performance-Optimierung
- In-Memory-Datenbanken
- Asynchrone Verarbeitung
- Batch-Verarbeitung

## 8. Wartung & Betrieb

### 8.1 Monitoring
- Echtzeit-Überwachung
- Benachrichtigungssystem
- Kapazitätsplanung

### 8.2 Wartung
- Vorausschauende Wartung
- Automatische Updates
- Backup-Strategie

## 9. Entwicklungsprozess

### 9.1 Versionskontrolle
- Git Workflow
- Code Reviews
- Dokumentation

### 9.2 Teststrategie
- Unit Tests
- Integrationstests
- Lasttests
- Benutzerakzeptanztests

## 10. Roadmap

### 10.1 Kurzfristig (0-6 Monate)
- [ ] Grundfunktionalität implementieren
- [ ] Kernmodule testen
- [ ] Erste Pilotinstallation

### 10.2 Mittelfristig (6-12 Monate)
- [ ] Erweiterte Analysefunktionen
- [ ] Erweiterte Integrationen
- [ ] Skalierungstests

### 10.3 Langfristig (12+ Monate)
- [ ] KI-Optimierung
- [ ] Erweiterte Automatisierung
- [ ] Internationalisierung

## 11. Anhänge

### 11.1 Glossar
- **MES**: Manufacturing Execution System
- **IIoT**: Industrial Internet of Things
- **OPC UA**: Open Platform Communications Unified Architecture

### 11.2 Referenzen
- Technische Dokumentationen
- API-Referenzen
- Schulungsmaterialien

---
*Dokument erstellt am: 14.12.2025*
*Version: 1.0.0*
