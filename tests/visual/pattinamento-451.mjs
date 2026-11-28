#!/usr/bin/env node
/* [giro 451, PO-665 «i giocatori scivolano»] SONDA DI SOLA MISURA del pattinamento dei piedi — non giudica il gioco, stampa numeri.
   GLB ACCESO, di NOTTE (__CPM_TOD=night), banco (?cpmtest=1, scene forzate), una pagina nuova ogni CPM_PER_PAGINA esecuzioni (7.483).
   Sorgente unica: il testimone __CPM_PIEDI (src/12, 7.999.7) riparato al giro 451 — la fase si legge dalle props VIVE (prima era quella
   del montaggio: «negli highlight 0 su 0») — e il suo registro nuovo __CPM_PIEDI451 (v451): per fase · famiglia (hlType, «ingresso» nel
   walkout) · classe di corpo (eroe/compagno/avversario/portiere/arbitro), piu' gli APPOGGI = tratti di fotogrammi consecutivi col
   piede sotto 6 cm, di cui si somma lo spostamento in pianta. Scala: 1,80 m = testa-dita del corpo (convenzione del 7.999.7).
   Tempo di SCENA (dt del ciclo, tappato a 0,05 s): mai il tempo di parete.

   GRANDEZZE (per famiglia e per corpo):
     scivola%   quota dei piede-fotogrammi a terra che scorrono oltre 0,5 m/s di scena (criterio OmniControl del 7.999.7)
     v appoggio velocita' media del piede a terra = spostamento a terra / tempo a terra (cm/s di scena; un piede piantato vale 0)
     appoggi    tratti con almeno 3 fotogrammi a terra: mediana e 90° percentile dello scivolamento per appoggio (cm), quota > 5 cm
     p/r %      mediana, sugli appoggi, di spostamento del piede / spostamento della radice (100% = il piede viaggia incollato al corpo,
                0% = piantato mentre il corpo gli passa sopra, come nella corsa vera)
     modo       la radice nel fotogramma: ferma (< 0,3 m/s) · passo (< 2,5) · corsa
   USO (dalla cartella tests/visual):
     node pattinamento-451.mjs <tiro|cross|dribbling|difesa|piazzati|ingresso>   CPM_CPU=4 (CPU rallentata ×4) · CPM_SCENE=n
     node pattinamento-451.mjs rapporto       → tabella da out/pattinamento-451/*.json
     node pattinamento-451.mjs testimone      → prova del testimone: verde (conteggio highlight > 0) e rosso __CPM_NO_G451 (= 0)
   USCITA: 0 misura valida · 2 cieca (nessun piede-fotogramma contato) · 3 errore d'uso.                                            */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname as LIBDIR } from './lib/harness.mjs';

const OUT = path.join(LIBDIR, '..', 'out', 'pattinamento-451'); fs.mkdirSync(OUT, { recursive: true });
const FAMIGLIE = ['tiro', 'cross', 'dribbling', 'difesa', 'piazzati', 'ingresso'];
const ARG = (process.argv[2] || '').toLowerCase();
const CPU = +(process.env.CPM_CPU || 1);
const SCENA_S = +(process.env.CPM_SCENA_S || 4);
const PER_PAGINA = Math.max(1, +(process.env.CPM_PER_PAGINA || 3));

function famigliaDi(sit, a) {/* come il banco PO-248, con contrasto+difesa insieme e rigore+punizione = piazzati */
  const l = String(a.l || '').toLowerCase();
  if (a.t === 'penalty' || a.t === 'freekick') return 'piazzati';
  if (sit.type === 'def') return 'difesa';
  if (a.t === 'header' || a.t === 'shot') return 'tiro';
  if (a.t === 'cross') return 'cross';
  if (a.t === 'dribble' || ((a.t === 'pass' || a.t === 'build') && /dribbl|finta|sterzat|spunto|conduc|tunnel/.test(l))) return 'dribbling';
  return null;
}
const q = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
const f1 = x => x == null ? '—' : (+x).toFixed(1);
const pc = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '—';

