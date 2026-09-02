/* ========================================================================
 * KORWARD ELITE — frammento n° 11  (dei 20, numerati da 00 a 19)
 * src/11-ui-kit-highlight.jsx
 *
 * UI KIT · COSTANTI HIGHLIGHT 3D · BUFFER DI PARTITA
 *
 * I 20 componenti di base dell’interfaccia (Card, Btn, StatBar, OvrRing, Notif,
 * Sparkline, SectionHeader, Badge, MatchBadge, Meter, KpiTile, EmptyState, Skeleton,
 * Modal, BottomSheet, Tabs, Tooltip, DataTable, Bracket, Toast), le costanti
 * dell’highlight 3D (ATE3_*, HL_ZONE_3D, CELEBRATIONS, HL_ZONE_COL, INTENT_TITLE) e i
 * buffer di telemetria MATCH_TL / MATCH_EV.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 9280-11308   ·   2029 righe di 41427
 * La prima riga dopo questa intestazione è la riga 9280 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 9254 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
/* ========================================
   UI COMPONENTS  (light theme – req #1)
======================================== */
/* Card — refactor Ondata 1: default pinnati (radius 14 · pad "16px 18px" · TH.shadow) → zero regressione.
   Nuovi prop opt-in: elevation(1|2|3) · tone(win|draw|loss|primary|info|warn|neutral) · interactive · header/footer · density(tight|loose). ...rest → onClick ora arriva al div (fix riga Coppe 6.8.1). */
const _CARD_TONE={win:["winBg","winBd"],draw:["drawBg","drawBd"],loss:["lossBg","lossBd"],primary:["primaryTint","primaryBorder"],info:["bgBlue","bdBlue"],warn:["bgAmber","bdAmber"],neutral:["surface2","divider"]};
const Card=({children,style={},border,bg,shadow=true,elevation,tone,interactive=false,header,footer,density,className="",...rest})=>{
  const el=elevation===3?TH.el3:elevation===2?TH.el2:elevation===1?TH.el1:(shadow?TH.shadow:"none");
  const t=tone&&_CARD_TONE[tone];
  const pad=density==="tight"?"10px 12px":density==="loose"?"20px 22px":"16px 18px";
  return(<div className={(interactive?"cpm-int ":"")+className} style={{background:bg||(t?TH[t[0]]:TH.card),border:`1px solid ${border||(t?TH[t[1]]:TH.cardBorder)}`,borderRadius:14,padding:pad,boxShadow:el,...style}} {...rest}>
    {header!=null&&<div style={{marginBottom:10}}>{header}</div>}{children}{footer!=null&&<div style={{marginTop:10}}>{footer}</div>}</div>);
};
/* Btn — refactor Ondata 1: default 'md' == output attuale (pad "10px 18px" · minHeight 40 · fs 13).
   Nuovi prop opt-in: size(sm|md|lg) · icon · loading. .cpm-press → hover/active (nessun cambio a frame statico). */
const _BTN_SIZE={sm:{padding:"7px 12px",minHeight:36,fontSize:12},md:{padding:"10px 18px",minHeight:40,fontSize:13},lg:{padding:"13px 22px",minHeight:48,fontSize:15}};
const Btn=({children,onClick,v="primary",disabled=false,style={},fw=false,size="md",icon,loading=false,className="",...rest})=>{
  const vs={
    primary:{background:TH.primary,color:"#fff",fontWeight:700},
    green:{background:TH.success,color:"#fff",fontWeight:700},
    secondary:{background:TH.card,color:TH.muted,border:"1px solid "+TH.cardBorder},
    success:{background:TH.bgGreen,color:TH.txGreen,border:"1px solid "+TH.bdGreen,fontWeight:700},/* [7.103.0] token semantici (theme-aware) al posto degli hex light hardcoded */
    danger:{background:TH.bgRed,color:TH.danger,border:"1px solid "+TH.bdRed,fontWeight:700},
    ghost:{background:"transparent",color:TH.faint,border:"1px solid "+TH.cardBorder},
    gold:{background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:800},
  };
  const sz=_BTN_SIZE[size]||_BTN_SIZE.md;
  const isOff=disabled||loading;
  return<button onClick={isOff?undefined:onClick} disabled={isOff} className={(isOff?"":"cpm-press ")+"cpm-focus "+className} style={{padding:sz.padding,minHeight:sz.minHeight,borderRadius:10,border:"none",cursor:isOff?"not-allowed":"pointer",fontFamily:"inherit",fontSize:sz.fontSize,letterSpacing:.3,transition:"all .15s",opacity:isOff&&!loading?.4:1,width:fw?"100%":"auto",display:(icon||loading)?"inline-flex":undefined,alignItems:(icon||loading)?"center":undefined,justifyContent:(icon||loading)?"center":undefined,gap:(icon||loading)?6:undefined,...vs[v],...style}} {...rest}>{loading&&<span style={{width:13,height:13,border:"2px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite",opacity:.85}}/>}{icon}{children}</button>;
};
/* StatBar — refactor Ondata 1: default (ramp 80/65 · track TH.cardBorder · mb 8 · h 4) invariato.
   tone opt-in: 'attribute' = ramp NON allarmante · 'win'/'draw'/'loss'/... = colore semantico. */
const StatBar=({label,value,tone,track,height=4,mb=8})=>{
  const c=tone==="attribute"?(value>=75?TH.success:value>=55?TH.energy:value>=40?TH.warning:TH.danger)
        :(tone&&TH[tone+"Fg"])?TH[tone+"Fg"]
        :(value>=80?TH.success:value>=65?TH.warning:TH.danger);
  return<div style={{marginBottom:mb}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:TH.muted,textTransform:"uppercase",letterSpacing:1}}>{label}</span><span className="cpm-num" style={{color:c,fontWeight:700}}>{value}</span></div><div style={{height,background:track||TH.cardBorder,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${value}%`,background:c,borderRadius:3,transition:"width .5s"}}/></div></div>;
};
/* OvrRing — refactor Ondata 1: track → TH.track (light == #e2e8f0, pinnato) · label default 'OVR' (era 'LVL': errato per un calciatore). */
const OvrRing=({value,size=60,label="OVR"})=>{
  const c=value>=80?TH.success:value>=65?TH.warning:TH.danger;
  return<div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`conic-gradient(${c} ${value}%,${TH.track} 0)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:size-10,height:size-10,borderRadius:"50%",background:TH.card,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><div className="cpm-num" style={{fontSize:size*.27,fontWeight:900,color:c,lineHeight:1}}>{value}</div><div style={{fontSize:8,color:TH.faint}}>{label}</div></div></div>;
};
const Notif=({msg,color})=>msg?<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:TH.card,border:`2px solid ${color}`,color,padding:"10px 24px",borderRadius:40,fontSize:13,fontWeight:700,zIndex:9999,letterSpacing:.4,pointerEvents:"none",boxShadow:`0 4px 24px ${color}33`}}>{msg}</div>:null;
/* Sprint 33 C4 — SVG Sparkline */
function Sparkline({data,color,width,height}){
  var w=width||100;var h=height||30;var c=color||TH.primary;
  if(!data||data.length<2)return <svg width={w} height={h}></svg>;
  var mn=data[0];var mx=data[0];
  for(var i=1;i<data.length;i++){if(data[i]<mn)mn=data[i];if(data[i]>mx)mx=data[i];}
  var rng=mx-mn||1;
  var pts="";
  for(var j=0;j<data.length;j++){var px=Math.round(j/(data.length-1)*(w-6)+3);var py=Math.round(h-3-(data[j]-mn)/rng*(h-6));pts+=(j>0?" ":"")+px+","+py;}
  var lp=pts.split(" ").slice(-1)[0].split(",");
  /* [7.75.0 UI Kit] area sfumata + baseline tenue (look KpiTile del prototipo) — additivo, props invariati */
  var poly="3,"+(h-1)+" "+pts+" "+(w-3)+","+(h-1);
  return(
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <line x1="3" y1={h-2.5} x2={w-3} y2={h-2.5} stroke={c} strokeWidth="1" opacity="0.12"/>
      <polygon points={poly} fill={c} fillOpacity="0.13" stroke="none"/>
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lp[0]} cy={lp[1]} r="2.5" fill={c}/>
    </svg>
  );
}

/* ============================================================================
   DESIGN SYSTEM · PRIMITIVE LIBRARY (FASE 1 · Ondata 1)
   Componenti additivi, theme-aware, consumati dalle ondate 2-7. Nessun uso qui
   → zero regressione. Tutti leggono i token TH/FS/FW/SP/RAD/MO.
   ========================================================================== */

/* SectionHeader — intestazione di sezione unificata (retira il pattern "fontSize:10·uppercase·letterSpacing" ripetuto ~40×). */
function SectionHeader({children,icon,right,style={}}){
  return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:SP.md,...style}}>
    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:FS.caption,fontWeight:FW.bold,color:TH.faint,textTransform:"uppercase",letterSpacing:1.2}}>{icon&&<span style={{fontSize:13}}>{icon}</span>}{children}</div>
    {right!=null&&<div>{right}</div>}
  </div>);
}

/* Badge / Chip — pill semantica. tone: neutral|primary|win|draw|loss|info|warn|gold|record|energy. */
const _BADGE_TONE={
  neutral:["surface2","muted","divider"],primary:["primaryTint","primary","primaryBorder"],
  win:["winBg","winFg","winBd"],draw:["drawBg","drawFg","drawBd"],loss:["lossBg","lossFg","lossBd"],
  info:["bgBlue","txBlue","bdBlue"],warn:["bgAmber","txAmber","bdAmber"],
  gold:["bgAmber","goldText","bdAmber"],record:["bgBlue","record","bdBlue"],energy:["bgBlue","energy","bdBlue"],
};
function Badge({children,tone="neutral",solid=false,icon,size="md",style={}}){
  const t=_BADGE_TONE[tone]||_BADGE_TONE.neutral;
  const sm=size==="sm";
  const base=solid?{background:TH[t[1]],color:"#fff",border:"none"}:{background:TH[t[0]],color:TH[t[1]],border:`1px solid ${TH[t[2]]}`};
  return(<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:sm?"1px 7px":"3px 9px",borderRadius:RAD.pill,fontSize:sm?10:FS.caption,fontWeight:FW.bold,lineHeight:1.4,whiteSpace:"nowrap",...base,...style}}>{icon}{children}</span>);
}

/* MatchBadge — esito V/P/S unificato (retira le decine di quadratini V/N/S ad-hoc). r=result 'W'|'D'|'L' o won/drew. */
function MatchBadge({r,size=22,title}){
  const kind=r==="W"||r==="win"||r===true?"win":(r==="D"||r==="draw"?"draw":"loss");
  const letter=kind==="win"?"V":kind==="draw"?"P":"S"; // vocabolario di gioco V/P/S (Pareggio)
  const bg=kind==="win"?TH.winFg:kind==="draw"?TH.drawFg:TH.lossFg;
  return(<div title={title} className="cpm-num" style={{width:size,height:size,borderRadius:RAD.xs,background:bg,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:size*.45,fontWeight:FW.black,color:"#fff",flexShrink:0}}>{letter}</div>);
}


/* Meter — barra 0-100 generica con tone semantica (base per attributi/indicatori, ramp non allarmante). */
function Meter({value,max=100,tone,color,height=6,track,label,right,mb=0,showValue=false}){
  const pct=Math.max(0,Math.min(100,(value/max)*100));
  const c=color||(tone==="attribute"?(value>=75?TH.success:value>=55?TH.energy:value>=40?TH.warning:TH.danger):(tone&&TH[tone+"Fg"])?TH[tone+"Fg"]:TH.primary);
  return(<div style={{marginBottom:mb}}>
    {(label!=null||right!=null||showValue)&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
      {label!=null&&<span style={{fontSize:FS.caption,color:TH.muted,fontWeight:FW.medium}}>{label}</span>}
      {(right!=null||showValue)&&<span className="cpm-num" style={{fontSize:FS.small,fontWeight:FW.bold,color:c}}>{right!=null?right:Math.round(value)}</span>}
    </div>}
    <div style={{height,background:track||TH.track,borderRadius:RAD.pill,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:c,borderRadius:RAD.pill,transition:`width ${MO.slow}ms ${MO.easeOut}`}}/></div>
  </div>);
}

