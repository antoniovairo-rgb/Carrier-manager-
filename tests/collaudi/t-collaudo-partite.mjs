#!/usr/bin/env node
/* Zona T (collaudo su build 7.999.156 = 2adc96a) — partite VERE dal salvataggio S12 (tests/visual/fixtures/save-190-s12-ovr93.json),
   autoplay a semi fissi, nome del giocatore diverso per partita (il seme nasce anche dal nome).
   MODI:
   --modo=221      PO-221: scene dell'eroe a partita (__CPM_CAST219.length, come scene-221.mjs), gol dell'eroe (RES218 ok && key==='goal'),
                   tutte le chiavi di esito viste (per trovare la chiave dell'assist senza supporla). GLB SPENTO (come il team: conteggi di logica).
   --modo=220      PO-220: nelle scene difensive (CAST219.tipo==='difesa') distanza minima eroe-portatore nel 3D e ampiezza gambe (__CPM_GESTURE),
                   + distribuzione dei defGesto risolti (RES218). GLB SPENTO (stesso metodo di difesa-220.mjs).
   --modo=220foto  PO-220 visivo: GLB ACCESO (window.__CPM_GLB=true). Per ogni scena difensiva risolta, nella fase d'esito (hl_result),
                   3 fotogrammi a 0,7 s + stato del gesto GLB dell'eroe (__CPM_GST: clip attiva, peso, timeScale). Max 8 scene per partita.
   Uso: CPM_OUT=<file.json> CPM_FOTO=<cartella> CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
        node t-collaudo-partite.mjs --modo=221 --semi=1,2,3,4 [--budget=470000] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const MODO = arg('modo', '221');
const SEMI = arg('semi', '1,2,3,4').split(',').map(Number);
const BUDGET = +arg('budget', '420000');
const GLB = MODO === '220foto';
const OUT = process.env.CPM_OUT || path.join(REPO, 'docs', 'collaudi', `t-${MODO}.json`);
const FOTO = process.env.CPM_FOTO || path.join(REPO, 'docs', 'collaudi', 'foto');
fs.mkdirSync(FOTO, { recursive: true });
const save = JSON.parse(fs.readFileSync(path.join(REPO, 'tests', 'visual', 'fixtures', 'save-190-s12-ovr93.json'), 'utf8'));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const righe = []; const risultati = [];

async function partita(sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = 'Collaudo T' + sd;
  await page.addInitScript(([s, glb]) => { window.__CPM_GLB = glb; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, GLB]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  if (GLB) await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const t0 = Date.now(); let ph = ''; let dmin = 99, gmax = 0, inDif = false; const dist = [], gambe = []; let fotoN = 0; const gst = []; let ultimoFoto = null;
  while (Date.now() - t0 < BUDGET) {
    const r = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const C = (window.__CPM_CAST219 || []).slice(-1)[0] || null;
      let d = null, g = null; const RES = (window.__CPM_RES218 || []).slice(-1)[0] || null;
      if (C && C.tipo === 'difesa' && /^hl_/.test(ph || '')) { try { const st = window.__CPM_STATE(); const p = C.port && st.players[C.port.i]; if (p) d = Math.hypot(p.x - st.hero.x, p.y - st.hero.y); } catch (e) {}
        try { const G = window.__CPM_GESTURE(); g = Math.max(Math.abs((G.lR && G.lR.x) || 0), Math.abs((G.lL && G.lL.x) || 0)); } catch (e) {} }
      return { ph, dif: !!(C && C.tipo === 'difesa'), d, g, ultimoRes: (window.__CPM_CAST219 || []).length }; });
    ph = r.ph;
    if (MODO === '220' || MODO === '220foto') {
      if (r.dif && /^hl_/.test(ph || '')) { inDif = true; if (r.d != null) dmin = Math.min(dmin, r.d); if (r.g != null && ph === 'hl_result') gmax = Math.max(gmax, r.g); }
      else if (inDif && !/^hl_/.test(ph || '')) { dist.push(+dmin.toFixed(1)); gambe.push(+gmax.toFixed(2)); inDif = false; dmin = 99; gmax = 0; }
    }
    if (MODO === '220foto' && r.dif && ph === 'hl_result' && fotoN < 4 && r.ultimoRes !== ultimoFoto) {
      ultimoFoto = r.ultimoRes;
      for (let k = 0; k < 3; k++) { const gs = await page.evaluate(() => window.__CPM_GST || null).catch(() => null); gst.push(gs ? { g: gs.g, cur: gs.cur, has: gs.has, ts: gs.ts } : null);
        await page.screenshot({ path: path.join(FOTO, `t220-s${sd}-scena${fotoN}-f${k}.png`) }).catch(() => {}); await sleep(500); }
      fotoN++;
    }
    if (ph === 'ended' || ph === 'ceremony') break; await sleep(150);
  }
  const R = await page.evaluate(() => ({ scene: (window.__CPM_CAST219 || []).length, res: (window.__CPM_RES218 || []).map(x => ({ tipo: x.tipo, key: x.key, ok: !!x.ok, defGesto: x.defGesto || null })) }));
  const gol = R.res.filter(x => x.ok && x.key === 'goal').length;
  const chiavi = {}; for (const x of R.res) chiavi[(x.key || '?') + (x.ok ? '+' : '-')] = (chiavi[(x.key || '?') + (x.ok ? '+' : '-')] || 0) + 1;
  const dg = {}; for (const x of R.res) if (x.defGesto) dg[x.defGesto] = (dg[x.defGesto] || 0) + 1;
  const riga = { seme: sd, fine: ph, scene: R.scene, gol, chiavi, defGesto: dg, dist, gambe, fotoScene: fotoN, gst, errori: errs.length, primoErrore: errs[0] || null };
  console.log(JSON.stringify(riga)); risultati.push(riga); righe.push(riga);
  await ctx.close();
  fs.writeFileSync(OUT, JSON.stringify({ modo: MODO, glb: GLB, budget: BUDGET, partite: risultati }, null, 1));
}

for (const sd of SEMI) await partita(sd);
await b.close(); srv.close();
const scene = risultati.map(x => x.scene), gol = risultati.map(x => x.gol);
const med = a => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : null; };
console.log(`RIEPILOGO ${MODO}: partite ${risultati.length} · scene ${JSON.stringify(scene)} mediana ${med(scene)} · gol ${JSON.stringify(gol)} mediana ${med(gol)} · file ${OUT}`);
