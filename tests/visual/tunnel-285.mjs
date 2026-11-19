#!/usr/bin/env node
/* [giro 285 PO-544 «c'e' una fascia nera davanti al tunnel che non dovrebbe esserci»] GUARDIANO sul percorso vero
   (salvataggio → partita → ingresso in campo; in piu' il percorso del PO: nuova carriera → provino → ingresso), una pagina nuova
   per stadio, di NOTTE a ora congelata (__CPM_TOD). Misura che fra la bocca del tunnel e la linea laterale, nel varco piu' stretto
   (x bocca ± 4,7 · z da 5 cm davanti alla cornice della bocca, −35,85 o piu' avanti, alla linea −33,4 · da 5 cm a 2,6 d'altezza), non resti NESSUNA superficie ferma.
   La scena si prende dal banco (Object3D.add): il guardiano non dipende da un testimone del gioco e gira su qualunque versione.
   Due misure indipendenti, tutte e due in TRE momenti della scena (1,0 · 3,0 · 8,0 s di tempo di SCENA, letto dal testimone 245):
   · CENSIMENTO: ogni mesh visibile (non un corpo animato) la cui scatola in coordinate mondo entra nel volume del varco;
   · DALL'ALTO: una griglia di raggi verticali (passo 0,2) sul varco; conta le celle in cui il primo oggetto colpito sopra 5 cm
     non e' il prato. E' la quota del varco coperta vista dall'alto.
   Conta solo cio' che e' FERMO (stessa mesh, stessa scatola / stessa cella nei tre momenti): i corpi che camminano o aspettano
   in coda alla bocca non sono giudicati (misurato nel provino: a 1 e a 3 s le teste dei primi due in coda stavano ferme a z -35,5).
   Di ogni superficie trovata si scrive nome (userData.ost245), geometria, scatola, colore e luminanza media (0 nero · 1 bianco).
   VERDE: in ogni stadio zero superfici ferme nel varco e 0 celle coperte.
   «Non giudicato» = ROSSO: ingresso non visto · scena non catturata · bocca non dichiarata · meno di tre momenti misurati ·
   controllo di vista fallito (il censimento DEVE vedere, appena fuori dal varco, i due tratti di striscia LED accanto alla bocca:
   se non li vede e' cieco) · griglia con meno di 200 raggi.
   ROSSO (CPM_PROVA_ROSSO=1 → window.__CPM_NO_G285, il nastro della competizione intero): il guardiano DEVE vedere in OGNI stadio
   una superficie ferma scura (luminanza < 0,25) nel varco e celle coperte; esce 0 solo se la vede.
   CPM_SCENARI=a,b · CPM_TOD=night|day|dusk · CPM_GLB=1 (foto coi corpi 3D) · CPM_FOTO_DIR · CPM_TAG · CPM_ROOT=<altra copia del gioco, es. la 196> · CPM_SOLO_MISURA=1.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tunnel-285.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, clickByText, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ROSSO = !!process.env.CPM_PROVA_ROSSO, GLB = process.env.CPM_GLB === '1', TOD = process.env.CPM_TOD || 'night', TAG = process.env.CPM_TAG || (ROSSO ? 'rosso' : 'dopo');
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro285'); fs.mkdirSync(DIR, { recursive: true });
const TPL = { provincia: 6000, comunale: 15000, storico_it: 40000, moderno_it: 45000, inglese: 35000, tedesco: 60000, spagnolo: 70000, francese: 30000, olandese: 25000, sudamericano: 50000, borgo: 3000, catino: 25000, mattoni: 28000, arena: 60000 };
/* quattro stili di bocca (telescopico · portale in cemento · pensilina del borgo · vetro dell'arena) + il percorso della foto del PO */
const PIANO = (process.env.CPM_SCENARI || 'comunale,inglese,borgo,arena,provino').split(',');
const srv = await startServer(process.env.CPM_ROOT || ROOT); const port = srv.address().port; const b = await launchBrowser();
const censimento = () => { const S = window.__SC285, T = window.THREE; if (!S) return { err: 'scena non catturata' };
  const tun = (window.__CPM_G245 || {}).tunnel || (window.__CPM_STADI246 || {}).tunnel || null; if (!tun) return { err: 'bocca non dichiarata' };
  const tx = tun.x, X0 = tx - 4.7, X1 = tx + 4.7; let Z0 = -35.85; const Z1 = -33.4, Y0 = 0.05, Y1 = 2.6; const bb = new T.Box3(); const ogg = [], led = [];
  const vis = o => { for (let p = o; p; p = p.parent) if (p.visible === false) return false; return true; };
  const corpo = o => { for (let p = o; p; p = p.parent) if (p.isSkinnedMesh || p.isBone) return true; return !!o.isSkinnedMesh; };
  const lum = o => { const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m) return null; let r = 1, g = 1, bl = 1; if (m.color) { r = m.color.r; g = m.color.g; bl = m.color.b; }
    try { const im = m.map && m.map.image; if (im && im.getContext) { const d = im.getContext('2d').getImageData(0, 0, im.width, im.height).data; let a = 0, c = 0, e = 0, n = 0; for (let i = 0; i < d.length; i += 16) { a += d[i]; c += d[i + 1]; e += d[i + 2]; n++; } r *= a / n / 255; g *= c / n / 255; bl *= e / n / 255; } } catch (e) {}
    return { col: '#' + [r, g, bl].map(v => ('0' + Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16)).slice(-2)).join(''), l: +(0.2126 * r + 0.7152 * g + 0.0722 * bl).toFixed(3), op: m.opacity, tr: !!m.transparent }; };
  const dati = o => { bb.setFromObject(o); return { id: o.uuid, k: (o.userData && o.userData.ost245) || null, g: (o.geometry && o.geometry.type) || o.type, x: [+bb.min.x.toFixed(2), +bb.max.x.toFixed(2)], y: [+bb.min.y.toFixed(2), +bb.max.y.toFixed(2)], z: [+bb.min.z.toFixed(2), +bb.max.z.toFixed(2)], ...(lum(o) || {}) }; };
  S.updateMatrixWorld(true);
  /* la bocca e' la sua cornice: dove il tunnel non e' telescopico i due pilastri del portale sporgono di 0,25-0,35 oltre z -35,9.
     Il varco comincia 5 cm davanti alla faccia della cornice (pilastri e pareti etichettati «tunnel-…»), mai prima di -35,85. */
  S.traverse(o => { const k = o.userData && o.userData.ost245; if (!o.isMesh || !vis(o) || !k || k.indexOf('tunnel-') !== 0) return; bb.setFromObject(o); if (bb.max.z + 0.05 > Z0) Z0 = bb.max.z + 0.05; });
  S.traverse(o => { if (!(o.isMesh || o.isSprite) || !vis(o) || corpo(o)) return; try { bb.setFromObject(o); } catch (e) { return; } if (bb.isEmpty()) return;
    if (o.userData && o.userData.ost245 === 'striscia-led' && bb.min.z < 0 && bb.max.x > tx - 9.5 && bb.min.x < tx + 9.5) led.push([+bb.min.x.toFixed(2), +bb.max.x.toFixed(2)]);
    if (bb.max.x - bb.min.x > 200 && bb.max.z - bb.min.z > 200) return;/* la volta del cielo e il terreno intorno allo stadio */
    if (bb.max.x <= X0 || bb.min.x >= X1 || bb.max.z <= Z0 || bb.min.z >= Z1 || bb.max.y <= Y0 || bb.min.y >= Y1) return; ogg.push(dati(o)); });
  /* dall'alto (solo mesh ferme o no, mai i corpi animati; gli sprite restano nel censimento) */
  const cand = []; S.traverse(o => { if (o.isMesh && vis(o) && !corpo(o)) cand.push(o); });
  const rc = new T.Raycaster(), giu = new T.Vector3(0, -1, 0), da = new T.Vector3(); const celle = {}; let raggi = 0; const visti = {};
  for (let x = X0 + 0.1; x < X1; x += 0.2) for (let z = Z0 + 0.1; z < Z1; z += 0.2) { raggi++; da.set(x, Y1, z); rc.set(da, giu); rc.far = Y1 - Y0;
    const H = rc.intersectObjects(cand, false); for (const h of H) { const o = h.object; celle[x.toFixed(1) + '/' + z.toFixed(1)] = o.uuid; if (!visti[o.uuid]) visti[o.uuid] = dati(o); break; } }
  const W = window.__CPM_G245W || []; return { tun, z0: +Z0.toFixed(2), t: W.length ? W[W.length - 1].t : null, ogg, led, celle, raggi, visti }; };
