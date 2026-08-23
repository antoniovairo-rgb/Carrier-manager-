/* ========================================================================
 * KORWARD ELITE — frammento n° 01  (dei 20, numerati da 00 a 19)
 * src/01-bootstrap-tema-avatar.jsx
 *
 * BOOTSTRAP · TEMA · AVATAR
 *
 * Alias React/THREE, i flag di test da querystring (_SIT_TEST, _CPM_TEST, _CPM_*),
 * la tavolozza TH + TH_DARK/TH_LIGHT, i token FS/FW/SP/RAD/MO, il catalogo AVATARS
 * e i volti NPC, i componenti AvatarSVG / NpcFace / NpcFaceCoach / AvatarPhoto /
 * Player3DViewer, EmoText, TeamBadge e le utility di nome/cognome.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 278-739   ·   462 righe di 41427
 * La prima riga dopo questa intestazione è la riga 278 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 253 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
const React=window.React;const ReactDOM=window.ReactDOM;const THREE=window.THREE;
const{useState,useEffect,useRef,useCallback}=React;
const _SIT_TEST=(typeof window!=='undefined')&&!window.__CPM_STORE_BUILD&&/[?&]sit=\d/.test((window.location&&window.location.search)||"");// [5.85.0 ARC-5] test-mode SPENTO nella build store// 5.43.1 Situation Test Mode: blocca la fine-partita così il match resta vivo nell'highlight forzato (mai attivo in gioco normale)
const _CPM_TEST=(typeof window!=='undefined')&&!window.__CPM_STORE_BUILD&&/[?&]cpmtest=1\b/.test((window.location&&window.location.search)||"");// [5.85.0 ARC-5]// gate visivo (?cpmtest=1): il gate forza le situation e valida l'AI off-ball → il read-freeze d'avvio highlight (presentazione) è disattivato qui per non mascherare la liveness; in gioco normale è attivo.
// Polish P1 (5.55.0): guardia pallonetto — il motore non deve rendere un scavetto sopra un portiere FERMO
//   (coerente solo in 1v1 / uscita GK o se il giocatore lo sceglie esplicitamente). Default ON; ?cpmchip=0 lo spegne.
const _CPM_CHIP_GUARD=!((typeof window!=='undefined')&&/[?&]cpmchip=0\b/.test((window.location&&window.location.search)||""));
// Polish P2 (5.55.0): anti foot-slide — oltre la saturazione del blend di corsa, la cadenza del passo GLB
//   continua a salire con la velocità reale (in conduzione veloce i piedi non "pattinano"). GLB-only, bounded. ?cpmcarry=0 lo spegne.
const _CPM_CARRY=!((typeof window!=='undefined')&&/[?&]cpmcarry=0\b/.test((window.location&&window.location.search)||""));
// cpmadapt (5.58.0): IA off-ball ADATTIVA — la difesa "si aspetta" lo schema ripetuto e ombreggia verso la fascia più
//   attaccata dall'Eroe (Manifesto Cap.4.12). Sottile, deterministico, bounded (±4u di y). Default ON; ?cpmadapt=0 lo spegne.
const _CPM_ADAPT=!((typeof window!=='undefined')&&/[?&]cpmadapt=0\b/.test((window.location&&window.location.search)||""));
// cpmface (5.60.0): ammorbidisce il VOLTO CH38 — riduce il rilievo del normal map (fronte corrucciata) e alza il floor
//   di luce (ombre meno dure) → il volto scansionato sembra meno "arrabbiato/severo". L'espressione dipinta è bakata
//   e NON modificabile a runtime (0 morph target); questo agisce solo su rilievo/ombre. Default ON; ?cpmface=0 lo spegne.
const _CPM_FACESOFT=!((typeof window!=='undefined')&&/[?&]cpmface=0\b/.test((window.location&&window.location.search)||""));
// cpmstage (5.61.0): STAGING del PRIMO POSIZIONAMENTO degli highlight — all'avvio di un HL la scena deve MOSTRARE i
//   giocatori che l'azione presuppone (un compagno avanti per i lanci; un avversario portatore + un compagno vicino
//   per i raddoppi difensivi) invece di lasciare l'Eroe solo. Deterministico, bounded, solo durante l'HL. ?cpmstage=0 spegne.
const _CPM_STAGE=!((typeof window!=='undefined')&&/[?&]cpmstage=0\b/.test((window.location&&window.location.search)||""));
// cpmidle (5.63.0): l'EROE da fermo (senza palla) deve stare in POSIZIONE D'ATTESA, non "palleggiare". La clip idle GLB anima
//   molto gambe/piedi → a fermo legge come palleggio; qui la rallentiamo (weight-shift calmo) + dead-zone sulla velocità
//   (il micro-jitter del target non fa più entrare la corsa "marcia sul posto"). ?cpmidle=0 spegne.
const _CPM_IDLE=!((typeof window!=='undefined')&&/[?&]cpmidle=0\b/.test((window.location&&window.location.search)||""));

// [5.94.0 ARC-1b] VISUAL-TEST DETERMINISM senza monkey-patch: Math.random NON viene più sostituito.
//   Il determinismo del setup è ora una proprietà del CODICE DI GIOCO — i core helper rng/pick/wPick
//   usano uno stream interno seedabile (definito accanto a loro, stessa formula mulberry32) pilotato da
//   __CPM_RESEED. Se una regressione introduce Math.random() nudo nel setup path, il check `determinism`
//   del gate ora FALLISCE (prima il patch globale lo mascherava → check tautologico, audit ARC-1).
//   Qui solo un buffer pre-boot per chi chiama __CPM_RESEED prima del game code.
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD&&/[?&]cpmtest=1\b/.test(window.location.search||"")){
  window.__CPM_RESEED=function(n){window.__CPM_RESEED_PENDING=n;};
  window.__CPM_FROZEN=false; // il render loop del match usa dt=0 quando true → frame statico deterministico
}

/* ========================================
   LIGHT THEME  (req #1)
======================================== */
let TH = {
  bg:"#f0f7ff", bgGrad:"linear-gradient(160deg,#e8f4fd 0%,#f0faf4 100%)",
  card:"#ffffff", cardBorder:"#dde6f0", shadow:"0 2px 12px rgba(0,0,0,0.07)",
  text:"#1e293b", muted:"#64748b", faint:"#94a3b8",
  primary:"#8e1f33", primaryDk:"#6a1326",
  success:"#16a34a", danger:"#dc2626", warning:"#d97706",
  gold:"#b45309", accent:"#7c3aed",
  navBg:"rgba(255,255,255,0.96)",
  // Sprint D: token semantici per card (light = valori attuali → zero regressione di giorno)
  bgBlue:"#eff6ff", bdBlue:"#bfdbfe", txBlue:"#1e40af",
  bgGreen:"#f0fdf4", bdGreen:"#bbf7d0", txGreen:"#166534",
  bgRed:"#fff1f2", bdRed:"#fecaca", txRed:"#b91c1c",
  bgAmber:"#fef3c7", bdAmber:"#fcd34d", txAmber:"#92400e",
  bgPurple:"#f5f3ff", bdPurple:"#c4b5fd", txPurple:"#7c3aed",
  /* ===== UX/UI OVERHAUL · Design System tokens (FASE 1 · Ondata 1) =====
     Valori LIGHT pinnati all'output attuale → zero regressione visiva il giorno 1.
     Le schermate delle ondate successive consumeranno questi token invece di inventare hex. */
  // Superfici / elevazione / overlay (il backbone dark-theme mancante)
  surface2:"#f4f7fb", surface3:"#ffffff", divider:"#e6edf5", track:"#e2e8f0", scrim:"rgba(15,23,42,0.45)",
  cardBg:"#f4f7fb",  // FIX: TH.cardBg usato (Club tab) ma mai definito → alias di surface2
  border:"#e6edf5",  // FIX: TH.border usato (ProTransition) ma mai definito → alias di divider
  el1:"0 2px 12px rgba(0,0,0,0.07)", el2:"0 4px 16px rgba(0,0,0,0.10)", el3:"0 12px 40px rgba(0,0,0,0.18)",
  // Scala brand (sostituisce il "granata-su-blu" accidentale delle selezioni)
  primaryTint:"#f7e9ec", primaryBorder:"#e3c3cb",
  // Oro metallico trofei (disambiguato da warning)
  goldGrad:"linear-gradient(135deg,#f6c04b,#d4922a)", goldText:"#b45309",
  // Token semantici di dominio (fg/bg/bd)
  winFg:"#15803d", winBg:"#e7f6ec", winBd:"#b7e4c4",
  drawFg:"#a16207", drawBg:"#fbf3dd", drawBd:"#f0dca6",
  lossFg:"#b91c1c", lossBg:"#fbe9e9", lossBd:"#f3c9c9",
  growth:"#16a34a", regression:"#dc2626", energy:"#0284c7",
  injury:"#dc2626", suspension:"#ea580c", record:"#0891b2",
};
const TH_LIGHT_ORIG=Object.freeze({...TH,dk:false}); // snapshot for restoring light theme · [7.178.0] +dk flag
const TH_LIGHT=TH; // alias used for dark-mode shadowing
const TH_DARK={...TH,dk:true,bg:"#0f172a",bgGrad:"linear-gradient(160deg,#0f172a 0%,#0c1428 100%)",card:"#1e293b",cardBorder:"#334155",shadow:"0 2px 12px rgba(0,0,0,0.4)",text:"#f1f5f9",muted:"#94a3b8",faint:"#64748b",navBg:"rgba(15,23,42,0.97)",
  // Sprint D: varianti scure dei token semantici (bg scuro + testo chiaro leggibile)
  bgBlue:"#16233b", bdBlue:"#1e3a5f", txBlue:"#93c5fd",
  bgGreen:"#102b1d", bdGreen:"#1d4d33", txGreen:"#86efac",
  bgRed:"#2c1518", bdRed:"#5b2530", txRed:"#fca5a5",
  bgAmber:"#2a1f0c", bdAmber:"#5a430f", txAmber:"#fcd34d",
  bgPurple:"#1d1733", bdPurple:"#3b2a63", txPurple:"#c4b5fd",
  // UX/UI OVERHAUL · varianti scure dei nuovi token (bg scuri + fg leggibili)
  surface2:"#172033", surface3:"#21304a", divider:"#2c3a52", track:"#2c3a52", scrim:"rgba(0,0,0,0.62)",
  cardBg:"#172033", border:"#2c3a52",
  el1:"0 2px 12px rgba(0,0,0,0.4)", el2:"0 4px 16px rgba(0,0,0,0.5)", el3:"0 12px 48px rgba(0,0,0,0.6)",
  primaryTint:"#2a1620", primaryBorder:"#4a2530",
  goldGrad:"linear-gradient(135deg,#f6c04b,#d4922a)", goldText:"#d4922a",
  winFg:"#4ade80", winBg:"#12321f", winBd:"#1d4d33",
  drawFg:"#fbbf24", drawBg:"#2c2410", drawBd:"#4a3a12",
  lossFg:"#f87171", lossBg:"#331519", lossBd:"#5b2530",
  growth:"#4ade80", regression:"#f87171", energy:"#38bdf8",
  injury:"#f87171", suspension:"#fb923c", record:"#22d3ee"};
