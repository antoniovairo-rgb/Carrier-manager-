#!/usr/bin/env node
/* [giro 211 · PO-473] GUARDIANO interviste-211 — «dopo una SCONFITTA con ELIMINAZIONE agli ottavi di coppa europea, in
   conferenza stampa: "Serata europea. Che sensazione dà giocare in questo palcoscenico?" con risposte celebrative».
   Sul gioco vero (?cpmtest=1), funzioni pure del dopo-partita (intervista183, poolPost183, IV_FATTI183, INTERVIEW_QS):
   1. CATALOGO: tutte le domande del dopo-partita, contate per presupposto dichiarato (neutre · vittoria · pareggio · sconfitta ·
      esito del turno).
   2. PARTITE SIMULATE PER CASO (N stagioni da 30 partite, memoria della stagione vera, seme fisso): campionato, coppa nazionale,
      coppa europea (girone e KO), Europeo/Mondiale (girone e KO), finale della Coppa delle Nazioni, amichevole. Per ogni partita la
      sonda calcola DA SOLA risultato ed esito del turno (pareggio a eliminazione diretta = rigori, stessi semi del gioco) e un
      GIUDICE INDIPENDENTE (parole di domanda e risposte) dichiara incoerente: festa dopo una sconfitta o un'eliminazione,
      eliminazione dopo un passaggio del turno, «avanti»/«fino in fondo» dopo una finale vinta, turno inesistente in una partita
      senza eliminazione, punti e classifica fuori dal campionato, «un punto»/«pareggio» in un pareggio a eliminazione diretta,
      risultato dichiarato diverso da quello vero. Si giudica la domanda SCELTA e tutte le domande che POTEVANO uscire.
   3. COPERTURA: per Europa, coppa nazionale e Nazionale, ogni esito (eliminato, eliminato ai rigori, passa, passa ai rigori,
      campione, finale persa) ha una domanda che ne parla, a memoria vuota; il caso del PO (ottavi europei, 0-0, fuori ai rigori)
      non riceve la «Serata europea».
   Verde: 0 incoerenze scelte · 0 incoerenze possibili · copertura piena. «Non giudicato» = rosso (meno partite del previsto,
   una classe di partita mai vista, funzioni assenti).
   Rosso: CPM_ROSSO211=1 accende window.__CPM_NO_G211 → DEVE uscire 1.
   4. [giro 222 · PO-479] ULTIMA GIORNATA DEL GIRONE e RILANCIO: coppa europea (girone da 6, gioco vero: euroGroupKOPatch/euroGroupTable
      dicono chi esce) ed Europeo/Mondiale (girone da 3, regola dei 4 punti) — l'ultima partita che ELIMINA (sconfitta e pareggio) deve
      ricevere una domanda d'eliminazione (mai «il girone è ancora aperto», mai «rigori»), e nessuna domanda possibile deve presupporre il
      girone aperto o i rigori; quella che QUALIFICA resta com'era (nessuna domanda d'eliminazione). Poi il RILANCIO (seconda domanda) dopo
      ogni eliminazione di questi casi e dopo l'eliminazione europea agli ottavi del PO: su 300 semi per tono, nessun rilancio che parla di
      punti/classifica o dei «prossimi avversari». Infine, statico sul file di gioco: il pannello del dopo-partita porta l'esito (esito222) e
      il rilancio lo riceve. Rosso: CPM_ROSSO222=1 accende window.__CPM_NO_G222 → DEVE uscire 1.
   Uso: cd tests/visual && node interviste-211.mjs   (CPM_STAGIONI211=<n>, di serie 120) */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO211 === '1', ROSSO222 = process.env.CPM_ROSSO222 === '1';
