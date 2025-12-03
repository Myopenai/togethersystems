// Cloudflare Pages Function: POST /api/contracts/upload
// Accepts multipart/form-data with a file and optional voucherId/roomId,
// stores the file in R2 (CONTRACTS_BUCKET) and metadata + links in D1.

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function sha256Hex(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function makeId(prefix = 'ct') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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

async function insertEvent(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt)
    .run();
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  if (!env.CONTRACTS_BUCKET) {
    return json(500, {
      ok: false,
      error: 'CONTRACTS_BUCKET binding is not configured',
    });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'expected multipart/form-data' });
  }

  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return json(400, { ok: false, error: 'file field is required' });
  }

  const voucherId = form.get('voucherId') || null;
  const roomId = form.get('roomId') || null;
  const actorId = form.get('actorId') || null;
  const name = (form.get('name') || file.name || 'contract').toString();

  try {
    const hash = await sha256Hex(file);
    const createdAt = new Date().toISOString();
    const contractId = makeId('ct');
    const objectKey = `contracts/${contractId}/${encodeURIComponent(
      file.name || 'document'
    )}`;

    await env.CONTRACTS_BUCKET.put(objectKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    await env.DB.prepare(
      `INSERT INTO contracts
       (id, name, mime_type, byte_size, storage_url, hash_sha256, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        contractId,
        name,
        file.type || null,
        file.size || null,
        objectKey,
        hash,
        actorId || null,
        createdAt
      )
      .run();

    let linkId = null;
    if (voucherId || roomId) {
      linkId = makeId('cl');
      await env.DB.prepare(
        `INSERT INTO contract_links
         (id, contract_id, voucher_id, room_id, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          linkId,
          contractId,
          voucherId || null,
          roomId || null,
          'primary',
          createdAt
        )
        .run();
    }

    await insertEvent(env, 'contract.upload', actorId, 'contract', contractId, {
      voucherId,
      roomId,
      storageUrl: objectKey,
    });

    return json(200, {
      ok: true,
      contract: {
        id: contractId,
        name,
        mimeType: file.type || null,
        byteSize: file.size || null,
        storageUrl: objectKey,
        hashSha256: hash,
        createdBy: actorId,
        createdAt,
      },
      linkId,
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}



