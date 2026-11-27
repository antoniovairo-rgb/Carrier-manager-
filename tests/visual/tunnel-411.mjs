#!/usr/bin/env node
/* [giro 411 PO-677 «Tunnel dei giocatori è ancora da migliorare. Sembrano appiccicati al tunnel e piano piano si staccano. Non c'è un
   effetto 3D realistico»] GUARDIANO sul percorso vero (salvataggio → partita → ingresso in campo), corpi 3D ACCESI, ora congelata
   (__CPM_TOD, notte), una pagina nuova per stadio e per vista (telefono 412x915 · PC 1366x768 · «bocca»: telefono con camera fissa davanti al tunnel).
   Si campiona ogni 0,5 s di tempo di SCENA (testimone __CPM_T411, walkT) fino a 6 s; a ogni campione: istantanea dei corpi e foto.
   Misure (tutte dal testimone, che legge la scena; la luce dalla foto):
   · PROFONDITA' visibile oltre la bocca: raggio orizzontale dal prato verso il fondo del tunnel (corpi e veli esclusi);
   · NATI DENTRO: al primo campione, quanti corpi di squadra stanno oltre 0,5 u dentro la soglia;
   · IMPILATI: coppie di corpi visibili (davanti al fondo del corridoio) a meno di 0,5 u fra i centri, massimo sui campioni;
   · FERMI ALLA BOCCA: corpi-campione entro 1 u dalla soglia con velocita' (fra due campioni, tempo di scena) sotto 0,3 u/s;
   · COMPENETRAZIONE: corpi nel tratto coperto (fra fondo e soglia) a meno di 0,3 u da una parete;
   · LUCE (giudicata): trasmittanza dal testimone — dal punto in asse 6 u davanti alla soglia del buio, a 1,6, al petto del corpo, prodotto
     di (1 - opacita') degli strati trasparenti che il raggio attraversa davvero nella scena; un opaco in mezzo = non visto. Mediana sui
     corpi-campione oltre 2 u dentro la soglia contro quelli fra la soglia e il punto di vista. RISCONTRO (riportato, non giudicato: maglie
     a strisce e rosse, petti piccoli col fondo nella finestra) la luminanza della foto sul petto dentro (3+ veli) e fuori;
   · SCIVOLAMENTO: fotogrammi in moto con la cadenza della clip oltre il 25% dalla velocita' vera o con la clip di riposo
     (testimone per fotogramma __CPM_W411);
   · OMBRE: mappa d'ombra accesa e corpi fuori dalla bocca dentro la camera d'ombra del sole (o col disco d'ombra del telefono).
   VERDE (ogni stadio, ogni vista): profondita' >= 6 · nati dentro >= 16 su 24 · impilati 0 · fermi alla bocca 0 · compenetrazioni 0 ·
   trasmittanza dentro <= 0,6 x fuori (almeno 3 corpi-campione dentro) · scivolamento <= 10% · ombre si'.
   «Non giudicato» = ROSSO: ingresso non visto · meno di 8 campioni · testimone assente · luce con meno di 3 petti per parte.
   ROSSO (CPM_PROVA_ROSSO=1 → window.__CPM_NO_G411, piano nero e attesa alla bocca): il guardiano DEVE vedere in ogni stadio
   profondita' non oltre il tratto telescopico (+0,5), impilati > 0 e fermi alla bocca > 0; esce 0 solo se li vede.
   CPM_SCENARI=comunale,borgo,arena · CPM_VISTE=tel,pc,bocca · CPM_TOD=night · CPM_FOTO_DIR · CPM_FOTO=0 (niente foto) · CPM_TAG.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tunnel-411.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ROSSO = !!process.env.CPM_PROVA_ROSSO, TOD = process.env.CPM_TOD || 'night', TAG = process.env.CPM_TAG || (ROSSO ? 'rosso' : 'verde');
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro411'); fs.mkdirSync(DIR, { recursive: true });
const FOTO = process.env.CPM_FOTO !== '0';
const TPL = { comunale: 15000, inglese: 35000, borgo: 3000, arena: 60000, moderno_it: 45000, tedesco: 60000 };
const SCEN = (process.env.CPM_SCENARI || 'comunale,borgo,arena').split(',');
const VISTE = (process.env.CPM_VISTE || 'tel,pc').split(',');
const VP = { tel: { width: 412, height: 915 }, pc: { width: 1366, height: 768 }, bocca: { width: 412, height: 915 } };
/* «bocca»: camera di collaudo FISSA sul prato davanti al tunnel che guarda dentro (gancio __CPM_CAM904): e' la sola vista su cui si giudica la
   luce, perche' la regia dell'ingresso guarda la bocca di lato o dall'alto e il tetto del tratto coperto nasconde chi e' dentro (arena) */
