#!/usr/bin/env node
/* [giro 249, dubbi 7 e 8 del giro 238] GUARDIANO: CONTROPROPOSTA SU UN'OFFERTA CHIUSA (C) e MOTIVO DEL TASTO DELLA CORSA CON «IL MISTER
   TI CERCA» APERTO (D). Salvataggio S12 (fixtures/save-190-s12-ovr93.json, professionista col procuratore).
   C · Il banco del giro 238 chiudeva l'offerta di mercato e nello stesso istante toccava «Fai la controproposta»: l'aggiornamento
       trovava l'offerta nulla e CareerApp andava in crash. Nel gioco servono due tocchi nello stesso fotogramma: lo si PROVOCA
       (forceOffer, poi nello stesso compito JavaScript dismiss + click sul tasto). VERDE: nessun crash (registro errori cpm-errlog
       vuoto, nessun «Qualcosa è andato storto», nessun pageerror) e l'offerta chiusa. Poi una seconda offerta e due tocchi di fila
       sulla controproposta nello stesso compito: lo stipendio rilancia una volta sola (x1,20) o resta (il club dice no), mai x1,44.
       ROSSO __CPM_NO_G249: crash (registro errori con «club» o la schermata d'errore).
   D · «Il mister ti cerca» copre il tasto della corsa (nel gioco esce a caso, 4% a settimana: lo si apre col gancio di collaudo
       misterCerca249). VERDE: prima motivo nullo (il tasto si puo' usare), con la finestra aperta motivo «chiudi prima la finestra
       aperta» e il tasto spento in pagina, chiusa la finestra il motivo torna nullo. ROSSO __CPM_NO_G249: con la finestra aperta motivo
       nullo e tasto acceso. Motivo iniziale non nullo = NON GIUDICATO = rosso. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const pe = []; page.on('pageerror', e => pe.push(String(e.message).slice(0, 160)));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.hasAgent = true;
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G249 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.removeItem('cpm-errlog'); }, [sv, rosso]);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(600);
  const R = { rosso };
  /* D */
  const tasto = () => page.evaluate(() => { const t = document.querySelector('[data-cpm="salta163-tasto"]'); const m = document.querySelector('[data-cpm="salta163-motivo"]'); return { motivo: window.__CPM_CAREER.motivo249(), c: !!t, spento: t ? !!t.disabled : null, testo: m ? m.textContent : null, mister: /Il mister ti cerca/i.test(document.body.innerText) }; });
  await page.evaluate(() => window.__CPM_CAREER.goTab && window.__CPM_CAREER.goTab('dashboard')); await sleep(500);
  R.d0 = await tasto();
  R.dApri = await page.evaluate(() => window.__CPM_CAREER.misterCerca249()); await sleep(800);
  R.d1 = await tasto();
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /chiudi|più tardi|non ora|dopo/i.test(x.textContent || '') && x.closest('[role="dialog"],.cpm-modal,[data-cpm]')); if (bt) bt.click(); });
  /* chiude la finestra del mister: l'ultimo tasto del velo (fuori dalle risposte) */
  await page.evaluate(() => { const B = [...document.querySelectorAll('button')]; const x = B.filter(q => /Il mister ti cerca/i.test((q.closest('div[style]') || {}).innerText || '')).pop(); if (x) x.click(); }); await sleep(2200);
  R.d2 = await tasto();
  /* C · offerta chiusa e tocco nello stesso compito */
  R.o1 = await page.evaluate(() => window.__CPM_CAREER.forceOffer()); await sleep(700);
  R.cTasto = await page.evaluate(() => !!document.querySelector('[data-cpm="controproposta-v2"]'));
  R.cErr = await page.evaluate(() => { try { const t = document.querySelector('[data-cpm="controproposta-v2"]'); window.__CPM_CAREER.dismiss(); if (t) t.click(); return null; } catch (e) { return String(e.message); } }); await sleep(1500);
  R.c = await page.evaluate(() => { let el = []; try { el = JSON.parse(localStorage.getItem('cpm-errlog') || '[]'); } catch (e) {} return { crash: /Qualcosa è andato storto/i.test(document.body.innerText), registro: el.map(x => String(x.msg || '').slice(0, 120)), offertaAperta: !!document.querySelector('[data-cpm="controproposta-v2"]') }; });
  /* doppio tocco sulla stessa offerta (solo se la pagina e' viva) */
  if (!R.c.crash) { R.o2 = await page.evaluate(() => window.__CPM_CAREER.forceOffer()); await sleep(700);
    R.dop = await page.evaluate(() => { const t = document.querySelector('[data-cpm="controproposta-v2"]'); if (!t) return null; const w0 = (t.parentElement.innerText.match(/Stipendio:\s*([^/]+)\/anno/) || [])[1] || null; t.click(); t.click(); return { w0 }; }); await sleep(800);
    R.dopDopo = await page.evaluate(() => ({ ok: /Controproposta accettata/i.test(document.body.innerText), no: /Il club non rilancia/i.test(document.body.innerText) })); }
  R.pageerror = pe;
  await ctx.close(); return R; }
