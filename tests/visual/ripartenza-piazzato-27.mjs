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
const CASI = { rigore: { kind: 'pen', x: 89, y: 50, stile: 'pen_power', intent: 'penalty' }, punizione: { kind: 'foul', x: 83, y: 50, stile: 'fk_power', intent: 'freekick' },
  /* [giro 296 PO-536] BRACCIO NUOVO: il rigore lo tira un COMPAGNO. Stessa richiesta del rigore dell'eroe (chiedi.piazzato, batt: HERO)
     ma SENZA il premio «il rigorista sei tu»: il ponte nega il dischetto all'eroe (giro 257, conta.ponte257) e calcia il compagno
     scelto dal motore (regola del 249). Nessuna scena dell'eroe, nessun dado forzato: se il compagno sbaglia (xG 0,76) si ritenta con
     un altro seme (fino a 5). Si giudica la battuta del calcio d'inizio dopo il SUO gol, con le stesse soglie del rigore dell'eroe:
     ripresa dal centro con la palla a chi ha subito, fuori <= 2, hold >= 8. Rosso __CPM_NO_G296 = prima della correzione. */
  compagno: { kind: 'pen', x: 89, y: 50, stile: null, intent: 'penalty', compagno: true } };
const casi = (process.env.CPM_CASI || 'rigore,punizione,compagno').split(',');
const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const srv = await startServer(); const b = await launchBrowser(); const esito = {};

