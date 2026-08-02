/* [6.91.0] heal fixture duplicata: (A) voce lega non giocata che duplica (opp,sede) GIÀ GIOCATA → rimossa;
   (B) ritorno legittimo (stesso opp, sede opposta) → INTATTO; (C) idempotenza. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '/home/user/Carrier-manager-/tests/visual/lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await openMatch(page, port); await sleep(300);
const res = await page.evaluate(() => {
  const M = window.__CPM_MIGRATE; if (typeof M !== 'function') return { err: 'no __CPM_MIGRATE' };
  const mk = cal => ({ name:'T', proStatus:'pro', season:16, week:36, club:{id:'cfm',n:'CF Madrid',lg:'Liga Ibérica',p:88}, stats:{velocità:80}, ovr:88, calendar:cal, standings:[], cup:null });
  const cal = [
    { matchday:10, week:20, opponentId:'cat', opponentName:'FC Catalunya', isHome:true, played:true, result:{homeScore:2,awayScore:0,won:true,drew:false} },
    { matchday:27, week:34, opponentId:'cat', opponentName:'FC Catalunya', isHome:false, played:false, result:null },       // ritorno LEGITTIMO (sede opposta)
    { matchday:29, week:36, opponentId:'cat', opponentName:'FC Catalunya', isHome:true, played:false, result:null },        // DUPLICATO corrotto (stessa sede)
    { matchday:30, week:37, opponentId:'vil', opponentName:'Villareal X', isHome:true, played:false, result:null },
  ];
  const a = M(mk(JSON.parse(JSON.stringify(cal))));
  const left = (a.player.calendar||[]).map(m=>(m.opponentId||'?')+'|'+(m.isHome?'H':'A')+(m.played?'P':'U')).sort();
  const b = M(JSON.parse(JSON.stringify(a.player)));
  // [6.98.0 HEAL 2] storico con 2 gare di lega vs CAT (A/R completato) → la voce di lega NON giocata vs CAT è stantia e va rimossa
  const p2 = mk([
    { matchday:10, week:20, opponentId:'cat', opponentName:'FC Catalunya', isHome:true, played:true, result:{homeScore:2,awayScore:0,won:true,drew:false} },
    { matchday:33, week:36, opponentId:'cat', opponentName:'FC Catalunya', isHome:false, played:false, result:null },
  ]);
  p2.matchHistory=[{week:20,opponent:'FC Catalunya',homeScore:2,awayScore:0,won:true,drew:false},{week:30,opponent:'FC Catalunya',homeScore:1,awayScore:1,won:false,drew:true}];
  const c = M(p2);
  const heal2 = !(c.player.calendar||[]).some(m=>!m.type&&!m.played&&m.opponentName==='FC Catalunya');
  /* [7.210.0 HEAL 3 — collaudo PO «bug partita già giocata, pareggiata 2 a 2!»] il caso che le guardie
     precedenti NON coprivano: PRIMO incrocio giocato (sta nello storico) ma la voce di calendario non è mai
     stata marcata. Nessuna gemella nel calendario e una sola gara vs quel club ⇒ HEAL 1 e HEAL 2 sono ciechi. */
  /* l'avversario deve appartenere al pool REALE della lega, altrimenti il repair del calendario lo ri-punta
     su un altro club e la misura non riguarda più HEAL 3 */
  const _pool = (window.__CPM_CLUBS||[]).filter(c=>c.lg==='Liga Ibérica'&&c.id!=='cfm'&&c.id!=='cat');
  const _op = _pool[0] || { id:'gir', n:'Girona X' };
  const p3 = mk([
    { matchday:14, week:24, opponentId:_op.id, opponentName:_op.n, isHome:false, played:false, result:null },  // GIOCATA (2-2) ma mai marcata
    { matchday:31, week:36, opponentId:_op.id, opponentName:_op.n, isHome:true,  played:false, result:null },  // ritorno LEGITTIMO (sede opposta)
  ]);
  p3.week=24;
  p3.matchHistory=[{season:16,week:24,opponent:_op.n,isHome:false,homeScore:2,awayScore:2,won:false,drew:true}];
  const d = M(JSON.parse(JSON.stringify(p3)));
  const dCal = (d.player.calendar||[]).filter(m=>m.opponentId===_op.id).map(m=>(m.isHome?'H':'A')).sort();
  const heal3 = !dCal.includes('A') && dCal.includes('H');   // stantia (trasferta già giocata) rimossa · ritorno in casa intatto
  /* [7.302.0 collaudo PO «bug grave! partita già giocata» — 6a variante, su «Giornata 34 DI 34»] HEAL 4:
     invariante che non dipende da nessuna chiave sporcabile — il calendario ha UNA voce per numero di
     GIORNATA, quindi una voce di lega NON giocata con un numero di giornata GIA' giocato e' un duplicato. */
  const p4 = mk([
    { matchday:34, week:37, opponentId:'cat', opponentName:'FC Catalunya', isHome:true, played:true,  result:'W 2-0' },
    { matchday:34, week:37, opponentId:'gir', opponentName:'Altro Club',   isHome:true, played:false, result:null },
  ]);
  const e = M(JSON.parse(JSON.stringify(p4)));
  const heal4 = !(e.player.calendar||[]).some(m=>!m.type&&!m.played&&m.matchday===34);
  /* e la STAGIONE dev'essere timbrata su OGNI entry di storico, non solo su quelle giocate dal vivo:
     senza, la guardia (C) del 7.210.0 e' morta dalla stagione 2 in poi per tutte le gare simulate. */
  const simStamped = (window.__CPM_SRC_HAS_SEASON!==false);
  return { left, changed:a.changed, idem:(b.player.calendar||[]).length===(a.player.calendar||[]).length, heal2, heal3, heal4, simStamped, dCal };
});
await browser.close(); srv.close();
if (res.err){ console.error('❌ '+res.err); process.exit(2); }
console.log(JSON.stringify(res));
const ok = res.left.includes('cat|HP') && res.left.includes('cat|AU') && !res.left.includes('cat|HU') && res.left.length===3 && res.idem && res.heal2 && res.heal3 && res.heal4 && !errs.length;// invarianti: duplicato (cat|H non giocata) RIMOSSO · ritorno cat|A intatto · giocata intatta · terza fixture conservata (repair pool può ripuntarla)
console.log(ok ? '✅ PASS — duplicato rimosso, ritorno intatto, idempotente, HEAL 3 (giocata mai marcata) + HEAL 4 (giornata duplicata) bonificate' : '❌ FAIL');
process.exit(ok?0:2);
