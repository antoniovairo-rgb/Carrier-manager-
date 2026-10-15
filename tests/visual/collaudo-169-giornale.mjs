/* [PO-244 · collaudo 169, compito C] Verifica delle correzioni del giro 19 sul giornale del dopo partita,
   una per una, con partite VERE fino al giornale (salvataggio S12) e foto a 412x915 e a 360x800.
   · lega  : gara di campionato (settimana 38 = 34a giornata). Atteso: «Stag. 12 · G. 34» (giro 19: NON «G. 38»).
   · naz   : Coppa delle Nazioni, girone, gara 1. Atteso: «FASE A GIRONI · GIORNATA 1/3», mai «eliminazione».
   · rosso : ROSSO=1 accende __CPM_NO_GIORN244 (il difetto di prima) sulla gara scelta.
   Misura e foto; esce 0 sempre. Uso: TIPO=lega|naz ROSSO=0|1 NOME=... OUT=file.jsonl node collaudo-169-giornale.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const TIPO = process.env.TIPO || 'lega';
const ROSSO = process.env.ROSSO === '1';
const NOME = process.env.NOME || `Collaudo169 Giornale ${TIPO}${ROSSO ? ' R' : ' V'}`;
const OUT = process.env.OUT || null;
const FOTO = new URL('../../docs/collaudi/foto-mirato-169/', import.meta.url).pathname;
fs.mkdirSync(FOTO, { recursive: true });

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const save = JSON.parse(JSON.stringify(SAVE)); const p = save.player || save; p.name = NOME;
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; if (o.r) window.__CPM_NO_GIORN244 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: save, r: ROSSO });
const out = { tipo: TIPO, rosso: ROSSO, nome: NOME };
try {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  if (TIPO === 'naz') { await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'].filter(n => n !== s.nation), matchIdx: 0, pts: 0, matches: [], done: false, season: s.season } }); }); await sleep(1500); }
  out.pm = await page.evaluate(n => { try { return n ? window.__CPM_CAREER.apriNC243() : window.__CPM_CAREER.playMatch(); } catch (e) { return 'err ' + e.message; } }, TIPO === 'naz');
  for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null);
      const x = bs.find(q => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti|Salta e gioca/i.test(q.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(q.textContent || '')); if (x) x.click(); });
    await sleep(900); }
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2444, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph; while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
  out.fine = ph;
  /* il giornale si apre dal fischio: si preme avanti finche' compare la testata */
  for (let k = 0; k < 16; k++) { const T = await page.evaluate(() => document.body.innerText);
    if (/Stag\. \d+ · (G|Sett)\. \d+/.test(T) || /GIORNATA|Giornata \d/.test(T) && /GIORNALE|Rassegna|Stagione \d+ · /i.test(T)) break;
    await page.mouse.click(206, 460).catch(() => {}); await page.keyboard.press('Enter').catch(() => {}); await sleep(1200); }
  await sleep(1500);
  const T = await page.evaluate(() => document.body.innerText);
  out.stag = (T.match(/Stag\. \d+ · (G|Sett)\. \d+/) || [null])[0];
  out.righeGiornata = T.split('\n').filter(l => /Giornata|Settimana|Stagione \d+ ·|GIORNATA|FASE|Fase|eliminazione|Amichevole|Stag\./.test(l)).map(l => l.trim().slice(0, 120)).slice(0, 12);
  out.elim = /eliminazione/i.test(T);
  out.gironi = /gironi|GIORNATA \d\/3|Giornata \d di 3|Giornata \d\/3/i.test(T);
  await page.screenshot({ path: `${FOTO}C-giornale-${TIPO}${ROSSO ? '-rosso' : ''}-412.png` }).catch(() => {});
  /* la RASSEGNA STAMPA (src/13) compare dopo il pannello di fine partita: si prosegue finche' la sua riga data appare */
  out.rassegna = null; out.passi = [];
  for (let k = 0; k < 14 && !out.rassegna; k++) {
    const R = await page.evaluate(() => document.body.innerText);
    const m = R.match(/Stagione \d+ · (Giornata|Settimana) \d+/);
    if (m) { out.rassegna = m[0]; out.rassegnaElim = /eliminazione/i.test(R); out.rassegnaGironi = /gironi|Giornata \d\/3/i.test(R); break; }
    const btn = await page.evaluate(() => [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null).map(x => (x.textContent || '').trim().slice(0, 40)).filter(Boolean).slice(0, 8));
    out.passi.push(btn.join(' | '));
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null);
      const x = bs.find(q => /Continua|Avanti|Prosegui|Leggi|Rassegna|^OK/i.test((q.textContent || '').trim()) && !/Vivi la Settimana|Gioca|Torna/i.test(q.textContent || '')); if (x) x.click(); });
    await page.mouse.click(206, 700).catch(() => {}); await sleep(1400);
  }
  if (out.rassegna) await page.screenshot({ path: `${FOTO}C-rassegna-${TIPO}${ROSSO ? '-rosso' : ''}-412.png` }).catch(() => {});
  await page.setViewportSize({ width: 360, height: 800 }); await sleep(900);
  await page.screenshot({ path: `${FOTO}C-giornale-${TIPO}${ROSSO ? '-rosso' : ''}-360.png` }).catch(() => {});
  if (out.rassegna) await page.screenshot({ path: `${FOTO}C-rassegna-${TIPO}${ROSSO ? '-rosso' : ''}-360.png` }).catch(() => {});
  const orizz = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  out.scrollOrizzontale360 = orizz;
} catch (e) { out.errore = String(e.message).slice(0, 160); }
out.errori = errs.slice(0, 3);
if (OUT) fs.appendFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify(out, null, 1));
await page.close(); await b.close(); srv.close();
process.exit(0);