async function giro(caso, braccio, tent) {
  const C = CASI[caso];
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' K' + tent;
  /* [giro 272] dal giro 257 (decisioni PO 17/11, «il ponte non nomina l'eroe sul dischetto senza premio», dubbio 4 del 249) in carriera
     il rigore lo tira l'eroe solo col premio del patto «il rigorista sei tu» nel club attuale (premiPatto227.rig = id del club,
     premiMotore238): senza, il ponte nega il dischetto (misurato: conta.ponte257 = 3 su 3 richieste, scena mai aperta). La sonda mette il
     premio nel salvataggio, cioe' chiede il rigore per la strada che il gioco consente. Soglie e rosso __CPM_NO_SCHIERA27 invariati. */
  if (C.compagno) { if (pl.premiPatto227) delete pl.premiPatto227.rig; }
  if (caso === 'rigore' && !process.env.CPM_SENZA_PREMIO272) pl.premiPatto227 = { ...(pl.premiPatto227 || {}), rig: pl.club.id };
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; if (s.r === 'rosso') { if (s.c296) window.__CPM_NO_G296 = 1; else window.__CPM_NO_SCHIERA27 = 1; } localStorage.setItem('cpm-match-speed', '1'); const c = { ...s }; delete c.r; delete c.c296; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: braccio, c296: !!C.compagno });
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
    const t0 = Date.now(); let minChiesto = 0, nChieste = 0, fase = 'attesa', nKo27 = 0, nKo207 = 0, tGol = 0, stile = null, gol0 = 0, tiro296 = null;
    while (Date.now() - t0 < 180000) {
      const s = await page.evaluate(() => { const c = window.__CPM_CURSIT && window.__CPM_CURSIT(); return { ph: window.__CPM_PHASE(), min: window.__CPM_CLOCK(), intent: c ? c.intent : null, gol: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal' && e.src === 'setpiece').length, ko27: (window.__CPM_KO27 || []).length, ko207: (window.__CPM_KO207 || []).length, golCasa: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal' && e.side === 'home').length, ult: (() => { try { const u = window.__CPM_MOTORE_OBJ()._S._ultTiro191; return u ? { min: u.min, eroe: !!u.eroe, intent: u.intent, esito: u.esito, lato: u.lato, nome: u.nome } : null; } catch (e) { return null; } })() }; });
      if (s.ph === 'ended') break;
      if (fase === 'chiesto' && s.ph === 'playing' && s.min >= minChiesto + 3 && nChieste < 3) fase = 'attesa'; /* la scena non si e' aperta: si fischia di nuovo */
      if (fase === 'attesa' && s.ph === 'playing' && s.min >= 9 + (C.compagno ? 2 + tent * 2 : 0)) {/* [giro 296] il compagno dall'11': al 9' il suo rigore e' parato (misurato 4 corse su 4) */ minChiesto = s.min; nChieste++; gol0 = s.golCasa;
        await page.evaluate(C => { window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 1500 }); const M = window.__CPM_MOTORE_OBJ(); if (!M.__d27) { const d = M.risolviEroe.dado; M.__d27 = 1; M.risolviEroe.dado = function () { if (window.__CPM_DADO27) return true; return d.apply(this, arguments); }; } /* [giro 296] il compagno: prima due tentativi col dado del motore (minuti diversi = sorteggi diversi; misurato: allo stesso minuto il
             rigore di SPENCER e' parato 3 volte su 3). Dal terzo tentativo il gol lo PROVOCA la sonda (PO-311: cio' che il gioco non produce si
             provoca): l'esito del SOLO rigore del compagno, gia' diretto nello specchio, diventa gol nel momento in cui parte. */
          if (C.compagno && C.provoca && !M._S.poss.__t296) { const P = M._S.poss; P.__t296 = 1; let v = P.esito; Object.defineProperty(P, 'esito', { configurable: true, enumerable: true, get() { return v; }, set(x) { const u = M._S._ultTiro191; if (window.__CPM_DADO296 && x && x !== 'goal' && u && u.intent === 'penalty' && u.lato === 'home' && !u.eroe) { window.__CPM_DADO296 = 0; window.__CPM_PROV296 = x; v = 'goal'; } else v = x; } }); }
          if (C.compagno && C.provoca) window.__CPM_DADO296 = 1;
          M.chiedi.piazzato({ kind: C.kind, x: C.x, y: C.y, lato: 'home', batt: M.HERO, hold: 3 }); }, { ...C, provoca: !!C.compagno && tent >= 2 });
        fase = 'chiesto';
      } else if (C.compagno && fase === 'chiesto' && s.ult && s.ult.intent === 'penalty' && s.ult.lato === 'home' && s.ult.min >= minChiesto) { tiro296 = s.ult; fase = 'calciato'; /* [giro 296] il rigore e' partito dal piede di chi ha scelto il motore */
      } else if (C.compagno && fase === 'calciato' && s.golCasa > gol0) { fase = 'gol'; nKo27 = s.ko27; nKo207 = s.ko207; tGol = Date.now(); await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 }));
      } else if (C.compagno && fase === 'calciato' && s.ph === 'playing' && s.min >= tiro296.min + 2 && s.golCasa === gol0) { break; /* rigore del compagno senza gol: si ritenta con un altro seme */
      } else if (!C.compagno && fase === 'chiesto' && s.intent === C.intent && s.ph === 'hl_choose') {
        stile = await page.evaluate(id => { window.__CPM_DADO27 = 1; const r = window.__CPM_SETPIECE(id); window.__CPM_DADO27 = 0; return r; }, C.stile);
        fase = 'calciato';
      } else if (!C.compagno && fase === 'calciato' && s.gol >= 1) { fase = 'gol'; nKo27 = s.ko27; nKo207 = s.ko207; tGol = Date.now(); await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 })); }
      else if (fase === 'gol' && s.ko27 > nKo27) { fase = 'battuta'; break; }
      else if (fase === 'gol' && Date.now() - tGol > 60000) break;
      else if (fase === 'chiesto' && s.ph === 'playing' && nChieste >= 3 && s.min >= minChiesto + 3) break; /* il piazzato non e' diventato scena */
      else if (!C.compagno && fase === 'calciato' && s.ph === 'playing' && s.gol === 0) break; /* calciato senza gol: si ritenta */
      await sleep(100);
    }
    const W = await page.evaluate(() => ({ ko27: (window.__CPM_KO27 || []).slice(), ko207: (window.__CPM_KO207 || []).slice() }));
    const fine = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), min: window.__CPM_CLOCK(), sc: window.__CPM_SCORE(), ev: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').map(e => e.src + '@' + e.min), oc: window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKind : null, provocato296: window.__CPM_PROV296 || null, ponte257: (() => { try { return window.__CPM_MOTORE_OBJ().stato().conta.ponte257 || 0; } catch (e) { return null; } })() }));/* [giro 272] quante volte il ponte ha negato il dischetto all'eroe (giro 257) */
    const bat = fase === 'battuta' ? (W.ko27[nKo27] || null) : null, rip = W.ko207.slice(nKo207).find(k => k.fine === 'kickoff' || k.dopo === 'kickoff') || W.ko207[W.ko207.length - 1] || null;
    return { caso, braccio, fase, fine, nChieste, tiro296, stile: stile && (stile.label || stile.err), battuta: bat, ripresa: rip ? { lato: rip.lato, fine: rip.fine || rip.dopo, palla: rip.pallaFine || rip.palla, sch: rip.sch, eroe: rip.eroe, scena: rip.scena, rig296: rip.rig296, min: rip.min } : null, ko207: W.ko207.slice(nKo207).map(k => ({ min: k.min, sch: k.sch, scena: k.scena, eroe: k.eroe, rig: k.rig296, fine: k.fine || k.dopo })), errs: errs.slice(0, 2) };
  } catch (e) { return { caso, braccio, fase: 'errore ' + String(e.message || e).slice(0, 120) }; }
  finally { await ctx.close(); }
}

