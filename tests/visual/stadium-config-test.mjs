/* Test stadiumConfigFor (5.87.0 · STADI S1): il resolver dello stadio è PURO, SEEDATO e rispetta
   le bande di capienza della direttiva PO. Verifica anche: niente pista d'atletica (decisione PO #2),
   template coerenti con la lega, override data-driven, evoluzione automatica monotona. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);

const res = await page.evaluate(() => {
  const f = window.stadiumConfigFor;
  if (typeof f !== 'function') return { err: 'stadiumConfigFor non esposta' };
  const CLUBS = window.__CPM_SITS ? null : null; // CLUBS non esposto: costruiamo club sintetici
  const mk = (id, p, lg) => ({ id, n: id, p, c: '#aa0000', c2: '#ffffff', lg });
  const issues = [];
  // 1) determinismo: stessa entry → stessa config, sempre
  const a = f(mk('testclub', 75, 'Lega A')), b = f(mk('testclub', 75, 'Lega A'));
  if (JSON.stringify(a) !== JSON.stringify(b)) issues.push('NON deterministico a parità di club');
  // 2) bande capienza della direttiva (3-8k / 5-15k / 10-30k / 20-45k / 40-80k+)
  const bandOk = (p, lo, hi) => { for (let i = 0; i < 40; i++) { const c = f(mk('c' + i + '_' + p, p, 'Lega A')).capacity; if (c < lo || c > hi) return 'p=' + p + ' capienza ' + c + ' fuori banda ' + lo + '-' + hi; } return null; };
  for (const [p, lo, hi] of [[45, 3000, 8000], [56, 5000, 15000], [68, 10000, 30000], [78, 20000, 45000], [90, 40000, 82000]]) { const e = bandOk(p, lo, hi); if (e) issues.push(e); }
  // 3) niente pista d'atletica in NESSUN template (decisione PO)
  const leghe = ['Lega A', 'Lega B', 'Premier Division', 'Championship', 'Liga Ibérica', 'Liga Ibérica 2', 'Deutsche Liga', 'Deutsche Liga 2', 'Ligue Nationale', 'Ligue Nationale 2', 'Liga Oranje', 'Liga Lusitana', 'Liga Belga', 'Liga Anatolica'];
  const tplSeen = {};
  for (const lg of leghe) for (let i = 0; i < 12; i++) { const c = f(mk(lg + i, 55 + (i * 4) % 40, lg)); tplSeen[c.template] = 1; if (c.track) issues.push('pista d\'atletica presente in ' + c.template + ' (vietata dal PO)'); }
  // 4) copertura template: almeno 7 dei 10 template usati dalle 14 leghe
  if (Object.keys(tplSeen).length < 7) issues.push('solo ' + Object.keys(tplSeen).length + ' template usati: ' + Object.keys(tplSeen).join(','));
  // 5) override data-driven
  const ov = f({ ...mk('ovr', 70, 'Lega A'), stadium: { capacity: 12345, name: 'Stadio Custom' } });
  if (ov.capacity !== 12345 || ov.name !== 'Stadio Custom') issues.push('override club.stadium non rispettato');
  // 6) U18 piccolo · Nazionale grande
  if (f({ ...mk('u18x', 70, 'Primavera 1'), isU18: true }).capacity > 3000) issues.push('U18 sopra 3000 posti');
  if (f(mk('naz', 85, 'Nazionale')).capacity < 62000) issues.push('stadio Nazionale sotto 62k');
  // 7) evoluzione automatica: promozione amplia, capienza resta in range sano
  const base = f(mk('evo', 70, 'Lega B')).capacity, prom = f(mk('evo', 70, 'Lega B'), { promoted: true }).capacity;
  if (!(prom > base)) issues.push('promozione non amplia lo stadio (' + base + '→' + prom + ')');
  // 8) nome stabile (2 chiamate = stesso nome, anche U18 dove prima era pick() casuale)
  const n1 = f({ ...mk('u18y', 60, 'Primavera 1'), isU18: true }).name, n2 = f({ ...mk('u18y', 60, 'Primavera 1'), isU18: true }).name;
  if (n1 !== n2) issues.push('nome stadio U18 non stabile');
  return { issues, templates: Object.keys(tplSeen), sample: a };
});

console.log('=== stadiumConfigFor — S1 STRATO DATI ===');
if (res.err) { console.log('❌ ' + res.err); process.exit(2); }
console.log('template in uso:', res.templates.join(' · '));
console.log('esempio (Lega A p75):', JSON.stringify(res.sample));
for (const i of res.issues) console.log('  ✗ ' + i);
console.log(res.issues.length === 0 ? '\n✅ STADIUM CONFIG OK' : '\n❌ STADIUM CONFIG FAIL');
await browser.close(); srv.close();
process.exit(res.issues.length === 0 ? 0 : 1);
