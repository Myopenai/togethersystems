// Cloudflare Pages Function: POST /api/instruments/:id/activate
// Aktiviert ein Instrument (setzt Status auf 'active')

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
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const instrumentId = params.id;

  try {
    // Prüfe ob Instrument existiert
    const instrument = await env.DB.prepare('SELECT id, status, balance_id FROM instruments WHERE id = ?')
      .bind(instrumentId)
      .first();

    if (!instrument) {
      return json(404, {
        ok: false,
        error: 'not_found',
        message: `Instrument with id ${instrumentId} does not exist`,
      });
    }

    if (instrument.status === 'active') {
      return json(400, {
        ok: false,
        error: 'already_active',
        message: 'Instrument is already active',
      });
    }

    // Prüfe ob Real-Bilanz noch positiv ist
    const balance = await env.DB.prepare('SELECT net_value FROM real_balances WHERE id = ?')
      .bind(instrument.balance_id)
      .first();

    if (!balance || balance.net_value <= 0) {
      return json(422, {
        ok: false,
        error: 'invalid_balance',
        message: 'Real-Bilanz muss einen positiven Netto-Wert haben',
      });
    }

    // Aktiviere Instrument
    const activatedAt = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE instruments SET status = ?, activated_at = ? WHERE id = ?'
    )
      .bind('active', activatedAt, instrumentId)
      .run();

    await insertEvent(env, 'instrument.activated', null, 'instrument', instrumentId, {
      balance_id: instrument.balance_id,
      net_value: balance.net_value,
    });

    return json(200, {
      ok: true,
      data: {
        status: 'active',
        activated_at: activatedAt,
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}


