#!/usr/bin/env node
/* [giro 176 · PO-367 D1] MISURA DELLA REGIA VERTICALE DELLE AZIONI SALIENTI — e, con CPM_GUARDIANO=1, il guardiano `regia-176`.
   Per ogni formato (telefono 375x812 e 412x915, PC 1440x900) e per ogni famiglia d'azione (tiro, cross, testa, rigore,
   punizione, passaggio, dribbling, difesa, costruzione) forza CPM_K scene per famiglia (pagina nuova per formato, lezione 7.483)
   e campiona in due momenti:
     · SCELTA  (hl_choose, scelte armate): altezza dell'eroe in % della FINESTRA, % di finestra coperto dal pannello
       `[data-cpm="scelte"]`, posizione dell'eroe rispetto al pannello (testa sopra il bordo del pannello? piedi?);
     · GESTO   (hl_result, primi ~2 s dopo la risoluzione): altezza dell'eroe, eroe dentro il riquadro 3D, pallone e porta dentro.
   Sorgente unica dei numeri: `__CPM_REGIA176()` (src/12), che proietta in pixel di schermo — lo stesso riferimento del
   rettangolo DOM del pannello. GLB acceso e teatro attivo (__CPM_PRESENT=1), come da direttiva PO del 29/07.
   Uso:  CPM_CHROME=/opt/pw-browsers/chromium node regia-176-misura.mjs
         CPM_FMT=tel375,tel412,pc  CPM_K=2  CPM_FLAGS='{"__CPM_NO_G176":true}'  CPM_OUT=<file.json>  CPM_FOTO=<cartella>
   Guardiano (CPM_GUARDIANO=1): ROSSO se, nelle scene giudicate,
     Si giudicano i campioni del gesto in cui il SOGGETTO della regia e' l'eroe (sb=false): quando la storia passa al pallone la
     stretta si spegne per scelta (7.520/252) e quei campioni sono dichiarati a parte («finestra intera»).
     (1) TAGLIA: l'eroe al GESTO sotto la taglia minima (mediana per formato < CPM_H_MIN, default 0,15 della finestra, telefono e PC);
     (2) MIRA: in SCELTA i piedi dell'eroe sotto il bordo del pannello in piu' di CPM_SOTTO_MAX scene (default 0), oppure — dove il
         pannello copre il riquadro 3D — margine mediano piedi→pannello sotto CPM_MARG_MIN (default 0,12 della finestra);
     (3) PALLONE: al GESTO pallone fuori quadro in piu' del 10% dei campioni delle famiglie d'attacco (aggregato per formato) o del
         25% in una famiglia; PORTA fuori in piu' del 10% dei campioni su tiro e rigore (la camera guarda la porta per costruzione).
         Su testa e punizione la porta e' MISURATA e DICHIARATA, non giudicata: fuori anche col rosso (rapporto giro 176, §3); sul colpo
         di TESTA anche il pallone e' solo dichiarato: il cross in arrivo esce dal quadro anche col rosso (gi134: rosso 4/15, verde 2/17);
     (5) TARGHETTE (D11): piu' del 5% delle targhette disegnate sopra il corpo di un altro o sopra un'altra targhetta (__CPM_TAG176);
     (4) meno di 2 scene giudicate per famiglia (o meno di CPM_K se CPM_K<2): «non giudicato» = rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';

const FORMATI = { tel375: { width: 375, height: 812 }, tel412: { width: 412, height: 915 }, pc: { width: 1440, height: 900 } };
const FMTS = (process.env.CPM_FMT || 'tel375,tel412,pc').split(',');
const K = +(process.env.CPM_K || 2);
const FLAGS = process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {};
const FOTO = process.env.CPM_FOTO || '';
const GUARD = !!process.env.CPM_GUARDIANO;
const H_MIN = +(process.env.CPM_H_MIN || 0.15), SOTTO_MAX = +(process.env.CPM_SOTTO_MAX || 0), MARG_MIN = +(process.env.CPM_MARG_MIN || 0.12);
const NOMI = { shot: 'tiro', cross: 'cross', header: 'testa', penalty: 'rigore', freekick: 'punizione', pass: 'passaggio', dribble: 'dribbling', tackle: 'difesa', build: 'costruzione' };
const ATTACCO = new Set(['shot', 'cross', 'header', 'penalty', 'freekick']), PORTA = new Set(['shot', 'header', 'penalty', 'freekick']), PORTA_GIUDICATA = new Set(['shot', 'penalty']), PALLA_GIUDICATA = new Set(['shot', 'cross', 'penalty', 'freekick']);
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });

const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return +s[Math.floor(s.length / 2)].toFixed(3); };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const LETTURA = () => { const r = window.__CPM_REGIA176 && window.__CPM_REGIA176(); if (!r || r.err) return r || null;
  const el = document.querySelector('[data-cpm="scelte"]'); let pan = null;
  if (el) { const q = el.getBoundingClientRect(); const cs = getComputedStyle(el); if (q.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none') pan = { y: q.y, h: q.height, x: q.x, w: q.width }; }
  const armate = [...document.querySelectorAll('[data-cpm="scelte-righe"] button')].some(x => getComputedStyle(x).visibility !== 'hidden');
  return { ...r, pan, armate, ph: window.__CPM_PHASE && window.__CPM_PHASE() }; };
const dentro = (p, c, pan) => p && p.dav && p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h && !(pan && p.y > pan.y && p.x >= pan.x && p.x <= pan.x + pan.w);

const RIS = {};
for (const fmt of FMTS) {
  const ctx = await b.newContext({ viewport: FORMATI[fmt], deviceScaleFactor: FOTO ? 2 : 1, serviceWorkers: 'block' });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => console.log('  ⚠ pageerror', String(e.message || e).slice(0, 140)));
  await page.addInitScript(f => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'day'; for (const [k, v] of Object.entries(f)) window[k] = v; }, FLAGS);
  const { total } = await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 90000 }).catch(() => console.log('  ⚠ GLB non pronto'));
  const fam = await page.evaluate(() => { const o = {}; SITUATIONS.forEach((s, i) => { let t = '?'; try { const h = deriveHL(s, (s.acts || s.actions || [])[0]) || {}; t = h.type || h.hlType || '?'; } catch (e) { t = 'err'; } (o[t] = o[t] || []).push(i); }); return o; });
  console.log(`\n== ${fmt} ${FORMATI[fmt].width}x${FORMATI[fmt].height} · ${total} scene · famiglie ${Object.entries(fam).map(([k, v]) => k + ':' + v.length).join(' ')}`);
  const R = RIS[fmt] = {}; const TAG = { n: 0, su: 0, ss: 0 };
  for (const t of Object.keys(NOMI).filter(t => !process.env.CPM_FAM || process.env.CPM_FAM.split(',').includes(t))) {/* CPM_FAM=header,... solo per indagini: il guardiano gira su tutte */
    const L = fam[t] || []; const scelte = []; for (let j = 0; j < K && L.length; j++) scelte.push(L[Math.floor((j + 0.5) * L.length / K)]);
    const r = R[t] = { scene: [], hScelta: [], hGesto: [], hTutta: [], nPT: 0, pFT: 0, pan: [], marg: [], sotto: 0, eroeFuoriG: 0, nG: 0, pallaFuori: 0, nP: 0, portaFuori: 0, nPorta: 0, giudicate: 0 };
    for (const gi of scelte) {
      await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; delete window.__CPM_FORCE_KIND; });
      await page.evaluate(g => { window.__CPM_TAG176 = null; window.__CPM_FORCE_SIT(g, true); }, gi);
      let s = null; for (let k = 0; k < 40; k++) { await sleep(150); s = await page.evaluate(LETTURA).catch(() => null); if (s && s.ph === 'hl_choose' && s.armate) break; }
      await sleep(900); s = await page.evaluate(LETTURA).catch(() => null);
      if (!s || s.err || s.ph !== 'hl_choose') { console.log(`  ${t} gi${gi}: scelta NON GIUDICATA (${s && (s.err || s.ph)})`); continue; }
      const hS = (s.piedi.y - s.testa.y) / s.vh; const panF = s.pan ? s.pan.h / s.vh : 0;
      const sotto = !!(s.pan && s.piedi.y > s.pan.y && s.piedi.x >= s.pan.x && s.piedi.x <= s.pan.x + s.pan.w);
      const fuoriS = !dentro(s.testa, s.c, null) || !dentro(s.piedi, s.c, null);
      const rel = !s.pan ? 'nessun pannello' : sotto ? (s.testa.y > s.pan.y ? 'COPERTO dal pannello' : 'per meta\' sotto il pannello') : `sopra il pannello (margine ${((s.pan.y - s.piedi.y) / s.vh * 100).toFixed(0)}% schermo)`;
      if (FOTO) await page.screenshot({ path: path.join(FOTO, `${fmt}-${NOMI[t]}-gi${gi}-1-scelta.png`) }).catch(() => {});
      await page.evaluate(() => window.__CPM_RESOLVE(0)).catch(() => {});
      const hG = [], hT = []; let nE = 0, nPT = 0, pFT = 0, nG = 0, eF = 0, nP = 0, pF = 0, nPo = 0, poF = 0, fotoG = false;
      const t0 = Date.now();
      /* si campiona a TEMPO DI SCENA (finestra del gesto 0,4-2,2 s, contatore `g176.t` che corre in entrambi i bracci), mai a orologio:
         in headless il tempo di scena scorre a 1/2-1/6 del reale (PC piu' lento) e una finestra a orologio misurava la rampa d'ingresso */
      while (Date.now() - t0 < 40000) { await sleep(300); const g = await page.evaluate(LETTURA).catch(() => null); if (!g || g.err) continue; if (g.ph !== 'hl_result') { if (nG) break; continue; }
        const ts = g.g176 ? g.g176.t : 0; if (ts > 2.2 && nG) break; if (ts < 0.4 || ts > 2.2) continue;
        nG++; if (!g.sb) { hG.push((g.piedi.y - g.testa.y) / g.vh); nE++; } hT.push((g.piedi.y - g.testa.y) / g.vh); if (!dentro(g.piedi, g.c, g.pan) || !dentro(g.testa, g.c, g.pan)) eF++;
        if (ATTACCO.has(t)) { const fu = !dentro(g.palla, g.c, g.pan); nPT++; if (fu) pFT++; if (!g.sb) { nP++; if (fu) pF++; } }
        if (PORTA.has(t)) { nPo++; if (!dentro(g.porta[2], g.c, g.pan)) poF++; }
        if (FOTO && !fotoG && ts >= 0.6) { fotoG = true; await page.screenshot({ path: path.join(FOTO, `${fmt}-${NOMI[t]}-gi${gi}-2-gesto.png`) }).catch(() => {}); } }
      if (nG < 2 || nE < 2) { console.log(`  ${t} gi${gi}: gesto NON GIUDICATO (${nG} campioni)`); continue; }
      r.giudicate++; r.scene.push(gi); if (s.pan && s.pan.y < s.c.y + s.c.h - 4 && s.pan.w > 0.6 * s.c.w) r.marg.push((s.pan.y - s.piedi.y) / s.vh); r.hScelta.push(hS); r.hGesto.push(med(hG)); r.hTutta.push(med(hT)); r.nPT += nPT; r.pFT += pFT; r.pan.push(panF); if (sotto) r.sotto++;
      { const tg = await page.evaluate(() => window.__CPM_TAG176).catch(() => null); if (tg) { TAG.n += tg.n; TAG.su += tg.su; TAG.ss += tg.ss; } }
      r.nG += nG; r.eroeFuoriG += eF; r.nP += nP; r.pallaFuori += pF; r.nPorta += nPo; r.portaFuori += poF;
      console.log(`  ${NOMI[t].padEnd(11)} gi${String(gi).padEnd(3)} scelta: eroe ${(hS * 100).toFixed(1)}% · pannello ${(panF * 100).toFixed(0)}% · ${rel}${fuoriS ? ' · FUORI QUADRO' : ''} | gesto (eroe soggetto, ${nE} campioni): eroe ${(med(hG) * 100).toFixed(1)}% [finestra intera ${(med(hT) * 100).toFixed(1)}%, palla fuori ${pFT}/${nPT}] · fuori ${eF}/${nG} · palla fuori ${pF}/${nP} · porta fuori ${poF}/${nPo}`);
      await page.evaluate(() => { try { window.__CPM_FORCE_OUTCOME = null; } catch (e) {} });
      for (let k = 0; k < 30; k++) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (!/^hl_/.test(String(ph))) break; await sleep(300); }
    }
  }
  RIS[fmt]._tag = TAG; await ctx.close();
}
await b.close(); srv.close();

