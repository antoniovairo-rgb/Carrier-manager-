globalThis.window={};
await import('./entry.mjs');
import fs from 'fs';
const AV=[[0,"Chiara·castani","#f0c8a0","#3a2410",0],[1,"Chiara·biondi","#f5d2b3","#dcb64c",0],[2,"Chiara·neri","#e8b890","#181410",0],[3,"Chiara·ramati","#f2cba0","#b5491f",0],[4,"Chiara·rasato","#e6bc94","#2a1c10",1],[5,"Chiara·grigi","#eec79c","#9a9a9a",0],[6,"Olivastra·neri","#c8956a","#161210",0],[7,"Olivastra·castani","#bd8a5e","#4a3018",0],[8,"Ambrata·neri","#a9743f","#120d0a",0],[9,"Ambrata·rasato","#9c6736","#120d0a",1],[10,"Scura·neri","#7c4a1e","#100a06",0],[11,"Scura·rasato","#5e3414","#100a06",1]];
let h=`<html><body style="margin:0;background:#0f172a;padding:16px;font-family:sans-serif"><div style="max-width:540px;margin:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">`;
for(const [id,lb,sk,hr,bald] of AV){
  const svg=window.DiceBear.makeAvatar('elevora-hero-'+id,{style:'avataaars',skinColor:[sk.replace('#','')],hairColor:[hr.replace('#','')],bald:!!bald,size:104});
  h+=`<div style="text-align:center"><div style="width:100%;aspect-ratio:1;border-radius:50%;overflow:hidden;background:#1e293b">${svg}</div><div style="color:#94a3b8;font-size:9px;margin-top:4px">#${id}</div></div>`;
}
h+=`</div></body></html>`;
fs.writeFileSync('/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/heroes.html',h);
console.log('ok');
