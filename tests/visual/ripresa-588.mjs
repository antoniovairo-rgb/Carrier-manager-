#!/usr/bin/env node
/* SONDA — DOPO UN GOL, LE SQUADRE TORNANO NELLE PROPRIE META'?
   COLLAUDO PO (appunti 7.584): «la ripresa del gioco dopo un gol e' disordinata, le squadre non tornano
   nelle meta' campo proprie».
   Nel calcio il calcio d'inizio ha una regola che si VEDE: ogni squadra sta nella sua meta', e solo due
   giocatori stanno nel cerchio. Se a schermo i ventidue restano sparsi dov'erano, la ripresa non si legge
   come una ripresa — e' quello che il PO descrive come «disordinata».
   COSA MISURA: durante la finestra di calcio d'inizio dichiarata dal gioco (`__CPM_HOLD().ko`), quanti
   giocatori stanno nella meta' campo SBAGLIATA. Il conteggio e' immune al frame rate: e' un numero di
   giocatori, non una frequenza. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const ROSSO = !!process.env.CPM_ROSSO;/* [7.588.0] prova del rosso: stessa sonda, rimedio spento */
const R591 = !!process.env.CPM_ROSSO591;
await page.addInitScript(([rosso, r591]) => {
  if(rosso){ window.__CPM_NO588 = true; window.__CPM_NO589 = true; window.__CPM_NO590 = true; }
  if(r591) window.__CPM_NO591 = true;/* [7.591.0] rosso SOLO della resa: la partita resta col rimedio, cosi' lo scarto mesh/modello isola il piano della resa *//* [7.589.0] il rosso spegne TUTTO il rimedio della ripresa: lo schieramento a ogni tick e l'autorita' unica sulla posizione */
  window.__CPM_GLB = false; window.__CPM_RIP = []; window.__CPM_KOC = {}; window.__CPM_RIP544 = [];/* [7.588.0] contatore gia' nel gioco (7.544): quante volte lo schieramento gira, e quante di quelle durante una ripresa */
  setInterval(() => { try {
    const h = window.__CPM_HOLD && window.__CPM_HOLD();
    let _breve = null, _rtick = null, _rms = null; try { const rb = window.__CPM_RIPBREVE && window.__CPM_RIPBREVE(); if (rb) { _breve = !!rb.breve; _rtick = rb.tick | 0; _rms = (rb.ms == null ? null : rb.ms | 0); } } catch (_e) {}
    /* [7.588.0] da quanto e' aperta la finestra: lo schieramento della ripresa scatta ogni tre tick di
       gioco, quindi «quanti sono fuori posto» dipende da QUANDO si guarda. Senza questo, la mediana mette
       insieme l'istante del fischio e un secondo dopo, che sono due cose diverse. */
    /* [7.589.0] I DUE CONTATORI SONO DIVERSI e finora ho guardato solo `ko`: si registrano entrambi. */
    if (h) { const k1 = !!h.ko, k2 = !!h.kick;
      const A = (window.__CPM_DUR = window.__CPM_DUR || { ko: [], kick: [], _ko: 0, _kick: 0 });
      if (k1) A._ko++; else { if (A._ko) A.ko.push(A._ko); A._ko = 0; }
      if (k2) A._kick++; else { if (A._kick) A.kick.push(A._kick); A._kick = 0; } }
    /* [7.590.0] si campiona anche DOPO la finestra breve (finche' un contatore della ripresa e' sopra
       zero): serve a vedere se il gioco RIPARTE davvero — con la finestra lunga i ventidue restavano
       pinnati nella propria meta' per mezzo minuto, e quello e' il difetto che sto correggendo. */
    /* [7.590.0] SI CAMPIONA LA RIPRESA VERA, cioe' i primi secondi. Misurato: la finestra dei contatori
       vive mediana 19,1 s e fino a 46,4 s — campionare tutta quella durata voleva dire chiamare «ripresa
       disordinata» mezzo minuto di gioco normale, dove i ventidue DEVONO essere sparsi. E' l'errore che
       ho commesso e riferito. Se il gioco non espone la finestra breve, si dichiara e non si giudica. */
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players) return;
    /* [7.591.0] LO SCARTO ANCHE FUORI DALLA RIPRESA: senza un termine di paragone «15 metri» non vuol
       dire niente. Se la mesh sta a 15 metri dal modello anche a gioco vivo, allora non e' un difetto
       della ripresa — e' come funziona il renderer, che il bersaglio se lo ricalcola sempre. */
    try { const MP0 = window.__CPM_MP && window.__CPM_MP();
      if (MP0 && st.players) { let sd = 0, sn = 0;
        for (let _j = 0; _j < st.players.length && _j < MP0.length; _j++) {
          const a = st.players[_j], b3 = MP0[_j];
          if (!a || !b3 || a.gk || a.x == null || b3.x == null) continue;
          if (String(a.team || '') !== String(b3.t || '')) continue;
          sd += Math.abs(a.x - b3.x); sn++; }
        if (sn) { const F = (window.__CPM_FUORI = window.__CPM_FUORI || { rip: [], vivo: [] });
          (_breve ? F.rip : F.vivo).push(sd / sn); } } } catch (_e) {}
    if (_breve === null) { window.__CPM_KOT = 0; return; }
    if (!_breve) { window.__CPM_KOT = 0; return; }
    const eta = (window.__CPM_KOT = (window.__CPM_KOT || 0) + 1);
    /* [7.589.0 — LE DUE SORGENTI, NELLO STESSO ISTANTE] `__CPM_STATE().players` legge le MESH del
       renderer, non il modello logico: e' scritto nella sua stessa definizione (`mesh.position` ->
       `w2g`). Finche' questa sonda leggeva una sorgente sola non poteva dire SE il difetto e' nella
       simulazione o nella resa — ed e' il bias che oggi mi ha gia' ingannato due volte. Ora conta i
       fuori posto in ENTRAMBE, allo stesso istante: se il logico e' schierato e la mesh no, il residuo
       e' del renderer e si corregge la' — non nella partita. */
    let logCasa = 0, logOsp = 0, logTot = 0, scartoX = null, scartoN = 0, disall = 0;
    try { const MP = window.__CPM_MP && window.__CPM_MP();
      if (MP) for (const q of MP) { if (!q || q.x == null) continue; logTot++;
        if (q.t === 'home' && q.x > 52) logCasa++; if (q.t === 'away' && q.x < 48) logOsp++; }
      /* [7.591.0] LO SCARTO IN METRI fra la mesh e il modello, giocatore per giocatore. Il conteggio
         «quanti sono fuori posto» ha una SOGLIA, e con una soglia due partite diverse ballano di un
         intero giocatore: e' cosi' che ho appena letto un peggioramento dove non e' detto che ci sia.
         Questa e' una misura continua e dice esattamente cio' che il rimedio deve fare — la resa segue
         il modello, o no. */
      if (MP && st.players) { let sd = 0, sn = 0;
        for (let _j = 0; _j < st.players.length && _j < MP.length; _j++) {
          const a = st.players[_j], b2 = MP[_j];
          if (!a || !b2 || a.gk || a.x == null || b2.x == null) continue;
          /* [7.591.0] PRIMA di credere allo scarto: le due sorgenti parlano dello STESSO giocatore?
             Uno scarto mediano di 13,8 metri su tutti e ventidue non somiglia a un ritardo, somiglia a un
             disallineamento di indici — e accoppiare per posizione nell'array e' esattamente il modo in
             cui uno strumento inventa un difetto. */
          if (String(a.team || '') !== String(b2.t || '')) { disall++; continue; }
          sd += Math.abs(a.x - b2.x); sn++; }
        if (sn) { scartoX = sd / sn; scartoN = sn; } } } catch (_e) {}
    const R = window.__CPM_RIP; if (R.length > 600) return;
    let casaFuori = 0, ospFuori = 0, tot = 0, cerchio = 0;
    /* [7.588.0] CHI sono quelli fuori posto, non solo quanti. Il codice PROVA a ripiegarli (7.544:
       bersaglio schiacciato a 46/54, guadagno 0,92) e cinque non ci arrivano: senza sapere il loro indice
       e se sono portieri, la causa resta indovinabile — ed e' esattamente il modo in cui oggi ho gia'
       sbagliato piu' volte. */
    const fuori = [];
    for (let _i = 0; _i < st.players.length; _i++) { const p = st.players[_i];
      if (!p || p.x == null) continue; tot++;
      if ((p.team === 'home' && p.x > 52) || (p.team === 'away' && p.x < 48)) fuori.push(_i + (p.gk ? 'P' : '') + ':' + p.team.slice(0, 1) + Math.round(p.x));
      /* meta' campo: casa difende x<50 e deve stare sotto 50; ospiti sopra. Il cerchio e' attorno a x50. */
      if (Math.abs(p.x - 50) <= 9) cerchio++;
      if (p.team === 'home' && p.x > 52) casaFuori++;
      if (p.team === 'away' && p.x < 48) ospFuori++;
    }
    /* [7.589.0] E L'OROLOGIO STA GIRANDO? Lo schieramento della ripresa vive DENTRO il tick di gioco:
       se durante la festa del gol il tick e' sospeso, il ripiegamento non gira affatto e i ventidue
       restano dove il gol li ha lasciati — che e' l'unica cosa compatibile con due misure che finora si
       contraddicono (il ripiegamento converge quando gira; il censimento li trova fuori posto). */
    const _c = (st.clock == null) ? null : String(st.clock);
    const _fermo = (_c !== null && _c === window.__CPM_LASTC);
    window.__CPM_LASTC = _c;
    R.push({ tot, casaFuori, ospFuori, cerchio, eta, fuori, logCasa, logOsp, logTot, orologioFermo: !!_fermo, hasC: _c !== null, breve: _breve, rtick: _rtick, rms: _rms, scartoX, scartoN, disall });
  } catch (_e) {} }, 150);
}, [ROSSO, R591]);
await openMatch(page, port, { skipLoadAll: true, name: 'Rp' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now();
while (Date.now() - t0 < 600000) { await sleep(1500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
const R = await page.evaluate(() => window.__CPM_RIP || []);
const FUORI = await page.evaluate(() => window.__CPM_FUORI || null);
const DUR = await page.evaluate(() => window.__CPM_DUR || null);
const KOC = await page.evaluate(() => window.__CPM_KOC || {});
const R544 = await page.evaluate(() => window.__CPM_RIP544 || []);
await b.close(); srv.close();

console.log('\n=== DOPO UN GOL, LE SQUADRE TORNANO NELLE PROPRIE META\'? ===\n');
if (!R.length) { console.log('  ⚠ nessun campione durante un calcio d\'inizio: la sonda non misura niente.\n'); process.exit(1); }
const f = R.map(o => o.casaFuori + o.ospFuori).sort((a, c) => a - c);
const q = p => f[Math.min(f.length - 1, Math.floor(p * f.length))];
console.log('  campioni durante la finestra di ripresa: ' + R.length + '  ·  giocatori in campo: ' + Math.round(R.reduce((a, o) => a + o.tot, 0) / R.length));
console.log('\n  giocatori nella META\' CAMPO SBAGLIATA durante la ripresa:');
console.log('    minimo ' + f[0] + '  ·  MEDIANA ' + q(0.5) + '  ·  terzo quarto ' + q(0.75) + '  ·  massimo ' + f[f.length - 1]);
console.log('    di cui in casa ' + (R.reduce((a, o) => a + o.casaFuori, 0) / R.length).toFixed(1) + ' in media  ·  ospiti ' + (R.reduce((a, o) => a + o.ospFuori, 0) / R.length).toFixed(1));
/* [7.589.0] LA STESSA DOMANDA ALLE DUE SORGENTI, negli stessi istanti. */
{
  const conLog = R.filter(o => o.logTot);
  if (!conLog.length) console.log('    ⚠ modello LOGICO non leggibile in nessun campione: il confronto fra le due sorgenti NON e\' giudicabile');
  else {
    const m = (f) => (conLog.reduce((a, o) => a + f(o), 0) / conLog.length).toFixed(1);
    console.log(`    MESH (renderer)  · casa ${m(o => o.casaFuori)} · ospiti ${m(o => o.ospFuori)}`);
    console.log(`    LOGICO (partita) · casa ${m(o => o.logCasa)} · ospiti ${m(o => o.logOsp)}   [${conLog.length} campioni con entrambe le sorgenti]`);
    const sc = R.map(o => o.scartoX).filter(v => v != null).sort((a, b) => a - b);
    if (!sc.length) console.log("    ⚠ scarto mesh/modello NON misurabile");
    else {
      console.log(`    SCARTO mesh contro modello (metri, media per giocatore) · mediana ${sc[Math.floor(sc.length / 2)].toFixed(2)} · min ${sc[0].toFixed(2)} · max ${sc[sc.length - 1].toFixed(2)}  [${sc.length} campioni]`);
      const dis = R.map(o => o.disall || 0), md = dis.reduce((a, v) => a + v, 0) / dis.length;
      const nn = R.map(o => o.scartoN || 0), mn = nn.reduce((a, v) => a + v, 0) / nn.length;
      console.log(`      coppie con SQUADRA DIVERSA (indici disallineati): ${md.toFixed(1)} per campione · coppie valide ${mn.toFixed(1)}`);
      if (md > 0.5) console.log('      ⚠ le due sorgenti NON sono accoppiabili per indice: lo scarto sopra NON e\' giudicabile');
    }
    const conC = R.filter(o => o.hasC);
    if (!conC.length) console.log('    ⚠ orologio non leggibile: NON GIUDICABILE se il tick giri durante la ripresa');
    else {
      const fermi = conC.filter(o => o.orologioFermo);
      console.log(`    OROLOGIO FERMO in ${fermi.length}/${conC.length} campioni della ripresa (${(fermi.length / conC.length * 100).toFixed(0)}%)`);
      /* ⚠️ [7.589.0] QUESTO NUMERO NON DIMOSTRA CHE IL TICK SIA SOSPESO, e per un momento l'ho creduto.
         `clock` e' il MINUTO di gioco, che avanza ogni parecchi tick: campionando a 150 ms un minuto che
         cambia ogni ~2,5 s si trova «fermo» nel ~94% dei campioni anche con il tick perfettamente vivo.
         Quello che il confronto qui sotto dice davvero e' un'altra cosa, ed e' utile: SUBITO DOPO una
         passata di schieramento il modello logico e' quasi a posto, e FRA una passata e l'altra degrada.
         Cioe' qualcuno li rimette fuori posto nel frattempo — e non e' la macchina delle corsie, che
         durante una ripresa scrive ZERO volte (misurato col testimone sul setter). */
      console.log('      ⚠ il minuto e\' a grana grossa: «fermo» qui NON prova che il tick sia sospeso');
    }
    /* [7.589.0 — DUBITARE DELL'ATTREZZO PRIMA DI ACCUSARE IL CODICE] Questa sonda chiama «ripresa» ogni
       istante in cui `kickoffRef > 0`. Ma quel contatore scende SOLO quando la cronaca aggancia un evento:
       se gli eventi sono radi la finestra resta aperta per parecchi secondi, e allora meta' di cio' che ho
       chiamato «ripresa disordinata» sarebbe gioco normale — dove i ventidue DEVONO stare sparsi. Il
       collaudo del PO parla dei pochi secondi dopo il gol: qui si misura quanto dura davvero la finestra,
       perche' se dura dieci secondi il numero che ho riportato non e' quello che lui vede. */
    {
      const dur = []; let cur = 0;
      for (const o of R) { if (o.eta === 1) { if (cur) dur.push(cur); cur = 1; } else cur++; }
      if (cur) dur.push(cur);
      if (dur.length) {
        const ms = dur.map(d => d * 150).sort((a, b) => a - b);
        const md = ms[Math.floor(ms.length / 2)];
        console.log(`    DURATA della finestra: ${dur.length} riprese · mediana ${(md / 1000).toFixed(1)} s · min ${(ms[0] / 1000).toFixed(1)} s · max ${(ms[ms.length - 1] / 1000).toFixed(1)} s`);
        const conB = R.filter(o => o.breve !== null);
        if (!conB.length) console.log("    ⚠ la finestra BREVE non e' leggibile: NON GIUDICABILE");
        else {
          const dentro = conB.filter(o => o.breve), fuoriF = conB.filter(o => !o.breve);
          const m2 = (lst, f) => lst.length ? (lst.reduce((a, o) => a + f(o), 0) / lst.length).toFixed(1) : 'n/d';
          console.log(`    FINESTRA BREVE (la ripresa vera) · ${dentro.length} campioni · logico casa ${m2(dentro, o => o.logCasa)} · ospiti ${m2(dentro, o => o.logOsp)} · mesh casa ${m2(dentro, o => o.casaFuori)} · ospiti ${m2(dentro, o => o.ospFuori)}`);
          /* [7.590.0] il CONTATORE grezzo, non solo il suo verdetto: se dice sempre «breve» mentre la
             finestra dura 23 secondi, allora non sta contando i tick che credo — e va guardato, non
             interpretato. */
          const tk = conB.map(o => o.rtick).filter(v => v != null).sort((a, b) => a - b);
          if (tk.length) console.log(`    contatore dei tick di ripresa · mediana ${tk[Math.floor(tk.length / 2)]} · max ${tk[tk.length - 1]}`);
          const msv = conB.map(o => o.rms).filter(v => v != null).sort((a, b) => a - b);
          if (msv.length) console.log(`    eta' REALE della ripresa nei campioni · min ${(msv[0] / 1000).toFixed(1)}s · mediana ${(msv[Math.floor(msv.length / 2)] / 1000).toFixed(1)}s · max ${(msv[msv.length - 1] / 1000).toFixed(1)}s (la soglia e' 4,5s)`);
          console.log(`    DOPO la finestra (gioco vivo)    · ${fuoriF.length} campioni · logico casa ${m2(fuoriF, o => o.logCasa)} · ospiti ${m2(fuoriF, o => o.logOsp)} — QUI i ventidue DEVONO essere sparsi`);
        }
        const primi3 = R.filter(o => o.eta <= 20), dopo = R.filter(o => o.eta > 20);
        const mm = (lst, f) => lst.length ? (lst.reduce((a, o) => a + f(o), 0) / lst.length).toFixed(1) : 'n/d';
        console.log(`      primi 3 s (cio' che il PO vede)  · logico casa ${mm(primi3, o => o.logCasa)} · ospiti ${mm(primi3, o => o.logOsp)}  [${primi3.length} campioni]`);
        console.log(`      oltre 3 s (gioco gia' ripreso?) · logico casa ${mm(dopo, o => o.logCasa)} · ospiti ${mm(dopo, o => o.logOsp)}  [${dopo.length} campioni]`);
      }
    }
  }
}
console.log('  giocatori dentro il cerchio di centrocampo (nel calcio sono DUE): mediana ' + R.map(o => o.cerchio).sort((a, c) => a - c)[R.length >> 1]);
{
  console.log('\n  --- QUANDO SI GUARDA, DENTRO LA FINESTRA DELLA RIPRESA ---');
  console.log('  (un campione ogni 150 ms; lo schieramento scatta ogni tre tick di gioco, cioe\' ~900 ms)');
  for (const [nome, filtro] of [['primi 450 ms', o => o.eta <= 3], ['450-900 ms', o => o.eta > 3 && o.eta <= 6], ['oltre 900 ms', o => o.eta > 6]]) {
    const g = R.filter(filtro); if (!g.length) { console.log('    ' + nome.padEnd(14) + ' nessun campione'); continue; }
    const m = g.map(o => o.casaFuori + o.ospFuori).sort((a, c) => a - c);
    const c = g.map(o => o.cerchio).sort((a, c2) => a - c2);
    console.log('    ' + nome.padEnd(14) + ' campioni ' + String(g.length).padStart(3) + '  ·  nella meta\' sbagliata (mediana) ' + m[m.length >> 1] + '  ·  nel cerchio (mediana) ' + c[c.length >> 1]);
  }
}
{
  const tardi = R.filter(o => o.eta > 6);
  const cnt = {};
  for (const o of tardi) for (const f of (o.fuori || [])) { const k = f.split(':')[0]; cnt[k] = (cnt[k] || 0) + 1; }
  const tot = tardi.length || 1;
  console.log('\n  --- CHI RESTA FUORI POSTO (oltre 900 ms, ' + tardi.length + ' campioni) ---');
  console.log('  (indice del giocatore · P = portiere · quota di campioni in cui e\' fuori)');
  console.log('    ' + Object.entries(cnt).sort((a, c) => c[1] - a[1]).slice(0, 12).map(([k, v]) => k + ' ' + (100 * v / tot).toFixed(0) + '%').join('  ·  '));
  const es = (tardi.find(o => (o.fuori || []).length) || {}).fuori;
  if (es) console.log('    esempio di un campione: ' + es.join(' · '));
}
console.log('\n  lo schieramento ha girato ' + (KOC.blocco || 0) + ' volte, di cui ' + (KOC.ko || 0) + ' durante una ripresa' + ((KOC.ko | 0) === 0 ? '  ← MAI: il ripiegamento non ha nemmeno la possibilita\' di applicarsi' : ''));
{
  console.log('\n  --- COSA VEDE IL RIPIEGAMENTO, giocatore per giocatore (dal gioco, non dedotto) ---');
  if (!R544.length) console.log('    ⚠ il ripiegamento non e\' MAI stato raggiunto: il ramo non gira');
  else {
    const perT = {}; for (const r of R544) perT[r.t] = (perT[r.t] || 0) + 1;
    console.log('    passaggi nel ramo: ' + R544.length + '  ·  per squadra: ' + Object.entries(perT).map(([k, v]) => k + ' ' + v).join(' · '));
    /* [7.589.0] il residuo e' ormai quasi tutto di CASA: guardare solo gli ospiti era il modo di non
       vederlo. E si stampa anche il bersaglio DOPO il ripiegamento — quello che il codice usa davvero. */
    for (const lato of ['away', 'home']) {
      const camp = R544.filter(r => (lato === 'home' ? r.t === 'home' : r.t !== 'home') && !r.gk);
      const fuori = camp.filter(r => (lato === 'home' ? r.post > 46.01 : r.post < 53.99));
      console.log(`    ${lato === 'home' ? 'CASA  ' : 'OSPITI'} · passaggi ${camp.length} · con bersaglio finale NELLA META' SBAGLIATA ${fuori.length}`);
      for (const r of camp.slice(0, 6)) console.log('      i' + r.i + ' · bersaglio ' + r.pre + ' -> dopo il ripiegamento ' + r.post + ' · sta a ' + r.x);
    }
  }
}
if (FUORI) { const q = (a) => { if (!a.length) return 'nessun campione'; const b = a.slice().sort((x, y) => x - y); return `mediana ${b[Math.floor(b.length / 2)].toFixed(2)} m su ${b.length} campioni`; };
  console.log('\n  --- LO SCARTO MESH/MODELLO HA UN TERMINE DI PARAGONE ---');
  console.log('    durante la ripresa : ' + q(FUORI.rip));
  console.log('    a gioco vivo       : ' + q(FUORI.vivo));
}
if (DUR) { const q = (a) => a.length ? a.map(v => (v * 150 / 1000).toFixed(1) + 's').join(' · ') : 'mai chiusa/mai aperta';
  console.log('\n  --- QUANTO DURANO DAVVERO I DUE CONTATORI DELLA RIPRESA ---');
  console.log('    kickoffRef>0 : ' + q(DUR.ko) + (DUR._ko ? `  (+ una ancora aperta da ${(DUR._ko*150/1000).toFixed(1)}s)` : ''));
  console.log('    kickRef>0    : ' + q(DUR.kick) + (DUR._kick ? `  (+ una ancora aperta da ${(DUR._kick*150/1000).toFixed(1)}s)` : ''));
}
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
