#!/usr/bin/env node
/* [giro 87 PO-293, foto PO «In panchina ci devono essere glb on»] GUARDIANO: la panchina ha i corpi CGTrader dei giocatori.
   Prima del giro (misurato) con la formazione CGTrader di default (`!_hyperIntro` spegneva il ramo CH38 della panchina e il ramo
   «full» e' spento) i 16 panchinari (6 seduti + mister + vice per lato) erano figure PROCEDURALI per tutto l'ingresso e tutta la partita.
   Ora: corpi CGTrader (stesso pacchetto, LOD2, kit del club), prima che siano pronti la panchina e' VUOTA (mai il procedurale).
   Sul percorso vero (salvataggio → partita → ingresso in campo → partita), Chromium 412x915, GLB acceso, rete del banco.
   Misure per braccio (verde · rosso `__CPM_NO_PANCH293` = comportamento di prima):
     - INGRESSO: un campione ogni 350 ms del gancio `__CPM_PANCHINA904().tipi` {cgtrader, ch38, proc} → quando sono pronti i 16 corpi,
       quanti procedurali/CH38 si sono visti MAI;
     - PARTITA: tipi a regime, appoggio (piedi dal suolo, bacino dalla seduta, tolleranze dei 7.904: 0,15 / 0,25) campionato su 5 istanti
       con la camera sul dugout, triangoli e fps medi (8 s) con la camera di regia vera;
     - 0 errori di pagina.
   VERDE: ingresso senza alcun procedurale/CH38 e 16/16 CGTrader entro la fine dell'ingresso · partita 16/16 CGTrader, 0 procedurali, 0 CH38 ·
   appoggio entro tolleranza · fps >= CPM_FPS_REL (0,85) del rosso e >= CPM_FPS_ABS (3, pavimento headless software) · errori 0.
   ROSSO: il guardiano deve vederlo (almeno una violazione). CPM_FORZA_ROSSO=1 applica il rosso anche al braccio verde (prova del guardiano).
   Foto in out/panchina-293 e, se CPM_FOTO_DIR e' dato, anche li' (po293-<braccio>-<fase>.png).
   NON VERIFICATO: Chromium software (SwiftShader) non e' l'Android del PO: fps/triangoli sono indicativi, il confronto vale fra i due bracci.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node panchina-293.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, __dirname } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const FORZA = !!process.env.CPM_FORZA_ROSSO;
const PIEDI_MAX = 0.15, BACINO_MAX = 0.25;                       // tolleranze dei 7.904 (panchina-glb.mjs)
const FPS_REL = +(process.env.CPM_FPS_REL || 0.85), FPS_ABS = +(process.env.CPM_FPS_ABS || 3);
const OUT = path.join(__dirname, 'out', 'panchina-293'); fs.mkdirSync(OUT, { recursive: true });
const FOTO2 = process.env.CPM_FOTO_DIR || null; if (FOTO2) fs.mkdirSync(FOTO2, { recursive: true });
const W = 412, H = 915, WALK_MAX = +(process.env.CPM_WALK_MAX || 50000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function foto(cdp, get, nome, braccio) {
  let last = null;
  for (let i = 0; i < 6; i++) { await sleep(i ? 600 : 1200); const f = get(); if (!f) continue; if (last && f.equals(last)) break; last = f; }
  if (!last) return null;
  fs.writeFileSync(path.join(OUT, `${braccio}-${nome}.png`), last);
  if (FOTO2) fs.writeFileSync(path.join(FOTO2, `po293-${braccio}-${nome}.png`), last);
  return `${braccio}-${nome}.png`;
}
/* il TIPO dei corpi si legge dalla SCENA (indipendente dal gancio, che potrebbe mentire): ogni figlio diretto della scena nella fascia dei
   dugout (z -39..-35,5 · |x| 6..22) e' un panchinario; CGTrader = materiali con prefisso Hyper o Korward, CH38 = Ch38_*, altrimenti procedurale (nessuno scheletro).
   Conta solo cio' che e' ACCESO (visible lungo tutta la catena dei genitori): un corpo spento per taglio fuori-quadro e' contato a parte. */
