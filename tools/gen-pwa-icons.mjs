// Genera i file PNG statici delle icone PWA a partire dalla STESSA funzione mkIcon
// dell'HTML (fedeltà 1:1 col brand). Output: icon-192.png / icon-512.png / icon-maskable-512.png
// nella root del repo. Serviti da GitHub Pages come URL reali → WebAPK-compatibili (fix install Android).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHROME = process.env.CPM_CHROME || undefined;

// mkIcon: copia VERBATIM dal blocco <head> di CARRIER-MANAGER-AV.html (F-1).
// Se cambi mkIcon nell'HTML, rigenera con: node tools/gen-pwa-icons.mjs
function mkIconSrc() {
  return `function mkIcon(sz){
    var cv=document.createElement('canvas');cv.width=cv.height=sz;
    var ctx=cv.getContext('2d'),u=sz/100;
    var g=ctx.createLinearGradient(0,0,sz,sz);g.addColorStop(0,'#a3263a');g.addColorStop(0.5,'#7a1224');g.addColorStop(1,'#5e0f1d');
    ctx.fillStyle=g;ctx.fillRect(0,0,sz,sz);
    var rg=ctx.createRadialGradient(sz*0.5,sz*0.42,sz*0.04,sz*0.5,sz*0.52,sz*0.7);
    rg.addColorStop(0,'rgba(255,214,170,0.17)');rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rg;ctx.fillRect(0,0,sz,sz);
    ctx.save();ctx.translate(50*u,50*u);ctx.scale(0.92,0.92);ctx.translate(-51.75*u,-38.5*u);/* [7.338.0] marchio al 61,6% del lato (era 53,6): l'icona sul telefono era troppo piccola */
    ctx.fillStyle='#fff';
    var base=72*u;
    function bar(x,top){var w=15*u,rad=7*u,y=top,h=base-top;
      if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x,y,w,h,rad);ctx.fill();}
      else ctx.fillRect(x,y,w,h);}
    bar(24*u,46*u);bar(43*u,36*u);bar(62*u,24*u);
    var bx=69.5*u,by=15*u,R=10*u,dk='#1e293b';
    ctx.beginPath();ctx.arc(bx,by,R,0,6.283);ctx.fillStyle='#fff';ctx.fill();
    ctx.lineWidth=R*0.13;ctx.strokeStyle=dk;ctx.lineCap='round';ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(bx,by,R,0,6.283);ctx.clip();ctx.fillStyle=dk;
    function pent(pts){ctx.beginPath();for(var i=0;i<pts.length;i++){var x=pts[i][0]*u,y=pts[i][1]*u;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();}
    pent([[69.5,11.6],[72.73,13.95],[71.5,17.75],[67.5,17.75],[66.27,13.95]]);
    pent([[73.44,9.58],[72.24,5.89],[75.38,3.61],[78.52,5.89],[77.32,9.58]]);
    pent([[75.87,17.07],[79.01,14.79],[82.15,17.07],[80.95,20.76],[77.07,20.76]]);
    pent([[69.5,21.7],[72.64,23.98],[71.44,27.67],[67.56,27.67],[66.36,23.98]]);
    pent([[63.13,17.07],[61.93,20.76],[58.05,20.76],[56.85,17.07],[59.99,14.79]]);
    pent([[65.56,9.58],[61.68,9.58],[60.48,5.89],[63.62,3.61],[66.76,5.89]]);
    ctx.restore();
    ctx.restore();
    return cv.toDataURL('image/png');
  }`;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
const icons = await page.evaluate((src) => {
  eval(src);
  return { i192: mkIcon(192), i512: mkIcon(512) };
}, mkIconSrc());
await browser.close();

function saveDataUrl(dataUrl, file) {
  const b64 = dataUrl.split(',')[1];
  fs.writeFileSync(path.join(ROOT, file), Buffer.from(b64, 'base64'));
  console.log('wrote', file, fs.statSync(path.join(ROOT, file)).size, 'bytes');
}
saveDataUrl(icons.i192, 'icon-192.png');
saveDataUrl(icons.i512, 'icon-512.png');
// maskable = stessa icona full-bleed (il contenuto è già dentro la safe-zone in mkIcon)
saveDataUrl(icons.i512, 'icon-maskable-512.png');
console.log('done');
