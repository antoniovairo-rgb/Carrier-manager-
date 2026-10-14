#!/usr/bin/env node
/* [giro 20 — PO-241 «Il caricamento dei giocatori ed i relativi messaggi devono essere più furbi e logici … non mi piace il messaggio
   "caricamento giocatori"»] MISURA dell'attesa dei corpi prima della prima scena, col GLB ACCESO.
   Partita vera (provino), contesto nuovo = cache fredda, service worker bloccato, rete lenta come nella sonda di PO-232 (ogni .glb
   2-6 s, teste CPM_RIT_TESTA, default 20 s). Prima di «Nuova carriera» si resta CPM_MENU_MS sulla home (il tempo che un giocatore
   passa sui menu: e' la finestra in cui il pre-caricamento lavora). Campionamento ogni 200 ms di fase, cronometro e
   __CPM_CORPI232(): l'ATTESA e' il tempo in `playing` con i corpi non pronti (cronometro fermo); si ripartisce per motivo
   (ch38/cgtrader/compila/testa/clip). Si registra anche cosa mostra il riquadro d'attesa (testo) e se compare la vecchia scritta.
   GUARDIANO (CPM_GIUDICA=1, o --guardiano): nessuna «Caricamento giocatori» mai vista; se c'e' stata attesa ≥ 1 s il riquadro ha
   mostrato almeno un contenuto (statistica o curiosita'); a fine menu il pre-caricamento ha almeno CPM_PRE_MIN file (12; rosso 4/28,
   verde 20/28); con CPM_ATTESA_MAX (ms) l'attesa mediana non supera il tetto (spento di default: dipende dalla CPU del runner).
   Rosso: CPM_ROSSO=__CPM_NO_ATTESA241 (pre-caricamento anticipato spento e vecchia scritta).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node attesa-241.mjs
        CPM_PARTITE241 (2) · CPM_MENU_MS (0) · CPM_RIT_MIN/CPM_RIT_MAX (2000/6000) · CPM_RIT_TESTA (20000) */
import fs from 'fs'; import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

/* --guardiano (npm run attesa-241): 2 partite, 15 s di menu, teste allo stesso ritardo degli altri file, giudizio acceso */
const GUARD = process.argv.includes('--guardiano');
if (GUARD) { process.env.CPM_GIUDICA = '1'; process.env.CPM_MENU_MS ??= '15000'; process.env.CPM_RIT_TESTA ??= '0'; }
const PARTITE = +(process.env.CPM_PARTITE241 || 2), MENU = +(process.env.CPM_MENU_MS || 0), PRE_MIN = +(process.env.CPM_PRE_MIN || 12);
const RMIN = +(process.env.CPM_RIT_MIN ?? 2000), RMAX = +(process.env.CPM_RIT_MAX ?? 6000), RTESTA = +(process.env.CPM_RIT_TESTA ?? 20000);
const ROSSO = process.env.CPM_ROSSO || '';
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const ritardo = url => (/HEAD_hair_/.test(url) && RTESTA) ? RTESTA : (RMAX <= 0 ? 0 : RMIN + (hash(url.split('?')[0].split('/').pop()) % (RMAX - RMIN + 1)));

