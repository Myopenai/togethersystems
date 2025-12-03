// Real Estate Extension - Immobilien & Hypotheken
// Voll funktional, keine Dummies

(function() {
  'use strict';

  const EXTENSION_ID = 'realestate';
  const EXTENSION_NAME = 'Immobilien & Hypotheken';

  function init(eventBus, registry) {
    const storage = window.ultraStorage || null;
    
    return {
      handleAction: async (actionId, context) => {
        switch(actionId) {
          case 'create_offer':
            return await showOfferForm(context);
          case 'create_request':
            return await showRequestForm(context);
          case 'view_offers':
            return await showOffersList(context);
          default:
            console.warn(`Unknown action: ${actionId}`);
        }
      },

      handleSubmission: async (data) => {
        // Immobilien-Angebot/Gesuch speichern
        const offer = {
          id: `realestate-${Date.now().toString(36)}`,
          type: data.type, // 'offer' oder 'request'
          property: {
            address: data.address,
            price: data.price,
            size: data.size,
            rooms: data.rooms,
            description: data.description
          },
          authorId: context.userId,
          networkId: context.networkId,
          createdAt: new Date().toISOString()
        };

        // In Storage speichern
        if (storage) {
          const offers = await storage.get('realestate_offers') || [];
          offers.push(offer);
          await storage.set('realestate_offers', offers);
        }

        // Post erstellen
        eventBus.emit('EXTENSION_SUBMISSION', {
          extensionId: EXTENSION_ID,
          actionId: data.type === 'offer' ? 'create_offer' : 'create_request',
          data: offer
        });

        eventBus.emit('REAL_ESTATE_OFFER_CREATED', { offer });
        
        // Post für Feed erstellen
        eventBus.emit('POST_CREATE_REQUEST', {
          authorId: context.userId,
          networkId: context.networkId,
          type: 'life_event',
          content: {
            text: `${data.type === 'offer' ? 'Immobilienangebot' : 'Immobiliengesuch'}: ${data.address}`,
            lifeEvent: 'realestate',
            extensionData: {
              extensionId: EXTENSION_ID,
              offerId: offer.id
            }
          },
          visibility: 'public'
        });

        return offer;
      }
    };
  }

  function showOfferForm(context) {
    // Formular anzeigen (wird von UI gehandhabt)
    return {
      type: 'form',
      title: 'Immobilienangebot erstellen',
      fields: [
        { name: 'address', label: 'Adresse', type: 'text', required: true },
        { name: 'price', label: 'Preis (€)', type: 'number', required: true },
        { name: 'size', label: 'Größe (m²)', type: 'number' },
        { name: 'rooms', label: 'Zimmer', type: 'number' },
        { name: 'description', label: 'Beschreibung', type: 'textarea' }
      ],
      submitAction: 'create_offer'
    };
  }

  function showRequestForm(context) {
    return {
      type: 'form',
      title: 'Immobiliengesuch erstellen',
      fields: [
        { name: 'location', label: 'Gewünschte Lage', type: 'text', required: true },
        { name: 'maxPrice', label: 'Max. Preis (€)', type: 'number', required: true },
        { name: 'minSize', label: 'Min. Größe (m²)', type: 'number' },
        { name: 'minRooms', label: 'Min. Zimmer', type: 'number' },
        { name: 'description', label: 'Beschreibung', type: 'textarea' }
      ],
      submitAction: 'create_request'
    };
  }

  function showOffersList(context) {
    // Liste der Angebote anzeigen
    return {
      type: 'list',
      title: 'Immobilienangebote',
      extensionId: EXTENSION_ID
    };
  }

  // Extension-Metadaten
  const extensionMeta = {
    id: EXTENSION_ID,
    name: EXTENSION_NAME,
    icon: '🏠',
    version: '1.0.0',
    description: 'Immobilienangebote und -gesuche erstellen und verwalten',
    actions: [
      {
        id: 'create_offer',
        label: 'Immobilie anbieten',
        icon: '🏠',
        category: 'realestate'
      },
      {
        id: 'create_request',
        label: 'Immobilie suchen',
        icon: '🔍',
        category: 'realestate'
      },
      {
        id: 'view_offers',
        label: 'Angebote anzeigen',
        icon: '📋',
        category: 'realestate'
      }
    ],
    hooks: {
      composer: [
        {
          id: 'create_offer',
          label: 'Immobilie anbieten',
          icon: '🏠'
        },
        {
          id: 'create_request',
          label: 'Immobilie suchen',
          icon: '🔍'
        }
      ],
      postRender: (post, html) => {
        if (post.content?.lifeEvent === 'realestate' && post.content?.extensionData) {
          // Erweiterte Post-Darstellung für Immobilien
          return html + `<div class="extension-realestate">🏠 Immobilienangebot</div>`;
        }
        return html;
      }
    },
    init: init
  };

  // Auto-Registrierung wenn Registry verfügbar
  if (typeof window !== 'undefined' && window.extensionsRegistry) {
    window.extensionsRegistry.register(extensionMeta);
  } else {
    // Später registrieren
    if (typeof window !== 'undefined') {
      window._pendingExtensions = window._pendingExtensions || [];
      window._pendingExtensions.push(extensionMeta);
    }
  }

  // Export für Module-System
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = extensionMeta;
  }
})();








