// TELADIA Exchange API
// IBM-Standard: Zero-Defect, Industrial Fabrication Software
// Version: 1.0.0-XXXL
// Branding: T,.&T,,.&T,,,.TELADIA(C)(R) x Deutsche Bank

export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env;

  try {
    if (request.method === 'GET') {
      // GET: Exchange Rates
      const url = new URL(request.url);
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');

      let query = `
        SELECT * FROM teladia_exchange_rate
        WHERE valid_to IS NULL OR valid_to > datetime('now')
      `;
      const params = [];

      if (from) {
        query += ' AND from_currency = ?';
        params.push(from);
      }
      if (to) {
        query += ' AND to_currency = ?';
        params.push(to);
      }

      query += ' ORDER BY valid_from DESC LIMIT 1';

      const result = await DB.prepare(query).bind(...params).first();

      return new Response(JSON.stringify({
        success: true,
        data: result || null
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST') {
      // POST: Execute Exchange
      const body = await request.json();
      const {
        bank_id,
        from_currency,
        from_amount,
        to_currency,
        to_amount,
        exchange_rate,
        fee_amount,
        fee_currency
      } = body;

      if (!bank_id || !from_currency || !from_amount || !to_currency || !to_amount || !exchange_rate) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const transactionId = crypto.randomUUID();
      const now = new Date().toISOString();

      await DB.prepare(`
        INSERT INTO teladia_exchange_transaction (
          transaction_id, bank_id, from_currency, from_amount,
          to_currency, to_amount, exchange_rate, fee_amount, fee_currency,
          status, executed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'executed', ?, ?)
      `).bind(
        transactionId, bank_id, from_currency, parseFloat(from_amount),
        to_currency, parseFloat(to_amount), parseFloat(exchange_rate),
        fee_amount ? parseFloat(fee_amount) : 0, fee_currency || from_currency,
        now, now
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { transaction_id: transactionId }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[TELADIA Exchange API Error]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

