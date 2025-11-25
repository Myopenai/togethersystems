// Ultra-Social-Media Portal - Erweiterte App mit allen Features
// Vollständige Integration aller Module und Event-Flows

// Globale Instanzen
let identityManager, networkManager, postsManager, chatManager, roomsManager, storiesManager, manifestBridge, extensionsRegistry;
let currentRoute = 'home';
let currentIdentity = null;
let currentChatId = null;
let currentRoomId = null;

// App initialisieren
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Ultra Portal initialisiert');
  
  // Storage initialisieren
  await storage.init();
  window.ultraStorage = storage;
  
  // Extension Registry initialisieren
  extensionsRegistry = initRegistry(eventBus);
  window.extensionsRegistry = extensionsRegistry;
  
  // Pending Extensions registrieren
  if (window._pendingExtensions) {
    window._pendingExtensions.forEach(meta => {
      extensionsRegistry.register(meta);
    });
    window._pendingExtensions = [];
  }
  
  // Manager initialisieren
  identityManager = new IdentityManager(storage, eventBus);
  networkManager = new NetworkManager(storage, eventBus);
  postsManager = new PostsManager(storage, eventBus);
  chatManager = new ChatManager(storage, eventBus);
  roomsManager = new RoomsManager(storage, eventBus);
  storiesManager = new StoriesManager(storage, eventBus);
  manifestBridge = new ManifestBridge(storage, eventBus);
  
  // Event-Listener registrieren
  setupEventListeners();
  
  // Prüfe Einladungs-Token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('i');
  
  // App starten
  eventBus.emit('APP_LOAD_REQUESTED', { urlParams: Object.fromEntries(urlParams) });
  eventBus.emit('APP_STARTED');
  
  // Manifest-Daten laden
  const manifestData = await manifestBridge.loadManifestData();
  
  // Identity prüfen
  const identity = await identityManager.init();
  
  if (!identity) {
    // Prüfe ob Manifest vorhanden
    const hasManifest = await manifestBridge.hasManifest();
    if (hasManifest && manifestData) {
      // Identity aus Manifest erstellen
      await identityManager.importManifest(manifestData);
      const newIdentity = await identityManager.init();
      if (newIdentity) {
        currentIdentity = newIdentity;
        loadHomeView();
        return;
      }
    }
    showIdentitySetup();
  } else {
    currentIdentity = identity;
    loadHomeView();
  }
  
  // Einladungs-Token verarbeiten
  if (inviteToken) {
    eventBus.emit('INVITATION_TOKEN_DETECTED', { token: inviteToken });
    await handleInvitationToken(inviteToken);
  }
  
  // PWA Install Prompt
  setupPWAInstall();
});

