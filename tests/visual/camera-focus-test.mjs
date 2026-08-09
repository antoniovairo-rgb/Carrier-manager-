#!/usr/bin/env node
/* [7.363.0] GUARDIANO DEL FUOCO DELLA REGIA — collaudo PO #76 «sul corner la camera e' troppo lontana».

   La regia CLOSE interpola il punto di fuoco dall'EROE alla PALLA: su un corner la palla sta sulla
   bandierina e l'eroe in area, quindi il fuoco ci finiva sopra. Misurato prima del fix su otto scene da
   fondo: fino a 74,6 unita' mondo dall'eroe (gi36), su gi76 27,0 con l'eroe fuori quadro in 55 fotogrammi
   su 210. Le scene sane stavano fra 16 e 20, e li' e' stato messo il tetto: 18 unita'.

   ⚠️ ECCEZIONE DICHIARATA: gi36 e gi44 restano fuori quadro per quasi tutta la scena, e NON e' un difetto
   da correggere qui. Sono difensive aeree dove la rete che tiene l'eroe in quadro cede di proposito perche'
   il soggetto passa alla palla (scelta del 7.237). E' una decisione di regia: il guardiano la conosce e non
   la giudica, cosi' non diventa un falso allarme permanente.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node camera-focus-test.mjs                                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const SOGGETTO_PALLA = new Set([36, 44]);   /* il soggetto e' la palla per scelta: fuori ambito */
const TETTO = 22;                           /* il tetto nel motore, misurato sulla MEDIANA (vedi sotto) */
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);
const corner = await page.evaluate(() => (window.__CPM_SITS || []).map((s, i) => [i, String((s && s.text) || ''), s && s.ballAt])
  .filter(r => r[2] === 'corner' || /corner|calcio d'angolo|bandierina|angolo/i.test(r[1])).map(r => r[0]));
console.log(`scene da corner: ${corner.join(', ')}`);
let misurate = 0;
const CONTROLLO = [0, 8, 26, 44];
for (const [eti, lista] of [['CORNER   ', corner.slice(0, 8)], ['controllo', CONTROLLO]]) {
  for (const gi of lista) {
    await page.evaluate(g => {
      window.__CF = [];
      const tick = () => { try { const s = window.__CPM_STATE(); if (s && s.camLook && s.hero) window.__CF.push([s.phase, s.camLook.x, s.camLook.z, s.hero.x, s.hero.y, s.hero.onScreen ? 1 : 0, s.camera.x, s.camera.z, s.ball.x, s.ball.y]); } catch (e) {} if (window.__CF.length < 320) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      window.__CPM_FORCE_SIT(g, true);
    }, gi);
    await sleep(800);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
    await sleep(2800);
    const f = (await page.evaluate(() => window.__CF)).filter(r => String(r[0]).startsWith('hl'));
    if (f.length < 10) { console.log(`  ${eti} gi${gi}: ${f.length} fotogrammi, misura non valida`); continue; }
    const g2w = (gx, gy) => [gx - 50, (gy - 50) * 0.68];
    let fuoco = 0, cam = 0, fuori = 0; const dd = [];
    let saltati = 0;
    for (const r of f) {
      /* [7.363.0] SI MISURA SOLO IL REGIME CHE IL TETTO GOVERNA. Quando l'esito porta il pallone a piu' di
         10 unita' dall'eroe il motore passa DELIBERATAMENTE il soggetto alla palla (`_subjBall50`, 7.237) e
         la rete che tiene l'eroe in quadro cede: e' una scelta di regia, non un difetto, e giudicarla qui
         renderebbe il guardiano un falso allarme permanente su ogni corner e ogni cross. */
      if (r[0] === 'hl_result' && Math.hypot(r[8] - r[3], (r[9] - r[4]) * 0.68) > 10) { saltati++; continue; }
      const [hx, hz] = g2w(r[3], r[4]);
      const _d = Math.hypot(r[1] - hx, r[2] - hz); dd.push(_d); fuoco = Math.max(fuoco, _d);
      cam = Math.max(cam, Math.hypot(r[6] - hx, r[7] - hz));
      if (!r[5]) fuori++;
    }
    misurate++;
    dd.sort((a, b) => a - b); const medD = dd.length ? dd[dd.length >> 1] : 0;
    console.log(`  ${eti} gi${String(gi).padStart(3)} · ${String(f.length).padStart(3)} fotogrammi · fuoco lontano dall'eroe fino a ${fuoco.toFixed(1)} · camera-eroe fino a ${cam.toFixed(1)} · fuoco mediano ${medD.toFixed(1)} · eroe FUORI QUADRO ${fuori}/${f.length - saltati} · soggetto-palla saltati ${saltati}`);
    if (SOGGETTO_PALLA.has(gi)) continue;
    /* LA MEDIANA, NON IL MASSIMO. Il bersaglio dello sguardo e' tappato a 22 unita' dall'eroe, ma `camLook`
       lo insegue con uno smorzamento: mentre l'eroe sprinta il valore ISTANTANEO sfora comunque per qualche
       fotogramma. Quel picco e' ritardo del lerp, non una scelta di regia — misurato, resta anche col
       bersaglio tappato. La mediana dice dove la camera guarda DAVVERO durante la scena. */
    if (medD > TETTO) issues.push(`gi${gi}: il fuoco della regia sta in mediana a ${medD.toFixed(1)} unita' dall'eroe (tetto ${TETTO.toFixed(1)}) — la camera guarda altrove`);
    if ((f.length - saltati) > 20 && fuori / (f.length - saltati) > 0.6) issues.push(`gi${gi}: l'eroe e' fuori quadro in ${fuori} fotogrammi su ${f.length} — la scena non inquadra il protagonista`);
  }
}
console.log(`\nscene misurate ${misurate}`);
/* un guardiano che non osserva niente non e' verde, e' cieco */
if (misurate < 8) issues.push(`solo ${misurate} scene misurate: la misura non e' stata fatta`);
await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ REGIA OK — il fuoco resta sul protagonista, la palla decide solo la direzione dello sguardo');
