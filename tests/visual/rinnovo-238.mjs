#!/usr/bin/env node
/* [giro 238 · PO-501, decisione PO 16/11 «Richiamo sì, corsa no»] GUARDIANO rinnovo-238.
   Regole che si toccano: giro 198 (PO-432) il presidente richiama a contratto all'ultimo anno (dalla sett. 19 e dalla 33), anche dopo
   un rifiuto della controfferta; giro 165b il rinnovo rifiutato non ferma piu' «Vai al prossimo momento». Prima di questo giro, al
   richiamo arrivato durante una corsa, la corsa si fermava col motivo «rinnovo» (src/18, «il richiamo del presidente ferma la corsa»).
   Carriera da professionista (FC Salento), contratto all'ultimo anno, rinnovo RIFIUTATO in questa stagione (rinnRif165b), dalla
   sett. 15 a fine stagione col solo tasto (partita lunga: passa sia la 19 sia la 33).
   VERDE: nessuna fermata «rinnovo» in tutta la stagione; i due richiami ARRIVANO (salvataggio richiamo198.n = 2, due righe di registro
   «Il presidente ti richiama», la finestra vista con data-n 1 e 2 a corsa finita); la stagione arriva in fondo (W>38); nessun errore.
   ROSSO window.__CPM_NO_G238: almeno una fermata «rinnovo» (se non si vede, «rosso non visto» = rosso).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rinnovo-238.mjs   (CPM_SOLO238=verde|rosso) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const SOLO = process.env.CPM_SOLO238 || '';
const SALENTO = { id: 'lec', n: 'FC Salento', a: 'SLN', p: 62, c: '#f5c518', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
const s = 72;
const SAVE = { name: 'Guardiano Rinnovo', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 15, weekLived: false, age: 22, ovr: s, tutorialDone: true, position: 'ATT',
  club: SALENTO, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
  form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 1, wage: 6000, expiresAtSeason: 3 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
  rinnRif165b: 3, ...AP };

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(rosso) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200))); page.on('console', m => { if (m.type() === 'error' && /Crash globale|Error/.test(m.text())) errors.push('console: ' + m.text().slice(0, 600)); });
  await page.addInitScript(([pl, r]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (r) window.__CPM_NO_G238 = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [SAVE, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1200);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; });
  await sleep(800);
  return { page, errors };
}
const stato = (page) => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const t = document.querySelector('[data-cpm="salta163-tasto"]'); const m = document.querySelector('[data-cpm="salta163-motivo"]');
  return { s: p.season || 1, w: p.week || 1, tasto: !!t, spento: !!(t && t.disabled), motivo: m ? m.innerText.trim() : null, screen: window.__CPM_CAREER.screen() }; });
const clicca = async (page, sel, prova = 0) => { const el = await page.$(sel); if (!el) return false; if (await el.isDisabled().catch(() => false)) return false; try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 4000 }); return true; } catch (e) { if (prova < 2) { await sleep(400); return clicca(page, sel, prova + 1); } ultimoErr = String(e.message).split('\n').filter(l => /intercept|visible|stable|enabled/.test(l)).slice(0, 2).join(' / ').slice(0, 300); return false; } };
let ultimoErr = '';
async function aspettaFine(page, maxMs) { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { const st = await page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163"]'); return el ? el.getAttribute('data-salta163') : 'assente'; }); if (st !== 'corsa') return st; await sleep(400); } return 'scaduto'; }
const chiudiRiepilogo = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].filter(x => x.getAttribute('data-cpm') !== 'salta198-vai').pop(); if (b) b.click(); });
/* la finestra del presidente: si legge data-n e si risponde «Ci penso» (il pulsante vero) */
async function richiamo(page, visti) { for (let i = 0; i < 6; i++) { const n = await page.evaluate(() => { const c = document.querySelector('[data-cpm="richiamo198-corpo"]'); return c ? c.getAttribute('data-n') : null; });
  if (n) { const st = await stato(page); visti.push(`n${n}@W${st.w}`); await clicca(page, '[data-cpm="richiamo198-dopo"]'); await sleep(500); return true; } await sleep(150); } return false; }

