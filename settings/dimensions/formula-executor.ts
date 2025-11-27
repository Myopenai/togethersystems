/**
 * Formula Executor - Applikation für Formel-Ausführung
 * 
 * Führt dimensionale Formeln aus nach Testphase
 */

import { FormulaAnimator, DimensionalFormula } from './formula-animator';
import fs from 'fs';
import path from 'path';

export interface ExecutionResult {
  formula: string;
  input: any;
  output: any;
  dimensional: {
    time: number;
    space: number;
    energy: number;
    cost: number;
    total: number;
  };
  timestamp: string;
  testPhase: boolean;
  productionReady: boolean;
}

export class FormulaExecutor {
  private animator: FormulaAnimator;
  private settingsPath: string;
  private testPhase: boolean = true;
  private maxLoad: number = 0.95; // 95% Maximum (nicht 100% um Stromkreise zu schützen)

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    this.animator = new FormulaAnimator();
  }

  /**
   * Führe Formel aus
   */
  async execute(formulaName: string, input: any): Promise<ExecutionResult> {
    const formulas = this.animator.getFormulas();
    const formula = formulas.find(f => f.name === formulaName);
    
    if (!formula) {
      throw new Error(`Formel nicht gefunden: ${formulaName}`);
    }

    // Prüfe Testphase-Limit (Ohmsches Gesetz)
    const load = this.calculateLoad(input);
    if (load > this.maxLoad) {
      throw new Error(`Load zu hoch: ${load} > ${this.maxLoad}. Stromkreise würden übersteuert werden.`);
    }

    // Berechne dimensionale Werte
    const dimensional = this.animator.calculateDimensional(formula, input);

    // Führe Formel-Logik aus (ohne Code-Generation)
    const output = this.executeFormulaLogic(formula, input, dimensional);

    const result: ExecutionResult = {
      formula: formulaName,
      input,
      output,
      dimensional,
      timestamp: new Date().toISOString(),
      testPhase: this.testPhase,
      productionReady: !this.testPhase && load < 0.8
    };

    // Speichere Ergebnis
    await this.saveResult(result);

    return result;
  }

  /**
   * Führe Formel-Logik aus (ohne Code-Generation)
   */
  private executeFormulaLogic(formula: DimensionalFormula, input: any, dimensional: any): any {
    switch (formula.name) {
      case "Ohmsches Gesetz":
        // R = U / I
        const voltage = input.voltage || 1;
        const current = input.current || 1;
        const resistance = voltage / current;
        return {
          resistance,
          voltage,
          current,
          power: voltage * current,
          message: "Der Widerstand hat erst die Stärke, wenn die Kraft des Materials ausreicht"
        };

      case "ELABORAL ORNANIEREN UEBERGEBEN UNENDLICHKEIT":
        // E(O) = ∫[∞] (E(t) + O(t) + U(t) + I(t)) dt
        const elaborate = input.elaborate || 1;
        const ornament = input.ornament || 1;
        const transfer = input.transfer || 1;
        const infinity = Infinity;
        const result = elaborate + ornament + transfer + infinity;
        return {
          elaborate,
          ornament,
          transfer,
          infinity,
          result,
          message: "Unendliche Elaboration, Ornamentierung, Übergabe"
        };

      case "Dimensionale Expansion":
        // D = √(T² + S² + E² + C²)
        const time = dimensional.time || 1;
        const space = dimensional.space || 1;
        const energy = dimensional.energy || 1;
        const cost = dimensional.cost || 1;
        const distance = Math.sqrt(
          Math.pow(time, 2) + 
          Math.pow(space, 2) + 
          Math.pow(energy, 2) + 
          Math.pow(cost, 2)
        );
        return {
          time,
          space,
          energy,
          cost,
          distance,
          message: "Dimensionale Distanz berechnet"
        };

      default:
        return { message: "Formel-Logik nicht implementiert" };
    }
  }

  /**
   * Berechne Load (Ohmsches Gesetz: P = U * I)
   */
  private calculateLoad(input: any): number {
    const voltage = input.voltage || 1;
    const current = input.current || 1;
    const power = voltage * current;
    const maxPower = 100; // Maximal erlaubte Leistung
    return Math.min(power / maxPower, 1.0);
  }

  /**
   * Speichere Ergebnis
   */
  private async saveResult(result: ExecutionResult): Promise<void> {
    const resultsPath = path.join(this.settingsPath, 'dimensions', 'results');
    if (!fs.existsSync(resultsPath)) {
      fs.mkdirSync(resultsPath, { recursive: true });
    }

    const filename = `result-${Date.now()}.json`;
    const filepath = path.join(resultsPath, filename);
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
  }

  /**
   * Beende Testphase, starte Produktionsphase
   */
  async startProductionPhase(): Promise<void> {
    if (!this.testPhase) {
      throw new Error('Produktionsphase bereits aktiv');
    }

    // Prüfe ob alle Tests erfolgreich waren
    const resultsPath = path.join(this.settingsPath, 'dimensions', 'results');
    if (fs.existsSync(resultsPath)) {
      const files = fs.readdirSync(resultsPath);
      const testResults = files
        .filter(f => f.endsWith('.json'))
        .map(f => JSON.parse(fs.readFileSync(path.join(resultsPath, f), 'utf-8')))
        .filter(r => r.testPhase);

      const allSuccessful = testResults.every(r => r.dimensional.total < Infinity);
      
      if (allSuccessful && testResults.length > 0) {
        this.testPhase = false;
        console.log('✅ Testphase erfolgreich abgeschlossen. Produktionsphase aktiviert.');
      } else {
        throw new Error('Testphase noch nicht erfolgreich abgeschlossen');
      }
    } else {
      throw new Error('Keine Testergebnisse gefunden');
    }
  }

  /**
   * Get Test Phase Status
   */
  getTestPhaseStatus(): { active: boolean; maxLoad: number; currentLoad: number } {
    return {
      active: this.testPhase,
      maxLoad: this.maxLoad,
      currentLoad: 0 // Wird dynamisch berechnet
    };
  }
}

