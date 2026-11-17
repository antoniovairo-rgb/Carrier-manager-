#!/usr/bin/env node
/* GIRO 241 (PO-506) — BANCO DI MISURA «EROE IN QUADRO DOPO UN'AZIONE FALLITA». STRUMENTO, NON GUARDIANO (il guardiano e' camera-241).
   Provoca ogni azione non difensiva dell'eroe (tiro, cross, passaggio, dribbling) con esito FALLITO, GLB acceso, e scrive
   out/camera-241/<nome>.json. Pagina nuova ogni CPM_PER_PAGINA esecuzioni (7.483).
     CPM_FETTA=i/n · CPM_SOLO=30:0,55:1 · CPM_NOME=prima · CPM_ROSSO=1 (window.__CPM_NO_G241) · CPM_POST=3.5 (gioco dopo la scena)
     CPM_KIND=post (forza il tipo d'esito) · CPM_FOTO=1 · CPM_RIPRENDI=1 · node misura-241.mjs riepilogo [nome…]                  */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, __dirname as LIBDIR } from './lib/harness.mjs';
import { S, INIT, catalogo, esegui, rigaBreve, violazioni, sleep } from './lib/camera-241.mjs';

const OUT = path.join(LIBDIR, '..', 'out', 'camera-241'); fs.mkdirSync(path.join(OUT, 'foto'), { recursive: true });
const NOME = process.env.CPM_NOME || 'misura';
if (process.argv[2] === 'riepilogo') { riepilogo(process.argv.slice(3)); process.exit(0); }
const T0 = Date.now(); const PER_PAGINA = Math.max(1, +(process.env.CPM_PER_PAGINA || 3)); const POST = +(process.env.CPM_POST || 0);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function nuovaPagina() { let err; for (let i = 0; i < 3; i++) { try { return await nuovaPagina0(); } catch (e) { err = e; console.log('  (apertura pagina fallita: ' + String(e.message || e).split('\n')[0].slice(0, 90) + ' — riprovo)'); await sleep(2000); } } throw err; }
async function nuovaPagina0() {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT);
  if (process.env.CPM_ROSSO) await page.addInitScript(() => { window.__CPM_NO_G241 = 1; });
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  page._glb = await page.evaluate(() => window.__CPM_GLB_READY === true);
  await sleep(600);
  return page;
}
let page = await nuovaPagina();
const TOT = await page.evaluate(() => SITUATIONS.length);
let cat = await catalogo(page); const tuttoN = cat.length;
if (process.env.CPM_SOLO) { const w = new Set(process.env.CPM_SOLO.split(',')); cat = cat.filter(a => w.has(`${a.gi}:${a.k}`)); }
if (process.env.CPM_FETTA) { const [i, n] = process.env.CPM_FETTA.split('/').map(Number); cat = cat.filter((_, j) => j % n === i); }
const perFam = {}; for (const a of cat) perFam[a.fam] = (perFam[a.fam] || 0) + 1;
console.log(`[misura-241] ${tuttoN} azioni non difensive nel catalogo · misurate ${cat.length} (${Object.entries(perFam).map(([k, v]) => k + ' ' + v).join(', ')}) · GLB ${page._glb ? 'acceso' : 'NON PRONTO'}${process.env.CPM_ROSSO ? ' · BRACCIO ROSSO (__CPM_NO_G241)' : ''}`);
const file = path.join(OUT, `${NOME}${process.env.CPM_FETTA ? '-' + process.env.CPM_FETTA.replace('/', 'di') : ''}.json`);
const righe = (process.env.CPM_RIPRENDI && fs.existsSync(file)) ? JSON.parse(fs.readFileSync(file, 'utf8')).righe.filter(r => r.giudicata) : [];
const fatte = new Set(righe.map(r => `${r.gi}:${r.k}`)); if (righe.length) console.log(`  (ripresa: ${righe.length} esecuzioni gia' nel file)`);
const scrivi = errori => fs.writeFileSync(file, JSON.stringify({ quando: new Date().toISOString(), rosso: !!process.env.CPM_ROSSO, soglie: S, catalogo: tuttoN, righe, errori: errori || [] }, null, 1));
let usate = 0; const errs = [];
for (const a of cat) {
  if (fatte.has(`${a.gi}:${a.k}`)) continue;
  if (usate >= PER_PAGINA) { errs.push(...page._errs); await page.close().catch(() => {}); page = await nuovaPagina(); usate = 0; }
  usate++;
  const foto = process.env.CPM_FOTO ? { base: path.join(OUT, 'foto', `${NOME}-gi${a.gi}k${a.k}`), passo: +(process.env.CPM_FOTO_PASSO || 0.4), max: 22 } : null;
  let r; try { r = await esegui(page, { ...a, out: 'fail' }, { totale: TOT, post: POST, kind: process.env.CPM_KIND || null, foto }); } catch (e) { r = { ...a, out: 'fail', errore: String(e.message || e).slice(0, 160) }; usate = PER_PAGINA; }
  righe.push(r); scrivi(errs);
  console.log(`  ${violazioni(r).length ? '❌' : '✅'} ${rigaBreve(r)}`);
}
errs.push(...page._errs); scrivi([...new Set(errs)]);
await page.close().catch(() => {}); await b.close(); srv.close();
console.log(`[misura-241] ${righe.length} esecuzioni in ${Math.round((Date.now() - T0) / 1000)} s → ${file}`);
riepilogo([path.basename(file, '.json')]);

