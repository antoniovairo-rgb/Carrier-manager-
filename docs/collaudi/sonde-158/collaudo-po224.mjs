#!/usr/bin/env node
/* [COLLAUDO PO-224 · sessione collaudatrice] Gioca una stagione con gli handler VERI (__CPM_CAREER.step, come career-sim-test.mjs)
   a 375 px con __CPM_POP224=1 (le finestre come le vede il giocatore). Per ogni settimana registra: finestra presente, tipo,
   se la scelta la chiude, se ce n'e' piu' d'una, se un altro overlay copre la home, se «Vivi la Settimana» e' raggiungibile.
   Foto della prima di ogni tipo a 360/375/412 (WIDTH env). Uso: WIDTH=375 SEASONS=1 node collaudo-po224.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const W = Number(process.env.WIDTH || 375), SEASONS = Number(process.env.SEASONS || 1), OUT = process.env.OUT || '/tmp/cpm158/collaudo-out';
fs.mkdirSync(OUT, { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: W, height: 812 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_POP224 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1200);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(600);

const tipo = txt => /verdetto/i.test(txt) ? 'verdetto-patto' : /Lo spogliatoio/i.test(txt) ? 'spogliatoio' : /Il patto col mister/i.test(txt) ? 'proposta-patto' : 'altro';
const rows = []; const shots = {}; let seasonsDone = 0, iter = 0; const MAX = 500;
const snap = () => page.evaluate(() => {
  const pops = [...document.querySelectorAll('[data-cpm=pop224]')];
  const pop = pops[0] || null;
  const vh = innerHeight;
  const others = [...document.querySelectorAll('body *')].filter(el => {
    if (el.closest('[data-cpm=pop224]')) return false;
    const cs = getComputedStyle(el); if (cs.position !== 'fixed') return false;
    const z = parseInt(cs.zIndex || '0', 10); if (!(z >= 1000)) return false;
    const r = el.getBoundingClientRect(); return r.width > 200 && r.height > 120;
  }).map(el => (el.getAttribute('data-cpm') || el.className || el.tagName).toString().slice(0, 40));
  const btn = [...document.querySelectorAll('button')].find(b => /Vivi la Settimana/i.test(b.textContent || ''));
  let vivi = null;
  if (btn) { const r = btn.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const dsc = hit ? (hit.tagName + (hit.getAttribute('data-cpm') ? '[data-cpm=' + hit.getAttribute('data-cpm') + ']' : '') + ' «' + (hit.textContent || '').trim().slice(0, 40) + '»') : 'nulla'; vivi = { visibile: r.width > 0 && r.height > 0, colpibile: !!hit && (hit === btn || btn.contains(hit)), coperto: !!hit && !(hit === btn || btn.contains(hit)) && !!hit.closest('[data-cpm=pop224]'), hit: dsc }; }
  let copre = null;
  if (pop) { const pb = pop.querySelector('button'); if (pb) { const r = pb.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const d = e => e ? (e.tagName + (e.getAttribute('data-cpm') ? '[' + e.getAttribute('data-cpm') + ']' : '') + '.' + String(e.className || '').slice(0, 30) + ' z=' + getComputedStyle(e).zIndex + ' pos=' + getComputedStyle(e).position) : 'nulla'; copre = { bottone: pb.textContent.trim().slice(0, 25), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], hit: d(h), inPop: !!(h && pop.contains(h)), testoSopra: (() => { let e = h; while (e && getComputedStyle(e).zIndex !== '9999') e = e.parentElement; return e ? e.innerText.slice(0, 120).replace(/\n+/g, ' | ') : null; })(), catena: h ? (() => { const out = []; let e = h; for (let i = 0; i < 4 && e; i++) { out.push(d(e)); e = e.parentElement; } return out; })() : [] }; } }
  return { copre, n: pops.length, testo: pop ? pop.innerText.slice(0, 160).replace(/\n+/g, ' | ') : '', buttons: pop ? [...pop.querySelectorAll('button')].map(b => b.textContent.trim().slice(0, 30)) : [], altriOverlay: others, vivi, vh, copre };
});

while (iter++ < MAX && seasonsDone < SEASONS) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; if (!C) return null; const res = C.step(); return { res, st: C.get() }; });
  if (!r) { rows.push({ err: 'harness sparito' }); break; }
  const { res, st } = r;
  await sleep(350); // lascia respirare il render
  // la celebrazione di titolo («CAMPIONI! … Festeggia») copre tutto: il giocatore la chiude prima di tutto
  const fest = page.locator('button', { hasText: 'Festeggia' }).first(); let festeggia = false;
  if (await fest.count()) { await fest.click({ timeout: 4000 }).catch(() => {}); festeggia = true; await sleep(400); }
  const s = await snap();
  const row = { festeggia, it: iter, res, S: st.season, W: st.week, n: s.n, altri: s.altriOverlay, vivi: s.vivi, copre: s.copre, tipo: s.n ? tipo(s.testo) : null, testo: s.testo, bottoni: s.buttons };
  if (s.n) {
    // prima foto per tipo (una volta per run)
    if (!shots[row.tipo]) { await page.screenshot({ path: path.join(OUT, `po224-${row.tipo}-${W}.png`) }); shots[row.tipo] = true; }
    // la scelta: primo bottone della finestra (la finestra dichiara il suo primo esito)
    // prova 3 (solo con SBLOCCO=1): se un altro livello copre la finestra, il giocatore sceglie PRIMA la sua scelta; qui si sceglie la prima opzione di quel livello
    if (process.env.SBLOCCO === '1') { row.passiSblocco = []; for (let st = 0; st < 8; st++) { const cv = await snap().then(x => x.copre); if (!cv || cv.inPop) break; const step = await page.evaluate(() => { const pop = document.querySelector('[data-cpm=pop224]'); const pb = pop && pop.querySelector('button'); if (!pb) return null; const r = pb.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!h || pop.contains(h)) return null; let e = h; while (e && !(e.getAttribute('data-cpm') || /cpm-rise/.test(String(e.className)) || getComputedStyle(e).position === 'fixed')) e = e.parentElement; if (!e || pop.contains(e)) return null; const bs = [...e.querySelectorAll('button')].filter(b => !/Festeggia/i.test(b.textContent || '')); if (!bs.length) return null; const t = bs[0].textContent.trim().slice(0, 36); bs[0].click(); return t; }); if (!step) break; row.passiSblocco.push(step); await sleep(550); } }
    if (process.env.SBLOCCO === '1') { row.sbloccoAltroLivello = await page.evaluate(() => { const pop = document.querySelector('[data-cpm=pop224]'); const pb = pop && pop.querySelector('button'); if (!pb) return null; const r = pb.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!h || pop.contains(h)) return null; let e = h; while (e && !(e.getAttribute('data-cpm') || /cpm-rise/.test(String(e.className)) || getComputedStyle(e).position === 'fixed')) e = e.parentElement; if (!e || pop.contains(e)) return { nonTrovato: true, hit: h && h.tagName }; const bs = [...e.querySelectorAll('button')].filter(b => !/Festeggia/i.test(b.textContent || '')); if (!bs.length) return { senzaBottoni: true }; const t = bs[0].textContent.trim().slice(0, 40); bs[0].click(); return { cliccato: t, da: (e.getAttribute('data-cpm') || '') + ' ' + (e.innerText || '').slice(0, 50).replace(/\n+/g, ' | ') }; }); await sleep(600); }
    if (process.env.SBLOCCO === '1') row.dopoSbloccoCopre = await snap().then(x => x.copre);
    const b0 = page.locator('[data-cpm=pop224] button').first();
    await b0.click({ timeout: 4000 }).catch(() => {}); await sleep(500);
    const after = await snap(); row.sceltaFatta = s.buttons[0]; row.sbloccoRiga = row.sbloccoAltroLivello || null; row.chiusaDopoScelta = after.n === 0; row.riapparsa = after.n > 0 ? after.testo.slice(0, 60) : null;
    row.viviDopo = after.vivi;
    // prova 2, separata dal puntatore: clic JS diretto sul pulsante della finestra (isola l'handler dal rivestimento)
    if (after.n > 0) { await page.evaluate(() => { const b = document.querySelector('[data-cpm=pop224] button'); if (b) b.click(); }); await sleep(500); const j = await snap(); row.chiusaJS = j.n === 0; row.riapparsaJS = j.n > 0; row.bondDopoJS = await page.evaluate(() => { const p = window.__CPM_CAREER.get(); return p && p.bondEv ? JSON.stringify(p.bondEv).slice(0, 80) : null; }); }
  }
  rows.push(row); console.error(`[${Date.now()%100000}] it${iter} S${st.season}W${st.week} res=${res} n=${s.n} ${row.tipo||''} ${row.chiusaDopoScelta===false?'NON-CHIUSA':''}`);
  if (res === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); seasonsDone++; await sleep(700); }
  if (res && res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); }
  await page.evaluate(() => window.__CPM_CAREER.dismiss()).catch(() => {}); await sleep(120);
  if (res && res.startsWith('error:')) { rows.push({ err: res }); break; }
}
const fin = await page.evaluate(() => window.__CPM_CAREER.get()).catch(() => null);
const conFinestra = rows.filter(x => x.n);
const count = {}; conFinestra.forEach(x => count[x.tipo] = (count[x.tipo] || 0) + 1);
const sovrapp = rows.filter(x => x.n > 1).length, bloccate = conFinestra.filter(x => x.chiusaDopoScelta === false).length, riapp = conFinestra.filter(x => x.riapparsa).length;
const viviCoperto = rows.filter(x => x.vivi && x.vivi.coperto && !x.n).length;
const altriOv = rows.filter(x => x.altri && x.altri.length).length;
const sum = { W, iter, stagioni: seasonsDone, settimaneRegistrate: rows.filter(x => x.S).length, conFinestra: conFinestra.length, perTipo: count, sovrapposizioni: sovrapp, nonChiuseDallaScelta: bloccate, riapparseDopoScelta: riapp, viviCopertoSenzaFinestra: viviCoperto, altriOverlay: altriOv, pageerror: errors.length, primoErrore: errors[0] || null, stagioneFinale: fin ? { S: fin.season, W: fin.week } : null };
fs.writeFileSync(path.join(OUT, `po224-rows-${W}.json`), JSON.stringify({ sum, rows }, null, 1));
console.log(JSON.stringify(sum));
const primo = {}; rows.forEach(x => { if (x.n && !primo[x.tipo]) primo[x.tipo] = x; }); Object.values(primo).forEach(x => console.log('COPRE ' + JSON.stringify(x.copre))); Object.values(primo).forEach(x => console.log('PRIMO ' + x.tipo + ' S' + x.S + 'W' + x.W + ' testo=' + x.testo + ' bottoni=' + JSON.stringify(x.bottoni) + ' sceltaFatta=' + x.sceltaFatta + ' chiusa=' + x.chiusaDopoScelta + ' chiusaJS=' + x.chiusaJS + ' bondJS=' + x.bondDopoJS + ' vivi=' + JSON.stringify(x.viviDopo)));
rows.filter(x=>x.altri && x.altri.length).slice(0,3).forEach(x=>console.log("ALTRI S"+x.S+"W"+x.W+": "+x.altri.join(" ; ")));
for (const x of conFinestra.slice(0, 40)) console.log(`S${x.S}W${x.W} ${x.tipo} chiusa=${x.chiusaDopoScelta} riap=${!!x.riapparsa} vivi=${JSON.stringify(x.viviDopo)} altri=${x.altri.length}`);
await browser.close(); srv.close();
