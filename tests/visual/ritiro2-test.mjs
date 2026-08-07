#!/usr/bin/env node
/* [7.337.0 direttiva PO — RITIRO 2.0] GUARDIANO del nuovo precampionato.
   «L'eroe deve vivere il ritiro, non organizzarlo»: la preparazione la DECIDE LO STAFF (derivata),
   le gerarchie le stabilisce il MISTER (responso), le amichevoli hanno la decisione dello staff
   sull'impiego. Verifiche: (1) determinismo dei tre motori; (2) VARIETÀ tra stagioni (località/
   eventi cambiano); (3) preparazione nel set ammesso + motivazione presente + driver reali
   (fatica alta → rigenerante; europa+acquisti → mai «equilibrato» di default); (4) verdetto
   gerarchie a bande sensate (fuoriclasse ≠ giovane sottolivello; concorrente nel ruolo abbassa);
   (5) amichevoli: 2-3, statuses validi, la selezione locale porta il nome della località, voto
   solo se giochi; (6) END-TO-END: racconto completo dal wizard → campDone, squadRole, log con
   le amichevoli, matchHistory INTATTA, diario; il ritiro dell'eroe non sceglie MAI la preparazione.
   Eseguibile con: node ritiro2-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const page = await browser.newPage({ viewport: { width: 480, height: 1050 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => typeof window.ritiroPlan === 'function', null, { timeout: 45000 });

const r = await page.evaluate(() => {
  const out = {};
  const mkP = (o) => ({ season: 3, proStatus: 'pro', age: 23, ovr: 72, coachTrust: 66, form: 72, fatigue: 5, totalMatches: 80, position: 'Attaccante',
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    coach: { name: 'Mister T', style: 'Bilanciato' }, seasonObjectives: [], history: [{ season: 2, leagueGoals: 9 }], ...o });
  // (1) determinismo
  const p1 = mkP({}); const a = window.ritiroPlan(p1), b = window.ritiroPlan(p1);
  out.det = JSON.stringify({ l: a.loc.n, h: a.hotel, e: a.events.map(x => x.t), p: a.prep.id }) === JSON.stringify({ l: b.loc.n, h: b.hotel, e: b.events.map(x => x.t), p: b.prep.id });
  const f1 = window.ritiroFriendlies(p1, a), f2 = window.ritiroFriendlies(p1, a);
  out.detAm = JSON.stringify(f1) === JSON.stringify(f2);
  // (2) varietà tra stagioni (su 6 stagioni: almeno 3 località distinte e piani eventi non tutti uguali)
  const locs = new Set(), evSets = new Set();
  for (let sn = 2; sn <= 7; sn++) { const pl = window.ritiroPlan(mkP({ season: sn })); locs.add(pl.loc.n); evSets.add(pl.events.map(x => x.t).join('|')); }
  out.variety = { locs: locs.size, evSets: evSets.size };
  // (3) preparazione: set ammesso + motivazione; driver reali
  const allowed = ['atletico', 'tattico', 'tecnico', 'equilibrato', 'rigenerante'];
  out.prepOk = allowed.includes(a.prep.id) && !!a.prep.reason && a.prep.reason.length > 4;
  out.prepTired = window.ritiroPlan(mkP({ fatigue: 70 })).prep.id;                    // → rigenerante
  out.prepEuro = window.ritiroPlan(mkP({ euro: { active: true }, coach: { style: 'Difensivo' } })).prep.id; // → tattico atteso
  // (4) gerarchie: bande sensate
  const vTop = window.ritiroHierarchyVerdict(mkP({ ovr: 86, age: 28, totalMatches: 300, isCaptain: true, history: [{ season: 2, leagueGoals: 22 }] }), a);
  const vLow = window.ritiroHierarchyVerdict(mkP({ ovr: 58, age: 19, totalMatches: 4, coachTrust: 50, history: [] }), a);
  out.verd = { top: vTop.band, low: vLow.band };
  const planRiv = { ...a, inRole: { name: 'Nuovo Nove', role: 'Centravanti' } };
  const vBase = window.ritiroHierarchyVerdict(mkP({}), a), vRiv = window.ritiroHierarchyVerdict(mkP({}), planRiv);
  const rank = { fermo: 4, vicino: 3, alternativa: 2, indietro: 1, panchina: 0 };
  out.rival = { base: vBase.band, riv: vRiv.band, lower: rank[vRiv.band] <= rank[vBase.band], cites: /Nuovo Nove/.test(vRiv.msg) };
  // (5) amichevoli
  out.am = f1.map(m => ({ k: m.kind, st: m.status, rat: m.rat, opp: m.opp }));
  out.amOk = f1.length >= 2 && f1.every(m => ['titolare', 'subentro', 'panchina', 'nc'].includes(m.status) && (m.rat == null) === (m.status === 'panchina' || m.status === 'nc'));
  out.amLocal = f1[0] && f1[0].opp.includes(a.loc.n);
  return out;
});
console.log('=== RITIRO 2.0 · motori puri ===\n' + JSON.stringify(r, null, 1));
if (!r.det) issues.push('(1) ritiroPlan non deterministico');
if (!r.detAm) issues.push('(1) ritiroFriendlies non deterministico');
if (r.variety.locs < 3) issues.push(`(2) località troppo ripetitive su 6 stagioni (${r.variety.locs} distinte)`);
if (r.variety.evSets < 3) issues.push(`(2) piani-eventi troppo ripetitivi su 6 stagioni (${r.variety.evSets} distinti)`);
if (!r.prepOk) issues.push('(3) preparazione fuori dal set ammesso o senza motivazione');
if (r.prepTired !== 'rigenerante') issues.push(`(3) rosa stanca (fatica 70) deve dare preparazione rigenerante (dato ${r.prepTired})`);
if (r.prepEuro !== 'tattico') issues.push(`(3) europa+mister difensivo deve dare preparazione tattica (dato ${r.prepEuro})`);
if (!(r.verd.top === 'fermo' || r.verd.top === 'vicino')) issues.push(`(4) il fuoriclasse capitano deve partire in alto nelle gerarchie (dato ${r.verd.top})`);
if (!(r.verd.low === 'indietro' || r.verd.low === 'panchina')) issues.push(`(4) il giovane sottolivello deve partire indietro (dato ${r.verd.low})`);
if (!r.rival.lower) issues.push(`(4) il concorrente nel ruolo deve abbassare (o non alzare) il verdetto (${r.rival.base}→${r.rival.riv})`);
if (!r.rival.cites) issues.push('(4) il responso deve CITARE il concorrente arrivato nel ruolo');
if (!r.amOk) issues.push('(5) amichevoli malformate (status/voto): ' + JSON.stringify(r.am));
if (!r.amLocal) issues.push('(5) la prima amichevole deve essere contro la selezione della località');

// (6) END-TO-END: wizard → racconto completo → scelta comportamentale → stato applicato
const mkSave = () => ({ phase: 'career', player: { name: 'Ritiro2 Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 23, ovr: 72, tutorialDone: true, campDone: false, jerseyNumSeason: 3, presidentModalSeason: 3, seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, squadRole: 'rotazione', coachTrust: 66,
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 72, tecnica: 71, fisico: 70, 'mentalità': 72, tiro: 74, passaggio: 71, dribbling: 73, posizionamento: 72 },
  form: 72, morale: 70, fatigue: 5, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } });
const pg = await browser.newPage({ viewport: { width: 480, height: 1050 } });
await installCdnRoutes(pg);
pg.on('pageerror', e => issues.push('pageerror e2e: ' + String(e.message).slice(0, 140)));
await pg.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, mkSave());
await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await pg.waitForFunction(() => { const r2 = document.getElementById('root'); return r2 && r2.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await sleep(1200);
try { await pg.getByText('Parti per il ritiro', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { issues.push('(6) launcher «Parti per il ritiro» non trovato'); }
await sleep(700);
// il racconto NON deve mai offrire la scelta della preparazione (atletico/tecnico erano i vecchi bottoni)
const bodyTxt = await pg.evaluate(() => document.body.innerText);
if (/scegli come prepararti/i.test(bodyTxt)) issues.push('(6) il racconto offre ancora la scelta della preparazione');
if (!/La decisione dello staff|Destinazione/.test(bodyTxt)) issues.push('(6) racconto non partito (beat arrivo/staff assenti)');
for (let i = 0; i < 12; i++) {
  const done = await pg.evaluate(() => /La tua risposta/.test(document.body.innerText));
  if (done) break;
  try { await pg.getByText('Avanti →', { exact: false }).first().click({ timeout: 4000 }); } catch (e) { break; }
  await sleep(450);
}
try { await pg.getByText('Aiuta i nuovi', { exact: false }).first().click({ timeout: 6000 }); } catch (e) { issues.push('(6) scelta comportamentale non trovata'); }
await sleep(1600);
const fin = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player;
  return { campDone: !!p.campDone, role: p.squadRole || null, mh: (p.matchHistory || []).length,
    nAmic: (p.log || []).filter(l => l.includes('Amichevole (')).length,
    diario: (p.diary || []).some(d => /Il ritiro di/.test(d.headline || '')) }; });
console.log('(6) e2e:', JSON.stringify(fin));
if (!fin.campDone) issues.push('(6) campDone non settato a fine racconto');
if (!fin.role) issues.push('(6) squadRole non assegnato');
if (fin.mh !== 0) issues.push('(6) le amichevoli NON devono entrare in matchHistory (' + fin.mh + ')');
if (fin.nAmic < 2) issues.push('(6) log senza le amichevoli del precampionato (' + fin.nAmic + ')');
if (!fin.diario) issues.push('(6) voce di diario del ritiro assente');
await pg.close();

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ RITIRO 2.0 OK (determinismo · varietà · staff decide · gerarchie del mister · amichevoli · e2e)');
process.exit(issues.length ? 1 : 0);
