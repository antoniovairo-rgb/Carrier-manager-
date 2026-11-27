#!/usr/bin/env node
/* [giro 432 · PO-686] SONDA: CORRISPONDENZA FIGURINA ↔ 3D di TAGLIO, BARBA e COLORE, piu' attaccatura e compenetrazione degli strati.
   Ingresso in campo (GLB acceso, ora congelata, salvataggio fixtures/save-190-s12-ovr93.json, come misura-412/414). Per ogni corpo con nome
   tre primi piani (fronte, tre quarti destra/sinistra) col METODO DELLE ETICHETTE del giro 414, esteso agli strati del giro 432:
     ROSSO = capelli dipinti della testa · VERDE = pelle · GIALLO = calotta 432 (e il suo fondo) · MAGENTA = barba 432 · BLU = fondo.
   Gli strati si etichettano con la loro alfa (alphaTest 0,25): si conta solo cio' che si vede davvero.
   Per corpo (scatto di fronte):
     · TAGLIO 3D = la calotta del testimone userData.g432 se le sue etichette sono >= 60% dei pixel di capelli (gialli / (gialli+rossi)),
       altrimenti «corto» (la testa del corpo, una sola forma);
     · BARBA 3D = il tipo del testimone se i pixel magenta sono >= 0,1% dei pixel del viso (verdi+magenta), altrimenti nessuna;
     · COLORE (non per «rasato»: la stoppia e' pelle + capelli, non un colore di capelli) = L*a*b* medio degli strati nel fotogramma vero contro quello dei capelli dipinti dello STESSO corpo nel braccio rosso (gia'
       della classe della figurina dal giro 240): differenza CIE76;
     · ATTACCATURA (regola del giro 414): pelle entro R px da capelli∪calotta∪barba, quota di pixel chiari (L* > mediana pelle interna + 15)
       meno la stessa quota all'interno = eccesso, in punti.
   COMPENETRAZIONE (strati rigidi sull'osso head): ogni vertice della testa, deformato dallo scheletro nel fotogramma, riportato nello spazio
   della rete radiale; «buca» se sta sotto uno strato coperto (alfa > 0,5) a una distanza dal centro maggiore di quella dello strato.
   Uso: node misura-432.mjs [--rosso] · CPM_TOD=night|day · CPM_JSON=file · CPM_FOTO=dir */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriIngresso } from './misura-412.mjs';
import { preparaEtichette } from './misura-414.mjs';
import fs from 'node:fs';
import path from 'node:path';

