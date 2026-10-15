#!/usr/bin/env node
/* [giro 41 PO-218/240/250 «esiti bugiardi»] CENSIMENTO degli esiti dell'eroe — STRUMENTO DI MISURA, non guardiano.
   Per ogni scena forzata (GLB acceso, pagina NUOVA per scena, esito NATURALE: si forza solo riuscita/fallimento, il tipo lo decide
   il motore — col tipo forzato il riquadro non segue, banco-248 nota 3) confronta tre voci:
     · RIQUADRO  __CPM_OUTCOME (titolo `overlay` + riga `text`) e __CPM_RES218 (famiglia, eventi del motore)
     · MOTORE    __CPM_RES218.ev (chi ha toccato il pallone dopo la scena: tiro:esito, intercetto, presa, fallo…)
     · 3D        __CPM_V241 (testimone di questo giro, src/12: post-arco, gesti del portiere e dei difensori, pallone finale, in rete)
   e scrive le contraddizioni per famiglia di highlight.
   Uso: node esiti-241-censimento.mjs <da> <a>      → misura le scene candidate con indice [da, a) e scrive out/esiti-241/<da>-<a>.json
        node esiti-241-censimento.mjs rapporto      → aggrega out/esiti-241/*.json
        CPM_ROSSO=1 accende tutti gli interruttori rossi del giro 41 (stessa misura, braccio rosso). */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname as LIBDIR } from './lib/harness.mjs';
const OUT = path.join(LIBDIR, '..', 'out', (process.env.CPM_OUTDIR || 'esiti-241') + (process.env.CPM_ROSSO ? '-rosso' : ''));
const A = process.argv.slice(2);

/* ── classificatori: cosa DICE il testo, cosa MOSTRA il 3D ── */
export function catTesto(t) {
  const x = String(t || '').toLowerCase(); const c = new Set(); if (!x) return c;
  if (/portiere|parat|para |para\.|presa|in tuffo|si distende|polpastrell|guant/.test(x)) c.add('portiere');
  if (/murat|muro|si oppone|si mette in mezzo|difensore respinge|respinge il cross|barriera|ribatt/.test(x)) c.add('difensore');
  if (/intercett|anticipat|palla persa|perde il pallone|ti portano via|legge la giocata|chiude in anticipo|recuperata dagli avversari/.test(x)) c.add('intercetto');
  if (/\bpalo\b|traversa|legno/.test(x)) c.add('palo');
  if (/fuori|sul fondo|specchio|sopra la traversa|troppo lung|non ci arriva/.test(x)) c.add('fuori');
  if (/fallo|punizione|steso|calcio piazzato/.test(x)) c.add('fallo');
  if (/filtrant|imbucat/.test(x)) c.add('filtrante');
  if (/conclusione|tentativo|tiro\b/.test(x) && /respint|murat|respinge/.test(x)) c.add('conclusione_respinta');
  return c;
}
export function contraddizioni(r) {
  const out = []; if (!r || !r.v) return ['3D non osservato'];
  const v = r.v, testi = [r.overlay, r.text].filter(Boolean), cats = new Set(); testi.forEach(t => catTesto(t).forEach(c => cats.add(c)));
  const gk = Object.keys(v.gk || {}).length > 0, def = Object.keys(v.def || {}).length > 0, pa = Object.keys(v.pa || {});
  const ev = r.ev || [], lab = String(r.label || '').toLowerCase();
  const evTiro = ev.find(e => e.startsWith('tiro:')); const esTiro = evTiro ? evTiro.split(':')[1].split('(')[0] : null;
  if (r.ok === false && v.inNet) out.push('fallito ma il pallone entra IN RETE nel 3D (PO-240 b)');
  if (cats.has('portiere') && !gk && !cats.has('difensore')) out.push('il testo nomina il portiere ma nel 3D il portiere non fa nessun gesto');
  if (cats.has('difensore') && gk && !def && v.v !== 'blocked') out.push('il testo dice murato ma nel 3D interviene il portiere');
  if (cats.has('intercetto') && (esTiro === 'blocked' || (v.v === 'blocked' && /^(shot|freekick|header)$/.test(v.ht || '')))) out.push('il testo dice intercettato/palla persa ma il tiro parte e viene murato');
  if (cats.has('difensore') && !cats.has('intercetto') && ev.some(e => e.startsWith('intercetto')) && !esTiro) out.push('il testo dice murato ma il motore registra un intercetto');
  if (cats.has('filtrante') && /cross|traverson|pennell|palla in area|parabola|mette in mezzo|scodell/.test(lab)) out.push('«filtrante» su un cross/palla in area (PO-250)');
  if (cats.has('conclusione_respinta') && r.ok && r.outKey === 'chance' && !gk && !def) out.push('chance: il testo racconta una conclusione respinta che il 3D non mostra');
  if (cats.has('fallo') && !ev.some(e => e.startsWith('fallo')) && r.outKind !== 'win_freekick') out.push('il testo dice fallo ma il motore non lo registra');
  if (r.outKind === 'win_freekick' && !cats.has('fallo')) out.push('fallo cercato riuscito raccontato senza fallo');
  if (catTesto(r.overlay).has('portiere') && catTesto(r.text).has('difensore') || catTesto(r.overlay).has('difensore') && catTesto(r.text).has('portiere')) out.push('titolo e riga del riquadro si contraddicono');
  return out;
}

