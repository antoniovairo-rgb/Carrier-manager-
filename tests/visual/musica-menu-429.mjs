#!/usr/bin/env node
/* [giro 429 · PO-692] GUARDIANO NON-gate musica-menu-429 — i tre candidati per la musica del menu (il PO li ascolta prima di scegliere)
   A. STATICO (dal repo)
      1. registro LICENZE.json, sezione «altri»: per A/B/C le righe .ogg e .mp3 con cc0, licenza CC0, pagina OpenGameArt, autore,
         data di lettura, sha256 dell'originale e generatore tools/audio-429/prepara-429.py;
      2. i due file esistono col peso del registro; la copia d'ascolto docs/collaudo-po/429-brano-X.mp3 e' identica all'mp3 del gioco.
   B. MISURE SUI FILE DECODIFICATI DAL BROWSER (OfflineAudioContext a 48 kHz, gli stessi byte che scarica il telefono), ogg e mp3:
      3. durata >= 45 s e uguale a quella del registro (±0,06 s); 4. LUFS integrati (BS.1770, pesatura K, porte -70/-10) a -19 ±1;
      5. picco <= -1,5 dBFS; 6. loop senza scatto: salto fine→inizio <= 99° percentile dei passi fra campioni vicini del brano, e
         niente silenzio in testa o in coda oltre 5 ms (un buco nel giro).
   C. NEL GIOCO, sul sito servito come su GitHub Pages (dist-web, audio vero, niente ?cpmtest)
      [giro 430: il PO ha scelto A, l'interruttore di prova cpm-menu429 e' stato TOLTO]
      7. con il vecchio localStorage cpm-menu429 = B o C la scelta e' ignorata: il menu suona A;
      8. senza nulla: music.home e' A e nella home SUONA A (testimone __CPM_MENU429S).
   Bracci: VERDE deve passare; ROSSO (`__CPM_NO_G430`, la 7.999.217) deve CADERE (spiaggia-loop caricata, menu muto).
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
const NOMI = { A: 'music/menu/429-a-orchestra', B: 'music/menu/429-b-elettronica', C: 'music/menu/429-c-stadio' };
const DEFAULT = 'music/menu/spiaggia-loop';
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

/* ---------------- A. statico ---------------- */
const st = []; const ok = (nome, cond, info) => st.push({ nome, ok: !!cond, info });
for (const [L, n] of Object.entries(NOMI)) {
  const righe = ['ogg', 'mp3'].map(e => REG.altri && REG.altri[`${n}.${e}`]);
  const v = righe[0];
  ok(`1${L} registro: CC0, fonte completa, generatore`, righe.every(r => r && r.cc0 === true && r.candidato === L && /CC0/.test(r.sorgente.licenza)
    && /^https:\/\/opengameart\.org\/content\//.test(r.sorgente.pagina) && r.sorgente.autore && /^\d{4}-\d\d-\d\d$/.test(r.sorgente.letta)
    && /^[0-9a-f]{64}$/.test(r.sorgente.sha256) && r.generatore === 'tools/audio-429/prepara-429.py' && r.loop === true),
    v ? `${v.titolo} · ${v.sorgente.autore} · ${v.sorgente.pagina} · letta ${v.sorgente.letta}` : 'righe assenti');
  const f = ['ogg', 'mp3'].map(e => { const p = path.join(ROOT, 'assets/audio', `${n}.${e}`); return fs.existsSync(p) && v && v.byte[e] === fs.statSync(p).size; });
  const cp = path.join(ROOT, `docs/collaudo-po/429-brano-${L}.mp3`), mp = path.join(ROOT, 'assets/audio', `${n}.mp3`);
  ok(`2${L} file col peso del registro e copia d'ascolto identica`, f.every(Boolean) && fs.existsSync(cp) && fs.existsSync(mp) && sha(cp) === sha(mp),
    v ? `ogg ${(v.byte.ogg / 1024).toFixed(0)} KB · mp3 ${(v.byte.mp3 / 1024).toFixed(0)} KB · copia ${fs.existsSync(cp)}` : '');
}

/* ---------------- server del sito ---------------- */
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

