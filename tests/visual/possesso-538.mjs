#!/usr/bin/env node
/* 7.538 — MISURA DEL POSSESSO AMBIENTALE, strumento rifatto (missione «partita vera»).
   Il campionatore del 7.537 era inaffidabile e l'ho dichiarato: varianza troppo alta (fascia centrale
   fra 80% e 93% sugli stessi giri). Due difetti, entrambi dello STRUMENTO:
   (1) DUE SORGENTI — palla dalle mesh, giocatori da `matchPlayers` (logico): il 7.322 ha misurato scarti
       di 15-20u fra le due, quindi «palla senza padrone» misurava soprattutto quello scarto.
       Ora si legge `__CPM_OWN()`, una sola sorgente (mesh) per palla, ventidue ed eroe.
   (2) CAMPIONE A OROLOGIO su una partita accelerata: giri diversi coprivano minuti di gioco diversi.
       Ora si campiona per MINUTO DI GIOCO (un campione per minuto nuovo del clock), quindi ogni partita
       pesa 90 minuti esatti e i giri sono confrontabili.
   Stampa mediana e dispersione fra partite, non un numero solo: una soglia si giudica su una
   distribuzione. Seed FISSI (nome del profilo incluso: il nome entra nel seed di partita, 7.496). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const PARTITE = +(process.env.CPM_PARTITE || 3);
const ROSSO = !!process.env.CPM_ROSSO;   /* CPM_ROSSO=1 → __CPM_NO553: taratura «a secondi» pre-7.538 (braccio di confronto) */
const RAGGIO = 2.5;                       // «ce l'ha lui» = entro 2,5u (≈2,5 metri di gioco)
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const giri = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript((r) => {
    window.__CPM_GLB = false; if (r) window.__CPM_NO553 = 1;
    window.__CPM_POSS = { sam: [] };
    setInterval(() => { try {
      const o = window.__CPM_OWN && window.__CPM_OWN(); if (!o) return;
      const S = window.__CPM_POSS.sam, last = S[S.length - 1];
      if (last && last.c === o.c) return;          // un campione per MINUTO DI GIOCO (qualunque fase)
      S.push(o);
    } catch (e) {} }, 120);
  }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Poss' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 3100 + i * 31);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(600); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  giri.push(await page.evaluate(() => (window.__CPM_POSS || {}).sam || []));
  await page.close();
}
srv.close(); await b.close();

const fmt = (a) => { const v = a.slice().sort((x, y) => x - y); return `${v[Math.floor(v.length / 2)].toFixed(0)} (${v[0].toFixed(0)}-${v[v.length - 1].toFixed(0)})`; };
const centro = [], senza = [], uomini = [], viaggio = [], cambi = [], staz = [];
const isto = [0, 0, 0, 0, 0]; let istoN = 0;
for (const G of giri) {
  /* i minuti passati DENTRO un highlight non parlano del possesso ambientale: si escludono qui, ma si
     dichiara quanti erano — se un giro copre pochi minuti di gioco vivo la sua percentuale non vale
     niente (la prima stesura ne includeva uno da 22 minuti e la mediana ne usciva falsata). */
  const S = G.filter(q => q.ph === 'playing');
  const cov = G.length ? `${S.length}/${G.length} min` : '0';
  if (S.length < 55) { console.log(`⚠️ giro SCARTATO: solo ${cov} di gioco vivo — percentuale non giudicabile`); continue; }
  centro.push(S.filter(q => q.x >= 35 && q.x <= 65).length / S.length * 100);
  senza.push(S.filter(q => q.d > RAGGIO).length / S.length * 100);
  uomini.push(new Set(S.filter(q => q.d <= RAGGIO).map(q => q.i)).size);
  let v = 0; for (let k = 1; k < S.length; k++) v += Math.hypot(S[k].x - S[k - 1].x, S[k].y - S[k - 1].y);
  viaggio.push(v);
  for (const q of S) { const k = Math.min(4, Math.max(0, Math.floor(q.x / 20))); isto[k]++; istoN++; }
  let cb = 0, prev = null, run = 0, runs = [];
  for (const q of S) { const w = q.d <= RAGGIO ? q.i : null; if (w !== prev) { if (prev != null) runs.push(run); if (w != null && prev != null) cb++; prev = w; run = 1; } else run++; }
  if (prev != null) runs.push(run);
  cambi.push(cb); staz.push(runs.length ? runs.reduce((a, c) => a + c, 0) / runs.length : 0);
}
if (!centro.length) { console.log('nessun giro utilizzabile'); process.exit(1); }
console.log(`partite valide: ${centro.length}/${giri.length} · minuti di gioco vivo per partita: ${giri.map(g => g.filter(q => q.ph === 'playing').length).join(', ')} su ${giri.map(g => g.length).join(', ')}`);
console.log(`  palla in fascia centrale (x35-65) : ${fmt(centro)}%      obiettivo ≤60`);
console.log(`  palla senza padrone (>${RAGGIO}u)      : ${fmt(senza)}%      obiettivo ≤40`);
console.log(`  uomini diversi che toccano palla  : ${fmt(uomini)}/22     obiettivo ≥15`);
console.log(`  cambi di portatore in 90'         : ${fmt(cambi)}        obiettivo ≥15`);
console.log(`  minuti consecutivi sullo stesso   : ${fmt(staz)}`);
console.log(`  viaggio della palla               : ${fmt(viaggio)}u`);
console.log(`  dove vive la palla (quinti del campo, difesa→attacco): ${isto.map(v => (v / istoN * 100).toFixed(0) + '%').join(' · ')}`);
