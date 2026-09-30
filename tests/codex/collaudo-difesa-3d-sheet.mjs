import "./collaudo-difesa-3d-raw.mjs";
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(new URL('../visual/package.json',import.meta.url));const {PNG}=require('pngjs');
const d=JSON.parse(fs.readFileSync('tests/codex/collaudo-difesa-3d.json'));
for(const r of d.runs.filter(r=>r.sixFrames&&!r.error)){
 const target=`reports/codex/collaudo-difesa-3d/gi${r.gi}-a${r.ai}-${r.outcome}${r.methodVersion===2?"-v2":""}${r.captureTag?"-"+r.captureTag:""}-sheet.png`;
 if(fs.existsSync(target)&&fs.statSync(target).mtimeMs>=Math.max(...r.frames.map(f=>fs.statSync(f.png).mtimeMs)))continue;
 const sheet=new PNG({width:618,height:916});sheet.data.fill(255);
 for(let n=0;n<r.frames.length;n++){const p=PNG.sync.read(fs.readFileSync(r.frames[n].png));for(let y=0;y<458;y++)for(let x=0;x<206;x++){
  const from=(Math.min(p.height-1,Math.floor(y*p.height/458))*p.width+Math.floor(x*p.width/206))*4;
  const to=((Math.floor(n/3)*458+y)*618+(n%3)*206+x)*4;p.data.copy(sheet.data,to,from,from+4);
 }}
 fs.writeFileSync(target,PNG.sync.write(sheet));console.log(target);
}