function famigliaDi(sit, a) {
  const l = String(a.l || '').toLowerCase();
  if (a.fc) return 'fallo-cercato';
  if (a.t === 'penalty') return 'rigore';
  if (a.t === 'freekick') return a.rew === 'assist' ? 'punizione-cross' : 'punizione';
  if (sit.type === 'def') return null;
  if (a.t === 'header') return 'testa';
  if (a.t === 'shot') return a.v === 'shot_volley' ? 'volee' : (a.rew === 'assist' ? 'tiro-assist' : 'tiro');
  if (a.t === 'cross') return 'cross';
  if (a.t === 'dribble' || ((a.t === 'pass' || a.t === 'build') && /dribbl|finta|sterzat|spunto|conduc|tunnel/.test(l))) return 'dribbling';
  if (a.t === 'pass' || a.t === 'build') return 'passaggio';
  return null;
}

if (A[0] === 'rapporto') { rapporto(); process.exit(0); }
const DA = +(A[0] || 0), AA = +(A[1] || 6);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ROSSO = !!process.env.CPM_ROSSO;
const INIT = (r) => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_V241 = {};
  if (r) { window.__CPM_NO_ESITI241 = 1; } };
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
async function nuovaPagina() {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Esiti241' });
  const tP = Date.now();
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 300 }));
  await page.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() && typeof window.__CPM_FORCE_SIT === 'function', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
  console.log(`  [pagina] partita ${((Date.now() - tP) / 1000).toFixed(0)}s · motore ${await page.evaluate(() => !!(window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ()))} · fase ${await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE())}`);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  await sleep(500); return page;
}
let page = await nuovaPagina();
const TOT = await page.evaluate(() => SITUATIONS.length);
const cat = await page.evaluate(() => SITUATIONS.map((s, gi) => ({ gi, type: s.type, acts: (s.actions || []).map((a, k) => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return { k, l: a.label, rew: a.rew, fail: a.fail, fc: !!a.falloCercato, t: h.type || null, v: h.variant || null }; }) })));
const cand = []; for (const s of cat) for (const a of s.acts) { const f = famigliaDi(s, a); if (f) cand.push({ gi: s.gi, k: a.k, l: a.l, fam: f }); }
/* ordine: a scacchiera per famiglia, cosi' ogni gruppo [da,a) copre famiglie diverse */
const perFam = {}; cand.forEach(c => (perFam[c.fam] = perFam[c.fam] || []).push(c));
const ord = []; const fams = Object.keys(perFam).sort(); for (let i = 0; ord.length < cand.length; i++) for (const f of fams) if (perFam[f][i]) ord.push(perFam[f][i]);
const ONLY = (process.env.CPM_ONLY || '').split(',').filter(Boolean);
const sel = ONLY.length ? ONLY.map(x => { const [g, k] = x.split('/').map(Number); return cand.find(c => c.gi === g && c.k === k) || { gi: g, k, l: '?', fam: 'nominata' }; }) : ord.slice(DA, AA);
console.log(`candidate ${cand.length} (${fams.map(f => f + ' ' + perFam[f].length).join(' · ')}) · misuro [${DA},${AA}) ${ROSSO ? 'ROSSO' : 'verde'}`);
const righe = []; let prima = true;
for (const c of sel) {
  if (!prima) { await page.close().catch(() => {}); page = await nuovaPagina(); } prima = false;
  for (const out of ['fail', 'success']) {
    const t0 = Date.now(); let r;
    try { r = await esegui(page, c, out); } catch (e) { r = { errore: String(e.message || e).slice(0, 140) }; }
    r = { ...c, out, ...r, ms: Date.now() - t0 }; r.contr = r.errore ? [] : contraddizioni(r); righe.push(r); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, `${DA}-${AA}.json`), JSON.stringify({ quando: new Date().toISOString(), rosso: ROSSO, parziale: true, righe }, null, 1));
    console.log(`  gi${c.gi}/${c.k} ${c.fam.padEnd(15)} ${out.padEnd(7)} ${r.errore ? '⚠ ' + r.errore : `${r.outKey}/${r.outKind || '-'} «${r.overlay}» · «${String(r.text || '').slice(0, 60)}» · 3D ${JSON.stringify({ pa: Object.keys((r.v || {}).pa || {}), gk: Object.keys((r.v || {}).gk || {}), def: Object.keys((r.v || {}).def || {}), v: (r.v || {}).v, net: (r.v || {}).inNet })} · ev ${(r.ev || []).join(',')}`}${r.contr.length ? '  ❌ ' + r.contr.join(' | ') : ''}`);
  }
}
await page.close().catch(() => {}); await b.close(); srv.close();
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, `${DA}-${AA}.json`), JSON.stringify({ quando: new Date().toISOString(), rosso: ROSSO, righe }, null, 1));
console.log(`scritto ${path.join(OUT, `${DA}-${AA}.json`)} · contraddizioni ${righe.filter(r => r.contr && r.contr.length).length}/${righe.length}`);

