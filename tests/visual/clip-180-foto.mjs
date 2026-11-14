// [giro 180b, PO-367] Provini delle clip Anderson Rohr riadattate (assets/cgtrader-clip-rohr.glb) sul NOSTRO corpo
// (CGTrader LOD1), con three r128 come nel gioco: 3 fotogrammi (inizio · meta' · fine) su sfondo neutro, formato PC e
// telefono, + misura della compenetrazione col suolo sui VERTICI deformati (non sulle ossa) e del percorso del bacino.
// Non tocca il gioco: pagina vuota con i soli bundle locali. Uso: node clip-180-foto.mjs [cartella-uscita]
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const REPO = path.resolve(QUI, '../..');
const OUT = path.resolve(process.argv[2] || path.join(REPO, 'docs/sviluppo/giro180'));
fs.mkdirSync(OUT, { recursive: true });
const CLIP = process.env.CPM_CLIP180 || 'assets/cgtrader-clip-rohr.glb';
const CORPO = 'assets/cgtrader-review-lod1-kit-adapter.glb';
const br = await chromium.launch({ executablePath: process.env.CPM_CHROME || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await br.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.route('http://cpm.local/**', r => {
  const p = new URL(r.request().url()).pathname.slice(1);
  if (p === '') return r.fulfill({ contentType: 'text/html', body: '<!doctype html><body style="margin:0;background:#8a8f96"></body>' });
  r.fulfill({ body: fs.readFileSync(path.join(REPO, p)), contentType: p.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' });
});
await page.goto('http://cpm.local/');
await page.addScriptTag({ path: path.join(QUI, 'node_modules/three/build/three.min.js') });
await page.addScriptTag({ path: path.join(QUI, 'node_modules/three/examples/js/loaders/GLTFLoader.js') });
const elenco = await page.evaluate(async ({ CORPO, CLIP }) => {
  const L = new THREE.GLTFLoader(); const carica = u => new Promise((ok, ko) => L.load(u, ok, null, ko));
  const [corpo, clip] = await Promise.all([carica('http://cpm.local/' + CORPO), carica('http://cpm.local/' + CLIP)]);
  const W = 400, H = 460;
  const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H); R.setPixelRatio(2);
  R.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x8a8f96);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x555555, 0.9)); const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(2, 4, 3); sc.add(dl);
  const suolo = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshLambertMaterial({ color: 0xb7bbc0 })); suolo.rotation.x = -Math.PI / 2; sc.add(suolo);
  const griglia = new THREE.GridHelper(12, 24, 0x6d7278, 0x9a9fa5); griglia.position.y = 0.002; sc.add(griglia);
  const m = corpo.scene; sc.add(m);
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 50);
  const mix = new THREE.AnimationMixer(m);
  let pelvis = null; m.traverse(o => { if (o.name === 'pelvis') pelvis = o; });
  const pelli = []; m.traverse(o => { if (o.isSkinnedMesh) { pelli.push(o); o.frustumCulled = false; } });   // [180c] la sfera di ritaglio e' quella della posa di riposo: un corpo che si sposta (parata) spariva dal provino
  const v = new THREE.Vector3();
  const minY = () => { let y = 1e9; m.updateMatrixWorld(true);
    for (const s of pelli) { const pos = s.geometry.attributes.position; s.skeleton.update();
      for (let i = 0; i < pos.count; i += 7) { v.fromBufferAttribute(pos, i); s.boneTransform(i, v); v.applyMatrix4(s.matrixWorld); if (v.y < y) y = v.y; } }
    return y; };
  const y0 = minY();   // posa di riposo: pianta appoggiata
  window.__foto = (nome, t, etichetta) => {
    const a = mix.clipAction(clip.animations.find(c => c.name === nome)); mix.stopAllAction(); a.reset().play(); a.paused = false;
    mix.setTime(t); m.updateMatrixWorld(true);
    const p = new THREE.Vector3(); pelvis.getWorldPosition(p);
    cam.position.set(p.x + 2.6, 1.35, p.z + 3.6); cam.lookAt(p.x, 0.85, p.z);
    R.render(sc, cam);
    const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; const g = c.getContext('2d');
    g.drawImage(R.domElement, 0, 0); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, c.width, 56);
    g.fillStyle = '#fff'; g.font = '600 30px sans-serif'; g.fillText(etichetta, 18, 38);
    return c;
  };
  window.__foglio = (nome, verticale) => {
    const d = clip.animations.find(c => c.name === nome).duration;
    const tp = window.__picco(nome), f = x => x.toFixed(2).replace('.', ',');
    const tt = [[0, 'inizio 0,00 s'], [d / 2, `metà ${f(d / 2)} s`], [tp, `gesto ${f(tp)} s`], [d - 1 / 30, `fine ${f(d)} s`]];
    const pz = tt.map(([t, e]) => window.__foto(nome, t, e));
    const out = document.createElement('canvas'); const pw = pz[0].width, ph = pz[0].height;
    if (verticale) { out.width = pw; out.height = ph * 4; pz.forEach((c, i) => out.getContext('2d').drawImage(c, 0, i * ph)); }
    else { out.width = pw * 4; out.height = ph; pz.forEach((c, i) => out.getContext('2d').drawImage(c, i * pw, 0)); }
    return out.toDataURL('image/jpeg', 0.82);
  };
  // istante del GESTO: massima velocita' di un piede o di una mano rispetto al bacino (il colpo, il pugno alzato)
  window.__picco = (nome) => {
    const cl = clip.animations.find(c => c.name === nome); const a = mix.clipAction(cl); mix.stopAllAction(); a.reset().play();
    const ossa = ['ball_l', 'ball_r', 'hand_l', 'hand_r'].map(n => { let o; m.traverse(x => { if (x.name === n) o = x; }); return o; });
    const rel = () => { m.updateMatrixWorld(true); const pp = new THREE.Vector3(); pelvis.getWorldPosition(pp);
      return ossa.map(o => { const q = new THREE.Vector3(); o.getWorldPosition(q); return q.sub(pp); }); };
    let prima = null, best = 0, tb = cl.duration / 2;
    for (let t = 0; t <= cl.duration; t += 1 / 30) { mix.setTime(t); const r = rel();
      if (prima) r.forEach((q, i) => { const v = q.distanceTo(prima[i]); if (v > best) { best = v; tb = t; } }); prima = r; }
    return tb;
  };
  window.__misura = (nome) => {
    const cl = clip.animations.find(c => c.name === nome); const a = mix.clipAction(cl); mix.stopAllAction(); a.reset().play();
    let sotto = 0, tSotto = 0, quota = 0, n = 0; const p0 = new THREE.Vector3(), p = new THREE.Vector3(); let max = 0;
    mix.setTime(0); m.updateMatrixWorld(true); pelvis.getWorldPosition(p0);
    for (let t = 0; t <= cl.duration; t += 3 / 30) {
      mix.setTime(t); const y = minY() - y0; n++; if (y < -0.01) quota++; if (-y > sotto) { sotto = -y; tSotto = t; }
      pelvis.getWorldPosition(p); max = Math.max(max, Math.hypot(p.x - p0.x, p.z - p0.z));
    }
    return { clip: nome, durata: +cl.duration.toFixed(3), tracce: cl.tracks.length, sotto_suolo_cm: +(sotto * 100).toFixed(1),
      t_sotto: +tSotto.toFixed(2), quota_sotto_1cm: +(quota / n).toFixed(3), bacino_max_m: +max.toFixed(2) };
  };
  return clip.animations.map(c => c.name);
}, { CORPO, CLIP });
const misure = [];
for (const nome of elenco) {
  for (const [suff, vert] of [['pc', false], ['telefono', true]]) {
    const url = await page.evaluate(([n, v]) => window.__foglio(n, v), [nome, vert]);
    fs.writeFileSync(path.join(OUT, `${nome}-${suff}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  }
  const mi = await page.evaluate(n => window.__misura(n), nome); misure.push(mi); console.log('MESH ' + JSON.stringify(mi));
}
fs.writeFileSync(path.join(OUT, 'misure-mesh.json'), JSON.stringify(misure, null, 1) + '\n');
await br.close();