async function stadio(nome) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const prov = nome === 'provino';
  await page.addInitScript(o => { window.__CPM_GLB = !!o.glb; window.__CPM_TOD = o.tod; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_G245W = []; if (!o.prov) window.__CPM_TIPO206 = 'normale'; else window.__CPM_PREP246 = 1;/* sul banco il provino salta la pre-partita: il gancio del giro 246 la rimette */
    if (o.tpl) { window.__CPM_STADIUM_TPL_FORCE = o.tpl; window.__CPM_STADIUM_CAP_FORCE = o.cap; } if (o.rosso) window.__CPM_NO_G285 = true;
    if (!o.prov) localStorage.setItem('cpm-v3', JSON.stringify(o.s));
    const iv = setInterval(() => { const T = window.THREE; if (!T) return; clearInterval(iv); if (T.__p285) return; T.__p285 = 1; const add = T.Object3D.prototype.add; T.Object3D.prototype.add = function () { if (this.isScene) window.__SC285 = this; return add.apply(this, arguments); }; }, 5);
  }, { s: SAVE, tpl: TPL[nome] ? nome : null, cap: TPL[nome] || 0, tod: TOD, glb: GLB, rosso: ROSSO, prov });
  const out = { nome, foto: [], mis: [] };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
    if (prov) { if (!await clickByText(page, 'Nuova carriera')) throw new Error('"Nuova carriera" non trovato'); await sleep(700);
      await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, 'Collaudo');
      if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('"INIZIA I PROVINI" non trovato'); await sleep(400);
      if (!await clickByText(page, 'Inizia il provino')) throw new Error('"Inizia il provino" non trovato'); await sleep(800); }
    else { try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(2000);
      try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch()); }
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 70; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
    out.walk = (await ph()) === 'walkout'; if (!out.walk) out.fase = [await ph(), await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim().slice(0, 30)).slice(0, 12)).catch(() => null)];
    const tScena = () => page.evaluate(() => { const W = window.__CPM_G245W || []; return W.length ? W[W.length - 1].t : 0; }).catch(() => 0);
    const fino = async t => { const t0 = Date.now(); while (Date.now() - t0 < 300000) { if ((await ph()) !== 'walkout') return false; if (await tScena() >= t) return true; await sleep(150); } return false; };
    if (out.walk && await fino(1.0)) out.mis.push(await page.evaluate(censimento));
    if (out.walk && await fino(2.4) && process.env.CPM_FOTO !== '0') { const f = `${TAG}-${nome}-${TOD}${GLB ? '-glb' : ''}-camera.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 85 }).catch(() => {}); out.foto.push(f); }
    if (out.walk && await fino(3.0)) out.mis.push(await page.evaluate(censimento));
    if (out.walk && await fino(8.0)) out.mis.push(await page.evaluate(censimento));
    if (out.mis.length === 3 && !out.mis[1].err && process.env.CPM_FOTO !== '0') { const tx = out.mis[1].tun.x;
      for (const [suf, cam] of [['alto', { x: tx, y: 15, z: -30.5, lx: tx, ly: 0, lz: -34.6 }], ['fianco', { x: tx - 9, y: 2.4, z: -29.5, lx: tx, ly: 0.6, lz: -35.2 }]]) {
        await page.evaluate(c => { window.__CPM_CAM904 = c; }, cam); await sleep(GLB ? 2500 : 1000);
        const st = await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' }); const f = `${TAG}-${nome}-${TOD}${GLB ? '-glb' : ''}-${suf}.jpg`; await page.screenshot({ path: path.join(DIR, f), type: 'jpeg', quality: 85 }).catch(() => {}); out.foto.push(f); await st.evaluate(n => n.remove()).catch(() => {}); } }
  } catch (e) { out.errore = String(e.message).slice(0, 200); }
  out.errori = errs.slice(0, 3); await ctx.close(); return out; }
const R = {}; const guasti = []; let nVisti = 0, n = 0;
for (const nome of PIANO) { n++; const o = await stadio(nome); R[nome] = o; const g = []; const [a, c, d] = o.mis;
  if (o.errore) g.push('errore: ' + o.errore); if ((o.errori || []).length) g.push('errori di pagina: ' + o.errori[0]);
  if (!o.walk) g.push('non giudicato: ingresso non visto' + (o.fase ? ' — fase ' + JSON.stringify(o.fase) : ''));
  let fermi = [], coperte = 0, raggi = 0, scuri = [];
  if (!a || !c || !d) g.push(`non giudicato: ${o.mis.length} momenti misurati su 3`);
  else if (a.err || c.err || d.err) g.push('non giudicato: ' + (a.err || c.err || d.err));
  else { raggi = c.raggi;
    if (c.led.length < 2 || a.led.length < 2) g.push(`non giudicato: controllo di vista fallito, ${c.led.length} tratti di striscia LED visti accanto alla bocca (minimo 2)`);
    if (raggi < 200) g.push(`non giudicato: griglia di ${raggi} raggi (minimo 200)`);
    const stessa = (M, x) => M.ogg.some(y => y.id === x.id && JSON.stringify([y.x, y.y, y.z]) === JSON.stringify([x.x, x.y, x.z]));
    fermi = c.ogg.filter(x => stessa(a, x) && stessa(d, x));
    const idC = {}; for (const k in c.celle) if (a.celle[k] === c.celle[k] && d.celle[k] === c.celle[k]) { coperte++; idC[c.celle[k]] = (idC[c.celle[k]] | 0) + 1; }
    for (const id in idC) if (!fermi.some(x => x.id === id) && c.visti[id]) fermi.push({ ...c.visti[id], soloDallAlto: true });
    fermi.forEach(x => { x.celle = idC[x.id] | 0; }); scuri = fermi.filter(x => x.l != null && x.l < 0.25);
    fermi.forEach(x => g.push(`superficie ferma nel varco: ${x.k || 'senza etichetta'} (${x.g}) x ${x.x[0]}..${x.x[1]} · y ${x.y[0]}..${x.y[1]} · z ${x.z[0]}..${x.z[1]} · colore ${x.col} luminanza ${x.l} opacita' ${x.op} · ${x.celle} celle dall'alto`));
    if (coperte) g.push(`${coperte} celle su ${raggi} coperte dall'alto (${(100 * coperte / raggi).toFixed(1)}% del varco)`); }
  o.fermi = fermi; o.coperte = coperte; o.raggi = raggi; const visto = scuri.length > 0 && coperte > 0; if (visto) nVisti++; o.rossoVisto = visto;
  console.log(`${g.length ? '✗' : '✓'} ${nome.padEnd(10)} ${TOD} · bocca ${c && c.tun ? 'x ' + c.tun.x + ' ' + c.tun.stile : '?'} · varco da z ${c && c.z0} · scena ${a && a.t}s / ${c && c.t}s / ${d && d.t}s · striscia LED accanto ${c && c.led ? JSON.stringify(c.led) : '?'} · superfici ferme nel varco ${fermi.length} (scure ${scuri.length}) · celle coperte ${coperte}/${raggi}`);
  g.forEach(x => { console.log('    ' + x); guasti.push(nome + ': ' + x); }); o.guasti = g; }
