/* diagnostica (giro 219): chi alloca la memoria che poi il GC deve raccogliere, dal clic su «Gioca» alla fine dell'ingresso */
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166 } from './lib/partita-166.mjs';
const init = { __CPM_PRESENT: 1, __CPM_WALKTEST74: 1, __CPM_T196ON: 1, __CPM_TOD: 'night' }; for (const k of (process.env.INIT || '').split(',').filter(Boolean)) init[k] = 1;
const A = await apriCarriera166({ vp: { width: 375, height: 667 }, mobile: true, init, glb: true, nome: 'Profilo Tocco' }); const p = A.page; const cdp = await A.ctx.newCDPSession(p);
const fase = () => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const heap = () => p.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1048576));
await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.startSampling', { samplingInterval: 65536, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
console.log('heap prima ' + await heap());
await apriPrompt166(p);
await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (b) b.click(); });
const t0 = Date.now(); let last = null, hmax = 0;
while (Date.now() - t0 < 300000) { const f = await fase(); const h = await heap().catch(() => 0); hmax = Math.max(hmax, h); if (f !== last) { console.log(((Date.now() - t0) / 1000).toFixed(1) + 's fase ' + f + ' heap ' + h); last = f; } if (f === 'playing') break;
  await p.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {} const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Vedi le formazioni|Ingresso in campo|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok|Siamo pronti)/i.test((x.textContent || '').trim()) && !/Salta/i.test(x.textContent || '')); if (B.length) B[B.length - 1].click(); }).catch(() => {});
  await sleep(400); }
const { profile } = await cdp.send('HeapProfiler.stopSampling'); console.log('heap max ' + hmax + ' · fine ' + await heap());
const tot = {}; let T = 0; const giro = (n, pila) => { const nm = n.callFrame.functionName || '(anonima)'; const P = nm.startsWith('(') ? pila : pila.concat(nm + (/three/i.test(n.callFrame.url) ? '³' : /GLTF/i.test(n.callFrame.url) ? 'ᵍ' : '')); if (n.selfSize) { const k = P.slice(0, 2).concat(P.length > 4 ? ['…'] : [], P.slice(Math.max(2, P.length - 2))).join(' > ') || '(anonime)'; tot[k] = (tot[k] || 0) + n.selfSize; T += n.selfSize; } for (const c of n.children || []) giro(c, P); };
giro(profile.head, []); console.log('allocato in tutto (campionato) ' + Math.round(T / 1048576) + ' MB');
for (const [k, v] of Object.entries(tot).sort((a, b) => b[1] - a[1]).slice(0, 22)) console.log('  ' + String(Math.round(v / 1048576)).padStart(5) + ' MB  ' + k);
const pr = await p.evaluate(() => { try { const L = window.__CPM_PROGS16() || []; const o = {}; for (const x of L) { const K = x.k.split(','); const i = K.indexOf('highp'); const e = K[i + 3]; o[e] = (o[e] || 0) + 1; } return { n: L.length, perCodifica: o, pre: window.__CPM_PRECOMP769, prova: window.__CPM_PROVA16 }; } catch (e) { return String(e); } }); console.log('programmi ' + JSON.stringify(pr));
await A.b.close(); A.srv.close();
