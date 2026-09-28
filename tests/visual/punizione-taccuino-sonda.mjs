#!/usr/bin/env node
/* [7.999.45 sonda — taccuino PO su 7.999.44 vs Portogallo]
   SIT #13 «Punizione — Bordata potente», gol: «SALTO del pallone di 20,6 u in 39 ms a x 50,6, a 5,7 s dall'inizio scena, scrittore —:
   non si vede la traiettoria, sparisce e ricompare in porta». SIT #78 «Punizione — Giro sopra la barriera», parata: «il portiere non si
   tuffa o la respinge» (codici 111, 000).
   Partita vera col pilota automatico; si chiede al motore una punizione dal limite con l'eroe battitore; in scelta si prende l'azione il
   cui testo contiene CPM_AZ (default «Bordata»), esito CPM_ESITO (success|fail). Registra a ogni fotogramma lo scrittore del pallone
   (__CPM_WS38 = [t ms, codice, x, z, inScena]) e, per il portiere, il gesto (__CPM_GK45 se presente). Stampa: salti oltre 60 u/s x dt + 3 u
   in hl_result con lo scrittore prima e dopo, e dove finisce il pallone. CPM_GLB=1 corpi accesi. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const X = +(process.env.CPM_X || 78), Y = +(process.env.CPM_Y || 44), GLB = process.env.CPM_GLB === '1';
const AZ = process.env.CPM_AZ || 'fk_power', ESITO = process.env.CPM_ESITO || 'success';
const WS = ["—","scena","arco","inseguitore","portatore","addosso","palo","respinta","ricevente-cross","ricevente-pass","consegna","buildup-aereo","buildup-fine","buildup-volo","testa"];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const E = []; page.on('pageerror', e => E.push(e.message));
await page.addInitScript(o => { if (!o.glb) window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__CPM_GK45_REC = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, { glb: GLB });
if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
await openMatch(page, port, { skipLoadAll: true, name: process.env.CPM_NOME || 'Punizione45' });
if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 8181, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now(); let chiesto = false, risolto = null, visto = false; let azioni = null;
while (Date.now() - t0 < 180000) {
  const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  if (!chiesto && Date.now() - t0 > 12000 && ph === 'playing') {
    chiesto = await page.evaluate(o => { try { window.__CPM_WS38 = []; window.__CPM_WS38_REC = 1; window.__CPM_MOTORE_OBJ().chiedi.piazzato({ kind: 'foul', x: o.x, y: o.y, lato: 'home', batt: 21, hold: 6 }); return true; } catch (e) { return false; } }, { x: X, y: Y });
  }
  if (chiesto && /^hl/.test(ph || '')) {
    visto = true;
    if (ph === 'hl_choose' && risolto == null) {
      await page.evaluate(() => window.__CPM_AUTOPLAY(false)).catch(() => {});
      await sleep(900);
      const r = await page.evaluate(o => { try { const q = window.__CPM_CURSIT(); const acts = (q.actions || []).map(a => a.label || a.l || a.text || String(a[0] || ''));
        window.__CPM_WS38 = []; window.__CPM_DIVE465 = []; window.__CPM_WS38_T0 = performance.now(); window.__CPM_FORCE_OUTCOME = o.es; const r = window.__CPM_SETPIECE(o.az); return { i: r && (r.ok || r.err), acts: r && r.ids, sit: String(q.t || '') }; } catch (e) { return { err: String(e) }; } }, { az: AZ, es: ESITO });
      risolto = r; azioni = r;
    }
  }
  if (risolto && visto && ph && !/^hl/.test(ph)) break;
  await sleep(150);
}
const W = await page.evaluate(() => ({ ws: window.__CPM_WS38 || [], t0: window.__CPM_WS38_T0 || 0, gk: window.__CPM_DIVE465 || null, esito: window.__CPM_LASTOUT || null })).catch(() => ({ ws: [] }));
await b.close(); srv.close();
if (!risolto) { console.log('❌ nessuna punizione aperta/risolta'); process.exit(2); }
console.log(`scena: «${(azioni.sit || '').slice(0, 60)}» · azioni ${JSON.stringify(azioni.acts)} · scelta ${azioni.i} · esito forzato ${ESITO}`);
const R = W.ws.filter(w => w[0] >= W.t0);
let salti = [];
for (let i = 1; i < R.length; i++) { const a = R[i - 1], c = R[i]; const dt = (c[0] - a[0]) / 1000; const dd = Math.hypot(c[2] - a[2], c[3] - a[3]);
  if (dd > 60 * dt + 3) salti.push({ t: +((c[0] - W.t0) / 1000).toFixed(2), dt: Math.round(dt * 1000), d: +dd.toFixed(1), da: WS[a[1]] || a[1], a: WS[c[1]] || c[1], p0: [+a[2].toFixed(1), +a[3].toFixed(1)], p1: [+c[2].toFixed(1), +c[3].toFixed(1)], scena: c[4] }); }
console.log(`fotogrammi dopo la scelta ${R.length} · salti ${salti.length}`);
for (const s of salti) console.log('  SALTO ' + JSON.stringify(s));
const ult = R.slice(-1)[0]; if (ult) console.log(`pallone all'ultimo campione: x ${ult[2].toFixed(1)} z ${ult[3].toFixed(1)} (${WS[ult[1]]})`);
if (process.env.CPM_DUMP) console.log(R.map(w => `${((w[0] - W.t0) / 1000).toFixed(2)}:${WS[w[1]] || w[1]}:${w[2].toFixed(1)},${w[3].toFixed(1)}${w[4] ? '' : ':fuori'}`).join(' '));
const sc = {}; R.forEach(w => { const k = WS[w[1]] || w[1]; sc[k] = (sc[k] || 0) + 1; }); console.log('scrittori: ' + JSON.stringify(sc));
if (W.gk && W.gk.length) { const G = W.gk.filter(g => g.t >= W.t0); const mx = Math.max(...G.map(g => g.ext));
  const a = G.find(g => g.ext > 0.5); const fin = G[G.length - 1];
  console.log(`portiere: ${G.length} fotogrammi di tuffo · estensione massima ${mx.toFixed(2)} · meta' estensione a ${a ? ((a.t - W.t0) / 1000).toFixed(2) + ' s (palla x ' + a.bx + ', arco ' + a.arcT + ')' : 'mai'} · z portiere ${G[0].z0}→${fin.gz} (bersaglio ${fin.tz}) · palla z ${fin.bz} y ${fin.by}`); }
else console.log('portiere: NESSUN fotogramma di tuffo (__CPM_DIVE465 vuoto)');
if (E.length) console.log('errori pagina: ' + E.slice(0, 3).join(' | '));
