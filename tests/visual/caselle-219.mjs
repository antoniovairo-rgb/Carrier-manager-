#!/usr/bin/env node
/* [giro 219] VERIFICA (non guardiano): il caricatore lento delle texture (src/12, _SLOT219) legge solo le caselle note di un materiale
   invece di elencarne tutte le proprieta'. Qui, sulla scena vera (ingresso, partita, premiazione, corpi 3D accesi), si elencano le
   proprieta' di OGNI materiale e si cercano texture fuori dalle caselle note: devono essere zero, altrimenti il caricatore le salterebbe.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node caselle-219.mjs */
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const SLOT = ['map', 'alphaMap', 'normalMap', 'emissiveMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap', 'specularMap', 'lightMap', 'envMap', 'gradientMap', 'displacementMap', 'matcap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap', 'transmissionMap'];
const A = await apriCarriera166({ vp: { width: 1366, height: 768 }, init: { __CPM_PRESENT: 1, __CPM_WALKTEST74: 1, __CPM_T196ON: 1, __CPM_TOD: 'night' }, glb: true, nome: 'Caselle' }); const p = A.page;
const fase = () => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const conta = (et) => p.evaluate(({ SLOT, et }) => { const T = window.__CPM3D; if (!T || !T.scene) return { et, errore: 'scena non esposta (__CPM3D)' }; const S = new Set(SLOT); let mat = 0, tex = 0; const fuori = {}; const visti = new Set();
  T.scene.traverse(o => { const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of mm) { if (visti.has(m)) continue; visti.add(m); mat++; for (const k in m) { const t = m[k]; if (t && t.isTexture) { tex++; if (!S.has(k)) fuori[k + ' (' + m.type + ')'] = (fuori[k + ' (' + m.type + ')'] || 0) + 1; } } } });
  return { et, materiali: mat, texture: tex, fuoriCasella: fuori, nonCaricate: (window.__CPM_TEXNEW16 ? window.__CPM_TEXNEW16().filter(x => x.w).length : null) }; }, { SLOT, et });
await apriPrompt166(p);
await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (b) b.click(); });
const R = []; let fatto = false;
for (let i = 0; i < 700; i++) { const f = await fase(); if (f === 'playing') break;
  if (f === 'walkout') { const pr = await p.evaluate(() => { try { return !!window.__CPM_PRONTI196().pronti && !window.__CPM_ATT196; } catch (e) { return false; } }); if (pr && !fatto) { fatto = true; await sleep(3000); R.push(await conta('ingresso')); await p.evaluate(() => { const b = document.querySelector('[data-cpm="salta-ingresso-v2"]'); if (b) b.click(); }); } }
  else await p.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Vedi le formazioni|Gioca la partita|Ingresso in campo|Continua|Avanti|Siamo pronti)/i.test((x.textContent || '').trim()) && !/Salta/i.test(x.textContent || '')); if (B.length) B[B.length - 1].click(); });
  await sleep(500); }
await sleep(8000); R.push(await conta('partita'));
await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI!', kind: 'league' })); await sleep(9000); R.push(await conta('premiazione'));
await A.b.close(); A.srv.close();
let ko = 0; for (const r of R) { console.log(JSON.stringify(r)); if (r.errore || !r.materiali || Object.keys(r.fuoriCasella || {}).length) ko++; }
if (R.length < 3) ko++;
console.log(ko ? '❌ caselle-219: texture fuori dalle caselle note (o scena non letta)' : '✅ caselle-219: nessuna texture fuori dalle caselle lette dal caricatore, in ingresso, partita e premiazione'); process.exit(ko ? 1 : 0);