/* tabella riassuntiva */
console.log('\n=== RIEPILOGO (mediane; eroe in % dell\'altezza della FINESTRA) ===');
console.log('formato  famiglia     scene  eroe-scelta eroe-gesto pannello  sotto-pannello  eroe-fuori-gesto palla-fuori porta-fuori');
const issues = [];
for (const [fmt, R] of Object.entries(RIS)) for (const [t, r] of Object.entries(R)) { if (t === '_tag') continue;
  console.log(`${fmt.padEnd(8)} ${NOMI[t].padEnd(12)} ${String(r.giudicate).padEnd(6)} ${r.hScelta.length ? (med(r.hScelta) * 100).toFixed(1).padStart(6) + '%' : '   n.g.'}    ${r.hGesto.length ? (med(r.hGesto) * 100).toFixed(1).padStart(6) + '%' : '  n.g.'}   ${r.pan.length ? (med(r.pan) * 100).toFixed(0).padStart(4) + '%' : ' n.g.'}    ${r.sotto}/${r.giudicate}            ${r.eroeFuoriG}/${r.nG}            ${r.pallaFuori}/${r.nP}       ${r.portaFuori}/${r.nPorta}`);
  if (GUARD) {
    if (r.giudicate < Math.min(2, K)) issues.push(`${fmt} ${NOMI[t]}: NON GIUDICATO (${r.giudicate} scene)`);
    if (r.sotto > SOTTO_MAX) issues.push(`${fmt} ${NOMI[t]}: eroe sotto il pannello in ${r.sotto} scene`);
    if (PALLA_GIUDICATA.has(t) && r.nP && r.pallaFuori / r.nP > 0.25) issues.push(`${fmt} ${NOMI[t]}: pallone fuori quadro ${r.pallaFuori}/${r.nP}`);
    if (PORTA_GIUDICATA.has(t) && r.nPorta && r.portaFuori / r.nPorta > 0.10) issues.push(`${fmt} ${NOMI[t]}: porta fuori quadro ${r.portaFuori}/${r.nPorta}`);
  }
}
for (const [fmt, R0] of Object.entries(RIS)) { const TG = R0._tag || { n: 0, su: 0, ss: 0 }; const R = Object.fromEntries(Object.entries(R0).filter(([k]) => k !== '_tag'));
  const all = Object.values(R).flatMap(r => r.hGesto); const m = med(all);
  const mg = Object.values(R).flatMap(r => r.marg), mm = med(mg);
  let nP = 0, pF = 0, nPT = 0, pFT = 0; for (const [t, r] of Object.entries(R)) if (PALLA_GIUDICATA.has(t)) { nP += r.nP; pF += r.pallaFuori; nPT += r.nPT; pFT += r.pFT; }
  console.log(`${fmt}: (dichiarato, non giudicato) finestra intera 0,4-2,2 s compreso il volo col soggetto-pallone: eroe ${(med(Object.values(R).flatMap(r => r.hTutta)) * 100).toFixed(1)}% · pallone fuori ${pFT}/${nPT}`);
  console.log(`${fmt}: targhette disegnate ${TG.n} · su un corpo altrui ${TG.su} (${TG.n ? (TG.su / TG.n * 100).toFixed(1) : 'n.g.'}%) · su un'altra targhetta ${TG.ss}`);
  console.log(`${fmt}: mediana eroe al gesto ${m == null ? 'n.g.' : (m * 100).toFixed(1) + '%'} (minimo ${(H_MIN * 100).toFixed(0)}%) · margine piedi→pannello in scelta ${mm == null ? 'pannello fuori dal riquadro 3D' : (mm * 100).toFixed(1) + '%'} (${mg.length} scene, minimo ${(MARG_MIN * 100).toFixed(0)}%) · pallone fuori al gesto ${pF}/${nP}`);
  if (!GUARD) continue;
  if (m == null || m < H_MIN) issues.push(`${fmt}: eroe al gesto ${m == null ? 'non giudicato' : (m * 100).toFixed(1) + '%'} sotto la taglia minima ${(H_MIN * 100).toFixed(0)}%`);
  if (mm != null && mm < MARG_MIN) issues.push(`${fmt}: eroe troppo vicino al pannello nella scelta (margine mediano ${(mm * 100).toFixed(1)}% < ${(MARG_MIN * 100).toFixed(0)}%)`);
  if (/^tel/.test(fmt) && mm == null) issues.push(`${fmt}: margine sul pannello NON GIUDICATO (pannello mai visto sopra il riquadro 3D)`);
  if (!TG.n) issues.push(`${fmt}: targhette NON GIUDICATE (testimone __CPM_TAG176 vuoto)`); else if ((TG.su + TG.ss) / TG.n > 0.05) issues.push(`${fmt}: targhette su corpi o targhette altrui ${TG.su + TG.ss}/${TG.n} (tetto 5%)`);
  if (!nP || pF / nP > 0.10) issues.push(`${fmt}: pallone fuori quadro al gesto ${pF}/${nP} (tetto 10%)`); }
if (process.env.CPM_OUT) fs.writeFileSync(process.env.CPM_OUT, JSON.stringify({ flags: FLAGS, K, RIS }, null, 1));
if (GUARD) { const atteso = !!process.env.CPM_ATTESO_ROSSO;/* braccio rosso (__CPM_NO_G176): il guardiano DEVE dire rosso */
  if (issues.length) { console.log('\n❌ ROSSO regia-176:\n  - ' + issues.join('\n  - ')); if (atteso) { console.log('✅ braccio rosso: rosso come atteso'); } else process.exit(1); }
  else { console.log('\n✅ VERDE regia-176'); if (atteso) { console.log('❌ braccio rosso: il guardiano NON vede il rosso'); process.exit(1); } } }
console.log('FINE regia-176-misura');
