#!/usr/bin/env node
/* [collaudo 161, PO-230] Gioca 2 settimane + 1 partita dal salvataggio S12 a una larghezza di telefono (argv: 360 | 412),
   con ?cpmtest=1 (serve __CPM_CAREER per la LETTURA dello stato; impulsi e teatro armati come in produzione), e a ogni comparsa di un overlay in primo piano misura la cornice
   (scanOverlays) e fotografa. Le finestre si chiudono CLICCANDO (closeTop), mai con __CPM_CAREER.dismiss.
   Uscita: docs/collaudi/PO230-dati-<W>.json + foto in docs/collaudi/foto/. Uso: node collaudo-230-finestre.mjs 412 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { scanOverlays, closeTop, clickAdvance } from './lib/collaudo161.mjs';

const W = +(process.argv[2] || 412), H = W === 360 ? 780 : 915;
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FOTO = path.join(REPO, 'docs', 'collaudi', 'foto'); fs.mkdirSync(FOTO, { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage(); await installCdnRoutes(page);
await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_POP224 = 1; window.__CPM_PRESENT = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-match-speed', '4'); } catch (e) {} }, save);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
await sleep(1500);

const snap = () => page.evaluate(() => { try { const s = window.__CPM_CAREER.snapshot(); return { week: s.week, season: s.season, matches: s.matches, phase: window.__CPM_PHASE ? window.__CPM_PHASE() : null }; } catch (e) { return { err: e.message }; } });
const s0 = await snap(); const w0 = s0.week, m0 = s0.matches;
const seen = new Map(); const sequenza = []; const bloccate = []; const passi = [];
let ultimaChiave = '', ripetizioni = 0; const sameKey = ov => { const k = ov.length ? ov[ov.length - 1].dc + '|' + ov[ov.length - 1].titolo.slice(0, 25) : ''; ripetizioni = k === ultimaChiave ? ripetizioni + 1 : 1; ultimaChiave = k; return ripetizioni; };
let prev = '(home)', autoOn = false, soloAvvisi = 0, stuck = 0, quiete = 0, foto = 0; const t0 = Date.now();

const registra = async (ov, it) => {
  for (const o of ov) {
    const key = o.dc + '|' + o.titolo.slice(0, 25);
    if (!seen.has(key)) {
      seen.set(key, { ...o, primaDi: prev, passo: it, vw: W });
      sequenza.push(o.dc + ' / ' + o.titolo.slice(0, 40));
      if (foto < 60) { const nome = `PO230-${W}-${String(++foto).padStart(2, '0')}-${o.dc.replace(/[^a-z0-9-]/gi, '_')}.png`;
        await page.screenshot({ path: path.join(FOTO, nome) }).catch(() => {}); seen.get(key).foto = 'foto/' + nome; }
    }
  }
};
for (let it = 0; it < 4000 && Date.now() - t0 < 2400000; it++) {
  const ov = await scanOverlays(page);
  await registra(ov, it);
  const messaggi = ov.filter(o => !o.pulsanti); /* avvisi senza pulsanti (es. «⚡ -6»): si lasciano sparire, non sono finestre da chiudere */
  if (ov.length && ov.length === messaggi.length) { soloAvvisi++; if (soloAvvisi === 12) passi.push('AVVISO FERMO: ancora a schermo dopo 12 controlli senza pulsanti: ' + messaggi.map(m => m.dc + ' «' + m.titolo + '»').join(', ')); if (soloAvvisi < 12) { await sleep(700); continue; } }
  else soloAvvisi = 0;
  if (ov.length) {
    quiete = 0;
    const etic = await closeTop(page);
    if (etic && sameKey(ov) > 4) { passi.push('STOP: stessa finestra cliccata >4 volte di fila (ciclo) su ' + ov[ov.length - 1].dc); break; }
    if (etic) { prev = ov[ov.length - 1].dc + ' (chiusa con «' + etic + '»)'; passi.push('clic «' + etic + '» su ' + ov[ov.length - 1].dc + ' (passo ' + it + ')'); stuck = 0; await sleep(700); continue; }
    const dettaglio = await page.evaluate(() => { const ov = [...document.body.querySelectorAll('*')].filter(el => { const cs = getComputedStyle(el); return cs.position === 'fixed' && parseInt(cs.zIndex, 10) >= 900 && el.getBoundingClientRect().height > 0; }).pop();
      return ov ? { btn: [...ov.querySelectorAll('button')].map(b => (b.textContent || '').trim().slice(0, 30) + (b.disabled ? '[dis]' : '') + (b.offsetParent ? '' : '[nascosto]')), testo: (ov.innerText || '').replace(/\s+/g, ' ').slice(0, 160) } : null; });
    stuck++; bloccate.push({ passo: it, dc: ov[ov.length - 1].dc, titolo: ov[ov.length - 1].titolo, dettaglio });
    if (stuck > 6) break; await sleep(500); continue;
  }
  quiete++;
  if (quiete === 30) passi.push('FERMO: 30 controlli senza finestre e senza pulsante di avanzamento. Pulsanti visibili: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim().slice(0, 24)).slice(0, 18))));
  const s = await snap();
  if (s.err) { passi.push('errore: ' + s.err); break; }
  if (s.matches > m0 && (s.week >= w0 + 2 || s.season !== s0.season) && quiete >= 10) break;
  if (s.phase === 'playing' && !autoOn) { await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 161, policy: 'seeded', tickMs: 150 })); autoOn = true; passi.push('autoplay acceso a passo ' + it); }
  const adv = await clickAdvance(page, [/Torna alla dashboard/, /Vivi la Settimana/, /Chiudi la stagione/, /Vai al bilancio/, /Salta premiazione/, /Salta il gal/, /Gioca\b/, /Siamo pronti/, /^Continua/, /Avanti/, /Prosegui/, /Inizia/]);
  if (adv) { prev = '(clic «' + adv + '»)'; quiete = 0; }
  await sleep(adv ? 600 : 700);
}
/* giro dei riquadri e delle schede del gioco: le finestre che il cammino non apre (procuratore, mercato, offerte, pagella…) */
const giro = ["Ascolta l'offerta", 'Festeggia con la squadra', 'Obiettivi personali', 'Voci di mercato', 'Record watch', 'Duello capocannoniere', 'Notizie della settimana', 'Agente', 'Club', 'Carriera', 'Ufficio', 'Stagione'];
const giroEsiti = [];
for (const voce of giro) {
  if (Date.now() - t0 > 2700000) break;
  const cliccato = await page.evaluate(v => { const r = new RegExp(v, 'i'); const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null && !x.disabled).find(x => r.test((x.textContent || '').trim())); if (!b) return null; b.click(); return (b.textContent || '').trim().slice(0, 40); }, voce.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  giroEsiti.push(voce + ' → ' + (cliccato ? 'cliccato' : 'non visibile'));
  await sleep(900);
  for (let k = 0; k < 8; k++) { const ov = await scanOverlays(page); await registra(ov, 9000 + k); const modali = ov.filter(o => o.pulsanti); if (!modali.length) { if (!ov.length) break; await sleep(700); continue; } if (!(await closeTop(page))) break; await sleep(650); }
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null).find(x => /^Home/.test((x.textContent || '').trim())); if (b) b.click(); }); await sleep(900);
}
passi.push('giro schede: ' + giroEsiti.join(' | '));
const fine = await snap();
await ctx.close(); await b.close(); srv.close();
const esito = { vw: W, vh: H, gioco: '?cpmtest=1 (serve __CPM_CAREER per leggere lo stato); __CPM_POP224=1 e __CPM_PRESENT=1 armati per avvicinarsi alla produzione', glb: 'OFF (finestre 2D, non dipendono dal 3D)', w0, w1: fine.week, m0, m1: fine.matches,
  fase_finale: fine.phase, passi, bloccate, sequenza, finestre: [...seen.values()], secondi: Math.round((Date.now() - t0) / 1000) };
fs.writeFileSync(path.join(REPO, 'docs', 'collaudi', `PO230-dati-${W}.json`), JSON.stringify(esito, null, 2));
console.log(`vw ${W}: settimana ${w0}→${fine.week} · partite ${m0}→${fine.matches} · finestre distinte ${seen.size} · bloccate ${bloccate.length} · ${esito.secondi}s`);
for (const f of seen.values()) console.log(`  ${f.cornice.padEnd(8)} ${f.dc.padEnd(22)} r=${f.raggio} ${f.fuori ? 'FUORI ' : ''}${f.trunc.length ? 'TAGLIO ' + f.trunc.length + ' ' : ''}${f.titolo.slice(0, 40)}`);
