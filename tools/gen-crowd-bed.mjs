#!/usr/bin/env node
/* [giro 20 — PO-238, decisione PO 14/10 «Sostituiscilo»] RENDER OFFLINE del BRUSIO DI FOLLA (crowd.bed)
   → assets/audio/sfx/crowd/brusio-folla-korward.wav

   Generato da noi, nessun campione di terzi: solo numeri pseudo-casuali con seme fisso → licenza nostra,
   file riproducibile byte per byte (stesso seme = stesso file).

   PROCEDIMENTO (tre strati, poi un respiro lento):
   1) CORPO — rumore a spettro modellato, costruito DIRETTAMENTE in frequenza: ampiezze di forma rosa
      (1/sqrt f), passa-alto a 220 Hz, un rigonfiamento largo attorno a 950 Hz (la «massa» di voci lontane) e
      passa-basso morbido a 2,8 kHz (la distanza: lo stadio e' grande, gli acuti si perdono), fasi casuali,
      poi FFT inversa. Una FFT inversa produce un segnale PERIODICO sulla sua lunghezza: il loop non ha
      giunto per costruzione.
   2) CHIACCHIERICCIO — ~2600 «grani vocali» brevi (0,15-0,6 s): fondamentale 95-270 Hz con leggera deriva,
      armoniche pesate da formanti di vocali (a/e/o/u/i), inviluppo di Hann. Sovrapposti (~40 alla volta)
      non si capisce nessuna parola: diventano brusio umano. Ogni grano e' scritto MODULO la lunghezza del
      loop (quello che sborda in fondo rientra in testa) → anche questo strato e' circolare.
      Poi passa in frequenza attraverso lo stesso filtro di distanza del corpo, piu' un passa-alto a 260 Hz.
   3) ONDATE — una dozzina di grani piu' forti e lunghi («ooh» lontani), sempre circolari.
   4) RESPIRO — modulazione lenta di ampiezza fatta di sinusoidi con un numero INTERO di cicli nel loop
      (2, 5, 11 cicli): il livello sale e scende piano e torna esattamente uguale al punto di partenza.
   Infine normalizzazione a RMS fissato (-20 dBFS) con controllo che il picco resti sotto 0,9.

   Formato: WAV PCM 16 bit mono 22050 Hz, 2^19 campioni (23,78 s). WAV e non mp3/ogg: il wav non ha
   ritardo d'encoder (il vecchio mp3 aveva 43,8 ms di silenzio in testa = un buco a ogni giro) e si
   decodifica ovunque, Safari compreso.
   Uso: node tools/gen-crowd-bed.mjs   → scrive il file e stampa picco/RMS/durata/giunto.
   Misura indipendente: node tools/misura-brusio.mjs assets/audio/sfx/crowd/brusio-folla-korward.wav */
import { writeFileSync } from 'node:fs';

const SR = 22050, LOG2 = 19, N = 1 << LOG2;
let _s = 0x2381a7c5 >>> 0;// seme fisso (mulberry32)
const rnd = () => { _s = (_s + 0x6D2B79F5) >>> 0; let t = _s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// FFT radix-2 in place (re/im Float64Array lunghi N), inv=true → inversa NON normalizzata
function fft(re, im, inv) {
  for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
    for (let i = 0; i < N; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < h; k++) { const a = i + k, b = a + h, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } }
  }
}
// filtro di DISTANZA comune (modulo della risposta in frequenza)
const hp = (f, fc) => { const r = f / fc; return r * r / Math.sqrt(1 + r * r * r * r); };// 2° ordine
const lp = (f, fc) => 1 / Math.sqrt(1 + Math.pow(f / fc, 4));// 2° ordine morbido
const distanza = f => hp(f, 220) * lp(f, 2800);
// applica una risposta reale H(f) a un segnale periodico x (in place)
function filtra(x, H) {
  const re = Float64Array.from(x), im = new Float64Array(N); fft(re, im, false);
  for (let k = 0; k <= N / 2; k++) { const g = H(k * SR / N); re[k] *= g; im[k] *= g; if (k > 0 && k < N / 2) { re[N - k] *= g; im[N - k] *= g; } }
  fft(re, im, true); for (let i = 0; i < N; i++) x[i] = re[i] / N;
}
const rmsOf = x => { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return Math.sqrt(s / x.length); };

// ---- 1) CORPO: spettro modellato + fasi casuali → FFT inversa (periodico) ----
const corpo = new Float64Array(N);
{ const re = new Float64Array(N), im = new Float64Array(N);
  for (let k = 1; k < N / 2; k++) { const f = k * SR / N;
    const mag = distanza(f) / Math.sqrt(f) * (1 + 1.4 * Math.exp(-Math.pow(Math.log(f / 950) / 0.6, 2)));
    const ph = rnd() * 2 * Math.PI; re[k] = mag * Math.cos(ph); im[k] = mag * Math.sin(ph); re[N - k] = re[k]; im[N - k] = -im[k]; }
  fft(re, im, true); for (let i = 0; i < N; i++) corpo[i] = re[i]; }