const CAMB = (tn) => { const zb = tn.g411 ? tn.g411.thr : tn.z1; return { x: tn.x + 0.3, y: 2.4, z: zb + 6, lx: tn.x, ly: 1.0, lz: zb - 6 }; };/* 6 u davanti alla soglia del buio, in asse e alta 2,4: il raggio passa sopra le teste dei vicini */
const srv = await startServer(process.env.CPM_ROOT || ROOT); const port = srv.address().port; const b = await launchBrowser();
/* NDC → pixel nel rettangolo VERO della tela 3D (sul PC la tela non occupa la finestra intera) */
const lumPatch = (png, nx, ny, R) => { const W = png.width, H = png.height; const cx = Math.round(R.x + (nx + 1) / 2 * R.w), cy = Math.round(R.y + (1 - ny) / 2 * R.h); const r = Math.max(3, Math.round(R.w / 130)); let s = 0, n = 0;
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) { if (x < 0 || y < 0 || x >= W || y >= H) continue; const i = (y * W + x) * 4; s += (0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]) / 255; n++; }
  return n ? s / n : null; };
async function giro(nome, vista) {
  const ctx = await b.newContext({ viewport: VP[vista], serviceWorkers: 'block' }); await installCdnRoutes(ctx); const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_TOD = o.tod; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_TIPO206 = 'normale'; window.__CPM_W411 = {};
    if (o.tpl) { window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; } if (o.rosso) window.__CPM_NO_G411 = true; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); },
  { s: SAVE, tpl: TPL[nome] ? nome : null, cap: TPL[nome] || 0, tod: TOD, rosso: ROSSO });
  const out = { nome, vista, campioni: [], foto: [] };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 70; k++) { if ((await ph()) === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
    out.walk = (await ph()) === 'walkout';
    const snap = () => page.evaluate(() => window.__CPM_T411 ? window.__CPM_T411() : null).catch(() => null);
    if (out.walk) { let tNext = 0; const t0 = Date.now();
      while (Date.now() - t0 < 420000 && tNext <= 6.0) { if ((await ph()) !== 'walkout') break; const s0 = await snap(); if (!s0 || s0.errore) { out.errT = s0 && s0.errore; if (!s0) break; }
        if (vista === 'bocca' && s0 && s0.tun && !out.camb) { out.camb = CAMB(s0.tun); await page.evaluate(c => { window.__CPM_CAM904 = c; }, out.camb); await sleep(400); continue; }
        if (s0 && s0.t >= tNext) { const buf = await page.screenshot({ type: 'png' }).catch(() => null);
          const png = buf ? PNG.sync.read(buf) : null; const s = s0;
          const RC = await page.evaluate(() => { let best = null; for (const c of document.querySelectorAll('canvas')) { const r = c.getBoundingClientRect(); if (!best || r.width * r.height > best.w * best.h) best = { x: r.left, y: r.top, w: r.width, h: r.height }; } return best; }).catch(() => null); s.tela = RC;
          if (png && RC) for (const c of s.corpi) c.lum = (RC && c.vis && c.nz > -1 && c.nz < 1 && Math.abs(c.nx) < 0.97 && Math.abs(c.ny) < 0.97) ? +lumPatch(png, c.nx, c.ny, RC).toFixed(3) : null;
          if (FOTO && buf && s.t <= 4.1) { const f = `${TAG}-${nome}-${vista}-t${s.t.toFixed(1)}.png`; fs.writeFileSync(path.join(DIR, f), buf); out.foto.push(f); }
          out.campioni.push(s); tNext = Math.floor(s.t / 0.5 + 1e-6) * 0.5 + 0.5; }
        else await sleep(60); }
      out.w411 = await page.evaluate(() => window.__CPM_W411).catch(() => null); out.hit = await page.evaluate(() => window.__CPM_T411H).catch(() => null); }
  } catch (e) { out.errore = String(e.message).slice(0, 200); }
  out.errori = errs.slice(0, 3); await ctx.close(); return out; }
