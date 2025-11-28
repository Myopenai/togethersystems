// TELADIA Assets API
// IBM-Standard: Zero-Defect, Industrial Fabrication Software
// Version: 1.0.0-XXXL
// Branding: T,.&T,,.&T,,,.TELADIA(C)(R) x Deutsche Bank

export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env; // D1 Database

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const assetType = url.searchParams.get('type'); // 'fiat', 'crypto', 'digital', 'real-estate'
      const currency = url.searchParams.get('currency');

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
        if (assetType === 'fiat') {
          query += ' AND ac.code IN (?, ?)';
          params.push('DIGITAL_CURRENCY', 'LOAN');
        } else if (assetType === 'crypto') {
          query += ' AND ac.code = ?';
          params.push('DIGITAL_CURRENCY');
        } else if (assetType === 'real-estate') {
          query += ' AND ac.code = ?';
          params.push('REAL_ESTATE');
        }
      }

      if (currency) {
        query += ' AND n.currency_code = ?';
        params.push(currency);
      }

      query += ' GROUP BY ac.code, n.currency_code';

      const result = await DB.prepare(query).bind(...params).all();

      // Real Estate Assets
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
    console.error('[TELADIA Assets API Error]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

