// THYNK ORDNER - Single Order API
// GET /api/orders/[orderId] - Get order details
// PUT /api/orders/[orderId] - Update order
// DELETE /api/orders/[orderId] - Delete order (soft delete)

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function checkApiKey(request, env) {
  const required = env?.TS_API_KEY;
  if (!required) return null; // Keine API-Key-Prüfung in Development
  const provided = request.headers.get('X-TS-APIKEY');
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: 'invalid api key' });
  }
  return null;
}

// GET /api/orders/[orderId]
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const orderId = params.orderId;

  try {
    // Get order
    const order = await env.DB.prepare(
      `SELECT * FROM cms_orders WHERE id = ?`
    )
      .bind(orderId)
      .first();

    if (!order) {
      return json(404, { ok: false, error: 'order not found' });
    }

    // Get order items
    const items = await env.DB.prepare(
      `SELECT * FROM cms_order_items WHERE order_id = ? ORDER BY id ASC`
    )
      .bind(orderId)
      .all();

    // Parse JSON fields
    const customer = order.customer_json ? JSON.parse(order.customer_json) : null;

    return json(200, {
      ok: true,
      data: {
        order: {
          id: order.id,
          site_id: order.site_id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          currency: order.currency,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          customer,
          created_at: order.created_at,
          paid_at: order.paid_at,
          shipped_at: order.shipped_at,
        },
        items: (items.results || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_snapshot: item.product_snapshot_json ? JSON.parse(item.product_snapshot_json) : null,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      },
    });
  } catch (err) {
    console.error('Error loading order:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// PUT /api/orders/[orderId]
export async function onRequestPut(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const orderId = params.orderId;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid JSON body' });
  }

  const { status, payment_status, customer } = body;

  try {
    const updates = [];
    const binds = [];

    if (status !== undefined) {
      updates.push('status = ?');
      binds.push(status);

      // Update timestamps based on status
      if (status === 'paid' && !body.paid_at) {
        updates.push('paid_at = ?');
        binds.push(new Date().toISOString());
      }
      if (status === 'shipped' && !body.shipped_at) {
        updates.push('shipped_at = ?');
        binds.push(new Date().toISOString());
      }
    }

    if (payment_status !== undefined) {
      updates.push('payment_status = ?');
      binds.push(payment_status);
    }

    if (customer !== undefined) {
      updates.push('customer_json = ?');
      binds.push(JSON.stringify(customer));
    }

    if (updates.length === 0) {
      return json(400, { ok: false, error: 'no fields to update' });
    }

    binds.push(orderId);

    await env.DB.prepare(
      `UPDATE cms_orders SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...binds)
      .run();

    return json(200, {
      ok: true,
      data: {
        message: 'order updated successfully',
        order_id: orderId,
      },
    });
  } catch (err) {
    console.error('Error updating order:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// DELETE /api/orders/[orderId] - Soft delete
export async function onRequestDelete(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const orderId = params.orderId;

  try {
    // Soft delete: Set status to 'cancelled'
    await env.DB.prepare(
      `UPDATE cms_orders SET status = 'cancelled' WHERE id = ?`
    )
      .bind(orderId)
      .run();

    return json(200, {
      ok: true,
      data: {
        message: 'order cancelled successfully',
      },
    });
  } catch (err) {
    console.error('Error deleting order:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

