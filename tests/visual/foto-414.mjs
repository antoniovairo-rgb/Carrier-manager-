#!/usr/bin/env node
/* [giro 414 · PO-678] FOTO per il PO (non guardiano). Ingresso in campo (GLB acceso, ora congelata), poi:
     · i confronti del giro 412 rifatti con la correzione dell'attaccatura: docs/collaudo-po/414-confronto-<braccio>-<n>.png
       (stessi giocatori: eroe + 7 dal piu' basso al piu' alto, piu' Connor Quinn e Oscar Hayes, carnagione «scura»);
     · la prova della barba del giro 412 (tools/barba-412.py) con una camera che non ha la porta davanti: 414-prova-barba-<tipo>.png.
   Uso: node foto-414.mjs [--rosso] [--barba]   (braccio rosso = __CPM_NO_G414, per il «prima») */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apriIngresso, leggiCorpi } from './misura-412.mjs';
import { foto414 } from './misura-414.mjs';
import fs from 'node:fs'; import path from 'node:path';
const ROSSO = process.argv.includes('--rosso'), BARBA = process.argv.includes('--barba'), TOD = process.env.CPM_TOD || 'night';
const DIR = path.resolve('../../docs/collaudo-po'); fs.mkdirSync(DIR, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const { ctx, p, ok } = await apriIngresso(b, port, ROSSO ? ['__CPM_NO_G414'] : []); if (!ok) { console.log('NON GIUDICATO: ingresso non raggiunto'); process.exit(1); }
const C = await leggiCorpi(p);
if (!BARBA) {
  const eroe = C.find(c => c.ruolo === 'eroe'), resto = C.filter(c => c.ruolo !== 'eroe').sort((x, y) => (x.cm || 0) - (y.cm || 0)); const pick = [eroe];
  const passo = Math.max(1, Math.floor(resto.length / 5)); for (let i = 0; i < resto.length && pick.length < 6; i += passo) pick.push(resto[i]);
  for (const n of ['Connor Quinn', 'Oscar Hayes']) { const c = C.find(x => x.nome === n); if (c && !pick.includes(c)) pick.push(c); }
  const tit = ROSSO ? `prima (giro 412) · ${TOD}` : `dopo (giro 414) · ${TOD}`;
  for (let i = 0; i < pick.length; i++) { const f = path.join(DIR, `414-confronto-${ROSSO ? 'prima' : 'dopo'}-${i + 1}.png`); const r = await foto414(p, pick[i].nome, f, tit); console.log(`foto ${r ? f : 'NON SCRITTA'} (${pick[i].nome})`); }
} else {
  const M = Object.values(JSON.parse(fs.readFileSync(new URL('../../assets/portraits/ai/manifest.json', import.meta.url)))); const perN = new Map(M.map(x => [+x.id.replace(/\D/g, ''), x]));
  const VAR = { neri: 'black', castani: 'brown', biondi: 'blond', rossi: 'auburn' }, TIPO = { 'barba piena curata': 'piena', 'barba corta': 'corta', 'pizzetto': 'pizzetto', 'baffi sottili': 'baffi' }; const fatti = new Set();
  for (const c of C.filter(c => c.ruolo !== 'eroe' && c.fig)) { const m = perN.get(c.fig.n); const t = TIPO[m && m.barba]; const v = VAR[c.fig.h]; const f = `out/g412/barba/barba-${v}-${t}.webp`; if (!t || !v || fatti.has(t) || !fs.existsSync(f)) continue;
    const ok2 = await p.evaluate(async ([nome, url]) => { const T = THREE, S = window.__CPM3D.scene; let o = null; S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return false;
      const tex = await new Promise(r => new T.TextureLoader().load(url, r, undefined, () => r(null))); if (!tex) return false; tex.flipY = false;
      let n = 0; o.traverse(m => { if (!m.isMesh || !m.material) return; const L = Array.isArray(m.material) ? m.material : [m.material]; const nx = L.map(mt => { if (mt && /^KorwardNativeHair_|^Material\.002$/.test(mt.name)) { const c = mt.clone(); if (mt.map) tex.encoding = mt.map.encoding; c.map = tex; c.onBeforeCompile = mt.onBeforeCompile; if (mt.customProgramCacheKey) c.customProgramCacheKey = mt.customProgramCacheKey; c.needsUpdate = true; n++; return c; } return mt; }); m.material = Array.isArray(m.material) ? nx : nx[0]; }); return n > 0; }, [c.nome, '/tests/visual/' + f]);
    const file = path.join(DIR, `414-prova-barba-${t}.png`); const r = ok2 && await foto414(p, c.nome, file, `prova barba «${t}» (solo banco)`); console.log(`${t} su ${c.nome} (${m.barba}): ${r ? file : 'NON RIUSCITA'}`); if (r) fatti.add(t); }
}
await ctx.close(); await b.close(); srv.close();
