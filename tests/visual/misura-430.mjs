#!/usr/bin/env node
/* [giro 430 · PO-692] SONDA (non guardiano) — cosa SUONA DAVVERO in home e nel video intro, senza ?cpmtest.
   Aggancia i nodi audio della pagina (AudioBufferSourceNode.start · OscillatorNode.start · HTMLMediaElement.play),
   lega ogni buffer al file da cui e' stato decodificato (fetch → arrayBuffer → decodeAudioData) e, a ogni fotografia,
   calcola il guadagno effettivo verso l'uscita (prodotto dei GainNode sul cammino). Scene: primo avvio pulito + tocco
   (home) · «Rivedi intro» · avvio successivo (stesso profilo, service worker gia' installato).
   Uso: node misura-430.mjs [URL] (default: sito pubblicato) · CPM_VP=telefono|pc · uscita out/misura-430-<vp>-<sorgente>.json */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const URLG = process.argv[2] || 'https://antoniovairo-rgb.github.io/Carrier-manager-/';
const VP = process.env.CPM_VP || 'telefono';
const ATTESA = +(process.env.CPM_ATTESA || 14000);

const AGGANCIO430 = () => {
  if (window.__A430) return; const L = window.__A430 = { t0: performance.now(), src: [], osc: 0, oscT: [], media: [] };
  const url = new WeakMap(), bufUrl = new WeakMap(), edges = new WeakMap();
  const of = window.fetch; window.fetch = function (i) { const u = String((i && i.url) || i); return of.apply(this, arguments).then(r => { try { const ab = r.arrayBuffer.bind(r); r.arrayBuffer = () => ab().then(b => { try { url.set(b, u); } catch (_e) {} return b; }); } catch (_e) {} return r; }); };
  const D = BaseAudioContext.prototype.decodeAudioData; BaseAudioContext.prototype.decodeAudioData = function (ab, ...x) { const u = url.get(ab); const p = D.call(this, ab, ...x); if (p && p.then) p.then(b => { if (u && b) bufUrl.set(b, u); }).catch(() => {}); return p; };
  const C = AudioNode.prototype.connect; AudioNode.prototype.connect = function (d, ...x) { try { if (d instanceof AudioNode) { const a = edges.get(this) || []; a.push(d); edges.set(this, a); } } catch (_e) {} return C.call(this, d, ...x); };
  const S = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...x) { try { const b = this.buffer; const e = { t: Math.round(performance.now() - L.t0), file: (b && bufUrl.get(b)) || null, dur: b ? +b.duration.toFixed(2) : 0, loop: !!this.loop, finito: false, node: this };
      this.addEventListener('ended', () => { e.finito = true; e.tFine = Math.round(performance.now() - L.t0); }); L.src.push(e); } catch (_e) {} return S.apply(this, x); };
  const O = OscillatorNode.prototype.start; OscillatorNode.prototype.start = function (...x) { L.osc++; L.oscT.push(Math.round(performance.now() - L.t0)); return O.apply(this, x); };
  const P = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { L.media.push({ t: Math.round(performance.now() - L.t0), src: this.currentSrc || this.src }); return P.apply(this, arguments); };
  const guad = (n, seen) => { if (n instanceof AudioDestinationNode) return 1; if (seen.has(n)) return 0; seen.add(n); const a = edges.get(n) || []; let m = 0;
    for (const d of a) { const g = guad(d, seen); if (g > m) m = g; } seen.delete(n); return m * (n instanceof GainNode ? n.gain.value : 1); };
  window.__A430R = () => ({ ora: Math.round(performance.now() - L.t0), osc: L.osc, oscUltimi5s: L.oscT.filter(t => t > performance.now() - L.t0 - 5000).length, media: L.media.slice(),
    src: L.src.map(e => ({ t: e.t, file: e.file ? e.file.replace(/^.*assets\/audio\//, '') : `(buffer generato ${e.dur} s)`, dur: e.dur, loop: e.loop, finito: e.finito, tFine: e.tFine || null,
      guadagno: e.finito ? null : +guad(e.node, new Set()).toFixed(4) })) });
};

