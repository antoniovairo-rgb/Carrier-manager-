import fs from 'node:fs';import os from 'node:os';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));const cp=root+'tests/codex/highlight-mirato.json';const load=()=>JSON.parse(fs.readFileSync(cp));const key=r=>r.gi+':'+r.ai+':'+r.outcome;const tag='apertura';
const audit=JSON.parse(fs.readFileSync(root+'reports/codex/highlight-mirato/audit-v2.json'));if(audit.complete!==audit.planned)throw Error('Completare prima il campione pianificato');
const history=root+'reports/codex/highlight-mirato/review-before-apertura.json';if(!fs.existsSync(history))fs.copyFileSync(root+'reports/codex/highlight-mirato/review-v2.json',history);
const keys=[...new Set(audit.blackOpening.map(r=>r.key))];
for(const k of keys){if(load().runs.some(r=>r.captureTag===tag&&key(r)===k&&r.wallMs&&r.sixFrames&&r.outcomeMatched&&r.exitSeen&&!r.error))continue;
 if(load().runs.some(r=>!r.wallMs))throw Error('Acquisizione già in corso');if(fs.existsSync(root+'tests/codex/collaudo-highlight.pause')||os.freemem()<3.5*1024**3){console.log('Pausa o RAM iniziale insufficiente');break;}
 const code=await new Promise(resolve=>{const child=spawn(process.execPath,['tests/codex/highlight-mirato-v2.mjs'],{cwd:root,env:{...process.env,CPM_BATCH:'1',CPM_CASES:k,CPM_CAPTURE_TAG:tag},stdio:'inherit',windowsHide:true});child.on('error',()=>resolve(1));child.on('exit',resolve);});
 const r=load().runs.at(-1);if(code||r.error||!r.sixFrames||!r.outcomeMatched||!r.exitSeen){console.log('Controprova incompleta: stop');break;}await new Promise(resolve=>setTimeout(resolve,20000));
}
console.log('Controprove chiuse:',load().runs.filter(r=>r.captureTag===tag&&!r.error&&r.wallMs&&r.sixFrames).length);