/* KpiTile — cella KPI (numero grande + label + delta/trend). Sostituisce i "numero in fila + barra 3px". */
function KpiTile({label,value,unit,icon,tone,delta,spark,sparkColor,sub,onClick,style={}}){
  const c=tone&&TH[tone+"Fg"]?TH[tone+"Fg"]:tone&&TH[tone]?TH[tone]:TH.text;
  const dUp=delta!=null&&delta>0,dDn=delta!=null&&delta<0;
  const dc=dUp?TH.growth:dDn?TH.regression:TH.muted;
  return(<div onClick={onClick} className={onClick?"cpm-int":""} style={{background:TH.card,border:`1px solid ${TH.cardBorder}`,borderRadius:RAD.lg,padding:SP.lg,cursor:onClick?"pointer":"default",display:"flex",flexDirection:"column",gap:2,...style}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span style={{fontSize:FS.caption,color:TH.muted,fontWeight:FW.medium,textTransform:"uppercase",letterSpacing:.6}}>{icon&&<span style={{marginRight:5}}>{icon}</span>}{label}</span>
      {delta!=null&&<span className="cpm-num" style={{fontSize:FS.caption,fontWeight:FW.bold,color:dc}}>{dUp?"▲":dDn?"▼":"■"} {Math.abs(delta)}</span>}
    </div>
    <div style={{display:"flex",alignItems:"baseline",gap:3}}>
      <span className="cpm-num" style={{fontSize:FS.display,fontWeight:FW.black,color:c,lineHeight:1.05}}>{value}</span>
      {unit&&<span style={{fontSize:FS.small,color:TH.faint,fontWeight:FW.semibold}}>{unit}</span>}
    </div>
    {sub&&<span style={{fontSize:FS.caption,color:TH.faint}}>{sub}</span>}
    {spark&&spark.length>1&&<div style={{marginTop:4}}><Sparkline data={spark} color={sparkColor||c} width={110} height={26}/></div>}
  </div>);
}

/* EmptyState — stato vuoto coerente. */
function EmptyState({icon="📭",title,sub,action,style={}}){
  return(<div style={{textAlign:"center",padding:`${SP.xxxl}px ${SP.lg}px`,color:TH.faint,...style}}>
    <div style={{fontSize:34,marginBottom:SP.sm,opacity:.7}}>{icon}</div>
    {title&&<div style={{fontSize:FS.bodyLg,fontWeight:FW.bold,color:TH.muted,marginBottom:4}}>{title}</div>}
    {sub&&<div style={{fontSize:FS.small,lineHeight:1.5,maxWidth:320,margin:"0 auto"}}>{sub}</div>}
    {action&&<div style={{marginTop:SP.lg}}>{action}</div>}
  </div>);
}

/* Skeleton — placeholder shimmer unico (retira gli 8 shimmer artigianali). */
function Skeleton({w="100%",h=14,r=RAD.sm,style={}}){
  return(<div style={{width:w,height:h,borderRadius:r,background:`linear-gradient(90deg,${TH.surface2} 25%,${TH.divider} 37%,${TH.surface2} 63%)`,backgroundSize:"200% 100%",animation:`cpmShimmer 1.3s ${MO.easeStd} infinite`,...style}}/>);
}

/* Modal / Dialog — un unico scrim+pannello (retira 8+ backdrop ad-hoc). */
function Modal({open=true,onClose,children,title,footer,width=440,dismissable=true,style={}}){
  if(!open)return null;
  return(<div onClick={dismissable?onClose:undefined} className="cpm-fade" style={{position:"fixed",inset:0,background:TH.scrim,zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:SP.lg}}>
    <div onClick={e=>e.stopPropagation()} className="cpm-rise" style={{background:TH.surface3,borderRadius:RAD.xl,boxShadow:TH.el3,maxWidth:width,width:"100%",maxHeight:"90vh",overflow:"auto",border:`1px solid ${TH.divider}`,...style}}>
      {title!=null&&<div style={{padding:`${SP.lg}px ${SP.xl}px`,borderBottom:`1px solid ${TH.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:FS.subhead,fontWeight:FW.bold,color:TH.text}}>{title}</div>
        {dismissable&&onClose&&<button onClick={onClose} className="cpm-press cpm-focus" style={{background:"none",border:"none",fontSize:20,color:TH.faint,cursor:"pointer",lineHeight:1,padding:4}}>×</button>}
      </div>}
      <div style={{padding:`${SP.xl}px`}}>{children}</div>
      {footer!=null&&<div style={{padding:`${SP.md}px ${SP.xl}px`,borderTop:`1px solid ${TH.divider}`,display:"flex",gap:SP.sm,justifyContent:"flex-end"}}>{footer}</div>}
    </div>
  </div>);
}

/* BottomSheet — foglio mobile (scrim + pannello dal basso). */
function BottomSheet({open=true,onClose,children,title,style={}}){
  if(!open)return null;
  return(<div onClick={onClose} className="cpm-fade" style={{position:"fixed",inset:0,background:TH.scrim,zIndex:9998,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:TH.surface3,borderRadius:`${RAD.xl}px ${RAD.xl}px 0 0`,boxShadow:TH.el3,width:"100%",maxWidth:640,maxHeight:"88vh",overflow:"auto",animation:`cpmSheetUp ${MO.slow}ms ${MO.easeOut} both`,...style}}>
      <div style={{display:"flex",justifyContent:"center",padding:"8px 0 2px"}}><div style={{width:36,height:4,borderRadius:RAD.pill,background:TH.divider}}/></div>
      {title!=null&&<div style={{padding:`4px ${SP.xl}px ${SP.sm}px`,fontSize:FS.subhead,fontWeight:FW.bold,color:TH.text}}>{title}</div>}
      <div style={{padding:`${SP.sm}px ${SP.xl}px ${SP.xxl}px`}}>{children}</div>
    </div>
  </div>);
}

/* Tabs — segmented control coerente. items:[{id,label,icon}] · value · onChange. */
function Tabs({items=[],value,onChange,style={},size="md"}){
  const sm=size==="sm";
  return(<div style={{display:"flex",gap:4,background:TH.surface2,borderRadius:RAD.md,padding:3,...style}}>
    {items.map(it=>{const act=it.id===value;return(
      <button key={it.id} onClick={()=>onChange&&onChange(it.id)} className="cpm-focus" style={{flex:1,minWidth:0,padding:sm?"5px 8px":"7px 10px",borderRadius:RAD.sm,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:sm?FS.caption:FS.small,fontWeight:FW.bold,background:act?TH.card:"transparent",color:act?TH.primary:TH.muted,boxShadow:act?TH.el1:"none",transition:`all ${MO.fast}ms ${MO.easeOut}`,display:"flex",alignItems:"center",justifyContent:"center",gap:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.icon&&<span>{it.icon}</span>}{it.label}</button>);})}
  </div>);
}

/* Tooltip — hint su hover/focus (CSS-only, nessun JS di posizionamento). */
function Tooltip({children,text,style={}}){
  return(<span title={text} style={{cursor:"help",borderBottom:`1px dotted ${TH.faint}`,...style}}>{children}</span>);
}

/* DataTable — tabella coerente con zebra + evidenza riga. cols:[{key,label,w,align,render}] · rows · highlightRow(row,i)->bool. */
function DataTable({cols=[],rows=[],highlightRow,keyOf,compact=false,stickyFirst=false,style={}}){
  return(<div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",...style}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:compact?FS.caption:FS.small}}>
      <thead><tr>{cols.map((c,ci)=>(<th key={c.key} style={{textAlign:c.align||"left",padding:compact?"6px 8px":"9px 10px",fontSize:FS.caption,fontWeight:FW.bold,color:TH.faint,textTransform:"uppercase",letterSpacing:.6,borderBottom:`2px solid ${TH.divider}`,width:c.w,position:stickyFirst&&ci===0?"sticky":undefined,left:stickyFirst&&ci===0?0:undefined,background:stickyFirst&&ci===0?TH.card:undefined,whiteSpace:"nowrap"}}>{c.label}</th>))}</tr></thead>
      <tbody>{rows.map((row,ri)=>{const hi=highlightRow&&highlightRow(row,ri);return(
        <tr key={keyOf?keyOf(row,ri):ri} style={{background:hi?TH.primaryTint:(ri%2?TH.surface2:"transparent")}}>
          {cols.map((c,ci)=>(<td key={c.key} className={typeof(row[c.key])==="number"?"cpm-num":undefined} style={{textAlign:c.align||"left",padding:compact?"6px 8px":"9px 10px",color:hi?TH.primary:TH.text,fontWeight:hi?FW.bold:FW.regular,borderBottom:`1px solid ${TH.divider}`,position:stickyFirst&&ci===0?"sticky":undefined,left:stickyFirst&&ci===0?0:undefined,background:stickyFirst&&ci===0?(hi?TH.primaryTint:(ri%2?TH.surface2:TH.card)):undefined,whiteSpace:"nowrap"}}>{c.render?c.render(row,ri):row[c.key]}</td>))}
        </tr>);})}</tbody>
    </table>
  </div>);
}

/* Bracket — tabellone KO visivo. rounds:[{name,ties:[{home,away,hs,as,homeWon}]}]. */
function Bracket({rounds=[],style={}}){
  return(<div style={{display:"flex",gap:SP.md,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:SP.sm,...style}}>
    {rounds.map((rd,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",justifyContent:"space-around",gap:SP.sm,minWidth:150}}>
      <div style={{fontSize:FS.caption,fontWeight:FW.bold,color:TH.faint,textTransform:"uppercase",letterSpacing:.8,textAlign:"center",marginBottom:2}}>{rd.name}</div>
      {(rd.ties||[]).map((t,j)=>(<div key={j} style={{background:TH.card,border:`1px solid ${TH.cardBorder}`,borderRadius:RAD.sm,overflow:"hidden",boxShadow:TH.el1}}>
        {[[t.home,t.hs,t.homeWon],[t.away,t.as,t.homeWon===false]].map(([nm,sc,won],k)=>(
          <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 9px",borderBottom:k===0?`1px solid ${TH.divider}`:"none",background:won?TH.winBg:"transparent"}}>
            <span style={{fontSize:FS.small,fontWeight:won?FW.bold:FW.regular,color:won?TH.winFg:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nm||"—"}</span>
            {sc!=null&&<span className="cpm-num" style={{fontSize:FS.small,fontWeight:FW.bold,color:won?TH.winFg:TH.muted,marginLeft:8}}>{sc}</span>}
          </div>))}
      </div>))}
    </div>))}
  </div>);
}

/* Toast — notifica transitoria (stack gestito dal chiamante). tone semantica. */
function Toast({children,tone="info",icon,onClose,style={}}){
  const t=_BADGE_TONE[tone]||_BADGE_TONE.info;
  return(<div className="cpm-rise" style={{display:"flex",alignItems:"center",gap:8,background:TH.surface3,border:`1px solid ${TH[t[2]]}`,borderLeft:`3px solid ${TH[t[1]]}`,borderRadius:RAD.md,padding:"10px 14px",boxShadow:TH.el2,maxWidth:360,...style}}>
    {icon&&<span style={{fontSize:16}}>{icon}</span>}
    <span style={{fontSize:FS.small,color:TH.text,fontWeight:FW.medium,flex:1,lineHeight:1.4}}>{children}</span>
    {onClose&&<button onClick={onClose} className="cpm-press" style={{background:"none",border:"none",color:TH.faint,fontSize:16,cursor:"pointer",lineHeight:1}}>×</button>}
  </div>);
}

/* ========================================
   CROWD + STADIUM (Three.js)
======================================== */
// 5.45.0 (Sprint B — TIFOSI ANIMATI): la folla non è più una texture statica.
// Restituisce {tex, redraw}: redraw(now,goalSide,excite) RIDISEGNA il canvas ogni tick →
// bob continuo (movimento), e al gol chi tifa il marcatore ESULTA (salto+braccia su+sciarpa alzata),
// l'altra metà si DISPERA (si accascia). Seedato/deterministico (no Math.random → setup riproducibile).
/* CROWD 2.0 (§1/§2/§3/§4) — texture settore ad alta densità con LOD in-texture.
   spec: {key, homeHex, awayHex, width(unità mondo), fill, intensity, isAway, isMobile, seedKey,
          sector:{team,ultras,flags,scarves,banner,seated,families,wedge,vip}, wedgeFill}
   Il canvas è diviso in DUE bande: quella BASSA (anello inferiore, tifosi GRANDI e dettagliati = LOD2)
   e quella ALTA (anello superiore, figure piccole e semplificate = LOD3/4, più file e più fitte).
   Ritorna {texLow,texUp,texFull,redraw}: texLow/texUp campionano le rispettive bande via offset/repeat
   (stessa canvas → un solo redraw anima entrambi gli anelli). I posti vuoti mostrano il SEDILE di
   plastica nei colori del club di casa → l'affluenza si LEGGE dagli spalti (§6). */
function makeCrowdTex(spec){
  const q=CROWD_CFG.quality,S=spec.sector||{};
  const W=spec.isMobile?q.texWMobile:q.texW,H=q.texH;
  const c=document.createElement("canvas");c.width=W;c.height=H;
  const ctx=c.getContext("2d");
  const homeHex=spec.homeHex||"#2563eb",awayHex=spec.awayHex||"#dc2626";
  const fill=Math.max(0,Math.min(1,spec.fill==null?0.9:spec.fill));
  const inten=Math.max(0,Math.min(1,spec.intensity==null?0.6:spec.intensity));
  const SKINS=["#f5c5a3","#e8a870","#d9a06a","#c8956a","#a06a42","#8B5030","#7c4a1e","#5f3818"];
  const HAIRS=["#1a0800","#3d2000","#0f0f12","#c0c0c0","#d4a820","#8B4513","#5a3820","#986a38"];
  const CLOTHES=["#2b3a55","#7a2b2b","#2f5d3a","#4a3b6b","#8a6a2a","#28506b","#6b6f78","#a03a5a","#3a3f4a","#5a4030","#265f5a","#804a20","#b04828","#324b2e","#8a8f98","#c8c2b2"];
  const _shade=(hex,k)=>{const n=parseInt(hex.slice(1),16);const r=Math.min(255,((n>>16)&255)*k)|0,g=Math.min(255,((n>>8)&255)*k)|0,b=Math.min(255,(n&255)*k)|0;return"#"+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);};
  const _mix=(h1,h2,t)=>{const a=parseInt(h1.slice(1),16),b=parseInt(h2.slice(1),16);const r=(((a>>16)&255)+((((b>>16)&255)-((a>>16)&255))*t))|0,g=(((a>>8)&255)+((((b>>8)&255)-((a>>8)&255))*t))|0,bl=((a&255)+(((b&255)-(a&255))*t))|0;return"#"+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1);};
  // PRNG seedato per settore (chiave diversa per settore → MAI due settori fotocopia, §1)
  let _s=Math.abs(hashStr("crowd2_"+(spec.seedKey||spec.key||"x")))>>>0;
  const rnd=()=>{_s=(_s*1664525+1013904223)>>>0;return _s/4294967296;};
  // Geometria bande: alta = file 0..rowsUp-1 (fondo, piccole e fitte) · bassa = file grandi verso il campo
  const splitY=Math.round(H*(1-q.tierSplit));
  const colsLow=Math.max(26,Math.round((spec.width||100)*q.colsPerUnit));
  const colsUp=Math.round(colsLow*1.3);
  const _rm92=Math.max(0.5,spec.rowsMul||1);// [5.92→6.2 CROWD-SCALE] file ∝ altezza reale del settore (anche <1 sugli impianti piccoli: tifoso-target costante)
  const rowsUp=Math.round(q.rowsUp*_rm92),rowsLow=Math.round(q.rowsLow*_rm92);
  const uH=splitY/rowsUp,cWU=W/colsUp,cWL=W/colsLow;
  /* [6.2.0 CROWD-SCALE] scala prospettica PARAMETRICA su rowsLow: l array fisso da 6 file rendeva
     lw[r]=undefined per r>=6 → rH=NaN → le file extra del fix 5.92 erano INVISIBILI (anello basso
     inchiodato a 6 file giganti qualunque fosse rowsMul) */
  const lw=Array.from({length:rowsLow},(_,r)=>1+(rowsLow<=1?0:r/(rowsLow-1))*0.66),lwSum=lw.reduce((a,b)=>a+b,0);
  // sedile vuoto: plastica nei colori del CLUB DI CASA (lo stadio è suo), desaturata
  const seatBase=_mix(homeHex,"#5a6272",0.45);
  // VIP box (Tribuna Ovest): campata centrale della fila alta dell'anello inferiore
  const vipC0=S.vip?Math.floor(colsLow*0.40):-1,vipC1=S.vip?Math.ceil(colsLow*0.60):-1;
  const seats=[];
  /* [7.187.0 direttiva PO «compattezza realistica»] GRANA SPAZIALE: l'occupazione era un tiro di dado
     INDIPENDENTE per ogni posto → a metà riempimento tutto il settore diventava un "sale e pepe" uniforme,
     che è esattamente ciò che uno stadio vero NON è (la gente siede in GRUPPI, interi blocchi restano vuoti,
     alcuni settori sono chiusi). Qui un rumore a BASSA FREQUENZA per colonna (interpolato, seedato col settore)
     modula la probabilità mantenendo la MEDIA invariata: stessa affluenza, aspetto realistico. L'ampiezza è
     massima a stadio mezzo pieno e si annulla a stadio pieno (dove non c'è nulla da raggruppare). */
  const _clBW=6+((_s>>>5)%4);// larghezza del blocco (6-9 colonne), seedata per settore
  const _clN=Math.ceil(Math.max(colsUp,colsLow)/_clBW)+2;
  const _clA=new Array(_clN);for(let i=0;i<_clN;i++)_clA[i]=rnd();
  const _clAmp=1.10*Math.max(0,Math.min(1,(1-fill)))*Math.max(0,Math.min(1,(0.98-fill)/0.18));
  /* il rumore va indicizzato sulla POSIZIONE RELATIVA (u=cl/colonne), non sulla colonna grezza: i due anelli hanno
     un numero di colonne diverso (colsUp=1.3*colsLow) e con l'indice grezzo i blocchi risultavano SFALSATI tra
     anello alto e basso (vuoti a scaletta, mai visti in uno stadio). */
  const _clSpan=Math.max(colsUp,colsLow);
  const _clAt=(u)=>{const t=u*_clSpan/_clBW,i=t|0,f=t-i,a=_clA[i]||0.5,b=_clA[i+1]!=null?_clA[i+1]:a;return a+(b-a)*(f*f*(3-2*f));};
  /* [7.187.0] SCALINATE/VOMITORI: in ogni settore reale ci sono corridoi di servizio SEMPRE liberi che tagliano la
     gradinata dall'alto in basso. Indicizzati anch'essi su u → allineati tra i due anelli. La probabilità degli altri
     posti è compensata (÷(1-1/aisleN)) così il numero di spettatori non cambia. */
  const _aisleN=11+((_s>>>9)%5),_aisleOff=(_s>>>13)%_aisleN,_aisleComp=1/(1-1/_aisleN);
  const _isAisle=(u)=>((Math.round(u*_clSpan)|0)%_aisleN)===_aisleOff;
  /* [7.187.0 P1] la rampa di profondità (le prime file si riempiono per prime) era `fill*1.30-(1-depth)*0.42`:
     una rampa NON centrata, che in media toglieva spettatori (a fill 0.55 se ne vedevano ~0.47) → lo stadio 3D
     mostrava meno gente di quella ANNUNCIATA dalla MatchdayCard, e nemmeno un sold-out risultava pieno. Ora la
     rampa è a MEDIA NULLA attorno al fill: stessa pendenza (davanti pieno, fondo vuoto), conteggio onesto. */
  const _nUp=rowsUp*colsUp,_nLo=rowsLow*colsLow;
  const _dMean=(_nUp*0.225+_nLo*0.75)/Math.max(1,(_nUp+_nLo));
  /* CALORE per settore: in curva si sta IN PIEDI e si canta anche a stadio semivuoto; in tribuna ci si alza
     solo quando la partita scotta → la quota di seduti scende con l'intensità (la curva parte già bassa). */
  const _seatedBase=(S.seated!=null?S.seated:0.4);
  const _seatedP=Math.max(0.02,_seatedBase*(1-(spec.ultras?0.55:0.42)*inten));
  const pushRow=(band,r,rowCols,cW,rH,by)=>{
    let _prevOcc=false;/* [7.187.0 P3] stato della catena: azzerato a ogni FILA (i gruppi non scavalcano le file) */
    // riempimento per fila: l'anello BASSO si riempie per primo (le file davanti prima) → a bassa
    // affluenza restano gruppetti sparsi in basso e anello alto vuoto, come negli stadi veri (§6)
    const depth=band==="up"?(r/(rowsUp-1))*0.45:0.5+(r/(rowsLow-1))*0.5;
    const rowFill=Math.max(0,Math.min(1,fill+(depth-_dMean)*0.85));/* [7.187.0 P1] rampa centrata sul fill medio */
    const dk=0.55+0.50*depth;// profondità: fondo più scuro, fronte in piena luce
    for(let cl=0;cl<rowCols;cl++){
      const bx=cl*cW;
      const vip=band==="low"&&r===0&&cl>=vipC0&&cl<vipC1;
      // spicchio ospiti in Tribuna Est (§5): colonne adiacenti alla Curva Nord
      const inWedge=!!S.wedge&&cl<Math.round(rowCols*S.wedge);
      const _u=cl/Math.max(1,rowCols);
      const _wf=(spec.wedgeFill!=null?spec.wedgeFill:fill);
      const _base=inWedge?Math.max(0,Math.min(1,_wf+(depth-_dMean)*0.85)):rowFill;
      let _p=Math.max(0,Math.min(1,(_base+(_clAt(_u)-0.5)*_clAmp)*_aisleComp));/* blocchi pieni/vuoti + compensazione corridoi */
      /* [7.187.0 P3] GRUPPI CONTIGUI: il dado indipendente per posto dava «sale e pepe» anche dentro i blocchi.
         Catena a 2 stati lungo la fila (si compra/abbona in gruppo, i vicini sono sempre gli stessi): la
         probabilità stazionaria resta ESATTAMENTE _p (nessun spettatore in più o in meno), cambia solo la
         DISPOSIZIONE — sequenze piene alternate a vuoti veri, come in una gradinata reale. */
      const _cK=(S.ultras?0.62:0.50);
      const _pc=_prevOcc?(_p+_cK*(1-_p)):(_p*(1-_cK));
      const occ=vip?true:(_isAisle(_u)?false:rnd()<_pc);
      _prevOcc=occ;
      if(!occ){seats.push({empty:true,bx,by,cW,rH,col:cl,seatCol:_shade(seatBase,(0.72+rnd()*0.2)*dk)});continue;}
      const isAwayFan=spec.isAway||inWedge;
      const teamCol=isAwayFan?awayHex:homeHex;
      const team=rnd()<(S.team!=null?S.team:0.6);
      const clBase=vip?"#23262e":(team?teamCol:CLOTHES[(rnd()*CLOTHES.length)|0]);
      const fam=!vip&&!!S.families&&rnd()<S.families;
      seats.push({empty:false,bx,by,cW,rH,col:cl,band,vip,fam,depth,
        x:bx+cW/2+(rnd()-.5)*cW*0.22,
        isH:!isAwayFan,base:teamCol,
        cloth:_shade(clBase,(0.80+rnd()*0.44)*dk),
        skin:_shade(SKINS[(rnd()*SKINS.length)|0],dk),
        hair:rnd()<0.08?null:_shade(HAIRS[(rnd()*HAIRS.length)|0],dk),// 8% calvi
        beard:band==="low"&&rnd()<0.22,
        cap:!vip&&rnd()<0.15,capCol:_shade(CLOTHES[(rnd()*CLOTHES.length)|0],dk),
        seated:vip?true:rnd()<_seatedP,/* [7.187.0] calore: più la gara scotta, più gente in piedi (la curva quasi sempre) */
        clapP:rnd(),// propensione all'applauso (desincronizzata, §3)
        flag:!vip&&band==="low"&&team&&rnd()<((S.flags||0)*(0.5+inten*1.2)),
        scarf:!vip&&team&&rnd()<((S.scarves||0)*(0.6+inten*0.8)),
        ph:rnd()*6.28,sp:0.8+rnd()*0.6});
    }
  };
  for(let r=0;r<rowsUp;r++)pushRow("up",r,colsUp,cWU,uH,r*uH);
  {let by=splitY;for(let r=0;r<rowsLow;r++){const rH=(H-splitY)*lw[r]/lwSum;pushRow("low",r,colsLow,cWL,rH,by);by+=rH;}}
  // tre viste della stessa canvas: anello basso / anello alto / intera (per gli angoli)
  // mipmap ON (canvas POT): senza, la texture inclinata degenera in shimmering beige a distanza (alias sui texel pelle)
  const mkTex=(offY,repY)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.offset.y=offY;t.repeat.y=repY;t.anisotropy=4;return t;};
  const texLow=mkTex(0,q.tierSplit),texUp=mkTex(q.tierSplit,1-q.tierSplit),texFull=mkTex(0,1);
  const lighten=(hex,k)=>{const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=r+(255-r)*k|0;g=g+(255-g)*k|0;b=b+(255-b)*k|0;return"rgb("+r+","+g+","+b+")";};
  const _pssT=(spec.passion!=null?spec.passion:0.6);
  const allowOla=fill>=(CROWD_CFG.anim.olaMinFill-_pssT*0.14)&&inten>=(CROWD_CFG.anim.olaMinIntensity-_pssT*0.10);// §7: ola solo a stadio caldo · [7.187.0] una piazza calda la lancia anche con meno gente
  const redraw=(now,goalSide,excite)=>{
    const t=(now||0)*0.001,ex=Math.max(0,Math.min(1,excite||0)),gs=goalSide||0;
    const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#0c0c18");gr.addColorStop(1,"#191926");
    ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="rgba(120,125,150,0.35)";ctx.fillRect(0,splitY-2,W,3);// ballatoio tra gli anelli
    const wf=((t*5)%(colsLow+10))-5;// fronte dell'OLA
    for(const s of seats){
      const{cW,rH}=s;
      // gradino/sedile: sempre disegnato; il posto vuoto mostra il SEDILE del club (affluenza leggibile)
      if(s.empty){ctx.fillStyle="#23232f";ctx.fillRect(s.bx+0.5,s.by+rH*0.70,cW-1,rH*0.30);
        ctx.fillStyle=s.seatCol;ctx.fillRect(s.bx+cW*0.18,s.by+rH*0.40,cW*0.64,rH*0.34);continue;}
      ctx.fillStyle="#2c2c3a";ctx.fillRect(s.bx+0.5,s.by+rH*0.70,cW-1,rH*0.30);
      const cheer=ex>0&&gs!==0&&(s.isH===(gs>0)),desp=ex>0&&gs!==0&&(s.isH!==(gs>0));
      const ola=(cheer||desp||!allowOla||s.band==="up")?0:Math.max(0,1-Math.abs(s.col-wf)/2.4)*(1-ex);
      // applauso individuale desincronizzato (§3): occasioni/parate (eccitazione media), non tutti insieme
      const clap=!s.vip&&s.band==="low"&&ex>0.06&&ex<0.75&&gs===0&&s.clapP<0.55&&Math.sin(t*9+s.ph)>0.15;
      // micro-vita a riposo: ogni tanto QUALCUNO si alza/si risiede (mai in sincrono)
      const standUp=!s.vip&&s.seated&&(cheer||ola>0.4||(inten>0.3&&Math.sin(t*0.09*s.sp+s.ph*3.1)>0.965));
      const sit=s.seated&&!standUp;
      let dy,lift,armsUp,scarfUp,flagWave;
      if(s.vip){dy=0;lift=0;armsUp=false;scarfUp=false;flagWave=false;}
      else if(cheer){dy=-(0.5+0.5*Math.abs(Math.sin(t*8+s.ph)))*rH*0.75*ex;lift=0.55*ex;armsUp=ex>0.2;scarfUp=true;flagWave=true;}
      else if(desp){dy=rH*0.24*ex;lift=-0.5*ex;armsUp=false;scarfUp=false;flagWave=false;}
      else{dy=Math.sin(t*s.sp+s.ph)*rH*0.05-ola*rH*0.55;lift=ola*0.55;armsUp=ola>0.5||clap;scarfUp=ola>0.4||(inten>0.88&&Math.sin(t*0.6+s.ph)>0.55);flagWave=true;}
      if(sit)dy+=rH*0.16;// seduto: figura più bassa
      const y=s.by+rH*0.7+dy;
      const bodyCol=lift>0.01?lighten(s.cloth,Math.min(0.85,lift)):(lift<-0.01?"#202028":s.cloth);
      if(s.band==="up"){
        // ── LOD3/4 (anello alto): figure minime ma vive — corpo, testa, capelli nelle file più vicine
        ctx.fillStyle=bodyCol;ctx.fillRect(s.x-cW*0.30,y-rH*0.10,cW*0.60,rH*(sit?0.36:0.46));
        ctx.fillStyle=s.skin;ctx.fillRect(s.x-cW*0.16,y-rH*0.34,cW*0.32,rH*0.26);
        if(s.depth>0.18&&s.hair){ctx.fillStyle=s.hair;ctx.fillRect(s.x-cW*0.16,y-rH*0.38,cW*0.32,rH*0.12);}
        if(s.scarf&&scarfUp){ctx.fillStyle=s.base;ctx.fillRect(s.x-cW*0.34,y-rH*0.46,cW*0.68,rH*0.10);}
        continue;
      }
      // ── LOD2 (anello basso): tifoso dettagliato — corpo+spalle, testa, capelli/cappellino/barba, braccia, bandiera/sciarpa
      const bs=sit?0.80:1;// seduto: busto compresso
      ctx.fillStyle=bodyCol;
      ctx.fillRect(s.x-cW*0.32,y-rH*0.08*bs,cW*0.64,rH*0.44*bs);
      ctx.fillRect(s.x-cW*0.26,y-rH*0.14*bs,cW*0.52,rH*0.10);
      if(s.fam){// famiglia (§5 tribune): bimbo accanto, mezza figura con colori vivaci
        ctx.fillStyle=lighten(s.base,0.35);ctx.fillRect(s.x+cW*0.30,y+rH*0.06,cW*0.26,rH*0.22);
        ctx.fillStyle=s.skin;ctx.beginPath();ctx.arc(s.x+cW*0.43,y+rH*0.00,cW*0.11,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=s.skin;ctx.beginPath();ctx.arc(s.x,y-rH*0.22*bs,cW*0.22,0,Math.PI*2);ctx.fill();
      if(s.beard){ctx.fillStyle=_shade(s.hair||"#3d2000",0.8);ctx.fillRect(s.x-cW*0.13,y-rH*0.18*bs,cW*0.26,rH*0.09);}
      if(s.vip){ctx.fillStyle="#e8e8ee";ctx.fillRect(s.x-cW*0.07,y-rH*0.06,cW*0.14,rH*0.14);}// camicia VIP
      if(s.hair){ctx.fillStyle=s.hair;ctx.beginPath();ctx.arc(s.x,y-rH*0.30*bs,cW*0.22,Math.PI,Math.PI*2);ctx.fill();}
      if(s.cap){ctx.fillStyle=s.capCol;ctx.beginPath();ctx.arc(s.x,y-rH*0.31*bs,cW*0.23,Math.PI*1.02,Math.PI*1.98);ctx.fill();ctx.fillRect(s.x-cW*0.02,y-rH*0.33*bs,cW*0.28,rH*0.04);}
      if(armsUp){ctx.strokeStyle=s.skin;ctx.lineWidth=Math.max(1.4,cW*0.13);ctx.beginPath();
        if(clap&&!(ola>0.5)){ctx.moveTo(s.x-cW*0.20,y-rH*0.02);ctx.lineTo(s.x-cW*0.10,y-rH*0.34);ctx.moveTo(s.x+cW*0.20,y-rH*0.02);ctx.lineTo(s.x+cW*0.10,y-rH*0.34);}// mani che si uniscono (applauso)
        else{ctx.moveTo(s.x-cW*0.20,y-rH*0.02);ctx.lineTo(s.x-cW*0.32,y-rH*0.56);ctx.moveTo(s.x+cW*0.20,y-rH*0.02);ctx.lineTo(s.x+cW*0.32,y-rH*0.56);}
        ctx.stroke();}
      if(s.flag){const fw=flagWave?Math.sin(t*2.6+s.ph)*cW*0.18:0;ctx.fillStyle="#cfcfe0";ctx.fillRect(s.x+cW*0.1,y-rH*(desp?0.6:0.95),1.8,rH*(desp?0.5:0.72));if(!desp){ctx.fillStyle=s.base;ctx.fillRect(s.x+cW*0.1+fw,y-rH*0.95,cW*0.5,rH*0.24);}}
      if(s.scarf){const sy=scarfUp?y-rH*0.5*Math.max(ex,ola,inten>0.88?0.5:0):y+rH*0.05;ctx.fillStyle=s.base;ctx.fillRect(s.x-cW*0.32,sy,cW*0.64,rH*0.11);}
    }
    // VIP box (Tribuna Ovest): vetrata scura con cornice — sopra i posti, prima dello striscione
    if(S.vip){ctx.fillStyle="rgba(14,18,30,0.42)";ctx.fillRect(vipC0*cWL,splitY,(vipC1-vipC0)*cWL,(H-splitY)*lw[0]/lwSum);
      ctx.strokeStyle="rgba(212,175,55,0.55)";ctx.lineWidth=2;ctx.strokeRect(vipC0*cWL+1,splitY+1,(vipC1-vipC0)*cWL-2,(H-splitY)*lw[0]/lwSum-2);}
    // STRISCIONI ultras (§5/§9): fascia sulla balaustra davanti alla prima fila, solo curva calda
    if(S.banner&&fill>0.45){const bh=13,by=H-bh;const segW=W/7;
      for(let i=0;i<7;i++){ctx.fillStyle=i%2?_shade(spec.isAway?awayHex:homeHex,0.55):(spec.isAway?awayHex:homeHex);
        ctx.fillRect(i*segW+3,by,segW-6,bh-2);}
      ctx.fillStyle="rgba(255,255,255,0.85)";for(let i=0;i<7;i++)ctx.fillRect(i*segW+segW*0.22,by+bh*0.38,segW*0.56,2);}
    texLow.needsUpdate=true;texUp.needsUpdate=true;texFull.needsUpdate=true;
  };
  redraw(0,0,0);// primo frame statico
  return {texLow,texUp,texFull,redraw};
}
if(typeof window!=='undefined')window.__CPM_makeCrowdTex=makeCrowdTex;// esposto per collaudo drawing-logic

function getStadiumPalette(club){
  // Helper: hex string/number → {r,g,b} 0-1
  const toRGB=h=>{const n=typeof h==='string'?parseInt(h.replace('#',''),16):h;return{r:((n>>16)&255)/255,g:((n>>8)&255)/255,b:(n&255)/255};};
  const toHex=(r,g,b)=>((Math.round(Math.max(0,Math.min(1,r))*255)<<16)|(Math.round(Math.max(0,Math.min(1,g))*255)<<8)|Math.round(Math.max(0,Math.min(1,b))*255));
  const lerp=(a,b,t)=>a+(b-a)*t;

  const lg=club?.lg||"Lega A";
  const pres=club?.p||65;
  const clubHex=club?.c||'#3a7bd5';
  const idHash=club?.id?club.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0):42;

  // League base palettes — more dramatic, clearly different hues
  const bases={
    // Lega A: deep midnight blue
    "Lega A":      {skyT:0x030818,skyH:0x0c2050,fog:0x061430,gA:0x1e4a0a,gB:0x184008,gC:0x224e0c,aCol:0xd0e4ff,aInt:0.50,flood:0xd8eeff},
    "Lega B":      {skyT:0x050a18,skyH:0x0e2240,fog:0x081628,gA:0x1c4808,gB:0x163c06,gC:0x204c0a,aCol:0xc8dcff,aInt:0.44,flood:0xcce4ff},
    // Premier Division: cold slate grey — like a rainy Manchester night
    "Premier Division":{skyT:0x080c10,skyH:0x1a2830,fog:0x101c22,gA:0x205818,gB:0x1a4c14,gC:0x24601c,aCol:0xb8d4ee,aInt:0.56,flood:0xc0d8ee},
    "Championship":{skyT:0x090d12,skyH:0x182230,fog:0x0e1a24,gA:0x1e5616,gB:0x184a12,gC:0x225e1a,aCol:0xb4d0e8,aInt:0.48,flood:0xb8d4e8},
    // 1. Liga: crisp cold white — Dortmund/Bayern broadcast look
    "Deutsche Liga":   {skyT:0x04060e,skyH:0x0c1828,fog:0x081020,gA:0x245a12,gB:0x1e500e,gC:0x285e16,aCol:0xfff5e8,aInt:0.62,flood:0xfff8ee},
    "Deutsche Liga 2":{skyT:0x06080e,skyH:0x0e1a28,fog:0x0a1220,gA:0x225810,gB:0x1c4e0c,gC:0x265c14,aCol:0xfff0e0,aInt:0.52,flood:0xfff0e0},
    // Ligue Nationale: deep purple-violet — Parc des Princes nocturne
    "Ligue Nationale":      {skyT:0x0a0416,skyH:0x280a48,fog:0x14062c,gA:0x1c5210,gB:0x16480c,gC:0x205614,aCol:0xe0ccff,aInt:0.48,flood:0xe4d0ff},
    "Ligue Nationale 2":      {skyT:0x08031a,skyH:0x1e0838,fog:0x100424,gA:0x1a500e,gB:0x14460a,gC:0x1e5412,aCol:0xd8c8ff,aInt:0.44,flood:0xd8c8ff},
    // Primera División: warm orange desert dusk — Camp Nou / Bernabeu summer nights
    "Liga Ibérica":      {skyT:0x1c0800,skyH:0x481800,fog:0x2c1000,gA:0x385810,gB:0x2e4c0a,gC:0x3e6014,aCol:0xffe8c0,aInt:0.60,flood:0xffe8b0},
    "Liga Ibérica 2":{skyT:0x180600,skyHorizon:0x3c1400,fog:0x240e00,gA:0x345608,gB:0x2a4a05,gC:0x395e0c,aCol:0xffe0b0,aInt:0.52,flood:0xffdca8},
    // Primeira Liga: teal Atlantic coast — rainy nights in Lisbon/Porto
    "Liga Lusitana":{skyT:0x020c0e,skyH:0x082030,fog:0x051620,gA:0x205a14,gB:0x1a4e10,gC:0x245e18,aCol:0xc0eeff,aInt:0.54,flood:0xb8f0ff},
    // Eredivisie: dark grey-blue — windy Amsterdam
    "Liga Oranje":   {skyT:0x060a0e,skyH:0x121e28,fog:0x0c1820,gA:0x225a14,gB:0x1c4e10,gC:0x265e18,aCol:0xc8dcf0,aInt:0.52,flood:0xc8dcf0},
    // Pro League: very dark, cold
    "Liga Belga":   {skyT:0x050810,skyH:0x101e2e,fog:0x0c1828,gA:0x1e5812,gB:0x184c0e,gC:0x225c16,aCol:0xbcd4ee,aInt:0.50,flood:0xbcd4f0},
    // Süper Lig: warm brick red — Istanbul summer nights
    "Liga Anatolica":    {skyT:0x140400,skyH:0x380c00,fog:0x240800,gA:0x305c0e,gB:0x28500a,gC:0x366412,aCol:0xffe0c8,aInt:0.56,flood:0xffd8b0},
  };
  const b=bases[lg]||bases["Lega A"];

  // Per-club: blend club primary colour into sky horizon (30% weight, max capped)
  const cr=toRGB(clubHex);
  const hr=toRGB(b.skyH||b.skyT);
  const t=0.30; // blend strength
  const blendedH=toHex(
    Math.min(lerp(hr.r,cr.r*0.45,t),0.38),
    Math.min(lerp(hr.g,cr.g*0.45,t),0.38),
    Math.min(lerp(hr.b,cr.b*0.45,t),0.38)
  );

  // Per-club grass tone: ±6% brightness shift from id hash
  const gv=((idHash%7)-3)*0.02; // -0.06 to +0.06
  const adjG=hex=>{const {r,g,b}=toRGB(hex);return toHex(r+gv,g+gv*1.1,b+gv*0.8);};

  // Per-club fog: blend club colour subtly (15%)
  const fr=toRGB(b.fog);
  const blendedFog=toHex(
    Math.min(lerp(fr.r,cr.r*0.25,0.15),0.22),
    Math.min(lerp(fr.g,cr.g*0.25,0.15),0.22),
    Math.min(lerp(fr.b,cr.b*0.25,0.15),0.22)
  );

  // Flood light: prestige tiers (warm for elite, cool for lower)
  const flood=pres>85?0xfff8ee:pres>70?b.flood||0xf4f8ff:pres>55?0xeef4ff:0xe8eeff;

  return {
    skyTop:b.skyT,
    skyHorizon:blendedH,
    fog:blendedFog,
    grassA:adjG(b.gA),
    grassB:adjG(b.gB),
    grassC:adjG(b.gC),
    ambient:b.aCol,
    ambInt:b.aInt,
    flood,
  };
}

// ── LOGO DEL GIOCO su canvas (per le texture 3D) — replica di LogoMark / BallO / Wordmark ──────────
function _cvRoundRect(x,g,y,w,h,r){x.beginPath();x.moveTo(g+r,y);x.arcTo(g+w,y,g+w,y+h,r);x.arcTo(g+w,y+h,g,y+h,r);x.arcTo(g,y+h,g,y,r);x.arcTo(g,y,g+w,y,r);x.closePath();}
// pallone bianco/nero (stile BallO): cerchio + pentagono centrale + 5 al bordo (ritagliati)
function _cvBall(x,cx,cy,r){
  x.save();
  x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fillStyle="#fff";x.fill();
  x.lineWidth=Math.max(0.8,r*0.12);x.strokeStyle="#1e293b";x.stroke();
  x.beginPath();x.arc(cx,cy,r,0,6.2832);x.clip();
  const sc=r/10.3,P=[[12,8.5,15.33,10.92,14.06,14.83,9.94,14.83,8.67,10.92],[16.06,6.42,14.82,2.62,18.05,0.27,21.29,2.62,20.05,6.42],[18.56,14.13,21.8,11.78,25.03,14.13,23.79,17.93,19.8,17.93],[12,18.9,15.23,21.25,14,25.05,10,25.05,8.77,21.25],[5.44,14.13,4.2,17.93,0.21,17.93,-1.03,14.13,2.2,11.78],[7.94,6.42,3.95,6.42,2.71,2.62,5.95,0.27,9.18,2.62]];
  x.fillStyle="#1e293b";
  for(const p of P){x.beginPath();for(let i=0;i<p.length;i+=2){const X=cx+(p[i]-12)*sc,Y=cy+(p[i+1]-12)*sc;i===0?x.moveTo(X,Y):x.lineTo(X,Y);}x.closePath();x.fill();}
  x.restore();
}
// badge del gioco (stile LogoMark): quadrato arrotondato granata + 3 barre bianche ascendenti + pallone
function _cvLogoBadge(x,cx,cy,s){
  x.save();x.translate(cx-s/2,cy-s/2);const k=s/100;x.scale(k,k);
  const g=x.createLinearGradient(0,0,100,100);g.addColorStop(0,"#a3263a");g.addColorStop(1,"#5e0f1d");
  x.fillStyle=g;_cvRoundRect(x,2,2,96,96,27);x.fill();
  x.translate(50,52);x.scale(0.8,0.8);x.translate(-51.75,-38.5);
  x.fillStyle="#fff";_cvRoundRect(x,24,46,15,26,7);x.fill();_cvRoundRect(x,43,36,15,36,7);x.fill();_cvRoundRect(x,62,24,15,48,7);x.fill();
  _cvBall(x,69.5,15,10);
  x.restore();
}
// [6.69.0] wordmark "Korward" (la "o" è il pallone) + SOTTOTITOLO "Elite" corsivo ambra IMPILATO sotto, centrato. Ritorna la larghezza di "Korward".
//   color!=null → forza mono (cartelloni monocromatici). ⚠ il blocco di misura lascia x.font=fElite → il fill RE-IMPOSTA fMain prima di "K"/"rward".
function _cvWordmark(x,cx,cy,h,color,outline){
  const gran=color||"#a3263a";
  const amber=color||"#f59e0b";
  const fMain="900 "+Math.round(h*1.0)+"px 'Segoe UI',Arial,sans-serif";
  const eH=Math.max(9,Math.round(h*(0.42)))*1,eSmall=eH<15;
  const eScriptH=Math.round(eH*1.3);// Great Vibes ha x-height piccola → ingrandita
  const fElite=eSmall?("italic 700 "+eH+"px Arial,sans-serif"):("400 "+eScriptH+"px 'KWScript','Segoe Script','Brush Script MT','Snell Roundhand','Apple Chancery',cursive");
  const br=h*0.30,gap=h*0.02;
  x.textBaseline="alphabetic";x.textAlign="left";
  x.font=fMain;const wK=x.measureText("K").width,wR=x.measureText("rward").width;
  const total=wK+gap+br*2+gap+wR;
  let px=cx-total/2;const baseY=cy+h*0.34;
  const ballCy=baseY-h*0.30,xR=px+wK+gap+br*2+gap;
  let kFill=gran;
  if(!color){const g=x.createLinearGradient(0,baseY-h,0,baseY+h*0.2);g.addColorStop(0,"#a3263a");g.addColorStop(1,"#5e0f1d");kFill=g;}
  if(outline){x.lineWidth=Math.max(2,h*0.09);x.strokeStyle="rgba(7,12,26,0.95)";x.lineJoin="round";
    x.font=fMain;x.strokeText("K",px,baseY);x.strokeText("rward",xR,baseY);}
  x.font=fMain;x.fillStyle=kFill;// ⚠ CRITICO: re-imposta fMain (la misura ha lasciato fElite)
  x.fillText("K",px,baseY);
  _cvBall(x,px+wK+gap+br,ballCy,br);
  x.fillText("rward",xR,baseY);
  // sottotitolo "Elite" centrato sotto
  const eY=baseY+eH*1.08;x.font=fElite;x.textAlign="center";
  if(outline){x.lineWidth=Math.max(1.5,eH*0.12);x.strokeStyle="rgba(7,12,26,0.95)";x.lineJoin="round";x.strokeText("Elite",cx,eY);}
  x.fillStyle=amber;x.fillText("Elite",cx,eY);
  x.textAlign="left";
  return total;
}

function buildStadium(scene,homeHex,awayHex,stadCfg={prestige:65,style:0}){
  // Scale by prestige: XL(>88) / LG(>72) / MD(>55) / SM(<55)
  const p=typeof stadCfg==="number"?stadCfg:stadCfg.prestige||65;
  const style=typeof stadCfg==="object"?stadCfg.style||0:0;
  // [6.1.0 VERIFICA MASSIVA PO «stadi piccoli»] la taglia viene dalla CAPIENZA (fonte di verità di
  //   stadiumConfigFor), non più dal solo prestigio: un 61k non può essere geometria LG con curva 13u.
  const _capB=(typeof stadCfg==="object"&&stadCfg.tpl&&stadCfg.tpl.capacity)||null;
  const xl=_capB?_capB>=45000:p>88,lg=_capB?_capB>=26000:p>72,md=_capB?_capB>=12000:p>55;
  // [5.88.0 STADI S2] ASSEMBLATORE: i parametri architettonici arrivano dal template (stadiumConfigFor);
  //   senza template (tpl assente) ogni valore ricade sul comportamento legacy ESATTO → zero regressioni.
  const T=stadCfg.tpl||null;
  const _dK=T?Math.min(T.dist||1,xl?1.00:lg?1.04:1.08):1;// [6.1.0] clamp: mai più il fossato da pista (gap misurati fino a 36u)
  const _hGrad61=_capB?(xl?clamp((_capB-45000)/37000,0,1)*0.20:lg?clamp((_capB-26000)/19000,0,1)*0.18:md?clamp((_capB-12000)/14000,0,1)*0.15:clamp((_capB-3000)/9000,0,1)*0.12):0;// [6.1.0] gradazione DENTRO la classe: 43k ≠ 27k
  const _hK=(T?T.standH:1)*(1+_hGrad61);
  const endZ=(xl?64:lg?56:md?50:44)*_dK;
  let sideX=(xl?78:lg?70:md?64:58)*_dK;
  const endH=(xl?22:lg?16:md?13:10)*_hK*((T&&T.asym)?0.55:1);// sudamericano: una tribuna bassa (asimmetria reale)
  const sideH=(xl?20:lg?14:md?11:8)*_hK;
  const _sudH=sideH*((T&&T.megaCurva)?1.28:1);// tedesco: il "muro" — curva di casa alta ma NON esagerata [6.5.1 Polish D: 1.5→1.28, ~-15%, segnalazione PO]
  const _tiers=T?(!stadCfg.isDesktop?Math.min(T.rings,2):T.rings):2;// mobile cap: max 2 anelli
  const _roofT=T?T.roof:"legacy";// none | west | partial | full | legacy
  const _fenceT=T?T.fence:"legacy";
  const _towerT=T?T.tower:"legacy";
  const endD=xl?28:lg?20:md?16:13;
  const sideD=xl?26:lg?20:md?16:13;
  // [7.71.0 collaudo PO «in alcuni stadi (es. Everton/inglese) la porta non si vede e i cartelloni della curva sono
  //   nascosti»] CAUSA: col template `inglese` (dist 0.85) la curva dietro-porta si avvicina troppo → la sua BASE
  //   (profonda sideD+3) arrivava a world-x ~46-50, DAVANTI ai cartelloni (x=50.2) e ADDOSSO alla porta (48.6),
  //   nascondendoli. FIX template-agnostico: la curva dietro-porta non entra MAI oltre un margine dietro i cartelloni
  //   (front della base ≥ ~51.3). Vale per ogni template/taglia → porta+cartelloni sempre liberi. (endZ/lati intatti.)
  sideX=Math.max(sideX,51.3+((_sudH>sideH?sideD*1.15:sideD)+3)/2);
  const endW=xl?126:lg?118:md?110:100;
  const sideW=xl?84:lg?76:md?68:60;
  // 3DV-12: rimosso crowdBias generico — ora 4 texture separate per settore
  // Style variation: 0=standard, 1=modern dark, 2=compact bowl, 3=traditional
  const roofOpacity=style===1?0.90:style===2?0.70:0.80;
  const roofColor=style===1?0x333344:style===3?0x888877:0x555566;
  const floodH=xl?32:lg?28:md?24:20; // floodlight pole height
  const cM=new THREE.MeshLambertMaterial({color:(stadCfg.tpl&&stadCfg.tpl.wallTone===1)?0x3d3833:0x32323e});// [5.92.0] cemento caldo/freddo per club
  const stM=new THREE.MeshLambertMaterial({color:0x808088});
  const roofColor92=(stadCfg.tpl&&stadCfg.tpl.roofTone!=null)?[roofColor,0x3a3a46,0x6a6a75][stadCfg.tpl.roofTone]||roofColor:roofColor;// [5.92.0] tono tetto per club
  const roofM=new THREE.MeshLambertMaterial({color:roofColor92,transparent:true,opacity:roofOpacity});
  /* [7.437.0 EVOLUTIVA STADI — direttiva PO «coperture: priorità assoluta», livelli piccolo/medio/
     importante/prestigioso] IL LIVELLO ARCHITETTONICO deriva dai parametri GIA' esistenti (capienza
     dal profilo piazza + modernita' del template): 0 provincia (pensilina o nulla) · 1 medio (sbalzo
     con travi) · 2 importante (copertura profonda, reticolo, fascia plexi) · 3 prestigioso
     (monumentale: piloni, stralli, sottotetto illuminato). Nessun campo nuovo nel save. */
  const _lvl437=(function(){const _cp=_capB||((typeof stadCfg==="object"&&stadCfg.tpl&&stadCfg.tpl.capacity))||18000;const _md=(T&&T.mod)||0.4;
    let _l=(_cp>=40000||(_cp>=30000&&_md>=0.7))?3:(_cp>=24000)?2:(_cp>=12000)?1:0;
    /* il TEMPLATE ha una dignita' propria: un 3-anelli/muro/moderno non porta mai la pensilina di
       provincia, qualunque sia la capienza del giorno (vale anche per il force-hook di collaudo) */
    if(T){if(T.rings>=3||T.megaCurva||_md>=0.75)_l=Math.max(_l,2);else if(T.rings>=2)_l=Math.max(_l,1);}
    if(_cp>=52000&&_md>=0.6)_l=3;
    return _l;})();
  const _roofDarkM=new THREE.MeshLambertMaterial({color:0x23262c});/* sottotetto */
  const _plexiM=new THREE.MeshLambertMaterial({color:0xcfe4f2,transparent:true,opacity:0.18,side:THREE.DoubleSide});
  const _ledM437=new THREE.MeshBasicMaterial({color:0xdfe9f5});/* fascia luminosa sottocopertura (basic = sempre accesa) */
  const _aisleM437=new THREE.MeshLambertMaterial({color:0x9aa3ad});/* scale/corridoi radiali */
  const _steelDark437=new THREE.MeshLambertMaterial({color:0x3a4048});/* [7.438.0 collaudo PO «cosa sono questi fili bianchi sulla copertura?? brutti!»] travi e stralli in acciaio SCURO: i cilindri sottili in stM chiaro, a bassa risoluzione, diventavano fili bianchi sulla falda */
  const _vomM437=new THREE.MeshLambertMaterial({color:0x14161c});/* vomitori (accessi scuri) */
  // ── CROWD 2.0 §5 — distribuzione settori dal contesto (computeCrowdContext) + CROWD_CFG.sectors ──
  // Curva Sud (x=+sideX, LATO TABELLONE) SOLO casa/ultras · Curva Nord (x=-sideX) SOLO ospiti (riempita
  // da awayFill: derby=piena, provino=vuota) · Tribuna Est (z=+endZ) casa+famiglie+spicchio ospiti ·
  // Tribuna Ovest (z=-endZ) casa/famiglie/VIP. Mai gruppi ospiti fuori da Nord+spicchio Est.
  const crowd=stadCfg.crowd||{fill:0.9,awayFill:0.5,intensity:0.6,tier:"league",seed:1};
  const isMob=!stadCfg.isDesktop;
  const SEC=CROWD_CFG.sectors;
  /* [7.187.0 direttiva PO «rendi realistica la COMPATTEZZA del tifo»] finora OGNI settore usava lo stesso fill:
     a metà riempimento anche la curva era mezza vuota — irreale. In uno stadio vero la CURVA (abbonati, ultras) è
     l'ultimo settore a svuotarsi e le TRIBUNE le prime. Qui il riempimento viene REDISTRIBUITO tra i settori a
     somma quasi costante (i posti aggiunti in curva vengono tolti alle tribune, pesati per larghezza) → la
     affluenza dichiarata resta veritiera, cambia solo DOVE sta la gente. L'effetto scala con passione e fedeltà
     della piazza e si spegne sotto il 10% di riempimento (provini/amichevoli: nessun nucleo organizzato). */
  const _pssC=((crowd.passion!=null?crowd.passion:(crowd.profile&&crowd.profile.passion))||60)/100;
  const _loyC=((crowd.loyalty!=null?crowd.loyalty:(crowd.profile&&crowd.profile.loyalty))||60)/100;
  const _bfC=Math.max(0,Math.min(1,crowd.fill||0));
  const _ultrasOn=crowd.tier!=="trial"&&_bfC>=0.10;
  const _curvaK=(0.40+0.34*_pssC)*(0.60+0.40*_loyC)*Math.max(0,Math.min(1,(_bfC-0.10)/0.25))*(_ultrasOn?1:0);
  const _fillCurva=Math.min(1,_bfC+(1-_bfC)*_curvaK);
  const _awBase=Math.max(0,Math.min(1,crowd.awayFill||0));
  const _fillCurvaAw=Math.min(1,_awBase+(1-_awBase)*_curvaK*0.85);/* anche il settore ospiti è compatto (chi viaggia è il nucleo) */
  const _movedC=(_fillCurva-_bfC)*sideW+(_fillCurvaAw-_awBase)*sideW*0.35;// posti spostati nelle curve
  const _fillTrib=Math.max(0.03,_bfC-_movedC/(2*Math.max(1,endW)));// tolti equamente alle due tribune
  const mkSpec=(key,sec,isAway,width,fillOv,rowsMul)=>({key,homeHex,awayHex,width,isMobile:isMob,seedKey:key+"_"+(crowd.seed||0),
    fill:fillOv!=null?fillOv:crowd.fill,intensity:Math.max(0,Math.min(1,(crowd.intensity||0.6)*((sec&&sec.heat)||1))),isAway,sector:sec,wedgeFill:crowd.awayFill,rowsMul:rowsMul||1,/* [7.187.0] calore PER SETTORE */
    passion:_pssC,ultras:!!(sec&&sec.ultras)&&_ultrasOn});
  /* [6.2.0 CROWD-SCALE, collaudo PO «tifosi giganti»] file derivate dall ALTEZZA REALE coperta dalla
     texture con TIFOSO-TARGET ~0.9u (giocatori ~1.9u): anello unico = muro intero con texFull (fronte
     grande + fondo fitto = LOD naturale), 2-3 anelli = banda bassa (52%) sull anello inferiore.
     Il moltiplicatore 5.92 era inefficace sull anello basso (lw fissa a 6 file → extra NaN). */
  const _q92=CROWD_CFG.quality;
  const _rmFor=(sH,oneTier)=>{const covered=oneTier?Math.max(4,sH-2):Math.max(3,sH*0.62-3);
    return Math.max(0.55,Math.min(3.4,(covered/0.9)/(oneTier?(_q92.rowsLow+_q92.rowsUp):_q92.rowsLow)));};
  const _sud1T=!!(T&&T.megaCurva)||_tiers===1,_est1T=!!(T&&T.asym)||_tiers===1;
  const _sudRM=_rmFor(_sudH,_sud1T),_endRM=_rmFor(endH,_est1T),_ovRM=_rmFor(endH,_tiers===1),_nrdRM=_rmFor(sideH,_tiers===1);
  // [6.78.0 direttiva PO] FINALE in campo neutro = TIFO 50/50: Est e Ovest divise a metà tra le due
  //   tifoserie (wedge 0.5, colonne lato Nord = ospiti), curve invariate (Sud casa piena, Nord ospiti piena).
  const _finE=crowd.isFinal?{...SEC.tribunaEst,wedge:0.5}:SEC.tribunaEst;
  const _finO=crowd.isFinal?{...SEC.tribunaOvest,wedge:0.5}:SEC.tribunaOvest;
  const _sud=makeCrowdTex(mkSpec("curvaSud",SEC.curvaSud,false,sideW,_fillCurva,_sudRM));/* [7.187.0] curva compatta */
  const _nord=makeCrowdTex(mkSpec("curvaNord",SEC.curvaNord,true,sideW,_fillCurvaAw,_nrdRM));
  const _est=makeCrowdTex(mkSpec("tribunaEst",_finE,false,endW,_fillTrib,_endRM));/* [7.187.0] tribune: le prime a svuotarsi */
  const _ovest=makeCrowdTex(mkSpec("tribunaOvest",_finO,false,endW,_fillTrib,_ovRM));
  const crowdAnims=[_ovest.redraw,_est.redraw,_sud.redraw,_nord.redraw];

  // Helper: gradinata a DUE ANELLI inclinati verso il campo (§1 profondità reale, via muro piatto)
  // + LOD1 (§2): prime file di BUSTI 3D instanziati (2 draw call per settore, bob solo nei burst)
  /* [7.301.0 richiesta PO «striscioni con logo e nome della competizione sui muretti delle tribune»] Fascia
     brandizzata sul MURETTO (la base in cemento davanti a ogni settore, la stessa quota a cui il 3DV-TIFO appende
     gli striscioni): fondo scuro, filetti nel colore della competizione e il motivo «badge + NOME» ripetuto, come
     le fasce a bordo campo delle coppe vere. UNA texture per tutto lo stadio, ripetuta per la larghezza del
     settore → 4 mesh e 1 canvas: costo trascurabile anche su mobile. */
  const _compBanner=(function(){try{
    const _c=(stadCfg.comp&&stadCfg.comp.lbl)?stadCfg.comp:null;if(!_c)return null;
    /* [7.309.0 collaudo PO «gli striscioni della competizione si accavallano tra di loro» + «per logo intendo
       ad esempio il logo con le stelle della bandiera europea e l'acronimo KCC»]
       DUE difetti nella prima stesura. (a) ACCAVALLAMENTO: la piastrella era larga 512px ma il nome ci veniva
       scritto a 58px senza misurarlo — «KORWARD CHAMPIONS CUP» occupa ~670px, quindi sbordava DENTRO la
       piastrella successiva e si sovrapponeva al suo motivo: da qui il «KORWARD CHA…KORWARD CH» dello
       screenshot. (b) IL LOGO: era il badge generico del gioco, non un marchio della COMPETIZIONE.
       Ora ogni piastrella contiene UN solo motivo, costruito per non toccare mai i bordi: emblema a CORONA
       DI STELLE nel colore della competizione con la SIGLA al centro (KCC/KEC/KCF…), poi la sigla in grande
       e il nome per esteso sotto — entrambi FIT-TO-WIDTH (misurati e rimpiccioliti finche' entrano nello
       spazio disponibile), quindi nessun testo puo' piu' invadere la piastrella accanto. */
    const cv=document.createElement("canvas");cv.width=1024;cv.height=128;const x=cv.getContext("2d");
    const col=_c.col||"#d27f8c";
    const nm=String(_c.lbl||"").toUpperCase().replace(/\s+/g," ").trim();
    /* la SIGLA: quella ufficiale del gioco se il nome e' una coppa europea, altrimenti le iniziali delle
       parole (KORWARD CHAMPIONS CUP → KCC · LEGA A → LA), sempre 2-4 lettere. */
    const _sig=(function(){try{
      if(typeof EURO_SIGLA==="object")for(const k in EURO_SIGLA){const v=EURO_SIGLA[k];if(v&&nm.indexOf(v)>=0)return v;}
      const w=nm.split(/[^A-ZÀ-Ý0-9]+/).filter(t=>t&&!/^(DI|DE|DEL|DELLA|IL|E)$/.test(t));/* i token di UNA lettera/cifra contano: sono i marcatori di categoria (LEGA A → LA · PRIMAVERA 1 → P1) */
      const ini=w.map(t=>t[0]).join("");
      return (ini.length>=2?ini:nm.replace(/[^A-Z0-9]/g,"")).slice(0,4)||"CUP";
    }catch(_e){return "CUP";}})();
    const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,"#111a27");g.addColorStop(0.5,"#0b1220");g.addColorStop(1,"#0a0f1a");
    x.fillStyle=g;x.fillRect(0,0,1024,128);
    x.fillStyle=col;x.globalAlpha=0.9;x.fillRect(0,0,1024,7);x.fillRect(0,121,1024,7);x.globalAlpha=1;
    /* testo che si RIMPICCIOLISCE finche' entra: la misura e' la sola difesa contro lo sbordo */
    const _fit=(txt,maxW,px,weight)=>{let f=px;x.font=(weight||"800")+" "+f+"px system-ui,Segoe UI,Arial";
      let w=x.measureText(txt).width;
      while(w>maxW&&f>10){f-=1;x.font=(weight||"800")+" "+f+"px system-ui,Segoe UI,Arial";w=x.measureText(txt).width;}
      return f;};
    /* EMBLEMA: corona di 12 stelle (come le bandiere delle competizioni continentali) + sigla al centro */
    const _star=(cx,cy,r,rot)=>{x.beginPath();
      for(let i=0;i<10;i++){const a=rot+i*Math.PI/5,rr=(i%2===0)?r:r*0.44;
        const px2=cx+Math.cos(a-Math.PI/2)*rr,py2=cy+Math.sin(a-Math.PI/2)*rr;
        i?x.lineTo(px2,py2):x.moveTo(px2,py2);}
      x.closePath();x.fill();};
    const _emblem=(cx,cy,R)=>{
      x.save();
      x.fillStyle="#0d1524";x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.fill();
      x.strokeStyle=col;x.lineWidth=Math.max(2,R*0.09);x.globalAlpha=0.95;x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.stroke();x.globalAlpha=1;
      x.fillStyle=col;
      for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2;_star(cx+Math.cos(a)*R*0.74,cy+Math.sin(a)*R*0.74,R*0.135,0);}
      x.fillStyle="#f2f5fa";x.textAlign="center";x.textBaseline="middle";
      const fs=_fit(_sig,R*1.02,Math.round(R*0.62),"900");x.font="900 "+fs+"px system-ui,Segoe UI,Arial";
      x.fillText(_sig,cx,cy+1);
      x.restore();};
    const unit=1024/2;/* due piastrelle per canvas: il motivo resta leggibile anche sui settori stretti */
    for(let u=0;u<2;u++){const ox=u*unit;
      const R=42,ex=ox+16+R,tx=ox+16+R*2+18,tw=unit-(tx-ox)-26;/* margine 26px a destra: mai a filo del bordo */
      _emblem(ex,64,R);
      x.textAlign="left";x.textBaseline="alphabetic";
      const f1=_fit(_sig,tw,46,"900");x.font="900 "+f1+"px system-ui,Segoe UI,Arial";
      x.fillStyle="#f2f5fa";x.fillText(_sig,tx,60);
      const f2=_fit(nm,tw,26,"700");x.font="700 "+f2+"px system-ui,Segoe UI,Arial";
      x.fillStyle="rgba(226,232,240,0.78)";x.fillText(nm,tx,96);
      x.strokeStyle=col;x.globalAlpha=0.45;x.lineWidth=3;x.beginPath();x.moveTo(ox+unit-13,30);x.lineTo(ox+unit-13,98);x.stroke();x.globalAlpha=1;}
    const t=new THREE.CanvasTexture(cv);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
    return t;
  }catch(_e){return null;}})();
  const frontRows=[];
  const addStand=(cx,cz,rotY,standW,standD,standH,crowdObj,frontFill,isHome,isAway,opts)=>{
    opts=opts||{};const _nt=opts.tiers||2,_roofOn=opts.roofOn!==false;// anelli variabili + tetto per-settore (S2)
    const g=new THREE.Group();
    // struttura posteriore in cemento (chiude la sagoma dello stadio dietro l'anello alto)
    const back=new THREE.Mesh(new THREE.BoxGeometry(standW,standH,standD*0.26),cM);
    back.position.set(0,standH/2,standD*0.36);back.receiveShadow=true;g.add(back);
    const mkTier=(z0,y0,z1,y1,tex)=>{
      const dz=z1-z0,dy=y1-y0,L=Math.hypot(dz,dy);
      const m=new THREE.MeshLambertMaterial({color:0xffffff,map:tex,side:THREE.DoubleSide});
      const t=new THREE.Mesh(new THREE.PlaneGeometry(standW,L),m);
      t.position.set(0,(y0+y1)/2,(z0+z1)/2);t.rotation.x=Math.atan2(dz,dy);// fronte-basso → retro-alto
      g.add(t);return m;
    };
    // pendenze da vero stadio (~33°/42°): più piatte, dalla camera broadcast alta si vedrebbero di taglio
    let mLow,mUp;
    if(_nt===1){// anello UNICO ripido (provincia/comunale · curva-muro tedesca)
      mLow=mkTier(-standD/2+0.6,3.0,standD*0.40,standH+0.6,crowdObj.texFull);/* [6.2.0 CROWD-SCALE] muro intero = canvas INTERA · [6.5.1 Polish D] top arretrato 0.30→0.40 + cap +1.0→+0.6 → RAKE più dolce (stessa altezza distribuita su più profondità = incline meno ripido) */
      mUp=mkTier(standD*0.40,standH+0.6,standD*0.44,standH+0.8,crowdObj.texUp);// fascia sommitale minima (tiene vivo texUp) · [6.5.1] start allineato al nuovo top di mLow
    }else{
      mLow=mkTier(-standD/2+0.6,3.0,-standD*0.10,standH*0.62,crowdObj.texLow);
      mUp=mkTier(-standD*0.02,standH*0.68,standD*0.32,standH+1.4,crowdObj.texUp);
      const walk=new THREE.Mesh(new THREE.BoxGeometry(standW,0.5,standD*0.10),cM);
      walk.position.set(0,standH*0.645,-standD*0.06);g.add(walk);
      if(_nt>=3){// terzo anello (spagnolo/sudamericano): riusa texUp, arretrato e più alto
        mkTier(standD*0.34,standH+1.6,standD*0.52,standH*1.34+2.2,crowdObj.texUp);
        const walk2=new THREE.Mesh(new THREE.BoxGeometry(standW,0.5,standD*0.08),cM);
        walk2.position.set(0,standH+1.5,standD*0.33);g.add(walk2);
      }
    }
    /* [7.437.0 EVOLUTIVA STADI — «evita l'effetto massa geometrica ripetuta»] STRATIFICAZIONE:
       parapetti sul fronte degli anelli, SCALE RADIALI sopra i gradoni (i corridoi che spezzano la
       texture-folla in settori), VOMITORI scuri sul camminamento. Tutta geometria condivisa, ~15
       mesh per tribuna. */
    {const _lvS=opts.lvl!=null?opts.lvl:_lvl437;
      const _mkRail=(y,z)=>{const r=new THREE.Mesh(new THREE.BoxGeometry(standW,0.34,0.12),stM);r.position.set(0,y,z);g.add(r);};
      _mkRail(3.15,-standD/2+0.55);/* balaustra fronte-campo dell'anello basso */
      if(_nt>1)_mkRail(standH*0.68+0.2,-standD*0.02-0.05);/* fronte anello alto */
      const _mkAisle=(z0,y0,z1,y1)=>{const dz=z1-z0,dy=y1-y0,L=Math.hypot(dz,dy);
        const _na=Math.max(3,Math.round(standW/18));
        for(let ai=0;ai<_na;ai++){const ax=-standW/2+(ai+0.5)*standW/_na;
          const st2=new THREE.Mesh(new THREE.PlaneGeometry(0.9,L*0.96),_aisleM437);
          st2.position.set(ax,(y0+y1)/2+0.06,(z0+z1)/2-0.03);st2.rotation.x=Math.atan2(dz,dy);g.add(st2);}};
      if(_nt===1)_mkAisle(-standD/2+0.6,3.0,standD*0.40,standH+0.6);
      else{_mkAisle(-standD/2+0.6,3.0,-standD*0.10,standH*0.62);_mkAisle(-standD*0.02,standH*0.68,standD*0.32,standH+1.4);}
      if(_nt>1){const _nv=Math.max(2,Math.round(standW/26));
        for(let vi=0;vi<_nv;vi++){const vx=-standW/2+(vi+0.7)*standW/_nv;
          const vm=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.15,0.6),_vomM437);
          vm.position.set(vx,standH*0.645+0.85,-standD*0.06);g.add(vm);}}
    }
    // Concrete base strip
    const base=new THREE.Mesh(new THREE.BoxGeometry(standW+2,3,standD+3),cM);
    base.position.set(0,1.5,0);g.add(base);
    if(_compBanner){/* [7.301.0] striscione della competizione sulla FACCIA CAMPO del muretto (in locale il campo
        sta a -z: stessa convenzione dei gradoni, che partono da -standD/2) */
      const _bw=standW+2,_bh=1.7,_m=_compBanner.clone();
      _m.wrapS=THREE.RepeatWrapping;_m.repeat.set(Math.max(1,Math.round(_bw/26)),1);_m.needsUpdate=true;
      const _bn=new THREE.Mesh(new THREE.PlaneGeometry(_bw,_bh),new THREE.MeshBasicMaterial({map:_m}));
      /* [7.306.1 collaudo PO «sui muretti gli striscioni della competizione non ci sono, solo quelli dei
         tifosi»] la fascia c'era ma spariva: per tenerla SOTTO ai teli degli ultras le avevo messo
         `renderOrder:-2` + `depthWrite:false`, cioe' disegnata PRIMA di tutto e senza scrivere profondita' —
         e il muro di cemento, opaco e disegnato dopo, la ricopriva. (Su qualche settore sopravviveva per puro
         ordine di traversata della scena: da qui il «a volte si vede».) Ora e' un opaco normale, 0.06 davanti
         alla faccia del muro: occlude il cemento per profondita' REALE. La gerarchia col tifo resta perche' i
         teli ultras sono TRASPARENTI (quindi disegnati dopo ogni opaco) e appesi piu' avanti, a 0.14. */
      _bn.position.set(0,1.85,-(standD+3)/2-0.06);_bn.rotation.y=Math.PI;g.add(_bn);}
    // Roof: PENSILINA arretrata sopra il fondo dell'anello alto — il vecchio sbalzo in avanti, visto
    // dalla camera broadcast alta, COPRIVA l'anello inferiore (banda opaca al posto dei tifosi)
    if(_roofOn){
      const _rTop=(_nt>=3)?standH*1.34+2.4:standH+1.8;
      const _lv=opts.lvl!=null?opts.lvl:_lvl437;
      if(_lv<=0){/* PROVINCIA: la pensilina storica, con due pilastrini in piu' per non sembrare sospesa */
        const roof=new THREE.Mesh(new THREE.BoxGeometry(standW+8,0.8,standD*0.20),roofM);
        roof.position.set(0,_rTop,standD*((_nt>=3)?0.52:0.34));roof.rotation.x=0.10;g.add(roof);
        [-standW/2+4,-standW/6,standW/6,standW/2-4].forEach(px=>{
          const pl=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,_rTop+0.2,8),stM);
          pl.position.set(px,_rTop/2,standD*((_nt>=3)?0.48:0.30));g.add(pl);});
      } else {/* [7.437.0] COPERTURA VERA A SBALZO: falda che copre l'anello alto, sottotetto scuro,
          travi reticolari istanziate dal retro al filo, piloni posteriori; dal liv.2 fascia frontale
          plexi + striscia luminosa; al liv.3 piloni alti sopra il tetto con STRALLI e falda piu' profonda. */
        const _dp=standD*(_lv>=3?0.62:_lv>=2?0.52:0.40);/* profondita' falda */
        const _zBack=standD*((_nt>=3)?0.52:0.36);/* attacco posteriore */
        const _zFront=_zBack-_dp;/* filo campo della falda */
        const _slope=_lv>=3?0.16:0.12;
        const roof=new THREE.Mesh(new THREE.BoxGeometry(standW+8,0.55,_dp),roofM);
        roof.position.set(0,_rTop+Math.sin(_slope)*_dp*0.5,_zBack-_dp/2);roof.rotation.x=_slope;g.add(roof);
        const under=new THREE.Mesh(new THREE.PlaneGeometry(standW+7.6,_dp*0.96),_roofDarkM);
        under.position.set(0,_rTop-0.34+Math.sin(_slope)*_dp*0.5,_zBack-_dp/2);under.rotation.x=Math.PI/2+_slope;g.add(under);
        /* fascia di gronda sul filo (bordo visibile dalla broadcast) */
        const fascia=new THREE.Mesh(new THREE.BoxGeometry(standW+8,1.1,0.35),stM);
        fascia.position.set(0,_rTop+0.1,_zFront);g.add(fascia);
        /* [7.439.0 collaudo PO «tralicci sulle coperture brutti e senza senso»] le aste diagonali
           spuntavano SOPRA la falda dalle inquadrature basse. Ora CENTINE sotto-falda: costole
           trasversali che seguono la pendenza, sempre SOTTO il piano del tetto — la struttura si
           legge dall'interno dello stadio, il profilo esterno resta pulito. */
        const _nTr=Math.max(4,Math.round((standW+8)/(_lv>=3?8:11)));
        const rib=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,0.42,_dp*0.94),_steelDark437,_nTr);
        rib.frustumCulled=false;const _tm=new THREE.Matrix4();const _te=new THREE.Euler(_slope,0,0);
        for(let ti=0;ti<_nTr;ti++){const tx=-standW/2-3+(ti+0.5)*(standW+8)/_nTr;
          _tm.makeRotationFromEuler(_te);_tm.setPosition(tx,_rTop-0.62+Math.sin(_slope)*_dp*0.5,_zBack-_dp/2);rib.setMatrixAt(ti,_tm);}
        g.add(rib);
        /* piloni posteriori */
        const _nPy=_lv>=3?5:_lv>=2?4:3;
        const _pyTop=_rTop+Math.sin(_slope)*_dp+1.0;/* appena sopra il colmo posteriore, mai antenne nel cielo */
        for(let pi=0;pi<_nPy;pi++){const px=-standW/2+2+(pi+0.5)*(standW-4)/_nPy;
          const pl=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.44,_pyTop,8),stM);
          pl.position.set(px,_pyTop/2,_zBack+0.6);g.add(pl);}
        if(_lv>=3){/* PORTALE posteriore: una trave di colmo continua che lega i piloni — il disegno
            «da grande impianto» senza pali e cavi che bucano il profilo */
          const portal=new THREE.Mesh(new THREE.BoxGeometry(standW+6,1.2,1.0),_steelDark437);
          portal.position.set(0,_pyTop+0.4,_zBack+0.6);g.add(portal);}
        if(_lv>=2){/* fascia frontale semitrasparente sotto la gronda (vetro/policarbonato) */
          const px2=new THREE.Mesh(new THREE.PlaneGeometry(standW+7,2.0),_plexiM);
          px2.position.set(0,_rTop-1.2,_zFront+0.02);g.add(px2);
          /* striscia luminosa sottocopertura */
          const led=new THREE.Mesh(new THREE.BoxGeometry(standW+6,0.16,0.16),_ledM437);
          led.position.set(0,_rTop-0.55,_zFront+0.35);g.add(led);}
      }
    }
    // Fence rail at pitch-side bottom
    if(_fenceT!=="none"){// inglese: niente recinzione, tribune a filo campo
      const _fH=_fenceT==="high"?2.6:_fenceT==="plexi"?1.1:0.9;// sudamericano alta · moderna plexi · legacy/metal
      const _fM=_fenceT==="plexi"?new THREE.MeshLambertMaterial({color:0xbfd8e8,transparent:true,opacity:0.35}):new THREE.MeshLambertMaterial({color:_fenceT==="high"?0x3a3f46:0x2a6038});
      const fence=new THREE.Mesh(new THREE.BoxGeometry(standW,_fH,0.3),_fM);
      fence.position.set(0,_fH/2,-(standD/2+0.15));g.add(fence);
    }
    // LOD1 — prime file 3D: busti instanziati appena dietro la balaustra (seedati, deterministici)
    let front=null;
    const nFront=Math.round(CROWD_CFG.anim.frontRowPerStand*Math.min(1,(frontFill||0)*1.4));
    if(nFront>2){
      let fs=Math.abs(hashStr("front_"+cx+"_"+cz+"_"+(crowd.seed||0)))>>>0;
      const fr=()=>{fs=(fs*1664525+1013904223)>>>0;return fs/4294967296;};
      const teamHex=isAway?awayHex:homeHex;
      const CLT=["#2b3a55","#7a2b2b","#2f5d3a","#4a3b6b","#6b6f78","#3a3f4a","#5a4030"];
      const SKT=[0xf5c5a3,0xe8a870,0xc8956a,0xa06a42,0x8B5030,0x5f3818];
      const body=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.17,0.24,0.95,6),new THREE.MeshLambertMaterial({color:0xffffff}),nFront);
      const head=new THREE.InstancedMesh(new THREE.SphereGeometry(0.145,7,5),new THREE.MeshLambertMaterial({color:0xffffff}),nFront);
      body.frustumCulled=false;head.frustumCulled=false;
      const bases=[],headBases=[],ph=new Float32Array(nFront);
      const _m=new THREE.Matrix4(),_col=new THREE.Color();
      for(let i=0;i<nFront;i++){
        const x=-standW*0.46+(i+0.5)/nFront*standW*0.92+(fr()-0.5)*1.2;
        const z=-standD/2+0.95+fr()*0.5, s=0.72+fr()*0.24, sy=fr()<0.30?s*0.78:s;// alcuni seduti · [6.2.0 CROWD-SCALE] ridotti ~15% (collaudo PO)
        const y=3.0+0.48*sy;
        const bm=new THREE.Matrix4().makeScale(s,sy,s);bm.setPosition(x,y,z);bases.push(bm);
        const hm=new THREE.Matrix4().makeScale(s,s,s);hm.setPosition(x,y+0.62*sy,z);headBases.push(hm);
        body.setMatrixAt(i,bm);head.setMatrixAt(i,hm);
        _col.set(fr()<0.72?teamHex:CLT[(fr()*CLT.length)|0]);_col.multiplyScalar(0.8+fr()*0.35);body.setColorAt(i,_col);
        _col.set(SKT[(fr()*SKT.length)|0]);head.setColorAt(i,_col);
        ph[i]=fr()*6.28;
      }
      g.add(body);g.add(head);
      front={body,head,n:nFront,bases,headBases,ph,isHome:!!isHome};
      frontRows.push(front);
    }
    g.position.set(cx,0,cz);g.rotation.y=rotY;
    scene.add(g);return {mats:[mLow,mUp],front};
  };

  // Settori — Ovest/Est dietro le porte visive (z±), curve sui lati corti (x±)
  // FIX rotazioni tribune di fondo: con rotY 0/π invertite il fronte (recinzione+anelli) guardava FUORI
  // dallo stadio — invisibile coi vecchi box-folla a 6 facce, evidente con le gradinate inclinate.
  // [5.88.0 S2] tetto per settore: none=nessuno · west=solo Ovest · partial=Est+Ovest · full/legacy=tutti
  const _roofFor=k=>{if(_roofT==="none")return false;/* catino aperto: identita' (sudamericano) */
    if(_lvl437>=2)return true;/* [7.438.0 collaudo PO «la copertura, soprattutto negli stadi importanti, deve esserci anche in curva!»] dal livello importante l'anello di copertura e' COMPLETO: le curve non restano scoperte */
    return _roofT==="legacy"||_roofT==="full"?true:_roofT==="west"?k==="ovest":(_roofT==="partial"?(k==="ovest"||k==="est"):true);};
  const _ovStand=addStand(0,-endZ,Math.PI, endW,endD,endH,_ovest,crowd.fill,true,false,{tiers:_tiers,roofOn:_roofFor("ovest")});   // Tribuna Ovest — casa/famiglie/VIP
  const _esStand=addStand(0, endZ,0,       endW,endD,endH,_est,crowd.fill,true,false,{tiers:(T&&T.asym)?1:_tiers,roofOn:_roofFor("est")});     // Tribuna Est — casa + spicchio ospiti (asym: bassa a 1 anello)
  const _sudStand=addStand(sideX, 0, Math.PI/2, sideW,(_sudH>sideH?sideD*1.15:sideD),_sudH,_sud,crowd.fill,true,false,{tiers:(T&&T.megaCurva)?1:_tiers,roofOn:_roofFor("sud")});// [5.89.1 HOTFIX] un argomento in PIÙ (sideD duplicato) scalava tutti i parametri → crowdObj arrivava come NUMERO → curva Sud BIANCA senza tifosi/bandiere in ogni partita (segnalazione PO con screenshot)   // Curva Sud (tabellone) — SOLO casa · tedesco: MURO a 1 anello
  const _nordStand=addStand(-sideX,0,-Math.PI/2, sideW,sideD,sideH,_nord,crowd.awayFill,false,true,{tiers:_tiers,roofOn:_roofFor("nord")});// Curva Nord — SOLO ospiti
  const homeMats=[..._sudStand.mats,..._ovStand.mats,..._esStand.mats];
  const awayMats=[..._nordStand.mats];
  // Corner sections — filled or open based on style
  const hasCorners=T?(T.corner!=="open"):(style!==3); // [5.88.0 S2] template: open=angoli liberi · closed/curve=pieni · legacy: style 3 aperti
  if(hasCorners)[[-sideX,-endZ,Math.PI/4],[sideX,-endZ,-Math.PI/4],[-sideX,endZ,3*Math.PI/4],[sideX,endZ,-3*Math.PI/4]].forEach(([x,z,ry])=>{
    const cH=Math.round((endH+sideH)/2)*0.8;
    // angoli vicino Curva Sud (+x, casa) → texture casa; vicino Curva Nord (-x) → texture ospiti
    const cm=new THREE.Mesh(new THREE.BoxGeometry(24,cH,24),new THREE.MeshLambertMaterial({color:0xffffff,map:x>0?_sud.texFull:_nord.texFull}));
    cm.position.set(x,cH/2,z);cm.rotation.y=ry;scene.add(cm);
    const cb=new THREE.Mesh(new THREE.BoxGeometry(24,2,24),cM);cb.position.set(x,1,z);scene.add(cb);
  });

  // Floodlights — colour from league palette
  const lightColor=stadCfg.floodColor||0xf4f8ff;
  // [5.88.0 S2] stile torri: traliccio (provincia, esili) · perimetrali (6 pali bassi) · angolari_alte (iconiche ×1.3) · tetto (bank sul tetto, niente pali) · legacy
  const _fH2=_towerT==="angolari_alte"?floodH*1.3:_towerT==="perimetrali"?floodH*0.7:floodH;
  const _towPos=_towerT==="perimetrali"
    ?[[-sideX+8,-endZ+8],[sideX-8,-endZ+8],[-sideX+8,endZ-8],[sideX-8,endZ-8],[0,-endZ+6],[0,endZ-6]]
    :[[-sideX+8,-endZ+8],[sideX-8,-endZ+8],[-sideX+8,endZ-8],[sideX-8,endZ-8]];
  const _onRoof=_towerT==="tetto"&&_roofT!=="none";// senza tetto non esistono bank a tetto → fallback pali
  const floodH2=_fH2;
  /* [7.470.0 direttiva PO «migliora riflettori, rendili piu' moderni e prevedi la copertura anche nei
     settori angolari»] LA LUCE A TETTO ERA QUATTRO SCATOLE SUGLI ASSI, e gli ANGOLI restavano al buio:
     i quattro bank stavano a (±0.7·sideX, ±endZ), cioe' sui lati lunghi, e nessuno guardava i settori
     d'angolo — che nello screenshot del PO sono infatti la parte spenta della curva. Due interventi:
     (a) COPERTURA — le posizioni diventano OTTO (quattro lati + quattro angoli) ma il NUMERO DI LUCI
         resta quello di prima: i quattro faretti direzionali restano sui lati (illuminano il campo) e le
         quattro luci di riempimento si spostano sugli ANGOLI, dove serviva copertura. Zero luci nuove —
         su mobile ogni luce e' costo per frammento, e la nota non chiedeva uno stadio piu' pesante.
     (b) MODERNI — al posto delle quattro scatole isolate, una FASCIA LED CONTINUA lungo tutto il bordo
         del tetto, angoli compresi, in `InstancedMesh` (un solo draw call): e' la firma degli stadi
         nuovi, dove la luce e' una linea e non quattro torri. */
  const _roofLit=_onRoof?[[-sideX*0.7,-endZ+3,1],[sideX*0.7,-endZ+3,1],[-sideX*0.7,endZ-3,1],[sideX*0.7,endZ-3,1],
                          [-sideX+4,-endZ+4,0],[sideX-4,-endZ+4,0],[-sideX+4,endZ-4,0],[sideX-4,endZ-4,0]]:_towPos;
  if(_onRoof){try{
    const _ledG=new THREE.BoxGeometry(1.5,0.34,0.5),_ledM=new THREE.MeshBasicMaterial({color:0xfffdf2});
    const _pts=[];const _stepX=Math.max(3,(sideX*2)/16),_stepZ=Math.max(3,(endZ*2)/10);
    for(let x=-sideX;x<=sideX;x+=_stepX){_pts.push([x,-endZ+2.2,0]);_pts.push([x,endZ-2.2,0]);}
    for(let z=-endZ+2.2;z<=endZ-2.2;z+=_stepZ){_pts.push([-sideX+1.6,z,Math.PI/2]);_pts.push([sideX-1.6,z,Math.PI/2]);}
    const _led=new THREE.InstancedMesh(_ledG,_ledM,_pts.length);const _lm=new THREE.Matrix4(),_lq=new THREE.Quaternion(),_lv=new THREE.Vector3(1,1,1);
    _pts.forEach((q,qi)=>{_lq.setFromAxisAngle(new THREE.Vector3(0,1,0),q[2]);_lm.compose(new THREE.Vector3(q[0],endH+3.6,q[1]),_lq,_lv);_led.setMatrixAt(qi,_lm);});
    _led.instanceMatrix.needsUpdate=true;scene.add(_led);
  }catch(_e470L){}}
  _roofLit.forEach(([x,z,_dir])=>{
    if(_onRoof){// bank luminosi sul bordo del tetto (stadi moderni): niente pali
      const head=new THREE.Mesh(new THREE.BoxGeometry(_dir?7:3.2,0.9,_dir?2.2:3.2),new THREE.MeshBasicMaterial({color:0xfffff0}));
      head.position.set(x,endH+4.2,z);scene.add(head);
      if(_dir){const spot=new THREE.SpotLight(lightColor,1.4,180,Math.PI/5,0.3,1.2);
        spot.position.set(x,endH+5,z);spot.target.position.set(0,0,0);scene.add(spot);scene.add(spot.target);}
      else{const fl=new THREE.PointLight(lightColor,0.50,280);fl.position.set(x,endH+4,z);scene.add(fl);}
      return;
    }
    /* [7.437.0 EVOLUTIVA STADI passata 3] TORRE VERA, non palo+scatola: per traliccio/angolari_alte
       quattro montanti rastremati + crociere istanziate + TESTATA a griglia di proiettori (mini-box
       emissivi su telaio scuro, ballatoio dietro); perimetrali restano pali snelli con fila di tre
       proiettori. Le LUCI (Spot+Point) sono INVARIATE: cambia solo la scenografia. */
    const _latt=(_towerT==="traliccio"||_towerT==="angolari_alte");
    if(_latt){
      const _lw=_towerT==="angolari_alte"?1.7:1.2;/* semi-lato base */
      for(const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
        const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.14,floodH2,5),stM);
        leg.position.set(x+lx*_lw*0.6,floodH2/2,z+lz*_lw*0.6);leg.rotation.z=-lx*0.045;leg.rotation.x=lz*0.045;scene.add(leg);}
      const _nb=Math.max(3,Math.round(floodH2/7));
      const brace=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05,0.05,_lw*2.3,4),stM,_nb*2);
      brace.frustumCulled=false;const _bm=new THREE.Matrix4();const _e1=new THREE.Euler(0,0,Math.PI/2),_e2=new THREE.Euler(Math.PI/2,0,0);
      for(let bi=0;bi<_nb;bi++){const by=(bi+0.7)*floodH2/_nb;
        _bm.makeRotationFromEuler(_e1);_bm.setPosition(x,by,z-_lw*0.55);brace.setMatrixAt(bi*2,_bm);
        _bm.makeRotationFromEuler(_e2);_bm.setPosition(x-_lw*0.55,by,z);brace.setMatrixAt(bi*2+1,_bm);}
      scene.add(brace);
      /* testata: telaio scuro + griglia di proiettori + ballatoio */
      const _gw=_towerT==="angolari_alte"?5.6:4.4,_gh=_towerT==="angolari_alte"?3.4:2.6;
      const frame=new THREE.Mesh(new THREE.BoxGeometry(_gw+0.6,_gh+0.6,0.5),new THREE.MeshLambertMaterial({color:0x1c1f26}));
      frame.position.set(x,floodH2+_gh/2,z);frame.lookAt(0,6,0);scene.add(frame);
      const _cols=_towerT==="angolari_alte"?5:4,_rows=_towerT==="angolari_alte"?4:3;
      const projs=new THREE.InstancedMesh(new THREE.BoxGeometry(_gw/_cols*0.72,_gh/_rows*0.62,0.28),new THREE.MeshBasicMaterial({color:0xfffff0}),_cols*_rows);
      projs.frustumCulled=false;const _pm=new THREE.Matrix4();const _fq=frame.quaternion;
      let _pi2=0;for(let rr=0;rr<_rows;rr++)for(let cc2=0;cc2<_cols;cc2++){
        const _ox=(cc2+0.5-_cols/2)*(_gw/_cols),_oy=(rr+0.5-_rows/2)*(_gh/_rows);
        const _off=new THREE.Vector3(_ox,_oy,0.3).applyQuaternion(_fq);
        _pm.makeRotationFromQuaternion(_fq);_pm.setPosition(x+_off.x,floodH2+_gh/2+_off.y,z+_off.z);projs.setMatrixAt(_pi2++,_pm);}
      scene.add(projs);
      const walkT=new THREE.Mesh(new THREE.BoxGeometry(_gw+1.2,0.18,1.1),stM);
      walkT.position.set(x,floodH2-0.35,z);walkT.lookAt(0,floodH2-0.35,0);scene.add(walkT);
    } else {
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,floodH2,8),stM);
      pole.position.set(x,floodH2/2,z);pole.castShadow=true;scene.add(pole);
      const arm=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,8),stM);
      arm.position.set(x+(x>0?-4:4),floodH2+2,z);scene.add(arm);
      for(let hp=0;hp<3;hp++){const head=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.8,2.5),new THREE.MeshBasicMaterial({color:0xfffff0}));
        head.position.set(x+(x>0?-4:4)+(hp-1)*1.7,floodH2+2.5,z);scene.add(head);}
    }
    // SpotLight pointing down at pitch — focused beam, realistic TV look
    const spot=new THREE.SpotLight(lightColor,1.4,180,Math.PI/5,0.3,1.2);// 3DV-10: 2.8→1.4 meno fluorescente
    spot.position.set(x+(x>0?-5:5),floodH2+5,z);
    spot.target.position.set(0,0,0);scene.add(spot);scene.add(spot.target);
    // Soft fill PointLight at lower intensity
    const fl=new THREE.PointLight(lightColor,0.50,280);fl.position.set(x+(x>0?-5:5),floodH2+4,z);scene.add(fl);// 3DV-10: 1.0→0.50
  });

  // Goal nets (wireframe-style transparent planes)
  // [7.9.2 collaudo PO «pali e traversa non ancora disegnati bene, risolvi definitivamente»] la "rete" era un
  //   PIANO BIANCO PIENO a opacity 0.42: sopra il fondale quasi nero del 7.8.26 leggeva come una LASTRA DI VETRO
  //   GRIGIA che riempiva lo specchio (e a distanza ingrigiva la bocca, ammazzando il contrasto del telaio).
  //   Ora è una MAGLIA VERA: texture canvas a griglia bianca su fondo trasparente (repeat per-piano ~35cm/cella)
  //   → lo specchio resta una cavità scura attraversata da una rete sottile, come una porta reale.
  const _mkNetTex=()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.clearRect(0,0,64,64);g.strokeStyle='rgba(255,255,255,0.9)';g.lineWidth=1.0;/* [7.15.0 collaudo PO: la porta leggeva come LASTRA lattiginosa] filo 1.5→1.0: alla minificazione (mipmap) la griglia media ~35% di bianco → slab; a ~23% resta una velatura da rete reale */for(let i=0;i<=64;i+=8){g.beginPath();g.moveTo(i+0.5,0);g.lineTo(i+0.5,64);g.stroke();g.beginPath();g.moveTo(0,i+0.5);g.lineTo(64,i+0.5);g.stroke();}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
  const _netTex=_mkNetTex();
  const _netCol=new THREE.Color(homeHex||"#ffffff").lerp(new THREE.Color(0xffffff),0.42);/* [7.16.1 collaudo PO «la rete la farei dei colori del club»] maglia della rete TINTA col colore sociale di casa, schiarita per restare leggibile (bianco 42%) */
  const _mkNetMat=(w,h,op)=>{const t=_netTex.clone();t.needsUpdate=true;t.repeat.set(Math.max(2,Math.round(w/0.35)),Math.max(2,Math.round(h/0.35)));return new THREE.MeshBasicMaterial({map:t,color:_netCol,transparent:true,opacity:(op!=null?op:0.5),side:THREE.DoubleSide,fog:false,depthWrite:false});};/* [7.13.1] opacità per-piano: i piani visti DI TAGLIO (tetto/lati) compattano la griglia in un pannello bianco → molto più trasparenti · [7.15.0] fondo 0.65→0.5 (anti-slab) */
  const netM=_mkNetMat(7.32,2.44);// materiale base (rete di fondo) — i piani laterali/tetto creano il proprio con la maglia alla stessa scala
  let awayGoalNet=null; // CINE-6: rete porta avversaria (+x) esposta per il pulse al gol
  [[-51,1],[ 51,-1]].forEach(([gx,sign])=>{
    // Back net — la porta avversaria (gx>0) usa un materiale dedicato per gonfiarsi al gol
    const back=new THREE.Mesh(new THREE.PlaneGeometry(7.32,2.44),gx>0?netM.clone():netM);
    back.rotation.y=Math.PI/2;back.position.set(gx+sign*1.6,1.22,0);scene.add(back);
    if(gx>0){awayGoalNet=back;back._restX=back.position.x;}
    // Side nets
    [-3.66,3.66].forEach(gz=>{
      const side=new THREE.Mesh(new THREE.PlaneGeometry(2,2.44),_mkNetMat(2,2.44,0.28));/* [7.9.2] maglia alla stessa scala su ogni piano (repeat per-dimensione) · [7.15.0] 0.38→0.28 anti-slab */
      side.position.set(gx+sign*0.85,1.22,gz);scene.add(side);
    });
    // Top net — [6.74.0 3D-11] era PlaneGeometry(7.32,2) con solo rotation.x: il "tetto" si estendeva 7.32u lungo X
    //   (sporgendo 2.5u oltre la porta davanti e dietro) e copriva solo 2u lungo Z. Parametri scambiati: 7.32 lungo Z (bocca porta), 2 di profondità.
    const top=new THREE.Mesh(new THREE.PlaneGeometry(2,7.32),_mkNetMat(2,7.32,0.2));/* [7.9.2] · [7.15.0] 0.3→0.2 anti-slab */
    top.rotation.x=Math.PI/2;top.position.set(gx+sign*0.85,2.44,0);scene.add(top);
  });
  // 5.43.3: TELAIO PORTA (pali + traversa) bianco brillante — prima la porta era impercettibile (solo reti trasparenti, niente pali)
  // [7.8.7 collaudo PO «di nuovo le porte invisibili con la neve!»] i pali BIANCHI+emissive sono leggibili di
  //   NOTTE ma AFFOGANO nel fondo bianco della NEVE; pali scuri farebbero il contrario (invisibili di notte /
  //   contro le tribune scure). Soluzione: CONTORNO SCURO (inverted-hull, BackSide) → il nucleo bianco resta
  //   visibile su fondo scuro, il bordo scuro lo stacca dal fondo chiaro. Funziona in OGNI meteo.
  // [7.8.11 collaudo tester «sparita nuovamente la porta»] La causa REALE non era il buio ma l'OCCLUSIONE: negli
  //   stadi a catino profondo (Premier/…), dalla camera broadcast alta e obliqua, la fascia scura tra la linea di
  //   porta e le tribune (muretto perimetrale/gradinata bassa) COPRE la porta LONTANA → «sparita». Verificato dal
  //   vivo (partita di campionato notturna, stadio inglese): coi soli pali più luminosi/spessi restava invisibile;
  //   con depthTest:false riappare nitida. Fix ROBUSTO e indipendente dal template: i pali (nucleo + contorno) si
  //   disegnano SEMPRE sopra la geometria dello stadio (depthTest:false) → la porta non sparisce in nessuno stadio/
  //   meteo/ora. renderOrder alto e rim<core → resa corretta (bianco sopra il bordo scuro). Pali un filo più spessi
  //   (0.15->0.18) e rim più sottile (0.075->0.045) per leggibilità a distanza; emissive 0.7->1.0.
  /* [7.15.0 collaudo PO «i pali devono essere in PRIMO PIANO rispetto ai cartelloni!»] i cartelloni dietro-porta
     (_mkAdBoard) e le altre insegne sono materiali TRASPARENTI → Three.js li disegna nel pass trasparente, DOPO
     tutto il pass opaco: i pali (opachi, depthTest:false ⇒ NIENTE scrittura depth) venivano quindi RICOPERTI dai
     cartelloni ovunque il loro depth-test passasse (renderOrder non ordina TRA i due pass). Fix: postMat
     transparent:true (opacity 1) → i pali entrano nel pass trasparente e il renderOrder 21 li mette DOPO i
     cartelloni ⇒ telaio SEMPRE in primo piano, in ogni stadio/inquadratura. */
  const postMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.8,roughness:0.3,metalness:0.05,fog:false,depthTest:false,transparent:true,opacity:1});/* [7.8.25] emissive 1.0->0.8: meno "glow", aspetto più solido/pulito (pali «mal disegnati») */
  /* [7.9.2 collaudo PO «pali/traversa non ancora disegnati bene, risolvi definitivamente»] VIA il contorno scuro
     inverted-hull (postOutMat): a distanza era LUI a far leggere il telaio come NERO col filo bianco dentro
     (verificato con screenshot far-goal). Col FONDALE scuro del 7.8.26 (qui ALLARGATO: copre pali+margine anche
     in obliquo) il bianco ha sempre contrasto alle spalle in OGNI meteo → telaio bianco PIENO, pulito, continuo. */
  const _GW=7.32,_GH=2.44,_PR=0.15;/* [7.16.1 collaudo PO «i pali finalmente si vedono ma sono TROPPO SPESSI»] 0.24→0.15: ora che il telaio è sempre-in-primo-piano (7.15.0, pass trasparente) lo spessore extra per la leggibilità non serve più *//* [7.8.27 collaudo tester «pali tagliati/discontinui, il pezzo troppo fine risulta non visibile»] diagnosi ESATTA: il nucleo bianco 0.18 era TROPPO FINE e il rim 0.12 TROPPO SPESSO → a distanza il sottile filo bianco si spezza in pixel mentre il rim scuro affoga nelle tribune scure = palo «discontinuo». Ora che il FONDALE SCURO (7.8.26) garantisce il contrasto, il BIANCO può DOMINARE: nucleo 0.18→**0.24** (palo pieno e continuo anche da lontano) + rim 0.12→**0.05** (solo un filo di contorno dove il palo tocca il prato chiaro). *//* storico: [7.6.1] 0.12->0.15 · [7.8.11] ->0.18 rim 0.045 · [7.8.15] rim 0.10 · [7.8.23] nucleo 0.20 rim 0.17 · [7.8.25] nucleo 0.18 rim 0.12 */
  // [7.8.26 collaudo tester «i pali continuano a non essere ben visibili / la porta sembra disegnata sul muro» — FIX DEFINITIVO]
  //   dopo 8+ tarature del rim (0.045→0.17), il problema è un COMPROMESSO DI CONTRASTO impossibile da chiudere con lo
  //   spessore del bordo: pali bianchi su striscioni/cielo bianchi servono un bordo scuro, ma un bordo spesso li fa
  //   sembrare «scuri/blocchi» su fondo scuro; e senza profondità la porta appare «disegnata sul muro». Soluzione
  //   STRUTTURALE: un FONDALE SCURO dietro la rete. Così i pali bianchi hanno SEMPRE un fondo scuro alle spalle → nucleo
  //   nitido in OGNI stadio/meteo/ora, e la porta acquista una CAVITÀ (profondità reale) invece di un contorno piatto.
  //   Il rim scuro dei pali si fonde col fondale dietro la bocca e resta visibile solo dove il palo incontra il prato
  //   chiaro (adattivo per costruzione). depthTest:true → un giocatore davanti alla bocca la occlude correttamente
  //   (niente overdraw sui corpi); fog:false → resta scuro anche nella neve/nebbia bianca. Poco più largo/alto della
  //   bocca (peek dietro pali e traversa), appena dietro la rete di fondo (49.4) e davanti ai cartelloni (50.2).
  const goalBackdropMat=new THREE.MeshBasicMaterial({color:0x090c11,fog:false});
  [[-51,1],[51,-1]].forEach(([gx,sign])=>{
    const bw=_GW+4.6,bh=_GH+0.8,bd=new THREE.Mesh(new THREE.PlaneGeometry(bw,bh),goalBackdropMat);/* [7.13.1 collaudo PO «manca un pezzo per ogni palo!»] la banda mancante era ESATTAMENTE l'altezza dei cartelloni dietro porta: da viste OBLIQUE il raggio camera→palo esce dal fondale (±4.36) e il palo bianco finisce sul cartellone chiaro → invisibile in quella fascia. Fondale ±5.96 (copre il worst-case realistico ~±5.3) e +0.8 in alto; i bordi esterni dei cartelloni (±6.5) restano visibili frontalmente. */
    bd.rotation.y=Math.PI/2;bd.position.set(gx+sign*1.35,bh/2-0.02,0);bd.renderOrder=1;scene.add(bd);// fondale porta (dietro la rete)
  });
  /* [7.16.1 collaudo PO «manca l'effetto 3D dei pali interni»] TELAIO POSTERIORE (stanchion): pali interni +
     barra di fondo + montanti superiori che raccordano la traversa al retro — la porta diventa un BOX con
     profondità reale invece di un rettangolo piatto. Più sottile e meno luminoso del telaio frontale (legge
     come «dietro»); stesso pass trasparente, renderOrder 20 (sotto i pali frontali 21). */
  const backMat=new THREE.MeshStandardMaterial({color:0xdfe4ea,emissive:0xdfe4ea,emissiveIntensity:0.35,roughness:0.45,metalness:0.05,fog:false,depthTest:false,transparent:true,opacity:1});
  const _BR=0.055;
  [[-51,1],[51,-1]].forEach(([gx,sign])=>{
    const fx=gx+sign*2.4;// faccia anteriore della porta (verso il campo), appena davanti alla rete
    const bx=gx+sign*1.6;// piano posteriore (rete di fondo)
    [-3.66,3.66].forEach(pz=>{
      const post=new THREE.Mesh(new THREE.CylinderGeometry(_PR,_PR,_GH,12),postMat);post.position.set(fx,_GH/2,pz);post.castShadow=true;post.renderOrder=21;scene.add(post);// [7.8.11] renderOrder alto (depthTest:false → disegna sopra lo stadio, la porta lontana non sparisce mai)
      // palo interno posteriore + montante superiore front→back (profondità)
      const bpost=new THREE.Mesh(new THREE.CylinderGeometry(_BR,_BR,_GH,10),backMat);bpost.position.set(bx,_GH/2,pz);bpost.renderOrder=20;scene.add(bpost);
      const strut=new THREE.Mesh(new THREE.CylinderGeometry(_BR,_BR,Math.abs(fx-bx),10),backMat);strut.rotation.z=Math.PI/2;strut.position.set((fx+bx)/2,_GH,pz);strut.renderOrder=20;scene.add(strut);
    });
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(_PR,_PR,_GW+_PR*2,12),postMat);bar.rotation.x=Math.PI/2;bar.position.set(fx,_GH,0);bar.castShadow=true;bar.renderOrder=21;scene.add(bar);
    const bbar=new THREE.Mesh(new THREE.CylinderGeometry(_BR,_BR,_GW,10),backMat);bbar.rotation.x=Math.PI/2;bbar.position.set(bx,_GH,0);bbar.renderOrder=20;scene.add(bbar);
  });

  // Advertising boards — home color tints only
  const _hC=new THREE.Color(homeHex);
  const hLight=new THREE.Color(homeHex).lerp(new THREE.Color(0xffffff),0.4);
  const hDark=new THREE.Color(homeHex).lerp(new THREE.Color(0x000000),0.35);
  const _led=!!(T&&stadCfg.tpl&&stadCfg.tpl.ledBoards);// [5.88.0 S2] stadi moderni: pannelli LED emissivi
  const addAd=(ax,az,aw,ah,rotY,idx)=>{
    const col=idx%3===0?_hC:idx%3===1?hLight:hDark;
    const m=new THREE.Mesh(new THREE.BoxGeometry(aw,ah,0.22),_led?new THREE.MeshBasicMaterial({color:col}):new THREE.MeshLambertMaterial({color:col}));
    m.position.set(ax,ah/2,az);m.rotation.y=rotY;scene.add(m);
    // Small text-like stripe on top
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(aw,0.15,0.24),new THREE.MeshLambertMaterial({color:0x111111}));
    stripe.position.set(ax,ah+0.075,az);stripe.rotation.y=rotY;scene.add(stripe);
  };
  let idx=0;
  /* [7.186.0 collaudo PO «la bandierina e le linee non sono allineate all'erba, si sovrappongono coi cartelloni»]
     i cartelloni dei lati lunghi stavano a z=±33.2 = ESATTAMENTE sulla TOUCHLINE (7.69.0) e sulle BANDIERINE
     d'angolo (stesse coordinate) → linea e bandierina risultavano «dentro» il cartellone. Ora stanno appena OLTRE
     il bordo del prato (z=±35.2, prato ±35.0): linee e bandierine restano sull'erba, i board le incorniciano. */
  for(let i=-44;i<=44;i+=11){addAd(i,-35.2,9,1.3,0,idx++);addAd(i,35.2,9,1.3,Math.PI,idx++);}
  for(let i=-28;i<=28;i+=12){addAd(53.2,i,9,1.3,Math.PI/2,idx++);addAd(-53.2,i,9,1.3,-Math.PI/2,idx++);}

  /* [7.184.2 collaudo PO «le linee del fallo laterale non sono allineate con le bandierine!»] RIMOSSE le bandierine
     LEGACY di buildStadium a (±50,±30): stavano FUORI dalla linea di porta (48.6) e DENTRO la touchline (33.2) —
     staccate da entrambe le righe. Le bandierine vere (pennant 7.94/7.119) vivono agli incroci REALI ±_GLX/±_TLZ. */

  // Player tunnel
  const tun=new THREE.Mesh(new THREE.BoxGeometry(6,4.5,3.5),new THREE.MeshLambertMaterial({color:0x181824}));
  tun.position.set(-71.5,2.25,-2);scene.add(tun);
  // [5.88.0 S2] PANCHINE + AREA TECNICA (tutti i template): due dugout ai lati del tunnel, lato Ovest
  {const _dgM=new THREE.MeshLambertMaterial({color:0x1c2430});
   const _dgGl=new THREE.MeshLambertMaterial({color:0x9fc2dd,transparent:true,opacity:0.4});
   [[-14,-1],[14,1]].forEach(([dx])=>{
     const b1=new THREE.Mesh(new THREE.BoxGeometry(9,1.1,1.6),_dgM);b1.position.set(dx,0.55,-34.6);scene.add(b1);
     const r1=new THREE.Mesh(new THREE.BoxGeometry(9.6,0.15,2.2),_dgGl);r1.position.set(dx,2.1,-34.8);r1.rotation.x=0.18;scene.add(r1);
   });}
  // [5.88.0 S2] INSEGNA col nome dello stadio (canvas wordmark) sopra la Tribuna Ovest — identità immediata
  // [7.661.0] PO: «il vecchio pannello/cartellone con il nome dello stadio deve essere eliminato» — il nome
  //   vive sul LED a scorrimento (7.658+); questa insegna resta solo sotto il rosso __CPM_NO662 (confronto).
  if(T&&stadCfg.tpl&&stadCfg.tpl.name&&(typeof window!=='undefined'&&window.__CPM_NO662)){
    try{const _sc2=document.createElement('canvas');_sc2.width=1024;_sc2.height=128;
      const _g2=_sc2.getContext('2d');_g2.fillStyle="#0e1420";_g2.fillRect(0,0,1024,128);
      _g2.fillStyle=homeHex;_g2.fillRect(0,116,1024,12);
      _g2.font="700 64px system-ui,Arial";_g2.fillStyle="#f2f5fa";_g2.textAlign="center";_g2.textBaseline="middle";
      _g2.fillText(String(stadCfg.tpl.name).toUpperCase().slice(0,26),512,58);
      const _st2=new THREE.CanvasTexture(_sc2);
      const _sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(endW*0.7,66),Math.min(endW*0.7,66)/8),new THREE.MeshBasicMaterial({map:_st2,transparent:true}));
      _sign.position.set(0,endH+((_tiers>=3)?endH*0.4:0)+4.6,-endZ+endD*0.30);scene.add(_sign);
    }catch(_e){}
  }
  // [5.88.0 S2] 2° MAXISCHERMO decorativo (top club, screens≥2) sulla Curva Nord — il TABELLONE resta a Sud (charter)
  if(T&&stadCfg.tpl&&(stadCfg.tpl.screens||1)>=2&&stadCfg.isDesktop){
    const _scr2=new THREE.Mesh(new THREE.BoxGeometry(14,7,0.8),new THREE.MeshLambertMaterial({color:0x0a0e16}));
    _scr2.position.set(-sideX-2,sideH+7,0);_scr2.rotation.y=Math.PI/2;scene.add(_scr2);
    const _scrF=new THREE.Mesh(new THREE.PlaneGeometry(12.6,5.8),new THREE.MeshBasicMaterial({color:0x18324a}));
    _scrF.position.set(-sideX-1.55,sideH+7,0);_scrF.rotation.y=Math.PI/2;scene.add(_scrF);
  }

  /* [7.190.0 collaudo PO «c'è SEMPRE quella fascia grigia o verde chiaro all'altezza della rimessa laterale»]
     CAUSA TROVATA: erano i 4 piani RESIDUI della vecchia "pista d'atletica" (5.88.0) — mai rimossi quando il PO
     l'ha bandita, solo RICOLORATI (asfalto 0x2e3238 / verde spento 0x2d4a2f). I due lunghi (106×5) stavano a
     z=±33 → cioè ESATTAMENTE a cavallo della linea laterale (_TLZ=33.2), dipinti SOPRA l'erba a y=0.02: da qui
     la fascia grigio/verde-chiaro all'altezza della rimessa, sopravvissuta ai fix 7.186/7.188 (che agivano sul
     piazzale ESTERNO, non su questi piani interni). RIMOSSI del tutto: sotto la touchline c'è solo prato. */
  // CROWD 2.0 §10 — cadenze di redraw ADATTIVE: folla rada quasi statica, stadio caldo più vivo, burst pieno solo su gol/occasioni
  const idleMs=crowd.fill<0.12?CROWD_CFG.anim.sparseRedrawMs:(crowd.intensity>0.7?CROWD_CFG.anim.idleRedrawMs:CROWD_CFG.anim.calmRedrawMs);
  const burstMs=isMob?CROWD_CFG.anim.burstRedrawMsMobile:CROWD_CFG.anim.burstRedrawMs;
  /* [7.185.0 collaudo PO «bandiere e sciarpe sparse in TUTTA la curva, troppo concentrato nel primo anello»]
     la scenografia tifo (in ThreeMatchView) piazzava tutto a quote fisse vicino al bordo campo perché NON conosceva
     la geometria vera della gradinata. Qui la esportiamo: posizione/profondità/altezza/anelli delle due curve →
     il tifo può salire lungo la PENDENZA reale (mLow/mUp di addStand) invece di ammassarsi in basso. */
  /* [7.565.0 collaudo PO «la copertura della tribuna impalla la camera»] IL FILO DELLA FALDA, ESPORTATO.
     L'impianto camera del 7.564 sceglieva la quota dall'altezza della tribuna e la distanza dal suo fronte,
     ma non sapeva NIENTE del tetto — e la copertura vera del 7.437 e' a SBALZO: la falda sporge verso il
     campo di 0,40-0,62 volte la profondita' del settore, quindi negli impianti grandi il suo filo arriva
     DAVANTI al punto in cui la camera stava. Da li' la falda taglia la linea di vista, ed e' esattamente
     quello che il PO vede. Qui si esporta la geometria REALE del tetto delle due tribune di fondo (quota
     della falda e z del filo verso il campo, gia' in coordinate mondo) cosi' la camera puo' mettersi
     DAVANTI al filo invece di indovinare una quota. Stessa disciplina del 7.185: la scenografia non
     stima piu' la gradinata, la legge. */
  const _roofEnd=(function(){try{
    const _mk=(nt,on)=>{ if(!on) return null;
      const _rTop=(nt>=3)?endH*1.34+2.4:endH+1.8;
      const _lv=_lvl437;
      const _zBack=endD*((nt>=3)?0.52:(_lv<=0?0.34:0.36));
      const _dp=(_lv<=0)?endD*0.20:endD*(_lv>=3?0.62:_lv>=2?0.52:0.40);
      const _zFrontLocal=(_lv<=0)?(_zBack-_dp/2):(_zBack-_dp);/* [lv<=0] la pensilina e' una scatola centrata su _zBack */
      return {top:_rTop,frontZ:endZ+_zFrontLocal};/* local -z guarda il campo: il filo in mondo e' endZ + zFrontLocal */
    };
    const _e=_mk((T&&T.asym)?1:_tiers,_roofFor("est")),_o=_mk(_tiers,_roofFor("ovest"));
    if(!_e&&!_o)return null;
    /* si tiene il piu' SPORGENTE dei due: la camera dev'essere davanti al filo peggiore, non a quello comodo */
    const _f=Math.min(_e?_e.frontZ:1e9,_o?_o.frontZ:1e9);
    const _t=Math.max(_e?_e.top:0,_o?_o.top:0);
    return {frontZ:_f,top:_t};
  }catch(_e){return null;}})();
  const _curveGeo={sideX,sideW,depthHome:(_sudH>sideH?sideD*1.15:sideD),depthAway:sideD,hHome:_sudH,hAway:sideH,tiers:_tiers,endZ,depthEnd:endD,hEnd:endH,roofEnd:_roofEnd};/* [7.189.0] + tribune Est/Ovest: servono per appoggiare gli striscioni al loro MURO */
  return {homeMats,awayMats,goalNet:awayGoalNet,crowdAnims,frontRows,idleMs,burstMs,curve:_curveGeo,endH,lvl:_lvl437};// materiali per il goal pulse · redraw animati · prime file 3D (LOD1) · geometria curve per il tifo · [7.455.0] +endH/lvl: l'altezza REALE della tribuna di fondo e il livello architettonico, perche' il maxischermo si appoggi a cio' che c'e' davvero dietro invece che a una quota fissa
}

/* ========================================
   THREE FIELD  (full-screen, camera zoom, 22 players)
======================================== */
function makeToonGrad(){
  const c=document.createElement('canvas');c.width=4;c.height=1;
  const g=c.getContext('2d');
  ['#333','#777','#bbb','#eee'].forEach((col,i)=>{g.fillStyle=col;g.fillRect(i,0,1,1);});
  const t=new THREE.CanvasTexture(c);t.minFilter=t.magFilter=THREE.NearestFilter;return t;
}
const _glbCache={};
function loadGLB(url){
  // [7.8.1 collaudo PO «mai burattini»] NON cachare i FALLIMENTI: prima un errore transitorio (rete mobile
  //   durante il prefetch al boot) restava cachato come promise RIFIUTATA → ogni retry (incluso il caricamento
  //   del match) riceveva lo stesso rifiuto → soldatini per tutta la sessione. Ora il fallimento evince la
  //   cache → il match ri-scarica da zero. I successi restano cachati (il prefetch continua a giovare).
  if(!_glbCache[url])_glbCache[url]=new Promise((res,rej)=>{
    if(typeof THREE.GLTFLoader==='undefined'){rej(new Error('no GLTFLoader'));return;}
    new THREE.GLTFLoader().load(url,res,null,rej);
  }).catch(e=>{try{delete _glbCache[url];}catch(_){}throw e;});
  return _glbCache[url];
}
// [6.95.0 collaudo PO «a volte il CH38 non viene caricato subito, iniziano la partita i soldatini»] PREFETCH
//   al BOOT: i 12 GLB del CH38 partono in download appena il gioco carica (cache _glbCache condivisa col match)
//   → quando arrivi all'ingresso in campo il modello è già pronto. Rispetta la preferenza ?glb=0 / 'cpm-glb'.
if(typeof window!=='undefined'&&window.__CPM_GLB!==false){try{
  const _pg95u=/[?&]glb=([01])\b/.exec((window.location&&window.location.search)||"");
  const _pg95p=(function(){try{return localStorage.getItem('cpm-glb');}catch(e){return null;}})();
  const _pg95on=_pg95u?_pg95u[1]==='1':_pg95p!=='0';
  if(_pg95on)setTimeout(function(){['footballer','anim-idle','anim-jog','anim-kick','anim-penalty','anim-header','anim-tackle','anim-volley','anim-gk-dive','anim-gk-catch','anim-gk-block','anim-receive'].forEach(function(n){try{loadGLB('./assets/'+n+'.glb').catch(function(){});}catch(e){}});},900);
}catch(e){}}
function colorCharGLB(model,jerHex){
  model.traverse(node=>{
    if(!node.isMesh)return;
    const n=(node.name||'').toLowerCase();
    if(n.includes('joint')){node.visible=false;return;}
    node.castShadow=true;node.receiveShadow=true;
    node.material=new THREE.MeshLambertMaterial({color:new THREE.Color(jerHex),skinning:true});
  });
}

/* =====================================================
   PITCH CANVAS — Modern 2D portrait football renderer
   Goals at top/bottom (vertical Sensible Soccer style)
===================================================== */


/* =====================================================
   THREE MATCH VIEW — renderer 3D (drop-in di PitchCanvas)
   Sprint 3D-1: stadio (buildStadium) + campo + 22 giocatori
   + palla, camera portrait fissa. Consuma gli STESSI prop
   di PitchCanvas; la logica HL non cambia.
   Sprint 3D-2: run-cycle + bob, velocità smussata, giocatori
   fermi orientati verso la palla, portieri distinti, sync fluido.
   Sprint 3D-3: camera cinematica — broadcast-follow in gioco,
   stacco ravvicinato sul protagonista negli highlight.
   Sprint 3D-4: atmosfera dinamica — orario (day/dusk/night, notte
   invariata), meteo (pioggia/neve/temporale+flash, nebbia), portiere
   clash-aware sui club colors.
   Sprint 3D-5: walkout cinematico 3D — squadre schierate in fila,
   carrellata che scorre sui giocatori, poi calcio d'inizio (sostituisce
   l'overlay 2D in modalità 3D).
   Sprint 3D-6 (Quick Wins): varietà giocatori (altezza/corporatura/carnagione
   deterministica per indice), idle reale a riposo, lean in avanti in corsa/sprint.
   Sprint 3D-6b: leggibilità azione + eroe — scia palla in dissolvenza negli HL,
   focus camera automatico sulla palla a fine azione (hl_result), marcatore
   diamante sopra il protagonista + rim-light sulla maglia.
   Sprint 3D-7: sync col motore (prop hlType derivato in sola lettura da
   situazione+azione) → animazioni one-shot del protagonista all'esito
   (tiro/colpo di testa/contrasto/dribbling) + camera dedicata su rigore/punizione.
   Sprint 3D-8a: slow-motion cinematografico sull'esito — bullet-time sul tiro
   (0.28x) con ritorno graduale a 1x; rallentano solo le animazioni e la palla
   (aDt/ak), la camera resta in tempo reale per un movimento fluido.
   Sprint 3D-8b: replay con riavvolgimento — ring buffer (≈2.5s) di tutti i
   mesh, riproduzione con run-cycle ricostruito dalla velocità inter-frame,
   camera replay alta laterale che segue la palla, letterbox "REPLAY".
===================================================== */
// ATE-3: etichette azione, delay commentary (ms = metà arco), colori tipo-specifici
const ATE3_LABEL={shot:"⚽ TIRO",cross:"↗ CROSS",save:"🧤 PARATA",tackle:"💥 CONTRASTO",pass:"→ PASSAGGIO"};
const ATE3_TYPEMS={shot:520,cross:680,save:550,tackle:350,pass:480}; // durata arco in ms per tipo
const ATE3_ARCMS={attack_goal:260,attack:260,wide_right:340,opp_goal:275,defend_goal:275,retreat:175,midfield:240}; // delay commentary = metà arco
const ATE3_ARCCOL={shot:"#f97316",cross:"#22d3ee",tackle:"#fbbf24",save:"#60a5fa",pass:"#a3e635"};
// ATE-4: zona ring — mappa zone SITUATIONS → posizione 3D (world coords) + posizione palla (game coords)
const HL_ZONE_3D={area:{x:38,z:0},bordo:{x:26,z:0},trequarti:{x:12,z:0},centro:{x:0,z:0},difesa:{x:-20,z:0},propria:{x:-38,z:0},fascia:{x:28,z:16}};
/* [7.194.0 S1] HL_ZONE_BALL rimossa: era il pre-posizionamento della palla verso la zona dell'highlight (ATE-4),
   codice MORTO da diverse release (il valore veniva sovrascritto dall'attach sull'eroe un frame dopo). Il compito
   che tentava di svolgere — dare alla palla un punto di nascita coerente — è ora di hlBallSpot, che lo fa davvero. */
/* [7.194.0 S1] DA DOVE NASCE LA PALLA di un highlight. Funzione PURA (stesso risultato per gioco e probe):
   dalla dichiarazione `ballAt` della situation + la posizione dell'eroe ricava il punto di partenza REALE del
   pallone. Corner: bandierina del lato verso cui l'eroe è schierato, in area d'attacco. Rimessa: linea laterale
   più vicina, un filo dietro l'eroe. Rinvio: piedi del proprio portiere. Compagno: appoggio arretrato sul lato
   opposto al taglio. Ritorna anche `at` così il chiamante sa se serve un BATTITORE. */
/* [7.350.0 collaudo PO ×4 «il pallone inizialmente non deve essere nei piedi dell'eroe» · «la scena deve
   inquadrare il compagno che ha il possesso» · «non attaccato ai piedi»] QUANDO L'AZIONE È UNA RICEZIONE.
   Misurato: 153 situations su 191 nascono col pallone a distanza ZERO dall'eroe, comprese quelle che per
   definizione lo ricevono — un tap-in, una deviazione, un colpo «di prima», un cross da attaccare. Funzione
   pura: struttura (stato-palla aereo = qualcuno l'ha crossata) + override autoriale `tactic.rv`, cosi' un
   domani si dichiara sulla singola situation senza toccare questa logica. */
/* [7.351.0 collaudo PO su gi109 «la palla deve essere nei piedi del compagno all'inizio»] LA RICEZIONE A
   TERRA. Il 7.350.0 sapeva riconoscere una sola ricezione: quella AEREA (chi attacca un cross). Ma «Stop e
   tiro fulmineo», «Ricezione tra le linee», «Assist di prima», «Tap-in», «Smistamento a un tocco» sono
   ricezioni RASOTERRA — il pallone arriva da un compagno e l'eroe lo gioca — e nascevano tutte con la palla
   gia' incollata al piede: 106 situations su 191 restavano fuori dalla consegna. Il vocabolario e' letto UNA
   VOLTA in S() e congelato in `sit.recv` (stesso schema di deriveBallState/deriveSitCine): a runtime non si
   legge testo, e riscrivere una situation non sposta la cinematica. L'override autoriale `tactic.rv` vince
   sempre, cosi' un caso particolare si dichiara sul dato senza toccare questa funzione. */
function deriveReception(sit){
  if(!sit)return false;
  const ov=sit.tactic&&sit.tactic.rv; if(ov===true||ov===false)return ov;
  if(sit.ballAt||sit.offBall)return false;          /* la nascita e' gia' dichiarata: non ci si mette in mezzo */
  if(sit.type==="def")return false;                  /* in difesa la palla e' dell'avversario, gia' gestito */
  /* [7.391.0 collaudo PO #41 «il pallone deve stare nei piedi del compagno che effettua il passaggio
     all'eroe»] «MOVIMENTO BLOCCATO» NON VUOL DIRE «PIAZZATO». L'esclusione qui sopra nasceva per rigori e
     punizioni — dove il pallone e' davvero ai piedi dell'Eroe, e' lui a batterlo, e una consegna sarebbe
     una bugia — ma usava come prova il flag del MOVIMENTO, che una scena puo' alzare per tutt'altra
     ragione: gi41 «Il cross arriva alto — tentazione assoluta in area» blocca i passi perche' stai
     aspettando il cross, non perche' il pallone sia tuo. Risultato: quella scena non era ne' una
     ricezione ne' una off-ball, quindi non riceveva NESSUNA consegna da nessuno dei due rami — misurato
     con i contatori in pagina, il ramo non veniva percorso una sola volta e il pallone restava dov'era,
     a 2,3 unita' da un AVVERSARIO. Ora si esclude cio' che e' davvero un piazzato, e la prova e' l'intento
     dichiarato. Misurato sull'intero pool: delle dieci situazioni col movimento bloccato, NOVE sono
     rigori e punizioni e restano escluse; l'unica che cambia classificazione e' gi41, cioe' proprio quella
     segnalata. */
  if(sit.lockMovement&&/penalty|freekick/.test(String((typeof deriveIntent==="function"?deriveIntent(sit):"")||"")))return false;
  if(hlBallState(sit)==="aerial")return true;        /* aerea = arriva da qualcuno, non e' sua */
  const _t=String(sit.text||"").toLowerCase();
  /* [7.362.0 collaudo PO #53/#63/#101 «il pallone deve essere all'inizio scena nei piedi del compagno e
     non dell'eroe»] MISURATO SU PARTITA VERA (il percorso forzato salta `hl_intro`, cioe' proprio la
     transizione dove la scena si apre): all'ingresso in un highlight con ricezione il pallone si posiziona
     a 14 unita' dall'eroe e poi VIAGGIA fino ai suoi piedi in dieci fotogrammi decelerando (2,5 · 2,5 ·
     1,9 · 1,3 · 1,0 · 0,5) — la consegna funziona; senza ricezione atterra ESATTAMENTE addosso all'eroe,
     distanza 0,0u, e ci resta. Non e' una consegna in ritardo: e' la classificazione.
     Due segnali mancavano, e sono entrambi strutturali piu' che testuali.
     (1) LA GIRATA. «Cambio di direzione a 180°», «virata», «giro e tira» presuppongono di RICEVERE
     spalle alla porta: il vocabolario aveva «spalle alla porta» ma non il gesto che la descrive.
     (2) L'ETICHETTA DELL'AZIONE. Il classificatore leggeva SOLO `sit.text`, ma «di prima», «prima
     intenzione», «a un tocco», «al volo» stanno quasi sempre nell'ETICHETTA — e si puo' giocare di prima
     solo un pallone che sta arrivando. Misurate 33 scene con un'azione di prima, di cui 14 aperte con la
     palla incollata all'eroe. Il segnale vale per la scena INTERA e non per la singola scelta, ed e'
     corretto cosi': l'apertura precede la scelta, e le altre azioni («controlla e tira») sono comunque
     compatibili con un pallone che arriva. */
  if(/virata|180°|cambio di direzione|giro e /.test(_t))return true;
  const _lb=((sit.actions||[]).map(a=>String((a&&a.label)||"")).join(" ")).toLowerCase();
  if(/di prima|prima intenzion|a un tocco|al volo|tap-?in|vol[eé]e/.test(_lb))return true;
  if(/ricezion|ricevi |stop e |tap-?in|deviazion|di prima|a un tocco|prima intenzion|sponda|rimorchio|fai il velo|rimessa|lascia sfuggire|spalle alla porta|di spalle/.test(_t))return true;
  /* [7.366.0 collaudo PO, QUARTA volta la stessa frase: «la palla deve essere nei piedi del compagno che
     effettua il passaggio» — #153 «Bordata da centrocampo», #10 «Pallonetto su portiere in uscita», la
     mischia in area, dopo #53/#63/#101] IL DEFAULT ERA ROVESCIATO. Questo vocabolario l'ho esteso due volte
     (7.351 e 7.362) e due volte sono arrivate scene nuove che non copriva: il difetto non erano le parole
     mancanti, era che la palla NASCE ai piedi dell'eroe e la ricezione e' l'eccezione — 65 scene su 191.
     Ma un highlight e' un MOMENTO DENTRO UN'AZIONE, e un'azione comincia con qualcuno che passa: la palla
     incollata all'eroe e' l'eccezione, non la regola.
     Ora il default e' la ricezione. Le esclusioni forti restano intatte sopra e non si toccano (`ballAt`
     esplicito, off-ball, difensive, piazzati con `lockMovement`); qui si aggiunge la sola famiglia della
     CONDUZIONE, che e' l'unico caso in cui «palla all'eroe» e' la verita' della scena e non una
     scorciatoia: se sta dribblando, il pallone ce l'ha lui. */
  if(sit.intent==="dribble")return false;
  return !/dribbling|conduzion|porta il pallone|palla al piede|finta|step-?over|elastico|sterzat|hocus|contropiede|campo aperto|costruisci|palla a centrocampo/.test(_t);
}
/* lettore puro del campo congelato (fallback: deriva al volo per le sit sintetiche/chained, come hlBallState) */
function isReceptionSit(sit){
  if(sit&&sit.recv!=null)return sit.recv;
  return (typeof deriveReception==="function")?deriveReception(sit):false;
}
function hlBallSpot(sit,hx,hy){
  const at=(sit&&sit.ballAt)||((sit&&sit.offBall)?"mate":"hero");
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  if(at==="corner"){const _sd=hy<50?1:-1;return {at,x:97,y:_sd>0?2.5:97.5};}
  if(at==="throw"){const _sd=hy<50?1:-1;return {at,x:cl(hx-6,6,94),y:_sd>0?1.5:98.5};}
  if(at==="gk")return {at,x:7,y:50};
  /* il cross parte dalla fascia sullo STESSO lato dell'eroe ma PIÙ ARRETRATO e PIÙ LARGO: metterlo sulla fascia
     opposta (primo tentativo) allontanava crossatore e attaccante di mezzo campo — su schermo verticale uno dei
     due finiva sempre fuori quadro, e il pallone attraversava tutta l'area invece di arrivare dalla corsia. */
  if(at==="wing"){const _fy=hy<50?cl(hy-14,4,32):cl(hy+14,68,96);return {at,x:cl(hx-11,52,90),y:_fy};}
  if(at==="mate"){const _sd=hy<50?1:-1;return {at,x:cl(hx-16,6,Math.max(7,hx-8)),y:cl(hy+_sd*8,8,92)};}
  return {at:"hero",x:hx,y:hy};
}
/* ========================================================================
   [7.371.0 direttiva PO «sistema completo e realistico di ESULTANZE DOPO I GOL»] CELEBRATION SYSTEM.
   Questi due sono i pezzi PURI (nessun DOM, nessun Three.js, nessuno stato): si testano in node e
   sono la ragione per cui il sistema e' estendibile — aggiungere un'esultanza domani vuol dire
   aggiungere una RIGA a CELEBRATIONS, non rimettere le mani nella regia.

   ⚠️ VINCOLO D'ASSET, misurato prima di progettare: in `assets/` non esiste NESSUNA clip di
   esultanza. L'unica animazione riusabile come gesto di gioia e' `anim-throwin.glb`, gia' montata
   col nome `lift` e gia' usata per l'alzata del trofeo nella cerimonia. Tutto il resto del
   vocabolario si costruisce con LOCOMOZIONE e trasformazioni del CORPO INTERO — perche' sotto il
   CH38 (GLB di default) il mesh procedurale e' nascosto e le rotazioni degli arti NON SI VEDONO
   (`animOne`: `if(mesh._glbDriven)return`). E' esattamente il motivo per cui l'esultanza che
   c'era gia' (`celebT`: salto + braccia procedurali) al PO risultava assente: di quelle due cose
   si vedeva solo il saltello, muto e senza braccia.
   Ogni voce dichiara la clip che le serve (`clip`): quando arriveranno nuove animazioni bastera'
   aggiungere righe qui, senza toccare ne' la selezione ne' l'esecuzione.
======================================================================== */

/* Classifica il PESO del gol. Non guarda il minuto da solo: 1-1 all'88' che diventa 2-1 e' un gol
   che decide la partita, 3-0 al 20' che diventa 4-0 non e' niente. Puro e deterministico. */
function goalContext(o){
  const g=o||{};
  const by=(g.by==="own")?"own":((g.by==="hero")?"hero":"mate");
  const min=Math.max(0,Math.min(130,+g.minute||0));
  const us0=Math.max(0,+g.usBefore||0),th0=Math.max(0,+g.themBefore||0);
  /* l'autorete la segna l'ALTRA squadra: il punteggio si muove dall'altra parte */
  const us1=(by==="own")?us0:us0+1,th1=(by==="own")?th0+1:th0;
  const tags=[];
  if(g.setPiece==="penalty")tags.push("penalty");
  else if(g.setPiece==="freekick")tags.push("freekick");
  if(min>=85)tags.push("late");
  if(min>=90)tags.push("last_minute");
  if(g.bigMatch)tags.push("big_match");

  let tier="NORMAL";
  if(by==="own")tier="OWN_GOAL";
  else{
    const wasBehind=us0<th0,wasLevel=us0===th0;
    const nowLevel=us1===th1,nowAhead=us1>th1;
    const margin=us1-th1;
    if(nowLevel&&wasBehind)tier="EQUALIZER";
    else if(nowAhead&&(wasLevel||wasBehind))tier="LEAD";
    /* il peso vero: un gol che mette avanti DI UNO quando il tempo sta finendo decide la partita.
       Un gol che porta da +2 a +3 non decide niente, in nessun minuto. */
    if(nowAhead&&margin===1&&min>=85)tier="MATCH_WINNER";
    else if(nowAhead&&margin===1&&min>=70)tier="DECISIVE";
    else if(nowLevel&&min>=85)tier="DECISIVE";/* pareggio in extremis: pesa quanto un vantaggio */
    else if(margin>=3)tier="NORMAL";/* goleada: nessuna enfasi, sarebbe caricaturale */
  }
  /* intensita' 0..3 — la usano regia e compagni per sapere QUANTO insistere */
  const heat=(tier==="OWN_GOAL")?0
    :(tier==="MATCH_WINNER")?3
    :(tier==="DECISIVE")?2
    :(tier==="EQUALIZER"||tier==="LEAD")?((min>=85)?2:1)
    :((min>=85)?1:0);
  return {by,tier,tags,heat,usAfter:us1,themAfter:th1,minute:min};
}

/* IL VOCABOLARIO. `clip` = animazione GLB richiesta (null = sola locomozione/corpo).
   `need` = spazio richiesto attorno al marcatore. `heat` = fascia d'intensita' ammessa. */
/* [7.386.0 collaudo PO «la partita non va in pausa e la lettera P non funziona»] NESSUNA SCORCIATOIA
   RUBA I TASTI A CHI STA SCRIVENDO. Il difetto si e' visto negli APPUNTI DI COLLAUDO del PO, e si legge
   a occhio nudo: in ogni nota mancava ogni singola «p» — «comagno con la alla tra i iedi» per «compagno
   con la palla tra i piedi». La scorciatoia della pausa intercetta «p» sul documento, fa
   `preventDefault` e ferma la propagazione: la lettera non arrivava mai alla casella di testo, e in
   piu' ogni «p» digitata invertiva la pausa — due «p» nella stessa parola la rimettevano com'era, che
   e' esattamente «la partita non va in pausa».
   Non e' un difetto della sola pausa: TUTTE le scorciatoie del match (numeri per le azioni, WASD per il
   movimento) hanno la stessa porta aperta. Qui la si chiude in un punto solo — se il fuoco e' dentro un
   campo di testo, la tastiera appartiene a chi scrive. */
function _scrive386(e){if(typeof window!=="undefined"&&window.__CPM_NOGUARD386)return false;try{const t=e&&e.target;if(!t)return false;
  if(t.isContentEditable)return true;
  const g=(t.tagName||"").toUpperCase();
  return g==="INPUT"||g==="TEXTAREA"||g==="SELECT";}catch(_e){return false;}}
if(typeof window!=='undefined')window._scrive386=_scrive386;

const CELEBRATIONS=[
  /* sempre disponibile: e' la clip che esiste davvero */
  {id:"arms_up",      clip:"lift", heat:[0,3], run:0,               desc:"braccia al cielo sul posto"},
  {id:"jump_arms_up", clip:"lift", heat:[1,3], run:0,   jump:1.15,  desc:"salto con le braccia al cielo"},
  /* corse: locomozione pura, quindi visibili sotto CH38 e gia' fisicamente corrette (animOne) */
  {id:"run_to_crowd", clip:"lift", heat:[1,3], run:9,   toward:"crowd", desc:"corsa sotto la curva a braccia alzate"},
  {id:"run_to_mates", clip:null,   heat:[1,3], run:8,   toward:"mates", desc:"corsa incontro ai compagni"},
  {id:"run_wide",     clip:"lift", heat:[2,3], run:12,  toward:"corner",desc:"corsa lunga verso la bandierina"},
  /* corpo intero: la quota e' POSIZIONE, quindi si vede anche col GLB */
  {id:"knee_slide",   clip:null,   heat:[2,3], run:7,   toward:"crowd", slide:1, desc:"scivolata sulle ginocchia"},
  /* [7.372.0 verifica GLB-ON del 7.371] CONTENUTA NON VUOL DIRE INVISIBILE. Questa voce nasceva con
     `clip:null`, e la verifica GLB-ON ha mostrato cosa significhi davvero: 3 gol su 4 la sceglievano e
     sotto CH38 l'eroe non faceva NIENTE — zero gesti campionati su 50 fotogrammi. Cioe' esattamente il
     difetto che questa release doveva chiudere, ripresentato da un'altra porta. Con UNA sola clip di
     gioia disponibile la sobrieta' non puo' passare dall'assenza di gesto: passa dalla DURATA e dal
     fatto che non ci si muove. Braccia al cielo brevi, sul posto: e' un'esultanza sobria, non il nulla. */
  {id:"contained",    clip:"lift", heat:[0,1], run:0,   quiet:1,    desc:"esultanza contenuta, sul posto"},
  {id:"no_celebration",clip:null,  heat:[0,0], run:0,   mute:1,     desc:"non esulta (autorete)"},
];

/* Sceglie l'esultanza. Deterministica (seed), compatibile con lo SPAZIO reale e con le clip
   davvero montate, e con anti-ripetizione: se l'eroe segna due volte non rifa la stessa cosa. */
function pickCelebration(ctx,opt){
  const c=ctx||{},o=opt||{};
  const have=o.clips||{};
  const space=o.space||{};
  const recent=o.recent||[];
  if(c.tier==="OWN_GOAL")return CELEBRATIONS.find(x=>x.id==="no_celebration");
  const heat=Math.max(0,Math.min(3,+c.heat||0));
  const pool=CELEBRATIONS.filter(x=>{
    if(x.mute)return false;
    if(heat<x.heat[0]||heat>x.heat[1])return false;
    if(x.clip&&have[x.clip]===false)return false;/* clip non montata → la voce non esiste */
    /* SPAZIO: una corsa che finirebbe dentro un palo o fuori dal campo non si sceglie */
    if(x.run>0){
      const room=(x.toward==="mates")?(space.toMates!=null?space.toMates:99)
                :(x.toward==="corner")?(space.toCorner!=null?space.toCorner:99)
                :(space.toCrowd!=null?space.toCrowd:99);
      if(room<x.run)return false;
    }
    if(x.toward==="mates"&&!(space.matesNear>0))return false;
    return true;
  });
  if(!pool.length)return CELEBRATIONS.find(x=>x.id==="arms_up");
  /* anti-ripetizione: si scartano le ultime usate finche' resta qualcosa da scegliere */
  const fresh=pool.filter(x=>recent.indexOf(x.id)<0);
  const use=fresh.length?fresh:pool;
  const seed=Math.abs(Math.floor(+o.seed||0))||1;
  return use[seed%use.length];
}
if(typeof window!=='undefined'){window.goalContext=goalContext;window.pickCelebration=pickCelebration;window.CELEBRATIONS=CELEBRATIONS;}/* esposti per i guardiani in node */

// CINE-VAR: palette zone-ring per hlType — colori distinti per ogni tipo di azione
const HL_ZONE_COL={shot:0xf97316,penalty:0xef4444,cross:0x22d3ee,freekick:0x22d3ee,tackle:0xfbbf24,save:0x60a5fa,pass:0xa3e635,dribble:0x8b5cf6,header:0xfbbf24,build:0x64748b};
// CINE-COH: stato reale del pallone all'avvio della situation — SORGENTE UNICA per la coerenza HL↔azione.
//  'set_ground' = palla ferma (rigore/punizione)
//  'aerial'     = palla che arriva/è in volo (cross, corner, lancio alto, rimbalzo, rovesciata, stacco, colpo di testa)
//  'feet'       = palla controllata al piede (default)
// L'hlType viene poi derivato in coerenza con questo stato (niente colpi di testa / volée con palla al piede).
// CINE-DECOUPLE (5.15.0): la classificazione palla/cine NON legge più sit.text a RUNTIME.
//   deriveBallState/deriveSitCine derivano i segnali UNA VOLTA (chiamate in S()) e li CONGELANO
//   come campi (sit.ballState/sit.cine). hlBallState/deriveHL leggono i campi. Logica invariata
//   (stesse regex, stessi input) → zero diff / golden invariato. Il parsing del testo è ora
//   isolato in 2 sole funzioni-sorgente: primo taglio per migrare i TESTI a pura intenzione.
function deriveBallState(sit){
  // (b2 5.18.0) NIENTE testo: override esplicito autoriale (tactic.bs) → poi STRUTTURALE dall'intent.
  //   Le 52 situations + 3 chain divergenti dalla struttura portano un tactic.bs esplicito (zero-diff,
  //   verificato). Così riscrivere sit.text non cambia più lo stato palla.
  const ov=sit&&sit.tactic&&sit.tactic.bs; if(ov==="aerial"||ov==="feet"||ov==="set_ground")return ov;
  const it=sit&&sit.intent;
  if((it==="penalty"||it==="freekick")&&sit&&sit.lockMovement)return"set_ground";
  if(it==="insertion"||it==="cross")return"aerial";
  return"feet";
}
// Segnali cinematici derivati dal testo (penalty/freekick/1v1/secondo palo/di-prima) — stesse regex
// che deriveHL leggeva inline da txt/tl. Congelati in sit.cine, così deriveHL non legge più il testo.
function deriveSitCine(sit){
  // (b2 5.18.0) NIENTE testo: base STRUTTURALE dall'intent (penalty/freekick) + override esplicito
  //   tactic.cn per i segnali testuali (1v1/secondo-palo/di-prima), baked sulle situations che li usano.
  const it=sit&&sit.intent;
  const base={penalty:it==="penalty",freekick:it==="freekick",oneOnOne:false,fpCross:false,fpHeader:false,tapIn:false};
  const ov=sit&&sit.tactic&&sit.tactic.cn;
  return ov?Object.assign(base,ov):base;
}
// hlBallState ora è un LETTORE puro del campo precalcolato (fallback: deriva al volo per sit sintetiche/chained).
/* [7.478.0 codice 007] TESTIMONE DELLE RETI DI SGUARDO — e la grandezza e' cambiata DOPO una misura che ha
   detto di no. Il 7.475 ha provato che l'AMPIEZZA dell'oscillazione non e' esprimibile in headless (un
   campione per fotogramma, 8-25 fps, contro 34,7 inversioni/s del dispositivo). La prima ipotesi di questa
   release era che la rete fosse un interruttore acceso-spento a ogni fotogramma, curabile con isteresi:
   MISURATO SULLE CINQUE SITUATIONS CON LA PALLA FUORI QUADRO (gi 6·37·77·79·133, censite dal 7.305), e la
   misura ha detto il CONTRARIO — con l'isteresi gli ingaggi SALGONO (1,32/s contro 0,66/s), perche' senza
   la rete non lampeggia affatto: resta accesa a lungo, e correggendo piu' a fondo l'isteresi la faceva
   rilasciare e riagganciare. Ipotesi caduta, isteresi revocata. Resta lo strumento, con la grandezza che
   descrive davvero un'oscillazione: quante volte la correzione INVERTE IL SEGNO, sui fotogrammi in cui la
   rete corregge. E' un rapporto, non una frequenza: non dipende dai fps, quindi headless e dispositivo
   dicono lo stesso numero. Solo strumenti accesi. */
function _hyBump478(sr,k,cor){try{if(typeof window==='undefined')return;if(!(window.__CPM_REC||window.__CPM_HY478))return;
  const o=(window.__CPM_HY478=window.__CPM_HY478||{t0:performance.now()});
  const f=o[k]||(o[k]={n:0,inv:0,s:0});f.n++;
  const sg=Math.sign(cor||0);if(sg&&f.s&&sg!==f.s)f.inv++;if(sg)f.s=sg;}catch(_e){}}
function hlBallState(sit){
  if(sit&&sit.ballState!=null)return sit.ballState;
  return (typeof deriveBallState==="function")?deriveBallState(sit):"feet";
}
/* [7.214.0] QUOTA DI CONTATTO di una giocata AEREA (metri, mondo Three) — puro, esposto per i test.
   Ritorna null quando il pallone deve stare a terra: fuori dagli highlight, sull'esito (dove comanda l'arco),
   sui piazzati (palla ferma per definizione) e in ogni situazione che il motore non classifica `aerial`.
   Le quote sono quelle del GESTO, non un valore unico: si incorna alla fronte, si va di volée/rovesciata sul
   collo del piede alto, un cross al volo si prende a mezza altezza. */
function aerialContactY(P,isHL,isResult,preStrike){
  /* [7.220.0 revisione PO «la rovesciata non parte con il pallone a mezz'aria ma va PRIMA a terra»] la quota
     di contatto regge anche nell'ATTESA DEL COLPO: prima l'esclusione di `isResult` faceva cadere il pallone
     sull'erba nell'istante fra la scelta e la partenza dell'arco — cioè esattamente il fotogramma del
     contatto. Il chiamante applica questo ramo solo quando NON c'è arco né post-arco, e `_preStrike` lo
     chiude appena il pallone è stato colpito, così dopo l'azione la palla torna a terra come deve. */
  if(!isHL||!P||P.hlBall!=="aerial"||P.hlSetPiece)return null;
  if(isResult&&!preStrike)return null;
  if(P.hlType==="header")return P.hlVariant==="header_diving"?1.45:2.15;// tuffo di testa = più basso, in caduta
  if(P.hlVariant==="shot_volley")return 1.35;                            // volée · mezza volée · rovesciata
  if(P.hlType==="cross")return 1.85;                                     // traversone di prima su palla che scende
  return 1.75;
}
// CINE-1: motore cinematografico — deriva {type, pattern, variant} da situation+azione.
// `type` resta byte-identico al cascade legacy (zero regressioni); pattern/variant sono il nuovo backbone.
function deriveHL(sit,act){
  const lbl=(act?.label||"").toLowerCase();
  const cn=(sit&&sit.cine)||(typeof deriveSitCine==="function"?deriveSitCine(sit):{});// CINE-DECOUPLE: segnali da campo, non da sit.text
  const st=act?.stat, sitType=sit?.type, z=sit?.zones?.[0], ballState=hlBallState(sit);
  const isCarry=/\bavanza\b|porta palla|porta il pallone|palla al piede|conduci|conduzione|porto palla/.test(lbl)&&!/angolo|gestis|temporeggi|tieni palla/.test(lbl);// 5.43.0 BALL_CARRY: conduzione palla al piede (esclusi i contesti di temporeggiamento all'angolo)
  // ── TYPE — cross e testa riconosciuti PRIMA della classificazione per stat (label ha priorità) ──
  let type=null;
  if(cn.penalty)type="penalty";
  else if(cn.freekick)type="freekick";
  else if(act&&/cross|traversone/.test(lbl))type="cross";// CINE-2: cross label prima di stat=passaggio
  else if(act&&/testa|incornata|stacco/.test(lbl))type=(ballState==="aerial")?"header":"shot";// CINE-COH: colpo di testa SOLO su palla aerea; altrimenti conclusione a terra
  else if(st==="tiro")type="shot";
  else if(st==="passaggio")type="pass";
  else if(st==="dribbling")type="dribble";
  else if(sitType==="def")type="tackle";
  else if(act){
    if(/contrasto|tackle|scivolata|intercett/.test(lbl))type="tackle";
    else if(/dribbl|finta|tunnel|sombrero/.test(lbl))type="dribble";
    else if(/tir(o|a|i|are|ò)|conclu(d|s)|pallonett|cucchiaio|rovesciata|bomba|stoccata/.test(lbl))type="shot";// 5.41.0: riconosce anche le forme VERBALI ("tira/tiri/tirare") e i CHIP ("pallonetto/cucchiaio")/"conclude" → una conclusione etichettata non resta più "build". I passaggi/rigori restano gestiti prima (stat/cn).
    else if(/passaggio|filtrante|imbucata/.test(lbl))type="pass";
  }
  if(!type)type=(z==="area"||z==="bordo")?"shot":(z==="fascia")?"cross":"build";
  if(type==="build"&&isCarry&&act&&act.rew==="goal")type="shot";// 5.43.0: la conduzione palla al piede che porta al gol è un TIRO preceduto dal build-up di CONDUZIONE (BALL_CARRY) — non più un gesto neutro di costruzione
  // ── VARIANT (nuovo livello cinematografico) ──
  let variant=null;
  /* [7.386.0 collaudo PO #111 «Non e' rasoterra»] IL PASSAGGIO NON AVEVA VARIANTI. Tiro, cross e colpo
     di testa leggono l'etichetta dell'azione e ne ricavano una variante che decide la traiettoria; il
     passaggio no — «rasoterra», «lancio lungo», «parabola» finivano tutti nella stessa altezza d'arco.
     Misurate tre azioni che promettono «rasoterra» e alzano il pallone fino a 1,80u, fra cui gi111,
     la scena segnalata. Due varianti bastano: una promessa di palla a terra e una di palla alta. */
  if(type==="pass"){
    if(/raso ?terra|rasoterra|raso|a terra|piatto/.test(lbl))variant="pass_ground";
    else if(/lanci|lungo|parabola|campanil|scavalc|alto|pallonett/.test(lbl))variant="pass_lofted";
  }
  if(type==="cross"){
    // CINE-7: "secondo palo / palo lontano" va riconosciuto anche dalla label (non solo dal testo) → attiva regia FAR_POST
    if(/rientr|a rientrare/.test(lbl))variant="cross_cutback";
    else if(/secondo palo|palo lontano|profond|arretrat/.test(lbl)||cn.fpCross)variant="cross_far_post";
    else if(/basso|teso|raso/.test(lbl))variant="cross_low_driven";
    else variant="cross_near_post";
  } else if(type==="header"){
    if(/tuffo|piombo|in corsa/.test(lbl))variant="header_diving";
    else if(/secondo palo|palo lontano|profond/.test(lbl)||cn.fpHeader)variant="header_far_post";
    else variant="header_near_post";
  } else if(type==="shot"){
    if(/pallonett|cucchiaio|scavin/.test(lbl))variant="shot_chip";// label-chip ha priorità su pattern situazione (es. pallonetto in 1v1)
    else if(cn.oneOnOne)variant="shot_one_on_one";
    else if(ballState==="aerial"&&/rovesciat|sforbiciat/.test(lbl))variant="shot_volley";// CINE-COH: gesti acrobatici alzano sempre la palla → volée · [7.113.0 audit massivo · fix D3] gate su aerial come la riga sotto (no-op sui dati attuali — ogni rovesciata/sforbiciata vive in una sit aerial — ma evita una bicicletta su palla a terra in futuro)
    /* [7.597.0 - LA ROVESCIATA AL CONTRARIO ERA UN ORDINE DI RAMI, non un'imbardata]
       COLLAUDO PO, sesta segnalazione della stessa cosa, e a risolverla e' stato il suo appunto: SIT 167,
       azione Controbalzo secco al volo, nota Rovesciata al contrario. Quell'etichetta contiene DUE
       marcatori. Il ramo qui sotto manda al gesto acrobatico tutto cio' che dice al volo; il ramo dopo
       manda al colpo di prima tutto cio' che dice controbalzo. Vinceva il primo perche' veniva prima, e
       un controbalzo secco veniva reso come una rovesciata. Il commento del ramo giusto lo diceva gia' a
       due righe di distanza: prima intenzione uguale colpo di prima a terra, NON volee aerea. L'intento
       era scritto; l'ordine lo tradiva.
       E spiega perche' si vedeva al contrario: per un controbalzo il giocatore e' girato VERSO la porta,
       giustamente, e il rig acrobatico lo ribalta partendo da li'. Non c'era nessuna imbardata da
       correggere, c'era un gesto che non doveva essere quello. Cinque release passate a raddrizzare una
       rovesciata che non doveva nemmeno esserci.
       CORREGGE una cosa riferita al PO: avevo cercato le rovesciate nel testo della SITUATION e ne avevo
       contate cinque, concludendo che la 167 non fosse una rovesciata. Il gesto si sceglie dalla label
       dell'AZIONE, che e' dinamica: quel censimento guardava la tabella sbagliata.
       DICHIARATO NON DIMOSTRATO. Nel percorso che il laboratorio riesce a percorrere, 191 situations
       aperte una per una, l'etichetta arriva VUOTA in tutte e 174 le conclusioni registrate: i rami sul
       testo non scattano affatto, e il colpo di prima ci arriva dal flag della situazione. Verde e rosso
       davano la stessa ripartizione. Questa correzione non rompe niente ma su quel percorso non si vede
       nemmeno; il percorso con l'etichetta piena, quello che il PO vede sul telefono, non l'ho ancora
       trovato ed e' li' che va verificata. Spedita come coerenza fra intento dichiarato e ordine dei
       rami, NON come segnalazione chiusa.
       IL GATE E' DIVENTATO ROSSO PER QUESTO COMMENTO, e la causa non era quella che sembrava. La suite
       analitica ESTRAE questa funzione dal sorgente con un taglio testuale, e cercava la sua riga di
       chiusura entro CENTOVENTI righe dall'inizio: aggiungendo questa nota la chiusura e' finita oltre la
       finestra e l'estrazione e' fallita con deriveHL is not defined. Ho perso mezz'ora a incolpare i
       caratteri speciali - virgolette caporali, trattini lunghi, la guardia su window - riscrivendo il
       testo tre volte, quando bastava leggere l'estrattore invece di indovinare. La lezione e' la stessa
       di tutta la giornata: si legge lo strumento, non si tira a indovinare cosa non gli piace.
       Il tetto delle 120 righe e' stato tolto (tests/situations-3d-validation.js): non proteggeva da
       nulla, e rendeva il gate ostaggio della lunghezza dei commenti. Qui si puo' scrivere. */
    else if(/prima|deviazion|istintiv|tap-in|controbalz/.test(lbl))variant="shot_first_time";
    else if(ballState==="aerial"&&/al volo|vol[eé]e|volo/.test(lbl))variant="shot_volley";// CINE-COH: volée SOLO con palla aerea (cross/rimbalzo)
    else if(/piazzat|preciso/.test(lbl)&&/bass|raso|terra/.test(lbl))variant="shot_one_on_one";/* [7.222.0] «piazzato basso» e una conclusione RASOTERRA nell angolo: prima cadeva nel tiro a giro (arco alto) e leggeva come un pallonetto */
    else if(/giro|piazzat|angolat/.test(lbl))variant="shot_curled";
    else if(/prima|deviazion|istintiv|tap-in|controbalz/.test(lbl)||cn.tapIn)variant="shot_first_time";// CINE-COH: "di prima"/prima intenzione = colpo di prima a terra, non volée aerea
    else variant="shot_power";
  } else if(type==="penalty"){
    if(/cucchiaio|pallonett/.test(lbl))variant="penalty_panenka";// Panenka → arco alto
  } else if(type==="freekick"&&act){
    /* [7.216.0 revisione PO «sembra un cross basso»] SULLA PUNIZIONE LA SCELTA CONTA. Il ramo `freekick`
       ignorava del tutto l'azione: «Cross alto», «Cross basso teso» e «Giocata corta» producevano la STESSA
       identica traiettoria (quella del tiro diretto in porta), quindi le tre opzioni erano indistinguibili a
       schermo. La distinzione esisteva già nel gameplay — dal 7.8.9 solo la punizione da TIRO DIRETTO apre la
       griglia di mira — ma non arrivava alla cinematica. Discriminante: la stat dell'azione (una CONSEGNA è
       passaggio/tecnica, una conclusione è `tiro`), così «Tiro rasoterra» non viene scambiato per un cross basso.
       Il variant resta null senza azione (fase di lettura) → regia e firma golden invariate. */
    const _dl=(st!=="tiro"&&act.rew!=="goal");
    if(!_dl)variant="freekick_direct";
    else if(/alto|in area|traversone|pennell|incornat|secondo palo/.test(lbl))variant="freekick_cross_high";
    else if(/cross|teso|raso|bass|filtrant|primo palo/.test(lbl))variant="freekick_cross_low";/* il primo palo si serve TESO, non pennellato */
    else variant="freekick_short";
  } else if(type==="dribble"){
    if(/rientr|interno/.test(lbl))variant="dribble_inside";
    else if(/sterzat|esterno/.test(lbl))variant="dribble_outside";
    else variant="dribble_feint";
  }
  // ── PATTERN (raggruppamento tattico — backbone regia, consumato da CINE-5) ──
  let pattern="BUILDUP";
  if(type==="penalty")pattern="PENALTY";
  else if(type==="freekick")pattern="SET_PIECE";
  else if(type==="cross")pattern=variant==="cross_far_post"?"FAR_POST_CROSS":variant==="cross_cutback"?"CUTBACK":"NEAR_POST_CROSS";
  else if(type==="header")pattern="HEADER_ATTACK";
  else if(type==="shot")pattern=cn.oneOnOne?"ONE_ON_ONE":isCarry?"BALL_CARRY":(/dribbl|finta|elastico|doppio passo|step-?over|sterzat|serpentin|sombrero|tunnel|rientr/.test(lbl)&&!/senza dribbl/.test(lbl))?"DRIBBLE_SHOT":"EDGE_SHOT";// 5.42.0: un TIRO la cui LABEL descrive un dribbling ("doppio passo/elastico/finta/rientra e tira") usa il build-up DRIBBLE_SHOT (finta+accelerazione poi tiro) invece di EDGE_SHOT → il dribbling non si perde più nella regia. "senza dribblare" resta EDGE_SHOT. pattern da campo cine (1v1) ha priorità.
  else if(type==="dribble")pattern="DRIBBLE_SHOT";
  else if(type==="tackle")pattern="TACKLE";
  else if(type==="pass"){
    /* [7.318.0 collaudo PO «azione scarica e ricevi sul fondo: l'azione e' disegnata male, il pallone fa dei
       giri strani!»] IL PATTERN RISPETTA L'INTENTO DICHIARATO. Il pattern del passaggio si deduceva SOLO dal
       testo dell'azione, e la parola «scarico» bastava a farlo diventare SWITCH — un cambio di gioco
       diagonale verso un compagno largo. Ma «Scarico e RICEVI sul fondo» e' un UNO-DUE (la situation lo
       dichiara: `it:"onetwo"`), non un cambio di fronte: misurato su gi185, la palla partiva dall'eroe a
       (59,33) e finiva a (47,69) — indietro di 11 e attraverso di 36 unita' — per poi strisciare per quattro
       secondi verso il ricevente e ripartire con un altro arco. Esattamente i «giri strani».
       Le situation che DICHIARANO l'intento ora comandano loro (3 conflitti misurati: gi28 · gi180 · gi185);
       la regex sul testo resta solo dove il dato tace. */
    const _itP=sit&&sit.intent;
    pattern=(_itP==="through")?"THROUGH_BALL":(_itP==="switch")?"SWITCH":(_itP==="onetwo")?"COMBINATION"
      :/filtrante|imbucata|profond/.test(lbl)?"THROUGH_BALL":/scarico|cambia campo|allarg|ribalt|fascia/.test(lbl)?"SWITCH":"COMBINATION";
  }// 5.43.3: SWITCH = scarico/cambio gioco → palla diagonale verso un compagno sulla fascia (distinto dal passaggio verticale)
  return{type,pattern,variant};
}
// ============================================================================
// CINE-TL (4.97.0) — Motore di TIMELINE per gli highlight. FASE 1: logica + validazione.
//   Un highlight NON è un'animazione unica: è una SEQUENZA di micro-eventi calcistici
//   (chi ha la palla, chi riceve, chi corre, quali difensori intervengono, traiettoria,
//   n° reali di passaggi/tocchi). Il pallone è sempre il protagonista: catena di possesso
//   continua, niente teletrasporti, niente cambi di possesso ingiustificati.
//   Coordinate di gioco 0..100; l'eroe attacca verso x=100. side∈{-1,+1} = lato di sviluppo.
//   La FASE 2 collegherà il render-loop affinché palla/attori seguano fedelmente i beat.
//   Beat = { tag, dur(s), ball:{from,to,kind}, moves:[{who,to:[x,y],run}] }
//     from/to = id attore ('HERO','MATE1','DEF1','GK','OPP'...) oppure {pt:[x,y]}
//     kind ∈ pass|give|carry|through|cross|shot|header|loose|dribble
// ============================================================================
function buildHLTimeline(hl,o){
  o=o||{};
  const sx=clamp(o.x!=null?o.x:38,6,94), sy=clamp(o.y!=null?o.y:50,8,92);
  const side=o.side||(sy>=50?-1:1);
  const reward=o.reward||null;
  const type=hl.type, pat=hl.pattern, variant=hl.variant;
  const GX=98, GY=50;
  const A={}, beats=[];
  const set=(id,x,y)=>{A[id]=[clamp(x,2,98),clamp(y,2,98)];};
  const mv=(id,x,y,run)=>({who:id,to:[clamp(x,2,98),clamp(y,2,98)],run:!!run});
  const B=(tag,dur,ball,moves)=>beats.push({tag,dur,ball,moves:moves||[]});
  const GT=(dy)=>({pt:[GX,clamp(GY+dy,18,82)]});
  const concl=(id,kind)=>B(kind==='header'?'header':'shot',kind==='header'?0.5:0.55,{from:id,to:GT(-side*7),kind:kind||'shot'},[]);
  set('HERO',sx,sy); set('GK',GX+1,GY);
  const headerFinish=(type==='header');
  if(pat==='COMBINATION'){// DAI-E-VAI: 2 passaggi reali (passaggio + restituzione nello spazio)
    set('MATE1',sx+9,clamp(sy+side*9,6,94)); set('DEF1',sx+14,sy);
    B('pass',0.45,{from:'HERO',to:'MATE1',kind:'pass'},[mv('HERO',sx+15,sy,true),mv('DEF1',sx+12,clamp(sy+side*5,6,94))]);
    B('control',0.25,{from:'MATE1',to:'MATE1',kind:'carry'},[mv('DEF1',sx+13,clamp(sy+side*7,6,94))]);
    B('give',0.40,{from:'MATE1',to:'HERO',kind:'give'},[]);
    B('control',0.20,{from:'HERO',to:'HERO',kind:'carry'},[mv('HERO',sx+19,sy,true)]);
    concl('HERO','shot');
  } else if(pat==='THROUGH_BALL'){// FILTRANTE: scatto compagno, linea che sale, palla che attraversa, arrivo
    set('MATE1',sx+3,clamp(sy+side*6,6,94)); set('DEF1',sx+12,clamp(sy+side*3,6,94)); set('DEF2',sx+12,clamp(sy-side*3,6,94));
    B('hold',0.40,{from:'HERO',to:'HERO',kind:'carry'},[mv('MATE1',sx+10,clamp(sy+side*8,6,94),true),mv('DEF1',sx+15,clamp(sy+side*4,6,94)),mv('DEF2',sx+15,clamp(sy-side*2,6,94))]);
    B('through',0.50,{from:'HERO',to:{pt:[sx+26,clamp(sy+side*5,6,94)]},kind:'through'},[mv('MATE1',sx+26,clamp(sy+side*5,6,94),true)]);
    B('control',0.25,{from:{pt:[sx+26,clamp(sy+side*5,6,94)]},to:'MATE1',kind:'carry'},[]);
    concl('MATE1','shot');
  } else if(pat==='DRIBBLE_SHOT'){// DRIBBLING: rallentamento, finta, difensore sbilanciato, accelerazione, tiro
    set('DEF1',sx+8,sy);
    B('slow',0.35,{from:'HERO',to:'HERO',kind:'carry'},[mv('HERO',sx+5,sy,true),mv('DEF1',sx+7,sy)]);
    B('feint',0.30,{from:'HERO',to:'HERO',kind:'dribble'},[mv('HERO',sx+6,clamp(sy+side*3,6,94),true),mv('DEF1',sx+8,clamp(sy+side*5,6,94))]);
    B('burst',0.40,{from:'HERO',to:'HERO',kind:'dribble'},[mv('HERO',sx+16,clamp(sy-side*2,6,94),true),mv('DEF1',sx+7,clamp(sy+side*6,6,94))]);
    concl('HERO','shot');
  } else if(pat==='BALL_CARRY'){// CONDUZIONE PALLA AL PIEDE: l'eroe guida il pallone in avanti, cambia direzione per evitare un avversario in chiusura, poi accelera nello spazio e conclude. La palla resta sui piedi dell'eroe per tutta la conduzione (no teletrasporti).
    // 5.43.9: percorso più FLUIDO — 2 beat monotòni in avanti (x sempre crescente, accelerazione), lieve curva laterale per evitare il difensore (no zigzag) → meno "scattoso"
    set('DEF1',sx+12,clamp(sy-side*2,6,94));
    B('carry',0.46,{from:'HERO',to:'HERO',kind:'carry'},[mv('HERO',sx+8,clamp(sy+side*2,6,94),true),mv('DEF1',sx+11,clamp(sy,6,94))]);
    B('drive',0.54,{from:'HERO',to:'HERO',kind:'carry'},[mv('HERO',sx+24,clamp(sy+side*1,6,94),true),mv('DEF1',sx+13,clamp(sy+side*3,6,94))]);
    concl('HERO','shot');
  } else if(pat==='NEAR_POST_CROSS'||pat==='FAR_POST_CROSS'||pat==='CUTBACK'){// CROSS: conduzione, 1v1, cross, inserimenti, marcature, conclusione
    set('MATE1',sx+6,clamp(sy+side*4,6,94)); set('MATE2',sx+10,clamp(sy-side*8,6,94));
    set('DEF1',sx+12,clamp(sy-side*2,6,94)); set('DEF2',sx+14,clamp(sy-side*6,6,94)); set('DEF3',sx+6,clamp(sy+side*9,6,94));
    B('carry',0.40,{from:'HERO',to:'HERO',kind:'carry'},[mv('HERO',sx+10,clamp(sy+side*11,6,94),true),mv('DEF3',sx+11,clamp(sy+side*10,6,94))]);
    B('beat',0.30,{from:'HERO',to:'HERO',kind:'dribble'},[mv('HERO',sx+15,clamp(sy+side*12,6,94),true),mv('DEF3',sx+13,clamp(sy+side*9,6,94))]);
    const tgt=pat==='FAR_POST_CROSS'?[GX-9,clamp(GY-side*12,18,82)]:pat==='CUTBACK'?[GX-16,clamp(GY+side*3,18,82)]:[GX-6,clamp(GY+side*6,18,82)];
    const fin=pat==='FAR_POST_CROSS'?'MATE2':'MATE1';
    B('cross',0.55,{from:'HERO',to:{pt:tgt},kind:'cross'},[mv(fin,tgt[0],tgt[1],true),mv('DEF1',tgt[0]+1,tgt[1]+side*2),mv('DEF2',tgt[0]+1,tgt[1]-side*2)]);
    B('control',0.18,{from:{pt:tgt},to:fin,kind:'carry'},[]);
    concl(fin,headerFinish?'header':'shot');
  } else if(pat==='HEADER_ATTACK'){// COLPO DI TESTA: la palla DEVE arrivare da un cross aereo (mai già sulla testa)
    set('MATE1',sx-4,clamp(sy+side*16,6,94)); set('DEF1',sx+2,clamp(sy-side*2,6,94));
    const tgt=[clamp(sx+8,8,96),sy];
    B('run',0.40,{from:'MATE1',to:'MATE1',kind:'carry'},[mv('HERO',sx+6,sy,true),mv('DEF1',sx+5,clamp(sy-side*1,6,94))]);
    B('cross',0.55,{from:'MATE1',to:{pt:tgt},kind:'cross'},[mv('HERO',tgt[0],tgt[1],true)]);
    B('control',0.15,{from:{pt:tgt},to:'HERO',kind:'carry'},[]);
    concl('HERO','header');
  } else if(pat==='ONE_ON_ONE'){// 1v1: lancio che libera, uscita del portiere, conclusione
    set('MATE1',sx-6,clamp(sy+side*5,6,94));
    B('through',0.45,{from:'MATE1',to:{pt:[sx+8,sy]},kind:'through'},[mv('HERO',sx+8,sy,true)]);
    B('control',0.20,{from:{pt:[sx+8,sy]},to:'HERO',kind:'carry'},[mv('GK',GX-6,GY)]);
    B('carry',0.35,{from:'HERO',to:'HERO',kind:'carry'},[mv('HERO',GX-10,clamp(sy+side*2,6,94),true),mv('GK',GX-8,clamp(GY+side*1,20,80))]);
    concl('HERO','shot');
  } else if(pat==='TACKLE'){// CONTRASTO: avversario conduce, hero chiude, palla liberata, recupero
    set('OPP',sx+4,sy); set('MATE1',sx-6,clamp(sy+side*6,6,94));
    B('approach',0.35,{from:'OPP',to:'OPP',kind:'carry'},[mv('OPP',sx+1,sy,true),mv('HERO',sx+2,sy,true)]);
    B('tackle',0.30,{from:'OPP',to:{pt:[sx+1,clamp(sy+side*2,6,94)]},kind:'loose'},[]);
    B('win',0.25,{from:{pt:[sx+1,clamp(sy+side*2,6,94)]},to:'HERO',kind:'carry'},[]);
    if(reward==='goal')concl('HERO','shot'); else B('layoff',0.35,{from:'HERO',to:'MATE1',kind:'pass'},[]);
  } else if(pat==='PENALTY'||pat==='SET_PIECE'){// palla ferma battuta dall'eroe (regia dedicata, build-up minimo)
    concl('HERO','shot');
  } else if(pat==='EDGE_SHOT'){// TIRO DAL LIMITE: ricezione, tocco di preparazione, tiro (mai dal nulla)
    set('MATE1',sx-8,clamp(sy+side*6,6,94)); set('DEF1',sx+5,sy);
    B('pass',0.40,{from:'MATE1',to:'HERO',kind:'pass'},[mv('DEF1',sx+4,clamp(sy+side*2,6,94))]);
    B('control',0.30,{from:'HERO',to:'HERO',kind:'carry'},[mv('HERO',sx+3,sy,true),mv('DEF1',sx+4,sy)]);
    concl('HERO',headerFinish?'header':'shot');
  } else {// BUILDUP / fallback: scambio breve poi conclusione
    set('MATE1',sx-6,clamp(sy+side*7,6,94));
    B('pass',0.40,{from:'HERO',to:'MATE1',kind:'pass'},[mv('HERO',sx+8,sy,true)]);
    B('return',0.40,{from:'MATE1',to:'HERO',kind:'pass'},[]);
    concl('HERO',headerFinish?'header':'shot');
  }
  return{actors:A,beats,meta:{pattern:pat,type,variant}};
}
// Validatore delle INVARIANTI calcistiche (le "regole obbligatorie" come check logici).
// Ritorna un array di violazioni (vuoto = timeline coerente).
function validateHLTimeline(tl,hl){
  const v=[]; if(!tl||!tl.beats||!tl.beats.length){v.push('timeline vuota');return v;}
  const pos={}; Object.keys(tl.actors||{}).forEach(k=>pos[k]=tl.actors[k].slice());
  const team=(id)=>(id==='OPP'||id==='GK')?'away':'home';
  const resolve=(ref)=>ref&&ref.pt?ref.pt.slice():(pos[ref]?pos[ref].slice():null);
  let ballAt=null,passes=0,lastCrossIdx=-99;
  tl.beats.forEach((b,i)=>{
    const from=resolve(b.ball.from);
    (b.moves||[]).forEach(m=>{pos[m.who]=m.to.slice();});
    const to=resolve(b.ball.to);
    if(!from)v.push(`beat${i}(${b.tag}): ball.from non risolvibile`);
    if(!to)v.push(`beat${i}(${b.tag}): ball.to non risolvibile`);
    if(ballAt&&from&&Math.hypot(from[0]-ballAt[0],from[1]-ballAt[1])>3.5)v.push(`beat${i}(${b.tag}): TELETRASPORTO palla`);
    if(i>0){
      const fromId=typeof b.ball.from==='string'?b.ball.from:null;
      const prevToId=typeof tl.beats[i-1].ball.to==='string'?tl.beats[i-1].ball.to:null;
      if(fromId&&prevToId&&team(fromId)!==team(prevToId)&&b.tag!=='tackle'&&b.ball.kind!=='loose')
        v.push(`beat${i}(${b.tag}): cambio di possesso ingiustificato (${prevToId}→${fromId})`);
    }
    if(['pass','give','through','cross'].includes(b.ball.kind))passes++;
    if(b.ball.kind==='cross')lastCrossIdx=i;
    if(b.ball.kind==='header'&&!(lastCrossIdx>=0&&lastCrossIdx<i))v.push(`beat${i}: COLPO DI TESTA senza cross/aereo precedente`);
    ballAt=to;
  });
  const need={COMBINATION:2,THROUGH_BALL:1,NEAR_POST_CROSS:1,FAR_POST_CROSS:1,CUTBACK:1,HEADER_ATTACK:1};
  const req=need[hl&&hl.pattern]; if(req&&passes<req)v.push(`pattern ${hl.pattern}: ${passes} passaggi < ${req} richiesti`);
  return v;
}
// Risolve la timeline in posizioni concrete per beat (coord di gioco 0..100) — consumato dall'executor render-loop.
function resolveTimeline(tl){
  const pos={}; Object.keys(tl.actors||{}).forEach(k=>pos[k]=tl.actors[k].slice());
  const res=(ref)=>ref&&ref.pt?ref.pt.slice():(pos[ref]?pos[ref].slice():null);
  const out=[];
  (tl.beats||[]).forEach(b=>{
    const from=res(b.ball.from);
    const before={}; Object.keys(pos).forEach(k=>before[k]=pos[k].slice());
    (b.moves||[]).forEach(m=>{pos[m.who]=m.to.slice();});
    const after={}; Object.keys(pos).forEach(k=>after[k]=pos[k].slice());
    const to=res(b.ball.to);
    out.push({tag:b.tag,dur:b.dur,kind:b.ball.kind,from,to,before,after,fromId:(typeof b.ball.from==='string')?b.ball.from:null,toId:(typeof b.ball.to==='string')?b.ball.to:null});/* [7.227.0 #45] l'ID del portatore sopravvive alla risoluzione: l'executor deve incollare la palla ai piedi di CHI la porta, non dell'eroe per definizione */
  });
  return out;
}
// ============================================================================
// DECISION ENGINE (5.00.0) — keystone dell'architettura "Intent → Decision → Simulation → Animation".
//   Data una INTENZIONE (es. 'cross') e il CONTESTO (attributi, ruolo, piede, posizione, pressione,
//   compagni, modulo, tattica, stanchezza, morale, meteo, contesto partita) + casualità CONTROLLATA
//   (seed), decide COME l'azione viene realmente eseguita (esecuzione) e con quale ESITO.
//   Sostituisce la selezione della variante guidata dalle LABEL delle situation (l'accoppiamento
//   Situation→animazione). Puro e deterministico (seed) → la stessa intent in contesti diversi
//   produce esiti VARI, coerenti e realistici (validato su decine di contesti).
// ============================================================================
function decideExecution(intent, ctx){
  ctx=ctx||{}; const a=ctx.attrs||{};
  const sk=(k,d)=>clamp(a[k]!=null?a[k]:(d==null?60:d),1,99);
  const pressure=clamp(ctx.pressure!=null?ctx.pressure:1,0,5);
  const fatigue=clamp(ctx.fatigue||0,0,100), morale=clamp(ctx.morale||60,0,100);
  const weather=ctx.weather||'clear', x=clamp(ctx.x!=null?ctx.x:50,0,100);
  let s=(Math.abs(ctx.seed!=null?ctx.seed:123456789)>>>0)||1;
  const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const wpick=(opts)=>{const f=opts.filter(o=>o.w>0);const tot=f.reduce((y,o)=>y+o.w,0)||1;let r=rnd()*tot;for(const o of f){r-=o.w;if(r<=0)return o.k;}return f.length?f[f.length-1].k:null;};
  const qOf=(skillVal)=>clamp((skillVal-pressure*9-fatigue*0.16+(morale-60)*0.12)/100+(rnd()-0.5)*0.28,0.02,0.99);
  const wet=weather==='rain'||weather==='snow'||weather==='drizzle'||weather==='hail', windy=weather==='wind'||weather==='storm'||weather==='hail';/* [7.120.0 audit] includi drizzle/hail (pitchFx rain/snow) e hail nel vento — prima metà dei meteo bagnati/ventosi era ignorata */
  let exec,outcome,q;
  // F8: piede preferito — sulla fascia OPPOSTA al piede forte il cross/tiro è "di piede debole" (qualità ridotta, bias al taglio interno)
  const weakFlank=!!(ctx.side&&ctx.foot&&ctx.side!==ctx.foot);
  if(intent==='cross'){
    const cr=sk('passaggio')*0.55+sk('tecnica')*0.45; q=qOf(cr-(weakFlank?8:0));
    exec=wpick([{k:'cross_far_post',w:(3+cr*0.03)*(weakFlank?0.5:1)},{k:'cross_near_post',w:3+cr*0.025},{k:'cross_low_driven',w:2+sk('tecnica')*0.03+(wet?-0.6:0)},{k:'cross_cutback',w:1+(x>78?2.5:0)+(weakFlank?1.5:0)},{k:'cross_deep',w:1.5*(weakFlank?0.6:1)}]);
    outcome=wpick([{k:'assist',w:q*4.2},{k:'goal',w:q*1.1},{k:'corner',w:1+pressure*0.6},{k:'blocked',w:pressure*1.5},{k:'intercepted',w:pressure*1.1+(1-q)*1.6},{k:'out',w:(1-q)*2+(windy?1.2:0)+fatigue*0.012}]);
  } else if(intent==='shot'){
    const sh=sk('tiro')*0.7+sk('tecnica')*0.3; q=qOf(sh+(weakFlank?2:0)+clamp((x-78)*0.45,-14,7));/* [7.115.0 audit · fix B3] sulla fascia OPPOSTA al piede forte il TIRO è un taglio-interno sul piede FORTE (inverted winger) → leggero BONUS, non più il malus −5 «di piede debole» (che valeva per il cross ma era invertito sul tiro) · [7.58.0 PHASE 3] FATTORE DISTANZA (xG): un tiro dal limite converte meno di uno in area */
    exec=wpick([{k:'shot_power',w:2.5+sk('tiro')*0.03},{k:'shot_curled',w:1.5+sk('tecnica')*0.035},{k:'shot_first_time',w:1.5+(pressure>=2?1.2:0)},{k:'shot_chip',w:0.6+(ctx.gkOut?2:0)},{k:'shot_placed',w:1.5+sk('mentalità')*0.02}]);
    outcome=wpick([{k:'goal',w:q*3.4},{k:'saved',w:1.4+(1-q)*1.6},{k:'blocked',w:pressure*1.3},{k:'post',w:0.5+(q>0.6?0.4:0)},{k:'wide',w:(1-q)*2.2+(windy?0.8:0)}]);
  } else if(intent==='dribble'){
    const dr=sk('dribbling')*0.6+sk('velocità')*0.25+sk('tecnica')*0.15; q=qOf(dr);
    exec=wpick([{k:'dribble_feint',w:2+sk('dribbling')*0.03},{k:'dribble_inside',w:1.5+sk('tecnica')*0.03},{k:'dribble_outside',w:1.5+sk('velocità')*0.03},{k:'dribble_knock',w:1+sk('velocità')*0.04}]);
    outcome=wpick([{k:'beat_man',w:q*3.6},{k:'fouled',w:pressure*1.1+0.5},{k:'dispossessed',w:pressure*1.4+(1-q)*1.8},{k:'shielded_out',w:0.6+(1-q)}]);
  } else if(intent==='through'||intent==='onetwo'){
    const ps=sk('passaggio')*0.7+sk('mentalità')*0.3; q=qOf(ps);
    exec=intent==='onetwo'?wpick([{k:'give_and_go',w:3},{k:'wall_pass',w:2}]):wpick([{k:'through_split',w:2+sk('passaggio')*0.03},{k:'through_lofted',w:1.5},{k:'through_disguised',w:1+sk('tecnica')*0.03}]);
    outcome=wpick([{k:'assist',w:q*3.4},{k:'chance',w:q*2.2},{k:'intercepted',w:pressure*1.4+(1-q)*1.8},{k:'offside',w:0.8+(intent==='through'?0.8:0)},{k:'overhit',w:(1-q)*1.6}]);
  } else if(intent==='progression'||intent==='run'){
    const pr=sk('velocità')*0.5+sk('fisico')*0.25+sk('dribbling')*0.25; q=qOf(pr);
    exec=wpick([{k:'carry_drive',w:2+sk('velocità')*0.03},{k:'burst',w:1.5+sk('fisico')*0.03},{k:'cut_inside',w:1.5+sk('tecnica')*0.03}]);
    outcome=wpick([{k:'advance',w:q*3.4},{k:'win_freekick',w:pressure*0.9},{k:'stopped',w:pressure*1.3+(1-q)*1.6},{k:'lost',w:(1-q)*1.4}]);
  } else if(intent==='intercept'||intent==='recover'||intent==='anticipate'){
    const df=sk('posizionamento')*0.55+sk('mentalità')*0.25+sk('velocità')*0.2; q=qOf(df);
    exec=wpick([{k:'step_in',w:2+sk('posizionamento')*0.03},{k:'slide',w:1.2+sk('fisico')*0.03},{k:'shield_recover',w:1.2}]);
    outcome=wpick([{k:'ball_won',w:q*3.6},{k:'foul',w:(1-q)*1.4+0.4},{k:'missed',w:(1-q)*1.8},{k:'deflected_out',w:0.8}]);
  } else if(intent==='header'){
    const hd=sk('fisico')*0.4+sk('posizionamento')*0.35+sk('tiro')*0.25; q=qOf(hd+clamp((x-82)*0.45,-13,5));/* [7.58.0 PHASE 3] FATTORE DISTANZA: incornare da fuori area rende molto meno di uno stacco sottoporta */
    exec=wpick([{k:'header_near_post',w:2.5+sk('posizionamento')*0.03},{k:'header_far_post',w:2+sk('fisico')*0.03},{k:'header_diving',w:1.2+sk('mentalità')*0.02}]);
    outcome=wpick([{k:'goal',w:q*3.0},{k:'saved',w:1.4+(1-q)*1.6},{k:'blocked',w:pressure*1.2},{k:'wide',w:(1-q)*2.4}]);
  } else if(intent==='penalty'){
    const pk=sk('tiro')*0.5+sk('mentalità')*0.5; q=qOf(pk);
    exec=wpick([{k:'pen_side',w:3+sk('tiro')*0.02},{k:'pen_power',w:2.5+sk('tiro')*0.03},{k:'pen_panenka',w:0.5+sk('tecnica')*0.02+(pressure<=1?0.6:0)}]);
    outcome=wpick([{k:'goal',w:q*4.2},{k:'saved',w:1.0+(1-q)*1.8},{k:'post',w:0.4+(q>0.6?0.3:0)},{k:'wide',w:(1-q)*1.6}]);
  } else if(intent==='freekick'){
    const fk=sk('tiro')*0.5+sk('tecnica')*0.5; q=qOf(fk);
    exec=wpick([{k:'fk_curled',w:2.5+sk('tecnica')*0.035},{k:'fk_power',w:2+sk('tiro')*0.03},{k:'fk_placed',w:1.5+sk('mentalità')*0.02}]);
    outcome=wpick([{k:'goal',w:q*3.0},{k:'saved',w:1.4+(1-q)*1.6},{k:'wall_blocked',w:1.2+pressure*0.6},{k:'wide',w:(1-q)*2.2+(windy?0.8:0)}]);
  } else {
    const g=sk('tecnica')*0.5+sk('mentalità')*0.5; q=qOf(g);
    exec=wpick([{k:'simple',w:3},{k:'safe',w:2}]);
    outcome=wpick([{k:'retain',w:q*3},{k:'lost',w:(1-q)*2},{k:'progress',w:q*1.5}]);
  }
  return {intent,execution:exec,outcome,quality:+q.toFixed(2)};
}
// ============================================================================
// DEFENSIVE OUTCOME ENGINE (5.65.0) — un intervento difensivo NON deve più avere come esito di DEFAULT
//   il rinvio lungo di 70-80m verso la porta avversaria (effetto "ping-pong"). Data la situazione
//   (successo, posizione sul campo, pressione avversaria, attributi tecnici, piede), sceglie in modo
//   DETERMINISTICO (seed) e PESATO uno tra molti esiti realistici, ognuno con un DESCRITTORE di
//   traiettoria in coordinate di gioco (0..100) che il render-loop mappa su posizioni reali/vive.
//   I rinvii lunghi ('safe_clear') restano possibili ma diventano ECCEZIONALI: peso basso, salgono
//   solo sotto forte pressione o con scarsa compostezza, vanno LARGHI sulla fascia (mai verso la porta
//   avversaria) e sono capati ben prima dell'area offensiva. Puro/node-testabile → gate-safe.
//   ctx: {success, x, y, pressure, attrs, foot, seed}. Ritorna {kind, poss, dx, wide, side,
//   seekMate, toTouch, toGoalLine, arcH, arcDur}.
// ============================================================================
function resolveDefensiveOutcome(ctx){
  ctx=ctx||{}; const a=ctx.attrs||{};
  const sk=(k,d)=>clamp(a[k]!=null?a[k]:(d==null?60:d),1,99);
  const x=clamp(ctx.x!=null?ctx.x:35,0,100), y=clamp(ctx.y!=null?ctx.y:50,0,100);
  const pressure=clamp(ctx.pressure!=null?ctx.pressure:1,0,5);
  const success=ctx.success!==false; // default: intervento riuscito
  let s=(Math.abs(ctx.seed!=null?ctx.seed:987654321)>>>0)||1;
  const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const wpick=(opts)=>{const f=opts.filter(o=>o.w>0);const tot=f.reduce((y,o)=>y+o.w,0)||1;let r=rnd()*tot;for(const o of f){r-=o.w;if(r<=0)return o.k;}return f.length?f[f.length-1].k:'contest_nearby';};
  // compostezza/lucidità nel gestire la palla sotto pressione → più alta = tiene/passa; più bassa = spazza
  const comp=sk('mentalità')*0.45+sk('tecnica')*0.3+sk('passaggio')*0.25;
  const posn=sk('posizionamento'), pas=sk('passaggio'), pace=sk('velocità'), phys=sk('fisico');
  const deep=x<26, mid=x>=26&&x<54, high=x>=54;
  const nearTouch=(y<18||y>82);
  const toward=(y<=50)?-1:1; // fascia più vicina (segno in coord di gioco: <=50 verso 0, altrimenti verso 100)
  const pressHi=pressure>=3, pressMed=pressure===2, pressLo=pressure<=1;
  let kind;
  if(success){
    kind=wpick([
      // possesso mantenuto — favoriti da compostezza/tecnica, bassa pressione, posizione avanzata
      {k:'intercept_keep', w: 2.2 + sk('tecnica')*0.03 + (pressLo?2.2:0) + (high?1.6:(pressMed?0.4:0))},
      {k:'tackle_win',     w: 1.8 + phys*0.025 + posn*0.02 + (pressMed?1.0:0)},
      {k:'pass_start',     w: 1.4 + pas*0.045 + (pressLo?1.4:(pressMed?0.7:0)) + (mid?1.0:0)},
      {k:'counter',        w: 0.8 + pace*0.03 + (pressMed?1.0:0) + ((mid||high)?0.8:0) - (deep&&pressHi?1.5:0)},
      // respinte — corta è la norma; la spazzata lunga è ECCEZIONALE (peso basso, sale solo sotto pressione/scarsa compostezza)
      {k:'short_clear',    w: 1.2 + (pressMed?1.4:0) + (deep?1.2:0) + Math.max(0,60-comp)*0.02},
      {k:'safe_clear',     w: 0.3 + (pressHi?3.2:0) + (deep&&pressHi?1.8:0) + Math.max(0,52-comp)*0.05},
      // palla che esce — rimessa (solo vicino alla linea laterale) / angolo concesso (solo in area, sotto pressione)
      {k:'throw_in',       w: nearTouch?(1.4+(pressMed?0.8:0)+(pressHi?1.4:0)):0},
      {k:'corner_conceded',w: deep?(pressHi?1.4:0.3):0},
    ]);
  } else {
    kind=wpick([
      {k:'beaten',         w: 2.0 + pressure*0.5},        // saltato/superato: l'avversario tiene palla lì vicino
      {k:'loose_second',   w: 1.6 + (pressMed?0.6:0)},    // seconda palla contendibile
      {k:'short_clear',    w: 1.0 + Math.max(0,55-comp)*0.02}, // respinta affrettata ma corta
      {k:'safe_clear',     w: 0.4 + (pressHi?2.0:0)},     // spazzata disperata (eccezionale)
      {k:'throw_in',       w: nearTouch?1.2:0},
      {k:'corner_conceded',w: deep?(pressHi?1.2:0.3):0},
    ]);
  }
  // DESCRITTORE di traiettoria (hint in spazio di gioco; il render-loop risolve le coord VIVE):
  //   dx = avanzamento in game-x (segnato); wide = frazione di spinta verso la fascia più vicina (0..1);
  //   seekMate = 'short'|'forward'|null (aggancia un compagno libero reale); arcH in unità mondo, arcDur in s.
  const D={
    intercept_keep:  {poss:'keep',    dx:+3,  wide:0.12, seekMate:null,      arcH:0.5, arcDur:0.34},
    tackle_win:      {poss:'keep',    dx:+2,  wide:0.10, seekMate:null,      arcH:0.45,arcDur:0.32},
    pass_start:      {poss:'keep',    dx:+8,  wide:0.20, seekMate:'short',   arcH:1.1, arcDur:0.50},
    counter:         {poss:'keep',    dx:+20, wide:0.18, seekMate:'forward', arcH:1.4, arcDur:0.60},
    short_clear:     {poss:'contest', dx:+11, wide:0.32, seekMate:null,      arcH:1.6, arcDur:0.50},
    safe_clear:      {poss:'contest', dx:+22, wide:0.62, seekMate:null,      arcH:2.6+Math.min(pressure,3)*0.4, arcDur:0.60},
    throw_in:        {poss:'lose',    dx:+2,  wide:1.0,  seekMate:null, toTouch:true,    arcH:0.9, arcDur:0.45},
    corner_conceded: {poss:'lose',    dx:-2,  wide:0.70, seekMate:null, toGoalLine:true, arcH:1.4, arcDur:0.50},
    beaten:          {poss:'lose',    dx:-5,  wide:0.15, seekMate:null,      arcH:0.5, arcDur:0.34},
    loose_second:    {poss:'contest', dx:+2,  wide:0.25, seekMate:null,      arcH:0.9, arcDur:0.40},
    contest_nearby:  {poss:'contest', dx:+1,  wide:0.20, seekMate:null,      arcH:0.7, arcDur:0.36},
  };
  return Object.assign({kind,side:toward}, D[kind]||D.contest_nearby);
}
// ENGINE Fase 3 (Intent display): le conclusioni non devono più far SCEGLIERE l'esecuzione (testa/piede/
//   tecnica) — quella la decide il motore (decideExecution) in base alla palla e al contesto. Questo
//   transformer riscrive SOLO l'etichetta mostrata (display), lasciando intatta act.label reale usata da
//   deriveHL e dal gate. Risultato: il giocatore sceglie un INTENTO/stile di rischio, non un'animazione.
function intentLabel(lbl){
  if(!lbl)return lbl; const l=lbl.toLowerCase();
  if(/colpo di testa|stacco di testa|\bdi testa\b|incornata|\bstacco\b|spizzata/.test(l))return "✈️ Attacca il pallone";/* [7.404.0 collaudo PO gi115 «Attacca il pallone non e' una giocata aerea!»] la parola nuda `tacco` — messa per coprire «stacco», che pero' e' gia' coperto da \bstacco\b — catturava anche il TACCO (colpo di classe rasoterra): «Tacco in porta» diventava un'incornata. Il tacco tiene la sua etichetta, che dice gia' tutto. */
  if(/rovesciata|sforbiciata/.test(l))return "🤸 Giocata acrobatica";
  if(/pallonett|cucchiaio|scavetto|scavin|panenka/.test(l))return "🪄 Scavetto sul portiere";
  if(/potenza|potente|botta|collo pieno|bomba|stoccat/.test(l))return "💥 Conclusione potente";
  if(/a giro|a rientrare|curv|incrociat/.test(l)&&/tiro|destro|sinistro|conclus|punizione|piazzat/.test(l))return "🎯 Cerca l'angolo";
  if(/rasoterra|piazzat|angolat|preciso|basso/.test(l)&&/tiro|destro|sinistro|deviaz|conclus|piazzat|angolat/.test(l))return "🎯 Conclusione precisa";
  if((/di prima|prima intenzione|al volo|vol[eé]e|deviazione|istintiv/.test(l))&&!/lanci|rilanci|cambio|scarico|scarica|passaggi|filtrant|imbucat|assist|sponda|servizio|verticale|cross|traversone|possesso|triangol|controlla|conserva|smist/.test(l))return "⚡ Conclusione di prima";// 5.43.17: "di prima" diventa CONCLUSIONE solo per i TIRI — un "Lancio/Cambio/Scarico ... di prima" è un PASSAGGIO, non un tiro. 6.50.0: verbi lancia/rilancia/scarica + controlla/conserva/smista (un "Controlla al volo e lancia" in propria metà NON è un tiro → posizione/azione coerenti)
  return lbl; // passaggi/dribbling/sponde/cross/difensivo restano invariati
}
// ENGINE Fase 3 (Intent nel titolo): l'intro dell'highlight deve dire l'INTENZIONE ("Tentativo di tiro"),
//   non l'esecuzione ("Stop e tiro", "Girata e tiro"). Riscrive SOLO il titolo mostrato quando descrive
//   un'esecuzione; i titoli di scena ("Solo davanti al portiere", "Contropiede") restano. sit.text intatto.
const INTENT_TITLE={penalty:"🎯 Tentativo dal dischetto",freekick:"🎯 Tentativo su punizione",recover:"🛡️ Tentativo di recupero palla",anticipate:"🛡️ Tentativo di anticipo",intercept:"🛡️ Tentativo di intercetto",cross:"↗️ Tentativo di cross",through:"🎯 Tentativo di filtrante",dribble:"🌀 Tentativo di dribbling",onetwo:"🤝 Tentativo di uno-due",insertion:"✈️ Tentativo di inserimento in area",shot:"⚡ Tentativo di tiro",progression:"🏃 Tentativo di progressione",switch:"🔀 Tentativo di cambio gioco"};
// scoreDiff = gol squadra dell'eroe − gol avversari (>0 in vantaggio, <0 sotto). Se assente, niente check stato.
function intentTitle(text,intent,scoreDiff){
  const t=(text||"").toLowerCase();
  const intentT=(intent&&INTENT_TITLE[intent])||"⚡ Tentativo di conclusione";
  // 1) titoli con parole d'ESECUZIONE → intento
  const execy=/tiro|girata|giraton|stop e|colpo di testa|rovesciat|sforbiciat|incornata|\bcross\b|corner|\bteso\b|pallonett|cucchiaio|vol[eé]e|stacco|conclusione|\bdestro\b|\bsinistro\b|esterno|piazzat|rasoterra|a giro|bomba|stoccat|deviazion|\btacco\b|lancio|millimetr|hocus|\bchip\b|filtrante|di prima/.test(t);
  if(execy)return intentT;
  // 2) titoli che ASSUMONO uno STATO PARTITA incoerente col punteggio reale → intento (niente bugie sul risultato)
  if(scoreDiff!=null&&stateIncoherent(t,scoreDiff))return intentT;
  return text; // titoli di scena coerenti restano
}
// true se il testo assume uno stato (sotto/rimonta o in vantaggio) che CONTRADDICE il punteggio reale
function stateIncoherent(t,scoreDiff){
  const losing=/sotto|rimonta|speranza|ci crediamo|svantaggio|riaprire|accorci|disperazione|\b0 ?- ?[1-9]\b/.test(t);
  const winning=/in vantaggio|gestisci|amministra|chiude la partita|raddoppia il vantaggio/.test(t);
  return (losing&&scoreDiff>=0)||(winning&&scoreDiff<=0);
}
// intro: vuota se assume uno stato incoerente (così non mostra una narrazione falsa)
function intentIntro(intro,scoreDiff){
  if(!intro)return intro;
  if(scoreDiff!=null&&stateIncoherent((intro||"").toLowerCase(),scoreDiff))return "";
  return intro;
}
// FIX azioni duplicate: se il transform produce un'etichetta già usata da un'azione PRECEDENTE della stessa
//   lista, mantieni l'etichetta ORIGINALE (distinta) — niente più due "Conclusione di prima" identiche.
function intentLabelDedup(lbl,idx,arr){
  const l=intentLabel(lbl);
  if(arr)for(let j=0;j<idx;j++){if(arr[j]&&intentLabel(arr[j].label)===l)return lbl;}
  return l;
}
// ── [5.77.0 MOT-1] MICRO-SIMULATORE DI SFONDO ────────────────────────────────────
//   La partita ATTORNO all'eroe è simulata, non un roll fisso: per ogni minuto di clock ogni squadra ha
//   una probabilità di GOL derivata da prestigio, OVR dell'eroe, momentum e possesso (finalmente ATTUATORI
//   del gioco, non widget — MOT-2). PURO e SEEDATO per (partita, minuto): stessa partita → stessi eventi.
//   Sostituisce le due voci-gol a peso fisso della cronaca (~0,02 gol/partita: 1 gol BG ogni ~20 match)
//   e il dead-code oppGoalProb. Tarature: ~0,85 gol compagni + ~0,95 gol avversari a prestigio pari su 90'
//   (il resto lo fa l'eroe negli highlight); forte scala col divario di prestigio (±55%) e col momentum (±35%).
function bgMicroTick(ctx){
  const r=seededRng((((ctx.seed>>>0)||1)+ctx.min*2654435761)>>>0);
  const diff=clamp(((ctx.homePrestige||65)-(ctx.oppPrestige||65))/30,-1,1);
  const momF=((ctx.momentum||50)-50)/50, posF=((ctx.possession||50)-50)/50;
  const ovrF=clamp(((ctx.heroOvr||65)-65)/120,-0.15,0.30);
  // [5.93.0 FIX PO «dominanza assoluta»] l'OVR dell'eroe non domina più ENTRAMBE le λ: un bomber
  //   alza i gol dei compagni (0.5→0.35, segna già lui) e soprattutto NON svuota la difesa avversaria
  //   (0.3→0.10); momentum sul lato difensivo 0.35→0.25 e floor gA 0.002→0.0045 (≥~0.4 gol subiti/match
  //   anche nel dominio totale) → niente più stagioni 61-11 con +26 sulla seconda.
  let gH=clamp(0.0082*(1+diff*0.55+momF*0.35+posF*0.20+ovrF*0.35),0.002,0.030);/* [6.83.0] 0.0095→0.0088 · [6.87.0 collaudo PO «ancora di più»] →0.0082: meno gol ambientali, dentro la baseline bg-microsim (0.5–1.3) */
  let gA=clamp(0.0130*(1-diff*0.55-momF*0.25-posF*0.20-ovrF*0.10),0.0045,0.030);/* [6.78.0] 0.0105→0.0112 · [6.83.0] →0.0122 · [6.87.0] →0.0130: gli avversari pungono, dentro la baseline bg-microsim (0.6–1.4) */
  // [6.54.0 collaudo PO «5 a 0 alla Francia, un po' squilibrato»] GESTIONE DEL VANTAGGIO: con un margine ampio
  //   la squadra in netto vantaggio segna MENO (turnover, cali d'intensità, amministrazione) → meno blowout
  //   5-0/6-0. Simmetrico: vale per il lato che è avanti. Retro-compatibile (lead assente ⇒ nessun effetto,
  //   baseline bg-microsim invariata). Damper per il SOLO leader (nessun gonfiaggio artificiale delle rimonte).
  const _lead=ctx.lead||0,_aLead=Math.abs(_lead);
  const _leadDamp=_aLead>=4?0.18:_aLead>=3?0.32:_aLead>=2?0.55:1;/* [6.80.0] · [6.83.0] · [6.87.0 collaudo PO «ancora di più»] →0.55/0.32/0.18: chi è avanti amministra davvero */
  if(_lead>0)gH*=_leadDamp; else if(_lead<0)gA*=_leadDamp;
  const _gHe=ctx.oppRed?gH*1.10:gH,_gAe=ctx.oppRed?gA*0.72:gA;/* [6.0.0 MP-5] l'uomo in meno pesa davvero */
  const roll=r();
  if(roll<_gHe)return{side:"home"};
  if(roll<_gHe+_gAe)return{side:"away"};
  return null;
}
if(typeof window!=='undefined'){try{window.__CPM_PARATA_C=ParataBus3D;}catch(_e469){}window.__CPM_DRAFTNOTE=draftBugNote;/* [7.462.0] il taccuino automatico e' una funzione PURA di uno snapshot: esposta per poterlo far girare da una sonda sulle scene VERE e misurare quanto spesso le sue righe scattano su gioco sano — una soglia si giudica sulla distribuzione, non a naso (il 7.408 l'aveva abbassata a 1,2u su un'ipotesi, e da allora ogni nota del PO nasce con una riga-camera attaccata). */window.buildHLTimeline=buildHLTimeline;window.validateHLTimeline=validateHLTimeline;window.resolveTimeline=resolveTimeline;window.decideExecution=decideExecution;window.resolveDefensiveOutcome=resolveDefensiveOutcome;window.bgMicroTick=bgMicroTick;window.intentLabel=intentLabel;window.deriveIntent=deriveIntent;window.deriveHL=deriveHL;/* [7.1.2] esposto per l'audit massivo situations↔3D */window.__CPM_SITS=SITUATIONS;window.hlBallState=hlBallState;window.filterSitActions=filterSitActions;window.hlOverlay=hlOverlay;/* [7.217.0] esposto per la probe di coerenza legno colpito ⟺ legno detto */window.__CPM_MISS_TX=_MISS_TX;window.__CPM_BAR_TX=_BAR_TX;window.__CPM_BG=BG_MATCH;/* B: cronaca BG per il check bg-coherence del gate */window.generateLocalPressAnalysis=generateLocalPressAnalysis;/* [7.277.0] esposta per la probe di stabilita' della rassegna stampa */window.buildSeasonCarry=buildSeasonCarry;window.leagueGoalsOf=leagueGoalsOf;window.euroSeasonGoalsOf=euroSeasonGoalsOf;window.euroSeasonAssistsOf=euroSeasonAssistsOf;/* [7.538.0] esposti per il guardiano della classifica europea */window.generateSeasonAwards=generateSeasonAwards;/* [7.336.0] esposti per il guardiano primavera-awards-test (travaso per lega + premi europei top-flight) */window.ritiroPlan=ritiroPlan;window.ritiroHierarchyVerdict=ritiroHierarchyVerdict;window.ritiroFriendlies=ritiroFriendlies;/* [7.337.0] esposti per il guardiano ritiro2-test */window.refuseEcho=refuseEcho;/* [7.338.0] esposto per il guardiano refuse-echo-test */window.draftBugNote=draftBugNote;/* [7.339.0] esposto per il guardiano della bozza automatica */window.VITA_EVENTS=VITA_EVENTS;window.pickVitaEvent=pickVitaEvent;window.markVitaEvent=markVitaEvent;/* [7.412.0] esposti per il guardiano della varieta' vita-variety-test */}
// ── LMQP-1 (Phase 2 / M2 — EVENT + TIMELINE LAYER) ──────────────────────────────
//   Bus eventi OSSERVABILE del Live Match: registra la SEQUENZA reale dei beat di un highlight
//   (HighlightForced · ActionResolved · HighlightAdvance · MatchStart …) in un ring buffer leggibile
//   via probe window.__CPM_TIMELINE. È la sorgente di verità per i futuri validator Semantic/Narrative
//   e per il Replay Engine (LIVE_MATCH_QA_SPEC cap. 3.4/3.5). Principio LMQP "Observable System".
//   SICURO/opt-in: solo push su array + try/catch, nessuna mutazione di stato React né del render-loop
//   → impatto ZERO su golden/determinism (gate-safe). Bounded (ring) → nessun leak di memoria.
const MATCH_TL=[]; const MATCH_TL_MAX=500;
function cpmEmit(type,payload){try{const e={t:+performance.now().toFixed(1),type:type};if(payload)for(const k in payload)e[k]=payload[k];MATCH_TL.push(e);if(MATCH_TL.length>MATCH_TL_MAX)MATCH_TL.shift();try{AudioMgr.event(e);}catch(_a){}/* [7.62.0 AUDIO] fan-out non invasivo: ogni evento narrativo (ActionResolved/CoherenceCheck/HighlightForced/GalaCue…) al dispatcher audio (no-op sotto test) */}catch(_e){}}
function cpmTimelineReset(){try{MATCH_TL.length=0;}catch(_e){}}
if(typeof window!=='undefined'){window.__CPM_TIMELINE=function(){try{return MATCH_TL.slice();}catch(_e){return[];}};window.__CPM_TIMELINE_RESET=cpmTimelineReset;}
/* [7.496.0 F1b MATCH EXPERIENCE — IL REGISTRO DEGLI EVENTI, INERTE PER SCELTA]
   L'audit ha misurato che la partita non ha un modello di eventi: ha QUATTRO generatori che raccontano la
   stessa partita senza consultarsi — il roll dei gol (`bgMicroTick`, che restituisce solo {side}), la
   tabella della cronaca (188 righe, di cui 56 portano le STATISTICHE dentro il testo e 188 dichiarano
   dove va il pallone), la griglia oraria degli highlight, e la tabella delle SITUATIONS. E quattro
   rappresentazioni parallele di «cosa e' successo»: `MATCH_TL` (osservatore per i test), `matchEvents`
   (lista del tabellino), il feed della cronaca, `mStats`.
   Questo registro NON e' ancora la sorgente di verita': e' un LIBRO MASTRO che sta accanto e prende nota,
   perche' prima di invertire il verso (F3) serve sapere DI QUANTO le quattro versioni divergono oggi. Un
   rimedio senza il numero di partenza non si puo' ri-misurare.
   Inerte per costruzione: nessuno lo legge dentro il gioco, solo push in un anello dentro try/catch —
   stessa forma di `cpmEmit`, quindi gate-safe (nessun effetto su stato, render, firma golden).
   PROVA DEL ROSSO: `__CPM_NOEV` spegne la registrazione → il guardiano deve diventare CIECO, che e' il
   modo in cui una sonda di misura dimostra di leggere davvero cio' che dice di leggere. */
const MATCH_EV=[]; const MATCH_EV_MAX=400;
function cpmEv(type,payload){if(typeof window!=='undefined'&&window.__CPM_NOEV)return;try{const e={ev:type,ts:Date.now()};/* [7.717 strumentazione] il TIMESTAMP su ogni voce del registro: il banco dell'accordo copione<->ombra allineava per minuto (5-8 righe confrontabili a partita) — per timestamp il campione decuplica */if(payload)for(const k in payload)e[k]=payload[k];MATCH_EV.push(e);if(MATCH_EV.length>MATCH_EV_MAX)MATCH_EV.shift();}catch(_e){}}
function cpmEvReset(){try{MATCH_EV.length=0;}catch(_e){}}
if(typeof window!=='undefined'){window.__CPM_EV=function(){try{return MATCH_EV.slice();}catch(_e){return[];}};window.__CPM_EV_RESET=cpmEvReset;}
/* [7.471.0 codice 007] TIMBRO CONDIVISO DELLO STACCO NERO. `setCutFx` e' uno stato di LiveMatch e il
   renderer non lo vede; ma per sapere se un teletrasporto di camera e' MASCHERATO bisogna sapere se un
   nero e' vivo in questo istante. Un solo numero condiviso, scritto dall'effetto che gia' segue `cutFx`
   e letto dal render-loop: nessun prop nuovo su un componente che ne ha gia' quaranta. */
const _CUT471={at:-1e9,dur:0};
if(typeof window!=='undefined'){window.__CPM_CUTLIVE=function(){try{return (performance.now()-_CUT471.at)<Math.max(300,_CUT471.dur||0);}catch(_e){return false;}};}/* [7.504.0] test-only: «c'e' un nero vivo?» — lo stesso criterio con cui il render-loop decide se uno snap e' mascherato (7.471). Serve ai check che misurano salti di camera: un salto DENTRO lo stacco e' regia TV voluta, non un difetto */
