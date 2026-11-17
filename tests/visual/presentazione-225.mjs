#!/usr/bin/env node
/* [giro 225 · PO-489 collaudo PO 7.999.195 «I tifosi non si vedono come nella partita 3D, i colori della pelle e dei capelli non sono
   coerenti con le relative figurine. Quando ritornano in fila volano ed il movimento del braccio nel saluto non è naturale» + fascia
   grigia in basso] GUARDIANO della serata di presentazione 3D, corpi accesi, telefono 375x812 e PC 1280x720. Verde e rosso
   (window.__CPM_NO_G225) sulla stessa macchina; ogni misura si legge dalla scena (ossa, materiali, raggi, pixel), non da un «fatto».
   A · TIFO: la folla a sagome della partita (istanze 'folla129' nella scena, densita' 'vera', tempo dello shader che avanza) e la resa
       degli spalti (luminanza per zone, stessa camera fissa del giro 206) entro ±TOL_RESA dalla partita di notte dello stesso salvataggio;
       ripiego: se lo strato non lascia pixel (__CPM_G225_NODRAW, il telefono del giro 192) gli spalti hanno la folla dipinta.
   B · PELLE E CAPELLI: per ogni chiamato, figurina letta dal DOM (immagine della targhetta) → capelli: la classe dell'indice deve essere
       la variante della testa 3D; pelle: colore del viso campionato sull'immagine della figurina contro il colore RESO (mediana dei
       pixel di pelle del viso nel fotogramma, a chiamato fermo davanti alla camera), distanza CIE76 <= DE_PELLE. Si stampa anche il colore
       di base del materiale (texture x tinta), senza soglia.
   C · PIEDI: per ogni corpo e per tutta la scena la punta piu' bassa sta fra PIEDE_MIN e PIEDE_MAX dal prato; chi si sposta cammina:
       slittamento (spostamento del piede d'appoggio / spostamento del corpo) <= SLITTA_MAX.
   D · SALUTO: gomito, elevazione dell'omero, residuo fuori dalla cerniera del gomito, polso, mano dal piano mediano e dal busto, velocita'
       angolari di omero e avambraccio dentro i limiti dichiarati; la mano sta sopra la spalla per almeno SALUTO_S di scena.
   E · FASCIA: al battito 0 nessun raggio della camera verso il prato incontra prima una struttura in quota (tetto, travi).
   «Non giudicato» = rosso. Soglie fissate dopo la misura (rapporto giro 225), mai da abbassare. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { misuraZone, apriPartita } from './lib/notte-206.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g225', { recursive: true });
const TOL_RESA = 0.35, SAGOME_MIN = 5000, DE_PELLE = 12, PIEDE_MIN = -0.03, PIEDE_MAX = 0.05, SLITTA_MAX = 0.35, SALUTO_S = 1.5, SALUTO_MANO = 0.15;
const BATTITO = 0.16, BATTITI_MIN = 4, MANI_MIN = 0.08, LATO_CLIP = 0.02, TESTA_MIN = 0.15;/* [giro 240] applauso della clip, misurato (misura-240.mjs): palmi 0,123-0,175 a mani alte, 9-10 battiti, mano destra a 0,039 dal piano mediano, testa a 0,285 */
const LIM = { gomitoMin: 40, elevMax: 150, fuoriMax: 25, polsoMax: 70, latoMin: 0.05, bustoMin: 0.12, velOmeroMax: 350, velAvambraccioMax: 530 };/* velocita' su finestra di 0,10 s di scena: verde 215/427, rosso 521/642 */
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SOLO = (process.env.CPM_SOLO || 'verde,rosso,rosso240,ripiego').split(',');
const FOTO = process.env.CPM_FOTO || '';/* prefisso (cartella/nome) per le foto prima/dopo */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function apri(flags, vp) {
  const ctx = await b.newContext({ viewport: vp, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage(); const err = []; p.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
  await p.addInitScript(([o, f]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, flags]);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return { ctx, p, err };
}
const beat = async (p, n) => { await p.evaluate(x => window.__CPM_CAREER.apriPresentazione(x), n);
  await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2 && window.__CPM_PRES142.cam, null, { timeout: 90000 }); };
/* E · raggi dalla camera: una struttura in quota davanti al prato */
const fascia = (p) => p.evaluate(() => { const P = window.__CPM_PRES142, T = window.THREE, cam = P.cam; cam.updateMatrixWorld(true);
  const objs = []; P.scene.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return; let a = o, vis = true; while (a) { if (a.visible === false) { vis = false; break; } a = a.parent; } if (vis) objs.push(o); });
  const rc = new T.Raycaster(), v = new T.Vector2(), piano = new T.Plane(new T.Vector3(0, 1, 0), 0), q = new T.Vector3(); let n = 0, cop = 0; const chi = {};
  for (let gy = 0; gy < 40; gy++) for (let gx = 0; gx < 40; gx++) { v.set((gx + 0.5) / 40 * 2 - 1, (gy + 0.5) / 40 * 2 - 1); rc.setFromCamera(v, cam);
    if (!rc.ray.intersectPlane(piano, q) || Math.abs(q.x) > 52 || Math.abs(q.z) > 34) continue; n++; const dP = q.distanceTo(cam.position);
    const h = rc.intersectObjects(objs, false)[0]; if (h && h.distance < dP - 0.5 && h.point.y > 5) { cop++; const m = h.object.material; const k = (m && m.transparent ? 'trasparente ' + m.opacity : 'opaco') + ' y' + Math.round(h.point.y); chi[k] = (chi[k] || 0) + 1; } }
  return { raggiSulPrato: n, coperti: cop, chi, camY: +cam.position.y.toFixed(1) }; });
