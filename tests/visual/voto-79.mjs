#!/usr/bin/env node
/* [giro 79] GUARDIANO «UN SOLO VOTO, NESSUN ENFANT SENZA TRATTO».
   (A) [rosso __CPM_NO_ENFANT79] La memoria del giornale (generateLocalPressAnalysis, src/09) scriveva «✨ Enfant prodige (N anni)» per ogni
       eroe di 19 anni o meno, anche senza il tratto (tolto dal PO nella 175). Pagina vera, funzione vera, eta' 17/18/19 senza record.
       VERDE: nessun «Enfant» in memoriaTag. ROSSO: il testo ricompare.
   (B) [rosso __CPM_NO_VOTO79] Collaudo 7.999.175-3d riga 4 (k12 del salvataggio fixtures/save-190-s12-ovr93.json): PAGELLA 8,1 e
       «Cronaca di Sport … (voto 7.5)» nella stessa schermata. Le testate del pannello di fine gara (src/15 ~r.11950) ricalcolavano il voto
       con la formula dei bonus. Si gioca k12 fino al fischio; il voto delle testate e' il testimone __CPM_VOTO79 (scritto a ogni render).
       VERDE: testimone = voto del motore (pagella) e, se la riga «(voto X)» c'e', X = pagella.
       ROSSO: a partita finita si accende __CPM_NO_VOTO79 e si forza un render (apertura di una sezione): il testimone torna diverso.
       Cieco (uscita 2) se la formula e il motore danno lo stesso voto (il rosso non si distingue).
   Uso: node voto-79.mjs · CPM_SOLO_A=1 · K=12 (~6-8 min) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const fail = []; let cieco = false;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

/* ---------- (A) Enfant ---------- */
{
  for (const rosso of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_ENFANT79 = 1; }, rosso);
    await openMatch(page, port, { skipLoadAll: true, name: 'Enfant79' });
    const T = await page.evaluate(() => [17, 18, 19, 24].map(age => { try { return generateLocalPressAnalysis({ won: true, drew: false, opponent: 'Rivali', homeScore: 1, awayScore: 0 }, { goals: 1, assists: 0, rating: 7, name: 'Prova', club: 'Club' }, { season: 2, week: 3, age, matchHistory: [], records: { topSeasonGoals: 0, topSeasonAssists: 0, topOvr: 60 } }).memoriaTag || null; } catch (e) { return 'ERR ' + e.message; } }));
    console.log(`(A) ${rosso ? 'rosso' : 'verde'}: memoriaTag a 17/18/19/24 anni ${JSON.stringify(T)}`);
    const enf = T.slice(0, 3).filter(x => /Enfant/i.test(x || '')).length;
    if (T.some(x => /^ERR/.test(x || ''))) fail.push('A: funzione non chiamabile');
    else if (!rosso && enf) fail.push(`A verde: «Enfant prodige» in ${enf}/3 senza tratto`);
    else if (rosso && enf < 3) fail.push(`A rosso: «Enfant prodige» solo in ${enf}/3 (il guardiano guarda a vuoto)`);
    await ctx.close();
  }
}

/* ---------- (B) voto delle testate ---------- */
if (!process.env.CPM_SOLO_A) {
  const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
  const k = +(process.env.K || 12); const url = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  const rec = {};
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' Q190-' + k;/* stessa partita di pagella-75 e del collaudo */
    await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    const tp = Date.now(); let ph = '';
    while (Date.now() - tp < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
    rec.fine = ph;
    /* fino al pannello di fine gara (oltre la premiazione) */
    for (let i = 0; i < 20; i++) { const ok = await page.evaluate(() => /PAGELLA/.test(document.body.innerText || '') && typeof window.__CPM_VOTO79 === 'number'); if (ok) break;
      await page.getByText('Salta premiazione', { exact: false }).first().click({ timeout: 1500 }).catch(() => {}); await sleep(1500); }
    const leggi = () => page.evaluate(() => { const T = document.body.innerText || ''; const m = T.match(/PAGELLA\s*\n\s*([0-9]+(?:[.,][0-9])?)/); const c = T.match(/\(voto ([0-9]+(?:[.,][0-9])?)\)/);
      const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const E = M && M.pagelle ? (M.pagelle() || []).find(p => p && p.eroe) : null;
      return { pagellaTesto: m ? parseFloat(m[1].replace(',', '.')) : null, votoTestata: c ? parseFloat(c[1].replace(',', '.')) : null, testimone: window.__CPM_VOTO79, motore: E ? E.voto : null }; });
    rec.verde = await leggi();
    await page.evaluate(() => { window.__CPM_NO_VOTO79 = 1; window.__CPM_VOTO79 = null; });
    /* un render: si apre/chiude una sezione a fisarmonica del pannello */
    for (const t of ['LE CONNESSIONI', 'IL TUO TABELLINO IN NUMERI', 'TABELLINO DELLA GARA', 'IL TUO TABELLINO']) { await page.getByText(t, { exact: true }).first().click({ timeout: 1500 }).catch(() => {}); await sleep(400); const v = await page.evaluate(() => window.__CPM_VOTO79); if (v != null) break; }
    rec.rosso = await leggi();
  } catch (e) { rec.err = String(e).slice(0, 200); }
  await ctx.close();
  console.log(`(B) k${k}: ${rec.fine || '-'} · verde ${JSON.stringify(rec.verde)} · rosso ${JSON.stringify(rec.rosso)}${rec.err ? ' ERR ' + rec.err : ''}${errori.length ? ' pageerror ' + errori.join(' | ') : ''}`);
  const V = rec.verde || {}, R = rec.rosso || {};
  if (rec.err || V.motore == null || V.testimone == null) fail.push('B: misura non valida');
  else {
    if (errori.length) fail.push('B: pageerror');
    if (V.testimone !== V.motore) fail.push(`B verde: voto delle testate ${V.testimone} ≠ pagella del motore ${V.motore}`);
    if (V.pagellaTesto != null && V.pagellaTesto !== V.motore) fail.push(`B verde: PAGELLA a schermo ${V.pagellaTesto} ≠ motore ${V.motore}`);
    if (V.votoTestata != null && V.votoTestata !== V.motore) fail.push(`B verde: «(voto ${V.votoTestata})» ≠ pagella ${V.motore}`);
    if (R.testimone == null) { cieco = true; console.error('cieco: B rosso senza render dopo l\'interruttore'); }
    else if (R.testimone === V.motore) { cieco = true; console.error(`cieco: B la formula da' lo stesso voto del motore (${R.testimone})`); }
  }
}
await b.close(); srv.close();
if (fail.length) { console.error('❌ voto-79: ' + fail.join(' · ')); process.exit(1); }
if (cieco) { console.error('⚠️ voto-79 cieco'); process.exit(2); }
console.log('✅ voto-79 verde: niente «Enfant prodige» senza tratto' + (process.env.CPM_SOLO_A ? ' (solo A)' : '; testate e pagella con lo stesso voto') + ' · rosso visibile');
