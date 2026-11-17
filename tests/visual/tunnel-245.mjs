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
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tunnel-245.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ROSSO = !!process.env.CPM_PROVA_ROSSO, GLB = process.env.CPM_GLB === '1', TAG = process.env.CPM_TAG || (ROSSO ? 'rosso' : 'dopo');
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro245'); fs.mkdirSync(DIR, { recursive: true });
const TFINE = +(process.env.CPM_TFINE || 9);/* secondi di SCENA dopo i quali si chiude lo stadio (0 = tutto l'ingresso) */
const TPL = { provincia: 6000, comunale: 15000, storico_it: 40000, moderno_it: 45000, inglese: 35000, tedesco: 60000, spagnolo: 70000, francese: 30000, olandese: 25000, sudamericano: 50000, borgo: 3000, catino: 25000, mattoni: 28000, arena: 60000 };
const PIANO = [
  ...Object.keys(TPL).map(t => ({ nome: t, tpl: t, cap: TPL[t], tipo: 'derby', tod: 'night' })),
  { nome: 'nazionale', tipo: 'nazionale', tod: 'day' },
  { nome: 'normale-giorno', tipo: 'normale', tod: 'day' },
  { nome: 'piccolo', tpl: 'provincia', cap: 1500, tipo: 'big', tod: 'dusk' },
];
const SOLO = process.env.CPM_SCENARI ? process.env.CPM_SCENARI.split(',') : null;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function ingresso(c) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = !!o.glb; window.__CPM_TOD = o.tod; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_G245W = [];
    if (o.tipo) window.__CPM_TIPO206 = o.tipo; if (o.tpl) { window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; }
    if (o.r) window.__CPM_NO_G245 = true; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: ROSSO, tpl: c.tpl || null, cap: c.cap || 0, tipo: c.tipo, tod: c.tod, glb: GLB });
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
    /* si attende un evento (il tempo di SCENA scritto dal testimone), mai un tempo fisso: foto dalla camera dell'ingresso a 2,4 s di scena,
       foto dall'alto (camera fissa di prova __CPM_CAM904) a 3,4 s — dopo la finestra in cui si giudica la camera. */
    const t0 = Date.now(); const fatte = new Set(); let visto = out.walk;
    while (Date.now() - t0 < +(process.env.CPM_TMAX || 600000)) {
      const p = await ph(); if (p === 'walkout') visto = true; else if (visto) break;
      if (TFINE > 0 && (await page.evaluate(() => { const W = window.__CPM_G245W || []; return W.length ? W[W.length - 1].t : 0; }).catch(() => 0)) >= TFINE) break;/* la strada dalla bocca alla linea laterale si percorre nei primi secondi: oltre, il guardiano non impara altro */
      const q = await page.evaluate(() => { const W = window.__CPM_G245W || []; const e = W[W.length - 1]; const S = window.__CPM_G245 || null; return e ? [e.t, S && S.tunnel ? S.tunnel.x : null] : null; }).catch(() => null);
      if (q && process.env.CPM_FOTO !== '0') {
        if (!fatte.has('camera') && q[0] >= 2.4) { fatte.add('camera'); const f = `${TAG}-${c.nome}${GLB ? '-glb' : ''}-camera.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 80 }).catch(() => {}); out.foto.push(f); }
        else if (!fatte.has('alto') && q[0] >= 3.4) { fatte.add('alto');
          await page.evaluate(x => { window.__CPM_CAM904 = { x: x, y: 44, z: -24, lx: x, ly: 0, lz: -36 }; }, (q[1] != null ? q[1] : -22)); await sleep(GLB ? 2500 : 900);
          await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }).then(async st => { const f = `${TAG}-${c.nome}${GLB ? '-glb' : ''}-alto.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 80 }).catch(() => {}); out.foto.push(f); await st.evaluate(n => n.remove()).catch(() => {}); }).catch(() => {});
          await page.evaluate(() => { try { delete window.__CPM_CAM904; } catch (e) { window.__CPM_CAM904 = null; } }); } }
      await sleep(250); }
    const D = await page.evaluate(() => ({ S: window.__CPM_G245 || null, W: window.__CPM_G245W || [], err: window.__CPM_G245ERR || null }));
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
const R = {}; const guasti = []; const visti = { bocca: 0, pen: 0 };
for (const c of PIANO) { if (SOLO && !SOLO.includes(c.nome)) continue;
  const o = await ingresso(c); R[c.nome] = o; const g = []; const S = o.S;
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
  console.log(`${g.length ? '✗' : '✓'} ${c.nome.padEnd(15)} ${S ? (S.kind || S.tpl || '-') : '-'} · bocca x ${S && S.tunnel ? S.tunnel.x + ' ' + S.tunnel.stile + ' L' + S.tunnel.L : '?'} · panchine ${o.panchine ? o.panchine.casa + '/' + o.panchine.ospiti : '?'} · fotogrammi ${o.frames | 0} (scena ${o.tMax}s, usciti ${o.fuoriMax | 0}) · dentro oggetti ${o.pen ? o.pen.fotogrammi : '?'} · addosso a figure ${o.fig ? o.fig.fotogrammi : '?'} · camera ${o.cam ? o.cam.dentro + '/' + o.cam.n : '?'}`);
  g.forEach(x => { console.log('    ' + x); guasti.push(c.nome + ': ' + x); });
}
await b.close(); srv.close();
fs.writeFileSync(path.join(DIR, `misura-tunnel-${TAG}${GLB ? '-glb' : ''}.json`), JSON.stringify(R, null, 1));
if (process.env.CPM_SOLO_MISURA) { console.log(`MISURA (${TAG}) — ${Object.keys(R).length} stadi, ${guasti.length} voci`); process.exit(0); }
const n = Object.keys(R).length;
if (ROSSO) { const ok = n > 0 && visti.bocca === n && visti.pen > 0;
  console.log(`\nBRACCIO ROSSO (__CPM_NO_G245, disposizione di prima) — ${n} stadi · bocca fuori centro vista in ${visti.bocca}/${n} · corpi dentro oggetti in ${visti.pen}/${n}`);
  console.log(ok ? 'ROSSO VISTO: il guardiano riconosce la disposizione di prima.' : 'ROSSO NON VISTO: il guardiano non distingue la disposizione di prima — guardiano cieco.'); process.exit(ok ? 0 : 1); }
console.log(`\nBRACCIO VERDE — ${n} stadi · ${guasti.length} guasti`);
console.log(n > 0 && !guasti.length ? 'VERDE: tunnel a meta\' campo fra le panchine, percorso libero, camera sulla bocca.' : 'ROSSO: ' + (guasti[0] || 'nessuno stadio giudicato')); process.exit(n > 0 && !guasti.length ? 0 : 1);
