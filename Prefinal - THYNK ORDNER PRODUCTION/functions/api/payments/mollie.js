// THYNK ORDNER - Mollie Payment Integration
// POST /api/payments/mollie/create - Create payment
// GET /api/payments/mollie/[paymentId] - Get payment status
// POST /api/payments/mollie/webhook - Webhook handler

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function checkApiKey(request, env) {
  const required = env?.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

// POST /api/payments/mollie/create
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

  const { order_id, amount, currency = 'EUR', description, redirect_url } = body;

  if (!order_id || !amount) {
    return json(400, { ok: false, error: 'order_id and amount required' });
  }

  try {
    const mollieApiKey = env?.MOLLIE_API_KEY || 'test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const mollieUrl = env?.MOLLIE_API_URL || 'https://api.mollie.com/v2';

    // Create payment at Mollie
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: currency,
      },
      description: description || `Order ${order_id}`,
      redirectUrl: redirect_url || `${request.url.split('/api')[0]}/payment/return?order_id=${order_id}`,
      metadata: {
        order_id: order_id,
      },
    };

    const mollieResponse = await fetch(`${mollieUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mollieApiKey}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!mollieResponse.ok) {
      const error = await mollieResponse.json();
      return json(500, { ok: false, error: error.message || 'payment creation failed' });
    }

    const payment = await mollieResponse.json();

    // Update order with payment info
    await env.DB.prepare(
      `UPDATE cms_orders 
       SET payment_method = ?, payment_status = 'pending' 
       WHERE id = ?`
    )
      .bind('mollie', order_id)
      .run();

    return json(200, {
      ok: true,
      data: {
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          redirect_url: payment._links?.checkout?.href,
        },
      },
    });
  } catch (err) {
    console.error('Error creating payment:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// GET /api/payments/mollie/[paymentId]
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const paymentId = params.paymentId;

  try {
    const mollieApiKey = env?.MOLLIE_API_KEY || 'test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const mollieUrl = env?.MOLLIE_API_URL || 'https://api.mollie.com/v2';

    const mollieResponse = await fetch(`${mollieUrl}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
      },
    });

    if (!mollieResponse.ok) {
      return json(404, { ok: false, error: 'payment not found' });
    }

    const payment = await mollieResponse.json();

    return json(200, {
      ok: true,
      data: {
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          metadata: payment.metadata,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching payment:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// POST /api/payments/mollie/webhook
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { id } = body; // Payment ID from Mollie webhook

  if (!id) {
    return json(400, { ok: false, error: 'payment id required' });
  }

  try {
    const mollieApiKey = env?.MOLLIE_API_KEY || 'test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const mollieUrl = env?.MOLLIE_API_URL || 'https://api.mollie.com/v2';

    // Get payment status from Mollie
    const mollieResponse = await fetch(`${mollieUrl}/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
      },
    });

    if (!mollieResponse.ok) {
      return json(404, { ok: false, error: 'payment not found' });
    }

    const payment = await mollieResponse.json();
    const orderId = payment.metadata?.order_id;

    if (!orderId) {
      return json(400, { ok: false, error: 'order_id not found in payment metadata' });
    }

    // Update order based on payment status
    if (payment.status === 'paid') {
      await env.DB.prepare(
        `UPDATE cms_orders 
         SET status = 'paid', payment_status = 'paid', paid_at = ? 
         WHERE id = ?`
      )
        .bind(new Date().toISOString(), orderId)
        .run();
    } else if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
      await env.DB.prepare(
        `UPDATE cms_orders 
         SET payment_status = 'failed' 
         WHERE id = ?`
      )
        .bind(orderId)
        .run();
    }

    return json(200, {
      ok: true,
      data: {
        message: 'webhook processed',
        order_id: orderId,
        payment_status: payment.status,
      },
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

