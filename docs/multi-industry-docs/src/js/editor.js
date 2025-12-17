// Markdown Editor Component
class MarkdownEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.filesList = document.getElementById('files-list');
        this.refreshButton = document.getElementById('refresh-files');
        this.exportHtmlButton = document.getElementById('export-html');
        this.fileNameInput = document.getElementById('file-name');
        this.saveButton = document.getElementById('save-file');
        this.currentFile = null;
        
        // Initialize the editor
        this.initialize();
    }

    async initialize() {
        // Initialize event listeners
        this.editor.addEventListener('input', () => this.updatePreview());
        this.refreshButton.addEventListener('click', () => this.loadFilesList());
        this.exportHtmlButton.addEventListener('click', () => this.exportAsHtml());
        this.saveButton.addEventListener('click', () => this.saveFile());
        
        // Initial preview update
        this.updatePreview();
        
        // Load files list
        await this.loadFilesList();
    }

    async loadFilesList() {
        this.filesList.innerHTML = '<div class="text-muted text-center py-3">Loading files...</div>';
        
        try {
            // Get all markdown files from the content directory
            const response = await fetch('/api/contents');
            const data = await response.json();
            
            if (data.contents && data.contents.length > 0) {
                this.filesList.innerHTML = data.contents.map(file => `
                    <div class="file-item ${this.currentFile === file.name ? 'active' : ''}" 
                         data-filename="${file.name}">
                        <i class="bi bi-file-earmark-text me-2"></i>
                        ${file.name}
                        <div class="file-actions ms-auto">
                            <button class="btn btn-sm btn-outline-secondary edit-file" data-filename="${file.name}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-file" data-filename="${file.name}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
                
                // Add click handlers to file items
                document.querySelectorAll('.file-item').forEach(item => {
                    const filename = item.dataset.filename;
                    item.addEventListener('click', (e) => {
                        if (!e.target.closest('.file-actions')) {
                            this.loadFile(filename);
                        }
                    });
                });
                
                // Add click handlers for edit buttons
                document.querySelectorAll('.edit-file').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const filename = btn.dataset.filename;
                        this.loadFile(filename);
                    });
                });
                
                // Add click handlers for delete buttons
                document.querySelectorAll('.delete-file').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const filename = btn.dataset.filename;
                        if (confirm(`Are you sure you want to delete ${filename}?`)) {
                            this.deleteFile(filename);
                        }
                    });
                });
                
            } else {
                this.filesList.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-folder-x fs-1 text-muted mb-3"></i>
                        <p class="text-muted">No markdown files found</p>
                        <button class="btn btn-primary" id="create-first-file">
                            <i class="bi bi-plus-lg me-1"></i> Create your first file
                        </button>
                    </div>`;
                
                document.getElementById('create-first-file')?.addEventListener('click', () => {
                    this.newFile();
                });
            }
        } catch (error) {
            console.error('Error loading files:', error);
        }
    }

    async loadFile(filename) {
        try {
            this.filesList.querySelector('.file-item.active')?.classList.remove('active');
            
            const response = await fetch(`/api/contents/${encodeURIComponent(filename)}`);
            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.editor.value = data.content || '';
            this.currentFile = filename;
            
            // Update active state in file list
            const fileItem = this.filesList.querySelector(`[data-filename="${filename}"]`);
            if (fileItem) {
                fileItem.classList.add('active');
                fileItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            this.updatePreview();
            
            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('file', filename);
            window.history.pushState({}, '', url);
            
        } catch (error) {
            console.error('Error loading file:', error);
            alert(`Error loading file: ${error.message}`);
        }
    }

    updatePreview() {
        try {
            const markdown = this.editor.value;
            if (!markdown.trim()) {
                this.preview.innerHTML = `
                    <div class="text-center text-muted py-5">
                        <i class="bi bi-markdown fs-1 opacity-50 mb-3 d-block"></i>
                        <p>Start writing markdown to see the preview here</p>
                        <small class="text-muted">
                            Try typing: # Heading, **bold text**, *italic text*, or - a list
                        </small>
                    </div>`;
                return;
            }
            
            // Convert markdown to HTML and sanitize it
            const html = DOMPurify.sanitize(marked(markdown), {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allowfullscreen', 'frameborder', 'scrolling', 'target']
            });
            
            // Apply syntax highlighting to code blocks
            this.preview.innerHTML = html;
            
            // Add Bootstrap table styling
            this.preview.querySelectorAll('table').forEach(table => {
                table.classList.add('table', 'table-bordered', 'table-striped', 'table-hover');
            });
            
            // Add Bootstrap styling to images
            this.preview.querySelectorAll('img').forEach(img => {
                img.classList.add('img-fluid', 'rounded', 'shadow-sm', 'mb-3');
                img.style.maxHeight = '400px';
                img.style.width = 'auto';
            });
            
            // Add Bootstrap styling to blockquotes
            this.preview.querySelectorAll('blockquote').forEach(blockquote => {
                blockquote.classList.add('blockquote', 'p-3', 'bg-light', 'border-start', 'border-3', 'border-primary');
            });
            
        } catch (error) {
            console.error('Error updating preview:', error);
            this.preview.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error rendering preview:</strong> ${error.message}
                </div>`;
        }
    }
    
    async saveFile() {
        const filename = this.fileNameInput.value.trim() + '.md';
        const content = this.editor.value;
        
        try {
            const response = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content })
            });
            
            if (response.ok) {
                this.currentFile = filename;
                await this.loadFilesList();
                this.showStatus('File saved successfully!', 'success');
            } else {
                throw new Error('Failed to save file');
            }
        } catch (error) {
            console.error('Error saving file:', error);
            this.showStatus('Error saving file', 'error');
        }
    }

    newFile() {
        this.editor.value = '';
        this.fileNameInput.value = '';
        this.preview.innerHTML = '';
        this.currentFile = null;
    }

    exportAsHtml() {
        if (!this.editor.value.trim()) {
            alert('No content to export');
            return;
        }
        
        const filename = this.currentFile ? 
            this.currentFile.replace(/\.md$/, '.html') : 'export.html';
        
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { padding: 2rem; }
        .content { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="content">
        ${DOMPurify.sanitize(marked(this.editor.value))}
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startAutoSave() {
        // Auto-save every 5 seconds if there are changes
        this.autoSaveInterval = setInterval(() => {
            if (this.editor.value.trim() && this.fileNameInput.value.trim()) {
                this.saveFile();
            }
        }, 5000);
    }

    showStatus(message, type = 'info') {
        // Implement status message display
        console.log(`[${type}] ${message}`);
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Marked.js
    marked.setOptions({
        gfm: true,
        breaks: true,
        smartLists: true,
        smartypants: true
    });
    
    // Initialize the editor
    window.markdownEditor = new MarkdownEditor();
});
