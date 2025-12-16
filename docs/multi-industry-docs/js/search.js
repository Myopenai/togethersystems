// Enhanced Search Functionality with Lunr.js
class EnhancedSearch {
    constructor() {
        this.searchIndex = null;
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchFilters = {
            category: null,
            dateRange: null,
            type: null
        };
        
        this.initialize();
    }

    async initialize() {
        await this.initializeSearchIndex();
        this.setupEventListeners();
        this.renderSearchHistory();
    }

    async initializeSearchIndex() {
        // Load search data (can be fetched from an API or included in the bundle)
        this.searchData = window.searchData || [];
        
        // Initialize Lunr.js search index
        this.searchIndex = lunr(function() {
            this.ref('id');
            this.field('title', { boost: 10 });
            this.field('content');
            this.field('category', { boost: 5 });
            this.field('tags', { boost: 7 });
            this.field('author');
            
            // Add documents to the index
            this.searchData.forEach(doc => {
                this.add({
                    id: doc.id,
                    title: doc.title,
                    content: doc.content,
                    category: doc.category,
                    tags: doc.tags ? doc.tags.join(' ') : '',
                    author: doc.author || '',
                    date: doc.date || ''
                });
            }, this);
        }.bind({ searchData: this.searchData }));
    }

    setupEventListeners() {
        // Debounced search input
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        
        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(e.key);
            } else if (e.key === 'Enter') {
                this.saveToHistory(this.searchInput.value.trim());
            }
        });
        
        // Click outside to close results
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.searchResults.style.display = 'none';
            }
        });
        
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                const filterValue = e.target.dataset.value;
                this.applyFilter(filterType, filterValue);
            });
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    async handleSearch() {
        const query = this.searchInput.value.trim();
        
        // Show search suggestions if query is too short
        if (query.length < 2) {
            this.showSearchSuggestions(query);
            return;
        }
        
        try {
            // Show loading state
            this.searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
            this.searchResults.style.display = 'block';
            
            // Perform search with filters
            const results = this.searchIndex.query(q => {
                // Build query with filters
                const queryBuilder = [];
                
                // Full text search
                if (query) {
                    const terms = query.split(/\s+/);
                    terms.forEach(term => {
                        q.term(term, { fields: ['title'], boost: 10 });
                        q.term(term, { fields: ['content'], boost: 5 });
                        q.term(term, { fields: ['tags'], boost: 7 });
                    });
                }
                
                // Apply filters
                if (this.searchFilters.category) {
                    q.term(this.searchFilters.category, { fields: ['category'] });
                }
                
                // Date range filtering
                if (this.searchFilters.dateRange) {
                    // Implement date range filtering logic
                }
            });
            
            this.displayResults(results);
            
        } catch (error) {
            console.error('Search error:', error);
            this.searchResults.innerHTML = `
                <div class="search-error">
                    <i class="fas fa-exclamation-circle"></i>
                    Error performing search. Please try again.
                </div>`;
        }
    }
    
    displayResults(results) {
        if (!results || results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found. Try different keywords or check your spelling.</p>
                    ${this.getDidYouMeanSuggestion()}
                </div>`;
            return;
        }
        
        const resultsHtml = `
            <div class="search-results-header">
                <div class="search-stats">${results.length} results found</div>
                <div class="search-filters">
                    <span>Filter by:</span>
                    <button class="btn-filter" data-filter="category" data-value="documentation">Documentation</button>
                    <button class="btn-filter" data-filter="category" data-value="api">API</button>
                    <button class="btn-filter" data-filter="type" data-value="tutorial">Tutorials</button>
                </div>
            </div>
            <div class="search-results-list">
                ${results.slice(0, 10).map((result, index) => this.renderResultItem(result, index)).join('')}
            </div>
            ${results.length > 10 ? `
            <div class="search-pagination">
                <button class="btn-more">Load more results</button>
            </div>` : ''}
        `;
        
        this.searchResults.innerHTML = resultsHtml;
        this.highlightSearchTerms();
        
        // Add click handlers to result items
        document.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.saveToHistory(this.searchInput.value.trim());
                // Navigate to result
                window.location.href = results[index].url;
            });
        });
    }
    
    renderResultItem(result, index) {
        const doc = this.searchData.find(d => d.id === result.ref);
        if (!doc) return '';
        
        // Generate snippet with highlighted terms
        const snippet = this.generateSnippet(doc.content, this.searchInput.value);
        
        return `
            <div class="search-result-item" tabindex="0" data-index="${index}">
                <div class="result-header">
                    <h3>${this.highlightMatches(doc.title, this.searchInput.value)}</h3>
                    <span class="result-category">${doc.category}</span>
                </div>
                <div class="result-url">${doc.url}</div>
                <div class="result-snippet">${snippet}</div>
                <div class="result-meta">
                    ${doc.date ? `<span class="result-date">${new Date(doc.date).toLocaleDateString()}</span>` : ''}
                    ${doc.tags && doc.tags.length ? `
                        <div class="result-tags">
                            ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>` : ''
                    }
                </div>
            </div>
        `;
    }
    
    generateSnippet(content, query) {
        // Simple snippet generation - in a real app, you'd want something more sophisticated
        const terms = query.toLowerCase().split(/\s+/);
        const contentLower = content.toLowerCase();
        
        // Find the first occurrence of any search term
        let position = -1;
        for (const term of terms) {
            const termPos = contentLower.indexOf(term);
            if (termPos > -1 && (position === -1 || termPos < position)) {
                position = termPos;
            }
        }
        
        // Get a snippet around the found position
        const start = Math.max(0, position - 50);
        const end = Math.min(content.length, position + 200);
        let snippet = content.substring(start, end);
        
        // Add ellipsis if we're not at the start/end
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        return this.highlightMatches(snippet, query);
    }
    
    highlightMatches(text, query) {
        if (!query) return text;
        
        const terms = query.split(/\s+/).filter(term => term.length > 2);
        let highlighted = text;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        
        return highlighted;
    }
    
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    getDidYouMeanSuggestion() {
        // In a real implementation, you'd use a spell checker or similar
        return '';
    }
    
    showSearchSuggestions(query) {
        if (!query) {
            this.renderSearchHistory();
            return;
        }
        
        // Simple prefix matching for suggestions
        const suggestions = [
            'How to create a new policy?',
            'API authentication guide',
            'Troubleshooting common issues',
            'Getting started with our platform',
            'Advanced search operators'
        ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
        
        if (suggestions.length === 0) {
            this.searchResults.style.display = 'none';
            return;
        }
        
        const suggestionsHtml = `
            <div class="search-suggestions">
                <div class="suggestions-header">Suggestions</div>
                <ul class="suggestions-list">
                    ${suggestions.map(suggestion => `
                        <li class="suggestion-item">
                            <i class="fas fa-search"></i>
                            <span>${this.highlightMatches(suggestion, query)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        this.searchResults.innerHTML = suggestionsHtml;
        this.searchResults.style.display = 'block';
        
        // Add click handlers to suggestion items
        document.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.searchInput.value = suggestions[index];
                this.handleSearch();
            });
        });
    }
    
    renderSearchHistory() {
        if (this.searchHistory.length === 0) {
            this.searchResults.style.display = 'none';
            return;
        }
        
        const historyHtml = `
            <div class="search-history">
                <div class="history-header">
                    <span>Recent Searches</span>
                    <button class="btn-clear-history" title="Clear history">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <ul class="history-list">
                    ${this.searchHistory.map(item => `
                        <li class="history-item">
                            <i class="fas fa-history"></i>
                            <span>${item.query}</span>
                            <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        this.searchResults.innerHTML = historyHtml;
        this.searchResults.style.display = 'block';
        
        // Add click handlers to history items
        document.querySelectorAll('.history-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const query = this.searchHistory[index].query;
                this.searchInput.value = query;
                this.handleSearch();
            });
        });
        
        // Add click handler to clear history button
        const clearButton = this.searchResults.querySelector('.btn-clear-history');
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearSearchHistory();
            });
        }
    }
    
    saveToHistory(query) {
        if (!query) return;
        
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => 
            item.query.toLowerCase() !== query.toLowerCase()
        );
        
        // Add to beginning of array
        this.searchHistory.unshift({
            query,
            timestamp: new Date().toISOString()
        });
        
        // Keep only the 10 most recent searches
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
        this.renderSearchHistory();
    }
    
    navigateResults(direction) {
        const items = this.searchResults.querySelectorAll('.search-result-item, .suggestion-item, .history-item');
        if (items.length === 0) return;
        
        let currentIndex = -1;
        items.forEach((item, index) => {
            if (item === document.activeElement || item.contains(document.activeElement)) {
                currentIndex = index;
            }
        });
        
        let newIndex;
        if (direction === 'ArrowDown') {
            newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
            newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        
        items[newIndex].focus();
    }
    
    applyFilter(filterType, filterValue) {
        this.searchFilters[filterType] = filterValue;
        this.handleSearch();
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedSearch = new EnhancedSearch();
});