/* A · tifo letto dalla scena */
const tifo = async (p) => { const leggi = () => p.evaluate(() => { const P = window.__CPM_PRES142; let n = 0, vis = false; P.scene.traverse(o => { if (o.name === 'folla129') { n += o.count; vis = o.visible; } });
    const W = window.__CPM_PRES225 || {}, F = window.__CPM_FOLLA129 || {}, D = window.__CPM_PRES192 || {}; return { sagome: n, visibili: vis, dens: n ? F.dens : null, uT: W.uT != null ? W.uT : null, modo: W.tifo || null, provaPx: W.provaPx != null ? W.provaPx : null, dipinti: D.dipinti || 0 }; });
  const a = await leggi(); await sleep(700); const c = await leggi(); return { ...c, anima: a.uT != null && c.uT != null && c.uT > a.uT }; };
const zone = async (p, foto) => { await p.evaluate(() => { const P = window.__CPM_PRES142; window.__CPM3D = { scene: P.scene, camera: P.cam, renderer: P.renderer }; }); return (await misuraZone(p, 'tribuna', foto || null)).zone; };
/* B · figurina (DOM) contro corpo (materiali + pixel) per il chiamato del battito */
const colori = (p) => p.evaluate(async () => { const P = window.__CPM_PRES142, T = window.THREE; const im = document.querySelector('[data-cpm="pres200-tv"] img'); if (!im || !im.src) return { errore: 'targhetta senza immagine' };
  if (!im.complete || !im.naturalWidth) await new Promise(r => { im.onload = r; im.onerror = r; setTimeout(r, 4000); });
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const x0 = Math.floor(c.width * .40), y0 = Math.floor(c.height * .36), w = Math.floor(c.width * .60) - x0, h = Math.floor(c.height * .50) - y0, d = g.getImageData(x0, y0, w, h).data;
  const med = k => { const a = []; for (let i = k; i < d.length; i += 4) a.push(d[i]); a.sort((x, y) => x - y); return a[a.length >> 1]; }; const viso = [med(0), med(1), med(2)];
  const idx = await (await fetch('assets/portraits/ai/indice.json')).json(); const f = decodeURI(new URL(im.src).pathname).split('assets/portraits/ai/')[1]; const rec = idx.g.find(r => r.f === f) || idx.s.find(r => r.f === f) || null;
  const i = P.pi144, m = P.men[i]; if (!m) return { errore: 'nessun chiamato' };
  const BASE = [208, 143, 113]; let pelle = BASE.slice(), tinto = false; const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }, srgb = v => Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
  m.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(mt => { if (mt && mt.userData && mt.userData.base225 === 'Material.001' && mt.userData.u225) { const u = mt.userData.u225; tinto = true;
    pelle = m.userData.lin225 ? [srgb(lin(BASE[0]) * u.x), srgb(lin(BASE[1]) * u.y), srgb(lin(BASE[2]) * u.z)] : [Math.round(BASE[0] * u.x), Math.round(BASE[1] * u.y), Math.round(BASE[2] * u.z)]; } }); });
  /* colore reso: pixel del viso nel fotogramma */
  let reso = null; for (let giro = 0; giro < 4 && !reso; giro++) { if (giro) await new Promise(r => setTimeout(r, 300)); try { const B = {}; m.traverse(o => { if (o.isBone && o.name === 'head') B.h = o; }); const v = new T.Vector3(); B.h.getWorldPosition(v); v.y += 0.07; v.z += 0.09; v.project(P.cam); P.renderer.render(P.scene, P.cam);
    const gl = P.renderer.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight, cx = Math.round((v.x + 1) / 2 * W), cy = Math.round((v.y + 1) / 2 * H), R = Math.max(3, Math.round(H * 0.007)), px = new Uint8Array((2 * R + 1) * (2 * R + 1) * 4);
    gl.readPixels(cx - R, cy - R, 2 * R + 1, 2 * R + 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const a = [[], [], []]; for (let k = 0; k < px.length; k += 4) { if (px[k] > px[k + 1] && px[k + 1] > px[k + 2] && px[k] > 70) { a[0].push(px[k]); a[1].push(px[k + 1]); a[2].push(px[k + 2]); } }
    if (a[0].length > 5) reso = a.map(z => { z.sort((x, y) => x - y); return z[z.length >> 1]; }); } catch (e) {} }
  return { i, nome: (document.querySelector('[data-cpm="pres200-tv"]') || {}).innerText || '', volto: rec && rec.n, classe: rec && rec.k, capelliFig: rec && rec.h, viso, pelle3d: pelle, tinto, capelli3d: (m.userData.cpmNativeHair || {}).variant || null, capelliPronti: !!(m.userData.cpmNativeHair || {}).applied, reso }; });
