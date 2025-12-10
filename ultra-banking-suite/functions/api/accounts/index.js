export async function onRequest(ctx) {
  return new Response(JSON.stringify([
    { id:"acc-001", currency:"EUR", balance: 12500.55 },
    { id:"acc-USD", currency:"USD", balance: 3200.10 },
    { id:"acc-GBP", currency:"GBP", balance: 980.00 }
  ]), { headers:{ "Content-Type":"application/json" }});
}
