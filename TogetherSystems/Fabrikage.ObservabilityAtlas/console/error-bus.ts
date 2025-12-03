/**
 * ============================================================================
 * ERROR BUS
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Error Bus - Leitet Fehler an AI-Fixer weiter
 * ============================================================================
 */

import { ConsoleEvent } from './unified-console-layer';
import { AIFixer } from './ai-fixer';

export interface ErrorClassification {
  type: 'syntax' | 'compile' | 'runtime' | 'ports' | 'playwright' | 'ui' | 'policy' | 'performance' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_fixable: boolean;
  fixer: string;
  priority: number;
}

export class ErrorBus {
  private fixers: Map<string, AIFixer> = new Map();
  private classifications: Map<string, ErrorClassification> = new Map();

  constructor() {
    this.initializeFixers();
  }

  /**
   * Initialisiert AI-Fixer
   */
  private initializeFixers(): void {
    // Syntax-Fixer
    this.fixers.set('syntax-fixer', new AIFixer('syntax-fixer', {
      model: 'DeepSeek Coder',
      provider: 'OpenRouter',
      auto_fix: true,
    }));

    // Policy-Fixer
    this.fixers.set('policy-fixer', new AIFixer('policy-fixer', {
      model: 'GPT-4',
      provider: 'OpenAI',
      auto_fix: true,
    }));

    // Performance-Fixer
    this.fixers.set('performance-fixer', new AIFixer('performance-fixer', {
      model: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      auto_fix: false,
    }));

    // Self-Healing
    this.fixers.set('self-healing', new AIFixer('self-healing', {
      model: 'GPT-4',
      provider: 'OpenAI',
      auto_fix: true,
    }));

    // Accessibility-Fixer
    this.fixers.set('accessibility-fixer', new AIFixer('accessibility-fixer', {
      model: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      auto_fix: true,
    }));

    // Test-Fixer
    this.fixers.set('test-fixer', new AIFixer('test-fixer', {
      model: 'DeepSeek Coder',
      provider: 'OpenRouter',
      auto_fix: true,
    }));
  }

  /**
   * Leitet Event an entsprechenden Fixer weiter
   */
  async route(event: ConsoleEvent): Promise<void> {
    const classification = this.classify(event);
    this.classifications.set(event.timestamp, classification);

    console.log('T,. Error Bus: Event klassifiziert:', classification);

    if (!classification.auto_fixable) {
      console.warn('T,. Error Bus: Fehler nicht auto-fixbar, manuelle Intervention erforderlich');
      return;
    }

    const fixer = this.fixers.get(classification.fixer);
    if (!fixer) {
      console.error(`T,. Error Bus: Kein Fixer gefunden für: ${classification.fixer}`);
      return;
    }

    // Bypass-Mechanik: Fehler wird sofort korrigiert, Fließband läuft weiter
    try {
      const fix = await fixer.fix(event, classification);
      
      if (fix.success) {
        console.log('T,. Error Bus: Fehler automatisch korrigiert:', fix.patch);
        
        // Audit-Log
        this.logFix(event, fix);
      } else {
        console.error('T,. Error Bus: Auto-Fix fehlgeschlagen:', fix.error);
      }
    } catch (error) {
      console.error('T,. Error Bus: Fehler beim Fixen:', error);
    }
  }

  /**
   * Klassifiziert Fehler
   */
  private classify(event: ConsoleEvent): ErrorClassification {
    const message = event.message.toLowerCase();
    const source = event.source;

    // Syntax-Fehler
    if (message.includes('syntax error') || message.includes('parse error') || message.includes('unexpected token')) {
      return {
        type: 'syntax',
        severity: 'high',
        auto_fixable: true,
        fixer: 'syntax-fixer',
        priority: 1,
      };
    }

    // Compile-Fehler
    if (message.includes('compile error') || message.includes('type error') || message.includes('cannot find')) {
      return {
        type: 'compile',
        severity: 'high',
        auto_fixable: true,
        fixer: 'syntax-fixer',
        priority: 1,
      };
    }

    // Runtime-Fehler
    if (message.includes('runtime error') || message.includes('exception') || message.includes('crash')) {
      return {
        type: 'runtime',
        severity: 'critical',
        auto_fixable: source === 'terminal',
        fixer: 'self-healing',
        priority: 1,
      };
    }

    // Port-Fehler
    if (message.includes('port') && (message.includes('already in use') || message.includes('cannot bind'))) {
      return {
        type: 'ports',
        severity: 'medium',
        auto_fixable: true,
        fixer: 'self-healing',
        priority: 2,
      };
    }

    // Playwright/UI-Fehler
    if (source === 'playwright' || message.includes('accessibility') || message.includes('aria') || message.includes('contrast')) {
      return {
        type: 'playwright',
        severity: 'medium',
        auto_fixable: true,
        fixer: 'accessibility-fixer',
        priority: 2,
      };
    }

    // Policy-Fehler
    if (message.includes('policy') || message.includes('compliance') || message.includes('standard')) {
      return {
        type: 'policy',
        severity: 'high',
        auto_fixable: true,
        fixer: 'policy-fixer',
        priority: 1,
      };
    }

    // Performance-Fehler
    if (message.includes('performance') || message.includes('slow') || message.includes('timeout')) {
      return {
        type: 'performance',
        severity: 'low',
        auto_fixable: false,
        fixer: 'performance-fixer',
        priority: 3,
      };
    }

    // Unbekannt
    return {
      type: 'unknown',
      severity: 'medium',
      auto_fixable: false,
      fixer: 'syntax-fixer',
      priority: 3,
    };
  }

  /**
   * Loggt Fix für Audit
   */
  private logFix(event: ConsoleEvent, fix: any): void {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: event.message,
        source: event.source,
        severity: event.severity,
        file: event.file,
        line: event.line,
      },
      fix: {
        fixer: fix.fixer,
        patch: fix.patch,
        success: fix.success,
      },
      trace_id: `trace-${Date.now()}`,
    };

    // Append to audit log
    const fs = require('fs');
    const auditLog = './logs/audit/fixes.ndjson';
    fs.appendFileSync(auditLog, JSON.stringify(auditEntry) + '\n');
  }
}

