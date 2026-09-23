/* ========================================================================
 * KORWARD ELITE — frammento n° 01  (dei 21, numerati da 00 a 20)
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
  bg:"#f5f3ef", bgGrad:"linear-gradient(160deg,#f7f5f1 0%,#f1efe9 100%)",/* [PALETTE A · scelta PO 14/09 «la A»] base avorio neutra al posto dell'azzurrino: il granata resta la marca, la base smette di contraddirlo */
  card:"#ffffff", cardBorder:"#e7e3dc", shadow:"0 2px 12px rgba(0,0,0,0.07)",
  text:"#1e293b", muted:"#526279", faint:"#596a80",/* [G1.1 grafica] i due grigi del testo secondario sul tema chiaro: erano 4,76:1 e 2,56:1 su bianco (2,4:1 e 4,0-4,4:1 sui fondi tinti): 917 nodi su 2291 sotto la soglia WCAG nella griglia G0, il piu' delle volte proprio questi due. Ora >=5,27:1 e >=4,69:1 su tutti e cinque i fondi chiari del gioco. La gerarchia resta (faint piu' chiaro di muted). Il tema scuro ha i suoi valori in TH_DARK e non cambia. */
  primary:"#8e1f33", primaryDk:"#6a1326",
  success:"#16a34a", danger:"#dc2626", warning:"#d97706",
  gold:"#b45309", accent:"#7c3aed",
  brandText:"#8e1f33", accentText:"#7c3aed",/* [G1.6 grafica] marca e accento COME TESTO: sul chiaro coincidono coi pieni; TH_DARK li schiarisce (#ee9aaa 6,9:1 e #a78bfa 5,4:1 su #1e293b) perche' i pieni su card scura stanno a 1,7:1 e 2,6:1 */
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
  surface2:"#f1eee8", surface3:"#ffffff", divider:"#e9e5de", track:"#e4e0d8", scrim:"rgba(15,23,42,0.45)",
  cardBg:"#f4f7fb",  // FIX: TH.cardBg usato (Club tab) ma mai definito → alias di surface2
  border:"#e6edf5",  // FIX: TH.border usato (ProTransition) ma mai definito → alias di divider
  el1:"0 2px 12px rgba(0,0,0,0.07)", el2:"0 4px 16px rgba(0,0,0,0.10)", el3:"0 12px 40px rgba(0,0,0,0.18)",
  // Scala brand (sostituisce il "granata-su-blu" accidentale delle selezioni)
  primaryTint:"#f7e9ec", primaryBorder:"#e3c3cb",
  // Oro metallico trofei (disambiguato da warning)
  goldGrad:"linear-gradient(135deg,#f6c04b,#d4922a)", goldText:"#a34a08"/* [PALETTE A] oro e vittoria come testo stavano a 4,3:1 sulla superficie avorio #f1eee8 (erano 4,7 sull'azzurrino): ora 5,1 e 5,3 */,
  // Token semantici di dominio (fg/bg/bd)
  winFg:"#166534"/* [7.968] era #137036: due verdi scuri a 11 punti di distanza, indistinguibili a occhio e contati come due tinte dal censimento. Questo e' l'inchiostro verde approvato, lo stesso a cui si aggancia `semTesto945` */, winBg:"#e7f6ec", winBd:"#b7e4c4",
  drawFg:"#a16207", drawBg:"#fbf3dd", drawBd:"#f0dca6",
  lossFg:"#b91c1c", lossBg:"#fbe9e9", lossBd:"#f3c9c9",
  growth:"#16a34a", regression:"#dc2626", energy:"#0284c7",
  injury:"#dc2626", suspension:"#ea580c", record:"#0891b2",
};

/* [7.944 C4.1 — I COLORI DEI CLUB SONO DATI, E I DATI NON SANNO CHE E' NOTTE.]
   Misurato con la griglia mobile a 412 px sul tema SCURO: i peggiori contrasti della schermata non
   vengono dal tema ma dai colori di SQUADRA disegnati come testo — #8e1f33 su #1e293b = 1,67,
   #003399 su #1b2a44 = 1,32, cioe' sotto il terzo della soglia WCAG di 4,5. Un token non puo'
   risolverli: la tinta arriva dal database dei club, non dalla palette.
   Qui la tinta viene ALZATA finche' non e' leggibile sul fondo scuro, conservando la TONALITA'
   (il granata resta granata, il blu resta blu): e' la squadra che si riconosce, non il valore esatto.
   Nel tema chiaro non tocca niente e restituisce il colore ricevuto — nessun cambiamento possibile. */
function _lum944(h){h=String(h||'').trim();if(h[0]==='#')h=h.slice(1);
  if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length<6)return null;const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255);
  if(v.some(isNaN))return null;
  const f=(c)=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);
  return 0.2126*f(v[0])+0.7152*f(v[1])+0.0722*f(v[2]);}
function _rap944(a,b){const x=_lum944(a),y=_lum944(b);if(x==null||y==null)return 99;
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
function _mix944(h,q){h=String(h||'').trim();if(h[0]==='#')h=h.slice(1);
  if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16));if(v.some(isNaN))return '#'+h;
  return '#'+v.map(c=>Math.round(c+(255-c)*q).toString(16).padStart(2,'0')).join('');}
function legCol944(col,fondo){
  /* [G8.4] LA RIGA CHE DICEVA «solo nel tema scuro» E' STATA TOLTA, ed era il difetto.
     Di giorno questa funzione restituiva il colore intatto: sul tema chiaro #16a34a su bianco
     resta 3,30:1 e #10b981 resta 2,54:1, sotto la soglia di 4,5. Ora delega a semTesto945, che
     sposta la tinta verso il fondo opposto in tutte e due le direzioni. Il rosso __CPM_NO944
     resta e spegne tutto, come prima. */
  try{ if(!col||typeof col!=='string'||col[0]!=='#')return col;
    if(typeof window!=='undefined'&&window.__CPM_NO944)return col;/* prova del rosso */
    /* [G8.6] IL FONDO DI RIPIEGO E' IL PIU' DIFFICILE, NON IL PIU' CHIARO.
       Misurato: #ef4444 alzato contro TH.card (bianco) si ferma a #c93939, che sulla riga
       alternata della classifica — fondo TH.surface2 #f1eee8 — fa 4,39:1 e resta sotto soglia.
       Chi chiama non sa quasi mai su che fondo finira' il testo; il ripiego sicuro e' la
       superficie tinta, perche' cio' che si legge su #f1eee8 si legge anche su bianco. */
    return semTesto945(col,fondo||(typeof TH!=='undefined'&&TH?(TH.surface2||TH.card):null));
  }catch(_e){ return col; }}
