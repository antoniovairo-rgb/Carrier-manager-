#!/usr/bin/env node
/* [collaudo 161, PO-231] Tre partite di carriera consecutive dal salvataggio S12 a 412 px, chiudendo le finestre
   CLICCANDO (closeTop), mai con __CPM_CAREER.dismiss. Per ogni partita registra: quali finestre compaiono dopo il
   fischio e in che ordine; se e dopo quante compare [data-cpm=intervista231]; foto a 412x915 al primo apparire.
   Testimoni: window.__CPM_IV231 (interviste chieste) e window.__CPM_IVBLK231 (cosa la blocca).
   Uscita: docs/collaudi/PO231-dati.json + foto in docs/collaudi/foto/. Uso: node collaudo-231-intervista.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { scanOverlays, closeTop, clickAdvance } from './lib/collaudo161.mjs';

const W = 412, H = 915;
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

const snap = () => page.evaluate(() => { try { const s = window.__CPM_CAREER.snapshot(); return { week: s.week, matches: s.matches, phase: window.__CPM_PHASE ? window.__CPM_PHASE() : null, iv: window.__CPM_IV231 | 0, blk: window.__CPM_IVBLK231 || null }; } catch (e) { return { err: e.message }; } });
const partite = []; let cur = null; let autoOn = false, ultimaFase = null, stuck = 0, quiete = 0; const t0 = Date.now();
const NUM = 3;
const nuova = (n) => ({ partita: n, finestreDopoFine: [], intervistaComparsa: false, dopoQuante: null, precedenti: [], foto: null, ivAlFineGara: null });
let ultimaChiave = '', ripetizioni = 0, soloAvvisi = 0; const avvisiFermi = []; const traccia = [];
const chiave = ov => ov.length ? ov[ov.length - 1].dc + '|' + ov[ov.length - 1].titolo.slice(0, 25) : '';

for (let it = 0; it < 6000 && Date.now() - t0 < 4200000 && partite.length < NUM; it++) {
  if (cur && cur.partita >= NUM && cur.fineAtPasso != null && quiete >= 12) { partite.push(cur); cur = null; break; } /* ultima gara chiusa: si registra e si esce */
  const s = await snap(); if (s.err) { cur && (cur.errore = s.err); break; }
  const fase = s.phase;
  if (fase !== ultimaFase) traccia.push('passo ' + it + ': fase ' + ultimaFase + ' → ' + fase + ' (settimana ' + s.week + ')');
  /* un nuovo ciclo parte dal primo «playing» dopo la chiusura della gara precedente */
  /* un ciclo nuovo solo a una gara NUOVA: la fase torna «playing» dopo ogni highlight (hl_result→playing), non conta */
  if (fase === 'playing' && (cur === null || cur.fineAtPasso != null)) {
    if (cur) { cur.ivAlFineGara = s.iv; cur.blocchiAlFine = s.blk; partite.push(cur); }
    if (partite.length >= NUM) break;
    cur = nuova(partite.length + 1); cur.inizioAtPasso = it; autoOn = false;
  }
  if (fase === 'playing' && !autoOn) { await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2311 + (window.__CPM_IV231 | 0), policy: 'seeded', tickMs: 150 })); autoOn = true; }
  const giaFinita = ultimaFase && ultimaFase !== 'playing' && ultimaFase !== null && fase !== 'playing';
  if (fase === 'ended' || fase === 'ceremony') { if (cur && cur.fineAtPasso == null) cur.fineAtPasso = it; }
  ultimaFase = fase || ultimaFase;

  const ov = await scanOverlays(page);
  if (cur && cur.fineAtPasso != null) {
    for (const o of ov) {
      const etichetta = o.dc + ' / ' + o.titolo.slice(0, 40);
      if (!cur.finestreDopoFine.includes(etichetta)) cur.finestreDopoFine.push(etichetta);
      if (o.dc === 'intervista231' && !cur.intervistaComparsa) {
        cur.intervistaComparsa = true; const prima = cur.finestreDopoFine.slice(0, cur.finestreDopoFine.indexOf(etichetta)); cur.precedenti = prima; cur.dopoQuante = prima.filter(x => !x.startsWith('toast23')).length; /* le finestre prima, gli avvisi esclusi */
        cur.contesto = await page.evaluate(() => { const el = document.querySelector('[data-cpm="intervista231"]'); return el ? el.getAttribute('data-ctx') : null; });
        const nome = `PO231-412-partita${cur.partita}-intervista.png`; await page.screenshot({ path: path.join(FOTO, nome) }).catch(() => {}); cur.foto = 'foto/' + nome; cur.intervistaOggetto = o;
      }
    }
  }
  const messaggi = ov.filter(o => !o.pulsanti);
  if (ov.length && ov.length === messaggi.length) { soloAvvisi++; if (soloAvvisi === 12) avvisiFermi.push(messaggi.map(m => m.dc + ' «' + m.titolo + '»').join(', ') + ' (partita ' + (cur ? cur.partita : '-') + ')'); if (soloAvvisi < 12) { await sleep(700); continue; } }
  else soloAvvisi = 0;
  if (ov.length) {
    quiete = 0;
    const k = chiave(ov); ripetizioni = k === ultimaChiave ? ripetizioni + 1 : 1; ultimaChiave = k;
    if (ripetizioni > 4) { if (cur) cur.errore = 'ciclo su ' + k; break; }
    const etic = await closeTop(page);
    if (etic) { stuck = 0; await sleep(650); continue; }
    stuck++; if (stuck > 6) { if (cur) cur.errore = 'finestra non cliccabile: ' + k; break; }
    await sleep(500); continue;
  }
  quiete++;
  /* nessuna finestra: avanzamento del gioco. Dopo il fischio si torna alla settimana, poi «Gioca» per la partita successiva */
  if (cur && cur.fineAtPasso != null && cur.finestreDopoFine.length === 0 && quiete > 40) { /* nessuna finestra per molto: si passa oltre */ }
  const adv = await clickAdvance(page, [/Gioca la partita/, /Torna alla dashboard/, /Vivi la Settimana/, /Chiudi la stagione/, /Vai al bilancio/, /Salta premiazione/, /Salta il gal/, /Gioca\b/, /Siamo pronti/, /^Continua/, /Avanti/, /Prosegui/, /Inizia/]);
  if (adv) quiete = 0;
  await sleep(adv ? 600 : 700);
}
if (cur && !partite.includes(cur)) { cur.ivAlFineGara = (await snap()).iv; cur.blocchiAlFine = (await snap()).blk; partite.push(cur); }
const fine = await snap();
await ctx.close(); await b.close(); srv.close();
const esito = { traccia, avvisiFermi, vw: W, vh: H, gioco: '?cpmtest=1 (serve __CPM_CAREER per la lettura); __CPM_POP224=1 e __CPM_PRESENT=1 armati; GLB OFF; finestre chiuse con clic (closeTop), nessun dismiss', w_finale: fine.week, m_finale: fine.matches, partite, secondi: Math.round((Date.now() - t0) / 1000) };
fs.writeFileSync(path.join(REPO, 'docs', 'collaudi', 'PO231-dati.json'), JSON.stringify(esito, null, 2));
console.log(`partite registrate ${partite.length} · settimana finale ${fine.week} · partite finali ${fine.matches} · ${esito.secondi}s`);
for (const p of partite) console.log(`  partita ${p.partita}: intervista=${p.intervistaComparsa} dopoQuante=${p.dopoQuante} finestreDopoFine=${p.finestreDopoFine.length} ivAlFine=${p.ivAlFineGara} blocco=${JSON.stringify(p.blocchiAlFine)} ${p.errore || ''}`);
