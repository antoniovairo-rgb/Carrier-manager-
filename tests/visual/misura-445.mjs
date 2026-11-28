#!/usr/bin/env node
/* [giro 445] SONDA DELLA RESA di stempiati e lunghi raccolti (non del tipo).
   · RENDER A COLORI DI IDENTITA' (vista di una sola testa, materiali senza luce, nessun'altra maglia): testa del corpo = maschera dei capelli
     dipinti del giro 240 (pelle ROSSA, capelli dipinti NERI), fondo color pelle VERDE dove la sua alfa >= 0,5, capelli nostri BLU dove la loro
     alfa >= 0,5, chignon GIALLO, resto del corpo GRIGIO. Pixel NERI = capelli dipinti che si vedono. Quattro viste attorno alla testa.
   · RENDER VERO (stesse viste e luci della partita): colore dei capelli nostri e della pelle in punti nominati in azimut/elevazione sulla rete
     della testa (la griglia del 432), per il confronto con la figurina e per la sfumatura dell'attaccatura.
   Uso: node misura-445.mjs [nome] · CPM_ROSSO=1 (__CPM_NO_G445) · CPM_ID=dir (salva le immagini d'identita') */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apriEPronti } from './misura-432.mjs';
import fs from 'node:fs';
export const VISTE_ID445 = { davanti: 0, lato: Math.PI / 2, lato2: -Math.PI / 2, trequarti: Math.PI * 0.78, dietro: Math.PI };
/* immagine d'identita' di una testa: conteggi per classe e PNG (opzionale) */
export async function identita445(p, nome, angoli, png) {
  return p.evaluate(([nome, A, png]) => { const T = THREE, D = window.__CPM3D, S = D.scene, Rr = D.renderer; let o = null; S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    S.updateMatrixWorld(true); let hb = null; o.traverse(b => { if (b.isBone && /^head$/i.test(b.name) && !hb) hb = b; }); if (!hb) return null; const head = hb.getWorldPosition(new T.Vector3());
    const mask0 = _MASC240 && _MASC240.u && _MASC240.u.value; if (!mask0) return null;
    /* maschera dei capelli dipinti SOLO nelle isole grandi (>= 2% dei suoi pixel di capelli): i puntini staccati (piega dell'orecchio, misurata)
       non sono capelli della calotta */
    let mask = window.__CPM_MASK445; if (!mask) { const c0 = mask0.image, N = c0.width, M = c0.height, g0 = c0.getContext('2d'), d = g0.getImageData(0, 0, N, M); const lab = new Int32Array(N * M).fill(-1), dim = []; let tot = 0;
      for (let i = 0; i < N * M; i++) { if (d.data[i * 4] >= 128 || lab[i] >= 0) continue; const id = dim.length; let n = 0; const q = [i]; lab[i] = id; while (q.length) { const j = q.pop(); n++; const x = j % N, y = (j / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= M) continue; const jj = yy * N + xx; if (lab[jj] < 0 && d.data[jj * 4] < 128) { lab[jj] = id; q.push(jj); } } } dim.push(n); tot += n; }
      for (let i = 0; i < N * M; i++) if (lab[i] >= 0 && dim[lab[i]] < 0.02 * tot) { d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = 255; }
      const c1 = document.createElement('canvas'); c1.width = N; c1.height = M; c1.getContext('2d').putImageData(d, 0, 0); mask = new T.CanvasTexture(c1); mask.flipY = mask0.flipY; mask.needsUpdate = true; window.__CPM_MASK445 = mask; window.__CPM_MASK445_ISOLE = dim.map(n => +(n / tot).toFixed(3)); }
    /* render VERO con la stessa camera (altri corpi nascosti, come le foto): servono i colori di capelli e pelle */
    const mie0 = new Set(); o.traverse(x => mie0.add(x)); const altri = []; S.traverseVisible(x => { if ((x.isSkinnedMesh || (x.isMesh && x.material && !Array.isArray(x.material) && x.material.depthTest === false)) && !mie0.has(x)) altri.push(x); });
    const camDi = (a) => { const root = o.parent || o, ry = root.rotation.y, gl = Rr.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight; const fw = new T.Vector3(Math.sin(ry + a), 0, Math.cos(ry + a)); const c = new T.PerspectiveCamera(20, W / H, 0.3, 60); const hp = head.clone(); hp.y += 0.07; c.position.copy(hp).addScaledVector(fw, 1.25); c.position.y += 0.1; c.lookAt(hp); c.updateMatrixWorld(true); return c; };
    const vero = {}; altri.forEach(x => x.visible = false); { const gl = Rr.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight; for (const [k, a] of Object.entries(A)) { Rr.render(S, camDi(a)); const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); vero[k] = px; } } altri.forEach(x => x.visible = true);
    const salva = [], L = 7; const bas = (o2) => new T.MeshBasicMaterial(o2);
    const mG = bas({ color: 0x808080, skinning: true }), mGs = bas({ color: 0x808080 }), mY = bas({ color: 0xffff00 });
    o.traverse(m => { if (!m.isMesh) return; salva.push([m, m.material, m.layers.mask, m.visible]); m.layers.enable(L); const n = m.name || '', mt = Array.isArray(m.material) ? m.material[0] : m.material;
      if (/^Chignon4/.test(n)) m.material = mY;
      else if (/^Fondo432_/.test(n)) m.material = m.isSkinnedMesh ? bas({ color: 0x00ff00, skinning: true, vertexColors: !!m.geometry.attributes.color, alphaTest: 0.5 }) : bas({ color: 0x00ff00 });
      else if (/^Calotta432_/.test(n)) m.material = bas({ color: 0x0000ff, map: mt.map, alphaTest: 0.5, skinning: !!m.isSkinnedMesh, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 });
      else if (/^Barba432_/.test(n)) m.visible = false;
      else if (m.isSkinnedMesh && /^(Material\.002|KorwardNativeHair_)/.test((mt && mt.name) || '')) m.material = bas({ color: 0xff0000, map: mask, skinning: true });
      else m.material = m.isSkinnedMesh ? mG : mGs; });
    const bg = S.background; S.background = null; const cc = Rr.getClearColor(new T.Color()), ca = Rr.getClearAlpha(); Rr.setClearColor(0x333333, 1);
    const root = o.parent || o, ry = root.rotation.y, gl = Rr.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight; const out = {};
    for (const [k, a] of Object.entries(A)) { const fw = new T.Vector3(Math.sin(ry + a), 0, Math.cos(ry + a)); const c = new T.PerspectiveCamera(20, W / H, 0.3, 60); const hp = head.clone(); hp.y += 0.07; c.position.copy(hp).addScaledVector(fw, 1.25); c.position.y += 0.1; c.lookAt(hp); c.layers.set(L); c.updateMatrixWorld(true);
      Rr.render(S, c); const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); const n = { nero: 0, pelle: 0, fondo: 0, capelli: 0, chignon: 0, corpo: 0, testa: 0 };
      for (let i = 0; i < W * H; i++) { const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]; const mx = Math.max(r, g, b); if (mx < 30) n.nero++; else if (mx < 60) continue; else if (r > 2 * g && r > 2 * b) n.pelle++; else if (g > 2 * r && g > 2 * b) n.fondo++; else if (b > 2 * r && b > 2 * g) n.capelli++; else if (r > 2 * b && g > 2 * b) n.chignon++; else if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15) n.corpo++; /* per canale dominante: le tinte d'identita' passano dalla codifica d'uscita e dalla trama dei capelli */ }
      n.testa = n.nero + n.pelle + n.fondo + n.capelli + n.chignon;
      { const V = vero[k], cap = [[], [], []], pel = [[], [], []]; for (let i = 0; i < W * H; i++) { const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2], mx = Math.max(r, g, b); if (mx < 60) continue; const dst = (b > 2 * r && b > 2 * g) ? cap : (r > 2 * g && r > 2 * b) ? pel : null; if (dst) for (let c = 0; c < 3; c++) dst[c].push(V[i * 4 + c]); }
        const med = L2 => L2[0].length ? L2.map(x => { x.sort((p, q) => p - q); return x[x.length >> 1]; }) : null; n.rgbCapelli = med(cap); n.rgbPelle = med(pel);
        /* fondo e la pelle della testa nei 30 pixel sotto il suo bordo, colonna per colonna (per la taratura della tinta del fondo) */
        const fon = [[], [], []], sot = [[], [], []]; for (let x = 0; x < W; x++) { let yb = -1; for (let y = 0; y < H; y++) { const i = y * W + x, r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]; if (Math.max(r, g, b) >= 60 && g > 2 * r && g > 2 * b) { yb = y; break; } } if (yb < 0) continue;
          for (let y = yb; y < Math.min(H, yb + 30); y++) { const i = y * W + x, r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]; if (g > 2 * r && g > 2 * b && Math.max(r, g, b) >= 60) for (let c = 0; c < 3; c++) fon[c].push(V[i * 4 + c]); }
          for (let y = Math.max(0, yb - 30); y < yb; y++) { const i = y * W + x, r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]; if (r > 2 * g && r > 2 * b && Math.max(r, g, b) >= 60) for (let c = 0; c < 3; c++) sot[c].push(V[i * 4 + c]); } }
        n.rgbFondo = med(fon); n.rgbSotto = med(sot); } if (png) n.png = Rr.domElement.toDataURL('image/png'); out[k] = n; }
    salva.forEach(([m, mt, lm, v]) => { m.material = mt; m.layers.mask = lm; m.visible = v; }); S.background = bg; Rr.setClearColor(cc, ca);
    return out; }, [nome, angoli, !!png]);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const nomi = process.argv.slice(2).length ? process.argv.slice(2) : ['Keith Carr', 'Declan Russell'];
  const { ctx, p, ok } = await apriEPronti(b, port, process.env.CPM_ROSSO ? ['__CPM_NO_G445'] : [], process.env.CPM_TOD || 'night', null, { 'Declan Russell': 'lunghi raccolti', 'Aaron Lane': 'lunghi raccolti', 'Rupert Hammond': 'stempiati e corti' });
  const dir = process.env.CPM_ID; if (dir) fs.mkdirSync(dir, { recursive: true });
  for (const n of nomi) { const r = await identita445(p, n, VISTE_ID445, dir); if (!r) { console.log(n, 'non giudicato'); continue; }
    for (const [k, v] of Object.entries(r)) { if (v.png) { fs.writeFileSync(`${dir}/${n.replace(/\W+/g, '_')}-${k}.png`, Buffer.from(v.png.split(',')[1], 'base64')); delete v.png; } console.log(n, k, JSON.stringify(v)); } }
  await ctx.close(); await b.close(); srv.close();
}
/* sRGB → L*a*b* (D65) */
export function lab445(c) { if (!c) return null; const f0 = v => { v /= 255; return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92; }; const [r, g, b] = c.map(f0);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, Y = r * 0.2126 + g * 0.7152 + b * 0.0722, Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883, f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; }
export const hex445 = h => h ? [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) : null;
/* figurina di un corpo (anche forzata dal banco): taglio, capelli hc e pelle p */
export async function figurina445(p, nome) {
  return p.evaluate(n => { let o = null; window.__CPM3D.scene.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === n) o = x; }); const g = o && o.userData.g432; let fg = null; try { fg = aspettoFigurina225(n); } catch (e) {}
    let hc = fg && fg.hc, p0 = fg && fg.p; const fz = window.__CPM_FIG445 && window.__CPM_FIG445[n]; if (fz && VOLTI23.idx) { const r = VOLTI23.idx.g.find(x => x.n === fz); if (r) hc = r.hc; }
    return { cal: g && g.calotta, strati: g && g.strati, v445: g && g.v445, hc, p: p0, fig: fz || (fg && fg.n) }; }, nome);
}
/* STEMPIATURA e SFUMATURA lette sulla trama dei capelli nostri (alfa del canvas, 0,5 gradi di passo), rispetto all'attaccatura dei
   capelli DIPINTI della testa (prima cella di capelli salendo dalla fronte, colonna per colonna) */
