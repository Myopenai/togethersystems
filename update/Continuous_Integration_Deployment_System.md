# Kontinuierliches Integrations- und Bereitstellungssystem (CI/CD)

## 1. Architekturübersicht

### 1.1 Kernkomponenten
- **Watchdog-Service**: Überwacht das Arbeitsverzeichnis und erkennt Änderungen
- **Build-Service**: Kompiliert und baut die Anwendung
- **Test-Service**: Führt automatisierte Tests durch
- **Deployment-Service**: Verteilt die Anwendung auf Zielsysteme
- **Health-Monitor**: Überwacht die Integrität aller Dienste
- **Rollback-Manager**: Ermöglicht schnelle Rückfälle bei Problemen

### 1.2 Systemarchitektur

```
+------------------+     +------------------+     +------------------+
|   Watchdog       |<--->|   Build-Service  |<--->|   Test-Service   |
|   (inotify/     |     |   (Docker,       |     |   (Jest,        |
|    Filesystem)   |     |    Maven, etc.)  |     |    Jest, etc.)  |
+------------------+     +------------------+     +------------------+
        ^                                                      |
        |                                                      v
+------------------+                                   +------------------+
|   Arbeits-       |                                   |   Deployment-    |
|   verzeichnis    |                                   |   Service        |
|   (Hauptordner)  |<-------------------------------->|   (Ansible,      |
+------------------+     +------------------+          |    Kubernetes)   |
                           |   Health-      |<-------->+------------------+
                           |   Monitor      |                  |
                           |   (Prometheus, |                  v
                           |    Grafana)    |          +------------------+
                           +----------------+          |   Zielsysteme   |
                                                       |   (Produktion,   |
                                                       |    Staging, etc.)|
                                                       +------------------+
```

## 2. Implementierungsdetails

### 2.1 Watchdog-Service

```typescript
// watch-service.ts
import chokidar from 'chokidar';
import { EventEmitter } from 'events';

class WatchService extends EventEmitter {
  private watcher: chokidar.FSWatcher;
  private basePath: string;

  constructor(watchPath: string) {
    super();
    this.basePath = watchPath;
    
    this.watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../, // Ignoriere versteckte Dateien
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
      alwaysStat: false,
      depth: 99,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.watcher
      .on('add', path => this.emit('file_added', path))
      .on('change', path => this.emit('file_changed', path))
      .on('unlink', path => this.emit('file_removed', path))
      .on('error', error => this.emit('error', error));
  }

  public getWatchedPaths(): string[] {
    return Object.keys(this.watcher.getWatched());
  }

  public async close(): Promise<void> {
    await this.watcher.close();
  }
}

export default WatchService;
```

### 2.2 Deployment-Strategie

#### Blue-Green Deployment
1. **Blauer Stack**: Aktive Produktionsumgebung
2. **Grüner Stack**: Neue Version wird parallel aufgebaut
3. **Datenbank-Migration**: Automatische Skripterstellung und -ausführung
4. **DNS/UML-Switch**: Nahtlose Umstellung auf die neue Version
5. **Rollback**: Automatischer Wechsel zurück bei Fehlern

#### Canary Releases
- 5% des Traffics wird auf die neue Version umgeleitet
- Automatische Überwachung auf Fehler
- Bei Erfolg: Stufenweise Ausweitung
- Bei Fehlern: Automatischer Rollback

### 2.3 Health Monitoring

```yaml
# docker-compose.healthcheck.yml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## 3. Konfiguration

### 3.1 Konfigurationsdatei (config.yaml)

```yaml
watch:
  basePath: "/pfad/zum/hauptverzeichnis"
  ignored: 
    - "**/node_modules/**"
    - "**/.git/**"
    - "**/tmp/**"
    - "**/logs/**"
    - "**/dist/**"

deployment:
  strategy: "blue-green"  # oder "canary"
  environments:
    - name: "staging"
      servers: ["staging1.example.com", "staging2.example.com"]
      healthCheck: "http://staging.example.com/health"
    - name: "production"
      servers: ["prod1.example.com", "prod2.example.com"]
      healthCheck: "http://prod.example.com/health"

notifications:
  email:
    enabled: true
    recipients: ["team@example.com"]
  slack:
    enabled: true
    webhook: "https://hooks.slack.com/services/..."

monitoring:
  prometheus: "http://prometheus:9090"
  grafana: "http://grafana:3000"
  alertThresholds:
    cpu: 80%
    memory: 90%
    responseTime: "500ms"
```

### 3.2 Deployment-Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to production
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/production
          git pull origin main
          npm ci --production
          pm2 restart all
```

## 4. Überwachung und Wartung

### 4.1 Automatische Skalierung

```hcl
# terraform/autoscaling.tf
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "scale_up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.web.name
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "cpu_utilization_high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors EC2 CPU utilization"
  alarm_actions       = [aws_autoscaling_policy.scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.web.name
  }
}
```

### 4.2 Logging und Überwachung

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secret
      - GF_USERS_ALLOW_SIGN_UP=false

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
```

## 5. Sicherheit

### 5.1 Sicherheitsmaßnahmen
- Automatische Sicherheitsupdates
- Regelmäßige Sicherheitsscans
- Geheime Verwaltung mit Vault oder AWS Secrets Manager
- Netzwerkisolation

### 5.2 Backup-Strategie
- Tägliche inkrementelle Backups
- Wöchentliche Volldatensicherungen
- Monatliche Tests der Wiederherstellung
- Verschlüsselung aller Backups

## 6. Notfallwiederherstellung

### 6.1 Automatische Fehlererkennung
- Health Checks alle 30 Sekunden
- Automatische Benachrichtigung bei Ausfällen
- Automatische Failover-Mechanismen

### 6.2 Rollback-Strategie
- Automatische Sicherung vor jedem Deployment
- Ein-Klick Rollback auf vorherige Version
- Beibehaltung der Datenbank-Konsistenz

## 7. Skalierbarkeit

### 7.1 Horizontale Skalierung
- Automatische Skalierung basierend auf der Last
- Containerisierung mit Docker und Kubernetes
- Serverless-Komponenten für variable Lasten

### 7.2 Performance-Optimierung
- Caching-Strategien
- Datenbank-Indizierung
- Lazy Loading
- CDN-Integration

---
*Dokument erstellt am: 14.12.2025*
*Version: 1.0.0*
