// AI Frontend Integration für TogetherSystems
// Verwendbar in manifest-forum.html, manifest-portal.html, etc.

(function(){
  'use strict';

  const AI_API_BASE = '/api/ai/gateway';

  // Manifest-Assistent: Vorschläge beim Tippen
  window.AIManifestAssistant = {
    async suggestTags(content, existingTags = []) {
      try {
        const res = await fetch(AI_API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'tag.generate',
            input: { content },
            options: { existingTags },
          }),
        });
        const data = await res.json();
        return data.ok ? data.result.tags : [];
      } catch (err) {
        console.warn('AI Tag-Suggestion fehlgeschlagen:', err);
        return [];
      }
    },

    async suggestTitleAndSummary(content) {
      try {
        const res = await fetch(AI_API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'manifest.assist',
            input: { content },
          }),
        });
        const data = await res.json();
        return data.ok ? {
          title: data.result.suggestedTitle,
          summary: data.result.summary,
          tags: data.result.suggestedTags || [],
        } : null;
      } catch (err) {
        console.warn('AI Assist fehlgeschlagen:', err);
        return null;
      }
    },

    async translate(text, targetLanguage = 'en') {
      try {
        const res = await fetch(AI_API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'translate',
            input: { text },
            options: { targetLanguage },
          }),
        });
        const data = await res.json();
        return data.ok ? data.result.translatedText : text;
      } catch (err) {
        console.warn('AI Übersetzung fehlgeschlagen:', err);
        return text;
      }
    },

    async summarize(content, maxLength = 200) {
      try {
        const res = await fetch(AI_API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'summarize',
            input: { text: content },
            options: { maxLength },
          }),
        });
        const data = await res.json();
        return data.ok ? data.result.summary : content.slice(0, maxLength) + '...';
      } catch (err) {
        console.warn('AI Zusammenfassung fehlgeschlagen:', err);
        return content.slice(0, maxLength) + '...';
      }
    },
  };

  // Business Intelligence Helper
  window.AIBusinessIntelligence = {
    async getAnalytics(query = 'voucher_analytics') {
      try {
        const res = await fetch(AI_API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'business.intelligence',
            input: { query },
          }),
        });
        const data = await res.json();
        return data.ok ? data.result : null;
      } catch (err) {
        console.warn('AI Business Intelligence fehlgeschlagen:', err);
        return null;
      }
    },
  };

  // Moderation Helper
  window.AIModeration = {
    async checkContent(content) {
      try {
        const res = await fetch(AI_API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'moderate',
            input: { content },
          }),
        });
        const data = await res.json();
        return data.ok ? data.result : { safe: true, flags: [] };
      } catch (err) {
        console.warn('AI Moderation fehlgeschlagen:', err);
        return { safe: true, flags: [] };
      }
    },
  };

  // Export für Module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      AIManifestAssistant: window.AIManifestAssistant,
      AIBusinessIntelligence: window.AIBusinessIntelligence,
      AIModeration: window.AIModeration,
    };
  }
})();









