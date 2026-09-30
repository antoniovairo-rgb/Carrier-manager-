import fs from 'node:fs';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const file=root+'tests/codex/highlight-mirato.json';
const pause=root+'tests/codex/collaudo-highlight.pause';
const count=()=>{const d=JSON.parse(fs.readFileSync(file));return new Set(d.runs.filter(r=>r.methodVersion===2&&r.sixFrames&&r.outcomeMatched&&r.exitSeen&&!r.error&&r.wallMs).map(r=>r.gi+':'+r.ai+':'+r.outcome)).size;};
const limit=Number(process.env.CPM_TOTAL_BATCH||30);
for(let i=0;i<limit;i++){
 if(fs.existsSync(pause)||count()>=32)break;
 if(os.freemem()<3.5*1024**3){console.log('Memoria iniziale insufficiente: stop');break;}
 const before=count();
 const code=await new Promise(resolve=>{const child=spawn(process.execPath,['tests/codex/highlight-mirato-v2.mjs'],{cwd:root,env:{...process.env,CPM_BATCH:'1',CPM_CASES:''},stdio:'inherit',windowsHide:true});child.on('error',()=>resolve(1));child.on('exit',resolve);});
 if(code||count()===before){console.log('Lotto senza avanzamento: stop');break;}
 await new Promise(resolve=>setTimeout(resolve,20000));
}
console.log('Casi acquisiti:',count());
