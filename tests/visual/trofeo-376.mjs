#!/usr/bin/env node
/* [giro 376 PO-647] GUARDIANO DEL TROFEO NELLA FESTA — verde col verde, rosso col rosso (__CPM_NO_G376).
   A · premiazione di squadra (src/12, GLB acceso), tre trofei: coppa (cup), piatto di campionato (league), coppa internazionale (int).
       Testimone __CPM_T376 (src/12, solo cpmtest): per fotogramma beat, appoggio sul piedistallo, vertice visibile piu' basso del trofeo,
       piano del piedistallo, verso del trofeo e di chi lo tiene (eroe o capitano, il piu' vicino).
       APPOGGIO (fotogrammi col trofeo fermo sul piedistallo): scarto verticale = base del trofeo - piano (1,05); scarto orizzontale = asse
       del trofeo - asse del piedistallo. Verde: |verticale| <= 0,01 e orizzontale <= 0,01 su ogni fotogramma (almeno 5).
       IN MANO (tutti gli altri fotogrammi col trofeo visibile, salvo il volo della presa dal piedistallo; verso a meno di mezzo giro): velocita' angolare del trofeo
       RISPETTO a chi lo tiene. Verde: mediana <= 0,05 rad/s e quota oltre 0,6 rad/s <= 10% (almeno 20 fotogrammi).
       Rosso: il difetto deve vedersi su almeno uno dei due numeri per ogni trofeo (affondamento >= 0,05 o giro relativo mediano >= 1,0).
      Quarto caso: eroe capitano (__CPM_EROE_CAPITANO192, kind cup+ec): la prende lui dal piedistallo.
   B · parata sul pullman (src/16), piedistallo a prua (corpi di ripiego, __CPM_GLB=false): base della coppa contro il piano del trespolo.
       Verde: |verticale| <= 0,01 e orizzontale <= 0,01. Rosso: |verticale| >= 0,05.
   «Non giudicato» = rosso. Uso: node trofeo-376.mjs  (CPM_SOLO=A,B · CPM_KIND=cup,league,int · CPM_FOTO=<cartella>) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SOLO = (process.env.CPM_SOLO || 'A,B').split(','), KINDS = (process.env.CPM_KIND || 'cup,league,int,cup+ec').split(',');
const FOTO = process.env.CPM_FOTO || null; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length / 2)].toFixed(4) : null; };
const wrap = a => { a %= 2 * Math.PI; if (a > Math.PI) a -= 2 * Math.PI; if (a < -Math.PI) a += 2 * Math.PI; return a; };
const guasti = [], righe = [];
async function premiazione(rosso, kk) {
  const kind = kk.split('+')[0], ec = kk.endsWith('+ec');
  const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: FOTO ? 2 : 1 }); await installCdnRoutes(p);
  await p.addInitScript(([r, ec]) => { window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_PRESENT = 1; window.__CPM_CER_HOLD = 1; if (r) window.__CPM_NO_G376 = 1; if (ec) window.__CPM_EROE_CAPITANO192 = 1; }, [rosso, ec]);
  await openMatch(p, port, { skipLoadAll: true, name: 'Trofeo376' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(k => { window.__CPM_T376 = { fr: [] }; window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: k }); }, kind);
  let foto = false;
  const fine = Date.now() + 420000;
  while (Date.now() < fine) {
    const st = await p.evaluate(() => { const F = (window.__CPM_T376 || { fr: [] }).fr; return { rest: F.filter(f => f.r && f.ped).length, mano: F.filter(f => !f.r && (f.b === 'lift' || f.b === 'fest')).length }; });
    if (FOTO && !foto && st.rest >= 3) { foto = true; await p.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-piedistallo-${kk.replace('+', '-')}.png` }); }
    if (st.rest >= 5 && st.mano >= 25) break; await sleep(1000);
  }
  if (FOTO) await p.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-in-mano-${kk.replace('+', '-')}.png` });
  const F = await p.evaluate(() => (window.__CPM_T376 || { fr: [] }).fr); await p.close();
  const R = F.filter(f => f.r && f.ped), V = R.map(f => f.low - f.ped.top), O = R.map(f => Math.hypot(f.t[0] - f.ped.x, f.t[2] - f.ped.z));
  const rel = [];
  /* relativo a meno di mezzo giro: coppa e piatto sono simmetrici, un verso opposto a chi lo tiene e' la stessa presa (passaggio fra due
     uomini che si guardano). Il volo della presa dal piedistallo (g) e' dichiarato a parte, non giudicato come «in mano». */
  const wrapPi = a => { a = wrap(2 * a) / 2; return a; };
  for (let i = 1; i < F.length; i++) { const a = F[i - 1], c = F[i]; if (a.r || c.r || a.g || c.g || !(c.dt > 0)) continue;
    rel.push(Math.abs(wrapPi((c.ry - c.hy) - (a.ry - a.hy))) / c.dt); }
  return { kind: kk, fotogrammi: F.length, appoggio: R.length, vMax: V.length ? +Math.max(...V.map(Math.abs)).toFixed(4) : null, vMed: med(V), oMax: O.length ? +Math.max(...O).toFixed(4) : null,
    volo: F.filter(f => f.g).length, mano: rel.length, giroMed: med(rel), quota06: rel.length ? +(rel.filter(x => x > 0.6).length / rel.length).toFixed(3) : null };
}
async function parata(rosso) {
  const club = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' }, out = [];
  for (const euroWin of [true, false]) {
    const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: FOTO ? 2 : 1 }); await installCdnRoutes(p);
    await p.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G376 = 1; }, rosso);
    await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
    await p.evaluate(([c, e]) => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
      ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club: c, euroWin: e, avatarId: 0, heroNum: 9 })); }, [club, euroWin]);
    await p.waitForFunction(() => window.__CPM_PARATA && window.__CPM_PARATA.cup, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
    const m = await p.evaluate(() => { const P = window.__CPM_PARATA, T = window.THREE; if (!P || !P.cup) return null; const cup = P.cup, ped = cup.children[0], sp = cup._spin429;
      if (!ped || !ped.visible || !sp) return { ped: false }; cup.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(ped);
      let mn = 1e9; const v = new T.Vector3(), lo = new T.Box3(); sp.traverse(o => { if (!o.isMesh) return; const A = o.geometry.attributes.position; for (let i = 0; i < A.count; i++) { v.fromBufferAttribute(A, i).applyMatrix4(o.matrixWorld); if (v.y < mn) mn = v.y; lo.expandByPoint(v); } });
      const c1 = bb.getCenter(new T.Vector3()), c2 = lo.getCenter(new T.Vector3());
      return { ped: true, v: +(mn - bb.max.y).toFixed(4), o: +Math.hypot(c1.x - c2.x, c1.z - c2.z).toFixed(4) }; });
    if (FOTO) await p.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-pullman-${euroWin ? 'coppa' : 'piatto'}.png` });
    await p.close(); out.push({ euro: euroWin, ...(m || { ped: null }) });
  }
  return out;
}
if (SOLO.includes('A')) for (const k of KINDS) {
  const v = await premiazione(false, k), r = await premiazione(true, k);
  righe.push('A verde ' + JSON.stringify(v), 'A rosso ' + JSON.stringify(r));
  if (!(v.appoggio >= 5 && v.vMax != null && v.vMax <= 0.01 && v.oMax <= 0.01)) guasti.push(`A verde ${k}: trofeo non appoggiato ` + JSON.stringify(v));
  if (!(v.mano >= 20 && v.giroMed != null && v.giroMed <= 0.05 && v.quota06 <= 0.10)) guasti.push(`A verde ${k}: il trofeo gira in mano ` + JSON.stringify(v));
  if (!(r.appoggio >= 5 && r.mano >= 20 && ((r.vMax != null && r.vMax >= 0.05) || (r.giroMed != null && r.giroMed >= 1.0)))) guasti.push(`A rosso ${k}: il difetto non si vede ` + JSON.stringify(r));
  if (!(r.mano >= 20 && r.giroMed >= 1.0)) guasti.push(`A rosso ${k}: la rotazione in mano non si vede ` + JSON.stringify(r));
}
if (SOLO.includes('B')) {
  const v = await parata(false), r = await parata(true);
  righe.push('B verde ' + JSON.stringify(v), 'B rosso ' + JSON.stringify(r));
  for (const x of v) if (!(x.ped === true && Math.abs(x.v) <= 0.01 && x.o <= 0.01)) guasti.push('B verde: coppa non posata sul trespolo ' + JSON.stringify(x));
  for (const x of r) if (!(x.ped === true && Math.abs(x.v) >= 0.05)) guasti.push('B rosso: il difetto non si vede ' + JSON.stringify(x));
}
await b.close(); srv.close();
righe.forEach(x => console.log(x));
if (guasti.length) { console.log('❌ trofeo-376'); guasti.forEach(g => console.log('  · ' + g)); process.exit(1); }
console.log('✅ trofeo-376 verde (e ogni rosso si vede) · punti ' + SOLO.join(','));
