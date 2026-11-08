#!/usr/bin/env node
/* [giro 120 · PO-322 «uscita su Google Play con lo stesso sistema di PLINTO»] GUARDIANO della MODALITA' APP (Trusted Web Activity).
   La TWA com.korward.elite apre il sito con ?app=twa (twa/manifest-twa.webmanifest, twa/android/.../strings.xml). In quella
   modalita' la pagina deve comportarsi come la build store; senza parametro il sito resta quello di sempre.
   Tre bracci sulla stessa carriera di prova (banco-g0, stagione 12), un caricamento nuovo ciascuno:
     web   = senza parametro          → modalita' app SPENTA, la funzione AI tenta la sua chiamata (con chiave), PayPal presente
     app   = ?app=twa                  → app ACCESA: AI spenta (disabled_store_build), 0 richieste esterne fuori dai file del gioco,
                                         PayPal presente, Indietro da una scheda → Home della carriera, Indietro dalla Home → uscita
     rosso = ?app=twa + __CPM_NO_G120  → l'interruttore spegne il rimedio: i controlli dell'app DEVONO cadere, altrimenti il
                                         guardiano e' cieco (dichiarato in coda)
   «File del gioco» = stessa origine + le librerie che il SORGENTE carica da CDN (cdnjs/jsdelivr, servite qui dai node_modules):
   il sito pubblicato (dist-web) le ha inline, quindi nella TWA quelle richieste non esistono. Ogni altro host si blocca e si conta.
   Regole PROCESSO.md «Controlli instabili»: si attendono EVENTI (DOM della carriera, voce del registro Indietro), mai tempi fissi
   per giudicare; «non giudicato» = rosso; braccio e motivo stampati per ultimi.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node twa-120.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const DON = 'button[title="Sostieni lo sviluppo di Korward Elite"]';
const attendi = async (page, fn, arg, ms) => { try { await page.waitForFunction(fn, arg, { timeout: ms, polling: 100 }); return true; } catch (_e) { return false; } };

async function braccio(nome, query, rossi) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  /* il service worker si BLOCCA: le richieste che fa lui non passano da page.route (misurato: la chiamata AI usciva da li', 401 dal
     server vero, 0 contate). Il SW non aggiunge destinazioni — rilancia le stesse richieste della pagina — quindi l'elenco resta quello. */
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const est = []; const errs = [];
  await page.route(u => { try { const h = new URL(u).hostname; return h !== 'localhost' && h !== '127.0.0.1' && !/^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/.test(h); } catch (_e) { return false; } },
    r => { est.push(r.request().url().slice(0, 90)); return r.abort(); });
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi, save: SAVE });
  await page.addInitScript(() => { try { localStorage.setItem('cpm-api-key', 'sk-prova-giro120'); } catch (_e) {} });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  const R = { nome };
  R.app = await page.evaluate(() => ({ twa: window.__CPM_APP_TWA === true, store: window.__CPM_STORE_BUILD === true }));
  /* la funzione AI si PROVOCA (con chiave), non si aspetta che il gioco la chiami */
  R.ai = await page.evaluate(async () => { try { if (typeof callClaudeAPI !== 'function') return 'assente'; const x = await callClaudeAPI('s', 'u'); return (x && x.error) || (x && x.success ? 'ok' : '?'); } catch (e) { return 'eccezione:' + String(e.message).slice(0, 40); } });
  /* in carriera: «Continua» dalla home */
  await sleep(800);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 10000 }); } catch (_e) {}
  R.carriera = await attendi(page, s => !!document.querySelector(s) && !!document.querySelector('.cpm-nav-tabs'), DON, 45000);
  R.paypal = R.carriera ? await page.evaluate(s => { const x = document.querySelector(s); const r = x && x.getBoundingClientRect(); return !!(r && r.width > 0); }, DON) : null;
  /* tasto Indietro: da una scheda diversa dalla Home */
  R.indietro = null; R.uscita = null;
  /* sul sito web Indietro lascia la pagina (comportamento di sempre): li' si legge solo che non c'e' guardia, senza premerlo */
  if (R.carriera && !query) R.indietro = { log: await page.evaluate(() => window.__CPM_G120_LOG || null) };
  else if (R.carriera) {
    const url0 = page.url();
    const tocca = await page.evaluate(() => { const bt = [...document.querySelectorAll('.cpm-nav-tabs button')].filter(x => x.getBoundingClientRect().width > 0); const x = bt[1]; if (!x) return null; x.click(); return (x.textContent || '').trim().slice(0, 20); });
    const via = await attendi(page, () => localStorage.getItem('cpm-active-tab') !== 'dashboard', null, 8000); /* la scheda la dichiara il gioco (goTab → cpm-active-tab) */
    const n0 = await page.evaluate(() => (window.__CPM_G120_LOG || []).length);
    await page.goBack({ timeout: 5000 }).catch(() => null);
    const evento = await attendi(page, n => (window.__CPM_G120_LOG || []).length > n, n0, 5000);
    const home = await attendi(page, () => localStorage.getItem('cpm-active-tab') === 'dashboard', null, 8000);
    R.indietro = { tocca, via, evento, home, stessaPagina: page.url().split('#')[0] === url0.split('#')[0], log: await page.evaluate(() => window.__CPM_G120_LOG || null) };
    if (evento) { await page.goBack({ timeout: 5000 }).catch(() => null); await sleep(300);
      R.uscita = await page.evaluate(() => { const l = window.__CPM_G120_LOG || []; return l[l.length - 1] || null; }).catch(() => 'pagina lasciata'); }
  }
  R.esterne = est; R.errori = errs;
  await ctx.close();
  return R;
}