/* posti di costruzione (_mkBench in src/12): 6 seduti a x = bx-7,5+i*2,8 z -38,1 · mister a bx∓5 z -36,0 · vice a bx∓7,5 z -36,2; il gancio, se li da', vince */
let POSTI = [-14, 14].flatMap(bx => [...Array(6)].map((_, i) => [bx - 7.5 + i * 2.8, -38.1]).concat([[bx + (bx < 0 ? 5 : -5), -36.0], [bx + (bx < 0 ? 7.5 : -7.5), -36.2]]));
const hook = async (page) => {
  const h = await page.evaluate(() => (window.__CPM_PANCHINA904 ? window.__CPM_PANCHINA904() : null)).catch(() => null);
  const posti = (h && h.posti) || POSTI;
  if (h && h.posti) POSTI = h.posti;
  const ids = (h && h.ids) || null;/* con il gancio nuovo i panchinari si riconoscono per uuid (le mascotte dell'ingresso passano accanto ai posti e non sono panchinari) */
  const sc = await page.evaluate(([posti, ids]) => {
    const T = window.__CPM3D; if (!T || !T.scene || !posti) return null; const t = { cgtrader: 0, ch38: 0, proc: 0, spenti: 0 };
    for (const o of T.scene.children) {
      const x = o.position.x, z = o.position.z; if (ids ? !ids.includes(o.uuid) : !posti.some(p => p && Math.abs(p[0] - x) < 0.35 && Math.abs(p[1] - z) < 0.35)) continue;
      if (o.isMesh && !o.isSkinnedMesh) continue;                       // pavimento, pareti, tetto, seduta
      let sk = 0, cg = 0, ch = 0; o.traverse(n => { if (n.isSkinnedMesh) sk++; const ms = n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : []; ms.forEach(m => { const nm = (m && m.name) || ''; if (/^(Hyper|Korward)/.test(nm)) cg++; if (/^Ch38/i.test(nm)) ch++; }); });
      if (!o.isGroup && !o.isObject3D) continue; if (!o.children.length) continue;
      if (!o.visible) { if (sk) t.spenti++; continue; }
      if (sk && cg) t.cgtrader++; else if (sk && ch) t.ch38++; else if (!sk && o.children.length > 2) t.proc++; else if (sk) t.cgtrader++;
    } return t; }, [posti, ids]).catch(() => null);
  if (h && sc) h.tipi = { cgtrader: sc.cgtrader, ch38: sc.ch38, proc: sc.proc }, h.scena = sc;
  else if (h) h.tipi = h.tipi || { cgtrader: 0, ch38: 0, proc: 0 };
  return h;
};
const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

