#!/usr/bin/env node
/* SONDA giro 295 — IL PORTIERE NEL GIOCO VERO (PO-518 · PO-519 · PO-520 · PO-530). Non giudica: stampa.
   Partite vere dal salvataggio S5 del collaudo 177 (come parata-100), corpi GLB accesi, pagina nuova per partita, regime «gioco»
   (__CPM_PRESENT=1 + __CPM_REALWAIT: stacco di scena e congelamento di lettura come li vede il giocatore). Il pilota automatico gioca;
   a ogni scelta la sonda lo ferma per CPM_PAUSA ms (default 5000) — «chi ci pensa qualche secondo» — e poi lo riaccende.
   Un registratore nella pagina svuota a ogni fotogramma il testimone __CPM_GK229 (esteso nel giro 295: gn = quante guide muovono il
   portiere avversario nel fotogramma, coi loro bersagli; tl = build-up acceso; bersaglio dell'arco; post-arco).
   Per scena (chiave hlSitKey) stampa:
     518  fotogrammi col build-up acceso in cui il portiere riceve 2 guide, e quanto distano i due bersagli;
     519  nella lettura (hl_intro/hl_move/hl_choose): durata di scena, strada fatta dal portiere, scarto massimo dalla posizione
          d'inizio lettura, deriva del suo bersaglio;
     520  sui tiri con esito palo: distanza di lato calcolata dal gioco (__CPM_G223P) e gesto del portiere;
     530  sulle parate: distanza minima pallone-portiere in pianta dall'armo dell'arco, e dove sta il pallone in quel momento.
   Uso: CPM_CHROME=… node misura-295.mjs   (CPM_SEMI=7,2021 · CPM_SALVA=s5 · CPM_FLAG=__CPM_NO_G295 · CPM_PAUSA=5000 · CPM_GLB=0 · CPM_TETTO=600) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const SEMI = (process.env.CPM_SEMI || '7,2021').split(',').map(Number);
const SAVES = (process.env.CPM_SALVA || 's5').split(',');
const PAUSA = +(process.env.CPM_PAUSA || 5000), TETTO = +(process.env.CPM_TETTO || 600) * 1000, GLB = process.env.CPM_GLB !== '0';
const RE_PASS = 'Filtrante|Uno-due|Lancio smarcante|Servi .* libero|Sponda|scarica su|Appoggio|Cross|Palla in area';
const POL = process.env.CPM_POL || '';/* vuoto = politica di default del pilota (tira anche) */
const srv = await startServer(); const b = await launchBrowser();
export async function gioca(sk, sd, flag) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[sk]); let ls;
  if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, fl, glb]) => { window.__CPM_GLB = !!glb; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1;/* come nel gioco vero: sotto ?cpmtest=1 il copione del build-up e' spento senza questa bandiera */ window.__CPM_REC229 = 1;
    (fl || '').split(',').forEach(k => { if (k) window[k] = 1; });
    if (!sessionStorage.getItem('__m295')) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); sessionStorage.setItem('__m295', '1'); }
    const L = window.__M295 = []; const Pp = window.__M295P = [];
    const f = () => { try { const R = window.__CPM_GK229; if (R && R.length) { for (const q of R) if (L.length < 60000) L.push(q); window.__CPM_GK229 = []; }
      const G = window.__CPM_G223P; if (G && G.length) { for (const q of G) Pp.push({ ...q, i: L.length }); window.__CPM_G223P = []; } } catch (e) {} requestAnimationFrame(f); }; requestAnimationFrame(f); },
  [ls, flag || '', GLB]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 90000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  const ap = () => page.evaluate(([s, re, pol]) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, pol ? { seed: s, policy: pol, re, tickMs: 150 } : { seed: s, tickMs: 150 }), [sd, RE_PASS, POL]);
  await ap();
  const t0 = Date.now(); let ph = '', visto = -1, pause = 0;
  while (Date.now() - t0 < TETTO) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => 'x'); if (ph === 'ended' || ph === 'ceremony' || ph === 'x') break;
    if (PAUSA > 0 && (ph === 'hl_intro' || ph === 'hl_move' || ph === 'hl_choose')) { const n = await page.evaluate(() => (window.__M295 || []).length ? window.__M295[window.__M295.length - 1].hk : -1).catch(() => -1);
      if (n !== visto) { visto = n; pause++; await page.evaluate(() => window.__CPM_AUTOPLAY(false)); await sleep(PAUSA); await ap(); } }
    await sleep(250); }
  const L = await page.evaluate(() => window.__M295 || []).catch(() => []);
  const G = await page.evaluate(() => window.__M295P || []).catch(() => []);
  const min = await page.evaluate(() => { try { return window.__CPM_STATE ? (window.__CPM_STATE().minute ?? null) : null; } catch (e) { return null; } }).catch(() => null);
  await ctx.close();
  return { L, G, ph, pause, min, sec: Math.round((Date.now() - t0) / 1000) };
}
const LETT = new Set(['hl_intro', 'hl_move', 'hl_choose']);
export function analizza(L, G) {
  /* scene = fotogrammi consecutivi di fasi hl_* con la stessa chiave */
  const scene = []; let cur = null;
  for (let i = 0; i < L.length; i++) { const f = L[i]; const hl = /^hl_/.test(f.ph || '');
    if (!hl) { cur = null; continue; }
    if (!cur || cur.k !== f.hk) { cur = { k: f.hk, fr: [], i0: i }; scene.push(cur); } cur.fr.push(f); }
  const out = [];
  for (const s of scene) { const o = { k: s.k, ht: null, ok: null, n: s.fr.length };
    for (const f of s.fr) { if (f.ht) o.ht = f.ht; if (f.ok) o.ok = f.ok; }
    /* 518 */
    const B = s.fr.filter(f => f.tl && f.ph === 'hl_result'); const B2 = B.filter(f => f.gn >= 2);
    o.bu = B.length; o.bu2 = B2.length; o.bu2d = B2.length ? Math.max(...B2.map(f => Math.hypot(f.g1x - f.g2x, f.g1z - f.g2z))) : 0;
    o.g2tot = s.fr.filter(f => f.gn >= 2).length;
    /* 519: lettura, dopo i primi 0,3 s di scena (lo stacco rimette i corpi) */
    const R = s.fr.filter(f => LETT.has(f.ph)); if (R.length > 3) { const c0 = R[0].ck, R1 = R.filter(f => f.ck - c0 >= 0.3);
      if (R1.length > 2) { const a = R1[0]; let st = 0, mx = 0, tg = 0; for (let i = 1; i < R1.length; i++) { st += Math.hypot(R1[i].gx - R1[i - 1].gx, R1[i].gz - R1[i - 1].gz); mx = Math.max(mx, Math.hypot(R1[i].gx - a.gx, R1[i].gz - a.gz)); if (a.ex != null && R1[i].ex != null) tg = Math.max(tg, Math.hypot(R1[i].ex - a.ex, R1[i].ez - a.ez)); }
        o.let = { dur: +(R1[R1.length - 1].ck - a.ck).toFixed(2), strada: +st.toFixed(2), scarto: +mx.toFixed(2), bers: +tg.toFixed(2), gx: a.gx, gz: a.gz, gn: Math.max(...R1.map(f => f.gn || 0)), fuga: (()=>{ const z = R1[R1.length - 1]; return z.ex != null ? +Math.hypot(z.ex - z.gx, z.ez - z.gz).toFixed(2) : null; })(), ezFine: R1[R1.length - 1].ez }; } }
    /* 520 */
    if (o.ok === 'post') { const g = G.filter(q => q.i >= s.i0 && q.i <= s.i0 + s.fr.length + 2).pop() || null; const op = s.fr.find(f => f.op); o.palo = { lat: g ? g.lat : null, d: g ? g.d : null, y: g ? g.y : null, gesto: op ? op.op : null }; }
    /* 530 */
    if (o.ok === 'saved' || o.ok === 'save') { const i0 = s.fr.findIndex(f => f.ph === 'hl_result' && f.at); if (i0 >= 0) { let m = 99, at = null; for (let i = i0; i < s.fr.length; i++) { const f = s.fr[i]; if (f.ph !== 'hl_result') break; const d = Math.hypot(f.bx - f.gx, f.bz - f.gz); if (d < m) { m = d; at = f; } }
        const fin = s.fr.slice(i0).find((f, i, A) => !f.at && i > 0 && A[i - 1].at) || null; const a0 = s.fr[i0];
        o.par = { minGB: +m.toFixed(2), bx: at && at.bx, bz: at && at.bz, gx: at && at.gx, gz: at && at.gz, atx: a0.atx, atz: a0.atz, gx0: a0.gx, gz0: a0.gz, finBx: fin ? fin.bx : null, finGx: fin ? fin.gx : null, gesto: (s.fr.find(f => f.op) || {}).op || null, pa: [...new Set(s.fr.map(f => f.pa).filter(Boolean))].join('>') }; }
      else o.par = { nonArmo: 1 }; }
    out.push(o); }
  return out;
}
if (process.argv[1] && process.argv[1].endsWith('misura-295.mjs')) {
  const tutte = [];
  for (const sk of SAVES) for (const sd of SEMI) { const r = await gioca(sk, sd, process.env.CPM_FLAG || '');
    const S = analizza(r.L, r.G); tutte.push(...S);
    console.log(`\n== ${sk}/${sd}: fase finale ${r.ph} · ${r.sec} s · fotogrammi ${r.L.length} · scene ${S.length} · pause in lettura ${r.pause} · minuto ${r.min}`);
    for (const o of S) { const t = [`  sk${o.k} ${o.ht || '?'} esito ${o.ok || '-'} (${o.n} fot.)`];
      t.push(`518: build-up ${o.bu} fot., con 2 guide ${o.bu2}${o.bu2 ? ' (bersagli a ' + o.bu2d.toFixed(2) + ' u)' : ''}, 2 guide in tutta la scena ${o.g2tot}`);
      if (o.let) t.push(`519: lettura ${o.let.dur} s, strada ${o.let.strada} u, scarto ${o.let.scarto} u, deriva bersaglio ${o.let.bers} u, guide max ${o.let.gn}, portiere (${o.let.gx};${o.let.gz}), a fine lettura il suo bersaglio e' a ${o.let.fuga} u da lui (z bersaglio ${o.let.ezFine})`);
      if (o.palo) t.push(`520: palo lat ${o.palo.lat} d ${o.palo.d} y ${o.palo.y} gesto ${o.palo.gesto || 'nessuno'}`);
      if (o.par) t.push(o.par.nonArmo ? '530: parata senza arco armato' : `530: parata minGB ${o.par.minGB} u (pallone ${o.par.bx};${o.par.bz} · portiere ${o.par.gx};${o.par.gz}) · bersaglio arco (${o.par.atx};${o.par.atz}) portiere all'armo (${o.par.gx0};${o.par.gz0}) · fine arco pallone x ${o.par.finBx} portiere x ${o.par.finGx} · gesto ${o.par.gesto || 'nessuno'} · post-arco ${o.par.pa || '-'}`);
      console.log(t.join('\n      ')); } }
  const n = tutte.length, c518 = tutte.filter(o => o.bu2 > 0), cL = tutte.filter(o => o.let), c519 = cL.filter(o => o.let.scarto > 0.5), cP = tutte.filter(o => o.par && !o.par.nonArmo), c530 = cP.filter(o => o.par.minGB > 2.5), cPa = tutte.filter(o => o.palo);
  console.log(`\nRIEPILOGO (${n} scene): 518 scene con 2 guide nel build-up ${c518.length} su ${tutte.filter(o => o.bu > 0).length} con build-up (bersagli fino a ${c518.length ? Math.max(...c518.map(o => o.bu2d)).toFixed(2) : 0} u) · 519 letture con scarto oltre 0,5 u: ${c519.length} su ${cL.length} (massimo ${cL.length ? Math.max(...cL.map(o => o.let.scarto)).toFixed(2) : '-'} u, lettura piu' lunga ${cL.length ? Math.max(...cL.map(o => o.let.dur)).toFixed(1) : '-'} s) · 520 pali ${cPa.length} (${cPa.map(o => o.palo.lat + ':' + (o.palo.gesto || 'no')).join(' ')}) · 530 parate col pallone a piu' di 2,5 u dal portiere: ${c530.length} su ${cP.length} (minGB ${cP.map(o => o.par.minGB).join(' ')})`);
  await b.close(); srv.close(); process.exit(0);
}
