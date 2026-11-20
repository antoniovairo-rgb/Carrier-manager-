#!/usr/bin/env node
/* SONDA giro 301 (PO-588) — «esito miss ma la palla e' finita IN RETE».
   Corpi GLB accesi, pagina NUOVA per scena, stacco di scena attivo (__CPM_PRESENT=1), copione del build-up acceso (__CPM_CINE=1).
   Per ogni caso: forza la scena, sceglie l'azione, risolve con l'esito chiesto, e registra per fotogramma il pallone (__CPM_PA457:
   posizione, arco vivo, tipo di post-arco) e, dal testimone di bordo (__CPM_WATCH_SNAP), chi ha scritto il pallone (codice _ws524).
   A scena finita chiama il RILEVATORE DEL GIOCO (draftBugNote col contesto __CPM_BUGCTX, come fa il tasto ⚠️) e ne stampa la bozza.
   «In rete» = oltre la linea di porta (x 48,6), fra i pali (|z| <= 3,66) e sotto la traversa (y <= 2,44): la geometria del rilevatore.

   Casi: `gi:ai:kind[:x:y]` — gi = indice SITUATIONS oppure `P` (scena del motore «Palla buona al limite dell'area», costruita con
   scenaDalMotoreConclusione e aggiunta in coda a SITUATIONS: `P<n>` la mette n posti piu' in la', cosi' cambia il seme dell'esito);
   ai = indice dell'azione oppure un pezzo della sua etichetta; kind = nat (fallita, tipo d'esito deciso dal gioco) · wide · post ·
   saved · blocked (forzati con __CPM_FORCE_KIND) · gol (riuscita).
     CPM_CHROME=… node misura-301.mjs            (CPM_CASI='P:Piazzato:nat,…' · CPM_PAR=3 · CPM_ROSSO=__CPM_NO_G301 · CPM_GLB=0 · CPM_JSON=file) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

export const LINEA = 48.6, PALI = 3.66, TRAVERSA = 2.44;
const PAR = +(process.env.CPM_PAR || 3), GLB = process.env.CPM_GLB !== '0', ROSSO = process.env.CPM_ROSSO || '';

export function parseCasi(s) { return s.split(',').map(q => q.trim()).filter(Boolean).map(q => { const [gi, ai, k, x, y] = q.split(':'); return { gi, ai: /^\d+$/.test(ai) ? +ai : ai, k: k || 'nat', pp: x != null ? { x: +x, y: +y } : null, id: q }; }); }

/* dove e come il pallone passa la linea di porta: primo attraversamento da dentro a fuori, punto interpolato */
export function analizza(pa) {
  let cross = null, maxX = -1e9, dentroN = 0;
  for (let i = 0; i < pa.length; i++) { const r = pa[i]; if (r.bx > maxX) maxX = r.bx;
    const in_ = r.bx >= LINEA && Math.abs(r.bz) <= PALI && r.by <= TRAVERSA; if (in_) dentroN++;
    if (!cross && i > 0 && pa[i - 1].bx < LINEA && r.bx >= LINEA) { const a = pa[i - 1], u = (LINEA - a.bx) / Math.max(1e-6, r.bx - a.bx);
      cross = { i, z: +(a.bz + (r.bz - a.bz) * u).toFixed(2), y: +(a.by + (r.by - a.by) * u).toFixed(2), pt: r.pt || null, arc: !!r.arc, ptPrima: a.pt || null, arcPrima: !!a.arc, salto: +Math.hypot(r.bx - a.bx, r.bz - a.bz).toFixed(2) }; } }
  if (!cross && pa.length && pa[0].bx >= LINEA) cross = { i: 0, z: pa[0].bz, y: pa[0].by, pt: pa[0].pt || null, arc: !!pa[0].arc, gia: 1 };
  const fine = pa[pa.length - 1] || null;
  const fraPali = !!cross && Math.abs(cross.z) <= PALI && cross.y <= TRAVERSA;
  return { n: pa.length, maxX: +maxX.toFixed(2), cross, fraPali, dentroN, inRete: dentroN > 0,/* almeno un fotogramma con il pallone dentro la porta */
    fine: fine ? { x: fine.bx, z: fine.bz, y: fine.by, dentro: fine.bx >= LINEA && Math.abs(fine.bz) <= PALI && fine.by <= TRAVERSA } : null };
}