/* aggrega le esecuzioni: chiave = funzione(bucket o appoggio) */
function aggrega(esec, chiave) {
  const A = {};
  const get = k => A[k] || (A[k] = { fr: 0, cont: 0, sk: 0, skA: 0, d: 0, tc: 0, ep: [] });
  for (const e of esec) { if (!e.v) continue;
    for (const [k, B] of Object.entries(e.v.b)) { const [fam, ph, cl, mo] = k.split('|'); const K = chiave({ fam: e.fam, hlType: fam, ph, cl, mo }); if (K == null) continue; const G = get(K);
      G.fr += B.fr; G.cont += B.cont; G.sk += B.sk; G.skA += B.skA; G.d += B.d; G.tc += B.tc; }
    for (const p of e.v.ep) { const K = chiave({ fam: e.fam, hlType: p[0], cl: p[1], ph: p[2], g: p[6], lo: p[7], mo: p[10] }); if (K == null) continue; const G = get(K); G.ep.push(p[3]); if (p[9] != null && p[3] + p[9] > 0.5) (G.rap || (G.rap = [])).push(p[3] / Math.max(p[9], 0.01)); } }
  return A;
}
function riga(nome, G) {
  const v = G.tc > 0 ? 100 * G.d / G.tc : null;
  return `${nome.padEnd(30)} ${String(G.fr).padStart(6)} ${String(G.cont).padStart(7)} ${pc(G.sk, G.cont).padStart(7)} ${pc(G.skA, G.cont).padStart(7)} ${f1(v).padStart(8)} ${String(G.ep.length).padStart(6)} ${f1(q(G.ep, 0.5)).padStart(6)} ${f1(q(G.ep, 0.9)).padStart(6)} ${pc(G.ep.filter(x => x > 5).length, G.ep.length).padStart(7)} ${f1(G.rap && G.rap.length ? q(G.rap, 0.5) * 100 : null).padStart(8)}`;
}
const TESTA = `${'gruppo'.padEnd(30)} ${'corpiF'.padStart(6)} ${'piediF'.padStart(7)} ${'scivola'.padStart(7)} ${'sc.anim'.padStart(7)} ${'v cm/s'.padStart(8)} ${'appogg'.padStart(6)} ${'med cm'.padStart(6)} ${'p90 cm'.padStart(6)} ${'>5 cm'.padStart(7)} ${'p/r %'.padStart(8)}`;

/* ═════════════════ RAPPORTO ═════════════════ */
if (ARG === 'rapporto') {
  const files = fs.readdirSync(OUT).filter(f => /^[a-z]+-cpu\d+\.json$/.test(f)).sort();
  if (!files.length) { console.log('nessuna misura in ' + OUT); process.exit(2); }
  const per = {}; for (const f of files) { const j = JSON.parse(fs.readFileSync(path.join(OUT, f))); (per['cpu' + j.cpu] = per['cpu' + j.cpu] || []).push(...j.esec); }
  for (const [cond, esec] of Object.entries(per)) {
    console.log(`\n══ CONDIZIONE ${cond} (notte, GLB acceso) — ${esec.length} esecuzioni ══`);
    console.log('\n── per famiglia ──\n' + TESTA);
    const F = aggrega(esec, x => x.fam); for (const k of FAMIGLIE) if (F[k]) console.log(riga(k, F[k]));
    const T = aggrega(esec, () => 'TUTTE'); console.log(riga('TUTTE', T.TUTTE));
    console.log('\n── per classe di corpo (tutte le famiglie) ──\n' + TESTA);
    const C = aggrega(esec, x => x.cl); for (const k of ['eroe', 'compagno', 'avversario', 'portiere', 'arbitro']) if (C[k]) console.log(riga(k, C[k]));
    console.log('\n── per famiglia × corpo ──\n' + TESTA);
    const FC = aggrega(esec, x => x.fam + ' · ' + x.cl); for (const k of Object.keys(FC).sort()) console.log(riga(k, FC[k]));
    console.log('\n── per modo della radice (ferma < 0,3 m/s · passo < 2,5 · corsa) ──\n' + TESTA);
    const M = aggrega(esec, x => x.mo || '?'); for (const k of ['ferma', 'passo', 'corsa']) if (M[k]) console.log(riga(k, M[k]));
    const MC = aggrega(esec, x => (x.mo || '?') + ' · ' + x.cl); for (const k of Object.keys(MC).sort()) console.log(riga(k, MC[k]));
    console.log('\n── per fase ──\n' + TESTA);
    const P = aggrega(esec, x => x.ph); for (const k of Object.keys(P).sort()) console.log(riga(k, P[k]));
    console.log('\n── appoggi: dove sta lo scivolamento (somma dei cm per classe · gesto/locomozione, prime 12) ──');
    const S = {}; let tot = 0; for (const e of esec) for (const p of (e.v ? e.v.ep : [])) { const k = p[1] + ' · ' + (p[6] ? 'gesto ' + p[6] : 'loco ' + p[7]); const s = S[k] || (S[k] = { n: 0, cm: 0, a: [] }); s.n++; s.cm += p[3]; s.a.push(p[3]); tot += p[3]; }
    Object.entries(S).sort((a, b) => b[1].cm - a[1].cm).slice(0, 12).forEach(([k, s]) => console.log(`  ${k.padEnd(44)} ${String(s.n).padStart(5)} appoggi · ${s.cm.toFixed(0).padStart(6)} cm (${pc(s.cm, tot)}) · mediana ${f1(q(s.a, 0.5))} cm · p90 ${f1(q(s.a, 0.9))}`));
    const salti = esec.reduce((a, e) => a + (e.v ? e.v.salti : 0), 0), persi = esec.reduce((a, e) => a + (e.v ? e.v.epPersi : 0), 0);
    const hl = esec.reduce((a, e) => a + (e.hl ? e.hl.fr : 0), 0), fr = esec.reduce((a, e) => a + (e.tot ? e.tot.fr : 0), 0);
    console.log(`\n  fotogrammi scartati per salto della radice > 1,2 m: ${salti} · appoggi oltre il tetto: ${persi} · testimone 7.999.7: highlight ${hl} su ${fr} corpi-fotogrammi`);
    const fps = esec.map(e => e.fps).filter(x => x > 0); console.log(`  fps reali (EMA del gioco) mediana ${f1(q(fps, 0.5))} · tempo di scena osservato mediano ${f1(q(esec.map(e => e.scena || 0), 0.5))} s per esecuzione`);
  }
  process.exit(0);
}

