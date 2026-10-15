#!/usr/bin/env node
/* [giro 27 PO-207 riaperta — taccuino PO 15/10, 7.999.169 S.13 W.21 13' vs FC Foxshire: «🔴 RIGORE per noi! Il pallone è tuo.» →
   «Rigore — Tiro potente», gol: «dopo il gol non si riparte da centrocampo»] GUARDIANO del gol su PIAZZATO dell'eroe.
   ripartenza-207 misura il primo gol di una partita qualunque: il gol su rigore (e su punizione diretta) dell'eroe non era coperto.

   Partita vera dal salvataggio S12 (pagina nuova per caso e per braccio). Al 9' il motore fischia il piazzato per l'eroe
   (`chiedi.piazzato`, la stessa porta del ponte verso la scena: il motore apre l'occasione `_piaz27` e il live la scena di
   rigore o di punizione costruita dal motore). L'eroe calcia «Tiro potente» (pen_power) o «Bordata potente» (fk_power) dal
   pulsante di stile; il dado del motore e' forzato a gol solo per quella scena. Dopo il gol si legge il testimone del motore
   alla BATTUTA del calcio d'inizio (`__CPM_KO27`, scritto in tickKickoff, quindi nel battito, non a campione):
     · fuori = giocatori di movimento nella meta' sbagliata al momento della battuta;
     · hold  = passi di palla ferma al centro prima della battuta.
   e il testimone della ripresa `__CPM_KO207` (riparte dal centro, palla a chi ha subito il gol).
   VERDE: ripresa dal centro, fuori <= 2, hold >= 8. ROSSO (__CPM_NO_SCHIERA27): fuori >= 5 (MISURATO prima della correzione:
   8-10 su 20, battuta dopo 2 passi = 270-470 ms reali, eroe ancora sul dischetto avversario).
   Uso: node ripartenza-piazzato-27.mjs   (CPM_CASI=rigore,punizione · CPM_SOLO=verde|rosso) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const CASI = { rigore: { kind: 'pen', x: 89, y: 50, stile: 'pen_power', intent: 'penalty' }, punizione: { kind: 'foul', x: 83, y: 50, stile: 'fk_power', intent: 'freekick' } };
const casi = (process.env.CPM_CASI || 'rigore,punizione').split(',');
const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const srv = await startServer(); const b = await launchBrowser(); const esito = {};

async function giro(caso, braccio, tent) {
  const C = CASI[caso];
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' K' + tent;
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r === 'rosso') window.__CPM_NO_SCHIERA27 = 1; localStorage.setItem('cpm-match-speed', '1'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: braccio });
  try {
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 40000 });
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 }));
    await page.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(), null, { timeout: 40000 });
    const t0 = Date.now(); let minChiesto = 0, nChieste = 0, fase = 'attesa', nKo27 = 0, nKo207 = 0, tGol = 0, stile = null;
    while (Date.now() - t0 < 180000) {
      const s = await page.evaluate(() => { const c = window.__CPM_CURSIT && window.__CPM_CURSIT(); return { ph: window.__CPM_PHASE(), min: window.__CPM_CLOCK(), intent: c ? c.intent : null, gol: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal' && e.src === 'setpiece').length, ko27: (window.__CPM_KO27 || []).length, ko207: (window.__CPM_KO207 || []).length }; });
      if (s.ph === 'ended') break;
      if (fase === 'chiesto' && s.ph === 'playing' && s.min >= minChiesto + 3 && nChieste < 3) fase = 'attesa'; /* la scena non si e' aperta: si fischia di nuovo */
      if (fase === 'attesa' && s.ph === 'playing' && s.min >= 9) { minChiesto = s.min; nChieste++;
        await page.evaluate(C => { window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 1500 }); const M = window.__CPM_MOTORE_OBJ(); if (!M.__d27) { const d = M.risolviEroe.dado; M.__d27 = 1; M.risolviEroe.dado = function () { if (window.__CPM_DADO27) return true; return d.apply(this, arguments); }; } M.chiedi.piazzato({ kind: C.kind, x: C.x, y: C.y, lato: 'home', batt: M.HERO, hold: 3 }); }, C);
        fase = 'chiesto';
      } else if (fase === 'chiesto' && s.intent === C.intent && s.ph === 'hl_choose') {
        stile = await page.evaluate(id => { window.__CPM_DADO27 = 1; const r = window.__CPM_SETPIECE(id); window.__CPM_DADO27 = 0; return r; }, C.stile);
        fase = 'calciato';
      } else if (fase === 'calciato' && s.gol >= 1) { fase = 'gol'; nKo27 = s.ko27; nKo207 = s.ko207; tGol = Date.now(); await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 })); }
      else if (fase === 'gol' && s.ko27 > nKo27) { fase = 'battuta'; break; }
      else if (fase === 'gol' && Date.now() - tGol > 60000) break;
      else if (fase === 'chiesto' && s.ph === 'playing' && nChieste >= 3 && s.min >= minChiesto + 3) break; /* il piazzato non e' diventato scena */
      else if (fase === 'calciato' && s.ph === 'playing' && s.gol === 0) break; /* calciato senza gol: si ritenta */
      await sleep(100);
    }
    const W = await page.evaluate(() => ({ ko27: (window.__CPM_KO27 || []).slice(), ko207: (window.__CPM_KO207 || []).slice() }));
    const fine = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), min: window.__CPM_CLOCK(), sc: window.__CPM_SCORE(), ev: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').map(e => e.src + '@' + e.min), oc: window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKind : null }));
    const bat = fase === 'battuta' ? (W.ko27[nKo27] || null) : null, rip = W.ko207.slice(nKo207).find(k => k.fine === 'kickoff' || k.dopo === 'kickoff') || W.ko207[W.ko207.length - 1] || null;
    return { caso, braccio, fase, fine, nChieste, stile: stile && (stile.label || stile.err), battuta: bat, ripresa: rip ? { lato: rip.lato, fine: rip.fine || rip.dopo, palla: rip.pallaFine || rip.palla } : null, errs: errs.slice(0, 2) };
  } catch (e) { return { caso, braccio, fase: 'errore ' + String(e.message || e).slice(0, 120) }; }
  finally { await ctx.close(); }
}

