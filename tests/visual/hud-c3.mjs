#!/usr/bin/env node
/* ============================================================================
   hud-c3.mjs — MISURA IL HUD DELLA PARTITA SECONDO LE DECISIONI DEL PO (C3)
   ----------------------------------------------------------------------------
   Tavole approvate: scratchpad/hud/{Main,Interazione,Esito}.dc.html (412×915).
   Tre decisioni misurate, rosso (__CPM_NO901) contro verde:
     1. `playing`   — [data-cpm="barra"] alta ≤62 px (banda), e quanto della zona
                       di campo (dal fondo della barra alla striscia di stato,
                       [data-cpm="striscia"]) è coperto da elementi con testo (≤25%).
     2. `hl_choose` — [data-cpm="scelte"] ≤44% dell'altezza dello schermo, NESSUN
                       carattere «%» nel testo delle scelte, righe cliccabili ≥44 px
                       (il PO ha chiesto ≥52 px: misurate entrambe le soglie).
     3. `hl_result` — [data-cpm="esito"] ≤40% dell'altezza dello schermo, e numero
                       di tasti «grandi» (larghezza ≥200 px) contro «piccoli» (<80 px).
   Autoplay reale (seed 4242) per `playing`; se `hl_choose`/`hl_result` non arrivano
   entro il budget, fallback su `__CPM_FORCE_SIT`/`__CPM_RESOLVE` (le stesse sonde
   di test-only già usate da quick-gate.mjs — non aggiungono logica di gioco).
   Foto: screencast CDP in PNG (page.screenshot rende il canvas WebGL nero).
   Uso:
     node hud-c3.mjs                    412×915, budget ~4 min/braccio
     CPM_H=700 node hud-c3.mjs          412×700
     CPM_BUDGET_S=90 node hud-c3.mjs    budget più corto (debug)
   ============================================================================ */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)); // tests/visual (non tests/visual/lib: __dirname di harness.mjs punta a lib/)
const H = +(process.env.CPM_H || 915);
const BUDGET_S = +(process.env.CPM_BUDGET_S || 240); // "~4 minuti" per braccio, per decisione del PO
const FALLBACK_GI = 40;   // situation NON-aim, forzabile in hl_choose (verificata: filterSitActions ok)
const FALLBACK_GI_R = 14; // situation la cui azione 0 NON è "goal" (esito rapido, niente attesa celebrazione)
const OUT = path.join(HERE, 'out', 'hud-c3');
fs.mkdirSync(OUT, { recursive: true });

function pct(n) { return (n * 100).toFixed(1) + '%'; }
function fmt(n, d = 1) { return (n == null || Number.isNaN(n)) ? '—' : (+n).toFixed(d); }

async function shot(cdp, frameGetter, filePath) {
  const buf = frameGetter();
  if (!buf) return false;
  fs.writeFileSync(filePath, buf);
  return true;
}

