/* [giro 178 · PO-367, difetti D3/D6 del giro 170] ATTREZZI DI MISURA DEL COLORE E DELL'INQUADRATURA DELL'INTRO.
   Solo misura: non cambia il gioco. Si inietta con page.addInitScript(INIT178) PRIMA che il gioco crei i renderer.

   1) Avvolge THREE.WebGLRenderer (come CONTA170 del giro 170) e ricorda per ogni renderer l'ultima scena e camera disegnate.
   2) window.__G178_MIS(clubs, kind) — SINCRONO, dentro un solo compito JavaScript (quindi senza fermare il gioco):
        a. ridisegna il fotogramma normale e legge i pixel (gl.readPixels subito dopo render: il buffer e' ancora valido);
        b. ridisegna una MASCHERA (maglia = rosso, bandiera/sciarpa/folla del colore del club = verde, resto nero, niente nebbia)
           e legge i pixel: i pixel del fotogramma normale sotto la maschera (erosa di 2 px) danno il colore VERO reso a schermo;
        c. per ogni esadecimale aggiunge alla scena due CAMPIONI davanti alla camera — piatto (MeshBasic) e illuminato
           (MeshStandard, ruvido) — creati come li crea quella scena (kind 'hex' = THREE.Color(hex), come corpoCG23/intro/galà;
           kind 'tex' = CanvasTexture sRGB, come le maglie della partita) e legge il loro pixel. Il campione PIATTO misura
           soltanto lo «sviluppo» (uscita, tonemapping, esposizione, conversione dei materiali): e' la grandezza del difetto D6.
        d. ridisegna il fotogramma normale (cio' che resta a schermo e' il gioco, non la maschera).
   3) Ogni render del renderer dell'intro registra la frazione delle ossa dell'eroe dentro l'inquadratura (window.__G178_INTRO). */
