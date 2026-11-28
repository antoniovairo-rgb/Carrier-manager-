#!/usr/bin/env node
/* [giro 443] sonda: suola dell'eroe e dei compagni durante l'ingresso in campo, nello STESSO fotogramma, verde e rosso __CPM_NO_G431. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g431', { recursive: true });
const SOLO = (process.env.CPM_SOLO || 'verde,rosso').split(','), MISURA = !!process.env.CPM_MISURA, FOTO = !!process.env.CPM_FOTO;
const SCENE_HL = [3, 50, 101, 133];
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const FOTODIR = new URL('../../docs/collaudo-po/', import.meta.url).pathname;

async function pagina(flags, vp) {
  const ctx = await b.newContext({ viewport: vp || { width: 800, height: 450 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage(); const err = [];
  p.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
  await p.addInitScript(([o, f]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'night'; for (const k of f) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, flags]);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return { ctx, p, err };
}
/* lettura nel gioco: un record per corpo con testimone alt431 (sorgente: scena intera della partita, o la lista dei corpi della cerimonia) */
const leggi = (p, sorg) => p.evaluate((sorg) => { const T = THREE, v = new T.Vector3(), out = [];
  let corpi = [];
  if (sorg === 'partita') { const S = window.__CPM3D && window.__CPM3D.scene; if (!S) return null; S.updateMatrixWorld(true); S.traverseVisible(o => { if (o.userData && o.userData.alt431) corpi.push(o); }); }
  else { const L = sorg === 'serata' ? (window.__CPM_PRES142 && window.__CPM_PRES142.men) : (window.__CPM_PARATA && window.__CPM_PARATA.men23); if (!L) return null; corpi = L.filter(o => o && o.userData && o.userData.alt431); corpi.forEach(o => o.updateMatrixWorld(true)); }
  for (const o of corpi) { let sole = Infinity, alto = -Infinity;
    o.traverseVisible(m => { if (!m.isSkinnedMesh || !m.geometry || !m.geometry.attributes.position) return; const pa = m.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count / 3000)); for (let i = 0; i < pa.count; i += st) { v.fromBufferAttribute(pa, i); m.boneTransform ? m.boneTransform(i, v) : 0; v.applyMatrix4(m.matrixWorld); if (v.y < sole) sole = v.y; if (v.y > alto) alto = v.y; } });
    if (!isFinite(sole)) continue; const ws = new T.Vector3(); o.getWorldScale(ws); const c = o.userData.chi240 || {}; const A = o.userData.alt431;
    out.push({ nome: c.nome || null, eroe: c.ruolo === 'eroe' || !!A.eroe, h: A.h, girth: A.girth != null ? A.girth : null, alt3d: +(alto - sole).toFixed(3), suola: +sole.toFixed(3), sy: ws.y, corp: +(ws.x / ws.y).toFixed(3) }); }
  let fig = null; try { fig = datiFigurina23('giocatore', 'eroe', null); } catch (e) {}
  return { corpi: out, fig: fig ? { cm: fig.cm, kg: fig.kg } : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null }; }, sorg).catch(e => ({ errore: String(e.message).slice(0, 160) }));
const clic = (p, re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
const fase = p => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const pronto = p => p.evaluate(() => !!(window.__CPM3D && window.__CPM3D.renderer && window.__CPM_GLB_READY)).catch(() => false);

const md = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
for (const flags of [[], ['__CPM_NO_G431']]) { const { ctx, p } = await pagina(flags);
  await p.evaluate(() => window.__CPM_CAREER.playMatch()); let ok = false;
  for (let k = 0; k < 140; k++) { const f = await fase(p); if (f === 'walkout' && await pronto(p)) { ok = true; break; } if (f === 'playing') break; await clic(p, 'Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua'); await sleep(700); }
  console.log('braccio', flags.join() || 'verde', 'walkout', ok); const t0 = Date.now();
  for (let k = 0; k < +(process.env.N || 24); k++) { const L = await leggi(p, 'partita'); if (L && L.corpi) { const E = L.corpi.find(c => c.eroe), A = L.corpi.filter(c => !c.eroe).map(c => c.suola);
      console.log(((Date.now() - t0) / 1000).toFixed(1).padStart(5), L.ph, 'n', L.corpi.length, 'eroe suola', E && E.suola, 'alt', E && E.alt3d, '· altri suola med', md(A), 'min', Math.min(...A), 'max', Math.max(...A)); }
    await sleep(400); }
  await ctx.close(); }
await b.close(); srv.close();