/* [G8.2 — L'INCHIOSTRO SU UN COLORE DI SQUADRA NON PUO' ESSERE SEMPRE IL BIANCO.]
   La testata dell'eroe scrive in bianco sul colore del club. Finche' il fondo era una SFUMATURA
   che finiva in #0b1220 il difetto era invisibile al metro: la griglia mobile ESCLUDE dal conto
   del contrasto ogni nodo il cui fondo e' un gradiente, perche' non si puo' leggere un rapporto
   da un fondo che cambia sotto la riga. MISURATO su tutti e 252 i club del gioco
   (tests/visual/inchiostro-club.mjs): con il bianco sempre, 82 CLUB SU 252 stanno sotto 4,5:1,
   e il peggiore e' 1,09:1 — Torino Athletic #f5f5f5, cioe' bianco su bianco.
   Qui l'inchiostro lo sceglie il CONTRASTO, non l'abitudine: bianco o #0f172a, quello che vince.
   Con questa regola i club sotto soglia diventano 0 e il peggiore e' 4,83:1 (AC Rossoneri #dc2626).
   Riusa _rap944, gia' in casa: nessuna matematica nuova. */
/* [G8.4 — legCol944 GUARDAVA SOLO DI NOTTE.]
   legCol944 alza una tinta finche' non si legge, ma solo sul tema SCURO: sul chiaro restituisce
   il colore ricevuto senza toccarlo. Misurato con la griglia mobile a 412 px sul tema CHIARO,
   Carriera · Profilo: #16a34a su #ffffff = 3,30:1 (12 nodi), #10b981 su #ffffff = 2,54:1,
   #d97706 su #f1eee8 = 2,75:1 e #16a34a su #f1eee8 = 2,85:1 a 17 px in nero (soglia 3).
   Sono i colori SEMANTICI (success/warning/danger) e quelli dei DATI (i giornalisti, le leghe)
   disegnati come TESTO: il tema ha gia' i gemelli sicuri per il testo (winFg, drawFg, lossFg,
   goldText, brandText), ma chi scrive una card nuova pesca il pieno perche' e' quello che si
   chiama come il concetto.
   Qui la regola diventa una sola per tutte e due le direzioni: si sposta la tinta VERSO IL
   FONDO OPPOSTO (piu' scura su fondo chiaro, piu' chiara su fondo scuro) finche' non arriva a
   4,5:1, conservando la tonalita'. Il verde resta verde, l'ambra resta ambra: e' il concetto che
   si riconosce, non il valore esatto. */
function _mixNero945(h,q){h=String(h||'').trim();if(h[0]==='#')h=h.slice(1);
  if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16));if(v.some(isNaN))return '#'+h;
  return '#'+v.map(c=>Math.round(c*(1-q)).toString(16).padStart(2,'0')).join('');}
/* [G14 · 7.968 — GLI INCHIOSTRI SEMANTICI SONO UN ELENCO, NON UN CALCOLO CONTINUO. Rosso __CPM_NO968]
   MISURATO (griglia mobile, tabella nuova «9-septies · le tinte del testo, una per una»): la Dashboard
   rende QUATTORDICI tinte contro le cinque del provino, e l'elenco dice perche'. Non sono quattordici
   concetti: sono TRE VERDI (#0f7334, #137036, #166534), QUATTRO AMBRE (#b45309, #92400e, #995404,
   #a34a08), TRE BLU (#2563eb, #1e40af, #026fa7) e DUE ROSSI. Quasi nessuno di quei valori sta nel
   sorgente — li fabbrica questa funzione: schiarisce o scurisce a passi del 16 % finche' il contrasto
   non arriva a 4,5:1, e lo stesso verde su due fondi diversi esce con due valori diversi.
   Il contrasto e' giusto, l'esito no: l'occhio vede due verdi dove il gioco ne intende uno.
   Qui il risultato si AGGANCIA a un elenco di inchiostri approvati, uno per famiglia — e solo se
   l'inchiostro approvato e' DAVVERO vicino (distanza RGB sotto la soglia) e passa lui stesso il 4,5:1
   su quel fondo. Se non lo passa, vince il valore calcolato: il contrasto non si baratta con l'ordine. */
const INK945=["#166534","#b91c1c","#92400e","#1e40af","#6d28d9","#155e75","#0f172a","#526279","#8e1f33"];
const _rgb945=(h)=>{h=String(h||'').trim();if(h[0]==='#')h=h.slice(1);
  if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length<6)return null;const v=[0,2,4].map(i=>parseInt(h.substr(i,2),16));
  return v.some(isNaN)?null:v;};
const _SNAP945=3*62*62;/* 62 per canale: unisce i gemelli di una famiglia, mai due famiglie diverse */
function _agganciaInk945(c,bg){
  try{
    if(typeof window!=='undefined'&&window.__CPM_NO968)return c;/* prova del rosso: torna ai valori calcolati */
    const v=_rgb945(c); if(!v)return c;
    let best=null,bd=1e9;
    for(const k of INK945){const w=_rgb945(k); if(!w)continue;
      const d=(v[0]-w[0])*(v[0]-w[0])+(v[1]-w[1])*(v[1]-w[1])+(v[2]-w[2])*(v[2]-w[2]);
      if(d<bd){bd=d;best=k;}}
    if(best&&bd<=_SNAP945&&_rap944(best,bg)>=4.5)return best;
    return c;
  }catch(_e){return c;}}
