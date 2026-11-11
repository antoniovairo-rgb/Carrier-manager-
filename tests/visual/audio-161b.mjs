#!/usr/bin/env node
/* [giro 161b · PO-351, decisione PO 11/11 «Togliere il file»] GUARDIANO: il boato Mixkit (licenza propria, non CC0) e' fuori dal repo,
   dalle due build e dal gioco, e il rosso __CPM_NO_G149 continua a funzionare senza di lui (boato sintetizzato).
   `npm run audio-161b` (costruisce dist-web e dist, poi giudica).
   A. STATICO
      1. nessun file audio di Mixkit in assets/ (nome «mixkit», o l'hash del file tolto);
      2. nessun riferimento «mixkit» nel gioco (src/, CARRIER-MANAGER-AV.html, sw.js), nel registro assets/audio/LICENZE.json,
         nello script e nelle sorgenti di tools/audio-149/, nei Crediti (docs/governo/CREDITI-fonti.md) e nei README dell'audio;
      3. nessun file Mixkit in dist-web/ e dist/ appena costruite (cartelle che mancano = non giudicato = rosso).
   B. NEL BROWSER (dist-web servita come su GitHub Pages)
      4. VERDE: il gol suona il boato DA FILE (contatore della sonda __CPM_AUDIO149) e nessuna richiesta va verso un file Mixkit;
      5. ROSSO DEL GIRO 149 (__CPM_NO_G149): la pagina monta, il gol suona (collegamenti di nodi audio > 0), il boato e' la SINTESI
         (filtri creati dal gol >= 6: misurati 14 con la sintesi, 1 col campione del commit di prima), nessuna richiesta verso Mixkit,
         zero errori di pagina.
   Braccio ROSSO di questo guardiano: CPM_ROSSO161B=1 giudica la parte statica sull'albero del commit di prima (CPM_BASE161B,
   default 8cddd75 = giro 161, file ancora presente) e DEVE cadere; con CPM_DIST161B=<dist-web costruita da quel commit> giudica anche
   la parte nel browser su quella build (misurato: 1 richiesta Mixkit, 1 filtro, la 5 cade). Le righe dei bracci si stampano per ultime.
   «Non giudicato» (sonda assente, pagina che non monta, build mancante) = rosso. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchBrowser, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(QUI, '../..');
const ROSSO = !!process.env.CPM_ROSSO161B;
const BASEC = process.env.CPM_BASE161B || '8cddd75';
const SHA_TOLTO = 'mixkit-stadium-joy-shouting-crowd-3022';
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
/* lettura dell'albero: quello di lavoro (verde) o quello del commit di prima (rosso) */
const elenco = dir => ROSSO ? git('ls-tree', '-r', '--name-only', BASEC, '--', dir).split('\n').filter(Boolean)
  : git('ls-files', '--', dir).split('\n').filter(Boolean).filter(f => fs.existsSync(path.join(ROOT, f)));
const leggi = f => { try { return ROSSO ? git('show', `${BASEC}:${f}`) : fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { return null; } };
const st = []; const ok = (nome, cond, info) => st.push({ nome, ok: !!cond, info });

/* ---------------- A. statico ---------------- */
const inAssets = elenco('assets').filter(f => /mixkit/i.test(f) || f.includes(SHA_TOLTO));
ok('1 nessun file Mixkit in assets/', inAssets.length === 0, `${inAssets.length} file ${JSON.stringify(inAssets)}`);
const DOVE = [...elenco('src'), 'CARRIER-MANAGER-AV.html', 'sw.js', 'assets/audio/LICENZE.json', 'assets/audio/README.md',
  'assets/audio/sfx/crowd/README.md', ...elenco('tools/audio-149'), 'docs/governo/CREDITI-fonti.md'];
const conRif = []; let letti = 0;
for (const f of DOVE) { const s = leggi(f); if (s == null) continue; letti++; const n = (s.match(/mixkit/gi) || []).length; if (n) conRif.push(`${f}:${n}`); }
ok('2 nessun riferimento «mixkit» in gioco, registro, tools/audio-149, Crediti, README audio', letti >= 8 && conRif.length === 0, `${letti} file letti · con riferimenti ${JSON.stringify(conRif)}`);
if (!ROSSO && !process.env.CPM_NO_BUILD) {
  execFileSync('node', [path.join(ROOT, 'tools/build-dist.mjs'), '--web'], { stdio: 'ignore' });
  execFileSync('node', [path.join(ROOT, 'tools/build-dist.mjs')], { stdio: 'ignore' });
}
const giu = (d, out = []) => { if (!fs.existsSync(d)) return null; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) giu(p, out); else out.push(path.relative(ROOT, p)); } return out; };
if (!ROSSO) {
  for (const d of ['dist-web', 'dist']) {
    const t = giu(path.join(ROOT, d)); const m = t ? t.filter(f => /mixkit/i.test(f)) : null;
    const audio = t ? t.filter(f => /\.(ogg|mp3|wav)$/i.test(f) && f.includes('/audio/')).length : 0;
    ok(`3 nessun file Mixkit in ${d}/`, !!t && t.length > 0 && audio > 0 && m.length === 0, t ? `${t.length} file, ${audio} audio · Mixkit ${JSON.stringify(m)}` : 'cartella assente: NON GIUDICATO');
  }
} else {
  /* lo stato di prima: build-dist copia assets/ intera, quindi il file c'era anche nelle due build */
  ok('3 nessun file Mixkit nelle build (stato di prima: build-dist copia assets/)', inAssets.length === 0, `assets/ di ${BASEC} conteneva ${inAssets.length} file Mixkit`);
}