for (const caso of casi) for (const br of bracci) {
  /* [giro 332 · PO-620] il caso «compagno» si giudica SOLO se il gol del compagno e' caduto FUORI dalla scena e senza un gol dell'eroe in
     scena da smaltire (testimone __CPM_KO207: scena false, eroe false). MISURATO (3+3 corse del rosso, 22/11): quando il rigore del compagno
     entra mentre il motore e' ancora in scena, la ripresa schiera i ventidue per la regola del giro 27 (`sch` da `scena`) in ENTRAMBI i
     bracci: il rosso usciva «fuori 0» (il difetto non si vede) e il verde passava senza aver esercitato la correzione del 296. Quella corsa
     ora e' «non valida» e si ritenta con il tentativo successivo, come gia' si faceva col rigore parato. Nessuna soglia cambiata. */
  const valida = (r) => !!(r && r.battuta && (!CASI[caso].compagno || (r.ripresa && r.ripresa.scena === false && r.ripresa.eroe === false)));
  let r = null; for (let t = 0; t < (CASI[caso].compagno ? 6 : 3); t++) { r = await giro(caso, br, t); console.log(`${caso} ${br} tentativo ${t + 1}: ${JSON.stringify(r)}`); if (valida(r)) break;
    if (r && r.battuta) { console.log(`  (tentativo ${t + 1} non valido: gol del compagno caduto in scena o dopo un gol dell'eroe in scena — si ritenta)`); r = { ...r, battuta: null, fase: 'non valido (gol in scena)' }; } }
  esito[caso + '/' + br] = r;
}
await b.close(); srv.close();
const g = [];
for (const caso of casi) {
  const V = esito[caso + '/verde'], R = esito[caso + '/rosso'];
  if (V) { if (!V.battuta) g.push(`${caso} verde: nessuna battuta dopo il gol (fase ${V.fase}): misura cieca`);
    else { if (CASI[caso].compagno && !(V.ripresa && V.ripresa.rig296 === true)) g.push(`${caso} verde: la ripresa non e' passata dalla regola del giro 296 (rig296 ${V.ripresa && V.ripresa.rig296}): non giudicato`);
      if (CASI[caso].compagno && !(V.tiro296 && V.tiro296.eroe === false && V.fine.ponte257 >= 1)) g.push(`${caso} verde: il rigore non l'ha tirato un compagno (${JSON.stringify(V.tiro296)}, ponte257 ${V.fine.ponte257}): non giudicato`); if (!(V.ripresa && V.ripresa.fine === 'kickoff' && V.ripresa.palla && V.ripresa.palla[0] === 50 && V.ripresa.palla[1] === 50 && V.ripresa.lato === 'away')) g.push(`${caso} verde: la ripresa non e' dal centro con la palla a chi ha subito ${JSON.stringify(V.ripresa)}`);
      if (V.battuta.fuori > 2) g.push(`${caso} verde: ${V.battuta.fuori} giocatori nella meta' sbagliata alla battuta`);
      if (V.battuta.hold < 8) g.push(`${caso} verde: palla ferma al centro solo ${V.battuta.hold} passi`);
      if (V.errs && V.errs.length) g.push(`${caso} verde: errori di pagina ${V.errs.join(' | ')}`); } }
  if (R) { if (!R.battuta) g.push(`${caso} rosso: nessuna battuta dopo il gol: misura cieca`);
    else if (CASI[caso].compagno && !(R.tiro296 && R.tiro296.eroe === false)) g.push(`${caso} rosso: il rigore non l'ha tirato un compagno: non giudicato`);
    else if (!(R.battuta.fuori >= 5)) g.push(`${caso} rosso: il difetto non si vede (fuori ${R.battuta.fuori})`); }
}
console.log(JSON.stringify(esito));
if (g.length) { console.log('❌ ripartenza-piazzato-27'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ ripartenza-piazzato-27 verde (${casi.join(' + ')}: ripresa dal centro, squadre nella propria meta', palla ferma) e il rosso si vede`);
