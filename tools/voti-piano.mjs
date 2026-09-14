#!/usr/bin/env node
/* [direttiva PO 15/09] «ad ogni rilascio nel macro piano aggiungi la sezione con i voti del player da cellulare, la
   differenza con il precedente ed un istogramma con la crescita/decrescita dei singoli parametri».
   Legge docs/voti/voti-telefono.json e rende la sezione (markdown fra i marcatori VOTI-INIZIO/VOTI-FINE in
   docs/MACRO-PIANO-2026-09.md, e HTML fra <!--VOTI-INIZIO--> / <!--VOTI-FINE--> nel file passato come argomento).
     node tools/voti-piano.mjs [percorso-html-artefatto]                                                          */
import fs from 'node:fs';
const D=JSON.parse(fs.readFileSync('docs/voti/voti-telefono.json','utf8'));
const S=D.schede;const ult=S[S.length-1],prev=S.length>1?S[S.length-2]:null;
const media=v=>+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(2);
const fmt=n=>String(n).replace('.',',');
const segno=d=>d>0?'+'+fmt(d):d<0?'−'+fmt(-d):'±0';
/* ---------- markdown ---------- */
const bar=v=>'█'.repeat(v)+'░'.repeat(10-v);
const dbar=d=>d>0?'▲'.repeat(d):d<0?'▼'.repeat(-d):'·';
let md=`## Voti del player da cellulare (scheda n° ${ult.n}, build ${ult.build}, ${ult.quando})\n\n`;
md+=`Soglia di collaudo: **media ≥ ${D.soglia.media}, nessuna area < ${D.soglia.minima}** (${D.soglia.nota}). `;
md+=`Media **${fmt(media(ult.voti))}**`+(prev?` (n° ${prev.n}, ${prev.build}: ${fmt(media(prev.voti))} → **${segno(+(media(ult.voti)-media(prev.voti)).toFixed(2))}**)`:'')+`; area minima **${Math.min(...ult.voti)}**. Fonte: ${ult.fonte}.\n\n`;
md+=`| # | area | ${prev?`n° ${prev.n} | `:''}**n° ${ult.n}** | Δ | istogramma (voto) | crescita / decrescita |\n|---|---|${prev?'---|':''}---|---|---|---|\n`;
D.aree.forEach((a,i)=>{const v=ult.voti[i],pv=prev?prev.voti[i]:null,d=pv==null?0:v-pv;
  md+=`| ${i+1} | ${a} | ${pv!=null?pv+' | ':''}**${v}** | ${pv==null?'—':segno(d)} | \`${bar(v)}\` ${v} | ${dbar(d)} |\n`;});
md+=`\nStorico delle medie: `+S.map(s=>`n° ${s.n} (${s.build}) **${fmt(media(s.voti))}**`).join(' · ')+'.\n';
const P='docs/MACRO-PIANO-2026-09.md';let t=fs.readFileSync(P,'utf8');
const A='<!-- VOTI-INIZIO -->',B='<!-- VOTI-FINE -->';
if(!t.includes(A)){throw new Error('marcatori VOTI mancanti nel macro piano');}
t=t.slice(0,t.indexOf(A)+A.length)+'\n'+md+'\n'+t.slice(t.indexOf(B));fs.writeFileSync(P,t);
/* ---------- html ---------- */
const H=process.argv[2];
if(H&&fs.existsSync(H)){
  let h=fs.readFileSync(H,'utf8');const HA='<!--VOTI-INIZIO-->',HB='<!--VOTI-FINE-->';
  if(!h.includes(HA))throw new Error('marcatori VOTI mancanti nell\'artefatto');
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  let x=`<h2>5 · Voti del player da cellulare — scheda n° ${ult.n} (build ${ult.build}, ${ult.quando})</h2>\n`;
  x+=`<p>Soglia di collaudo: <b>media ≥ ${D.soglia.media}, nessuna area &lt; ${D.soglia.minima}</b>. Media <b class="num">${fmt(media(ult.voti))}</b>`+(prev?` (n° ${prev.n}, ${prev.build}: <span class="num">${fmt(media(prev.voti))}</span> → <b class="num">${segno(+(media(ult.voti)-media(prev.voti)).toFixed(2))}</b>)`:'')+`; area minima <b class="num">${Math.min(...ult.voti)}</b>. Fonte: <span class="num">${esc(ult.fonte)}</span>.</p>\n`;
  x+=`<div class="voti">\n`;
  D.aree.forEach((a,i)=>{const v=ult.voti[i],pv=prev?prev.voti[i]:null,d=pv==null?0:v-pv;
    const cls=d>0?'su':d<0?'giu':'pari';
    x+=`<div class="riga"><div class="nome">${i+1}. ${esc(a)}</div><div class="barra"><div class="pieno" style="width:${v*10}%"></div><div class="soglia" style="left:${D.soglia.media*10}%"></div></div><div class="num voto">${pv!=null?`<span class="prev">${pv}</span> → `:''}<b>${v}</b></div><div class="delta ${cls}"><span class="dbar" style="width:${Math.abs(d)*18}px"></span><span class="num">${pv==null?'—':segno(d)}</span></div></div>\n`;});
  x+=`</div>\n<p class="nota">Barra = voto su 10, tacca = soglia ${D.soglia.media}. Verde/rosso = crescita/decrescita rispetto alla scheda precedente. Storico delle medie: `+S.map(s=>`n° ${s.n} (${s.build}) <b class="num">${fmt(media(s.voti))}</b>`).join(' · ')+`.</p>\n`;
  h=h.slice(0,h.indexOf(HA)+HA.length)+'\n'+x+h.slice(h.indexOf(HB));fs.writeFileSync(H,h);
}
console.log(`voti resi: scheda n° ${ult.n} media ${fmt(media(ult.voti))}`+(prev?` (n° ${prev.n} ${fmt(media(prev.voti))})`:''));
