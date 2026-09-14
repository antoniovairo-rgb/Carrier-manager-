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
  const env = { ph: 'trial', p: mkPlayer(), tn: 1, res: [{ goals: 1, assists: 0, rating: 7.2 }], opps: ['t_reg', 't_acc', 't_rap'] };/* tn coerente con res.length=1 → 2° provino */
  const { page, errs } = await boot({ fn: (e) => { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(e)); } catch (x) {} }, arg: env });
  const t = await page.evaluate(() => document.body.innerText);
  say(/PROVINO/i.test(t) && /Secondo provino/i.test(t), `(1) boot con envelope tn:1 → schermata PRE del 2° provino (visto: ${/Secondo provino/i.test(t)})`);
  say(/Finora ai provini:\s*1 gol/i.test(t), `(1b) i risultati del 1° provino sono CONSERVATI («Finora ai provini: 1 gol» renderizzato)`);
  const optPre = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Opzioni/.test(b.textContent || '')));
  say(!optPre, `(2a) [7.331.0] il tasto ⚙️ Opzioni NON esiste più nelle fasi pre-carriera (solo Home e carriera)`);
  const kbHint = await page.evaluate(() => /\[Enter\]/.test(document.body.innerText));
  say(kbHint, `(2a-bis) [7.331.0] su DESKTOP (hover reale) l'hint [Enter] resta`);
  const tipMira = await page.evaluate(() => /barra di mira/i.test(document.body.innerText));
  say(!tipMira, `(2a-ter) [7.331.0] il tip deprecato «barra di mira» non c'è più`);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Inizia il provino/.test(x.textContent || '')); if (b) b.click(); });
  await sleep(2500);
  const inMatch = await page.evaluate(() => /PROVINO 2\/3/.test(document.body.innerText));
  const optInMatch = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => /Opzioni/.test(b.textContent || '')));
  say(inMatch, `(2b) il match del 2° provino parte (badge PROVINO 2/3)`);
  say(!optInMatch, `(2c) DURANTE il match il tasto ⚙️ Opzioni NON è visibile`);
  say(!errs.length, `(1c) 0 pageerror (${errs.join('; ') || 'ok'})`);
  await page.close();
}

/* (1-quater) IL BUG DEI 4 PROVINI: envelope con tn=1 STANTIO ma res GIÀ 2 (chiusura nella schermata post)
   → la ripresa deve andare al TERZO provino (derivato da res.length), non rigiocare il secondo */
{
  const env = { ph: 'trial', p: mkPlayer(), tn: 1, res: [{ goals: 1, assists: 0, rating: 7.2 }, { goals: 0, assists: 1, rating: 6.9 }], opps: ['t_reg', 't_acc', 't_rap'] };
  const { page } = await boot({ fn: (e) => { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(e)); } catch (x) {} }, arg: env });
  const t = await page.evaluate(() => document.body.innerText);
  say(/Ultimo provino/i.test(t), `(1d) tn stantio + 2 risultati → si riprende dal TERZO provino (mai 4 provini)`);
  await page.close();
}

/* (1-quinquies) envelope trial con 3 risultati (chiusura sull'ultimo post) → dritto alle OFFERTE */
{
  const env = { ph: 'trial', p: mkPlayer(), tn: 2, res: [{ goals: 1, assists: 0, rating: 7 }, { goals: 1, assists: 0, rating: 7 }, { goals: 0, assists: 0, rating: 6.2 }], opps: ['t_reg', 't_acc', 't_rap'] };
  const { page } = await boot({ fn: (e) => { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(e)); } catch (x) {} }, arg: env });
  const t = await page.evaluate(() => document.body.innerText);
  say(/offert/i.test(t) && !/Inizia il provino/i.test(t) && !/Provino 4/i.test(t), `(1e) envelope trial COMPLETO → offerte, e nessun «Provino 4»`);
  await page.close();
}

