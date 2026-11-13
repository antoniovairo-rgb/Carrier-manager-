#!/usr/bin/env node
/* [giro 149 · PO-351] REGISTRA la pagina d'ascolto docs/sviluppo/giro149/ascolto.html: ogni evento sonoro suonato DAL GIOCO VERO,
   prima (rosso __CPM_NO_G149 = audio di prima del giro 149, tutto sintetizzato: dal giro 161b anche il boato) e dopo (file CC0).
   [giro 161b] CPM_SOLO=gol,... riregistra solo quegli eventi, CPM_SOLO_PRIMA=1 solo il braccio «prima»; misure.json si aggiorna
   solo per cio' che si e' registrato (le altre righe restano).
   Come: un init-script aggancia ogni connect() verso ctx.destination anche a un MediaStreamDestination e un MediaRecorder registra
   l'evento; i webm si convertono in MP3 (si aprono anche su Safari). Uso: node tools/build-dist.mjs --web && node ascolto-149.mjs */
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
const OUT = path.join(ROOT, 'docs/sviluppo/giro149');
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
  ['calcio', 'Calcio / tiro', 'Pallone', "AudioMgr.play('ball.kick')", 900],
  ['passaggio', 'Passaggio', 'Pallone', "AudioMgr.play('ball.pass')", 800],
  ['testa', 'Colpo di testa', 'Pallone', "AudioMgr.play('ball.header')", 800],
  ['palo', 'Palo (con la folla)', 'Pallone', "AudioMgr.event({type:'CoherenceCheck',outKind:'post'})", 1900],
  ['parata', 'Parata (con la folla)', 'Pallone', "AudioMgr.event({type:'CoherenceCheck',outKind:'saved'})", 1900],
  ['contrasto', 'Contrasto', 'Pallone', "AudioMgr.play('ball.bounce')", 1300],
  ['gol', 'Gol: rete + boato', 'Pallone', "AudioMgr.event({type:'GoalHero'})", 5000],
  ['fischio', 'Fischietto (fallo)', 'Arbitro', "AudioMgr.play('ref.whistle')", 1500],
  ['fischio-doppio', 'Fischio doppio (fuorigioco)', 'Arbitro', "AudioMgr.play('ref.whistle2')", 1300],
  ['fischio-finale', 'Triplice fischio', 'Arbitro', "AudioMgr.play('ref.whistle_final')", 5600],
  ['fallo', 'Fallo: fischio + fischi della curva', 'Arbitro', "AudioMgr.event({type:'CoherenceCheck',outKind:'foul'})", 2000],
  ['applausi', 'Applausi', 'Folla', "AudioMgr.play('crowd.applause')", 3300],
  ['esulta', 'Esultanza', 'Folla', "AudioMgr.play('crowd.cheer')", 2500],
  ['click', 'Tocco di un pulsante', 'Interfaccia', "AudioMgr.play('ui.click')", 500],
  ['conferma', 'Conferma', 'Interfaccia', "AudioMgr.play('ui.confirm')", 700],
  ['errore', 'Errore', 'Interfaccia', "AudioMgr.play('ui.error')", 600],
  ['popup', 'Finestra che si apre', 'Interfaccia', "AudioMgr.play('ui.popup')", 700],
  ['notifica', 'Notifica positiva', 'Interfaccia', "AudioMgr.play('notify.pos')", 900],
  ['settimana', 'Avanza la settimana', 'Interfaccia', "AudioMgr.play('week.advance')", 900],
  ['contratto', 'Firma del contratto', 'Carriera', "AudioMgr.play('career.contract')", 1700],
  ['convocazione', 'Convocazione', 'Carriera', "AudioMgr.play('career.callup')", 1300],
  ['record', 'Record', 'Carriera', "AudioMgr.play('career.record')", 1400],
  ['retrocessione', 'Retrocessione', 'Carriera', "AudioMgr.play('season.relegation')", 1600],
  ['trofeo', 'Trofeo / promozione (cerimonia)', 'Carriera', "AudioMgr.play('career.trophy')", 9000],
  ['musica-menu', 'Musica dei menu (8 s)', 'Musica', "window.__CPM_NO_MUSICA23=true;AudioMgr.scene('home')", 8000],
  ['musica-carriera', 'Musica della carriera (8 s)', 'Musica', "window.__CPM_NO_MUSICA23=true;AudioMgr.scene('career')", 8000],
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
  if (rosso) await ctx.addInitScript(() => { window.__CPM_NO_G149 = true; });
  const p = await ctx.newPage();
  await p.goto(URLG, { waitUntil: 'load' }); await p.waitForFunction(() => document.getElementById('root')?.children.length > 0);
  await p.mouse.click(206, 40); await sleep(6000);
  const dir = path.join(OUT, rosso ? 'prima' : 'dopo'); fs.mkdirSync(dir, { recursive: true });
  const SOLO = process.env.CPM_SOLO ? process.env.CPM_SOLO.split(',') : null;
  for (const [id, , , codice, ms] of EVENTI) {
    if (SOLO && !SOLO.includes(id)) continue;
    const b64 = await p.evaluate(async ({ codice, ms }) => {
      try { AudioMgr.scene('loading'); } catch (_e) {} /* silenzio fra un evento e l'altro (musica e ambiente spenti) */
      await new Promise(r => setTimeout(r, 900));
      const c = window.__REC_CTX; const rec = new MediaRecorder(c.__rec.stream, { mimeType: 'audio/webm;codecs=opus' }); const parti = [];
      rec.ondataavailable = e => parti.push(e.data); const fine = new Promise(r => { rec.onstop = r; });
      rec.start(); await new Promise(r => setTimeout(r, 120)); (0, eval)(codice); await new Promise(r => setTimeout(r, ms)); rec.stop(); await fine;
      try { delete window.__CPM_NO_MUSICA23; AudioMgr.scene('loading'); } catch (_e) {}
      const buf = await new Blob(parti).arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s);
    }, { codice, ms });
    const w = path.join(dir, id + '.webm'); fs.writeFileSync(w, Buffer.from(b64, 'base64'));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', w, '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '96k', path.join(dir, id + '.mp3')]); fs.unlinkSync(w);
    const m = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(dir, id + '.mp3'), '-af', 'silenceremove=start_periods=1:start_threshold=-60dB:stop_periods=-1:stop_threshold=-60dB,astats=measure_overall=Peak_level+RMS_level:measure_perchannel=none,ebur128', '-f', 'null', '-']).stderr.toString();
    const pk = +((m.match(/Peak level dB: (-?[\d.]+|-inf)/) || [])[1]), rms = +((m.match(/RMS level dB: (-?[\d.]+|-inf)/) || [])[1]);
    const I = (m.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop(); const lufs = I ? +I.match(/(-?[\d.]+)/)[1] : null;
    const dur = +(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, id + '.mp3')]).stdout.toString());
    MIS[id] = MIS[id] || {}; MIS[id][rosso ? 'prima' : 'dopo'] = { picco_db: pk, rms_db: rms, lufs, durata_s: +dur.toFixed(2) };
    console.log(`${rosso ? 'prima' : 'dopo '} ${id.padEnd(16)} picco ${pk} dB · RMS ${rms} dB · ${lufs} LUFS`);
  }
  await b.close();
}
let MIS = {};
if (process.env.CPM_SOLO) try { for (const e of JSON.parse(fs.readFileSync(path.join(OUT, 'misure.json'), 'utf8')).eventi) MIS[e.id] = { prima: e.prima, dopo: e.dopo }; } catch (_e) {}
await braccio(true);
if (!process.env.CPM_SOLO_PRIMA) await braccio(false);
srv.close();
fs.writeFileSync(path.join(OUT, 'misure.json'), JSON.stringify({ _nota: 'misure delle registrazioni (silenzi di testa/coda tolti): picco/RMS dBFS, LUFS integrati', eventi: EVENTI.map(([id, nome, gruppo]) => ({ id, nome, gruppo, ...MIS[id] })) }, null, 1));