function riepilogo(nomi) {
  let R = []; for (const n of nomi) for (const f of fs.readdirSync(OUT)) if (f === n + '.json' || (f.startsWith(n + '-') && /-\d+di\d+\.json$/.test(f))) R.push(...JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')).righe);
  const G = R.filter(r => r.giudicata), NG = R.filter(r => !r.giudicata);
  console.log(`\n== RIEPILOGO ${nomi.join('+')}: ${R.length} esecuzioni · giudicate ${G.length} · non giudicate ${NG.length} ==`);
  const fam = {}; for (const r of G) (fam[r.fam] = fam[r.fam] || []).push(r);
  for (const [k, v] of Object.entries(fam)) { const s95 = v.filter(r => r.qDentro < 0.95), s85 = v.filter(r => r.qDentro < 0.85), z95 = v.filter(r => r.qSchermo < 0.95); const tot = v.reduce((a, r) => a + r.nFot, 0), fu = v.reduce((a, r) => a + Math.round(r.nFot * (1 - r.qDentro)), 0);
    console.log(`  ${k.padEnd(10)} ${String(v.length).padStart(3)} esecuzioni · eroe sotto il 95%: regia ${s95.length} (sotto l'85%: ${s85.length}) schermo ${z95.length} · fotogrammi fuori ${fu}/${tot} (${(100 * fu / tot).toFixed(1)}%) · sul bordo medio ${(100 * v.reduce((a, r) => a + (r.qBordo || 0), 0) / v.length).toFixed(1)}% · insieme eroe+pallone medio ${(100 * v.reduce((a, r) => a + r.qInsieme, 0) / v.length).toFixed(0)}% · taglia max ${Math.max(...v.map(r => r.hhMax))} · taglia mediana ${[...v.map(r => r.hhMed)].sort((a, b) => a - b)[v.length >> 1]}`); }
  const s95 = G.filter(r => r.qDentro < 0.95 || r.qSchermo < 0.95).sort((a, b) => Math.min(a.qDentro, a.qSchermo) - Math.min(b.qDentro, b.qSchermo));
  console.log(`  TOTALE: sotto il 95% regia ${G.filter(r => r.qDentro < 0.95).length}/${G.length} · schermo ${G.filter(r => r.qSchermo < 0.95).length}/${G.length} · sotto l'85% regia ${G.filter(r => r.qDentro < 0.85).length} schermo ${G.filter(r => r.qSchermo < 0.85).length} · sul bordo medio ${(100 * G.reduce((a, r) => a + (r.qBordo || 0), 0) / G.length).toFixed(1)}% · insieme medio ${(100 * G.reduce((a, r) => a + r.qInsieme, 0) / G.length).toFixed(1)}% · eroe enorme (> ${S.H_GIGANTE}) in ${G.filter(r => r.hhMax > S.H_GIGANTE).length}`);
  for (const r of s95.slice(0, 60)) console.log('    ' + rigaBreve(r) + ` · pa ${r.pa} · sogg.palla ${(r.qSoggPalla * 100).toFixed(0)}% · palla-eroe max ${r.dBHmax}u`);
  const D = G.filter(r => r.dopo); if (D.length) { const en = D.filter(r => r.dopo.nEnorme > 0); console.log(`  DOPO LA SCENA (${D.length} osservate): eroe oltre il ${S.H_ENORME * 100}% del quadro in ${en.length} · ` + en.slice(0, 20).map(r => `gi${r.gi}k${r.k} max ${r.dopo.hhMax} a ${r.dopo.tEnorme}s`).join(' · ')); const eS = G.filter(r => r.nEnormeScena > 0); console.log(`  DENTRO LA SCENA: eroe oltre il ${S.H_ENORME * 100}% in ${eS.length} · ` + eS.slice(0, 20).map(r => `gi${r.gi}k${r.k} max ${r.hhMax}`).join(' · ')); }
  for (const r of NG.slice(0, 30)) console.log('    NG ' + rigaBreve(r));
}
