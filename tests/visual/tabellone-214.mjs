#!/usr/bin/env node
/* [giro 214 PO-477] GUARDIANO: DURANTE LA LOTTERIA DEI RIGORI IL TABELLONE E' OPACO E LA STRISCIA IN ALTO DICE «RIGORI» E LA SERIE.
   Sonda sonda-214 (finale di coppa finita 1-1, serie vinta dall'eroe, poi cerimonia con la striscia ancora in vista). Tre corse in fila
   sullo stesso browser:
     A · verde, telefono 375×667, eroe in casa;   B · verde, PC 1366×768, eroe in trasferta;   C · rosso __CPM_NO_G214, telefono, in casa.
   SOGLIE DICHIARATE (verde, A e B):
     - 0 errori di pagina; almeno 5 campioni della serie e almeno 3 letture diverse della striscia (la serie avanza);
     - in OGNI campione la striscia dice «RIGORI» al posto del minuto, nessun minuto («90'») e il punteggio della SERIE orientato come la
       striscia (squadra di casa a sinistra; la serie dell'eroe sotto la sua squadra), mai il «1–1» della partita, mai capovolto;
     - tabellone opaco: nel rettangolo del tabellone, foto con la tela 3D e senza (tabellone congelato in una copia per la durata della
       coppia di foto), 0 pixel che cambiano in TUTTI i campioni giudicati (nessuna scritta del maxischermo leggibile in trasparenza),
       almeno 3 campioni giudicati fuori dallo stacco nero;
       un campione vale solo se a fine coppia di foto si e' ancora nella lotteria (misurato: la cerimonia partita fra le due foto
       metteva «TITOLO VINTO!» in una sola delle due e la differenza era del DOM, non del 3D — 48.967 pixel su un campione, gli altri 0);
     - a serie finita la striscia torna normale: in cerimonia risultato della partita «1–1», nessun «RIGORI».
   ROSSO (C): striscia mai «RIGORI», minuto in tutti i campioni (almeno 5), e almeno 1.000 pixel del 3D che cambiano nel rettangolo del
   tabellone (misurato 35.882-96.301) su almeno 3 campioni fuori dallo stacco.
   Meno campioni o fase dopo la serie diversa dalla cerimonia = non giudicato = rosso. Circa 8 minuti.
   [giro 216 PO-482] DECISIONE PO 15/11: in lotteria la striscia mette la serie con L'EROE A SINISTRA, come il tabellone, anche in
   trasferta; nomi/stemmi seguono i numeri; finita la lotteria torna casa a sinistra. Corse aggiunte: D · verde, telefono, in trasferta;
   E · rosso __CPM_NO_G216 (= comportamento del 214), telefono, in trasferta. Soglie aggiunte (verde A, B, D), sui campioni giudicati
   (fuori dai 0,6 s di scorrimento degli stemmi quando la barra si specchia, contati a parte):
     - almeno 5 giudicati e almeno 1 con la serie non pari (altrimenti l'ordine non si vede = non giudicato = rosso);
     - in OGNI giudicato: numero dell'eroe a sinistra nella striscia E nome/stemma dell'eroe a sinistra, tabellone con l'eroe a
       sinistra (sigla e numero), cioe' striscia e tabellone nello stesso ordine; sigle coerenti coi numeri;
     - dopo la serie, in cerimonia: casa a sinistra (in casa l'eroe, in trasferta l'avversario).
   ROSSO (E): nessun giudicato nello stesso ordine, almeno 1 campione con l'ordine opposto visibile (serie non pari), sigle sempre
   coerenti coi numeri (il 214 girava tutto insieme), almeno 5 giudicati. Con le cinque corse circa 13 minuti. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { misura214 } from './sonda-214.mjs';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const TEL = { width: 375, height: 667 }, PC = { width: 1366, height: 768 };
const A = await misura214(browser, port, { viewport: TEL, finale: true });
const B = await misura214(browser, port, { viewport: PC, finale: true, trasferta: true });
const C = await misura214(browser, port, { viewport: TEL, finale: true, rosso: true });
const D = await misura214(browser, port, { viewport: TEL, finale: true, trasferta: true });
const E = await misura214(browser, port, { viewport: TEL, finale: true, trasferta: true, rosso216: true });
await browser.close(); srv.close();
for (const [n, r] of [['A', A], ['B', B], ['C', C], ['D', D], ['E', E]]) console.log(n + ' ' + JSON.stringify(r));
const verde = (r) => r.errs === 0 && r.campioni >= 5 && r.letture.length >= 3 && r.strisciaRigori === r.campioni && r.strisciaMinuto === 0
  && r.strisciaSerie === r.campioni && r.strisciaPartita === 0 && r.strisciaCapovolta === 0
  && r.pixelGiudicati >= 3 && r.pixelLuceGiudicati >= 3 && r.diffMax === 0
  && !!r.dopo && r.dopo.ph === 'ceremony' && r.dopo.ris === '1–1' && !/RIGORI/i.test(r.dopo.min || '');
const eroe216 = (t) => /salern|\bSAL\b/i.test(t || '');
const verde216 = (r, trasferta) => r.giudicati216 >= 5 && r.serieDiverse >= 1 && r.eroeSxStriscia === r.giudicati216 && r.tabelloneEroeSx === r.giudicati216
  && r.stessoOrdine === r.giudicati216 && r.sigleCoerenti === r.giudicati216 && r.ordineOpposto === 0
  && (trasferta ? (!eroe216(r.dopoSx) && eroe216(r.dopoDx)) : (eroe216(r.dopoSx) && !eroe216(r.dopoDx)));
const rosso216 = (r) => r.errs === 0 && r.giudicati216 >= 5 && r.stessoOrdine === 0 && r.ordineOpposto >= 1 && r.sigleCoerenti === r.giudicati216 && r.tabelloneEroeSx === r.giudicati216;
const desc216 = (r) => `ordine (giro 216): giudicati ${r.giudicati216} (scorrimento ${r.scorrimento216}, serie non pari ${r.serieDiverse}) · eroe a sinistra nella striscia ${r.eroeSxStriscia} · tabellone eroe a sinistra ${r.tabelloneEroeSx} · stesso ordine ${r.stessoOrdine} · sigle coerenti ${r.sigleCoerenti} · ordine opposto ${r.ordineOpposto} · dopo ${r.dopoSx} | ${r.dopoDx}`;
const rosso = (r) => r.campioni >= 5 && r.strisciaRigori === 0 && r.strisciaMinuto === r.campioni && r.pixelLuceGiudicati >= 3 && r.diffMaxLuce >= 1000;
const desc = (r) => `striscia «RIGORI» ${r.strisciaRigori}/${r.campioni} · minuto ${r.strisciaMinuto} · serie ${r.strisciaSerie}/${r.campioni} · «1–1» della partita ${r.strisciaPartita} · capovolta ${r.strisciaCapovolta} · letture ${r.letture.join(' , ')} · pixel del 3D attraverso il tabellone max ${r.diffMax} (fuori stacco ${r.diffMaxLuce}) su ${r.pixelGiudicati} campioni (${r.pixelLuceGiudicati} fuori stacco) · dopo la serie ${r.dopo ? `${r.dopo.ph} ${r.dopo.ris} ${r.dopo.min}` : 'NON GIUDICATO'} · errori ${r.errs}`;
const esiti = [[verde(A) && verde216(A, false), 'verde A telefono, in casa: ' + desc(A) + ' · ' + desc216(A)], [verde(B) && verde216(B, true), 'verde B PC, in trasferta: ' + desc(B) + ' · ' + desc216(B)], [rosso(C), 'rosso C __CPM_NO_G214: ' + desc(C)],
  [verde(D) && verde216(D, true), 'verde D telefono, in trasferta: ' + desc(D) + ' · ' + desc216(D)], [rosso216(E), 'rosso E __CPM_NO_G216 (= 214), telefono, in trasferta: ' + desc216(E)]];
for (const [p, t] of esiti) console.log(`${p ? '✅' : '❌'} ${t}`);
const ok = esiti.every(e => e[0]);
console.log(ok ? '✅ tabellone-214 verde (e il rosso si vede)' : '❌ tabellone-214 rosso');
process.exit(ok ? 0 : 1);
