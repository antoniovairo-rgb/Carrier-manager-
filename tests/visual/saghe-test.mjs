/* [7.308.0] LE TRE SAGHE — guardiano permanente.
 * Percorre ogni arco episodio per episodio sugli handler VERI: la card deve comparire, ogni scelta deve
 * far avanzare la serie, gli effetti devono restare bounded e l'ultimo episodio deve chiudere la saga
 * lasciando una riga nel diario. Verifica anche che non escano MAI due saghe insieme.
 * Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node saghe-test.mjs
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const errs = [];
const CL = { id:'juve', n:'Torino Athletic', a:'TAT', p:78, c:'#f5f5f5', c2:'#0f0f0f', nat:'🇮🇹', lg:'Lega A' };
const page = await browser.newPage({ viewport:{ width:430, height:1400 } });
page.on('pageerror', e => errs.push(String(e.message).slice(0,160)));
await installCdnRoutes(page);
await page.addInitScript((cl) => {
  window.__CPM_GLB = false;
  localStorage.setItem('cpm-intro-seen','1');
  const p = { name:'Max Rea Vairo', nation:'Italia', avatarId:0, proStatus:'pro', season:10, week:12, age:27, ovr:84,
    tutorialDone:true, campDone:true, hasAgent:true, club:cl, squadRole:'titolare',
    stats:{'velocità':84,tecnica:84,fisico:82,'mentalità':84,tiro:86,passaggio:84,dribbling:84,posizionamento:84},
    form:80, morale:72, fatigue:24, coachTrust:72, teamChemistry:62, popularity:52, bankBalance:8e6,
    goals:9, assists:5, matches:11, totalMatches:220, totalGoals:130, matchHistory:[],
    contract:{ duration:1, wage:1.2e6, expiresAtSeason:10 } };
  localStorage.setItem('cpm-v3', JSON.stringify({ phase:'career', player:p }));
}, CL);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'domcontentloaded', timeout:90000 });
await page.waitForFunction(() => { const r=document.getElementById('root'); return r && r.children.length>0; }, null, { timeout:60000 });
await sleep(1200);
try { await page.getByText('Continua',{exact:false}).first().click({ timeout:5000 }); } catch(_e) {}
await sleep(2000);

/* i compagni servono all'arco della fascia (serve un capitano in rosa) */
await page.evaluate(() => {
  const ros = window.__CPM_CAREER.roster() || [];
  const att = ros.filter(r => r && /attaccante|centravanti|ala/i.test(r.role||'')).map(r => r.name);
  window.__CPM_CAREER.patch({ teammates:[{ name:att[0], archetype:'capitano', bond:70 }, { name:att[1], archetype:'amico', bond:55 }] });
});
await sleep(500);

const bad = [];
const ARCS = [
  { id:'capitano', tot:3, lbl:/La fascia/i },
  { id:'erede',    tot:4, lbl:/Il ragazzo/i },
  { id:'rinnovo',  tot:3, lbl:/Il contratto/i },
];
const BOUND = { morale:[0,100], coachTrust:[0,100], teamChemistry:[0,100], popularity:[0,100], form:[30,95], fatigue:[0,100] };

for (const arc of ARCS) {
  await page.evaluate((id) => window.__CPM_CAREER.forceSaga(id), arc.id);
  await sleep(500);
  const seen = [];
  for (let step = 0; step < arc.tot; step++) {
    const v = await page.evaluate(() => window.__CPM_CAREER.sagaView());
    if (!v || v.id !== arc.id) { bad.push(`${arc.id}: episodio ${step+1} non servito (sagaView=${JSON.stringify(v)})`); break; }
    seen.push(v.ep);
    const shown = await page.evaluate((re) => {
      const t = document.body.innerText || '';
      return new RegExp(re, 'i').test(t) && /episodio \d+ di \d+/i.test(t);
    }, arc.lbl.source);
    if (!shown) bad.push(`${arc.id}: la card dell'episodio ${step+1} non è a schermo`);
    /* clic sulla PRIMA scelta dell'episodio */
    const clicked = await page.evaluate(() => {
      /* la card della saga è l'elemento PIÙ PROFONDO che contiene sia «episodio N di M» sia dei bottoni */
      const cs = [...document.querySelectorAll('div')].filter(d => /episodio \d+ di \d+/i.test(d.textContent||'') && d.querySelector('button'));
      if (!cs.length) return false;
      const card = cs[cs.length-1];
      const b = [...card.querySelectorAll('button')].filter(x => (x.textContent||'').trim().length > 2);
      if (!b.length) return false; b[0].click(); return true;
    });
    if (!clicked) { bad.push(`${arc.id}: nessun bottone di scelta nell'episodio ${step+1}`); break; }
    await sleep(650);
    /* la settimana deve avanzare perché l'episodio successivo maturi (gap) */
    await page.evaluate(() => { const g = window.__CPM_CAREER.get(); window.__CPM_CAREER.patch({ week: Math.min(37, (g.week||1) + 7) }); });
    await sleep(400);
  }
  const after = await page.evaluate((id) => {
    const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
    const sg = (s.sagas||{})[id]||null;
    return { sg, diary:(s.diary||[]).filter(d => d && d.type==='story').length,
      vals:{ morale:s.morale, coachTrust:s.coachTrust, teamChemistry:s.teamChemistry, popularity:s.popularity, form:s.form, fatigue:s.fatigue } };
  }, arc.id);
  if (!after.sg || !after.sg.done) bad.push(`${arc.id}: la saga non si è chiusa (${JSON.stringify(after.sg)})`);
  if (after.diary < 1) bad.push(`${arc.id}: nessuna voce di diario`);
  for (const k of Object.keys(BOUND)) { const v = after.vals[k];
    if (typeof v === 'number' && (v < BOUND[k][0] || v > BOUND[k][1])) bad.push(`${arc.id}: ${k}=${v} fuori dai bound ${BOUND[k]}`); }
  console.log(`${arc.id}: episodi visti ${JSON.stringify(seen)} · chiusa=${!!(after.sg&&after.sg.done)} · valori ${JSON.stringify(after.vals)}`);
  /* riporta la settimana a un punto utile per l'arco successivo */
  await page.evaluate(() => window.__CPM_CAREER.patch({ week: 12 }));
  await sleep(300);
}

/* mai due saghe insieme */
const dupe = await page.evaluate(() => (document.body.innerText||'').match(/episodio \d+ di \d+/gi) || []);
if (dupe.length > 1) bad.push('due saghe a schermo insieme: ' + dupe.join(' | '));

await browser.close(); srv.close();
if (errs.length) bad.push('pageerror: ' + errs.join(' | '));
console.log(bad.length ? '❌ FAIL\n  ' + bad.join('\n  ') : '✅ PASS — i tre archi si aprono, avanzano a episodi, chiudono e restano dentro i bound');
process.exit(bad.length ? 2 : 0);