/* il petto (y 1,25) si legge nella foto solo se il raggio camera→petto non incontra un altro corpo (cilindro r 0,32, alto 1,9) ne' il bambino
   che lo accompagna (r 0,25, alto 1,2, 0,72 di lato: lo si mette accanto a OGNI giocatore, per prudenza) e, se il corpo e' oltre la bocca,
   passa dalla luce della bocca (|x - bocca| < 2,6 · y < 2,6 sul piano della bocca) */
const copre = (s, c, tn) => { const C = s.cam, P = [c.x, 1.25, c.z], d = [P[0] - C[0], P[1] - C[1], P[2] - C[2]], L2 = d[0] * d[0] + d[2] * d[2];
  const sbarra = (ox, oz, r, h) => { const t = ((ox - C[0]) * d[0] + (oz - C[2]) * d[2]) / Math.max(1e-6, L2); if (t <= 0 || t >= 0.97) return false; const qx = C[0] + d[0] * t, qz = C[2] + d[2] * t, qy = C[1] + d[1] * t; return Math.hypot(qx - ox, qz - oz) < r && qy > 0 && qy < h; };
  for (const o of s.corpi) { if (o === c || !o.vis) continue; if (sbarra(o.x, o.z, 0.34, 1.9)) return true; }
  for (const k of (s.bimbi || [])) if (sbarra(k[0], k[1], 0.26, 1.25)) return true;
  const zb = tn.g411 ? tn.g411.thr : tn.z1;/* la soglia del buio: nell'arena e' la faccia del basamento, il tubo di vetro e' trasparente */
  if (c.z < zb && C[2] > zb) { const t = (zb - C[2]) / (P[2] - C[2]); const x = C[0] + d[0] * t, y = C[1] + d[1] * t; if (Math.abs(x - tn.x) > 2.6 || y > 2.6) return true; }
  /* il tetto del tratto coperto (telescopico o tubo di vetro, opaco sopra 2,6): il raggio deve passarci sotto anche sulla bocca sul prato;
     dalle pareti di vetro si vede di lato, da quelle in cemento no */
  if (c.z < tn.z1 && C[2] > tn.z1 && zb < tn.z1 - 0.3) { const t = (tn.z1 - C[2]) / (P[2] - C[2]); const x = C[0] + d[0] * t, y = C[1] + d[1] * t; if (y > 2.6 || (tn.stile !== 'vetro' && Math.abs(x - tn.x) > 2.6)) return true; }
  return false; };
