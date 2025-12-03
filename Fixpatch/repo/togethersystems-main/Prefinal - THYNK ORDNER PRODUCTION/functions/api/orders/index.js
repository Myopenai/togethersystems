// THYNK ORDNER - Orders API
// POST /api/orders - Create new order
// GET /api/orders/[orderId] - Get order details
// PUT /api/orders/[orderId] - Update order
// GET /api/orders - List orders

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

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

// POST /api/orders
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

  const { site_id, items, customer, payment_method, currency = 'EUR' } = body;

  if (!site_id || !items || !Array.isArray(items) || items.length === 0) {
    return json(400, { ok: false, error: 'site_id and items array required' });
  }

  if (!customer || !customer.email || !customer.name) {
    return json(400, { ok: false, error: 'customer with name and email required' });
  }

  try {
    await env.DB.exec('BEGIN');

    // Calculate total
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;
      
      if (!product_id || !quantity || quantity <= 0) {
        await env.DB.exec('ROLLBACK');
        return json(400, { ok: false, error: 'invalid item: product_id and quantity required' });
      }

      // Get product
      const product = await env.DB.prepare(
        `SELECT * FROM cms_products WHERE id = ? AND site_id = ?`
      )
        .bind(product_id, site_id)
        .first();

      if (!product) {
        await env.DB.exec('ROLLBACK');
        return json(404, { ok: false, error: `product not found: ${product_id}` });
      }

      // Check stock
      if (product.stock_quantity !== null && product.stock_quantity < quantity) {
        await env.DB.exec('ROLLBACK');
        return json(400, { ok: false, error: `insufficient stock for product: ${product.sku || product_id}` });
      }

      // Get product locale (for name)
      const productLocale = await env.DB.prepare(
        `SELECT * FROM cms_product_locales WHERE product_id = ? LIMIT 1`
      )
        .bind(product_id)
        .first();

      const productName = productLocale?.name || `Product ${product_id}`;
      const unitPrice = product.price;
      const itemTotal = unitPrice * quantity;
      totalAmount += itemTotal;

      processedItems.push({
        product_id,
        product_snapshot: {
          id: product.id,
          sku: product.sku,
          price: product.price,
          currency: product.currency,
          name: productName,
          vat_rate: product.vat_rate,
        },
        name: productName,
        quantity,
        unit_price: unitPrice,
        total_price: itemTotal,
      });
    }

    // Create order
    const orderId = makeId('order');
    const orderNumber = generateOrderNumber();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO cms_orders (
         id, site_id, order_number, status, total_amount, currency,
         payment_method, payment_status, customer_json, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        orderId,
        site_id,
        orderNumber,
        'pending',
        totalAmount,
        currency,
        payment_method || null,
        'pending',
        JSON.stringify(customer),
        createdAt
      )
      .run();

    // Create order items and update stock
    for (const item of processedItems) {
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
          item.product_id,
          JSON.stringify(item.product_snapshot),
          item.name,
          item.quantity,
          item.unit_price,
          item.total_price
        )
        .run();

      // Update stock
      if (item.product_snapshot) {
        await env.DB.prepare(
          `UPDATE cms_products 
           SET stock_quantity = stock_quantity - ? 
           WHERE id = ? AND stock_quantity IS NOT NULL`
        )
          .bind(item.quantity, item.product_id)
          .run();
      }
    }

    await env.DB.exec('COMMIT');

    return json(200, {
      ok: true,
      data: {
        order: {
          id: orderId,
          order_number: orderNumber,
          site_id,
          status: 'pending',
          total_amount: totalAmount,
          currency,
          payment_method,
          payment_status: 'pending',
          customer,
          created_at: createdAt,
        },
        items: processedItems,
      },
    });
  } catch (err) {
    await env.DB.exec('ROLLBACK');
    console.error('Error creating order:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

// GET /api/orders
export async function onRequestGet(context) {
  const { request, env } = context;

  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;

  const url = new URL(request.url);
  const siteId = url.searchParams.get('site_id');
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  if (!siteId) {
    return json(400, { ok: false, error: 'site_id query parameter required' });
  }

  try {
    let query = `SELECT * FROM cms_orders WHERE site_id = ?`;
    const params = [siteId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const orders = await env.DB.prepare(query).bind(...params).all();

    return json(200, {
      ok: true,
      data: {
        orders: orders.results || [],
        count: orders.results?.length || 0,
        limit,
        offset,
      },
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return json(500, { ok: false, error: String(err) });
  }
}

