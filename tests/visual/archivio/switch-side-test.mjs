#!/usr/bin/env node
/* [7.368.0] GUARDIANO «IL CAMBIO DI GIOCO CAMBIA DAVVERO FRONTE» — collaudo PO #181 «Cambio di gioco —
   ribalta sul lato debole»: «la scena e' completamente sballata, parte un passaggio ad un compagno vicino».

   Il ramo SWITCH sceglieva la fascia con `Math.random()<0.5`, senza guardare dove fosse l'eroe: una volta su
   due la palla andava sulla fascia da cui gia' partiva. Un cambio di gioco che non cambia lato e' un
   appoggio corto — ed essendo un sorteggio NON seedato la nota del PO non era nemmeno riproducibile.

   Si presidiano DUE invarianti, e il secondo vale quanto il primo:
     1. ATTRAVERSAMENTO — la palla finisce dal lato opposto a quello dell'eroe, con uno spostamento
        laterale che si vede (>=10u). E' il difetto che il PO ha guardato.
     2. DETERMINISMO — la stessa scena, ripetuta, sceglie SEMPRE lo stesso lato. E' cio' che impedisce al
        sorteggio di rientrare dalla finestra: un `Math.random()` reintrodotto qui fallisce questo controllo
        anche se per fortuna dovesse attraversare.

   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node switch-side-test.mjs                                  */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const REP = Number(process.env.REP || 4);
const issues = [];
let misurate = 0;
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);

const scene = await page.evaluate(() => (window.__CPM_SITS || [])
  .map((s, i) => ({ gi: i, it: s && s.intent, txt: String((s && s.text) || '').slice(0, 38) }))
  .filter(r => r.it === 'switch'));
console.log(`scene con intent "switch": ${scene.map(r => 'gi' + r.gi).join(' ') || '(nessuna)'}\n`);
if (scene.length < 3) issues.push(`solo ${scene.length} scene switch trovate: la misura non e' stata fatta`);

for (const { gi, txt } of scene) {
  const obs = []; let skipped = 0;
  for (let r = 0; r < REP; r++) {
    /* TRE trappole di misura, tutte gia' pagate in questa sessione e qui evitate per iscritto.
       (a) NON si misura su `__CPM_DISPATCH`: si scrive solo a fine arco e solo in certi rami, quindi una
           scena che non lo produce restituisce il valore della PRECEDENTE. Misurato: azzerandolo prima,
           6 scene su 7 risultano «senza arco» — cioe' i bersagli identici che si leggevano erano UNO SOLO,
           quello di gi105, riletto sette volte. Si misura invece il PALLONE, che e' fresco per costruzione.
       (b) si campiona a frequenza di fotogramma DENTRO la pagina: un `page.evaluate` a intervalli perde
           l'arco e legge lo stato della scena precedente.
       (c) la z di riferimento si legge quando la scena e' DAVVERO entrata (hl_choose/hl_move) e PRIMA del
           calcio: troppo presto e' l'eroe di prima, troppo tardi si e' gia' mosso. */
    await page.evaluate(g => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_FORCE_SIT(g, true); }, gi);
    await sleep(800);
    const hz = await page.evaluate(() => {
      const s = window.__CPM_STATE ? window.__CPM_STATE() : null;
      return (s && s.hero && (s.phase === 'hl_choose' || s.phase === 'hl_move')) ? (s.hero.y - 50) * 0.68 : null;
    });
    if (hz == null) { skipped++; continue; }
    await page.evaluate(() => {
      window.__SW = []; const t0 = performance.now();
      const tick = () => { try { const s = window.__CPM_STATE(); if (s && s.ball) window.__SW.push([performance.now() - t0, (s.ball.y - 50) * 0.68]); } catch (e) {} if (performance.now() - t0 < 4200) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      try { window.__CPM_RESOLVE(0); } catch (e) {}
    });
    await sleep(4500);
    /* il bersaglio del cambio di gioco e' il punto piu' lontano che la palla raggiunge di lato DURANTE il
       arco. La finestra e' LARGA (4,2s) per una ragione misurata: in headless l'arco non parte al momento
       della scelta ma ~2,5-3s dopo, dietro l'overlay d'esito — con una finestra da 1,6s si campionava solo
       la palla ferma e OGNI scena sembrava un appoggio da 2-5u. */
    const tz = await page.evaluate(() => {
      const w = (window.__SW || []);
      if (w.length < 8) return null;
      return w.reduce((a, r) => Math.abs(r[1] - w[0][1]) > Math.abs(a - w[0][1]) ? r[1] : a, w[0][1]);
    });
    if (tz != null) obs.push({ hz, tz }); else skipped++;
  }
  /* nessun arco in nessuna replica = l'azione scelta non passa dal ramo del passaggio (gi188 risolve su un
     altro tipo di highlight). Non e' un cambio di gioco sbagliato, e' una scena che questo invariante non
     governa: la si DICHIARA fuori ambito invece di silenziarla o di bocciarla per il motivo sbagliato. */
  if (!obs.length) { console.log(`gi${String(gi).padStart(3)} · nessun arco di passaggio in ${REP} repliche — fuori ambito · ${txt}`); continue; }
  if (obs.length < 2) { issues.push(`gi${gi}: solo ${obs.length} misure su ${REP} (${skipped} senza arco) — scena osservata troppo poco`); continue; }
  misurate++;

  const lat = obs.map(o => Math.abs(o.tz - o.hz));
  const med = lat.slice().sort((a, b) => a - b)[Math.floor(lat.length / 2)];
  const cross = obs.filter(o => Math.sign(o.tz) !== Math.sign(o.hz)).length;
  const lati = [...new Set(obs.map(o => Math.sign(o.tz) || 1))];
  console.log(`gi${String(gi).padStart(3)} · attraversa ${cross}/${obs.length} · laterale mediano ${med.toFixed(1)}u · lati distinti ${lati.length} · ${txt}`);
  console.log(`        ${obs.map(o => `${o.hz.toFixed(0)}→${o.tz.toFixed(0)}`).join('  ')}`);

  if (med < 10) issues.push(`gi${gi}: il cambio di gioco sposta la palla di ${med.toFixed(1)}u di lato — e' un appoggio, non un ribaltamento`);
  if (cross < obs.length) issues.push(`gi${gi}: ${obs.length - cross}/${obs.length} repliche restano sullo STESSO lato dell'eroe`);
  if (lati.length > 1) issues.push(`gi${gi}: la stessa scena sceglie lati diversi fra le repliche — il lato e' tirato a sorte, non deciso`);
}

/* un guardiano che dichiara tutto «fuori ambito» e' verde per finta */
console.log(`\nscene misurate ${misurate}/${scene.length}`);
if (misurate < 4) issues.push(`solo ${misurate} scene misurate davvero: la misura non e' stata fatta`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ CAMBIO DI GIOCO OK — ribalta sul lato opposto, sempre lo stesso a parita\' di scena');
