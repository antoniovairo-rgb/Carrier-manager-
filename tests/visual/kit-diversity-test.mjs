#!/usr/bin/env node
/* [6.2.0 KIT-1] TEST MASSIVO DIVISE (direttiva PO): per TUTTI i club estrae clubKits/selectMatchKits
   REALI dal sorgente e verifica: (1) le 3 divise di ogni club sono mutuamente leggibili;
   (2) su OGNI coppia di club (252×251 incontri) la selezione pre-partita garantisce contrasto;
   (3) niente azzurro-default: l ospite veste ciano SOLO se il ciano è un suo colore sociale;
   (4) varietà reale (n° tinte away/third distinte); (5) determinismo. Non-gate; node kit-diversity-test.mjs */
import fs from 'node:fs';
const SRC = fs.readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
function extract(name){const i=SRC.indexOf(`function ${name}(`);if(i<0)throw new Error(name);let d=0,j=SRC.indexOf('{',i);for(let k=j;k<SRC.length;k++){if(SRC[k]==='{')d++;else if(SRC[k]==='}'){d--;if(d===0)return SRC.slice(i,k+1);}}throw 0;}
function extractLine(prefix){const i=SRC.indexOf(prefix);if(i<0)throw new Error(prefix);const j=SRC.indexOf(';\n',i);return SRC.slice(i,j+1);}
function extractArrow(name){const i=SRC.indexOf(`const ${name}=(`);const i2=i<0?SRC.indexOf(`const ${name}=`):i;if(i2<0)throw new Error(name);let d=0,j=SRC.indexOf('{',i2),started=false;for(let k=i2;k<SRC.length;k++){const ch=SRC[k];if(ch==='{'||ch==='('){d++;started=true;}else if(ch==='}'||ch===')'){d--;}if(started&&d===0&&SRC[k+1]===';'&&/[)}]/.test(ch)){return SRC.slice(i2,k+2);}}throw new Error('end '+name);}
const parts=[extract('hashStr'),
  extractLine('const hexToRgb='),extractLine('const colorDist='),extractLine('const _hueOf='),
  extractLine('const _satOf='),extractArrow('kitsClash'),extractLine('const ALT_KITS='),/* [7.8.28 QA] kitsClash è multi-linea (commento interno) → extractLine troncava al 1° ;\n e la Function generata era sintatticamente rotta */
  extractArrow('resolveKitConflict'),extractLine('const hexLum='),extractLine('const buildKit='),
  extractLine('const KIT_PALETTE='),extractLine('const _mixHex='),
  extractArrow('clubKits'),extractArrow('selectMatchKits')].join('\n');
const G=new Function(parts+'\nreturn {clubKits,selectMatchKits,kitsClash,colorDist,resolveKitConflict,_hueOf,_satOf,KIT_PALETTE};')();

const clubs=[...SRC.matchAll(/mkT\("([^"]+)","([^"]+)","[^"]*",(\d+),"([^"]*)","([^"]*)","[^"]*","([^"]*)"\)/g)]
  .map(m=>({id:m[1],n:m[2],p:+m[3],c:m[4],c2:m[5],lg:m[6]}));
console.log('club estratti:',clubs.length);

const isCyan=h=>{const H=G._hueOf(h);return H>=168&&H<=215&&G._satOf(h)>0.3;};
const bad=[],stat={sel:{Home:0,Away:0,Third:0},cyanNew:0,cyanOld:0,clashNew:0,clashOld:0,pairs:0};

// (1) guardaroba per club: 3 divise leggibili + determinismo
for(const c of clubs){
  const k=G.clubKits(c),k2=G.clubKits(c);
  if(JSON.stringify(k)!==JSON.stringify(k2))bad.push(`${c.id}: guardaroba NON deterministico`);
  if(G.kitsClash(k.home.shirt,k.away.shirt))bad.push(`${c.id} (${c.n}): Home ${k.home.shirt} ~ Away ${k.away.shirt} indistinguibili`);
  if(G.kitsClash(k.home.shirt,k.third.shirt))bad.push(`${c.id}: Home ${k.home.shirt} ~ Third ${k.third.shirt} indistinguibili`);
}
// (2)+(3) TUTTE le coppie: contrasto garantito + niente azzurro-default (confronto col vecchio resolver)
for(const h of clubs)for(const a of clubs){
  if(h.id===a.id)continue;stat.pairs++;
  const s=G.selectMatchKits(h,a);stat.sel[s.awayKitName]++;
  if(G.kitsClash(s.homeShirt,s.awayShirt)){stat.clashNew++;if(stat.clashNew<=5)bad.push(`CLASH ${h.id} vs ${a.id}: ${s.homeShirt} ~ ${s.awayShirt} [${s.awayKitName}]`);}
  if(isCyan(s.awayShirt)&&!isCyan(a.c)&&!isCyan(a.c2))stat.cyanNew++;
  const old=G.resolveKitConflict(h.c,a.c);
  if(G.kitsClash(h.c,old))stat.clashOld++;
  if(isCyan(old)&&!isCyan(a.c)&&!isCyan(a.c2))stat.cyanOld++;
}
// (4) varietà reale delle tinte
const aways=new Set(clubs.map(c=>G.clubKits(c).away.shirt)),thirds=new Set(clubs.map(c=>G.clubKits(c).third.shirt));
console.log(`incontri simulati: ${stat.pairs} · ospite veste Home ${(stat.sel.Home/stat.pairs*100).toFixed(1)}% / Away ${(stat.sel.Away/stat.pairs*100).toFixed(1)}% / Third ${(stat.sel.Third/stat.pairs*100).toFixed(1)}%`);
console.log(`azzurro NON-sociale addosso all ospite: PRIMA ${stat.cyanOld} incontri (${(stat.cyanOld/stat.pairs*100).toFixed(1)}%) → ORA ${stat.cyanNew}`);
console.log(`conflitti di contrasto: PRIMA ${stat.clashOld} → ORA ${stat.clashNew}`);
console.log(`tinte away distinte sui ${clubs.length} club: ${aways.size} · third distinte: ${thirds.size}`);
if(stat.cyanNew>0)bad.push(`azzurro-default ancora presente in ${stat.cyanNew} incontri`);
if(aways.size<50)bad.push(`varietà away insufficiente: ${aways.size} tinte`);
const triples=new Set(clubs.map(c=>{const k=G.clubKits(c);return k.home.shirt+k.away.shirt+k.third.shirt;}));
console.log(`guardaroba (tripla Home+Away+Third) unici: ${triples.size}/${clubs.length}`);
if(triples.size<200)bad.push(`identità per club debole: solo ${triples.size} guardaroba distinti`);
console.log('\nVIOLAZIONI:',bad.length);
bad.slice(0,15).forEach(b=>console.log('  ✗ '+b));
console.log(bad.length===0?'\n✅ KIT OK — identità per club, contrasto garantito, zero azzurro-default':'\n❌ KIT FAIL');
process.exit(bad.length===0?0:1);
