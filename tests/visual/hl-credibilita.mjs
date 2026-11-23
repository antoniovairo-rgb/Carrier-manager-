#!/usr/bin/env node
/* SONDA — CREDIBILITA' DEGLI HIGHLIGHT (25/09, collaudo PO «passaggi e movimenti senza senso»). Solo misura, nessun giudizio.
   Flusso VERO (niente scene forzate), teatro acceso (__CPM_PRESENT), corpi procedurali per avere il tempo di scena vicino al reale.
   Campiona __CPM_STATE (22 + eroe + pallone, dalle mesh) e __CPM_ARC (voli del pallone) ogni ~120 ms nelle fasi hl_*.
   Uscita: out/hl-credibilita.json con i campioni grezzi; l'analisi la fa hl-credibilita-analisi.mjs. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'fs';
const N = +(process.env.CPM_PARTITE || 3), MS = +(process.env.CPM_MS || 150000);
/* [giro 331 · PO-610, per movimento-147] opzioni, tutte spente se non chieste (la sonda di prima resta uguale):
   CPM_K0=n            la prima partita e' la n-esima (nome e seme): per raccogliere altre partite in un secondo momento;
   CPM_IN_PAGINA=1     i campioni li prende un registratore DENTRO la pagina (ogni ~60 ms) e node li ritira: fra due campioni non c'e' piu' il
                       viaggio node↔pagina, che su un runner lento allungava l'intervallo e riduceva i campioni;
   CPM_FINO_FINE=1     la partita si segue fino al fischio finale (evento), CPM_MS diventa solo il tetto per non appendersi;
   CPM_DTREAL=1        arma __CPM_DTREAL: il tempo di scena segue l'orologio fino a 0,3 s per fotogramma (invece di 0,05). */
const K0 = +(process.env.CPM_K0 || 0), IN_PAG = !!process.env.CPM_IN_PAGINA, FINO_FINE = !!process.env.CPM_FINO_FINE, DTREAL = !!process.env.CPM_DTREAL;
const LEGGI = () => { try { const ph = window.__CPM_PHASE ? window.__CPM_PHASE() : null; if (!ph || !/^hl_/.test(ph)) return { ph };
      const s = window.__CPM_STATE(); const a = window.__CPM_ARC || null;
      return { ph, t: performance.now(), st: (typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null), c: s.clock, P: s.players.map(p => [p.team === 'home' ? 1 : p.team === 'away' ? 2 : 0, p.gk ? 1 : 0, p.x, p.y]), H: [s.hero.x, s.hero.y], B: [s.ball.x, s.ball.y, s.ball.worldY],
        arc: a && a.arc ? a.arc : null, ht: a ? a.ht : null, ek: a ? a.ek : null }; } catch (e) { return { err: String(e).slice(0, 80) }; } };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const tutte = [];
const esiti = [];
for (let k = K0; k < K0 + N; k++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (r) r.split(',').forEach(k => window[k] = 1); }, (process.env.CPM_ROSSO || '') + (DTREAL ? (process.env.CPM_ROSSO ? ',' : '') + '__CPM_DTREAL' : ''));
  if (process.env.CPM_VELOCITA) await page.addInitScript(v => { try { localStorage.setItem('cpm-match-speed', v); } catch (e) {} }, process.env.CPM_VELOCITA);/* [giro 331] 1 · 1.5 · 2: accorcia il gioco fluido fra un highlight e l'altro (gli highlight non cambiano) */
  await openMatch(page, port, { skipLoadAll: true, name: 'Credibile' + k });
  await page.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 500 + k * 37);
  const t0 = Date.now(); const camp = []; let fine = 'tetto';
  if (IN_PAG) { await page.evaluate((src) => { const leggi = (0, eval)('(' + src + ')'); window.__S331 = []; window.__S331iv = setInterval(() => { const f = leggi(); window.__S331ph = f && f.ph; if (f && f.t && window.__S331.length < 20000) window.__S331.push(f); }, 60); }, LEGGI.toString());
    while (Date.now() - t0 < (FINO_FINE ? Math.max(MS, 600000) : MS)) { await sleep(500);
      const r = await page.evaluate(() => { const a = window.__S331 || []; window.__S331 = []; return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, a }; }).catch(() => null); if (!r) continue;
      for (const f of r.a) camp.push(f); if (r.ph === 'ended') { fine = 'fischio'; break; } } }
  else while (Date.now() - t0 < MS) {
    const f = await page.evaluate(LEGGI);
    if (f && f.ph === 'ended') { fine = 'fischio'; break; }
    if (f && f.t) camp.push(f);
    await sleep(f && f.t ? 110 : 400);
  }
  esiti.push({ k, fine, s: Math.round((Date.now() - t0) / 1000) });
  console.log(`partita ${k}: ${camp.length} campioni negli highlight (${fine}, ${Math.round((Date.now() - t0) / 1000)} s)`);
  tutte.push(camp); await page.close();
}
await b.close(); srv.close();
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(process.env.CPM_OUT || 'out/hl-credibilita.json', JSON.stringify(tutte));
if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT + '.esiti.json', JSON.stringify(esiti));
console.log('scritto ' + (process.env.CPM_OUT || 'out/hl-credibilita.json'));
