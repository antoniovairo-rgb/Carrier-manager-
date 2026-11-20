#!/usr/bin/env node
/* [giro 296 · PO-534 · PO-535 · PO-536] GUARDIANO dei rigori di coppa. Tre parti, ognuna verde col verde e rossa col rosso.

   A · NOMI CORTI (statico, dalla pagina): ogni club ha un nome corto (tabella CLUB_CORTI_296 + regola, src/02): non vuoto, al massimo
       10 caratteri, unico fra tutti i club, diverso dalla sigla; e la scala dei nomi (NomeSquadra182) lo mette prima della sigla.
       ROSSO __CPM_NO_G296: la scala di «FC Salernum 1919» torna senza «Salernum».

   B · CERIMONIA DELLA COPPA DOPO I RIGORI (finale 1-1, serie vinta dall'eroe). Durata misurata sull'OROLOGIO DELLA PAGINA (registro
       dei cambi di fase a 25 ms dentro la pagina + testimone del gioco __CPM_CER296), non su quello della sonda. Quattro corse verdi:
         B1 telefono 375x667 col tocco, in casa · B2 telefono 375x667 (finestra stretta, mouse), in trasferta ·
         B3 PC 1366x768, in casa · B4 PC 1366x768, in trasferta.
       SOGLIE (verde): durata >= 17.000 ms (il gioco prevede 17.500), fase dopo = ended, la chiude il «timer», 0 errori di pagina.
       STRISCIA IN ALTO a 375x667 (B1, B2), letta durante la serie e in cerimonia (almeno 2 letture stabili per fase): nessun nome
       tagliato (larghezza vera del testo <= casella) e mai la SIGLA DOPPIA (il nome ridotto alla stessa sigla scritta nello stemma
       accanto).
       ROSSI: B5 = B2 con __CPM_NO_G296 → in cerimonia torna la sigla doppia (misurato prima della correzione: «SLR» accanto allo
       stemma «SLR»); B6 = B4 con la sonda che preme Invio 3 s dopo l'inizio della cerimonia (la strada vera del «Salta») → la durata
       scende sotto 17.000 ms e la chiude «salta»: prova che la misura della durata vede una cerimonia corta.
       [PO-534: nessuna correzione al gioco. Misurato su 7.999.196 e 198, PC in trasferta: 17,7-19,6 s, la chiude il timer. I «2-6 s»
       del giro 272 erano l'orologio della sonda-214: fra una coppia di foto e l'altra vedeva la cerimonia 7-8 s dopo l'inizio.]

   C · RIPARTENZA DOPO IL RIGORE DI UN COMPAGNO (senza premio rigorista): il braccio «compagno» di ripartenza-piazzato-27 (verde +
       rosso __CPM_NO_G296), eseguito da qui.

   Meno letture, fase diversa, misura mancante = non giudicato = rosso. Circa 30 minuti.
   Uso: node rigori-296.mjs   (CPM_PARTI=A,B,C · CPM_CORSE296=B1,B2,… per una parte sola) */
import { spawnSync } from 'node:child_process';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { apriLotteria296 } from './sonda-296.mjs';
const PARTI = (process.env.CPM_PARTI || 'A,B,C').split(','); const g = []; const riepilogo = {};
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