export const INIT178 = () => {
  window.__R178 = [];
  const avvolgi = (T) => { if (!T || T.__g178) return; let O = T.WebGLRenderer;
    const W = function (p) { const r = new O(p); const rec = { r, n: 0, tl: 0, sc: null, cam: null }; window.__R178.push(rec);
      const rr = r.render.bind(r); rec.rr = rr;
      r.render = function (s, c) { rr(s, c); rec.n++; rec.tl = performance.now(); rec.sc = s; rec.cam = c;
        try { const I = window.__CPM_INTRO118, av = I && I.av && I.av.hero; if (av && window.__G178_INTRO_ON && av.parent === s) {
            const L = (window.__G178_INTRO = window.__G178_INTRO || []); if (L.length < 6000) {
              av.updateMatrixWorld(true); let n = 0, dentro = 0, testa = null; const v = new T.Vector3();
              av.traverse(b => { if (!b.isBone) return; n++; b.getWorldPosition(v); v.project(c); const ok = Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z < 1; if (ok) dentro++; if (/head$/i.test(b.name || '') && !/top/i.test(b.name || '')) testa = ok; });
              const el = (window.__CPM_INTRO115 || {}).el; L.push({ el: el == null ? null : Math.round(el * 100) / 100, f: n ? Math.round(dentro / n * 1000) / 1000 : null, testa, vis: !!av.visible }); } } } catch (e) {} };
      return r; };
    try { Object.defineProperty(T, 'WebGLRenderer', { configurable: true, get() { return O ? W : undefined; }, set(v) { O = v; } }); T.__g178 = 1; } catch (e) {} };
  let _T = window.THREE; if (_T) avvolgi(_T);
  try { Object.defineProperty(window, 'THREE', { configurable: true, get() { return _T; }, set(v) { _T = v; avvolgi(v); } }); } catch (e) {}

  const hexDi = (m) => { try { if (m.userData && m.userData._s178) return m.userData._s178;
      if (m.map && m.map.image && m.map.image.getContext) { const d = m.map.image.getContext('2d').getImageData(3, 3, 1, 1).data; return '#' + [d[0], d[1], d[2]].map(x => x.toString(16).padStart(2, '0')).join(''); }
      if (m.color) return '#' + m.color.getHexString(); } catch (e) {} return null; };
  const vicino = (a, b) => { if (!a || !b) return false; const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return Math.max(...A.map((x, i) => Math.abs(x - B[i]))) <= 3; };

  window.__G178_MIS = (clubs, kind) => { const T = window.THREE; const now = performance.now();
    const live = window.__R178.filter(x => x.sc && now - x.tl < 3000).sort((a, b) => b.tl - a.tl)[0]; if (!live) return { errore: 'nessun renderer vivo' };
    const { r, sc, cam, rr } = live; const gl = r.getContext(); const cv = r.domElement; const W = cv.width, H = cv.height;
    const read = () => { const a = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, a); return a; };
    rr(sc, cam); const F = read();
    let lum = 0, nl = 0; for (let i = 0; i < F.length; i += 4 * 7) { lum += 0.2126 * F[i] + 0.7152 * F[i + 1] + 0.0722 * F[i + 2]; nl++; }
    const out = { renderer: { tone: r.toneMapping, expo: +(+r.toneMappingExposure).toFixed(3), enc: r.outputEncoding }, lum: +(lum / nl / 255).toFixed(4), W, H, club: {} };
    for (const hex of clubs) { const R = { maglia: null, bandiere: null, campione: null, campioneLuce: null };
      /* --- maschera --- */
      const salv = [], nasc = []; const mR = new T.Color(1, 0, 0), mG = new T.Color(0, 1, 0), mK = new T.Color(0, 0, 0);
      const fog0 = sc.fog, bg0 = sc.background; const cc0 = new T.Color(); r.getClearColor(cc0); const ca0 = r.getClearAlpha();
      sc.fog = null; sc.background = null; r.setClearColor(0x000000, 1);
      sc.traverse(o => { if (!o.visible) return; if (o.isSprite) { nasc.push(o); o.visible = false; return; }
        if (!(o.isMesh || o.isPoints || o.isLine)) return; const mats = Array.isArray(o.material) ? o.material : [o.material]; const m = mats[0]; if (!m) return;
        if (m.transparent && (m.opacity < 0.6 || m.blending !== T.NormalBlending)) { nasc.push(o); o.visible = false; return; }
        const h = hexDi(m); const nm = (m.name || '') + '|' + (o.name || '');
        const maglia = /HyperShirt(?!Accent)|shirt/i.test(nm) && vicino(h, hex); const altro = !maglia && vicino(h, hex);
        const col = maglia ? mR : altro ? mG : mK; let mm;
        if (o.isPoints) mm = new T.PointsMaterial({ color: col, size: m.size, sizeAttenuation: m.sizeAttenuation, fog: false });
        else if (o.isLine) mm = new T.LineBasicMaterial({ color: mK, fog: false });
        else mm = new T.MeshBasicMaterial({ color: col, fog: false, skinning: !!o.isSkinnedMesh, morphTargets: !!m.morphTargets, side: m.side, toneMapped: false, alphaTest: m.alphaTest || 0, map: (m.alphaTest > 0 && m.map) ? m.map : null });
        if (mm.map) mm.color = col; salv.push([o, o.material]); o.material = Array.isArray(o.material) ? o.material.map(() => mm) : mm; });
      rr(sc, cam); const M = read();
      salv.forEach(([o, m]) => { const mm = Array.isArray(o.material) ? o.material[0] : o.material; o.material = m; try { mm.dispose(); } catch (e) {} }); nasc.forEach(o => { o.visible = true; });
      sc.fog = fog0; sc.background = bg0; r.setClearColor(cc0, ca0);
      const cat = (i) => { const a = M[i], g = M[i + 1]; return a > 200 && g < 60 ? 1 : (g > 200 && a < 60 ? 2 : 0); };
      const acc = { 1: [], 2: [] }; const st = 2;
      for (let y = st; y < H - st; y += 2) for (let x = st; x < W - st; x += 2) { const i = 4 * (y * W + x); const c = cat(i); if (!c) continue;
        if (cat(i - 4 * st) !== c || cat(i + 4 * st) !== c || cat(i - 4 * st * W) !== c || cat(i + 4 * st * W) !== c) continue; acc[c].push([F[i], F[i + 1], F[i + 2]]); }
      const med = (L) => { if (L.length < 20) return null; const k = [0, 1, 2].map(j => L.map(p => p[j]).sort((a, b) => a - b)[L.length >> 1]); return { rgb: k, n: L.length }; };
      R.maglia = med(acc[1]); R.bandiere = med(acc[2]);
      /* --- campioni --- */
      const fwd = new T.Vector3(); cam.getWorldDirection(fwd); const cp = new T.Vector3(); cam.getWorldPosition(cp); const q = new T.Quaternion(); cam.getWorldQuaternion(q);
      const d = Math.max(1.2, (cam.near || 0.1) * 4); const hh = 2 * d * Math.tan((cam.fov || 50) * Math.PI / 360); const s = hh * 0.12;
      const mk = (lit) => { let m; if (kind === 'tex') { const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d'); x.fillStyle = hex; x.fillRect(0, 0, 8, 8); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
          m = lit ? new T.MeshStandardMaterial({ map: t, roughness: 1, metalness: 0, fog: false }) : new T.MeshBasicMaterial({ map: t, fog: false }); }
        else m = lit ? new T.MeshStandardMaterial({ color: new T.Color(hex), roughness: 1, metalness: 0, fog: false }) : new T.MeshBasicMaterial({ color: new T.Color(hex), fog: false });
        m.depthTest = false; m.depthWrite = false; m.transparent = true; m.opacity = 1; /* nel passaggio TRASPARENTE e per ultimo: coni di luce additivi e lampi (galà) si disegnano dopo gli opachi e lo coprivano */ const p = new T.Mesh(new T.PlaneGeometry(s, s), m); p.renderOrder = 9999; p.frustumCulled = false; p.quaternion.copy(q);
        const ox = (lit ? 0.22 : -0.22) * hh * cam.aspect; p.position.copy(cp).addScaledVector(fwd, d).add(new T.Vector3(ox, 0, 0).applyQuaternion(q)); return p; };
      const pB = mk(false), pL = mk(true); sc.add(pB); sc.add(pL); rr(sc, cam); const S = read(); sc.remove(pB); sc.remove(pL);
      [pB, pL].forEach(p => { try { if (p.material.map) p.material.map.dispose(); p.material.dispose(); p.geometry.dispose(); } catch (e) {} });
      const px = (fx) => { const cx = Math.round(W * (0.5 + fx)), cy = Math.round(H * 0.5); const L = []; for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++) { const i = 4 * (y * W + x); L.push([S[i], S[i + 1], S[i + 2]]); } return med(L.concat(L, L, L)).rgb; };
      R.campione = px(-0.22); R.campioneLuce = px(0.22); out.club[hex] = R; }
    rr(sc, cam); return out; };
};

