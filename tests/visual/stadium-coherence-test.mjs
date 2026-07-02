#!/usr/bin/env node
/* [6.1.0] TEST DI COERENZA STADI (verifica massiva, richiesta PO): capienza ↔ geometria per TUTTI i club: per TUTTI i 252 club esegue stadiumConfigFor
   reale + replica la derivazione di taglia di buildStadium → coerenza capienza ↔ geometria visiva. */
import fs from 'node:fs';
const SRC = fs.readFileSync('/home/user/Carrier-manager-/CARRIER-MANAGER-AV.html', 'utf8');
function extract(name){const i=SRC.indexOf(`function ${name}(`);if(i<0)throw new Error(name);let d=0,j=SRC.indexOf('{',i);for(let k=j;k<SRC.length;k++){if(SRC[k]==='{')d++;else if(SRC[k]==='}'){d--;if(d===0)return SRC.slice(i,k+1);}}throw 0;}
function extractConst(name){const m=SRC.match(new RegExp('const '+name+'=\\{[\\s\\S]*?\\n\\};'));if(!m)throw new Error(name);return m[0];}
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
// dipendenze di stadiumConfigFor
const body=[extract('hashStr'),extractConst('STADIUM_TEMPLATES'),extractConst('STADIUM_LG_TPL'),
  'const STADIUMS=["x"];const getStadiumName=()=>"Stadio";const getStadiumStyle=()=>0;',
  extract('stadiumConfigFor')].join('\n');
const G=new Function('clamp',body+'\nreturn {stadiumConfigFor,STADIUM_TEMPLATES,STADIUM_LG_TPL};')(clamp);

// club reali
const clubs=[...SRC.matchAll(/mkT\("([^"]+)","([^"]+)","[^"]*",(\d+),"[^"]*","[^"]*","[^"]*","([^"]*)"\)/g)]
  .map(m=>({id:m[1],n:m[2],p:+m[3],lg:m[4]}));
console.log('club estratti:',clubs.length);

// replica ESATTA della derivazione di taglia di buildStadium (r.5797-5817)
function geom(cfg){
  const p=cfg.prestige||65;
  const cap=cfg.capacity||null;
  const xl=cap?cap>=45000:p>88,lg=cap?cap>=26000:p>72,md=cap?cap>=12000:p>55;
  const _dK=Math.min(cfg.dist||1,xl?1.00:lg?1.04:1.08);
  const _hg=cap?(xl?Math.min(Math.max((cap-45000)/37000,0),1)*0.20:lg?Math.min(Math.max((cap-26000)/19000,0),1)*0.18:md?Math.min(Math.max((cap-12000)/14000,0),1)*0.15:Math.min(Math.max((cap-3000)/9000,0),1)*0.12):0;
  const _hK=(cfg.standH||1)*(1+_hg);
  const sideX=(xl?78:lg?70:md?64:58)*_dK;
  const sideH=(xl?20:lg?14:md?11:8)*_hK;
  const endH=(xl?22:lg?16:md?13:10)*_hK*(cfg.asym?0.55:1);
  const sudH=sideH*(cfg.megaCurva?1.5:1);
  const sideD=xl?26:lg?20:md?16:13;
  const frontGap=sideX-(cfg.megaCurva?sideD*1.15:sideD)/2-52; // distanza fronte-curva ↔ linea porta (pitch x=±52)
  return {cls:xl?'XL':lg?'LG':md?'MD':'SM',sideX:+sideX.toFixed(1),sideH:+sideH.toFixed(1),sudH:+sudH.toFixed(1),endH:+endH.toFixed(1),frontGap:+frontGap.toFixed(1)};
}

const rows=clubs.map(c=>{const cfg=G.stadiumConfigFor(c);return {...c,cap:cfg.capacity,tpl:cfg.template,g:geom(cfg)};});
const bad=[];
for(const r of rows){
  // regole di coerenza capienza↔visuale
  if(r.cap>=35000&&r.g.sudH<14)bad.push(`${r.id} (${r.n}, ${r.lg}) cap ${r.cap} ma curva ALTA solo ${r.g.sudH}u [tpl ${r.tpl}, ${r.g.cls}]`);
  if(r.cap>=25000&&r.g.sideH<9)bad.push(`${r.id} cap ${r.cap} ma tribune ${r.g.sideH}u [tpl ${r.tpl}, ${r.g.cls}]`);
  if(r.cap<10000&&r.g.sudH>18)bad.push(`${r.id} cap ${r.cap} ma curva ${r.g.sudH}u (gigante) [tpl ${r.tpl}, ${r.g.cls}]`);
  if(r.g.frontGap>14)bad.push(`${r.id} gap fronte-curva ${r.g.frontGap}u (stadio staccato) [${r.g.cls}, dist jitter]`);
  if(r.cap>=45000&&r.g.cls!=='XL'&&r.g.cls!=='LG')bad.push(`${r.id} cap ${r.cap} ma classe ${r.g.cls}`);
}
// correlazione capienza↔altezza (rank spearman grezza)
const byCap=[...rows].sort((a,b)=>a.cap-b.cap), byH=[...rows].sort((a,b)=>(a.g.sudH-b.g.sudH));
const rankH=new Map(byH.map((r,i)=>[r.id,i]));
let dsum=0;byCap.forEach((r,i)=>{const d=i-rankH.get(r.id);dsum+=d*d;});
const rho=1-6*dsum/(rows.length*(rows.length**2-1));
console.log('correlazione rank capienza↔altezza curva (Spearman):',rho.toFixed(3),'(target ≥0.75)');
// distribuzione mismatch per fascia
const buckets={};
for(const r of rows){const b=r.cap>=45000?'45k+':r.cap>=28000?'28-45k':r.cap>=15000?'15-28k':r.cap>=8000?'8-15k':'<8k';(buckets[b]=buckets[b]||[]).push(r.g.sudH);}
for(const [b,hs] of Object.entries(buckets))console.log(`fascia ${b.padEnd(7)} n=${String(hs.length).padStart(3)} · curva média ${(hs.reduce((a,x)=>a+x,0)/hs.length).toFixed(1)}u · min ${Math.min(...hs).toFixed(1)} max ${Math.max(...hs).toFixed(1)}`);
console.log('\nINCOERENZE:',bad.length);
bad.slice(0,25).forEach(b=>console.log('  ✗ '+b));
process.exit(bad.length===0?0:1);
