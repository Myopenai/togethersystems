/**
 * Event System für Settings-OS
 * 
 * Event Bus für Settings-Änderungen
 * Webhooks, Real-time Updates
 */

/**
 * Event Types
 */
export type SettingsEventType =
  | 'node.created'
  | 'node.updated'
  | 'node.deleted'
  | 'proposal.created'
  | 'proposal.approved'
  | 'proposal.rejected'
  | 'distribution.created'
  | 'notary.verified';

/**
 * Settings Event
 */
export interface SettingsEvent {
  type: SettingsEventType;
  nodeId?: string;
  timestamp: string;
  data: any;
  userId?: string;
}

/**
 * Event Bus
 */
export class SettingsEventBus {
  private listeners: Map<SettingsEventType, Array<(event: SettingsEvent) => void>> = new Map();
  private webhooks: Array<{ url: string; events: SettingsEventType[] }> = [];

  /**
   * Registriert Event Listener
   */
  on(eventType: SettingsEventType, callback: (event: SettingsEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * Emittiert Event
   */
  async emit(event: SettingsEvent): Promise<void> {
    // Lokale Listener
    const listeners = this.listeners.get(event.type) || [];
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    }

    // Webhooks
    for (const webhook of this.webhooks) {
      if (webhook.events.includes(event.type)) {
        try {
          await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
          });
        } catch (error) {
          console.error(`Error sending webhook to ${webhook.url}:`, error);
        }
      }
    }
  }

  /**
   * Registriert Webhook
   */
  registerWebhook(url: string, events: SettingsEventType[]): void {
    this.webhooks.push({ url, events });
  }

  /**
   * Entfernt Webhook
   */
  unregisterWebhook(url: string): void {
    this.webhooks = this.webhooks.filter(w => w.url !== url);
  }
}

/**
 * Singleton Event Bus
 */
export const settingsEventBus = new SettingsEventBus();