await b.close(); srv.close();
fs.writeFileSync(path.join(DIR, `misura-285-${TAG}-${TOD}.json`), JSON.stringify(R, (k, v) => (k === 'celle' || k === 'visti') ? undefined : v, 1));
if (process.env.CPM_SOLO_MISURA) { console.log(`MISURA (${TAG}) — ${n} stadi, ${guasti.length} voci`); process.exit(0); }
if (ROSSO) { const ng = Object.values(R).filter(o => (o.guasti || []).some(x => /non giudicato|errore/.test(x))).length; const ok = n >= 3 && nVisti === n && !ng;
  console.log(`\nBRACCIO ROSSO (__CPM_NO_G285, nastro intero) — superficie scura ferma nel varco vista in ${nVisti}/${n} stadi · non giudicati ${ng}`);
  console.log(ok ? 'ROSSO VISTO: il guardiano riconosce la fascia davanti al tunnel.' : 'ROSSO NON VISTO: guardiano cieco.'); process.exit(ok ? 0 : 1); }
console.log(`\nBRACCIO VERDE — ${n} stadi (${TOD}) · ${guasti.length} guasti`);
console.log(n >= 3 && !guasti.length ? 'VERDE: fra la bocca del tunnel e la linea laterale non c\'e\' nessuna superficie ferma.' : 'ROSSO: ' + (guasti[0] || 'meno di 3 stadi giudicati')); process.exit(n >= 3 && !guasti.length ? 0 : 1);