/* ---------- A ---------- */
if (PARTI.includes('A')) {
  for (const rosso of [false, true]) {
    const pg = await browser.newPage(); await installCdnRoutes(pg); await pg.addInitScript(r => { if (r) window.__CPM_NO_G296 = 1; }, rosso);
    await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await pg.waitForFunction(() => typeof window.__CPM_CORTI296 === 'function' && !!window.__CPM_NOMI182, null, { timeout: 90000 });
    const r = await pg.evaluate(() => { const L = window.__CPM_CORTI296(); const cnt = {}; L.forEach(c => { cnt[c.corto] = (cnt[c.corto] || 0) + 1; });
      return { n: L.length, vuoti: L.filter(c => !c.corto).map(c => c.n), lunghi: L.filter(c => c.corto.length > 10).map(c => c.corto), doppi: Object.keys(cnt).filter(k => k && cnt[k] > 1), siglaUguale: L.filter(c => c.corto && c.corto.toUpperCase() === String(c.a).toUpperCase()).map(c => c.n),
        nonPrima: L.filter(c => { const k = window.__CPM_NOMI182.candidati({ n: c.n, a: c.a }); const i = k.indexOf(c.corto); return !(i >= 0 && i < k.length - 1 && k[k.length - 1] === c.a); }).map(c => c.n).slice(0, 8),
        scalaSal: window.__CPM_NOMI182.candidati({ n: 'FC Salernum 1919', a: 'SLR' }), scalaU19: window.__CPM_NOMI182.candidati({ n: 'FC Salernum 1919 Primavera', a: 'SLR' }) }; });
    await pg.close();
    if (!rosso) { riepilogo.A = { club: r.n, scalaSal: r.scalaSal, scalaU19: r.scalaU19 };
      if (r.n < 200) g.push(`A verde: solo ${r.n} club letti: non giudicato`);
      if (r.vuoti.length) g.push(`A verde: club senza nome corto: ${r.vuoti.slice(0, 6).join(', ')}`);
      if (r.lunghi.length) g.push(`A verde: nomi corti oltre 10 caratteri: ${r.lunghi.join(', ')}`);
      if (r.doppi.length) g.push(`A verde: nomi corti non unici: ${r.doppi.join(', ')}`);
      if (r.siglaUguale.length) g.push(`A verde: nome corto uguale alla sigla: ${r.siglaUguale.join(', ')}`);
      if (r.nonPrima.length) g.push(`A verde: il nome corto non sta nella scala prima della sigla: ${r.nonPrima.join(', ')}`);
      if (!(r.scalaSal.includes('Salernum') && r.scalaU19.includes('Salernum'))) g.push(`A verde: «Salernum» non e' nella scala ${JSON.stringify(r.scalaSal)} / ${JSON.stringify(r.scalaU19)}`);
    } else { riepilogo.Arosso = { scalaSal: r.scalaSal }; if (r.scalaSal.includes('Salernum')) g.push(`A rosso: il difetto non si vede (la scala ha ancora «Salernum»: ${JSON.stringify(r.scalaSal)})`); }
  }
}

/* ---------- B ---------- */
const CORSE = { B1: { tel: true, tocco: true, trasferta: false }, B2: { tel: true, tocco: false, trasferta: true }, B3: { tel: false, trasferta: false }, B4: { tel: false, trasferta: true },
  B5: { tel: true, tocco: false, trasferta: true, rosso: true }, B6: { tel: false, trasferta: true, salta: true } };
const leggiStriscia = (pg) => pg.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE();
  const els = [...document.querySelectorAll('[data-cpm="barra"] [data-cpm="barra-nome-182"]')].filter(e => e.getBoundingClientRect().width > 0);
  return { ph, nomi: els.map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0); const rg = document.createRange(); rg.selectNodeContents(e); const tw = rg.getBoundingClientRect().width;
    const sv = e.parentElement.querySelector('svg'); const stemma = sv ? sv.textContent.trim() : null; const cand = (e.dataset.cand182 || '').split('|');
    return { t: e.textContent, stemma, box: +(r.width - pad).toFixed(1), testo: +tw.toFixed(1), tagliato: tw > r.width - pad + 0.05 || e.scrollWidth > e.clientWidth + 0.5, sigla: cand[cand.length - 1], doppia: !!stemma && e.textContent.trim().toUpperCase() === stemma.toUpperCase(), corto: e.dataset.corto296 || null, corpo: cs.fontSize }; }) }; });
