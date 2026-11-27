#!/usr/bin/env node
/* [giro 430 · PO-692, decisione PO 27/11: brano A] GUARDIANO NON-gate musica-avvio-430 — schermata iniziale e video intro suonano il
   brano A («Determined Pursuit (Epic Orchestra Loop)», Emma_MA, CC0) e solo lui come musica.
   Banco (?cpmtest=1) col gancio di collaudo window.__CPM_AUDIO430: l'AudioMgr non e' muto per costruzione, quindi si misurano i NODI VERI
   (AudioBufferSourceNode.start · OscillatorNode.start · HTMLMediaElement.play agganciati, buffer legato al file da cui e' stato decodificato,
   guadagno effettivo = prodotto dei GainNode fino all'uscita). Telefono 390×844.
     1. home, dopo il primo tocco: in corso UNA sola musica, il file 429-a-orchestra, in loop; nessun altro file music/*, nessun HTMLAudio,
        nessun loop generato (il brusio sintetico non c'e' piu'); guadagno = volume musica × 0,55 (±10%);
     2. dissolvenza in entrata: il primo guadagno campionato dopo l'avvio e' sotto meta' di quello finale e poi sale;
     3. loop senza scatto: sul buffer che suona, salto fine→inizio <= 99° percentile dei passi fra campioni vicini;
     4. video intro (riascolto): la stessa sorgente continua (non riparte), nessun'altra musica, gli effetti di _S13 (fischio, calcio,
        rete, folla) suonano e la musica sta sotto il boato;
     5. uscita: in carriera e in partita la sorgente si ferma in dissolvenza (guadagno a meta' strada, poi finita); fuori dalla partita torna;
     6. muto delle Opzioni (cpm-audio mute:true): ogni nodo partito ha guadagno effettivo 0 dal primo suono;
     7. volume musica 0,6 rispettato dal primo suono (guadagno 0,33 ±10%); musica spenta (on.music false): nessuna musica parte.
   Bracci: VERDE deve passare; ROSSO (window.__CPM_NO_G430 = la 7.999.217) deve CADERE su 1. «Non giudicato» (pagina che non monta,
   audio mai pronto, gancio assente) = rosso. Verde e rosso stampati per ultimi. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser, startServer, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const A = 'music/menu/429-a-orchestra';

const AGGANCIO = () => {
  if (window.__A430) return; const L = window.__A430 = { t0: performance.now(), src: [], osc: 0, media: [] };
  const url = new WeakMap(), bufUrl = new WeakMap(), edges = new WeakMap();
  const of = window.fetch; window.fetch = function (i) { const u = String((i && i.url) || i); return of.apply(this, arguments).then(r => { try { const ab = r.arrayBuffer.bind(r); r.arrayBuffer = () => ab().then(b => { try { url.set(b, u); } catch (_e) {} return b; }); } catch (_e) {} return r; }); };
  const D = BaseAudioContext.prototype.decodeAudioData; BaseAudioContext.prototype.decodeAudioData = function (ab, ...x) { const u = url.get(ab); const p = D.call(this, ab, ...x); if (p && p.then) p.then(b => { if (u && b) bufUrl.set(b, u); }).catch(() => {}); return p; };
  const C = AudioNode.prototype.connect; AudioNode.prototype.connect = function (d, ...x) { try { if (d instanceof AudioNode) { const a = edges.get(this) || []; a.push(d); edges.set(this, a); } } catch (_e) {} return C.call(this, d, ...x); };
  const S = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...x) { try { const b = this.buffer; const e = { id: L.src.length, t: Math.round(performance.now() - L.t0), file: (b && bufUrl.get(b)) || null, dur: b ? +b.duration.toFixed(2) : 0, loop: !!this.loop, finito: false, node: this };
      this.addEventListener('ended', () => { e.finito = true; }); L.src.push(e); } catch (_e) {} return S.apply(this, x); };
  const O = OscillatorNode.prototype.start; OscillatorNode.prototype.start = function (...x) { L.osc++; return O.apply(this, x); };
  const P = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { L.media.push(this.currentSrc || this.src); return P.apply(this, arguments); };
  const guad = (n, seen) => { if (n instanceof AudioDestinationNode) return 1; if (seen.has(n)) return 0; seen.add(n); let m = 0;
    for (const d of edges.get(n) || []) { const g = guad(d, seen); if (g > m) m = g; } seen.delete(n); return m * (n instanceof GainNode ? n.gain.value : 1); };
  window.__A430R = () => ({ osc: L.osc, media: L.media.slice(), src: L.src.map(e => ({ id: e.id, t: e.t, file: e.file ? e.file.replace(/^.*assets\/audio\//, '').replace(/\.(ogg|mp3|wav)$/, '') : null,
    dur: e.dur, loop: e.loop, finito: e.finito, g: e.finito ? 0 : +guad(e.node, new Set()).toFixed(4) })) });
  window.__A430J = (id) => { const e = L.src[id]; const b = e && e.node.buffer; if (!b) return null; const N = b.length, ch = []; for (let c = 0; c < b.numberOfChannels; c++) ch.push(b.getChannelData(c));
    const H = new Uint32Array(4096), top = 0.5; for (let i = 1; i < N; i++) { let s = 0; for (const d of ch) { const v = Math.abs(d[i] - d[i - 1]); if (v > s) s = v; } H[Math.min(4095, Math.floor(s / top * 4096))]++; }
    let acc = 0, p99 = top; for (let k = 0; k < 4096; k++) { acc += H[k]; if (acc >= 0.99 * (N - 1)) { p99 = (k + 1) / 4096 * top; break; } }
    let salto = 0; for (const d of ch) salto = Math.max(salto, Math.abs(d[0] - d[N - 1])); return { salto, p99, durata: b.duration }; };
};

const srv = await startServer(); const PORT = srv.address().port;
const b = await launchBrowser();
async function pagina({ rosso = false, cfg = null } = {}) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(([r, c]) => { window.__CPM_AUDIO430 = true; if (r) window.__CPM_NO_G430 = true; try { localStorage.setItem('cpm-intro-seen', '1'); if (c) localStorage.setItem('cpm-audio', JSON.stringify(c)); } catch (_e) {} }, [rosso, cfg]);
  await ctx.addInitScript(AGGANCIO);
  const p = await ctx.newPage(); await installCdnRoutes(p); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.goto(`http://localhost:${PORT}/?cpmtest=1`, { waitUntil: 'load', timeout: 90000 }).catch(() => {});
  const monta = await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0 && typeof window.__A430R === 'function'; }, null, { timeout: 60000 }).then(() => true).catch(() => false);
  await sleep(800); await p.mouse.click(195, 60).catch(() => {});
  return { ctx, p, monta, errs };
}
const R = (p) => p.evaluate(() => window.__A430R()).catch(() => null);
const vivaMusica = (r) => r ? r.src.filter(e => !e.finito && (e.loop || e.dur >= 20)) : [];
async function aspetta(p, f, ms = 25000) { const t0 = Date.now(); let r = null; while (Date.now() - t0 < ms) { r = await R(p); if (r && f(r)) return r; await sleep(150); } return r; }

async function braccio(rosso) {
  const passi = []; const ok = (nome, c, info) => passi.push({ nome, ok: !!c, info });
  /* 1-5 su una pagina sola */
  {
    const { ctx, p, monta, errs } = await pagina({ rosso });
    const rA = await aspetta(p, r => r.src.some(e => e.file === A && !e.finito));
    const curva = []; const sA = rA && rA.src.find(e => e.file === A && !e.finito);
    if (sA) for (let i = 0; i < 12; i++) { const r = await R(p); const e = r && r.src.find(x => x.id === sA.id); curva.push(e ? e.g : null); await sleep(250); }
    await sleep(1500); const r1 = await R(p); const m1 = vivaMusica(r1);
    const vol = await p.evaluate(() => { try { return AudioMgr.getCfg().vol.music; } catch (_e) { return null; } }).catch(() => null);
    const atteso = vol != null ? vol * 0.55 : null; const altriMusic = r1 ? r1.src.filter(e => e.file && /^music\//.test(e.file) && e.file !== A) : [];
    const gen = r1 ? r1.src.filter(e => !e.file && e.loop && !e.finito) : [];
    ok('1 home: suona solo A, in loop, al volume della musica', monta && m1.length === 1 && m1[0].file === A && m1[0].loop && atteso && Math.abs(m1[0].g - atteso) <= atteso * 0.1
      && !altriMusic.length && !gen.length && r1.media.length === 0 && errs.length === 0,
      `musiche in corso ${JSON.stringify(m1.map(e => `${e.file} ${e.dur}s loop=${e.loop} g=${e.g}`))} · atteso g=${atteso && atteso.toFixed(3)} · altri music/* ${altriMusic.length} · loop generati ${gen.length} · HTMLAudio ${r1 ? r1.media.length : '?'} · errori ${errs.length}`);
    const fin = m1[0] && m1[0].g; const prima = curva.find(x => x != null);
    ok('2 dissolvenza in entrata', sA && fin > 0 && prima != null && prima < fin * 0.5 && curva.filter(x => x != null).some(x => x > prima * 2), `guadagno ogni 250 ms dall'avvio: ${curva.map(x => x == null ? '—' : x.toFixed(3)).join(' ')}`);
    const J = sA ? await p.evaluate((id) => window.__A430J(id), sA.id).catch(() => null) : null;
    ok('3 loop senza scatto', J && J.salto <= J.p99 && J.durata >= 45, J ? `salto ${J.salto.toFixed(4)} <= p99 ${J.p99.toFixed(4)} · durata ${J.durata.toFixed(2)} s` : 'buffer assente');
    // 4. intro
    const n0 = r1 ? r1.src.length : 0;
    await p.evaluate(() => window.dispatchEvent(new CustomEvent('cpm-replay-intro'))).catch(() => {});
    const rI = await aspetta(p, r => r.src.slice(n0).some(e => /crowd\/(boato|esulta)/.test(e.file || '') && !e.finito), 40000);
    const nuovi = rI ? rI.src.slice(n0) : []; const mI = vivaMusica(rI); const boato = nuovi.find(e => /crowd\/(boato|esulta)/.test(e.file || '') && !e.finito);
    const fx = ['referee/fischio', 'ball/calcio', 'ball/rete', 'crowd/'].map(k => nuovi.some(e => (e.file || '').indexOf(k) >= 0));
    const altriI = nuovi.filter(e => e.file && /^music\//.test(e.file));
    ok('4 intro: A continua sotto gli effetti, nessun\'altra musica', sA && mI.length === 1 && mI[0].id === sA.id && fx.every(Boolean) && !altriI.length && boato && mI[0].g < boato.g,
      `musica ${JSON.stringify(mI.map(e => `#${e.id} ${e.file} g=${e.g}`))} (sorgente della home #${sA && sA.id}) · effetti fischio/calcio/rete/folla ${fx.join('/')} · boato g=${boato && boato.g} · nuove music/* ${altriI.length}`);
    await sleep(22000); // l'intro si chiude da sola
    // 5. uscita
    const esci = async (fn) => { const r0 = vivaMusica(await R(p)).filter(e => e.file === A); await p.evaluate(fn).catch(() => {}); await sleep(250); const r1 = await R(p); const m = r0[0] && r1.src.find(e => e.id === r0[0].id);
      await sleep(1600); const r2 = await R(p); const m2 = r0[0] && r2.src.find(e => e.id === r0[0].id); return { prima: r0[0] && r0[0].g, mezzo: m && m.g, finito: m2 && m2.finito, file: r0[0] && r0[0].file }; };
    const c = await esci(() => AudioMgr.scene('career'));
    await p.evaluate(() => AudioMgr.scene('home')).catch(() => {}); const tornata = await aspetta(p, r => vivaMusica(r).some(e => e.file === A), 5000);
    const m = await esci(() => AudioMgr.enterMatch(7));
    await p.evaluate(() => AudioMgr.exitMatch()).catch(() => {}); const dopo = await aspetta(p, r => vivaMusica(r).some(e => e.file === A), 5000);
    const fade = (x) => x.file === A && x.prima > 0 && x.mezzo > 0 && x.mezzo < x.prima && x.finito;
    ok('5 si ferma in dissolvenza entrando in carriera e in partita, poi torna', fade(c) && fade(m) && tornata && vivaMusica(tornata).some(e => e.file === A) && dopo && vivaMusica(dopo).some(e => e.file === A),
      `carriera ${JSON.stringify(c)} · partita ${JSON.stringify(m)} · torna in home ${!!(tornata && vivaMusica(tornata).some(e => e.file === A))} · torna dopo la partita ${!!(dopo && vivaMusica(dopo).some(e => e.file === A))}`);
    await ctx.close();
  }
  /* 6. muto */
  {
    const { ctx, p, monta } = await pagina({ rosso, cfg: { mute: true } });
    await sleep(6000); await p.evaluate(() => { window.dispatchEvent(new CustomEvent('cpm-replay-intro')); }).catch(() => {}); await sleep(14000);
    const r = await R(p); const sonori = r ? r.src.filter(e => !e.finito && e.g > 0) : null;
    const partiti = r ? r.src.length : 0; const music = r ? r.src.some(e => e.file === A) : false;
    ok('6 muto: nessun nodo udibile dal primo suono', monta && r && partiti > 0 && sonori.length === 0 && (rosso || music), `nodi partiti ${partiti} (A fra questi: ${music}) · udibili ${sonori ? sonori.length : '?'}`);
    await ctx.close();
  }
  /* 7. volume e musica spenta */
  {
    const { ctx, p } = await pagina({ rosso, cfg: { vol: { music: 0.6 } } });
    const r = await aspetta(p, r => vivaMusica(r).some(e => e.file === A), 20000); await sleep(3500); const m = vivaMusica(await R(p));
    const { ctx: c2, p: p2 } = await pagina({ rosso, cfg: { on: { music: false } } }); await sleep(12000); const r2 = await R(p2);
    const spenta = r2 ? r2.src.filter(e => e.file && /^music\//.test(e.file)).length : -1;
    ok('7 volume musica 0,6 rispettato e musica spenta rispettata', m.length === 1 && m[0].file === A && Math.abs(m[0].g - 0.33) <= 0.033 && r2 && spenta === 0,
      `vol 0,6: ${JSON.stringify(m.map(e => `${e.file} g=${e.g}`))} (atteso 0,33) · musica spenta: file music/* partiti ${spenta}`);
    await ctx.close(); await c2.close();
  }
  return passi;
}
const V = await braccio(false), RO = await braccio(true);
await b.close(); srv.close();
fs.mkdirSync(path.join(QUI, 'out'), { recursive: true });
fs.writeFileSync(path.join(QUI, 'out/musica-avvio-430.json'), JSON.stringify({ verde: V, rosso: RO }, null, 1));
const stampa = (t, L) => { console.log(t); for (const x of L) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`); };
stampa('VERDE', V); stampa('ROSSO (__CPM_NO_G430 = 7.999.217)', RO);
const vOk = V.length === 7 && V.every(x => x.ok), rCade = RO.some(x => /^1 /.test(x.nome) && !x.ok);
const motivi = []; if (!vOk) motivi.push('verde rosso'); if (!rCade) motivi.push('il rosso NON cade sulla 1');
if (motivi.length) { console.log('❌ musica-avvio-430 — ' + motivi.join(' · ')); process.exit(1); }
console.log('✅ musica-avvio-430 verde (e il rosso __CPM_NO_G430 cade: home senza il brano A)');
