#!/usr/bin/env node
/* [giro 54 PO-277 «l'ingresso dal tunnel piu' rapido (non velocissimo come prima) e saltabile; sfrutta il tempo per caricare i GLB»]
   SONDA/GUARDIANO sul percorso vero (salvataggio → partita → walkout) col GLB ACCESO. Campiona ogni 200 ms: fase, velo d'attesa
   (__CPM_WALKHOLD74), CH38 pronto (__CPM_GLB_READY), corpi pronti (__CPM_CORPI232), durata dichiarata dell'ingresso (__CPM_WALKDUR245).
   Tre bracci:
     verde  — ingresso intero: durata dichiarata nella banda [CPM_DMIN,CPM_DMAX] (default 16..26 s), nessun velo prima della camminata
              (il caricamento avviene DURANTE l'ingresso), corpi caricati e compilati alla fine dell'ingresso (la partita non aspetta; la sola «clip» a peso basso non e' caricamento).
     salta  — click sul pulsante «Salta ingresso» (data-cpm="salta-ingresso") dopo CPM_SALTA_MS (default 3000 ms): la fase lascia
              walkout entro 3 s (il 3D porta tutti al posto e chiude dal percorso naturale nello stesso fotogramma; la rete di 4 s scatterebbe dopo) e, coi corpi gia' caricati (CPM_RIT=0), nessuna attesa dei corpi dopo il salto (<= 1 s).
     salta-secco — __CPM_NO_ING277S: il pulsante taglia la fase a meta' → corpi in attesa senza clip, attesa PO-232 >= 3 s (rosso del salto).
     rosso  — __CPM_NO_ING277: durata di prima (~38 s), velo prima della camminata (>= 2 s con la rete lenta), nessun pulsante.
   Rete: i file cgtrader-*.glb arrivano con CPM_RIT ms di ritardo (default 25000; 0 = rete del banco).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node ingresso-277.mjs  (CPM_BRACCI=verde,salta,rosso) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const BRACCI = (process.env.CPM_BRACCI || 'verde,salta,salta-secco,rosso').split(',');
const DMIN = +(process.env.CPM_DMIN || 16), DMAX = +(process.env.CPM_DMAX || 26);
const SALTA_MS = +(process.env.CPM_SALTA_MS || 3000);
const RIT = process.env.CPM_RIT != null ? +process.env.CPM_RIT : 25000;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(braccio) {
  const rosso = braccio === 'rosso', secco = braccio === 'salta-secco', salta = braccio.startsWith('salta');
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  /* rete lenta sui soli corpi CGTrader (CPM_RIT ms a file, default 25 s): il pre-caricamento del menu non fa in tempo e il montaggio
     cade nell'ingresso — e' il caso del telefono che la correzione deve coprire. Service worker bloccato, o servirebbe lui i file. */
  if (RIT && !salta) await ctx.route(/cgtrader-[^/]*\.glb/, async r => { await sleep(RIT); await r.fallback(); });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_WALK245 = []; if (o.r) window.__CPM_NO_ING277 = 1; if (o.sec) window.__CPM_NO_ING277S = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso, sec: secco });
  const out = { braccio };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 60; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
    out.walk = (await ph()) === 'walkout';
    const S = []; const t0 = Date.now(); let cliccato = null, uscita = null, fotoSalta = false, fotoFila = false;
    while (Date.now() - t0 < +(process.env.CPM_TMAX || 320000)) {
      const s = await page.evaluate(() => { let c = null; try { c = window.__CPM_CORPI232 ? window.__CPM_CORPI232() : null; } catch (e) {}
        const btn = document.querySelector('[data-cpm="salta-ingresso"]');
        return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), hold: !!window.__CPM_WALKHOLD74, ready: window.__CPM_GLB_READY === true, corpi: !!(c && (c.pronti || !/^(ch38|cgtrader|compila|testa)$/.test(c.motivo || ''))), mot: c && c.motivo,
          dur: window.__CPM_WALKDUR245 || null, btn: !!(btn && btn.offsetParent !== null), velo: !!document.querySelector('[data-cpm="walkhold74"]'), kick: !!document.querySelector('[data-cpm="attesa241"],[data-cpm="corpi232"]') || /Verso il fischio|Caricamento giocatori/i.test(document.body.innerText || '') }; }).catch(() => null);
      if (!s) break; s.t = Date.now() - t0; S.push(s);
      if (salta && !cliccato && s.ph === 'walkout' && s.t >= SALTA_MS && s.btn) { if (!fotoSalta) { await page.screenshot({ path: new URL('./out/ingresso-277-pulsante.png', import.meta.url).pathname }).catch(() => {}); fotoSalta = true; }
        await page.click('[data-cpm="salta-ingresso"]').catch(() => {}); cliccato = Date.now() - t0; }
      if (s.ph !== 'walkout' && uscita == null) uscita = s.t;
      if (uscita != null && (s.t - uscita > 12000 || (s.corpi && !s.kick && s.t - uscita > 1500))) break;
      if (!salta && !fotoFila && s.ph === 'walkout' && s.dur) { const ts = await page.evaluate(() => { const W = window.__CPM_WALK245 || []; return W.length ? W[W.length - 1].t : 0; }).catch(() => 0);
        if (ts >= s.dur - 1.2) { await page.screenshot({ path: new URL('./out/ingresso-277-fila-' + braccio + '.png', import.meta.url).pathname }).catch(() => {}); fotoFila = true; } }
      await sleep(200);
    }
    const W = S.filter(s => s.ph === 'walkout');
    out.durataDich = (S.find(s => s.dur) || {}).dur ?? null;
    out.ingressoS = W.length ? +((W[W.length - 1].t - W[0].t) / 1000).toFixed(1) : null;
    out.veloS = +(W.filter(s => s.hold).length * 0.2).toFixed(1);
    const pr = S.find(s => s.ready); out.ch38S = pr ? +(pr.t / 1000).toFixed(1) : null;
    const pc = S.find(s => s.corpi); out.corpiS = pc ? +(pc.t / 1000).toFixed(1) : null;
    out.motivi = [...new Set(S.map(s => s.mot))].slice(0, 6);
    out.pulsante = W.some(s => s.btn);
    out.cliccatoS = cliccato != null ? +(cliccato / 1000).toFixed(1) : null; out.uscitaS = uscita != null ? +(uscita / 1000).toFixed(1) : null;
    const dopo = S.filter(s => uscita != null && s.t >= uscita);
    out.attesaDopoS = +(dopo.filter(s => s.kick).length * 0.2).toFixed(1);
    out.corpiAllaFine = uscita != null ? !!(S.filter(s => s.t <= uscita).slice(-1)[0] || {}).corpi : null;
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await ctx.close(); return out;
}
const R = {}; for (const br of BRACCI) { R[br] = await giro(br); console.log(br.toUpperCase() + ' ' + JSON.stringify(R[br])); }
await b.close(); srv.close();
if (process.env.CPM_SOLO_MISURA) process.exit(0);
const g = [], cieco = [];
const V = R.verde, X = R.salta, Y = R['salta-secco'], Z = R.rosso;
if (V) { if (!V.walk || V.durataDich == null) g.push('verde: ingresso non misurato');
  else { if (!(V.durataDich >= DMIN && V.durataDich <= DMAX)) g.push(`verde: durata ${V.durataDich}s fuori banda [${DMIN},${DMAX}]`);
    if (V.veloS > 0.4) g.push(`verde: velo d'attesa prima della camminata (${V.veloS}s): il caricamento non avviene durante l'ingresso`);
    if (!V.pulsante) g.push('verde: nessun pulsante «Salta ingresso»');
    /* [giro 72, collaudo 172 D1] «corpi non pronti» era anche il verdetto di un ingresso MAI CONCLUSO entro CPM_TMAX (uscita null → corpiAllaFine
       null): sotto carico in headless il tempo di scena scorre a 1/6-1/15 del reale. Misurato da solo: corpi pronti a 24 s, uscita a 145,9 s,
       attesa dopo 0. Un ingresso non concluso ora e' dichiarato CIECO (uscita 2), non un difetto del gioco. */
    if (V.uscitaS == null) cieco.push(`verde: ingresso non concluso entro ${(+(process.env.CPM_TMAX || 320000) / 1000).toFixed(0)} s (corpi pronti a ${V.corpiS} s): corpi a fine ingresso NON GIUDICATI — rilanciare da solo o con CPM_TMAX piu' alto`);
    else if (!V.corpiAllaFine) g.push('verde: a fine ingresso i corpi non sono pronti (la partita aspetta)');
    else if (V.attesaDopoS > 1) g.push(`verde: dopo l'ingresso la partita aspetta i corpi ${V.attesaDopoS}s`); }
  if (V.errori.length) g.push('verde: errori di pagina ' + V.errori.join(' | ')); }
