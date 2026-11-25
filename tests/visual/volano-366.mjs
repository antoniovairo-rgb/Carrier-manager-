#!/usr/bin/env node
/* [giro 366, PO-649 — rosso __CPM_NO_G366] GUARDIANO «I GIOCATORI IN GUARDIA TENGONO I PIEDI SUL PRATO».
   PO (foto docs/collaudo-po/208-giocatori-volano.png): «i giocatori volano sul campo».
   Causa misurata (misura-366, partite vere, corpi GLB accesi): nelle scene 3D il 15-17% dei corpi x fotogrammi aveva i piedi oltre
   0,15 u dal prato, e piu' di meta' erano difensori FERMI, radice a terra, che suonano la posa di guardia `mx-defend-ready` (7.999.32):
   il bacino della clip e' inchiodato alla quota da fermo, quindi piegando le gambe salgono i piedi. Riparazione in src/12 (_aTerra366):
   al caricamento il bacino della clip scende di quanto la suola sta sopra quella della posa ferma.

   Una sorgente sola: il testimone __CPM_VOLA366 (src/12) = la SUOLA (vertice piu' basso della pelle dei piedi) dei corpi DISEGNATI, nel
   mondo, contro il prato a y 0. Pagina nuova per braccio, teatro acceso (__CPM_PRESENT + __CPM_CINE), vista da PC (ombre vere).
   (A) la clip: testimone __CPM_T366, quota della suola sopra la posa ferma lungo tutta la clip, in altezze-corpo.
       VERDE: riparata, massimo <= 0,02. ROSSO: non riparata, massimo >= 0,12.
   (B) i corpi disegnati: su scene d'attacco, a scelta fatta, si ASPETTA che almeno 2 difensori siano in guardia (peso della clip >= 0,8),
       poi si leggono 6 momenti a 0,5 s; lungo tutta la scena si legge la suola di chi sta nella posa ferma (eroe, portiere).
       scarto = suola del corpo in guardia - mediana della suola dei corpi nella posa ferma, stessa pagina.
       VERDE: ogni scarto <= 0,06 u. ROSSO: mediana degli scarti >= 0,15 u.
       Servono almeno 24 letture da almeno 5 corpi diversi e almeno 6 letture della posa ferma: sotto, NON GIUDICATO = rosso.
   Uso: node volano-366.mjs (verde poi rosso) · CPM_SOLO=verde|rosso · CPM_FOTO=1 (foto prima/dopo in docs/collaudo-po/366-*.png, dSF 2) */
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const FOTO = !!process.env.CPM_FOTO, SOLO = process.env.CPM_SOLO || '';
const SCENE = (process.env.CPM_SCENE || '0,67,93,16,103,65,70,171').split(',').map(Number);
const med = a => { const s = [...a].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
const f = (x, n = 3) => x == null ? '—' : (+x).toFixed(n);

async function braccio(b, port, rosso) {
  const ctx = await b.newContext({ viewport: { width: 1062, height: 549 }, deviceScaleFactor: FOTO ? 2 : 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page); const errori = [];
  page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript((r) => { window.__CPM_GLB = true; window.__CPM_TOD = 'day'; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO_G366 = 1; }, rosso);
  await openMatch(page, port, { name: 'Vola366' });
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const glb = await page.evaluate(() => !!window.__CPM_GLB && (window.__CPM_MXCLIP | 0) > 0);
  const suole = [], ferme = [], corpi = new Set(); let fotoFatta = false, clip = null; const scene = [];
  const leggi = () => page.evaluate(() => { const s = window.__CPM_VOLA366 && window.__CPM_VOLA366(); if (!s || !s.corpi) return null;
    const peso = (c, n) => { const m = new RegExp('(?:^| )' + n + ':([0-9.]+)').exec(c.cl || ''); return m ? +m[1] : 0; };
    return { fase: s.fase, g: s.corpi.filter(c => c.vis && c.su != null && !c.gk && !c.arb && !c.eroe && peso(c, 'mx-defend-ready') >= 0.8 && c.r[1] < 0.02).map(c => ({ i: c.i, su: c.su, sq: c.sq })),
      f: s.corpi.filter(c => c.vis && c.su != null && peso(c, 'idle') >= 0.95 && !c.g && c.r[1] < 0.02).map(c => c.su) }; });
  for (const gi of SCENE) {
    if (suole.length >= 48 && corpi.size >= 8 && ferme.length >= 12) break;
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    await forceSituation(page, gi, { settle: 900, choose: true });
    await sleep(1200); await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); });/* la guardia si vede a scelta fatta: i difensori si fermano mentre l'azione si compie */
    /* evento atteso: tre difensori in guardia. Tetto 30 s di parete (sul banco il tempo di scena scorre piano), poi si passa oltre. */
    const t0 = Date.now(); let r = null;
    while (Date.now() - t0 < 30000) { await sleep(500); r = await leggi(); if (r) ferme.push(...r.f); if (r && String(r.fase).indexOf('hl_') === 0 && r.g.length >= 2) break; }
    if (!r || r.g.length < 2) { scene.push(`gi${gi}: guardia non raggiunta (${r ? r.g.length : 0})`); continue; }
    let n = 0;
    for (let k = 0; k < 6; k++) { if (k) await sleep(500); r = await leggi(); if (!r) continue; ferme.push(...r.f);
      for (const c of r.g) { suole.push(c.su); corpi.add(gi + ':' + c.i); n++; } }
    scene.push(`gi${gi}: ${n} letture`);
    if (FOTO && !fotoFatta && r && r.g.length >= 3 && gi !== SCENE[0]) { fotoFatta = true; await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(400);
      const cv = await page.$('canvas'); const dest = path.join(ROOT, 'docs', 'collaudo-po', `366-guardia-${rosso ? 'prima' : 'dopo'}.png`);
      try { await (cv || page).screenshot({ path: dest, timeout: 60000 }); console.log('  foto: ' + path.relative(ROOT, dest)); } catch (e) { console.log('  (foto non riuscita)'); } }
  }
  clip = await page.evaluate(() => (window.__CPM_T366 || {})['mx-defend-ready'] || null);
  const altro = await page.evaluate(() => (window.__CPM_T366 || {}).errore || null);
  await ctx.close();
  const base = med(ferme); const scarti = base == null ? [] : suole.map(x => +(x - base).toFixed(3));
  return { glb, scarti, ferme, corpi: corpi.size, clip, scene, errori, altro };
}

