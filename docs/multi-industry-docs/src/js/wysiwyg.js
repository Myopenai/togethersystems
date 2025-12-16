/**
 * Enhanced WYSIWYG Editor with Auto-Save Persistence
 * Features:
 * - Real-time editing with visual feedback
 * - Auto-save with debouncing (500ms)
 * - Revision history (localStorage fallback)
 * - Server persistence via POST /api/save
 * - Keyboard shortcuts (Ctrl+S to save, Ctrl+Z/Y for undo/redo)
 * - Rich text formatting toolbar
 */

class WYSIWYGEditor {
  constructor(elementId = 'wysiwyg-content', options = {}) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      console.warn(`WYSIWYG element #${elementId} not found`);
      return;
    }

    // Configuration
    this.config = {
      autoSaveDelay: options.autoSaveDelay || 500,
      persistToServer: options.persistToServer !== false,
      persistToLocalStorage: options.persistToLocalStorage !== false,
      contentId: options.contentId || `content-${Date.now()}`,
      title: options.title || 'Untitled',
      industry: options.industry || 'general',
      apiEndpoint: options.apiEndpoint || '/api/save',
      historyMaxItems: options.historyMaxItems || 50,
      ...options
    };

    // State
    this.state = {
      isDirty: false,
      isSaving: false,
      lastSavedContent: null,
      lastSaveTime: null,
      editCount: 0
    };

    // History for undo/redo
    this.history = {
      items: [],
      currentIndex: -1
    };

    // Initialize
    this.init();
  }

  /**
   * Initialize editor with all event listeners and UI
   */
  init() {
    // Setup contenteditable
    this.element.contentEditable = true;
    this.element.setAttribute('role', 'textbox');
    this.element.setAttribute('aria-multiline', 'true');
    this.element.setAttribute('aria-label', 'WYSIWYG Editor Content');

    // Styling
    this.setupStyles();

    // Create toolbar
    this.createToolbar();

    // Create status bar
    this.createStatusBar();

    // Event listeners
    this.setupEventListeners();

    // Load previous content if exists
    this.loadContent();

    // Initialize history
    this.saveToHistory();

    console.log('✅ WYSIWYG Editor initialized:', this.config.contentId);
  }

  /**
   * Setup editor styling
   */
  setupStyles() {
    this.element.style.minHeight = '250px';
    this.element.style.padding = '1rem';
    this.element.style.border = '2px solid #ddd';
    this.element.style.borderRadius = '6px';
    this.element.style.marginTop = '1rem';
    this.element.style.fontSize = '16px';
    this.element.style.lineHeight = '1.6';
    this.element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    this.element.style.outline = 'none';
    this.element.style.transition = 'border-color 0.3s ease';
    this.element.style.backgroundColor = '#fafafa';

    this.element.addEventListener('focus', () => {
      this.element.style.borderColor = '#0066cc';
      this.element.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.1)';
    });

    this.element.addEventListener('blur', () => {
      this.element.style.borderColor = '#ddd';
      this.element.style.boxShadow = 'none';
    });
  }

  /**
   * Create formatting toolbar
   */
  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'wysiwyg-toolbar';
    toolbar.style.cssText = `
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 6px 6px 0 0;
      border-bottom: 1px solid #ddd;
      flex-wrap: wrap;
      align-items: center;
    `;

    const buttons = [
      { icon: '🔲', title: 'Bold', command: 'bold', hotkey: 'Ctrl+B' },
      { icon: '𝘐', title: 'Italic', command: 'italic', hotkey: 'Ctrl+I' },
      { icon: 'U̲', title: 'Underline', command: 'underline', hotkey: 'Ctrl+U' },
      { type: 'separator' },
      { icon: '• •', title: 'Bullet List', command: 'insertUnorderedList' },
      { icon: '1. 2.', title: 'Numbered List', command: 'insertOrderedList' },
      { type: 'separator' },
      { icon: '↶', title: 'Undo', command: 'undo', action: () => this.undo() },
      { icon: '↷', title: 'Redo', command: 'redo', action: () => this.redo() },
      { type: 'separator' },
      { icon: '💾', title: 'Save (Ctrl+S)', command: 'save', action: () => this.save() },
      { icon: '🗑️', title: 'Clear', command: 'clear', action: () => this.clear() }
    ];

    buttons.forEach(btn => {
      if (btn.type === 'separator') {
        const sep = document.createElement('div');
        sep.style.cssText = 'width: 1px; height: 24px; background: #ccc; margin: 0 0.25rem;';
        toolbar.appendChild(sep);
      } else {
        const button = document.createElement('button');
        button.innerHTML = btn.icon;
        button.title = `${btn.title} (${btn.hotkey || ''})`;
        button.style.cssText = `
          padding: 0.5rem 0.75rem;
          border: 1px solid #ccc;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        `;

        button.addEventListener('mouseenter', () => {
          button.style.background = '#e8f0ff';
          button.style.borderColor = '#0066cc';
        });

        button.addEventListener('mouseleave', () => {
          button.style.background = 'white';
          button.style.borderColor = '#ccc';
        });

        button.addEventListener('click', (e) => {
          e.preventDefault();
          if (btn.action) {
            btn.action();
          } else {
            document.execCommand(btn.command, false, null);
            this.element.focus();
          }
        });

        toolbar.appendChild(button);
      }
    });

    this.element.parentNode.insertBefore(toolbar, this.element);
    this.toolbar = toolbar;
  }

  /**
   * Create status bar showing save status
   */
  createStatusBar() {
    const statusBar = document.createElement('div');
    statusBar.id = 'wysiwyg-status';
    statusBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 6px 6px;
      font-size: 13px;
      color: #666;
      margin-bottom: 1rem;
    `;

    // Left side: status indicator
    const leftSide = document.createElement('div');
    leftSide.style.display = 'flex';
    leftSide.style.gap = '0.5rem';
    leftSide.style.alignItems = 'center';

    this.statusIndicator = document.createElement('span');
    this.statusIndicator.innerHTML = '✓ Saved';
    this.statusIndicator.style.cssText = 'color: #22c55e; font-weight: 500;';

    this.statusText = document.createElement('span');
    this.statusText.innerHTML = 'Ready to edit';

    leftSide.appendChild(this.statusIndicator);
    leftSide.appendChild(this.statusText);

    // Right side: stats
    const rightSide = document.createElement('div');
    rightSide.style.display = 'flex';
    rightSide.style.gap = '1rem';

    this.charCount = document.createElement('span');
    this.charCount.innerHTML = '0 characters';

    this.wordCount = document.createElement('span');
    this.wordCount.innerHTML = '0 words';

    rightSide.appendChild(this.charCount);
    rightSide.appendChild(this.wordCount);

    statusBar.appendChild(leftSide);
    statusBar.appendChild(rightSide);

    this.element.parentNode.insertBefore(statusBar, this.element.nextSibling);
    this.statusBar = statusBar;
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Content change
    this.element.addEventListener('input', () => this.handleInput());

    // Keyboard shortcuts
    this.element.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Prevent default paste formatting
    this.element.addEventListener('paste', (e) => this.handlePaste(e));

    // Update stats on content change
    this.element.addEventListener('input', () => this.updateStats());
  }

  /**
   * Handle content input and trigger auto-save
   */
  handleInput() {
    this.state.isDirty = true;
    this.state.editCount++;
    this.updateStatus('editing');
    this.saveToHistory();
    this.scheduleAutoSave();
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(e) {
    // Ctrl+S / Cmd+S - Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.save();
    }
    // Ctrl+Z / Cmd+Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
    }
    // Ctrl+Shift+Z / Cmd+Shift+Z - Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y') && e.shiftKey) {
      e.preventDefault();
      this.redo();
    }
  }

  /**
   * Handle paste to strip formatting
   */
  handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  /**
   * Save to history for undo/redo
   */
  saveToHistory() {
    // Remove any items after current index (new edit after undo)
    this.history.items = this.history.items.slice(0, this.history.currentIndex + 1);

    // Add new item
    this.history.items.push(this.element.innerHTML);

    // Limit history size
    if (this.history.items.length > this.config.historyMaxItems) {
      this.history.items.shift();
    } else {
      this.history.currentIndex++;
    }
  }

  /**
   * Undo last change
   */
  undo() {
    if (this.history.currentIndex > 0) {
      this.history.currentIndex--;
      this.element.innerHTML = this.history.items[this.history.currentIndex];
      this.updateStats();
      this.updateStatus('undone');
    }
  }

  /**
   * Redo last undone change
   */
  redo() {
    if (this.history.currentIndex < this.history.items.length - 1) {
      this.history.currentIndex++;
      this.element.innerHTML = this.history.items[this.history.currentIndex];
      this.updateStats();
      this.updateStatus('redone');
    }
  }

  /**
   * Clear all content
   */
  clear() {
    if (confirm('Are you sure you want to clear all content?')) {
      this.element.innerHTML = '';
      this.state.isDirty = true;
      this.saveToHistory();
      this.updateStats();
      this.updateStatus('cleared');
    }
  }

  /**
   * Schedule auto-save with debouncing
   */
  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      if (this.state.isDirty && !this.state.isSaving) {
        this.save();
      }
    }, this.config.autoSaveDelay);
  }

  /**
   * Save content to server and localStorage
   */
  async save() {
    if (!this.state.isDirty) {
      return;
    }

    this.state.isSaving = true;
    this.updateStatus('saving');

    const content = {
      contentId: this.config.contentId,
      html: this.element.innerHTML,
      title: this.config.title,
      industry: this.config.industry,
      metadata: {
        wordCount: this.getWordCount(),
        charCount: this.getCharCount(),
        editCount: this.state.editCount
      }
    };

    try {
      // Save to localStorage (always succeeds)
      if (this.config.persistToLocalStorage) {
        localStorage.setItem(`wysiwyg_${this.config.contentId}`, JSON.stringify(content));
      }

      // Save to server
      if (this.config.persistToServer) {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content)
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Content saved to server:', result);
      }

      this.state.isDirty = false;
      this.state.lastSavedContent = content.html;
      this.state.lastSaveTime = new Date();
      this.updateStatus('saved');
    } catch (error) {
      console.error('❌ Save failed:', error);
      this.updateStatus('error', error.message);
    } finally {
      this.state.isSaving = false;
    }
  }

  /**
   * Load content from server or localStorage
   */
  async loadContent() {
    try {
      // Try to load from localStorage first
      if (this.config.persistToLocalStorage) {
        const cached = localStorage.getItem(`wysiwyg_${this.config.contentId}`);
        if (cached) {
          const content = JSON.parse(cached);
          this.element.innerHTML = content.html;
          this.state.lastSavedContent = content.html;
          console.log('📖 Loaded content from cache');
          this.updateStats();
          return;
        }
      }

      // Try to load from server
      if (this.config.persistToServer) {
        const response = await fetch(`/api/content/${this.config.contentId}`);
        if (response.ok) {
          const content = await response.json();
          this.element.innerHTML = content.html;
          this.state.lastSavedContent = content.html;
          console.log('📖 Loaded content from server');
          this.updateStats();
        }
      }
    } catch (error) {
      console.warn('Could not load previous content:', error);
    }
  }

  /**
   * Update word and character counts
   */
  updateStats() {
    const charCount = this.getCharCount();
    const wordCount = this.getWordCount();

    if (this.charCount) this.charCount.innerHTML = `${charCount} characters`;
    if (this.wordCount) this.wordCount.innerHTML = `${wordCount} words`;
  }

  /**
   * Get character count
   */
  getCharCount() {
    return this.element.textContent.length;
  }

  /**
   * Get word count
   */
  getWordCount() {
    const text = this.element.textContent.trim();
    return text.length === 0 ? 0 : text.split(/\s+/).length;
  }

  /**
   * Update status indicator
   */
  updateStatus(status, message = '') {
    if (!this.statusIndicator) return;

    const statusConfigs = {
      editing: { icon: '✏️', text: 'Editing...', color: '#f59e0b' },
      saving: { icon: '💾', text: 'Saving...', color: '#3b82f6' },
      saved: { icon: '✓', text: 'Saved', color: '#22c55e' },
      error: { icon: '⚠️', text: `Error: ${message}`, color: '#ef4444' },
      undone: { icon: '↶', text: 'Undone', color: '#8b5cf6' },
      redone: { icon: '↷', text: 'Redone', color: '#8b5cf6' },
      cleared: { icon: '🗑️', text: 'Cleared', color: '#6b7280' }
    };

    const config = statusConfigs[status] || statusConfigs.editing;
    this.statusIndicator.innerHTML = config.icon;
    this.statusIndicator.style.color = config.color;

    if (this.statusText) {
      this.statusText.innerHTML = config.text;
    }

    // Reset to saved after 3 seconds (except for error)
    if (status !== 'error' && status !== 'editing') {
      setTimeout(() => {
        if (!this.state.isDirty) {
          this.statusIndicator.innerHTML = '✓';
          this.statusIndicator.style.color = '#22c55e';
          if (this.statusText) {
            this.statusText.innerHTML = 'Saved';
          }
        }
      }, 3000);
    }
  }

  /**
   * Export content as JSON
   */
  exportAsJSON() {
    const content = {
      contentId: this.config.contentId,
      title: this.config.title,
      industry: this.config.industry,
      html: this.element.innerHTML,
      exportDate: new Date().toISOString(),
      stats: {
        words: this.getWordCount(),
        characters: this.getCharCount(),
        edits: this.state.editCount
      }
    };

    const dataStr = JSON.stringify(content, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${this.config.contentId}-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * Get current content
   */
  getContent() {
    return {
      contentId: this.config.contentId,
      html: this.element.innerHTML,
      text: this.element.textContent,
      stats: {
        words: this.getWordCount(),
        characters: this.getCharCount(),
        edits: this.state.editCount
      }
    };
  }
}

// ============ AUTO-INITIALIZE ============

document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize if element exists
  const wysiwygElement = document.getElementById('wysiwyg-content');
  if (wysiwygElement) {
    window.wysiwyg = new WYSIWYGEditor('wysiwyg-content', {
      autoSaveDelay: 500,
      persistToServer: true,
      persistToLocalStorage: true,
      contentId: wysiwygElement.dataset.contentId || 'main-content',
      title: wysiwygElement.dataset.title || 'Documentation',
      industry: wysiwygElement.dataset.industry || 'general'
    });
  }
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WYSIWYGEditor;
}