// Event-Listener Setup
function setupEventListeners() {
  // Identity Events
  eventBus.on('IDENTITY_CREATED', (event) => {
    currentIdentity = event.payload.identity;
    hideIdentitySetup();
    loadHomeView();
  });
  
  eventBus.on('IDENTITY_FOUND', (event) => {
    currentIdentity = event.payload.identity;
    loadHomeView();
  });
  
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      navigateTo(route);
    });
  });
  
  // Composer Actions
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const action = e.currentTarget.getAttribute('data-action');
      handleComposerAction(action);
    });
  });
  
  // Extension Actions im Composer
  eventBus.on('EXTENSION_REGISTERED', (event) => {
    updateComposerActions();
  });
  
  // Identity Form
  const identityForm = document.getElementById('identityForm');
  if (identityForm) {
    identityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleIdentitySubmit();
    });
    
    const identityType = document.getElementById('identityType');
    identityType.addEventListener('change', (e) => {
      const type = e.target.value;
      const companyFields = document.getElementById('companyFields');
      const registerFields = document.getElementById('registerFields');
      
      if (type === 'company' || type === 'person_business') {
        companyFields.style.display = 'block';
        registerFields.style.display = 'block';
      } else {
        companyFields.style.display = 'none';
        registerFields.style.display = 'none';
      }
    });
  }
  
  // Post Events
  eventBus.on('POST_CREATED', (event) => {
    loadFeed();
  });
  
  // Chat Events
  eventBus.on('CHAT_MESSAGE_CREATED', (event) => {
    if (currentChatId === event.payload.chatId) {
      loadChatMessages(currentChatId);
    }
    loadChatsList();
  });
  
  // Network Events
  eventBus.on('NETWORK_CREATED', (event) => {
    loadNetworksView();
  });
  
  // Room Events
  eventBus.on('ROOM_CREATED', (event) => {
    loadRoomsView();
  });
  
  // Story Events
  eventBus.on('STORY_CREATED', (event) => {
    loadStoriesView();
  });
  
  // Extension Events
  eventBus.on('EXTENSION_ACTION_SELECTED', async (event) => {
    await handleExtensionAction(event.payload);
  });
  
  // Buttons
  const createNetworkBtn = document.getElementById('createNetworkBtn');
  if (createNetworkBtn) {
    createNetworkBtn.addEventListener('click', () => showCreateNetworkDialog());
  }
  
  const createRoomBtn = document.getElementById('createRoomBtn');
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => showCreateRoomDialog());
  }
  
  const newChatBtn = document.getElementById('newChatBtn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => showNewChatDialog());
  }
  
  const sendChatBtn = document.getElementById('sendChatBtn');
  const chatInput = document.getElementById('chatInput');
  if (sendChatBtn && chatInput) {
    sendChatBtn.addEventListener('click', () => sendChatMessage());
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
  
  const createStoryBtn = document.getElementById('createStoryBtn');
  if (createStoryBtn) {
    createStoryBtn.addEventListener('click', () => showCreateStoryDialog());
  }
  
  // Export/Import
  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => exportAllData());
  }
  
  const importDataBtn = document.getElementById('importDataBtn');
  if (importDataBtn) {
    importDataBtn.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        importAllData(file);
      }
    });
  }
  
  const exportManifestBtn = document.getElementById('exportManifestBtn');
  if (exportManifestBtn) {
    exportManifestBtn.addEventListener('click', () => exportManifestData());
  }
  
  const importManifestBtn = document.getElementById('importManifestBtn');
  if (importManifestBtn) {
    importManifestBtn.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        importManifestData(file);
      }
    });
  }
}

// Navigation
function navigateTo(route) {
  currentRoute = route;
  
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  const view = document.getElementById(`${route}View`);
  if (view) {
    view.classList.add('active');
  }
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-route') === route) {
      btn.classList.add('active');
    }
  });
  
  switch(route) {
    case 'home':
      loadHomeView();
      break;
    case 'chats':
      loadChatsView();
      break;
    case 'networks':
      loadNetworksView();
      break;
    case 'rooms':
      loadRoomsView();
      break;
    case 'profile':
      loadProfileView();
      break;
    case 'more':
      loadMoreView();
      break;
  }
}

// Composer Actions aktualisieren (mit Extensions)
function updateComposerActions() {
  const composerActions = document.querySelector('.composer-actions');
  if (!composerActions) return;
  
  // Basis-Aktionen
  const baseActions = [
    { id: 'message', icon: '💬', label: 'Nachricht senden' },
    { id: 'call', icon: '📞', label: 'Call starten' },
    { id: 'file', icon: '📎', label: 'Datei/Vertrag senden' },
    { id: 'event', icon: '📅', label: 'Termin/Voucher anbieten' }
  ];
  
  // Extension-Aktionen
  const extensionActions = extensionsRegistry.getComposerActions();
  
  // Alle Aktionen kombinieren
  const allActions = [...baseActions, ...extensionActions.map(a => ({
    id: `ext-${a.extensionId}-${a.id}`,
    icon: a.icon || '🔌',
    label: a.label,
    extensionId: a.extensionId,
    actionId: a.id
  }))];
  
  composerActions.innerHTML = allActions.map(action => `
    <button class="action-card" 
            data-action="${action.id}"
            data-extension-id="${action.extensionId || ''}"
            data-action-id="${action.actionId || ''}">
      <span class="icon">${action.icon}</span>
      <span>${escapeHtml(action.label)}</span>
    </button>
  `).join('');
  
  // Event-Listener neu setzen
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const action = e.currentTarget.getAttribute('data-action');
      const extensionId = e.currentTarget.getAttribute('data-extension-id');
      const actionId = e.currentTarget.getAttribute('data-action-id');
      
      if (extensionId && actionId) {
        handleExtensionAction({ extensionId, actionId });
      } else {
        handleComposerAction(action);
      }
    });
  });
}

