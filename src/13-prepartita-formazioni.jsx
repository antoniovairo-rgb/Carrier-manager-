/* ========================================================================
 * KORWARD ELITE — frammento n° 13  (dei 20, numerati da 00 a 19)
 * src/13-prepartita-formazioni.jsx
 *
 * PRE-PARTITA · D-PAD · SCOUT · STAMPA · FORMAZIONI · MAGLIE
 *
 * DPad, ScoutReportScreen, PostMatchPress, PressScreen, AIDecisionOverlay,
 * MatchdayCard, JerseyIcon e i pattern/palette delle maglie, TeamFormation,
 * FormationView, l’editor di aspetto (pelle/capelli), COACH_ORDERS, COACH_SHOUTS,
 * SUB_EVENTS, CHAIN_SITS, i testi della panchina e MatchErrorBoundary.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 17900-19168   ·   1269 righe di 41427
 * La prima riga dopo questa intestazione è la riga 17900 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 17875 del file generato.
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
   D-PAD  (W/↑ = avanti) — pulsanti grandi
======================================== */
function DPad({onMove,dark=false,size=42}){
  const SZ=size;
  const btn=(lbl,dx,dy)=>(
    <button onPointerDown={e=>{e.preventDefault();onMove(dx,dy);}}
      style={{width:SZ,height:SZ,borderRadius:9,
        background:dark?"rgba(0,0,0,0.52)":"rgba(30,42,60,0.08)",
        border:dark?"1px solid rgba(255,255,255,0.18)":"1px solid "+TH.cardBorder,
        color:dark?"#fff":TH.text,fontSize:16,cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
        userSelect:"none",WebkitUserSelect:"none",touchAction:"none",
        fontWeight:600,
        boxShadow:dark?"none":TH.shadow}}>
      {lbl}
    </button>
  );
  return(
    <div style={{display:"grid",gridTemplateColumns:`${SZ}px ${SZ}px ${SZ}px`,gridTemplateRows:`${SZ}px ${SZ}px ${SZ}px`,gap:4,userSelect:"none",flexShrink:0}}>
      <div/>{btn("▲",+2.5,0)}<div/>
      {btn("◀",0,-2.5)}<div style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:7,height:7,borderRadius:"50%",background:dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.1)"}}/></div>{btn("▶",0,+2.5)}
      <div/>{btn("▼",-2.5,0)}<div/>
    </div>
  );
}

/* ========================================
   AI UI COMPONENTS
======================================== */
function ScoutReportScreen({report,opponent,onClose,loading}){
  if(loading)return(
    <Card style={{padding:24,textAlign:"center",marginBottom:10}}>
      <div style={{fontSize:28,marginBottom:6,animation:"pulse 1.2s infinite"}}>🔍</div>
      <div style={{fontSize:13,color:TH.muted}}>Scout in osservazione…</div>
      <div style={{fontSize:10,color:TH.faint,marginTop:4}}>Analisi tattica di {opponent?.n||"avversario"} in corso</div>
    </Card>
  );
  if(!report)return null;
  const dc=report.difficulty>72?TH.danger:report.difficulty>48?TH.warning:TH.success;
  const diffLabel=report.difficulty>72?"🔴 Molto difficile":report.difficulty>55?"🟡 Difficile":report.difficulty>38?"🟢 Abbordabile":"🔵 Accessibile";
  const prestige=opponent?.p||65;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
      {/* Header */}
      <Card style={{padding:"14px 16px",background:"linear-gradient(135deg,#0f172a,#1a1f2e)",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <TeamBadge team={opponent} size={40}/>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:2}}>Analisi Prematch</div>
            <div style={{fontSize:16,fontWeight:900,color:"#f1f5f9"}}>{opponent?.n||"Avversario"}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>{opponent?.lg||""}{opponent?.nat?` ${opponent.nat}`:""}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:32,fontWeight:900,color:dc,lineHeight:1}}>{report.difficulty}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:1}}>DIFFICOLTÀ</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:dc}}>{diffLabel}</span>
          <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden",width:120}}>
            <div style={{height:"100%",width:`${report.difficulty}%`,background:dc,borderRadius:3,transition:"width .8s"}}/>
          </div>
        </div>
      </Card>
      {/* worldMemory note — storia con questa squadra */}
      {report.memNote&&(
        <Card bg={TH.bgAmber} border="#fde68a" style={{padding:"10px 14px"}}>
          <div style={{fontSize:11,color:TH.txAmber,fontWeight:700,lineHeight:1.5}}>{report.memNote}</div>
        </Card>
      )}
      {/* H2H if available */}
      {report.h2h&&(
        <Card style={{padding:"10px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:2,marginBottom:6}}>⚔️ PRECEDENTI</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{textAlign:"center",flex:1,background:TH.bgGreen,borderRadius:8,padding:"6px 0"}}>
              <div style={{fontSize:20,fontWeight:900,color:TH.success}}>{report.h2h.w}</div>
              <div style={{fontSize:10,color:TH.muted}}>VINTE</div>
            </div>
            <div style={{textAlign:"center",flex:1,background:TH.bgAmber,borderRadius:8,padding:"6px 0"}}>
              <div style={{fontSize:20,fontWeight:900,color:TH.warning}}>{report.h2h.d}</div>
              <div style={{fontSize:10,color:TH.muted}}>PAREGGIATE</div>
            </div>
            <div style={{textAlign:"center",flex:1,background:TH.lossBg,borderRadius:8,padding:"6px 0"}}>
              <div style={{fontSize:20,fontWeight:900,color:TH.danger}}>{report.h2h.l}</div>
              <div style={{fontSize:10,color:TH.muted}}>PERSE</div>
            </div>
          </div>
        </Card>
      )}
      {/* Strengths & weaknesses */}
      <Card style={{padding:"12px 14px"}}>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:TH.danger,letterSpacing:1.5,marginBottom:5}}>⚠️ PUNTI DEBOLI — DA SFRUTTARE</div>
          {(report.weaknesses||[]).map((w,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"5px 0",borderBottom:i<(report.weaknesses.length-1)?"1px solid "+TH.cardBorder:"none"}}>
              <span style={{fontSize:12,marginTop:1,flexShrink:0}}>🎯</span>
              <div style={{fontSize:11,color:TH.text,lineHeight:1.5}}>{w}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:TH.success,letterSpacing:1.5,marginBottom:5}}>💪 PUNTI FORTI — DA NEUTRALIZZARE</div>
          {(report.strengths||[]).map((str,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"5px 0",borderBottom:i<(report.strengths.length-1)?"1px solid "+TH.cardBorder:"none"}}>
              <span style={{fontSize:12,marginTop:1,flexShrink:0}}>⚡</span>
              <div style={{fontSize:11,color:TH.text,lineHeight:1.5}}>{str}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* Recommendation */}
      <Card style={{padding:"12px 14px",background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",border:"1px solid #bfdbfe"}}>
        <div style={{fontSize:10,fontWeight:700,color:TH.primary,letterSpacing:1.5,marginBottom:5}}>🎙️ CONSIGLIO DEL MISTER</div>
        <div style={{fontSize:12,color:TH.text,lineHeight:1.65,fontStyle:"italic"}}>"{report.recommendation}"</div>
      </Card>
      {onClose&&<Btn onClick={onClose} v="primary" fw style={{padding:"12px",fontSize:13}}>⚡ Capito — Entriamo in campo!</Btn>}
    </div>
  );
}