const lab = ([r, g, bb]) => { const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; const R = f(r), G = f(g), B = f(bb);
  let x = (R * .4124 + G * .3576 + B * .1805) / .95047, y = R * .2126 + G * .7152 + B * .0722, z = (R * .0193 + G * .1192 + B * .9505) / 1.08883; const t = v => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116; x = t(x); y = t(y); z = t(z); return [116 * y - 16, 500 * (x - y), 200 * (y - z)]; };
const dE = (a, c) => { const A = lab(a), C = lab(c); return Math.hypot(A[0] - C[0], A[1] - C[1], A[2] - C[2]); };
const VAR = { neri: 'black', castani: 'brown', biondi: 'blond', rossi: 'auburn' };
/* C+D · serie per fotogramma del battito: piedi di tutti, cammino e braccio del chiamato */
const serie = (p) => p.evaluate(async () => { const P = window.__CPM_PRES142, T = window.THREE, v = new T.Vector3(); const oss = P.men.map(m => { const B = {}; m.traverse(o => { if (o.isBone && /^(ball_[lr])$/.test(o.name)) B[o.name] = o; }); return B; });
  const S = []; const t0 = performance.now(); let fuori = false, visto = false;
  while (performance.now() - t0 < 150000) { await new Promise(r => requestAnimationFrame(r)); const i = P.pi144; if (i == null || i < 0) continue;
    const men = P.men.map((m, k) => { m.updateMatrixWorld(true); const l = oss[k].ball_l.getWorldPosition(v).clone(), r = oss[k].ball_r.getWorldPosition(v).clone(); return { z: m.position.z, bl: l.y, br: r.y, zl: l.z, zr: r.z }; });
    S.push({ el: P.el, t: P.t144, w: P.w144 || 0, i, men, br: P.braccio(i), mn: P.mani240 ? P.mani240(i) : null }); const z = men[i].z; if (z > 6.5) visto = true; if (visto && z < 6.02 && (P.t144 || 0) > 3) { if (fuori) break; fuori = true; } if ((P.t144 || 0) > 14) break; }
  return S; });
