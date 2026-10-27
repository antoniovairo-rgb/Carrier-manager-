#!/usr/bin/env node
/* [collaudo grafico 178 · PO-299] HIGHLIGHT 3D dal vivo, GLB ACCESO (direttiva PO 29/07), con foto in sequenza dei momenti chiave e misure per fotogramma.
   Uso: C178_FORMATO=tel|pc|tabv  C178_LISTA="gi:esito,gi:esito"  (default: lista scelta dal catalogo)  C178_NOME=<seme di partita>  C178_TAG=<etichetta>
   Per ogni scena: apertura (hl_choose) → risoluzione con esito forzato → 4 foto a tempo di SCENA crescente → banner d'esito. Misure: compenetrazioni fra i 22 + eroe,
   portiere (presente / fuori area), salti del pallone fra fotogrammi, quota di fotogrammi con l'eroe fuori quadro, sovrapposizione dei testi, esito scritto. Non tocca src/. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { D, FORMATI, SCRATCH } from './c178-graf-lib.mjs';
const f = FORMATI[process.env.C178_FORMATO || 'tel']; const NOME = process.env.C178_NOME || 'Collaudo Grafica'; const TAG = process.env.C178_TAG || (f.k + '-' + NOME.replace(/\W+/g, ''));
const OUT = path.join(SCRATCH, 'hl', TAG); fs.mkdirSync(OUT, { recursive: true });
const LISTA = (process.env.C178_LISTA || '').split(',').filter(Boolean).map(x => { const [g, e] = x.split(':'); return { gi: +g, e: e || null }; });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const INIT = () => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_CAMSTEP93ON = 1; window.__CPM_BJMIN = 3;
  window.__C178 = { on: false, fr: [] };
  const loop = () => { try { const B = window.__C178; if (B.on && B.fr.length < 6000) { const p = window.__CPM_PROBE && window.__CPM_PROBE(); const pos = [];
        for (let i = 0; i < 22; i++) { const q = window.__CPM_PLPOS && window.__CPM_PLPOS(i); pos.push(q ? [q.mx, q.my] : null); }
        B.fr.push({ t: performance.now(), ck: typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, cut: window.__CPM_CUTLIVE ? !!window.__CPM_CUTLIVE() : false,
          h: p && p.hero ? [p.hero.world.x, p.hero.world.y, p.hero.world.z, p.hero.onScreen ? 1 : 0, p.hero.ndc.x, p.hero.ndc.y] : null, b: p && p.ball ? [p.ball.world.x, p.ball.world.y, p.ball.world.z, p.ball.onScreen ? 1 : 0] : null, c: p && p.camera ? [p.camera.x, p.camera.y, p.camera.z] : null, pos }); } } catch (e) {}
    requestAnimationFrame(loop); }; requestAnimationFrame(loop); };
async function nuova() {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT); await openMatch(page, port, { name: NOME });
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {}); await sleep(600); page._ctx = ctx; return page; }
const famigliaDi = (sit, a) => { const l = String(a.l || '').toLowerCase(); if (a.t === 'penalty') return 'rigore'; if (a.t === 'freekick') return 'punizione';
  if (sit.type === 'def') return /contrast|scivolat|tackle|raddoppi|fallo|pressing|corpo|blocc|chiusura/.test(l) ? 'contrasto' : 'difesa'; if (a.t === 'header') return 'testa'; if (a.t === 'shot') return a.v === 'shot_volley' ? 'volee' : 'tiro';
  if (a.t === 'cross') return 'cross'; if (a.t === 'dribble' || ((a.t === 'pass' || a.t === 'build') && /dribbl|finta|sterzat|spunto|conduc|tunnel/.test(l))) return 'dribbling'; if (a.t === 'pass' || a.t === 'build') return 'passaggio'; return sit.type || 'altro'; };
const TIROLIKE = new Set(['tiro', 'testa', 'volee', 'rigore', 'punizione']);
const ESITI = { tiro: ['gol', 'parata', 'fuori'], testa: ['gol', 'parata'], volee: ['gol', 'fuori'], rigore: ['gol', 'parata'], punizione: ['gol', 'parata'], cross: ['riesce', 'intercetto'], passaggio: ['riesce', 'intercetto'], dribbling: ['riesce', 'sbaglia'], contrasto: ['riesce', 'sbaglia'], difesa: ['riesce', 'sbaglia'] };
const OUTMAP = { gol: ['success', null, 'goal'], parata: ['fail', 'saved'], fuori: ['fail', 'wide'], riesce: ['success'], sbaglia: ['fail'], intercetto: ['fail', 'intercepted'] };
let page = await nuova();
const cat = await page.evaluate(() => SITUATIONS.map((s, gi) => ({ gi, type: s.type, acts: (s.actions || []).map((a, k) => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return { k, l: a.label, rew: a.rew, t: h.type || null, v: h.variant || null, text: (s.text || '').slice(0, 60) }; }) })));
const TOTALE = cat.length;
let lista = LISTA;
if (!lista.length) { /* catalogo per famiglia -> N scene per famiglia equidistanti */
  const per = { tiro: 5, testa: 3, volee: 2, cross: 4, passaggio: 4, dribbling: 4, contrasto: 3, rigore: 3, punizione: 3, difesa: 3 }; const seen = new Set();
  const fam = {}; for (const s of cat) for (const a of s.acts) { const fm = famigliaDi({ type: s.type }, { l: a.l, t: a.t, v: a.v }); (fam[fm] = fam[fm] || []).push({ gi: s.gi, k: a.k }); }
  const off = +(process.env.C178_OFFSET || 0);
  for (const [fm, n] of Object.entries(per)) { const c = (fam[fm] || []).filter(x => !seen.has(x.gi)); for (let i = 0; i < Math.min(n, c.length); i++) { const x = c[(Math.floor(i * c.length / n) + off) % c.length]; seen.add(x.gi); const es = ESITI[fm]; lista.push({ gi: x.gi, k: x.k, fam: fm, e: es[(i + off) % es.length] }); } }
  const famCount = Object.fromEntries(Object.entries(fam).map(([k, v]) => [k, v.length])); console.log('catalogo famiglie:', JSON.stringify(famCount), 'totale scene', TOTALE);
}
for (const x of lista) { if (x.k == null) { const s = cat[x.gi]; x.k = 0; x.fam = x.fam || famigliaDi({ type: s.type }, { l: s.acts[0].l, t: s.acts[0].t, v: s.acts[0].v }); x.e = x.e || ESITI[x.fam][0]; } }
const risultati = []; let usate = 0; const PER = +(process.env.C178_PER_PAGINA || 3);
const scena = () => page.evaluate(() => window.__CPM_SCENET || 0).catch(() => 0);
const attendi = async (ds, capMs) => { const s0 = await scena(); const t0 = Date.now(); while (Date.now() - t0 < capMs) { if ((await scena()) - s0 >= ds) return true; await sleep(70); } return false; };
const foto = async (nome) => { await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(180); const p = path.join(OUT, nome + '.jpg'); try { await page.screenshot({ path: p, type: 'jpeg', quality: 60, timeout: 40000 }); } catch (e) {} await page.evaluate(() => { window.__CPM_FROZEN = false; }); return p; };
const leggi = () => page.evaluate(D, f.touch);
for (const ex of lista) {
  if (usate >= PER) { await page._ctx.close().catch(() => {}); page = await nuova(); usate = 0; } usate++;
  const id = `gi${ex.gi}-${ex.e}`; const r = { gi: ex.gi, k: ex.k, fam: ex.fam, esito: ex.e, id, t0: Date.now() };
  try {
    const sit = cat[ex.gi]; r.sit = sit.acts[ex.k] ? (sit.acts[ex.k].text + ' | ' + sit.acts[ex.k].l) : '';
    await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (ex.gi + 61) % TOTALE).catch(() => false); await attendi(0.6, 9000);
    const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), ex.gi).catch(() => false); if (!ok) { r.errore = 'forzatura fallita'; risultati.push(r); continue; }
    await attendi(1.1, 14000);
    r.fotoA = await foto(id + '-1apertura'); r.dA = await leggi(); r.mp = await page.evaluate(() => window.__CPM_MP && window.__CPM_MP()).catch(() => null);
    r.ph = await page.evaluate(() => window.__CPM_PHASE()).catch(() => null);
    const [o, kd] = OUTMAP[ex.e]; await page.evaluate(([oo, kk]) => { window.__CPM_FORCE_OUTCOME = oo; if (kk) window.__CPM_FORCE_KIND = kk; else delete window.__CPM_FORCE_KIND; window.__C178.fr = []; window.__C178.on = true; }, [o, kd]);
    const okR = await page.evaluate(k => window.__CPM_RESOLVE(k), ex.k).catch(() => false); if (!okR) { r.errore = 'risoluzione fallita'; risultati.push(r); continue; }
    const t = [0.5, 1.4, 2.4, 3.6]; const s0 = await scena(); const tR = Date.now(); r.fotoSeq = [];
    for (let i = 0; i < t.length; i++) { while (Date.now() - tR < 55000) { if ((await scena()) - s0 >= t[i]) break; await sleep(70); } r.fotoSeq.push(await foto(`${id}-${i + 2}t${t[i]}`)); if (i === 1) r.dB = await leggi(); }
    /* banner d'esito: aspetta hl_result (o il tetto) */
    for (let i = 0; i < 50 && (await page.evaluate(() => window.__CPM_PHASE())) !== 'hl_result'; i++) await sleep(250);
    r.phFine = await page.evaluate(() => window.__CPM_PHASE()); await sleep(500); r.fotoRes = await foto(id + '-6esito'); r.dR = await leggi();
    r.out = await page.evaluate(() => { const o = window.__CPM_OUTCOME; return o ? { text: o.text || null, ok: o.ok, outKey: o.outKey || null, outKind: o.outKind || null, actionLabel: o.actionLabel || null } : null; });
    r.res218 = await page.evaluate(() => (window.__CPM_RES218 || []).slice(-1)[0] || null).catch(() => null);
    r.fr = await page.evaluate(() => { window.__C178.on = false; return window.__C178.fr.slice(); });
    r.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE()).catch(() => null);
  } catch (err) { r.errore = String(err.message || err).slice(0, 200); }
  r.secondi = Math.round((Date.now() - r.t0) / 1000);
  /* analisi per fotogramma */
  const F = (r.fr || []).filter(x => x.ck != null && x.pos); const mp = r.mp || [];
  const gkIdx = mp.map((q, i) => (q && q.gk) ? i : -1).filter(i => i >= 0);
  let comp = 0, compMin = 99, compEx = null, gkAss = 0, gkFuori = 0, gkEx = null, saltiB = 0, saltiEx = [], heroFuori = 0, heroTot = 0, ballFuori = 0, peggior = null;
  F.forEach((fr, i) => { heroTot++; if (fr.h && !fr.h[3]) heroFuori++; if (fr.b && !fr.b[3]) ballFuori++;
    /* compenetrazione fra le mesh dei giocatori e con l'eroe (spazio MONDO: x logico, z = y*0.68) */
    const pts = fr.pos.map((p, j) => p ? { j, x: p[0], z: p[1] * 0.68 } : null).filter(Boolean); if (fr.h) pts.push({ j: 'E', x: fr.h[0] + 50, z: fr.h[2] + 34 });
    for (let a = 0; a < pts.length; a++) for (let c = a + 1; c < pts.length; c++) { const d = Math.hypot(pts[a].x - pts[c].x, pts[a].z - pts[c].z); if (d < compMin) { compMin = d; } if (d < 0.45) { comp++; if (!compEx) compEx = `${pts[a].j}-${pts[c].j} ${d.toFixed(2)}u @${fr.ck.toFixed(2)} ${fr.ph}`; break; } }
    gkIdx.forEach(j => { const p = fr.pos[j]; if (!p) { gkAss++; return; } const inBox = (p[0] <= 25 || p[0] >= 75) && Math.abs(p[1] - 50) <= 28; if (!inBox) { gkFuori++; if (!gkEx) gkEx = `gk${j} (${p[0]},${p[1]}) @${fr.ck.toFixed(2)}`; } });
    if (i) { const a = F[i - 1]; const ds = fr.ck - a.ck; if (ds > 0 && a.b && fr.b && !a.cut && !fr.cut) { const d = Math.hypot(fr.b[0] - a.b[0], fr.b[1] - a.b[1], fr.b[2] - a.b[2]); if (d > 3 && d / ds > 60) { saltiB++; if (saltiEx.length < 3) saltiEx.push(`${d.toFixed(1)}u in ${ds.toFixed(3)}s ${fr.ph}`); } } } });
  r.an = { nF: F.length, compFrames: comp, compMin: compMin === 99 ? null : +compMin.toFixed(2), compEx, gk: gkIdx.length, gkAss, gkFuori, gkEx, saltiPalla: saltiB, saltiEx, heroFuoriQ: heroTot ? +(heroFuori / heroTot).toFixed(2) : null, ballFuoriQ: heroTot ? +(ballFuori / heroTot).toFixed(2) : null };
  delete r.fr; delete r.mp; delete r.t0;
  risultati.push(r);
  const fl = [r.errore ? '⚠' + r.errore : '', r.an.compFrames ? 'COMP' + r.an.compFrames : '', r.an.gk < 2 ? 'GK' + r.an.gk : '', r.an.gkFuori ? 'GKfuori' : '', r.an.saltiPalla ? 'PALLA×' + r.an.saltiPalla : '', r.an.heroFuoriQ > 0.3 ? 'EROEfuori' + r.an.heroFuoriQ : '', (r.dR && r.dR.sovTesti.length) ? 'TESTI×' + r.dR.sovTesti.length : '', (r.dA && r.dA.sovTesti.length) ? 'TESTIA×' + r.dA.sovTesti.length : ''].filter(Boolean).join(' ');
  console.log(`${f.k} ${id.padEnd(18)} ${String(r.fam).padEnd(10)} ${String(r.secondi).padStart(3)}s fine ${r.phFine} out «${r.out && r.out.text ? String(r.out.text).slice(0, 50) : '—'}» ${fl}`);
  fs.writeFileSync(path.join(OUT, 'risultati.json'), JSON.stringify({ f: f.k, nome: NOME, risultati, errs: page._errs }));
}
await b.close(); srv.close();
