import { createAvatar } from '@dicebear/core';
import * as col from '@dicebear/collection';
const styles = ['adventurer','avataaars','bigSmile','personas','notionists','micah','openPeeps','lorelei','thumbs','funEmoji','bigEars','miniavs'];
const seeds = ['Leo Bianchi','Fabio Lanzi','Marco Neri','Ana Silva'];
let html = '<html><body style="font-family:sans-serif;background:#0f172a;color:#fff;padding:16px;margin:0"><div style="display:grid;grid-template-columns:1fr;gap:14px;max-width:520px">';
for (const s of styles){
  if(!col[s]){ html += `<div>MISSING ${s}</div>`; continue; }
  let row = `<div style="background:#1e293b;border-radius:14px;padding:12px"><div style="font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#93c5fd;margin-bottom:8px">${s}</div><div style="display:flex;gap:10px">`;
  for (const seed of seeds){
    try{ const svg = createAvatar(col[s], { seed, size:96, radius:50 }).toString();
      row += `<div style="width:96px;height:96px;border-radius:50%;overflow:hidden;background:#334155">${svg}</div>`;
    }catch(e){ row += `<div style="font-size:9px;color:#f87171">${s}: ${String(e.message).slice(0,40)}</div>`; }
  }
  row += '</div></div>';
  html += row;
}
html += '</div></body></html>';
import fs from 'fs';
fs.writeFileSync('/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad/avatar-styles.html', html);
console.log('styles available:', styles.filter(s=>col[s]).join(', '));
