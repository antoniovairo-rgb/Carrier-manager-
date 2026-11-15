/* [giro 213] prova minima (pagina sintetica): un tasto scalato a .9 al pointerdown perde il tocco a 3 px dal bordo; con un ::before esteso no. Uso: node prova-area-213.mjs */
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const mobile of [true, false]) for (const modo of ['scale', 'scale+before']) {
  const ctx = await b.newContext(mobile ? { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true } : { viewport: { width: 800, height: 600 } });
  const p = await ctx.newPage();
  await p.setContent(`<meta name=viewport content="width=device-width"><style>body{margin:0;padding:50px}button{width:300px;height:60px;transition:none}
  [data-p]{scale:.9} .be[data-p]{position:relative} .be[data-p]::before{content:"";position:absolute;inset:-6%}</style><div id=w><button class="${modo === 'scale+before' ? 'be' : ''}" id=b>X</button></div>
  <script>window.n=0;b.onclick=()=>n++;document.addEventListener('pointerdown',e=>{const t=e.target.closest('button');if(t)t.setAttribute('data-p','')},true);document.addEventListener('pointerup',e=>{setTimeout(()=>document.querySelectorAll('[data-p]').forEach(x=>x.removeAttribute('data-p')),50)},true)</script>`);
  const cdp = mobile ? await ctx.newCDPSession(p) : null; const r = await p.evaluate(() => { const r = b.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  const x = r.l + 3, y = r.t + r.h / 2;
  if (mobile) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await new Promise(z => setTimeout(z, 80)); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await p.mouse.move(x, y); await p.mouse.down(); await new Promise(z => setTimeout(z, 80)); await p.mouse.up(); }
  await new Promise(z => setTimeout(z, 300));
  console.log(mobile ? 'tel' : 'pc', modo, 'click al bordo:', await p.evaluate(() => n));
  await ctx.close();
}
await b.close();
