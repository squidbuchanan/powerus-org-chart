import { getStore } from '@netlify/blobs';

/*
 * Shared org-chart state — one JSON document for the whole site.
 *
 * GET  → returns the current document  { keys: { ... }, updated_at }
 * PUT  → merges the posted keys into the stored document (last-write-wins per key)
 *
 * Storage is Netlify Blobs — no database to provision, free-tier, and
 * automatically wired up on any deployed Netlify site.
 */

const CORS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,PUT,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store',
};

export default async (req) => {
  const store = getStore('powerus-org');

  if (req.method === 'OPTIONS') {
    return new Response('', { headers: CORS });
  }

  if (req.method === 'GET') {
    const doc = (await store.get('state', { type: 'json' })) || { keys: {} };
    return new Response(JSON.stringify(doc), { headers: CORS });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { body = {}; }
    const incoming = (body && body.keys) || {};

    const existing = (await store.get('state', { type: 'json' })) || { keys: {} };
    const merged = {
      keys: { ...existing.keys, ...incoming },
      updated_at: new Date().toISOString(),
    };
    await store.setJSON('state', merged);

    return new Response(
      JSON.stringify({ ok: true, updated_at: merged.updated_at }),
      { headers: CORS }
    );
  }

  return new Response(
    JSON.stringify({ error: 'method not allowed' }),
    { status: 405, headers: CORS }
  );
};
