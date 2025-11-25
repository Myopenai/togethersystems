// Posts Management - Feed, Timeline, Reaktionen

class PostsManager {
  constructor(storage, eventBus) {
    this.storage = storage;
    this.eventBus = eventBus;
  }

  /**
   * Post erstellen
   * @param {object} data - Post-Daten
   */
  async createPost(data) {
    const post = {
      id: `post://${this.generateId()}`,
      authorId: data.authorId,
      networkId: data.networkId || null,
      visibility: data.visibility || 'public', // public | network | private
      type: data.type || 'text', // text | media | event | link | life_event
      content: {
        text: data.text || '',
        media: data.media || [],
        lifeEvent: data.lifeEvent || null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: []
    };

    const posts = await this.getPosts();
    posts.unshift(post); // Neueste zuerst
    await this.storage.set('posts', posts);
    
    this.eventBus.emit('POST_CREATED', { post });
    return post;
  }

  /**
   * Post abrufen
   * @param {string} postId - Post-ID
   */
  async getPost(postId) {
    const posts = await this.getPosts();
    return posts.find(p => p.id === postId) || null;
  }

  /**
   * Alle Posts abrufen
   */
  async getPosts() {
    const posts = await this.storage.get('posts');
    return Array.isArray(posts) ? posts : [];
  }

  /**
   * Posts für User abrufen (Feed)
   * @param {string} userId - User-ID
   * @param {Array} networkIds - Netzwerk-IDs des Users
   */
  async getPostsForUser(userId, networkIds = []) {
    const posts = await this.getPosts();
    
    return posts.filter(post => {
      // Eigene Posts
      if (post.authorId === userId) return true;
      
      // Public Posts
      if (post.visibility === 'public') return true;
      
      // Network Posts
      if (post.visibility === 'network' && post.networkId && networkIds.includes(post.networkId)) {
        return true;
      }
      
      // Private Posts nur für den Autor
      if (post.visibility === 'private' && post.authorId === userId) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Posts eines Netzwerks abrufen
   * @param {string} networkId - Netzwerk-ID
   */
  async getNetworkPosts(networkId) {
    const posts = await this.getPosts();
    return posts.filter(p => 
      p.networkId === networkId && 
      (p.visibility === 'public' || p.visibility === 'network')
    );
  }

  /**
   * Reaktion hinzufügen
   * @param {string} postId - Post-ID
   * @param {string} userId - User-ID
   * @param {string} kind - Reaktions-Typ (like, support, etc.)
   */
  async addReaction(postId, userId, kind = 'like') {
    const post = await this.getPost(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Prüfe ob bereits reagiert
    const existingReaction = post.reactions.find(r => r.userId === userId);
    
    if (existingReaction) {
      // Reaktion aktualisieren
      existingReaction.kind = kind;
      existingReaction.updatedAt = new Date().toISOString();
    } else {
      // Neue Reaktion
      post.reactions.push({
        userId,
        kind,
        createdAt: new Date().toISOString()
      });
    }

    post.updatedAt = new Date().toISOString();
    
    const posts = await this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index > -1) {
      posts[index] = post;
      await this.storage.set('posts', posts);
      
      this.eventBus.emit('POST_REACTION_ADDED', { postId, userId, kind });
    }

    return post;
  }

  /**
   * Reaktion entfernen
   * @param {string} postId - Post-ID
   * @param {string} userId - User-ID
   */
  async removeReaction(postId, userId) {
    const post = await this.getPost(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    post.reactions = post.reactions.filter(r => r.userId !== userId);
    post.updatedAt = new Date().toISOString();
    
    const posts = await this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index > -1) {
      posts[index] = post;
      await this.storage.set('posts', posts);
      
      this.eventBus.emit('POST_REACTION_REMOVED', { postId, userId });
    }

    return post;
  }

  /**
   * Post aktualisieren
   * @param {string} postId - Post-ID
   * @param {object} updates - Zu aktualisierende Felder
   */
  async updatePost(postId, updates) {
    const post = await this.getPost(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const updated = {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const posts = await this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index > -1) {
      posts[index] = updated;
      await this.storage.set('posts', posts);
      
      this.eventBus.emit('POST_UPDATED', { post: updated });
    }

    return updated;
  }

  /**
   * Post löschen
   * @param {string} postId - Post-ID
   * @param {string} userId - User-ID (für Berechtigungsprüfung)
   */
  async deletePost(postId, userId) {
    const post = await this.getPost(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Nur Autor kann löschen
    if (post.authorId !== userId) {
      throw new Error('Not authorized to delete this post');
    }

    const posts = await this.getPosts();
    const filtered = posts.filter(p => p.id !== postId);
    await this.storage.set('posts', filtered);
    
    this.eventBus.emit('POST_DELETED', { postId });
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
  module.exports = { PostsManager };
}

