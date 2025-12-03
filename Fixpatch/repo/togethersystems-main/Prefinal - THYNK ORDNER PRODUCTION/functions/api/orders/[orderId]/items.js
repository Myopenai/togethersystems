// THYNK ORDNER - Order Items API
// GET /api/orders/[orderId]/items - Get order items
// POST /api/orders/[orderId]/items - Add item to order
// PUT /api/orders/[orderId]/items/[itemId] - Update item
// DELETE /api/orders/[orderId]/items/[itemId] - Remove item

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

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// GET /api/orders/[orderId]/items
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const orderId = params.orderId;

  try {
    const items = await env.DB.prepare(
      `SELECT * FROM cms_order_items WHERE order_id = ? ORDER BY id ASC`
    )
      .bind(orderId)
      .all();

    return json(200, {
      ok: true,
      data: {
        items: (items.results || []).map(item => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          product_snapshot: item.product_snapshot_json ? JSON.parse(item.product_snapshot_json) : null,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
        count: items.results?.length || 0,
      },
    });
  } catch (err) {
    console.error('Error loading order items:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// POST /api/orders/[orderId]/items
export async function onRequestPost(context) {
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

  const { product_id, quantity, name, unit_price } = body;

  if (!product_id || !quantity || quantity <= 0) {
    return json(400, { ok: false, error: 'product_id and quantity required' });
  }

  try {
    // Get product for snapshot
    const product = await env.DB.prepare(
      `SELECT * FROM cms_products WHERE id = ?`
    )
      .bind(product_id)
      .first();

    if (!product) {
      return json(404, { ok: false, error: 'product not found' });
    }

    // Get product locale
    const productLocale = await env.DB.prepare(
      `SELECT * FROM cms_product_locales WHERE product_id = ? LIMIT 1`
    )
      .bind(product_id)
      .first();

    const productName = name || productLocale?.name || `Product ${product_id}`;
    const price = unit_price || product.price;
    const totalPrice = price * quantity;

    const itemId = makeId('item');

    await env.DB.prepare(
      `INSERT INTO cms_order_items (
         id, order_id, product_id, product_snapshot_json,
         name, quantity, unit_price, total_price
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        itemId,
        orderId,
        product_id,
        JSON.stringify({
          id: product.id,
          sku: product.sku,
          price: product.price,
          currency: product.currency,
          name: productName,
        }),
        productName,
        quantity,
        price,
        totalPrice
      )
      .run();

    // Update order total
    const orderItems = await env.DB.prepare(
      `SELECT total_price FROM cms_order_items WHERE order_id = ?`
    )
      .bind(orderId)
      .all();

    const newTotal = (orderItems.results || []).reduce((sum, item) => sum + item.total_price, 0);

    await env.DB.prepare(
      `UPDATE cms_orders SET total_amount = ? WHERE id = ?`
    )
      .bind(newTotal, orderId)
      .run();

    return json(200, {
      ok: true,
      data: {
        item: {
          id: itemId,
          order_id: orderId,
          product_id,
          name: productName,
          quantity,
          unit_price: price,
          total_price: totalPrice,
        },
      },
    });
  } catch (err) {
    console.error('Error adding order item:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

