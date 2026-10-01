#!/usr/bin/env node
/* [G8.2] L'INCHIOSTRO SULLA TESTATA DEL CLUB — statico, sola lettura, niente browser.
   La testata dell'eroe scrive sul colore del club. Finche' il fondo era una SFUMATURA il difetto
   era invisibile al metro: la griglia mobile ESCLUDE dal conto del contrasto ogni nodo il cui fondo
   e' un gradiente, perche' non si puo' leggere un rapporto da un fondo che cambia sotto la riga.
   Qui si prendono TUTTI i club del gioco e si misura, club per club:
     · quanto fa il BIANCO (quello che il gioco usa oggi) sul colore della squadra;
     · quanto fa l'inchiostro scelto da inkSu945 (bianco o #0f172a, quello che vince).
   Uso: node tests/visual/inchiostro-club.mjs   ·   esce 1 se l'inchiostro scelto scende sotto 4,5. */
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const src=fs.readFileSync(path.join(ROOT,'src','02-club-leghe-albo.jsx'),'utf8');
const re=/mkT\("([^"]*)","([^"]*)","([^"]*)",(\d+),"(#[0-9a-fA-F]{3,6})","(#[0-9a-fA-F]{3,6})"/g;
const clubs=[]; let m; while((m=re.exec(src)))clubs.push({id:m[1],n:m[2],a:m[3],c:m[5],c2:m[6]});
const lum=h=>{h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255);
  const f=c=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);
  return 0.2126*f(v[0])+0.7152*f(v[1])+0.0722*f(v[2]);};
const rap=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
const SOGLIA=4.5;
let pegBianco={r:99},pegScelto={r:99},sottoBianco=0,sottoScelto=0;
const elenco=[];
for(const c of clubs){
  const rb=rap('#ffffff',c.c), rn=rap('#0f172a',c.c);
  const ink=rb>=rn?'#ffffff':'#0f172a', rs=Math.max(rb,rn);
  if(rb<SOGLIA)sottoBianco++;
  if(rs<SOGLIA)sottoScelto++;
  if(rb<pegBianco.r)pegBianco={r:rb,c};
  if(rs<pegScelto.r)pegScelto={r:rs,c,ink};
  elenco.push({c,rb,rs,ink});
}
console.log('\n=== L\'INCHIOSTRO SULLA TESTATA COL COLORE DEL CLUB ===');
console.log('  club nel gioco: '+clubs.length);
console.log('  OGGI (bianco sempre):  sotto 4,5:1 -> '+sottoBianco+' club · peggiore '+pegBianco.r.toFixed(2)+':1 ('+pegBianco.c.n+' '+pegBianco.c.c+')');
console.log('  inkSu945 (per contrasto): sotto 4,5:1 -> '+sottoScelto+' club · peggiore '+pegScelto.r.toFixed(2)+':1 ('+pegScelto.c.n+' '+pegScelto.c.c+' con '+pegScelto.ink+')');
const peggiori=elenco.filter(e=>e.rb<SOGLIA).sort((a,b)=>a.rb-b.rb).slice(0,12);
if(peggiori.length){console.log('\n  i club dove il bianco NON si legge (i 12 peggiori):');
  peggiori.forEach(e=>console.log('    '+e.c.a.padEnd(4)+' '+e.c.n.padEnd(22)+e.c.c+'  bianco '+e.rb.toFixed(2)+':1  ->  '+e.ink+' '+e.rs.toFixed(2)+':1'));}
/* IL VELO. Il testo secondario della testata non e' l'inchiostro pieno ma un velo (rgba a q).
   Un velo COMPOSTO sul fondo del club perde contrasto: qui si cerca il velo piu' leggero che
   regge 4,5:1 su OGNI club, invece di sceglierlo a occhio. */
const comp=(ink,q,fondo)=>{const I=ink.replace('#',''),F=fondo.replace('#','');
  const pi=[0,2,4].map(i=>parseInt(I.substr(i,2),16)),pf=[0,2,4].map(i=>parseInt((F.length===3?F[0]+F[0]+F[1]+F[1]+F[2]+F[2]:F).substr(i,2),16));
  return '#'+pi.map((c,i)=>Math.round(c*q+pf[i]*(1-q)).toString(16).padStart(2,'0')).join('');};
console.log('\n  IL VELO DEL TESTO SECONDARIO — il piu\' leggero che regge 4,5:1 su tutti i club:');
let sceltoQ=null;
for(const q of [0.70,0.74,0.78,0.80,0.82,0.86,0.90,0.94,1.00]){
  let peg={r:99,n:''},sotto=0;
  for(const e of elenco){const v=comp(e.ink,q,e.c.c);const r=rap(v,e.c.c);if(r<SOGLIA)sotto++;if(r<peg.r)peg={r,n:e.c.n+' '+e.c.c};}
  console.log('    velo '+q.toFixed(2)+' -> sotto soglia '+String(sotto).padStart(3)+' club · peggiore '+peg.r.toFixed(2)+':1  ('+peg.n+')');
  if(sotto===0&&sceltoQ==null)sceltoQ=q;
}
console.log('  il velo piu\' leggero che regge su TUTTI i club: '+(sceltoQ==null?'NESSUNO sotto 1,00 — serve l\'inchiostro pieno':sceltoQ.toFixed(2)));
/* IL BOTTONE «Salva» e ogni chip: fondo = velo dell'inchiostro sul colore del club. Il velo
   SCHIARISCE (o scurisce) il fondo verso l'inchiostro, quindi il contrasto CALA. Qui si misura
   quanto si puo' spingere prima di scendere sotto 4,5:1, invece di sceglierlo a occhio. */
console.log('\n  IL FONDO DEI CHIP (velo dell\'inchiostro sul colore del club) — inchiostro pieno sopra:');
let chipQ=null;
for(const q of [0.30,0.26,0.22,0.18,0.14,0.10,0.06,0.00]){
  let peg={r:99,n:''},sotto=0;
  for(const e of elenco){const bg=comp(e.ink,q,e.c.c);const r=rap(e.ink,bg);if(r<SOGLIA)sotto++;if(r<peg.r)peg={r,n:e.c.n+' '+e.c.c};}
  console.log('    fondo '+q.toFixed(2)+' -> sotto soglia '+String(sotto).padStart(3)+' club · peggiore '+peg.r.toFixed(2)+':1  ('+peg.n+')');
  if(sotto===0&&chipQ==null)chipQ=q;
}
console.log('  il fondo piu\' marcato che regge su TUTTI i club: '+(chipQ==null?'NESSUNO — il chip non puo\' avere fondo':chipQ.toFixed(2)));
const ok=sottoScelto===0;
console.log('\n'+(ok?'VERDE':'ROSSO')+' — con l\'inchiostro scelto per contrasto, club sotto soglia: '+sottoScelto+'\n');
process.exit(ok?0:1);
