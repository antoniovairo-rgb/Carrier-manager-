#!/usr/bin/env node
/* [giro 256 · seguito di PO-499] SONDA del saluto della serata, una clip Rohr alla volta: come misura-240.mjs (braccio destro e due braccia
   per fotogramma, chiamato del battito 3) piu' lo scarto geometrico dal piano della cerniera per lato, gli scatti di orientazione fra un
   fotogramma e l'altro e le velocita' separate fra rampa (tratto calcolato) e clip a peso pieno.
   Uso: node misura-256.mjs [clip] [--rosso] [--foto prefisso]   (--rosso = window.__CPM_NO_G256: la clip forzata resta grezza)
   Strumento di misura, non guardiano (il guardiano e' presentazione-225). */
import { scatti256, velocita256, provaScatti256 } from './lib/saluto-256.mjs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g256', { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const args = process.argv.slice(2), rosso = args.includes('--rosso'), fi = args.indexOf('--foto'), FOTO = fi >= 0 ? args[fi + 1] : '', clip = args.find((a, k) => !a.startsWith('--') && (fi < 0 || k !== fi + 1)) || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage(); const err = []; p.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
await p.addInitScript(([o, r, c]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G256 = 1; if (c) window.__CPM_CLIP240 = c; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, rosso, clip]);
await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
const beat = async (n) => { await p.evaluate(x => window.__CPM_CAREER.apriPresentazione(x), n); await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2 && window.__CPM_PRES142.cam, null, { timeout: 90000 }); };
await beat(1); await sleep(2600); await beat(3);
const info = await p.evaluate(() => window.__CPM_PRES142.clip240 ? window.__CPM_PRES142.clip240() : null);
const foto = FOTO ? (async () => { const st = () => p.evaluate(() => { const P = window.__CPM_PRES142, m = P.men[P.pi144]; return m ? { w: P.w144 || 0, t: P.ts240 || 0 } : null; }).catch(() => null);
  for (const tt of [0.4, 0.8, 1.2, 1.7, 2.1]) { for (let k = 0; k < 600; k++) { const x = await st(); if (x && x.w > 0.3 && x.t >= tt) break; if (x && x.t > tt + 0.6) break; await sleep(40); } await p.screenshot({ path: `${FOTO}-t${String(tt).replace('.', '')}.png` }); } })() : null;
const S = await p.evaluate(async () => { const P = window.__CPM_PRES142; const S = []; const t0 = performance.now(); let visto = false, fuori = false;
  while (performance.now() - t0 < 150000) { await new Promise(r => requestAnimationFrame(r)); const i = P.pi144; if (i == null || i < 0) continue; const m = P.men[i];
    S.push({ t: P.t144, w: P.w144 || 0, ts: P.ts240 || 0, z: m.position.z, br: P.braccio(i), mn: P.mani240 ? P.mani240(i) : null, or: P.orient256 ? P.orient256(i) : null });
    const z = m.position.z; if (z > 6.5) visto = true; if (visto && z < 6.02 && (P.t144 || 0) > 3) { if (fuori) break; fuori = true; } if ((P.t144 || 0) > 16) break; }
  return S; });
if (foto) await foto;
await b.close(); srv.close();
const B = S.filter(s => s.br && s.w > 0.02), mm = (f, A = B) => { const v = A.map(f).filter(x => x != null); return v.length ? [+Math.min(...v).toFixed(3), +Math.max(...v).toFixed(3)] : null; };
const G = 180 / Math.PI, ang = (a, c) => Math.acos(Math.max(-1, Math.min(1, a[0] * c[0] + a[1] * c[1] + a[2] * c[2]))) * G; let vU = 0, vF = 0, j = 0, tU = 0, tF = 0; const A = S.filter(s => s.br);
for (let k = 1; k < A.length; k++) { while (j + 1 < k && A[k].t - A[j + 1].t >= 0.10) j++; const dw = A[k].t - A[j].t; if (!(dw >= 0.10) || dw > 0.3) continue; const a = ang(A[k].br.dU, A[j].br.dU) / dw, c = ang(A[k].br.dF, A[j].br.dF) / dw; if (a > vU) { vU = a; tU = A[k].ts; } if (c > vF) { vF = c; tF = A[k].ts; } }
const dur = B.length ? B[B.length - 1].t - B[0].t : 0, scena = S.length ? S[S.length - 1].t - S[0].t : 0;
const pieno = B.filter(s => s.w >= 0.5 && s.or);
const out = { clip: info, rosso, piano: pieno.length ? { l: mm(s => s.or.piano_l, pieno), r: mm(s => s.or.piano_r, pieno) } : null, scatti: scatti256(S), provaScatti: provaScatti256(S), vel: velocita256(S), campioni: S.length, saluto_s: +dur.toFixed(2), scena_s: +scena.toFixed(2), err,
  destro: { gomito: mm(s => s.br.gomito), elev: mm(s => s.br.elev), fuori: mm(s => s.br.fuori, B.filter(s => s.w >= 0.5)), polso: mm(s => s.br.polso), manoLato: mm(s => s.br.manoLato), busto: mm(s => s.br.busto), manoSu: mm(s => s.br.manoSu), pron: mm(s => s.br.pron), devia: mm(s => s.br.devia), velOmero: +vU.toFixed(0), velAvambraccio: +vF.toFixed(0), tVelOmero: +tU.toFixed(2), tVelAvambraccio: +tF.toFixed(2), tPolsoMax: (B.slice().sort((x, y) => y.br.polso - x.br.polso)[0] || {}).ts, sopra15: +B.reduce((a, s, k) => a + (k && s.br.manoSu >= 0.15 ? s.t - B[k - 1].t : 0), 0).toFixed(2) },
  due: B[0] && B[0].mn ? { mani: mm(s => s.mn.mani), polsi: mm(s => s.mn.polsi), busto_l: mm(s => s.mn.busto_l), busto_r: mm(s => s.mn.busto_r), testa_l: mm(s => s.mn.testa_l), testa_r: mm(s => s.mn.testa_r), su_l: mm(s => s.mn.su_l), su_r: mm(s => s.mn.su_r) } : null,
  traccia: B.filter((_, k) => k % Math.max(1, Math.floor(B.length / 28)) === 0).map(s => [+s.ts.toFixed(2), +s.w.toFixed(2), s.mn ? s.mn.mani : null, s.mn ? s.mn.su_l : null, s.mn ? s.mn.su_r : null, s.br.gomito, s.br.fuori, s.br.pron, s.br.devia, s.br.polso]) };
if (process.env.CPM_TRACCIA) { const aq = (a, c) => 2 * Math.acos(Math.min(1, Math.abs(a[0] * c[0] + a[1] * c[1] + a[2] * c[2] + a[3] * c[3]))) * 180 / Math.PI; const A = S.filter(s => s.or && s.w > 0.02); out.tracciaOr = A.slice(1).map((s, k) => { const dt = s.t - A[k].t; return [+s.ts.toFixed(2), +dt.toFixed(3), ...['u_l', 'u_r', 'f_l', 'f_r'].map(o => Math.round(aq(s.or[o], A[k].or[o]) / dt)), s.br.gomito]; }); }
fs.writeFileSync(`out/g256/misura-saluto${rosso ? '-rosso' : ''}${clip ? '-' + clip : ''}.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
