/* [giro 128 PO-330 — PROTOTIPO ISOLATO, NON e' codice di gioco] Tre modi di «umanizzare» i tifosi.
   Si inietta da una sonda (tests/visual/folla-128-proto.mjs) nella scena 3D VERA gia' costruita dal gioco:
   riconosce i piani-pubblico di makeCrowdTex, li sostituisce con una gradinata vuota (texture di soli sedili,
   statica, una per tutto lo stadio) e ci mette sopra la gente in uno dei tre modi:
     A  impostori: un quadrato per tifoso (2 triangoli) da un ATLANTE di persone disegnate proceduralmente
        (12 varianti x 2 pose), maglia tinta per istanza con una maschera, tifo animato nel vertex shader;
     B  figure low-poly istanziate (busto, spalle, collo, testa, capelli, braccia, gambe): ~110 triangoli,
        colori per regione e per istanza, braccia che si alzano e saltello nel vertex shader;
     C  miscela: le prime file dell'anello basso in B, tutto il resto in A.
   Nessuna risorsa esterna: tutto e' disegnato/costruito qui (nessuna licenza di terzi).
   Zero ridisegni di canvas e zero caricamenti di texture dopo la costruzione: l'animazione costa solo GPU.
   Uso: window.__FOLLA128(mode, {THREE, scene, fill, homeHex, awayHex, density, rows3D}) → statistiche. */
