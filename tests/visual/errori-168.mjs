#!/usr/bin/env node
/* [PO-168 parte C + PO-167 parte B · giro 62, 7.999.173] GUARDIANO DEL REGISTRO DEGLI ERRORI E DELLA MEMORIA PERSISTENTE.
 *   1) un errore fuori da React (setTimeout) e una promessa rifiutata finiscono in `cpm-errlog`;
 *      un rifiuto di audio.play() (NotAllowedError) NON ci finisce (politica del browser, non un guasto);
 *   2) un errore di render in una scheda (hook __CPM_CRASH168) mostra la schermata di recupero con
 *      «Esporta registro errori» e lascia la voce «schermata» nel registro;
 *   3) il taccuino (Impostazioni → Appunti di collaudo) mostra il registro e «Esporta registro» scarica un JSON
 *      con errori e appunti;
 *   4) all'avvio il gioco chiede la memoria persistente (navigator.storage.persist).
 * Prova del rosso: CPM_ROSSO=1 arma __CPM_NO_ERR168 + __CPM_NO_PERSIST167 → il guardiano DEVE uscire 1.
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';

const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = []; const esiti = [];
const ok = (cond, msg) => { esiti.push((cond ? '✓ ' : '✗ ') + msg); if (!cond) guasti.push(msg); };
const SAVE = { phase: 'career', player: {
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4,
  tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  name: 'Registro Test', nation: 'Italia', avatarId: 0, age: 22, position: 'ATT', foot: 'R', season: 4, week: 6,
  proStatus: 'pro', ovr: 78,
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 70, morale: 70, fatigue: 10, popularity: 50, value: 20, bankBalance: 1000, goals: 5, assists: 2, matches: 10,
  contract: { duration: 3, wage: 30000, expiresAtSeason: 8 } } };

const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await ctx.newPage();
await installCdnRoutes(page);
await page.addInitScript(cfg => {
  window.__CPM_GLB = false;
  if (cfg.rosso) { window.__CPM_NO_ERR168 = 1; window.__CPM_NO_PERSIST167 = 1; }
  if (!sessionStorage.getItem('seme168')) { sessionStorage.setItem('seme168', '1'); localStorage.setItem('cpm-v3', JSON.stringify(cfg.sv)); localStorage.setItem('cpm-devtools', '1'); }
}, { sv: SAVE, rosso: ROSSO });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
const reg = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-errlog') || '[]'); } catch (e) { return []; } });

/* 4) memoria persistente */
const pers = await page.evaluate(() => window.__CPM_PERSIST167 || null);
ok(!!(pers && pers.chiesto), `all'avvio si chiede la memoria persistente: ${JSON.stringify(pers)}`);

/* 1) errori fuori da React */
await page.evaluate(() => {
  setTimeout(() => { throw new Error('prova-168-sync'); }, 10);
  Promise.reject(new Error('prova-168-promise'));
  const na = new Error('play() negato'); na.name = 'NotAllowedError'; Promise.reject(na);
});
await sleep(800);
let r = await reg();
ok(r.some(e => e.kind === 'errore' && /prova-168-sync/.test(e.msg)), 'errore in un setTimeout: registrato');
ok(r.some(e => e.kind === 'promessa' && /prova-168-promise/.test(e.msg)), 'promessa rifiutata: registrata');
ok(!r.some(e => /play\(\) negato/.test(e.msg)), 'rifiuto audio.play() (NotAllowedError): NON registrato');
ok(r.every(e => e.v && e.t), 'ogni voce porta versione e ora');

/* 3) taccuino: il registro si vede e si esporta */
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1500);
await page.locator('button[title="Impostazioni"]').first().click();/* il taccuino vive nelle Impostazioni (7.92.0) */
await sleep(1200);
const vis = await page.locator('[data-cpm="errlog-168"]').count();
ok(vis > 0, 'il taccuino (Impostazioni → Appunti di collaudo) mostra il registro degli errori');
if (vis) {
  try {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 6000 }), page.locator('[data-cpm="errlog-168"]').getByText('Esporta registro', { exact: false }).click()]);
    const f = await dl.path(); const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    ok(j._korwardLog === 1 && Array.isArray(j.errori) && j.errori.length >= 2 && Array.isArray(j.appunti), `«Esporta registro» scarica il JSON (${dl.suggestedFilename()}, ${j.errori.length} errori)`);
  } catch (e) { ok(false, '«Esporta registro» scarica il JSON: ' + String(e.message).slice(0, 80)); }
}

/* 2) errore di render in una scheda */
await page.evaluate(() => { window.__CPM_CRASH168 = 'dashboard'; window.__CPM_CAREER.goTab('dashboard'); });
await sleep(1500);
const crash = await page.evaluate(() => document.body.innerText.includes('Qualcosa è andato storto'));
ok(crash, 'errore di render: compare la schermata di recupero (niente pagina bianca)');
ok(await page.locator('[data-cpm="crash-log-168"]').count() > 0, 'la schermata di recupero offre «Esporta registro errori»');
r = await reg();
ok(r.some(e => e.kind === 'schermata' && /prova-168: errore di render/.test(e.msg) && e.extra), 'errore di render: registrato con lo stack dei componenti');
ok(r.length <= 40, `registro limitato a 40 voci (${r.length})`);

await ctx.close(); await b.close(); srv.close();
console.log(`\nerrori-168 ${ROSSO ? '(ROSSO: __CPM_NO_ERR168 + __CPM_NO_PERSIST167)' : '(verde)'}`);
for (const e of esiti) console.log('  ' + e);
console.log(guasti.length ? `\n✗ errori-168: ${guasti.length} controlli rossi` : '\n✓ errori-168: VERDE');
process.exit(guasti.length ? 1 : 0);
