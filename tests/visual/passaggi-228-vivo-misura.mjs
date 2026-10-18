/* [giro 32 PO-228 misura] Copia della sonda del collaudo 169 (collaudo/mirato-169: collaudo-169-stats.mjs), stessa procedura:
   partite VERE complete in autoplay, GLB spento, salvataggio fixtures/save-190-s12-ovr93.json, velocita' 4, una alla volta,
   un nome per partita (il seme dipende da avversario+stagione+settimana+nome). Aggiunte: PRE = prefisso dei nomi (default
   quello del collaudo, quindi IDX=1..20 rigioca le stesse 20 gare), FLAG = interruttori window da accendere (es. __CPM_NO_PASSVIVO).
   Misura, non giudica: esce 0 sempre.
   Uso: IDX=1,2,3 OUT=file.jsonl [PRE="Giro32 Serie B"] [FLAG=__CPM_NO_PASSVIVO] node passaggi-228-vivo-misura.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const IDX = (process.env.IDX || '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20').split(',').map(s => +s.trim()).filter(Boolean);
const OUT = process.env.OUT || null;
const PRE = process.env.PRE || 'Collaudo169 Atleta'; const FLAG = (process.env.FLAG || '').split(',').map(x => x.trim()).filter(Boolean);
const NOME = (k) => `${PRE} ${String(k).padStart(2, '0')}`;

async function gioca(b, url, k) {
  const t0 = Date.now(); const rec = { k, nome: NOME(k), err: null };
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  try {
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = NOME(k);
    await page.addInitScript(([s, FL]) => { for (const f of FL) window[f] = true; window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, FLAG]);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
    const tp = Date.now(); let ph = '';
    const TR = [];/* traccia (solo con TRACCIA=1): fase, minuto, scena del motore, tick */
    while (Date.now() - tp < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break;
      if (process.env.TRACCIA === '1') { try { TR.push(await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const S = M && M._S; return [window.__CPM_PHASE(), S ? S.min : null, S ? (S.scena ? 1 : 0) : null, S ? S.tick : null, S ? S.poss.stato : null]; })); } catch (e) {} }
      await sleep(process.env.TRACCIA === '1' ? 250 : 500); }
    if (TR.length) rec.traccia = TR;
    rec.fine = ph; rec.minutoMax = await page.evaluate(() => (window.__CPM_NUMHL_MAX ?? null));
    await sleep(2500);
    rec.tab = await page.evaluate(() => {
      const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ();
      const T = M && M.tabellino ? M.tabellino() : null;
      return T ? { home: T.home, away: T.away } : null;
    });
    rec.motore = await page.evaluate(() => {/* contatori interni: dove va il tempo del motore (tick decisi, tick fermi in scena, stati) */
      const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const S = M && M._S; if (!S) return null; const c = S.conta || {};
      const o = { tick: S.tick | 0, scenaTick: c.scenaTick | 0 }; for (const k of ['tenuta', 'volo', 'libero', 'fermo', 'rete', 'kickoff', 'scena', 'passaggi', 'occEroe']) o[k] = c[k] | 0;
      o.debito = { aperto: window.__CPM_DEB202T | 0, pagato: window.__CPM_MIN202 | 0, residuo: window.__CPM_DEB202 | 0, fischio: window.__CPM_FINE202 || null };
      o.rami = c.rami ? Object.fromEntries(Object.entries(c.rami).filter(([k]) => /circola|appoggio|ricicla|controllo|passa|conduci|cross/.test(k))) : null; return o;
    });
    rec.score = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE());
  } catch (e) { rec.err = String(e).slice(0, 240); }
  rec.sec = Math.round((Date.now() - t0) / 1000);
  await ctx.close();
  return rec;
}

const srv = await startServer();
const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const b = await launchBrowser();
for (const k of IDX) {
  const r = await gioca(b, url, k);
  if (OUT) fs.appendFileSync(OUT, JSON.stringify(r) + '\n');
  console.log(`#${k} fine=${r.fine} score=${JSON.stringify(r.score)} tiri=${r.tab ? r.tab.home.tiri + '/' + r.tab.away.tiri : '-'} pass=${r.tab ? r.tab.home.passaggi + '/' + r.tab.away.passaggi : '-'} ${r.sec}s${r.err ? ' ERR ' + r.err : ''}`);
}
await b.close(); srv.close();
process.exit(0);
