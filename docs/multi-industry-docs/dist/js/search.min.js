// Search functionality
class Search {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.init();
    }

    async init() {
        if (!this.searchInput) return;
        
        // Load search index
        this.index = await this.loadSearchIndex();
        
        // Setup event listeners
        this.searchInput.addEventListener('input', this.debounce(() => this.search(this.searchInput.value), 300));
        
        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.closeSearch();
            }
        });
    }

    async loadSearchIndex() {
        try {
            const response = await fetch('/search-index.json');
            return await response.json();
        } catch (error) {
            console.error('Error loading search index:', error);
            return [];
        }
    }

    search(query) {
        if (!query.trim()) {
            this.closeSearch();
            return;
        }

        const results = this.index.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) || 
            item.content.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        this.displayResults(results);
    }

    displayResults(results) {
        if (!this.searchResults) return;
        
        this.searchResults.innerHTML = results.length 
            ? results.map(result => 
                <a href="" class="search-result">
                    <h4></h4>
                    <p>...</p>
                </a>
            ).join('')
            : '<div class="no-results">No results found</div>';
        
        this.searchResults.style.display = 'block';
    }

    highlight(text, query) {
        if (!query) return text;
        const regex = new RegExp((), 'gi');
        return text.replace(regex, '<mark></mark>');
    }

    closeSearch() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Search();
});
