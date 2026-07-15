#!/usr/bin/env node
/* [7.72.0] RENDER OFFLINE del boato del gol → assets/audio/sfx/crowd/goal-roar.wav
   Sintesi GRANULARE ricca (impossibile in tempo reale): ~180 "grani vocali" (vocali «AAAH» con
   formanti + contorno di pitch) sovrapposti = muro di voci, + corpo broadband + applausi + rombo grave.
   Deterministico (seed fisso). Nessun asset esterno → licenza-safe (generato). WAV 22050 Hz mono 16-bit.
   Uso: node tools/gen-crowd-roar.mjs   → scrive il file e stampa peak/RMS/durata (self-check).  */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SR = 22050, DUR = 3.4, N = Math.floor(SR * DUR);
const out = new Float32Array(N);

// PRNG deterministico (mulberry32)
let _s = 0x9e3779b9 >>> 0;
const rnd = () => { _s = (_s + 0x6D2B79F5) >>> 0; let t = _s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
// envelope globale del boato: crescendo rapido → pieno → coda lunga
const genv = t => {
  if (t < 0.22) return smooth(t / 0.22);
  if (t < 1.35) return 1;
  return Math.max(0, Math.pow(1 - (t - 1.35) / (DUR - 1.35), 1.6));
};
// risposta di un formante (peak gaussiano in frequenza) → colore vocale «ah» (F1~730, F2~1090, F3~2600)
const formResp = f => {
  const g = (fc, bw, a) => a * Math.exp(-((f - fc) * (f - fc)) / (2 * bw * bw));
  return g(730, 90, 1.0) + g(1090, 110, 0.7) + g(2600, 180, 0.28) + g(3400, 250, 0.12);
};

// ---- 1) VOCI (grani granulari): il carattere UMANO del boato ----
const NV = 180;
for (let v = 0; v < NV; v++) {
  const t0 = 0.72 * Math.pow(rnd(), 1.5);           // onset: la maggior parte esplode presto
  const dur = 0.5 + rnd() * 1.4;                     // durata del singolo grido
  const f0 = 95 + rnd() * 175;                       // fondamentale (uomini/donne/ragazzi)
  const rise = 1 + (rnd() - 0.3) * 0.10;             // leggera salita di intonazione
  const vibF = 4 + rnd() * 3, vibD = 0.02 + rnd() * 0.03;
  const amp = (0.55 + rnd() * 0.55) / Math.sqrt(NV) * 1.9;
  const nH = 14;
  // ampiezze armoniche pesate dai formanti (vocale) — precompute
  const hAmp = new Float32Array(nH + 1);
  for (let h = 1; h <= nH; h++) hAmp[h] = formResp(h * f0) / h * 0.9;
  const ph = new Float32Array(nH + 1);
  const s0 = Math.floor(t0 * SR), s1 = Math.min(N, Math.floor((t0 + dur) * SR));
  for (let i = s0; i < s1; i++) {
    const u = (i - s0) / (s1 - s0);                  // 0..1 nel grano
    const ge = Math.sin(Math.PI * u);                // hann → attacco/rilascio morbidi
    const f = f0 * (1 + (rise - 1) * u) * (1 + vibD * Math.sin(2 * Math.PI * vibF * (i - s0) / SR));
    let s = 0;
    for (let h = 1; h <= nH; h++) { ph[h] += 2 * Math.PI * h * f / SR; s += hAmp[h] * Math.sin(ph[h]); }
    out[i] += s * ge * amp;
  }
}

// ---- 2) CORPO broadband (rumore filtrato) → energia/roar, maschera ogni tono ----
{
  let brown = 0, lpL = 0, hpP = 0, hpX = 0;
  for (let i = 0; i < N; i++) {
    const w = rnd() * 2 - 1;
    brown = (brown + 0.02 * w) / 1.02;               // brownish
    let x = brown * 3;
    // highpass ~120Hz (one-pole)
    const a = 0.985; hpP = a * (hpP + x - hpX); hpX = x; x = hpP;
    // lowpass ~2200Hz
    lpL += (x - lpL) * 0.30; x = lpL;
    out[i] += x * 0.42 * genv(i / SR);
  }
}

// ---- 3) APPLAUSI (crepitio umano): tanti battiti brevi random sopra il sustain ----
{
  const NC = 900;
  for (let c = 0; c < NC; c++) {
    const tc = 0.15 + rnd() * (DUR - 0.5);
    const s0 = Math.floor(tc * SR), len = Math.floor((0.008 + rnd() * 0.02) * SR);
    const amp = (0.5 + rnd() * 0.5) * 0.05;
    for (let i = 0; i < len && s0 + i < N; i++) {
      const e = Math.exp(-i / (len * 0.35));
      out[s0 + i] += (rnd() * 2 - 1) * e * amp * (0.6 + genv(tc));
    }
  }
}

// ---- 4) ROMBO grave (sub) → peso ----
{
  let l = 0;
  for (let i = 0; i < N; i++) { const w = rnd() * 2 - 1; l += (w - l) * 0.006; out[i] += l * 0.5 * genv(i / SR); }
}

// ---- normalizzazione a -1.0 dBFS + soft-clip di sicurezza ----
let peak = 0, sum = 0;
for (let i = 0; i < N; i++) { const a = Math.abs(out[i]); if (a > peak) peak = a; sum += out[i] * out[i]; }
const norm = peak > 0 ? 0.89 / peak : 1;
for (let i = 0; i < N; i++) { let s = out[i] * norm; s = Math.tanh(s * 1.05); out[i] = s; }
let peak2 = 0, sum2 = 0;
for (let i = 0; i < N; i++) { const a = Math.abs(out[i]); if (a > peak2) peak2 = a; sum2 += out[i] * out[i]; }
const rms = Math.sqrt(sum2 / N);

// ---- WAV 16-bit mono ----
const bytesPerSample = 2, dataLen = N * bytesPerSample;
const buf = Buffer.alloc(44 + dataLen);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataLen, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * bytesPerSample, 28); buf.writeUInt16LE(bytesPerSample, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(dataLen, 40);
for (let i = 0; i < N; i++) { const s = clamp(out[i], -1, 1); buf.writeInt16LE((s < 0 ? s * 32768 : s * 32767) | 0, 44 + i * 2); }

const path = new URL('../assets/audio/sfx/crowd/goal-roar.wav', import.meta.url).pathname;
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, buf);
console.log(`WROTE ${path}`);
console.log(`  dur=${DUR}s  SR=${SR}  samples=${N}  size=${(buf.length / 1024).toFixed(0)}KB`);
console.log(`  peak=${peak2.toFixed(3)} (target ~0.89)  RMS=${rms.toFixed(3)}  ${rms > 0.05 && peak2 > 0.5 ? 'OK (non-silent, healthy level)' : 'WARN check level'}`);
