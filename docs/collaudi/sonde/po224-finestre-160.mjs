#!/usr/bin/env node
/* [collaudatrice, giro 8 — PO-224 su 7.999.160] SOLA MISURA, nessuna modifica al gioco.
   Carica la build con ?cpmtest=1 + __CPM_POP224=1 (come popup-224.mjs): senza, __CPM_CAREER non esiste (src/18-career-app.jsx:1291,
   sotto _CPM_TEST) e senza __CPM_POP224 le finestre sono spente (src/18-career-app.jsx:1924). Salvataggio di tests/visual/fixtures, GLB spento (UI, non 3D).
   Avanza le settimane con gli handler veri (__CPM_CAREER.step / dismiss), e a ogni settimana:
   - se c'e' [data-cpm="pop224"]: titolo, dimensioni, dentro lo schermo, IN PRIMO PIANO (elementFromPoint al centro
     dentro la finestra), se un altro livello la copre (testo del livello), testo del corpo (indizio della fisarmonica);
   - foto a schermo intero del viewport, UNA per tipo di finestra per larghezza;
   - prova di chiusura col PUNTATORE sul primo pulsante (se il pulsante e' coperto, non si clicca e lo si dichiara);
   - dopo la chiusura: quanti riquadri con lo stesso titolo restano visibili fuori dalla finestra (impulsi in secondo piano).
   Poi una prova forzata del patto col mister (come popup-224.mjs), per il tipo «patto».
   Uso: WIDTH=360 SEASONS=2 CPM_CHROME=/opt/pw-browsers/chromium node po224-finestre-160.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../../../tests/visual/lib/harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const W = +process.env.WIDTH || 412, H = 915, SEASONS = +process.env.SEASONS || 2;
const save = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/visual/fixtures/save-190-s12-ovr93.json'), 'utf8'));
const FOTO = path.join(HERE, '..', 'PO224-160-foto'); fs.mkdirSync(FOTO, { recursive: true });
const DATI = path.join(HERE, '..', 'PO224-dati-160'); fs.mkdirSync(DATI, { recursive: true });

const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage(); await installCdnRoutes(page);
await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_POP224 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} }, save);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}

/* Stato della finestra PO-224 al momento della misura (una lettura, nessun clic). */
const osserva = () => page.evaluate(() => {
  const el = document.querySelector('[data-cpm="pop224"]');
  if (!el) return { pop: false };
  const vh = innerHeight, vw = innerWidth, r = el.getBoundingClientRect();
  const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
  const top = document.elementFromPoint(cx, cy);
  const testo = (el.innerText || '').replace(/\s+/g, ' ').trim();
  const primaRiga = (el.innerText || '').split('\n').map(s => s.trim()).find(Boolean) || '';
  return {
    pop: true, titolo: primaRiga.slice(0, 60), testoLen: testo.length, testo: testo.slice(0, 160),
    altezza: Math.round(r.height), dentroSchermo: r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw,
    inPrimoPiano: !!top && el.contains(top),
    copertaDa: top && !el.contains(top) ? `${top.tagName}${top.getAttribute('data-cpm') ? '[' + top.getAttribute('data-cpm') + ']' : ''} «${(top.innerText || '').replace(/\s+/g, ' ').slice(0, 50)}»` : null,
    pulsanti: [...el.querySelectorAll('button')].map(x => (x.innerText || '').trim().slice(0, 50)),
  };
});

/* Chiusura col PUNTATORE sul primo pulsante, solo se il pulsante e' davvero il punto superiore. */
const chiudi = async () => {
  /* il pulsante di SCELTA e' l'ultimo SENZA «›» (il «›» e' l'intestazione della fisarmonica, non la chiusura) */
  const cands = await page.locator('[data-cpm="pop224"] button').all();
  let bt = null, etichetta = '';
  for (const c of cands) { const t = (await c.innerText().catch(() => '')).trim(); if (!t.includes('›')) { bt = c; etichetta = t.replace(/\s+/g, ' ').slice(0, 50); } }
  if (!bt) return { esito: 'nessun pulsante di scelta', cliccato: null };
  const bb = await bt.boundingBox().catch(() => null);
  if (!bb) return { esito: 'pulsante senza geometria', cliccato: etichetta };
  const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
  const sopra = await page.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); const p = document.querySelector('[data-cpm="pop224"]'); return !!t && !!p && p.contains(t); }, [cx, cy]);
  if (!sopra) return { esito: 'pulsante COPERTO: non cliccabile col puntatore', cliccato: etichetta };
  await page.mouse.click(cx, cy); await sleep(900);
  const chiusa = await page.evaluate(() => !document.querySelector('[data-cpm="pop224"]'));
  return { esito: chiusa ? 'chiusa col puntatore' : 'NON chiusa col puntatore', cliccato: etichetta };
};

