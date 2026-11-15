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
   Meno campioni o fase dopo la serie diversa dalla cerimonia = non giudicato = rosso. Circa 8 minuti. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { misura214 } from './sonda-214.mjs';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const TEL = { width: 375, height: 667 }, PC = { width: 1366, height: 768 };
const A = await misura214(browser, port, { viewport: TEL, finale: true });
const B = await misura214(browser, port, { viewport: PC, finale: true, trasferta: true });
const C = await misura214(browser, port, { viewport: TEL, finale: true, rosso: true });
await browser.close(); srv.close();
for (const [n, r] of [['A', A], ['B', B], ['C', C]]) console.log(n + ' ' + JSON.stringify(r));
const verde = (r) => r.errs === 0 && r.campioni >= 5 && r.letture.length >= 3 && r.strisciaRigori === r.campioni && r.strisciaMinuto === 0
  && r.strisciaSerie === r.campioni && r.strisciaPartita === 0 && r.strisciaCapovolta === 0
  && r.pixelGiudicati >= 3 && r.pixelLuceGiudicati >= 3 && r.diffMax === 0
  && !!r.dopo && r.dopo.ph === 'ceremony' && r.dopo.ris === '1–1' && !/RIGORI/i.test(r.dopo.min || '');
const rosso = (r) => r.campioni >= 5 && r.strisciaRigori === 0 && r.strisciaMinuto === r.campioni && r.pixelLuceGiudicati >= 3 && r.diffMaxLuce >= 1000;
const desc = (r) => `striscia «RIGORI» ${r.strisciaRigori}/${r.campioni} · minuto ${r.strisciaMinuto} · serie ${r.strisciaSerie}/${r.campioni} · «1–1» della partita ${r.strisciaPartita} · capovolta ${r.strisciaCapovolta} · letture ${r.letture.join(' , ')} · pixel del 3D attraverso il tabellone max ${r.diffMax} (fuori stacco ${r.diffMaxLuce}) su ${r.pixelGiudicati} campioni (${r.pixelLuceGiudicati} fuori stacco) · dopo la serie ${r.dopo ? `${r.dopo.ph} ${r.dopo.ris} ${r.dopo.min}` : 'NON GIUDICATO'} · errori ${r.errs}`;
const esiti = [[verde(A), 'verde A telefono, in casa: ' + desc(A)], [verde(B), 'verde B PC, in trasferta: ' + desc(B)], [rosso(C), 'rosso C __CPM_NO_G214: ' + desc(C)]];
for (const [p, t] of esiti) console.log(`${p ? '✅' : '❌'} ${t}`);
const ok = esiti.every(e => e[0]);
console.log(ok ? '✅ tabellone-214 verde (e il rosso si vede)' : '❌ tabellone-214 rosso');
process.exit(ok ? 0 : 1);
