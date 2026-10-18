#!/usr/bin/env node
/* [giro 64 — PO-071 resto + PO-002/PO-137] guardiano di tre cose, ciascuna col suo rosso:
   (1) ETICHETTA della tipologia (__CPM_NO_ETI071): stadiumKindLabel da' un nome distinto alle quattro tipologie del giro 46
       e nessun nome agli impianti senza architettura propria.
   (2) CARTELLONI per tipologia (__CPM_NO_ADK064): per ogni tipologia forzata (borgo/mattoni/arena/catino) si legge la firma dei
       cartelloni a bordo campo — materiale (illuminato dalla scena o LED) e luminanza media della texture. Verde: borgo chiaro
       e illuminato, mattoni scuro e illuminato, arena LED nero; quattro firme distinte. Rosso: tutte uguali (LED).
   (3) FONDALE del palco della premiazione di squadra (__CPM_NO_PALCO064): col nome della competizione e la riga di stagione.
   Uso: node stadi-064.mjs   (CPM_ROSSO=1 → tutti e tre gli interruttori: il guardiano deve dire che il difetto si vede) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const KINDS = ['borgo', 'mattoni', 'arena', 'catino'];
const firme = {}; let eti = null, palco = null; const errs = [];
for (const k of KINDS) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TOD = 'night'; window.__CPM_PRESENT = 1; window.__CPM_STADIUM_TPL_FORCE = o.k; if (o.r) { window.__CPM_NO_ETI071 = 1; window.__CPM_NO_ADK064 = 1; window.__CPM_NO_PALCO064 = 1; } }, { k, r: ROSSO });
  await openMatch(page, port, { skipLoadAll: true, name: 'Stadi064' }); await sleep(900);
  firme[k] = await page.evaluate(() => {
    const T = window.__CPM3D; const out = { lambert: 0, basic: 0, lum: [] };
    T.scene.traverse(m => { const g = m.geometry, p = g && g.parameters; if (!m.isMesh || !p || p.height !== 1.7 || !(m.material && m.material.map && m.material.map.image)) return;
      if (Math.abs(m.position.y - 1.0) > 0.01) return;
      if (m.material.type === 'MeshLambertMaterial') out.lambert++; else out.basic++;
      if (out.lum.length < 6) { const c = m.material.map.image; try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0, n = 0; for (let i = 0; i < d.length; i += 64) { s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; } out.lum.push(s / n / 255); } catch (e) {} } });
    out.lum = +(out.lum.reduce((a, b) => a + b, 0) / Math.max(1, out.lum.length)).toFixed(3); out.adk = window.__CPM_ADK064 || null; return out; });
  if (k === 'borgo') {
    eti = await page.evaluate(() => { const f = window.__CPM_STADIUM_KIND_LABEL; return f ? ['borgo', 'catino', 'mattoni', 'arena', null, 'storico_it'].map(x => f(x)) : null; });
    await page.evaluate(() => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'Coppa di Lega', kind: 'cup' })); await sleep(2500);
    palco = await page.evaluate(() => { let f = false; window.__CPM3D.scene.traverse(o => { if (o._fondale064) f = true; }); return { f, w: window.__CPM_PALCO064 || null }; });
  }
  await page.close();
}
await b.close(); srv.close();
console.log(JSON.stringify({ firme, eti, palco, errs: errs.slice(0, 3) }));
const g = [];
const etiOk = eti && eti.slice(0, 4).every(Boolean) && new Set(eti.slice(0, 4)).size === 4 && !eti[4] && !eti[5];
const F = firme; const adkOk = F.borgo.lambert > 8 && F.borgo.lum > 0.55 && F.mattoni.lambert > 8 && F.mattoni.lum < 0.4 && F.arena.lambert === 0 && F.arena.lum < 0.3 && F.catino.lambert === 0
  && new Set(KINDS.map(k => `${F[k].lambert > 0}|${Math.round(F[k].lum * 10)}`)).size >= 3;
const palcoOk = !!(palco && palco.f && palco.w && /COPPA DI LEGA/.test(palco.w.nome) && /STAGIONE/.test(palco.w.sub));
if (errs.length) g.push('errori di pagina ' + errs.join(' | '));
if (!ROSSO) { if (!etiOk) g.push('etichetta tipologia: ' + JSON.stringify(eti)); if (!adkOk) g.push('cartelloni per tipologia non distinti: ' + JSON.stringify(F)); if (!palcoOk) g.push('fondale del palco assente: ' + JSON.stringify(palco)); }
else { if (etiOk) g.push('rosso: etichetta ancora presente'); if (adkOk) g.push('rosso: cartelloni ancora distinti'); if (palcoOk) g.push('rosso: fondale ancora presente'); }
if (g.length) { console.log('❌ stadi-064' + (ROSSO ? ' (rosso)' : '')); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(ROSSO ? '✅ ROSSO come atteso (stadi-064: etichetta, cartelloni e fondale spenti si vedono)' : '✅ PASS stadi-064 (etichetta tipologia, cartelloni per tipologia, fondale del palco)');
