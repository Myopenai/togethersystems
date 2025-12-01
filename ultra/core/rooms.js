// Rooms Management - Räume, Events, Projekte

class RoomsManager {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
  }

  /**
   * Raum erstellen
   * @param {object} data - Raum-Daten
   */
  async createRoom(data) {
    const room = {
      id: `room://${this.generateId()}`,
      name: data.name || 'Unbenannter Raum',
      description: data.description || '',
      type: data.type || 'general', // general | event | project | family
      networkId: data.networkId || null,
      createdBy: data.userId,
      members: [data.userId], // Ersteller ist automatisch Mitglied
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: data.metadata || {}
    };

    const rooms = await this.getRooms();
    rooms.push(room);
    await this.storage.set('rooms', rooms);
    
    this.eventBus.emit('ROOM_CREATED', { room });
    return room;
  }

  /**
   * Raum abrufen
   * @param {string} roomId - Raum-ID
   */
  async getRoom(roomId) {
    const rooms = await this.getRooms();
    return rooms.find(r => r.id === roomId) || null;
  }

  /**
   * Alle Räume abrufen
   */
  async getRooms() {
    const rooms = await this.storage.get('rooms');
    return Array.isArray(rooms) ? rooms : [];
  }

  /**
   * Räume eines Users abrufen
   * @param {string} userId - User-ID
   */
  async getUserRooms(userId) {
    const rooms = await this.getRooms();
    return rooms.filter(r => r.members.includes(userId));
  }

  /**
   * Räume eines Netzwerks abrufen
   * @param {string} networkId - Netzwerk-ID
   */
  async getNetworkRooms(networkId) {
    const rooms = await this.getRooms();
    return rooms.filter(r => r.networkId === networkId);
  }

  /**
   * Mitglied zu Raum hinzufügen
   * @param {string} roomId - Raum-ID
   * @param {string} userId - User-ID
   */
  async addMember(roomId, userId) {
    const room = await this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      room.updatedAt = new Date().toISOString();
      
      const rooms = await this.getRooms();
      const index = rooms.findIndex(r => r.id === roomId);
      if (index > -1) {
        rooms[index] = room;
        await this.storage.set('rooms', rooms);
        
        this.eventBus.emit('ROOM_JOINED', { roomId, userId });
      }
    }

    return room;
  }

  /**
   * Mitglied aus Raum entfernen
   * @param {string} roomId - Raum-ID
   * @param {string} userId - User-ID
   */
  async removeMember(roomId, userId) {
    const room = await this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.members = room.members.filter(id => id !== userId);
    room.updatedAt = new Date().toISOString();
    
    const rooms = await this.getRooms();
    const index = rooms.findIndex(r => r.id === roomId);
    if (index > -1) {
      rooms[index] = room;
      await this.storage.set('rooms', rooms);
      
      this.eventBus.emit('ROOM_LEFT', { roomId, userId });
    }

    return room;
  }

  /**
   * Event-Raum erstellen
   * @param {object} data - Event-Daten
   */
  async createEventRoom(data) {
    const room = await this.createRoom({
      ...data,
      type: 'event',
      metadata: {
        ...data.metadata,
        eventDate: data.eventDate,
        eventLocation: data.eventLocation,
        eventType: data.eventType
      }
    });

    this.eventBus.emit('EVENT_ROOM_CREATED', { room });
    return room;
  }

  /**
   * ID generieren
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RoomsManager };
}








