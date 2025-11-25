// Cloudflare Pages Function: Invoices API
// GET /api/invoices - Liste aller Rechnungen
// POST /api/invoices - Neue Rechnung erstellen

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

// GET /api/invoices - Liste aller Rechnungen
export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  try {
    const url = new URL(request.url);
    const issuerId = url.searchParams.get('issuer_id');
    const recipientId = url.searchParams.get('recipient_id');
    const status = url.searchParams.get('status');

    let query = 'SELECT * FROM invoices ORDER BY created_at DESC';
    const binds = [];

    if (issuerId) {
      query += binds.length > 0 ? ' AND' : ' WHERE';
      query += ' issuer_id = ?';
      binds.push(issuerId);
    }

    if (recipientId) {
      query += binds.length > 0 ? ' AND' : ' WHERE';
      query += ' recipient_id = ?';
      binds.push(recipientId);
    }

    if (status) {
      query += binds.length > 0 ? ' AND' : ' WHERE';
      query += ' status = ?';
      binds.push(status);
    }

    const result = await env.DB.prepare(query).bind(...binds).all();

    const invoices = result.results.map(row => ({
      id: row.id,
      issuer_id: row.issuer_id,
      recipient_id: row.recipient_id,
      voucher_id: row.voucher_id,
      booking_id: row.booking_id,
      amount: row.amount,
      currency: row.currency,
      tax_rate: row.tax_rate,
      items: row.items ? JSON.parse(row.items) : [],
      status: row.status,
      due_date: row.due_date,
      paid_at: row.paid_at,
      invoice_number: row.invoice_number,
      pdf_url: row.pdf_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return json(200, { ok: true, data: { invoices } });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

// POST /api/invoices - Neue Rechnung erstellen
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

  const { issuer_id, recipient_id, voucher_id, booking_id, amount, currency, tax_rate, items, due_date, invoice_number } = body;

  if (!issuer_id || !recipient_id || !amount) {
    return json(400, { ok: false, error: 'issuer_id, recipient_id, and amount required' });
  }

  try {
    const invoiceId = makeId('inv');
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    // Netto-Betrag berechnen
    const subtotal = (items || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const tax = subtotal * ((tax_rate || 0) / 100);
    const total = subtotal + tax;

    // Rechnungsnummer generieren (falls nicht vorhanden)
    const invNumber = invoice_number || this.generateInvoiceNumber();

    await env.DB.prepare(
      `INSERT INTO invoices (id, issuer_id, recipient_id, voucher_id, booking_id, amount, currency, tax_rate, items, status, due_date, invoice_number, pdf_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        invoiceId,
        issuer_id,
        recipient_id,
        voucher_id || null,
        booking_id || null,
        total, // Gesamtbetrag
        currency || 'EUR',
        tax_rate || 0,
        JSON.stringify(items || []),
        'draft',
        due_date || null,
        invNumber,
        null, // pdf_url wird später gesetzt
        createdAt,
        updatedAt
      )
      .run();

    return json(200, {
      ok: true,
      data: {
        invoice: {
          id: invoiceId,
          issuer_id,
          recipient_id,
          voucher_id,
          booking_id,
          amount: total,
          currency: currency || 'EUR',
          tax_rate: tax_rate || 0,
          items: items || [],
          status: 'draft',
          due_date,
          invoice_number: invNumber,
          created_at: createdAt,
          updated_at: updatedAt,
        },
      },
    });
  } catch (err) {
    return json(500, { ok: false, error: String(err) });
  }
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${year}${month}-${random}`;
}


