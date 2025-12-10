export async function onRequest(context) {
  return new Response(JSON.stringify({ online: true, users: 42, ts: new Date().toISOString() }), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
