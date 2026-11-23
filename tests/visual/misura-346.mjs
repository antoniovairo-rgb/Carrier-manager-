#!/usr/bin/env node
/* SONDA giro 346 (PO-585) — «Ricevi fra le linee: hai spazio!» → «Tiro da fuori» → miss: «pallone tornato INDIETRO di 19,0 u
   (scrittore 16)», PO: «c'e' uno scambio con un compagno di squadra invisibile».
   Corpi GLB accesi, pagina NUOVA per scena, stacco di scena (__CPM_PRESENT=1) e copione del build-up (__CPM_CINE=1) accesi.
   La scena e' quella del motore (scenaDalMotoreLinee) costruita dall'occasione; l'azione si cerca per etichetta; l'esito e' fallito con
   tipo deciso dal gioco (nat) o forzato. Per fotogramma: testimone di bordo (__CPM_WATCH_SNAP: posizione + codice scrittore _ws524) e
   __CPM_PA457 (finestra d'esito: arco, post-arco, eroe). A scena finita si chiama il rilevatore del gioco (draftBugNote).
   Misure: arretramento massimo del pallone dal punto piu' avanzato (come il rilevatore: backDD), chi lo scriveva nel tratto all'indietro,
   e il corpo piu' vicino al pallone dove si ferma (di chi e', quanto dista, se e' visibile).
   Casi: `seme:etichetta:kind[:x:y[:press[:liberi]]]`
     CPM_CHROME=… node misura-346.mjs   (CPM_CASI=… · CPM_PAR=3 · CPM_ROSSO=__CPM_NO_G346A · CPM_GLB=0 · CPM_JSON=file · CPM_BOZZE=1) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const PAR = +(process.env.CPM_PAR || 3), GLB = process.env.CPM_GLB !== '0', ROSSO = process.env.CPM_ROSSO || '';
export const WS = ['—', 'scena', 'arco', 'inseguitore', 'portatore', 'addosso', 'palo', 'respinta', 'ricevente-cross', 'ricevente-pass', 'consegna', 'buildup-aereo', 'buildup-fine', 'buildup-volo', 'testa', '15', 'esito'];
export function parseCasi(s) { return s.split(',').map(q => q.trim()).filter(Boolean).map(q => { const [seme, et, k, x, y, pr, lib] = q.split(':'); return { seme: +seme || 0, cat: /^G\d+$/.test(seme) ? +seme.slice(1) : null, et: /^\d+$/.test(et) ? +et : et, k: k || 'nat', x: x != null && x !== '' ? +x : 62, y: y != null && y !== '' ? +y : 50, press: pr != null && pr !== '' ? +pr : 0.6, liberi: lib != null ? +lib : 1, id: q }; }); }
/* arretramento: come il rilevatore, dal punto piu' avanzato (x mondo, la porta avversaria e' a +x) */
export function arretra(S) { let mx = -1e9, dd = 0, iMx = -1, iDd = -1, a = -1;
  for (let i = 0; i < S.length; i++) { if (S[i].x > mx) { mx = S[i].x; a = i; } if (mx - S[i].x > dd) { dd = mx - S[i].x; iDd = i; iMx = a; } }
  const ws = {}; if (iDd >= 0) for (let i = iMx + 1; i <= iDd; i++) { const d = S[i - 1].x - S[i].x; if (d > 0) { const k = WS[S[i].ws | 0] || ('?' + S[i].ws); ws[k] = +((ws[k] || 0) + d).toFixed(2); } }
  return { dd: +dd.toFixed(1), da: iMx >= 0 ? { x: S[iMx].x, z: S[iMx].z, t: S[iMx].t } : null, a: iDd >= 0 ? { x: S[iDd].x, z: S[iDd].z, t: S[iDd].t } : null, ws }; }
