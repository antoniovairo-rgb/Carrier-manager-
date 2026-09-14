#!/usr/bin/env node
/* [STRUMENTO] IL LABORATORIO VEDE IL CODICE 007? — e sotto quale regime.
   La nota del 7.598 dichiarava che no: «il laboratorio gira a ~7 fps e ventisei inversioni al secondo
   stanno oltre Nyquist». Ma la causa non e' il numero di fotogrammi, e' il `dt`: le reti di legalita'
   correggono al massimo dt*2,5 rad per fotogramma, quindi a dt 0,05 (laboratorio) chiudono in una
   passata e a dt 0,0167 (telefono) non chiudono e si riarmano ogni fotogramma, duellando con la
   morbidezza. Con `__CPM_DT60` il tempo di SCENA avanza di 1/60 per fotogramma renderizzato: stessa
   aritmetica del telefono, wall-clock piu' lento. Qui si verifica se in quel regime il detector VERO
   (`__CPM_DRAFTNOTE`) accende la riga che sul telefono si accende.
     CPM_DT60=1 node sguardo-696.mjs   ·   senza, il regime storico del laboratorio                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
/* ⚠️ [7.699] QUATTRO MONDI FISSI INVECE DI UNO. Fissare l'avversario ha dato la ripetibilita' (due
   passate identiche riga per riga) ma ha stretto il campione: il mondo e' deterministico, quindi la
   partita produce SEMPRE le stesse cinque scene e poi finisce — con budget quadruplicato il campione
   non si e' mosso di una scena. Ripetibile e stretto sono due difetti diversi e si curano insieme:
   piu' mondi FISSI, ciascuno deterministico, e il campione e' la loro unione. */
const NOMI = (process.env.CPM_NOMI || 'Sg,Sh,Si,Sj').split(',').map(x => x.trim()).filter(Boolean);
let iMondo = 0;
const SCENE_TARGET = +(process.env.CPM_SCENES || 10);
const BUDGET_MS = +(process.env.CPM_BUDGET_MS || 1500000);
const DT60 = false;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
/* ⚠️ [7.699] I GLB SI ACCENDONO. La sonda girava con i personaggi GLB SPENTI «per velocita'», ed e' la
   trappola gia' documentata nel 7.665 con queste parole: «il gate gira GLB-OFF per velocita' — ecco
   perche' le mie fotografie mostravano il campo vuoto e il telefono del PO no: la sonda non vedeva il
   mondo in cui il difetto esisteva». Il PO gioca con i GLB, e il codice 001 lo vede lui e non io.
   Con CPM_GLB=0 si torna al regime veloce per i confronti che non dipendono dai corpi. */