async function stabile(pg) { let a = await leggiStriscia(pg); for (let k = 0; k < 6; k++) { await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); const b = await leggiStriscia(pg); if (JSON.stringify(a) === JSON.stringify(b)) return b; a = b; } return null; }
async function corsaB(id) { const c = CORSE[id]; const vp = c.tel ? { width: 375, height: 667 } : { width: 1366, height: 768 };
  const ctx = await browser.newContext({ viewport: vp, hasTouch: !!c.tocco, isMobile: !!c.tocco });
  const pg = await apriLotteria296(ctx, port, { trasferta: c.trasferta, rosso: !!c.rosso, viewport: vp });
  const letture = { shootout: [], ceremony: [] }; const tS = Date.now(); let saltato = false;
  for (;;) { const ph = await pg.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
    if (ph !== 'shootout' && ph !== 'ceremony') break; if (Date.now() - tS > 300000) break;
    if (c.salta && ph === 'ceremony' && !saltato) { const t0 = await pg.evaluate(() => (window.__CPM_CER296 || {}).t0 || null); const ora = await pg.evaluate(() => performance.now()); if (t0 && ora - t0 >= 3000) { await pg.keyboard.press('Enter'); saltato = true; } }
    if (c.tel && letture[ph].length < 6) { const cer = ph === 'ceremony' ? await pg.evaluate(() => { const w = window.__CPM_CER296; return w ? performance.now() - w.t0 : 0; }) : 9999;
      if (cer >= 2000) { const s = await stabile(pg); if (s && s.ph === ph && s.nomi.length >= 2) letture[ph].push(s.nomi); } }/* in cerimonia si legge dopo 2 s: la striscia ha finito di specchiarsi */
    await sleep(c.tel ? 700 : 200); }
  await sleep(400);
  const r = await pg.evaluate(() => ({ fasi: (window.__FASI296 || []).slice(-6), cer: window.__CPM_CER296 || null }));
  const i = r.fasi.findIndex(x => x[0] === 'ceremony'); const durata = (i >= 0 && r.fasi[i + 1]) ? r.fasi[i + 1][1] - r.fasi[i][1] : null;
  if (process.env.CPM_FOTO296 && c.tel) { /* foto per il rapporto: non giudicata */ }
  const out = { id, ...c, durataMs: durata, dopo: i >= 0 && r.fasi[i + 1] ? r.fasi[i + 1][0] : null, testimone: r.cer, letture, errs: pg.__errs.slice(0, 3) };
  await ctx.close(); return out; }
function giudicaDurata(r) { const p = [];
  if (r.durataMs == null) p.push('cerimonia non vista o non finita: non giudicato');
  else { if (r.durataMs < 17000) p.push(`cerimonia di ${r.durataMs} ms (< 17.000)`); if (r.dopo !== 'ended') p.push(`dopo la cerimonia la fase e' ${r.dopo}`); }
  if (!r.testimone || r.testimone.t1 == null) p.push('testimone __CPM_CER296 assente o non chiuso: non giudicato');
  else { if (r.testimone.chi !== 'timer') p.push(`la cerimonia l'ha chiusa «${r.testimone.chi}», non il timer`); if (r.testimone.previstoMs !== 17500 || r.testimone.kind !== 'cup') p.push(`durata prevista ${r.testimone.previstoMs} ms / ${r.testimone.kind}, attesa 17.500 / cup`); if (r.testimone.durataMs < 17000) p.push(`testimone: durata ${r.testimone.durataMs} ms`); }
  if (r.errs.length) p.push('errori di pagina: ' + r.errs.join(' | ')); return p; }
