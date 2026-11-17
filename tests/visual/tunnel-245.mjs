#!/usr/bin/env node
/* [giro 245 PO-510 «il cartellone pubblicitario all'uscita del tunnel e' di intralcio. Il tunnel dovrebbe essere proprio a meta'
   campo tra le due panchine»] GUARDIANO sul percorso vero (salvataggio → partita → ingresso in campo), una pagina nuova per stadio.
   Per ogni tipologia di stadio (i 14 template, piu' Nazionale, partita normale di giorno, stadio piccolo) il testimone del gioco
   __CPM_G245W (src/12, inerte, armato solo da qui) scrive a OGNI fotogramma dell'ingresso:
   · gli oggetti fermi etichettati (cartelloni, panchine, pensiline, pareti del tunnel) come scatole in coordinate mondo;
   · i corpi che camminano (22 + bambini) contro le scatole (cerchio di raggio 0,35 al suolo) e contro le figure ferme a bordo campo;
   · la bocca del tunnel proiettata nella camera dell'ingresso.
   VERDE: bocca a |x| <= 1 in ogni tipologia · panchine simmetriche rispetto alla bocca entro 0,5u (casa a sinistra, ospiti a destra) ·
   zero fotogrammi con un corpo dentro un oggetto o addosso a una figura ferma · nessun oggetto non etichettato nel varco ·
   la camera dell'ingresso inquadra la bocca in almeno il 90% dei fotogrammi fra 1,5 e 3,0 s di scena.
   «Non giudicato» (ingresso non visto, meno di 30 fotogrammi, meno di 12 corpi usciti, meno di 5 fotogrammi di camera) = ROSSO.
   ROSSO (CPM_PROVA_ROSSO=1 → window.__CPM_NO_G245: la disposizione di prima, bocca a x -22): il guardiano DEVE vedere la bocca
   fuori centro e almeno un corpo dentro un oggetto; esce 0 solo se li vede.
   CPM_SCENARI=nome1,nome2 · CPM_TFINE=0 tutto l'ingresso (default: i primi 9 s di scena) · CPM_GLB=1 corpi 3D accesi (foto) · CPM_FOTO_DIR=<cartella> · CPM_TAG=prima|dopo|rosso · CPM_SOLO_MISURA=1.
   [giro 255, decisioni PO 17/11 «Sì, al centro» · «Sì, toglila» — rosso window.__CPM_NO_G255 = schieramento a sinistra e panca bassa]
   Lo stesso giro giudica anche, col testimone __CPM_G255W (src/12, inerte):
   · SCHIERAMENTO: le due file a cavallo della meta' campo (x medio dei posti entro ±1, una fila per parte); negli stadi «tutto»
     (ingresso intero) anche la x media dei 23 corpi ARRIVATI entro ±1, zero coppie di corpi a meno di 0,5 fra i centri in tutto
     l'ingresso, e la camera del gioco a squadre schierate con la fila nel quadro nel 90% dei fotogrammi: almeno 11 corpi su 23 nella
     carrellata «schierati», almeno 8 nell'«inno» (camera vicina) — sono i minimi MISURATI sul gioco di prima (12 e 8: la camera e' in
     verticale e scorre lungo la fila), fissati dopo la misura a copertura piena; altezza apparente media dei corpi almeno 0,06;
   · PANCA BASSA: nessun oggetto «panca-stadio»/«pensilina-stadio» (resta la panchina vera, una per squadra ai lati del tunnel);
   · SOSTITUZIONI (scenari «sost-*», partita vera, ingresso e uscita dell'eroe forzati dal banco): zero fotogrammi con l'eroe
     dentro un oggetto fermo; meno di 10 fotogrammi per verso, o nessuna camminata che attraversi la fascia dei cartelloni = non giudicato = rosso.
   CPM_PROVA_ROSSO=255 → __CPM_NO_G255: il guardiano DEVE vedere schieramento fuori centro e panca bassa in ogni stadio e l'eroe
   dentro un oggetto nelle sostituzioni. CPM_TUTTO=1 = ingresso intero in ogni stadio (misure e foto).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tunnel-245.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ROSSO = !!process.env.CPM_PROVA_ROSSO, R255 = process.env.CPM_PROVA_ROSSO === '255', TUTTO = process.env.CPM_TUTTO === '1', GLB = process.env.CPM_GLB === '1', TAG = process.env.CPM_TAG || (ROSSO ? 'rosso' : 'dopo');
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro245'); fs.mkdirSync(DIR, { recursive: true });
const TFINE = +(process.env.CPM_TFINE || 9);/* secondi di SCENA dopo i quali si chiude lo stadio (0 = tutto l'ingresso) */
const TPL = { provincia: 6000, comunale: 15000, storico_it: 40000, moderno_it: 45000, inglese: 35000, tedesco: 60000, spagnolo: 70000, francese: 30000, olandese: 25000, sudamericano: 50000, borgo: 3000, catino: 25000, mattoni: 28000, arena: 60000 };
const PIANO = [
  ...Object.keys(TPL).map(t => ({ nome: t, tpl: t, cap: TPL[t], tipo: 'derby', tod: 'night', tutto: t === 'comunale' })),
  { nome: 'nazionale', tipo: 'nazionale', tod: 'day', tutto: true },
  { nome: 'normale-giorno', tipo: 'normale', tod: 'day', tutto: true },
  { nome: 'piccolo', tpl: 'provincia', cap: 1500, tipo: 'big', tod: 'dusk' },
  /* [giro 255] sostituzioni: tre stili di bocca (telescopico, portale in cemento, pensilina del borgo) */
  { nome: 'sost-comunale', tpl: 'comunale', cap: TPL.comunale, tipo: 'normale', tod: 'night', sost: true },
  { nome: 'sost-inglese', tpl: 'inglese', cap: TPL.inglese, tipo: 'normale', tod: 'night', sost: true },
  { nome: 'sost-borgo', tpl: 'borgo', cap: TPL.borgo, tipo: 'normale', tod: 'night', sost: true },
];
const SOLO = process.env.CPM_SCENARI ? process.env.CPM_SCENARI.split(',') : null;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function ingresso(c) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = !!o.glb; window.__CPM_TOD = o.tod; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_G245W = []; window.__CPM_G255W = []; if (o.r255) window.__CPM_NO_G255 = true;
    if (o.tipo) window.__CPM_TIPO206 = o.tipo; if (o.tpl) { window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; }
    if (o.r && !o.r255) window.__CPM_NO_G245 = true; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: ROSSO, r255: R255, tpl: c.tpl || null, cap: c.cap || 0, tipo: c.tipo, tod: c.tod, glb: GLB });
  const out = { nome: c.nome, foto: [] };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 70; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      await sleep(700); }
    out.walk = (await ph()) === 'walkout';
    if (c.sost) { await sost(page, ph, out, c); out.errori = errs.slice(0, 3); await ctx.close(); return out; }
    const TF = (c.tutto || TUTTO) ? 0 : TFINE; const rAlto = ['nazionale', 'finale', 'europea'].includes(c.tipo) ? 'inno' : 'schierati';/* la foto dall'alto si fa nell'ULTIMA regia a squadre schierate, dopo 15 suoi fotogrammi giudicabili */
    /* si attende un evento (il tempo di SCENA scritto dal testimone), mai un tempo fisso: foto dalla camera dell'ingresso a 2,4 s di scena,
       foto dall'alto (camera fissa di prova __CPM_CAM904) a 3,4 s — dopo la finestra in cui si giudica la camera. */
    const t0 = Date.now(); const fatte = new Set(); let visto = out.walk;
    while (Date.now() - t0 < +(process.env.CPM_TMAX || 600000)) {
      const p = await ph(); if (p === 'walkout') visto = true; else if (visto) break;
      if (TF > 0 && (await page.evaluate(() => { const W = window.__CPM_G245W || []; return W.length ? W[W.length - 1].t : 0; }).catch(() => 0)) >= TFINE) break;/* la strada dalla bocca alla linea laterale si percorre nei primi secondi: oltre, il guardiano non impara altro */
      const q = await page.evaluate(() => { const W = window.__CPM_G245W || []; const e = W[W.length - 1]; const S = window.__CPM_G245 || null; return e ? [e.t, S && S.tunnel ? S.tunnel.x : null] : null; }).catch(() => null);
      if (q && process.env.CPM_FOTO !== '0') {
        if (!fatte.has('camera') && q[0] >= 2.4) { fatte.add('camera'); const f = `${TAG}-${c.nome}${GLB ? '-glb' : ''}-camera.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 80 }).catch(() => {}); out.foto.push(f); }
        else if (!fatte.has('alto') && q[0] >= 3.4) { fatte.add('alto');
          await page.evaluate(x => { window.__CPM_CAM904 = { x: x, y: 44, z: -24, lx: x, ly: 0, lz: -36 }; }, (q[1] != null ? q[1] : -22)); await sleep(GLB ? 2500 : 900);
          await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }).then(async st => { const f = `${TAG}-${c.nome}${GLB ? '-glb' : ''}-alto.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 80 }).catch(() => {}); out.foto.push(f); await st.evaluate(n => n.remove()).catch(() => {}); }).catch(() => {});
          await page.evaluate(() => { try { delete window.__CPM_CAM904; } catch (e) { window.__CPM_CAM904 = null; } }); } }
      /* [giro 255] a squadre schierate: foto dalla camera del gioco al primo fotogramma con tutti arrivati (regia «schierati» o «inno»);
         dopo altri 14 fotogrammi giudicabili, foto dall'alto (camera fissa di prova): da li' in poi la camera non si giudica piu' (iAlto). */
      if (TF === 0 && process.env.CPM_FOTO !== '0' && !fatte.has('sch-alto')) {
        const k = await page.evaluate(ra => { const W = window.__CPM_G255W || []; let n = 0, u = 0, ni = 0; for (const e of W) if (!e.sub && e.arr === e.n) { if (e.r === 'schierati' || e.r === 'inno') n++; if (e.r === ra) u++; if (e.r === 'inno') ni++; } return [n, W.length, u, ni]; }, rAlto).catch(() => [0, 0, 0, 0]);
        if (k[0] >= 1 && !fatte.has('sch')) { fatte.add('sch'); const f = `${TAG}-${c.nome}${GLB ? '-glb' : ''}-schierati.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 80 }).catch(() => {}); out.foto.push(f); }
        else if (k[3] >= 4 && !fatte.has('inno')) { fatte.add('inno'); const f = `${TAG}-${c.nome}${GLB ? '-glb' : ''}-inno.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 80 }).catch(() => {}); out.foto.push(f); }
        else if (k[2] >= 15) { fatte.add('sch-alto'); out.iAlto = k[1];
          await page.evaluate(() => { window.__CPM_CAM904 = { x: -4, y: 46, z: 24, lx: -4, ly: 0, lz: -12 }; }); await sleep(GLB ? 2500 : 900);
          await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }).then(async st => { const f = `${TAG}-${c.nome}${GLB ? '-glb' : ''}-schierati-alto.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 80 }).catch(() => {}); out.foto.push(f); await st.evaluate(n => n.remove()).catch(() => {}); }).catch(() => {});
          await page.evaluate(() => { try { delete window.__CPM_CAM904; } catch (e) { window.__CPM_CAM904 = null; } }); } }
      await sleep(250); }
    const D = await page.evaluate(() => ({ S: window.__CPM_G245 || null, W: window.__CPM_G245W || [], err: window.__CPM_G245ERR || null, S5: window.__CPM_G255 || null, W5: (window.__CPM_G255W || []).filter(e => !e.sub), err5: window.__CPM_G255ERR || null }));
    /* [giro 255] schieramento */
    out.S5 = D.S5; out.err5 = D.err5; out.tutto = TF === 0;
    { const W5 = D.W5, arr = W5.filter(e => e.arr === e.n), giud = arr.filter((e, i) => (e.r === 'schierati' || e.r === 'inno') && (out.iAlto == null || W5.indexOf(e) < out.iAlto));
      const conCc = W5.filter(e => e.cc > 0);
      out.sch = { frames: W5.length, arrivati: arr.length, mx: arr.length ? [Math.min(...arr.map(e => e.mx)), Math.max(...arr.map(e => e.mx))] : null, cc: conCc.length, ccEs: conCc.length ? { t: conCc[0].t, ce: conCc[0].ce } : null, dmin: W5.length ? Math.min(...W5.map(e => e.dm)) : null,
        cam: { n: giud.length, ok: giud.filter(e => e.inq >= (e.r === 'inno' ? 8 : 11)).length, nInno: giud.filter(e => e.r === 'inno').length, inqMin: giud.length ? Math.min(...giud.map(e => e.inq)) : null, alt: giud.length ? +(giud.reduce((a, e) => a + e.alt, 0) / giud.length).toFixed(3) : null, regie: [...new Set(giud.map(e => e.r))], serie: W5.filter(e => e.r === 'schierati' || e.r === 'inno').map(e => [e.t, e.r[0], e.arr, e.inq, e.alt]), es: giud.length ? giud[giud.length - 1].cp : null }, arb: arr.length ? arr[arr.length - 1].arb : null }; }
    out.err = D.err; out.S = D.S; const W = D.W; out.frames = W.length; out.fuoriMax = W.reduce((m, e) => Math.max(m, e.fuori | 0), 0); out.tMax = W.length ? W[W.length - 1].t : 0;
    const conta = k => { const fr = W.filter(e => e[k] && e[k].length); const tipi = {}; const chi = {}; fr.forEach(e => e[k].forEach(x => { tipi[x[1]] = (tipi[x[1]] | 0) + 1; chi[x[0]] = 1; })); return { fotogrammi: fr.length, tipi, corpi: Object.keys(chi).length, esempio: fr.length ? fr[0][k][0] : null, t: fr.length ? [fr[0].t, fr[fr.length - 1].t] : null }; };
    out.pen = conta('pen'); out.fig = conta('fig');
    const cam = W.filter(e => e.t >= 1.5 && e.t <= 3.0 && e.bocca && e.bocca.length === 3); const dentro = cam.filter(e => Math.abs(e.bocca[0]) <= 0.95 && Math.abs(e.bocca[1]) <= 0.95 && e.bocca[2] < 1);
    out.cam = { n: cam.length, dentro: dentro.length, es: cam.length ? { bocca: cam[cam.length - 1].bocca, cp: cam[cam.length - 1].cp } : null };
    if (D.S) { const cx = k => { const o = (D.S.ost || []).find(x => x.k === k); return o ? (o.x0 + o.x1) / 2 : null; };
      out.panchine = { casa: cx('panchina-seduta:casa'), ospiti: cx('panchina-seduta:ospiti') }; }
  } catch (e) { out.errore = String(e.message).slice(0, 200); }
  out.errori = errs.slice(0, 3); await ctx.close(); return out;
}
/* [giro 255] SOSTITUZIONI sul percorso vero: «Salta ingresso» → partita → ingresso e uscita dell'eroe forzati (ganci del banco
   __CPM_FORCE_SUBENTRY/__CPM_FORCE_SUBEXIT, due varianti per verso). Si attende l'evento (i fotogrammi del testimone), mai un tempo fisso. */
async function sost(page, ph, out, c) {
  const t0 = Date.now(); let p = await ph();
  while (p === 'walkout' && Date.now() - t0 < 120000) { await page.evaluate(() => { window.__CPM_SKIPWALK277 = true; }); await sleep(600); p = await ph(); }
  out.fase = p; const conta = v => page.evaluate(v => (window.__CPM_G255W || []).filter(e => e.sub === v).length, v).catch(() => 0);
  const fine = async (v, n0) => { const t1 = Date.now(); let last = -1, fermo = 0; while (Date.now() - t1 < 150000) { const n = await conta(v); if (n > n0 && n === last) { if (++fermo >= 4) break; } else fermo = 0; last = n; await sleep(400); } };
  /* cio' che il gioco non produce si provoca dalla sonda: due varianti per verso; se la partita interrompe la camminata prima che l'eroe
     abbia attraversato la fascia dei cartelloni (z -35,8 in uscita, z -33,2 in entrata) si riprova, fino a 5 volte per verso. */
  const zz = verso => page.evaluate(v => { const F = (window.__CPM_G255W || []).filter(e => e.sub === v && e.vis); return F.length ? [Math.min(...F.map(e => e.z)), Math.max(...F.map(e => e.z))] : null; }, verso).catch(() => null);
  for (const [verso, gancio] of [['entra', '__CPM_FORCE_SUBENTRY'], ['esce', '__CPM_FORCE_SUBEXIT']]) { let buone = 0;
    for (let k = 0; k < 5 && buone < 2; k++) { const n0 = await conta(verso); await page.evaluate(a => { window[a[0]] = a[1]; }, [gancio, k % 2 ? 3 : 0]); await fine(verso, n0);
      const W1 = await page.evaluate(a => (window.__CPM_G255W || []).filter(e => e.sub === a[0] && e.vis).slice(a[1]).map(e => e.z), [verso, n0]).catch(() => []);
      if (W1.length >= 10 && (verso === 'esce' ? Math.min(...W1) <= -35.8 : (Math.min(...W1) <= -34.3 && Math.max(...W1) >= -33.2))) buone++; }
    out['buone_' + verso] = buone; }
  const W = await page.evaluate(() => (window.__CPM_G255W || []).filter(e => e.sub));
  out.S = await page.evaluate(() => window.__CPM_G245 || null).catch(() => null);
  out.sost = {}; for (const verso of ['entra', 'esce']) { const F = W.filter(e => e.sub === verso && e.vis), P = F.filter(e => e.pen.length); const tipi = {}; P.forEach(e => e.pen.forEach(k => { tipi[k] = (tipi[k] | 0) + 1; }));
    out.sost[verso] = { frames: F.length, dentro: P.length, tipi, es: P.length ? [P[0].x, P[0].z, P[0].t] : null, buone: out['buone_' + verso] | 0, da: F.length ? [F[0].x, F[0].z] : null, a: F.length ? [F[F.length - 1].x, F[F.length - 1].z] : null }; }
}
const R = {}; const guasti = []; const visti = { bocca: 0, pen: 0, sch: 0, panca: 0, sost: 0, nSch: 0, nSost: 0 };
for (const c of PIANO) { if (SOLO && !SOLO.includes(c.nome)) continue;
  const o = await ingresso(c); R[c.nome] = o; const g = []; const S = o.S;
  if (c.sost) { visti.nSost++; const E = o.sost || {};
    if (o.errore) g.push('errore: ' + o.errore); if ((o.errori || []).length) g.push('errori di pagina: ' + o.errori[0]);
    let dentro = 0; for (const v of ['entra', 'esce']) { const e = E[v];
      if (!e || e.frames < 10) g.push(`non giudicato: ${e ? e.frames : 0} fotogrammi di sostituzione «${v}» (minimo 10)`);
      else if (!e.buone) g.push(`non giudicato: nessuna sostituzione «${v}» ha attraversato la fascia dei cartelloni (5 tentativi)`);
      else if (e.dentro) { dentro += e.dentro; g.push(`sostituzione «${v}»: ${e.dentro} fotogrammi su ${e.frames} con l'eroe dentro un oggetto (${JSON.stringify(e.tipi)}, es. x/z/t ${JSON.stringify(e.es)})`); } }
    if (dentro) visti.sost++;
    console.log(`${g.length ? '✗' : '✓'} ${c.nome.padEnd(15)} sostituzioni · entra ${E.entra ? E.entra.dentro + '/' + E.entra.frames + ' da ' + JSON.stringify(E.entra.da) : '?'} · esce ${E.esce ? E.esce.dentro + '/' + E.esce.frames + ' fino a ' + JSON.stringify(E.esce.a) : '?'}`);
    g.forEach(x => { console.log('    ' + x); guasti.push(c.nome + ': ' + x); }); continue; }
  visti.nSch++;
  if (!o.walk && !o.frames) g.push('ingresso non visto');
  if (o.errore) g.push('errore: ' + o.errore); if (o.err) g.push('testimone: ' + o.err); if ((o.errori || []).length) g.push('errori di pagina: ' + o.errori[0]);
  if (!S || !S.tunnel) g.push('non giudicato: nessuna bocca del tunnel dichiarata');
  else {
    if (Math.abs(S.tunnel.x) > 1) { g.push(`bocca del tunnel a x ${S.tunnel.x} (attesa entro ±1)`); visti.bocca++; }
    const P = o.panchine || {};
    if (P.casa == null || P.ospiti == null) g.push('non giudicato: panchine non trovate');
    else if (!(P.casa < S.tunnel.x && P.ospiti > S.tunnel.x) || Math.abs((P.casa - S.tunnel.x) + (P.ospiti - S.tunnel.x)) > 0.5) g.push(`panchine non simmetriche rispetto alla bocca: casa ${P.casa} · ospiti ${P.ospiti} · bocca ${S.tunnel.x}`);
    if ((S.altri || []).length) g.push(`oggetti non etichettati nel varco: ${S.altri.length} (${JSON.stringify(S.altri[0])})`);
  }
  if ((o.frames | 0) < 30) g.push(`non giudicato: ${o.frames | 0} fotogrammi d'ingresso (minimo 30)`);
  if ((o.fuoriMax | 0) < 12) g.push(`non giudicato: solo ${o.fuoriMax | 0} corpi usciti dal tunnel (minimo 12)`);
  if (o.pen && o.pen.fotogrammi) { g.push(`${o.pen.fotogrammi} fotogrammi con un corpo dentro un oggetto (${JSON.stringify(o.pen.tipi)}, ${o.pen.corpi} corpi, es. ${JSON.stringify(o.pen.esempio)})`); visti.pen++; }
  if (o.fig && o.fig.fotogrammi) g.push(`${o.fig.fotogrammi} fotogrammi con un corpo addosso a una figura ferma (${JSON.stringify(o.fig.tipi)}, es. ${JSON.stringify(o.fig.esempio)})`);
  if (!o.cam || o.cam.n < 5) g.push(`non giudicato: ${o.cam ? o.cam.n : 0} fotogrammi di camera fra 1,5 e 3,0 s (minimo 5)`);
  else if (o.cam.dentro / o.cam.n < 0.9) g.push(`la camera dell'ingresso inquadra la bocca in ${o.cam.dentro}/${o.cam.n} fotogrammi (minimo 90%) — es. ${JSON.stringify(o.cam.es)}`);
  /* [giro 255] schieramento al centro, nessuna panca bassa */
  { const S5 = o.S5, sc = o.sch || {}; let fuori = false;
    if (o.err5) g.push('testimone 255: ' + o.err5);
    if (!S5 || !S5.casa || !S5.ospiti || !S5.casa.n || !S5.ospiti.n) g.push('non giudicato: posti di schieramento non dichiarati');
    else { const xm = (S5.casa.x * S5.casa.n + S5.ospiti.x * S5.ospiti.n) / (S5.casa.n + S5.ospiti.n);
      if (Math.abs(xm) > 1 || !(S5.casa.x < 0 && S5.ospiti.x > 0)) { fuori = true; g.push(`schieramento fuori centro: fila di casa a x ${S5.casa.x}, ospiti a x ${S5.ospiti.x}, x medio ${xm.toFixed(2)} (atteso entro ±1, una fila per parte)`); } }
    if (o.tutto) {
      if ((sc.arrivati | 0) < 5) g.push(`non giudicato: ${sc.arrivati | 0} fotogrammi con le squadre schierate (minimo 5)`);
      else if (Math.abs(sc.mx[0]) > 1 || Math.abs(sc.mx[1]) > 1) { fuori = true; g.push(`i 23 corpi schierati hanno x media ${sc.mx[0]}..${sc.mx[1]} (attesa entro ±1)`); }
      if (sc.cc) g.push(`${sc.cc} fotogrammi con due corpi a meno di 0,5 (es. ${JSON.stringify(sc.ccEs)})`);
      if (!sc.cam || sc.cam.n < 5) g.push(`non giudicato: ${sc.cam ? sc.cam.n : 0} fotogrammi di camera a squadre schierate (minimo 5)`);
      else if (c.tipo === 'nazionale' && sc.cam.nInno < 5) g.push(`non giudicato: ${sc.cam.nInno} fotogrammi di camera durante l'inno (minimo 5)`);
      else if (sc.cam.alt < 0.06) g.push(`a squadre schierate i corpi sono alti in media ${sc.cam.alt} del quadro (minimo 0,06)`);
      else if (sc.cam.ok / sc.cam.n < 0.9) g.push(`la camera inquadra la fila (almeno 11 corpi su 23, 8 nell'inno) in ${sc.cam.ok}/${sc.cam.n} fotogrammi (minimo 90%) — minimo ${sc.cam.inqMin} corpi, camera ${JSON.stringify(sc.cam.es)}`); }
    if (fuori) visti.sch++;
    const pb = S ? (S.ost || []).filter(x => x.k === 'panca-stadio' || x.k === 'pensilina-stadio') : null;
    if (pb && pb.length) { visti.panca++; g.push(`panca bassa presente: ${pb.length} oggetti (es. ${pb[0].k} x ${pb[0].x0}..${pb[0].x1}, z ${pb[0].z0}..${pb[0].z1})`); }
    o.pancaBassa = pb ? pb.length : null; }
  console.log(`${g.length ? '✗' : '✓'} ${c.nome.padEnd(15)} ${S ? (S.kind || S.tpl || '-') : '-'} · bocca x ${S && S.tunnel ? S.tunnel.x + ' ' + S.tunnel.stile + ' L' + S.tunnel.L : '?'} · panchine ${o.panchine ? o.panchine.casa + '/' + o.panchine.ospiti : '?'} · fotogrammi ${o.frames | 0} (scena ${o.tMax}s, usciti ${o.fuoriMax | 0}) · dentro oggetti ${o.pen ? o.pen.fotogrammi : '?'} · addosso a figure ${o.fig ? o.fig.fotogrammi : '?'} · camera ${o.cam ? o.cam.dentro + '/' + o.cam.n : '?'} · file x ${o.S5 && o.S5.casa ? o.S5.casa.x + '/' + o.S5.ospiti.x : '?'} · panca bassa ${o.pancaBassa}${o.tutto && o.sch ? ` · schierati ${o.sch.arrivati} fot., x media ${JSON.stringify(o.sch.mx)}, corpi vicini ${o.sch.cc} (min ${o.sch.dmin}), camera fila ${o.sch.cam.ok}/${o.sch.cam.n} (min ${o.sch.cam.inqMin}, altezza ${o.sch.cam.alt}, ${o.sch.cam.regie.join('+')}), arbitro ${JSON.stringify(o.sch.arb)}` : ''}`);
  g.forEach(x => { console.log('    ' + x); guasti.push(c.nome + ': ' + x); });
}
await b.close(); srv.close();
fs.writeFileSync(path.join(DIR, `misura-tunnel-${TAG}${GLB ? '-glb' : ''}.json`), JSON.stringify(R, null, 1));
if (process.env.CPM_SOLO_MISURA) { console.log(`MISURA (${TAG}) — ${Object.keys(R).length} stadi, ${guasti.length} voci`); process.exit(0); }
const n = Object.keys(R).length;
if (R255) { const ok = visti.nSch > 0 && visti.sch === visti.nSch && visti.panca === visti.nSch && visti.nSost > 0 && visti.sost === visti.nSost;
  console.log(`\nBRACCIO ROSSO 255 (__CPM_NO_G255, schieramento a sinistra e panca bassa) — schieramento fuori centro visto in ${visti.sch}/${visti.nSch} · panca bassa in ${visti.panca}/${visti.nSch} · eroe dentro un oggetto nelle sostituzioni in ${visti.sost}/${visti.nSost}`);
  console.log(ok ? 'ROSSO VISTO: il guardiano riconosce lo schieramento a sinistra, la panca bassa e la sostituzione attraverso gli oggetti.' : 'ROSSO NON VISTO: guardiano cieco.'); process.exit(ok ? 0 : 1); }
if (ROSSO) { const ok = visti.nSch > 0 && visti.bocca === visti.nSch && visti.pen > 0;
  console.log(`\nBRACCIO ROSSO (__CPM_NO_G245, disposizione di prima) — ${visti.nSch} stadi · bocca fuori centro vista in ${visti.bocca}/${visti.nSch} · corpi dentro oggetti in ${visti.pen}/${visti.nSch}`);
  console.log(ok ? 'ROSSO VISTO: il guardiano riconosce la disposizione di prima.' : 'ROSSO NON VISTO: il guardiano non distingue la disposizione di prima — guardiano cieco.'); process.exit(ok ? 0 : 1); }
console.log(`\nBRACCIO VERDE — ${n} stadi · ${guasti.length} guasti`);
console.log(n > 0 && !guasti.length ? 'VERDE: tunnel a meta\' campo fra le panchine, percorso libero, camera sulla bocca; schieramento al centro, nessuna panca bassa, sostituzioni senza attraversare oggetti.' : 'ROSSO: ' + (guasti[0] || 'nessuno stadio giudicato')); process.exit(n > 0 && !guasti.length ? 0 : 1);