if (X) { if (X.cliccatoS == null) g.push('salta: pulsante non trovato/cliccato');
  else if (!(X.uscitaS != null && X.uscitaS - X.cliccatoS <= 3)) g.push(`salta: la fase non lascia walkout dopo il click (click ${X.cliccatoS}s, uscita ${X.uscitaS}s)`);
  if (!(X.attesaDopoS <= 1)) g.push(`salta: dopo il salto la partita aspetta i corpi ${X.attesaDopoS}s`);
  if (X.errori.length) g.push('salta: errori di pagina ' + X.errori.join(' | ')); }
if (Y && !(Y.attesaDopoS >= 3)) g.push('salta-secco: il difetto del taglio secco non si vede ' + JSON.stringify(Y));
if (Z) { if (!(Z.durataDich > DMAX) || Z.pulsante || (RIT && !(Z.veloS >= 2))) g.push('rosso: il difetto non si vede ' + JSON.stringify(Z)); }
if (g.length) { console.log('❌ ingresso-277'); g.concat(cieco).forEach(x => console.log('  · ' + x)); process.exit(1); }
if (cieco.length) { console.log('⚠️ ingresso-277 CIECO'); cieco.forEach(x => console.log('  · ' + x)); process.exit(2); }
console.log('✅ ingresso-277 verde (durata intermedia, nessun velo, saltabile, corpi pronti a fine ingresso) e il rosso si vede');
