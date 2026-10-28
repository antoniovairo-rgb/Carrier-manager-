#!/usr/bin/env node
/* [giro 96a PO-299] GUARDIANO DELLA SCENA 3D DEGLI HIGHLIGHT — i difetti del collaudo grafico 7.999.178 (docs/collaudi/RAPPORTO-grafica-178.md).
   Highlight veri, GLB ACCESO (direttiva PO 29/07), su piu' formati (telefono 412x915, PC 1440x900, tablet 820x1180 e 1180x820), una pagina
   nuova ogni CPM_G96_PER scene (lezione 7.483: una pagina stanca non e' il gioco). Ogni fotogramma legge il testimone di sola prova
   __CPM_G96 (src/12): piedi e testa dell'eroe, pallone, quota di prato nel quadro, corpi disegnati, targhette, portiere.
   Misure e soglie (mai abbassate):
     D2/D3  eroe fuori quadro (piedi O testa fuori dal quadro) per scena: <= 0,05 dei fotogrammi della conclusione · pallone in quadro a fine scena
     D4     rigore: il portiere non comincia il tuffo prima che il pallone lasci il piede, e sull'esito «parata» il tuffo si vede col pallone in volo
     D5     compenetrazione: due corpi disegnati a meno di 0,45 u per 4+ fotogrammi in una scena = rosso (anche all'apertura)
     D8     quota di prato nel quadro: mediana >= 0,58 per formato (prima 0,50-0,54); quota del quadro sopra l'orizzonte (90° percentile della scena) <= 0,20 (prima 0,33-0,42); eroe a fine scena non piu' piccolo di 0,06 del quadro
     D9     non giudicato qui (il «GOOOOL!» e' un sovrimpresso DOM di src/15: punto aperto del giro 96a)
     D10    targhette: in ogni fotogramma la piu' grande non supera 1,6 volte la piu' piccola, nessuna coppia sovrapposta oltre il 25%
     D11    salti del pallone: nessuno spostamento > 3 u in < 0,06 s di scena fuori dagli stacchi
     D13    ingresso in campo: il logo del cerchio di centrocampo si legge dritto dalla camera (alto del logo lontano dalla camera)
   Rossi: CPM_G96_ROSSO=D2,D4,... accende i rispettivi __CPM_NO_G96Dn (o CPM_G96_ROSSO=tutti). Uscita 0 solo se tutto verde e la copertura c'e'.
   Uso: node scena3d-96.mjs  [CPM_G96_FORMATI=tel,pc,tabv,tabo] [CPM_G96_LISTA="18:riesce,5:parata"] [CPM_G96_FOTO=1] */
import fs from 'node:fs';
import path from 'node:path';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } = await import('./lib/harness.mjs');

const FORMATI = {
  tel: { k: 'tel', w: 412, h: 915, touch: true },
  pc: { k: 'pc', w: 1440, h: 900, touch: false },
  tabv: { k: 'tabv', w: 820, h: 1180, touch: true },
  tabo: { k: 'tabo', w: 1180, h: 820, touch: true },
};
/* scene del collaudo (rapporto 178) + tutte le famiglie; i rigori si aggiungono dal catalogo */
const LISTE = {
  tel: '18:riesce,31:riesce,15:parata,15:gol,3:riesce,13:riesce,63:riesce,16:riesce,16:intercetto,89:intercetto,128:riesce,30:riesce,100:gol,64:parata,RIGORI',
  pc: '18:riesce,31:riesce,15:parata,15:gol,3:riesce,100:gol,64:parata,16:riesce,RIGORI1',
  tabv: '18:riesce,15:parata,3:riesce',
  tabo: '18:riesce,15:parata,64:parata',
};
const OUTMAP = { gol: ['success', null], parata: ['fail', 'saved'], fuori: ['fail', 'wide'], riesce: ['success', null], sbaglia: ['fail', null], intercetto: ['fail', 'intercepted'] };
const ROSSO = (process.env.CPM_G96_ROSSO || '').split(',').map(s => s.trim()).filter(Boolean);
const ROSSI = ROSSO.includes('tutti') ? ['D2', 'D3', 'D4', 'D5', 'D8', 'D10', 'D11', 'D13'] : ROSSO;
const formati = (process.env.CPM_G96_FORMATI || 'tel,pc,tabv,tabo').split(',').filter(k => FORMATI[k]).map(k => FORMATI[k]);
const PER = +(process.env.CPM_G96_PER || 4);
const OUT = path.join(ROOT, 'tests', 'visual', 'out', 'scena3d-96' + (ROSSI.length ? '-rosso' : '')); fs.mkdirSync(OUT, { recursive: true });
const FOTO = !!process.env.CPM_G96_FOTO;

