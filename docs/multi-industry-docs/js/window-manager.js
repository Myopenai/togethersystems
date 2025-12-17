/**
 * Window Manager Module
 * Handles creation, management, and interaction with draggable/resizable windows
 */

const WindowManager = (() => {
    // Private variables
    let windows = new Map();
    let zIndex = 1000;
    let activeWindow = null;
    let isDragging = false;
    let isResizing = false;
    let dragOffset = { x: 0, y: 0 };
    let currentResizeHandle = null;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    // DOM Elements
    const windowContainer = document.createElement('div');
    windowContainer.className = 'window-container';
    document.body.appendChild(windowContainer);

    // Private methods
    function generateId() {
        return 'win-' + Math.random().toString(36).substr(2, 9);
    }

    function updateZIndex(windowId) {
        if (windows.has(windowId)) {
            zIndex++;
            windows.get(windowId).element.style.zIndex = zIndex;
            activeWindow = windowId;
        }
    }

    function setActiveWindow(windowId) {
        if (windows.has(windowId)) {
            // Reset previous active window
            if (windows.has(activeWindow)) {
                windows.get(activeWindow).element.classList.remove('active');
            }
            
            // Set new active window
            activeWindow = windowId;
            windows.get(windowId).element.classList.add('active');
            updateZIndex(windowId);
        }
    }

    function createWindowElement(options) {
        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.style.width = `${options.width || 500}px`;
        windowElement.style.height = `${options.height || 300}px`;
        windowElement.style.left = `${options.x || 100}px`;
        windowElement.style.top = `${options.y || 100}px`;
        windowElement.style.zIndex = zIndex++;

        // Create window header
        const header = document.createElement('div');
        header.className = 'window-header';
        
        const title = document.createElement('div');
        title.className = 'window-title';
        title.textContent = options.title || 'Window';
        
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        
        const minimizeBtn = document.createElement('div');
        minimizeBtn.className = 'window-control window-minimize';
        minimizeBtn.title = 'Minimize';
        
        const maximizeBtn = document.createElement('div');
        maximizeBtn.className = 'window-control window-maximize';
        maximizeBtn.title = 'Maximize';
        
        const closeBtn = document.createElement('div');
        closeBtn.className = 'window-control window-close';
        closeBtn.title = 'Close';
        
        controls.appendChild(minimizeBtn);
        controls.appendChild(maximizeBtn);
        controls.appendChild(closeBtn);
        
        header.appendChild(title);
        header.appendChild(controls);

        // Create window content
        const content = document.createElement('div');
        content.className = 'window-content';
        content.innerHTML = options.content || '';

        // Create resize handles
        const resizeHandles = ['e', 's', 'se'].map(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-handle-${pos}`;
            handle.setAttribute('data-position', pos);
            return handle;
        });

        // Assemble window
        windowElement.appendChild(header);
        windowElement.appendChild(content);
        resizeHandles.forEach(handle => windowElement.appendChild(handle));

        // Add event listeners
        header.addEventListener('mousedown', startDrag);
        closeBtn.addEventListener('click', () => WindowManager.closeWindow(options.id));
        
        // Add resize handle listeners
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', startResize);
        });

        return windowElement;
    }

    function startDrag(e) {
        if (e.button !== 0) return; // Only left mouse button
        
        const windowElement = e.target.closest('.window');
        if (!windowElement) return;
        
        const windowId = windowElement.getAttribute('data-window-id');
        if (!windowId || !windows.has(windowId)) return;
        
        isDragging = true;
        setActiveWindow(windowId);
        
        const rect = windowElement.getBoundingClientRect();
        dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        windowElement.classList.add('dragging');
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        
        e.preventDefault();
        e.stopPropagation();
    }

    function onDrag(e) {
        if (!isDragging) return;
        
        const windowElement = document.querySelector('.window.dragging');
        if (!windowElement) return;
        
        const windowId = windowElement.getAttribute('data-window-id');
        if (!windowId || !windows.has(windowId)) return;
        
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        
        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
        
        // Update window position in the windows map
        const win = windows.get(windowId);
        win.x = x;
        win.y = y;
        
        e.preventDefault();
        e.stopPropagation();
    }

    function stopDrag() {
        if (!isDragging) return;
        
        const windowElement = document.querySelector('.window.dragging');
        if (windowElement) {
            windowElement.classList.remove('dragging');
        }
        
        isDragging = false;
        
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    function startResize(e) {
        if (e.button !== 0) return; // Only left mouse button
        
        const handle = e.target;
        const windowElement = handle.closest('.window');
        if (!windowElement) return;
        
        const windowId = windowElement.getAttribute('data-window-id');
        if (!windowId || !windows.has(windowId)) return;
        
        isResizing = true;
        currentResizeHandle = handle.getAttribute('data-position');
        setActiveWindow(windowId);
        
        const rect = windowElement.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
        
        windowElement.classList.add('resizing');
        
        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
        e.stopPropagation();
    }

    function onResize(e) {
        if (!isResizing || !currentResizeHandle) return;
        
        const windowElement = document.querySelector('.window.resizing');
        if (!windowElement) return;
        
        const windowId = windowElement.getAttribute('data-window-id');
        if (!windowId || !windows.has(windowId)) return;
        
        const win = windows.get(windowId);
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        if (currentResizeHandle.includes('e')) {
            const newWidth = Math.max(200, startWidth + dx);
            windowElement.style.width = `${newWidth}px`;
            win.width = newWidth;
        }
        
        if (currentResizeHandle.includes('s')) {
            const newHeight = Math.max(150, startHeight + dy);
            windowElement.style.height = `${newHeight}px`;
            win.height = newHeight;
        }
        
        if (currentResizeHandle === 'se') {
            const content = windowElement.querySelector('.window-content');
            if (content) {
                content.style.height = `calc(100% - ${windowElement.querySelector('.window-header').offsetHeight}px)`;
            }
        }
        
        e.preventDefault();
        e.stopPropagation();
    }

    function stopResize() {
        if (!isResizing) return;
        
        const windowElement = document.querySelector('.window.resizing');
        if (windowElement) {
            windowElement.classList.remove('resizing');
        }
        
        isResizing = false;
        currentResizeHandle = null;
        
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
    }

    // Public API
    return {
        /**
         * Create a new window
         * @param {Object} options Window options
         * @param {string} options.title Window title
         * @param {string} options.content HTML content
         * @param {number} [options.width=500] Initial width
         * @param {number} [options.height=300] Initial height
         * @param {number} [options.x=100] Initial x position
         * @param {number} [options.y=100] Initial y position
         * @returns {string} Window ID
         */
        createWindow(options = {}) {
            const windowId = options.id || generateId();
            
            if (windows.has(windowId)) {
                console.warn(`Window with ID ${windowId} already exists`);
                return windowId;
            }
            
            const windowElement = createWindowElement({
                ...options,
                id: windowId
            });
            
            windowElement.setAttribute('data-window-id', windowId);
            windowContainer.appendChild(windowElement);
            
            windows.set(windowId, {
                id: windowId,
                element: windowElement,
                title: options.title || 'Window',
                x: options.x || 100,
                y: options.y || 100,
                width: options.width || 500,
                height: options.height || 300,
                content: options.content || '',
                isMinimized: false,
                isMaximized: false
            });
            
            setActiveWindow(windowId);
            return windowId;
        },
        
        /**
         * Close a window
         * @param {string} windowId ID of the window to close
         */
        closeWindow(windowId) {
            if (!windows.has(windowId)) return;
            
            const { element } = windows.get(windowId);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            windows.delete(windowId);
            
            if (activeWindow === windowId) {
                activeWindow = windows.keys().next().value || null;
                if (activeWindow) {
                    setActiveWindow(activeWindow);
                }
            }
        },
        
        /**
         * Minimize a window
         * @param {string} windowId ID of the window to minimize
         */
        minimizeWindow(windowId) {
            if (!windows.has(windowId)) return;
            
            const win = windows.get(windowId);
            if (win.isMinimized) return;
            
            win.isMinimized = true;
            win.element.style.display = 'none';
            
            // TODO: Add to taskbar or similar UI element
        },
        
        /**
         * Restore a minimized window
         * @param {string} windowId ID of the window to restore
         */
        restoreWindow(windowId) {
            if (!windows.has(windowId)) return;
            
            const win = windows.get(windowId);
            if (!win.isMinimized) return;
            
            win.isMinimized = false;
            win.element.style.display = '';
            setActiveWindow(windowId);
        },
        
        /**
         * Toggle window maximized state
         * @param {string} windowId ID of the window to toggle
         */
        toggleMaximize(windowId) {
            if (!windows.has(windowId)) return;
            
            const win = windows.get(windowId);
            win.isMaximized = !win.isMaximized;
            
            if (win.isMaximized) {
                // Save current position and size
                win.previousState = {
                    x: win.x,
                    y: win.y,
                    width: win.width,
                    height: win.height
                };
                
                // Maximize
                win.element.style.width = '100%';
                win.element.style.height = '100%';
                win.element.style.left = '0';
                win.element.style.top = '0';
                win.element.style.maxWidth = 'none';
                win.element.style.maxHeight = 'none';
                
                // Update window state
                win.width = window.innerWidth;
                win.height = window.innerHeight;
                win.x = 0;
                win.y = 0;
            } else {
                // Restore previous state
                if (win.previousState) {
                    const { x, y, width, height } = win.previousState;
                    win.element.style.width = `${width}px`;
                    win.element.style.height = `${height}px`;
                    win.element.style.left = `${x}px`;
                    win.element.style.top = `${y}px`;
                    
                    // Update window state
                    win.width = width;
                    win.height = height;
                    win.x = x;
                    win.y = y;
                }
            }
            
            setActiveWindow(windowId);
        },
        
        /**
         * Bring window to front
         * @param {string} windowId ID of the window to bring to front
         */
        bringToFront(windowId) {
            setActiveWindow(windowId);
        },
        
        /**
         * Get window by ID
         * @param {string} windowId ID of the window to get
         * @returns {Object|null} Window object or null if not found
         */
        getWindow(windowId) {
            return windows.get(windowId) || null;
        },
        
        /**
         * Get all windows
         * @returns {Array} Array of window objects
         */
        getAllWindows() {
            return Array.from(windows.values());
        },
        
        /**
         * Get the currently active window
         * @returns {Object|null} Active window or null if none
         */
        getActiveWindow() {
            return activeWindow ? windows.get(activeWindow) : null;
        }
    };
})();

// Initialize window manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Add any initialization code here if needed
    });
} else {
    // DOM already loaded
    // Add any initialization code here if needed
}

// Make WindowManager globally available
window.WindowManager = WindowManager;
