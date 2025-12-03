/**
 * Formula Animator - Dimensional Formula Representation
 * 
 * Taktologische Formeldarstellung für Investor HTML-Branding
 * Ohne Code-Generation, nur Logik, Syntax, dimensionale Formeldarstellung
 */

export interface DimensionalFormula {
  name: string;
  formula: string;
  syntax: string;
  dimensional: {
    time: number | string;
    space: number | string;
    energy: number | string;
    cost: number | string;
  };
  visual: {
    color: string;
    animation: string;
    size: number;
  };
}

export interface FormulaAnimation {
  id: string;
  formula: DimensionalFormula;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  opacity: number;
  animation: {
    type: string;
    duration: number;
    easing: string;
  };
}

export class FormulaAnimator {
  private formulas: DimensionalFormula[] = [];
  private animations: FormulaAnimation[] = [];

  constructor() {
    this.initializeFormulas();
  }

  /**
   * Initialisiere Formeln
   */
  private initializeFormulas() {
    // Ohmsches Gesetz
    this.formulas.push({
      name: "Ohmsches Gesetz",
      formula: "R = U / I",
      syntax: "resistance = voltage / current",
      dimensional: {
        time: 1.0,
        space: 0.5,
        energy: 1.0,
        cost: 0.8
      },
      visual: {
        color: "#00d1ff",
        animation: "pulse",
        size: 1.0
      }
    });

    // ELABORAL ORNANIEREN UEBERGEBEN UNENDLICHKEIT
    this.formulas.push({
      name: "ELABORAL ORNANIEREN UEBERGEBEN UNENDLICHKEIT",
      formula: "E(O) = ∫[∞] (E(t) + O(t) + U(t) + I(t)) dt",
      syntax: "elaboral_ornanieren = integral_infinity(elaborate(t) + ornament(t) + transfer(t) + infinity(t))",
      dimensional: {
        time: Infinity,
        space: Infinity,
        energy: Infinity,
        cost: Infinity
      },
      visual: {
        color: "#ff4b9f",
        animation: "infinity",
        size: 1.5
      }
    });

    // Dimensionale Expansion
    this.formulas.push({
      name: "Dimensionale Expansion",
      formula: "D = √(T² + S² + E² + C²)",
      syntax: "dimensional_distance = sqrt(time^2 + space^2 + energy^2 + cost^2)",
      dimensional: {
        time: 1.0,
        space: 1.0,
        energy: 1.0,
        cost: 1.0
      },
      visual: {
        color: "#ffd86f",
        animation: "expand",
        size: 1.2
      }
    });
  }

  /**
   * Erstelle Animation für Formel
   */
  createAnimation(formula: DimensionalFormula, position: { x: number; y: number; z: number }): FormulaAnimation {
    const animation: FormulaAnimation = {
      id: `formula-${Date.now()}`,
      formula,
      position,
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: 1.0,
      opacity: 1.0,
      animation: {
        type: formula.visual.animation,
        duration: this.getAnimationDuration(formula.visual.animation),
        easing: "ease-in-out"
      }
    };

    this.animations.push(animation);
    return animation;
  }

  /**
   * Berechne Animations-Dauer basierend auf Typ
   */
  private getAnimationDuration(type: string): number {
    switch (type) {
      case "pulse":
        return 2000;
      case "infinity":
        return Infinity; // Kontinuierlich
      case "expand":
        return 3000;
      default:
        return 2000;
    }
  }

  /**
   * Generiere SVG-Pfad für Formel
   */
  generateSVGPath(formula: DimensionalFormula): string {
    // Generiere SVG-Pfad basierend auf Formel-Syntax
    const syntax = formula.syntax;
    const path = this.parseSyntaxToPath(syntax);
    return path;
  }

  /**
   * Parse Syntax zu SVG-Pfad
   */
  private parseSyntaxToPath(syntax: string): string {
    // Vereinfachte Pfad-Generierung
    // In Produktion: Vollständige Syntax-Parsing
    let path = "M 0,0";
    const tokens = syntax.split(/\s+/);
    
    tokens.forEach((token, index) => {
      const x = index * 50;
      const y = Math.sin(index) * 20;
      path += ` L ${x},${y}`;
    });

    return path;
  }

  /**
   * Berechne dimensionale Werte
   */
  calculateDimensional(formula: DimensionalFormula, input: any): any {
    const { time, space, energy, cost } = formula.dimensional;
    
    return {
      time: typeof time === 'number' ? time * (input.time || 1) : time,
      space: typeof space === 'number' ? space * (input.space || 1) : space,
      energy: typeof energy === 'number' ? energy * (input.energy || 1) : energy,
      cost: typeof cost === 'number' ? cost * (input.cost || 1) : cost,
      total: this.calculateTotal(formula.dimensional, input)
    };
  }

  /**
   * Berechne Total aus dimensionalen Werten
   */
  private calculateTotal(dimensional: any, input: any): number {
    const values = Object.values(dimensional).filter(v => typeof v === 'number') as number[];
    return values.reduce((sum, v) => sum + v, 0) * (input.multiplier || 1);
  }

  /**
   * Generiere CSS-Animation
   */
  generateCSSAnimation(animation: FormulaAnimation): string {
    const { type, duration, easing } = animation.animation;
    
    switch (type) {
      case "pulse":
        return `
          @keyframes formula-pulse-${animation.id} {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          .formula-${animation.id} {
            animation: formula-pulse-${animation.id} ${duration}ms ${easing} infinite;
          }
        `;
      
      case "infinity":
        return `
          @keyframes formula-infinity-${animation.id} {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.2); }
            100% { transform: rotate(360deg) scale(1); }
          }
          .formula-${animation.id} {
            animation: formula-infinity-${animation.id} ${duration}ms ${easing} infinite;
          }
        `;
      
      case "expand":
        return `
          @keyframes formula-expand-${animation.id} {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
          .formula-${animation.id} {
            animation: formula-expand-${animation.id} ${duration}ms ${easing} infinite;
          }
        `;
      
      default:
        return "";
    }
  }

  /**
   * Generiere HTML für Formel-Darstellung
   */
  generateHTML(animation: FormulaAnimation): string {
    const { formula, position, scale, opacity } = animation;
    const css = this.generateCSSAnimation(animation);
    
    return `
      <style>${css}</style>
      <div class="formula-container formula-${animation.id}" 
           style="position: absolute; 
                  left: ${position.x}px; 
                  top: ${position.y}px; 
                  transform: scale(${scale}); 
                  opacity: ${opacity};
                  color: ${formula.visual.color};">
        <div class="formula-name">${formula.name}</div>
        <div class="formula-equation">${formula.formula}</div>
        <div class="formula-syntax">${formula.syntax}</div>
        <div class="formula-dimensional">
          T: ${formula.dimensional.time} | 
          S: ${formula.dimensional.space} | 
          E: ${formula.dimensional.energy} | 
          C: ${formula.dimensional.cost}
        </div>
      </div>
    `;
  }

  /**
   * Get all formulas
   */
  getFormulas(): DimensionalFormula[] {
    return this.formulas;
  }

  /**
   * Get all animations
   */
  getAnimations(): FormulaAnimation[] {
    return this.animations;
  }
}