const INIT = (rossi) => {
  window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1;
  for (const r of rossi) window['__CPM_NO_G96' + r] = 1;
  window.__G96 = { on: false, fr: [] };
  const loop = () => { try { const B = window.__G96; if (B.on && B.fr.length < 5000 && window.__CPM_G96) { const o = window.__CPM_G96(); o.ck = typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null; o.cut = window.__CPM_CUTLIVE ? !!window.__CPM_CUTLIVE() : false; o.phx = window.__CPM_PHASE ? window.__CPM_PHASE() : null; B.fr.push(o); } } catch (e) {} requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
};

const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
async function nuova(f) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await browser.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(INIT, ROSSI); await openMatch(page, port, { name: 'Scena Tre D' });
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {}); await sleep(500);
  page._ctx = ctx; return page;
}
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
async function ingresso(f) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await browser.newContext(opt); await installCdnRoutes(ctx); const page = await ctx.newPage(); page._ctx = ctx;
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_GLB = true; for (const r of o.r) window['__CPM_NO_G96' + r] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, r: ROSSI });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => { window.__T96 = []; const g = () => { try { if (window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout' && window.__CPM_G96) { const o = window.__CPM_G96(); if (o && o.tap) window.__T96.push(o.tap); } } catch (e) {} requestAnimationFrame(g); }; requestAnimationFrame(g); });
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  for (let k = 0; k < 60; k++) { if ((await ph()) === 'walkout') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
    await sleep(700); }
  const t0 = Date.now(); let visto = false; while (Date.now() - t0 < 150000) { const p = await ph(); if (p === 'walkout') visto = true; else if (visto) break; if (visto && (await page.evaluate(() => window.__T96.length)) > 400) break; await sleep(300); }
  const T = await page.evaluate(() => window.__T96 || []); const vis = T.filter(t => t[1]);
  page._tap = { walkout: visto, letture: vis.length, dritto: vis.length ? +(vis.filter(t => t[0] > 0.17).length / vis.length).toFixed(2) : 0, cosMin: vis.length ? Math.min(...vis.map(t => t[0])) : null };
  return page;
}
const scena = p => p.evaluate(() => window.__CPM_SCENET || 0).catch(() => 0);
const attendi = async (p, ds, cap) => { const s0 = await scena(p); const t0 = Date.now(); while (Date.now() - t0 < cap) { if ((await scena(p)) - s0 >= ds) return true; await sleep(60); } return false; };
const dentro = (q, m = 1) => q && q[2] < 1 && Math.abs(q[0]) <= m && Math.abs(q[1]) <= m;

/* ---------------- analisi di una scena ---------------- */
function analizza(fr, rig, esito) {
  const F = fr.filter(x => x && !x.err && x.ck != null && /^hl_/.test(x.ph || ''));
  const a = { n: F.length };
  /* D2/D3: fuori quadro (piedi o testa) fuori dagli stacchi */
  let fu = 0, tot = 0; F.forEach(x => { if (x.cut || !x.hf) return; tot++; if (!(dentro(x.hf) && dentro(x.hh))) fu++; });
  a.fuori = tot ? +(fu / tot).toFixed(3) : null;
  const fin = F.filter(x => !x.cut).slice(-Math.max(3, Math.round(F.length * 0.2)));
  a.pallaFineFuori = fin.length ? +(fin.filter(x => x.b && !dentro(x.b)).length / fin.length).toFixed(2) : null;
  /* D8 */
  const cm = F.filter(x => !x.cut && x.campo != null).map(x => x.campo).sort((p, q) => p - q);
  a.campo = cm.length ? cm[Math.floor(cm.length / 2)] : null; { const oz = F.filter(x => !x.cut && x.oriz != null).map(x => x.oriz).sort((p, q) => p - q); a.cielo = oz.length ? oz[Math.floor(oz.length * 0.9)] : 0; }
  const tg = fin.filter(x => x.hf && x.hh).map(x => Math.abs(x.hh[1] - x.hf[1]) / 2); a.tagliaFine = tg.length ? +Math.min(...tg).toFixed(3) : null;
  /* D5: compenetrazione */
  let comp = 0, cmin = 99, cex = null; F.forEach(x => { const c = x.corpi || []; let dm = 99, pr = null;
    for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) { const d = Math.hypot(c[i][0] - c[j][0], c[i][1] - c[j][1]); if (d < dm) { dm = d; pr = c[i][2] + '-' + c[j][2]; } }
    if (dm < cmin) cmin = dm; if (dm < 0.45) { comp++; if (!cex) cex = `${pr} ${dm.toFixed(2)}u ${x.ph}@${(x.ck || 0).toFixed(2)}`; } });
  a.comp = comp; a.compMin = cmin === 99 ? null : +cmin.toFixed(2); a.compEx = cex;
  /* D10: targhette */
  let etR = 1, etOv = 0, etEx = null; F.forEach(x => { const e = (x.et || []).filter(t => Math.abs(t[0]) < 1 && Math.abs(t[1]) < 1); if (e.length < 1) return;
    const hs = e.map(t => t[2]); const r = Math.max(...hs) / Math.max(1e-4, Math.min(...hs)); if (r > etR) etR = r;
    for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++) { const A = e[i], B = e[j]; const ox = Math.max(0, Math.min(A[0] + A[3] / 2, B[0] + B[3] / 2) - Math.max(A[0] - A[3] / 2, B[0] - B[3] / 2)); const oy = Math.max(0, Math.min(A[1] + A[2] / 2, B[1] + B[2] / 2) - Math.max(A[1] - A[2] / 2, B[1] - B[2] / 2));
      const mn = Math.min(A[2] * A[3], B[2] * B[3]); if (mn > 0 && ox * oy / mn > 0.25) { etOv++; if (!etEx) etEx = `@${(x.ck || 0).toFixed(2)} ${x.ph}`; } } });
  a.etRap = +etR.toFixed(2); a.etSovr = etOv; a.etEx = etEx;
  /* D11: salti del pallone */
  let sal = 0, sEx = []; for (let i = 1; i < F.length; i++) { const p = F[i - 1], q = F[i]; const ds = q.ck - p.ck; if (ds > 0 && p.bw && q.bw && !p.cut && !q.cut && p.sk === q.sk) { const d = Math.hypot(q.bw[0] - p.bw[0], q.bw[1] - p.bw[1], q.bw[2] - p.bw[2]); if (d > 3 && d / ds > 60 && ds < 0.06) { sal++; if (sEx.length < 3) sEx.push(`${d.toFixed(1)}u/${ds.toFixed(3)}s ${q.ph}`); } } }
  a.salti = sal; a.saltiEx = sEx;
  /* D4: rigore */
  if (rig) { const R = F.filter(x => x.ph === 'hl_result' && x.gk && x.bw); let prima = 0, inVolo = 0, maxPre = 0, b0 = null, z0 = null, partito = false;
    R.forEach(x => { if (b0 == null) { b0 = x.bw; z0 = x.gk[2]; } if (!partito && Math.hypot(x.bw[0] - b0[0], x.bw[2] - b0[2]) > 0.3) partito = true;
      const sp = Math.abs(x.gk[2] - z0); const gesto = /^gk_/.test(x.gkA || '') && (x.gkW || 0) > 0.3;
      if (!partito) { maxPre = Math.max(maxPre, sp); if (sp > 0.4 || gesto) prima++; } else if (/^gk_/.test(x.gkA || '') && (sp > 0.4 || gesto)) inVolo++; });
    a.tuffoPrima = prima; a.spostPre = +maxPre.toFixed(2); a.tuffoInVolo = inVolo; }
  return a;
}
function giudica(r, f) {
  const a = r.an, out = [];
  if (a.n < 8) return ['scena non giudicabile: ' + a.n + ' fotogrammi'];
  if (a.fuori != null && a.fuori > 0.05) out.push(`D2/D3 eroe fuori quadro ${a.fuori}`);
  if (a.pallaFineFuori != null && a.pallaFineFuori > 0.34 && !/riesce|sbaglia/.test(r.esito)) out.push(`D3 pallone fuori quadro a fine scena ${a.pallaFineFuori}`);
  if (a.cielo > 0.20) out.push(`D8 quadro sopra l'orizzonte ${a.cielo}`);
  if (a.tagliaFine != null && a.tagliaFine < 0.06) out.push(`D8 eroe figurina a fine scena ${a.tagliaFine}`);
  if (a.comp >= 4) out.push(`D5 compenetrazione ${a.comp} fotogrammi (${a.compEx})`);
  if (a.etRap > 1.6) out.push(`D10 targhette ${a.etRap}x`);
  if (a.etSovr > 3) out.push(`D10 targhette sovrapposte ${a.etSovr}`);
  if (a.salti > 0) out.push(`D11 salti del pallone ${a.salti} (${a.saltiEx.join('; ')})`);
  if (r.rig) { if (a.tuffoPrima > 2) out.push(`D4 tuffo prima del tiro (${a.tuffoPrima} fotogrammi, ${a.spostPre}u)`); if (r.esito === 'parata' && a.tuffoInVolo < 1) out.push('D4 parata senza tuffo in volo'); }
  if (r.compA >= 1 && r.compAmin < 0.3) out.push(`D5 corpi sovrapposti all'apertura (${r.compAmin}u)`);
  return out;
}

const tutti = []; let catalogo = null, errs = [];
for (const f of formati) {
  let page = await nuova(f); let usate = 0;
  if (!catalogo) catalogo = await page.evaluate(() => SITUATIONS.map((s, gi) => ({ gi, acts: (s.actions || []).map(a => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return h.type || null; }) })));
  const rigori = catalogo.filter(s => s.acts.includes('penalty')).map(s => s.gi);
  let src = process.env.CPM_G96_LISTA || LISTE[f.k];
  src = src.replace('RIGORI1', rigori.slice(0, 1).map(g => g + ':parata').join(',')).replace('RIGORI', rigori.map((g, i) => g + ':' + (i % 3 === 2 ? 'gol' : 'parata')).join(','));
  const lista = src.split(',').filter(x => x && x !== 'nessuna').map(x => { const [g, e] = x.split(':'); return { gi: +g, e: e || 'riesce' }; });
  console.log(`${f.k}: ${lista.length} scene (rigori del catalogo: ${rigori.join(',')})`);
  for (const ex of lista) {
    if (usate >= PER) { errs.push(...page._errs.map(e => f.k + ' ' + e)); await page._ctx.close().catch(() => {}); page = await nuova(f); usate = 0; } usate++;
    const s = catalogo[ex.gi]; const k = Math.max(0, s ? s.acts.findIndex(t => t === 'penalty') : 0); const kk = s && s.acts.includes('penalty') ? k : 0;
    const r = { f: f.k, gi: ex.gi, esito: ex.e, rig: !!(s && s.acts[kk] === 'penalty'), id: `${f.k}-gi${ex.gi}-${ex.e}` };
    try {
      await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; });
      await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (ex.gi + 61) % catalogo.length).catch(() => false); await attendi(page, 0.5, 8000);
      await page.evaluate(() => { window.__G96.fr = []; window.__G96.on = true; });
      const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), ex.gi).catch(() => false); if (!ok) throw new Error('forzatura fallita');
      await attendi(page, 1.1, 14000);
      const ap = await page.evaluate(() => { window.__G96.on = false; const f = window.__G96.fr.slice(); window.__G96.fr = []; return f; });
      const apF = ap.filter(x => x && x.ph === 'hl_choose' && x.corpi && !x.cut);
      let cA = 0, cAm = 99; apF.forEach(x => { const c = x.corpi; let dm = 99; for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) dm = Math.min(dm, Math.hypot(c[i][0] - c[j][0], c[i][1] - c[j][1])); if (dm < 0.45) cA++; cAm = Math.min(cAm, dm); });
      r.compA = cA; r.compAmin = +cAm.toFixed(2);
      if (FOTO) await page.screenshot({ path: path.join(OUT, r.id + '-1apertura.jpg'), type: 'jpeg', quality: 55 }).catch(() => {});
      const [o, kd] = OUTMAP[ex.e] || OUTMAP.riesce;
      await page.evaluate(([oo, kk]) => { window.__CPM_FORCE_OUTCOME = oo; if (kk) window.__CPM_FORCE_KIND = kk; else delete window.__CPM_FORCE_KIND; window.__G96.fr = []; window.__G96.on = true; }, [o, kd]);
      if (!await page.evaluate(k => window.__CPM_RESOLVE(k), kk).catch(() => false)) throw new Error('risoluzione fallita');
      const t0 = Date.now(); let fotoN = 0; const s0 = await scena(page);
      while (Date.now() - t0 < 60000) { const ph = await page.evaluate(() => window.__CPM_PHASE()).catch(() => null); const ds = (await scena(page)) - s0;
        if (FOTO && fotoN < 3 && ds >= [0.5, 1.6, 3.0][fotoN]) { await page.screenshot({ path: path.join(OUT, `${r.id}-${fotoN + 2}.jpg`), type: 'jpeg', quality: 55 }).catch(() => {}); fotoN++; }
        if (ph !== 'hl_result' && ph !== 'hl_choose' && ph !== 'hl_move' && ph !== 'hl_intro' && Date.now() - t0 > 1500) break; if (ds > 5.0) break; await sleep(120); }
      r.fr = await page.evaluate(() => { window.__G96.on = false; return window.__G96.fr.slice(); });
    } catch (e) { r.errore = String(e.message || e).slice(0, 160); }
    r.an = analizza(r.fr || [], r.rig, r.esito); if (process.env.CPM_G96_DUMP) fs.writeFileSync(path.join(OUT, r.id + '-fr.json'), JSON.stringify(r.fr || [])); delete r.fr; r.ko = r.errore ? ['errore: ' + r.errore] : giudica(r, f);
    tutti.push(r);
    console.log(`${r.id.padEnd(24)} ${r.ko.length ? '✗ ' + r.ko.join(' · ') : '✓'}  [fuori ${r.an.fuori} campo ${r.an.campo} cielo ${r.an.cielo} taglia ${r.an.tagliaFine} comp ${r.an.comp}/${r.an.compMin} ap ${r.compA}/${r.compAmin} et ${r.an.etRap}x/${r.an.etSovr} salti ${r.an.salti}${r.rig ? ` rig ${r.an.tuffoPrima}/${r.an.spostPre}/${r.an.tuffoInVolo}` : ''}]`);
  }
  /* D13: ingresso in campo — logo del cerchio letto dalla camera (percorso vero: salvataggio -> partita -> walkout) */
  try {
    errs.push(...page._errs.map(e => f.k + ' ' + e)); await page._ctx.close().catch(() => {}); page = await ingresso(f);
    const t = page._tap;
    const d13 = { f: f.k, id: `${f.k}-walkout`, tap: t };
    d13.ko = !t ? ['D13 testimone del tappeto assente'] : (t.letture < 3 ? ['D13 tappeto mai visto: ' + t.letture + ' letture'] : (t.dritto < 0.9 ? [`D13 logo del cerchio capovolto: ${t.dritto} delle letture dritte`] : []));
    tutti.push(d13); console.log(`${d13.id.padEnd(24)} ${d13.ko.length ? '✗ ' + d13.ko.join(' · ') : '✓'}  ${JSON.stringify(t)}`);
  } catch (e) { tutti.push({ f: f.k, id: f.k + '-walkout', ko: ['D13 errore ' + String(e.message).slice(0, 100)] }); }
  errs.push(...page._errs.map(e => f.k + ' ' + e)); await page._ctx.close().catch(() => {});
}
await browser.close(); srv.close();