function semTesto945(col,fondo){
  try{ if(!col||typeof col!=='string'||col[0]!=='#')return col;
    if(typeof window!=='undefined'&&window.__CPM_NO945S)return col;/* prova del rosso */
    const bg=fondo||(typeof TH!=='undefined'&&TH?(TH.card||'#ffffff'):'#ffffff');
    const lf=_lum944(bg); if(lf==null)return col;
    const versoIlNero=lf>0.18;           /* fondo chiaro -> si scurisce; fondo scuro -> si schiarisce */
    let c=col;
    for(let i=0;i<9&&_rap944(c,bg)<4.5;i++)c=versoIlNero?_mixNero945(c,0.16):_mix944(c,0.20);
    if(c!==col&&versoIlNero)c=_agganciaInk945(c,bg);/* [7.968] i gemelli di una famiglia diventano uno */
    return c; }catch(_e){ return col; }}
function inkSu945(col){
  try{ if(!col||typeof col!=='string'||col[0]!=='#')return '#ffffff';
    if(typeof window!=='undefined'&&window.__CPM_NO945I)return '#ffffff';/* prova del rosso */
    return _rap944('#ffffff',col)>=_rap944('#0f172a',col)?'#ffffff':'#0f172a'; }catch(_e){ return '#ffffff'; }}
