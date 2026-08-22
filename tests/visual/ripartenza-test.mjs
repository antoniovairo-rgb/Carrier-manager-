#!/usr/bin/env node
/* GUARDIANO — DOPO UN GOL SI RIPARTE DAL CENTRO (7.544.0).
   Direttiva PO: «dopo un gol i giocatori devono rientrare verso il centrocampo, disporsi nuovamente e
   riprendere il gioco dalla propria metà campo, invece di continuare con movimenti scollegati».
   Difetto misurato: il PALLONE tornava al centro (7.525) ma i ventidue no — continuavano a inseguire lo
   slot TRASLATO con la palla, con guadagno 0,04 ogni tre tick: ~25 minuti di gioco per ritrovare posizione.
   Qui si guarda il momento della ripresa: quanti uomini stanno nella PROPRIA metà campo e quanto lontano
   sono dalla loro posizione di schieramento. Sorgente unica (le mesh: quello che l'utente vede).
   PROVA DEL ROSSO: CPM_ROSSO=1 → __CPM_NO567 (nessuno schieramento, comportamento pre-7.544). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 3);
const MIN_MEZZO = +(process.env.CPM_MEZZO || 8);   /* su 10 di movimento per lato, quanti nella propria metà */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript((r) => {
    window.__CPM_GLB = false; if (r) window.__CPM_NO567 = 1;
    window.__CPM_RIP = []; window.__CPM_KOC = {};
    /* si campiona in continuo; le riprese si riconoscono dal pallone fermo al centro */
    setInterval(() => { try {
      const s = window.__CPM_STATE && window.__CPM_STATE(); if (!s || s.phase !== 'playing') return;
      if (!(window.__CPM_KO544 && window.__CPM_KO544())) return;/* [7.544.0] la FINESTRA vera del calcio d’inizio: filtrare su «palla vicino al centro» contava 35 riprese in due partite (i gol sono 3-4) — misurava il gioco normale che passa dal cerchio */
      const p = (s.players || []).filter(q => q && q.team !== 'ref' && !q.gk).concat(s.hero ? [s.hero] : []);
      if (p.length < 15) return;
      const casa = p.filter(q => q.team === 'home'), osp = p.filter(q => q.team !== 'home');
      const R = window.__CPM_RIP, u = R[R.length - 1];
      if (u && u.c === s.clock) return;
      /* [7.544.0] DUE SORGENTI, DI PROPOSITO: le MESH (cio' che l'utente vede) e l'array LOGICO
         `matchPlayers` (cio' che lo schieramento scrive). Se il logico e' schierato e la mesh no, il
         colpevole e' il renderer, non la logica — ed e' l'unico modo di saperlo senza tentare a caso. */
      const L = (window.__CPM_MP && window.__CPM_MP()) || [];
      const lc = L.filter(q => q && q.t === 'home' && !q.gk), lo = L.filter(q => q && q.t === 'away' && !q.gk);
      R.push({ c: s.clock,
        casaMeta: casa.filter(q => q.x <= 52).length, casaN: casa.length,
        ospMeta: osp.filter(q => q.x >= 48).length, ospN: osp.length,
        logCasa: lc.length ? lc.filter(q => q.x <= 52).length : null, logCasaN: lc.length,
        logOsp: lo.length ? lo.filter(q => q.x >= 48).length : null, logOspN: lo.length });
    } catch (e) {} }, 150);
  }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Rip' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 8100 + i * 23);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => window.__CPM_RIP || []));
  console.log('  · esecuzioni del blocco schieramento:', JSON.stringify(await page.evaluate(() => window.__CPM_KOC || {})));
  await page.close();
}
srv.close(); await b.close();
const S = tutte.flat();
if (S.length < 6) { console.log('nessuna ripresa dal centro osservata:', S.length); process.exit(1); }
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const mc = med(S.map(q => q.casaMeta)), mo = med(S.map(q => q.ospMeta));
const okC = S.filter(q => q.casaMeta >= MIN_MEZZO).length, okO = S.filter(q => q.ospMeta >= MIN_MEZZO).length;
console.log(`riprese dal centro osservate: ${S.length} su ${tutte.length} partite`);
console.log(`  uomini di CASA nella propria metà : mediana ${mc}/${S[0].casaN}  ·  riprese schierate ${okC}/${S.length}`);
console.log(`  uomini OSPITI nella propria metà  : mediana ${mo}/${S[0].ospN}  ·  riprese schierate ${okO}/${S.length}`);
const quota = (okC + okO) / (S.length * 2);
console.log(`  quota di riprese con la squadra schierata: ${(quota * 100).toFixed(0)}%  (soglia ≥80%)`);
const cl = S.filter(q => q.logCasa != null);
if (cl.length) console.log(`  → LOGICO (matchPlayers): casa ${med(cl.map(q => q.logCasa))}/${cl[0].logCasaN} · ospiti ${med(cl.map(q => q.logOsp))}/${cl[0].logOspN}   ← se qui sono schierati e sopra no, il colpevole è il renderer`);
if (ROSSO) {
  if (quota < 0.8) { console.log('\n🔴 ROSSO CONFERMATO: senza schieramento le squadre non rientrano'); process.exit(0); }
  console.log('\n❌ il rosso non si riproduce: il guardiano non dimostra niente'); process.exit(1);
}
if (quota < 0.8) { console.log('\n❌ alla ripresa le squadre non sono nella propria metà campo'); process.exit(1); }
console.log('\n✅ dopo il gol si rientra, ci si schiera e si riparte dal centro');
