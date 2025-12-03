/**
 * ============================================================================
 * MULTI-MODEL FALLBACK
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Multi-Model Fallback: Primärmodell → Sekundärmodell → Leichtgewichtsmodell
 * ============================================================================
 */

export interface ModelConfig {
  id: string;
  name: string;
  priority: number; // Niedriger = höhere Priorität
  provider: string;
  apiKey?: string;
  endpoint?: string;
  timeout: number;
  maxRetries: number;
  fallbackOnError: boolean;
  fallbackOnTimeout: boolean;
  metadata?: any;
}

export interface ModelRequest {
  prompt: string;
  context?: any;
  options?: any;
}

export interface ModelResponse {
  modelId: string;
  response: any;
  latency: number;
  metadata?: any;
}

export interface FallbackResult {
  success: boolean;
  response?: ModelResponse;
  errors: Array<{ modelId: string; error: Error; timestamp: number }>;
  fallbackChain: string[];
}

/**
 * T,. Multi-Model Fallback: Automatisches Failover zwischen Modellen
 */
export class MultiModelFallback {
  private models: ModelConfig[] = [];
  private errors: Map<string, number> = new Map(); // Fehlerzähler pro Modell
  private maxConsecutiveErrors: number = 3;
  private cooldownMs: number = 60000; // 1 Minute Cooldown nach Fehlern

  /**
   * T,. Registriert ein Modell für Fallback
   */
  register(model: ModelConfig): void {
    this.models.push(model);
    this.models.sort((a, b) => a.priority - b.priority); // Sortiere nach Priorität
    console.log(`T,. Multi-Model Fallback: Modell registriert - ${model.name} (Priority: ${model.priority})`);
  }

  /**
   * T,. Führt Request mit automatischem Fallback durch
   */
  async request(request: ModelRequest): Promise<FallbackResult> {
    const errors: Array<{ modelId: string; error: Error; timestamp: number }> = [];
    const fallbackChain: string[] = [];

    // Versuche Modelle in Prioritätsreihenfolge
    for (const model of this.models) {
      // Prüfe Cooldown
      if (this.isInCooldown(model.id)) {
        console.log(`T,. Multi-Model Fallback: Modell ${model.name} in Cooldown, überspringe...`);
        continue;
      }

      fallbackChain.push(model.id);

      try {
        console.log(`T,. Multi-Model Fallback: Versuche ${model.name} (${model.id})...`);

        const startTime = Date.now();
        const response = await this.callModel(model, request);
        const latency = Date.now() - startTime;

        // Erfolg: Reset Fehlerzähler
        this.errors.set(model.id, 0);

        return {
          success: true,
          response: {
            modelId: model.id,
            response,
            latency,
            metadata: {
              provider: model.provider,
              name: model.name
            }
          },
          errors,
          fallbackChain
        };

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`T,. Multi-Model Fallback: Fehler bei ${model.name}:`, err.message);

        // Fehlerzähler erhöhen
        const errorCount = (this.errors.get(model.id) || 0) + 1;
        this.errors.set(model.id, errorCount);

        errors.push({
          modelId: model.id,
          error: err,
          timestamp: Date.now()
        });

        // Prüfe ob Fallback bei diesem Fehler gewünscht ist
        const shouldFallback = 
          (model.fallbackOnError && err.name !== 'TimeoutError') ||
          (model.fallbackOnTimeout && err.name === 'TimeoutError');

        if (!shouldFallback) {
          console.log(`T,. Multi-Model Fallback: Fallback nicht gewünscht für ${model.name}`);
          continue;
        }

        // Wenn maximale Fehler erreicht, Cooldown setzen
        if (errorCount >= this.maxConsecutiveErrors) {
          console.warn(`T,. Multi-Model Fallback: Maximale Fehler erreicht für ${model.name}, Cooldown aktiviert`);
          this.setCooldown(model.id);
        }
      }
    }

    // Alle Modelle fehlgeschlagen
    console.error(`T,. Multi-Model Fallback: FEHLER - Alle Modelle fehlgeschlagen`);
    return {
      success: false,
      errors,
      fallbackChain
    };
  }

  /**
   * T,. Ruft ein Modell auf
   */
  private async callModel(model: ModelConfig, request: ModelRequest): Promise<any> {
    // Timeout-Wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TimeoutError')), model.timeout);
    });

    // Model-Call (hier müsste die tatsächliche API-Integration erfolgen)
    const modelPromise = this.executeModelCall(model, request);

    // Race zwischen Timeout und Model-Call
    return Promise.race([modelPromise, timeoutPromise]) as Promise<any>;
  }

  /**
   * T,. Führt tatsächlichen Model-Call durch (Placeholder - muss implementiert werden)
   */
  private async executeModelCall(model: ModelConfig, request: ModelRequest): Promise<any> {
    // Placeholder: Hier würde die tatsächliche API-Integration erfolgen
    // z.B. OpenAI, Anthropic, OpenRouter, etc.
    
    console.log(`T,. Multi-Model Fallback: Call ${model.name} mit Prompt: ${request.prompt.substring(0, 50)}...`);
    
    // Simuliere API-Call
    await this.sleep(Math.random() * 1000 + 500);

    // Simuliere gelegentliche Fehler
    if (Math.random() < 0.1) {
      throw new Error('Simulated API Error');
    }

    return {
      text: `Response from ${model.name}`,
      model: model.id
    };
  }

  /**
   * T,. Prüft ob Modell in Cooldown ist
   */
  private isInCooldown(modelId: string): boolean {
    const errorTime = this.errors.get(modelId);
    if (!errorTime) {
      return false;
    }

    // Cooldown ist aktiv wenn Fehlerzähler >= maxConsecutiveErrors
    const errorCount = errorTime;
    if (errorCount < this.maxConsecutiveErrors) {
      return false;
    }

    // Prüfe ob Cooldown abgelaufen ist
    // (Vereinfacht: Fehlerzähler wird nach Cooldown zurückgesetzt)
    return true;
  }

  /**
   * T,. Aktiviert Cooldown für ein Modell
   */
  private setCooldown(modelId: string): void {
    // Cooldown wird durch Fehlerzähler repräsentiert
    // Nach Cooldown wird Fehlerzähler zurückgesetzt
    setTimeout(() => {
      this.errors.set(modelId, 0);
      console.log(`T,. Multi-Model Fallback: Cooldown abgelaufen für ${modelId}`);
    }, this.cooldownMs);
  }

  /**
   * T,. Sleep-Helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * T,. Gibt Liste aller registrierten Modelle zurück
   */
  getModels(): ModelConfig[] {
    return [...this.models];
  }

  /**
   * T,. Gibt Fehlerstatistiken zurück
   */
  getErrorStats(): Map<string, number> {
    return new Map(this.errors);
  }
}