async function giro(braccio) {
  const rosso = braccio === 'rosso' || FORZA;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_WALK245 = []; window.__CPM_GLB = true; if (o.r) window.__CPM_NO_PANCH293 = true; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: rosso });
  const out = { braccio: rosso && braccio !== 'rosso' ? braccio + '+forzato' : braccio, ingresso: { campioni: 0, procMax: 0, ch38Max: 0, cgMax: 0, prontoMs: null, ultimo: null }, partita: null, foto: {} };
  let cdp = null, ultimo = null;
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    cdp = await ctx.newCDPSession(page);
    cdp.on('Page.screencastFrame', e => { ultimo = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'png', maxWidth: W, maxHeight: H, everyNthFrame: 1 });
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 60; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      await sleep(700); }
    out.walk = (await ph()) === 'walkout';
    /* INGRESSO: un campione ogni ~350 ms finche' la fase e' walkout */
    const t0 = Date.now(); let visto = false, fotoIng = false, salta = false;
    while (Date.now() - t0 < 120000) {
      const p = await ph();
      if (p === 'walkout') {
        visto = true; const h = await hook(page);
        if (h && h.tipi) { const I = out.ingresso; I.campioni++; I.procMax = Math.max(I.procMax, h.tipi.proc); I.ch38Max = Math.max(I.ch38Max, h.tipi.ch38); I.cgMax = Math.max(I.cgMax, h.tipi.cgtrader);
          I.ultimo = { ...h.tipi, tot: h.tot };
          if (I.prontoMs == null && h.tot && h.tipi.cgtrader >= h.tot) I.prontoMs = Date.now() - t0;
          if (!fotoIng && Date.now() - t0 > 6000) { fotoIng = true; out.foto.ingresso = await foto(cdp, () => ultimo, 'ingresso', braccio); } }
      } else if (visto) break;
      if (visto && !salta && Date.now() - t0 > WALK_MAX) { salta = true; out.saltato = true;/* macchina lenta: l'ingresso a 2-3 fps dura minuti, lo si chiude col bottone vero (porta tutti al posto) */
        await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /Salta ingresso/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); }
      await sleep(350);
    }
    /* PARTITA: aspetto la fase di gioco e un po' di assestamento */
    for (let k = 0; k < 40; k++) { const p = await ph(); if (p === 'playing') break; await sleep(500); }
    await sleep(2500);
    const P = out.partita = { fase: await ph() };
    const h1 = await hook(page); P.tipi = h1 && h1.tipi; P.glb = h1 && h1.glb; P.tot = h1 && h1.tot;
    /* fps e triangoli con la camera di regia vera (8 s) */
    const fps = [], tri = []; const fe = Date.now() + 8000;
    while (Date.now() < fe) { const s = await page.evaluate(() => window.__CPM_FPS708 || null).catch(() => null); if (s != null) fps.push(s); const t = await page.evaluate(() => window.__CPM_TRI907 ? window.__CPM_TRI907() : null).catch(() => null); if (t != null) tri.push(t); await sleep(500); }
    P.fps = media(fps) != null ? +media(fps).toFixed(2) : null; P.triRegia = tri.length ? Math.round(media(tri)) : null;
    try { await page.evaluate(() => { window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false); window.__CPM_FORCE_SIT && window.__CPM_FORCE_SIT(0, true); }); await sleep(1500); } catch (e) {}/* la scena 3D e' visibile solo negli highlight: se ne apre uno per le foto */
    /* camera sul dugout: appoggio su 5 istanti (la clip si muove) e triangoli */
    const ap = { piedi: [], bacino: [] }; const tri2 = []; let fuori = 0;
    for (const lato of ['home', 'away']) {
      /* camera FRONTALE dal campo (la laterale del 7.904 qui finisce contro i cartelloni): inquadra tutta la fila di 6 + mister e vice */
      await page.evaluate(l => { const bx = l === 'away' ? 14 : -14; window.__CPM_CAM904 = { x: bx + (bx < 0 ? 3 : -3), y: 7.5, z: -30.5, lx: bx + (bx < 0 ? 3 : -3), ly: 0.6, lz: -38.2 }; }, lato); await sleep(5000);
      for (let i = 0; i < 5; i++) { const h = await hook(page); if (h && h.appoggio) { h.appoggio.filter(a => a.home === (lato === 'home')).forEach(a => { if (a.piedi != null) ap.piedi.push(a.piedi); if (a.bacino != null) ap.bacino.push(a.bacino); }); if (h.tri != null) tri2.push(h.tri); fuori = Math.max(fuori, h.fuori || 0); P.tipiDugout = h.tipi; } await sleep(700); }
      out.foto['dugout-' + lato] = await foto(cdp, () => ultimo, 'dugout-' + lato, braccio);
    }
    P.piediMax = ap.piedi.length ? +Math.max(...ap.piedi).toFixed(3) : null; P.bacinoMax = ap.bacino.length ? +Math.max(...ap.bacino).toFixed(3) : null; P.nPiedi = ap.piedi.length; P.nBacino = ap.bacino.length;
    P.triDugout = tri2.length ? Math.round(media(tri2)) : null; P.fuoriQuadro = fuori;
    await page.evaluate(() => window.__CPM_CAM_RESET904 && window.__CPM_CAM_RESET904()); await sleep(1500);
    out.foto.partita = await foto(cdp, () => ultimo, 'partita', braccio);
  } catch (e) { out.errore = String(e.message).slice(0, 200); }
  out.errori = errs.slice(0, 3);
  try { await cdp?.send('Page.stopScreencast'); } catch (e) {}
  await ctx.close(); return out;
}
const R = {}; for (const br of BRACCI) { R[br] = await giro(br); console.log(br.toUpperCase() + ' ' + JSON.stringify(R[br])); }
await b.close(); srv.close();
if (process.env.CPM_SOLO_MISURA) process.exit(0);

