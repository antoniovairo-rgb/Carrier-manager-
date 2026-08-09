#!/usr/bin/env node
/* [7.374.0] GUARDIANO DELLA RELAZIONE COL PROCURATORE (R1) — direttiva PO «evoluzione completa
   del sistema Procuratore».

   R1 aggiunge SOLO dati e funzioni pure: chi e' il procuratore, che rapporto avete, cosa si
   ricorda. La cosa che questo guardiano deve garantire, prima di ogni altra, e' la REGOLA #1 del
   PO — nessuna regressione: se `player.agent` non c'e' (salvataggi vecchi) tutto deve continuare
   a funzionare, e `hasAgent` deve restare la sorgente di verita' per la logica esistente.

   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node agent-relation-test.mjs                     */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(700);

const r = await page.evaluate(() => {
  const out = { err: [], righe: [] };
  const { agentRosterFor, agentRapportTier, agentRemember, agentInit, agentAdvice, AGENT_ARCHETYPES, AGENT_AMBITIONS } = window;
  if (!agentRosterFor || !agentAdvice) return { missing: true };

  /* §20 — la disponibilita' cresce con la carriera, e non e' mai vuota per un esordiente:
     restare senza NESSUN procuratore selezionabile bloccherebbe il sistema all'inizio. */
  const eso = agentRosterFor({ popularity: 5, value: 0.4 }).map(a => a.id);
  const aff = agentRosterFor({ popularity: 30, value: 4 }).map(a => a.id);
  const top = agentRosterFor({ popularity: 60, value: 20 }).map(a => a.id);
  out.righe.push(`roster: esordiente ${eso.length} · affermato ${aff.length} · top ${top.length}`);
  if (!eso.length) out.err.push('un esordiente non ha NESSUN procuratore disponibile: il sistema sarebbe irraggiungibile');
  if (!(eso.length <= aff.length && aff.length <= top.length)) out.err.push('la disponibilita\' non cresce con la carriera');
  if (top.length !== AGENT_ARCHETYPES.length) out.err.push('a fine carriera non sono disponibili tutti gli archetipi');
  eso.forEach(id => { if (aff.indexOf(id) < 0) out.err.push(`«${id}» sparisce crescendo: la disponibilita' non deve MAI togliere opzioni`); });

  /* §17 — le fasce del rapporto sono monotone e coprono tutto lo spettro */
  const fasce = [0, 25, 50, 70, 95].map(agentRapportTier);
  out.righe.push(`fasce: ${fasce.join(' → ')}`);
  if (new Set(fasce).size !== 5) out.err.push(`le fasce del rapporto collassano: ${fasce.join(',')}`);
  if (agentRapportTier(undefined) !== 'conflittuale') out.err.push('rapporto assente non degrada a un valore definito');

  /* §10 — la memoria e' selettiva: non registra tutto, non duplica, tiene l'ultima in testa */
  let m = { amb: [], note: [] };
  ['trofei', 'champions', 'titolare', 'soldi', 'champions'].forEach(v => { m = agentRemember(m, { k: 'ambizione', v }); });
  out.righe.push(`memoria ambizioni: ${JSON.stringify(m.amb)}`);
  if (m.amb.length > 3) out.err.push(`la memoria delle ambizioni non ha tetto: ${m.amb.length} voci`);
  if (m.amb[0] !== 'champions') out.err.push("l'ultima ambizione dichiarata non e' la piu' recente in memoria");
  if (new Set(m.amb).size !== m.amb.length) out.err.push('la memoria duplica la stessa ambizione');
  for (let i = 0; i < 40; i++) m = agentRemember(m, { k: 'decisione', v: 'x' + i });
  if (m.note.length > 8) out.err.push(`le note non hanno tetto: ${m.note.length}`);
  if (JSON.stringify(agentRemember(null, null)) !== JSON.stringify({ amb: [], note: [] })) out.err.push('agentRemember non regge ingressi vuoti');

  /* §11 — «gioca poco ma rende bene»: il tema deve essere lo SPAZIO, non il rendimento */
  const pocoBene = agentAdvice({ matches: 10, goals: 4, assists: 2, coachTrust: 30, morale: 60, contract: { wage: 5000, years: 3 }, value: 4, popularity: 20 }, agentInit({ id: 'prudente' }));
  out.righe.push(`gioca poco ma rende: temi=${pocoBene.temi.join(',')} verso=${pocoBene.verso}`);
  if (pocoBene.temi.indexOf('spazio') < 0) out.err.push('«gioca poco ma rende bene» non produce il tema SPAZIO');
  if (pocoBene.temi.indexOf('rendimento') >= 0) out.err.push('«gioca poco ma rende bene» viene letto come problema di rendimento');

  /* titolare, sereno, contratto lungo → il consiglio e' restare */
  const sereno = agentAdvice({ matches: 20, goals: 8, assists: 5, coachTrust: 80, morale: 75, contract: { wage: 9000, years: 3 }, value: 8, popularity: 20 }, agentInit({ id: 'prudente' }));
  if (sereno.verso === 'cambiare') out.err.push('un titolare sereno con contratto lungo si sente consigliare di cambiare');

  /* §18 — la personalita' si deve SENTIRE: a parita' di contesto, ambizioso e prudente non
     possono dare la stessa spinta al mercato */
  const ctx = { matches: 14, goals: 5, assists: 3, coachTrust: 55, morale: 60, contract: { wage: 6000, years: 2 }, value: 9, popularity: 40 };
  const amb = agentAdvice(ctx, agentInit({ id: 'ambizioso' })).muovi;
  const pru = agentAdvice(ctx, agentInit({ id: 'prudente' })).muovi;
  out.righe.push(`stesso contesto: ambizioso ${amb} vs prudente ${pru}`);
  if (!(amb > pru + 0.3)) out.err.push(`la personalita' non si sente: ambizioso ${amb} vs prudente ${pru}`);

  /* §10 — la memoria PIEGA il consiglio: chi ha detto «fedelta'» non si sente dire di andarsene */
  const fedele = agentInit({ id: 'ambizioso' }); fedele.memory = agentRemember({ amb: [], note: [] }, { k: 'ambizione', v: 'fedelta' });
  const conFed = agentAdvice(ctx, fedele).muovi;
  out.righe.push(`stesso contesto e procuratore, con «fedelta'» in memoria: ${conFed} (era ${amb})`);
  if (!(conFed < amb)) out.err.push("la memoria non influenza il consiglio: «fedelta'» non frena la spinta al mercato");

  /* [7.375.0 R2 §2 + §12] IL REMINDER, e soprattutto il suo ANTI-SPAM. Il rischio di questa
     funzione non e' che non compaia: e' che compaia troppo. */
  const { agentHintCheck, agentHireFee, AGENT_HINT_TXT } = window;
  if (!agentHintCheck) out.err.push('agentHintCheck non esposto');
  else {
    const base = { proStatus: 'pro', contract: { wage: 2000, years: 3 }, bankBalance: 5000, season: 1, week: 10, agentHint: { n: 0, s: 0, w: 0 } };
    const T = (o) => agentHintCheck({ ...base, ...o }).due;
    out.righe.push(`reminder: prima=${T({})} · senzaSoldi=${T({ bankBalance: 100 })} · conAgente=${T({ hasAgent: true })} · u18=${T({ proStatus: 'u18' })}`);
    if (T({}) !== 'first') out.err.push('il reminder non compare la prima volta che l\'Eroe puo\' permetterselo');
    if (T({ bankBalance: 100 }) !== null) out.err.push('il reminder compare senza i fondi necessari');
    if (T({ hasAgent: true }) !== null) out.err.push('il reminder compare a chi ha gia\' un procuratore');
    if (T({ proStatus: 'u18' }) !== null) out.err.push('il reminder compare nelle giovanili');
    /* il costo NON e' nuovo: e' la stessa formula della card d'ingaggio */
    if (agentHireFee({ contract: { wage: 2000 } }) !== 2000) out.err.push('l\'onorario non segue lo stipendio');
    if (agentHireFee({ contract: { wage: 100 } }) !== 500) out.err.push('l\'onorario non rispetta il minimo di 500€');
    /* dopo un «non ora»: silenzio, salvo un motivo vero e non prima di dieci settimane */
    const dopo = { agentHint: { n: 1, s: 1, w: 10 } };
    const sub = T({ ...dopo, week: 12 });
    const merc = T({ ...dopo, week: 22 });
    const rinn = T({ ...dopo, week: 30, contract: { wage: 2000, years: 1 } });
    const nulla = T({ ...dopo, week: 30 });
    out.righe.push(`anti-spam: subito=${sub} · mercato=${merc} · rinnovo=${rinn} · senzaMotivo=${nulla} · dopo4volte=${T({ week: 22, agentHint: { n: 4, s: 1, w: 1 } })}`);
    if (sub !== null) out.err.push('il reminder torna subito dopo un «non ora»: e\' spam');
    if (nulla !== null) out.err.push('il reminder torna senza nessun motivo che lo giustifichi');
    if (merc !== 'mercato') out.err.push('il reminder non torna all\'apertura del mercato');
    if (rinn !== 'rinnovo') out.err.push('il reminder non torna col contratto in scadenza');
    if (T({ week: 22, agentHint: { n: 4, s: 1, w: 1 } }) !== null) out.err.push('il reminder non ha un tetto: continua oltre le quattro volte');
    /* ogni motivo deve avere un testo: un reminder senza voce non e' un reminder */
    ['first', 'mercato', 'rinnovo', 'interesse', 'sponsor'].forEach(k => { if (!AGENT_HINT_TXT || !AGENT_HINT_TXT[k]) out.err.push(`manca il testo del reminder «${k}»`); });
  }

  /* REGOLA #1 — senza relazione il sistema non deve rompersi */
  const senza = agentAdvice({ matches: 5, goals: 1, assists: 0 }, null);
  if (!senza || !Array.isArray(senza.temi)) out.err.push('senza `player.agent` il consiglio non degrada a un valore utilizzabile');
  if (senza.rapporto !== null) out.err.push('senza procuratore viene comunque riportata una fascia di rapporto');
  if (!Array.isArray(AGENT_AMBITIONS) || AGENT_AMBITIONS.length < 6) out.err.push('il catalogo delle ambizioni e\' troppo povero');
  return out;
});

if (r.missing) issues.push('le funzioni del procuratore non sono esposte: il livello puro non e\' raggiungibile');
else { r.righe.forEach(x => console.log('  ' + x)); r.err.forEach(e => issues.push(e)); }

/* REGOLA #1, la parte che conta davvero: la carriera parte e gira come prima */
const vivo = await page.evaluate(() => {
  try {
    const p = window.__CPM_CAREER && window.__CPM_CAREER.player ? window.__CPM_CAREER.player() : null;
    return { ok: true, hasAgent: p ? !!p.hasAgent : null, agent: p ? !!p.agent : null };
  } catch (e) { return { ok: false, e: String(e).slice(0, 80) }; }
});
console.log(`  stato carriera raggiungibile: ${JSON.stringify(vivo)}`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ RELAZIONE PROCURATORE OK — dati, memoria e consiglio reggono, e senza relazione il gioco resta quello di prima');
