/* IL VISO VIENE DALLA LIBRERIA — anteprima del concetto, non della resa finale.
   Domanda del PO: «poca personalizzazione, ad esempio dei visi, capelli; il cartoon era
   un'idea per renderlo coerente con la libreria dei visi SVG».
   Misurato: il CH38 ha UN viso solo, cotto nel modello, uguale per tutti e 22.
   Qui tre corpi identici prendono TRE visi diversi dal generatore DiceBear che il gioco
   gia' usa per gli avatar 2D — lo stesso che compare nel festeggiamento 7.942.
   ONESTA' DELL'ANTEPRIMA: il viso e' un disco appoggiato davanti alla testa, non una
   texture mappata sul cranio. Serve a mostrare COSA vuol dire «ventidue facce diverse»,
   non come verrebbe su un modello cartoon vero (li' il viso sarebbe la texture del cranio). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const HTML = `<!doctype html><html><head><meta charset=utf-8><style>
html,body{margin:0;background:#0d1b12;font:400 15px system-ui,sans-serif;color:#dfe9e0}
#c{display:block;width:1100px;height:600px}
.r{display:flex;width:1100px}.r div{flex:1;text-align:center;padding:10px 0}
.t{font-weight:700;letter-spacing:.06em;font-size:14px}.u{font-size:12px;opacity:.62;margin-top:3px}
</style></head><body>
<div class=r><div><div class=t>GIOCATORE 1</div><div class=u>viso dalla libreria</div></div>
<div><div class=t>GIOCATORE 2</div><div class=u>viso dalla libreria</div></div>
<div><div class=t>GIOCATORE 3</div><div class=u>viso dalla libreria</div></div></div>
<canvas id=c></canvas>
<script src="/assets/dicebear-avatars.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js"></script>
<script>
const T=THREE, ALT=1.78, PASSO=1.15, VIS=2.15, FOV=32;
const r=new T.WebGLRenderer({canvas:document.getElementById('c'),antialias:true,alpha:false});
r.setPixelRatio(2); r.setSize(1100,600,false); r.setClearColor(0x16281c);
const s=new T.Scene();
s.add(new T.HemisphereLight(0xffffff,0x2d3f26,0.95));
const d=new T.DirectionalLight(0xfff3e0,1.0); d.position.set(2.2,3.6,3.2); s.add(d);
s.add(new T.Mesh(new T.PlaneGeometry(40,40).rotateX(-Math.PI/2),new T.MeshLambertMaterial({color:0x2f6b33})));
const cam=new T.PerspectiveCamera(FOV,1100/600,0.05,100);
const dist=(VIS/2)/Math.tan(FOV*Math.PI/360);
cam.position.set(0,ALT*0.52,dist); cam.lookAt(0,ALT*0.50,0);
const SEMI=['elevora-hero-3','elevora-hero-11','elevora-hero-27'];
function svgATextura(svg){return new Promise((ok,ko)=>{
  const im=new Image();
  im.onload=()=>{const cv=document.createElement('canvas');cv.width=cv.height=256;
    const g=cv.getContext('2d');
    g.save();g.beginPath();g.arc(128,128,126,0,Math.PI*2);g.clip();   /* disco, come gli avatar 2D */
    g.drawImage(im,0,0,256,256);g.restore();
    const t=new T.CanvasTexture(cv);t.needsUpdate=true;ok(t);};
  im.onerror=(e)=>ko(e);
  im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});}
(async()=>{
 const esito={dicebear:!!(window.DiceBear&&window.DiceBear.makeAvatar),visi:0,teste:0,errore:null};
 try{
  const gl=await new Promise((ok,ko)=>new T.GLTFLoader().load('/assets/footballer-uno.glb',ok,undefined,ko));
  for(let i=0;i<3;i++){
    const o=T.SkeletonUtils.clone(gl.scene);
    o.position.x=(i-1)*PASSO; o.rotation.y=0; s.add(o); o.updateMatrixWorld(true);
    let testa=null; o.traverse((n)=>{if(n.isBone&&/head$/i.test(n.name||''))testa=n;});
    if(!testa)continue; esito.teste++;
    const svg=window.DiceBear.makeAvatar(SEMI[i],{size:256,style:'avataaars'});
    if(!svg)continue;
    const tex=await svgATextura(svg);
    const pos=new T.Vector3(); testa.getWorldPosition(pos);
    const pl=new T.Mesh(new T.PlaneGeometry(0.34,0.34),
      new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false}));
    pl.renderOrder=10;
    pl.position.set(pos.x,pos.y+0.045,pos.z+0.14);   /* davanti alla testa, verso la camera */
    s.add(pl); esito.visi++;
  }
 }catch(e){esito.errore=String(e).slice(0,200);}
 window.__PRONTO=esito;
})();
(function l(){requestAnimationFrame(l);r.render(s,cam);})();
</script></body></html>`;
fs.writeFileSync('/home/user/cm-motore/_visi.html', HTML);
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport:{width:1100,height:680}, deviceScaleFactor:2 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
page.on('pageerror', e => console.log('  pageerror:', String(e).slice(0,180)));
await page.goto(`http://127.0.0.1:${port}/_visi.html`, { waitUntil:'domcontentloaded' });
await page.waitForFunction(() => window.__PRONTO !== undefined, { timeout:60000 }).catch(()=>{});
await sleep(1500);
console.log('stato:', JSON.stringify(await page.evaluate(()=>window.__PRONTO||'niente')));
await page.screenshot({ path:'/tmp/claude-0/visi-libreria.png' });
await browser.close(); await new Promise(r2=>server.close(r2));