// [6.7.0 collaudo PO] RASSEGNA STAMPA post-partita — schermata AUTO-mostrata dopo il match (rimpiazza la card
//   "postmatch"): impaginazione da GIORNALE (masthead, titolone, tabellino, pagella, statistiche, altre testate,
//   voci dai tifosi). Il report è async (fallback locale → veloce): punteggio/statistiche escono subito, i titoli
//   riempiono con uno shimmer quando arrivano. Tema newsprint (distinto dal broadcast della FormationView).
function PostMatchPress({match,report,player,L,onClose}){
  const r=match||{}, rep=report||{};
  const won=r.won, drew=r.drew;
  const rc=(r.rating>=8)?"#15803d":(r.rating>=6.5)?"#b45309":"#b91c1c";
  // [6.31.0] in un match di NAZIONALE l'eroe rappresenta la NAZIONE, non il club → tabellino ITA, non WRK.
  const _natMatch=/^(national|nationsCup|euroMondiale)/.test((r.context)||"");
  const heroClub=_natMatch?{n:player?.nation||"Italia",a:(player?.nation||"NAZ").slice(0,3).toUpperCase()}:(player?.club||{});
  // [6.7.1 copyright] SOLO testate DI FANTASIA: il default attinge alle NEWSPAPERS del gioco (fittizie), mai a nomi reali.
  const paper=(rep.papers&&rep.papers[0])||((typeof NEWSPAPERS!=="undefined"&&NEWSPAPERS[0]&&NEWSPAPERS[0].name)||"Sport Korward");
  const dateLine=`Stagione ${player?.season||1} · Giornata ${player?.week||1}`;
  const lead=(rep.headlines&&rep.headlines[0])||null;
  const subs=(rep.headlines||[]).slice(1,4);
  const papers=rep.papers||["Sprint","Cronaca","Zona Mista","Sport in Rete"];
  const paperCols=rep.paperColors||["#e8000d","#003da5","#7c3aed","#16a34a"];
  const hasStats=r.shots!=null;
  // [6.77.0 collaudo PO «brutto il verde del giornale — valuta granata anche l'header»] l'hero-banner non è più
  //   colorato dall'ESITO (verde/ambra/rosso stonava con la palette granata della pagina): masthead SEMPRE
  //   granata di brand (TH.primary→primaryDk, come CTA/trofeo). L'esito resta detto dal label+emoji (VITTORIA 🏆).
  const resLabel=won?"VITTORIA":drew?"PAREGGIO":"SCONFITTA";
  const _shim={background:`linear-gradient(90deg,${TH.surface2},${TH.divider},${TH.surface2})`,backgroundSize:"200% 100%",animation:"pmShim 1.3s linear infinite"};
  // [6.65.0 collaudo PO «rendi la grafica del giornale più moderna»] rassegna stampa RIDISEGNATA: card moderna
  //   theme-aware (light/dark) con hero-banner del risultato, scoreboard, ring pagella e barre statistiche.
  return(
    <div style={{width:"100%",maxWidth:600,margin:"0 auto"}}>
      <style>{"@keyframes pmShim{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes pmUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}"}</style>
      <div style={{background:TH.card,borderRadius:18,overflow:"hidden",boxShadow:"0 16px 44px rgba(0,0,0,0.28)",border:`1px solid ${TH.cardBorder}`,animation:"pmUp .45s cubic-bezier(.2,.8,.2,1) both",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
        {/* HERO risultato */}
        <div style={{padding:"16px 18px 15px",background:`linear-gradient(135deg,${TH.primary},${TH.primaryDk})`,color:"#fff"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:9.5,letterSpacing:2,fontWeight:800,opacity:0.92,textTransform:"uppercase"}}>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>📰 {paper}</span>
            <span>{resLabel} {won?"🏆":drew?"🤝":"📉"}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginTop:12}}>
            <div style={{flex:1,textAlign:"right",fontSize:15,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{heroClub.a||heroClub.n||"NOI"}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,flexShrink:0}}>
              <span style={{fontSize:40,fontWeight:900,lineHeight:1}}>{r.homeScore}</span>
              <span style={{fontSize:22,opacity:0.7}}>–</span>
              <span style={{fontSize:40,fontWeight:900,lineHeight:1}}>{r.awayScore}</span>
            </div>
            <div style={{flex:1,textAlign:"left",fontSize:15,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.oppAbbr||r.opponent||"AVV"}</div>
          </div>
          <div style={{textAlign:"center",fontSize:9.5,opacity:0.85,marginTop:8,letterSpacing:0.5}}>{dateLine}</div>
        </div>
        {/* TROFEO */}
        {rep.titleWon&&(
          <div style={{padding:"11px 16px",background:"linear-gradient(135deg,#7a1f30,#a3263a 45%,#f0b33a)",color:"#fff",textAlign:"center"}}>
            <div style={{fontSize:9,letterSpacing:3,fontWeight:800,opacity:0.92}}>🏆 TROFEO CONQUISTATO</div>
            <div style={{fontSize:17,fontWeight:900,letterSpacing:0.5,marginTop:2,textShadow:"0 1px 4px rgba(0,0,0,0.35)"}}>{String(rep.titleName||"").replace(/^(la|le|il|lo|l')\s*/i,"").toUpperCase()}</div>
          </div>
        )}
        {/* TITOLONE */}
        <div style={{padding:"15px 18px 8px"}}>
          {lead?(<div style={{fontSize:21,fontWeight:900,color:TH.text,lineHeight:1.2,letterSpacing:-0.2}}>{lead}</div>):(<div style={{height:50,borderRadius:8,...(_shim)}}/>)}
        </div>
        {/* PAGELLA + STATISTICHE */}
        <div style={{display:"flex",gap:12,padding:"6px 18px 12px",alignItems:"stretch"}}>
          <div style={{flexShrink:0,width:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"12px 6px",background:TH.surface2,borderRadius:14,border:`1px solid ${TH.cardBorder}`}}>
            <div style={{fontSize:8,letterSpacing:2,color:TH.faint,fontWeight:700}}>PAGELLA</div>
            <div style={{width:58,height:58,borderRadius:"50%",background:rc,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 14px ${rc}55`}}><span style={{fontSize:24,fontWeight:900,color:"#fff"}}>{r.rating}</span></div>
            <div style={{fontSize:9,color:TH.muted,fontWeight:600}}>{(r.goals>0?`⚽${r.goals} `:"")+(r.assists>0?`🎯${r.assists}`:"")||"—"}</div>
            {/* [7.268.0 batteria di regressione] MINUTI GIOCATI: il dato esiste da 7.38.0 ma viveva SOLO nel
                tabellone di fine partita di LiveMatch, che scorre via in un attimo — chi entra dalla panchina
                o viene sostituito atterrava sulla rassegna senza sapere quanto ha giocato. Qui si legge. */}
            {r.matchStatus&&r.matchStatus!=="starter"&&r.minutesPlayed!=null&&r.minutesPlayed<90&&(
              <div style={{fontSize:8.5,color:TH.faint,fontWeight:700,textAlign:"center",lineHeight:1.3}}>
                {r.matchStatus==="bench"?`Entrato · ${r.minutesPlayed}' giocati`:r.matchStatus==="sent_off"?`Espulso · ${r.minutesPlayed}' giocati`:`Sostituito al ${r.minutesPlayed}' · ${r.minutesPlayed}' giocati`}
              </div>)}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:9}}>
            {hasStats?[["Possesso",r.possession+"%",r.possession,TH.primary],["Tiri",r.shots+"–"+r.oppShots,(r.shots+r.oppShots)>0?Math.round(r.shots/(r.shots+r.oppShots)*100):50,TH.accent],["Falli",""+r.fouls,null,null],["Corner",""+r.corners,null,null]].map((row,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:9,fontSize:11}}>
                <span style={{width:56,color:TH.muted,fontWeight:600}}>{row[0]}</span>
                {row[2]!=null?<div style={{flex:1,height:6,background:TH.divider,borderRadius:4,overflow:"hidden"}}><div style={{width:clamp(row[2],0,100)+"%",height:"100%",background:row[3],borderRadius:4}}/></div>:<div style={{flex:1,height:1,background:TH.divider}}/>}
                <span style={{fontWeight:800,minWidth:42,textAlign:"right",color:TH.text}}>{row[1]}</span>
              </div>
            )):<div style={{fontSize:11,color:TH.faint}}>Statistiche non disponibili</div>}
          </div>
        </div>
        {/* MVP + tifosi */}
        {(rep.motm||(rep.fanReactions||[]).length>0)&&(
          <div style={{display:"flex",gap:10,padding:"0 18px 12px",flexWrap:"wrap"}}>
            {rep.motm&&<div style={{flex:"1 1 42%",minWidth:130,background:TH.surface2,borderRadius:12,padding:"9px 12px",border:`1px solid ${TH.cardBorder}`}}><div style={{fontSize:8,letterSpacing:1,color:TH.success,fontWeight:800,marginBottom:3}}>⭐ MIGLIORE IN CAMPO</div><div style={{fontSize:12,fontWeight:700,color:TH.text}}>{rep.motm}</div></div>}
            {(rep.fanReactions||[]).length>0&&<div style={{flex:"1 1 42%",minWidth:130,background:TH.surface2,borderRadius:12,padding:"9px 12px",border:`1px solid ${TH.cardBorder}`}}><div style={{fontSize:8,letterSpacing:1,color:TH.warning,fontWeight:800,marginBottom:3}}>📣 VOCI DAI TIFOSI</div><div style={{fontSize:11,color:TH.muted,fontStyle:"italic",lineHeight:1.35}}>«{rep.fanReactions[0]}»</div></div>}
          </div>
        )}
        {/* ALTRE TESTATE */}
        <div style={{padding:"0 18px 6px"}}>
          <div style={{fontSize:8,letterSpacing:2,color:TH.faint,fontWeight:700,marginBottom:6}}>DALLE ALTRE TESTATE</div>
          {report?(subs.length?subs.map((h,i)=>(
            <div key={i} style={{display:"flex",gap:9,padding:"7px 0",borderTop:i>0?`1px solid ${TH.divider}`:"none"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:paperCols[i+1]||TH.primary,flexShrink:0,marginTop:4}}/>
              <div style={{minWidth:0}}><div style={{fontSize:8,letterSpacing:1,color:paperCols[i+1]||TH.faint,fontWeight:800,textTransform:"uppercase"}}>{papers[i+1]||"Cronaca"}</div><div style={{fontSize:12,color:TH.text,lineHeight:1.35,fontWeight:600}}>{h}</div></div>
            </div>
          )):<div style={{fontSize:11,color:TH.faint,fontStyle:"italic",padding:"4px 0"}}>Nessun altro titolo.</div>):([0,1].map(i=><div key={i} style={{height:26,borderRadius:6,marginBottom:6,...(_shim)}}/>))}
        </div>
        {rep.trending&&<div style={{padding:"4px 18px 0"}}><span style={{display:"inline-block",fontSize:10,fontWeight:800,color:TH.primary,background:TH.primary+"18",padding:"3px 10px",borderRadius:20}}>#{String(rep.trending).replace(/^#/,"")}</span></div>}
        <div style={{padding:"12px 18px 16px"}}>
          <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${TH.primary},${TH.primary}cc)`,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 6px 18px ${TH.primary}44`}}>{(L&&L.backToDashboard)||"Torna alla dashboard"} →</button>
        </div>
      </div>
    </div>
  );
}
function PressScreen({report,matchResult,onClose}){
  if(!report)return null;
  const won=matchResult?.won,drew=matchResult?.drew;
  const papers=report.papers||["Sprint","Cronaca","Zona Mista","Sport in Rete","Diretta TV"];// 5.49.3: testate di fantasia
  const pr=report.playerRating;
  const paperColors=report.paperColors||["#e8000d","#003da5","#7c3aed","#16a34a","#0099d6"];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {/* Header */}
      <Card style={{padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:TH.primary,fontWeight:700,letterSpacing:2}}>RASSEGNA STAMPA</div>
            <div style={{fontSize:15,fontWeight:900,color:TH.text}}>Post-Partita</div>
            {report.memoriaTag&&<div style={{fontSize:10,color:TH.accent,marginTop:2}}>{report.memoriaTag}</div>}
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28}}>{won?"🏆":drew?"🤝":"📉"}</div>
            <div style={{fontSize:10,color:won?TH.success:drew?TH.warning:TH.danger,fontWeight:700}}>
              {won?"VITTORIA":drew?"PAREGGIO":"SCONFITTA"}
            </div>
          </div>
        </div>
      </Card>

      {/* Newspaper headlines */}
      <Card style={{padding:"12px 16px"}}>
        <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:2,marginBottom:8}}>PRIME PAGINE</div>
        {(report.headlines||[]).map((h,i)=>(
          <div key={i} style={{padding:"8px 10px",background:TH.surface2,borderRadius:6,marginBottom:5,borderLeft:`3px solid ${paperColors[i]||TH.primary}`}}>
            <div style={{fontSize:8,color:paperColors[i]||TH.primary,fontWeight:700,letterSpacing:1,marginBottom:2}}>{papers[i]||"—"}</div>
            <div style={{fontSize:12,fontWeight:i===0?800:600,color:TH.text,lineHeight:1.3}}>{h}</div>
          </div>
        ))}
      </Card>

      {/* Player rating card */}
      {pr&&(
        <Card style={{padding:"12px 16px"}}>
          <div style={{fontSize:10,color:TH.muted,fontWeight:700,letterSpacing:2,marginBottom:8}}>PAGELLA</div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:54,height:54,borderRadius:10,background:pr.color,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1}}>{pr.value}</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.8)",letterSpacing:0.5}}>VOTO</div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:pr.color}}>{pr.label}</div>
              <div style={{fontSize:11,color:TH.muted,marginTop:2}}>
                {pr.goals>0&&<span style={{marginRight:8}}>⚽ {pr.goals} gol</span>}
                {pr.assists>0&&<span>🎯 {pr.assists} assist</span>}
                {pr.goals===0&&pr.assists===0&&<span>Partita senza reti personali</span>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MOTM + Flop */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Card style={{padding:"10px 12px"}}>
          <div style={{fontSize:8,color:TH.success,fontWeight:700,letterSpacing:1,marginBottom:4}}>⭐ MVP</div>
          <div style={{fontSize:11,fontWeight:700,color:TH.text}}>{report.motm||"—"}</div>
        </Card>
        <Card style={{padding:"10px 12px"}}>
          <div style={{fontSize:8,color:TH.danger,fontWeight:700,letterSpacing:1,marginBottom:4}}>👎 FLOP</div>
          <div style={{fontSize:11,color:TH.muted,lineHeight:1.3}}>{(report.flop||"—").slice(0,60)}</div>
        </Card>
      </div>

      {/* Tactical note */}
      {report.tacticalNote&&(
        <Card style={{padding:"10px 14px"}}>
          <div style={{fontSize:8,color:TH.accent,fontWeight:700,letterSpacing:1,marginBottom:4}}>🎯 ANALISI TATTICA</div>
          <div style={{fontSize:11,color:TH.muted,lineHeight:1.5}}>{report.tacticalNote}</div>
        </Card>
      )}

      {/* Fan reactions */}
      {(report.fanReactions||[]).length>0&&(
        <Card style={{padding:"10px 14px"}}>
          <div style={{fontSize:8,color:TH.warning,fontWeight:700,letterSpacing:1,marginBottom:6}}>📣 TIFOSI</div>
          {report.fanReactions.map((r,i)=><div key={i} style={{fontSize:11,color:TH.muted,padding:"3px 0",borderBottom:i<report.fanReactions.length-1?"1px solid "+TH.cardBorder:"none"}}>"{r}"</div>)}
        </Card>
      )}

      {/* Quotes */}
      {(report.quotes||[]).length>0&&(
        <Card style={{padding:"10px 14px"}}>
          <div style={{fontSize:8,color:TH.muted,fontWeight:700,letterSpacing:1,marginBottom:6}}>💬 DICHIARAZIONI</div>
          {report.quotes.map((q,i)=><div key={i} style={{fontSize:11,color:TH.muted,fontStyle:"italic",padding:"4px 0",borderBottom:i<report.quotes.length-1?"1px solid "+TH.cardBorder:"none"}}>{q}</div>)}
        </Card>
      )}

      {/* Trending */}
      <Card style={{padding:"8px 14px",background:TH.bgBlue}}>
        <span style={{fontSize:11,color:TH.primary,fontWeight:700}}>📈 Trending: </span>
        <span style={{fontSize:11,color:TH.text}}>{report.trending}</span>
      </Card>

      {onClose&&<Btn onClick={onClose} v="primary" fw style={{padding:"12px",fontSize:13}}>🔙 Torna alla Home</Btn>}
    </div>
  );
}

function AIDecisionOverlay({tactic,loading}){
  if(!tactic&&!loading)return null;
  return(
    <div style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"9px 12px",marginBottom:8}}>
      <div style={{fontSize:10,fontWeight:700,color:TH.danger,marginBottom:3}}>🤖 TATTICA AVVERSARIA (AI)</div>
      {loading?<div style={{fontSize:11,color:TH.muted}}>Analisi in corso…</div>:(
        <>
          <div style={{fontSize:14,fontWeight:900,color:"#f1f5f9",marginBottom:1}}>{tactic.formation}</div>
          <div style={{fontSize:10,color:TH.muted}}>Pressing: {tactic.pressure}% · {tactic.reasoning}</div>
        </>
      )}
    </div>
  );
}

/* ========================================
   MATCHDAY CARD  (req #10 – calendario)
======================================== */
/* [7.148.0 collaudo PO «il nome della lega deve avere come sfondo il colore della bandiera nazionale (es Lega A → tricolore italiano)»]
   generale, non hardcoded per lega: decodifica la bandiera-emoji del club (regional indicators 🇮🇹 → "IT", oppure
   tag-sequence 🏴󠁧󠁢󠁥󠁮󠁧󠁿 → "GBENG") in un codice nazione → bande CSS che RICORDANO il tricolore/insegna. Il nome resta
   leggibile in una targhetta scura centrata sopra la bandiera (così regge anche sulle bande bianche/gialle). */
/* [7.151.0 collaudo PO «bandiera in stile moderno, sfumato!»] i colori SFUMANO l'uno nell'altro (niente bande nette)
   su un taglio DIAGONALE (110°) → look moderno; gli anchor solidi tengono l'identità della bandiera, le zone tra un
   anchor e l'altro sono il blend. Sheen leggero aggiunto nel render. */
const _FLAG_BG={
  IT:"linear-gradient(110deg,#009246 0%,#009246 16%,#eef1ec 44%,#eef1ec 56%,#ce2b37 84%,#ce2b37 100%)",
  FR:"linear-gradient(110deg,#0055a4 0%,#0055a4 16%,#eef1f4 44%,#eef1f4 56%,#ef4135 84%,#ef4135 100%)",
  BE:"linear-gradient(110deg,#1c1c1c 0%,#1c1c1c 16%,#fae042 44%,#fae042 56%,#ed2939 84%,#ed2939 100%)",
  DE:"linear-gradient(155deg,#1a1a1a 0%,#1a1a1a 14%,#dd0000 46%,#dd0000 56%,#ffce00 86%,#ffce00 100%)",
  NL:"linear-gradient(155deg,#ae1c28 0%,#ae1c28 16%,#eef1f4 44%,#eef1f4 56%,#21468b 84%,#21468b 100%)",
  ES:"linear-gradient(155deg,#aa151b 0%,#aa151b 14%,#f1bf00 42%,#f1bf00 58%,#aa151b 86%,#aa151b 100%)",
  PT:"linear-gradient(110deg,#006600 0%,#006600 26%,#da291c 66%,#da291c 100%)",
  TR:"linear-gradient(110deg,#e30a17 0%,#e30a17 52%,#f6cdd0 64%,#f6cdd0 70%,#e30a17 84%,#e30a17 100%)",
  GBENG:"linear-gradient(110deg,#eef1f4 0%,#eef1f4 30%,#ce1124 46%,#ce1124 54%,#eef1f4 70%,#eef1f4 100%)"
};
// [7.158.0 collaudo PO «disegnare il centrocampo dell'ingresso in campo coi colori della bandiera, sfumato»]
//   colori canvas-usable della bandiera (strisce dominanti) per il TAPPETO CERIMONIALE a centrocampo del walkout.
const _FLAG_COLS={
  IT:["#009246","#eef1ec","#ce2b37"], FR:["#0055a4","#eef1f4","#ef4135"], BE:["#1c1c1c","#fae042","#ed2939"],
  DE:["#1a1a1a","#dd0000","#ffce00"], NL:["#ae1c28","#eef1f4","#21468b"], ES:["#aa151b","#f1bf00","#aa151b"],
  PT:["#006600","#da291c"], TR:["#e30a17","#f6cdd0","#e30a17"], GBENG:["#eef1f4","#ce1124","#eef1f4"]
};
function flagColsOf(nat){const code=_flagCode(nat);return (code&&_FLAG_COLS[code])||null;}
function _flagCode(f){if(!f)return null;let ri="",tg="";for(const ch of String(f)){const c=ch.codePointAt(0);if(c>=0x1F1E6&&c<=0x1F1FF)ri+=String.fromCharCode(c-0x1F1E6+65);else if(c>=0xE0061&&c<=0xE007A)tg+=String.fromCharCode(c-0xE0061+97);}
  if(ri.length>=2)return ri.slice(0,2);if(tg)return tg.toUpperCase();return null;}
function leagueFlagBg(nat){const code=_flagCode(nat);return (code&&_FLAG_BG[code])||null;}
function MatchdayCard({homeTeam,awayTeam,stadium,attendance,league,onContinue,onSkip,scoutReport,scoutLoading,onShowScout,matchWeight=1,matchContext,weatherObj=null,kickoffHour=null,onBack=null,onSimulate=null,roundLabel=null,exClub=null}){/* [7.313.0] exClub: l'avversario e' una EX squadra dell'eroe *//* [7.32.7 collaudo PO] roundLabel: giornata/turno della competizione *//* [7.14.0 collaudo PO «non posso simulare!»] onSimulate: le gare di NAZIONALE entrate dal CTA finivano su questa schermata SENZA uscita né Simula (6.80 vieta l'abbandono) → ora il bottone c'è qui *//* [6.77.0 collaudo PO] onBack: ritorno alla dashboard in caso di cambio idea (prima solo ESC da desktop) */
  /* [6.3.3 BUG-WX] meteo/orario REALI (seedati) della partita, passati da LiveMatch → niente più valori
     casuali che cambiavano entrando in campo e a ogni reload. Fallback ai vecchi pick() se assenti. */
  const _wDisp60=(typeof weatherNightDisp==="function")?weatherNightDisp(weatherObj,(kickoffHour!=null&&kickoffHour>=21)):weatherObj;/* [7.260.0] pre-partita coerente con la scena notturna */
  const weather=_wDisp60?`${_wDisp60.e||"☀️"} ${_wDisp60.name||"Sereno"}`:pick(["☀️ Sereno","🌥️ Nuvoloso","🌧️ Pioggia leggera","⛅ Parzialmente nuvoloso"]);
  const time=(kickoffHour!=null)?`${kickoffHour}:00`:pick(["15:00","17:30","18:00","20:45","19:00"]);
  useEffect(()=>{
    const h=e=>{if(_scrive386(e))return;if(e.key==="Enter"||e.key===" "){e.preventDefault();onContinue();}};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[onContinue]);
  const leagueName=league||(homeTeam?.isU18?(homeTeam?.lg||"Primavera"):(homeTeam?.lg||"Campionato"));
  // Sprint 99: competition identity
  const _isNatComp99=leagueName==="Nazionale"||leagueName==="Europeo"||leagueName==="Mondiale"||leagueName==="Coppa delle Nazioni"||(typeof leagueName==="string"&&leagueName.indexOf("Qualif.")===0);/* [6.47.0] le competizioni nazionali specifiche usano lo stile NAT (verde 🌍) con la loro etichetta */
  const _compId99=(leagueName==="UCL"||leagueName==="KCC")?"UCL":(leagueName==="UEL"||leagueName==="KEC")?"UEL":(leagueName==="UECL"||leagueName==="KCF")?"UECL":(leagueName&&String(leagueName).indexOf("Coppa Nazionale")===0)?"CUP":_isNatComp99?"NAT":"LEAGUE";/* [7.180.0 collaudo PO «nelle coppe il prepartita deve prendere il colore della COMPETIZIONE, non la bandiera»] le gare europee arrivano con la SIGLA (KEC/KCC/KCF) e cadevano nel bucket LEAGUE col gradiente-bandiera; anche la Coppa Nazionale tier-aware («Coppa Nazionale Lega B») non matchava l uguaglianza stretta */
  const _lgFlag=leagueFlagBg(homeTeam?.nat);/* [7.148.0] sfondo bandiera nazionale per il banner di campionato */
  const _compStyle99={UCL:{bg:"linear-gradient(135deg,#1e3a8a,#2563eb)",e:"⭐",label:"Korward Champions Cup",col:"#93c5fd"},UEL:{bg:"linear-gradient(135deg,#9a3412,#f97316)",e:"🌍",label:"Korward Europa Cup",col:"#fed7aa"},UECL:{bg:"linear-gradient(135deg,#4c1d95,#7c3aed)",e:"🌍",label:"Korward Conference Cup",col:"#ddd6fe"},CUP:{bg:"linear-gradient(135deg,#713f12,#f59e0b)",e:"🏆",label:"Coppa Nazionale",col:"#fef08a"},NAT:{bg:"linear-gradient(135deg,#064e3b,#059669)",e:"🌍",label:"Competizione Nazionale",col:"#6ee7b7"},LEAGUE:{bg:_lgFlag||`linear-gradient(135deg,${homeTeam?.c||"#1e293b"},${homeTeam?.c2||"#334155"})`,e:"⚽",label:leagueName,col:"rgba(255,255,255,0.85)",flag:!!_lgFlag}};
  const _cs99base=_compStyle99[_compId99]||_compStyle99.LEAGUE;
  const _cs99=_compId99==="NAT"?{..._cs99base,label:(leagueName==="Nazionale"?"Competizione Nazionale":leagueName)}:_cs99base;/* [6.47.0] banner nazionale con la competizione SPECIFICA (Europeo/Mondiale/Coppa delle Nazioni) invece del generico */
  const isBigMatch=matchWeight>=6;
  const isEpic=matchWeight>=8;
  return(
    <div style={{width:"100%"}}>
      {/* Sprint 99: competition banner */}
      <div style={{marginBottom:12,padding:_cs99.flag?"8px 14px":"8px 14px",borderRadius:12,background:_cs99.flag?`linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0) 46%,rgba(0,0,0,0.12)), ${_cs99.bg}`:_cs99.bg,textAlign:"center",boxShadow:"0 2px 14px rgba(0,0,0,0.18)"}}>{/* [7.151.0] sheen moderno sopra la bandiera sfumata */}
        {_cs99.flag
          ?<span style={{display:"inline-block",background:"rgba(0,0,0,0.5)",padding:"3px 16px",borderRadius:999,fontSize:11,fontWeight:900,color:"#fff",letterSpacing:2,textTransform:"uppercase",textShadow:"0 1px 2px rgba(0,0,0,0.55)"}}>{_cs99.e} {_cs99.label}</span>
          :<div style={{fontSize:11,fontWeight:900,color:_cs99.col,letterSpacing:2,textTransform:"uppercase"}}>{_cs99.e} {_cs99.label}</div>}
      </div>
      {isBigMatch&&(
        <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:isEpic?"linear-gradient(135deg,#7c3aed,#2563eb)":"linear-gradient(135deg,#dc2626,#ea580c)",border:"none",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.25)"}}>
          <div style={{fontSize:isEpic?15:13,fontWeight:900,color:"#fff",letterSpacing:1}}>{isEpic?"🔥 PARTITA EPICA":"⚡ BIG MATCH"}</div>
          {matchContext&&<div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:3}}>{matchContext}</div>}
        </div>
      )}
      {/* [7.313.0 collaudo PO «dovrebbe specificare per dare maggiore pathos che e' contro la ex squadra»]
          IL RITORNO DA EX. Il gioco SAPEVA gia' di questa storia — l'arco «Il ritorno da ex» (7.14.0) la
          racconta nel diario — ma solo per le gare di CAMPIONATO e solo nella dashboard: la schermata che
          precede la partita, cioe' l'unico momento in cui quella tensione conta davvero, non ne diceva nulla.
          Qui la fascia dichiara di chi si tratta e con quanto passato alle spalle, per qualunque competizione
          (lo screenshot del proprietario era un girone di Coppa dei Campioni). */}
      {exClub&&(
        <div style={{marginBottom:12,padding:"10px 14px",borderRadius:12,background:"linear-gradient(135deg,#78350f,#b45309)",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.22)"}}>
          <div style={{fontSize:13,fontWeight:900,color:"#fff",letterSpacing:1}}>🏟️ IL RITORNO DA EX</div>
          <div style={{fontSize:10.5,color:"rgba(255,255,255,0.92)",marginTop:3}}>{exClub.line}</div>
        </div>
      )}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:10,color:TH.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>{leagueName}{roundLabel?<span style={{color:TH.text,fontWeight:800}}>{" · "+roundLabel}</span>:null}</div>{/* [7.32.7 collaudo PO «specifica la giornata/turno in tutte le schermate pre-partita»] */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:20}}>{/* [7.169.0 scalino] colonne allineate in ALTO: la colonna ospite ha righe extra (persona) e col vecchio align center i due stemmi slittavano in verticale */}
          <div style={{textAlign:"center",flex:"0 0 96px"}}>
            <TeamBadge team={homeTeam} size={52}/>
            <div style={{fontSize:12,fontWeight:700,color:TH.text,marginTop:4}}>{homeTeam?.name||homeTeam?.n}</div>
            <div style={{fontSize:10,color:TH.muted}}>CASA</div>
            {exClub&&exClub.side==="home"&&<div style={{fontSize:9,fontWeight:900,letterSpacing:1,color:"#b45309",background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:6,padding:"2px 6px",marginTop:3,display:"inline-block"}}>EX SQUADRA</div>}
          </div>
          <div style={{fontSize:28,color:TH.faint,fontWeight:900,marginTop:15}}>VS</div>
          <div style={{textAlign:"center",flex:"0 0 96px"}}>
            <TeamBadge team={awayTeam} size={52}/>
            <div style={{fontSize:12,fontWeight:700,color:TH.text,marginTop:4}}>{awayTeam?.name||awayTeam?.n}</div>
            <div style={{fontSize:10,color:TH.muted}}>OSPITE</div>
            {exClub&&exClub.side==="away"&&<div style={{fontSize:9,fontWeight:900,letterSpacing:1,color:"#b45309",background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:6,padding:"2px 6px",marginTop:3,display:"inline-block"}}>EX SQUADRA</div>}
            {(()=>{const p=getClubPersona(awayTeam);return p?<div style={{fontSize:10,color:"#64748b",background:"#f1f5f9",borderRadius:6,padding:"2px 7px",marginTop:3,display:"inline-block"}}>{p.e} {p.name}</div>:null;})()}
          </div>
        </div>
      </div>
      <Card style={{padding:"12px 16px",marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{l:"Stadio",v:(stadium||"–").split(" ").slice(0,2).join(" ")},{l:"Spettatori",v:(attendance||0).toLocaleString("it-IT")},{l:"Meteo",v:weather},{l:"Orario",v:time}].map(s=>(
            <div key={s.l} style={{background:TH.surface2,borderRadius:8,padding:"8px 10px",border:"1px solid "+TH.cardBorder}}>
              <div style={{fontSize:10,color:TH.faint,marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
              <div style={{fontSize:12,fontWeight:600,color:TH.text}}>{s.v}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* [7.88.0 collaudo PO «l'analisi del mister la salto: mostrala SEMPRE nel wizard, con indicazioni REALI»]
          i 2 punti deboli SFRUTTABILI dell'avversario, SEMPRE visibili qui (non più solo dietro un bottone). Sono
          le stesse famiglie d'azione che handleAction premia in campo → seguire il consiglio aumenta la riuscita. */}
      {scoutReport&&scoutReport.exploits&&(
        <Card style={{padding:"12px 14px",marginBottom:10,borderLeft:"3px solid "+TH.primary}}>
          <div style={{fontSize:10,fontWeight:800,color:TH.primary,letterSpacing:1.5,marginBottom:8}}>🎙️ ANALISI DEL MISTER — COME VINCERLA</div>
          {scoutReport.exploits.map((e,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 0",borderBottom:i<scoutReport.exploits.length-1?"1px solid "+TH.divider:"none"}}>
              <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{e.cat==="gk"?"🧤":"🛡️"}</span>
              <div style={{fontSize:11.5,color:TH.text,lineHeight:1.5}}><b style={{color:TH.success}}>{e.fam}:</b> {e.tip}</div>
            </div>
          ))}
          {scoutReport.solid&&<div style={{marginTop:7,fontSize:10.5,color:TH.muted,lineHeight:1.45}}>{scoutReport.solid.tip[0].toUpperCase()+scoutReport.solid.tip.slice(1)}</div>}
        </Card>
      )}
      {/* Scout report button — dettaglio completo (difficoltà, precedenti, memoria) */}
      {(scoutReport||scoutLoading)&&(
        <div style={{marginBottom:10}}>
          <Btn onClick={onShowScout} v="secondary" fw style={{padding:"9px",fontSize:12}}>
            {scoutLoading?"🔍 Analisi in corso…":"🔍 Analisi completa"}
          </Btn>
        </div>
      )}
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={onSkip} v="ghost" style={{flex:0,padding:"10px 14px",fontSize:12}}>Salta →</Btn>
        <Btn onClick={onContinue} fw style={{padding:"13px",fontSize:14}}>📋 Formazioni →</Btn>
      </div>
      {onSimulate&&(
        <Btn onClick={onSimulate} v="ghost" fw style={{marginTop:8,padding:"10px",fontSize:12}}>⏩ Simula partita</Btn>
      )}
      {onBack&&(
        <button onClick={onBack} style={{width:"100%",marginTop:10,padding:"9px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",fontFamily:"inherit",fontSize:12,color:TH.muted,fontWeight:600}}>← Torna alla dashboard</button>
      )}
    </div>
  );
}

/* [7.8.0] KIT_PATTERN — disegno maglia per club RICONOSCIBILI (2D, direttiva PO «strisce/bande/doppio colore»).
   I due colori usati sono quelli SOCIALI del club (c = base indossata, c2 = accento). Solo club iconici;
   gli altri restano tinta unita. Tipi: stripes (verticali) · hoops (orizzontali) · halves (metà) · sash
   (fascia diagonale) · sleeves (maniche a contrasto). */
const KIT_PATTERN={
  // strisce verticali (kit reali)
  juve:"stripes",inter:"stripes",milan:"stripes",bar:"stripes",atm:"stripes",new:"stripes",ath:"stripes",
  por:"stripes",gir:"stripes",rsoc:"stripes",alm:"stripes",bet:"stripes",bol:"stripes",gen:"stripes",cry:"stripes",
  ata:"stripes",udi:"stripes",sas:"stripes",lec:"stripes",bha:"stripes",bre:"stripes",bou:"stripes",esp:"stripes",
  ren:"stripes",len:"stripes",cle:"stripes",hac:"stripes",vsc:"stripes",club:"stripes",gent:"stripes",cre:"stripes",
  shu:"stripes",wba:"stripes",sto:"stripes",
  // bande orizzontali (hoops)
  qpr:"hoops",spo:"hoops",
  // metà campo / diagonale netta (halves)
  bla:"halves",cag:"halves",mon:"halves",mtp:"halves",feye:"halves",gal:"halves",
  // fascia diagonale (sash)
  ray:"sash",
  // maniche a contrasto (sleeves)
  avl:"sleeves",whu:"sleeves",ars:"sleeves",bur:"sleeves",
  // [7.155.0 collaudo PO «i blucerchiati sono troppo simili al Genoa»] FASCIA orizzontale sul petto (band):
  //   maglia BLU con fascia bianco-rosso-nera = identità inconfondibile della Sampdoria, distinta dal rossoblù Genoa.
  sam:"band",
  /* [7.280.0 collaudo PO «la maglia dell'Ajax deve essere con la striscia verticale rossa larga come nella
     realtà! verifica anche le altre squadre!»] FASCIA VERTICALE centrale (vband): il fondo prende il colore
     secondario e la banda larga il colore sociale. Era l'unico kit iconico senza una forma nel gioco, e il club
     stava perfino nella lista dei tinta unita. */
  ajax:"vband",
  /* [7.280.0 audit dei kit reali, stessa segnalazione] quattro club vestivano liscio pur avendo un disegno
     inconfondibile: Verona e Arnhem giocano a METÀ CAMPO, Baleari e Pisano a STRISCE verticali. */
  ver:"halves",vita:"halves",mall:"stripes",pis:"stripes",
  /* [7.328.0 collaudo PO «il PSG deve avere la maglia a strisce verticali larghe blu e rosso»] STRISCE LARGHE
     (stripesw): il pattern "stripes" (16 colonne) è troppo fitto per il kit parigino — nuove barre verticali
     LARGHE blu/rosso alternate (2D+3D+stemma). Il club esce dalla lista tinta unita dove stava dal 7.8.0. */
  psg:"stripesw",
};
/* [7.8.0] club che nella REALTÀ vestono tinta unita → restano lisci (mai patternizzati dalla derivazione).
   Napoli azzurro, Real Madrid bianco, Liverpool rosso, Bayern rosso… è il loro kit vero. */
const _KIT_SOLID_IDS={napoli:1,roma:1,lazio:1,fio:1,tor:1,rma:1,liv:1,mcy:1,che:1,mun:1,tot:1,bay:1,bvb:1,rbl:1,b04:1,
  ben:1,psv:1,sev:1,vill:1,val:1,eve:1,ful:1,nfo:1,wol:1,lei:1,marse:1,lyon:1,lille:1,nan:1,tou:1,lor:1,/* [7.328.0] psg RIMOSSO: ora stripesw (strisce larghe blu-rosso) */
  mon2:1,fenk:1,bes:1,tra:1,sal:1,cit:1,metz:1,pal:1,mgb:1,stu:1,fre:1,wob:1,wer:1,ber:1,mai:1,hof:1,boc:1,han:1,
  osa:1,cel:1,get:1,las:1,mod:1,spe:1,ven:1,ces:1,samp:1,par:1,cat:1,fro:1,std:1,and:1,genk:1,
  mid:1,cov:1,swn:1,ips:1,lee:1,nor:1,car:1,wat:1,pre:1,milw:1,lut:1,bra:1,estoril:1,gron:1,utr:1,twe:1,az:1};
  /* [7.155.0] sam=Blucerchiati (Sampdoria) NON è più tinta unita: ha ora il kit "band" (fascia bianco-rosso-nera su blu) — vedi KIT_PATTERN, identità distinta dal Genoa */
/* [7.8.0] pattern maglia per QUALSIASI club: reale se curato, tinta unita se club storicamente liscio,
   altrimenti DERIVATO in modo deterministico dai suoi 2 colori sociali (solo se distinti) → ogni squadra ha
   un kit coerente e stabile, senza forzare disegni su chi è mono-colore. */
const kitPatternFor=(club)=>{
  if(!club)return null;
  const id=club.id||club.n||"";
  if(KIT_PATTERN[id])return KIT_PATTERN[id];
  if(_KIT_SOLID_IDS[id])return null;
  const c=club.c,c2=club.c2;if(!c||!c2)return null;
  let dist=999;try{dist=colorDist(c,c2);}catch(e){}
  if(dist<70)return null;// colori troppo simili → tinta unita (realistico)
  const T=["stripes","stripes","stripes","stripes","sleeves","sleeves","hoops","halves","sash"];
  return T[(hashStr("kitpat_"+id)>>>0)%T.length];
};
const _SHIRT_PATH="M16 11 C20 7.6 32 7.6 36 11 L41 13.5 L49 24.5 L42.6 31 L38 26.4 L38 49 L14 49 L14 26.4 L9.4 31 L3 24.5 L11 13.5 Z";
/* Jersey icon — shirt SVG with number and player name */
function JerseyIcon({color="#3b82f6",number,name,isPlayer=false,size=46,pattern=null,color2=null}){
  // [6.5.4] maglia SVG ridisegnata — silhouette moderna (spalle morbide, maniche raglan, colletto a giro,
  //   volume via highlight/ombra, orlo con accento, numero con ombra). Look pulito da broadcast.
  // [7.8.0] pattern-aware: se `pattern` (da KIT_PATTERN) e `color2` sono definiti e distinti, sovrappone
  //   il disegno (strisce/bande/metà/sciarpa/maniche) clippato alla sagoma. L'eroe resta ambra tinta unita.
  const col=isPlayer?"#f59e0b":color;
  const _low=(col||"").toLowerCase();
  const _c2low=(color2||"").toLowerCase();
  const light=["#ffffff","#fff","#f0f0f0","#f2f1ec","#f4f4f4","#e8e8ee","#f1f1f3"].includes(_low);
  const txtCol=light?"#14141c":"#fff";
  const detail=light?"rgba(0,0,0,0.30)":"rgba(255,255,255,0.55)";
  const lastName=((typeof _surnBG==="function")?_surnBG(name||""):(name||"").split(" ").slice(-1)[0]).toUpperCase();/* [7.173.0] cognome suffisso-aware (mai «JR» nudo sulla maglia) */
  const S=size;
  const _uid=React.useId();
  const _cid="kp"+_uid.replace(/:/g,"");
  const pat=(!isPlayer&&pattern&&color2&&_c2low&&_c2low!==_low)?pattern:null;
  // [7.8.2 collaudo PO «la Roma non ha inserti gialli»] i kit TINTA UNITA con un 2° colore sociale distinto
  //   mostrano il c2 come RIFINITURA (colletto/polsini/orlo) → Roma giallo-oro, Napoli bianco, ecc. (non l'eroe).
  const _trim=(!isPlayer&&!pat&&color2&&_c2low&&_c2low!==_low)?color2:null;
  const patG=(()=>{
    if(!pat)return null;const R=[];
    if(pat==="stripes"){for(let x=3;x<49;x+=12)R.push(<rect key={"s"+x} x={x+6} y="7" width="6" height="42" fill={color2}/>);}
    else if(pat==="stripesw"){/* [7.328.0 collaudo PO PSG] strisce verticali LARGHE alternate col/c2 — 5 fasce
      quasi uguali (blu-rosso-blu-rosso-blu): il colore SOCIALE resta dominante, le barre c2 sono larghe ma non
      ribaltano la maglia (il 1° taglio a barre 10/15 leggeva ROSSA con strisce blu = club invertito) */
      for(const x of[12,31])R.push(<rect key={"sw"+x} x={x} y="0" width="9" height="53" fill={color2}/>);}
    else if(pat==="hoops"){for(let y=9;y<49;y+=10)R.push(<rect key={"h"+y} x="2" y={y+5} width="48" height="5" fill={color2}/>);}
    else if(pat==="halves"){R.push(<rect key="hv" x="26" y="7" width="26" height="42" fill={color2}/>);}
    else if(pat==="sash"){R.push(<polygon key="sa" points="9,7 19,7 47,49 37,49" fill={color2}/>);}
    else if(pat==="sleeves"){R.push(<polygon key="sl" points="16,11 11,13.5 3,24.5 9.4,31 15,25" fill={color2}/>);R.push(<polygon key="sr" points="36,11 41,13.5 49,24.5 42.6,31 37,25" fill={color2}/>);}
    else if(pat==="vband"){/* [7.280.0 collaudo PO «la maglia dell'Ajax deve essere con la striscia verticale rossa larga come nella realtà»]
      FASCIA VERTICALE CENTRALE: il corpo prende il colore SECONDARIO (bianco) e la fascia larga al centro il
      colore sociale primario (rosso) — è la convenzione giusta per questo kit, dove la tinta del club sta nella
      fascia e non nel fondo. Nessuna modifica ai colori sociali del club, che restano quelli veri. */
      R.push(<rect key="vb0" x="0" y="0" width="52" height="53" fill={color2}/>);
      R.push(<rect key="vb1" x="18.5" y="0" width="15" height="53" fill={col}/>);}
    else if(pat==="band"){/* [7.155.0] fascia orizzontale sul petto: bianca, centro c2 (rosso Samp), bordi neri sottili */
      R.push(<rect key="bw" x="1" y="23" width="50" height="10" fill="#f4f4f4"/>);
      R.push(<rect key="bt" x="1" y="23" width="50" height="1.4" fill="#111"/>);
      R.push(<rect key="bb" x="1" y="31.6" width="50" height="1.4" fill="#111"/>);
      R.push(<rect key="bc" x="1" y="26.2" width="50" height="3.6" fill={color2}/>);}
    return R;
  })();
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"default"}}>
      <svg width={S} height={Math.round(S*1.02)} viewBox="0 0 52 53" xmlns="http://www.w3.org/2000/svg" style={{filter:"drop-shadow(0 2px 2px rgba(0,0,0,0.35))"}}>
        {/* [7.168.0 collaudo PO «maglie più moderne»] defs SEMPRE: gradiente tessuto + clip per pattern/gloss */}
        <defs>
          <linearGradient id={_cid+"g"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.10"/>
            <stop offset="0.45" stopColor="#000000" stopOpacity="0"/>
            <stop offset="1" stopColor="#000000" stopOpacity="0.26"/>
          </linearGradient>
          <linearGradient id={_cid+"s"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.30)"/><stop offset="0.5" stopColor="rgba(255,255,255,0.04)"/><stop offset="1" stopColor="rgba(255,255,255,0)"/>
          </linearGradient>
          <clipPath id={_cid}><path d={_SHIRT_PATH}/></clipPath>
        </defs>
        {/* corpo + maniche raglan (silhouette unica, spalle arrotondate → vita → orlo dritto) */}
        <path d={_SHIRT_PATH} fill={col}/>
        {pat&&(<g clipPath={"url(#"+_cid+")"}>{patG}</g>)}
        <g clipPath={"url(#"+_cid+")"}>
          <path d={_SHIRT_PATH} fill={"url(#"+_cid+"g)"}/>{/* ombra tessuto verso l'orlo */}
          <rect x="0" y="0" width="52" height="53" fill={"url(#"+_cid+"s)"}/>{/* gloss diagonale */}
        </g>
        {/* volume: colonna di luce a sinistra, ombra a destra */}
        <path d="M14 26.4 L14 49 L22 49 L22 26.4 Z" fill="rgba(255,255,255,0.10)"/>
        <path d="M31 26.4 L31 49 L38 49 L38 26.4 Z" fill="rgba(0,0,0,0.12)"/>
        {/* colletto a giro (rifinitura c2 sui kit tinta unita) */}
        <path d="M20.5 10.4 C23 15 29 15 31.5 10.4" fill="none" stroke={_trim||detail} strokeWidth={_trim?"2.6":"1.7"} strokeLinecap="round"/>
        {/* polsini (banda c2 sui kit tinta unita) */}
        {_trim?(<g><path d="M3 24.5 L9.4 31 L11.4 28.8 L5.2 22.4 Z" fill={_trim}/><path d="M49 24.5 L42.6 31 L40.6 28.8 L46.8 22.4 Z" fill={_trim}/></g>):(<g><path d="M3 24.5 L9.4 31 L11.4 28.8 L5.2 22.4 Z" fill="rgba(0,0,0,0.16)"/><path d="M49 24.5 L42.6 31 L40.6 28.8 L46.8 22.4 Z" fill="rgba(0,0,0,0.16)"/></g>)}
        {/* accento all'orlo */}
        <rect x="14" y="46.6" width="24" height={_trim?"2.4":"2"} fill={_trim||detail} opacity={_trim?"0.95":"0.5"}/>
        {/* numero: ombra + testo */}
        <text x="26.5" y="37.4" textAnchor="middle" dominantBaseline="central" fill="rgba(0,0,0,0.30)" fontSize="16.5" fontWeight="900" fontFamily="Arial,Helvetica,sans-serif">{number}</text>
        <text x="26" y="36.4" textAnchor="middle" dominantBaseline="central" fill={txtCol} fontSize="16.5" fontWeight="900" fontFamily="Arial,Helvetica,sans-serif" letterSpacing="-0.6">{number}</text>
      </svg>
      <div style={{fontSize:7,color:isPlayer?"#f59e0b":"rgba(255,255,255,0.82)",fontWeight:isPlayer?800:600,textAlign:"center",width:S+8,lineHeight:1.1,letterSpacing:"0.3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
        {lastName}
      </div>
    </div>
  );
}
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){window.__CPM_JerseyIcon=JerseyIcon;window.__CPM_KIT_PATTERN=KIT_PATTERN;window.__CPM_kitPatternFor=kitPatternFor;window.__CPM_TeamBadge=TeamBadge;window.__CPM_EmoText=EmoText;}// hook screenshot maglie+scudi (test-only) [7.168.0] + EmoText [7.170.0]

/* Groups roster [{name,role,num?}] into formation rows ATT→MID→DEF→GK */
function rosterRows(roster){
  const gk=[],def=[],mid=[],att=[];
  roster.forEach((p,i)=>{
    const r=(p.role||"").toUpperCase();
    const entry={...p,num:p.num||i+1};
    if(r==="GK"||r==="POR"||r.includes("PORTIERE"))gk.push(entry);
    else if(r==="DEF"||r.includes("DIFENSORE")||r.includes("TERZINO"))def.push(entry);
    else if(r==="MID"||r==="CEN"||r.includes("CENTROCAMPISTA")||r.includes("MEDIANO")||r.includes("TREQUARTISTA")||r.includes("MEZZALA"))mid.push(entry);
    else att.push(entry); // Ala, Centravanti, ATT, etc.
  });
  return[att,mid,def,gk].filter(r=>r.length>0);
}

/* Single team formation column */
function TeamFormation({team,roster,isHome,kitCol}){
  const col=kitCol||team?.c||team?.col||"#3b82f6";
  const rows=rosterRows(roster);
  const playerIdx=isHome?roster.findIndex((_,i)=>i===roster.length-1):-1;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"0 4px"}}>
      {/* team header */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
        <TeamBadge team={team} size={22}/>
        <div style={{fontSize:11,fontWeight:900,color:"#fff",letterSpacing:1,textTransform:"uppercase"}}>{team?.a||team?.abbr}</div>
      </div>
      {/* formation rows: ATT at top, GK at bottom */}
      {rows.map((row,ri)=>(
        <div key={ri} style={{display:"flex",justifyContent:"center",gap:3,flexWrap:"wrap",marginBottom:2}}>
          {row.map((pl,pi)=>{
            const globalIdx=roster.indexOf(pl);
            const isP=isHome&&globalIdx===roster.length-1;
            return<JerseyIcon key={pi} color={col} number={pl.num} name={pl.name} isPlayer={isP} size={34} pattern={kitPatternFor(team)} color2={team&&team.c2}/>;
          })}
        </div>
      ))}
    </div>
  );
}

/* FORMATION VIEW */
function FormationView({homeTeam,awayTeam,player,homeRoster,awayRoster,onContinue,onSkip,oppTactic,oppTacticLoading,homeKitCol,awayKitCol,competition=null,euroRound=null,contextLabel=null}){
  useEffect(()=>{
    const h=e=>{if(_scrive386(e))return;if(e.key==="Enter"||e.key===" "){e.preventDefault();onContinue();}};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[onContinue]);
  const hRoster=homeRoster||generateTeamRoster(homeTeam,player?.season||1).map((r,i)=>i===10?{name:player?.name||"Tu",role:"ATT"}:r);
  const aRoster=awayRoster||generateTeamRoster(awayTeam,player?.season||1);
  // Home: hero (last slot) = player jersey num, teammates = 1-15 excluding hero's num
  const _heroNum=player?.jerseyNum||10;
  const HOME_NUMS=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(n=>n!==_heroNum).slice(0,10);
  const AWAY_NUMS=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(n=>n!==_heroNum).slice(0,10);
  const withNums=(roster,isHome=false)=>{
    // Check if player is in this roster (by name at index 10)
    const playerInRoster=roster[10]&&roster[10].name===player?.name;
    if(!isHome){
      if(playerInRoster){
        // Player in away roster: assign _heroNum to player, skip for teammates
        let ni=0;
        return roster.map((p,i)=>{if(i===10)return{...p,num:_heroNum};return{...p,num:AWAY_NUMS[ni++]||i+1};});
      }
      // Player NOT in away roster: assign sequentially 1-11
      let n=1;return roster.map(p=>({...p,num:n++}));
    }
    // isHome=true
    if(playerInRoster){
      // Player in home roster: assign _heroNum to player, skip for teammates
      let ni=0;
      return roster.map((p,i)=>{if(i===10)return{...p,num:_heroNum};return{...p,num:HOME_NUMS[ni++]||i+1};});
    }
    // Player NOT in home roster: assign 1-11 sequentially, skip _heroNum
    let n=0;
    return roster.map((p,i)=>{if(i===10)return{...p,num:HOME_NUMS[n]||11};n++;return{...p,num:HOME_NUMS[n-1]||i+1};});
  };
  const _isEuro=!!competition;
  const _ecFull122={UCL:"⭐ Korward Champions Cup",UEL:"🟡 Korward Europa Cup",UECL:"🟣 Korward Conference Cup"}[competition]||`🌍 ${competition||""}`;
  const _ecCol122={UCL:"#93c5fd",UEL:"#fde68a",UECL:"#c4b5fd"}[competition]||"#93c5fd";
  // [6.5.3 Polish E] REDESIGN broadcast/TV (design panel "MATCHDAY LIVE — Broadcast Lower-Third"):
  //   header competizione con hairline ambra, banda VS diagonale coi colori-divisa + medaglione, due
  //   pannelli-formazione "lower-third", tattica avversaria come meter scout (verde→ambra→rosso) invece
  //   del box rosso d'allarme, CTA ambra. Logica numeri/eroe (withNums/hRoster/aRoster) INVARIATA.
  const _rgba=(h,a)=>{try{const c=hexToRgb(h);return "rgba("+c.r+","+c.g+","+c.b+","+a+")";}catch(e){return "rgba(255,255,255,"+a+")";}};
  const ACC="#f59e0b";
  const _fmtOf=(rr)=>{let d=0,m=0,a=0;(rr||[]).forEach(p=>{const r=(p.role||"").toUpperCase();if(r==="GK"||r==="POR"||r.includes("PORTIERE"))return;if(r==="DEF"||r.includes("DIFENSORE")||r.includes("TERZINO"))d++;else if(r==="MID"||r==="CEN"||r.includes("CENTROCAMPISTA")||r.includes("MEDIANO")||r.includes("TREQUARTISTA")||r.includes("MEZZALA"))m++;else a++;});return d+"-"+m+"-"+a;};
  const _homeNums=withNums(hRoster,true),_awayNums=withNums(aRoster,false);
  const _pips=p=>clamp(Math.round((p||60)/20),1,5);
  const _pipRow=(p,rev)=>(<div style={{display:"flex",gap:3,marginTop:4,flexDirection:rev?"row-reverse":"row"}}>{[0,1,2,3,4].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:i<_pips(p)?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.2)"}}/>)}</div>);
  const _dotMatrix=fmt=>{const raw=(fmt||"").split("-").map(n=>parseInt(n,10)).filter(n=>n>0);if(!raw.length)return null;const lines=raw.slice().reverse();const W=54,H=38,rows=lines.length;return(<svg width={W} height={H} viewBox={"0 0 "+W+" "+H} style={{flexShrink:0}}>{lines.map((cnt,ri)=>{const y=7+ri*((H-14)/Math.max(rows-1,1));return Array.from({length:cnt}).map((_,ci)=>{const x=cnt===1?W/2:7+ci*((W-14)/(cnt-1));return<circle key={ri+"_"+ci} cx={x} cy={y} r={2.2} fill={ri===0?ACC:"rgba(255,255,255,0.7)"}/>;});})}</svg>);};
  const _panel=(team,rr,kit)=>(
    <div style={{flex:1,minWidth:0,borderRadius:10,overflow:"hidden",background:"rgba(255,255,255,0.02)",border:"1px solid "+_rgba(kit,0.25),boxShadow:"inset 0 0 24px rgba(0,0,0,0.25)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderBottom:"1px solid rgba(255,255,255,0.06)",borderLeft:"4px solid "+kit,boxShadow:"inset 6px 0 8px "+_rgba(kit,0.25)}}>
        <span style={{fontSize:13,fontWeight:900,letterSpacing:"0.06em",textTransform:"uppercase",color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{team?.a||team?.abbr||"—"}</span>
        <span style={{marginLeft:"auto",padding:"2px 7px",borderRadius:6,background:"rgba(255,255,255,0.06)",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.75)",whiteSpace:"nowrap"}}>{_fmtOf(rr)}</span>
      </div>
      <div style={{padding:"8px 4px 10px"}}>
        {rosterRows(rr).map((row,ri)=>(
          <div key={ri} style={{display:"flex",justifyContent:"center",gap:3,flexWrap:"wrap",marginBottom:2}}>
            {row.map((pl,pi)=>{const isP=!!player&&pl.name===player.name;return isP?(
              <div key={pi} style={{boxShadow:"0 0 0 2px "+ACC+",0 0 10px rgba(245,158,11,0.55)",borderRadius:8,padding:1}}><JerseyIcon color={kit} number={pl.num} name={pl.name} isPlayer={true} size={30}/></div>
            ):(<JerseyIcon key={pi} color={kit} number={pl.num} name={pl.name} isPlayer={false} size={30} pattern={kitPatternFor(team)} color2={team&&team.c2}/>);})}
          </div>
        ))}
      </div>
    </div>
  );
  return(
    <div style={{position:"relative",overflow:"hidden",width:"100%",maxWidth:640,margin:"0 auto",background:"linear-gradient(180deg,#0a0e1a 0%,#0d1528 100%)",borderRadius:12,padding:"0 0 12px"}}>
      <style>{"@keyframes cpmLtSlide{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}@keyframes cpmLtMeter{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes cpmLtShine{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(240%) skewX(-18deg)}}"}</style>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:3,background:"repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(120% 80% at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%)"}}/>
      </div>
      <div style={{position:"relative",zIndex:1}}>
        {/* competition header */}
        <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",padding:"9px 12px 8px",borderBottom:"2px solid "+ACC,animation:"cpmLtSlide .4s ease-out both"}}>
          <span style={{position:"absolute",left:12,top:11,fontSize:8,fontWeight:700,letterSpacing:"0.14em",color:"rgba(255,255,255,0.35)"}}>PREPARTITA</span>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.12em",color:"rgba(255,255,255,0.85)",textTransform:"uppercase"}}>{contextLabel||(_isEuro?_ecFull122:(homeTeam?.lg||"Campionato"))}</div>{/* [6.42.0] contextLabel (Coppa Nazionale/Nazionale/…) ha priorità sul fallback lega: prima una gara di COPPA mostrava «LEGA B» perché usava homeTeam.lg */}
            {euroRound&&<div style={{fontSize:9,fontWeight:600,letterSpacing:"0.06em",color:"rgba(255,255,255,0.45)",marginTop:1}}>{euroRound}</div>}{/* [7.32.7 collaudo PO] il turno si mostra per OGNI competizione (giornata campionato/turno coppa), non solo euro */}
          </div>
        </div>
        {/* VS hero band */}
        <div style={{position:"relative",height:"clamp(112px,32vw,140px)",overflow:"hidden",marginTop:6,animation:"cpmLtSlide .4s ease-out 80ms both"}}>
          <div style={{position:"absolute",inset:0,clipPath:"polygon(0 0,58% 0,42% 100%,0 100%)",background:"linear-gradient(90deg,"+_rgba(homeKitCol,0.14)+", transparent 78%)"}}/>
          <div style={{position:"absolute",inset:0,clipPath:"polygon(58% 0,100% 0,100% 100%,42% 100%)",background:"linear-gradient(270deg,"+_rgba(awayKitCol,0.14)+", transparent 78%)"}}/>
          <div style={{position:"absolute",left:"50%",top:"-10%",width:3,height:"120%",transform:"skewX(-18deg)",background:"linear-gradient(180deg,transparent,"+ACC+",transparent)",boxShadow:"0 0 10px rgba(245,158,11,0.6)"}}/>
          <div style={{position:"absolute",left:0,top:0,width:4,height:"100%",background:"linear-gradient(180deg,transparent,"+homeKitCol+",transparent)",boxShadow:"0 0 12px "+_rgba(homeKitCol,0.55)}}/>
          <div style={{position:"absolute",right:0,top:0,width:4,height:"100%",background:"linear-gradient(180deg,transparent,"+awayKitCol+",transparent)",boxShadow:"0 0 12px "+_rgba(awayKitCol,0.55)}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",minWidth:0}}>
              <TeamBadge team={homeTeam} size={46}/>
              <div style={{fontSize:"clamp(22px,7vw,30px)",fontWeight:900,letterSpacing:"0.04em",color:"#f1f5f9",marginTop:2}}>{homeTeam?.a}</div>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"32vw"}}>{homeTeam?.n}</div>
              {_pipRow(homeTeam?.p,false)}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",minWidth:0,textAlign:"right"}}>
              <TeamBadge team={awayTeam} size={46}/>
              <div style={{fontSize:"clamp(22px,7vw,30px)",fontWeight:900,letterSpacing:"0.04em",color:"#f1f5f9",marginTop:2}}>{awayTeam?.a}</div>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.5)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"32vw"}}>{awayTeam?.n}</div>
              {_pipRow(awayTeam?.p,true)}
            </div>
          </div>
          <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)"}}>
            <svg width={52} height={52} viewBox="0 0 52 52">
              <path d="M26 3 A23 23 0 0 0 26 49 Z" fill={_rgba(homeKitCol,0.26)}/>
              <path d="M26 3 A23 23 0 0 1 26 49 Z" fill={_rgba(awayKitCol,0.26)}/>
              <circle cx={26} cy={26} r={23} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1}/>
              <circle cx={26} cy={26} r={24.5} fill="none" stroke={ACC} strokeWidth={1.5}/>
              <text x={26} y={27} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#f1f5f9">VS</text>
            </svg>
          </div>
        </div>
        {/* formation panels */}
        <div style={{display:"flex",gap:8,padding:"10px 8px 0"}}>
          {_panel(homeTeam,_homeNums,homeKitCol)}
          {_panel(awayTeam,_awayNums,awayKitCol)}
        </div>
        {/* opponent tactic — scout lower-third */}
        <div style={{margin:"12px 8px 0",padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",borderLeft:"4px solid "+awayKitCol,boxShadow:"inset 6px 0 10px "+_rgba(awayKitCol,0.2),animation:"cpmLtSlide .4s ease-out 160ms both"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",marginBottom:6}}>Formazione avversaria</div>
          {(oppTacticLoading||!oppTactic)?(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:64,height:22,borderRadius:5,background:"rgba(255,255,255,0.06)",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,width:"60%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",animation:"cpmLtShine 1.1s linear infinite"}}/></div>
              <div style={{flex:1,minWidth:150,height:8,borderRadius:4,background:"rgba(255,255,255,0.06)",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,width:"60%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",animation:"cpmLtShine 1.1s linear infinite"}}/></div>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{fontSize:19,fontWeight:800,color:"#f8fafc",textShadow:"0 0 8px rgba(245,158,11,0.25)"}}>{oppTactic.formation}</div>
              {_dotMatrix(oppTactic.formation)}
              <div style={{marginLeft:"auto",minWidth:150,flex:1}}>
                <div style={{fontSize:10,fontWeight:800,color:ACC,marginBottom:3}}>PRESSING {oppTactic.pressure}%</div>
                <div style={{position:"relative",height:8,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,0.08)"}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:clamp(oppTactic.pressure||0,0,100)+"%",transformOrigin:"left",animation:"cpmLtMeter .6s ease-out both",background:"linear-gradient(90deg,#22c55e,#f59e0b 55%,#ef4444)"}}/>
                  <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), rgba(10,14,26,0.9) calc(10% - 1px) 10%)"}}/>
                </div>
              </div>
            </div>
          )}
          <div style={{fontSize:9,fontWeight:500,color:"rgba(255,255,255,0.28)",marginTop:6}}>Tattica deterministica</div>
        </div>
        {/* CTA */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"12px 8px 0"}}>
          <Btn onClick={onSkip} v="ghost" style={{flex:0,padding:"10px 14px",fontSize:12}}>Salta</Btn>
          <Btn onClick={onContinue} fw style={{flexBasis:"100%",flex:"1 1 100%",position:"relative",overflow:"hidden",padding:"13px",fontSize:14,fontWeight:800,background:"linear-gradient(135deg,#f59e0b,#d97706)",boxShadow:"0 6px 20px rgba(245,158,11,0.25)"}}>
            <span style={{position:"relative",zIndex:1}}>⚽ Ingresso in campo →</span>
            <span style={{position:"absolute",top:0,left:0,width:"40%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)",animation:"cpmLtShine 0.9s ease-out 1",pointerEvents:"none"}}/>
          </Btn>
        </div>
      </div>
    </div>
    );
}

/* WALKOUT OVERLAY */

// Kit contrast helpers
const hexToRgb=h=>{const s=h.replace('#','');const n=parseInt(s.length===3?s.split('').map(c=>c+c).join(''):s,16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};};
const colorDist=(a,b)=>{const A=hexToRgb(a),B=hexToRgb(b);return Math.sqrt((A.r-B.r)**2+(A.g-B.g)**2+(A.b-B.b)**2);};
// Returns a contrasting kit color for the away team (alt kits: white, black, red, yellow, cyan)
const ALT_KITS=['#f0f0f0','#111111','#e53e3e','#f6c90e','#00bcd4','#e91e63','#ff5722'];
// hue (0-360, -1 se acromatico) e saturazione (0-1) per un contrasto PERCETTIVO (due rossi diversi hanno RGB-dist alta ma stesso hue → confusi).
const _hueOf=h=>{const c=hexToRgb(h),r=c.r/255,g=c.g/255,b=c.b/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(d<1e-4)return -1;let H;if(mx===r)H=((g-b)/d)%6;else if(mx===g)H=(b-r)/d+2;else H=(r-g)/d+4;H*=60;return H<0?H+360:H;};
const _satOf=h=>{const c=hexToRgb(h),mx=Math.max(c.r,c.g,c.b),mn=Math.min(c.r,c.g,c.b);return mx<1?0:(mx-mn)/mx;};
// CONFLITTO kit: RGB troppo vicini, OPPURE stessa famiglia di tonalità (hue vicino) con entrambi saturi → indistinguibili.
const kitsClash=(a,b)=>{if(colorDist(a,b)<95)return true;const ha=_hueOf(a),hb=_hueOf(b);if(ha>=0&&hb>=0&&_satOf(a)>0.28&&_satOf(b)>0.28){let dh=Math.abs(ha-hb);if(dh>180)dh=360-dh;if(dh<34)return true;}
  // [6.67.0] due divise CHIARE (es. bianco #f5f5f5 + celeste pastello #93c5fd) restano confuse sul campo 3D anche con dist>95:
  //   sotto la luce dello stadio entrambe leggono bianche e prendono pantaloncini scuri identici. Soglia alzata a 150 quando ENTRAMBE sono luminose.
  if(hexLum(a)>0.6&&hexLum(b)>0.6&&colorDist(a,b)<150)return true;
  /* [7.192.0 collaudo PO «per 2 partite consecutive le maglie si confondevano»] caso SPECULARE: due divise SCURE.
     Granata #6c1f2e vs nero #0f0f0f dà distanza RGB 99.3 — appena sopra la soglia 95, quindi «nessun conflitto» —
     ma sul campo, sotto le luci dello stadio e col darkening 3D delle tinte sature, leggono entrambe NERE.
     Nel buio il discriminante non è la distanza RGB ma la CHIAREZZA: se due divise sono entrambe scure e
     differiscono poco in luminanza, l'unico appiglio resta la tinta → serve saturazione reale su ENTRAMBE e
     tinte lontane (rosso scuro vs verde scuro si distinguono, granata vs nero no). */
  const _la=hexLum(a),_lb=hexLum(b);
  if(_la<0.26&&_lb<0.26&&Math.abs(_la-_lb)<0.16){
    const _sa=_satOf(a),_sb=_satOf(b);let _dh=999;const _ha=_hueOf(a),_hb=_hueOf(b);
    if(_ha>=0&&_hb>=0){_dh=Math.abs(_ha-_hb);if(_dh>180)_dh=360-_dh;}
    if(!(_sa>0.35&&_sb>0.35&&_dh>50))return true;
  }
  return false;};
const resolveKitConflict=(homeCol,awayCol)=>{
  if(!homeCol||!awayCol)return awayCol||'#ef4444';
  if(!kitsClash(homeCol,awayCol))return awayCol; // contrasto sufficiente (RGB + hue)
  // conflitto → maglia alternativa massimamente distinta da homeCol (e che non sia anch'essa in conflitto)
  return ALT_KITS.reduce((best,k)=>(colorDist(homeCol,k)-(kitsClash(homeCol,k)?500:0))>(colorDist(homeCol,best)-(kitsClash(homeCol,best)?500:0))?k:best,'#f0f0f0');
};
// 3D-KIT (Step A): luminanza percettiva + costruzione kit completo (maglia/pantaloncini/calzettoni/scarpe).
const hexLum=h=>{const c=hexToRgb(h);return(0.2126*c.r+0.7152*c.g+0.0722*c.b)/255;};
// kit a tinta unita per ogni parte: pantaloncini bianchi se la maglia è scura, scuri se chiara; calzettoni in tinta maglia.
const buildKit=shirt=>{const L=hexLum(shirt);return{shirt,shorts:L<0.5?'#f1f1f3':'#181826',socks:shirt,shoes:'#141418'};};
/* [7.8.0 · 7.8.2] KIT 3D — texture procedurale del pattern per la maglia CH38. LIMITE VERIFICATO (screenshot UV):
   le UV di Ch38_Shirt sono NON-lineari sulla larghezza del busto → una striscia verticale COARSE (7) collassa in
   uno split; ma ad ALTA frequenza (16) le strisce verticali mappano PULITE (busto = ~5 strisce leggibili). Le
   BANDE ORIZZONTALI (hoops) mappano sempre bene (asse V lineare). Perciò in 3D applichiamo `stripes` (16 strisce)
   e `hoops`; metà/sciarpa/maniche restano tinta unita in campo (UV irregolari → colorerebbero una manica/mezzo
   busto; le icone-maglia 2D le mostrano tutte). Ritorna CanvasTexture (cache) o null. */
const _kitTexCache={};
const kitPatternTex=(shirt,c2,pat,num)=>{/* [7.260.0 collaudo PO «i numeri escono fuori dai bordi!»] 4° arg opzionale: il numero di maglia è DIPINTO nella texture del dorso (per costruzione non può uscire dalla sagoma e si deforma con la skinning) — via il piano flottante 0.52 solo-yaw che sbordava dal busto. Mappatura UV EMPIRICA di Ch38_Shirt (metodo 7.32.7, probe uvnum75): dorso = U [0.46..0.63] con centro-spina a x=288/512 · scapole a y=128/512 · campionamento V FLIPPATO (flipY: il glifo va disegnato specchiato in verticale per uscire dritto). */
  /* [7.168.0 collaudo PO «maglie più moderne anche nel live match»] +pat 'solid': anche i kit tinta unita passano
     per la texture (darkening 7.8.2 BAKATO nella base, identico al vecchio material-color) e TUTTI i kit ricevono
     uno shading tessuto verticale (luce sul petto → ombra all'orlo) → profondità da broadcast, zero flat. */
  if(typeof document==='undefined'||typeof THREE==='undefined'||(pat!=='hoops'&&pat!=='stripes'&&pat!=='stripesw'&&pat!=='band'&&pat!=='vband'&&pat!=='solid'))return null;
  const key=shirt+'|'+c2+'|'+pat+(num!=null?'|#'+num:'');if(_kitTexCache[key])return _kitTexCache[key];
  const S=512,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d');
  let _base=shirt;
  if(pat==='solid'){try{const _c=new THREE.Color(shirt),_h={};_c.getHSL(_h);const _dim=1-_h.s*0.60*(0.45+0.55*(1-_h.l));_base='#'+_c.multiplyScalar(_dim).getHexString();}catch(_e){}}
  x.fillStyle=_base;x.fillRect(0,0,S,S);
  if(pat==='stripes'){x.fillStyle=c2;const n=16,w=S/n;for(let i=1;i<n;i+=2)x.fillRect(Math.round(i*w),0,Math.ceil(w),S);}
  else if(pat==='stripesw'){/* [7.328.0 collaudo PO «PSG a strisce verticali larghe blu e rosso»] stesse colonne
    della griglia 16 PROVATA sulle UV CH38 (7.8.2: a bassa frequenza le strisce collassano), ma riempite a COPPIE
    → 4 barre c2 larghe il doppio, alternate al fondo. Stessa mappatura pulita, lettura «larga». */
    x.fillStyle=c2;const n=16,w=S/n;for(let i=3;i<n;i+=4){x.fillRect(Math.round(i*w),0,Math.ceil(w*2),S);}
    /* fase i=3 (non 1): il centro-petto delle UV CH38 sta nella colonna 2 (U~0.156, misura vband 7.280.0) —
       con la fase 1 il petto cadeva DENTRO la barra c2 e la maglia leggeva del colore sbagliato */}
  else if(pat==='vband'){/* [7.280.0 collaudo PO «la maglia dell'Ajax deve essere con la striscia verticale rossa larga come nella realtà»]
    FASCIA VERTICALE CENTRALE. Il fondo prende il colore SECONDARIO e la banda il colore sociale. L'ancora non
    poteva essere indovinata: il numero sul dorso sta a U~0.5625 (7.260.0) ma il PETTO non era mai stato mappato.
    Misurato con la sonda `kit-uv-front-probe` (16 colonne numerate, ripresa frontale): il centro del petto cade
    nella colonna 2/16, cioè U~0.156 → banda x 0.105..0.21 di 512. Larga come quella vera, non un filo. */
    x.fillStyle=c2;x.fillRect(0,0,S,S);
    x.fillStyle=shirt;x.fillRect(Math.round(S*0.105),0,Math.round(S*0.105),S);
    /* la fascia vera prosegue sul DORSO: ancora nota (centro-spina U 0.5625, la stessa del numero) → il numero
       finisce dentro la banda, bianco su rosso, come sulla maglia reale. */
    x.fillRect(Math.round(S*0.5625-S*0.0525),0,Math.round(S*0.105),S);}
  else if(pat==='band'){/* [7.155.0] fascia orizzontale sul petto (Sampdoria): bianca, centro c2, bordi neri */
    const y0=Math.round(S*0.40),bh=Math.round(S*0.18);
    x.fillStyle='#f4f4f4';x.fillRect(0,y0,S,bh);
    x.fillStyle='#111';x.fillRect(0,y0,S,Math.round(S*0.012));x.fillRect(0,y0+bh-Math.round(S*0.012),S,Math.round(S*0.012));
    x.fillStyle=c2;x.fillRect(0,y0+Math.round(bh*0.36),S,Math.round(bh*0.28));}
  else if(pat==='hoops'){x.fillStyle=c2;const n=8,h=S/n;for(let i=1;i<n;i+=2)x.fillRect(0,Math.round(i*h),S,Math.ceil(h));}
  /* [7.169.0 collaudo PO «non tutte le maglie per la stessa texture, rispettare la realtà!»] BUG 7.168.0: il ramo
     finale era un ELSE nudo → anche pat='solid' disegnava le HOOPS (ogni tinta unita usciva a bande bianche).
     Ora hoops è esplicito e 'solid' resta LISCIA (solo base scurita + shading tessuto). */
  {const gr=x.createLinearGradient(0,0,0,S);gr.addColorStop(0,'rgba(255,255,255,0.085)');gr.addColorStop(0.45,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,0.15)');x.fillStyle=gr;x.fillRect(0,0,S,S);}/* [7.168.0] shading tessuto */
  if(num!=null){/* [7.260.0] numero sul dorso: centro-spina (288,128) verificato con screenshot, flip verticale (flipY), fit-to-width per i 2 cifre */
    const _ns=String(num);x.save();x.translate(288,128);x.scale(1,-1);
    let _fs=64;x.font='bold '+_fs+'px Arial, sans-serif';while(_fs>40&&x.measureText(_ns).width>82){_fs-=4;x.font='bold '+_fs+'px Arial, sans-serif';}
    x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=8;x.strokeStyle='rgba(10,12,18,0.92)';x.strokeText(_ns,0,0);x.fillStyle='#ffffff';x.fillText(_ns,0,0);x.restore();}
  const t=new THREE.CanvasTexture(cv);t.needsUpdate=true;t.anisotropy=4;_kitTexCache[key]=t;return t;
};
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){window.__CPM_kitPatternTex=kitPatternTex;}// [7.260.0] hook probe numeri maglia (test-only)
/* [6.2.0 KIT-1] GUARDAROBA DIVISE PER CLUB (direttiva PO: identita cromatica per club, mai azzurro di default).
   Tre divise deterministiche dai colori sociali (zero campi save): Home = colori sociali; Away = seconda maglia
   di IDENTITA (c2 se leggibile contro la Home, altrimenti neutro chiaro/scuro VELATO del colore sociale, sfumatura
   unica per club); Third = tinta di carattere dalla palette, stabile per club (hash su id), mai in conflitto con Home/Away. */
const KIT_PALETTE=['#f6c90e','#ff7a1a','#7c3aed','#84cc16','#e91e63','#16a34a','#7f1d1d','#0b2e6b','#f5efe0','#243b2f','#c2410c','#94a3b8','#4a044e'];
const _mixHex=(a,b,t)=>{const A=hexToRgb(a),B=hexToRgb(b),c=v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0');return '#'+c(A.r+(B.r-A.r)*t)+c(A.g+(B.g-A.g)*t)+c(A.b+(B.b-A.b)*t);};
const clubKits=(club)=>{
  const c=(club&&club.c)||'#2563eb',c2=(club&&club.c2)||'#ffffff',key=String((club&&(club.id||club.n))||c);
  const _neu=hexLum(c)<0.5?'#f2f1ec':'#15151c';
  const _awT=0.08+(hashStr(key+':aw')%5)*0.02; /* velatura hash-variata: club con gli stessi colori sociali → sfumature diverse */
  let awayShirt=(c2&&!kitsClash(c,c2)&&colorDist(c,c2)>=120)?((_satOf(c2)<0.2&&!kitsClash(c,_mixHex(c2,c,_awT)))?_mixHex(c2,c,_awT):c2):_mixHex(_neu,c,_awT+0.06);
  if(kitsClash(c,awayShirt))awayShirt=_mixHex(_neu,c2,0.14);
  if(kitsClash(c,awayShirt))awayShirt=_neu;
  const h0=hashStr(key+':third')%KIT_PALETTE.length;let third=KIT_PALETTE[h0];
  for(let i=0;i<KIT_PALETTE.length;i++){const k=KIT_PALETTE[(h0+i)%KIT_PALETTE.length];if(!kitsClash(c,k)&&!kitsClash(awayShirt,k)){third=k;break;}}
  const _thV=_mixHex(third,c,0.10+(hashStr(key+':veil')%4)*0.025);
  if(!kitsClash(c,_thV)&&!kitsClash(awayShirt,_thV))third=_thV;
  return {home:{shirt:c,accent:c2,name:'Home'},away:{shirt:awayShirt,accent:c,name:'Away'},third:{shirt:third,accent:c2,name:'Third'}};
};
/* Selezione automatica pre-partita: la squadra di casa veste la Home; l ospite la PRIMA divisa del SUO guardaroba
   che non confligge (Home poi Away poi Third: se puo, gioca coi propri colori) — fallback: massimo contrasto. */
/* [7.302.0 collaudo PO «occhio ai colori delle maglie, non devono confondersi le due squadre»]
   COLORE PERCEPITO di una divisa. `kitsClash` confrontava solo il colore BASE, ma in campo il 3D dipinge
   il PATTERN del club (7.8.3): una maglia bianca a strisce NERE (Torino Athletic) non legge bianca — legge
   grigio-scura, e contro un verde bosco scuro (FC Leões) le due squadre si confondono, esattamente come nel
   collaudo. Qui la base viene miscelata con l'accento secondo la copertura reale del motivo, e il risultato
   e' cio' che l'occhio vede a distanza: e' QUELLO che va confrontato. */
const _PAT_COVER={stripes:0.50,hoops:0.46,halves:0.50,band:0.26,vband:0.26,sash:0.22,sleeves:0.24};
const kitPerceived=(hex,c2,pat)=>{try{
  const k=_PAT_COVER[pat||'solid'];if(!k||!c2)return hex;
  const a=hexToRgb(hex),b=hexToRgb(c2);if(!a||!b)return hex;
  const mix=(u,v)=>Math.round(u+(v-u)*k),h2=(v)=>('0'+Math.max(0,Math.min(255,v)).toString(16)).slice(-2);
  return '#'+h2(mix(a.r,b.r))+h2(mix(a.g,b.g))+h2(mix(a.b,b.b));
}catch(_e){return hex;}};
const selectMatchKits=(homeClub,awayClub)=>{
  const hk=clubKits(homeClub),ak=clubKits(awayClub),homeShirt=hk.home.shirt;
  /* [7.302.0] la lista d'emergenza non e' piu' UNA sola divisa neutra: dopo Home/Away/Third arrivano il
     bianco, il quasi-nero e l'intera KIT_PALETTE a tinta unita (quindi percepito == base). Cosi' una
     divisa che stacca DAVVERO esiste quasi sempre, invece di ripiegare sul «meno peggio». */
  const _EMG=['#f2f1ec','#15151c'].concat(KIT_PALETTE.filter(c=>c!=='#f5efe0'));
  const cands=[ak.home,ak.away,ak.third].concat(_EMG.map(c=>({shirt:c,accent:c,name:'Third'})));
  /* [7.302.0] il confronto avviene sul colore PERCEPITO: in campo entrambe le squadre indossano il MOTIVO
     del proprio club (7.8.3), quindi e' la miscela base+accento a doversi distinguere, non la sola base.
     La 4a candidata d'emergenza e' a tinta unita per costruzione. */
  const _hp=(typeof kitPatternFor==='function')?kitPatternFor(homeClub):null;
  const _ap=(typeof kitPatternFor==='function')?kitPatternFor(awayClub):null;
  const homePerc=kitPerceived(homeShirt,hk.home.accent,_hp);
  const _perc=(k,i)=>kitPerceived(k.shirt,k.accent,i<3?_ap:null);/* le divise d'emergenza sono tinta unita */
  /* [7.302.0] e senza regalare all'ospite un AZZURRO che non e' suo: prima passata escludendo le tinte
     ciano/azzurre non sociali (la vecchia trappola del resolver pre-6.2), seconda passata senza vincolo. */
  const _cyan=(h)=>{try{const H=_hueOf(h);return H>=168&&H<=215&&_satOf(h)>0.3;}catch(_e){return false;}};
  const _awayIsCyan=_cyan(awayClub&&awayClub.c)||_cyan(awayClub&&awayClub.c2);
  let pick=cands.find((k,i)=>!kitsClash(homePerc,_perc(k,i))&&(_awayIsCyan||!_cyan(k.shirt)));
  if(!pick)pick=cands.find((k,i)=>!kitsClash(homePerc,_perc(k,i)));
  if(!pick)pick=cands.reduce((b,k,i)=>colorDist(homePerc,_perc(k,i))>colorDist(homePerc,_perc(b,cands.indexOf(b)))?k:b,cands[0]);
  return {homeShirt,homeAccent:hk.home.accent,awayShirt:pick.shirt,awayAccent:pick.accent,awayKitName:pick.name};
};
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){window.__CPM_clubKits=clubKits;window.__CPM_kitSel=selectMatchKits;window.__CPM_kitsClash=kitsClash;/* [7.192.0] predicato esposto alla probe divise */}
// 3D-VARIETY (Step B): aspetto deterministico per giocatore (CH38 consente altezza/corporatura/pelle/capelli/calvizie).
// I toni pelle/capelli MOLTIPLICANO la texture reale del modello → restano plausibili.
// toni MOLTIPLICATIVI vicini al bianco (la texture CH38 ha già un incarnato): variazione sottile, non scurire troppo (evita "tutti neri").
const SKIN_TONES=['#fff2e8','#ffe9d8','#f7dcc4','#eccdb0','#dcb896','#c9a07c','#b08862'];
const HAIR_COLS=['#1a1410','#2e2018','#4a3220','#6b4a28','#9a7034','#c9a86a','#2b2b2b','#9a9a9a'];
// mixer intero con avalanche (seed adiacenti → output ben distribuiti, evita i bucket collassati di DJB2+modulo).
const _mix32=x=>{x=(x>>>0);x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return x>>>0;};
// da un seed intero stabile → caratteristiche fisiche immutabili (stesso seed = stesso aspetto, sempre). Ogni attributo da un mix indipendente (salt) → decorrelati.
const appearanceFromSeed=seed=>{const s=(seed>>>0),r=salt=>_mix32(s+Math.imul(salt,0x9e3779b9))/4294967296;
  return{height:1.82+r(1)*0.24,girth:0.93+r(2)*0.16,skin:SKIN_TONES[_mix32(s+Math.imul(3,0x9e3779b9))%SKIN_TONES.length],hair:HAIR_COLS[_mix32(s+Math.imul(4,0x9e3779b9))%HAIR_COLS.length],bald:r(5)<0.13};};

/* Sprint 33 C5 — contextual situation selection weighted by player stats */
/* [7.204.0] esposto alla probe di continuità territoriale (test-only, spento nella build store) */
function selectContextualSituations(all,numHL,player,seed,opts){
  var scoreCtx=opts&&opts.scoreCtx||"drawing";
  var clockCtx=opts&&opts.clock||0;
  var stats=player.stats||{};
  var ovr=player.ovr||60;
  var tiro=stats.tiro||60;
  var fisico=stats.fisico||60;
  var passaggio=stats.passaggio||60;
  var velocita=stats["velocità"]||60;
  var _oppId=opts&&opts.opponentId||null;
  var _wxFx=(opts&&opts.weatherFx)||null;/* [7.117.0] pitchFx del meteo → gate is_wet */
  var _oppRed=(opts&&opts.oppRed)||false;/* [7.117.0] espulsione avversaria in corso → gate is_opp_red */
  // [5.79.0 SIT-1/5] contesto VIVO: momentum/possesso pesano la selezione; ctx e finestre temporali
  //   (tactic.minClock/maxClock) sono FILTRI DURI → una sit incoerente non può più essere pescata
  //   (prima il mismatch veniva scoperto solo al trigger e l'highlight andava perso).
  var _mom=opts&&opts.momentum!=null?opts.momentum:50;
  var _poss=opts&&opts.possession!=null?opts.possession:50;
  var _excl=(opts&&opts.exclude)||[];
  var _ballX=(opts&&opts.ballX!=null)?opts.ballX:null;/* [7.204.0] dove si è fermato il gioco (0-100): pesa la continuità territoriale */
  var pool=all.filter(function(sit){
    if(sit.ctx==="losing"&&scoreCtx!=="losing")return false;
    if(sit.ctx==="winning"&&scoreCtx!=="winning")return false;
    var _tc=sit.tactic||{};
    if(_tc.minClock&&clockCtx<_tc.minClock)return false;
    if(_tc.maxClock&&clockCtx>_tc.maxClock)return false;
    if(_excl.indexOf(sit.text)>=0)return false;// niente ripetizioni nella stessa partita
    // Ex-club situation: mostra solo se l'avversario è realmente un ex club
    if(sit.ctx==="is_ex_club"){
      if(!_oppId)return false;
      return (player.history||[]).some(function(h){return h.clubId===_oppId||h.club===_oppId;});
    }
    // [7.116.0] Derby situation: solo se la gara è un DERBY REALE (isDerby club↔avversario)
    if(sit.ctx==="is_derby"){
      if(!_oppId||typeof isDerby!=="function")return false;
      return !!isDerby(player.club&&player.club.id,_oppId);
    }
    // [7.117.0] Meteo: la sit «campo pesante/pioggia» appare SOLO col campo bagnato (pitchFx rain/snow)
    if(sit.ctx==="is_wet"){
      return _wxFx==="rain"||_wxFx==="snow";
    }
    // [7.117.0] Uomo in più: la sit «superiorità numerica» appare SOLO dopo un'espulsione avversaria REALE
    if(sit.ctx==="is_opp_red"){
      return !!_oppRed;
    }
    return true;
  }).map(function(sit){
    var t=sit.type||"off";
    var w=10;
    if(t==="def")w=fisico>=70?13:fisico>=55?9:6;
    if(t==="special")w=ovr>=78?16:ovr>=68?9:4;
    if(t==="off"){
      var hasTiro=sit.actions.some(function(a){return a.stat==="tiro";});
      var hasPass=sit.actions.some(function(a){return a.stat==="passaggio";});
      var hasVel=sit.actions.some(function(a){return a.stat==="velocità";});
      if(hasTiro)w=Math.round(w*(0.5+tiro/120));
      else if(hasPass)w=Math.round(w*(0.5+passaggio/120));
      else if(hasVel)w=Math.round(w*(0.5+velocita/120));
    }
    // Sprint 78 — score context weighting
    if(scoreCtx==="losing"){
      if(t==="off")w=Math.round(w*1.35);
      if(t==="def")w=Math.round(w*0.70);
    }else if(scoreCtx==="winning"){
      if(t==="def")w=Math.round(w*1.20);
      if(t==="special")w=Math.round(w*0.80);
    }
    // Late-game boost for area/bordo situations
    if(clockCtx>=70&&t==="off"){
      var hasArea=sit.zones&&(sit.zones.indexOf("area")>=0||sit.zones.indexOf("bordo")>=0);
      if(hasArea)w=Math.round(w*1.25);
    }
    // [5.79.0 SIT-1] momentum/possesso come ATTUATORI della selezione: chi domina vive momenti offensivi
    //   e avanzati, chi soffre vive più difesa/transizione — l'highlight nasce dallo stato della partita.
    if(_mom>=65){if(t==="off")w=Math.round(w*1.25);if(t==="def")w=Math.round(w*0.65);}
    else if(_mom<=35){if(t==="def")w=Math.round(w*1.6);if(t==="off")w=Math.round(w*0.8);}
    if(_poss>=62&&t==="off")w=Math.round(w*1.1);
    else if(_poss<=38&&t==="def")w=Math.round(w*1.25);
    /* [7.204.0 direttiva PO «sembra davvero una partita di calcio»] LA SELEZIONE GUARDA ANCHE DOV'È IL PALLONE.
       Il picker conosceva punteggio, minuto, momentum e possesso — ma NON la posizione reale della palla: il
       momento successivo poteva quindi nascere sessanta metri più in là di dove l'azione precedente era appena
       finita, e la continuità (che riposiziona eroe e pallone sulla startZone della nuova situation) doveva
       coprire un salto di mezzo campo. Ora la distanza fra il punto in cui il gioco si è fermato e il punto in
       cui la situation COMINCIA pesa sulla selezione: preferenza MORBIDA (×1.55 se l'azione riprende lì vicino,
       fino a ×0.55 se è dall'altra parte del campo), mai un filtro — le transizioni lunghe esistono nel calcio
       (una ripartenza copre il campo), devono solo smettere di essere la norma. */
    if(_ballX!=null&&sit.startZone&&sit.startZone.x){
      var _szc=(sit.startZone.x[0]+sit.startZone.x[1])/2;
      var _gap=Math.abs(_szc-_ballX);
      w=Math.round(w*clamp(1.55-_gap*0.022,0.55,1.55));
    }
    return{sit:sit,w:Math.max(1,w)};
  });
  var result=[];var remaining=pool.slice();var s=seed;
  for(var i=0;i<numHL&&remaining.length>0;i++){
    var total=0;for(var j=0;j<remaining.length;j++)total+=remaining[j].w;
    s=((s*1664525+1013904223)&0x7fffffff);
    var r=((s%total)+total)%total;
    var acc=0;var picked=0;
    for(var k=0;k<remaining.length;k++){acc+=remaining[k].w;if(r<acc){picked=k;break;}}
    result.push(remaining[picked].sit);
    remaining.splice(picked,1);
  }
  return result;
}
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){try{window.__CPM_SELECT=selectContextualSituations;}catch(_e){}}
/* ========================================
   LIVE MATCH  (req #3,#4,#5,#6,#8)
======================================== */
// Sprint 34 — istruzioni tattiche mid-match (2 momenti: ~28' e ~63')
// Ordini del mister — ogni voce ha effetti reali: bonus azioni, delta possesso, delta momentum, preset formazione NPC
/* ⚠️ [7.788.0 — IL MISTER NON RIPETE LE STESSE PAROLE. Collaudo PO: «le indicazioni del mister sono
   collegate con le azioni? … devono essere davvero indicazioni utili e non ripetitive».
   MISURATO su tre partite intere (56 voci di panchina, 18,7 a partita): il COLLEGAMENTO c'e' ed e'
   solido — la sequenza lo mostra da sola, 43' sotto 0-1 «un gol e torniamo in gioco», 61' sotto 0-2
   «tutti avanti», 86' sotto 1-2 «cinque minuti, tutti in attacco», 86' avanti 3-2 «chiudi gli spazi,
   un gol subito adesso e' un disastro». Ma le voci DIVERSE erano solo il 54% (30 su 56), e la peggiore
   — «Recuperate palla alta» — usciva SEI volte, di cui QUATTRO nella stessa partita.
   La causa e' qui: ogni ordine aveva UNA sola frase. La decisione tattica giusta si ripresenta spesso
   (il punteggio resta quello, il momentum pure), e con una frase sola il mister sembra un disco.
   Ora ogni ordine ha un ventaglio `alt` di formulazioni: la DECISIONE non cambia di una virgola —
   stesso ordine, stesso bonus, stesso drift, stesso collegamento allo stato — cambiano le parole, e si
   scelgono col seme del minuto (deterministico: due partite con lo stesso seme restano identiche).
   Rosso __CPM_NO788C. */
const COACH_ORDERS={
  pressing:  {e:"🔴",txt:"Pressing alto",    ctx:"Recuperate palla alta, non lasciate costruire. Intensità massima.",  bonus:0.07,poss:-3,mom:9, drift:"midfield",alt:["Addosso a loro, non li fate ragionare. Palla alta, subito.","Aggredite la prima costruzione: il primo passaggio non deve partire."]},
  possesso:  {e:"🔵",txt:"Tieni palla",      ctx:"Rallenta, costruisci dal basso. Non regalare nulla.",                bonus:0.04,poss:8, mom:-3,drift:"midfield",alt:["Facciamola girare. Nessuna verticale forzata, aspettiamo il varco.","Palla a terra e pazienza: chi corre dietro si stanca prima."]},
  verticale: {e:"⚡",txt:"Gioco verticale",  ctx:"Cerca subito la profondità. L'attaccante è libero.",                bonus:0.09,poss:-4,mom:7, drift:"attack",alt:["Appena vedete lo spazio, dentro. Niente giri inutili.","Prima palla in avanti: l’attaccante parte, cercatelo."]},
  all_in:    {e:"⚔️",txt:"Attacco totale",   ctx:"Tutti avanti. Il pareggio non serve — vuoi i 3 punti.",             bonus:0.11,poss:-7,mom:14,drift:"attack_goal",alt:["Non ci interessa il pareggio. Salite tutti, si vince o si perde.","Ultimo assalto: portiere a parte, voglio tutti dall’altra parte."]},
  consolida: {e:"🔒",txt:"Consolida",        ctx:"Chiudi gli spazi, non rischiare. Un gol subito adesso è un disastro.", bonus:0.03,poss:8,mom:-6,drift:"retreat",alt:["Da adesso zero rischi. Compatti, e la palla lontano dalla nostra area.","Difesa stretta e nessuna giocata di fantasia dietro. Reggiamo."]},
  cerca_gol: {e:"🎯",txt:"Cerca il gol",     ctx:"Un gol e torniamo in gioco. Muoviti nelle zone giuste.",            bonus:0.10,poss:-5,mom:11,drift:"attack_goal",alt:["Serve un gol per rientrarci: occupate l’area, qualcuno la tocca.","Alzate il baricentro, cercate l’uomo in area. Ci serve adesso."]},
  cavalca:   {e:"🔥",txt:"Cavalca il momento",ctx:"Stiamo dominando. Continua così, hai l'uomo libero.",              bonus:0.12,poss:3, mom:8, drift:"attack",alt:["Li abbiamo in pugno: insistete finche’ sono in difficolta’.","Non mollate ora, sono lunghi: c’e’ spazio fra le linee."]},
  intelligente:{e:"🧠",txt:"Gioca intelligente",ctx:"Sei stanco, lo vedo. Scegli il momento giusto — non sprecare.",  bonus:0.05,poss:4, mom:0, drift:"midfield",alt:["Le gambe sono pesanti: scegliete la giocata semplice, non forzate.","Risparmiate energie, giocate corto e alzate la testa prima di correre."]},
  rimonta:   {e:"🚨",txt:"ORA O MAI PIÙ",    ctx:"Mancano pochi minuti. Dimentica la tattica — VAI e non tornare.",  bonus:0.14,poss:-8,mom:18,drift:"attack_goal",alt:["Non c’e’ piu’ tempo per la tattica: dentro l’area e crederci.","Tutto quello che avete, adesso. Non guardate indietro."]},
  gestisci_1:{e:"🛡️",txt:"Gestisci il vantaggio",ctx:"Un gol di vantaggio. Tienilo. Spazio zero agli avversari.",   bonus:0.04,poss:6, mom:-4,drift:"retreat",alt:["Un gol basta: teniamolo. Nessuna palla persa a meta’ campo.","Vantaggio in cassaforte: linee corte e niente regali."]},
  urgenza_75: {e:"⏱️",txt:"Ultima mezzora",     ctx:"Siamo al 75'. Da adesso ogni pallone conta doppio.",          bonus:0.08,poss:-3,mom:12,drift:"attack",alt:["Ultimo quarto d’ora: ogni contrasto vale doppio, svegliatevi.","Da qui alla fine si decide tutto. Concentrazione su ogni pallone."]},
  blocca_ora: {e:"🛑",txt:"Blocca il risultato",ctx:"Non regalare niente. Difendi compatti, poi riparti.",          bonus:0.03,poss:5, mom:-3,drift:"retreat",alt:["Compatti e ripartenza: non concediamo un centimetro.","Difendiamo bene e aspettiamo il loro errore. Nessuna fretta."]},
  assalto_85: {e:"🚨",txt:"ASSALTO FINALE",     ctx:"Cinque minuti. Tutti in attacco. Non tornare — vai!",         bonus:0.16,poss:-9,mom:22,drift:"attack_goal",alt:["Cinque minuti: dentro tutto quello che avete, non si torna.","E’ adesso o mai piu’. Tutti in area, la buttiamo dentro."]},
};
// Scelta intelligente dell'ordine: legge punteggio, tempo rimanente, momentum, stanchezza
/* [7.788.0] LA FORMULAZIONE, non la decisione. `selectCoachOrder` qui sotto sceglie COSA dire (ed e'
   quella collegata a punteggio, tempo, momentum e stanchezza: non si tocca). Questa sceglie CON QUALI
   PAROLE, fra la frase storica dell'ordine e le sue alternative, con un seme deterministico — stesso
   seme, stessa partita, stesse parole: due giri con lo stesso dado restano identici, come pretende il
   gate. Rosso __CPM_NO788C: torna alla frase unica. */
function coachSay(ord,seme){
  try{
    if(!ord)return "";
    if(typeof window!=='undefined'&&window.__CPM_NO788C)return ord.ctx||"";
    const pool=[ord.ctx].concat(ord.alt||[]).filter(Boolean);
    if(pool.length<2)return ord.ctx||"";
    let h=2166136261>>>0;const k=String(seme);
    for(let i=0;i<k.length;i++){h^=k.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
    return pool[h%pool.length];
  }catch(_e788){return (ord&&ord.ctx)||"";}
}
function selectCoachOrder(ck,score,momentum,fatigue){
  var diff=score.home-score.away;
  var tLeft=90-ck;
  var isFirstHalf=ck<46;
  if(diff<=-1&&tLeft<=12)return"rimonta";
  if(diff<=-2)return"all_in";
  if(diff===-1&&!isFirstHalf)return"cerca_gol";
  if(diff>=1&&tLeft<=18)return"gestisci_1";
  if(diff>=2)return"consolida";
  if(diff===0&&tLeft<=18)return"verticale";
  if(momentum>=72)return"cavalca";
  if(momentum<=30)return"pressing";
  if(fatigue>=68)return"intelligente";
  return isFirstHalf?"pressing":"verticale";
}
// MISTER #5 — grida BREVI da bordo campo, sincronizzate alla FASE reale (mai in contraddizione con l'azione).
/* [7.788.0 — I SERBATOI DELLE GRIDA ERANO TROPPO PICCOLI. Collaudo PO: «devono essere davvero
   indicazioni utili e non ripetitive». MISURATO su tre partite intere: 18,7 voci di panchina a
   partita, di cui TREDICI grida brevi e cinque ordini tattici — cioe' il 72% di quello che il mister
   dice sono due parole generiche. Con sette-otto frasi per famiglia e tredici estrazioni a partita, la
   ripetizione e' aritmetica: «Scala!» cinque volte, «Girala!» cinque, «Chiudi!» quattro.
   Qui ogni famiglia raddoppia, e le frasi nuove NOMINANO la situazione invece di limitarsi a un verbo:
   un mister che dice «occhio al taglio dietro» sta dando un'informazione, uno che dice «Chiudi!» sta
   riempiendo un silenzio. La scelta resta agganciata alla fase come prima (costruzione/sviluppo/
   pericolo, turno, momentum, possesso): non cambia CHI parla ne' QUANDO, cambia il ventaglio. */
const COACH_SHOUTS={
  def:["Scala!","Chiudi!","Stringi!","Copri il centro!","Raddoppia!","Attento dietro!","Tieni la linea!","Marca!",
       "Occhio al taglio dietro!","Non farti saltare!","Accorcia sul portatore!","Palla in mezzo, chiudi il corridoio!",
       "Reggi la linea, non scappare!","Tempo sul portatore, non buttarti!","Copri il secondo palo!"],
  off:["Vai sul fondo!","Crossa!","Attacca il primo palo!","Attacca il secondo palo!","Apri il gioco!","Muoviti!","Cerca la profondità!","Vai vai vai!",
       "Taglia dentro, c'è lo spazio!","Uno-due e dentro!","Alza la testa, sei libero!","Il terzino è alto: attaccalo!",
       "Palla dietro al difensore!","Vieni incontro e giragli intorno!","Terzo uomo, entra adesso!"],
  pos:["Calma!","Girala!","Tieni palla!","Cambia lato!","Gioca semplice!","Palla a terra!","Fai girare!",
       "Fai respirare la squadra!","Due tocchi, non uno!","Aspetta il momento, arriva!","Muovi loro, non la palla!",
       "Torna indietro e riparti pulito!","Non forzarla, non c'è!"],
  fin_hold:["Difendiamo!","Tutti dietro!","Restiamo concentrati!","Gestiamola!","Non rischiare!","Palla lontana!",
            "Fallo tattico se serve!","Porta via il tempo sulla rimessa!","Nessuno si allunghi adesso!","Palla in tribuna, senza pensarci!"],
  fin_push:["Pressa!","Tutti avanti!","Buttala dentro!","Non molliamo!","Dai che ci siamo!","Ancora!",
            "Palla in mezzo, qualcuno la tocca!","Anche il portiere sul corner!","Seconda palla, siate pronti!","Non uscire dall'area, restaci!"],
  fin_neutral:["Restiamo concentrati!","Massima attenzione!","Ci siamo, dai!","Ultimo sforzo!","Testa alta!",
               "Il prossimo pallone decide!","Nessun errore banale adesso!","Reggiamo e poi ripartiamo!"],
};
// fase derivata da: minuto+punteggio (finale) → tattica/possesso/momentum (offensiva/difensiva/possesso). style allenatore = bias leggero.
/* [7.542.0 collaudo PO «le indicazioni del mister sono senza senso e scollegate dalla dinamica della
   partita»] IL MISTER LEGGEVA LA STATISTICA, NON LA PARTITA. `poss` qui e' `possessionRef`, cioe' la
   percentuale CUMULATIVA che sta nella barra in alto: si muove di un punto ogni tanto e resta li'.
   Quindi la panchina gridava «Vai sul fondo! Crossa!» perche' NEL COMPLESSO della partita avevamo il 59%
   di possesso, mentre in quel momento il pallone era nella nostra area — e viceversa. E' esattamente il
   difetto tolto alla trama nel 7.532 («`possession>=50` e' la STATISTICA cumulativa — ora il drift
   consuma il TURNO»): la voce del mister non era mai stata aggiornata e leggeva ancora il numero
   sbagliato. Ora consuma i due fatti VERI che la cronaca usa da tre release — `turno` (chi ha la palla
   adesso) e `fase` (dove sta la palla adesso, gia' corretta per il lato) — e la statistica resta il
   ripiego per i percorsi che quei due non li hanno. Il vocabolario non cambia: erano le frasi giuste
   scelte col criterio sbagliato. Rosso `__CPM_NO562`. */
function pickCoachShout(ck,diff,momentum,poss,driftKey,style,last,turno,fase){
  const tLeft=90-ck;let pool;
  const _vivo=(typeof window==='undefined'||!window.__CPM_NO562)&&(turno===1||turno===-1)&&!!fase;
  if(tLeft<=10){pool=diff>=1?COACH_SHOUTS.fin_hold:diff<=-1?COACH_SHOUTS.fin_push:COACH_SHOUTS.fin_neutral;}
  else if(_vivo){
    /* la palla e' NOSTRA o LORO, e sta in costruzione / sviluppo / pericolo: sei combinazioni, tre voci.
       Loro in pericolo = stanno arrivando, si copre; noi in pericolo = siamo in area, si attacca;
       a meta' campo si palleggia, con chi non ha la palla che stringe. */
    const _nostra=(turno===1);
    if(fase==="pericolo")pool=_nostra?COACH_SHOUTS.off:COACH_SHOUTS.def;
    else if(fase==="sviluppo")pool=_nostra?COACH_SHOUTS.off:COACH_SHOUTS.def;
    else pool=_nostra?COACH_SHOUTS.pos:COACH_SHOUTS.def;
    if(style==="Difensivo"&&pool===COACH_SHOUTS.pos)pool=COACH_SHOUTS.def;
    if(style==="Offensivo"&&pool===COACH_SHOUTS.pos)pool=COACH_SHOUTS.off;
  }
  else{
    let att=driftKey==="attack"||driftKey==="attack_goal"||poss>=58||momentum>=64;
    let def=driftKey==="retreat"||driftKey==="defend_goal"||poss<=42||momentum<=36;
    if(style==="Difensivo"&&!att)def=true;if(style==="Offensivo"&&!def)att=true;// bias leggero per stile
    pool=def?COACH_SHOUTS.def:att?COACH_SHOUTS.off:COACH_SHOUTS.pos;
  }
  let s=pick(pool),tries=0;while(s===last&&tries<5){s=pick(pool);tries++;}return s;
}
const SUB_EVENTS=[
  {txt:"🔄 Cambio tattico: entra un compagno con energia fresca!",energy:15,mom:6},
  {txt:"💪 Il mister ti carica: alza il ritmo, è il tuo momento!",energy:8,mom:10},
  {txt:"🎯 Modulo più offensivo nel finale — liberi di attaccare.",energy:5,mom:12},
  {txt:"⏱️ Un compagno esce infortunato — il gruppo si compatta.",energy:0,mom:8},
];
// Sprint 77 — Situation Chaining: dedicated follow-up situations after successful assists
const CHAIN_SITS={
  header:S("✈️ Cross in area! Attacca il secondo palo.",["area"],{x:[78,96],y:[20,80]},{x:[80,90],y:[28,72]},[
    A("✈️ Colpo di testa","fisico",8,"goal","miss",14),
    A("🦵 Tiro di prima","tiro",-2,"goal","miss",12),
    A("🤝 Sponda per compagno","passaggio",3,"assist","nothing",7)
  ],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:3,lanes:["central_run"],cn:{fpCross:true,fpHeader:true}}),
  mischia:S("🌀 Mischia in area! Approfitta del caos.",["area"],{x:[78,96],y:[26,74]},{x:[80,92],y:[33,67]},[
    A("🦵 Spingila dentro!","tiro",12,"goal","miss",10),
    A("🎯 Controllo e tiro","tecnica",5,"goal","miss",12),
    A("🦶 Zampata da due passi","fisico",8,"goal","miss",12)/* [6.44.0 RC] era "✈️ Di testa" ma la mischia ha bs:"feet" (palla a terra) → filterSitActions scartava SEMPRE l'azione aerea (scelta morta). Sostituita con una conclusione DI PIEDE coerente col caos a terra. */
  ],false,-1,"","off",null,{pressure:"low",support:1,nearby_def:3,lanes:[],bs:"feet"}),
  dopo_dribbling:S("⚡ L'uomo è saltato — campo aperto davanti a te!",["bordo","area"],{x:[74,94],y:[25,75]},{x:[76,86],y:[32,68]},[
    A("💥 Conclusione in corsa","tiro",6,"goal","miss",13),
    A("🌀 Punta il portiere e piazzala","tecnica",2,"goal","miss",15),
    A("↩️ Scarico al compagno libero","passaggio",4,"assist","intercept",8)
  ],false,-1,"","off",null,{pressure:"low",support:1,nearby_def:1,lanes:["central_run"],bs:"feet"}),// [5.90.0 BLK-2] il secondo momento del duello
  /* [7.201.0 direttiva PO «l'utente non deve pensare "questa è un'animazione" ma "sembra davvero una partita
     di calcio"»] LA SPONDA: quando la consegna aerea l'ha messa in mezzo L'EROE STESSO, non può essere lui a
     incornarla (era esattamente ciò che accadeva: cross dell'eroe → `CHAIN_SITS.header` = «Attacca il secondo
     palo» → l'eroe attaccava il proprio cross). Il secondo tempo aereo credibile è la SPONDA: un compagno
     prolunga di testa al primo palo e l'eroe attacca la deviazione sul secondo — la palla è stata toccata da
     un altro, il colpo di testa dell'eroe torna possibile. Niente parole della regex `chainOn` nel testo
     (nessuna catena di catene) + `it`/`bs` espliciti (intento e stato-palla bulletproof, pattern 7.56.0). */
  sponda:S("✈️ Sponda di testa del compagno sul secondo palo — attaccala!",["area"],{x:[80,96],y:[24,80]},{x:[82,92],y:[30,70]},[
    A("✈️ Incornata sul secondo palo","fisico",8,"goal","miss",14),
    A("🦵 Al volo di controbalzo","tiro",-3,"goal","miss",12),
    A("🤝 Rimetti in mezzo per il compagno","passaggio",3,"assist","nothing",7)
  ],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:3,lanes:["central_run"],it:"header",bs:"aerial",cn:{fpHeader:true}}),
  second_ball:S("🎯 Secondo tempo sul rimbalzo — istinto puro!",["bordo","area"],{x:[72,94],y:[22,78]},{x:[74,86],y:[30,70]},[
    A("🦵 Tiro al volo","tiro",4,"goal","miss",15),
    A("🎯 Prima intenzione","tecnica",2,"goal","miss",13),
    A("🏃 Avanza in area","velocità",3,"goal","intercept",12)
  ],false,-1,"","off",null,{pressure:"low",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
};
// Sprint 113 — Post-match coach evaluation text generator
function coachPostMatch(won,drew,goals,assists,rating,opponentPrestige){
  var base="";
  var pR=opponentPrestige||65;
  if(won&&goals>=2)base="Partita dominata! "+goals+" gol — hai dimostrato la tua classe.";
  else if(won&&goals===1&&assists>=1)base="Vittoria meritata. Un gol e un assist: prestazione da leader.";
  else if(won)base=goals===0&&assists===0?"Abbiamo vinto ma mi aspetto di più da te. Sii più decisivo.":"Bravo. Vittoria importante — continuiamo su questa strada.";
  else if(drew&&pR>=80)base="Pari contro una big? Rispetto, ma la vittoria era alla nostra portata.";
  else if(drew)base=goals>=1?"Un punto solo con un tuo gol. Ci è mancato il raddoppio.":"Partita bloccata. Devi trovare soluzioni diverse quando si fatica a segnare.";
  else base=goals>=1?"Sconfitta che brucia. Il tuo gol non è bastato — dobbiamo fare meglio.":"Prestazione sotto le aspettative. Domani in campo — c'è molto su cui lavorare.";
  if(rating>=8.5)return base+" Personalmente sei stato il migliore — prestazione storica.";
  if(rating>=7.5)return base+" La tua valutazione individuale è alta. Così mi piaci.";
  if(rating<5.5)return base+" E la tua performance personale? Devi alzare il livello.";
  return base;
}
// Sprint 118 — bench experience pools
const _BENCH_OBS=[
  "Segui ogni movimento dalla panchina, occhi fissi sul campo.",
  "Il mister ti guarda di tanto in tanto dal bordo del campo.",
  "Ti stai riscaldando mentalmente: ogni pallone lo vivi come se fossi in campo.",
  "I tuoi compagni lottano — tu sei pronto a dare il tuo contributo.",
  "La curva inizia a scandire il tuo nome.",
  "Analizzi gli spazi, stai già ragionando da titolare.",
];
const _BENCH_WARMUP=[
  "Inizi a correre lungo la linea laterale. Il pubblico ti incita.",
  "Il preparatore atletico ti affianca: corsa, scatti, allunghi.",
  "Il mister ti chiama sotto: stai per ricevere le istruzioni.",
];
const _BENCH_ENTRY=[
  `"Entra con personalità. Abbiamo bisogno di te." — Mister`,
  `"Hai 30 minuti per fare la differenza. Spacca tutto." — Mister`,
  `"Porta energia. Corri su ogni pallone." — Mister`,
  `"Fai quello che sai fare. Ti sei allenato bene." — Mister`,
  `"Mostra di cosa sei capace. È il tuo momento." — Mister`,
];
class MatchErrorBoundary extends React.Component{
  constructor(p){super(p);this.state={err:null,info:null};}
  static getDerivedStateFromError(err){return{err};}
  componentDidCatch(err,info){this.setState({err,info});}
  render(){
    if(this.state.err){
      const msg=this.state.err?.message||String(this.state.err);
      const stack=(this.state.info?.componentStack||"").slice(0,600);
      return<div style={{padding:20,background:"#1e0a0a",color:"#fca5a5",fontFamily:"monospace",fontSize:12,borderRadius:12,margin:12,border:"1px solid #dc2626"}}>
        <div style={{fontWeight:900,fontSize:16,marginBottom:8}}>💥 ERRORE LiveMatch</div>
        <div style={{background:"#0f0707",padding:10,borderRadius:8,marginBottom:8,wordBreak:"break-all",color:"#f87171"}}>{msg}</div>
        {stack&&<div style={{background:"#0f0707",padding:10,borderRadius:8,fontSize:10,color:"#9ca3af",whiteSpace:"pre-wrap"}}>{stack}</div>}
        <button onClick={()=>this.setState({err:null,info:null})} style={{marginTop:12,padding:"6px 16px",background:"#dc2626",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700}}>↩ Riprova</button>
      </div>;
    }
    return this.props.children;
  }
}
