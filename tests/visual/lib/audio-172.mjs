/* [giro 172 · PO-369/370] Strumenti condivisi delle misure audio del giro 172 (sonda misura-172.mjs, guardiano audio-172.mjs,
   pagina d'ascolto ascolto-172.mjs). Niente qui dentro giudica: misura e basta.
   - sito(): serve dist-web come GitHub Pages (audio vero, niente ?cpmtest);
   - HOOK: ogni connect() verso ctx.destination va anche a un MediaStreamDestination → si registra l'USCITA del master;
   - registra(page, codice, ms): suona `codice` nella pagina e torna il webm registrato;
   - loud(file): picco · RMS · LUFS integrati · loudness MOMENTANEA (finestre 400 ms, EBU) mediana e massima, da ffmpeg ebur128;
   - flussoPartita(): gioca una partita VERA seedata (?cpmtest, autoplay) e registra ogni evento che arriva ad AudioMgr.event
     (AudioMgr e' muto sotto ?cpmtest, ma il flusso degli eventi e' quello della partita). */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { launchBrowser, startServer, installCdnRoutes, openMatch, sleep, ROOT } from './harness.mjs';
export { sleep, ROOT };
export const DIST = path.resolve(process.env.CPM_DIST || path.join(ROOT, 'dist-web'));
const BASE = '/Carrier-manager-/';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.css': 'text/css', '.svg': 'image/svg+xml' };
export function sito() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error(`manca ${DIST}/index.html (node tools/build-dist.mjs --web)`);
  const srv = http.createServer((q, r) => {
    let u = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
    u = u.slice(BASE.length) || 'index.html'; if (u.endsWith('/')) u += 'index.html';
    const f = path.join(DIST, u); if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Content-Length': fs.statSync(f).size }); fs.createReadStream(f).pipe(r);
  }).listen(0);
  return { srv, url: `http://localhost:${srv.address().port}${BASE}` };
}
export const HOOK = () => {
  const P = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (t, ...a) {
    const r = P.call(this, t, ...a);
    try { if (t && t === this.context.destination) { const c = this.context; if (!c.__rec) c.__rec = c.createMediaStreamDestination(); P.call(this, c.__rec); window.__REC_CTX = c; } } catch (_e) {}
    return r;
  };
};
/* apre il sito, primo gesto, aspetta che i file siano decodificati. rosso: imposta __CPM_NO_G172 prima del caricamento */
export async function apriSito(url, { rosso = false, viewport = { width: 412, height: 915 }, mobile = true, extra = null } = {}) {
  const b = await launchBrowser();
  const ctx = await b.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(HOOK);
  if (rosso) await ctx.addInitScript(() => { window.__CPM_NO_G172 = true; });
  if (extra) await ctx.addInitScript(extra);
  const errs = []; const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  const monta = await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);
  await p.mouse.click(206, 40).catch(() => {});
  const t0 = Date.now(); let s = null;
  while (monta && Date.now() - t0 < 30000) {
    s = await p.evaluate(() => (typeof window.__CPM_AUDIO149 === 'function' ? window.__CPM_AUDIO149() : null)).catch(() => null);
    if (s && Object.values(s.eventi).every(e => e.file.every(f => f.caricato))) break;
    await sleep(500);
  }
  await sleep(800);
  return { b, ctx, p, errs, monta, s };
}
/* registra l'uscita mentre gira `codice` (stringa eseguita nella pagina); prima toglie musica e ambiente */
export async function registra(p, codice, ms, { pulisci = true, dopo = null } = {}) {
  const b64 = await p.evaluate(async ({ codice, ms, pulisci, dopo }) => {
    if (pulisci) { try { AudioMgr.ceremony(null); AudioMgr.hushMatch(); AudioMgr.scene('loading'); } catch (_e) {} await new Promise(r => setTimeout(r, 1800)); }
    const c = window.__REC_CTX; const rec = new MediaRecorder(c.__rec.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 128000 }); const parti = [];
    rec.ondataavailable = e => parti.push(e.data); const fine = new Promise(r => { rec.onstop = r; });
    rec.start(); await new Promise(r => setTimeout(r, 150)); (0, eval)(codice); await new Promise(r => setTimeout(r, ms)); rec.stop(); await fine;
    if (dopo) { try { (0, eval)(dopo); } catch (_e) {} }
    const buf = await new Blob(parti).arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s);
  }, { codice, ms, pulisci, dopo });
  return Buffer.from(b64, 'base64');
}
export function aMp3(webm, mp3) { const w = mp3.replace(/\.mp3$/, '.webm'); fs.writeFileSync(w, webm); execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', w, '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k', mp3]); fs.unlinkSync(w); return mp3; }
/* misura: taglia(s) = salta i primi secondi (assestamento) */
export function loud(file, { salta = 0 } = {}) {
  const args = ['-hide_banner', '-nostats', ...(salta ? ['-ss', String(salta)] : []), '-i', file, '-af', 'ebur128=framelog=info,astats=measure_overall=Peak_level+RMS_level:measure_perchannel=none', '-f', 'null', '-'];
  const e = spawnSync('ffmpeg', args).stderr.toString();
  const M = [...e.matchAll(/\bM:\s*(-?[\d.]+|-inf)/g)].map(m => +m[1]).filter(v => isFinite(v) && v > -69);
  const n = x => (x == null || x === '-inf' || isNaN(+x)) ? null : +x;
  const I = (e.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop();
  const srt = [...M].sort((a, b) => a - b);
  return { picco_db: n((e.match(/Peak level dB: (-?[\d.]+|-inf)/) || [])[1]), rms_db: n((e.match(/RMS level dB: (-?[\d.]+|-inf)/) || [])[1]),
    lufs: I ? +I.match(/(-?[\d.]+)/)[1] : null, m_mediana: srt.length ? +srt[srt.length >> 1].toFixed(1) : null, m_max: srt.length ? +srt[srt.length - 1].toFixed(1) : null, finestre: M.length };
}
/* 100 tocchi di NAVIGAZIONE: pointerdown (non click: niente cambi di schermata) su elementi cliccabili della schermata, a giro.
   Conta ogni AudioMgr.play() che parte, per nome. */
export async function tocchi(p, n = 100) {
  return p.evaluate(async (n) => {
    /* [giro 172] si conta dal contatore del GIOCO (__CPM_AUDIO149().plays, file partiti), non avvolgendo AudioMgr.play: dal giro 172 il
       listener passa da AudioMgr.tocco(), che chiama play() dall'interno e scavalca l'involucro — misurato: 0 suoni anche nel rosso,
       dove ne partono 100. Si contano i nomi CHIAMATI (gli alias «…172» registrano anche il nome di partenza). */
    const pl = () => (window.__CPM_AUDIO149 ? window.__CPM_AUDIO149().plays : {}); const p0 = pl(); const conta = {};
    const tutti = [...document.querySelectorAll('button,[role="button"],a[href],label')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
    /* NAVIGAZIONE = elementi non marcati data-suono (i marcati sono le conferme importanti e le finestre principali: suonano di proposito) */
    const el = tutti.filter(e => !e.closest('[data-suono]')); const marcati = tutti.length - el.length;
    for (let i = 0; i < n && el.length; i++) { const e = el[i % el.length]; e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch' })); await new Promise(r => setTimeout(r, 25)); }
    await new Promise(r => setTimeout(r, 200)); const p1 = pl();
    for (const k of Object.keys(p1)) if (!/172$/.test(k) && (p1[k] | 0) > (p0[k] | 0)) conta[k] = (p1[k] | 0) - (p0[k] | 0);
    return { elementi: el.length, marcati, tocchi: n, suoni: conta, sonda: !!window.__CPM_AUDIO149 };
  }, n);
}
/* una partita VERA seedata: registra il flusso degli eventi verso AudioMgr (tipo + campi che l'AudioMgr legge) */
export async function flussoPartita({ seme = 7300, nome = 'Pv', extra = null } = {}) {
  const s = await startServer(); const port = s.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  if (extra) await page.addInitScript(extra);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  let flusso = [], finita = false, score = null;
  try {
    await openMatch(page, port, { skipLoadAll: true, name: nome });
    await page.evaluate(() => { window.__A172EV = []; const E0 = AudioMgr.event; AudioMgr.event = function (e) { try { window.__A172EV.push({ type: e && e.type, outKind: e && e.outKind, hlType: e && e.hlType, cue: e && e.cue, ms: Math.round(performance.now()) }); } catch (_e) {} return E0.call(this, e); };
      const G0 = window.golSubito161; });
    await page.evaluate((s2) => window.__CPM_AUTOPLAY(true, { seed: s2, policy: 'seeded', tickMs: 300 }), seme);
    for (let k = 0; k < 30 && !finita; k++) finita = await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ended', null, { timeout: 20000, polling: 500 }).then(() => true).catch(() => false);
    flusso = await page.evaluate(() => window.__A172EV || []);
    score = await page.evaluate(() => { const x = window.__CPM_SCORE && window.__CPM_SCORE(); return x ? { h: x.home | 0, a: x.away | 0 } : null; });
  } catch (e) { errs.push('flusso: ' + String(e.message).slice(0, 100)); }
  await b.close(); s.close();
  return { flusso, finita, score, errs };
}
