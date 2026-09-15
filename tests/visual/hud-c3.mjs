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
                       (il PO ha chiesto ≥52 px) — misurata sia con la situation reale
                       incontrata dall'autoplay (di norma 3 opzioni: tutte le 191
                       situations base ne hanno esattamente 3, i piazzati fino a 4 —
                       nessuna ne ha ≥6, misurato con un giro completo su window.__CPM_SITS)
                       SIA con un caso sintetico "molte opzioni" (7): la lista
                       [data-cpm="scelte-righe"] deve scorrere DENTRO la scheda, le righe
                       restano a 52 px fisse (mai schiacciate) e almeno le prime tre devono
                       essere intere e visibili senza scorrere.
     3. `hl_result` — [data-cpm="esito"] ≤40% dell'altezza dello schermo, e numero
                       di tasti «grandi» (larghezza ≥200 px) contro «piccoli» (<80 px).
   Autoplay reale (seed 4242) per `playing` e per il primo campione di `hl_choose`/
   `hl_result`; se non arrivano entro il budget, fallback su `__CPM_FORCE_SIT`/
   `__CPM_RESOLVE` (le stesse sonde test-only già usate da quick-gate.mjs — nessuna
   logica nuova). Il caso "molte opzioni" è SEMPRE forzato (nessuna situation base ne
   ha ≥6: il monkeypatch clona le azioni di una situation reale SOLO nel contesto
   della pagina di test, mai nei frammenti di gioco).
   Foto: page.screenshot() diretto (il PO ha confermato che il canvas WebGL nero va
   bene: si giudica il HUD sopra, non la resa 3D — niente più screencast CDP, che
   consegnava un fotogramma più vecchio della misura). ATTENZIONE al gol: lo «stacco
   nero» cinematografico esistente (cutFx, 15-live-match, non toccato da questo lavoro)
   copre l'intero schermo per una frazione di secondo nella transizione della cella
   positiva — la banda esito è misurata correttamente anche in quella finestra (il DOM
   c'è) ma la FOTO in quel momento sarebbe tutta nera. `shotReady()` scatta, campiona la
   luminosità media dentro il rettangolo dell'elemento e RIPETE finché non è chiaramente
   sopra lo stacco nero (o esaurisce i tentativi) — è il "fotografa ≥1500 ms dopo la
   misura e ripeti finché il fotogramma cambia" richiesto, applicato con una verifica
   oggettiva invece di un'attesa a occhio.
   Uso:
     node hud-c3.mjs                    412×915, budget ~150s/braccio
     CPM_H=700 node hud-c3.mjs          412×700
     CPM_BUDGET_S=240 node hud-c3.mjs   budget più lungo (fedele al "~4 minuti" del PO)
   ============================================================================ */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)); // tests/visual (non tests/visual/lib: __dirname di harness.mjs punta a lib/)
const H = +(process.env.CPM_H || 915);
const BUDGET_S = +(process.env.CPM_BUDGET_S || 150);
const FALLBACK_GI = 40;    // situation NON-aim, 3 opzioni, forzabile in hl_choose (verificata)
const FALLBACK_GI_R = 14;  // situation la cui azione 0 NON è "goal" (esito rapido, niente attesa celebrazione)
const MANY_GI = 40;        // stessa situation, clonata a 7 opzioni SOLO nella pagina di test (vedi sopra)
const MANY_N = 7;
const OUT = path.join(HERE, 'out', 'hud-c3');
fs.mkdirSync(OUT, { recursive: true });

function pct(n) { return (n * 100).toFixed(1) + '%'; }
function fmt(n, d = 1) { return (n == null || Number.isNaN(n)) ? '—' : (+n).toFixed(d); }

/* Scatta e RIPETE finché il fotogramma non è coperto dallo stacco nero (cutFx/screenFlash,
   effetti cinematografici ESISTENTI sull'esito positivo — 15-live-match, non toccati qui):
   campiona la luminosità media dentro `rectFn()` (il rect dell'elemento HUD, letto dalla
   pagina) e accetta solo un fotogramma chiaramente non nero lì dentro. `rectFn` è una
   funzione da eseguire in pagina (page.evaluate) che ritorna {x,y,width,height} o null. */
