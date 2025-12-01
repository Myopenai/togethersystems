// Cloudflare Pages Function: GET/PATCH /api/instruments/:id
// Instrument-Details abrufen oder aktualisieren

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

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const instrumentId = params.id;

  try {
    const instrument = await env.DB.prepare(
      'SELECT * FROM instruments WHERE id = ?'
    )
      .bind(instrumentId)
      .first();

    if (!instrument) {
      return json(404, {
        ok: false,
        error: 'not_found',
        message: `Instrument with id ${instrumentId} does not exist`,
      });
    }

    // Hole auch die zugehörige Real-Bilanz
    const balance = await env.DB.prepare(
      'SELECT * FROM real_balances WHERE id = ?'
    )
      .bind(instrument.balance_id)
      .first();

    return json(200, {
      ok: true,
      data: {
        instrument: {
          id: instrument.id,
          entity_id: instrument.entity_id,
          balance_id: instrument.balance_id,
          symbol: instrument.symbol,
          name: instrument.name,
          description: instrument.description,
          status: instrument.status,
          net_value: instrument.net_value,
          currency: instrument.currency,
          units_issued: instrument.units_issued,
          creation_reason: instrument.creation_reason,
          created_at: instrument.created_at,
          activated_at: instrument.activated_at,
        },
        balance: balance
          ? {
              id: balance.id,
              entity_id: balance.entity_id,
              period_start: balance.period_start,
              period_end: balance.period_end,
              total_income: balance.total_income,
              total_expense: balance.total_expense,
              total_damage: balance.total_damage,
              total_benefit: balance.total_benefit,
              total_risk: balance.total_risk,
              net_value: balance.net_value,
              currency: balance.currency,
              meta: balance.meta ? JSON.parse(balance.meta) : {},
              created_at: balance.created_at,
            }
          : null,
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

export async function onRequestPatch(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const instrumentId = params.id;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { status } = body;

  if (status && !['draft', 'active', 'suspended', 'retired'].includes(status)) {
    return json(400, {
      ok: false,
      error: 'invalid_status',
      message: 'status must be one of: draft, active, suspended, retired',
    });
  }

  try {
    // Prüfe ob Instrument existiert
    const existing = await env.DB.prepare('SELECT id, status FROM instruments WHERE id = ?')
      .bind(instrumentId)
      .first();

    if (!existing) {
      return json(404, {
        ok: false,
        error: 'not_found',
        message: `Instrument with id ${instrumentId} does not exist`,
      });
    }

    // Update
    if (status) {
      await env.DB.prepare('UPDATE instruments SET status = ? WHERE id = ?')
        .bind(status, instrumentId)
        .run();

      if (status === 'active' && existing.status !== 'active') {
        await env.DB.prepare('UPDATE instruments SET activated_at = ? WHERE id = ?')
          .bind(new Date().toISOString(), instrumentId)
          .run();
      }

      await insertEvent(env, 'instrument.updated', null, 'instrument', instrumentId, {
        status,
        previous_status: existing.status,
      });
    }

    // Hole aktualisiertes Instrument
    const updated = await env.DB.prepare('SELECT * FROM instruments WHERE id = ?')
      .bind(instrumentId)
      .first();

    return json(200, {
      ok: true,
      data: {
        instrument: {
          id: updated.id,
          status: updated.status,
          activated_at: updated.activated_at,
        },
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}









