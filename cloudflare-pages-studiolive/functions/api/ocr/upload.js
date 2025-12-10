// [.SYSTEMS.T.SYSTEMS.] OCR Upload Endpoint
// Cloudflare Pages Function für OCR-Datei-Upload

export const config = { runtime: 'edge' };

async function readBodyAsArrayBuffer(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return null;
    const buf = await file.arrayBuffer();
    return { buf, filename: file.name, mime: file.type || 'application/octet-stream' };
  }
  const buf = await request.arrayBuffer();
  return { buf, filename: 'upload.bin', mime: request.headers.get('content-type') || 'application/octet-stream' };
}

function sha256Hex(ab) {
  const bytes = new Uint8Array(ab);
  return crypto.subtle.digest('SHA-256', bytes).then(hash => {
    const h = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
    return h;
  });
}

export async function onRequest(context) {
  try {
    const parsed = await readBodyAsArrayBuffer(context.request);
    if (!parsed) return new Response(JSON.stringify({ error: 'No file' }), { status: 400 });
    
    const hash = await sha256Hex(parsed.buf);
    
    const doc = {
      id: `doc-${hash.slice(0,12)}`,
      filename: parsed.filename,
      mime: parsed.mime,
      hash,
      receivedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({ ok: true, doc }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
