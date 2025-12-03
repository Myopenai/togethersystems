/**
 * ============================================================================
 * AUTO DOC UPDATER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Auto-Doc-Updater - Automatische, verifizierende Dokumentation (append-only)
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { RegistryManager } from '../../Fabrikage.ProvenanceLedger/registry/registry-manager';

export interface DocChange {
  file: string;
  type: 'created' | 'updated' | 'deprecated' | 'archived';
  content: string;
  hash: string;
  timestamp: string;
  reason: string;
  trace_id: string;
}

export interface DocSnapshot {
  timestamp: string;
  hash: string;
  changes: DocChange[];
  signature?: string;
  attestation?: string;
}

export class AutoDocUpdater {
  private registry: RegistryManager;
  private docsDir: string;
  private historyDir: string;
  private templatesDir: string;
  private changes: DocChange[] = [];

  constructor(
    registry: RegistryManager,
    docsDir: string = './docs',
    historyDir: string = './docs/append_only',
    templatesDir: string = './docs/templates'
  ) {
    this.registry = registry;
    this.docsDir = docsDir;
    this.historyDir = historyDir;
    this.templatesDir = templatesDir;

    // Erstelle Verzeichnisse
    [this.docsDir, this.historyDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Registriert eine Dokumentations-Änderung
   */
  registerChange(
    file: string,
    type: DocChange['type'],
    content: string,
    reason: string,
    traceId: string
  ): void {
    const hash = createHash('sha256').update(content).digest('hex');
    
    const change: DocChange = {
      file,
      type,
      content,
      hash,
      timestamp: new Date().toISOString(),
      reason,
      trace_id: traceId,
    };

    this.changes.push(change);
    console.log(`T,. Doc-Change registriert: ${file} (${type})`);
  }

  /**
   * Generiert/aktualisiert Dokumentation automatisch
   */
  async updateDocs(): Promise<void> {
    console.log('T,. Auto-Doc-Updater: Aktualisiere Dokumentation...');

    // Sammle Änderungen aus Pipelines, Error Bus und Auto-Fixer
    const changesJson = this.collectChanges();

    // Generiere index.md
    await this.generateIndex(changesJson);

    // Generiere changelog.md
    await this.generateChangelog(changesJson);

    // Generiere docs_autogen.md
    await this.generateAutogenDocs(changesJson);

    // Aktualisiere Verkaufsbericht (wenn Preisänderungen oder Development-Schritte)
    await this.updateSalesReport(changesJson);

    // Erstelle append-only History Snapshot
    await this.createHistorySnapshot(changesJson);

    // Signiere & attestiere
    await this.signAndAttest();

    console.log('T,. Auto-Doc-Updater: Dokumentation aktualisiert ✓');
  }

  /**
   * Sammelt Änderungen
   */
  private collectChanges(): any {
    return {
      timestamp: new Date().toISOString(),
      changes: this.changes,
      statistics: {
        total: this.changes.length,
        created: this.changes.filter(c => c.type === 'created').length,
        updated: this.changes.filter(c => c.type === 'updated').length,
        deprecated: this.changes.filter(c => c.type === 'deprecated').length,
        archived: this.changes.filter(c => c.type === 'archived').length,
      },
    };
  }

  /**
   * Generiert index.md
   */
  private async generateIndex(changesJson: any): Promise<void> {
    const template = this.loadTemplate('index.md.tmpl');
    const content = this.renderTemplate(template, changesJson);
    const filePath = path.join(this.docsDir, 'index.md');

    fs.writeFileSync(filePath, content, 'utf8');
    this.registerChange(filePath, 'updated', content, 'Auto-update nach Änderungen', `trace-${Date.now()}`);
  }

  /**
   * Generiert changelog.md
   */
  private async generateChangelog(changesJson: any): Promise<void> {
    const template = this.loadTemplate('changelog.md.tmpl');
    const content = this.renderTemplate(template, changesJson);
    const filePath = path.join(this.docsDir, 'changelog.md');

    // Append-only: Füge neue Einträge hinzu
    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, 'utf8');
      const newContent = existing + '\n\n' + content;
      fs.writeFileSync(filePath, newContent, 'utf8');
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
    }

    this.registerChange(filePath, 'updated', content, 'Changelog aktualisiert', `trace-${Date.now()}`);
  }

  /**
   * Generiert docs_autogen.md
   */
  private async generateAutogenDocs(changesJson: any): Promise<void> {
    const template = this.loadTemplate('docs_autogen.md.tmpl');
    const content = this.renderTemplate(template, changesJson);
    const filePath = path.join(this.docsDir, 'docs_autogen.md');

    fs.writeFileSync(filePath, content, 'utf8');
    this.registerChange(filePath, 'updated', content, 'Auto-generierte Docs aktualisiert', `trace-${Date.now()}`);
  }

  /**
   * Aktualisiert Verkaufsbericht (wenn Preisänderungen oder Development-Schritte)
   */
  private async updateSalesReport(changesJson: any): Promise<void> {
    const salesReportPath = path.join(this.docsDir, 'VERKAUFSBERICHT.md');
    
    if (!fs.existsSync(salesReportPath)) {
      console.log('T,. Verkaufsbericht nicht gefunden, überspringe Update');
      return;
    }

    // Prüfe ob Preisänderungen oder Development-Schritte vorhanden sind
    const hasPriceChanges = changesJson.changes?.some((c: any) => 
      c.reason?.toLowerCase().includes('preis') || 
      c.reason?.toLowerCase().includes('price') ||
      c.reason?.toLowerCase().includes('lizenz')
    );

    const hasDevelopmentSteps = changesJson.changes?.some((c: any) => 
      c.type === 'created' || c.type === 'updated'
    );

    if (hasPriceChanges || hasDevelopmentSteps) {
      // Aktualisiere "Letzte Aktualisierung" im Verkaufsbericht
      let content = fs.readFileSync(salesReportPath, 'utf8');
      const timestamp = new Date().toISOString().split('T')[0];
      content = content.replace(
        /(\*\*Letzte Aktualisierung:\*\* )\d{4}-\d{2}-\d{2}/,
        `$1${timestamp}`
      );
      
      fs.writeFileSync(salesReportPath, content, 'utf8');
      this.registerChange(salesReportPath, 'updated', content, 'Verkaufsbericht aktualisiert (Preisänderungen/Development-Schritte)', `trace-${Date.now()}`);
      console.log('T,. Verkaufsbericht aktualisiert');
    }
  }

  /**
   * Erstellt History Snapshot (append-only)
   */
  private async createHistorySnapshot(changesJson: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const template = this.loadTemplate('history_snapshot.md.tmpl');
    const content = this.renderTemplate(template, changesJson);
    const filePath = path.join(this.historyDir, `${timestamp}.md`);

    fs.writeFileSync(filePath, content, 'utf8');
    this.registerChange(filePath, 'created', content, 'History Snapshot erstellt', `trace-${Date.now()}`);
  }

  /**
   * Signiert & attestiert Dokumentation
   */
  private async signAndAttest(): Promise<void> {
    const files = [
      path.join(this.docsDir, 'index.md'),
      path.join(this.docsDir, 'changelog.md'),
      path.join(this.docsDir, 'docs_autogen.md'),
    ];

    // Füge alle History-Snapshots hinzu
    if (fs.existsSync(this.historyDir)) {
      const snapshots = fs.readdirSync(this.historyDir).filter(f => f.endsWith('.md'));
      snapshots.forEach(snapshot => {
        files.push(path.join(this.historyDir, snapshot));
      });
    }

    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hash = createHash('sha256').update(content).digest('hex');
        
        // Signiere (Mock - in Produktion würde hier GPG verwendet)
        const signature = this.generateSignature(file, hash);
        
        // Attestiere
        const attestation = {
          file: path.relative(process.cwd(), file),
          hash: hash,
          timestamp: new Date().toISOString(),
          signature: signature,
          trace_id: `trace-${Date.now()}`,
        };

        // Speichere Attestation
        const attestationLog = './Fabrikage.ProvenanceLedger/attestations/docs.log';
        fs.appendFileSync(attestationLog, JSON.stringify(attestation) + '\n');
      }
    }
  }

  /**
   * Lädt Template
   */
  private loadTemplate(name: string): string {
    const templatePath = path.join(this.templatesDir, name);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    return `# T,. ${name}\n\n<!-- Auto-generated -->\n\n{{content}}\n`;
  }

  /**
   * Rendert Template
   */
  private renderTemplate(template: string, data: any): string {
    // Vereinfachte Template-Engine
    let rendered = template;
    
    // Ersetze Platzhalter
    rendered = rendered.replace(/\{\{timestamp\}\}/g, data.timestamp || new Date().toISOString());
    rendered = rendered.replace(/\{\{content\}\}/g, JSON.stringify(data, null, 2));
    
    return rendered;
  }

  /**
   * Generiert Signatur (Mock)
   */
  private generateSignature(file: string, hash: string): string {
    // In Produktion: GPG-Signatur
    return `sig-${hash.substring(0, 16)}`;
  }
}

