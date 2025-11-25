// Cloudflare Pages Function: POST /api/real/balances/recompute
// Berechnet eine Real-Bilanz für einen Zeitraum aus Transaktionen

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function makeId(prefix = 'rb') {
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

async function checkRateLimit(env, key, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();

  const row = await env.DB.prepare(
    'SELECT key, window_start, count FROM rate_limits WHERE key = ?'
  )
    .bind(key)
    .first();

  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }

  const newWindowStart =
    row && row.window_start >= windowStartCutoff
      ? row.window_start
      : new Date(now).toISOString();
  const newCount =
    row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;

  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  )
    .bind(key, newWindowStart, newCount)
    .run();

  return true;
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

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const allowed = await checkRateLimit(env, `real.balances.recompute|${ip}`);
  if (!allowed) {
    return json(429, { ok: false, error: 'rate limit exceeded' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { entity_id, period_start, period_end } = body;

  if (!entity_id || !period_start || !period_end) {
    return json(400, {
      ok: false,
      error: 'missing_required_fields',
      message: 'entity_id, period_start, and period_end are required',
    });
  }

  // Prüfe ob Entity existiert
  const entity = await env.DB.prepare('SELECT id FROM entities WHERE id = ?')
    .bind(entity_id)
    .first();

  if (!entity) {
    return json(404, {
      ok: false,
      error: 'entity_not_found',
      message: `Entity with id ${entity_id} does not exist`,
    });
  }

  try {
    // Hole alle Transaktionen im Zeitraum
    const transactionsResult = await env.DB.prepare(
      `SELECT category, direction, amount, weight, unit
       FROM real_transactions
       WHERE entity_id = ? AND occurred_at >= ? AND occurred_at <= ?
       ORDER BY occurred_at ASC`
    )
      .bind(entity_id, period_start, period_end)
      .all();

    const transactions = transactionsResult.results || [];

    // Aggregiere nach Kategorien
    let totalIncome = 0;
    let totalExpense = 0;
    let totalDamage = 0;
    let totalBenefit = 0;
    let totalRisk = 0;

    transactions.forEach((tx) => {
      const value = tx.amount * tx.weight;
      const isPositive = tx.direction === 'positive';

      switch (tx.category) {
        case 'income':
          totalIncome += isPositive ? value : 0;
          break;
        case 'expense':
          totalExpense += isPositive ? 0 : Math.abs(value);
          break;
        case 'damage':
          totalDamage += isPositive ? 0 : Math.abs(value);
          break;
        case 'benefit':
          totalBenefit += isPositive ? value : 0;
          break;
        case 'risk':
          totalRisk += isPositive ? 0 : Math.abs(value);
          break;
      }
    });

    // Netto-Wert berechnen: benefit + income - expense - damage - risk
    const netValue = totalBenefit + totalIncome - totalExpense - totalDamage - totalRisk;

    const balanceId = body.id || makeId('rb');
    const createdAt = new Date().toISOString();

    // Prüfe ob bereits eine Bilanz für diesen Zeitraum existiert
    const existing = await env.DB.prepare(
      `SELECT id FROM real_balances 
       WHERE entity_id = ? AND period_start = ? AND period_end = ?`
    )
      .bind(entity_id, period_start, period_end)
      .first();

    let balance;
    if (existing) {
      // Update existing balance
      await env.DB.prepare(
        `UPDATE real_balances 
         SET total_income = ?, total_expense = ?, total_damage = ?, 
             total_benefit = ?, total_risk = ?, net_value = ?, 
             currency = ?, meta = ?
         WHERE id = ?`
      )
        .bind(
          totalIncome,
          totalExpense,
          totalDamage,
          totalBenefit,
          totalRisk,
          netValue,
          'EUR',
          JSON.stringify(body.meta || { method: 'v1.0-balanced' }),
          existing.id
        )
        .run();

      const updated = await env.DB.prepare('SELECT * FROM real_balances WHERE id = ?')
        .bind(existing.id)
        .first();

      balance = {
        id: updated.id,
        entity_id: updated.entity_id,
        period_start: updated.period_start,
        period_end: updated.period_end,
        total_income: updated.total_income,
        total_expense: updated.total_expense,
        total_damage: updated.total_damage,
        total_benefit: updated.total_benefit,
        total_risk: updated.total_risk,
        net_value: updated.net_value,
        currency: updated.currency,
        meta: updated.meta ? JSON.parse(updated.meta) : {},
        created_at: updated.created_at,
      };
    } else {
      // Insert new balance
      await env.DB.prepare(
        `INSERT INTO real_balances 
         (id, entity_id, period_start, period_end, total_income, total_expense,
          total_damage, total_benefit, total_risk, net_value, currency, meta, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          balanceId,
          entity_id,
          period_start,
          period_end,
          totalIncome,
          totalExpense,
          totalDamage,
          totalBenefit,
          totalRisk,
          netValue,
          'EUR',
          JSON.stringify(body.meta || { method: 'v1.0-balanced' }),
          createdAt
        )
        .run();

      balance = {
        id: balanceId,
        entity_id,
        period_start,
        period_end,
        total_income: totalIncome,
        total_expense: totalExpense,
        total_damage: totalDamage,
        total_benefit: totalBenefit,
        total_risk: totalRisk,
        net_value: netValue,
        currency: 'EUR',
        meta: body.meta || { method: 'v1.0-balanced' },
        created_at: createdAt,
      };
    }

    await insertEvent(env, 'real.balance.recomputed', null, 'real_balance', balance.id, {
      entity_id,
      net_value: netValue,
    });

    return json(200, { ok: true, data: { balance } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}


