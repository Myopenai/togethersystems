/**
 * Performance Monitoring Module
 * Handles:
 * - Performance metrics collection
 * - Resource timing
 * - Long tasks monitoring
 * - Memory usage
 * - Custom metrics
 */

const PerformanceMonitor = (() => {
    // Performance metrics storage
    const metrics = {
        navigation: {},
        resources: [],
        marks: {},
        measures: {},
        longTasks: [],
        memory: {}
    };

    // Performance observer instances
    let longTaskObserver;
    let resourceObserver;
    let memoryObserver;

    // Initialize performance monitoring
    function init(options = {}) {
        const {
            trackLongTasks = true,
            trackResources = true,
            trackMemory = 'memory' in performance,
            reportInterval = 60000, // 1 minute
            resourceTimingBufferSize = 250,
            maxLongTaskDuration = 200 // ms
        } = options;

        // Set performance buffer size
        if (performance && performance.setResourceTimingBufferSize) {
            performance.setResourceTimingBufferSize(resourceTimingBufferSize);
        }

        // Collect navigation timing
        collectNavigationTiming();

        // Set up long task observer
        if (trackLongTasks && 'PerformanceObserver' in window) {
            setupLongTaskObserver(maxLongTaskDuration);
        }

        // Set up resource timing observer
        if (trackResources && 'PerformanceObserver' in window) {
            setupResourceObserver();
        }

        // Set up memory monitoring (if available)
        if (trackMemory && 'memory' in performance) {
            setupMemoryObserver(reportInterval);
        }

        // Set up reporting interval
        if (reportInterval > 0) {
            setInterval(reportMetrics, reportInterval);
        }

        // Add performance mark/measure shim if needed
        if (!performance.mark) {
            performance.mark = function(name) {
                if (!performance.now) {
                    performance.now = function() {
                        return Date.now() - performance.timing.navigationStart;
                    };
                }
                if (!performance.getEntriesByName) {
                    performance.getEntriesByName = function() { return []; };
                }
                if (!performance.getEntriesByType) {
                    performance.getEntriesByType = function() { return []; };
                }
                
                const mark = {
                    name: name,
                    entryType: 'mark',
                    startTime: performance.now(),
                    duration: 0
                };
                
                performance.getEntriesByName = (function(original) {
                    return function(name) {
                        const entries = original ? original.apply(this, arguments) : [];
                        if (mark.name === name) entries.push(mark);
                        return entries;
                    };
                })(performance.getEntriesByName);
                
                performance.getEntriesByType = (function(original) {
                    return function(type) {
                        const entries = original ? original.apply(this, arguments) : [];
                        if (type === 'mark') entries.push(mark);
                        return entries;
                    };
                })(performance.getEntriesByType);
                
                return mark;
            };
        }
    }

    // Collect navigation timing metrics
    function collectNavigationTiming() {
        if (!performance || !performance.timing) return;

        const timing = performance.timing;
        const now = new Date().getTime();
        
        metrics.navigation = {
            // Navigation timing
            navigationStart: timing.navigationStart,
            unloadEventStart: timing.unloadEventStart,
            unloadEventEnd: timing.unloadEventEnd,
            redirectStart: timing.redirectStart,
            redirectEnd: timing.redirectEnd,
            fetchStart: timing.fetchStart,
            domainLookupStart: timing.domainLookupStart,
            domainLookupEnd: timing.domainLookupEnd,
            connectStart: timing.connectStart,
            connectEnd: timing.connectEnd,
            secureConnectionStart: timing.secureConnectionStart,
            requestStart: timing.requestStart,
            responseStart: timing.responseStart,
            responseEnd: timing.responseEnd,
            domLoading: timing.domLoading,
            domInteractive: timing.domInteractive,
            domContentLoadedEventStart: timing.domContentLoadedEventStart,
            domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
            domComplete: timing.domComplete,
            loadEventStart: timing.loadEventStart,
            loadEventEnd: timing.loadEventEnd,
            
            // Calculated metrics
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domReadyTime: timing.domComplete - timing.domLoading,
            networkLatency: timing.responseEnd - timing.fetchStart,
            requestResponseTime: timing.responseEnd - timing.requestStart,
            domProcessingTime: timing.domComplete - timing.domLoading,
            pageRenderTime: timing.loadEventEnd - timing.domComplete,
            timeToFirstByte: timing.responseStart - timing.navigationStart,
            domInteractiveTime: timing.domInteractive - timing.domLoading,
            domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart
        };
    }

    // Set up long task observer
    function setupLongTaskObserver(maxDuration = 200) {
        try {
            longTaskObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > maxDuration) {
                        metrics.longTasks.push({
                            startTime: entry.startTime,
                            duration: entry.duration,
                            name: entry.name,
                            entryType: entry.entryType,
                            attribution: entry.attribution
                        });
                        
                        // Emit event for long task
                        const event = new CustomEvent('performance:longtask', {
                            detail: {
                                duration: entry.duration,
                                startTime: entry.startTime,
                                name: entry.name
                            }
                        });
                        document.dispatchEvent(event);
                    }
                });
            });
            
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            console.warn('Long Task Observer not supported', e);
        }
    }

    // Set up resource timing observer
    function setupResourceObserver() {
        try {
            resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    metrics.resources.push({
                        name: entry.name,
                        entryType: entry.entryType,
                        startTime: entry.startTime,
                        duration: entry.duration,
                        initiatorType: entry.initiatorType,
                        nextHopProtocol: entry.nextHopProtocol,
                        workerStart: entry.workerStart,
                        redirectStart: entry.redirectStart,
                        redirectEnd: entry.redirectEnd,
                        fetchStart: entry.fetchStart,
                        domainLookupStart: entry.domainLookupStart,
                        domainLookupEnd: entry.domainLookupEnd,
                        connectStart: entry.connectStart,
                        connectEnd: entry.connectEnd,
                        secureConnectionStart: entry.secureConnectionStart,
                        requestStart: entry.requestStart,
                        responseStart: entry.responseStart,
                        responseEnd: entry.responseEnd,
                        transferSize: entry.transferSize,
                        encodedBodySize: entry.encodedBodySize,
                        decodedBodySize: entry.decodedBodySize,
                        serverTiming: entry.serverTiming
                    });
                });
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
        } catch (e) {
            console.warn('Resource Timing Observer not supported', e);
        }
    }

    // Set up memory observer (Chrome only)
    function setupMemoryObserver(interval = 60000) {
        if (!('memory' in performance)) return;
        
        const updateMemoryInfo = () => {
            metrics.memory = {
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                timestamp: performance.now()
            };
            
            // Emit memory info event
            const event = new CustomEvent('performance:memory', {
                detail: { ...metrics.memory }
            });
            document.dispatchEvent(event);
        };
        
        // Initial measurement
        updateMemoryInfo();
        
        // Set up interval for updates
        if (interval > 0) {
            setInterval(updateMemoryInfo, interval);
        }
    }

    // Create a performance mark
    function mark(name) {
        if (!performance.mark) return;
        performance.mark(name);
        metrics.marks[name] = performance.now();
        return metrics.marks[name];
    }

    // Measure time between two marks or from navigation start to a mark
    function measure(name, startMark, endMark) {
        if (!performance.measure) return;
        
        try {
            performance.measure(name, startMark, endMark);
            const measures = performance.getEntriesByName(name, 'measure');
            if (measures && measures.length > 0) {
                metrics.measures[name] = measures[0].duration;
                return metrics.measures[name];
            }
        } catch (e) {
            console.warn(`Failed to measure '${name}':`, e);
        }
        return null;
    }

    // Get all collected metrics
    function getMetrics() {
        return {
            ...metrics,
            // Add time-based metrics
            timeSincePageLoad: performance.now(),
            timeSinceNavigationStart: performance.timing ? 
                Date.now() - performance.timing.navigationStart : null,
            // Add resource count
            resourceCount: metrics.resources.length,
            // Add long task count
            longTaskCount: metrics.longTasks.length
        };
    }

    // Report metrics to server (placeholder - implement your own reporting)
    function reportMetrics() {
        const reportData = getMetrics();
        
        // Here you would typically send the data to your analytics/APM service
        console.log('Performance metrics:', reportData);
        
        // Example: Send to an analytics endpoint
        /*
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(reportData)], { type: 'application/json' });
            navigator.sendBeacon('/api/performance', blob);
        } else {
            // Fallback for browsers that don't support sendBeacon
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/performance', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(reportData));
        }
        */
    }

    // Public API
    return {
        init,
        mark,
        measure,
        getMetrics,
        reportMetrics,
        
        // Shortcut methods for common metrics
        timeToInteractive() {
            return metrics.navigation.domInteractiveTime || null;
        },
        
        firstContentfulPaint() {
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return fcpEntry ? fcpEntry.startTime : null;
        },
        
        largestContentfulPaint() {
            const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
            return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1] : null;
        },
        
        cumulativeLayoutShift() {
            const clsEntries = performance.getEntriesByType('layout-shift');
            return clsEntries.reduce((sum, entry) => {
                return entry.hadRecentInput ? sum : sum + entry.value;
            }, 0);
        },
        
        firstInputDelay() {
            const fidEntries = performance.getEntriesByType('first-input');
            return fidEntries.length > 0 ? fidEntries[0].processingStart - fidEntries[0].startTime : null;
        }
    };
})();

// Auto-initialize with default options
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());
} else {
    PerformanceMonitor.init();
}

// Register the module with the system
if (typeof System !== 'undefined') {
    System.registerModule('performance', () => PerformanceMonitor);
}
