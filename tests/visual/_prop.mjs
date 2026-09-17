/* PROPORZIONI CARTOON — quarto tentativo, primo con le due cause misurate.
   (1) `scene.clone(true)` NON riaggancia lo scheletro: i cloni deformano lo scheletro
       dell'originale, quindi scalare le loro ossa non muove un vertice — ed e' perche'
       i tre pannelli uscivano identici. Si clona con SkeletonUtils, come fa il gioco.
   (2) L'inquadratura non si deduce piu' da un Box3 (sulle skinned mesh legge la posa di
       bind, T-pose, braccia larghe 1,78): il modello e' MISURATO — piedi y=0, testa
       y=1,78 — e la camera si costruisce su quei due numeri.
   Una scena sola, tre figure affiancate: stessa luce, stessa camera, stesso istante. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const HTML = `<!doctype html><html><head><meta charset=utf-8><style>
html,body{margin:0;background:#0d1b12;font:400 15px system-ui,sans-serif;color:#dfe9e0}
#c{display:block;width:1100px;height:560px}
.r{display:flex;width:1100px}.r div{flex:1;text-align:center;padding:10px 0}
.t{font-weight:700;letter-spacing:.06em;font-size:14px}.u{font-size:12px;opacity:.62;margin-top:3px}
</style></head><body>
<div class=r><div><div class=t>COM'E' OGGI</div><div class=u>proporzioni reali</div></div>
<div><div class=t>CARTOON LEGGERO</div><div class=u>testa +35% &middot; gambe -12%</div></div>
<div><div class=t>CARTOON SPINTO</div><div class=u>testa +80% &middot; gambe -25%</div></div></div>
<canvas id=c></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js"></script>
<script>
const T=THREE, ALT=1.78;
const r=new T.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
r.setPixelRatio(2); r.setSize(1100,560,false); r.setClearColor(0x16281c);
const s=new T.Scene();
s.add(new T.HemisphereLight(0xffffff,0x2d3f26,0.9));
const d=new T.DirectionalLight(0xfff3e0,1.05); d.position.set(2.2,3.6,3.2); s.add(d);
s.add(new T.Mesh(new T.PlaneGeometry(40,40).rotateX(-Math.PI/2),new T.MeshLambertMaterial({color:0x2f6b33})));
/* tre figure a 1,15 m l'una dall'altra; la camera inquadra 2,15 m di altezza,
   cioe' il corpo intero (1,78) con un margine sopra e sotto. */
const PASSO=1.15, VIS=2.15, FOV=32;
const cam=new T.PerspectiveCamera(FOV,1100/560,0.05,100);
const dist=(VIS/2)/Math.tan(FOV*Math.PI/360);
cam.position.set(0, ALT*0.52, dist); cam.lookAt(0, ALT*0.50, 0);
const RIC=[{t:1,g:1},{t:1.35,g:0.88},{t:1.80,g:0.75}];
new T.GLTFLoader().load('/assets/footballer-uno.glb',(gl)=>{
 let scalate=0;
 RIC.forEach((ric,i)=>{
  const o=T.SkeletonUtils.clone(gl.scene);   /* (1) clone che RIAGGANCIA lo scheletro */
  o.traverse((n)=>{ if(!n.isBone)return; const nm=(n.name||'').toLowerCase();
    if(/head/.test(nm)&&!/top/.test(nm)){n.scale.setScalar(ric.t);scalate++;}
    if(/upleg|thigh/.test(nm)){n.scale.set(1,ric.g,1);scalate++;}
  });
  o.position.x=(i-1)*PASSO; o.rotation.y=Math.PI*0.12; s.add(o);
 });
 /* prova che le ossa sono state toccate davvero: 3 figure x (1 testa + 2 cosce) = 9 */
 window.__PRONTO={scalate, atteso:9, alto:ALT};
},undefined,(e)=>{window.__PRONTO={errore:String(e)};});
(function l(){requestAnimationFrame(l);r.render(s,cam);})();
</script></body></html>`;
fs.writeFileSync('/home/user/cm-motore/_prop.html', HTML);
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 1100, height: 640 }, deviceScaleFactor: 2 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
page.on('pageerror', e => console.log('  pageerror:', String(e).slice(0,180)));
await page.goto(`http://127.0.0.1:${port}/_prop.html`, { waitUntil:'domcontentloaded' });
await page.waitForFunction(() => window.__PRONTO !== undefined, { timeout: 60000 }).catch(()=>{});
await sleep(1500);
console.log('stato:', JSON.stringify(await page.evaluate(()=>window.__PRONTO||'niente')));
await page.screenshot({ path: '/tmp/claude-0/proporzioni.png' });
await browser.close(); await new Promise(r2=>server.close(r2));