async function scena(p, nome) {
  const r = await p.evaluate(() => { const o = window.__A430R ? window.__A430R() : null; let d = null, c = null; try { d = AudioMgr.debug(); c = AudioMgr.getCfg(); } catch (_e) {}
    let v = null; try { v = GAME_VERSION; } catch (_e) {} return { o, debug: d && { ready: d.ready, ctx: d.ctx, scena: d.scene, inMatch: d.inMatch }, cfg: c && { mute: c.mute, vol: c.vol, on: c.on }, versione: v }; }).catch(e => ({ err: String(e).slice(0, 120) }));
  return { scena: nome, ...r };
}
const sw = (p) => p.evaluate(async () => { const o = { controllo: !!(navigator.serviceWorker && navigator.serviceWorker.controller), registrazioni: [], cache: {} };
  try { for (const r of await navigator.serviceWorker.getRegistrations()) o.registrazioni.push((r.active && r.active.scriptURL) || '(non attivo)'); } catch (_e) {}
  try { for (const k of await caches.keys()) { const c = await caches.open(k); const ks = await c.keys(); o.cache[k] = { voci: ks.length, audio: ks.map(q => q.url).filter(u => /assets\/audio\//.test(u)).map(u => u.replace(/^.*assets\/audio\//, '')) }; } } catch (_e) {}
  return o; }).catch(() => null);

const b = await launchBrowser();
const ctx = await b.newContext(VP === 'pc' ? { viewport: { width: 1366, height: 768 } } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
await ctx.addInitScript(AGGANCIO430);
const out = { url: URLG, vp: VP, quando: new Date().toISOString(), scene: [] };
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
const monta = async () => { await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {}); await sleep(1500); };
// 1. primo avvio pulito
await p.goto(URLG, { waitUntil: 'load', timeout: 90000 }).catch(() => {}); await monta();
out.scene.push(await scena(p, 'home · primo avvio, prima del tocco'));
await p.mouse.click(VP === 'pc' ? 683 : 195, 60).catch(() => {}); await sleep(ATTESA);
out.scene.push(await scena(p, `home · primo avvio, ${ATTESA / 1000} s dopo il primo tocco`));
// 2. video intro (come il tasto «Rivedi intro»)
await p.evaluate(() => { try { AudioMgr.unlock(); } catch (_e) {} window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
await sleep(10000); out.scene.push(await scena(p, 'intro · 10 s'));
await sleep(10000); out.scene.push(await scena(p, 'intro · 20 s (chiusa da sola)'));
out.sw1 = await sw(p);
// 3. avvio successivo (stesso profilo)
await p.goto(URLG, { waitUntil: 'load', timeout: 90000 }).catch(() => {}); await monta();
await p.mouse.click(VP === 'pc' ? 683 : 195, 60).catch(() => {}); await sleep(ATTESA);
out.scene.push(await scena(p, `home · avvio successivo, ${ATTESA / 1000} s dopo il tocco`));
out.sw2 = await sw(p); out.errori = errs;
await b.close();
const tag = /github\.io/.test(URLG) ? 'sito' : 'locale';
fs.mkdirSync(path.join(QUI, 'out'), { recursive: true });
fs.writeFileSync(path.join(QUI, `out/misura-430-${VP}-${tag}.json`), JSON.stringify(out, null, 1));
console.log(`${URLG} · ${VP} · versione ${out.scene[0] && out.scene[0].versione}`);
for (const s of out.scene) {
  const o = s.o || { src: [] }; const vivi = o.src.filter(e => !e.finito);
  console.log(`— ${s.scena}: audio ${s.debug ? s.debug.ctx : '?'} · scena musica ${s.debug && s.debug.scena} · muto ${s.cfg && s.cfg.mute} · vol musica ${s.cfg && s.cfg.vol.music} · oscillatori totali ${o.osc} (ultimi 5 s ${o.oscUltimi5s}) · media ${o.media && o.media.length}`);
  const agg = {}; for (const e of o.src) { const k = e.file + (e.loop ? ' [loop]' : ''); agg[k] = (agg[k] || 0) + 1; }
  console.log('   partiti: ' + (Object.entries(agg).map(([k, n]) => `${k}×${n}`).join(' · ') || 'nessuno'));
  console.log('   in corso: ' + (vivi.map(e => `${e.file} ${e.dur}s${e.loop ? ' loop' : ''} g=${e.guadagno}`).join(' · ') || 'nessuno'));
}
console.log('service worker:', JSON.stringify(out.sw2));
if (errs.length) console.log('errori pagina:', errs.slice(0, 3).join(' | '));
