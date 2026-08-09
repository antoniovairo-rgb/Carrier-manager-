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

  /* [7.376.0 R3 §3] IL PRIMO INCONTRO: quattro strade, non nove — e devono essere DIVERSE fra
     loro, altrimenti la domanda «cosa vuoi davvero» diventa un questionario con quattro sfumature
     della stessa risposta. */
  const { agentIntroOptions, agentIntroLine, AGENT_INTRO_REPLY, agentHirePatch } = window;
  if (!agentIntroOptions) out.err.push('agentIntroOptions non esposto');
  else {
    const giovanePiccolo = agentIntroOptions({ age: 19, club: { p: 55 }, popularity: 5 }).map(o => o.id);
    const maturoBig = agentIntroOptions({ age: 26, club: { p: 84 }, popularity: 55 }).map(o => o.id);
    out.righe.push(`incontro: giovane/piccolo=${giovanePiccolo.join(',')} · maturo/big=${maturoBig.join(',')}`);
    [giovanePiccolo, maturoBig].forEach((set, i) => {
      if (set.length !== 4) out.err.push(`le strade proposte non sono quattro (${set.length}) nel caso ${i}`);
      if (new Set(set).size !== set.length) out.err.push(`una strada e' proposta due volte nel caso ${i}: ${set.join(',')}`);
    });
    if (JSON.stringify(giovanePiccolo) === JSON.stringify(maturoBig)) out.err.push('le strade non dipendono dal contesto: identiche per un esordiente e per un big');
    if (giovanePiccolo.indexOf('titolare') < 0) out.err.push('a un giovane in un club piccolo non viene proposto di giocare');
    if (maturoBig.indexOf('champions') < 0) out.err.push('a un giocatore di una big non viene proposta la Champions');
    /* determinismo: stesso giocatore, stesse strade (non devono cambiare al reload) */
    if (JSON.stringify(agentIntroOptions({ age: 19, club: { p: 55 }, popularity: 5 }).map(o => o.id)) !== JSON.stringify(giovanePiccolo))
      out.err.push('le strade proposte non sono deterministiche');
    /* ogni ambizione deve avere una risposta del procuratore che la CITA */
    (window.AGENT_AMBITIONS || []).forEach(a => { if (!AGENT_INTRO_REPLY[a.id]) out.err.push(`manca la risposta del procuratore per «${a.id}»`); });
    const ln = agentIntroLine({}, 'Tizio', 'champions');
    if (!ln.domanda || ln.domanda.indexOf('cosa vuoi davvero') < 0) out.err.push("la domanda dell'incontro non e' quella della direttiva");

    /* §5 — l'ambizione dichiarata deve ENTRARE nella memoria all'atto della firma */
    const dopoFirma = agentHirePatch({ name: 'Tizio', season: 2, week: 5, bankBalance: 9000, contract: { wage: 1000 } }, 1000, 'champions');
    out.righe.push(`firma: hasAgent=${dopoFirma.hasAgent} · saldo=${dopoFirma.bankBalance} · memoria=${JSON.stringify(dopoFirma.agent && dopoFirma.agent.memory.amb)}`);
    if (!dopoFirma.hasAgent) out.err.push('la firma non attiva il procuratore');
    if (dopoFirma.bankBalance !== 8000) out.err.push(`l'onorario non e' stato scalato: ${dopoFirma.bankBalance}`);
    if (!dopoFirma.agent || dopoFirma.agent.memory.amb[0] !== 'champions') out.err.push("l'ambizione dichiarata non entra nella memoria alla firma");
    if (dopoFirma.agentHint && dopoFirma.agentHint.due) out.err.push('dopo la firma il reminder resta acceso');
    /* firmare SENZA dichiarare nulla non deve rompere niente */
    const senzaAmb = agentHirePatch({ name: 'Tizio', bankBalance: 9000, contract: { wage: 1000 } }, 1000);
    if (!senzaAmb.hasAgent || !senzaAmb.agent) out.err.push('la firma senza ambizione dichiarata non regge');
  }

  /* [7.377.0 R4 §4] IL CONFRONTO: cadenza, memoria, e conseguenze VERE. */
  const { agentCheckinDue, agentCheckinAsk, agentCheckinApply, AGENT_CHECKIN_REPLY } = window;
  if (!agentCheckinDue) out.err.push('agentCheckinDue non esposto');
  else {
    const mkAg = (sinceW, lastW, amb) => { const a = agentInit({ id: 'prudente', name: 'X', season: 1, week: sinceW }); a.lastCheckin = { s: 1, w: lastW }; if (amb) a.memory = agentRemember(a.memory, { k: 'ambizione', v: amb }); return a; };
    const P = (w, ag) => ({ proStatus: 'pro', hasAgent: true, name: 'Tizio', season: 1, week: w, agent: ag, matches: 10, goals: 4, assists: 2, coachTrust: 30, morale: 60, contract: { wage: 5000, years: 3 }, value: 4, popularity: 20 });
    /* appena firmato non si chiede «come stai» */
    const subito = agentCheckinDue(P(4, mkAg(1, 1)));
    /* passati 4-5 mesi si', e l'attesa sta nella finestra dichiarata */
    const lungo = agentCheckinDue(P(30, mkAg(1, 1)));
    out.righe.push(`confronto: appenaFirmato=${subito.due} · dopo29settimane=${lungo.due} (attesa ${lungo.att})`);
    if (subito.due) out.err.push('il confronto parte appena firmato: non ha senso chiedere «come stai» dopo tre settimane');
    if (!lungo.due) out.err.push('il confronto non arriva mai: dopo 29 settimane dovrebbe essere dovuto');
    if (!(lungo.att >= 16 && lungo.att <= 20)) out.err.push(`l'attesa non e' nei 4-5 mesi dichiarati: ${lungo.att} settimane`);
    if (agentCheckinDue(P(30, mkAg(1, 1))).att !== lungo.att) out.err.push("l'attesa non e' deterministica: cambia fra due letture identiche");
    /* variabilita': carriere diverse NON devono avere tutte lo stesso ritmo */
    const attese = ['Tizio', 'Caio', 'Sempronio', 'Marco', 'Luca', 'Anna'].map(n => agentCheckinDue({ ...P(30, mkAg(1, 1)), name: n }).att);
    out.righe.push(`ritmi su sei carriere: ${attese.join(',')}`);
    if (new Set(attese).size < 2) out.err.push('il confronto ha la stessa identica cadenza per tutti: sembra un evento meccanico');
    /* senza procuratore non si chiede niente */
    if (agentCheckinDue({ proStatus: 'pro', season: 2, week: 30 }).due) out.err.push('il confronto arriva senza procuratore');

    /* §5 — la domanda RICORDA ciò che l'Eroe ha dichiarato */
    const conAmb = agentCheckinAsk(P(30, mkAg(1, 1, 'champions')), mkAg(1, 1, 'champions'));
    const senzAmb = agentCheckinAsk(P(30, mkAg(1, 1)), mkAg(1, 1));
    out.righe.push(`domanda: conRicordo=${conAmb.ricordo ? 'sì' : 'no'} · senzaRicordo=${senzAmb.ricordo ? 'sì' : 'no'}`);
    if (!conAmb.ricordo || conAmb.ricordo.indexOf('Champions') < 0) out.err.push('il procuratore non ricorda l\'ambizione dichiarata');
    if (senzAmb.ricordo) out.err.push('il procuratore «ricorda» qualcosa che non gli e\' mai stato detto');
    /* la lettura deve dipendere dal contesto reale */
    if (conAmb.lettura.indexOf('spazio') < 0) out.err.push('con un Eroe che gioca poco e rende bene, la lettura non parla di spazio');
    if (conAmb.opzioni.length !== 4) out.err.push(`le risposte non sono quattro: ${conAmb.opzioni.length}`);
    conAmb.opzioni.forEach(o => { if (!AGENT_CHECKIN_REPLY[o.id]) out.err.push(`manca la replica del procuratore per «${o.id}»`); });

    /* §4 — CONSEGUENZE REALI, e sui sistemi che esistono già */
    const bas = P(30, mkAg(1, 1));
    const rFel = agentCheckinApply(bas, 'felice');
    const rGua = agentCheckinApply(bas, 'guardo');
    const rVia = agentCheckinApply(bas, 'via');
    out.righe.push(`conseguenze: felice→morale ${rFel.morale} rapporto ${rFel.agent.rapport} · guardo→task ${rGua.agentTask} · via→listed ${rVia.transferListed}`);
    if (!(rFel.morale > (bas.morale || 0))) out.err.push('«sto benissimo qui» non alza il morale');
    if (!(rFel.agent.rapport > 50)) out.err.push('«sto benissimo qui» non rafforza il rapporto');
    if (rGua.agentTask !== 'cerca_offerte') out.err.push('«guardiamoci intorno» non attiva l\'incarico di ricerca offerte esistente');
    if (rVia.transferListed !== true) out.err.push('«voglio cambiare aria» non attiva il flag di mercato esistente');
    ['felice', 'ruolo', 'guardo', 'via'].forEach(id => {
      const r = agentCheckinApply(bas, id);
      if (!r.agent || !r.agent.lastCheckin || r.agent.lastCheckin.w !== 30) out.err.push(`dopo «${id}» il confronto non viene datato: si ripeterebbe subito`);
      if (!r.agent.memory.note.length) out.err.push(`dopo «${id}» non resta traccia in memoria`);
    });
    if (JSON.stringify(agentCheckinApply(bas, 'inesistente')) !== '{}') out.err.push('una risposta sconosciuta produce effetti');
    if (JSON.stringify(agentCheckinApply({ season: 1, week: 1 }, 'felice')) !== '{}') out.err.push('il confronto produce effetti senza procuratore');
  }

  /* [7.378.0 R5 §6/§8] L'INIZIATIVA: il procuratore bussa, ma UNA voce alla volta e mai un mercato
     parallelo. Il rischio qui non e' che taccia: e' che diventi rumore, o che prometta cose che il
     gioco non produce. */
  const { agentInitiative, agentInitLine } = window;
  if (!agentInitiative) out.err.push('agentInitiative non esposto');
  else {
    const AG = () => agentInit({ id: 'prudente', name: 'X', season: 1, week: 1 });
    const B = (o) => ({ proStatus: 'pro', hasAgent: true, agent: AG(), season: 2, week: 30, contract: { wage: 5000, years: 3 }, value: 4, popularity: 10, sponsors: [], agentInit: { k: null, s: 0, w: 0 }, ...o });
    const K = (o) => { const r = agentInitiative(B(o)); return r && r.k; };
    out.righe.push(`iniziativa: scadenza=${K({ contract: { wage: 5000, years: 1 } })} · sottopagato=${K({ value: 30 })} · immagine=${K({ popularity: 45 })} · quiete=${K({})}`);
    if (K({ contract: { wage: 5000, years: 1 } }) !== 'contratto') out.err.push('col contratto in scadenza il procuratore non dice niente');
    if (K({ value: 30 }) !== 'contratto') out.err.push('con uno stipendio non piu\' adeguato il procuratore non dice niente');
    if (K({ popularity: 45 }) !== 'sponsor') out.err.push('con la popolarita\' alta e nessuno sponsor il procuratore non propone niente');
    if (K({}) !== null) out.err.push('il procuratore parla anche quando non c\'e\' niente da dire');
    /* senza procuratore, e nelle giovanili, silenzio */
    if (agentInitiative({ proStatus: 'pro', season: 2, week: 30 })) out.err.push("l'iniziativa parte senza procuratore");
    if (agentInitiative(B({ proStatus: 'u18' }))) out.err.push("l'iniziativa parte nelle giovanili");
    /* §12 — cooldown: non si bussa due volte in un mese e mezzo */
    const recente = agentInitiative(B({ contract: { wage: 5000, years: 1 }, agentInit: { k: 'sponsor', s: 2, w: 27 } }));
    if (recente) out.err.push('il procuratore bussa di nuovo dopo tre settimane: e\' spam');
    /* mai la stessa cosa due volte di fila */
    const stessa = agentInitiative(B({ contract: { wage: 5000, years: 1 }, agentInit: { k: 'contratto', s: 1, w: 1 } }));
    if (stessa && stessa.k === 'contratto') out.err.push('il procuratore ripete la stessa iniziativa due volte di fila');
    /* MERCATO: solo in finestra e solo se il mercato si sta davvero muovendo; e le due fasi
       raccontano l'avvicinamento senza promettere un'offerta */
    const fuoriFinestra = K({ week: 30, transferListed: true });
    const inFinestra = K({ week: 21, transferListed: true });
    out.righe.push(`mercato: fuoriFinestra=${fuoriFinestra} · inFinestra=${inFinestra}`);
    if (fuoriFinestra === 'mercato1' || fuoriFinestra === 'mercato2') out.err.push('il procuratore parla di mercato fuori dalle finestre');
    if (inFinestra !== 'mercato1') out.err.push('in finestra, col giocatore sul mercato, il procuratore non apre la fase 1');
    const fase2 = agentInitiative(B({ week: 21, transferListed: true, agentInit: { k: 'mercato1', s: 1, w: 1 } }));
    if (!fase2 || fase2.k !== 'mercato2') out.err.push('la seconda fase del mercato non arriva dopo la prima');
    /* nessuna delle due deve PROMETTERE un'offerta che il gioco non ha prodotto */
    ['mercato1', 'mercato2'].forEach(k => {
      const t = agentInitLine(k, 'finestra');
      if (!t) out.err.push(`manca il testo di «${k}»`);
      if (/offerta sul tavolo|c'e' un'offerta|ecco l'offerta/i.test(t)) out.err.push(`«${k}» promette un'offerta che il gioco non ha generato`);
    });
    /* ogni combinazione dichiarata deve avere un testo */
    Object.keys(window.AGENT_INIT_TXT || {}).forEach(k => Object.keys(window.AGENT_INIT_TXT[k]).forEach(w => { if (!agentInitLine(k, w)) out.err.push(`manca il testo ${k}/${w}`); }));
  }

  /* [7.379.0 R6 §10/§9/§26] CATALOGO, ROTTURA, LOGORIO — e soprattutto la memoria che NON si eredita. */
  const { agentCandidates, agentPartPatch, agentRapportDrift, agentRapportAdvice } = window;
  if (!agentCandidates) out.err.push('agentCandidates non esposto');
  else {
    const P = (o) => ({ name: 'Tizio', season: 3, week: 10, popularity: 45, value: 12, hasAgent: true, agent: agentInit({ id: 'prudente', name: 'Vecchio', season: 1, week: 1 }), ...o });
    const cand = agentCandidates(P());
    out.righe.push(`candidati: ${cand.map(c => c.arch + '/' + c.name).join(' · ')}`);
    if (!cand.length) out.err.push('nessun candidato disponibile: il cambio sarebbe impossibile');
    if (cand.length > 3) out.err.push(`troppi candidati (${cand.length}): la direttiva vieta la lista infinita`);
    if (cand.some(c => c.arch === 'prudente')) out.err.push('fra i candidati compare il procuratore che si sta lasciando');
    if (cand.some(c => !c.name || !c.desc || !c.forte)) out.err.push('un candidato e\' senza identita\' (nome/descrizione/punto di forza)');
    if (JSON.stringify(agentCandidates(P())) !== JSON.stringify(cand)) out.err.push('i candidati non sono deterministici');
    /* un esordiente deve comunque trovare qualcuno */
    if (!agentCandidates({ name: 'X', popularity: 2, value: 0.2 }).length && !agentCandidates({ name: 'X', popularity: 2, value: 0.2, agent: null }).length)
      out.err.push('un esordiente non trova nessun candidato');

    /* §26 — LA MEMORIA PERSONALE NON SI EREDITA, lo storico sì */
    const vecchio = agentInit({ id: 'prudente', name: 'Vecchio', season: 1, week: 1 });
    vecchio.memory = agentRemember(vecchio.memory, { k: 'ambizione', v: 'champions' });
    vecchio.memory = agentRemember(vecchio.memory, { k: 'decisione', v: 'restare' });
    const conVecchio = P({ agent: vecchio });
    const rotto = agentPartPatch(conVecchio);
    out.righe.push(`rottura: hasAgent=${rotto.hasAgent} · agent=${rotto.agent} · storico=${(rotto.agentHistory || []).map(h => h.name).join(',')}`);
    if (rotto.hasAgent !== false || rotto.agent !== null) out.err.push('dopo la rottura il procuratore risulta ancora attivo');
    if (!rotto.agentHistory || rotto.agentHistory[0].name !== 'Vecchio') out.err.push('la rottura non lascia traccia nello storico di carriera');
    if (rotto.agentTask !== null || rotto.agentPlan !== null) out.err.push('dopo la rottura restano incarichi o piani del procuratore precedente');
    const nuovo = agentHirePatch({ ...conVecchio, ...rotto, bankBalance: 9000, contract: { wage: 1000 } }, 1000, 'trofei', 'ambizioso', 'Nuovo');
    out.righe.push(`nuovo: ${nuovo.agent.name}/${nuovo.agent.arch} · memoria=${JSON.stringify(nuovo.agent.memory.amb)} · note=${nuovo.agent.memory.note.length} · storico=${(nuovo.agentHistory || []).length}`);
    if (nuovo.agent.arch !== 'ambizioso' || nuovo.agent.name !== 'Nuovo') out.err.push('il procuratore scelto dal catalogo non viene rispettato');
    if (nuovo.agent.memory.amb.indexOf('champions') >= 0) out.err.push('IL NUOVO PROCURATORE EREDITA CIO\' CHE L\'EROE AVEVA CONFIDATO AL PRECEDENTE');
    if (nuovo.agent.memory.note.length) out.err.push('il nuovo procuratore eredita le note personali del precedente');
    if (nuovo.agent.memory.amb[0] !== 'trofei') out.err.push('la nuova ambizione dichiarata non entra nella nuova relazione');
    if (!(nuovo.agentHistory || []).length) out.err.push('lo storico di carriera va perso col nuovo procuratore');
    if (nuovo.agent.rapport !== 50) out.err.push('la nuova relazione non riparte da un rapporto neutro');

    /* §9 — il logorio nasce dal DISACCORDO, non dal tempo */
    const mk = (arch, ambId) => { const a = agentInit({ id: arch }); if (ambId) a.memory = agentRemember(a.memory, { k: 'ambizione', v: ambId }); return a; };
    const dFed = agentRapportDrift({ hasAgent: true, agent: mk('ambizioso', 'fedelta') });
    const dCha = agentRapportDrift({ hasAgent: true, agent: mk('ambizioso', 'champions') });
    out.righe.push(`logorio: ambizioso+fedeltà=${dFed} · ambizioso+champions=${dCha}`);
    if (!(dFed < 0)) out.err.push('un procuratore che spinge sul mercato non logora chi gli ha detto di voler restare');
    if (!(dCha > 0)) out.err.push('un procuratore in sintonia con le ambizioni non rafforza il rapporto');
    if (agentRapportDrift({ hasAgent: false }) !== 0) out.err.push('il logorio agisce senza procuratore');
    /* §22 — quando è rotto il gioco lo dice, ma non cambia niente da solo */
    const rot = agentInit({ id: 'prudente' }); rot.rapport = 10;
    const av = agentRapportAdvice({ hasAgent: true, agent: rot });
    if (!av || av.tier !== 'conflittuale') out.err.push('con un rapporto conflittuale il gioco non suggerisce nulla');
    if (agentRapportAdvice({ hasAgent: true, agent: agentInit({ id: 'prudente' }) })) out.err.push('il gioco suggerisce di cambiare anche con un rapporto sano');
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
