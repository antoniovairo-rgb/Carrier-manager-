#!/usr/bin/env node
/* [giro 260 · decisione PO 17/11 D «Ovunque Primavera»] GUARDIANO primavera-260. Un giro di carriera PRIMAVERA nel gioco vero
   (?cpmtest=1, 375x667, tutte le fisarmoniche aperte con __CPM_FIS_APERTE): nessuna scritta «Under 18»/«U18» a schermo.
   Il giro, su due salvataggi Primavera (prima stagione, u18Seasons 0, e seconda, u18Seasons 1):
     1  le nove schede (Home, Classifica, Calendario, Coppe, Club, Profilo, Nazionale, Agente, Ufficio);
     2  la scheda di fine Primavera (proTransition) e il tocco su «Resta →» (avviso e voce del registro), poi Home e Profilo;
     3  la descrizione della giornalista che «ti segue» (JOURNALIST_POOL, mostrata nelle interviste).
   Si legge innerText (cio' che si vede) e si cerca /Under 18|Under-18|U18|U-18/ (maiuscole e minuscole). Gli id interni e i campi
   salvati (proStatus "u18", u18Seasons, isStayU18…) non sono testo a schermo e non si toccano. Deve comparire anche «Primavera»
   (se no la misura non ha visto la carriera giusta).
   Bracci: VERDE (gioco) nessuna scritta; ROSSO window.__CPM_NO_G260 (com'era prima del giro 260) almeno una. «Non giudicato»
   (meno di 9 schede lette, scheda di fine Primavera non aperta, errori di pagina) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node primavera-260.mjs   (CPM_PARTE=verde|rosso) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto';
const RX = /under[\s-]?18|\bu-?18\b/i;
const SCHEDE = ['dashboard', 'standings', 'calendar', 'coppe', 'club', 'profile', 'nazionale', 'agente', 'ufficio'];
const CLUB = { id: 'cre', n: 'FC Cremona Primavera', a: 'CRE', p: 50, c: '#c8102e', c2: '#ffffff', nat: '🇮🇹', lg: 'Primavera 2', isU18: true };
const salva = (u18Seasons) => ({ name: 'Dario Ferrante', nation: 'Italia', avatarId: 3, proStatus: 'u18', u18Seasons, season: 1 + u18Seasons, week: 10, age: 16 + u18Seasons, ovr: 64,
  tutorialDone: true, club: CLUB, foot: 'L', goals: 4, assists: 2, matches: 9, form: 70, morale: 55, fatigue: 10, popularity: 20, coachTrust: 55,
  stats: { 'velocità': 66, tecnica: 64, fisico: 62, 'mentalità': 63, tiro: 65, passaggio: 63, dribbling: 66, posizionamento: 62 } });

async function apri(b, port, player, rosso) {
  const page = await b.newPage({ viewport: { width: 375, height: 667 } }); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
  await page.addInitScript(([pl, rosso]) => { window.__CPM_GLB = false; window.__CPM_FIS_APERTE = true; if (rosso) window.__CPM_NO_G260 = true;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [player, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(900);
  await page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(500);
  return { page, err };
}
const leggi = page => page.evaluate(() => document.body.innerText);
const trova = (testo, dove, out) => { for (const riga of testo.split('\n')) if (/under[\s-]?18|\bu-?18\b/i.test(riga)) out.push(`${dove}: «${riga.trim().slice(0, 90)}»`); };

async function braccio(b, port, rosso) {
  const trovati = [], buchi = []; let schede = 0, transizione = false, resta = false, primavera = false; const errori = [];
  for (const u of [0, 1]) {
    let a; try { a = await apri(b, port, salva(u), rosso); } catch (e) { buchi.push(`stagione ${u + 1}: non aperta ${String(e.message).slice(0, 80)}`); continue; }
    const { page, err } = a;
    for (const t of SCHEDE) {
      const ok = await page.evaluate(t => { try { window.__CPM_CAREER.goTab(t); return true; } catch (e) { return false; } }, t); await sleep(1000);
      if (!ok) { buchi.push(`s${u + 1} ${t}: scheda non aperta`); continue; }
      const tx = await leggi(page); if (tx.length < 200) { buchi.push(`s${u + 1} ${t}: testo vuoto`); continue; }
      schede++; if (/Primavera/.test(tx)) primavera = true; trova(tx, `s${u + 1}/${t}`, trovati);
    }
    if (u === 1) { /* scheda di fine Primavera + «Resta →» */
      await page.evaluate(() => window.__CPM_CAREER.goScreen('proTransition')); await sleep(1500);
      const tx = await leggi(page); transizione = /Primavera/.test(tx) && /Resta/.test(tx); trova(tx, 's2/fine Primavera', trovati);
      const cl = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].filter(x => /^Resta/.test(x.textContent.trim()) && x.getBoundingClientRect().height > 0)[0]; if (!bt) return false; bt.click(); return true; });
      if (cl) { await sleep(400); const t1 = await leggi(page); trova(t1, 's2/dopo «Resta» (avviso)', trovati); resta = true;
        for (const t of ['dashboard', 'profile']) { await page.evaluate(t => window.__CPM_CAREER.goTab(t), t); await sleep(1000); trova(await leggi(page), `s2/dopo «Resta» ${t}`, trovati); }
        const reg = await page.evaluate(() => (window.__CPM_CAREER.snapshot().log || []).slice(0, 3).join(' | ')); trova(reg, 's2/registro (log) dopo «Resta»', trovati); }
    }
    if (u === 0) { const gi = await page.evaluate(() => (typeof JOURNALIST_POOL !== 'undefined' ? JOURNALIST_POOL : []).map(j => j.desc).join('\n')); if (!gi) buchi.push('JOURNALIST_POOL non letto'); trova(gi, 'giornalisti', trovati); }
    errori.push(...err); await page.close();
  }
  if (!transizione) buchi.push('scheda di fine Primavera non vista'); if (!resta) buchi.push('«Resta →» non toccato'); if (!primavera) buchi.push('«Primavera» mai letta');
  if (schede < 18) buchi.push(`solo ${schede}/18 schede lette`); if (errori.length) buchi.push('errori di pagina: ' + [...new Set(errori)].slice(0, 2).join(' | '));
  return { trovati: [...new Set(trovati)], buchi, schede };
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let v = null, r = null;
try { if (PARTE !== 'rosso') v = await braccio(b, port, false); if (PARTE !== 'verde') r = await braccio(b, port, true); }
finally { await b.close(); srv.close(); }
let ok = true;
if (v) { const vOk = !v.buchi.length && !v.trovati.length; ok = ok && vOk;
  console.log(`VERDE: ${vOk ? '✓' : '✗'} ${v.schede} schede lette · scritte «Under 18»/«U18»: ${v.trovati.length}${v.buchi.length ? ' · NON GIUDICATO: ' + v.buchi.join(' · ') : ''}`);
  for (const x of v.trovati.slice(0, 12)) console.log('   ' + x); }
if (r) { const rOk = !r.buchi.length && r.trovati.length > 0; ok = ok && rOk;
  console.log(`ROSSO __CPM_NO_G260: ${rOk ? '✓ bocciato' : '✗ non bocciato'} · ${r.schede} schede lette · scritte: ${r.trovati.length}${r.buchi.length ? ' · NON GIUDICATO: ' + r.buchi.join(' · ') : ''}`);
  for (const x of r.trovati.slice(0, 6)) console.log('   ' + x); }
console.log(ok ? '✓ primavera-260 VERDE' : '✗ primavera-260 ROSSO');
process.exit(ok ? 0 : 1);