const giudica = (o) => { const g = [], C = o.campioni; const m = {};
  if (o.errore) g.push('errore: ' + o.errore); if ((o.errori || []).length) g.push('errori di pagina: ' + o.errori[0]);
  if (!o.walk) { g.push('non giudicato: ingresso non visto'); return { g, m }; }
  if (C.length < 8) { g.push(`non giudicato: ${C.length} campioni (minimo 8)${o.errT ? ' — ' + o.errT : ''}`); return { g, m }; }
  const tn = C[0].tun; if (!tn) { g.push('non giudicato: tunnel non dichiarato'); return { g, m }; }
  const gg = tn.g411, thr = tn.z1/* la bocca sul prato (nell'arena il tubo di vetro e' gia' tunnel) */, zEnd = gg ? gg.zEnd : -1e9, hw = (gg ? gg.w : 5.4) / 2;
  m.prof = C[0].prof; m.stile = tn.stile; m.L = tn.L;
  m.natiDentro = C[0].corpi.filter(c => c.z < thr - 0.5).length; m.corpi = C[0].corpi.length;
  let imp = 0, fermi = 0, pen = 0; const vel = [], velD = [], lumD = [], lumF = [], lumT = {}; let ombraNo = 0, ombraSi = 0;
  C.forEach((s, k) => { const vis = s.corpi.filter(c => c.vis && c.z > zEnd + 0.3);
    let p = 0; for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) if (Math.hypot(vis[i].x - vis[j].x, vis[i].z - vis[j].z) < 0.5) p++; imp = Math.max(imp, p);
    vis.forEach(c => { if (c.z > zEnd && c.z < thr && Math.abs(c.x - tn.x) > hw - 0.3) pen++;
      /* il petto conta solo se nessun corpo piu' vicino alla camera gli sta davanti sullo schermo */
      const coperto = copre(s, c, tn);
      const zb = gg ? gg.thr : tn.z1;/* fuori = nella luce davanti alla soglia del buio (nell'arena: il tubo di vetro) */
      const ib = s.corpi.indexOf(c);/* lo stesso corpo (stesso indice nel testimone) dentro e appena fuori: stessa maglia per costruzione */
      if (c.lum != null && !coperto) { const q = lumT[ib] || (lumT[ib] = { d: [], f: [] }); if (c.veli >= 3) { lumD.push(c.lum); q.d.push(c.lum); } else if (c.z > zb + 0.5 && c.z < zb + 6) { lumF.push(c.lum); q.f.push(c.lum); } }
      if (c.z > thr && c.z < thr + 4) { if (s.ombre && (c.fuoriOmbra === false || c.disco)) ombraSi++; else ombraNo++; } });
    if (k > 0) { const s1 = C[k - 1], dt = s.t - s1.t; if (dt > 0.2) s.corpi.forEach((c, i) => { const c1 = s1.corpi[i]; if (!c1 || !c.vis || c.z <= zEnd + 0.3) return; const v = Math.hypot(c.px - c1.px, c.pz - c1.pz) / dt;
      if (Math.abs(c.z - thr) < 1.0 && c1.rit != null && s.t < c1.rit + 0.05 && v < 0.3) fermi++;
      if (c.z > thr && c1.z <= thr + 6) vel.push(v); if (c.z < thr) velD.push(v); }); } });
  const med = a => a.length ? +[...a].sort((x, y) => x - y)[a.length >> 1].toFixed(2) : null, avg = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3) : null;
  m.impilati = imp; m.fermiBocca = fermi; m.compenetrazioni = pen; m.velFuoriMed = med(vel); m.velFuoriMax = vel.length ? +Math.max(...vel).toFixed(2) : null; m.velDentroMed = med(velD);
  /* LUCE GIUDICATA: trasmittanza dal testimone (strati trasparenti attraversati davvero dal raggio soglia → petto), mediana sui corpi-campione
     oltre 2 u dentro la soglia del buio, contro quelli fra la soglia e il punto di vista */
  { const zb = gg ? gg.thr : tn.z1; const td = [], tf = []; C.forEach(s => s.corpi.forEach(c => { if (c.luce == null || !c.vis) return; if (c.z < zb - 2 && c.z > zEnd + 0.3) td.push(c.luce); else if (c.z > zb && c.z < zb + 6) tf.push(c.luce); }));
    m.trDentro = td.length >= 3 ? med(td) : null; m.trFuori = tf.length ? med(tf) : null; m.nTr = [td.length, tf.length]; }
  m.lumDentro = avg(lumD); m.lumFuori = avg(lumF); m.nLum = [lumD.length, lumF.length];
  /* la maglia cambia la luminanza (strisce bianconere contro rosso): il rapporto dentro/fuori si fa SQUADRA PER SQUADRA (almeno 2 petti per
     parte) e si media; e' questo il numero giudicato */
  const rt = Object.entries(lumT).filter(([, q]) => q.d.length >= 1 && q.f.length >= 1).map(([k, q]) => [k, avg(q.d) / Math.max(0.001, avg(q.f)), q.d.length, q.f.length]);
  m.rapLuce = rt.length >= 3 ? +[...rt.map(x => x[1])].sort((x, y) => x - y)[rt.length >> 1].toFixed(3) : null;/* mediana sui corpi */ m.rapSquadre = rt.map(x => [x[0], +x[1].toFixed(2), x[2], x[3]]); m.ombre = [ombraSi, ombraNo];
  let mov = 0, scv = 0, plan = 0; for (const k in (o.w411 || {})) { const r = o.w411[k]; mov += r.mov; scv += r.scv; plan += r.plan; } m.scivola = mov ? +(100 * (scv + plan) / mov).toFixed(1) : null; m.mov = mov;
  m.dist = C.filter((s, k) => k % 2 === 0).map(s => [s.t, s.corpi.filter(c => c.z > thr).map(c => +(c.z - thr).toFixed(1)).sort((x, y) => y - x).slice(0, 4)]);
  if (!ROSSO) {
    if (!(m.prof >= 6)) g.push(`profondita' visibile ${m.prof} (minimo 6)`);
    if (m.natiDentro < 16) g.push(`nati dentro ${m.natiDentro}/${m.corpi} (minimo 16)`);
    if (imp) g.push(`${imp} coppie di corpi visibili impilate (< 0,5 u)`);
    if (fermi) g.push(`${fermi} corpi-campione fermi alla bocca`);
    if (pen) g.push(`${pen} corpi-campione nella parete del tunnel`);
    if (m.trDentro == null) g.push(`non giudicato: trasmittanza con ${m.nTr[0]} corpi-campione dentro (minimo 3)`);
    else if (m.trDentro > 0.6 * (m.trFuori == null ? 1 : m.trFuori)) g.push(`luce: trasmittanza dentro ${m.trDentro} oltre 0,6 x fuori ${m.trFuori}`);
    if (m.scivola == null || m.mov < 50) g.push(`non giudicato: scivolamento su ${m.mov} fotogrammi in moto`); else if (m.scivola > 10) g.push(`scivolamento ${m.scivola}% dei fotogrammi in moto (massimo 10)`);
    if (ombraNo) g.push(`${ombraNo} corpi-campione fuori dalla bocca senza ombra`);
  }
  return { g, m }; };
