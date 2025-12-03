/**
 * T,. OSTOSOS Formelfarm Core
 * Vollständiges Formel-System
 * 
 * Features:
 * - Formel-Editor
 * - Formel-Repository
 * - Formel-Sharing
 * - Formel-Execution
 */

class OSTOSOSFormelfarm {
  constructor() {
    this.formulas = new Map();
    this.formulaIdCounter = 0;
    this.categories = [
      'Mathematik',
      'Physik',
      'Chemie',
      'Informatik',
      'Finanzen',
      'Allgemein'
    ];
    
    this.loadFormulas();
    this.initMathEngine();
    
    console.log('T,. Formelfarm initialisiert');
  }
  
  /**
   * Initialisiert Math Engine
   */
  initMathEngine() {
    // Math.js oder ähnliche Library würde hier geladen werden
    // Für jetzt verwenden wir eval() als Fallback (sollte in Produktion ersetzt werden)
    this.mathEngine = {
      evaluate: (expression) => {
        try {
          // Sicherer: Verwende Function() statt eval()
          return Function('"use strict"; return (' + expression + ')')();
        } catch (e) {
          console.error('Math evaluation error:', e);
          throw new Error('Formel konnte nicht ausgewertet werden: ' + e.message);
        }
      }
    };
  }
  
  /**
   * Erstellt eine neue Formel
   */
  createFormula(title, formula, description = '', category = 'Allgemein') {
    const formulaId = `formula-${++this.formulaIdCounter}`;
    const formulaObj = {
      id: formulaId,
      title: title,
      formula: formula,
      description: description,
      category: category,
      variables: this.extractVariables(formula),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: localStorage.getItem('ostosos.userId') || 'anonymous',
      tags: []
    };
    
    this.formulas.set(formulaId, formulaObj);
    this.saveFormulas();
    
    console.log(`T,. Formel erstellt: ${formulaId}`);
    return formulaId;
  }
  
  /**
   * Extrahiert Variablen aus einer Formel
   */
  extractVariables(formula) {
    // Einfache Regex-basierte Variablen-Extraktion
    const matches = formula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g);
    if (!matches) return [];
    
    // Filter out Math functions and constants
    const mathKeywords = ['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'sqrt', 'abs', 'max', 'min', 'PI', 'E'];
    return [...new Set(matches.filter(v => !mathKeywords.includes(v.toLowerCase())))];
  }
  
  /**
   * Evaluates eine Formel
   */
  evaluateFormula(formulaId, variables = {}) {
    const formula = this.formulas.get(formulaId);
    if (!formula) {
      throw new Error(`Formel nicht gefunden: ${formulaId}`);
    }
    
    try {
      // Ersetze Variablen in der Formel
      let expression = formula.formula;
      Object.keys(variables).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        expression = expression.replace(regex, variables[varName]);
      });
      
      // Evaluate
      const result = this.mathEngine.evaluate(expression);
      
