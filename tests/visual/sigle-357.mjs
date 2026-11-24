#!/usr/bin/env node
/* [giro 357 · PO-654 «Occhio al copyright delle coppe»] GUARDIANO sigle-357. Sul gioco vero (?cpmtest=1), telefono 412 px.
   Un salvataggio (fixture save-c177-s5w20, gia' in UEL agli ottavi) riceve trofei europei con le CHIAVI INTERNE come le scrive il gioco
   (trofei league:"UCL"/"UEL"/"UECL" type:"euro", storico euroPlayed/euroComp, calendario type:"euro" competition:<chiave>), poi:
   A · ogni scheda della carriera (dashboard, stagione/calendario/classifica/coppe, carriera/profilo/nazionale, club, agente, ufficio),
       con tutte le fisarmoniche aperte, e la pagina di fine carriera («Momenti indimenticabili», la schermata della foto del PO):
       nel TESTO RENDERIZZATO (document.body.innerText) nessuna sigla vera (UCL · UEL · UECL come parola intera) e nessun nome vero
       («Champions League», «Europa League», «Conference League»).
   B · copertura: le sigle di fantasia (KCC/KEC/KCF) compaiono a schermo in almeno due schede, e la fine carriera ha i suoi tre trofei:
       se il salvataggio non arriva a schermo la prova non giudica, e «non giudicato» = rosso.
   ROSSO: CPM_ROSSO357=1 accende window.__CPM_NO_G357 (il filtro compLbl lascia passare la chiave): A deve VEDERE le sigle vere.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node sigle-357.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, vai } from './misura-234.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.env.CPM_ROSSO357 === '1';
const FOTO = process.env.CPM_FOTO357 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const VERE = /\b(UCL|UEL|UECL)\b|Champions League|Europa League|Conference League/g;
const FINTE = /\b(KCC|KEC|KCF)\b/;
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const flags = ROSSO ? ['__CPM_NO_G357'] : [];
const SCHEDE = ['dashboard', 'calendar', 'standings', 'coppe', 'profile', 'nazionale', 'club', 'agente', 'ufficio'];

async function apriTutto(page) {
  for (let g = 0; g < 4; g++) {
    const n = await page.evaluate(() => { const bs = [...document.querySelectorAll('button[aria-expanded="false"]')]; bs.forEach(b => { try { b.click(); } catch (e) {} }); return bs.length; });
    if (!n) break; await sleep(350);
  }
}
const contesto = (t, i) => t.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ');
function trova(t) { const out = []; let m; VERE.lastIndex = 0; while ((m = VERE.exec(t))) out.push(`«${m[0]}» in «${contesto(t, m.index)}»`); return out; }

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
try {
  console.log(`sigle-357 ${ROSSO ? '[ROSSO __CPM_NO_G357]' : '[verde]'}`);
  const { page, errs } = await apri(b, port, 412, { h: 915, flags });
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.patch), null, { timeout: 60000 });
  const semina = async extra => page.evaluate(extra => {
    const P = window.__CPM_CAREER;
    const tr = [{ season: 3, club: 'FC Rotterdam', league: 'UEL', type: 'euro' }, { season: 4, club: 'FC Altoadige', league: 'UECL', type: 'euro' },
      { season: 5, club: 'FC Merseyside', league: 'UCL', type: 'euro' }, { season: 2, club: 'FC Altoadige', league: 'Coppa', type: 'cup' }];
    return P.patch({ trophies: tr, ...extra });
  }, extra);
  /* storico con le chiavi interne come lo scrive la chiusura di stagione (euroPlayed/euroComp/euroEnd) */
  const P0 = JSON.parse(JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)))['cpm-v3']).player;
  const EU = { 1: ['UECL', null, 'G'], 2: ['UEL', null, 'QF'], 3: ['UEL', 'UEL', 'W'], 4: ['UECL', 'UECL', 'W'] };
  const history = (P0.history || []).map(h => EU[h.season] ? { ...h, euroPlayed: EU[h.season][0], euroComp: EU[h.season][1], euroEnd: EU[h.season][2] } : h);
  await semina({ history });
  const visti = {}; let finte = 0;
  for (const s of SCHEDE) {
    await vai(page, s, 1300); await apriTutto(page); await sleep(400);
    const t = await page.evaluate(() => document.body.innerText);
    const h = trova(t); visti[s] = h; if (FINTE.test(t)) finte++;
    if (FOTO) await page.screenshot({ path: `${FOTO}/${s}-${ROSSO ? 'rosso' : 'verde'}.png`, fullPage: true });
  }
  /* fine carriera: il salvataggio si ritira e la pagina celebrativa si disegna da sola (guard 7.258.0) */
  await page.evaluate(() => window.__CPM_CAREER.patch({ retired: true }));
  await sleep(1800);
  /* l'apertura «Fine di un'era» copre la pagina: si chiude col suo «Continua →» */
  /* l'apertura ha due atti: «Continua →» poi «Rivivi la carriera →» */
  for (let k = 0; k < 4; k++) { const c = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(e => /^\s*(Continua|Rivivi la carriera)\s*→?\s*$/.test(e.textContent || '')); if (x) { x.click(); return true; } return false; }); if (!c) break; await sleep(900); }
  await apriTutto(page); await sleep(400);
  const tf = await page.evaluate(() => document.body.innerText);
  const fine = /Momenti Indimenticabili/i.test(tf);
  visti.fineCarriera = trova(tf);
  const finteFine = (tf.match(/\b(KCC|KEC|KCF)\b/g) || []).length;
  if (FOTO) await page.screenshot({ path: `${FOTO}/fine-carriera-${ROSSO ? 'rosso' : 'verde'}.png`, fullPage: true });

  if (!ROSSO) ok(finte >= 2, `B · sigle di fantasia a schermo in ${finte}/${SCHEDE.length} schede (>= 2, se no la prova non giudica)`);
  ok(fine, `B · pagina di fine carriera con «Momenti Indimenticabili» disegnata: ${fine}`);
  const tot = Object.values(visti).reduce((a, v) => a + v.length, 0);
  if (!ROSSO) {
    for (const k in visti) ok(visti[k].length === 0, `A · ${k}: sigle/nomi veri a schermo ${visti[k].length}${visti[k].length ? ' — ' + visti[k].slice(0, 4).join(' | ') : ''}`);
    ok(finteFine >= 3, `B · fine carriera: sigle di fantasia a schermo ${finteFine} (>= 3: i tre trofei europei)`);
  } else {
    ok(visti.fineCarriera.length > 0, `[rosso] A · fine carriera: sigle vere a schermo ${visti.fineCarriera.length} (> 0) — ${visti.fineCarriera.slice(0, 3).join(' | ')}`);
    ok(tot > visti.fineCarriera.length, `[rosso] A · schede della carriera: sigle vere a schermo ${tot - visti.fineCarriera.length} (> 0)`);
  }
  ok(errs.length === 0, `nessun errore di pagina${errs.length ? ' — ' + errs[0] : ''}`);
  await page.context().close();
} catch (e) { ok(false, 'eccezione: ' + String(e && e.stack || e).slice(0, 300)); }
await b.close(); srv.close();
console.log(`\nsigle-357 ${ROSSO ? '[ROSSO __CPM_NO_G357]' : '[verde]'}: ${oks.length} ok, ${fails.length} ko`);
process.exit(fails.length ? 1 : 0);
