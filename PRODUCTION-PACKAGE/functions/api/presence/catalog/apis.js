// Cloudflare Pages Function: /api/presence/catalog/apis
// Returns a static API catalog (same structure as presence-api-server.js)

const apiCatalog = [
  {
    id: 'doc-verify-example',
    name: 'Dokument-Verifikation (Beispiel)',
    category: 'verification',
    base_url: 'https://api.example.com/v1/documents',
    auth_type: 'bearer',
    doc_url: 'https://docs.example.com/doc-verify',
    example_payload: { file_id: '123', mode: 'basic' },
  },
  {
    id: 'ai-summary-example',
    name: 'KI-Textzusammenfassung (Beispiel)',
    category: 'ai',
    base_url: 'https://api.example.com/v1/summarize',
    auth_type: 'bearer',
    doc_url: 'https://docs.example.com/ai-summary',
    example_payload: { text: '...', max_tokens: 256 },
  },
  {
    id: 'webhook-generic',
    name: 'Eigenes Webhook-Backend',
    category: 'custom',
    base_url: 'https://deine-seite.tld/api/manifest/submit',
    auth_type: 'none',
    doc_url: null,
    example_payload: {
      source: 'manifest-of-thinkers-offline',
      version: 1,
      posts: [],
    },
  },
];

export async function onRequestGet() {
  return new Response(JSON.stringify({ items: apiCatalog }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}