/* [7.178.0 RC-15] pastelli semantici theme-aware: i bg chiari hardcoded con testo TH.text erano illeggibili in dark-mode */
const thPastel=(light,darkTint)=>TH.dk?darkTint:light;

/* ===== UX/UI OVERHAUL · scale del Design System (FASE 1) =====
   Token additivi consumati dalle ondate successive; nessun uso qui → zero regressione. */
const FS={caption:11,small:12,body:13,bodyLg:15,subhead:17,title:20,h:24,display:32,displayLg:44,hero:64}; // type scale (floor 11px)
const FW={regular:400,medium:500,semibold:600,bold:700,black:800};                                          // pesi
const SP={xs:4,sm:8,md:12,lg:16,xl:20,xxl:24,xxxl:32};                                                       // 4pt grid
const RAD={xs:6,sm:8,md:12,lg:16,xl:20,pill:999};                                                            // raggi
const MO={fast:120,base:200,slow:320,cine:550,easeStd:"cubic-bezier(.2,0,0,1)",easeOut:"cubic-bezier(0,0,.2,1)",easeIn:"cubic-bezier(.4,0,1,1)"}; // motion

/* ========================================
   AVATAR PRESETS  (req #2 – 12 varianti)
======================================== */
const AVATARS = [
  // [6.22.0] direttiva PO: SOLO 10 volti (griglia 5×2 stabile, niente shift tra pagine) e NIENTE rasati/pelati
  //   → tutti con capelli, spettro carnagione chiaro→scuro. Label = tratti realmente renderizzati (carnagione + colore capelli).
  {id:0,label:"Carnagione chiara · capelli castani",  skin:"#f0c8a0",hair:"#3a2410",eye:"#5a3e2b",style:"short",beard:false},
  {id:1,label:"Carnagione chiara · capelli biondi",   skin:"#f5d2b3",hair:"#dcb64c",eye:"#5b8dd9",style:"short",beard:false},
  {id:2,label:"Carnagione chiara · capelli neri",     skin:"#e8b890",hair:"#181410",eye:"#4a3728",style:"short",beard:false},
  {id:3,label:"Carnagione chiara · capelli ramati",   skin:"#f2cba0",hair:"#b5491f",eye:"#5b8dd9",style:"short",beard:false},
  {id:4,label:"Carnagione chiara · capelli castano chiaro", skin:"#eec79c",hair:"#8a5a2e",eye:"#4a6b8a",style:"short",beard:false},
  {id:5,label:"Carnagione olivastra · capelli neri",  skin:"#c8956a",hair:"#161210",eye:"#3d2800",style:"short",beard:false},
  {id:6,label:"Carnagione olivastra · capelli castani",skin:"#bd8a5e",hair:"#4a3018",eye:"#2d1800",style:"short",beard:false},
  {id:7,label:"Carnagione ambrata · capelli neri",    skin:"#a9743f",hair:"#120d0a",eye:"#2d1800",style:"short",beard:false},
  {id:8,label:"Carnagione scura · capelli neri",      skin:"#7c4a1e",hair:"#100a06",eye:"#2d1800",style:"short",beard:false},
  {id:9,label:"Carnagione scura · capelli castani",   skin:"#6b3f18",hair:"#3d2412",eye:"#1a0800",style:"short",beard:false},
];
/* [6.18.0] AVATAR = libreria DiceBear (stile 'adventurer'), bundle locale offline assets/dicebear-avatars.min.js
   → volti SVG dettagliati, deterministici da seed, scalabili/manutenibili. Cache per seed@size. */
