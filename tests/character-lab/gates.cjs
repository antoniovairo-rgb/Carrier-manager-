const fs=require('fs');const path=require('path');const assert=require('assert');
const dir=__dirname;const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(match[1]);
const r=JSON.parse(fs.readFileSync(path.join(dir,'evidence/validation.json')));const checks={};
for(const n of [1,22]){
 const a=r[n];checks['count-'+n]=a.players===n&&a.skinned===n;
 checks['independent-'+n]=a.independentBones&&a.independentSkeletons;
 checks['shared-'+n]=a.geometries===1&&a.materials===1;
 checks['ground-'+n]=a.records.every(p=>Math.abs(p.min[1])<1e-5);
 checks['body-'+n]=a.records.every(p=>Math.abs(p.max[1]-p.min[1]-1.8)<1e-4&&p.bones===60&&p.tri===5072);
 checks['framing-'+n]=a.records.every(p=>p.ndcMin[0]>=-1&&p.ndcMax[0]<=1&&p.ndcMin[1]>=-1&&p.ndcMax[1]<=1);
}
checks.browser=r.errors.length===0;checks.controls=Object.values(r.controls).every(Boolean);checks.responsive=r.responsive.every(x=>x.framing);
for(const [name,a] of Object.entries(r.animations))checks['penetration-'+name]=a.minY>=-.01;
fs.writeFileSync(path.join(dir,'evidence/gates.json'),JSON.stringify(checks,null,2));console.log(checks);
assert(Object.values(checks).every(Boolean),'Character lab automated gate failed; do not integrate');
