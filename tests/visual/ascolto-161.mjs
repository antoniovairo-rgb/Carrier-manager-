#!/usr/bin/env node
/* [giro 161, da ascolto-149] REGISTRA i suoni del giro 161 per docs/sviluppo/giro161/ascolto.html (prima = rosso __CPM_NO_G161 = audio
   del giro 149: gol subito muto, «ohh» sintetico, cerimonie senza musica).
   [giro 149 · PO-351] REGISTRA la pagina d'ascolto docs/sviluppo/giro149/ascolto.html: ogni evento sonoro suonato DAL GIOCO VERO,
   prima (rosso __CPM_NO_G149 = audio di oggi, sintesi + boato Mixkit) e dopo (file CC0), con gli stessi volumi di categoria del gioco.
   Come: un init-script aggancia ogni connect() verso ctx.destination anche a un MediaStreamDestination e un MediaRecorder registra
   l'evento; i webm si convertono in MP3 (si aprono anche su Safari). Uso: node tools/build-dist.mjs --web && node ascolto-161.mjs */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchBrowser, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(QUI, '../..');
const DIST = path.join(ROOT, 'dist-web');
const OUT = path.join(ROOT, 'docs/sviluppo/giro161');
const BASE = '/Carrier-manager-/';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
  u = u.slice(BASE.length) || 'index.html'; const f = path.join(DIST, u);
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const URLG = `http://localhost:${srv.address().port}${BASE}`;
/* [id, etichetta, gruppo, come si suona (codice eseguito nella pagina), durata della registrazione ms] */
export const EVENTI = [
  ['gol-subito', 'Gol subito: fischi della curva', 'Partita', "golSubito161('ascolto')", 2600],
  ['palo', 'Palo: legno + «ohh»', 'Partita', "AudioMgr.event({type:'CoherenceCheck',outKind:'post'})", 4200],
  ['fuori', 'Tiro fuori: «ohh»', 'Partita', "AudioMgr.event({type:'CoherenceCheck',outKind:'wide'})", 4200],
  ['angolo', 'Calcio d\'angolo: fischio + «ohh»', 'Partita', "AudioMgr.event({type:'CoherenceCheck',outKind:'corner'})", 4200],
  ['premiazioni', 'Premiazioni (primi 15 s)', 'Cerimonie', "AudioMgr.ceremony('premiazioni')", 15000],
  ['presentazione', 'Presentazione / fine stagione (primi 15 s)', 'Cerimonie', "AudioMgr.ceremony('presentazione')", 15000],
];
const HOOK = () => {
  const P = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (t, ...a) {
    const r = P.call(this, t, ...a);
    try { if (t && t === this.context.destination) { const c = this.context; if (!c.__rec) c.__rec = c.createMediaStreamDestination(); P.call(this, c.__rec); window.__REC_CTX = c; } } catch (_e) {}
    return r;
  };
};
async function braccio(rosso) {
  const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript(HOOK);
  if (rosso) await ctx.addInitScript(() => { window.__CPM_NO_G161 = true; });
  const p = await ctx.newPage();
  await p.goto(URLG, { waitUntil: 'load' }); await p.waitForFunction(() => document.getElementById('root')?.children.length > 0);
  await p.mouse.click(206, 40); await sleep(6000);
  const dir = path.join(OUT, rosso ? 'prima' : 'dopo'); fs.mkdirSync(dir, { recursive: true });
  for (const [id, , , codice, ms] of EVENTI) {
    const b64 = await p.evaluate(async ({ codice, ms }) => {
      try { AudioMgr.scene('loading'); } catch (_e) {} /* silenzio fra un evento e l'altro (musica e ambiente spenti) */
      await new Promise(r => setTimeout(r, 900));
      const c = window.__REC_CTX; const rec = new MediaRecorder(c.__rec.stream, { mimeType: 'audio/webm;codecs=opus' }); const parti = [];
      rec.ondataavailable = e => parti.push(e.data); const fine = new Promise(r => { rec.onstop = r; });
      rec.start(); await new Promise(r => setTimeout(r, 120)); (0, eval)(codice); await new Promise(r => setTimeout(r, ms)); rec.stop(); await fine;
      try { AudioMgr.ceremony(null); AudioMgr.scene('loading'); } catch (_e) {}
      const buf = await new Blob(parti).arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s);
    }, { codice, ms });
    const w = path.join(dir, id + '.webm'); fs.writeFileSync(w, Buffer.from(b64, 'base64'));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', w, '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '96k', path.join(dir, id + '.mp3')]); fs.unlinkSync(w);
    const m = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(dir, id + '.mp3'), '-af', 'silenceremove=start_periods=1:start_threshold=-60dB:stop_periods=-1:stop_threshold=-60dB,astats=measure_overall=Peak_level+RMS_level:measure_perchannel=none,ebur128', '-f', 'null', '-']).stderr.toString();
    const _n = x => (x == null || x === '-inf' || isNaN(+x)) ? null : +x; /* [giro 161] «prima» puo' essere SILENZIO (gol subito muto): misura nulla, non NaN */
    const pk = _n((m.match(/Peak level dB: (-?[\d.]+|-inf)/) || [])[1]), rms = _n((m.match(/RMS level dB: (-?[\d.]+|-inf)/) || [])[1]);
    const I = (m.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop(); const lufs = I ? +I.match(/(-?[\d.]+)/)[1] : null;
    const dur = +(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, id + '.mp3')]).stdout.toString());
    MIS[id] = MIS[id] || {}; MIS[id][rosso ? 'prima' : 'dopo'] = { picco_db: pk, rms_db: rms, lufs, durata_s: +dur.toFixed(2) };
    console.log(`${rosso ? 'prima' : 'dopo '} ${id.padEnd(16)} picco ${pk} dB · RMS ${rms} dB · ${lufs} LUFS`);
  }
  await b.close();
}
const MIS = {};
await braccio(true);
await braccio(false);
srv.close();
fs.writeFileSync(path.join(OUT, 'misure.json'), JSON.stringify({ _nota: 'misure delle registrazioni (silenzi di testa/coda tolti): picco/RMS dBFS, LUFS integrati', eventi: EVENTI.map(([id, nome, gruppo]) => ({ id, nome, gruppo, ...MIS[id] })) }, null, 1));