const TESTIMONE = ARG === 'testimone';
if (!FAMIGLIE.includes(ARG) && !TESTIMONE) { console.log(`uso: node pattinamento-451.mjs <${FAMIGLIE.join('|')}|rapporto|testimone>`); process.exit(3); }

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const T0 = Date.now();
const INIT = o => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TOD = 'night';
  window.__CPM_PIEDI_REC = 1; window.__CPM_PIEDI451 = 1; if (o.rosso) window.__CPM_NO_G451 = 1; };
async function nuovaPagina(flags = {}) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); page._ctx = ctx; page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT, flags);
  if (CPU > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU }); }
  return page;
}
const scena = page => page.evaluate(() => window.__CPM_SCENET || 0).catch(() => 0);
const attendi = async (page, ds, capMs) => { const s0 = await scena(page); const t0 = Date.now(); while (Date.now() - t0 < capMs) { if ((await scena(page)) - s0 >= ds) break; await sleep(120); } return (await scena(page)) - s0; };
const leggi = page => page.evaluate(() => { const W = window.__CPM_PIEDI; return { v: W && W.v451 ? JSON.parse(JSON.stringify(W.v451)) : null, hl: W ? W.hl : null, tot: W ? { fr: W.fr, cont: W.cont, sk: W.sk } : null, fps: window.__CPM_FPS708 || 0 }; });

async function esegui(page, gi, k, out) {
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
  const tot = await page.evaluate(() => SITUATIONS.length);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (gi + 61) % tot).catch(() => false);
  await attendi(page, 0.6, 15000 * CPU);
  await page.evaluate(() => { window.__CPM_PIEDI = null; });/* da qui: lettura (intro/scelta) + esito della scena misurata */
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) return { errore: 'forzatura fallita' };
  let sc = await attendi(page, 1.0, 20000 * CPU);
  await page.evaluate(o => { window.__CPM_FORCE_OUTCOME = o; }, out);
  const okR = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false);
  if (!okR) return { errore: 'risoluzione fallita' };
  sc += await attendi(page, SCENA_S, 60000 * CPU);
  return { ...(await leggi(page)), scena: +sc.toFixed(2) };
}

