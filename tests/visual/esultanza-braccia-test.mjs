#!/usr/bin/env node
/* [7.999.31 guardiano — L'ESULTANZA SI VEDE SUL CORPO CGTRADER. Lotto gesti P1-a, decisione PO 26/09 «prima clip in casa, altrimenti
   braccia procedurali»] Nessun pacchetto ha una clip di esultanza (`celebrate` assente, `opening` non lo e': provino 27/09). Il guardiano forza
   N scene di gol dell'eroe col renderer di default (corpo CGTrader), le risolve con successo e legge DENTRO il loop di render
   (`__CPM_ESULTA31`) in quanti fotogrammi d'esultanza le due mani stanno sopra la testa.
   Rosso: CPM_RED=1 accende __CPM_NO_ESULTA31 → nessun fotogramma con le braccia al cielo → deve FALLIRE. CPM_GOALS = scene (default 4). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_REC = true; if (r) window.__CPM_NO_ESULTA31 = 1; }, RED);
await openMatch(page, port, { name: 'Esulta31' }); await sleep(1400);
const GIS = await page.evaluate(L => { const o = [], S = window.__CPM_SITS || []; for (let i = 0; i < S.length && o.length < L; i++) { const s = S[i]; if (s && s.actions && s.actions[0] && s.actions[0].rew === 'goal' && !s.def) o.push(i); } return o; }, +(process.env.CPM_GOALS || 4));
const righe = [];
for (const gi of GIS) {
  await page.evaluate(g => { window.__CPM_ESULTA31 = null; window.__CPM_CELEB = null; window.__CPM_CELDONE84 = 0; window.__CPM_CELN = 0; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(700);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; try { window.__CPM_RESOLVE(0); } catch (e) {} });
  await page.waitForFunction(() => { try { return window.__CPM_CELEB && ((window.__CPM_CELDONE84 === 1) || (window.__CPM_CELN || 0) > 260); } catch (e) { return false; } }, { timeout: 150000 }).catch(() => {});
  await sleep(400);
  const m = await page.evaluate(() => ({ c: window.__CPM_CELEB ? { pick: window.__CPM_CELEB.pick } : null, e: window.__CPM_ESULTA31 || null, lift: (() => { try { return window.__CPM_CGTRADER_REVIEW_GESTURES ? !!window.__CPM_CGTRADER_REVIEW_GESTURES.lift : null; } catch (e) { return null; } })() }));
  righe.push({ gi, pick: m.c && m.c.pick, ...(m.e || { fotogrammi: 0, eroe: 0, compagno: 0, maniSopraTesta: 0 }), clipLift: m.lift });
  console.log(JSON.stringify(righe[righe.length - 1]));
}
await b.close(); srv.close();
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
ok(!errs.length, 'nessun errore di pagina ' + errs.slice(0, 1).join(''));
/* [7.999.32] l'esultanza SOBRIA (contained) e' il pugno: niente braccia al cielo, ma la clip deve essere montata */
const conLift = righe.filter(r => /^(arms_up|jump_arms_up|run_to_crowd|run_wide)$/.test(r.pick || ''));
const sobrie = righe.filter(r => r.pick === 'contained');
ok(sobrie.every(r => (r.clip | 0) >= 3 || (r.procedurale | 0) >= 3), `esultanza sobria: il gesto e' montato (${sobrie.map(r => (r.clip | 0) + '/' + (r.procedurale | 0)).join(', ') || 'nessuna'})`);
ok(righe.length >= 2, `scene di gol osservate: ${righe.length}`);
ok(conLift.length >= 1, `almeno un'esultanza che chiede le braccia al cielo (${conLift.map(r => r.pick).join(', ') || 'nessuna'})`);
ok(conLift.length && conLift.every(r => r.maniSopraTesta >= 3), `in ogni esultanza con braccia al cielo le mani salgono sopra la testa (${conLift.map(r => r.maniSopraTesta).join(', ')} fotogrammi)`);
if (err.length) { console.log('\nESULTANZA BRACCIA: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nESULTANZA BRACCIA: PASS'); process.exit(0);