export async function attaccatura445(p, nome) {
  return p.evaluate(n => { let o = null; window.__CPM3D.scene.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === n) o = x; }); if (!o) return null;
    let mesh = null, mc = null; o.traverse(m => { if (!mesh && m.isSkinnedMesh && /^(Material\.002|KorwardNativeHair_)/.test((Array.isArray(m.material) ? m.material[0] : m.material).name || '')) mesh = m; if (!mc && /^Calotta432_/.test(m.name || '')) mc = m; }); if (!mesh || !mc) return { senza: true };
    const R = _rete432(mesh), im = mc.material.map && mc.material.map.image; if (!R || !im || !im.getContext) return { senza: true }; const W = im.width, H = im.height, d = im.getContext('2d').getImageData(0, 0, W, H).data;
    const al = (az, el) => { const x = Math.min(W - 1, Math.max(0, Math.round((az / 360 + 0.5) * W - 0.5))), y = Math.min(H - 1, Math.max(0, Math.round((0.5 - el / 180) * H - 0.5))); return d[(y * W + x) * 4 + 3] / 255; };
    const NA = NA432, NE = NE432; const att = az => { const a = Math.min(NA - 1, Math.max(0, Math.floor((az / 360 + 0.5) * NA))); for (let e = Math.floor(NE * 0.45); e < NE; e++) { const k = e * NA + a; if (R.r[k] > 0 && R.cap[k]) return ((e + 0.5) / NE - 0.5) * 180; } return null; };
    let tP = 0, tN = 0, cP = 0, cN = 0; const larg = [];
    for (let az = -46; az <= 46; az += 1) { const h = att(az); if (h == null) continue; const aa = Math.abs(az);
      if (aa >= 28 && aa <= 46) for (let el = h + 2; el <= h + 8; el += 1) { tN++; if (al(az, el) < 0.3) tP++; }
      if (aa <= 8) for (let el = h + 3; el <= h + 10; el += 1) { cN++; if (al(az, el) > 0.5) cP++; }
      if (aa <= 40) { /* larghezza PERPENDICOLARE al bordo: dove l'alfa passa 0,5 salendo, 0,8 / |gradiente| (gradi; azimut scalato col coseno dell'elevazione) — lungo la sola elevazione un bordo obliquo (la M delle tempie) sembra largo per geometria */
        let pv = al(az, h - 12); for (let el = h - 11.5; el <= h + 40; el += 0.5) { const v = al(az, el); if (pv < 0.5 && v >= 0.5) { const e0 = el - 0.25, ce = Math.cos(e0 * Math.PI / 180), dA = 1.5; const sm = (a2, e2) => { let t = 0; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) t += al(a2 + i * 0.5, e2 + j * 0.5); return t / 9; };
          const ge = (sm(az, e0 + dA) - sm(az, e0 - dA)) / (2 * dA), ga = (sm(az + dA / ce, e0) - sm(az - dA / ce, e0)) / (2 * dA), gm = Math.hypot(ge, ga); if (gm > 1e-3) larg.push(Math.min(60, 0.8 / gm)); break; } pv = v; } } }
    larg.sort((a, b) => a - b);
    return { tempie: tN ? +(tP / tN).toFixed(2) : null, centro: cN ? +(cP / cN).toFixed(2) : null, sfum: larg.length ? larg[larg.length >> 1] : null, colonne: larg.length }; }, nome);
}
/* COMPENETRAZIONE del guscio con scheletro in posa: vertici della testa fuori dal guscio (nel riferimento dell'osso head, raggio dal centro della
   rete, tolleranza 0,5 mm) e vertici del corpo (peso head <= 0,5) dentro i pezzi dello chignon (sfera d'ingombro) */
