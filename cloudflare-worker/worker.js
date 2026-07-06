// Deployed separately on Cloudflare Workers (not part of the GitHub Pages build).
// Stores a single visit counter in Workers KV — see README.md for setup.

const ALLOWED_ORIGIN = 'https://muhammad-fahd.github.io';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const readOnly = url.searchParams.get('mode') === 'read';

    let count = Number(await env.VISITS.get('count')) || 0;
    if (!readOnly) {
      count += 1;
      await env.VISITS.put('count', String(count));
    }

    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