async function misuraBraccio(arm) {
  // arm: {name:'rosso'|'verde', rosso:bool}
  const srv = await startServer();
  const port = srv.address().port;
  const b = await launchBrowser();
  const page = await b.newPage({ viewport: { width: 412, height: H }, isMobile: true, hasTouch: true });
  await installCdnRoutes(page);
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/BABEL/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });
  await page.addInitScript((o) => {
    window.__CPM_GLB = true; // le foto si fanno SEMPRE con i GLB accesi
    if (o.rosso) window.__CPM_NO901 = true;
  }, { rosso: arm.rosso });

  const cdp = await page.context().newCDPSession(page);
  let ultimoFrame = null;
  cdp.on('Page.screencastFrame', e => { ultimoFrame = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 412, maxHeight: H, everyNthFrame: 1 });

  const res = { arm: arm.name, h: H, errs: 0, playing: null, choose: null, result: null, photos: {} };

  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
    await sleep(400);
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }));

    const playingSamples = [];
    let chooseSample = null, resultSample = null;
    const t0 = Date.now();
    while (Date.now() - t0 < BUDGET_S * 1000 && (!chooseSample || !resultSample)) {
      await sleep(300);
      const ph = await page.evaluate(() => (window.__CPM_PHASE ? window.__CPM_PHASE() : null));
      if (ph === 'playing') {
        const s = await page.evaluate(() => {
          const barra = document.querySelector('[data-cpm="barra"]');
          const striscia = document.querySelector('[data-cpm="striscia"]');
          if (!barra) return null;
          const bRect = barra.getBoundingClientRect();
          const top = bRect.bottom;
          const bottom = striscia ? striscia.getBoundingClientRect().top : window.innerHeight;
          const fieldH = Math.max(0, bottom - top);
          let covered = 0;
          if (fieldH > 0) {
            const all = document.querySelectorAll('body *');
            for (const el of all) {
              if (el.children.length > 0) continue; // solo foglie: niente doppio conteggio contenitore+figli
              const txt = (el.textContent || '').trim();
              if (!txt) continue;
              const cs = getComputedStyle(el);
              if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity || '1') === 0) continue;
              const r = el.getBoundingClientRect();
              if (r.width <= 0 || r.height <= 0) continue;
              const iTop = Math.max(r.top, top), iBottom = Math.min(r.bottom, bottom);
              if (iBottom <= iTop) continue;
              covered += (iBottom - iTop) * Math.min(r.width, window.innerWidth);
            }
          }
          const zoneArea = fieldH * window.innerWidth;
          return { barraH: bRect.height, fieldH, pct: zoneArea > 0 ? covered / zoneArea : 0 };
        });
        if (s) playingSamples.push(s);
        if (playingSamples.length === 1 || (playingSamples.length % 20 === 0)) {
          if (!res.photos.playing) { await shot(cdp, () => ultimoFrame, path.join(OUT, `${arm.name}-${H}-playing.png`)); res.photos.playing = `${arm.name}-${H}-playing.png`; }
        }
      } else if (ph === 'hl_choose' && !chooseSample) {
        await sleep(250); // lascia assestare il render della scheda
        chooseSample = await page.evaluate(() => {
          const el = document.querySelector('[data-cpm="scelte"]');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const btns = [...el.querySelectorAll('button')];
          const rowHeights = btns.map(bt => bt.getBoundingClientRect().height);
          return { h: r.height, viewH: window.innerHeight, pct: r.height / window.innerHeight, nRows: btns.length, rowHeights, hasPct: /%/.test(el.textContent || ''), txt: (el.textContent || '').slice(0, 240) };
        });
        if (chooseSample) { await shot(cdp, () => ultimoFrame, path.join(OUT, `${arm.name}-${H}-hl_choose.png`)); res.photos.choose = `${arm.name}-${H}-hl_choose.png`; }
      } else if (ph === 'hl_result' && !resultSample) {
        await sleep(250);
        resultSample = await page.evaluate(() => {
          const el = document.querySelector('[data-cpm="esito"]');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const btns = [...el.querySelectorAll('button')].map(bt => { const rr = bt.getBoundingClientRect(); return { w: rr.width, h: rr.height }; });
          const big = btns.filter(x => x.w >= 200).length;
          const small = btns.filter(x => x.w < 80).length;
          return { h: r.height, viewH: window.innerHeight, pct: r.height / window.innerHeight, nBtns: btns.length, big, small, btns };
        });
        if (resultSample) { await shot(cdp, () => ultimoFrame, path.join(OUT, `${arm.name}-${H}-hl_result.png`)); res.photos.result = `${arm.name}-${H}-hl_result.png`; }
      }
    }

    // Fallback: se l'autoplay non ha mai offerto una scelta o un esito entro il budget, forza la scena
    // (stessa sonda test-only usata da quick-gate.mjs: __CPM_FORCE_SIT/__CPM_RESOLVE — nessuna logica nuova).
    if (!chooseSample) {
      await page.evaluate(() => { window.__CPM_AUTOPLAY(false); });
      await page.evaluate((gi) => window.__CPM_FORCE_SIT(gi, true), FALLBACK_GI);
      await sleep(900);
      chooseSample = await page.evaluate(() => {
        const el = document.querySelector('[data-cpm="scelte"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const btns = [...el.querySelectorAll('button')];
        const rowHeights = btns.map(bt => bt.getBoundingClientRect().height);
        return { h: r.height, viewH: window.innerHeight, pct: r.height / window.innerHeight, nRows: btns.length, rowHeights, hasPct: /%/.test(el.textContent || ''), txt: (el.textContent || '').slice(0, 240), forzata: true };
      });
      if (chooseSample) { await shot(cdp, () => ultimoFrame, path.join(OUT, `${arm.name}-${H}-hl_choose.png`)); res.photos.choose = `${arm.name}-${H}-hl_choose.png`; }
    }
    if (!resultSample) {
      await page.evaluate((gi) => window.__CPM_FORCE_SIT(gi, true), FALLBACK_GI_R);
      await sleep(900);
      await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
      await sleep(3200);
      resultSample = await page.evaluate(() => {
        const el = document.querySelector('[data-cpm="esito"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const btns = [...el.querySelectorAll('button')].map(bt => { const rr = bt.getBoundingClientRect(); return { w: rr.width, h: rr.height }; });
        const big = btns.filter(x => x.w >= 200).length;
        const small = btns.filter(x => x.w < 80).length;
        return { h: r.height, viewH: window.innerHeight, pct: r.height / window.innerHeight, nBtns: btns.length, big, small, btns, forzata: true };
      });
      if (resultSample) { await shot(cdp, () => ultimoFrame, path.join(OUT, `${arm.name}-${H}-hl_result.png`)); res.photos.result = `${arm.name}-${H}-hl_result.png`; }
    }

    if (playingSamples.length) {
      const avgPct = playingSamples.reduce((a, s) => a + s.pct, 0) / playingSamples.length;
      const maxPct = Math.max(...playingSamples.map(s => s.pct));
      const barraH = Math.max(...playingSamples.map(s => s.barraH));
      res.playing = { n: playingSamples.length, barraH, avgPct, maxPct };
    }
    res.choose = chooseSample;
    res.result = resultSample;
  } finally {
    res.errs = errs.length;
    res.errsList = errs.slice(0, 15);
    await b.close();
    srv.close();
  }
  return res;
}

