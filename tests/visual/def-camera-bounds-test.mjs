#!/usr/bin/env node
/* [7.398.0] GUARDIANO — LA CAMERA RESTA NELLO STADIO
   (collaudo PO #33 «si vede la curva da dietro in primo piano» a fine scena difensiva)

   PERCHE' E' UNA MISURA E NON UN'IMPRESSIONE. Le gradinate sono geometria: la Curva Nord comincia
   a x ≈ -51,3 (faccia interna, `sideX=Math.max(sideX,51.3+…)`). Una camera piazzata OLTRE quel
   confine ha la gradinata fra se' e il campo: quello che arriva allo schermo e' il retro della
   curva in primo piano, non l'azione. Non serve giudicare i pixel: basta la POSA.

   COSA MISURA, per ogni scena difensiva, fotogramma per fotogramma durante l'ESITO (la fase in cui
   la regia difensiva arretra per «abbracciare tutta l'azione»): la x della camera. Il campo finisce
   a -50; oltre, la camera sta dentro o dietro la curva.

   MISURATO PRIMA DEL FIX (30 scene difensive, 7.397.0): 12 scene oltre il confine, gi33 (la scena
   della nota) a -67,5 per 59/82 fotogrammi, gi45 a -65,2, gi44 a -61,8 (35/35 fotogrammi: TUTTO
   l'esito da dietro la curva).

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node def-camera-bounds-test.mjs [--verbose]            */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
/* le 12 rosse della misura pre-fix + sane di controllo */
const SCENE = (process.env.CPM_SCENE || '').length ? process.env.CPM_SCENE.split(',').map(Number)
  : [33, 36, 44, 45, 54, 129, 132, 134, 135, 136, 138, 31, 127, 190];
const CONFINE = -50;      /* fine del campo; la faccia interna della curva sta a -51,3 */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);

const righe = [], guasti = [];
for (const gi of SCENE) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(500);
  /* si campiona DENTRO il loop di render: l'esito dura pochi secondi e un poll da node misura il caso */
  await page.evaluate(() => {
    window.__CPM_CAMS = [];
    if (!window.__CPM_CAMTICK) {
      window.__CPM_CAMTICK = () => {
        try {
          const s = window.__CPM_STATE && window.__CPM_STATE();
          if (s && s.camera && window.__CPM_CAMS && window.__CPM_CAMS.length < 900)
            window.__CPM_CAMS.push({ ph: s.phase, cx: s.camera.x });
        } catch (e) {}
        requestAnimationFrame(window.__CPM_CAMTICK);
      };
      requestAnimationFrame(window.__CPM_CAMTICK);
    }
  });
  try { await page.evaluate(() => { window.__CPM_RESOLVE(0); }); } catch (e) { continue; }
  await sleep(4200);
  const fr = await page.evaluate(() => { const a = window.__CPM_CAMS || []; window.__CPM_CAMS = []; return a; });
  const res = fr.filter(f => /result/.test(String(f.ph || '')));
  if (res.length < 8) continue;
  const minCx = Math.min(...res.map(f => f.cx));
  const oltre = res.filter(f => f.cx < CONFINE).length;
  const problemi = [];
  if (oltre > 0) problemi.push(`la camera esce dal campo per ${oltre}/${res.length} fotogrammi d'esito (x minima ${minCx.toFixed(1)}): la curva le sta davanti`);
  if (problemi.length) guasti.push(`gi${gi}: ` + problemi.join(' · '));
  righe.push({ gi, minCx, oltre, n: res.length });
  if (VERB || problemi.length) console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)} · fr esito ${String(res.length).padStart(3)} · cam.x min ${minCx.toFixed(1)} · oltre il confine ${oltre}/${res.length}`);
}
await b.close(); srv.close();

if (righe.length < 6) { console.log(`❌ FAIL — solo ${righe.length} scene misurate: la sonda e' cieca`); process.exit(2); }
const mins = righe.map(r => r.minCx).sort((a, b) => a - b);
console.log(`\nscene misurate ${righe.length} · cam.x minima assoluta ${mins[0].toFixed(1)} · scene fuori dallo stadio ${righe.filter(r => r.oltre > 0).length}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — la regia difensiva resta nello stadio: mai la curva fra camera e campo`);
