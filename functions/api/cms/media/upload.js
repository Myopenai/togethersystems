// Cloudflare Pages Function: Media Upload
// POST /api/cms/media/upload - Datei hochladen

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function checkApiKey(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// POST /api/cms/media/upload
export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  let siteId;
  try {
    const formData = await request.formData();
    siteId = formData.get('site_id');
    const file = formData.get('file');

    if (!siteId) {
      return json(400, { ok: false, error: 'site_id required' });
    }

    if (!file || !(file instanceof File)) {
      return json(400, { ok: false, error: 'file required' });
    }

    // TODO: Datei in R2/S3 speichern
    // Für jetzt: Nur Metadaten in DB speichern
    const mediaId = makeId('media');
    const createdAt = new Date().toISOString();
    const filename = file.name;
    const mimeType = file.type;
    const sizeBytes = file.size;
    
    // Storage-Pfad generieren (später: R2/S3)
    const storagePath = `sites/${siteId}/media/${mediaId}/${filename}`;

    await env.DB.prepare(
      `INSERT INTO cms_media_items (
         id, site_id, filename, mime_type, size_bytes, storage_path, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        mediaId,
        siteId,
        filename,
        mimeType,
        sizeBytes,
        storagePath,
        createdAt
      )
      .run();

    return json(200, {
      ok: true,
      data: {
        media: {
          id: mediaId,
          site_id: siteId,
          filename,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          storage_path: storagePath,
          url: `/api/cms/media/${mediaId}`, // Später: R2/S3 URL
          created_at: createdAt,
        },
      },
    });
  } catch (err) {
    console.error('Error uploading media:', err);
    return json(500, { ok: false, error: String(err) });
  }
}