function giudicaSerie(S) { const o = { campioni: S.length }; if (S.length < 40) return { ...o, errore: 'campioni ' + S.length };
  const chi = S[S.length - 1].i, N = S[0].men.length; o.chiamato = chi; o.scena = +((S[S.length - 1].t || 0) - (S[0].t || 0)).toFixed(2);/* tempo di SCENA (t144: somma dei passi del tick, tetto 0,06 s), non orologio di parete: in headless i fotogrammi sono lenti */
  o.piedi = []; for (let k = 0; k < N; k++) { const a = S.map(s => Math.min(s.men[k].bl, s.men[k].br)); o.piedi.push([+Math.min(...a).toFixed(3), +Math.max(...a).toFixed(3)]); }
  let corpo = 0, piede = 0, zmax = 0; for (let k = 1; k < S.length; k++) { const a = S[k - 1].men[chi], c = S[k].men[chi], dz = Math.abs(c.z - a.z); zmax = Math.max(zmax, c.z); if (dz < 1e-4) continue;
    const sin = (a.bl + c.bl) <= (a.br + c.br); corpo += dz; piede += Math.abs(sin ? c.zl - a.zl : c.zr - a.zr); }
  o.percorso = +corpo.toFixed(2); o.slitta = corpo > 0 ? +(piede / corpo).toFixed(3) : null; o.avanti = +(zmax - 6).toFixed(2); o.inFila = +Math.abs(S[S.length - 1].men[chi].z - 6).toFixed(3);
  const B = S.filter(s => s.br), G = 180 / Math.PI, ang = (a, c) => Math.acos(Math.max(-1, Math.min(1, a[0] * c[0] + a[1] * c[1] + a[2] * c[2]))) * G; let vU = 0, vF = 0, sopra = 0;
  /* velocita' angolare su una finestra di almeno FIN s di scena (non fra due fotogrammi: un fotogramma corto gonfia il rapporto — misurato:
     stessa build 560 e 765 gradi/s sull'avambraccio a seconda della corsa) */
  const FIN = 0.10; let j = 0;
  for (let k = 1; k < B.length; k++) { const dt = (B[k].t || 0) - (B[k - 1].t || 0); if (dt > 0 && B[k].br.manoSu >= 0.15) sopra += dt;
    while (j + 1 < k && (B[k].t || 0) - (B[j + 1].t || 0) >= FIN) j++; const dw = (B[k].t || 0) - (B[j].t || 0); if (!(dw >= FIN) || dw > 0.3) continue;
    vU = Math.max(vU, ang(B[k].br.dU, B[j].br.dU) / dw); vF = Math.max(vF, ang(B[k].br.dF, B[j].br.dF) / dw); }
  o.grezzo = B.map(s => [+(s.t || 0).toFixed(3), +s.w.toFixed(2), s.br.dU, s.br.dF]);
  const su = B.filter(s => s.br.manoSu >= 0), sal = B.filter(s => s.w >= 0.5),/* la cerniera si giudica a saluto in corso: a riposo la posa e' quella del giro 192 */ mm = (f, A) => A.length ? [+Math.min(...A.map(f)).toFixed(1), +Math.max(...A.map(f)).toFixed(1)] : null;
  o.braccio = { campioni: B.length, sopra: +sopra.toFixed(2), gomito: mm(s => s.br.gomito, B), elev: mm(s => s.br.elev, B), fuori: mm(s => s.br.fuori == null ? -1 : s.br.fuori, sal), fuoriRiposo: mm(s => s.br.fuori == null ? -1 : s.br.fuori, B.filter(s => s.w < 0.05)), polso: mm(s => s.br.polso, su), lato: mm(s => s.br.manoLato * 100, B), busto: mm(s => s.br.busto * 100, B), velOmero: +vU.toFixed(0), velAvambraccio: +vF.toFixed(0), manoSuMax: +Math.max(...B.map(s => s.br.manoSu)).toFixed(3), fineManoSu: B.length ? B[B.length - 1].br.manoSu : null };
  /* [giro 240 · PO-499] le DUE braccia (misuraSaluto240): distanza fra i palmi, mani e gomiti dal busto e dalla testa, quota delle mani sulle spalle, battiti dell'applauso */
  const M = S.filter(s => s.mn && s.w >= 0.5); if (M.length > 5) { let alte = 0, batt = 0; for (let k = 1; k < M.length; k++) { const dt = (M[k].t || 0) - (M[k - 1].t || 0); if (dt > 0 && dt < 0.3 && M[k].mn.su_l >= 0 && M[k].mn.su_r >= 0) alte += dt; }
    for (let k = 1; k + 1 < M.length; k++) if (M[k].mn.mani <= BATTITO && M[k].mn.mani <= M[k - 1].mn.mani && M[k].mn.mani < M[k + 1].mn.mani) batt++;
    const mn = f => +Math.min(...M.map(f)).toFixed(3); o.due = { campioni: M.length, mani: mn(s => s.mn.mani), busto: mn(s => Math.min(s.mn.busto_l, s.mn.busto_r)), testa: mn(s => Math.min(s.mn.testa_l, s.mn.testa_r)), alte: +alte.toFixed(2), battiti: batt, lato: mn(s => s.br ? s.br.manoLato : 9) }; }
  return o; }
