// Deployed separately on Cloudflare Workers (not part of the GitHub Pages build).
// Stores visit stats in Workers KV under the key "stats" — see README.md for setup.
// The site only ever gets back the total count; country/city breakdown stays in KV
// for private viewing via `wrangler kv key get stats --binding VISITS --remote`
// or the Cloudflare dashboard's KV browser.

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

    let statsRaw = await env.VISITS.get('stats');
    if (!statsRaw) {
      // Migrate from the old plain-number "count" key so the running total isn't lost.
      const legacyCount = Number(await env.VISITS.get('count')) || 0;
      statsRaw = JSON.stringify({ total: legacyCount, countries: {}, cities: {} });
    }
    const stats = JSON.parse(statsRaw);

    if (!readOnly) {
      const country = request.cf?.country || 'unknown';
      const city = request.cf?.city ? `${request.cf.city}, ${country}` : `unknown, ${country}`;

      stats.total += 1;
      stats.countries[country] = (stats.countries[country] || 0) + 1;
      stats.cities[city] = (stats.cities[city] || 0) + 1;

      await env.VISITS.put('stats', JSON.stringify(stats));
    }

    return new Response(JSON.stringify({ count: stats.total }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