export async function scatta432(p, nome, ang) {
  return p.evaluate(([nome, ang]) => {
    const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; let o = null;
    S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    S.updateMatrixWorld(true);
    let head = null; o.traverse(b => { if (b.isBone && /^head$/i.test(b.name) && !head) head = b.getWorldPosition(new T.Vector3()); }); if (!head) return null;
    const root = o.parent || o, ry = root.rotation.y + ang, fw = new T.Vector3(Math.sin(ry), 0, Math.cos(ry));
    const hp = head.clone(); hp.y += 0.07;
    const gl = R.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
    const cam = new T.PerspectiveCamera(16, W / H, 0.8, 60); cam.position.copy(hp).addScaledVector(fw, 1.0); cam.position.y += 0.05; cam.lookAt(hp); cam.updateMatrixWorld(true);
    const mie = new Set(); o.traverse(x => mie.add(x));
    const nascosti = []; S.traverseVisible(x => { if (x.isSkinnedMesh && !mie.has(x)) nascosti.push(x); });
    const rc = new T.Raycaster(); const cand = []; S.traverseVisible(x => { if (x.isMesh && !x.isSkinnedMesh && !mie.has(x)) cand.push(x); }); const dir = hp.clone().sub(cam.position); const dist = dir.length(); dir.normalize();
    for (let k = 0; k < 6; k++) { rc.set(cam.position, dir); rc.far = dist - 0.15; let hits = []; for (const c of cand) { if (!c.visible) continue; try { hits.push(...rc.intersectObject(c, false)); } catch (e) {} } hits.sort((a, b) => a.distance - b.distance); const hit = hits.find(h => h.object.visible && !mie.has(h.object)); if (!hit) break; nascosti.push(hit.object); hit.object.visible = false; }
    S.traverseVisible(x => { if (x.isMesh && !mie.has(x) && x.material && !Array.isArray(x.material) && x.material.depthTest === false) nascosti.push(x); });
    nascosti.forEach(x => x.visible = false);
    const leggi = () => { R.render(S, cam); const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
    const viso = leggi(); const png = R.domElement.toDataURL('image/png');
    const bg = S.background, fog = S.fog; S.background = new T.Color(0, 0, 1); S.fog = null; const scambi = [];
    const altriVis = []; S.traverseVisible(x => { if ((x.isMesh || x.isSprite || x.isPoints || x.isLine) && !mie.has(x)) altriVis.push(x); }); altriVis.forEach(x => x.visible = false);
    o.traverse(m => { if (!m.isMesh || !m.material) return; const L = Array.isArray(m.material) ? m.material : [m.material];
      const nx = L.map(mt => { const n = (mt && mt.name) || ''; const testa = /^(Material\.002|KorwardNativeHair_)/.test(n), strato = !!(m.userData && m.userData.g432), barba = /^Barba432/.test(m.name || '');
        const b = new T.MeshBasicMaterial({ color: strato ? (barba ? 0xff00ff : 0xffff00) : (testa ? 0xffffff : 0x000000), map: testa ? window.__G414LAB : (strato && mt.map ? mt.map : null), fog: false, toneMapped: false });
        if (strato && mt.map) { b.alphaTest = 0.25; b.color.setRGB(barba ? 1 : 1, barba ? 0 : 1, barba ? 1 : 0); b.map = mt.map; b.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb=diffuse;'); }; }
        b.skinning = !!m.isSkinnedMesh; b.side = mt ? mt.side : T.FrontSide; return b; });
      scambi.push([m, m.material]); m.material = Array.isArray(m.material) ? nx : nx[0]; });
    const enc = R.outputEncoding, tm = R.toneMapping; R.outputEncoding = T.LinearEncoding; R.toneMapping = T.NoToneMapping;
    const lab = leggi();
    R.outputEncoding = enc; R.toneMapping = tm; scambi.forEach(([m, mt]) => { const L = Array.isArray(m.material) ? m.material : [m.material]; L.forEach(x => x.dispose()); m.material = mt; });
    altriVis.forEach(x => x.visible = true); S.background = bg; S.fog = fog; nascosti.forEach(x => x.visible = true);
    const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); };
    return { W, H, viso: b64(viso), lab: b64(lab), png };
  }, [nome, ang]);
}

const srgb2lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
function Lab(r, g, b) { const R = srgb2lin(r), G = srgb2lin(g), B = srgb2lin(b); const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; const fx = f(X), fy = f(Y), fz = f(Z); return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]; }
/* classi: 0 fondo/corpo · 1 capelli dipinti · 2 pelle · 3 calotta · 4 barba */
export function analizza432(s, DL = 15) {
  const { W, H } = s; const V = Buffer.from(s.viso, 'base64'), Lb = Buffer.from(s.lab, 'base64'); const n = W * H; const cls = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const r = Lb[i * 4], g = Lb[i * 4 + 1], b = Lb[i * 4 + 2];
    if (r > 160 && g > 160 && b < 90) cls[i] = 3; else if (r > 160 && b > 160 && g < 90) cls[i] = 4; else if (r > 160 && g < 90 && b < 90) cls[i] = 1; else if (g > 160 && r < 90 && b < 90) cls[i] = 2; }
  const cnt = [0, 0, 0, 0, 0], sum = [null, [0, 0, 0], null, [0, 0, 0], [0, 0, 0]];
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let i = 0; i < n; i++) { const c = cls[i]; cnt[c]++; if (c) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (c === 1 || c === 3 || c === 4) { const L = Lab(V[i * 4], V[i * 4 + 1], V[i * 4 + 2]); sum[c][0] += L[0]; sum[c][1] += L[1]; sum[c][2] += L[2]; } }
  const media = c => cnt[c] > 30 ? sum[c].map(v => +(v / cnt[c]).toFixed(1)) : null;
  /* attaccatura: «capelli» = dipinti ∪ calotta ∪ barba */
  const lato = Math.max(1, Math.min(x1 - x0, y1 - y0)); const R = Math.max(2, Math.round(lato * 0.03));
  const INF = 1e9, d = new Float32Array(n).fill(INF); for (let i = 0; i < n; i++) if (cls[i] === 1 || cls[i] === 3 || cls[i] === 4) d[i] = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; let v = d[i]; if (x > 0) v = Math.min(v, d[i - 1] + 1); if (y > 0) { v = Math.min(v, d[i - W] + 1); if (x > 0) v = Math.min(v, d[i - W - 1] + 1); if (x < W - 1) v = Math.min(v, d[i - W + 1] + 1); } d[i] = v; }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; let v = d[i]; if (x < W - 1) v = Math.min(v, d[i + 1] + 1); if (y < H - 1) { v = Math.min(v, d[i + W] + 1); if (x < W - 1) v = Math.min(v, d[i + W + 1] + 1); if (x > 0) v = Math.min(v, d[i + W - 1] + 1); } d[i] = v; }
  const Lint = [], conf = [];
  for (let i = 0; i < n; i++) { if (cls[i] !== 2) continue; const L = Lab(V[i * 4], V[i * 4 + 1], V[i * 4 + 2])[0]; if (d[i] > 0 && d[i] <= R) conf.push(L); else if (d[i] > 2 * R) Lint.push(L); }
  const out = { cnt, labNat: media(1), labCal: media(3), labBar: media(4) };
  if (Lint.length < 200 || conf.length < 50) return { ...out, giudicato: false };
  Lint.sort((a, b) => a - b); const med = Lint[Lint.length >> 1];
  const q = conf.filter(L => L > med + DL).length / conf.length, qi = Lint.filter(L => L > med + DL).length / Lint.length;
  return { ...out, giudicato: true, Lpelle: +med.toFixed(1), quota: +q.toFixed(4), quotaInt: +qi.toFixed(4), eccesso: +((q - qi) * 100).toFixed(2) };
}
export const dE = (a, b) => (a && b) ? +Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]).toFixed(1) : null;

