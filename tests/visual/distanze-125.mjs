#!/usr/bin/env node
/* [giro 125 PO-328, SOLA MISURA] «Alcuni highlights sono da distanza troppo importante, in particolare i colpi di testa».
   Censimento della distanza eroe↔porta al CONTATTO per OGNI highlight dell'eroe sul flusso vero (partite dai salvataggi s1/s5/s12,
   politica casuale seedata, tickMs 150). Testimone: __CPM_CONT121 (src/12, fotogramma in cui l'arco PARTE; gx = 48,6 - x eroe, z, db =
   distanza eroe↔origine dell'arco) svuotato a ogni giro di poll (l'anello e' a 40 voci). Abbinamento scena: __CPM_CURSIT al hl_choose,
   esito: __CPM_RES218. Nessuna modifica a src/.
   Uso: CPM_ARM=acceso|spento CPM_GLB=0|1 CPM_SALVA=s1,s5,s12 CPM_SEMI=1,2,3 CPM_PAR=3 CPM_OUT=file.json node distanze-125.mjs
   «spento» = __CPM_NO_G117A,G119P,G121H,G121C,G121M (= 7.999.185). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const ARM = process.env.CPM_ARM || 'acceso', GLB = process.env.CPM_GLB === '1';
const SEMI = (process.env.CPM_SEMI || '1,2,3,4,5,6,7,8').split(',').map(Number);
const SAVES = (process.env.CPM_SALVA || 's1,s5,s12').split(',');
const PAR = +(process.env.CPM_PAR || 3), OUT = process.env.CPM_OUT || `/tmp/d125-${ARM}-${GLB ? 'glb' : 'proc'}.json`;
const TMAX = +(process.env.CPM_TMAX || 420000);
const srv = await startServer(); const b = await launchBrowser();
async function gioca(sk, sd) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[sk]); let ls;
  if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, arm, glb]) => { window.__CPM_GLB = !!glb; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;
    if (arm === 'spento') { window.__CPM_NO_G117A = 1; window.__CPM_NO_G119P = 1; window.__CPM_NO_G121H = 1; window.__CPM_NO_G121C = 1; window.__CPM_NO_G121M = 1; }
    for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} } }, [ls, ARM, GLB]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const sit = {}, cont = []; const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < TMAX) {
    const st = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const c = window.__CPM_CURSIT ? window.__CPM_CURSIT() : null;
      const L = (window.__CPM_CONT121 || []).splice(0); const t = window.__CPM_SCOREMIN ? 0 : 0; return { ph, c, L }; }).catch(() => null);
    if (!st) break; ph = st.ph; if (ph === 'ended' || ph === 'ceremony') break;
    if (st.c && (ph === 'hl_choose' || ph === 'hl_result' || ph === 'hl_move' || ph === 'hl_intro') && !sit[st.c.i]) sit[st.c.i] = st.c;
    for (const x of st.L) cont.push(x);
    await sleep(100);
  }
  const R = await page.evaluate(() => window.__CPM_RES218 || []).catch(() => []);
  const mm = await page.evaluate(() => { try { return window.__CPM_SCORE ? window.__CPM_SCORE() : null; } catch (e) { return null; } }).catch(() => null);
  await ctx.close(); return { sk, sd, ph, sit, cont, R, tab: mm };
}
const lavori = []; for (const sk of SAVES) for (const sd of SEMI) lavori.push({ sk, sd });
const fatti = new Array(lavori.length); let p = 0;
await Promise.all(Array.from({ length: Math.min(PAR, lavori.length) }, async () => { while (p < lavori.length) { const i = p++;
  try { fatti[i] = await gioca(lavori[i].sk, lavori[i].sd); } catch (e) { fatti[i] = { ...lavori[i], err: String(e).slice(0, 100), sit: {}, cont: [], R: [] }; }
  const f = fatti[i]; console.log(`${ARM}${GLB ? '/glb' : ''} ${f.sk} seme ${f.sd} fine ${f.ph} scene ${Object.keys(f.sit).length} contatti ${f.cont.length}${f.err ? ' ERR ' + f.err : ''}`);
  fs.writeFileSync(OUT, JSON.stringify({ arm: ARM, glb: GLB, partite: fatti.filter(Boolean) })); } }));
await b.close(); srv.close();
console.log('scritto', OUT, 'contatti totali', fatti.reduce((n, f) => n + f.cont.length, 0));
