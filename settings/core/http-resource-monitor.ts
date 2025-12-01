/**
 * HTTP RESOURCE MONITOR
 * 
 * IBM Standard - Industrial Business Machine - Industrial Fabrication Software
 * 
 * Automatic detection and tracking of HTTP 404 and resource loading errors
 * with real-time reporting.
 * 
 * STATUS: PERMANENT-ACTIVE - NIEMALS DEAKTIVIEREN
 * VERSION: 1.0.0
 */

import fs from "node:fs";
import path from "node:path";

type PriorityLevel = "low" | "medium" | "high" | "critical";
type FixStatus = "pending" | "fixed" | "cannotFix";
type ErrorType = "fetch" | "resource" | "link";

export interface ErrorContext {
  timestamp: string;
  source: ErrorType;
  origin: "frontend" | "backend" | "unknown";
  referrer?: string;
  stack?: string;
  meta?: Record<string, unknown>;
}

export interface ErrorRecord {
  id: string;
  type: ErrorType;
  url: string;
  method?: string;
  statusCode: number;
  priority: PriorityLevel;
  fixStatus: FixStatus;
  firstSeenAt: string;
  lastSeenAt: string;
  count: number;
  contexts: ErrorContext[];
}

interface ErrorStore {
  version: string;
  description: string;
  ibmStandard: boolean;
  lastUpdated: string;
  errors: ErrorRecord[];
  metadata: {
    totalErrors: number;
    highPriorityErrors: number;
    fixedErrors: number;
    criticalErrors: number;
  };
}

interface HttpResourceMonitorConfig {
  id: string;
  version: string;
  status: string;
  mandatory: boolean;
  hardCoded: boolean;
  ibmStandard: boolean;
  monitoring: {
    fetch: {
      enabled: boolean;
      trackAllRequests: boolean;
      trackOnlyErrorStatusCodes: boolean;
      statusCodesToTrack: number[];
      includeRequestBody: boolean;
    };
    resources: {
      enabled: boolean;
      trackScripts: boolean;
      trackStylesheets: boolean;
      trackImages: boolean;
      trackFonts: boolean;
      trackOthers: boolean;
    };
    links: {
      enabled: boolean;
      checkOnClick: boolean;
      checkOnHover: boolean;
      checkMethod: "HEAD" | "GET";
      blockedProtocols: string[];
    };
  };
  tracking: {
    priorityLevels: PriorityLevel[];
    defaultPriority: PriorityLevel;
    repetitionThresholds: {
      medium: number;
      high: number;
      critical: number;
    };
    fixStatusValues: FixStatus[];
    defaultFixStatus: FixStatus;
  };
  reporting: {
    consoleLogging: {
      enabled: boolean;
      logAll404: boolean;
      logLevel: "debug" | "info" | "warn" | "error";
    };
    fileStorage: {
      enabled: boolean;
      path: string;
    };
    localStorageBackup: {
      enabled: boolean;
      key: string;
    };
    realTimeDetection: {
      enabled: boolean;
      emitEvents: boolean;
      eventName: string;
    };
  };
  constraints: {
    forbidMonitorDeactivation: boolean;
    requireGuardWrapping: boolean;
    treatConfigFilesAsHighRisk: boolean;
  };
}

const DEFAULT_SETTINGS_ROOT = "Settings";
const DEFAULT_ROUTINE_FILE = "HTTP-RESOURCE-MONITOR-ROUTINE.json";
const DEFAULT_404_STORE_FILE = "404-errors.json";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function loadConfig(settingsRoot: string): HttpResourceMonitorConfig {
  const configPath = path.join(settingsRoot, DEFAULT_ROUTINE_FILE);
  if (!fs.existsSync(configPath)) {
    throw new Error(
      "[HttpResourceMonitor] Routine config file missing: " + configPath
    );
  }
  const raw = fs.readFileSync(configPath, "utf8");
  return JSON.parse(raw) as HttpResourceMonitorConfig;
}

function loadErrorStore(settingsRoot: string, filePath: string): ErrorStore {
  const fullPath = path.join(settingsRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    return {
      version: "1.0.0",
      description: "404 Error Log - IBM Standard",
      ibmStandard: true,
      lastUpdated: new Date().toISOString(),
      errors: [],
      metadata: {
        totalErrors: 0,
        highPriorityErrors: 0,
        fixedErrors: 0,
        criticalErrors: 0
      }
    };
  }
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw) as ErrorStore;
}