/* ---------------- B. misure sui file decodificati ---------------- */
const misure = [];
{
  const b = await launchBrowser(); const p = await (await b.newContext()).newPage();
  await p.goto(URLG, { waitUntil: 'commit', timeout: 30000 }).catch(() => {});
  for (const [L, n] of Object.entries(NOMI)) for (const e of ['ogg', 'mp3']) {
    const url = `${URLG}assets/audio/${n}.${e}`; const reg = REG.altri && REG.altri[`${n}.${e}`];
    const m = await p.evaluate(async (url) => {
      const r = await fetch(url); if (!r.ok) return { err: 'http ' + r.status };
      const buf = await new OfflineAudioContext(2, 1, 48000).decodeAudioData(await r.arrayBuffer());
      const SR = buf.sampleRate, N = buf.length, C = buf.numberOfChannels, ch = []; for (let c = 0; c < C; c++) ch.push(buf.getChannelData(c));
      let pk = 0; for (const d of ch) for (let i = 0; i < N; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; }
      // passi fra campioni vicini (massimo sui canali), 99° percentile per istogramma
      const H = new Uint32Array(4096), top = 0.5; let saltoGiunto = 0;
      for (let i = 1; i < N; i++) { let s = 0; for (const d of ch) { const v = Math.abs(d[i] - d[i - 1]); if (v > s) s = v; } H[Math.min(4095, Math.floor(s / top * 4096))]++; }
      for (const d of ch) saltoGiunto = Math.max(saltoGiunto, Math.abs(d[0] - d[N - 1]));
      let acc = 0, p99 = top; for (let k = 0; k < 4096; k++) { acc += H[k]; if (acc >= 0.99 * (N - 1)) { p99 = (k + 1) / 4096 * top; break; } }
      const muto = (i) => ch.every(d => Math.abs(d[i]) < 1e-4); let testa = 0; while (testa < N && muto(testa)) testa++; let coda = 0; while (coda < N && muto(N - 1 - coda)) coda++;
      // LUFS integrati (ITU-R BS.1770-4): pesatura K a 48 kHz, blocchi 400 ms con passo 100 ms, porta assoluta -70, relativa -10
      const K = (d) => { const y = new Float64Array(N); let x1 = 0, x2 = 0, y1 = 0, y2 = 0, z1 = 0, z2 = 0, w1 = 0, w2 = 0;
        for (let i = 0; i < N; i++) { const x = d[i];
          const a = 1.53512485958697 * x - 2.69169618940638 * x1 + 1.19839281085285 * x2 + 1.69065929318241 * y1 - 0.73248077421585 * y2; x2 = x1; x1 = x; y2 = y1; y1 = a;
          const b = a - 2 * z1 + z2 + 1.99004745483398 * w1 - 0.99007225036621 * w2; z2 = z1; z1 = a; w2 = w1; w1 = b; y[i] = b; } return y; };
      const kw = ch.map(K), B = Math.round(0.4 * SR), P = Math.round(0.1 * SR), blk = [];
      for (let s = 0; s + B <= N; s += P) { let z = 0; for (const y of kw) { let q = 0; for (let i = s; i < s + B; i++) q += y[i] * y[i]; z += q / B; } blk.push(z); }
      const L = (z) => -0.691 + 10 * Math.log10(z); const g1 = blk.filter(z => L(z) > -70); const m1 = g1.reduce((a, b) => a + b, 0) / g1.length;
      const g2 = g1.filter(z => L(z) > L(m1) - 10); const lufs = L(g2.reduce((a, b) => a + b, 0) / g2.length);
      return { durata: N / SR, lufs, picco: 20 * Math.log10(pk + 1e-12), salto: saltoGiunto, p99, testaMs: testa / SR * 1000, codaMs: coda / SR * 1000 };
    }, url).catch(x => ({ err: String(x).slice(0, 120) }));
    misure.push({ L, e, m, reg });
  }
  await b.close();
}
for (const { L, e, m, reg } of misure) {
  const g = !m.err; const f = (x, d = 2) => (g ? x.toFixed(d) : '—');
  ok(`3${L}.${e} durata >= 45 s e = registro`, g && reg && m.durata >= 45 && Math.abs(m.durata - reg.durata_s) <= 0.06, g ? `${f(m.durata, 3)} s (registro ${reg && reg.durata_s})` : m.err);
  ok(`4${L}.${e} LUFS -19 ±1`, g && Math.abs(m.lufs + 19) <= 1, g ? `${f(m.lufs, 1)} LUFS` : m.err);
  ok(`5${L}.${e} picco <= -1,5 dBFS`, g && m.picco <= -1.5, g ? `${f(m.picco, 1)} dBFS` : m.err);
  ok(`6${L}.${e} loop senza scatto`, g && m.salto <= m.p99 && m.testaMs <= 5 && m.codaMs <= 5, g ? `salto ${f(m.salto, 4)} ≤ p99 ${f(m.p99, 4)} · silenzio testa ${f(m.testaMs, 1)} ms · coda ${f(m.codaMs, 1)} ms` : m.err);
}

