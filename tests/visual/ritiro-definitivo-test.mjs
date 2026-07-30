#!/usr/bin/env node
/* [7.258.0 collaudo PO «dopo il ritiro non deve essere possibile tornare indietro!»] RITIRO DEFINITIVO.
   Il ritiro era solo stato locale (screen) → al reload il save rientrava in dashboard. Ora:
   (1) il ritiro via UI PERSISTE `retired:true` nell'autosave;
   (2) un save ritirato RENDERIZZA SEMPRE la pagina celebrativa (CareerEndScreen) — anche con
       auto-ripresa attiva (cpm-active) — e MAI la dashboard;
   (3) in Home lo slot ritirato mostra «Carriera conclusa» + CTA «Rivivi il finale» (non «Continua/W.x»);
   (4) controprova: un save NON ritirato continua ad aprire la dashboard. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (retired) => ({ phase: 'career', player: { name: 'Ritiro Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 9, week: 10, weekLived: false, age: 36, ovr: 79, tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 9, presidentModalSeason: 9, seasonPledge: { season: 9, tone: 'equilibrato' }, drawSeen: 9,
  ...(retired ? { retired: true } : {}),
  history: [1, 2, 3, 4, 5, 6].map(i => ({ season: i, club: 'FC Salernum', clubId: 'sal', goals: 14, assists: 4, matches: 30, ovr: 72 + i, league: 'Lega B' })),
  totalGoals: 84, totalMatches: 180, trophies: [{ season: 3, club: 'FC Salernum', league: 'Lega B' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 74, tecnica: 78, fisico: 72, 'mentalità': 82, tiro: 80, passaggio: 78, dribbling: 76, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 70, contract: { duration: 1, wage: 9000, expiresAtSeason: 10 } } });

const boot = async (save, { active = null, test = true } = {}) => {
  /* l'auto-ripresa (cpm-active) è DISATTIVATA sotto ?cpmtest=1 (7.149.0) → gli scenari che la
     esercitano bootano in modalità REALE (test:false) */
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript(([sv, act]) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); if (act != null) localStorage.setItem('cpm-active', act); localStorage.setItem('cpm-intro-seen', '1'); }, [save, active]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${test ? '?cpmtest=1' : ''}`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1600);
  return page;
};
const hasTxt = (page, rx) => page.evaluate((x) => new RegExp(x, 'i').test(document.body.innerText), rx);
const clickBtn = (page, rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return true; } return false; }, rx);

// ───── (1) ritiro via UI → il flag è PERSISTITO nell'autosave
{
  const pg = await boot(mkSave(false));
  await clickBtn(pg, '^Continua →$|^Continua'); await sleep(1200);
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await pg.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(400);
  for (const nav of ['Carriera', 'Profilo']) { await clickBtn(pg, '^' + nav + '$|^👤?\\s*' + nav); await sleep(700); }
  const r1 = await clickBtn(pg, 'Ritirati →|Ritirati$'); await sleep(700);
  const r2 = await clickBtn(pg, 'Ritirati con onore'); await sleep(2200);
  const cer = await hasTxt(pg, 'Grazie, Ritiro Probe');
  const persisted = await pg.evaluate(() => { try { const d = JSON.parse(localStorage.getItem('cpm-v3')); return !!(d && d.player && d.player.retired); } catch (e) { return false; } });
  console.log('(1) flusso ritiro:', r1 && r2, '· cerimonia:', cer, '· retired persistito:', persisted);
  if (!(r1 && r2)) issues.push('flusso ritiro non raggiunto');
  if (!cer) issues.push('cerimonia non mostrata dopo il ritiro');
  if (!persisted) issues.push('retired:true NON persistito nell\'autosave');
  await pg.close();
}

// ───── (2) save ritirato + auto-ripresa → SEMPRE pagina celebrativa, MAI dashboard
{
  const pg = await boot(mkSave(true), { active: '0', test: false });
  const celeb = await hasTxt(pg, 'Grazie, Ritiro Probe|Fine Carriera|lettera d.addio');
  const dash = await hasTxt(pg, 'Vivi la Settimana|LA TUA SETTIMANA|Avanza Settimana');
  console.log('(2) auto-ripresa su save ritirato — celebrativa:', celeb, '· dashboard visibile:', dash);
  if (!celeb) issues.push('save ritirato NON atterra sulla pagina celebrativa (auto-ripresa)');
  if (dash) issues.push('save ritirato mostra ANCORA la dashboard (si può tornare indietro!)');
  await pg.close();
}

// ───── (3) Home: slot ritirato = badge + «Rivivi il finale», e il load atterra sulla celebrativa
{
  const pg = await boot(mkSave(true));
  const badge = await hasTxt(pg, 'Carriera conclusa');
  const cta = await hasTxt(pg, 'Rivivi il finale');
  const noWeek = !(await hasTxt(pg, 'W\\.10/38'));
  console.log('(3) Home — badge:', badge, '· CTA rivivi:', cta, '· niente W.x/38:', noWeek);
  if (!badge) issues.push('badge «Carriera conclusa» assente in Home');
  if (!cta) issues.push('CTA «Rivivi il finale» assente in Home');
  if (!noWeek) issues.push('lo slot ritirato mostra ancora la settimana da giocare');
  await clickBtn(pg, 'Rivivi il finale'); await sleep(2000);
  const celeb = await hasTxt(pg, 'Grazie, Ritiro Probe|Fine Carriera|lettera d.addio');
  const dash = await hasTxt(pg, 'Vivi la Settimana|LA TUA SETTIMANA|Avanza Settimana');
  console.log('(3) load slot ritirato — celebrativa:', celeb, '· dashboard:', dash);
  if (!celeb || dash) issues.push('il load dello slot ritirato non atterra (solo) sulla celebrativa');
  await pg.close();
}

// ───── (4) controprova: save NON ritirato → dashboard normale
{
  const pg = await boot(mkSave(false), { active: '0', test: false });
  const dash = await hasTxt(pg, 'Vivi la Settimana|LA TUA SETTIMANA|Avanza Settimana|Gioca');
  const celeb = await hasTxt(pg, 'Grazie, Ritiro Probe');
  console.log('(4) controprova non-ritirato — dashboard:', dash, '· celebrativa:', celeb);
  if (!dash) issues.push('controprova: il save normale non apre più la dashboard');
  if (celeb) issues.push('controprova: il save normale mostra la cerimonia di ritiro');
  await pg.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PASS — il ritiro è definitivo: flag persistito, atterraggio sulla celebrativa, Home coerente');