function saveErrorStore(settingsRoot: string, filePath: string, store: ErrorStore) {
  const fullPath = path.join(settingsRoot, filePath);
  store.lastUpdated = new Date().toISOString();
  fs.writeFileSync(fullPath, JSON.stringify(store, null, 2), "utf8");
}

function backupToLocalStorage(key: string, store: ErrorStore) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function normalizeId(type: ErrorType, method: string | undefined, url: string): string {
  const safeMethod = method ?? "UNKNOWN";
  return `${type}::${safeMethod.toUpperCase()}::${url}`;
}

function computePriority(
  count: number,
  thresholds: HttpResourceMonitorConfig["tracking"]["repetitionThresholds"],
  defaultPriority: PriorityLevel
): PriorityLevel {
  if (count >= thresholds.critical) return "critical";
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return defaultPriority;
}

function logToConsole(
  config: HttpResourceMonitorConfig,
  record: ErrorRecord
): void {
  if (!config.reporting.consoleLogging.enabled) return;

  const level = config.reporting.consoleLogging.logLevel;
  const message = `[HTTP-404-IBM] ${record.type.toUpperCase()} ${record.method ?? "?"} ${
    record.url
  } status=${record.statusCode} count=${record.count} priority=${record.priority}`;

  if (!isBrowser()) {
    // Node console
    switch (level) {
      case "debug":
      case "info":
        console.log(message);
        break;
      case "warn":
        console.warn(message);
        break;
      case "error":
        console.error(message);
        break;
    }
  } else {
    // Browser console
    switch (level) {
      case "debug":
        console.debug(message);
        break;
      case "info":
        console.info(message);
        break;
      case "warn":
        console.warn(message);
        break;
      case "error":
        console.error(message);
        break;
    }
  }
}

function emitRealtimeEvent(config: HttpResourceMonitorConfig, record: ErrorRecord) {
  if (!config.reporting.realTimeDetection.enabled) return;
  if (!config.reporting.realTimeDetection.emitEvents) return;
  if (!isBrowser()) return;

  const eventName = config.reporting.realTimeDetection.eventName;
  const event = new CustomEvent(eventName, { detail: record });
  window.dispatchEvent(event);
}

export class HttpResourceMonitor {
  private config: HttpResourceMonitorConfig;
  private store: ErrorStore;
  private settingsRoot: string;
  private originalFetch?: typeof fetch;

  constructor(settingsRoot: string = DEFAULT_SETTINGS_ROOT) {
    this.settingsRoot = settingsRoot;
    this.config = loadConfig(this.settingsRoot);
    this.store = loadErrorStore(
      this.settingsRoot,
      this.config.reporting.fileStorage.path || DEFAULT_404_STORE_FILE
    );
  }

  public init(): void {
    if (this.config.constraints.forbidMonitorDeactivation === false) {
      throw new Error(
        "[HttpResourceMonitor] Monitor must not be configured as deactivatable."
      );
    }

    this.wrapFetchIfPossible();
    this.attachResourceErrorListeners();
    this.attachLinkCheckListeners();
  }

