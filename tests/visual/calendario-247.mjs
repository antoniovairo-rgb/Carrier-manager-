#!/usr/bin/env node
/* [giro 19 PO-247, collaudo 165 N6 e N7] GUARDIANO DEL CALENDARIO, verde col gioco e rosso con __CPM_NO_CAL247.
   N6: dopo un prestito la griglia «Stagione N — calendario» mostrava «⚽ partita in programma» su settimane GIA' GIOCATE, perche'
       leggeva il risultato solo in matchHistory (le gare dell'eroe). Qui: save-190 senza le voci di matchHistory delle settimane 1-5
       (come dopo un prestito): le caselle 1-5 devono portare V/N/P col punteggio, non il ⚽.
   N7: riga della Nazionale in «Prossime partite»: «🏳️ Nazional…» troncato a 412 px e scudo grigio. Qui: amichevole col Portogallo
       iniettata nella settimana corrente (forma di bambini-236): la prima riga non deve essere troncata e lo scudo porta il verde
       del Portogallo (#006600, NAT_CLUB_DATA).
   Uso: node calendario-247.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso) {
  const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player; const w = pl.week | 0;
  pl.matchHistory = (pl.matchHistory || []).filter(m => !(m.week >= 1 && m.week <= 5));
  pl.calendar = [{ matchday: 1470 + w, week: w, opponentName: 'Portogallo', isHome: true, played: false, type: 'national', competition: 'Amichevole Internazionale' }].concat(pl.calendar || []);
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = false; if (o.r) window.__CPM_NO_CAL247 = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: sv, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await sleep(1500);
  const r = await page.evaluate(() => {
    const celle = [...document.querySelectorAll('div')].filter(d => d.parentElement && getComputedStyle(d.parentElement).gridTemplateColumns && getComputedStyle(d.parentElement).gridTemplateColumns.split(' ').length === 6 && /^\d+/.test((d.innerText || '').trim()));
    const cella = w => celle.find(d => (d.innerText || '').trim().split('\n')[0] === String(w));
    const g = []; for (let w = 1; w <= 5; w++) { const c = cella(w); g.push(c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : null); }
    const righe = [...document.querySelectorAll('div')].filter(d => /vs Portogallo/.test(d.textContent || '') && d.children.length === 0 || (/^▶? ?vs Portogallo/.test((d.innerText || '').trim()) && getComputedStyle(d).whiteSpace === 'nowrap'));
    const r1 = righe.find(d => getComputedStyle(d).whiteSpace === 'nowrap') || null;
    const riga = r1 ? r1.closest('div[style*="display: flex"]') : null;
    return { griglia: g, troncata: r1 ? r1.scrollWidth > r1.clientWidth + 1 : null, primaRiga: r1 ? (r1.innerText || '').trim() : null,
      verde: riga ? /#006600|rgb\(0, 102, 0\)/i.test(riga.innerHTML) : null };
  });
  await page.screenshot({ path: new URL('./out/calendario-247' + (rosso ? '-rosso' : '') + '.png', import.meta.url).pathname, fullPage: true }).catch(() => {});
  r.errori = errs.slice(0, 3); await page.close(); return r;
}
const V = await giro(false), R = await giro(true);
console.log('VERDE ' + JSON.stringify(V)); console.log('ROSSO ' + JSON.stringify(R));
await b.close(); srv.close();
const g = [], palla = G => (G || []).filter(t => t && /⚽/.test(t)).length, misurate = G => (G || []).filter(Boolean).length;
if (misurate(V.griglia) < 5) g.push('verde: griglia non letta ' + JSON.stringify(V.griglia));
else if (palla(V.griglia)) g.push('verde: ' + palla(V.griglia) + ' settimane giocate segnate «in programma»');
if (V.troncata !== false) g.push('verde: riga della Nazionale troncata o non trovata (' + V.primaRiga + ')');
if (V.verde !== true) g.push('verde: scudo del Portogallo senza i suoi colori');
if (V.errori.length) g.push('verde: errori di pagina');
if (!(palla(R.griglia) >= 3 && (R.troncata === true || R.verde === false))) g.push('rosso: il difetto non si vede ' + JSON.stringify(R));
if (g.length) { console.log('❌ calendario-247'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ calendario-247 verde (settimane giocate col risultato, riga Nazionale intera e scudo a colori) e il rosso si vede');
