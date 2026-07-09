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
  return { left, changed:a.changed, idem:(b.player.calendar||[]).length===(a.player.calendar||[]).length, heal2 };
});
await browser.close(); srv.close();
if (res.err){ console.error('❌ '+res.err); process.exit(2); }
console.log(JSON.stringify(res));
const ok = res.left.includes('cat|HP') && res.left.includes('cat|AU') && !res.left.includes('cat|HU') && res.left.length===3 && res.idem && res.heal2 && !errs.length;// invarianti: duplicato (cat|H non giocata) RIMOSSO · ritorno cat|A intatto · giocata intatta · terza fixture conservata (repair pool può ripuntarla)
console.log(ok ? '✅ PASS — duplicato rimosso, ritorno intatto, idempotente' : '❌ FAIL');
process.exit(ok?0:2);
