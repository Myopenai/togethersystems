/**
 * System Initialization Module
 * Handles:
 * - System configuration
 * - Module loading and dependency management
 * - Error boundaries and error handling
 * - System state management
 */

const System = (() => {
    // System configuration
    const config = {
        debug: process.env.NODE_ENV !== 'production',
        modules: {},
        dependencies: {}
    };

    // System state
    const state = {
        isInitialized: false,
        modules: {},
        error: null
    };

    // Error boundary for module initialization
    class ModuleInitializationError extends Error {
        constructor(moduleName, originalError) {
            super(`Failed to initialize module '${moduleName}': ${originalError.message}`);
            this.name = 'ModuleInitializationError';
            this.originalError = originalError;
            this.moduleName = moduleName;
        }
    }

    // Register a module with its dependencies
    function registerModule(moduleName, moduleFactory, dependencies = []) {
        if (config.modules[moduleName]) {
            console.warn(`Module '${moduleName}' is already registered. Overwriting...`);
        }
        
        config.modules[moduleName] = moduleFactory;
        config.dependencies[moduleName] = dependencies;
        
        return {
            dependsOn: (deps) => {
                config.dependencies[moduleName] = deps;
                return { register: registerModule };
            }
        };
    }

    // Initialize a module and its dependencies
    async function initializeModule(moduleName, initializedModules = new Set()) {
        // Check if already initialized
        if (state.modules[moduleName]) {
            return state.modules[moduleName];
        }
        
        // Check for circular dependencies
        if (initializedModules.has(moduleName)) {
            throw new Error(`Circular dependency detected: ${Array.from(initializedModules).join(' -> ')} -> ${moduleName}`);
        }
        
        // Get module factory and dependencies
        const moduleFactory = config.modules[moduleName];
        if (!moduleFactory) {
            throw new Error(`Module '${moduleName}' is not registered`);
        }
        
        const dependencies = config.dependencies[moduleName] || [];
        
        try {
            // Initialize dependencies first
            const dependencyPromises = dependencies.map(dep => 
                initializeModule(dep, new Set([...initializedModules, moduleName]))
            );
            
            const resolvedDependencies = await Promise.all(dependencyPromises);
            const dependencyMap = dependencies.reduce((acc, dep, index) => {
                acc[dep] = resolvedDependencies[index];
                return acc;
            }, {});
            
            // Initialize the module
            const moduleInstance = await moduleFactory(dependencyMap);
            state.modules[moduleName] = moduleInstance;
            
            if (config.debug) {
                console.log(`Module '${moduleName}' initialized successfully`);
            }
            
            return moduleInstance;
            
        } catch (error) {
            throw new ModuleInitializationError(moduleName, error);
        }
    }

    // Initialize all registered modules
    async function initialize() {
        if (state.isInitialized) {
            console.warn('System is already initialized');
            return state.modules;
        }
        
        try {
            // Initialize modules in parallel when possible
            const moduleNames = Object.keys(config.modules);
            const initializationPromises = moduleNames.map(moduleName => 
                initializeModule(moduleName).catch(error => {
                    console.error(`Error initializing module '${moduleName}':`, error);
                    throw error;
                })
            );
            
            await Promise.all(initializationPromises);
            
            state.isInitialized = true;
            console.log('System initialization complete');
            
            // Dispatch system ready event
            const event = new CustomEvent('system:ready', { 
                detail: { modules: state.modules } 
            });
            document.dispatchEvent(event);
            
            return state.modules;
            
        } catch (error) {
            state.error = error;
            console.error('System initialization failed:', error);
            
            // Dispatch error event
            const event = new CustomEvent('system:error', { 
                detail: { error } 
            });
            document.dispatchEvent(event);
            
            throw error;
        }
    }

    // Get a module instance by name
    function getModule(moduleName) {
        if (!state.isInitialized) {
            throw new Error('System has not been initialized. Call System.initialize() first.');
        }
        
        const module = state.modules[moduleName];
        if (!module) {
            throw new Error(`Module '${moduleName}' is not found or not initialized`);
        }
        
        return module;
    }

    // Public API
    return {
        config,
        state,
        registerModule,
        initialize,
        getModule,
        
        // Shortcut for commonly used modules
        get security() { return getModule('security'); },
        get api() { return getModule('api'); },
        get windowManager() { return getModule('windowManager'); },
        get performance() { return getModule('performance'); }
    };
})();

// Auto-initialize the system when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Register core modules
        System.registerModule('security', () => ({
            // Security module will be loaded first
        }));
        
        // Initialize the system
        System.initialize().catch(error => {
            console.error('Failed to initialize system:', error);
        });
    });
} else {
    // Document is already ready
    System.initialize().catch(error => {
        console.error('Failed to initialize system:', error);
    });
}

// Error boundary for React components (if React is used)
if (typeof window !== 'undefined' && window.React) {
    class ErrorBoundary extends React.Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false, error: null };
        }
        
        static getDerivedStateFromError(error) {
            return { hasError: true, error };
        }
        
        componentDidCatch(error, errorInfo) {
            console.error('Error caught by ErrorBoundary:', error, errorInfo);
            // Log error to your error tracking service
        }
        
        render() {
            if (this.state.hasError) {
                return this.props.fallback || <div>Something went wrong. Please try again later.</div>;
            }
            return this.props.children;
        }
    }
    
    // Make ErrorBoundary available globally
    window.ReactErrorBoundary = ErrorBoundary;
}