const web = await braccio('web', '', []);
const app = await braccio('app', '?app=twa', []);
const rosso = await braccio('rosso', '?app=twa', ['__CPM_NO_G120']);
await b.close(); srv.close();

const C = []; const c = (k, ok, m) => { C.push({ k, ok }); console.log(`  ${ok === true ? 'OK ' : ok === false ? 'NO ' : 'n.g.'} ${k}: ${m}`); };
const tutti = R => R.esterne.length;
const appOk = R => ({
  modo: R.app.twa && R.app.store,
  ai: R.ai === 'disabled_store_build',
  rete: tutti(R) === 0,
  paypal: R.paypal === true,
  indietro: !!(R.indietro && R.indietro.via && R.indietro.evento && R.indietro.home && R.indietro.stessaPagina && R.indietro.log && R.indietro.log[0] === 'handled'),
  uscita: R.uscita === 'exit',
});
for (const R of [web, app, rosso]) console.log(`[${R.nome}] app=${JSON.stringify(R.app)} ai=${R.ai} carriera=${R.carriera} paypal=${R.paypal} indietro=${JSON.stringify(R.indietro)} uscita=${R.uscita} esterne=${R.esterne.length}${R.esterne.length ? ' (' + [...new Set(R.esterne.map(u => new URL(u).hostname))].join(', ') + ')' : ''} errori=${R.errori.length}`);
console.log('— verdetti');
/* web invariato */
c('web: modalita\' app spenta', !web.app.twa && !web.app.store, JSON.stringify(web.app));
c('web: la funzione AI tenta la chiamata (comportamento di sempre)', web.esterne.some(u => u.includes('api.anthropic.com')), `esito «${web.ai}», richieste a api.anthropic.com ${web.esterne.filter(u => u.includes('api.anthropic.com')).length}`);
c('web: PayPal presente', web.paypal === true ? true : web.paypal === false ? false : null, String(web.paypal));
c('web: nessuna guardia di cronologia', web.indietro ? web.indietro.log === null : null, JSON.stringify(web.indietro && web.indietro.log));
/* app */
const A = appOk(app);
c('app: modalita\' app accesa (= build store)', A.modo, JSON.stringify(app.app));
c('app: funzione AI spenta', A.ai, `esito «${app.ai}»`);
c('app: 0 richieste esterne oltre ai file del gioco', A.rete, `${tutti(app)} ${JSON.stringify(app.esterne.slice(0, 3))}`);
c('app: PayPal presente (decisione PO)', app.paypal == null ? null : A.paypal, String(app.paypal));
c('app: Indietro da una scheda → Home della carriera', app.indietro == null ? null : A.indietro, JSON.stringify(app.indietro));
c('app: Indietro dalla Home → uscita', app.uscita == null ? null : A.uscita, String(app.uscita));
c('app/web: nessun errore JS', !app.errori.length && !web.errori.length, JSON.stringify([...web.errori, ...app.errori].slice(0, 2)));
/* rosso: deve cadere su ogni punto del rimedio (PayPal resta in entrambi: non e' un punto del rimedio) */
const Rr = appOk(rosso); const cadute = ['modo', 'ai', 'rete', 'indietro'].filter(k => !Rr[k]);
c('rosso: l\'interruttore __CPM_NO_G120 fa cadere modo/AI/rete/Indietro', cadute.length === 4, `cadono ${cadute.join(', ') || 'nessuno'} su 4`);
const verde = C.every(x => x.ok === true);
console.log(`\ntwa-120 ${verde ? '✅ VERDE' : '❌ ROSSO'} — ${C.filter(x => x.ok === true).length}/${C.length} controlli · ${C.filter(x => x.ok !== true).map(x => x.k).join(' | ') || 'nessun motivo'}`);
process.exit(verde ? 0 : 1);