export async function caso(b, port, c, rosso, glb = GLB) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(([r, g]) => { window.__CPM_GLB = !!g; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_G346W = []; for (const k of String(r || '').split('+')) if (k) window[k] = 1; }, [rosso, glb]);
  const o = { id: c.id, k: c.k };
  try {
    if (c.vivo) { await openMatch(page, port, { skipLoadAll: true, name: 'Giro346' }); await sleep(1500); } else { await openMatch(page, port); await sleep(800); }/* vivo: partita vera col motore acceso (la scena forzata la gioca giocaScena) */
    const sc = await page.evaluate(([c]) => { let s = null, seed = 0;
      if (c.cat != null) { const sit = SITUATIONS[c.cat]; if (!sit) return { err: 'scena assente' }; const k = typeof c.et === 'number' ? c.et : sit.actions.findIndex(a => String(a.label).indexOf(c.et) >= 0); const a = sit.actions[k]; if (!a) return { err: 'azione assente' };
        let h = {}; try { h = deriveHL(sit, a) || {}; } catch (e) {} return { idx: c.cat, k, seed: 0, text: sit.text, label: a.label, acts: sit.actions.map(q => q.label), ht: h.type || null, hv: h.variant || null }; }
      const occ = { tipo: 'fra-le-linee', zona: 'trequarti', x: c.x, y: c.y, press: c.press, liberi: c.liberi, cast: {} };
      for (let q = 1 + c.seme * 4000; q < 4000 + c.seme * 4000 && !s; q++) { const t = scenaDalMotoreLinee({ ...occ }, { stats: { tiro: 70, tecnica: 70, dribbling: 60, passaggio: 60, velocità: 60 } }, q);
        if (t && /Ricevi fra le linee/.test(t.text) && t.actions.some(a => String(a.label).indexOf(c.et) >= 0)) { s = t; seed = q; } }
      if (!s) return { err: 'scena del motore non costruita' };
      SITUATIONS.push(s); const idx = SITUATIONS.length - 1; const k = s.actions.findIndex(a => String(a.label).indexOf(c.et) >= 0); const a = s.actions[k];
      let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {}
      return { idx, k, seed, text: s.text, label: a.label, acts: s.actions.map(q => q.label), ht: h.type || null, hv: h.variant || null, sz: s.startZone || s.sz || null }; }, [c]);
    if (sc.err) { o.err = sc.err; await page.close(); return o; }
    Object.assign(o, { gi: sc.idx, ai: sc.k, sit: sc.text, act: sc.label, acts: sc.acts, ht: sc.ht, hv: sc.hv });
    if (!await page.evaluate(([g, ch]) => window.__CPM_FORCE_SIT(g, ch), [sc.idx, !c.passi])) { o.err = 'force fallito'; await page.close(); return o; }
    await sleep(1500);
    if (c.passi) { o.passi = 0; await page.evaluate(() => { window.__CPM_FROZEN = false; });/* i passi veri, dai tasti (stesso ingresso del pad: _moveGain317 + _passo346) */
      for (let i = 0; i < c.passi; i++) { const m0 = await page.evaluate(() => window.__CPM_MOVES); await page.keyboard.down(c.dir || 'ArrowUp');/* il tasto resta giu' finche' il gioco non ha contato il passo (evento, non tempo fisso: il ciclo dei tasti gira a fotogrammi, e sul banco un fotogramma puo' durare piu' del tocco) */
        let m1 = m0; for (let q = 0; q < 80 && !(m1 < m0); q++) { await sleep(100); m1 = await page.evaluate(() => window.__CPM_MOVES); }
        await page.keyboard.up(c.dir || 'ArrowUp'); await sleep(600); if (m1 < m0) o.passi++; }
      o.faseDopo = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); }
    await page.evaluate(k => { window.__CPM_FROZEN = false; window.__CPM_PA457 = []; if (k !== 'libero') window.__CPM_FORCE_OUTCOME = k === 'gol' ? 'success' : 'fail'; if (k !== 'gol' && k !== 'nat' && k !== 'libero') window.__CPM_FORCE_KIND = k; }, c.k);
    await page.evaluate(a => window.__CPM_RESOLVE(a), sc.k);
    let out = null; for (let i = 0; i < 60 && !out; i++) { out = await page.evaluate(() => { const q = window.__CPM_OUTCOME; return q ? { key: q.outKey || q.key || null, kind: q.outKind || null, ok: !!q.ok } : null; }).catch(() => null); if (!out) await sleep(100); }
    o.out = out;
    if (c.k === 'libero') { await sleep(600); o.sc137 = await page.evaluate(() => (window.__CPM_SCENA137 || []).slice(-1)[0] || null); await page.close(); return o; }
    const t0 = Date.now(); let fineOk = false;
    while (Date.now() - t0 < 150000) { await sleep(500);
      const s = await page.evaluate(() => { const R = window.__CPM_PA457 || []; let arm = false, q = 0; for (const r of R) { if (r.arc || r.pt) { arm = true; q = 0; } else if (arm) q += r.adt; } return { n: R.length, arm, q }; });
      if ((s.arm && s.q >= 1.2) || s.n >= 890) { fineOk = true; break; } }
    o.fineOk = fineOk;
    const d = await page.evaluate(() => { const snap = (window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP()) || null; let ctx = null, bozza = null;
      try { ctx = window.__CPM_BUGCTX ? window.__CPM_BUGCTX() : null; bozza = (typeof draftBugNote === 'function' && snap) ? draftBugNote(snap, ctx) : null; } catch (e) { bozza = 'ERR ' + e.message; }
      const S = snap ? snap.samples.filter(q => ctx && ctx.sceneKey != null ? q.sk === ctx.sceneKey : true).map(q => ({ t: Math.round(q.t), x: +q.x.toFixed(2), y: +q.y.toFixed(2), z: +q.z.toFixed(2), f: q.f, ws: q.ws })) : [];
      return { sc137: (window.__CPM_SCENA137 || []).slice(-1)[0] || null, pa: (window.__CPM_PA457 || []).slice(), bozza, S, w: (window.__CPM_G346W || []).slice(0, 400), vic: window.__CPM_VIC346 ? window.__CPM_VIC346() : null }; });
    Object.assign(o, { sc137: d.sc137, pa: d.pa, bozza: d.bozza, S: d.S, w: d.w, vic: d.vic, errs: errs.slice(0, 2) });
    o.R = arretra(d.S); o.Rpa = arretra(d.pa.map(r => ({ x: r.bx, z: r.bz, t: r.t, ws: r.pt ? 16 : r.arc ? 2 : 0 })));
    o.c012 = /codice 012/.test(String(d.bozza || ''));
    const f = d.pa[d.pa.length - 1]; o.fine = f ? { bx: f.bx, bz: f.bz, dEroe: +Math.hypot(f.bx - f.hx, f.bz - f.hz).toFixed(1) } : null; o.col = d.w.some(q => q.col); o.tx = d.w.length ? d.w[d.w.length - 1].tx : null;
  } catch (e) { o.err = String(e.message || e).slice(0, 160); }
  await page.close().catch(() => {});
  return o;
}
export async function corri(casi, rosso, par = PAR, glb = GLB, log = true) {
  const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
  const out = new Array(casi.length); let nx = 0;
  await Promise.all(Array.from({ length: Math.min(par, casi.length) }, async () => { while (nx < casi.length) { const i = nx++; out[i] = await caso(b, port, casi[i], rosso, glb); if (log) console.log(riga(out[i])); } }));
  await b.close(); srv.close(); return out; }
