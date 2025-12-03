/**
 * ============================================================================
 * PROJECT INITIALIZER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Project Initializer - Erstellt Projektordner automatisch
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { AutoProvisioning } from './auto-provisioning';

export interface ProjectConfig {
  name: string;
  provider: 'openrouter' | 'groq' | 'anthropic' | 'deepseek';
  path: string;
  created_at: string;
}

export class ProjectInitializer {
  private baseDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
  }

  /**
   * Initialisiert neues Projekt automatisch
   */
  async initializeProject(
    projectName?: string,
    provider: 'openrouter' | 'groq' | 'anthropic' | 'deepseek' = 'openrouter'
  ): Promise<ProjectConfig> {
    console.log('T,. Project Initializer: Initialisiere neues Projekt...');

    // Generiere Projektname (falls nicht angegeben)
    const name = projectName || this.generateProjectName();
    
    // Erstelle Projektordner
    const projectPath = path.join(this.baseDir, name);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      console.log(`T,. Projektordner erstellt: ${projectPath}`);
    }

    // Provisioniere Projekt
    const provisioning = new AutoProvisioning(projectPath);
    await provisioning.provision(provider);

    // Erstelle README
    await this.createREADME(projectPath, name);

    const config: ProjectConfig = {
      name,
      provider,
      path: projectPath,
      created_at: new Date().toISOString(),
    };

    // Speichere Konfiguration
    await this.saveProjectConfig(projectPath, config);

    console.log(`T,. Projekt initialisiert: ${name} ✓`);
    return config;
  }

  /**
   * Generiert Projektname automatisch
   */
  private generateProjectName(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `project-${timestamp}-${random}`;
  }

  /**
   * Erstellt README
   */
  private async createREADME(projectPath: string, projectName: string): Promise<void> {
    const readme = `# T,. ${projectName}

**Branding:** \`T,.&T,,.&T,,,.T.\`

---

## 🚀 Automatisch initialisiert

Dieses Projekt wurde automatisch von der Fabrikage initialisiert.

### Konfiguration

- **Provider:** Automatisch konfiguriert
- **API-Key:** Automatisch generiert und gespeichert
- **Cursor-Settings:** Automatisch erstellt

### Verwendung

1. Öffne Cursor.com
2. Wähle: **File → Open Folder**
3. Wähle diesen Ordner aus
4. Fertig! ✅

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems
`;

    const readmePath = path.join(projectPath, 'README.md');
    fs.writeFileSync(readmePath, readme, 'utf8');
    
    console.log('T,. README.md erstellt ✓');
  }

  /**
   * Speichert Projekt-Konfiguration
   */
  private async saveProjectConfig(projectPath: string, config: ProjectConfig): Promise<void> {
    const configPath = path.join(projectPath, '.project-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }
}