const _dbAvCache={};
function _dbAv(seed,size,opts){
  var k=seed+"@"+size+"@"+(opts?JSON.stringify(opts):"");
  if(_dbAvCache[k]!==undefined)return _dbAvCache[k];
  var h="";
  try{ if(typeof window!=='undefined'&&window.DiceBear&&window.DiceBear.makeAvatar) h=window.DiceBear.makeAvatar(seed,Object.assign({size:size},opts||{})); }catch(e){}
  _dbAvCache[k]=h; return h;
}
function AvatarSVG({id=0, size=60, border=false, style={}, seed, avStyle, avOpts}) {
  const p = AVATARS[id%AVATARS.length];
  const _seed = seed!=null ? String(seed) : ("elevora-hero-"+(id%40));
  // [6.18.0] EROE = stile 'avataaars' con FEDELTÀ al modello 3D CH38: forza carnagione+capelli+calvizie dalla STESSA
  //   fonte AVATARS[id].skin/.hair/bald che il CH38 usa (r.7127) → avatar dei menu ≈ giocatore in partita.
  //   NPC/staff (seed esplicito) = stile 'micah' (flat, professionale) — override con avStyle.
  //   [7.428.0] +avOpts: opzioni inoltrate al bundle (skinColor/hairColor + blocco micah:{…} che il wrapper
  //   G2 ora passa al generatore) — serve al ritratto del MISTER, che vincola acconciatura e colori.
  const _opts = seed!=null
    ? Object.assign({ style: avStyle||'micah' }, avOpts||{})
    : { style:'avataaars', skinColor:[String(p.skin).replace('#','')], hairColor:[String(p.hair).replace('#','')], bald: p.style==='bald' };
  const _html = _dbAv(_seed, Math.round(size), _opts);
  const wrap = {width:size,height:size,borderRadius:"50%",overflow:"hidden",display:"block",flexShrink:0,background:"#e8eef7",border:border?"2px solid "+TH.primary:"none",...style};
  if(_html) return <div style={wrap} dangerouslySetInnerHTML={{__html:_html}}/>;
  // Fallback (bundle DiceBear non caricato): disco con iniziale — mai in produzione (script locale bloccante).
  return <div style={{...wrap,display:"flex",alignItems:"center",justifyContent:"center",color:TH.primary,fontWeight:800,fontSize:Math.round(size*0.42)}}>{(seed!=null?String(seed):(p&&p.label)||"E").slice(0,1).toUpperCase()}</div>;
}