export async function caso(b, port, c, rosso, glb = GLB) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(([r, g, pv]) => { window.__CPM_GLB = !!g; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window[r] = 1; if (pv) window.__CPM_RETE301 = 1; }, [rosso, glb, !!c.prov]);
  const o = { id: c.id, k: c.k };
  try {
    await openMatch(page, port); await sleep(800);
    /* la scena */
    const sc = await page.evaluate(([gi, ai]) => {
      let idx;
      if (/^P/.test(String(gi))) { const pad = +(String(gi).slice(1) || 0); let s = null;
        for (let seed = 1; seed < 4000 && !s; seed++) { const t = scenaDalMotoreConclusione({ tipo: 'conclusione', zona: 'limite', x: 78, y: 50, press: 0.6, liberi: 0, cast: {} }, { stats: { tiro: 70, tecnica: 70, dribbling: 60, passaggio: 60, velocità: 60 } }, seed);
          if (t && /Palla buona al limite/.test(t.text) && t.actions.some(a => /Piazzato/.test(a.label))) s = t; }
        if (!s) return { err: 'scena del motore non costruita' };
        for (let i = 0; i < pad; i++) SITUATIONS.push(SITUATIONS[i]);
        SITUATIONS.push(s); idx = SITUATIONS.length - 1; }
      else idx = +gi;
      const sit = SITUATIONS[idx]; if (!sit) return { err: 'scena assente' };
      const k = typeof ai === 'number' ? ai : sit.actions.findIndex(a => String(a.label).indexOf(ai) >= 0);
      const a = sit.actions[k]; if (!a) return { err: 'azione assente' };
      let h = {}; try { h = deriveHL(sit, a) || {}; } catch (e) {}
      return { idx, k, text: sit.text, label: a.label, rew: a.rew, fail: a.fail, ht: h.type || null, hv: h.variant || null };
    }, [c.gi, c.ai]);
    if (sc.err) { o.err = sc.err; await page.close(); return o; }
    Object.assign(o, { gi: sc.idx, ai: sc.k, sit: sc.text, act: sc.label, rew: sc.rew, ht: sc.ht, hv: sc.hv });
    if (!await page.evaluate(([g, pp]) => window.__CPM_FORCE_SIT(g, true, pp || undefined), [sc.idx, c.pp])) { o.err = 'force fallito'; await page.close(); return o; }
    await sleep(1500);
    await page.evaluate(k => { window.__CPM_FROZEN = false; window.__CPM_PA457 = []; window.__CPM_FORCE_OUTCOME = k === 'gol' ? 'success' : 'fail'; if (k !== 'gol' && k !== 'nat') window.__CPM_FORCE_KIND = k; }, c.k);
    await page.evaluate(a => window.__CPM_RESOLVE(a), sc.k);
    let out = null; for (let i = 0; i < 60 && !out; i++) { out = await page.evaluate(() => { const q = window.__CPM_OUTCOME; return q ? { key: q.outKey || q.key || null, kind: q.outKind || null, ok: !!q.ok, wood: q.woodwork || null, ovl: q.overlay || null } : null; }).catch(() => null); if (!out) await sleep(100); }
    o.out = out;
    /* EVENTO di fine: arco armato e poi arco + post-arco spenti per 1,2 s di SCENA (somma degli adt). Tetto di parete 150 s. */
    const t0 = Date.now(); let fineOk = false;
    while (Date.now() - t0 < 150000) { await sleep(500);
      const s = await page.evaluate(() => { const R = window.__CPM_PA457 || []; let arm = false, q = 0; for (const r of R) { if (r.arc || r.pt) { arm = true; q = 0; } else if (arm) q += r.adt; } return { n: R.length, arm, q }; });
      if ((s.arm && s.q >= 1.2) || s.n >= 890) { fineOk = true; break; } }
    o.fineOk = fineOk;
    const d = await page.evaluate(() => { const snap = (window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP()) || null; let ctx = null, bozza = null;
      try { ctx = window.__CPM_BUGCTX ? window.__CPM_BUGCTX() : null; bozza = (typeof draftBugNote === 'function' && snap) ? draftBugNote(snap, ctx) : null; } catch (e) { bozza = 'ERR ' + e.message; }
      const S = snap ? snap.samples.filter(q => ctx && ctx.sceneKey != null ? q.sk === ctx.sceneKey : true).slice(-400).map(q => ({ t: Math.round(q.t), x: +q.x.toFixed(2), y: +q.y.toFixed(2), z: +q.z.toFixed(2), f: q.f, ws: q.ws })) : [];
      return { g301: (window.__CPM_G301W || []).slice(), prov: (window.__CPM_RETE301L || []).length, pa: (window.__CPM_PA457 || []).slice(), bozza, S, fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null, ctx: ctx ? { out: ctx.out, ok: ctx.ok, intent: ctx.intent } : null }; });
    o.g301 = d.g301; o.prov = d.prov; o.pa = d.pa; o.bozza = d.bozza; o.S = d.S; o.fase = d.fase; o.ctx = d.ctx; o.errs = errs.slice(0, 2);
    o.A = analizza(d.pa);
    /* chi scriveva il pallone quando era dentro la porta (codici _ws524 del testimone di bordo) */
    const WS = ['—', 'scena', 'arco', 'inseguitore', 'portatore', 'addosso', 'palo', 'respinta', 'ricevente-cross', 'ricevente-pass', 'consegna', 'buildup-aereo', 'buildup-fine', 'buildup-volo', 'testa'];
    const dentro = d.S.filter(q => q.x >= LINEA && Math.abs(q.z) <= PALI && q.y <= TRAVERSA);
    o.wsDentro = [...new Set(dentro.map(q => WS[q.ws | 0] || ('?' + q.ws)))];
    o.rilevatoreRete = /finita IN RETE/.test(String(d.bozza || ''));
  } catch (e) { o.err = String(e.message || e).slice(0, 160); }
  await page.close().catch(() => {});
  return o;
}

