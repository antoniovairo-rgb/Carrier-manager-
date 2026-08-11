#!/usr/bin/env node
/* [7.412.0] GUARDIANO — LA VITA DELL'EROE NON SI RIPETE
   (evolutiva PO «VITA DELL'EROE», requisito fondamentale: «il giocatore deve pensare "chissà cosa
    succede stavolta" e mai "ancora questa roba?"»)

   COSA MISURA: tre stagioni simulate col MOTORE VERO (pickVitaEvent/markVitaEvent esposti dalla
   pagina), RNG seedato per riproducibilita'. Verifica le promesse:
     · gli eventi UNICI capitano al massimo una volta in carriera;
     · i RARI al massimo due volte;
     · nessun evento torna prima del suo cooldown;
     · mai piu' di due eventi consecutivi della stessa categoria;
     · la copertura resta ampia (almeno 10 eventi distinti in tre stagioni);
     · [7.413.0] almeno un evento UNICO appare (il punto cieco del 7.412: erano tutti morti).
   PROVA DEL ROSSO: con --senza-cooldown il motore ignora visto/cooldown (interruttore test
   __CPM_VITA_NOCD) e il guardiano DEVE fallire — se non fallisce, non sta misurando niente.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node vita-variety-test.mjs [--senza-cooldown]          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const NOCD = process.argv.includes('--senza-cooldown');
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(n => { if (n) window.__CPM_VITA_NOCD = 1; }, NOCD);
await openMatch(page, port); await sleep(900);

const R = await page.evaluate(() => {
  if (!window.pickVitaEvent || !window.VITA_EVENTS) return { err: 'motore non esposto' };
  /* RNG seedato: la simulazione e' riproducibile */
  let s = 424242; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const _mr = Math.random; Math.random = rnd;
  let p = { name: 'Eroe Test', season: 1, week: 1, goals: 0, popularity: 20, bank: 5000, salary: 12,
    form: 65, morale: 70, coachTrust: 60, ovr: 70, chem: 50, club: { n: 'Testolonia' } };
  const fired = [];
  for (let sn = 1; sn <= 3; sn++) {
    p.season = sn; if (sn === 2) p.agent = { name: 'Sarto' };
    for (let wk = 1; wk <= 38; wk++) {
      p.week = wk;
      p.goals += (rnd() < 0.35 ? 1 : 0); p.popularity = Math.min(85, p.popularity + 0.35);
      p.bank += p.salary * 900; p.form = 40 + Math.round(rnd() * 50);
      const due = p.vitaNext && p.vitaNext.id && ((sn * 100 + wk) >= (p.vitaNext.at || 0));
      if (rnd() < 0.15 || due) {
        const r = window.pickVitaEvent(p);
        if (r && r.ev) {
          fired.push({ id: r.ev.id, cat: r.ev.cat, r: r.ev.r || 'c', at: sn * 100 + wk, chain: !!r.chain });
          const mk = window.markVitaEvent(p, r.ev); p = { ...p, ...mk };
          if (r.ev.ef && r.ev.ef.bank) p.bank = Math.max(0, p.bank + r.ev.ef.bank);
        }
      }
    }
  }
  Math.random = _mr;
  return { fired, nPool: window.VITA_EVENTS.length };
});
await b.close(); srv.close();

if (R.err) { console.log('❌ FAIL — ' + R.err); process.exit(2); }
const F = R.fired, guasti = [];
const per = {}; F.forEach(f => { (per[f.id] = per[f.id] || []).push(f.at); });
const CD = { c: 8, r: 25, u: 99999 }, MAXN = { c: 99, r: 2, u: 1 };
for (const [id, ats] of Object.entries(per)) {
  const ev = F.find(f => f.id === id), lim = MAXN[ev.r], cd = CD[ev.r];
  if (ats.length > lim && !F.some(f => f.id === id && f.chain)) guasti.push(`${id} [${ev.r}] apparso ${ats.length} volte (max ${lim})`);
  for (let i = 1; i < ats.length; i++) if (ats[i] - ats[i - 1] < cd) { guasti.push(`${id} [${ev.r}] tornato dopo ${ats[i] - ats[i - 1]} settimane (cooldown ${cd})`); break; }
}
let run = 1; for (let i = 1; i < F.length; i++) { run = (F[i].cat === F[i - 1].cat) ? run + 1 : 1;
  if (run > 2) { guasti.push(`tre eventi consecutivi della categoria «${F[i].cat}»`); break; } }
const distinct = Object.keys(per).length;
if (distinct < 10) guasti.push(`solo ${distinct} eventi distinti in tre stagioni: la carriera sa di poco`);
/* [7.413.0] il punto cieco scoperto dal test massivo: questo guardiano era VERDE con gli eventi
   UNICI morti (il cooldown u=99999 confrontato con l'at di default -9999 li escludeva PER SEMPRE
   dal pool — 0 unici in 120 stagioni su 20 semi). Gli unici sono i gioielli del pool: almeno uno
   deve apparire in tre stagioni, o la promessa «momenti irripetibili» e' carta. */
if (!NOCD && F.filter(f => f.r === 'u').length < 1) guasti.push('nessun evento UNICO in tre stagioni: i gioielli del pool sono morti');
if (F.length < 8) guasti.push(`solo ${F.length} eventi in tre stagioni: il contorno e' sparito`);
if (F.length > 45) guasti.push(`${F.length} eventi in tre stagioni: il contorno e' diventato il piatto`);

console.log(`eventi in tre stagioni: ${F.length} · distinti ${distinct}/${R.nPool} · unici usati ${F.filter(f => f.r === 'u').length} · rari ${F.filter(f => f.r === 'r').length} · catene ${F.filter(f => f.chain).length}`);
console.log('sequenza: ' + F.map(f => f.id.replace('vita_', '')).join(' → '));
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log('\n✅ PASS — la vita dell\'eroe e\' varia: niente «ancora questa roba?»');