// NPC profiles: mister, giornalisti
const COACH_NPC_FACES=[
  {skin:"#f5c5a3",hair:"#2d1800",eye:"#5a3e2b",hairStyle:"short",beard:false},
  {skin:"#e8b898",hair:"#909090",eye:"#4a6b8a",hairStyle:"short",beard:true},
  {skin:"#c8956a",hair:"#1a0800",eye:"#3d2800",hairStyle:"medium",beard:false},
  {skin:"#f0c090",hair:"#909090",eye:"#5a3e2b",hairStyle:"bald",beard:false},
  {skin:"#7c4a1e",hair:"#0f0500",eye:"#2d1800",hairStyle:"short",beard:false},
  {skin:"#fad5c0",hair:"#e8d840",eye:"#5b8dd9",hairStyle:"short",beard:false},
];
const JOURNALIST_NPC_FACES=[
  {skin:"#f5c5a3",hair:"#d4a820",eye:"#5b8dd9",hairStyle:"long",beard:false},
  {skin:"#e8b898",hair:"#4a2800",eye:"#4a3728",hairStyle:"medium",beard:true},
  {skin:"#b87c4a",hair:"#1a0800",eye:"#2d1800",hairStyle:"curly",beard:false},
  {skin:"#fad5c0",hair:"#909090",eye:"#4a6b8a",hairStyle:"short",beard:false},
  {skin:"#c8956a",hair:"#1a0800",eye:"#3d2800",hairStyle:"slick",beard:true},
];
// Componente faccina NPC (mister/giornalista) — no inner components, no fragments, no switch+JSX
function NpcFace({skin,hair,eye,hairStyle,beard,type,size}){
  skin=skin||"#f5c5a3";hair=hair||"#2d1800";eye=eye||"#5a3e2b";hairStyle=hairStyle||"short";beard=beard||false;type=type||"coach";size=size||54;
  var hc=hair;
  var suit=type==="coach"?"#1e293b":"#334155";
  var isBald=hairStyle==="bald";
  var isLong=hairStyle==="long";
  var isMedium=hairStyle==="medium";
  var isCurly=hairStyle==="curly";
  var isSlick=hairStyle==="slick";
  var hasFlow=isLong||isMedium;
  var flowW=isLong?9:7;
  var flowDL=isLong?"M22 31 Q16 60 23 78":"M21 31 Q19 52 25 63";
  var flowDR=isLong?"M78 31 Q84 60 77 78":"M79 31 Q81 52 75 63";
  var mouthCol=(skin==="#f5c5a3"||skin==="#fad5c0")?"#b06858":"#7a3838";
  return(
    <svg viewBox="0 0 100 100" width={size} height={size} style={{borderRadius:"50%",display:"block",overflow:"hidden"}}>
      <circle cx="50" cy="50" r="50" fill="#e2e8f0"/>
      <path d={"M8 100 Q8 70 30 64 Q42 72 50 76 Q58 72 70 64 Q92 70 92 100Z"} fill={suit}/>
      <path d={"M36 64 Q50 79 64 64 L60 74 Q50 84 40 74Z"} fill="#f8fafc"/>
      {type==="coach"&&<path d={"M46 68 L50 90 L54 68 L52 72 L50 70 L48 72Z"} fill="#dc2626"/>}
      {type==="journalist"&&<rect x="47" y="74" width="6" height="13" rx="3" fill="#94a3b8"/>}
      <rect x="44" y="63" width="12" height="12" rx="3" fill={skin}/>
      <ellipse cx="50" cy="49" rx="27" ry="29" fill={skin}/>
      {!isBald&&!isCurly&&!isSlick&&<ellipse cx="50" cy="23" rx="28" ry="14" fill={hc}/>}
      {isCurly&&<ellipse cx="50" cy="21" rx="30" ry="17" fill={hc}/>}
      {isCurly&&<circle cx="27" cy="33" r="9" fill={hc}/>}
      {isCurly&&<circle cx="73" cy="33" r="9" fill={hc}/>}
      {isSlick&&<path d={"M22 18 Q50 8 78 18 Q80 38 76 34 Q50 22 24 34 Z"} fill={hc}/>}
      {hasFlow&&<path d={flowDL} stroke={hc} strokeWidth={flowW} fill="none" strokeLinecap="round"/>}
      {hasFlow&&<path d={flowDR} stroke={hc} strokeWidth={flowW} fill="none" strokeLinecap="round"/>}
      <ellipse cx="23" cy="49" rx="4" ry="7" fill={skin}/>
      <ellipse cx="77" cy="49" rx="4" ry="7" fill={skin}/>
      <path d={"M33 37 Q40 34 45 37"} stroke={hc} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d={"M55 37 Q60 34 67 37"} stroke={hc} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <ellipse cx="39" cy="45" rx="6" ry="5.5" fill="white"/>
      <circle cx="39" cy="45" r="3.5" fill={eye}/>
      <circle cx="40.2" cy="43.8" r="1.4" fill="#111"/>
      <circle cx="38.2" cy="43.5" r="0.7" fill="white" opacity="0.75"/>
      <ellipse cx="61" cy="45" rx="6" ry="5.5" fill="white"/>
      <circle cx="61" cy="45" r="3.5" fill={eye}/>
      <circle cx="62.2" cy="43.8" r="1.4" fill="#111"/>
      <circle cx="60.2" cy="43.5" r="0.7" fill="white" opacity="0.75"/>
      <circle cx="47.5" cy="56" r="1.3" fill={hc} opacity="0.20"/>
      <circle cx="52.5" cy="56" r="1.3" fill={hc} opacity="0.20"/>
      <path d={"M41 63 Q50 69 59 63"} stroke={mouthCol} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {beard&&<ellipse cx="50" cy="67" rx="22" ry="9" fill={hc} opacity="0.42"/>}
    </svg>
  );
}
function npcFaceIdx(name){var s=name||"mister";var n=0;for(var i=0;i<s.length;i++)n+=s.charCodeAt(i);return Math.abs(n)%COACH_NPC_FACES.length;}
/* [7.428.0 collaudo PO, screenshot «IL MISTER TI CERCA — Mister Bellandi»: «ma ha il volto di una donna?»]
   IL MISTER HA LA FACCIA DEL MISTER. Il ritratto era un micah a briglia sciolta sul seed del nome — e micah,
   libero, pesca anche acconciature lunghe, colori fantasia (lilla, turchese) e orecchini: misurato sulla
   griglia dei 16 COACH_NAMES, 6 su 16 uscivano incoerenti con la persona («Mister Bellandi» capelli viola e
   volto femminile — lo screenshot del collaudo). Qui si RIUSA la palette COACH_NPC_FACES (definita per i
   volti del mister e mai piu' collegata) via npcFaceIdx: carnagione e colore capelli dalla palette,
   acconciatura vincolata alle varianti corte maschili (fonze/dannyPhantom, mrClean per il calvo), barba dove
   la palette la dichiara, niente orecchini ne' ombretto, bocca sobria. Deterministico per nome, come prima. */
