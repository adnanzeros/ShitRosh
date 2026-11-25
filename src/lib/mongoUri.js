// FILE: src/lib/mongoUri.js
// Fallback for networks where the normal SRV DNS lookup of a "mongodb+srv://" string is blocked
// (error: "querySrv ECONNREFUSED"). It looks the SRV/TXT records up another way and returns a
// plain "mongodb://host1,host2,host3/..." string that needs no SRV lookup.
// Pure helper: no project imports, so scripts/seed.mjs can load it too.
import dns from 'node:dns';

const PUBLIC_DNS = ['1.1.1.1', '8.8.8.8'];

export const isSrvDnsError = e =>
  /query(Srv|Txt)/i.test(String(e?.message || ''));

// 1st try: public DNS servers over UDP, using a private resolver (never touches the global DNS setting)
async function viaPublicDns(host) {
  const r = new dns.promises.Resolver({ timeout: 4000, tries: 1 });
  r.setServers(PUBLIC_DNS);
  const srv = await r.resolveSrv(`_mongodb._tcp.${host}`);
  let txt = '';
  try {
    txt = (await r.resolveTxt(host)).map(c => c.join('')).join('&');
  } catch {}
  return { hosts: srv.map(x => `${x.name}:${x.port}`), txt };
}

// 2nd try: DNS-over-HTTPS (normal HTTPS port 443, works even when DNS port 53 is blocked)
async function doh(name, type) {
  const urls = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
  ];
  let last;
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: { accept: 'application/dns-json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return (await res.json()).Answer || [];
    } catch (e) {
      last = e;
    }
  }
  throw last || new Error('DNS-over-HTTPS failed');
}
async function viaDoh(host) {
  const srv = await doh(`_mongodb._tcp.${host}`, 'SRV');
  const hosts = srv
    .filter(a => a.type === 33)
    .map(a => {
      const [, , port, target] = String(a.data).trim().split(/\s+/);
      return `${target.replace(/\.$/, '')}:${port}`;
    });
  let txt = '';
  try {
    txt = (await doh(host, 'TXT'))
      .filter(a => a.type === 16)
      .map(a => String(a.data).replace(/"\s*"/g, '').replace(/^"|"$/g, ''))
      .join('&');
  } catch {}
  return { hosts, txt };
}

export async function srvToStandardUri(uri, lookups = [viaPublicDns, viaDoh]) {
  const u = new URL(uri);
  let found, last;
  for (const look of lookups) {
    try {
      const r = await look(u.hostname);
      if (r.hosts.length) {
        found = r;
        break;
      }
    } catch (e) {
      last = e;
    }
  }
  if (!found)
    throw new Error(
      'DNS lookup for MongoDB Atlas failed on this network' +
        (last ? ` (${last.message})` : '') +
        '. Use the non-SRV connection string from Atlas (see README).',
    );
  const params = new URLSearchParams(found.txt);
  for (const [k, v] of u.searchParams) params.set(k, v);
  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');
  const auth = u.username
    ? u.username + (u.password ? ':' + u.password : '') + '@'
    : '';
  return `mongodb://${auth}${found.hosts.join(',')}${u.pathname || '/'}?${params}`;
}
