#!/usr/bin/env node
/* [giro 149 · PO-351] GUARDIANO dell'audio CC0 — `npm run audio-149` (costruisce dist-web, poi due bracci).
   A. STATICO (dal repo):
      1. ogni file audio in assets/audio ha la sua riga nel registro assets/audio/LICENZE.json, e ogni riga del registro ha il suo file;
      2. ogni file prodotto dal giro 149 dichiara CC0, con pagina, autore, data di lettura e hash della sorgente;
      3. peso dei file nuovi (ogg+mp3) sotto il tetto CPM_TETTO_MB (default 6);
      4. livelli: sostenuti a -18 LUFS ±1,5 (o picco al tetto -1,5 dBFS se impulsivi), impatti a picco -3 dBFS ±0,5;
      5. la tabella F149 nel gioco e la precarica AUDIO149 di sw.js coincidono col registro.
   B. NEL BROWSER, sul sito servito come su GitHub Pages (dist-web):
      6. PRIMA APERTURA: dopo il primo gesto TUTTI i file del registro sono decodificati dal gioco (`__CPM_AUDIO149`), con livello in
         uscita (buffer x g) entro la fascia [-40, -1] dBFS di picco; ogni evento del catalogo, suonato, parte DA FILE;
      7. SECONDA APERTURA SENZA RETE: di nuovo tutti decodificati (dalla cache del service worker).
   Bracci: VERDE (gioco normale) deve passare; ROSSO (`__CPM_NO_G149` = audio di oggi) deve CADERE sulla 6. Si stampano per ultimi.
   «Non giudicato» (sonda assente, zero file, pagina che non monta) = rosso. */
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
const DIST = path.resolve(process.env.CPM_DIST || path.join(ROOT, 'dist-web'));
const TETTO = +(process.env.CPM_TETTO_MB || 6);
const AUD = path.join(ROOT, 'assets/audio');
const REG = JSON.parse(fs.readFileSync(path.join(AUD, 'LICENZE.json'), 'utf8'));

/* ---------------- A. statico ---------------- */
const st = [];
const ok = (nome, cond, info) => st.push({ nome, ok: !!cond, info });
const tutti = []; (function giu(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) giu(p); else if (/\.(ogg|mp3|wav|m4a|opus|flac)$/i.test(e.name)) tutti.push(path.relative(AUD, p).split(path.sep).join('/')); } })(AUD);
const righe = new Set(Object.keys(REG.altri || {}));
for (const n of Object.keys(REG.file)) for (const f of REG.file[n].formati) righe.add(`${n}.${f}`);
const senza = tutti.filter(f => !righe.has(f)), fantasmi = [...righe].filter(f => !tutti.includes(f));
ok('1 ogni file ha la riga di licenza', senza.length === 0 && fantasmi.length === 0 && tutti.length > 0, `${tutti.length} file · senza riga ${JSON.stringify(senza)} · righe senza file ${JSON.stringify(fantasmi)}`);
const nonCC0 = Object.entries(REG.file).filter(([, v]) => !/CC0/.test(v.sorgente.licenza) || !v.sorgente.pagina || !v.sorgente.autore || !v.sorgente.letta || !/^[0-9a-f]{64}$/.test(v.sorgente.sha256)).map(([n]) => n);
const altriNonCC0 = Object.entries(REG.altri || {}).filter(([, v]) => !v.cc0).map(([n]) => n);
ok('2 file del giro 149 tutti CC0 con fonte completa', nonCC0.length === 0, `${Object.keys(REG.file).length} file CC0 · incompleti ${JSON.stringify(nonCC0)} · fuori dal giro e NON CC0 (dichiarati): ${JSON.stringify(altriNonCC0)}`);
const byte = Object.values(REG.file).reduce((s, v) => s + Object.values(v.byte).reduce((a, b) => a + b, 0), 0);
const byteVeri = Object.keys(REG.file).reduce((s, n) => s + REG.file[n].formati.reduce((a, f) => a + fs.statSync(path.join(AUD, `${n}.${f}`)).size, 0), 0);
ok(`3 peso dei file nuovi sotto ${TETTO} MB`, byteVeri < TETTO * 1048576 && byteVeri === byte, `${(byteVeri / 1048576).toFixed(2)} MB su disco (registro ${(byte / 1048576).toFixed(2)} MB)`);
const fuori = Object.entries(REG.file).filter(([n, v]) => {
  if (v.durata_s >= 1 || /^(music|crowd|ref|career|season|gala)\./.test(v.evento)) return !((v.lufs != null && Math.abs(v.lufs + 18) <= 1.5) || Math.abs(v.picco_dbfs + 1.5) <= 0.3);
  return Math.abs(v.picco_dbfs + 3) > 0.5;
}).map(([n, v]) => `${n} (LUFS ${v.lufs}, picco ${v.picco_dbfs})`);
ok('4 livelli normalizzati entro la fascia', fuori.length === 0, `fuori fascia: ${JSON.stringify(fuori)}`);
const src09 = fs.readFileSync(path.join(ROOT, 'src/09-audio-scout-anagrafiche.jsx'), 'utf8');
const mF = src09.match(/const F149=(\{.*?\});\n/);
let F149 = null; try { F149 = mF && Function('return ' + mF[1])(); } catch (_e) { F149 = null; }
const attese = {}; for (const [n, v] of Object.entries(REG.file)) (attese[v.evento] = attese[v.evento] || { g: v.g, f: [] }).f.push(n);
const swTxt = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'); const mS = swTxt.match(/const AUDIO149 = \[(.*?)\];/);
const swL = mS ? [...mS[1].matchAll(/'\.\/assets\/audio\/([^']+)\.ogg'/g)].map(x => x[1]).sort() : [];
ok('5 tabella del gioco e precarica di sw.js = registro', !!F149 && JSON.stringify(F149) === JSON.stringify(attese) && JSON.stringify(swL) === JSON.stringify(Object.keys(REG.file).sort()), `F149 ${F149 ? Object.keys(F149).length + ' eventi' : 'ASSENTE'} · sw.js ${swL.length} ogg`);

