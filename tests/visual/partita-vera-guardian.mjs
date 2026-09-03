/* [7.628.0 GUARDIANO] LA PARTITA VERA SI GIUDICA DA SOLA.
   Direttiva PO (27/08): «i test di qualita' vanno automatizzati altrimenti non arriviamo
   all'obiettivo». Questo e' il guardiano d'accettazione dello sprint: UN run ambientale seedato
   raccoglie in un colpo i testimoni gia' esistenti e ASSERISCE le bande. Se una release fa
   regredire il cuore della partita — cause del turno, catena degli schemi, fischi dell'arbitro,
   custodia del pallone — il rituale va ROSSO e non si spedisce.
   LEZIONE-MOTION applicata alle soglie: conteggi a soglia su pochi campioni sono flakiness — ogni
   banda ha margine largo sotto il misurato, e i conteggi piccoli (gol) asseriscono solo con
   campione minimo. Le bande si stringono a mano quando i numeri salgono, mai si allentano per
   far passare un rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
/* [7.684.0] DUE PARTITE, non una: vedi la nota sulla banda «catena-viva». Ognuna in un CONTESTO
   PULITO — riaprire la partita nella stessa pagina fa ritrovare al gioco la carriera salvata e la
   seconda gara non si apre piu' (misurato due volte: timeout su openMatch). */
const PARTITE_G = +(process.env.CPM_PARTITE_G || 2);
const all = []; const MENTE = []; const ROSA = []; let page = null, ctx = null;
for (let g = 0; g < PARTITE_G; g++) {
  if (ctx) await ctx.close();
  ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  page = await ctx.newPage();
  await installCdnRoutes(page);
  /* [7.684.0] PROVA DEL ROSSO PARAMETRICA, come in fondate-558: `CPM_ROSSO=__CPM_NO683` rigioca le
     stesse partite col rimedio spento. ⚠️ Senza questo il guardiano IGNORAVA la variabile d'ambiente,
     e due mie misure «a libreria spenta» erano in realta' a libreria accesa: ho creduto di aver
     scagionato un imputato che non era nemmeno stato interrogato. */
  await page.addInitScript((rosso) => { window.__CPM_GLB = false; window.__CPM_TURN616 = {}; window.__CPM_NPD = []; window.__CPM_REC = true; window.__CPM_CARRIER641 = []; if (rosso) String(rosso).split(',').forEach(r => { window[r.trim()] = 1; }); }, process.env.CPM_ROSSO || null);/* [7.684.0] accetta piu' rossi separati da virgola: la banda «manovra-viva» copre due sistemi e per farla fallire vanno spenti entrambi *//* [7.643] +REC e +CARRIER641 */
  await openMatch(page, port, { skipLoadAll: true, name: 'Pv' });
  await page.evaluate((s2) => window.__CPM_AUTOPLAY(true, { seed: s2, policy: 'seeded', tickMs: 300 }), 7300 + g * 911);
  for (let k = 0; k < 12; k++) { await sleep(20000);
    const chunk = await page.evaluate(() => { const e = (window.__CPM_EV && window.__CPM_EV()) || []; if (window.__CPM_EV_RESET) window.__CPM_EV_RESET(); return e; });
    all.push(...chunk); }
  /* [7.747.0] I TESTIMONI DELLA MENTE, per partita: la mente esegue (7.738), la riga descrive (7.739), il raccoglitore va sul pallone (7.743). */
  try { const w = await page.evaluate(() => ({ p: window.__CPM_PASSA738 || null, f: window.__CPM_FATTO739 || null, r: window.__CPM_RACC743 || null })); MENTE.push(w); } catch (_e) { MENTE.push({ p: null, f: null, r: null }); }
  /* [7.755.0] LA ROSA VERA: i cognomi dei 22 (e dell'eroe) di questa partita, per giudicare che ogni riga-fatto nomini uomini che esistono. */
  try { const ros = await page.evaluate(() => { const mp = (window.__CPM_MP && window.__CPM_MP()) || []; const n = mp.filter(Boolean).map(q => String(q.n || '').trim()).filter(Boolean); const h = (window.__CPM_NARR669 && window.__CPM_NARR669() && window.__CPM_NARR669().eroe) || null; return n; }); ROSA.push(...ros); } catch (_e) {}
}
const T = await page.evaluate(() => window.__CPM_TURN616 || {});
const NPD = await page.evaluate(() => window.__CPM_NPD || []);
const CAR = await page.evaluate(() => window.__CPM_CARRIER641 || []);
const CODA = await page.evaluate(() => window.__CPM_CODA643 || null);
await b.close(); srv.close();