const R = []; const guasti = []; let visti = 0, n = 0;
for (const nome of SCEN) for (const vista of VISTE) { n++; const o = await giro(nome, vista); const { g, m } = giudica(o); o.m = m; o.g = g; R.push(o);
  const rv = !o.errore && o.walk && o.campioni.length >= 8 && m.prof != null && m.prof <= (m.L || 0) + 0.5 && m.impilati > 0 && m.fermiBocca > 0; if (rv) visti++;
  console.log(`${(ROSSO ? rv : !g.length) ? '✓' : '✗'} ${nome.padEnd(9)} ${vista} · ${m.stile || '?'} L ${m.L} · prof ${m.prof} · nati dentro ${m.natiDentro}/${m.corpi} · impilati ${m.impilati} · fermi bocca ${m.fermiBocca} · pareti ${m.compenetrazioni} · v fuori ${m.velFuoriMed}/${m.velFuoriMax} dentro ${m.velDentroMed} · luce dentro ${m.lumDentro} fuori ${m.lumFuori} (${m.nLum}) trasmittanza dentro ${m.trDentro} fuori ${m.trFuori} (${m.nTr}) · scivola ${m.scivola}% su ${m.mov} · ombre ${m.ombre}`);
  if (o.hit) console.log('    fondo visto: ' + JSON.stringify(o.hit));
  console.log('    distanze dalla soglia (t, primi 4): ' + JSON.stringify(m.dist));
  g.forEach(x => { console.log('    ' + x); guasti.push(`${nome}/${vista}: ${x}`); }); }
await b.close(); srv.close();
fs.writeFileSync(path.join(DIR, `misura-411-${TAG}-${TOD}.json`), JSON.stringify(R.map(o => ({ nome: o.nome, vista: o.vista, m: o.m, g: o.g, foto: o.foto, campioni: o.campioni })), null, 1));
if (process.env.CPM_SOLO_MISURA) { console.log(`MISURA (${TAG}) — ${n} giri`); process.exit(0); }
if (ROSSO) { const ok = n >= 3 && visti === n; console.log(`\nBRACCIO ROSSO (__CPM_NO_G411) — piano nero e attesa alla bocca visti in ${visti}/${n} giri`);
  console.log(ok ? 'ROSSO VISTO: il guardiano riconosce il tunnel piatto coi corpi impilati alla bocca.' : 'ROSSO NON VISTO: guardiano cieco.'); process.exit(ok ? 0 : 1); }
console.log(`\nBRACCIO VERDE — ${n} giri (${TOD}) · ${guasti.length} guasti`);
console.log(n >= 3 && !guasti.length ? 'VERDE: i corpi nascono dentro un tunnel profondo e buio ed escono camminando, senza impilarsi ne\' scivolare.' : 'ROSSO: ' + (guasti[0] || 'meno di 3 giri giudicati')); process.exit(n >= 3 && !guasti.length ? 0 : 1);
