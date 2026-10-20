#!/usr/bin/env node
/* [giro 80 PO-285 «l'ingresso in campo lo velocizzerei ulteriormente»; decisione PO: scena ~16 s (era ~24 s dopo il giro 54), ottenuta con TAGLI DI
   CAMERA (stacchi come in tv); il passo resta camminata 2,2 u/s, tetto del guardiano 2,3 (PO-245: NON si alza)]
   SONDA/GUARDIANO sul percorso vero (salvataggio → partita → walkout), GLB acceso, rete del banco. Un registratore in pagina legge OGNI fotogramma
   di rendering (requestAnimationFrame): tempo di scena (testimone __CPM_WALK245, campo `s`), conteggio stacchi (__CPM_CUT285), posizione dei 22 + l'eroe,
   proiezione sulla camera vera (in quadro = dentro l'NDC) e distanza dal posto assegnato (_wx,_wz).
   Misure: durata di scena (ultimo `s` della fase walkout), velocita' massima di un corpo IN QUADRO in due fotogrammi consecutivi (la coppia che
   attraversa uno stacco e' esclusa: e' un taglio di montaggio, non un movimento), squadra schierata alla fine (distanza massima dal posto), stacchi.
   Bracci: verde · rosso (__CPM_NO_ING285 = durata di prima, nessuno stacco). CPM_FORZA_ROSSO=1 applica il rosso anche al braccio verde (prova del guardiano).
   Soglie: CPM_DMIN/CPM_DMAX (default 14..18 s), CPM_VMAX (default 2,3 u/s), CPM_STACCHI_MIN (default 1), CPM_SCHIERA_MAX (default 0,6 u).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node ingresso-285.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const DMIN = +(process.env.CPM_DMIN || 14), DMAX = +(process.env.CPM_DMAX || 18), VMAX = +(process.env.CPM_VMAX || 2.3);
const SMIN = +(process.env.CPM_STACCHI_MIN || 1), SCH = +(process.env.CPM_SCHIERA_MAX || 0.6), FORZA = !!process.env.CPM_FORZA_ROSSO;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(braccio) {
  const rosso = braccio === 'rosso' || FORZA;
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_WALK245 = []; window.__CPM_GLB = true; if (o.r) window.__CPM_NO_ING285 = true; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  const out = { braccio: rosso && braccio !== 'rosso' ? braccio + '+forzato' : braccio };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    /* registratore: un campione per fotogramma di scena (testimone con t nuovo) */
    await page.evaluate(() => {
      window.__REC285 = []; let last = -1;
      const f = () => {
        try {
          const T = window.__CPM3D, W = window.__CPM_WALK245 || [];
          if (T && T.camera && W.length && window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout') {
            const e = W[W.length - 1];
            if (e.t !== last) {
              last = e.t; const cam = T.camera, V = new cam.position.constructor();
              const arr = [...(T.players || []).map(q => q && (q.mesh || q)), T.hero].filter(m => m && m.position && m.visible !== false);
              let resid = 0; const B = arr.map(m => {
                V.set(m.position.x, 0, m.position.z).project(cam); const x0 = V.x, y0 = V.y, z0 = V.z;
                V.set(m.position.x, 1.85, m.position.z).project(cam); const y1 = V.y;
                const inq = z0 < 1 && z0 > -1 && Math.abs(x0) < 1 && y1 > -1 && y0 < 1;
                if (m._wx != null) resid = Math.max(resid, Math.hypot(m.position.x - m._wx, m.position.z - m._wz));
                return [m.position.x, m.position.z, inq ? 1 : 0];
              });
              window.__REC285.push({ t: e.t, s: e.s != null ? e.s : e.t, cut: window.__CPM_CUT285 || 0, resid, B });
            }
          }
        } catch (_) {}
        requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 60; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      await sleep(700); }
    out.walk = (await ph()) === 'walkout';
    const t0 = Date.now(); let visto = false;
    while (Date.now() - t0 < +(process.env.CPM_TMAX || 300000)) {
      const p = await ph(); if (p === 'walkout') visto = true; else if (visto) break; await sleep(250); }
    const R = await page.evaluate(() => window.__REC285 || []);
    const D = await page.evaluate(() => ({ dur: window.__CPM_WALKDUR245 || null, scena: window.__CPM_WALKSCENE285 || null, cut: window.__CPM_CUT285 || 0 }));
    out.frames = R.length; out.durataDich = D.dur; out.scenaDich = D.scena; out.stacchi = D.cut;
    out.durataScena = R.length ? +(R[R.length - 1].s - R[0].s).toFixed(2) : null;
    /* velocita' su finestre >= 0,5 s di scena (come ingresso-camminata-245): per fotogramma singolo lo scatto d'arresto a 0,15 u dal posto (PO-197)
       vale 0,15/0,05 = 3 u/s per un fotogramma a 20 fps (a 60 fps e' invisibile) ed e' rumore di campionamento, non un passo. Una finestra che
       attraversa uno stacco ricomincia dopo lo stacco; conta solo se il corpo e' IN QUADRO a entrambi gli estremi. */
    let vmax = 0, quando = null, coppie = 0, tagli = 0;
    if (R.length) { const n = R[0].B.length; for (let j = 0; j < n; j++) { let a = 0;
      for (let i = 1; i < R.length; i++) { if (R[i].cut !== R[a].cut) { if (j === 0) tagli++; a = i; continue; }
        if (R[i].s - R[a].s < 0.5 || R[i].B.length !== n) continue;
        if (R[a].B[j][2] && R[i].B[j][2]) { coppie++; const v = Math.hypot(R[i].B[j][0] - R[a].B[j][0], R[i].B[j][1] - R[a].B[j][1]) / (R[i].s - R[a].s); if (v > vmax) { vmax = v; quando = +R[i].s.toFixed(2); } }
        a = i; } } }
    out.vmaxQuadro = +vmax.toFixed(2); out.vmaxAs = quando; out.coppieQuadro = coppie; out.tagliSaltati = tagli;
    out.residuoFine = R.length ? +R[R.length - 1].resid.toFixed(2) : null;
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await ctx.close(); return out;
}
const R = {}; for (const br of BRACCI) { R[br] = await giro(br); console.log(br.toUpperCase() + ' ' + JSON.stringify(R[br])); }
await b.close(); srv.close();
if (process.env.CPM_SOLO_MISURA) process.exit(0);
const g = [];
const ok = (X) => X && X.walk && X.frames > 40 && X.durataScena != null;
function verde(V, nome) {
  if (!ok(V)) { g.push(nome + ': ingresso non misurato ' + JSON.stringify(V)); return; }
  if (!(V.durataScena >= DMIN && V.durataScena <= DMAX)) g.push(`${nome}: scena di ${V.durataScena} s fuori banda [${DMIN},${DMAX}]`);
  if (V.vmaxQuadro > VMAX) g.push(`${nome}: un corpo in quadro va a ${V.vmaxQuadro} u/s (tetto ${VMAX}) a ${V.vmaxAs} s di scena`);
  if (V.residuoFine > SCH) g.push(`${nome}: la squadra non arriva schierata (scarto massimo dal posto ${V.residuoFine} u > ${SCH})`);
  if (V.stacchi < SMIN) g.push(`${nome}: ${V.stacchi} stacchi di camera (minimo ${SMIN})`);
  if (V.errori.length) g.push(nome + ': errori di pagina ' + V.errori.join(' | '));
}
if (R.verde) verde(R.verde, FORZA ? 'verde(forzato)' : 'verde');
if (R.rosso) { const Z = R.rosso; if (!ok(Z)) g.push('rosso: non misurato ' + JSON.stringify(Z));
  else if (!(Z.durataScena > DMAX || Z.stacchi < SMIN)) g.push('rosso: il difetto non si vede ' + JSON.stringify(Z)); }
if (g.length) { console.log('❌ ingresso-285'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ingresso-285 verde (scena 14-18 s con stacchi, passo ≤ 2,3 u/s in quadro, squadra schierata) e il rosso si vede');
