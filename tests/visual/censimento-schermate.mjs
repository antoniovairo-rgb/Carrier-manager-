#!/usr/bin/env node
/* [7.999.46 — PARTE A del prompt PO «analisi critica delle schermate»: IL CENSIMENTO]
   Fotografa ogni schermata raggiungibile senza giocare una partita e ne salva il TESTO VISIBILE, a 360 px (pagina intera)
   e a 412 px (lo schermo del PO), con le fisarmoniche aperte. Parte dalla carriera di prova di griglia-mobile (lib/banco-g0:
   stagione avanzata), raggiunge le linguette con __CPM_CAREER.goTab, le schermate a comparsa con goScreen (fine stagione,
   premi, convocazione, passaggio al professionismo, presentazione al club, fine carriera, conferenza), la prepartita con
   playMatch, qualche settimana vissuta con step() fotografando cio' che compare, e il menu (home, opzioni, creazione, offerte).
   Scrive in docs/collaudo-testi/<larghezza>/<id>.png e docs/collaudo-testi/testi.json. NON MODIFICA IL GIOCO.
   DICHIARATO: Chromium headless alla taglia del telefono, non l'Android del PO; uno stato di carriera avanzato piu' il menu. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'docs', 'collaudo-testi');
const W = [360, 412], SEME = 20260928;
/* [7.999.49] si svuotano solo le cartelle delle foto: prima cadeva tutta docs/collaudo-testi, compreso il suo .gitignore */
for (const w of W) { fs.rmSync(path.join(OUT, String(w)), { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, String(w)), { recursive: true }); }
const TESTI = {}; const saltate = []; const errori = [];
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const TRIAL = { ph: 'offers', slot: 0, res: [{ goals: 2, assists: 1, rating: 7.4 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 3, assists: 1, rating: 8.1 }],
  p: { name: 'Grafica Probe', nation: 'Italia', avatarId: 0, ovr: 58, age: 16, proStatus: 'youth', archetype: 'finalizzatore',
       stats: { 'velocità': 60, tecnica: 58, fisico: 56, 'mentalità': 57, tiro: 62, passaggio: 56, dribbling: 60, posizionamento: 58 } } };
async function apri(init, query) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errori.push(String(e.message).slice(0, 140)));
  await installCdnRoutes(page); await page.addInitScript(INIT, init);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return page;
}
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const b = [...document.querySelectorAll('button')].find(x => r.test((x.textContent || '').trim())); if (b) { b.click(); return true; } return false; }, rx);
async function scatta(page, id, nome) {
  const t = { nome, w: {} };
  for (const w of W) {
    await page.setViewportSize({ width: w, height: w === 412 ? 915 : 800 }); await sleep(450);
    try { await page.screenshot({ path: path.join(OUT, String(w), id + '.png'), animations: 'disabled', caret: 'hide', timeout: 40000 }); } catch (e) { saltate.push(`${id}@${w}: foto ${String(e.message).slice(0, 60)}`); }
    if (w === 360) { /* a fette: il gioco scorre dentro un contenitore, non nella pagina */
      const n = await page.evaluate(() => { const els = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(d).overflowY)); els.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight)); const d = els[0]; if (!d) return 0; window.__SCR46 = d; d.scrollTop = 0; return Math.min(6, Math.ceil(d.scrollHeight / (d.clientHeight * 0.9)) - 1); });
      for (let k = 1; k <= n; k++) { await page.evaluate(k => { const d = window.__SCR46; d.scrollTop = Math.round(d.clientHeight * 0.9 * k); }, k); await sleep(250); try { await page.screenshot({ path: path.join(OUT, '360', `${id}-${k + 1}.png`), animations: 'disabled', caret: 'hide', timeout: 40000 }); } catch (_e) {} }
      if (n) await page.evaluate(() => { window.__SCR46.scrollTop = 0; }); t.fette = n + 1; }
    t.w[w] = await page.evaluate(() => ({ testo: (document.body.innerText || '').replace(/\n{3,}/g, '\n\n').trim(), altezza: document.documentElement.scrollHeight,
      etichette: [...document.querySelectorAll('[title],[aria-label]')].map(e => e.getAttribute('title') || e.getAttribute('aria-label')).filter(Boolean).slice(0, 60) }));
  }
  TESTI[id] = t; process.stdout.write(`  ${id.padEnd(28)} ${t.w[412].testo.length} caratteri · ${t.w[360].altezza} px a 360\n`);
}
/* MENU */
{ const page = await apri({ seme: SEME, fisAperte: true }, '?cpmtest=1');
  await scatta(page, 'menu-home', 'Home fuori carriera');
  if (await premi(page, 'Opzioni')) { await sleep(600); await scatta(page, 'menu-opzioni', 'Opzioni'); await premi(page, '^✕$'); await sleep(400); } else saltate.push('opzioni: bottone non trovato');
  if (await premi(page, 'Nuova carriera')) { await sleep(800); await scatta(page, 'menu-creazione', 'Nuova carriera · creazione'); } else saltate.push('creazione: bottone non trovato');
  await page.close(); }