function giudica(nome, R) {
  const rosso = nome === 'rosso'; const motivi = []; const c = R.clip;
  console.log(`\n[${nome}] scene: ${R.scene.join(' · ')}`);
  console.log(`[${nome}] (A) clip mx-defend-ready: ${c ? `suola sopra la posa ferma, in altezze-corpo — prima massimo ${f(c.primaMax)} media ${f(c.primaMedia)}${c.riparata ? ` · dopo massimo ${f(c.dopoMax)} media ${f(c.dopoMedia)}` : ' · NON riparata'} (${c.chiavi} chiavi, corpo alto ${f(c.alt, 2)} u)` : 'testimone assente'}`);
  const m = med(R.scarti), mx = R.scarti.length ? Math.max(...R.scarti) : null, mn = R.scarti.length ? Math.min(...R.scarti) : null;
  console.log(`[${nome}] (B) corpi disegnati in guardia: ${R.scarti.length} letture da ${R.corpi} corpi · suola sopra quella dei corpi fermi: mediana ${f(m)} u · minimo ${f(mn)} · massimo ${f(mx)} · (posa ferma: ${R.ferme.length} letture, suola mediana ${f(med(R.ferme))} u dal prato)`);
  if (!R.glb) motivi.push('corpi GLB non accesi: non giudicato');
  if (R.errori.length) motivi.push('errori di pagina: ' + R.errori[0]);
  if (R.altro) motivi.push('errore nella riparazione: ' + R.altro);
  if (!c) motivi.push('A non giudicato: testimone __CPM_T366 assente');
  if (R.scarti.length < 24 || R.corpi < 5 || R.ferme.length < 6) motivi.push(`B non giudicato: ${R.scarti.length} letture da ${R.corpi} corpi, ${R.ferme.length} della posa ferma (servono 24 · 5 · 6)`);
  if (!rosso) { if (c && !(c.riparata && c.dopoMax <= 0.02)) motivi.push(`A: la clip alza ancora i piedi (${c.riparata ? f(c.dopoMax) : 'non riparata'})`);
    if (mx != null && mx > 0.06) motivi.push(`B: un corpo in guardia sta ${f(mx)} u sopra i corpi fermi (tetto 0,06)`); }
  else { if (c && (c.riparata || c.primaMax < 0.12)) motivi.push(`A: il rosso non riproduce (riparata ${c.riparata}, massimo ${f(c.primaMax)})`);
    if (m != null && m < 0.15) motivi.push(`B: il rosso non riproduce (mediana ${f(m)} u, attesa >= 0,15)`); }
  return motivi;
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); let esito = 0; const righe = [];
for (const nome of ['verde', 'rosso']) { if (SOLO && SOLO !== nome) continue;
  const R = await braccio(b, port, nome === 'rosso'); const motivi = giudica(nome, R);
  /* braccio e motivo stampati per ultimi */
  righe.push(motivi.length ? `✗ braccio ${nome}: ${motivi.join(' · ')}` : `✓ braccio ${nome}: ${nome === 'rosso' ? 'il difetto si riproduce senza la riparazione' : 'i corpi in guardia tengono i piedi sul prato'}`);
  if (motivi.length) esito = 1; }
console.log('\n' + righe.join('\n')); console.log(esito ? '\n❌ volano-366 ROSSO' : '\n✅ volano-366 VERDE (verde + rosso)');
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(esito), 200);