/* il giudizio: una funzione sola, applicata al verde (deve dare []) e al rosso (deve dare qualcosa) */
function giudica(X, fpsRif) {
  const v = [];
  if (!X || X.errore || !X.walk || !X.partita) return ['non misurato ' + JSON.stringify(X && (X.errore || X.walk))];
  const I = X.ingresso, P = X.partita;
  if (I.campioni < 8) v.push(`ingresso: ${I.campioni} campioni (cieco)`);
  if (I.procMax > 0) v.push(`ingresso: fino a ${I.procMax} panchinari PROCEDURALI visibili`);
  if (I.ch38Max > 0) v.push(`ingresso: ${I.ch38Max} panchinari CH38`);
  if (!(I.ultimo && P.tot && I.ultimo.cgtrader >= P.tot)) v.push(`ingresso: a fine ingresso i corpi CGTrader sono ${I.ultimo ? I.ultimo.cgtrader : '?'}/${P.tot || 16}`);
  if (!P.tipi || P.fase !== 'playing') v.push('partita: tipi non letti o fase ' + P.fase);
  else { if (P.tipi.proc > 0) v.push(`partita: ${P.tipi.proc} procedurali`); if (P.tipi.ch38 > 0) v.push(`partita: ${P.tipi.ch38} CH38`); if (P.tipi.cgtrader < (P.tot || 16)) v.push(`partita: CGTrader ${P.tipi.cgtrader}/${P.tot}`); }
  if (P.nPiedi < 16) v.push(`appoggio: letti solo ${P.nPiedi} piedi su 16 per istante x5`);
  if (P.piediMax == null || P.piediMax > PIEDI_MAX) v.push(`appoggio: piedi dal suolo ${P.piediMax} > ${PIEDI_MAX}`);
  if (P.bacinoMax == null || P.bacinoMax > BACINO_MAX) v.push(`appoggio: bacino dalla seduta ${P.bacinoMax} > ${BACINO_MAX}`);
  if (P.fps == null) v.push('fps non misurati'); else { if (P.fps < FPS_ABS) v.push(`fps ${P.fps} < ${FPS_ABS}`); if (fpsRif != null && P.fps < fpsRif * FPS_REL) v.push(`fps ${P.fps} < ${FPS_REL} x ${fpsRif.toFixed(2)} (rosso)`); }
  if (X.errori.length) v.push('errori di pagina ' + X.errori.join(' | '));
  return v;
}
const g = [];
const fpsRosso = R.rosso && R.rosso.partita ? R.rosso.partita.fps : null;
if (R.verde) { const v = giudica(R.verde, FORZA ? null : fpsRosso); v.forEach(x => g.push((FORZA ? 'verde(forzato) ' : 'verde ') + x)); }
if (R.rosso) { const v = giudica(R.rosso, null).filter(x => !/^fps/.test(x)); if (!v.length) g.push('rosso: il difetto non si vede ' + JSON.stringify(R.rosso.partita && R.rosso.partita.tipi)); }
if (g.length) { console.log('❌ panchina-293'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ panchina-293 verde (16/16 corpi CGTrader in ingresso e in partita, 0 procedurali, 0 CH38, piedi/bacino in tolleranza, fps >= ' + FPS_REL + ' x rosso) e il rosso si vede');