function npcCoachAvOpts(coachName){
  const f=COACH_NPC_FACES[npcFaceIdx(coachName)]||COACH_NPC_FACES[0];
  const _hm={short:"fonze",medium:"dannyPhantom",bald:"mrClean"};
  const _hc=String(f.hair).replace('#','');
  return{skinColor:[String(f.skin).replace('#','')],hairColor:[_hc],
    micah:{hair:[_hm[f.hairStyle]||"fonze"],hairProbability:f.hairStyle==="bald"?0:100,
      earringsProbability:0,facialHairProbability:f.beard?100:0,facialHair:["beard"],
      facialHairColor:[_hc],eyeShadowColor:["transparent"],
      mouth:["smile","smirk"],glassesProbability:20,glassesColor:["2d3748"]}};
}
function NpcFaceCoach({coachName,size}){return <AvatarSVG seed={"coach-"+(coachName||"mister")} size={size||52} avStyle="micah" avOpts={npcCoachAvOpts(coachName||"mister")}/>;}

/* ========================================
   PLAYER 3D VIEWER
======================================== */
// ===== FOTO PROFILO CH38 (5.50.0) — l'avatar dell'eroe è il render del modello reale del calciatore =====
// Genera UNA VOLTA per avatarId uno snapshot RITRATTO del modello CH38 (footballer.glb) con pelle/capelli/kit
// dell'avatar scelto, e lo usa al posto dell'AvatarSVG ovunque. Lazy (GLB 3.2MB caricato solo al bisogno),
// cacheato per avatarId, con fallback all'SVG. NO-OP sotto gate (_CPM_TEST) → quality gate invariato.
const _heroPhotoCache={};let _heroPhotoAssets=null,_heroPhotoRenderer=null;
// 5.69.3 — rilascia il contesto WebGL del renderer dei ritratti (dispose NON basta: serve forceContextLoss).
//   Chiamato all'AVVIO di una partita → il contesto del ritratto non "ruba" quello del campo (fix schermo nero).
function _disposeHeroPhotoRenderer(){if(_heroPhotoRenderer){try{_heroPhotoRenderer.forceContextLoss();}catch(_e){}try{_heroPhotoRenderer.dispose();}catch(_e){}_heroPhotoRenderer=null;}}
// 5.50.2: maglia di colore DIVERSO per ogni avatar nella foto profilo → varietà visiva immediata (il modello è unico)
const _AV_KIT_COLS=["#c0392b","#1d4ed8","#15803d","#b45309","#6d28d9","#0e7490","#be185d","#334155","#c2410c","#4d7c0f","#0f766e","#7e22ce"];
function _ensureHeroPhotoAssets(){
  if(_heroPhotoAssets)return _heroPhotoAssets;
  _heroPhotoAssets=Promise.all([loadGLB('./assets/footballer.glb'),loadGLB('./assets/anim-idle.glb').catch(()=>null)])
    .then(([cg,ig])=>({glb:cg,idle:(ig&&ig.animations&&ig.animations[0])||(cg&&cg.animations&&cg.animations[0])||null}));
  return _heroPhotoAssets;
}
async function renderHeroPhoto(avatarId){
  const n=AVATARS.length,id=(((avatarId|0)%n)+n)%n;
  if(_heroPhotoCache[id]!==undefined)return _heroPhotoCache[id];
  if(_CPM_TEST||typeof THREE==='undefined'||typeof loadGLB!=='function'||!THREE.SkeletonUtils){_heroPhotoCache[id]=null;return null;}
  _heroPhotoCache[id]=undefined;// in-flight
  let url=null;
  try{
    const {glb,idle}=await _ensureHeroPhotoAssets();
    if(!glb||!glb.scene)throw new Error('no glb');
    const av=AVATARS[id]||AVATARS[0];
    const appr={skin:av.skin,hair:av.hair,bald:av.style==='bald',height:1.86+((id*73)%100)/100*0.18,girth:0.95+((id*131)%100)/100*0.13};
    const _ks=_AV_KIT_COLS[id%_AV_KIT_COLS.length];
    const kit=(typeof buildKit==='function')?buildKit(_ks):{shirt:_ks,shorts:'#181826',socks:_ks,shoes:'#141418'};
    const root=THREE.SkeletonUtils.clone(glb.scene);
    root.traverse(o=>{if(!o.isMesh)return;const nm=(o.name||'').toLowerCase();if(nm.includes('joint')){o.visible=false;return;}o.frustumCulled=false;
      let kc=null;if(nm.includes('shirt'))kc=kit.shirt;else if(nm.includes('shorts'))kc=kit.shorts;else if(nm.includes('socks'))kc=kit.socks;else if(nm.includes('shoes'))kc=kit.shoes;
      if(kc!=null){const c=new THREE.Color(kc);o.material=new THREE.MeshLambertMaterial({color:c,emissive:c.clone().multiplyScalar(0.14),skinning:true});}
      else if(nm.includes('hair')){if(appr.bald){o.visible=false;}else{o.material=new THREE.MeshLambertMaterial({color:new THREE.Color(appr.hair||'#2d1800'),skinning:true});}}
      else if(nm.includes('body')&&o.material){o.material=o.material.clone();const sk=new THREE.Color(appr.skin||0xffffff);o.material.color=sk;if('emissive'in o.material)o.material.emissive=sk.clone().multiplyScalar(0.30);// 5.69.2: emissive MEDIO (0.72 era neon, 0.14 era troppo scuro) → floor morbido, volto ben illuminato ma non fluorescente
        if(o.material.normalScale&&o.material.normalScale.set)o.material.normalScale.set(0.28,0.28);if('roughness'in o.material)o.material.roughness=Math.min(1,(o.material.roughness!=null?o.material.roughness:0.7)+0.20);}});// normal map attenuato (niente fronte corrucciata) ma non piatto/plastica; rough alto = pelle opaca (niente hotspot lucidi)
    {const _bb0=new THREE.Box3().setFromObject(root),_hh=(_bb0.max.y-_bb0.min.y)||1.8,_sc=(appr.height||1.9)/_hh;root.scale.set(_sc*(appr.girth||1),_sc,_sc*(appr.girth||1));root.updateMatrixWorld(true);}
    const scene=new THREE.Scene();
    // 5.69.1 — LUCE RITRATTO calda e BILANCIATA (non lavata): key frontale leggermente caldo a livello occhi
    //   (niente ombre dure sotto le sopracciglia = aria cordiale), fill freddo laterale per volume, rim per
    //   staccare i capelli. Intensità totale ridotta rispetto a 5.68 (era sovraesposta → volti "fluorescenti").
    scene.add(new THREE.HemisphereLight(0xfff6ec,0x6a707c,1.08));// cielo caldo · terra fredda → incarnato sano e luminoso
    scene.add(new THREE.AmbientLight(0xffffff,0.34));
    const dir=new THREE.DirectionalLight(0xfff1e0,0.98);dir.position.set(0.35,0.7,3.2);scene.add(dir);// key caldo frontale (modella senza indurire)
    const fill=new THREE.DirectionalLight(0xeaf1ff,0.42);fill.position.set(-1.7,0.2,2.4);scene.add(fill);// fill freddo laterale-basso
    const rim=new THREE.DirectionalLight(0xffffff,0.32);rim.position.set(0,1.7,-2.2);scene.add(rim);// rim posteriore per i capelli
    scene.add(root);
    if(idle){const mx=new THREE.AnimationMixer(root);mx.clipAction(idle).play();mx.setTime(0.5);}
    root.updateMatrixWorld(true);
    const SZ=640;// 5.69.1: risoluzione ritratto più alta (512→640) → più nitido sugli schermi ad alta densità
    // 5.69.3 — renderer del ritratto PERSISTENTE (un solo contesto, riusato) → niente churn di contesti WebGL
    //   (il churn della 5.69.2 faceva fallire i render → fallback SVG). Ma se una PARTITA è attiva NON creare/usare
    //   un contesto qui (lo ruberebbe al campo → schermo nero): salta → fallback SVG solo durante la partita.
    if(typeof window!=='undefined'&&window.__CPM_MATCH_ACTIVE)throw new Error('match-active');
    if(!_heroPhotoRenderer){_heroPhotoRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});_heroPhotoRenderer.setPixelRatio(1);}
    const R=_heroPhotoRenderer;R.setSize(SZ,SZ);R.setClearColor(0x000000,0);
    const bb=new THREE.Box3().setFromObject(root);const cx=(bb.min.x+bb.max.x)/2,topY=bb.max.y,botY=bb.min.y,bodyH=(topY-botY)||1.8;
    // 5.68.0 — inquadratura STRETTA su TESTA+SPALLE: i pixel vanno sul volto (prima inquadrava tutto il corpo →
    //   volto minuscolo poi ritagliato = sfocato). Distanza calcolata dalla porzione verticale voluta.
    const fov=24,headCY=topY-bodyH*0.13,extent=bodyH*0.30,dist=extent/(2*Math.tan(fov*Math.PI/360));
    const cam=new THREE.PerspectiveCamera(fov,1,0.05,100);
    cam.position.set(cx,headCY,(bb.max.z||0)+dist);cam.lookAt(cx,headCY,0);
    R.render(scene,cam);
    url=R.domElement.toDataURL('image/png');
  }catch(e){url=null;}
  _heroPhotoCache[id]=url;return url;
}
function AvatarPhoto({id=0,size=60,border=false,style={}}){
  // 5.69.4 — FIX DEFINITIVO campo nero: il ritratto CH38 è ora un'IMMAGINE STATICA pre-generata
  //   (assets/avatar-<id>.png, renderizzata offline dal modello CH38 con la stessa resa cordiale). NESSUN
  //   renderer WebGL a runtime → niente secondo contesto WebGL che rubi quello della partita (era la causa del
  //   campo nero dopo la schermata di creazione). Volti CH38 mantenuti, nitidi e coerenti. Fallback all'SVG se
  //   l'immagine manca. renderHeroPhoto resta definita ma NON è più usata (nessun contesto WebGL creato).
  const n=AVATARS.length,_id=((((id|0)%n)+n)%n);
  const [err,setErr]=useState(false);
  if(err)return <AvatarSVG id={id} size={size} border={border} style={style}/>;
  return <img src={"./assets/avatar-"+_id+".png"} width={size} height={size} alt="" onError={()=>setErr(true)} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",objectPosition:"center center",background:"#e6ecf5",display:"block",flexShrink:0,...(border?{border:"2px solid "+TH.primary,boxSizing:"border-box"}:{}),...style}}/>;
}
function Player3DViewer({avatarData,clubColor="#2563eb",width="100%",height="280px",animate=true}){
  const containerRef=useRef(null);
  const stateRef=useRef({renderer:null,animId:null,isDragging:false,lastX:0,playerGroup:null,bodyMesh:null,t:0});

  useEffect(()=>{
    const el=containerRef.current;
    if(!el||!THREE)return;
    const sr=stateRef.current;
    const av=avatarData||AVATARS[0];

    // Scene
    const scene=new THREE.Scene();
    const w=el.clientWidth||220,h=el.clientHeight||220;
    const camera=new THREE.PerspectiveCamera(55,w/h,0.1,100);
    camera.position.set(0,1.2,4.5);
    camera.lookAt(0,0.5,0);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(w,h);
    renderer.setClearColor(0xf0f7ff,1);
    renderer.shadowMap.enabled=true;
    el.appendChild(renderer.domElement);
    sr.renderer=renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff,0.7));
    const dLight=new THREE.DirectionalLight(0xffffff,0.9);
    dLight.position.set(4,8,6);
    dLight.castShadow=true;
    scene.add(dLight);

    // Helper: hex → THREE color
    const col=hex=>new THREE.Color(hex);
    const mat=hex=>new THREE.MeshPhongMaterial({color:col(hex)});
    const mesh=(geo,hex)=>{const m=new THREE.Mesh(geo,mat(hex));m.castShadow=true;m.receiveShadow=true;return m;};

    const group=new THREE.Group();
    group.position.set(0,-1.5,0);
    scene.add(group);
    sr.playerGroup=group;

    // Head
    const head=mesh(new THREE.SphereGeometry(0.55,24,24),av.skin||"#f5c5a3");
    head.position.set(0,2.55,0);
    group.add(head);

    // Hair
    if(av.style!=="bald"){
      const hair=mesh(new THREE.SphereGeometry(0.6,24,24),av.hair||"#2d1800");
      hair.scale.set(1,0.55,1);
      hair.position.set(0,2.85,0);
      group.add(hair);
    }

    // Eyes
    const eyeGeo=new THREE.SphereGeometry(0.08,8,8);
    const eyeMat=new THREE.MeshPhongMaterial({color:col(av.eye||"#5a3e2b")});
    const eyeL=new THREE.Mesh(eyeGeo,eyeMat);eyeL.position.set(-0.18,2.6,0.5);group.add(eyeL);
    const eyeR=new THREE.Mesh(eyeGeo,eyeMat);eyeR.position.set(0.18,2.6,0.5);group.add(eyeR);

    // Beard
    if(av.beard){
      const beardMat=new THREE.MeshPhongMaterial({color:col(av.hair||"#2d1800"),transparent:true,opacity:0.65});
      const beard=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.08,8,12),beardMat);
      beard.scale.set(1,0.5,1);
      beard.position.set(0,2.3,0.1);
      group.add(beard);
    }

    // Body / jersey
    const body=mesh(new THREE.CylinderGeometry(0.38,0.32,1.1,12),clubColor);
    body.position.set(0,1.55,0);
    group.add(body);
    sr.bodyMesh=body;

    // Arms
    const armGeo=new THREE.CylinderGeometry(0.14,0.12,0.9,8);
    const armMat=new THREE.MeshPhongMaterial({color:col(clubColor)});
    const armL=new THREE.Mesh(armGeo,armMat);armL.position.set(-0.52,1.6,0);armL.rotation.z=0.25;group.add(armL);
    const armR=new THREE.Mesh(armGeo,armMat);armR.position.set(0.52,1.6,0);armR.rotation.z=-0.25;group.add(armR);

    // Legs
    const legGeo=new THREE.CylinderGeometry(0.17,0.14,1.0,8);
    const legMat=new THREE.MeshPhongMaterial({color:col("#1e293b")});
    const legL=new THREE.Mesh(legGeo,legMat);legL.position.set(-0.2,0.55,0);group.add(legL);
    const legR=new THREE.Mesh(legGeo,legMat);legR.position.set(0.2,0.55,0);group.add(legR);

    // Animation loop
    const loop=()=>{
      sr.animId=requestAnimationFrame(loop);
      if(animate){
        sr.t=(sr.t||0)+0.016;
        if(sr.bodyMesh)sr.bodyMesh.scale.y=0.97+Math.sin(sr.t*Math.PI)*0.03;
        sr.playerGroup.rotation.y+=0.004;
      }
      renderer.render(scene,camera);
    };
    loop();

    // Mouse drag rotate
    const onDown=e=>{sr.isDragging=true;sr.lastX=e.clientX??e.touches?.[0]?.clientX??0;};
    const onMove=e=>{
      if(!sr.isDragging)return;
      const x=e.clientX??e.touches?.[0]?.clientX??0;
      sr.playerGroup.rotation.y+=(x-sr.lastX)*0.01;
      sr.lastX=x;
    };
    const onUp=()=>{sr.isDragging=false;};
    el.addEventListener("mousedown",onDown);
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    el.addEventListener("touchstart",onDown,{passive:true});
    window.addEventListener("touchmove",onMove,{passive:true});
    window.addEventListener("touchend",onUp);

    // Resize
    const ro=new ResizeObserver(()=>{
      const nw=el.clientWidth,nh=el.clientHeight;
      camera.aspect=nw/nh;camera.updateProjectionMatrix();
      renderer.setSize(nw,nh);
    });
    ro.observe(el);

    return()=>{
      cancelAnimationFrame(sr.animId);
      ro.disconnect();
      el.removeEventListener("mousedown",onDown);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mouseup",onUp);
      el.removeEventListener("touchstart",onDown);
      window.removeEventListener("touchmove",onMove);
      window.removeEventListener("touchend",onUp);
      try{renderer.forceContextLoss();}catch(_e){}renderer.dispose();// 5.69.3: forceContextLoss RILASCIA il contesto WebGL (dispose da solo NON lo fa) → i contesti non si accumulano e non "rubano" quello della partita (fix campo nero)
      if(renderer.domElement.parentNode===el)el.removeChild(renderer.domElement);
    };
  },[avatarData,clubColor,animate]);

  return <div ref={containerRef} style={{width,height,overflow:"hidden",borderRadius:14,cursor:"grab"}}/>;
}

/* ========================================
   EUROPEAN CLUBS DATABASE  (req #11,#12)
======================================== */
const mkT=(id,n,a,p,c,c2,nat,lg)=>({id,n,a,p,c,c2,nat,lg});