async function braccio(flags, nome, viste) { const R = { nome }; 
  for (const [vista, vp] of [['tel', { width: 375, height: 812 }], ['pc', { width: 1280, height: 720 }]].filter(q => !viste || viste.includes(q[0]))) { const { ctx, p, err } = await apri(flags, vp); const V = R[vista] = {};
    try { await beat(p, 0); await sleep(3500); V.fascia = await fascia(p); if (FOTO) await p.screenshot({ path: `${FOTO}-${nome}-${vista}-b0.png` });
      await beat(p, 1); await sleep(2500); V.tifo = await tifo(p); if (FOTO) await p.screenshot({ path: `${FOTO}-${nome}-${vista}-b1.png` });
      if (vista === 'tel') { V.zone = await zone(p, FOTO ? `${FOTO}-${nome}-spalti.png` : null);
        const nb = await p.evaluate(() => window.__CPM_CAREER.presBeats().length); V.colori = [];
        for (let k = 2; k < nb; k++) { await beat(p, k);
          /* [giro 240] il chiamato GIUSTO: appena cambiato il battito il testimone parla ancora del chiamato precedente (misurato: indice 0 al battito 3, e il guardiano campionava l'uomo sbagliato). I chiamati stanno nei posti k-2, l'eroe nell'ultimo. */
          await p.waitForFunction(([kk, n]) => { const P = window.__CPM_PRES142; if (!P) return false; const att = kk === n - 1 ? P.HERO : kk - 2; if (P.pi144 !== att) { P._su240 = -1; P._z225 = null; return false; } return true; }, [k, nb], { timeout: 30000, polling: 80 }).catch(() => {});
          await p.waitForFunction(() => !!document.querySelector('[data-cpm="pres200-tv"] img'), null, { timeout: 8000 }).catch(() => {}); await p.waitForFunction(() => { const P = window.__CPM_PRES142; const m = P.men[P.pi144]; if (!m) return false; const z = m.position.z, f = P._z225 === z; P._z225 = z; return f && z > 6.5 && (P.t144 || 0) > 1.2; }, null, { timeout: 30000, polling: 250 }).catch(() => {});
          /* [giro 240 · PO-499] con la clip il chiamato applaude con le mani all'altezza del viso: il riquadro del viso finiva sulle mani in movimento (misurato: «colore reso» non letto, guardiano non giudicato). Il colore si campiona a un EVENTO: saluto fatto (peso > 0,9 visto) e braccia di nuovo sotto il viso (peso < 0,5), col chiamato ancora davanti alla camera. Vale uguale per la posa dei bracci rossi. */
          await p.waitForFunction(() => { const P = window.__CPM_PRES142; const m = P.men[P.pi144]; if (!m) return false; const w = P.w144 || 0; if (w > 0.9) P._su240 = P.pi144; return P._su240 === P.pi144 && w < 0.5 && m.position.z > 6.5; }, null, { timeout: 40000, polling: 80 }).catch(() => {});
          V.colori.push(await colori(p));/* a chiamato davanti alla camera, a braccia abbassate */ if (FOTO && (k === 2 || k === nb - 1)) await p.screenshot({ path: `${FOTO}-${nome}-${vista}-b${k}.png` }); }
        await beat(p, 1); await sleep(2600); await beat(p, 3); V.clip = await p.evaluate(() => { const P = window.__CPM_PRES142; return P && P.clip240 ? P.clip240() : null; }).catch(() => null);
        const fotoA = FOTO ? (async () => { const st = () => p.evaluate(() => { const P = window.__CPM_PRES142, m = P.men[P.pi144]; return m ? { z: m.position.z, w: P.w144 || 0, t: P.t144 || 0 } : null; }).catch(() => null); let zmax = 0;
          for (const [q, ok] of [['passo', x => x.z > 6.6 && x.w < 0.05], ['saluto', x => x.w > 0.97 && x.t > 1.8], ['ritorno', x => x.w < 0.02 && x.z < zmax - 0.7]]) { for (let k = 0; k < 400; k++) { const x = await st(); if (x) { zmax = Math.max(zmax, x.z); if (ok(x)) break; } await sleep(60); } await p.screenshot({ path: `${FOTO}-${nome}-${vista}-b3-${q}.png` }).catch(() => {}); } })() : null;
        V.serie = giudicaSerie(await serie(p)); if (fotoA) await fotoA; }
    } catch (e) { V.errore = String(e && e.message || e).slice(0, 200); }
    V.err = err.slice(0, 3); await ctx.close(); }
  return R; }