/* Fisarmonica: tocco sull'intestazione «›», misura del testo prima e dopo (apre/chiude). */
const fisarmonica = async () => {
  const cands = await page.locator('[data-cpm="pop224"] button').all();
  let tog = null; for (const c of cands) { const t = (await c.innerText().catch(() => '')).trim(); if (t.includes('›')) { tog = c; break; } }
  if (!tog) return null;
  const prima = (await osserva()).testoLen;
  const bb = await tog.boundingBox().catch(() => null);
  if (!bb) return { prima, dopo: null, nota: 'intestazione senza geometria' };
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(600);
  const dopo = (await osserva()).testoLen;
  const restaAperta = await page.evaluate(() => !!document.querySelector('[data-cpm="pop224"]'));
  const sceltaDopo = await page.evaluate(() => [...document.querySelectorAll('[data-cpm="pop224"] button')].map(x => (x.innerText || '').trim()).filter(t => !t.includes('›')).length);
  /* riapertura col tocco sull'intestazione, per vedere se la scelta torna */
  const bb2 = await tog.boundingBox().catch(() => null);
  if (bb2) { await page.mouse.click(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await sleep(600); }
  const riaperta = (await osserva()).testoLen;
  return { prima, dopo, cambia: dopo !== prima, finestraRestaDopoChiusuraFisarmonica: restaAperta, pulsantiDiSceltaDopoChiusura: sceltaDopo, riaperta };
};

/* Riquadri con lo stesso titolo ancora visibili FUORI dalla finestra (impulsi in secondo piano). */
const residui = (titolo) => page.evaluate(t => {
  if (!t) return 0;
  return [...document.querySelectorAll('div')].filter(d => !d.closest('[data-cpm="pop224"]') && d.children.length === 0 && d.offsetParent !== null && (d.textContent || '').trim().toLowerCase() === t.toLowerCase()).length;
}, titolo);

const righe = []; const fotoGia = new Set();
const registra = async (settimana, tipo) => {
  const o = await osserva(); if (!o.pop) return null;
  const chiave = `${tipo}-${W}`;
  if (!fotoGia.has(o.titolo)) { fotoGia.add(o.titolo); await page.screenshot({ path: path.join(FOTO, `${o.titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'finestra'}-${W}.png`) }); }
  const fis = await fisarmonica(); await sleep(300);
  const c = await chiudi(); await sleep(400);
  const residuo = await residui(o.titolo);
  const r = { W, settimana, tipo, ...o, fisarmonica: fis, chiusura: c, residuiFuori: residuo, chiave };
  righe.push(r); return r;
};

/* Settimane: avanza con gli handler veri. Ogni settimana: festeggiamento (se c'e') -> finestra -> chiusura. */
for (let i = 0; i < SEASONS * 46; i++) {
  const ritorno = await page.evaluate(() => window.__CPM_CAREER.step()).catch(e => 'ERR ' + e);
  if (ritorno === 'seasonEnd') {
    /* uscita REALE dalla fine stagione: il pulsante «Inizia Stagione N →» (src/16-scene-3d-cerimonie.jsx:3158) */
    const bt = page.getByRole('button', { name: /Inizia Stagione/ }).first();
    for (let k = 0; k < 20 && !(await bt.isVisible().catch(() => false)); k++) await sleep(300);
    if (await bt.isVisible().catch(() => false)) await bt.click({ timeout: 3000 }).catch(() => {});
    else await page.evaluate(() => { window.__CPM_CAREER.startNewSeason(); }).catch(() => {});
    await sleep(900);
    if (ritorno === 'seasonEnd' && i < 60) console.log(`  uscita fine stagione: pulsante visibile=${await bt.isVisible().catch(() => false)} · step dopo = ${await page.evaluate(() => window.__CPM_CAREER.step()).catch(e => 'ERR ' + e)}`);
  }
  if (i < 12 || ritorno === 'seasonEnd') console.log(`step ${i} → ${ritorno}`);
  await sleep(500);
  const festeggia = page.getByText('Festeggia').first();
  if (await festeggia.isVisible().catch(() => false)) { await festeggia.click({ timeout: 3000 }).catch(() => {}); await sleep(400); }
  if (i % 8 === 0) { const st = await page.evaluate(() => { const p = window.__CPM_CAREER.get(); return p ? `S${p.season} W${p.week} ${p.proStatus}` : 'n/d'; }); console.log(`passo ${i}: ${st}`); }
  const r = await registra(i, 'naturale');
  if (r) console.log(`W${i} · «${r.titolo}» · primo piano ${r.inPrimoPiano} · dentro ${r.dentroSchermo} · ${r.chiusura.esito} · residui fuori ${r.residuiFuori}`);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await sleep(250);
}

/* Prova forzata del PATTO col mister (come popup-224.mjs): verdetto «mantenuto» con obiettivo 0. */
for (let k = 0; k < 3; k++) { const f = page.getByText('Festeggia').first(); if (await f.isVisible().catch(() => false)) { await f.click({ timeout: 3000 }).catch(() => {}); await sleep(400); } }
await page.evaluate(() => { const p = window.__CPM_CAREER.get(); window.__CPM_CAREER.patch({ coachPact: { season: p.season || 1, fromWeek: 0, target: 0, games: 4, kind: 'gol', status: 'active' } }); window.__CPM_CAREER.goTab('dashboard'); });
await sleep(1500);
const patto = await registra('forzato', 'patto');
console.log(`PATTO forzato · ${patto ? `«${patto.titolo}» · primo piano ${patto.inPrimoPiano} · ${patto.chiusura.esito}` : 'finestra NON comparsa'}`);

fs.writeFileSync(path.join(DATI, `po224-${W}.json`), JSON.stringify({ W, SEASONS, versione: '7.999.160', righe }, null, 1));
console.log(`finestre osservate: ${righe.length} · tipi: ${[...new Set(righe.map(r => r.titolo))].join(' | ') || 'nessuno'}`);
await b.close(); srv.close();
