/* [23/09] B3 — IL BERSAGLIO DEL TIRO VIENE DAL BRAIN? Forza una scena di tiro (deriveIntent 'shot'), esito forzato
   (CPM_ESITO=success|fail), registra la palla a ogni fotogramma e confronta la z di arrivo (quando la palla passa la linea
   di porta x>=AWAY_GOAL_X-1, o all'ultimo fotogramma del volo) con la z dichiarata dal brain (`__CPM_TIRO23`).
   CPM_ROSSO=__CPM_NO_B3TIRO per il rosso. CPM_K = indice della situazione di tiro (default: la prima). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO || '', ESITO = process.env.CPM_ESITO || 'success', K = Number(process.env.CPM_K || 0);
const server = await startServer(); const browser = await launchBrowser();
const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
await page.addInitScript(({ r, e }) => { window.__CPM_REC = 1; window.__CPM_FORCE_OUTCOME = e; if (r) window[r] = true; }, { r: ROSSO, e: ESITO });
await installCdnRoutes(page);
await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Tiro Brain', query: { cpmForce: 'shot', glb: '0' } });
await sleep(3000);
const sc = await page.evaluate(k => { const out = []; for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i]; if (s && s.actions && deriveIntent(s) === 'shot') { const a = s.actions.findIndex(x => /tiro|conclu|calcia|piazza/i.test(String(x.label || ''))); if (a >= 0) out.push({ i, a, t: s.text }); } } return out[k] || null; }, K);
console.log('scena', JSON.stringify(sc));
await page.evaluate(i => window.__CPM_FORCE_SIT(i, true), sc.i); await sleep(1500);
await page.evaluate(() => { window.__RECB = []; const g = () => { try { const b = window.__CPM_BALL && window.__CPM_BALL(); if (b && window.__RECB.length < 3000) window.__RECB.push([b.x, b.y, b.z]); } catch (e) {} requestAnimationFrame(g); }; requestAnimationFrame(g); });
await page.evaluate(a => window.__CPM_RESOLVE(a), sc.a);
await sleep(Number(process.env.CPM_ATTESA || 16000));
const r = await page.evaluate(() => ({ tiro: window.__CPM_TIRO23 || [], b2: window.__CPM_B2EV || [], rec: window.__RECB || [], gol: typeof AWAY_GOAL_X !== 'undefined' ? AWAY_GOAL_X : null }));
const maxX = r.rec.reduce((m, p) => Math.max(m, p[0] ?? -99), -99);
const oltre = r.rec.find(p => p[0] >= 98);/* __CPM_BALL: coordinate di CAMPO; linea di porta 98,6 */
const t23 = r.tiro.slice(-1)[0];const brainY = t23 ? +(t23.brainZ / 0.68 + 50).toFixed(2) : null;
console.log(JSON.stringify({ rosso: ROSSO || null, esito: ESITO, b2: r.b2.slice(-1), tiro23: r.tiro.slice(-1), campioni: r.rec.length, maxX: +maxX.toFixed(2), yAllaLinea: oltre ? +oltre[1].toFixed(2) : null, brainY, errori }));
await browser.close(); server.close();
