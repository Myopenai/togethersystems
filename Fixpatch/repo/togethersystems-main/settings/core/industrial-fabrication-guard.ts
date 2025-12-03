/**
 * INDUSTRIAL FABRICATION GUARD
 * 
 * PERMANENTE HARD-CODED ROUTINE FÜR INDUSTRIELLE SOFTWARE-FABRIKATION
 * 
 * STATUS: PERMANENT-ACTIVE - NIEMALS DEAKTIVIEREN
 * VERSION: 1.0.0
 */

import fs from "node:fs";
import path from "node:path";

type RiskLevel = "low" | "medium" | "high" | "critical";

export interface IndustrialFabricationContext {
  requestId?: string;
  userId?: string;
  changedFiles?: string[];
  description?: string;
}

export interface FortressGuard {
  run<T>(label: string, fn: () => Promise<T>): Promise<T>;
}

export interface IndustrialFabricationGuardOptions {
  fortressGuard: FortressGuard;
  settingsRoot?: string;
  logger?: {
    debug: (msg: string, meta?: unknown) => void;
    info: (msg: string, meta?: unknown) => void;
    warn: (msg: string, meta?: unknown) => void;
    error: (msg: string, meta?: unknown) => void;
  };
}

interface RoutineDefinition {
  id: string;
  status: string;
  mandatory: boolean;
  hardCoded: boolean;
  workflow: {
    pre: string[];
    during: string[];
    post: string[];
  };
  constraints?: {
    forbidGuardDeactivation?: boolean;
    forbidDirectRoutineModification?: boolean;
    requireSignedChangesForGuardFiles?: boolean;
  };
}

const DEFAULT_SETTINGS_ROOT = "Settings";

function loadRoutineDefinition(settingsRoot: string): RoutineDefinition {
  const routinePath = path.join(
    settingsRoot,
    "INDUSTRIAL-FABRICATION-ROUTINE.json"
  );

  if (!fs.existsSync(routinePath)) {
    throw new Error(
      "[IndustrialFabricationGuard] Routine definition file missing."
    );
  }

  const raw = fs.readFileSync(routinePath, "utf8");
  const parsed = JSON.parse(raw) as RoutineDefinition;

  if (!parsed.id || parsed.id !== "INDUSTRIAL-FABRICATION-ROUTINE") {
    throw new Error(
      "[IndustrialFabricationGuard] Invalid routine definition (id mismatch)."
    );
  }

  if (parsed.status !== "PERMANENT-ACTIVE" || !parsed.mandatory) {
    throw new Error(
      "[IndustrialFabricationGuard] Routine must be PERMANENT-ACTIVE and mandatory."
    );
  }

  return parsed;
}

function assertSettingsFolderIntegrity(settingsRoot: string) {
  const manifestPath = path.join(settingsRoot, "settings-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      "[IndustrialFabricationGuard] settings-manifest.json missing."
    );
  }
  // Optional: add checksum/signature verification here
}

function estimateRiskLevel(context: IndustrialFabricationContext): RiskLevel {
  const files = context.changedFiles ?? [];
  if (files.length === 0) return "low";

  const highRiskPatterns = [/guard/i, /security/i, /settings/i];

  const highRiskHits = files.filter((f) =>
    highRiskPatterns.some((p) => p.test(f))
  );

  if (highRiskHits.length > 0) return "high";
  if (files.length > 10) return "medium";
  return "low";
}

async function runPreWorkflow(
  routine: RoutineDefinition,
  ctx: IndustrialFabricationContext,
  settingsRoot: string,
  log: IndustrialFabricationGuardOptions["logger"]
): Promise<void> {
  log?.debug?.("[IndustrialFabricationGuard] PRE workflow start", { ctx });

  assertSettingsFolderIntegrity(settingsRoot);

  // Hook points for:
  // - static analysis
  // - codebase search
  // - neuronal dimensional analysis

  const risk = estimateRiskLevel(ctx);
  if (risk === "high" || risk === "critical") {
    log?.warn?.(
      "[IndustrialFabricationGuard] High risk context detected.",
      { ctx }
    );
  }

  log?.debug?.("[IndustrialFabricationGuard] PRE workflow completed", {
    executedSteps: routine.workflow.pre
  });
}

async function runDuringWorkflow(
  routine: RoutineDefinition,
  ctx: IndustrialFabricationContext,
  log: IndustrialFabricationGuardOptions["logger"]
): Promise<void> {
  log?.debug?.("[IndustrialFabricationGuard] DURING workflow start", { ctx });

  // Placeholder: in a real system, this would be integrated
  // into the editor/agent loop (character-by-character checks, etc.)

  log?.debug?.("[IndustrialFabricationGuard] DURING workflow completed", {
    executedSteps: routine.workflow.during
  });
}

async function runPostWorkflow(
  routine: RoutineDefinition,
  ctx: IndustrialFabricationContext,
  log: IndustrialFabricationGuardOptions["logger"]
): Promise<void> {
  log?.debug?.("[IndustrialFabricationGuard] POST workflow start", { ctx });

  // Hook points for:
  // - full test suite
  // - consistency checks
  // - error pattern extraction and storage

  log?.debug?.("[IndustrialFabricationGuard] POST workflow completed", {
    executedSteps: routine.workflow.post
  });
}

/**
 * Master function:
 * Wraps any code action in the Industrial Fabrication Guard.
 */
export async function runWithIndustrialFabricationGuard<T>(
  label: string,
  context: IndustrialFabricationContext,
  options: IndustrialFabricationGuardOptions,
  fn: () => Promise<T>
): Promise<T> {
  const settingsRoot = options.settingsRoot ?? DEFAULT_SETTINGS_ROOT;
  const log = options.logger;

  const routine = loadRoutineDefinition(settingsRoot);

  if (
    routine.constraints?.forbidGuardDeactivation &&
    label.toLowerCase().includes("disable-guard")
  ) {
    throw new Error(
      "[IndustrialFabricationGuard] Attempt to disable guard was blocked."
    );
  }

  return options.fortressGuard.run(label, async () => {
    await runPreWorkflow(routine, context, settingsRoot, log);
    await runDuringWorkflow(routine, context, log);
    const result = await fn();
    await runPostWorkflow(routine, context, log);
    return result;
  });
}
