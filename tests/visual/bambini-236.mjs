#!/usr/bin/env node
/* [PO-236, 14/10 «Non ci sono i bambini accompagnati dalla squadra avversaria» (foto: ingresso Spagna-Portogallo)] GUARDIANO DEI
   BAMBINI DELL'INGRESSO, CONTATI PER SQUADRA. Rosso __CPM_NO_236.
   Percorso vero, corpi accesi (GLB): una partita di CLUB, una della NAZIONALE (voce di calendario iniettata nella settimana corrente:
   playMatch → schermata di convocazione → «Gioca la partita») e una di COPPA, ingresso forzato (__CPM_FORCE_WALKOUT, come fila-227).
   Testimone __CPM_CGTRADER_CINEMA_ROSTER.ingresso236 (src/12, scritto a ogni fotogramma dell'ingresso): per squadra, calciatori
   DISEGNATI e bambini visibili accanto a un calciatore disegnato. Causa misurata: il roster degli highlight, attivo anche
   nell'ingresso, disegnava eroe + portiere + 3 vicini e i 22 bambini restavano soli (foto: nascondendo i bambini, 2 calciatori).
   VERDE: in ogni contesto, per ENTRAMBE le squadre, almeno il 90% dei bambini ha accanto il suo calciatore disegnato.
   ROSSO (__CPM_NO_236, il roster torna attivo nell'ingresso): la quota crolla — il guardiano deve accorgersene.
   Foto in out/bambini-236/. Uso: node bambini-236.mjs · CPM_CTX=club,nazionale,coppa */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const OUT = path.join(ROOT, 'tests', 'visual', 'out', 'bambini-236'); fs.mkdirSync(OUT, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const CTX = (process.env.CPM_CTX || 'club,nazionale,coppa').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

function salvataggio(ctx) {
  const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player || sv; const w = pl.week | 0;
  if (ctx === 'nazionale') pl.calendar = [{ matchday: 1470 + w, week: w, opponentName: 'Portogallo', isHome: true, played: false, type: 'national', competition: 'Amichevole Internazionale' }].concat(pl.calendar || []);
  if (ctx === 'coppa') { pl.cup = Object.assign({}, pl.cup || {}, { active: true, eliminated: false, champion: false, results: [], round: 0 });
    pl.calendar = [{ matchday: 1300 + w, week: w, opponentName: 'FC Albion', opponentId: (pl.calendar || []).find(m => m.opponentId) ? (pl.calendar || []).find(m => m.opponentId).opponentId : undefined, isHome: true, played: false, type: 'cup', cupRound: 0, cupRoundName: 'Ottavi' }].concat(pl.calendar || []); }
  return sv;
}
async function braccio(ctx, rosso) {
  const c = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await c.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = true; window.__CPM_WALKTEST74 = 1; if (r) window.__CPM_NO_236 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [salvataggio(ctx), rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  let convoc = null;
  if (ctx === 'nazionale') { await sleep(1500); const sc = await page.evaluate(() => !!document.querySelector('[data-cpm="convocazione235"]') || /Convocazione Nazionale/i.test(document.body.innerText));
    convoc = sc; if (sc) { await page.screenshot({ path: path.join(OUT, `convocazione-${rosso ? 'rosso' : 'verde'}.png`) });
      try { await page.getByText('Gioca la partita', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {} } }
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  const mctx = await page.evaluate(() => (document.body.innerText.split('\n').filter(x => x.trim()).slice(0, 4).join(' / ')).slice(0, 80));
  await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
  const S = { home: { campioni: 0, disegnati: 0, conBimbo: 0, bimbi: 0 }, away: { campioni: 0, disegnati: 0, conBimbo: 0, bimbi: 0 } }; let visto = false, n = 0, dbg = null, modo = null; const t0 = Date.now();
  while (Date.now() - t0 < 90000) { await sleep(400);
    const d = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const R = window.__CPM_CGTRADER_CINEMA_ROSTER;
      return { ph, modo: window.__CPM_HYPER_CASUAL_STATUS + (window.__CPM_CGTRADER_HIGHLIGHT_OPTIMIZED ? '+roster' : ''), sq: R && R.ingresso236 ? JSON.parse(JSON.stringify(R.ingresso236)) : null }; });
    if (d.ph !== 'walkout') { if (visto) break; continue; } visto = true; modo = d.modo; if (!d.sq) continue; n++; dbg = d.sq;
    for (const l of ['home', 'away']) { S[l].campioni++; S[l].disegnati += d.sq[l].disegnati; S[l].conBimbo += d.sq[l].conBimbo; S[l].bimbi += d.sq[l].bimbi; }
    if (n === 12) await page.screenshot({ path: path.join(OUT, `${ctx}-${rosso ? 'rosso' : 'verde'}.png`) }); }
  await c.close();
  const q = (l) => S[l].bimbi ? +(S[l].conBimbo / S[l].bimbi).toFixed(2) : null;
  return { ctx, rosso, pm, convoc, mctx, modo, visto, campioni: n, home: { ...S.home, quota: q('home') }, away: { ...S.away, quota: q('away') }, ultimo: dbg, errori: errs.slice(0, 2) };
}
const fail = [];
for (const ctx of CTX) for (const rosso of [false, true]) {
  const r = await braccio(ctx, rosso);
  console.log(`${ctx} ${rosso ? 'rosso' : 'verde'}: ingresso ${r.visto ? 'visto' : 'NON VISTO'} (${r.campioni} campioni, contesto ${JSON.stringify(r.mctx)}${r.convoc != null ? ', convocazione ' + r.convoc : ''}) · corpi ${r.modo} · casa: bambini col loro calciatore disegnato ${r.home.conBimbo}/${r.home.bimbi} (quota ${r.home.quota}, calciatori disegnati in media ${r.home.campioni ? (r.home.disegnati / r.home.campioni).toFixed(1) : '-'}) · ospiti ${r.away.conBimbo}/${r.away.bimbi} (quota ${r.away.quota}, disegnati ${r.away.campioni ? (r.away.disegnati / r.away.campioni).toFixed(1) : '-'}) · ultimo ${JSON.stringify(r.ultimo)}${r.errori.length ? ' ERR ' + r.errori[0] : ''}`);
  const ok = r.visto && r.home.quota != null && r.away.quota != null && r.home.quota >= 0.9 && r.away.quota >= 0.9;
  if (!rosso && !ok) fail.push(ctx + ' verde');
  if (rosso && ok) fail.push(ctx + ' rosso non riconosciuto');
}
await b.close(); srv.close();
console.log(fail.length ? '❌ ROSSO — ' + fail.join(' · ') : '✅ VERDE — bambini con entrambe le squadre in ogni contesto, prova del rosso riconosciuta');
process.exit(fail.length ? 1 : 0);
