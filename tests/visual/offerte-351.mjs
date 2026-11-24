#!/usr/bin/env node
/* [giro 351, PO-607 «queste offerte sono ridicole»] GUARDIANO: LE OFFERTE DI MERCATO SONO UN PASSO AVANTI O LATERALE PER QUALCOSA.
   Foto PO (docs/collaudo-po/200-offerta-hannover.png): a un giocatore «In rotazione» di FC Augusta (prestigio 66, 4 stagioni di
   contratto) arriva da FC Hannover (Deutsche Liga 2, prestigio 50) un prestito con diritto di riscatto, 1 stagione, ruolo Riserva,
   presentato con +16 morale e +8% crescita.
   Popolazione sintetica (stessa per i due bracci): ogni club professionistico di CLUBS x quattro ruoli (riserva, rotazione, titolare,
   leader) x due anzianita', OVR coerente col ruolo nel club, contratto di oggi = stipendio del gioco per OVR+prestigio, durata 1..4.
   Per ognuno 4 chiamate a generateTransferOffer (la funzione vera, chokepoint di TUTTE le offerte ufficiali di mercato).
   Classi giudicate (giocatore professionista con contratto in corso):
     A · ASSURDA: rotazione/titolare/leader, club offerente piu' debole (prestigio <= oggi-5) che offre un PRESTITO o un ruolo PEGGIORE.
     B · SENZA GUADAGNO: nessun passo avanti su nessuno dei quattro assi (prestigio +3 · ruolo migliore · stipendio +10% · durata
         piu' lunga di un definitivo).
     C · EFFETTI INCOERENTI: morale >= 10 senza un guadagno vero (prestigio +5, ruolo migliore o stipendio +15%), oppure crescita
         >= 10 da un club piu' debole senza piu' minuti.
     D · IL CASO DELLA FOTO: Augusta(66) rotazione -> mai un prestito da un club <= 61 con ruolo Riserva.
   VERDE: A=B=C=D=0 con copertura (>= 1500 offerte e >= 40% dei giocatori con almeno un'offerta).
   ROSSO window.__CPM_NO_G351 (regole di prima): A>0 e B>0, altrimenti il braccio rosso e' CIECO = rosso.
   Copertura insufficiente = NON GIUDICATO = rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage(); await installCdnRoutes(page);
  const pe = []; page.on('pageerror', e => pe.push(String(e.message).slice(0, 160)));
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G351 = 1; }, rosso);
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof generateTransferOffer === 'function' && typeof CLUBS !== 'undefined', null, { timeout: 90000 }); await sleep(500);
  const R = await page.evaluate(() => {
    const RV = { primavera: 0, riserva: 1, rotazione: 2, titolare: 3, leader: 3 };/* il minutaggio dell'offerta arriva fino a «Titolare» */
    const rOf = m => m >= 70 ? 3 : m >= 45 ? 2 : 1;
    const OFF = { riserva: -4, rotazione: -1, titolare: 2, leader: 5 };
    const pro = CLUBS.filter(c => c && c.p != null && !c.isU18);
    const out = { offerte: 0, giocatori: 0, conOfferta: 0, A: 0, B: 0, C: 0, D: 0, es: { A: [], B: [], C: [], D: [] }, perTipo: {}, prestitiDaPiuDeboli: 0 };
    const add = (k, s) => { out[k]++; if (out.es[k].length < 4) out.es[k].push(s); };
    const giudica = (p, o) => {
      const cur = p.club.p, dp = o.club.p - cur, rNow = RV[p.squadRole], rNew = rOf(+o.minutaggio || 0);
      const loan = String(o.type).includes('prest'), wr = (o.wage || 0) / Math.max(1, p.contract.wage);
      const s = `${p.squadRole} ${p.club.n}(${cur}) ovr${p.ovr} <- ${o.club.n}(${o.club.p}) ${o.type} min${o.minutaggio} dur${o.duration}/${p.contract.duration} stip x${wr.toFixed(2)} mor+${o.moralBonus} cresc+${o.growthBonus}`;
      out.perTipo[o.type] = (out.perTipo[o.type] || 0) + 1;
      if (loan && dp <= -5) out.prestitiDaPiuDeboli++;
      if (rNow >= 2 && dp <= -5 && (loan || rNew < rNow)) add('A', s);
      const gain = dp >= 3 || rNew > rNow || wr >= 1.10 || (!loan && o.duration > p.contract.duration);
      if (!gain) add('B', s);
      const veroGuadagno = dp >= 5 || rNew > rNow || wr >= 1.15;
      if ((o.moralBonus >= 10 && !veroGuadagno) || (o.growthBonus >= 10 && dp < 0 && rNew <= rNow)) add('C', s);
    };
    let k = 0;
    for (const c of pro) for (const role of ['riserva', 'rotazione', 'titolare', 'leader']) for (const season of [3, 6]) {
      const ovr = Math.max(55, Math.min(92, c.p + OFF[role]));
      const p = { name: 'Sonda ' + (k++), nation: 'Italia', age: 24, ovr, season, totalMatches: season * 25, proStatus: 'pro', squadRole: role,
        club: c, contract: { wage: _ovrToWageWeekly133(ovr, c.p), duration: 1 + (k % 4), expiresAtSeason: season + 1 + (k % 4) }, contractExpired: false, stats: {}, morale: 70, form: 70 };
      out.giocatori++; let any = false;
      for (let i = 0; i < 4; i++) { const o = generateTransferOffer(p); if (!o) continue; any = true; out.offerte++; giudica(p, o); }
      if (any) out.conOfferta++;
    }
    /* D · il caso della foto */
    const aug = CLUBS.find(c => c.id === 'aug') || pro[0];
    let dTot = 0;
    for (let i = 0; i < 400; i++) {
      const ovr = 65; const p = { name: 'Foto', nation: 'Italia', age: 22, ovr, season: 2, totalMatches: 40, proStatus: 'pro', squadRole: 'rotazione', club: { ...aug, p: 66 },
        contract: { wage: _ovrToWageWeekly133(ovr, 66), duration: 4 }, contractExpired: false, stats: {} };
      const o = generateTransferOffer(p); if (!o) continue; dTot++;
      if (String(o.type).includes('prest') && o.club.p <= 61 && rOf(+o.minutaggio || 0) < 2) add('D', `${o.club.n}(${o.club.p}) ${o.type} min${o.minutaggio}`);
    }
    out.dTot = dTot;
    return out;
  });
  await page.close();
  return { ...R, pe };
}
const V = await braccio(false), Rr = await braccio(true);
await b.close(); srv.close();
const riga = (n, x) => `${n}: offerte ${x.offerte} · giocatori ${x.giocatori} (con offerta ${x.conOfferta}) · A assurde ${x.A} · B senza guadagno ${x.B} · C effetti incoerenti ${x.C} · D caso foto ${x.D}/${x.dTot} · prestiti da club piu' deboli ${x.prestitiDaPiuDeboli} · tipi ${JSON.stringify(x.perTipo)}`;
console.log(riga('VERDE', V)); for (const k of ['A', 'B', 'C', 'D']) for (const s of V.es[k]) console.log(`  verde ${k}: ${s}`);
console.log(riga('ROSSO', Rr)); for (const k of ['A', 'B', 'C', 'D']) for (const s of Rr.es[k].slice(0, 2)) console.log(`  rosso ${k}: ${s}`);
const errs = [];
const cop = x => x.offerte >= 1500 && x.conOfferta >= 0.4 * x.giocatori && x.dTot >= 100;
if (!cop(V)) errs.push('NON GIUDICATO: copertura del braccio verde insufficiente');
if (V.A || V.B || V.C || V.D) errs.push(`verde: A=${V.A} B=${V.B} C=${V.C} D=${V.D} (atteso tutto 0)`);
if (V.pe.length) errs.push('verde: pageerror ' + V.pe[0]);
if (!cop(Rr)) errs.push('NON GIUDICATO: copertura del braccio rosso insufficiente');
if (!(Rr.A > 0 && Rr.B > 0)) errs.push(`rosso CIECO: A=${Rr.A} B=${Rr.B} con __CPM_NO_G351 (atteso > 0)`);
if (errs.length) { console.log('❌ offerte-351 ROSSO\n  - ' + errs.join('\n  - ')); process.exit(1); }
console.log('✅ offerte-351 VERDE (braccio verde pulito, braccio rosso __CPM_NO_G351 vede il difetto)');