/* ---------------- B. browser ---------------- */
const B = [];
if (!ROSSO || process.env.CPM_DIST161B) {
  const DIST = path.resolve(process.env.CPM_DIST161B || path.join(ROOT, 'dist-web')); const BASE = '/Carrier-manager-/';
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
  const srv = http.createServer((q, r) => {
    let u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
    if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
    u = u.slice(BASE.length) || 'index.html'; if (u.endsWith('/')) u += 'index.html';
    const f = path.join(DIST, u); if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Content-Length': fs.statSync(f).size }); fs.createReadStream(f).pipe(r);
  }).listen(0);
  const URLG = `http://localhost:${srv.address().port}${BASE}`;
  /* conta filtri creati e collegamenti fra nodi: il gol col boato sintetizzato crea 14 filtri, col campione 1 (misurati 11/11) */
  const HOOK = () => {
    window.__F161B = 0; window.__D161B = 0;
    const CB = BaseAudioContext.prototype.createBiquadFilter; BaseAudioContext.prototype.createBiquadFilter = function (...a) { window.__F161B++; return CB.apply(this, a); };
    const P = AudioNode.prototype.connect; AudioNode.prototype.connect = function (t, ...a) { window.__D161B++; return P.call(this, t, ...a); };/* ogni collegamento: i suoni vanno ai bus di categoria, non all'uscita diretta */
  };
  async function braccio(g149off) {
    const b = await launchBrowser();
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await ctx.addInitScript(HOOK);
    if (g149off) await ctx.addInitScript(() => { window.__CPM_NO_G149 = true; });
    const p = await ctx.newPage(); const errs = [], req = [];
    p.on('pageerror', e => errs.push(String(e.message).slice(0, 120))); p.on('request', q => req.push(q.url()));
    await p.goto(URLG, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    const monta = await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);
    await p.mouse.click(206, 40).catch(() => {});
    /* si aspetta che la sonda dica caricati tutti i file del giro 149 (verde) o che i tentativi del vecchio aggancio siano chiusi (rosso) */
    const t0 = Date.now(); let s = null;
    while (Date.now() - t0 < 30000) {
      s = await p.evaluate(() => (typeof window.__CPM_AUDIO149 === 'function' ? window.__CPM_AUDIO149() : null)).catch(() => null);
      if (s && s.ready && (g149off || Object.values(s.eventi).every(e => e.file.every(f => f.caricato)))) break;
      await sleep(500);
    }
    await sleep(3000);
    const r = s ? await p.evaluate(async () => {
      const a = (window.__CPM_AUDIO149().plays['crowd.roar'] | 0), f0 = window.__F161B, d0 = window.__D161B;
      try { AudioMgr.event({ type: 'GoalHero' }); } catch (_e) {}
      await new Promise(z => setTimeout(z, 400));
      return { daFile: (window.__CPM_AUDIO149().plays['crowd.roar'] | 0) - a, filtri: window.__F161B - f0, uscita: window.__D161B - d0, on: window.__CPM_AUDIO149().on };
    }).catch(() => null) : null;
    await sleep(1500);
    const mk = req.filter(u => /mixkit/i.test(u));
    await b.close();
    return { monta, s: !!s, r, mk, errs, roarReq: req.filter(u => /goal-roar/.test(u)).length };
  }
  const v = await braccio(false);
  B.push({ nome: '4 VERDE: gol col boato da file, nessuna richiesta Mixkit', ok: v.monta && v.s && !!v.r && v.r.on === true && v.r.daFile > 0 && v.mk.length === 0 && v.errs.length === 0,
    info: `monta=${v.monta} · sonda=${v.s} · G149=${v.r && v.r.on} · boato da file ${v.r && v.r.daFile} · richieste Mixkit ${v.mk.length} · errori ${JSON.stringify(v.errs.slice(0, 2))}` });
  const r = await braccio(true);
  B.push({ nome: '5 ROSSO __CPM_NO_G149: il gol suona, boato SINTETIZZATO, nessuna richiesta Mixkit', ok: r.monta && r.s && !!r.r && r.r.on === false && r.r.daFile === 0 && r.r.uscita > 0 && r.r.filtri >= 6 && r.mk.length === 0 && r.errs.length === 0,
    info: `monta=${r.monta} · sonda=${r.s} · G149=${r.r && r.r.on} · boato da file ${r.r && r.r.daFile} · filtri creati dal gol ${r.r && r.r.filtri} · collegamenti ${r.r && r.r.uscita} · richieste goal-roar.* ${r.roarReq} (404 attesi) · richieste Mixkit ${r.mk.length} · errori ${JSON.stringify(r.errs.slice(0, 2))}` });
  srv.close();
}

const tutti = [...st, ...B];
console.log(`\nGIRO 161b — Mixkit fuori dal repo · braccio ${ROSSO ? `ROSSO (albero di ${BASEC})` : 'VERDE (albero di lavoro)'}`);
for (const x of tutti) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
const esito = tutti.length > 0 && tutti.every(x => x.ok);
console.log(esito ? '✅ VERDE' : '❌ ROSSO');
process.exit(esito ? 0 : 1);/* il braccio rosso deve uscire 1 (rosso), come gli altri guardiani */
