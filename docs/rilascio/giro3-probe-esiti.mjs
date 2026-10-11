#!/usr/bin/env node
/* GIRO 3 · PUNTO 1 «Esiti diversi con lo stesso seme» — un giro = UNA partita vera (pagina nuova, contesto nuovo).
   Uso: node giro3-probe-esiti.mjs <etichetta> <auto|noauto> <file-log>
   - stesso salvataggio (fixtures/save-190-s12-ovr93.json), stesso nome (dal salvataggio), stessa velocita' (cpm-match-speed=1),
     stesso seme di autoplay (2021, policy seeded, tickMs 150) quando auto.
   - registra: punteggio (__CPM_SCORE), transizioni di fase con minuto (__CPM_PHASE/__CPM_CLOCK), numero highlight
     (__CPM_NUMHL), calendario highlight (__CPM_HLTIMES), registro scene (__CPM_TIMELINE: HighlightForced/ActionResolved),
     registro eventi (__CPM_EV, senza ts/t che sono tempo reale), e conteggi di overflow dei ring buffer (MATCH_TL 500, MATCH_EV 400).
   Esplorativa: non asserisce. Il confronto fra giri si fa in un passo separato. Stampa righe JSON taggate GIRO3:*. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const [, , LABEL = 'run', MODE = 'auto', LOGFILE = ''] = process.argv;
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const out = [];
const log = (s) => { out.push(s); console.log(s); };
const t0 = Date.now();
const srv = await startServer();
const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await installCdnRoutes(page);
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + String(e.message).slice(0, 160)));
const RSEED = process.env.GIRO3_RANDSEED ? (process.env.GIRO3_RANDSEED | 0) : null; // prova: Math.random sostituito da un PRNG seminato (nessuna modifica al gioco)
await page.addInitScript(([s, rs]) => { if (rs !== null) { let a = rs >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; } window.__CPM_GLB = false; localStorage.setItem('cpm-match-speed', '1'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, RSEED]);
log(`GIRO3:meta ${JSON.stringify({ randseed: process.env.GIRO3_RANDSEED || null, label: LABEL, mode: MODE, save: 'save-190-s12-ovr93.json', speed: 1, seed: MODE === 'auto' ? 2021 : null, policy: MODE === 'auto' ? 'seeded' : null, tickMs: MODE === 'auto' ? 150 : null, cpmtest: 1, glb: 0 })}`);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
const tStart = Date.now();
if (MODE === 'auto') await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2021, policy: 'seeded', tickMs: 150 }));

// campionamento: transizioni di fase col minuto
const transizioni = [];
let last = '';
let ph = '';
const limite = 420000;
while (Date.now() - tStart < limite) {
  ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  if (ph !== last) {
    const ck = await page.evaluate(() => window.__CPM_CLOCK && window.__CPM_CLOCK()).catch(() => null);
    transizioni.push({ fase: ph, min: ck, s: Math.round((Date.now() - tStart) / 1000) });
    last = ph;
  }
  if (ph === 'ended' || ph === 'ceremony') break;
  await sleep(500);
}
const durata = Math.round((Date.now() - tStart) / 1000);
log(`GIRO3:fasi ${JSON.stringify(transizioni)}`);
const score = await page.evaluate(() => window.__CPM_SCORE ? window.__CPM_SCORE() : null).catch(() => null);
log(`GIRO3:score ${JSON.stringify(score)} fine_fase=${ph} durata_reale_s=${durata}`);
const numHL = await page.evaluate(() => window.__CPM_NUMHL ? window.__CPM_NUMHL() : null).catch(() => null);
const hlT = await page.evaluate(() => window.__CPM_HLTIMES ? window.__CPM_HLTIMES() : null).catch(() => null);
log(`GIRO3:hl ${JSON.stringify({ numHL, hlTimes: hlT })}`);
const tl = await page.evaluate(() => window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).catch(() => []);
const tlPulita = (tl || []).map(e => { const o = { ...e }; delete o.t; return o; });
log(`GIRO3:timeline n=${tlPulita.length} ${JSON.stringify(tlPulita)}`);
const ev = await page.evaluate(() => window.__CPM_EV ? window.__CPM_EV() : []).catch(() => []);
const evPulito = (ev || []).map(e => { const o = { ...e }; delete o.ts; return o; });
log(`GIRO3:ev n=${evPulito.length} ${JSON.stringify(evPulito)}`);
log(`GIRO3:ring timeline=${tl.length}/500 ev=${ev.length}/400`);
log(`GIRO3:errori ${JSON.stringify(errs)}`);
await b.close();
srv.close();
if (LOGFILE) fs.writeFileSync(LOGFILE, out.join('\n') + '\n');
