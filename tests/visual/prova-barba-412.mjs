#!/usr/bin/env node
/* [giro 412 · PO-612] PROVA (non guardiano) della barba come strato della texture della testa. La maschera della barba nasce dalla
   GEOMETRIA della testa CGTrader (tools/barba-412.py: triangoli di mento, mascella e labbro superiore riportati sulle UV) e si dipinge
   sulla texture dei capelli del colore giusto. Qui la texture provata sostituisce, sul solo corpo scelto, la mappa della testa; poi
   foto affiancata figurina | corpo | viso (docs/collaudo-po/412-prova-barba-<tipo>.png). Nulla cambia nel gioco.
   Uso: node prova-barba-412.mjs   (le texture vanno prima generate: python3 tools/barba-412.py in out/g412/barba) */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apriIngresso, leggiCorpi, foto } from './misura-412.mjs';
import fs from 'node:fs'; import path from 'node:path';
const M = Object.values(JSON.parse(fs.readFileSync(new URL('../../assets/portraits/ai/manifest.json', import.meta.url)))); const perN = new Map(M.map(x => [+x.id.replace(/\D/g, ''), x]));
const VAR = { neri: 'black', castani: 'brown', biondi: 'blond', rossi: 'auburn' }, TIPO = { 'barba piena curata': 'piena', 'barba corta': 'corta', 'pizzetto': 'pizzetto', 'baffi sottili': 'baffi' };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const { ctx, p, ok } = await apriIngresso(b, port, []); if (!ok) { console.log('NON GIUDICATO: ingresso non raggiunto'); process.exit(1); }
const C = (await leggiCorpi(p)).filter(c => c.ruolo !== 'eroe' && c.fig); const fatti = new Set();
for (const c of C) { const m = perN.get(c.fig.n); const t = TIPO[m && m.barba]; const v = VAR[c.fig.h]; const f = `out/g412/barba/barba-${v}-${t}.webp`; if (!t || !v || fatti.has(t) || !fs.existsSync(f)) continue;
  const ok2 = await p.evaluate(async ([nome, url]) => { const T = THREE, S = window.__CPM3D.scene; let o = null; S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return false;
    const tex = await new Promise(r => new T.TextureLoader().load(url, r, undefined, () => r(null))); if (!tex) return false; tex.flipY = false; tex.encoding = T.sRGBEncoding;
    let n = 0; o.traverse(m => { if (!m.isMesh || !m.material) return; const L = Array.isArray(m.material) ? m.material : [m.material]; const nx = L.map(mt => { if (mt && /^KorwardNativeHair_|^Material\.002$/.test(mt.name)) { const c = mt.clone(); if (mt.map) { tex.encoding = mt.map.encoding; } c.map = tex; c.needsUpdate = true; n++; return c; } return mt; }); m.material = Array.isArray(m.material) ? nx : nx[0]; }); return n > 0; }, [c.nome, '/tests/visual/' + f]);
  const file = path.resolve(`../../docs/collaudo-po/412-prova-barba-${t}.png`); const r = ok2 && await foto(p, c.nome, file); console.log(`${t} su ${c.nome} (${m.barba}, capelli ${m.capelli}): ${r ? file : 'NON RIUSCITA'}`); if (r) fatti.add(t); }
await ctx.close(); await b.close(); srv.close();