/* in pagina: compenetrazione degli strati coi vertici della testa deformati nel fotogramma */
export async function penetra432(p) {
  return p.evaluate(() => { const T = THREE, S = window.__CPM3D.scene; S.updateMatrixWorld(true); const v = new T.Vector3(), Mi = new T.Matrix4(), Mb = new T.Matrix4(); let corpi = 0, vert = 0, buchi = 0, mx = 0; const chi = {};
    const NA = NA432, NE = NE432;
    S.traverseVisible(o => { const c = o.userData && o.userData.chi240; if (!c || !c.nome) return; let mesh = null; o.traverse(m => { if (!mesh && m.isSkinnedMesh && m.material && /^(Material\.002|KorwardNativeHair_)/.test((Array.isArray(m.material) ? m.material[0] : m.material).name || '')) mesh = m; }); if (!mesh) return;
      const bone = mesh.skeleton.bones.find(b => /^head$/i.test(b.name)); if (!bone) return; const strati = bone.children.filter(x => x.userData && x.userData.g432 && x.geometry && x.geometry.userData.g432 && x.geometry.userData.g432.rk && !/^Fondo/.test(x.name)); if (!strati.length) return; corpi++;
      Mb.copy(bone.matrixWorld).invert(); const P = mesh.geometry.attributes.position;
      for (const st of strati) { const G = st.geometry.userData.g432; Mi.fromArray(G.Minv); const C = G.C;
        for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); { const q = v.clone().applyMatrix4(mesh.bindMatrix); const bx = q.x - C[0], by = q.y - C[1], bz = q.z - C[2], br = Math.hypot(bx, by, bz); const ba = Math.min(NA - 1, Math.max(0, Math.floor((Math.atan2(bx, bz) / (2 * Math.PI) + 0.5) * NA))), be = Math.min(NE - 1, Math.max(0, Math.floor((Math.asin(Math.max(-1, Math.min(1, by / br))) / Math.PI + 0.5) * NE))), bk = be * NA + ba; if (!(G.rk[bk] > 0) || Math.abs(br - G.rk[bk]) > 0.03) continue; } /* solo i vertici che a riposo stanno entro 3 cm dallo strato: il busto, piu' lontano lungo lo stesso raggio, non e' «sotto» la barba */ mesh.boneTransform(i, v); v.applyMatrix4(mesh.matrixWorld).applyMatrix4(Mb).applyMatrix4(Mi); const x = v.x - C[0], y = v.y - C[1], z = v.z - C[2], r = Math.hypot(x, y, z);
          const a = Math.min(NA - 1, Math.max(0, Math.floor((Math.atan2(x, z) / (2 * Math.PI) + 0.5) * NA))), e = Math.min(NE - 1, Math.max(0, Math.floor((Math.asin(Math.max(-1, Math.min(1, y / r))) / Math.PI + 0.5) * NE))), k = e * NA + a;
          if (!(G.cov[k] > 0.5) || !(G.rk[k] > 0)) continue; vert++; const fuori = r - G.rk[k]; if (fuori > 0.0005) { buchi++; if (fuori > mx) mx = fuori; chi[c.nome + '/' + st.name] = (chi[c.nome + '/' + st.name] | 0) + 1; } } } });
    return { corpi, vert, buchi, mmMax: +(mx * 1000).toFixed(1), chi }; });
}

