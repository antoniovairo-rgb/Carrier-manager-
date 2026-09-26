#!/usr/bin/env node
/* [7.999.26 misura, collaudo PO «poche azioni dalla fascia, da calci d'angolo, punizioni; i rigori sono spariti negli highlights»]
   CENSIMENTO DELLE SCENE DELL'EROE PER ORIGINE, su partite VERE giocate dal pilota automatico (nessuna forzatura).
   Per ogni scena aperta registra intento (deriveIntent), stato del pallone (hlBallState), punto di partenza del pallone
   (hlBallSpot: hero/wing/mate/corner...) e se e' un calcio piazzato. Sola lettura. CPM_N = partite (default 4). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 4);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const all = [];
for (let k = 0; k < N; k++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CROSS26 = { tot: 0, daEroe: 0, versoEroe: 0, conRichiesta: 0, angoli: 0, angoliEroe: 0, dove: [] }; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
  await openMatch(page, port, { skipLoadAll: true, name: 'Origine' + k });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 9300 + k);
  const seen = new Set(); const t0 = Date.now();
  while (Date.now() - t0 < 260000) {
    const r = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); let s = null; try { s = window.__CPM_CURSIT && window.__CPM_CURSIT(); if (s) { const S = (typeof SITUATIONS !== 'undefined' ? SITUATIONS : window.__CPM_SITS)[s.gi]; if (S) { s.text = S.text; s.key = s.i + '#' + s.gi; s.o26 = (typeof _ORIG26 !== 'undefined' && _ORIG26 && _ORIG26.active) ? _ORIG26.kind : ''; s.ball = hlBallState(S); s.at = hlBallSpot(S, 70, 50).at; s.sp = (typeof isSetPieceSit === 'function' && isSetPieceSit(S)) ? 'piazzato' : (/rigore/i.test(S.text) ? 'rigore' : (/unizione/i.test(S.text) ? 'punizione' : (/angolo|corner/i.test(S.text) ? 'angolo' : ''))); } } } catch (e) {}
      return { ph, s }; }).catch(() => ({ ph: null }));
    if (r.ph === 'ended') break;
    if (r.ph && r.ph.startsWith('hl_') && r.s && !seen.has(r.s.key || r.s.text)) { seen.add(r.s.key || r.s.text); all.push({ m: k, ...r.s }); }
    await sleep(400);
  }
  try { console.log('cross del motore partita', k, JSON.stringify(await page.evaluate(() => window.__CPM_CROSS26))); } catch (e) {}
  await page.close();
}
await b.close(); srv.close();
const cnt = f => { const o = {}; for (const x of all) { const v = f(x); o[v] = (o[v] || 0) + 1; } return o; };
console.log(JSON.stringify(all.map(x => `${x.m}|${(x.text || '').slice(0, 34)}|${x.intent}|${x.ball}|${x.at}|${x.sp || ''}|${x.o26 || ''}`), null, 0));
console.log('scene', all.length, 'in', N, 'partite');
console.log('per intento', JSON.stringify(cnt(x => x.intent)));
console.log('per origine del pallone', JSON.stringify(cnt(x => x.at)));
console.log('calci piazzati', JSON.stringify(cnt(x => x.sp || 'gioco')));
console.log('origine dichiarata dal brain', JSON.stringify(cnt(x => x.o26 || 'nessuna')));
