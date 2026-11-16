#!/usr/bin/env node
/* GIRO 226 (PO-491) — BANCO DI MISURA DEI DRIBBLING DELL'EROE. STRUMENTO, NON GUARDIANO (il guardiano e' dribbling-226.mjs).
   Provoca OGNI azione di dribbling del catalogo (lib/dribbling-226.mjs → catalogo) con esito riuscito e fallito, GLB acceso,
   pagina nuova ogni CPM_PER_PAGINA esecuzioni (7.483: una pagina stanca non e' il gioco), e scrive out/dribbling-226/<nome>.json.

   USO (da tests/visual):  CPM_CHROME=/opt/pw-browsers/chromium node misura-dribbling-226.mjs
     CPM_FETTA=i/n     solo la fetta i di n del catalogo (per spezzare la misura in gruppi sotto i dieci minuti)
     CPM_SOLO=30:0,92:0  solo queste azioni (gi:k)       CPM_ESITI=success,fail
     CPM_FOTO=1        una foto del campo ogni 0,35 s di scena in out/dribbling-226/foto/
     CPM_NOME=prima    nome del file d'uscita (default «misura»)   CPM_ROSSO=1 arma window.__CPM_NO_G226
     node misura-dribbling-226.mjs classifica [nome…]   → aggrega i json e stampa la classifica dei piu' confusi          */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, __dirname as LIBDIR } from './lib/harness.mjs';
import { S, INIT, catalogo, esegui, rigaBreve, sleep } from './lib/dribbling-226.mjs';

const OUT = path.join(LIBDIR, '..', 'out', 'dribbling-226');
fs.mkdirSync(path.join(OUT, 'foto'), { recursive: true });
const NOME = process.env.CPM_NOME || 'misura';

if (process.argv[2] === 'classifica') { classifica(process.argv.slice(3)); process.exit(0); }

const T0 = Date.now();
const PER_PAGINA = Math.max(1, +(process.env.CPM_PER_PAGINA || 2)); /* una pagina per azione: prima il FALLITO, poi il riuscito. Dopo un gol le squadre tornano a centrocampo e la scena seguente sulla stessa pagina partiva coi difensori a 14-22u (misurato su gi71: era lo strumento, 7.483) */
const ESITI = (process.env.CPM_ESITI || 'fail,success').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
/* l'apertura della partita puo' sforare il suo tempo sotto carico (Babel in pagina): si riprova, fino a tre volte, su pagina nuova */
async function nuovaPagina(...a) { let err; for (let i = 0; i < 3; i++) { try { return await nuovaPagina0(...a); } catch (e) { err = e; console.log('  (apertura pagina fallita: ' + String(e.message || e).split('\n')[0].slice(0, 90) + ' — riprovo)'); await sleep(2000); } } throw err; }
async function nuovaPagina0() {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT);
  if (process.env.CPM_ROSSO) await page.addInitScript(() => { window.__CPM_NO_G226 = 1; });
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  page._glb = await page.evaluate(() => window.__CPM_GLB_READY === true);
  await sleep(600);
  return page;
}
let page = await nuovaPagina();
const TOT = await page.evaluate(() => SITUATIONS.length);
let cat = await catalogo(page);
const tuttoN = cat.length;
if (process.env.CPM_SOLO) { const w = new Set(process.env.CPM_SOLO.split(',')); cat = cat.filter(a => w.has(`${a.gi}:${a.k}`)); }
if (process.env.CPM_FETTA) { const [i, n] = process.env.CPM_FETTA.split('/').map(Number); cat = cat.filter((_, j) => j % n === i); }
console.log(`[misura-dribbling-226] ${tuttoN} azioni di dribbling nel catalogo · misurate ${cat.length} × ${ESITI.join('/')} · GLB ${page._glb ? 'acceso' : 'NON PRONTO'}${process.env.CPM_ROSSO ? ' · BRACCIO ROSSO (__CPM_NO_G226)' : ''}`);
const file = path.join(OUT, `${NOME}${process.env.CPM_FETTA ? '-' + process.env.CPM_FETTA.replace('/', 'di') : ''}.json`);
/* il file si scrive dopo OGNI esecuzione, e una corsa caduta si riprende da dove era (CPM_RIPRENDI=1): sotto carico l'apertura di una
   pagina puo' cadere, e una fetta da venti minuti non si butta per questo */
