const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..');
const input = process.argv[2] || 'C:/Users/a.vairo/Downloads/Korward_HyperCasual_Mobile_Character_Lab_V22.html';
const label = process.argv[3] || 'baseline';
const out = path.join(__dirname, 'evidence');
fs.mkdirSync(out, {recursive:true});
let html = fs.readFileSync(input, 'utf8').replaceAll('https://cdn.jsdelivr.net/npm/three@0.128.0/', '/three/');
if(!html.includes('window.lab=')) html = html.replace('requestAnimationFrame(loop); updateStats(); loadEmbedded();', 'window.lab={scene,camera,renderer,get players(){return players},setPlayers,frameHero}; requestAnimationFrame(loop); updateStats(); loadEmbedded();');
const server = http.createServer((req,res)=>{
  if(req.url === '/') {res.setHeader('Content-Type','text/html');res.end(html);return;}
  const file = req.url.startsWith('/three/') ? path.join(__dirname,'node_modules/three',req.url.slice(7)) : path.join(path.dirname(path.resolve(input)),req.url);
  if(!file.startsWith(root)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.end(fs.readFileSync(file));
});
async function inspect(page) {
  return page.evaluate(()=>{
    const {scene,camera,renderer,players}=lab; scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    const skeletons=[], geometries=new Set(), materials=new Set(), records=[];
    for(const p of players){
      const b=new THREE.Box3(), projected=new THREE.Box3();let tri=0,bones=0;
      p.traverse(o=>{if(!o.isSkinnedMesh)return;skeletons.push(o.skeleton);o.skeleton.update();bones+=o.skeleton.bones.length;
        geometries.add(o.geometry);materials.add(o.material);tri+=o.geometry.index.count/3;
        for(let i=0;i<o.geometry.attributes.position.count;i++){
          const v=new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.position,i);
          o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);b.expandByPoint(v);projected.expandByPoint(v.clone().project(camera));
        }
      });
      records.push({min:b.min.toArray(),max:b.max.toArray(),ndcMin:projected.min.toArray(),ndcMax:projected.max.toArray(),tri,bones});
    }
    const allBones=skeletons.flatMap(s=>s.bones);
    return {players:players.length,skinned:skeletons.length,independentSkeletons:new Set(skeletons).size===players.length,
      independentBones:new Set(allBones).size===allBones.length,geometries:geometries.size,materials:materials.size,
      calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,memory:renderer.info.memory,
      heap:performance.memory?.usedJSHeapSize,cpuSubmissionMs:lab.frameMetrics?.slice(-120),gpuTimerSupported:!!renderer.getContext().getExtension('EXT_disjoint_timer_query_webgl2'),unmaskedRenderer:(()=>{const gl=renderer.getContext(),e=gl.getExtension('WEBGL_debug_renderer_info');return e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):null})(),renderer:renderer.getContext().getParameter(renderer.getContext().RENDERER),records};
  });
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE || (fs.existsSync('C:/Users/a.vairo/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe')?'C:/Users/a.vairo/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe':undefined),args:['--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>window.lab?.players.length===1);
  const report={input,viewport:'390x844',device:'Windows headless Chromium; not physical mobile',errors};
  for(const n of [1,22]){
   await page.evaluate(n=>lab.setPlayers(n),n);
   report[n]=await inspect(page);
   report[n].timing=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last;function tick(t){if(last)times.push(t-last);last=t;if(times.length<120)requestAnimationFrame(tick);else{const sorted=[...times].sort((a,b)=>a-b);const mean=times.reduce((a,b)=>a+b)/times.length;resolve({frames:times.length,meanMs:mean,p95Ms:sorted[Math.floor(sorted.length*.95)],fps:1000/mean});}}requestAnimationFrame(tick);}));
   report[n].cpuSubmissionMs=await page.evaluate(()=>lab.frameMetrics?.slice(-120));
   await page.screenshot({path:path.join(out,`${label}-${n}.png`)});
  }
  if(label==='validation'){
   report.animations={};const sheets=[];
   await page.evaluate(()=>lab.setPlayers(1));
   const clips=await page.evaluate(()=>lab.clips.map(c=>({name:c.name,duration:c.duration})));
   for(const clip of clips){
    const records=[];
    for(let i=0;i<=60;i++){
     await page.evaluate(({name,time})=>lab.sample(name,time),{name:clip.name,time:clip.duration*i/60});
     records.push((await inspect(page)).records[0]);
     if([0,15,30,45].includes(i)){
      const shot=await page.screenshot();fs.writeFileSync(path.join(out,clip.name+'-'+i+'.png'),shot);
      sheets.push({label:clip.name+' '+(clip.duration*i/60).toFixed(2)+'s',image:shot.toString('base64')});
     }
    }
    report.animations[clip.name]={duration:clip.duration,minY:Math.min(...records.map(r=>r.min[1])),maxHeight:Math.max(...records.map(r=>r.max[1]-r.min[1])),records};
   }
   report.animatedPerformance={};
   for(const count of [1,22]){
    await page.evaluate(count=>{lab.setPlayers(count);lab.setAnimation('jog');document.getElementById('pause').click()},count);
    report.animatedPerformance[count]=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last;function step(t){if(last)times.push(t-last);last=t;if(times.length<180)requestAnimationFrame(step);else{const mean=times.reduce((a,b)=>a+b)/times.length;resolve({frames:times.length,fps:1000/mean,meanMs:mean,cpuSubmissionMs:lab.frameMetrics.slice(-120),calls:lab.renderer.info.render.calls,triangles:lab.renderer.info.render.triangles,heap:performance.memory?.usedJSHeapSize})}}requestAnimationFrame(step)}));
    await page.evaluate(()=>lab.sample('rest',0));
   }
   report.controls={};await page.evaluate(()=>lab.setPlayers(1));
   await page.locator('#toggle').click();
   const before=await page.evaluate(()=>lab.camera.position.toArray());await page.locator('#minus').click();
   report.controls.zoom=await page.evaluate(before=>lab.camera.position.toArray().some((v,i)=>Math.abs(v-before[i])>.01),before);
   await page.locator('#frame').click();await page.locator('#toggle').click();
   const old=await page.evaluate(()=>lab.camera.position.toArray());await page.mouse.move(170,380);await page.mouse.down();await page.mouse.move(220,390,{steps:5});await page.mouse.up();
   report.controls.rotate=await page.evaluate(old=>lab.camera.position.toArray().some((v,i)=>Math.abs(v-old[i])>.01),old);
   const cdp=await page.context().newCDPSession(page);
   const touchBefore=await page.evaluate(()=>lab.camera.position.toArray());
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:380}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:210,y:380}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   report.controls.touchRotate=await page.evaluate(before=>lab.camera.position.toArray().some((v,i)=>Math.abs(v-before[i])>.01),touchBefore);
   const pinchBefore=await page.evaluate(()=>lab.camera.position.toArray());
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:140,y:400},{x:240,y:400}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:110,y:400},{x:270,y:400}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   report.controls.pinchZoom=await page.evaluate(before=>lab.camera.position.toArray().some((v,i)=>Math.abs(v-before[i])>.01),pinchBefore);
   await cdp.detach();
   report.responsive=[];
   for(const viewport of [{width:320,height:568},{width:430,height:932},{width:1280,height:800}]){
    await page.setViewportSize(viewport);await page.evaluate(()=>lab.setPlayers(22));const result=await inspect(page);
    report.responsive.push({viewport,framing:result.records.every(p=>p.ndcMin[0]>=-1&&p.ndcMax[0]<=1&&p.ndcMin[1]>=-1&&p.ndcMax[1]<=1)});
   }
   const sheet=await browser.newPage({viewport:{width:1200,height:2100},deviceScaleFactor:1});
   await sheet.setContent('<body style="margin:0;background:#06101f;color:white;font:16px Arial;display:grid;grid-template-columns:repeat(4,1fr)">'+sheets.map(x=>'<div style="text-align:center">'+x.label+'<img style="display:block;width:100%;height:390px;object-fit:contain" src="data:image/png;base64,'+x.image+'"></div>').join('')+'</body>');
   await sheet.screenshot({path:path.join(out,'animation-sheet.png'),fullPage:true});await sheet.close();
  }
  fs.writeFileSync(path.join(out,label+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({errors,hero:report[1].timing,team:report[22].timing,framing: [1,22].map(n=>({players:n,pass:report[n].records.every(p=>p.ndcMin[0]>=-1&&p.ndcMax[0]<=1&&p.ndcMin[1]>=-1&&p.ndcMax[1]<=1)}))},null,2));
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