async function stagione(rosso) {
  const t0 = Date.now(); const { page, errors } = await apri(rosso);
  const fermate = {}, rinnovo = [], visti = []; let corse = 0;
  await richiamo(page, visti);
  while (corse < 90) {
    let st = await stato(page);
    if (st.s !== 3 || st.w > 38 || st.screen !== 'dashboard') break;
    for (let k = 0; k < 4 && st.motivo && /finestra/.test(st.motivo); k++) {
      if (!(await richiamo(page, visti))) { await page.evaluate(() => { const el = document.querySelector('[data-cpm="intervista231"],[data-cpm="eroe-intervista23"]'); const b = el && [...el.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); }); await sleep(300);
        await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); const v = document.querySelector('.cpm-velo150'); const b = v && [...v.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); }); await sleep(500); }
      st = await stato(page);
    }
    let preso = false; for (let k = 0; k < 6 && !preso; k++) { preso = await clicca(page, '[data-cpm="salta163-tasto"]'); if (!preso) { await chiudiRiepilogo(page); await sleep(800); } }
    if (!preso) { const dg = await page.evaluate(() => [...document.querySelectorAll('[data-cpm]')].filter(e => /modal|richiamo|velo|nego|offerta/i.test(e.getAttribute('data-cpm'))).map(e => e.getAttribute('data-cpm')).slice(0, 8).join(',') + ' | ' + (document.querySelector('[role=dialog]') ? document.querySelector('[role=dialog]').innerText.slice(0, 160) : '')); await page.screenshot({ path: 'out/rinnovo-238-blocco.png', fullPage: false }); fermate['testo'] = await page.evaluate(() => document.body.innerText.slice(0, 400)); fermate['diagnosi'] = dg + ' err=' + ultimoErr + ' tasto=' + st.tasto + ' spento=' + st.spento;
      fermate['tasto spento: ' + st.motivo] = (fermate['tasto spento: ' + st.motivo] || 0) + 1; break; }
    await sleep(400); if (!(await clicca(page, '[data-cpm="salta163-vai"]'))) break;
    corse++; const e = await aspettaFine(page, 240000); await sleep(500);
    if (e === 'scaduto') { fermate.scaduto = 1; break; }
    const f = await page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return L[L.length - 1] || null; });
    const motivo = f ? f.motivo : '?'; fermate[motivo] = (fermate[motivo] || 0) + 1;
    if (motivo === 'rinnovo') rinnovo.push(`W${f.w}`);
    await richiamo(page, visti);
    if (motivo === 'partita chiave') { if (!(await clicca(page, '[data-cpm="simula-conferma"]'))) await page.getByText('Simula partita', { exact: false }).first().click({ timeout: 5000 }).catch(() => {}); await sleep(1500); }
    else if (motivo === 'fine stagione') break;
    else { await page.evaluate(() => { try { window.__CPM_CAREER.scegli(0); } catch (e) {} window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); });
      if (motivo === 'mercato') await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); if (p.transferSaga && !p.transferSaga.delivered) window.__CPM_CAREER.patch({ transferSaga: null }); });
      await sleep(900); }
    await chiudiRiepilogo(page); await sleep(200);
  }
  const fin = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { s: p.season, w: p.week, n: (p.richiamo198 && p.richiamo198.s === 3) ? p.richiamo198.n : 0, righe: (p.log || []).filter(l => /Il presidente ti richiama/.test(l)).length, rif: p.rinnRif165b }; });
  try { const el = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-errlog') || '[]'); } catch (e) { return []; } }); for (const x of el) errors.push(`registro: ${x.kind} · ${x.msg} · ${String(x.stack || '').slice(0, 300)} · ${String(x.extra || '').slice(0, 300)}`); } catch (e) {}
  await page.close();
  return { corse, fermate, rinnovo, visti, fin, errors, sec: Math.round((Date.now() - t0) / 1000) };
}

let ok = true; const esiti = [];
try {
  if (SOLO !== 'rosso') {
    const V = await stagione(false);
    console.log('verde:', JSON.stringify(V));
    const c1 = V.rinnovo.length === 0, c2 = V.fin.n === 2 && V.fin.righe >= 2, c3 = V.visti.some(x => x.startsWith('n1@')) && V.visti.some(x => x.startsWith('n2@')), c4 = V.fin.w > 38 || V.fin.s > 3, c5 = V.errors.length === 0;
    esiti.push(`${c1 ? '✅' : '❌'} dopo il rifiuto nessuna fermata «rinnovo» in ${V.corse} corse (${V.rinnovo.join(',') || 'nessuna'}) · fermate ${JSON.stringify(V.fermate)}`);
    esiti.push(`${c2 ? '✅' : '❌'} i due richiami arrivano: salvataggio n=${V.fin.n}, righe di registro ${V.fin.righe}`);
    esiti.push(`${c3 ? '✅' : '❌'} la finestra del presidente si vede a corsa finita: ${V.visti.join(' ') || 'mai'}`);
    esiti.push(`${c4 ? '✅' : '❌'} la stagione arriva in fondo (S${V.fin.s} W${V.fin.w}, ${V.sec} s)`);
    esiti.push(`${c5 ? '✅' : '❌'} nessun errore di pagina${V.errors.length ? ' — ' + V.errors[0] : ''}`);
    ok = ok && c1 && c2 && c3 && c4 && c5;
  }
  if (SOLO !== 'verde') {
    const R = await stagione(true);
    console.log('rosso:', JSON.stringify(R));
    const visto = R.rinnovo.length >= 1;
    esiti.push(`${visto ? '✅' : '❌'} rosso __CPM_NO_G238: ${visto ? 'la corsa si ferma sul rinnovo dopo il rifiuto (' + R.rinnovo.join(',') + ')' : 'rosso NON visto'}`);
    ok = ok && visto;
  }
} catch (e) { esiti.push('❌ errore del guardiano: ' + e.message); ok = false; }
for (const e of esiti) console.log(e);
console.log(ok ? '✅ rinnovo-238 verde (e il rosso si vede)' : '❌ rinnovo-238 rosso');
await browser.close(); srv.close();
process.exit(ok ? 0 : 1);