const righe = (process.env.CPM_RIPRENDI && fs.existsSync(file)) ? JSON.parse(fs.readFileSync(file, 'utf8')).righe.filter(r => r.giudicata) : [];
const fatte = new Set(righe.map(r => `${r.gi}:${r.k}:${r.out}`)); if (righe.length) console.log(`  (ripresa: ${righe.length} esecuzioni gia' nel file)`);
const scrivi = (errori) => fs.writeFileSync(file, JSON.stringify({ quando: new Date().toISOString(), rosso: !!process.env.CPM_ROSSO, soglie: S, catalogo: tuttoN, righe, errori: errori || [] }, null, 1));
let usate = 0; const errs = [];
for (const a of cat) for (const out of ESITI) {
  if (fatte.has(`${a.gi}:${a.k}:${out}`)) continue;
  if (usate >= PER_PAGINA) { errs.push(...page._errs); await page.close().catch(() => {}); page = await nuovaPagina(); usate = 0; }
  usate++;
  const t = Date.now(); let r;
  const foto = process.env.CPM_FOTO ? { base: path.join(OUT, 'foto', `${NOME}-gi${a.gi}k${a.k}-${out}`), passo: 0.35, max: 14 } : null;
  try { r = await esegui(page, { ...a, out }, { totale: TOT, foto }); } catch (e) { r = { ...a, out, errore: String(e.message || e).slice(0, 160) }; }
  r.realeS = Math.round((Date.now() - t) / 1000); righe.push(r); scrivi();
  console.log('  ' + rigaBreve(r) + ` · ${r.realeS}s`);
}
errs.push(...page._errs);
await page.close().catch(() => {}); await b.close(); srv.close();
scrivi([...new Set(errs)].slice(0, 8));
const g = righe.filter(r => r.giudicata);
console.log(`[misura-dribbling-226] ${g.length}/${righe.length} giudicate · ${Math.round((Date.now() - T0) / 1000)} s · → ${path.relative(process.cwd(), file)}${errs.length ? ' · pageerror: ' + [...new Set(errs)].slice(0, 2).join(' | ') : ''}`);
process.exit(g.length === righe.length ? 0 : 2);

function classifica(nomi) {
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.json') && (!nomi.length || nomi.some(n => f.startsWith(n))));
  let righe = []; for (const f of files) righe.push(...JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')).righe);
  const g = righe.filter(r => r.giudicata).sort((a, b) => b.punti - a.punti);
  console.log(`CLASSIFICA DEI DRIBBLING PIU' CONFUSI — ${g.length} esecuzioni giudicate su ${righe.length} (${files.join(', ')})\n`);
  g.forEach((r, i) => { console.log(`${String(i + 1).padStart(3)}. ${rigaBreve(r)}`); for (const d of r.difetti) console.log('        · ' + d); });
  const ng = righe.filter(r => !r.giudicata); if (ng.length) { console.log('\nNON GIUDICATE:'); ng.forEach(r => console.log('  ' + rigaBreve(r))); }
  /* per variante e per voce */
  const per = {}; for (const r of g) { const k = `${r.v} · ${r.out}`; (per[k] = per[k] || []).push(r); }
  console.log('\nPER VARIANTE ED ESITO (n · punti medi · quota con almeno un difetto):');
  for (const [k, v] of Object.entries(per).sort((a, b) => avg(b[1]) - avg(a[1]))) console.log(`  ${k.padEnd(34)} n=${String(v.length).padStart(2)} · ${avg(v).toFixed(2)} · ${(v.filter(r => r.difetti.length).length / v.length * 100).toFixed(0)}%`);
  const voci = {}; for (const r of g) for (const d of r.difetti) { const k = d.replace(/[0-9.,]+/g, '#').slice(0, 60); voci[k] = (voci[k] || 0) + 1; }
  console.log('\nDIFETTI PER FREQUENZA:'); for (const [k, n] of Object.entries(voci).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)} × ${k}`);
  function avg(v) { return v.reduce((s, r) => s + r.punti, 0) / v.length; }
}