export async function penetra445(p, sforzo) {
  return p.evaluate((sf) => { const T = THREE, S = window.__CPM3D.scene; const rip = []; if (sf) S.traverseVisible(o => { if (!(o.userData && o.userData.chi240 && o.userData.chi240.nome)) return; const vis = new Set(); o.traverse(m => { if (m.isSkinnedMesh) m.skeleton.bones.forEach(b => { if (/^head$/i.test(b.name) && !vis.has(b)) { vis.add(b); rip.push([b, b.quaternion.clone()]); b.quaternion.multiply(new T.Quaternion().setFromEuler(new T.Euler(sf[0], sf[1], 0))); } }); }); });
    S.updateMatrixWorld(true); const NA = NA432, NE = NE432, v = new T.Vector3(), Mb = new T.Matrix4(), Mi = new T.Matrix4(); const out = { corpi: 0, vert: 0, buchi: 0, mmMax: 0, chig: 0, dentro: 0, vistiCorpo: 0, chi: {} };
    S.traverseVisible(o => { const c = o.userData && o.userData.chi240; if (!c || !c.nome) return; let mesh = null; const gus = [], chg = []; o.traverse(m => { if (!mesh && m.isSkinnedMesh && /^(Material\.002|KorwardNativeHair_)/.test((Array.isArray(m.material) ? m.material[0] : m.material).name || '')) mesh = m; if (m.isSkinnedMesh && m.geometry.userData.g445 && m.geometry.userData.g445.idx) gus.push(m); if (/^Chignon44[05]/.test(m.name || '') && m.visible) chg.push(m); });
      if (!mesh) return; const hb = mesh.skeleton.bones.findIndex(b => /^head$/i.test(b.name)); const bone = mesh.skeleton.bones[hb]; Mb.copy(bone.matrixWorld).invert(); Mi.multiplyMatrices(mesh.skeleton.boneInverses[hb], mesh.bindMatrix).invert();
      const loc = (m, i) => { m.boneTransform(i, v); return v.applyMatrix4(m.matrixWorld).applyMatrix4(Mb).applyMatrix4(Mi); };
      const P = mesh.geometry.attributes.position, SI = mesh.geometry.attributes.skinIndex, SW = mesh.geometry.attributes.skinWeight;
      if (gus.length) { out.corpi++; for (const g of gus) { const G = g.geometry.userData.g445, C = G.C, NA1 = G.NA1, rp = new Float32Array(NA * NE);
          for (let e = 0; e < NE; e++) for (let a = 0; a < NA; a++) { const i = G.idx[e * NA1 + a]; if (i < 0) continue; const q = loc(g, i); rp[e * NA + a] = Math.hypot(q.x - C[0], q.y - C[1], q.z - C[2]); }
          for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(mesh.bindMatrix); { const bx = v.x - C[0], by = v.y - C[1], bz = v.z - C[2], br = Math.hypot(bx, by, bz); const ba = Math.min(NA - 1, Math.max(0, Math.floor((Math.atan2(bx, bz) / (2 * Math.PI) + 0.5) * NA))), be = Math.min(NE - 1, Math.max(0, Math.floor((Math.asin(Math.max(-1, Math.min(1, by / br))) / Math.PI + 0.5) * NE))), bk = be * NA + ba; if (!(G.cov[bk] > 0.5) || !(G.rk[bk] > 0) || Math.abs(br - G.rk[bk]) > 0.03) continue; }
            const q = loc(mesh, i), x = q.x - C[0], y = q.y - C[1], z = q.z - C[2], r = Math.hypot(x, y, z); const a = Math.min(NA - 1, Math.max(0, Math.floor((Math.atan2(x, z) / (2 * Math.PI) + 0.5) * NA))), e = Math.min(NE - 1, Math.max(0, Math.floor((Math.asin(Math.max(-1, Math.min(1, y / r))) / Math.PI + 0.5) * NE))), k = e * NA + a;
            if (!(G.cov[k] > 0.5) || !(rp[k] > 0)) continue; out.vert++; const f = r - rp[k]; if (f > 0.0005) { out.buchi++; out.mmMax = Math.max(out.mmMax, +(f * 1000).toFixed(1)); out.chi[c.nome + '/' + g.name] = (out.chi[c.nome + '/' + g.name] | 0) + 1; if (!out.dove) out.dove = {}; const az = +(((a + 0.5) / NA - 0.5) * 360).toFixed(1), el = +(((e + 0.5) / NE - 0.5) * 180).toFixed(1); out.dove[az + '/' + el] = (out.dove[az + '/' + el] | 0) + 1; } } } }
      if (chg.length) { out.chig++; const sf = chg.map(m => { m.geometry.computeBoundingSphere(); const bs = m.geometry.boundingSphere, sc = new T.Vector3().setFromMatrixScale(m.matrixWorld); return [bs.center.clone().applyMatrix4(m.matrixWorld), bs.radius * Math.max(sc.x, sc.y, sc.z)]; });
        o.traverse(m => { if (!m.isSkinnedMesh || m.geometry.userData.g445) return; const P2 = m.geometry.attributes.position, S2 = m.geometry.attributes.skinIndex, W2 = m.geometry.attributes.skinWeight; const h2 = m.skeleton.bones.findIndex(b => /^head$/i.test(b.name)); if (!P2 || !S2) return;
          for (let i = 0; i < P2.count; i++) { let wh = 0; for (let j = 0; j < 4; j++) if (S2.array[i * 4 + j] === h2) wh += W2.array[i * 4 + j]; if (wh > 0.5) continue; m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); out.vistiCorpo++; if (sf.some(([cc, rr]) => v.distanceTo(cc) < rr)) out.dentro++; } }); } });
    rip.forEach(([b, q]) => b.quaternion.copy(q)); S.updateMatrixWorld(true);
    return out; }, sforzo || null);
}
