// T,. OSTOSOS - Cross-Device Sync System
// P2P Mesh Network | WebRTC | CRDT | Storage Mesh

class OSTOSOSCrossDeviceSync {
  constructor() {
    this.deviceId = this.generateDeviceId();
    this.peers = new Map();
    this.syncEnabled = true;
    this.p2pEnabled = true;
    this.meshEnabled = true;
    this.storage = new Map();
  }

  async init() {
    console.log('[OSTOSOS Sync] System initialisiert - Device ID:', this.deviceId);
    
    // Prüfe ob Sync aktiviert ist
    const syncEnabled = localStorage.getItem('ostosos.sync.enabled');
    if (syncEnabled === 'false') {
      this.syncEnabled = false;
      return;
    }

    // Initialisiere P2P Mesh
    if (this.p2pEnabled) {
      await this.initP2PMesh();
    }
    
    // Initialisiere Storage Mesh
    if (this.meshEnabled) {
      await this.initStorageMesh();
    }
    
    // Starte Sync-Loop
    this.startSyncLoop();
  }

  generateDeviceId() {
    let deviceId = localStorage.getItem('ostosos.deviceId');
    if (!deviceId) {
      deviceId = 'device-' + crypto.randomUUID();
      localStorage.setItem('ostosos.deviceId', deviceId);
    }
    return deviceId;
  }

  async initP2PMesh() {
    // Skip P2P Mesh if running from file:// protocol
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
      console.log('[OSTOSOS Sync] File-Protokoll erkannt - P2P Mesh übersprungen');
      return;
    }
    
    console.log('[OSTOSOS Sync] Initialisiere P2P Mesh...');
    
    try {
      // WebRTC Configuration
      const config = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };
      
      // Signaling Server (optional) - nur wenn konfiguriert
      const signalingUrl = localStorage.getItem('ostosos.sync.signalingUrl');
      
      // Connect to signaling server nur wenn URL vorhanden und nicht default
      if (signalingUrl && signalingUrl !== 'wss://signaling.tel1.nl/') {
        await this.connectToSignaling(signalingUrl);
      } else {
        console.log('[OSTOSOS Sync] Kein Signaling Server konfiguriert - P2P Mesh ohne Signaling');
      }
      
      console.log('[OSTOSOS Sync] P2P Mesh initialisiert');
    } catch (error) {
      console.error('[OSTOSOS Sync] P2P Mesh Fehler:', error);
    }
  }

  async connectToSignaling(url) {
    // Skip signaling if running from file:// protocol or if URL is invalid
    if (window.location.protocol === 'file:' || !url || url === 'wss://signaling.tel1.nl/') {
      console.log('[OSTOSOS Sync] File-Protokoll oder ungültige URL - Signaling übersprungen');
      return;
    }
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('[OSTOSOS Sync] Signaling verbunden');
        
        // Announce device
        ws.send(JSON.stringify({
          type: 'announce',
          deviceId: this.deviceId,
          version: '1.0.0'
        }));
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'peer') {
          this.connectToPeer(message.deviceId, message.offer);
        }
      };
      
      ws.onerror = (error) => {
        console.error('[OSTOSOS Sync] Signaling Fehler:', error);
      };
      
      this.signalingConnection = ws;
    } catch (error) {
      console.error('[OSTOSOS Sync] Signaling-Verbindung Fehler:', error);
    }
  }

  async connectToPeer(peerId, offer) {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send candidate to peer via signaling
          if (this.signalingConnection) {
            this.signalingConnection.send(JSON.stringify({
              type: 'ice-candidate',
              deviceId: this.deviceId,
              peerId: peerId,
              candidate: event.candidate
            }));
          }
        }
      };
      
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onmessage = (event) => {
          this.handleSyncMessage(peerId, JSON.parse(event.data));
        };
      };
      
      if (offer) {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        // Send answer via signaling
        if (this.signalingConnection) {
          this.signalingConnection.send(JSON.stringify({
            type: 'answer',
            deviceId: this.deviceId,
            peerId: peerId,
            answer: answer
          }));
        }
      }
      
      this.peers.set(peerId, pc);
      console.log('[OSTOSOS Sync] Verbunden mit Peer:', peerId);
    } catch (error) {
      console.error('[OSTOSOS Sync] Peer-Verbindung Fehler:', error);
    }
  }

  async initStorageMesh() {
    console.log('[OSTOSOS Sync] Initialisiere Storage Mesh...');
    
    // Storage Mesh verwendet IndexedDB + localStorage
    // Daten werden über P2P synchronisiert
    
    // Lade lokale Daten
    await this.loadLocalData();
    
    console.log('[OSTOSOS Sync] Storage Mesh initialisiert');
  }

  async loadLocalData() {
    try {
      // Lade aus localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ostosos.')) {
          this.storage.set(key, localStorage.getItem(key));
        }
      });
      
      // Lade aus IndexedDB (optional)
      if ('indexedDB' in window) {
        // IndexedDB Sync-Logik hier
      }
    } catch (error) {
      console.error('[OSTOSOS Sync] Daten-Laden Fehler:', error);
    }
  }

  startSyncLoop() {
    setInterval(() => {
      if (this.syncEnabled) {
        this.syncData();
      }
    }, 30000); // Alle 30 Sekunden
  }

  async syncData() {
    try {
      // Sync mit allen Peers
      for (const [peerId, peer] of this.peers.entries()) {
        await this.syncWithPeer(peerId, peer);
      }
      
      console.log('[OSTOSOS Sync] Daten synchronisiert');
    } catch (error) {
      console.error('[OSTOSOS Sync] Sync Fehler:', error);
    }
  }

  async syncWithPeer(peerId, peer) {
    try {
      // Erstelle Data Channel falls nicht vorhanden
      let dataChannel = peer.dataChannel;
      
      if (!dataChannel || dataChannel.readyState !== 'open') {
        dataChannel = peer.createDataChannel('sync');
        dataChannel.onopen = () => {
          console.log('[OSTOSOS Sync] Data Channel geöffnet:', peerId);
        };
        peer.dataChannel = dataChannel;
      }
      
      if (dataChannel.readyState === 'open') {
        // Sende Sync-Daten
        const syncData = {
          type: 'sync',
          deviceId: this.deviceId,
          data: Object.fromEntries(this.storage),
          timestamp: Date.now()
        };
        
        dataChannel.send(JSON.stringify(syncData));
      }
    } catch (error) {
      console.error('[OSTOSOS Sync] Peer-Sync Fehler:', error);
    }
  }

  handleSyncMessage(peerId, message) {
    try {
      if (message.type === 'sync') {
        // Merge Daten (CRDT-Logik)
        Object.entries(message.data).forEach(([key, value]) => {
          const localValue = this.storage.get(key);
          
          // Last-Write-Wins (vereinfacht)
          if (!localValue || message.timestamp > (localStorage.getItem(key + '.timestamp') || 0)) {
            this.storage.set(key, value);
            localStorage.setItem(key, value);
            localStorage.setItem(key + '.timestamp', message.timestamp);
          }
        });
        
        console.log('[OSTOSOS Sync] Daten von Peer empfangen:', peerId);
      }
    } catch (error) {
      console.error('[OSTOSOS Sync] Message-Handling Fehler:', error);
    }
  }
}

// Auto-Initialize
if (typeof window !== 'undefined') {
  const syncSystem = new OSTOSOSCrossDeviceSync();
  syncSystem.init();
  
  // Global verfügbar
  window.OSTOSOSSyncSystem = syncSystem;
}

