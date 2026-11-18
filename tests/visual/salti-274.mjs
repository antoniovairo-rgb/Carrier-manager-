#!/usr/bin/env node
/* [giro 53 PO-274] CACCIA al salto del pallone NON spiegato dalla velocita' (apertura-261 lo conta come rosso dal giro 53). Partite vere
   intere, GLB acceso, teatro attivo, autoplay seedato; il registratore __CPM_BALLSET274 (solo diagnosi) annota ogni singolo assegnamento
   che sposta il pallone di oltre 6u con la sua pila di chiamate; alla fine si estrae dal codice trasformato la riga che l'ha scritto.
   Uso: CPM_NOMI=a,b node salti-274.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI = (process.env.CPM_NOMI || 'Ivo Mansi,Nando Orsi').split(','), TETTO = +(process.env.CPM_TETTO || 330000), ROSSO = process.env.CPM_ROSSO || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let TOT = 0, VOLI = 0; const VV = [];
/* [giro 274 PO-516] braccio rosso del SOLO colpo di testa (__CPM_NO_G274 senza __CPM_NO_VOLO274): si giudica sulle scene provocate qui sotto,
   le partite intere non servono (il loro rosso e' quello del volo al piede) e si saltano, dichiarandolo. */
const R_VOLO = /__CPM_NO_VOLO274/.test(ROSSO), R_TESTA = /__CPM_NO_G274\b/.test(ROSSO), SOLO_TESTA = !!process.env.CPM_SOLO_TESTA/* solo diagnosi: col guardiano una corsa parziale NON vale (uscita 3) */, PARTITE = !SOLO_TESTA && (!ROSSO || R_VOLO || !R_TESTA);
if (!PARTITE) console.log('braccio rosso del colpo di testa: partite intere saltate (si giudicano le scene provocate)');
for (const [k, nome] of (PARTITE ? NOMI : []).entries()) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_BALLSET274 = 1; if (r) r.split('+').forEach(x => window[x] = 1); }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7 + k);
  const t0 = Date.now(); let ph = null; const fasi = [];
  while (Date.now() - t0 < TETTO) { const p = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (p !== ph) { fasi.push([Math.round((Date.now() - t0) / 1000), p]); ph = p; } if (p === 'ended' || p === 'ceremony') break; await sleep(300); }
  const r = await page.evaluate(() => {
    const bj = (window.__CPM_BJ478 || []).filter(x => !x.mask && !x.nascosto && x.ph === 'hl_result');
    const bs = (window.__CPM_BS274 || []).slice();
    const src = [...document.scripts].map(s => s.text || '').filter(t => t.length > 1e5);
    const snip = st => { const fr = st.split('|').find(f => !/set \[as/.test(f)) || ''; const m = /:(\d+):(\d+)\)?\s*$/.exec(fr.trim()); if (!m || !src.length) return null; const L = +m[1], C = +m[2];
      for (const t of src) { const ln = t.split('\n')[L - 1]; if (ln && ln.length >= C) return ln.slice(Math.max(0, C - 160), C + 60); } return null; };
    return { bj, bs: bs.map(x => ({ ...x, codice: snip(x.st) })), voli: (window.__CPM_VOLO274 || []).slice() };
  });
  const tele = r.bj.filter(x => x.dt > 0 && (x.src === 'arco' && x.al != null && x.ad > 0 ? x.d > 2 * (x.al * x.dt / x.ad) + 1 : x.d / x.dt > 50));
  console.log(`\n### ${nome}: fasi ${fasi.length} · salti scoperti in conclusione ${r.bj.length}, non spiegati ${tele.length}: ${tele.map(x => `${x.src}:${x.d}u/${x.dt}s T${x.aT}/${x.ad} @${x.t}`).join(' ')}`);
  TOT += tele.length; VOLI += r.voli.length; VV.push(...r.voli); console.log(`  conclusioni col pallone lontano: ${r.voli.length} · ${r.voli.slice(0, 8).map(v => `${v.d0}u vmax ${v.vmax} u/s`).join(' · ')}`);
  if (process.env.CPM_PILE) for (const x of r.bs) console.log(`  set ${x.k} ${x.o}→${x.n} @${x.t}\n     pila: ${x.st.slice(0, 300)}\n     codice: ${x.codice ? x.codice.replace(/\s+/g, ' ') : '-'}`);
  await ctx.close();
}
/* [giro 274 PO-516] IL COLPO DI TESTA COL PALLONE LONTANO. Sulla 7.999.197 la partita «Ivo Mansi» ha prodotto al 25' un colpo di testa su
   azione d'angolo col pallone ancora sulla bandierina: 2 salti non spiegati (13,4 u e 8,5 u in un fotogramma). Che una partita produca
   quella scena dipende dal suo svolgimento: qui la si PROVOCA (scena forzata + __CPM_TESTA274_LONTANO, solo cpmtest: pallone sulla
   bandierina quando il colpo si arma), una pagina nuova per scena. Testimone __CPM_TESTA274 (in entrambi i bracci): distanza all'armo,
   velocita' di scena massima del pallone nell'attesa, distanza testa-pallone quando l'arco parte.
   VERDE: ogni scena giudicata, 0 salti non spiegati, velocita' <= 60 u/s, pallone arrivato (<= 1,0 u dalla testa).
   ROSSO (__CPM_NO_G274): in ogni scena la velocita' supera 150 u/s (il trascinamento di prima). Scena senza testimone = non giudicata = rosso. */