async function esegui(page, c, out) {
  await page.evaluate(() => { delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
  const esca = (c.gi + 61) % TOT; await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), esca).catch(() => {}); await sleep(1500);
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), c.gi).catch(() => false); if (!ok) return { errore: 'forzatura fallita' };
  await sleep(2500);
  await page.evaluate(o => { window.__CPM_FORCE_OUTCOME = o; window.__CPM_V241 = {}; window.__R241 = (window.__CPM_RES218 || []).length; }, out);
  const okR = await page.evaluate(k => window.__CPM_RESOLVE(k), c.k).catch(() => false); if (!okR) return { errore: 'risoluzione fallita' };
  /* si osserva la scena d'esito in TEMPO DI SCENA (4 s), tetto reale 40 s */
  const tR = Date.now(); let s0 = null;
  while (Date.now() - tR < 40000) { await sleep(400); const s = await page.evaluate(() => (typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null)).catch(() => null); if (s != null) { if (s0 == null) s0 = s; if (s - s0 >= 4) break; } }
  return await page.evaluate(() => { const o = window.__CPM_OUTCOME || {}; const res = (window.__CPM_RES218 || []).slice(window.__R241 || 0).slice(-1)[0] || {}; const W = window.__CPM_V241 || {};
    return { ok: o.ok, outKey: o.outKey || null, outKind: o.outKind || null, overlay: o.overlay || null, text: o.text || null, fam218: res.fam || null, ev: res.ev || [], v: (W.all || []).slice(-1)[0] || null }; });
}

function rapporto() {
  const RIGHE = []; for (const d of ['esiti-241', 'esiti-241-rosso']) { const dir = path.join(LIBDIR, '..', 'out', d); if (!fs.existsSync(dir)) continue; for (const f of fs.readdirSync(dir)) if (f.endsWith('.json')) JSON.parse(fs.readFileSync(path.join(dir, f))).righe.forEach(r => RIGHE.push({ ...r, braccio: d.endsWith('rosso') ? 'rosso' : 'verde', contr: r.errore ? [] : contraddizioni(r) })); }
  for (const br of ['verde', 'rosso']) {
    const R = RIGHE.filter(r => r.braccio === br && !r.errore); if (!R.length) continue;
    console.log(`\n== ${br}: ${R.length} esecuzioni, ${R.filter(r => r.contr.length).length} con contraddizioni`);
    const tab = {}; for (const r of R) { const t = (tab[r.fam] = tab[r.fam] || { n: 0, c: 0, tipi: {} }); t.n++; if (r.contr.length) t.c++; r.contr.forEach(x => (t.tipi[x] = (t.tipi[x] || 0) + 1)); }
    console.log('| famiglia | esecuzioni | con contraddizioni | tipi |\n|---|---|---|---|');
    for (const [f, t] of Object.entries(tab).sort()) console.log(`| ${f} | ${t.n} | ${t.c} | ${Object.entries(t.tipi).map(([k, v]) => k + ' ×' + v).join('; ') || '—'} |`);
    R.filter(r => r.contr.length).forEach(r => console.log(`  · gi${r.gi}/${r.k} ${r.fam} ${r.out} ${r.outKey}/${r.outKind} «${r.overlay}» «${r.text}» → ${r.contr.join(' | ')}`));
  }
}
