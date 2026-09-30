import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const scripts=fs.readdirSync(root+'tests/codex').filter(f=>f.startsWith('highlight-mirato')&&f.endsWith('.mjs'));
const rows=[];
for(const args of [...scripts.map(f=>['--check','tests/codex/'+f]),['tools/build-src.mjs','--check']]){
 const start=Date.now();let stdout='',stderr='',code=0;
 try{stdout=execFileSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});}catch(e){stdout=String(e.stdout||'');stderr=String(e.stderr||e.message);code=e.status??1;}
 rows.push({command:'node '+args.join(' '),durationMs:Date.now()-start,code,stdout,stderr});
}
const notes=JSON.parse(fs.readFileSync(root+'reports/codex/highlight-mirato/review-v2.json'));
const missing=[];for(const [key,n]of Object.entries(notes))for(const p of n.evidence||[])if(!fs.existsSync(root+(p.startsWith('reports/')?p:'reports/codex/highlight-mirato/'+p)))missing.push({key,path:p});
const reportPath=root+'reports/codex/2026-09-30-collaudo-highlight.md';
const missingLinks=[];for(const match of fs.readFileSync(reportPath,'utf8').matchAll(/\]\(([^)]+)\)/g)){const p=match[1];if(!p.startsWith('http')&&!p.startsWith('#')&&!fs.existsSync(path.resolve(path.dirname(reportPath),p)))missingLinks.push(p);}
const result={missingLinks,command:'node tests/codex/highlight-mirato-checks.mjs',rows,missingEvidence:missing};
fs.writeFileSync(root+'reports/codex/highlight-mirato/checks.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));if(rows.some(r=>r.code)||missing.length||missingLinks.length)process.exitCode=1;