export async function corri(casi, rosso, par = PAR, glb = GLB, log = true) {
  const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
  const out = new Array(casi.length); let nx = 0;
  await Promise.all(Array.from({ length: Math.min(par, casi.length) }, async () => { while (nx < casi.length) { const i = nx++; out[i] = await caso(b, port, casi[i], rosso, glb); if (log) console.log(riga(out[i])); } }));
  await b.close(); srv.close(); return out;
}

export function riga(o) {
  if (o.err) return `  ?? ${o.id}: ${o.err}`;
  const A = o.A, c = A.cross;
  return `  ${A.inRete ? '🥅' : '· '} ${String(o.id).padEnd(22)} gi${o.gi}/${o.ai} ${String(o.ht).padEnd(8)} esito ${String(o.out && o.out.key).padEnd(9)} tipo ${String(o.out && o.out.kind).padEnd(9)} n ${String(A.n).padStart(3)} maxX ${A.maxX.toFixed(1).padStart(5)} ` +
    (c ? `linea a z ${c.z} y ${c.y} (${Math.abs(c.z) <= PALI && c.y <= TRAVERSA ? 'FRA I PALI' : 'fuori dai pali'}; scrive ${c.arc ? 'arco' : ''}${c.pt ? '+' + c.pt : ''}${!c.arc && !c.pt ? 'né arco né post-arco' : ''}) ` : 'linea mai passata ') +
    `dentro ${A.dentroN} fot.${o.g301 && o.g301.length ? ' · barriera ' + o.g301.length + ' fot. (' + [...new Set(o.g301.map(q => (q.arc ? 'arco' : '') + (q.pt || '') || 'nessun arco'))].join('/') + ')' : ''}${A.fine && A.fine.dentro ? ' · FINISCE DENTRO' : ''}${o.wsDentro && o.wsDentro.length ? ' · scrittori dentro: ' + o.wsDentro.join('/') : ''}${o.rilevatoreRete ? ' · RILEVATORE: «IN RETE»' : ''}${o.fineOk ? '' : ' · (fine non vista)'}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const DEF = 'P:Piazzato:nat:83.8:36,P1:Piazzato:nat:83.8:36,P2:Piazzato:nat,P3:Piazzato:nat:83.8:64,P:Piazzato:wide:83.8:36,P:Piazzato:saved:83.8:36,P:Piazzato:post:83.8:36,P:Piazzato:blocked:83.8:36,P:Piazzato:gol:83.8:36';
  const casi = parseCasi(process.env.CPM_CASI || DEF);
  console.log(`misura-301 · ${casi.length} casi · GLB ${GLB ? 'accesi' : 'spenti'} · ${ROSSO || 'verde'}`);
  const out = await corri(casi, ROSSO);
  const ng = out.filter(o => !o.err && o.k !== 'gol'), inr = ng.filter(o => o.A.inRete);
  console.log(`\nnon-gol: ${ng.length} · con il pallone DENTRO la porta: ${inr.length} (${inr.map(o => o.id).join(' · ') || '—'}) · rilevatore «IN RETE»: ${ng.filter(o => o.rilevatoreRete).length}`);
  const gol = out.filter(o => !o.err && o.k === 'gol'); if (gol.length) console.log(`gol: ${gol.length} · entrati: ${gol.filter(o => o.A.inRete).length}`);
  for (const o of out) if (o.bozza && process.env.CPM_BOZZE) console.log(`  [${o.id}] ${o.bozza}`);
  if (process.env.CPM_JSON) fs.writeFileSync(process.env.CPM_JSON, JSON.stringify(out.map(o => ({ ...o, S: undefined }))));
  process.exit(0);
}
