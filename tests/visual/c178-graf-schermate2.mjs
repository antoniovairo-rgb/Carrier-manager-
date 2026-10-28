#!/usr/bin/env node
/* [collaudo grafico 178 · PO-299] seconda tornata del censimento: finestre a pagina fresca (le cerimonie non si chiudono con dismiss(), contaminavano le misure successive) + finestre aperte con un tocco dalle schede. */
import { startServer, launchBrowser, apriPagina, entraInCarriera, premi, scelti, sleep, SAVE, misura, salva } from './c178-graf-lib.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = [], mancanti = [], R = {};
const HOOK = [
  ['fin-impulso', () => window.__CPM_CAREER.apriSettimana('impulso')], ['fin-spogliatoio', () => window.__CPM_CAREER.apriSettimana('spogliatoio')], ['fin-settimana-vissuta', () => window.__CPM_CAREER.apriSettimana('vissuta')],
  ['fin-partita-titolare', () => window.__CPM_CAREER.apriPartita('starter')], ['fin-partita-panchina', () => window.__CPM_CAREER.apriPartita('bench')], ['fin-offerta', () => window.__CPM_CAREER.forceOffer()],
  ['fin-intervista-vittoria', () => window.__CPM_CAREER.forceInterview('win')], ['fin-intervista-sconfitta', () => window.__CPM_CAREER.forceInterview('loss')], ['fin-procuratore-intro', () => window.__CPM_CAREER.apriIntro253()],
  ['sch-press', () => window.__CPM_CAREER.goScreen('press')], ['sch-postmatch', () => window.__CPM_CAREER.goScreen('postmatch')], ['sch-seasonEnd', () => window.__CPM_CAREER.goScreen('seasonEnd')],
  ['sch-careerEnd', () => window.__CPM_CAREER.goScreen('careerEnd')], ['sch-nationalCallup', () => window.__CPM_CAREER.goScreen('nationalCallup')], ['sch-proTransition', () => window.__CPM_CAREER.goScreen('proTransition')],
  ['sch-clubPresentation', () => window.__CPM_CAREER.goScreen('clubPresentation')], ['fin-saga', () => window.__CPM_CAREER.forceSaga('capitano')], ['fin-momento-carriera', () => window.__CPM_CAREER.forceMoment('cm_rigore_vita')],
  ['fin-momento-nazionale', () => window.__CPM_CAREER.forceMoment('cm_nazionale_escluso')], ['fin-presentazione-0', () => window.__CPM_CAREER.apriPresentazione(0)], ['fin-presentazione-3', () => window.__CPM_CAREER.apriPresentazione(3)],
  ['fin-gala', () => window.__CPM_CAREER.apriGala()], ['fin-festa-nazione', () => window.__CPM_CAREER.festa251('nation')], ['fin-festa-lega', () => window.__CPM_CAREER.festa251('league')], ['fin-notifica', () => window.__CPM_CAREER.notify247('💪 +3 ⚡+14 ⭐+12')],
  ['fin-intervista-pareggio', () => window.__CPM_CAREER.forceInterview('draw')], ['fin-nazionale-torneo', () => window.__CPM_CAREER.apriNaz55()],
];
const CLIC = [['agente', 'agente', 'Richiedi cessione'], ['agente', 'agente', 'Licenzia il procuratore'], ['agente', 'agente', 'Cambia procuratore'], ['ufficio', 'ufficio', 'FONDA'], ['club', 'club', 'Contratto:'], ['dashboard', 'home', 'Vivi la Settimana'], ['dashboard', 'home', 'Il gruppo prima di tutto'],
  ['profile', 'profilo', 'Contratto'], ['club', 'club', 'Allenatore'], ['dashboard', 'home', 'Salva ·']];
for (const f of scelti()) {
  console.log('\n=== ' + f.nome);
  for (const [id, fn] of HOOK) { const { ctx, page } = await apriPagina(b, port, f, { save: SAVE }, '?cpmtest=1', errs);
    if (!(await entraInCarriera(page, errs))) { mancanti.push(`${f.k} ${id} (carriera)`); await ctx.close(); continue; }
    const r = await page.evaluate(fn).catch(e => 'err ' + e.message); await sleep(1800);
    if (r !== true) mancanti.push(`${f.k} ${id} → ${JSON.stringify(r)}`);
    await misura(page, f, id, R); await ctx.close(); }
  { const { ctx, page } = await apriPagina(b, port, f, { save: SAVE, fisAperte: false }, '?cpmtest=1', errs);
    if (await entraInCarriera(page, errs)) for (const [tab, nome, rx] of CLIC) {
      await page.evaluate(() => { window.__CPM_CAREER.dismiss(); }); await page.keyboard.press('Escape').catch(() => {});
      await page.evaluate(t => window.__CPM_CAREER.goTab(t), tab); await sleep(500);
      const ok = await premi(page, rx); if (!ok) { mancanti.push(`${f.k} clic ${rx}`); continue; } await sleep(900);
      await misura(page, f, `clic-${nome}-${rx.replace(/\W+/g, '').slice(0, 14)}`, R); }
    await ctx.close(); }
  salva(`schermate2-${f.k}.json`, { R: R[f.k], mancanti: mancanti.filter(x => x.startsWith(f.k)), errs: errs.filter(x => x.startsWith(f.k)) });
}
console.log('\nmancanti:', mancanti); await b.close(); srv.close();
