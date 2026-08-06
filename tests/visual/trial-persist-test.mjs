#!/usr/bin/env node
/* [7.330.0 collaudo PO «se non termino i provini non viene salvata la carriera» + «il pulsante opzioni nel live
   match dei provini non deve comparire»] Guardiano PERMANENTE della persistenza pre-carriera:
   (1) envelope cpm-trial-prog ph:'trial' → il boot RIPRENDE i provini (provino giusto, risultati conservati);
   (2) durante il match del provino il tasto ⚙️ Opzioni NON è visibile (prima copriva la cronaca);
   (3) envelope ph:'offers' → il boot riprende dalle OFFERTE;
   (4) controprova: senza envelope si parte dalla Home;
   (5) una carriera attiva (cpm-active) ha la precedenza sull'envelope.
   ⚠️ Le pagine girano SENZA ?cpmtest=1: l'auto-ripresa è spenta sotto test (come la 7.149). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
let fails = 0; const say = (ok, m) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${m}`); };

const mkPlayer = () => ({ name: 'Trial Persist', nation: 'Italia', avatarId: 0, foot: 'R', position: 'Attaccante', age: 17, season: 1, week: 1, proStatus: 'u18', isU18: true, trialsDone: 0, trialStats: [], goals: 0, assists: 0, matches: 0, totalGoals: 0, totalAssists: 0, totalMatches: 0, morale: 70, fatigue: 0, popularity: 20, form: 70, coachTrust: 60, value: 0.8, ovr: 62, log: [], history: [], matchHistory: [],
  stats: { 'velocità': 62, tecnica: 60, fisico: 58, 'mentalità': 60, tiro: 64, passaggio: 60, dribbling: 62, posizionamento: 60 },
  archetype: { id: 'bomber' }, contract: { duration: 1, wage: 577, expiresAtSeason: 2 } });

const boot = async (init) => {
  const page = await browser.newPage(); await page.setViewportSize({ width: 480, height: 980 });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(() => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} });
  if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1600);
  return { page, errs };
};

/* (1)+(2) ripresa provini a metà: envelope tn:1 con 1 risultato */
{
  const env = { ph: 'trial', p: mkPlayer(), tn: 1, res: [{ goals: 1, assists: 0, rating: 7.2 }], opps: ['t_reg', 't_acc', 't_rap'] };
  const { page, errs } = await boot({ fn: (e) => { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(e)); } catch (x) {} }, arg: env });
  const t = await page.evaluate(() => document.body.innerText);
  say(/PROVINO/i.test(t) && /Secondo provino/i.test(t), `(1) boot con envelope tn:1 → schermata PRE del 2° provino (visto: ${/Secondo provino/i.test(t)})`);
  say(/Finora ai provini:\s*1 gol/i.test(t), `(1b) i risultati del 1° provino sono CONSERVATI («Finora ai provini: 1 gol» renderizzato)`);
  const optPre = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Opzioni/.test(b.textContent || '')));/* position:fixed → offsetParent è null anche da visibile: si controlla la PRESENZA nel DOM */
  say(optPre, `(2a) nella schermata PRE il tasto ⚙️ Opzioni c'è (come da 7.104)`);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Inizia il provino/.test(x.textContent || '')); if (b) b.click(); });
  await sleep(2500);
  const inMatch = await page.evaluate(() => /PROVINO 2\/3/.test(document.body.innerText));
  const optInMatch = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Opzioni/.test(b.textContent || '')));
  say(inMatch, `(2b) il match del 2° provino parte (badge PROVINO 2/3)`);
  say(!optInMatch, `(2c) DURANTE il match il tasto ⚙️ Opzioni NON è visibile`);
  say(!errs.length, `(1c) 0 pageerror (${errs.join('; ') || 'ok'})`);
  await page.close();
}

/* (3) ripresa dalle offerte */
{
  const env = { ph: 'offers', p: mkPlayer(), res: [{ goals: 1, assists: 0, rating: 7.2 }, { goals: 2, assists: 1, rating: 7.8 }, { goals: 0, assists: 1, rating: 6.6 }] };
  const { page, errs } = await boot({ fn: (e) => { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(e)); } catch (x) {} }, arg: env });
  const t = await page.evaluate(() => document.body.innerText);
  say(/offert/i.test(t) && !/Inizia il provino/i.test(t), `(3) boot con envelope ph:offers → schermata OFFERTE (niente provini)`);
  say(!errs.length, `(3b) 0 pageerror`);
  await page.close();
}

/* (4) controprova: nessun envelope → Home */
{
  const { page } = await boot(null);
  const t = await page.evaluate(() => document.body.innerText);
  say(/Nuova carriera|Carriera|Slot/i.test(t) && !/PROVINO \d/i.test(t), `(4) senza envelope si parte dalla HOME`);
  await page.close();
}

/* (5) carriera attiva batte l'envelope */
{
  const career = { phase: 'career', player: { ...mkPlayer(), proStatus: 'pro', season: 2, week: 3, club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' }, tutorialDone: true, campDone: true } };
  const env = { ph: 'trial', p: mkPlayer(), tn: 0, res: [], opps: ['t_reg', 't_acc', 't_rap'] };
  const { page } = await boot({ fn: (d) => { try { localStorage.setItem('cpm-v3', JSON.stringify(d.c)); localStorage.setItem('cpm-active', '0'); localStorage.setItem('cpm-trial-prog', JSON.stringify(d.e)); } catch (x) {} }, arg: { c: career, e: env } });
  await sleep(1200);
  const t = await page.evaluate(() => document.body.innerText);
  say(/Vivi la Settimana|Dashboard|S\.2/i.test(t) && !/PROVINO \d/i.test(t), `(5) carriera attiva (cpm-active) ha la precedenza sull'envelope provini`);
  await page.close();
}

await browser.close(); srv.close();
console.log(fails ? `\n❌ FAIL — ${fails}` : '\n✅ PASS — i provini persistono, l\'Opzioni sparisce nel match, le precedenze tengono');
process.exit(fails ? 1 : 0);