      return {
        result: result,
        expression: expression,
        variables: variables
      };
    } catch (error) {
      throw new Error(`Formel-Auswertung fehlgeschlagen: ${error.message}`);
    }
  }
  
  /**
   * Rendert Formel-Editor
   */
  renderEditor(containerId, formulaId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const formula = formulaId ? this.formulas.get(formulaId) : null;
    
    const editor = document.createElement('div');
    editor.className = 'ostosos-formelfarm-editor';
    editor.style.cssText = `
      background: var(--davinci-card, #1a1f3a);
      padding: 30px;
      border-radius: 12px;
      border: 2px solid var(--davinci-accent-primary, #10b981);
    `;
    
    // Title
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Formel-Titel';
    titleInput.value = formula ? formula.title : '';
    titleInput.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid var(--davinci-border, #223040);
      border-radius: 8px;
      background: var(--davinci-bg, #0f172a);
      color: var(--davinci-text, #ffffff);
      font-size: 18px;
      font-weight: 600;
    `;
    editor.appendChild(titleInput);
    
    // Formula Input
    const formulaLabel = document.createElement('label');
    formulaLabel.textContent = 'Formel:';
    formulaLabel.style.cssText = `
      display: block;
      color: var(--davinci-text, #ffffff);
      margin-bottom: 10px;
      font-weight: 600;
    `;
    editor.appendChild(formulaLabel);
    
    const formulaInput = document.createElement('textarea');
    formulaInput.placeholder = 'z.B. a * b + c';
    formulaInput.value = formula ? formula.formula : '';
    formulaInput.rows = 3;
    formulaInput.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid var(--davinci-border, #223040);
      border-radius: 8px;
      background: var(--davinci-bg, #0f172a);
      color: var(--davinci-text, #ffffff);
      font-family: monospace;
      font-size: 14px;
    `;
    editor.appendChild(formulaInput);
    
    // Variables Preview
    const variablesPreview = document.createElement('div');
    variablesPreview.className = 'ostosos-formelfarm-variables';
    variablesPreview.style.cssText = `
      margin-bottom: 15px;
      padding: 15px;
      background: var(--davinci-bg, #0f172a);
      border-radius: 8px;
    `;
    
    const updateVariables = () => {
      const variables = this.extractVariables(formulaInput.value);
      if (variables.length > 0) {
        variablesPreview.innerHTML = `
          <strong style="color: var(--davinci-text, #ffffff);">Variablen:</strong>
          <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px;">
            ${variables.map(v => `
              <span style="padding: 5px 10px; background: var(--davinci-accent-primary, #10b981); border-radius: 4px; color: white; font-size: 12px;">
                ${v}
              </span>
            `).join('')}
          </div>
        `;
      } else {
        variablesPreview.innerHTML = '<span style="color: var(--davinci-muted, #9ca3af);">Keine Variablen gefunden</span>';
      }
    };
    
    formulaInput.addEventListener('input', updateVariables);
    updateVariables();
    
    editor.appendChild(variablesPreview);
    
    // Save Button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = formula ? 'Formel aktualisieren' : 'Formel speichern';
    saveBtn.style.cssText = `
      width: 100%;
      padding: 15px;
      background: var(--davinci-accent-primary, #10b981);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    
    saveBtn.addEventListener('click', () => {
      if (!titleInput.value.trim() || !formulaInput.value.trim()) {
        alert('Bitte füllen Sie alle Felder aus');
        return;
      }
      
      if (formula) {
        // Update
        formula.title = titleInput.value;
        formula.formula = formulaInput.value;
        formula.variables = this.extractVariables(formulaInput.value);
        formula.updatedAt = new Date().toISOString();
        this.saveFormulas();
        alert('Formel aktualisiert!');
      } else {
        // Create
        const id = this.createFormula(titleInput.value, formulaInput.value);
        alert('Formel gespeichert!');
      }
    });
    
    editor.appendChild(saveBtn);
    
    container.appendChild(editor);
  }
  
  /**
   * Rendert Formel-Repository
   */
  renderRepository(containerId, category = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const repo = document.createElement('div');
    repo.className = 'ostosos-formelfarm-repository';
    
    // Category Filter
    const categoryFilter = document.createElement('select');
    categoryFilter.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      border: 1px solid var(--davinci-border, #223040);
      border-radius: 8px;
      background: var(--davinci-bg, #0f172a);
      color: var(--davinci-text, #ffffff);
    `;
    
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Alle Kategorien';
    categoryFilter.appendChild(allOption);
    
    this.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      if (cat === category) option.selected = true;
      categoryFilter.appendChild(option);
    });
    
    repo.appendChild(categoryFilter);
    
    // Formulas Grid
    const formulasGrid = document.createElement('div');
    formulasGrid.className = 'ostosos-formelfarm-grid';
    formulasGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    `;
    
    const renderFormulas = (selectedCategory) => {
      formulasGrid.innerHTML = '';
      
      Array.from(this.formulas.values())
        .filter(f => !selectedCategory || f.category === selectedCategory)
        .forEach(formula => {
          const card = document.createElement('div');
          card.style.cssText = `
            background: var(--davinci-card, #1a1f3a);
            padding: 20px;
            border-radius: 12px;
            border: 2px solid var(--davinci-border, #223040);
            cursor: pointer;
            transition: all 0.2s;
          `;
          
          card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'var(--davinci-accent-primary, #10b981)';
            card.style.transform = 'translateY(-5px)';
          });
          
          card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'var(--davinci-border, #223040)';
            card.style.transform = 'translateY(0)';
          });
          
          card.innerHTML = `
            <h3 style="color: var(--davinci-accent-primary, #10b981); margin-bottom: 10px;">${formula.title}</h3>
            <p style="color: var(--davinci-muted, #9ca3af); margin-bottom: 10px; font-size: 0.9em;">${formula.description || ''}</p>
            <code style="display: block; background: var(--davinci-bg, #0f172a); padding: 10px; border-radius: 4px; color: var(--davinci-text, #ffffff); font-size: 12px; margin-bottom: 10px;">${formula.formula}</code>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
              ${formula.variables.map(v => `
                <span style="padding: 3px 8px; background: var(--davinci-bg, #0f172a); border-radius: 4px; font-size: 11px; color: var(--davinci-text, #ffffff);">${v}</span>
              `).join('')}
            </div>
            <span style="display: inline-block; margin-top: 10px; padding: 5px 10px; background: var(--davinci-accent-primary, #10b981); border-radius: 4px; font-size: 11px; color: white;">${formula.category}</span>
          `;
          
          card.addEventListener('click', () => {
            this.openFormulaEditor(formula.id);
          });
          
          formulasGrid.appendChild(card);
        });
    };
    
    categoryFilter.addEventListener('change', (e) => {
      renderFormulas(e.target.value || null);
    });
    
    renderFormulas(category);
    repo.appendChild(formulasGrid);
    
    container.appendChild(repo);
  }
  
  /**
   * Öffnet Formel-Editor
   */
  openFormulaEditor(formulaId) {
    // Öffne in neuem Fenster
    if (window.OSTOSOSWindows) {
      const formula = this.formulas.get(formulaId);
      if (!formula) return;
      
      const content = document.createElement('div');
      content.id = 'formula-editor-container';
      
      const editorWindowId = window.OSTOSOSWindows.createWindow({
        title: `Formel-Editor: ${formula.title}`,
        content: content,
        width: 800,
        height: 600,
        icon: '📐'
      });
      
      // Render editor after window is created
      setTimeout(() => {
        this.renderEditor('formula-editor-container', formulaId);
      }, 100);
    }
  }
  
  /**
   * Speichert Formeln
   */
  saveFormulas() {
    const formulasArray = Array.from(this.formulas.values());
    localStorage.setItem('ostosos.formulas', JSON.stringify(formulasArray));
  }
  
  /**
   * Lädt Formeln
   */
  loadFormulas() {
    const saved = localStorage.getItem('ostosos.formulas');
    if (saved) {
      try {
        const formulasArray = JSON.parse(saved);
        formulasArray.forEach(formula => {
          this.formulas.set(formula.id, formula);
        });
      } catch (e) {
        console.error('Fehler beim Laden der Formeln:', e);
      }
    }
  }
}

// Global verfügbar machen
window.OSTOSOSFormelfarm = OSTOSOSFormelfarm;
window.OSTOSOSFormulas = window.OSTOSOSFormulas || new OSTOSOSFormelfarm();

console.log('T,. Formelfarm Core geladen');

