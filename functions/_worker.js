// Cloudflare Pages Worker Entry Point
// Excludes Settings-Ordner from bundling

export default {
  async fetch(request, env, ctx) {
    // This is a placeholder - actual routing happens via Pages Functions
    return new Response('TogetherSystems Portal', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};








