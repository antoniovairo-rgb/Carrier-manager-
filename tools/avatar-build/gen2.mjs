import { createAvatar } from '@dicebear/core';
import * as col from '@dicebear/collection';
import fs from 'fs';
const styles = ['adventurer','avataaars','micah','bigSmile','bigEars','openPeeps','lorelei','notionists','personas','miniavs','funEmoji','thumbs'];
const seeds = ['Leo Bianchi','Marco Neri','Diego Sanz','Ana Rossi','Yuki Tanaka'];
let h = `<html><body style="margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;padding:18px">
<div style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:14px">`;
for (const s of styles){
  if(!col[s]){ h+=`<div style="color:#f87171">MISSING ${s}</div>`; continue; }
  h += `<div style="background:#fff;border-radius:16px;padding:14px 16px">
    <div style="font-size:13px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#8e1f33;margin-bottom:10px">${s}</div>
    <div style="display:flex;gap:12px;justify-content:space-between">`;
  for (const seed of seeds){
    let svg=''; try{ svg = createAvatar(col[s], { seed, size:104 }).toString(); }catch(e){ svg=`<span style="font-size:8px">${e.message.slice(0,30)}</span>`; }
    h += `<div style="width:104px;height:104px;border-radius:50%;overflow:hidden;background:#eef2f7;border:2px solid #e6edf5">${svg}</div>`;
  }
  h += `</div></div>`;
}
h += `</div></body></html>`;
fs.writeFileSync('/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/styles2.html', h);
console.log('ok');