const STAGIONI = +(process.env.CPM_STAGIONI211 || 120);
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errors = [];
let esito = null;
try {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([rosso, r222]) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G211 = 1; if (r222) window.__CPM_NO_G222 = 1; }, [ROSSO, ROSSO222]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof intervista183 === 'function' && typeof koShootoutWin === 'function', null, { timeout: 60000 });
  esito = await page.evaluate(({ STAGIONI, ROSSO }) => {
    const out = { funzioni: typeof poolPost183 === 'function' };
    /* ---------- il GIUDICE indipendente ---------- */
    const testo = q => String(q.q || '') + ' ' + (q.a || []).map(x => x && x.txt).join(' ');
    const dichRis = q => { const r = (!ROSSO && q.r211) || q.r; if (r) return r; const c = (q.ctx || []).filter(x => x === 'win' || x === 'draw' || x === 'loss'); return c.length ? c : null; };
    const FESTA = /palcoscenico|è qui che voglio stare|un onore per tutto il club|avanti in |fino in fondo|vogliamo alzarla|serate così vanno ricordate|credo di esserci riuscito|volevo dimostrare chi è il più forte|mi riusciva tutto|è vostra|campioni con|passa il turno|decisi i rigori/i;
    const FUORI = /fuori dall|eliminat|esce dal torneo|finisce qui|fuori ai rigori|finale[^.?]*persa|cosa è mancato per passare|si è fatta in salita/i;
    const TURNO = /fuori dall|finisce qui|passa il turno|avanti in (europa|coppa)|rigori|alzat|è vostra|campioni con|finale[^.?]*persa|esce dal torneo/i;
    const PUNTI = /tre punti|un punto|i punti\b|punti pesant|classifica|retroced|zona calda|zona europea|in campionato/i;
    const PARI = /\bpunt[oi]\b|pareggi|il pari\b|gol del pari/i;
    function giudica(q, k) {
      const r = dichRis(q); if (r && r.indexOf(k.res) < 0) return 'risultato dichiarato ' + r.join('/') + ' su ' + k.res;
      const T = testo(q), Q = String(q.q || '');
      if (k.res === 'loss' && /credo di esserci riuscito|volevo dimostrare chi è il più forte|serate così vanno ricordate|mi riusciva tutto|è qui che voglio stare|un onore per tutto il club/i.test(T)) return 'festa dopo una sconfitta';
      if ((k.turno === 'eliminato' || k.turno === 'finale_persa') && FESTA.test(T)) return 'festa dopo l\'eliminazione';
      if (k.turno === 'passa' && FUORI.test(Q)) return 'eliminazione dopo il passaggio del turno';
      /* «fuori» da solo non basta: «fuori dal gioco» (voto basso) non e' un'eliminazione */
      if (k.turno === 'campione' && /avanti in |fino in fondo|prossimo avversario|un turno alla volta|passa il turno|fuori dall'europa|fuori ai rigori|esce dal torneo|eliminat|finale[^.?]*persa/i.test(Q)) return 'turno successivo dopo la finale vinta';
      if (k.turno === 'nessuno' && TURNO.test(Q)) return 'esito di un turno che non c\'è';
      if (!k.lega && PUNTI.test(T)) return 'punti o classifica fuori dal campionato';
      if (k.ko && k.res === 'draw' && PARI.test(Q)) return 'pareggio a eliminazione diretta (decidono i rigori)';
      return null;
    }
    /* ---------- 1. catalogo ---------- */
    const tutte = [...IV_FATTI183.filter(q => !(ROSSO && q.g211)), ...INTERVIEW_QS.filter(q => (q.ctx || []).some(c => c === 'win' || c === 'draw' || c === 'loss'))];
    const cat = { totale: tutte.length, neutre: 0, vittoria: 0, pareggio: 0, sconfitta: 0, piuRisultati: 0, esito: 0, fatti: IV_FATTI183.filter(q => !(ROSSO && q.g211)).length };
    for (const q of tutte) { const r = dichRis(q); if (!r) cat.neutre++; else if (r.length > 1) cat.piuRisultati++; else cat[{ win: 'vittoria', draw: 'pareggio', loss: 'sconfitta' }[r[0]]]++; if (!ROSSO && q.e211) cat.esito++; }
    out.cat = cat;
    /* ---------- 2. partite simulate per caso ---------- */
    let s = 211;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const sc = a => a[Math.floor(rnd() * a.length)];
    const POSTE = [null, null, null, '🔥 Derby', '🔙 Ex club', '⚔️ Il tuo rivale', '🏆 Scontro al vertice', '🏆 Corsa al titolo', '🆘 Lotta salvezza', '📊 Scontro diretto in classifica', '🏁 Finale di stagione', '🎖️ 100ª presenza in carriera', '🎯 A un gol dai 50 in carriera', "🩹 Primo match dopo l'infortunio", '📋 Contratto in bilico'];
    const CONTESTI = ['career', 'career', 'career', 'cup', 'cup', 'euro_group', 'euro_ko', 'euro_ko', 'euroMondiale_group', 'euroMondiale_ko', 'nationsCup', 'national'];
    const stat = {}; const incScelte = [], incPossibili = new Map(); let partite = 0, conDomanda = 0;
    const classe = k => k.ko ? ({ eliminato: 'eliminazione', passa: 'passaggio del turno', campione: 'finale vinta', finale_persa: 'finale persa' })[k.turno] + (k.res === 'draw' ? ' ai rigori' : '') : ({ win: 'vittoria', draw: 'pareggio', loss: 'sconfitta' })[k.res] + (k.lega ? '' : ' (coppa/Europa/Nazionale)');
    for (let st = 0; st < STAGIONI; st++) {
      let p = { name: 'Collaudo ' + (st % 7), season: 1 + st, proStatus: rnd() < 0.2 ? 'u18' : 'pro', ovr: 55 + Math.floor(rnd() * 35), morale: 30 + Math.floor(rnd() * 60), form: 40 + Math.floor(rnd() * 50),
        club: { id: 'prova', n: 'FC Prova', lg: 'Lega A' }, standings: [], matchHistory: [], history: [], age: 18 + Math.floor(rnd() * 14), coachTrust: 60, popularity: 40 };
      for (let w = 1; w <= 30; w++) {
        const c = sc(CONTESTI); const ph = sc(['r16', 'quarti', 'sf', 'final']); const emPh = sc(['r16', 'quarti', 'semi', 'final']); const rd = 1 + Math.floor(rnd() * 4);
        const gf = Math.floor(rnd() * 4), ga = Math.floor(rnd() * 4); const isHome = rnd() < 0.5;
        const ncFin = rnd() < 0.6;
        p = { ...p, week: w, calendar: [{ week: w, type: c === 'euro_ko' ? 'euro' : c === 'cup' ? 'cup' : 'league', euroPhase: ph, played: false, matchday: w }], euro: { phase: ph, competition: 'UCL' },
          cup: { active: true, eliminated: false, round: rd }, euroMondiale: { koPhase: emPh, type: 'Europeo' }, nationsCupQueue: { isFinal: ncFin, matchIdx: 2, opponents: [1, 2, 3] } };
        const g = Math.min(gf, rnd() < 0.5 ? 0 : Math.floor(rnd() * 4));
        const r = { context: c, won: gf > ga, drew: gf === ga, homeScore: isHome ? gf : ga, awayScore: isHome ? ga : gf, isHome, goals: g, assists: rnd() < 0.3 ? 1 : 0,
          rating: +(4.5 + rnd() * 4.5).toFixed(1), wasBehind: rnd() < 0.2, sentOff: rnd() < 0.04, opponent: 'Avversario ' + w };
        /* la sonda calcola DA SOLA l'esito del turno (stessi semi della risoluzione del gioco) */
        const sn = p.season; let seme = null, fin = false;
        if (c === 'euro_ko') { seme = 'euroko|' + sn + '|' + ph; fin = ph === 'final'; }
        else if (c === 'cup') { seme = 'cupko|' + sn + '|' + rd; fin = rd >= 4; }
        else if (c === 'euroMondiale_ko') { seme = 'natko|' + sn + '|' + emPh; fin = emPh === 'final'; }
        else if (c === 'nationsCup' && ncFin) { seme = 'natcup|' + sn + '|final'; fin = true; }
        const res = r.won ? 'win' : r.drew ? 'draw' : 'loss';
        let k;
        if (seme) { const passa = r.won || (r.drew && koShootoutWin(p, seme)); k = { ko: true, res, lega: false, turno: passa ? (fin ? 'campione' : 'passa') : (fin ? 'finale_persa' : 'eliminato') }; }
        else k = { ko: false, res, lega: c === 'career', turno: 'nessuno' };
        const cl = classe(k); stat[cl] = stat[cl] || { partite: 0, conDomanda: 0, scelteIncoerenti: 0, possibiliIncoerenti: 0 }; stat[cl].partite++; partite++;
        /* la domanda SCELTA: decisione vera (intervista183) fuori dal campionato, scelta vera con una posta qualunque in campionato */
        let q = null;
        if (c === 'career') { const posta = sc(POSTE); q = posta ? scegliPost183(p, r, posta) : null; var postaUsata = posta; }
        else { const d = intervista183(p, { type: c === 'cup' ? 'cup' : c, opponentName: r.opponent }, r); q = d && d.si ? d.q : null; postaUsata = c === 'cup' ? (typeof posta165 === 'function' ? posta165(p, { type: 'cup', opponentName: r.opponent }) : null) : /^(national|nationsCup|euroMondiale)/.test(c) ? '🏳️ Nazionale' : '🌍 Coppa europea'; }
        if (q) { conDomanda++; stat[cl].conDomanda++; const g1 = giudica(q, k); if (g1) { stat[cl].scelteIncoerenti++; if (incScelte.length < 12) incScelte.push(cl + ' · «' + q.q + '» → ' + g1); }
          p = memIv183(p, q); }
        /* tutte quelle che POTEVANO uscire (tutti i livelli, memoria compresa) */
        if (typeof poolPost183 === 'function') { const pp = poolPost183(p, r, postaUsata); for (const x of [...pp.tierA, ...pp.tierB, ...pp.tierC]) { const g2 = giudica(x, k); if (g2) { stat[cl].possibiliIncoerenti++; const key = x.q + ' → ' + g2; incPossibili.set(cl + ' · «' + key, (incPossibili.get(cl + ' · «' + key) || 0) + 1); } } }
      }
    }
    out.partite = partite; out.conDomanda = conDomanda; out.stat = stat; out.incScelte = incScelte;
    out.incPossibili = [...incPossibili.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => k + ' (' + n + ')'); out.nIncPossibili = incPossibili.size;
    /* ---------- 3. copertura, a memoria vuota ---------- */
    const cop = [];
    const SPEC = { eliminato: /fuori|eliminat|esce dal torneo|finisce qui|mancato|salita/i, passa: /avanti|passa il turno|rigori/i, campione: /è vostra|campioni|trofeo|alzat/i, finale_persa: /finale[^.?]*persa|fuori ai rigori/i };
    const casi = [];
    for (const comp of ['euro_ko', 'cup', 'euroMondiale_ko']) for (const [turno, ris, fin] of [['eliminato', 'loss', false], ['eliminato', 'draw', false], ['passa', 'win', false], ['passa', 'draw', false], ['campione', 'win', true], ['campione', 'draw', true], ['finale_persa', 'loss', true], ['finale_persa', 'draw', true]]) casi.push({ comp, turno, ris, fin });
    for (const k of casi) {
      let trovato = null;
      for (let t = 0; t < 400 && !trovato; t++) {   /* per un pareggio si cerca la stagione in cui i rigori danno l'esito voluto (stessi semi del gioco) */
        const ph = k.fin ? 'final' : 'r16', emPh = k.fin ? 'final' : 'r16', rd = k.fin ? 4 : 1, sn = 1 + t;
        const p = { name: 'Collaudo Esito', season: sn, week: 20, proStatus: 'pro', ovr: 70, morale: 60, club: { id: 'prova', n: 'FC Prova', lg: 'Lega A' }, standings: [], matchHistory: [], history: [],
          calendar: [{ week: 20, type: k.comp === 'euro_ko' ? 'euro' : k.comp === 'cup' ? 'cup' : 'league', euroPhase: ph, played: false }], euro: { phase: ph, competition: 'UCL' }, cup: { active: true, eliminated: false, round: rd }, euroMondiale: { koPhase: emPh, type: 'Mondiale' } };
        const seme = k.comp === 'euro_ko' ? 'euroko|' + sn + '|' + ph : k.comp === 'cup' ? 'cupko|' + sn + '|' + rd : 'natko|' + sn + '|' + emPh;
        if (k.ris === 'draw' && koShootoutWin(p, seme) !== (k.turno === 'passa' || k.turno === 'campione')) continue;
        const r = { context: k.comp, won: k.ris === 'win', drew: k.ris === 'draw', homeScore: k.ris === 'win' ? 2 : k.ris === 'draw' ? 0 : 0, awayScore: k.ris === 'loss' ? 1 : 0, isHome: true, goals: 0, assists: 0, rating: 6.2, opponent: 'FC Valdenau' };
        const d = intervista183(p, { type: k.comp === 'cup' ? 'cup' : k.comp, opponentName: r.opponent }, r);
        trovato = { d, kk: { ko: true, res: k.ris, lega: false, turno: k.turno } };
      }
      const nome = { euro_ko: 'Europa', cup: 'coppa nazionale', euroMondiale_ko: 'Nazionale' }[k.comp] + ' · ' + k.turno + (k.ris === 'draw' ? ' ai rigori' : '');
      if (!trovato) { cop.push({ nome, ok: false, msg: 'caso non costruito' }); continue; }
      const q = trovato.d && trovato.d.si ? trovato.d.q : null;
      const g = q ? giudica(q, trovato.kk) : 'nessuna domanda';
      cop.push({ nome, ok: !!q && !g && SPEC[k.turno].test(q.q), msg: q ? '«' + q.q + '»' + (g ? ' → ' + g : SPEC[k.turno].test(q.q) ? '' : ' → non parla dell\'esito') : 'nessuna intervista (' + (trovato.d && trovato.d.motivo) + ')' });
    }
    out.cop = cop;
    /* ---------- 4. [giro 222] ultima giornata del girone e rilancio ---------- */
    const gir = [];
    const club = { id: 'prova', n: 'FC Prova', a: 'PRV', lg: 'Lega A', p: 70 };
    const opps = [{ id: 'g1', n: 'FC Valdenau', a: 'VAL', p: 75 }, { id: 'g2', n: 'Sporting Orvalle', a: 'ORV', p: 74 }, { id: 'g3', n: 'Real Montebranco', a: 'MON', p: 73 }];
    const APERTO = /girone è ancora aperto|ripartiamo dalla prossima/i;
    const casoEuro = (prima, ris) => { /* prima = esito delle 5 gare precedenti (W/D/L), ris = l'ultima */
      const cal = [], gr = []; let pts = 0;
      for (let i = 0; i < 5; i++) { const x = prima[i]; const hs = x === 'W' ? 2 : x === 'D' ? 1 : 0, as = x === 'L' ? 2 : x === 'D' ? 1 : 0; pts += x === 'W' ? 3 : x === 'D' ? 1 : 0;
        cal.push({ matchday: 900 + i, week: 3 + i * 2, type: 'euro_group', opponentName: opps[i % 3].n, played: true, isHome: i % 2 === 0 }); gr.push({ opp: opps[i % 3].n, home: i % 2 === 0, won: x === 'W', drew: x === 'D', hs, as }); }
      cal.push({ matchday: 905, week: 14, type: 'euro_group', opponentName: opps[2].n, played: false, isHome: false });
      const p = { name: 'Collaudo Girone', season: 3, week: 14, proStatus: 'pro', ovr: 72, morale: 60, club, standings: [], matchHistory: [], history: [], calendar: cal,
        euro: { active: true, phase: 'group', competition: 'UCL', groupOpponents: opps, groupResults: gr, pts } };
      const r = { context: 'euro_group', won: ris === 'W', drew: ris === 'D', homeScore: ris === 'W' ? 2 : ris === 'D' ? 1 : 0, awayScore: ris === 'L' ? 2 : ris === 'D' ? 1 : 0, isHome: false, goals: 0, assists: 0, rating: 6.1, opponent: opps[2].n };
      /* chi esce lo dice la classifica del GIOCO, sul girone completo (la stessa della risoluzione) */
      const full = { ...p.euro, groupResults: [...gr, { opp: r.opponent, home: false, won: r.won, drew: r.drew, hs: r.homeScore, as: r.awayScore }], pts: pts + (r.won ? 3 : r.drew ? 1 : 0) };
      const t = euroGroupTable(full, club); const pos = t.findIndex(x => x.isPlayer);
      return { p, r, fuori: pos > 1, nome: 'coppa europea · girone ' + prima + '+' + ris + ' (posto ' + (pos + 1) + ')' };
    };
    const casoNaz = (pts0, ris) => {
      const p = { name: 'Collaudo Girone', season: 3, week: 25, proStatus: 'pro', ovr: 72, morale: 60, nation: 'Italia', club, standings: [], matchHistory: [], history: [], calendar: [],
        euroMondiale: { type: 'Europeo', phase: 'group', groupOpponents: ['Valdenia', 'Orvalia', 'Montebria'], groupMatchIdx: 2, groupPts: pts0, groupMatches: [] } };
      const r = { context: 'euroMondiale_group', won: ris === 'W', drew: ris === 'D', homeScore: ris === 'W' ? 2 : ris === 'D' ? 1 : 0, awayScore: ris === 'L' ? 2 : ris === 'D' ? 1 : 0, isHome: true, goals: 0, assists: 0, rating: 6.1, opponent: 'Montebria' };
      return { p, r, fuori: pts0 + (r.won ? 3 : r.drew ? 1 : 0) < 4, nome: 'Europeo · girone ' + pts0 + ' pt + ' + ris };
    };
    const casiG = [casoEuro('LLLLL', 'L'), casoEuro('LLLLL', 'D'), casoEuro('DLLLL', 'L'), casoEuro('WWWWW', 'W'), casoNaz(0, 'L'), casoNaz(1, 'D'), casoNaz(0, 'D'), casoNaz(6, 'W')];
    for (const c of casiG) {
      const res = c.r.won ? 'win' : c.r.drew ? 'draw' : 'loss';
      const k = { ko: false, res, lega: false, turno: c.fuori ? 'eliminato' : 'nessuno', girone: true };
      const d = intervista183(c.p, { type: c.r.context === 'euro_group' ? 'euro_group' : c.r.context, opponentName: c.r.opponent }, c.r);
      const q = d && d.si ? d.q : null;
      const mali = [];
      if (!q) mali.push('nessuna intervista (' + (d && d.motivo) + ')');
      else { const g = giudica(q, k); if (g) mali.push(g); const T = testo(q);
        if (c.fuori && !SPEC.eliminato.test(q.q)) mali.push('non parla dell\'eliminazione');
        if (c.fuori && APERTO.test(T)) mali.push('«il girone è ancora aperto» dopo l\'eliminazione');
        if (/rigori/i.test(q.q)) mali.push('rigori in un girone');
        if (!c.fuori && FUORI.test(q.q)) mali.push('eliminazione dopo una qualificazione'); }
      /* tutte le domande possibili */
      const pp = poolPost183(c.p, c.r, c.r.context === 'euro_group' ? '🌍 Coppa europea' : '🏳️ Nazionale');
      for (const x of [...pp.tierA, ...pp.tierB, ...pp.tierC]) { const T = testo(x); if (c.fuori && (APERTO.test(T) || FESTA.test(T))) mali.push('possibile: «' + x.q + '»'); if (/rigori/i.test(x.q) && c.fuori) mali.push('possibile con i rigori: «' + x.q + '»'); }
      /* il rilancio dopo questa domanda: 300 semi per tono, con l'esito che il gioco passa al pannello */
      if (c.fuori) { const es = esitoTurno211(c.p, c.r); const vis = new Set();
        for (const tone of ['diretto', 'diplomatico', 'umile']) for (let i = 0; i < 300; i++) { const rl = rilancio24(tone, (q ? q.q : '') + '|' + i, es); vis.add(rl.q);
          const T = rl.q + ' ' + rl.a.map(x => x && x.txt).join(' '); if (PUNTI.test(T)) mali.push('rilancio con punti/classifica: «' + rl.q + '»'); if (/prossimi avversari/i.test(rl.q)) mali.push('rilancio sui prossimi avversari: «' + rl.q + '»'); }
        c.rilanci = vis.size; }
      gir.push({ nome: c.nome + (c.fuori ? ' → FUORI' : ' → qualificato'), ok: !mali.length, msg: (q ? '«' + q.q + '»' : '—') + (c.rilanci ? ' · rilanci possibili ' + c.rilanci : '') + (mali.length ? ' → ' + [...new Set(mali)].slice(0, 4).join(' · ') : '') });
    }
    /* il caso del PO di PO-473 (ottavi europei, fuori) e il rilancio */
    { const p = { name: 'Collaudo Esito', season: 2, week: 20, proStatus: 'pro', ovr: 70, morale: 60, club, standings: [], matchHistory: [], history: [], calendar: [{ week: 20, type: 'euro', euroPhase: 'r16', played: false }], euro: { phase: 'r16', competition: 'UCL' } };
      const r = { context: 'euro_ko', won: false, drew: false, homeScore: 0, awayScore: 1, isHome: true, goals: 0, assists: 0, rating: 6.0, opponent: 'FC Valdenau' };
      const es = esitoTurno211(p, r); const mali = []; const vis = new Set();
      for (const tone of ['diretto', 'diplomatico', 'umile']) for (let i = 0; i < 300; i++) { const rl = rilancio24(tone, 'po473|' + i, es); vis.add(rl.q); const T = rl.q + ' ' + rl.a.map(x => x && x.txt).join(' ');
        if (PUNTI.test(T)) mali.push('«' + rl.q + '»'); if (/prossimi avversari/i.test(rl.q)) mali.push('«' + rl.q + '»'); }
      gir.push({ nome: 'rilancio dopo l\'eliminazione agli ottavi europei (PO-473)', ok: !mali.length && es && es.turno === 'eliminato', msg: 'esito ' + (es && es.turno) + ' · rilanci possibili ' + vis.size + (mali.length ? ' → ' + [...new Set(mali)].join(' · ') : '') }); }
    /* il rilancio in campionato resta quello di prima (nessun filtro senza motivo): la classifica deve poter uscire */
    { const p = { name: 'Collaudo Lega', season: 2, week: 20, proStatus: 'pro', club, calendar: [] }; const r = { context: 'career', won: true, drew: false };
      const es = esitoTurno211(p, r); const vis = new Set(); for (let i = 0; i < 300; i++) vis.add(rilancio24('diplomatico', 'lega|' + i, es).q);
      gir.push({ nome: 'rilancio in campionato: la classifica resta possibile', ok: [...vis].some(x => /classifica/i.test(x)), msg: 'rilanci possibili ' + vis.size }); }
    out.gir = gir;
    return out;
  }, { STAGIONI, ROSSO });
} catch (e) { ok(false, 'non giudicato, eccezione: ' + String(e.message).slice(0, 300)); }
await browser.close(); srv.close();
if (esito) {
  const c = esito.cat;
  console.log(`1) catalogo del dopo-partita: ${c.totale} domande (${c.fatti} sui fatti) · neutre ${c.neutre} · vittoria ${c.vittoria} · pareggio ${c.pareggio} · sconfitta ${c.sconfitta} · piu' risultati ${c.piuRisultati} · con l'esito del turno ${c.esito}`);
  ok(esito.funzioni, 'funzione poolPost183 presente (si giudicano anche le domande possibili)');
  console.log(`2) ${esito.partite} partite simulate, ${esito.conDomanda} con la domanda`);
  for (const [cl, x] of Object.entries(esito.stat).sort()) console.log(`    ${cl.padEnd(46)} partite ${String(x.partite).padStart(4)} · con domanda ${String(x.conDomanda).padStart(4)} · scelte incoerenti ${String(x.scelteIncoerenti).padStart(3)} · possibili incoerenti ${x.possibiliIncoerenti}`);
  ok(esito.partite >= STAGIONI * 30 && esito.conDomanda >= esito.partite * 0.3, `partite giudicate ${esito.partite} (con domanda ${esito.conDomanda})`);
  const servono = ['vittoria', 'pareggio', 'sconfitta', 'eliminazione', 'eliminazione ai rigori', 'passaggio del turno', 'passaggio del turno ai rigori', 'finale vinta', 'finale persa'];
  const viste = servono.filter(x => esito.stat[x] && esito.stat[x].conDomanda > 0);
  ok(viste.length === servono.length, `ogni classe di partita vista con una domanda: ${viste.length}/${servono.length} (${servono.filter(x => !viste.includes(x)).join(', ') || 'tutte'})`);
  const sI = Object.values(esito.stat).reduce((a, x) => a + x.scelteIncoerenti, 0), pI = Object.values(esito.stat).reduce((a, x) => a + x.possibiliIncoerenti, 0);
  ok(sI === 0, `domande SCELTE incoerenti con risultato ed esito: ${sI}${sI ? '\n      ' + esito.incScelte.join('\n      ') : ''}`);
  ok(pI === 0, `domande POSSIBILI incoerenti: ${pI} (${esito.nIncPossibili} distinte)${pI ? '\n      ' + esito.incPossibili.join('\n      ') : ''}`);
  console.log('3) copertura degli esiti (memoria vuota)');
  for (const x of esito.cop) ok(x.ok, `${x.nome}: ${x.msg}`);
  console.log('4) [giro 222] ultima giornata del girone e rilancio');
  if (!esito.gir || esito.gir.length < 10) ok(false, `non giudicato: casi del girone ${esito.gir ? esito.gir.length : 0}/10`);
  for (const x of esito.gir || []) ok(x.ok, `${x.nome}: ${x.msg}`);
}
{ /* 5. statico: il pannello porta l'esito e il rilancio lo riceve (il percorso del CareerApp che la sonda non attraversa) */
  const fs = await import('node:fs'); const html = fs.readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
  ok(/esito222:\(\(\)=>\{try\{return\(typeof window!=='undefined'&&window\.__CPM_NO_G222\)\?null:esitoTurno211\(player,result\)/.test(html) && /\),_m\.esito222\)/.test(html), '5) il pannello del dopo-partita porta esito222 e il rilancio lo riceve (src/18)'); }
ok(errors.length === 0, `nessun errore di pagina (${errors.length}${errors.length ? ': ' + errors[0] : ''})`);
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G211] ' : ''}${ROSSO222 ? '[braccio ROSSO __CPM_NO_G222] ' : ''}interviste-211: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