// ---- 2+3) CHIACCHIERICCIO e ONDATE: grani vocali circolari ----
const VOCALI = [[730, 1090, 2440], [530, 1840, 2480], [570, 840, 2410], [300, 870, 2240], [270, 2290, 3010]];// a e o u i (F1 F2 F3)
const formanti = (f, V) => { const g = (fc, bw, a) => a * Math.exp(-((f - fc) * (f - fc)) / (2 * bw * bw)); return g(V[0], 90, 1) + g(V[1], 120, 0.6) + g(V[2], 200, 0.2) + 0.03; };
const voci = new Float64Array(N);
function grano(t0, dur, f0, amp, V, deriva) {
  const L = Math.floor(dur * SR), nH = Math.max(4, Math.min(24, Math.floor(3000 / f0)));
  const hA = new Float64Array(nH + 1); for (let h = 1; h <= nH; h++) hA[h] = formanti(h * f0, V) / h;
  let ph = rnd() * 2 * Math.PI; const vibF = 4 + rnd() * 2.5, vibD = 0.01 + rnd() * 0.02;
  for (let i = 0; i < L; i++) { const u = i / L, env = 0.5 - 0.5 * Math.cos(2 * Math.PI * u);
    const f = f0 * (1 + deriva * (u - 0.5)) * (1 + vibD * Math.sin(2 * Math.PI * vibF * i / SR)); ph += 2 * Math.PI * f / SR;
    let s = 0; for (let h = 1; h <= nH; h++) s += hA[h] * Math.sin(h * ph);
    voci[(t0 + i) % N] += amp * env * s; }
}
const NG = 2600;
for (let g = 0; g < NG; g++) grano(Math.floor(rnd() * N), 0.15 + rnd() * 0.45, 95 + rnd() * 175, 0.6 + rnd() * 0.8, VOCALI[Math.floor(rnd() * 5)], (rnd() - 0.5) * 0.25);
for (let g = 0; g < 12; g++) grano(Math.floor(rnd() * N), 0.9 + rnd() * 0.9, 120 + rnd() * 120, 2.6 + rnd() * 1.2, VOCALI[[0, 2, 3][Math.floor(rnd() * 3)]], 0.06 + rnd() * 0.08);
filtra(voci, f => distanza(f) * hp(f, 260));// le fondamentali basse, da lontano, si perdono

// ---- mix + 4) RESPIRO (cicli interi → periodico) ----
const kC = 1 / rmsOf(corpo), kV = 0.85 / rmsOf(voci);
const fi = [rnd(), rnd(), rnd()].map(v => v * 2 * Math.PI);
const out = new Float64Array(N);
for (let i = 0; i < N; i++) { const u = i / N;
  const resp = 1 + 0.12 * Math.sin(2 * Math.PI * 2 * u + fi[0]) + 0.07 * Math.sin(2 * Math.PI * 5 * u + fi[1]) + 0.04 * Math.sin(2 * Math.PI * 11 * u + fi[2]);
  out[i] = resp * (corpo[i] * kC + voci[i] * kV); }
const TARGET_RMS = 0.1;// -20 dBFS
const norm = TARGET_RMS / rmsOf(out); let pk = 0; for (let i = 0; i < N; i++) { out[i] *= norm; pk = Math.max(pk, Math.abs(out[i])); }
if (pk >= 0.9) { console.error(`picco ${pk.toFixed(3)} ≥ 0,9: abbassare TARGET_RMS`); process.exit(1); }

// ---- WAV 16 bit mono ----
const dataLen = N * 2, buf = Buffer.alloc(44 + dataLen);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataLen, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(dataLen, 40);
for (let i = 0; i < N; i++) { const s = Math.max(-1, Math.min(1, out[i])); buf.writeInt16LE(Math.round(s < 0 ? s * 32768 : s * 32767), 44 + i * 2); }
const path = new URL('../assets/audio/sfx/crowd/brusio-folla-korward.wav', import.meta.url).pathname;
writeFileSync(path, buf);
const salto = Math.abs(out[0] - out[N - 1]);
console.log(`SCRITTO ${path}\n  ${(N / SR).toFixed(2)}s · ${SR} Hz mono · ${(buf.length / 1024).toFixed(0)} KB\n  picco ${pk.toFixed(3)} · RMS ${TARGET_RMS} · salto al giunto ${salto.toFixed(5)}`);
