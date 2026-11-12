#!/usr/bin/env node
/* [giro 175 · sonda di SOLA MISURA] «Stato che sopravvive tra partite»: la stessa partita giocata DUE volte nella STESSA pagina
   (senza ricaricare: le variabili globali dello script restano). Dopo la prima partita il giocatore viene rimesso com'era prima
   (tutti i campi del salvataggio di partenza; i campi nati dalla partita tornano undefined) e la partita si rigioca dal prompt.
   Se il secondo libro mastro e' diverso dal primo, qualcosa e' passato da una partita all'altra.
   Uso: NOME="Tobia Ferrante" VEL=2 node _stato175.mjs */
import { apriCarriera166, apriPrompt166, gioca166, seq166, chiudi166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const NOME = process.env.NOME || 'Tobia Ferrante', VEL = process.env.VEL || '2';
const A = await apriCarriera166({ nome: NOME, vel: VEL, reseed: 1000 });
const prima = await A.page.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
await apriPrompt166(A.page); const r1 = await gioca166(A.page, 'intera', {}); const c1 = r1.finita ? await chiudi166(A.page) : {};
await sleep(1500);
const dopo = await A.page.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
const nuovi = Object.keys(dopo).filter(k => !(k in prima)), cambiati = Object.keys(prima).filter(k => JSON.stringify(prima[k]) !== JSON.stringify(dopo[k]));
await A.page.evaluate(({ p, nuovi }) => { const o = { ...p }; for (const k of nuovi) o[k] = undefined; window.__CPM_CAREER.patch(o); }, { p: prima, nuovi }); await sleep(800);
const ripr = await A.page.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
const resto = Object.keys(prima).filter(k => JSON.stringify(prima[k]) !== JSON.stringify(ripr[k]));
await A.page.evaluate(() => { try { window.__CPM_CAREER.dismiss && window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(300);
const pr = await apriPrompt166(A.page); const r2 = await gioca166(A.page, 'intera', {});
await A.b.close(); A.srv.close();
const s1 = seq166(r1.ev), s2 = seq166(r2.ev); let d = -1; for (let i = 0; i < Math.max(s1.length, s2.length); i++) if (JSON.stringify(s1[i]) !== JSON.stringify(s2[i])) { d = i; break; }
console.log(`«${NOME}» ${VEL}× — prima partita: ${JSON.stringify(r1.score)} ${s1.length} voci, finita ${r1.finita}, voce di carriera ${!!c1.voce}`);
console.log(`  campi nati dalla partita: ${nuovi.join(', ') || '—'} · campi cambiati: ${cambiati.join(', ')} · non ripristinati: ${resto.join(', ') || 'nessuno'}`);
console.log(`  seconda partita (stessa pagina, giocatore ripristinato): ${JSON.stringify(r2.score)} ${s2.length} voci, finita ${r2.finita} · bottoni ${JSON.stringify(pr.bottoni)} · note ${r2.note.join(' ')}`);
console.log(d < 0 && s1.length > 100 ? '  LIBRO MASTRO IDENTICO: nessuno stato passato da una partita all\'altra (in questa partita)' : `  DIVERSO alla voce ${d}: ${JSON.stringify(s1[d]).slice(0, 200)} ≠ ${JSON.stringify(s2[d]).slice(0, 200)}`);
console.log(`  errori di pagina: ${JSON.stringify(A.errs.slice(0, 3))}`);
