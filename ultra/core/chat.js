// Chat Management - Direkt & Gruppen-Chats

class ChatManager {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
  }

  /**
   * Chat erstellen
   * @param {object} data - Chat-Daten
   */
  async createChat(data) {
    const chat = {
      id: `chat://${this.generateId()}`,
      type: data.type || 'direct', // direct | group
      participants: data.participants || [data.userId],
      name: data.name || null, // Für Gruppen-Chats
      createdBy: data.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    const chats = await this.getChats();
    chats.push(chat);
    await this.storage.set('chats', chats);
    
    this.eventBus.emit('CHAT_CREATED', { chat });
    return chat;
  }

  /**
   * Chat abrufen
   * @param {string} chatId - Chat-ID
   */
  async getChat(chatId) {
    const chats = await this.getChats();
    return chats.find(c => c.id === chatId) || null;
  }

  /**
   * Alle Chats abrufen
   */
  async getChats() {
    const chats = await this.storage.get('chats');
    return Array.isArray(chats) ? chats : [];
  }

  /**
   * Chats eines Users abrufen
   * @param {string} userId - User-ID
   */
  async getUserChats(userId) {
    const chats = await this.getChats();
    return chats.filter(c => c.participants.includes(userId));
  }

  /**
   * Direkt-Chat mit User finden oder erstellen
   * @param {string} userId1 - Erster User
   * @param {string} userId2 - Zweiter User
   */
  async getOrCreateDirectChat(userId1, userId2) {
    const chats = await this.getChats();
    const directChat = chats.find(c => 
      c.type === 'direct' && 
      c.participants.includes(userId1) && 
      c.participants.includes(userId2) &&
      c.participants.length === 2
    );

    if (directChat) {
      return directChat;
    }

    // Neuen Chat erstellen
    return await this.createChat({
      type: 'direct',
      participants: [userId1, userId2],
      userId: userId1
    });
  }

  /**
   * Nachricht hinzufügen
   * @param {string} chatId - Chat-ID
   * @param {object} messageData - Nachrichtendaten
   */
  async addMessage(chatId, messageData) {
    const chat = await this.getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = {
      id: `msg://${this.generateId()}`,
      chatId,
      authorId: messageData.authorId,
      text: messageData.text || '',
      media: messageData.media || [],
      createdAt: new Date().toISOString(),
      read: false
    };

    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    
    const chats = await this.getChats();
    const index = chats.findIndex(c => c.id === chatId);
    if (index > -1) {
      chats[index] = chat;
      await this.storage.set('chats', chats);
      
      this.eventBus.emit('CHAT_MESSAGE_CREATED', { chatId, message });
    }

    return message;
  }

  /**
   * Nachricht als gelesen markieren
   * @param {string} chatId - Chat-ID
   * @param {string} messageId - Nachrichten-ID
   * @param {string} userId - User-ID
   */
  async markMessageRead(chatId, messageId, userId) {
    const chat = await this.getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = chat.messages.find(m => m.id === messageId);
    if (message && message.authorId !== userId) {
      message.read = true;
      
      const chats = await this.getChats();
      const index = chats.findIndex(c => c.id === chatId);
      if (index > -1) {
        chats[index] = chat;
        await this.storage.set('chats', chats);
        
        this.eventBus.emit('CHAT_MESSAGE_READ', { chatId, messageId, userId });
      }
    }
  }

  /**
   * Teilnehmer zu Gruppen-Chat hinzufügen
   * @param {string} chatId - Chat-ID
   * @param {string} userId - User-ID
   */
  async addParticipant(chatId, userId) {
    const chat = await this.getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.type !== 'group') {
      throw new Error('Can only add participants to group chats');
    }

    if (!chat.participants.includes(userId)) {
      chat.participants.push(userId);
      chat.updatedAt = new Date().toISOString();
      
      const chats = await this.getChats();
      const index = chats.findIndex(c => c.id === chatId);
      if (index > -1) {
        chats[index] = chat;
        await this.storage.set('chats', chats);
        
        this.eventBus.emit('CHAT_PARTICIPANT_ADDED', { chatId, userId });
      }
    }

    return chat;
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
  module.exports = { ChatManager };
}