async function shotReady(page, filePath, rectFn, { maxTries = 6, waitFirst = 1500, waitNext = 700 } = {}) {
  let lastBuf = null;
  for (let i = 0; i < maxTries; i++) {
    await sleep(i === 0 ? waitFirst : waitNext);
    const rect = await page.evaluate(rectFn).catch(() => null);
    const buf = await page.screenshot();
    lastBuf = buf;
    if (!rect) continue;
    try {
      const png = PNG.sync.read(buf);
      const x0 = Math.max(0, Math.round(rect.x + rect.width * 0.12));
      const x1 = Math.min(png.width - 1, Math.round(rect.x + rect.width * 0.88));
      const y0 = Math.max(0, Math.round(rect.y + rect.height * 0.12));
      const y1 = Math.min(png.height - 1, Math.round(rect.y + rect.height * 0.88));
      let sum = 0, n = 0;
      for (let y = y0; y <= y1; y += 3) for (let x = x0; x <= x1; x += 3) {
        const idx = (png.width * y + x) * 4;
        sum += png.data[idx] + png.data[idx + 1] + png.data[idx + 2]; n++;
      }
      const avg = n ? sum / n / 3 : 0;
      if (avg > 6) { fs.writeFileSync(filePath, buf); return { ok: true, avg, tries: i + 1 }; }
    } catch (_e) { /* pngjs non decodifica → salva comunque all'ultimo giro */ }
  }
  if (lastBuf) fs.writeFileSync(filePath, lastBuf);
  return { ok: false };
}

/* Legge la scheda scelte e la sua lista scorrevole: altezza, righe, quante sono INTERE
   e visibili senza scorrere (confronto fra il rect di ogni riga e il rect della lista). */