/* ---- ΔE2000 (CIEDE2000) da sRGB 8 bit ---- */
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
export function lab([r, g, b]) { const R = lin(r), G = lin(g), B = lin(b);
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = (R * 0.2126 + G * 0.7152 + B * 0.0722), Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; X = f(X); Y = f(Y); Z = f(Z); return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)]; }
export function dE(a, b) { const [L1, a1, b1] = lab(a), [L2, a2, b2] = lab(b); const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2, G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G), C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (x, y) => { if (x === 0 && y === 0) return 0; const t = Math.atan2(y, x) / rad; return t < 0 ? t + 360 : t; }; const h1 = h(a1p, b1), h2 = h(a2p, b2);
  const dL = L2 - L1, dC = C2p - C1p; let dh = 0; if (C1p * C2p) { dh = h2 - h1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; } const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh / 2 * rad);
  const Lm = (L1 + L2) / 2, Cpm = (C1p + C2p) / 2; let hm = h1 + h2; if (C1p * C2p) { hm = Math.abs(h1 - h2) > 180 ? (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2 : (h1 + h2) / 2; }
  const Tt = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dth = 30 * Math.exp(-(((hm - 275) / 25) ** 2)), Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7)), Sl = 1 + 0.015 * (Lm - 50) ** 2 / Math.sqrt(20 + (Lm - 50) ** 2), Sc = 1 + 0.045 * Cpm, Sh = 1 + 0.015 * Cpm * Tt, Rt = -Math.sin(2 * dth * rad) * Rc;
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh)); }
export const hexRGB = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
/* i quattro club della misura: chiaro, scuro, saturo, bianco */
export const CLUB178 = [
  { k: 'chiaro', c: '#facc15', c2: '#2563eb' },
  { k: 'scuro', c: '#1e3a5f', c2: '#f5f5f5' },
  { k: 'saturo', c: '#dc2626', c2: '#f5f5f5' },
  { k: 'bianco', c: '#f5f5f5', c2: '#111827' },
];