for (const caso of casi) for (const br of bracci) {
  let r = null; for (let t = 0; t < 3; t++) { r = await giro(caso, br, t); console.log(`${caso} ${br} tentativo ${t + 1}: ${JSON.stringify(r)}`); if (r.battuta) break; }
  esito[caso + '/' + br] = r;
}
await b.close(); srv.close();
const g = [];
for (const caso of casi) {
  const V = esito[caso + '/verde'], R = esito[caso + '/rosso'];
  if (V) { if (!V.battuta) g.push(`${caso} verde: nessuna battuta dopo il gol (fase ${V.fase}): misura cieca`);
    else { if (!(V.ripresa && V.ripresa.fine === 'kickoff' && V.ripresa.palla && V.ripresa.palla[0] === 50 && V.ripresa.palla[1] === 50 && V.ripresa.lato === 'away')) g.push(`${caso} verde: la ripresa non e' dal centro con la palla a chi ha subito ${JSON.stringify(V.ripresa)}`);
      if (V.battuta.fuori > 2) g.push(`${caso} verde: ${V.battuta.fuori} giocatori nella meta' sbagliata alla battuta`);
      if (V.battuta.hold < 8) g.push(`${caso} verde: palla ferma al centro solo ${V.battuta.hold} passi`);
      if (V.errs && V.errs.length) g.push(`${caso} verde: errori di pagina ${V.errs.join(' | ')}`); } }
  if (R) { if (!R.battuta) g.push(`${caso} rosso: nessuna battuta dopo il gol: misura cieca`);
    else if (!(R.battuta.fuori >= 5)) g.push(`${caso} rosso: il difetto non si vede (fuori ${R.battuta.fuori})`); }
}
console.log(JSON.stringify(esito));
if (g.length) { console.log('❌ ripartenza-piazzato-27'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ ripartenza-piazzato-27 verde (${casi.join(' + ')}: ripresa dal centro, squadre nella propria meta', palla ferma) e il rosso si vede`);
