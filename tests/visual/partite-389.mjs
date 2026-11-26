#!/usr/bin/env node
/* SONDA giro 389 (PO-671) — IL FALLO CERCATO NELLE PARTITE VERE. Partita vera dal provino (pagina nuova per partita, `name` cambia il
   seme), regime «gioco» (__CPM_PRESENT=1). Per provocare il caso: il motore chiede occasioni «spalle» (__CPM_TIPO_OCC, solo cpmtest:
   sono le scene in area/al limite che offrono «Resisti alla carica e cerca il fallo»), il pilota sceglie la giocata del fallo quando c'e'
   (politica «re») e ogni esito dell'eroe e' forzato riuscito (__CPM_FORCE_OUTCOME, solo cpmtest). Per ogni fallo cercato riuscito si registra il
   punto (testimone del motore __CPM_F389 col verde; col rosso il punto lo da' il registro del live) e cosa succede nei due minuti di
   gioco dopo: rigore o punizione fischiati (per chi, dove), scena del rigore aperta, rigore calciato.
   Uso: CPM_CHROME=… node partite-389.mjs   (CPM_NOMI=a,b · CPM_ROSSO=1 → __CPM_NO_G389 · CPM_TETTO=300 s · CPM_PAR=2 · CPM_OUT=file) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO, TETTO = +(process.env.CPM_TETTO || 300) * 1000, PAR = +(process.env.CPM_PAR || 2);
const NOMI = (process.env.CPM_NOMI || 'Rossi389,Bianchi389,Verdi389,Neri389').split(',');
const RE = "cerca il fallo|il fallo c'è|provocator";
export async function giocaFallo(b, port, nome, rosso, tetto = TETTO) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_TIPO_OCC = 'spalle'; window.__CPM_OFFRI389 = 1; if (r) window.__CPM_NO_G389 = 1;
    const W = window.__W389 = []; const sem = e => ({ t: e.t, min: e.min, x: e.x, y: e.y, per: e.per, scena: !!e.scena, k: e.kind || (e.origine && e.origine.kind) || e.intent || null, chi: e.chi && (e.chi.eroe ? 'EROE' : e.chi.nome), esito: e.esito || null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null });
    const RX = /^(rigore|fallo|occasione_eroe|battuta|tiro|gol)$/;
    const arma = () => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (M && !M.__w389) { M.__w389 = 1;
      const T = M.tick; M.tick = function () { const r = T.apply(this, arguments); try { for (const e of (Array.isArray(r) ? r : [])) if (e && RX.test(e.t)) W.push(sem(e)); } catch (_e) {} return r; };
      const R = M.risolviEroe.eventi; M.risolviEroe.eventi = function (k, d) { const r = R.apply(this, arguments); try { W.push({ t: 'SCENA', key: k, min: M._S.min | 0, p: d && d.punto389 ? d.punto389 : null, eroe: { x: +M._g[M.HERO].x.toFixed(1), y: +M._g[M.HERO].y.toFixed(1) } }); for (const e of r || []) if (e && RX.test(e.t)) W.push(sem(e)); } catch (_e) {} return r; }; } } catch (e) {} };
    setInterval(arma, 100);
    const F = window.__P389 = []; let last = ''; setInterval(() => { try { const ph = window.__CPM_PHASE ? window.__CPM_PHASE() : ''; if (ph !== last) { F.push({ ph, min: (window.__CPM_STATE && window.__CPM_STATE().clock) | 0, t: Date.now() }); last = ph; } } catch (e) {} }, 100);
  }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  /* pilota: sceglie il fallo cercato quando c'e'; ogni giocata dell'eroe e' riuscita (stesso forzato nei due bracci) */
  await page.evaluate(re => { window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7, policy: 're', re, tickMs: 150 });
    window.__CPM_FORCE_OUTCOME = 'success'; }, RE);
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < tetto) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => 'x'); if (ph === 'ended' || ph === 'ceremony' || ph === 'x') break;
    const n = await page.evaluate(() => (window.__W389 || []).filter(e => e.t === 'SCENA' && e.key === 'win_freekick').length).catch(() => 0);
    if (n >= 3) { await sleep(25000); break; } await sleep(500); }
  const R = await page.evaluate(() => ({ SC: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e && e.ev === 'scena').map(e => ({ min: e.min, src: e.src || null, kind: e.kind || null })), wrapped: !!(window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() && window.__CPM_MOTORE_OBJ().__w389), W: window.__W389 || [], F389: window.__CPM_F389 || [], P: window.__P389 || [], min: (window.__CPM_STATE && window.__CPM_STATE().clock) | 0 })).catch(() => ({ W: [], F389: [], P: [], min: null }));
  await page.close();
  /* ogni fallo cercato riuscito e i due minuti di gioco che seguono */
  const casi = [];
  R.W.forEach((e, i) => { if (e.t !== 'SCENA' || e.key !== 'win_freekick') return; const dopo = R.W.slice(i + 1).filter(q => q.min != null && q.min <= e.min + 3);
    const stop = dopo.findIndex(q => q.t === 'SCENA'); const fin = stop >= 0 ? dopo.slice(0, stop) : dopo;
    const rig = fin.find(q => q.t === 'rigore'), pun = fin.find(q => q.t === 'fallo' && q.per === 'home'), puA = fin.find(q => q.t === 'fallo' && q.per === 'away' && q.scena);
    const occ = fin.find(q => q.t === 'occasione_eroe' && (q.k === 'rigore' || q.k === 'punizione'));
    const tirR = R.W.slice(i + 1).find(q => q.t === 'tiro' && q.k === 'penalty' && q.min <= e.min + 6);
    const scR = R.P.find(p => /^hl_/.test(p.ph) && p.min >= e.min && p.min <= e.min + 6) || null;
    const scP = (R.SC || []).find(q => q.min >= e.min && q.min <= e.min + 4 && q.src === 'brain-origine' && (q.kind === 'rigore' || q.kind === 'punizione')) || null;
    const dec = R.F389.find(q => q.fase === 'deciso' && q.min === e.min) || null;
    casi.push({ min: e.min, punto: e.p || null, eroeMotore: e.eroe, dec: dec ? dec.kind : null, rigore: rig ? { x: rig.x, y: rig.y, per: rig.per } : null, punizione: pun ? { x: pun.x, y: pun.y } : null, puAvv: puA ? { x: puA.x, y: puA.y } : null, occ: occ ? occ.k : null, tiroRigore: tirR ? { chi: tirR.chi, esito: tirR.esito, ph: tirR.ph } : null, scenaDopo: !!scR, scenaPiazzato: scP ? scP.kind : null }); });
  return { SC: (R.SC || []).slice(0, 8), nome, ph, min: R.min, wrapped: R.wrapped, nW: R.W.length, scene: R.W.filter(e => e.t === 'SCENA').map(e => e.key), casi };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const tutti = []; let nx = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { const b = await launchBrowser(); while (nx < NOMI.length) { const nm = NOMI[nx++];
    try { const G = await giocaFallo(b, port, nm, ROSSO); tutti.push(G); console.log(JSON.stringify(G)); } catch (e) { console.log(`  ${nm}: NON GIOCATA (${String(e.message || e).split('\n')[0].slice(0, 120)})`); } } await b.close(); }));
  srv.close(); const C = tutti.flatMap(g => g.casi);
  const dentro = C.filter(c => c.dec === 'pen' || (c.punto == null && c.rigore)), fuori = C.filter(c => c.dec === 'foul');
  console.log(`\n  ${ROSSO ? 'PRIMA (__CPM_NO_G389)' : 'DOPO'} — ${tutti.length} partite · ${C.length} falli cercati riusciti · rigori fischiati ${C.filter(c => c.rigore).length} · punizioni per noi ${C.filter(c => c.punizione).length} · «fallo» per gli avversari dalla scena ${C.filter(c => c.puAvv).length} · niente ${C.filter(c => !c.rigore && !c.punizione).length}`);
  if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify(tutti));
  process.exit(0);
}