(function () {
  'use strict';
  const SKINS = ['#f3c7a6', '#e9b28a', '#d9a06a', '#c68b5e', '#a7704a', '#8a5636', '#6e432a', '#4f2f1e'];
  const HAIRS = ['#1b120c', '#2e1d12', '#4a2f1a', '#6b4423', '#9a6b3c', '#c9a36a', '#8c8c8c', '#d8d0c0'];
  const CASUAL = ['#2b3a55', '#3a3f4a', '#6b6f78', '#1f2937', '#4a3b6b', '#2f5d3a', '#7a2b2b', '#c8c2b2', '#8a6a2a', '#265f5a'];
  const hex = h => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ───────────────────────── ATLANTE di persone (A e C) ─────────────────────────
     12 varianti (corporatura, capelli, cappellino, sciarpa, occhiali/barba) x 2 pose (braccia giu', braccia su).
     Ogni cella 64x128. Due tele: COLORE (pelle/capelli veri, maglia in grigio ombreggiato) e MASCHERA
     (r = maglia, g = pantaloni) → la maglia si tinge per istanza nello shader, l'ombreggiatura resta. */
  function buildAtlas() {
    const CW = 64, CH = 128, NV = 12, W = CW * NV, H = CH * 2;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
    const mk = document.createElement('canvas'); mk.width = W; mk.height = H; const m = mk.getContext('2d');
    m.fillStyle = '#000'; m.fillRect(0, 0, W, H);
    const r = rng(9128);
    for (let v = 0; v < NV; v++) for (let pose = 0; pose < 2; pose++) {
      const ox = v * CW, oy = pose * CH, cx = ox + CW / 2;
      const skin = SKINS[(v * 5 + 1) % SKINS.length], hair = HAIRS[(v * 3) % HAIRS.length];
      const broad = 0.86 + ((v * 7) % 5) * 0.06, cap = v % 4 === 2, scarf = v % 3 === 1, bald = v === 7, beard = v % 5 === 3, glasses = v % 6 === 4, female = v % 4 === 1;
      const shirtY = oy + 58, shW = 20 * broad, hipW = 15 * broad;
      // GAMBE/pantaloni (si vedono solo in parte dietro le sedute)
      const grdP = x.createLinearGradient(0, oy + 96, 0, oy + 128); grdP.addColorStop(0, '#9a9a9a'); grdP.addColorStop(1, '#5a5a5a');
      x.fillStyle = grdP; x.fillRect(cx - hipW + 1, oy + 96, hipW - 2, 32); x.fillRect(cx + 1, oy + 96, hipW - 2, 32);
      m.fillStyle = '#00ff00'; m.fillRect(cx - hipW + 1, oy + 96, hipW - 2, 32); m.fillRect(cx + 1, oy + 96, hipW - 2, 32);
      // BUSTO: trapezio spalle→fianchi, ombreggiato (luce dall'alto a sinistra)
      const torso = c => { c.beginPath(); c.moveTo(cx - shW, shirtY + 4); c.quadraticCurveTo(cx - shW, shirtY - 2, cx - shW + 6, shirtY - 3);
        c.lineTo(cx + shW - 6, shirtY - 3); c.quadraticCurveTo(cx + shW, shirtY - 2, cx + shW, shirtY + 4); c.lineTo(cx + hipW, oy + 100); c.lineTo(cx - hipW, oy + 100); c.closePath(); };
      const g = x.createLinearGradient(cx - shW, 0, cx + shW, 0); g.addColorStop(0, '#f2f2f2'); g.addColorStop(0.55, '#d0d0d0'); g.addColorStop(1, '#8e8e8e');
      x.fillStyle = g; torso(x); x.fill(); m.fillStyle = '#ff0000'; torso(m); m.fill();
      x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(cx - 1, shirtY + 2, 2, 30); // piega centrale
      // BRACCIA (maniche maglia + mani pelle)
      const arm = (side, up) => { const sx = cx + side * (shW - 3), sy = shirtY + 2;
        const ex = up ? sx + side * 7 : sx + side * 3, ey = up ? oy + 14 : oy + 92;
        x.strokeStyle = '#bdbdbd'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(sx, sy); x.lineTo((sx + ex) / 2, (sy + ey) / 2); x.stroke();
        m.strokeStyle = '#ff0000'; m.lineWidth = 9; m.lineCap = 'round'; m.beginPath(); m.moveTo(sx, sy); m.lineTo((sx + ex) / 2, (sy + ey) / 2); m.stroke();
        x.strokeStyle = skin; x.lineWidth = 7; x.beginPath(); x.moveTo((sx + ex) / 2, (sy + ey) / 2); x.lineTo(ex, ey); x.stroke();
        x.fillStyle = skin; x.beginPath(); x.arc(ex, ey, 4.2, 0, 6.3); x.fill(); };
      arm(-1, pose === 1); arm(1, pose === 1 && v % 2 === 0 ? true : pose === 1);
      // SCIARPA (colore della squadra: va nella maschera maglia)
      if (scarf) { x.fillStyle = '#e6e6e6'; x.fillRect(cx - shW + 4, shirtY - 4, (shW - 4) * 2, 6); m.fillStyle = '#ff0000'; m.fillRect(cx - shW + 4, shirtY - 4, (shW - 4) * 2, 6);
        if (pose === 1) { x.fillRect(cx + shW - 2, oy + 6, 6, 40); m.fillRect(cx + shW - 2, oy + 6, 6, 40); } }
      // COLLO e TESTA (ovale, mandibola, orecchie), ombra laterale
      x.fillStyle = skin; x.fillRect(cx - 4, shirtY - 10, 8, 9);
      const hy = oy + 38, hr = 11.5;
      const hg = x.createRadialGradient(cx - 4, hy - 4, 2, cx, hy, hr + 3); hg.addColorStop(0, skin); hg.addColorStop(1, shade(skin, 0.72));
      x.fillStyle = hg; x.beginPath(); x.ellipse(cx, hy, hr * 0.86, hr, 0, 0, 6.3); x.fill();
      x.fillStyle = shade(skin, 0.8); x.beginPath(); x.arc(cx - hr * 0.86, hy + 1, 2.6, 0, 6.3); x.arc(cx + hr * 0.86, hy + 1, 2.6, 0, 6.3); x.fill();
      // tratti del volto appena accennati (a distanza di gioco diventano solo ombreggiatura)
      x.fillStyle = 'rgba(30,20,15,0.55)'; x.fillRect(cx - 5, hy - 1, 3, 2); x.fillRect(cx + 2, hy - 1, 3, 2);
      if (pose === 1) { x.fillStyle = 'rgba(60,20,20,0.7)'; x.beginPath(); x.ellipse(cx, hy + 6, 3, 2.4, 0, 0, 6.3); x.fill(); } // bocca aperta: canta
      else { x.fillStyle = 'rgba(80,40,30,0.45)'; x.fillRect(cx - 3, hy + 6, 6, 1.4); }
      if (beard) { x.fillStyle = shade(hair, 0.9); x.beginPath(); x.ellipse(cx, hy + 6, hr * 0.7, 5, 0, 0, Math.PI); x.fill(); }
      if (glasses) { x.strokeStyle = '#111'; x.lineWidth = 1.2; x.strokeRect(cx - 7, hy - 3, 5, 4); x.strokeRect(cx + 2, hy - 3, 5, 4); }
      // CAPELLI / CAPPELLINO
      if (cap) { x.fillStyle = CASUAL[v % CASUAL.length]; x.beginPath(); x.ellipse(cx, hy - 4, hr * 0.95, hr * 0.75, 0, Math.PI, 0); x.fill(); x.fillRect(cx - hr, hy - 5, hr * 2 + 4, 3); }
      else if (!bald) { x.fillStyle = hair; x.beginPath(); x.ellipse(cx, hy - 3, hr * 0.92, hr * 0.85, 0, Math.PI * 1.02, Math.PI * 1.98); x.fill();
        if (female) { x.fillRect(cx - hr * 0.95, hy - 3, 4, 20); x.fillRect(cx + hr * 0.95 - 4, hy - 3, 4, 20); } }
      void r;
    }
    function shade(h, k) { const c = hex(h); return 'rgb(' + c.map(t => Math.round(t * 255 * k)).join(',') + ')'; }
    return { cv, mk, NV, CW, CH };
  }

  /* gradinata VUOTA: una sola texture statica di sedili nei colori del club di casa */
  function seatTexture(THREE, homeHex) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#26262f'; x.fillRect(0, 0, 64, 64);
    const s = hex(homeHex).map(t => Math.round((t * 0.55 + 0.35 * 0.45) * 255));
    x.fillStyle = 'rgb(' + s.join(',') + ')'; x.fillRect(8, 18, 48, 26); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(8, 40, 48, 4); x.fillStyle = '#1b1b22'; x.fillRect(0, 54, 64, 10);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
  }

  /* posti: griglia sul piano-pubblico (spazio locale del piano), ognuno con un tiro di occupazione */
  function seatsOnPlane(THREE, mesh, opts, r) {
    const p = mesh.geometry.parameters, W = p.width, L = p.height; mesh.updateMatrixWorld(true);
    const colW = opts.density === 'oggi' ? 1 / 0.55 : 0.62, rowL = opts.density === 'oggi' ? 0.95 : 0.85;
    const cols = Math.max(4, Math.floor(W / colW)), rows = Math.max(2, Math.floor(L / rowL));
    const wm = mesh.matrixWorld, up = new THREE.Vector3(0, 1, 0).transformDirection(wm);
    const face = new THREE.Vector3(-up.x, 0, -up.z).normalize(); // verso il campo
    const yaw = Math.atan2(face.x, face.z);
    const isAway = !!mesh.userData.away;
    const out = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (r() > opts.fill) continue;
      const lx = -W / 2 + (i + 0.5 + (r() - 0.5) * 0.25) * (W / cols), ly = -L / 2 + (j + 0.35) * (L / rows);
      const wp = new THREE.Vector3(lx, ly, 0).applyMatrix4(wm);
      out.push({ p: wp, yaw, row: j, rows, isAway, s: 0.9 + r() * 0.2 });
    }
    return { out, cols, rows };
  }

  function pickColors(seat, opts, r) {
    const team = r() < (seat.isAway ? 0.85 : 0.72);
    const shirt = team ? hex(seat.isAway ? opts.awayHex : opts.homeHex) : hex(CASUAL[(r() * CASUAL.length) | 0]);
    const k = 0.85 + r() * 0.3; return { shirt: shirt.map(t => Math.min(1, t * k)), skin: hex(SKINS[(r() * SKINS.length) | 0]), hair: hex(HAIRS[(r() * HAIRS.length) | 0]) };
  }

  /* ───────────── A: impostori ───────────── */
  function buildImpostors(THREE, seats, opts, r, U) {
    const AT = opts._atlas || (opts._atlas = buildAtlas());
    const tc = new THREE.CanvasTexture(AT.cv), tm = new THREE.CanvasTexture(AT.mk); [tc, tm].forEach(t => { t.anisotropy = 4; });
    const n = seats.length; const geo = new THREE.PlaneGeometry(0.62, 1.24); geo.translate(0, 0.62, 0);
    const iv = new Float32Array(n * 4); // variante, fase, soglia d'eccitazione, scala
    const mat = new THREE.MeshBasicMaterial({ map: tc, alphaTest: 0.5, transparent: false, side: THREE.DoubleSide });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uT = U.uT; sh.uniforms.uEx = U.uEx; sh.uniforms.uMask = { value: tm }; sh.uniforms.uNV = { value: AT.NV };
      sh.vertexShader = 'attribute vec4 iV;\nuniform float uT;uniform float uEx;uniform float uNV;\nvarying vec2 vAtl;\n' + sh.vertexShader
        .replace('#include <begin_vertex>', `vec3 transformed = vec3(position);
          float up = step(iV.z, uEx);
          transformed.y += sin(uT*(1.3+iV.y*0.1)+iV.y)*0.02 + up*abs(sin(uT*7.0+iV.y))*0.30*uEx;
          transformed *= iV.w;
          vAtl = vec2((iV.x + uv.x)/uNV, (1.0-up)*0.5 + uv.y*0.5);`);
      sh.fragmentShader = 'uniform sampler2D uMask;\nvarying vec2 vAtl;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', `vec4 texelColor = texture2D(map, vAtl); vec4 mk = texture2D(uMask, vAtl);
          float lum = texelColor.r;
          texelColor.rgb = mix(texelColor.rgb, lum * vColor.rgb * 1.05, mk.r);
          texelColor.rgb = mix(texelColor.rgb, lum * vec3(0.16,0.17,0.22) * 1.6, mk.g);
          diffuseColor *= texelColor;`)
        .replace('#include <color_fragment>', '');
    };
    mat.vertexColors = false;
    const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), E = new THREE.Euler(), C = new THREE.Color();
    seats.forEach((s, k) => { E.set(0, s.yaw, 0); Q.setFromEuler(E); S.set(1, 1, 1); M.compose(s.p.clone().add(new THREE.Vector3(0, -0.15, 0)), Q, S); im.setMatrixAt(k, M);
      const c = pickColors(s, opts, r); C.setRGB(c.shirt[0], c.shirt[1], c.shirt[2]); im.setColorAt(k, C);
      iv[k * 4] = (r() * AT.NV) | 0; iv[k * 4 + 1] = r() * 6.28; iv[k * 4 + 2] = 0.15 + r() * 0.8; iv[k * 4 + 3] = s.s; });
    geo.setAttribute('iV', new THREE.InstancedBufferAttribute(iv, 4));
    // vColor serve allo shader: con instanceColor three definisce USE_INSTANCING_COLOR e vColor
    return im;
  }

  /* ───────────── B: figure low-poly istanziate ─────────────
     Regione per vertice nell'attributo 'color'.r: 0 maglia, 0.25 pelle, 0.5 capelli, 0.75 pantaloni; 'color'.g = 1 sui
     vertici del braccio (ruota attorno alla spalla nel vertex shader). */
  function figureGeometry(THREE) {
    const parts = [];
    const add = (g, region, arm, side) => { g = g.toNonIndexed(); const n = g.attributes.position.count; const c = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { c[i * 3] = region; c[i * 3 + 1] = arm ? 1 : 0; c[i * 3 + 2] = side || 0; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.deleteAttribute('uv'); parts.push(g); };
    const torso = new THREE.CylinderGeometry(0.21, 0.16, 0.55, 6, 1); torso.scale(1, 1, 0.62); torso.translate(0, 0.98, 0); add(torso, 0);
    const sh = new THREE.SphereGeometry(0.2, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2); sh.scale(1.1, 0.35, 0.65); sh.translate(0, 1.25, 0); add(sh, 0);
    const neck = new THREE.CylinderGeometry(0.05, 0.06, 0.08, 5, 1); neck.translate(0, 1.33, 0); add(neck, 0.25);
    const head = new THREE.SphereGeometry(0.115, 7, 5); head.scale(0.9, 1.08, 0.95); head.translate(0, 1.47, 0); add(head, 0.25);
    const hair = new THREE.SphereGeometry(0.122, 7, 3, 0, Math.PI * 2, 0, Math.PI * 0.5); hair.scale(0.92, 1.0, 1.0); hair.translate(0, 1.49, -0.01); add(hair, 0.5);
    [-1, 1].forEach(sd => { const a = new THREE.CylinderGeometry(0.045, 0.04, 0.5, 4, 1); a.translate(0, -0.25, 0); a.translate(sd * 0.24, 1.24, 0); add(a, 0, true, sd);
      const h = new THREE.SphereGeometry(0.045, 4, 3); h.translate(sd * 0.24, 0.72, 0); add(h, 0.25, true, sd); });
    [-1, 1].forEach(sd => { const l = new THREE.CylinderGeometry(0.07, 0.06, 0.72, 4, 1); l.translate(sd * 0.09, 0.36, 0); add(l, 0.75); });
    const merged = mergeGeos(THREE, parts); merged.computeVertexNormals(); return merged;
  }
  function mergeGeos(THREE, gs) { let n = 0; gs.forEach(g => n += g.attributes.position.count);
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0;
    gs.forEach(g => { P.set(g.attributes.position.array, o * 3); if (g.attributes.normal) N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; });
    const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(P, 3)); m.setAttribute('normal', new THREE.BufferAttribute(N, 3)); m.setAttribute('color', new THREE.BufferAttribute(C, 3)); return m; }
  function buildFigures(THREE, seats, opts, r, U) {
    const geo = figureGeometry(THREE); const n = seats.length;
    const iSkin = new Float32Array(n * 3), iHair = new Float32Array(n * 3), iP = new Float32Array(n * 2);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uT = U.uT; sh.uniforms.uEx = U.uEx;
      sh.vertexShader = 'attribute vec3 iSkin;attribute vec3 iHair;attribute vec2 iP;uniform float uT;uniform float uEx;\n' + sh.vertexShader
        .replace('#include <color_vertex>', `float rg = color.r; vec3 shirtC = vec3(1.0);
          #ifdef USE_INSTANCING_COLOR
            shirtC = instanceColor.rgb;
          #endif
          vColor = rg < 0.12 ? shirtC : (rg < 0.37 ? iSkin : (rg < 0.62 ? iHair : vec3(0.15,0.16,0.2)));`)
        .replace('#include <begin_vertex>', `vec3 transformed = vec3(position);
          float up = step(iP.y, uEx);
          if (color.g > 0.5) { float ang = up * (2.6 + 0.3*sin(uT*6.0+iP.x)) ; vec3 piv = vec3(color.b*0.24, 1.24, 0.0); vec3 d = transformed - piv;
            float ca = cos(ang*color.b), sa = sin(ang*color.b); transformed = piv + vec3(d.x*ca - d.y*sa, d.x*sa + d.y*ca, d.z); }
          transformed.y += sin(uT*1.4+iP.x)*0.015 + up*abs(sin(uT*7.0+iP.x))*0.28*uEx;`)
        .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3( normal );');
      // il colore per istanza (instanceColor) e' gia' usato dalla maglia: lo neutralizziamo nella moltiplicazione standard
    };
    mat.customProgramCacheKey = () => 'folla128B';
    const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), E = new THREE.Euler(), C = new THREE.Color();
    seats.forEach((s, k) => { E.set(0, s.yaw, 0); Q.setFromEuler(E); const sc = s.s * (opts.density === 'oggi' ? 1.0 : 0.95); S.set(sc, sc * (r() < 0.25 ? 0.82 : 1), sc); M.compose(s.p.clone().add(new THREE.Vector3(0, -0.35, 0)), Q, S); im.setMatrixAt(k, M);
      const c = pickColors(s, opts, r); C.setRGB(c.shirt[0], c.shirt[1], c.shirt[2]); im.setColorAt(k, C);
      iSkin.set(c.skin, k * 3); iHair.set(c.hair, k * 3); iP[k * 2] = r() * 6.28; iP[k * 2 + 1] = 0.15 + r() * 0.8; });
    geo.setAttribute('iSkin', new THREE.InstancedBufferAttribute(iSkin, 3)); geo.setAttribute('iHair', new THREE.InstancedBufferAttribute(iHair, 3)); geo.setAttribute('iP', new THREE.InstancedBufferAttribute(iP, 2));
    // three moltiplica vColor per instanceColor dopo color_vertex: lo evitiamo spostando la maglia nel ramo sopra e
    // forzando instanceColor a 1 dopo la scrittura (vedi nota nel rapporto: in produzione si userebbe un attributo dedicato)
    mat.onBeforeCompile = (function (prev) { return sh => { prev(sh); sh.vertexShader = sh.vertexShader.replace(/vColor\.xyz \*= instanceColor\.xyz;/g, ''); }; })(mat.onBeforeCompile);
    return { im, triPer: geo.attributes.position.count / 3 };
  }

  window.__FOLLA128 = function (mode, o) {
    const THREE = o.THREE, scene = o.scene; const r = rng(128 + mode.charCodeAt(0));
    const U = window.__FOLLA128_U = { uT: { value: 0 }, uEx: { value: 0 } };
    const planes = [];
    scene.traverse(ob => { if (!ob.isMesh) return; const mp = ob.material && ob.material.map, im = mp && mp.image;
      if (im && im.tagName === 'CANVAS' && im.height === 512 && (im.width === 1024 || im.width === 2048) && ob.geometry.type === 'PlaneGeometry') planes.push(ob);
      const g = ob.geometry, gp = g && g.parameters || {};
      if (ob.isInstancedMesh && ((g.type === 'CylinderGeometry' && Math.abs(gp.radiusTop - 0.17) < 1e-6) || (g.type === 'SphereGeometry' && Math.abs(gp.radius - 0.145) < 1e-6))) ob.visible = false; });
    const seatT = seatTexture(THREE, o.homeHex);
    const seatsA = [], seats3D = [];
    planes.forEach(pl => {
      const mp = pl.material.map; const band = mp.repeat.y > 0.99 ? 'full' : (mp.offset.y < 0.01 ? 'low' : 'up');
      pl.updateMatrixWorld(true); const wpos = new THREE.Vector3().setFromMatrixPosition(pl.matrixWorld); pl.userData.away = wpos.x < -45; // Curva Nord (ospiti) e i suoi angoli stanno a -x
      const t = seatT.clone(); t.needsUpdate = true; const p = pl.geometry.parameters;
      t.repeat.set(p.width / (opts().density === 'oggi' ? 1 / 0.55 : 0.62), p.height / (opts().density === 'oggi' ? 0.95 : 0.85));
      pl.material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: t, side: THREE.DoubleSide });
      const { out } = seatsOnPlane(THREE, pl, opts(), r);
      out.forEach(s => { const front = band !== 'up' && s.row < (o.rows3D || 0); (mode === 'B' || (mode === 'C' && front) ? seats3D : seatsA).push(s); });
    });
    function opts() { return { fill: o.fill, homeHex: o.homeHex, awayHex: o.awayHex, density: o.density || (mode === 'B' ? 'oggi' : 'vera') }; }
    const grp = new THREE.Group(); grp.name = 'folla128'; let tri = 0;
    if (seatsA.length && mode !== 'B') { const im = buildImpostors(THREE, seatsA, opts(), r, U); grp.add(im); tri += seatsA.length * 2; }
    if (seats3D.length) { const b = buildFigures(THREE, seats3D, opts(), r, U); grp.add(b.im); tri += seats3D.length * b.triPer; }
    scene.add(grp);
    const t0 = performance.now(); (function tick() { U.uT.value = (performance.now() - t0) / 1000; U.uEx.value = window.__FOLLA128_EX || 0; requestAnimationFrame(tick); })();
    return { mode, planes: planes.length, impostori: mode === 'B' ? 0 : seatsA.length, figure3D: seats3D.length, triFolla: Math.round(tri) };
  };
})();
