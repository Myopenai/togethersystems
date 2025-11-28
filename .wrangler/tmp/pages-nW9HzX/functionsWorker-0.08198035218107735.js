var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/cms/sites/[siteId]/pages.js
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json, "json");
async function checkApiKey(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey, "checkApiKey");
function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
__name(makeId, "makeId");
async function onRequestGet(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;
  const siteId = params.siteId;
  try {
    const pages = await env.DB.prepare(
      `SELECT * FROM cms_pages WHERE site_id = ? ORDER BY path ASC`
    ).bind(siteId).all();
    return json(200, {
      ok: true,
      data: {
        pages: pages.results || [],
        count: pages.results?.length || 0
      }
    });
  } catch (err) {
    console.error("Error loading pages:", err);
    return json(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet, "onRequestGet");
async function onRequestPost(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey(request, env);
  if (apiKeyError) return apiKeyError;
  const siteId = params.siteId;
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid JSON body" });
  }
  const { path, type = "standard", layout = "default", parent_page_id, is_home = false } = body;
  if (!path) {
    return json(400, { ok: false, error: "path required" });
  }
  try {
    const pageId = makeId("page");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(
      `INSERT INTO cms_pages (
         id, site_id, parent_page_id, path, type, is_home, layout, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      pageId,
      siteId,
      parent_page_id || null,
      path,
      type,
      is_home ? 1 : 0,
      layout,
      "draft",
      createdAt,
      createdAt
    ).run();
    return json(200, {
      ok: true,
      data: {
        page: {
          id: pageId,
          site_id: siteId,
          path,
          type,
          layout,
          status: "draft",
          created_at: createdAt
        }
      }
    });
  } catch (err) {
    console.error("Error creating page:", err);
    return json(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost, "onRequestPost");

// api/cms/blocks/types.js
function json2(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json2, "json");
async function onRequestGet2(context) {
  const { env } = context;
  try {
    const blockTypes = await env.DB.prepare(
      `SELECT * FROM cms_block_types ORDER BY category, name ASC`
    ).all();
    const types = (blockTypes.results || []).map((bt) => ({
      id: bt.id,
      name: bt.name,
      category: bt.category,
      schema: JSON.parse(bt.schema_json || "{}"),
      component_ref: bt.component_ref
    }));
    const grouped = {};
    types.forEach((type) => {
      if (!grouped[type.category]) {
        grouped[type.category] = [];
      }
      grouped[type.category].push(type);
    });
    return json2(200, {
      ok: true,
      data: {
        block_types: types,
        grouped
      }
    });
  } catch (err) {
    console.error("Error loading block types:", err);
    return json2(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet2, "onRequestGet");

// api/cms/media/upload.js
function json3(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json3, "json");
async function checkApiKey2(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json3(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey2, "checkApiKey");
function makeId2(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
__name(makeId2, "makeId");
async function onRequestPost2(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey2(request, env);
  if (apiKeyError) return apiKeyError;
  let siteId;
  try {
    const formData = await request.formData();
    siteId = formData.get("site_id");
    const file = formData.get("file");
    if (!siteId) {
      return json3(400, { ok: false, error: "site_id required" });
    }
    if (!file || !(file instanceof File)) {
      return json3(400, { ok: false, error: "file required" });
    }
    const mediaId = makeId2("media");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const filename = file.name;
    const mimeType = file.type;
    const sizeBytes = file.size;
    const storagePath = `sites/${siteId}/media/${mediaId}/${filename}`;
    await env.DB.prepare(
      `INSERT INTO cms_media_items (
         id, site_id, filename, mime_type, size_bytes, storage_path, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      mediaId,
      siteId,
      filename,
      mimeType,
      sizeBytes,
      storagePath,
      createdAt
    ).run();
    return json3(200, {
      ok: true,
      data: {
        media: {
          id: mediaId,
          site_id: siteId,
          filename,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          storage_path: storagePath,
          url: `/api/cms/media/${mediaId}`,
          // Später: R2/S3 URL
          created_at: createdAt
        }
      }
    });
  } catch (err) {
    console.error("Error uploading media:", err);
    return json3(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost2, "onRequestPost");

// api/presence/catalog/apis.js
var apiCatalog = [
  {
    id: "doc-verify-example",
    name: "Dokument-Verifikation (Beispiel)",
    category: "verification",
    base_url: "https://api.example.com/v1/documents",
    auth_type: "bearer",
    doc_url: "https://docs.example.com/doc-verify",
    example_payload: { file_id: "123", mode: "basic" }
  },
  {
    id: "ai-summary-example",
    name: "KI-Textzusammenfassung (Beispiel)",
    category: "ai",
    base_url: "https://api.example.com/v1/summarize",
    auth_type: "bearer",
    doc_url: "https://docs.example.com/ai-summary",
    example_payload: { text: "...", max_tokens: 256 }
  },
  {
    id: "webhook-generic",
    name: "Eigenes Webhook-Backend",
    category: "custom",
    base_url: "https://deine-seite.tld/api/manifest/submit",
    auth_type: "none",
    doc_url: null,
    example_payload: {
      source: "manifest-of-thinkers-offline",
      version: 1,
      posts: []
    }
  }
];
async function onRequestGet3() {
  return new Response(JSON.stringify({ items: apiCatalog }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(onRequestGet3, "onRequestGet");

// api/real/balances/recompute.js
function json4(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json4, "json");
function makeId3(prefix = "rb") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId3, "makeId");
async function checkApiKey3(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json4(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey3, "checkApiKey");
async function checkRateLimit(env, key, limit = 10, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit, "checkRateLimit");
async function insertEvent(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent, "insertEvent");
async function onRequestPost3(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey3(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit(env, `real.balances.recompute|${ip}`);
  if (!allowed) {
    return json4(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json4(400, { ok: false, error: "invalid JSON body" });
  }
  const { entity_id, period_start, period_end } = body;
  if (!entity_id || !period_start || !period_end) {
    return json4(400, {
      ok: false,
      error: "missing_required_fields",
      message: "entity_id, period_start, and period_end are required"
    });
  }
  const entity = await env.DB.prepare("SELECT id FROM entities WHERE id = ?").bind(entity_id).first();
  if (!entity) {
    return json4(404, {
      ok: false,
      error: "entity_not_found",
      message: `Entity with id ${entity_id} does not exist`
    });
  }
  try {
    const transactionsResult = await env.DB.prepare(
      `SELECT category, direction, amount, weight, unit
       FROM real_transactions
       WHERE entity_id = ? AND occurred_at >= ? AND occurred_at <= ?
       ORDER BY occurred_at ASC`
    ).bind(entity_id, period_start, period_end).all();
    const transactions = transactionsResult.results || [];
    let totalIncome = 0;
    let totalExpense = 0;
    let totalDamage = 0;
    let totalBenefit = 0;
    let totalRisk = 0;
    transactions.forEach((tx) => {
      const value = tx.amount * tx.weight;
      const isPositive = tx.direction === "positive";
      switch (tx.category) {
        case "income":
          totalIncome += isPositive ? value : 0;
          break;
        case "expense":
          totalExpense += isPositive ? 0 : Math.abs(value);
          break;
        case "damage":
          totalDamage += isPositive ? 0 : Math.abs(value);
          break;
        case "benefit":
          totalBenefit += isPositive ? value : 0;
          break;
        case "risk":
          totalRisk += isPositive ? 0 : Math.abs(value);
          break;
      }
    });
    const netValue = totalBenefit + totalIncome - totalExpense - totalDamage - totalRisk;
    const balanceId = body.id || makeId3("rb");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const existing = await env.DB.prepare(
      `SELECT id FROM real_balances 
       WHERE entity_id = ? AND period_start = ? AND period_end = ?`
    ).bind(entity_id, period_start, period_end).first();
    let balance;
    if (existing) {
      await env.DB.prepare(
        `UPDATE real_balances 
         SET total_income = ?, total_expense = ?, total_damage = ?, 
             total_benefit = ?, total_risk = ?, net_value = ?, 
             currency = ?, meta = ?
         WHERE id = ?`
      ).bind(
        totalIncome,
        totalExpense,
        totalDamage,
        totalBenefit,
        totalRisk,
        netValue,
        "EUR",
        JSON.stringify(body.meta || { method: "v1.0-balanced" }),
        existing.id
      ).run();
      const updated = await env.DB.prepare("SELECT * FROM real_balances WHERE id = ?").bind(existing.id).first();
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
        created_at: updated.created_at
      };
    } else {
      await env.DB.prepare(
        `INSERT INTO real_balances 
         (id, entity_id, period_start, period_end, total_income, total_expense,
          total_damage, total_benefit, total_risk, net_value, currency, meta, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
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
        "EUR",
        JSON.stringify(body.meta || { method: "v1.0-balanced" }),
        createdAt
      ).run();
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
        currency: "EUR",
        meta: body.meta || { method: "v1.0-balanced" },
        created_at: createdAt
      };
    }
    await insertEvent(env, "real.balance.recomputed", null, "real_balance", balance.id, {
      entity_id,
      net_value: netValue
    });
    return json4(200, { ok: true, data: { balance } });
  } catch (err) {
    return json4(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost3, "onRequestPost");

// api/cms/pages/[pageId].js
function json5(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json5, "json");
async function checkApiKey4(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json5(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey4, "checkApiKey");
async function onRequestGet4(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey4(request, env);
  if (apiKeyError) return apiKeyError;
  const pageId = params.pageId;
  try {
    const page = await env.DB.prepare(
      `SELECT * FROM cms_pages WHERE id = ?`
    ).bind(pageId).first();
    if (!page) {
      return json5(404, { ok: false, error: "page not found" });
    }
    const locales = await env.DB.prepare(
      `SELECT * FROM cms_page_locales WHERE page_id = ?`
    ).bind(pageId).all();
    const blocks = await env.DB.prepare(
      `SELECT 
         b.*, 
         bt.name as block_type_name,
         bt.category as block_type_category,
         bt.component_ref
       FROM cms_blocks b
       JOIN cms_block_types bt ON b.block_type_id = bt.id
       WHERE b.page_id = ?
       ORDER BY b.position ASC`
    ).bind(pageId).all();
    return json5(200, {
      ok: true,
      data: {
        page,
        locales: locales.results || [],
        blocks: (blocks.results || []).map((b) => ({
          id: b.id,
          block_type_id: b.block_type_id,
          block_type_name: b.block_type_name,
          block_type_category: b.block_type_category,
          component_ref: b.component_ref,
          position: b.position,
          zone: b.zone,
          data: JSON.parse(b.data_json || "{}"),
          visibility: b.visibility_json ? JSON.parse(b.visibility_json) : null
        }))
      }
    });
  } catch (err) {
    console.error("Error loading page:", err);
    return json5(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet4, "onRequestGet");
async function onRequestPut(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey4(request, env);
  if (apiKeyError) return apiKeyError;
  const pageId = params.pageId;
  let body;
  try {
    body = await request.json();
  } catch {
    return json5(400, { ok: false, error: "invalid JSON body" });
  }
  const { page, blocks } = body;
  if (!page) {
    return json5(400, { ok: false, error: "page data required" });
  }
  try {
    await env.DB.exec("BEGIN");
    await env.DB.prepare(
      `UPDATE cms_pages 
       SET path = ?, status = ?, layout = ?, seo_index = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      page.path || "/",
      page.status || "draft",
      page.layout || "default",
      page.seo_index !== void 0 ? page.seo_index ? 1 : 0 : 1,
      (/* @__PURE__ */ new Date()).toISOString(),
      pageId
    ).run();
    await env.DB.prepare(`DELETE FROM cms_blocks WHERE page_id = ?`).bind(pageId).run();
    if (Array.isArray(blocks)) {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockId = block.id || `block-${Date.now()}-${i}`;
        await env.DB.prepare(
          `INSERT INTO cms_blocks (
             id, page_id, locale, block_type_id, position, zone, data_json, visibility_json, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          blockId,
          pageId,
          block.locale || null,
          block.block_type_id,
          i,
          block.zone || "main",
          JSON.stringify(block.data || {}),
          block.visibility ? JSON.stringify(block.visibility) : null,
          (/* @__PURE__ */ new Date()).toISOString()
        ).run();
      }
    }
    await env.DB.exec("COMMIT");
    return json5(200, {
      ok: true,
      data: {
        message: "Page updated successfully",
        page_id: pageId
      }
    });
  } catch (err) {
    await env.DB.exec("ROLLBACK");
    console.error("Error updating page:", err);
    return json5(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPut, "onRequestPut");
async function onRequestDelete(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey4(request, env);
  if (apiKeyError) return apiKeyError;
  const pageId = params.pageId;
  try {
    await env.DB.exec("BEGIN");
    await env.DB.prepare(`DELETE FROM cms_blocks WHERE page_id = ?`).bind(pageId).run();
    await env.DB.prepare(`DELETE FROM cms_page_locales WHERE page_id = ?`).bind(pageId).run();
    await env.DB.prepare(`DELETE FROM cms_pages WHERE id = ?`).bind(pageId).run();
    await env.DB.exec("COMMIT");
    return json5(200, {
      ok: true,
      data: {
        message: "Page deleted successfully"
      }
    });
  } catch (err) {
    await env.DB.exec("ROLLBACK");
    console.error("Error deleting page:", err);
    return json5(500, { ok: false, error: String(err) });
  }
}
__name(onRequestDelete, "onRequestDelete");

// api/real/balances/[entity_id].js
function json6(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json6, "json");
async function checkApiKey5(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json6(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey5, "checkApiKey");
async function onRequestGet5(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey5(request, env);
  if (apiKeyError) return apiKeyError;
  const entityId = params.entity_id;
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  let query = "SELECT * FROM real_balances WHERE entity_id = ?";
  const queryParams = [entityId];
  if (from) {
    query += " AND period_end >= ?";
    queryParams.push(from);
  }
  if (to) {
    query += " AND period_start <= ?";
    queryParams.push(to);
  }
  query += " ORDER BY period_start DESC LIMIT 100";
  try {
    const result = await env.DB.prepare(query).bind(...queryParams).all();
    const balances = (result.results || []).map((r) => ({
      id: r.id,
      entity_id: r.entity_id,
      period_start: r.period_start,
      period_end: r.period_end,
      total_income: r.total_income,
      total_expense: r.total_expense,
      total_damage: r.total_damage,
      total_benefit: r.total_benefit,
      total_risk: r.total_risk,
      net_value: r.net_value,
      currency: r.currency,
      meta: r.meta ? JSON.parse(r.meta) : {},
      created_at: r.created_at
    }));
    return json6(200, { ok: true, data: { balances } });
  } catch (err) {
    return json6(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet5, "onRequestGet");

// api/settings/distribution/[identifier].js
async function onRequestGet6(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const identifier = params.identifier;
  const keyHash = url.searchParams.get("key");
  const version = url.searchParams.get("version") || "1.0.0";
  if (!keyHash) {
    return new Response(JSON.stringify({
      error: "key parameter is required"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
  try {
    const portalHost = new URL(request.url).origin;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyHash + identifier);
    const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHashValid = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const distribution = {
      identifier,
      version,
      portalHost,
      notarized: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      instructions: {
        message: "Bitte verwenden Sie Ihren User Key, um die Distribution zu entschl\xFCsseln.",
        warning: "Bei Verlust des Keys ist der User selbst verantwortlich. Der Key kann notariell best\xE4tigt werden.",
        gofundme: "https://www.gofundme.com/f/magnitudo",
        producer: "tell1.nl"
      }
    };
    return new Response(JSON.stringify(distribution, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }
}
__name(onRequestGet6, "onRequestGet");

// api/instruments/[id]/activate.js
function json7(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json7, "json");
async function checkApiKey6(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json7(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey6, "checkApiKey");
async function insertEvent2(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent2, "insertEvent");
async function onRequestPost4(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey6(request, env);
  if (apiKeyError) return apiKeyError;
  const instrumentId = params.id;
  try {
    const instrument = await env.DB.prepare("SELECT id, status, balance_id FROM instruments WHERE id = ?").bind(instrumentId).first();
    if (!instrument) {
      return json7(404, {
        ok: false,
        error: "not_found",
        message: `Instrument with id ${instrumentId} does not exist`
      });
    }
    if (instrument.status === "active") {
      return json7(400, {
        ok: false,
        error: "already_active",
        message: "Instrument is already active"
      });
    }
    const balance = await env.DB.prepare("SELECT net_value FROM real_balances WHERE id = ?").bind(instrument.balance_id).first();
    if (!balance || balance.net_value <= 0) {
      return json7(422, {
        ok: false,
        error: "invalid_balance",
        message: "Real-Bilanz muss einen positiven Netto-Wert haben"
      });
    }
    const activatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(
      "UPDATE instruments SET status = ?, activated_at = ? WHERE id = ?"
    ).bind("active", activatedAt, instrumentId).run();
    await insertEvent2(env, "instrument.activated", null, "instrument", instrumentId, {
      balance_id: instrument.balance_id,
      net_value: balance.net_value
    });
    return json7(200, {
      ok: true,
      data: {
        status: "active",
        activated_at: activatedAt
      }
    });
  } catch (err) {
    return json7(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost4, "onRequestPost");

// api/admin/dashboard.js
function json8(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json8, "json");
async function checkApiKey7(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json8(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey7, "checkApiKey");
async function onRequestGet7(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey7(request, env);
  if (apiKeyError) return apiKeyError;
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
    const eventsResult = await env.DB.prepare(
      "SELECT id, type, actor_id, subject_type, subject_id, meta, created_at FROM events WHERE created_at >= ? ORDER BY created_at DESC"
    ).bind(thirtyDaysAgo).all();
    const events = (eventsResult.results || []).map((r) => ({
      id: r.id,
      type: r.type,
      actorId: r.actor_id,
      subjectType: r.subject_type,
      subjectId: r.subject_id,
      meta: r.meta ? JSON.parse(r.meta) : {},
      createdAt: r.created_at
    }));
    const totalEvents = events.length;
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
    const events24h = events.filter((e) => e.createdAt >= last24h);
    const errorEvents = events.filter(
      (e) => e.type?.toLowerCase().includes("error") || e.type?.toLowerCase().includes("fail") || e.type === "voucher.cancel" && e.meta?.reason?.toLowerCase().includes("error")
    );
    const errorCount = errorEvents.length;
    const errorRate = totalEvents > 0 ? errorCount / totalEvents * 100 : 0;
    const qualityScore = Math.max(0, 100 - errorRate);
    const readinessFactors = {
      activity: Math.min(100, events24h.length / 100 * 100),
      // 100 events/day = 100%
      quality: qualityScore,
      stability: Math.max(0, 100 - errorRate * 2)
      // Double weight on errors
    };
    const productionReadiness = readinessFactors.activity * 0.3 + readinessFactors.quality * 0.4 + readinessFactors.stability * 0.3;
    const criticalErrors = events.filter(
      (e) => e.type?.toLowerCase().includes("critical") || e.type?.toLowerCase().includes("crash")
    );
    const systemStability = totalEvents > 0 ? Math.max(0, 100 - criticalErrors.length / totalEvents * 100) : 100;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 60 * 60 * 1e3);
      const dayStart = new Date(day.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(day.setHours(23, 59, 59, 999)).toISOString();
      const dayEvents = events.filter((e) => e.createdAt >= dayStart && e.createdAt <= dayEnd);
      timeline.push({
        date: day.toISOString().slice(0, 10),
        count: dayEvents.length
      });
    }
    const errorByType = {};
    errorEvents.forEach((e) => {
      const type = e.type || "unknown";
      errorByType[type] = (errorByType[type] || 0) + 1;
    });
    const topErrors = Object.entries(errorByType).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, 10);
    const fixEvents = events.filter(
      (e) => e.type?.toLowerCase().includes("fix") || e.type?.toLowerCase().includes("resolve")
    );
    const fixRate = errorCount > 0 ? fixEvents.length / errorCount * 100 : 0;
    const features = {};
    events.forEach((e) => {
      const featureName = e.subjectType || e.type?.split(".")[0] || "unknown";
      if (!features[featureName]) {
        features[featureName] = { events: 0, errors: 0 };
      }
      features[featureName].events++;
      if (errorEvents.includes(e)) {
        features[featureName].errors++;
      }
    });
    const featureMaturity = Object.entries(features).map(([name, stats]) => ({
      name,
      events: stats.events,
      errorRate: stats.events > 0 ? stats.errors / stats.events * 100 : 0
    })).sort((a, b) => b.events - a.events);
    const recentEvents = events.slice(0, 20);
    const backupHealth = {
      status: "ok",
      // Would check actual backup status
      lastBackup: "Vor 2 Stunden",
      // Placeholder
      backupFrequency: 85
      // Placeholder percentage
    };
    return json8(200, {
      ok: true,
      productionReadiness: Math.round(productionReadiness * 10) / 10,
      qualityScore: Math.round(qualityScore * 10) / 10,
      systemStability: Math.round(systemStability * 10) / 10,
      activityCount: events24h.length,
      productionTimeline: timeline,
      errorStats: {
        rate: Math.round(errorRate * 100) / 100,
        count: errorCount,
        total: totalEvents,
        topErrors
      },
      fixStats: {
        rate: Math.round(fixRate * 10) / 10,
        fixesPerWeek: fixEvents.filter((e) => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
          return e.createdAt >= weekAgo;
        }).length,
        openErrors: Math.max(0, errorCount - fixEvents.length)
      },
      featureMaturity,
      recentEvents,
      backupHealth
    });
  } catch (err) {
    return json8(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet7, "onRequestGet");

// api/admin/events.js
function json9(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json9, "json");
async function checkApiKey8(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json9(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey8, "checkApiKey");
async function onRequestGet8(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey8(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const limit = Math.max(
    1,
    Math.min(200, Number(url.searchParams.get("limit") || "50"))
  );
  try {
    const rows = await env.DB.prepare(
      "SELECT id, type, actor_id, subject_type, subject_id, meta, created_at FROM events ORDER BY created_at DESC LIMIT ?"
    ).bind(limit).all();
    const items = (rows.results || []).map((r) => ({
      id: r.id,
      type: r.type,
      actorId: r.actor_id,
      subjectType: r.subject_type,
      subjectId: r.subject_id,
      meta: r.meta ? JSON.parse(r.meta) : {},
      createdAt: r.created_at
    }));
    return json9(200, { ok: true, items });
  } catch (err) {
    return json9(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet8, "onRequestGet");

// api/ai/gateway.js
function json10(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json10, "json");
async function checkApiKey9(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json10(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey9, "checkApiKey");
async function checkRateLimit2(env, key, limit = 100, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit2, "checkRateLimit");
async function insertEvent3(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent3, "insertEvent");
var AI_OPERATIONS = {
  MANIFEST_ASSIST: "manifest.assist",
  // Titel/Texte vorschlagen, Tags generieren
  TRANSLATE: "translate",
  // Übersetzung
  SUMMARIZE: "summarize",
  // Zusammenfassung
  MODERATE: "moderate",
  // Inhalts-Filter
  LEGAL_CHECK: "legal.check",
  // Vertrags-Check
  BUSINESS_INTELLIGENCE: "business.intelligence",
  // Voucher-Daten, Forecasts
  TAG_GENERATE: "tag.generate"
  // Automatische Tag-Generierung
};
async function onRequestPost5(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey9(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit2(env, `ai.gateway|${ip}`);
  if (!allowed) {
    return json10(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json10(400, { ok: false, error: "invalid JSON body" });
  }
  const { operation, input, options = {} } = body;
  if (!operation || !input) {
    return json10(400, { ok: false, error: "operation and input required" });
  }
  try {
    let result;
    switch (operation) {
      case AI_OPERATIONS.MANIFEST_ASSIST:
        result = await handleManifestAssist(input, options, env);
        break;
      case AI_OPERATIONS.TRANSLATE:
        result = await handleTranslate(input, options, env);
        break;
      case AI_OPERATIONS.SUMMARIZE:
        result = await handleSummarize(input, options, env);
        break;
      case AI_OPERATIONS.MODERATE:
        result = await handleModerate(input, options, env);
        break;
      case AI_OPERATIONS.LEGAL_CHECK:
        result = await handleLegalCheck(input, options);
        break;
      case AI_OPERATIONS.BUSINESS_INTELLIGENCE:
        result = await handleBusinessIntelligence(env, input, options);
        break;
      case AI_OPERATIONS.TAG_GENERATE:
        result = await handleTagGenerate(input, options);
        break;
      // Settings-OS Integration
      case "settings.query":
        result = await handleSettingsQuery(input, options, env);
        break;
      case "settings.model-for-task":
        result = await handleSettingsModelForTask(input, options, env);
        break;
      case "settings.propose":
        result = await handleSettingsPropose(input, options, env);
        break;
      default:
        return json10(400, { ok: false, error: `unknown operation: ${operation}` });
    }
    await insertEvent3(
      env,
      `ai.${operation}`,
      body.actorId || null,
      "ai",
      null,
      { operation, inputLength: typeof input === "string" ? input.length : JSON.stringify(input).length }
    );
    return json10(200, { ok: true, result });
  } catch (error) {
    console.error("AI Gateway error:", error);
    return json10(500, { ok: false, error: error.message });
  }
}
__name(onRequestPost5, "onRequestPost");
async function handleSettingsQuery(input, options, env) {
  return {
    ok: true,
    message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
    data: {}
  };
}
__name(handleSettingsQuery, "handleSettingsQuery");
async function handleSettingsModelForTask(input, options, env) {
  return {
    ok: true,
    message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
    model: null
  };
}
__name(handleSettingsModelForTask, "handleSettingsModelForTask");
async function handleSettingsPropose(input, options, env) {
  try {
    const { nodeId, changes, rationale, proposedBy, llmModel } = input;
    const result = {
      ok: true,
      message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
      proposal: {
        nodeId,
        changes,
        rationale,
        proposedBy: proposedBy || "ai-gateway",
        llmModel: llmModel || "gpt-4",
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    return result;
  } catch (err) {
    return json10(500, { ok: false, error: String(err) });
  }
}
__name(handleSettingsPropose, "handleSettingsPropose");
async function handleManifestAssist(input, options, env) {
  const { content, existingTags = [] } = typeof input === "string" ? { content: input } : input;
  if (!content) {
    return { error: "content required" };
  }
  if (env.OPENAI_API_KEY) {
    try {
      const { handleManifestAssistOpenAI } = await import("./ai/gateway-enhanced.js");
      return await handleManifestAssistOpenAI(content, existingTags, env);
    } catch (err) {
      console.warn("OpenAI API failed, falling back to rule-based:", err);
    }
  }
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach((word) => {
    const clean = word.replace(/[^\w]/g, "");
    if (clean.length > 3) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });
  const suggestedTags = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([word]) => word).filter((tag) => !existingTags.includes(tag));
  const title = content.split("\n")[0]?.slice(0, 60) || content.slice(0, 60);
  const summary = content.length > 200 ? content.slice(0, 200) + "..." : content;
  return {
    suggestedTitle: title,
    suggestedTags,
    summary,
    language: detectLanguage(content),
    metadata: {
      wordCount: words.length,
      estimatedReadTime: Math.ceil(words.length / 200)
      // Minuten
    }
  };
}
__name(handleManifestAssist, "handleManifestAssist");
async function handleTranslate(input, options, env) {
  const { text, targetLanguage = "en", sourceLanguage = "auto" } = typeof input === "string" ? { text: input, ...options } : { ...input, ...options };
  if (env.DEEPL_API_KEY) {
    try {
      const { handleTranslateDeepL } = await import("./ai/gateway-enhanced.js");
      return await handleTranslateDeepL(text, targetLanguage, sourceLanguage, env);
    } catch (err) {
      console.warn("DeepL API failed, falling back:", err);
    }
  }
  return {
    translatedText: `[Translated to ${targetLanguage}]: ${text}`,
    sourceLanguage: sourceLanguage === "auto" ? detectLanguage(text) : sourceLanguage,
    targetLanguage,
    confidence: 0.6,
    provider: "rule-based"
  };
}
__name(handleTranslate, "handleTranslate");
async function handleSummarize(input, options, env) {
  const { text, maxLength = 200 } = typeof input === "string" ? { text: input, ...options } : { ...input, ...options };
  if (env.CLAUDE_API_KEY) {
    try {
      const { handleSummarizeClaude } = await import("./ai/gateway-enhanced.js");
      return await handleSummarizeClaude(text, maxLength, env);
    } catch (err) {
      console.warn("Claude API failed, trying OpenAI:", err);
    }
  }
  if (env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: "Du bist ein Assistent, der Texte pr\xE4gnant zusammenfasst." },
            { role: "user", content: `Fasse diesen Text zusammen (max. ${maxLength} Zeichen):

${text.substring(0, 8e3)}` }
          ],
          max_tokens: Math.min(maxLength || 200, 300)
        })
      });
      if (response.ok) {
        const data = await response.json();
        const summary2 = data.choices[0]?.message?.content || "";
        return {
          summary: summary2.slice(0, maxLength),
          originalLength: text.length,
          summaryLength: summary2.length,
          compressionRatio: (summary2.length / text.length).toFixed(2),
          provider: "openai"
        };
      }
    } catch (err) {
      console.warn("OpenAI API failed, falling back:", err);
    }
  }
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
  const summary = sentences.slice(0, 3).join(". ").slice(0, maxLength);
  return {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
    compressionRatio: (summary.length / text.length).toFixed(2),
    provider: "rule-based"
  };
}
__name(handleSummarize, "handleSummarize");
async function handleModerate(input, options, env) {
  const { content } = typeof input === "string" ? { content: input } : input;
  if (env.OPENAI_API_KEY) {
    try {
      const { handleModerateOpenAI } = await import("./ai/gateway-enhanced.js");
      return await handleModerateOpenAI(content, env);
    } catch (err) {
      console.warn("OpenAI Moderation failed, falling back:", err);
    }
  }
  const blockedTerms = [];
  const flagged = blockedTerms.some(
    (term) => content.toLowerCase().includes(term.toLowerCase())
  );
  return {
    safe: !flagged,
    flags: flagged ? ["potential_issue"] : [],
    confidence: flagged ? 0.7 : 1,
    provider: "rule-based"
  };
}
__name(handleModerate, "handleModerate");
async function handleLegalCheck(input, options) {
  const { contract, templateType } = typeof input === "string" ? { contract: input, ...options } : { ...input, ...options };
  return {
    valid: true,
    issues: [],
    suggestions: [],
    confidence: 0.8
  };
}
__name(handleLegalCheck, "handleLegalCheck");
async function handleBusinessIntelligence(env, input, options) {
  const { query, dateRange } = typeof input === "string" ? { query: input, ...options } : { ...input, ...options };
  try {
    const vouchersResult = await env.DB.prepare(
      "SELECT service_type, status, COUNT(*) as count FROM vouchers GROUP BY service_type, status"
    ).all();
    const analytics = {
      totalVouchers: 0,
      byServiceType: {},
      byStatus: {}
    };
    (vouchersResult.results || []).forEach((row) => {
      analytics.totalVouchers += row.count || 0;
      analytics.byServiceType[row.service_type] = (analytics.byServiceType[row.service_type] || 0) + (row.count || 0);
      analytics.byStatus[row.status] = (analytics.byStatus[row.status] || 0) + (row.count || 0);
    });
    return {
      analytics,
      insights: generateInsights(analytics),
      recommendations: generateRecommendations(analytics)
    };
  } catch (err) {
    return { error: String(err) };
  }
}
__name(handleBusinessIntelligence, "handleBusinessIntelligence");
async function handleTagGenerate(input, options) {
  const { content } = typeof input === "string" ? { content: input } : input;
  return handleManifestAssist({ content }, {}).then((r) => ({
    tags: r.suggestedTags || [],
    confidence: 0.85
  }));
}
__name(handleTagGenerate, "handleTagGenerate");
function detectLanguage(text) {
  if (/[äöüßÄÖÜ]/.test(text)) return "de";
  if (/[àáâãäå]/.test(text)) return "fr";
  if (/[ñÑ]/.test(text)) return "es";
  return "en";
}
__name(detectLanguage, "detectLanguage");
function generateInsights(analytics) {
  const insights = [];
  const topService = Object.entries(analytics.byServiceType || {}).sort((a, b) => b[1] - a[1])[0];
  if (topService) {
    insights.push(`Meistgenutzter Service: ${topService[0]} (${topService[1]} Vouchers)`);
  }
  const activeCount = analytics.byStatus?.active || 0;
  if (activeCount > 0) {
    insights.push(`${activeCount} aktive Vouchers`);
  }
  return insights;
}
__name(generateInsights, "generateInsights");
function generateRecommendations(analytics) {
  const recommendations = [];
  if (analytics.totalVouchers < 10) {
    recommendations.push("Mehr Vouchers erstellen, um Daten f\xFCr Analytics zu sammeln");
  }
  const expiredCount = analytics.byStatus?.expired || 0;
  if (expiredCount > 0) {
    recommendations.push(`${expiredCount} abgelaufene Vouchers bereinigen`);
  }
  return recommendations;
}
__name(generateRecommendations, "generateRecommendations");

// api/autofix/errors.js
function json11(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json11, "json");
function getClientIp(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp, "getClientIp");
var ERROR_PATTERNS = {
  "ERR_CONNECTION_REFUSED": {
    type: "api_connection",
    fix: "disable_api_calls",
    message: "API-Verbindung fehlgeschlagen. API-Aufrufe werden deaktiviert."
  },
  "404": {
    type: "not_found",
    fix: "fallback_content",
    message: "Ressource nicht gefunden. Fallback-Inhalt wird angezeigt."
  },
  "500": {
    type: "server_error",
    fix: "retry_with_backoff",
    message: "Server-Fehler erkannt. Wiederholung mit Backoff."
  },
  "CORS": {
    type: "cors_error",
    fix: "use_relative_paths",
    message: "CORS-Fehler erkannt. Relative Pfade werden verwendet."
  },
  "timeout": {
    type: "timeout",
    fix: "increase_timeout",
    message: "Timeout erkannt. Timeout wird erh\xF6ht."
  },
  "null": {
    type: "null_reference",
    fix: "add_null_check",
    message: "Null-Referenz erkannt. Null-Pr\xFCfung wird hinzugef\xFCgt."
  },
  "undefined": {
    type: "undefined_reference",
    fix: "add_undefined_check",
    message: "Undefined-Referenz erkannt. Undefined-Pr\xFCfung wird hinzugef\xFCgt."
  }
};
var AUTO_FIXES = {
  disable_api_calls: /* @__PURE__ */ __name((error, context) => {
    return {
      action: "set_api_base_null",
      params: { apiBase: null },
      message: "API-Aufrufe wurden deaktiviert, da keine Verbindung m\xF6glich ist."
    };
  }, "disable_api_calls"),
  fallback_content: /* @__PURE__ */ __name((error, context) => {
    return {
      action: "show_fallback",
      params: { content: "Ressource nicht verf\xFCgbar. Bitte sp\xE4ter erneut versuchen." },
      message: "Fallback-Inhalt wird angezeigt."
    };
  }, "fallback_content"),
  retry_with_backoff: /* @__PURE__ */ __name((error, context) => {
    return {
      action: "schedule_retry",
      params: { delay: 2e3, maxRetries: 3 },
      message: "Wiederholung wird in 2 Sekunden versucht."
    };
  }, "retry_with_backoff"),
  use_relative_paths: /* @__PURE__ */ __name((error, context) => {
    return {
      action: "switch_to_relative",
      params: {},
      message: "Relative Pfade werden verwendet."
    };
  }, "use_relative_paths"),
  increase_timeout: /* @__PURE__ */ __name((error, context) => {
    return {
      action: "update_timeout",
      params: { timeout: 3e4 },
      message: "Timeout wurde auf 30 Sekunden erh\xF6ht."
    };
  }, "increase_timeout"),
  add_null_check: /* @__PURE__ */ __name((error, context) => {
    return {
      action: "add_null_guard",
      params: { variable: context.variable },
      message: "Null-Pr\xFCfung wurde hinzugef\xFCgt."
    };
  }, "add_null_check"),
  add_undefined_check: /* @__PURE__ */ __name((error, context) => {
    return {
      action: "add_undefined_guard",
      params: { variable: context.variable },
      message: "Undefined-Pr\xFCfung wurde hinzugef\xFCgt."
    };
  }, "add_undefined_check")
};
async function detectErrorPattern(errorMessage, errorStack) {
  const message = (errorMessage || "").toLowerCase();
  const stack = (errorStack || "").toLowerCase();
  const combined = `${message} ${stack}`;
  for (const [pattern, config] of Object.entries(ERROR_PATTERNS)) {
    if (combined.includes(pattern.toLowerCase())) {
      return config;
    }
  }
  return null;
}
__name(detectErrorPattern, "detectErrorPattern");
async function applyAutoFix(fixType, error, context, env) {
  const fixer = AUTO_FIXES[fixType];
  if (!fixer) {
    return { ok: false, error: "Unknown fix type" };
  }
  try {
    const fixResult = fixer(error, context);
    const eventId = `af-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await env.DB.prepare(
      `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      eventId,
      "autofix.applied",
      context.actorUid || null,
      "error",
      error.id || null,
      JSON.stringify({
        fixType,
        action: fixResult.action,
        params: fixResult.params,
        error: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    return {
      ok: true,
      fixId: eventId,
      action: fixResult.action,
      params: fixResult.params,
      message: fixResult.message
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
__name(applyAutoFix, "applyAutoFix");
async function onRequestPost6(context) {
  const { request, env } = context;
  const ip = getClientIp(request);
  let errorData;
  try {
    errorData = await request.json();
  } catch {
    return json11(400, { ok: false, error: "invalid JSON body" });
  }
  const { error, errors, context: errorContext, actorUid } = errorData || {};
  const errorList = errors || (error ? [{ error, context: errorContext, actorUid }] : []);
  if (!errorList.length) {
    return json11(400, { ok: false, error: "error or errors array required" });
  }
  const results = [];
  for (const item of errorList) {
    const { error: err, context: ctx, actorUid: uid } = item;
    if (!err || !err.message) {
      results.push({ ok: false, error: "error.message required" });
      continue;
    }
    const pattern = await detectErrorPattern(err.message, err.stack);
    if (!pattern) {
      results.push({
        ok: true,
        detected: false,
        errorId: err.id,
        message: "Kein bekanntes Fehlermuster erkannt. Fehler wurde protokolliert."
      });
      continue;
    }
    const fixResult = await applyAutoFix(
      pattern.fix,
      err,
      { ...ctx, actorUid: uid, ip },
      env
    );
    if (!fixResult.ok) {
      results.push({ ok: false, error: fixResult.error, errorId: err.id });
      continue;
    }
    results.push({
      ok: true,
      detected: true,
      errorId: err.id,
      pattern: pattern.type,
      fix: {
        id: fixResult.fixId,
        action: fixResult.action,
        params: fixResult.params,
        message: fixResult.message
      },
      notification: {
        title: "Automatische Fehlerkorrektur",
        message: pattern.message + " " + fixResult.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  return json11(200, {
    ok: true,
    results,
    summary: {
      total: results.length,
      detected: results.filter((r) => r.detected).length,
      fixed: results.filter((r) => r.detected && r.ok).length
    }
  });
}
__name(onRequestPost6, "onRequestPost");

// api/autofix/notify.js
async function onRequestGet9(context) {
  const { request, env } = context;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", message: "Autofix-Benachrichtigungen aktiv" })}

`)
      );
      const interval = setInterval(async () => {
        try {
          const now = /* @__PURE__ */ new Date();
          const since = new Date(now.getTime() - 5e3).toISOString();
          const events = await env.DB.prepare(
            `SELECT id, type, actor_id, subject_type, subject_id, meta, created_at
             FROM events
             WHERE type = 'autofix.applied' AND created_at > ?
             ORDER BY created_at DESC
             LIMIT 10`
          ).bind(since).all();
          for (const event of events.results || []) {
            const meta = JSON.parse(event.meta || "{}");
            const notification = {
              type: "autofix",
              id: event.id,
              timestamp: event.created_at,
              fix: {
                type: meta.fixType,
                action: meta.action,
                params: meta.params,
                message: meta.message || "Fehler automatisch korrigiert"
              },
              error: meta.error
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(notification)}

`)
            );
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: String(err) })}

`)
          );
        }
      }, 2e3);
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
__name(onRequestGet9, "onRequestGet");

// api/autofix/status.js
function json12(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json12, "json");
async function onRequestGet10(context) {
  const { request, env } = context;
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
    const events = await env.DB.prepare(
      `SELECT id, type, actor_id, subject_type, subject_id, meta, created_at
       FROM events
       WHERE type = 'autofix.applied' AND created_at > ?
       ORDER BY created_at DESC
       LIMIT 50`
    ).bind(since).all();
    const stats = {
      total: events.results?.length || 0,
      byType: {},
      recent: []
    };
    for (const event of events.results || []) {
      const meta = JSON.parse(event.meta || "{}");
      const fixType = meta.fixType || "unknown";
      stats.byType[fixType] = (stats.byType[fixType] || 0) + 1;
      if (stats.recent.length < 10) {
        stats.recent.push({
          id: event.id,
          timestamp: event.created_at,
          fixType,
          action: meta.action,
          message: meta.message
        });
      }
    }
    return json12(200, {
      ok: true,
      stats,
      events: events.results || []
    });
  } catch (err) {
    return json12(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet10, "onRequestGet");

// api/cms/collections/index.js
function json13(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json13, "json");
async function checkApiKey10(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json13(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey10, "checkApiKey");
function makeId4(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
__name(makeId4, "makeId");
async function onRequestGet11(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey10(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const siteId = url.searchParams.get("site_id");
  if (!siteId) {
    return json13(400, { ok: false, error: "site_id query parameter required" });
  }
  try {
    const collections = await env.DB.prepare(
      `SELECT * FROM cms_collections WHERE site_id = ? ORDER BY created_at DESC`
    ).bind(siteId).all();
    return json13(200, {
      ok: true,
      data: {
        collections: collections.results || []
      }
    });
  } catch (err) {
    return json13(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet11, "onRequestGet");
async function onRequestPost7(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey10(request, env);
  if (apiKeyError) return apiKeyError;
  let body;
  try {
    body = await request.json();
  } catch {
    return json13(400, { ok: false, error: "invalid JSON body" });
  }
  const { site_id, name, slug, schema, settings } = body;
  if (!site_id || !name || !slug || !schema) {
    return json13(400, { ok: false, error: "site_id, name, slug, and schema required" });
  }
  try {
    const collectionId = makeId4("coll");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(
      `INSERT INTO cms_collections (id, site_id, name, slug, schema_json, settings_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      collectionId,
      site_id,
      name,
      slug,
      JSON.stringify(schema),
      JSON.stringify(settings || {}),
      createdAt
    ).run();
    return json13(200, {
      ok: true,
      data: {
        collection: {
          id: collectionId,
          site_id,
          name,
          slug,
          schema,
          settings: settings || {},
          created_at: createdAt
        }
      }
    });
  } catch (err) {
    return json13(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost7, "onRequestPost");

// api/cms/sites/index.js
function json14(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json14, "json");
async function checkApiKey11(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json14(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey11, "checkApiKey");
function makeId5(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
__name(makeId5, "makeId");
async function onRequestGet12(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey11(request, env);
  if (apiKeyError) return apiKeyError;
  const tenantId = request.headers.get("X-Tenant-ID") || "tenant-demo";
  try {
    const sites = await env.DB.prepare(
      `SELECT * FROM cms_sites WHERE tenant_id = ? ORDER BY created_at DESC`
    ).bind(tenantId).all();
    return json14(200, {
      ok: true,
      data: {
        sites: sites.results || []
      }
    });
  } catch (err) {
    return json14(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet12, "onRequestGet");
async function onRequestPost8(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey11(request, env);
  if (apiKeyError) return apiKeyError;
  let body;
  try {
    body = await request.json();
  } catch {
    return json14(400, { ok: false, error: "invalid JSON body" });
  }
  const { name, slug, default_locale = "de", settings } = body;
  if (!name || !slug) {
    return json14(400, { ok: false, error: "name and slug required" });
  }
  const tenantId = request.headers.get("X-Tenant-ID") || "tenant-demo";
  try {
    const siteId = makeId5("site");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(
      `INSERT INTO cms_sites (id, tenant_id, name, slug, default_locale, status, settings, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      siteId,
      tenantId,
      name,
      slug,
      default_locale,
      "draft",
      JSON.stringify(settings || {}),
      createdAt
    ).run();
    return json14(200, {
      ok: true,
      data: {
        site: {
          id: siteId,
          tenant_id: tenantId,
          name,
          slug,
          default_locale,
          status: "draft",
          settings: settings || {},
          created_at: createdAt
        }
      }
    });
  } catch (err) {
    return json14(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost8, "onRequestPost");

// api/contracts/list.js
function json15(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json15, "json");
async function checkApiKey12(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json15(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey12, "checkApiKey");
async function onRequestGet13(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey12(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const voucherId = url.searchParams.get("voucherId");
  const roomId = url.searchParams.get("roomId");
  try {
    let query = "SELECT c.id, c.name, c.mime_type, c.byte_size, c.storage_url, c.hash_sha256, c.created_by, c.created_at FROM contracts c";
    const where = [];
    const params = [];
    if (voucherId || roomId) {
      query += " JOIN contract_links cl ON c.id = cl.contract_id";
      if (voucherId) {
        where.push("cl.voucher_id = ?");
        params.push(voucherId);
      }
      if (roomId) {
        where.push("cl.room_id = ?");
        params.push(roomId);
      }
    }
    if (where.length) {
      query += " WHERE " + where.join(" AND ");
    }
    query += " ORDER BY c.created_at DESC";
    const rows = await env.DB.prepare(query).bind(...params).all();
    const items = (rows.results || []).map((r) => ({
      id: r.id,
      name: r.name,
      mimeType: r.mime_type,
      byteSize: r.byte_size,
      storageUrl: r.storage_url,
      hashSha256: r.hash_sha256,
      createdBy: r.created_by,
      createdAt: r.created_at
    }));
    return json15(200, { ok: true, items });
  } catch (err) {
    return json15(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet13, "onRequestGet");

// api/contracts/upload.js
function json16(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json16, "json");
async function sha256Hex(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
function makeId6(prefix = "ct") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId6, "makeId");
async function checkApiKey13(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json16(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey13, "checkApiKey");
async function insertEvent4(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent4, "insertEvent");
async function onRequestPost9(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey13(request, env);
  if (apiKeyError) return apiKeyError;
  if (!env.CONTRACTS_BUCKET) {
    return json16(500, {
      ok: false,
      error: "CONTRACTS_BUCKET binding is not configured"
    });
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return json16(400, { ok: false, error: "expected multipart/form-data" });
  }
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return json16(400, { ok: false, error: "file field is required" });
  }
  const voucherId = form.get("voucherId") || null;
  const roomId = form.get("roomId") || null;
  const actorId = form.get("actorId") || null;
  const name = (form.get("name") || file.name || "contract").toString();
  try {
    const hash = await sha256Hex(file);
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const contractId = makeId6("ct");
    const objectKey = `contracts/${contractId}/${encodeURIComponent(
      file.name || "document"
    )}`;
    await env.CONTRACTS_BUCKET.put(objectKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream"
      }
    });
    await env.DB.prepare(
      `INSERT INTO contracts
       (id, name, mime_type, byte_size, storage_url, hash_sha256, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      contractId,
      name,
      file.type || null,
      file.size || null,
      objectKey,
      hash,
      actorId || null,
      createdAt
    ).run();
    let linkId = null;
    if (voucherId || roomId) {
      linkId = makeId6("cl");
      await env.DB.prepare(
        `INSERT INTO contract_links
         (id, contract_id, voucher_id, room_id, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        linkId,
        contractId,
        voucherId || null,
        roomId || null,
        "primary",
        createdAt
      ).run();
    }
    await insertEvent4(env, "contract.upload", actorId, "contract", contractId, {
      voucherId,
      roomId,
      storageUrl: objectKey
    });
    return json16(200, {
      ok: true,
      contract: {
        id: contractId,
        name,
        mimeType: file.type || null,
        byteSize: file.size || null,
        storageUrl: objectKey,
        hashSha256: hash,
        createdBy: actorId,
        createdAt
      },
      linkId
    });
  } catch (err) {
    return json16(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost9, "onRequestPost");

// api/formula/execute.js
async function onRequestPost10(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { formulaName, input } = data;
    let output = {};
    let dimensional = {
      time: 1,
      space: 1,
      energy: 1,
      cost: 1,
      total: 4
    };
    switch (formulaName) {
      case "Ohmsches Gesetz":
        const voltage = input.voltage || 1;
        const current = input.current || 1;
        const resistance = voltage / current;
        output = {
          resistance,
          voltage,
          current,
          power: voltage * current
        };
        dimensional = {
          time: 1,
          space: 0.5,
          energy: 1,
          cost: 0.8,
          total: 3.3
        };
        break;
      case "ELABORAL ORNANIEREN UEBERGEBEN UNENDLICHKEIT":
        output = {
          elaborate: input.elaborate || 1,
          ornament: input.ornament || 1,
          transfer: input.transfer || 1,
          infinity: Infinity,
          result: Infinity
        };
        dimensional = {
          time: Infinity,
          space: Infinity,
          energy: Infinity,
          cost: Infinity,
          total: Infinity
        };
        break;
      case "Dimensionale Expansion":
        const time = input.time || 1;
        const space = input.space || 1;
        const energy = input.energy || 1;
        const cost = input.cost || 1;
        const distance = Math.sqrt(
          Math.pow(time, 2) + Math.pow(space, 2) + Math.pow(energy, 2) + Math.pow(cost, 2)
        );
        output = { time, space, energy, cost, distance };
        dimensional = {
          time,
          space,
          energy,
          cost,
          total: distance
        };
        break;
      default:
        throw new Error(`Unbekannte Formel: ${formulaName}`);
    }
    const result = {
      formula: formulaName,
      input,
      output,
      dimensional,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      testPhase: true,
      productionReady: false
    };
    return new Response(JSON.stringify({
      ok: true,
      result
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || "Server-Fehler"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost10, "onRequestPost");

// api/mcp/scan.js
async function onRequestPost11(context) {
  const { env } = context;
  try {
    const scanResult = {
      detected: [],
      missingFunctions: [],
      networkDistribution: {
        localhost: [],
        networks: [],
        global: [],
        bluetooth: [],
        wifi: [],
        external: []
      },
      status: {
        total: 0,
        connected: 0,
        available: 0,
        xxxxl: 0,
        outputs: 0,
        verifiedBackups: {
          local: 0,
          online: 0
        },
        recoveryPoints: 0
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      headingAnchorProject: {
        name: "MCP Heading Anchor Project",
        status: "active",
        scanCompleted: true
      }
    };
    return new Response(JSON.stringify({
      ok: true,
      scan: scanResult
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || "Server-Fehler"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost11, "onRequestPost");

// api/mcp/status.js
async function onRequestGet14(context) {
  const { env } = context;
  try {
    const registryPath = "Settings/mcp/mcp-registry.json";
    const status = {
      total: 0,
      connected: 0,
      available: 0,
      xxxxl: 0,
      outputs: 0,
      verifiedBackups: {
        local: 0,
        online: 0
      },
      recoveryPoints: 0,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      headingAnchorProject: {
        name: "MCP Heading Anchor Project",
        status: "active",
        purpose: "Total MCP Management & Recovery System"
      }
    };
    try {
    } catch (e) {
    }
    return new Response(JSON.stringify({
      ok: true,
      status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || "Server-Fehler"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet14, "onRequestGet");

// api/messages/ack.js
function json17(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json17, "json");
async function checkApiKey14(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json17(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey14, "checkApiKey");
async function checkRateLimit3(env, key, limit = 100, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit3, "checkRateLimit");
async function onRequestPost12(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey14(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit3(env, `messages.ack|${ip}`);
  if (!allowed) {
    return json17(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json17(400, { ok: false, error: "invalid JSON body" });
  }
  const { user_id, message_ids } = body;
  if (!user_id || !message_ids || !Array.isArray(message_ids) || message_ids.length === 0) {
    return json17(400, {
      ok: false,
      error: "missing_required_fields",
      message: "user_id and message_ids (array) are required"
    });
  }
  const deliveredAt = (/* @__PURE__ */ new Date()).toISOString();
  const acked = [];
  try {
    for (const messageId of message_ids) {
      const message = await env.DB.prepare(
        "SELECT id, recipient_id FROM messages WHERE id = ? AND recipient_id = ?"
      ).bind(messageId, user_id).first();
      if (message) {
        await env.DB.prepare(
          "UPDATE messages SET delivered_at = ? WHERE id = ?"
        ).bind(deliveredAt, messageId).run();
        const delivery = await env.DB.prepare(
          "SELECT id FROM message_delivery WHERE message_id = ? AND user_id = ?"
        ).bind(messageId, user_id).first();
        if (delivery) {
          await env.DB.prepare(
            "UPDATE message_delivery SET status = ?, updated_at = ? WHERE id = ?"
          ).bind("delivered", deliveredAt, delivery.id).run();
        }
        acked.push(messageId);
      }
    }
    return json17(200, { ok: true, data: { acked } });
  } catch (err) {
    return json17(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost12, "onRequestPost");

// api/messages/pending.js
function json18(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json18, "json");
async function checkApiKey15(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json18(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey15, "checkApiKey");
async function onRequestGet15(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey15(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");
  const since = url.searchParams.get("since");
  if (!userId) {
    return json18(400, {
      ok: false,
      error: "missing_user_id",
      message: "user_id query parameter is required"
    });
  }
  try {
    let query = `SELECT * FROM messages 
                 WHERE recipient_id = ? AND delivered_at IS NULL`;
    const params = [userId];
    if (since) {
      query += " AND created_at >= ?";
      params.push(since);
    }
    query += " ORDER BY created_at ASC LIMIT 100";
    const result = await env.DB.prepare(query).bind(...params).all();
    const messages = (result.results || []).map((r) => ({
      id: r.id,
      sender_id: r.sender_id,
      recipient_id: r.recipient_id,
      subject: r.subject,
      body: r.body,
      content_preview: r.content_preview,
      created_at: r.created_at,
      delivered_at: r.delivered_at,
      read_at: r.read_at,
      meta: r.meta ? JSON.parse(r.meta) : {}
    }));
    return json18(200, { ok: true, data: { messages } });
  } catch (err) {
    return json18(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet15, "onRequestGet");

// api/messages/send.js
function json19(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json19, "json");
function makeId7(prefix = "msg") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId7, "makeId");
async function checkApiKey16(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json19(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey16, "checkApiKey");
async function checkRateLimit4(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit4, "checkRateLimit");
async function insertEvent5(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent5, "insertEvent");
async function onRequestPost13(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey16(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit4(env, `messages.send|${ip}`);
  if (!allowed) {
    return json19(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json19(400, { ok: false, error: "invalid JSON body" });
  }
  const { from_user_id, to_user_id, subject, body: messageBody, meta = {} } = body;
  if (!from_user_id || !to_user_id || !messageBody) {
    return json19(400, {
      ok: false,
      error: "missing_required_fields",
      message: "from_user_id, to_user_id, and body are required"
    });
  }
  const messageId = makeId7("msg");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const preview = messageBody.length > 100 ? messageBody.substring(0, 100) + "..." : messageBody;
  try {
    await env.DB.prepare(
      `INSERT INTO messages (id, sender_id, recipient_id, subject, body, content_preview, created_at, delivered_at, read_at, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      messageId,
      from_user_id,
      to_user_id,
      subject || null,
      messageBody,
      preview,
      createdAt,
      null,
      // delivered_at wird später gesetzt
      null,
      // read_at wird später gesetzt
      JSON.stringify(meta || {})
    ).run();
    const message = {
      id: messageId,
      sender_id: from_user_id,
      recipient_id: to_user_id,
      subject: subject || null,
      body: messageBody,
      content_preview: preview,
      created_at: createdAt,
      delivered_at: null,
      read_at: null,
      meta: meta || {}
    };
    await insertEvent5(env, "message.sent", from_user_id, "message", messageId, {
      recipient: to_user_id
    });
    return json19(200, { ok: true, data: { message } });
  } catch (err) {
    return json19(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost13, "onRequestPost");

// utils/url-generator.js
function generateMicrositeUrl(userId, pathSegments = []) {
  if (!userId) throw new Error("userId is required");
  let url = `T,${userId}.`;
  pathSegments.forEach((segment, index) => {
    const commas = ",".repeat(index + 2);
    url += `&T${commas}${segment}.`;
  });
  return url;
}
__name(generateMicrositeUrl, "generateMicrositeUrl");

// api/microsite/create.js
function json20(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json20, "json");
async function checkApiKey17(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json20(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey17, "checkApiKey");
function makeId8(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
__name(makeId8, "makeId");
async function onRequestPost14(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey17(request, env);
  if (apiKeyError) return apiKeyError;
  let body;
  try {
    body = await request.json();
  } catch {
    return json20(400, { ok: false, error: "invalid JSON body" });
  }
  const { userId, name, builder_mode = "simple" } = body;
  if (!userId) {
    return json20(400, { ok: false, error: "userId required (user must be verified)" });
  }
  try {
    const existingSite = await env.DB.prepare(
      `SELECT * FROM cms_sites WHERE user_id = ? LIMIT 1`
    ).bind(userId).first();
    if (existingSite) {
      return json20(200, {
        ok: true,
        data: {
          site: {
            id: existingSite.id,
            user_id: existingSite.user_id,
            name: existingSite.name,
            slug: existingSite.slug,
            microsite_url: existingSite.microsite_url,
            builder_mode: existingSite.builder_mode || "simple"
          },
          message: "Site already exists"
        }
      });
    }
    let tenantId = `tenant-${userId}`;
    const existingTenant = await env.DB.prepare(
      `SELECT id FROM cms_tenants WHERE id = ?`
    ).bind(tenantId).first();
    if (!existingTenant) {
      await env.DB.prepare(
        `INSERT INTO cms_tenants (id, name, plan, settings, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        tenantId,
        name || `User ${userId}`,
        "free",
        JSON.stringify({}),
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
    }
    const siteId = makeId8("site");
    const slug = `site-${userId}`;
    const micrositeUrl = generateMicrositeUrl(userId, []);
    await env.DB.prepare(
      `INSERT INTO cms_sites (
         id, tenant_id, user_id, name, slug, default_locale, status, 
         microsite_url, builder_mode, settings, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      siteId,
      tenantId,
      userId,
      name || "Meine Website",
      slug,
      "de",
      "draft",
      micrositeUrl,
      builder_mode,
      JSON.stringify({}),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    const homePageId = makeId8("page");
    await env.DB.prepare(
      `INSERT INTO cms_pages (
         id, site_id, parent_page_id, path, type, is_home, layout, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      homePageId,
      siteId,
      null,
      "/",
      "standard",
      1,
      "default",
      "draft",
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    return json20(200, {
      ok: true,
      data: {
        site: {
          id: siteId,
          tenant_id: tenantId,
          user_id: userId,
          name: name || "Meine Website",
          slug,
          microsite_url: micrositeUrl,
          builder_mode,
          status: "draft"
        },
        message: "Mikro-Site created successfully"
      }
    });
  } catch (err) {
    console.error("Error creating microsite:", err);
    return json20(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost14, "onRequestPost");

// api/microsite/my-sites.js
function json21(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json21, "json");
async function checkApiKey18(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json21(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey18, "checkApiKey");
async function onRequestGet16(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey18(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return json21(400, { ok: false, error: "userId query parameter required" });
  }
  try {
    const sites = await env.DB.prepare(
      `SELECT 
         id, user_id, name, slug, microsite_url, builder_mode, status,
         created_at, published_at
       FROM cms_sites 
       WHERE user_id = ? 
       ORDER BY created_at DESC`
    ).bind(userId).all();
    return json21(200, {
      ok: true,
      data: {
        sites: sites.results || [],
        count: sites.results?.length || 0
      }
    });
  } catch (err) {
    console.error("Error fetching user sites:", err);
    return json21(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet16, "onRequestGet");

// api/mortgage/application.js
function json22(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json22, "json");
function makeId9(prefix = "app") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId9, "makeId");
function getClientIp2(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp2, "getClientIp");
async function checkApiKey19(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json22(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey19, "checkApiKey");
async function checkRateLimit5(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit5, "checkRateLimit");
async function insertEvent6(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent6, "insertEvent");
async function onRequestPost15(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey19(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp2(request);
  const allowed = await checkRateLimit5(env, `mortgage.application|${ip}`);
  if (!allowed) {
    return json22(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json22(400, { ok: false, error: "invalid JSON body" });
  }
  const borrowerUid = request.headers.get("X-MOT-User");
  if (!borrowerUid) {
    return json22(400, { ok: false, error: "X-MOT-User header (borrowerUid) is required" });
  }
  const id = body.applicationId || makeId9("app");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const propertyId = body.propertyId || "house-unknown";
  const desiredLoan = body.desiredLoan && typeof body.desiredLoan.amount === "number" ? body.desiredLoan.amount : null;
  const currency = body.desiredLoan && typeof body.desiredLoan.currency === "string" ? body.desiredLoan.currency : "EUR";
  const durationYears = Number(body.desiredDurationYears || 0);
  const rateType = body.desiredRateType || "fixed";
  const maxInterest = typeof body.maxInterestRate === "number" ? body.maxInterestRate : null;
  const meta = body.meta || {};
  try {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO properties (id, address, meta) VALUES (?, ?, COALESCE(meta, ?))"
    ).bind(propertyId, null, JSON.stringify({})).run();
    await env.DB.prepare(
      `INSERT INTO mortgage_applications
       (id, property_id, borrower_uid, desired_loan, currency, duration_years, rate_type, max_interest, status, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      propertyId,
      borrowerUid,
      desiredLoan,
      currency,
      durationYears,
      rateType,
      maxInterest,
      "open",
      JSON.stringify(meta),
      createdAt
    ).run();
    const application = {
      applicationId: id,
      borrowerUid,
      propertyId,
      desiredLoan: desiredLoan != null ? { amount: desiredLoan, currency } : null,
      desiredDurationYears: durationYears,
      desiredRateType: rateType,
      maxInterestRate: maxInterest,
      status: "open",
      meta,
      createdAt
    };
    await insertEvent6(env, "mortgage.application", borrowerUid, "mortgage_application", id, {
      propertyId,
      desiredLoan
    });
    return json22(200, { ok: true, applicationId: id, application });
  } catch (err) {
    return json22(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost15, "onRequestPost");

// api/mortgage/offer.js
function json23(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json23, "json");
function makeId10(prefix = "mort-offer") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId10, "makeId");
function getClientIp3(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp3, "getClientIp");
async function checkApiKey20(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json23(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey20, "checkApiKey");
async function checkRateLimit6(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit6, "checkRateLimit");
async function insertEvent7(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent7, "insertEvent");
async function onRequestPost16(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey20(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp3(request);
  const allowed = await checkRateLimit6(env, `mortgage.offer|${ip}`);
  if (!allowed) {
    return json23(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json23(400, { ok: false, error: "invalid JSON body" });
  }
  const issuerId = request.headers.get("X-MOT-User");
  if (!issuerId) {
    return json23(400, {
      ok: false,
      error: "X-MOT-User header (issuerId) is required"
    });
  }
  if (!body.applicationId) {
    return json23(400, { ok: false, error: "applicationId is required" });
  }
  try {
    const appRow = await env.DB.prepare(
      "SELECT id, borrower_uid FROM mortgage_applications WHERE id = ?"
    ).bind(body.applicationId).first();
    if (!appRow) {
      return json23(404, { ok: false, error: "application not found" });
    }
    const id = body.voucherId || makeId10();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const interestRate = typeof body.interestRate === "number" ? body.interestRate : null;
    const monthlyPayment = typeof body.monthlyPayment === "number" ? body.monthlyPayment : null;
    await env.DB.prepare(
      `INSERT INTO mortgage_offers
       (id, application_id, lender_uid, interest_rate, monthly_payment, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      appRow.id,
      issuerId,
      interestRate,
      monthlyPayment,
      "open",
      createdAt
    ).run();
    const offer = {
      offerId: id,
      applicationId: appRow.id,
      lenderUid: issuerId,
      borrowerUid: appRow.borrower_uid,
      interestRate,
      monthlyPayment,
      status: "open",
      createdAt
    };
    await insertEvent7(env, "mortgage.offer", issuerId, "mortgage_offer", id, {
      applicationId: appRow.id
    });
    return json23(200, { ok: true, offerId: id, offer });
  } catch (err) {
    return json23(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost16, "onRequestPost");

// api/mortgage/offer-list.js
function json24(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json24, "json");
function getClientIp4(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp4, "getClientIp");
async function checkApiKey21(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json24(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey21, "checkApiKey");
async function checkRateLimit7(env, key, limit = 120, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit7, "checkRateLimit");
async function onRequestGet17(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey21(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp4(request);
  const allowed = await checkRateLimit7(env, `mortgage.offer-list|${ip}`);
  if (!allowed) {
    return json24(429, { ok: false, error: "rate limit exceeded" });
  }
  const url = new URL(request.url);
  const applicationId = url.searchParams.get("applicationId");
  const role = (url.searchParams.get("role") || "borrower").toString();
  const uid = request.headers.get("X-MOT-User");
  if (!uid) {
    return json24(400, { ok: false, error: "X-MOT-User header is required" });
  }
  let query = "SELECT id, application_id, lender_uid, interest_rate, monthly_payment, status, created_at FROM mortgage_offers";
  const where = [];
  const params = [];
  if (applicationId) {
    where.push("application_id = ?");
    params.push(applicationId);
  }
  if (role === "borrower") {
    query = "SELECT o.id, o.application_id, o.lender_uid, o.interest_rate, o.monthly_payment, o.status, o.created_at, a.borrower_uid FROM mortgage_offers o JOIN mortgage_applications a ON o.application_id = a.id";
    if (applicationId) {
      where.push("o.application_id = ?");
    }
    where.push("a.borrower_uid = ?");
    params.push(uid);
  } else if (role === "lender") {
    where.push("lender_uid = ?");
    params.push(uid);
  } else {
    return json24(400, {
      ok: false,
      error: "role must be borrower or lender"
    });
  }
  if (where.length) {
    query += " WHERE " + where.join(" AND ");
  }
  query += " ORDER BY o.created_at DESC";
  try {
    const rows = await env.DB.prepare(query).bind(...params).all();
    const offers = (rows.results || []).map((r) => ({
      offerId: r.id,
      applicationId: r.application_id,
      lenderUid: r.lender_uid,
      borrowerUid: r.borrower_uid || null,
      interestRate: r.interest_rate,
      monthlyPayment: r.monthly_payment,
      status: r.status,
      createdAt: r.created_at
    }));
    return json24(200, { ok: true, offers });
  } catch (err) {
    return json24(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet17, "onRequestGet");

// api/ostosos/download.js
async function generateRandomBytes(size) {
  const arr = new Uint8Array(size);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(generateRandomBytes, "generateRandomBytes");
async function createHash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(createHash, "createHash");
async function onRequestGet18(context) {
  const crypto2 = globalThis.crypto;
  const { request, env } = context;
  const url = new URL(request.url);
  const uniqueId = await generateRandomBytes(16);
  const hash = await createHash(uniqueId);
  const hashTag = `#${hash.substring(0, 16)}`;
  const portalHost = new URL(request.url).origin;
  const distributionInfo = {
    uniqueId,
    hashTag,
    downloadUrl: `${portalHost}/api/settings/create-distribution`,
    instructions: {
      step1: "Generiere deinen eigenen User Key (32 Bytes Hex)",
      step2: "POST zu /api/settings/create-distribution mit userKey",
      step3: "Erhalte deine einzigartige, verifizierte Version",
      step4: "Alle Daten bleiben dein Eigentum"
    },
    features: {
      anonymized: true,
      verified: true,
      unique: true,
      free: true,
      noUserData: true,
      userOwnership: true,
      ownershipProof: true
    },
    branding: {
      ostosos: "OSTOSOS",
      ttt: "TTT T,.&T,,.&T,,,.",
      global: "INTERNATIONAL TTT GLOBAL FREE INTERNET",
      freedom: "WAS DU WILLST | WO DU WILLST | WIE DU WILLST",
      os: "OS VON OSTOSOS DREI TTT VON T,.",
      availability: "SOLANGE DER VORRAT REICHT",
      brandedServices: "(C)(R)T,.&T,,.*&T,,,.BRANDED SERVICES DER T,.AG&CO&AG.T,,.(C)(R).T,,,."
    },
    producer: {
      name: "TEL1.NL",
      whatsapp: "0031613803782",
      gofundme: "https://www.gofundme.com/f/magnitudo"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    timezone: "UTC"
  };
  return new Response(JSON.stringify(distributionInfo, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet18, "onRequestGet");

// api/presence/debug.js
var presenceStore = globalThis.__presenceStore || (globalThis.__presenceStore = /* @__PURE__ */ new Map());
async function onRequestGet19() {
  const items = Array.from(presenceStore.values());
  return new Response(JSON.stringify({ count: items.length, items }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(onRequestGet19, "onRequestGet");

// api/presence/heartbeat.js
var presenceStore2 = globalThis.__presenceStore || (globalThis.__presenceStore = /* @__PURE__ */ new Map());
function json25(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json25, "json");
async function onRequestPost17(context) {
  const { request } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json25(400, { error: "invalid JSON body" });
  }
  const { thinker_id, pair_code, status } = body || {};
  if (!thinker_id) {
    return json25(400, { error: "thinker_id fehlt" });
  }
  const now = Date.now();
  const existing = presenceStore2.get(thinker_id) || {};
  presenceStore2.set(thinker_id, {
    thinker_id,
    token: existing.token,
    pair_code: pair_code || existing.pair_code || null,
    status: status || existing.status || "online",
    last_seen: now,
    room_id: existing.room_id || null
  });
  return json25(200, { ok: true, last_seen: now });
}
__name(onRequestPost17, "onRequestPost");

// api/presence/match.js
var presenceStore3 = globalThis.__presenceStore || (globalThis.__presenceStore = /* @__PURE__ */ new Map());
function json26(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json26, "json");
function makeRoomId(pair_code) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `room-${pair_code}-${rand}`;
}
__name(makeRoomId, "makeRoomId");
async function onRequestPost18(context) {
  const { request } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json26(400, { error: "invalid JSON body" });
  }
  const { thinker_id, pair_code } = body || {};
  if (!thinker_id) {
    return json26(400, { error: "thinker_id fehlt" });
  }
  if (!pair_code) {
    return json26(200, { room_id: null });
  }
  const now = Date.now();
  const ONLINE_WINDOW_MS = 60 * 1e3;
  const candidates = [];
  for (const entry of presenceStore3.values()) {
    if (entry.pair_code === pair_code && entry.status === "online" && typeof entry.last_seen === "number" && now - entry.last_seen <= ONLINE_WINDOW_MS) {
      candidates.push(entry);
    }
  }
  if (candidates.length < 2) {
    return json26(200, { room_id: null });
  }
  let room_id = null;
  for (const entry of candidates) {
    if (entry.room_id) {
      room_id = entry.room_id;
      break;
    }
  }
  if (!room_id) {
    room_id = makeRoomId(pair_code);
  }
  for (const entry of candidates) {
    presenceStore3.set(entry.thinker_id, {
      ...entry,
      room_id
    });
  }
  return json26(200, { room_id });
}
__name(onRequestPost18, "onRequestPost");

// api/presence/verify.js
var presenceStore4 = globalThis.__presenceStore || (globalThis.__presenceStore = /* @__PURE__ */ new Map());
function json27(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json27, "json");
async function hmacSha256Hex(key, data) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(String(key)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(String(data)));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmacSha256Hex, "hmacSha256Hex");
async function onRequestPost19(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json27(400, { error: "invalid JSON body" });
  }
  const token = body.token || body.mot || body.thinker_token;
  if (!token) {
    return json27(400, { error: "token fehlt" });
  }
  if (body.ts && body.sig) {
    const ts = Number(body.ts);
    const skew = Math.abs(Date.now() - ts);
    if (!Number.isFinite(skew) || skew > 5 * 60 * 1e3) {
      return json27(401, { error: "Token abgelaufen" });
    }
    const expected = await hmacSha256Hex(token, `${token}.${ts}`);
    if (expected !== String(body.sig)) {
      return json27(401, { error: "Signatur ung\xFCltig" });
    }
  }
  const secretOpt = env?.TOKEN_SECRET_OPTIONAL || "";
  const hashKey = env?.PRESENCE_HASH_KEY || "mot-presence";
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(hashKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(String(token) + secretOpt));
  const hash = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const thinker_id = `thinker-${hash.slice(0, 12)}`;
  let pair_code = null;
  for (const entry of presenceStore4.values()) {
    if (entry.token === token && entry.pair_code) {
      pair_code = entry.pair_code;
      break;
    }
  }
  const existing = presenceStore4.get(thinker_id) || {};
  presenceStore4.set(thinker_id, {
    thinker_id,
    token,
    pair_code: pair_code || existing.pair_code || null,
    status: existing.status || "online",
    last_seen: existing.last_seen || Date.now(),
    room_id: existing.room_id || null
  });
  return json27(200, { thinker_id, pair_code });
}
__name(onRequestPost19, "onRequestPost");

// api/real/entities.js
function json28(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json28, "json");
function makeId11(prefix = "ent") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId11, "makeId");
async function checkApiKey22(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json28(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey22, "checkApiKey");
async function checkRateLimit8(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit8, "checkRateLimit");
async function insertEvent8(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent8, "insertEvent");
var VALID_KINDS = ["company", "project", "cooperative"];
async function onRequestPost20(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey22(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit8(env, `real.entities|${ip}`);
  if (!allowed) {
    return json28(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json28(400, { ok: false, error: "invalid JSON body" });
  }
  const { kind, name, description } = body;
  if (!kind || !name) {
    return json28(400, {
      ok: false,
      error: "missing_required_fields",
      message: "kind and name are required"
    });
  }
  if (!VALID_KINDS.includes(kind)) {
    return json28(400, {
      ok: false,
      error: "invalid_kind",
      message: `kind must be one of: ${VALID_KINDS.join(", ")}`
    });
  }
  const entityId = body.id || makeId11("ent");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO entities (id, kind, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(entityId, kind, name, description || null, now, now).run();
    const entity = {
      id: entityId,
      kind,
      name,
      description: description || null,
      created_at: now,
      updated_at: now
    };
    await insertEvent8(env, "entity.created", null, "entity", entityId, { kind, name });
    return json28(200, { ok: true, data: { entity } });
  } catch (err) {
    return json28(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost20, "onRequestPost");
async function onRequestGet20(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey22(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  let query = "SELECT * FROM entities";
  const params = [];
  if (kind) {
    query += " WHERE kind = ?";
    params.push(kind);
  }
  query += " ORDER BY created_at DESC LIMIT 1000";
  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    const entities = (result.results || []).map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      description: r.description,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));
    return json28(200, { ok: true, data: { entities } });
  } catch (err) {
    return json28(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet20, "onRequestGet");

// api/real/transactions.js
function json29(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json29, "json");
function makeId12(prefix = "rtx") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId12, "makeId");
async function checkApiKey23(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json29(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey23, "checkApiKey");
async function checkRateLimit9(env, key, limit = 100, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit9, "checkRateLimit");
async function insertEvent9(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent9, "insertEvent");
var VALID_CATEGORIES = ["income", "expense", "damage", "benefit", "risk"];
var VALID_DIRECTIONS = ["positive", "negative"];
async function onRequestPost21(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey23(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit9(env, `real.transactions|${ip}`);
  if (!allowed) {
    return json29(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json29(400, { ok: false, error: "invalid JSON body" });
  }
  const {
    entity_id,
    category,
    label,
    amount,
    unit,
    direction,
    weight,
    occurred_at,
    meta = {}
  } = body;
  if (!entity_id || !category || typeof amount !== "number" || !unit || !direction || typeof weight !== "number" || !occurred_at) {
    return json29(400, {
      ok: false,
      error: "missing_required_fields",
      message: "entity_id, category, amount, unit, direction, weight, and occurred_at are required"
    });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return json29(400, {
      ok: false,
      error: "invalid_category",
      message: `category must be one of: ${VALID_CATEGORIES.join(", ")}`
    });
  }
  if (!VALID_DIRECTIONS.includes(direction)) {
    return json29(400, {
      ok: false,
      error: "invalid_direction",
      message: `direction must be one of: ${VALID_DIRECTIONS.join(", ")}`
    });
  }
  const entity = await env.DB.prepare("SELECT id FROM entities WHERE id = ?").bind(entity_id).first();
  if (!entity) {
    return json29(404, {
      ok: false,
      error: "entity_not_found",
      message: `Entity with id ${entity_id} does not exist`
    });
  }
  const transactionId = makeId12("rtx");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO real_transactions 
       (id, entity_id, category, label, amount, unit, direction, weight, occurred_at, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      transactionId,
      entity_id,
      category,
      label || null,
      amount,
      unit,
      direction,
      weight,
      occurred_at,
      JSON.stringify(meta),
      createdAt
    ).run();
    const transaction = {
      id: transactionId,
      entity_id,
      category,
      label: label || null,
      amount,
      unit,
      direction,
      weight,
      occurred_at,
      meta: meta || {},
      created_at: createdAt
    };
    await insertEvent9(env, "real.transaction.created", null, "real_transaction", transactionId, {
      entity_id,
      category,
      amount,
      unit
    });
    return json29(200, { ok: true, data: { transaction } });
  } catch (err) {
    return json29(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost21, "onRequestPost");
async function onRequestGet21(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey23(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const entityId = url.searchParams.get("entity_id");
  const category = url.searchParams.get("category");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!entityId) {
    return json29(400, {
      ok: false,
      error: "missing_entity_id",
      message: "entity_id query parameter is required"
    });
  }
  let query = "SELECT * FROM real_transactions WHERE entity_id = ?";
  const params = [entityId];
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (from) {
    query += " AND occurred_at >= ?";
    params.push(from);
  }
  if (to) {
    query += " AND occurred_at <= ?";
    params.push(to);
  }
  query += " ORDER BY occurred_at DESC LIMIT 1000";
  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    const transactions = (result.results || []).map((r) => ({
      id: r.id,
      entity_id: r.entity_id,
      category: r.category,
      label: r.label,
      amount: r.amount,
      unit: r.unit,
      direction: r.direction,
      weight: r.weight,
      occurred_at: r.occurred_at,
      meta: r.meta ? JSON.parse(r.meta) : {},
      created_at: r.created_at
    }));
    return json29(200, { ok: true, data: { transactions } });
  } catch (err) {
    return json29(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet21, "onRequestGet");

// api/robot/create.js
async function onRequestPost22(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { userId, verified, config } = data;
    if (!verified) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Nur verifizierte User k\xF6nnen Robots erstellen"
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const robot = {
      id: `robot-${Date.now()}`,
      userId,
      verified: true,
      quality: "XXXXXXXL",
      capabilities: [
        "multimedia-production",
        "universe-expansion",
        "dimensional-analysis",
        "source-code-extension",
        "alphabet-offices"
      ],
      multimedia: {
        enabled: true,
        maxLevel: 999,
        formats: ["video", "audio", "image", "3d", "vr", "ar", "holographic"]
      },
      expansion: {
        enabled: true,
        universeExpansion: true,
        dimensional: true
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(JSON.stringify({
      ok: true,
      robot,
      message: "Robot erfolgreich erstellt - XXXXXXXXXXXL Qualit\xE4t"
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || "Server-Fehler"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost22, "onRequestPost");

// api/robot/execute.js
async function onRequestPost23(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { robotId, taskType, input } = data;
    const task = {
      id: `task-${Date.now()}`,
      robotId,
      taskType,
      input,
      status: "completed",
      output: {
        quality: "XXXXXXXL",
        multimedia: taskType === "multimedia-production" ? {
          level: 999,
          max: true,
          formats: input.formats || ["video", "audio", "image", "3d", "vr", "ar"]
        } : void 0,
        expansion: taskType === "universe-expansion" ? {
          current: input.current || 1,
          expected: input.expected || 1e3,
          universe: Infinity,
          exceeded: true
        } : void 0,
        dimensional: taskType === "dimensional-analysis" ? {
          time: (input.text?.length || 0) * 1e-3,
          space: (input.text?.length || 0) * 1e-6,
          energy: (input.text?.length || 0) * 1e-4,
          cost: (input.text?.length || 0) * 0.01
        } : void 0
      },
      cost: {
        production: 0,
        financial: 0,
        real: 0
      },
      dimensional: {
        time: 0,
        space: 0,
        energy: 0,
        cost: 0
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(JSON.stringify({
      ok: true,
      task,
      message: "Task erfolgreich ausgef\xFChrt"
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || "Server-Fehler"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost23, "onRequestPost");

// api/settings/create-distribution.js
async function onRequestPost24(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const userKey = body.userKey;
    if (!userKey) {
      return new Response(JSON.stringify({
        error: "userKey is required. User must generate and provide their own key."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
    const portalHost = new URL(request.url).origin;
    const encoder = new TextEncoder();
    const data = encoder.encode(userKey + portalHost + Date.now().toString());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const identifier = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
    const distribution = {
      identifier,
      userKey: userKey.substring(0, 8) + "...",
      // Nur Teil anzeigen
      portalHost,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0",
      status: "active"
    };
    return new Response(JSON.stringify({
      success: true,
      distribution,
      important: {
        message: "BEWAHREN SIE IHREN USER KEY SICHER AUF!",
        warning: "Bei Verlust des Keys ist der User selbst verantwortlich. Der Key kann notariell best\xE4tigt werden.",
        capabilities: [
          "Eigene Netzwerke aufbauen",
          "Portale erstellen",
          "Kopien versionieren",
          "Settings-Ordner aufbauen",
          "1:1 produktionsf\xE4hig",
          "Vollst\xE4ndige Funktionalit\xE4t (ohne Source-Code-Zugriff)"
        ],
        restrictions: {
          sourceCodeAccess: false,
          functionality: "full",
          modifications: true,
          extensions: true,
          design: true
        },
        gofundme: "https://www.gofundme.com/f/magnitudo",
        producer: "TEL1.NL",
        whatsapp: "0031613803782",
        branding: ".{T,.[ OS.] OS-TOS - OSTOS\u221E8\u221E+++a\u221E:=n\u2192\u221Elim\u200Ban\u221E as superscript \u2248 \u207A\u221E(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}."
      }
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }
}
__name(onRequestPost24, "onRequestPost");

// api/settings/graph.js
async function onRequestGet22(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") || void 0;
  const environment = url.searchParams.get("environment") || void 0;
  return new Response(JSON.stringify({
    ok: true,
    message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
    graph: {
      nodes: [],
      edges: [],
      manifest: {
        settingsManifestVersion: "0.9.0",
        indexes: {
          types: [],
          scopes: []
        }
      }
    },
    filters: { projectId, environment }
  }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet22, "onRequestGet");

// api/settings/model-for-task.js
async function onRequestGet23(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const task = url.searchParams.get("task");
  if (!task) {
    return new Response(JSON.stringify({
      error: "task parameter is required"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
  const constraints = {
    maxLatency: url.searchParams.get("maxLatency") ? parseFloat(url.searchParams.get("maxLatency")) : void 0,
    costCeiling: url.searchParams.get("costCeiling") ? parseFloat(url.searchParams.get("costCeiling")) : void 0,
    energyCeiling: url.searchParams.get("energyCeiling") ? parseFloat(url.searchParams.get("energyCeiling")) : void 0
  };
  return new Response(JSON.stringify({
    ok: true,
    message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
    model: null,
    task,
    constraints
  }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet23, "onRequestGet");

// api/settings/propose.js
async function onRequestPost25(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    if (!body.nodeId || !body.changes || !body.rationale || !body.proposedBy) {
      return new Response(JSON.stringify({
        error: "nodeId, changes, rationale, and proposedBy are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
    return new Response(JSON.stringify({
      ok: true,
      message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
      proposal: {
        nodeId: body.nodeId,
        changes: body.changes,
        rationale: body.rationale,
        proposedBy: body.proposedBy,
        llmModel: body.llmModel || "gpt-4",
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }
}
__name(onRequestPost25, "onRequestPost");

// api/settings/query.js
async function onRequestGet24(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = {
    projectId: url.searchParams.get("projectId") || void 0,
    environment: url.searchParams.get("environment") || void 0,
    type: url.searchParams.get("type") || void 0,
    scope: url.searchParams.get("scope") || void 0,
    id: url.searchParams.get("id") || void 0
  };
  return new Response(JSON.stringify({
    ok: true,
    message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
    data: {
      nodes: [],
      filters: params
    }
  }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet24, "onRequestGet");

// api/settings/simulate-change.js
async function onRequestPost26(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    if (!body.nodeId || !body.changes) {
      return new Response(JSON.stringify({
        error: "nodeId and changes are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
    return new Response(JSON.stringify({
      ok: true,
      message: "Settings-OS ist f\xFCr lokale Entwicklung verf\xFCgbar. Diese Function ist in Workers vereinfacht.",
      simulation: {
        nodeId: body.nodeId,
        changes: body.changes,
        validation: {
          valid: true,
          errors: [],
          warnings: []
        },
        impact: {
          affectedNodes: [],
          estimatedCost: 0,
          estimatedLatency: 0
        }
      }
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }
}
__name(onRequestPost26, "onRequestPost");

// api/settings/version.js
async function onRequestGet25(context) {
  const { request, env } = context;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const timezone = "UTC";
  const version = `1.0.${Date.now()}`;
  return new Response(JSON.stringify({
    version,
    timestamp,
    timezone,
    producer: "TEL1.NL",
    whatsapp: "0031613803782",
    branding: ".{T,.[ OS.] OS-TOS - OSTOS\u221E8\u221E+++a\u221E:=n\u2192\u221Elim\u200Ban\u221E as superscript \u2248 \u207A\u221E(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.",
    portalHost: new URL(request.url).origin
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet25, "onRequestGet");

// api/slots/available.js
function json30(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json30, "json");
function getClientIp5(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp5, "getClientIp");
async function checkApiKey24(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json30(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey24, "checkApiKey");
async function checkRateLimit10(env, key, limit = 120, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit10, "checkRateLimit");
function isoToDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
__name(isoToDate, "isoToDate");
async function onRequestGet26(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey24(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp5(request);
  const allowed = await checkRateLimit10(env, `slots.available|${ip}`);
  if (!allowed) {
    return json30(429, { ok: false, error: "rate limit exceeded" });
  }
  const url = new URL(request.url);
  const voucherId = url.searchParams.get("voucherId");
  if (!voucherId) {
    return json30(400, { ok: false, error: "voucherId is required" });
  }
  try {
    const voucherRow = await env.DB.prepare(
      "SELECT id, duration_minutes, valid_from, valid_until FROM vouchers WHERE id = ?"
    ).bind(voucherId).first();
    if (!voucherRow) {
      return json30(404, { ok: false, error: "voucher not found" });
    }
    const from = isoToDate(voucherRow.valid_from);
    const until = isoToDate(voucherRow.valid_until);
    if (!from || !until || from >= until) {
      return json30(200, { ok: true, items: [] });
    }
    const durationMs = (Number(voucherRow.duration_minutes) || 60) * 60 * 1e3;
    const bookedRows = await env.DB.prepare(
      "SELECT slot_start, slot_end FROM voucher_bookings WHERE voucher_id = ? AND status = ?"
    ).bind(voucherId, "booked").all();
    const booked = new Set(
      (bookedRows.results || []).map((b) => b.slot_start)
    );
    const items = [];
    let cursor = new Date(from.getTime());
    while (cursor.getTime() + durationMs <= until.getTime()) {
      const startIso = cursor.toISOString();
      const endIso = new Date(cursor.getTime() + durationMs).toISOString();
      if (!booked.has(startIso)) {
        items.push({
          slotId: `slot-${startIso}`,
          voucherId,
          start: startIso,
          end: endIso
        });
      }
      cursor = new Date(cursor.getTime() + 60 * 60 * 1e3);
    }
    return json30(200, { ok: true, items });
  } catch (err) {
    return json30(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet26, "onRequestGet");

// api/sponsors/list.js
async function onRequestGet27(context) {
  const { env } = context;
  try {
    let sponsors = [];
    if (env.DB) {
      try {
        const result = await env.DB.prepare(
          `SELECT id, name, logo_data, registered, type, verified, timestamp
           FROM sponsors
           ORDER BY registered DESC
           LIMIT 100`
        ).all();
        sponsors = result.results.map((row) => ({
          id: row.id,
          name: row.name,
          logoData: row.logo_data,
          registered: row.registered,
          type: row.type,
          verified: row.verified === 1,
          timestamp: row.timestamp
        }));
      } catch (e) {
        console.log("D1 query optional:", e);
      }
    }
    return new Response(JSON.stringify({
      ok: true,
      sponsors,
      count: sponsors.length,
      message: "Sponsoren & Investoren Liste"
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || "Server-Fehler"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet27, "onRequestGet");

// api/sponsors/register.js
async function onRequestPost27(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { name, logoData, registered } = data;
    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ ok: false, error: "Unternehmensname erforderlich" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sponsor = {
      id: data.id || Date.now(),
      name: name.trim(),
      logoData,
      registered: registered || (/* @__PURE__ */ new Date()).toISOString(),
      type: "sponsor",
      // oder 'investor' wenn Finanzkapital
      verified: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      timezone: "UTC"
    };
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO sponsors (id, name, logo_data, registered, type, verified, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          sponsor.id,
          sponsor.name,
          sponsor.logoData || null,
          sponsor.registered,
          sponsor.type,
          sponsor.verified ? 1 : 0,
          sponsor.timestamp
        ).run();
      } catch (e) {
        console.log("D1 insert optional:", e);
      }
    }
    return new Response(JSON.stringify({
      ok: true,
      sponsor,
      message: "Sponsor erfolgreich registriert",
      benefits: [
        "Unternehmen pr\xE4sentieren",
        "Erwirtschaftet Kunden",
        "Umsatz generieren",
        "Arbeit schaffen",
        "Lohn bezahlen",
        "Kosten decken",
        "Gewinn zum Teilen"
      ],
      note: "Finanzielle Mittel gehen auf diese Weise nicht aus. Ausgew\xE4hlte Investoren k\xF6nnen auch mit Finanzkapital Einsatz zeigen.",
      gofundme: "https://www.gofundme.com/f/magnitudo",
      producer: "TEL1.NL",
      whatsapp: "0031613803782"
    }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || "Server-Fehler"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost27, "onRequestPost");

// api/telbank/transfers.js
function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(jsonResponse, "jsonResponse");
function makeId13(prefix = "tx") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId13, "makeId");
function getClientIp6(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp6, "getClientIp");
async function checkApiKey25(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return jsonResponse(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey25, "checkApiKey");
async function checkRateLimit11(env, key, limit = 120, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit11, "checkRateLimit");
async function insertEvent10(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent10, "insertEvent");
async function onRequestGet28(context) {
  const { env, request } = context;
  const apiKeyError = await checkApiKey25(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp6(request);
  const allowed = await checkRateLimit11(env, `telbank.get|${ip}`);
  if (!allowed) {
    return jsonResponse(429, { ok: false, error: "rate limit exceeded" });
  }
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get("walletAddress");
  const direction = url.searchParams.get("direction");
  let query = "SELECT id, direction, label, wallet_address as walletAddress, network, crypto_amount as cryptoAmount, crypto_symbol as cryptoSymbol, fiat_amount as fiatAmount, fiat_currency as fiatCurrency, external_account as externalAccount, meta, status, created_at as createdAt, updated_at as updatedAt FROM transfers";
  const params = [];
  const where = [];
  if (walletAddress) {
    where.push("wallet_address = ?");
    params.push(walletAddress);
  }
  if (direction) {
    where.push("direction = ?");
    params.push(direction);
  }
  if (where.length) {
    query += " WHERE " + where.join(" AND ");
  }
  query += " ORDER BY created_at DESC";
  try {
    const stmt = env.DB.prepare(query);
    const rows = await stmt.bind(...params).all();
    const items = (rows.results || []).map((r) => ({
      ...r,
      meta: r.meta ? JSON.parse(r.meta) : {}
    }));
    return jsonResponse(200, { ok: true, items });
  } catch (err) {
    return jsonResponse(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet28, "onRequestGet");
async function onRequestPost28(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey25(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp6(request);
  const allowed = await checkRateLimit11(env, `telbank.post|${ip}`);
  if (!allowed) {
    return jsonResponse(429, { ok: false, error: "rate limit exceeded" });
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body" });
  }
  const {
    direction,
    label,
    walletAddress,
    network,
    cryptoAmount,
    cryptoSymbol,
    fiatAmount,
    fiatCurrency,
    externalAccount,
    meta
  } = payload || {};
  if (!direction || direction !== "in" && direction !== "out") {
    return jsonResponse(400, { ok: false, error: "Invalid direction" });
  }
  if (typeof cryptoAmount !== "number" || !cryptoSymbol || typeof fiatAmount !== "number" || !fiatCurrency) {
    return jsonResponse(400, {
      ok: false,
      error: "cryptoAmount, cryptoSymbol, fiatAmount and fiatCurrency are required as numbers/strings"
    });
  }
  const id = makeId13(direction === "in" ? "in" : "out");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const entry = {
    id,
    direction,
    label: label || (direction === "in" ? "Fiat\u2192Crypto inflow" : "Crypto\u2192Fiat outflow"),
    walletAddress: walletAddress || null,
    network: network || null,
    cryptoAmount,
    cryptoSymbol,
    fiatAmount,
    fiatCurrency,
    externalAccount: externalAccount || null,
    meta: meta || {},
    status: "logged",
    createdAt: now,
    updatedAt: now
  };
  try {
    const stmt = env.DB.prepare(
      `INSERT INTO transfers
       (id, direction, label, wallet_address, network, crypto_amount, crypto_symbol,
        fiat_amount, fiat_currency, external_account, meta, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    await stmt.bind(
      entry.id,
      entry.direction,
      entry.label,
      entry.walletAddress,
      entry.network,
      entry.cryptoAmount,
      entry.cryptoSymbol,
      entry.fiatAmount,
      entry.fiatCurrency,
      entry.externalAccount,
      JSON.stringify(entry.meta),
      entry.status,
      entry.createdAt,
      entry.updatedAt
    ).run();
    await insertEvent10(env, "transfer.logged", null, "transfer", id, {
      walletAddress,
      direction
    });
    return jsonResponse(200, { ok: true, transfer: entry });
  } catch (err) {
    return jsonResponse(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost28, "onRequestPost");

// api/voucher/book.js
function json31(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json31, "json");
function makeId14(prefix = "b") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId14, "makeId");
function getClientIp7(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp7, "getClientIp");
async function checkApiKey26(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json31(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey26, "checkApiKey");
async function checkRateLimit12(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit12, "checkRateLimit");
async function insertEvent11(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent11, "insertEvent");
async function onRequestPost29(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey26(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp7(request);
  const allowed = await checkRateLimit12(env, `voucher.book|${ip}`);
  if (!allowed) {
    return json31(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json31(400, { ok: false, error: "invalid JSON body" });
  }
  const voucherId = body.voucherId;
  const slotId = body.slotId;
  const holderUid = body.holderUid;
  if (!voucherId || !slotId || !holderUid) {
    return json31(400, {
      ok: false,
      error: "voucherId, slotId and holderUid are required"
    });
  }
  try {
    const voucherRow = await env.DB.prepare(
      "SELECT id, issuer_uid, holder_uid, service_type, title, description, duration_minutes, valid_from, valid_until, price_amount, price_currency, status, transferable, terms, created_at FROM vouchers WHERE id = ?"
    ).bind(voucherId).first();
    if (!voucherRow) {
      return json31(404, { ok: false, error: "voucher not found" });
    }
    if (["consumed", "cancelled", "expired"].includes(
      String(voucherRow.status || "").toLowerCase()
    )) {
      return json31(400, {
        ok: false,
        error: `voucher has status ${voucherRow.status} and cannot be booked`
      });
    }
    const startIso = slotId.startsWith("slot-") ? slotId.slice(5) : null;
    const start = startIso ? new Date(startIso) : null;
    if (!start || Number.isNaN(start.getTime())) {
      return json31(400, { ok: false, error: "invalid slotId format" });
    }
    const durationMs = (Number(voucherRow.duration_minutes) || 60) * 60 * 1e3;
    const end = new Date(start.getTime() + durationMs);
    const endIso = end.toISOString();
    const existingBooking = await env.DB.prepare(
      "SELECT id FROM voucher_bookings WHERE voucher_id = ? AND slot_start = ? AND status = ?"
    ).bind(voucherId, startIso, "booked").first();
    if (existingBooking) {
      return json31(400, { ok: false, error: "slot already booked" });
    }
    const bookingId = makeId14("b");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(
      `INSERT INTO voucher_bookings
       (id, voucher_id, issuer_uid, holder_uid, slot_id, slot_start, slot_end, status, cancel_reason, created_at, cancelled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      bookingId,
      voucherId,
      voucherRow.issuer_uid,
      holderUid,
      slotId,
      startIso,
      endIso,
      "booked",
      null,
      createdAt,
      null
    ).run();
    await env.DB.prepare(
      "UPDATE vouchers SET status = ?, holder_uid = ? WHERE id = ?"
    ).bind("booked", holderUid, voucherId).run();
    const voucher = {
      voucherId,
      issuerUid: voucherRow.issuer_uid,
      holderUid,
      serviceType: voucherRow.service_type,
      title: voucherRow.title,
      description: voucherRow.description,
      durationMinutes: voucherRow.duration_minutes,
      validFrom: voucherRow.valid_from,
      validUntil: voucherRow.valid_until,
      price: voucherRow.price_amount != null ? {
        amount: voucherRow.price_amount,
        currency: voucherRow.price_currency || "EUR"
      } : null,
      status: "booked",
      transferable: !!voucherRow.transferable,
      terms: voucherRow.terms ? JSON.parse(voucherRow.terms) : {},
      createdAt: voucherRow.created_at
    };
    const booking = {
      bookingId,
      voucherId,
      issuerUid: voucherRow.issuer_uid,
      holderUid,
      slotId,
      slotStart: startIso,
      slotEnd: endIso,
      status: "booked",
      createdAt
    };
    await insertEvent11(env, "voucher.book", holderUid, "voucher_booking", bookingId, {
      voucherId,
      slotStart: startIso
    });
    return json31(200, { ok: true, booking, voucher });
  } catch (err) {
    return json31(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost29, "onRequestPost");

// api/voucher/bookings.js
function json32(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json32, "json");
function getClientIp8(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp8, "getClientIp");
async function checkApiKey27(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json32(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey27, "checkApiKey");
async function checkRateLimit13(env, key, limit = 120, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit13, "checkRateLimit");
async function onRequestGet29(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey27(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp8(request);
  const allowed = await checkRateLimit13(env, `voucher.bookings|get|${ip}`);
  if (!allowed) {
    return json32(429, { ok: false, error: "rate limit exceeded" });
  }
  const url = new URL(request.url);
  const holderUid = url.searchParams.get("holderUid");
  const issuerUid = url.searchParams.get("issuerUid");
  const voucherId = url.searchParams.get("voucherId");
  let query = "SELECT id, voucher_id, issuer_uid, holder_uid, slot_id, slot_start, slot_end, status, cancel_reason, created_at, cancelled_at FROM voucher_bookings";
  const where = [];
  const params = [];
  if (holderUid) {
    where.push("holder_uid = ?");
    params.push(holderUid);
  }
  if (issuerUid) {
    where.push("issuer_uid = ?");
    params.push(issuerUid);
  }
  if (voucherId) {
    where.push("voucher_id = ?");
    params.push(voucherId);
  }
  if (where.length) {
    query += " WHERE " + where.join(" AND ");
  }
  query += " ORDER BY created_at DESC";
  try {
    const rows = await env.DB.prepare(query).bind(...params).all();
    const items = (rows.results || []).map((r) => ({
      bookingId: r.id,
      voucherId: r.voucher_id,
      issuerUid: r.issuer_uid,
      holderUid: r.holder_uid,
      slotId: r.slot_id,
      slotStart: r.slot_start,
      slotEnd: r.slot_end,
      status: r.status,
      cancelReason: r.cancel_reason,
      createdAt: r.created_at,
      cancelledAt: r.cancelled_at
    }));
    return json32(200, { ok: true, items });
  } catch (err) {
    return json32(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet29, "onRequestGet");

// api/voucher/cancel.js
function json33(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json33, "json");
function getClientIp9(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp9, "getClientIp");
async function checkApiKey28(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json33(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey28, "checkApiKey");
async function checkRateLimit14(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit14, "checkRateLimit");
async function insertEvent12(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent12, "insertEvent");
async function onRequestPost30(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey28(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp9(request);
  const allowed = await checkRateLimit14(env, `voucher.cancel|${ip}`);
  if (!allowed) {
    return json33(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json33(400, { ok: false, error: "invalid JSON body" });
  }
  const voucherId = body.voucherId;
  const bookingId = body.bookingId;
  const reason = body.reason || null;
  if (!voucherId && !bookingId) {
    return json33(400, {
      ok: false,
      error: "voucherId or bookingId is required"
    });
  }
  try {
    let bookingRow;
    if (bookingId) {
      bookingRow = await env.DB.prepare(
        "SELECT * FROM voucher_bookings WHERE id = ?"
      ).bind(bookingId).first();
    } else if (voucherId) {
      bookingRow = await env.DB.prepare(
        "SELECT * FROM voucher_bookings WHERE voucher_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1"
      ).bind(voucherId, "booked").first();
    }
    if (!bookingRow) {
      return json33(404, { ok: false, error: "booking not found" });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(
      "UPDATE voucher_bookings SET status = ?, cancel_reason = ?, cancelled_at = ? WHERE id = ?"
    ).bind("cancelled", reason, nowIso, bookingRow.id).run();
    await env.DB.prepare(
      "UPDATE vouchers SET status = ?, holder_uid = NULL WHERE id = ?"
    ).bind("issued", bookingRow.voucher_id).run();
    const voucherRow = await env.DB.prepare(
      "SELECT id, issuer_uid, holder_uid, service_type, title, description, duration_minutes, valid_from, valid_until, price_amount, price_currency, status, transferable, terms, created_at FROM vouchers WHERE id = ?"
    ).bind(bookingRow.voucher_id).first();
    const voucher = voucherRow ? {
      voucherId: voucherRow.id,
      issuerUid: voucherRow.issuer_uid,
      holderUid: voucherRow.holder_uid,
      serviceType: voucherRow.service_type,
      title: voucherRow.title,
      description: voucherRow.description,
      durationMinutes: voucherRow.duration_minutes,
      validFrom: voucherRow.valid_from,
      validUntil: voucherRow.valid_until,
      price: voucherRow.price_amount != null ? {
        amount: voucherRow.price_amount,
        currency: voucherRow.price_currency || "EUR"
      } : null,
      status: voucherRow.status,
      transferable: !!voucherRow.transferable,
      terms: voucherRow.terms ? JSON.parse(voucherRow.terms) : {},
      createdAt: voucherRow.created_at
    } : null;
    const booking = {
      bookingId: bookingRow.id,
      voucherId: bookingRow.voucher_id,
      issuerUid: bookingRow.issuer_uid,
      holderUid: bookingRow.holder_uid,
      slotId: bookingRow.slot_id,
      slotStart: bookingRow.slot_start,
      slotEnd: bookingRow.slot_end,
      status: "cancelled",
      cancelReason: reason,
      createdAt: bookingRow.created_at,
      cancelledAt: nowIso
    };
    await insertEvent12(
      env,
      "voucher.cancel",
      bookingRow.holder_uid,
      "voucher_booking",
      bookingRow.id,
      { voucherId: bookingRow.voucher_id, reason }
    );
    return json33(200, { ok: true, booking, voucher });
  } catch (err) {
    return json33(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost30, "onRequestPost");

// api/voucher/issue.js
function json34(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json34, "json");
function makeId15(prefix = "v") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId15, "makeId");
function getClientIp10(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp10, "getClientIp");
async function checkApiKey29(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json34(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey29, "checkApiKey");
async function checkRateLimit15(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit15, "checkRateLimit");
async function insertEvent13(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent13, "insertEvent");
async function onRequestPost31(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey29(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp10(request);
  const allowed = await checkRateLimit15(env, `voucher.issue|${ip}`);
  if (!allowed) {
    return json34(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json34(400, { ok: false, error: "invalid JSON body" });
  }
  const issuerUid = body.issuerUid;
  if (!issuerUid) {
    return json34(400, { ok: false, error: "issuerUid is required" });
  }
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const id = body.voucherId || makeId15("v");
  const serviceType = body.serviceType || "generic.service";
  const title = body.title || "Unbenannter Service";
  const description = body.description || "";
  const durationMinutes = Number(body.durationMinutes || 60);
  const validFrom = body.validFrom || nowIso;
  const validUntil = body.validUntil || nowIso;
  let priceAmount = null;
  let priceCurrency = null;
  if (body.price && typeof body.price === "object") {
    if (typeof body.price.amount === "number") {
      priceAmount = body.price.amount;
    }
    if (typeof body.price.currency === "string") {
      priceCurrency = body.price.currency;
    }
  }
  const transferable = !!body.transferable;
  const status = body.status || "issued";
  const terms = body.terms || {};
  const holderUid = body.holderUid || null;
  try {
    await env.DB.prepare(
      `INSERT INTO vouchers
       (id, issuer_uid, holder_uid, service_type, title, description, duration_minutes,
        valid_from, valid_until, price_amount, price_currency, status, transferable, terms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      issuerUid,
      holderUid,
      serviceType,
      title,
      description,
      durationMinutes,
      validFrom,
      validUntil,
      priceAmount,
      priceCurrency,
      status,
      transferable ? 1 : 0,
      JSON.stringify(terms),
      nowIso
    ).run();
    const voucher = {
      voucherId: id,
      issuerUid,
      holderUid,
      serviceType,
      title,
      description,
      durationMinutes,
      validFrom,
      validUntil,
      price: priceAmount != null ? { amount: priceAmount, currency: priceCurrency || "EUR" } : null,
      status,
      transferable,
      terms,
      createdAt: nowIso
    };
    await insertEvent13(env, "voucher.issue", issuerUid, "voucher", id, {
      serviceType
    });
    return json34(200, { ok: true, voucher });
  } catch (err) {
    return json34(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost31, "onRequestPost");

// api/teladia/assets.js
async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env;
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const assetType = url.searchParams.get("type");
      const currency = url.searchParams.get("currency");
      let query = `
        SELECT 
          ac.code AS asset_class,
          n.currency_code,
          COUNT(n.neg_asset_id) AS asset_count,
          SUM(n.nominal_amount) AS total_value,
          AVG(n.risk_score) AS avg_risk_score
        FROM negative_asset n
        JOIN bank b ON b.bank_id = n.provider_bank_id
        JOIN asset_class ac ON ac.asset_class_id = n.asset_class_id
        WHERE b.bank_id = 'TELADIA-BANK-001' AND n.status != 'archived'
      `;
      const params = [];
      if (assetType) {
        if (assetType === "fiat") {
          query += " AND ac.code IN (?, ?)";
          params.push("DIGITAL_CURRENCY", "LOAN");
        } else if (assetType === "crypto") {
          query += " AND ac.code = ?";
          params.push("DIGITAL_CURRENCY");
        } else if (assetType === "real-estate") {
          query += " AND ac.code = ?";
          params.push("REAL_ESTATE");
        }
      }
      if (currency) {
        query += " AND n.currency_code = ?";
        params.push(currency);
      }
      query += " GROUP BY ac.code, n.currency_code";
      const result = await DB.prepare(query).bind(...params).all();
      const realEstateQuery = `
        SELECT 
          property_id,
          property_type,
          address,
          city,
          valuation_amount,
          valuation_currency,
          status
        FROM teladia_real_estate
        WHERE bank_id = 'TELADIA-BANK-001' AND status = 'active'
      `;
      const realEstateResult = await DB.prepare(realEstateQuery).all();
      return new Response(JSON.stringify({
        success: true,
        data: {
          assets: result.results || [],
          real_estate: realEstateResult.results || []
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[TELADIA Assets API Error]", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest, "onRequest");

// api/teladia/exchange.js
async function onRequest2(context) {
  const { request, env } = context;
  const { DB } = env;
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      let query = `
        SELECT * FROM teladia_exchange_rate
        WHERE valid_to IS NULL OR valid_to > datetime('now')
      `;
      const params = [];
      if (from) {
        query += " AND from_currency = ?";
        params.push(from);
      }
      if (to) {
        query += " AND to_currency = ?";
        params.push(to);
      }
      query += " ORDER BY valid_from DESC LIMIT 1";
      const result = await DB.prepare(query).bind(...params).first();
      return new Response(JSON.stringify({
        success: true,
        data: result || null
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "POST") {
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
          error: "Missing required fields"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const transactionId = crypto.randomUUID();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await DB.prepare(`
        INSERT INTO teladia_exchange_transaction (
          transaction_id, bank_id, from_currency, from_amount,
          to_currency, to_amount, exchange_rate, fee_amount, fee_currency,
          status, executed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'executed', ?, ?)
      `).bind(
        transactionId,
        bank_id,
        from_currency,
        parseFloat(from_amount),
        to_currency,
        parseFloat(to_amount),
        parseFloat(exchange_rate),
        fee_amount ? parseFloat(fee_amount) : 0,
        fee_currency || from_currency,
        now,
        now
      ).run();
      return new Response(JSON.stringify({
        success: true,
        data: { transaction_id: transactionId }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[TELADIA Exchange API Error]", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest2, "onRequest");

// api/telbank/banks.js
async function onRequest3(context) {
  const { request, env } = context;
  const { DB } = env;
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const countryCode = url.searchParams.get("country_code");
      const role = url.searchParams.get("role");
      const isActive = url.searchParams.get("is_active");
      let query = `
        SELECT 
          b.bank_id,
          b.legal_name,
          b.short_name,
          b.country_code,
          b.city,
          b.bic_swift,
          b.lei,
          b.website,
          b.contact_email,
          b.contact_form_url,
          b.api_base_url,
          b.role,
          b.onboarding_status,
          b.is_active,
          b.created_at,
          b.updated_at,
          COUNT(n.neg_asset_id) AS total_negative_assets,
          COALESCE(SUM(n.nominal_amount), 0) AS total_exposure
        FROM bank b
        LEFT JOIN negative_asset n ON n.provider_bank_id = b.bank_id AND n.status != 'archived'
        WHERE 1=1
      `;
      const params = [];
      if (countryCode) {
        query += " AND b.country_code = ?";
        params.push(countryCode);
      }
      if (role) {
        query += " AND b.role = ?";
        params.push(role);
      }
      if (isActive !== null) {
        query += " AND b.is_active = ?";
        params.push(isActive === "true" ? 1 : 0);
      }
      query += " GROUP BY b.bank_id ORDER BY b.legal_name";
      const result = await DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify({
        success: true,
        data: result.results || []
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const {
        legal_name,
        short_name,
        country_code,
        city,
        bic_swift,
        lei,
        website,
        contact_email,
        contact_form_url,
        api_base_url,
        role,
        onboarding_status
      } = body;
      if (!legal_name) {
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required field: legal_name"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const bankId = crypto.randomUUID();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await DB.prepare(`
        INSERT INTO bank (
          bank_id, legal_name, short_name, country_code, city,
          bic_swift, lei, website, contact_email, contact_form_url,
          api_base_url, role, onboarding_status, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(
        bankId,
        legal_name,
        short_name || null,
        country_code || null,
        city || null,
        bic_swift || null,
        lei || null,
        website || null,
        contact_email || null,
        contact_form_url || null,
        api_base_url || null,
        role || "provider",
        onboarding_status || "pending",
        now,
        now
      ).run();
      return new Response(JSON.stringify({
        success: true,
        data: { bank_id: bankId }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[TELBANK Banks API Error]", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest3, "onRequest");

// api/telbank/negative-assets.js
async function onRequest4(context) {
  const { request, env } = context;
  const { DB } = env;
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const bankId = url.searchParams.get("bank_id");
      const status = url.searchParams.get("status");
      const currency = url.searchParams.get("currency");
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");
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
        query += " AND n.provider_bank_id = ?";
        params.push(bankId);
      }
      if (status) {
        query += " AND n.status = ?";
        params.push(status);
      }
      if (currency) {
        query += " AND n.currency_code = ?";
        params.push(currency);
      }
      query += " ORDER BY n.event_date DESC, n.created_at DESC LIMIT ? OFFSET ?";
      params.push(limit, offset);
      const result = await DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify({
        success: true,
        data: result.results || [],
        total: result.results?.length || 0,
        limit,
        offset
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "POST") {
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
      if (!provider_bank_id || !asset_class_id || !currency_code || !nominal_amount || !event_date) {
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required fields: provider_bank_id, asset_class_id, currency_code, nominal_amount, event_date"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const amount = parseFloat(nominal_amount);
      if (amount >= 0) {
        return new Response(JSON.stringify({
          success: false,
          error: "nominal_amount must be negative (< 0)"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const negAssetId = crypto.randomUUID();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await DB.prepare(`
        INSERT INTO negative_asset (
          neg_asset_id, provider_bank_id, external_ref, asset_class_id,
          currency_code, nominal_amount, event_date, status, risk_score,
          anonymized_hash, meta_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'reported', ?, ?, ?, ?, ?)
      `).bind(
        negAssetId,
        provider_bank_id,
        external_ref || null,
        asset_class_id,
        currency_code,
        amount,
        event_date,
        risk_score || null,
        anonymized_hash || null,
        meta_json ? JSON.stringify(meta_json) : null,
        now,
        now
      ).run();
      const ledgerId = crypto.randomUUID();
      await DB.prepare(`
        INSERT INTO telbank_ledger (
          ledger_entry_id, neg_asset_id, entry_type, currency_code,
          amount, booked_at, description, created_at
        ) VALUES (?, ?, 'minus_in', ?, ?, ?, ?, ?)
      `).bind(
        ledgerId,
        negAssetId,
        currency_code,
        amount,
        now,
        `Negative Asset reported: ${external_ref || negAssetId}`,
        now
      ).run();
      return new Response(JSON.stringify({
        success: true,
        data: { neg_asset_id: negAssetId }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[TELBANK API Error]", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest4, "onRequest");

// api/telbank/transformations.js
async function onRequest5(context) {
  const { request, env } = context;
  const { DB } = env;
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const negAssetId = url.searchParams.get("neg_asset_id");
      const resultState = url.searchParams.get("result_state");
      let query = `
        SELECT 
          t.transform_id,
          t.neg_asset_id,
          t.action_type,
          t.description,
          t.scheduled_at,
          t.executed_at,
          t.result_state,
          t.effect_amount,
          t.notes,
          t.approved_by,
          t.created_at,
          n.currency_code,
          n.nominal_amount
        FROM transformation_action t
        LEFT JOIN negative_asset n ON n.neg_asset_id = t.neg_asset_id
        WHERE 1=1
      `;
      const params = [];
      if (negAssetId) {
        query += " AND t.neg_asset_id = ?";
        params.push(negAssetId);
      }
      if (resultState) {
        query += " AND t.result_state = ?";
        params.push(resultState);
      }
      query += " ORDER BY t.created_at DESC";
      const result = await DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify({
        success: true,
        data: result.results || []
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const {
        neg_asset_id,
        action_type,
        description,
        scheduled_at,
        effect_amount,
        notes,
        approved_by
      } = body;
      if (!neg_asset_id || !action_type) {
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required fields: neg_asset_id, action_type"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const transformId = crypto.randomUUID();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await DB.prepare(`
        INSERT INTO transformation_action (
          transform_id, neg_asset_id, action_type, description,
          scheduled_at, result_state, effect_amount, notes, approved_by, created_at
        ) VALUES (?, ?, ?, ?, ?, 'planned', ?, ?, ?, ?)
      `).bind(
        transformId,
        neg_asset_id,
        action_type,
        description || null,
        scheduled_at || null,
        effect_amount || null,
        notes || null,
        approved_by || null,
        now
      ).run();
      return new Response(JSON.stringify({
        success: true,
        data: { transform_id: transformId }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[TELBANK Transformations API Error]", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest5, "onRequest");

// api/instruments/[id].js
function json35(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json35, "json");
async function checkApiKey30(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json35(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey30, "checkApiKey");
async function insertEvent14(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent14, "insertEvent");
async function onRequestGet30(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey30(request, env);
  if (apiKeyError) return apiKeyError;
  const instrumentId = params.id;
  try {
    const instrument = await env.DB.prepare(
      "SELECT * FROM instruments WHERE id = ?"
    ).bind(instrumentId).first();
    if (!instrument) {
      return json35(404, {
        ok: false,
        error: "not_found",
        message: `Instrument with id ${instrumentId} does not exist`
      });
    }
    const balance = await env.DB.prepare(
      "SELECT * FROM real_balances WHERE id = ?"
    ).bind(instrument.balance_id).first();
    return json35(200, {
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
          activated_at: instrument.activated_at
        },
        balance: balance ? {
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
          created_at: balance.created_at
        } : null
      }
    });
  } catch (err) {
    return json35(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet30, "onRequestGet");
async function onRequestPatch(context) {
  const { request, env, params } = context;
  const apiKeyError = await checkApiKey30(request, env);
  if (apiKeyError) return apiKeyError;
  const instrumentId = params.id;
  let body;
  try {
    body = await request.json();
  } catch {
    return json35(400, { ok: false, error: "invalid JSON body" });
  }
  const { status } = body;
  if (status && !["draft", "active", "suspended", "retired"].includes(status)) {
    return json35(400, {
      ok: false,
      error: "invalid_status",
      message: "status must be one of: draft, active, suspended, retired"
    });
  }
  try {
    const existing = await env.DB.prepare("SELECT id, status FROM instruments WHERE id = ?").bind(instrumentId).first();
    if (!existing) {
      return json35(404, {
        ok: false,
        error: "not_found",
        message: `Instrument with id ${instrumentId} does not exist`
      });
    }
    if (status) {
      await env.DB.prepare("UPDATE instruments SET status = ? WHERE id = ?").bind(status, instrumentId).run();
      if (status === "active" && existing.status !== "active") {
        await env.DB.prepare("UPDATE instruments SET activated_at = ? WHERE id = ?").bind((/* @__PURE__ */ new Date()).toISOString(), instrumentId).run();
      }
      await insertEvent14(env, "instrument.updated", null, "instrument", instrumentId, {
        status,
        previous_status: existing.status
      });
    }
    const updated = await env.DB.prepare("SELECT * FROM instruments WHERE id = ?").bind(instrumentId).first();
    return json35(200, {
      ok: true,
      data: {
        instrument: {
          id: updated.id,
          status: updated.status,
          activated_at: updated.activated_at
        }
      }
    });
  } catch (err) {
    return json35(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPatch, "onRequestPatch");

// api/events/index.js
function json36(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json36, "json");
async function checkApiKey31(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json36(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey31, "checkApiKey");
async function insertEvent15(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent15, "insertEvent");
function makeId16(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
__name(makeId16, "makeId");
async function onRequestGet31(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey31(request, env);
  if (apiKeyError) return apiKeyError;
  try {
    const url = new URL(request.url);
    const organizerId = url.searchParams.get("organizer_id");
    const networkId = url.searchParams.get("network_id");
    const since = url.searchParams.get("since");
    let query = "SELECT * FROM events ORDER BY start_time ASC";
    const binds = [];
    if (organizerId) {
      query += binds.length > 0 ? " AND" : " WHERE";
      query += " organizer_id = ?";
      binds.push(organizerId);
    }
    if (networkId) {
      query += binds.length > 0 ? " AND" : " WHERE";
      query += " network_id = ?";
      binds.push(networkId);
    }
    if (since) {
      query += binds.length > 0 ? " AND" : " WHERE";
      query += " start_time >= ?";
      binds.push(since);
    }
    const result = await env.DB.prepare(query).bind(...binds).all();
    const events = result.results.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      organizer_id: row.organizer_id,
      start_time: row.start_time,
      end_time: row.end_time,
      location: row.location,
      network_id: row.network_id,
      invitee_ids: row.invitee_ids ? JSON.parse(row.invitee_ids) : [],
      visibility: row.visibility,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    return json36(200, { ok: true, data: { events } });
  } catch (err) {
    return json36(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet31, "onRequestGet");
async function onRequestPost32(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey31(request, env);
  if (apiKeyError) return apiKeyError;
  let body;
  try {
    body = await request.json();
  } catch {
    return json36(400, { ok: false, error: "invalid JSON body" });
  }
  const { title, description, organizer_id, start_time, end_time, location, network_id, invitee_ids, visibility } = body;
  if (!title || !organizer_id || !start_time) {
    return json36(400, { ok: false, error: "title, organizer_id, and start_time required" });
  }
  try {
    const eventId = makeId16("evt");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const updatedAt = createdAt;
    await env.DB.prepare(
      `INSERT INTO events (id, title, description, organizer_id, start_time, end_time, location, network_id, invitee_ids, visibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      eventId,
      title,
      description || null,
      organizer_id,
      start_time,
      end_time || null,
      location || null,
      network_id || null,
      JSON.stringify(invitee_ids || []),
      visibility || "network",
      createdAt,
      updatedAt
    ).run();
    await insertEvent15(env, "event.created", organizer_id, "event", eventId, { title, start_time });
    return json36(200, {
      ok: true,
      data: {
        event: {
          id: eventId,
          title,
          description,
          organizer_id,
          start_time,
          end_time,
          location,
          network_id,
          invitee_ids: invitee_ids || [],
          visibility: visibility || "network",
          created_at: createdAt,
          updated_at: updatedAt
        }
      }
    });
  } catch (err) {
    return json36(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost32, "onRequestPost");

// api/instruments/index.js
function json37(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json37, "json");
function makeId17(prefix = "inst") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
__name(makeId17, "makeId");
async function checkApiKey32(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json37(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey32, "checkApiKey");
async function checkRateLimit16(env, key, limit = 60, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit16, "checkRateLimit");
async function insertEvent16(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent16, "insertEvent");
async function onRequestPost33(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey32(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit16(env, `instruments.create|${ip}`);
  if (!allowed) {
    return json37(429, { ok: false, error: "rate limit exceeded" });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json37(400, { ok: false, error: "invalid JSON body" });
  }
  const { entity_id, balance_id, symbol, name, description, units_issued, creation_reason } = body;
  if (!entity_id || !balance_id || !symbol || !name || !units_issued) {
    return json37(400, {
      ok: false,
      error: "missing_required_fields",
      message: "entity_id, balance_id, symbol, name, and units_issued are required"
    });
  }
  const balance = await env.DB.prepare(
    "SELECT id, net_value, entity_id FROM real_balances WHERE id = ?"
  ).bind(balance_id).first();
  if (!balance) {
    return json37(404, {
      ok: false,
      error: "balance_not_found",
      message: `Balance with id ${balance_id} does not exist`
    });
  }
  if (balance.entity_id !== entity_id) {
    return json37(400, {
      ok: false,
      error: "entity_mismatch",
      message: "Balance does not belong to the specified entity"
    });
  }
  if (balance.net_value <= 0) {
    return json37(422, {
      ok: false,
      error: "negative_net_value",
      message: "Instrument kann nur auf positiver Real-Bilanz erstellt werden"
    });
  }
  const existingSymbol = await env.DB.prepare("SELECT id FROM instruments WHERE symbol = ?").bind(symbol).first();
  if (existingSymbol) {
    return json37(400, {
      ok: false,
      error: "symbol_exists",
      message: `Symbol ${symbol} is already in use`
    });
  }
  const instrumentId = body.id || makeId17("inst");
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO instruments 
       (id, entity_id, balance_id, symbol, name, description, status, net_value, currency, units_issued, creation_reason, created_at, activated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      instrumentId,
      entity_id,
      balance_id,
      symbol,
      name,
      description || null,
      "draft",
      balance.net_value,
      "EUR",
      units_issued,
      creation_reason || null,
      createdAt,
      null
    ).run();
    const instrument = {
      id: instrumentId,
      entity_id,
      balance_id,
      symbol,
      name,
      description: description || null,
      status: "draft",
      net_value: balance.net_value,
      currency: "EUR",
      units_issued,
      creation_reason: creation_reason || null,
      created_at: createdAt,
      activated_at: null
    };
    await insertEvent16(env, "instrument.created", null, "instrument", instrumentId, {
      symbol,
      net_value: balance.net_value
    });
    return json37(200, { ok: true, data: { instrument } });
  } catch (err) {
    return json37(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost33, "onRequestPost");
async function onRequestGet32(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey32(request, env);
  if (apiKeyError) return apiKeyError;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const entityId = url.searchParams.get("entity_id");
  let query = "SELECT * FROM instruments";
  const params = [];
  const conditions = [];
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (entityId) {
    conditions.push("entity_id = ?");
    params.push(entityId);
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY created_at DESC LIMIT 1000";
  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    const instruments = (result.results || []).map((r) => ({
      id: r.id,
      entity_id: r.entity_id,
      balance_id: r.balance_id,
      symbol: r.symbol,
      name: r.name,
      description: r.description,
      status: r.status,
      net_value: r.net_value,
      currency: r.currency,
      units_issued: r.units_issued,
      creation_reason: r.creation_reason,
      created_at: r.created_at,
      activated_at: r.activated_at
    }));
    return json37(200, { ok: true, data: { instruments } });
  } catch (err) {
    return json37(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet32, "onRequestGet");

// api/invoices/index.js
function json38(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json38, "json");
async function checkApiKey33(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json38(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey33, "checkApiKey");
function makeId18(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
__name(makeId18, "makeId");
async function onRequestGet33(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey33(request, env);
  if (apiKeyError) return apiKeyError;
  try {
    const url = new URL(request.url);
    const issuerId = url.searchParams.get("issuer_id");
    const recipientId = url.searchParams.get("recipient_id");
    const status = url.searchParams.get("status");
    let query = "SELECT * FROM invoices ORDER BY created_at DESC";
    const binds = [];
    if (issuerId) {
      query += binds.length > 0 ? " AND" : " WHERE";
      query += " issuer_id = ?";
      binds.push(issuerId);
    }
    if (recipientId) {
      query += binds.length > 0 ? " AND" : " WHERE";
      query += " recipient_id = ?";
      binds.push(recipientId);
    }
    if (status) {
      query += binds.length > 0 ? " AND" : " WHERE";
      query += " status = ?";
      binds.push(status);
    }
    const result = await env.DB.prepare(query).bind(...binds).all();
    const invoices = result.results.map((row) => ({
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
      updated_at: row.updated_at
    }));
    return json38(200, { ok: true, data: { invoices } });
  } catch (err) {
    return json38(500, { ok: false, error: String(err) });
  }
}
__name(onRequestGet33, "onRequestGet");
async function onRequestPost34(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey33(request, env);
  if (apiKeyError) return apiKeyError;
  let body;
  try {
    body = await request.json();
  } catch {
    return json38(400, { ok: false, error: "invalid JSON body" });
  }
  const { issuer_id, recipient_id, voucher_id, booking_id, amount, currency, tax_rate, items, due_date, invoice_number } = body;
  if (!issuer_id || !recipient_id || !amount) {
    return json38(400, { ok: false, error: "issuer_id, recipient_id, and amount required" });
  }
  try {
    const invoiceId = makeId18("inv");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const updatedAt = createdAt;
    const subtotal = (items || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const tax = subtotal * ((tax_rate || 0) / 100);
    const total = subtotal + tax;
    const invNumber = invoice_number || this.generateInvoiceNumber();
    await env.DB.prepare(
      `INSERT INTO invoices (id, issuer_id, recipient_id, voucher_id, booking_id, amount, currency, tax_rate, items, status, due_date, invoice_number, pdf_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      invoiceId,
      issuer_id,
      recipient_id,
      voucher_id || null,
      booking_id || null,
      total,
      // Gesamtbetrag
      currency || "EUR",
      tax_rate || 0,
      JSON.stringify(items || []),
      "draft",
      due_date || null,
      invNumber,
      null,
      // pdf_url wird später gesetzt
      createdAt,
      updatedAt
    ).run();
    return json38(200, {
      ok: true,
      data: {
        invoice: {
          id: invoiceId,
          issuer_id,
          recipient_id,
          voucher_id,
          booking_id,
          amount: total,
          currency: currency || "EUR",
          tax_rate: tax_rate || 0,
          items: items || [],
          status: "draft",
          due_date,
          invoice_number: invNumber,
          created_at: createdAt,
          updated_at: updatedAt
        }
      }
    });
  } catch (err) {
    return json38(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost34, "onRequestPost");

// api/telemetry.js
function json39(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(json39, "json");
function getClientIp11(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
}
__name(getClientIp11, "getClientIp");
async function checkApiKey34(request, env) {
  const required = env.TS_API_KEY;
  if (!required) return null;
  const provided = request.headers.get("X-TS-APIKEY");
  if (!provided || provided !== required) {
    return json39(401, { ok: false, error: "invalid api key" });
  }
  return null;
}
__name(checkApiKey34, "checkApiKey");
async function checkRateLimit17(env, key, limit = 300, windowMs = 6e4) {
  const now = Date.now();
  const windowStartCutoff = new Date(now - windowMs).toISOString();
  const row = await env.DB.prepare(
    "SELECT key, window_start, count FROM rate_limits WHERE key = ?"
  ).bind(key).first();
  if (row && row.window_start >= windowStartCutoff && row.count >= limit) {
    return false;
  }
  const newWindowStart = row && row.window_start >= windowStartCutoff ? row.window_start : new Date(now).toISOString();
  const newCount = row && row.window_start >= windowStartCutoff ? row.count + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`
  ).bind(key, newWindowStart, newCount).run();
  return true;
}
__name(checkRateLimit17, "checkRateLimit");
async function insertEvent17(env, type, actorId, subjectType, subjectId, meta) {
  const id = `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO events (id, type, actor_id, subject_type, subject_id, meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, type, actorId || null, subjectType || null, subjectId || null, JSON.stringify(meta || {}), createdAt).run();
}
__name(insertEvent17, "insertEvent");
async function onRequestPost35(context) {
  const { request, env } = context;
  const apiKeyError = await checkApiKey34(request, env);
  if (apiKeyError) return apiKeyError;
  const ip = getClientIp11(request);
  const allowed = await checkRateLimit17(env, `telemetry|${ip}`);
  if (!allowed) {
    return json39(429, { ok: false, error: "rate limit exceeded" });
  }
  let events;
  try {
    const body = await request.json();
    events = Array.isArray(body) ? body : [body];
  } catch {
    return json39(400, { ok: false, error: "invalid JSON body" });
  }
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const stmt = env.DB.prepare(
      `INSERT INTO telemetry_events
       (id, type, path, actor_uid, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const e of events) {
      if (!e || !e.type) continue;
      const id = `te-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const path = e.path || null;
      const actorUid = e.actorUid || null;
      const meta = e.meta || {};
      await stmt.bind(id, e.type, path, actorUid, JSON.stringify(meta), nowIso).run();
      await insertEvent17(
        env,
        "telemetry.event",
        actorUid,
        "telemetry",
        id,
        { type: e.type, path }
      );
    }
    return json39(200, { ok: true });
  } catch (err) {
    return json39(500, { ok: false, error: String(err) });
  }
}
__name(onRequestPost35, "onRequestPost");

// 404.js
async function onRequest6(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const redirects = {
    "/togethersystems/TsysytemsT/TsysytemsT.html": "/TsysytemsT/TsysytemsT.html",
    "/TsysytemsT/TsysytemsT.html": "/TsysytemsT/TsysytemsT.html",
    "/tsysytemst/tsysytemst.html": "/TsysytemsT/TsysytemsT.html",
    // Case-insensitive Fallback
    "/togethersystems/TELBANK/index.html": "/TELBANK/index.html",
    "/TELBANK/index.html": "/TELBANK/index.html",
    "/telbank/index.html": "/TELBANK/index.html",
    // Case-insensitive Fallback
    // GitHub Pages Base-Path Unterstützung
    "/togethersystems/TELBANK/": "/TELBANK/index.html",
    "/togethersystems/TsysytemsT/": "/TsysytemsT/TsysytemsT.html",
    // Assets und Config
    "/togethersystems/assets/branding/de_rechtspraak_128.png": "/assets/branding/de_rechtspraak_128.png",
    "/togethersystems/config/providers.json": "/config/providers.json"
  };
  const lowerPath = pathname.toLowerCase();
  for (const [pattern, target] of Object.entries(redirects)) {
    if (lowerPath.includes(pattern.toLowerCase().replace(/^\//, ""))) {
      return Response.redirect(new URL(target, url.origin).toString(), 301);
    }
  }
  return new Response(
    `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 - Seite nicht gefunden</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(180deg, #0b0f14, #0f1419);
      color: #e5e7eb;
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 600px;
    }
    h1 { font-size: 3rem; margin: 0; color: #10b981; }
    p { font-size: 1.1rem; color: #9ca3af; margin: 20px 0; }
    .links {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 30px;
    }
    .links a {
      color: #10b981;
      text-decoration: none;
      padding: 10px 20px;
      border: 1px solid #10b981;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .links a:hover {
      background: #10b981;
      color: #00110b;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Die angeforderte Seite wurde nicht gefunden.</p>
    <p style="font-size: 0.9rem; color: #6b7280;">
      Gesuchte URL: <code>${pathname}</code>
    </p>
    <div class="links">
      <a href="/">Portal</a>
      <a href="/manifest-portal.html">Online-Portal</a>
      <a href="/TELBANK/index.html">Telbank</a>
      <a href="/TsysytemsT/TsysytemsT.html">One Network</a>
      <a href="/index.html">Startseite</a>
    </div>
  </div>
</body>
</html>`,
    {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    }
  );
}
__name(onRequest6, "onRequest");

// ../.wrangler/tmp/pages-nW9HzX/functionsRoutes-0.7149734621426542.mjs
var routes = [
  {
    routePath: "/api/cms/sites/:siteId/pages",
    mountPath: "/api/cms/sites/:siteId",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/cms/sites/:siteId/pages",
    mountPath: "/api/cms/sites/:siteId",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/cms/blocks/types",
    mountPath: "/api/cms/blocks",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/cms/media/upload",
    mountPath: "/api/cms/media",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/presence/catalog/apis",
    mountPath: "/api/presence/catalog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/real/balances/recompute",
    mountPath: "/api/real/balances",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/cms/pages/:pageId",
    mountPath: "/api/cms/pages",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/cms/pages/:pageId",
    mountPath: "/api/cms/pages",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/cms/pages/:pageId",
    mountPath: "/api/cms/pages",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/real/balances/:entity_id",
    mountPath: "/api/real/balances",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/settings/distribution/:identifier",
    mountPath: "/api/settings/distribution",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/instruments/:id/activate",
    mountPath: "/api/instruments/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/admin/dashboard",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/admin/events",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/ai/gateway",
    mountPath: "/api/ai",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/autofix/errors",
    mountPath: "/api/autofix",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/autofix/notify",
    mountPath: "/api/autofix",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/autofix/status",
    mountPath: "/api/autofix",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/cms/collections",
    mountPath: "/api/cms/collections",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/cms/collections",
    mountPath: "/api/cms/collections",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/cms/sites",
    mountPath: "/api/cms/sites",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/api/cms/sites",
    mountPath: "/api/cms/sites",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/contracts/list",
    mountPath: "/api/contracts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/api/contracts/upload",
    mountPath: "/api/contracts",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/formula/execute",
    mountPath: "/api/formula",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api/mcp/scan",
    mountPath: "/api/mcp",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost11]
  },
  {
    routePath: "/api/mcp/status",
    mountPath: "/api/mcp",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/api/messages/ack",
    mountPath: "/api/messages",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost12]
  },
  {
    routePath: "/api/messages/pending",
    mountPath: "/api/messages",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/api/messages/send",
    mountPath: "/api/messages",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost13]
  },
  {
    routePath: "/api/microsite/create",
    mountPath: "/api/microsite",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost14]
  },
  {
    routePath: "/api/microsite/my-sites",
    mountPath: "/api/microsite",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/api/mortgage/application",
    mountPath: "/api/mortgage",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost15]
  },
  {
    routePath: "/api/mortgage/offer",
    mountPath: "/api/mortgage",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost16]
  },
  {
    routePath: "/api/mortgage/offer-list",
    mountPath: "/api/mortgage",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/api/ostosos/download",
    mountPath: "/api/ostosos",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet18]
  },
  {
    routePath: "/api/presence/debug",
    mountPath: "/api/presence",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet19]
  },
  {
    routePath: "/api/presence/heartbeat",
    mountPath: "/api/presence",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost17]
  },
  {
    routePath: "/api/presence/match",
    mountPath: "/api/presence",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost18]
  },
  {
    routePath: "/api/presence/verify",
    mountPath: "/api/presence",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost19]
  },
  {
    routePath: "/api/real/entities",
    mountPath: "/api/real",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet20]
  },
  {
    routePath: "/api/real/entities",
    mountPath: "/api/real",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost20]
  },
  {
    routePath: "/api/real/transactions",
    mountPath: "/api/real",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet21]
  },
  {
    routePath: "/api/real/transactions",
    mountPath: "/api/real",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost21]
  },
  {
    routePath: "/api/robot/create",
    mountPath: "/api/robot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost22]
  },
  {
    routePath: "/api/robot/execute",
    mountPath: "/api/robot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost23]
  },
  {
    routePath: "/api/settings/create-distribution",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost24]
  },
  {
    routePath: "/api/settings/graph",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet22]
  },
  {
    routePath: "/api/settings/model-for-task",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet23]
  },
  {
    routePath: "/api/settings/propose",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost25]
  },
  {
    routePath: "/api/settings/query",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet24]
  },
  {
    routePath: "/api/settings/simulate-change",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost26]
  },
  {
    routePath: "/api/settings/version",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet25]
  },
  {
    routePath: "/api/slots/available",
    mountPath: "/api/slots",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet26]
  },
  {
    routePath: "/api/sponsors/list",
    mountPath: "/api/sponsors",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet27]
  },
  {
    routePath: "/api/sponsors/register",
    mountPath: "/api/sponsors",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost27]
  },
  {
    routePath: "/api/telbank/transfers",
    mountPath: "/api/telbank",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet28]
  },
  {
    routePath: "/api/telbank/transfers",
    mountPath: "/api/telbank",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost28]
  },
  {
    routePath: "/api/voucher/book",
    mountPath: "/api/voucher",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost29]
  },
  {
    routePath: "/api/voucher/bookings",
    mountPath: "/api/voucher",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet29]
  },
  {
    routePath: "/api/voucher/cancel",
    mountPath: "/api/voucher",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost30]
  },
  {
    routePath: "/api/voucher/issue",
    mountPath: "/api/voucher",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost31]
  },
  {
    routePath: "/api/teladia/assets",
    mountPath: "/api/teladia",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/teladia/exchange",
    mountPath: "/api/teladia",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/telbank/banks",
    mountPath: "/api/telbank",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/telbank/negative-assets",
    mountPath: "/api/telbank",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/telbank/transformations",
    mountPath: "/api/telbank",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/instruments/:id",
    mountPath: "/api/instruments",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet30]
  },
  {
    routePath: "/api/instruments/:id",
    mountPath: "/api/instruments",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/events",
    mountPath: "/api/events",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet31]
  },
  {
    routePath: "/api/events",
    mountPath: "/api/events",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost32]
  },
  {
    routePath: "/api/instruments",
    mountPath: "/api/instruments",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet32]
  },
  {
    routePath: "/api/instruments",
    mountPath: "/api/instruments",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost33]
  },
  {
    routePath: "/api/invoices",
    mountPath: "/api/invoices",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet33]
  },
  {
    routePath: "/api/invoices",
    mountPath: "/api/invoices",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost34]
  },
  {
    routePath: "/api/telemetry",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost35]
  },
  {
    routePath: "/404",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  }
];

// C:/Users/Gebruiker/AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// C:/Users/Gebruiker/AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
