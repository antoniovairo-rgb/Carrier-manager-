#!/usr/bin/env node
// Conserva in un unico grezzo compresso le due prove appaiate di PO-181.
import fs from 'node:fs';
import zlib from 'node:zlib';
const dir='tests/codex/';
const green=JSON.parse(fs.readFileSync(dir+'banco-europeo-181-verde-appaiato.json','utf8'));
const red=JSON.parse(fs.readFileSync(dir+'banco-europeo-181-rosso.json','utf8'));
const summary=x=>({flag:x.careers[0]?.no181Observed,steps:x.careers[0]?.steps,status:x.careers[0]?.status,trace:x.careers[0]?.euroTrace||[]});
const out={version:'7.999.105',base:'b2094979df9c6fdce4bc8c62b836cde43fac8eef',green,red};
fs.writeFileSync(dir+'banco-europeo-181-appaiato.json.gz',zlib.gzipSync(JSON.stringify(out)));
console.log(JSON.stringify({green:summary(green),red:summary(red)}));