/* ═════════════════ PROVA DEL TESTIMONE (verde e rosso sulla stessa scena) ═════════════════ */
if (TESTIMONE) {
  const r = {};
  for (const br of ['verde', 'rosso']) { const page = await nuovaPagina({ rosso: br === 'rosso' }); await openMatch(page, port);
    await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => {}); await sleep(600);
    const e = await esegui(page, 0, 0, 'success'); r[br] = e; await page._ctx.close();
    console.log(`  ${br.padEnd(5)} testimone 7.999.7: corpi-fotogrammi ${e.tot ? e.tot.fr : '—'} · negli highlight ${e.hl ? e.hl.fr : '—'} (piede a terra ${e.hl ? e.hl.cont : '—'}, scivola ${e.hl ? e.hl.sk : '—'}) · scena ${e.scena} s`); }
  await b.close().catch(() => {}); srv.close();
  const ok = r.verde.tot && r.verde.tot.fr > 0 && r.verde.hl.fr > 0 && r.verde.hl.fr === r.verde.tot.fr && r.rosso.tot && r.rosso.tot.fr > 0 && r.rosso.hl.fr === 0;
  console.log(ok ? '✅ testimone riparato: conta negli highlight (verde) e il rosso __CPM_NO_G451 torna a 0 su 0' : '❌ testimone: il verde non conta negli highlight o il rosso non torna a 0');
  setTimeout(() => process.exit(ok ? 0 : 1), 100);
} else {
  const esec = [];
  if (ARG === 'ingresso') {/* percorso vero: salvataggio → partita → ingresso in campo (come tunnel-245), fino alla fine del walkout */
    const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
    const N = +(process.env.CPM_SCENE || 2);
    for (let i = 0; i < N; i++) {
      const page = await nuovaPagina(); await page.addInitScript(s => { window.__CPM_WALKTEST74 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, SAVE);
      const o = { fam: 'ingresso', gi: 'walk' + i };
      try {
        await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 * CPU });
        await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 * CPU }); await sleep(1200);
        try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
        await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 * CPU }); await sleep(2000);
        try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
        await page.evaluate(() => window.__CPM_CAREER.playMatch());
        const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
        for (let k = 0; k < 90; k++) { if ((await ph()) === 'walkout') break;
          await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
          await sleep(700); }
        await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => {});
        o.walk = (await ph()) === 'walkout';
        const s0 = await scena(page); const t0 = Date.now();
        while (Date.now() - t0 < 420000 && (await ph()) === 'walkout') await sleep(500);
        o.scena = +((await scena(page)) - s0).toFixed(2); Object.assign(o, await leggi(page));
      } catch (e) { o.errore = String(e.message).slice(0, 160); }
      o.errori = page._errs.slice(0, 3); await page._ctx.close(); esec.push(o);
      console.log(`  ingresso ${i}: walkout ${o.walk ? 'visto' : 'NON visto'} · scena ${o.scena} s · ${o.v ? Object.values(o.v.b).reduce((a, B) => a + B.cont, 0) + ' piede-fotogrammi' : 'nessun dato'} ${o.errore || ''}`);
    }
  } else {
    let page = await nuovaPagina(); await openMatch(page, port);
    await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => {}); await sleep(600);
    const catalogo = await page.evaluate(() => SITUATIONS.map((s, gi) => ({ gi, type: s.type, acts: (s.actions || []).map((a, k) => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return { k, l: a.label, t: h.type || null, v: h.variant || null }; }) })));
    const cand = []; for (const s of catalogo) { const az = s.acts.find(a => famigliaDi(s, a) === ARG); if (az) cand.push({ gi: s.gi, k: az.k, t: az.t }); }
    const N = Math.min(+(process.env.CPM_SCENE || 3), cand.length); const scelte = []; for (let i = 0; i < N; i++) scelte.push(cand[Math.floor(i * cand.length / N)]);
    console.log(`[${ARG} · cpu ×${CPU}] ${cand.length} scene candidate · misurate ${scelte.map(c => 'gi' + c.gi + '(' + c.t + ')').join(', ')}`);
    let n = 0;
    for (const sc of scelte) for (const out of ['success', 'fail']) {
      if (n > 0 && n % PER_PAGINA === 0) { await page._ctx.close(); page = await nuovaPagina(); await openMatch(page, port); await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => {}); await sleep(600); }
      n++;
      const r = await esegui(page, sc.gi, sc.k, out); const o = { fam: ARG, gi: sc.gi, k: sc.k, t: sc.t, out, ...r };
      esec.push(o);
      const C = o.v ? Object.values(o.v.b).reduce((a, B) => ({ cont: a.cont + B.cont, sk: a.sk + B.sk }), { cont: 0, sk: 0 }) : null;
      console.log(`  gi${sc.gi} ${out.padEnd(7)} scena ${o.scena} s · piede-fotogrammi ${C ? C.cont : '—'} · scivola ${C ? pc(C.sk, C.cont) : '—'} · appoggi ${o.v ? o.v.ep.length : '—'} ${o.errore || ''} (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
    }
    await page._ctx.close();
  }
  await b.close().catch(() => {}); srv.close();
  fs.writeFileSync(path.join(OUT, `${ARG}-cpu${CPU}.json`), JSON.stringify({ fam: ARG, cpu: CPU, quando: new Date().toISOString(), esec }));
  const cont = esec.reduce((a, e) => a + (e.v ? Object.values(e.v.b).reduce((x, B) => x + B.cont, 0) : 0), 0);
  console.log(cont ? `✓ ${ARG} cpu ×${CPU}: ${cont} piede-fotogrammi a terra contati → ${path.join('out', 'pattinamento-451', ARG + '-cpu' + CPU + '.json')}` : `❌ CIECA: nessun piede-fotogramma contato`);
  setTimeout(() => process.exit(cont ? 0 : 2), 100);
}
