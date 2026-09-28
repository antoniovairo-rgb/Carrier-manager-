/* [7.999.47] LA FESTA DI FINE PARTITA E' IL MOMENTO IN 3D (scelta PO) — guardiano.
   Gara meritata forzata (__CPM_FESTA942_FORCE: 2 gol e 1 assist). Verde: la partita entra nella cerimonia LEGGERA
   (fase ceremony), in basso c'e' la fascia data-cpm="festa47" coi numeri veri (punteggio = tabellone, nostro per primo;
   gol e assist forzati), a schermo NON c'e' «PREMIAZIONE»/«TITOLO VINTO» (nessun titolo vinto), nessun riquadro festa942,
   e «Salta festeggiamenti» porta alla card di fine gara. Rosso --rosso (__CPM_NO_FESTA3D47): torna il riquadro di prima. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const rosso = process.argv.includes('--rosso');
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
let errori = 0; const msg = [];
page.on('pageerror', (e) => { errori++; if (msg.length < 3) msg.push(String(e).slice(0, 160)); });
await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_FESTA3D47 = true;
  window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, rosso);
await openMatch(page, port, { skipLoadAll: true, name: 'Festa2' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
let v = null; const t0 = Date.now();
while (Date.now() - t0 < 420000) {
  v = await page.evaluate(() => { const f = document.querySelector('[data-cpm="festa47"]');
    const sc = window.__CPM_SCORE ? window.__CPM_SCORE() : null;
    return { fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null, f: f ? f.innerText.replace(/\s+/g, ' ').trim() : null,
      vecchio: !!document.querySelector('[data-cpm="festa942"]'), premio: /PREMIAZIONE|TITOLO VINTO|Premiazione/.test(document.body.innerText), sc }; }).catch(() => null);
  if (v && (v.f || v.vecchio || v.fase === 'ended')) break; await sleep(300); }
let dopo = null;
if (v && v.f) { await page.click('[data-cpm="salta"]').catch(() => {}); for (let i = 0; i < 20; i++) { await sleep(300); dopo = await page.evaluate(() => window.__CPM_PHASE()).catch(() => null); if (dopo === 'ended') break; } }
await browser.close(); server.close();
const sc = v && v.sc; const pun = sc ? (() => { const a = [sc.home, sc.away].map(Number); return Math.max(...a) + ' – ' + Math.min(...a); })() : null;
console.log(`\n=== FESTA 3D DI FINE PARTITA === ${rosso ? '[ROSSO __CPM_NO_FESTA3D47]' : '[VERDE]'}`);
console.log(`  fase ${v && v.fase} · fascia: ${v && v.f ? '«' + v.f + '»' : 'assente'} · riquadro vecchio ${v && v.vecchio ? 'SI' : 'no'} · testo premiazione ${v && v.premio ? 'SI' : 'no'}`);
console.log(`  tabellone ${sc ? JSON.stringify(sc) : '?'} · dopo «Salta» ${dopo} · errori di pagina ${errori}${msg.length ? ' → ' + msg[0] : ''}`);
const ok = rosso ? (!!v && !v.f && v.vecchio && errori === 0)
  : (!!v && v.fase === 'ceremony' && !!v.f && !v.vecchio && !v.premio && !!pun && v.f.includes(pun) && /2\s*gol/.test(v.f) && /1\s*assist/.test(v.f) && dopo === 'ended' && errori === 0);
console.log(ok ? (rosso ? '\n✅ difetto riprodotto — senza la festa 3D torna il riquadro di prima' : '\n✅ PASS — la vittoria si festeggia in 3D coi numeri veri, e «Salta» porta alla card') : '\n❌ FAIL');
process.exit(ok ? 0 : 1);
