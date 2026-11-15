#!/usr/bin/env node
import fs from 'node:fs';
/* [giro 204 PO-450] sonda: durante la lotteria dei rigori, quali elementi del DOM con «90'» (o un minuto) stanno DIETRO il tabellone
   «CALCI DI RIGORE» ed escono visibili (opacita' > 0, dentro il rettangolo del tabellone). Foto opzionale CPM_FOTO=<file.png>. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
export async function misura90(browser, port, { rosso = false, rosso208 = false, foto = null, viewport = { width: 375, height: 812 } } = {}) {
  const mkSave = () => ({ phase: 'career', player: { name: 'Lotteria Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
    cup: { active: true, round: 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
    calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 2, cupRoundName: 'Ottavi' }],
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
    form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } });
  const pg = await browser.newPage({ viewport }); await installCdnRoutes(pg);
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.addInitScript(([sv, r, r8]) => { if (r) window.__CPM_NO_G204 = 1; if (r8) window.__CPM_NO_G208 = 1; window.__CPM_SB204 = null; window.__CPM_SB208 = null; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, [mkSave(), rosso, rosso208]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 8080, policy: 'seeded', tickMs: 300 }));
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
  await sleep(1500);
  await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE());
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'shootout', null, { timeout: 20000 }).catch(() => {});
  const campioni = [];
  for (let i = 0; i < 10; i++) {
    await sleep(600);
    const r = await pg.evaluate(() => {
      const tab = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /CALCI DI RIGORE/.test(d.textContent));
      if (!tab) return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), tab: false };
      const b = tab.parentElement.getBoundingClientRect();
      const so = window.__CPM_SO_STATE && window.__CPM_SO_STATE(); return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), tab: true, sb: window.__CPM_SB204, sb8: window.__CPM_SB208, serie: so ? so.hs + ' - ' + so.as : null, box: { x: Math.round(b.left), y: Math.round(b.top), width: Math.round(b.width), height: Math.round(b.height) } };
    });
    if (r.tab && r.ph === 'shootout' && i % 3 === 1) {
      /* misura sui pixel: tolto per un istante il tabellone DOM, quanti pixel del giallo del minuto (#ffd24a) stanno nel suo rettangolo */
      await pg.evaluate(() => { const t = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /CALCI DI RIGORE/.test(d.textContent)); t.parentElement.style.visibility = 'hidden'; });
      const png = await pg.screenshot({ clip: r.box }); if (process.env.CPM_CLIP) fs.writeFileSync(process.env.CPM_CLIP + i + '.png', png);
      await pg.evaluate(() => { const t = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /CALCI DI RIGORE/.test(d.textContent)); if (t) t.parentElement.style.visibility = ''; });
      r.giallo = await pg.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
        const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0, w = 0;
        for (let k = 0; k < d.length; k += 4) { const X = (k / 4) % c.width, Y = Math.floor(k / 4 / c.width); if (X < 0.3 * c.width || X > 0.8 * c.width || Y < 0.2 * c.height || Y > 0.68 * c.height) continue; /* la fascia sotto il punteggio, sopra la folla */ const R = d[k], G = d[k + 1], B = d[k + 2]; if (R > 150 && G > 140 && R - B > 45 && G - B > 35 && R >= G) n++; if (R > 170 && G > 170 && B > 170 && Math.max(R, G, B) - Math.min(R, G, B) < 40) w++; } return [n, w]; }, png.toString('base64'));
      r.bianco = r.giallo[1]; r.giallo = r.giallo[0];/* [giro 208] i pixel bianchi della scritta «RIGORI» nella stessa fascia */
    }
    campioni.push(r);
    if (foto && i === 3) await pg.screenshot({ path: foto });
  }
  /* [giro 208 PO-468] la serie si segue fino alla fine: il maxischermo deve dire «RIGORI» e il punteggio della serie a ogni tiro.
     Si legge il testimone (cosa e' stato disegnato) e lo stato vero della serie nello stesso istante; il disegno arriva al fotogramma
     dopo il cambio di stato, quindi il confronto e' «ogni punteggio disegnato e' un punteggio che la serie ha avuto». */
  const serie = [];
  for (let i = 0; i < 60; i++) { await sleep(700);
    const q = await pg.evaluate(() => { const so = window.__CPM_SO_STATE && window.__CPM_SO_STATE(); return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), sb8: window.__CPM_SB208, serie: so ? so.hs + ' - ' + so.as : null, done: so ? so.done : null }; });
    if (q.ph !== 'shootout') break; serie.push(q); if (q.done) break; }
  await pg.close();
  const tutti = campioni.filter(c => c.tab && c.ph === 'shootout').concat(serie);
  const statiSerie = new Set(tutti.map(c => c.serie).filter(Boolean));
  const conSb = tutti.filter(c => c.sb8);
  const giud = campioni.filter(c => c.tab && c.ph === 'shootout');
  const px = giud.filter(c => c.giallo != null);
  return { errs: errs.length, giudicati: giud.length, minutoDisegnato: giud.filter(c => c.sb != null && c.sb >= 0).length, senzaMinuto: giud.filter(c => c.sb === -1).length,
    pixelGiudicati: px.length, pixelGialliMax: px.length ? Math.max(...px.map(c => c.giallo)) : null,
    pixelBianchiMin: px.length ? Math.min(...px.map(c => c.bianco)) : null, pixelBianchiMax: px.length ? Math.max(...px.map(c => c.bianco)) : null,
    serieGiudicati: conSb.length, maxischermoRigori: conSb.filter(c => c.sb8.modo === 'rigori').length, maxischermoPartita: conSb.filter(c => c.sb8.modo === 'partita').length,
    punteggiDisegnati: [...new Set(conSb.filter(c => c.sb8.modo === 'rigori').map(c => c.sb8.punteggio))], statiSerie: [...statiSerie],
    disegnatiFuoriSerie: conSb.filter(c => c.sb8.modo === 'rigori' && !statiSerie.has(c.sb8.punteggio)).length,
    ultimoDisegnato: conSb.length ? conSb[conSb.length - 1].sb8.punteggio : null, ultimaSerie: tutti.length ? tutti[tutti.length - 1].serie : null };
}
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith("/sonda-90-204.mjs")) {
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  const r = await misura90(browser, port, { rosso: !!process.env.CPM_ROSSO, rosso208: !!process.env.CPM_ROSSO208, foto: process.env.CPM_FOTO || null });
  console.log(JSON.stringify(r)); await browser.close(); srv.close();
}
