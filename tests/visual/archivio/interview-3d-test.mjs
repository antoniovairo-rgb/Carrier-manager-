#!/usr/bin/env node
/* [7.43.0 Sprint 5 parte 2] PROBE — mixed zone 3D dietro l'intervista post-partita:
   (1) intervista post-partita (win) forzata → il canvas 3D è montato dietro il modal, 0 pageerror + screenshot;
   (2) risposta scelta → modal chiuso → canvas SMONTATO (dispose);
   (3) intervista PRE-partita → NIENTE canvas (la mixed zone è solo post-partita). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const save = { phase: 'career', player: { name: 'IV Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 10, weekLived: true, age: 23, ovr: 76, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, drawSeen: 3, squadRole: 'titolare', coachTrust: 80, value: 20, popularity: 50,
  goals: 6, assists: 2, matches: 9, matchHistory: [{ opponent: 'FC Test', rating: 7.2, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 1 }],
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } };

const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await page.evaluate(() => window.__CPM_CAREER.dismiss());
await sleep(400);

// (1) post-partita → mixed zone 3D montata
const r1 = await page.evaluate(() => window.__CPM_CAREER.forceInterview('win'));
await sleep(1500);
const st1 = await page.evaluate(() => { const ovs = [...document.querySelectorAll('div')].filter(d => d.style && d.style.zIndex === '9999' && d.style.position === 'fixed'); return { modal: ovs.length > 0, canvas: ovs.some(o => o.querySelector('canvas')), q: ovs.some(o => /Intervista/i.test(o.innerText)) }; });/* più overlay z-9999 possibili: si cerca in TUTTI */
console.log('(1) post-partita:', JSON.stringify({ force: r1, ...st1 }));
if (r1 !== true) issues.push('(1) forceInterview fallita: ' + r1);
if (!st1.modal) issues.push('(1) modal intervista assente');
if (!st1.canvas) issues.push('(1) canvas mixed zone 3D ASSENTE dietro il modal');
await page.screenshot({ path: 'out/interview-3d.png' });

// (2) risposta → chiusura → canvas smontato
try { await page.getByRole('button').filter({ hasText: /Diplomatico|Ambizioso|Umile/ }).first().click({ timeout: 5000 }); } catch (e) { issues.push('(2) bottone risposta non trovato'); }
await sleep(2600);
const st2 = await page.evaluate(() => { const ovs = [...document.querySelectorAll('div')].filter(d => d.style && d.style.zIndex === '9999' && d.style.position === 'fixed'); return { interview: ovs.some(o => /Intervista/i.test(o.innerText)), canvasAnywhere: ovs.some(o => o.querySelector('canvas')) }; });
console.log('(2) dopo la risposta:', JSON.stringify(st2));
if (st2.canvasAnywhere) issues.push('(2) canvas 3D non smontato dopo la chiusura');

// (3) pre-partita → niente canvas
const r3 = await page.evaluate(() => { try { const C = window.__CPM_CAREER; return C.forceInterview ? (() => { const iw = { q: { q: 'Come arrivate alla sfida?' } }; return 'manual'; })() : 'no'; } catch (e) { return 'err'; } });
await page.evaluate(() => window.__CPM_CAREER.forceInterview('prematch'));
await sleep(1200);
const st3 = await page.evaluate(() => { const ovs = [...document.querySelectorAll('div')].filter(d => d.style && d.style.zIndex === '9999' && d.style.position === 'fixed'); return { modal: ovs.some(o => /Conferenza|Intervista/i.test(o.innerText)), canvas: ovs.some(o => o.querySelector('canvas')) }; });
console.log('(3) prematch:', JSON.stringify(st3));
if (st3.modal && st3.canvas) issues.push('(3) mixed zone montata anche PRE-partita');

// (4) [7.299.0] la FIGURA in mixed zone deve avere il genere del NOME mostrato nel modal
{
  /* Collaudo PO «l'intervistatrice non è una donna! occhio alla coerenza!»: il nome veniva dal pool dei
     giornalisti, il genere della figura 3D da un lancio di moneta sul seed → una volta su due la giornalista
     era resa come uomo. Il genere ora è un dato del pool e la scena lo riceve: qui si verifica che il legame
     esista nel codice e che il pool tagghi le giornaliste. */
  const src = await (await import('node:fs/promises')).readFile(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
  const i0 = src.indexOf('function InterviewStage3D'), i1 = src.indexOf('function GalaStage3D');
  const scena = src.slice(i0, i1);
  const legato = /journalistIsFemale\(jName\)/.test(scena) && /jName=null/.test(scena);
  const passato = /jName=\{\(interviewModal\.paper/.test(src);
  const donne = await page.evaluate(() => (window.JOURNALIST_POOL || []).filter(j => j && j.f).map(j => j.name));
  const genere = await page.evaluate(() => (window.journalistIsFemale ? [window.journalistIsFemale('Anna Lombardi'), window.journalistIsFemale('Marco Ferretti'), window.journalistIsFemale('Nome Ignoto')] : null));
  console.log(`(4) genere legato al nome: ${legato} · prop passata dal modal: ${passato} · giornaliste nel pool: ${donne.join(', ') || '(nessuna)'} · lookup [Anna, Marco, ignoto]: ${JSON.stringify(genere)}`);
  if (!legato) issues.push('(4) la scena decide il genere col seed invece che dal nome mostrato');
  if (!passato) issues.push('(4) il nome del giornalista non arriva alla scena 3D');
  if (!donne.length) issues.push('(4) nessuna giornalista taggata nel pool: il lookup non può funzionare');
  if (!genere || genere[0] !== true || genere[1] !== false || genere[2] !== null) issues.push(`(4) lookup del genere errato: ${JSON.stringify(genere)}`);
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ INTERVISTA 3D OK (mixed zone post-partita · dispose · prematch escluso)');
process.exit(issues.length ? 1 : 0);
