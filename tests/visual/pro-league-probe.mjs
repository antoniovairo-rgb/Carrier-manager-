import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await sleep(1500);
const res = await page.evaluate(()=>{
  const out={};
  const p2club = (typeof U18_CLUBS_P2!=='undefined')?U18_CLUBS_P2[0]:null; // a Primavera 2 youth club
  // 1) pro offers from a Primavera 2 player
  const player={ovr:70,goals:10,matches:20,nation:'Italia',club:p2club,season:2,age:18,u18Seasons:1,stats:{},archetype:'finisher',hasAgent:false};
  const {offers}=generateProContracts(player);
  const same=offers.find(o=>o.id==='same_pro');
  out.samePro={lg:same?.club?.lg, leagueSize:CLUBS.filter(c=>c.lg===same?.club?.lg).length};
  out.samePro_getLeague = getLeagueClubs({...player, club:same.club, proStatus:'pro'}).length;
  // 2) migration repair of a BROKEN pro save (club.lg='Primavera 2', standings=36)
  const broken={...player, proStatus:'pro', club:{...p2club, lg:'Primavera 2', isU18:false},
    standings: CLUBS.filter(c=>c.nat===p2club.nat).map(c=>({id:c.id,n:c.n,a:c.a,pts:0,gf:0,ga:0,gd:0,played:0,w:0,d:0,l:0})),
    calendar: CLUBS.filter(c=>c.nat===p2club.nat).slice(0,10).map((c,i)=>({matchday:i+1,week:i+1,opponentId:c.id,opponentName:c.n,isHome:i%2===0,played:false,result:null})),
    matchHistory:[], week:1 };
  out.brokenBefore={ standings:broken.standings.length, clubLg:broken.club.lg };
  const m=window.__CPM_MIGRATE(broken);
  const rp=m.player;
  const _lc=getLeagueClubs(rp);
  out.repaired={ changed:m.changed, clubLg:rp.club.lg, standings:(rp.standings||[]).length, calLen:(rp.calendar||[]).length,
    calOppAllInLeague: (rp.calendar||[]).filter(x=>!x.type).every(x=>_lc.some(c=>c.id===x.opponentId)),
    clubInStandings: (rp.standings||[]).some(s=>s.id===rp.club.id) };
  return out;
});
console.log(JSON.stringify(res,null,1));
await browser.close(); srv.close(); process.exit(0);