export async function apriEPronti(b, port, flags, tod, vp, forza) {
  /* [giro 440] forza = { nome: taglio }: taglio dato a un nome dal banco (window.__CPM_TAGLIO440, solo ?cpmtest=1) */
  const bb = forza ? { newContext: async o => { const c = await b.newContext(o); await c.addInitScript(m => { window.__CPM_TAGLIO440 = m; }, forza); return c; } } : b;
  process.env.CPM_TOD = tod; const r = await apriIngresso(bb, port, flags, vp);
  if (r.ok && !flags.includes('__CPM_NO_G432')) await r.p.waitForFunction(() => { const S = window.__CPM3D.scene; let n = 0, f = 0; S.traverseVisible(o => { const c = o.userData && o.userData.chi240; if (c && c.nome) { n++; const g = o.userData.g432; if (g && g.pronto) f++; } }); return n >= 22 && f === n; }, null, { timeout: 30000 }).catch(() => {});
  await sleep(600);
  return r;
}
export async function corpi432(p) {
  return p.evaluate(() => { const S = window.__CPM3D.scene, o = []; S.traverseVisible(x => { const c = x.userData && x.userData.chi240; if (!c || !c.nome) return; let fg = null, A = null; try { fg = aspettoFigurina225(c.nome); A = aspetto432(fg); } catch (e) {} const g = x.userData.g432;
    o.push({ nome: c.nome, ruolo: c.ruolo, t: fg && fg.t, b: fg && fg.b, h: fg && fg.h, attesoCal: A ? A.calotta : null, attesoBar: A ? A.barba : null, cal: g && g.fatto ? g.calotta : null, bar: g && g.fatto ? g.barba : null, strati: g && g.strati ? g.strati.slice() : [] }); }); return o; });
}
const TAB432 = JSON.parse(fs.readFileSync(new URL('../../assets/aspetto/aspetto-432.json', import.meta.url), 'utf8'));
export const atteso432 = (t, b) => ({ cal: t != null && t in TAB432.tagli ? ((TAB432.calotte[TAB432.tagli[t]] || {}).nativa ? 'corto' : TAB432.tagli[t]) : null, /* [giro 440] un taglio «nativo» (stempiato) e' la testa del corpo: si giudica come «corto» */ bar: b != null && b in TAB432.barbe ? TAB432.barbe[b] : null });
export const ANG432 = [0, 0.6, -0.6];
export async function misuraTutti(b, port, flags, tod, fotoDir) {
  const { ctx, p, err, ok } = await apriEPronti(b, port, flags, tod);
  if (!ok) { await ctx.close(); return { giudicato: false, motivo: 'ingresso non raggiunto', err }; }
  if (!await preparaEtichette(p)) { await ctx.close(); return { giudicato: false, motivo: 'texture della testa non caricate' }; }
  const corpi = (await corpi432(p)).map(c => { const A = atteso432(c.t, c.b); return { ...c, attesoCal: A.cal, attesoBar: A.bar }; }); const righe = [];
  const pen = await penetra432(p);
  const tempi = await p.evaluate(() => { const A = window.__CPM_ASP432; return A ? { rete: +A.ms.toFixed(1), tex: +(A.msTex || 0).toFixed(1), tab: A.msTab, geo: A.geo.size, tex_n: A.tex.size, mat: A.mat.size, tri: [...A.geo.values()].reduce((s, g) => s + ((g.userData.g432 || {}).tri | 0), 0) } : null; });
  for (const c of corpi) for (const a of ANG432) {
    const s = await scatta432(p, c.nome, a); if (!s) { righe.push({ ...c, ang: a, giudicato: false }); continue; }
    righe.push({ ...c, ang: a, ...analizza432(s) });
    if (fotoDir) fs.writeFileSync(path.join(fotoDir, `${tod}-${c.nome.replace(/\W+/g, '_')}${a ? (a > 0 ? '-dx' : '-sx') : ''}.png`), Buffer.from(s.png.split(',')[1], 'base64'));
  }
  await ctx.close();
  return { giudicato: true, corpi, righe, pen, tempi, err };
}
/* giudizio di corrispondenza di un corpo dallo scatto di fronte (vedi testa) */
export function corrispondenza(rv, rr) {
  const f = rv.righe.filter(x => x.ang === 0 && x.cnt); const out = [];
  for (const x of f) {
    const [, nat, pel, cal, bar] = x.cnt; const qcal = cal / Math.max(1, cal + nat), qbar = bar / Math.max(1, pel + bar);
    const t3d = (x.cal && x.cal !== 'corto' && qcal >= 0.6) ? x.cal : 'corto', b3d = (x.bar && qbar >= 0.001) ? x.bar : null;
    const r0 = rr ? rr.righe.find(y => y.nome === x.nome && y.ang === 0) : null; const ref = r0 && r0.labNat;
    out.push({ nome: x.nome, ruolo: x.ruolo, colore: x.h, taglio: x.t, attesoCal: x.attesoCal, t3d, okT: x.attesoCal == null ? null : (x.attesoCal === t3d), barba: x.b, attesoBar: x.attesoBar, b3d, okB: x.attesoBar === b3d,
      qcal: +qcal.toFixed(2), qbar: +(qbar * 100).toFixed(2), dEcal: (t3d !== 'corto' && t3d !== 'rasato') ? dE(x.labCal, ref) : null, dEbar: b3d ? dE(x.labBar, ref) : null, eccesso: x.eccesso });
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const TOD = process.env.CPM_TOD || 'night'; fs.mkdirSync('out/g432', { recursive: true }); const fd = process.env.CPM_FOTO || null; if (fd) fs.mkdirSync(fd, { recursive: true });
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const [rv, rr] = await Promise.all([misuraTutti(b, port, [], TOD, fd), misuraTutti(b, port, ['__CPM_NO_G432'], TOD, null)]);
  await b.close(); srv.close();
  fs.writeFileSync(process.env.CPM_JSON || `out/g432/misura-432-${TOD}.json`, JSON.stringify({ rv, rr }, null, 1));
  if (!rv.giudicato || !rr.giudicato) { console.log('NON GIUDICATO', rv.motivo, rr.motivo); process.exit(1); }
  for (const [nome, R, ref] of [['PRIMA (rosso __CPM_NO_G432)', rr, rr], ['DOPO (verde)', rv, rr]]) {
    const C = corrispondenza(R, ref); console.log(`\n== ${nome} · ora ${TOD} · corpi ${C.length}`);
    console.log('nome | colore | taglio figurina → atteso | 3D (quota calotta) | barba figurina → attesa | 3D (quota % viso) | ΔE strato/capelli | eccesso attaccatura');
    C.forEach(c => console.log([c.nome, c.colore, `${c.taglio} → ${c.attesoCal}`, `${c.t3d} (${c.qcal})${c.okT === null ? ' n.c.' : c.okT ? ' ✓' : ' ✗'}`, `${c.barba} → ${c.attesoBar}`, `${c.b3d} (${c.qbar})${c.okB ? ' ✓' : ' ✗'}`, `${c.dEcal ?? '-'} / ${c.dEbar ?? '-'}`, c.eccesso].join(' | ')));
    const T = C.filter(c => c.okT !== null); console.log(`taglio: ${T.filter(c => c.okT).length}/${T.length} (non coperti dalla tabella: ${C.length - T.length}) · barba: ${C.filter(c => c.okB).length}/${C.length}`);
    const ecc = R.righe.filter(x => x.giudicato).map(x => x.eccesso); console.log(`attaccatura: eccesso massimo ${Math.max(...ecc)} punti su ${ecc.length} scatti · oltre 5: ${ecc.filter(v => v > 5).length}`);
    console.log('compenetrazione (ingresso):', JSON.stringify(R.pen), '· tempi/oggetti:', JSON.stringify(R.tempi));
  }
}
