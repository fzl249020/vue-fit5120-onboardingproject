// src/lib/http.js
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export async function get(path, params = {}, opts = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}${qs ? `?${qs}` : ''}`;
  const r = await fetch(url, { ...opts });
  if (!r.ok) throw new Error(await r.text().catch(()=>'') || `HTTP ${r.status}`);
  return r.json();
}
