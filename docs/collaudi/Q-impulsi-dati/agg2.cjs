const fs=require('fs'); const S=process.argv[2];
const rows=[...require(S+'/r0.json'),...require(S+'/r1.json'),...require(S+'/r2.json')];
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const popGain=(p,amt)=>{ if(!amt||amt<=0) return amt||0; const cur=p.popularity||20; const tm=p.totalMatches||0, seas=p.season||1; const career=Math.min(1,0.40+tm/130+(seas-1)*0.09); const dim=cur<50?1:cur<65?0.68:cur<80?0.42:cur<90?0.24:0.12; return Math.max(1,Math.round(amt*career*dim)); };
const BOUNDS={morale:[0,100],fatigue:[0,100],form:[30,95],coachTrust:[0,100],popularity:[0,100],chem:[0,100]};
const FIELD={morale:'morale',fatigue:'fatigue',form:'form',popularity:'popularity',coachTrust:'coachTrust',value:'value',bank:'bankBalance',chem:'teamChemistry'};
const UNH=new Set(['mentalità','posizionamento','fisico','tecnica']);
const TOAST=new Set(['morale','form','fatigue','popularity','coachTrust']);
const rep=[]; const C={n:rows.length,ok:0,noEff:[],diff:[],unread:[],applied:[],toastMismatch:[],clampSkip:0,noPre:0};
for(const r of rows){
  const pre=r.pre||{}; const decl=r.decl||{}; const diff=r.diff||{};
  if(r.applied!==1) C.applied.push(`${r.id}#${r.k}=${r.applied}`);
  const exp=[], obs=[], ver=[]; let bad=false, badKind=null;
  for(const k of Object.keys(decl)){
    const d=decl[k];
    if(UNH.has(k)){ C.unread.push(`${r.id}#${r.k} ${k}${d>0?'+':''}${d}`); exp.push(`${k} ${d>0?'+':''}${d}`); obs.push('nessun cambio'); badKind=badKind||'stat'; bad=true; continue; }
    if(k==='transferListed'){ const post=diff.transferListed?diff.transferListed[1]:pre.transferListed; exp.push('in lista trasferimenti'); obs.push(post?'in lista':'nessun cambio'); if(!post){bad=true;badKind=badKind||'noEff';} continue; }
    if(k==='flag'){continue;}
    const f=FIELD[k]; if(!f){continue;}
    const p0=pre[f===  'bankBalance'?'bankBalance':f]; const hasPre=(p0!==null&&p0!==undefined);
    const ch=diff[f]; const post= ch? ch[1] : p0;
    let e;
    if(!hasPre){ C.noPre++; continue; }
    if(k==='popularity'){ e = clamp(p0 + popGain({popularity:p0,totalMatches:pre.totalMatches,season:pre.season}, d), 0, 100); }
    else if(k==='value'){ e = Math.max(0.5, p0 + d); }
    else if(k==='bank'){ e = Math.max(0, Math.round(p0 + d)); }
    else { const [lo,hi]=BOUNDS[k]||[-1e9,1e9]; e = clamp(p0 + d, lo, hi); }
    const tol = k==='value'?0.01:0.5;
    const pf=(typeof post==='number')? post : Number(post);
    const shown = (k==='value'?d.toFixed(2):(d>0?'+':'')+d);
    if(Math.abs(pf-e)<=tol){ exp.push(`${k} ${shown}`); obs.push(`${k} ${k==='value'?p0.toFixed(2):p0}→${k==='value'?pf.toFixed(2):pf}`); if(e!==p0+d) C.clampSkip++; }
    else {
      exp.push(`${k} ${shown}`); 
      if(pf===p0){ obs.push(`${k} nessun cambio (atteso ${k==='value'?e.toFixed(2):e})`); bad=true; badKind=badKind||'noEff'; }
      else { obs.push(`${k} ${k==='value'?p0.toFixed(2):p0}→${k==='value'?pf.toFixed(2):pf} (atteso ${k==='value'?e.toFixed(2):e})`); bad=true; badKind=badKind||'diff'; }
    }
    if(TOAST.has(k) && ch){ const applied=pf-p0; if(applied!==d && !(k==='popularity')) {} if(k==='popularity' && Math.abs(applied-d)>0.5) C.toastMismatch.push(`${r.id}#${r.k} ⭐ mostrato +${d}, applicato +${applied}`); }
  }
  if(decl.flag==='investment'){ const ok=!!diff.investmentPending || !!(r.diff&&r.diff.investmentPending); exp.push('investimento in attesa'); obs.push(ok?'investimento in attesa':'nessun cambio'); if(!ok){bad=true;badKind=badKind||'noEff';} }
  if(!bad) C.ok++;
  else if(badKind==='noEff') C.noEff.push(`${r.id}#${r.k}`);
  else if(badKind==='diff') C.diff.push(`${r.id}#${r.k}`);
  // visibilità
  let vis;
  const toastKeys=Object.keys(decl).filter(k=>TOAST.has(k));
  const toastTxt=r.newLines.filter(l=>/[⚡😄💪⭐🤝]/.test(l)).join(' ');
  if(toastKeys.length && toastTxt) vis=`sì — riquadro in alto dopo il clic («${toastTxt.slice(0,48)}»): mostra il valore dichiarato`;
  else if(Object.keys(decl).some(k=>['bank','value','chem','transferListed'].includes(k)) || decl.flag) vis='no — nessun riquadro; il saldo/valore si vede solo nelle schermate del conto/profilo (non verificato a schermo)';
  else if(Object.keys(decl).some(k=>UNH.has(k))) vis='no — nessun riquadro e nessuna statistica cambia';
  else vis='no — nessun riquadro';
  rep.push({id:r.id,k:r.k,txt:r.txt,exp:exp.join(', ')||'—',obs:obs.join(', ')||'nessun cambio',vis,bad:!!bad,badKind,cat:r.cat});
}
fs.writeFileSync(S+'/rep.json',JSON.stringify({rep,C},null,1));
console.log('scelte',C.n,'coerenti',C.ok,'| senza effetto',C.noEff.length,'| effetto diverso',C.diff.length,'| stat non lette',C.unread.length,'| applicate≠1',C.applied.length,'| toast≠applicato',C.toastMismatch.length,'| clamp-corretti',C.clampSkip,'| senza pre',C.noPre);
console.log('NOEFF:',C.noEff.join(' ')); console.log('DIFF:',C.diff.join(' ')); console.log('UNREAD:',C.unread.join(' | '));
console.log('TOAST:',C.toastMismatch.slice(0,8).join(' | '));