function readScelte() {
  const el = document.querySelector('[data-cpm="scelte"]');
  const lst = document.querySelector('[data-cpm="scelte-righe"]');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const btns = lst ? [...lst.querySelectorAll('button')] : [...el.querySelectorAll('button')];
  const rowHeights = btns.map(bt => bt.getBoundingClientRect().height);
  const lr = lst ? lst.getBoundingClientRect() : null;
  const visibiliIntere = lr ? btns.filter(bt => { const q = bt.getBoundingClientRect(); return q.top >= lr.top - 0.5 && q.bottom <= lr.bottom + 0.5; }).length : btns.length;
  return { h: r.height, viewH: window.innerHeight, pct: r.height / window.innerHeight, nRows: btns.length, rowHeights, visibiliIntere, hasPct: /%/.test(el.textContent || '') };
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

  const res = { arm: arm.name, h: H, errs: 0, playing: null, choose: null, result: null, many: null, photos: {} };

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
        if (!res.photos.playing) { await shotReady(page, path.join(OUT, `${arm.name}-${H}-playing.png`), () => { const el = document.querySelector('[data-cpm="striscia"]') || document.querySelector('[data-cpm="barra"]'); return el ? el.getBoundingClientRect() : null; }, { waitFirst: 300, maxTries: 3 }); res.photos.playing = `${arm.name}-${H}-playing.png`; }
      } else if (ph === 'hl_choose' && !chooseSample) {
        await sleep(500); // lascia assestare il render della scheda (l'ingresso ha un'animazione ~320ms)
        chooseSample = await page.evaluate(readScelte);
      } else if (ph === 'hl_result' && !resultSample) {
        await sleep(500);
        resultSample = await page.evaluate(() => {
          const el = document.querySelector('[data-cpm="esito"]');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const btns = [...el.querySelectorAll('button')].map(bt => { const rr = bt.getBoundingClientRect(); return { w: rr.width, h: rr.height }; });
          const big = btns.filter(x => x.w >= 200).length;
          const small = btns.filter(x => x.w < 80).length;
          return { h: r.height, viewH: window.innerHeight, pct: r.height / window.innerHeight, nBtns: btns.length, big, small, btns };
        });
      }
    }

    // Fallback SOLO PER LE MISURE: se l'autoplay non ha mai offerto una scelta o un esito entro il
    // budget, forza la scena per avere comunque un numero (stessa sonda test-only di quick-gate.mjs).
    if (!chooseSample) {
      await page.evaluate(() => { window.__CPM_AUTOPLAY(false); });
      await page.evaluate((gi) => window.__CPM_FORCE_SIT(gi, true), FALLBACK_GI);
      await sleep(900);
      chooseSample = await page.evaluate(readScelte);
      if (chooseSample) chooseSample.forzata = true;
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
        return { h: r.height, viewH: window.innerHeight, pct: r.height / window.innerHeight, nBtns: btns.length, big, small, btns };
      });
      if (resultSample) resultSample.forzata = true;
    }

    /* [C3 v2 — LE FOTO NON POSSONO CORRERE DIETRO A UN GOL.] Misurato: un gol naturale dell'autoplay
       innesca la cerimonia ESISTENTE (celebrazione + stacco nero cutFx + AUTO-AVANZAMENTO alla fine,
       15-live-match, non toccati qui) — la finestra utile per una foto pulita è una corsa contro un
       timer che a volte si perde (il retry di `shotReady` può restare indietro rispetto all'auto-
       avanzamento e fotografare la schermata SUCCESSIVA). Le MISURE sopra restano quelle "reali"
       (autoplay quando arriva, altrimenti forzate); le FOTO, sempre, arrivano da uno scenario forzato
       stabile — scelta senza timer (aspetta il tocco) ed esito SENZA gol (nessuna cerimonia, nessun
       auto-avanzamento) — cosi' sono sempre il fotogramma giusto, non una schermata successiva. */
    await page.evaluate(() => { window.__CPM_AUTOPLAY(false); });
    await page.evaluate((gi) => window.__CPM_FORCE_SIT(gi, true), FALLBACK_GI);
    await sleep(900);
    await shotReady(page, path.join(OUT, `${arm.name}-${H}-hl_choose.png`), () => { const el = document.querySelector('[data-cpm="scelte"]'); return el ? el.getBoundingClientRect() : null; });
    res.photos.choose = `${arm.name}-${H}-hl_choose.png`;
    await page.evaluate((gi) => window.__CPM_FORCE_SIT(gi, true), FALLBACK_GI_R);
    await sleep(900);
    await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
    await sleep(3200); // stesso tetto di fallback usato per la misura: niente gol, niente cerimonia, il reveal e' quello e resta
    await shotReady(page, path.join(OUT, `${arm.name}-${H}-hl_result.png`), () => { const el = document.querySelector('[data-cpm="esito"]'); return el ? el.getBoundingClientRect() : null; });
    res.photos.result = `${arm.name}-${H}-hl_result.png`;

    // "Molte opzioni" — SEMPRE forzato: nessuna situation base ne ha ≥6 (191/191 ne hanno 3, i
    // piazzati arrivano a 4; verificato con un giro completo su window.__CPM_SITS). Per misurare
    // che la scheda regge comunque, si clona la situation FALLBACK_GI a 7 opzioni SOLO nella pagina
    // di test (il file sorgente delle situations non viene toccato).
    await page.evaluate(([gi, n]) => {
      const S = window.__CPM_SITS; const base = S[gi].actions.slice(0, 3); const many = [];
      for (let i = 0; i < n; i++) { const a = { ...base[i % 3] }; a.label = a.label + ' ' + (i + 1); many.push(a); }
      S[gi].actions = many;
    }, [MANY_GI, MANY_N]);
    await page.evaluate((gi) => window.__CPM_FORCE_SIT(gi, true), MANY_GI);
    await sleep(900);
    const manySample = await page.evaluate(readScelte);
    if (manySample) { await shotReady(page, path.join(OUT, `${arm.name}-${H}-hl_choose_molte.png`), () => { const el = document.querySelector('[data-cpm="scelte"]'); return el ? el.getBoundingClientRect() : null; }, { waitFirst: 800 }); res.photos.molte = `${arm.name}-${H}-hl_choose_molte.png`; }
    res.many = manySample;

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

  const minOf = (arr) => (arr && arr.length ? Math.min(...arr) : null);

  const rows = [];
  rows.push(['#', 'misura', 'banda PO', 'rosso (__CPM_NO901)', 'verde (nuovo)']);
  rows.push(['1', 'barra: altezza (playing)', '≤ 62 px', rosso.playing ? fmt(rosso.playing.barraH, 0) + ' px' : '—', verde.playing ? fmt(verde.playing.barraH, 0) + ' px' : '—']);
  rows.push(['1', 'campo: testo nella zona (media)', '≤ 25 %', rosso.playing ? pct(rosso.playing.avgPct) : '—', verde.playing ? pct(verde.playing.avgPct) : '—']);
  rows.push(['1', 'campo: testo nella zona (picco)', '(info)', rosso.playing ? pct(rosso.playing.maxPct) : '—', verde.playing ? pct(verde.playing.maxPct) : '—']);
  rows.push(['2', 'scelte (reale, autoplay): altezza scheda', `≤ 44 % (${(0.44 * H).toFixed(0)} px)`, rosso.choose ? pct(rosso.choose.pct) + ' (' + fmt(rosso.choose.h, 0) + ' px)' : '—', verde.choose ? pct(verde.choose.pct) + ' (' + fmt(verde.choose.h, 0) + ' px)' : '—']);
  rows.push(['2', 'scelte (reale): caratteri "%" nel testo', 'NESSUNO', rosso.choose ? (rosso.choose.hasPct ? 'SÌ (presente)' : 'no') : '—', verde.choose ? (verde.choose.hasPct ? 'SÌ (presente)' : 'no') : '—']);
  rows.push(['2', 'scelte (reale): righe e altezza min.', 'PO: ≥52 px', rosso.choose ? `${rosso.choose.nRows} righe, min ${fmt(minOf(rosso.choose.rowHeights), 0)} px` : '—', verde.choose ? `${verde.choose.nRows} righe, min ${fmt(minOf(verde.choose.rowHeights), 0)} px` : '—']);
  rows.push(['2b', `scelte (7 opzioni sintetiche): altezza scheda`, `≤ 44 % (${(0.44 * H).toFixed(0)} px)`, rosso.many ? pct(rosso.many.pct) + ' (' + fmt(rosso.many.h, 0) + ' px)' : '—', verde.many ? pct(verde.many.pct) + ' (' + fmt(verde.many.h, 0) + ' px)' : '—']);
  rows.push(['2b', 'scelte (7 opz.): altezza min. riga (di 7)', 'PO: 52 px fissi', rosso.many ? `${rosso.many.nRows} righe, min ${fmt(minOf(rosso.many.rowHeights), 0)} px` : '—', verde.many ? `${verde.many.nRows} righe, min ${fmt(minOf(verde.many.rowHeights), 0)} px` : '—']);
  rows.push(['2b', 'scelte (7 opz.): righe intere visibili senza scorrere', '≥ 3', rosso.many ? String(rosso.many.visibiliIntere) : '—', verde.many ? String(verde.many.visibiliIntere) : '—']);
  rows.push(['3', 'esito: altezza banda', `≤ 40 % (${(0.40 * H).toFixed(0)} px)`, rosso.result ? pct(rosso.result.pct) + ' (' + fmt(rosso.result.h, 0) + ' px)' : '—', verde.result ? pct(verde.result.pct) + ' (' + fmt(verde.result.h, 0) + ' px)' : '—']);
  rows.push(['3', 'esito: tasti grandi (≥200px) / piccoli (<80px)', '1 bottone: 1 grande / 0 piccoli', rosso.result ? `${rosso.result.big} grandi / ${rosso.result.small} piccoli (bottoni tot. ${rosso.result.nBtns})` : '—', verde.result ? `${verde.result.big} grandi / ${verde.result.small} piccoli (bottoni tot. ${verde.result.nBtns})` : '—']);

  const widths = rows[0].map((_, ci) => Math.max(...rows.map(r => String(r[ci]).length)));
  const line = r => r.map((c, ci) => String(c).padEnd(widths[ci])).join('  |  ');
  console.log('\n' + line(rows[0]));
  console.log(widths.map(w => '-'.repeat(w)).join('--|--'));
  for (const r of rows.slice(1)) console.log(line(r));

  console.log(`\nerrori pagina — rosso: ${rosso.errs}, verde: ${verde.errs}`);
  if (rosso.errs) rosso.errsList.forEach(e => console.log(' [rosso]', e));
  if (verde.errs) verde.errsList.forEach(e => console.log(' [verde]', e));

  console.log('\nforzate (fallback __CPM_FORCE_SIT — il caso "7 opzioni" è SEMPRE forzato, vedi sopra):',
    'rosso.choose=' + !!(rosso.choose && rosso.choose.forzata), 'rosso.result=' + !!(rosso.result && rosso.result.forzata),
    'verde.choose=' + !!(verde.choose && verde.choose.forzata), 'verde.result=' + !!(verde.result && verde.result.forzata));

  console.log('\nfoto salvate in', OUT + ':');
  for (const arm of [verde, rosso]) for (const k of ['playing', 'choose', 'result', 'molte']) if (arm.photos[k]) console.log(' -', arm.photos[k]);

  const failHard = (verde.errs > 0) || (rosso.errs > 0);
  process.exit(failHard ? 1 : 0);
})();
