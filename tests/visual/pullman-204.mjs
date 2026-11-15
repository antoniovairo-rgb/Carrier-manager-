#!/usr/bin/env node
/* [giro 204 PO-451] GUARDIANO DEL PULLMAN E DEL PIEDISTALLO — verde col verde, rosso col rosso.
   M · maglie sul tetto del pullman (parata, FC Merseyside #dc2626, corpi CGTrader). Per ogni corpo si proietta il busto (ossa spine_02 e
       spine_03) sullo schermo e si legge il pixel (mediana 3x3); si confronta col colore del club in HSV: saturazione, tono, luminosita'.
       SOGLIA DICHIARATA (la stessa del pullman del giro 192, piu' la luminosita'): saturazione >= 0,85 x quella del club, tono entro 12°,
       luminosita' entro 0,15 da quella del club. Verde: almeno 12 campioni e le tre mediane dentro. Rosso __CPM_NO_G204: maglie piu'
       chiare (luminosita' oltre 0,15 o saturazione sotto 0,85 x) — se il difetto non si vede, rosso.
   P · piedistallo della coppa nella premiazione di squadra (giro 192 B). Testimone __CPM_PED204 (src/12): per fotogramma beat, presa
       completa, piedistallo visibile, stacco. Verde: dopo la presa il piedistallo NON resta in scena vuoto — 0 fotogrammi con piedistallo
       visibile e presa completa nei beat dopo quello della presa (pass/lift/fest), e lo stacco c'e' (>=1); prima della presa la coppa
       aspetta sul piedistallo (>=1 fotogramma visibile in present/captain). Rosso __CPM_NO_G204: piedistallo vuoto visibile dopo la presa.
       Due casi: capitano compagno e eroe capitano (__CPM_EROE_CAPITANO192).
   Uso: node pullman-204.mjs   (CPM_SOLO=M o P per restringere; CPM_FOTO=<cartella> per le foto della parata) */
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SOLO = (process.env.CPM_SOLO || 'M,P').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length / 2)].toFixed(3) : null; };
const hsv = (r, g, bb) => { r /= 255; g /= 255; bb /= 255; const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - bb) / d) % 6 : mx === g ? (bb - r) / d + 2 : (r - g) / d + 4; return { h: (h * 60 + 360) % 360, s: mx ? d / mx : 0, v: mx }; };
const guasti = [], righe = [];
async function maglie(flags, foto) {
  const club = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
  const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p);
  await p.addInitScript(f => { for (const [k, v] of f) window[k] = v; }, flags);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
  await p.evaluate(c => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
    ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club: c, euroWin: true, avatarId: 0, heroNum: 9 })); }, club);
  await p.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.cg23 || 0) >= 8 && window.__CPM_PARATA.men23, null, { timeout: 60000 }).catch(() => {});
  const col = [];
  for (let k = 0; k < 5; k++) { await sleep(1500);
    const pts = await p.evaluate(() => { const P = window.__CPM_PARATA, T = window.THREE; if (!P || !P.men23 || !P.cam) return null; const cam = P.cam, out = [];
      for (const m of P.men23) { if (m._cg23 && m._cg23.eroe) continue; m.updateMatrixWorld(true); const bs = {}; m.traverse(o => { if (o.isBone && /^spine_0[23]$/.test(o.name)) bs[o.name] = o; });
        const a = bs.spine_02, c = bs.spine_03; if (!a || !c) continue; const va = new T.Vector3(), vc = new T.Vector3(); a.getWorldPosition(va); c.getWorldPosition(vc);
        const v = va.add(vc).multiplyScalar(0.5); const q = v.project(cam); if (Math.abs(q.x) < 0.95 && Math.abs(q.y) < 0.95 && q.z < 1) out.push([(q.x + 1) / 2 * innerWidth, (1 - q.y) / 2 * innerHeight]); }
      return out; });
    const shot = PNG.sync.read(await p.screenshot());
    if (foto && k === 2) fs.writeFileSync(foto, PNG.sync.write(shot));
    for (const [x, y] of pts || []) { const X = Math.round(x * shot.width / 375), Y = Math.round(y * shot.height / 812); if (X < 2 || Y < 2 || X >= shot.width - 2 || Y >= shot.height - 2) continue;
      const R = [], G = [], B = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const i = ((Y + dy) * shot.width + X + dx) * 4; R.push(shot.data[i]); G.push(shot.data[i + 1]); B.push(shot.data[i + 2]); }
      col.push(hsv(med(R), med(G), med(B))); } }
  await p.close();
  const ref = hsv(0xdc, 0x26, 0x26);
  return { campioni: col.length, sat: med(col.map(c => c.s)), satRif: +ref.s.toFixed(3), tono: med(col.map(c => Math.min(Math.abs(c.h - ref.h), 360 - Math.abs(c.h - ref.h)))), lum: med(col.map(c => c.v)), lumRif: +ref.v.toFixed(3) };
}
async function piedistallo(flags, foto) {
  const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p);
  await p.addInitScript(f => { window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_PRESENT = 1; window.__CPM_CER_HOLD = 1;/* la premiazione resta aperta: in headless il tempo di scena va piu' piano dell'orologio che la chiude */ for (const k of f) window[k] = 1; }, flags);
  await openMatch(p, port, { skipLoadAll: true, name: 'Ped204' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(() => { window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: 'cup' }); });
  await p.waitForFunction(() => { const W = window.__CPM_PED204; return W && W.some(f => f.b === 'present'); }, null, { timeout: 60000 }).catch(() => {});
  await p.evaluate(() => { window.__CPM_PED204 = []; });
  await p.waitForFunction(() => { const W = window.__CPM_PED204; return W && W.filter(f => f.b === 'pass' || f.b === 'lift' || f.b === 'fest').length > 12; }, null, { timeout: 420000 }).catch(() => {});
  if (foto) await p.screenshot({ path: foto });
  const W = await p.evaluate(() => window.__CPM_PED204 || []); if (process.env.CPM_DEBUG) console.log('DEBUG', JSON.stringify(await p.evaluate(() => ({ cer: window.__CPM_CER425, ph: window.__CPM_PHASE && window.__CPM_PHASE(), g: ((window.__CPM_G192B || {}).fr || []).slice(-3).map(f => f.b) })))); await p.close();
  const prima = W.filter(f => (f.b === 'present' || f.b === 'captain') && !f.g && f.v).length;
  const presaB = (W.find(f => f.g) || {}).b || null; const ordine = ['present', 'captain', 'pass', 'lift', 'fest'];
  const dopo = W.filter(f => presaB && ordine.indexOf(f.b) > ordine.indexOf(presaB));
  return { fotogrammi: W.length, beats: [...new Set(W.map(f => f.b))], primaVisibile: prima, beatPresa: presaB, dopo: dopo.length, vuotoDopo: dopo.filter(f => f.v).length, stacchi: [...new Set(W.filter(f => f.cut).map(f => f.cut))].length };
}
if (SOLO.includes('M')) {
  const F = process.env.CPM_FOTO; if (F) fs.mkdirSync(F, { recursive: true });
  const v = await maglie([], F && `${F}/dopo-parata-maglie.png`), r = await maglie([['__CPM_NO_G204', 1]], F && `${F}/prima-parata-maglie.png`);
  righe.push('M verde ' + JSON.stringify(v), 'M rosso ' + JSON.stringify(r));
  const dentro = x => x.campioni >= 12 && x.sat >= 0.85 * x.satRif && x.tono <= 12 && Math.abs(x.lum - x.lumRif) <= 0.15;
  if (!dentro(v)) guasti.push('M verde: maglie fuori dal colore del club ' + JSON.stringify(v));
  if (!(r.campioni >= 12 && !dentro(r))) guasti.push('M rosso: il difetto non si vede ' + JSON.stringify(r));
  if (process.env.CPM_KITS) for (const k of process.env.CPM_KITS.split(',')) righe.push('M taratura k=' + k + ' ' + JSON.stringify(await maglie([['__CPM_KIT204', +k]])));
}
if (SOLO.includes('P')) {
  for (const [nome, extra] of [['capitano compagno', []], ['eroe capitano', ['__CPM_EROE_CAPITANO192']]].filter(c => !process.env.CPM_CASO || c[0] === process.env.CPM_CASO)) {
    const F = process.env.CPM_FOTO, tag = nome.replace(/ /g, '-');
    const v = await piedistallo(extra, F && `${F}/dopo-piedistallo-${tag}.png`), r = await piedistallo(extra.concat(['__CPM_NO_G204']), F && `${F}/prima-piedistallo-${tag}.png`);
    righe.push(`P ${nome} verde ` + JSON.stringify(v), `P ${nome} rosso ` + JSON.stringify(r));
    if (!(v.beatPresa && v.primaVisibile >= 1 && v.dopo >= 10 && v.vuotoDopo === 0 && v.stacchi >= 1)) guasti.push(`P ${nome} verde: ` + JSON.stringify(v));
    if (!(r.beatPresa && r.dopo >= 10 && r.vuotoDopo >= 10)) guasti.push(`P ${nome} rosso: il piedistallo vuoto non si vede ` + JSON.stringify(r));
  }
}
await b.close(); srv.close();
for (const r of righe) console.log(r);
for (const g of guasti) console.log('❌ ' + g);
console.log(guasti.length ? '❌ pullman-204 rosso' : '✅ pullman-204 verde (e ogni rosso si vede)');
process.exit(guasti.length ? 1 : 0);
