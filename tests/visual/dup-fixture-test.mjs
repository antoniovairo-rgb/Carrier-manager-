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
  return { left, changed:a.changed, idem:(b.player.calendar||[]).length===(a.player.calendar||[]).length };
});
await browser.close(); srv.close();
if (res.err){ console.error('❌ '+res.err); process.exit(2); }
console.log(JSON.stringify(res));
const ok = res.left.includes('cat|HP') && res.left.includes('cat|AU') && !res.left.includes('cat|HU') && res.left.length===3 && res.idem && !errs.length;// invarianti: duplicato (cat|H non giocata) RIMOSSO · ritorno cat|A intatto · giocata intatta · terza fixture conservata (repair pool può ripuntarla)
console.log(ok ? '✅ PASS — duplicato rimosso, ritorno intatto, idempotente' : '❌ FAIL');
process.exit(ok?0:2);