const rows = all.filter(e => e.ev === 'chronicle');
const goals = all.filter(e => e.ev === 'goal');
const turni = all.filter(e => e.ev === 'turn');
const catRows = rows.filter(r => r.rk === 'catena');
/* [7.684.0] LE RIGHE CHE RACCONTANO UNA MANOVRA, da qualunque sistema vengano. */
const libRows = rows.filter(r => r.lib === 1);
const manovraRows = rows.filter(r => r.rk === 'catena' || r.lib === 1);
const fischi = turni.filter(t => /^interruzione-/.test(t.causa || '')).length;
const orologio = (T.per && T.per['orologio']) | 0; const totT = T.n | 0;
const causali = totT ? Math.round((totT - orologio) / totT * 100) : null;
const npds = NPD.slice().sort((a, c) => a - c);
const npdMed = npds.length ? npds[Math.floor(npds.length / 2)] : null;
let golCoperti = 0;
for (const g of goals) { const lato = g.side === 'home' ? 1 : -1;
  if (rows.some(r => r.rk && r.min != null && r.min >= g.min - 4 && r.min <= g.min && (r.tn | 0) === lato)) golCoperti++; }

const mEseg = MENTE.reduce((a, w) => a + ((w.p && w.p.eseguiti) | 0), 0);
const mRacc = MENTE.reduce((a, w) => a + ((w.r && w.r.eletti) | 0), 0);
const fattoRows = rows.filter(r => r.rk === 'fatto739');
/* [7.755.0] OGNI RIGA-FATTO NOMINA UOMINI VERI (§12: la telecronaca non inventa il calcio). Si estraggono le parole con
   l'iniziale maiuscola dal testo e si chiede che almeno due appartengano alla rosa (passatore e ricevente); l'eroe non
   sta in __CPM_MP ma il suo cognome si accetta se compare in una riga-fatto di un passaggio verso di lui — per non
   bocciare l'eroe, la banda chiede che TUTTE le righe-fatto abbiano ALMENO UN cognome della rosa, e che nessuna
   riga-fatto sia vuota. Prova del rosso: CPM_ROSSO=__CPM_NO739 azzera le righe-fatto e la banda diventa non giudicabile. */
