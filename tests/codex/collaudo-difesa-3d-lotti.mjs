import "./collaudo-difesa-3d-raw.mjs";
import fs from 'node:fs';import os from 'node:os';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));const path=root+'tests/codex/collaudo-difesa-3d.json';const key=r=>r.gi+':'+r.ai+':'+r.outcome;
for(let n=0;n<40;n++){
 const d=JSON.parse(fs.readFileSync(path));if(d.runs.some(r=>!r.wallMs))throw Error('Tentativo aperto: non avviare un secondo browser');
 const c=d.plan.find(c=>!d.runs.some(r=>key(r)===key(c)&&r.wallMs));if(!c){console.log('Piano interamente tentato');break;}
 if(fs.existsSync(root+'tests/codex/collaudo-difesa-3d.pause')||os.freemem()<3.5*1024**3){console.log('Pausa: RAM iniziale o segnale utente');break;}
 const code=await new Promise(resolve=>{const p=spawn(process.execPath,['tests/codex/collaudo-difesa-3d.mjs'],{cwd:root,env:{...process.env,CPM_BATCH:'1',CPM_CASES:key(c)},windowsHide:true,stdio:'inherit'});p.on('error',()=>resolve(1));p.on('exit',resolve);});
 const r=JSON.parse(fs.readFileSync(path)).runs.at(-1);if(code||r.stopReason){console.log('Interruzione tecnica: '+(r.stopReason||code));break;}
 await new Promise(resolve=>setTimeout(resolve,15000));
}