const g = [], out = {};
/* riferimento: gli spalti della partita di notte (stesso salvataggio, stessa camera) */
let rif = null; if (SOLO.includes('verde')) { try { const { ctx, page } = await apriPartita(b, port, SAVE, { tod: 'night', installCdnRoutes, sleep }); rif = (await misuraZone(page, 'tribuna', FOTO ? `${FOTO}-partita-spalti.png` : null)).zone; await ctx.close(); } catch (e) { g.push('non giudicato: partita di riferimento — ' + String(e && e.message || e).slice(0, 120)); } }
out.partita = rif;
function difetti(R, verde, soloD) { const d = [], T = R.tel || {}, add = x => d.push(x);
  for (const vista of (soloD ? [] : ['tel', 'pc'])) { const V = R[vista] || {}; if (V.errore) add(`${vista}: non giudicato — ${V.errore}`); if ((V.err || []).length) add(`${vista}: errori di pagina ${JSON.stringify(V.err)}`);
    const f = V.fascia; if (!f || !(f.raggiSulPrato >= 150)) add(`${vista} E: non giudicato (raggi sul prato ${f && f.raggiSulPrato})`); else if (f.coperti > 0) add(`${vista} E: ${f.coperti} raggi verso il prato coperti da una struttura ${JSON.stringify(f.chi)}`);
    const t = V.tifo; if (!t) add(`${vista} A: non giudicato`); else if (!(t.sagome >= SAGOME_MIN && t.visibili && t.dens === 'vera')) add(`${vista} A: folla a sagome della partita assente (${JSON.stringify(t)})`); else if (!t.anima) add(`${vista} A: il tifo non si anima (${JSON.stringify(t)})`); }
  if (soloD) { /* braccio rosso del giro 240: si giudica solo il saluto */ } else if (verde && rif && T.zone) { const r = T.zone.spalti.lum / rif.spalti.lum; if (!(Math.abs(r - 1) <= TOL_RESA)) add(`A: resa degli spalti ${T.zone.spalti.lum} contro ${rif.spalti.lum} della partita (x${r.toFixed(2)}, tolleranza ±${TOL_RESA})`); } else if (verde) add('A: non giudicato (resa degli spalti)');
  const C = soloD ? [] : (T.colori || []); if (!soloD && C.length < 3) add('B: non giudicato (chiamati ' + C.length + ')');
  C.forEach(c => { if (!c || c.errore || !c.volto || !c.viso) return add('B: non giudicato — ' + JSON.stringify(c).slice(0, 140)); c.dE = +dE(c.viso, c.pelle3d).toFixed(1); c.dEreso = c.reso ? +dE(c.viso, c.reso).toFixed(1) : null;
    if (VAR[c.capelliFig] !== c.capelli3d) add(`B: ${c.nome.replace(/\s+/g, ' ').trim()} capelli della figurina «${c.capelliFig}» ma testa 3D «${c.capelli3d}»`);
    if (c.dEreso == null) add(`B: non giudicato — colore reso di ${c.nome.replace(/\s+/g, ' ').trim()}`); else if (!(c.dEreso <= DE_PELLE)) add(`B: ${c.nome.replace(/\s+/g, ' ').trim()} viso reso nel 3D ${c.reso} contro viso della figurina ${c.viso}: distanza ${c.dEreso} > ${DE_PELLE}`); });
  const S = T.serie; if (!S || S.errore || !S.braccio) add('C/D: non giudicato — ' + JSON.stringify(S || null).slice(0, 160)); else {
    S.piedi.forEach((q, k) => { if (!(q[0] >= PIEDE_MIN && q[1] <= PIEDE_MAX)) add(`C: corpo #${k} punta piu' bassa fra ${q[0]} e ${q[1]} (limiti ${PIEDE_MIN}…${PIEDE_MAX})`); });
    if (!(S.percorso >= 1.5 && S.avanti >= 0.8)) add(`C: non giudicato (percorso ${S.percorso}, passo avanti ${S.avanti})`); else if (!(S.slitta <= SLITTA_MAX)) add(`C: scivola — piede d'appoggio/corpo ${S.slitta} > ${SLITTA_MAX}`);
    if (!(S.inFila <= 0.05)) add(`C: non torna in fila (${S.inFila})`);
    const B = S.braccio, K = T.clip, Q = S.due;
    /* [giro 240 · PO-499] IL SALUTO E' LA CLIP Rohr (verde). Limiti del braccio invariati (gomito, omero, cerniera, polso, busto, velocita'). Due criteri erano
       della posa a un braccio e non descrivono un applauso: «mano sopra la spalla di 15 cm» e «mano a 5 cm dal piano mediano» (in un applauso le mani si
       incontrano al centro). Per la clip si giudica l'applauso: tutte e due le mani all'altezza delle spalle o sopra per SALUTO_S, almeno BATTITI_MIN battiti,
       e NESSUNA COMPENETRAZIONE: palmi mai piu' vicini di MANI_MIN, mano destra sempre dal suo lato, mani e gomiti fuori dal busto e dalla testa. */
    if (verde) { if (!K || !/^rohr-/.test(K.nome || '') || !(K.ossa >= 30)) add('D: il saluto non e\' la clip Rohr (' + JSON.stringify(K) + ')');
      if (!Q) add('D: non giudicato (misura delle due braccia)'); else { if (!(Q.alte >= SALUTO_S)) add(`D: mani all'altezza delle spalle o sopra per ${Q.alte} s < ${SALUTO_S}`); if (!(Q.battiti >= BATTITI_MIN)) add(`D: battiti dell'applauso ${Q.battiti} < ${BATTITI_MIN}`);
        if (!(Q.mani >= MANI_MIN)) add(`D: le mani si compenetrano (palmi a ${Q.mani} < ${MANI_MIN})`); if (!(Q.lato >= LATO_CLIP)) add(`D: la mano destra passa il piano mediano del corpo (${Q.lato})`);
        if (!(Q.busto >= LIM.bustoMin)) add(`D: braccia dentro il busto (${Q.busto} dall'asse)`); if (!(Q.testa >= TESTA_MIN)) add(`D: mani o gomiti dentro la testa (${Q.testa})`); } }
    else { if (K) add('D: nel rosso la clip e\' ancora attiva (' + JSON.stringify(K) + ')'); if (!(B.sopra >= SALUTO_S)) add(`D: mano sopra la spalla (${SALUTO_MANO}) per ${B.sopra} s < ${SALUTO_S}`); }
    if (!(B.gomito[0] >= LIM.gomitoMin)) add(`D: gomito ${B.gomito[0]} < ${LIM.gomitoMin}`); if (!(B.elev[1] <= LIM.elevMax)) add(`D: omero a ${B.elev[1]} gradi > ${LIM.elevMax}`);
    if (!B.fuori || !(B.fuori[0] >= 0)) add('D: non giudicato (cerniera del gomito)'); else if (!(B.fuori[1] <= LIM.fuoriMax)) add(`D: il gomito ruota fuori dalla cerniera di ${B.fuori[1]} gradi > ${LIM.fuoriMax}`);
    if (!B.polso || !(B.polso[1] <= LIM.polsoMax)) add(`D: polso ${B.polso && B.polso[1]} > ${LIM.polsoMax}`);
    if (!verde && !(B.lato[0] >= LIM.latoMin * 100)) add(`D: la mano passa il piano mediano del corpo (${B.lato[0]} cm)`); if (!(B.busto[0] >= LIM.bustoMin * 100)) add(`D: braccio dentro il busto (${B.busto[0]} cm dall'asse)`);
    if (!(B.velOmero <= LIM.velOmeroMax && B.velAvambraccio <= LIM.velAvambraccioMax)) add(`D: scatto del braccio — omero ${B.velOmero} gradi/s (limite ${LIM.velOmeroMax}), avambraccio ${B.velAvambraccio} gradi/s (limite ${LIM.velAvambraccioMax})`);
    if (!(B.fineManoSu <= -0.25)) add(`D: a fine scena la mano non e' tornata giu' (${B.fineManoSu})`); }
  return d; }
