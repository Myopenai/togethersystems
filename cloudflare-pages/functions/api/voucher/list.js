export async function onRequest(context) {
  return new Response(JSON.stringify([
    { id: "v-100", amount: 5000, redeemed: 1200, status: "active" },
    { id: "v-101", amount: 2500, redeemed: 2500, status: "redeemed" }
  ]), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
