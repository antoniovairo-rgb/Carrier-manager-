#!/usr/bin/env node
/* GIRO 4 · PO-218 «esito dell'eroe coerente» · sonda di collaudo (sola lettura sul gioco).
   Gioca partite VERE dal salvataggio (autoplay, seme fisso per partita, nome del giocatore diverso per partita)
   con window.__CPM_REC=true e window.__CPM_PRESENT=1 armati prima del caricamento.
   Per ogni scena risolta registra il testimone __CPM_RES218 (hl, key, ok, outKind, fam, ovl, ev) e la riga di
   cronaca successiva letta ALLA SORGENTE (__CPM_TXT487, pushata in buildPlayback/BG; non dal DOM).
   Campionamento: poll ogni POLL_MS; una riga di cronaca è «successiva» alla scena se compare in un poll
   uguale o successivo a quello in cui la scena è apparsa (granularità = POLL_MS).
   Uso: node probe-giro4.mjs <jobs.json> <cartella-output>
   jobs.json = [{ "id":"p01", "name":"Nome Cognome", "seed":1234, "fixture":"save-190-s12-ovr93.json" }, ...] */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '/tmp/cpm157/tests/visual/lib/harness.mjs';

const FIX = '/tmp/cpm157/tests/visual/fixtures';
const [, , jobsFile, outDir] = process.argv;
if (!jobsFile || !outDir) { console.error('uso: node probe-giro4.mjs <jobs.json> <outDir>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
const POLL_MS = 400;
const srv = await startServer(); const b = await launchBrowser();
const port = srv.address().port;

for (const job of jobs) {
  const t0 = Date.now();
  const save = JSON.parse(fs.readFileSync(path.join(FIX, job.fixture), 'utf8'));
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = job.name;
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(([s]) => {
    window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_TXT487 = null;
    localStorage.setItem('cpm-match-speed', '2'); localStorage.setItem('cpm-v3', JSON.stringify(s));
  }, [sv]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), job.seed);

  // Campionamento: scene (RES218) e righe di cronaca (TXT487) con il numero di poll in cui appaiono.
  const scene = []; const righe = []; let nS = 0, nT = 0, poll = 0, ph = '';
  const tEnd = Date.now() + 420000;
  while (Date.now() < tEnd) {
    poll++;
    const snap = await page.evaluate(() => ({
      phase: window.__CPM_PHASE ? window.__CPM_PHASE() : null,
      res: window.__CPM_RES218 || [],
      txt: window.__CPM_TXT487 || [],
    }));
    ph = snap.phase;
    for (let i = nS; i < snap.res.length; i++) scene.push({ poll, ...snap.res[i] });
    for (let i = nT; i < snap.txt.length; i++) righe.push({ poll, ...snap.txt[i] });
    nS = snap.res.length; nT = snap.txt.length;
    if (ph === 'ended' || ph === 'ceremony') break;
    await sleep(POLL_MS);
  }
  // Abbinamento: per ogni scena la prima riga con poll >= poll della scena (cronaca successiva).
  const conRiga = scene.map(s => {
    const r = righe.find(x => x.poll >= s.poll);
    return { ...s, successiva: r ? { m: r.m, txt: r.txt, pd: r.pd, ef: r.ef, poll: r.poll } : null };
  });
  const out = { id: job.id, name: job.name, seed: job.seed, fixture: job.fixture, fine: ph,
    polls: poll, secondi: Math.round((Date.now() - t0) / 1000), scene: conRiga, righeTotali: righe.length };
  fs.writeFileSync(path.join(outDir, `${job.id}.json`), JSON.stringify(out, null, 1));
  console.log(`${job.id} ${job.name} fine=${ph} scene=${scene.length} nonRiuscite=${scene.filter(s => !s.ok).length} righe=${righe.length} ${out.secondi}s`);
  await ctx.close();
}
await b.close(); srv.close();
