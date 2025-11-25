// Wrapper für grenzenlose Nutzung
// Ersetzt alle throw-Statements durch Action-Tracking

// Wrapper für alle Manager-Methoden
function wrapManagerMethod(manager, methodName, actionName) {
  const originalMethod = manager[methodName];
  if (!originalMethod) return;

  manager[methodName] = async function(...args) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      // Statt zu werfen, tracken wir die Aktion
      if (window.actionTracker) {
        await window.actionTracker.trackUnimplementedAction(
          actionName || `${manager.constructor.name}.${methodName}`,
          {
            method: methodName,
            args: args,
            error: error.message
          },
          window.currentIdentity?.id || null
        );
      }
      
      // User-freundliche Antwort zurückgeben
      return {
        success: false,
        error: error.message,
        tracked: true,
        message: `Die Aktion "${actionName || methodName}" ist noch nicht vollständig implementiert. Unser Team wurde benachrichtigt.`
      };
    }
  };
}

// Alle Manager wrappen
function wrapAllManagers() {
  if (window.identityManager) {
    wrapManagerMethod(identityManager, 'updateIdentity', 'Identity aktualisieren');
    wrapManagerMethod(identityManager, 'linkManifest', 'Manifest verknüpfen');
  }
  
  if (window.networkManager) {
    wrapManagerMethod(networkManager, 'createNetwork', 'Netzwerk erstellen');
    wrapManagerMethod(networkManager, 'addMember', 'Mitglied hinzufügen');
    wrapManagerMethod(networkManager, 'acceptInvitation', 'Einladung annehmen');
  }
  
  if (window.postsManager) {
    wrapManagerMethod(postsManager, 'createPost', 'Post erstellen');
    wrapManagerMethod(postsManager, 'addReaction', 'Reaktion hinzufügen');
  }
  
  if (window.chatManager) {
    wrapManagerMethod(chatManager, 'createChat', 'Chat erstellen');
    wrapManagerMethod(chatManager, 'addMessage', 'Nachricht senden');
  }
  
  if (window.roomsManager) {
    wrapManagerMethod(roomsManager, 'createRoom', 'Raum erstellen');
    wrapManagerMethod(roomsManager, 'addMember', 'Mitglied hinzufügen');
  }
  
  if (window.storiesManager) {
    wrapManagerMethod(storiesManager, 'createStory', 'Story erstellen');
  }
}

// Auto-Wrap nach Initialisierung
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(wrapAllManagers, 1000);
  });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { wrapManagerMethod, wrapAllManagers };
}