(async () => {
  console.log(`hud-c3 · viewport 412×${H} · budget ${BUDGET_S}s/braccio · GLB on · seed 4242`);
  const verde = await misuraBraccio({ name: 'verde', rosso: false });
  const rosso = await misuraBraccio({ name: 'rosso', rosso: true });

  const rows = [];
  rows.push(['#', 'misura', 'banda PO', 'rosso (__CPM_NO901)', 'verde (nuovo)']);
  rows.push(['1', 'barra: altezza (playing)', '≤ 62 px', rosso.playing ? fmt(rosso.playing.barraH, 0) + ' px' : '—', verde.playing ? fmt(verde.playing.barraH, 0) + ' px' : '—']);
  rows.push(['1', 'campo: testo nella zona (media)', '≤ 25 %', rosso.playing ? pct(rosso.playing.avgPct) : '—', verde.playing ? pct(verde.playing.avgPct) : '—']);
  rows.push(['1', 'campo: testo nella zona (picco)', '(info)', rosso.playing ? pct(rosso.playing.maxPct) : '—', verde.playing ? pct(verde.playing.maxPct) : '—']);
  rows.push(['2', 'scelte: altezza scheda', `≤ 44 % (${(0.44 * H).toFixed(0)} px)`, rosso.choose ? pct(rosso.choose.pct) + ' (' + fmt(rosso.choose.h, 0) + ' px)' : '—', verde.choose ? pct(verde.choose.pct) + ' (' + fmt(verde.choose.h, 0) + ' px)' : '—']);
  rows.push(['2', 'scelte: caratteri "%" nel testo', 'NESSUNO', rosso.choose ? (rosso.choose.hasPct ? 'SÌ (presente)' : 'no') : '—', verde.choose ? (verde.choose.hasPct ? 'SÌ (presente)' : 'no') : '—']);
  rows.push(['2', 'scelte: righe e altezza min.', '3 righe ≥44 px (PO: ≥52 px)', rosso.choose ? `${rosso.choose.nRows} righe, min ${fmt(Math.min(...(rosso.choose.rowHeights.length?rosso.choose.rowHeights:[0])), 0)} px` : '—', verde.choose ? `${verde.choose.nRows} righe, min ${fmt(Math.min(...(verde.choose.rowHeights.length?verde.choose.rowHeights:[0])), 0)} px` : '—']);
  rows.push(['3', 'esito: altezza banda', `≤ 40 % (${(0.40 * H).toFixed(0)} px)`, rosso.result ? pct(rosso.result.pct) + ' (' + fmt(rosso.result.h, 0) + ' px)' : '—', verde.result ? pct(verde.result.pct) + ' (' + fmt(verde.result.h, 0) + ' px)' : '—']);
  rows.push(['3', 'esito: tasti grandi (≥200px) / piccoli (<80px)', '1 grande + 1 piccolo', rosso.result ? `${rosso.result.big} grandi / ${rosso.result.small} piccoli (bottoni tot. ${rosso.result.nBtns})` : '—', verde.result ? `${verde.result.big} grandi / ${verde.result.small} piccoli (bottoni tot. ${verde.result.nBtns})` : '—']);

  const widths = rows[0].map((_, ci) => Math.max(...rows.map(r => String(r[ci]).length)));
  const line = r => r.map((c, ci) => String(c).padEnd(widths[ci])).join('  |  ');
  console.log('\n' + line(rows[0]));
  console.log(widths.map(w => '-'.repeat(w)).join('--|--'));
  for (const r of rows.slice(1)) console.log(line(r));

  console.log(`\nerrori pagina — rosso: ${rosso.errs}, verde: ${verde.errs}`);
  if (rosso.errs) rosso.errsList.forEach(e => console.log(' [rosso]', e));
  if (verde.errs) verde.errsList.forEach(e => console.log(' [verde]', e));

  console.log('\nforzate (fallback __CPM_FORCE_SIT):', 'rosso.choose=' + !!(rosso.choose && rosso.choose.forzata), 'rosso.result=' + !!(rosso.result && rosso.result.forzata), 'verde.choose=' + !!(verde.choose && verde.choose.forzata), 'verde.result=' + !!(verde.result && verde.result.forzata));

  console.log('\nfoto salvate in', OUT + ':');
  for (const arm of [verde, rosso]) for (const k of ['playing', 'choose', 'result']) if (arm.photos[k]) console.log(' -', arm.photos[k]);

  const failHard = (verde.errs > 0) || (rosso.errs > 0);
  process.exit(failHard ? 1 : 0);
})();
