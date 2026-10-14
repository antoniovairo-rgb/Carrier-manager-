#!/usr/bin/env node
/* [giro 20 — PO-238 «Sostituiscilo»] MISURA di un file di brusio da mettere in loop (crowd.bed).
   Decodifica con ffmpeg (stessa strada per mp3 e wav → numeri confrontabili) in float32 mono e stampa:
   - durata, frequenza, canali;
   - picco e RMS (lineari e dBFS) sull'intero file;
   - silenzio in testa e in coda (campioni |x|<1e-4): con un mp3 il decoder aggiunge il ritardo dell'encoder,
     e in loop quel silenzio diventa un buco ogni giro;
   - SALTO AL PUNTO DI LOOP: |x[fine]-x[inizio]| confrontato col 99,9° percentile dei salti fra campioni
     consecutivi del file stesso (rapporto >1 = il giunto e' piu' brusco di qualunque punto del suono = clic);
   - scarto di livello al giunto: RMS degli ultimi 50 ms contro i primi 50 ms (dB).
   Uso: node tools/misura-brusio.mjs <file> [--json]   (richiede ffmpeg nel PATH) */
import { spawnSync } from 'node:child_process';
const f = process.argv[2]; if (!f) { console.error('uso: node tools/misura-brusio.mjs <file> [--json]'); process.exit(2); }
const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=sample_rate,channels', '-of', 'json', f], { encoding: 'utf8' });
const st = JSON.parse(pr.stdout || '{}').streams?.[0] || {}; const SR = +st.sample_rate || 0;
const dec = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
if (dec.status !== 0) { console.error('ffmpeg: decodifica fallita'); process.exit(2); }
const b = dec.stdout; const x = new Float32Array(b.buffer, b.byteOffset, b.length >> 2); const N = x.length;
let pk = 0, s2 = 0; for (let i = 0; i < N; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; s2 += x[i] * x[i]; }
const rms = Math.sqrt(s2 / N), db = v => (20 * Math.log10(Math.max(v, 1e-9))).toFixed(1);
let testa = 0; while (testa < N && Math.abs(x[testa]) < 1e-4) testa++;
let coda = 0; while (coda < N && Math.abs(x[N - 1 - coda]) < 1e-4) coda++;
const d = new Float32Array(N - 1); for (let i = 1; i < N; i++) d[i - 1] = Math.abs(x[i] - x[i - 1]);
const ds = Float32Array.from(d).sort(); const p999 = ds[Math.floor(ds.length * 0.999)] || 1e-9;
const giunto = Math.abs(x[0] - x[N - 1]);
const w = Math.max(1, Math.round(SR * 0.05)); const rmsOf = (a, b2) => { let s = 0; for (let i = a; i < b2; i++) s += x[i] * x[i]; return Math.sqrt(s / (b2 - a)); };
const scarto = 20 * Math.log10(Math.max(rmsOf(N - w, N), 1e-9) / Math.max(rmsOf(0, w), 1e-9));
const r = { file: f, sr: SR, canali: +st.channels || 0, durata: +(N / SR).toFixed(3), picco: +pk.toFixed(4), piccoDb: +db(pk), rms: +rms.toFixed(4), rmsDb: +db(rms),
  silenzioTestaMs: +(testa / SR * 1000).toFixed(1), silenzioCodaMs: +(coda / SR * 1000).toFixed(1),
  giunto: +giunto.toFixed(5), p999: +p999.toFixed(5), giuntoSuP999: +(giunto / p999).toFixed(2), scartoGiuntoDb: +scarto.toFixed(2) };
if (process.argv.includes('--json')) { console.log(JSON.stringify(r)); process.exit(0); }
console.log(`${f}\n  ${r.durata}s · ${SR} Hz · ${r.canali} canali\n  picco ${r.picco} (${r.piccoDb} dBFS) · RMS ${r.rms} (${r.rmsDb} dBFS)`);
console.log(`  silenzio in testa ${r.silenzioTestaMs} ms · in coda ${r.silenzioCodaMs} ms`);
console.log(`  giunto del loop: salto ${r.giunto} contro p99,9 ${r.p999} → ${r.giuntoSuP999}× · scarto di livello ${r.scartoGiuntoDb} dB`);