// Extension-Aktion behandeln
async function handleExtensionAction(payload) {
  const { extensionId, actionId, context = {} } = payload;
  
  if (!currentIdentity) {
    alert('Bitte zuerst Identität erstellen');
    return;
  }
  
  context.userId = currentIdentity.id;
  context.networkId = null; // TODO: Aktuelles Netzwerk
  
  const result = extensionsRegistry.executeAction(extensionId, actionId, context);
  
  if (result && result.type === 'form') {
    showExtensionForm(result, extensionId, actionId);
  } else if (result && result.type === 'list') {
    showExtensionList(result);
  }
}

// Extension-Formular anzeigen
function showExtensionForm(formData, extensionId, actionId) {
  const formHtml = `
    <div class="modal" id="extensionFormModal">
      <div class="modal-content">
        <h2>${escapeHtml(formData.title)}</h2>
        <form id="extensionForm">
          ${formData.fields.map(field => `
            <div class="form-group">
              <label>${escapeHtml(field.label)}:</label>
              ${field.type === 'textarea' ? 
                `<textarea id="field-${field.name}" ${field.required ? 'required' : ''}></textarea>` :
                `<input type="${field.type}" id="field-${field.name}" ${field.required ? 'required' : ''}>`
              }
            </div>
          `).join('')}
          <button type="submit" class="btn-primary">Veröffentlichen</button>
          <button type="button" class="btn-secondary" onclick="document.getElementById('extensionFormModal').remove()">Abbrechen</button>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHtml);
  const modal = document.getElementById('extensionFormModal');
  modal.style.display = 'flex';
  
  document.getElementById('extensionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formDataObj = {};
    formData.fields.forEach(field => {
      const input = document.getElementById(`field-${field.name}`);
      formDataObj[field.name] = input.value;
    });
    
    const extension = extensionsRegistry.getExtension(extensionId);
    if (extension && extension.instance && extension.instance.handleSubmission) {
      await extension.instance.handleSubmission(formDataObj, {
        userId: currentIdentity.id
      });
    }
    
    modal.remove();
    loadFeed();
  });
}

// Identity Setup
function showIdentitySetup() {
  const modal = document.getElementById('identitySetup');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function hideIdentitySetup() {
  const modal = document.getElementById('identitySetup');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function handleIdentitySubmit() {
  const type = document.getElementById('identityType').value;
  const displayName = document.getElementById('displayName').value;
  const companyName = document.getElementById('companyName').value;
  const registerId = document.getElementById('registerId').value;
  
  const identityData = {
    type,
    displayName,
    companyName: type === 'company' || type === 'person_business' ? companyName : null,
    registerId: type === 'company' || type === 'person_business' ? registerId : null
  };
  
  await identityManager.createIdentity(identityData);
}

// Home View
async function loadHomeView() {
  await loadFeed();
  updateComposerActions();
}

// Feed laden
async function loadFeed() {
  const feedContainer = document.getElementById('feed');
  if (!feedContainer) return;
  
  feedContainer.innerHTML = '<div class="feed-loading">Lade Feed...</div>';
  
  try {
    const networkIds = currentIdentity ? 
      (await networkManager.getUserNetworks(currentIdentity.id)).map(n => n.id) : [];
    
    let posts = currentIdentity ? 
      await postsManager.getPostsForUser(currentIdentity.id, networkIds) : [];
    
    // Extension-Filter anwenden
    posts = extensionsRegistry.filterFeed(posts);
    
    if (posts.length === 0) {
      feedContainer.innerHTML = `
        <div class="feed-empty">
          <p>Noch keine Posts vorhanden.</p>
          <p>Erstelle deinen ersten Post!</p>
        </div>
      `;
      return;
    }
    
    feedContainer.innerHTML = posts.map(post => {
      let html = renderPost(post);
      // Extension-Post-Rendering
      html = extensionsRegistry.renderPost(post, html);
      return html;
    }).join('');
    
    // Event-Listener für Reaktionen
    feedContainer.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const postId = e.currentTarget.getAttribute('data-post-id');
        await postsManager.addReaction(postId, currentIdentity.id, 'like');
        loadFeed();
      });
    });
    
  } catch (error) {
    console.error('Error loading feed:', error);
    feedContainer.innerHTML = '<div class="feed-error">Fehler beim Laden des Feeds.</div>';
  }
}

// Post rendern
function renderPost(post) {
  const reactionsCount = post.reactions.length;
  const hasUserReaction = currentIdentity && 
    post.reactions.some(r => r.userId === currentIdentity.id);
  
  return `
    <div class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        <div class="post-author">
          <span class="author-name">${post.authorId}</span>
          <span class="post-time">${formatTime(post.createdAt)}</span>
        </div>
      </div>
      <div class="post-content">
        <p>${escapeHtml(post.content.text)}</p>
        ${post.content.media && post.content.media.length > 0 ? 
          `<div class="post-media">${post.content.media.map(m => 
            `<img src="${m.dataUrl}" alt="Media">`).join('')}</div>` : ''}
      </div>
      <div class="post-actions">
        <button class="reaction-btn ${hasUserReaction ? 'active' : ''}" 
                data-post-id="${post.id}">
          👍 ${reactionsCount}
        </button>
      </div>
    </div>
  `;
}

// Composer Actions
function handleComposerAction(action) {
  if (!currentIdentity) {
    alert('Bitte zuerst Identität erstellen');
    return;
  }
  
  switch(action) {
    case 'message':
      showMessageComposer();
      break;
    case 'call':
      alert('Call-Funktion wird implementiert');
      break;
    case 'file':
      showFileComposer();
      break;
    case 'event':
      showEventComposer();
      break;
  }
}

function showMessageComposer() {
  const text = prompt('Nachricht eingeben:');
  if (text && currentIdentity) {
    postsManager.createPost({
      authorId: currentIdentity.id,
      text,
      type: 'text',
      visibility: 'public'
    });
  }
}

function showFileComposer() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file && currentIdentity) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await postsManager.createPost({
          authorId: currentIdentity.id,
          text: `Datei: ${file.name}`,
          type: 'media',
          media: [{ dataUrl: ev.target.result, name: file.name }],
          visibility: 'public'
        });
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function showEventComposer() {
  const title = prompt('Event-Titel:');
  if (title && currentIdentity) {
    postsManager.createPost({
      authorId: currentIdentity.id,
      text: `Event: ${title}`,
      type: 'event',
      visibility: 'public'
    });
  }
}

// Chats View
async function loadChatsView() {
  await loadChatsList();
}

async function loadChatsList() {
  const chatsList = document.getElementById('chatsList');
  if (!chatsList || !currentIdentity) return;
  
  try {
    const chats = await chatManager.getUserChats(currentIdentity.id);
    
    chatsList.innerHTML = chats.length === 0 ? 
      '<p>Noch keine Chats. Erstelle einen neuen Chat!</p>' :
      chats.map(chat => `
        <div class="chat-item" data-chat-id="${chat.id}">
          <div class="chat-name">${chat.type === 'direct' ? 'Direkt-Chat' : escapeHtml(chat.name || 'Gruppen-Chat')}</div>
          <div class="chat-preview">${chat.messages.length > 0 ? escapeHtml(chat.messages[chat.messages.length - 1].text) : 'Keine Nachrichten'}</div>
        </div>
      `).join('');
    
    chatsList.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.getAttribute('data-chat-id');
        currentChatId = chatId;
        loadChatMessages(chatId);
      });
    });
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

async function loadChatMessages(chatId) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const chat = await chatManager.getChat(chatId);
  if (!chat) return;
  
  chatMessages.innerHTML = chat.messages.map(msg => `
    <div class="chat-message ${msg.authorId === currentIdentity.id ? 'own' : ''}">
      <div class="message-text">${escapeHtml(msg.text)}</div>
      <div class="message-time">${formatTime(msg.createdAt)}</div>
    </div>
  `).join('');
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput || !currentChatId || !currentIdentity) return;
  
  const text = chatInput.value.trim();
  if (!text) return;
  
  await chatManager.addMessage(currentChatId, {
    authorId: currentIdentity.id,
    text
  });
  
  chatInput.value = '';
}

function showNewChatDialog() {
  const userId = prompt('User-ID für Direkt-Chat:');
  if (userId && currentIdentity) {
    chatManager.getOrCreateDirectChat(currentIdentity.id, userId).then(chat => {
      currentChatId = chat.id;
      loadChatsView();
      loadChatMessages(chat.id);
    });
  }
}

// Networks View
async function loadNetworksView() {
  const networksList = document.getElementById('networksList');
  if (!networksList || !currentIdentity) return;
  
  try {
    const networks = await networkManager.getUserNetworks(currentIdentity.id);
    
    networksList.innerHTML = networks.length === 0 ? 
      '<p>Noch keine Netzwerke. Erstelle dein erstes Netzwerk!</p>' :
      networks.map(network => `
        <div class="network-card">
          <h3>${escapeHtml(network.name)}</h3>
          <p>${network.members.length} Mitglieder</p>
          <button class="btn-secondary" onclick="generateInvitationLink('${network.id}')">Einladen</button>
        </div>
      `).join('');
  } catch (error) {
    console.error('Error loading networks:', error);
  }
}

async function showCreateNetworkDialog() {
  const name = prompt('Netzwerkname:');
  if (name && currentIdentity) {
    await networkManager.createNetwork({
      name,
      userId: currentIdentity.id,
      type: 'personal'
    });
  }
}

async function generateInvitationLink(networkId) {
  const invitation = await networkManager.createInvitation(networkId, currentIdentity.id);
  const url = networkManager.generateInvitationUrl(invitation.linkToken);
  prompt('Einladungs-Link (kopieren):', url);
}

// Rooms View
async function loadRoomsView() {
  const roomsList = document.getElementById('roomsList');
  if (!roomsList || !currentIdentity) return;
  
  try {
    const rooms = await roomsManager.getUserRooms(currentIdentity.id);
    
    roomsList.innerHTML = rooms.length === 0 ? 
      '<p>Noch keine Räume. Erstelle deinen ersten Raum!</p>' :
      rooms.map(room => `
        <div class="room-card">
          <h3>${escapeHtml(room.name)}</h3>
          <p>${escapeHtml(room.description || '')}</p>
          <p>${room.members.length} Mitglieder</p>
        </div>
      `).join('');
  } catch (error) {
    console.error('Error loading rooms:', error);
  }
}

async function showCreateRoomDialog() {
  const name = prompt('Raumname:');
  if (name && currentIdentity) {
    await roomsManager.createRoom({
      name,
      userId: currentIdentity.id,
      type: 'general'
    });
  }
}

// Stories View
async function loadStoriesView() {
  const storiesList = document.getElementById('storiesList');
  if (!storiesList || !currentIdentity) return;
  
  try {
    const networkIds = (await networkManager.getUserNetworks(currentIdentity.id)).map(n => n.id);
    const stories = await storiesManager.getFeedStories(currentIdentity.id, networkIds);
    
    storiesList.innerHTML = stories.length === 0 ? 
      '<p>Noch keine Stories. Erstelle deine erste Story!</p>' :
      stories.map(story => `
        <div class="story-card">
          <div class="story-content">
            ${story.content.media && story.content.media.length > 0 ? 
              `<img src="${story.content.media[0].dataUrl}" alt="Story">` : ''}
            <p>${escapeHtml(story.content.text)}</p>
          </div>
          <div class="story-meta">
            ${formatTime(story.createdAt)} • ${story.views.length} Aufrufe
          </div>
        </div>
      `).join('');
  } catch (error) {
    console.error('Error loading stories:', error);
  }
}

function showCreateStoryDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file && currentIdentity) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await storiesManager.createStory({
          authorId: currentIdentity.id,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          media: [{ dataUrl: ev.target.result, name: file.name }],
          text: prompt('Story-Text (optional):') || ''
        });
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Profile View
async function loadProfileView() {
  const profileContent = document.getElementById('profileContent');
  if (!profileContent || !currentIdentity) return;
  
  profileContent.innerHTML = `
    <div class="profile-card">
      <h3>${escapeHtml(currentIdentity.displayName)}</h3>
      <p>Typ: ${currentIdentity.type}</p>
      ${currentIdentity.companyData ? `
        <p>Firma: ${escapeHtml(currentIdentity.companyData.name)}</p>
        ${currentIdentity.companyData.verified ? '<span class="badge verified">✓ Verifiziert</span>' : ''}
      ` : ''}
      ${currentIdentity.manifestId ? `<p>Manifest-ID: ${currentIdentity.manifestId}</p>` : ''}
    </div>
  `;
}

// More View
async function loadMoreView() {
  const extensionsList = document.getElementById('extensionsList');
  if (extensionsList) {
    const extensions = extensionsRegistry.getExtensions();
    extensionsList.innerHTML = extensions.map(ext => `
      <div class="extension-item">
        <span class="extension-icon">${ext.icon}</span>
        <span class="extension-name">${escapeHtml(ext.name)}</span>
        <span class="extension-version">v${ext.version}</span>
      </div>
    `).join('');
  }
}

// Einladungs-Token behandeln
async function handleInvitationToken(token) {
  try {
    await networkManager.acceptInvitation(token, currentIdentity.id);
    alert('Einladung angenommen!');
    loadNetworksView();
  } catch (error) {
    console.error('Error accepting invitation:', error);
    alert('Fehler beim Akzeptieren der Einladung');
  }
}

// PWA Install Setup
function setupPWAInstall() {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    eventBus.emit('PWA_INSTALL_PROMPT_READY');
    
    // Install-Button anzeigen (optional)
    const installBtn = document.createElement('button');
    installBtn.textContent = 'App installieren';
    installBtn.className = 'btn-primary';
    installBtn.onclick = async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        eventBus.emit('PWA_INSTALLED');
      }
      deferredPrompt = null;
      installBtn.remove();
    };
    
    const moreView = document.getElementById('moreView');
    if (moreView) {
      moreView.querySelector('.admin-links').appendChild(installBtn);
    }
  });
}

// Export/Import
async function exportAllData() {
  const data = {
    identity: currentIdentity,
    posts: await postsManager.getPosts(),
    networks: await networkManager.getNetworks(),
    chats: await chatManager.getChats(),
    rooms: await roomsManager.getRooms(),
    stories: await storiesManager.getStories(),
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ultra-export-${Date.now()}.json`;
  a.click();
}

async function importAllData(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // TODO: Daten importieren
  alert('Import-Funktion wird implementiert');
}

async function exportManifestData() {
  const data = await manifestBridge.exportManifest();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `manifest-export-${Date.now()}.json`;
  a.click();
}

async function importManifestData(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  await manifestBridge.importManifest(data);
  alert('Manifest importiert!');
  location.reload();
}

// Helper Functions
function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std`;
  return date.toLocaleDateString('de-DE');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

