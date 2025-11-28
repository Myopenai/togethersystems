// TELBANK Banks API
// IBM-Standard: Zero-Defect, Industrial Fabrication Software
// Version: 1.0.0-XXXL

export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env;

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const countryCode = url.searchParams.get('country_code');
      const role = url.searchParams.get('role');
      const isActive = url.searchParams.get('is_active');

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
        query += ' AND b.country_code = ?';
        params.push(countryCode);
      }
      if (role) {
        query += ' AND b.role = ?';
        params.push(role);
      }
      if (isActive !== null) {
        query += ' AND b.is_active = ?';
        params.push(isActive === 'true' ? 1 : 0);
      }

      query += ' GROUP BY b.bank_id ORDER BY b.legal_name';

      const result = await DB.prepare(query).bind(...params).all();

      return new Response(JSON.stringify({
        success: true,
        data: result.results || []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST') {
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
          error: 'Missing required field: legal_name'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const bankId = crypto.randomUUID();
      const now = new Date().toISOString();

      await DB.prepare(`
        INSERT INTO bank (
          bank_id, legal_name, short_name, country_code, city,
          bic_swift, lei, website, contact_email, contact_form_url,
          api_base_url, role, onboarding_status, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(
        bankId, legal_name, short_name || null, country_code || null, city || null,
        bic_swift || null, lei || null, website || null, contact_email || null,
        contact_form_url || null, api_base_url || null, role || 'provider',
        onboarding_status || 'pending', now, now
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { bank_id: bankId }
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
    console.error('[TELBANK Banks API Error]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