const _cog = (t) => String(t || '').replace(/[^A-Za-zÀ-ÿ' ]/g, ' ').split(/\s+/).filter(w => /^[A-ZÀ-Ý][a-zà-ÿ']{2,}$/.test(w));
const _rosaSet = new Set(ROSA.map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()));
const nomiOk = fattoRows.filter(r => _cog(r.txt).some(w => _rosaSet.has(w))).length;
const checks = [
  ['turno-causale', `scritture causali ${causali}% (orologio ${orologio}/${totT})`, totT >= 8 ? causali >= 85 : null],
  /* ⚠️ [7.684.0 — QUESTA BANDA AVEVA CONSUMATO TUTTO IL SUO MARGINE, e me ne sono accorto solo quando
     ha bocciato una release che non c'entrava. Misurato per esclusione, sullo STESSO strumento e sullo
     STESSO seme: 7.682 -> 10 righe · 7.683 alla spedizione -> 8 · 7.683, codice identico, rimisurato
     un'ora dopo -> 5 · con le punizioni del 7.684 -> 4, tre passate su tre. Lo stesso build che da' 8 e
     poi 5 dice che il conteggio oscilla di TRE righe, e la soglia stava a 5: dentro il rumore. Le
     punizioni spostavano UNA riga e si sono prese la colpa di un metro fragile.
     La regola scritta in testa a questo file e' «ogni banda ha margine largo sotto il misurato, e le
     bande si stringono a mano quando i numeri salgono, mai si allentano per far passare un rosso».
     Qui NON si allenta: la severita' per-partita resta identica (cinque righe di catena per partita) e
     si RADDOPPIA IL CAMPIONE — due partite, banda dieci. Un campione piu' grande riduce i falsi rossi
     E i falsi verdi: e' l'unico modo onesto di rendere stabile un conteggio a soglia.
     La prova che questo metro vede ancora un difetto vero e' piu' sotto (`__CPM_NO528`). */
  /* ⚠️ [7.684.0 — QUESTA BANDA MISURAVA UN MECCANISMO, NON UNA QUALITA', e per questo ha bocciato un
     miglioramento. Misurato, stesso guardiano a due partite: 7.682 -> 18 righe di catena; oggi -> 9;
     e con la libreria DAVVERO spenta (`CPM_ROSSO=__CPM_NO683`) -> 18 di nuovo. La causa e' la libreria
     delle azioni salienti (7.683): si prende gli slot che prima erano della catena. Non e' una perdita,
     e' una SOSTITUZIONE — e verso l'alto: le righe della libreria sono fondate all'89,7% contro il
     64,3% della cronaca senza. Chiamare «regressione» il rimpiazzo di righe meno vere con righe piu'
     vere sarebbe difendere il meccanismo invece della qualita'.
     Percio' la banda conta ora le righe che RACCONTANO UNA MANOVRA, da qualunque sistema vengano —
     catena o libreria — con la stessa severita' di prima (cinque a partita). Il conteggio della sola
     catena resta stampato: se un giorno la libreria si spegne senza che nessuno se ne accorga, quel
     numero lo dice. Il campione resta raddoppiato per il motivo dell'altra nota: su una partita sola
     questo conteggio oscillava di tre righe con la soglia a cinque. */
  ['manovra-viva', `${manovraRows.length} righe di manovra su ${PARTITE_G} partite (catena ${catRows.length} + libreria ${libRows.length}) · banda ${5 * PARTITE_G}`, manovraRows.length >= 5 * PARTITE_G],
  ['arbitro-esiste', `${fischi} interruzioni ambientali`, fischi >= 6],
  ['custodia', `mediana ${npdMed}u su ${npds.length} campioni (ogni tick vivo)`, npds.length >= 6 ? npdMed <= 12 : null],
  ['gol-con-manovra', `${golCoperti}/${goals.length} gol con riga di macchina nei 4' prima`, goals.length >= 3 ? golCoperti >= 1 : null],
  /* [7.747.0 — LA MENTE MUOVE IL PALLONE, E LA CRONACA LO DICE. Tre bande sulla Fase 3 spedita (7.738/7.739/7.743), con
     margine largo sotto il misurato: eseguiti 4-8 a partita (banda: >=1 per partita sul totale), righe-fatto 4-8 (>=1 per
     partita), raccoglitori eletti 8-16 (>=2 per partita). Prova del rosso: CPM_ROSSO=__CPM_NO738 spegne la mente e la banda
     «mente-esegue» va rossa (e con lei «riga-descrive», che vive del fatto). */
  ['mente-esegue', `${mEseg} passaggi eseguiti dalla mente su ${PARTITE_G} partite · banda ${PARTITE_G}`, mEseg >= PARTITE_G],
  ['riga-descrive', `${fattoRows.length} righe-fatto (rk fatto739) su ${PARTITE_G} partite · banda ${PARTITE_G}`, fattoRows.length >= PARTITE_G],
  ['raccoglitore', `${mRacc} raccoglitori eletti su ${PARTITE_G} partite · banda ${2 * PARTITE_G}`, mRacc >= 2 * PARTITE_G],
  ['nomi-veri', `${nomiOk}/${fattoRows.length} righe-fatto con un cognome della rosa (rosa ${_rosaSet.size} nomi)`, fattoRows.length >= 2 ? nomiOk === fattoRows.length : null],
];
console.log('\n=== GUARDIANO PARTITA-VERA ===\n');
{ /* [7.643] misura informativa del portatore-stato (F1b): diventa banda quando 2-3 run confermano la stabilita' */
  const _con = CAR.filter(q => q.c).length;
  const _dd = CAR.filter(q => q.d != null).map(q => q.d).sort((a, c) => a - c);
  console.log(`  [info] portatore-stato: campioni ${CAR.length} · copertura ${CAR.length ? Math.round(_con / CAR.length * 100) : 0}% · dist mediana ${_dd.length ? _dd[_dd.length >> 1] : '?'}u · coda consegne ${JSON.stringify(CODA)}`);
}
let fail = 0;
for (const [nome, det, ok] of checks) {
  const tag = ok === null ? '· non giudicabile (campione sotto minimo)' : ok ? '✅' : '❌';
  if (ok === false) fail++;
  console.log(`  ${tag} ${nome} — ${det}`);
}
if (fail) { console.log(`\n❌ PARTITA-VERA: ${fail} banda/e violate — la release non parte.\n`); process.exit(1); }
console.log('\n✅ PARTITA-VERA OK — le bande d\'accettazione tengono.\n');
