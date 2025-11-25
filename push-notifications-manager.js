// Push-Notifications Manager - Vollständige Implementierung
// Service Worker Push-API Integration

class PushNotificationManager {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.publicKey = null; // VAPID Public Key (vom Server)
  }

  // Initialisieren
  async init(vapidPublicKey = null) {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker nicht unterstützt');
      return false;
    }

    if (!('PushManager' in window)) {
      console.warn('Push-Notifications nicht unterstützt');
      return false;
    }

    try {
      // Service Worker registrieren
      this.registration = await navigator.serviceWorker.ready;
      
      // VAPID Public Key setzen
      if (vapidPublicKey) {
        this.publicKey = vapidPublicKey;
      }
      
      // Bestehende Subscription prüfen
      this.subscription = await this.registration.pushManager.getSubscription();
      
      // Notification-Berechtigung prüfen
      const permission = Notification.permission;
      
      if (permission === 'default') {
        // Berechtigung anfordern
        const result = await Notification.requestPermission();
        console.log('Notification-Berechtigung:', result);
      }
      
      return true;
    } catch (err) {
      console.error('Push-Notifications Init Fehler:', err);
      return false;
    }
  }

  // Subscription erstellen/erneuern
  async subscribe(userId = null) {
    if (!this.registration) {
      throw new Error('Service Worker nicht registriert');
    }

    try {
      // Bestehende Subscription entfernen (falls vorhanden)
      if (this.subscription) {
        await this.subscription.unsubscribe();
      }

      // Neue Subscription erstellen
      const applicationServerKey = this.publicKey 
        ? this.urlBase64ToUint8Array(this.publicKey)
        : null;

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Subscription zum Server senden
      if (userId) {
        await this.sendSubscriptionToServer(this.subscription, userId);
      }

      console.log('Push-Subscription erstellt:', this.subscription);
      return this.subscription;
    } catch (err) {
      console.error('Push-Subscription Fehler:', err);
      throw err;
    }
  }

  // Subscription abmelden
  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('Push-Subscription abgemeldet');
        return true;
      } catch (err) {
        console.error('Push-Unsubscribe Fehler:', err);
        return false;
      }
    }
    return true;
  }

  // Subscription zum Server senden
  async sendSubscriptionToServer(subscription, userId, apiBase = '/api') {
    try {
      const response = await fetch(`${apiBase}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
              auth: this.arrayBufferToBase64(subscription.getKey('auth')),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Subscription zum Server senden Fehler:', err);
      throw err;
    }
  }

  // Manuelle Notification anzeigen (für Tests)
  async showNotification(title, options = {}) {
    if (!this.registration) {
      throw new Error('Service Worker nicht registriert');
    }

    const defaultOptions = {
      body: options.body || '',
      icon: options.icon || './icon.png',
      badge: options.badge || './icon.png',
      tag: options.tag || 'notification',
      data: options.data || null,
      requireInteraction: options.important || false,
      vibrate: options.vibrate || [200, 100, 200],
      sound: options.sound || null,
    };

    await this.registration.showNotification(title, defaultOptions);
  }

  // Helper: VAPID Key konvertieren
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Helper: ArrayBuffer zu Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Subscription-Status prüfen
  isSubscribed() {
    return this.subscription !== null;
  }

  // Notification-Berechtigung prüfen
  getPermission() {
    return Notification.permission;
  }
}

// Globale Instanz
const pushManager = new PushNotificationManager();

// Service Worker Message Handler (für Push-Events)
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
      case 'push_received':
        // Push-Nachricht empfangen
        console.log('Push-Nachricht empfangen:', data);
        // Optional: UI-Update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('push-notification', { detail: data }));
        }
        break;
      
      case 'notification_click':
        // Notification angeklickt
        if (data.url) {
          window.open(data.url, '_blank');
        }
        break;
    }
  });
}

// Export
if (typeof window !== 'undefined') {
  window.PushNotificationManager = PushNotificationManager;
  window.pushManager = pushManager;
}


