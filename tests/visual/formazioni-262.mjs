/* [giro 262 · PO-513] GUARDIANO «NELLE FORMAZIONI PRIMA DELL'INGRESSO NIENTE RIGORISTA». Rosso del giro: window.__CPM_NO_G262.
   Decisione PO 17/11 20:54: «Il rigorista nelle formazioni prima dell'ingresso in campo non deve essere specificato, al piu' il capitano».
   Parti (verde e rosso ognuna, 360 px, partita vera dal salvataggio S12):
   F1 · schermate prima dell'ingresso (pre-partita `matchday`, formazioni `formations`, ingresso `walkout`): nessun segno del
        rigorista (`data-cpm="rigorista257"`, testo «rigorista»). ROSSO (__CPM_NO_G262): la «R» torna nelle formazioni (una, sul
        designato da rigorista257).
   F2 · ROSA (Club › Rosa, gioco vero): la «R» c'e' ancora, una sola, sul designato — in ENTRAMBI i bracci (il 262 non la tocca).
   Capitano: si registra se compare un segno «C»/fascia nelle schermate (dichiarato, non giudicato: il gioco oggi non ne mostra).
   «Non giudicato» (fase non raggiunta, Rosa non trovata) = rosso. Esiti stampati per ultimi.
   Foto in tests/visual/out/formazioni-262/ (verde = dopo, rosso = prima).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node formazioni-262.mjs   (~3 minuti) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const OUTD = new URL('./out/formazioni-262/', import.meta.url).pathname; fs.mkdirSync(OUTD, { recursive: true });
const save190 = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const esiti = []; let tutto = true; const giudica = (c, m) => { esiti.push(`${c ? '✅' : '❌'} ${m}`); tutto = tutto && !!c; };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

const leggi = (page) => page.evaluate(() => {
  const root = document.getElementById('root'); const txt = (root && root.innerText) || '';
  return { ph: window.__CPM_PHASE && window.__CPM_PHASE(),
    R: [...document.querySelectorAll('[data-cpm="rigorista257"]')].map(e => e.parentElement.innerText.replace(/\s+/g, ' ').trim()),
    testoRig: (txt.match(/rigorist/gi) || []).length,
    capitano: (txt.match(/capitan/gi) || []).length + document.querySelectorAll('[data-cpm*="capitan"],[aria-label*="apitan"],[title*="apitan"]').length };
});

async function prePartita(rosso) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G262 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save190, rosso]);
  const braccio = rosso ? 'rosso' : 'verde'; const fasi = {};
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    const atteso = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); const xi = generateTeamRoster(P.club, P.season || 1).slice(0, 11).map((r, i) => i === 10 ? { ...r, name: P.name } : r); const q = window.__CPM_RIG257 && window.__CPM_RIG257.rigorista(P, 'career', xi); return q ? q.nome : null; });
    const capEroe = await page.evaluate(() => window.__CPM_CAREER.snapshot().isCaptain === true);
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) {
      const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph && !fasi[ph] && ['matchday', 'formations', 'walkout'].includes(ph)) {
        await sleep(ph === 'walkout' ? 1500 : 700);
        fasi[ph] = await leggi(page);
        await page.screenshot({ path: `${OUTD}${braccio}-${ph}-360.png`, fullPage: ph !== 'walkout' });
      }
      if (ph === 'matchday') { try { await page.getByText('Vedi le formazioni', { exact: false }).first().click({ timeout: 2000 }); } catch (e) {} }
      if (ph === 'formations' && fasi.formations) { try { await page.getByText('Ingresso in campo', { exact: false }).first().click({ timeout: 2000 }); } catch (e) {} }
      if (fasi.walkout || (ph && !['matchday', 'formations', 'walkout', null, undefined].includes(ph) && fasi.formations)) { fasi._dopo = ph; break; }
      await sleep(400);
    }
    return { atteso, capEroe, fasi, errs };
  } finally { await ctx.close(); }
}

async function rosa(rosso) {
  const a = await apri(b, port, salva({ position: 'Centravanti' }), ['__CPM_FIS_APERTE', ...(rosso ? ['__CPM_NO_G262'] : [])], 360, 800);
  try {
    await a.page.evaluate(() => window.__CPM_CAREER.goTab('club')); await sleep(1200);
    const r = await a.page.evaluate(() => {
      const P = window.__CPM_CAREER.snapshot();
      const xi = generateTeamRoster(P.club, P.season || 1).slice(0, 11).map((r, i) => i === 10 ? { ...r, name: P.name, role: P.position || r.role } : r);
      const atteso = window.__CPM_RIG257 ? window.__CPM_RIG257.rigorista(P, 'career', xi) : null;
      const righe = document.querySelectorAll('[data-cpm="rosa-ruolo228"]').length;
      const segnate = [...document.querySelectorAll('[data-cpm="rigorista257"]')].map(r => { const riga = r.closest('div'); const nome = riga ? [...riga.querySelectorAll('span')].map(s => s.textContent).find(t => t && t.length > 2 && !/^R$/.test(t)) : null; return String(nome || '').replace(/^★ /, ''); });
      return { atteso: atteso ? atteso.nome : null, righe, segnate };
    });
    const el = await a.page.$('[data-cpm="rigorista257"]'); if (el) { try { await el.scrollIntoViewIfNeeded(); await sleep(300); } catch (e) {} }
    await a.page.screenshot({ path: `${OUTD}${rosso ? 'rosso' : 'verde'}-rosa-360.png` });
    return r;
  } finally { await a.page.close(); }
}

let V = null, R = null, RV = null, RR = null;
try { V = await prePartita(false); R = await prePartita(true); } catch (e) { giudica(false, 'F1 errore: ' + e.message); }
try { RV = await rosa(false); RR = await rosa(true); } catch (e) { giudica(false, 'F2 errore: ' + e.message); }
await b.close(); srv.close();
console.log('F1 verde ' + JSON.stringify(V)); console.log('F1 rosso ' + JSON.stringify(R));
console.log('F2 verde ' + JSON.stringify(RV)); console.log('F2 rosso ' + JSON.stringify(RR));
if (V && R) {
  const cog = V.atteso ? V.atteso.trim().split(/\s+/).pop().toUpperCase() : '§';
  for (const ph of ['matchday', 'formations', 'walkout']) {
    const q = V.fasi[ph];
    giudica(!!q && q.R.length === 0 && q.testoRig === 0, `F1 verde «${ph}»: segni del rigorista ${q ? q.R.length : 'NON GIUDICATO'} · testo «rigorista» ${q ? q.testoRig : '—'}`);
  }
  const f = R.fasi.formations;
  giudica(!!f && f.R.length === 1 && f.R[0].toUpperCase().indexOf(cog) >= 0, `F1 rosso __CPM_NO_G262 formazioni: «R» su «${f ? f.R.join(' | ') || 'nessuno' : 'NON GIUDICATO'}» (designato ${V.atteso || '—'})`);
  giudica(V.errs.length === 0 && R.errs.length === 0, `F1 errori di pagina: verde ${V.errs.length} · rosso ${R.errs.length} ${[...V.errs, ...R.errs].slice(0, 2).join(' | ')}`);
  esiti.push(`ℹ️ capitano (dichiarato, non giudicato): eroe capitano nel salvataggio ${V.capEroe} · segni/parole «capitano» per fase ${['matchday', 'formations', 'walkout'].map(p => p + '=' + (V.fasi[p] ? V.fasi[p].capitano : '—')).join(' ')}`);
}
if (RV && RR) {
  giudica(RV.righe >= 20 && RV.atteso && RV.segnate.length === 1 && RV.segnate[0] === RV.atteso, `F2 verde Rosa: «R» su ${RV.segnate.join('/') || 'nessuno'} (atteso ${RV.atteso || '—'}, righe ${RV.righe})`);
  giudica(RR.righe >= 20 && RR.atteso && RR.segnate.length === 1 && RR.segnate[0] === RR.atteso, `F2 rosso __CPM_NO_G262 Rosa invariata: «R» su ${RR.segnate.join('/') || 'nessuno'} (righe ${RR.righe})`);
}
if (!V || !R || !RV || !RR) giudica(false, 'NON GIUDICATO: una parte non ha prodotto misure');
for (const e of esiti) console.log(e);
console.log(tutto ? '✅ formazioni-262 verde (e il rosso si vede)' : '❌ formazioni-262 rosso');
process.exit(tutto ? 0 : 1);
