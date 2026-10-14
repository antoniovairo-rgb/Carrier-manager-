#!/usr/bin/env node
/* [7.999.162 GUARDIANO CL194 — bloccante (c) della prontezza: classifica del salvataggio 194 con somma GF ≠ GS]
   Salvataggio fixtures/save-194-primavera-w38.json (Primavera 2, S1 W38, 34a giornata da giocare contro FC Altoadige, id sdt).
   Si gioca la giornata DAL VIVO (playMatch + autoplay seminato) e si ricostruiscono dal risultato scritto nel calendario le righe
   attese di eroe e avversario: l'eroe prende il suo risultato, l'avversario il risultato SPECULARE (i gol dell'eroe sono i suoi
   subiti). Causa misurata: la partita dal vivo passava a updateStandings il NOME dell'avversario («FC Altoadige Primavera»),
   che non coincide con la riga di classifica («FC Altoadige»): l'avversario non riceveva il risultato e giocava un «riposo»
   contro nessuno (src/09 updateStandings, ramo byeTeam) → la somma GF−GS di lega cresceva a ogni gara dal vivo.
   VERDE → punti, V/N/P, GF e GS di eroe e avversario == ricostruiti; GF−GS di lega invariato dalla giornata; nessun avviso
           «opponentId non in classifica».
   ROSSO (__CPM_NO_CL194, CPM_RED=1) → avviso presente e l'avversario non ha il risultato speculare (o lo sbilancio cresce).
   Uso: node classifica-194.mjs  ·  CPM_RED=1 node classifica-194.mjs (deve dichiarare il rosso, esce 0 se lo vede) */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const avvisi = []; page.on('console', m => { const t = m.text(); if (/opponentId non in classifica/.test(t)) avvisi.push(t); });
const errori = []; page.on('pageerror', e => errori.push(String(e && e.message || e)));
await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_CL194 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, RED]);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
const stato = () => page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); const st = s.standings || [];
  const md = (s.calendar || []).find(m => !m.type && m.matchday === 34) || null;
  return { week: s.week, club: s.club && s.club.id, st: st.map(r => ({ id: r.id, played: r.played, wins: r.wins, draws: r.draws, losses: r.losses, gf: r.gf, ga: r.ga, pts: r.pts })), md, cal: (s.calendar || []).filter(m => !m.type && m.played && m.result).map(m => m.result) }; });
const prima = await stato();
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
const pm = await page.evaluate(() => { try { return window.__CPM_CAREER.playMatch(true); } catch (e) { return 'err ' + e.message; } });
await sleep(1500);
for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
  await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
    const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
  await sleep(900); }
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 1941, policy: 'seeded', tickMs: 150 }));
const t0 = Date.now(); let ph; while (Date.now() - t0 < 400000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
for (let k = 0; k < 20 && (await page.evaluate(() => { try { return window.__CPM_CAREER.snapshot().week; } catch (e) { return null; } })) !== 39; k++) { await page.keyboard.press('Enter'); await sleep(400); }
await sleep(1500);
const dopo = await stato();
if (process.env.CPM_DUMP) { const sv = await page.evaluate(() => localStorage.getItem('cpm-v3')); fs.writeFileSync(process.env.CPM_DUMP, sv || ''); }/* [giro 13] salvataggio dopo la giornata, per misurare la migrazione MIG194 */
await ctx.close(); await b.close(); srv.close();

const somma = st => st.reduce((o, r) => ({ W: o.W + r.wins, L: o.L + r.losses, GF: o.GF + r.gf, GA: o.GA + r.ga }), { W: 0, L: 0, GF: 0, GA: 0 });
const riga = (st, id) => st.find(r => r.id === id) || {};
const fmt = r => `${r.played}g ${r.wins}V ${r.draws}N ${r.losses}P ${r.gf}-${r.ga} ${r.pts}pt`;
const md = dopo.md, res = md && md.played && md.result;
if (!res || dopo.week !== 39) { console.log(`❌ classifica-194: la giornata 34 non risulta giocata (settimana ${dopo.week}, playMatch ${pm}, fase ${ph})`); process.exit(1); }
const opp = md.opponentId, eroe = dopo.club;
/* punti ricostruiti dell'eroe: dalla storia delle giornate giocate nel calendario */
const calE = dopo.cal.reduce((o, r) => ({ g: o.g + 1, w: o.w + (r.won ? 1 : 0), d: o.d + (r.drew ? 1 : 0), l: o.l + (!r.won && !r.drew ? 1 : 0), gf: o.gf + r.homeScore, ga: o.ga + r.awayScore }), { g: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 });
const attE = { played: calE.g, wins: calE.w, draws: calE.d, losses: calE.l, gf: calE.gf, ga: calE.ga, pts: 3 * calE.w + calE.d };
/* avversario: riga di prima + risultato speculare */
const o0 = riga(prima.st, opp); const lost = res.won, drew = res.drew;
const attO = { played: o0.played + 1, wins: o0.wins + (!lost && !drew ? 1 : 0), draws: o0.draws + (drew ? 1 : 0), losses: o0.losses + (lost ? 1 : 0), gf: o0.gf + res.awayScore, ga: o0.ga + res.homeScore, pts: o0.pts + (drew ? 1 : (!lost ? 3 : 0)) };
const KEYS = ['played', 'wins', 'draws', 'losses', 'gf', 'ga', 'pts'];
const okRow = (a, b) => KEYS.every(k => a[k] === b[k]);
const e1 = riga(dopo.st, eroe), o1 = riga(dopo.st, opp);
const s0 = somma(prima.st), s1 = somma(dopo.st);
const okE = okRow(e1, attE), okO = okRow(o1, attO), okSbil = (s1.GF - s1.GA) === (s0.GF - s0.GA) && (s1.W - s1.L) === (s0.W - s0.L), okAvv = avvisi.length === 0;
console.log(`giornata 34: eroe ${res.homeScore}-${res.awayScore} contro ${opp} (${md.isHome ? 'casa' : 'trasferta'}) · playMatch ${pm} · fine ${ph} · pageerror ${errori.length}`);
console.log(`eroe   ${eroe}: classifica ${fmt(e1)} · ricostruita ${fmt(attE)} → ${okE ? 'uguale' : 'DIVERSA'}`);
console.log(`avv.   ${opp}: classifica ${fmt(o1)} · ricostruita ${fmt(attO)} → ${okO ? 'uguale' : 'DIVERSA'}`);
console.log(`lega   GF−GS ${s0.GF - s0.GA} → ${s1.GF - s1.GA} · V−P ${s0.W - s0.L} → ${s1.W - s1.L} → ${okSbil ? 'invariato' : 'CRESCE'} · avvisi «opponentId non in classifica»: ${avvisi.length}`);
const verde = okE && okO && okSbil && okAvv && errori.length === 0;
if (RED) { const visto = !okAvv && (!okO || !okSbil);/* la causa (avviso) E il suo effetto (riga avversaria o sbilancio) */ console.log(visto ? '✅ ROSSO come atteso (__CPM_NO_CL194): l\'avversario non e\' trovato in classifica e non riceve il risultato speculare' : '❌ il rosso non riproduce il difetto'); process.exit(visto ? 0 : 1); }
console.log(verde ? '✅ classifica-194 verde' : '❌ classifica-194 ROSSO'); process.exit(verde ? 0 : 1);
