#!/usr/bin/env node
/* [giro 316 · PO-602] GUARDIANO NON-gate musica-316 — la serata di presentazione suona il brano scelto dal PO
   («The Storm Chasers», Eldritch Grim, CC0, candidato C della pagina d'ascolto del giro 315); la fine stagione tiene il brano di prima.
   A. STATICO (dal repo)
      1. registro LICENZE.json: music/ceremony/cacciatori-di-tempeste con evento music.presentazione, CC0, pagina, autore, data e
         sha256 dell'originale = 76b19d2d… (quello verificato al download); misure: −18 LUFS ±0,5, picco ≤ −1,5 dBFS;
      2. i due file (ogg, mp3) esistono e il loro peso e' quello del registro; il loro sha256 e' quello scritto in SHA_FILE qui sotto;
      3. crediti: «The Storm Chasers» con Eldritch Grim in CREDITI238 (src/17).
   B. NEL BROWSER, sul sito servito come su GitHub Pages (dist-web, audio vero, niente ?cpmtest)
      4. dopo il primo gesto il brano nuovo e quello di fine stagione sono decodificati (col rosso: il nuovo non si carica);
      5. AudioMgr.ceremony('presentazione') → brano music.presentazione (testimone __CPM_AUDIO161().brano);
         AudioMgr.ceremony('finestagione') → brano music.cerimonia; uscita (ceremony(null)) → musica spenta.
   Bracci: VERDE deve passare; ROSSO (`__CPM_NO_G316`, il brano della 7.999.200) deve CADERE su 4-5.
   «Non giudicato» (sonda assente, pagina che non monta, file non decodificati) = rosso. Verde e rosso stampati per ultimi. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchBrowser, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(QUI, '../..');
const DIST = path.resolve(process.env.CPM_DIST || path.join(ROOT, 'dist-web'));
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/LICENZE.json'), 'utf8'));
const NOME = 'music/ceremony/cacciatori-di-tempeste';
const SHA_ORIG = '76b19d2dab0d21e302534d28d3000ac9121225f78449e0b21708cd8f64e71714';
const SHA_FILE = { ogg: 'a7a6f6d786807143349ce9c63bf66e3564ee38d62a6f2dca8174f136f8841d07', mp3: 'b6717c16e4320dacf325ef68daa48f8fbdabd5488be42f0ebadf9567be8cb12c' };

/* ---------------- A. statico ---------------- */
const st = []; const ok = (nome, cond, info) => st.push({ nome, ok: !!cond, info });
const v = REG.file[NOME];
ok('1 registro: evento, CC0, fonte completa, sha256 dell\'originale, misure', v && v.evento === 'music.presentazione' && v.sorgente && /CC0/.test(v.sorgente.licenza)
  && /opengameart\.org\/content\/storm-chasers/.test(v.sorgente.pagina) && v.sorgente.autore === 'Eldritch Grim' && /^\d{4}-\d\d-\d\d$/.test(v.sorgente.letta)
  && v.sorgente.sha256 === SHA_ORIG && Math.abs(v.lufs + 18) <= 0.5 && v.picco_dbfs <= -1.5,
  v ? `evento ${v.evento} · lufs ${v.lufs} · picco ${v.picco_dbfs} · sha ${String(v.sorgente && v.sorgente.sha256).slice(0, 12)}… · letta ${v.sorgente && v.sorgente.letta}` : 'voce assente');
const fileOk = ['ogg', 'mp3'].map(e => { const p = path.join(ROOT, 'assets/audio', NOME + '.' + e); if (!fs.existsSync(p)) return [e, 'assente'];
  const b = fs.readFileSync(p); const h = crypto.createHash('sha256').update(b).digest('hex');
  return [e, h === SHA_FILE[e] && v && v.byte[e] === b.length ? 'ok' : `sha ${h.slice(0, 12)}… · byte ${b.length} (registro ${v && v.byte[e]})`]; });
ok('2 i due file esistono con lo sha256 e il peso registrati', fileOk.every(([, x]) => x === 'ok'), JSON.stringify(fileOk));
const s17 = fs.readFileSync(path.join(ROOT, 'src/17-menu-creazione-pannelli.jsx'), 'utf8');
ok('3 crediti: «The Storm Chasers» di Eldritch Grim', /«The Storm Chasers»[^\n]*aut:"Eldritch Grim"/.test(s17), '');

