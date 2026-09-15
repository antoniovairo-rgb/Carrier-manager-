/* [7.893 STRUMENTO, aggiornato 7.905 — C3 v4] LA BARRA SUPERIORE SI SPECCHIA NEL SECONDO TEMPO? E IL FILO CON LEI?
   PO 14/09: «nella barra superiore la posizione degli scudetti e delle relative statistiche devono essere
   invertite tra il primo ed il secondo tempo». PO 15/09: «non ho notato l'inversione degli stemmi al cambio
   campo», «non ho capito se i colori della barra sono coerenti con le maglie».
   Questa sonda non giudica lo stile: legge a schermo, in ENTRAMBI i bracci (rosso = __CPM_NO901, verde = nuovo),
     1. la x dello scudo di casa ([data-cpm="scudo-casa"]) e il LATO del segmento casa del filo del possesso
        ([data-cpm="filo-casa"] dentro [data-cpm="filo"]) al 44' (primo tempo) e al 46' (secondo): devono cambiare
        INSIEME (nel 7.901 il filo restava con la casa a sinistra);
     2. al 46': la transizione degli stemmi esiste (computed animationName/animationDuration di scudo-casa) e
        l'etichetta [data-cpm="cambio-campo"] compare, poi sparisce (opacity 0 / visibility hidden) entro 4 s;
     3. i colori: filo casa/ospiti (maglie indossate: scoreHomeCol = _mkits.homeShirt, come il 3D) e stemmi
        (secondo <stop> del gradiente di TeamBadge = colore del club) — cosi' il PO vede se coincidono.
   Chromium 412×915, GLB spento (qui non serve la resa 3D), autoplay seed 7300, campiona ogni 200 ms.
   Uso: node scudetti-893.mjs   (CPM_SOLO=rosso|verde per un braccio solo) */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const SOLO = process.env.CPM_SOLO || '';
const leggi = (page) => page.evaluate(() => { try {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return { x: +q.left.toFixed(0), w: +q.width.toFixed(0) }; };
  const bar = document.querySelector('[data-cpm="barra"]');
  const filo = document.querySelector('[data-cpm="filo"]'), fc = document.querySelector('[data-cpm="filo-casa"]'), fo = document.querySelector('[data-cpm="filo-ospiti"]');
  let filoLato = null, filoCol = null, filoColOsp = null;
  if (filo && fc) { const F = filo.getBoundingClientRect(), C = fc.getBoundingClientRect(); filoLato = (C.left - F.left) < 1.5 ? 'sinistra' : ((F.right - C.right) < 1.5 ? 'destra' : 'centro?'); filoCol = getComputedStyle(fc).backgroundColor; filoColOsp = fo ? getComputedStyle(fo).backgroundColor : null; }
  const stopCol = (sel) => { const st = document.querySelectorAll(sel + ' svg stop'); return st && st[1] ? st[1].getAttribute('stop-color') : null; };
  const sc = document.querySelector('[data-cpm="scudo-casa"]'); const cs = sc ? getComputedStyle(sc) : null;
  const cc = document.querySelector('[data-cpm="cambio-campo"]'); const ccs = cc ? getComputedStyle(cc) : null;
  return { min: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, casa: r('[data-cpm="scudo-casa"]'), ospiti: r('[data-cpm="scudo-ospiti"]'),
    specchio: bar ? bar.getAttribute('data-specchio') : null, filoLato, filoCol, filoColOsp,
    stemmaCasa: stopCol('[data-cpm="scudo-casa"]'), stemmaOsp: stopCol('[data-cpm="scudo-ospiti"]'),
    anim: cs ? cs.animationName : null, animDur: cs ? cs.animationDuration : null,
    cambio: cc ? { opacity: ccs.opacity, visibility: ccs.visibility, testo: cc.textContent } : null };
} catch (e) { return { err: String(e) }; } });