await page.addInitScript(r => { window.__CPM_GLB = !r.glbOff; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
  for (const k of r.rossi) window['__CPM_NO' + k] = true;
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {} }, { rossi: (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean), glbOff: process.env.CPM_GLB === '0' });
await openMatch(page, port, { skipLoadAll: true, name: NOMI[iMondo % NOMI.length] });
await sleep(700);
let secchi = 0, scene = 0; const righe = [];
const t0 = Date.now();
while (scene < SCENE_TARGET && Date.now() - t0 < BUDGET_MS) {
  const ph = await matchPhase(page);
  if (ph === 'ended' || ph === 'ceremony' || ph === 'shootout') { secchi = 0; iMondo++; try { await openMatch(page, port, { skipLoadAll: true, name: NOMI[iMondo % NOMI.length] }); await sleep(700); } catch (e) { break; } continue; }
  if (ph == null) { if (++secchi >= 12) { secchi = 0; iMondo++; try { await openMatch(page, port, { skipLoadAll: true, name: NOMI[iMondo % NOMI.length] }); await sleep(700); } catch (e) { break; } } else await sleep(700); continue; }
  secchi = 0;
  if (ph === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose'; } catch (e) { return false; } }, { timeout: 60000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }
  const sit = await page.evaluate(() => { try { return window.__CPM_CURSIT && window.__CPM_CURSIT(); } catch (e) { return null; } }).catch(() => null);
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  /* ⚠️ IL CONTESTO SI PRENDE MENTRE LA SCENA E' ANCORA VIVA. Prendendolo dopo, `hlIdx` e `outcome`
     erano gia' passati alla scena successiva e il detector giudicava questa scena con il contesto di
     un'altra: il codice 001 si SPOSTAVA di scena fra due passate identiche. E' la stessa forma di
     errore gia' pagata tre volte oggi — misurare in un istante in cui lo stato non e' piu' quello
     della cosa che sto misurando. */
  await page.waitForFunction(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_result'; } catch (e) { return false; } }, { timeout: 30000 }).catch(() => {});
  const ctxVivo = await page.evaluate(() => { try { return window.__CPM_BUGCTX ? window.__CPM_BUGCTX(null) : null; } catch (e) { return null; } }).catch(() => null);
  await page.waitForFunction(() => { try { return !window.__CPM_PHASE || window.__CPM_PHASE() !== 'hl_result'; } catch (e) { return true; } }, { timeout: 90000 }).catch(() => {});
  scene++; await sleep(200);
  const r = await page.evaluate((cv) => {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!snap || !snap.samples || !snap.samples.length) return null;
    const S = snap.samples; const ks = S.map(s => s.sk).filter(k => k != null && k >= 0);
    if (!ks.length) return null;
    const k = Math.max(...ks); const W = S.filter(s => s.sk === k);
    if (W.length < 8) return null;
    /* ⚠️ il detector si chiama COME LO CHIAMA IL GIOCO: col contesto vero (`__CPM_BUGCTX`), non con la
       sola chiave di scena. Senza `intent`/`out` il test «scena difensiva?» e' sempre falso e il codice
       001 scattava anche su una `recover`, dove per progetto non deve uscire. */
    let ctx = cv ? { ...cv } : null;
    if (ctx) ctx.sceneKey = k; else ctx = { sceneKey: k };
    let txt = ''; try { txt = window.__CPM_DRAFTNOTE(snap, ctx) || ''; } catch (e) { txt = 'ERR ' + e.message; }
    /* ⚠️ la riga del detector si accende solo oltre soglia: su sette scene ne accende una, e su UN
       campione non si giudica niente. Qui si calcola la STESSA matematica (inversioni del solo yaw,
       per secondo reale, escludendo gli stacchi) per OGNI scena, cosi' il metro ha risoluzione su
       tutte invece che sulle sole fuori soglia. */
    let yRev = 0, yPrev = 0, pass = 0, passN = 0;
    const t0 = W[0].t, t1 = W[W.length - 1].t; const dur = Math.max(0.001, (t1 - t0) / 1000);
    for (let i = 1; i < W.length; i++) { const a = W[i - 1], b = W[i];
      if (a.lx == null || b.lx == null || a.cx == null || b.cx == null) continue;
      const y1 = Math.atan2(a.lx - a.cx, a.lz - a.cz), y2 = Math.atan2(b.lx - b.cx, b.lz - b.cz);
      let dy = ((y2 - y1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      if (Math.abs(dy) > 0.006) { if (yPrev && Math.sign(dy) !== Math.sign(yPrev)) yRev++; yPrev = dy; } }
    for (const q of W) { if (q.wl == null) continue; pass += Math.floor(Math.round(q.wl) / 10); passN++; }
    /* ⚠️ QUANTO VELOCE RUOTA UNA PANORAMICA VERA. Il freno del 7.671 taglia a 150 gradi/s e non si
       accende mai (il tremore viaggia a 66-120). Prima di abbassarlo serve sapere di quanto si puo':
       il censimento esistente misura la velocita' POSIZIONALE della camera (43,8 u/s mediana), che non
       dice niente sull'asse ottico. Qui si raccolgono i gradi/s dello yaw fotogramma per fotogramma,
       separando i campioni con inversione (il tremore) da quelli SENZA (la panoramica legittima):
       il tetto giusto, se esiste, sta fra i due. */
    const gsPan = [], gsRev = []; let yp2 = 0;
    for (let i = 1; i < W.length; i++) { const a2 = W[i - 1], b2 = W[i];
      if (a2.lx == null || b2.lx == null || a2.cx == null || b2.cx == null) continue;
      const dtm = (b2.t - a2.t) / 1000; if (!(dtm > 0.004 && dtm < 0.4)) continue;
      const y1 = Math.atan2(a2.lx - a2.cx, a2.lz - a2.cz), y2 = Math.atan2(b2.lx - b2.cx, b2.lz - b2.cz);
      let dy = ((y2 - y1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      const gs = Math.abs(dy) * 57.2958 / dtm; if (gs > 400) continue;
      const inverte = yp2 && Math.sign(dy) !== Math.sign(yp2) && Math.abs(dy) > 0.006;
      if (Math.abs(dy) > 0.006) yp2 = dy;
      (inverte ? gsRev : gsPan).push(gs); }
    return { n: W.length, txt, inv: +(yRev / dur).toFixed(2), pass: passN ? +(pass / passN).toFixed(2) : null, gsPan, gsRev };
  }, ctxVivo).catch(() => null);
  if (r) righe.push({ ...r, sit, mondo: NOMI[iMondo % NOMI.length] });
}
await b.close(); srv.close();
const rx = /lo SGUARDO della camera oscilla: ([\d.]+) inversioni\/s/;
const rxT = /la camera BECCHEGGIA: ([\d.]+) inversioni\/s/;
const rxS = /la CAMERA (?:trema|salta)/;
const osc = righe.map(r => { const m = rx.exec(r.txt); return m ? +m[1] : null; }).filter(v => v != null);
const bec = righe.map(r => { const m = rxT.exec(r.txt); return m ? +m[1] : null; }).filter(v => v != null);
const salt = righe.filter(r => rxS.test(r.txt)).length;
const invs = righe.map(r => r.inv).filter(v => v != null).sort((a, b2) => a - b2);
const passes = righe.map(r => r.pass).filter(v => v != null).sort((a, b2) => a - b2);
console.log(`\n=== CODICE 007 — LO SGUARDO ${process.env.CPM_ROSSO ? '· ROSSO ' + process.env.CPM_ROSSO : '· VERDE'} ===\n`);
if (invs.length) console.log(`  inversioni/s su OGNI scena: mediana ${invs[invs.length >> 1].toFixed(2)} · max ${invs[invs.length - 1].toFixed(2)} · scene sopra 2,0: ${invs.filter(v => v >= 2).length}/${invs.length}`);
if (passes.length) console.log(`  passate camera per fotogramma: mediana ${passes[passes.length >> 1].toFixed(2)} · max ${passes[passes.length - 1].toFixed(2)}`);
const pan = righe.flatMap(r => r.gsPan || []).sort((a, b2) => a - b2);
const rev = righe.flatMap(r => r.gsRev || []).sort((a, b2) => a - b2);
const q = (A, p) => A.length ? A[Math.min(A.length - 1, Math.floor(A.length * p))] : null;
if (pan.length) console.log(`  yaw SENZA inversione (panoramica): n ${pan.length} · mediana ${q(pan,0.5).toFixed(0)}°/s · p90 ${q(pan,0.9).toFixed(0)} · p99 ${q(pan,0.99).toFixed(0)} · max ${pan[pan.length-1].toFixed(0)}`);
if (rev.length) console.log(`  yaw CON inversione (tremore)   : n ${rev.length} · mediana ${q(rev,0.5).toFixed(0)}°/s · p90 ${q(rev,0.9).toFixed(0)} · max ${rev[rev.length-1].toFixed(0)}`);
console.log(`  scene utili: ${righe.length}`);
console.log(`  scene con «lo SGUARDO oscilla»  : ${osc.length}/${righe.length}${osc.length ? ` · inversioni/s ${Math.min(...osc).toFixed(1)}-${Math.max(...osc).toFixed(1)}` : ''}`);
console.log(`  scene con «la camera BECCHEGGIA»: ${bec.length}/${righe.length}${bec.length ? ` · inversioni/s ${Math.min(...bec).toFixed(1)}-${Math.max(...bec).toFixed(1)}` : ''}`);
console.log(`  scene con «la CAMERA trema/salta»: ${salt}/${righe.length}`);
console.log('');
for (const r of righe.slice(0, 6)) { const l = r.txt.split('\n').filter(x => /007/.test(x)); if (l.length) console.log('  · ' + l.join('\n  · ')); }
/* ⚠️ [7.698] LO STESSO GIRO CENSISCE TUTTI I CODICI, non solo il 007. Il regime che riproduce il
   tremore — highlight REATTIVI con avversario fisso — e' l'unico in cui il detector vero gira su
   scene vive: se il 001 («all'apertura il pallone non e' ai piedi di nessuno») vive qui, si vede
   qui. Il 7.680 dichiara quattro regimi provati senza mai riprodurlo (3-4 scene su 161): questo
   e' il quinto, ed e' l'unico che ha gia' dimostrato di contenere un difetto che il PO segnala. */
const CODICI = ['001', '003', '004', '006', '007', '011', '012', 'SALTO', 'uscita dal campo'];
console.log('\n  SCENE, UNA PER UNA (situazione · codici):');
for (const r of righe) { /* ⚠️ le righe della bozza arrivano con un puntino elenco davanti: filtrando su `^codice` la lista
     per-scena usciva TUTTA vuota mentre il censimento contava 2/5. Un elenco che dice «nessun difetto»
     accanto a un totale che ne conta due e' peggio di nessun elenco: si cerca DENTRO la riga. */
  const cods = r.txt.split('\n').map(x => x.trim()).filter(x => /codice \d|SALTO del pallone|uscita dal campo/.test(x)).map(x => { const m = x.match(/codice (\d+)/); return m ? m[1] : (/SALTO/.test(x) ? 'SALTO' : 'fuori'); }).join(',') || '—';
  const S = r.sit || {}; console.log(`    ${String(r.mondo||'?').padEnd(3)} ${String('gi' + (S.gi != null ? S.gi : '?')).padEnd(7)} type=${String(S.type || '?').padEnd(5)} def=${S.def ? 'SI' : 'no'} intent=${String(S.intent || '—').padEnd(10)} ${S.offBall ? 'OFF-BALL' : '        '} · ${cods}`); }
console.log('\n  CENSIMENTO DI TUTTI I CODICI su queste ' + righe.length + ' scene:');
for (const c of CODICI) { const n = righe.filter(r => r.txt.split('\n').some(x => x.includes('codice ' + c) || (c === 'SALTO' && /^SALTO/.test(x.trim())) || (c === 'uscita dal campo' && x.includes('uscita dal campo')))).length;
  console.log(`    ${String(c).padEnd(18)} ${n}/${righe.length}${n ? '  ' + (righe.find(r => r.txt.includes('codice ' + c) || (c === 'SALTO' && /SALTO/.test(r.txt)) || (c === 'uscita dal campo' && r.txt.includes('uscita dal campo'))).txt.split('\n').find(x => x.includes(c) || (c === 'SALTO' && /SALTO/.test(x))) || '').trim().slice(0, 120) : ''}`); }
console.log('');