  private wrapFetchIfPossible(): void {
    if (!this.config.monitoring.fetch.enabled) return;
    if (typeof fetch === "undefined") return;

    if (!this.originalFetch) {
      this.originalFetch = fetch;
    }

    const self = this;
    const cfg = this.config;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = async function wrappedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const method =
        (init && init.method) ||
        (input instanceof Request ? input.method : "GET");
      const url = input instanceof Request ? input.url : String(input);

      const response = await self.originalFetch!(input, init);

      const shouldTrackStatus =
        cfg.monitoring.fetch.statusCodesToTrack.includes(response.status);

      if (shouldTrackStatus) {
        self.record404({
          type: "fetch",
          url,
          method,
          statusCode: response.status,
          origin: isBrowser() ? "frontend" : "backend",
          referrer: isBrowser() ? document.referrer : undefined,
          stack: new Error().stack ?? undefined
        });
      }

      return response;
    };
  }

  private attachResourceErrorListeners(): void {
    if (!isBrowser()) return;
    if (!this.config.monitoring.resources.enabled) return;

    window.addEventListener(
      "error",
      (event: ErrorEvent | Event) => {
        const target = (event as any).target as
          | HTMLScriptElement
          | HTMLLinkElement
          | HTMLImageElement
          | HTMLElement
          | null;

        if (!target) return;

        let url: string | undefined;
        let type: ErrorType = "resource";

        if (target instanceof HTMLScriptElement) {
          if (!this.config.monitoring.resources.trackScripts) return;
          url = target.src;
        } else if (target instanceof HTMLLinkElement) {
          if (!this.config.monitoring.resources.trackStylesheets) return;
          url = target.href;
        } else if (target instanceof HTMLImageElement) {
          if (!this.config.monitoring.resources.trackImages) return;
          url = target.src;
        } else {
          if (!this.config.monitoring.resources.trackOthers) return;
        }

        if (!url) return;

        this.record404({
          type,
          url,
          method: "GET",
          statusCode: 404,
          origin: "frontend",
          referrer: document.referrer,
          stack: (event as ErrorEvent).error?.stack
        });
      },
      true
    );
  }

  private attachLinkCheckListeners(): void {
    if (!isBrowser()) return;
    if (!this.config.monitoring.links.enabled) return;

    const handler = async (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const url = anchor.href;
      if (!url) return;

      const protocol = new URL(url, window.location.href).protocol;
      if (this.config.monitoring.links.blockedProtocols.includes(protocol)) {
        return;
      }

      try {
        const method = this.config.monitoring.links.checkMethod;
        const resp = await fetch(url, { method });

        if (resp.status === 404) {
          this.record404({
            type: "link",
            url,
            method,
            statusCode: resp.status,
            origin: "frontend",
            referrer: window.location.href,
            stack: undefined
          });
        }
      } catch (e) {
        this.record404({
          type: "link",
          url,
          method: this.config.monitoring.links.checkMethod,
          statusCode: 404,
          origin: "frontend",
          referrer: window.location.href,
          stack: (e as Error).stack
        });
      }
    };

    if (this.config.monitoring.links.checkOnClick) {
      document.addEventListener("click", handler, true);
    }
    if (this.config.monitoring.links.checkOnHover) {
      document.addEventListener("mouseover", handler, true);
    }
  }

  private record404(params: {
    type: ErrorType;
    url: string;
    method?: string;
    statusCode: number;
    origin: ErrorContext["origin"];
    referrer?: string;
    stack?: string;
  }): void {
    const now = new Date().toISOString();

    const id = normalizeId(params.type, params.method, params.url);
    const thresholds = this.config.tracking.repetitionThresholds;
    const defaultPriority = this.config.tracking.defaultPriority;
    const filePath =
      this.config.reporting.fileStorage.path || DEFAULT_404_STORE_FILE;

    let record = this.store.errors.find((e) => e.id === id);

    if (!record) {
      record = {
        id,
        type: params.type,
        url: params.url,
        method: params.method,
        statusCode: params.statusCode,
        priority: defaultPriority,
        fixStatus: this.config.tracking.defaultFixStatus,
        firstSeenAt: now,
        lastSeenAt: now,
        count: 0,
        contexts: []
      };
      this.store.errors.push(record);
      this.store.metadata.totalErrors++;
    }

    record.count += 1;
    record.lastSeenAt = now;
    record.priority = computePriority(record.count, thresholds, defaultPriority);
    
    if (record.priority === "critical") {
      this.store.metadata.criticalErrors = Math.max(
        this.store.metadata.criticalErrors,
        this.store.errors.filter(e => e.priority === "critical").length
      );
    }
    if (record.priority === "high" || record.priority === "critical") {
      this.store.metadata.highPriorityErrors = Math.max(
        this.store.metadata.highPriorityErrors,
        this.store.errors.filter(e => e.priority === "high" || e.priority === "critical").length
      );
    }

    record.contexts.push({
      timestamp: now,
      source: params.type,
      origin: params.origin,
      referrer: params.referrer,
      stack: params.stack,
      meta: {}
    });

    // Reporting
    logToConsole(this.config, record);
    emitRealtimeEvent(this.config, record);

    // Persistenz
    saveErrorStore(this.settingsRoot, filePath, this.store);
    if (this.config.reporting.localStorageBackup.enabled) {
      backupToLocalStorage(
        this.config.reporting.localStorageBackup.key,
        this.store
      );
    }
  }

  public getErrors(): ErrorRecord[] {
    return this.store.errors;
  }

  public getMetadata() {
    return this.store.metadata;
  }
}








