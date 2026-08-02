#!/usr/bin/env node
/* [7.290.0 collaudo PO «le differenze reti sono sballate»]
   GUARDIANO DELLA CLASSIFICA DEL GIRONE EUROPEO. Le stime degli avversari decidevano PRIMA l'esito e POI,
   separatamente, i gol: una vittoria poteva risultare 2-7, un pareggio 3-8, una sconfitta 9-1. Nello
   screenshot: Marsiglia 1V·1N con differenza reti −2 e Torino 0V·1N·1S con +3, e la somma delle differenze
   del girone faceva −5 invece di 0. Qui si verificano le proprietà che un girone VERO non può violare:
     (1) ogni riga è internamente coerente — con V vittorie e P pareggi la differenza reti non può essere
         sotto (V·1 − S·N): in particolare 0 sconfitte ⇒ differenza ≥ V, e 0 vittorie ⇒ differenza ≤ −S;
     (2) il girone è un sistema CHIUSO: somma delle differenze reti = 0, gol fatti = gol subiti,
         vittorie totali = sconfitte totali;
     (3) tutti hanno giocato lo stesso numero di partite dell'eroe;
     (4) il risultato VERO dell'eroe compare specchiato nella riga di chi l'ha subito;
     (5) è deterministico.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node group-table-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; localStorage.setItem('cpm-intro-seen', '1'); });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForFunction(() => typeof window.euroGroupTable === 'function', null, { timeout: 60000 });

const CLUB = { id: 'rbl', n: 'FC Leipzig', a: 'FLZ', p: 84, nat: '🇩🇪', lg: 'Deutsche Liga' };
const OPPS = [{ id: 'mar', n: 'FC Marseille', a: 'MAR', p: 82, nat: '🇫🇷' },
  { id: 'avl', n: 'FC Aston', a: 'AST', p: 80, nat: '🏴' },
  { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 95, nat: '🇮🇹' }];

// i risultati VERI dell'eroe, come li scrive il gioco (hs/as dal suo punto di vista)
const RES = [{ opp: 'FC Marseille', hs: 1, as: 2 }, { opp: 'Torino Athletic', hs: 1, as: 1 },
  { opp: 'FC Aston', hs: 3, as: 0 }, { opp: 'FC Marseille', hs: 0, as: 0 },
  { opp: 'Torino Athletic', hs: 2, as: 4 }, { opp: 'FC Aston', hs: 1, as: 1 }];

const tabella = (n) => page.evaluate(([club, opps, res, k]) =>
  window.euroGroupTable({ competition: 'UCL', groupOpponents: opps, groupResults: res.slice(0, k) }, club),
[CLUB, OPPS, RES, n]);

for (const giocate of [1, 2, 3, 4, 6]) {
  const t = await tabella(giocate);
  const gio = (r) => r.w + r.d + r.l;
  console.log(`\n── dopo ${giocate} giornat${giocate === 1 ? 'a' : 'e'}`);
  for (const r of t) console.log(`   ${(r.fullName + '            ').slice(0, 18)} ${r.pts}pt  ${r.w}V·${r.d}N·${r.l}S  ${r.gf}:${r.ga}  DR ${(r.gf - r.ga > 0 ? '+' : '') + (r.gf - r.ga)}`);

  // (1) coerenza riga per riga
  for (const r of t) {
    const dr = r.gf - r.ga;
    if (r.l === 0 && dr < r.w) issues.push(`(1) ${r.fullName}: ${r.w}V·${r.d}N·0S ma differenza ${dr} (senza sconfitte non può essere sotto +${r.w})`);
    if (r.w === 0 && dr > -r.l) issues.push(`(1) ${r.fullName}: 0V·${r.d}N·${r.l}S ma differenza ${dr} (senza vittorie non può superare −${r.l})`);
    if (r.d === gio(r) && dr !== 0) issues.push(`(1) ${r.fullName}: tutti pareggi ma differenza ${dr}`);
  }
  // (2) sistema chiuso
  const sDR = t.reduce((s, r) => s + r.gf - r.ga, 0);
  const sGF = t.reduce((s, r) => s + r.gf, 0), sGA = t.reduce((s, r) => s + r.ga, 0);
  const sW = t.reduce((s, r) => s + r.w, 0), sL = t.reduce((s, r) => s + r.l, 0), sD = t.reduce((s, r) => s + r.d, 0);
  console.log(`   Σ differenze ${sDR} · Σ gol ${sGF}:${sGA} · ${sW}V ${sD}N ${sL}S`);
  if (sDR !== 0) issues.push(`(2) somma delle differenze reti ${sDR} invece di 0 (a ${giocate} giornate)`);
  if (sGF !== sGA) issues.push(`(2) gol fatti ${sGF} ≠ gol subiti ${sGA}`);
  if (sW !== sL) issues.push(`(2) ${sW} vittorie contro ${sL} sconfitte`);
  if (sD % 2 !== 0) issues.push(`(2) ${sD} pareggi: un pareggio vale per DUE squadre, il totale non può essere dispari`);
  // (3) stesse partite per tutti
  const gg = t.map(gio);
  if (new Set(gg).size !== 1 || gg[0] !== giocate) issues.push(`(3) partite giocate disallineate: ${gg.join('/')} contro ${giocate} attese`);
}

// (2b) la quota di PAREGGI su un campione grande — un girone di soli pareggi non è un girone.
// (⚠️ va misurata su tante partite: su sei incontri il 50% è puro rumore, non un difetto)
{
  const q = await page.evaluate(([club, opps]) => {
    let V = 0, X = 0;
    for (let g = 0; g < 120; g++) {
      const oo = opps.map((o, i) => ({ ...o, id: o.id + '_' + g, p: 68 + ((g * 7 + i * 13) % 28) }));
      const res = Array.from({ length: 6 }, (_, k) => ({ opp: oo[k % 3].n, hs: 1, as: 1 }));
      const t = window.euroGroupTable({ competition: 'UCL', groupOpponents: oo, groupResults: res }, club);
      // le 6 gare dell'eroe sono tutte pareggi FINTI del test: si contano solo quelle SIMULATE fra avversari
      const sW = t.reduce((s, r) => s + r.w, 0), sD = t.reduce((s, r) => s + r.d, 0);
      V += sW;              // ogni vittoria = una partita decisa (tutte simulate, l'eroe pareggia sempre qui)
      X += sD / 2 - 6;      // meno i 12 mezzi-pareggi dell'eroe e dei suoi avversari
    }
    return { V, X };
  }, [CLUB, OPPS]);
  const tot = q.V + q.X, quota = tot ? q.X / tot : 0;
  console.log(`\n(2b) su ${tot} partite simulate fra avversari: ${Math.round(quota * 100)}% di pareggi`);
  if (quota > 0.42) issues.push(`(2b) ${Math.round(quota * 100)}% di pareggi: il sorteggio dei gol è collassato (avalanche mancante?)`);
  if (quota < 0.10) issues.push(`(2b) solo ${Math.round(quota * 100)}% di pareggi: distribuzione non calcistica`);
}

// (4) il risultato vero dell'eroe si specchia su chi l'ha subito
{
  const t = await tabella(3);
  const io = t.find(r => r.isPlayer), aston = t.find(r => /Aston/.test(r.fullName));
  // 1-2, 1-1, 3-0 → eroe 5:3 ; Aston ha subito il 3-0 → almeno 3 gol al passivo e una sconfitta
  console.log(`\n(4) eroe ${io.gf}:${io.ga} · Aston (battuto 3-0 dall'eroe) ${aston.gf}:${aston.ga} con ${aston.l} sconfitt${aston.l === 1 ? 'a' : 'e'}`);
  if (io.gf !== 5 || io.ga !== 3) issues.push(`(4) la riga dell'eroe non riflette i risultati veri (${io.gf}:${io.ga} invece di 5:3)`);
  if (aston.ga < 3 || aston.l < 1) issues.push('(4) chi ha perso 0-3 contro l\'eroe non ha quella sconfitta in classifica');
}

// (5) determinismo
{
  const a = JSON.stringify(await tabella(4)), b = JSON.stringify(await tabella(4));
  console.log(`(5) due letture identiche: ${a === b}`);
  if (a !== b) issues.push('(5) la classifica del girone non è deterministica');
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — il girone torna: righe coerenti, somme a zero, stesse partite per tutti');