const GI = (process.env.CPM_GI || '6,7').split(',').map(Number); const TT = [];
for (const gi of GI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (!/senzaprov/.test(location.search + (r || ''))) window.__CPM_TESTA274_LONTANO = 1; if (r) r.split('+').forEach(x => window[x] = 1); }, ROSSO);
  let riga = { gi, w: null, tele: [], prima: 0, err: null };
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Testa 274' }); await sleep(1500);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(gi => { window.__CPM_BJ478 = []; window.__CPM_TESTA274 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    const k = await page.evaluate(gi => { const s = SITUATIONS[gi]; return (s.actions || s.a || []).findIndex(a => { try { return (deriveHL(s, a) || {}).type === 'header'; } catch (e) { return false; } }); }, gi);
    await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, Math.max(0, k));
    /* si aspetta l'EVENTO (l'arco del colpo e' partito: il testimone scrive `arrivo`), non un tempo fisso; tetto 40 s */
    await page.waitForFunction(() => (window.__CPM_TESTA274 || []).some(w => w.arrivo != null), null, { timeout: 40000 }).catch(() => {});
    await sleep(600);
    const r = await page.evaluate(() => ({ w: (window.__CPM_TESTA274 || [])[0] || null, bj: (window.__CPM_BJ478 || []).filter(x => !x.mask && !x.nascosto && x.ph === 'hl_result') }));
    riga.w = r.w;
    /* si giudicano i salti DA QUANDO il colpo si arma (t0 del testimone): quelli di prima sono della costruzione dell'azione, un altro
       scrittore (misurato su gi6 anche SENZA provocazione: «buildup-volo+testa» 7,2 u in un fotogramma) e si dichiarano a parte. */
    riga.prima = r.bj.filter(x => !r.w || x.t < r.w.t0).length;
    riga.tele = r.bj.filter(x => r.w && x.t >= r.w.t0).filter(x => x.dt > 0 && (x.src === 'arco' && x.al != null && x.ad > 0 ? x.d > 2 * (x.al * x.dt / x.ad) + 1 : x.d / x.dt > 50));
  } catch (e) { riga.err = String(e && e.message || e).slice(0, 160); }
  console.log(`### testa provocata gi${gi}: ${riga.w ? `armo a ${riga.w.d0}u dalla testa · velocita' massima ${riga.w.vmax} u/s · all'avvio dell'arco ${riga.w.arrivo}u` : 'NON GIUDICATA (nessun testimone)'} · salti non spiegati ${riga.tele.length}: ${riga.tele.map(x => `${x.src}:${x.d}u/${x.dt}s`).join(' ')} · salti prima dell'armo (costruzione, fuori da questo controllo) ${riga.prima || 0}${riga.err ? ' · errore ' + riga.err : ''}`);
  if (process.env.CPM_PILE) console.log('  ' + JSON.stringify(riga.tele)); TT.push(riga); await ctx.close();
}
const T_GIUD = TT.length > 0 && TT.every(t => t.w && t.w.d0 > 4 && t.w.arrivo != null), T_SALTI = TT.reduce((a, t) => a + t.tele.length, 0), T_VM = TT.filter(t => t.w).map(t => t.w.vmax);
const T_VERDE = T_GIUD && T_SALTI === 0 && T_VM.every(v => v <= 60) && TT.every(t => t.w.arrivo <= 1.0), T_ROSSO = T_GIUD && T_VM.every(v => v > 150);
console.log(`\nTESTA col pallone lontano: scene ${TT.length}, giudicate ${TT.filter(t => t.w && t.w.arrivo != null).length} · salti non spiegati ${T_SALTI} · velocita' massima ${T_VM.length ? Math.max(...T_VM) : null} u/s`);
await b.close(); srv.close();
const VM = VV.length ? Math.max(...VV.map(v => v.vmax)) : null;
console.log(`\nTOTALE salti non spiegati in conclusione: ${TOT} · conclusioni col pallone lontano ${VOLI} · velocita' massima del pallone nel caricamento ${VM} u/s`);
if (process.argv.includes('--guardiano')) { if (SOLO_TESTA && !ROSSO) { console.log('❌ corsa parziale (CPM_SOLO_TESTA): non vale come verde'); process.exit(3); }
  if (!T_GIUD) { console.log('❌ non giudicato: una scena del colpo di testa non ha il testimone (pallone lontano all\'armo e arco partito)'); process.exit(2); }
  if (PARTITE && VV.length < 1) { console.log('❌ sonda cieca: nessuna conclusione col pallone lontano'); process.exit(2); }
  const ok = ROSSO ? ((!PARTITE || !(R_VOLO || !R_TESTA) || VM > 150) && (!R_TESTA || T_ROSSO)) : (TOT === 0 && VM <= 60 && T_VERDE); console.log(ok ? `✅ ${ROSSO ? 'ROSSO come atteso' : 'PASS salti-274'}` : `❌ ${ROSSO ? 'il rosso non riproduce' : 'FAIL salti-274'}`); process.exit(ok ? 0 : 1); }