/* ---------------- B. browser sul sito ---------------- */
if (!process.env.CPM_NO_BUILD) execFileSync('node', [path.join(ROOT, 'tools/build-dist.mjs'), '--web'], { stdio: 'ignore' });
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error(`manca ${DIST}/index.html`); process.exit(2); }
const BASE = '/Carrier-manager-/';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
  u = u.slice(BASE.length) || 'index.html'; if (u.endsWith('/')) u += 'index.html';
  const f = path.join(DIST, u); if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Content-Length': fs.statSync(f).size }); fs.createReadStream(f).pipe(r);
}).listen(0);
const URLG = `http://localhost:${srv.address().port}${BASE}`;
const KEYS = ['music.presentazione', 'music.cerimonia'];

async function sito(rosso) {
  const b = await launchBrowser(); const passi = [];
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (rosso) await ctx.addInitScript(() => { window.__CPM_NO_G316 = true; });
  const errs = []; const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.goto(URLG, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  const monta = await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);
  await p.mouse.click(206, 40).catch(() => {});
  let s = null; const t0 = Date.now(); const car = () => s && KEYS.every(k => s.eventi[k] && s.eventi[k].file.every(f => f.caricato));
  while (monta && Date.now() - t0 < 30000) {
    s = await p.evaluate(() => (typeof window.__CPM_AUDIO149 === 'function' ? window.__CPM_AUDIO149() : null)).catch(() => null);
    if (car()) break; await sleep(500);
  }
  const info4 = s ? KEYS.map(k => `${k}:${s.eventi[k] ? s.eventi[k].file.filter(f => f.caricato).length + '/' + s.eventi[k].n : 'assente'}`).join(' · ') : 'sonda assente';
  passi.push({ nome: '4 brano della serata e brano di fine stagione decodificati', ok: monta && car(), info: `monta=${monta} · ${info4}` });
  const r = monta ? await p.evaluate(async () => {
    const A = () => window.__CPM_AUDIO161 ? window.__CPM_AUDIO161() : null; if (!A()) return { sonda: false };
    const out = []; const passo = async (cosa, fn) => { fn(); await new Promise(z => setTimeout(z, 300)); const a = A(); out.push([cosa, a.musica, a.brano]); };
    await passo('carriera', () => AudioMgr.scene('career'));
    await passo('presentazione', () => AudioMgr.ceremony('presentazione')); await passo('uscita', () => AudioMgr.ceremony(null));
    await passo('finestagione', () => AudioMgr.ceremony('finestagione')); await passo('uscita2', () => AudioMgr.ceremony(null));
    return { sonda: true, out, testimone: 'brano' in A() };
  }).catch(e => ({ sonda: false, err: String(e).slice(0, 100) })) : { sonda: false };
  const M = Object.fromEntries((r.out || []).map(([k, m, br]) => [k, [m, br]]));
  const ok5 = r.sonda && r.testimone && M.presentazione && M.presentazione[0] === 'cer:presentazione' && M.presentazione[1] === 'music.presentazione'
    && M.uscita[0] == null && M.finestagione[0] === 'cer:finestagione' && M.finestagione[1] === 'music.cerimonia' && M.uscita2[0] == null && M.carriera[0] == null;
  passi.push({ nome: '5 la serata chiede il brano nuovo, la fine stagione il vecchio, l\'uscita spegne', ok: ok5, info: `sonda=${r.sonda} · ${JSON.stringify(r.out || r.err || [])}` });
  passi.push({ nome: '  errori di pagina', ok: errs.length === 0, info: JSON.stringify(errs.slice(0, 3)) });
  await b.close(); return passi;
}

const V = await sito(false), R = await sito(true); srv.close();
fs.mkdirSync(path.join(QUI, 'out'), { recursive: true });
fs.writeFileSync(path.join(QUI, 'out/musica-316.json'), JSON.stringify({ statico: st, verde: V, rosso: R }, null, 1));
const stampa = (t, L) => { console.log(t); for (const x of L) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`); };
stampa('STATICO', st); stampa('VERDE', V); stampa('ROSSO (__CPM_NO_G316)', R);
const sOk = st.every(x => x.ok), vOk = V.every(x => x.ok);
const rCade = R.filter(x => /^[45] /.test(x.nome)).some(x => !x.ok);
const motivi = []; if (!sOk) motivi.push('statico rosso'); if (!vOk) motivi.push('verde rosso'); if (!rCade) motivi.push('il rosso NON cade');
if (motivi.length) { console.log('❌ musica-316 — ' + motivi.join(' · ')); process.exit(1); }
console.log('✅ musica-316 verde (e il rosso __CPM_NO_G316 cade: la serata torna al brano della 7.999.200)');