function giudicaStriscia(r) { const p = [];
  for (const f of ['shootout', 'ceremony']) { const L = r.letture[f]; if (L.length < 2) { p.push(`striscia in ${f}: ${L.length} letture stabili (< 2): non giudicato`); continue; }
    const tutti = L.flat(); const tagl = tutti.filter(x => x.tagliato), dop = tutti.filter(x => x.doppia);
    if (tagl.length) p.push(`striscia in ${f}: nome tagliato «${tagl[0].t}» (${tagl[0].testo} px in ${tagl[0].box} px)`);
    if (dop.length) p.push(`striscia in ${f}: sigla doppia «${dop[0].stemma} ${dop[0].t}» in ${dop.length} letture su ${tutti.length}`); }
  return p; }
if (PARTI.includes('B')) {
  const corse = (process.env.CPM_CORSE296 || 'B1,B2,B3,B4,B5,B6').split(',');
  for (const id of corse) { const r = await corsaB(id); const c = CORSE[id];
    const strTxt = c.tel ? ['shootout', 'ceremony'].map(f => f + ': ' + [...new Set(r.letture[f].map(L => L.map(x => `${x.stemma}|${x.t}${x.tagliato ? ' TAGLIATO' : ''}${x.doppia ? ' DOPPIA' : ''}`).join(' · ')))].join(' / ')).join(' — ') : '';
    console.log(`${id} ${JSON.stringify({ tel: !!c.tel, tocco: !!c.tocco, trasferta: c.trasferta, rosso: !!c.rosso, salta: !!c.salta })}: durata ${r.durataMs} ms, dopo ${r.dopo}, testimone ${JSON.stringify(r.testimone)}${strTxt ? ' | striscia ' + strTxt : ''}`);
    riepilogo[id] = { durataMs: r.durataMs, chi: r.testimone && r.testimone.chi, striscia: strTxt };
    const pd = giudicaDurata(r), ps = c.tel ? giudicaStriscia(r) : [];
    if (c.rosso) { /* B5: il difetto della striscia si deve vedere (sigla doppia in cerimonia); la durata resta giudicata verde */
      pd.forEach(x => g.push(`${id} (rosso della striscia): ${x}`));
      if (!ps.some(x => /sigla doppia/.test(x) && /ceremony/.test(x))) g.push(`${id} rosso: il difetto non si vede (nessuna sigla doppia in cerimonia) ${JSON.stringify(ps)}`); }
    else if (c.salta) { /* B6: la misura della durata deve cadere */
      if (!(r.durataMs != null && r.durataMs < 17000 && r.testimone && r.testimone.chi === 'salta' && pd.length)) g.push(`${id} rosso: la cerimonia saltata a 3 s non fa cadere la misura (durata ${r.durataMs}, chi ${r.testimone && r.testimone.chi})`); }
    else { pd.forEach(x => g.push(`${id} verde: ${x}`)); ps.forEach(x => g.push(`${id} verde: ${x}`)); }
  }
}
await browser.close(); srv.close();

/* ---------- C ---------- */
if (PARTI.includes('C')) {
  const r = spawnSync(process.execPath, ['ripartenza-piazzato-27.mjs'], { cwd: new URL('.', import.meta.url).pathname, env: { ...process.env, CPM_CASI: 'compagno' }, encoding: 'utf8', timeout: 25 * 60000 });
  const righe = String(r.stdout || '').trim().split('\n'); console.log(righe.slice(-4).map(x => 'C · ' + x.slice(0, 900)).join('\n'));
  riepilogo.C = r.status === 0 ? 'verde + rosso visto' : 'rosso';
  if (r.status !== 0) g.push(`C: ripartenza-piazzato-27 (compagno) e' uscito ${r.status}: ${righe.filter(x => /·/.test(x)).slice(-3).join(' ; ').slice(0, 400)}`);
}
console.log(JSON.stringify(riepilogo));
if (g.length) { console.log('❌ rigori-296'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ rigori-296 verde (parti ${PARTI.join(' + ')}): nomi corti per tutti i club, cerimonia >= 17 s in casa e in trasferta su PC e telefono chiusa dal timer, striscia senza tagli e senza sigla doppia, ripartenza dal centro dopo il rigore del compagno; i rossi si vedono`);
