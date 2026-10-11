#!/usr/bin/env node
/* [COLLAUDO PO-225 · sessione collaudatrice] Ingresso in campo con GLB ACCESO (__CPM_GLB=true) a 375 px. La grafica TV pre-partita
   (data-cpm="tv225") deve uscire in dissolvenza dopo 4 s. Si campiona l'opacita' letta a getComputedStyle a 6 istanti del tempo
   d'animazione 0..10 s (Animation.currentTime dell'animazione tvOut225: indipendente dagli fps headless).
   VERDE: opacita' 1 fino a 4 s, poi in calo, a 6 s ~0. ROSSO __CPM_NO_TV225=1: resta a 1. Uso: ARM=verde|rosso node collaudo-po225.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ARM = process.env.ARM === 'rosso' ? 'rosso' : 'verde', OUT = process.env.OUT || '/tmp/cpm158/collaudo-out';
fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const mkSave = () => ({ phase: 'career', player: { name: 'Collaudo TV', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4,
  cup: { active: true, round: 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
  calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 2, cupRoundName: 'Ottavi' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } });

const pg = await browser.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(pg);
const errors = []; pg.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await pg.addInitScript(([sv, rosso]) => { window.__CPM_GLB = true; if (rosso) window.__CPM_NO_TV225 = 1; localStorage.setItem('cpm-v3', JSON.stringify(sv));
  /* registratore per fotogramma: ogni rAF legge l'opacita' della grafica e il tempo d'animazione della sua uscita */
  window.__TV225 = []; window.__TV225t0 = null;
  const f = () => { try { const el = document.querySelector('[data-cpm=tv225]'); if (el) { if (window.__TV225t0 == null) window.__TV225t0 = performance.now();
    const an = el.getAnimations ? el.getAnimations().find(a => a.animationName === 'tvOut225') : null;
    if (window.__TV225.length < 4000) window.__TV225.push([Math.round(performance.now() - window.__TV225t0), an ? Math.round(an.currentTime || 0) : null, Number(getComputedStyle(el).opacity)]); } } catch (e) {} requestAnimationFrame(f); };
  requestAnimationFrame(f); }, [mkSave(), ARM === 'rosso']);
await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1000);
for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
  await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
// arrivo al walkout come fa ingresso-59: si preme il passo di formazione finche' la fase non diventa walkout
let fase = null;
for (let i = 0; i < 200; i++) { fase = await pg.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
  if (fase === 'walkout') break;
  if (fase === 'matchday' || fase === 'formations') await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Formazioni|Entra in campo|Scendi in campo|In campo|Avanti|Continua/i.test(x.textContent || '')); if (b) b.click(); });
  await sleep(400); }
const frames = [];
if (fase === 'walkout') {
  // in headless con GLB il rendering scorre a pochi fps: il fotogramma reale non basta. Si ferma l'animazione della grafica e
  // si legge l'opacita' calcolata a ogni istante del tempo d'animazione (lettura deterministica, indipendente dagli fps)
  const got = await pg.evaluate(async () => {
    for (let k = 0; k < 300; k++) { if (document.querySelector('[data-cpm=tv225]')) break; await new Promise(r => setTimeout(r, 50)); }
    const el = document.querySelector('[data-cpm=tv225]'); if (!el) return null;
    const ans = el.getAnimations(); ans.forEach(a => a.pause());
    const dettaglio = ans.map(a => a.animationName);
    const pts = [0, 2000, 4000, 4500, 4900, 6000, 8000, 10000];
    const letti = pts.map(t => { ans.forEach(a => { a.currentTime = t; }); return { tSec: t / 1000, opacita: Number(getComputedStyle(el).opacity) }; });
    return { animazioni: dettaglio, letti };
  });
  if (!got) frames.push({ nota: 'grafica tv225 non presente in walkout' });
  else { got.letti.forEach(x => frames.push({ tSec: x.tSec, opacita: Number(x.opacita.toFixed(3)) })); frames.push({ animazioni: got.animazioni }); }
} else { frames.push({ nota: 'walkout non raggiunto', fase }); }
const esito = { ARM, fase, frames, pageerror: errors.length, primoErrore: errors[0] || null };
fs.writeFileSync(path.join(OUT, `po225-${ARM}.json`), JSON.stringify(esito, null, 1));
console.log(JSON.stringify(esito));
await pg.screenshot({ path: path.join(OUT, `po225-${ARM}-ultimo.png`) }).catch(() => {});
await browser.close(); srv.close();