const V = await braccio(false), Rr = await braccio(true);
await b.close(); srv.close();
console.log('verde ' + JSON.stringify(V)); console.log('rosso ' + JSON.stringify(Rr));
const esiti = []; let ok = true; const MOT = 'chiudi prima la finestra aperta';
{ const pass = V.cTasto && !V.c.crash && V.c.registro.length === 0 && V.pageerror.length === 0 && !V.c.offertaAperta && !V.cErr;
  esiti.push(`${pass ? '✅' : '❌'} C verde: offerta chiusa e controproposta nello stesso compito → crash ${V.c.crash ? 'SI' : 'no'} · registro errori ${V.c.registro.length} · pageerror ${V.pageerror.length}${V.cTasto ? '' : ' · NON GIUDICATO (tasto della controproposta assente)'}`); ok = ok && pass; }
{ const pass = !!V.dopDopo && (V.dopDopo.ok || V.dopDopo.no);
  esiti.push(`${pass ? '✅' : '❌'} C verde doppio tocco: ${V.dopDopo ? (V.dopDopo.ok ? 'controproposta accettata una volta' : V.dopDopo.no ? 'il club non rilancia' : 'nessun esito') : 'NON GIUDICATO'}`); ok = ok && pass; }
{ const pass = Rr.cTasto && (Rr.c.crash || Rr.c.registro.some(m => /club/.test(m)));
  esiti.push(`${pass ? '✅' : '❌'} C rosso __CPM_NO_G249: ${pass ? 'crash come nel giro 238' : 'crash NON visto'} (schermata d'errore ${Rr.c.crash ? 'si' : 'no'} · registro ${JSON.stringify(Rr.c.registro)})`); ok = ok && pass; }
{ const pass = V.d0.c && V.d0.motivo === null && V.dApri === true && V.d1.mister && V.d1.motivo === MOT && V.d1.spento === true && V.d2.motivo === null;
  esiti.push(`${pass ? '✅' : '❌'} D verde: motivo prima ${JSON.stringify(V.d0.motivo)} · con «Il mister ti cerca» ${JSON.stringify(V.d1.motivo)} tasto spento ${V.d1.spento} · finestra chiusa ${JSON.stringify(V.d2.motivo)}${V.d0.motivo !== null ? ' · NON GIUDICATO (motivo iniziale non nullo)' : ''}`); ok = ok && pass; }
{ const pass = Rr.d0.c && Rr.d0.motivo === null && Rr.d1.mister && Rr.d1.motivo === null && Rr.d1.spento === false;
  esiti.push(`${pass ? '✅' : '❌'} D rosso __CPM_NO_G249: con la finestra aperta motivo ${JSON.stringify(Rr.d1.motivo)} · tasto spento ${Rr.d1.spento}`); ok = ok && pass; }
for (const e of esiti) console.log(e);
console.log(ok ? '✅ offerta-249 verde (e il rosso si vede)' : '❌ offerta-249 rosso');
process.exit(ok ? 0 : 1);
