#!/usr/bin/env node
/* [7.999.126 PO-207 collaudo PO 03/10 «Ad ogni gol il 2D non riparte dalla rimessa in gioco da centrocampo»] GUARDIANO su una
   partita vera dal salvataggio S12 (autoplay, seme fisso, fino al primo gol + 10 s, massimo 300 s; un braccio senza gol si ritenta fino a 3 partite): a ogni aumento del punteggio il motore riparte dal centro con la
   palla a chi ha subito il gol (testimone __CPM_KO207) e subito dopo la ripartenza il motore e' in «kickoff» con il pallone a (50,50) (letto dal testimone nel gioco, non a campione).
   Verde: almeno una ripartenza e il pallone al centro. Rosso (__CPM_NO_KO207): nessuna ripartenza. MISURATO prima della correzione:
   dopo 3 gol il motore restava in «tenuta»/«volo» con il pallone dove era. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const braccio of ['verde', 'rosso', 'rosso18']) { const rosso = braccio !== 'verde'; for (let tent = 0; tent < 3; tent++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);/* un contesto per braccio: il salvataggio non si condivide */
  /* il seme della partita nasce da avversario+stagione+settimana+NOME: a ogni tentativo un nome diverso, cioe' una partita diversa */
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + String.fromCharCode(65 + tent);
  await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_NO_STILI = 1; /* [giro 67 PO-098] lo scenario e' la partita S12 della 172: con lo stile (centravanti → Finalizzatore) la partita cambia e il caso non si riproduce */ if (s.r === 'rosso') window.__CPM_NO_KO207 = 1; if (s.r === 'rosso18') { window.__CPM_NO_KO18 = 1; window.__CPM_NO_SCHIERA27 = 1; /* [giro 27] la palla tenuta 11 passi (schiera27) e' una seconda difesa: il recupero (max 8 passi) non la consuma piu', e il braccio deve provare il guardiano del giro 18 da solo */ } localStorage.setItem('cpm-match-speed', '4'); const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...sv, r: rosso ? braccio : '' });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let nKo = 0, attesa = 0, centro = 0, primoGol = 0;
  while (Date.now() - t0 < 300000 && !(primoGol && Date.now() - primoGol > 10000)) {
    const s = await page.evaluate(() => { let st = null; try { st = window.__CPM_MOTORE_OBJ().stato(); } catch (e) {} return { f: window.__CPM_PHASE(), g: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').length, ko: (window.__CPM_KO207 || []).length, kos: (window.__CPM_KO207 || []).slice(), p: st && st.palla ? [st.palla.x, st.palla.y] : null }; });
    if (s.f === 'ended' || s.f === 'ceremony') break;
    if (s.g && !primoGol) primoGol = Date.now();
    /* [giro 18] il centro si giudica dal testimone a BATTITO CHIUSO (fine/pallaFine, scritto dopo tutti i passi del battito, anche i 8 di recupero MIN202):
       la lettura a campione ogni 300 ms qui sotto resta solo informativa — dipende dall'orologio da polso, ed e' lei che sul giro della 7.999.162 ha mancato il
       calcio d'inizio consumato in 2 ms dal recupero. */
    if (s.ko > nKo) { nKo = s.ko; attesa = 20; /* [7.999.148] 6 s, non 0,9: se il gol nasce dentro la scena il pallone torna al centro quando la scena finisce (misurato: 4 giri su 4 al centro, ma oltre le 3 letture) */ for (const k of s.kos) if (k.dopo === 'kickoff' && k.palla && k.palla[0] === 50 && k.palla[1] === 50) centro = Math.max(centro, s.kos.filter(q => q.dopo === 'kickoff' && q.palla && q.palla[0] === 50 && q.palla[1] === 50).length); }
    if (attesa > 0) { attesa--; if (s.p && Math.abs(s.p[0] - 50) <= 4 && Math.abs(s.p[1] - 50) <= 6) { centro++; attesa = 0; } }
    await sleep(300);
  }
  const _kos = await page.evaluate(() => (window.__CPM_KO207 || []).slice());
  const _e = { ripartenze: nKo, alCentro: _kos.filter(q => q.fine === 'kickoff' && q.pallaFine && q.pallaFine[0] === 50 && q.pallaFine[1] === 50).length, aCampione: centro, fineKo: _kos.map(q => q.fine + '@' + (q.pallaFine || []).join(',') + (q.scena ? '/scena' : '')), gol: await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').length), tentativi: tent + 1, fine: await page.evaluate(() => ({ f: window.__CPM_PHASE && window.__CPM_PHASE(), sc: window.__CPM_SCORE && window.__CPM_SCORE() })), s: Math.round((Date.now() - t0) / 1000) };
  console.log(braccio + ' tentativo ' + (tent + 1) + ' ' + JSON.stringify(_e));
  esito[braccio] = _e;
  await ctx.close();
  if (_e.gol >= 1) break; } /* le partite non sono identiche fra un giro e l'altro: un braccio senza gol si ritenta, fino a 3 partite */
}
await b.close(); srv.close();
console.log(JSON.stringify(esito));
const V = esito.verde, R = esito.rosso, R18 = esito.rosso18, g = [];
if (!(V.ripartenze >= 1 && V.alCentro === V.ripartenze)) g.push('verde: ' + JSON.stringify(V));
if (R.ripartenze !== 0) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
/* [giro 18] secondo rosso (__CPM_NO_KO18): il recupero del debito MIN202 torna a consumare il calcio d'inizio nello stesso battito */
if (!(R18.ripartenze >= 1 && R18.alCentro < R18.ripartenze)) g.push('rosso18: il calcio d\'inizio consumato dal recupero non si vede ' + JSON.stringify(R18));
if (!(V.gol >= 1) || !(R.gol >= 1) || !(R18.gol >= 1)) g.push('un braccio senza gol: misura cieca ' + JSON.stringify(esito));
if (g.length) { console.log('❌ ripartenza-207'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ripartenza-207 verde (e i due rossi si vedono)');
