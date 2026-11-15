#!/usr/bin/env node
/* [giro 204 PO-450] GUARDIANO: IL PIAZZATO GIA' CALCIATO DAL MOTORE SI VEDE (scena di sola visione) E LA LOTTERIA NON HA IL «90'» DIETRO.
   1 · Ramo «gia' calciato». Nel gioco il ponte del giro 191 tiene il rigore sul dischetto finche' la scena non si apre, quindi il ramo in
       cui il motore ha gia' calciato non si presenta da solo (misurato nel giro 191: mai nelle partite del lotto). Lo si PROVOCA con lo
       strumento di prova __CPM_PROVA_GIACALCIATO204 (src/14: niente ponte, il motore calcia prima della scena) sulla partita del giro 191
       (sonda-rigore-139, «r187d-11», seme 12, K=1, produzione: il rigore fuori scena lo batte un compagno).
       VERDE: almeno un rigore negato alla scena (scena_negata191: il ramo e' esercitato, altrimenti NON GIUDICATO = rosso) e per ciascuno
         - una scena di sola visione (testimone __CPM_VIS204) in gioco fluido, col racconto in pagina e l'esito scritto uguale al motore;
         - il 3D rifa' QUEL calcio: battitore = chi ha calciato nel motore (compagno/eroe), pallone dove dice l'esito (gol: in rete x>48,6;
           parato: respinto davanti alla linea x<48; fuori: |z|>3,6; palo: |z| fra 3,0 e 3,7);
         - nessun doppio calcio: una sola battuta del motore e nessuna scena giocata (piazzato_giocato) per quel rigore.
       ROSSO __CPM_NO_G204: stesso ramo esercitato, nessuna scena di sola visione (il calcio non si vede) — se non si vede, rosso.
   2 · Lotteria dei rigori (sonda-90-204): verde = il maxischermo non disegna il minuto e nel rettangolo del tabellone «CALCI DI RIGORE»
       0 pixel del giallo del minuto; rosso __CPM_NO_G204 = minuto disegnato e >= 100 pixel gialli. Meno di 3 campioni = non giudicato.
   Le tre partite girano insieme (tre processi), circa 5 minuti; la lotteria dopo. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { misura90 } from './sonda-90-204.mjs';
const OUT = process.env.CPM_TMP || '/tmp';
const gioca = (nome, env) => new Promise((ok) => { const f = `${OUT}/piazzato-204-${nome}.json`; try { fs.unlinkSync(f); } catch (e) {}
  const p = spawn('node', ['sonda-rigore-139.mjs'], { env: { ...process.env, CPM_NOMI: 'r187d-11', CPM_SEMI: '12', CPM_K: '1', CPM_PROD: '1', CPM_OUT: f, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; p.stdout.on('data', d => { log += d; }); p.stderr.on('data', d => { log += d; });
  p.on('close', () => { let J = null; try { J = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {} ok({ nome, J, log }); }); });
const SOLO_LOT = !!process.env.CPM_SOLO_LOTTERIA;
const esiti = []; let ok = true;
const ESITO_TXT = { goal: 'GOOOL!', saved: 'PARATO!', blocked: 'PARATO!', wide: 'FUORI!', post: 'PALO!' };
const pallaOk = (e, b) => { if (!b) return false; const z = Math.abs(b.bz);
  if (e === 'goal') return b.bx > 48.6 && z <= 3.3; if (e === 'saved' || e === 'blocked') return b.bx < 48 && z <= 3.3;
  if (e === 'wide') return z > 3.6; if (e === 'post') return z >= 3.0 && z <= 3.7; return false; };
function giudica(r) {
  const x = r.J && r.J.res && r.J.res[0]; if (!x) return { giudicata: false };
  const P = x.pen || []; const neg = P.filter(e => e.t === 'scena_negata191');
  const casi = neg.map(n => { const v = (x.vis204 || []).find(q => q.min === n.min); const ult = n.ult || {};
    const dom = (x.visDom || []).filter(q => q.min >= n.min && q.min <= n.min + 1); const esitoDom = (dom.find(q => q.esito) || {}).esito || null;
    const fasi = [...new Set(dom.map(q => q.ph))];
    const v3 = (x.vis3d || []).filter(q => q.f >= 1); const ult3 = v3[v3.length - 1] || null;
    /* nessun doppio calcio: battute del motore fra l'occasione e la scena negata (una sola) e nessuna scena giocata nei 6' dopo */
    const iN = P.indexOf(n); let iO = iN; while (iO > 0 && P[iO].t !== 'occasione_eroe') iO--;
    const dopo = P.slice(iN + 1).filter(e => e.min <= n.min + 6); const prossimoRig = dopo.findIndex(e => e.t === 'rigore');
    const finestra = prossimoRig >= 0 ? dopo.slice(0, prossimoRig) : dopo;
    const battute = P.slice(iO, iN + 1).concat(finestra).filter(e => e.t === 'battuta').length;
    const giocate = finestra.filter(e => e.t === 'piazzato_giocato').length;
    return { min: n.min, esitoMotore: ult.esito, chi: ult.nome, eroeMotore: !!ult.eroe, visione: !!v, esitoDom, fasi, kicker3d: ult3 && ult3.kicker, palla3d: ult3 && [ult3.bx, ult3.by, ult3.bz], battute, giocate,
      ok3d: !!(ult3 && ult3.kicker === (ult.eroe ? 'eroe' : 'compagno') && pallaOk(ult.esito, { bx: ult3.bx, bz: ult3.bz })) }; });
  return { giudicata: true, fine: x.fine, errs: x.errs, casi };
}
if (!SOLO_LOT) {
  const [v, r] = await Promise.all([gioca('verde', { CPM_PROVA204: '1' }), gioca('rosso', { CPM_PROVA204: '1', CPM_ROSSO204: '1' })]);
  const gv = giudica(v), gr = giudica(r);
  console.log('verde ' + JSON.stringify(gv)); console.log('rosso ' + JSON.stringify(gr));
  { const c = gv.casi || []; const pass = gv.giudicata && gv.errs === 0 && c.length >= 1 && c.every(q => q.visione && q.esitoDom === ESITO_TXT[q.esitoMotore] && q.fasi.length === 1 && q.fasi[0] === 'playing' && q.ok3d && q.battute === 1 && q.giocate === 0);
    esiti.push(`${pass ? '✅' : '❌'} verde ramo «gia' calciato»: ${c.length} rigori negati alla scena · ${c.map(q => `${q.min}' ${q.chi} ${q.esitoMotore} -> scena ${q.visione ? 'si' : 'NO'} «${q.esitoDom}» 3D ${q.kicker3d}/${JSON.stringify(q.palla3d)} battute ${q.battute} giocate ${q.giocate}`).join(' | ') || 'NON GIUDICATO (ramo non esercitato)'}`); ok = ok && pass; }
  { const c = gr.casi || []; const visto = gr.giudicata && c.length >= 1 && c.every(q => !q.visione && !q.esitoDom);
    esiti.push(`${visto ? '✅' : '❌'} rosso __CPM_NO_G204: ${visto ? 'il rigore gia\' calciato non si vede (nessuna scena di sola visione)' : 'rosso NON visto'} (${c.length} rigori negati)`); ok = ok && visto; }
  if (!ok) for (const q of [v, r]) if (!q.J) console.log(`--- ${q.nome} (nessun json) ---\n${q.log.slice(-1500)}`);
}
{ const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const lv = await misura90(browser, port, {}), lr = await misura90(browser, port, { rosso: true }), l8 = await misura90(browser, port, { rosso208: true });
  await browser.close(); srv.close();
  console.log('lotteria verde ' + JSON.stringify(lv)); console.log('lotteria rosso ' + JSON.stringify(lr));
  const pv = lv.errs === 0 && lv.giudicati >= 3 && lv.pixelGiudicati >= 3 && lv.minutoDisegnato === 0 && lv.pixelGialliMax === 0;
  const pr = lr.giudicati >= 3 && lr.pixelGiudicati >= 3 && lr.minutoDisegnato >= 1 && lr.pixelGialliMax >= 100;
  esiti.push(`${pv ? '✅' : '❌'} verde lotteria: minuto disegnato ${lv.minutoDisegnato}/${lv.giudicati} · pixel gialli dietro il tabellone ${lv.pixelGialliMax}`);
  esiti.push(`${pr ? '✅' : '❌'} rosso lotteria __CPM_NO_G204: minuto disegnato ${lr.minutoDisegnato}/${lr.giudicati} · pixel gialli ${lr.pixelGialliMax}`); ok = ok && pv && pr;
  /* [giro 208 PO-468] il maxischermo durante la lotteria dice «RIGORI» e il punteggio della SERIE, aggiornato a ogni tiro; nessun
     punteggio della partita dietro il tabellone. SOGLIA DICHIARATA (verde): almeno 10 campioni del testimone __CPM_SB208, tutti in modo
     «rigori», 0 in modo «partita», 0 punteggi disegnati che la serie non ha mai avuto, almeno 3 punteggi diversi disegnati (la serie
     avanza), l'ultimo disegnato uguale all'ultimo della serie, e almeno 300 pixel bianchi della scritta nella fascia dietro il tabellone
     (misurato 1.168-1.170). ROSSO __CPM_NO_G208: 0 in modo «rigori», almeno 10 in modo «partita», meno di 100 pixel bianchi (misurato 0).
     Meno campioni = non giudicato = rosso. */
  console.log('lotteria rosso208 ' + JSON.stringify(l8));
  const sv = lv.serieGiudicati >= 10 && lv.maxischermoRigori === lv.serieGiudicati && lv.maxischermoPartita === 0 && lv.disegnatiFuoriSerie === 0 && lv.punteggiDisegnati.length >= 3 && lv.ultimoDisegnato === lv.ultimaSerie && lv.pixelGiudicati >= 3 && lv.pixelBianchiMin >= 300;
  const sr = l8.errs === 0 && l8.serieGiudicati >= 10 && l8.maxischermoRigori === 0 && l8.maxischermoPartita >= 10 && l8.pixelGiudicati >= 3 && l8.pixelBianchiMax < 100;
  esiti.push(`${sv ? '✅' : '❌'} verde maxischermo: «RIGORI» ${lv.maxischermoRigori}/${lv.serieGiudicati} · punteggi della serie disegnati ${lv.punteggiDisegnati.join(' · ')} (ultimo ${lv.ultimoDisegnato} = serie ${lv.ultimaSerie}) · fuori serie ${lv.disegnatiFuoriSerie} · pixel bianchi ${lv.pixelBianchiMin}`);
  esiti.push(`${sr ? '✅' : '❌'} rosso maxischermo __CPM_NO_G208: punteggio della partita ${l8.maxischermoPartita}/${l8.serieGiudicati} (ultimo ${l8.ultimoDisegnato}) · «RIGORI» ${l8.maxischermoRigori} · pixel bianchi ${l8.pixelBianchiMax}`); ok = ok && sv && sr; }
for (const e of esiti) console.log(e);
console.log(ok ? '✅ piazzato-204 verde (e il rosso si vede)' : '❌ piazzato-204 rosso');
process.exit(ok ? 0 : 1);
