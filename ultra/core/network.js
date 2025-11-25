// Network Management - Netzwerke, Einladungen, Fusion

class NetworkManager {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
  }

  /**
   * Netzwerk erstellen
   * @param {object} data - Netzwerkdaten
   */
  async createNetwork(data) {
    const network = {
      id: `net://${this.generateId()}`,
      name: data.name || 'Unbenanntes Netzwerk',
      type: data.type || 'personal', // personal | business | topic
      ownerId: data.ownerId,
      members: [data.ownerId], // Owner ist automatisch Mitglied
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mergedFrom: null
    };

    const networks = await this.getNetworks();
    networks.push(network);
    await this.storage.set('networks', networks);
    
    this.eventBus.emit('NETWORK_CREATED', { network });
    return network;
  }

  /**
   * Netzwerk abrufen
   * @param {string} networkId - Netzwerk-ID
   */
  async getNetwork(networkId) {
    const networks = await this.getNetworks();
    return networks.find(n => n.id === networkId) || null;
  }

  /**
   * Alle Netzwerke abrufen
   */
  async getNetworks() {
    const networks = await this.storage.get('networks');
    return Array.isArray(networks) ? networks : [];
  }

  /**
   * Netzwerke eines Users abrufen
   * @param {string} userId - User-ID
   */
  async getUserNetworks(userId) {
    const networks = await this.getNetworks();
    return networks.filter(n => 
      n.ownerId === userId || n.members.includes(userId)
    );
  }

  /**
   * Mitglied zu Netzwerk hinzufügen
   * @param {string} networkId - Netzwerk-ID
   * @param {string} userId - User-ID
   */
  async addMember(networkId, userId) {
    const network = await this.getNetwork(networkId);
    if (!network) {
      throw new Error('Network not found');
    }

    if (!network.members.includes(userId)) {
      network.members.push(userId);
      network.updatedAt = new Date().toISOString();
      
      const networks = await this.getNetworks();
      const index = networks.findIndex(n => n.id === networkId);
      if (index > -1) {
        networks[index] = network;
        await this.storage.set('networks', networks);
        
        this.eventBus.emit('NETWORK_MEMBER_ADDED', { networkId, userId });
      }
    }

    return network;
  }

  /**
   * Mitglied aus Netzwerk entfernen
   * @param {string} networkId - Netzwerk-ID
   * @param {string} userId - User-ID
   */
  async removeMember(networkId, userId) {
    const network = await this.getNetwork(networkId);
    if (!network) {
      throw new Error('Network not found');
    }

    network.members = network.members.filter(id => id !== userId);
    network.updatedAt = new Date().toISOString();
    
    const networks = await this.getNetworks();
    const index = networks.findIndex(n => n.id === networkId);
    if (index > -1) {
      networks[index] = network;
      await this.storage.set('networks', networks);
      
      this.eventBus.emit('NETWORK_MEMBER_REMOVED', { networkId, userId });
    }

    return network;
  }

  /**
   * Einladung erstellen
   * @param {string} networkId - Netzwerk-ID
   * @param {string} fromUserId - Einladender User
   */
  async createInvitation(networkId, fromUserId) {
    const invitation = {
      id: `inv://${this.generateId()}`,
      fromUserId,
      networkId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      linkToken: this.generateToken()
    };

    const invitations = await this.getInvitations();
    invitations.push(invitation);
    await this.storage.set('invitations', invitations);
    
    this.eventBus.emit('INVITATION_CREATED', { invitation });
    return invitation;
  }

  /**
   * Einladung per Token auflösen
   * @param {string} token - Einladungs-Token
   * @param {string} userId - User der beitritt
   */
  async acceptInvitation(token, userId) {
    const invitations = await this.getInvitations();
    const invitation = invitations.find(inv => inv.linkToken === token && inv.status === 'pending');
    
    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    invitation.status = 'accepted';
    invitation.acceptedBy = userId;
    invitation.acceptedAt = new Date().toISOString();
    
    await this.storage.set('invitations', invitations);
    
    // User zum Netzwerk hinzufügen
    await this.addMember(invitation.networkId, userId);
    
    this.eventBus.emit('INVITATION_ACCEPTED', { invitation, userId });
    return invitation;
  }

  /**
   * Alle Einladungen abrufen
   */
  async getInvitations() {
    const invitations = await this.storage.get('invitations');
    return Array.isArray(invitations) ? invitations : [];
  }

  /**
   * Netzwerke fusionieren
   * @param {string} networkId1 - Erstes Netzwerk
   * @param {string} networkId2 - Zweites Netzwerk
   * @param {string} ownerId - Owner des neuen Netzwerks
   */
  async mergeNetworks(networkId1, networkId2, ownerId) {
    const network1 = await this.getNetwork(networkId1);
    const network2 = await this.getNetwork(networkId2);
    
    if (!network1 || !network2) {
      throw new Error('One or both networks not found');
    }

    // Neues fusioniertes Netzwerk erstellen
    const mergedNetwork = {
      id: `net://${this.generateId()}`,
      name: `${network1.name} + ${network2.name}`,
      type: network1.type,
      ownerId,
      members: [...new Set([...network1.members, ...network2.members])],
      description: `Fusioniert aus ${network1.name} und ${network2.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mergedFrom: [networkId1, networkId2]
    };

    const networks = await this.getNetworks();
    networks.push(mergedNetwork);
    await this.storage.set('networks', networks);
    
    this.eventBus.emit('NETWORKS_MERGED', { 
      network1: networkId1, 
      network2: networkId2, 
      mergedNetwork 
    });
    
    return mergedNetwork;
  }

  /**
   * Einladungs-URL generieren
   * @param {string} token - Einladungs-Token
   */
  generateInvitationUrl(token) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?i=${token}`;
  }

  /**
   * ID generieren
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  /**
   * Token generieren
   */
  generateToken() {
    return Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NetworkManager };
}