const OUTD = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'attesa-241');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function partita(n) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); const page = await ctx.newPage();
  await installCdnRoutes(page);
  const richieste = []; let tMatch = 0;
  await ctx.route(/\.glb(\?|$)|HEAD_hair_[a-z]+\.png/, async route => { const ms = ritardo(route.request().url()); richieste.push([tMatch ? Date.now() - tMatch : -1, route.request().url().split('/').pop()]); if (ms) await sleep(ms); try { await route.continue(); } catch (e) {} });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); let menuPre = '-';
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; if (r) String(r).split(',').forEach(k => { window[k.trim()] = 1; }); }, ROSSO);
  if (MENU) { /* tempo sui menu prima del provino: la pagina si carica e resta sulla home */
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    /* il tempo sui menu si conta da quando il pre-caricamento e' partito: in headless Babel trascrive il gioco per ~10 s dopo il
       «load», tempo che sul telefono (build precompilata) non esiste */
    await page.waitForFunction(() => !!window.__CPM_PRE237, null, { timeout: 60000 }).catch(() => {}); await sleep(MENU);
    menuPre = await page.evaluate(() => window.__CPM_PRE237 ? window.__CPM_PRE237.fatti + '/' + window.__CPM_PRE237.tot : '-').catch(() => '-');
    const orig = page.goto.bind(page); page.goto = async () => {}; /* openMatch non deve ricaricare: perderebbe il pre-caricamento */
    await openMatch(page, port, { skipLoadAll: true, name: 'Attesa ' + n }); page.goto = orig;
  } else await openMatch(page, port, { skipLoadAll: true, name: 'Attesa ' + n });
  tMatch = Date.now();
  const t0 = Date.now(); let foto = false, attesa = 0, prev = null, motivi = {}, testi = new Set(), vecchia = false, primaScena = null, inPlay = null;
  while (Date.now() - t0 < 120000) {
    const s = await page.evaluate(() => { const r = window.__CPM_CORPI232 ? window.__CPM_CORPI232() : null; const box = document.querySelector('[data-cpm="corpi232"],[data-cpm="attesa241"]');
      return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), c: window.__CPM_CLOCK ? window.__CPM_CLOCK() : 0, pronti: r ? !!r.pronti : true, motivo: r && r.motivo, box: box ? box.textContent : null }; }).catch(() => null);
    if (!s) break; const t = Date.now();
    if (s.ph === 'playing' && inPlay == null) inPlay = t - t0;
    if (s.box && !foto) { foto = true; try { fs.mkdirSync(OUTD, { recursive: true }); await page.screenshot({ path: path.join(OUTD, `riquadro-${ROSSO ? 'rosso' : 'verde'}-${n}.png`) }); } catch (e) {} }
    if (s.box) { testi.add(s.box.trim().slice(0, 140)); if (/Caricamento giocatori/i.test(s.box)) vecchia = true; }
    if (prev && prev.ph === 'playing' && !prev.pronti) { const d = t - prev.t; attesa += d; motivi[prev.motivo] = (motivi[prev.motivo] || 0) + d; }
    if (/^hl_/.test(s.ph || '')) { primaScena = t - t0; break; }
    if (s.ph === 'playing' && s.pronti && s.c >= 8) { await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); }).catch(() => {}); }
    prev = { ...s, t }; await sleep(200);
  }
  const pre = await page.evaluate(() => window.__CPM_PRE237 || null).catch(() => null);
  await ctx.close();
  if (process.env.CPM_DBG241) console.log('   richieste .glb/teste dopo l\'apertura della partita: ' + JSON.stringify(richieste.filter(r => r[0] >= 0)));
  return { n, menuPre, inPlayS: inPlay == null ? null : +(inPlay / 1000).toFixed(1), attesaMs: attesa, motivi, primaScenaS: primaScena == null ? null : +(primaScena / 1000).toFixed(1), testi: [...testi], vecchia, pre, errs: errs.slice(0, 2) };
}
const tutte = [];
for (let i = 0; i < PARTITE; i++) { const r = await partita(i + 1); tutte.push(r);
  console.log(`partita ${r.n}: playing a ${r.inPlayS}s · ATTESA corpi ${r.attesaMs} ms ${JSON.stringify(r.motivi)} · prima scena a ${r.primaScenaS}s · pre-caricamento a fine menu ${r.menuPre}, a fine misura ${r.pre ? r.pre.fatti + '/' + r.pre.tot : '-'}${r.errs.length ? ' · pageerror ' + r.errs[0] : ''}`);
  r.testi.forEach(t => console.log('   riquadro: «' + t + '»')); }
await b.close(); srv.close();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : 0; };
const att = tutte.map(r => r.attesaMs);
console.log(`ATTESA-241 ${ROSSO ? 'ROSSO ' + ROSSO : 'verde'} · menu ${MENU} ms · rete ${RMIN}-${RMAX} ms, teste ${RTESTA} ms · attese ${JSON.stringify(att)} · mediana ${med(att)} ms · vecchia scritta ${tutte.filter(r => r.vecchia).length}/${tutte.length}`);
if (process.env.CPM_GIUDICA) {
  const ko = [];
  if (tutte.some(r => r.vecchia)) ko.push('compare ancora «Caricamento giocatori…»');
  if (tutte.some(r => r.primaScenaS == null)) ko.push('una partita non ha raggiunto la prima scena');
  tutte.forEach(r => { if (r.attesaMs >= 1000 && !r.testi.some(t => t.length > 12)) ko.push(`partita ${r.n}: ${r.attesaMs} ms d'attesa senza contenuto nel riquadro`); });
  /* il pre-caricamento a fine menu dipende dal modello di rete della sonda, non dalla CPU del runner: misura robusta di (a).
     Misurato a 15 s di menu: 4/28 col rosso (uno alla volta), 20/28 col verde (sei in volo) */
  if (MENU) tutte.forEach(r => { const f = parseInt(String(r.menuPre), 10); if (!(f >= PRE_MIN)) ko.push(`partita ${r.n}: pre-caricamento a fine menu ${r.menuPre} (< ${PRE_MIN})`); });
  if (process.env.CPM_ATTESA_MAX && med(att) > +process.env.CPM_ATTESA_MAX) ko.push(`attesa mediana ${med(att)} ms > ${process.env.CPM_ATTESA_MAX}`);
  if (tutte.some(r => r.errs.length)) ko.push('pageerror ' + tutte.find(r => r.errs.length).errs[0]);
  if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
  console.log('✅ VERDE — attesa dei corpi senza scritta tecnica, con contenuto');
}
