export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get("id");
  return new Response(JSON.stringify({ ok: true, id, redeemed: true }), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
