/* [giro 402 · PO-577] SONDA DI TARATURA (non e' un guardiano). Prende la registrazione PCM di una partita catturata dal braccio ROSSO di
   lufs-402 (uscita del master senza guadagno ne' limitatore: `CPM_BRACCIO=rosso CPM_WAV=1 node lufs-402.mjs` → out/lufs-402/partita-rosso.wav)
   e la fa passare, in un OfflineAudioContext di Chromium, per la STESSA catena d'uscita del gioco (GainNode + DynamicsCompressorNode),
   una combinazione per volta. La catena a monte del master e' lineare e non dipende dal guadagno, quindi il risultato e' quello che
   la partita darebbe con quei parametri. Misura con lib/lufs-402.mjs (BS.1770). Uso: node misura-402.mjs [file.wav]. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { launchBrowser, ROOT } from './lib/harness.mjs';
import { misura } from './lib/lufs-402.mjs';

const WAV = path.resolve(process.argv[2] || path.join(ROOT, 'tests/visual/out/lufs-402/partita-rosso.wav'));
if (!fs.existsSync(WAV)) { console.error('manca ' + WAV); process.exit(2); }
const buf = fs.readFileSync(WAV); const fsr = buf.readUInt32LE(24);
/* il bus della folla registrato insieme (stessi campioni): il resto = uscita − folla (nel rosso l'uscita e' la somma dei bus) */
const WAVF = WAV.replace(/\.wav$/, '-folla.wav'); const bufF = fs.existsSync(WAVF) ? fs.readFileSync(WAVF) : null;
/* ginocchio 0 sempre: la compensazione del guadagno automatico (come _comp402 in src/09) e' esatta solo li' */
const COMBO = JSON.parse(process.env.CPM_COMBO || 'null') || [
  { db: 0, nolim: true }, { db: 12.4, nolim: true },
  ...[[11, -6], [12, -6], [12, -8], [12.5, -6], [13, -6], [13, -8], [14, -9]].map(([db, thr]) => ({ db, thr, knee: 0, ratio: 20, att: 0.001, rel: 0.2 })),
];
const srv = http.createServer((q, r) => { if (q.url === '/f.wav' && bufF) { r.writeHead(200, { 'Content-Type': 'audio/wav', 'Content-Length': bufF.length }); return r.end(bufF); }
  if (q.url === '/a.wav') { r.writeHead(200, { 'Content-Type': 'audio/wav', 'Content-Length': buf.length }); return r.end(buf); } r.writeHead(200, { 'Content-Type': 'text/html' }); r.end('<!doctype html><title>402</title>'); }).listen(0);
const b = await launchBrowser(); const p = await b.newPage(); await p.goto(`http://localhost:${srv.address().port}/`);
for (const c of COMBO) {
  const b64 = await p.evaluate(async (c) => {
    const ab = await (await fetch('/a.wav')).arrayBuffer(); const dv = new DataView(ab); const n = (ab.byteLength - 44) / 8;
    const sr = dv.getUint32(24, true); const oc = new OfflineAudioContext(2, n, sr); const src = oc.createBuffer(2, n, sr);
    const f = new Float32Array(ab, 44, n * 2); const L = src.getChannelData(0), R = src.getChannelData(1);
    /* guadagni per bus: gF sulla folla, gE sul resto (effetti di gioco + arbitro); c.db = guadagno unico (vecchia forma) */
    const gF = Math.pow(10, (c.crowd ?? c.db ?? 0) / 20), gE = Math.pow(10, (c.match ?? c.db ?? 0) / 20); let ff = null;
    if (c.crowd != null) { const r = await fetch('/f.wav'); if (!r.ok) throw new Error('manca il bus della folla'); ff = new Float32Array(await r.arrayBuffer(), 44, n * 2); }
    for (let i = 0; i < n; i++) { if (ff) { L[i] = gF * ff[2 * i] + gE * (f[2 * i] - ff[2 * i]); R[i] = gF * ff[2 * i + 1] + gE * (f[2 * i + 1] - ff[2 * i + 1]); } else { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; } }
    const s = oc.createBufferSource(); s.buffer = src; const g = oc.createGain(); g.gain.value = c.crowd != null ? 1 : Math.pow(10, (c.db || 0) / 20); s.connect(g);
    if (c.nolim) g.connect(oc.destination); else { const k = oc.createDynamicsCompressor(); k.threshold.value = c.thr; k.knee.value = c.knee; k.ratio.value = c.ratio; k.attack.value = c.att; k.release.value = c.rel; g.connect(k); const cg = oc.createGain(); cg.gain.value = Math.pow(10, -0.6 * Math.abs(c.thr) * (1 - 1 / c.ratio) / 20); k.connect(cg);
      /* secondo stadio facoltativo (c.thr2): limitatore lento di sicurezza dopo quello rapido, come in src/09 */
      if (c.thr2 != null) { const k2 = oc.createDynamicsCompressor(); k2.threshold.value = c.thr2; k2.knee.value = 0; k2.ratio.value = 20; k2.attack.value = c.att2 ?? 0.001; k2.release.value = c.rel2 ?? 0.2; const c2 = oc.createGain(); c2.gain.value = Math.pow(10, -0.6 * Math.abs(c.thr2) * (1 - 1 / 20) / 20); cg.connect(k2); k2.connect(c2); c2.connect(oc.destination); } else cg.connect(oc.destination); }/* stessa compensazione del gioco (_comp402) */
    s.start(); const out = await oc.startRendering(); const o = new Float32Array(n * 2); const a = out.getChannelData(0), bb = out.getChannelData(1); for (let i = 0; i < n; i++) { o[2 * i] = a[i]; o[2 * i + 1] = bb[i]; }
    const u = new Uint8Array(o.buffer); let t = ''; for (let i = 0; i < u.length; i += 32768) t += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(t);
  }, c);
  const u = Buffer.from(b64, 'base64'); const x = new Float32Array(u.buffer, u.byteOffset, u.byteLength / 4);
  const m = misura(x, fsr);
  console.log(JSON.stringify(c), '→', `I ${m.lufs_i} · ST max ${m.st_max} med ${m.st_mediana} p10 ${m.st_p10} · M max ${m.m_max} · TP ${m.picco_vero_dbtp} dBTP · campione ${m.picco_dbfs}`);
}
await b.close(); srv.close();
