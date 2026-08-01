#!/usr/bin/env node
/* [7.281.0 collaudo PO «la conferenza stampa era con la squadra precedente!»]
   GUARDIANO del REGISTRO DELLE PAROLE. Le voci del ledger (promesse, patti, torti) non ricordavano DOVE erano
   state pronunciate: dopo un trasferimento la piazza nuova ti rinfacciava la conferenza d'apertura fatta a quella
   vecchia — e ci contava sopra le gare del nuovo club, visto che il matchHistory si azzera al passaggio.
   Asserzioni sul motore VERO estratto dal sorgente:
   (1) una promessa fatta al club attuale si riscuote;
   (2) la stessa promessa, dopo il cambio di maglia, NON si riscuote più;
   (3) le voci di salvataggi vecchi (senza club) valgono solo se non hai cambiato squadra in stagione;
   (4) `ledgerPush` timbra sempre il club.
   Uso: node ledger-club-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
const issues = [];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const grab = (start, end) => { const i = src.indexOf(start); const j = src.indexOf(end, i); return src.slice(i, j + end.length); };
const pushSrc = grab('const ledgerPush=(p,e)=>(', '.slice(-60)});');
const dueSrc = grab('const ledgerDue=(p)=>{try{', '}catch(_e){return null;}};');
const ledgerPush = new Function('return ' + pushSrc.slice('const ledgerPush='.length).replace(/;$/, ''))();
const ledgerDue = new Function('clamp', 'return ' + dueSrc.slice('const ledgerDue='.length).replace(/;$/, ''))(clamp);

const gare = (n, fromWeek) => Array.from({ length: n }, (_, i) => ({ week: fromWeek + i + 1, goals: i === 0 ? 1 : 0, assists: 0, rating: 7.0 }));
const base = (x) => ({ proStatus: 'pro', season: 5, week: 12, club: { id: 'bha', n: 'FC Sussex' }, matchHistory: gare(4, 3), history: [], ...x });

// (4) il timbro
{
  const out = ledgerPush(base({}), { t: 'promessa', who: 'la piazza', what: "Conferenza d'apertura: tono ambizioso" });
  const v = out.ledger[out.ledger.length - 1];
  console.log(`(4) ledgerPush timbra il club: ${v.club || '—'}`);
  if (v.club !== 'bha') issues.push('(4) ledgerPush non registra il club della voce');
}

// (1) stesso club → si riscuote
{
  const p = base({ ledger: [{ t: 'promessa', who: 'la piazza', what: "Conferenza d'apertura: tono ambizioso", season: 5, week: 3, club: 'bha' }] });
  const d = ledgerDue(p);
  console.log(`(1) promessa fatta QUI → ${d ? 'si riscuote («' + d.t + '»)' : 'NON esce'}`);
  if (!d) issues.push('(1) una promessa fatta al club attuale non si riscuote più: regressione');
}

// (2) club diverso → non si riscuote
{
  const p = base({ club: { id: 'sel', n: 'FC Selhurst' }, ledger: [{ t: 'promessa', who: 'la piazza', what: "Conferenza d'apertura: tono ambizioso", season: 5, week: 3, club: 'bha' }] });
  const d = ledgerDue(p);
  console.log(`(2) promessa fatta al club PRECEDENTE → ${d ? 'ESCE (difetto)' : 'non esce'}`);
  if (d) issues.push(`(2) la piazza nuova rinfaccia le parole dette altrove: «${d.d.slice(0, 60)}…»`);
}

// (3) voci legacy (senza club)
{
  const senza = { t: 'promessa', who: 'la piazza', what: "Conferenza d'apertura: tono ambizioso", season: 5, week: 3 };
  const fermo = ledgerDue(base({ ledger: [senza] }));
  const mosso = ledgerDue(base({ ledger: [senza], history: [{ season: 5, club: 'FC Vecchio' }] }));
  console.log(`(3) voce vecchia senza club — restando: ${fermo ? 'esce' : 'non esce'} · dopo un trasferimento in stagione: ${mosso ? 'ESCE (difetto)' : 'non esce'}`);
  if (!fermo) issues.push('(3) le voci dei salvataggi vecchi spariscono anche senza trasferimento');
  if (mosso) issues.push('(3) le voci senza club escono anche dopo un trasferimento');
}

// ── (5) [7.282.0 collaudo PO «è rimasto il richiedi cessione di due squadre fa!»] stessa classe: uno stato che
//     riguarda UNA società non può sopravvivere al cambio di maglia. Controllo statico sui due punti che contano.
{
  const creaz = /transferRequest:\{season:p\.season\|\|1,week:p\.week\|\|1,status:"pending",pref:_pref,club:/.test(src);
  const reset = /transferListed:false,transferRequest:null,/.test(src);
  console.log(`(5) richiesta di cessione — porta il club: ${creaz} · azzerata al trasferimento: ${reset}`);
  if (!creaz) issues.push('(5) la richiesta di cessione non registra il club: dopo un trasferimento resterebbe appesa');
  if (!reset) issues.push('(5) acceptTransfer non azzera transferRequest: la richiesta respinta segue il giocatore al club nuovo');
}

if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — le parole restano nella piazza in cui sono state dette');
