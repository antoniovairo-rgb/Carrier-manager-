#!/usr/bin/env node
/* [PO-303 · decisione PO «Sì, dalla 179 in poi»] GUARDIANO DELLO STORICO DEL PATRIMONIO.
   A) REGISTRO: il chokepoint dell'economia (weeklyEconomyFields, lo stesso per i tre path della settimana) a fine settimana 4/8/12...
      aggiunge {s,w,v} a player.patrimonio303 col patrimonio aggiornato; nelle altre settimane non aggiunge nulla; rieseguito sulla stessa
      settimana non duplica; tetto 36 punti.
   B) MIGRAZIONE: un salvataggio vecchio senza il campo si apre con la serie VUOTA (nessun mese inventato) e la migrazione e' idempotente.
   C) UFFICIO (telefono 412x915 e PC 1440x900, banco V2): con 6 mesi registrati ci sono 6 barre, l'ultima verde (#4ade80), la differenza
      «nell'ultimo mese» col segno giusto; con la serie vuota c'e' la frase dello storico che parte, nessuna barra; contrasto >= 4,5:1.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_PATR303 e pretende che A e C cadano. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
import { MISURA } from './lib/misura-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port;
const A = [], B = [], Cc = [], errs = [];
const SERIE = 'p.patrimonio303=[{s:11,w:28,v:1200000},{s:11,w:32,v:1350000},{s:11,w:36,v:1300000},{s:12,w:4,v:1500000},{s:12,w:8,v:1620000},{s:12,w:12,v:1800000}];p.bankBalance=1800000;';
for (const f of [{ k: 'tel', w: 412, h: 915, touch: true }, { k: 'pc', w: 1440, h: 900, touch: false }]) {
  for (const prep of [SERIE, 'p.patrimonio303=[];']) {
    const { ctx, page } = await apriBancoV2(b, port, f, { errs, prep });
    if (!page) { Cc.push(f.k + ': banco non raggiunto'); continue; }
    if (ROSSO) await page.evaluate(() => { window.__CPM_NO_PATR303 = true; });
    if (f.k === 'tel' && prep === SERIE) {
      /* A e B: sulla pagina viva, con le funzioni vere */
      const r = await page.evaluate(() => { const C = window.__CPM_CAREER, base = { proStatus: 'pro', season: 3, week: 8, bankBalance: 500000, contract: { wage: 20000 }, patrimonio303: [{ s: 3, w: 4, v: 400000 }] };
        const e8 = C.weeklyEconomyFields(base), e9 = C.weeklyEconomyFields({ ...base, week: 9 }), e8b = C.weeklyEconomyFields({ ...base, ...e8 });
        const lungo = C.weeklyEconomyFields({ ...base, week: 40, patrimonio303: Array.from({ length: 36 }, (_, i) => ({ s: 1, w: 4 * (i + 1), v: i })) });
        const m1 = window.__CPM_MIGRATE({ name: 'Vecchio', season: 4, week: 7, proStatus: 'pro', bankBalance: 777000 }); const p1 = m1.player || m1; const m2 = window.__CPM_MIGRATE(p1); const p2 = m2.player || m2;
        return { e8: typeof e8 === 'string' ? e8 : { bank: e8.bankBalance, serie: e8.patrimonio303 }, e9: e9 && e9.patrimonio303, e8b: e8b && e8b.patrimonio303, lungo: lungo && lungo.patrimonio303 && lungo.patrimonio303.length,
          mig: p1 && p1.patrimonio303, mig2: p2 && JSON.stringify(p2.patrimonio303) === JSON.stringify(p1.patrimonio303) }; });
      console.log('  A/B ' + JSON.stringify(r).slice(0, 400));
      if (typeof r.e8 === 'string') A.push('A: ' + r.e8);
      else { const u = r.e8.serie && r.e8.serie[r.e8.serie.length - 1];
        if (!r.e8.serie || r.e8.serie.length !== 2 || !u || u.s !== 3 || u.w !== 8 || u.v !== r.e8.bank) A.push('A: a fine settimana 8 il punto non e\' registrato col patrimonio aggiornato ' + JSON.stringify(r.e8));
        if (r.e9) A.push('A: in settimana 9 (non di fine mese) e\' stato aggiunto un punto');
        if (r.e8b) A.push('A: rieseguito sulla stessa settimana duplica il punto');
        if (r.lungo !== 36) A.push('A: tetto di 36 punti non rispettato (' + r.lungo + ')'); }
      if (!Array.isArray(r.mig) || r.mig.length) B.push('B: il salvataggio vecchio non parte con la serie vuota (' + JSON.stringify(r.mig) + ')');
      if (!r.mig2) B.push('B: migrazione non idempotente');
    }
    await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(1500);
    const u = await page.evaluate(() => { const g = document.querySelector('[data-cpm="patrimonio303"]'); if (!g) return null; const bs = [...g.querySelectorAll('[data-cpm="patrimonio303-barra"]')], d = g.querySelector('[data-cpm="patrimonio303-delta"]');
      return { barre: bs.length, ultima: bs.length ? getComputedStyle(bs[bs.length - 1]).backgroundColor : null, altre: bs.length > 1 ? getComputedStyle(bs[0]).backgroundColor : null, delta: d ? d.textContent : null, testo: g.textContent.slice(0, 90), alt: bs.map(x => Math.round(x.getBoundingClientRect().height)) }; });
    const ms = await page.evaluate(MISURA, '[data-cpm="patrimonio303"]');
    const ox = await page.evaluate(() => { const s = document.querySelector('.cpm-scroll'); return Math.max(s ? s.scrollWidth - s.clientWidth : 0, document.documentElement.scrollWidth - innerWidth); });
    const tag = `${f.k}/${prep === SERIE ? '6 mesi' : 'vuota'}`; console.log(`  C ${tag}: ${JSON.stringify(u)} · contrasto min ${ms.min}`);
    if (!u) Cc.push(`C ${tag}: manca il riquadro dello storico`);
    else if (prep === SERIE) { if (u.barre !== 6) Cc.push(`C ${tag}: barre ${u.barre} invece di 6`); if (!/74, 222, 128/.test(u.ultima || '')) Cc.push(`C ${tag}: ultima barra non verde (${u.ultima})`);
      if (!/▲/.test(u.delta || '')) Cc.push(`C ${tag}: differenza dell'ultimo mese assente o col segno sbagliato (${u.delta})`); if (!(u.alt[5] > u.alt[0])) Cc.push(`C ${tag}: l'ultima barra non e' piu' alta della prima ${u.alt}`); }
    else { if (u.barre) Cc.push(`C ${tag}: barre con la serie vuota`); if (!/parte da qui/.test(u.testo)) Cc.push(`C ${tag}: manca la frase dello storico che parte`); }
    if (ms.peggiori.length) Cc.push(`C ${tag}: contrasto ${ms.peggiori.slice(0, 2).join(' | ')}`); if (ox > 1) Cc.push(`C ${tag}: scorrimento orizzontale ${ox}px`);
    await ctx.close();
  }
}
await b.close(); srv.close();
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 3).join(' | '));
[...A, ...B, ...Cc].forEach(x => console.log('  ✗ ' + x));
let ok;
if (ROSSO) { ok = A.length > 0 && Cc.some(x => /manca il riquadro/.test(x)) && !errs.length; console.log(ok ? 'ROSSO ATTESO OK: con __CPM_NO_PATR303 cadono il registro (A) e il grafico (C)' : 'ROSSO NON RIUSCITO'); }
else { ok = !A.length && !B.length && !Cc.length && !errs.length; console.log(ok ? 'patrimonio-303 VERDE' : 'patrimonio-303 ROSSO'); }
process.exit(ok ? 0 : 1);
