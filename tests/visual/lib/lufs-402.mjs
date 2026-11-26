/* [giro 402 · PO-577] Sonorita' ITU-R BS.1770-4 / EBU R128, implementata QUI (nessuna libreria): misura e basta, non giudica.
   Ingresso: campioni PCM float interlacciati stereo (L,R,L,R…) e la frequenza di campionamento.
   - pesatura K: due biquad (shelf alto + passa-alto RLB), coefficienti ricavati per qualunque fs come nella norma (Annex 1);
   - momentanea: blocchi da 400 ms con sovrapposizione 75% (passo 100 ms);
   - integrata: soglia assoluta −70 LUFS, poi soglia relativa −10 LU sulla media dei blocchi sopra l'assoluta;
   - breve termine: finestre da 3 s (passo 100 ms), se ne danno massimo, mediana e 95° percentile;
   - picco vero: sovracampionamento ×4 con FIR polifase (sinc finestrata Kaiser, 48 prese per fase), in dBTP (Annex 2);
   - picco di campione in dBFS.
   La verifica contro un riferimento indipendente (ffmpeg ebur128 peak=true) la fa `verificaFfmpeg`. */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function kCoeff(fs_) {
  /* stadio 1: shelf alto (+4 dB circa sopra 1,5 kHz) */
  const f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
  const K = Math.tan(Math.PI * f0 / fs_), Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
  const a0 = 1 + K / Q + K * K;
  const s1 = { b: [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0], a: [2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0] };
  /* stadio 2: passa-alto RLB */
  const f1 = 38.13547087602444, Q1 = 0.5003270373238773, K1 = Math.tan(Math.PI * f1 / fs_);
  const a01 = 1 + K1 / Q1 + K1 * K1;
  const s2 = { b: [1, -2, 1], a: [2 * (K1 * K1 - 1) / a01, (1 - K1 / Q1 + K1 * K1) / a01] };
  return [s1, s2];
}
function biquad(x, { b, a }) {
  const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[0] * y1 - a[1] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
const toLufs = ms => (ms > 0 ? -0.691 + 10 * Math.log10(ms) : -Infinity);
const toDb = v => (v > 0 ? 20 * Math.log10(v) : -Infinity);

/* potenza media pesata K per blocco: somma dei canali (pesi 1,0 per L/R) */
function blocchi(chs, fs_, durS, passoS) {
  const n = chs[0].length, L = Math.round(durS * fs_), P = Math.round(passoS * fs_);
  const cum = chs.map(c => { const s = new Float64Array(n + 1); for (let i = 0; i < n; i++) s[i + 1] = s[i] + c[i] * c[i]; return s; });
  const out = [];
  for (let st = 0; st + L <= n; st += P) { let z = 0; for (const s of cum) z += (s[st + L] - s[st]) / L; out.push(z); }
  return out;
}
function kaiser(N, beta) {
  const I0 = x => { let s = 1, t = 1; for (let k = 1; k < 30; k++) { t *= (x / 2 / k) ** 2; s += t; } return s; };
  const w = new Float64Array(N); for (let i = 0; i < N; i++) { const r = 2 * i / (N - 1) - 1; w[i] = I0(beta * Math.sqrt(1 - r * r)) / I0(beta); } return w;
}
function piccoVero(chs, os = 4, tapsPerPhase = 48) {
  const N = os * tapsPerPhase, w = kaiser(N, 8), c = (N - 1) / 2;
  const h = new Float64Array(N); for (let i = 0; i < N; i++) { const t = (i - c) / os; h[i] = (t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t)) * w[i]; }
  const ph = []; for (let p = 0; p < os; p++) { const f = []; for (let i = p; i < N; i += os) f.push(h[i]); ph.push(Float64Array.from(f)); }
  let m = 0;
  for (const x of chs) {
    const n = x.length;
    for (let i = 0; i < n; i++) {
      const ax = Math.abs(x[i]); if (ax > m) m = ax;
      for (let p = 1; p < os; p++) {
        const f = ph[p]; let s = 0; for (let k = 0; k < f.length; k++) { const j = i - k + (tapsPerPhase >> 1); if (j >= 0 && j < n) s += f[k] * x[j]; }
        const a = Math.abs(s); if (a > m) m = a;
      }
    }
  }
  return m;
}
const quant = (arr, q) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))]; };
const r1 = v => (v == null || !isFinite(v) ? null : +v.toFixed(1));

export function misura(inter, fs_, { piccoVeroOn = true } = {}) {
  const n = inter.length >> 1, L = new Float64Array(n), R = new Float64Array(n);
  let pk = 0; for (let i = 0; i < n; i++) { L[i] = inter[2 * i]; R[i] = inter[2 * i + 1]; const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (a > pk) pk = a; }
  const [s1, s2] = kCoeff(fs_);
  const kw = [biquad(biquad(L, s1), s2), biquad(biquad(R, s1), s2)];
  const mom = blocchi(kw, fs_, 0.4, 0.1);
  const abs = mom.filter(z => toLufs(z) > -70);
  const media = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
  const relSoglia = toLufs(media(abs)) - 10;
  const gated = abs.filter(z => toLufs(z) > relSoglia);
  const I = gated.length ? toLufs(media(gated)) : -Infinity;
  const st = blocchi(kw, fs_, 3, 0.1).map(toLufs).filter(v => v > -70);
  const M = mom.map(toLufs).filter(v => v > -70);
  return {
    durata_s: +(n / fs_).toFixed(1), fs: fs_,
    lufs_i: r1(I), blocchi_gated: gated.length, blocchi_tot: mom.length,
    st_max: r1(quant(st, 1)), st_mediana: r1(quant(st, 0.5)), st_p95: r1(quant(st, 0.95)), st_p10: r1(quant(st, 0.10)),
    m_max: r1(quant(M, 1)),
    picco_dbfs: r1(toDb(pk)), picco_vero_dbtp: piccoVeroOn ? r1(toDb(piccoVero([L, R]))) : null,
    silenzio_quota: +(1 - abs.length / (mom.length || 1)).toFixed(3),
  };
}
/* WAV float32 stereo, per il riascolto e per il controllo incrociato con ffmpeg */
export function scriviWav(file, inter, fs_) {
  const data = Buffer.from(inter.buffer, inter.byteOffset, inter.byteLength), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(fs_, 24); h.writeUInt32LE(fs_ * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}
export function verificaFfmpeg(file) {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr?.toString() || '';
  const sum = e.slice(e.lastIndexOf('Summary:'));
  const g = re => { const m = sum.match(re); return m ? +m[1] : null; };
  return { ok: sum.includes('Integrated'), lufs_i: g(/I:\s+(-?[\d.]+) LUFS/), lra: g(/LRA:\s+(-?[\d.]+) LU/), picco_vero_dbtp: g(/True peak:\s+Peak:\s+(-?[\d.]+) dBFS/) };
}
/* segnale di prova: seno 1 kHz a −20 dBFS su entrambi i canali → la norma dice −20 + 3,01 − 0,69 ≈ −17,7 LUFS... (stereo: −17,0+…);
   lo usiamo solo come autocontrollo contro ffmpeg, non contro un numero scritto a mano */
export function seno(fs_, sec, dbfs, f = 1000) {
  const n = Math.round(fs_ * sec), a = Math.pow(10, dbfs / 20), o = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const v = a * Math.sin(2 * Math.PI * f * i / fs_); o[2 * i] = v; o[2 * i + 1] = v; }
  return o;
}
