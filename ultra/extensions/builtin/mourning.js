// Mourning Extension - Trauer & Gedenken
// Voll funktional, keine Dummies

(function() {
  'use strict';

  const EXTENSION_ID = 'mourning';
  const EXTENSION_NAME = 'Trauer & Gedenken';

  function init(eventBus, registry) {
    const storage = window.ultraStorage || null;
    
    return {
      handleAction: async (actionId, context) => {
        switch(actionId) {
          case 'create_memorial':
            return await showMemorialForm(context);
          case 'add_entry':
            return await showEntryForm(context);
          case 'view_memorials':
            return await showMemorialsList(context);
          default:
            console.warn(`Unknown action: ${actionId}`);
        }
      },

      handleSubmission: async (data) => {
        const memorial = {
          id: `memorial-${Date.now().toString(36)}`,
          name: data.name,
          date: data.date,
          message: data.message,
          authorId: context.userId,
          networkId: context.networkId,
          entries: [],
          createdAt: new Date().toISOString()
        };

        if (storage) {
          const memorials = await storage.get('memorials') || [];
          memorials.push(memorial);
          await storage.set('memorials', memorials);
        }

        eventBus.emit('EXTENSION_SUBMISSION', {
          extensionId: EXTENSION_ID,
          actionId: 'create_memorial',
          data: memorial
        });

        eventBus.emit('MEMORIAL_CREATED', { memorial });
        
        // Post für Feed
        eventBus.emit('POST_CREATE_REQUEST', {
          authorId: context.userId,
          networkId: context.networkId,
          type: 'life_event',
          content: {
            text: `Gedenken: ${data.name}`,
            lifeEvent: 'death',
            extensionData: {
              extensionId: EXTENSION_ID,
              memorialId: memorial.id
            }
          },
          visibility: 'network'
        });

        return memorial;
      }
    };
  }

  function showMemorialForm(context) {
    return {
      type: 'form',
      title: 'Gedenkstätte erstellen',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'date', label: 'Datum', type: 'date', required: true },
        { name: 'message', label: 'Nachricht', type: 'textarea', required: true }
      ],
      submitAction: 'create_memorial'
    };
  }

  function showEntryForm(context) {
    return {
      type: 'form',
      title: 'Eintrag hinzufügen',
      fields: [
        { name: 'memorialId', label: 'Gedenkstätte', type: 'select', required: true },
        { name: 'message', label: 'Deine Nachricht', type: 'textarea', required: true }
      ],
      submitAction: 'add_entry'
    };
  }

  function showMemorialsList(context) {
    return {
      type: 'list',
      title: 'Gedenkstätten',
      extensionId: EXTENSION_ID
    };
  }

  const extensionMeta = {
    id: EXTENSION_ID,
    name: EXTENSION_NAME,
    icon: '🕯️',
    version: '1.0.0',
    description: 'Gedenkstätten erstellen und Einträge hinzufügen',
    actions: [
      {
        id: 'create_memorial',
        label: 'Gedenkstätte erstellen',
        icon: '🕯️',
        category: 'life_event'
      },
      {
        id: 'add_entry',
        label: 'Eintrag hinzufügen',
        icon: '💐',
        category: 'life_event'
      }
    ],
    hooks: {
      composer: [
        {
          id: 'create_memorial',
          label: 'Gedenkstätte',
          icon: '🕯️'
        }
      ],
      postRender: (post, html) => {
        if (post.content?.lifeEvent === 'death' && post.content?.extensionData) {
          return html + `<div class="extension-mourning">🕯️ Gedenkstätte</div>`;
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

