#!/usr/bin/env node
/* [giro 430] SONDA d'ascolto (non guardiano): registra 10 s dell'USCITA VERA della pagina (tutto cio' che arriva all'AudioDestinationNode,
   copiato su un MediaStreamAudioDestinationNode + MediaRecorder) in home e nel video intro, sul sito servito come su GitHub Pages
   (senza ?cpmtest). Uso: node registra-430.mjs <URL del sito locale> → docs/collaudo-po/430-ascolto-{home,intro}.mp3 (ffmpeg). */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launchBrowser, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(QUI, '../..');
const URLG = process.argv[2] || 'http://localhost:8430/Carrier-manager-/';
const TMP = process.env.CPM_TMP || path.join(QUI, 'out'); fs.mkdirSync(TMP, { recursive: true });
const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  try { localStorage.setItem('cpm-intro-seen', '1'); } catch (_e) {}
  const C = AudioNode.prototype.connect; const tap = new WeakMap();
  AudioNode.prototype.connect = function (d, ...x) { try { if (d instanceof AudioDestinationNode) { const c = d.context; let t = tap.get(c); if (!t) { t = c.createMediaStreamDestination(); tap.set(c, t); window.__REC430 = t; } C.call(this, t); } } catch (_e) {} return C.call(this, d, ...x); };
  { const S = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...x) { try { if (this.buffer && this.buffer.duration < 3 && !this.loop && window.__CPM_MENU429S && window.__CPM_MENU429S().intro) window.__INTRO430 = window.__INTRO430 || Date.now(); } catch (_e) {} return S.apply(this, x); }; }
  window.__REG430 = (ms) => new Promise((res) => { const t = window.__REC430; if (!t) return res(null); const r = new MediaRecorder(t.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 160000 }); const pz = [];
    r.ondataavailable = (e) => pz.push(e.data); r.onstop = async () => { const bl = new Blob(pz); const ab = new Uint8Array(await bl.arrayBuffer()); let s = ''; for (let i = 0; i < ab.length; i += 0x8000) s += String.fromCharCode.apply(null, ab.subarray(i, i + 0x8000)); res(btoa(s)); };
    r.start(); setTimeout(() => r.stop(), ms); });
});
const p = await ctx.newPage();
await p.goto(URLG, { waitUntil: 'load', timeout: 90000 }); await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500); await p.mouse.click(195, 60);
await p.waitForFunction(() => window.__CPM_MENU429S && window.__CPM_MENU429S().suona, null, { timeout: 30000 }).catch(() => {});
const salva = (b64, nome) => { const w = path.join(TMP, nome + '.webm'); fs.writeFileSync(w, Buffer.from(b64, 'base64'));
  const out = path.join(ROOT, 'docs/collaudo-po', nome + '.mp3'); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', w, '-t', '10', '-ac', '2', '-ar', '44100', '-b:a', '128k', out]); return out; };
const home = await p.evaluate(() => window.__REG430(10500));
console.log('home →', home ? salva(home, '430-ascolto-home') : 'nessuna uscita');
await p.evaluate(() => window.dispatchEvent(new CustomEvent('cpm-replay-intro')));
// si aspetta il fischio d'inizio dell'intro (primo effetto di _S13), poi 12 s (misurato: in headless la scena dell intro scorre piu lenta del reale): nei 10 s registrati cadono tiro, rete e boato
await p.waitForFunction(() => window.__INTRO430, null, { timeout: 40000 }).catch(() => {}); await sleep(12000);
const intro = await p.evaluate(() => window.__REG430(10500));
console.log('intro →', intro ? salva(intro, '430-ascolto-intro') : 'nessuna uscita');
await b.close();