async function braccio(nome, rosso) {
  const srv = await startServer(); const port = srv.address().port;
  const b = await launchBrowser();
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript((o) => { window.__CPM_GLB = false; if (o.rosso) window.__CPM_NO901 = true; }, { rosso });
  await openMatch(page, port, { skipLoadAll: true, name: 'Ch' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
  let primo = null, secondo = null, colori = null, dopo4s = null; const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    const s = await leggi(page);
    if (s && s.min != null && s.casa && s.ospiti) {
      if (!colori && s.min >= 5) colori = { filoCasa: s.filoCol, filoOspiti: s.filoColOsp, stemmaCasa: s.stemmaCasa, stemmaOspiti: s.stemmaOsp };
      if (!primo && s.min >= 40 && s.min <= 45) primo = s;
      if (!secondo && s.min >= 46) { secondo = s; const t1 = Date.now(); await page.waitForTimeout(4000); dopo4s = await leggi(page); dopo4s._dtMs = Date.now() - t1; break; }
    }
    await page.waitForTimeout(200);
  }
  await b.close(); srv.close();
  return { nome, primo, secondo, dopo4s, colori, errs: errs.length };
}

const out = {};
if (SOLO !== 'rosso') out.verde = await braccio('verde', false);
if (SOLO !== 'verde') out.rosso = await braccio('rosso', true);
const sinistra = (s) => s && s.casa && s.ospiti ? (s.casa.x < s.ospiti.x ? 'sinistra' : 'destra') : '?';
const riga = (k, f) => console.log(k.padEnd(46) + '|  ' + ['rosso', 'verde'].map(a => (out[a] ? String(f(out[a])) : '—').padEnd(34)).join('|  '));
console.log('\nSCUDETTI + FILO (412×915) — rosso (__CPM_NO901) contro verde');
console.log('misura'.padEnd(46) + '|  ' + 'rosso'.padEnd(34) + '|  verde');
riga('minuto del campione 1° / 2° tempo', a => (a.primo ? a.primo.min : '?') + "' / " + (a.secondo ? a.secondo.min : '?') + "'");
riga("scudo casa 44': x, lato", a => a.primo ? a.primo.casa.x + ' px, ' + sinistra(a.primo) : 'NON GIUDICABILE');
riga("scudo casa 46': x, lato", a => a.secondo ? a.secondo.casa.x + ' px, ' + sinistra(a.secondo) : 'NON GIUDICABILE');
riga("filo casa 44' / 46': lato", a => (a.primo ? a.primo.filoLato : '?') + ' / ' + (a.secondo ? a.secondo.filoLato : '?'));
riga('specchio attr 44\' / 46\'', a => (a.primo ? a.primo.specchio : '?') + ' / ' + (a.secondo ? a.secondo.specchio : '?'));
riga('stemmi e filo cambiano INSIEME', a => (a.primo && a.secondo) ? String(sinistra(a.primo) !== sinistra(a.secondo) && a.primo.filoLato !== a.secondo.filoLato && a.secondo.filoLato === sinistra(a.secondo)) : '?');
riga("transizione stemmi 46' (animationName, durata)", a => a.secondo ? (a.secondo.anim || 'none') + ', ' + (a.secondo.animDur || '-') : '?');
riga("etichetta «cambio campo» al 46'", a => a.secondo ? (a.secondo.cambio ? 'presente, opacity ' + a.secondo.cambio.opacity : 'assente') : '?');
riga('  …dopo 4 s (opacity / visibility)', a => a.dopo4s ? (a.dopo4s.cambio ? a.dopo4s.cambio.opacity + ' / ' + a.dopo4s.cambio.visibility : 'assente (smontata)') + ' [' + a.dopo4s._dtMs + ' ms]' : '?');
riga('colore filo casa (maglia indossata)', a => a.colori ? a.colori.filoCasa : '?');
riga('colore stemma casa (club)', a => a.colori ? a.colori.stemmaCasa : '?');
riga('colore filo ospiti (maglia indossata)', a => a.colori ? a.colori.filoOspiti : '?');
riga('colore stemma ospiti (club)', a => a.colori ? a.colori.stemmaOspiti : '?');
riga('errori pagina', a => a.errs);
console.log('\nJSON: ' + JSON.stringify(out) + '\n');
