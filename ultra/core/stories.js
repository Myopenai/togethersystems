// Stories Management - Temporäre Status-Updates (24h)

class StoriesManager {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
    this.storyLifetime = 24 * 60 * 60 * 1000; // 24 Stunden
  }

  /**
   * Story erstellen
   * @param {object} data - Story-Daten
   */
  async createStory(data) {
    const story = {
      id: `story://${this.generateId()}`,
      authorId: data.authorId,
      networkId: data.networkId || null,
      type: data.type || 'image', // image | video | text
      content: {
        media: data.media || [],
        text: data.text || ''
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.storyLifetime).toISOString(),
      views: []
    };

    const stories = await this.getStories();
    stories.push(story);
    await this.storage.set('stories', stories);
    
    this.eventBus.emit('STORY_CREATED', { story });
    return story;
  }

  /**
   * Story abrufen
   * @param {string} storyId - Story-ID
   */
  async getStory(storyId) {
    const stories = await this.getStories();
    return stories.find(s => s.id === storyId) || null;
  }

  /**
   * Alle aktiven Stories abrufen
   */
  async getStories() {
    const stories = await this.storage.get('stories') || [];
    const now = new Date();
    
    // Abgelaufene Stories entfernen
    const active = stories.filter(s => new Date(s.expiresAt) > now);
    
    if (active.length !== stories.length) {
      await this.storage.set('stories', active);
    }
    
    return active;
  }

  /**
   * Stories eines Users abrufen
   * @param {string} userId - User-ID
   */
  async getUserStories(userId) {
    const stories = await this.getStories();
    return stories.filter(s => s.authorId === userId);
  }

  /**
   * Stories für Feed abrufen (User + Netzwerke)
   * @param {string} userId - User-ID
   * @param {Array} networkIds - Netzwerk-IDs
   */
  async getFeedStories(userId, networkIds = []) {
    const stories = await this.getStories();
    return stories.filter(s => {
      // Eigene Stories
      if (s.authorId === userId) return true;
      
      // Stories aus Netzwerken
      if (s.networkId && networkIds.includes(s.networkId)) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Story als gesehen markieren
   * @param {string} storyId - Story-ID
   * @param {string} userId - User-ID
   */
  async markStoryViewed(storyId, userId) {
    const story = await this.getStory(storyId);
    if (!story) {
      return;
    }

    if (!story.views.some(v => v.userId === userId)) {
      story.views.push({
        userId,
        viewedAt: new Date().toISOString()
      });
      
      const stories = await this.getStories();
      const index = stories.findIndex(s => s.id === storyId);
      if (index > -1) {
        stories[index] = story;
        await this.storage.set('stories', stories);
        
        this.eventBus.emit('STORY_VIEWED', { storyId, userId });
      }
    }
  }

  /**
   * Story löschen
   * @param {string} storyId - Story-ID
   * @param {string} userId - User-ID (für Berechtigungsprüfung)
   */
  async deleteStory(storyId, userId) {
    const story = await this.getStory(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    if (story.authorId !== userId) {
      throw new Error('Not authorized to delete this story');
    }

    const stories = await this.getStories();
    const filtered = stories.filter(s => s.id !== storyId);
    await this.storage.set('stories', filtered);
    
    this.eventBus.emit('STORY_DELETED', { storyId });
    return true;
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
  module.exports = { StoriesManager };
}








