/**
 * POST /api/sponsors/register
 * 
 * Sponsor & Investor Registration
 * Ohne Investition, nur durch Überzeugung
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { name, logoData, registered } = data;

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'Unternehmensname erforderlich' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Speichere in D1 (falls verfügbar) oder R2
    const sponsor = {
      id: data.id || Date.now(),
      name: name.trim(),
      logoData,
      registered: registered || new Date().toISOString(),
      type: 'sponsor', // oder 'investor' wenn Finanzkapital
      verified: false,
      timestamp: new Date().toISOString(),
      timezone: 'UTC'
    };

    // D1 Storage (falls verfügbar)
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
        console.log('D1 insert optional:', e);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      sponsor,
      message: 'Sponsor erfolgreich registriert',
      benefits: [
        'Unternehmen präsentieren',
        'Erwirtschaftet Kunden',
        'Umsatz generieren',
        'Arbeit schaffen',
        'Lohn bezahlen',
        'Kosten decken',
        'Gewinn zum Teilen'
      ],
      note: 'Finanzielle Mittel gehen auf diese Weise nicht aus. Ausgewählte Investoren können auch mit Finanzkapital Einsatz zeigen.',
      gofundme: 'https://www.gofundme.com/f/magnitudo',
      producer: 'TEL1.NL',
      whatsapp: '0031613803782'
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || 'Server-Fehler'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

