import fs from 'node:fs';import {gzipSync,gunzipSync} from 'node:zlib';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));const cp=root+'tests/codex/highlight-mirato.json';const target='reports/codex/highlight-mirato/samples.json.gz';
const d=JSON.parse(fs.readFileSync(cp));if(d.runs.some(r=>!r.wallMs))throw Error('Esiste un tentativo ancora aperto: compressione annullata');
const previous=fs.existsSync(root+target)?JSON.parse(gunzipSync(fs.readFileSync(root+target))):[];
const all=new Map(previous.map(r=>[r.startedAt,r]));for(const r of d.runs)if(Array.isArray(r.samples))all.set(r.startedAt,{startedAt:r.startedAt,gi:r.gi,ai:r.ai,outcome:r.outcome,methodVersion:r.methodVersion||1,samples:r.samples});
const text=JSON.stringify([...all.values()]);const gz=gzipSync(text);if(gunzipSync(gz).toString()!==text)throw Error('Verifica compressione fallita');fs.writeFileSync(root+target,gz);
for(const r of d.runs)if(Array.isArray(r.samples)){r.samplesCount=r.samples.length;r.samplesArchive=target;r.samplesArchiveKey=r.startedAt;delete r.samples;}
fs.writeFileSync(cp,JSON.stringify(d,null,2));const result={command:'node tests/codex/highlight-mirato-pack.mjs',archive:target,rawBytes:Buffer.byteLength(text),compressedBytes:gz.length,attempts:all.size};fs.writeFileSync(root+'reports/codex/highlight-mirato/pack.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