export function riga(o) { if (o.err) return `  ?? ${o.id}: ${o.err}`;
  const pts = [...new Set(o.pa.map(r => r.pt).filter(Boolean))].join('/');
  return `  ${o.R.dd >= 12 ? '↩️' : '· '} ${String(o.id).padEnd(28)} ${String(o.ht).padEnd(6)} esito ${String(o.out && o.out.key).padEnd(9)} tipo ${String(o.out && o.out.kind).padEnd(11)} camp ${String(o.S.length).padStart(3)} INDIETRO ${o.R.dd.toFixed(1).padStart(5)} u` +
    (o.R.da ? ` (da x ${o.R.da.x} a x ${o.R.a.x}; scrive ${Object.entries(o.R.ws).map(([k, v]) => k + ' ' + v).join(' · ') || '—'})` : '') + ` · finestra d'esito ${o.Rpa.dd.toFixed(1)} u · post-arco ${pts || '—'}${o.c012 ? ' · RILEVATORE: 012' : ''}${o.fineOk ? '' : ' · (fine non vista)'}`; }
if (import.meta.url === `file://${process.argv[1]}`) {
  const DEF = '0:Tiro da fuori:nat,1:Tiro da fuori:nat,2:Tiro da fuori:nat,0:Tiro da fuori:nat:58:40,0:Tiro da fuori:nat:66:60,0:Tiro da fuori:wide,0:Tiro da fuori:saved,0:Tiro da fuori:blocked,0:Tiro da fuori:post';
  const casi = parseCasi(process.env.CPM_CASI || DEF);
  console.log(`misura-346 · ${casi.length} casi · GLB ${GLB ? 'accesi' : 'spenti'} · ${ROSSO || 'verde'}`);
  const out = await corri(casi, ROSSO);
  for (const o of out) if (o.bozza && process.env.CPM_BOZZE) console.log(`  [${o.id}] ${o.bozza}`);
  if (process.env.CPM_JSON) fs.writeFileSync(process.env.CPM_JSON, JSON.stringify(out));
  process.exit(0);
}
