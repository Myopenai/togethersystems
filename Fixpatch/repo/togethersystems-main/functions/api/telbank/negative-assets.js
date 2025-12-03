// TELBANK Negative Assets API
// IBM-Standard: Zero-Defect, Industrial Fabrication Software
// Version: 1.0.0-XXXL
// Branding: T,.&T,,.&T,,,.TELBANK(C)(R)

export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env; // D1 Database

  try {
    if (request.method === 'GET') {
      // GET: Liste aller Negative Assets
      const url = new URL(request.url);
      const bankId = url.searchParams.get('bank_id');
      const status = url.searchParams.get('status');
      const currency = url.searchParams.get('currency');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = `
        SELECT 
          n.neg_asset_id,
          n.provider_bank_id,
          b.legal_name AS bank_name,
          ac.code AS asset_class,
          n.currency_code,
          n.nominal_amount,
          n.event_date,
          n.status,
          n.risk_score,
          n.anonymized_hash,
          n.meta_json,
          n.created_at,
          n.updated_at,
          COALESCE(ns.status, 'worse_or_unchanged') AS nullpoint_status
        FROM negative_asset n
        LEFT JOIN bank b ON b.bank_id = n.provider_bank_id
        LEFT JOIN asset_class ac ON ac.asset_class_id = n.asset_class_id
        LEFT JOIN negative_asset_nullpoint_status ns ON ns.neg_asset_id = n.neg_asset_id
        WHERE n.status != 'archived'
      `;
      const params = [];

      if (bankId) {
        query += ' AND n.provider_bank_id = ?';
        params.push(bankId);
      }
      if (status) {
        query += ' AND n.status = ?';
        params.push(status);
      }
      if (currency) {
        query += ' AND n.currency_code = ?';
        params.push(currency);
      }

      query += ' ORDER BY n.event_date DESC, n.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const result = await DB.prepare(query).bind(...params).all();

      return new Response(JSON.stringify({
        success: true,
        data: result.results || [],
        total: result.results?.length || 0,
        limit,
        offset
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST') {
      // POST: Neues Negative Asset erstellen
      const body = await request.json();
      const {
        provider_bank_id,
        external_ref,
        asset_class_id,
        currency_code,
        nominal_amount,
        event_date,
        risk_score,
        anonymized_hash,
        meta_json
      } = body;

      // Validierung
      if (!provider_bank_id || !asset_class_id || !currency_code || !nominal_amount || !event_date) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields: provider_bank_id, asset_class_id, currency_code, nominal_amount, event_date'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // nominal_amount muss negativ sein
      const amount = parseFloat(nominal_amount);
      if (amount >= 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'nominal_amount must be negative (< 0)'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const negAssetId = crypto.randomUUID();
      const now = new Date().toISOString();

      await DB.prepare(`
        INSERT INTO negative_asset (
          neg_asset_id, provider_bank_id, external_ref, asset_class_id,
          currency_code, nominal_amount, event_date, status, risk_score,
          anonymized_hash, meta_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'reported', ?, ?, ?, ?, ?)
      `).bind(
        negAssetId, provider_bank_id, external_ref || null, asset_class_id,
        currency_code, amount, event_date, risk_score || null,
        anonymized_hash || null, meta_json ? JSON.stringify(meta_json) : null,
        now, now
      ).run();

      // Ledger-Eintrag: minus_in
      const ledgerId = crypto.randomUUID();
      await DB.prepare(`
        INSERT INTO telbank_ledger (
          ledger_entry_id, neg_asset_id, entry_type, currency_code,
          amount, booked_at, description, created_at
        ) VALUES (?, ?, 'minus_in', ?, ?, ?, ?, ?)
      `).bind(
        ledgerId, negAssetId, currency_code, amount, now,
        `Negative Asset reported: ${external_ref || negAssetId}`, now
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { neg_asset_id: negAssetId }
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
    console.error('[TELBANK API Error]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

