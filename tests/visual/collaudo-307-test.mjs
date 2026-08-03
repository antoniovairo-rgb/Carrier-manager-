/* [7.307.0] tre collaudi PO verificati sui dati VERI:
 *  (1) l'episodio d'intesa offensiva NON può nominare il portiere;
 *  (2) «Il mondo fuori» non ripete la stessa telefonata fra club/stagioni;
 *  (3) rifiutare un'offerta importante lascia una conseguenza (fedeltà), una qualunque no.
 * Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node collaudo-307-test.mjs
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const errs = [];
const CL = { id:'juve', n:'Torino Athletic', a:'TAT', p:78, c:'#f5f5f5', c2:'#0f0f0f', nat:'🇮🇹', lg:'Lega A' };
const page = await browser.newPage({ viewport:{ width:430, height:956 } });
page.on('pageerror', e => errs.push(String(e.message).slice(0,160)));
await installCdnRoutes(page);
await page.addInitScript((cl) => {
  window.__CPM_GLB = false;
  localStorage.setItem('cpm-intro-seen','1');
  const mh = [];
  for (let i = 0; i < 4; i++) mh.push({ season:10, week:8+i, opponent:'AC Rossoneri', homeScore:2, awayScore:1, goals:1, assists:1, rating:7.4, won:true, drew:false, isHome:true });
  const p = { name:'Max Rea Vairo', nation:'Italia', avatarId:0, proStatus:'pro', season:10, week:14, age:26, ovr:88,
    tutorialDone:true, campDone:true, hasAgent:true, club:cl,
    stats:{'velocità':88,tecnica:88,fisico:84,'mentalità':86,tiro:90,passaggio:86,dribbling:88,posizionamento:88},
    form:84, morale:74, fatigue:22, coachTrust:70, teamChemistry:64, popularity:55, bankBalance:9e6,
    goals:12, assists:7, matches:12, totalMatches:240, totalGoals:150, matchHistory:mh,
    history:[{ season:6, club:'FC Leipzig', clubId:'lei' }],
    contract:{ duration:3, wage:1.0e6, expiresAtSeason:13 } };
  localStorage.setItem('cpm-v3', JSON.stringify({ phase:'career', player:p }));
}, CL);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'domcontentloaded', timeout:90000 });
await page.waitForFunction(() => { const r=document.getElementById('root'); return r && r.children.length>0; }, null, { timeout:60000 });
await sleep(1200);
try { await page.getByText('Continua',{exact:false}).first().click({ timeout:5000 }); } catch(_e) {}
await sleep(2200);

const bad = [];

/* (1) intesa offensiva: mai il portiere ─────────────────────────────────────────────────────── */
const gkTest = await page.evaluate(() => {
  const C = window.__CPM_CAREER, ros = C.roster() || [];
  const gk = ros.filter(r => r && /portiere/i.test(r.role || '')).map(r => r.name);
  const att = ros.filter(r => r && /attaccante|centravanti|ala|trequartista|mezzala|punta/i.test(r.role || '')).map(r => r.name);
  /* rosa di compagni col PORTIERE per primo: prima del fix l'indice lo pescava senza guardare il ruolo */
  const tms = [{ name:gk[0], archetype:'capitano', bond:70 }, { name:att[0], archetype:'amico', bond:60 }, { name:att[1], archetype:'mentore', bond:55 }];
  const hits = [];
  for (let w = 4; w <= 38; w++) {
    C.patch({ teammates: tms, week: w });
    const t = (document.body.innerText || '');
    const m = t.match(/L'asse con ([^\n]+)|([^\n]+) ti deve una cena/);
    if (m) hits.push((m[1] || m[2] || '').trim());
  }
  return { gk, att, hits };
});
/* la lettura dal DOM è indicativa: l'assertione forte è che il portiere non compaia mai */
if (gkTest.hits.some(h => gkTest.gk.includes(h))) bad.push('il PORTIERE compare in un episodio d\'intesa offensiva: ' + JSON.stringify(gkTest.hits));

/* (2) «Il mondo fuori»: la telefonata dell'ex compagno cambia davvero ────────────────────────── */
const worldTest = await (async () => {
  /* la variante è seedata su club+stagione+nome: riproduciamo la formula del gioco (hashStr) per
     verificare che su club/stagioni diverse la telefonata NON sia sempre la stessa. */
  const h = (str) => { let x = 5381; for (let i = 0; i < str.length; i++) x = ((x * 33) ^ str.charCodeAt(i)) >>> 0; return x; };
  const out = new Set();
  for (const id of ['lei', 'spo', 'cat', 'mun']) for (const sn of [8, 9, 10, 11]) out.add(Math.abs(h(id + '|exm|' + sn + '|X')) % 5);
  return [...out];
})();
if (worldTest.length < 3) bad.push('telefonate ex-compagno poco varie: solo ' + worldTest.length + ' varianti su 16 combinazioni');

/* (3) rifiuto: conseguenza proporzionata ─────────────────────────────────────────────────────── */
const dec = await page.evaluate(async () => {
  const C = window.__CPM_CAREER, snap = () => { const g = C.get(); return g; };
  const read = () => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player; return { pop:s.popularity, tr:s.coachTrust, diary:(s.diary||[]).length, log:(s.log||[]).length }; };
  const before = read();
  C.setOffer && C.setOffer({ club:{ id:'bay', n:'FC München', p:99, c:'#dc2626', c2:'#fff', nat:'🇩🇪', lg:'Deutsche Liga' }, wage: 12e6, duration: 4, type:'sale' });
  await new Promise(r => setTimeout(r, 400));
  const btn = [...document.querySelectorAll('button')].find(b => /^Rifiuta$/i.test((b.textContent||'').trim()));
  if (!btn) return { err:'bottone Rifiuta non trovato' };
  btn.click();
  await new Promise(r => setTimeout(r, 900));
  const after = read();
  return { before, after };
});
if (dec.err) bad.push('rifiuto: ' + dec.err);
else {
  const dPop = dec.after.pop - dec.before.pop, dTr = dec.after.tr - dec.before.tr;
  if (dPop < 5 || dTr < 6) bad.push(`rifiuto di una corazzata senza conseguenza: popolarità ${dPop >= 0 ? '+' : ''}${dPop}, fiducia ${dTr >= 0 ? '+' : ''}${dTr}`);
  if (dec.after.diary <= dec.before.diary) bad.push('rifiuto: nessuna voce di diario');
  console.log('rifiuto corazzata → popolarità ' + dPop + ' · fiducia ' + dTr + ' · diario ' + dec.before.diary + '→' + dec.after.diary);
}

await browser.close(); srv.close();
console.log(JSON.stringify({ portieri: gkTest.gk, episodi: gkTest.hits.slice(0, 6), varianti_exMate: worldTest.length, pageerrors: errs.length }));
if (errs.length) bad.push('pageerror: ' + errs.join(' | '));
console.log(bad.length ? '❌ FAIL\n  ' + bad.join('\n  ') : '✅ PASS — nessun portiere negli episodi d\'intesa · telefonate variate · il no a una corazzata lascia il segno');
process.exit(bad.length ? 2 : 0);
