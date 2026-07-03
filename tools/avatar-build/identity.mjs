import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import fs from 'fs';
const AV = [
 {id:0,label:"Chiara · castani",skin:"#f0c8a0",hair:"#3a2410",style:"short"},
 {id:1,label:"Chiara · biondi",skin:"#f5d2b3",hair:"#dcb64c",style:"short"},
 {id:2,label:"Chiara · neri",skin:"#e8b890",hair:"#181410",style:"short"},
 {id:3,label:"Chiara · ramati",skin:"#f2cba0",hair:"#b5491f",style:"short"},
 {id:4,label:"Chiara · rasato",skin:"#e6bc94",hair:"#2a1c10",style:"bald"},
 {id:5,label:"Chiara · grigi",skin:"#eec79c",hair:"#9a9a9a",style:"short"},
 {id:6,label:"Olivastra · neri",skin:"#c8956a",hair:"#161210",style:"short"},
 {id:7,label:"Olivastra · castani",skin:"#bd8a5e",hair:"#4a3018",style:"short"},
 {id:8,label:"Ambrata · neri",skin:"#a9743f",hair:"#120d0a",style:"short"},
 {id:9,label:"Ambrata · rasato",skin:"#9c6736",hair:"#120d0a",style:"bald"},
 {id:10,label:"Scura · neri",skin:"#7c4a1e",hair:"#100a06",style:"short"},
 {id:11,label:"Scura · rasato",skin:"#5e3414",hair:"#100a06",style:"bald"},
];
let h=`<html><body style="margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;padding:16px"><div style="max-width:540px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:12px">`;
for(const a of AV){
  const svg=createAvatar(adventurer,{seed:'elevora-hero-'+a.id,size:88,skinColor:[a.skin.replace('#','')],hairColor:[a.hair.replace('#','')],hairProbability:a.style==='bald'?0:100}).toString();
  h+=`<div style="background:#1e293b;border-radius:14px;padding:10px;display:flex;align-items:center;gap:10px">
    <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;background:#0f172a;flex-shrink:0">${svg}</div>
    <div style="min-width:0"><div style="color:#f1f5f9;font-size:11px;font-weight:700">#${a.id} ${a.label}</div>
      <div style="display:flex;gap:6px;margin-top:5px;align-items:center">
        <span style="width:16px;height:16px;border-radius:4px;background:${a.skin};border:1px solid #334155"></span>
        <span style="color:#94a3b8;font-size:9px;font-family:monospace">${a.skin}</span>
        <span style="width:16px;height:16px;border-radius:4px;background:${a.hair};border:1px solid #334155"></span>
        <span style="color:#94a3b8;font-size:9px;font-family:monospace">${a.hair}</span>
      </div>
      <div style="color:#64748b;font-size:8px;margin-top:3px">stessi hex del CH38 in partita</div>
    </div></div>`;
}
h+=`</div></body></html>`;
fs.writeFileSync('/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/identity.html',h);
console.log('ok');
