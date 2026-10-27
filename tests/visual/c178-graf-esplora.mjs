import { startServer, launchBrowser, apriPagina, entraInCarriera, FORMATI, sleep, SAVE, TRIALPROG, ferma } from './c178-graf-lib.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = [];
const f = FORMATI.tel;
const btns = (page) => page.evaluate(() => [...document.querySelectorAll('button,[role=button]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map(e => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean));
{ const { ctx, page } = await apriPagina(b, port, f, {}, '?cpmtest=1', errs); await ferma(page); console.log('HOME', JSON.stringify(await btns(page))); await ctx.close(); }
{ const { ctx, page } = await apriPagina(b, port, f, { save: SAVE }, '?cpmtest=1', errs); const ok = await entraInCarriera(page, errs); console.log('carriera', ok);
  for (const t of ['dashboard','standings','calendar','coppe','club','profile','nazionale','agente','ufficio']) { await page.evaluate(x => window.__CPM_CAREER.goTab(x), t); await ferma(page); console.log('\nTAB', t, JSON.stringify(await btns(page))); }
  await ctx.close(); }
console.log(errs); await b.close(); srv.close();
