/* QUANTE TINTE HA IL GIOCO — statico, sola lettura.
   La terza ondata di C4 non serve a «usare i token per principio»: con un tema solo la sostituzione
   sarebbe neutra e non cambierebbe niente a schermo. Serve a RIDURRE LA TAVOLOZZA: 2.921 esadecimali
   scritti a mano vogliono dire decine di grigi quasi uguali, e un'interfaccia con quaranta grigi non
   sembra un sistema. Qui si conta quante tinte DISTINTE esistono e quante sono a un passo da un colore
   del tema — cioe' quante si possono unificare senza che si veda la differenza. */
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const boot=fs.readFileSync(path.join(ROOT,'src','01-bootstrap-tema-avatar.jsx'),'utf8');
const iL=boot.indexOf('let TH = {'), iD=boot.indexOf('const TH_DARK=');
const TEMA={}; { const re=/([a-zA-Z0-9_]+)\s*:\s*"(#[0-9a-fA-F]{6})"/g; let m;
  const blocco=boot.slice(iL,iD); while((m=re.exec(blocco)))if(!TEMA[m[2].toLowerCase()])TEMA[m[2].toLowerCase()]=m[1]; }
const rgb=(h)=>{h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [0,2,4].map(i=>parseInt(h.substr(i,2),16));};
const dist=(a,b)=>{const x=rgb(a),y=rgb(b);return Math.sqrt((x[0]-y[0])**2+(x[1]-y[1])**2+(x[2]-y[2])**2);};
const usi={};
for(const f of fs.readdirSync(path.join(ROOT,'src')).filter(x=>/^\d\d-.*\.jsx$/.test(x))){
  if(f.startsWith('01-'))continue;
  for(const r of fs.readFileSync(path.join(ROOT,'src',f),'utf8').split('\n')){
    const s=r.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/,'');
    for(const h of (s.match(/#[0-9a-fA-F]{6}\b/g)||[])){const k=h.toLowerCase();usi[k]=(usi[k]|0)+1;}}}
const tinte=Object.entries(usi).sort((a,b)=>b[1]-a[1]);
const tot=tinte.reduce((s,r)=>s+r[1],0);
const chiaviTema=Object.keys(TEMA);
const vicine=[]; let esatte=0, esattiUsi=0;
for(const [h,n] of tinte){
  if(TEMA[h]){esatte++;esattiUsi+=n;continue;}
  let best=null,bd=1e9;
  for(const t of chiaviTema){const d=dist(h,t);if(d<bd){bd=d;best=t;}}
  vicine.push({h,n,best,d:bd});
}
const soglie=[6,10,16,24,32];
console.log(`\n=== LA TAVOLOZZA DEL GIOCO ===`);
console.log(`  tinte DISTINTE scritte a mano: ${tinte.length} · usi totali: ${tot}`);
console.log(`  colori del tema: ${chiaviTema.length}`);
console.log(`  gia' IDENTICHE a un colore del tema: ${esatte} tinte (${esattiUsi} usi)\n`);
console.log('  a che distanza stanno le altre dal colore del tema piu\' vicino:');
for(const s of soglie){const g=vicine.filter(v=>v.d<=s);
  console.log(`    entro ${String(s).padStart(2)} (su 441 max): ${String(g.length).padStart(4)} tinte · ${String(g.reduce((a,v)=>a+v.n,0)).padStart(4)} usi`);}
console.log('\n  le dodici tinte a mano piu\' usate, e quanto distano dal tema:');
for(const v of vicine.slice(0,12))console.log(`    ${v.h} x${String(v.n).padStart(3)}  → TH.${v.best} a distanza ${v.d.toFixed(0)}`);