/* ---------------- B. browser ---------------- */
if (!process.env.CPM_NO_BUILD) execFileSync('node', [path.join(ROOT, 'tools/build-dist.mjs'), '--web'], { stdio: 'ignore' });
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error(`manca ${DIST}/index.html`); process.exit(2); }
const BASE = '/Carrier-manager-/';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
  u = u.slice(BASE.length) || 'index.html'; if (u.endsWith('/')) u += 'index.html';
  const f = path.join(DIST, u); if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Content-Length': fs.statSync(f).size }); fs.createReadStream(f).pipe(r);
}).listen(0);
const URLG = `http://localhost:${srv.address().port}${BASE}`;
const NFILE = Object.keys(REG.file).length;

const SFXK = Object.keys(attese).filter(k => !k.startsWith('music.') && k !== 'career.trophy');
async function apri(page) {
  await page.goto(URLG, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  return page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);
}
async function misura(page) {
  await page.mouse.click(206, 40).catch(() => {}); /* il primo gesto: sblocca l'AudioContext e avvia i download */
  const t0 = Date.now(); let s = null;
  while (Date.now() - t0 < 30000) {
    s = await page.evaluate(() => (typeof window.__CPM_AUDIO149 === 'function' ? window.__CPM_AUDIO149() : null)).catch(() => null);
    if (s && Object.values(s.eventi).every(e => e.file.every(f => f.caricato))) break;
    await sleep(500);
  }
  return s;
}
async function braccio(rosso) {
  const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (rosso) await ctx.addInitScript(() => { window.__CPM_NO_G149 = true; });
  const errs = []; const esito = { rosso, passi: [] };
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  const monta = await apri(p); const s1 = monta ? await misura(p) : null;
  const car = s1 ? Object.values(s1.eventi).reduce((a, e) => a + e.file.filter(f => f.caricato).length, 0) : 0;
  const lv = s1 ? Object.entries(s1.eventi).flatMap(([k, e]) => e.file.filter(f => f.caricato && !(f.picco_db <= -1 && f.picco_db >= -40)).map(f => `${f.n} ${f.picco_db}`)) : [];
  /* ogni evento del catalogo, suonato: deve partire da FILE (contatore della sonda) */
  let daFile = [], nonDaFile = [];
  if (s1) {
    const r = await p.evaluate((keys) => { const out = {}; for (const k of keys) { const a = (window.__CPM_AUDIO149().plays[k] | 0); try { AudioMgr.play(k); } catch (_e) {} out[k] = (window.__CPM_AUDIO149().plays[k] | 0) - a; } return out; }, SFXK).catch(() => ({}));
    for (const k of SFXK) (r[k] > 0 ? daFile : nonDaFile).push(k);
    /* trofeo: passa da fanfare() e porta con se' gli applausi veri */
    const tr = await p.evaluate(() => { const P = () => window.__CPM_AUDIO149().plays; const a = P(); try { AudioMgr.play('career.trophy'); } catch (_e) {} const b = P(); return ((b['career.trophy'] | 0) - (a['career.trophy'] | 0)) > 0 && ((b['crowd.applause'] | 0) - (a['crowd.applause'] | 0)) > 0; }).catch(() => false);
    (tr ? daFile : nonDaFile).push('career.trophy(+applausi)');
    /* musica: suona solo dove la decisione PO del 23/09 la lascia (fuori partita e' spenta; __CPM_NO_MUSICA23 la riaccende) */
    const mu = await p.evaluate(() => { const P = () => window.__CPM_AUDIO149().plays; const a = P(); window.__CPM_NO_MUSICA23 = true; try { AudioMgr.scene('home'); AudioMgr.scene('career'); } catch (_e) {} const b = P(); try { delete window.__CPM_NO_MUSICA23; AudioMgr.scene('home'); } catch (_e) {} return ((b['music.home'] | 0) > (a['music.home'] | 0)) && ((b['music.career'] | 0) > (a['music.career'] | 0)); }).catch(() => false);
    (mu ? daFile : nonDaFile).push('music.home+music.career');
  }
  esito.passi.push({ nome: '6 prima apertura: file decodificati, livelli in fascia, eventi da file', ok: monta && !!s1 && s1.on === !rosso && car === NFILE && lv.length === 0 && nonDaFile.length === 0,
    info: `monta=${monta} · sonda=${!!s1} · G149=${s1 && s1.on} · decodificati ${car}/${NFILE} · fuori fascia ${JSON.stringify(lv)} · eventi da file ${daFile.length}/${SFXK.length + 2}${nonDaFile.length ? ' · NON da file: ' + nonDaFile.join(',') : ''}` });
  /* 7. seconda apertura senza rete */
  await sleep(4000); await ctx.setOffline(true);
  const p2 = await ctx.newPage(); p2.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  const monta2 = await apri(p2); const s2 = monta2 ? await misura(p2) : null;
  const car2 = s2 ? Object.values(s2.eventi).reduce((a, e) => a + e.file.filter(f => f.caricato).length, 0) : 0;
  esito.passi.push({ nome: '7 seconda apertura SENZA RETE: file dalla cache del service worker', ok: monta2 && !!s2 && car2 === NFILE, info: `monta=${monta2} · decodificati ${car2}/${NFILE}` });
  esito.passi.push({ nome: '  errori di pagina', ok: errs.length === 0, info: JSON.stringify(errs.slice(0, 3)) });
  await b.close();
  esito.ok = esito.passi.every(x => x.ok);
  return esito;
}
const verde = await braccio(false);
const rosso = await braccio(true);
srv.close();

console.log('A. STATICO');
for (const x of st) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
for (const e of [verde, rosso]) { console.log(e.rosso ? 'B. BROWSER — braccio ROSSO (__CPM_NO_G149: audio di oggi)' : 'B. BROWSER — braccio VERDE'); for (const x of e.passi) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`); }
const statico = st.every(x => x.ok);
console.log(`VERDE: ${statico && verde.ok ? 'PASSA' : 'NON PASSA'}`);
console.log(`ROSSO: ${!rosso.ok ? 'CADE (come deve)' : 'NON CADE — il guardiano e\' cieco'}`);
process.exit(statico && verde.ok && !rosso.ok ? 0 : 1);
