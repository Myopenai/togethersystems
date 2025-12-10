export async function onRequest(ctx) {
  if (ctx.request.method === 'GET') {
    return new Response(JSON.stringify([{ id:"pay-demo", status:"pending" }]), { headers:{ "Content-Type":"application/json" }});
  }
  if (ctx.request.method === 'POST') {
    const p = await ctx.request.json();
    return new Response(JSON.stringify({ accepted:true, id:"pay-"+crypto.randomUUID(), status:"pending", payload:p }), { status:202, headers:{ "Content-Type":"application/json" }});
  }
  return new Response(null, { status:405 });
}