/* (2-touch) su un dispositivo TOUCH (hover:none) l'hint [Enter] NON deve comparire */
{
  const ctx = await browser.newContext({ viewport: { width: 480, height: 980 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-intro-seen', '1'); } catch (e) {} });
  const env = { ph: 'trial', p: mkPlayer(), tn: 0, res: [], opps: ['t_reg', 't_acc', 't_rap'] };
  await page.addInitScript((e) => { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(e)); } catch (x) {} }, env);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1600);
  const t = await page.evaluate(() => ({ enter: /\[Enter\]/.test(document.body.innerText), pre: /Inizia il provino/i.test(document.body.innerText) }));
  say(t.pre && !t.enter, `(2f) su TOUCH (hover:none emulato) niente scritta [Enter] («Inizia il provino» pulito)`);
  await ctx.close();
}

/* [7.332.0 BUG GRAVE «mi ha sovrascritto una carriera»] SCENARI SLOT — la ripresa non deve MAI
   puntare uno slot con una carriera dentro se non è quello scelto alla creazione */
/* (S1) envelope CON slot:2 → la ripresa restaura currentSlot=2 (la firma scriverà lì) */
{
  const env = { ph: 'trial', p: mkPlayer(), tn: 0, res: [], opps: ['t_reg', 't_acc', 't_rap'], slot: 2 };
  const { page } = await boot({ fn: (e) => { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(e)); } catch (x) {} }, arg: env });
  const slot = await page.evaluate(() => window.__CPM_CUR_SLOT);
  say(slot === 2, `(S1) envelope con slot:2 → currentSlot restaurato a 2 (letto: ${slot})`);
  await page.close();
}
/* (S2) envelope STANTIO senza slot + carriera in slot 0 + slot 1 vuoto → ripresa su PRIMO SLOT VUOTO (1), mai 0 */
{
  const career = { phase: 'career', player: { ...mkPlayer(), name: 'Carriera Preziosa', proStatus: 'pro', season: 5, club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#fff', nat: '🇮🇹', lg: 'Lega B' } } };
  const env = { ph: 'trial', p: mkPlayer(), tn: 0, res: [], opps: ['t_reg', 't_acc', 't_rap'] };
  const { page } = await boot({ fn: (d) => { try { localStorage.setItem('cpm-v3', JSON.stringify(d.c)); localStorage.setItem('cpm-trial-prog', JSON.stringify(d.e)); } catch (x) {} }, arg: { c: career, e: env } });
  const st = await page.evaluate(() => ({ slot: window.__CPM_CUR_SLOT, pre: /Inizia il provino/i.test(document.body.innerText) }));
  say(st.pre && st.slot !== 0 && st.slot != null, `(S2) envelope 7.330 senza slot + carriera in slot 0 → ripresa sul primo slot VUOTO (letto: ${st.slot}) — lo slot 0 non verrà MAI sovrascritto`);
  await page.close();
}
/* (S3) envelope senza slot e TUTTI gli slot occupati → niente ripresa (Home): mai distruggere un salvataggio */
{
  const mkCareer = (nm) => ({ phase: 'career', player: { ...mkPlayer(), name: nm, proStatus: 'pro', season: 3, club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#fff', nat: '🇮🇹', lg: 'Lega B' } } });
  const env = { ph: 'trial', p: mkPlayer(), tn: 0, res: [], opps: ['t_reg', 't_acc', 't_rap'] };
  const { page } = await boot({ fn: (d) => { try { localStorage.setItem('cpm-v3', JSON.stringify(d.a)); localStorage.setItem('cpm-v3-s2', JSON.stringify(d.b)); localStorage.setItem('cpm-v3-s3', JSON.stringify(d.c)); localStorage.setItem('cpm-trial-prog', JSON.stringify(d.e)); } catch (x) {} }, arg: { a: mkCareer('Uno'), b: mkCareer('Due'), c: mkCareer('Tre'), e: env } });
  const st = await page.evaluate(() => ({ home: !/Inizia il provino/i.test(document.body.innerText), envGone: !localStorage.getItem('cpm-trial-prog') }));
  say(st.home && st.envGone, `(S3) envelope senza slot + 3 slot PIENI → niente ripresa (Home) e envelope azzerato: nessuna carriera a rischio`);
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
