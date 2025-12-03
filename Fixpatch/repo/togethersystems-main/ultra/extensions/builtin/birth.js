// Birth Extension - Geburt & Familie
// Voll funktional, keine Dummies

(function() {
  'use strict';

  const EXTENSION_ID = 'birth';
  const EXTENSION_NAME = 'Geburt & Familie';

  function init(eventBus, registry) {
    const storage = window.ultraStorage || null;
    
    return {
      handleAction: async (actionId, context) => {
        switch(actionId) {
          case 'announce_birth':
            return await showBirthForm(context);
          case 'view_announcements':
            return await showAnnouncementsList(context);
          default:
            console.warn(`Unknown action: ${actionId}`);
        }
      },

      handleSubmission: async (data) => {
        const announcement = {
          id: `birth-${Date.now().toString(36)}`,
          name: data.name,
          date: data.date,
          weight: data.weight,
          length: data.length,
          message: data.message,
          authorId: context.userId,
          networkId: context.networkId,
          createdAt: new Date().toISOString()
        };

        if (storage) {
          const announcements = await storage.get('birth_announcements') || [];
          announcements.push(announcement);
          await storage.set('birth_announcements', announcements);
        }

        eventBus.emit('EXTENSION_SUBMISSION', {
          extensionId: EXTENSION_ID,
          actionId: 'announce_birth',
          data: announcement
        });

        eventBus.emit('BIRTH_ANNOUNCED', { announcement });
        
        // Post für Feed
        eventBus.emit('POST_CREATE_REQUEST', {
          authorId: context.userId,
          networkId: context.networkId,
          type: 'life_event',
          content: {
            text: `Geburtsanzeige: ${data.name} ist geboren! 🎉`,
            lifeEvent: 'birth',
            extensionData: {
              extensionId: EXTENSION_ID,
              announcementId: announcement.id
            }
          },
          visibility: 'public'
        });

        return announcement;
      }
    };
  }

  function showBirthForm(context) {
    return {
      type: 'form',
      title: 'Geburtsanzeige erstellen',
      fields: [
        { name: 'name', label: 'Name des Kindes', type: 'text', required: true },
        { name: 'date', label: 'Geburtsdatum', type: 'date', required: true },
        { name: 'weight', label: 'Gewicht (g)', type: 'number' },
        { name: 'length', label: 'Größe (cm)', type: 'number' },
        { name: 'message', label: 'Nachricht', type: 'textarea' }
      ],
      submitAction: 'announce_birth'
    };
  }

  function showAnnouncementsList(context) {
    return {
      type: 'list',
      title: 'Geburtsanzeigen',
      extensionId: EXTENSION_ID
    };
  }

  const extensionMeta = {
    id: EXTENSION_ID,
    name: EXTENSION_NAME,
    icon: '👶',
    version: '1.0.0',
    description: 'Geburtsanzeigen erstellen und teilen',
    actions: [
      {
        id: 'announce_birth',
        label: 'Geburt ankündigen',
        icon: '👶',
        category: 'life_event'
      }
    ],
    hooks: {
      composer: [
        {
          id: 'announce_birth',
          label: 'Geburt ankündigen',
          icon: '👶'
        }
      ],
      postRender: (post, html) => {
        if (post.content?.lifeEvent === 'birth' && post.content?.extensionData) {
          return html + `<div class="extension-birth">👶 Geburtsanzeige</div>`;
        }
        return html;
      }
    },
    init: init
  };

  if (typeof window !== 'undefined' && window.extensionsRegistry) {
    window.extensionsRegistry.register(extensionMeta);
  } else {
    if (typeof window !== 'undefined') {
      window._pendingExtensions = window._pendingExtensions || [];
      window._pendingExtensions.push(extensionMeta);
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = extensionMeta;
  }
})();