/* OFFERTE dei provini (inizio carriera) */
{ const page = await apri({ seme: SEME, fisAperte: true, trial: TRIAL }, '');
  const ok = await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
  if (ok) await scatta(page, 'inizio-offerte', 'Inizio carriera · offerte dopo i provini'); else saltate.push('offerte: non aperta');
  await page.close(); }
/* CARRIERA */
{ const page = await apri({ seme: SEME, fisAperte: true, save: SAVE }, '?cpmtest=1');
  await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) { saltate.push('carriera: Continua non trovato'); }
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (vivo) {
    await sleep(900); await scatta(page, 'car-apertura', 'Carriera · primo schermo dopo Continua');
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(400);
    const TAB = [['dashboard', 'Home'], ['standings', 'Stagione · Classifica'], ['calendar', 'Stagione · Calendario'], ['coppe', 'Stagione · Coppe'], ['club', 'Club'], ['profile', 'Carriera · Profilo'], ['nazionale', 'Carriera · Nazionale'], ['agente', 'Agente'], ['ufficio', 'Ufficio'], ['training', 'Allenamento']];
    for (const [t, n] of TAB) { const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), t); if (r !== true) { saltate.push(`${t}: ${r}`); continue; } await sleep(500); await scatta(page, 'tab-' + t, n); }
    const SCR = [['seasonEnd', 'Fine stagione'], ['seasonAwards', 'Premi di fine stagione'], ['nationalCallup', 'Convocazione in nazionale'], ['proTransition', 'Passaggio al professionismo'], ['clubPresentation', 'Presentazione al nuovo club'], ['careerEnd', 'Fine carriera']];
    for (const [s, n] of SCR) { try { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); } catch (_e) {} await sleep(300);
      const r = await page.evaluate(x => window.__CPM_CAREER.goScreen(x), s); await sleep(900);
      if (r !== true) { saltate.push(`${s}: ${r}`); continue; }
      /* [7.999.49] goScreen cambia solo la schermata: senza i suoi dati il gioco mostra la Home, e prima la fotografavamo
         come se fosse la schermata chiesta (8 «schermate» uguali alla Home nel censimento del 28/09). Ora si dichiara. */
      const cur = await page.evaluate(() => window.__CPM_CAREER.screen && window.__CPM_CAREER.screen()).catch(() => null);
      const home = await page.evaluate(() => /Vivi la Settimana|PROSSIMA PARTITA/i.test(document.body.innerText || '')).catch(() => false);
      if (cur !== s || home) { saltate.push(`${s}: non si apre senza i suoi dati (schermata ${cur}, Home visibile ${home})`); continue; }
      await scatta(page, 'scr-' + s, n); }
    try { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); } catch (_e) {} await sleep(400);
    try { const r = await page.evaluate(() => window.__CPM_CAREER.forceInterview && window.__CPM_CAREER.forceInterview()); await sleep(900); if (r) await scatta(page, 'scr-intervista', 'Intervista / conferenza'); else saltate.push('intervista: forceInterview → ' + r); } catch (e) { saltate.push('intervista: ' + String(e.message).slice(0, 60)); }
    try { await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); } catch (_e) {} await sleep(400);
    try { const r = await page.evaluate(() => window.__CPM_CAREER.forceOffer && window.__CPM_CAREER.forceOffer()); await sleep(900); await scatta(page, 'scr-offerta', 'Offerta di trasferimento'); if (!r) saltate.push('offerta: forceOffer → ' + r); } catch (e) { saltate.push('offerta: ' + String(e.message).slice(0, 60)); }
    try { await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); } catch (_e) {} await sleep(400);
    for (let k = 1; k <= 4; k++) { let r = null; try { r = await page.evaluate(() => window.__CPM_CAREER.step()); } catch (e) { r = 'errore'; } await sleep(1100); await scatta(page, 'sett-' + k, `Settimana vissuta ${k} (esito step: ${r})`); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(400); }
    try { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); } catch (_e) {} await sleep(400);
    const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch()).catch(() => null);
    if (pm === true) { const ok = await page.waitForFunction(() => /VS|OSPITE|CASA/.test(document.body.innerText || ''), null, { timeout: 40000 }).then(() => true).catch(() => false); if (ok) { await sleep(600); await scatta(page, 'pre-partita', 'Pre-partita'); } else saltate.push('prepartita non aperta'); }
    else saltate.push('prepartita: playMatch → ' + pm);
  } else saltate.push('carriera: __CPM_CAREER mai comparso');
  await page.close(); }