/* D8 per formato: mediana del prato */
const perF = {}; tutti.filter(r => r.an && r.an.campo != null).forEach(r => (perF[r.f] = perF[r.f] || []).push(r.an.campo));
const d8 = []; for (const [k, v] of Object.entries(perF)) { v.sort((a, b) => a - b); const m = v[Math.floor(v.length / 2)]; console.log(`D8 ${k}: mediana prato ${m}`); if (m < 0.58) d8.push(`D8 ${k} prato mediano ${m} < 0,58`); }
const scene = tutti.filter(r => r.an); const giudicate = scene.filter(r => !r.ko.some(x => /non giudicabile|errore/.test(x)));
const ko = tutti.filter(r => r.ko && r.ko.length); const fail = ko.length + d8.length;
const per = {}; for (const r of ko) for (const m of r.ko) { const c = (m.match(/^D\d+(\/D\d+)?/) || ['altro'])[0]; per[c] = (per[c] || 0) + 1; } for (const m of d8) per.D8 = (per.D8 || 0) + 1;
fs.writeFileSync(path.join(OUT, 'risultati.json'), JSON.stringify({ rossi: ROSSI, tutti, d8, per, errs }, null, 1));
console.log(`\nscene giudicate ${giudicate.length}/${scene.length} · rossi per punto ${JSON.stringify(per)} · errori di pagina ${errs.length}`);
const copertura = scene.length > 0 && giudicate.length >= Math.min(scene.length, Math.max(3, Math.ceil(scene.length * 0.8)));
if (!copertura) { console.log('✗ COPERTURA INSUFFICIENTE: passata cieca'); process.exit(2); }
if (ROSSI.length) { const visti = ROSSI.filter(r => Object.keys(per).some(k => k.split('/').includes(r))); console.log(`rossi accesi ${ROSSI.join(',')} · visti ${visti.join(',')}`); }
console.log(fail ? `✗ scena3d-96 ROSSO (${fail})` : '✓ scena3d-96 VERDE'); process.exit(fail ? 1 : 0);
