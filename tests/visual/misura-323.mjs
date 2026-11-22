#!/usr/bin/env node
/* [giro 323 · PO-356 proposta B] SONDA misura-323 — con che probabilita' e quando un giocatore di Primavera cambia
   club a stagione in corso. Gioca una stagione di Primavera intera sugli handler veri (__CPM_CAREER.step: settimana
   vissuta → Simula → Avanza, i tre percorsi) per i profili OVR 58/66/74 e tre semi (nomi diversi) ciascuno.
   Ogni volta che compare l'offerta (riquadro [data-cpm="offerta23"]) la registra e la ACCETTA (il giocatore che vuole
   salire): conta quindi «offerta ricevuta» = «salto possibile». Non giudica: stampa e scrive out/misura-323.json.
   Nessuna attesa a tempo fisso: dopo ogni passo si aspetta che lo stato cambi (settimana/vissuta/schermata/finestra).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node misura-323.mjs
   Variabili: CPM_OVR=58,66,74 · CPM_SEMI=3 · CPM_ROSSO323=1 (accende __CPM_NO_G323 = comportamento 7.999.202) */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
import fs from 'fs';

const OVRS = (process.env.CPM_OVR || '58,66,74').split(',').map(Number);
const SEMI = +(process.env.CPM_SEMI || 3);
const ROSSO = process.env.CPM_ROSSO323 === '1';

function savePlayer(ovr, nome) {
  const s = ovr;
  return { name: nome, nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, weekLived: false, age: 17, ovr, tutorialDone: true, position: 'Attaccante',
    campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1,
    club: { id: 'milan', n: 'FC Rossoneri Primavera', a: 'RSN', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
    stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 70, fatigue: 10, coachTrust: 60, contract: { duration: 1, wage: 200 }, matchHistory: [] };
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const sig = () => { try { const C = window.__CPM_CAREER; const g = C.get(); return [g.week, g.lived, g.screen, !!document.querySelector('[data-cpm="offerta23"]'), g.club, JSON.stringify(C.snapshot().transferSaga || null).length].join('|'); } catch (e) { return 'x'; } };

async function corsa(ovr, k) {
  const nome = ['Sonda Aldo', 'Sonda Bruno', 'Sonda Carlo', 'Sonda Dario', 'Sonda Elio'][k] || ('Sonda ' + k);
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, rosso]) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G323 = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [savePlayer(ovr, nome), ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER && !!window.__CPM_CAREER.get, { timeout: 30000 });
  const eventi = [], passiTipo = []; let ip19, salto = null, passi = 0, saghe = [];
  while (passi++ < 220) {
    const st = await page.evaluate(() => { const C = window.__CPM_CAREER, g = C.get(), p = C.snapshot();
      return { w: g.week, s: g.season, scr: g.screen, pro: p.proStatus, club: p.club && p.club.n, off: !!document.querySelector('[data-cpm="offerta23"]'), saga: p.transferSaga ? { w: p.transferSaga.week, club: p.transferSaga.club, del: !!p.transferSaga.delivered } : null, ip: (C.ip153() || {}).valore, salto323: p.salto323 || null }; });
    if (st.saga && !saghe.some(x => x.w === st.saga.w)) saghe.push(st.saga);
    if (st.w >= 19 && ip19 === undefined) ip19 = st.ip ?? null;
    if (st.pro !== 'u18') { salto = salto || { w: st.w, club: st.club, ip: st.ip }; break; }
    if (st.s > 1 || st.w > 38 || st.scr === 'proTransition' || st.scr === 'seasonEnd') break;
    if (st.off) {
      const o = await page.evaluate(() => { const t = document.querySelector('[data-cpm="offerta23"]'); return t ? t.innerText.slice(0, 160).replace(/\s+/g, ' ') : ''; });
      eventi.push({ w: st.w, tipo: 'offerta', ip: st.ip, testo: o });
      const s0 = await page.evaluate(sig);
      await page.evaluate(() => window.__CPM_CAREER.acceptOffer());
      await page.waitForFunction(s => (() => { try { return window.__CPM_CAREER.snapshot().proStatus !== 'u18'; } catch (e) { return false; } })(), s0, { timeout: 20000 }).catch(() => {});
      continue;
    }
    if (st.scr !== 'dashboard' && st.scr !== 'home') { await page.evaluate(() => window.__CPM_CAREER.goScreen('dashboard')); }
    const s0 = await page.evaluate(sig);
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; let r = C.step(); try { C.scegli && C.scegli(0); } catch (e) {} if (!document.querySelector('[data-cpm="offerta23"]')) { /* le finestre che non sono l'offerta si chiudono come il giocatore che legge */ } return r; });
    await page.waitForFunction(s => { try { const C = window.__CPM_CAREER, g = C.get(); return [g.week, g.lived, g.screen, !!document.querySelector('[data-cpm="offerta23"]'), g.club, JSON.stringify(C.snapshot().transferSaga || null).length].join('|') !== s; } catch (e) { return false; } }, s0, { timeout: 20000 }).catch(() => {});
    if (r === 'advanced' || r === 'simulated') passiTipo.push(st.w + (r === 'advanced' ? 'A' : 'S') + (await page.evaluate(() => (window.__CPM_FRENO23 | 0) + ':' + [...document.querySelectorAll('[role=dialog],.modal,[data-cpm]')].map(e => e.getAttribute('data-cpm')).filter(x => x && /offert|settimana|momento|intervista|mese|presid|coda/i.test(x)).slice(0, 3).join('/'))));
    if (String(r).startsWith('error')) { eventi.push({ w: st.w, tipo: 'errore', r }); break; }
    /* chiudi le finestre che non sono l'offerta (l'offerta resta aperta per il giro dopo) */
    await page.evaluate(() => { const C = window.__CPM_CAREER; if (!document.querySelector('[data-cpm="offerta23"]')) { try { C.dismiss(); } catch (e) {} } try { C.chiudi163(); } catch (e) {} });
  }
  const fin = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { w: p.week, s: p.season, pro: p.proStatus, club: p.club && p.club.n, diario: (p.diary || []).filter(d => /gennaio/i.test(JSON.stringify(d))).length, salto323: p.salto323 || null, primavera323: p.primavera323 || null }; });
  await page.close();
  return { ovr, nome, passi, passiTipo, ip19, salto, eventi, saghe, fin, errori: errors.slice(0, 3) };
}

