/* [PO-243 · collaudo 169, compito B] Intervista dopo la Nazionale, verificata su tre gare VERE e diverse.
   Dal salvataggio S12 (fixtures/save-190-s12-ovr93.json): Coppa delle Nazioni forzata con la stessa forma della
   sonda intervista-231 (nationsCupQueue + apriNC243), giocata in autoplay fino al fischio, a 412x915.
   Nome diverso per ogni gara (il seme dipende da avversario+stagione+settimana+nome).
   VERDE = compare l'intervista [data-cpm=intervista231] dopo il fischio. Misura e foto; esce 0 sempre.
   Uso: IDX=1,2,3 OUT=file.jsonl node collaudo-169-intervista.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const IDX = (process.env.IDX || '1,2,3').split(',').map(s => +s.trim()).filter(Boolean);
const OUT = process.env.OUT || null;
const FOTO = new URL('../../docs/collaudi/foto-mirato-169/', import.meta.url).pathname;
fs.mkdirSync(FOTO, { recursive: true });
const NOME = (k) => `Collaudo169 Naz ${String(k).padStart(2, '0')}`;

async function gara(b, port, k) {
  const rec = { k, nome: NOME(k), err: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = NOME(k);
    await page.addInitScript((s) => { window.__CPM_GLB = false; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s));
      window.__IV231 = null; const os = () => { if (window.__IV231) return; const el = document.querySelector('[data-cpm="intervista231"]'); if (el) window.__IV231 = { ctx: el.getAttribute('data-ctx') }; };
      document.addEventListener('DOMContentLoaded', () => { new MutationObserver(os).observe(document.body, { childList: true, subtree: true }); }); }, sv);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'].filter(n => n !== s.nation), matchIdx: 0, pts: 0, matches: [], done: false, season: s.season } }); });
    await sleep(1500);
    rec.pm = await page.evaluate(() => { try { return window.__CPM_CAREER.apriNC243(); } catch (e) { return 'err ' + e.message; } });
    for (let j = 0; j < 14; j++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null);
        const x = bs.find(q => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti|Salta e gioca/i.test(q.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(q.textContent || '')); if (x) x.click(); });
      await sleep(900); }
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), 2300 + k);
    const t0 = Date.now(); let ph; while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
    rec.fine = ph;
    const w0 = await page.evaluate(() => { try { return window.__CPM_CAREER.snapshot().week; } catch (e) { return null; } });
    for (let j = 0; j < 24 && !(await page.evaluate(() => !!window.__IV231)); j++) { await page.keyboard.press('Enter'); await sleep(500); }
    for (let j = 0; j < 30 && !(await page.evaluate(() => !!window.__IV231)); j++) { await sleep(700);
      if (j > 3) await page.evaluate(() => { if (window.__CPM_IVBLK231 && /settimana|mercato/.test(window.__CPM_IVBLK231)) { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }
        const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null);
        const x = bs.find(q => /^(Continua|Chiudi|Prosegui|Avanti|OK|Ho capito)/i.test((q.textContent || '').trim()) && !/Vivi la Settimana|Gioca/i.test(q.textContent || '')); if (x) x.click(); }); }
    rec.iv = await page.evaluate(() => window.__IV231 || null);
    rec.bloccoIV = await page.evaluate(() => window.__CPM_IVBLK231 || null);
    rec.settimanaPrima = w0; rec.settimanaDopo = await page.evaluate(() => { try { return window.__CPM_CAREER.snapshot().week; } catch (e) { return null; } });
    if (rec.iv) await page.screenshot({ path: `${FOTO}B-intervista-naz-${k}.png` }).catch(() => {});
    else await page.screenshot({ path: `${FOTO}B-nessuna-intervista-naz-${k}.png` }).catch(() => {});
  } catch (e) { rec.err = String(e).slice(0, 240); }
  await ctx.close();
  return rec;
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const k of IDX) {
  const r = await gara(b, port, k);
  if (OUT) fs.appendFileSync(OUT, JSON.stringify(r) + '\n');
  console.log(`naz#${k} pm=${r.pm} fine=${r.fine} intervista=${r.iv ? 'SI ' + r.iv.ctx : 'NO'} blocco=${r.bloccoIV} sett ${r.settimanaPrima}->${r.settimanaDopo}${r.err ? ' ERR ' + r.err : ''}`);
}
await b.close(); srv.close();
process.exit(0);
