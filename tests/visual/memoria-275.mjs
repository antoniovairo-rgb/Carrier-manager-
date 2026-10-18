#!/usr/bin/env node
/* [giro 53 — PO-275] MEMORIA FRA DUE PARTITE NELLA STESSA PAGINA, con GC FORZATO (Chromium --js-flags=--expose-gc).
   Collaudo 7.999.171: heap 220→388 MB nel 1° provino e 507 MB all'inizio del 2° — senza GC forzato non si separa una perdita vera
   dalla spazzatura non ancora raccolta. Qui ad ogni tappa: gc() due volte, poi usedJSHeapSize e il CONTEGGIO degli oggetti vivi
   per prototipo (Runtime.queryObjects via CDP): Object3D, Mesh, SkinnedMesh, Texture, BufferGeometry, Material, AnimationMixer,
   WebGLRenderer, HTMLCanvasElement. Una perdita vera = il residuo dopo GC cresce da una partita all'altra.
   Uso: node memoria-275.mjs [--guardiano]  ·  CPM_ROSSO=__CPM_NO_X per il braccio rosso  ·  CPM_GLB=0 per GLB spento. */
import { chromium } from 'playwright';
import { startServer, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO || '', GLB = process.env.CPM_GLB !== '0', PARTITE = +(process.env.CPM_PARTITE275 || 2);
const srv = await startServer(); const port = srv.address().port;
const opts = { headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--js-flags=--expose-gc'] };
if (process.env.CPM_CHROME) opts.executablePath = process.env.CPM_CHROME;
const b = await chromium.launch(opts);
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => { /* [diagnosi] conta i callback rAF per sorgente: un ciclo di una partita smontata che gira ancora si vede qui */
  const raf = window.requestAnimationFrame.bind(window); window.__RAF275 = new Map();
  window.requestAnimationFrame = cb => { try { const k = String(cb).slice(0, 60); const m = window.__RAF275; const e = m.get(k) || { n: 0, fns: new WeakSet(), d: 0 }; e.n++; if (!e.fns.has(cb)) { e.fns.add(cb); e.d++; } m.set(k, e); } catch (e) {} return raf(cb); }; });
await page.addInitScript(([g, r]) => { window.__CPM_GLB = g; window.__CPM_PRESENT = 1; if (r) r.split('+').forEach(k => window[k] = 1); }, [GLB, ROSSO]);
const cdp = await ctx.newCDPSession(page);
const PROTO = { O3D: 'THREE.Object3D.prototype', Mesh: 'THREE.Mesh.prototype', Skin: 'THREE.SkinnedMesh.prototype', Tex: 'THREE.Texture.prototype', Geo: 'THREE.BufferGeometry.prototype', Mat: 'THREE.Material.prototype', Mix: 'THREE.AnimationMixer.prototype', Rend: 'THREE.WebGLRenderer.prototype', Canvas: 'HTMLCanvasElement.prototype', Scene: 'THREE.Scene.prototype' };
async function conta() {
  const o = {};
  for (const [k, expr] of Object.entries(PROTO)) {
    try { const p = await cdp.send('Runtime.evaluate', { expression: expr }); if (!p.result.objectId) { o[k] = null; continue; }
      const q = await cdp.send('Runtime.queryObjects', { prototypeObjectId: p.result.objectId });
      const n = await cdp.send('Runtime.callFunctionOn', { objectId: q.objects.objectId, functionDeclaration: 'function(){return this.length;}', returnByValue: true });
      o[k] = n.result.value; await cdp.send('Runtime.releaseObject', { objectId: q.objects.objectId }); await cdp.send('Runtime.releaseObject', { objectId: p.result.objectId });
    } catch (e) { o[k] = 'err'; }
  }
  return o;
}
async function tappa(nome) {
  const pre = await page.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1e6));
  await page.evaluate(async () => { for (let i = 0; i < 3; i++) { window.gc(); await new Promise(r => setTimeout(r, 200)); } });
  await sleep(500); await page.evaluate(() => window.gc());
  const post = await page.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1e6));
  const c = await conta();
  const r = { nome, pre, post, ...c }; console.log(JSON.stringify(r)); return r;
}
const fase = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const T = [];
await openMatch(page, port, { skipLoadAll: true, name: 'Memoria' });
T.push(await tappa('avvio-1'));
for (let g = 0; g < PARTITE; g++) {
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 555 + g * 99);
  const t0 = Date.now(); let p = null;
  while (Date.now() - t0 < 420000) { await sleep(700); p = await fase(); if (p === 'ended' || p === 'ceremony') break; }
  T.push(await tappa(`fine-${g + 1} (${p})`));
  if (g === PARTITE - 1) break;
  let ok = false;
  for (let k = 0; k < 14 && !ok; k++) {
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Risultati provino|Vai al Provino|Prossimo|Continua|Inizia il provino|Gioca/i.test(b.textContent || '')); if (x) x.click(); });
    await sleep(2500); const f = await fase(); if (f === 'playing' || f === 'walkout' || f === 'matchday') ok = true;
  }
  await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function' && window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 120000 }).catch(() => {});
  T.push(await tappa(`avvio-${g + 2}`));
  if (process.env.CPM_PULISCI275) { /* esperimento: chi trattiene la partita vecchia? si tolgono gli agganci di collaudo e si rimisura */
    const n = await page.evaluate(re => { let k = 0; for (const key of Object.keys(window)) if (new RegExp(re).test(key) && typeof window[key] === 'function') { try { delete window[key]; k++; } catch (e) {} } return k; }, process.env.CPM_PULISCI275);
    console.log('agganci tolti', n); T.push(await tappa(`avvio-${g + 2}-senza-agganci`)); }
  if (process.env.CPM_DIAG275) {
    const r2 = await page.evaluate(async () => { const m = window.__RAF275; const prima = new Map([...m].map(([k, e]) => [k, e.n])); await new Promise(r => setTimeout(r, 3000));
      const giri = [...m].map(([k, e]) => ({ k, n3s: e.n - (prima.get(k) || 0), funzioniDistinte: e.d })).filter(x => x.n3s > 0);
      const cv = [...document.querySelectorAll('canvas')].map(c => ({ w: c.width, h: c.height, vis: !!c.offsetParent, gl: !!(c.getContext && (c.__gl || null)) }));
      return { giri, canvasNelDom: cv }; });
    console.log('rAF attivi (3 s):', JSON.stringify(r2.giri)); console.log('canvas nel DOM:', JSON.stringify(r2.canvasNelDom));
 /* chi della cache GLB ha un genitore (o un antenato) in una scena? */
    const r = await page.evaluate(async () => { const out = []; for (const [u, pr] of Object.entries(_glbCache)) { let g = null; try { g = await pr; } catch (e) {} if (!g || !g.scene) continue;
        let n = g.scene, d = 0; while (n.parent) { n = n.parent; d++; } const sub = []; g.scene.traverse(o => { if (o !== g.scene && o.parent && o.parent !== g.scene && !g.scene.getObjectById(o.parent.id)) sub.push(o.name); });
        out.push({ u: u.slice(-40), radice: n === g.scene ? 'se stesso' : (n.isScene ? 'SCENA ' + n.uuid.slice(0, 6) : n.type), d, figli: g.scene.children.length }); }
      return out; });
    console.log('cache GLB:', JSON.stringify(r.filter(x => x.radice !== 'se stesso')), 'in tutto', r.length);
  }
  if (process.env.CPM_BISEZIONE275) { /* esperimento: proprieta' NON standard di window, per gradi */
    for (const [tag, re] of [['underscore', '^_'], ['tutte', '.']]) {
      const n = await page.evaluate(re => { const f = document.createElement('iframe'); document.body.appendChild(f); const std = new Set(Object.getOwnPropertyNames(f.contentWindow)); f.remove();
        let k = 0; const nomi = []; for (const key of Object.getOwnPropertyNames(window)) { if (std.has(key) || !new RegExp(re).test(key)) continue; try { window[key] = null; delete window[key]; k++; nomi.push(key); } catch (e) {} } return { k, nomi: nomi.filter(x => !/^__CPM_/.test(x)).slice(0, 80) }; }, re);
      console.log('tolte', tag, n.k, JSON.stringify(n.nomi)); T.push(await tappa(`avvio-2-senza-${tag}`)); }
  }
  if (process.env.CPM_VIAHOOK275) { /* tutti gli agganci di collaudo window.__CPM* (funzioni E oggetti): quello che resta e' produzione */
    const n = await page.evaluate(() => { let k = 0; for (const key of Object.getOwnPropertyNames(window)) if (/^__CPM/.test(key)) { try { window[key] = null; delete window[key]; k++; } catch (e) {} } return k; });
    console.log('agganci __CPM* tolti', n); T.push(await tappa('avvio-2-senza-__CPM')); }
  if (process.env.CPM_SNAP275) { await page.evaluate(() => window.gc()); const ws = (await import('fs')).createWriteStream(process.env.CPM_SNAP275);
    cdp.on('HeapProfiler.addHeapSnapshotChunk', e => ws.write(e.chunk)); await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false }); await new Promise(r => ws.end(r)); console.log('snapshot scritto', process.env.CPM_SNAP275); }
  if (process.env.CPM_STOP275) break;
}
console.log('pageerror', errs.length, errs.slice(0, 2));
const a1 = T.find(t => t.nome === 'avvio-1'), a2 = T.find(t => t.nome === 'avvio-2');
if (a1 && a2) console.log(`RESIDUO dopo GC: avvio-1 ${a1.post} MB → avvio-2 ${a2.post} MB (Δ ${a2.post - a1.post}) · Object3D ${a1.O3D}→${a2.O3D} · Texture ${a1.Tex}→${a2.Tex} · Geo ${a1.Geo}→${a2.Geo} · Renderer ${a1.Rend}→${a2.Rend} · Mixer ${a1.Mix}→${a2.Mix}`);
/* GIUDIZIO (giro 53): si giudica la tappa «avvio-2-senza-__CPM» — tolti gli agganci di collaudo window.__CPM*, che sotto ?cpmtest=1
   trattengono da soli la partita vecchia (misurato: ~40 chiusure a GLB acceso) e in produzione non esistono. Verde = all'avvio della
   2ª partita vive UNA scena e lo stesso numero di corpi animati della 1ª. Rosso (__CPM_NO_MEM275) = la scena vecchia resta. */
if (process.argv.includes('--guardiano')) {
  const g = T.find(t => t.nome === 'avvio-2-senza-__CPM');
  if (!a1 || !g) { console.log('❌ sonda cieca: tappa senza agganci non raggiunta (serve CPM_VIAHOOK275=1)'); await b.close(); srv.close(); process.exit(2); }
  const ok = ROSSO ? g.Scene >= 2 : (g.Scene === 1 && g.Skin <= a1.Skin * 1.05 && g.Rend <= a1.Rend);
  console.log(`${ok ? '✅' : '❌'} ${ROSSO ? (ok ? 'ROSSO come atteso' : 'il rosso non riproduce') : (ok ? 'PASS memoria-275' : 'FAIL memoria-275')}: scene ${g.Scene} · renderer ${a1.Rend}→${g.Rend} · corpi animati ${a1.Skin}→${g.Skin} · heap dopo GC ${g.post} MB`);
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
}
await b.close(); srv.close();