/* STAGIONE VISSUTA FINO IN FONDO: finestre della settimana, gala, fine stagione, apertura della stagione nuova */
{ const page = await apri({ seme: SEME, fisAperte: true, save: SAVE }, '?cpmtest=1');
  await page.addInitScript(() => { window.__CPM_SIM_NAT = 1; }); await page.evaluate(() => { window.__CPM_SIM_NAT = 1; });
  await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  const visti = new Set(); let fine = false;
  const firma = () => page.evaluate(() => { const m = document.querySelector('[role="dialog"],[data-cpm*="modal"],[data-cpm*="Modal"]'); const t = (m ? m.innerText : document.body.innerText) || ''; return t.split('\n').filter(Boolean).slice(0, 2).join(' | ').slice(0, 60); });
  for (let k = 0; vivo && k < 70 && !fine; k++) {
    const r = await page.evaluate(() => { try { return window.__CPM_CAREER.step(); } catch (e) { return 'errore:' + e.message; } }); await sleep(700);
    const f = await firma(); const chiave = f.replace(/[0-9]+/g, '#');
    if (!visti.has(chiave) && visti.size < 14 && !/^(Home|Stagione)/.test(f)) { visti.add(chiave); await scatta(page, 'vita-' + visti.size, `Durante la stagione: «${f}» (passo ${k}, ${r})`); }
    if (r === 'seasonEnd') { fine = true; await sleep(1500); await scatta(page, 'fine-gala', 'Fine stagione · gala');
      if (await premi(page, 'Apri la busta')) { await sleep(1500); await scatta(page, 'fine-busta', 'Fine stagione · busta del premio'); }
      if (await premi(page, 'Salta il gala')) { await sleep(1500); await scatta(page, 'fine-dopo-gala', 'Fine stagione · dopo il gala'); }
      /* [7.999.49] prima il riconoscimento del riepilogo scattava sul bottone «Continua alla Fine Stagione» della pagina
         premi (contiene «Fine Stagione»): fotografava ancora i premi. Ora si PREME e si fotografa la schermata dopo. */
      for (let j = 0; j < 6; j++) { const sc0 = await page.evaluate(() => window.__CPM_CAREER.screen && window.__CPM_CAREER.screen()).catch(() => null);
        if (!(await premi(page, 'Continua alla Fine Stagione|^Continua|^Avanti|Vai alla'))) break; await sleep(1500);
        const sc1 = await page.evaluate(() => window.__CPM_CAREER.screen && window.__CPM_CAREER.screen()).catch(() => null);
        await scatta(page, j === 0 ? 'fine-riepilogo' : 'fine-passo-' + (j + 1), `Fine stagione · ${j === 0 ? 'riepilogo' : 'passo ' + (j + 1)} (schermata ${sc0} → ${sc1})`);
        if (sc1 !== 'seasonEnd' && sc1 !== 'seasonAwards') break; }
      const ns = await page.evaluate(() => { try { return window.__CPM_CAREER.startNewSeason(); } catch (e) { return 'errore ' + e.message; } }); await sleep(2000);
      const sc2 = await page.evaluate(() => window.__CPM_CAREER.screen && window.__CPM_CAREER.screen()).catch(() => null);
      if (sc2 === 'seasonEnd' || sc2 === 'seasonAwards') saltate.push(`nuova stagione: startNewSeason → ${ns}, schermata ancora ${sc2}`);
      else await scatta(page, 'nuova-stagione', 'Stagione nuova · primo schermo');
      try { await page.evaluate(() => window.__CPM_CAREER.step()); } catch (_e) {} await sleep(1000);
      await scatta(page, 'nuova-stagione-apertura', 'Stagione nuova · apertura (Vivi la settimana)'); }
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(150);
  }
  if (!fine) saltate.push('stagione: la fine stagione non e\' arrivata in 70 passi');
  await page.close(); }
await browser.close(); srv.close();
const VER = (/GAME_VERSION\s*=\s*["']([^"']+)/.exec(fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').slice(0, 400000)) || [])[1];
fs.writeFileSync(path.join(OUT, 'testi.json'), JSON.stringify({ versione: VER, larghezze: W, schermate: TESTI, saltate, errori: [...new Set(errori)] }, null, 1));
console.log(`\nschermate ${Object.keys(TESTI).length} · saltate ${saltate.length} ${JSON.stringify(saltate)} · errori pagina ${new Set(errori).size}`);
