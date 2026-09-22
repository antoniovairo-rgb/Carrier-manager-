/* [22/09] Profilo della clip approvata `gk-high-catch` sul GLB della review: a ogni passo di tempo, quota
   del punto medio delle mani, distanza fra le mani e apertura dal busto. Serve a sapere IN QUALE ISTANTE la
   clip fa la presa, per sincronizzare l'arrivo della palla: misurato sull'asset, non stimato. */
import { startServer, launchBrowser, installCdnRoutes } from '../visual/lib/harness.mjs';
const server = await startServer();
const browser = await launchBrowser();
const page = await (await browser.newContext()).newPage();
try {
  await installCdnRoutes(page);
  await page.goto(`http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html`);
  await page.waitForFunction(() => window.THREE && THREE.GLTFLoader && THREE.SkeletonUtils, null, { timeout: 60000 });
  const res = await page.evaluate(async () => {
    const gltf = await new Promise((ok, ko) => new THREE.GLTFLoader().load('./assets/cgtrader-review-lod2-kit-adapter.glb', ok, undefined, ko));
    const clip = gltf.animations.find(c => c.name === 'gk-high-catch');
    const root = THREE.SkeletonUtils.clone(gltf.scene);
    const bone = re => { let r = null; root.traverse(o => { if (!r && o.isBone && re.test(o.name)) r = o; }); return r; };
    const hl = bone(/^(?:hand\.l_|hand_l$)/i), hr = bone(/^(?:hand\.r_|hand_r$)/i), sp = bone(/spine_03|spine_02|spine_01/i);
    const ft = bone(/^(?:foot\.l_|foot_l)$/i), hd = bone(/head/i);
    const mx = new THREE.AnimationMixer(root); const act = mx.clipAction(clip); act.play();
    const v = () => new THREE.Vector3(); const out = [];
    for (let t = 0; t <= clip.duration + 1e-6; t += 1 / 30) {
      mx.setTime(t); root.updateMatrixWorld(true);
      const a = hl.getWorldPosition(v()), b = hr.getWorldPosition(v()), s = sp.getWorldPosition(v()), f = ft.getWorldPosition(v()), h = hd.getWorldPosition(v());
      const m = a.clone().add(b).multiplyScalar(0.5);
      out.push({ t: +t.toFixed(3), maniY: +(m.y - f.y).toFixed(3), testaY: +(h.y - f.y).toFixed(3), fraMani: +a.distanceTo(b).toFixed(3), sopraBusto: +(m.y - s.y).toFixed(3), avanti: +(m.z - s.z).toFixed(3) });
    }
    return { dur: clip.duration, out };
  });
  const top = res.out.reduce((a, b) => (b.maniY > a.maniY ? b : a));
  console.log('durata', res.dur.toFixed(3), '· picco mani', JSON.stringify(top));
  res.out.filter((_, i) => i % 5 === 0).forEach(r => console.log(JSON.stringify(r)));
} finally { await browser.close(); server.close(); }
