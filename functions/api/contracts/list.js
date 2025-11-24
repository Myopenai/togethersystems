// Cloudflare Pages Function: GET /api/contracts/list
// Lists contracts, optionally filtered by voucherId or roomId.

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

export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const voucherId = url.searchParams.get('voucherId');
  const roomId = url.searchParams.get('roomId');

  try {
    let query =
      'SELECT c.id, c.name, c.mime_type, c.byte_size, c.storage_url, c.hash_sha256, c.created_by, c.created_at ' +
      'FROM contracts c';
    const where = [];
    const params = [];

    if (voucherId || roomId) {
      query +=
        ' JOIN contract_links cl ON c.id = cl.contract_id';
      if (voucherId) {
        where.push('cl.voucher_id = ?');
        params.push(voucherId);
      }
      if (roomId) {
        where.push('cl.room_id = ?');
        params.push(roomId);
      }
    }

    if (where.length) {
      query += ' WHERE ' + where.join(' AND ');
    }
    query += ' ORDER BY c.created_at DESC';

    const rows = await env.DB.prepare(query).bind(...params).all();
    const items = (rows.results || []).map((r) => ({
      id: r.id,
      name: r.name,
      mimeType: r.mime_type,
      byteSize: r.byte_size,
      storageUrl: r.storage_url,
      hashSha256: r.hash_sha256,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
    return json(200, { ok: true, items });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