/* il velo dell'inchiostro per il testo secondario: sullo stesso fondo, mai un grigio inventato */
function inkVelo945(ink,q){return ink==='#ffffff'?('rgba(255,255,255,'+q+')'):('rgba(15,23,42,'+q+')');}
const TH_LIGHT_ORIG=Object.freeze({...TH,dk:false}); // snapshot for restoring light theme · [7.178.0] +dk flag
const TH_LIGHT=TH; // alias used for dark-mode shadowing
const TH_DARK={...TH,dk:true,brandText:"#ee9aaa",accentText:"#a78bfa",faintDk_nota:"[G1.7 grafica] faint scuro #64748b -> #8a97ab: era 3,0-3,8:1 sui fondi scuri (376 nodi: Creazione 259, Club 47, Profilo 36, Nazionale 17); ora 4,9-6,0:1 (4,5 su #21304a)",bg:"#0f172a",bgGrad:"linear-gradient(160deg,#0f172a 0%,#0c1428 100%)",card:"#1e293b",cardBorder:"#334155",shadow:"0 2px 12px rgba(0,0,0,0.4)",text:"#f1f5f9",muted:"#94a3b8",faint:"#8a97ab",navBg:"rgba(15,23,42,0.97)",
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
/* [G13 · 7.969] UN CORPO CALCOLATO ATTERRA SULLA SCALA, NON DOVE CAPITA. MISURATO: Dashboard e Club
   rendevano un corpo «27» che non sta nel provino ne' nei token — veniva da `size*0.27` dell'anello OVR,
   cioe' da una proporzione, non da una scelta. Qui la proporzione resta (l'anello scala con la sua
   taglia) ma il risultato si aggancia al gradino piu' vicino della scala FS: la tipografia del gioco
   resta un elenco finito anche dove il numero lo calcola una formula. */
const _FS_SCALA=[11,12,13,15,17,20,24,32,44,64];
const fsScala=(x)=>{const v=+x||0;let b=_FS_SCALA[0],d=1e9;
  for(const k of _FS_SCALA){const q=Math.abs(k-v);if(q<d){d=q;b=k;}}return b;};
const RAD={xs:6,sm:8,md:12,lg:16,xl:20,pill:999};                                                            // raggi
const MO={fast:120,base:200,slow:320,cine:550,easeStd:"cubic-bezier(.2,0,0,1)",easeOut:"cubic-bezier(0,0,.2,1)",easeIn:"cubic-bezier(.4,0,1,1)"}; // motion

/* ========================================
   AVATAR PRESETS  (req #2 – 12 varianti)
======================================== */
const AVATARS = [
  // [6.22.0] direttiva PO: SOLO 10 volti (griglia 5×2 stabile, niente shift tra pagine) e NIENTE rasati/pelati
  //   → tutti con capelli, spettro carnagione chiaro→scuro. Label = tratti realmente renderizzati (carnagione + colore capelli).
  {id:0,bodyType:"slim",hairStyle:"side",label:"Carnagione chiara · capelli castani",  skin:"#f0c8a0",hair:"#3a2410",eye:"#5a3e2b",style:"short",beard:false},
  {id:1,bodyType:"stocky",hairStyle:"curly",label:"Carnagione chiara · capelli biondi",   skin:"#f5d2b3",hair:"#dcb64c",eye:"#5b8dd9",style:"short",beard:false},
  {id:2,bodyType:"regular",hairStyle:"short",label:"Carnagione chiara · capelli neri",     skin:"#e8b890",hair:"#181410",eye:"#4a3728",style:"short",beard:false},
  {id:3,bodyType:"slim",hairStyle:"long",label:"Carnagione chiara · capelli ramati",   skin:"#f2cba0",hair:"#b5491f",eye:"#5b8dd9",style:"short",beard:false},
  {id:4,bodyType:"regular",hairStyle:"buzz",label:"Carnagione chiara · capelli castano chiaro", skin:"#eec79c",hair:"#8a5a2e",eye:"#4a6b8a",style:"short",beard:false},
  {id:5,bodyType:"stocky",hairStyle:"crop",label:"Carnagione olivastra · capelli neri",  skin:"#c8956a",hair:"#161210",eye:"#3d2800",style:"short",beard:false},
  {id:6,bodyType:"regular",hairStyle:"fade",label:"Carnagione olivastra · capelli castani",skin:"#bd8a5e",hair:"#4a3018",eye:"#2d1800",style:"short",beard:false},
  {id:7,bodyType:"slim",hairStyle:"wavy",label:"Carnagione ambrata · capelli neri",    skin:"#a9743f",hair:"#120d0a",eye:"#2d1800",style:"short",beard:false},
  {id:8,bodyType:"stocky",hairStyle:"afro",label:"Carnagione scura · capelli neri",      skin:"#7c4a1e",hair:"#100a06",eye:"#2d1800",style:"short",beard:false},
  {id:9,bodyType:"regular",hairStyle:"mohawk",label:"Carnagione scura · capelli castani",   skin:"#6b3f18",hair:"#3d2412",eye:"#1a0800",style:"short",beard:false},
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
  /* [7.961] un VISO si deve poter contare da una sonda: la 7.961 toglie le facce dalla sala stampa e
     senza un attributo il guardiano dovrebbe indovinarle dal bordo tondo. Additivo, zero effetto di resa. */
  if(_html) return <div data-cpm-viso="1" style={wrap} dangerouslySetInnerHTML={{__html:_html}}/>;
  // Fallback (bundle DiceBear non caricato): disco con iniziale — mai in produzione (script locale bloccante).
  return <div data-cpm-viso="1" style={{...wrap,display:"flex",alignItems:"center",justifyContent:"center",color:TH.primary,fontWeight:800,fontSize:Math.round(size*0.42)}}>{(seed!=null?String(seed):(p&&p.label)||"E").slice(0,1).toUpperCase()}</div>;
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   LA FIGURINA — LO SPAZIO DEL VOLTO E' RETTANGOLARE E VERTICALE  [7.966 · direttiva PO 22/09]
   «Inizia a predisporre lo spazio dei volti rettangolari in verticale, sto predisponendo con il team
   codex delle figurine stile panini con i volti dei giocatori, mister, avversari, intervistatori,
   giornalisti, ecc.»

   QUESTA VERSIONE NON PORTA NESSUN DISEGNO: porta lo SPAZIO, e lo porta con un contratto scritto, in
   modo che l'arte possa entrare senza toccare una sola schermata. Tre pezzi:

   1) `FIG` — il formato, in un posto solo. Rapporto 5:7, quello della figurina da album (50x70 mm).
      Cambiarlo e' una riga: tutte le figurine del gioco seguono.
   2) `voltoUrl(tipo, chiave)` — da CHI a DOVE. Prima cerca nel manifesto `window.__CPM_VOLTI`
      (un oggetto `{ "giocatore/rossi-mario": "assets/volti/..." }` che il team codex puo' pubblicare
      senza toccare il codice), poi ripiega sulla convenzione `assets/volti/<tipo>/<chiave>.webp`.
      Finche' il file non c'e', l'immagine non si chiede nemmeno: si vede il ripiego.
   3) `Figurina` — il riquadro. Tiene il rapporto qualunque sia la larghezza, ritaglia l'immagine con
      `object-fit:cover` (l'arte non si deforma mai), e finche' l'arte non c'e' mostra il volto tondo
      di oggi dentro la cornice, su un fondo tinto col colore del club. Il gioco quindi NON cambia
      aspetto oggi: cambia il CONTENITORE, che e' cio' che il PO ha chiesto di predisporre.

   CONTRATTO PER CHI DISEGNA (vedi anche docs/FIGURINE-VOLTI.md):
   · rapporto 5:7 verticale · consegnare a 320x448 px (2x di 160x224) e 640x896 (4x) · webp o png
   · il volto sta nel terzo superiore, occhi a ~38% dall'alto, spalle tagliate dal bordo basso
   · margine di sicurezza 6% per lato: la cornice arrotonda gli angoli e puo' coprire il bordo
   · fondo pieno o sfumato, MAI trasparente (la cornice ci mette sopra il suo velo e il nome)
   · nomi file: `<tipo>/<chiave>.webp` con tipo in {giocatore,mister,avversario,giornalista,arbitro,
     procuratore,dirigente} e chiave in minuscolo, senza accenti, spazi come trattini. */
const FIG={w:5,h:7,r:RAD.xs,minW:28};/* il rapporto della figurina da album, in un posto solo */
const _slugVolto=(x)=>String(x==null?"":x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);
/* [23/09 POC — I 1000 VOLTI ENTRANO NEL GIOCO. Incarico PO: «collega ogni attore del gioco a un ritratto in modo stabile e
   riproducibile».] Tre regole:
   1) CARICAMENTO: il gioco scarica UNA volta l'indice leggero (`assets/portraits/ai/indice.json`, ~69 KB, generato da
      tools/ritratti/indice-volti.mjs) e poi SOLO le immagini delle figurine che appaiono (`loading="lazy"`): mai i 1000 WebP.
   2) ASSEGNAZIONE STABILE: il volto e' funzione pura di (tipo, chiave) — hash sul gruppo giusto — quindi non cambia riaprendo
      una partita o ricaricando un salvataggio. Gruppi DISGIUNTI per tipo (lo staff: mister, procuratori, giornalisti, arbitri,
      dirigenti in fette separate; i giocatori: compagni e avversari in due meta'), cosi' due ruoli diversi nella stessa scena
      non possono avere la stessa faccia. Il volto dell'eroe e' RISERVATO: nessun altro lo riceve.
   3) EROE: il volto scelto alla creazione e' salvato in `player.voltoEroe`; senza scelta (salvataggi vecchi) e' il primo
      candidato coerente col suo aspetto 3D (carnagione e capelli di AVATARS). Tutte le chiavi con cui le schermate chiamano
      l'eroe (nome, «eroe-N», «avatar-N») portano allo stesso volto.
   La carnagione dell'indice serve SOLO ad avvicinare il volto all'aspetto 3D dell'eroe: non si mostra mai. Rosso __CPM_NO_VOLTI23. */
const VOLTI23={idx:null,stato:"da-caricare",ascolta:new Set()};
function _caricaVolti23(){
  if(VOLTI23.stato!=="da-caricare")return;
  if(typeof window==='undefined'||typeof fetch!=='function'||window.__CPM_NO_VOLTI23){VOLTI23.stato="spento";return;}
  VOLTI23.stato="in-corso";
  fetch("assets/portraits/ai/indice.json").then(r=>r.ok?r.json():null).then(j=>{
    VOLTI23.idx=(j&&j.g&&j.s)?j:null;VOLTI23.stato=VOLTI23.idx?"pronto":"assente";
    VOLTI23.ascolta.forEach(f=>{try{f();}catch(_e){}});
  }).catch(()=>{VOLTI23.stato="assente";});
}
const _FETTE23={mister:[0,0.30],procuratore:[0.30,0.50],giornalista:[0.50,0.70],arbitro:[0.70,0.85],dirigente:[0.85,1]};
/* volti dello staff classificati A VISTA (23/09, l'indice non ha il sesso); gli incerti 30, 244, 330, 344, 730 non stanno in nessuno dei due */
const _STAFF_M23=new Set([7,59,73,87,101,159,173,187,201,259,273,287,301,359,373,387,401,459,473,487,501,559,573,587,601,659,673,687,701,759,773,787,801,859,873,887,901,955,973,991]);
const _STAFF_F23=new Set([8,16,44,116,130,144,216,230,316,416,430,444,516,530,544,616,630,644,716,744,816,830,844,918,936]);
const _hash23=(x)=>{let h=2166136261>>>0;const t=String(x);for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;};
/* candidati per il volto dell'eroe: giovani giocatori con la carnagione e il colore di capelli dell'aspetto 3D scelto */
function candidatiEroe23(avatarId){
  const I=VOLTI23.idx;if(!I)return [];
  const av=(typeof AVATARS!=='undefined'&&AVATARS.find(a=>a.id===(avatarId|0)))||null;const lab=String(av&&av.label||"").toLowerCase();
  const k=/scura/.test(lab)?"s":/ambrata/.test(lab)?"a":/olivastra/.test(lab)?"o":"c";
  const h=/biondi/.test(lab)?"biondi":/ramati|rossi/.test(lab)?"rossi":/neri/.test(lab)?"neri":"castani";
  const giov=I.g.filter(r=>r.e<=23);
  let c=giov.filter(r=>r.k===k&&r.h===h);if(c.length<4)c=c.concat(giov.filter(r=>r.k===k&&r.h!==h));
  return c.slice(0,24).map(r=>r.n);
}
function _eroe23(){try{return (typeof window!=='undefined'&&window.__CPM_EROE23)||null;}catch(_e){return null;}}
function voltoEroeId23(){const E=_eroe23();if(!E)return null;if(E.volto)return E.volto;const c=candidatiEroe23(E.avatarId);return c.length?c[0]:null;}
/* da (tipo, chiave) al numero del volto; null = nessun volto (resta il riquadro neutro) */
function voltoId23(tipo,chiave,salto){
  const I=VOLTI23.idx;if(!I)return null;
  const sl=_slugVolto(chiave);const t=tipo||"giocatore";
  if(t==="giocatore"){const E=_eroe23();
    if(/^avatar-\d+$/.test(sl)){const c=candidatiEroe23(+sl.slice(7));return c.length?c[0]:null;}
    if(/^eroe(-|$)/.test(sl)||(E&&E.nome&&sl===_slugVolto(E.nome)))return voltoEroeId23();}
  const riservato=voltoEroeId23();
  let pool;
  /* [23/09 POC — direttiva PO «il mister deve essere piu' anziano»] L'indice dei volti NON dichiara il sesso: i 70 volti dello staff
     sono stati guardati uno per uno (foglio di provini, 23/09) e divisi a vista in 40 uomini e 25 donne; 5 volti incerti restano
     fuori da entrambi. Il mister pesca SOLO fra gli uomini con eta' dichiarata >= 52 (19 volti, 52-58 anni, i piu' anziani in
     testa); procuratore/arbitro/dirigente/giornalista fra gli uomini piu' giovani; «giornalista_f» fra le donne (prima le
     giornaliste restavano senza volto). Rosso __CPM_NO_MISTER23 (le vecchie fette per indice). */
  if((_FETTE23[t]||t==="giornalista_f")&&!(typeof window!=='undefined'&&window.__CPM_NO_MISTER23)){
    if(t==="giornalista_f")pool=I.s.filter(r=>_STAFF_F23.has(r.n));
    else if(t==="mister")pool=I.s.filter(r=>r.e>=52&&_STAFF_M23.has(r.n)).sort((x,y)=>(y.e-x.e)||(x.n-y.n));
    else{const alt=I.s.filter(r=>r.e<52&&_STAFF_M23.has(r.n));const F={procuratore:[0,0.3],giornalista:[0.3,0.6],arbitro:[0.6,0.8],dirigente:[0.8,1]}[t]||[0,1];pool=alt.slice(Math.floor(F[0]*alt.length),Math.floor(F[1]*alt.length));}}
  else if(_FETTE23[t]){const [a,b]=_FETTE23[t];pool=I.s.slice(Math.floor(a*I.s.length),Math.floor(b*I.s.length));}
  else{const meta=t==="avversario"?1:0;pool=I.g.filter((r,i)=>(i%2)===meta);}
  if(!pool.length)return null;
  let i=_hash23(t+"/"+sl)%pool.length,salti=salto|0;
  for(let k=0;k<pool.length;k++){const n=pool[(i+k)%pool.length].n;if(n===riservato)continue;if(salti-->0)continue;return n;}
  return null;
}
/* [23/09 POC] UNA PERSONA, UNA FACCIA, IN OGNI SCENA. Dentro un `ScenaVolti23` ogni figurina registra il volto che mostra; se
   quel volto e' gia' di un'ALTRA persona della stessa scena, si passa al successivo del suo gruppo. L'ordine e' quello del
   rendering (deterministico), e fuori dalle collisioni il volto resta quello di sempre. */
const ScenaCtx23=React.createContext(null);
function ScenaVolti23({children}){const r=React.useRef(null);if(!r.current)r.current={chi:new Map(),perChiave:new Map()};return <ScenaCtx23.Provider value={r.current}>{children}</ScenaCtx23.Provider>;}
function _fileVolto23(n){const I=VOLTI23.idx;if(!I||n==null)return null;const r=I.g.find(x=>x.n===n)||I.s.find(x=>x.n===n);return r?I.base+r.f:null;}
function voltoUrl(tipo,chiave,voltoId){
  try{
    const k=(tipo||"giocatore")+"/"+_slugVolto(chiave);
    const M=(typeof window!=='undefined'&&window.__CPM_VOLTI)||null;
    if(M){const u=M[k]||M[_slugVolto(chiave)];if(u)return u;}/* un manifesto esplicito resta prioritario */
    if(!VOLTI23.idx){_caricaVolti23();return null;}
    return _fileVolto23(voltoId!=null?voltoId:voltoId23(tipo,chiave));
  }catch(_e){return null;}
}
/* `Figurina` — larghezza dichiarata, altezza derivata dal rapporto. `nome` accende la fascia in basso,
   come sull'album. `ritratto` permette di passare un contenuto proprio al posto del ripiego. */
/* [7.973 · direttive PO 22/09: «per il momento togli tutte le faccine della libreria SVG che eliminero'»
   e «lo spazio rapporto 5:7 deve essere bianco neutro»]
   LO SPAZIO E' VUOTO, E DEVE SEMBRARE VUOTO. Il ripiego con la faccia tonda dentro la cornice e il fondo
   col colore del club sono stati tolti: il riquadro e' ora una superficie BIANCA NEUTRA col suo bordo,
   che e' esattamente cio' che il PO ha chiesto — lo spazio che aspetta la figurina, non un segnaposto che
   finge di essere un ritratto. Quando arriva l'arte (manifesto `window.__CPM_VOLTI`) l'immagine riempie il
   riquadro e il bianco sparisce; finche' non arriva, si vede lo spazio. */
function Figurina({tipo="giocatore",chiave,nome,ruolo,col,col2,larg=64,ritratto,style={},titolo,voltoId,...rest}){
  const w=Math.max(FIG.minW,Math.round(larg)), h=Math.round(w*FIG.h/FIG.w);
  const [,_rif23]=React.useReducer(x=>x+1,0);
  React.useEffect(()=>{if(VOLTI23.idx)return;VOLTI23.ascolta.add(_rif23);_caricaVolti23();return ()=>{VOLTI23.ascolta.delete(_rif23);};},[]);
  const _sc23=React.useContext(ScenaCtx23);
  let _vid23=voltoId;
  if(_sc23&&_vid23==null&&VOLTI23.idx&&!(typeof window!=='undefined'&&window.__CPM_NO_SCENA23)){const _k23=(tipo||"giocatore")+"/"+_slugVolto(chiave!=null?chiave:nome);
    if(_sc23.perChiave.has(_k23))_vid23=_sc23.perChiave.get(_k23);
    else{let n=voltoId23(tipo,chiave!=null?chiave:nome,0),z=0;while(n!=null&&_sc23.chi.has(n)&&_sc23.chi.get(n)!==_k23&&z<24){z++;n=voltoId23(tipo,chiave!=null?chiave:nome,z);}
      if(n!=null){_sc23.chi.set(n,_k23);_sc23.perChiave.set(_k23,n);}_vid23=n;}}
  const url=voltoUrl(tipo,chiave!=null?chiave:nome,_vid23);
  if(url&&!(typeof window!=='undefined'&&window.__CPM_NO_CORNICE23))return <FigurinaKorward23 url={url} tipo={tipo} chiave={chiave} nome={nome} ruolo={ruolo} col={col} col2={col2} w={w} h={h} titolo={titolo} style={style} rest={rest}/>;
  const conNome=!!nome&&w>=52;/* sotto i 52 px la fascia col nome non si legge: si mostra solo il riquadro */
  return(
    <div data-cpm-figurina={tipo} title={titolo||nome||undefined} style={{position:"relative",width:w,height:h,flexShrink:0,
      borderRadius:FIG.r,overflow:"hidden",background:"#ffffff",
      border:"1px solid rgba(15,23,42,0.16)",boxShadow:"0 1px 3px rgba(15,23,42,0.12)",...style}} {...rest}>
      {/* [7.974 — la figurina d'esempio del PO cambia due regole del riquadro]
          (1) `contain`, non `cover`: l'arte porta GIA' la sua cornice, il marchio KORWARD in alto e la
              fascia col nome in basso. Ritagliare anche solo il 3 % dell'altezza taglierebbe proprio
              quella fascia — «ATTACCANTE · 24 ANNI» sta a filo del bordo inferiore. Col fondo bianco del
              riquadro, un eventuale margine di `contain` e' invisibile.
          (2) [7.978.0 — CORRETTO dall'handoff del team character-lab, 22/09 sera] la fascia col nome del
              COMPONENTE si disegna SEMPRE, arte o no. Nel 7.974 l'avevo soppressa con l'arte per non fare
              «un secondo nome sopra il primo» — ma quel primo nome non esisteva: l'handoff dichiara che
              nel file d'esempio «Marco Rinaldi e il suo ruolo sono soltanto testo dimostrativo», cioe'
              avevo preso un MOCK-UP per una specifica. La regola vera: nome, cognome e ruolo li fornisce
              IL GIOCO dai dati di carriera, e il catalogo dei volti non conserva nomi ne' ruoli. Chi
              disegna lascia l'ultima fascia leggibile e libera. `contain` resta: serve a non tagliare la
              cornice. Rischio oggi nullo — in produzione non e' montata nessuna arte. */}
      {url
        ?<img src={url} alt={nome||""} width={w} height={h} loading="lazy" decoding="async"
           style={{width:"100%",height:"100%",objectFit:"contain",display:"block",background:"#ffffff"}}/>
        :(ritratto!=null?<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{ritratto}</div>:null)}
      {conNome&&(
        <div style={{position:"absolute",left:0,right:0,bottom:0,padding:"3px 5px",
          background:"linear-gradient(0deg,rgba(255,255,255,0.96),rgba(255,255,255,0.78) 62%,transparent)"}}>
          <div style={{fontSize:FS.caption,fontWeight:800,color:"#1e293b",lineHeight:1.15,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nome}</div>
          {ruolo?<div style={{fontSize:FS.caption,color:"#526279",lineHeight:1.15,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ruolo}</div>:null}
        </div>)}
    </div>);
}

/* [23/09 POC — FIGURINA COMPLETA, direttiva PO «le figurine sono tagliate e non contengono nome cognome peso altezza e non
   ereditano i colori del club»]. I DATI li fornisce il gioco, mai l'immagine:
   - eroe: nome, ruolo e colori del club da `window.__CPM_EROE23` (pubblicato da CareerApp); altezza e peso dallo STESSO aspetto
     del corpo 3D (`_heroAppr`: statura 1,86-2,02, corporatura 0,97-1,07) → 170-190 cm, peso = 22,4 x statura^2 x corporatura;
   - altri giocatori: aspetto da `appearanceFromSeed(hashStr(chiave))`, stesso calcolo (165-195 cm) — stabile per costruzione;
   - staff: nessun dato fisico, solo il mestiere.
   NOTA: l'handoff del 22/09 diceva «non scrivere statura»; il PO oggi chiede altezza e peso: vince la direttiva del PO. */
const _MESTIERE23={giornalista_f:"Giornalista",mister:"Allenatore",arbitro:"Arbitro",giornalista:"Giornalista",procuratore:"Procuratore",dirigente:"Dirigente"};
function datiFigurina23(tipo,chiave,nome,ruolo,col,col2){
  const t=tipo||"giocatore",sl=_slugVolto(chiave!=null?chiave:nome),E=_eroe23();
  const eroe=t==="giocatore"&&E&&(/^eroe(-|$)/.test(sl)||(E.nome&&(sl===_slugVolto(E.nome)||_slugVolto(nome||"")===_slugVolto(E.nome))));
  let n=nome||(eroe?E.nome:null);if(!n&&t!=="giocatore"&&t!=="avversario"&&chiave&&/[a-zà-ü]\s+[a-zà-ü]/i.test(String(chiave)))n=String(chiave);
  if(!n&&(t==="giocatore"||t==="avversario")&&chiave&&/^[A-Za-zÀ-ÿ'.]+(\s+[A-Za-zÀ-ÿ'.]+)+$/.test(String(chiave).trim()))n=String(chiave).trim();
  const parti=String(n||"").trim().split(/\s+/).filter(Boolean);const cognome=parti.length?parti[parti.length-1]:"",nomeP=parti.slice(0,-1).join(" ");
  let cm=null,kg=null;
  if(t==="giocatore"||t==="avversario"){try{let hh,gg;
    if(eroe&&E.avatarId!=null){const a=E.avatarId|0;hh=1.86+((a*73)%100)/100*0.16;gg=0.97+((a*131)%100)/100*0.10;}
    else if(typeof appearanceFromSeed==='function'){const ap=appearanceFromSeed(hashStr(t+"/"+sl));hh=ap.height;gg=ap.girth;}
    if(hh){cm=Math.round(165+(hh-1.82)/0.24*30);kg=Math.round(22.4*(cm/100)*(cm/100)*gg);}}catch(_e){}}
  /* in partita: compagni nei colori di casa, avversari nei colori dell'avversario (maglie in campo, `__CPM_PARTITA23`) */
  const PT=(typeof window!=='undefined'&&window.__CPM_PARTITA23)||null;const sq=PT?(t==="avversario"?PT.avv:(t==="giocatore"?PT.casa:null)):null;
  return {eroe,nome:nomeP,cognome,ruolo:ruolo||(eroe?E.ruolo:null)||_MESTIERE23[t]||(t==="avversario"?"Avversario":null),cm,kg,
    col:col||(eroe?E.col:null)||(sq&&sq.c)||null,col2:col2||(eroe?E.col2:null)||(sq&&sq.c2)||null};
}
/* La figurina Korward 5:7. Cornice nei colori del club (col = fondo e cornice, col2 = filetto e marchio), fascia alta KORWARD,
   ritratto QUADRATO su bianco (volti 512x512: `cover` in un quadrato = mai tagliati ne' deformati), fascia bassa col testo del
   gioco. Le scritte crescono con lo spazio: >=96 px scheda completa (nome, COGNOME, ruolo, cm/kg); 52-95 cognome e ruolo;
   sotto i 52 solo il ritratto; sotto i 40 niente marchio. */
function FigurinaKorward23({url,tipo,nome,ruolo,col,col2,w,h,titolo,style,rest,chiave}){
  /* [23/09 POC — CORNICE MODERNA, direttiva PO «piu' moderna, professionale e bella»] angoli morbidi, fondo in sfumatura
     diagonale nei colori del club (col -> scurito -> col2), riflesso lucido diagonale da carta patinata, ritratto con angoli
     arrotondati e filetto chiaro, marchio KORWARD sottile e spaziato, fascia bassa in vetro bianco: nome piccolo, COGNOME
     pieno, ruolo in pastiglia nel colore del club, altezza e peso in una riga separata. Rosso __CPM_NO_CORNICE23B (la cornice
     del primo giro). */
  const D=datiFigurina23(tipo,chiave,nome,ruolo,col,col2);
  const c1=D.col||TH.primary||"#8b1e3f",c2=D.col2||TH.accent||"#f59e0b";
  const piena=w>=96,media=!piena&&w>=52&&(D.cognome||D.ruolo);
  const vecchia=typeof window!=='undefined'&&window.__CPM_NO_CORNICE23B;
  const bordo=Math.max(2,Math.round(w*(vecchia?0.045:0.05)));const marchio=w>=40;
  const hTop=marchio?Math.max(8,Math.round(h*0.085)):0;const lato=w-2*bordo;const altoF=piena?Math.round(lato*0.86):lato;
  const rag=Math.max(3,Math.round(w*0.07)),ragF=Math.max(2,Math.round(w*0.04));
  const scuro=`color-mix(in srgb, ${c1} 62%, #000000)`;
  const fs1=Math.max(7,Math.round(w*0.058)),fs2=Math.max(9,Math.round(w*0.092)),fs3=Math.max(7,Math.round(w*0.05));
  const riga={overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.12};
  const topF=(hTop||bordo);
  return(
    <div data-cpm-figurina={tipo} data-cpm-volto="1" data-cpm-fig-piena={piena?"1":undefined} title={titolo||[D.nome,D.cognome].filter(Boolean).join(" ")||undefined}
      style={{position:"relative",width:w,height:h,flexShrink:0,borderRadius:vecchia?FIG.r:rag,overflow:"hidden",
      background:vecchia?c1:`linear-gradient(155deg, ${c1} 0%, ${scuro} 58%, ${c2} 100%)`,
      boxShadow:vecchia?`0 1px 3px rgba(15,23,42,0.22)`:(piena?`0 10px 24px rgba(2,6,23,0.35), inset 0 0 0 1px rgba(255,255,255,0.28)`:`0 1px 4px rgba(2,6,23,0.28), inset 0 0 0 1px rgba(255,255,255,0.22)`),...style}} {...(rest||{})}>
      {!vecchia&&<div aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:2,
        background:"linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.20) 47%, rgba(255,255,255,0.06) 53%, rgba(255,255,255,0) 62%)"}}/>}
      {marchio&&<div style={{height:hTop,display:"flex",alignItems:"center",justifyContent:"center",gap:Math.max(2,w*0.02),color:"#ffffff",
        fontWeight:vecchia?900:800,letterSpacing:Math.max(0.6,w*(vecchia?0.012:0.03)),fontSize:Math.max(6,Math.round(hTop*(vecchia?0.62:0.5))),lineHeight:1,fontFamily:"system-ui,sans-serif",textShadow:"0 1px 2px rgba(0,0,0,.35)"}}>
        {!vecchia&&piena&&<span style={{width:Math.round(w*0.07),height:1,background:c2,opacity:.9}}/>}KORWARD{!vecchia&&piena&&<span style={{width:Math.round(w*0.07),height:1,background:c2,opacity:.9}}/>}</div>}
      <div style={{position:"absolute",left:bordo,top:topF,width:lato,height:altoF,background:"#ffffff",overflow:"hidden",
        borderRadius:vecchia?0:ragF,boxShadow:vecchia?"none":`0 0 0 ${Math.max(1,Math.round(w*0.008))}px rgba(255,255,255,0.85)`,
        borderBottom:vecchia?`${Math.max(1,Math.round(bordo*0.6))}px solid ${c2}`:"none"}}>
        <img src={url} alt={[D.nome,D.cognome].filter(Boolean).join(" ")} width={lato} height={altoF} loading="lazy" decoding="async"
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"50% 30%",display:"block"}}/>
      </div>
      {(piena||media)&&<div style={{position:"absolute",left:bordo,right:bordo,bottom:bordo,top:topF+altoF+Math.max(2,Math.round(w*0.025)),
        background:vecchia?"#ffffff":"rgba(255,255,255,0.96)",borderRadius:vecchia?0:ragF,padding:piena?"3px 6px":"2px 4px",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:piena?Math.max(1,Math.round(w*0.008)):0,textAlign:"center",fontFamily:"system-ui,sans-serif"}}>
        {piena&&D.nome?<div style={{...riga,maxWidth:"100%",fontSize:fs1,color:"#64748b",fontWeight:600,letterSpacing:.2}}>{D.nome}</div>:null}
        {D.cognome?<div style={{...riga,maxWidth:"100%",fontSize:piena?fs2:FS.caption,fontWeight:900,color:"#0f172a",textTransform:"uppercase",letterSpacing:piena?.6:.3}}>{D.cognome}</div>:null}
        {D.ruolo?(piena&&!vecchia
          ?<div style={{...riga,maxWidth:"100%",fontSize:fs3,color:"#ffffff",background:c1,borderRadius:999,padding:`1px ${Math.round(w*0.035)}px`,fontWeight:800,textTransform:"uppercase",letterSpacing:.6}}>{D.ruolo}</div>
          :<div style={{...riga,maxWidth:"100%",fontSize:piena?fs3:FS.caption,color:"#475569",fontWeight:800,textTransform:"uppercase",letterSpacing:.4}}>{D.ruolo}</div>):null}
        {piena&&D.cm?<div className="cpm-num" style={{...riga,fontSize:fs3,color:"#334155",fontWeight:700,display:"flex",gap:Math.round(w*0.03),alignItems:"center"}}>
          <span>{D.cm} cm</span><span style={{width:1,height:fs3,background:"#cbd5e1"}}/><span>{D.kg} kg</span></div>:null}
      </div>}
    </div>);
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
function NpcFaceCoach({coachName,size}){return <Figurina tipo="mister" chiave={coachName||"mister"} larg={Math.round((size||52)*5/7)}/>;}

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
  _heroPhotoAssets=Promise.all([loadGLB('./assets/korward-regular-player.glb'),loadGLB('./assets/korward-regular-anims/regular-anim-idle.glb').catch(()=>null)])
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
    const appr={skin:av.skin,hair:av.hair,hairStyle:av.hairStyle||'short',bodyType:av.bodyType||'regular',bald:av.style==='bald',height:1.86+((id*73)%100)/100*0.18,girth:0.95+((id*131)%100)/100*0.13};
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
  if(err)return <Figurina tipo="giocatore" chiave={"avatar-"+_id} larg={Math.round(size*5/7)} style={style}/>;/* [7.973] il ripiego del ritratto non e' piu' una faccina della libreria: e' lo spazio bianco della figurina */
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

  return <div ref={containerRef} style={{width,height,overflow:"hidden",borderRadius:RAD.md,cursor:"grab"}}/>;
}

/* ========================================
   EUROPEAN CLUBS DATABASE  (req #11,#12)
======================================== */
const mkT=(id,n,a,p,c,c2,nat,lg)=>({id,n,a,p,c,c2,nat,lg});
