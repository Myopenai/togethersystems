// Ultra-Social-Media Portal - Haupt-App
// SPA-Router & App-Initialisierung

// Globale Instanzen (werden nach dem Laden der Core-Module verfügbar sein)
let identityManager, networkManager, postsManager;
let currentRoute = 'home';
let currentIdentity = null;

// App initialisieren
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Ultra Portal initialisiert');
  
  // Warte auf Storage-Initialisierung
  await storage.init();
  
  // Manager initialisieren
  identityManager = new IdentityManager(storage, eventBus);
  networkManager = new NetworkManager(storage, eventBus);
  postsManager = new PostsManager(storage, eventBus);
  
  // Event-Listener registrieren
  setupEventListeners();
  
  // Prüfe Einladungs-Token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('i');
  
  if (inviteToken) {
    eventBus.emit('INVITATION_TOKEN_DETECTED', { token: inviteToken });
  }
  
  // App starten
  eventBus.emit('APP_LOAD_REQUESTED', { urlParams: Object.fromEntries(urlParams) });
  eventBus.emit('APP_STARTED');
  
  // Identity prüfen
  const identity = await identityManager.init();
  
  if (!identity) {
    showIdentitySetup();
  } else {
    currentIdentity = identity;
    loadHomeView();
  }
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
  
  // Identity Form
  const identityForm = document.getElementById('identityForm');
  if (identityForm) {
    identityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleIdentitySubmit();
    });
    
    // Company fields anzeigen/verstecken
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
}

// Navigation
function navigateTo(route) {
  currentRoute = route;
  
  // Alle Views verstecken
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Aktive View anzeigen
  const view = document.getElementById(`${route}View`);
  if (view) {
    view.classList.add('active');
  }
  
  // Nav-Buttons aktualisieren
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-route') === route) {
      btn.classList.add('active');
    }
  });
  
  // Route-spezifische Aktionen
  switch(route) {
    case 'home':
      loadHomeView();
      break;
    case 'contacts':
      loadContactsView();
      break;
    case 'networks':
      loadNetworksView();
      break;
    case 'profile':
      loadProfileView();
      break;
  }
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

// Home View laden
async function loadHomeView() {
  await loadFeed();
}

// Feed laden
async function loadFeed() {
  const feedContainer = document.getElementById('feed');
  if (!feedContainer) return;
  
  feedContainer.innerHTML = '<div class="feed-loading">Lade Feed...</div>';
  
  try {
    const networkIds = currentIdentity ? 
      (await networkManager.getUserNetworks(currentIdentity.id)).map(n => n.id) : [];
    
    const posts = currentIdentity ? 
      await postsManager.getPostsForUser(currentIdentity.id, networkIds) : [];
    
    if (posts.length === 0) {
      feedContainer.innerHTML = `
        <div class="feed-empty">
          <p>Noch keine Posts vorhanden.</p>
          <p>Erstelle deinen ersten Post!</p>
        </div>
      `;
      return;
    }
    
    feedContainer.innerHTML = posts.map(post => renderPost(post)).join('');
    
    // Event-Listener für Reaktionen
    feedContainer.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const postId = e.currentTarget.getAttribute('data-post-id');
        await postsManager.addReaction(postId, currentIdentity.id, 'like');
        loadFeed(); // Refresh
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
  switch(action) {
    case 'message':
      showMessageComposer();
      break;
    case 'call':
      showCallComposer();
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

// Contacts View
async function loadContactsView() {
  // TODO: Implementieren
}

// Networks View
async function loadNetworksView() {
  const networksList = document.getElementById('networksList');
  if (!networksList) return;
  
  try {
    const networks = currentIdentity ? 
      await networkManager.getUserNetworks(currentIdentity.id) : [];
    
    networksList.innerHTML = networks.length === 0 ? 
      '<p>Noch keine Netzwerke. Erstelle dein erstes Netzwerk!</p>' :
      networks.map(network => `
        <div class="network-card">
          <h3>${escapeHtml(network.name)}</h3>
          <p>${network.members.length} Mitglieder</p>
        </div>
      `).join('');
  } catch (error) {
    console.error('Error loading networks:', error);
  }
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
    </div>
  `;
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

