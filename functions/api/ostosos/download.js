/**
 * GET /api/ostosos/download
 * 
 * Download OSTOSOS TTT T,.&T,,.&T,,,.
 * International TTT Global Free Internet
 */

// Cloudflare Workers compatible - use Web Crypto API
async function generateRandomBytes(size) {
  const arr = new Uint8Array(size);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createHash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet(context) {
  const crypto = globalThis.crypto;
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Generiere Unique Identifier für anonymisierte Verifizierung
  const uniqueId = await generateRandomBytes(16);
  const hash = await createHash(uniqueId);
  const hashTag = `#${hash.substring(0, 16)}`;
  
  // Portal Host
  const portalHost = new URL(request.url).origin;
  
  // Erstelle Distribution (User generiert eigenen Key)
  const distributionInfo = {
    uniqueId,
    hashTag,
    downloadUrl: `${portalHost}/api/settings/create-distribution`,
    instructions: {
      step1: 'Generiere deinen eigenen User Key (32 Bytes Hex)',
      step2: 'POST zu /api/settings/create-distribution mit userKey',
      step3: 'Erhalte deine einzigartige, verifizierte Version',
      step4: 'Alle Daten bleiben dein Eigentum'
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
      ostosos: 'OSTOSOS',
      ttt: 'TTT T,.&T,,.&T,,,.',
      global: 'INTERNATIONAL TTT GLOBAL FREE INTERNET',
      freedom: 'WAS DU WILLST | WO DU WILLST | WIE DU WILLST',
      os: 'OS VON OSTOSOS DREI TTT VON T,.',
      availability: 'SOLANGE DER VORRAT REICHT',
      brandedServices: '(C)(R)T,.&T,,.*&T,,,.BRANDED SERVICES DER T,.AG&CO&AG.T,,.(C)(R).T,,,.'
    },
    producer: {
      name: 'TEL1.NL',
      whatsapp: '0031613803782',
      gofundme: 'https://www.gofundme.com/f/magnitudo'
    },
    timestamp: new Date().toISOString(),
    timezone: 'UTC'
  };

  return new Response(JSON.stringify(distributionInfo, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

