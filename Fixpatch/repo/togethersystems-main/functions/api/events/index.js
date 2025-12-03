// Cloudflare Pages Function: Events API
// GET /api/events - Liste aller Events
// POST /api/events - Neues Event erstellen

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

async function insertEvent(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt)
    .run();
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// GET /api/events - Liste aller Events
export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  try {
    const url = new URL(request.url);
    const organizerId = url.searchParams.get('organizer_id');
    const networkId = url.searchParams.get('network_id');
    const since = url.searchParams.get('since');

    let query = 'SELECT * FROM events ORDER BY start_time ASC';
    const binds = [];

    if (organizerId) {
      query += binds.length > 0 ? ' AND' : ' WHERE';
      query += ' organizer_id = ?';
      binds.push(organizerId);
    }

    if (networkId) {
      query += binds.length > 0 ? ' AND' : ' WHERE';
      query += ' network_id = ?';
      binds.push(networkId);
    }

    if (since) {
      query += binds.length > 0 ? ' AND' : ' WHERE';
      query += ' start_time >= ?';
      binds.push(since);
    }

    const result = await env.DB.prepare(query).bind(...binds).all();

    const events = result.results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      organizer_id: row.organizer_id,
      start_time: row.start_time,
      end_time: row.end_time,
      location: row.location,
      network_id: row.network_id,
      invitee_ids: row.invitee_ids ? JSON.parse(row.invitee_ids) : [],
      visibility: row.visibility,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return json(200, { ok: true, data: { events } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

// POST /api/events - Neues Event erstellen
export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { title, description, organizer_id, start_time, end_time, location, network_id, invitee_ids, visibility } = body;

  if (!title || !organizer_id || !start_time) {
    return json(400, { ok: false, error: 'title, organizer_id, and start_time required' });
  }

  try {
    const eventId = makeId('evt');
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    await env.DB.prepare(
      `INSERT INTO events (id, title, description, organizer_id, start_time, end_time, location, network_id, invitee_ids, visibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        eventId,
        title,
        description || null,
        organizer_id,
        start_time,
        end_time || null,
        location || null,
        network_id || null,
        JSON.stringify(invitee_ids || []),
        visibility || 'network',
        createdAt,
        updatedAt
      )
      .run();

    await insertEvent(env, 'event.created', organizer_id, 'event', eventId, { title, start_time });

    return json(200, {
      ok: true,
      data: {
        event: {
          id: eventId,
          title,
          description,
          organizer_id,
          start_time,
          end_time,
          location,
          network_id,
          invitee_ids: invitee_ids || [],
          visibility: visibility || 'network',
          created_at: createdAt,
          updated_at: updatedAt,
        },
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}









