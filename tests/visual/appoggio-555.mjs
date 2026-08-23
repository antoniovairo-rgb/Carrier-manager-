#!/usr/bin/env node
/* MISSIONE — «IL PADRONE E' SOLO». Il 23 agosto la baseline della fase 1 ha tirato fuori il numero che
   nessun collaudo aveva mai nominato: all'apertura della scena il pallone dista 13,9 m di mediana dal
   compagno piu' vicino, ESCLUSO chi ce l'ha (p90 30 m, peggiore 48,8). Nel calcio vero e' la distanza a
   cui NON si gioca: niente scarico, niente uno-due, niente triangolo. Da fuori e' il girotondo.
   Qui si misura l'APPOGGIO: quanti compagni stanno a distanza di passaggio dal portatore, e a che
   distanza sono il primo, il secondo e il terzo. Due contesti, perche' il difetto puo' vivere in uno solo:
   (a) all'apertura delle scene di highlight · (b) durante la cronaca, in partita vera.
     CPM_CHROME=... node appoggio-555.mjs [CPM_N=50] [CPM_MS=90000]                                     */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 50);
const MS = +(process.env.CPM_MS || 90000);
const VICINO = +(process.env.CPM_VICINO || 12);   /* raggio di passaggio corto, in metri */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();

const MISURA = () => {
  const S = window.__CPM_STATE && window.__CPM_STATE(); if (!S || !S.ball) return null;
  const bx = S.ball.x, by = S.ball.y;
  const nostri = [];
  for (const p of (S.players || [])) { if (p.gk || p.team !== 'home') continue; nostri.push(Math.hypot(p.x - bx, p.y - by)); }
  if (S.hero) nostri.push(Math.hypot(S.hero.x - bx, S.hero.y - by));
  nostri.sort((a, c) => a - c);
  if (nostri.length < 4) return null;
  return { d1: +nostri[1].toFixed(1), d2: +nostri[2].toFixed(1), d3: +nostri[3].toFixed(1), vicini: nostri.slice(1).filter(d => d <= 12).length };
};

/* (a) apertura delle scene */
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; });
const { total } = await openMatch(page, port); await sleep(500);
const scene = [], tardi = [];
const passo = Math.max(1, Math.floor(total / N));
for (let gi = 0; gi < total; gi += passo) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(300);
  const r = await page.evaluate(MISURA); if (r) scene.push(r);
  await sleep(1300);
  const r2 = await page.evaluate(MISURA); if (r2) tardi.push(r2);
}
await page.close();

/* (b) cronaca, partita vera */
const p2 = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(p2);
await p2.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_APP = []; });
await openMatch(p2, port, { skipLoadAll: true, name: 'App' });
await p2.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 9100, policy: 'seeded', tickMs: 300 }));
const cron = [];
const t0 = Date.now();
while (Date.now() - t0 < MS) { await sleep(400); const r = await p2.evaluate(MISURA); if (r) cron.push(r); }
await p2.close();
srv.close(); await b.close();

const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const p90 = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length * 0.9)] : NaN; };
const stampa = (nome, R) => {
  if (!R.length) { console.log(`\n  ${nome}: nessun campione`); return; }
  console.log(`\n  === ${nome} — ${R.length} campioni ===`);
  console.log(`  1º compagno dopo il portatore : mediana ${med(R.map(r => r.d1)).toFixed(1)} m · p90 ${p90(R.map(r => r.d1)).toFixed(1)} m`);
  console.log(`  2º                            : mediana ${med(R.map(r => r.d2)).toFixed(1)} m`);
  console.log(`  3º                            : mediana ${med(R.map(r => r.d3)).toFixed(1)} m`);
  const v = R.map(r => r.vicini);
  console.log(`  compagni entro ${VICINO} m dal pallone : mediana ${med(v)} · nessuno in ${(100 * v.filter(x => x === 0).length / R.length).toFixed(0)}% dei campioni`);
};
console.log(`\n=== L'APPOGGIO — quanti compagni sono giocabili dal portatore ===`);
stampa("APERTURA DELLE SCENE", scene);
stampa("APERTURA + 1,6 s (i giocatori hanno camminato)", tardi);
stampa("CRONACA, PARTITA VERA", cron);
console.log(`\n  Riferimento del calcio vero: con la palla in gioco un compagno sta quasi sempre entro 10-15 m,`);
console.log(`  e due o tre sono giocabili. Un solo appoggio a 14 m non e' una squadra: e' un uomo e venti figuranti.`);
console.log('\n⚠️ una unità ≈ un metro. Baseline: nessun rimedio in questa misura.');