/* ---------------- C. nel gioco ---------------- */
async function gioco(scelta, rosso) {
  const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(([s, r]) => { try { if (s) localStorage.setItem('cpm-menu429', s); } catch (_e) {} if (r) window.__CPM_NO_G430 = true; }, [scelta, rosso]);
  const errs = []; const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.goto(URLG, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  const monta = await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);
  await p.mouse.click(206, 40).catch(() => {});
  const S = () => p.evaluate(() => (typeof window.__CPM_MENU429S === 'function' ? window.__CPM_MENU429S() : null)).catch(() => null);
  let s = null; const t0 = Date.now();
  while (monta && Date.now() - t0 < 30000) { s = await S(); if (s && s.caricato) break; await sleep(500); }
  let naturale = s && s.suona;
  if (monta && s && s.caricato && !s.suona) { await p.evaluate(() => { try { AudioMgr.scene('home'); } catch (_e) {} }).catch(() => {}); await sleep(400); s = await S(); }
  await b.close(); return { monta, s, naturale: naturale || null, errs };
}
async function braccio(rosso) {
  const passi = []; const want = NOMI.A, reg = REG.altri[`${want}.ogg`];
  for (const L of rosso ? [null] : ['B', 'C', null]) {
    const r = await gioco(L, rosso);
    passi.push({ nome: L ? `7${L} il vecchio cpm-menu429=${L} e' ignorato: il menu suona A` : '8 senza nulla il menu suona A',
      ok: r.monta && r.s && r.s.g430 === true && r.s.file === want && r.s.caricato && r.s.suona === want && r.naturale === want && reg && Math.abs(r.s.durata - reg.durata_s) <= 0.06 && r.errs.length === 0,
      info: r.s ? `g430 ${r.s.g430} · file ${r.s.file} · durata ${r.s.durata} · suona ${r.s.suona} (da solo: ${r.naturale}) · errori ${r.errs.length}` : `monta=${r.monta} · sonda assente` });
  }
  return passi;
}
const V = await braccio(false), R = await braccio(true); srv.close();
fs.mkdirSync(path.join(QUI, 'out'), { recursive: true });
fs.writeFileSync(path.join(QUI, 'out/musica-menu-429.json'), JSON.stringify({ statico: st, misure, verde: V, rosso: R }, null, 1));
const stampa = (t, L) => { console.log(t); for (const x of L) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`); };
stampa('STATICO E MISURE', st); stampa('VERDE', V); stampa('ROSSO (__CPM_NO_G430)', R);
const sOk = st.every(x => x.ok), vOk = V.every(x => x.ok), rCade = R.some(x => /^8/.test(x.nome) && !x.ok);
const motivi = []; if (!sOk) motivi.push('statico/misure rosso'); if (!vOk) motivi.push('verde rosso'); if (!rCade) motivi.push('il rosso NON cade');
if (motivi.length) { console.log('❌ musica-menu-429 — ' + motivi.join(' · ')); process.exit(1); }
console.log('✅ musica-menu-429 verde (e il rosso __CPM_NO_G430 cade: la 7.999.217 lascia il menu senza A)');