if (SOLO.includes('verde')) { out.verde = await braccio([], 'dopo'); const d = difetti(out.verde, true); out.difettiVerde = d; d.forEach(x => g.push('verde · ' + x)); }
if (SOLO.includes('rosso')) { out.rosso = await braccio(['__CPM_NO_G225'], 'prima'); const d = difetti(out.rosso, false); out.difettiRosso = d;
  for (const [L, nome] of [['A', 'tifo'], ['B', 'pelle e capelli'], ['C', 'cammino'], ['D', 'saluto'], ['E', 'fascia']]) if (!d.some(x => new RegExp('(^|\\s)' + L + '[:/]').test(x) && !/non giudicato/.test(x))) g.push(`rosso · ${L} (${nome}): il difetto non si vede`); }
/* [giro 240] braccio rosso della clip (window.__CPM_NO_G240): torna il saluto a posa del giro 225 — la clip non c'e' e i limiti della posa reggono */
if (SOLO.includes('rosso240')) { out.rosso240 = await braccio(['__CPM_NO_G240'], 'prima240', ['tel']); const d = difetti(out.rosso240, false, true); out.difettiRosso240 = d; const K = (out.rosso240.tel || {}).clip;
  if (K) g.push('rosso240 · la clip e\' ancora attiva con __CPM_NO_G240'); d.filter(x => !/clip e' ancora attiva/.test(x)).forEach(x => g.push('rosso240 · ' + x));
  if (out.verde && !((out.verde.tel || {}).clip)) g.push('rosso240 · non giudicato: nel verde la clip non risulta attiva, i due bracci non si distinguono'); }
if (SOLO.includes('ripiego')) { const { ctx, p } = await apri(['__CPM_G225_NODRAW'], { width: 375, height: 812 }); try { await beat(p, 1); await sleep(3000); const t = await tifo(p); out.ripiego = t;
    const sc = await p.evaluate(() => { const P = window.__CPM_PRES142; let luci = 0; P.scene.traverse(o => { if (o.isLight) luci++; }); return { uomini: P.men.filter(m => { let a = m; while (a.parent) a = a.parent; return a === P.scene; }).length, luci }; }); t.uomini = sc.uomini; t.luci = sc.luci;
    if (!(sc.uomini >= 5 && sc.luci >= 3)) g.push('ripiego · rifacendo lo stadio la scena ha perso corpi o luci: ' + JSON.stringify(sc));
    if (!(t.modo === 'dipinti' && t.provaPx === 0 && t.sagome === 0 && t.dipinti >= 1000)) g.push('ripiego · se lo strato a sagome non si disegna la folla dipinta non subentra: ' + JSON.stringify(t)); if (FOTO) await p.screenshot({ path: `${FOTO}-ripiego-tel-b1.png` }); } catch (e) { g.push('ripiego · non giudicato'); } await ctx.close(); }
await b.close(); srv.close();
fs.writeFileSync('out/g225/presentazione-225.json', JSON.stringify(out, null, 1));
const riga = (n, R) => { if (!R) return; const T = R.tel || {}, S = T.serie || {}; console.log(`${n}: tifo ${JSON.stringify(T.tifo)} · spalti ${T.zone ? T.zone.spalti.lum : '—'} · fascia tel ${T.fascia && T.fascia.coperti}/${T.fascia && T.fascia.raggiSulPrato} pc ${R.pc && R.pc.fascia && R.pc.fascia.coperti}/${R.pc && R.pc.fascia && R.pc.fascia.raggiSulPrato}`);
  (T.colori || []).forEach(c => console.log(`   ${String(c.nome || '').replace(/\s+/g, ' ').trim()} · volto ${c.volto} (${c.classe}, ${c.capelliFig}) viso ${c.viso} · 3D pelle ${c.pelle3d} dE ${c.dE} · capelli ${c.capelli3d} · reso ${c.reso} dE ${c.dEreso}`));
  console.log(`   piedi ${JSON.stringify(S.piedi)} · percorso ${S.percorso} slitta ${S.slitta} avanti ${S.avanti} · braccio ${JSON.stringify(S.braccio)}`); };
console.log('partita di notte, spalti:', JSON.stringify(rif && rif.spalti)); riga('VERDE', out.verde); if (out.verde && out.verde.tel) console.log('   clip ' + JSON.stringify(out.verde.tel.clip) + ' · due braccia ' + JSON.stringify((out.verde.tel.serie || {}).due)); riga('ROSSO', out.rosso); if (out.rosso240) { riga('ROSSO 240', out.rosso240); console.log('   clip ' + JSON.stringify((out.rosso240.tel || {}).clip) + ' · difetti ' + JSON.stringify(out.difettiRosso240)); } if (out.ripiego) console.log('RIPIEGO: ' + JSON.stringify(out.ripiego));
if (out.difettiRosso) console.log('difetti visti nel rosso:\n  - ' + out.difettiRosso.join('\n  - '));
if (g.length) { console.log('❌ presentazione-225'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ presentazione-225 verde (e il rosso si vede)');
