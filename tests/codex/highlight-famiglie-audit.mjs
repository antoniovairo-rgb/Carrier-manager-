import "./highlight-famiglie-raw.mjs";
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const raw=JSON.parse(fs.readFileSync(path.join(root,'tests/codex/highlight-famiglie.json'),'utf8'));
const reviewPath=path.join(root,'reports/codex/highlight-famiglie/review.json');
const reviews=fs.existsSync(reviewPath)?JSON.parse(fs.readFileSync(reviewPath,'utf8')):{};
const key=r=>`${r.gi}:${r.ai}:${r.outcome}`;
const latest=new Map();
for(const r of raw.runs)latest.set(key(r),r);
const cases=raw.plan.map(c=>{
  const r=latest.get(key(c));
  const review=reviews[key(c)];
  const frames=r?.frames||[];
  const missingFrames=frames.filter(f=>!fs.existsSync(path.join(root,f.png))).map(f=>f.png);
  return {key:key(c),gi:c.gi,action:c.label,outcome:c.outcome,attempts:raw.runs.filter(a=>key(a)===key(c)).length,
    acquired:!!r,valid:!!r?.valid,outcomeMatched:!!r?.outcomeMatched,frames:frames.length,missingFrames,
    reviewed:!!review&&review.startedAt===r?.startedAt,codes:review?.codes||[],stopReason:r?.stopReason||null,error:r?.error||null};
});
const summary={versione:raw.versione,baseCommit:raw.baseCommit,planned:cases.length,attempts:raw.runs.length,
  acquired:cases.filter(c=>c.acquired).length,valid:cases.filter(c=>c.valid).length,
  invalid:cases.filter(c=>c.acquired&&!c.valid).length,reviewed:cases.filter(c=>c.reviewed).length,
  images:cases.reduce((n,c)=>n+c.frames,0),missingImages:cases.flatMap(c=>c.missingFrames).length};
const audit={comando:'node tests/codex/highlight-famiglie-audit.mjs',summary,cases};
const dest=path.join(root,'reports/codex/highlight-famiglie/audit.json');
fs.writeFileSync(dest,JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(summary));
