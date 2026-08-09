#!/usr/bin/env node
/* [7.380.0] GUARDIANO DEL CICLO DI VITA DEL PROCURATORE — direttiva PO «la funzionalità deve essere
   realmente integrata nella carriera, non una demo isolata».

   PERCHE' ESISTE. I sei guardiani di R1-R6 verificano ogni regola IN ISOLAMENTO: dato questo stato,
   la funzione risponde cosi'. Nessuno di loro dimostra la cosa che conta davvero — che in una
   carriera VERA quei pezzi si incontrino. Un sistema puo' essere perfetto in ogni sua regola e non
   accadere mai: e' esattamente cio' che era successo al motivo «interesse» del reminder (leggeva
   uno stato che non esiste in `player`) e alla condizione «stipendio inadeguato» (unita' sbagliate,
   mai vera). Due difetti che nessun test di regola avrebbe potuto trovare, perche' le regole erano
   giuste — mancava il collegamento col mondo.

   COSA FA: guida una carriera vera con l'harness `__CPM_CAREER` (gli handler VERI: settimana,
   simulazione, rollover) e registra QUANDO ciascun momento del procuratore accade davvero:
   reminder → ingaggio → confronto → iniziativa. Se uno non arriva mai, lo dice.

   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node agent-lifecycle-test.mjs                     */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));

/* una carriera PRO che puo' gia' permettersi un procuratore ma non ne ha uno: e' il momento esatto
   in cui il sistema deve svegliarsi */
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = {
    phase: 'career', player: {
      name: 'Ciclo Procuratore', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 2, age: 22, ovr: 74,
      club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
      stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 73, tiro: 75, passaggio: 73, dribbling: 74, posizionamento: 73 },
      form: 72, morale: 70, fatigue: 10, popularity: 34, value: 9, bankBalance: 60000,
      hasAgent: false, contract: { duration: 3, wage: 4000, expiresAtSeason: 5, years: 3 },
    },
  };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);

/* lettura dello stato del procuratore, dal player VERO */
const leggi = () => page.evaluate(() => {
  try {
    const C = window.__CPM_CAREER; const st = C.get() || {}; const a = st.ag || {};
    return { s: st.season, w: st.week, hasAgent: !!a.has, hint: a.hint || null,
      checkin: !!a.checkin, init: a.init || null, rapport: a.rapport, amb: a.amb, fee: a.fee, bank: a.bank };
  } catch (e) { return { err: String(e).slice(0, 90) }; }
});

const issues = [], tappe = [];
let s0 = await leggi();
if (s0.err) { issues.push('lo stato del procuratore non e\' leggibile: ' + s0.err); }
console.log(`partenza: S${s0.s} W${s0.w} · agente=${s0.hasAgent}`);

let visto = { hint: null, ingaggio: null, checkin: null, init: null };
for (let iter = 0; iter < 150; iter++) {
  const st = await leggi();
  if (st.err) break;
  /* 1) il REMINDER deve arrivare: l'Eroe puo' permetterselo e non ha nessuno */
  if (st.hint && !visto.hint) { visto.hint = `S${st.s}W${st.w} (${st.hint})`; tappe.push(`reminder → ${visto.hint}`);
    /* 2) l'INGAGGIO passa dalla scena, come nel gioco vero: si clicca */
    const ok = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => /Ingaggia/i.test(b.textContent || ''));
      if (!btn) return 'nessun bottone Ingaggia'; btn.click(); return true;
    });
    if (ok !== true) issues.push('il reminder e\' comparso ma non e\' cliccabile: ' + ok);
    else {
      await sleep(500);
      const amb = await page.evaluate(() => {
        const bs = [...document.querySelectorAll('button')].filter(b => /vincere|giocare|guadagnare|crescere|nome|Nazionale|straniero|legato|Champions/i.test(b.textContent || ''));
        if (!bs.length) return 'nessuna ambizione proposta'; bs[0].click(); return (bs[0].textContent || '').slice(0, 30);
      });
      if (typeof amb === 'string' && amb.indexOf('nessuna') === 0) issues.push('la scena d\'ingaggio non propone ambizioni');
      await sleep(400);
      const firm = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find(x => /Firma/i.test(x.textContent || ''));
        if (!b) return 'nessun bottone Firma'; b.click(); return true;
      });
      if (firm !== true) issues.push('la scena d\'ingaggio non porta alla firma: ' + firm);
      await sleep(700);
      const dopo = await leggi();
      if (!dopo.hasAgent) issues.push('dopo la firma il procuratore non risulta ingaggiato');
      else { visto.ingaggio = `S${dopo.s}W${dopo.w}`; tappe.push(`ingaggio → ${visto.ingaggio} · ambizione ${JSON.stringify(dopo.amb)}`); }
      if (dopo.hasAgent && (!dopo.amb || !dopo.amb.length)) issues.push('l\'ambizione dichiarata non e\' finita nella memoria del procuratore');
    }
  }
  /* 3) il CONFRONTO deve arrivare, dopo mesi e non subito */
  if (st.checkin && !visto.checkin) {
    visto.checkin = `S${st.s}W${st.w}`; tappe.push(`confronto → ${visto.checkin}`);
    const r = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find(x => /Sto benissimo|piu' importante|più importante|guardarci intorno|cambiare completamente/i.test(x.textContent || ''));
      if (!b) return 'nessuna risposta proposta'; b.click(); return true;
    });
    if (r !== true) issues.push('il confronto e\' comparso ma non e\' rispondibile: ' + r);
    else { await sleep(400); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Chiudi/i.test(x.textContent || '')); if (b) b.click(); }); await sleep(400); }
  }
  /* 4) l'INIZIATIVA: il procuratore bussa da solo */
  if (st.init && !visto.init) { visto.init = `S${st.s}W${st.w} (${st.init})`; tappe.push(`iniziativa → ${visto.init}`); }

  if (visto.hint && visto.ingaggio && visto.checkin && visto.init) break;
  const res = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
  if (res === 'seasonEnd') await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
  await sleep(60);
}

const fine = await leggi();
console.log('\ntappe osservate:'); tappe.forEach(t => console.log('  · ' + t));
console.log(`stato finale: S${fine.s} W${fine.w} · agente=${fine.hasAgent} · rapporto=${fine.rapport} · ambizioni=${JSON.stringify(fine.amb)}`);
console.log(`pageerror: ${errors.length}`);

if (!visto.hint) issues.push('IL REMINDER NON ARRIVA MAI in una carriera vera: il sistema resta irraggiungibile');
if (!visto.ingaggio) issues.push('non si riesce a ingaggiare un procuratore passando dall\'interfaccia');
if (!visto.checkin) issues.push('IL CONFRONTO NON ARRIVA MAI: il procuratore non chiede mai come stai');
if (!visto.init) issues.push('L\'INIZIATIVA NON ARRIVA MAI: il procuratore non bussa mai da solo');
if (errors.length) issues.push(`${errors.length} pageerror durante il ciclo: ${errors[0]}`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ CICLO OK — in una carriera vera il procuratore si fa vivo, si ingaggia, chiede come stai e bussa da solo');