const out = [];
for (const ovr of OVRS) for (let k = 0; k < SEMI; k++) {
  const t0 = Date.now();
  const r = await corsa(ovr, k);
  r.sec = Math.round((Date.now() - t0) / 1000);
  out.push(r);
  console.log(`OVR ${ovr} ${r.nome} IP19=${r.ip19}: ${r.salto ? 'SALTO W' + r.salto.w + ' → ' + r.salto.club + ' (IP ' + r.salto.ip + ')' : 'nessun salto'} · offerte ${r.eventi.filter(e => e.tipo === 'offerta').map(e => 'W' + e.w).join(',') || '—'} · saghe ${r.saghe.map(s => 'W' + s.w + ' ' + s.club).join(',') || '—'} · fine S${r.fin.s} W${r.fin.w} ${r.fin.pro} · ${r.passi} passi · ${r.sec}s${r.errori.length ? ' · ERRORI ' + r.errori[0] : ''}`);
}
for (const ovr of OVRS) { const rr = out.filter(r => r.ovr === ovr); console.log(`RIEPILOGO OVR ${ovr}: salti ${rr.filter(r => r.salto).length}/${rr.length} · settimane ${rr.filter(r => r.salto).map(r => r.salto.w).join(',') || '—'}`); }
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/misura-323' + (process.env.CPM_TAG ? '-' + process.env.CPM_TAG : '') + '.json', JSON.stringify(out, null, 1));
await browser.close(); srv.close();
