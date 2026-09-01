/* ========================================================================
 * KORWARD ELITE — frammento n° 12  (dei 20, numerati da 00 a 19)
 * src/12-three-match-view.jsx
 *
 * ThreeMatchView — IL RENDERER 3D DELL’HIGHLIGHT
 *
 * Il componente ThreeMatchView per intero (originale r.11309-17897): scena, campo,
 * stadio, folla, luci, camera, avatar e animazioni, palla, IA off-ball, il ciclo di
 * render e gli overlay di gioco.
 * ⚠ È UN SOLO componente da ~6.600 righe, e quasi tutto vive dentro un SOLO
 * useEffect di ~6.540 righe con 221 dichiarazioni const/let nella stessa chiusura.
 * Questo frangimento lo ISOLA, non lo rende più divisibile. Vedi src/README.md.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 11309-17899   ·   6591 righe di 41427
 * La prima riga dopo questa intestazione è la riga 11309 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 11282 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
function ThreeMatchView(props){
  const {playerX,playerY,homeCol,oppCol,allPlayers,homeClub,heroClub=null,oppClub=null,heroKitCol,avatarId=0,heroNum=10,subEntry=0,
    scoreHome=0,scoreAway=0,homeAbbr="HOM",awayAbbr="AWA",competitionLabel,
    stadiumHomeCol,stadiumAwayCol,stadiumHomeName=null,stadiumAwayName=null,stadiumHomeAbbr=null,stadiumAwayAbbr=null,stadiumHomeNat=null,stadiumAwayNat=null,stadiumHomeId=null,stadiumAwayId=null,stadiumVenue=null,stadiumStyle=0,ballX,ballY,
    matchPhase,onWalkoutDone,isDesktop=false,
    timeOfDay,weather,kickoffHour,attendance,crowd=null,
    isDerby=false,isBigGame=false,bgAction=null,hlZone=null,shootout=null}=props;/* [7.31.0] rigori 3D */
  const mountRef=useRef(null);
  const sr=useRef({players:[],ball:null,hero:null,raf:null,renderer:null,scene:null,camera:null});
  const propsRef=useRef(props);
  useEffect(()=>{propsRef.current=props;});
  // Sprint 3D-8b: overlay letterbox "REPLAY" (toggle di stato; non rigenera il canvas)
  const [replayOn,setReplayOn]=useState(false);
  // ATE-3: etichetta azione breve — appare all'inizio arco, sparisce al termine
  const [actionLabel,setActionLabel]=useState(null);
  useEffect(()=>{
    return;/* [7.529.0 collaudo PO] «durante la cronaca compaiono ancora in sovraimpressione le scritte tiro, parata, passaggio ecc. Non servono più!» — le targhette ATE-3 nascevano (7.x) quando la cronaca 3D era muta; ora il banner FM in campo racconta ogni battuta e la targhetta doppiava. Si spegne il SETTER (l'hook resta: ordine hook stabile), il markup sotto muore da solo. */
    /* eslint-disable no-unreachable */
    if(!bgAction)return;
    const lbl=ATE3_LABEL[bgAction.type];if(!lbl)return;
    setActionLabel(lbl);
    const t=setTimeout(()=>setActionLabel(null),(ATE3_TYPEMS[bgAction.type]||600)+120);
    return()=>clearTimeout(t);
  },[bgAction]);

  useEffect(()=>{
    const mount=mountRef.current;if(!mount)return;
    // game coords (0-100) → mondo 3D: lunghezza su x (-50..50), larghezza su z (-34..34)
    const G2X=gx=>(gx-50)*1.0, G2Z=gy=>(gy-50)*0.68;
    // ORIENTAMENTO CAMPO — sorgente unica di verità: home attacca verso +x (porta avversaria a destra)
    // Curva Sud (tifosi casa) sta a x=+sideX (dietro porta avversaria — in direzione attacco casa)
    const AWAY_GOAL_X=46, HOME_GOAL_X=-46; // x Three.js delle porte (nette interne)
    const GOAL_LINE_X=48.6; // [6.74.0 3D-1] piano REALE dei pali (buildStadium: fx=51−2.4; rete di fondo 49.4). Prima flash/gol scattavano a x=46, ~2.6u DAVANTI ai pali, e la palla non superava mai visibilmente la linea.
    const W=mount.clientWidth||360,H=mount.clientHeight||520;
    const club=homeClub||{};
    let pal;try{pal=getStadiumPalette(club);}catch(e){pal={skyTop:0x050810,skyHorizon:0x0c2050,fog:0x061430,grassA:0x2c6a1d,grassB:0x357a24,ambient:0xd0e4ff,ambInt:0.5,flood:0xffffff};}
    // Atmosfera dinamica: la NOTTE resta IDENTICA alla palette di lega (atmosfera da preservare);
    // solo day/dusk e il meteo modulano cielo, nebbia e intensità luci.
    const tod=timeOfDay||"night",wfx=weather&&weather.pitchFx; // wfx: null|wind|rain|fog|snow|storm
    let skyCol=pal.skyTop,fogCol=pal.fog,ambInt=pal.ambInt*1.46,sunInt=1.06,sunColor=pal.flood,hemiInt=0.56,fogNear=95,fogFar=260;/* [7.278.0 collaudo PO «live match leggermente piu luminoso, soprattutto di notte»] La notte e il ramo di DEFAULT: torri di luce (sunInt) +22%, ambiente +28% e cielo/prato (hemi) da 0.30 a 0.44 → i giocatori e le linee si leggono senza slavare il manto. */
    if(tod==="day"){skyCol=0x6fa8dc;fogCol=0xbcd0e0;ambInt=0.66;sunInt=0.86;sunColor=0xfff6e8;hemiInt=0.46;fogNear=150;fogFar=360;}/* Sprint 3D-G1: intensità ridotte → niente erba slavata (renderer senza tonemapping) */
    else if(tod==="dusk"){skyCol=0x2a1530;fogCol=0x2c1622;ambInt=0.60;sunInt=0.82;sunColor=0xffb070;hemiInt=0.42;fogNear=110;fogFar=290;}
    if(wfx==="fog"){fogNear=62;fogFar=190;ambInt*=0.9;}// FOG-1: era fogNear=18 → campo invisibile dalla cam larga (≥66u); ora 62→campo leggibile
    else if(wfx==="rain"){fogNear*=0.7;fogFar*=0.7;ambInt*=0.82;sunInt*=0.6;if(tod==="day")skyCol=0x5a6b78;}
    else if(wfx==="storm"){fogNear=Math.max(fogNear*0.65,60);fogFar*=0.62;ambInt*=0.65;sunInt*=0.45;if(tod==="day")skyCol=0x3c4756;}// FOG-1: fogNear era *0.55 (→52) → campo invisibile; ora min 60
    else if(wfx==="snow"){fogNear*=0.90;fogFar*=0.97;ambInt*=1.05;if(tod==="day")skyCol=0xa8b6c4;}/* [7.0.0] nebbia neve meno aggressiva · [7.6.1 collaudo PO «sparite le porte con la neve»] fog ancora più lontano (0.85/0.92→0.90/0.97) + cielo overcast più SCURO (0xc8d8e8→0xa8b6c4) → i pali bianchi non affogano più nel fondo biancastro */
    const scene=new THREE.Scene();
    /* [7.535.0 collaudo PO «cartelloni, striscioni, bandiere, sciarpe non ci sono più»] CENSIMENTO
       DELL'ARREDO (solo collaudo): l'occhio non distingue «la mesh non c'è» da «la mesh c'è ma la sua
       texture è vuota» — e sono due difetti diversi con due rimedi diversi. Questo hook percorre la scena,
       conta i piani con texture e CAMPIONA il canvas di ognuno: una texture vuota (tutta trasparente o
       tutta nera) si dichiara da sola. Senza questo, ogni indagine sull'arredo parte da uno screenshot. */
    if(typeof window!=='undefined')window.__CPM_DECOR=()=>{try{
      const out={n:0,piani:0,conTex:0,texVuote:0,neri:0,esempi:[],uniche:0,mb:0};const _seen=new Set();
      scene.traverse(o=>{if(!o.isMesh)return;out.n++;
        const g=o.geometry;if(!g||!g.type||!/Plane/.test(g.type))return;out.piani++;
        const m=o.material;if(!m||!m.map||!m.map.image)return;out.conTex++;
        const img=m.map.image;let vuota=null;
        if(!_seen.has(m.map.uuid)){_seen.add(m.map.uuid);out.uniche++;out.mb+=((img.width|0)*(img.height|0)*4)/1048576;
          const _k=(img.width|0)+"x"+(img.height|0);(out.dim=out.dim||{})[_k]=((out.dim||{})[_k]||0)+1;}
        try{if(img.getContext){const cx=img.getContext('2d');const w=img.width|0,h=img.height|0;
          if(w>0&&h>0){const d=cx.getImageData(0,0,Math.min(w,64),Math.min(h,64)).data;let alpha=0,lum=0;
            for(let i=0;i<d.length;i+=4){alpha+=d[i+3];lum+=d[i]+d[i+1]+d[i+2];}
            vuota=(alpha===0)||(lum===0);}else vuota=true;}}catch(_e){vuota=null;}
        if(vuota===true){out.texVuote++;if(out.esempi.length<6)out.esempi.push({w:img.width|0,h:img.height|0,trasp:!!m.transparent,pos:[+o.position.x.toFixed(1),+o.position.y.toFixed(1),+o.position.z.toFixed(1)]});}
        if(!m.transparent&&vuota===true)out.neri++;});
      return out;}catch(e){return{err:String(e&&e.message||e)};}};
    scene.background=new THREE.Color(skyCol);
    scene.fog=new THREE.Fog(fogCol,fogNear,fogFar);
    const camera=new THREE.PerspectiveCamera(56,W/H,0.1,420);
    // Camera portrait dietro la porta di casa (x basso), home attacca verso +x (verso l'alto)
    camera.position.set(0,26,46);camera.lookAt(0,1,0);/* [7.650.0] lo spawn e GIA in tribuna est: prima nasceva dietro-porta (-88,54,0) e il lerp verso la tribuna faceva ATTRAVERSARE il campo in transito per le prime scene (misurato: 24 percento dei campioni hl sotto z16, z fino a -5) */
    // 5.69.3 — la partita sta per creare il suo contesto WebGL: segnala "match attivo" e RILASCIA il contesto del
    //   renderer dei ritratti (creato nella schermata di creazione avatar), così NON restano contesti WebGL residui
    //   che facciano perdere quello del campo su alcuni dispositivi → fix SCHERMO NERO in partita.
    if(typeof window!=='undefined')window.__CPM_MATCH_ACTIVE=true;
    if(typeof _disposeHeroPhotoRenderer==='function')_disposeHeroPhotoRenderer();
    // Sprint 3D-10: perf mobile — antialias e DPR ridotti su mobile; shadow cheaper
    // [5.75.0 BUG-17] WebGL può NON essere disponibile (blacklist driver, memoria, WebView senza GL):
    //   il costruttore lancia e l'eccezione in un useEffect NON è catturata dagli error boundary → crash muto.
    //   Fallback: messaggio leggibile nel mount + abort pulito del setup 3D (la partita resta giocabile via UI).
    let renderer;
    try{renderer=new THREE.WebGLRenderer({antialias:isDesktop,powerPreference:'high-performance'});}
    catch(_eGL){
      try{mount.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:120px;color:#94a3b8;font-size:12px;text-align:center;padding:14px">⚠️ Grafica 3D non disponibile su questo dispositivo.<br/>La partita prosegue normalmente.</div>';}catch(_e){}
      if(typeof window!=='undefined')window.__CPM_MATCH_ACTIVE=false;
      return()=>{};
    }
    renderer.setSize(W,H);renderer.setPixelRatio(isDesktop?Math.min(devicePixelRatio,2):Math.min(devicePixelRatio,1.5));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=isDesktop?THREE.PCFSoftShadowMap:THREE.BasicShadowMap;
    /* [7.529.0 R5 — direttiva PO «procedi con R5»] LA CATENA COLORE VERA: ACES + sRGB sul renderer
       della partita (l'unico ACES del file stava nella scena Gala — audit: «l'immagine e' piatta per
       mancanza di catena colore, le correzioni sono cotte nei materiali»). L'interruttore __CPM_NO533
       spegne INSIEME catena e rimozione delle compensazioni cotte (erba 0,72/0,88 · floor emissivo kit
       0,14): mai l'una senza l'altra, o si somma doppia correzione. Esposizione tarata sul confronto
       fotografico (r5-prima/r5-dopo, 6 scene campione). */
    const _R5ON=!(typeof window!=='undefined'&&window.__CPM_NO533);
    if(_R5ON){renderer.toneMapping=(typeof window!=='undefined'&&window.__CPM_TM552==='cineon')?THREE.CineonToneMapping:(typeof window!=='undefined'&&window.__CPM_TM552==='reinhard')?THREE.ReinhardToneMapping:(typeof window!=='undefined'&&window.__CPM_TM552==='none')?THREE.NoToneMapping:THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=(typeof window!=='undefined'&&window.__CPM_EXPO552)?window.__CPM_EXPO552:((typeof window!=='undefined'&&window.__CPM_NO552)?0.78:((typeof window!=='undefined'&&window.__CPM_NO556)?0.60:0.52));/* [7.539.0 collaudo PO «i colori sono ancora un po' slavati», terza segnalazione — rosso __CPM_NO556] LA MISURA HA SPOSTATO IL BERSAGLIO DUE VOLTE. Cercavo il difetto nella NOTTE (il PO gioca di sera) e nella SATURAZIONE: sbagliato su entrambi i fronti. Congelando l'ORA con `__CPM_TOD` — cosa che la sonda del 7.537 non faceva, quindi misurava un'ora qualunque — di notte lo scarto col mondo pre-7.529 e' MINORE che di giorno (saturazione -3,2% contro -7,7%), e in entrambi i casi il numero grosso non e' il colore ma la LUCE: luminosita' +24,9% di notte e +39,7% di giorno, contrasto -6,0% e -8,5%. «Slavato» e' una scena troppo CHIARA e troppo PIATTA, non una scena poco colorata — ed e' per questo che il 7.537, che aveva agito sulla sola esposizione guardando la saturazione, non aveva chiuso la nota. Spazzolata la coppia luce x esposizione su scene congelate: luce x0,62 con esposizione 0,52 riporta la luminosita' al riferimento (+3,8%/-6,1% nei due giri) tenendo la saturazione a -5%. *//* [7.537.0 collaudo PO «i colori non sono ancora vividi come prima delle modifiche sulle luci» — rosso __CPM_NO552] LA DENSITA' TORNA DALL'ESPOSIZIONE, NON DALLA SATURAZIONE. Misurato su tre scene congelate a seed identico: col 7.536 la saturazione e' a -4,0% dal mondo pre-7.529 (poco), ma la luminosita' e' a +42% (molto) — ed e' quella che fa leggere «slavato». 0,78→0,60 riporta la scena verso la densita' di prima; il rosso riaccende il mondo del 7.536. *//* [7.531.0 collaudo PO dal telefono: «partita troppo troppo luminosa, i colori sono sbiaditi» — 1,02 in headless reggeva, sullo schermo vero lavava; 0,90 ancora chiara (screenshot 7.531, giorno velato): 0,78 — le intensita' del rig giorno (amb 0,66/hemi 0,46) sono dell'era SENZA tonemapping e con ACES si sommano */renderer.outputEncoding=THREE.sRGBEncoding;}/* esposizione 1,06->1,02: al primo giro fotografico tribune lavate */
    renderer.setClearColor(skyCol);
    /* [7.535.0] LA PERDITA DEL CONTESTO NON E' PIU' MUTA (vedi la nota gemella su `glbTry` in LiveMatch).
       `preventDefault()` sull'evento di perdita e' la CONDIZIONE perche' il browser tenti il ripristino:
       senza, il contesto resta morto per sempre e la scena vive con le texture perdute (arredo nero). Al
       ripristino si avvisa LiveMatch, che rimonta la vista e ricostruisce lo stadio nella stessa partita.
       I due contatori restano leggibili in collaudo: un difetto che si vede solo sul telefono del PO deve
       almeno lasciare un numero. */
    try{const _gl535=renderer.domElement;
      if(typeof window!=='undefined'&&window.__CPM_NO535GL)throw new Error("rosso 7.535: nessun ascolto del contesto");/* prova del rosso: si torna al mondo pre-7.535 (perdita muta, nessun ripristino) */
      _gl535.addEventListener('webglcontextlost',(ev)=>{try{ev.preventDefault();}catch(_e){}
        try{if(typeof window!=='undefined'){window.__CPM_GLLOST=(window.__CPM_GLLOST||0)+1;console.warn("[CPM-GL] contesto grafico perso: la scena verra' ricostruita al ripristino");}}catch(_e){}},false);
      _gl535.addEventListener('webglcontextrestored',()=>{try{if(typeof window!=='undefined'){window.__CPM_GLRESTORED=(window.__CPM_GLRESTORED||0)+1;window.dispatchEvent(new CustomEvent('cpm-gl-restored'));}}catch(_e){}},false);
    }catch(_e535){}
    mount.appendChild(renderer.domElement);

    // Luci dalla palette di lega, intensità modulata da orario/meteo
    scene.add(new THREE.AmbientLight(pal.ambient,ambInt));
    const sun=new THREE.DirectionalLight(sunColor,sunInt);sun.position.set(30,85,-24);sun.castShadow=true;
    const sm=isDesktop?2048:512;sun.shadow.mapSize.set(sm,sm);// Sprint 3D-10: 512 mobile
    sun.shadow.camera.left=-72;sun.shadow.camera.right=72;sun.shadow.camera.top=72;sun.shadow.camera.bottom=-72;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(pal.skyHorizon,pal.grassA,hemiInt));
    // Sprint 3D-11C: luci importanza big match/derby — luce ambientale addizionale sottile, scoped ai big match
    let bigMatchAmb=null;
    if(isDerby||isBigGame){bigMatchAmb=new THREE.AmbientLight(isDerby?0xff2200:0x2244ff,0.09);scene.add(bigMatchAmb);if(!wfx||wfx==="wind"){scene.fog.near*=0.84;scene.fog.far*=0.88;}}// FOG-1: moltiplicatore nebbia derby solo con meteo normale (non fog/storm/rain/snow)
    // Sprint 3D-11A: luce burst al gol — PointLight addizionale, intensità 0 a riposo
    const goalBurstLight=new THREE.PointLight(0xffaa44,0,140);goalBurstLight.position.set(0,28,0);scene.add(goalBurstLight);
    // [7.65.0 Phase 4 · ILLUMINAZIONE DINAMICA] la scena si SCALDA/ALZA con l'eccitazione (gol/palo/parata/finale/ingresso): warm ambient additivo, 0 a riposo → cinematografico senza costo
    const _exciteAmb=new THREE.AmbientLight(0xffd9a0,0);scene.add(_exciteAmb);

    // Campo — Sprint 3D-G1: di giorno scurisco l'erba (0.82×) per compensare l'assenza di tonemapping; notte invariata
    const _gA=new THREE.Color(pal.grassA),_gB=new THREE.Color(pal.grassB);
    // 3DV-10: dim globale erba su tutti i TOD (notte 0.88×, giorno 0.72×) — riduce fluorescenza
    {let _k533=_R5ON?((typeof window!=='undefined'&&window.__CPM_NO556)?(tod==="day"?0.80:0.75):(tod==="day"?0.50:0.47)):(tod==="day"?0.72:0.88);/* [7.539.0] la LUCE scende con l'esposizione (0,80/0,75 x0,62): agire sulla sola curva non bastava — ACES comprime verso il bianco proprio le zone gia' chiare, quindi togliere esposizione senza togliere luce recuperava poco e spegneva i colori (misurato nel 7.537: 0,56 restituiva 1,8 punti di saturazione e basta). */if(typeof window!=='undefined'&&window.__CPM_K533)_k533*=+window.__CPM_K533;/* [7.539] pomello di COLLAUDO sulle luci (test-only): serve a spazzolare luminosita' e contrasto senza toccare l'esposizione — la 7.537 aveva un pomello per la curva ma non per la LUCE, e la luce e' quella che il fotogramma legge come «slavato» *//* [7.531.0 collaudo PO «troppo luminosa, colori sbiaditi»] 0,96/0,90→0,88/0,82 · [7.532.0 secondo giro dal telefono: «ancora troppo luminosa e chiara»] →0,80/0,75 con esposizione 0,78 */_gA.multiplyScalar(_k533);_gB.multiplyScalar(_k533);
      /* [7.537.0 collaudo PO «i colori non sono ancora vividi come prima delle modifiche sulle luci» —
         rosso __CPM_NO552] LA VIVACITA' SI RESTITUISCE AI MATERIALI, NON ALLA CURVA. Misura su tre scene
         CONGELATE (stessa camera, stesso istante — la prima sonda scattava in autoplay e leggeva
         inquadrature diverse: la stessa esposizione dava -1,1% e -15,1% in due giri, misurava la scena):
         con la catena R5 la saturazione media del fotogramma e' **-7,7%** rispetto al mondo pre-7.529.
         Provate e SCARTATE con le loro misure: abbassare l'esposizione (0,78→0,56 recupera appena 1,8
         punti e spegne la scena) e cambiare curva (Cineon e nessun tone mapping risalgono a -4% ma
         portano la luminosita' a +47% sul pre-7.529, cioe' proprio il «troppo luminosa» del collaudo
         precedente; Reinhard peggiora a -12,3%). La desaturazione e' della curva ACES per costruzione:
         si compensa dove nasce il colore — qui il prato, sotto il kit — riportando in HSL cio' che il
         tone mapping toglie. */
      /* ⚠️ RIMEDIO PROVATO E REVOCATO, e la traccia resta perche' vale piu' del rimedio: saturare erba e
         kit a monte (offsetHSL +0,16 / kit 0,30→0,44) ha PEGGIORATO la misura — saturazione -9,9% contro
         il -4,0% di partenza, seed identico. La ragione e' nella curva: ACES comprime verso il bianco
         proprio i colori piu' intensi, quindi piu' si satura la sorgente piu' il tone mapping desatura.
         La misura pulita (tre scene congelate, STESSO seed — con nomi diversi i bracci giravano su
         partite e kit diversi e i numeri si scambiavano fra un giro e l'altro) dice che il divario col
         mondo pre-7.529 non e' nella saturazione (-4,0%) ma nella LUMINOSITA': +42%. Un fotogramma piu'
         chiaro legge come slavato anche a saturazione quasi uguale — ed e' la stessa nota che il PO
         aveva gia' dato («troppo luminosa»). Si agisce li'. */}/* [7.529.0 R5] il dim 0,72/0,88 era la compensazione dell'assenza di tonemapping (lo dice il commento storico qui sopra): con ACES si toglie quasi tutto — resta un filo, tarato sulle foto: 0,96 giorno · 0,90 notte (a 0,98 il prato notturno sembrava mezzogiorno, foto gi12) */
    // 5.49.16: VARIETÀ PRATO — meteo (bagnato scuro / neve sbiancata / sole più chiaro) + importanza (strisce più nette) + stadio (n°/orientamento strisce da seed).
    const _wStr=((typeof weather==="string"?weather:(weather&&((weather.id||"")+" "+(weather.name||"")+" "+(weather.pitchFx||""))))||"").toLowerCase();
    if(/rain|pioggia|temporal|storm|drizzle/.test(_wStr)){_gA.multiplyScalar(0.80);_gB.multiplyScalar(0.80);}
    else if(/snow|neve/.test(_wStr)){_gA.lerp(new THREE.Color(0xffffff),0.34);_gB.lerp(new THREE.Color(0xffffff),0.30);}
    else if(/seren|sole|\bsun\b|clear|☀/.test(_wStr)){_gA.multiplyScalar(1.06);_gB.multiplyScalar(1.06);}
    const _pSeed=Math.abs(hashStr((club?.id||club?.n||"x")+"_pitch")),_nStr=[6,7,8,9,10][_pSeed%5],_horiz=((_pSeed>>3)&1)===0;
    const _stB=_gB.clone();if(isBigGame)_stB.multiplyScalar(1.12);// grande sfida → strisce più nette (prato "da grande evento")
    /* [5.99.0 FIX PO «stadio fluttuante»] TERRENO ESTERNO: il prato era 104×68 (campo+apron) ma le
       tribune LG/XL della carriera (sideX fino a ~83 + profondità curva) stanno OLTRE il bordo → tra
       prato e curva si vedeva il CIELO sotto lo stadio (eclatante con la neve, cielo pallido).
       Piano di suolo esteso sotto TUTTO lo stadio, tonalità per meteo/ora (neve = manto CHIARO ma
       distinto dal cielo; giorno = piazzale verde-grigio; notte = asfalto scuro). */
    /* [7.188.0 collaudo PO «c'è una striscia laterale GRIGIA anziché l'erba prima delle linee del fallo laterale»]
     il piazzale attorno al campo era prima verde-grigio (staccava dal prato come «seconda erba», 7.186 → cemento),
     ma il cemento a bordo campo è peggio: fuori dai lati lunghi si vede una fascia grigia larga fino alle tribune.
     Ora è ERBA — la STESSA tonalità del prato appena scurita (ombra del bordo): continuità totale, nessuna
     striscia estranea. Neve e notte invariate. */
  const _grdTone99=(wfx==="snow")?0xdde3ea:(tod==="day"?_gA.clone().multiplyScalar(0.86).getHex():0x252831);/* [7.186.0 collaudo PO «c'è una striscia verde più chiara»] il piazzale diurno era VERDE-grigio (0x55604f) → accanto al prato leggeva come una seconda erba di tonalità diversa; ora è cemento scuro, coerente col bordo campo (e con la notte) */
    const _ground99=new THREE.Mesh(new THREE.PlaneGeometry(280,200),new THREE.MeshLambertMaterial({color:_grdTone99}));
    _ground99.rotation.x=-Math.PI/2;_ground99.position.y=-0.06;_ground99.receiveShadow=true;scene.add(_ground99);
    // [7.139.0 collaudo PO «il prato deve terminare ai cartelloni pubblicitari»] il prato era 68 di larghezza (z±34) mentre
    //   i cartelloni dei lati lunghi stanno a z=±34.8 → tra bordo prato e cartelloni restava una fascia di PIAZZALE GRIGIO
    //   (asimmetrico: dietro le porte il prato già arriva oltre i board). Ora il prato arriva ai cartelloni (z±34.9): niente
    //   più grigio tra erba e board. La touchline (z±33.2) e le bandierine d'angolo (z±33.2) coincidono già.
    const _GRW=70.0;/* [7.186.0] larghezza prato: bordo z±35.0, i cartelloni laterali stanno a z±35.2 → erba fino al board, zero fascia di piazzale (e la touchline z±33.2 resta con ~1.8u di erba di rispetto, come in un campo vero) */
    const _GRL=106.8;/* [7.190.0] lunghezza prato 104→106.8 (bordo x±53.4): dietro le porte i cartelloni stanno a x±53.2 → tolti i piani-pista (che coprivano quel tratto) l'erba arriva comunque al board, zero fascia di piazzale su NESSUNO dei 4 lati */
    const grass=new THREE.Mesh(new THREE.PlaneGeometry(_GRL,_GRW),new THREE.MeshLambertMaterial({color:_gA}));
    grass.rotation.x=-Math.PI/2;grass.receiveShadow=true;scene.add(grass);
    if(_horiz){const _sw=_GRW/_nStr;for(let i=0;i<_nStr;i++){const s=new THREE.Mesh(new THREE.PlaneGeometry(_GRL,_sw),new THREE.MeshLambertMaterial({color:i%2?_gA:_stB}));s.rotation.x=-Math.PI/2;s.position.set(0,0.01,-_GRW/2+_sw*0.5+i*_sw);s.receiveShadow=true;scene.add(s);}}
    else{const _sw=_GRL/_nStr;for(let i=0;i<_nStr;i++){const s=new THREE.Mesh(new THREE.PlaneGeometry(_sw,_GRW),new THREE.MeshLambertMaterial({color:i%2?_gA:_stB}));s.rotation.x=-Math.PI/2;s.position.set(-_GRL/2+_sw*0.5+i*_sw,0.01,0);s.receiveShadow=true;scene.add(s);}}
    // [7.61.0 collaudo PO «le linee del campo sono disegnate male»] le marcature erano THREE.Line = 1px in
    //   SCREEN-SPACE (larghezza costante a video, WebGL non ispessisce le linee): a distanza/di taglio la linea
    //   di metà campo diventava un FILO storto e le righe apparivano incoerenti in prospettiva. Ora sono NASTRI
    //   mesh a LARGHEZZA REALE dipinti sul prato (come l'intro/IntroCinematic) → leggibili a ogni distanza/angolo.
    //   Stessa geometria/coordinate: cambia SOLO il rendering (nessuna riga spostata; logica di gioco intatta).
    const lineMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.82,depthWrite:false,side:THREE.DoubleSide});/* [7.66.0 FIX collaudo PO «si vede solo il cerchio»] i nastri retti (perimetro/metà campo/aree) erano triangoli a winding rivolto in BASSO → FrontSide li CULLAVA (invisibili); il cerchio/dischetto (Ring/Circle rivolti in su) si vedevano. DoubleSide li rende da ogni lato. */
    const _LHW=0.16;// [7.69.0 collaudo PO «linee del fallo laterale non visibili»] mezza-larghezza riga (0.11→0.16): più leggibile a grazing-angle dalla camera bassa
    const _lineTris=[];// tutti i segmenti retti in UN buffer → 1 draw call
    const _seg=(x1,z1,x2,z2)=>{const dx=x2-x1,dz=z2-z1,L=Math.hypot(dx,dz)||1;const px=-dz/L*_LHW,pz=dx/L*_LHW;
      _lineTris.push(x1+px,0.03,z1+pz, x1-px,0.03,z1-pz, x2-px,0.03,z2-pz, x1+px,0.03,z1+pz, x2-px,0.03,z2-pz, x2+px,0.03,z2+pz);};
    const ln=pts=>{for(let i=0;i<pts.length-1;i++)_seg(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);};
    // [7.8.14 collaudo tester «la porta è troppo avanti, nell'area piccola»] la LINEA DI PORTA era a world ±50
    //   ma la porta REALE (pali) è a ±48.6 (buildStadium fx=51−2.4) e tutta la logica di gioco (GK, difensori,
    //   GOAL_LINE_X, palla) è centrata lì → la porta cadeva 1.4u DENTRO l'area piccola. Allineo linea di porta +
    //   aree ai pali (±48.6): il 6-yard box e la linea di fondo combaciano con la porta. Nessuna logica toccata.
    const _GLX=48.6;// linea di porta = piano dei pali
    const _TLZ=33.2;// [7.69.0 collaudo PO] touchline TIRATA DENTRO dal bordo prato (34→33.2): era ESATTAMENTE sul confine prato/piazzale (z=±34 = mezzo prato 68) → a grazing-angle si fondeva col fondo. Ora è su prato pieno = leggibile.
    ln([[-_GLX,-_TLZ],[_GLX,-_TLZ],[_GLX,_TLZ],[-_GLX,_TLZ],[-_GLX,-_TLZ]]);ln([[0,-_TLZ],[0,_TLZ]]);// perimetro + linea di metà campo
    [-1,1].forEach(s=>{const gx=s*_GLX,ix=gx-s*16.5,si=gx-s*5.5;ln([[gx,-20.16],[ix,-20.16],[ix,20.16],[gx,20.16]]);ln([[gx,-9.16],[si,-9.16],[si,9.16],[gx,9.16]]);});// aree 18/6 yard
    {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(_lineTris,3));g.computeVertexNormals();scene.add(new THREE.Mesh(g,lineMat));}
    // cerchio di centrocampo = ANELLO a larghezza reale (prima era una polilinea 1px) + dischetto + dischetti rigore
    {const cr=new THREE.Mesh(new THREE.RingGeometry(9.15-_LHW,9.15+_LHW,72),lineMat);cr.rotation.x=-Math.PI/2;cr.position.y=0.03;scene.add(cr);}
    {const cs=new THREE.Mesh(new THREE.CircleGeometry(0.17,18),lineMat);cs.rotation.x=-Math.PI/2;cs.position.y=0.03;scene.add(cs);}
    [-1,1].forEach(s=>{const ps=new THREE.Mesh(new THREE.CircleGeometry(0.16,16),lineMat);ps.rotation.x=-Math.PI/2;ps.position.set(s*(_GLX-11),0.03,0);scene.add(ps);});
    // [7.87.0 collaudo PO «lunetta delle aree di rigore»] la LUNETTA (la "D") mancava del tutto sul campo di gioco
    //   (c'era solo nell'intro). Arco r=9.15 centrato sul DISCHETTO (±37.6), reso SOLO nel settore FUORI dalla linea
    //   dei 16m (endpoint sulla linea dell'area), come il cerchio di centrocampo. RingGeometry → stesso rendering,
    //   additivo (nessuna riga esistente toccata). cos(soglia)=5.5/9.15 → apertura ±0.9195 rad (2·0.9195=1.839).
    [-1,1].forEach(s=>{const cx=s*(_GLX-11);const th0=s>0?(Math.PI-0.9195):(-0.9195);
      const arc=new THREE.Mesh(new THREE.RingGeometry(9.15-_LHW,9.15+_LHW,40,1,th0,1.839),lineMat);arc.rotation.x=-Math.PI/2;arc.position.set(cx,0.03,0);scene.add(arc);});
    // [7.94.0 collaudo PO «le bandierine sul campo non si vedono»] BANDIERINE D'ANGOLO: 4 aste con bandierina ai
    //   corner del campo (linea di porta × linea laterale, ±_GLX/±_TLZ). Mancavano del tutto. Asta bianca + drappo
    //   arancio (accento del gioco) rivolto verso il campo, DoubleSide → visibile da ogni angolo camera. depthTest
    //   attivo (occluse correttamente dai giocatori davanti). Additivo, nessuna geometria esistente toccata.
    // [7.119.0 collaudo PO «le bandierine non sono disegnate in maniera congruente, risolvi definitivamente»] due
    //   difetti: (a) il drappo era un RETTANGOLO piatto (non una bandierina) e (b) orientato lungo z (normale lungo z)
    //   → dalla camera broadcast che guarda DOWN-THE-PITCH (lungo x) era di TAGLIO = sottile sliver. Ora: asta più
    //   alta + PENNANT TRIANGOLARE (triangolo vero) orientato lungo x (rotation.y=π/2, DoubleSide) → face-on alla
    //   camera dietro la porta, leggibile e riconoscibile come bandierina a ogni angolo.
    {const _cfPole=new THREE.MeshStandardMaterial({color:0xf4f4f4,emissive:0x999999,emissiveIntensity:0.4,roughness:0.5,metalness:0.08,fog:false}),
       _cfFlag=new THREE.MeshBasicMaterial({color:0xf59e0b,side:THREE.DoubleSide,fog:false}),_cfh=2.1;
     // pennant triangolare (base sull'asta, punta verso il campo); geometria condivisa, orientata poi per angolo
     const _pennGeo=new THREE.BufferGeometry();_pennGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, 0,-0.52,0, 0.82,-0.26,0],3));_pennGeo.computeVertexNormals();
     [[_GLX,_TLZ],[_GLX,-_TLZ],[-_GLX,_TLZ],[-_GLX,-_TLZ]].forEach(([cx,cz])=>{
       const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,_cfh,8),_cfPole);pole.position.set(cx,_cfh/2,cz);pole.castShadow=true;pole.renderOrder=19;scene.add(pole);
       const flag=new THREE.Mesh(_pennGeo,_cfFlag);flag.position.set(cx,_cfh-0.14,cz);
       flag.rotation.y=cx>0?-Math.PI/2:Math.PI/2;/* punta verso il centro campo + faccia lungo x → face-on alla camera down-the-pitch */
       flag.renderOrder=19;scene.add(flag);});}
    // [7.70.0 collaudo PO «il prato non è disegnato bene, soluzione definitiva»] RIMOSSE le "chiazze d'usura": erano
    //   RETTANGOLI NERI a spigolo vivo (opacity 0.17) stampati sul prato — un box scuro a centrocampo + una STRISCIA
    //   scura lunga lungo la mediana (addW(0,0,6,40)) → leggevano come MACCHIE/box sporchi (segnalati dal PO). Un prato
    //   vero è pulito: strisce di taglio (mowing) + righe bianche, nessuna macchia. Il prato ora conta SOLO su quelle.

    // Stadio (riuso del builder AAA esistente)
    const sHome=stadiumHomeCol||homeCol||'#2563eb',sAway=stadiumAwayCol||oppCol||'#dc2626';
    // CROWD 2.0: il contesto folla arriva da computeCrowdContext (LiveMatch); __CPM_CROWD_OVERRIDE = hook di collaudo (solo test)
    const _crowdCtx=(typeof window!=='undefined'&&window.__CPM_CROWD_OVERRIDE)||crowd||null;
    /* [7.301.0 richiesta PO «su tutti i muretti delle tribune metterei striscioni con logo e nome della
       competizione, per dare a colpo d'occhio l'atmosfera giusta»] etichetta e colore della competizione — gli
       STESSI del tappeto di centrocampo e degli header (props.competitionLabel/competitionColor) — arrivano
       allo stadio: una sola fonte, cosi' il muretto non puo' dire una competizione diversa dal resto. */
    const _cmpLbl301=String(props.competitionLabel||club?.lg||"CAMPIONATO").toUpperCase();
    const _cmpCol301=props.competitionColor||(/coppa|cup|champions|europa|conference|continental/i.test(_cmpLbl301)?"#f5c542":/mondiale|europeo|nazional/i.test(_cmpLbl301)?"#34d399":"#d27f8c");
    try{const _sc=buildStadium(scene,sHome,sAway,{comp:{lbl:_cmpLbl301,col:_cmpCol301},prestige:club.p||club.prestige||65,style:stadiumStyle,floodColor:pal.flood,crowd:_crowdCtx,isDesktop,tpl:(function(){let _c=(_crowdCtx&&_crowdCtx.stadiumTpl)||((typeof stadiumConfigFor==="function")?stadiumConfigFor(club):null);// [5.89.0 S3] config con evoluzione/atmo dal LiveMatch
      // [5.88.0 S2] hook di COLLAUDO template (test-only, spento nella build store): window.__CPM_STADIUM_TPL_FORCE
      if(_c&&typeof window!=="undefined"&&!window.__CPM_STORE_BUILD&&window.__CPM_STADIUM_TPL_FORCE&&STADIUM_TEMPLATES[window.__CPM_STADIUM_TPL_FORCE]){
        const _ft=STADIUM_TEMPLATES[window.__CPM_STADIUM_TPL_FORCE];
        _c={..._c,template:window.__CPM_STADIUM_TPL_FORCE,rings:_ft.rings,corner:_ft.corner,roof:_ft.roof,tower:_ft.tower,fence:_ft.fence,standH:_ft.standH,dist:_ft.dist,megaCurva:!!_ft.megaCurva,asym:!!_ft.asym,modernity:_ft.mod,ledBoards:_ft.mod>0.55,screens:2};
      }
      return _c;})()});if(_sc){sr.current.crowdMats=_sc;sr.current.goalNet=_sc.goalNet;sr.current._curveGeo=_sc.curve||null;/* [7.185.0] geometria REALE delle curve per la scenografia tifo */}}
    catch(e){/* [7.535.0 collaudo PO «cartelloni, striscioni, bandiere, sciarpe non ci sono più» — IL CATCH
       CHE NASCONDEVA LO STADIO ROTTO] Questo catch era VUOTO: se `buildStadium` si interrompe a metà, la
       scena resta con le parti già aggiunte (gradinate e folla: ecco perché lo stadio sembra abitato) ma
       senza tutto ciò che viene dopo il punto di rottura — muretti, striscioni della competizione — e
       soprattutto senza il valore di ritorno: `crowdMats` (animazioni della folla) e `_curveGeo` restano
       nulli, e la scenografia tifo a valle ripiega sulla geometria STIMATA, che su un template diverso da
       quello storico appende teli e bandiere fuori posto. Un difetto così non deve poter essere muto:
       ora l'errore si registra (e in collaudo si legge da `__CPM_STADFAIL`). Il catch resta — una scena
       senza stadio è meglio di una schermata nera — ma smette di mentire. */
      try{if(typeof window!=='undefined'){window.__CPM_STADFAIL={msg:String((e&&e.message)||e),stack:String((e&&e.stack)||"").slice(0,600)};console.warn("[CPM-STADIO] costruzione interrotta:",(e&&e.message)||e);}}catch(_e535){}}

    // Factory giocatore (MeshPhong procedurale)
    // Sprint 3D-6: varietà deterministica per indice — altezza/corporatura + carnagione,
    // così i 22 giocatori non sono più cloni identici (nessun nuovo prop, seed = indice roster).
    const _fr=(n)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
    const SKN_TONES=[0xcfa07a,0x8d5524,0xf1c27d,0x6b3c2c,0xd4956a,0xa86b3c];
    // MT-2: occhi condivisi — una sola geo + mat per tutti i 22 player mesh
    const eyGeo=new THREE.SphereGeometry(0.038,6,5);
    const eyM=new THREE.MeshPhongMaterial({color:0x110800,shininess:40});
    const mkP=(col,isUser,seed,roleIdx=5)=>{
      const sd=seed||0,h1=_fr(sd*1.7+0.3),h2=_fr(sd*2.3+1.1),h3=_fr(sd*3.1+2.7);
      const g=new THREE.Group();
      // 3D-H2: separazione busto/fianchi — upper body lag su cambi direzione
      const torso=new THREE.Group();const hip=new THREE.Group();g.add(torso);g.add(hip);
      // 3DV-2: desatura colore maglia 20% (tessuto opaco, non fluorescente), shininess 55→16
      /* [7.547.0 — collaudo PO, QUARTA segnalazione: «il rosso del Liverpool sembra quasi arancione»
         · rosso __CPM_NO571] IL COLORE VIENE CONVERTITO DUE VOLTE. Il 7.529 (R5, la luce) ha introdotto
         `renderer.outputEncoding = sRGBEncoding` sul renderer della partita — prima non c'era ne' quello
         ne' il tonemap. Da allora Three converte l'uscita da LINEARE a sRGB, ma i colori dei kit sono
         esadecimali che sono GIA' sRGB: la conversione avviene una seconda volta. In r128 non esiste
         ColorManagement, quindi i colori dei materiali vanno portati in lineare a mano — e in tutto il
         file non c'era una sola `convertSRGBToLinear`.
         I CONTI TORNANO AL DECIMALE. Il verde di #dc2626 vale 0,149; convertito una volta di troppo:
         1,055 * 0,149^(1/2,4) - 0,055 = 0,422. Sullo screenshot del PO ho misurato G = 0,436. Rosso e blu
         si spostano poco (uno alto, uno basso), il verde sta dove la curva morde di piu' e QUASI TRIPLICA:
         un rosso con del verde dentro E' arancione. E spiega perche' saturazione e luminosita' risultavano
         CORRETTE (0,848 contro 0,827 · 0,875 contro 0,863) mentre l'occhio vedeva arancione: il difetto e'
         solo nella TINTA, e la tinta non era fra i tre numeri che misuravo dal 7.539.
         ⚠️ IL PO AVEVA RAGIONE SULLA DATA: «prima che lavorassi sulle luci i colori erano fantastici».
         Nel 7.528 il renderer della partita non aveva outputEncoding. Non era il display del telefono —
         ipotesi mia, sbagliata — ed erano cadute prima anche ACES (che anzi PROTEGGE il rosso: toglierlo
         fa crollare il picco dal 35% al 14%), la luce verde da terra (desaturata fino al grigio: la tinta
         non si muove) e la palette del club (sei stadi diversi, 42-43 gradi identici). */
      const _jc=new THREE.Color(col);const _jh={h:0,s:0,l:0};_jc.getHSL(_jh);_jc.setHSL(_jh.h,_jh.s*0.80,_jh.l*0.92);
      const jM=new THREE.MeshPhongMaterial({color:_jc,shininess:16});
      const sM=new THREE.MeshPhongMaterial({color:0x0d1226});
      const skM=new THREE.MeshPhongMaterial({color:isUser?0xcfa07a:SKN_TONES[Math.floor(h3*SKN_TONES.length)],shininess:18});
      const wh=new THREE.MeshPhongMaterial({color:0xfafafa});
      const bt=new THREE.MeshPhongMaterial({color:0x0a0a0a});
      const sho=new THREE.MeshPhongMaterial({color:0xeef0f3,shininess:14});// 5.44.0: pantaloncini bianchi (kit completo: maglia→pantaloncini→calzettoni)
      const addT=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);torso.add(m);return m;};
      const addH=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);hip.add(m);return m;};
      // 3DV-3: proporzioni umane — testa r=0.22 (era 0.27, ratio 1/4→1/5), collo visibile, torso atletico, gambe distanziate
      const hdMesh=addT(new THREE.SphereGeometry(0.22,10,7),skM,0,2.00,0);
      const hr=new THREE.Mesh(new THREE.SphereGeometry(0.25,10,6),new THREE.MeshPhongMaterial({color:0x2d1800}));hr.scale.y=0.62;hr.position.set(0,2.08,0);torso.add(hr);
      addT(eyGeo,eyM,-0.095,2.00,0.21);addT(eyGeo,eyM,0.095,2.00,0.21);// z=r*0.95 superficie sfera
      addT(new THREE.CylinderGeometry(0.10,0.12,0.22,7),skM,0,1.67,0);// collo più alto (era 0.13)
      addT(new THREE.CylinderGeometry(0.32,0.245,0.88,12),jM,0,1.22,0);// 5.44.2: busto ATLETICO a V (petto 0.32 largo, vita 0.245 stretta) — prima "a pera" (0.30 sopra, 0.34 sotto = tozzo); più alto e tondo (12 lati)
      addT(new THREE.BoxGeometry(0.56,0.15,0.31),jM,0,1.58,0);// 5.44.1: clavicola STRETTA (era 0.84 → spalle da football americano)
      addT(new THREE.SphereGeometry(0.115,9,7),jM,-0.40,1.56,0);addT(new THREE.SphereGeometry(0.115,9,7),jM,0.40,1.56,0);// 5.44.1: deltoidi tondi, piccoli e allineati all'attacco del braccio (erano r0.155 a x±0.46)
      addH(new THREE.CylinderGeometry(0.30,0.27,0.40,10),sho,0,0.74,0);// 5.44.0: PANTALONCINI (cilindro svasato bianco) — prima era un blocco scuro stretto
      const mkArm=(sx)=>{const ag=new THREE.Group();ag.position.set(sx*0.40,1.58,0);const u=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.07,0.44,7),jM);u.position.y=-0.22;ag.add(u);const f=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.055,0.36,6),skM);f.position.y=-0.56;ag.add(f);const el=new THREE.Mesh(new THREE.SphereGeometry(0.066,8,6),skM);el.position.y=-0.45;ag.add(el);const hn=new THREE.Mesh(new THREE.SphereGeometry(0.062,8,6),skM);hn.position.y=-0.77;ag.add(hn);torso.add(ag);return ag;};// 5.44.0: + gomito e MANO tondi (via i tronconi netti "lego")
      const mkLeg=(sx)=>{const lg=new THREE.Group();lg.position.set(sx*0.175,0.86,0);const th=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.088,0.50,8),skM);th.position.y=-0.26;lg.add(th);const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.082,0.068,0.40,8),wh);sh.position.y=-0.65;lg.add(sh);const kn=new THREE.Mesh(new THREE.SphereGeometry(0.084,8,6),skM);kn.position.y=-0.49;lg.add(kn);const bk=new THREE.Mesh(new THREE.BoxGeometry(0.17,0.09,0.33),bt);bk.position.set(0,-0.86,0.07);lg.add(bk);hip.add(lg);return lg;};// 5.44.2: gambe più LUNGHE e slanciate (anca 0.78→0.86, coscia 0.45→0.50, tibia 0.38→0.40) — meno tozze, piedi a terra; + ginocchio tondo
      const aL=mkArm(-1),aR=mkArm(1),lL=mkLeg(-1),lR=mkLeg(1);
      if(isUser){const r=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.055,7,24),new THREE.MeshBasicMaterial({color:0xffd700}));r.rotation.x=Math.PI/2;r.position.y=0.04;g.add(r);g._ring553=r;/* [7.553.0] l'aureola si tiene da parte: quando il corpo ruota per la rovesciata il cerchio ruota con lui e da fuori diventa una lama gialla in mezzo all'area — serve un riferimento per rimetterlo in piano */jM.emissive=new THREE.Color(col);jM.emissiveIntensity=0.04;}// 3DV-2: emissive 0.22→0.04 (era fluorescente)
      g._aL=aL;g._aR=aR;g._lL=lL;g._lR=lR;g._hd=hdMesh;g._torso=torso;g._tRot=0;g._ph=0;g._px=0;g._pz=0;g._sp=0;g._sd=sd*1.3;g._idle=_fr(sd+5)*6.28;
      // 3D-H2: morfologia per ruolo — GK alto/largo, DEF robusti, MID snelli, ATT atletici
      if(!isUser){
        const _rs=roleIdx===0?{y:1.08,xz:1.12}:roleIdx<=4?{y:1.01+h1*0.05,xz:1.04+h2*0.05}:roleIdx<=7?{y:0.97+h1*0.06,xz:0.96+h2*0.05}:{y:0.98+h1*0.04,xz:0.97+h2*0.05};
        g.scale.y=_rs.y;g.scale.x=g.scale.z=_rs.xz;
      }
      g.traverse(m=>{if(m.isMesh){m.castShadow=isDesktop||isUser;m.receiveShadow=true;}});
      return g;
    };

    // Portiere: colore distinto da ENTRAMBI i kit (evita confusione con i club colors)
    const _hCol=homeCol||'#2563eb',_aCol=oppCol||'#dc2626';
    const GK_POOL=['#1d1d1f','#facc15','#16a34a','#db2777','#e5e7eb','#06b6d4','#f97316'];
    let gkCol=GK_POOL[0],gkBest=-1;
    try{GK_POOL.forEach(k=>{const m=Math.min(colorDist(_hCol,k),colorDist(_aCol,k));if(m>gkBest){gkBest=m;gkCol=k;}});}catch(e){gkCol='#facc15';}

    // item 1 (5.49.8): NUMERO DI MAGLIA sulla SCHIENA della maglia (come un vero numero) — un piano-numero figlio del modello,
    //   ruota col corpo ed è occluso correttamente (niente più disco confusionario sopra la testa). Bianco con contorno scuro → leggibile su ogni kit.
    const _numTexCache={};
    // [7.132.0 collaudo PO «i cognomi dietro la maglia strasbordano, non si leggono → eliminarli»] revert al SOLO NUMERO
    //   grande, centrato, bianco con contorno scuro → leggibile su ogni kit. Firma invariata (nm ignorato: i call-site restano).
    const _mkNumTex=(n,nm)=>{if(_numTexCache[n])return _numTexCache[n];
      const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');x.textAlign='center';x.lineJoin='round';
      x.font='bold 90px Arial, sans-serif';x.textBaseline='middle';x.lineWidth=10;x.strokeStyle='rgba(7,9,16,0.95)';x.strokeText(String(n),64,66);x.fillStyle='#ffffff';x.fillText(String(n),64,66);
      const t=new THREE.CanvasTexture(c);_numTexCache[n]=t;return t;};
    const _mkNumPlane=(n,nm,w,h)=>new THREE.Mesh(new THREE.PlaneGeometry(w||0.5,h||0.5),new THREE.MeshBasicMaterial({map:_mkNumTex(n),transparent:true,side:THREE.DoubleSide,depthWrite:false}));// 5.49.14: aderente → non esce dalla sagoma · [7.132.0] solo numero
    // numerazione deterministica: GK=1, gli altri progressivi per squadra (l'eroe usa il suo numero reale)
    let _hN=2,_aN=2;const _heroN=heroNum||10;
    // 21 giocatori (home + away) dal prop allPlayers
    const players=[];let awayGkMesh=null; // CIN-2: ref portiere avversario per animazione tuffo
    (allPlayers||[]).forEach((pl,i)=>{
      const isHome=pl.team==='home';
      const col=pl.gk?gkCol:(isHome?_hCol:_aCol);
      const _ri=pl.gk?0:(i%11); // 0=GK, 1-4=DEF, 5-7=MID, 8-10=ATT
      const mesh=mkP(col,false,i+1,_ri);
      mesh.position.set(G2X(pl.x),0,G2Z(pl.y));mesh._px=mesh.position.x;mesh._pz=mesh.position.z;if(pl.gk)mesh._isGk=true;/* [7.153.0] portiere → ready stance in animOne */
      let _num;if(pl.gk)_num=1;else if(isHome){if(_hN===_heroN)_hN++;_num=_hN++;}else _num=_aN++;// salta il numero dell'eroe tra i compagni
      mesh._num=_num;mesh._name=pl.name||"";{const _bnp=_mkNumPlane(_num,mesh._name);_bnp.position.set(0,1.16,-0.2);_bnp.rotation.y=Math.PI;mesh.add(_bnp);}// [7.132.0] NUMERO sulla schiena (procedurale/gate; nascosto in GLB con la mesh proc)
      scene.add(mesh);players.push({mesh,team:pl.team,gk:!!pl.gk,num:_num});
      if(pl.gk&&pl.team==='away')awayGkMesh=mesh; // CIN-2
    });
    // Protagonista (ring dorato)
    const hero=mkP(heroKitCol||homeCol||'#22c55e',true,99);hero._isHero=true;// Step C: l'eroe mantiene risposta CRISP (controllo diretto), niente inerzia off-ball
    hero.position.set(G2X(playerX||50),0,G2Z(playerY||50));hero._px=hero.position.x;hero._pz=hero.position.z;scene.add(hero);
    const _heroSurn=(((typeof _surnBG==="function"&&_surnBG(props.heroName||""))||(props.heroName||"").trim().split(/\s+/).pop())||"").toUpperCase();// [7.130.0] cognome dell'eroe · [7.304.0] particella inclusa («De Luca», non «Luca»)
    hero._num=_heroN;hero._name=_heroSurn;{const _hnp=_mkNumPlane(_heroN,_heroSurn);_hnp.position.set(0,1.16,-0.2);_hnp.rotation.y=Math.PI;hero.add(_hnp);}// [7.132.0] NUMERO dell'eroe sulla schiena
    // Sprint 3D-6b: marcatore eroe — diamante soft sopra la testa (cono a 4 lati: simmetrico → billboard naturale)
    const heroMark=new THREE.Mesh(new THREE.ConeGeometry(0.30,0.5,4),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:0.8,depthWrite:false}));
    heroMark.rotation.x=Math.PI;scene.add(heroMark);
    // ===== 1.0b-CH38 — CALCIATORE GLB reale (CH38 Mixamo) per TUTTI (eroe + 21). ORA DEFAULT. Fallback automatico al procedurale se il GLB non carica. =====
    let glbAvatars=null; // [{root,mx,idle,run,proc,lx,lz}]
    // GLB = DEFAULT ON. Disattivabile: ?glb=0 (persiste), localStorage 'cpm-glb'='0', window.__CPM_GLB===false. (?glb=1 lo riattiva.)
    const _glbUrl=(typeof location!=='undefined')&&/[?&]glb=([01])\b/.exec(location.search||"");
    if(_glbUrl){try{localStorage.setItem('cpm-glb',_glbUrl[1]);}catch(e){}}
    let _glbPref=null;try{_glbPref=localStorage.getItem('cpm-glb');}catch(e){}
    const _useGLB=(typeof window!=='undefined')&&window.__CPM_GLB!==false&&_glbPref!=='0';
    try{window.__CPM_GLB_READY=_useGLB?false:true;window.__CPM_GLB_FAIL=null;}catch(_e){}/* [7.264.0] il flag di fallimento si azzera a ogni mount: una partita non eredita l'errore della precedente *//* [7.9.3 direttiva PO «basta burattini: se CH38 non è pronto non si gioca»] readiness esposta a LiveMatch: false=GLB atteso ma non ancora agganciato → il kickoff viene TRATTENUTO (overlay pre-fischio); diventa true all'aggancio del primo CH38 o su fallimento duro (ultima risorsa) */
    // [6.95.0 · 7.8.1 collaudo PO «iniziano la partita i soldatini — va assolutamente evitato / mai burattini»]
    //   GRACE PERIOD: finché il CH38 non è agganciato i mesh procedurali (giocatori + EROE) restano NASCOSTI
    //   (la logica/posizioni girano comunque); l'aggancio GLB ripristina la visibilità (coi figli procedurali
    //   spenti). La rete di sicurezza (ripristino procedurali) ora scatta a 12s (era 5s: su rete mobile lenta il
    //   GLB da 3.2MB tardava e i soldatini tornavano) e SOLO se il CH38 non è ancora agganciato; su fallimento
    //   DURO del corpo il ripristino è immediato nel .catch (niente campo vuoto).
    if(_useGLB){const _hideProc=()=>{try{const h=pp=>{if(pp&&!pp._glbDriven){pp.visible=false;pp._procHidden95=true;}};((sr.current&&sr.current.players)||[]).forEach(pp=>h(pp.mesh));h(hero);}catch(e){}};
      const _showProc=()=>{try{const s=pp=>{if(pp&&pp._procHidden95&&!pp._glbDriven){pp.visible=true;pp._procHidden95=false;}};((sr.current&&sr.current.players)||[]).forEach(pp=>s(pp.mesh));s(hero);}catch(e){}};
      // [7.8.19 collaudo tester «non devono comparire MAI i burattini ma sempre il CH38»] il backstop era 12s: su
      //   rete mobile lenta il footballer.glb (3.2MB) NON è agganciato entro 12s → _showProc mostrava i procedurali
      //   MENTRE il GLB stava ancora arrivando. Ora backstop a 45s (ultima risorsa; il GLB attaccandosi cancella
      //   comunque i procedurali) + retry del corpo sotto → i burattini appaiono solo se il CH38 è davvero irraggiungibile.
      // [7.8.25 collaudo tester «a inizio partita i giocatori non si vedevano!»] REGRESSIONE del 7.8.19: il backstop
      //   a 45s lasciava il campo VUOTO fino a 45s durante un load GLB lento/fallito. Ora 3s: campo vuoto al massimo
      //   ~3s (il GLB prefetchato si aggancia prima → nessun burattino), poi i procedurali GIOCABILI come rete di
      //   sicurezza (mai campo vuoto), e il CH38 subentra appena carica (il retry lo aggancia → i procedurali si rinascondono).
      /* [7.264.0 direttiva PO «burattini non ne voglio mai vedere in campo, piuttosto messaggio di errore/warning»]
         Il backstop a 3s mostrava i modelli procedurali come rete di sicurezza (e a 30s il fischio partiva CON
         loro): scelta ribaltata. Con il CH38 ATTESO i procedurali non entrano MAI in campo — restano nascosti e
         guidano solo la logica. Se il modello non arriva, LiveMatch mostra un AVVISO esplicito con «Riprova»
         (segnale __CPM_GLB_FAIL) invece di far giocare i burattini. Quando il GLB e' spento DI PROPOSITO
         (gate, ?glb=0, preferenza salvata) _useGLB e' false e questo blocco non esiste: li' i procedurali
         restano il renderer legittimo. */
      sr.current&&(sr.current._showProc=_showProc);try{window.__CPM_SHOW_PROC=_showProc;window.__CPM_PROCVIS=()=>{try{let c=0;((sr.current&&sr.current.players)||[]).forEach(pp=>{if(pp&&pp.mesh&&pp.mesh.visible&&!pp.mesh._glbDriven)c++;});if(hero&&hero.visible&&!hero._glbDriven)c++;return c;}catch(_x){return -1;}};}catch(_e){}/* [7.264.0] __CPM_PROCVIS: quanti modelli PROCEDURALI sono davvero visibili in campo — e' la misura con cui il guardiano no-puppets prova la direttiva (funzione: costa zero finche' nessuno la chiama) *//* [7.264.0] uscita DICHIARATA dall'avviso «Gioca comunque senza modelli 3D»: i procedurali entrano solo se lo decide l'utente */setTimeout(_hideProc,0);
      sr.current&&(sr.current._glbBackstop=setTimeout(()=>{if(!(sr.current&&sr.current._glbOn)){try{window.__CPM_GLB_FAIL="slow";}catch(_e){}}},9000));}
    // [7.8.1 collaudo PO «mai burattini»] SOLO footballer.glb è obbligatorio; OGNI clip di animazione è opzionale
    //   (.catch→null) → una singola anim che tarda/fallisce NON abbatte più l'intero modello (prima Promise.all
    //   rigettava se una qualsiasi delle 12 falliva → soldatini). Il modello si costruisce appena il corpo è pronto.
    if(_useGLB&&typeof loadGLB==='function'){const _optGLB=u=>loadGLB(u).catch(()=>null);
      // [7.8.19] RETRY del corpo footballer.glb (obbligatorio): un fallimento TRANSITORIO di rete mobile non deve
      //   mandare in campo i burattini → 3 tentativi con backoff (loadGLB evince i fallimenti dalla cache → riscarica).
      const _loadBody=(u,n)=>loadGLB(u).catch(e=>{if(n<=0)throw e;return new Promise(r=>setTimeout(r,1800)).then(()=>_loadBody(u,n-1));});
      Promise.all([_loadBody('./assets/footballer.glb',3),_optGLB('./assets/anim-idle.glb'),_optGLB('./assets/anim-jog.glb'),_optGLB('./assets/anim-kick.glb'),_optGLB('./assets/anim-penalty.glb'),_optGLB('./assets/anim-header.glb'),_optGLB('./assets/anim-tackle.glb'),_optGLB('./assets/anim-volley.glb'),_optGLB('./assets/anim-gk-dive.glb'),_optGLB('./assets/anim-gk-catch.glb'),_optGLB('./assets/anim-gk-block.glb'),_optGLB('./assets/anim-receive.glb'),_optGLB('./assets/anim-throwin.glb'),_optGLB('./assets/anim-jog-back.glb'),_optGLB('./assets/anim-strafe-left.glb'),_optGLB('./assets/anim-strafe-right.glb')]).then(([_cg,_ig,_jg,_kg,_pg,_hg,_tg,_vg,_dg,_cag,_bg,_rcg,_twg,_jbg,_slg,_srg])=>{/* [7.518.0 R3/3] le tre clip di locomozione erano SU DISCO e mai caricate (audit: zero riferimenti) *//* [7.24.1] +anim-throwin: la rimessa (mani sopra la testa) è la POSA dell'alzata di coppa nella cerimonia *//* [6.40.0] +anim-receive per il gesto DRIBBLE (prima dribble/pass = solo locomozione → la sterzata «restava ferma» col GLB) */
      // clip da file separati (Mixamo "without skin") applicate per NOME al rig del personaggio (stesso scheletro mixamorig)
      const _clip1=g=>(g&&g.animations&&g.animations[0])||null;
      const _ci=_clip1(_ig),_cr=_clip1(_jg);
      // 3D-KIT (Step A): kit a tinta unita PER MESH (le mesh Ch38_Shirt/Shorts/Socks/Shoes sono separate nel modello).
      // Maglia/pantaloncini/calzettoni/scarpe = MeshLambert piatto (leggibile a distanza) con floor emissivo (~14% → mai nero pieno di notte).
      // Pelle (Ch38_Body) e capelli (Ch38_Hair) mantengono la loro texture reale (niente tinta kit). kit={shirt,shorts,socks,shoes}.
      /* [7.529.0 R5] BLOB-SHADOW per i 22 su mobile: su telefono castShadow e' spento (solo pali e
         torri nello shadow map) e i giocatori FLUTTUANO — un disco radiale sotto i piedi ancora tutti
         a terra a costo ~zero (texture canvas condivisa, un piano per avatar, depthWrite off). Desktop
         tiene le ombre vere: niente doppia ombra. Interruttore unico R5 (__CPM_NO533). */
      let _blobMat533=null;
      if(!isDesktop&&!(typeof window!=='undefined'&&window.__CPM_NO533)){
        const _bc=document.createElement('canvas');_bc.width=_bc.height=64;const _bx=_bc.getContext('2d');
        const _bg=_bx.createRadialGradient(32,32,4,32,32,30);_bg.addColorStop(0,'rgba(0,0,0,0.34)');_bg.addColorStop(0.7,'rgba(0,0,0,0.16)');_bg.addColorStop(1,'rgba(0,0,0,0)');
        _bx.fillStyle=_bg;_bx.fillRect(0,0,64,64);
        const _bt=new THREE.CanvasTexture(_bc);
        _blobMat533=new THREE.MeshBasicMaterial({map:_bt,transparent:true,depthWrite:false});
      }
      const _blobGeo533=_blobMat533?new THREE.PlaneGeometry(1.7,1.15):null;
      const _mkA=(proc,kit,appr)=>{
        appr=appr||{};
        const root=(THREE.SkeletonUtils&&THREE.SkeletonUtils.clone)?THREE.SkeletonUtils.clone(_cg.scene):_cg.scene;
        if(_blobMat533){const _bl533=new THREE.Mesh(_blobGeo533,_blobMat533);_bl533.rotation.x=-Math.PI/2;_bl533.position.y=0.035;_bl533.renderOrder=1;root.add(_bl533);}/* [7.529.0 R5] il disco d'ombra viaggia col corpo (figlio del root: rotazione ininfluente su un radiale) */
        root.traverse(o=>{if(!o.isMesh)return;const _nm=(o.name||'').toLowerCase();if(_nm.includes('joint')){o.visible=false;return;}o.castShadow=isDesktop;o.frustumCulled=false;
          let _kc=null;if(_nm.includes('shirt'))_kc=kit.shirt;else if(_nm.includes('shorts'))_kc=kit.shorts;else if(_nm.includes('socks'))_kc=kit.socks;else if(_nm.includes('shoes'))_kc=kit.shoes;
          if(_kc!=null){const _c=new THREE.Color(_kc);const _no533k=(typeof window!=='undefined'&&window.__CPM_NO533);if(!_no533k)_c.offsetHSL(0,0.30,-0.02);/* [7.529.0 R5] ACES desatura i colori pieni (foto: bordeaux→rosa, giallo→crema). Il pre-boost sta QUI, a monte, cosi' difende ANCHE la texture kitPatternTex (che dipinge con _kc): il primo tentativo (+0,12 solo sul ramo tinta unita) lasciava le maglie texturizzate slavate */let _tex=null;if(_nm.includes('shirt')&&typeof kitPatternTex==='function')_tex=kitPatternTex(_kc,kit.c2||'#f0f0f0',kit.pattern||'solid',proc._num!=null?proc._num:undefined);/* [7.168.0] anche le tinta unita: shading tessuto (darkening 7.8.2 bakato in texture) · [7.260.0] +numero dipinto sul dorso */
            if(_tex){o.material=new THREE.MeshLambertMaterial({map:_tex,emissive:_c.clone().multiplyScalar(0.12),skinning:true});}
            else{/* [7.8.2 collaudo PO «Salernitana troppo rossa»] le molte luci del prato SATURANO i rossi scuri (il granata #6c1f2e clampava verso il rosa/rosso). Darkening AWARE della saturazione+scurezza: i colori SATURI e SCURI (granata, bordeaux) sono attenuati fino a ~−40% così restano fedeli sotto le luci; bianchi/neutri (s≈0) intatti → i kit chiari non si spengono. */
              const _hsl={};_c.getHSL(_hsl);const _dim=1-_hsl.s*0.60*(0.45+0.55*(1-_hsl.l));const _cd=_c.clone().multiplyScalar(_dim);/* [7.529.0 R5] il darkening 7.8.2 RESTA pieno anche sotto ACES: il tentativo di dimezzarlo (0,30) schiariva il bordeaux in rosa acceso (foto finale2 gi12/gi75) — il rosa era un rosso CHIARO, non un rosso desaturato; contro la desaturazione ACES basta il pre-boost +0,30 a monte */
              const _ef533=_no533k?0.14:0.06;/* [7.529.0 R5] il floor 0,14 era la compensazione «mai nero pieno di notte» pre-tonemapping: con ACES a 0,14 i kit brillano — 0,06 tarato sulle foto */o.material=new THREE.MeshLambertMaterial({color:_cd,emissive:_cd.clone().multiplyScalar(_ef533),skinning:true});}}// parte kit → tinta unita (o pattern su maglia)
          else if(_nm.includes('hair')){if(appr.bald){o.visible=false;}else{o.material=new THREE.MeshLambertMaterial({color:new THREE.Color(appr.hair||'#2d1800'),skinning:true});}}// 5.68.0: capelli a TINTA UNITA (come la foto profilo) → il colore scelto (es. biondo) è FEDELE in campo, non più mescolato con la texture scura del GLB (coerenza selezione↔live match)
          else if(_nm.includes('body')&&o.material&&o.material.map){o.material=o.material.clone();const _sk=new THREE.Color(appr.skin||0xffffff);o.material.color=_sk;if('emissive'in o.material){o.material.emissive=_sk.clone().multiplyScalar(_CPM_FACESOFT?0.34:0.22);}
            if(_CPM_FACESOFT){if(o.material.normalScale&&o.material.normalScale.set)o.material.normalScale.set(0.38,0.38);if('roughness'in o.material)o.material.roughness=Math.min(1,(o.material.roughness!=null?o.material.roughness:0.7)+0.15);}}// pelle: tono variabile + floor emissivo; cpmface: normal map attenuato (meno fronte corrucciata) + rough alto (meno hotspot duri) → volto meno severo
          else if(!o.material||!o.material.map){o.material=new THREE.MeshLambertMaterial({color:new THREE.Color(0xb0b0b0),skinning:true});}});// fallback (mesh senza texture)
        const _bb=new THREE.Box3().setFromObject(root),_h=(_bb.max.y-_bb.min.y)||1.8,_sc=(appr.height||1.95)/_h,_gi=appr.girth||1;root.scale.set(_sc*_gi,_sc,_sc*_gi);// altezza/corporatura per giocatore (Step B)
        const mx=new THREE.AnimationMixer(root);let idle=null,run=null;
        if(_ci){idle=mx.clipAction(_ci);idle.play();}
        if(_cr){run=mx.clipAction(_cr);run.play();run.weight=0;}
        mx.setTime(((proc._sd||0)%1)*0.8); // sfasa le animazioni per indice → niente 22 cloni sincroni
        proc._glbDriven=true; // animOne aggiorna solo la posizione per questo mesh (perf)
        try{if(sr.current){sr.current._glbOn=true;if(sr.current._glbBackstop){clearTimeout(sr.current._glbBackstop);sr.current._glbBackstop=null;}}}catch(_e){}// [7.8.19] CH38 agganciato → annulla il backstop dei burattini
        try{window.__CPM_GLB_READY=true;}catch(_e){}// [7.9.3] CH38 pronto → LiveMatch può fischiare l'inizio
        proc.visible=true;proc._procHidden95=false;// [6.95.0] il grace period nascondeva il ROOT: all'aggancio il root torna visibile (dentro c'è il GLB; i figli procedurali sotto restano spenti)
        proc.traverse(o=>{if(o.isMesh)o.visible=false;});// nascondi mesh procedurale (resta per logica/posizione)
        // item 1 (5.49.8): numero di maglia sulla SCHIENA del modello GLB — piano figlio del root (ruota col corpo), posizione dal bounding box.
        // 5.49.19: il numero NON è più figlio del root statico (si staccava durante l'animazione di corsa/ingresso).
        //   Trova l'osso della SCHIENA (spine/chest) e in render-loop posiziona il piano-numero sul dorso reale animato.
        let _spine=null;root.traverse(o=>{if(o.isBone&&!_spine&&/spine2|spine_02|chest/i.test(o.name||""))_spine=o;});
        if(!_spine)root.traverse(o=>{if(o.isBone&&!_spine&&/spine1|spine/i.test(o.name||""))_spine=o;});
        let _np=null;/* [7.260.0 collaudo PO «i numeri escono fuori dai bordi!»] via il PIANO FLOTTANTE 0.52 solo-yaw (più largo del busto, non seguiva il lean): il numero è ora DIPINTO nella texture della maglia (kitPatternTex 4° arg) — il loop render sui numPlane resta e no-opa su null */
        scene.add(root);
        return {root,mx,idle,run,proc,lx:proc.position.x,lz:proc.position.z,numPlane:_np,spine:_spine,_h:_h,bbMinY:_bb.min.y,bbMinZ:_bb.min.z};
      };
      // 3D-KIT (Step A): costruisci la COPPIA di kit con contrasto garantito (maglia away alternativa se i colori si scontrano).
      const _homeShirt=heroKitCol||homeCol||'#2563eb',_awayShirt=resolveKitConflict(_homeShirt,oppCol||'#dc2626');
      const _homeKit=buildKit(_homeShirt);let _awayKit=buildKit(_awayShirt);
      // [7.8.3] pattern maglia per ENTRAMBE le squadre (eroe + avversario): base = colore indossato, accento = c2 sociale.
      //   L'eroe usa heroClub (il 3D lo rende «home»), l'avversario oppClub → l'Inter in trasferta ha ORA le strisce.
      const _kpFor=(typeof kitPatternFor==='function')?kitPatternFor:(()=>null);
      const _homePat=(heroClub&&_kpFor(heroClub))||(_CPM_TEST&&typeof window!=='undefined'&&window.__CPM_FORCE_KITPAT)||null;
      if(_homePat){_homeKit.pattern=_homePat;_homeKit.c2=(heroClub&&heroClub.c2)||'#f0f0f0';}
      const _awayPat=(oppClub&&_kpFor(oppClub))||null;
      if(_awayPat){_awayKit.pattern=_awayPat;_awayKit.c2=(oppClub&&oppClub.c2)||'#f0f0f0';}
      if(_awayKit.shorts===_homeKit.shorts)_awayKit={..._awayKit,shorts:hexLum(_awayShirt)<0.5?'#cfd2d8':'#0d0d16'};// pantaloncini diversi tra le due squadre
      // portieri: due colori distinti da entrambe le maglie (e tra loro) dal GK_POOL
      let _gkA='#facc15',_gkB='#1d1d1f',_gb=-1;GK_POOL.forEach(k=>{const m=Math.min(colorDist(_homeShirt,k),colorDist(_awayShirt,k));if(m>_gb){_gb=m;_gkA=k;}});
      {let _b2=-1;GK_POOL.forEach(k=>{const m=Math.min(colorDist(_homeShirt,k),colorDist(_awayShirt,k),colorDist(_gkA,k));if(m>_b2){_b2=m;_gkB=k;}});}
      const _gkHomeKit=buildKit(_gkA),_gkAwayKit=buildKit(_gkB);
      // 3D-VARIETY (Step B): protagonista dal SUO avatar (mai casuale); NPC con aspetto deterministico per club+slot (persistente).
      const _av=(typeof AVATARS!=='undefined'&&AVATARS[avatarId])||null;
      const _heroAppr=_av?{height:1.86+((avatarId*73)%100)/100*0.16,girth:0.97+((avatarId*131)%100)/100*0.10,skin:_av.skin,hair:_av.hair,bald:_av.style==='bald'}:appearanceFromSeed(hashStr('hero_'+avatarId));
      const _homeKey=(homeClub&&(homeClub.id||homeClub.n))||homeCol||'H',_awayKey=oppCol||'A';
      glbAvatars=[_mkA(hero,_homeKit,_heroAppr)];
      players.forEach((p,pi)=>{const _kit=p.gk?(p.team==='home'?_gkHomeKit:_gkAwayKit):(p.team==='home'?_homeKit:_awayKit);
        const _appr=appearanceFromSeed(hashStr((p.team==='home'?_homeKey:_awayKey)+'_'+pi));
        glbAvatars.push(_mkA(p.mesh,_kit,_appr));});
      // #5 UNIFORMITÀ: l'ARBITRO usa lo stesso modello CH38 dei calciatori (kit nero arbitro, aspetto neutro deterministico) → niente più
      //   figura procedurale "diversa" dai giocatori. refMesh (dichiarato più sotto) è disponibile qui perché il .then è async. Costo: +1 skeleton (trascurabile).
      try{if(refMesh){const _refAv=_mkA(refMesh,{shirt:'#17171b',shorts:'#17171b',socks:'#17171b',shoes:'#0b0b0d'},appearanceFromSeed(hashStr('referee')));if(_refAv){_refAv._isRef=true;glbAvatars.push(_refAv);}}}catch(_re){}
      /* [7.518.0 R3/3 — LA LOCOMOZIONE HA DIREZIONI: audit «movimenti laterali e all'indietro sembrano
         pattinate»] Le clip jog-back/strafe-L/strafe-R erano negli asset e mai montate. Qui si RENDONO
         DISPONIBILI (clip condivise); le AnimationAction si creano PIGRE al primo uso per avatar — niente
         66 azioni preventive sui mixer (budget mobile). Esclusi GK (animazioni proprie) e arbitro. */
      {const _cbk=_clip1(_jbg),_csl=_clip1(_slg),_csr=_clip1(_srg);
       glbAvatars.forEach(av=>{if(av&&!av._isGk&&!av._isRef)av._locoClips={back:_cbk,strL:_csl,strR:_csr};});}
      // gesti one-shot: EROE (offensivi: kick/penalty/header/tackle/volley) + PORTIERE avversario (parata: dive/catch/block).
      // helper riusabile: monta una mappa di clipAction one-shot (peso 0 a riposo) su un qualunque avatar.
      const _mkGestures=(av,map)=>{if(!av)return;const out={};for(const k in map){const c=_clip1(map[k]);if(!c){out[k]=null;continue;}const a=av.mx.clipAction(c);a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.setEffectiveWeight(0);out[k]=a;}av.gestures=out;av._gw=0;av._gName=null;av._gAct=null;};
      _mkGestures(glbAvatars[0],{kick:_kg,penalty:_pg,header:_hg,tackle:_tg,volley:_vg,dribble:_rcg,lift:_twg});// [6.40.0] gesto dribble (fallback locomozione se la clip manca) · [7.24.1] lift = rimessa CONGELATA all'apice (alzata di coppa)
      // [7.24.1 collaudo PO «la coppa gli vola in testa, non la alza con le mani»] ossa delle MANI dell'eroe
      //   (mixamorig) per agganciare il trofeo alla posa vera durante la cerimonia.
      try{const _hAv=glbAvatars[0];if(_hAv&&_hAv.root){let _hl=null,_hr=null,_la=null,_lf=null,_ra=null,_rf=null;_hAv.root.traverse(o=>{if(!o.isBone)return;const n=o.name||"";if(!_hl&&/LeftHand$/i.test(n))_hl=o;if(!_hr&&/RightHand$/i.test(n))_hr=o;if(!_la&&/LeftArm$/i.test(n))_la=o;if(!_lf&&/LeftForeArm$/i.test(n))_lf=o;if(!_ra&&/RightArm$/i.test(n))_ra=o;if(!_rf&&/RightForeArm$/i.test(n))_rf=o;});_hAv._handL=_hl;_hAv._handR=_hr;_hAv._armB={la:_la,lf:_lf,ra:_ra,rf:_rf,hl:_hl,hr:_hr};}}catch(_e){}/* [7.24.2] + ossa BRACCIA: nel giro di campo i quaternioni della posa d'alzata (campionati in B1) vengono riapplicati DOPO il mixer → gambe che corrono, coppa in mano */
      /* [7.209.0 collaudo PO «la conclusione del compagno non è nitida, il pallone non sembrava calciato ma
         partiva e volava su traiettorie predefinite»] i gesti erano registrati SOLO su eroe e portieri: i 19
         compagni/avversari non avevano nessuna clip di calcio, quindi quando il compagno finalizzava l'assist
         il pallone se ne andava da solo mentre lui restava in corsa. Ora ogni giocatore di movimento ha `kick`
         e `header` (due clip GIÀ caricate e condivise: costa solo un AnimationAction a testa). */
      for(let _gi=1;_gi<glbAvatars.length;_gi++){const _av=glbAvatars[_gi];if(_av&&!_av._isGk&&_av.proc!==awayGkMesh)_mkGestures(_av,{kick:_kg,header:_hg,tackle:_tg,receive:_rcg,volley:_vg,lift:_twg});}/* [7.534.0 MP-1] +volley (la girata del compagno che finalizza non suona piu' `kick` generico) e +lift: il canale d'esultanza dei compagni (r.15872) chiedeva `lift` da 7.384 e la mappa non l'aveva — _want risolveva null e il ramo era MORTO (audit MP 1.§reazioni). Due AnimationAction in piu' a testa, clip gia' caricate. *//* [7.250.0 gi38] +tackle: la scivolata del difensore era solo procedurale = invisibile GLB-ON · [7.251.0 gi30/57] +receive: il CONTROLLO del ricevente durante il beat *//* [7.250.0 gi38 «non si vede l'intervento avversario»] la clip TACKLE anche ai non-eroi: la scivolata del difensore che porta via il pallone era solo procedurale = invisibile GLB-ON (stessa classe dei gesti eroe 7.245) */
      const _gkAv=glbAvatars.find(a=>a.proc===awayGkMesh);if(_gkAv){_gkAv._isGk=true;_gkAv.gestures=null;_mkGestures(_gkAv,{dive:_dg,catch:_cag,block:_bg});}
      // [6.74.0 3D-13] anche il portiere di CASA ha le clip di tuffo: sul gol subito (toOwnGoal) riceveva il
      //   gk_dive procedurale ma il suo GLB restava in locomozione → "scivolava" lateralmente senza tuffarsi.
      {const _hgkP=players.find(p=>p.gk&&p.team==='home');const _hgkAv=_hgkP&&glbAvatars.find(a=>a.proc===_hgkP.mesh);if(_hgkAv){_hgkAv._isGk=true;_hgkAv.gestures=null;_mkGestures(_hgkAv,{dive:_dg,catch:_cag,block:_bg});}}
    }).catch(e=>{try{console.warn('[CPM-GLB] load fail',e&&e.message);}catch(_){}try{window.__CPM_GLB_FAIL="error";}catch(_2){}/* [7.264.0 direttiva PO] niente piu' ripristino dei procedurali sul fallimento: il campo NON mostra burattini, LiveMatch alza l'avviso. __CPM_GLB_READY resta false → il fischio non parte con i modelli sbagliati */});}

    // Slot di walkout: due file (home+protagonista / away) lungo la larghezza, rivolte alla camera
    const _homeMeshes=[...players.filter(p=>p.team==="home").map(p=>p.mesh),hero];
    const _awayMeshes=players.filter(p=>p.team==="away").map(p=>p.mesh);
    // 5.47.17: ingresso in campo PIÙ CURATO — i giocatori ESCONO dal tunnel (lato campo) in fila INDIANA, scaglionati
    //   (delay per indice) e camminano in diagonale fino allo slot schierato. Non più tutti insieme dalla formazione.
    const _isWalkStart=props.matchPhase==="walkout"&&!_CPM_TEST;// solo se si PARTE dalla walkout (la prima partita) e NON sotto gate: altrimenti i mesh restano in formazione (gate/forzature intatti)
    const _placeRow=(list,xRow,side)=>{const n=list.length;list.forEach((m,i)=>{
      m._wx=xRow;m._wz=n>1?(-28+56*i/(n-1)):0;// slot finale schierato
      m._wDelay=0.18+i*0.20;// scaglionamento: emergono uno dopo l'altro dal tunnel
      m._wStartX=xRow-9;m._wStartZ=side*36;// [6.28.0] bocca del tunnel (lato campo) SEMPRE memorizzata → l'ingresso scaglionato si può riavviare all'inizio della fase walkout (non solo al mount)
      if(_isWalkStart){m.position.x=m._wStartX;m.position.z=m._wStartZ;m._px=m.position.x;m._pz=m.position.z;m._sp=0;}// partenza: bocca del tunnel (lato campo)
    });};
    _placeRow(_homeMeshes,-15,-1);_placeRow(_awayMeshes,-7,1);

    // Palla — 5.47.17: design MATCH-BALL MODERNO e RICONOSCIBILE — base bianca, pannelli curvi a contrasto (slate) + un
    //   accento di colore vivo (teal) a "swoosh" → niente pentagoni retro, niente bianco piatto "identico" (feedback PO).
    // [6.22.0] hiVis (direttiva PO): con neve/nebbia/tempesta il pallone bianco sparisce sul manto chiaro/nella
    //   foschia → pallone ARANCIONE alta visibilità (come i palloni invernali reali), pannelli scuri per contrasto.
    const _mkBallTex=(hiVis)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
      if(hiVis){x.fillStyle='#ff7a12';x.fillRect(0,0,256,256);
        const g=x.createRadialGradient(96,84,20,128,128,150);g.addColorStop(0,'#ffab4d');g.addColorStop(1,'#e35c00');x.fillStyle=g;x.fillRect(0,0,256,256);
      }else{x.fillStyle='#f4f7fb';x.fillRect(0,0,256,256);
        // ombreggiatura morbida (volume)
        const g=x.createRadialGradient(96,84,20,128,128,150);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#dfe5ee');x.fillStyle=g;x.fillRect(0,0,256,256);
      }
      // pannelli curvi a contrasto (struttura riconoscibile anche da lontano sul mobile)
      x.strokeStyle=hiVis?'#3a1400':'#2c3440';x.lineWidth=6;x.lineCap='round';x.lineJoin='round';
      [[60,58,78,0.15,1.55],[202,52,82,1.6,3.05],[214,200,80,3.2,4.7],[44,196,76,4.75,6.25],[128,128,120,0,6.283]].forEach(([ax,ay,r,a0,a1])=>{x.beginPath();x.arc(ax,ay,r,a0,a1);x.stroke();});
      // accenti "swoosh" (cyan sul bianco / scuri sull'arancio per non lavare il contrasto)
      x.strokeStyle=hiVis?'#2a1000':'#12b6c8';x.lineWidth=9;x.lineCap='round';
      [[128,40,18,0.6,2.55],[40,150,16,5.0,6.4],[216,150,16,2.7,4.1]].forEach(([ax,ay,r,a0,a1])=>{x.beginPath();x.arc(ax,ay,r,a0,a1);x.stroke();});
      // piccoli nodi scuri ai vertici dei pannelli (definizione)
      x.fillStyle=hiVis?'#2a1000':'#1c2330';[[128,30,5],[36,150,4.5],[220,150,4.5],[128,226,5]].forEach(([u,v,r])=>{x.beginPath();x.arc(u,v,r,0,6.283);x.fill();});
      return new THREE.CanvasTexture(c);};
    const _hiVisBall=(wfx==='snow'||wfx==='fog'||wfx==='storm');// neve/grandine·nebbia/foschia·tempesta → pallone arancione
    const ball=new THREE.Mesh(new THREE.SphereGeometry(0.32,24,16),new THREE.MeshPhongMaterial({map:_mkBallTex(_hiVisBall),shininess:42}));// 5.47.17: pallone ancora più piccolo (0.36→0.32) + design moderno riconoscibile
    ball.castShadow=true;ball.position.set(G2X(ballX||50),0.65,G2Z(ballY||50));scene.add(ball);
    // Sprint 3D-BALL: alone occlusione (depthTest:false) — palla visibile anche dietro i giocatori — 3DV-1: raggio 0.95, opacità ridotta
    const ballHalo=new THREE.Mesh(new THREE.SphereGeometry(0.46,10,7),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.05,depthTest:false,depthWrite:false}));// 5.47.17: halo proporzionato al pallone più piccolo (0.32)
    scene.add(ballHalo);
    /* [7.529.0 collaudo PO «mostra durante la cronaca l'ombra del pallone, a volte non si capisce nemmeno
       dov'e', e' molto piccolo» — rosso __CPM_NO534] Il pallone aveva castShadow ma su telefono le ombre
       vere sono spente (solo blob 7.529 per i giocatori): a terra niente lo ancorava. Blob-ombra dedicato,
       fratello di _blobMat533 ma SEMPRE attivo (anche desktop: sotto la palla l'ombra vera e' spesso fuori
       dal cono luce) — segue la palla sul piano erba, si allarga e sbiadisce quando la palla vola. */
    const _no534=(typeof window!=='undefined'&&window.__CPM_NO534);
    const _bShadow534=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      /* [7.537.0 collaudo PO «l'ombra del pallone la farei di un altro colore, in modo da individuarlo
         subito» — rosso __CPM_NO550] L'OMBRA SI STACCA DAL PRATO. Era un radiale NERO su erba verde: il
         nero e' il colore che il prato in ombra ha gia' addosso, quindi il segno si confondeva proprio
         quando serviva (ed e' lei che dice DOVE ricade la palla, 7.534). Resta un'OMBRA — nucleo scuro,
         non un disco fluo — ma porta un anello AMBRA a meta' raggio: l'ambra e' quasi il complementare
         del verde del campo, quindi si separa a colpo d'occhio in pieno sole come in notturna, senza
         accendere il prato. */
      const _no550=(typeof window!=='undefined'&&window.__CPM_NO550);
      const g=x.createRadialGradient(32,32,2,32,32,30);
      if(_no550){g.addColorStop(0,'rgba(0,0,0,0.60)');g.addColorStop(0.65,'rgba(0,0,0,0.32)');g.addColorStop(1,'rgba(0,0,0,0)');}
      else{g.addColorStop(0,'rgba(26,14,0,0.72)');g.addColorStop(0.42,'rgba(120,64,0,0.60)');g.addColorStop(0.66,'rgba(255,176,44,0.62)');g.addColorStop(0.86,'rgba(255,196,80,0.26)');g.addColorStop(1,'rgba(255,200,90,0)');}
      x.fillStyle=g;x.fillRect(0,0,64,64);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.05),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:0.85,depthWrite:false}));
      m.rotation.x=-Math.PI/2;m.position.y=0.032;m.renderOrder=1;m.visible=!_no534;scene.add(m);return m;})();
    // Sprint 3D-6b + BALL: scia palla 3D (x,y,z) — ghost-dots colorati per tipo azione, depthTest:false
    const TRAIL_N=14,trailDots=[],trailHist=[];
    for(let i=0;i<TRAIL_N;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(0.20,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthTest:false,depthWrite:false}));d.visible=false;scene.add(d);trailDots.push(d);}
    // === [6.71.0] SCIA "banana" del pallone (collaudo PO, ultracode) — LINEA additiva a dissolvenza, SOBRIA, SOLO su conclusioni COLPITE (tiro/testa/rigore/punizione).
    //   THREE r128: LineBasicMaterial non ha alpha per-vertice → la coda si spegne ramando il COLORE del vertice verso il NERO (additivo → nero=invisibile). Complementa i ghost-dots bianchi.
    //   Head scalata sulla luminanza del cielo (legge di giorno E di notte). Flag: window.__CPM_TRAIL / ?cpmtrail=0.
    const _TRAIL_ON=(typeof window==='undefined'||window.__CPM_TRAIL!==false)&&!/[?&]cpmtrail=0/.test((typeof location!=='undefined'&&location.search)||'');
    const ATRAIL_LEN=16;const _atPos=new Float32Array(ATRAIL_LEN*3),_atCol=new Float32Array(ATRAIL_LEN*3);
    const _atGeo=new THREE.BufferGeometry();
    _atGeo.setAttribute('position',new THREE.BufferAttribute(_atPos,3).setUsage(THREE.DynamicDrawUsage));
    _atGeo.setAttribute('color',new THREE.BufferAttribute(_atCol,3).setUsage(THREE.DynamicDrawUsage));
    _atGeo.setDrawRange(0,0);
    const _atMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false});
    const arcTrail=new THREE.Line(_atGeo,_atMat);arcTrail.frustumCulled=false;arcTrail.renderOrder=3;arcTrail.visible=false;scene.add(arcTrail);
    const _atHist=[];let _atFade=0;
    const _skyL=(((skyCol>>16&255)*0.3+(skyCol>>8&255)*0.59+(skyCol&255)*0.11)/255);const _atBoost=1.7+_skyL*1.5;// notte ~1.75× · giorno ~2.6× → l'additivo su prato/cielo chiaro non si lava (verify: head altrimenti invisibile di giorno)
    const _atHead=new THREE.Color(0.9*_atBoost,0.62*_atBoost,0.3*_atBoost);// ambra caldo — linea 1px sottile ma nettamente leggibile

    // Sprint 3D-G1: cartelloni LED broadcast — strisce emissive lungo le due touchline (additive, sul track esterno).
    // buildStadium resta invariato; queste sono la prima fila luminosa che incornicia il campo in TV.
    const LED_SEG=22,ledStrips=[],_ledCols=[new THREE.Color(_hCol),new THREE.Color(0xffffff),new THREE.Color(_aCol)];
    const _segW=100/LED_SEG;
    const _mkLed=(z)=>{for(let i=0;i<LED_SEG;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(_segW*0.9,0.7,0.12),new THREE.MeshBasicMaterial({color:0xffffff}));m.position.set(-50+_segW*0.5+i*_segW,0.42,z);scene.add(m);ledStrips.push(m);}};
    _mkLed(-34.4);_mkLed(34.4);
    // item 2 (5.49.12): CARTELLONI col LOGO DEL GIOCO — "ELEVORA" ben VISIBILE: DIETRO entrambe le porte (di fronte alla camera broadcast) + lungo le linee laterali. Look LED da bordo campo.
    /* [7.535.0 collaudo PO «cartelloni, striscioni, bandiere, sciarpe non ci sono più» — IL BUDGET DELLE
       TEXTURE] Censimento (hook __CPM_DECOR): 192 piani texturizzati per scena, **120 texture GPU distinte
       per ~44,5 MB** di solo arredo (mipmap escluse) — e moltissime IDENTICHE fra loro: le sciarpe della
       curva, per dire, disegnano lo stesso canvas 512×48 quarantasei volte, una per cella, perché ogni
       chiamata creava la propria CanvasTexture. Su un telefono quel conto si somma a folla, kit, volti e
       modelli: quando l'allocazione non riesce, la mesh resta ma la sua texture è vuota — e una texture
       vuota su materiale opaco è NERA. È la firma esatta della segnalazione («alla partita successiva si
       vedono»: scena nuova, memoria libera). Qui i generatori d'arredo diventano memoizzati per CHIAVE:
       stessi parametri → stessa texture riusata, nessun pixel diverso in scena. */
    const _texMemo535=new Map();
    const _memoTex535=(k,fn)=>{let t=_texMemo535.get(k);if(!t){t=fn();_texMemo535.set(k,t);}return t;};
    const _mkAdTex=(bg,fg)=>_memoTex535("ad|"+bg+"|"+fg,()=>_mkAdTexRaw(bg,fg));
    const _mkAdTexRaw=(bg,fg)=>{const c=document.createElement("canvas");c.width=1024;c.height=160;const x=c.getContext("2d");x.fillStyle=bg;x.fillRect(0,0,1024,160);/* [7.42.2 collaudo PO «cartelloni più definiti»] risoluzione 2× */
      _cvWordmark(x,512,80,96,fg,false);
      x.strokeStyle=fg;x.globalAlpha=0.5;x.lineWidth=6;x.strokeRect(16,16,992,128);x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t;};
    /* [7.44.0 direttiva PO «inventa pubblicità, sempre diverse da stagione a stagione, da club a club, da
       nazione a nazione»] pool di BRAND DI FANTASIA (copyright-safe, mai reali) con palette e stile propri;
       la selezione è SEEDATA da props.adSeed (club+stagione+nazione, da LiveMatch) → ogni stadio/stagione
       espone un mix diverso. Korward (brand del gioco) resta sui cartelloni dietro le porte. */
    const _ultrasLang=(nat)=>{const f=String(nat||"");if(/🇩🇪|🇦🇹|🇨🇭/.test(f))return "de";if(/🇬🇧|🇮🇪|🇺🇸|🏴/.test(f))return "en";if(/🇪🇸|🇦🇷|🇲🇽|🇺🇾|🇨🇴|🇨🇱/.test(f))return "es";if(/🇫🇷|🇲🇨/.test(f))return "fr";if(/🇵🇹|🇧🇷/.test(f))return "pt";if(/🇳🇱|🇧🇪/.test(f))return "nl";if(/🇹🇷/.test(f))return "tr";return "it";};/* [7.281.0] spostata QUI: la usano sia gli striscioni sia i cartelloni, che si costruiscono prima */
    /* [7.281.0 collaudo PO «i cartelloni pubblicitari devono essere nella lingua della squadra ospitante»]
       Le tagline erano ITALIANE ovunque: in uno stadio inglese si leggeva «ACQUA DI SORGENTE · LA PAUSA GIUSTA».
       Ora ogni brand porta la tagline nelle 8 lingue del gioco e la scelta segue la NAZIONE DI CASA (la stessa
       sorgente della lingua degli striscioni, `_ultrasLang`). I NOMI dei brand restano invariati: un marchio non
       si traduce, e sono comunque di fantasia. */
    const AD_BRANDS=[["VOLTARA",{it:"carica istantanea",en:"energy drink",de:"Energydrink",fr:"boisson énergisante",es:"bebida energética",pt:"bebida energética",nl:"energiedrank",tr:"enerji içeceği"},"#0b1c2e","#ffd24a"],["BANCA MERIDIA",{it:"dal 1921",en:"since 1921",de:"seit 1921",fr:"depuis 1921",es:"desde 1921",pt:"desde 1921",nl:"sinds 1921",tr:"1921'den beri"},"#101418","#9fd3ff"],["SKYLINEA",{it:"voli low cost",en:"low-cost flights",de:"Billigflüge",fr:"vols low cost",es:"vuelos low cost",pt:"voos low cost",nl:"goedkope vluchten",tr:"ucuz uçuş"},"#0e2038","#ffffff"],["FORTEZZA",{it:"assicurazioni",en:"insurance",de:"Versicherungen",fr:"assurances",es:"seguros",pt:"seguros",nl:"verzekeringen",tr:"sigorta"},"#161233","#f0a63a"],["LUNACOLA",{it:"gusto notturno",en:"night taste",de:"Geschmack der Nacht",fr:"goût nocturne",es:"sabor nocturno",pt:"sabor noturno",nl:"smaak van de nacht",tr:"gecenin tadı"},"#1a0d20","#ff7ab8"],["PIXEL+",{it:"la TV che vive",en:"the TV that lives",de:"Fernsehen, das lebt",fr:"la TV qui vit",es:"la tele que vive",pt:"a TV que vive",nl:"tv die leeft",tr:"yaşayan televizyon"},"#0a0a12","#7dff9a"],["MONTEVERDE",{it:"caffè d'autore",en:"signature coffee",de:"Kaffeekunst",fr:"café d'auteur",es:"café de autor",pt:"café de autor",nl:"koffie met karakter",tr:"özel kahve"},"#14210f","#ffe9c4"],["RAPIDO",{it:"fibra & mobile",en:"fibre & mobile",de:"Glasfaser & Mobil",fr:"fibre & mobile",es:"fibra y móvil",pt:"fibra e móvel",nl:"glasvezel & mobiel",tr:"fiber ve mobil"},"#211010","#ff9d5c"],["NORDIK",{it:"abbigliamento sportivo",en:"sportswear",de:"Sportbekleidung",fr:"vêtements de sport",es:"ropa deportiva",pt:"roupa desportiva",nl:"sportkleding",tr:"spor giyim"},"#0f1a24","#bfe3ff"],["OLIMPO",{it:"scarpe da gara",en:"race shoes",de:"Laufschuhe",fr:"chaussures de course",es:"zapatillas de carrera",pt:"sapatilhas de corrida",nl:"hardloopschoenen",tr:"yarış ayakkabısı"},"#191308","#ffd700"],["VELATOUR",{it:"viaggi su misura",en:"tailor-made travel",de:"Reisen nach Maß",fr:"voyages sur mesure",es:"viajes a medida",pt:"viagens à medida",nl:"reizen op maat",tr:"size özel seyahat"},"#0c2226","#8ef4e0"],["GRANFORNO",{it:"pizza in 5'",en:"pizza in 5 min",de:"Pizza in 5 Min",fr:"pizza en 5 min",es:"pizza en 5 min",pt:"pizza em 5 min",nl:"pizza in 5 min",tr:"5 dakikada pizza"}/* [7.282.0 collaudo PO «vedo ancora cartelloni con la lingua sbagliata»: «PIZZA IN 5'» era identico in italiano e inglese, quindi in Inghilterra si leggeva comunque italiano */,"#241108","#ffcf8a"],["ORAFICIO",{it:"orologi svizzeri",en:"swiss watches",de:"Schweizer Uhren",fr:"montres suisses",es:"relojes suizos",pt:"relógios suíços",nl:"zwitserse horloges",tr:"isviçre saatleri"},"#141414","#e8d9a0"],["TITANIO",{it:"motori elettrici",en:"electric motors",de:"Elektromotoren",fr:"moteurs électriques",es:"motores eléctricos",pt:"motores elétricos",nl:"elektromotoren",tr:"elektrikli motorlar"},"#0d1220","#c3ccf0"],["BRIOSNACK",{it:"la pausa giusta",en:"the right break",de:"die richtige Pause",fr:"la bonne pause",es:"la pausa perfecta",pt:"a pausa certa",nl:"de juiste pauze",tr:"doğru mola"},"#231b06","#fff06a"],["CRISTALLA",{it:"acqua di sorgente",en:"spring water",de:"Quellwasser",fr:"eau de source",es:"agua de manantial",pt:"água da nascente",nl:"bronwater",tr:"kaynak suyu"},"#0a1c2c","#aee4ff"],["FALCOMOTO",{it:"due ruote libere",en:"two free wheels",de:"zwei freie Räder",fr:"deux roues libres",es:"dos ruedas libres",pt:"duas rodas livres",nl:"twee vrije wielen",tr:"özgür iki teker"},"#1c0d0d","#ff6a4a"],["METEORA",{it:"videogiochi",en:"video games",de:"Videospiele",fr:"jeux vidéo",es:"videojuegos",pt:"videojogos",nl:"videogames",tr:"video oyunları"},"#160a26","#c07aff"],["PONTE",{it:"finanza semplice",en:"simple finance",de:"einfache Finanzen",fr:"finance simple",es:"finanzas simples",pt:"finanças simples",nl:"eenvoudig financieren",tr:"kolay finans"},"#0d1e16","#8ce8b0"],["QUADRIFOGLIO",{it:"auto ibride",en:"hybrid cars",de:"Hybridautos",fr:"voitures hybrides",es:"coches híbridos",pt:"carros híbridos",nl:"hybride auto's",tr:"hibrit otomobil"},"#0f2010","#b6ff7d"],["SIRENA",{it:"musica in streaming",en:"music streaming",de:"Musik-Streaming",fr:"musique en streaming",es:"música en streaming",pt:"música em streaming",nl:"muziekstreaming",tr:"müziği akıtan"},"#081826","#6ad6ff"],["VULCANO GYM",{it:"allenati vero",en:"train for real",de:"trainiere richtig",fr:"entraîne-toi vraiment",es:"entrena de verdad",pt:"treina a sério",nl:"echt trainen",tr:"gerçekten çalış"},"#200a0a","#ffb04a"]];
    const _adLang=_ultrasLang(stadiumHomeNat||homeClub?.nat||"");
    const _adTag=(b)=>{const t=b[1];return (typeof t==="string")?t:((t&&(t[_adLang]||t.it))||"");};
    const _mkBrandTex=(b,styleK)=>_memoTex535("br|"+String(b&&b[0])+"|"+_adTag(b)+"|"+styleK,()=>_mkBrandTexRaw(b,styleK));/* [7.535.0] stesso brand+stile = stessa texture (i cartelloni si ripetono lungo tutto il perimetro) */
    const _mkBrandTexRaw=(b,styleK)=>{const c=document.createElement("canvas");c.width=1024;c.height=160;const x=c.getContext("2d");
      /* [7.51.1 collaudo PO «mancano i cartelloni in questo stadio»] c'erano ECCOME, ma i bg dei brand sono quasi
         neri → di notte/da lontano leggevano come strisce SPENTE. Ora: metà dei cartelloni a palette INVERTITA
         (fondo = colore accento VIVO, testo scuro) + bande luminose top/bottom su tutti → LED leggibili sempre. */
      const inv=((styleK%2)+2)%2===1;const bg=inv?b[3]:b[2],fg=inv?b[2]:b[3];
      x.fillStyle=bg;x.fillRect(0,0,1024,160);x.textAlign="center";x.textBaseline="middle";
      x.fillStyle=inv?"rgba(0,0,0,0.55)":b[3];x.fillRect(0,0,1024,7);x.fillRect(0,153,1024,7);
      const b2=fg,b3=fg;/* alias per gli stili sotto */
      const st=((styleK%3)+3)%3;
      /* [7.59.0 collaudo PO «alcuni cartelloni hanno le scritte che strasbordano»] FIT-TO-WIDTH: le scritte a
         px fissi (74/58/66) sforavano i 1024px del canvas sui brand+tagline lunghi (es. «CRISTALLA · ACQUA DI
         SORGENTE») → misura e rimpicciolisci finché entrano nel margine (pattern text-fit 7.42.2). */
      const _fit=(txt,maxW,px,pre)=>{let s=px;x.font=`${pre} ${s}px Arial`;while(s>14&&x.measureText(txt).width>maxW){s-=2;x.font=`${pre} ${s}px Arial`;}return s;};
      if(st===0){/* nome pieno + tagline */x.fillStyle=fg;_fit(b[0],944,74,"900");x.fillText(b[0],512,64);x.globalAlpha=0.8;const _tg0=_adTag(b);_fit(_tg0,944,30,"italic 600");x.fillText(_tg0,512,122);x.globalAlpha=1;}
      else if(st===1){/* split bicolore */x.fillStyle=fg;x.fillRect(0,0,340,160);x.fillStyle=bg;const _n1=b[0].split(" ")[0].slice(0,8);_fit(_n1,300,56,"900");x.fillText(_n1,170,80);x.fillStyle=fg;const _t1=_adTag(b).toUpperCase();_fit(_t1,624,58,"900");x.textAlign="left";x.fillText(_t1,380,80);x.textAlign="center";}
      else{/* boxed outline */x.strokeStyle=fg;x.lineWidth=8;x.strokeRect(20,20,984,120);x.fillStyle=fg;const _bt=b[0]+" · "+_adTag(b).toUpperCase();_fit(_bt,944,66,"900");x.fillText(_bt,512,82);}
      const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t;};
    const _adSeed44=(props.adSeed>>>0)||1;
    const _adPal=[["#140a0e","#d27f8c"],["#180c10","#ffffff"],["#140a0e","#cf6d7e"]];// 5.49.14: logo ELEVORA in GRANATA CHIARO (non più azzurro)
    /* [7.105.0 collaudo PO «alcuni cartelloni si accavallano, non si leggono, fanno effetto lampeggiante»] CAUSA: i
       board erano larghi 13 ma distanziati solo 11-12 → si SOVRAPPONEVANO (testo tagliato ai bordi) e, essendo due
       piani trasparenti COMPLANARI sovrapposti, facevano Z-FIGHTING (il renderer alterna quale sta davanti a ogni
       frame = «lampeggio»). FIX: larghezza < passo (parametro w) → gap tra i board → niente overlap né z-fight. */
    const _mkAdBoard=(x,z,rotY,k,brandMode,w)=>{const p=_adPal[((k%3)+3)%3];const _bi=(_adSeed44+k*7)%AD_BRANDS.length;const m=new THREE.Mesh(new THREE.PlaneGeometry(w||13,1.7),new THREE.MeshBasicMaterial({map:brandMode?_mkBrandTex(AD_BRANDS[_bi],_adSeed44+k):_mkAdTex(p[0],p[1]),side:THREE.DoubleSide,transparent:true,opacity:0.98}));m.position.set(x,1.0,z);m.rotation.y=rotY;scene.add(m);};
    // [7.8.12/7.8.13 collaudo tester] i cartelloni erano a x=±49, IN FRONT della rete di fondo (49.4) → il piano
    //   TAGLIAVA la bocca della porta (comparivano davanti alla rete). Spostarli a ±51.2 (dietro TUTTA la porta,
    //   rete laterale ~51.15) li ha fatti SPARIRE dietro la curva/perimetro negli stadi piccoli. Posizione giusta:
    //   ±50.2 → DIETRO la rete di fondo (49.4, così non coprono più la bocca) ma DAVANTI a curva/perimetro (sempre
    //   visibili). La rete laterale (trasparente, 0.42) li sovrappone appena ai bordi z: innocuo.
    // [7.87.0 collaudo PO «mancano alcuni cartelloni pubblicitari nella curva (laterali)»] la fila dietro-porta
    //   copriva solo z=±13; +z=±24 la ESTENDE verso i lati della curva (i pannelli diagonali d'angolo restano
    //   RIMOSSI — 7.55.0, entravano in campo — qui è solo una fila retta più lunga a x=50.2, mai sul terreno).
    /* [7.106.2 collaudo PO «i cartelloni della curva sono STACCATI tra loro, brutto effetto TV»] il 7.105.0 li aveva
       stretti troppo (larghezza < passo → GAP visibili). Ora perimetro CONTINUO come i LED reali: passo UNIFORME e
       larghezza = passo + piccolo overlap (niente buchi), + ogni cartellone scostato di un epsilon in PROFONDITÀ
       (x per le porte, z per le fasce) → l'overlap NON è complanare, quindi niente z-fighting/lampeggio (la
       regressione del 7.105.0 evitata per costruzione). */
    /* [7.573.0 collaudo PO «i cartelloni pubblicitari in prima fila non sono cartelli pubblicitari» —
       rosso __CPM_NO573B] IL CARTELLONE PIU' INQUADRATO DELLO STADIO PORTAVA IL MARCHIO DEL GIOCO.
       Dietro ogni porta i cinque board erano costruiti con `brandMode = z!==0`: quello CENTRALE (z=0)
       cadeva quindi nel ramo `_mkAdTex`, che non disegna un inserzionista ma il wordmark KORWARD su una
       tinta piatta (`_adPal`). Ed e' esattamente lo spazio che la camera inquadra sempre — dietro la
       porta, al centro: in una trasmissione vera quello e' il board che si vende piu' caro, e qui era
       l'unico che non vendeva niente. Da fuori si legge come il PO l'ha letto: una tinta piatta in mezzo
       alla pubblicita'. Ora l'intero perimetro sono inserzionisti (`AD_BRANDS`, seedati per partita e
       nella lingua di chi ospita, invarianti 7.44/7.282); il marchio del gioco vive gia' nella UI e sul
       tabellone e non ha bisogno del bordo campo. */
    [-24,-12,0,12,24].forEach((z,i)=>{const _br573=(typeof window!=='undefined'&&window.__CPM_NO573B)?(z!==0):true;_mkAdBoard(50.2+i*0.03,z,-Math.PI/2,i,_br573,12.5);_mkAdBoard(-50.2-i*0.03,z,Math.PI/2,i+1,_br573,12.5);});/* dietro le porte · passo 12, w 12.5 (overlap 0.5), x-stagger anti-flicker */
    // lungo le linee laterali (lato TRIBUNA, camera-side z- e opposta z+): TUTTE pubblicità di fantasia seedate
    // [7.129.0 collaudo PO «i cartelloni devono stare DIETRO la linea della rimessa laterale e dunque anche della
    //   bandierina»] erano a z=±33.2 = SULLA touchline (e alla stessa z delle bandierine d'angolo _TLZ) → ora a ±34.8,
    //   OLTRE il bordo del prato (34) → dietro la touchline e dietro le bandierine, sul perimetro come i board veri.
    [-37.8,-25.2,-12.6,0,12.6,25.2,37.8].forEach((x,i)=>{_mkAdBoard(x,-34.8-i*0.03,0,i,true,13.1);_mkAdBoard(x,34.8+i*0.03,Math.PI,i+4,true,13.1);});/* passo 12.6, w 13.1 (overlap 0.5), z-stagger anti-flicker → strip continua */
    // [7.119.0 collaudo PO «i cartelloni si vedono su tutti i lati ma senza sponsor»] i board a BORDO CAMPO delle
    //   LINEE LATERALI (tribuna/distinti) sono di TAGLIO rispetto alla camera dietro la porta → leggono come strisce
    //   vuote. Solo la curva di fondo mostra sponsor leggibili. FIX: una fascia LED di sponsor RIALZATA e INCLINATA
    //   sul fronte di OGNI tribuna (2 lati lunghi + 2 curve), che la camera alta broadcast inquadra da sopra →
    //   sponsor leggibili su TUTTI gli stand. Additivo (i board a bordo campo restano) → zero regressione.
    // rotation.x SEMPRE -0.5 (bordo alto inclinato verso il campo → la camera alta legge la faccia); rotation.y
    //   orienta la faccia FRONTALE verso il campo così il testo non è specchiato (z<0 → +z guarda il campo → rotY=0;
    //   z>0 → -z guarda il campo → rotY=π). y=3.2 = poggia sul parapetto della prima fila, non fluttua.
    const _mkFacadeBoard=(x,z,rotY,k,w)=>{const _bi=(_adSeed44+k*13+11)%AD_BRANDS.length;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,3.2),new THREE.MeshBasicMaterial({map:_mkBrandTex(AD_BRANDS[_bi],_adSeed44+k+5),side:THREE.DoubleSide,transparent:true,opacity:0.97}));m.position.set(x,3.2,z);m.rotation.y=rotY;m.rotation.x=-0.5;m.renderOrder=6;scene.add(m);};
    // [7.125.0 collaudo PO «i cartelloni con gli sponsor fake devono essere in PRIMA fila e non nella eventuale
    //   SECONDA fila»] la fascia LED rialzata sul fronte delle tribune (facade, 2ª fila, 7.119.0) DOMINAVA la
    //   scena della SOSTITUZIONE (camera bassa vicino al dugout → si vedeva la faccia POSTERIORE del board = testo
    //   SPECCHIATO e gigante). RIMOSSA: gli sponsor restano SOLO sui board a bordo campo (1ª fila, _mkAdBoard con
    //   brandMode=true su tutti e 4 i lati). Onora la richiesta «prima fila». (_mkFacadeBoard resta definito ma inutilizzato.)
    /* [7.55.0 collaudo PO «i cartelloni pubblicitari angolari entrano nel campo, valuta se eliminarli proprio!»]
       RIMOSSI i 4 pannelli d'angolo (7.51.1→7.52.1): la «verifica geometrica» del 7.52.1 considerava solo il
       CENTRO del pannello (46.5,32.2) — ma il board è un PIANO con larghezza, e il bordo vicino del segmento
       diagonale spazzava DENTRO il terreno (screenshot PO: strisce sul campo agli angoli vicini). Riposizionati
       già due volte e sempre clippanti; sono puramente decorativi (le file LATERALI + le porte coprono già
       l'anello pubblicitario) → rimozione definitiva = niente più cartelloni sul campo, per costruzione. */
    // item 1 (5.49.9): TABELLONE STADIO (jumbotron) — pannello elevato dietro la porta avversaria con abbreviazioni + punteggio + minuto. Si aggiorna a ogni cambio.
    let _sbTex=null,_sbDraw=null,_sbLastH=-1,_sbLastA=-1,_sbLastC=-1;
    {const sc=document.createElement("canvas");sc.width=1024;sc.height=464;const sx=sc.getContext("2d");/* [7.42.2] tabellone 2×: numeri e wordmark nitidi */
      _sbDraw=(hA,aA,h,a,clk)=>{sx.setTransform(2,0,0,2,0,0);sx.fillStyle="#070b16";sx.fillRect(0,0,512,232);sx.strokeStyle="#2b3a5c";sx.lineWidth=5;sx.strokeRect(6,6,500,220);
        // 5.49.12: LOGO DEL GIOCO sullo schermo della curva
        _cvWordmark(sx,256,20,26,"#d27f8c",false);// [6.69.0] wordmark "Korward" + sottotitolo Elite (granata chiaro) sullo schermo della curva
        // [6.69.2] ⚠ _cvWordmark lascia textAlign=left/baseline=alphabetic → RIPRISTINA center/middle (altrimenti punteggio e sigle escono spostati a dx/in alto)
        sx.textAlign="center";sx.textBaseline="middle";
        sx.font="900 38px Arial, sans-serif";
        sx.fillStyle="#9fb3d8";sx.fillText(hA,100,120);sx.fillText(aA,412,120);
        sx.fillStyle="#ffffff";sx.font="900 92px Arial, sans-serif";sx.fillText(h+" - "+a,256,124);
        sx.fillStyle="#ffd24a";sx.font="900 38px Arial, sans-serif";sx.fillText((clk|0)+"'",256,196);};
      _sbDraw(homeAbbr,awayAbbr,scoreHome,scoreAway,props.matchClock||0);_sbTex=new THREE.CanvasTexture(sc);}
    /* [7.455.0 collaudo PO «schermo sospeso in aria negli stadi piccoli!»] IL MAXISCHERMO SI APPOGGIA A
       CIO' CHE HA DIETRO. La quota era FISSA a 15.5 per qualunque impianto, e il pilone fu tolto su
       richiesta nel 5.49.11 («resta sospeso sopra la curva, niente palo a vista»): scelta giusta con una
       curva alta alle spalle, sbagliata in provincia, dove la tribuna di fondo misura ~7 unita' e lo
       schermo galleggiava piu' in alto del doppio, contro il cielo. Ora la quota nasce dall'altezza VERA
       della tribuna (endH, la stessa che costruisce le gradinate) e la scala segue: piccolo negli
       impianti piccoli, grande dove c'e' una curva che lo regge. E dove dietro non c'e' niente da cui
       sembrare sospeso — livello provincia — torna un TRALICCIO, che li' e' esattamente quello che si
       vede negli stadi veri: non il palo a vista che il PO aveva fatto togliere da una curva alta. */
    {const _sc455=(sr.current&&sr.current.crowdMats)||null;/* buildStadium ritorna dentro un try: l'oggetto sopravvive qui */
     const _endH455=(_sc455&&_sc455.endH)||10, _lvS455=(_sc455&&_sc455.lvl!=null)?_sc455.lvl:1;
     const _bScale=Math.max(0.62,Math.min(1,_endH455/20));
     const _bW=17*_bScale,_bH=7.7*_bScale;
     const _fissa455=(typeof window!=="undefined"&&window.__CPM_NO455);/* interruttore test-only: ripristina la quota fissa — serve al guardiano per provare il rosso */
     const _bY=_fissa455?15.5:Math.max(_bH/2+2.2, _endH455*0.86);/* il bordo basso resta dentro la tribuna, mai contro il cielo */
     try{if(typeof window!=="undefined")window.__CPM_JUMBO455={y:+_bY.toFixed(2),h:+_bH.toFixed(2),endH:+_endH455.toFixed(2),lvl:_lvS455};}catch(_e455){}/* sonda: il guardiano confronta il bordo basso dello schermo con la sommita' della tribuna */
     const _board=new THREE.Mesh(new THREE.PlaneGeometry(_bW,_bH),new THREE.MeshBasicMaterial({map:_sbTex,transparent:true,opacity:0.98,side:THREE.DoubleSide}));
     _board.position.set(55,_bY,0);_board.rotation.y=-Math.PI/2;scene.add(_board);
     const _frame=new THREE.Mesh(new THREE.BoxGeometry(0.5,_bH*0.96,_bW*1.06),new THREE.MeshLambertMaterial({color:0x0a0f1c}));_frame.position.set(55.3,_bY,0);scene.add(_frame);
     if(_lvS455<=0){/* traliccio: due montanti e una traversa, dal terreno al telaio */
       const _tm=new THREE.MeshLambertMaterial({color:0x353b46});
       for(const _tz of [-_bW*0.36,_bW*0.36]){const _leg=new THREE.Mesh(new THREE.BoxGeometry(0.42,_bY,0.42),_tm);_leg.position.set(55.35,_bY/2,_tz);scene.add(_leg);}
       const _cross=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,_bW*0.72),_tm);_cross.position.set(55.35,_bY*0.52,0);scene.add(_cross);}}
    // 3DV-7: banner competizione LED — testo scorrevole sulla striscia esterna (canvas 1024×24)
    const _compLbl=(props.competitionLabel||homeClub?.lg||"CAMPIONATO").toUpperCase();
    const _mkCompBanner=(z)=>{
      const c=document.createElement("canvas");c.width=1024;c.height=24;
      const cx=c.getContext("2d");cx.fillStyle="#030610";cx.fillRect(0,0,1024,24);
      cx.font="bold 13px monospace";cx.fillStyle="rgba(255,255,255,0.82)";
      const seg="  "+_compLbl+"  ·  ";for(let k=0;k<12;k++)cx.fillText(seg,k*Math.ceil(seg.length*7.8),18);
      const tex=new THREE.CanvasTexture(c);tex.wrapS=THREE.RepeatWrapping;tex.repeat.set(1,1);
      const bm=new THREE.Mesh(new THREE.PlaneGeometry(100,0.55),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0.80,side:THREE.DoubleSide,depthWrite:false}));
      bm.rotation.x=-Math.PI/2;bm.position.set(0,0.48,z);scene.add(bm);return bm;};
    const compBanner1=_mkCompBanner(-34.9);const compBanner2=_mkCompBanner(34.9);

    // Particelle meteo (pioggia / temporale / neve) + flash per il temporale
    let wParticles=null,flashLight=null;
    if(wfx==="rain"||wfx==="storm"||wfx==="snow"){
      const isSnow=wfx==="snow";
      const N=isDesktop?(isSnow?800:(wfx==="storm"?2200:1400)):(isSnow?400:(wfx==="storm"?1000:650));// Sprint 3D-10: meteo dimezzato su mobile
      const wpos=new Float32Array(N*3);
      for(let i=0;i<N;i++){wpos[i*3]=(Math.random()-0.5)*132;wpos[i*3+1]=Math.random()*64;wpos[i*3+2]=(Math.random()-0.5)*92;}
      const wgeo=new THREE.BufferGeometry();wgeo.setAttribute('position',new THREE.BufferAttribute(wpos,3));
      /* [6.3.3 BUG-NEVE] i fiocchi erano sprite QUADRATI opachi (size .55, opacity .9): vicino alla camera bassa
         della punizione diventavano grossi quadrati bianchi che coprivano i giocatori. Ora fiocco TONDO e morbido
         (texture radiale) + opacità/size ridotte → nevica ma il campo resta leggibile. */
      let _snowTex=null;
      if(isSnow){const _sc=document.createElement('canvas');_sc.width=_sc.height=16;const _sx=_sc.getContext('2d');const _sg=_sx.createRadialGradient(8,8,0,8,8,8);_sg.addColorStop(0,'rgba(255,255,255,0.95)');_sg.addColorStop(0.45,'rgba(255,255,255,0.55)');_sg.addColorStop(1,'rgba(255,255,255,0)');_sx.fillStyle=_sg;_sx.fillRect(0,0,16,16);_snowTex=new THREE.CanvasTexture(_sc);}
      const wmat=new THREE.PointsMaterial({color:isSnow?0xffffff:0xbcd8ee,size:isSnow?0.48:0.3,map:_snowTex,transparent:true,opacity:isSnow?0.55:0.5,depthWrite:false});
      const wpts=new THREE.Points(wgeo,wmat);scene.add(wpts);
      wParticles={pts:wpts,pos:wpos,N,vy:isSnow?6:(wfx==="storm"?72:50),snow:isSnow};
    }
    if(wfx==="storm"){flashLight=new THREE.PointLight(0xbfe4ff,0,420);flashLight.position.set(0,130,0);scene.add(flashLight);flashLight.userData.t=0;}

    // Sprint 3D-G2: Stadio vivo — arbitro, guardalinee, panchine
    // Factory figurina leggera (primitivi: sfera testa + cilindro corpo) — non riusa mkP (troppo pesante per comparse)
    // 5.44.0: comparsa UMANOIDE (testa+collo, busto svasato, spalle tonde, 2 braccia con mani, 2 gambe) — non più "cilindro+sfera". Leggera (low-poly, niente ombre), piedi a y=0, scalata su hy.
    const mkFig=(col,hy=1.6)=>{const g=new THREE.Group();
      const bM=new THREE.MeshLambertMaterial({color:col});
      const hM=new THREE.MeshLambertMaterial({color:0xd4956a});
      const lM=new THREE.MeshLambertMaterial({color:0x17171f});// gambe (pantaloncini+calzettoni scuri)
      const mk=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;};
      [-1,1].forEach(s=>mk(new THREE.CylinderGeometry(0.072,0.058,0.66,6),lM,s*0.10,0.36,0));// gambe
      mk(new THREE.CylinderGeometry(0.19,0.165,0.24,8),bM,0,0.74,0);// bacino/pantaloncini
      mk(new THREE.CylinderGeometry(0.165,0.205,0.62,8),bM,0,1.05,0);// busto svasato
      const sh=mk(new THREE.SphereGeometry(0.20,8,6),bM,0,1.32,0);sh.scale.set(1,0.55,0.78);// spalle tonde
      [-1,1].forEach(s=>{const a=mk(new THREE.CylinderGeometry(0.052,0.044,0.52,6),bM,s*0.235,1.06,0);a.rotation.z=s*0.13;mk(new THREE.SphereGeometry(0.05,7,5),hM,s*0.30,0.80,0);});// braccia + mani
      mk(new THREE.CylinderGeometry(0.058,0.066,0.10,6),hM,0,1.40,0);// collo
      mk(new THREE.SphereGeometry(0.175,9,7),hM,0,1.56,0);// testa
      // [6.5.2] capelli — cap PIENO che copre corona+nuca (mai "pelato") + colore VARIATO per figura (prima: disco
      //   scuro piatto uguale per tutti → dalla camera broadcast sembravano rasati/calvi). Nessun impatto su gate
      //   (le figure panchina/arbitri non sono nella firma golden); Math.random già usato qui (vedi _ph sotto).
      const _HAIR=[0x241a10,0x130c06,0x3a2716,0x5c3a1c,0x87643a,0x6e6e6e,0x1c1c1c,0x2b2016];
      const _hcol=_HAIR[(Math.random()*_HAIR.length)|0];
      const hr=mk(new THREE.SphereGeometry(0.20,10,8),new THREE.MeshLambertMaterial({color:_hcol}),0,1.585,-0.012);hr.scale.set(1.05,0.84,1.10);// capelli folti (corona+nuca)
      g.scale.setScalar(hy/1.6);
      g._ph=Math.random()*6.28;return g;};
    // A) Arbitro principale — divisa nera, si muove con la palla
    const refMesh=mkFig(0x111111);scene.add(refMesh);
    // C) Guardalinee — divisa giallo-verde, ai margini del campo
    const linRef1=mkFig(0x9acd32);linRef1.position.set(0,0,-35.5);scene.add(linRef1);
    const linRef2=mkFig(0x9acd32);linRef2.position.set(0,0,35.5);scene.add(linRef2);
    // B) Panchine — 3DV-11: lato TRIBUNA (z=-38, nord) — struttura dugout realistica
    const _hColInt=new THREE.Color(_hCol).getHex(),_aColInt=new THREE.Color(_aCol).getHex();
    const benchFigs=[];
    const _mkBench=(bx,kitCol)=>{
      const dZ=-38.5;// tribuna (nord, z negativo)
      // Pavimento dugout (leggermente sotto livello campo)
      const flM=new THREE.MeshLambertMaterial({color:0x1e1e28});
      const dFloor=new THREE.Mesh(new THREE.BoxGeometry(13,0.28,2.6),flM);dFloor.position.set(bx,-0.14,dZ);scene.add(dFloor);
      // Parete posteriore
      const dBack=new THREE.Mesh(new THREE.BoxGeometry(13,3.0,0.28),flM);dBack.position.set(bx,1.5,dZ-1.2);scene.add(dBack);
      // Tetto/pensilina (trasparente fumé)
      const rfM=new THREE.MeshLambertMaterial({color:0x667788,transparent:true,opacity:0.55});
      const dRoof=new THREE.Mesh(new THREE.BoxGeometry(13.5,0.22,2.9),rfM);dRoof.position.set(bx,3.0,dZ);scene.add(dRoof);
      // Seduta panchina
      const bSeat=new THREE.Mesh(new THREE.BoxGeometry(11.5,0.18,0.5),new THREE.MeshLambertMaterial({color:0x2a3a4a}));bSeat.position.set(bx,0.68,dZ+0.5);scene.add(bSeat);
      // 6 giocatori seduti
      for(let i=0;i<6;i++){const f=mkFig(kitCol,1.2);f.position.set(bx-7.5+i*2.8,0.72,dZ+0.4);f._home=(bx<0);scene.add(f);benchFigs.push(f);}// 5.45.2: tag lato
      // Coach in piedi sul bordo campo
      const coach=mkFig(kitCol,1.55);coach.position.set(bx+(bx<0?5:-5),0,-36.0);coach._home=(bx<0);coach._isCoach=true;scene.add(coach);benchFigs.push(coach);
      // Vice-allenatore
      const staff=mkFig(kitCol,1.4);staff.position.set(bx+(bx<0?7.5:-7.5),0,-36.2);staff._home=(bx<0);staff._isCoach=true;scene.add(staff);benchFigs.push(staff);
    };
    _mkBench(-14,_hColInt);_mkBench(14,_aColInt);
    // item 9 (5.49.2): MASCOTTE — un bambino per ogni calciatore, in DIVISA AVVERSARIA, tenuto per mano durante l'ingresso.
    //   Visibili SOLO nella cerimonia (walkout) → fuori dalla walkout sono nascosti (zero impatto su gioco/gate/perf in partita).
    const _mascots=[];
    const _mkMascot=(pmesh,kitInt)=>{const c=mkFig(kitInt,1.04);c.visible=false;scene.add(c);_mascots.push({c,p:pmesh});};
    _homeMeshes.forEach(m=>_mkMascot(m,_aColInt));_awayMeshes.forEach(m=>_mkMascot(m,_hColInt));

    // Sprint 3D-G3A / 3DV-8 / 3DV-11: bandiere bicolore animate + striscioni sulle curve
    // 3DV-11: _fez = faccia frontale della tribuna (endZ - endD/2) — era calcolato dentro la geometria!
    const _p=club?.p||65;const _fez=_p>88?50:_p>72?46:_p>55?42:38;
    const flagGroups=[];
    // 3DV-8: canvas texture bicolore (c1/c2 del club) per ogni bandiera
    /* [7.171.0 TIFO 2.0 — collaudo PO «migliora bandiere, crea striscioni dei gruppi ultras, sciarpe ecc»]
       BANDIERE: pool di 4 DISEGNI seedati (metà orizzontali · banda verticale · diagonale · iniziale del club) a
       risoluzione 128×80 con shading tessuto e bordo — via le palette bianche piatte 64×32 semitrasparenti. */
    const _mkFlagTex=(c1Hex,c2Hex,design,initial)=>{const fc=document.createElement("canvas");fc.width=128;fc.height=80;const fx=fc.getContext("2d");
      fx.fillStyle=c1Hex;fx.fillRect(0,0,128,80);
      if(design===0){fx.fillStyle=c2Hex;fx.fillRect(0,40,128,40);}
      else if(design===1){fx.fillStyle=c2Hex;fx.fillRect(44,0,40,80);}
      else if(design===2){fx.fillStyle=c2Hex;fx.beginPath();fx.moveTo(0,80);fx.lineTo(128,0);fx.lineTo(128,80);fx.closePath();fx.fill();}
      else if(initial){/* [7.175.0 collaudo PO «non solo S o P ma tutto l acronimo SAL/PAR/NRZ»] la sigla INTERA del club, fit-to-width */
        let _ffs=52;fx.font="900 "+_ffs+"px Arial, sans-serif";const _fmw=110;let _fw=fx.measureText(initial).width;if(_fw>_fmw){_ffs=Math.max(26,Math.floor(_ffs*_fmw/_fw));fx.font="900 "+_ffs+"px Arial, sans-serif";}
        fx.textAlign="center";fx.textBaseline="middle";fx.lineJoin="round";fx.strokeStyle="rgba(0,0,0,0.4)";fx.lineWidth=6;fx.strokeText(initial,64,42);fx.fillStyle=c2Hex;fx.fillText(initial,64,42);}
      else {fx.fillStyle=c2Hex;fx.fillRect(0,30,128,20);}
      const _shg=fx.createLinearGradient(0,0,0,80);_shg.addColorStop(0,"rgba(255,255,255,0.14)");_shg.addColorStop(0.5,"rgba(0,0,0,0)");_shg.addColorStop(1,"rgba(0,0,0,0.20)");fx.fillStyle=_shg;fx.fillRect(0,0,128,80);
      fx.strokeStyle="rgba(0,0,0,0.25)";fx.lineWidth=3;fx.strokeRect(1,1,126,78);
      return new THREE.CanvasTexture(fc);};
    // [6.5.1 Polish C] la SCENOGRAFIA tifo (bandiere/striscioni/sciarpe) usa i colori SOCIALI del club — come gli
    //   spalti (KIT-1) — NON la divisa INDOSSATA: in trasferta homeCol/oppCol sono le maglie del match, così gli
    //   striscioni uscivano coi colori sbagliati. sHome/sAway = colori sociali (homeTeamObj/awayTeamObj); il
    //   secondario di casa è homeClub.c2 (sociale), quello ospite un accento neutro (nessun prop awayClub).
    const _tHCol=sHome,_tACol=sAway;
    const _hc2=homeClub?.c2||"#f0f0f0",_ac2="#f0f0f0";
    const _tifoSeed=(_adSeed44>>>0)||1;/* seed per-match (deterministico) per disegni bandiere/nomi gruppi */
    const _ultrasToken=(nm)=>{const t=String(nm||"").replace(/\b(FC|AC|AS|US|SS|SC|CF|CD|SD|RC|AT|KV|BV|SV|VF[BL]|Real|Athletic|Atletico|Sporting|Racing|Club|Deportivo|United|City|Town|County|Calcio|U18)\b/gi," ").trim().split(/\s+/).filter(Boolean).sort((a,b)=>b.length-a.length)[0]||"";return t.toUpperCase();};
    /* [7.174.0 collaudo PO «perché le bandiere hanno la F?»] l iniziale era charAt(0) del nome GREZZO («FC Parmense» → F
       di FC, senza significato): ora è l iniziale del TOPONIMO (_ultrasToken → P di PARMENSE, S di SALERNUM). */
    const _fhPool=[0,1,2,3].map(d=>_mkFlagTex(_tHCol,_hc2,d,String(stadiumHomeAbbr||homeClub?.a||_ultrasToken(stadiumHomeName||homeClub?.n||"").slice(0,3)).toUpperCase()));/* [7.175.0] sigla intera (SAL/PAR/NRZ) */
    const _faPool=[0,1,2,3].map(d=>_mkFlagTex(_tACol,_ac2,d,String(stadiumAwayAbbr||_ultrasToken(stadiumAwayName||"").slice(0,3)).toUpperCase()));
    const _fhTex=_fhPool[0],_faTex=_faPool[0];/* retro-compat per i tag _home */
    const _mkFlag=(x,z,tex,home)=>{const fg=new THREE.Group();
      const pm=new THREE.MeshLambertMaterial({color:0x8f95a0});/* [7.171.0] asta scura (le aste bianche leggevano come palette) */
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,4.2,6),pm);pole.position.y=2.1;fg.add(pole);
      /* [7.182.0 collaudo PO «le bandiere non sono attaccate alle aste!»] la stoffa ruotava attorno al PROPRIO
         centro (e la scala seedata la staccava dal palo) → PIVOT incernierato sull asta: lo sventolio avviene
         attorno al bordo attaccato, come una bandiera vera. */
      const piv=new THREE.Group();piv.position.set(0,4.0,0);
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.4),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
      const _fsc=0.86+((Math.abs(Math.round(x*7+z*13))+_tifoSeed)%7)*0.045;fl.scale.set(_fsc,_fsc,1);
      fl.position.set(1.2*_fsc,0,0);piv.add(fl);fg.add(piv);fg._fl=piv;fg._home=home!==undefined?home:(tex===_fhTex);fg.position.set(x,0,z);scene.add(fg);flagGroups.push(fg);};// 5.45.2: tag lato
    // CROWD 2.0 (§5/§7/§8): la SCENOGRAFIA tifo (bandiere/striscioni/sciarpe) segue il contesto folla —
    // niente coreografie a stadio freddo/vuoto (provini/amichevoli scarse); il lato ospite dipende da awayFill.
    /* [7.573.0 collaudo PO «gli striscioni, sciarpe e bandiere della tifoseria ospite non ci sono» — rosso
       __CPM_NO573T] LO STESSO NUMERO SU DUE SCALE DIVERSE, ed era un errore di categoria.
       I due cancelli confrontavano entrambi con 0,45, ma le due grandezze non vivono sulla stessa scala:
       `fill` e' il riempimento dell'impianto, `awayFill` e' GIA' moltiplicato per la quota di seguito
       ospite (`CROWD_CFG.awayShare`: campionato 0,55 · coppa 0,46 · Europa 0,34 · derby e finale 1,0).
       Chiedere `awayFill >= 0,45` significa quindi chiedere all'impianto di essere pieno al:
           campionato 81,8%  ·  coppa 97,8%  ·  Europa 132,4% (ARITMETICAMENTE IMPOSSIBILE)
       — e il tifo ospite spariva in tutto il calendario tranne derby, finali e turni a eliminazione.
       MISURATO con `tifo-ospiti-573` su un campionato pieno al 72% (cioe' awayFill 0,396, il valore che
       la formula del gioco produce davvero): casa 41 bandiere e 24 sciarpe, OSPITI ZERO E ZERO.
       PERCHE' NESSUN COLLAUDO L'AVEVA VISTO: `tifo-shot`, l'unica sonda che fotografa la scenografia,
       forza `awayFill:0.98` — guarda cioe' un derby col tutto esaurito, l'unico caso in cui il cancello
       si apriva. La sonda misurava sempre lo scenario che non poteva fallire.
       IL CANCELLO GIUSTO sta sulla scala del SETTORE OSPITE: `awayFill` e' il riempimento della Curva
       Nord (e' il valore che `buildStadium` le passa come fill, r.929 del frammento ui-kit). Una curva
       piena al 40% ha i suoi striscioni; una deserta no. La soglia diventa quindi «non deserta» — e il
       provino, che ha awayFill 0 per progetto, resta correttamente senza scenografia. */
    const _tifoHome=_crowdCtx?_crowdCtx.fill>=0.45:true;
    const _sogliaAway573=(typeof window!=='undefined'&&window.__CPM_NO573T)?0.45:0.18;
    const _tifoAway=_crowdCtx?_crowdCtx.awayFill>=_sogliaAway573:true;
    const _tifoHot=_crowdCtx?_crowdCtx.intensity>=0.9:false;// derby/finale: coreografia extra (§9)
    // 3DV-11: flags a 2u davanti alla faccia frontale della tribuna (visibili, non sepolti nella geometria)
    // §5: le TRIBUNE (z±) sono di casa/famiglie → bandiere di CASA su entrambe (gli ospiti stanno in Curva Nord)
    if(_tifoHome)[-24,-16,-8,0,8,16,24].forEach((ox,fi)=>{_mkFlag(ox,-(_fez-2),_fhPool[(fi+_tifoSeed)%4],true);_mkFlag(ox,_fez-2,_fhPool[(fi+1+_tifoSeed)%4],true);});
    // 3DV-11: striscioni grandi — davanti faccia tribuna, testo curva leggibile
    /* [7.171.0 TIFO 2.0] STRISCIONI DEI GRUPPI ULTRAS — via le bande anonime: telo scuro nel colore sociale con
       il NOME del gruppo (di fantasia, seedato per club: mai nomi di gruppi reali) in slab bianco contornato,
       bordi e rombi nel secondo colore. I nomi derivano dal toponimo del club → unici e stabili. */
    /* [7.180.0 collaudo PO «gli striscioni devono essere nella LINGUA della squadra (es. tedesco)»] pool per lingua
       derivata dalla bandiera del club (nat): de/en/es/fr/pt/nl/tr, fallback italiano. Sempre nomi di fantasia. */
    /* [7.187.0 direttiva PO «gruppi ultras reali? nomi di fantasia in stile»] Pool RISCRITTI e verificati:
       nomi di FANTASIA ma idiomatici per la cultura di ogni paese (it gradinata/fedelissimi · de szene/kurve/block ·
       en terrace/faithful · es peña/grada/fondo · fr virage/kop/tribune · pt bancada/força · nl zijde/vak · tr tribün/
       taraftar), con diacritici corretti. NESSUN nome di gruppo realmente esistente: la lista è passata da uno
       screening avversariale che ha scartato le collisioni con gruppi veri e le formulazioni militari/politiche.
       STRUTTURA A DUE LIVELLI: i primi _UID template di ogni pool sono NOMI PROPRI del gruppo (identità), gli altri
       sono MOTTI/cori (solo striscioni minori). Segnaposto: {T}=toponimo, {Y}=anno di fondazione, {C}=iniziale. */
    /* [7.191.0 collaudo PO «le frasi degli striscioni sono sgrammaticate»] CAUSA: i template davano per scontato
       che {T} fosse un NOME PROPRIO (toponimo), ma su ~40% dei club il token è un AGGETTIVO o un plurale
       («FC Granata» → GRANATA, «FC Scaligero» → SCALIGERO, «FC Nerazzurri» → NERAZZURRI) → «FIGLI DI GRANATA»,
       «GRADINATA SPEZZINO», «CUORE NERAZZURRI», «SONS OF SWANS», «GRADA VALENCIANO», «ÂME DE ARTOIS»: tutte
       sgrammaticate. Ora il token ha una CLASSE grammaticale e ogni template dichiara che classe richiede:
         P = nome proprio (toponimo/nome) → ammette anche le preposizioni («FIGLI DI TORINO»)
         I = aggettivo INVARIABILE in genere e numero (granata, viola) → ammette nomi maschili e femminili
         E = aggettivo in -e/-ese/-ense/-ate o nome comune con articolo (parmense, capitale, la Sociedad, der Ruhrpott)
         M = aggettivo maschile singolare (scaligero, spezzino, valenciano) → solo nomi maschili
         N = nickname PLURALE (nerazzurri, clarets, leões) → solo frasi vocative o con articolo esplicito
       Prefisso del template: «P|» richiede P · «F|» nome femminile (P/I/E) · «M|» nome maschile (tutti tranne N) ·
       «N|» solo plurale (varianti con articolo) · senza prefisso = universale (vocativi e frasi senza accordo). */
    const _TOK_CLASS={
      /* IT — colori invariabili */ GRANATA:"I",VIOLA:"I",
      /* IT — -e/-ese/-ate + nomi comuni con articolo */ BIANCOCELESTE:"E",NEROVERDE:"E",PARMENSE:"E",MODENESE:"E",PUGLIESE:"E",CESENATE:"E",EMPOLESE:"E",CAPITALE:"E",LAGUNA:"E",LEONESSA:"E",ALTOADIGE:"E",
      /* IT — aggettivi maschili */ FELSINEO:"M",FRIULANO:"M",SARDO:"M",SCALIGERO:"M",BRIANZOLO:"M",CALABRO:"M",SPEZZINO:"M",PISANO:"M",CIOCIARO:"M",CITTADINO:"M",BRUZIO:"M",LARIANO:"M",
      /* IT — plurali */ NERAZZURRI:"N",ROSSONERI:"N",BLUCERCHIATI:"N",
      /* EN — nickname plurali */ HAMMERS:"N",SWANS:"N",STEELERS:"N",CLARETS:"N",CANARIES:"N",DOCKERS:"N",BLUEBIRDS:"N",HORNETS:"N",POTTERS:"N",
      /* ES */ HISPALENSE:"E",SOCIEDAD:"E",CELESTE:"E",BALEAR:"E",GRANOTA:"E",OSCENSE:"E",ALMERIENSE:"E",CALIFAL:"E",PUCELA:"E",
      SUBMARINO:"M",VERDIBLANCO:"M",VALENCIANO:"M",NAVARRO:"M","GIRONÍ":"M","AZULÓN":"M",CANARIO:"M","INDÁLICO":"M",PERICO:"M","CORUÑÉS":"M","CÁNTABRO":"M","TINERFEÑO":"M","BURGALÉS":"M","MAÑO":"M","MIRANDÉS":"M",MANCHEGO:"M",ILICITANO:"M",MALACITANO:"M","GIJONÉS":"M","CARBAYÓN":"M",GADITANO:"M",FERROLANO:"M",
      /* DE — regioni/fiumi (reggono l articolo) e plurali */ WESER:"E",RUHRPOTT:"E",KRAICHGAU:"E",NIEDERRHEIN:"E",LILIEN:"N",
      /* FR — régions avec article + adjectifs */ MORBIHAN:"E",DOUBS:"E",HAVRE:"E",VALENCIEN:"M",RENNESE:"E",NANTESE:"E",LILLESE:"E",REMENSE:"E",
      /* PT */ "LEÕES":"N",PANTERAS:"N",AVES:"N",MINHOTO:"M",VIMARANENSE:"E",VERDE:"E",FARENSE:"E",
    };
    const _ULTRAS_POOLS={
        it:["P|FEDELISSIMI {T}","F|GRADINATA {T}","P|FIGLI DI {T}","M|CUORE {T}","FORZA {T}","SEMPRE {T}","GENERAZIONE {Y}","M|GRUPPO {T} {Y}","F|CURVA {T} {Y}","C|{T} SIAMO NOI",
            "UN SOLO GRIDO","NOI CON VOI","UNA SOLA VOCE","I NOSTRI COLORI","DAL {Y} CON TE","FINO ALL'ULTIMO MINUTO","{T} SEMPRE CON TE","{T} NEL CUORE","F|PASSIONE {T}","F|ANIMA {T}","M|ORGOGLIO {T}","SETTORE {C} {Y}","{T} FINO ALLA FINE"],
        de:["SZENE {T}","KURVE {T}","NORDTRIBÜNE {T}","HERZBLUT {T}","FÜR IMMER {T}","GENERATION {Y}","BLOCK {C} {Y}","JUNGS DER KURVE","P|STOLZ VON {T}","P|AUS LIEBE ZU {T}",
            "IMMER TREU","UNSERE FARBEN","SEIT {Y} DABEI","BIS ZUM ENDE","EINE STADT EIN VEREIN","FREUNDE DER KURVE","MIT HERZ UND STIMME","TREU SEIT {Y}"],
        en:["{T} FAITHFUL","P|SONS OF {T}","N|SONS OF THE {T}","P|PRIDE OF {T}","N|PRIDE OF THE {T}","THE TERRACE {Y}","GENERATION {Y}","{T} YOUTH {Y}","{C} END {Y}","SPIRIT OF {Y}",
            "ALWAYS THERE","VOICE OF THE TERRACE","TRUE COLOURS","SINCE {Y}","P|STAND UP FOR {T}","N|UP THE {T}","{T} TILL THE END","THROUGH THICK AND THIN","ONE CLUB ONE CITY","COME ON {T}"],
        es:["F|PEÑA {T}","F|GRADA {T}","M|FONDO {T} {Y}","P|FIELES DE {T}","P|HIJOS DE {T}","SIEMPRE {T}","VAMOS {T}","GENERACIÓN {Y}","M|FONDO {C} {Y}","F|AFICIÓN {T} {Y}",
            "P|ORGULLO DE {T}","P|ALMA DE {T}","P|CORAZÓN DE {T}","P|GENTE DE {T}","DESDE {Y}","NUESTROS COLORES","UNA SOLA VOZ","HASTA EL FINAL","{T} HASTA EL FINAL","{T} EN EL CORAZÓN"],
        fr:["VIRAGE {T}","F|JEUNESSE {T}","F|TRIBUNE {T}","P|ENFANTS DE {T}","KOP {T} {Y}","ALLEZ {T}","TOUJOURS {T}","GÉNÉRATION {Y}","FIDÈLES {Y}","TRIBUNE {C} {Y}",
            "P|CŒUR DE {T}","P|FIERTÉ DE {T}","P|ÂME DE {T}","DEPUIS {Y}","NOS COULEURS","UNE SEULE VOIX","JUSQU'AU BOUT","{T} DANS LE CŒUR","TOUJOURS LÀ","KOP {C} {Y}"],
        pt:["F|BANCADA {T}","F|NAÇÃO {T}","FORÇA {T}","P|FILHOS DE {T}","GERAÇÃO {Y}","SEMPRE {T}","{T} NO CORAÇÃO","F|BANCADA {T} {Y}","BANCADA {C} {Y}","P|ORGULHO DE {T}",
            "P|PAIXÃO POR {T}","N|PAIXÃO PELOS {T}","SEMPRE FIÉIS","DESDE {Y}","AS NOSSAS CORES","UMA SÓ VOZ","P|ALMA DE {T}","ATÉ AO FIM","{T} ATÉ AO FIM"],
        nl:["P|JONGENS VAN {T}","SUPPORTERS {T}","NOORDTRIBUNE {Y}","ZUIDTRIBUNE {T}","P|TROTS VAN {T}","GENERATIE {Y}","TROUWE AANHANG {Y}","ÉÉN STEM {T}","TRIBUNE {C} {Y}","P|HART VAN {T}",
            "ALTIJD TROUW","ONZE KLEUREN","SINDS {Y}","P|ZIEL VAN {T}","TOT HET EINDE","SAMEN STERK","VOOR ALTIJD {T}"],
        tr:["{T} TARAFTARI","{T} ÇOCUKLARI","TRİBÜN {T}","TRİBÜN {Y}","{Y} KUŞAĞI","{T} YÜREĞİ","{T} SEVDASI","{T} GURURU","TRİBÜN {C} {Y}","HAYDİ {T}",
            "SONSUZ AŞK","TEK YÜREK","RENKLERİMİZ","{Y} YILINDAN BERİ","SONUNA KADAR","TEK SES","AŞKIMIZ {T}","HEP BİRLİKTE"],
      };
    const _UID=10;// quanti template iniziali sono NOMI DI GRUPPO (identità) — il resto sono motti
    const _ultrasName=(nm,seed,slot,nat,fid)=>{const T=_ultrasToken(nm);const yr=clubFoundedYear(fid||nm);const L=_ultrasLang(nat);
      const P0=_ULTRAS_POOLS[L]||_ULTRAS_POOLS.it;
      const CLS=_TOK_CLASS[T]||"P";/* default: nome proprio (i toponimi sono la maggioranza) */
      const _req=(t)=>{const m=/^([PFMNC])\|/.exec(t);return m?m[1]:"";};
      const _body=(t)=>t.replace(/^[PFMNC]\|/,"");
      /* accordo: F = nome femminile (ok con proprio/invariabile/-e) · M = nome maschile (ok con tutto tranne il plurale) */
      const _fits=(t)=>{const r=_req(t);if(!r)return true;if(r==="P")return CLS==="P";if(r==="F")return CLS==="P"||CLS==="I"||CLS==="E";if(r==="M")return CLS!=="N";if(r==="N")return CLS==="N";if(r==="C")return CLS==="P"||CLS==="N";/* soggetto collettivo: «Cremona siamo noi» ok, «Sardo siamo noi» no */return true;};
      const _fill=(t)=>{let s=_body(t).replace(/\{T\}/g,T).replace(/\{Y\}/g,String(yr)).replace(/\{C\}/g,(T||"").charAt(0));
        if(L==="fr")s=s.replace(/\bDE ([AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜ])/g,"D'$1");/* élision obligatoire: DE AJACCIO → D'AJACCIO */
        return s;};
      /* IDENTITÀ STABILE: il nome del gruppo è l identità della curva → dipende SOLO dal club (mai dalla stagione o da
         chi sia l eroe). Gli striscioni minori delle tribune ruotano col seed di partita. */
      const _clubH=(Math.abs(hashStr("ultras|"+String(fid||nm||"club")))>>>0);
      const main=(slot===4||slot===5);
      /* i template non idonei (segnaposto irrisolvibili senza toponimo, accordo grammaticale incompatibile con la
         classe del token, o scritta troppo lunga per lo striscione) vengono SCARTATI QUI, prima di indicizzare: se si
         saltavano dopo, due slot potevano collassare sullo stesso nome e la stessa tribuna mostrava due striscioni identici. */
      const _ok=(t)=>{if(!T&&/\{T\}|\{C\}/.test(t))return false;if(!_fits(t))return false;return _fill(t).length<=26;};
      const cand=[];for(let i=0;i<P0.length;i++){if((main?(i<_UID):(i>=_UID))&&_ok(P0[i]))cand.push(P0[i]);}
      /* lo striscione PRINCIPALE porta il nome del club quando può: i motti senza {T} restano per le tribune */
      if(main){const _wt=cand.filter(t=>/\{T\}/.test(t));if(_wt.length)cand.length=0,Array.prototype.push.apply(cand,_wt);}
      if(!cand.length)for(let i=0;i<P0.length;i++){if(_ok(P0[i]))cand.push(P0[i]);}
      if(!cand.length)cand.push(P0[0]);
      /* SHUFFLE seedato SENZA RIMPIAZZO: con l indice indipendente per slot due striscioni della stessa tribuna
         potevano uscire IDENTICI (~50% con 10 motti su 4 slot). Fisher-Yates sul sotto-pool + indice per slot. */
      let _r=(_clubH^(main?0:(seed>>>0)))>>>0;const _nx=()=>{_r=(Math.imul(_r,1664525)+1013904223)>>>0;return _r/4294967296;};
      for(let i=cand.length-1;i>0;i--){const j=(_nx()*(i+1))|0;const t=cand[i];cand[i]=cand[j];cand[j]=t;}
      /* guardia di leggibilità: se il nome risolto è troppo lungo per lo striscione, si prende il successivo */
      const _k=main?0:((slot%Math.max(1,cand.length))|0);
      return _fill(cand[_k%cand.length]);};
    if(_CPM_TEST&&typeof window!=='undefined'){window.__CPM_ULTRAS=(nm,seed,slot,nat,fid)=>_ultrasName(nm,seed,slot,nat,fid);window.__CPM_ULTRAS.cls=(nm)=>({t:_ultrasToken(nm),c:_TOK_CLASS[_ultrasToken(nm)]||"P"});}/* [7.191.0] classe grammaticale del token esposta alla probe *//* [7.187.0] hook test-only per la probe identità/collisioni (spento in store build) *//* [7.174.0 collaudo PO «c è quasi sempre BRIGATA»] causa VERA: adSeed deriva dal club dell EROE+stagione → identico in ogni gara, e il nome del club NON entrava nell indice → ogni stadio mostrava la stessa struttura (BRIGATA <città>). Ora il nome è nell hash (+ avalanche _mix32) → gruppo diverso per club, stabile nella stagione. *//* [7.174.0 collaudo PO «c è quasi sempre BRIGATA»] l indice senza avalanche collassava: i seed hashStr di club/slot simili condividono il residuo mod 11 → stesso nome ovunque. _mix32 decorrelALL i bucket. */
    const _dkTifo=(h,f)=>{try{const n=parseInt(String(h).replace('#',''),16);return 'rgb('+Math.round(((n>>16)&255)*f)+','+Math.round(((n>>8)&255)*f)+','+Math.round((n&255)*f)+')';}catch(e){return '#20242c';}};
    const _mkStriscione=(cx,z,rotY,c1Hex,c2Hex,text,yPos,led657,ledW,ledH)=>{const sc=document.createElement("canvas");sc.width=1024;sc.height=110;const sx=sc.getContext("2d");
      /* [7.657.0 - IL CARTELLONE DEL NOME E' UN LED PICCOLO CHE SCORRE. Collaudo PO (screenshot):
         "il pannello/cartellone con il nome dello stadio deve essere molto piu' piccolo e con led
         a scorrimento". In modalita' led657: fondo quasi nero, testo color LED con scanline,
         pannello 14x1.6 (era 30x3.4), texture in RepeatWrapping e offset animato nel loop
         (sr.current._led657). I drappi delle curve restano stoffa, come lo stadio vero. */
      if(led657){/* [7.661.0 LED v2 - collaudo PO in diretta: font moderno (niente monospace), pannello
           piu' lungo e piu' in alto, LOGO squadra fisso ai due lati, e il GOL festeggiato dal
           cartellone (texture dedicata lampeggiante, gestita nel loop su P.waveEvent). */
        /* [7.668.0 collaudo PO «il tabellone led deve essere piu' moderno»] IL PANNELLO DIVENTA UN
           DOT-MATRIX VERO. Prima era testo pieno con scanline orizzontali: da lontano leggeva come una
           scritta su fondo nero, non come un LED. Ora il testo si stampa e poi passa sotto una GRIGLIA
           (passo 4 px in entrambe le direzioni) che ne ritaglia i punti: e' cosi' che si vede un
           tabellone vero, dove le lettere sono fatte di lampadine. In piu': fondo con gradiente
           verticale (i pannelli veri non sono neri uniformi), alone morbido a due passate invece della
           singola ombra dura, e il separatore romboidale fra due passaggi del nome. */
        sc.width=2048;const _mkLed662=(t662,col662)=>{const c2=document.createElement("canvas");c2.width=2048;c2.height=128;const x2=c2.getContext("2d");
          const _bg=x2.createLinearGradient(0,0,0,128);_bg.addColorStop(0,"#0b0e14");_bg.addColorStop(0.5,"#05070a");_bg.addColorStop(1,"#0b0e14");
          x2.fillStyle=_bg;x2.fillRect(0,0,2048,128);
          x2.font="800 76px 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";x2.textAlign="left";x2.textBaseline="middle";
          x2.letterSpacing&&(x2.letterSpacing="4px");
          x2.shadowColor=col662;x2.shadowBlur=26;x2.fillStyle=col662;x2.fillText(t662,28,66);
          x2.shadowBlur=10;x2.fillStyle="#ffffff";x2.globalAlpha=0.55;x2.fillText(t662,28,66);x2.globalAlpha=1;x2.shadowBlur=0;
          /* la GRIGLIA che trasforma la scritta in lampadine: righe E colonne, non solo scanline */
          x2.globalCompositeOperation="destination-out";
          for(let yy=0;yy<128;yy+=4)x2.fillRect(0,yy+3,2048,1);
          for(let xx=0;xx<2048;xx+=4)x2.fillRect(xx+3,0,1,128);
          x2.globalCompositeOperation="source-over";
          const tx2=new THREE.CanvasTexture(c2);tx2.wrapS=THREE.RepeatWrapping;tx2.anisotropy=4;return tx2;};
        const stexL=_mkLed662(String(text||"").toUpperCase()+"   •   ","#ffb020");
        const stexG=_mkLed662("⚽ GOL!   ⚽ GOL!   ⚽ GOL!   ","#7dff8a");
        const _matL=new THREE.MeshBasicMaterial({map:stexL,side:THREE.FrontSide,transparent:true,opacity:0.98,depthWrite:false});
        const smL=new THREE.Mesh(new THREE.PlaneGeometry(ledW||14,ledH||1.6),_matL);
        smL.position.set(cx,yPos!=null?yPos:5.5,z);smL.rotation.y=rotY;scene.add(smL);
        /* i loghi fissi: quadrati coi colori e la sigla del club, ai due capi del pannello */
        /* [7.668.0 collaudo PO «il logo deve essere disegnato meglio»] DA QUADRATO A SCUDETTO. Era un
           riquadro piatto con tre lettere: adesso e' un crest — sagoma a scudo, banda diagonale col
           secondo colore sociale, bordo chiaro, sigla in rilievo con la sua ombra. Canvas 256 (era 128):
           da vicino, sul pannello alto, i bordi non sfarinano piu'. */
        const _mkLogo662=(sig,cc1,cc2)=>{const cl=document.createElement("canvas");cl.width=256;cl.height=256;const xl=cl.getContext("2d");
          const _scudo=()=>{xl.beginPath();xl.moveTo(30,26);xl.lineTo(226,26);xl.lineTo(226,140);
            xl.quadraticCurveTo(226,206,128,238);xl.quadraticCurveTo(30,206,30,140);xl.closePath();};
          _scudo();const _g=xl.createLinearGradient(0,26,0,238);_g.addColorStop(0,cc1||"#1b2436");_g.addColorStop(1,"#0a0f18");
          xl.fillStyle=_g;xl.fill();
          xl.save();_scudo();xl.clip();/* banda diagonale col colore secondario */
          xl.fillStyle=cc2||"#ffffff";xl.globalAlpha=0.9;xl.beginPath();xl.moveTo(30,150);xl.lineTo(226,60);xl.lineTo(226,104);xl.lineTo(30,194);xl.closePath();xl.fill();
          xl.globalAlpha=1;xl.restore();
          _scudo();xl.strokeStyle="rgba(255,255,255,0.92)";xl.lineWidth=9;xl.lineJoin="round";xl.stroke();
          xl.font="900 92px 'Segoe UI', Arial, sans-serif";xl.textAlign="center";xl.textBaseline="middle";
          xl.lineWidth=10;xl.strokeStyle="rgba(0,0,0,0.55)";xl.strokeText(String(sig||"").slice(0,3).toUpperCase(),128,126);
          xl.fillStyle="#ffffff";xl.fillText(String(sig||"").slice(0,3).toUpperCase(),128,126);
          const _t=new THREE.CanvasTexture(cl);_t.anisotropy=4;return _t;};
        const _sig662=String((typeof stadiumHomeAbbr!=='undefined'&&stadiumHomeAbbr)||(homeClub&&homeClub.a)||"").toUpperCase();
        const _lw662=(ledW||14)/2+1.6;
        /* [7.668.0] LA PIASTRA DIETRO I CREST: nella fotografia di collaudo i loghi sembravano
           appoggiati sulle gradinate, non parte del tabellone. Un pannello scuro della stessa altezza
           li incastona, e il tabellone torna a leggersi come un blocco unico: crest, LED, crest. */
        for(const _sx668 of [-_lw662,_lw662]){const _pl=new THREE.Mesh(new THREE.PlaneGeometry(3.2,(ledH||1.6)*1.35),
            new THREE.MeshBasicMaterial({color:0x07090c,side:THREE.FrontSide,transparent:true,opacity:0.97,depthWrite:false}));
          const _ca8=Math.cos(rotY),_sa8=Math.sin(rotY);
          _pl.position.set(cx+_sx668*_ca8,yPos!=null?yPos:5.5,z-_sx668*_sa8);_pl.rotation.y=rotY;scene.add(_pl);}
        for(const _sx662 of [-_lw662,_lw662]){const _lg=new THREE.Mesh(new THREE.PlaneGeometry(2.5,2.8),new THREE.MeshBasicMaterial({map:_mkLogo662(_sig662,(typeof stadiumHomeCol!=='undefined'&&stadiumHomeCol)||"#1b2436","#ffffff"),side:THREE.FrontSide,transparent:true,opacity:0.98,depthWrite:false}));
          const _ca=Math.cos(rotY),_sa=Math.sin(rotY);
          _lg.position.set(cx+_sx662*_ca+Math.sin(rotY)*0.06,yPos!=null?yPos:5.5,z-_sx662*_sa+Math.cos(rotY)*0.06);_lg.rotation.y=rotY;_lg.renderOrder=7;scene.add(_lg);}
        (sr.current._led657=sr.current._led657||[]).push({tex:stexL,texGol:stexG,mat:_matL});return;}
      sx.fillStyle=_dkTifo(c1Hex,0.42);sx.fillRect(0,0,1024,110);
      const _fg=sx.createLinearGradient(0,0,0,110);_fg.addColorStop(0,"rgba(255,255,255,0.10)");_fg.addColorStop(1,"rgba(0,0,0,0.22)");sx.fillStyle=_fg;sx.fillRect(0,0,1024,110);
      sx.fillStyle=c2Hex;sx.fillRect(0,0,1024,9);sx.fillRect(0,101,1024,9);
      if(text){let fs=62;sx.font="900 "+fs+"px Arial, sans-serif";const mw=850;let w=sx.measureText(text).width;if(w>mw){fs=Math.max(30,Math.floor(fs*mw/w));sx.font="900 "+fs+"px Arial, sans-serif";}
        sx.textAlign="center";sx.textBaseline="middle";sx.lineWidth=9;sx.lineJoin="round";sx.strokeStyle="rgba(0,0,0,0.6)";sx.strokeText(text,512,57);sx.fillStyle="#f4f4f6";sx.fillText(text,512,57);
        sx.fillStyle=c2Hex;[64,960].forEach(x0=>{sx.save();sx.translate(x0,55);sx.rotate(Math.PI/4);sx.fillRect(-14,-14,28,28);sx.restore();});}
      const stex=new THREE.CanvasTexture(sc);const sm=new THREE.Mesh(new THREE.PlaneGeometry(30,3.4),new THREE.MeshBasicMaterial({map:stex,side:THREE.FrontSide,transparent:true,opacity:0.97,depthWrite:false}));/* [7.171.0] FrontSide: da dietro (camera set-piece oltre la curva) il retro mostrava la scritta SPECCHIATA */sm.position.set(cx,yPos!=null?yPos:5.5,z);sm.rotation.y=rotY;scene.add(sm);};
    /* [7.658.0 - IL CARTELLONE COL NOME DELLO STADIO, PICCOLO E A LED. Precisazione PO (collaudo):
       «non gli striscioni/cartelloni dei tifosi devono essere led piccoli ma il cartellone con il
       nome dello stadio, es. Stadio Meneghino dei Rossoneri». Il nome VERO arriva dalla prop
       stadiumVenue (getStadiumName); il pannello usa la modalita' LED di _mkStriscione (14x1.6,
       testo ambra a scorrimento) su ENTRAMBE le facciate laterali, centrato, sopra i board. */
    if(stadiumVenue){try{const _vn658=String(stadiumVenue).toUpperCase();
      /* [7.668.0 collaudo PO «deve essere piu' in alto, alla fine della copertura delle tribune»]
         LA QUOTA NON SI SCEGLIE PIU' A OCCHIO. Lo stadio esporta gia' la geometria vera della
         pensilina (curve.roofEnd.top, 7.437/7.565): il pannello si appende LI', appena sotto il filo
         della copertura, e cosi' segue ogni taglia d'impianto — alto negli stadi con la falda, piu'
         basso in provincia — invece di stare a una costante che va bene solo per uno. */
      const _yLed668=(function(){try{const _rf=sr.current&&sr.current.crowdMats&&sr.current.crowdMats.curve&&sr.current.crowdMats.curve.roofEnd;
        return (_rf&&_rf.top)?Math.max(12,_rf.top-1.2):23.5;}catch(_e){return 23.5;}})();
      _mkStriscione(0,-36.2,0,'#0a0c10','#ffb020',_vn658,_yLed668,true,28,2.4);
      _mkStriscione(0,36.2,Math.PI,'#0a0c10','#ffb020',_vn658,_yLed668,true,28,2.4);/* [7.661.0] piu' lungo (19->28) e piu' in alto (20,5->23,5), come chiesto in collaudo */
    }catch(_e658){}}/* [7.659.0] PO in collaudo: «un po piu grande ed in alto, all altezza della copertura» — y 9,2 -> 20,5 (il bordo gradinata sta a 23-26), pannello 14x1.6 -> 19x2.2 */
    const _stadHN=stadiumHomeName||homeClub?.n||"",_stadAN=stadiumAwayName||"";const _stadHNat=stadiumHomeNat||homeClub?.nat||"",_stadANat=stadiumAwayNat||"";const _stadHId=stadiumHomeId||homeClub?.id||"",_stadAId=stadiumAwayId||"";
    // 2 striscioni per tribuna — SOLO colori di casa (§5); il lato ospite vive nella Curva Nord
    /* [7.189.0 collaudo PO «gli striscioni… devono essere appoggiati proprio sul MURO delle tribune»] anche i drappi
       delle tribune Est/Ovest stavano a mezz'aria (y default 5.5, z stimato): ora sono ancorati alla faccia frontale
       della base in cemento delle tribune (geometria REALE esportata da buildStadium) e alla quota del parapetto. */
    const _cg185=sr.current._curveGeo||null;/* [7.185.0] geometria REALE della curva da buildStadium (fallback: stima storica) */
    const _sideX=_cg185?_cg185.sideX:(_p>88?78:_p>72?70:_p>55?64:58);// x della curva, allineato a buildStadium (Curva Sud=+x casa, Curva Ospiti=-x)
    /* [7.185.0 collaudo PO «bandiere e sciarpe sparse in TUTTA la curva, troppo concentrato solo nel primo anello»]
       la gradinata è un piano INCLINATO: in addStand l'anello basso va da (fronte, y=3.0) a (−D*0.10, y=H*0.62) e
       quello alto da (−D*0.02, y=H*0.68) a (D*0.32, y=H+1.4) — in coordinate locali z, che per le curve (rotY ±π/2)
       diventano l'asse X del mondo. Finora il tifo stava a x quasi fisse e y 0-5: tutto ammassato in fondo al primo
       anello, con l'intera gradinata sopra vuota. `_surf185(t)` restituisce il punto (offset lungo la pendenza, quota)
       per t∈[0,1] su TUTTA la superficie (basso→alto, secondo anello incluso) → il tifo sale con la curva. */
    const _surf185=(t,home)=>{
      const D=_cg185?(home?_cg185.depthHome:_cg185.depthAway):16,H=_cg185?(home?_cg185.hHome:_cg185.hAway):11,N=_cg185?_cg185.tiers:2;
      if(N<=1){const a=-D/2+0.6,b=D*0.40;return{d:a+(b-a)*t,y:3.0+(H+0.6-3.0)*t};}
      if(t<0.55){const u=t/0.55,a=-D/2+0.6,b=-D*0.10;return{d:a+(b-a)*u,y:3.0+(H*0.62-3.0)*u};}
      const u=(t-0.55)/0.45,a=-D*0.02,b=D*0.32;return{d:a+(b-a)*u,y:H*0.68+(H+1.4-H*0.68)*u};
    };
    const _cxAt=(t,home)=>{const p=_surf185(t,home);return home?(_sideX+p.d):(-_sideX-p.d);};/* world-x sulla superficie */
    const _cyAt=(t,home)=>_surf185(t,home).y;
    const _muroD=(home)=>((_cg185?(home?_cg185.depthHome:_cg185.depthAway):16)+3)/2;
    const _muroX=(home)=>home?(_sideX-_muroD(true)-0.14):(-_sideX+_muroD(false)+0.14),_muroY=2.42;/* centrato sul muro ma sopra i cartelloni (alti ~1.3): appeso al parapetto e interamente leggibile */
    const _trZ=_cg185?Math.max(34.2,_cg185.endZ-(_cg185.depthEnd+3)/2-0.14):(_fez-3);
    if(_tifoHome){_mkStriscione(-12,-_trZ,0,_tHCol,_hc2,_ultrasName(_stadHN,_tifoSeed,0,_stadHNat,_stadHId),_muroY);_mkStriscione(12,-_trZ,0,_tHCol,_hc2,_ultrasName(_stadHN,_tifoSeed,1,_stadHNat,_stadHId),_muroY);/* [7.658.0 REVOCA della 7.657: «non gli striscioni dei tifosi» (parole PO) — i drappi ultras tornano stoffa com'erano; il LED e' del cartellone col NOME DELLO STADIO qui sotto */
      _mkStriscione(-12,_trZ,Math.PI,_tHCol,_hc2,_ultrasName(_stadHN,_tifoSeed,2,_stadHNat,_stadHId),_muroY);_mkStriscione(12,_trZ,Math.PI,_tHCol,_hc2,_ultrasName(_stadHN,_tifoSeed,3,_stadHNat,_stadHId),_muroY);}
    /* [7.562.0 richiesta PO «puoi togliere quel tabellone dalla tribuna est con il nome della competizione»]
       RIMOSSO — item 8 (5.49.2), il CARTELLONE COMPETIZIONE sulla tribuna est: un pannello 40x9,4 sospeso a
       quota 10,5 e a z = tribuna-3,4, cioe' DENTRO il volume dello stadio, non appoggiato alla struttura.
       Non era solo un ingombro estetico: nel provino della camera laterale (7.561) e' il rettangolo scuro
       che taglia il campo a meta' — sporgeva abbastanza da finire fra una camera di lato e il gioco. Il nome
       della competizione resta comunque leggibile in tre punti gia' presenti: la fascia sui muretti delle
       tribune (7.301), il nastro a bordo campo e il tappeto cerimoniale all'ingresso delle squadre. */
    // item 9 (5.49.2): TAPPETO CERIMONIALE — grande logo competizione a centrocampo, visibile solo durante l'ingresso (walkout).
    let _ceremonyCarpet=null;
    {const cc=document.createElement("canvas");cc.width=cc.height=1024;const c2=cc.getContext("2d");// 5.49.12: risoluzione 2× + ELEVORA grande/bold/contornato → leggibile a centrocampo
     const _lk2=/coppa|cup|champions|europa|conference|continental/i.test(_compLbl)?"cup":/mondiale|europeo|nazional/i.test(_compLbl)?"nation":"league";
     const _emc=props.competitionColor||(_lk2==="cup"?"#f5c542":_lk2==="nation"?"#34d399":"#d27f8c");// [6.88.0 collaudo PO «colore diverso per competizione»] anello+tagline nel colore della competizione (fallback ai 3 bucket storici)
     c2.save();c2.translate(512,512);
     c2.strokeStyle=_emc;c2.lineWidth=20;c2.beginPath();c2.arc(0,0,476,0,6.283);c2.stroke();// anello esterno
     // [7.158.0 collaudo PO] disco = GRADIENTE dei colori della BANDIERA (sfumato) in base alla competizione
     //   nazionale (nat del campionato/nazione) + vignetta scura al centro → logo+wordmark restano leggibili.
     /* [7.172.0 collaudo PO «al Mondiale il centrocampo non deve avere i colori della bandiera italiana ma quelli
        SPECIFICI della competizione (es. Europeo = blu con stelle)»] il gradiente-bandiera 7.158 resta SOLO per il
        CAMPIONATO (bandiera della nazione della lega); le competizioni di NAZIONALE e le coppe europee di club
        hanno un disco BRANDIZZATO: Europeo = blu royal + corona di 12 stelle · Mondiale = notte+oro con archi di
        globo · Coppa delle Nazioni = teal · UCL/UEL/UECL = colore competizione + stelle. */
     const _star172=(cx,cy,r,col)=>{c2.fillStyle=col;c2.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2===0?r:r*0.45;if(k===0)c2.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);else c2.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c2.closePath();c2.fill();};
     const _discBrand172=(cIn,cOut,ringCol,starN,starCol,arcs)=>{
       c2.save();c2.beginPath();c2.arc(0,0,462,0,6.283);c2.clip();
       const _rg=c2.createRadialGradient(0,-60,60,0,0,470);_rg.addColorStop(0,cIn);_rg.addColorStop(1,cOut);
       c2.fillStyle=_rg;c2.fillRect(-476,-476,952,952);
       if(arcs){c2.strokeStyle=ringCol;c2.globalAlpha=0.30;c2.lineWidth=9;for(let ai=0;ai<3;ai++){c2.beginPath();c2.ellipse(0,0,420,140+ai*95,0,0,6.283);c2.stroke();}c2.globalAlpha=1;}
       if(starN){for(let si=0;si<starN;si++){const a=-Math.PI/2+si*(6.283/starN);_star172(Math.cos(a)*385,Math.sin(a)*385,30,starCol);}}
       const _vg=c2.createRadialGradient(0,0,30,0,0,320);_vg.addColorStop(0,"rgba(5,8,18,0.55)");_vg.addColorStop(1,"rgba(5,8,18,0)");c2.fillStyle=_vg;c2.fillRect(-476,-476,952,952);
       c2.restore();};
     const _isEuroNat172=/europeo/i.test(_compLbl),_isMondo172=/mondiale/i.test(_compLbl),_isNations172=/coppa delle nazioni/i.test(_compLbl),_isNatAmich172=_lk2==="nation"&&!_isEuroNat172&&!_isMondo172&&!_isNations172;
     const _isUCL172=/champions/i.test(_compLbl),_isUEL172=/europa cup/i.test(_compLbl),_isUECL172=/conference/i.test(_compLbl);
     const _flagCols158=flagColsOf(homeClub?.nat);
     if(_isEuroNat172){_discBrand172("#1b4fc0","#0c2a72",_emc,12,"#f5c542",false);}
     else if(_isMondo172){_discBrand172("#232b44","#0b0f1c","#f5c542",0,null,true);/* archi-globo dorati */c2.strokeStyle="#f5c542";c2.lineWidth=14;c2.beginPath();c2.arc(0,0,440,0,6.283);c2.stroke();}
     else if(_isNations172){_discBrand172("#12756d","#073d38","#9be8df",0,null,false);c2.strokeStyle="#9be8df";c2.lineWidth=10;c2.beginPath();c2.arc(0,0,440,0,6.283);c2.stroke();}
     else if(_isNatAmich172){_discBrand172("#3b3f8f","#161a4a","#a5b4fc",0,null,false);}
     else if(_isUCL172||_isUEL172||_isUECL172){_discBrand172(_isUCL172?"#1d4ed8":_isUEL172?"#c2571a":"#6d28d9",_isUCL172?"#0b2568":_isUEL172?"#5e2708":"#33115f",_emc,_isUCL172?8:0,"#e8edf5",false);}
     else if(_flagCols158&&_flagCols158.length>=2){
       c2.save();c2.beginPath();c2.arc(0,0,462,0,6.283);c2.clip();// clip al disco
       const _fg158=c2.createLinearGradient(-462,-140,462,140);/* leggermente diagonale = sfumato morbido */
       for(let _i=0;_i<_flagCols158.length;_i++)_fg158.addColorStop(_i/(_flagCols158.length-1),_flagCols158[_i]);
       c2.globalAlpha=0.95;c2.fillStyle=_fg158;c2.fillRect(-476,-476,952,952);c2.globalAlpha=1;
       // vignetta scura SOLO al centro (raggio ridotto) → verde/bianco/rosso restano leggibili sull'anello, ma
       // logo/wordmark/tagline hanno lo sfondo scuro dietro; i contorni di badge/wordmark completano il contrasto.
       const _vg158=c2.createRadialGradient(0,0,30,0,0,320);_vg158.addColorStop(0,"rgba(7,12,26,0.64)");_vg158.addColorStop(0.55,"rgba(7,12,26,0.30)");_vg158.addColorStop(1,"rgba(7,12,26,0)");
       c2.fillStyle=_vg158;c2.fillRect(-476,-476,952,952);
       c2.restore();
     } else {
       c2.fillStyle="rgba(7,12,26,0.62)";c2.beginPath();c2.arc(0,0,462,0,6.283);c2.fill();// disco scuro (fallback nazioni senza palette)
     }
     // emblema: LOGO DEL GIOCO (badge granata + barre + pallone) al posto della vecchia stella, in alto
     _cvLogoBadge(c2,0,-235,300);
     // ELEVORA — come il WORDMARK del logo (corsivo "elev" + pallone-o + "ra"), con contorno per il contrasto sul prato
     _cvWordmark(c2,0,80,150,"#e09aa6",true);
     // tagline competizione sotto
     // #7: tagline competizione CENTRATA e ADATTATA — riduce il font finché sta dentro il disco (niente overflow su nomi lunghi)
     {const _tl=_compLbl.toUpperCase();let _fs=72;const _maxW=640;/* [7.42.2] corda REALE del disco a y=250 (~890px) meno margine anello: prima 760 sfiorava il bordo */c2.font="800 "+_fs+"px Arial, sans-serif";
      let _w=c2.measureText(_tl).width;if(_w>_maxW){_fs=Math.max(34,Math.floor(_fs*_maxW/_w));c2.font="800 "+_fs+"px Arial, sans-serif";}
      c2.fillStyle=_emc;c2.textAlign="center";c2.fillText(_tl,0,250);}
     c2.restore();
     const _ct=new THREE.CanvasTexture(cc);
     _ceremonyCarpet=new THREE.Mesh(new THREE.CircleGeometry(11,48),new THREE.MeshBasicMaterial({map:_ct,transparent:true,opacity:0.92,depthWrite:false}));
     _ceremonyCarpet.rotation.x=-Math.PI/2;_ceremonyCarpet.position.set(0,0.07,0);_ceremonyCarpet.visible=false;scene.add(_ceremonyCarpet);}
    // 3DV-TIFO: tifo sulle CURVE dietro le porte (gli spalti più in vista nella camera) — bandiere alte, striscioni, sciarpe
    const _mkBigFlag=(x,z,tex,home,yv)=>{const fg=new THREE.Group();/* [7.184.0] yv = quota della fila (anelli curva) */
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,6.5,6),new THREE.MeshLambertMaterial({color:0x8f95a0}));pole.position.y=3.25;fg.add(pole);
      const piv=new THREE.Group();piv.position.set(0,5.4,0);/* [7.182.0] pivot sull asta (vedi _mkFlag) */
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.0),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
      const _fsc=0.84+((Math.abs(Math.round(x*11+z*17))+_tifoSeed)%8)*0.05;fl.scale.set(_fsc,_fsc,1);
      fl.position.set(1.7*_fsc,0,0);piv.add(fl);fg.add(piv);fg._fl=piv;fg._home=home!==undefined?home:(tex===_fhTex);
      const _zj84=((Math.abs(Math.round(z*13+x*7))+_tifoSeed)%5)-2;/* [7.184.0 collaudo PO «sciarpe e bandiere sparse in TUTTA la curva»] jitter z seedato ±2 → niente griglia regolare/ammassi */
      fg.position.set(x,yv||0,z+_zj84);
      fg.rotation.y=(x>=0)?-Math.PI/2:Math.PI/2;/* [7.171.0] la STOFFA guarda il CAMPO: i piani senza rotazione erano DI TAGLIO per la camera broadcast (si vedevano solo le aste = «palette») */
      scene.add(fg);flagGroups.push(fg);};// 5.45.2: tag lato
    // [7.125.0 collaudo PO «le coreografie non devono essere sempre uguali, alternanza anche in base all'importanza»]
    //   TIER COREOGRAFICO (1-3) da IMPORTANZA della gara (mw/finale/derby/big) + intensità folla + SEED per-match:
    //   tier1 = curva SOBRIA (1 fila bandiere · 3 file sciarpe · NIENTE telo · niente ola); tier2 = +2ª fila bandiere,
    //   +4ª sciarpa, telo, ola; tier3 (derby/finale/big match) = MURO PIENO (3 file bandiere · 5 sciarpe) + ola più
    //   rapida. Il seed alterna la scritta del telo → coreografie diverse a seconda del peso della partita e tra partite.
    const _impo=Math.min(1,((props.matchImportance||5)/10)+(props.isFinal?0.35:0)+(isDerby?0.18:0)+(isBigGame?0.10:0));
    const _cInt=_crowdCtx?(_crowdCtx.intensity||0.6):0.6;
    /* [7.187.0] TIER come MEDIA PESATA, non OR: con l'OR una piazza calda restava inchiodata al tier 3 (muro pieno)
       anche nella gara più banale — proprio dove il salto derby/finale dovrebbe vedersi di più. Ora l'importanza
       pesa più dell'atmosfera: piazza calda in gara qualunque → tier 2, tier 3 solo per derby/finale/big match. */
    const _cScore=_impo*0.62+_cInt*0.38;
    const _ctier=_cScore>=0.74?3:_cScore>=0.50?2:1;
    const _choSeed=(_adSeed44>>>0);
    const _olaOn=_ctier>=2,_olaSpd=_ctier>=3?0.00052:0.00034;// ola (onda messicana): solo tier≥2, più rapida sui big match
    // MURO DI BANDIERE scalato dal tier (traveling wave + ola nel render-loop)
    /* [7.184.0 collaudo PO «le sciarpe e le bandiere devono essere sparse in TUTTA la curva, non in un unico punto»]
       negli stadi piccoli i clamp _fRow2/_fRow3 (53.2/52.2) collassavano le 3 file quasi COMPLANARI alla fila 1 (54)
       → 24 bandiere impilate in ~2u di profondità = ammasso. Ora: fila 1 a TUTTA larghezza (z ±28), le file 2/3
       salgono di QUOTA (anelli della curva, y 2.6/5.2) e si sfalsano in z → il muro copre l'intera curva. */
    /* [7.185.0] BANDIERE su TUTTA la curva: le file salgono lungo la pendenza (t = 0.10 → 0.86), non più tre file
       quasi complanari al bordo campo. Lo z è sfalsato per fila (mezzo passo) → copertura piena senza griglia. */
    const _fRowsT=[[0.10,0.34,0.58,0.82],[0.10,0.30,0.50,0.70,0.86]][_ctier>=3?1:0].slice(0,_ctier>=3?5:(_ctier>=2?4:3));
    _fRowsT.forEach((t,ri)=>{const _zs=[-28,-21,-14,-7,0,7,14,21,28].map(z=>z+(ri%2?3.5:0));
      _zs.forEach((z,fi)=>{
        if(_tifoHome)_mkBigFlag(_cxAt(t,true),z,_fhPool[(fi+ri+_tifoSeed)%4],true,_cyAt(t,true));
        if(_tifoAway)_mkBigFlag(_cxAt(t,false),z,_faPool[(fi+ri*2+_tifoSeed)%4],false,_cyAt(t,false));
      });});
    // striscioni grandi attraverso le curve (rivolti verso il campo)
    /* [7.188.0 collaudo PO «lo striscione della curva non c'è più; gli striscioni dei gruppi ultras andrebbero messi
       sul MURO della curva»] stava a mezz'aria sull'anello alto (y=8.4, scelta 7.171): dopo il 7.185 le bandiere
       salgono lungo tutta la pendenza e glielo passavano davanti. Ora è dove sta in ogni stadio vero: appeso al
       PARAPETTO frontale della curva, davanti alla prima fila (quota del muretto, leggermente staccato verso il
       campo così nulla lo copre). */
    /* [7.189.0 collaudo PO «gli striscioni ultras devono essere appoggiati PROPRIO SUL MURO delle tribune»]
       il 7.188 usava il fronte della GRADINATA, ma il muro (base in cemento di addStand: box profondo standD+3,
       alto 3) SPORGE ~2u più avanti → lo striscione restava sospeso in aria sopra i tifosi. Ora è ancorato alla
       faccia frontale REALE del muro (sideX ∓ (D+3)/2) e centrato sulla sua altezza: appeso al parapetto, come
       in ogni curva vera. */
    if(_tifoHome)_mkStriscione(_muroX(true),0,-Math.PI/2,_tHCol,_hc2,_ultrasName(_stadHN,_tifoSeed,4,_stadHNat,_stadHId),_muroY);/* [7.171.0] anello ALTO della curva (a 5.5 stava DIETRO le bandiere) + rotY INVERTITO: +PI/2 mostrava il RETRO del piano → scritta SPECCHIATA (bug storico invisibile finché lo striscione non aveva testo) */
    if(_tifoAway)_mkStriscione(_muroX(false),0,Math.PI/2,_tACol,_ac2,_ultrasName(_stadAN,_tifoSeed+13,5,_stadANat,_stadAId),_muroY);
    // onda di SCIARPE alzate — strip con texture a sciarpe affiancate, oscillazione lenta + boost al gol
    const scarfMs=[];
    /* [7.535.0] LA SCIARPATA CONDIVIDE IL DISEGNO: il canvas dipende solo dai due colori sociali, ma la
       `repeat.x` (che allarga la striscia al segmento) vive sulla TEXTURE, non sul materiale — quindi la
       chiave include il repeat, arrotondato a 1/4 di cella: 46 texture identiche diventano una manciata,
       e la scala delle celle resta indistinguibile a occhio. */
    const _mkScarfTex535=(c1Hex,c2Hex,rep)=>_memoTex535("sc|"+c1Hex+"|"+c2Hex+"|"+rep.toFixed(2),()=>{const t=_mkScarfTexRaw(c1Hex,c2Hex);t.wrapS=THREE.RepeatWrapping;t.repeat.x=rep;return t;});
    const _mkScarfTexRaw=(c1Hex,c2Hex)=>{const sc=document.createElement("canvas");sc.width=512;sc.height=48;const sx=sc.getContext("2d");
      /* [7.171.0 TIFO 2.0] SCIARPATA vera: ogni cella è una SCIARPA (fasce alle estremità + banda centrale, frange
         in basso, inclinazione alternata) invece dei blocchi pieni alternati — a distanza legge come muro di sciarpe */
      for(let i=0;i<16;i++){const inv=i%2===1;const ca=inv?c2Hex:c1Hex,cb=inv?c1Hex:c2Hex;
        sx.save();sx.translate(i*32+16,24);sx.rotate((((i*2654435761>>>0)%9)-4)*0.022);
        sx.fillStyle=ca;sx.fillRect(-13,-21,26,42);
        sx.fillStyle=cb;sx.fillRect(-13,-21,26,7);sx.fillRect(-13,14,26,7);sx.fillRect(-13,-4,26,8);
        sx.strokeStyle=cb;sx.lineWidth=2;for(let f=-11;f<=11;f+=4){sx.beginPath();sx.moveTo(f,21);sx.lineTo(f,26);sx.stroke();}
        sx.restore();}
      return new THREE.CanvasTexture(sc);};
    const _mkScarf=(x,z,rotY,c1Hex,c2Hex,y,_scW)=>{
      const _sw84=(typeof _scW==="number"&&_scW>0)?_scW:26;
      const tex=_mkScarfTex535(c1Hex,c2Hex,Math.max(0.25,Math.round((_sw84/26)*4)/4));/* [7.184.0] striscia allargabile a TUTTA la curva: celle-sciarpa a taglia costante via repeat · [7.535.0] repeat quantizzato = texture condivisa */
      const m=new THREE.Mesh(new THREE.PlaneGeometry(_sw84,1.7),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true,opacity:0.9,depthWrite:false}));
      m.position.set(x,y||3.0,z);m.rotation.y=rotY;m._home=(c1Hex===_tHCol);m._baseY=y||3.0;scene.add(m);scarfMs.push(m);};// 5.45.2: tag lato + baseY · [6.5.1] tag su colore sociale
    // [7.124.0] MURO DI SCIARPE più alto: 5 file a quote diverse per curva + 2 sulla tribuna casa · gate dal contesto (§7/§8)
    //   l'onda è coordinata nel render-loop (traveling wave verticale → il muro ondeggia insieme)
    /* [7.185.0] SCIARPATE lungo la pendenza: ogni fila sta SULLA gradinata (x,y dal profilo reale della curva),
       non più tutte a x fissa e y 2-6 (= solo le prime file). Larghe quanto la curva (56u). */
    /* [7.187.0 collaudo PO «le sciarpe devono essere distribuite, non un unica fascia che sembra un festone di
       compleanno»] la sciarpata era UNA striscia continua a tutta curva (56u) per fila → letta come festone.
       Nella realtà le sciarpe le alzano GRUPPI di tifosi: ora ogni fila è spezzata in SEGMENTI corti (4-10u)
       separati da vuoti, con larghezze/posizioni seedate e sfalsate fila per fila. Gli striscioni restano. */
    [[0.16,0.44,0.72],[0.14,0.38,0.60,0.82],[0.12,0.30,0.48,0.66,0.84]][_ctier-1].forEach((t,ri)=>{
      let _z=-27+((_tifoSeed+ri*37)%5)-2;let _k=0;
      while(_z<26&&_k<9){
        const _h=(Math.abs(Math.round(_z*13+ri*71))+_tifoSeed)>>>0;
        const _w=4.5+(_h%6)*1.1;// 4.5-10u: quanti tifosi alzano insieme
        const _cz=_z+_w/2;
        if(_cz<26){
          if(_tifoHome)_mkScarf(_cxAt(t,true)-0.5,_cz,Math.PI/2,_tHCol,_hc2,_cyAt(t,true)+0.9,_w);
          if(_tifoAway)_mkScarf(_cxAt(t,false)+0.5,-_cz,-Math.PI/2,_tACol,_ac2,_cyAt(t,false)+0.9,_w);
        }
        _z+=_w+(1.6+((_h>>3)%5)*0.9);// stacco tra un gruppo e l'altro
        _k++;
      }});/* [7.125.0] file scalate dal tier */
    if(_tifoHome){_mkScarf(-13,-(_fez-2.5),0,_tHCol,_hc2,3.2);_mkScarf(13,-(_fez-2.5),0,_tHCol,_hc2,4.4);}
    // [7.124.0] TELO COREOGRAFICO — grande drappo bicolore con l'abbreviazione del club sulla curva di casa (e ospiti se
    //   pieno): plane SEGMENTATO → onda reale (traveling wave sui vertici) nel render-loop, si accende al gol/ingresso.
    const teloMs=[];
    const _mkTeloTex=(c1Hex,c2Hex,label)=>_memoTex535("tl|"+c1Hex+"|"+c2Hex+"|"+String(label||""),()=>_mkTeloTexRaw(c1Hex,c2Hex,label));/* [7.535.0] i teli ripetono poche combinazioni colore+parola */
    const _mkTeloTexRaw=(c1Hex,c2Hex,label)=>{const tc=document.createElement("canvas");tc.width=512;tc.height=160;const tx=tc.getContext("2d");
      tx.fillStyle=c1Hex;tx.fillRect(0,0,512,160);
      tx.fillStyle=c2Hex;tx.globalAlpha=0.9;tx.beginPath();tx.moveTo(0,0);tx.lineTo(104,0);tx.lineTo(0,160);tx.closePath();tx.fill();tx.beginPath();tx.moveTo(512,0);tx.lineTo(408,0);tx.lineTo(512,160);tx.closePath();tx.fill();tx.globalAlpha=1;
      if(label){const _L=String(label).toUpperCase();let _fs=104;tx.font="900 "+_fs+"px Arial, sans-serif";const _mw=456;/* [7.125.0] FIT-TO-WIDTH: la scritta (club o parola-coro) si adatta al telo, niente più slice(0,3) */if(tx.measureText(_L).width>_mw){_fs=Math.max(38,Math.floor(_fs*_mw/tx.measureText(_L).width));tx.font="900 "+_fs+"px Arial, sans-serif";}tx.textAlign="center";tx.textBaseline="middle";tx.lineWidth=10;tx.lineJoin="round";tx.strokeStyle="rgba(0,0,0,0.5)";tx.strokeText(_L,256,86);tx.fillStyle="rgba(255,255,255,0.98)";tx.fillText(_L,256,86);}/* [7.171.0] contorno scuro → scritta leggibile anche su teli chiari */
      tx.strokeStyle="rgba(255,255,255,0.4)";tx.lineWidth=7;tx.strokeRect(4,4,504,152);
      return new THREE.CanvasTexture(tc);};
    const _mkTelo=(x,z,rotY,c1Hex,c2Hex,label,isHome)=>{const w=30,h=7;const geo=new THREE.PlaneGeometry(w,h,20,6);
      const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:_mkTeloTex(c1Hex,c2Hex,label),side:THREE.FrontSide,transparent:true,opacity:0.97,depthWrite:false})/* [7.171.0] il telo a 0.9 leggeva come lastra slavata sopra la folla */);
      m.position.set(x,4.8,z);/* [7.171.0] telo più basso (sopra la folla bassa) → lo striscione del gruppo vive sull anello alto senza sovrapporsi */m.rotation.y=rotY;m._home=isHome;m._base=geo.attributes.position.array.slice();scene.add(m);teloMs.push(m);};
    // [7.125.0] TELO solo tier≥2 (le partite sobrie NON hanno il drappo → alternanza per importanza); la scritta
    //   ALTERNA per seed tra abbreviazione del club, una parola-coro e solo-colori → varia tra una partita e l'altra.
    const _teloWords=["ULTRAS","FEDELI","ORGOGLIO","CUORE","LA NOSTRA CASA"];
    const _teloLbl=(_choSeed%3===0)?(club?.a||""):(_choSeed%3===1)?_teloWords[(_choSeed>>>2)%_teloWords.length]:"";/* [7.147.0] >>> (seed unsigned: >>2 con segno dava indice negativo → scritta undefined) */
    if(_ctier>=2){
      if(_tifoHome)_mkTelo(_sideX-2.6,0,-Math.PI/2,_tHCol,_hc2,_teloLbl,true);/* [7.171.0] stesso fix specchio del telo (la scritta ULTRAS/club era mirrored) */
      if(_tifoAway)_mkTelo(-_sideX+2.6,0,Math.PI/2,_tACol,_ac2,"",false);
    }
    /* [7.573.0 collaudo PO «gli striscioni, sciarpe e bandiere della tifoseria ospite non ci sono»]
       CENSIMENTO DELLA SCENOGRAFIA PER LATO (solo collaudo). L'occhio non distingue «l'arredo ospite non
       e' stato costruito» da «e' stato costruito ma sta fuori inquadratura»: sono due difetti diversi.
       Questo hook conta cio' che e' stato COSTRUITO, lato per lato, e dichiara il contesto folla che ha
       deciso i cancelli `_tifoHome`/`_tifoAway`. Senza, ogni indagine sull'arredo parte da uno screenshot. */
    if(typeof window!=='undefined')window.__CPM_TIFO=()=>{try{
      const _c=(arr,h)=>arr.filter(o=>!!o._home===h).length;
      return{ctx:{fill:_crowdCtx?+(_crowdCtx.fill||0).toFixed(3):null,awayFill:_crowdCtx?+(_crowdCtx.awayFill||0).toFixed(3):null,intensity:_crowdCtx?+(_crowdCtx.intensity||0).toFixed(3):null},
        cancelli:{home:!!_tifoHome,away:!!_tifoAway},tier:_ctier,
        bandiere:{home:_c(flagGroups,true),away:_c(flagGroups,false)},
        sciarpe:{home:_c(scarfMs,true),away:_c(scarfMs,false)},
        teli:{home:_c(teloMs,true),away:_c(teloMs,false)}};
    }catch(e){return{err:String(e&&e.message||e)};}};
    // Sprint 3D-G3C: particelle coriandoli al gol (pre-allocate, attivate sul goal burst)
    const CONF_N=64,confPos=new Float32Array(CONF_N*3),confVel=new Float32Array(CONF_N*3);
    const confGeo=new THREE.BufferGeometry();confGeo.setAttribute('position',new THREE.BufferAttribute(confPos,3));
    const confMat=new THREE.PointsMaterial({color:0xffd700,size:0.7,transparent:true,opacity:0,depthWrite:false});
    const confPts=new THREE.Points(confGeo,confMat);scene.add(confPts);
    let confActive=false;
    // 5.49.23: CERIMONIA TROFEO 3D — trofeo dorato (nascosto finché la premiazione non parte) + fuochi d'artificio
    const trophyGrp=new THREE.Group();
    const _goldMat=new THREE.MeshStandardMaterial({color:0xffd24a,emissive:0x6b4e00,emissiveIntensity:0.5,metalness:0.9,roughness:0.25});
    const _plMat=new THREE.MeshStandardMaterial({color:0x3a2a12,metalness:0.4,roughness:0.6});
    {const _cup=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.22,0.6,18),_goldMat);_cup.position.y=0.95;trophyGrp.add(_cup);
     const _stem=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.35,10),_goldMat);_stem.position.y=0.55;trophyGrp.add(_stem);
     const _bs=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.3,0.18,16),_goldMat);_bs.position.y=0.34;trophyGrp.add(_bs);
     const _pl=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.38,0.16,16),_plMat);_pl.position.y=0.18;trophyGrp.add(_pl);}
    /* [7.474.0 collaudo PO «la coppa non e' disegnata bene, ha le orecchie separate»] LE ORECCHIE ERANO STACCATE, E IL DISTACCO SI CALCOLA. L'attacco del manico stava piu' in fuori del bordo della coppa in TUTTI E TRE i trofei: 0,10-0,15u sul trofeo base, 0,30u sulle orecchie larghe internazionali (con l'estremo superiore addirittura sopra il bordo, dove la coppa non c'e' piu'), 0,24-0,47u su quello della parata. Non era una questione di stile: era un manico che galleggia accanto alla coppa. Ora il centro del toro sta dove il PROFILO della coppa passa, cosi' gli estremi dell'arco nascono dalla superficie invece di sfiorarla — numeri ricavati dal profilo stesso (cono r(y) per il trofeo, sfera per quello della parata), non scelti a occhio. */
    {const _hL=new THREE.Mesh(new THREE.TorusGeometry(0.22,0.04,8,16,Math.PI),_goldMat);_hL.position.set(-0.26,0.95,0);_hL.rotation.z=Math.PI/2;trophyGrp.add(_hL);
     const _hR=new THREE.Mesh(new THREE.TorusGeometry(0.22,0.04,8,16,Math.PI),_goldMat);_hR.position.set(0.26,0.95,0);_hR.rotation.z=-Math.PI/2;trophyGrp.add(_hR);}
    trophyGrp.scale.setScalar(0.62);trophyGrp.visible=false;trophyGrp.position.y=-50;scene.add(trophyGrp);/* [7.5.1] trofeo PROPORZIONATO al giocatore (~2.2u): scala 1.7→0.62 (era enorme, quasi alto come un calciatore) */
    // [7.2.0] PODIO a centrocampo per la premiazione finale (beat 4). Nascosto fino alla cerimonia.
    const podiumGrp=new THREE.Group();
    {const _podMat=new THREE.MeshStandardMaterial({color:0x243049,metalness:0.35,roughness:0.6});
     const _podBody=new THREE.Mesh(new THREE.CylinderGeometry(1.7,2.0,1.0,22),_podMat);_podBody.position.y=0.5;podiumGrp.add(_podBody);
     const _podTrim=new THREE.Mesh(new THREE.CylinderGeometry(1.78,1.78,0.14,22),_goldMat);_podTrim.position.y=1.0;podiumGrp.add(_podTrim);
     const _podStep=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.5,0.28,22),_podMat);_podStep.position.y=0.14;podiumGrp.add(_podStep);}
    podiumGrp.visible=false;podiumGrp.position.set(0,0,0);scene.add(podiumGrp);
    let ceremonyT=-1,ceremonyFwT=0,_cerHx0=0,_cerHz0=0;// [7.2.0] _cerHx0/z0: posizione di raduno dell'eroe al fischio finale (partenza del giro di campo)
    const FW_N=60,fwPos=new Float32Array(FW_N*3),fwVel=new Float32Array(FW_N*3);
    const fwGeo=new THREE.BufferGeometry();fwGeo.setAttribute('position',new THREE.BufferAttribute(fwPos,3));
    const fwMat=new THREE.PointsMaterial({color:0xffaa33,size:0.55,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    const fwPts=new THREE.Points(fwGeo,fwMat);scene.add(fwPts);
    let fwActive=false,fwT=0,fwHue=0.08;
    // LT-1: anello contact point — pre-allocato, attivato sul kick/header
    const ctFlash=new THREE.Mesh(new THREE.RingGeometry(0.18,1.0,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));// 3DV-1: ring proporzionale a ball r=0.65
    ctFlash.rotation.x=-Math.PI/2;ctFlash.position.y=0.06;scene.add(ctFlash);
    // ATE-4: zona ring — anello sul campo che evidenzia la zona HL durante intro/move/choose
    const zoneRingMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false});
    const zoneRing=new THREE.Mesh(new THREE.RingGeometry(2.2,4.8,28),zoneRingMat);
    zoneRing.rotation.x=-Math.PI/2;zoneRing.position.y=0.09;/* 3DV-MOV2b: cerchio zona HL rimosso dalla scena (clutter visivo). Mesh conservata per non rompere i riferimenti del RAF. */
    let zoneRingT=-1;

    Object.assign(sr.current,{scene,camera,renderer,players,hero,ball,G2X,G2Z});

    // VISUAL-TEST (4.81.0): hook di validazione regia/3D, attivi SOLO con ?cpmtest=1.
    // In produzione (GitHub Pages, senza il param) questo blocco non viene mai eseguito → zero impatto.
    if(typeof window!=='undefined' && !window.__CPM_STORE_BUILD && (/[?&]cpmtest=1\b/.test(window.location.search||"")||/[?&]sit=\d/.test(window.location.search||"")||window.__CPM_REVIEW)){/* [7.224.0] +modalità REVISIONE: il 7.211.0 aveva esteso al wizard i hook di LiveMatch ma non le probe di osservazione del 3D — senza, ciò che il wizard mostra non è misurabile */// 5.43.6: probe di stato (__CPM_STATE/__CPM_PROBE) attivi anche in Situation Test Mode
      window.__CPM3D={scene,camera,renderer,hero,ball,players};
      window.__CPM_PROBE=function(){
        const proj=(obj)=>{ if(!obj||!obj.position)return null; const p=obj.position.clone().project(camera);
          return {onScreen:Math.abs(p.x)<=1.05&&Math.abs(p.y)<=1.05&&p.z<1, ndc:{x:+p.x.toFixed(3),y:+p.y.toFixed(3),z:+p.z.toFixed(3)}, world:{x:+obj.position.x.toFixed(2),y:+obj.position.y.toFixed(2),z:+obj.position.z.toFixed(2)}}; };
        const c=camera.position;
        return { ok:true, camera:{x:+c.x.toFixed(2),y:+c.y.toFixed(2),z:+c.z.toFixed(2),abovePitch:c.y>0.5}, hero:proj(hero), ball:proj(ball), phase:(propsRef.current&&propsRef.current.matchPhase)||null, clock:(propsRef.current&&propsRef.current.matchClock)||null };
      };
      // [6.40.0 diag] sonda GESTO EROE (test-only): legge le rotazioni degli arti del protagonista → serve a
      //   misurare oggettivamente se l'animazione d'azione (cross/dribble/tiro) parte davvero o «resta fermo».
      window.__CPM_GESTURE=function(){ if(!hero)return null; const r=(m)=>m?{x:+(m.rotation.x||0).toFixed(3),z:+(m.rotation.z||0).toFixed(3)}:null;
        const _gav=(typeof glbAvatars!=='undefined'&&glbAvatars&&glbAvatars[0])?glbAvatars[0]:null;
        return { lR:r(hero._lR), lL:r(hero._lL), aL:r(hero._aL), aR:r(hero._aR), rotY:+(hero.rotation.y||0).toFixed(3), posY:+(hero.position.y||0).toFixed(3), phase:(propsRef.current&&propsRef.current.matchPhase)||null, hlType:(propsRef.current&&propsRef.current.hlType)||null, hlVariant:(propsRef.current&&propsRef.current.hlVariant)||null,
          glb:_gav?{gName:_gav._gName||null,gw:+((_gav._gw||0).toFixed(3)),hasDribbleClip:!!(_gav.gestures&&_gav.gestures.dribble)}:null }; };
      /* [7.322.0 collaudo — il modello logico e la scena erano due partite diverse] PONTE MESH→LOGICA.
         Nel gioco convivono DUE insiemi di 22 giocatori: `matchPlayers` (l'array logico di LiveMatch, su cui
         si calcolano marcatura e guadagno del movimento) e le MESH 3D (quelle che l'utente vede, mosse
         dall'AI off-ball del render-loop). Non sono la stessa cosa e divergono parecchio: misurato su 12
         situation, il «marcatore» logico risultava a 1.8-5.6 unita' dall'eroe mentre il difensore piu' vicino
         in campo era a 4.6-25 — su gi80/gi100/gi120/gi140 uno scarto di 15-20 unita', cioe' il gioco ti
         penalizzava per un avversario che sullo schermo non c'era. E' la stessa classe di difetto vista piu'
         volte (due sorgenti per una sola verita').
         Qui il renderer espone una lettura A RICHIESTA delle posizioni vere: nessun costo per frame (la
         chiama solo chi muove il pad, poche volte a highlight) e nessun re-render (è un ref, non stato).
         Restituisce eroe e avversari nella STESSA sorgente, perche' misurare una direzione con due sorgenti
         diverse dava il risultato invertito — errore gia' pagato nel 7.317. */
      try{const _mdRef=propsRef.current&&propsRef.current.meshDef;
        if(_mdRef)_mdRef.current=function(){try{
          const _w2g=(wx,wz)=>({x:wx+50,y:wz/0.68+50});
          const _ap=(propsRef.current&&propsRef.current.allPlayers)||[];
          const _aw=[];sr.current.players.forEach((pp,ii)=>{const src=_ap[ii];
            if(!pp||!pp.mesh||!src||src.team!=="away"||src.gk)return;
            const g=_w2g(pp.mesh.position.x,pp.mesh.position.z);_aw.push(g);});
          /* [7.370.0] anche i COMPAGNI e il PORTIERE, dalla STESSA sorgente. Il ponte serviva solo a
             trovare il marcatore; ora la consegna d'apertura deve far nascere il pallone sui piedi di un
             compagno, e leggerlo dall'array logico dava lo stesso scarto di 15-20u che questo ponte era
             nato per eliminare. Additivo: chi legge solo {hero,away} non cambia comportamento. */
          const _hm=[];let _gk=null;sr.current.players.forEach((pp,ii)=>{const src=_ap[ii];
            if(!pp||!pp.mesh||!src||src.team!=="home")return;
            const g=_w2g(pp.mesh.position.x,pp.mesh.position.z);
            if(src.gk)_gk=g;else _hm.push(g);});
          const _hg=_w2g(hero.position.x,hero.position.z);
          return {hero:_hg,away:_aw,home:_hm,gk:_gk};
        }catch(_e){return null;}};
      }catch(_e){}
      // STATE probe (4.83.0): stato completo della scena per la validazione logica/tattica.
      // I check lato harness combinano questo con i dati della Situation (che già conoscono).
      window.__CPM_STATE=function(){
        const ap=(propsRef.current&&propsRef.current.allPlayers)||[];
        const projN=(pos)=>{const p=pos.clone().project(camera);return {x:+p.x.toFixed(3),y:+p.y.toFixed(3),z:+p.z.toFixed(3),onScreen:Math.abs(p.x)<=1.05&&Math.abs(p.y)<=1.05&&p.z<1};};
        const w2g=(wx,wz)=>({x:+(wx+50).toFixed(1),y:+(wz/0.68+50).toFixed(1)}); // inverso di G2X/G2Z (G2X=(gx-50), G2Z=(gy-50)*0.68)
        const mk=(mesh,team,role,gk)=>{const g=w2g(mesh.position.x,mesh.position.z);const n=projN(mesh.position);return {team,role:role||null,gk:!!gk,x:g.x,y:g.y,worldY:+mesh.position.y.toFixed(2),ry:+(mesh.rotation.y||0).toFixed(3),/* [7.355.0] ORIENTAMENTO: senza, «i giocatori non sono in posizione d'attesa» resta un giudizio a occhio e non un numero */visible:mesh.visible!==false,onScreen:n.onScreen,ndc:{x:n.x,y:n.y}};};
        const plist=players.map((pp,i)=>{const src=ap[i]||{};return mk(pp.mesh||pp,src.team||null,src.role,src.gk);});
        const heroState=mk(hero,"home","hero",false);
        const bg=w2g(ball.position.x,ball.position.z),bn=projN(ball.position);
        let held=null,bd=1e9; plist.concat([heroState]).forEach(p=>{const d=Math.hypot(p.x-bg.x,p.y-bg.y);if(d<bd){bd=d;held=p;}});
        const c2=camera.position; const pr0=propsRef.current||{};
        return { ok:true, phase:pr0.matchPhase||null, clock:pr0.matchClock||null,
          ref:(function(){try{return{x:+refMesh.position.x.toFixed(2),z:+refMesh.position.z.toFixed(2)};}catch(_e){return null;}})(),/* [7.303.0] posizione dell'arbitro per la probe referee-motion (test-only) */
          ball:(function(){try{return{x:+ball.position.x.toFixed(2),z:+ball.position.z.toFixed(2)};}catch(_e){return null;}})(),
          camera:{x:+c2.x.toFixed(2),y:+c2.y.toFixed(2),z:+c2.z.toFixed(2),abovePitch:c2.y>0.5},
          camLook:(function(){try{return{x:+camLook.x.toFixed(1),y:+camLook.y.toFixed(1),z:+camLook.z.toFixed(1)};}catch(_e){return null;}})(),/* [7.237.0 #50 strumentazione] senza il punto guardato REALE, «quale regia possiede la camera» resta una deduzione — campo additivo, la firma golden legge solo i campi che già leggeva */
          // target LOGICI (deterministici con reseed) — distinti dalla posa mesh che lerpa
          heroTarget:{x:pr0.playerX==null?null:+(+pr0.playerX).toFixed(1),y:pr0.playerY==null?null:+(+pr0.playerY).toFixed(1)},
          ballTarget:{x:pr0.ballX==null?null:+(+pr0.ballX).toFixed(1),y:pr0.ballY==null?null:+(+pr0.ballY).toFixed(1)},
          attackDir:1, goalHome:{gx:0}, goalAway:{gx:100}, // home attacca verso gx=100 (porta away)
          players:plist, hero:heroState,
          ball:{x:bg.x,y:bg.y,worldY:+ball.position.y.toFixed(2),onScreen:bn.onScreen,ndc:{x:bn.x,y:bn.y},heldBy:{team:held&&held.team,role:held&&held.role,dist:+bd.toFixed(1)}},
          counts:{home:plist.filter(p=>p.team==="home").length,away:plist.filter(p=>p.team==="away").length,ref:plist.filter(p=>p.team==="ref").length,total:plist.length},
          // [5.94.0 ARC-1c] campi PURI e stabili della situation forzata (intent/ballState/movesCap):
          //   funzioni pure di SITUATIONS[gi] → ampliano l'oracolo golden senza le posizioni off-ball (flaky)
          act:(function(){try{return{t:actType||null,aT:+(actT||0).toFixed(2),tgt:sr.current._dbgHT||null,ht:pr0.hlType||null,ok:pr0.hlSuccess==null?null:!!pr0.hlSuccess,pat:pr0.hlPattern||null,rew:pr0.hlReward||null,kind:pr0.hlOutcomeKind||null};}catch(_e){return null;}})(),/* [7.358.0] AZIONE IN CORSO (test-only): `actType` e' la variabile su cui si dirama TUTTA la cinematica d'esito (ampiezza dell'avanzamento, durata del gesto, clip GLB). Finora la si poteva leggere solo da `__CPM_GST`, che esiste SOLO GLB-ON: cioe' proprio nella modalita' in cui headless distorce i tempi. Senza questo campo «il dribbling non si vede» resta un giudizio a occhio */
          sitSig:(function(){try{const gi=window.__CPM_LAST_FORCED_GI;if(gi==null)return null;const st=(typeof SITUATIONS!=='undefined')?SITUATIONS[gi]:null;if(!st)return null;return{it:(typeof deriveIntent==="function"?deriveIntent(st):null)||null,bs:(typeof hlBallState==="function"?hlBallState(st):null)||null,mm:(typeof cappedMM==="function"?cappedMM(st):null)};}catch(_e){return null;}})() };
      };
      /* [7.343.0] LETTURA LEGGERA DELLA SOLA PALLA. Il gate aspetta che il pallone si fermi prima di
         giudicare lo stato finale, e per farlo campionava `__CPM_STATE()` — che proietta 22 giocatori, calcola
         ndc e serializza tutto: misurati ~530 ms a lettura, con la conseguenza che «6 letture consecutive
         stabili» voleva dire 3,2 secondi ininterrotti e un singolo sussulto azzerava il conteggio. Risultato:
         6 item su 10 esaurivano il limite di 9 secondi. Qui c'è solo quello che serve a capire se la palla si
         muove ancora. Test-only, come tutto il resto del blocco. */
      window.__CPM_BALL=function(){try{return{x:+(ball.position.x+50).toFixed(2),y:+(ball.position.z/0.68+50).toFixed(2),worldY:+ball.position.y.toFixed(2)};}catch(_e){return null;}};
      /* [7.538.0 missione «partita vera»] IL PADRONE DEL PALLONE, DA UNA SOLA SORGENTE. La misura del
         possesso ambientale (7.537) leggeva la palla dalle MESH e i giocatori da `matchPlayers` (l'array
         LOGICO): sono due partite diverse — il 7.322 ha misurato scarti fino a 15-20 unita' fra le due —
         e con due sorgenti «palla senza padrone» e' un numero che non dimostra niente (e' esattamente la
         trappola che il 7.322 e il 7.370 hanno gia' pagato). Qui palla, giocatori ed eroe escono TUTTI
         dalle mesh, cioe' da cio' che l'utente vede; niente proiezione ndc, niente serializzazione dei 22
         (__CPM_STATE costa ~530 ms a lettura, inutilizzabile come campionatore). Test-only. */
      window.__CPM_OWN=function(){try{
        const bx=ball.position.x+50,by=ball.position.z/0.68+50;
        let bi=-1,bd=1e9;
        players.forEach((pp,i)=>{const m=(pp&&pp.mesh)||pp;if(!m||!m.position)return;const d=Math.hypot(m.position.x+50-bx,m.position.z/0.68+50-by);if(d<bd){bd=d;bi=i;}});
        if(hero&&hero.position){const hd=Math.hypot(hero.position.x+50-bx,hero.position.z/0.68+50-by);if(hd<bd){bd=hd;bi=-2;}}
        const pr=propsRef.current||{};
        return{x:+bx.toFixed(2),y:+by.toFixed(2),i:bi,d:+bd.toFixed(2),c:pr.matchClock||0,ph:pr.matchPhase||null};
      }catch(_e){return null;}};
      // F1: probe del FOOTBALL STATE osservatore (lo aggiorna on-demand e lo ritorna) — per le metriche F0.
      window.__CPM_FOOTBALL_STATE=function(){try{updateFootballState();}catch(e){} return (sr.current&&sr.current.football)||null;};
      // [6.3.0 R0/LMQP-10] drain del recorder live: ritorna il buffer e lo svuota (il runner lo scarica a intervalli)
      window.__CPM_REC_DRAIN=function(){const b=window.__CPM_REC_BUF||[];window.__CPM_REC_BUF=[];return b;};
    }

    // Loop: lerp verso le posizioni target dai prop (nessun re-render React)
    let last=performance.now();
    // Stato camera cinematica: blend HL (0=wide, 1=close) smussato + look target smussato
    let camHL=0,bf=0;const camLook=new THREE.Vector3(10,1,0);
    // Sprint 3D-7: animazione one-shot del protagonista all'ingresso dell'esito (hl_result)
    let actT=0,actType=null,prevPhase="";
    /* [7.512.0 R2 — UNA SOLA SORGENTE PER LA FINESTRA DEL GESTO: audit «tre tabelle divergenti»] `_T`
       (inviluppo procedurale E vita di actType), `_T2` (avvicinamento) e `_wT56` (scala clip GLB) erano
       tre catene if/else nate in release diverse. La nota 7.467 ne conosceva DUE: `_T` e' rimasta a 0,75
       per la testa mentre le altre passavano a 1,15 — quindi actType moriva a u>=1 sul numero vecchio e
       il colpo di testa era TRONCATO al 65% qualunque cosa dicesse la scala clip. Non erano pero' tre
       copie di un numero: sono tre GRANDEZZE (vita, approccio, clip), e sul tackle la divergenza e'
       VOLUTA (scivolata che resta a terra 1,7s, corsa verso la palla 0,6s). La tabella le dichiara per
       colonna: comportamento conservato OVUNQUE tranne il bug provato (vita header 0,75 -> 1,15).
       L'approccio penalty resta 0,55 com'era spedito (ramo mancante nella vecchia catena): divergenza
       ORA DICHIARATA, non piu' nascosta. __CPM_NO467 resta la prova del rosso della testa (0,75 su
       tutte le colonne header). */
    /* [7.513.0 R2/2] colonna `pre`: il CARICAMENTO prima del contatto (la palla parte a -pre, il gesto
       carica sopra). Storico -0,24 per le 4 famiglie colpite (6.74); ora e' una proprieta' per famiglia:
       cross 0,32 e pass 0,27 (≈ vita/2, il picco dell'inviluppo sin(u·π) dove la gamba passa sul pallone —
       e' esattamente il principio del -0,24: vita tiro 0,55/2≈0,275). build/dribble/tackle a 0: conduzione
       e contrasto hanno la loro macchina (_hold415/poke). */
    const GESTURE_WIN={header:{vita:1.15,app:1.15,clip:1.15,pre:0.24},penalty:{vita:0.70,app:0.55,clip:0.70,pre:0.24},
      tackle:{vita:1.7,app:0.6,clip:1.7,pre:0},cross:{vita:0.65,app:0.65,clip:0.65,pre:0.32},
      shot:{vita:0.55,app:0.55,clip:0.55,pre:0.24},freekick:{vita:0.55,app:0.55,clip:0.55,pre:0.24},
      pass:{vita:0.55,app:0.55,clip:0.55,pre:0.27},build:{vita:0.55,app:0.55,clip:0.55,pre:0},
      dribble:{vita:0.55,app:0.55,clip:0.55,pre:0},_d:{vita:0.55,app:0.55,clip:0.55,pre:0}};
    const gwOf=(t,c)=>{if(t==='header'&&c!=='pre'&&typeof window!=='undefined'&&window.__CPM_NO467)return 0.75;/* il rosso 7.467 riguarda le finestre, non il caricamento */
      return (GESTURE_WIN[t]||GESTURE_WIN._d)[c];};
    /* [7.534.0 MP-1 — IL VOCABOLARIO DEL GESTO (prima ondata), rosso __CPM_NO547] La tabella GESTI e' il
       punto unico famiglia→variante→{clip, profilo-palla}: l'audit MP ha misurato che la clip usciva da una
       catena if (nove famiglie, sei clip, varianti mute) e che il PROFILO del volo non esisteva — un
       pallonetto e una sassata condividevano lo stesso seno, distinte solo dall'altezza H. Colonne:
       `clip` = chiave del gesture-set dell'EROE (r.11653: kick/penalty/header/tackle/volley/dribble;
       null = locomozione); `prof` = forma della pancia dell'arco («tesa» sale presto e viaggia piatta —
       sin^0.7; «campana» ha l'apice anticipato a u~0,38 e scende lunga — sin(u^0.72·π); null = seno 7.213).
       Il profilo NON tocca i bersagli ne' i punti d'arrivo (pancia sopra la corda, 0 agli estremi): la
       lezione 7.477 resta — traiettorie SOPRA i bersagli, mai al posto. Le colonne future (contactAt,
       vRef, spin, tgtY, foot) si aggiungono QUI, ognuna col suo consumatore e la sua misura. */
    const GESTI={
      shot:{base:{clip:'kick',prof:'tesa'},shot_power:{clip:'kick',prof:'tesa'},shot_first_time:{clip:'kick',prof:'tesa'},
        shot_placed:{clip:'kick',prof:null},shot_one_on_one:{clip:'kick',prof:null},shot_curled:{clip:'kick',prof:null},
        shot_chip:{clip:'kick',prof:'campana'},shot_volley:{clip:'volley',prof:'tesa'}},
      penalty:{base:{clip:'penalty',prof:'tesa'},penalty_panenka:{clip:'penalty',prof:'campana'}},
      freekick:{base:{clip:'kick',prof:null}},
      cross:{base:{clip:'kick',prof:null}},
      header:{base:{clip:'header',prof:null},header_diving:{clip:'header',prof:'tesa'},header_far_post:{clip:'header',prof:null}},
      dribble:{base:{clip:'dribble',prof:null}},
      pass:{base:{clip:'kick',prof:null}},
      build:{base:{clip:'dribble',prof:null}},
      tackle:{base:{clip:'tackle',prof:null},lunge:{clip:'kick',prof:null},press:{clip:null,prof:null},call:{clip:null,prof:null},aerial:{clip:'header',prof:null},slide:{clip:'tackle',prof:null}}};
    const gestoDi=(fam,varn)=>{const f=GESTI[fam];if(!f)return null;
      if(typeof window!=='undefined'&&window.__CPM_NO547)return f.base||null;/* prova del rosso: tabella appiattita alla riga base — le varianti perdono la firma */
      return (varn&&f[varn])||f.base||null;};
    if(typeof window!=='undefined')window.__CPM_GESTI=(f,v)=>{try{return f?gestoDi(f,v):JSON.parse(JSON.stringify(GESTI));}catch(_e){return null;}};/* hook del guardiano gesto-vocabolario: enumerazione + risoluzione in volo */
    // CINE-TL Fase 2: executor della timeline (build-up dell'azione prima della conclusione).
    let tlOn=false,tlT=0,tlSeg=null,tlMap=null,tlBuildN=0,fireConclusion=null;
    const _cineTest=(typeof window!=='undefined'&&/[?&]cpmtest=1\b/.test((window.location&&window.location.search)||"")&&!window.__CPM_CINE);/* [7.381.0 collaudo PO #83/#40/#96 «il pallone in corsa rimane dietro all'eroe»] LO SPIRAGLIO SUL BUILD-UP. `?cpmtest=1` spegne l'executor cine perche' il gate deve vedere la conclusione partire subito — e la conseguenza, mai notata in 380 versioni, e' che NESSUN collaudo ha mai guardato la costruzione dell'azione: 140 combinazioni scena/azione misurate, zero frame con l'executor vivo. E' esattamente la classe di trappola gia' pagata due volte in questa serie (il 7.370 dichiarato risolto misurando una presentazione che il giocatore non vede mai): lo strumento sbaglia prima del codice. Questo flag e' l'opt-in del collaudo, spento di default — il percorso del gate resta bit-identico. */
    // mappa attori astratti (HERO/MATE*/DEF*/GK/OPP) → mesh reali più vicini all'eroe
    const mapCineActors=(tl)=>{
      const Pp=propsRef.current,all=Pp.allPlayers||[],pls=sr.current.players;
      const hx=hero.position.x,hz=hero.position.z,home=[],away=[];
      pls.forEach((pp,i)=>{const s=all[i]||{};if(s.gk)return;const d=Math.hypot(pp.mesh.position.x-hx,pp.mesh.position.z-hz);(s.team==='away'?away:home).push({m:pp.mesh,d});});
      home.sort((a,b)=>a.d-b.d);away.sort((a,b)=>a.d-b.d);
      const map={HERO:hero,GK:awayGkMesh||null};let hi=0,ai=0;
      Object.keys(tl.actors||{}).forEach(id=>{if(id==='HERO'||id==='GK')return;if(id[0]==='M')map[id]=(home[hi++]||{}).m||null;else map[id]=(away[ai++]||{}).m||null;});
      return map;
    };
    let oppActType=null,oppActT=0,oppMesh=null,oppDiveDir=1; // CIN-2: animazione reazione avversario
    let _lastGk695=0;/* [7.695.0] ultimo segnale di parata gia' consumato: il tuffo si arma sul CAMBIO, non sulla presenza */
    let hlPostArcT=-1,hlPostArcType=null,hlPostVZ=0,hlPostVX=0; // 3DV-9: animazione post-arco · [7.514.0 R2/3] VX: il deflect non aveva una componente X — la palla parata restava sulla linea di porta a rimbalzare in laterale
    let heroPostT=-1,heroPostType=null; // 3DV-13: reazione eroe post-azione fallita
    let gkSaveCelebT=-1,gkSaveMesh=null; // 3DV-13: portiere si rialza dopo parata
    let hlInNetFlashed=false,hlPostVY=0; // 3DV-14: flash ingresso rete + fisica rimbalzo deflect
    let hlOutcomeVariant=null; // CINE-3: sotto-tipo outcome (save/post/wide/blocked)
    let preActionT=-1; // CINE-4: pre-action drift timer (hl_intro→hl_result)
    let subEntryT=-1,_lastSubEntry=0;const SUB_DUR=4.2; // item 2 (5.49.6): timer cerimonia 3D d'ingresso del subentrante
    let subExitT=-1,_lastSubExit=0;const _EXIT_DUR=[4.6,4.0,4.4,5.2,5.0];// [7.127.0] timer coreografia 3D d'USCITA (sostituzione) + durata per variante
    let _chooseT=-1,_hlSnap=false; // FREEZE #2: timer della fase di LETTURA + flag di SNAP iniziale (i giocatori off-ball si posizionano e restano fermi finché l'eroe non sceglie o scatta il timer)
    let netBulgeT=-1,prevInNet=false,concededT=-1; // CINE-6: gonfiamento rete + delusione portiere al gol subìto
    let passTargetMesh=null; // 3DV-14b: mesh compagno che riceve il passaggio (triangolo)
    let crossRcvMesh=null; // [6.74.0 3D-5] mesh compagno che ATTACCA il cross (corre sul punto di caduta e incorna)
    let _arcSrcX=null,_arcSrcZ=null; // [6.74.0 3D-6] punto di partenza dell'arco colpito → interpolazione LINEARE su u (prima lerp esponenziale: partenza a razzo e "frenata a paracadute" sul target)
    let _tackleCarrier=null; // FIX coerenza tackle: avversario portatore agganciato per la durata dell'HL difensivo (stabile)
    // Sprint 3D-8a: cronometro dell'esito per il rallenty cinematografico
    let resultT=0;
    // Sprint 3D-BALL: arco parabolico della palla (shot/header/cross/freekick/penalty)
    let ballArcT=0,ballArcDur=0,ballArcH=0,ballArcActive=false,ballArcProf=null;/* [7.534.0 MP-1] profilo di pancia dell'arco (tesa/campana/null) dalla tabella GESTI — si azzera a OGNI armo d'arco: un profilo stantio della scena prima e' la stessa classe di difetto del certificato 003/H4 */
    // ATE-1/2: arco BG_MATCH — tipo azione, destinazione 3D esatta, flag bg vs HL
    let prevBgT=0,ballArcIsBG=false,ballArcTgtX=0,ballArcTgtZ=0,ballArcTgtY=0.65;/* [7.215.0] ALTEZZA D'ARRIVO. Prima la parabola finiva SEMPRE a 0.65: qualunque conclusione, dal tiro a giro alla punizione, arrivava sulla linea di porta RASOTERRA. Non esisteva l'angolo alto, e il portiere non aveva nulla in alto da parare — una delle ragioni per cui «la parata non e nitida». Ora l'arco ha un bersaglio anche in altezza; il default 0.65 mantiene identiche le traiettorie che non lo impostano. */
    let ballArcY0=0.65,_aerT=0;// [7.214.0] quota da cui PARTE l'arco: catturata all'impatto, così una conclusione aerea non teletrasporta il pallone a terra prima di volare
    const BALL_ARC_BY_TYPE={shot:{h:2.8,dur:0.52},cross:{h:3.2,dur:0.68},save:{h:1.8,dur:0.55},tackle:{h:0.4,dur:0.35},pass:{h:0.9,dur:0.48}};
    // Sprint 3D-11A: reazione folla al gol — burst luce calda + camera shake
    let prevWaveT=0,goalBurstT=-1,goalBurstHome=false,goalBurstStadHome=false,shakePow=0,contactFlashT=-1,celebT=-1,crowdOhT=-1;// ATMO #4: crowdOhT = pulse "ooh" del pubblico su palo/parata (reazione neutrale, non solo gol) · goalBurstStadHome [6.24.0] = lato TRIBUNA che ha segnato (per pubblico/tifo/panchina, distinto dal lato-mesh)
    // Sprint 3D-8b: replay con riavvolgimento — ring buffer posizioni (≈2.5s) + macchina a stati
    const REP_CAP=150,snapSize=(players.length+1)*2+3;
    const repRing=new Float32Array(REP_CAP*snapSize);
    let repHead=0,repCount=0,replaying=false,replayDone=false,repT=0,repStart=0,repFrames=0;const REPLAY_DUR=2.6;
    const recordSnap=()=>{
      let o=repHead*snapSize;
      for(let i=0;i<players.length;i++){repRing[o++]=players[i].mesh.position.x;repRing[o++]=players[i].mesh.position.z;}
      repRing[o++]=hero.position.x;repRing[o++]=hero.position.z;
      repRing[o++]=ball.position.x;repRing[o++]=ball.position.y;repRing[o++]=ball.position.z;
      repHead=(repHead+1)%REP_CAP;repCount=Math.min(repCount+1,REP_CAP);
    };
    const _legFromSpeed=(mesh,sp,dt)=>{mesh._sp+=(sp-mesh._sp)*Math.min(dt*8,1);const s=mesh._sp;
      if(s>0.4){mesh._ph+=s*dt*2.6;const amp=Math.min(s*0.11,0.72);mesh._lL.rotation.x=Math.sin(mesh._ph)*amp;mesh._lR.rotation.x=-Math.sin(mesh._ph)*amp;mesh._aL.rotation.x=-Math.sin(mesh._ph)*amp*0.5;mesh._aR.rotation.x=Math.sin(mesh._ph)*amp*0.5;mesh.position.y=Math.abs(Math.sin(mesh._ph))*Math.min(s*0.018,0.12);}
      else{mesh._lL.rotation.x*=0.82;mesh._lR.rotation.x*=0.82;mesh.position.y*=0.8;}};
    const _applyFrame=(mesh,x,z,px,pz,dt)=>{const sp=Math.hypot(x-px,z-pz)/Math.max(dt,0.001);mesh.position.x=x;mesh.position.z=z;_legFromSpeed(mesh,sp,dt);
      const dx=x-px,dz=z-pz;if(Math.hypot(dx,dz)>0.04){const ta=Math.atan2(dx,dz),da=((ta-mesh.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;mesh.rotation.y+=da*Math.min(10*dt,1);}};
    const driveReplay=(dt)=>{
      repT+=dt;const prog=Math.min(repT/REPLAY_DUR,1);
      const fp=prog*(repFrames-1),fi=Math.floor(fp);
      const idx=(repStart+fi)%REP_CAP,pid=(repStart+Math.max(fi-1,0))%REP_CAP,o=idx*snapSize,po=pid*snapSize;
      for(let i=0;i<players.length;i++){_applyFrame(players[i].mesh,repRing[o+i*2],repRing[o+i*2+1],repRing[po+i*2],repRing[po+i*2+1],dt);}
      const hO=players.length*2;_applyFrame(hero,repRing[o+hO],repRing[o+hO+1],repRing[po+hO],repRing[po+hO+1],dt);
      const bO=hO+2;ball.position.x=repRing[o+bO];ball.position.y=repRing[o+bO+1];ball.position.z=repRing[o+bO+2];ball.rotation.y+=0.12;ball.rotation.x+=0.08;
      if(prog>=1){replaying=false;replayDone=true;setReplayOn(false);}
    };
    // Stato walkout 3D: i giocatori si schierano in fila, camera che scorre, poi calcio d'inizio
    let walkT=0,walkDone=false,_wasWalk=false;const WALK_DUR=10.5;// [6.90.0 collaudo PO «inquadrature d'ingresso più lente e meno frenetiche»] 6.2→10.5s: il giro a 360° respira (~9s), la chiusura sulla fila ha il suo tempo. [6.28.0] _wasWalk: rileva l'INIZIO della fase walkout nel render-loop → riavvia l'ingresso scaglionato dal tunnel ANCHE quando ThreeMatchView è montato prima (fase matchday) — prima l'ingresso "vero" partiva solo se il mount avveniva già in walkout (quasi mai) → i giocatori scivolavano dalla formazione, «sballato».
    // Cammina verso lo slot di walkout, fronte alla camera (-x)
    const animWalk=(mesh,dt,k)=>{
      // 5.47.17: prima del proprio turno il giocatore ASPETTA alla bocca del tunnel (idle leggero), poi entra
      if(walkT<(mesh._wDelay||0)){mesh._idle=(mesh._idle||0)+dt*1.4;mesh.rotation.z=Math.sin(mesh._idle)*0.025;mesh.rotation.y+=(-Math.PI/2-mesh.rotation.y)*Math.min(dt*4,1);
        if(mesh._lL){mesh._lL.rotation.x*=0.85;mesh._lR.rotation.x*=0.85;mesh._aL.rotation.x*=0.85;mesh._aR.rotation.x*=0.85;}mesh.position.y*=0.85;return;}
      const dx=mesh._wx-mesh.position.x,dz=mesh._wz-mesh.position.z,d=Math.hypot(dx,dz);
      mesh.position.x+=dx*k*0.85;mesh.position.z+=dz*k*0.85;// passo d'ingresso calmo (coerente col gioco più lento)
      const rawSp=Math.hypot(mesh.position.x-mesh._px,mesh.position.z-mesh._pz)/Math.max(dt,0.001);
      mesh._px=mesh.position.x;mesh._pz=mesh.position.z;mesh._sp+=(rawSp-mesh._sp)*Math.min(dt*8,1);const sp=mesh._sp;
      const ta=d>0.5?Math.atan2(dx,dz):-Math.PI/2; // verso movimento, altrimenti fronte camera
      const da=((ta-mesh.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;const _rotAw=da*Math.min(8*dt,1);mesh.rotation.y+=_rotAw;
      if(mesh._torso){mesh._tRot=(mesh._tRot||0)*(1-Math.min(dt*4.5,0.95))-_rotAw*0.5;mesh._torso.rotation.y=clamp(mesh._tRot,-0.45,0.45);}
      if(sp>0.4){mesh._ph+=sp*dt*2.6;const amp=Math.min(sp*0.11,0.72);mesh._lL.rotation.x=Math.sin(mesh._ph)*amp;mesh._lR.rotation.x=-Math.sin(mesh._ph)*amp;mesh._aL.rotation.x=-Math.sin(mesh._ph)*amp*0.5;mesh._aR.rotation.x=Math.sin(mesh._ph)*amp*0.5;mesh.position.y=Math.abs(Math.sin(mesh._ph))*Math.min(sp*0.018,0.12);}
      else{mesh._lL.rotation.x*=0.82;mesh._lR.rotation.x*=0.82;mesh._aL.rotation.x*=0.82;mesh._aR.rotation.x*=0.82;mesh.position.y*=0.8;mesh._idle=(mesh._idle||0)+dt*1.5;mesh.rotation.z=Math.sin(mesh._idle)*0.02;}
    };
    const animOne=(mesh,tx,tz,dt,k,bx,bz)=>{
      const dx=tx-mesh.position.x,dz=tz-mesh.position.z,d=Math.hypot(dx,dz);
      // Step C — MOVIMENTO: l'EROE resta CRISP (lerp diretto); gli off-ball usano bersaglio COMMESSO smussato + modello a VELOCITÀ con inerzia
      //   (accel/decel, momentum) → niente più inseguimento per-frame/zig-zag/micro-correzioni. Deterministico (nessun random).
      if(mesh._isHero){
        /* [7.194.0 S1] L'EROE HA UNA VELOCITÀ MASSIMA. Prima era un lerp esponenziale puro: la velocità era
           PROPORZIONALE alla distanza residua, senza rampa né tetto → al cambio di highlight (bersaglio anche a
           50-60u) attraversava il campo a oltre 100 u/s, cioè ~370 km/h, ed è la lettura più immediata di «questa
           è un'animazione». Ora: (a) oltre i 12u NON è una corsa ma un CUT DI SCENA (nuovo highlight/anello di
           catena) → riposizionamento immediato, come già fanno i 21 off-ball con lo snap d'avvio; (b) sotto i 12u
           è un moto vero con punta ~9.2 u/s (≈33 km/h), rampa d'accelerazione e decelerazione in arrivo. */
        const _HVMAX=9.2;
        /* [7.236.0 batch PO «l'eroe compare e scompare» gi8/12/21 — misurato col trap DBG51] il cut era
           deciso dalla DISTANZA (d>12 → teleport): ma durante il build-up dell'executor il BERSAGLIO corre
           (burst della timeline ~25 u/s) e l'eroe, cappato a 9.2, restava indietro finché il gap superava
           12u → TELEPORT in avanti sul pallone; poi fireConclusion ri-ancorava il bersaglio dietro →
           TELEPORT di ritorno. Doppio lampo deterministico = esattamente «compare e scompare». Un CUT DI
           SCENA è una DISCONTINUITÀ DEL BERSAGLIO (il target salta in un frame: nuovo highlight/catena),
           non un gap di inseguimento: ora si teleporta SOLO su salto del bersaglio (>12u/frame, o desync
           estremo >30u di sicurezza); un bersaglio in fuga continua si INSEGUE, con punta da scatto. */
        const _tj51=(mesh._htx!=null)?Math.hypot(tx-mesh._htx,tz-mesh._htz):1e9;
        mesh._htx=tx;mesh._htz=tz;
        /* [7.324.0 QA massivo anim-sync-sweep] IL TELEPORT E' SOLO PER LO STACCO DI SCENA. La regola 7.236
           «salto del bersaglio = cut» teleportava anche sui salti del bersaglio A META' ESITO — misurato su
           gi135 (HL difensivo): l'assestamento del recupero sposta il punto logico di ~32u e l'eroe si
           teletrasportava in chiaro, davanti alla camera. Ora il teleport e' concesso solo entro ~0.9s
           dall'armamento dello snap di scena (sr._cutAt, scritto dove si arma _hlSnap): fuori dalla
           finestra il salto del bersaglio e' UNA CORSA — l'eroe rincorre a 13 u/s, come un giocatore vero. */
        const _cutOk51=(function(){try{const _ca=sr.current._cutAt;return _ca!=null&&(performance.now()-_ca)<900;}catch(_e){return true;}})();
        if((_tj51>12||d>30)&&_cutOk51){mesh.position.x=tx;mesh.position.z=tz;mesh._hvx=0;mesh._hvz=0;mesh._px=tx;mesh._pz=tz;}
        else if(d>0.06){
          const _n=1/d,_want=Math.min(d>6?13.0:_HVMAX,d*4.2),_a=Math.min(dt*3.4,1);/* [7.236.0] oltre 6u di ritardo l'eroe passa allo SCATTO (13 u/s): rincorre la sua stessa giocata invece di teleportarsi */
          mesh._hvx=(mesh._hvx||0)+(dx*_n*_want-(mesh._hvx||0))*_a;
          mesh._hvz=(mesh._hvz||0)+(dz*_n*_want-(mesh._hvz||0))*_a;
          mesh.position.x+=mesh._hvx*dt;mesh.position.z+=mesh._hvz*dt;
        } else {mesh._hvx=(mesh._hvx||0)*0.7;mesh._hvz=(mesh._hvz||0)*0.7;}
      }
      else{
        if(mesh._ctx==null){mesh._ctx=tx;mesh._ctz=tz;}
        /* [7.198.0 S5 · direttiva PO «mai movimenti robotici, mai cambi di direzione istantanei»] OGNI GIOCATORE
           HA UNA MASSA. Fino a qui i 21 off-ball condividevano lo stesso identico motore: stessa velocità massima
           (8 u/s), stessa accelerazione, stessa reazione — un centrale di 190 cm partiva e frenava come un esterno,
           e il campo si muoveva come uno stormo di cloni (l'analizzatore di realismo misurava il 98% dei frame con
           TUTTI in movimento insieme: coreografia, non partita). Ora ogni giocatore ha punta, spunto e prontezza
           PROPRI, derivati in modo deterministico dal suo indice (nessun random: la firma del gate resta stabile). */
        if(mesh._vmax==null){const _h=(Math.imul((mesh._mIdx==null?7:mesh._mIdx)+1,2654435761)>>>0);
          mesh._vmax=7.1+((_h>>>3)%100)/100*2.9;      /* punta 7.1-10.0 u/s */
          mesh._acc=1.55+((_h>>>11)%100)/100*1.05;    /* spunto: chi è più pesante impiega di più a lanciarsi */
          mesh._react=0.30+((_h>>>19)%100)/100*0.70;  /* prontezza: non partono tutti nello stesso frame */
        }
        /* [7.592.0 — MISURATO QUI, NON ANCORA SPIEGATO] La scomposizione dei dieci metri fra il modello e
           cio' che si vede (22.895 misure) dice che il pezzo piu' grosso NON e' una scelta di regia:
             forma del reparto 5,86 m (voluta: la linea scorre col pallone) · richiamo di ruolo 0,96 ·
             pressing 3,74 (voluto) · marcature e coperture 0,43 · MESH CHE INSEGUE IL BERSAGLIO 5,42.
           Quei 5,42 metri sono ritardo puro, non regia. E non sono ne' un tetto di velocita' ne'
           un'oscillazione: la mesh copre il 71% del passo del bersaglio (0,166 m contro 0,233 per
           fotogramma) e il bersaglio inverte il verso solo nell'8% dei fotogrammi.
           NON E' NEMMENO UN ARTEFATTO DEL LABORATORIO A 7 FPS: questo smorzamento e' compensato in `dt`,
           quindi il ritardo e' lo stesso a 60 fps. La sua costante di tempo vale 1/1,25 = 0,8 s, e con un
           bersaglio che viaggia a 1,63 m/s il ritardo ATTESO e' 1,3 metri. Ne misuro 5,42: quattro volte
           tanto. Il primo stadio non basta a spiegarlo, e il sospetto — DICHIARATO NON VERIFICATO — e' che
           fra `_ctx` e la posizione disegnata ci sia un SECONDO smorzamento (l'inerzia su `_vx`/`_vz`), e
           che due smorzamenti in cascata moltiplichino il ritardo invece di sommarlo.
           NON TOCCO NIENTE QUI finche' non l'ho misurato: alzare una costante che non ho capito e' come
           ho gia' sbagliato oggi due volte.
           ⚠️ MISURATO POI, E LA CONCLUSIONE E' L'OPPOSTA DI QUELLA CHE MI ASPETTAVO. Il ritardo si divide
           in stadio 1 (bersaglio commesso indietro sul bersaglio) 2,27 m e stadio 2 (mesh indietro sul
           bersaglio commesso) 3,96 m. E l'integrazione e' ESATTA: passo voluto |vx*dt| 0,163 m contro
           passo effettivo 0,163 m, identici. Nessun difetto di calcolo, nessuna velocita' persa.
           Quindi i dieci metri fra la partita e cio' che si vede sono in larghissima parte PROGETTATI:
           forma del reparto 5,79 (la linea scorre col pallone, voluto) · pressing 3,73 (voluto) · i due
           stadi del ritardo 2,27 + 3,96 (voluti: sono esattamente cio' che rende il movimento non
           robotico — la rampa d'arrivo, il limitatore di sterzata, il freno per girarsi, tutti scritti
           apposta e con la loro misura nelle note qui sopra).
           ⚠️ E QUESTO CORREGGE UNA COSA CHE AVEVO SCRITTO IO due note fa: «l'utente guarda una partita che
           non e' quella che la simulazione sta giocando» era vero come descrizione e SBAGLIATO come
           accusa. La resa e' fatta per discostarsi dal modello; non e' deriva.
           Resta una domanda vera, ma e' una DECISIONE DI PRODOTTO e non un difetto: dieci metri di
           scostamento medio sono tanti, e se si vuole che l'occhio veda cio' che la simulazione decide,
           quel numero va scelto — non corretto di nascosto. Chi riprende questo filo parta da li'. */
        /* ⚠️ [7.594.0 PROVATO E REVOCATO CON LA SUA MISURA — «durante una pausa la mesh non ha niente da
           rendere morbido»] Avevo alzato prontezza e passo SOLO dentro la finestra della ripresa (primo
           stadio da 1,25 a 6,0; secondo stadio ×2,2), convinto da questa catena: quando il pallone e' «di
           nessuno», il 45% delle volte i contatori di ripresa sono aperti e li' il piu' vicino sta a 6,8
           metri dal pallone, mentre il modello ce lo mette a due.
           VERDE CONTRO ROSSO, stesso binario: distanza mediana del piu' vicino al pallone dentro la
           finestra 1,2 m col rimedio contro 0,7 m senza, quarto alto 4,1 contro 1,1. PEGGIORA, e di molto.
           ⚠️ MA IL VERO GUADAGNO E' SCOPRIRE PERCHE' LA PREMESSA ERA FALSA, ed e' un errore mio di metodo
           — il terzo oggi della stessa famiglia. Quei «6,8 metri» venivano da un campione CONDIZIONATO:
           li avevo misurati solo negli istanti in cui nessuno era entro due metri. In quel sottoinsieme la
           distanza e' alta per DEFINIZIONE. Ho misurato una tautologia e l'ho letta come difetto.
           La misura non condizionata dice l'opposto: durante la ripresa il piu' vicino al pallone sta a
           0,7 metri. Chi deve battere CE L'HA. Non c'era niente da riparare.
           LEZIONE: quando un numero descrive «quanto e' grave X», il campione non puo' essere selezionato
           su X. Vale anche per i 3,5 m «a gioco vivo» dello stesso censimento — stessa tautologia, stessa
           inaffidabilita'. */
        const _tsm=Math.min(dt*(1.25+mesh._react*0.95),1);mesh._ctx+=(tx-mesh._ctx)*_tsm;mesh._ctz+=(tz-mesh._ctz)*_tsm;// bersaglio commesso smussato, con prontezza PER GIOCATORE
        const cdx=mesh._ctx-mesh.position.x,cdz=mesh._ctz-mesh.position.z,cd=Math.hypot(cdx,cdz);
        const _dn=cd>1e-3?1/cd:0,_ds=Math.min(cd*3,mesh._vmax);
        /* RAMPA D'ARRIVO CONTINUA invece della soglia secca. Con una deadzone netta la velocità-obiettivo
           saltava fra 0 e piena a ogni oscillazione attorno alla soglia: misurato, faceva triplicare gli strappi
           (jerk 9.9 → 40.9) e quasi raddoppiare gli arresti secchi. Ora la velocità sfuma dentro l'ultimo metro:
           il giocatore RALLENTA arrivando, invece di spegnersi. */
        const _dz=0.26+mesh._react*0.34;
        const _ar=clamp((cd-_dz)/1.15,0,1),_arS=_ar*_ar*(3-2*_ar);
        let _tvx=cdx*_dn*_ds*_arS,_tvz=cdz*_dn*_ds*_arS;
        /* NON SI INVERTE LA MARCIA A VELOCITÀ PIENA: la sterzata è limitata e si stringe al crescere della
           velocità — a passo d'uomo si gira quasi sul posto, in corsa serve una curva. Prima il vettore velocità
           poteva ruotare di 180° in mezzo secondo: è la firma del movimento robotico. */
        const _cs=Math.hypot(mesh._vx||0,mesh._vz||0);
        if(_cs>0.7&&(_tvx||_tvz)){
          const _cur=Math.atan2(mesh._vz,mesh._vx),_wnt=Math.atan2(_tvz,_tvx);
          let _da=((_wnt-_cur+Math.PI*3)%(Math.PI*2))-Math.PI;
          /* [7.241.0 batch PO gi28/29/37 «Non si vede il compagno che conclude» — attribuito con AR53/54: il
             ricevente lanciato sulla corsa profonda, con la palla atterrata ALLE SPALLE, navigava un'inversione
             a U larga 20u e lunga secondi (turn-rate ∝ 1/velocità, magnitudine piena nella direzione sbagliata)
             mentre il suo bersaglio commesso era GIÀ sulla palla] FRENA PER GIRARTI: quando la direzione voluta
             è oltre ~60° da quella di marcia, la velocità-obiettivo cala col disallineamento (fino a ~0.18×) —
             la decelerazione passa dal limitatore d'accelerazione, la velocità scende e il turn-rate (che cresce
             al calare della velocità) permette il pivot: due passi di frenata e ci si gira, come in campo. */
          const _misal=Math.abs(_da);
          if(_misal>1.05){const _bf=Math.max(0.18,1-(_misal-1.05)/1.4);_tvx*=_bf;_tvz*=_bf;}
          const _mt=(4.2/(0.6+_cs*0.30))*dt;
          if(Math.abs(_da)>_mt){const _na=_cur+(_da>0?_mt:-_mt),_mg=Math.hypot(_tvx,_tvz);_tvx=Math.cos(_na)*_mg;_tvz=Math.sin(_na)*_mg;}
        }
        /* ACCELERAZIONE LIMITATA IN u/s², non un lerp. Il lerp sulla velocità (v += (target-v)*rate) non ha
           alcun tetto fisico: con bersagli lontani il primo frame produceva salti di velocità enormi — misurato,
           lo strappo al 90° percentile arrivava a 35-40 u/s² (baseline 9.9), cioè un'accelerazione da cartone
           animato. Ora la variazione di velocità per frame è limitata da un'accelerazione massima PER GIOCATORE:
           lo strappo è vincolato per costruzione e chi è più pesante ci mette di più a lanciarsi e a fermarsi. */
        const _amax=5.3+mesh._acc*1.5;/* 7.6-9.2 u/s²: un calciatore vero accelera 4-8 m/s², e il tetto è ciò che rende la partenza «pesante» invece che a scatto */
        const _dvx=_tvx-(mesh._vx||0),_dvz=_tvz-(mesh._vz||0),_dv=Math.hypot(_dvx,_dvz),_lim=_amax*dt;
        if(_dv>_lim&&_dv>1e-4){mesh._vx=(mesh._vx||0)+_dvx/_dv*_lim;mesh._vz=(mesh._vz||0)+_dvz/_dv*_lim;}
        else{mesh._vx=_tvx;mesh._vz=_tvz;}
        if(typeof window!=='undefined'&&window.__CPM_D592)window.__CPM_DT592=dt;/* [7.592.0 collaudo] il dt vero del passo di integrazione */
        mesh.position.x+=mesh._vx*dt;mesh.position.z+=mesh._vz*dt;
        if(mesh._isGk&&typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_GKV705=window.__CPM_GKV705||{});_w[mesh.position.x<0?'home':'away']={vz:+(mesh._vz||0).toFixed(1),z:+mesh.position.z.toFixed(1)};}catch(_e){}}/* [7.705 strumentazione] velocita' residua del portiere: se dopo il tuffo _vz resta carica, il nuoto e' inerzia dell'integratore */
        /* IL CAMPO È UN VINCOLO. Col vecchio lerp la velocità decadeva da sola avvicinandosi al bersaglio, quindi
           nessuno usciva mai; con l'accelerazione limitata un giocatore lanciato ha bisogno di spazio per frenare
           e può SBORDARE oltre la linea (65 casi rilevati dal gate). Ora il bordo campo ferma il giocatore e
           azzera la sola componente di velocità che spinge fuori: si arriva alla linea e ci si ferma, come in campo. */
        if(mesh.position.x<-49.2){mesh.position.x=-49.2;if(mesh._vx<0)mesh._vx=0;}
        else if(mesh.position.x>49.2){mesh.position.x=49.2;if(mesh._vx>0)mesh._vx=0;}
        if(mesh.position.z<-33.6){mesh.position.z=-33.6;if(mesh._vz<0)mesh._vz=0;}
        else if(mesh.position.z>33.6){mesh.position.z=33.6;if(mesh._vz>0)mesh._vz=0;}
      }
      if(mesh._glbDriven)return;// 1.0b: in modalità GLB il mesh procedurale è nascosto → aggiorna SOLO la posizione (gli arti li anima il GLB); risparmia CPU
      // velocità reale smussata (evita jitter di cadenza frame-to-frame)
      const rawSp=Math.hypot(mesh.position.x-mesh._px,mesh.position.z-mesh._pz)/Math.max(dt,0.001);
      mesh._px=mesh.position.x;mesh._pz=mesh.position.z;
      mesh._sp+=(rawSp-mesh._sp)*Math.min(dt*8,1);const sp=mesh._sp;
      // facing: verso il movimento se in corsa, altrimenti verso la palla
      /* [7.635.0 — IL PORTIERE NON DA' MAI LE SPALLE AL CAMPO. Rosso __CPM_NO635]
         Collaudo PO su 7.633: «il portiere gira nella sua area». MISURATO (girogk3, 100s di cronaca):
         7 giri COMPLETI di imbardata cumulati, netto -827° sull'ospite, con 36-45u di camminate dentro
         un riquadro di 9u — il gk fa la spola nel suo box e QUESTA riga gli girava il corpo verso la
         direzione di marcia a ogni passetto: ogni ritorno un dietrofront. La regola giusta esiste gia'
         per il GLB (7.166: il portiere guarda SEMPRE la palla): qui vale anche per il procedurale —
         lo spostamento resta nelle gambe, il petto resta al campo. */
      let ta;
      if(d>0.5&&(!mesh._isGk||(typeof window!=='undefined'&&window.__CPM_NO635)))ta=Math.atan2(dx,dz);
      else if(bx!==undefined){const fx=bx-mesh.position.x,fz=bz-mesh.position.z;if(Math.hypot(fx,fz)>0.6)ta=Math.atan2(fx,fz);}
      let _rotApplied=0;
      /* [7.611.0] il lucchetto dell'acrobazia: se un gesto ha appena dichiarato di possedere l'imbardata
         (entro 300 ms), il facing di corsa NON la tocca. E' il rimedio al ping-pong misurato col testimone
         sulla proprieta' — 22 scritture del gesto contro 21 di questa riga, alternate una a una. */
      const _lock611=!(typeof window!=='undefined'&&window.__CPM_NO611)&&mesh._yawLock611&&((typeof performance!=='undefined'?performance.now():0)-mesh._yawLock611)<300;
      if(ta!==undefined&&!_lock611){const da=((ta-mesh.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;_rotApplied=da*Math.min((d>0.5?6:3)*dt,1);mesh.rotation.y+=_rotApplied;}// item 5 (5.49.1): rotazioni più MORBIDE (turn-rate 9→6) → niente giravolte innaturali
      // 3D-H2: torso lag — busto segue direzione con ritardo, inerzia corporea
      if(mesh._torso){mesh._tRot=(mesh._tRot||0)*(1-Math.min(dt*4.5,0.95))-_rotApplied*0.5;mesh._torso.rotation.y=clamp(mesh._tRot,-0.45,0.45);}
      // 3D-LOCO (Sprint B): crossfade continuo corsa↔idle — niente soglia dura (via "T-pose glide"
      //   sotto 0.4u né snap sopra). _runB fa easing accel/decel → partenza/arrivo morbidi (settle-into-idle).
      const _runTgt=clamp((sp-0.12)/0.7,0,1);// 0=fermo, 1=corsa piena
      mesh._runB=(mesh._runB==null?_runTgt:mesh._runB+(_runTgt-mesh._runB)*Math.min(dt*7,1));
      const rb=mesh._runB;
      mesh._ph+=Math.max(sp,0)*dt*2.6;// la fase avanza con la velocità reale
      mesh._idle=(mesh._idle||0)+dt*1.5;
      const s=Math.sin(mesh._ph);
      const amp=Math.min(sp*0.11,0.72)*rb,armAmp=Math.min(sp*0.13,0.85)*rb;// QW-D: braccia indipendenti
      mesh._lL.rotation.x=s*amp;mesh._lR.rotation.x=-s*amp;
      mesh._aL.rotation.x=-s*armAmp;mesh._aR.rotation.x=s*armAmp;
      mesh._aL.rotation.z=(-0.12+s*0.06)*rb;mesh._aR.rotation.z=(0.12-s*0.06)*rb;
      // bob verticale: corsa (|sin|·vel) ⟷ micro-bob idle, mixati su rb
      const _bobRun=Math.abs(s)*Math.min(sp*0.024,0.18),_bobIdle=Math.sin(mesh._idle*0.8)*0.018+0.008;
      mesh.position.y=_bobRun*rb+_bobIdle*(1-rb);
      // lean in avanti proporzionale alla corsa (svanisce da fermo); sway idle quando rb→0
      const _lean=(sp>3.5?0.15:sp>1.5?0.06:0.02)*rb;// QW-5/3DV-3: lean graduato
      mesh.rotation.x+=(_lean-mesh.rotation.x)*Math.min(dt*4,1);
      mesh.rotation.z=Math.sin(mesh._idle)*0.048*(1-rb);// QW-E: idle sway → 0 in corsa
      if(mesh._hd)mesh._hd.rotation.x=Math.sin(mesh._idle*1.2)*0.04*(1-rb);
      // [7.153.0 collaudo PO «il portiere non è in posizione di guardia, sembra prenda il caffè al bar»] READY STANCE
      //   del portiere quando è FERMO in porta (gr=1-rb: piena da fermo, svanisce quando shuffla/corre; durante un
      //   TUFFO animOne è saltato del tutto, 10222, quindi zero conflitto): gambe divaricate + busto avanti + braccia
      //   larghe e in avanti (pronte a tuffarsi) + molleggio sugli avampiedi e leggero shuffle laterale di guardia.
      if(mesh._isGk){const gr=1-rb;const _rd=mesh._idle*3.0;const _mix=(cur,tgt)=>cur*(1-gr)+tgt*gr;
        mesh._lL.rotation.z=_mix(mesh._lL.rotation.z||0,-0.20);mesh._lR.rotation.z=_mix(mesh._lR.rotation.z||0,0.20);// piedi larghi
        mesh._lL.rotation.x=_mix(mesh._lL.rotation.x||0,-0.10);mesh._lR.rotation.x=_mix(mesh._lR.rotation.x||0,-0.10);// gambe leggermente caricate
        mesh._aL.rotation.z=_mix(mesh._aL.rotation.z||0,0.85);mesh._aR.rotation.z=_mix(mesh._aR.rotation.z||0,-0.85);// braccia LARGHE ai lati (mani pronte al tuffo)
        mesh._aL.rotation.x=_mix(mesh._aL.rotation.x||0,-0.32);mesh._aR.rotation.x=_mix(mesh._aR.rotation.x||0,-0.32);// mani un filo avanti (non ciondolanti)
        mesh.rotation.x+=(0.10*gr);// busto leggermente avanti (peso sugli avampiedi)
        mesh.position.y+=(Math.abs(Math.sin(_rd))*0.025-0.04)*gr;// molleggio + baricentro basso
        mesh.rotation.z=mesh.rotation.z*(1-gr)+Math.sin(mesh._idle*1.7)*0.05*gr;// shuffle laterale di guardia
        if(mesh._hd)mesh._hd.rotation.x=_mix(mesh._hd.rotation.x||0,0.08);// testa sulla palla
      }
    };
    // F1 (5.17.0) — FOOTBALL STATE osservatore: stato continuo della partita derivato dalle
    //   posizioni REALI dei 22 (palla, possessore, baricentro/ampiezza/profondità per squadra),
    //   aggiornato nel render-loop ma CONSUMATO DA NESSUNO (inerte). È la sorgente di verità della
    //   direttiva simulation-first: i sistemi futuri (AI off-ball, camera, traiettorie) leggeranno
    //   QUI invece della timeline. Throttle (1 ogni 6 frame) + try/catch → zero rischio per il
    //   rendering: un errore non rompe il loop e NESSUN frame cambia (niente lo legge per disegnare).
    const _w2gx=wx=>+(wx+50).toFixed(1), _w2gy=wz=>+(wz/0.68+50).toFixed(1);
    let _fsN=0;
    const updateFootballState=()=>{
      try{
        const all=(propsRef.current&&propsRef.current.allPlayers)||[];
        const acc={home:{sx:0,sy:0,xs:[],ys:[],n:0},away:{sx:0,sy:0,xs:[],ys:[],n:0}};
        const bx=_w2gx(ball.position.x),by=_w2gy(ball.position.z); let held=null,bd=1e9; let _nbH=0,_nbA=0;
        const consider=(gx,gy,team,role,gk)=>{
          const d=Math.hypot(gx-bx,gy-by); if(d<bd){bd=d;held={team:team||null,role:role||null,gk:!!gk,dist:+d.toFixed(1)};}
          if((team==='home'||team==='away')&&!gk){const a=acc[team];a.sx+=gx;a.sy+=gy;a.xs.push(gx);a.ys.push(gy);a.n++;
            if(d<18){if(team==='home')_nbH++;else _nbA++;}}// superiorità numerica entro 18u dalla palla
        };
        for(let i=0;i<players.length;i++){const s=all[i]||{};const m=players[i].mesh||players[i];consider(_w2gx(m.position.x),_w2gy(m.position.z),s.team,s.role,s.gk);}
        consider(_w2gx(hero.position.x),_w2gy(hero.position.z),'home','hero',false);
        const sp=v=>v.length?+(Math.max(...v)-Math.min(...v)).toFixed(1):0;
        const shape=t=>{const a=acc[t];return a.n?{n:a.n,cx:+(a.sx/a.n).toFixed(1),cy:+(a.sy/a.n).toFixed(1),width:sp(a.ys),depth:sp(a.xs)}:null;};
        // attackingHome: possesso AFFIDABILE dalla palla LOGICA (propsRef.ballX, deterministica/seedata) —
        //   il possessor mesh-geometrico è rumoroso nel setup (palla-mesh non sempre sull'azione). F2 usa questo.
        const _pr=propsRef.current||{}; const _lbx=(_pr.ballX!=null)?_pr.ballX:bx;
        sr.current.football={t:performance.now(),phase:_pr.matchPhase||null,
          ball:{x:bx,y:by,worldY:+ball.position.y.toFixed(2)},possessor:held,attackingHome:_lbx>50,
          nearBall:{home:_nbH,away:_nbA},superiority:_nbH-_nbA,// §2: superiorità numerica vicino alla palla
          home:shape('home'),away:shape('away')};
      }catch(e){/* inerte: un errore non deve MAI rompere il render-loop */}
    };
    /* [7.344.0] il testimone e il registro delle scene seguono l'interruttore del taccuino, non il flag di
       build (7.342.0 aveva corretto solo il tasto e la card). Letto UNA volta qui: `devToolsOn()` legge
       localStorage e non puo' stare dentro un loop a 60 fps. */
    const _DEVT344=(typeof devToolsOn==="function")?devToolsOn():false;
    const loop=()=>{
      sr.current.raf=requestAnimationFrame(loop);
      /* ⚠️ [7.696.0 — STRUMENTO PROVATO E REVOCATO CON LA MISURA CONTRARIA, PRIMA DI SPEDIRLO]
         Avevo messo qui un flag per far avanzare il tempo di scena di 1/60 per fotogramma, convinto che
         il laboratorio non potesse vedere il codice 007 perche' gira a 7 fps (era la mia nota del 7.598).
         Due misure appaiate, dieci scene ciascuna, hanno smentito TUTT'E DUE le mie convinzioni: nel
         regime STORICO il difetto si vede eccome — 1 scena su 7, 15,9 inversioni/s, con la stessa firma
         che il PO riporta dal telefono (lerp 60% + vista-reale 36%) — e nel regime «telefono» NON si
         vede piu': zero su sette. Il detector conta le inversioni per secondo REALE, non per secondo di
         scena: rallentare il tempo di scena abbassa il numero invece di alzarlo. Flag revocato — uno
         strumento che non fa cio' che il suo commento dichiara e' peggio di nessuno strumento. Resta il
         guadagno vero del giro: il laboratorio PUO' misurare il codice 007, e il fondo si prende nel
         regime storico. */
      const now=performance.now();const _rdt=Math.min((now-last)/1000,0.05);last=now;const dt=(typeof window!=='undefined'&&window.__CPM_FROZEN)?0:_rdt;
      /* [7.536.0] IL TEMPO DI SCENA, ESPOSTO (solo collaudo). Le sonde misuravano finestre di OROLOGIO:
         headless, sotto la contesa di CPU di una passata piena, in un secondo d'orologio la scena vive
         una frazione di quello che vive a macchina scarica — e una misura di reattivita' («il difensore
         arriva sul portatore?») diventa cosi' funzione del carico invece che del gioco (misurato sulla
         stessa build: minDist 21,0/22,5 scarico contro 25,4/26,9 sotto carico). Questo contatore e' la
         grandezza fisica giusta a cui ancorarle: secondi di GIOCO davvero trascorsi. */
      if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_SCENET=(window.__CPM_SCENET||0)+dt;}catch(_e536){}}// VISUAL-TEST: dt=0 → anim/lerp congelati per screenshot golden deterministico
      updateFootballState();// F2: aggiornato OGNI frame → i consumatori (off-ball AI) leggono uno stato deterministico e fresco
      /* [7.339.0 direttiva PO «alla pressione del pulsante di warning il gioco deve essere anche in grado di
         ABBOZZARE gli appunti del bug rispetto a quello che ha visto realtime nel live match»] TESTIMONE
         DELL'AZIONE. Un anello preallocato (nessuna allocazione per frame → nessuna pressione sul GC, gira
         anche sul telefono) registra gli ultimi ~8 secondi del pallone e del suo inseguitore più vicino;
         quando il PO preme ⚠️, `__CPM_WATCH_SNAP()` restituisce la traccia e il gioco ne ricava DA SOLO le
         anomalie da scrivere nell'appunto. Sola osservazione: non tocca nulla della simulazione. */
      if(typeof window!=='undefined'&&_DEVT344){try{
        /* [7.340.0 direttiva PO «io farei prendere appunti per tutta la durata del live match e non solo degli
           ultimi 8 secondi»] Il testimone copre ora l'INTERA partita. Memoria limitata per costruzione: quando
           l'anello si riempie DIMEZZA la risoluzione (tiene un campione su due) e raddoppia il tempo coperto —
           30.000 campioni = ~8 min a 60fps, poi ~17 min a 30Hz, poi ~33 min a 15Hz. Nessuna azione va perduta:
           si perde solo dettaglio sui minuti più vecchi, e le anomalie che cerchiamo vivono su scale ≥0,2s. */
        const W=sr.current._wd||(sr.current._wd={n:0,i:0,cap:30000,step:1,skip:0,full:false,buf:new Float32Array(30000*17)});
        if(W.buf.length<W.cap*17){W.buf=new Float32Array(W.cap*17);W.n=0;W.i=0;W.full=false;}/* [7.526.0] 15->16: +SCRITTORE DELLO SGUARDO (ultima passata camera del fotogramma + conteggio) — la nota PO «SGUARDO oscilla 31,7 inv/s amp 8,9°» e' un flip per-frame: solo l'attribuzione sul dispositivo puo' nominare la coppia di passate che si alterna (headless cieco per Nyquist a 7fps) *//* [7.524.0] anello 14→15 float: +CODICE SCRITTORE del pallone (_ws524) — la bozza dice CHI ha mosso la palla nel fotogramma incriminato *//* [7.408.0] anello 11→14 float: +ASSE DI SGUARDO (camLook). Le bozze del PO su scene «traballa» NON mostravano la riga-camera del 7.404: la POSIZIONE e' calma sotto soglia — il tremolio vive altrove, e il primo indiziato e' l'asse ottico, che i richiami 7.225/7.237 ruotano ogni fotogramma. */
        const _pw=propsRef.current||{};
        let _mdN=99,_mdX=0;/* compagno di movimento più vicino alla palla (esclusi portieri): dice se «chi doveva arrivarci» è arrivato */
        try{((sr.current&&sr.current.players)||[]).forEach((pp,ii)=>{const src=(_pw.allPlayers||[])[ii];
          if(!src||src.gk||src.team!=='home'||!pp.mesh||pp.mesh===hero)return;
          const d=Math.hypot(pp.mesh.position.x-ball.position.x,pp.mesh.position.z-ball.position.z);
          if(d<_mdN){_mdN=d;_mdX=pp.mesh.position.x;}});}catch(_e){}
        /* [7.352.0] IL TESTIMONE NON PUO' FERMARE LA PARTITA. Qui siamo nel corpo di `loop` (la funzione del
           render-loop), non in una callback: il `return` che saltava la registrazione a risoluzione ridotta
           saltava con se' TUTTO IL RESTO DEL FRAME — animazioni, moto del pallone, AI off-ball, camera e la
           render() finale. Effetto: passati ~8 minuti di partita l'anello si riempie, `step` diventa 2 e il
           gioco gira a META' dei fotogrammi; al dimezzamento dopo, a un quarto. E siccome dal 7.344 gli
           strumenti sono ACCESI di default (e sul telefono, per direttiva), lo pagava esattamente chi
           collauda. Ora a risoluzione ridotta si salta la SOLA scrittura: il frame prosegue sempre.
           Misurato con l'anello forzato pieno: spazio percorso dal pallone in 1,2s uguale a prima
           (rapporto 1,04) — prima di questa riga il gioco andava al rallentatore. */
        /* [7.360.0 misurato, e il numero e' arrivato dal collaudo del PO] IL TESTIMONE PERDEVA RISOLUZIONE
           A OGNI RIEMPIMENTO. Quando l'anello si riempiva veniva DIMEZZATO e `step` raddoppiava: da li' in poi
           un fotogramma su 2, poi su 4, su 8, su 16. Misurato su quattro scene consecutive, l'intervallo
           mediano fra due campioni passava da 102ms a 209, 416 e 543ms — cioe' dopo qualche minuto di partita
           «in un fotogramma» voleva dire «in mezzo secondo». Ed e' esattamente da li' che nasceva il «SALTO
           del pallone di 8,7 unita'» che il PO si e' ritrovato in QUATTRO note diverse sempre con lo stesso
           numero: il criterio e' `d/dt>85 u/s` e a ~100ms di intervallo qualunque tiro sopra quella soglia
           riporta d≈8,7. Il numero costante su scene senza rapporto fra loro era la SOGLIA moltiplicata per
           l'intervallo, non il pallone. Ora l'anello e' CIRCOLARE: sovrascrive il campione piu' vecchio e
           tiene sempre l'ultimo tratto di partita a risoluzione PIENA (un campione per fotogramma). Si perde
           la coda lontana, che a un taccuino non serve; si guadagna che «fotogramma» torni a voler dire
           fotogramma. `step`/`skip` restano a 1 per compatibilita' con chi li legge. */
        {
        if(W.n>=W.cap){W.i=W.i%W.cap;W.full=true;}
        const o=W.i*17;/* [7.680.0] 16->17: +LA QUOTA Z DELL'EROE. Senza, la bozza del PO poteva misurare la lontananza dell'eroe dal pallone solo come differenza di X — un asse, non una distanza — mentre il compagno la misurava con hypot: due metri diversi confrontati con la stessa soglia di 3,5. */
        W.buf[o]=now;W.buf[o+1]=ball.position.x;W.buf[o+2]=ball.position.y;W.buf[o+3]=ball.position.z;
        W.buf[o+4]=hero.position.x;W.buf[o+5]=_mdN>90?-1:_mdN;W.buf[o+16]=hero.position.z;
        W.buf[o+6]=(ballArcActive?1:0)+(hlPostArcType?2:0)+(tlOn?4:0)+(/^hl/.test(_pw.matchPhase||'')?8:0)+(((now-Math.max(_CUT471.at,(sr.current._cutAt471||-1e9)))<Math.max(300,_CUT471.dur||0))?16:0);/* [7.528.0] bit 16: MASCHERA DI TAGLIO ATTIVA (stessa finestra del mask BJ478). Le note PO su 7.526/7.527 portavano «CAMERA salta 10,7-23,5u (400-782 u/s) a 3,7s dall'inizio scena» IDENTICO su scene e partite diverse: era il TAGLIO DI REGIA VOLUTO sull'esito (setCutFx, coperto dallo stacco nero) — la grazia della bozza copriva gli stacchi di scena ma non i tagli mascherati a meta' scena. *//* [7.420.0] bit 8: SONO NELLA SCENA (fase hl). La chiave sk resta invariata anche DOPO l'esito, fino all'highlight successivo: senza questo bit la finestra della bozza sconfinava nella cronaca BG — e un gol vero del BG diventava «l'esito dichiarato e' recovery ma la palla e' finita IN RETE» (tre bozze false dal dispositivo, gi168×2/gi105: force-path pulito su sei repliche). Quarta bozza falsa della famiglia 7.360/7.361/7.364, stessa lezione: lo strumento sbaglia prima del codice. */
        W.buf[o+7]=(_pw.hlSitKey!=null?+_pw.hlSitKey:-1);/* [7.339.0] chiave di SCENA: al cambio scena la palla viene riposizionata di proposito — non e' un teletrasporto (lezione del Live Validator 6.3.1, dove questa trappola marcava meta' degli highlight come FAIL) */
        W.buf[o+8]=camera.position.x;W.buf[o+9]=camera.position.y;W.buf[o+10]=camera.position.z;/* [7.404.0 collaudo PO «traballa» ×6 in un lotto, su tre release] LA CAMERA ENTRA NEL TESTIMONE. Sei strumenti in headless non hanno mai riprodotto il tremolio: vive solo a 60fps sul dispositivo del PO. Invece di un settimo strumento cieco, si porta la misura DOV'E' il fenomeno: la bozza automatica ora conta inversioni e passi della camera nella scena segnalata. */
        W.buf[o+11]=camLook.x;W.buf[o+12]=camLook.y;W.buf[o+13]=camLook.z;/* [7.408.0] e l'asse di sguardo */
        {const _tl530=sr.current._tocc503;let _c530=0;
         if(_tl530&&_tl530.length){const _M530={porta:1,guinzaglio:2,gk:3,'bordo-tanh':4,'bordo-lift':5,bisezione:6,snap:7,'sguardo-pre':8,'vista-reale':9};
           _c530=Math.min(9,_tl530.length)*10+(_M530[_tl530[_tl530.length-1]]||0);}
         W.buf[o+15]=_c530;/* [7.526.0] passate camera del fotogramma PRECEDENTE (la lista si azzera piu' sotto, r.~16330: qui e' completa): conteggio*10+codice dell'ultima — l'alternanza di codici a frame alterni e' la firma del doppio scrittore */}
        W.buf[o+14]=sr.current._ws524||0;/* [7.524.0] lo scrittore del pallone di questo campione (il reset sta DOPO questa scrittura nel loop: il codice qui accanto e' esattamente chi ha prodotto la posizione registrata) */
        W.i++;if(W.n<W.cap)W.n++;else W.i=W.i%W.cap;
        }
        /* [7.352.0] sonda di collaudo: riempie l'anello per provare che il frame prosegue lo stesso (solo test) */
        if((_CPM_TEST||_SIT_TEST)&&!window.__CPM_WD_FILL)window.__CPM_WD_FILL=(st)=>{try{const w=sr.current._wd;if(!w)return null;w.n=w.cap;w.i=w.cap;if(st)w.step=st;return{n:w.n,step:w.step};}catch(_e){return null;}};
        if(!window.__CPM_WATCH_SNAP)window.__CPM_WATCH_SNAP=()=>{try{
          const w=sr.current._wd;if(!w||!w.n)return null;const out=[];
          /* [7.360.0] con l'anello circolare il campione piu' vecchio sta in `w.i`, non in 0: senza questo
             giro la traccia tornava spezzata a meta' e il taccuino leggeva un salto temporale all'indietro. */
          const _st=w.full?w.i%w.cap:0;
          for(let _k=0;_k<w.n;_k++){const k=(_st+_k)%w.cap;const q=k*17;
            out.push({t:w.buf[q],x:w.buf[q+1],y:w.buf[q+2],z:w.buf[q+3],hx:w.buf[q+4],md:w.buf[q+5],f:w.buf[q+6],sk:w.buf[q+7],cx:w.buf[q+8],cy:w.buf[q+9],cz:w.buf[q+10],lx:w.buf[q+11],ly:w.buf[q+12],lz:w.buf[q+13],ws:w.buf[q+14],wl:w.buf[q+15],hz:w.buf[q+16]});}
          return{samples:out,goalX:GOAL_LINE_X,homeX:-GOAL_LINE_X,now:performance.now(),span:out.length?+((out[out.length-1].t-out[0].t)/1000).toFixed(1):0,res:w.step};}catch(_e){return null;}};
      }catch(_e){}}
      /* [6.3.0 R0/LMQP-10] RECORDER per-frame del Live Match Validator (test-only, spento nella build store):
         con window.__CPM_REC attivo cattura {t,fase,clock,palla,eroe,22} in un ring-buffer → metriche cinematiche live. */
      if(typeof window!=='undefined'&&window.__CPM_REC&&!window.__CPM_STORE_BUILD){try{
        const _rb=window.__CPM_REC_BUF||(window.__CPM_REC_BUF=[]);
        const _p0=propsRef.current||{};
        _rb.push({t:Math.round(now),ph:_p0.matchPhase||null,ck:_p0.matchClock==null?null:_p0.matchClock,
          b:[+ball.position.x.toFixed(2),+ball.position.z.toFixed(2),+ball.position.y.toFixed(2)],pa:hlPostArcType||null,/* [7.215.0] fase del POST-ARCO nel frame registrato: senza questo, un difetto di traiettoria dopo la conclusione (la palla che rientra dopo essere entrata) non e attribuibile a nessun ramo */
          arc:ballArcActive?1:0,at:ballArcActive?+(ballArcT||0).toFixed(2):null,ad:ballArcActive?+(ballArcDur||0).toFixed(2):null,tl:tlOn?1:0,tk:(sr.current._tlK381||null),hd:(sr.current._tlHD387?1:0),tc:(sr.current._tlC381?[+sr.current._tlC381.position.x.toFixed(2),+sr.current._tlC381.position.z.toFixed(2)]:null),sk:_p0.hlSitKey!=null?_p0.hlSitKey:null,/* [7.227.0 #45 strumentazione] stato di ARCO ed EXECUTOR nel frame: senza, «l'arco non è mai partito», «l'arco è partito ma qualcosa sovrascrive la y» e «il build-up non è mai finito» sono indistinguibili · [7.229.0 #47] +chiave di scena: uno snap che scatta A METÀ AZIONE si vede solo da qui */
          h:[+hero.position.x.toFixed(2),+hero.position.z.toFixed(2)],ht410:(sr.current._tlHT410||null),
          /* [7.236.0 strumentazione permanente] trappola sui SALTI del mesh eroe (>6u tra due frame): tagga
             la transizione con lo stato concorrente (executor/arco/gesto) → un «compare e scompare» futuro è
             attribuibile al suo scrittore dal primo run. Solo sotto __CPM_REC (test-only, mai in store). */
          ...(function(){try{const _pp51=window.__CPM_DBG51P;const _cx=hero.position.x,_cz=hero.position.z;
            if(_pp51&&Math.hypot(_cx-_pp51[0],_cz-_pp51[1])>6){(window.__CPM_DBG51=window.__CPM_DBG51||[]).push({t:Math.round(now),from:[+_pp51[0].toFixed(1),+_pp51[1].toFixed(1)],to:[+_cx.toFixed(1),+_cz.toFixed(1)],pa:hlPostArcType||null,tl:tlOn?1:0,arc:ballArcActive?1:0,at:actType||null,aT:+(actT||0).toFixed(2),hp:heroPostType||null,ls:sr.current._lastSitKey,se:subEntryT,mfx:!!sr.current._mateFx});}
            window.__CPM_DBG51P=[_cx,_cz];
            window.__CPM_ARC={pa:hlPostArcType||null,pt:+(hlPostArcT||0).toFixed(2),arc:ballArcActive?[+ballArcTgtX.toFixed(1),+ballArcTgtZ.toFixed(1),+(ballArcT||0).toFixed(2),+(ballArcDur||0).toFixed(2)]:null,tl:tlOn?1:0,ok:oppActType||null,ek:(propsRef.current&&propsRef.current.hlOutcomeKind)||null,ht:(propsRef.current&&propsRef.current.hlType)||null};/* [7.249.0 strumentazione permanente, solo __CPM_REC] stato per-frame di post-arco/arco/gesto avversario: attribuisce OGNI volo del pallone al suo scrittore */}catch(_e){}return {};})(),
          /* [7.224.0 strumentazione] posizioni LOGICHE (matchPlayers) accanto a quelle dei MESH: senza il
             confronto fra i due strati non si distingue «la logica non piazza gli attori» da «il renderer
             non segue la logica» — ed è esattamente l'ambiguità che ha fatto fallire il primo tentativo. */
          lp:(_p0.allPlayers||[]).map(q=>q?[+(+q.x).toFixed(1),+(+q.y).toFixed(1)]:null),
          ht:[_p0.playerX==null?null:+(+_p0.playerX).toFixed(1),_p0.playerY==null?null:+(+_p0.playerY).toFixed(1)],
          p:players.map(pp=>{const m=pp.mesh||pp;return [+m.position.x.toFixed(1),+m.position.z.toFixed(1)];})});
        if(_rb.length>2600)_rb.splice(0,_rb.length-2600);
      }catch(_e){}}
      const P=propsRef.current,all=P.allPlayers||[],k=Math.min(1,dt*6.5);
      /* [7.209.0] il gesto del compagno che conclude dura poco e si spegne da solo (one-shot) */
      /* [7.673.0 — collaudo PO: «il corpo del marcatore non e' in direzione della porta!» (SIT #169,
         assist per il compagno in area). Il gesto di conclusione del compagno esiste dal 7.209 — chi
         finalizza chiede la sua clip di calcio nell'istante del tocco — ma NESSUNO LO GIRA: la clip
         parte sul corpo com'era orientato, cioe' come stava correndo, e da fuori il tiro parte di
         spalle o di fianco alla porta. All'eroe questo trattamento c'e' gia' (7.611b lo orienta prima
         del gesto); al compagno mancava, ed e' la stessa asimmetria della volee' chiusa nel 7.672:
         curato l'attore principale, dimenticate le comparse — che pero' sono quelle che segnano meta'
         dei gol. Qui chi conclude verso la porta avversaria viene girato verso di essa un istante
         prima del gesto; chi difende o rinvia no. __CPM_NO673 = rosso. */
      const _versoPorta673=(m673,nome673)=>{try{
        if(!m673||(typeof window!=='undefined'&&window.__CPM_NO673))return;
        if(nome673!=='kick'&&nome673!=='header'&&nome673!=='volley')return;
        const _gx673=(m673.position.x<0&&nome673==='kick'&&false)?HOME_GOAL_X:AWAY_GOAL_X;
        m673.rotation.y=Math.atan2(_gx673-m673.position.x,0-m673.position.z);
        if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{(window.__CPM_FACE673=window.__CPM_FACE673||[]).push({g:nome673,x:+m673.position.x.toFixed(1),ry:+m673.rotation.y.toFixed(2)});}catch(_e){}}
      }catch(_e673){}};
      if(sr.current._mateFx){sr.current._mateFx.t-=dt;if(sr.current._mateFx.t<=0)sr.current._mateFx=null;}/* ⚠️ `dt` e non `aDt`: qui aDt non è ancora dichiarato (TDZ) */
      // Sprint 3D-8a: slow-motion sull'esito — bullet-time sul tiro (0.28x) poi ritorno a 1x in ~1.6s.
      // Solo le animazioni rallentano (aDt/ak); la camera resta in tempo reale → movimento fluido.
      const isResult=P.matchPhase==="hl_result";
      const isHL=isResult||P.matchPhase==="hl_move"||P.matchPhase==="hl_choose"||P.matchPhase==="hl_intro";
      /* [7.460.0 «esito dichiarato ≠ 3D»] IL RALLENTATORE APPARTIENE ALLA CONCLUSIONE, NON ALLA COSTRUZIONE.
         `slow` parte da 0.28 al primo fotogramma di hl_result e risale a 1 in 1,6s: il rallentatore e'
         nato per l'ESITO, ma cadeva anche sul BUILD-UP, che in hl_result gira prima. Misurato sul flusso
         vero (goal-postarc-test): finestra d'esito 3,54s reali, e dentro quella finestra la costruzione
         non arrivava in fondo — `tlT` fermo a 1,321 su 1,77 pianificati, 38 fotogrammi su 39 spesi a
         costruire, e `fireConclusion` MAI CHIAMATA: nessun arco, nessun post-arco, pallone abbandonato a
         x 11 mentre il tabellone contava il gol. Ora la costruzione gira a velocita' piena e il
         rallentatore parte quando parte la conclusione — cioe' dove il montaggio lo voleva. Palla e
         attori restano sullo STESSO clock (entrambi `aDt`): il disaccoppiamento eroe/pallone che il
         7.236 ha gia' pagato non si ripresenta. Sotto `?cpmtest=1` l'executor cine e' spento
         (`_cineTest`) → `tlOn` e' sempre false → questa riga e' bit-identica a prima: gate invariato. */
      const _no460=(typeof window!=='undefined'&&!!window.__CPM_NO460);/* [7.460.0] interruttore test-only che RIPRISTINA il comportamento rotto (rallentatore sulla costruzione + contesto letto all'atterraggio): e' la prova del rosso del guardiano goal-postarc, non un ripiego di produzione */
      if(isResult&&(_no460||!tlOn))resultT+=dt;else if(!isResult)resultT=0;
      const slow=isResult?((tlOn&&!_no460)?1:(0.28+0.72*Math.min(resultT/1.6,1))):1;
      const aDt=dt*slow,ak=Math.min(1,aDt*6.5);
      /* [7.461.0] LA DICHIARAZIONE DELLA SCENA, statement ISOLATO fuori da ogni catena if/else (la trappola
         del registratore infilato davanti a un `else if` e' gia' stata pagata nel 7.457). Il renderer non
         chiede nulla e non decide nulla: dice soltanto se build-up, arco o post-arco sono ancora vivi. Chi
         chiude la scena legge questo invece di indovinare dal cronometro quanto ci vuole. */
      /* [7.573.0 — IL PALLONE DEVE ARRIVARE IN RETE PRIMA CHE SI RIPARTA DAL CENTRO]
         Il giudice della cronaca, ora stabile, ha isolato la famiglia peggiore rimasta: sui GOL di cronaca
         la riga dichiara la porta (98,50) e il pallone si vede a 27 unita' dalla linea — 44 unita' di
         scarto, e lo stesso minuto su partite diverse (deterministico).
         Due ipotesi mie, ENTRAMBE SMENTITE guardando il codice invece del sintomo: non e' il tetto di
         spostamento per riga (il blocco che lo applica e' gia' esente sulle righe con esito — «i GOL
         restano esenti», 7.498) e non e' un bersaglio sbagliato (il bersaglio E' la porta).
         La causa e' quella che il 7.525 aveva gia' scritto e non chiuso: la mesh, quando il gol si scrive,
         sta 40-53 unita' indietro e viaggia al massimo a 34 u/s — le servono ~1,3 s, e il conto della
         ripartenza gliene concede 1,5 con qualunque rallentamento a mangiarseli. Alzare quel conto sarebbe
         un rattoppo su una costante: il numero giusto dipende da quanto e' lontana la mesh, che cambia ogni
         volta.
         Il meccanismo per farlo bene esiste gia' ed e' del 7.461: il renderer DICHIARA se ha ancora
         qualcosa da mostrare e la simulazione aspetta. Qui si aggiunge un motivo a quella dichiarazione —
         «il pallone e' in volo verso la rete» — cosi' la ripartenza dal centro non parte finche' il gol
         non si e' visto. E' la stessa precedenza che il PO aveva gia' stabilito: e' la SCENA ad avere la
         precedenza. __CPM_NO573 = rosso. */
      let _rete573=false;
      if(!(typeof window!=='undefined'&&window.__CPM_NO573)&&P.matchPhase==='playing'&&ball&&!isHL){
        const _tgx=(P.ballX==null?50:P.ballX);
        if(_tgx>=95||_tgx<=5){const _gx=G2X(_tgx>=95?98.6:1.4);
          if(Math.abs(ball.position.x-_gx)>3.2)_rete573=true;}
      }
      if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST)&&_rete573){try{const _w=(window.__CPM_RETE573=window.__CPM_RETE573||{f:0});_w.f++;}catch(_e){}}
      if(P.cineBusy){try{P.cineBusy.current={on:isResult,tl:!!tlOn,arc:!!ballArcActive,pa:hlPostArcT>=0,rete:_rete573};}catch(_e461){}}
      /* [7.457.0 — MISURA, «esito dichiarato ≠ 3D»] PERCHE' IL BUILD-UP E' ANCORA VIVO? Il post-arco
         che porta la palla in rete aspetta la fine del build-up (guardia 5.43.9, r.~12542). Le prove
         del PO dicono «arco/post-arco vivi 30 · 17 · 118 · 144 fotogrammi» con la palla ferma: qui si
         traccia, per fotogramma d'esito, se il build-up e' ACCESO, a che punto e' (`tlT`), quanti
         segmenti ha e dove sta la palla — cosi' un build-up LUNGO MA SANO (tlT che avanza) si
         distingue da uno FERMO che non finira' mai (tlT che non si muove). Statement isolato, fuori
         da ogni catena if/else: la prima stesura si era infilata davanti a un `else if` e ne avrebbe
         dirottato il ramo. */
      if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&isResult){/* [7.458.0] TUTTA la finestra d'esito, non i soli fotogrammi col post-arco gia' vivo: per sapere se il build-up e' piu' lungo del post-arco serve vedere anche i fotogrammi in cui il build-up gira e il post-arco non e' ancora nato */
        try{const _pc457=(window.__CPM_PA457=window.__CPM_PA457||[]);
          if(_pc457.length<900)_pc457.push({tlOn:!!tlOn,tlT:+(+tlT).toFixed(3),bn:tlBuildN,
            pa:+(+hlPostArcT).toFixed(3),pt:hlPostArcType||null,
            bx:+ball.position.x.toFixed(2),bz:+ball.position.z.toFixed(2),adt:+(+aDt).toFixed(4),t:+performance.now().toFixed(0),rt:+(+resultT).toFixed(2),
            /* [7.459.0] il CONTESTO della conclusione: il post-arco viene assegnato solo quando l'arco
               del tiro FINISCE, e il ramo del gol pretende hlType shot/penalty/freekick/header. Se su
               un gol dichiarato il post-arco non nasce, la risposta e' in questi campi: o l'arco non
               e' mai partito/finito (`arc`), o il tipo non passa da nessun ramo. */
            ht:P.hlType||null,rew:P.hlReward||null,kind:P.hlOutcomeKind||null,def:!!P.hlDef,
            hs:P.hlSuccess,arc:!!ballArcActive});}catch(_e457){}}
      // palla per prima, così i giocatori fermi si orientano verso di essa
      /* [7.218.0 revisione PO «non si capisce assolutamente che e un dribbling»] LO STACCO DI SCENA VALE ANCHE
         PER IL PALLONE. Dal 7.194.0 all'avvio di un highlight i 22 giocatori SNAPPANO in posizione (uno stacco di
         regia, non una corsa); il pallone no — restava dov'era e ci arrivava scivolando. Misurato su un dribbling
         forzato: la scena si apriva col pallone a CENTROCAMPO e l'eroe a 26 unita di distanza, e per tutta l'azione
         la palla viaggiava verso di lui senza mai raggiungerlo. Cosi nessuna giocata tecnica e leggibile: non e il
         dribbling a essere fatto male, e che il pallone non e mai stato ai piedi di chi dribbla. Ora lo stacco
         porta anche la palla dove l'azione comincia, alla quota giusta (a terra o per aria). */
      /* memo PROPRIO del blocco palla: il flag armato dal blocco giocatori arriverebbe un frame dopo, e a quel
         punto l'arco della conclusione puo essere gia partito (lo snap verrebbe saltato). Qui la chiave di scena
         si legge PRIMA di qualunque lancio d'arco, che avviene piu avanti nel frame. */
      /* [7.478.0 codice «salto del pallone»] TESTIMONE DELLA SORGENTE, non della dimensione. Il censimento
         del 7.477 misurava QUANTO salta il pallone e attribuiva il salto all'apertura di scena; ma la sua
         finestra tiene i campioni di UNA sola chiave-scena, e l'apertura e' proprio la transizione fra due
         chiavi: quella riga non poteva vederla. Qui si apre un varco per fotogramma — posizione all'inizio
         del frame e un'etichetta scritta da chi riassegna il pallone di colpo — e si legge a fine frame,
         accanto allo stacco nero. La domanda «chi lo fa» ha una risposta sola, e non e' una deduzione. */
      sr.current._ws524=0;/* [7.524.0 — strumento, pattern 7.404: la misura DOV'E' il fenomeno] codice dello SCRITTORE del pallone in questo fotogramma (0=nessuno): scalare sempre attivo, entra nell'anello del testimone cosi' la bozza del PO puo' dire CHI ha mosso la palla nel fotogramma incriminato — `_bj0` (la firma ricca) e' armata solo nei test e sul telefono non c'e' */
      if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST))sr.current._bj0={x:ball.position.x,z:ball.position.z,src:null,srcs:[]};else sr.current._bj0=null;
      if(P.hlSitKey!=null&&P.hlSitKey>=0&&sr.current._lastBallKey!==P.hlSitKey){sr.current._lastBallKey=P.hlSitKey;sr.current._ballSnap=true;}
      if(sr.current._ballSnap&&isHL){sr.current._ballSnap=false;
        ballArcActive=false;hlPostArcT=-1;hlPostArcType=null;sr.current._netOk535=false;/* [7.530.0] scena nuova = certificato-rete azzerato *//* [7.227.0 #45] un arco/post-arco ancora vivo QUI è della scena PRECEDENTE (lo snap si arma solo al cambio di chiave-scena): il wizard salta hl_intro — dove il 7.42.1 annullava gli archi — e il volo residuo bloccava lo snap e attraversava la scena nuova (misurato: frame d'apertura a y 3.3 in volo) */
        sr.current._preStrike=true;/* [7.220.0] nuova scena: il colpo deve ancora arrivare */
        const _sy=aerialContactY(P,isHL,isResult,true);
        /* [7.400.0 — INDAGINE APERTA, due tentativi REVOCATI] «SALTO del pallone di 35,9u — sembra un
           teletrasporto» + «ad inizio scena traballa tutto» (gi168/gi132, difensive). Misurato: la palla
           parte dal punto dello snap e STRISCIA 30-38 unita' rasoterra in ~200 ms in piena intro. Revocati
           perche' la misura non si e' mossa di un millimetro: (1) ri-piazzarla sul punto dichiarato durante
           l'intro — combatteva l'inseguitore, stroboscopio da 7u misurato col contatore in pagina; (2) farla
           nascere sul logico del portatore avversario — identica, perche' la causa sta A MONTE: al taglio
           TUTTO il teatro viene piazzato sui props del commit vecchio, e lo staging fresco (continuita' +
           stageSitPositions) arriva il commit DOPO, ~30 unita' piu' in la' — e' l'intera scena che trasla,
           non il pallone. Il fix vero e' ri-armare lo snap dei ventidue E della palla sul commit di staging:
           in coda con questa nota. */
        ball.position.x=G2X(P.ballX==null?50:P.ballX);ball.position.z=G2Z(P.ballY==null?50:P.ballY);ball.position.y=(_sy!=null?_sy:0.65);if((sr.current._ws524=1)&&sr.current._bj0)(sr.current._bj0.src='scena',sr.current._bj0.srcs.push('scena'));}
      const obx=ball.position.x,oby=ball.position.y,obz=ball.position.z;
      // ATE-2: durante arco BG usa destinazione 3D esatta + velocità sync con durata arco
      // 3DV-10: skip lerp x/z durante post-arco (deflect/cross_goal/in_net gestiscono x/z propri)
      // FIX boomerang: durante l'esito, una volta esaurito l'arco/post-arco la palla NON deve essere
      //   richiamata verso ballPos (agganciato all'eroe) → resta dove l'azione l'ha lasciata (in rete, fuori, dal compagno).
      // FIX coerenza tackle: in un HL DIFENSIVO la palla sta sull'AVVERSARIO portatore (agganciato UNA volta
      //   all'inizio dell'HL → stabile, niente switch). Basta "l'eroe ha la palla ma deve contrastare".
      if(isHL&&!isResult&&P.hlType==="tackle"){
        if(!_tackleCarrier){let _nd=1e9;const _a2=P.allPlayers||[];sr.current.players.forEach((pp,ii)=>{const s=_a2[ii];if(s&&s.team==='away'&&!s.gk){const d=Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z);if(d<_nd){_nd=d;_tackleCarrier=pp.mesh;}}});}
      } else _tackleCarrier=null;
      // [6.8.0 R3 slice 2] TIRO/TESTA/RIGORE/PUNIZIONE = palla COLPITA: durante l'arco d'esito la x/z punta
      //   DIRETTAMENTE al bersaglio dell'arco (ballArcTgt, lo stesso che valida il gate) con rate SINCRONIZZATO
      //   sulla durata dell'arco — come già fa l'arco BG. Prima seguiva ballPos (2D) che a sua volta insegue
      //   ballTargetRef → DOPPIO smoothing = palla lenta/impressa (non fluida, non precisa). Ora il pallone
      //   colpito vola pulito e PRECISO dove è mirato, in fase con la parabola. Cross/pass/dribble/build restano
      //   sul path ballPos (hanno riceventi/gestioni proprie).
      const _struckArc=ballArcActive&&isResult&&!ballArcIsBG&&!_tackleCarrier&&(P.hlType==="shot"||P.hlType==="header"||P.hlType==="penalty"||P.hlType==="freekick");
      if(typeof window!=='undefined'&&window.__CPM_REC&&hlPostArcType==="assist_recv"){try{window.__CPM_AR51={pat:+(+hlPostArcT).toFixed(2),tl:tlOn?1:0,arc:ballArcActive?1:0,ptm:!!passTargetMesh,gate1:!hlPostArcType&&!(isResult&&!ballArcActive)};}catch(_e){}}/* [7.240.0 strumentazione permanente, solo __CPM_REC] stato del GATE della catena post-arco su assist_recv — ha smascherato il falso «congelamento» (campione stantio) della prima diagnosi */
      if(!hlPostArcType&&!(isResult&&!ballArcActive)){const _useTgt=(ballArcActive&&ballArcIsBG)||_struckArc;
       if(_useTgt&&ballArcT<=0){_arcSrcX=ball.position.x;_arcSrcZ=ball.position.z;if((_CPM_TEST||_SIT_TEST))sr.current._arcSrc382={x:+ball.position.x.toFixed(1),z:+ball.position.z.toFixed(1)};/* [7.382.0] il punto di PARTENZA dell'arco sopravvive alla fine del volo (test-only): `_arcSrcX` viene azzerato all'arrivo, e il dispatch — che si scrive proprio li' — non poteva piu' dire da dove il pallone fosse partito. Senza questo, «il lancio in profondita' e' orizzontale» si misura dall'eroe-MESH, che al momento del lancio puo' essere gia' altrove, e si finisce per giudicare la direzione sbagliata. */}// [6.74.0 3D-6] cattura la partenza al lancio dell'arco (durante il wind-up 3D-8 resta agganciata al piede)
       const _btX=_tackleCarrier?_tackleCarrier.position.x:(_useTgt?ballArcTgtX:G2X(P.ballX||50));
       const _btZ=_tackleCarrier?_tackleCarrier.position.z:(_useTgt?ballArcTgtZ:G2Z(P.ballY||50));
       if(_useTgt&&_arcSrcX!=null){// [6.74.0 3D-6] moto orizzontale UNIFORME su u (in fase con y=sin(u·π)): prima il lerp
         //   esponenziale copriva l'84% della distanza già all'apice e arrivava sul target al ~3% della velocità iniziale
         //   ("frenata a paracadute" su tiri/punizioni lunghe) lasciando pure un gap residuo di 0.3-0.8u a fine arco.
         const _au=Math.min(Math.max(ballArcT,0)/Math.max(ballArcDur,0.001),1);
         ball.position.x=_arcSrcX+(_btX-_arcSrcX)*_au;ball.position.z=_arcSrcZ+(_btZ-_arcSrcZ)*_au;if((sr.current._ws524=2)&&sr.current._bj0){sr.current._bj0.src='arco';sr.current._bj0.srcs.push('arco');}/* [7.497.0 F2] */
         /* [7.231.0 #41 collaudo PO «non si capisce che è un tiro a giro» (gi17)] IL GIRO GIRA. La x/z era
            un'interpolazione RETTILINEA sorgente→bersaglio: «a giro» ed «esterno» volavano dritti come una
            bordata, la tecnica esisteva solo nel testo. Ora le famiglie a effetto (shot_curled, punizione a
            giro) hanno una PANCIA laterale perpendicolare alla corda — sin(u·π), massima a metà volo, ZERO
            all'arrivo per costruzione (il bersaglio validato dal gate non si sposta di un millimetro) — che
            spancia verso l'ESTERNO della porta e rientra: la traiettoria a banana del calcio vero. Fuori
            dall'arcBlock analitico (guida solo la mesh, come tutto questo blocco). */
         if(isResult&&!_tackleCarrier&&(P.hlType==="shot"||P.hlType==="freekick")&&(P.hlVariant==="shot_curled"||P.hlVariant==="freekick_direct")&&_au>0){/* ⚠️ non gated su _struckArc: al lancio ballArcIsBG viene marcato true anche per gli archi HL (r.10668) e _struckArc chiede !IsBG → sarebbe sempre falso qui */
           const _cdx=_btX-_arcSrcX,_cdz=_btZ-_arcSrcZ,_cl41=Math.hypot(_cdx,_cdz)||1;
           const _px41=-_cdz/_cl41,_pz41=_cdx/_cl41;/* perpendicolare orizzontale alla corda */
           const _mid41=(_arcSrcZ+_btZ)*0.5;const _sgn41=(_mid41*_pz41>=0)?1:-1;/* pancia verso l'ESTERNO (via dal centro porta) */
           const _amp41=Math.min(2.6,_cl41*0.14)*_sgn41*Math.sin(_au*Math.PI);
           ball.position.x+=_px41*_amp41;ball.position.z+=_pz41*_amp41;
         }}
       else{
        if(_useTgt||_tackleCarrier){
          const _bak=_tackleCarrier?Math.min(1,aDt*10):Math.min(1,aDt*(3.5/Math.max(ballArcDur,0.2)));
          ball.position.x+=(_btX-ball.position.x)*_bak;ball.position.z+=(_btZ-ball.position.z)*_bak;
          if((sr.current._ws524=15)&&sr.current._bj0)(sr.current._bj0.src='avvicinamento',sr.current._bj0.srcs.push('avvicinamento'));/* [7.555.0 P0] questo lerp era l'UNICO scrittore senza nome: il censimento per fase lo vedeva come «anonimo» sull'11,5% dei fotogrammi di hl_result (11 su 96). Non e' un bug di moto, e' un buco di anagrafe: ora la firma copre anche l'avvicinamento al bersaglio dell'esito. */
        } else {
          /* [7.194.0 S1] LA PALLA VIAGGIA A VELOCITÀ REALE. Fuori dall'arco il pallone inseguiva la posizione
             logica con un lerp esponenziale (ak≈dt·6.5): copre l'86% in mezzo secondo sulle distanze corte, ma su
             una consegna lunga (cross dalla fascia, rinvio del portiere, verticalizzazione) diventa un CREEP —
             la palla «striscia» verso la meta e può arrivare quando l'azione è già finita (il Live Match Validator
             lo ha misurato: gol con il pallone ancora a 10u dalla porta). Ora è un moto a VELOCITÀ LIMITATA, come
             un passaggio vero: parte deciso, rallenta in arrivo, e il tempo di percorrenza dipende dalla distanza. */
          const _dx=_btX-ball.position.x,_dz=_btZ-ball.position.z,_dd=Math.hypot(_dx,_dz);
          /* [7.515.0 R2/4 — ARBITRO LEGGERO INSEGUITORE/COLLA: audit «62 scrittori, vince l'ultimo»] La firma
             F2 ha scoperchiato 605 fotogrammi/3 partite in cui l'inseguitore muoveva la palla e la COLLA della
             conduzione (7.323, r.~12868) la ricollocava DALLO STESSO fotogramma: lavoro buttato e doppio
             padrone. Qui si valuta PRIMA, sulla stessa posizione che vedrebbe la colla, se la colla scrivera'
             (conduzione vera: eroe in moto, palla vicina e dietro il passo minimo): se si', l'inseguitore CEDE
             il fotogramma — equivalenza visiva esatta (la colla scrive posizioni ASSOLUTE), conflitto a zero
             per costruzione. __CPM_NO515 = rosso (doppia scrittura di prima). */
          let _colla515=false,_porGlue526=false;
          if(typeof window!=='undefined')window.__CPM_COLLA=0;
          {const _pr6=sr.current._por526;
           if(_pr6&&_pr6.mesh&&_pr6.mesh!==hero&&!ballArcActive&&P.matchPhase==='playing'&&!(typeof window!=='undefined'&&window.__CPM_NO526)){
             const _pm6=_pr6.mesh;const _db6=Math.hypot(ball.position.x-_pm6.position.x,ball.position.z-_pm6.position.z);
             const _dl6=Math.hypot(_pm6.position.x-_btX,_pm6.position.z-_btZ);
             /* [taratura 5 — LA RICEZIONE NON SI SFILA] La traccia per-campione ha mostrato il ciclo:
                convergenza (3,8->0,6u in 4,5s), 3s incollato, poi la palla SCAPPA — la riga di cronaca
                manda il logico in zona mentre l'arco e' atterrato sul ricevente, e l'inseguitore la
                trascinava via dai piedi. Il glue ora tiene fino a 25u di scarto dal logico: la coppia
                portatore+palla CAMMINA insieme verso il punto (conduzione), il logico resta il driver
                del testo e la coppia lo raggiunge a 7-9u/s. */
             if(_db6<3.2&&_dl6<25)_porGlue526=true;/* [7.523.0] il portatore NON-eroe ha raggiunto la palla e sta presso il logico: la palla e' sua */}}
          if(hero&&!P.hlDef&&!P.hlSetPiece&&!(typeof window!=='undefined'&&window.__CPM_NO515)){
            const _cvx5=hero._hvx||0,_cvz5=hero._hvz||0;const _csp5=Math.hypot(_cvx5,_cvz5);
            if(_csp5>0.6){const _cbx5=ball.position.x-hero.position.x,_cbz5=ball.position.z-hero.position.z;
              if(Math.hypot(_cbx5,_cbz5)<3.2&&(_cbx5*(_cvx5/_csp5)+_cbz5*(_cvz5/_csp5))<0.28){_colla515=true;if(typeof window!=='undefined')window.__CPM_COLLA=1;}}}
          /* [7.555.0 P1 — IL PADRONE DEL PALLONE E' UNO SOLO, E SI ELEGGE PRIMA DI SCRIVERE]
             Il censimento per fase (sonda scrittori-555, 1908 fotogrammi) ha smentito la stima «77% di
             scritture anonime»: gli scrittori senza nome sono lo 0,8%. Il difetto vero e' un altro ed e'
             STRUTTURALE: tre rami indipendenti (inseguitore/portatore/addosso) decidevano ciascuno per conto
             proprio, e su 18 fotogrammi DUE scrivevano lo stesso pallone — portatore+addosso x11 (la colla
             dell'eroe sovrascriveva il compagno che il 7.523 aveva dichiarato portatore) e inseguitore+addosso
             x7 (l'addosso valutava il pallone GIA' spostato dall'inseguitore, quindi su un fotogramma non era
             una correzione ma una seconda scrittura). I gate del 7.515/7.523 erano rattoppi: prevedevano cosa
             avrebbe fatto il ramo successivo invece di decidere una volta. Qui l'elezione e' UNA e a monte —
             il compagno dichiarato portatore batte tutti, poi l'eroe in conduzione, poi nessuno (e allora
             comanda l'inseguitore). I tre rami diventano esclusivi PER COSTRUZIONE, non per previsione.
             __CPM_NO555 = rosso: rimette i tre gate indipendenti di prima. */
          /* [7.559.0 — QUANDO IL GIOCO E' FERMO, IL PALLONE STA SUL PUNTO E BASTA]
             Il guardiano ha misurato 0 fermi su 9 interruzioni armate: fermare il bersaglio LOGICO non
             bastava, perche' nel 3D il pallone ha altri padroni — il portatore designato la tiene ai piedi
             e cammina (`_carry526`), e la palla cammina con lui. L'elezione unica del 7.555 e' esattamente
             il posto giusto per dirlo: c'e' un padrone che batte tutti, e si chiama FERMO. */
          const _fm559=(P.fermo&&P.fermo.current)||null;
          if(_fm559&&!(typeof window!=='undefined'&&window.__CPM_NO559)){
            /* [7.609.0 — IL FERMO E IL RIPOSO DEVONO ESSERE D'ACCORDO SU DOV'E' TERRA. Rosso __CPM_NO609]
               COLLAUDO PO: «sembra che il portatore di palla spesso palleggi». MISURATO (palleggio-609 +
               istogramma delle quote): col pallone ai piedi di qualcuno l'altezza sta a 0,65 nell'86% dei
               campioni e a ~0,25 nell'11%, con 15 inversioni in 90 s — le transizioni al punto di
               inversione sono 0,65<->0,27, avanti e indietro. DUE AUTORITA' in disaccordo su dov'e' terra:
               questo scrittore del fermo diceva 0,11 (mezzo pallone SOTTOTERRA: il raggio e' 0,32) e il
               riposo dice 0,65 — quando i due si alternano il pallone molleggia, ed e' il palleggio.
               La quota del fermo diventa quella del riposo: stessa convenzione, un'autorita' sola.
               (Che la convenzione 0,65 faccia levitare un pallone di raggio 0,32 e' un altro discorso,
               storico e ovunque: non si tocca qui di passaggio.) */
            /* [7.670.0 — IL PALLONE NON SI TELETRASPORTA AL PIAZZATO. Rosso __CPM_NO670B.
               COLLAUDO PO, tre volte: «SALTO del pallone di 49 unita' in 26 ms, sembra un teletrasporto».
               Il censimento (ball-jump-census) ha nominato l'autore: dei 31 salti di una partita,
               QUATTORDICI sono scoperti — cioe' li vede il giocatore, non li copre nessun taglio — e
               vengono tutti da qui, da 6,3 a 30,4 unita'. La riga assegnava la posizione del pallone
               fermo in un fotogramma: logicamente giusto (una rimessa E' un ricollocamento), visivamente
               un salto. E adesso che in telecronaca si vede SOLO il pallone (7.665), quel salto e'
               l'unica cosa che si muove — quindi e' anche l'unico errore che si nota.
               Ora il pallone ci ARRIVA: sotto le due unita' si assegna come prima, sopra si percorre la
               distanza a velocita' alta ma finita (55 u/s: mezzo secondo per trenta unita'), che e' il
               tempo che ci mette un giocatore a portare la palla sulla bandierina. La posizione LOGICA
               resta quella del piazzato: cambia solo cio' che si vede, quindi nessuna macchina e nessun
               metro logico si muove. */
            {const _tx670=G2X(_fm559.x),_tz670=G2Z(_fm559.y);
             const _dx670=_tx670-ball.position.x,_dz670=_tz670-ball.position.z;
             const _dd670=Math.hypot(_dx670,_dz670);
             const _no670b=(typeof window!=='undefined'&&window.__CPM_NO670B);
             if(_no670b||_dd670<=2||dt<=0){ball.position.x=_tx670;ball.position.z=_tz670;}
             else{const _pas670=Math.min(_dd670,55*dt);
               ball.position.x+=_dx670/_dd670*_pas670;ball.position.z+=_dz670/_dd670*_pas670;}}
            ball.position.y=(typeof window!=='undefined'&&window.__CPM_NO609)?0.11:0.65;
            sr.current._pad555='fermo';
            if((sr.current._ws524=17)&&sr.current._bj0){sr.current._bj0.src='fermo';sr.current._bj0.srcs.push('fermo');}
          } else {
          const _no555=(typeof window!=='undefined'&&window.__CPM_NO555);
          const _pad555=_no555?null:(_porGlue526?'portatore':(_colla515?'eroe':'nessuno'));
          sr.current._pad555=_pad555;/* il padrone eletto resta leggibile a valle (cronaca, volo, sonde) */
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST))window.__CPM_PAD555=_pad555;
          /* ⚠️ [7.617.0 — SPRINT A2] PROVATO E REVOCATO CON LE SUE DUE MISURE, una per meta': domare
             l'inseguitore accoppiandolo al portatore eletto. (1) divieto di ALLONTANARE la palla dal
             portatore in corsa: «palla entro 3u del portatore» 51% -> 53%, PIATTO — appena il corpo
             rientrava sotto 2,2u la palla ripartiva a 34 u/s e il ciclo attacca/stacca ricominciava.
             (2) tetto a passo d'uomo (9,5 u/s) sulla palla condotta: 43% -> 33%, PEGGIO DI DIECI PUNTI —
             perche' l'ELEZIONE sceglie il portatore piu' vicino al punto LOGICO, non alla palla-mesh:
             rallentando la mesh ho allargato la forbice mesh<->logico che l'elezione ignora, e il
             portatore eletto stava avanti col logico mentre la palla arrancava dietro. LEZIONE DOPPIA:
             (a) il difetto e' nell'ANAGRAFE del possesso (elezione ancorata al logico, handoff solo a
             fine arco, niente elezione nelle fasi HL) — non nel trasporto, che e' solo il sintomo;
             (b) il metro stesso (__CPM_POR526 acc) balla di +-10 punti fra run a codice identico (il
             tick logico ha Math.random dichiarato): prima del redesign serve un metro che regga.
             Il rimedio vero e' il punto A2 completo della ricetta d'audit, non una taratura qui. */
          if((_no555?(!_colla515&&!_porGlue526):(_pad555==='nessuno'))&&_dd>0.02){const _step=Math.min(_dd,Math.min(_dd*5.2+2.2,34)*aDt);ball.position.x+=_dx/_dd*_step;ball.position.z+=_dz/_dd*_step;if((sr.current._ws524=3)&&sr.current._bj0)(sr.current._bj0.src='inseguitore',sr.current._bj0.srcs.push('inseguitore'));}

          if(_no555?_porGlue526:(_pad555==='portatore')){const _pm6=sr.current._por526.mesh;
            const _vx6=_pm6._pvx526||0,_vz6=_pm6._pvz526||0;const _sp6=Math.hypot(_vx6,_vz6);
            let _ux6=1,_uz6=0;
            if(_sp6>0.3){_ux6=_vx6/_sp6;_uz6=_vz6/_sp6;}
            else{const _ddx6=_btX-_pm6.position.x,_ddz6=_btZ-_pm6.position.z;const _dl6b=Math.hypot(_ddx6,_ddz6)||1;_ux6=_ddx6/_dl6b;_uz6=_ddz6/_dl6b;}
            ball.position.x=_pm6.position.x+_ux6*0.9;ball.position.z=_pm6.position.z+_uz6*0.9;
            if((sr.current._ws524=4)&&sr.current._bj0){sr.current._bj0.src='portatore';sr.current._bj0.srcs.push('portatore');}}
          /* [7.323.0 direttiva PO «il pallone rimane indietro / viene trascinato»] IN CONDUZIONE LA PALLA NON
             STA MAI DIETRO IL CORPO IN MARCIA. Qui il pallone insegue il bersaglio LOGICO mentre il corpo
             visibile ha la sua dinamica (animOne): due catene di ritardo diverse, e a ogni passo il pallone
             restava transitoriamente alle spalle dell'eroe (misurato: fino a -0.56u sulla marcia laterale,
             7% dei frame in conduzione). Stesso rimedio gia' collaudato sull'intro (7.32.5): proiezione della
             palla sulla direzione di marcia REALE del corpo (velocita' del modello fisico, non la logica) e
             clamp a un passo minimo davanti, conservando la componente laterale (il tocco di esterno resta).
             Solo in conduzione vera: palla vicina, eroe in moto, niente set-piece/difensivo/arco/esito. */
          if(hero&&!P.hlDef&&!P.hlSetPiece&&(_no555||_pad555==='eroe')){
            const _hvx3=hero._hvx||0,_hvz3=hero._hvz||0;const _hsp3=Math.hypot(_hvx3,_hvz3);
            const _bdx3=ball.position.x-hero.position.x,_bdz3=ball.position.z-hero.position.z;
            if(_hsp3>0.6&&Math.hypot(_bdx3,_bdz3)<3.2){
              const _ux3=_hvx3/_hsp3,_uz3=_hvz3/_hsp3;
              const _pj3=_bdx3*_ux3+_bdz3*_uz3;
              if(_pj3<0.28){
                const _lc3=clamp(_bdx3*(-_uz3)+_bdz3*(_ux3),-1.1,1.1);
                if((sr.current._ws524=5)&&sr.current._bj0){sr.current._bj0.src='addosso';sr.current._bj0.srcs.push('addosso');}/* [7.497.0 F2] la palla incollata all'eroe e' uno scrittore come gli altri */
                ball.position.x=hero.position.x+_ux3*0.28+(-_uz3)*_lc3;
                ball.position.z=hero.position.z+_uz3*0.28+(_ux3)*_lc3;
              }
            }
          }
          }
        }}}
      // Sprint 3D-BALL: parabola sull'esito — arco in base al tipo di azione
      if(ballArcActive)sr.current._preStrike=false;/* [7.220.0] il pallone è partito: da qui in poi comanda l'arco, e a fine azione torna a terra */
      /* [7.530.0 — LO SPECCHIO OBBEDISCE ALL'ESITO, lato gol subito (rosso __CPM_NO535). Nota PO W.26 #45:
         «esito goal_against ma la palla non e' mai arrivata in porta (ferma a 50,2u)»; sonda inrete-529 su
         gi45: bersaglio gx1,5 = mondo -48,5, 0,1u PRIMA del piano pali (-48,6) — il lerp muore asintotico a
         ~-47,3 e uno scrittore anonimo trascina poi la palla fuori specchio (z 2,2→5,6). Il canale «in rete»
         esisteva solo per la porta avversaria (5.65.0 isolava l'HL difensivo dalla macchina gol — ma il gol
         subito E' un gol). L'aggancio vive a FINE ARCO (ramo hlDef del blocco di completamento): una rete di
         sicurezza pre-arco e' stata provata e RIMOSSA — partiva all'inizio del result, PRIMA del tiro, e
         rompeva la sequenza (sonda: palla trascinata a x -18 invece del viaggio tiro→rete); il caso PO
         «ferma a 50,2» aveva comunque un arco vivo 153 fotogrammi, quindi il fine-arco lo copre. */
      /* [7.530.0 NO535 — l'altro verso della stessa regola] Nota PO ricorrente 003: «esito chance/nothing ma la
         palla e' finita IN RETE» (#150/#31/#39 sponda W.25). La revoca 7.477 insegna a NON ritoccare la mappa
         analitica: qui c'e' solo un guardiano GEOMETRICO di ultima istanza — la palla puo' abitare lo specchio
         (oltre la linea, |z|<3,66) SOLO mentre un canale-rete la certifica (in_net/in_net_high/in_net_own,
         flag _netOk535); senza certificato scivola oltre il palo (z ±4,5 = fuori di poco, letto come «di lato»). */
      if(isResult&&!(typeof window!=='undefined'&&window.__CPM_NO535)&&!ballArcActive&&hlPostArcType==null&&!sr.current._netOk535){
        if(Math.abs(ball.position.z)<3.66&&(ball.position.x>GOAL_LINE_X+0.05||ball.position.x<-(GOAL_LINE_X+0.05))){
          const _zs535=(ball.position.z>=0?4.5:-4.5);ball.position.z+=(_zs535-ball.position.z)*Math.min(aDt*6,1);
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&sr.current._netLog546!==P.hlSitKey+"|guard"){sr.current._netLog546=P.hlSitKey+"|guard";try{const _n5=(window.__CPM_NET546=window.__CPM_NET546||[]);if(_n5.length<60)_n5.push({ch:"guard_expel",ht:P.hlType||null,rew:P.hlReward||null,ok:P.hlOutcomeKind||null,cert:0});}catch(_e){}}/* [7.533.0 MP-0e] il guardiano che ESPELLE si conta: e' la riprova che un certificato negato lavora */}}
      if(ballArcActive){const _preT74=ballArcT;
        /* [7.214.0] finché non c'è impatto (ballArcT≤0 = wind-up) la quota di partenza segue il pallone: al
           momento del colpo l'arco parte DA LÌ invece di far ricomparire la palla sull'erba. Su palla a terra
           la quota è 0.65 e il termine si annulla → traiettoria bit-identica a prima. */
        if(_preT74<=0)ballArcY0=ball.position.y;
        ballArcT+=aDt;
        if(_preT74<0&&ballArcT>=0)contactFlashT=0;// [6.74.0 3D-8] flash all'IMPATTO reale (fine wind-up), non al frame 0
        const u=Math.min(Math.max(ballArcT,0)/ballArcDur,1);
        /* [7.534.0 MP-1] LA PANCIA HA UN PROFILO: «tesa» = sin^0.7 (spalle larghe, il tiro sale presto e
           viaggia piatto), «campana» = sin(u^0.72·π) (apice anticipato a u~0,38, discesa lunga del
           pallonetto), null = seno 7.213. Vale 0 agli estremi in tutti i profili: contatto e arrivo NON
           cambiano di un millimetro — cambia solo il viaggio. Rosso __CPM_NO547 (via gestoDi → prof base). */
        const _belly547=ballArcProf==='tesa'?Math.pow(Math.sin(u*Math.PI),0.7):ballArcProf==='campana'?Math.sin(Math.pow(u,0.72)*Math.PI):Math.sin(u*Math.PI);
        ball.position.y=0.65+_belly547*ballArcH+(ballArcY0-0.65)*(1-u)+(ballArcTgtY-0.65)*u;/* [7.215.0] la corda va dalla quota di CONTATTO a quella d'ARRIVO; il profilo e' il rigonfiamento sopra la corda */
        // [6.74.0 3D-5] il compagno designato ATTACCA il cross correndo sul punto di caduta (prima restava fermo)
        if(isResult&&!P.hlDef&&P.hlType==="cross"&&crossRcvMesh){crossRcvMesh.position.x+=((ballArcTgtX-1.8)-crossRcvMesh.position.x)*Math.min(aDt*3.4,1);crossRcvMesh.position.z+=(ballArcTgtZ-crossRcvMesh.position.z)*Math.min(aDt*3.4,1);
          if(!(typeof window!=='undefined'&&window.__CPM_NO531)){const _tyc531=Math.atan2(48-crossRcvMesh.position.x,0-crossRcvMesh.position.z);let _dyc531=_tyc531-crossRcvMesh.rotation.y;while(_dyc531>Math.PI)_dyc531-=2*Math.PI;while(_dyc531<-Math.PI)_dyc531+=2*Math.PI;crossRcvMesh.rotation.y+=_dyc531*Math.min(1,aDt*9);}/* [7.527.0] anche chi attacca il cross incorna GUARDANDO la porta, non la propria corsa */}
        // [6.74.0 3D-7] il ricevente dell'IMBUCATA corre verso il punto dello scatto GIÀ DURANTE il volo della palla
        //   (prima restava congelato e poi la raggiungeva con un dash a 40-60 km/h in assist_recv)
        /* [7.205.0 direttiva PO «mai movimenti robotici»] IL RICEVENTE CORRE, NON SCIVOLA. Questo compagno era
           l'unico mosso da un lerp POSIZIONALE grezzo: saltava `animOne`, cioè il modello fisico (accelerazione
           e sterzata limitate, 7.198) E l'animazione degli arti — quindi attraversava il campo a gambe ferme,
           esattamente il difetto «T-pose glide» corretto per tutti gli altri nel 5.89. Ora passa dallo stesso
           motore del compagno che attacca la profondità sull'azione fallita (~11234), che lo usava già. */
        if(isResult&&!P.hlDef&&(P.hlType==="pass"||P.hlOneTwo===true)&&P.hlSuccess===true&&passTargetMesh&&passTargetMesh._runToX!=null){const _rz205=(passTargetMesh._runToZ!=null?passTargetMesh._runToZ:passTargetMesh.position.z);animOne(passTargetMesh,passTargetMesh._runToX,_rz205,aDt,ak,passTargetMesh._runToX,_rz205);}/* [7.415.0 gi180] anche il MURO dell'uno-due ha questo driver: le situations uno-due sono `build`/`shot` (7.348), quindi il cancello `pass` lo escludeva e la corsa post-tocco non aveva chi la portasse */
        const _early74=(isResult&&!P.hlDef&&P.hlType==="cross"&&P.hlSuccess===true&&u>=0.85);// [6.74.0 3D-5] sul cross-GOL il 2° tocco parte con la palla ancora in QUOTA (~metà discesa), niente atterraggio sul prato + "incornata da sola"
        if(u>=1||_early74){
          if(ballArcIsBG&&sr.current._rcv526&&!(typeof window!=='undefined'&&window.__CPM_NO526)){sr.current._por526={mesh:sr.current._rcv526,lato:sr.current._lato526||'home'};sr.current._rcv526=null;sr.current._att556=null;/* [7.556.0 P2] la palla e' arrivata: il passatore dichiarato non e' piu' il padrone */}/* [7.523.0] la ricezione: chi ha ricevuto e' il nuovo portatore */
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _ae=(window.__CPM_ARCEND457=window.__CPM_ARCEND457||[]);if(_ae.length<40)_ae.push({u:+(+u).toFixed(2),early:!!_early74,bg:!!ballArcIsBG,ht:P.hlType||null,hs:P.hlSuccess,def:!!P.hlDef,rew:P.hlReward||null,kind:P.hlOutcomeKind||null,ph:P.matchPhase||null,bx:+ball.position.x.toFixed(1),sk:(P.hlSitKey!=null?P.hlSitKey:null)});}catch(_e){}}/* [7.459.0] IL BLOCCO DI COMPLETAMENTO HA UN TESTIMONE: e' qui che nasce il post-arco, e su 4 gol su 6 il post-arco non nasce. Se questo marcatore non compare, l'arco e' stato ucciso prima; se compare e il post-arco resta nullo, e' la catena di rami a non prenderlo (i campi dicono quale). */ballArcActive=false;_arcSrcX=null;_arcSrcZ=null;// 3DV-9: trigger animazione fine azione in base all'esito
          if(isResult){const _cc460=_no460?null:sr.current._ccx460;const P=(_cc460&&(propsRef.current.hlType==null||propsRef.current.hlSuccess==null))?_cc460:propsRef.current;/* [7.460.0] SI LEGGE IL CONTESTO DICHIARATO AL LANCIO, non quello del fotogramma d'atterraggio — ma SOLO quando i props vivi hanno gia' perso la conclusione: sul percorso sano questa riga vale `propsRef.current` ed e' bit-identica a prima. */const _hs=P.hlSuccess,_ht=P.hlType,_hv=P.hlVariant;
            // [7.54.0 BL-15 · AC-049/050] l'ARCO D'ESITO è arrivato (impatto parata/palo/fuori/assestamento):
            //   segnala alla UI che il 3D ha MOSTRATO l'esito → reveal/cronaca dei NON-gol sincroni all'animazione
            //   (pattern onGoalInNet 5.43.4). Solo qui: i beat di build-up R5 muovono la palla analiticamente
            //   (tlOn, mai da arco) → questo è per costruzione l'arco della CONCLUSIONE o dell'esito difensivo.
            {const _oos=propsRef.current&&propsRef.current.onOutcomeShown;if(_oos)try{_oos();}catch(_e){}}
            // 5.65.0: un highlight DIFENSIVO è isolato dalla macchina del GOL/PARATA: la palla resta dove il
            //   post-guard difensivo (resolveDefensiveOutcome) l'ha piazzata — MAI in rete avversaria, MAI una
            //   parata sulla PROPRIA porta. Recupero riuscito → gesto di carica; fallito → nessun post-arco.
            if(P.hlDef){if(_hs===true){heroPostT=0;heroPostType="fist";}
              else if(P.hlDefTraj&&P.hlDefTraj.toOwnGoal&&!(typeof window!=='undefined'&&window.__CPM_NO535)){hlPostArcT=0;hlPostArcType="in_net_own";}}/* [7.530.0 NO535] il gol subito completa il viaggio: a fine arco la palla ENTRA nella nostra porta (canale in_net_own), non muore davanti ai pali */
            else if(_hs===true&&P.hlReward==="assist"&&(_ht==="shot"||_ht==="penalty"||_ht==="freekick"||_ht==="header")){
              // [7.1.2 AUDIT MASSIVO situations↔3D] AZIONE-CONCLUSIONE che vale ASSIST (tacco/appoggio/scarico, cross e
              //   «palla in area» su PUNIZIONE): la palla va CONSEGNATA a un compagno che finalizza, MAI in rete
              //   «dall'eroe». Chiude il cluster di 28 conclusioni che entravano in rete pur essendo un assist.
              /* ⚠️ [7.604.0 — INDAGINE APERTA, collaudo PO su SIT #51: «esito goal ma la palla si e'
                 fermata a 15,6 unita' dalla porta, e il portiere non si tuffa»] RIPRODOTTO in laboratorio
                 con l'esito forzato: arco fino a x 92, poi cross_goal -> deflect, pallone parcheggiato a
                 x 89 = 15,7 unita' dalla linea — il numero del PO alla cifra. Il deflect su «occasione» e'
                 il comportamento GIUSTO (occasione = mai rete, 5.78.0); il ramo sospetto e' questo qui
                 sotto, che manda in cross_goal OGNI punizione — anche una BORDATA DIRETTA con premio gol —
                 aspettandosi che un compagno la incorni: se il compagno non aggancia, il gol dichiarato non
                 si disegna mai e il portiere non ha nulla su cui tuffarsi. NON ancora corretto perche' il
                 ramo gol-vero non e' riproducibile con FORCE_OUTCOME (che forza il successo ma lascia il
                 kind a «chance»): serve o un seme che produca il gol naturale o un gancio sul kind. E' il
                 prossimo lavoro su questa riga. */
              if(_ht==="freekick"){hlPostArcT=0;hlPostArcType="cross_goal";}// punizione battuta in area (compagno incorna; chance→deflect)
              else{if(passTargetMesh){passTargetMesh._rcvT=0;passTargetMesh._runToX=Math.min(passTargetMesh.position.x+12,AWAY_GOAL_X-6);passTargetMesh._runToZ=passTargetMesh.position.z;/* [7.240.0 gi26 «Non si vede il compagno che riceve»] il puntatore RESTA (vedi sito gemello del pass): senza, il ricevente del tacco/scarico spariva dal driver dopo il gesto */}
                else{let _rdA712=1e9,_rmA712=null;const _hxA712=hero.position.x,_hzA712=hero.position.z;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==="home"&&!src.gk&&pp.mesh!==hero){const _fw=pp.mesh.position.x-_hxA712;if(_fw>-2){const _dh53=Math.hypot(_fw,pp.mesh.position.z-_hzA712);const _sc=_dh53-Math.max(0,_fw)*0.6+(_dh53<6?14:0);if(_sc<_rdA712){_rdA712=_sc;_rmA712=pp.mesh;}}}});if(_rmA712){_rmA712._rcvT=0;_rmA712._runToX=Math.min(_rmA712.position.x+12,AWAY_GOAL_X-6);_rmA712._runToZ=_rmA712.position.z;passTargetMesh=_rmA712;}}
                hlPostArcT=0;hlPostArcType="assist_recv";sr.current._arRcv=null;sr.current._arLandX=null;}}// tacco/appoggio/scarico a terra → compagno finalizza
            /* [7.477.0 — RIMEDIO PROVATO E REVOCATO, e la traccia resta perche' vale piu' del rimedio]
               Le note #150/#31 dicono «l'esito dichiarato e' CHANCE/RECOVERY ma la palla e' finita IN
               RETE», e qui il difetto si LEGGE: questi rami scelgono l'ingresso in rete guardando solo
               «azione RIUSCITA» (`_hs===true`) e il tipo di gesto — ma riuscita non vuol dire gol, e una
               «occasione creata» e' riuscita. E' l'errore che il brief di questa serie metteva nero su
               bianco: non contare mai `ok===true` come un gol.
               Ho provato a subordinare l'ingresso in rete al PREMIO DICHIARATO. Due misure hanno detto di
               no: (a) il guardiano `outcome-not-goal-test.mjs` su 17 azioni non-gol da' risultato IDENTICO
               con e senza il rimedio — inerte su questo campione; (b) il gate va ROSSO su `data-coherence`
               (11 issue), perche' la mappa analitica `cross→cross_goal` e' un invariante validato e il
               rimedio la cambiava. Un cambiamento di comportamento non dimostrato che costa un invariante
               non si spedisce: revocato. La strada giusta e' partire dal caso rosso rimasto (gi50) e
               capire da dove nasce, non ritoccare la mappa per farla combaciare con un'ipotesi. */
            else if(_hs===true&&(_ht==="shot"||_ht==="penalty"||_ht==="freekick"||_ht==="header")){
              hlPostArcT=0;hlOutcomeVariant="goal";
              // CINE-3: chip/volley entrano alti in rete
              hlPostArcType=(_hv==="shot_chip"||_hv==="shot_volley")?"in_net_high":"in_net";}
            else if(_hs===true&&_ht==="cross"){hlPostArcT=0;hlPostArcType="cross_goal";}
            /* [7.351.0 collaudo PO gi162 «Assist d'esterno piede»] IL PALLONE NON RESTA IN MEZZO AL CAMPO.
                 Questo ramo azzerava il ricevente su OGNI passaggio con esito «occasione», ma era scritto per
                 un caso solo: il «dai e vai», dove la palla deve tornare all'eroe perche' e' la CATENA a
                 concludere. Su un assist normale il risultato era un pallone abbandonato: misurato su gi162 —
                 arco corretto fino al ricevente (x 78.5), poi `post:null`, `rcv:null`, nessuno che lo
                 raccoglie e la scena che muore li'. Ora il ramo vale solo per l'uno-due dichiarato (che due
                 righe piu' sotto diventa comunque `onetwo_back`); ogni altra occasione segue la consegna
                 normale, dove il finale su «occasione» e' gia' governato da anni: `assist_shot` fa respingere
                 il tiro del compagno PRIMA della linea con tanto di tuffo del portiere (6.93.0) — quindi
                 l'occasione resta un'occasione e nessuna rete si gonfia senza gol. La guardia
                 `hlOutcomeKind!=="chance"` sul ramo del gol e' quella che lo garantisce: senza, un passaggio
                 con premio GOL ed esito occasione sarebbe caduto in `in_net`, cioe' il falso gol. */
              else if(_hs===true&&_ht==="pass"){
              if(P.hlOutcomeKind==="chance"&&P.hlOneTwo===true){heroPostT=0;heroPostType="fist";if(passTargetMesh){passTargetMesh._rcvT=0;passTargetMesh=null;}}// [7.8.10] combinazione «dai e vai» (pass+goal→chance): la palla RESTA all'eroe, la CATENA (ricevi e TIRA) segna → niente rete sul passaggio d'avvio
              else if(P.hlReward==="goal"&&P.hlOutcomeKind!=="chance"){hlPostArcT=0;hlOutcomeVariant="goal";hlPostArcType="in_net";}// [7.1.2 classe B] «dai, ricevi, TIRA»: reward GOAL ⇒ finalizza l'EROE, non il compagno
              else{hlPostArcT=0;hlPostArcType="assist_recv";sr.current._arRcv=null;sr.current._arLandX=null;if(passTargetMesh){passTargetMesh._rcvT=0;passTargetMesh._runToX=Math.min(passTargetMesh.position.x+12,AWAY_GOAL_X-6);passTargetMesh._runToZ=passTargetMesh.position.z;/* [7.240.0 gi25 «Non si vede il compagno che riceve e tira»] il puntatore RESTA: azzerarlo qui lasciava il driver di assist_recv senza ricevente dopo il gesto _rcvT (0.52s) → nessuno correva sulla palla e il tiro partiva da solo */}}}
            else if(_hs===true&&(_ht==="tackle"||_ht==="dribble"||_ht==="build"||!_ht)){
              // dribbling/costruzione che valgono un GOL → la palla deve entrare in rete (non solo il pugno)
              if((_ht==="dribble"||_ht==="build"||(_ht==="tackle"&&!P.hlDef))&&P.hlReward==="goal"){
                if(P.hlOutcomeKind==="chance"){heroPostT=0;heroPostType="fist";}// [5.90.0 BLK-2] uomo saltato: palla al piede, la conclusione arriva dalla chain (niente rete qui)
                else{hlPostArcT=0;hlOutcomeVariant="goal";hlPostArcType="in_net";}}// pressing/dribbling-gol → palla in rete (MAI in un highlight difensivo: P.hlDef)
              else if(P.hlOffBall&&_hs===true){
                /* [7.311.0 collaudo PO — stessa segnalazione] L'EROE E' IL RICEVENTE, NON IL PASSATORE.
                   Su una situation off-ball il reward «assist» sta sul TABELLONE (il tuo smarcamento avvia
                   l'azione), ma in campo il gesto e' una RICEZIONE. Il dispatch invece cadeva nel ramo
                   build+assist e faceva `assist_recv`: sceglieva un compagno piu' avanzato e gli mandava la
                   palla. Misurato su gi158: ricevente a game x~46 mentre l'eroe restava a x~15 — il pallone
                   passava a 4u da lui e proseguiva per 27u fino a meta' campo, dove partiva una conclusione
                   con l'eroe fuori scena. Ecco perche' «l'eroe praticamente non riceve palla» e perche' il
                   tiro sembrava partire da solo. Ora la palla si ferma dove e' arrivata — ai piedi
                   dell'eroe — e lui fa il gesto del controllo: la scena dice quello che dice il prompt. */
                heroPostT=0;heroPostType="recv";hlPostArcType=null;passTargetMesh=null;}
              else if((_ht==="build"||_ht==="dribble"||(_ht==="tackle"&&!P.hlDef))&&P.hlReward==="assist"){
                // [7.1.1 collaudo PO «le costruzioni dal basso che portano all'assist non sono riprodotte in 3D — assurdità»]
                //   una COSTRUZIONE/dribbling che vale ASSIST GIOCA la palla IN AVANTI a un compagno che avanza (stesso
                //   flusso pass-assist assist_recv→assist_shot), NON un pugno fermo. Il ricevente (più avanzato in spazio,
                //   davanti al portatore) è selezionato qui perché il ramo build/dribble non passa dal setup del pass.
                let _rd711=1e9,_rmB711=null;const _hx711=hero.position.x,_hz711=hero.position.z;
                sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==="home"&&!src.gk&&pp.mesh!==hero){const _fw=pp.mesh.position.x-_hx711;if(_fw>-2){const _dh53=Math.hypot(_fw,pp.mesh.position.z-_hz711);const _sc=_dh53-Math.max(0,_fw)*2.4+(_dh53<6?14:0);if(_sc<_rd711){_rd711=_sc;_rmB711=pp.mesh;}}/* [7.310.0 collaudo PO «scena surreale: assist a un compagno che ha segnato, la palla ha fatto un cerchio su se stesso»] il peso sull'AVANZAMENTO era 0.6 contro una distanza in unita' piene: su un chip «oltre la difesa» dalla trequarti vinceva il compagno piu' VICINO — quasi in linea con l'eroe, ma spostato di lato — e la palla, dopo l'arco in avanti, tornava indietro attraversando il campo per raggiungerlo: da qui il giro su se stessa. Con peso 2.4 vince chi e' davvero PIU' AVANTI, cioe' l'uomo che il chip stava cercando: la palla prosegue verso la porta e la conclusione arriva dove deve. *//* [7.254.0 gi57 «non si vede il compagno» — misurato: ricevente a 2.9u dall'EROE, il passaggio+tiro a 3 metri sembra la continuazione dell'eroe] penalità di punteggio ai compagni sotto i 6u: il servizio va a un uomo DISTINGUIBILE (fallback naturale se non c'è nessuno oltre) */}});
                if(_rmB711){_rmB711._rcvT=0;_rmB711._runToX=Math.min(_rmB711.position.x+12,AWAY_GOAL_X-6);_rmB711._runToZ=_rmB711.position.z;passTargetMesh=_rmB711;}
                hlPostArcT=0;hlPostArcType="assist_recv";sr.current._arRcv=null;sr.current._arLandX=null;}
              else{heroPostT=0;heroPostType="fist";}}
            /* [7.310.0 collaudo PO «azione chip millimetrico a centrocampo/trequarti ha dato vita ad una scena
               surreale con assist ad un compagno che ha segnato, la palla ha fatto un cerchio su se stesso!»]
               ASSIST SENZA RICEVENTE = PALLA ORFANA. Tutti i rami che valgono un assist mettono
               `hlPostArcType="assist_recv"`, ma la SCELTA del ricevente puo' non trovare nessuno: quella del
               ramo build/dribble (7.1.1) accetta solo compagni davanti al portatore (`_fw>-2`) e su un chip
               dalla trequarti, con l'eroe il piu' avanzato, il filtro non seleziona NIENTE. Il risultato
               misurato su gi106: la palla compie l'arco del chip (x 63→68, quota 1.5) e poi resta li' a
               derivare per secondi — x 68.3→67.3, y 67.5→67.2 — cioe' gira attorno al punto d'atterraggio
               mentre il tabellone assegna assist e gol a un compagno che in campo non tocca palla.
               Qui, dopo il dispatch, la rete: se l'assist non ha un ricevente si prende comunque il compagno
               piu' AVANZATO in campo (che e' sempre chi finalizzerebbe davvero); e se nemmeno quello esiste
               l'assist_recv viene annullato, cosi' la palla non resta mai senza qualcuno che la giochi. */
            /* [7.321.0 collaudo PO — l'uno-due vero] «RICEVI» NELL'ETICHETTA VUOL DIRE CHE LA PALLA TORNA.
               Le azioni «dai e vai / scarico e ricevi / parete / sponda corta e ricevi» promettono una sponda:
               l'eroe gioca corto, il compagno RESTITUISCE, e solo allora si conclude. In campo la restituzione
               non esisteva: il primo appoggio partiva e la scena proseguiva col compagno che finalizzava.
               Misurato su gi180/186/185/121 (le quattro «ricevi» del pool): la palla si allontanava di 7.4-8.8
               unita' dall'eroe e NON tornava mai — il minimo dopo il picco coincideva col picco stesso.
               Ora, quando la situation DICHIARA l'uno-due (`pattern` COMBINATION, che dal 7.318 deriva
               dall'intento e non dal testo), fra l'appoggio e l'esito si inserisce la RESTITUZIONE: la palla
               torna sui piedi dell'eroe, lui la controlla, e da li' parte quello che sarebbe partito comunque
               (rete se il premio e' il gol, servizio al compagno se e' l'assist). L'esito e il tabellone non
               cambiano di una virgola: cambia che la scena racconta cio' che l'etichetta ha promesso. */
            /* [7.324.0 collaudo PO con screenshot «Controlla e serve: scena assurda — il pallone sembra
               intercettato, la scena si ferma, poi vola a un compagno che tira e segna»] IL RITORNO DELL'UNO-DUE
               SOLO A CHI LO DICHIARA. Il cancello 7.321 era `pattern==="COMBINATION"` — ma COMBINATION e' anche
               il FALLBACK di ogni passaggio senza intento (misurato su «Controlla e serve», gi109:
               intent="progression", pattern COMBINATION) → un appoggio semplice faceva QUATTRO tratte:
               palla al muro (letta come intercetto), ritorno all'eroe (la «scena ferma»), ri-selezione di un
               ALTRO compagno, tiro e gol. Ora la sponda esiste solo per `sit.intent==="onetwo"` dichiarato
               (prop hlOneTwo): «Controlla e serve» torna a essere UNA consegna, come promette l'etichetta. */
            if(_hs===true&&P.hlOneTwo===true&&/* [7.348.0 collaudo PO «il triangolo sostanzialmente non c'e': il pallone si ferma a meta' tra eroe e compagno e parte una catena»] il cancello pretendeva anche hlType `pass`, ma NESSUNA delle 9 situations con intento uno-due dichiarato ce l'ha (7 sono `build`, 2 `shot`): passava solo per le azioni con premio ASSIST, che il 7.311 rimappa a pass. Scegliendo «Triangolo e vai» (premio GOL, convertito in OCCASIONE dal 7.8.10) si finiva nel ramo dell'appoggio corto — palla a 9,2 unita' dall'eroe, nessun muro, nessun ritorno. `hlOneTwo` e' gia' il segnale preciso e dichiarato: basta lui. */(hlPostArcType==="in_net"||hlPostArcType==="assist_recv"||(hlPostArcType==null&&P.hlOutcomeKind==="chance"))){
              /* il terzo caso e' l'OCCASIONE (`chance`): li' il post-arco resta vuoto perche' la conclusione
                 arriva dalla catena («ricevi e TIRA»), e il commento diceva «la palla RESTA all'eroe» — ma
                 l'arco del primo appoggio l'aveva gia' portata via, sul compagno, a 8 unita'. Misurato su
                 gi180 e gi121: il secondo tempo partiva col pallone dall'altra parte. Con la restituzione il
                 pallone e' davvero dove la catena lo aspetta. */
              sr.current._o2Fin=hlPostArcType||"none";hlPostArcType="onetwo_back";hlPostArcT=0;
              /* [7.415.0 gi180] IL MURO SI AGGANCIA QUI: nel caso «chance» (7.8.10) passTargetMesh e' gia'
                 stato azzerato — il muro e' il compagno di casa piu' vicino al bersaglio dell'arco d'appoggio. */
              sr.current._o2Wall415=passTargetMesh||null;
              if(!sr.current._o2Wall415){try{let _wd415=1e9;sr.current.players.forEach((pp,ii)=>{const _s5=(P.allPlayers||[])[ii];if(_s5&&_s5.team==="home"&&!_s5.gk&&pp.mesh&&pp.mesh!==hero){const _d5=Math.hypot(pp.mesh.position.x-ballArcTgtX,pp.mesh.position.z-ballArcTgtZ);if(_d5<_wd415){_wd415=_d5;sr.current._o2Wall415=pp.mesh;}}});}catch(_e415){}}
              if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_O2MIN=null;window.__CPM_O2RUN=0;window.__CPM_O2BK=0;sr.current._o2Rx0=hero.position.x;sr.current._o2px=null;}catch(_e){}}/* [7.324.0] tracker PER-FRAME del guardiano: minimo palla↔eroe e corsa del «vai» — il poll da node a 120ms perdeva gli estremi (terza volta che la trappola si ripresenta: rincorsa, lancio orfano, ora questa) *//* [7.322.0] il «vai» parte NELL'ISTANTE dell'appoggio, come in campo: il bersaglio dell'eroe avanza subito e ci resta (l'accelerazione limitata di animOne fa il resto, quindi si vede una corsa e non uno scatto). Ramparlo durante la sponda non bastava: quella fase dura ~0.4s e l'eroe si spostava di 2.4u soltanto — misurato. */sr.current._o2Push=6.5;}
            if((_CPM_TEST||_SIT_TEST)&&typeof window!=="undefined"){try{window.__CPM_DISPATCH={ht:_ht,rew:P.hlReward,ok:_hs,post:hlPostArcType,xr:crossRcvMesh?{x:+crossRcvMesh.position.x.toFixed(1),z:+crossRcvMesh.position.z.toFixed(1)}:null,tgt:{x:+ballArcTgtX.toFixed(1),z:+ballArcTgtZ.toFixed(1)},src:(sr.current._arcSrc382||null),kind:(P.hlOutcomeKind||null),h385:+(+ballArcH).toFixed(2),d385:+(+ballArcDur).toFixed(2),pat385:(P.hlPattern||null),/* [7.385.0 _arcH385] ALTEZZA e durata dell'arco nel dispatch (test-only): senza, «non e' rasoterra» resta un giudizio a occhio invece di un numero — ed e' una nota di collaudo ricorrente *//* [7.364.0] IL RICEVENTE DEL CROSS e il bersaglio dell'arco (test-only): senza, «nessun compagno e' arrivato sul pallone» non si puo' distinguere fra «non e' stato agganciato nessuno» e «e' stato agganciato ma non converge» */rcv:passTargetMesh?{x:+passTargetMesh.position.x.toFixed(1),z:+passTargetMesh.position.z.toFixed(1)}:null,hero:{x:+hero.position.x.toFixed(1),z:+hero.position.z.toFixed(1)},/* [7.369.0] IL PIU' VICINO AL PUNTO D'ATTERRAGGIO (test-only). `rcv` dice dov'e' il ricevente DESIGNATO; la nota PO «l'ultimo passaggio atterra a 2-5u da chiunque» parla invece di CHIUNQUE, ed e' un numero diverso: su gi79 il designato era a 11u mentre il piu' vicino stava a 3-5u — ed era un AVVERSARIO. Senza questo campo le due cose si confondono e si corregge quella sbagliata. */near:(function(){try{let _nd=1e9,_nw=null;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&pp.mesh&&pp.mesh!==hero){const _d=Math.hypot(pp.mesh.position.x-ballArcTgtX,pp.mesh.position.z-ballArcTgtZ);if(_d<_nd){_nd=_d;_nw=(src.team||"?")+(src.gk?"/gk":"");}}});const _dh=Math.hypot(hero.position.x-ballArcTgtX,hero.position.z-ballArcTgtZ);if(_dh<_nd){_nd=_dh;_nw="hero";}return{d:+_nd.toFixed(1),who:_nw};}catch(_e){return null;}})()};}catch(_e){}}/* [7.310.0] osservabilita' del dispatch post-arco (test-only) */
            if(hlPostArcType==="assist_recv"&&(!passTargetMesh||!passTargetMesh.parent)){
              let _bx310=-1e9,_bm310=null;
              try{sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];
                if(src&&src.team==="home"&&!src.gk&&pp.mesh&&pp.mesh!==hero&&pp.mesh.position.x>_bx310){_bx310=pp.mesh.position.x;_bm310=pp.mesh;}});}catch(_e310){}
              if(_bm310){_bm310._rcvT=0;_bm310._runToX=Math.min(Math.max(_bm310.position.x+12,ball.position.x+4),AWAY_GOAL_X-6);_bm310._runToZ=ball.position.z;passTargetMesh=_bm310;sr.current._arRcv=null;sr.current._arLandX=null;}
              else{hlPostArcType=null;heroPostT=0;heroPostType="fist";}
              if((_CPM_TEST||_SIT_TEST)&&typeof window!=="undefined"){try{window.__CPM_DISPATCH2={post:hlPostArcType,rcv:passTargetMesh?{x:+passTargetMesh.position.x.toFixed(1)}:null,n:(sr.current.players||[]).length,ap:(P.allPlayers||[]).length,teams:(P.allPlayers||[]).map(a=>a&&a.team).filter((v,i,a2)=>a2.indexOf(v)===i)};}catch(_e){}}
            }
            if(_hs===false){hlInNetFlashed=false;heroPostT=0;heroPostType="miss";
              // ENGINE Fase 3 (fusione): il TIPO di esito mancato deriva dal Decision Engine (P.hlOutcomeKind),
              //   non più da un dado → parata/palo/fuori/murato coerenti con attributi/contesto. Fallback al dado se assente.
              const _isShotHL=_ht==="shot"||_ht==="penalty"||_ht==="freekick"||_ht==="header";
              const _ek=P.hlOutcomeKind,_roll=Math.random();
              const _isPost=_ek?(_ek==="post"):(_isShotHL&&_roll<0.20);
              if(_isPost){// PALO
                hlOutcomeVariant="post";hlPostArcT=0;hlPostArcType="hit_post";crowdOhT=0;// ATMO #4: il pubblico reagisce al palo
                hlPostVY=4.5+Math.random()*2.5;hlPostVZ=(Math.random()>0.5?1:-1)*(7+Math.random()*5);
              } else {// PARATA o FUORI (deflect)
                const _isSave=_ek?(_ek==="saved"||_ek==="save"):(_isShotHL&&_roll<0.85);
                hlOutcomeVariant=(_ek==="blocked"||_ek==="intercepted")?"blocked":(_isShotHL?(_isSave?"save":"wide"):"blocked");
                hlPostArcT=0;hlPostArcType="deflect";
                /* [7.514.0 R2/3 — LA RESPINTA NASCE DAL CONTATTO, NON DAL DADO: audit «le sue velocita' sono
                   estratte a caso» + «rimbalzi senza senso»] L'impulso della parata e' la RIFLESSIONE del volo
                   in arrivo, smorzata (k=0,28 orizzontale — la stessa famiglia di restituzione del deflect a
                   terra, -0,22/-0,30), piu' la spazzata della mano nella direzione del tuffo. La varieta' e'
                   DETERMINISTICA (frazione dei decimali di bersaglio+durata): stessa scena, stessa respinta —
                   niente Math.random che sfugge al replay. __CPM_NO514 = rosso (dado vecchio, VX=0). */
                if(_isShotHL&&!(typeof window!=='undefined'&&window.__CPM_NO514)){
                  const _dur514=Math.max(ballArcDur||0.5,0.2);
                  const _vxIn=(ballArcTgtX-(hero?hero.position.x:ballArcTgtX-20))/_dur514;
                  const _vzIn=(ballArcTgtZ-(hero?hero.position.z:0))/_dur514;
                  const _var514=0.85+((Math.abs(ballArcTgtZ*7.13)+_dur514*11.7)%1)*0.3;
                  hlPostVX=-_vxIn*0.28*_var514;
                  hlPostVZ=(_vzIn*0.28+oppDiveDir*4.2)*_var514;
                  hlPostVY=(3.2+(ballArcH||1.5)*1.1)*_var514;
                  if(typeof window!=='undefined'&&window.__CPM_RESP514!==undefined){try{window.__CPM_RESP514.push({vx:+hlPostVX.toFixed(1),vz:+hlPostVZ.toFixed(1),vy:+hlPostVY.toFixed(1)});}catch(_e){}}
                }
                else if(_isShotHL){hlPostVZ=-oppDiveDir*(8+Math.random()*7);hlPostVY=5+Math.random()*3;
                  if(typeof window!=='undefined'&&window.__CPM_RESP514!==undefined){try{window.__CPM_RESP514.push({vx:0,vz:+hlPostVZ.toFixed(1),vy:+hlPostVY.toFixed(1)});}catch(_e){}}}
                else if(_ht==="cross"&&(_ek==="saved"||_ek==="save")){hlPostVZ=0;hlPostVY=0.8;}/* [6.74.0 3D-4] cross bloccato in presa: la palla muore tra le mani del GK, niente rimbalzo random */
                else{hlPostVZ=(Math.random()>0.5?1:-1)*(8+Math.random()*6);hlPostVY=2.5+Math.random()*2;}
                if(hlOutcomeVariant==="save"){if(awayGkMesh){gkSaveCelebT=-0.10;gkSaveMesh=awayGkMesh;}crowdOhT=0;}// ATMO #4: il pubblico reagisce alla grande parata
                else if(_ht==="pass"||_ht==="build"){
                  // 5.43.2 (fail passaggio): il difensore INTERCETTA con una SCIVOLATA + il compagno destinatario fa COMUNQUE il movimento verticale (palla intercettata prima che lo raggiunga)
                  let _nd=99,_nm=null;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='away'&&!src.gk){const d=Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z);if(d<_nd){_nd=d;_nm=pp.mesh;}}});
                  if(_nm){oppActType="opp_tackle";oppActT=0;oppMesh=_nm;oppMesh._divePz=_nm.position.z;oppDiveDir=_nm.position.z>=0?1:-1;oppMesh._slideToX=_nm.position.x-3;oppMesh._slideToZ=_nm.position.z;}
                  let _rd=99,_rm=null;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&!src.gk&&pp.mesh!==hero&&pp.mesh.position.x>hero.position.x-2){const d=Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z);if(d<_rd){_rd=d;_rm=pp.mesh;}}});
                  if(_rm){_rm._failRunT=0;_rm._runToX=Math.min(_rm.position.x+12,AWAY_GOAL_X-4);_rm._runToZ=_rm.position.z;}
                }
              }
            }
          }}}
      else if(hlPostArcT>=0&&!tlOn){hlPostArcT+=aDt;
        /* [7.557.0 P0b — ANCHE LA FASE D'ESITO DICE CHI MUOVE IL PALLONE]
           Il censimento per fase del 7.555 ha diviso il verdetto in due meta' opposte: nella CRONACA
           l'anagrafe e' completa (2891 fotogrammi col pallone in moto, DUE senza nome: 0,07%), nella fase
           d'ESITO no — il 44-55% del movimento e' scritto da nessuno, identico col rosso e col verde, quindi
           un buco che c'era da prima. La causa e' semplice e strutturale: la macchina del post-arco
           (in rete, palo, traversa, respinta, consegna del cross, uno-due, parata, fuori, dribbling) ha ~20
           punti che scrivono `ball.position` e NON UNO porta una firma. E' la fase che il giocatore guarda
           davvero: finche' resta anonima, «la palla sbatte a terra e poi sale» o «esito gol ma la palla non
           e' mai arrivata» non hanno un colpevole da nominare.
           Il rimedio non e' venti etichette sparse — si sporcherebbe ogni ramo e la prossima aggiunta
           nascerebbe di nuovo anonima. Qui si fotografa il pallone all'INGRESSO della macchina e si
           confronta all'USCITA: se e' cambiato, lo scrittore e' la macchina d'esito, e il nome porta con se'
           il TIPO dichiarato (`esito:in_net`, `esito:hit_post`, ...). Una riga sola, che copre anche i rami
           che verranno. Sola strumentazione: nessun moto cambiato. */
        const _pa557=(ball&&!(typeof window!=='undefined'&&window.__CPM_NO557))?{x:ball.position.x,y:ball.position.y,z:ball.position.z}:null;const _pt557=hlPostArcType;/* __CPM_NO557 = rosso: nessuna firma sull'esito, l'anagrafe del 7.556 */
        /* 5.43.9: l'arco di conclusione (in_net/deflect/...) NON avanza finché il build-up è in corso (tlOn) → su conduzioni/build-up lunghi (BALL_CARRY) la palla entra DAVVERO in rete dopo la conduzione, senza che l'arco scada/confligga col ball-pin */
        if(typeof window!=='undefined'&&window.__CPM_REC){try{window.__CPM_AR52={pat:+(+hlPostArcT).toFixed(2),ty:hlPostArcType,n:((window.__CPM_AR52&&window.__CPM_AR52.n)||0)+1};}catch(_e){}}/* [7.240.0 strumentazione permanente, solo __CPM_REC] contatore di vitalità della catena post-arco */
        if(hlPostArcType==="in_net"){
          /* [7.533.0 MP-0e — indagine 003, ipotesi H1: r.13078 sceglie in_net su `_hs===true` + famiglia
             tiro SENZA guardare l'esito (la nota 7.477 lo ammette e la strada del dispatch e' revocata:
             costa l'invariante della mappa analitica). RIMEDIO NON-DI-MAPPA: il canale resta identico, ma
             il CERTIFICATO-RETE si concede solo quando il premio dichiarato e' davvero un gol — lo stesso
             gate gia' collaudato del ramo pass (reward==="goal" && kind!=="chance"). Su una «occasione»
             il volo resta (mappa intatta), ma a canale chiuso il guardiano geometrico 7.530 fa scivolare
             la palla oltre il palo: lo stato FINALE — quello che le note PO fotografano — dice occasione.
             ⚠️ IL GATE E' SULL'ESITO, NON SUL PREMIO: la firma del falso e' SOLO kind==="chance" (il remap
             r.21909 delle catene). Su un tiro puro _hs===true IMPLICA outKind==="goal" (r.3456: ok e'
             outKind==="goal"), e negare il certificato quando il premio non e' «goal» avrebbe espulso i
             GOL VERI del compagno (reward="assist", arm r.13501) e le incornate da cross (r.13325).
             Rosso __CPM_NO546 = certificato incondizionato (comportamento 7.530-7.532). */
          const _cert546=(typeof window!=='undefined'&&window.__CPM_NO546)?true:(P.hlOutcomeKind!=="chance");
          if(_cert546)sr.current._netOk535=true;
          /* [7.652.0 - ANCHE IL GOL DA DRIBBLING MERITA UN TUFFO. Rosso __CPM_NO652]
             COLLAUDO PO (SIT #92, roulette->goal, nota ripetuta): «il portiere non si tuffa, non
             tenta la parata». CENSITO: i sei armamenti di gk_dive coprono cross/incornata, assist,
             chance e i tiri CON arco (ballArc) - ma i gol che entrano nel canale in_net DIRETTO
             (dribbling/pressing-gol, r.~2240, e il «dai ricevi TIRA» r.~2234) non armavano nulla:
             la palla scivolava in rete davanti a un portiere fermo. Stesso tuffo corto e battuto
             degli altri siti (fattore 0,55: il gol sta entrando), armato UNA volta quando la palla
             e' nell'ultimo tratto. */
          if(!(typeof window!=='undefined'&&window.__CPM_NO652)&&awayGkMesh&&!P.hlDef&&!oppActType&&ball.position.x>GOAL_LINE_X-14){
            oppActType="gk_dive";oppActT=0;oppMesh=awayGkMesh;oppDiveDir=ball.position.z>=oppMesh.position.z?1:-1;oppMesh._divePz=oppMesh.position.z;oppMesh._diveYaw=oppMesh.rotation.y;oppMesh._diveToZ=clamp(oppMesh.position.z+(ball.position.z-oppMesh.position.z)*0.55,oppMesh.position.z-6,oppMesh.position.z+6);
            if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_DIVE652=window.__CPM_DIVE652||{arm:0});_w.arm++;}catch(_e652){}}
          }
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&sr.current._netLog546!==P.hlSitKey+"|in_net"){sr.current._netLog546=P.hlSitKey+"|in_net";try{const _n5=(window.__CPM_NET546=window.__CPM_NET546||[]);if(_n5.length<60)_n5.push({ch:"in_net",ht:P.hlType||null,rew:P.hlReward||null,ok:P.hlOutcomeKind||null,cert:_cert546?1:0});}catch(_e){}}/* [7.533.0] collettore d'attribuzione 003 (test-only): ogni ingresso in rete dichiara premio/esito e se ha avuto il certificato */
          // [6.6.0 R3 ball] INGRESSO IN RETE FLUIDO: moto CONTINUO — la palla avanza oltre
          //   la linea SENZA fermarsi/scattare, converge nello specchio NELLA DIREZIONE del tiro (continuità, non
          //   un recentering a z=0 «di lato»), poi si ABBASSA nella rete (niente hop verso l'alto = niente rimbalzo
          //   irreale). Un solo obiettivo (goal+2.6 · z=target-tiro clampato tra i pali · y bassa) → traiettoria pulita.
          ball.position.x+=((GOAL_LINE_X+0.55)-ball.position.x)*Math.min(aDt*4.6,1);/* [6.74.0 3D-1] dentro la rete (49.15, fondo a 49.4) — prima si fermava asintotica SUL piano dei pali */
          {const _zt90=clamp(ballArcTgtZ,-3.35,3.35);ball.position.z+=(_zt90-ball.position.z)*Math.min(aDt*4.6,1);}// [6.45.0 RC] ±3.35 (semi-larghezza porta 3.66): i gol d'angolo entrano più vicino al palo (prima ±3.0 = solo l'82% centrale della porta) lasciando margine al raggio palla
          const _yn90=ball.position.x>GOAL_LINE_X?0.45:ball.position.y;// oltre la linea REALE → si assesta nella rete
          ball.position.y+=(_yn90-ball.position.y)*Math.min(aDt*3.4,1);
          if(!hlInNetFlashed&&ball.position.x>GOAL_LINE_X-0.05){hlInNetFlashed=true;contactFlashT=0;shakePow=0.20;}// flash quando la palla supera il piano dei pali (non 2.6u prima)
          if(hlPostArcT>1.9){hlPostArcT=-1;hlPostArcType=null;hlInNetFlashed=false;}}
        else if(hlPostArcType==="in_net_high"){
          {const _cert546h=(typeof window!=='undefined'&&window.__CPM_NO546)?true:(P.hlOutcomeKind!=="chance");/* [7.533.0 MP-0e] stesso gate-certificato di in_net (esito, non premio — nota al sito gemello) */
          if(_cert546h)sr.current._netOk535=true;
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&sr.current._netLog546!==P.hlSitKey+"|in_net_high"){sr.current._netLog546=P.hlSitKey+"|in_net_high";try{const _n5=(window.__CPM_NET546=window.__CPM_NET546||[]);if(_n5.length<60)_n5.push({ch:"in_net_high",ht:P.hlType||null,rew:P.hlReward||null,ok:P.hlOutcomeKind||null,cert:_cert546h?1:0});}catch(_e){}}}
          // [6.6.0 R3 ball] chip/volley — entra ALTA e pulita: converge nello specchio
          //   (verso del tiro, tra i pali) mantenendo la quota fino alla linea, poi cala dolcemente nella rete alta.
          ball.position.x+=((GOAL_LINE_X+0.55)-ball.position.x)*Math.min(aDt*4.4,1);/* [6.74.0 3D-1] dentro la rete */
          {const _zt91=clamp(ballArcTgtZ,-3.35,3.35);ball.position.z+=(_zt91-ball.position.z)*Math.min(aDt*4.4,1);}/* [6.45.0 RC] ±3.35 come in_net */
          const _tgtY=ball.position.x>GOAL_LINE_X?1.5:Math.max(ball.position.y,2.0);// mantiene la quota fino all'ingresso REALE, poi cala nella rete alta
          ball.position.y+=(_tgtY-ball.position.y)*Math.min(aDt*3,1);
          if(!hlInNetFlashed&&ball.position.x>GOAL_LINE_X-0.05){hlInNetFlashed=true;contactFlashT=0;shakePow=0.15;}
          if(hlPostArcT>1.9){hlPostArcT=-1;hlPostArcType=null;hlInNetFlashed=false;}}
        else if(hlPostArcType==="in_net_own"){/* [7.530.0 NO535] gemello speculare di in_net per la PROPRIA porta:
          moto continuo oltre la linea (-48,6), convergenza NELLO specchio (z clampato ±3,35 sul verso del tiro),
          poi si assesta bassa nella rete. Finche' il canale vive, tiene la palla in rete: e' anche il tappo
          contro lo scrittore anonimo che la trascinava di lato (z 2,2→5,6 misurato). */
          sr.current._netOk535=true;/* [7.533.0 MP-0e] il gemello difensivo NON prende il gate-certificato: si aggancia solo a fine-arco di un goal_against dichiarato (7.530) — qui il premio e' il danno subito e non esiste un «chance subita» che entri per errore */
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&sr.current._netLog546!==P.hlSitKey+"|in_net_own"){sr.current._netLog546=P.hlSitKey+"|in_net_own";try{const _n5=(window.__CPM_NET546=window.__CPM_NET546||[]);if(_n5.length<60)_n5.push({ch:"in_net_own",ht:P.hlType||null,rew:P.hlReward||null,ok:P.hlOutcomeKind||null,cert:1});}catch(_e){}}
          ball.position.x+=((-(GOAL_LINE_X+0.55))-ball.position.x)*Math.min(aDt*4.6,1);
          {const _zt535=clamp(ballArcTgtZ,-3.35,3.35);ball.position.z+=(_zt535-ball.position.z)*Math.min(aDt*4.6,1);}
          const _yn535=ball.position.x<-GOAL_LINE_X?0.45:ball.position.y;
          ball.position.y+=(_yn535-ball.position.y)*Math.min(aDt*3.4,1);
          if(!hlInNetFlashed&&ball.position.x<-(GOAL_LINE_X-0.05)){hlInNetFlashed=true;contactFlashT=0;shakePow=0.16;}
          if(hlPostArcT>1.9){hlPostArcT=-1;hlPostArcType=null;hlInNetFlashed=false;}}
        else if(hlPostArcType==="hit_post"){// CINE-3: palla va verso il palo, vibrazione, rimbalzo
          /* [7.215.0 revisione PO «rendere più nitida la parata / traversa / palo»] LA TRAVERSA ESISTE. Il legno
             era SEMPRE un palo laterale: una conclusione diretta all'incrocio convergeva comunque a ±3.66 e
             scendeva, e la traversa non si vedeva mai. Ora, se il tiro era indirizzato ALTO, il pallone sale a
             sbattere sotto la traversa mantenendo la propria direzione, e da lì ricade. */
          const _bar215=(P.hlWood!=null)?(P.hlWood==="bar"):(ballArcTgtY!=null&&ballArcTgtY>=1.55);/* [7.217.0] la decisione arriva da handleAction (unica sorgente, condivisa con overlay e cronaca); la deduzione dalla quota resta solo come fallback */
          ball.position.x+=(GOAL_LINE_X-ball.position.x)*Math.min(aDt*6.5,1);/* [6.74.0 3D-1] il contatto avviene SUL palo reale (48.6), non su un muro invisibile a 44-46 */
          if(_bar215){const _cz=clamp(ballArcTgtZ,-3.2,3.2);ball.position.z+=(_cz-ball.position.z)*Math.min(aDt*4.0,1);}
          else{const _pz74=(ballArcTgtZ>=0?3.66:-3.66);ball.position.z+=(_pz74-ball.position.z)*Math.min(aDt*4.0,1);}/* la palla converge sul PALO (±3.66), non verso il centro-porta */
          if(_bar215)ball.position.y+=(2.44-ball.position.y)*Math.min(aDt*6.5,1);// sale a sbattere SOTTO LA TRAVERSA
          else ball.position.y=0.65+Math.max(0,Math.sin(hlPostArcT*5.5)*1.4*Math.exp(-hlPostArcT*2.5));
          if(!hlInNetFlashed&&ball.position.x>GOAL_LINE_X-0.8){
            hlInNetFlashed=true;contactFlashT=0;shakePow=0.38;// vibrazione palo più forte
            if(_bar215){hlPostVY=-(2.2+Math.random()*1.8);hlPostVZ*=0.35;}/* [7.215.0] dalla TRAVERSA il pallone ricade, non schizza verso l'alto come dal palo */
            hlPostArcType="post_rebound";hlPostArcT=0;}
          else if(hlPostArcT>0.9){hlPostArcType="post_rebound";hlPostArcT=0;}}// fallback
        else if(hlPostArcType==="post_rebound"){// CINE-3: palla rimbalza via dal palo
          hlPostVY-=aDt*20;ball.position.y+=hlPostVY*aDt;
          if(ball.position.y<=0.65&&hlPostVY<0){ball.position.y=0.65;hlPostVY*=-0.22;contactFlashT=0;}
          ball.position.x+=(34-ball.position.x)*aDt*1.8;// torna indietro dal palo
          if((sr.current._ws524=6)&&sr.current._bj0)(sr.current._bj0.src='palo',sr.current._bj0.srcs.push('palo'));/* [7.515.0 R2/4] firma */
          ball.position.z+=hlPostVZ*aDt;hlPostVZ*=(1-aDt*2.2);
          if(hlPostVX){ball.position.x+=hlPostVX*aDt;hlPostVX*=(1-aDt*2.2);if(ball.position.x<G2X(3))ball.position.x=G2X(3);}/* [7.514.0] la respinta rientra in campo, con lo stesso smorzamento della z */
          if((sr.current._ws524=7)&&sr.current._bj0)(sr.current._bj0.src='respinta',sr.current._bj0.srcs.push('respinta'));/* [7.515.0 R2/4] firma */
          if(hlPostArcT>2.5){hlPostArcT=-1;hlPostArcType=null;hlPostVY=0;hlPostVX=0;}}
        else if(hlPostArcType==="cross_goal"&&P.hlOutcomeKind==="chance"){hlPostArcType="deflect";hlPostVY=6;hlPostVZ=(Math.random()-0.5)*8;hlPostArcT=0;}// [5.78.0 SIT-4] chance: niente rete — rimbalzo per il secondo tempo
        else if(hlPostArcType==="cross_goal"){// cross → testa → porta avversaria (AWAY_GOAL_X)
          /* [7.244.0 gi30/gi46 «Non si vede il compagno che conclude»] la consegna in area poteva arrivare
             SENZA UOMO: crossRcvMesh nasce solo alla conclusione di un cross vero con un compagno entro 24u —
             sull'arrival-gate (assist_recv→cross_goal) e sui cross larghi era NULL e la palla curvava in rete
             da sola. SELEZIONE D'EMERGENZA (pattern 7.241 di assist_recv): il compagno meglio piazzato attacca
             la consegna — CORRE con animOne (niente glide, lezione 7.205) e la consegna si ALLUNGA quanto serve
             al suo arrivo (durata ∝ distanza, cap 1.7s; pallone rallentato in proporzione → stesso profilo). */
          if(!crossRcvMesh){let _bs58=1e9,_bm58=null,_bd58=0;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&!src.gk&&pp.mesh!==hero&&pp.mesh!==passTargetMesh){const dr=Math.hypot(pp.mesh.position.x-ball.position.x,pp.mesh.position.z-ball.position.z);const d=dr+(pp.mesh.position.x<ball.position.x-2?30:0);/* [7.335.0] il terzo uomo che attacca la consegna non può stare DIETRO la palla: la scelta per sola vicinanza pescava un uomo arretrato e il pallone tornava indietro da solo */if(d<_bs58){_bs58=d;_bd58=dr;_bm58=pp.mesh;}}});
            if(_bm58){crossRcvMesh=_bm58;crossRcvMesh._cgRun=1;sr.current._cgDur=Math.min(Math.max(_bd58/10,0.65),2.6);/* [7.335.0] durata dalla distanza REALE (la penalità all'indietro è solo punteggio) + cap 1.7→2.6s: l'uomo lontano deve poter ARRIVARE */}}
          const _cgD=sr.current._cgDur||0.65;
          const _u2=Math.min(hlPostArcT/_cgD,1);
          const _uh74=Math.min(_u2+0.25,1);// [6.74.0 3D-5] la testata parte dalla QUOTA a cui arriva il cross (~2.7u, continuità C0), non da terra
          ball.position.y=0.65+Math.sin(_uh74*Math.PI)*(_cgD>1.0?5.5:3.0);/* [7.250.0 gi30 «troppo distante»] la consegna LUNGA (da centrocampo) vola ALTA (lofted 5.5): un pallone a campanile in area si legge come LANCIO, non come un tiro teso da 40 metri */
          const _cgR=3.8*(0.65/_cgD);
          ball.position.x+=((AWAY_GOAL_X-6)-ball.position.x)*aDt*_cgR;ball.position.z+=(0-ball.position.z)*aDt*_cgR*0.37;/* [7.252.0 gi30 «il tiro del compagno più in profondità»] la consegna atterra a goal-6 (dentro l'area piccola-grande): il terzo uomo conclude da posizione profonda *//* [7.247.0 gi29 «il tiro avviene da distanza siderale»] la consegna ATTERRA IN AREA (goal-8 ≈ il dischetto), non sulla porta: prima puntava AWAY_GOAL_X+1 per tutto il volo e da centrocampo leggeva come un tiro da 40 metri che entra — ora lancio → area → incornata del terzo uomo → in_net fa l'ultimo tratto */
          // [6.74.0 3D-5] il ricevente accompagna/incorna: convergenza sul pallone + gesto di ricezione al 1° frame
          if(crossRcvMesh){if(hlPostArcT<=aDt&&crossRcvMesh._rcvT==null&&!crossRcvMesh._cgRun)crossRcvMesh._rcvT=0;
            if(crossRcvMesh._cgRun)animOne(crossRcvMesh,ball.position.x-1.4,ball.position.z,aDt,ak,ball.position.x-1.4,ball.position.z);
            else{crossRcvMesh.position.x+=((ball.position.x-1.6)-crossRcvMesh.position.x)*Math.min(aDt*4.5,1);crossRcvMesh.position.z+=(ball.position.z-crossRcvMesh.position.z)*Math.min(aDt*4.5,1);}}
          const _cgNear=!crossRcvMesh||Math.hypot(crossRcvMesh.position.x-ball.position.x,crossRcvMesh.position.z-ball.position.z)<3.2;/* [7.335.0] contatto reale: l'uomo è SULLA palla */
          /* [7.605.0 — IL GOL NON PUO' ASPETTARE CINQUE SECONDI, rosso __CPM_NO605]
             COLLAUDO PO su SIT #51: «esito goal ma la palla non e' mai arrivata in porta, e il portiere
             non si tuffa». TRACCIATO fotogramma per fotogramma col gancio nuovo sul kind (FORCE_KIND):
             l'arco porta il pallone a x 91, poi la coreografia cross_goal lo tiene FERMO a x 90 per 4,7
             SECONDI aspettando il compagno dell'incornata — che non arriva in tempo, perche' la mesh
             insegue col ritardo di 5-6 m misurato nel 7.592 — e solo allora l'attesa di riserva
             (_cgD+2,2 s) molla e la palla entra da sola. In laboratorio il gol si vede a +11,4 s dalla
             conclusione; sul dispositivo la scena finisce prima, e il PO vede esattamente cio' che ha
             scritto: gol dichiarato, palla parcheggiata fuori area, nessun tuffo.
             L'attesa scende da _cgD+2,2 a _cgD+0,8: un'incornata che non parte entro un secondo dalla
             consegna non partira' mai — e' la stessa lezione della ripresa (7.590): le attese lunghe non
             comprano realismo, comprano scene morte. MISURATO dopo: il gol entra ~3,5 s prima (in_net a
             +7,9 s invece di +11,4). La strada VERA — un compagno che arriva davvero sull'incornata —
             passa dal ritardo di resa, che e' la decisione di prodotto gia' posta al PO. */
          const _cgLate=hlPostArcT>=_cgD+((typeof window!=='undefined'&&window.__CPM_NO605)?2.2:0.8);
          if(_uh74>=0.93&&sr.current._cgHold==null&&(_cgNear||_cgLate))sr.current._cgHold=0.22;/* [7.253.0 gi30 «lontanissimo il tiro»] STACCO PERCETTIVO sull'uomo dell'incornata: lancio→testa→rete era UN volo continuo da centrocampo alla porta e leggeva come un tiro da 40m — ora la palla SOSPENDE ~0.22s a quota testa sul terzo uomo (contatto leggibile) e solo poi entra. [7.335.0 collaudo PO «la palla passa senza una dinamica chiara da un compagno a un altro»] lo stacco si arma SOLO a contatto: prima la sospensione TELETRASPORTAVA la palla sul mesh dell'uomo in ritardo (misurato game 84.6→51.3 = mezzo campo all'indietro) — ora la palla resta parcheggiata in area e ASPETTA l'arrivo */
          if(sr.current._cgHold!=null&&sr.current._cgHold>0){sr.current._cgHold-=aDt;
            if(crossRcvMesh&&_cgNear){ball.position.x=crossRcvMesh.position.x+0.6;ball.position.z=crossRcvMesh.position.z;ball.position.y=1.9;if((sr.current._ws524=8)&&sr.current._bj0)(sr.current._bj0.src='ricevente-cross',sr.current._bj0.srcs.push('ricevente-cross'));}}
          if(_uh74>=0.93&&sr.current._cgHold!=null&&sr.current._cgHold<=0){sr.current._cgHold=null;/* [7.252.0 gi30 «rimbalza in area senza senso»] l'incornata del terzo uomo colpisce la palla IN ARIA (~93% dell'arco, ancora in discesa) — prima la transizione aspettava il tocco a terra e la ripartenza verso la rete leggeva come un rimbalzo */
            // [5.83.0 IA-3] il tuffo sul CROSS arriva al 2° TOCCO (l'incornata), non al lancio del traversone
            if(awayGkMesh&&!P.hlDef&&!oppActType){oppActType="gk_dive";oppActT=0;oppMesh=awayGkMesh;oppDiveDir=ball.position.z>=oppMesh.position.z?1:-1;oppMesh._divePz=oppMesh.position.z;oppMesh._diveYaw=oppMesh.rotation.y;oppMesh._diveToZ=clamp(oppMesh.position.z+(ball.position.z-oppMesh.position.z)*0.55,oppMesh.position.z-6,oppMesh.position.z+6);}/* [6.74.0 3D-3] anche sull'incornata da cross il tuffo resta corto (il gol sta entrando) */
            if(crossRcvMesh&&_cgNear){sr.current._mateFx={mesh:crossRcvMesh,name:"header",t:0.55};_versoPorta673(crossRcvMesh,"header");if(crossRcvMesh._cgRun&&crossRcvMesh._rcvT==null)crossRcvMesh._rcvT=0;/* [7.244.0] anche l'uomo d'emergenza fa il GESTO dell'incornata (procedurale) all'impatto — durante lo sprint il gesto è rinviato, suona qui al tocco */if(_CPM_TEST&&typeof window!=='undefined'){try{const _c=window.__CPM_MATEFX||(window.__CPM_MATEFX={kick:0,header:0});_c.header++;}catch(_e){}}}/* [7.209.0] l'incornata sul cross è un GESTO del compagno, non solo un cambio di traiettoria */
            if(crossRcvMesh)crossRcvMesh._cgRun=null;sr.current._cgDur=null;/* [7.244.0] cleanup consegna d'emergenza */
            hlPostArcType="in_net";hlPostArcT=0;hlInNetFlashed=false;contactFlashT=0;crossRcvMesh=null;}}// 3DV-14: flash al secondo tocco
        else if(hlPostArcType==="onetwo_back"){/* [7.321.0] LA SPONDA TORNA — secondo tempo dell'uno-due.
             Il compagno che ha ricevuto l'appoggio restituisce di prima: la palla converge sui piedi
             dell'eroe (un filo davanti a lui, dal lato della porta, come un pallone giocato nello spazio),
             lui la CONTROLLA (posa `recv`, la stessa della ricezione 7.311) e da li' riparte l'esito gia'
             deciso. Guardia d'arrivo a 2u con un minimo di 0.22s per far leggere il viaggio, fallback a
             1.5s: la scena non puo' restare appesa se qualcosa va storto. */
          const _o2hx=hero.position.x,_o2hz=hero.position.z;
          /* [7.415.0 collaudo PO gi180 «la combinazione non e' sincronizzata col compagno, solo il
             pallone si muove»] DOPO IL TOCCO, LA SPONDA SI SMARCA. Misurato: palla 40u, eroe 9-17u,
             sponda 0,3-0,5u — il muro del 7.330 tiene la posizione DI PROPOSITO per il tocco
             (anti-boomerang), ma restava statua anche a palla partita. Nel dai-e-vai vero chi fa da
             sponda gioca e riparte: appena la restituzione e' in viaggio (qui, una volta per scena)
             il suo bersaglio avanza di 7u con un filo di diagonale via dall'eroe — il driver 11980
             lo porta. */
          {const _wm415=passTargetMesh||sr.current._o2Wall415;
           if(_wm415&&sr.current._o2WR415!==P.hlSitKey){sr.current._o2WR415=P.hlSitKey;
             const _wsz415=(_wm415.position.z>=_o2hz)?1:-1;
             _wm415._runToX=Math.min(_wm415.position.x+7,AWAY_GOAL_X-6);
             _wm415._runToZ=clamp(_wm415.position.z+_wsz415*3,-30,30);}
           if(_wm415&&_wm415._runToX!=null)animOne(_wm415,_wm415._runToX,(_wm415._runToZ!=null?_wm415._runToZ:_wm415.position.z),aDt,ak,ball.position.x,ball.position.z);}
          /* [7.324.0] LA SPONDA SI GIOCA SULLA CORSA. Il bersaglio era la posizione CORRENTE dell'eroe — ma
             durante la restituzione l'eroe sta facendo il «vai» (sprint fino a ~13 u/s) e la palla gli
             inseguiva i talloni con un gap d'equilibrio di ~3u (misura per-frame: sul fallback la consegna
             moriva a 4.7u da lui). Un muro vero restituisce NELLO SPAZIO: bersaglio = eroe + velocita' × lead,
             la palla e l'uomo si incontrano davanti. */
          const _o2ld=0.45*Math.max(0,1-hlPostArcT/0.8);/* il lead DECADE: all'inizio la palla va nello spazio davanti alla corsa, poi converge sull'uomo — a lead fisso inseguiva un punto sempre 6u avanti e la consegna non arrivava mai (misurato: min 3.9-4.6 costante) */
          /* [7.333.0 collaudo PO gi185 «il pallone vola avanti-dx, TORNA INDIETRO e poi verso la porta —
             completamente da ritarare»] il muro sta AVANTI all'eroe, quindi mirare l'eroe = restituzione
             ALL'INDIETRO (ping-pong a 3 gambe). In un uno-due vero la sponda va NELLO SPAZIO davanti e
             l'eroe ci arriva sopra col «vai»: PAVIMENTO in avanti sul bersaglio — mai una x dietro la
             palla. La palla scorre in avanti, l'uomo la raggiunge sulla corsa. */
          const _o2tx=Math.max(Math.min(_o2hx+(hero._hvx||0)*_o2ld+0.9,AWAY_GOAL_X-8),ball.position.x+0.6);
          const _o2tz=_o2hz+(hero._hvz||0)*_o2ld;
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _pxp=sr.current._o2px;if(_pxp!=null&&ball.position.x<_pxp-1e-4)window.__CPM_O2BK=(window.__CPM_O2BK||0)+(_pxp-ball.position.x);sr.current._o2px=ball.position.x;}catch(_e){}}/* [7.333.0] tracker: moto ALL'INDIETRO cumulato della palla durante il ritorno (deve restare ~0) */
          ball.position.x+=((_o2tx)-ball.position.x)*Math.min(aDt*4.4,1);
          ball.position.z+=((_o2tz)-ball.position.z)*Math.min(aDt*4.4,1);
          ball.position.y+=(0.65-ball.position.y)*Math.min(aDt*7,1);
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _d2=+Math.hypot(ball.position.x-_o2hx,ball.position.z-_o2hz).toFixed(2);window.__CPM_O2={t:+hlPostArcT.toFixed(2),d:_d2,fin:sr.current._o2Fin||null};window.__CPM_O2MIN=(window.__CPM_O2MIN==null||_d2<window.__CPM_O2MIN)?_d2:window.__CPM_O2MIN;}catch(_e){}}
          if((Math.hypot(ball.position.x-_o2hx,ball.position.z-_o2hz)<2.0&&hlPostArcT>=0.22)||hlPostArcT>=1.9){/* [7.324.0] fallback 1.5→1.9: e' solo anti-deadlock, ma a 1.5 tagliava la sponda a meta' corsa (l'eroe fa il «vai» e la palla lo raggiunge sulla corsa: serve il tempo che serve) — misurato: consegna morta a 3.4-3.9u dall'uomo */
            heroPostT=0;heroPostType="recv";contactFlashT=0;
            const _o2f=sr.current._o2Fin;
            hlPostArcType=(_o2f&&_o2f!=="none")?_o2f:null;hlPostArcT=(hlPostArcType==null)?-1:0;
            if(hlPostArcType==="assist_recv"){/* [7.321.0] il compagno del muro NON puo' essere anche il destinatario
                 dell'assist: ha appena restituito ed e' addosso all'eroe — servirlo di nuovo e' il difetto
                 «ricevente a 3 metri, il passaggio+tiro sembra la continuazione dell'eroe» chiuso nel 7.254.
                 Si azzera il suo aggancio e la selezione del driver (con la penalita' ai compagni sotto i 6u)
                 sceglie un uomo distinguibile. */
              try{if(passTargetMesh)passTargetMesh._rcvT=null;}catch(_e321){}
              sr.current._arRcv=null;sr.current._arLandX=null;passTargetMesh=null;}
            else hlInNetFlashed=false;
            sr.current._o2Fin=null;}}
        else if(hlPostArcType==="assist_recv"){// il compagno SCATTA sulla palla giocata in profondità — la palla RESTA avanti, NON torna indietro
          /* [7.299.0 collaudo PO «il pallone fa giri strani: va a un compagno, parte il tiro, poi TORNA INDIETRO
             e parte il tiro da un altro compagno»] Il ricevente veniva ri-scelto A OGNI FRAME con una priorita'
             a tre livelli: chi ha il gesto `_rcvT` attivo → `passTargetMesh` → il piu' vicino alla palla. Ma il
             gesto dura 0.52s: quando scadeva su A, il livello successivo poteva restituire B — e la palla, che
             insegue `_rm`, invertiva la marcia per andare da B. Da qui il doppio tiro e il pallone che torna
             indietro. Ora la scelta si fa UNA volta e si BLOCCA per tutta la consegna (`_arRcv`, azzerato quando
             il post-arco riparte e al cambio di scena): una consegna, un ricevente, una conclusione. */
          /* [7.310.0 collaudo PO «azione chip millimetrico a centrocampo/trequarti ha dato vita a una scena
             surreale con assist a un compagno che ha segnato, la palla ha fatto un cerchio su se stesso!»]
             LA PALLA NON TORNA INDIETRO A CERCARE CHI LA DEVE RICEVERE. Il driver della consegna porta il
             pallone su `ricevente + lead`: se il ricevente è DIETRO il punto d'atterraggio — ed è la norma
             quando l'eroe è il giocatore più avanzato della squadra, misurato su gi106: eroe a world x 13.8,
             miglior compagno a 3.2, cioè 10.6u alle sue spalle — la palla arretra un pezzo di campo per
             andargli incontro. Quel tratto all'indietro, sommato alla convergenza laterale, è esattamente
             il «cerchio su se stesso» dello screenshot, e nel frattempo il tabellone assegnava assist e gol.
             Ora il punto d'atterraggio dell'arco è un PAVIMENTO: la palla può assestarsi al massimo ~1.5u
             dietro, poi resta lì e il compagno ci arriva CORRENDO — che è come funziona un filtrante vero
             (la palla si gioca nello spazio, l'uomo ci va). Vale per ogni consegna, non solo per il chip. */
          let _rm=sr.current._arRcv||null;
          if(sr.current._arLandX==null)sr.current._arLandX=ball.position.x;
          if(_rm&&!_rm.parent)_rm=null;/* uscito di scena → si ripesca */
          if(!_rm)sr.current.players.forEach(pp=>{if(pp.mesh&&pp.mesh._rcvT!=null&&pp.mesh._rcvT>=0)_rm=pp.mesh;});
          if(!_rm&&passTargetMesh)_rm=passTargetMesh;/* [7.240.0 gi25/26/43] _rcvT è un GESTO da 0.52s: quando finiva il ricevente spariva da questo driver e nessuno correva più sulla palla — il puntatore persistente lo tiene in corsa fino al tocco */
          /* [7.241.0 batch PO gi28/29/37 «Non si vede il compagno che conclude» — misurato: l'arco atterra a
             1.6u da un compagno e la palla rotola VIA da lui verso _runToX+12 mentre NESSUNO la insegue (mate
             1.6→20.8u, palla parcheggiata 4s)] SELEZIONE D'EMERGENZA: se nessun ricevente è agganciato, il
             compagno più vicino alla PALLA diventa il ricevente — corsa CORTA sul pallone (non la corsa
             profonda +12 delle imbucate), arrivo → tocco → conclusione. Ogni assist_recv ha SEMPRE un uomo. */
          if(!_rm){let _bs56=1e9;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&!src.gk&&pp.mesh!==hero){const _dh53=Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z);const d=Math.hypot(pp.mesh.position.x-ball.position.x,pp.mesh.position.z-ball.position.z)+(_dh53<6?14:0);if(d<_bs56){_bs56=d;_rm=pp.mesh;}}});/* [7.254.0 gi57] stessa penalità ≥6u dall'eroe della selezione primaria */
            if(_rm){passTargetMesh=_rm;_rm._runToX=Math.min(ball.position.x+2,AWAY_GOAL_X-6);_rm._runToZ=ball.position.z;}}
          if(_rm&&sr.current._arRcv!==_rm)sr.current._arRcv=_rm;/* [7.299.0] da qui in poi la consegna e' SUA */
          if(_rm){/* [7.247.0 gi30/gi37 «non si vede il compagno che riceve e calcia»] LA PALLA VA INCONTRO AL
               RICEVENTE: rotolava verso _runToX (un punto fisso avanti) e il gate d'arrivo scattava col compagno
               ancora a 3-6u — il calcio suonava a vuoto. Il passaggio è PER il compagno in corsa: la palla
               converge su di lui (mai più indietro di 2u: niente boomerang), lui la attacca con animOne, e il
               contatto avviene davvero. */
            /* [7.254.0 gi30 «Tiro da troppo lontano — AVVICINALI ALLA PORTA AVVERSARIA»] RENDEZ-VOUS PROFONDO:
               l'incontro palla-ricevente restava a centrocampo (la palla lo aspettava LÌ) e la conclusione
               partiva da lontano. Ora la palla è giocata SULLA CORSA: guida il ricevente di ~7u verso l'area
               (through vero) e si fa raggiungere solo a ridosso del limite (lead→0.6) — l'incontro avviene
               vicino alla porta e da lì si tira (soglia 22w). Passo accoppiato: se la palla scappa oltre 9u
               davanti al compagno rallenta e lo aspetta (gi57 «il pallone viaggia da solo» resta coperto). */
            const _lead54=(_rm.position.x<AWAY_GOAL_X-20)?3.2:0.6;/* [7.255.0 gi30 «si vede un DOPPIO TIRO, il primo da solo»] il lead 7u faceva viaggiare la palla in profondità col ricevente 7 unità DIETRO: quel tratto leggeva come un tiro senza nessuno. A 3.2u la palla resta A UN PASSO dal runner — uomo e pallone sono UN'azione che avanza insieme verso l'area */
            /* [7.397.0 collaudo PO #112/#113 «la palla sbatte addosso al compagno, torna indietro, il compagno la
   raggiunge e poi tira — un vero casino»] DUE PROTEZIONI IN CONTRADDIZIONE. Il pavimento del punto
   d'atterraggio (7.310) impedisce alla palla di tornare indietro; il tetto AWAY_GOAL_X-13 (7.254) tiene
   il punto d'incontro fuori dall'area. Ma il tetto era applicato DOPO il pavimento, e lo schiacciava:
   con un assist atterrato a x 42,3 il pavimento diceva «non sotto 40,8» e il clamp rispondeva «mai sopra
   29,6» — la palla rotolava ALL'INDIETRO di nove unita' per due secondi e mezzo, incontro al ricevente
   che le correva incontro. Misurato sulla scena segnalata (gi113): atterraggio 42,3 → trascinata a 34.
   E il pavimento «mai piu' indietro di 2u» non salvava niente: e' relativo alla palla DI QUESTO
   fotogramma, quindi ogni fotogramma ne concede altri due — un cricchetto rovesciato. Ora il tetto vale
   per il BERSAGLIO DI CORSA (il lead davanti al ricevente), i pavimenti restano sovrani: la palla si
   ferma a un passo dall'atterraggio e aspetta, e il compagno la raggiunge — come nel calcio. */
const _mx47=clamp(Math.max(Math.min(_rm.position.x+_lead54,AWAY_GOAL_X-13),ball.position.x-2,(sr.current._arLandX!=null?sr.current._arLandX-1.5:-99)),-48,GOAL_LINE_X-4);/* [7.310.0] pavimento al punto d'atterraggio: la palla non arretra a cercare il ricevente */
            const _mr52=((ball.position.x-_rm.position.x)>5)?0.7:1.9;
            ball.position.x+=(_mx47-ball.position.x)*Math.min(aDt*_mr52,1);
            ball.position.z+=(_rm.position.z-ball.position.z)*Math.min(aDt*(_mr52*0.83),1);
            /* [7.205.0] stesso difetto del ricevente sul passaggio: il compagno che attacca la palla giocata in
               profondità scivolava a gambe ferme (lerp posizionale). Ora corre davvero, con `animOne`. */
            if(typeof window!=='undefined'&&window.__CPM_REC){_rm._probe56=1;
              const _preX56=_rm.position.x,_preZ56=_rm.position.z;
              const _post56=(_rm._postDrvX!=null)?+(Math.hypot(_preX56-_rm._postDrvX,_preZ56-_rm._postDrvZ)).toFixed(2):null;
              animOne(_rm,ball.position.x,ball.position.z,aDt,ak,ball.position.x,ball.position.z);
              const _own56=+(Math.hypot(_rm.position.x-_preX56,_rm.position.z-_preZ56)).toFixed(2);
              _rm._postDrvX=_rm.position.x;_rm._postDrvZ=_rm.position.z;
              try{window.__CPM_AR54={own:_own56,oth:_post56};}catch(_e){}/* [7.241.0 strumentazione permanente, solo __CPM_REC] attribuzione del moto del ricevente: driver vs altri scrittori — ha inchiodato l'inversione a U del modello di sterzata */
            } else animOne(_rm,ball.position.x,ball.position.z,aDt,ak,ball.position.x,ball.position.z);}
          ball.position.y+=(0.65-ball.position.y)*Math.min(aDt*7,1);
          // 5.43.7: per lo SCARICO SULLA FASCIA (SWITCH) il ricevente è LARGO → non tira da lì (irrealistico): CROSSA al centro dove un compagno vicino alla porta finalizza (cross_goal). Per il verticale resta assist_shot.
          /* [7.232.0 #40 collaudo PO «la palla vola in porta senza alcuna dinamica realistica» + misura: tiro
             del compagno da game x≈40] IL COMPAGNO NON SPARA DA CENTROCAMPO. La transizione ricezione→tiro era
             cieca alla posizione: sul lancio lungo il ricevente prendeva palla nella propria metà e da lì
             partiva una «bomba» che volava in rete da 50u. Se al tocco la palla è LONTANA dalla porta (x<20
             world = game 70) il secondo tempo diventa una CONSEGNA IN AREA finalizzata da un terzo uomo
             (cross_goal: consegna → incornata → rete, path esistente e collaudato) — calcio vero: ricevi il
             lancio, servi in area, un compagno conclude. In range il tiro diretto resta bit-identico.
             (⚠️ prima stesura: «il ricevente conduce finché non è in range» — STALLAVA: `_rm` sparisce quando
             il gesto _rcvT termina e la palla restava ferma a metà campo per sempre; misurato e buttato.) */
          /* [7.240.0 gi25/26/43 «Non si vede il compagno che riceve e tira»] LA PALLA PARTE QUANDO IL COMPAGNO
             ARRIVA: la transizione ricezione→tiro era a TEMPO FISSO (0.42s) — col ricevente ancora a 8-15u il
             pallone volava in porta DA SOLO e il gesto di calcio (7.209) suonava a vuoto. Ora si conclude
             quando il ricevente è SUL pallone (<2.2u, minimo 0.30s di respiro) o al fallback 3.0s (misurato:
             chiude da ~15u in ~2-2.5s di scene-time — la corsa sul filtrante È la scena). */
          const _rmNear240=_rm?Math.hypot(_rm.position.x-ball.position.x,_rm.position.z-ball.position.z):99;
          if(typeof window!=='undefined'&&window.__CPM_REC){try{const _pd=_rm&&_rm._pd56!=null?+( _rmNear240-_rm._pd56).toFixed(2):null;if(_rm)_rm._pd56=_rmNear240;window.__CPM_AR53={d:+_rmNear240.toFixed(1),dd:_pd,t:+hlPostArcT.toFixed(2),rx:_rm?+_rm.position.x.toFixed(1):null,rz:_rm?+_rm.position.z.toFixed(1):null,rto:_rm&&_rm._runToX!=null?+_rm._runToX.toFixed(1):null,cx:_rm&&_rm._ctx!=null?+_rm._ctx.toFixed(1):null,cz:_rm&&_rm._ctz!=null?+_rm._ctz.toFixed(1):null,bx2:+ball.position.x.toFixed(1),bz2:+ball.position.z.toFixed(1),ptm:_rm===passTargetMesh,drv:((window.__CPM_AR53&&window.__CPM_AR53.drv)||0)+1};}catch(_e){}}/* [7.241.0 strumentazione, solo __CPM_REC] distanza del ricevente GUIDATO dalla palla + delta per-frame + identita col puntatore + contatore vitalita driver */
          /* [7.249.0 gi30/37/57 «non si vede il compagno che RICEVE»] beat di CONTROLLO: al contatto la palla
             si FERMA sul piede del ricevente per ~0.38s (lo stop è il gesto della ricezione) e SOLO POI parte
             la conclusione — prima il tocco e il calcio erano lo stesso istante. Il fallback 2.6s salta il
             beat (palla mai arrivata al piede = niente controllo da mostrare). */
          const _atGate49=(_rmNear240<2.2&&hlPostArcT>=0.30),_fb49=hlPostArcT>=2.6;
          if(_atGate49&&!_fb49&&sr.current._rcvCtl==null){sr.current._rcvCtl=0.55;if(_rm)sr.current._mateFx={mesh:_rm,name:"receive",t:0.6};}/* [7.251.0 gi30/57 «non si vede il compagno che riceve»] al contatto il ricevente SUONA il controllo (clip receive a 3.2×) e il beat sale a 0.55s: lo stop orientato È la ricezione */
          if(_atGate49&&!_fb49&&sr.current._rcvCtl>0){sr.current._rcvCtl-=aDt;
            if(_rm){ball.position.x=_rm.position.x+0.7;ball.position.z=_rm.position.z;if((sr.current._ws524=9)&&sr.current._bj0)(sr.current._bj0.src='ricevente-pass',sr.current._bj0.srcs.push('ricevente-pass'));}
          }
          if((_atGate49&&(sr.current._rcvCtl==null||sr.current._rcvCtl<=0))||_fb49){sr.current._rcvCtl=null;/* [7.247.0] col pallone che va incontro al ricevente il CONTATTO è reale: raggio 3.4→2.2 (il calcio parte con la palla sul piede, non a 3 metri) */hlPostArcType=(P.hlPattern==="SWITCH"||ball.position.x<22)?"cross_goal":"assist_shot";hlPostArcT=0;contactFlashT=0;/* [7.243.0 gi30 «Non si vede il compagno che riceve e conclude»] arrivo a 3.4u (misurato: l'inseguimento tocca il minimo a ~3.6 e poi ondeggia — il tocco parte sul passo più vicino, come una conclusione di prima) · fallback 3.0→2.6s · [7.246.0 gi29 «Conclusione da posizione troppo lontana»] tiro diretto solo dal raggio credibile: sotto, il ricevente SERVE IN AREA e conclude il terzo uomo · [7.253.0 gi57 «non si vede il compagno che riceve e CALCIA»] soglia 30→22 world: chi riceve entro ~22m (game ≥72 — misurato il ricevente di fascia a 24.9 world costretto a una SECONDA consegna illeggibile) TIRA davvero; il centrocampo resta consegna (gi29/30) */
            /* [7.209.0 collaudo PO «il pallone non sembrava calciato ma partiva e volava su traiettorie
               predefinite»] È IL COMPAGNO CHE CALCIA: fino a qui il pallone partiva verso la porta mentre chi
               concludeva restava in corsa (nessun gesto era registrato sui giocatori diversi dall'eroe e dai
               portieri). Ora chi finalizza chiede la propria clip di calcio nell'istante esatto del tocco. */
            if(_rm){sr.current._mateFx={mesh:_rm,name:"kick",t:0.55};_versoPorta673(_rm,"kick");if(_CPM_TEST&&typeof window!=='undefined'){try{const _c=window.__CPM_MATEFX||(window.__CPM_MATEFX={kick:0,header:0,trans:0,noMesh:0});_c.kick++;}catch(_e){}}}
            else if(_CPM_TEST&&typeof window!=='undefined'){try{const _c=window.__CPM_MATEFX||(window.__CPM_MATEFX={kick:0,header:0,trans:0,noMesh:0});_c.noMesh++;}catch(_e){}}
            if(_CPM_TEST&&typeof window!=='undefined'){try{const _c=window.__CPM_MATEFX||(window.__CPM_MATEFX={kick:0,header:0,trans:0,noMesh:0});_c.trans++;}catch(_e){}}}}
        else if(hlPostArcType==="assist_shot"){// assist → compagno tocca → tiro verso AWAY_GOAL_X
          // [6.93.0 collaudo PO «nella prima azione il pallone ENTRA IN PORTA ma il gol non viene assegnato, poi
          //   parte la chance»] su esito CHANCE il tiro del compagno è RESPINTO PRIMA della linea: bersaglio più
          //   corto (bordo area, non la porta), respinta anticipata (u≥0.72) e TUFFO VERO del portiere → si legge
          //   «occasione parata», mai una rete che si gonfia senza gol. L'assist vero (gol assegnato) è invariato.
          const _isCh93=P.hlOutcomeKind==="chance";
          const _u3=Math.min(hlPostArcT/0.80,1);
          ball.position.y=0.65+Math.sin(_u3*Math.PI)*3.2;
          ball.position.x+=((AWAY_GOAL_X-(_isCh93?7:2))-ball.position.x)*aDt*3.2;ball.position.z*=(1-aDt*1.6);
          if(_isCh93&&_u3>=0.72){
            if(awayGkMesh&&!oppActType){oppActType="gk_dive";oppActT=0;oppMesh=awayGkMesh;oppDiveDir=ball.position.z>=oppMesh.position.z?1:-1;oppMesh._divePz=oppMesh.position.z;oppMesh._diveYaw=oppMesh.rotation.y;oppMesh._diveToZ=clamp(oppMesh.position.z+(ball.position.z-oppMesh.position.z)*0.55,oppMesh.position.z-6,oppMesh.position.z+6);}
            hlPostArcType="deflect";hlPostVY=6;hlPostVZ=(Math.random()-0.5)*8;hlPostArcT=0;contactFlashT=0;}
          else{
            /* [7.407.0 collaudo PO gi118 «il portiere non tenta mai la parata» su assist] IL GOL DEL
               COMPAGNO MERITA UN TUFFO. Il tuffo era armato solo dal ramo CHANCE (la respinta lo esige);
               sul ramo GOL la palla entrava in rete col portiere di pietra — misurato: 0,0 unita' di
               spostamento su due repliche mentre la palla supera il piano dei pali. Ora si tuffa anche
               qui, BATTUTO: direzione giusta, allungo corto (0,3 contro 0,55) — arriva tardi, come un
               portiere battuto vero. Armato a u 0,55: il tuffo parte mentre la palla viaggia, non dopo. */
            if(_u3>=0.55&&awayGkMesh&&!oppActType){oppActType="gk_dive";oppActT=0;oppMesh=awayGkMesh;oppDiveDir=ball.position.z>=oppMesh.position.z?1:-1;oppMesh._divePz=oppMesh.position.z;oppMesh._diveYaw=oppMesh.rotation.y;oppMesh._diveToZ=clamp(oppMesh.position.z+(ball.position.z-oppMesh.position.z)*0.3,oppMesh.position.z-4,oppMesh.position.z+4);}
            if(_u3>=1){hlPostArcType="in_net";hlPostArcT=0;hlInNetFlashed=false;contactFlashT=0;}}}// [5.78.0 SIT-4] chance ⇒ mai rete // 3DV-14: flash al secondo tocco
        else if(hlPostArcType==="deflect"){// 3DV-14: deflect con fisica rimbalzo (gravity + restituzione)
          hlPostVY-=aDt*22;// gravità
          ball.position.y+=hlPostVY*aDt;
          if(ball.position.y<=0.65&&hlPostVY<0){ball.position.y=0.65;hlPostVY*=-0.30;contactFlashT=0;}// rimbalzo + flash
          ball.position.z+=hlPostVZ*aDt;hlPostVZ*=(1-aDt*3.2);
          // [5.83.0 IA-1/IA-2a] FIX reverse-boomerang: il pull verso il terzo offensivo vale SOLO per le
          //   CONCLUSIONI (la palla è già lì); un passaggio/dribbling perso a centrocampo si assesta sul punto
          //   d'intercetto (prima planava da sola fino all'area avversaria: possesso «all'avversario» in porta!).
          //   E un tiro FUORI supera la linea di fondo (palla oltre la porta, non rimbalzo-fantasma in campo).
          {if(P.hlOutcomeKind==="corner"&&crowdOhT<0)crowdOhT=0;/* [6.4.5 R5.1] ATMO: il pubblico reagisce al corner conquistato (come su palo/parata) */
           const _sf83=(P.hlType==="shot"||P.hlType==="penalty"||P.hlType==="freekick"||P.hlType==="header");
           const _wide83=(_sf83&&(P.hlOutcomeKind==="wide"||P.hlOutcomeKind==="out"))||(P.hlOutcomeKind==="corner");/* [6.4.1 R2.2] corner = palla oltre la linea di fondo (come out) · [7.113.0 audit massivo · fix E1] il CORNER vale per QUALSIASI hlType (prima solo shot-family: un CROSS deviato in angolo restava nel cuore dell'area mentre cronaca+pubblico annunciavano il corner) */
           const _lossK83=!_sf83&&P.hlType!=="cross"&&["intercepted","dispossessed","lost","stopped","shielded_out","overhit","offside","fouled","missed","deflected_out","win_freekick"].indexOf(P.hlOutcomeKind)>=0;// perdite di possesso + fallo/contrasto mancato ([6.76.0 LMV-B2]: fouled/missed/deflected_out/win_freekick planavano ancora verso il terzo offensivo — reverse-boomerang residuo)
           if(_lossK83&&sr.current._lossK403!==P.hlSitKey){sr.current._lossK403=P.hlSitKey;sr.current._lossAx403=ball.position.x;}
           /* [7.618.0 — SPRINT «PARTITA VERA»: LA PALLA VAGANTE HA UN RACCOGLITORE. Rosso __CPM_NO618]
              COLLAUDO PO, due appunti con la stessa causa MISURATA (sonda dribble-618, gi21 con esito
              forzato): «nel dribbling il pallone e l'eroe si separano, max 14,2u» e «deflect che
              parcheggia a x 89». La traccia: dopo una perdita/deviazione la palla SCIVOLA DA SOLA a
              2-3 u/s verso il punto d'assestamento (misurato: parcheggio a x 88,7 col piu' vicino a
              8-10u) e NESSUNO va a prenderla — l'audit del pallone l'aveva gia' scritto: «settle del
              deflect senza che nessuno la giochi», «nessuna seconda palla». Il raccoglitore esiste
              (_pkCol415, driver a r.~4958) ma lo armava solo il poke del dribbling perso. Qui lo arma
              anche il settle: il piu' vicino AVVERSARIO di campo (non portiere) va a raccogliere il
              pallone che l'esito gli ha assegnato — e' la meta' visiva della seconda palla (§6 PO). */
           if(!(typeof window!=='undefined'&&window.__CPM_NO618)&&!_wide83&&!P.hlDef&&!sr.current._pkCol415&&hlPostArcT>0.5){/* [7.618.0] criterio semplice e calcistico: palla ancora IN CAMPO (non wide/out/corner) su scena d'attacco — chiunque l'abbia sporcata, qualcuno va a prendersela. La prima stesura escludeva la famiglia tiro (solo _lossK83) ed e' stata beccata dal debug: deflect vivo, kind intercepted, raccoglitore mai armato */
             let _cm618=null,_cd618=1e9;
             sr.current.players.forEach((pp,ii)=>{const _s6=(P.allPlayers||[])[ii];
               if(!_s6||_s6.team!=='away'||_s6.gk||!pp.mesh)return;
               const _d6=Math.hypot(pp.mesh.position.x-ball.position.x,pp.mesh.position.z-ball.position.z);
               if(_d6<_cd618){_cd618=_d6;_cm618=pp.mesh;}});
             if(_cm618&&_cd618<26)sr.current._pkCol415={m:_cm618,k:P.hlSitKey};
             if(typeof window!=='undefined'&&window.__CPM_COL618!==undefined){try{window.__CPM_COL618={armed:!!_cm618,d:+_cd618.toFixed(1),k:P.hlOutcomeKind||null,loss:_lossK83?1:0};}catch(_e){}}
           }
           if(typeof window!=='undefined'&&window.__CPM_COL618!==undefined&&window.__CPM_COL618&&window.__CPM_COL618.seen===undefined){try{window.__CPM_COL618.seen={pa:'deflect',k:P.hlOutcomeKind||null,ht:P.hlType||null,def:P.hlDef?1:0,col:!!sr.current._pkCol415};}catch(_e){}}
           const _tx83=_wide83?(AWAY_GOAL_X+2.5):_lossK83?clamp(Math.min(10,Math.max(ballArcTgtX!=null?ballArcTgtX:ball.position.x,-4.8)),(sr.current._lossAx403!=null?sr.current._lossAx403:ball.position.x)-9,(sr.current._lossAx403!=null?sr.current._lossAx403:ball.position.x)+9)/* [7.403.0 collaudo PO gi71 «finta non sincronizzata» · gi123 «passaggio all'indietro senza senso»] LA PALLA PERSA RESTA DOV'E' STATA PERSA. Il tetto di centrocampo (7.115) valeva da QUALUNQUE distanza: un dribbling perso a x 36 rotolava all'indietro di 25,6 unita' fino a x 10 mentre l'eroe correva avanti — misurato. L'avversario vince il pallone sul punto del contrasto: l'assestamento non si allontana piu' di 9 unita' dal PUNTO DI PERDITA, catturato UNA volta all'avvio della perdita — relativo alla palla del fotogramma corrente sarebbe il cricchetto rovesciato del 7.397, che regala 9 unita' a fotogramma (misurato: primo tentativo cosi', ritracciamento identico). */:(_sf83||P.hlType==="cross")?(AWAY_GOAL_X-7):Math.min(AWAY_GOAL_X-7,G2X(clamp((P.playerX||50)+16,52,74)));// clamp a game-x≥45.2: il check final-state pretende gx≥45 sui "miss" · [7.115.0 audit · fix E4] CAP superiore (world +10 ≈ centrocampo/trequarti): una PERDITA di possesso (intercetto/dispossessed su lancio profondo) non si assesta più nel terzo avversario («palla nostra vicino alla loro porta dopo un pallone perso») — l'avversario che vince palla la riporta indietro · [7.247.0 gi37 «troppo distante il tiro»/«non si vede il portiere»] il pull fino a x86 vale SOLO per le CONCLUSIONI (tiro/testa/set-piece/cross, dove la palla è già lì): un «miss» ambiguo di corsa/passaggio (taglio, sponda) si assesta a +16 dal punto d'azione (52-74) — prima rotolava 40 unità fin quasi alla porta e leggeva come un tiro siderale con GK immobile
           if(!P.hlDef)ball.position.x+=(_tx83-ball.position.x)*Math.min(aDt*1.6,1);
           /* [7.533.0 MP-0e — indagine 003, ipotesi H3] IL «FUORI» ESCE DALLO SPECCHIO: il settle del tiro
              wide/out/corner porta la x oltre la linea (AWAY_GOAL_X+2.5 ≈ 48,5) ma lasciava la z dov'era
              l'arco — un tiro «di poco a lato» quasi centrale moriva DENTRO lo specchio (|z|<3,66) col
              guardiano geometrico spento (il suo gate esige post-arco nullo, e qui il deflect e' vivo
              2,5s): geometria esatta del caso gi45. Ora, oltre la linea e dentro lo specchio, la z scivola
              oltre il palo dal verso gia' preso dalla palla — la stessa espulsione del guardiano 7.530,
              anticipata nel canale che la rendeva cieca. Rosso __CPM_NO546. */
           if(_wide83&&!P.hlDef&&!(typeof window!=='undefined'&&window.__CPM_NO546)&&ball.position.x>GOAL_LINE_X-1.5&&Math.abs(ball.position.z)<3.66){
             const _zw546=((Math.abs(ball.position.z)>0.25?ball.position.z:(ballArcTgtZ||1))>=0)?4.5:-4.5;
             ball.position.z+=(_zw546-ball.position.z)*Math.min(aDt*5,1);
             if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&sr.current._netLog546!==P.hlSitKey+"|wide"){sr.current._netLog546=P.hlSitKey+"|wide";try{const _n5=(window.__CPM_NET546=window.__CPM_NET546||[]);if(_n5.length<60)_n5.push({ch:"wide_slide",ht:P.hlType||null,rew:P.hlReward||null,ok:P.hlOutcomeKind||null,cert:0});}catch(_e){}}}}/* [7.251.0 gi35/54 «il pallone deve andare avanti / non deve tornare indietro»] il settle dei miss è roba d'ATTACCO: sugli HL difensivi il beaten manda la palla in avanti col contropiede e questo pull (px+16 verso la porta avversaria) la RITRASCINAVA indietro = inversione visibile. La palla difensiva è del _defTraj, il settle non la tocca */
          if(hlPostArcT>2.5){hlPostArcT=-1;hlPostArcType=null;hlPostVY=0;hlPostVX=0;}}
        if(_pa557&&ball&&(Math.abs(ball.position.x-_pa557.x)+Math.abs(ball.position.y-_pa557.y)+Math.abs(ball.position.z-_pa557.z))>1e-6){
          const _nm557='esito:'+(_pt557||'?');
          if((sr.current._ws524=16)&&sr.current._bj0){sr.current._bj0.src=_nm557;sr.current._bj0.srcs.push(_nm557);}}}
      /* [7.214.0 revisione PO — le azioni aeree partivano con la palla a terra] QUOTA DI CONTATTO.
         Fuori dall'arco il pallone tornava SEMPRE a 0.65 (sull'erba). Nelle situazioni che il motore classifica
         `aerial` (cross che pende, corner, rimbalzo, sponda) questo è il difetto che il PO vede: si sceglie una
         rovesciata mentre la palla è ferma per terra, e l'incornata colpisce l'erba. Ora, nelle fasi di lettura
         dell'highlight, il pallone STA IN ARIA alla quota a cui verrà colpito — diversa per gesto (testa alla
         fronte, volée/rovesciata al collo del piede alto) — con un respiro appena percettibile che lo fa leggere
         sospeso in volo e non incollato a mezz'aria. Il post-arco e l'arco d'esito restano padroni della quota. */
      /* [7.218.0 revisione PO «non si capisce assolutamente che e un dribbling»] IL PALLONE RESTA AI PIEDI.
         Finita la spinta, la palla restava ferma dove era arrivata mentre l'eroe le correva accanto: a schermo
         un pallone solo nell'erba, con l'uomo di fianco. Un dribbling riuscito e CONDUZIONE — il pallone
         accompagna chi lo porta (stesso principio del beat `carry` del build-up, 5.43.5). Solo sul dribbling
         RIUSCITO: se l'eroe lo perde, la palla deve restare all'avversario. */
      else if(isResult&&P.hlType==="dribble"&&P.hlSuccess===true&&!P.hlDef&&hero){
        const _fx=Math.sin(hero.rotation.y),_fz=Math.cos(hero.rotation.y);
        const _cx=hero.position.x+_fx*1.35,_cz=hero.position.z+_fz*1.35,_ck=Math.min(aDt*7,1);
        ball.position.x+=(_cx-ball.position.x)*_ck;ball.position.z+=(_cz-ball.position.z)*_ck;
        ball.position.y+=(0.42-ball.position.y)*Math.min(aDt*6,1);}
      else{const _aY=aerialContactY(P,isHL,isResult,sr.current._preStrike);
        /* [7.389.0 collaudo PO #87 «il pallone deve essere a terra, tra i piedi dell'eroe, e non a mezza
           altezza all'inizio della scena»] UN PALLONE ADDOSSO A UN UOMO STA AI SUOI PIEDI.
           La riga qui sotto tiene in quota il pallone di una scena AEREA, e il suo argomento e' giusto: se
           la situazione nasce da un cross che sta arrivando, farlo salire dall'erba sarebbe la stessa
           bugia al rallentatore. Ma quell'argomento vale finche' il pallone e' DAVVERO IN VOLO. Dal 7.370
           la consegna nasce dai piedi di un compagno vero, e su una scena aerea quel compagno si trovava
           con la palla sospesa all'altezza del petto, ferma, per una dozzina di fotogrammi: da fuori non
           si legge «cross in arrivo», si legge «il pallone non e' nei piedi di nessuno».
           MISURATO col nuovo guardiano scene-open-ball-test.mjs: sei aperture su quarantotto con il pallone
           a meno di tre unita' da un compagno e a 1,68-1,83 di quota, per 5-14 fotogrammi di fila.
           Adesso la quota resta ALTA solo quando nessuno ce l'ha addosso; se un compagno e' li', il pallone
           scende ai suoi piedi — ed e' da li' che parte, come parte ogni consegna. */
        const _addosso389=(function(){try{if(_aY==null)return false;let _d=1e9;
          const _pl=sr.current.players||[];for(let _i=0;_i<_pl.length;_i++){const _src=(P.allPlayers||[])[_i],_m=_pl[_i]&&_pl[_i].mesh;
            if(!_src||!_m||_src.team!=='home'||_src.gk)continue;
            const _q=Math.hypot(_m.position.x-ball.position.x,_m.position.z-ball.position.z);if(_q<_d)_d=_q;}
          return _d<=3.4;}catch(_e){return false;}})();/* la soglia e piu larga di quella con cui il guardiano giudica (3u): il pallone dev essere ai piedi con margine, non al limite esatto */
        if(_aY!=null&&_addosso389){ball.position.y=(ball.position.y>1.2)?Math.max(0.65,ball.position.y-Math.max(0.35,aDt*9)):0.65;}/* [7.389.0] la discesa e RAPIDA ma non istantanea: da 1,85 al piede in poco piu di un decimo. Con lo smorzamento esponenziale di prima restavano una dozzina di fotogrammi a mezza altezza, cioe esattamente cio che il PO vede */
        else if(_aY!=null){_aerT+=dt;const _fl=_aY+Math.sin(_aerT*2.1)*0.09;if(ball.position.y<_aY-0.8)ball.position.y=_fl;/* la scena AEREA si apre col pallone gia per aria: farlo salire dall'erba sarebbe la stessa bugia al rallentatore */else ball.position.y+=(_fl-ball.position.y)*Math.min(aDt*4.5,1);}/* accumulatore proprio: con dt=0 (freeze del gate) il respiro si ferma → screenshot deterministici */
        else ball.position.y+=(0.65-ball.position.y)*Math.min(aDt*6,1);}// y rest 0.65
      ballHalo.position.copy(ball.position);
      const _hTgt=isHL?0.10:(_no534?0.04:0.085);ballHalo.material.opacity+=(_hTgt-ballHalo.material.opacity)*Math.min(dt*3,1);// 3DV-1: opacità halo ridotta (era 0.18/0.08) · [7.529.0 NO534] in cronaca l'alone torna a farsi vedere: e' il «dov'e' la palla» dietro i corpi
      const moved=Math.hypot(ball.position.x-obx,ball.position.y-oby,ball.position.z-obz);
      // QW-B: rotazione fisica — asse determinato dalla direzione di movimento
      const _bvx=ball.position.x-obx,_bvz=ball.position.z-obz;
      const _rotF=2.4+moved*0.8;ball.rotation.z-=_bvx*_rotF;ball.rotation.x+=_bvz*_rotF;ball.rotation.y+=0.015;
      // QW-A: contact flash — impulso di scala pallone al kick/header (0.18s)
      /* [7.529.0 collaudo PO «e' molto piccolo» — rosso __CPM_NO534] Il 3DV-12 renderizzava il pallone al
         68% proprio in CRONACA, dove la camera e' la piu' larga: raggio effettivo ~0,22 — un puntino dal
         divano. Scala di LEGGIBILITA' invertita: 1,10 in playing (r eff ~0,35, stile FM), gli highlight
         restano alla misura di sempre (0,53 a camera stretta: li' la palla riempie gia' lo schermo). */
      const _bBase534=_no534?(0.68-camHL*0.15):(1.10-camHL*0.57);
      if(contactFlashT>=0){contactFlashT+=dt;const _cf=Math.max(0,1-contactFlashT/0.12);
        ball.scale.setScalar(_no534?(1+_cf*0.22):(_bBase534*(1+_cf*0.30)));ballHalo.material.opacity=Math.max(ballHalo.material.opacity,_cf*0.28);// 3DV-1: flash più sottile (NO534: assoluto storico; nuovo: relativo alla base, cosi' il flash INGRANDISCE sempre)
        // LT-1: ring espande da 1× a 3.8× e svanisce in 0.20s
        ctFlash.position.x=ball.position.x;ctFlash.position.z=ball.position.z;ctFlash.scale.setScalar(1+(1-_cf)*2.8);ctFlash.material.opacity=_cf*0.60;
        if(contactFlashT>0.20)contactFlashT=-1;}
      else{ball.scale.setScalar(_bBase534);ctFlash.material.opacity=0;}// 3DV-12: 0.68 playing → 0.53 close HL (was 1.0) · [7.529.0 NO534] vedi _bBase534
      if(_bShadow534.visible){_bShadow534.position.x=ball.position.x;_bShadow534.position.z=ball.position.z;
        const _bh534=Math.max(0,ball.position.y-0.65);
        _bShadow534.scale.setScalar(Math.max(0.55,ball.scale.x*(1+Math.min(_bh534*0.16,0.8))));
        _bShadow534.material.opacity=Math.max(0.16,0.80-_bh534*0.20);}/* piu' vola, piu' l'ombra si allarga e si spegne — e' lei che dice DOVE ricade */
      const bx=ball.position.x,bz=ball.position.z;
      const isWalk=P.matchPhase==="walkout";
      // item 2 (5.49.6): edge del trigger d'ingresso subentrante → l'eroe parte dalla LINEA LATERALE (area tecnica home) e avvia la sequenza.
      {const _se=P.subEntry||0;if(_se&&_se!==_lastSubEntry){_lastSubEntry=_se;subEntryT=0;subExitT=-1;hero.visible=true;hero._benched=false;hero.position.set(-6,0,-35.5);hero._px=-6;hero._pz=-35.5;hero._sp=0;hero._subVar=(P.subEntryVar||0)%5;/* [7.126.0] variante d'ingresso catturata al trigger (stabile per l'animazione) */}}
      if(_CPM_TEST&&typeof window!=='undefined'&&window.__CPM_FORCE_SUBENTRY!=null){const _fv=window.__CPM_FORCE_SUBENTRY;window.__CPM_FORCE_SUBENTRY=null;subEntryT=0;subExitT=-1;hero.position.set(-6,0,-35.5);hero._px=-6;hero._pz=-35.5;hero._sp=0;hero._subVar=_fv%5;hero.visible=true;hero._benched=false;/* [7.126.0] hook test: forza l'ingresso con variante scelta (solo cpmtest) */}
      // [7.127.0] USCITA dal campo (sostituzione): edge → cattura la posizione CORRENTE come partenza, poi cammina al dugout
      {const _sx=P.subExit||0;if(_sx&&_sx!==_lastSubExit){_lastSubExit=_sx;subExitT=0;subEntryT=-1;hero.visible=true;hero._benched=false;hero._exVar=(P.subExitVar||0)%5;hero._exSx=hero.position.x;hero._exSz=hero.position.z;}}
      if(_CPM_TEST&&typeof window!=='undefined'&&window.__CPM_FORCE_SUBEXIT!=null){const _xv=window.__CPM_FORCE_SUBEXIT;window.__CPM_FORCE_SUBEXIT=null;subExitT=0;subEntryT=-1;hero.visible=true;hero._benched=false;hero._exVar=_xv%5;hero._exSx=hero.position.x;hero._exSz=hero.position.z;/* [7.127.0] hook test: forza l'uscita con variante scelta (solo cpmtest) */}
      if(subEntryT>=0)subEntryT+=dt;
      if(subExitT>=0)subExitT+=dt;
      if((P.ceremony||P.shootout)&&hero._benched){hero._benched=false;hero.visible=true;subExitT=-1;/* [7.127.0] un eroe uscito ricompare per premiazione/rigori (mai bloccato invisibile) */}
      // transizioni di fase: trigger animazione esito + gestione buffer/replay
      const _curPh=P.matchPhase;
      if(_curPh!==prevPhase){
        if(_curPh==="hl_result"){fireConclusion=()=>{const P=propsRef.current;sr.current._ccx460=P;/* [7.460.0] IL CONTESTO DELLA CONCLUSIONE SI DICHIARA QUI, AL LANCIO — stessa cura dello `stageStamp` del 7.456: il blocco di completamento dell'arco (r.~12420) lo leggeva dal fotogramma in cui la palla atterra, e su una parte dei gol quel fotogramma cade quando i props della scena sono gia' stati svuotati (misurato: atterraggio con `ht=null hs=null rew=null`, catena dei rami che non trova nulla, nessun post-arco, palla ferma a x 42,7 mentre il tabellone conta il gol). */if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _ac=(window.__CPM_ARCCALL457=window.__CPM_ARCCALL457||[]);if(_ac.length<40)_ac.push({ph:P.matchPhase||null,ht:P.hlType||null,hs:P.hlSuccess,rew:P.hlReward||null,pat:P.hlPattern||null});}catch(_e){}}let t=P.hlType;/* [7.346.0] `let`: il ramo d'ARCO si dirama su `t`, non su `actType` — per questo il precedente su `build` correggeva il gesto ma lasciava la traiettoria in porta. La rimappatura dell'assist (poche righe sotto) agisce su ENTRAMBI. L'estrattore analitico del check data-coherence passa `t` come parametro alla sua IIFE e parte dal marcatore `const _rz=` che sta a valle: la sua valutazione resta indipendente da questa riassegnazione. */actType=(t==="header"||t==="tackle"||t==="dribble"||t==="cross"||t==="penalty"||t==="freekick"||t==="pass"||t==="build")?t:(!t)?"build":"shot";actT=0;sr.current._actSitKey403=P.hlSitKey;/* [7.403.0] l'azione appartiene a QUESTA scena: la mappa gesti non monta niente finche' la chiave non coincide */// CINE-VAR: build ora ha animazione propria; null type → "build" (gesto neutro)
          // 5.43.5: CONDUZIONE PERSA — un BALL_CARRY FALLITO non è un tiro sbagliato ma una palla persa al TACKLE: il difensore entra in SCIVOLATA e la porta via (niente conclusione di tiro)
          if((P.hlPattern==="BALL_CARRY"||t==="dribble"||(t==="build"&&P.hlReward==="goal"&&/intercept|dispos|beaten|tackl|foul|freekick/i.test(P.hlOutcomeKind||"")))&&P.hlSuccess===false){/* [7.235.0 #51 batch PO «il dribbling non si vede» sui FALLITI] il fail del dribbling era un rimbalzino di 4u in 0.34s sotto l'overlay (misurato: arco a ~220-410ms, tutto finito a ~1.1s) — ora OGNI dribbling fallito usa il trattamento COLLAUDATO del BALL_CARRY: il difensore entra in scivolata e PORTA VIA il pallone, il duello si legge · [7.244.0 gi46 «Taglio verso l'area» FALLITO «non si vede il gesto tecnico»] un BUILD con reward GOAL è per costruzione una CORSA a finalizzare (taglio/inserimento): il suo fallimento è la palla persa nel duello, non un tiro sbagliato — stesso trattamento, strutturale (niente testo a runtime) */
            actType=(t==="dribble")?"dribble":"build";actT=0;// nessuno swing di tiro: l'eroe viene contrastato/* [7.358.0 collaudo PO #18/#104/#154 «dribbling confusionario», «doppio passo sul posto senza palla»] IL DRIBBLING FALLITO NON ERA UN DRIBBLING. Questo ramo (5.43.5) rimappava OGNI conduzione persa su `build` per evitare lo swing di tiro — ma `build` significa due cose che qui mentono: la tabella d'avanzamento gli da' 2,5u invece di 10 (l'eroe fa due passi e torna indietro) e la mappa GLB manda `build` sulla clip `dribble` (il corpo dribbla comunque). Misurato: eroe avanti 2,0u e RIENTRO 2,0u mentre la palla finiva a 14-26u. Su un `dribble` lo swing di tiro non c'era mai stato: il nome resta quello vero, la scivolata dell'avversario (poche righe sotto) e' invariata. */
            let _nd=99,_nm=null;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='away'&&!src.gk){const d=Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z);if(d<_nd){_nd=d;_nm=pp.mesh;}}});
            if(_nm){oppActType="opp_tackle";oppActT=0;oppMesh=_nm;oppMesh._divePz=_nm.position.z;oppDiveDir=_nm.position.z>=0?1:-1;oppMesh._slideToX=hero.position.x+0.5;oppMesh._slideToZ=hero.position.z;
              /* [7.249.0 gi38 misurato: il «tocco» del duello volava 28u fino a un raccoglitore lontano = ancora
                 un lancio percepito] la palla persa nel contrasto viene POKATA VIA di poco (≤9u nella direzione
                 del raccoglitore): è lui che viene a prendersela, non il pallone che vola da lui. */
              const _ddx49=_nm.position.x-hero.position.x,_ddz49=_nm.position.z-hero.position.z,_dl49=Math.hypot(_ddx49,_ddz49)||1,_cl49=Math.min(_dl49,9);
              ballArcT=0;ballArcActive=true;ballArcIsBG=true;ballArcProf=null;ballArcTgtY=0.65;ballArcH=0.5;ballArcDur=0.42;ballArcTgtX=hero.position.x+_ddx49/_dl49*_cl49;ballArcTgtZ=hero.position.z+_ddz49/_dl49*_cl49;contactFlashT=0;
              sr.current._mateFx={mesh:_nm,name:"tackle",t:1.1};/* [7.250.0 gi38] il difensore che entra sul pallone SUONA la clip scivolata (GLB) — la slide procedurale era invisibile sotto il CH38 */
              sr.current._pkCol415={m:_nm,k:P.hlSitKey};/* [7.415.0 gi71] e a scivolata finita va a RACCOGLIERE il pallone pokato (driver nel blocco anim). CHIAVATO alla scena: il primo giro senza chiave e' stato beccato dal check motion del gate (gi2, difensori a 27,1u dal portatore) — nel flusso del gate un raccoglitore stantio trascinava un difensore della scena VECCHIA dietro alla palla nuova */}
            else{ballArcActive=false;}
            return;// salta l'arco di tiro
          }
          if(t==="build"&&P.hlReward==="goal"&&P.hlOutcomeKind!=="chance")actType="shot";/* [7.244.0 gi46 «Taglio verso l'area» «non si vede il gesto tecnico»] la CORSA che FINALIZZA (build+reward goal) si conclude con un TIRO visibile — successo (rete) o esito parata/palo/fuori: il gesto neutro build era un cenno invisibile mentre l'arco volava comunque in porta. Il caso chance (7.8.10, catena che finalizza) resta neutro: lì l'eroe non tira */
          else if(t==="build"&&P.hlReward==="assist"&&P.hlOutcomeKind!=="chance"&&!P.hlOffBall)actType="pass";/* [7.346.0 collaudo PO «assist di tacco: attacca il pallone con la testa, ma ho il pallone tra i piedi»] UN ASSIST NON SI TIRA IN PORTA. La regola qui sopra esisteva per `build` e mancava per `shot`: 75 azioni su 573 hanno premio ASSIST dentro una situation che deriveHL classifica `shot`, e tutte finivano nel ramo d'arco del TIRO — bersaglio la porta. Misurato su gi26 «Assist di tacco»: ricevente a x=32.5, eroe a x=31.9, arco lanciato a x=46.3 (14 unita' OLTRE il ricevente) con quota massima 2,49 m. Su un TACCO. Il compagno lo attaccava dove il pallone arrivava davvero, cioe' alto e in area: da qui «attacca il pallone con la testa». Il post-arco diceva gia' la cosa giusta (assist_recv, un compagno riceve): erano le due meta' a non parlarsi. Ora l'azione va dove dice il suo premio — al ricevente se e' un appoggio, in area se l'etichetta dice cross (rami gia' esistenti e collaudati, nessuna traiettoria nuova). */else if(P.hlOneTwo===true&&!P.hlOffBall&&(t==="build"||t==="shot")){actType="pass";t="pass";}/* [7.348.0] il MURO dell'uno-due si sceglie solo dentro il ramo d'arco `pass` (7.330): un uno-due classificato `build` non lo raggiungeva mai. */
          else if(t==="shot"&&P.hlReward==="assist"&&P.hlOutcomeKind!=="chance"&&!P.hlOffBall){actType=/cross|traversone|pennell|fondo/i.test(String(P.hlActLbl||""))?"cross":"pass";t=actType;}/* [7.311.0] ...ma NON su una situation OFF-BALL: li' l'eroe non serve nessuno, si smarca per RICEVERE — mimare un passaggio mentre il pallone gli sta arrivando addosso e' la stessa bugia del ramo assist_recv. Resta il gesto «build» = clip receive, cioe' il controllo. *//* [7.245.0 batch PO gi29/30/37 «non si vede il gesto tecnico finale»] il SERVIZIO al compagno (build+reward assist: scatto e servi, lancio lungo, rimorchio) è un CALCIO al pallone — GLB-ON il gesto build era la clip receive da 4.96s di cui si vedeva l'11%: ora suona il kick (0.54s, il gesto del passaggio). Solo gesto/posa: la macchina dell'assist (reward) è invariata */
          // 3DV-11: archi HL con destinazione esplicita verso porta avversaria (+x), non posizione eroe
          const _rz=(Math.random()-.5),_side=(P.playerY||50)<50?-1:1;ballArcTgtY=0.65;ballArcProf=null;/* [7.534.0 MP-1] il profilo si azzera alla testa del dispatcher: solo le famiglie che lo dichiarano (tabella GESTI) lo impostano nei rami *//* [7.215.0] default rasoterra: ogni famiglia che ha un bersaglio in altezza lo sovrascrive qui sotto */// _side: lato attaccante — usato da cross, shot_curled, header_far_post
          if(t==="penalty"){// Panenka/cucchiaio → arco molto alto; rigore normale → arco standard
            if(P.hlVariant==="penalty_panenka"){ballArcH=3.6;ballArcDur=1.10;}else{ballArcH=1.15;ballArcDur=0.62;}/* [7.213.0 revisione PO «sembra sempre un pallonetto»] apici in METRI: la traversa sta a 2.44 — un rigore che picchiava a 4.2 passava sopra la porta a metà volo. Il cucchiaio resta alto, ma 9m era una parabola da rinvio */
            ballArcT=0;ballArcActive=true;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*3;ballArcTgtZ=_rz*7;
            ballArcProf=(gestoDi('penalty',P.hlVariant)||{}).prof||null;/* [7.534.0 MP-1] rigore teso, panenka a campana */
            // F6 (traiettoria del RIGORE = conseguenza della DECISIONE): q (tiro/mentalità, seedata) plasma
            //   pace+precisione. q bassa → più centrale/lento (parabile); q alta → angolato/teso. Panenka esclusa dall'altezza.
            {const _q=P.hlQuality!=null?P.hlQuality:0.6;
             ballArcTgtZ*=(0.55+_q*0.45);// precisione: q bassa → verso il centro (più parabile)
             ballArcDur*=clamp(1.14-_q*0.26,0.82,1.16);// q alta → conclusione più veloce
             if(P.hlVariant!=="penalty_panenka")ballArcH*=clamp(1.10-_q*0.20,0.86,1.12);
             /* [7.215.0] ALTEZZA D'ARRIVO del rigore: q alta = angolo alto, q bassa = centrale a mezz'altezza —
                prima ogni rigore moriva sulla linea rasoterra e il portiere non aveva nulla da parare in alto.
                Il cucchiaio scende morbido appena sotto la traversa. Sempre dentro lo specchio (max 2.05 < 2.44). */
             ballArcTgtY=(P.hlVariant==="penalty_panenka")?1.55:clamp(0.42+_q*1.55,0.38,2.05);}}
          else if(t==="shot"){ballArcT=0;ballArcActive=true;
            // CINE-2: variant shot — traiettorie distinte per ogni tipo di conclusione
            const _vs=P.hlVariant;
            ballArcProf=(gestoDi('shot',_vs)||{}).prof||null;/* [7.534.0 MP-1] la FORMA del volo dal vocabolario: la sassata viaggia tesa, il pallonetto scollina presto — H e bersagli restano quelli qui sotto */
            if(_vs==="shot_chip"){ballArcH=5.2;ballArcDur=1.05;ballArcTgtX=AWAY_GOAL_X-1+Math.random()*2;ballArcTgtZ=_rz*5;}
            else if(_vs==="shot_volley"){ballArcH=2.2;ballArcDur=0.62;ballArcTgtX=AWAY_GOAL_X-4+Math.random()*5;ballArcTgtZ=_rz*9;}
            else if(_vs==="shot_curled"){ballArcH=2.3;ballArcDur=0.74;ballArcTgtX=AWAY_GOAL_X-2+Math.random()*3;ballArcTgtZ=-_side*(6+Math.random()*5);}/* curva al palo lontano — lato opposto al tiratore */
            else if(_vs==="shot_first_time"){ballArcH=1.5;ballArcDur=0.48;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*4;ballArcTgtZ=_rz*6;}
            else if(_vs==="shot_one_on_one"){ballArcH=1.0;ballArcDur=0.52;ballArcTgtX=AWAY_GOAL_X-1+Math.random()*2;ballArcTgtZ=(Math.random()>0.5?1:-1)*(4+Math.random()*5);}/* angolo di porta rasoterra */
            else{ballArcH=1.6;ballArcDur=0.72;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*4;ballArcTgtZ=_rz*8;}/* [7.213.0] shot_power: apice 4.8 -> 1.6 (era il DOPPIO della traversa: ogni conclusione leggeva come un pallonetto) */
            // Step 3 + F4 (traiettoria = conseguenza della DECISIONE): precisione E FORMA dell'arco derivano dalla
            //   qualità decisa dal motore — q alta = conclusione tesa/veloce/angolata; q bassa = morbida/centrale/lenta.
            //   Bounded attorno al baseline della variant (chip/volley restano ad arco alto). Seedato → deterministico.
            {const _q=P.hlQuality!=null?P.hlQuality:0.6;
             ballArcTgtZ*=(0.6+_q*0.4);// precisione (angolo)
             ballArcDur*=clamp(1.15-_q*0.32,0.78,1.18);// F4: q alta → tiro più veloce
             if(_vs!=="shot_chip"&&_vs!=="shot_volley")ballArcH*=clamp(1.12-_q*0.26,0.82,1.14);// F4: q alta → arco più teso (non per gesti alti)
             /* [7.215.0] ALTEZZA D'ARRIVO: prima OGNI tiro finiva sulla linea rasoterra (0.65) — l'angolo alto non
                esisteva e il portiere non aveva niente da parare in alto. Ora l'altezza segue il GESTO e la qualità:
                il pallonetto scende sotto la traversa, il tiro in 1v1 resta basso (angolo rasoterra), il tiro a giro
                sale all'incrocio quando è ben calciato. Sempre dentro lo specchio (max 2.15 < traversa 2.44). */
             ballArcTgtY=(_vs==="shot_chip")?clamp(1.45+_q*0.55,1.35,2.05)
               :(_vs==="shot_one_on_one")?clamp(0.32+_q*0.55,0.30,0.90)
               :(_vs==="shot_curled")?clamp(0.75+_q*1.35,0.60,2.15)
               :(_vs==="shot_volley")?clamp(0.55+_q*1.10,0.45,1.70)
               :clamp(0.45+_q*1.30,0.38,1.85);
            }}
          else if(t==="header"){ballArcT=0;ballArcActive=true;
            // CINE-2: variant header — tuffo rasoterra / primo palo / secondo palo
            const _vh=P.hlVariant;
            ballArcProf=(gestoDi('header',_vh)||{}).prof||null;/* [7.534.0 MP-1] il tuffo di testa schiaccia teso */
            if(_vh==="header_diving"){ballArcH=1.0;ballArcDur=0.56;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*4;ballArcTgtZ=_rz*7;}/* tuffo — arco piatto e basso */
            else if(_vh==="header_far_post"){ballArcH=2.0;ballArcDur=0.70;ballArcTgtX=AWAY_GOAL_X-4+Math.random()*5;ballArcTgtZ=-_side*(8+Math.random()*5);}/* secondo palo — z opposto al tiratore via _side */
            else{ballArcH=1.7;ballArcDur=0.63;const _hb=AWAY_GOAL_X-5+Math.random()*6,_hc=(P.playerX||50)-50+45;ballArcTgtX=Math.min(_hb,_hc);ballArcTgtZ=_rz*6;}/* near_post: cap 45u avanti per ridurre velocità da posizioni difensive */
            // F7 (traiettoria della TESTA = conseguenza della DECISIONE): q (fisico/posizionamento/tiro, seedata) plasma
            //   l'incornata. q alta → precisa/decisa/schiacciata in basso; q bassa → verso il centro e più alta (sballata).
            //   Solo l'ARCO: variant e stato-palla aereo restano intatti (invariante CINE testa⇒aerea).
            {const _q=P.hlQuality!=null?P.hlQuality:0.6;
             ballArcTgtZ*=(0.55+_q*0.45);// precisione: q bassa → incornata centrale
             ballArcDur*=clamp(1.12-_q*0.20,0.86,1.12);// q alta → colpo di testa più deciso
             ballArcH*=clamp(1.15-_q*0.30,0.82,1.18);// q alta → schiacciata in basso; q bassa → alta/sballata
             /* [7.215.0] ALTEZZA D'ARRIVO della testa: un'incornata ben fatta si SCHIACCIA a terra (il colpo di
                testa che il portiere para meno), una sbagliata sale a mezz'altezza. Il tuffo di testa arriva
                sempre raso. */
             ballArcTgtY=(_vh==="header_diving")?clamp(0.30+(1-_q)*0.35,0.28,0.70):clamp(1.35-_q*0.95,0.32,1.55);}}
          else if(t==="cross"){ballArcT=0;ballArcActive=true;
            // CINE-1: variant cross — primo palo (stesso lato fascia), secondo palo (lato opposto), cutback (dal fondo)
            const _v=P.hlVariant;// _side definito sopra (globale all'arc block)
            if(_v==="cross_far_post"){ballArcH=3.4;ballArcDur=0.88;ballArcTgtX=AWAY_GOAL_X-9+Math.random()*5;ballArcTgtZ=-_side*(11+Math.random()*7);}
            else if(_v==="cross_cutback"){ballArcH=1.0;ballArcDur=0.68;ballArcTgtX=30+Math.random()*7;ballArcTgtZ=_side*(3+Math.random()*4);}
            else if(_v==="cross_low_driven"){ballArcH=1.4;ballArcDur=0.76;ballArcTgtX=AWAY_GOAL_X-13+Math.random()*6;ballArcTgtZ=_side*(5+Math.random()*6);}
            else{ballArcH=3.0;ballArcDur=0.84;// near_post: clamp TgtX tra [playerX+5, playerX+45] per evitare cross all'indietro (byline) o troppo veloci
              const _cp=(P.playerX||50)-50;ballArcTgtX=Math.max(_cp+5,Math.min(AWAY_GOAL_X-14+Math.random()*5,_cp+45));
              ballArcTgtZ=_side*(8+Math.random()*6);}/* near post */
            // F5 (traiettoria del CROSS = conseguenza della DECISIONE): come F4 per il tiro — la qualità decisa
            //   dal motore plasma PACE e PRECISIONE del cross. q alta → cross teso/veloce e preciso sul target;
            //   q bassa → più morbido/lento e meno angolato (cade verso il centro). Bounded attorno al baseline
            //   della variant (cutback/low_driven restano bassi). Seedato (P.hlQuality) → deterministico.
            {const _q=P.hlQuality!=null?P.hlQuality:0.6;
             ballArcTgtZ*=(0.62+_q*0.38);// precisione: q bassa → cross meno angolato (cade verso il centro)
             ballArcDur*=clamp(1.16-_q*0.30,0.80,1.18);// q alta → cross più teso/veloce
             if(_v!=="cross_cutback"&&_v!=="cross_low_driven")ballArcH*=clamp(1.14-_q*0.24,0.84,1.16);// q alta → traiettoria più tesa (non per i cross bassi)
             /* [7.215.0] ALTEZZA D'ARRIVO del cross — è il presupposto perché lo stacco sia sincronizzato: un
                traversone alto deve CONSEGNARE il pallone all'altezza della testa (~2m), non depositarlo sull'erba
                davanti a chi salta. Il cutback e il cross teso restano rasoterra, come devono. */
             ballArcTgtY=(_v==="cross_cutback")?0.55:(_v==="cross_low_driven")?clamp(0.55+(1-_q)*0.35,0.50,0.95):clamp(1.75+_q*0.35,1.60,2.15);
            }}
          else if(t==="freekick"){ballArcT=(typeof window!=='undefined'&&window.__CPM_NO467)?0:-0.55;ballArcActive=true;/* [7.467.0 collaudo PO #13 «manca rincorsa e calcio»] LA PUNIZIONE NON SI BATTE DA FERMI. `ballArcT=0` significa che il pallone parte NELL'ISTANTE in cui l'azione comincia: non esiste finestra in cui l'eroe possa avvicinarsi, e il tiro esce da un corpo immobile. Il meccanismo per farlo aspettare c'e' gia' ed e' lo stesso del 6.74: un `ballArcT` NEGATIVO e' wind-up — la palla resta ferma finche' non torna a zero, e li' scatta il flash d'impatto. 0,55s e' il tempo di tre passi; l'eroe viene arretrato di altrettanto qui sotto e il suo driver lo riporta sul pallone, quindi la rincorsa e' una CORSA vera (animOne, con la sua accelerazione) e non uno scivolamento. Sul RIGORE la rincorsa esiste gia' come gesto dedicato: non si tocca. */
            /* [7.216.0 revisione PO «sembra un cross basso»] LA PUNIZIONE HA TRE TRAIETTORIE, non una. Prima ogni
               azione — cross alto, cross teso, giocata corta, tiro diretto — usciva con lo stesso arco verso la
               porta: chi sceglieva «Cross alto» vedeva la stessa cosa di chi sceglieva «Cross basso teso». Ora la
               consegna alta pennella all'altezza della testa sul secondo palo, quella tesa vola raso davanti alla
               porta, la giocata corta è un appoggio laterale; il tiro diretto resta com'era. */
            const _vf=P.hlVariant;
            if(_vf==="freekick_cross_high"){ballArcH=2.6;ballArcDur=0.95;ballArcTgtX=AWAY_GOAL_X-9+Math.random()*5;ballArcTgtZ=-_side*(8+Math.random()*6);}
            else if(_vf==="freekick_cross_low"){ballArcH=0.9;ballArcDur=0.70;ballArcTgtX=AWAY_GOAL_X-12+Math.random()*5;ballArcTgtZ=_side*(4+Math.random()*5);}
            else if(_vf==="freekick_short"){ballArcH=0.45;ballArcDur=0.44;ballArcTgtX=(P.playerX||50)-50+7+Math.random()*5;ballArcTgtZ=_side*(7+Math.random()*5);}
            else{ballArcH=2.4;ballArcDur=0.78;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*4;ballArcTgtZ=_rz*7;}
            /* F6 (traiettoria della PUNIZIONE = conseguenza della DECISIONE): q (tiro/tecnica, seedata) plasma pace+precisione+altezza */
            {const _q=P.hlQuality!=null?P.hlQuality:0.6;
             ballArcTgtZ*=(0.6+_q*0.4);ballArcDur*=clamp(1.15-_q*0.30,0.80,1.16);ballArcH*=clamp(1.12-_q*0.22,0.85,1.14);
             ballArcTgtY=(_vf==="freekick_cross_high")?clamp(1.80+_q*0.30,1.65,2.15)
               :(_vf==="freekick_cross_low")?clamp(0.55+(1-_q)*0.30,0.50,0.90)
               :(_vf==="freekick_short")?0.55
               :clamp(0.85+_q*1.25,0.70,2.10);/* [7.215.0] il tiro diretto scavalca la barriera e SCENDE sotto la traversa */}}
          /* [7.197.0 S4 · direttiva PO «esiti onesti»] IL TIRO MURATO SI FERMA SUL MURO. Con l'overlay «Murato
             dalla difesa» e la cronaca «la difesa mura la conclusione», il pallone attraversava indisturbato tutta
             la difesa, arrivava sullo specchio e faceva pure tuffare il portiere: quello che il motore aveva deciso
             e quello che si vedeva erano due partite diverse. Ora, quando l'esito è murato/intercettato, il
             bersaglio dell'arco si accorcia sul punto del contatto (pochi metri davanti a chi calcia, con una
             deviazione laterale) e la parabola si abbassa: la conclusione muore lì, come nella realtà.
             Matematica pura, dentro il blocco valutato dal check data-coherence. */
          if(ballArcActive&&(P.hlOutcomeKind==="blocked"||P.hlOutcomeKind==="wall_blocked"||P.hlOutcomeKind==="intercepted")&&(t==="shot"||t==="freekick"||t==="header")){
            const _pxB=(P.playerX||50)-50,_pzB=((P.playerY||50)-50)*0.68;
            const _dxB=ballArcTgtX-_pxB,_dzB=ballArcTgtZ-_pzB,_dB=Math.sqrt(_dxB*_dxB+_dzB*_dzB)||1;
            const _cut=clamp(_dB*0.30,2.2,7.5);/* il muro è a pochi metri: la palla non supera il primo difensore */
            ballArcTgtX=_pxB+(_dxB/_dB)*_cut;
            ballArcTgtZ=_pzB+(_dzB/_dB)*_cut+_rz*3.2;/* rimbalzo laterale sul corpo che mura */
            ballArcH=clamp(ballArcH*0.45,0.5,2.2);
          }
          /* [7.196.0 S3 · direttiva PO «velocità coerente»] LA DURATA DELL'ARCO DIPENDE DALLA DISTANZA — ARC_BLOCK_END.
             Fino a qui ogni ramo assegna una durata COSTANTE per tipo/variante (0.72 il rigore, 0.80 il tiro e la
             punizione…): siccome l'arco interpola sorgente→bersaglio in quel tempo fisso, la stessa azione volava a
             velocità che variavano di 10-40× — un tap-in da 4u e una bordata da 40u impiegavano lo stesso tempo, il
             primo strisciava e il secondo era un fulmine. Ora il tempo di volo è distanza/velocità-di-riferimento
             della famiglia, e la durata autorata sopravvive come FORMA (rapporto sulla nominale 0.80): il cucchiaio
             resta lento, la bordata resta tesa, ma entrambi rispettano la fisica della distanza.
             Matematica pura (P.playerX/Y, clamp, Math): resta valutabile dall'estrattore analitico del gate. */
          if(ballArcActive){/* [7.512.0 R2] la normalizzazione 7.196 viveva QUI, in testa alla catena — quindi
            copriva SOLO le famiglie gia' armate a monte (shot/penalty/freekick/header/cross): pass, tackle,
            dribble e build, che armano l'arco nei rami `else if` successivi, non venivano MAI normalizzate e
            conservavano durate costanti (un passaggio corto strisciava, un lancio lungo era un fulmine —
            incidente di concatenazione, non una scelta: il fallback 17 di _vRef esisteva gia'). Il blocco e'
            spostato DOPO l'intera catena; questa testa resta vuota come guardia dell'else-chain. */}
          else if(t==="pass"){const _fwd=P.hlSuccess===true;ballArcH=_fwd?1.8:1.4;ballArcDur=_fwd?0.55:0.48;ballArcT=0;ballArcActive=true;
            // Il passaggio va SEMPRE in avanti. Riuscito → mira un COMPAGNO avanti (riceve);
            //   fallito → mira l'AVVERSARIO avanti che INTERCETTA (mai indietro verso la propria porta).
            const _phx=(ball&&ball.position)?ball.position.x:G2X(P.playerX||50),_phz=(ball&&ball.position)?ball.position.z:G2Z(P.playerY||50),_team=_fwd?"home":"away";/* [7.414.0 gi174 «verticalizzazione all'indietro» · gi24 «zig-zag avanti/indietro» · gi79] L'ANCORA E' LA PALLA, NON LO SPOT D'APERTURA. L'arco parte dalla posizione REALE del pallone, ma il ricevente (e l'intercettore su fallito) veniva scelto «avanti» rispetto a G2X(P.playerX) — lo spot logico di INIZIO scena: dopo un build-up che ha mosso la palla, «avanti rispetto a dov'ero» puo' essere INDIETRO rispetto alla palla (misurato: verticalizzazione -5,2u su intercetto, assist filtrante -16,3u dopo la consegna). Ancorando alla palla il cancello _fwd2>-3 garantisce il volo in avanti da dove il pallone sta davvero — riuscito o intercettato. */
            let _ptX=_phx+9,_ptZ=_phz+_rz*9;passTargetMesh=null;let _bestRcvSc=1e9;
            // 5.49.24: il ricevente dell'assist è il compagno PIÙ AVANZATO e in spazio davanti al portatore (non solo il più vicino) → assist leggibile verso un giocatore ben piazzato
            sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team===_team&&!src.gk){const _fwd2=pp.mesh.position.x-_phx;if(_fwd2>-3){const d=Math.hypot(_fwd2,pp.mesh.position.z-_phz);if(d<(_fwd?34:20)){const _sc=d*0.8-Math.min(Math.max(0,_fwd2),14)*1.5+(d<7?18:0)+(_fwd2<1.5?12:0);if(_sc<_bestRcvSc){_bestRcvSc=_sc;_ptX=pp.mesh.position.x;_ptZ=pp.mesh.position.z;passTargetMesh=pp.mesh;}/* [7.359.0 collaudo PO #116 «passaggio scoordinato», #39 «sponda a un compagno troppo vicino e in orizzontale», #38 «dai e vai, passaggio orizzontale»] UN PASSAGGIO SERVE A GUADAGNARE CAMPO. Questo punteggio era `d - avanti*0,6`: la distanza pesava piu' della profondita', e — a differenza dei due siti gemelli che penalizzano di +14 chi sta sotto i 6u — qui non c'era NESSUNA penalita' di vicinanza. Misurato su 31 servizi reali: 7 sotto i 6 metri e 12 senza profondita'. Casi peggiori: gi25 «Filtrante per il centravanti!» servito a 1,8u con 0,0u di avanzamento (un filtrante puramente laterale a un metro e mezzo), gi156 «Lancio millimetrico in profondita'!» giocato 6,8u ALL'INDIETRO, gi107 «Palla al buco tra i centrali» -2,8u. Ora: la profondita' pesa 1,5 ma con un TETTO a 14u, e la distanza totale pesa 0,8: il punteggio ha un minimo dove cade un passaggio VERO (12-18 metri) invece di premiare l'infinito. La prima versione (profondita' 1,6 senza tetto) correggeva il difetto e ne creava l'opposto — misurato: gi24 «Ricezione tra le linee» da 6,9u a 27u, gi57 «1 vs 1» a 24,7u di cui 23,7 laterali, cioe' un cambio di campo al posto di un appoggio. Chi e' sotto i 7u paga 18 e chi non e' davanti almeno 1,5u paga 12. Restano soglie e cancelli invariati (`_fwd2>-3`, raggio 34/20), quindi se davvero non c'e' nessun compagno avanti il ricevente di ripiego e' ancora quello di prima: si cambia la PREFERENZA, non la disponibilita'. Solo aritmetica su `d` e `_fwd2` — l'estrattore analitico del check data-coherence continua a valutare questo ramo senza identificatori nuovi. */}}}});/* [7.247.0 gi38 «troppo distante il tiro»] su FALLITO l'intercettore è VICINO (≤20u): il filtrante tagliato non vola più fino a un difensore sulla linea di porta (misurato: palla a game 97 su un intercetto) */
            /* [7.464.0 codice 008 «il pallone viaggia da solo» — collaudo PO #56, #30, #105, #188] IL PALLONE
               VA A UN UOMO, NON A UN PUNTO. Se nessun compagno supera il filtro (davanti di almeno -3u e
               entro 34), `_ptX/_ptZ` restavano al ripiego CIECO di due righe sopra — `palla + 9u in avanti`,
               un punto scelto senza guardare chi c'e'. MISURATO su gi56 («Lancio lungo millimetrico», azione
               «Rimanda al mittente», premio assist): palla a x 28, bersaglio a x 36,8 (cioe' esattamente
               +9), `rcv:null`, e il piu' vicino al punto d'atterraggio era un AVVERSARIO a 1,1 unita' —
               con l'eroe a 34 unita' di distanza. Dopo la consegna, nei 2,5s successivi, il compagno piu'
               vicino si fermava a 6,0u: nessuno arrivava sul pallone, ed e' precisamente la nota del PO.
               Il 7.310 aveva gia' messo questa rete DOPO l'atterraggio (se `assist_recv` non ha un uomo se
               ne sceglie uno), ma a quel punto l'arco e' gia' partito verso il punto cieco: la rete va messa
               PRIMA, dove il bersaglio si decide. Qui: se il filtro non ha scelto nessuno si prende il
               compagno PIU' VICINO senza vincolo di direzione — meglio un appoggio corto all'indietro, che
               nel calcio esiste, di un lancio a un punto vuoto presidiato da un avversario. Il ripiego cieco
               resta solo se in campo non c'e' proprio nessuno. */
            if(!passTargetMesh&&!(typeof window!=='undefined'&&window.__CPM_NO464)){let _dRes=1e9,_mRes=null;/* [7.464.0] `__CPM_NO464` rimette il ripiego cieco: e' la prova del rosso del guardiano delivery-arrival *//* [7.470.0 collaudo PO #181 «passaggio all'indietro indirizzato a nessuno»] LA RETE VALEVA SOLO PER I PASSAGGI RIUSCITI. Il 7.464 aveva tolto il ripiego cieco quando la palla va a un COMPAGNO, ma su un passaggio FALLITO il bersaglio e' l'avversario che intercetta, e li' la rete non c'era: se nessun avversario superava il filtro si tornava a `palla + 9 unita'`, cioe' a un punto vuoto — che e' esattamente «indirizzato a nessuno». Ora vale per entrambi, e la squadra da cercare la dice `_team`, che il ramo ha gia' scelto. */
              sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];
                if(!src||src.team!==_team||src.gk||!pp.mesh||pp.mesh===hero)return;
                /* [7.475.0 collaudo PO #187 «il filtrante in avanti e non all'indietro»] LA RETE NON
                   GUARDAVA LA DIREZIONE. Il ciclo principale, due righe piu' su, il filtro ce l'ha da
                   sempre (`_fwd2>-3`: il bersaglio dev'essere avanti); questa rete di riserva — nata nel
                   7.464 e allargata ai passaggi FALLITI nel 7.470 — prendeva l'uomo PIU' VICINO e basta.
                   Su una palla filtrante l'uomo piu' vicino e' spesso quello alle spalle, e la palla
                   partiva all'indietro: un filtrante che torna indietro non e' un filtrante. Ora la rete
                   usa lo stesso filtro del ciclo che sostituisce — perche' una rete di riserva che cambia
                   le regole del gioco non e' una riserva, e' un secondo comportamento. Se davanti non c'e'
                   nessuno la palla resta sul punto geometrico IN AVANTI: meglio un pallone giocato avanti
                   verso nessuno che un pallone giocato indietro verso nessuno — la nota #181 chiedeva
                   entrambe le cose, e questa e' la meta' che mancava. */
                if(pp.mesh.position.x-_phx<=-3)return;
                const d=Math.hypot(pp.mesh.position.x-_phx,pp.mesh.position.z-_phz);
                if(d<_dRes){_dRes=d;_mRes=pp.mesh;}});
              if(_mRes){_ptX=_mRes.position.x;_ptZ=_mRes.position.z;passTargetMesh=_mRes;}}
            /* [7.475.0] TESTIMONE DELLA DIREZIONE DEL PASSAGGIO (solo sotto test): origine della palla,
               bersaglio scelto e se un uomo e' stato trovato. E' la misura di «il filtrante in avanti e
               non all'indietro»: un passaggio e' in avanti se il bersaglio ha x maggiore dell'origine. */
            if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _pw=(window.__CPM_PASS475=window.__CPM_PASS475||[]);
              if(_pw.length<80)_pw.push({ok:!!_fwd,ox:+_phx.toFixed(2),tx:+_ptX.toFixed(2),d:+(_ptX-_phx).toFixed(2),uomo:!!passTargetMesh});}catch(_e475){}}
            // FIX boomerang + scatto compagno: il compagno SCATTA in profondità e la palla è giocata SULLA CORSA
            //   (davanti a lui) → palla e ricevente convergono IN AVANTI, niente ritorno verso l'eroe.
            // F9 (passaggio = conseguenza della DECISIONE): q (through/onetwo, seedata) plasma PROFONDITÀ dello
            //   scatto e PACE. q alta → imbucata più profonda e tesa; q bassa → più corta/molle. La palla resta
            //   giocata sul punto dello scatto (ballArcTgtX=_runToX) → convergenza palla↔ricevente INTATTA (fix 5.22).
            {const _q=P.hlQuality!=null?P.hlQuality:0.6;ballArcDur*=clamp(1.18-_q*0.34,0.78,1.18);// q alta → passaggio più teso/veloce
             if(_fwd&&P.hlOneTwo===true){/* [7.330.0 collaudo PO «il dai e vai genera azioni assurde con pallone
                 volante che torna indietro»] IL MURO È L'UOMO VICINO. La selezione generica (avanzamento ×0.6 +
                 penalità <6u del 7.254, pensata per gli ASSIST) mandava l'appoggio sull'uomo PROFONDO e il ricevente
                 SCATTAVA di altri +12u (misurato: appoggio 18.7-22.9u su gi180/gi186) → la sponda era un pallone che
                 attraversa il campo e torna = boomerang. Un dai-e-vai vero: appoggio CORTO al compagno vicino
                 (2.2-13u) che NON scatta (fa da muro), palla bassa ai suoi piedi; il viaggio lungo lo fa L'EROE col
                 «vai» (push 6.5 del 7.322) e la restituzione lo trova sulla corsa. */
               let _wm2=null,_wd2=1e9;
               sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&!src.gk&&pp.mesh!==hero){const _fw3=pp.mesh.position.x-_phx;if(_fw3>-4){const d3=Math.hypot(_fw3,pp.mesh.position.z-_phz);if(d3>=2.2&&d3<=13){const _s3=Math.abs(d3-5.5)-Math.max(0,_fw3)*0.15;if(_s3<_wd2){_wd2=_s3;_wm2=pp.mesh;}}}}});
               if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_O2SEL={found:!!_wm2,cap:!_wm2&&!!passTargetMesh,none:!_wm2&&!passTargetMesh};}catch(_e){}}/* [7.330.0] probe test-only: quale ramo del muro */
               if(_wm2){passTargetMesh=_wm2;_wm2._runToX=_wm2.position.x;_wm2._runToZ=_wm2.position.z;/* il muro tiene la posizione */
                 ballArcTgtX=_wm2.position.x;ballArcTgtZ=_wm2.position.z;ballArcH=0.6;ballArcDur=0.38;}
               else if(passTargetMesh){/* nessun compagno in banda: appoggio comunque CAPPATO a 12u lungo la linea del ricevente scelto */
                 const _dxc=_ptX-_phx,_dzc=_ptZ-_phz,_dc=Math.max(0.1,Math.hypot(_dxc,_dzc));const _k12=Math.min(1,12/_dc);
                 ballArcTgtX=_phx+_dxc*_k12;ballArcTgtZ=_phz+_dzc*_k12;ballArcH=0.7;ballArcDur=0.4;
                 passTargetMesh._runToX=passTargetMesh.position.x;passTargetMesh._runToZ=passTargetMesh.position.z;}
               else{ballArcTgtX=_phx+6;ballArcTgtZ=_phz+_rz*4;ballArcH=0.7;ballArcDur=0.4;}}
             else if(_fwd&&P.hlPattern==="SWITCH"){// 5.43.3: SCARICO SULLA FASCIA — palla DIAGONALE verso un compagno largo (fascia random dx/sx), distinta dal verticale
               /* [7.368.0 collaudo PO #181 «Cambio di gioco — ribalta sul lato debole»: «la scena e'
                  completamente sballata, parte un passaggio ad un compagno vicino»] IL LATO SI TIRAVA A
                  TESTA O CROCE. `Math.random()<0.5` sceglieva la fascia SENZA GUARDARE DOVE FOSSE L'EROE:
                  una volta su due il «cambio di fronte» finiva sulla fascia da cui la palla gia' partiva,
                  e un cambio di gioco che non cambia lato non e' un cambio di gioco — e' un appoggio corto.
                  Misurato su gi181 prima: passaggio da 57 a 66 di y, nove unita' in orizzontale, esattamente
                  il «compagno vicino» della nota. Ed essendo un sorteggio NON seedato la stessa scena si
                  comportava in due modi diversi a ogni replica: la nota del PO non era riproducibile perche'
                  il difetto compariva a caso.
                  Il lato giusto era gia' in ambito e non lo si guardava: `_side` (definito col default
                  rasoterra) e' la fascia DELL'EROE, quindi il lato debole e' semplicemente `-_side`. Niente
                  nuovi identificatori, niente hash, e soprattutto niente random non seedato in un ramo che
                  decide una traiettoria. */
               const _sd=-_side;let _wm=null,_wd=1e9;
               /* [7.318.0] IL CAMBIO DI GIOCO NON TORNA INDIETRO: il compagno largo veniva scelto per sola
                  vicinanza alla fascia, senza chiedere che fosse ALMENO alla stessa altezza di chi passa —
                  da posizione avanzata la diagonale finiva alle spalle (11 unita' indietro su gi185). */
               /* [7.368.0] scegliere la fascia giusta non basta se poi si serve uno che sta a meta' strada:
                  il punteggio premia la vicinanza alla linea laterale, ma senza un cancello puo' comunque
                  eleggere un compagno che rispetto all'eroe si e' spostato di due metri. Qui il cancello e'
                  esplicito — il ricevente dev'essere almeno 6 unita' PIU' IN LA' dell'eroe verso il lato
                  scelto — e il ripiego e' dichiarato: se dall'altra parte non c'e' nessuno si torna alla
                  scelta di prima (`_wm2`) invece di restare senza ricevente. Si cambia la PREFERENZA, non
                  la disponibilita'. */
               let _wm2=null,_wd2=1e9;
               sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&!src.gk&&pp.mesh!==hero&&pp.mesh.position.x>=hero.position.x-2){const _scw=Math.abs(pp.mesh.position.z-_sd*22)-pp.mesh.position.x*0.5;
                 if(_scw<_wd2){_wd2=_scw;_wm2=pp.mesh;}
                 if((pp.mesh.position.z-_phz)*_sd>=6&&_scw<_wd){_wd=_scw;_wm=pp.mesh;}}});
               if(!_wm)_wm=_wm2;// 5.43.8: compagno LARGO ma AVANZATO (alto x) → cross da posizione di rifinitura, non da centrocampo
               ballArcH=2.4;// pallonata diagonale lobbata sulla fascia
               /* [7.368.0] LA PALLA ANDAVA DOVE IL COMPAGNO GIA' STAVA, e sul lato debole non c'e' quasi mai
                  nessuno: col solo lato corretto il «cambio di gioco da 50 metri» misurava 4,2u su gi187,
                  5,6u su gi181, 9,0u su gi122 — un appoggio, non un ribaltamento. Il difetto non era la
                  scelta del ricevente ma il BERSAGLIO: mirare alla posizione attuale di qualcuno significa
                  che il campo lo attraversi solo se qualcuno l'ha gia' attraversato per te.
                  Ora il bersaglio e' un punto DAVVERO largo sul lato debole (18u oltre l'eroe, dentro il
                  campo) e il ricevente ci viene MANDATO: `_runTo*` sul punto, palla sullo stesso punto, e
                  durata dell'arco pari al tempo che serve a lui per arrivarci (~13 u/s) invece dei 0,55s
                  fissi. Palla e uomo convergono — e' il rendez-vous gia' collaudato in 7.335/7.253 — e la
                  campanata lenta e' esattamente cio' che un cambio di fronte da 50 metri deve sembrare.
                  Senza l'accordo sui tempi si otterrebbe il difetto appena chiuso in 7.367: una palla
                  perfetta consegnata a nessuno. */
               if(_wm){const _tZ=clamp(_phz+_sd*18,-24,24),_tX=_wm.position.x;
                 const _run=Math.hypot(_tX-_wm.position.x,_tZ-_wm.position.z),_fly=Math.hypot(_tX-_phx,_tZ-_phz);
                 ballArcDur=clamp(Math.max(_run/13,_fly/26),0.6,1.5);
                 passTargetMesh=_wm;_wm._runToX=_tX;_wm._runToZ=_tZ;ballArcTgtX=_tX;ballArcTgtZ=_tZ;}
               else{passTargetMesh=null;ballArcTgtX=_phx+4;ballArcTgtZ=_sd*22;}}
             else if(_fwd&&passTargetMesh){const _hi=AWAY_GOAL_X-3,_lo=Math.min(_phx+5,_hi);
               /* [7.335.0 collaudo PO «verticalizzazione: la palla passa da un compagno a un altro senza dinamica
                  chiara e conclude in rete» + «chip millimetrico a zig-zag»] il punto di corsa era +12u oltre il
                  ricevente: misurato su gi174, il compagno copriva la distanza in 6.7s (palla PARCHEGGIATA), poi
                  il fallback 2.6s tagliava e la scena si sfilacciava in gambe sconnesse. Il rendez-vous è
                  RAGGIUNGIBILE: max +7 world dal ricevente. */
               passTargetMesh._runToX=clamp(_ptX+12*(0.65+_q*0.6),_lo,Math.min(_hi,_ptX+7));passTargetMesh._runToZ=_ptZ;// q alta → scatto più profondo (entro il raggiungibile)
               /* [7.386.0 collaudo PO #116 «Passaggio ad un compagno vicinissimo»] ANCHE IL PASSAGGIO
                  RIUSCITO HA UNA LUNGHEZZA MINIMA. Il punto d'incontro nasce dalla posizione del RICEVENTE,
                  e se il ricevente e' addosso a chi passa ci nasce addosso anche lui: misurati due passaggi
                  a 1,5u e 2,1u — un metro e mezzo, cioe' una giocata che a schermo non si legge come un
                  passaggio. Qui il punto viene allontanato lungo la stessa direzione fino a un minimo
                  giocabile: non cambia CHI riceve ne' DOVE va la palla, solo di quanto si stacca. Il
                  rendez-vous regge perche' la durata dell'arco si accorda gia' alla velocita' vera del
                  ricevente (7.369). */
               {const _mx386=passTargetMesh._runToX-_phx,_mz386=passTargetMesh._runToZ-_phz,_md386=Math.hypot(_mx386,_mz386);
                if(_md386>0.05&&_md386<4.6){const _k386=4.6/_md386;
                  passTargetMesh._runToX=clamp(_phx+_mx386*_k386,_lo,_hi);passTargetMesh._runToZ=clamp(_phz+_mz386*_k386,-30,30);}
                else if(_md386<=0.05){passTargetMesh._runToX=clamp(_phx+4.6,_lo,_hi);}}
               /* [7.369.0 collaudo PO, residuo di 7.367 su gi79 «Rimessa rapida dal portiere» → k0 «Scatto in
                  profondita' e ultimo passaggio»: «l'ultimo passaggio atterra a 2-5u da chiunque»] IL RICEVENTE
                  ARRIVAVA ALL'APPUNTAMENTO CON LA RETROMARCIA INSERITA.
                  La prima ipotesi era che il bersaglio fosse sbagliato, o che qualcuno lo riscrivesse: MISURATO,
                  e falso. Il tracker per-frame dice che il bersaglio di corsa e' esatto (7u davanti), che il
                  driver dedicato gira a OGNI fotogramma del volo (drv=1 su 42/42) e che il bersaglio non deriva
                  di un millimetro. Il ricevente si allontana lo stesso: su gi79 da world x -14,95 a -18,96
                  mentre il punto d'incontro sta a -8,05. Non e' un errore di mira, e' QUANTITA' DI MOTO: il
                  compagno stava gia' correndo all'indietro (verso la sua posizione di reparto) e il modello
                  d'inerzia del 7.198 — che limita apposta la sterzata perche' «mai cambi di direzione
                  istantanei» — impiega piu' del volo della palla a invertirgli la marcia. Nel frattempo lui
                  deriva 4u dalla parte sbagliata. Ecco perche' il difetto e' BIMODALE e non riproducibile a
                  colpo sicuro: quando il compagno era gia' lanciato in avanti la palla gli arrivava a 0,6u,
                  quando era lanciato indietro a 11u. La stessa scena, due esiti opposti.
                  CORREZIONE — tre pezzi, e servono tutti e tre:
                    1) LO STACCO. All'istante del passaggio la velocita' del ricevente viene RIORIENTATA sulla
                       linea dell'appuntamento, a parita' di modulo. Non e' un teletrasporto ne' una spinta: e'
                       un uomo che legge il filtrante, pianta il piede e riparte — il mezzo secondo che il
                       modello spendeva a fargli descrivere una curva era proprio il ritardo misurato.
                    2) IL PALLONE ASPETTA L'UOMO. La durata dell'arco era 0,43-0,65s, funzione della sola
                       qualita', mentre il 7.335 gli chiedeva di coprire fino a 7u: nessuno aveva verificato se
                       ci potesse ARRIVARE. Ora la durata e' almeno il tempo di percorrenza calcolato sulla punta
                       VERA di quel giocatore (7.198: 7,1-10,0 u/s per giocatore, non una costante di comodo),
                       con un cap a 1,05s — oltre, un filtrante non e' piu' un filtrante.
                    3) SE ANCORA NON BASTA, si accorcia lo scatto a cio' che e' percorribile in quel volo,
                       invece di mandarlo a un punto che non vedra' mai.
                  E' lo stesso «accordo sui tempi» che il 7.368 aveva gia' messo sul cambio di gioco («senza,
                  si ottiene una palla perfetta consegnata a nessuno»): qui semplicemente non c'era. */
               {const _v369=passTargetMesh._vmax||8.5;
                let _dx369=passTargetMesh._runToX-passTargetMesh.position.x,_dz369=passTargetMesh._runToZ-passTargetMesh.position.z;
                const _rd369=Math.hypot(_dx369,_dz369),_lag369=0.22;/* spunto + rampa d'arrivo: la punta non e' istantanea */
                ballArcDur=clamp(Math.max(ballArcDur,_rd369/_v369+_lag369),0.24,1.05);
                const _reach369=Math.max(0,ballArcDur-_lag369)*_v369;
                if(_rd369>_reach369&&_rd369>0.01){const _k369=_reach369/_rd369;
                  passTargetMesh._runToX=passTargetMesh.position.x+_dx369*_k369;passTargetMesh._runToZ=passTargetMesh.position.z+_dz369*_k369;
                  _dx369*=_k369;_dz369*=_k369;}
                const _rd2=Math.hypot(_dx369,_dz369);
                if(_rd2>0.01){const _n369=1/_rd2,_sp369=Math.hypot(passTargetMesh._vx||0,passTargetMesh._vz||0);
                  passTargetMesh._vx=_dx369*_n369*Math.min(_sp369,_v369);passTargetMesh._vz=_dz369*_n369*Math.min(_sp369,_v369);}
                passTargetMesh._ctx=passTargetMesh._runToX;passTargetMesh._ctz=passTargetMesh._runToZ;/* il bersaglio commesso del 7.198 e' una media mobile che impiega ~1s a girare: giusta per il vagare off-ball, non per chi sta gia' scattando in profondita' */}
               ballArcTgtX=passTargetMesh._runToX;ballArcTgtZ=passTargetMesh._runToZ;}
             else{// 5.43.7 passaggio FALLITO → palla giocata IN AVANTI verso un compagno, ma un AVVERSARIO la TAGLIA con una scivolata sulla traiettoria (intervento ben EVIDENTE, sulla linea, non vicino all'eroe)
               /* [7.382.0 collaudo PO #125 «Non e' un lancio in profondita' ma orizzontale»] UN FILTRANTE
                  FALLITO RESTA UN FILTRANTE. La linea del passaggio sbagliato veniva scelta prendendo il
                  compagno PIU' VICINO davanti all'eroe, in distanza pura: un compagno un metro avanti e nove
                  di lato batte sempre uno quindici metri dritto per dritto, e il pallone parte orizzontale —
                  mentre l'azione promessa all'Eroe era una verticalizzazione dietro la difesa. Misurato col
                  guardiano through-depth-test.mjs sulle scene a intento `through`: gi25 guadagnava 1.9u in
                  avanti contro 9.1u di lato (rapporto 0.21), gi120 2.3 contro 3.2, gi23 1.9 contro 1.7.
                  Ora, quando il disegno e' un filtrante, chi sta piu' di lato che avanti non e' un bersaglio
                  legittimo, e a parita' di distanza vince chi e' piu' profondo. Se nessuno lo e', si torna al
                  ripiego che era gia' qui — sedici metri dritti davanti — che e' esattamente cio' che il
                  giocatore si aspetta di vedere. Le altre famiglie di passaggio non cambiano criterio. */
               let _fx=_phx+16,_fz=_phz+_rz*6,_hd=1e9;
               const _thr382=(P.hlPattern==="THROUGH_BALL");
               /* [7.386.0] il ripiego di un CAMBIO DI GIOCO non puo' essere sei metri di lato: se sul lato
                  debole non c'e' nessuno da servire, la palla ci va lo stesso — e' quello il disegno. */
               if(P.hlPattern==="SWITCH"){_fx=_phx+6;_fz=clamp(_phz+(_phz>=0?-1:1)*24,-24,24);}
               sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];
                 if(!(src&&src.team==='home'&&!src.gk&&pp.mesh!==hero))return;
                 const _fw382=pp.mesh.position.x-_phx;if(_fw382<=0)return;
                 const _lt382=Math.abs(pp.mesh.position.z-_phz);
                 if(_thr382&&(_fw382<6||_fw382<_lt382*1.4))return;/* [7.382.0] margine, non pareggio: a 45 gradi esatti la linea si legge gia' come diagonale (misurati gi23 e gi117 fermi a rapporto 1.00 col solo divieto di andare piu' di lato che avanti), e un filtrante verso un compagno tre metri avanti non e' un filtrante — sotto i sei metri di guadagno si preferisce il ripiego dritto */
                 /* [7.386.0 collaudo PO #116 «Passaggio ad un compagno vicinissimo» + #111 «il passaggio
                    al compagno dietro e' senza senso»] UN PASSAGGIO HA UNA LUNGHEZZA MINIMA. La regola di
                    scelta era la pura vicinanza — `d<_hd`, il piu' vicino vince — e il 7.382 l'aveva
                    corretta per i soli FILTRANTI. Le note nuove parlano di altre famiglie, e la misura le
                    da' ragione in pieno: guardiano pass-sanity-test.mjs su 93 passaggi, 38 piu' corti di
                    sei unita' — gi115 a 1,5u, gi95 a 2,4u, gi118 a 0,7u — e fra questi «Lancio lungo 50
                    metri» che ne percorreva 5,4 e «Parabola d'esterno 40m» che ne percorreva 4,3.
                    Il punto d'intercetto sta al 55% della linea, quindi il compagno scelto deve stare al
                    DOPPIO della lunghezza minima perche' la giocata si veda: undici unita' per un
                    passaggio normale, dodici per un filtrante, e per un cambio di gioco molto di piu' —
                    un ribaltamento di fronte che non attraversa il campo non e' un ribaltamento.
                    Se nessuno e' abbastanza lontano si usa il ripiego dritto che era gia' qui, che e'
                    esattamente cio' che il giocatore si aspetta di vedere. */
                 const _minD386=_thr382?12:(P.hlPattern==="SWITCH"?18:11);
                 if(Math.hypot(_fw382,_lt382)<_minD386)return;
                 const d=Math.hypot(_fw382,_lt382)-(_thr382?_fw382*0.9:0);
                 if(d<_hd){_hd=d;_fx=pp.mesh.position.x;_fz=pp.mesh.position.z;}});
               /* [7.331.0 collaudo PO «assist filtrante MURATO non produce un'azione realistica»] «murato» significa
                  linea chiusa ADDOSSO al passatore — ma il fail volava sempre all'intercetto a METÀ linea con
                  scivolata, e l'overlay diceva «murato» mentre il 3D mostrava un'interception profonda. Ora la
                  famiglia blocked (blocked/wall_blocked/dispossessed/beaten — intercepted NO: quella è davvero
                  una lettura sulla traiettoria) ferma il pallone al 22% della linea, cap 6u dall'eroe, arco corto
                  e basso = rimpallo sul muro. */
               const _blk331=/^(blocked|wall_blocked|dispossessed|beaten)$/.test(P.hlOutcomeKind||"");
               const _tI=_blk331?0.22:0.55;
               let _ix=_phx+(_fx-_phx)*_tI,_iz=_phz+(_fz-_phz)*_tI;// punto di intercetto: sul muro (blocked) o a metà della linea
               if(_blk331){const _dI=Math.hypot(_ix-_phx,_iz-_phz);if(_dI>6){const _kI=6/_dI;_ix=_phx+(_ix-_phx)*_kI;_iz=_phz+(_iz-_phz)*_kI;}ballArcH=0.45;ballArcDur=0.28;}
               ballArcTgtX=_ix;ballArcTgtZ=_iz;
               let _id=1e9,_im=null;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='away'&&!src.gk){const d=Math.hypot(pp.mesh.position.x-_ix,pp.mesh.position.z-_iz);if(d<_id){_id=d;_im=pp.mesh;}}});
               if(_im){oppActType="opp_tackle";oppActT=0;oppMesh=_im;oppMesh._divePz=_im.position.z;oppDiveDir=_iz>=_im.position.z?1:-1;oppMesh._slideToX=_ix;oppMesh._slideToZ=_iz;}
               passTargetMesh=null;}
             /* [7.341.0 setaccio delle azioni · gi111 «Assist rasoterra in area piccola» FALLITO: l'esito diceva
                «intercettato» e la palla finiva IN RETE] UN PASSAGGIO NON ENTRA IN PORTA. Dentro l'area piccola il
                destinatario (o l'intercettatore) più avanzato sta SULLA LINEA, fra i pali: mirarlo produce un
                pallone che vola nello specchio, indistinguibile da un tiro — e il riassestamento successivo lo
                riporta indietro (il boomerang che il PO segnala). Il bersaglio di ogni passaggio resta fuori
                dalla bocca della porta; largo, dove non c'è porta da bucare, nessun limite. */
             /* [7.386.0] la promessa dell'etichetta vale sulla traiettoria: «rasoterra» e' un pallone che
                non si stacca dall'erba, «lancio/parabola» e' un pallone che la scavalca. */
             if(P.hlVariant==="pass_ground"&&ballArcH>0.32)ballArcH=0.32;
             else if(P.hlVariant==="pass_lofted"&&ballArcH<1.6)ballArcH=1.6;
             if(Math.abs(ballArcTgtZ)<4.6){const _capP=GOAL_LINE_X-5.2;if(ballArcTgtX>_capP)ballArcTgtX=_capP;}}}// la palla converge sul punto di intercetto dove il difensore scivola
          else if(t==="tackle"){ballArcT=0;ballArcActive=true;
            // FIX FASE DIFENSIVA (5.47.17): in un highlight DIFENSIVO (P.hlDef) la palla NON va MAI scaraventata verso la porta avversaria.
            //   Su recupero riuscito = possesso RIconquistato ai piedi dell'eroe (palla che resta lì, arco basso e corto), non un lancio in avanti.
            if(!P.hlDef&&P.hlSuccess===true&&P.hlReward==="goal"){ballArcH=1.5;ballArcDur=0.48;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*3;ballArcTgtZ=_rz*6;}// (solo OFFENSIVO) intercetto-gol → palla punta la porta
            else if(P.hlDef){ballArcH=1.4;ballArcDur=0.5;ballArcTgtX=G2X(P.playerX||50);ballArcTgtZ=G2Z(P.playerY||50);}// 5.65.0: la traiettoria difensiva REALE è decisa dal post-guard universale (resolveDefensiveOutcome) — qui solo un placeholder che verrà sovrascritto
            else{ballArcH=1.2;ballArcDur=0.40;ballArcTgtX=G2X(P.playerX||50)+(P.hlSuccess===true?12:-8);ballArcTgtZ=G2Z(P.playerY||50)+_rz*14;}}// contrasto offensivo normale → palla avanti/indietro
          else if(t==="dribble"){ballArcT=0;ballArcActive=true;
            /* [7.334.0 collaudo PO «dribbling feroce in corsa: parte un MEZZO TIRO senza senso che dà vita a una
               catena»] il dribbling riuscito con reward GOAL è convertito a CHANCE dal 7.8.10 (il primo tocco non
               segna: finalizza la catena «dopo_dribbling») — ma questo ramo guardava solo hlReward e SPARAVA la
               palla verso la porta: mezzo tiro, deflect, poi la catena. Su CHANCE la palla resta un TOCCO corto
               (l'uomo è saltato, la conclusione arriva nel secondo tempo). */
            if(P.hlSuccess===true&&P.hlReward==="goal"&&P.hlOutcomeKind!=="chance"){ballArcH=1.3;ballArcDur=0.52;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*3;ballArcTgtZ=_rz*6;}// dribbling-gol VERO → la palla punta la porta
            else{/* [7.218.0 revisione PO «non si capisce assolutamente che e un dribbling»] LA SPINTA E CORTA.
                 Il pallone veniva scagliato 8u avanti e fino a 5u di lato mentre l'eroe restava indietro: a schermo
                 si vedeva una palla che parte da sola verso l'erba vuota, non un uomo che salta l'avversario.
                 Ora e un tocco: poco piu di un passo avanti, appena di lato, raso terra. */
              ballArcH=0.28;ballArcDur=0.34;ballArcTgtX=G2X(P.playerX||50)+(P.hlSuccess===true?4.2:-4);ballArcTgtZ=G2Z(P.playerY||50)+_rz*4.5;}}
          else if(!t||t==="build"){ballArcT=0;ballArcActive=true;
            if(P.hlSuccess===true&&P.hlReward==="goal"&&P.hlOutcomeKind!=="chance"){ballArcH=1.5;ballArcDur=0.56;ballArcTgtX=AWAY_GOAL_X-3+Math.random()*3;ballArcTgtZ=_rz*6;}// costruzione-gol VERO → la palla punta la porta · [7.334.0] su CHANCE (corsa/lancio convertito, 7.8.10) niente mezzo tiro: si scende nel ramo corto
            else if(P.hlOffBall&&P.hlSuccess===true){
              /* [7.311.0 collaudo PO «l'azione con smarcati per ricevere (dal portiere) con esito positivo
                 sfarfalla, l'eroe praticamente non riceve palla»] LA CONSEGNA FINISCE SULL'EROE. Su una
                 situation OFF-BALL l'eroe non ha la palla: si smarca per RICEVERLA (qui la battuta e' del
                 portiere, `ballAt:"gk"`). Ma il bersaglio dell'arco di costruzione era `eroe +6u in avanti,
                 +12u di lato`: misurato su gi106... no, su gi158 «Costruzione dal basso» — la palla partiva
                 da (7,50), passava a 4.4u dall'eroe e proseguiva OLTRE. Ora atterra su di lui (micro-jitter
                 laterale ±1.5u per non sembrare calamitata) e l'arco e' piu' morbido: e' un appoggio, non un
                 lancio. */
              /* [7.467.0 collaudo PO #158 «assist dal nulla»] SI MIRAVA A DOVE L'EROE DOVEVA ESSERE, NON A
                 DOVE E'. Il 7.311 aveva gia' deciso la cosa giusta — la consegna finisce sull'eroe — ma il
                 bersaglio era lo SPOT LOGICO della situation (`P.playerX/Y`), che e' il punto d'apertura:
                 quando il build-up o l'AI off-ball hanno gia' spostato l'eroe, quel punto non e' piu' lui.
                 MISURATO su gi158: palla da x -27 a x -35, cioe' OTTO UNITA' ALL'INDIETRO, con l'eroe a
                 x -26,2 e il piu' vicino al punto d'atterraggio che era l'eroe stesso a 8,8u — un assist
                 assegnato a una palla che non ha toccato nessuno. E' la stessa classe del 7.464 (mirare a
                 un punto invece che a un uomo), qui sull'uomo che il codice aveva gia' scelto. Il ripiego
                 sullo spot resta per quando la mesh non c'e'. */
              ballArcH=0.8;ballArcDur=0.46;
              {const _hx467=(hero&&hero.position&&!(typeof window!=='undefined'&&window.__CPM_NO467))?hero.position.x:G2X(P.playerX||50);
               const _hz467=(hero&&hero.position&&!(typeof window!=='undefined'&&window.__CPM_NO467))?hero.position.z:G2Z(P.playerY||50);
               ballArcTgtX=_hx467;ballArcTgtZ=_hz467+_rz*1.5;}}
            else{ballArcH=0.9;ballArcDur=0.38;ballArcTgtX=G2X(P.playerX||50)+(P.hlSuccess===true?6:-4);ballArcTgtZ=G2Z(P.playerY||50)+_rz*12;}}// 3DV-14: build-up → corto ma visibile
          else ballArcActive=false;
          /* [7.512.0 R2 — VELOCITA' COERENTI PER TUTTE LE FAMIGLIE] Passata unica di normalizzazione
             (matematica IDENTICA al 7.196), ora a valle di TUTTA la catena: le 5 famiglie storiche hanno lo
             stesso risultato di prima (nessun ramo successivo ritoccava dur/bersaglio: erano else-if
             mutuamente esclusivi), e pass/tackle/build entrano per la prima volta — la loro durata
             autorata sopravvive come FORMA (rapporto sulla nominale 0,80), il tempo di volo e' distanza su
             velocita' di famiglia. __CPM_NO512 = rosso: le famiglie nuove tornano alle durate costanti. */
          if(ballArcActive){
            const _old512=(t==="shot"||t==="penalty"||t==="freekick"||t==="header"||t==="cross");
            /* ⚠️ dribble ESCLUSO e dichiarato: il suo ramo principale (7.369) normalizza gia' da se'
               (spunto+rampa su corsa e volo) — una seconda passata lo distorcerebbe. */
            const _nuove512=(t==="pass"||t==="tackle"||t==="build");
            if(_old512||(_nuove512&&!(typeof window!=='undefined'&&window.__CPM_NO512))){
              const _pxW=(P.playerX||50)-50,_pzW=((P.playerY||50)-50)*0.68;
              const _dA=Math.sqrt((ballArcTgtX-_pxW)*(ballArcTgtX-_pxW)+(ballArcTgtZ-_pzW)*(ballArcTgtZ-_pzW));
              const _vRef=(t==="shot"||t==="penalty"||t==="freekick")?27:(t==="header")?19:(t==="cross")?22:17;
              const _shape=clamp(ballArcDur/0.80,0.55,1.9);
              ballArcDur=clamp((_dA/_vRef)*_shape,0.24,1.55);
            }
          }
          /* [7.519.0 R3/4 — LE REAZIONI DI REPARTO: audit «nelle scene di tiro/testa/cross gli avversari
             sono comparse»] Le reazioni scriptate esistevano per 4 casi (GK, un difensore su tackle/dribble,
             intercetto del pass, barriera): su tiro, colpo di testa e cross NESSUN giocatore di movimento
             riceveva un gesto. Ora, accanto ai trigger GK: sul TIRO il difensore piu' vicino si allunga
             (tackle, canale _mateFx collaudato 7.250); sulla TESTA il marcatore salta con l'eroe (header);
             sul CROSS il difensore piu' vicino al punto d'atterraggio attacca di testa. Slot _mateFx a uso
             SEQUENZIALE: sul cross il finalizzatore (14039) lo riprende dopo, com'e' giusto. Tetto 9u:
             nessun gesto teletrasportato. __CPM_NO519 = rosso; testimone __CPM_REA519. */
          if(ballArcActive&&!P.hlDef&&!(typeof window!=='undefined'&&window.__CPM_NO519)){
            const _fam519=(t==="shot"||t==="penalty"||t==="freekick")?"tiro":(t==="header")?"testa":(t==="cross")?"cross":null;
            if(_fam519){
              const _px519=(_fam519==="cross")?ballArcTgtX:hero.position.x,_pz519=(_fam519==="cross")?ballArcTgtZ:hero.position.z;
              let _bm519=null,_bd519=1e9;
              sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.team!=='away'||src.gk)return;
                const _m=pp.mesh;if(!_m||_m===oppMesh)return;const _d=Math.hypot(_m.position.x-_px519,_m.position.z-_pz519);
                if(_d<_bd519){_bd519=_d;_bm519=_m;}});
              if(_bm519&&_bd519<9){
                sr.current._mateFx={mesh:_bm519,name:_fam519==="tiro"?"tackle":"header",t:_fam519==="tiro"?0.9:0.8};
                if(typeof window!=='undefined'&&window.__CPM_REA519!==undefined){try{window.__CPM_REA519.push({f:_fam519,d:+_bd519.toFixed(1)});}catch(_e){}}
              }
            }
          }
          if((_CPM_TEST||_SIT_TEST)&&typeof window!=="undefined"){try{window.__CPM_ARC={t,ok:P.hlSuccess,kind:P.hlOutcomeKind||null,on:!!ballArcActive,tx:+(+ballArcTgtX).toFixed(1),tz:+(+ballArcTgtZ).toFixed(1),h:+(+ballArcH).toFixed(2),dur:+(+ballArcDur).toFixed(2)};}catch(_e){}}/* [7.341.0] osservabilità del BERSAGLIO dell'arco (test-only): il setaccio delle azioni misurava «dove finisce la palla» e doveva dedurre dove il motore la stesse mandando */
          // [6.74.0 3D-2] ESITO GOL della famiglia tiro/testa: il punto d'atterraggio dell'ARCO deve stare
          //   NELLO SPECCHIO (semi-porta 3.66). Prima curled/far-post/1v1 atterravano a z fino a ±12 (fuori porta,
          //   sul prato) e l'in_net li "ritrascinava" dentro strisciando lungo la linea — gol surreali.
          //   I FAIL restano larghi (fuori/palo hanno bisogno di target fuori specchio).
          if(ballArcActive&&P.hlSuccess===true&&!P.hlDef&&(t==="shot"||t==="penalty"||t==="freekick"||t==="header")){
            ballArcTgtZ=clamp(ballArcTgtZ,-3.3,3.3);
            ballArcTgtX=Math.max(ballArcTgtX,AWAY_GOAL_X-4);// niente atterraggi troppo corti su un gol
          }
          /* [7.231.0 #39 collaudo PO «tiro e portiere fuori dalla porta» (gi24/26/27)] UNA PARATA ESISTE SOLO
             NELLO SPECCHIO. Sui FALLITI con esito «parata» i bersagli di variante restavano larghi (il 1v1
             mira z=±4-9, ben oltre il palo a ±3.66): il tiro «parato» usciva di porta e il portiere si
             tuffava FUORI dai pali per parare un pallone che era fuori. Stesso clamp del gol — il tiro parato
             è on-target per definizione; palo/fuori/murato restano larghi come devono. */
          if(ballArcActive&&P.hlSuccess===false&&!P.hlDef&&(t==="shot"||t==="penalty"||t==="freekick"||t==="header")&&(P.hlOutcomeKind==="saved"||P.hlOutcomeKind==="save")){
            ballArcTgtZ=clamp(ballArcTgtZ,-3.3,3.3);
            ballArcTgtX=Math.max(ballArcTgtX,AWAY_GOAL_X-4);
          }
          // [6.74.0 3D-8] WIND-UP: la palla parte DOPO il caricamento del gesto, non al frame 0.
          /* [7.513.0 R2/2 — IL CONTATTO E' UNA PROPRIETA' DELLA TABELLA: audit «cross e passaggi partono a
             contatto zero — la palla e' gia' partita quando la gamba passa sul pallone»] Il -0,24 era un `if`
             con lista di 4 famiglie: ora ogni famiglia dichiara il proprio caricamento in GESTURE_WIN.pre
             (cross 0,32 · pass 0,27, nuovi; le 4 storiche restano a 0,24). __CPM_NO513 = rosso: si torna
             alla lista. Testimone __CPM_PRE513 (flag dedicato) sulla riga della concessione. */
          if(ballArcActive&&!P.hlDef){
            if(typeof window!=='undefined'&&window.__CPM_NO513){if(t==="shot"||t==="penalty"||t==="freekick"||t==="header")ballArcT=-0.24;}
            else{const _pre513=gwOf(t,"pre")||0;if(_pre513>0)ballArcT=-_pre513;}
            if(typeof window!=='undefined'&&window.__CPM_PRE513!==undefined){try{window.__CPM_PRE513.push({t:t,pre:+(-Math.min(0,ballArcT)).toFixed(2)});}catch(_e){}}
          }
          // 5.65.0 — TRAIETTORIA DIFENSIVA VARIA (post-guard universale): sostituisce il rinvio lungo automatico
          //   verso la porta avversaria (effetto "ping-pong"). Legge il descrittore deciso a monte (P.hlDefTraj,
          //   deterministico/seedato) e piazza la palla in modo realistico e coerente col contesto — MAI verso la
          //   porta avversaria, capata ben prima dell'area offensiva. seekMate aggancia un compagno reale (posizioni VIVE).
          if(P.hlDef&&ballArcActive){const _px=P.playerX||50,_py=P.playerY||50;
            const _dt=P.hlDefTraj||{kind:(P.hlSuccess===true?'short_clear':'beaten'),poss:'contest',dx:(P.hlSuccess===true?11:-4),wide:0.3,side:(_py<=50?-1:1),arcH:(P.hlSuccess===true?1.6:0.5),arcDur:0.5};
            const _sideD=_dt.side||(_py<=50?-1:1);
            ballArcH=_dt.arcH!=null?_dt.arcH:1.4;ballArcDur=_dt.arcDur!=null?_dt.arcDur:0.5;
            let _gx=clamp(_px+(_dt.dx||0),6,68),_gy;// cap x=68 → MAI il rinvio-bomba fino alla porta avversaria
            const _touchY=_sideD<0?4:96;
            if(_dt.gkClaim){/* [7.238.0 gi44] «Chiama il portiere» riuscito: la palla va NELLE MANI del portiere
                di casa, che esce in PRESA (stessa macchina-gesto di gk_catch usata sul cross parato) */
              let _hgk38=null;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&src.gk)_hgk38=pp.mesh;});
              if(_hgk38){_gx=clamp((_hgk38.position.x+50)+1.2,2,20);_gy=clamp(_hgk38.position.z/0.68+50,20,80);
                if(!oppActType){oppActType="gk_catch";oppActT=0;oppMesh=_hgk38;_hgk38._divePz=_hgk38.position.z;_hgk38._diveYaw=_hgk38.rotation.y;_hgk38._diveToZ=clamp(G2Z(_gy),_hgk38.position.z-4,_hgk38.position.z+4);}}
              else {_gx=8;_gy=50;}
            }
            else if(_dt.toOwnGoal){_gx=1.5;_gy=50+(_sideD<0?-3:3);
              // [5.83.0 IA-3] il portiere di CASA finalmente si tuffa sul gol subito (prima era perennemente inerte)
              let _hgk83=null;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&src.gk)_hgk83=pp.mesh;});
              if(_hgk83&&!oppActType){oppActType="gk_dive";oppActT=0;oppMesh=_hgk83;const _gz83=G2Z(_gy);oppDiveDir=_gz83>=_hgk83.position.z?1:-1;_hgk83._divePz=_hgk83.position.z;_hgk83._diveYaw=_hgk83.rotation.y;_hgk83._diveToZ=clamp(_gz83,_hgk83.position.z-6,_hgk83.position.z+6);}
            }                              // [5.75.0 IA-2c] gol subito → palla nella PROPRIA porta (gx≈0)
            else if(_dt.kind==='beaten'){/* [7.247.0 gi35 «non si capisce la dinamica / sembra rubare la palla»]
                l'avversario che TI HA SALTATO prosegue palla al piede: il pallone va sul piede del portatore
                avversario più vicino, avanzato verso la NOSTRA porta (loro attaccano x decrescente) — prima il
                descrittore generico (dx -4 dall'eroe) faceva assestare la palla ADDOSSO all'eroe battuto, che
                leggeva come un furto riuscito. */
              let _bm47=null,_bd47=1e9;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='away'&&!src.gk){const d=Math.hypot(pp.mesh.position.x-ball.position.x,pp.mesh.position.z-ball.position.z);if(d<_bd47){_bd47=d;_bm47=pp.mesh;}}});
              if(_bm47){_gx=clamp(Math.min((_bm47.position.x+50)-7,(ball.position.x+50)-6),4,60);_gy=clamp(_bm47.position.z/0.68+50,6,94);}/* [7.250.0 gi35/54 «la palla torna indietro / sembra riuscire la difesa»] il contropiede AVANZA sempre: se il portatore avversario sta DIETRO la palla, il target (carrier-7) la faceva tornare INDIETRO rispetto alla porta di casa = letta come spazzata difensiva riuscita — ora il target è sempre più avanti della palla verso la nostra porta (min con ball-6) */
              else{_gx=clamp(_px-9,4,60);_gy=clamp(_py+(_touchY-_py)*(_dt.wide||0.3),4,96);}
            }
            else if(_dt.toTouch){_gx=clamp(_px+(_dt.dx||0),6,72);_gy=_touchY;}                  // rimessa laterale
            else if(_dt.toGoalLine){_gx=clamp(_px+(_dt.dx!=null?_dt.dx:-2),2,20);_gy=_sideD<0?12:88;}// angolo concesso (verso la propria bandierina)
            else{_gy=clamp(_py+(_touchY-_py)*(_dt.wide||0),4,96);}                          // avanti + spinta verso la fascia
            /* [7.252.0 gi35/54 «la palla deve andare in avanti e non indietro» — MISURATO con __CPM_ARC: su
               beaten il descrittore di traiettoria non era kind:'beaten' e il fallback mandava la palla a x
               CRESCENTE (30→41, 63→68 = verso la porta AVVERSARIA): l'avversario che ti salta non regala palla
               alla nostra difesa avanzata. Su OGNI fallimento difensivo (salvo gol subito/presa GK, che hanno
               la loro semantica) il pallone non può avanzare oltre il punto in cui sta: resta all'avversario
               che prosegue verso la NOSTRA porta. */
            if(P.hlSuccess===false&&!_dt.toOwnGoal&&!_dt.gkClaim)_gx=Math.min(_gx,clamp((ball.position.x+50)-4,4,96));
            ballArcTgtX=G2X(_gx);ballArcTgtZ=G2Z(_gy);
            if(_dt.seekMate){const _phX=G2X(_px),_phZ=G2Z(_py);let _bm=null,_bs=1e9;
              sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.team!=='home'||src.gk||pp.mesh===hero)return;
                const _fwd=pp.mesh.position.x-_phX;if(_dt.seekMate==='forward'&&_fwd<2)return;// il ricevente del contropiede è AVANTI
                const _rng=_dt.seekMate==='forward'?42:24;const d=Math.hypot(_fwd,pp.mesh.position.z-_phZ);
                if(d<_rng){const _sc=d-Math.max(0,_fwd)*(_dt.seekMate==='forward'?0.7:0.25);if(_sc<_bs){_bs=_sc;_bm=pp.mesh;}}});
              if(_bm){passTargetMesh=_bm;ballArcTgtX=clamp(_bm.position.x,G2X(6),G2X(68));ballArcTgtZ=_bm.position.z;ballArcH=Math.max(ballArcH,0.9);}}
            /* [7.250.0 gi31 «Non si vede l'eroe che intercetta»] PRIMA IL CONTATTO, POI IL PALLONE VIA: l'arco
               d'esito difensivo partiva a t0 mentre l'eroe arrivava sul pallone a ~0.3s — la palla scappava
               prima del tocco e l'intercetto non si leggeva mai. Sulla famiglia PORTATORE (niente inbound:
               lì la continuità del tiro in arrivo comanda) l'arco parte a -0.35s: palla ferma al contatto,
               piede sopra, POI l'esito (pattern wind-up -0.24 dei tiri). */
            if(!(P.hlDefTraj&&P.hlDefTraj.inbound)&&!_dt.toOwnGoal)ballArcT=-0.35;}
          ballArcIsBG=ballArcActive; // 3DV-11: usa TGT esplicito anche per archi HL (come BG arc)
          if(ballArcActive&&ballArcT>=0)contactFlashT=0;/* [6.74.0 3D-8] col wind-up il flash arriva all'impatto reale (gestito nel blocco arco) */
          // CROSS #1: aggancia il bersaglio del cross al MIGLIOR ricevente in area (CEN/ATT avanzati) → niente "cross verso il vuoto".
          //   FUORI dall'arcBlock (legge le posizioni reali, come il ramo pass) → la suite analitica resta pura. Blend 60% ricevente + 40% nominale; fallback se nessuno in area.
          crossRcvMesh=null;/* [6.74.0 3D-5] reset a ogni conclusione */
          if(t==="cross"&&ballArcActive&&!P.hlDef){let _bd=1e9,_brx=null,_brz=null,_brm=null;const _bx72=G2X(72);// 5.49.13: NON ri-targettizzare verso l'area avversaria se l'highlight è DIFENSIVO (era la causa della palla respinta fino alla porta avversaria)
            sr.current.players.forEach((pp,ii)=>{const s=(P.allPlayers||[])[ii];if(!s||s.team!=='home'||s.gk)return;const _rl=ii<10?ii:ii-10;if(_rl<6||pp.mesh.position.x<_bx72)return;const d=Math.hypot(pp.mesh.position.x-ballArcTgtX,pp.mesh.position.z-ballArcTgtZ);if(d<_bd){_bd=d;_brx=pp.mesh.position.x;_brz=pp.mesh.position.z;_brm=pp.mesh;}});
            if(_brx!=null&&_bd<24){ballArcTgtX=ballArcTgtX*0.4+_brx*0.6;ballArcTgtZ=ballArcTgtZ*0.4+_brz*0.6;crossRcvMesh=_brm;}}/* [6.74.0 3D-5] il miglior ricevente viene AGGANCIATO (correrà sul punto di caduta e incornerà) */
          // CIN-2: trigger reazione avversario — portiere tuffo su tiro/testa, difensore stumble/spin su contrasto/dribbling
          // [5.83.0 IA-2a/IA-3] niente tuffo sui tiri chiaramente FUORI (il GK guarda la palla uscire) e
          //   niente tuffo sul LANCIO del cross (un portiere non si tuffa su un traversone: sul cross parato
          //   ESCE con una presa — clip gk_catch finora mai usata; il tuffo sul cross arriva al 2° tocco).
          if(_CPM_TEST&&typeof window!=='undefined'){try{(window.__CPM_GKGATE=window.__CPM_GKGATE||[]).push({t:t||null,kind:P.hlOutcomeKind||null,def:P.hlDef?1:0,gk:awayGkMesh?1:0,arc:ballArcActive?1:0,vr:P.hlVariant||null});}catch(_e){}} /* [7.552 sonda] PERCHE' IL PORTIERE NON REAGISCE: registra gli ingressi del cancello (tipo di conclusione, esito, highlight difensivo, portiere in scena). */
          if(t==="cross"&&awayGkMesh&&!P.hlDef&&(P.hlOutcomeKind==="saved"||P.hlOutcomeKind==="save")){
            oppActType="gk_catch";oppActT=0;oppMesh=awayGkMesh;
            oppMesh._divePz=oppMesh.position.z;oppMesh._diveYaw=oppMesh.rotation.y;oppMesh._diveToZ=clamp(ballArcTgtZ,oppMesh.position.z-4,oppMesh.position.z+4);oppDiveDir=ballArcTgtZ>=oppMesh.position.z?1:-1;
            // [6.74.0 3D-4] il cross "parato" deve VOLARE verso la presa del portiere: prima il GK usciva ±4
            //   mentre il cross atterrava fino a z=±18 → presa a vuoto a 4-13u dalla palla. Ora l'arco converge sul GK.
            ballArcTgtZ=clamp(ballArcTgtZ,oppMesh.position.z-3.5,oppMesh.position.z+3.5);
            ballArcTgtX=clamp(ballArcTgtX,40,44.5);
          } else if((t==="shot"||t==="penalty"||t==="header"||t==="freekick")&&awayGkMesh&&!P.hlDef&&!(P.hlOutcomeKind==="wide"||P.hlOutcomeKind==="out"||P.hlOutcomeKind==="corner"||P.hlOutcomeKind==="blocked"||P.hlOutcomeKind==="wall_blocked"||P.hlOutcomeKind==="intercepted")){/* [7.197.0 S4] niente tuffo sul tiro MURATO: la conclusione muore sul muro a 5 metri dal tiratore, il portiere non c'entra nulla — prima si tuffava su un pallone che non gli arrivava mai */// 5.49.11: niente tuffo su azione difensiva · [6.4.1 R2.2] niente tuffo sul corner (palla fuori) · [6.76.0 LMV-B1] anche la PUNIZIONE parata/in porta fa tuffare il GK (prima "parata dal nulla": deflect+posa senza tuffo)
            /* [7.203.0 direttiva PO «sembra davvero una partita di calcio»] IL PORTIERE NON SI TUFFA SU TUTTO.
               Ogni conclusione nello specchio faceva partire un tuffo a corpo disteso, anche su un pallone
               calciato ADDOSSO al portiere o da due passi: nel calcio quello è un RIFLESSO — ci si oppone col
               corpo, si allargano braccia e gambe, non ci si butta di lato lasciando passare la palla dove si
               era un istante prima. È anche il motivo per cui `anim-gk-block.glb` veniva scaricata a ogni
               partita e non veniva MAI suonata (registrata nella mappa gesti, ma nessun `oppActType` la
               chiedeva). Ora: parata con la palla entro ~2.4u dal portiere, oppure conclusione da distanza
               ravvicinata (l'area piccola), ⇒ `gk_block`; su tutto il resto il tuffo resta com'era. */
            const _svK203=(P.hlOutcomeKind==="saved"||P.hlOutcomeKind==="save");
            const _dz203=Math.abs(ballArcTgtZ-awayGkMesh.position.z);
            const _closeShot203=(P.playerX||50)>=87;
            oppActType=(_svK203&&(_dz203<2.4||_closeShot203))?"gk_block":"gk_dive";oppActT=0;oppMesh=awayGkMesh;
            if(_CPM_TEST&&typeof window!=='undefined'){try{const _gc=window.__CPM_GKACT||(window.__CPM_GKACT={});_gc[oppActType]=(_gc[oppActType]||0)+1;_gc.last=oppActType;_gc.lastDz=+_dz203.toFixed(2);_gc.lastTz=+ballArcTgtZ.toFixed(2);_gc.lastX=P.playerX;_gc.lastKind=P.hlOutcomeKind;}catch(_e){}}/* [7.203.0] hook test-only: la probe verifica che il riflesso scatti sui tiri centrali/ravvicinati e il tuffo su quelli angolati · [7.231.0] +lastTz: la z ASSOLUTA del bersaglio (lastDz è relativo al GK, che può stare a z±2 → non prova da solo che il tiro parato sia nello specchio) */
            oppDiveDir=ballArcTgtZ>=oppMesh.position.z?1:-1; // tuffo VERSO il lato del tiro
            oppMesh._divePz=oppMesh.position.z;oppMesh._diveYaw=oppMesh.rotation.y;
            // PARATE #3: la PORTATA del tuffo dipende dall'esito → su una PARATA il portiere si distende fino alla palla (parata credibile),
            //   su GOL/fuori il tuffo resta più corto (non ci arriva: parata mancata convincente, niente "quasi-presa" incoerente).
            const _isSaveDv=(P.hlOutcomeKind==="saved"||P.hlOutcomeKind==="save");
            const _saveReach=_isSaveDv?9:6;// M1 fix: legge il PROP (hlOutcomeVariant qui è ancora null) → ora la portata estesa su parata si attiva davvero
            const _dvTgt74=_isSaveDv?ballArcTgtZ:(oppMesh.position.z+(ballArcTgtZ-oppMesh.position.z)*0.55);/* [6.74.0 3D-3] sul GOL il tuffo resta CORTO (battuto, ~55% della distanza): prima il reach 6 copriva comunque tutti i target nello specchio → il GK si distendeva ESATTAMENTE sulla z d'ingresso e la palla gli passava ATTRAVERSO il corpo su ogni rigore/tiro segnato */
            oppMesh._diveToZ=clamp(_dvTgt74,oppMesh.position.z-_saveReach,oppMesh.position.z+_saveReach);
            oppMesh._diveBallY=ballArcTgtY;oppMesh._diveDur=(typeof window!=='undefined'&&window.__CPM_NO465)?clamp(ballArcDur*0.92,0.48,1.20):clamp((ballArcDur-Math.min(0,ballArcT))*1.10,0.55,1.70);/* [7.465.0] IL TUFFO DEVE DURARE QUANTO IL VOLO. Legandolo a `ballArcDur*0.92` il gesto finiva PRIMA che la palla arrivasse — e non per poco: l'arco parte con `ballArcT` NEGATIVO (il wind-up del 6.74), quindi il tempo reale fino all'arrivo e' `ballArcDur - ballArcT`, sempre maggiore della sola durata dell'arco. Misurato dopo aver agganciato l'estensione al pallone: il gesto si spegneva col portiere al 31-61% della distesa. Ora la vita del tuffo copre il volo (+10% di margine), e i due morsetti si allargano di conseguenza. *//* [7.215.0] quota e tempo della conclusione → il tuffo li segue invece di essere sempre uguale a se stesso */
          } else if(t==="tackle"||t==="dribble"){
            let nearD=99,nearM=null;
            sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='away'&&!src.gk){const d=Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z);if(d<nearD){nearD=d;nearM=pp.mesh;}}});
            if(nearM){oppActType=t==="tackle"?"opp_stumble":"opp_spin";oppActT=0;oppMesh=nearM;oppMesh._divePz=nearM.position.z;}
          } else if(t==="freekick"){// 3DV-4: barriera — i 3 avversari più vicini saltano
            const wallMs=[];sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='away'&&!src.gk){wallMs.push({m:pp.mesh,d:Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z)});}});
            wallMs.sort((a,b)=>a.d-b.d);wallMs.slice(0,3).forEach(w=>{w.m._wallJumpT=0;});
          }
          /* [7.467.0 #13] L'EROE ARRETRA PER RINCORRERE. Si sposta la MESH (non il bersaglio logico: la firma
             golden guarda quello, e resta identica), all'indietro rispetto alla direzione del tiro; il driver
             dell'eroe lo riporta sul pallone durante il wind-up. Solo punizione, solo se l'arco ha un wind-up. */
          if(t==="freekick"&&ballArcT<0&&hero&&hero.position){try{
            const _dxR=ballArcTgtX-hero.position.x,_dzR=ballArcTgtZ-hero.position.z,_dlR=Math.hypot(_dxR,_dzR)||1;
            hero.position.x-=_dxR/_dlR*3.2;hero.position.z-=_dzR/_dlR*3.2;
            hero._px=hero.position.x;hero._pz=hero.position.z;hero._vx=0;hero._vz=0;
          }catch(_e467){}}
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _af=(window.__CPM_ARCFIRE457=window.__CPM_ARCFIRE457||[]);if(_af.length<40)_af.push({ph:P.matchPhase||null,ht:P.hlType||null,t:t||null,hs:P.hlSuccess,def:!!P.hlDef,rew:P.hlReward||null,kind:P.hlOutcomeKind||null,sk:(P.hlSitKey!=null?P.hlSitKey:null),arc:!!ballArcActive,dur:+(+ballArcDur).toFixed(2),tgx:+(+ballArcTgtX).toFixed(1),bx:+ball.position.x.toFixed(1)});}catch(_e){}}
          }; // QW-A: contact flash — fine arrow fireConclusion (CINE-TL: conclusione ora richiamabile)
          // CINE-TL Fase 2: in GIOCO REALE anteponi la COSTRUZIONE (build-up) dell'azione, poi la conclusione.
          //   Abilitato per le conclusioni di TIRO (il tiro non deve "comparire dal nulla"). In test (?cpmtest=1)
          //   salta il build-up → la conclusione parte subito → i check del gate restano identici.
          let _tlc=null;
          const _tlKind=P.hlType;// R5-backbone: build-up esteso a shot + cross + header (mappatura conclusione pulita); dribble/pass restano immediati
          const _rvwChainSkip=(typeof window!=='undefined'&&window.__CPM_REVIEW&&P.hlChain);/* [7.234.0 #51 misura: la conclusione della catena arrivava a 6.5-7s dal tap, il PO aveva già votato] in REVISIONE il secondo tempo NON ripete un build-up: il primo tempo è appena stato visto — la catena va dritta alla conclusione */
          /* [7.409.0 collaudo PO gi158 «l'azione non e' stata costruita: si e' freezato il pallone vicino
             all'eroe e poi esito del gol» · gi27 «il triangolo con il compagno non si e' visto, il pallone
             era autonomo» · gi82] LA COSTRUZIONE APRE ANCHE A PASS E BUILD. Il cancello ammetteva solo
             shot/cross/header («dribble/pass restano immediati», R5): progressioni e uno-due andavano
             dritti alla conclusione — misurato col guardiano del build-up su gi158/gi28/gi118: CIECO, zero
             costruzioni osservate. Il costruttore le aveva gia': COMBINATION e' il dai-e-vai (passaggio →
             restituzione → conduzione) e il fallback e' lo scambio breve della costruzione dal basso. La
             conclusione vera (l'assist) resta di fireConclusion, come per il cross; la macchina del
             consumo — skip dei beat soddisfatti (7.395), rendez-vous, continuita' (7.387) — e' la stessa
             gia' collaudata. Il dribbling resta immediato: le sue note sono di sincronia, non di
             costruzione mancante. Sotto ?cpmtest=1 tutto invariato (gate identico). */
          if(!_cineTest&&!_rvwChainSkip&&!P.hlDef&&(_tlKind==="shot"||_tlKind==="cross"||_tlKind==="header"||_tlKind==="pass"||_tlKind==="build")&&typeof buildHLTimeline==="function"){/* [7.238.0 batch PO gi44 «Fa gol erroneamente l'eroe!!!»] NIENTE BUILD-UP D'ATTACCO SUGLI HIGHLIGHT DIFENSIVI: la respinta di testa («Allontana!») deriva hlType header → l'executor costruiva cross+incornata VERSO LA PORTA AVVERSARIA mentre la logica segnava il gol SUBITO (banner GOL sopra l'azione finta = l'eroe che segna). Sul difensivo la scena appartiene a _defTraj (toOwnGoal/spazzata/intercetto), che l'executor scavalcava */
            try{_tlc=buildHLTimeline({type:P.hlType,pattern:P.hlPattern,variant:P.hlVariant},{x:P.playerX,y:P.playerY,reward:P.hlReward,support:P.support,nearby_def:P.nearby_def});}catch(e){_tlc=null;}
          }
          if(_tlc&&_tlc.beats.length>1&&typeof resolveTimeline==="function"){
            tlSeg=resolveTimeline(_tlc);
            /* [7.236.0 batch «compare e scompare»] la coreografia deve essere UMANAMENTE corribile: il burst
               della timeline chiedeva ~25 u/s (90 km/h) e nessun inseguitore poteva starci dietro. Pavimento
               sulla durata dei segmenti di CONDUZIONE dell'eroe (HERO→HERO): velocità max ~11 u/s. Solo qui
               (consumo executor), la timeline pura e i suoi test node restano intatti; il gate salta l'executor. */
            tlSeg.forEach(g=>{if(g&&g.fromId==='HERO'&&g.toId==='HERO'&&g.from&&g.to){const _d51=Math.hypot(g.to[0]-g.from[0],g.to[1]-g.from[1]);if(_d51>1)g.dur=Math.max(g.dur||0,_d51/11);}});
            // R5-backbone: il build-up termina alla PRIMA beat di conclusione della famiglia hlType
            //   (cross→beat 'cross', header→beat 'header', shot/altri→'shot'/'header') così fireConclusion
            //   esegue SEMPRE la conclusione reale una volta sola (niente doppioni cross/testa).
            //   Per il tiro _cn = ultima beat (concl) = length-1 → comportamento INVARIATO (zero regressione shot).
            const _cf=(_tlKind==="cross")?["cross"]:(_tlKind==="header")?["header"]:["shot","header"];
            let _cn=-1;for(let _i=0;_i<tlSeg.length;_i++){if(_cf.indexOf(tlSeg[_i].tag)>=0){_cn=_i;break;}}
            tlBuildN=(_cn>0)?_cn:(tlSeg.length-1);
            tlMap=mapCineActors(_tlc);tlOn=tlBuildN>0;tlT=0;
            if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_TLSEG={k:P.hlSitKey,n:tlBuildN,seg:tlSeg.map(g=>({tag:g.tag,kind:g.kind,f:g.fromId,t:g.toId,from:g.from,to:g.to,dur:g.dur}))};}catch(_e){}}/* [7.414.0] LA TIMELINE VIVA SI PUO' LEGGERE (test-only): senza, «quale beat ha teletrasportato la palla alla consegna» resta una deduzione dai fotogrammi invece di un piano scritto */
            /* [7.395.0 collaudo PO codice 001 + «SALTO del pallone di 8,7u» — l'ULTIMA sorgente, e la piu'
               vista] UN BEAT GIA' AVVENUTO NON SI RIGIOCA ALL'INDIETRO. All'avvio del build-up il pallone
               sta ai piedi dell'Eroe — ce l'ha appena portato la CONSEGNA dell'intro, un passaggio vero e
               visibile — e il primo beat della costruzione e' proprio quel passaggio: ripartiva dal punto
               PIANIFICATO del compagno, teletrasportando la palla all'indietro di 8-13 unita' per rigiocare
               una scena gia' vista. Misurato con l'attribuzione per stato: OGNI salto >5u delle scene
               segnalate (gi7, gi57, gi101, gi113, piu' gi4 e gi12) sta esattamente sulla transizione
               tl 0→1, primo beat `pass` — 8,1-12,6u, i numeri delle note del PO. Il 7.387 aveva risparmiato
               il primo beat credendo il riposizionamento coperto dalla finestra di grazia del rilevatore:
               falso — la grazia decorre dall'apertura della SCENA, e il build-up parte secondi dopo.
               Ora i beat di passaggio INIZIALI gia' soddisfatti — pallone entro 2,4u dal loro punto
               d'arrivo — si SALTANO facendo avanzare il cronometro della timeline: niente teletrasporto,
               niente passaggio doppione, e la firma del backbone e' intatta perche' la timeline PURA non
               cambia (cambia solo da dove il consumo comincia). Un beat NON soddisfatto ferma lo
               scorrimento: se la palla e' davvero altrove, la costruzione si gioca tutta come prima. */
            if(tlOn){try{let _ac395=0,_sk395=0;
              for(let _i=0;_i<tlBuildN;_i++){const _g395=tlSeg[_i];
                if(!(_g395&&(_g395.kind==='pass'||_g395.kind==='through'||_g395.kind==='give'||_g395.kind==='cross')))break;
                /* «soddisfatto» = la palla e' dal DESTINATARIO VERO del beat, non sul punto del piano: la
                   consegna dell'intro atterra sui piedi dell'Eroe reale, che dal piano puo' distare dieci
                   unita' — misurato su gi4, dove il criterio a punto pianificato non scattava mai */
                const _tid395=(typeof _g395.toId==='string')?_g395.toId:null;
                const _tm395=(_tid395==='HERO')?hero:((tlMap&&_tid395)?tlMap[_tid395]:null);
                const _rx395=_tm395?_tm395.position.x:G2X(_g395.to[0]),_rz395=_tm395?_tm395.position.z:G2Z(_g395.to[1]);
                const _d395=Math.hypot(ball.position.x-_rx395,ball.position.z-_rz395);
                if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{(window.__CPM_SKIP395=window.__CPM_SKIP395||[]).push({i:_i,kind:_g395.kind,toId:_tid395,d:+_d395.toFixed(1),bx:+ball.position.x.toFixed(1),bz:+ball.position.z.toFixed(1),rx:+_rx395.toFixed(1),rz:+_rz395.toFixed(1),hm:!!_tm395});}catch(_e){}}
                /* [7.411.0 collaudo PO gi180 «non arriva il pallone al compagno, la palla fa tutto da sola»
                   + rosso del guardiano su gi27/az1 «eroe 0,8u contro 18,8u di palla»] UN BEAT CHE PORTA LA
                   CORSA DELL'EROE NON SI SALTA. Lo skip dei beat gia' soddisfatti evita il passaggio
                   doppione — ma il beat del «dai» contiene anche il «VAI»: la corsa dell'eroe verso lo
                   spazio, che veniva saltata con lui (misurato: nella passata pulita l'eroe corre 59→75 e
                   la scena e' un dai-e-vai vero; nella passata con skip resta di pietra). Se il beat
                   soddisfatto sposta l'EROE di piu' di 2 unita', si GIOCA: con la continuita' del 7.387 la
                   palla parte dalla sua posizione reale (gia' dal compagno, quasi ferma) e l'eroe fa la sua
                   corsa — il doppione non c'e' comunque. */
                const _hb395=_g395.before&&_g395.before.HERO,_ha395=_g395.after&&_g395.after.HERO;
                if(_hb395&&_ha395&&Math.hypot(_ha395[0]-_hb395[0],_ha395[1]-_hb395[1])>2)break;
                if(_d395<=3.2){_ac395+=(_g395.dur||0);_sk395=_i+1;}
                else break;}
              if(_sk395>0)tlT=_ac395;}catch(_e395){}}
            /* [7.411.0 — chiude il residuo dichiarato dal 7.395: gi103/az1, «l'ingresso del build-up AEREO
               che comincia con la conduzione di un compagno: la palla deve raggiungerlo, e il viaggio
               onesto per quel caso non e' ancora scritto»] IL VIAGGIO ONESTO, SCRITTO. Se il primo beat e'
               una CONDUZIONE di un compagno e la palla sta a piu' di 3,5 unita' da lui, si antepone un
               beat di SERVIZIO: un passaggio vero dalla posizione reale della palla ai suoi piedi. Il
               rendez-vous del 7.395 (pass→carry) fa gia' scivolare l'atterraggio sul piede vero, e la
               conduzione riceve un pallone consegnato — niente piu' salto d'ingresso (misurato 3,3-4,8u
               a seconda della passata). */
            if(tlOn){try{const _fb411=tlSeg[0];
              if(_fb411&&_fb411.kind==='carry'&&typeof _fb411.fromId==='string'&&_fb411.fromId!=='HERO'){
                const _cm411=(tlMap&&tlMap[_fb411.fromId])||null;
                if(_cm411){const _cgx411=_cm411.position.x+50,_cgy411=_cm411.position.z/0.68+50;
                  const _bgx411=ball.position.x+50,_bgy411=ball.position.z/0.68+50;
                  const _dd411=Math.hypot(_cgx411-_bgx411,_cgy411-_bgy411);
                  if(_dd411>3.5){tlSeg.unshift({tag:'feed',kind:'pass',dur:Math.min(0.9,0.25+_dd411/28),from:[_bgx411,_bgy411],to:[_cgx411,_cgy411],fromId:null,toId:_fb411.fromId,before:{},after:{}});tlBuildN++;}}}
            }catch(_e411){}}
            if(!tlOn)fireConclusion();
          } else if(!_cineTest&&P.hlDef&&P.hlDefTraj&&P.hlDefTraj.inbound){
            /* [7.239.0 #55] IL PALLONE AVVERSARIO ARRIVA DAVVERO: pre-fase difensiva via executor con un
               segmento manuale — dalla sorgente avversaria al punto di contatto dell'eroe; a fine volo
               fireConclusion esegue gesto + traiettoria d'esito (_defTraj) in continuità. Sotto ?cpmtest=1
               si salta (gate identico); la famiglia «portatore» non ha inbound (tackle-carrier già in scena). */
            try{
              const _hx55=P.playerX||50,_hy55=P.playerY||50;
              let _sx55=null,_sy55=null,_bd55=1e9,_sm58=null;
              sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.team!=='away'||src.gk)return;
                const _gx55=pp.mesh.position.x+50,_gy55=pp.mesh.position.z/0.68+50;const _fw55=_gx55-_hx55;if(_fw55<3)return;
                const d=Math.hypot(_fw55,_gy55-_hy55);if(d<_bd55&&d<32){_bd55=d;_sx55=_gx55;_sy55=_gy55;_sm58=pp.mesh;}});
              if(_sx55==null){_sx55=clamp(_hx55+16,4,96);_sy55=clamp(_hy55+(_hy55<50?9:-9),4,96);}
              const _aer55=P.hlDefTraj.inbound==="aerial";
              /* [7.244.0 gi45 «Non si vede l'avversario che calcia»] la consegna inbound partiva da un punto
                 senza autore: il mesh sorgente ora ESEGUE il calcio nell'istante in cui il pallone parte
                 (gesto procedurale _rcvT — swing di gamba generico per ogni mesh — + clip GLB via _mateFx). */
              if(_sm58){_sm58._rcvT=0;sr.current._mateFx={mesh:_sm58,name:"kick",t:0.55};_versoPorta673(_sm58,"kick");}
              /* [7.248.0 gi45 «Sembra un autogol»] sul GOL SUBITO la palla non passa PER l'eroe (che poi la
                 «accompagnerebbe» in rete = autogoal percepito): il tiro lo SUPERA di fianco — consegna offset
                 di ~3u laterali, l'eroe si lancia e manca, la traiettoria d'esito prosegue in porta da lì. */
              const _ogF48=(P.hlSuccess===false&&P.hlDefTraj&&P.hlDefTraj.toOwnGoal)?((_hy55<=50)?-3:3):0;
              tlSeg=[{tag:"inbound",kind:_aer55?"cross":"through",dur:_aer55?0.62:0.42,from:[_sx55,_sy55],to:[_hx55,clamp(_hy55+_ogF48,4,96)],before:{},after:{}}];
              tlBuildN=1;tlMap=null;tlOn=true;tlT=0;
            }catch(_e){fireConclusion();}
          } else { fireConclusion(); }
        }
        if(_curPh==="hl_intro"||(_curPh==="hl_move"&&prevPhase==="playing")){repCount=0;repHead=0;replayDone=false;}
        if(_curPh!=="hl_result"&&replaying){replaying=false;setReplayOn(false);}
        if(_curPh!=="hl_result"){sr.current._ccx460=null;/* [7.460.0] il contesto dichiarato non sopravvive alla scena: un latch stantio dispatcherebbe il post-arco della scena precedente */if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&prevPhase==="hl_result"){try{const _ao=(window.__CPM_ARCORPHAN457=window.__CPM_ARCORPHAN457||[]);if(_ao.length<40)_ao.push({to:_curPh||null,arc:!!ballArcActive,at:+(+ballArcT).toFixed(2),dur:+(+ballArcDur).toFixed(2),pa:+(+hlPostArcT).toFixed(2),pt:hlPostArcType||null,bx:+ball.position.x.toFixed(1)});}catch(_e){}}sr.current._mateFx=null;/* [7.209.0] */if(!(typeof window!=='undefined'&&window.__CPM_NO546))sr.current._netOk535=false;/* [7.533.0 MP-0e — ipotesi H4] il certificato-rete NON sopravvive al cambio di fase: era azzerato solo allo snap (r.12882) e la race della consegna-383 poteva lasciarlo VERO nella scena dopo — guardiano geometrico cieco su un certificato stantio */sr.current._tlHeroEnd=null;/* [7.236.0] */sr.current._hlAdv=null;/* [7.358.0] il latch anti-rientro vive quanto la scena */hlPostArcT=-1;hlPostArcType=null;heroPostT=-1;heroPostType=null;gkSaveCelebT=-1;gkSaveMesh=null;hlInNetFlashed=false;hlPostVY=0;hlPostVX=0;/* [7.514.0] */passTargetMesh=null;crossRcvMesh=null;_arcSrcX=null;_arcSrcZ=null;/* [6.74.0 3D-5/6] cleanup */hlOutcomeVariant=null;tlOn=false;sr.current._tlK381=null;sr.current._tlC381=null;sr.current._tlCP382=null;sr.current._tlBi387=null;sr.current._tlFrom387=null;sr.current._cgDur=null;/* [7.244.0] */sr.current._rcvCtl=null;/* [7.249.0] */sr.current._cgHold=null;/* [7.253.0] */sr.current._arRcv=null;/* [7.299.0] il ricevente bloccato della consegna non sopravvive al cambio di scena */sr.current._arLandX=null;/* [7.310.0] e nemmeno il pavimento del punto d'atterraggio */sr.current._o2Fin=null;sr.current._o2Push=0;sr.current._o2Wall415=null;sr.current._pkCol415=null;/* [7.322.0] l'uno-due e l'avanzamento del «vai» non sopravvivono al cambio di scena — [7.415.0] nemmeno il muro agganciato, ne' il raccoglitore del dribbling perso */sr.current.players.forEach(pp=>{if(pp.mesh){pp.mesh._failRunT=null;pp.mesh._cgRun=null;if(pp.mesh._rcvT!=null){pp.mesh._rcvT=null;pp.mesh.position.y=0;if(pp.mesh._lR)pp.mesh._lR.rotation.x=0;if(pp.mesh._lL)pp.mesh._lL.rotation.x=0;pp.mesh._runToX=null;pp.mesh._runToZ=null;}}});}// reset post-arco + executor timeline + corsa-fail compagno · [6.45.0 RC] reset anche _rcvT (uno skip-veloce del result trascinava la gamba di ricezione + posizione congelata nell'highlight dopo)
        if(_curPh==="playing"||_curPh==="ended"||_curPh==="walkout"){preActionT=-1;
          // CINE-6: ripristina rete e portiere se si esce dall'esito
          if(sr.current.goalNet){const _gn=sr.current.goalNet;if(_gn._restX!==undefined)_gn.position.x=_gn._restX;_gn.material.opacity=0.42;}
          netBulgeT=-1;prevInNet=false;
          if(concededT>=0&&awayGkMesh){if(awayGkMesh._hd)awayGkMesh._hd.rotation.x=0;awayGkMesh._aL.rotation.z=0;awayGkMesh._aR.rotation.z=0;}concededT=-1;}
        // ATE-4: zone ring — accendi su hl_intro, colora per tipo; spegni su playing/ended
        if(_curPh==="hl_intro"){zoneRingT=0;zoneRingMat.color.setHex(HL_ZONE_COL[P.hlType]||0xffffff);preActionT=1.5;
          // item 5 (5.49.5): la forma tattica pre-azione (corse in area/smarcamenti per CROSS/SHOT/THROUGH, schieramento difensivo)
          //   è SETTLED già al PRIMO fotogramma dell'highlight (preActionT pieno, non 0) → le squadre sono subito schierate correttamente
          //   per la situazione, niente "ramp-in" visibile sotto il freeze. Solo gioco reale (il gate salta hl_intro → motion intatto).
          if(ballArcActive){ballArcActive=false;ballArcIsBG=false;contactFlashT=-1;_arcSrcX=null;_arcSrcZ=null;}}/* COERENZA: entrando nell'highlight si annulla QUALSIASI arco ancora in volo — [7.42.1 collaudo PO «nelle catene il pallone si blocca in posizioni illogiche»] prima si spegneva SOLO l'arco BG: sulle CATENE l'arco d'ESITO della prima azione (deflect/chance verso l'area) restava vivo e la mesh palla PENDEVA A MEZZ'ARIA vicino alla porta per tutto l'hl_intro, mentre la nuova azione riparte dal punto d'assestamento (7.34.1). Il nuovo HL parte SEMPRE dal suo stato-palla pulito. */
        if(_curPh==="hl_intro"){_chooseT=0;_hlSnap=true;sr.current._cutAt=performance.now();sr.current._cutSrc456="fase";}// FREEZE #2: all'AVVIO dell'highlight → snap dei giocatori in posizione + congelamento (così non si muovono in cronaca→intro)
        if(_curPh==="hl_choose")_chooseT=0; else if(_curPh==="playing"||_curPh==="ended"||_curPh==="walkout"||_curPh==="hl_result")_chooseT=-1;// timer di lettura: parte entrando in hl_choose; azzerato fuori dalla fase di lettura
        if(_curPh==="playing"||_curPh==="ended"||_curPh==="walkout"){zoneRingT=-1;zoneRingMat.opacity=0;}
      }
      prevPhase=_curPh;
      // ATE-4: zone ring RAF — entry scale-in + pulse durante HL; invisibile fuori HL
      {const _inHL=_curPh==="hl_intro"||_curPh==="hl_move"||_curPh==="hl_choose";
       if(_inHL&&zoneRingT<0)zoneRingT=0;
       if(zoneRingT>=0){zoneRingT+=dt;
         const _zp=HL_ZONE_3D[P.hlZone]||{x:28,z:0};
         zoneRing.position.x=_zp.x;zoneRing.position.z=_zp.z;
         const _entry=Math.min(zoneRingT/0.45,1);
         zoneRingMat.opacity=_entry*(0.28+Math.sin(now*0.003)*0.09);
         zoneRing.scale.setScalar(1+(1-_entry)*2.0);}
       else zoneRingMat.opacity=0;}
      // Sprint 3D-11A: trigger burst al gol — rileva cambio di waveEvent.t
      const _we=P.waveEvent;
      if(_we&&_we.t&&_we.t!==prevWaveT){prevWaveT=_we.t;goalBurstT=0;goalBurstHome=!!_we.home;goalBurstStadHome=(_we.stadiumHome!=null?!!_we.stadiumHome:!!_we.home);shakePow=0.55;
        // QW-C: esultanza eroe sul gol di casa
        if(goalBurstHome){concededT=0;}/* [7.384.0] l'attesa del piano riparte a ogni gol */// CINE-6: gol di casa → il portiere avversario si dispera
        // [7.98.0] coriandoli SOLO sul gol della squadra dell'EROE (celebrazione player-centrica): prima esplodevano anche sul gol AVVERSARIO (in trasferta = gol della squadra di CASA) → sembrava che il gioco festeggiasse un gol SUBITO. Il tint dei settori (goalBurstStadHome) resta venue-aware.
        if(goalBurstHome){const _cx=AWAY_GOAL_X;
          for(let i=0;i<CONF_N;i++){confPos[i*3]=_cx+(Math.random()-0.5)*14;confPos[i*3+1]=1+Math.random()*4;confPos[i*3+2]=(Math.random()-0.5)*20;
            confVel[i*3]=(Math.random()-0.5)*10;confVel[i*3+1]=6+Math.random()*12;confVel[i*3+2]=(Math.random()-0.5)*10;}
          confGeo.attributes.position.needsUpdate=true;confMat.opacity=0.92;confActive=true;confMat.color.set(_hColInt);}}
      /* [7.384.0 collaudo PO «le esultanze non funzionano»] L'ESULTANZA SI ARMA DAL PIANO, NON DALL'ONDA.
         Il gol produce DUE aggiornamenti di stato distinti: l'onda del pubblico (`waveEvent`) e il piano
         d'esultanza (`celebPlan`). Il cronometro si armava dalla prima, e il renderer la vede per primo:
         l'esultanza cominciava a consumarsi con il piano ancora nullo, cioe' senza clip, senza corsa e
         senza la sua durata vera. Su una macchina lenta, dove pochi fotogrammi coprono l'intera
         esultanza, quei fotogrammi erano TUTTI — misurate sei esultanze su sei con lo zero per cento di
         clip. Non e' una gara che si possa vincere aspettando: e' una dipendenza sbagliata. Il piano E'
         l'esultanza, quindi e' lui a farla partire, e per costruzione non puo' piu' mancare.
         Effetto collaterale voluto: un gol della simulazione di sfondo, che manda l'onda senza costruire
         nessun piano, non arma piu' un'esultanza muta — il boato resta, la pantomima no. */
      {const _cpk84=(P.celebPlan&&P.celebPlan.key)||null;
       if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _c=(window.__CPM_ARM392=window.__CPM_ARM392||{});_c.fr=(_c.fr||0)+1;if(_cpk84){_c.conPiano=(_c.conPiano||0)+1;_c.key=_cpk84;_c.memo=sr.current._celKey84;}_c.ph=P.matchPhase;_c.sk=P.hlSitKey;_c.celebT=+celebT.toFixed(2);}catch(_e){}}
       if(_cpk84&&_cpk84!==sr.current._celKey84){sr.current._celKey84=_cpk84;celebT=0;sr.current._celAt392=now;
         sr.current._celPlan393=P.celebPlan;/* [7.393.0] L'ESULTANZA SI TIENE UNA COPIA DEL PIANO. Il piano vive nello stato React e chiunque puo' azzerarlo; l'azzeramento differito del 7.392 e' in tempo d'OROLOGIO, ma l'esultanza vive in tempo di SCENA — e headless GLB-ON un secondo d'orologio compra una frazione di secondo di gioco: misurato, il piano raggiungeva il renderer per 4 fotogrammi su 47 di esultanza, e la clip non si montava mai (0%). Con la copia scattata QUI, all'armamento, nessun azzeramento esterno puo' piu' spegnere un'esultanza in corso: la copia muore con lei. *//* [7.392.0] QUANDO e' nata: serve a non ucciderla nello stesso fotogramma in cui nasce */
         if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_CELDX=0;window.__CPM_CELSTEP=0;window.__CPM_CELY=0;window.__CPM_CELN=0;window.__CPM_CELPOS=null;window.__CPM_CELFR=0;window.__CPM_CELGST=0;window.__CPM_CELTS=0;window.__CPM_CELARM=0;window.__CPM_CELPREV=null;}catch(_e84){}}/* i contatori appartengono a UNA esultanza */}}
      if(goalBurstT>=0){goalBurstT+=dt;const _u=Math.min(goalBurstT/1.8,1);
        goalBurstLight.intensity=(1-_u*_u)*2.8;goalBurstLight.position.x=goalBurstHome?AWAY_GOAL_X:HOME_GOAL_X;
        if(_u>=1){goalBurstLight.intensity=0;goalBurstT=-1;}}
      // ATE-1/2: arco palla BG durante "playing" — cattura destinazione 3D esatta per sync orizzontale
      {const _ba=P.bgAction;
       if(_ba&&_ba.t&&_ba.t!==prevBgT&&_curPh==="playing"){prevBgT=_ba.t;
         const _arc=BALL_ARC_BY_TYPE[_ba.type];
         if(_arc&&!ballArcActive){ballArcH=_arc.h;ballArcDur=_arc.dur;ballArcT=0;ballArcActive=true;ballArcTgtY=0.65;ballArcProf=null;/* [7.534.0 MP-1] gli archi di cronaca restano sul seno base: i profili per kind arrivano con MP-2 (beat) */
           ballArcIsBG=true;ballArcTgtX=G2X(_ba.ballEnd.x);ballArcTgtZ=G2Z(_ba.ballEnd.y); // ATE-2
           contactFlashT=0;
           /* [collaudo PO «il portiere non accenna e tenta la parata/tuffo in nessun highlights, sembra
              imbabolato»] MISURATO col collettore __CPM_BGARC: negli highlight interattivi il tuffo c'e'
              (fireConclusion → oppActType, provato GLB-ON), ma gli archi della CRONACA AMBIENTALE — cioe'
              quello che si guarda per la maggior parte della partita live — volavano verso le porte SENZA
              MAI innescare una reazione (60s campionati: tiro a x=83 con gk=null, 0/220 fotogrammi GK con
              reazione attiva). Ora il TIRO della cronaca fa partire il tuffo del portiere bersaglio (corto,
              55% della distanza: l'esito non e' noto al lancio — accenna, non indovina sempre) e la PARATA
              raccontata dal telecronista fa la parata vera (riflesso a corpo se centrale, tuffo disteso se
              angolata) — stessa macchina CIN-2 degli highlight, che si ripulisce da sola a fine gesto.
              __CPM_NO439: interruttore test-only per riprodurre il rosso nel guardiano. */
           let _gkDz439=null;
           if(!oppActType&&(_ba.type==='shot'||_ba.type==='save')&&(_ba.ballEnd.x>=70||_ba.ballEnd.x<=30)&&!(typeof window!=='undefined'&&window.__CPM_NO439)){
             let _g439=null;
             if(_ba.ballEnd.x>=70)_g439=awayGkMesh;
             else sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team==='home'&&src.gk)_g439=pp.mesh;});
             if(_g439){const _tz439=ballArcTgtZ,_dz439=Math.abs(_tz439-_g439.position.z);_gkDz439=+_dz439.toFixed(2);
               oppMesh=_g439;oppActT=0;oppDiveDir=_tz439>=_g439.position.z?1:-1;
               _g439._divePz=_g439.position.z;_g439._diveYaw=_g439.rotation.y;_g439._diveBallY=0.65;
               if(_ba.type==='save'&&_dz439<2.4){oppActType="gk_block";_g439._diveToZ=clamp(_tz439,_g439.position.z-3,_g439.position.z+3);}
               else if(_ba.type==='save'){const _rch439=(typeof window!=='undefined'&&window.__CPM_NO705)?9:4.5;/* [7.705.0] MISURATO (piscina-705 v5): il morsetto ±9 world-z vale 13,4u di campo — con l'esito all'angolo il portiere volava a y 63 e tornava a piedi, meta' del nuoto residuo. Stesso ±4.5 del tuffo ambientale: un corpo copre lo specchio, non l'area. */oppActType="gk_dive";_g439._diveToZ=clamp(_tz439,_g439.position.z-_rch439,_g439.position.z+_rch439);_g439._diveDur=clamp(ballArcDur*1.15,0.55,1.0);}
               else {oppActType="gk_dive";_g439._diveToZ=clamp(_g439.position.z+(_tz439-_g439.position.z)*0.55,_g439.position.z-6,_g439.position.z+6);_g439._diveDur=clamp(ballArcDur*1.15,0.55,1.0);}}}
           /* [7.511.0 R1 — LA CRONACA HA UN ATTORE: audit «durante la cronaca nessuno calcia»] L'arco volava
              senza che nessun giocatore facesse il gesto: `bgAction` non portava un attore e nessun ramo
              assegnava una clip fuori da fireConclusion. Ora l'evento porta origine e lato: il giocatore di
              movimento del lato giusto piu' vicino all'origine SUONA la clip (canale _mateFx, lo stesso dei
              compagni che concludono negli highlight — gia' collaudato 7.209/7.251). Tetto a 14u: se nessuno
              e' abbastanza vicino, meglio nessun gesto che un gesto teletrasportato. __CPM_NO511 = rosso. */
           if(_ba.from&&!(typeof window!=='undefined'&&window.__CPM_NO511)){
             const _fx511=G2X(_ba.from.x),_fz511=G2Z(_ba.from.y);let _bm511=null,_bd511=1e9,_own546=false;
             /* [7.533.0 MP-0c — L'ATTORE DICHIARATO VINCOLA, rosso __CPM_NO546] la cronaca nomina un uomo
                (`actor`, il cognome risolto nel testo) ma il 3D lo ignorava e ri-derivava il gesto per sola
                prossimita' (audit: «nome sul banner ≠ uomo che calcia in scena»). Ora se quel cognome ESISTE
                fra le mesh di movimento del lato dichiarato ed e' raggiungibile (<=22u dall'origine: oltre,
                il gesto sembrerebbe teletrasportato) e' LUI a suonare la clip; la prossimita' resta il
                fallback naturale — l'eroe e la panchina non hanno una mesh con quel nome. Confronto sul
                cognome UPPERCASE (le targhe matchPlayers usano l'ultimo token, i suffissi «jr» inclusi). */
             if(_ba.actor&&!(typeof window!=='undefined'&&window.__CPM_NO546)){
               const _an546=String(_ba.actor).trim().toUpperCase(),_al546=_an546.split(/\s+/).pop();
               sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.gk)return;
                 if((_ba.side==='away')!==(src.team==='away'))return;const _m=pp.mesh;if(!_m)return;
                 const _nm=String(src.name||"").toUpperCase();if(!_nm)return;
                 if(_nm===_an546||_nm===_al546||_an546.split(/\s+/).indexOf(_nm)>=0){
                   const _d=Math.hypot(_m.position.x-_fx511,_m.position.z-_fz511);
                   if(_d<=22&&_d<_bd511){_bd511=_d;_bm511=_m;_own546=true;}}});
             }
             if(!_bm511)sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.gk)return;
               if((_ba.side==='away')!==(src.team==='away'))return;
               const _m=pp.mesh;if(!_m)return;const _d=Math.hypot(_m.position.x-_fx511,_m.position.z-_fz511);
               if(_d<_bd511){_bd511=_d;_bm511=_m;}});
             if(_bm511&&(_own546||_bd511<14)){sr.current._mateFx={mesh:_bm511,name:_ba.type==='tackle'?'tackle':'kick',t:0.55};
               if(typeof window!=='undefined'&&window.__CPM_REC){try{(window.__CPM_BGACT511=window.__CPM_BGACT511||[]).push({ty:_ba.type,d:+_bd511.toFixed(1),side:_ba.side||null,nm:_own546?1:0});}catch(_e){}}}}
           /* [7.523.0 — IL PASSAGGIO MIRA A UN RICEVENTE REALE] L'arco volava verso un punto di ZONA vuoto:
              ora mira alla mesh di movimento del lato dichiarato piu' vicina alla destinazione (tetto 18u),
              che CORRE a riceverla (_carry526); a fine volo diventa il nuovo portatore (handoff a u>=1). */
           sr.current._lato526=_ba.side||'home';
           /* [7.556.0 P2 — LA CRONACA DICHIARA ANCHE CHI HA IL PALLONE, NON SOLO CHI LO RICEVE]
              Il 7.537 aveva gia' fatto meta' del ponte: se l'evento porta `rcv`, l'arco mira alla mesh di
              QUEL cognome invece della piu' vicina alla destinazione. Ma `actor` — il passatore, che la
              cronaca nomina nello STESSO evento — restava inutilizzato: il 3D lo escludeva soltanto «per
              prossimita' al punto di partenza» (<2u) e poi rieleggeva il portatore per vicinanza al
              pallone (r.~4851). Due sorgenti di verita' sulla stessa domanda, e quella che indovina
              vinceva su quella che sa. Qui il passatore NOMINATO diventa il portatore del fotogramma in
              cui l'arco parte: la scena smette di indovinare chi ha appena giocato la palla.
              __CPM_NO556 = rosso: torna all'indovinello per prossimita'. */
           if(_ba.actor&&!(typeof window!=='undefined'&&(window.__CPM_NO556||window.__CPM_NO526))){
             const _an6=String(_ba.actor).trim().toUpperCase();
             if(_an6){sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.gk)return;
               if((_ba.side==='away')!==(src.team==='away'))return;const _m=pp.mesh;if(!_m)return;
               if(String(src.name||"").toUpperCase()===_an6){sr.current._por526={mesh:_m,lato:_ba.side||'home'};sr.current._att556=_m;
                 if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){const _w=(window.__CPM_ATT556=window.__CPM_ATT556||{tot:0,nom:0});_w.nom++;}}});}
             if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){const _w=(window.__CPM_ATT556=window.__CPM_ATT556||{tot:0,nom:0});_w.tot++;}
           }
           if(!(typeof window!=='undefined'&&window.__CPM_NO526)){
             let _rv6=null,_rd6=1e9;const _wx6=G2X(_ba.ballEnd.x),_wz6=G2Z(_ba.ballEnd.y);
             const _fx6=_ba.from?G2X(_ba.from.x):null,_fz6=_ba.from?G2Z(_ba.from.y):null;
             sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.gk)return;
               if(((_ba.side||'home')==='away')!==(src.team==='away'))return;const _m=pp.mesh;if(!_m)return;
               if(_fx6!=null&&Math.hypot(_m.position.x-_fx6,_m.position.z-_fz6)<2)return;/* non il passatore */
               const _d=Math.hypot(_m.position.x-_wx6,_m.position.z-_wz6);if(_d<_rd6){_rd6=_d;_rv6=_m;}});
             /* [7.537.0 NO551] IL RICEVENTE DICHIARATO VINCE SULL'INDOVINELLO: se l'evento porta `rcv`
                (le catene di possesso lo dichiarano), l'arco mira alla mesh di QUEL cognome invece della
                piu' vicina alla destinazione — il 3D consegna la palla all'uomo che la cronaca nomina. */
             if(_ba.rcv&&!(typeof window!=='undefined'&&window.__CPM_NO546)){
               const _rn=String(_ba.rcv).trim().toUpperCase();
               sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!src||src.gk)return;
                 if((_ba.side==='away')!==(src.team==='away'))return;const _m=pp.mesh;if(!_m)return;
                 if(String(src.name||"").toUpperCase()===_rn){_rv6=_m;_rd6=Math.hypot(_m.position.x-_wx6,_m.position.z-_wz6);}});
             }
             if(_rv6&&_rd6<32){ballArcTgtX=_rv6.position.x;ballArcTgtZ=_rv6.position.z;/* [taratura 6] tetto 18->32u: con 18 solo ~8 archi su 20 trovavano un ricevente e il resto atterrava nel vuoto (spiegabile fermo a 71%) — a 32 il ricevente parte col volo e arriva un attimo dopo la palla */
               _rv6._carry526={x:ballArcTgtX,z:ballArcTgtZ,t:Math.max(0.5,(ballArcDur||0.5)+0.3)};
               sr.current._rcv526=_rv6;
               if(typeof window!=='undefined'&&window.__CPM_POR526!==undefined){try{const _w=window.__CPM_POR526;_w.mir=(_w.mir||0)+1;(_w.rd=_w.rd||[]).push(+_rd6.toFixed(1));}catch(_e){}}}
             else sr.current._rcv526=null;
           }
           if(typeof window!=='undefined'&&window.__CPM_REC){try{(window.__CPM_BGARC=window.__CPM_BGARC||[]).push({ty:_ba.type,ex:_ba.ballEnd.x,ey:_ba.ballEnd.y,gk:oppActType||null,dz:_gkDz439});}catch(_e){}}/* [collaudo PO «il portiere sembra imbabolato»] strumento: per ogni arco di CRONACA, tipo+destinazione+reazione GK al lancio (+dz palla-portiere: il guardiano verifica la SEMANTICA riflesso/tuffo senza assumere dove sta il portiere) */}}}
      // Sprint 3D-11C: pulse ambientale big match/derby
      if(bigMatchAmb){bigMatchAmb.intensity=0.08+Math.sin(now*0.0009)*0.04;}
      const _goalExcite=goalBurstT>=0?Math.max(0,1-goalBurstT/2.5):0;
      // ATMO #4: pulse pubblico su palo/parata (neutrale, mezza ampiezza ~1.6s) + tensione crescente nei minuti finali (≥80').
      if(crowdOhT>=0){crowdOhT+=dt;if(crowdOhT>=1.6)crowdOhT=-1;}
      const _ohExc=crowdOhT>=0?Math.max(0,1-crowdOhT/1.6)*0.5:0;
      const _clkA=(propsRef.current&&propsRef.current.matchClock)||0,_finalI=_clkA>=80?Math.min((_clkA-80)/12,1)*0.18:0;
      const _walkExc=isWalk?Math.min(1,(props.seasonPresentation?0.95:0.7)+Math.max(0,((props.matchImportance||5)-5))*0.06+(props.isFinal?0.25:0)):0;// item 7 (5.49.2): tifo pre-partita · [6.88.0 collaudo PO] SCALA con l'importanza della gara (big match/finale ⇒ stadio in delirio all'ingresso)
      const _atmoExc=Math.min(1,Math.max(_goalExcite,_ohExc,_walkExc)+_finalI);// eccitazione atmosfera: gol | palo/parata | finale | ingresso
      if(_exciteAmb)_exciteAmb.intensity=_atmoExc*0.12;// [7.65.0 Phase 4] illuminazione dinamica: warm-up della scena sull'eccitazione (bounded, additivo, golden-cieco)
      // CROWD 2.0 — pulse al gol sui MATERIALI di settore: settori casa caldi / curva ospiti fredda (o viceversa)
      if(sr.current.crowdMats){const _cm=sr.current.crowdMats;
        const _tint=(arr,r,g,b)=>{if(arr)for(const m of arr)m.color.setRGB(r,g,b);};
        if(_goalExcite>0&&goalBurstStadHome){_tint(_cm.homeMats,1,0.90+_goalExcite*0.10,0.55+_goalExcite*0.35);_tint(_cm.awayMats,1,1,1);}
        else if(_goalExcite>0){_tint(_cm.awayMats,0.55+_goalExcite*0.25,0.72+_goalExcite*0.15,1);_tint(_cm.homeMats,1,1,1);}
        else{_tint(_cm.homeMats,1,1,1);_tint(_cm.awayMats,1,1,1);}}
      // CROWD 2.0 §3/§10 — TIFOSI ANIMATI, cadenza ADATTIVA: burst pieno su gol/occasioni, a riposo la cadenza
      // viene dal contesto (stadio caldo=vivo · partita normale=calmo · spalti radi=quasi statico). Round-robin: ≤1 upload texture/frame.
      if(sr.current.crowdMats&&sr.current.crowdMats.crowdAnims){const _cm=sr.current.crowdMats;const _ca=_cm.crowdAnims;
        const _gs=goalBurstT>=0?(goalBurstStadHome?1:-1):0;
        // cadenza SEMPRE step-gated (round-robin, mai ogni-frame): le canvas v2 sono 6× più grandi — un
        // repaint per frame nei burst satura il frame-time (mobile deboli e rendering software del gate).
        // Sotto ?cpmtest=1 il pubblico resta STATICO dopo il primo frame (zero upload texture): è pura
        // presentazione, il gate non lo valida — e i repaint software falsavano i campionamenti di stato.
        const _stepMs=(typeof window!=='undefined'&&window.__CPM_CROWD_MS!=null)?window.__CPM_CROWD_MS:(_CPM_TEST?1e9:(_atmoExc>0?(_cm.burstMs||33):(_cm.idleMs||110)));/* [7.365.0 collaudo PO #6 «lo schermo vibra tutto», con la conferma che vibra SOLO il campo 3D e non il pannello] CADENZA DELLA FOLLA FORZABILE, e serve DAL VIVO. Le tribune sono piani con canvas — non gradinate — e la folla ridisegna la sua texture ogni 110 ms a riposo e ogni 33 ms a stadio caldo (dall'80° e su pali/parate): una tribuna che riempie mezzo schermo e i cui pixel cambiano 30 volte al secondo e' un candidato serio, visto che la camera e' gia' scagionata (2386 fotogrammi: inversioni di verso 0-2%, accelerazione mediana 0,00-0,02). HO PROVATO a dimostrarlo headless confrontando fotogrammi consecutivi a camera ferma e NON ci sono riuscito: ogni condizione contraddice la propria ripetizione, compresa la folla CONGELATA (19,05% contro 4,35% di pixel cambiati). La varianza viene dalla scena, non dalla cadenza, e la differenza fra screenshot non isola la folla. Senza prova non tocco la cadenza: sarebbe una correzione alla cieca su una scelta di atmosfera deliberata. Questo interruttore esiste per fare l'esperimento DOVE il difetto si vede: `window.__CPM_CROWD_MS=1e9` congela la folla, `=110` la tiene alla cadenza di riposo, `=null` ripristina. Se sul telefono la vibrazione sparisce col primo, la causa e' questa e il numero da tarare e' `burstMs`. */
        if(now-(sr.current._crowdT||0)>_stepMs){sr.current._crowdT=now;sr.current._crowdI=((sr.current._crowdI||0)+1);
          try{_ca[sr.current._crowdI%_ca.length](now,_gs,_atmoExc);if(typeof window!=='undefined')window.__CPM_CROWD_TICK=(window.__CPM_CROWD_TICK||0)+1;}catch(e){if(typeof window!=='undefined')window.__CPM_CROWD_ERR=String(e&&e.message||e);}}
        // LOD1 (§2): PRIME FILE 3D — bob/salto solo con eccitazione (a riposo zero costo, matrici statiche)
        const _frs=_cm.frontRows;
        if(_frs&&_frs.length){
          if(_atmoExc>0.02){const _t=now*0.001;if(!_cm._frM4)_cm._frM4=new THREE.Matrix4();const _m4=_cm._frM4;
            for(const fr of _frs){
              const _cheers=_gs===0?true:(fr.isHome===(_gs>0));// al gol salta solo la tifoseria del marcatore
              const _amp=(_gs!==0?(_cheers?0.55:0.06):0.26)*_atmoExc;
              for(let i=0;i<fr.n;i++){const _dy=Math.abs(Math.sin(_t*7+fr.ph[i]))*_amp;
                _m4.copy(fr.bases[i]);_m4.elements[13]+=_dy;fr.body.setMatrixAt(i,_m4);
                _m4.copy(fr.headBases[i]);_m4.elements[13]+=_dy;fr.head.setMatrixAt(i,_m4);}
              fr.body.instanceMatrix.needsUpdate=true;fr.head.instanceMatrix.needsUpdate=true;}
            _cm._frDirty=true;}
          else if(_cm._frDirty){for(const fr of _frs){for(let i=0;i<fr.n;i++){fr.body.setMatrixAt(i,fr.bases[i]);fr.head.setMatrixAt(i,fr.headBases[i]);}
            fr.body.instanceMatrix.needsUpdate=true;fr.head.instanceMatrix.needsUpdate=true;}_cm._frDirty=false;}}}
      // item 9: la cerimonia (tappeto-logo + mascotte) vive SOLO nella walkout → nascondi appena si esce (guard sul flag → lavoro una sola volta)
      if(!isWalk&&_ceremonyCarpet&&_ceremonyCarpet.visible){_ceremonyCarpet.visible=false;for(const m of _mascots)m.c.visible=false;}
      // [6.28.0] INIZIO fase walkout (transizione matchday/formations → walkout): riporta TUTTI i mesh alla
      //   bocca del tunnel e riavvia il timer d'ingresso → l'ingresso scaglionato in due file si vede SEMPRE,
      //   non solo se il componente montava già in walkout. Escluso sotto ?cpmtest=1 (il gate salta la walkout).
      if(isWalk&&!_wasWalk&&!_CPM_TEST){
        const _toTunnel=(m)=>{if(!m||m._wStartX==null)return;m.position.x=m._wStartX;m.position.z=m._wStartZ;m.position.y=0;m._px=m.position.x;m._pz=m.position.z;m._sp=0;m._idle=0;};
        sr.current.players.forEach(pp=>_toTunnel(pp.mesh));_toTunnel(hero);
        walkT=0;walkDone=false;
      }
      _wasWalk=isWalk;
      if(isWalk){
        sr.current.players.forEach(pp=>animWalk(pp.mesh,aDt,ak));
        animWalk(hero,aDt,ak);
        walkT+=dt;
        // item 9: cerimonia — tappeto-logo a centrocampo + mascotte che camminano TENENDO PER MANO il giocatore (al fianco, stessa direzione)
        if(_ceremonyCarpet)_ceremonyCarpet.visible=true;
        for(const m of _mascots){const p=m.p;if(!p){continue;}m.c.visible=true;const _hx=Math.sin(p.rotation.y),_hz=Math.cos(p.rotation.y);// "mano nella mano": di lato rispetto al verso di marcia
          m.c.position.set(p.position.x+_hz*0.72,0,p.position.z-_hx*0.72);m.c.rotation.y=p.rotation.y;}
        if(walkT>=WALK_DUR&&!walkDone){walkDone=true;const cb=propsRef.current.onWalkoutDone;if(cb)cb();}
      } else if(replaying){
        // Sprint 3D-8b: riproduzione dal ring buffer (tutti i mesh guidati dai frame registrati)
        driveReplay(dt);
      } else {
        // Sprint 3D-9: movimenti collettivi (puramente visivi — offset sul target del lerp, stato di gioco intatto).
        // Linea difensiva inferita: DIF scorrono come blocco con la palla; CEN a metà intensità. Pressing: i più vicini driftano verso la palla.
        // Sprint A (NEXT-GEN aliveness) — motore posizionamento off-ball: shape-flow + pressing + marcatura + repulsione.
        // Tutto puramente visivo (offset sul target del lerp): lo stato di gioco (matchPlayers) resta intatto → zero save-risk.
        // Deterministico (nessun RNG/now): la repulsione è calcolata sui target correnti → niente "ammucchiate", niente oscillazioni.
        const _bGX=P.ballX||50,_bGY=P.ballY||50,_lineShift=clamp((_bGX-50)*0.18,-9,9);
        // F2 (5.19.0) — la forma squadra LEGGE il Football State (possesso), non solo la x della palla.
        //   Chi HA il pallone sale/attacca; chi NON ce l'ha arretra e si compatta. Offset piccoli e bounded
        //   (DEF<CEN<ATT), deterministici (possessore = nearest player alla palla, stabile dopo l'assestamento).
        //   Puramente visivo (come tutto questo blocco). Primo CONSUMATORE del Football State (direttiva §4).
        const _fs=sr.current.football;
        // [6.29.0 collaudo PO «posizionamento giocatori assolutamente sbagliata»] in un HL DIFENSIVO il pallone è
        //   dell'AVVERSARIO → la squadra di CASA DIFENDE. Prima il possesso poteva risultare "casa attacca" (palla a
        //   centrocampo, bGX>50) → FORME INVERTITE: gli avversari si compattavano/ammucchiavano (come se difendessero)
        //   invece di allargarsi, e i compagni si spargevano invece di pressare. Ora l'HL difensivo forza casa=difende.
        const _homeBall=(propsRef.current&&propsRef.current.hlDef)?false:((_fs&&_fs.attackingHome!=null)?_fs.attackingHome:(_bGX>50));// possesso AFFIDABILE (palla logica), non mesh
        // FIX rigore/punizione: su un set-piece i giocatori NON pressano/corrono — restano schierati fuori area.
        /* ⚠️ [7.591.0 PROVATO IN TRE STESURE E REVOCATO CON LA SUA MISURA — «la resa non segue il modello
           durante la ripresa»] Il 7.590 aveva separato le due sorgenti e sembrava chiaro: durante la
           ripresa vera il modello LOGICO schiera i ventidue (casa 0,2 · ospiti 0,2) e le MESH no (casa 1,3
           · ospiti 4,9). Ho provato, nell'ordine: (1) trattare la ripresa come un calcio piazzato, perche'
           questo blocco non USA `src.x` ma lo CORREGGE — pressing entro 24 unita' verso un pallone fermo
           al centro, richiamo alla zona di competenza che per le punte ospiti ancora a x=40. Guadagno
           apparente: mesh ospiti 4,9 -> 3,4, con tutti e sei i colpevoli in calo (i18 dall'85% al 49%).
           (2) riportare il bersaglio al modello in un punto solo, dopo tutti gli scrittori: 3,4 -> 4,4.
           (3) far fare alla resa lo stesso SNAP del modello, una volta al primo fotogramma: verde contro
           rosso, scarto 16,71 m contro 15,31 · mesh ospiti 6,0 contro 4,8. PEGGIORA.
           E il numero che chiude la strada e' un altro: lo SCARTO fra dove la partita mette un giocatore e
           dove il renderer lo disegna resta 15-17 metri di mediana IN ENTRAMBI I BRACCI, con gli indici
           verificati allineati (zero coppie con squadra diversa su 19 valide). Un rimedio che non muove lo
           scarto non e' un rimedio debole: e' la prova che qualcosa nella mia ricostruzione non regge.
           ⚠️ RETTIFICA, scritta un'ora dopo la revoca perche' avevo chiuso con una conclusione FALSA: qui
           c'era scritto «le due sorgenti non descrivono lo stesso oggetto, `allPlayers` non e'
           `matchPlayers`». E' vero il contrario, e bastava una riga per saperlo — il componente 3D riceve
           `allPlayers={matchPlayers}`: sono lo STESSO array. Quindi lo scarto di 15-17 metri e' reale e
           misura esattamente cio' che dice, quanto la mesh disegnata si discosta dal modello. La premessa
           era giusta; a non reggere era la mia spiegazione del perche' i rimedi non lo muovessero.
           Ho lasciato passare una supposizione per una causa proprio mentre annotavo una strada morta, che
           e' il posto peggiore dove farlo: una nota di revoca la legge chi ripercorrera' la strada.
           E IL TERMINE DI PARAGONE, misurato subito dopo, cambia la domanda: lo scarto vale 16,08 m di
           mediana durante la ripresa (143 campioni) ma 10,55 m A GIOCO VIVO (1176 campioni). Non e' quindi
           un difetto della ripresa: e' STRUTTURALE. Dove la partita mette un giocatore e dove il renderer
           lo disegna distano dieci metri in media, sempre, per tutti e ventidue — un giocatore intero di
           distanza dalla posizione che la simulazione ha deciso.
           E' la scoperta che vale piu' del rimedio mancato, perche' l'utente guarda il RENDERER: quando il
           PO scrive «non ci sono trame di gioco, passaggi, pressing», sta guardando una partita che non e'
           quella che la simulazione sta giocando. Finche' questi due numeri non convergono, ogni rimedio
           scritto nella simulazione arriva all'occhio attenuato di dieci metri.
           NON E' UN DIFETTO DA CORREGGERE QUI E ORA: questo blocco corregge il bersaglio APPOSTA (pressing,
           marcature, forma del reparto) e buona parte di quei dieci metri e' voluta. Quello che manca e'
           sapere QUANTA parte e' voluta e quanta e' deriva — e va misurato per scrittore, non a occhio.
           LEZIONE, e vale piu' del rimedio mancato: il guadagno della stesura (1) era un conteggio con
           SOGLIA su una partita sola, e le partite ballano di un giocatore intero. La misura continua
           (lo scarto in metri) lo ha smentito. Quando un numero ha una soglia, due partite diverse bastano
           a inventare un miglioramento. */
        const _setPiece=isHL&&(P.hlType==="penalty"||P.hlType==="freekick"||!!P.hlSetPiece);/* [7.8.8] flag set-piece dalla situation → il muro si schiera fin dall'AIMING (prima P.hlType poteva non essere ancora "freekick" in hl_choose → nessuna barriera) */
        /* [7.311.0 collaudo PO «le punizioni con l'eroe: postura sbagliata del corpo, deve essere direzionato
           verso la porta!»] SUL PIAZZATO L'EROE GUARDA LA PORTA. Il facing dell'eroe e' derivato dal MOVIMENTO
           (in `animOne`, e per il CH38 dal delta di posizione): su un calcio piazzato l'eroe e' FERMO sul
           pallone, quindi nessuno dei due lo ruota mai e resta con l'orientamento che aveva — con rotation.y
           a 0 significa guardare lungo +z, cioe' di FIANCO alla porta. Qui, e solo mentre e' fermo davanti al
           pallone (nessun gesto in corso: il gesto del calcio scrive lui la rotazione), il corpo ruota in modo
           graduale verso la porta avversaria. Nessun effetto su traiettoria, esito o posizione → puramente
           postura. */
        if(_setPiece&&hero&&actType==null&&heroPostT<0){
          const _spY=Math.atan2(AWAY_GOAL_X-hero.position.x,-hero.position.z);
          let _spD=((_spY-hero.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;
          hero.rotation.y+=_spD*Math.min(aDt*3.2,1);
        }
        let _hxg=P.playerX||50,_hyg=P.playerY||50;const _pat=P.hlPattern||"";
        /* [7.236.0 batch «compare e scompare»] se l'executor ha portato l'eroe avanti col build-up, la
           conclusione parte DA LÌ: l'ancora della approach è il punto d'arrivo della costruzione (stessa
           scena), non lo spot d'apertura — il calcio avviene dov'è il pallone, niente teleport all'indietro. */
        let _anch51=false;{const _tle51=sr.current._tlHeroEnd;if(_tle51&&_tle51.k===P.hlSitKey&&!P.hlDef){_hxg=_tle51.x;_hyg=_tle51.y;_anch51=true;}}
        // CINE-APPROACH (4.96.0): durante l'esito l'eroe "entra" nell'azione — un breve passo verso palla/porta
        //   invece di colpire da fermo. Sincronizzato al gesto (actT → rallenta col bullet-time), additivo,
        //   auto-azzerante a fine azione. Escluso sui set-piece (rigore/punizione battuti da fermo, regia dedicata).
        if(isResult&&actType&&actType!=="penalty"&&actType!=="freekick"){
          const _T2=gwOf(actType,"app");/* [7.512.0 R2] catena sostituita dalla tabella unica GESTURE_WIN — vedi r.~12344 */
          const _ap=Math.min((actT/_T2)/0.5,1);// avvicinamento completo entro il contatto (~metà gesto), poi tiene
          if(P.hlDef&&(actType==="tackle"||actType==="dribble"||actType==="build")){
            // 5.49.15 INTERCETTO/RECUPERO DIFENSIVO: l'eroe scivola VERSO il pallone (non in avanti verso la porta) → la scivolata finisce SUL pallone, non "a vuoto"
            /* [7.246.0 batch PO «Scivolata non prende il pallone, posizione sbagliata»] P.ballX/BallY sono
               CONGELATI al resolve — il portatore intanto avanza col pallone e la scivolata atterrava dove la
               palla ERA. L'inseguimento ora punta la palla VIVA (mesh → coordinate gioco). */
            /* [7.249.0 batch PO «effetto zombie»/«non sembra saltato»/«azione confusionaria»] l'inseguimento
               della palla viva durava TUTTA la finestra del gesto (1.7s) a velocità di sprint — l'eroe inseguiva
               perfino il pallone d'ESITO che l'avversario portava via: zombie in caccia perpetua e nessuna
               lettura del «battuto». Ora insegue SOLO fino al contatto (0.9s su successo, 0.55s su fallito),
               poi SI FERMA: il battuto che resta lì mentre l'avversario se ne va È il fallimento leggibile. */
            if(actT<=(P.hlSuccess===true?0.9:0.55)){
              const _lbx46=ball.position.x+50,_lby46=ball.position.z/0.68+50;
              _hxg=clamp(_hxg+(_lbx46-_hxg)*_ap*0.9,2,98);
              _hyg=clamp(_hyg+(_lby46-_hyg)*_ap*0.9,2,98);
            }
          } else {
            const _amp=(actType==="shot"||actType==="header")?5:actType==="tackle"?6:actType==="dribble"?(P.hlSuccess===false?4:10):actType==="cross"?3:2.5;/* [7.358.0] il dribbling RIUSCITO supera l'uomo (10u), quello FALLITO parte e viene fermato (4u): stessa lettura, esito diverso — prima il fallito ne riceveva 2,5 perche' si chiamava `build` *//* [7.218.0] sul DRIBBLING l'avanzamento era 4 e finiva a meta gesto: l'eroe restava piantato mentre la palla se ne andava. Un dribbling e superare l'uomo, quindi ora corre davvero oltre */
            const _apD=(actType==="dribble")?Math.min(actT/_T2,1):_ap;/* sul dribbling la corsa dura QUANTO il gesto, non meta */
            _hxg=clamp(_hxg+_apD*_amp*(_anch51?0.45:1),2,96);// home attacca verso x crescente · [7.236.0] ancorato a fine build-up (già avanti): passo di follow-through dimezzato, non un'altra corsa
            /* [7.230.0 #46 collaudo PO «Rientra e tira: non si vede il movimento dell'eroe con la palla»] IL
               TIRO A GIRO DALLA FASCIA HA IL RIENTRO. Un `shot_curled` calciato da posizione larga nasce dal
               taglio verso l'interno — l'approach era solo in avanti e il «rientra» non esisteva a schermo.
               Componente laterale verso il centro, solo per la famiglia curled da fascia: fino a ~10u di
               diagonale nel tempo dell'approach, additiva e auto-limitata come il resto del blocco. */
            if(actType==="shot"&&P.hlVariant==="shot_curled"&&Math.abs(_hyg-50)>20)_hyg=clamp(_hyg+(50-_hyg)*_ap*0.35,2,98);
            else _hyg=clamp(_hyg+((P.ballY||_hyg)-_hyg)*_ap*0.4,2,98);// converge leggermente sulla y della palla
            /* [7.234.0 #51 revisione PO «l'eroe non segue il pallone, sembra un fantasma» ×6] FOLLOW-RUN:
               finito il gesto l'eroe restava una STATUA mentre la giocata proseguiva (misurati build-up di
               1.4-3.7s con l'eroe congelato dopo tacco/assist/tiro). Un calciatore vero ACCOMPAGNA la giocata:
               da fine gesto in poi il bersaglio dell'eroe scivola VERSO la palla logica — mai addosso (45%/35%
               della distanza), rampa morbida, solo azioni offensive di gioco aperto (set-piece già esclusi dal
               gate del blocco, difensive fuori). Deterministico, additivo, la firma golden vive a hl_choose. */
            {const _fw51=clamp((actT/_T2-1)*0.55,0,1);
             if(_fw51>0&&!P.hlDef){const _bgx51=(P.ballX!=null?P.ballX:_hxg),_bgy51=(P.ballY!=null?P.ballY:_hyg);
               _hxg=clamp(_hxg+(_bgx51-_hxg)*_fw51*0.45,2,96);_hyg=clamp(_hyg+(_bgy51-_hyg)*_fw51*0.35,2,98);}}
          }
          {const _l58=sr.current._hlAdv||(sr.current._hlAdv={});_l58.k=P.hlSitKey;_l58.x=_hxg;_l58.y=_hyg;}
        }
        /* [7.358.0 collaudo PO #93 «effetto elastico, l'eroe sembra smarrito»] IL RIENTRO. Tutto
           l'avanzamento d'esito vive dentro `if(isResult&&actType)`: quando la finestra del gesto si chiude
           `actType` torna null e il bersaglio ricade su `P.playerX`, che e' CONGELATO al resolve — cioe'
           esattamente il punto di partenza. Misurato sul dribbling riuscito: l'eroe avanza fino a 73,0 e
           poi CAMMINA ALL'INDIETRO fino a 70,0 mentre la palla se ne va. Un calciatore non torna sui suoi
           passi da solo. Ora l'ultimo bersaglio dell'azione resta LATCHATO fino al cambio di scena, e solo
           in avanti (`>_hxg`): non tira mai l'eroe piu' avanti di dove sarebbe andato, gli impedisce solo
           di rinculare. Stesso ragionamento gia' adottato per la spinta della sponda (_o2Push). Il
           bersaglio LOGICO nei props non e' toccato -> firma golden invariata per costruzione. */
        else if(isResult&&!P.hlDef){const _l58=sr.current._hlAdv;if(_l58&&_l58.k===P.hlSitKey&&_l58.x>_hxg){_hxg=_l58.x;_hyg=_l58.y;}}
        const _players=sr.current.players;
        // [7.47.0 BL-11 PERF] pooling delle allocazioni per-frame del PASS 1: prima ogni frame allocava
        //   ~22 object literal + 3 array + 1 Set sul path più caldo del render-loop (pressione GC) → ora
        //   buffer PERSISTENTI su sr.current riusati a ogni frame (length azzerata, slot con TUTTI i campi
        //   riscritti → nessun valore stantio). Semantica IDENTICA: stessi valori, stessi null, stesse length;
        //   nessun consumatore trattiene riferimenti oltre il frame (verificato: solo loop read/mutate locali).
        if(!sr.current._tgB){sr.current._tgB=[];sr.current._tgPool=[];sr.current._hmPB=[];sr.current._awPB=[];sr.current._ptPool=[];
          for(let q=0;q<24;q++){sr.current._tgPool.push({x:0,y:0,gk:false,hm:false,li:0,att:false,def:false});sr.current._ptPool.push({x:0,y:0});}}
        const _tg=sr.current._tgB,_tgPool=sr.current._tgPool;let _tgN=0;_tg.length=0;
        // F3 — posizioni avversarie per: spazio libero (smarcamenti) + marcatura. Coordinate logiche di src/all.
        const _hmP=sr.current._hmPB,_awP=sr.current._awPB,_ptPool=sr.current._ptPool;let _ptN=0;_hmP.length=0;_awP.length=0;
        for(let q=0;q<_players.length;q++){const s=all[q];if(!s||s.gk)continue;const _pb=_ptPool[_ptN]||(_ptPool[_ptN]={x:0,y:0});_ptN++;_pb.x=s.x;_pb.y=s.y;(q<10?_hmP:_awP).push(_pb);}
        if(_CPM_TEST||_SIT_TEST){try{sr.current._dbgHT={x:+_hxg.toFixed(1),y:+_hyg.toFixed(1),tl:tlOn?1:0};}catch(_e){}}/* [7.358.0] BERSAGLIO LOGICO dell'eroe durante l'esito (test-only): distingue «il bersaglio non avanza» da «la mesh non insegue il bersaglio». Senza, «l'eroe resta piantato» non e' diagnosticabile */
        {const _pb=_ptPool[_ptN]||(_ptPool[_ptN]={x:0,y:0});_ptN++;_pb.x=_hxg;_pb.y=_hyg;_hmP.push(_pb);}// l'eroe fa parte dell'attacco casa
        const _openAt=(cy,cx,opp)=>{let m=99;for(let q=0;q<opp.length;q++){const d=Math.hypot(opp[q].x-cx,opp[q].y-cy);if(d<m)m=d;}return m;};
        // [6.75.0 DEF-2] PRESS-PRIORITY: pressa SOLO la squadra che difende, e pressa il giocatore più LOGICO.
        //   Prima il drift verso palla era simmetrico (anche la squadra IN possesso "pressava" il proprio
        //   portatore) e uniforme (tutti i vicini con la stessa formula) → ammucchiate attorno alla palla.
        //   Ora: 1° pressore (il difendente più vicino) a piena intensità, 2° in appoggio, gli altri solo
        //   compattamento leggero. Deterministico (posizioni logiche correnti).
        let _pr1=-1,_pr2=-1,_prd1=1e9,_prd2=1e9;
        for(let q=0;q<_players.length;q++){const s=all[q];if(!s||s.gk)continue;if((q<10)===_homeBall)continue;// solo chi NON ha il possesso
          const dq=Math.hypot(_bGX-s.x,_bGY-s.y);if(dq<_prd1){_prd2=_prd1;_pr2=_pr1;_prd1=dq;_pr1=q;}else if(dq<_prd2){_prd2=dq;_pr2=q;}}
        // [6.76.0 LMV-M2] ISTERESI sul 1° pressore: due difendenti quasi equidistanti si scambiavano il ruolo
        //   (peso 1.6) a ogni frame → oscillazione a coppia. Il pressore precedente resta tale finché un rivale
        //   non lo batte di >2u. Deterministico (dipende solo dalla storia dei frame, off-ball fuori dalla golden).
        {const _pp=sr.current._prPrev;
         if(_pp!=null&&_pp>=0&&_pp!==_pr1&&_pp<_players.length){const _ps=all[_pp];
           if(_ps&&!_ps.gk&&((_pp<10)!==_homeBall)){const _dp=Math.hypot(_bGX-_ps.x,_bGY-_ps.y);
             if(_dp<_prd1+2&&_dp<24){_pr2=_pr1;_prd2=_prd1;_pr1=_pp;_prd1=_dp;}}}
         sr.current._prPrev=_pr1;}
        // PASS 1 — target pre-repulsione per ogni giocatore (coordinate di gioco 0..100)
        for(let i=0;i<_players.length;i++){
          const src=all[i];
          if(!src){_tg.push(null);continue;}
          if(src.gk){
            // F13 (AI DELIBERATIVA, slice 3): il PORTIERE che difende STRINGE L'ANGOLO uscendo verso la palla
            //   su un HL d'attacco (uscita scalata su avanzamento·centralità della palla). CAP entro i bound
            //   asseriti dal gate (away GK x≥80, home GK x≤20) → orientation/initial-state intatti. Deterministico.
            let _gx=src.x,_gy=src.y;const _awG=src.x>50;
            // item 6 (5.49.0): durante un HIGHLIGHT il portiere RESTA FERMO in posizione di pronto sulla linea fino alla conclusione
            //   reale (la reazione è SOLO il tuffo gk_dive, innescato all'esito) → niente "uscita anticipata". L'uscita per stringere
            //   l'angolo (F13) resta solo in GIOCO APERTO (cronaca), dove è realistica e non anticipa alcun tiro interattivo.
            /* [7.705.0] LO SPECCHIO VALE ANCHE QUI. MISURATO (piscina-705 v5, bersaglio del builder in
               stampa): con il pallone morto parcheggiato all'angolo (2,94) dalla palla morta 7.702 questa
               uscita teneva il bersaglio y del portiere INCHIODATO a 62 per tre secondi — meta' del nuoto.
               A palla morta, o con la palla lontana dalla sua porta, il bersaglio resta quello logico,
               che il gemello di questa regola in live-match riporta al centro dello specchio. */
            const _spec705r=!(typeof window!=='undefined'&&window.__CPM_NO705)&&(!!(P.fermo&&P.fermo.current)||(_awG?_bGX<62:_bGX>38));
            if(!isHL&&!_setPiece&&!_spec705r&&(_awG?_homeBall:!_homeBall)){
              const _goalX=_awG?94:6,_adv=_awG?clamp((_bGX-50)/44,0,1):clamp((50-_bGX)/44,0,1),_ctr=clamp(1-Math.abs(_bGY-50)/45,0,1);
              const _step=_adv*_ctr*4.5;_gx=_awG?clamp(_goalX-_step,80,_goalX):clamp(_goalX+_step,_goalX,20);_gy=clamp(50+(_bGY-50)*0.28,38,62);// uscita/spostamento RIDOTTI → resta in posizione di pronto sulla linea
            }
            else if(isHL&&_awG&&propsRef.current&&propsRef.current.hlGkOut){/* [7.248.0 gi52 «Non si vede il portiere che esce»] la regola «GK fermo sulla linea durante l'HL» (5.49.0) vale per i tiri normali — ma la scena che DICHIARA l'uscita (flag factory gkOutSit) la deve MOSTRARE: il GK avversario esce incontro alla palla per tutto l'highlight. Bound del gate rispettati (away GK ≥80) e uscita deterministica dalla posizione palla. */
              _gx=clamp(_bGX+7,80,92);_gy=clamp(50+(_bGY-50)*0.35,36,64);
            }
            {const _ob=_tgPool[_tgN]||(_tgPool[_tgN]={});_tgN++;_ob.x=_gx;_ob.y=_gy;_ob.gk=true;_ob.hm=i<10;_ob.li=0;_ob.att=false;_ob.def=false;_tg.push(_ob);
             if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_GKT705=window.__CPM_GKT705||{});_w[_ob.hm?'home':'away']={x:+_gx.toFixed(1),y:+_gy.toFixed(1)};}catch(_e){}}/* [7.705 strumentazione] il BERSAGLIO del portiere, per attribuire il nuoto: sopra 62 = scrittore a monte, mesh oltre il bersaglio = scrittore a valle */}continue;}
          const _hm=i<10,_li=_hm?i:i-10; // 1-4=DIF, 5-7=CEN, 8+=ATT (0=GK)
          let tx=src.x,ty=src.y;
          /* [7.592.0 SOLO COLLAUDO, spento senza bandiera] I DIECI METRI, TAPPA PER TAPPA. Misurato che la
             mesh disegnata dista 10,55 m dal modello a gioco vivo e 16,08 m durante una ripresa. Buona
             parte e' VOLUTA — questo blocco corregge il bersaglio apposta — ma «buona parte» non e' un
             numero. Qui si registra quanto sposta ciascuna tappa, cosi' la domanda «quanta e' deriva»
             smette di essere un'opinione. */
          const _b592=tx;
          // shape-flow: il blocco squadra scorre su/giù col pallone (DIF pieno, CEN ridotto, ATT minimo)
          if(_li>=1&&_li<=4)tx+=_lineShift; else if(_li>=5&&_li<=7)tx+=_lineShift*0.6; else tx+=_lineShift*0.3;
          // F2: shift possession-aware — la tua squadra attacca (sale) se ha il pallone, difende (arretra) se no.
          //   bounded ±~3u, scala per reparto; home attacca verso x+, away verso x-. Niente sui set-piece.
          if(!_setPiece){const _myAtt=_hm?_homeBall:!_homeBall,_posMag=(_li<=4?2.5:_li<=7?4:5);
            tx+=(_myAtt?1:-1)*(_hm?1:-1)*_posMag*0.6;}
          /* [7.46.0 Sprint 6 — R4 HOME-POSITION] richiamo MORBIDO alla zona di competenza del ruolo: senza,
             il target nasce sempre dalla posizione CORRENTE (ball-centrico puro) e il blocco perde forma nel
             tempo. Il pull sposta il target di una frazione della distanza da casa (DIF 10% · CEN 7% · ATT 5%)
             → pressing e corse di ruolo DOMINANO vicino alla palla, la forma si RICOMPATTA lontano. Ancore per
             slot (x per reparto, y per corsia — speculari per l'away), deterministico, sospeso sui set-piece. */
          const _a592=tx;/* [7.592.0] fine forma: scorrimento della linea + scarto di possesso */
          if(!_setPiece&&_li>=1){
            const _R4Y=[50,30,45,55,70,32,50,68,28,50,72],_R4XL=[0,20,20,20,20,40,40,40,60,60,60];
            const _hxR4=_hm?_R4XL[_li]:100-_R4XL[_li];const _hyR4=_R4Y[_li]||50;
            const _kR4=_li<=4?0.10:_li<=7?0.07:0.05;
            tx+=(_hxR4-src.x)*_kR4;
            /* ⚠️ la Y dei DIFENSORI è dominio di marcature (PASS 1b) e shading adattivo cpmadapt (±6u): il
               pull laterale a corsie FISSE lo ANNULLAVA (adapt-test 6u→0.64u alla prima passata) → per i DIF
               il richiamo è SOLO longitudinale; CEN/ATT tengono un richiamo y leggero (le loro corsie non
               portano segnale tattico adattivo). Stessa classe della lezione DEF-4 (6.75.0). */
            if(_li>4)ty+=(_hyR4-src.y)*(_kR4*0.7);
          }
          // pressing: SOLO la squadra che difende chiude sulla palla, con priorità (DEF-2) — il 1° pressore
          //   (il più logico: il difendente più vicino) a piena intensità, il 2° in appoggio, gli altri si
          //   compattano appena senza abbandonare la propria zona
          const _r592=tx;/* [7.592.0] fine richiamo alla zona di competenza */
          const dxb=_bGX-src.x,dyb=_bGY-src.y,db=Math.hypot(dxb,dyb);
          if(!_setPiece&&db<24&&db>1.5&&_hm!==_homeBall){const _sup=(_fs&&_fs.superiority)||0,_mySup=_hm?_sup:-_sup;const _pm=clamp(1+_mySup*0.12,0.7,1.35);// §4: pressa di più in superiorità numerica vicino alla palla, meno in inferiorità
            const _pk=(i===_pr1)?1.6:(i===_pr2)?0.85:0.3;
            /* [7.593.0 — IL PRIMO PRESSORE CHIUDE, NON SI SPORGE, rosso __CPM_NO593]
               COLLAUDO PO, scritto due volte: «non ci sono trame di gioco, passaggi, pressing» e «non c'e'
               pressing». MISURATO a gioco vivo sulle mesh che l'utente guarda (336 campioni con un
               portatore riconoscibile): il difensore piu' vicino a chi ha la palla sta a 9,9 metri di
               MEDIANA, il secondo a 12,1. Solo il 28% dei campioni ha qualcuno entro cinque metri, il 9%
               entro tre. Nel calcio vero il piu' vicino sta a due-cinque metri per la gran parte del
               possesso: per il settantadue per cento del tempo, qui, non c'e' nessuno addosso.
               E la causa e' in questa riga, non in una taratura: `press` e' uno SPOSTAMENTO ASSOLUTO in
               unita' di campo, non una chiusura. Il massimo vale (24-1,5)/24 * 1,6 * 1,35 = 2,0 unita':
               il primo pressore avvicina il proprio bersaglio di due metri e basta. Un difensore a
               quindici metri si sporge di 1,2 e resta a 13,8 — non arrivera' MAI. Il pressing, cosi'
               com'e' scritto, e' un'inclinazione del bersaglio, non un'intercettazione.
               Il primo pressore ora ha come bersaglio il PORTATORE: si mette fra il pallone e la propria
               porta, a due metri — che e' dove sta un difensore che accorcia. Il secondo resta in appoggio
               e gli altri si compattano, come prima: e' il primo che deve chiudere, non tutti e dieci.
               ⚠️ Il difendente e' l'AVVERSARIO dell'eroe (`_hm!==_homeBall`): qui non si aggiungono azioni
               difensive all'eroe, si fa esistere la pressione che l'eroe subisce. */
            const _p593=!(typeof window!=='undefined'&&window.__CPM_NO593);
            /* ⚠️ [7.595.0 PROVATO E REVOCATO CON LA SUA MISURA — «il pressore mira dove il pallone sara'»]
               Il 7.593 da' al primo pressore il bersaglio giusto (due metri dal pallone, lato porta) ma la
               mesh ci arriva con 5-6 metri di ritardo (7.592). Ridurre quel ritardo e' una decisione di
               prodotto che non mi arrogo; qui avevo provato la via che NON lo tocca: compensarlo mirando
               avanti, cioe' al punto in cui il pallone sara' fra mezzo secondo (velocita' stimata per
               fotogramma e smussata, anticipo limitato a otto metri). Un difensore vero fa esattamente
               questo.
               TRE COPPIE di run verde/rosso, perche' una sola sta dentro il rumore che questa sonda ha
               gia' dimostrato di avere:
                 distanza mediana   verde 7,0 · 8,8 · 7,3  (media 7,7)   rosso 7,5 · 7,5 · 8,0  (media 7,7)
                 entro 3 m          verde  14% · 13% · 10%              rosso  11% ·  7% ·  8%
                 entro 8 m          verde  57% · 41% · 58%              rosso  56% · 56% · 51%
               L'anticipo migliora la CODA VICINA in tutte e tre le coppie (+3,6 punti entro tre metri),
               ma non sposta la mediana di nulla e PEGGIORA la fascia entro otto metri. Due indicatori su
               tre non reggono: non e' un rimedio provato, e tenerlo perche' «uno dei tre migliora» sarebbe
               scegliere il numero che mi da' ragione. Revocato.
               LA STRADA NON E' CHIUSA, ed e' scritta qui per chi la riprende: mezzo secondo di anticipo e'
               probabilmente troppo — spiega insieme il guadagno sotto i tre metri (chi arriva, arriva bene)
               e la perdita sotto gli otto (chi e' lontano parte verso un punto che il pallone non
               raggiungera'). Un anticipo PROPORZIONALE alla distanza, corto da lontano, e' la variante da
               misurare. Serviranno di nuovo tre coppie: su questa sonda una sola non decide. */
            if(_p593&&i===_pr1){const _gx593=_hm?0:100,_dgx=_gx593-_bGX,_dgy=50-_bGY,_dgn=Math.hypot(_dgx,_dgy)||1;
              tx=_bGX+_dgx/_dgn*2.0;ty=_bGY+_dgy/_dgn*2.0;}
            else{const press=clamp((24-db)/24,0,1)*_pk*_pm;tx+=dxb/db*press;ty+=dyb/db*press;}}
          // ENGINE Fase 2 (AI tattica continua): obiettivo per RUOLO che legge la palla ogni frame.
          //   ATT → attaccano lo spazio con corse differenziate (primo palo/secondo palo/profondità) man mano
          //   che la palla avanza; CEN → offrono una linea di passaggio attorno al portatore. Deterministico.
          //   Sospeso sui set-piece (rigore/punizione): i giocatori restano schierati, niente corse in area.
          if(!_setPiece){const teamAtt=_hm?_homeBall:!_homeBall,adir=_hm?1:-1,ownGoalX=_hm?0:100,_opp=_hm?_awP:_hmP;
            if(teamAtt){// la TUA squadra ATTACCA
              if(_li>=8){// ATTACCANTI: corsa in profondità nel proprio canale, deviando verso lo spazio più libero
                const baseY=_li===8?28:_li===10?72:50;
                // [6.74.0 3D-15] cap ANTI-FUORIGIOCO visivo: la corsa non supera l'ultimo difensore avversario di campo
                //   (prima le punte stazionavano stabilmente 8-10u oltre la linea difensiva a palla ferma — plateale)
                let _offL74=_hm?-1:101;for(let q=0;q<_opp.length;q++){const ox=_opp[q].x;if(_hm){if(ox>_offL74)_offL74=ox;}else{if(ox<_offL74)_offL74=ox;}}
                const runX=_hm?clamp(_bGX+adir*18,55,Math.min(92,Math.max(56,_offL74-1)))
                              :clamp(_bGX+adir*18,Math.max(10,Math.min(44,_offL74+1)),45);
                const yAdj=clamp(baseY+(_openAt(baseY+12,runX,_opp)-_openAt(baseY-12,runX,_opp))*0.35,12,88);
                tx+=(runX-src.x)*0.42;ty+=(yAdj-src.y)*0.30;}
              else if(_li>=5){// CENTROCAMPISTI: supporto dietro/lato al portatore → linea di passaggio
                const supX=_bGX-adir*9,supY=clamp(_bGY+(_li===5?-15:_li===7?15:0),12,88);
                tx+=(supX-src.x)*0.26;ty+=(supY-src.y)*0.20;}
              else{tx+=((_bGX-adir*26)-src.x)*0.16;}// DIFENSORI: linea alta ma prudente
            } else {// la tua squadra DIFENDE
              if(_li>=1&&_li<=4){tx+=((ownGoalX+adir*18)-src.x)*0.34;ty+=(50-src.y)*0.10;}// DIFENSORI: arretrano in linea + compattano
              else if(_li>=5){tx+=((ownGoalX+adir*34)-src.x)*0.22;}// CEN: schermo davanti alla difesa
              else{tx+=((ownGoalX+adir*56)-src.x)*0.12;}// ATT: sbocco alto, rientrano un po'
            }
            // F3: micro-variazione deterministica per-giocatore → il reparto non si muove come un blocco unico
            tx+=Math.sin(i*1.7)*0.5;ty+=Math.cos(i*2.3)*0.7;
          } else if(P.hlType==="freekick"||P.hlSetPiece==="freekick"){
            // 5.49.13 PUNIZIONE — arrangiamento realistico (home attacca verso x=100; eroe = battitore sulla palla).
            const _ball=_bGX,_by=_bGY;
            if(!_hm){// avversari che DIFENDONO
              if(_li>=1&&_li<=4){// MURO compatto (4 difensori) a ~9m sulla linea palla→porta
                tx=clamp(_ball+9,_ball+6,93);
                const _wy=_by+(50-_by)*0.25+(_by<50?-2.5:2.5);// ~sulla linea palla→centro porta, verso il palo vicino
                ty=clamp(_wy+(_li-2.5)*1.5,12,88);// spaziatura ~1.5u → muro serrato
              } else {tx=clamp(_ball+15+((i*7)%9),_ball+12,91);ty=clamp(50+Math.sin(i*2.3)*24,12,88);}// resto: marcature in area, MAI dietro la palla
            } else {// la squadra dell'eroe che ATTACCA
              if(_li>=8){tx=clamp(_ball+6,55,90);ty=clamp(50+Math.cos(i*1.9)*18,16,84);}// ATT al limite per la respinta
              else if(_li>=5){tx=clamp(_ball-4,28,82);ty=clamp(_by+((i%2)?15:-15),14,86);}// CEN a supporto, laterali
              else {tx=clamp(_ball-22,16,55);ty=clamp(38+((i%3)*12),18,82);}// DIF copertura arretrata
            }
          } else if(tx>80){tx=72-(_li>=8?0:4);}// altro set-piece (rigore): sgombera l'area (solo battitore + portiere restano dentro)
          // CINE-4: smarcamenti pre-action — compagni verso porta, avversari stringono sull'eroe
          /* [7.353.0] SONDA della regia delle corse (solo test). Senza, «i compagni non vanno in
             profondita'» non e' attribuibile: non distingue una finestra pre-azione che non si arma da un
             pattern che non combacia da un reparto senza attaccanti. */
          if((_CPM_TEST||_SIT_TEST)&&typeof window!=='undefined'){try{const _q=window.__CPM_PRE||(window.__CPM_PRE={});
            _q.pat=_pat;_q.pT=+(preActionT||0).toFixed(2);_q.sp=!!_setPiece;_q.hl=!!isHL;_q.thr=!!P.hlThrough;_q.ht=P.hlType||null;
            if(_hm){_q.hMax=Math.max(_q.hMax==null?-1:_q.hMax,_li);}}catch(_e){}}
          if(!_setPiece&&isHL&&preActionT>=0){
            const _pt=clamp(preActionT/1.5,0,1),_isAtt=_li>=8,_isMid=_li>=5&&_li<=7;let _q0T=0;
            if(_hm){if(/CROSS|HEADER|CUTBACK/.test(_pat)){
              // CROSS #1: corse COORDINATE in area (pattern-aware) invece del solo avanzamento — primo palo / secondo palo / dischetto + rimorchio CEN.
              const _cs=(P.playerY||50)<50?-1:1,_bx=_hm?86:14;// lato d'origine del cross + x area avversaria
              if(_isAtt){let _ay=50,_ax=_bx;if(_li===8)_ay=50+_cs*9;else if(_li===10)_ay=50-_cs*9;else{_ay=50;_ax=_bx-3;}// 8=primo palo,10=secondo palo,9=dischetto
                tx+=(_ax-src.x)*_pt*0.9;ty+=(_ay-src.y)*_pt*0.9;}
              else if(_isMid){tx+=((_bx-11)-src.x)*_pt*0.55;ty+=(50-src.y)*_pt*0.35;}}// CEN: rimorchio al limite (cutback/seconda palla)
              else if(/SHOT|ONE_ON_ONE/.test(_pat)){if(_isAtt){ty+=(_li===8?-1:1)*_pt*7;tx+=_pt*2;}else if(_isMid)tx+=_pt*2.5;}
              else if(/COMBINATION|THROUGH/.test(_pat)||P.hlType==="pass"||P.hlThrough){_q0T=1;
                // 5.49.24 ASSIST/IMBUCATA — il ricevente dev'essere CHIARO e BEN PIAZZATO: gli attaccanti fanno corse
                //   VERTICALI su canali DISTINTI (primo palo/centrale/secondo palo) e deviano nello SPAZIO LIBERO
                //   davanti al portatore; i CEN offrono un appoggio avanzato laterale. → opzione di passaggio leggibile.
                const _opp2=_hm?_awP:_hmP;
                if(_isAtt){const _ch=_li===8?32:_li===10?68:50,_rx=clamp(_hxg+19,58,90);
                  const _oy=clamp(_ch+(_openAt(_ch+13,_rx,_opp2)-_openAt(_ch-13,_rx,_opp2))*0.42,14,86);
                  tx+=(_rx-src.x)*_pt*0.85;ty+=(_oy-src.y)*_pt*0.75;}
                else if(_isMid){tx+=((_hxg+7)-src.x)*_pt*0.5;ty+=((_hyg+(src.y<50?-11:11))-src.y)*_pt*0.3;}}
            if((_CPM_TEST||_SIT_TEST)&&typeof window!=='undefined'&&window.__CPM_PRE&&_q0T)window.__CPM_PRE.ranThrough=(window.__CPM_PRE.ranThrough||0)+1;
            }else{const _dxh=_hxg-src.x,_dyh=_hyg-src.y,_dh=Math.hypot(_dxh,_dyh);
              if(_dh<30&&_dh>2){const _p=clamp((30-_dh)/30,0,1)*_pt*3.5;tx+=_dxh/_dh*_p;ty+=_dyh/_dh*_p;}}
          }
          const _m706f=!!(src&&src._m706)&&!(typeof window!=='undefined'&&window.__CPM_NO706);
          if(_m706f){tx=src.x;ty=src.y;}/* [7.706.0] L'ELETTO ALLA CONTESA NON SI RIVESTE. MISURATO (arrivi-705 v6): i tre difensori eletti stanno a 2-8u dal pallone in LOGICA, ma entro 6u di MESH la mediana e' 0 — corsie, scarto di possesso e richiami di questo builder tiravano il bersaglio via dalla mischia. Per l'eletto il bersaglio e' la posizione logica pura, che il deployment ha gia' messo sull'anello goal-side. */
          {const _ob=_tgPool[_tgN]||(_tgPool[_tgN]={});_tgN++;_ob.x=tx;_ob.y=ty;_ob.gk=false;_ob.hm=_hm;_ob.li=_li;_ob.att=_li>=8;_ob.def=_li>=1&&_li<=4;_ob.m706=_m706f;_ob.b592=_b592;_ob.a592=_a592;_ob.r592=_r592;_ob.c592=tx;_tg.push(_ob);}
        }
        // HL STAGING (#1/#3) — PRIMO POSIZIONAMENTO coerente: all'avvio di un highlight la scena deve MOSTRARE i giocatori
        //   che l'azione presuppone, non lasciare l'Eroe solo in campo aperto. Porta vicino all'Eroe il compagno e
        //   l'avversario rilevanti. Deterministico, bounded, SOLO durante l'HL (non in gioco aperto), sospeso sui set-piece.
        if(_CPM_STAGE&&isHL&&!_setPiece){
          // il compagno = 2° giocatore di casa più vicino all'Eroe (il 1° è l'Eroe stesso); l'avversario = ospite più vicino
          let _hD=1e9,_heroI=-1,_h2D=1e9,_mateI=-1,_oppI=-1,_oD=1e9;
          for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk)continue;const d=Math.hypot(t.x-_hxg,t.y-_hyg);
            if(t.hm){if(d<_hD){_h2D=_hD;_mateI=_heroI;_hD=d;_heroI=i;}else if(d<_h2D){_h2D=d;_mateI=i;}}
            else{if(d<_oD){_oD=d;_oppI=i;}}}
          const _sy=_hyg<50?1:-1;// verso il centro campo
          if(P.hlDef){// DIFENSIVO (raddoppio/copertura): un avversario PORTATORE davanti all'Eroe (goal-side) + un compagno accanto
            if(_oppI>=0&&_oD>7){const t=_tg[_oppI];t.x+=((_hxg-6)-t.x)*0.6;t.y+=(_hyg-t.y)*0.6;}
            if(_mateI>=0&&_h2D>10){const t=_tg[_mateI];t.x+=((_hxg-2)-t.x)*0.5;t.y+=((_hyg+_sy*6)-t.y)*0.5;}
          } else {// OFFENSIVO: assicura un ATTACCANTE nell'ultimo terzo come opzione di passaggio (per lanci lunghi/imbucate).
            //   Scegli l'attaccante di casa più AVANZATO (parte già avanti → arriva prima) e portalo davanti all'Eroe.
            let _fI=-1,_fx=-1e9;
            for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||!t.hm||i===_heroI||t.li<8)continue;if(t.x>_fx){_fx=t.x;_fI=i;}}
            if(_fI<0)for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||!t.hm||i===_heroI||t.li<5)continue;if(t.x>_fx){_fx=t.x;_fI=i;}}
            if(_fI>=0){const t=_tg[_fI];const _fwd=clamp((P.playerX||_hxg)+22,58,90);if(t.x<_fwd){t.x=_fwd;t.y=clamp(_hyg+_sy*9,14,86);}}// corsa in profondità: opzione di lancio davanti
          }
        }
        // PASS 1b — marcatura: i difensori inseguono lateralmente il centrocampista/attaccante avversario più vicino, restando goal-side.
        //   [6.75.0 DEF-3] assegnazione UNIVOCA (greedy deterministico): un avversario marcato è "preso" — mai
        //   due difensori sullo stesso uomo mentre altri restano completamente liberi. I pool sono disgiunti per
        //   squadra (i difensori di casa marcano gli ospiti e viceversa) → un solo Set basta.
        if(!sr.current._mkClaimB)sr.current._mkClaimB=new Set();
        const _mkClaim=sr.current._mkClaimB;_mkClaim.clear();
        for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||t.m706||!t.def||i===_pr1||i===_pr2)continue;/* [7.706.0] l'eletto alla contesa non marca: ha gia' un uomo, il pallone */// [6.76.0 LMV-M1] i pressori attivi NON marcano: la marcatura li trascinava via dal portatore (due attrattori in conflitto sullo stesso frame)
          let nd=28,nmx=null,nmy=null,nj=-1;
          for(let j=0;j<_tg.length;j++){const o=_tg[j];if(!o||o.gk||o.hm===t.hm||o.li<5||_mkClaim.has(j))continue;
            const dd=Math.hypot(o.x-t.x,o.y-t.y);if(dd<nd){nd=dd;nmx=o.x;nmy=o.y;nj=j;}}
          if(nmx!==null){_mkClaim.add(nj);const m=clamp((28-nd)/28,0,1);const gx=t.hm?6:94;// F3: marcatura più aggressiva + goal-side marcato
            t.y+=(nmy-t.y)*0.5*m;t.x+=((nmx+(gx-nmx)*0.40)-t.x)*0.22*m;}
        }
        // PASS 1c — F10 (AI DELIBERATIVA, slice 1): COPERTURA della linea di passaggio più PERICOLOSA.
        //   Un difensore della squadra che difende "legge" il ricevente più pericoloso della squadra in
        //   possesso (attaccante più vicino alla porta e con più spazio) e si sposta sulla LINEA palla→ricevente
        //   (lato porta) per CHIUDERLA — non si limita a marcare il più vicino. Deterministico, bounded, visivo.
        if(!_setPiece){
          const _attHome=_homeBall;// chi ATTACCA (true → la squadra dell'eroe)
          let _thX=null,_thY=null,_thr=-1;// ricevente più pericoloso tra gli attaccanti in possesso
          for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||t.hm!==_attHome||!t.att)continue;
            const goalX=_attHome?100:0,adv=1-Math.abs(goalX-t.x)/100,open=clamp(_openAt(t.y,t.x,_attHome?_awP:_hmP)/30,0,1);
            const danger=adv*0.7+open*0.3;if(danger>_thr){_thr=danger;_thX=t.x;_thY=t.y;}}
          if(_thX!==null){// difensore avversario meglio piazzato per intercettare la linea palla→ricevente
            const mx=_bGX*0.42+_thX*0.58,my=_bGY*0.42+_thY*0.58;// punto sulla linea, spostato verso il ricevente
            let _bi=-1,_bd=1e9;
            for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||t.hm===_attHome||!t.def)continue;
              const d=Math.hypot(t.x-mx,t.y-my);if(d<_bd){_bd=d;_bi=i;}}
            if(_bi>=0&&_bd<34){const t=_tg[_bi],g=clamp((34-_bd)/34,0,1);t.x+=(mx-t.x)*0.28*g;t.y+=(my-t.y)*0.30*g;}
          }
        }
        // PASS 1d — F11 (AI DELIBERATIVA, slice 2): PRESS + COVER sul portatore in zona pericolosa.
        //   Quando il portatore entra nell'ultimo terzo, oltre al primo difensore che pressa, un SECONDO
        //   difensore prende posizione di COPERTURA goal-side (raddoppio) — niente due che si tuffano sulla
        //   palla: press&cover reale. Deterministico, bounded, visivo, sospeso sui set-piece.
        if(!_setPiece){
          const _attHome=_homeBall,goalX=_attHome?100:0,_inFinalThird=_attHome?(_bGX>66):(_bGX<34);
          if(_inFinalThird){
            let c1=-1,c2=-1,d1=1e9,d2=1e9;// i due difensori più vicini alla palla
            for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||t.hm===_attHome||!t.def)continue;
              const d=Math.hypot(t.x-_bGX,t.y-_bGY);if(d<d1){d2=d1;c2=c1;d1=d;c1=i;}else if(d<d2){d2=d;c2=i;}}
            if(c2>=0&&d2<22){const t=_tg[c2],covX=_bGX*0.5+goalX*0.5,covY=_bGY+(_bGY<50?6:-6),g=clamp((22-d2)/22,0,1);
              t.x+=(covX-t.x)*0.26*g;t.y+=(covY-t.y)*0.24*g;}// copertura: tra palla e porta, arretrata e laterale
          }
        }
        // cpmadapt — SHADING DIFENSIVO (ULTIMA passata, così è l'ultima parola del frame e non viene sovrascritta dalla
        //   marcatura): la difesa "si aspetta" lo schema ripetuto e ombreggia verso la fascia più attaccata dall'Eroe
        //   (adaptShift ±4u, deterministico/bounded). Solo la squadra che DIFENDE (no GK); sospeso sui set-piece.
        {const _adS=(propsRef.current&&propsRef.current.adaptShift)||0;if(_adS&&!_setPiece){for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||!t.def||t.hm===_homeBall)continue;t.y=clamp(t.y+_adS,3,97);}}}
        // cpmadapt (c) — PRE-COPERTURA della fascia preferita: quando il pattern è marcato (adaptStr>0.3), UN difensore
        //   (il più vicino) pre-occupa il canale che l'Eroe usa di più — punto goal-side sulla fascia calda. Più incisivo
        //   dello shading uniforme, ma UNO solo → niente buchi. Deterministico, bounded, sospeso sui set-piece.
        {const _pr=propsRef.current||{},_aStr=_pr.adaptStr||0,_hy=_pr.adaptHotY||50;
         if(_aStr>0.3&&_hy!==50&&!_setPiece){const _covX=_homeBall?80:20;let _bi=-1,_bd=1e9;
           for(let i=0;i<_tg.length;i++){const t=_tg[i];if(!t||t.gk||!t.def||t.hm===_homeBall)continue;const d=Math.hypot(t.x-_covX,t.y-_hy);if(d<_bd){_bd=d;_bi=i;}}
           if(_bi>=0){const t=_tg[_bi],g=_aStr;t.x+=(_covX-t.x)*0.20*g;t.y=clamp(t.y+(_hy-t.y)*0.34*g,3,97);}}}
        // PASS 2 — repulsione/spaziatura (bolla personale ~6.5u): elimina le "ammucchiate"
        const _RB=6.5;
        for(let i=0;i<_tg.length;i++){const a=_tg[i];if(!a||a.gk)continue;
          let px=0,py=0;
          for(let j=0;j<_tg.length;j++){if(j===i)continue;const b=_tg[j];if(!b||b.gk)continue;
            const ex=a.x-b.x,ey=a.y-b.y,dd=Math.hypot(ex,ey);
            if(dd>0.01&&dd<_RB){const f=(_RB-dd)/_RB;px+=ex/dd*f;py+=ey/dd*f;}
            else if(dd<=0.01){px+=(i<j?0.4:-0.4);}}
          // l'eroe respinge i compagni (one-way): nessuna sovrapposizione col protagonista
          {const ex=a.x-_hxg,ey=a.y-_hyg,dd=Math.hypot(ex,ey);if(dd>0.01&&dd<_RB){const f=(_RB-dd)/_RB;px+=ex/dd*f*1.2;py+=ey/dd*f*1.2;}}
          a.rx=clamp(px*1.6,-5.5,5.5);a.ry=clamp(py*1.6,-5.5,5.5);// F3: repulsione rinforzata (target più ampi → più separazione)
        }
        // APPLY — animOne sul target finale (target+repulsione), clamp dentro il campo
        // FREEZE #2 (avvio highlight TV-like): all'AVVIO dell'highlight i giocatori off-ball si POSIZIONANO (snap, mascherato dall'intro) e restano FERMI
        //   per TUTTA la fase di LETTURA — hl_intro + hl_move + hl_choose (fino alla scelta). L'EROE è sempre libero (controllo diretto).
        const _inRead=(_curPh==="hl_intro"||_curPh==="hl_move"||_curPh==="hl_choose");
        // FREEZE #2 (5.47.17): i 21 off-ball restano FERMI per TUTTA la fase di lettura — niente più timeout su hl_choose:
        //   si muovono SOLO dopo che l'eroe HA SCELTO l'azione (si esce da hl_choose → hl_result). Così non partono mai
        //   prima della conclusione dei movimenti eroe + scelta. L'EROE è sempre libero. Disattivato sotto ?cpmtest=1 (il gate valida l'AI).
        /* [7.345.0] LO SNAP E IL FREEZE SONO SPENTI SOTTO cpmtest — e questo li rendeva NON MISURABILI: una
           probe vedeva i 22 ancora in viaggio e concludeva «i compagni arrivano tardi», che è vero nel gate ma
           non è la presentazione che vede il giocatore. `__CPM_PRESENT=1` li riaccende per la sola misura, così
           il collaudo può giudicare la scena REALE invece di una sua approssimazione. Nessun effetto senza il
           flag: il gate continua a validare l'AI off-ball come prima. */
        const _pres345=(typeof window!=='undefined'&&window.__CPM_PRESENT===1);
        const _asIfPlay=_pres345||!_CPM_TEST;
        /* [7.401.0 collaudo PO «SALTO del pallone di 35,9u — sembra un teletrasporto» + «ad inizio scena
           TRABALLA TUTTO» (gi168/gi132)] LO SNAP SI RI-ARMA SUL COMMIT DI STAGING. Lo snap del taglio
           legge i bersagli del fotogramma in cui la chiave di scena cambia — ma lo staging vero (continuita'
           + stageSitPositions) arriva un commit React DOPO: su una scena che salta lontano l'intero teatro
           veniva piazzato sui punti VECCHI (~30 unita' piu' in qua), il freeze di lettura inchiodava li' i
           ventuno, e la palla — l'unica con un inseguitore sempre attivo — strisciava da sola verso lo
           staging fresco: 38 unita' rasoterra in ~200 ms, con la camera a rincorrerla. Due tentativi sul
           solo pallone REVOCATI con misura invariata (7.400): la causa e' il teatro, non la palla. Qui, se
           nella finestra mascherata dell'intro meta' squadra dista piu' di 8 unita' dal proprio bersaglio
           — cioe' i bersagli si sono mossi IN MASSA: e' arrivato lo staging — si ri-taglia: giocatori,
           palla e camera insieme, una volta per scena. Un taglio, non un viaggio. */
        /* [7.456.0 codice 007 «ad inizio scena traballa tutto»] IL RITARDO DI STAGING SI CONTA.
           Prima di correggere: questo osservatore registra il fotogramma in cui il contatore di
           staging cambia — quanti ms dopo il taglio arriva, e quanti dei ventidue sono ancora
           inchiodati sui punti del commit VECCHIO in quell'istante. E' lo stesso strumento che
           misura il dopo: il numero di «far» deve collassare a zero perche' il taglio sia UNO. */
        const _stgNew456=(P.stageStamp!==sr.current._lastStg456);
        if(_stgNew456){sr.current._lastStg456=P.stageStamp;
          /* ⚠️ `_hlSnap` si registra INSIEME alla distanza, ed e' il punto di tutta la misura: in
             questo punto del fotogramma il taglio non e' ancora stato eseguito (il ciclo giocatori
             sta piu' sotto, r.~14250), quindi trovare la squadra lontana dai bersagli e' NORMALE se
             un taglio e' armato. Il difetto e' l'altro caso: bersagli freschi (`far` alto) e NESSUN
             taglio armato (`snap` falso) — i ventidue restano dove sono e ci vanno a piedi. */
          if(/^hl_/.test(_curPh||"")&&typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){
            let _n456=0,_far456=0,_dmax456=0;
            for(let i=0;i<_players.length;i++){const t=_tg[i],pp=_players[i];if(!t||!pp||!pp.mesh||t.gk)continue;_n456++;
              const _dx=G2X(clamp(t.x+(t.rx||0),2,98))-pp.mesh.position.x,_dz=G2Z(clamp(t.y+(t.ry||0),2,98))-pp.mesh.position.z;
              const _d456=Math.hypot(_dx,_dz);if(_d456>8)_far456++;if(_d456>_dmax456)_dmax456=_d456;}
            const _cc456=(window.__CPM_STG456=window.__CPM_STG456||[]);
            if(_cc456.length<60)_cc456.push({k:P.hlSitKey,stamp:P.stageStamp,ph:_curPh,snap:!!_hlSnap,dt:Math.round(now-(sr.current._cutAt||0)),far:_far456,n:_n456,dmax:+_dmax456.toFixed(1)});}}
        /* [7.456.0] SALTO DI BERSAGLIO IN MASSA. La misura sopra dice quando arriva lo staging; questa
           dice quando i bersagli si spostano TUTTI INSIEME — che e' l'evento che il setaccio 7.401
           insegue a naso. Registra ogni fotogramma in cui meta' squadra cambia bersaglio di oltre 4
           unita' logiche, con la fase, i ms dal taglio e se un taglio e' armato. Un salto in massa
           SENZA taglio armato e' il difetto: i ventidue ci vanno a piedi. */
        if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&/^hl_/.test(_curPh||"")){
          const _pt456=sr.current._pt456||(sr.current._pt456=[]);
          let _mv456=0,_mx456=0,_cnt456=0;
          for(let i=0;i<_players.length;i++){const t=_tg[i];if(!t||t.gk)continue;_cnt456++;
            const _o456=_pt456[i],_tx456=t.x+(t.rx||0),_ty456=t.y+(t.ry||0);
            if(_o456){const _d456b=Math.hypot(_tx456-_o456.x,_ty456-_o456.y);if(_d456b>4)_mv456++;if(_d456b>_mx456)_mx456=_d456b;}
            _pt456[i]={x:_tx456,y:_ty456};}
          /* `ap` distingue le due sorgenti possibili del salto: un COMMIT React (l'array allPlayers
             cambia identita' → qualcuno ha ri-scritto le posizioni) oppure l'AI off-ball del
             render-loop (identita' invariata → i bersagli li ha ricalcolati il renderer). */
          const _apNew456=(P.allPlayers!==sr.current._ap456);sr.current._ap456=P.allPlayers;
          if(_cnt456>=8&&_mv456>=_cnt456*0.5){const _cj456=(window.__CPM_TJ456=window.__CPM_TJ456||[]);
            if(_cj456.length<80)_cj456.push({k:P.hlSitKey,ph:_curPh,dt:Math.round(now-(sr.current._cutAt||0)),mv:_mv456,n:_cnt456,mx:+_mx456.toFixed(1),snap:!!_hlSnap,stamp:P.stageStamp,ap:_apNew456});}}
        /* [7.456.0 codice 007 «ad inizio scena traballa tutto»] IL RI-TAGLIO SI ARMA SUL COMMIT DI
           STAGING, NON PIU' A NASO. Il setaccio del 7.401 cercava lo staging in ritardo INDOVINANDOLO
           dalla distanza («meta' squadra oltre 8 unita' dal bersaglio, entro 900 ms dal taglio»). La
           misura sul flusso VERO — contatore `stageStamp` bumpato insieme alle posizioni nuove, quindi
           nello stesso commit React — dice due cose, su una trentina di aperture:
             (1) lo staging NON e' in ritardo: atterra nel fotogramma del taglio, col taglio gia'
                 armato, in 30 aperture su 30. La condizione che il setaccio cercava non si presenta.
             (2) il setaccio scattava lo stesso — misurato a +508, +546, +548, +646, +653, +805 ms —
                 perche' a mezzo intro i bersagli si spostano IN MASSA per conto loro: il tick di
                 pressing riscrive le posizioni ogni 550-700 ms (r.~18707) e l'AI off-ball del
                 render-loop ri-mira. Quello NON e' staging stantio: e' gioco. E il secondo taglio che
                 ne seguiva — ventidue, palla e CAMERA insieme — cadeva FUORI dallo stacco nero che lo
                 avrebbe mascherato (setCutFx dura 360-560 ms), quindi il giocatore lo vedeva.
           Ora la condizione e' quella VERA e non una sua approssimazione: si ri-taglia se e solo se il
           commit di staging arriva quando un taglio non e' gia' armato — una volta per scena. Se lo
           staging e' puntuale (il caso misurato) questo blocco e' un no-op e il taglio resta UNO; se
           arriva davvero in ritardo (dispositivo lento, il caso del PO) si taglia SU QUEL COMMIT,
           dentro la maschera, invece che centinaia di ms dopo. */
        if(_stgNew456&&!_hlSnap&&_asIfPlay&&!P.ceremony&&!P.shootout&&/^hl_/.test(_curPh||"")
           &&sr.current._reSnap401!==P.hlSitKey&&P.hlSitKey!=null){
          sr.current._reSnap401=P.hlSitKey;_hlSnap=true;sr.current._cutSrc456="staging";
          sr.current._ballSnap=true;sr.current._sceneCut=true;sr.current._cutZoomSnap=true;
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){const _c=(window.__CPM_RSNP401=window.__CPM_RSNP401||[]);if(_c.length<40)_c.push({k:P.hlSitKey,t:Math.round(now-(sr.current._cutAt||0)),src:"staging"});}}
        /* [7.592.0 SOLO COLLAUDO] la scomposizione si chiude QUI, dove il bersaglio e' definitivo e la
           mesh e' quella che l'utente vede: cosi' l'ultimo pezzo — quanto la mesh resta indietro rispetto
           al bersaglio — non si confonde con le correzioni che il bersaglio ha gia' subito. */
        if(typeof window!=='undefined'&&window.__CPM_D592){try{const D=window.__CPM_D592;
          for(let i=0;i<_players.length;i++){const t=_tg[i],pp=_players[i];
            if(!t||!pp||!pp.mesh||t.gk||t.b592==null)continue;
            D.forma=(D.forma||0)+Math.abs(t.a592-t.b592);
            D.ruolo=(D.ruolo||0)+Math.abs(t.r592-t.a592);
            D.pressing=(D.pressing||0)+Math.abs(t.c592-t.r592);
            D.dopo=(D.dopo||0)+Math.abs(t.x-t.c592);
            D.mesh=(D.mesh||0)+Math.abs((pp.mesh.position.x+50)-t.x);
            D.tot=(D.tot||0)+Math.abs((pp.mesh.position.x+50)-t.b592);
            /* [7.592.0] e QUANTO SI MUOVONO, per fotogramma: un ritardo di cinque metri puo' essere un
               tetto di velocita' troppo basso (la mesh non ce la fa) oppure un bersaglio che oscilla (la
               mesh insegue avanti e indietro e non ci arriva mai). Sono due difetti opposti e chiedono
               rimedi opposti, quindi vanno distinti PRIMA di scrivere il rimedio. */
            const _mx=pp.mesh.position.x+50;
            /* [7.592.0] I DUE STADI SEPARATI, che e' la misura che manca per sapere DOVE intervenire:
               `_ctx` e' il bersaglio commesso (uscita del primo smorzamento), `mesh.position` e' cio' che
               si vede (uscita del secondo, quello con inerzia, rampa d'arrivo e limitatore di sterzata).
               Senza separarli, «cinque metri e mezzo di ritardo» non dice quale dei due li produce. */
            if(pp.mesh._ctx!=null){D.st1=(D.st1||0)+Math.abs((pp.mesh._ctx+50)-t.x);D.st2=(D.st2||0)+Math.abs(_mx-(pp.mesh._ctx+50));D.n12=(D.n12||0)+1;
              D.vmax=(D.vmax||0)+(pp.mesh._vmax||0);D.vcur=(D.vcur||0)+Math.hypot(pp.mesh._vx||0,pp.mesh._vz||0);
              /* ⚠️ [7.592.0] stavo per concludere che la mesh «non si muove alla velocita' che dichiara»,
                 confrontando 5,28 m/s di MODULO con 0,166 m di passo sulla sola X. Non e' un confronto:
                 il modulo mescola x e z, e la z e' pure in un'altra scala (G2Z moltiplica per 0,68). Qui
                 si confronta cio' che e' confrontabile — |vx*dt| contro il passo effettivo su x. */
              D.vxdt=(D.vxdt||0)+Math.abs((pp.mesh._vx||0)*(window.__CPM_DT592||0));}
            if(pp.mesh._px592!=null){D.passoMesh=(D.passoMesh||0)+Math.abs(_mx-pp.mesh._px592);D.passoTg=(D.passoTg||0)+Math.abs(t.x-pp.mesh._ptg592);D.nn=(D.nn||0)+1;
              /* quante volte il bersaglio INVERTE il verso: e' la firma dell'oscillazione */
              const _dv=t.x-pp.mesh._ptg592;if(pp.mesh._pdv592!=null&&_dv*pp.mesh._pdv592<0)D.inv=(D.inv||0)+1;if(Math.abs(_dv)>0.01)pp.mesh._pdv592=_dv;}
            pp.mesh._px592=_mx;pp.mesh._ptg592=t.x;
            D.n=(D.n||0)+1;}
        }catch(_e){}}
        const _readFreeze=(_asIfPlay&&_inRead&&_chooseT>=0),_doSnap=(_hlSnap&&_asIfPlay);
        for(let i=0;i<_players.length&&!P.ceremony&&!P.shootout;i++){const t=_tg[i],pp=_players[i];if(!t||!pp)continue;/* [7.2.0] durante la premiazione il movimento off-ball è guidato dal blocco ceremony (giro/curva/podio) */
          // FIX passaggio: il compagno destinatario/ricevente NON si sposta — resta fermo ad accogliere la palla (ricezione leggibile)
          if(pp.mesh===passTargetMesh||(pp.mesh._rcvT!=null&&pp.mesh._rcvT>=0)||(pp.mesh._failRunT!=null&&pp.mesh._failRunT>=0)||pp.mesh._celT371===1||pp.mesh._carry526!=null||(sr.current._pkCol415&&pp.mesh===sr.current._pkCol415.m))continue;/* [7.618.0] anche il RACCOGLITORE e' fuori dal driver di formazione: senza questo, il driver lo tirava allo slot ogni frame e il pallone vagante restava solo (misurato: driver del raccoglitore vivo 28 frame, avversario piu' vicino fermo a 7-8u) — decima istanza di «piu' autorita' sulla stessa grandezza» *//* [7.523.0 PORTATORE] chi conduce/riceve e' fuori dal driver di formazione *//* [7.371.0] chi sta correndo a festeggiare non viene riportato in posizione dall'AI off-ball: due driver sullo stesso mesh = il difetto del 5.43.13 */
          if(oppActType&&pp.mesh===oppMesh)continue;// 5.43.13: durante un'azione reattiva (tuffo portiere / scivolata) il mesh è controllato SOLO da quell'animazione → niente conflitto col run-cycle off-ball ("parata scoordinata")
          if(t.gk)continue;// 5.43.14b: i PORTIERI gestiti a parte (sotto), SENZA repulsione → niente jitter/"corsa sul posto"
          if(_doSnap){const _sx=G2X(clamp(t.x+(t.rx||0),2,98)),_sz=G2Z(clamp(t.y+(t.ry||0),2,98));pp.mesh.position.x=_sx;pp.mesh.position.z=_sz;pp.mesh._ctx=_sx;pp.mesh._ctz=_sz;pp.mesh._vx=0;pp.mesh._vz=0;pp.mesh._px=_sx;pp.mesh._pz=_sz;continue;}// FREEZE #2: snap in posizione all'avvio (poi fermo)
          /* [7.402.0 — revocato il taglio per-uomo indiscriminato: strappava via il compagno della consegna. */
          /* [7.405.0 codice 001 — direttiva PO: «il compagno ad inizio scena deve avere il pallone TRA I
             PIEDI», niente residui] LA COLLA DEL BATTITORE, stavolta DIMOSTRATA. Il tracciante mirato (tre
             repliche, varianza ZERO) mostra: palla esattamente sul punto dichiarato, mesh del battitore a
             3-9,6 unita' — snappata sul bersaglio stantio al taglio e poi INCHIODATA dal freeze di lettura,
             senza mai arrivare. Qui si tiene UNA mesh sola sul punto: quella il cui bersaglio logico
             coincide col punto staggiato (rx/ry azzerati dallo staging: il match e' esatto), per tutta la
             lettura — il battitore aspetta sul pallone, come nel calcio. La revoca del 7.403 nasceva dal
             RUMORE dello strumento di popolazione (ordine-dipendente), non dal fix: i controlli gi142/144/106
             misurati con lo strumento mirato stanno a 0,0 con e senza. E con la mesh addosso, la regola
             7.389 fa scendere da sola il pallone dalla quota aerea ai piedi. */
          /* [7.679.0 — REVOCATO IL RIMEDIO, IL DIFETTO ERA IL MIO METRO. Qui, per due giorni, ho
             tenuto un blocco che all'apertura di una scena offensiva portava il compagno piu' vicino
             sul pallone, perche' la sonda apertura-599 diceva «4 scene su 40 si aprono col pallone di
             nessuno dei nostri». Due difetti dello STRUMENTO, non del gioco: (1) la sonda girava senza
             `__CPM_PRESENT`, e sotto cpmtest quel flag spegne snap e freeze di presentazione — cioe'
             proprio i blocchi che mettono gli uomini dove la scena dice (gi8: eroe a 42,5 u senza, a
             0,0 u con); (2) misurava a 750 ms fissi, cogliendo il pallone ANCORA IN VIAGGIO verso il
             suo bersaglio (gi0: palla a 50·53,9, bersaglio 90·59). Corretti i due, il censimento da'
             0/40 — e la prova del rosso da' 0/40 anche SENZA il rimedio. Riga tolta: nessun guadagno
             misurabile, e un blocco che sposta uomini ogni fotogramma di lettura non si tiene «per
             sicurezza». Resta la sonda, che ora misura il regime del giocatore. */
          if(_asIfPlay&&_inRead){
            const _ss405=P.stagedSpot&&P.stagedSpot.current,_src405=(P.allPlayers||[])[i];
            if(_ss405&&_src405&&_src405._taker402){
              const _sx5=G2X(clamp(_ss405.x,2,98)),_sz5=G2Z(clamp(_ss405.y,2,98));
              if(Math.hypot(_sx5-pp.mesh.position.x,_sz5-pp.mesh.position.z)>1.5){
                pp.mesh.position.x=_sx5;pp.mesh.position.z=_sz5;pp.mesh._ctx=_sx5;pp.mesh._ctz=_sz5;pp.mesh._vx=0;pp.mesh._vz=0;pp.mesh._px=_sx5;pp.mesh._pz=_sz5;continue;}}}
          if(pp.mesh._mIdx==null)pp.mesh._mIdx=i;/* [7.198.0 S5] indice stabile: da qui derivano punta/spunto/prontezza del singolo giocatore */
          if(_readFreeze){
            /* [7.355.0 collaudo PO gi10 «sembra che stiano facendo riscaldamento, i giocatori non sono in
               posizione d'attesa»] IN ATTESA SI GUARDA LA PALLA. Il freeze di lettura ferma gli off-ball di
               proposito (~0,9s per far leggere la scena) ma li lasciava con l'orientamento che avevano un
               istante prima: misurato in lettura, errore mediano 64-85 gradi e 7-9 giocatori su 19 girati di
               oltre 90 gradi, cioe' DI SPALLE all'azione. Fermi e di spalle si legge come riscaldamento;
               fermi ma orientati sul pallone si legge come attesa. Si ruota soltanto: la posizione resta
               congelata, che e' il punto del freeze. Sotto il gate `_readFreeze` e' gia' falso (serve
               __CPM_PRESENT), quindi il percorso di validazione non cambia di un frame. */
            const _fx55=bx-pp.mesh.position.x,_fz55=bz-pp.mesh.position.z;
            if(_fx55*_fx55+_fz55*_fz55>0.25){const _w55=Math.atan2(_fx55,_fz55);
              let _d55=((_w55-pp.mesh.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;
              pp.mesh.rotation.y+=_d55*Math.min(aDt*6,1);}
            /* [7.685.0 — codice 006 del taccuino PO, «reparto fermo», e finalmente con un numero.
               MISURATO su 16 scene: durante la LETTURA lo spostamento medio per giocatore e' 0,00 unita'
               e i fermi sono 19 su 19 — non «quasi immobili»: immobili al centimetro, ventidue statue.
               Nell'esito invece il reparto reagisce (0 scene con tutti fermi, media 0,89 u), quindi il
               difetto vive tutto nella finestra di lettura, ed e' il freeze 7.194 che fa il suo mestiere
               in modo troppo letterale: un campo di calcio vero non e' mai una fotografia, chi aspetta
               si aggiusta, sposta il peso, fa due passi corti.
               IL RESPIRO. Oscillazione attorno al punto CONGELATO, un terzo di unita' scarso: la scena
               non cambia geometria — nessuno si sposta davvero, il baricentro resta dov'e' — ma smette
               di sembrare un fermo immagine. La rotazione verso la palla del 7.355 resta.
               ⚠️ NON SI SOMMA NIENTE A OGNI FOTOGRAMMA: la base si cattura UNA volta e la posizione e'
               sempre base + offset(t). Sommare un delta a ogni frame e' il cricchetto del 7.397, che
               regala unita' di deriva a ogni fotogramma — errore gia' fatto e gia' pagato. */
            if(!(typeof window!=='undefined'&&window.__CPM_NO685)){
              if(!pp.mesh._frz685)pp.mesh._frz685={x:pp.mesh.position.x,z:pp.mesh.position.z,ph:(ak*1.7)%6.283};
              const _F685=pp.mesh._frz685,_t685=(now*0.0011)+_F685.ph;
              pp.mesh.position.x=_F685.x+Math.sin(_t685)*0.30;
              pp.mesh.position.z=_F685.z+Math.cos(_t685*0.83)*0.22;
            }
            continue;}// FREEZE #2: off-ball fermi (ma rivolti alla palla) durante la fase di lettura
          if(pp.mesh._frz685)pp.mesh._frz685=null;/* [7.685.0] fuori dalla lettura la base del respiro si butta: tenerla vorrebbe dire far ripartire la prossima attesa da un punto vecchio */
          animOne(pp.mesh,G2X(clamp(t.x+(t.rx||0),2,98)),G2Z(clamp(t.y+(t.ry||0),2,98)),aDt,ak,bx,bz);}
        // item 2 (5.49.6): INGRESSO DEL SUBENTRANTE — l'eroe parte dalla LINEA LATERALE (area tecnica), riceve le ultime indicazioni
        //   (si gira verso la panchina), poi cammina IN CAMPO fino alla sua posizione. Override del target eroe durante la sequenza.
        if(subEntryT>=0){
          // [7.126.0 collaudo PO «crea DIVERSE animazioni 3D per l'ingresso dalla panchina + alternanza per importanza»]
          //   5 VARIANTI d'ingresso (V da hero._subVar, seedata+importance-aware in LiveMatch): differiscono per
          //   ATTESA alla linea, EASING della corsa, ROTAZIONE (verso mister / guarda gli spalti) e GESTI (saluto,
          //   applauso, punta avanti, pump, calmo). Sul rig procedurale i gesti sono pieni; sul GLB la clip domina la
          //   locomozione ma PACING+rotazione root variano comunque. V0 carica · V1 concentrato · V2 showman ·
          //   V3 veterano · V4 esplosivo.
          const V=hero._subVar||0;
          const _hold=[1.5,1.0,1.4,2.0,0.6][V],_runEnd=[3.5,3.2,3.6,3.9,2.9][V];
          const _stx=-6,_stz=-35.5,_ftx=G2X(_hxg),_ftz=G2Z(_hyg);// touchline (area tecnica home) → posizione in campo
          let _hex,_hez;
          if(subEntryT<_hold){_hex=_stx;_hez=_stz;}// istruzioni/pronto: fermo alla linea
          else if(subEntryT<_runEnd){const _r=(subEntryT-_hold)/Math.max(0.1,_runEnd-_hold);
            const _p=V===3?_r:V===4?(1-(1-_r)*(1-_r)):V===1?_r*_r:_r*_r*(3-2*_r);// veterano=linear · esplosivo=ease-out · concentrato=ease-in · altri=smoothstep
            _hex=_stx+(_ftx-_stx)*_p;_hez=_stz+(_ftz-_stz)*_p;}
          else {_hex=_ftx;_hez=_ftz;}// arrivato a posizione
          animOne(hero,_hex,_hez,aDt,ak,bx,bz);
          if(subEntryT<_hold&&hero._torso){
            if(V===2){hero.rotation.y=Math.sin(subEntryT*2.6)*0.7;}// showman: si guarda intorno agli spalti
            else{hero.rotation.y=Math.atan2(-14-hero.position.x,-38-hero.position.z);}// verso il mister (dugout home x≈-14,z≈-38)
          }
          // gesti procedurali (pieni sul rig non-GLB; sul GLB la clip di corsa domina → innocui)
          if(hero._aR&&hero._aL){
            const _rmid=(subEntryT>=_hold&&subEntryT<_runEnd)?(subEntryT-_hold)/Math.max(0.1,_runEnd-_hold):-1;// 0..1 durante la corsa
            const _rarr=(subEntryT>=_runEnd&&subEntryT<SUB_DUR)?(subEntryT-_runEnd)/Math.max(0.1,SUB_DUR-_runEnd):-1;// 0..1 all'arrivo
            // ATTESA: applauso (V1) prima di entrare
            if(V===1&&subEntryT>=_hold-0.35&&subEntryT<_hold+0.05){const w=Math.abs(Math.sin((subEntryT-_hold+0.35)/0.4*Math.PI));hero._aR.rotation.x=-w*1.1;hero._aL.rotation.x=-w*1.1;hero._aR.rotation.z=w*0.4;hero._aL.rotation.z=-w*0.4;}
            // CORSA: saluto a metà
            if(_rmid>=0){
              if(V===0&&_rmid>0.15&&_rmid<0.6){const w=Math.sin((_rmid-0.15)/0.45*Math.PI);hero._aR.rotation.x=-w*1.9;hero._aR.rotation.z=w*0.55;}// un braccio al pubblico
              else if(V===2&&_rmid>0.2&&_rmid<0.75){const w=Math.sin((_rmid-0.2)/0.55*Math.PI);hero._aR.rotation.x=-w*2.0;hero._aL.rotation.x=-w*2.0;}// showman: due braccia
            }
            // ARRIVO: gesto d'ingresso per variante
            if(_rarr>=0){const a=Math.sin(_rarr*Math.PI);
              if(V===0){hero._aR.rotation.x=-a*1.5;hero._aL.rotation.x=-a*1.5;}// carica: braccia su
              else if(V===1){hero._aR.rotation.x=-a*1.3;}// concentrato: punta avanti (un braccio)
              else if(V===2){hero._aR.rotation.x=-a*1.7;hero._aL.rotation.x=-a*1.7;if(hero._torso)hero.rotation.y=Math.sin(_rarr*Math.PI*3)*0.3;}// showman: saluta gli spalti (sweep) + pump
              else if(V===3){hero._aR.rotation.x=-a*0.85;}// veterano: una mano su, misurato
              else{hero._aR.rotation.x=-a*1.4;hero._aR.rotation.z=a*0.3;}// esplosivo: pugno deciso
            }
          }
          if(subEntryT>SUB_DUR)subEntryT=-1;
        } else if(subExitT>=0){
          // [7.127.0 collaudo PO «almeno altrettante animazioni per l'uscita dal campo a seguito di sostituzioni»]
          //   5 VARIANTI d'USCITA (V da hero._exVar, seedata + aware di importanza/MOTIVO in LiveMatch: applausi →
          //   applauso/saluto/thumbs-up · stanco → testa bassa/mani sui fianchi): l'eroe cammina dalla posizione
          //   CORRENTE al dugout, con gesti per variante, poi ESCE (nascosto, _benched). Onban → nessun HL interferisce.
          const XV=hero._exVar||0,_xdur=_EXIT_DUR[XV];
          const _dx=-6,_dz=-36.2;// area tecnica / dugout home
          const _r=Math.min(1,subExitT/Math.max(0.1,_xdur*0.82));const _p=_r*_r*(3-2*_r);// walk-off smoothstep (più lento della corsa d'ingresso)
          const _hex=(hero._exSx!=null?hero._exSx:hero.position.x)+(_dx-(hero._exSx!=null?hero._exSx:hero.position.x))*_p;
          const _hez=(hero._exSz!=null?hero._exSz:hero.position.z)+(_dz-(hero._exSz!=null?hero._exSz:hero.position.z))*_p;
          animOne(hero,_hex,_hez,aDt,ak,bx,bz);// facing = direzione di marcia (verso il dugout) via animOne
          // gesti d'uscita (pieni sul rig procedurale; sul GLB la locomozione domina → pacing/traiettoria variano)
          if(hero._aR&&hero._aL){
            const _wk=(subExitT<_xdur*0.7)?(subExitT/(_xdur*0.7)):-1;// 0..1 durante la camminata
            if(_wk>=0){
              if(XV===0){/* applauso ai tifosi (ritmico) */const c=Math.abs(Math.sin(subExitT*6));hero._aR.rotation.x=-c*1.15;hero._aL.rotation.x=-c*1.15;hero._aR.rotation.z=c*0.35;hero._aL.rotation.z=-c*0.35;}
              else if(XV===1){/* saluto: una mano su, ferma */const s=Math.sin(Math.min(1,_wk*2)*Math.PI*0.5);hero._aR.rotation.x=-s*1.5;}
              else if(XV===2){/* thumbs-up verso il mister: braccio semi-alzato + torso girato al dugout */hero._aR.rotation.x=-0.9;hero._aR.rotation.z=0.5;if(hero._torso&&_wk>0.4)hero.rotation.y=Math.atan2(-14-hero.position.x,-38-hero.position.z);}
              else if(XV===3){/* deluso: mani dietro la testa (posa di sconforto) */hero._aR.rotation.x=-2.4;hero._aR.rotation.z=-0.55;hero._aL.rotation.x=-2.4;hero._aL.rotation.z=0.55;}
              else{/* stanco: mani sui fianchi */hero._aR.rotation.x=-0.5;hero._aR.rotation.z=0.9;hero._aL.rotation.x=-0.5;hero._aL.rotation.z=-0.9;}
            }
          }
          if(subExitT>_xdur){subExitT=-1;hero.visible=false;hero._benched=true;/* uscito: nascosto al dugout */}
        } else if(!P.ceremony&&!P.shootout&&!hero._benched){
          /* [7.194.0 S1] anche l'EROE si posiziona con lo SNAP d'avvio dell'highlight (finora riservato ai 21
             off-ball): la sua traversata di mezzo campo era visibile in chiaro sotto la scritta dell'intro. Lo
             snap è mascherato dall'intro esattamente come per gli altri; le velocità d'animazione NON vengono
             azzerate (niente T-pose), solo quelle di traslazione. */
          /* lo snap dell'EROE vale anche sotto ?cpmtest=1 (a differenza del freeze off-ball, che è IA da validare):
             qui non si valida un comportamento ma si POSIZIONA la scena — è il gate stesso che forza pPos con
             __CPM_FORCE_SIT, quindi l'eroe deve trovarsi lì, non a metà di una corsa di avvicinamento. */
          if(_hlSnap){const _shx=G2X(_hxg),_shz=G2Z(_hyg);hero.position.x=_shx;hero.position.z=_shz;hero._hvx=0;hero._hvz=0;hero._px=_shx;hero._pz=_shz;}
          /* [7.399.0 collaudo PO codice 002 «l'eroe non e' gia' posizionato nella posizione giusta, con il
             pallone tra i piedi ad inizio scena»] LO SNAP BEVEVA DAI PROPS STANTII. Lo snap qui sopra legge
             `P.playerX/playerY` nel fotogramma del taglio, ma la posizione logica della scena nuova arriva
             un commit DOPO (pPos la scrive un effetto React) — la stessa trappola del momento sbagliato
             gia' pagata dalla consegna nel 7.383. Risultato misurato su 96 aperture assestate: 17 scene
             offensive con la palla di NESSUNO — la palla sta ESATTAMENTE sul bersaglio logico nuovo e la
             mesh dell'eroe in marcia sulla retta, a 6-22 unita' (gi92 a 22, gi152 a 21, gi96 — il «si muove
             solo il pallone» mai spiegato — a 8 con un avversario a 3,4 dalla palla). Qui, finche' l'intro
             maschera (900 ms dal taglio), se il bersaglio dichiarato si sposta oltre una soglia da
             camminata l'eroe viene RI-piazzato: e' il completamento dello snap, non un secondo driver. */
          else if(P.matchPhase==="hl_intro"&&(now-(sr.current._cutAt||0))<900){const _shx2=G2X(_hxg),_shz2=G2Z(_hyg);
            if(Math.hypot(_shx2-hero.position.x,_shz2-hero.position.z)>2.5){hero.position.x=_shx2;hero.position.z=_shz2;hero._hvx=0;hero._hvz=0;hero._px=_shx2;hero._pz=_shz2;}}
          /* [7.236.0 batch «compare e scompare»] durante il build-up l'EXECUTOR è l'UNICO driver dell'eroe:
             qui il doppio drive (executor→segmento della timeline, questo blocco→bersaglio approach) alternava
             i bersagli frame su frame — con la nuova regola «cut = salto del bersaglio» diventava un teleport
             a raffica, e prima ancora era il tiro alla fune che teneva l'eroe fermo mentre la palla scappava. */
          /* [7.322.0] LA CORSA DEL «VAI» — residuo dichiarato aperto nel 7.321. Li' la palla tornava
             all'eroe ma l'eroe restava fermo: meta' uno-due. Muoverlo dal post-arco avrebbe messo DUE
             driver sullo stesso mesh (il difetto «compare e scompare» del 7.236), quindi si sposta il
             BERSAGLIO di questo unico driver: mentre la sponda e' in volo l'eroe avanza verso la porta,
             e l'avanzamento resta LATCHATO fino al cambio di scena (azzerarlo a fine restituzione lo
             farebbe tornare indietro di corsa — che e' il difetto opposto). Il bersaglio LOGICO nei
             props non viene toccato: la firma golden, che legge quello, e' invariata per costruzione. */
          const _o2p=Math.min(sr.current._o2Push||0,6.5);
          if(_o2p>0&&typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _rr=hero.position.x-(sr.current._o2Rx0!=null?sr.current._o2Rx0:hero.position.x);if(window.__CPM_O2RUN==null||_rr>window.__CPM_O2RUN)window.__CPM_O2RUN=+_rr.toFixed(2);}catch(_e){}}
          const _cap58=(isResult&&!P.hlDef)?AWAY_GOAL_X-4:(_inRead?AWAY_GOAL_X-1:AWAY_GOAL_X-9);/* [7.413.0 gi96/gi172 «duo in retromarcia»] IN LETTURA IL TETTO NON COMBATTE LA POSA DICHIARATA. Il tetto a 9 unita' dalla porta (= x di gioco 87) e' nato per il GIOCO; ma le scene della famiglia 001 dichiarano l'eroe SUL punto-palla a x 93-95: lo snap lo piazzava li' e questo driver, tappato a 87, lo RIPORTAVA INDIETRO camminando (3,5u/s, passo umano) con la palla in mano — il «duo in retromarcia», eroe e palla che derivano insieme all'indietro coi bersagli dichiarati FERMI (tracciato per-fotogramma: mesh 44,4→36,5 con heroTarget inchiodato a 95; convergenza di TUTTA la popolazione su x 87 = il valore del tetto, gi96 gap 8,0 · gi172 6,0 · perfino il controllo gi98 3,1). In lettura il tetto sale a 1 unita' dalla porta (x 95, fuori dalla rete): la posa la decide la scena, il tetto protegge solo dal metterci i piedi in porta. *//* [7.358.0 collaudo PO #104] IL TETTO IN AVANTI SPEGNEVA L'AZIONE IN AREA. Il bersaglio della mesh era tappato a 9 unita' mondo dalla porta = x di gioco 87: su gi104 l'eroe PARTE esattamente a 87, quindi il tetto lo inchiodava — misurato 0,0u di spostamento su 186 fotogrammi, con la palla che arrivava a 26u. Durante l'esito il tetto scende a 4 unita' (x 92, ancora fuori dalla porta e fuori dall'area piccola); fuori dall'esito resta il vecchio. */
          /* [7.384.0 collaudo PO «le esultanze non funzionano»] DUE DRIVER SULLO STESSO CORPO. Questo e'
             il driver ordinario dell'eroe e gira a ogni fotogramma dell'esito; l'esultanza, piu' in basso,
             chiama `animOne` sullo stesso mesh con un bersaglio diverso. I due condividono lo stato di
             velocita' (`_hvx`/`_hvz`) e ognuno integra la propria: e' il difetto del 5.43.13, che il 7.371
             aveva chiuso per i COMPAGNI (la guardia `_celT371===1` nel loop off-ball) e lasciato aperto
             proprio sull'eroe. Misurato col nuovo guardiano: durante `arms_up`, che ha corsa ZERO, l'eroe
             percorreva fino a 27 unita' — non esultava, scivolava via dalla scena. Mentre esulta comanda
             l'esultanza, e basta. */
          const _tkP420=(actType==="tackle"&&sr.current._tkPush420&&sr.current._tkPK420===P.hlSitKey)?sr.current._tkPush420:null;/* [7.420.0] la spinta della scivolata verso il pallone (latch per scena) */
          if(!(tlOn&&tlMap&&tlMap.HERO===hero)&&!(celebT>=0))animOne(hero,Math.min(G2X(_hxg)+_o2p,_cap58)+(_tkP420?_tkP420.x:0),G2Z(_hyg)+(_tkP420?_tkP420.z:0),aDt,ak,bx,bz);
        }/* [7.2.0] premiazione: eroe guidato dal blocco ceremony · [7.127.0] _benched: eroe uscito resta fuori (nascosto), non insegue più il gioco */
        // [6.4.4 R4.1] SOFT-COLLISION di posizione: la repulsione (PASS 2) agisce sui TARGET, ma animOne ha
        //   inerzia → i mesh off-ball possono compenetrarsi transitoriamente (i giocatori si attraversano).
        //   Dopo il movimento, separa le coppie troppo vicine (< _MINSEP world) spingendole SIMMETRICAMENTE:
        //   deterministico, bounded, cheap (~190 coppie). Solo in gioco (non durante il freeze/snap di lettura,
        //   che pone i giocatori di proposito). Gate-safe (posizioni off-ball fuori dalla firma golden).
        if(!_readFreeze&&!_doSnap&&!P.ceremony&&!P.shootout){const _MINSEP=1.7;
          const _skipSep=(m)=>!m||m.gk||m.mesh===passTargetMesh||(m.mesh._rcvT!=null&&m.mesh._rcvT>=0)||(m.mesh._failRunT!=null&&m.mesh._failRunT>=0)||m.mesh._carry526!=null||(sr.current._pkCol415&&m.mesh===sr.current._pkCol415.m);/* [7.618.0] idem per la separazione *//* [7.523.0] il portatore non si sballotta *//* [6.45.0 RC] non spingere chi riceve (_rcvT) o corre a vuoto (_failRunT): animOne li congela di proposito → venivano sballottati a metà ricezione */
          for(let i=0;i<_players.length;i++){const pi=_players[i];if(!pi||!pi.mesh||_skipSep(pi))continue;
            for(let j=i+1;j<_players.length;j++){const pj=_players[j];if(!pj||!pj.mesh||_skipSep(pj))continue;
              const dx=pi.mesh.position.x-pj.mesh.position.x,dz=pi.mesh.position.z-pj.mesh.position.z,d=Math.hypot(dx,dz);
              if(d<_MINSEP&&d>0.001){const push=(_MINSEP-d)*0.25,ux=dx/d,uz=dz/d;
                pi.mesh.position.x+=ux*push;pi.mesh.position.z+=uz*push;pj.mesh.position.x-=ux*push;pj.mesh.position.z-=uz*push;}}}}
        /* [7.383.0 collaudo PO — nove segnalazioni: #163 #114 #12 #11 #103 #4 #63 #27 #180
           «la scena deve iniziare con il pallone nei piedi del compagno»] LA CONSEGNA LA SCEGLIE CHI VEDE.
           Fino a qui l'origine della consegna la calcolava React, dentro l'effetto che apre l'highlight,
           leggendo le posizioni delle mesh attraverso il ponte `meshDef`. Il guaio non era la formula: era
           il MOMENTO. Quell'effetto gira al commit dell'apertura di scena, e in quell'istante le mesh sono
           ancora quelle della scena PRECEDENTE — lo snap che le ripiazza avviene qui, nel loop di render,
           qualche fotogramma dopo. Misurato: la mesh «eroe» di una scena coincide esattamente con l'eroe
           logico di quella prima, con scarti fino a 56u. Cosi' la consegna nasceva sui piedi di un uomo
           che si trovava li' un attimo prima, cioe' quasi sempre nel vuoto: mediana 11.1u dal compagno
           piu' vicino, 29 consegne su 42 a piu' di 6u da CHIUNQUE, mediana 27.9u dall'eroe che deve
           riceverla.
           Quattro tentativi di correzione sono falliti tutti allo stesso modo — differire, attendere una
           soglia, aspettare che il renderer dichiarasse la scena montata — perche' tutti facevano ASPETTARE
           React: e quell'effetto dipende da `pPos`, cambia di continuo, e ogni ri-esecuzione annullava la
           propria attesa prima che si completasse. La risposta non era attendere meglio, era smettere di
           attendere: qui il renderer ha appena piazzato tutti e ventidue, sa dove sono per costruzione, e
           SPINGE l'origine a React. Una volta per scena, senza nessuno che aspetti nessuno. */
        if(_hlSnap&&P.hlSitKey!=null&&P.hlSitKey>=0)sr.current._dlvArm383=P.hlSitKey;/* [7.383.0] lo snap ARMA la consegna, non la esegue: l'effetto React che lascia il descrittore puo' arrivare un fotogramma dopo il primo giro del loop, e legare il tentativo a un solo frame vuol dire perdere il turno e non riprovare mai — misurato, era esattamente cio' che succedeva sulla meta' delle scene. Finche' non riesce, si ritenta. */
        if(sr.current._dlvArm383===P.hlSitKey&&sr.current._dlvKey383!==P.hlSitKey){try{
          const _dv383=P.deliver&&P.deliver.current;
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){const _c=(window.__CPM_DLV383=window.__CPM_DLV383||{});_c.arm=(_c.arm||0)+1;if(!_dv383)_c.nodesc=(_c.nodesc||0)+1;else if(_dv383.key!==P.hlSitKey)_c.badkey=(_c.badkey||0)+1;if(!_asIfPlay)_c.noplay=(_c.noplay||0)+1;}
          if(_asIfPlay&&_dv383&&P.hlSitKey!=null&&P.hlSitKey>=0&&_dv383.key===P.hlSitKey&&sr.current._dlvKey383!==P.hlSitKey){
            const _g383=(m)=>({x:m.position.x+50,y:m.position.z/0.68+50});
            let _pt383=null;
            if(_dv383.kind==="gk"){
              for(let _i=0;_i<_players.length;_i++){const _sq=(P.allPlayers||[])[_i];
                if(_sq&&_sq.team==='home'&&_sq.gk&&_players[_i].mesh){_pt383=_g383(_players[_i].mesh);break;}}
            } else {
              const _hg383=_g383(hero),_aer383=(_dv383.kind==="aerial");
              let _best383=null,_sc383=1e9;
              for(let _i=0;_i<_players.length;_i++){const _sq=(P.allPlayers||[])[_i];const _mm=_players[_i]&&_players[_i].mesh;
                if(!_sq||!_mm||_sq.team!=='home'||_sq.gk||_mm===hero)continue;
                const _p383=_g383(_mm),_dx383=_p383.x-_hg383.x,_d383=Math.hypot(_dx383,_p383.y-_hg383.y);
                if(_d383<4||_d383>34)continue;/* addosso all'eroe non e' una consegna; mezzo campo neppure */
                if(_dx383>2)continue;/* chi consegna sta dietro o al piu' in linea, non davanti */
                const _q383=_aer383?(-Math.abs(_p383.y-50)+((_p383.y-50)*(_hg383.y-50)>0?-8:0)+Math.abs(_d383-18)*0.5)
                                   :(Math.abs(_d383-12));
                if(_q383<_sc383){_sc383=_q383;_best383=_p383;}}
              if(!_best383){/* seconda chance: un uomo in posizione imperfetta e' pur sempre un uomo */
                let _s2383=1e9;
                for(let _i=0;_i<_players.length;_i++){const _sq=(P.allPlayers||[])[_i];const _mm=_players[_i]&&_players[_i].mesh;
                  if(!_sq||!_mm||_sq.team!=='home'||_sq.gk||_mm===hero)continue;
                  const _p383=_g383(_mm),_d383=Math.hypot(_p383.x-_hg383.x,_p383.y-_hg383.y);
                  if(_d383<3||_d383>45)continue;
                  const _q2383=Math.abs(_d383-12);if(_q2383<_s2383){_s2383=_q2383;_best383=_p383;}}}
              _pt383=_best383;
            }
            if(_pt383){sr.current._dlvKey383=P.hlSitKey;_dv383.put(_pt383);
              /* [7.383.0] LA SCENA SI APRE GIA' LI'. Spingere l'origine a React non bastava: il pallone
                 non ci si TELEPORTA, ci striscia dentro col moto a velocita' limitata partendo da dove
                 l'aveva lasciato la scena precedente. Misurato su gi163: origine spinta (55.4, 46.7),
                 pallone a (67, 31) all'apertura e ancora a (63.3, 41.7) settecento millisecondi dopo —
                 la consegna era giusta e il giocatore vedeva comunque un pallone che arriva da fuori.
                 Uno STACCO DI SCENA non e' un movimento: qui il pallone viene messo dove deve stare, nello
                 stesso fotogramma in cui i ventidue ci vengono messi. Da qui in poi comanda di nuovo il
                 moto normale, che ha gia' il bersaglio giusto. */
              /* [7.568.0 collaudo PO sul 7.567: «SALTO del pallone di 23,9 unita' in 41 ms (a 19,9s
                 dall'inizio scena, scrittore: consegna) — 582 u/s, sembra un teletrasporto»]
                 UNO STACCO DI SCENA E' UNO STACCO SOLO AL TAGLIO. La regola giusta era gia' scritta nel
                 commento qui sopra dal 7.383 — «uno stacco di scena non e' un movimento» — ma il codice
                 non verificava MAI di trovarsi davvero a uno stacco: bastava che la consegna fosse armata
                 e che il descrittore arrivasse, e il pallone veniva riassegnato di colpo QUANDO CHE FOSSE.
                 Il collaudo del PO l'ha inchiodata a venti secondi dall'apertura, cioe' in piena azione e
                 sotto gli occhi: li' non e' una regia, e' un teletrasporto. E il colpevole ha un nome
                 perche' dal 7.556-7.557 ogni scrittore del pallone ce l'ha: senza quell'anagrafe questa
                 riga sarebbe ancora una fra sessanta sospette.
                 Ora il teletrasporto vale solo dentro la finestra dello stacco (`_cutAt`, il timbro del
                 taglio); dopo, la consegna fa comunque il suo lavoro — spinge l'origine a React, che e' la
                 riga sopra — e il pallone ci ARRIVA col moto normale, che ha gia' il bersaglio giusto.
                 __CPM_NO568 = rosso: il teletrasporto senza orario, com'era. */
              const _dtCut568=now-(sr.current._cutAt||0);
              const _tagl568=(_dtCut568<900)||(typeof window!=='undefined'&&window.__CPM_NO568);
              if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST)){try{const _c=(window.__CPM_DLV383=window.__CPM_DLV383||{});_c.tot=(_c.tot||0)+1;if(!_tagl568){_c.tardi=(_c.tardi||0)+1;(_c.dt=_c.dt||[]).push(Math.round(_dtCut568));}}catch(_e){}}
              if(_tagl568)try{ball.position.x=G2X(_pt383.x);ball.position.z=G2Z(_pt383.y);ball.position.y=0.65;sr.current._lastBallKey=P.hlSitKey;sr.current._ballSnap=false;if((sr.current._ws524=10)&&sr.current._bj0)(sr.current._bj0.src='consegna',sr.current._bj0.srcs.push('consegna'));}catch(_e2){}if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){const _c=(window.__CPM_DLV383=window.__CPM_DLV383||{});_c.push=(_c.push||0)+1;_c.last={x:+_pt383.x.toFixed(1),y:+_pt383.y.toFixed(1),key:P.hlSitKey,kind:_dv383.kind};}}
            else if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){const _c=(window.__CPM_DLV383=window.__CPM_DLV383||{});_c.nopt=(_c.nopt||0)+1;}
          }
        }catch(_e383){}}
        if(_hlSnap)_hlSnap=false;// snap eseguito (una volta all'avvio dell'highlight)
        /* [7.194.0 S1] lo snap di scena si arma anche al CAMBIO DI SITUATION, non solo entrando in hl_intro:
           il force-sit del gate (e le catene) entrano direttamente in hl_choose saltando l'intro, e senza questo
           l'eroe restava a metà della corsa di avvicinamento alla posizione appena forzata. */
        if(P.hlSitKey!=null&&P.hlSitKey>=0&&sr.current._lastSitKey!==P.hlSitKey){sr.current._lastSitKey=P.hlSitKey;_hlSnap=true;sr.current._cutSrc456="chiave";
          /* [7.384.0 collaudo PO «le esultanze non funzionano»] UNO STACCO DI SCENA CHIUDE L'ESULTANZA.
             Il cronometro dell'esultanza non guardava il cambio di scena: se una nuova azione si apriva
             mentre l'eroe festeggiava, lo snap lo TELEPORTAVA in posizione a esultanza in corso. Misurato
             col nuovo guardiano, ed e' la firma piu' chiara che si potesse avere: lo spostamento totale
             durante l'esultanza coincideva ESATTAMENTE col passo massimo di un singolo fotogramma —
             4,55u, 14,86u, 27,66u. Non era una corsa, era uno strappo. Un'esultanza appartiene al gol che
             l'ha causata: quando comincia un'altra scena, e' finita. */
          /* ⚠️ [7.392.0] MA NON SE E' APPENA NATA. Premendo «CONTINUA» subito dopo un gol, la scena cambia
             nello STESSO fotogramma in cui il piano d'esultanza arriva: questa guardia — scritta nel 7.384
             per non trascinare un'esultanza dentro l'azione successiva — la uccideva prima che facesse un
             solo fotogramma, e per giunta ne CONSUMAVA la chiave, cosi' non poteva piu' riarmarsi.
             Misurato col guardiano sulla strada vera (`--continua`): tre esultanze su quattro con ZERO
             fotogrammi. Il piano c'era, il cronometro non partiva mai. E' la spiegazione della frase del
             PO «l'unica esultanza che vedo e' quella su rigore»: il rigore non passa da «CONTINUA».
             Un quarto di secondo di franchigia distingue «esultanza di un'altra scena» da «esultanza
             appena nata», che e' esattamente la differenza che conta. */
          if(celebT>=0&&((typeof window!=='undefined'&&window.__CPM_NO392)||(now-(sr.current._celAt392||0))>250)){celebT=-1;hero.position.y=0;sr.current._celLift371=0;sr.current._celPlan393=null;sr.current._celKey84=(P.celebPlan&&P.celebPlan.key)||sr.current._celKey84;/* si CONSUMA la chiave invece di azzerarla: azzerandola il fotogramma dopo l'esultanza si sarebbe riarmata da sola */
            try{sr.current.players.forEach(pp=>{if(pp.mesh)pp.mesh._celT371=0;});}catch(_e84){}}sr.current._cutAt=performance.now();}
        /* uno snap di scena è uno STACCO, quindi anche la CAMERA taglia invece di inseguire: senza questo i 22
           erano già in posizione mentre l'inquadratura arrivava un quarto di secondo dopo, e il protagonista
           restava fuori dai bordi per tutta la fase di lettura (37 situation su 191 nel gate). */
        /* [7.456.0 codice 007] OGNI TAGLIO SI DICHIARA. Qui passa ogni stacco di scena: chiave, fase,
           ri-armo. Lo stacco nero che lo maschera dura 360-560 ms (setCutFx) — un taglio armato DOPO
           quella finestra il giocatore lo VEDE, ed e' il «traballa tutto» del collaudo. */
        if(_hlSnap&&typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){const _ct456=(window.__CPM_CUT456=window.__CPM_CUT456||[]);
          if(_ct456.length<80)_ct456.push({k:P.hlSitKey,ph:_curPh,dt:Math.round(now-(sr.current._cutAt||0)),src:sr.current._cutSrc456||"?"});sr.current._cutSrc456=null;}
        if(_hlSnap){sr.current._sceneCut=true;if(sr.current._lastBallKey!==P.hlSitKey)sr.current._ballSnap=true;sr.current._cutZoomSnap=true;/* [7.218.0] lo stacco di scena vale anche per IL PALLONE — vedi il blocco palla · [7.228.0 #48] e per lo ZOOM: il taglio deve atterrare sull'inquadratura NUOVA, non sul blend ancora largo (vedi camera) · [7.229.0 #47] il RI-ARMO è condizionato: il blocco palla (che gira PRIMA nel frame, r.10159) ha il suo memo di chiave e ha già armato+consumato lo snap per questa scena — ri-armarlo QUI, che sta DOPO il lancio dell'arco, faceva uccidere al frame successivo l'arco appena nato quando force e resolve arrivavano nello stesso commit (misurato sul 1v1: arco vivo 1 frame, at=-0.24, palla congelata per sempre) */
          /* [7.212.0] uno stacco di scena azzera anche le REAZIONI in corso: un tuffo/riflesso del portiere
             lasciato a metà continuava a muovere il mesh nella scena successiva (e la posa restava storta). */
          if(oppActType&&oppMesh){try{oppMesh.position.y=0;oppMesh.rotation.z=0;if(oppMesh._aL){oppMesh._aL.rotation.x=0;oppMesh._aL.rotation.z=0;}if(oppMesh._aR){oppMesh._aR.rotation.x=0;oppMesh._aR.rotation.z=0;}if(oppMesh._lR)oppMesh._lR.rotation.x=0;if(oppMesh._lL)oppMesh._lL.rotation.x=0;if(oppMesh._diveYaw!=null)oppMesh.rotation.y=oppMesh._diveYaw;oppMesh._diveToZ=null;}catch(_e){}}
          oppActType=null;oppMesh=null;oppActT=0;gkSaveCelebT=-1;gkSaveMesh=null;sr.current._mateFx=null;sr.current._tlHeroEnd=null;/* [7.236.0] l'ancora di fine build-up muore con la scena */}/* bandiera DEDICATA: _cutSnap la azzera il blocco stacco-d'esito a ogni frame non-isResult */
        // 5.43.16: PORTIERI — posizione di PRONTO con POSA FISSA (no run-cycle). animOne sposta dolcemente (target stabile),
        //   poi SOVRASCRIVO le gambe/braccia in posa di pronto (gambe divaricate, leggera flessione, braccia pronte) → il portiere
        //   NON fa più la "corsa sul posto" (il run-cycle delle gambe è annullato). Il tuffo (gk_dive) lo controlla quando attivo.
        for(let i=0;i<_players.length&&!P.ceremony&&!P.shootout;i++){const t=_tg[i],pp=_players[i];if(!t||!pp||!t.gk)continue;if(oppActType&&pp.mesh===oppMesh)continue;/* [7.2.0] portieri fermi ai pali durante la premiazione */
          const gm=pp.mesh;const _gx=G2X(clamp(t.x,2,98)),_gz=G2Z(clamp(t.y,2,98));
          // 5.49.10: il PORTIERE è freezato come gli altri all'avvio dell'highlight — SNAP in posizione poi FERMO durante la fase di lettura,
          //   in attesa dei 2 eventi (conclusione movimenti eroe + scelta). La posa di pronto resta applicata. Sotto cpmtest il freeze è off (gate).
          if(_doSnap){gm.position.x=_gx;gm.position.z=_gz;gm._ctx=_gx;gm._ctz=_gz;gm._vx=0;gm._vz=0;gm._px=_gx;gm._pz=_gz;}
          else if(!_readFreeze){animOne(gm,_gx,_gz,aDt,ak,bx,bz);}
          gm._runB=0;// azzera il blend di corsa → niente pompaggio gambe
          if(gm._lL){gm._lL.rotation.x=0.18;gm._lL.rotation.z=-0.14;}if(gm._lR){gm._lR.rotation.x=0.18;gm._lR.rotation.z=0.14;}// gambe divaricate, leggera flessione (pronto)
          if(gm._aL){gm._aL.rotation.x=0.55;gm._aL.rotation.z=-0.45;}if(gm._aR){gm._aR.rotation.x=0.55;gm._aR.rotation.z=0.45;}// braccia avanti/aperte (pronto a parare)
          gm.position.y=0;}
        // CINE-TL Fase 2: EXECUTOR — durante il build-up, palla e attori seguono fedelmente la timeline.
        //   Guardato da dt>0 (frame congelati del gate intatti) + isResult. A build-up finito → fireConclusion().
        if(tlOn&&dt>0&&isResult&&tlSeg){
          tlT+=aDt;
          /* [7.222.0 revisione PO «la palla sbatte a terra e poi sale» · «cade a terra e poi tenta il colpo di
             testa»] La quota di contatto aerea (7.214/7.220) valeva fuori dal build-up, ma la COSTRUZIONE
             dell azione — che gira prima della conclusione — muoveva il pallone con la propria parabola da terra
             e lo depositava a 0.65 un istante prima del colpo. Su rovesciata, stacco e volee si vedeva quindi:
             palla in aria → a terra → e solo dopo l arco. Qui la costruzione rispetta lo stato-palla. */
          const _aerTL=aerialContactY(P,true,false);
          let acc=0,bi=0; for(;bi<tlBuildN;bi++){if(tlT<acc+tlSeg[bi].dur)break;acc+=tlSeg[bi].dur;}
          if(bi>=tlBuildN){const last=tlSeg[tlBuildN-1];
            if(_aerTL!=null){
              /* [7.237.0 #52 misurato su gi6: palla CONGELATA a mezz'aria ~520ms (mv 0.00) tra fine consegna
                 e lancio dell'arco d'incornata — la finestra del wind-up del gesto] UN CROSS NON ASPETTA:
                 l'ultimo tratto della parabola si consuma DURANTE il wind-up. La palla viene consegnata
                 ~3u PRIMA del punto di contatto (e ~1u più alta) e plana verso di esso con avvicinamento
                 esponenziale (blocco _aerIn52 sotto) — in moto fino all'impatto, mai sospesa. */
              const _lfx52=G2X(last.from[0]),_lfz52=G2Z(last.from[1]),_ltz52=G2Z(last.to[1]);
              /* [7.533.0 MP-0e — indagine 003, ipotesi H2] LA COSTRUZIONE NON ENTRA IN PORTA: i beat del
                 build-up depositano da coordinate DICHIARATE (to.x fino a 98,6 game = oltre la linea in
                 mondo) e il guardiano geometrico qui non arriva (isResult con arco/post-arco vivi). Lo
                 stesso clamp specchio degli archi (7.477: le traiettorie si LIMITANO, i canali-rete non si
                 toccano) vale per i tre scrittori 11/12/13: un through in costruzione muore SULLA linea,
                 mai dentro lo specchio — l'ingresso in rete resta monopolio dei canali certificati.
                 Rosso __CPM_NO546. */
              const _ltx52=(typeof window!=='undefined'&&window.__CPM_NO546)?G2X(last.to[0]):clamp(G2X(last.to[0]),-(GOAL_LINE_X-0.8),GOAL_LINE_X-0.8);
              const _ddx52=_ltx52-_lfx52,_ddz52=_ltz52-_lfz52,_dl52=Math.hypot(_ddx52,_ddz52)||1;
              ball.position.x=_ltx52-_ddx52/_dl52*3.0;ball.position.z=_ltz52-_ddz52/_dl52*3.0;ball.position.y=_aerTL+1.0;if((sr.current._ws524=11)&&sr.current._bj0)(sr.current._bj0.src='buildup-aereo',sr.current._bj0.srcs.push('buildup-aereo'));
              sr.current._aerIn52={x:_ltx52,z:_ltz52,y:_aerTL};
            } else if(last&&last.kind==='carry'&&(function(){const _cid414=(typeof last.fromId==='string')?last.fromId:((typeof last.toId==='string')?last.toId:null);const _cm414=(_cid414==='HERO')?hero:((tlMap&&_cid414&&tlMap[_cid414])||hero);return _cm414&&_cm414.position&&Math.hypot(ball.position.x-_cm414.position.x,ball.position.z-_cm414.position.z)<3.4;})()){ball.position.y=0.65;/* [7.414.0 gi24/gi79 «zig-zag» / «teletrasporto da 16,5u»] LA GUARDIA VALE PER QUALUNQUE PORTATORE, NON SOLO L'EROE: se l'ultimo beat e' la conduzione di un COMPAGNO tappato a velocita' umana, il corpo arriva corto sul piano (misurato: portatore a 4,5 col piano a 38 — 26u dall'eroe) e la scrittura del punto pianificato era un teletrasporto da 7,8-13,8u proprio al fotogramma della conclusione. Il portatore lo dice il beat (fromId→tlMap), l'eroe resta il ripiego. */
              /* [7.394.0 collaudo PO «SALTO del pallone — sembra un teletrasporto», la sorgente RESIDUA
                 dopo il 7.387] LA CONSEGNA A FINE COSTRUZIONE NON STRAPPA LA PALLA DAL PIEDE. Qui il
                 build-up finisce e il pallone veniva SCRITTO al punto pianificato dell'ultimo beat — ma
                 se quel beat era una CONDUZIONE, il pallone sta incollato al piede del portatore, che
                 insegue il piano con l'inerzia di un corpo vero e arriva in ritardo di qualche unita'.
                 Risultato: la palla lasciava il piede con uno strappo secco proprio sul fotogramma della
                 conclusione. MISURATO col fotogramma di bordo appena aggiunto al guardiano (il filtro
                 «entrambi i fotogrammi nel build-up» lo scartava da sempre): 12 costruzioni su 26 con un
                 salto di 3,1-4,6u al passaggio carry→CONSEGNA. Se il pallone e' gia' al piede di chi
                 conclude, la consegna E' GIA' AVVENUTA: si lascia dov'e', e l'arco del tiro parte da li'
                 — come nel calcio. Il punto pianificato resta il ripiego per quando il pallone e' lontano
                 (build-up interrotto, portatore perso): meglio la scrittura di ieri che una palla orfana. */}
            else {ball.position.x=(typeof window!=='undefined'&&window.__CPM_NO546)?G2X(last.to[0]):clamp(G2X(last.to[0]),-(GOAL_LINE_X-0.8),GOAL_LINE_X-0.8);/* [7.533.0 MP-0e H2] clamp specchio dello scrittore 12 (nota al sito 11) */ball.position.z=G2Z(last.to[1]);ball.position.y=0.65;if((sr.current._ws524=12)&&sr.current._bj0)(sr.current._bj0.src='buildup-fine',sr.current._bj0.srcs.push('buildup-fine'));}/* [7.222.0] su una situazione AEREA il build-up CONSEGNA il pallone alla quota del colpo: depositarlo a 0.65 era la causa del «la palla sbatte a terra e poi sale» */
            /* [7.236.0 batch «compare e scompare»] il build-up ha PORTATO AVANTI l'eroe (fin sotto porta sul
               burst): memorizzare il punto d'arrivo — la CINE-APPROACH della conclusione deve ancorarsi QUI,
               non a P.playerX (lo spot d'apertura, 12-16u più indietro), o l'eroe si teleporta all'indietro
               un frame prima del tiro. Chiave di scena → mai riusato su un highlight diverso. */
            {const _ha51=last&&last.after&&last.after.HERO;if(_ha51)sr.current._tlHeroEnd={x:_ha51[0],y:_ha51[1],k:P.hlSitKey};}
            sr.current._tlK381=null;sr.current._tlC381=null;sr.current._tlCP382=null;sr.current._tlBi387=null;sr.current._tlFrom387=null;tlOn=false;if(fireConclusion)fireConclusion();}
          else{
            const sg=tlSeg[bi],p=clamp((tlT-acc)/Math.max(sg.dur,0.01),0,1);
            /* [7.387.0 collaudo PO «SALTO del pallone — sembra un teletrasporto», quattro segnalazioni]
               IL PALLONE NON SI TELEPORTA AL CAMBIO DI BEAT. Ogni beat porta il pallone da `from` a `to`
               interpolando su `p`, e quando comincia il beat successivo `p` riparte da zero: il pallone
               salta ISTANTANEAMENTE al `from` del nuovo beat. Se i due punti non coincidono — e non
               coincidono, perche' fra un beat e l'altro il pallone puo' essere stato spostato dal tocco di
               conduzione o dalla consegna — quello e' uno scatto in un fotogramma. Misurato col nuovo
               guardiano buildup-sync-test.mjs: 19,3 unita' in 26 millisecondi (742 u/s) al passaggio
               carry→cross su gi103, 5,1u su through→carry, 4,3u su carry→dribble.
               Ora il beat che comincia parte da DOVE IL PALLONE E' DAVVERO: la meta non cambia, cambia
               solo che il tragitto e' continuo. */
            if(sr.current._tlBi387!==bi){sr.current._tlBi387=bi;
              try{sr.current._tlFrom387=[ball.position.x/1+50,ball.position.z/0.68+50];}catch(_e87){sr.current._tlFrom387=null;}}
            /* ⚠️ [7.395.0] LA CONTINUITA' VALE ANCHE PER IL PRIMO BEAT — e la storia di questa riga va
               raccontata intera, perche' e' cambiata due volte sulla base di misure.
               Il 7.387 l'aveva NEGATA al primo beat con due argomenti: (a) il riposizionamento d'apertura
               e' un setup coperto dalla finestra di grazia del rilevatore automatico; (b) applicandola, la
               costruzione «spariva» (10,2u percorse → 1,4). Entrambi sono caduti. (a) e' FALSO in partita
               vera: la grazia decorre dall'apertura della SCENA, e il build-up parte secondi dopo, a scena
               in pieno svolgimento — le note del PO («SALTO di 8,7u», quattro segnalazioni sulla stessa
               costante) erano esattamente questo teletrasporto, misurato con l'attribuzione per stato:
               ogni salto >5u delle scene segnalate sta sulla transizione d'INGRESSO del build-up, 8,1-12,6u
               all'indietro verso il `from` pianificato del primo beat. (b) valeva solo nella modalita' di
               collaudo SENZA la consegna dell'intro, dove la palla giace gia' sul punto d'arrivo del piano:
               li' il primo beat collassa perche' NON C'E' niente da giocare — ed e' il caso che oggi viene
               SALTATO esplicitamente dal salto-beat qui sopra. In partita vera la palla sta dove la
               consegna l'ha portata, il piano sta altrove, e la continuita' trasforma il teletrasporto in
               un passaggio visibile da li' a dove il beat deve arrivare. */
            const _f0387=(sr.current._tlFrom387&&Math.hypot(sr.current._tlFrom387[0]-sg.from[0],(sr.current._tlFrom387[1]-sg.from[1])*0.68)>0.6)?sr.current._tlFrom387:sg.from;
            sr.current._tlK381=sg.kind||null;
            sr.current._tlHD387=!!(tlMap&&tlMap.HERO&&sg.before&&sg.before.HERO);/* [7.387.0] questo beat GUIDA l'eroe? Il driver ordinario si fa da parte appena la timeline ha una voce HERO, ma la timeline la usa solo nei beat che lo elencano: se nessun beat lo elenca, nessuno lo muove. */
            /* [7.382.0] IL PORTATORE DICHIARATO VALE SOLO NEL FRAME IN CUI LA CONDUZIONE ACCADE DAVVERO.
               Prima si azzerava solo cambiando tipo di beat — ma la conduzione salta anche DENTRO un beat
               `carry`, sull'ultimo passo verso una conclusione aerea (li' il pallone e' un cross che sta
               arrivando e non deve scendere ai piedi). In quei frame il portatore restava scritto da un beat
               precedente e il guardiano misurava il pallone contro un corpo che non lo stava conducendo:
               gi103, 14 frame su 14 «col pallone dietro», tutti falsi. Azzerato a ogni frame e riscritto solo
               dove la palla viene davvero appoggiata al piede. */
            sr.current._tlC381=null;/* [7.382.0] la direzione di conduzione appartiene al beat che finisce: senza questo azzeramento, il beat successivo (o la scena successiva) ripartirebbe dalla media mobile di una corsa che non esiste piu' *//* [7.381.0] il TIPO del beat in corso: senza, un guardiano della conduzione non sa distinguere «il pallone corre da solo perche' e' un passaggio» da «il pallone corre da solo perche' il portatore l'ha perso» — e li giudica uguali */
            let _bxg=_f0387[0]+(sg.to[0]-_f0387[0])*p,_byg=_f0387[1]+(sg.to[1]-_f0387[1])*p;
            /* [7.395.0 collaudo PO «SALTO del pallone», ultima sorgente nota: gi97, 4,5u a through→carry]
               IL PASSAGGIO ATTERRA SUL PIEDE VERO, NON SUL PUNTO PIANIFICATO. Un beat di passaggio vola
               verso `sg.to`, che e' il piano; ma chi ricevera' e' un corpo con inerzia, e al momento del
               cambio di beat puo' stare qualche unita' piu' in la'. Il beat di conduzione successivo
               incolla il pallone al SUO piede in un fotogramma: strappo secco, misurato 4,5-5,2u.
               E' il gemello del difetto chiuso nel 7.394 (la palla che LASCIA il piede): qui ci ARRIVA.
               La cura e' la stessa dei passaggi veri di questo motore (il rendez-vous del 7.369): durante
               il volo il bersaglio SCIVOLA dal piano al piede vero del prossimo portatore — quadratico su
               p, cosi' la prima meta' del volo segue il disegno e l'arrivo aggancia l'uomo. Alla cucitura
               il pallone e' gia' dov'e' lui, e la colla della conduzione non ha piu' niente da strappare.
               ⚠️ NON e' l'easing revocato nel 7.387: quello inseguiva il piede DENTRO il beat di conduzione,
               rompendo il riferimento da cui il beat dopo riparte; qui si corregge il bersaglio del beat di
               VOLO, e la conduzione riceve un pallone gia' consegnato. */
            {const _nx395=tlSeg[bi+1];
             if(_nx395&&_nx395.kind==='carry'&&(sg.kind==='pass'||sg.kind==='through'||sg.kind==='give'||sg.kind==='cross')){
               const _nid395=(typeof _nx395.toId==='string')?_nx395.toId:((typeof _nx395.fromId==='string')?_nx395.fromId:null);
               /* [7.414.0 gi24/gi79 «zig-zag avanti/indietro»] IL THROUGH SI RICEVE DAVANTI, NON ALLE SPALLE.
                  mapCineActors assegna MATE1 al compagno piu' vicino all'EROE — giusto per sponde e scambi
                  corti, sbagliato per un through in profondita': il rendez-vous 7.395 risucchiava il volo
                  all'INDIETRO sul compagno dietro la traiettoria (misurato: volo verso il piano a 88 con
                  ricevente reale a 54 — inversione secca a meta' volo). Per il beat `through` il ricevente
                  si RIMAPPA una volta sul compagno di movimento piu' vicino al punto di caduta del piano:
                  i beat successivi (controllo, conclusione) leggono la stessa mappa e restano su di lui. */
               if(sg.kind==='through'&&_nid395&&_nid395!=='HERO'&&tlMap&&sr.current._thrMap414!==P.hlSitKey+':'+bi){
                 let _bm414=null,_bd414=1e9;const _ttx=G2X(sg.to[0]),_ttz=G2Z(sg.to[1]);
                 sr.current.players.forEach((pp,ii)=>{const _s4=(P.allPlayers||[])[ii];if(_s4&&_s4.team==='home'&&!_s4.gk&&pp.mesh&&pp.mesh!==hero){const _d4=Math.hypot(pp.mesh.position.x-_ttx,pp.mesh.position.z-_ttz);if(_d4<_bd414){_bd414=_d4;_bm414=pp.mesh;}}});
                 if(_bm414)tlMap[_nid395]=_bm414;
                 sr.current._thrMap414=P.hlSitKey+':'+bi;sr.current._rm613=1;/* [7.613.0 strumentazione] questo frame ha rimappato il ricevente */}
               const _nm395=(_nid395==='HERO')?hero:((tlMap&&_nid395)?tlMap[_nid395]:null);
               if(_nm395){const _ngx395=_nm395.position.x+50,_ngy395=_nm395.position.z/0.68+50,_w395=(typeof window!=='undefined'&&window.__CPM_NO613B)?(p*p):((p<0.5)?(2*p*p):(1-2*(1-p)*(1-p)));/* [7.613.0] il rendez-vous ARRIVA: con p^2 il peso a fine volo (p 0,92 all'ultimo frame utile) vale 0,85 e il 15% di strada verso il piede si saltava in UN frame all'ingresso della conduzione — misurato 3,8-3,9u (i SEAM residui dell'anello). Easing simmetrico che vale 1 a p=1 (a 0,92: 0,988): stessa prima meta' del volo, arrivo consegnato. Rosso __CPM_NO613B. */
                 _bxg=_bxg*(1-_w395)+_ngx395*_w395;_byg=_byg*(1-_w395)+_ngy395*_w395;}}}
            /* [7.613.0 — LA CONDUZIONE E' DEL CORPO, NON DEL PIANO. Rosso __CPM_NO613]
               COLLAUDO PO, SIT #10 «SALTO del pallone di 8,1u in 32 ms (buildup-volo)» + SIT #102
               «nel dribbling il pallone e l'eroe si separano: gap >4u per 2,8 s (max 6,2u)» — stessa causa,
               MISURATA con l'anello __CPM_BV613 e l'attribuzione a due meta' (chi ha mosso il pallone fra
               due scritture del volo): nei beat di CONDUZIONE due autorita' scrivono ogni frame — la colla
               mette il pallone al piede del portatore (corpo tappato a ~11 u/s, 7.236) e QUESTO lerp lo
               riscrive sul punto del piano (che avanza anche a 25 u/s): tiro alla fune da 8-17u per frame
               (gi28 beat carry: altrui 14u / volo 17,4u; gi38: 8,1/12,2). L'ultimo a scrivere e' il piano,
               quindi il pallone corre avanti da solo e il corpo insegue — il gap del PO. OTTAVA istanza
               del pattern «piu' autorita' sulla stessa grandezza». Qui la conduzione segue il CORPO:
               il pallone sta al piede del portatore del beat (fromId/toId -> tlMap, eroe come ripiego,
               stessa anagrafe della guardia 7.414); il piano resta la rotta del portatore, non del pallone
               — e' la lezione del 7.540: il passaggio e' un evento, la conduzione e' un percorso. */
            if((sg.kind==='carry'||sg.kind==='dribble')&&!(typeof window!=='undefined'&&window.__CPM_NO613)){
              const _cid613=(typeof sg.fromId==='string')?sg.fromId:((typeof sg.toId==='string')?sg.toId:null);
              const _cm613=(_cid613==='HERO')?hero:((tlMap&&_cid613&&tlMap[_cid613])||hero);
              if(_cm613&&_cm613.position){_bxg=_cm613.position.x+50;_byg=_cm613.position.z/0.68+50;}
            }
            const _pre613=(typeof window!=='undefined'&&window.__CPM_BV613!==undefined)?{x:+(ball.position.x+50).toFixed(2),y:+(ball.position.z/0.68+50).toFixed(2)}:null;/* [7.613.0] dov'era il pallone PRIMA di questa scrittura: se fra il frame scorso e questo l'ha mosso un ALTRO scrittore, il salto e' suo, non del volo */
            ball.position.x=(typeof window!=='undefined'&&window.__CPM_NO546)?G2X(_bxg):clamp(G2X(_bxg),-(GOAL_LINE_X-0.8),GOAL_LINE_X-0.8);/* [7.533.0 MP-0e H2] clamp specchio dello scrittore 13 (nota al sito 11): il volo dichiarato puo' puntare 98,6 game, la palla muore SULLA linea */ball.position.z=G2Z(_byg);if((sr.current._ws524=13)&&sr.current._bj0)(sr.current._bj0.src='buildup-volo',sr.current._bj0.srcs.push('buildup-volo'));
            /* [7.613.0 strumentazione, solo collaudo] IL VOLO DI COSTRUZIONE SI RACCONTA FRAME PER FRAME.
               COLLAUDO PO (SIT #10, dal DISPOSITIVO a 60 fps, quindi non un singhiozzo del laboratorio):
               «SALTO del pallone di 8,1 unita' in 32 ms, scrittore buildup-volo». Un lerp non salta da solo:
               o si cuce male un cambio di beat, o la rimappatura del ricevente (7.414) sposta il bersaglio
               con p gia' alto, o il rendez-vous 7.395 aggancia un piede lontano. Qui si registra cio' che
               serve a distinguerli: beat, p, posizione, e se QUESTO frame ha rimappato. */
            if(typeof window!=='undefined'&&window.__CPM_BV613!==undefined){try{const _a613=window.__CPM_BV613;
              if(_a613.length<3000)_a613.push({t:Math.round(performance.now()),bi,k:sg.kind||null,p:+p.toFixed(3),x:+_bxg.toFixed(2),y:+_byg.toFixed(2),fx:+_f0387[0].toFixed(1),tx:+sg.to[0].toFixed(1),rm:sr.current._rm613?1:0,bx0:_pre613?_pre613.x:null,by0:_pre613?_pre613.y:null,fu:(_f0387===sg.from)?0:1});sr.current._rm613=0;}catch(_e){}}
            const _arcH=sg.kind==="cross"?4.2:sg.kind==="through"?0.35:(sg.kind==="pass"||sg.kind==="give")?1.0:0.0;
            ball.position.y=(_aerTL!=null)?(_aerTL+Math.sin(p*Math.PI)*Math.max(_arcH,0.35)):(0.65+Math.sin(p*Math.PI)*_arcH);/* [7.222.0] nelle situazioni aeree il pallone e IN VOLO per tutta la costruzione: non deve mai toccare l erba */
            /* [7.390.0 collaudo PO «si porta solo la palla avanti e fine» · «durante i movimenti si muove
               solo il pallone e non l'eroe»] UNA RICEZIONE DEVE SEMBRARE UNA RICEZIONE.
               Misurato con buildup-sync-test.mjs: quindici costruzioni su ventisei sono un solo passaggio
               da circa dieci unita' con l'Eroe che ne percorre mezza in tutto. Guardando la timeline PURA
               si capisce perche' — sono tutte EDGE_SHOT, cioe' passaggio → controllo → tiro — e la
               timeline elenca l'Eroe fra gli attori del beat assegnandogli la STESSA posizione all'inizio
               e alla fine. Non e' sbagliato come calcio: chi riceve al limite non corre dieci metri. E'
               sbagliato come SCENA: il pallone attraversa il campo e l'uomo che lo aspetta e' una statua.
               Qui l'Eroe fa la cosa che fa qualunque ricevente vero — VIENE INCONTRO al pallone — per un
               passo solo, e solo quando la timeline non gli aveva assegnato nessun movimento suo. Vive nel
               CONSUMO dell'executor, come il pavimento di velocita' del 7.236: la timeline pura, i suoi
               test node e la firma del backbone narrativo restano intatti per costruzione. */
            if(tlMap)Object.keys(sg.before).forEach(id=>{const m=tlMap[id];if(!m)return;const a=sg.before[id],b2=sg.after[id];
              let _ax390=a[0]+(b2[0]-a[0])*p,_ay390=a[1]+(b2[1]-a[1])*p;
              if(id==='HERO'&&(sg.kind==='pass'||sg.kind==='through')&&Math.hypot(b2[0]-a[0],b2[1]-a[1])<0.5&&sg.from){
                /* [7.414.0 gi24/gi79, rosso del guardiano allargato: palla 27-31u, eroe 0,0u] CHI GIOCA IL
                   FILTRANTE SEGUE LA GIOCATA. Il passo del 7.390 copre chi RICEVE (viene incontro al pallone);
                   nel piano THROUGH l'eroe e' il PASSATORE senza nessun beat di movimento suo: statua per
                   tutta la costruzione. Dopo il rilascio accompagna in avanti verso il punto di caduta —
                   il «passa e segui» di qualunque campo — quanto basta a essere un corpo vivo in scena. */
                const _fol414=(sg.kind==='through'&&sg.fromId==='HERO');
                const _vx390=(_fol414?sg.to[0]:sg.from[0])-a[0],_vy390=(_fol414?sg.to[1]:sg.from[1])-a[1],_vl390=Math.hypot(_vx390,_vy390);
                if(_vl390>4){const _st390=(_fol414?4.2:2.6)*p;_ax390=a[0]+_vx390/_vl390*_st390;_ay390=a[1]+_vy390/_vl390*_st390;}}
              if(id==='HERO'&&typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST))sr.current._tlHT410=[+_ax390.toFixed(1),+_ay390.toFixed(1)];/* [7.411.0 sonda] il bersaglio per-fotogramma che l'executor chiede all'eroe */
              animOne(m,G2X(_ax390),G2Z(_ay390),aDt,ak,ball.position.x,ball.position.z);});
            /* [7.227.0 #45 revisione PO «il pallone va prima a terra» + misura in condizioni wizard] l'override
               di conduzione (5.43.5) incollava la palla all'EROE per OGNI segmento carry — ma nel build-up di
               testa/cross il portatore è il COMPAGNO che poi crossa (HEADER_ATTACK: run di MATE1): misurati 2.6s
               di palla sull'erba ai piedi di chi doveva STACCARE, più il teleport al crossatore al via del cross.
               Ora la palla segue i piedi del PORTATORE VERO del beat (fromId/toId), e sull'ULTIMO passo verso una
               conclusione AEREA non scende mai a terra (è il cross che sta arrivando: resta in quota, formula sopra). */
            if(sg.kind==='carry'&&!(bi===tlBuildN-1&&_aerTL!=null)){
              const _hid=(typeof sg.toId==='string')?sg.toId:((typeof sg.fromId==='string')?sg.fromId:null);
              const _hm=(_hid==='HERO')?hero:((tlMap&&_hid)?tlMap[_hid]:null);
              if(_hm){
                /* [7.382.0] LA MEDIA MOBILE NON EREDITA UNA CORSA CHE NON C'E' PIU'. Azzerarla solo alla fine del beat non bastava: `_tlC381` viene ripulito al cambio di scena, ma la direzione restava scritta SUL MESH, e il beat di conduzione successivo ripartiva dalla media di un'altra azione — misurato su gi103, 14 frame su 14 col pallone dietro, e su gi91 in modo intermittente a seconda di quale scena fosse stata giocata prima. Un guardiano verde su un sottoinsieme e rosso sulla passata intera e' sempre questo: uno stato che attraversa il confine. Qui la direzione appartiene alla coppia (portatore, beat), e cambiando l'una o l'altro riparte da zero. */
                if(sr.current._tlCP382!==_hm){_hm._cdA382=null;_hm._cdR382=false;_hm._cpX382=null;_hm._cpZ382=null;sr.current._tlCP382=_hm;}/* la MEMORIA della direzione appartiene alla persona: cambia il portatore, riparte da zero */
                sr.current._tlC381=_hm;/* [7.381.0] CHI conduce, dichiarato dal renderer. La prima versione del guardiano lo deduceva prendendo il mesh piu' vicino al pallone: con l'offset a 0.95u un avversario in pressing e' spesso piu' vicino del portatore, e la proiezione finiva calcolata sul corpo sbagliato — 6 frame «col pallone dietro» su gi96 che erano un errore della sonda, non del gioco. */
                /* [7.381.0 collaudo PO #83/#40/#96 «il pallone in corsa rimane dietro all'eroe» ·
                   «si perde un po' il pallone per strada durante la corsa»] LA CONDUZIONE HA UNA DIREZIONE.
                   Qui il pallone veniva incollato a `portatore.x + 1.3`: un offset FISSO verso est, cioe'
                   verso la porta avversaria, cieco a dove il portatore stia davvero correndo. Misurato col
                   nuovo guardiano carry-run-ball-test.mjs su 18 combinazioni scena/azione: la distanza e'
                   SEMPRE esattamente 1.30u — la firma di una costante — e la proiezione sulla direzione di
                   marcia va da +1.30u (corsa verso est: il pallone davanti, e li' sembrava tutto a posto) a
                   -1.30u (corsa verso ovest: il pallone esattamente DIETRO il corpo), passando per ~0 sulle
                   corse laterali, dove finiva di fianco. 30 frame col pallone alle spalle su 7 combinazioni,
                   fra cui gi96 e gi91, due delle scene segnalate.
                   Ora l'offset segue la direzione di marcia REALE del portatore (la velocita' del modello
                   fisico, scritta da animOne prima di questo punto e viva anche GLB-ON: il return anticipato
                   sui mesh `_glbDriven` sta piu' in basso, dopo il blocco di posizione); se il portatore e'
                   ancora fermo si usa la direzione del beat, che e' sempre definita. Ed e' piu' corto: 1.3u
                   davanti al corpo si legge come un pallone scappato, 0.95 come un tocco di conduzione. */
                /* [7.382.0] LA DIREZIONE E' QUELLA CHE SI VEDE. La prima versione la prendeva da `_hvx`,
                   la velocita' del modello fisico: giusta finche' il portatore corre col suo motore, sbagliata
                   quando il mesh viene spostato da qualcun altro — il riposizionamento di scena azzera `_hvx`
                   lasciando il corpo in movimento, e l'offset restava agganciato alla direzione del beat, che
                   puo' essere l'opposta. Misurato su gi91: 8 frame su 36 con la proiezione ferma a -0.95u, cioe'
                   il pallone stabilmente dietro, non un sussulto. Ora si guarda lo SPOSTAMENTO REALE del corpo
                   fra due fotogrammi — la stessa cosa che guarda l'occhio, e la stessa che misura il guardiano —
                   e `_hvx` e la direzione del beat restano solo come appoggi per il primo frame, quando uno
                   spostamento ancora non c'e'. */
                /* ⚠️ [7.384.0] LE TRE SORGENTI DEVONO PARLARE LA STESSA UNITA'. Nel 7.381 la sorgente
                   primaria era `_hvx`, una VELOCITA' (7-10 u/s), e il ripiego scattava sotto 0,6. Il 7.382
                   ha cambiato la sorgente in SPOSTAMENTO PER FOTOGRAMMA — che a 8 u/s e 60 fps vale circa
                   0,13u — lasciando la soglia a 0,6: con il portatore in piena corsa la condizione era
                   SEMPRE vera e la direzione reale veniva sistematicamente buttata via a favore di quella
                   del beat. Il guardiano non se n'era accorto perche' nel beat di conduzione le due
                   direzioni quasi coincidono: il numero era giusto per la ragione sbagliata. Ora la
                   velocita' viene convertita in spostamento (`*aDt`) e la soglia finale e' nella stessa
                   scala della prima. */
                const _had382=(_hm._cpX382!=null);
                let _cdX381=0,_cdZ381=0,_cdU381=0;
                if(_had382){_cdX381=_hm.position.x-_hm._cpX382;_cdZ381=_hm.position.z-_hm._cpZ382;_cdU381=Math.hypot(_cdX381,_cdZ381);}
                _hm._cpX382=_hm.position.x;_hm._cpZ382=_hm.position.z;
                if(_cdU381<0.012){_cdX381=(_hm._hvx||0)*aDt;_cdZ381=(_hm._hvz||0)*aDt;_cdU381=Math.hypot(_cdX381,_cdZ381);}
                if(_cdU381<0.004){const _sgX=G2X(sg.to[0])-G2X(sg.from[0]),_sgZ=G2Z(sg.to[1])-G2Z(sg.from[1]),_sgL=Math.hypot(_sgX,_sgZ);
                  if(_sgL>0.01){_cdX381=_sgX;_cdZ381=_sgZ;_cdU381=_sgL;}else{_cdX381=1;_cdZ381=0;_cdU381=1;}}
                /* [7.382.0 collaudo PO #84 «Palla non sincronizzata con la corsa»] LA CONDUZIONE NON
                   RUOTA IN UN FOTOGRAMMA. Con la sola velocita' istantanea, un frame in cui il portatore
                   decelera o corregge basta a far girare l'offset — misurato su gi84: un fotogramma su 65
                   con la proiezione a -0.95u, cioe' la direzione esattamente ribaltata, e il pallone che
                   salta da davanti a dietro il corpo e torna. E' un pop di un frame, ed e' esattamente
                   «non sincronizzata». Qui la direzione e' una media mobile: un sussulto non la muove, una
                   svolta vera la porta con se' in un paio di decimi. Il caso degenere (inversione esatta,
                   dove la media si annulla) prende la direzione nuova di netto invece di collassare. */
                /* ⚠️ SI RUOTA, NON SI MEDIA. Il primo tentativo smorzava la direzione mediando i due
                   versori e ri-normalizzando il risultato: sembra la stessa cosa e non lo e'. Mediare due
                   versori quasi opposti non li fa RUOTARE l'uno verso l'altro, li ACCORCIA — e la
                   normalizzazione successiva restituisce quasi esattamente il versore di partenza. La
                   direzione non si muoveva piu': misurato su gi103, quattordici fotogrammi su quattordici
                   con l'offset inchiodato a (1,0) mentre il portatore correva all'indietro, e il pallone
                   stabilmente dietro il corpo. Qui si lavora sull'ANGOLO, con un tetto di velocita' angolare:
                   una svolta vera arriva in un paio di decimi, un sussulto di un frame non si vede, e nessuna
                   inversione puo' restare bloccata. E finche' l'angolo viene da un RIPIEGO — primo fotogramma,
                   spostamento ancora nullo — il primo movimento reale lo riallinea di netto invece di
                   farglielo rincorrere: un ripiego non merita inerzia. */
                /* [7.390.0] A CORPO QUASI FERMO LA DIREZIONE E' RUMORE, e ricalcolarla fa ORBITARE il
                   pallone attorno al portatore che sta rallentando: misurato appena l'Eroe ha cominciato a
                   venire incontro al pallone — il rapporto pallone/portatore in conduzione e' crollato da
                   1,00 a 0,21 senza che nessuno dei due andasse da nessuna parte. Sotto un passo
                   percettibile si TIENE l'ultimo angolo buono invece di inseguire il tremolio. */
                let _thN382=Math.atan2(_cdZ381,_cdX381);
                if(_cdU381<0.05&&_hm._cdA382!=null&&_hm._cdR382)_thN382=_hm._cdA382;
                const _real382=(_cdU381>=0.012&&_had382);/* [7.384.0] `_cpX382` viene assegnato quattro righe sopra: leggerlo QUI significava trovarlo sempre valorizzato, e il latch «l'angolo viene da un movimento vero» si accendeva anche quando veniva da un ripiego */
                if(_hm._cdA382!=null&&_hm._cdR382){
                  let _dA382=_thN382-_hm._cdA382;
                  while(_dA382>Math.PI)_dA382-=Math.PI*2;while(_dA382<-Math.PI)_dA382+=Math.PI*2;
                  const _lim382=12*aDt;/* radianti al secondo: mezzo giro in poco piu' di un quarto di secondo */
                  if(_dA382>_lim382)_dA382=_lim382;else if(_dA382<-_lim382)_dA382=-_lim382;
                  _thN382=_hm._cdA382+_dA382;
                }
                _hm._cdA382=_thN382;_hm._cdR382=(_hm._cdR382||_real382);
                /* ⚠️ [7.387.0] PROVATO E REVOCATO: far ARRIVARE il pallone ai piedi del portatore invece di
                   incollarcelo — un'easing di due decimi, che sembrava la cosa giusta da fare per il salto
                   di 4,9u misurato su gi97. La misura dice il contrario: salto massimo da 4,9u a 10,5u e
                   rapporto pallone/portatore in conduzione da 1,00 a 0,15, perche' un pallone che insegue
                   il piede non e' piu' il riferimento da cui il beat successivo riparte. Resta incollato. */
                ball.position.x=_hm.position.x+Math.cos(_thN382)*0.95;
                ball.position.z=_hm.position.z+Math.sin(_thN382)*0.95;
                ball.position.y=0.42;if((sr.current._ws524=14)&&sr.current._bj0)(sr.current._bj0.src='testa',sr.current._bj0.srcs.push('testa'));}
            }
          }
        }
        /* [7.237.0 #52] PLANATA D'ARRIVO: il tratto finale della consegna aerea vive durante il wind-up del
           gesto — avvicinamento esponenziale al punto di contatto (a 0.5s resta ~1u, a 1s ~0.3u: sempre in
           moto percettibile, mai parcheggiata). L'arco della conclusione la consuma; lo stacco/fine esito la azzera. */
        if(sr.current._aerIn52){
          if(ballArcActive||hlPostArcType||!isResult)sr.current._aerIn52=null;/* l'arco o il post-arco la consumano: il glide non deve mai contendersi la palla con un altro driver */
          else if(!tlOn&&dt>0){const _g52=sr.current._aerIn52;
            ball.position.x+=(_g52.x-ball.position.x)*Math.min(aDt*2.2,1);
            ball.position.z+=(_g52.z-ball.position.z)*Math.min(aDt*2.2,1);
            ball.position.y+=(_g52.y-ball.position.y)*Math.min(aDt*2.6,1);}
        }
        if(isHL&&preActionT>=0)preActionT+=dt; // CINE-4: avanza timer pre-action
        if(_curPh==="hl_choose"&&_chooseT>=0)_chooseT+=dt; // FREEZE #2: avanza il timer della fase di lettura
        // CIN-2: reazione avversario — gk_dive (portiere), opp_stumble/opp_spin (difensore); si applica DOPO animOne per sovrascriverlo
        /* ⚠️ [7.695.0 — IL PORTIERE SI TUFFA ANCHE FUORI DALLE SCENE DELL'EROE] I cinque siti che armano
           `gk_dive` stanno tutti dentro il ramo highlight: nella partita ambiente il portiere non si e' MAI
           tuffato, e il PO che chiede «la parata del portiere» guardava proprio quella. Qui il segnale
           arriva dalla riga di cronaca che NOMINA il portiere (7.695 in live-match), e para il portiere
           del lato che NON attacca. Una sola fonte per il testo e per il gesto: non possono divergere.
           Il ramo cede a qualunque reazione gia' in corso, quindi il cancello del 7.603 («un portiere non
           si tuffa due volte in tre secondi») resta valido. Rosso __CPM_NO695. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO695)&&P.gkSave&&P.gkSave.current&&P.gkSave.current.t&&P.gkSave.current.t!==_lastGk695&&!oppActType&&sr.current&&sr.current.players){
          _lastGk695=P.gkSave.current.t;
          try{const _tm695=(P.gkSave.current.side==='home')?'away':'home';let _gk695=null;
            sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(src&&src.team===_tm695&&src.gk&&pp&&pp.mesh)_gk695=pp.mesh;});
            if(_gk695){/* [7.705.0 — IL TUFFO VA DOVE VA IL PALLONE VERO, E QUANTO UN CORPO ARRIVA. Rosso __CPM_NO705]
                 MISURATO (piscina-705, logica ferma a y 50 dopo lo specchio): la mesh del paratore faceva
                 comunque 42,7u in 5s, con un salto di 11u dentro il tuffo. Due difetti in questa riga:
                 (a) il bersaglio era `ball.position.z` del pallone RENDERER, che in regia ambientale sta
                 a centrocampo mentre il pallone LOGICO — quello che la riga di cronaca ha appena parato —
                 sta in area (divergevano di 60u: tuffo verso un fantasma); (b) il morsetto ±9 world-z vale
                 13,4u di campo, un tuffo di nove metri — i siti gemelli delle scene eroe usano ±4/±6.
                 Ora: bersaglio = z del pallone logico (stessa fonte del testo), morsetto ±4.5 come il
                 sito dell'incornata (2810). */
              const _no705=(typeof window!=='undefined'&&window.__CPM_NO705);
              const _bz705=_no705?ball.position.z:G2Z(P.ballY==null?50:P.ballY);
              const _rch705=_no705?9:4.5;
              oppActType="gk_dive";oppActT=0;oppMesh=_gk695;oppDiveDir=_bz705>=_gk695.position.z?1:-1;
              _gk695._divePz=_gk695.position.z;_gk695._diveYaw=_gk695.rotation.y;
              _gk695._diveToZ=clamp(_bz705,_gk695.position.z-_rch705,_gk695.position.z+_rch705);_gk695._diveDur=0.95;
              if(typeof window!=='undefined'&&window.__CPM_REC){try{const _w=(window.__CPM_GK695=window.__CPM_GK695||{tuffi:0});_w.tuffi++;}catch(_e){}}}
          }catch(_e695){}
        }
        if(oppActType&&oppMesh){
          oppActT+=aDt;const _OT=oppActType==="gk_dive"?((!(typeof window!=='undefined'&&window.__CPM_NO465)&&ballArcActive)?Math.max(oppMesh._diveDur||0.90,oppActT+0.05):(oppMesh._diveDur||0.90))/* [7.465.0] IL TUFFO NON PUO' FINIRE PRIMA DEL PALLONE. Anche con la durata calcolata sul volo, su 2 tuffi su 5 il gesto si spegneva col portiere a meta' distesa (26% e 45%): stimare la durata non basta, perche' il tempo d'arrivo dipende anche dal rallentatore e dal frame-rate. Finche' l'arco della conclusione e' VIVO il tuffo resta vivo — non si indovina la durata, si guarda il pallone. */:oppActType==="opp_tackle"?0.85:oppActType==="gk_block"?(((typeof window!=='undefined'&&window.__CPM_NO576)?0:1)&&ballArcActive?Math.max(0.62,oppActT+0.05):0.62)/* [7.552.0 codice 111 «portiere fuori tempo» + «Non ha effettuato la parata»] IL RIFLESSO MUORE PRIMA DEL PALLONE. Il 7.465 ha legato la vita del TUFFO a quella dell'arco («non si indovina la durata, si guarda il pallone») ma ha lasciato fuori il RIFLESSO, che resta inchiodato a 0,62s fissi. MISURATO (portiere-552): su gk_block il gesto si spegne con il volo del pallone al 71% e al 35% — il portiere si oppone, finisce, torna in piedi normale, E POI arriva la palla. Da fuori e' esattamente «non ha effettuato la parata». Ora vale la stessa regola del tuffo: finche' l'arco e' vivo, il riflesso e' vivo. */:0.55,u=Math.min(oppActT/_OT,1),sw=Math.sin(u*Math.PI);/* [7.203.0] il riflesso è più RAPIDO del tuffo · [7.215.0] la durata del tuffo segue quella del tiro: il portiere arriva sulla palla, non prima */
          if(_CPM_TEST&&typeof window!=='undefined'){try{const _W=window.__CPM_GKW||(window.__CPM_GKW={ev:[],cur:null});const _isGk=(oppActType==='gk_dive'||oppActType==='gk_block'||oppActType==='gk_catch');const _c=_W.cur;if(!_c||_c.type!==oppActType||_c.m!==oppMesh||u<_c.lu-1e-6){if(_c){_W.ev.push(_c.o);if(_c.lu<0.95&&_c.o.gk)_W.ev.push({k:'cut',from:_c.type,atU:+_c.lu.toFixed(2),to:oppActType,same:_c.m===oppMesh?1:0});}_W.cur={type:oppActType,m:oppMesh,lu:u,o:{k:'gest',type:oppActType,gk:_isGk?1:0,dur:+_OT.toFixed(2),arc:ballArcActive?1:0,arcDur:+(ballArcDur||0).toFixed(2),dz0:null,dzMin:1e9,uAtMin:null,uEnd:0}};}const _o=_W.cur.o;_W.cur.lu=u;_o.uEnd=+u.toFixed(2);_o.arcEnd=ballArcActive?+clamp(ballArcT/Math.max(ballArcDur,0.01),0,9).toFixed(2):null;if(_isGk&&oppMesh){const _dw=Math.hypot(ball.position.x-oppMesh.position.x,ball.position.z-oppMesh.position.z);if(_o.dz0==null)_o.dz0=+_dw.toFixed(2);if(_dw<_o.dzMin){_o.dzMin=+_dw.toFixed(2);_o.uAtMin=+u.toFixed(2);}}}catch(_e){}} /* [7.552 sonda] TESTIMONE DEL PORTIERE: per ogni gesto GK registra durata, distanza minima dal pallone e la FRAZIONE del gesto in cui quel minimo cade (0,5 = portiere disteso quando la palla passa); `cut` marca un gesto interrotto prima della fine = doppio gesto. */
          /* [7.603.0 — UN PORTIERE NON SI TUFFA DUE VOLTE IN TRE SECONDI, rosso __CPM_NO603]
             COLLAUDO PO su SIT #105: «il portiere si e' tuffato 4-5 volte consecutive, sembrava un ninja e
             poi ha subito gol». LA CAUSA NON E' RIPRODOTTA, e va detto per primo: in laboratorio i tuffi
             sono 3 in 150 s di ambientale (mai due a meno di 4,7 s) e NESSUNA delle 64 scene provate ne
             produce due nella stessa scena. I siti che armano `gk_dive` sono cinque, tutti gated su
             `!oppActType`: la raffica puo' nascere solo da ri-armamenti consecutivi a tuffo finito, e con
             ogni probabilita' dipende dal frame-rate del dispositivo (qui 7 fps, li' 60). Cacciarla alla
             cieca sarebbe indovinare.
             Quello che si puo' fare senza indovinare e' scrivere la regola che nel calcio esiste comunque:
             fra un tuffo e l'altro passano almeno TRE SECONDI VERI. In laboratorio questa guardia e' un
             NO-OP DIMOSTRATO (l'intervallo minimo misurato e' 4,7 s, sopra il tetto): non cambia nulla di
             cio' che i guardiani vedono. Sul dispositivo tronca la raffica al primo tuffo, che e' l'unico
             che racconta qualcosa. La verifica e' il collaudo del PO. Il registro __CPM_DIVE603 resta. */
          if(oppActT===aDt&&oppActType==="gk_dive"){
            const _now603=(typeof performance!=='undefined')?performance.now():0;
            const _last603=sr.current._dive603||0;
            if(!(typeof window!=='undefined'&&window.__CPM_NO603)&&_last603&&(_now603-_last603)<3000){oppActType=null;oppActT=0;}
            else{sr.current._dive603=_now603;if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{(window.__CPM_GK113=window.__CPM_GK113||[]).push({t:+(performance.now()/1000).toFixed(2),sit:String((propsRef.current&&propsRef.current.hlSitKey)||""),ph:String((propsRef.current&&propsRef.current.matchPhase)||"")});}catch(_e){}}
              if(typeof window!=='undefined'&&window.__CPM_DIVE603){try{const D=window.__CPM_DIVE603;if(D.length<200)D.push(_now603);}catch(_e){}}}
          }
          /* [7.674.0 — CODICE 113: «PORTIERE DOPPIO GESTO». Rosso __CPM_NO674.
             MISURATO in due passi, e il primo mi ha dato il numero sbagliato: contando gli ARMAMENTI
             del tuffo ne trovavo trentacinque nella stessa scena, uno ogni tre centesimi — ma sono
             tentativi che il filtro anti-raffica (7.603) gia' sopprime; contando i tuffi ESEGUITI sono
             3 su 3 scene, zero doppi. Il difetto quindi non e' una sequenza di due tuffi: sono DUE
             GESTI SIMULTANEI. Questo blocco scrive ventitre volte su corpo, braccia e quota del
             portiere SENZA MAI CHIEDERSI se quel personaggio e' gia' animato dalla sua clip GLB — e
             il gioco vero usa i GLB. Il portiere si tuffa due volte insieme: una con la clip, una con
             la posa procedurale che gli scrive sopra.
             E' la TERZA volta oggi che lo stesso errore mi si presenta con una faccia diversa (7.665
             i giocatori che non sparivano, 7.672 la volee' acrobatica): curo il ramo procedurale, che
             e' quello che le mie sonde vedono, e dimentico quello GLB, che e' quello che il PO guarda.
             Qui, se il portiere e' guidato dal GLB, la posa procedurale lascia fare alla clip: restano
             solo la POSIZIONE (il portiere deve comunque spostarsi verso la palla) e l'imbardata. */
          const _glb674=!!(oppMesh&&oppMesh._glbDriven)&&!(typeof window!=='undefined'&&window.__CPM_NO674);
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&oppMesh&&oppActType==="gk_dive"){try{window.__CPM_GKPOSE674=+oppMesh.rotation.z.toFixed(3);}catch(_e){}}
          if(oppActType==="gk_dive"){// item 1 (5.49.0): tuffo CREDIBILE — estensione COMPLETA verso la palla, mani avanti, FACING FISSO, niente recoil/molla
            if(oppMesh._diveYaw!=null)oppMesh.rotation.y=oppMesh._diveYaw;
            const _dpz=(oppMesh._divePz||0),_dtz=(oppMesh._diveToZ!=null?oppMesh._diveToZ:_dpz+oppDiveDir*5);
            /* [7.465.0 codici 111/112 «il portiere non si tuffa nel tempo giusto, sincronizzato col pallone»]
               LA DISTESA LA GUIDA IL PALLONE, NON UN CRONOMETRO SUO. L'estensione correva sul clock del TUFFO
               (`u/0.72`, completa al 72% di `_diveDur`) mentre la palla corre sul clock dell'ARCO: due orologi
               scollegati, con la sincronia affidata al fatto che `_diveDur=clamp(arcD*0.92,0.48,1.20)` li
               tenesse vicini. MISURATO col testimone nuovo (`__CPM_DIVE465`, scritto sulla riga che esegue la
               traslazione): il portiere e' gia' DISTESO 0,20-0,57s PRIMA che la palla arrivi, su 4 tuffi su 5
               — non e' in ritardo, e' in anticipo, e resta li' a terra ad aspettare. Il caso peggiore e'
               proprio il MORSETTO segnalato in coda: arco 0,24s contro un tuffo bloccato al minimo di 0,48s.
               Ora, finche' l'arco della conclusione e' vivo, l'estensione E' il progresso dell'arco: il
               portiere e' disteso quando la palla e' li', per costruzione e a qualunque durata. Il clock
               proprio resta come ripiego per i tuffi senza arco (cronaca ambientale, arco gia' consumato). */
            const _arcSync465=(!(typeof window!=='undefined'&&window.__CPM_NO465))&&ballArcActive&&ballArcDur>0;
            const _e=_arcSync465?clamp(ballArcT/ballArcDur,0,1):Math.min(u/0.72,1);
            /* [7.465.0] LA DISTESA NON TORNA INDIETRO. Su alcune conclusioni l'arco si spegne prima della
               fine (il cross-gol chiude a u>=0.85, 6.74 3D-5): li' `_arcSync465` cade e l'estensione
               ripiegava sul clock proprio, che a quel punto vale meno — il portiere RIENTRAVA a meta'
               distesa. Misurato: 57% e 86% di estensione all'arrivo su archi lunghi. Un portiere in tuffo
               non si ritrae: l'estensione e' monotona per costruzione. */
            let _ext=_e*_e*(3-2*_e);
            if(!(typeof window!=='undefined'&&window.__CPM_NO465)){
              if(oppMesh._ext465K!==sr.current._actSitKey403||oppActT<=aDt*1.5){oppMesh._ext465=0;oppMesh._ext465K=sr.current._actSitKey403;}/* il latch appartiene a QUESTO tuffo: si azzera al primo fotogramma e al cambio di scena, o il tuffo dopo nascerebbe gia' disteso */
              if(_ext<(oppMesh._ext465||0))_ext=oppMesh._ext465;oppMesh._ext465=_ext;}/* smoothstep: l'estensione ACCOMPAGNA il volo della palla (prima era completa al 42% del tuffo, cioè molto prima dell'arrivo: il portiere restava disteso a terra ad aspettare, e il contatto non si vedeva) */
            /* [7.215.0 revisione PO «il portiere non effettua bene la parata, gesti innaturali»] IL TUFFO HA
               UN'ALTEZZA. Era un salto fisso (1.15) qualunque fosse la conclusione: sul tiro raso il portiere
               volava sopra il pallone, su quello alto restava sotto. Ora lo stacco e l'assetto del corpo
               seguono la quota d'arrivo del tiro: raso = tuffo disteso a terra, alto = volo con le braccia su. */
            const _bh=(oppMesh._diveBallY!=null?oppMesh._diveBallY:0.65),_hiD=clamp((_bh-0.55)/1.45,0,1);
            oppMesh.position.z=_dpz+(_dtz-_dpz)*_ext;// raggiunge ESATTAMENTE la Z della palla (bersaglio della conclusione) e ci resta
            /* [7.465.0 codici 111/112 «il portiere si tuffa fuori tempo rispetto alla traiettoria del pallone»]
               TESTIMONE DEL TUFFO, QUI E NON NEL BLOCCO GLB. Il gemello `__CPM_GKTL` (7.440) vive dentro gli
               attori CH38 e in headless non produce un solo campione — misurato: 14 righe, tutte del portiere
               di CASA, zero tuffi. Ma la traslazione del tuffo e' PROCEDURALE ed e' proprio questa riga: il
               posto giusto per misurare la sincronia e' dove la sincronia accade. Statement isolato, test-only. */
            if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _dv=(window.__CPM_DIVE465=window.__CPM_DIVE465||[]);
              if(_dv.length<400)_dv.push({u:+u.toFixed(3),ext:+_ext.toFixed(3),t:+performance.now().toFixed(0),
                gz:+oppMesh.position.z.toFixed(2),gx:+oppMesh.position.x.toFixed(1),z0:+_dpz.toFixed(2),tz:+_dtz.toFixed(2),
                bx:+ball.position.x.toFixed(1),bz:+ball.position.z.toFixed(2),by:+ball.position.y.toFixed(2),
                arcT:+(+ballArcT).toFixed(3),arcD:+(+ballArcDur).toFixed(2),dvD:+(+_OT).toFixed(2)});}catch(_e465){}}
            /* [7.221.0 collaudo PO «il portiere vola come superman sopra la traversa»] REGRESSIONE MIA del 7.215.0:
               legando lo stacco alla quota della palla avevo lasciato salire la traslazione fino a ~2.4 m — con il
               mesh sopra, il portiere finiva SOPRA LA TRAVERSA (2.44 m). Un portiere che si distende alza il corpo
               di poco piu di mezzo metro: sono le BRACCIA ad arrivare in alto, ed e la rotazione a farle arrivare.
               Cap duro a 1.05 m, cosi il volo resta proporzionato al tiro ma resta un tuffo, non un decollo. */
            if(!_glb674)oppMesh.position.y=Math.min(1.05,Math.sin(_e*Math.PI)*(0.45+_hiD*0.45)+_ext*(0.08+_hiD*0.18));// stacco proporzionato alla quota della palla, ma da portiere
            if(!_glb674)oppMesh.rotation.z=oppDiveDir*_ext*(1.75-_hiD*0.45);// raso = corpo ORIZZONTALE · alto = più inclinato che disteso
            if(!_glb674){const _ax=-_ext*(2.7-_hiD*1.5);oppMesh._aL.rotation.x=_ax;oppMesh._aR.rotation.x=_ax;}// braccia TESE avanti sul raso, ALTE sul pallone alto
            if(!_glb674){oppMesh._aL.rotation.z=-oppDiveDir*_ext*1.15;oppMesh._aR.rotation.z=-oppDiveDir*_ext*1.15;}// mani verso la palla
            if(oppMesh._lR)oppMesh._lR.rotation.x=-_ext*0.7;if(oppMesh._lL)oppMesh._lL.rotation.x=-_ext*0.7;}// gambe DISTESE (estensione completa del corpo)
          else if(oppActType==="gk_block"){/* [7.203.0] RIFLESSO: il portiere si oppone col CORPO — resta in piedi
              (corpo appena inclinato verso la palla, niente rotazione orizzontale), scarica il peso sulle gambe
              larghe e allarga le braccia. Traslazione minima: la palla gli arriva addosso, non deve raggiungerla. */
            if(oppMesh._diveYaw!=null)oppMesh.rotation.y=oppMesh._diveYaw;
            const _bpz=(oppMesh._divePz||0),_btz=(oppMesh._diveToZ!=null?oppMesh._diveToZ:_bpz);
            const _be=Math.min(((typeof window!=='undefined'&&window.__CPM_NO576)?(u/0.30):(oppActT/0.19)),1),_bx=_be*_be*(3-2*_be);// scatto rapido, poi tiene la posa /* [7.552.0] LO SCATTO E' UN TEMPO, NON UNA FRAZIONE. Con la vita del gesto ora legata al volo del pallone, `u/0.30` avrebbe allungato anche lo SCATTO in proporzione all'arco: un riflesso che si apre in mezzo secondo non e' piu' un riflesso. Ancorato a 190ms assoluti (gli stessi 0,30x0,62 di prima), poi tiene la posa quanto serve. */
            oppMesh.position.z=_bpz+(_btz-_bpz)*_bx;
            if(!_glb674)oppMesh.position.y=Math.sin(_be*Math.PI)*0.28;// piccolo stacco sulle gambe, mai corpo a terra
            if(!_glb674)oppMesh.rotation.z=oppDiveDir*_bx*0.30;// solo un'inclinazione verso il lato del pallone
            if(!_glb674){oppMesh._aL.rotation.z=-_bx*1.35;oppMesh._aR.rotation.z=_bx*1.35;}// braccia LARGHE (occupa spazio)
            if(!_glb674){oppMesh._aL.rotation.x=-_bx*0.55;oppMesh._aR.rotation.x=-_bx*0.55;}
            if(oppMesh._lR)oppMesh._lR.rotation.x=-_bx*0.30;if(oppMesh._lL)oppMesh._lL.rotation.x=_bx*0.30;}
          else if(oppActType==="gk_catch"){// [5.83.0 IA-3] USCITA IN PRESA sul cross (clip GLB finora morta): passo verso la palla, braccia in alto, raccolta al petto
            if(oppMesh._diveYaw!=null)oppMesh.rotation.y=oppMesh._diveYaw;
            const _cpz=(oppMesh._divePz||0),_ctz=(oppMesh._diveToZ!=null?oppMesh._diveToZ:_cpz);
            oppMesh.position.z=_cpz+(_ctz-_cpz)*Math.min(u/0.5,1);
            if(!_glb674)oppMesh.position.y=Math.sin(Math.min(u/0.6,1)*Math.PI)*0.55;// piccolo stacco per la presa alta
            oppMesh._aL.rotation.x=-Math.sin(u*Math.PI)*2.6;oppMesh._aR.rotation.x=-Math.sin(u*Math.PI)*2.6;}// braccia sopra la testa → al petto
          else if(oppActType==="opp_stumble"){if(!_glb674)oppMesh.rotation.z=sw*1.0;if(!_glb674)oppMesh.position.y=-sw*0.15;oppMesh._lR.rotation.x=sw*1.8;oppMesh._lL.rotation.x=-sw*0.7;}
          else if(oppActType==="opp_spin"){if(oppMesh._spinYaw==null)oppMesh._spinYaw=oppMesh.rotation.y;oppMesh.rotation.y+=aDt*(u<0.5?9:3);}// [6.76.0 LMV-A3] salva lo yaw d'origine → il cleanup lo ripristina (prima restava girato di spalle ~190°)
          else if(oppActType==="opp_intercept"){if(!_glb674)oppMesh.position.y=sw*0.45;oppMesh._aL.rotation.x=sw*1.5;oppMesh._aR.rotation.x=sw*1.5;if(!_glb674)oppMesh.rotation.z=sw*0.28;}// 3DV-13: si china + tende le braccia
          else if(oppActType==="opp_tackle"){// 5.43.2 SCIVOLATA: il difensore si abbassa a terra, allunga la gamba sulla palla e scivola nella linea di passaggio
            const _d=oppDiveDir||1;
            if(!_glb674)oppMesh.position.y=-sw*0.30;if(!_glb674)oppMesh.rotation.z=_d*sw*0.9;
            oppMesh._lR.rotation.x=-sw*2.1;oppMesh._lL.rotation.x=sw*0.9;
            oppMesh._aL.rotation.x=sw*1.1;oppMesh._aR.rotation.x=-sw*0.5;
            if(oppMesh._slideToX!=null){oppMesh.position.x+=(oppMesh._slideToX-oppMesh.position.x)*Math.min(aDt*3.2,1);oppMesh.position.z+=((oppMesh._slideToZ!=null?oppMesh._slideToZ:oppMesh.position.z)-oppMesh.position.z)*Math.min(aDt*3.2,1);}}/* 5.43.9: scivolata più morbida (lerp 5→3.2, durata 0.64→0.85) */
          if(u>=1){
            /* [7.415.0 collaudo PO gi71 «il dribbling non e' chiaro»] IL VINCITORE SI PRENDE IL PALLONE.
               Il 7.249 poka la palla via ≤9u «e' lui che viene a prendersela» — ma nessun codice lo
               faceva andare: misurato su tre repliche, a fine scena il pallone giace SOLO con
               l'avversario piu' vicino a 8-10u. Dopo la scivolata sul dribbling perso, il difensore
               si rialza e va a raccogliere (driver sotto, fino a 1,2u dalla palla). */
            oppActType=null;if(oppMesh){if(!_glb674)oppMesh.position.y=0;if(!_glb674)oppMesh.rotation.z=0;if(oppMesh._aL){oppMesh._aL.rotation.z=0;oppMesh._aR.rotation.z=0;oppMesh._aL.rotation.x=0;oppMesh._aR.rotation.x=0;}if(oppMesh._lR){oppMesh._lR.rotation.x=0;oppMesh._lL.rotation.x=0;}/* [7.203.0] le pose del riflesso sono ASSEGNAZIONI ASSOLUTE (non scalate da sw, che si azzera da solo): senza cleanup il portiere restava a braccia larghe */if(oppMesh._spinYaw!=null){oppMesh.rotation.y=oppMesh._spinYaw;oppMesh._spinYaw=null;}oppMesh._slideToX=null;oppMesh._slideToZ=null;oppMesh._diveToZ=null;oppMesh._diveBallY=null;oppMesh._diveDur=null;if(oppMesh._isGk&&!(typeof window!=='undefined'&&window.__CPM_NO705)){oppMesh._vx=0;oppMesh._vz=0;}/* [7.705.0] MISURATO (v5): il tuffo teletrasporta il corpo oltre il bersaglio mentre _vz resta carica a +6 u/s — l'integratore prosegue per 12u prima di frenare (62→74) e torna a -7. Chi atterra da un tuffo non ha slancio di corsa: la velocita' muore col gesto. */oppMesh=null;}}
        }
        if(typeof window!=='undefined'&&window.__CPM_COL618!==undefined&&sr.current._pkCol415){try{const _g8=window.__CPM_COL618;_g8.drv=(_g8.drv|0);_g8.act=oppActType||null;_g8.res=isResult?1:0;_g8.km=(sr.current._pkCol415.k===P.hlSitKey)?1:0;}catch(_e){}}
        if(sr.current._pkCol415&&sr.current._pkCol415.k===P.hlSitKey&&isResult&&!oppActType){const _pc415=sr.current._pkCol415.m;
          if(typeof window!=='undefined'&&window.__CPM_COL618!==undefined){try{window.__CPM_COL618.drv=(window.__CPM_COL618.drv|0)+1;}catch(_e){}}
          if(_pc415&&Math.hypot(ball.position.x-_pc415.position.x,ball.position.z-_pc415.position.z)>1.2)animOne(_pc415,ball.position.x,ball.position.z,aDt,ak,ball.position.x,ball.position.z);}
        /* [7.415.0 collaudo PO gi71 «il dribbling non e' chiaro»] IL VINCITORE SI PRENDE IL PALLONE.
           Il 7.249 poka la palla via ≤9u «e' lui che viene a prendersela» — ma nessun codice lo faceva
           andare: misurato su tre repliche, a fine scena il pallone giaceva SOLO (avversario piu'
           vicino a 8-10u). L'aggancio sta nel poke stesso (fireConclusion, ramo 5.43.5); il driver qui
           parte a scivolata FINITA (!oppActType) e porta il vincitore fino a 1,2u dalla palla. */
        // Sprint 3D-G2: arbitro segue la palla con offset laterale; guardalinee seguono x dell'azione
        // 3DV-10: durante isHL l'arbitro esce dal campo (fuori camera) per non bloccare l'azione
        {const _rk=Math.min(aDt*1.2,1);/* [7.303.0] inseguimento più calmo */
        if(isHL){refMesh.position.x+=(-90-refMesh.position.x)*Math.min(aDt*10,1);}
        else{
          /* [7.303.0 collaudo PO «l'arbitro durante la cronaca è una scheggia impazzita, riduci i movimenti»]
             il lato su cui si teneva era `bz>=0?1:-1`: bastava che il pallone sfiorasse la mediana perché il
             bersaglio saltasse di 28u da una fascia all'altra, e con un lerp da 1.8/s l'arbitro attraversava
             il campo di corsa — a ogni oscillazione della cronaca. Ora: ISTERESI sul lato (cambia solo oltre
             ±7u dalla mediana), bersaglio SMUSSATO (la palla della cronaca si sposta a scatti, lui no) e
             passo per-frame CAPPATO a una velocità umana. */
          const _S=sr.current;
          if(_S._refSide==null)_S._refSide=(bz>=0?1:-1);
          if(bz>7)_S._refSide=1;else if(bz<-7)_S._refSide=-1;
          const _tx=bx-6,_tz=clamp(bz+_S._refSide*14,-28,28);
          if(_S._refTx==null){_S._refTx=_tx;_S._refTz=_tz;}
          const _e=Math.min(aDt*1.6,1);_S._refTx+=(_tx-_S._refTx)*_e;_S._refTz+=(_tz-_S._refTz)*_e;
          let _dx=(_S._refTx-refMesh.position.x)*_rk,_dz=(_S._refTz-refMesh.position.z)*_rk;
          const _mx=9*aDt,_dl=Math.hypot(_dx,_dz);if(_dl>_mx){_dx*=_mx/_dl;_dz*=_mx/_dl;}
          refMesh.position.x+=_dx;refMesh.position.z+=_dz;
        }// arbitro in diagonale (di lato e dietro l'azione), mai in mezzo al gioco
        refMesh.rotation.y=Math.atan2(bx-refMesh.position.x,bz-refMesh.position.z);
        linRef1.position.x+=(bx*0.5-linRef1.position.x)*Math.min(aDt*0.9,1);
        linRef2.position.x+=(bx*0.5-linRef2.position.x)*Math.min(aDt*0.9,1);}
        // Sprint 3D-H3 MT-4: staff vivaci — idle sway arbitro, facing guardalinee, panchine reagiscono al gol
        refMesh.rotation.z=Math.sin(now*0.0040)*0.032;refMesh.position.y=Math.abs(Math.sin(now*0.0032))*0.07;
        linRef1.rotation.y=Math.sin(now*0.0022+0.8)*0.055;linRef1.rotation.z=Math.sin(now*0.0018+0.5)*0.025;
        linRef2.rotation.y=Math.PI+Math.sin(now*0.0022+2.3)*0.055;linRef2.rotation.z=Math.sin(now*0.0018+1.9)*0.025;
        {const _gsB=goalBurstT>=0?(goalBurstHome?1:-1):0;/* [7.52.2 collaudo PO «a volte festeggiano i tifosi sbagliati»] la PANCHINA è taggata per lato-MESH (bx<0 = kit dell'eroe) ma esultava sul lato-TRIBUNA (goalBurstStadHome): in TRASFERTA il gol dell'eroe faceva saltare la panchina AVVERSARIA (e viceversa sul gol subìto). La panchina usa goalBurstHome (lato-mesh, come i giocatori); spalti/bandiere/sciarpe restano su goalBurstStadHome (sono TRIBUNE). */benchFigs.forEach((f,i)=>{f._ph+=dt*1.1;const _bBase=f._isCoach?0:0.72;const mine=_gsB===0?0:((f._home&&_gsB>0)||(!f._home&&_gsB<0)?1:-1);const _ex=mine>0?_goalExcite:0;f.position.y=_bBase+Math.sin(f._ph)*0.03+_ex*Math.abs(Math.sin(f._ph*2+i))*0.34;});}// 5.45.2: solo la panchina del marcatore esulta
        // CINE-VAR: animazione eroe per tipo + variante cinematografica (Sprint 4.73.0)
        // Ogni variant ha gesti fisicamente distinti: sw=sin(u*π) → auto-reset a 0 al termine
        /* [7.319.0 collaudo PO «sulle punizioni e rigori ci deve essere la rincorsa, non possono tirare da
           fermo!»] LA RINCORSA. Sul calcio piazzato l'eroe non si spostava MAI: restava incollato al pallone
           e muoveva solo la gamba — nel calcio non esiste, e sullo schermo si vede subito. Ora, per la sola
           MESH (la palla, l'esito e la posizione logica non si toccano: e' presentazione pura), il
           battitore ARRETRA di ~3.2 unita' lungo l'asse pallone→porta mentre e' in attesa, e quando parte il
           gesto CORRE sul pallone, arrivandoci esattamente quando la gamba colpisce — 0.32 sul rigore
           (dove lo swing culmina a 0.35) e 0.45 sulla punizione (swing a 0.50). L'ingresso in attesa e'
           smorzato, cosi' non c'e' nessuno scatto quando la scena si apre. Il CH38 eredita la posizione dal
           modello procedurale, quindi la rincorsa si vede anche col modello vero. */
        {/* [7.320.0] RIGORE E PUNIZIONE. Nel 7.319 la punizione era esclusa perche' il gesto sembrava gia'
             avviato durante l'attesa — ma quella misura era SPORCA: la sonda riusava la stessa pagina fra
             una situation e l'altra, e la punizione ereditava il gesto del rigore provato subito prima.
             Ri-misurato su pagina pulita, in attesa non c'e' nessun gesto in corso: la rincorsa vale per
             entrambi i piazzati, come chiedeva il collaudo (3.18 → 0 durante la battuta su tutti e due).
             Non serviva una correzione alla radice: serviva misurare meglio. */
         const _spNow=isHL&&(P.hlType==="penalty"||P.hlType==="freekick");
         if(_spNow&&hero){
           /* [7.323.0 direttiva PO «il giocatore supera il pallone»] DUE correzioni di geometria del contatto,
              entrambe misurate prima del fix (proiezione del corpo sull'asse pallone→porta: +0.51/+0.62/+0.93
              unita' OLTRE il pallone prima che partisse, su rigore e due punizioni):
              (a) la rincorsa non termina piu' a offset 0 — cioe' col corpo ESATTAMENTE SUL pallone — ma a
                  _SP_REST=0.62 dietro: il piede d'appoggio si pianta ACCANTO alla palla (offset laterale
                  _SP_PLANT perpendicolare all'asse) e la gamba che calcia la raggiunge con lo swing;
              (b) il fermo del battitore dura finche' IL PALLONE NON PARTE, non finche' dura il gesto: prima,
                  esaurito il gesto (0.55-0.70s), il driver normale riprendeva l'eroe e lo portava avanti
                  OLTRE la palla ancora ferma — era questo il grosso del superamento misurato. Il follow-through
                  (passo oltre il punto di battuta) e' legittimo SOLO a palla partita, ed e' quello che succede
                  ora al rilascio.
              L'ancora e' lo SPOT del piazzato salvato al primo frame (_spB0), non la palla viva: ancorarsi
              alla palla viva trascinerebbe il battitore dietro al tiro dopo la partenza. */
           /* ⚠️ l'ancora si AGGIORNA finche' la battuta non parte e si CONGELA al calcio: catturarla al primo
              frame della scena — prima stesura — la faceva coincidere con una palla ancora A MEZZ'ARIA dallo
              snap d'ingresso (gi14: ancora stantia → asse sbagliato → corpo piazzato 10u oltre lo spot vero). */
           {const _lb0=sr.current.ball;const _kick0=(actType==="penalty"||actType==="freekick");
            if(!sr.current._spB0||!_kick0)sr.current._spB0={x:(_lb0&&_lb0.position.x)||hero.position.x,z:(_lb0&&_lb0.position.z)||hero.position.z};}
           const _bx=sr.current._spB0.x,_bz=sr.current._spB0.z;
           let _ax=AWAY_GOAL_X-_bx,_az=-_bz;const _aL=Math.hypot(_ax,_az)||1;_ax/=_aL;_az/=_aL;/* direzione pallone→porta */
           const _kick=(actType==="penalty"||actType==="freekick");
           const _lbNow=sr.current.ball;
           const _ballGone=(typeof ballArcActive!=='undefined'&&ballArcActive&&ballArcT>0)||(_lbNow&&Math.hypot(_lbNow.position.x-_bx,_lbNow.position.z-_bz)>1.3);/* [7.323.0] il segnale primario e' l'IMPATTO dell'arco; il movimento e' solo il paracadute per esiti senza arco, e a 0.6 scattava sugli assestamenti residui del pallone fermo (rilascio ~65ms prima dell'impatto → corpo 0.2u corto, misurato 0.85 contro 0.62). Un calcio vero sposta la palla di metri: 1.3 non confonde i due casi */
           if(_ballGone||(_kick&&actT>1.6))sr.current._spDone=true;/* fallback 1.6s: mai un fermo eterno se un esito non produce arco */
           if(sr.current._spDone){sr.current._spOff=null;}
           const _uK=_kick?Math.min(actT/(actType==="penalty"?0.70:0.55),1):0;
           const _done=_kick?Math.min(_uK/(actType==="penalty"?0.32:0.45),1):0;
           const _ease=_done*_done*(3-2*_done);/* smoothstep: parte piano, arriva lanciato */
           if(sr.current._spDone){/* palla partita: follow-through libero, il movimento torna quello normale */}
           else{
           const _SP_REST=0.62,_SP_PLANT=0.28;
           const _want=_SP_REST+(3.2-_SP_REST)*(1-_ease);
           sr.current._spOff=(sr.current._spOff==null)?_want:sr.current._spOff;
           /* [7.323.0] durante la BATTUTA l'offset segue la curva analitica ESATTA (lo smoothstep _ease e' gia'
              il profilo di corsa): il filtro di smorzamento — che serve solo a non far scattare l'ingresso in
              attesa — la inseguiva con ~70ms di ritardo e all'impatto il corpo era ancora 0.45u corto
              (misurato: -1.07 sul rigore contro il punto di contatto a -0.62). */
           if(_kick)sr.current._spOff=_want;
           else sr.current._spOff+=(_want-sr.current._spOff)*Math.min(aDt*4.5,1);
           try{if(_CPM_TEST||_SIT_TEST){window.__CPM_RUNUP={off:+sr.current._spOff.toFixed(2),want:+_want.toFixed(2),kick:!!_kick,u:+_uK.toFixed(2)};if(_kick)window.__CPM_RUNUP_MIN=Math.min(window.__CPM_RUNUP_MIN==null?99:window.__CPM_RUNUP_MIN,sr.current._spOff);}}catch(_e){}/* [7.323.0] minimo tracciato PER-FRAME in pagina: il poll da node a 230ms perdeva il fondo della rincorsa (misurato 0.85 contro il vero 0.62) — stessa trappola di campionamento del lancio orfano */
           /* ⚠️ POSIZIONAMENTO ASSOLUTO, non uno scostamento. Prima stesura come delta su `hero.position`:
              si SOMMAVA su se stesso (il battitore camminava all'indietro per 19 unita'); seconda stesura con
              disfacimento a ogni frame: il lerp che riporta l'eroe sul pallone ne ERODEVA due terzi, e la
              rincorsa si riduceva a un passo e mezzo. Qui la posa e' calcolata dallo spot del piazzato meno
              l'arretramento corrente: esatta per costruzione, senza accumulo ne' erosione. Il termine _SP_PLANT
              sposta il corpo di poco a lato dell'asse (perpendicolare (-_az,_ax)): il piede d'appoggio accanto
              alla palla, la gamba che calcia in linea. */
           hero.position.x=_bx-_ax*sr.current._spOff+(-_az)*_SP_PLANT;hero.position.z=_bz-_az*sr.current._spOff+(_ax)*_SP_PLANT;}
         } else if(sr.current._spOff!=null||sr.current._spB0){sr.current._spOff=null;sr.current._spDone=false;sr.current._spB0=null;}}
        if(actType){
          /* [7.415.0 collaudo PO gi190 «alza la gamba a vuoto»] IL CONTRASTO PARTE QUANDO LA PALLA
             ARRIVA. Il gesto difensivo partiva a t+0 dell'esito, SEMPRE (misurato su tre repliche:
             tackle da subito con la palla mai sotto 3,2-4,4u) — su un intercetto fallito la palla
             sta ancora viaggiando e l'eroe allungava la gamba nel vuoto. Finche' il gesto non e'
             cominciato (actT 0) e la palla e' oltre 5u, l'accumulo aspetta: la posa resta neutra
             (inviluppo a seno, u=0) e la scivolata scatta sul passaggio vero. Fallback 0,9s: se la
             palla non passa mai vicina, il gesto si gioca comunque — mai un eroe congelato. */
          const _hold415=(actType==="tackle"&&P.hlDef&&actT===0&&Math.hypot(ball.position.x-hero.position.x,ball.position.z-hero.position.z)>5&&((sr.current._tkW415=(sr.current._tkW415||0)+aDt)<1.4));
          /* [7.420.0 collaudo PO gi146 «scivolata disordinata nemmeno vicino al pallone» · gi168 «si
             tuffa in mezzo all'area»] LA SCIVOLATA VIAGGIA VERSO IL PALLONE. La posa del tackle e'
             solo rotazione: il corpo scivolava SUL POSTO, dove capitava, e la palla passava altrove.
             All'istante in cui il gesto parte (l'attesa 7.415 lo aggancia gia' al passaggio vero) si
             latcha UNA volta il vettore eroe→palla (tetto 3,5u, fermo a 0,4u dal pallone) come SPINTA
             sul bersaglio del driver ordinario — mai un secondo driver sul corpo (lezioni 7.322/7.384):
             l'accelerazione limitata di animOne trasforma la spinta in una scivolata che percorre. */
          if(actType==="tackle"&&P.hlDef&&actT===0&&!_hold415&&sr.current._tkPK420!==P.hlSitKey){sr.current._tkPK420=P.hlSitKey;
            /* [7.427.0 collaudo PO gi128 «non si vede la chiusura dell'eroe»] IL DIFENSORE BATTUTO
               SI LANCIA SULLA LINEA DEL PASSAGGIO, non sul pallone: con la palla che vola via, il
               vettore verso la posizione corrente invecchiava in un frame e la scivolata si fermava
               a meta' strada (misurato: chiusure a 6,6-8,8u dalla traiettoria). Se l'arco e' vivo il
               bersaglio e' il punto della TRAIETTORIA (palla→arcTgt) piu' vicino all'eroe — la
               proiezione perpendicolare, cioe' dove un difensore vero allunga la gamba; tetto 5,2. */
            let _txT=ball.position.x,_tzT=ball.position.z;
            try{if(ballArcActive){const _ax=ballArcTgtX-ball.position.x,_az=ballArcTgtZ-ball.position.z,_al=_ax*_ax+_az*_az;
              if(_al>0.01){let _u=((hero.position.x-ball.position.x)*_ax+(hero.position.z-ball.position.z)*_az)/_al;_u=Math.max(0.05,Math.min(1,_u));
                _txT=ball.position.x+_ax*_u;_tzT=ball.position.z+_az*_u;}}}catch(_e){}
            const _dxT=_txT-hero.position.x,_dzT=_tzT-hero.position.z,_dlT=Math.hypot(_dxT,_dzT)||1,_cT=Math.min(_dlT-0.4,5.2);
            sr.current._tkPush420=_cT>0?{x:_dxT/_dlT*_cT,z:_dzT/_dlT*_cT}:null;
            /* [collaudo PO gi146 «Si tuffa a terra senza nemmeno guardare o avvicinarsi al pallone/avversario»]
               MISURATO (gi146 az.0, «Blocca con tutto il fisico»): il fallback 7.415 dopo 1,4s suona il gesto
               COMUNQUE, e qui la palla non scende mai sotto 11,6u — la spinta 7.420 (tetto 5,2u) non puo'
               chiudere un gap a doppia cifra: scivolata/affondo nel vuoto, a terra dove non c'e' niente.
               Da 6,5u in su la famiglia DEGRADA a `press` per QUESTA scena: pressing vero (GLB-ON =
               locomozione addosso al portatore per la mappa 7.245, GLB-OFF = posa di pressione in piedi) —
               un difensore a 10 metri non si butta a terra, accorcia. `aerial`/`call` non passano da qui.
               __CPM_NO440: interruttore test-only per riprodurre il rosso nel guardiano. */
            {const _dgF=P.hlDefGesto;if(_dlT>6.5&&(_dgF==='slide'||_dgF==='lunge'||!_dgF)&&!(typeof window!=='undefined'&&window.__CPM_NO440))sr.current._dgFar440=P.hlSitKey;}}
          if(!_hold415){actT+=aDt;sr.current._tkW415=0;}
          const _T=gwOf(actType,"vita"),u=Math.min(actT/_T,1),sw=Math.sin(u*Math.PI);/* [7.512.0 R2] vita del gesto dalla tabella unica: chiude il colpo di testa troncato al 65% (actType moriva a 0,75s su clip scalata a 1,15s) *//* [7.244.0 batch PO «non si vede la scivolata/il contrasto» sui gi31/32/45] il gesto difensivo durava 0.6s con inviluppo a seno — a 60fps saliva e spariva PRIMA che l'occhio si assestasse (verdetto a 1.9-2.25s = eroe in piedi da oltre un secondo). Ora il tackle dura 1.7s con inviluppo salita→TENUTA→recupero (la scivolata RESTA a terra ~0.9s, come nel calcio vero): il movimento verso la palla resta su _T2=0.6 invariato */
          if(actType==="shot"){
            if(P.hlVariant==="shot_chip"){// pallonetto: corpo indietro, tocco leggero di punta, salto all'indietro
              hero._lR.rotation.x=-1.6*sw;hero._lL.rotation.x=0.5*sw;hero._aL.rotation.x=1.5*sw;hero._aR.rotation.x=-0.8*sw;hero.position.y=sw*0.38;if(hero._torso){hero._torso.rotation.x=-sw*0.35;hero._torso.rotation.y=sw*0.15;}
            }else if(P.hlVariant==="shot_volley"){// volée/sforbiciata: forbice acrobatica, salto alto, entrambe le gambe
              /* [7.551.0 — collaudo PO «rovesciata al contrario», TERZA segnalazione · rosso __CPM_NO575]
                 IL CORPO NON SI ROVESCIAVA. Il gesto alzava l'eroe di 1,5 e portava le gambe all'indietro, ma la sola
                 rotazione del busto era sull'asse Y — l'IMBARDATA, cioe' girarsi su se stessi. Giusta per ogni altro tiro
                 (in un tiro normale il busto ruota di lato, e tutte le altre varianti fanno cosi'), SBAGLIATA per l'unico
                 gesto in cui il corpo si rovescia ALL'INDIETRO: quello e' l'asse X, e nel codice non c'era. Gambe che vanno
                 indietro con il busto dritto: da fuori e' una rovesciata al contrario, ed e' quello che il PO ha visto tre
                 volte. Qui il busto si rovescia davvero (-1,9 rad al culmine, ~109 gradi), le braccia si aprono per
                 bilanciare come fa chi va in acrobazia, e il salto sale a 1,8. La forbice delle gambe resta com'era. */
              /* [7.569.0 collaudo PO, SESTA segnalazione: «la rovesciata e' proprio concepita al contrario,
                 il piede che calcia non e' rivolto verso la porta» — e la frase che chiude la diagnosi]
                 IL GESTO ERA UNO SOLO PER DUE AZIONI DIVERSE. La variante `shot_volley` raccoglie DUE
                 famiglie di giocate che nel calcio non si somigliano affatto:
                   ROVESCIATA / SFORBICIATA  spalle alla porta, corpo orizzontale, gamba che passa sopra
                                             la testa — un gesto acrobatico;
                   VOLEE' / TIRO AL VOLO     fronte alla porta, in piedi, gamba che colpisce a mezz'aria —
                                             un tiro normale su palla che scende.
                 Il repertorio le distingue nei nomi («Volee' potente», «Tiro di prima al volo», «Mezza
                 volee'» da una parte; «Rovesciata spettacolare», «Sforbiciata acrobatica», «Mezza
                 rovesciata» dall'altra), ma il 3D no: entrambe finivano nella posa acrobatica. Una volee'
                 recitata come una rovesciata e' sbagliata SEMPRE, e con il corpo rovesciato all'indietro
                 il piede finisce rivolto dalla parte opposta alla porta — che e' esattamente cio' che il PO
                 ha visto e descritto sei volte. Le mie tre correzioni precedenti (7.551 asse, 7.553 corpo
                 intero, 7.560 verso) hanno lavorato tutte sulla posa acrobatica: era giusta la posa,
                 sbagliata l'attribuzione.
                 L'etichetta dell'azione arriva gia' al renderer (`hlActLbl`): basta leggerla.
                 __CPM_NO569 = rosso: una posa sola per tutt'e due, com'era. */
              const _acro569=(typeof window!=='undefined'&&window.__CPM_NO569)?true:/rovesciat|sforbiciat|acrobat/i.test(String(P.hlActLbl||""));
              if(u>=0.99)sr.current._rovY569=null;/* gesto finito: la prossima rovesciata ricongela la sua imbardata */
              if(!_acro569){
                /* VOLEE': in piedi, fronte alla porta, gamba che colpisce a mezz'aria. Niente rotazione del
                   corpo — e' il tiro di un giocatore in equilibrio, non un'acrobazia. */
                /* [7.586.0 — LA VOLEE' AVEVA LE GAMBE DELLA ROVESCIATA, rosso __CPM_NO586]
                   COLLAUDO PO, seconda volta sulla stessa cosa (appunti 7.584, SIT #167 «Controbalzo
                   improvviso in area» → «Controbalzo secco al volo»): «Rovesciata al contrario, va girata
                   di 180 gradi». Il 7.569 aveva separato volee' e rovesciata leggendo l'ETICHETTA
                   dell'azione, e su questa scena l'etichetta non contiene nessuna delle parole cercate:
                   il ramo giusto (volee': in piedi, fronte alla porta) veniva imboccato — ma dentro il ramo
                   la gamba che calcia stava a -2,9 radianti, cioe' CENTOSESSANTASEI GRADI ALL'INDIETRO.
                   In questo codice il positivo e' in avanti: la scivolata estende la gamba a +1,8, e
                   l'incespicata la porta a +1,8 con l'altra a -0,7. A -2,9 la gamba non calcia: viene
                   scagliata sopra la testa — il gesto della rovesciata — mentre il corpo resta fronte alla
                   porta e nessuno lo gira. Da fuori si legge esattamente come il PO l'ha scritto: una
                   rovesciata al contrario, da girare di 180 gradi.
                   Non era dunque la SCELTA fra i due gesti a sbagliare (quella il 7.569 l'ha sistemata):
                   era la volee' ad avere le gambe della rovesciata. Ora la gamba colpisce IN AVANTI e
                   l'altra resta d'appoggio, che e' cio' che fa un giocatore in equilibrio. */
                const _v586=(typeof window!=='undefined'&&window.__CPM_NO586);
                hero._lR.rotation.x=(_v586?-2.9:2.4)*sw;hero._lL.rotation.x=(_v586?0.5:-0.35)*sw;
                hero._aL.rotation.x=1.3*sw;hero._aR.rotation.x=-0.9*sw;
                hero.position.y=sw*0.55;
                if(hero._torso){hero._torso.rotation.x=-0.22*sw;hero._torso.rotation.y=sw*0.3;}
                if(_CPM_TEST&&typeof window!=='undefined'){try{window.__CPM_VOLLEY={u:+u.toFixed(2),acro:0,tx:+((hero._torso&&hero._torso.rotation.x)||0).toFixed(2),ty:+((hero._torso&&hero._torso.rotation.y)||0).toFixed(2),y:+hero.position.y.toFixed(2),rx:+(hero.rotation.x||0).toFixed(2),lR:+hero._lR.rotation.x.toFixed(2)};}catch(_e){}}
              } else {
              const _rv575=(typeof window!=='undefined'&&window.__CPM_NO575)?0:1;
              hero._lR.rotation.x=-3.2*sw;hero._lL.rotation.x=-1.6*sw;hero._aL.rotation.x=(_rv575?2.4:1.8)*sw;hero._aR.rotation.x=(_rv575?-2.0:-1.2)*sw;hero.position.y=sw*(_rv575?1.8:1.5);
              if(hero._torso){hero._torso.rotation.y=sw*0.5;}if(_rv575){
                /* [7.569.0 — LA ROVESCIATA RUOTAVA ATTORNO ALL'ASSE SBAGLIATO, e questa e' la frase del PO:
                   «il piede che calcia non e' rivolto verso la porta». In three.js l'ordine di Eulero
                   predefinito e' XYZ, cioe' la rotazione su X si applica attorno all'asse X DEL MONDO,
                   PRIMA dell'imbardata. Il giocatore pero' e' girato verso la porta con `rotation.y`, e la
                   porta sta dove capita: cosi' il ribaltamento lo stendeva DI TRAVERSO rispetto alla
                   direzione del tiro — in una scena sembrava giusto, in un'altra i piedi puntavano di lato.
                   Le mie tre correzioni precedenti hanno cercato il verso (7.551 asse, 7.553 corpo intero,
                   7.560 segno) senza mai chiedersi attorno a QUALE asse stesse girando: era il fotogramma
                   comodo a farmele sembrare giuste.
                   Con l'ordine YXZ l'imbardata viene applicata per prima, quindi X diventa il ribaltamento
                   attorno all'asse LOCALE del giocatore: il corpo va indietro rispetto a DOVE GUARDA, e i
                   piedi salgono verso la porta qualunque sia la sua posizione in campo. Su `hero` la X e'
                   usata solo qui, quindi cambiare ordine non tocca nessun'altra posa. */
                hero.rotation.order='YXZ';
                /* [7.569.0 collaudo PO sul provino: «lo vedi che e' al contrario, devi girarlo di 180 gradi»]
                   L'IMBARDATA. Nella rovesciata il giocatore ha le SPALLE alla porta: si stacca dandole le
                   spalle e la gamba passa sopra la testa verso di essa. Il rig invece lo tiene girato verso
                   il bersaglio come in ogni altro tiro, e con l'ordine YXZ il ribaltamento parte da li' —
                   quindi la figura viene fuori esatta ma voltata dalla parte sbagliata. Mezzo giro, e il
                   gesto legge come deve.
                   L'imbardata si CONGELA all'inizio del gesto invece di sommare mezzo giro a ogni
                   fotogramma: sommarlo a una `rotation.y` che il rig riscrive ogni frame funzionerebbe solo
                   finche' il rig la riscrive davvero, e basterebbe un fotogramma in cui non lo fa perche' il
                   giocatore cominci a girare su se stesso. In mezzo secondo di acrobazia il corpo non
                   ri-mira: e' anche piu' vero. */
                /* ⚠️ [7.597.0 — INDAGINE APERTA, e uno strumento che si guardava allo specchio]
                   COLLAUDO PO, SESTA segnalazione: «la rovesciata e' al contrario». Il criterio e' il suo:
                   nella rovesciata il giocatore ha le SPALLE alla porta, quindi l'angolo fra la direzione
                   in cui e' voltato e la direzione della porta deve stare vicino a 180.
                   IL DIFETTO E' CONFERMATO E MISURATO su tre scene di rovesciata (gi1, gi41, gi68), col
                   mezzo giro REVOCATO in prova: 12°, 19°, 57°. Il giocatore guarda la porta. Col mezzo
                   giro attivo, su gi1: 37°. La guarda lo stesso. Ne' con ne' senza.
                   ⚠️ E UNA MISURA MIA VA BUTTATA: avevo concluso «il mezzo giro arriva alla mesh, 180°
                   esatti» leggendo `_rovY569` e `rotation.y` DENTRO questo blocco — cioe' misurando la mia
                   stessa scrittura un istante dopo averla fatta. Lo strumento si guardava allo specchio.
                   Letta dalla mesh a fine fotogramma (`__CPM_STATE().players`), l'imbardata NON e' quella
                   che scrivo qui: qualcuno la riscrive dopo. Quello e' il filo da tirare, e finche' non so
                   CHI non tocco l'imbardata — cinque release fa ho gia' aggiunto mezzo giro «scegliendo il
                   segno guardando, non calcolando», ed e' cosi' che si arriva alla sesta segnalazione.
                   IL COMPORTAMENTO RESTA QUELLO DEL 7.569: revocarlo non migliora (12-19-57 contro 37 sono
                   scene diverse, non un confronto), e togliere codice senza una misura che lo condanni e'
                   un'altra scommessa. Si tocca quando si sa. */
                /* [7.611.0 SOLO COLLAUDO] IL TESTIMONE SULL'IMBARDATA: chi riscrive hero.rotation.y
                   durante l'acrobazia. Il PO l'ha segnalata SETTE volte e il mio strumento precedente si
                   guardava allo specchio (leggeva dentro il blocco che scrive). Qui si intercetta la
                   PROPRIETA' stessa: ogni scrittura fra l'inizio e la fine del gesto finisce nel registro
                   con il valore e l'impronta della pila. Costo zero senza bandiera. */
                if(typeof window!=='undefined'&&window.__CPM_ROV611&&!hero._rov611){hero._rov611=1;try{
                  const _eu=hero.rotation;let _val=_eu.y;
                  Object.defineProperty(_eu,'y',{configurable:true,get(){return _val;},set(v){
                    /* ⚠️ [7.681.0 — IL REGISTRO NON DISTINGUEVA DENTRO E FUORI DAL GESTO. Rileggendolo a
                       freddo: il testimone si arma UNA volta e da li' registra per sempre, anche la corsa
                       normale dopo l'acrobazia. Cosi' «43 scritture di animOne contro 25 del blocco» non
                       dice niente — le 43 possono essere tutte successive al gesto. Ora ogni scrittura porta
                       con se' se il LUCCHETTO era attivo (`L`) e l'avanzamento del gesto (`u`): senza quei
                       due campi il conteggio e' un numero che sembra una prova e non lo e'. */
                    try{const R=window.__CPM_ROV611;if(R.length<400){const st=(new Error()).stack||'';
                      const _now611=(typeof performance!=='undefined'?performance.now():0);
                      const _L611=!!(hero._yawLock611&&(_now611-hero._yawLock611)<300);
                      R.push({v:+(+v).toFixed(2),L:_L611?1:0,u:+(+u).toFixed(2),st:st.split('\n')[2]?String(st.split('\n')[2]).slice(0,90):'?'});}}catch(_e){}
                    _val=v;if(_eu._onChangeCallback)_eu._onChangeCallback();}});
                }catch(_e){}}
                if(sr.current._rovY569==null||u<0.06)sr.current._rovY569=hero.rotation.y||0;
                /* [7.611.0 — DURANTE L'ACROBAZIA L'IMBARDATA HA UN SOLO PADRONE, rosso __CPM_NO611]
                   COLLAUDO PO, SETTIMA segnalazione: «rovesciata al contrario, il piede che calcia deve
                   stare in direzione della porta». Il testimone sulla PROPRIETA' (Object.defineProperty su
                   rotation.y, che il mio strumento precedente non aveva: si guardava allo specchio) ha
                   nominato i colpevoli in una riga: 22 scritture da QUESTO blocco e 21 da animOne, a
                   PING-PONG a ogni fotogramma (7,12 · 6,93 · 7,12 · 6,93...). Il mezzo giro del 7.569
                   veniva scritto e mezzo disfatto dal facing di corsa, ogni fotogramma, per tutto il
                   gesto: SESTA istanza della patologia della giornata. Qui si arma un lucchetto a tempo;
                   animOne lo rispetta (vedi la sua nota). */
                hero._yawLock611=(typeof performance!=='undefined')?performance.now():1;
                /* ⚠️ [7.611.0 — IL MEZZO GIRO DEL 7.569 ERA LUI IL DIFETTO: REVOCATO, con la prova]
                   COLLAUDO PO, SETTIMA segnalazione: «rovesciata al contrario, il piede che calcia deve
                   stare in direzione della porta». La prova e' arrivata in due pezzi, entrambi misurati:
                   (1) il testimone sulla PROPRIETA' rotation.y (Object.defineProperty) ha mostrato un
                   PING-PONG a ogni fotogramma fra questo blocco e animOne (22 contro 21 scritture,
                   7,12 · 6,93 · 7,12 · 6,93...): il facing di corsa disfaceva il mezzo giro ogni frame —
                   sesta istanza di «piu' autorita' sulla stessa grandezza», curata col lucchetto qui sotto;
                   (2) col lucchetto attivo il testimone ha mostrato la cattura pre-gesto PULITA: 3,74 rad,
                   cioe' GIA' spalle alla porta — il rig arrivava al gesto orientato bene, e il +Math.PI
                   di questo rammento lo girava verso la porta. Cinque release di correzioni (7.551, 7.553,
                   7.560, 7.569, 7.597) hanno inseguito un difetto che era stato INTRODOTTO qui, e ognuna
                   misurava col ping-pong attivo che rendeva ogni braccio uguale all'altro.
                   Il mezzo giro muore; resta la cattura (per il freeze del gesto) e il lucchetto.
                   MISURATO dopo la sola revoca, col lucchetto attivo: ancora 37° e 30° — la revoca
                   toglieva il danno ma da sola non bastava; il dovere (spalle alla porta, ~180°) arriva
                   col set assoluto qui sotto. __CPM_ROV_MEZZOGIRO lo riaccende per i provini. */
                if(typeof window!=='undefined'&&window.__CPM_ROV_MEZZOGIRO)hero.rotation.y=sr.current._rovY569+Math.PI;
                /* [7.611.0 — LA ROVESCIATA SI GIRA DA SOLA, IN ASSOLUTO. Rosso __CPM_NO611B]
                   Ultimo pezzo, e chiude il cerchio: tolto il mezzo giro e fermato il ping-pong, la misura
                   sui fotogrammi freschi diceva ANCORA 37°/30° — perche' l'eroe ENTRA nel gesto guardando
                   la porta (animOne lo stava portando sul pallone) e senza scrittori resta cosi'. Un
                   mezzo giro RELATIVO era la risposta sbagliata a prescindere: dipendeva da come arrivavi.
                   Qui l'imbardata si fissa in ASSOLUTO, spalle alla porta, dalla posizione vera del
                   giocatore — il criterio dettato dal PO alla settima segnalazione. Convenzione di mk:
                   fx=sin(ry) e' la componente x di gioco, fy=-cos(ry) la y. Spalle alla porta (100,50):
                   sin(ry)=-(100-gx)/n, cos(ry)=(50-gy)/n.
                   MISURATO (sonda 596 con filtro freschezza t611, solo fotogrammi del gesto):
                   gi1 180°, gi41 180°, gi68 180° dal facing alla porta — prima: 38°, 30°, 96°. */
                if(!(typeof window!=='undefined'&&window.__CPM_NO611B)){
                  const _gx611=(hero.position.x+50),_gy611=(hero.position.z/0.68+50);
                  hero.rotation.y=Math.atan2(-(100-_gx611),(50-_gy611));
                }
                /* [7.569.0] IL SEGNO SI E' SCELTO GUARDANDO, non calcolando: con l'ordine YXZ i due versi
                   danno due gesti diversi e riconoscibili. +1 stende il corpo di fianco (testa da una parte,
                   piedi dall'altra, a terra). -1 da' la sagoma vera della rovesciata: TESTA BASSA, gambe in
                   alto, il piede che colpisce sul pallone e rivolto verso la porta — che e' esattamente il
                   criterio che il PO ha dettato. La manopola resta per i provini futuri. */
                const _sg569=(typeof window!=='undefined'&&window.__CPM_ROV_SGN)?(+window.__CPM_ROV_SGN||-1):-1;
                hero.rotation.x=1.5*sw*_sg569;if(hero._ring553)hero._ring553.rotation.x=Math.PI/2-1.5*sw*_sg569;}/* [7.560.0 — collaudo PO «rovesciata al contrario», QUINTA segnalazione, la seconda dopo un mio rimedio. Il 7.553 aveva messo la rotazione del corpo intero sull'asse giusto (X) ma con il VERSO sbagliato, e stavolta lo dice una fotografia, non un conto: al culmine del salto l'eroe ha la TESTA IN ALTO e le GAMBE IN BASSO — un tuffo in avanti, non una rovesciata. In una rovesciata vera al momento del colpo la testa e' bassa, vicino al terreno, e il piede che colpisce e' alto. Il segno si inverte, e l'aureola compensa nell'altro verso per restare in piano. *//* [7.553.0] l'aureola resta in piano mentre il corpo gira: e' un segno di regia, non una parte del corpo */
              if(_CPM_TEST&&typeof window!=='undefined'){try{window.__CPM_VOLLEY={u:+u.toFixed(2),acro:1,t611:(typeof performance!=='undefined'?Math.round(performance.now()):0),rx:+(hero.rotation.x||0).toFixed(2),lR:+hero._lR.rotation.x.toFixed(2),tx:+((hero._torso&&hero._torso.rotation.x)||0).toFixed(2),ty:+((hero._torso&&hero._torso.rotation.y)||0).toFixed(2),y:+hero.position.y.toFixed(2),lR:+hero._lR.rotation.x.toFixed(2)};}catch(_e){}} /* [7.553 sonda] TESTIMONE DELLA ROVESCIATA, DOPO LE ASSEGNAZIONI. La prima stesura leggeva PRIMA, e restituiva i valori che `animOne` aveva lasciato all'inizio del fotogramma: salto 0,05 e gamba 0,22 al posto di 1,8 e -3,2. Un testimone messo nel punto sbagliato non misura il gesto, misura chi lo precede. */
              }
            }else if(P.hlVariant==="shot_curled"){// tiro a giro: rotazione anca pronunciata, interno collo-piede
              hero._lR.rotation.x=-2.6*sw;hero._lL.rotation.x=0.6*sw;hero._aL.rotation.x=1.2*sw;hero._aR.rotation.x=-0.4*sw;hero.rotation.y=Math.sin(u*Math.PI)*0.45;if(hero._torso)hero._torso.rotation.y=sw*0.4;
            }else if(P.hlVariant==="shot_first_time"){// colpo di prima/tap-in: kick breve e immediato, nessun caricamento
              hero._lR.rotation.x=-2.0*sw;hero._lL.rotation.x=0.4*sw;hero._aL.rotation.x=0.6*sw;hero._aR.rotation.x=-0.3*sw;if(hero._torso)hero._torso.rotation.y=sw*0.12;
            }else if(P.hlVariant==="shot_one_on_one"){// 1v1: tiro piazzato controllato, leggero avanzamento verso portiere
              hero._lR.rotation.x=-2.4*sw;hero._lL.rotation.x=0.6*sw;hero._aL.rotation.x=1.0*sw;hero._aR.rotation.x=-0.4*sw;hero.position.y=sw*0.1;if(hero._torso)hero._torso.rotation.y=sw*0.2;
            }else{// shot_power default: kick potente, pieno follow-through
              hero._lR.rotation.x=-2.8*sw;hero._lL.rotation.x=0.7*sw;hero._aL.rotation.x=1.1*sw;hero._aR.rotation.x=-0.5*sw;if(hero._torso)hero._torso.rotation.y=sw*0.25;
            }
          }
          else if(actType==="cross"){
            if(P.hlVariant==="cross_cutback"){// rimorchio dal fondo: corpo girato, passaggio all'indietro
              hero._lR.rotation.x=-1.5*sw;hero.rotation.y=Math.sin(u*Math.PI)*(-0.85);hero._aL.rotation.x=0.6*sw;hero._aR.rotation.x=0.3*sw;hero._lL.rotation.x=0.5*sw;
            }else if(P.hlVariant==="cross_low_driven"){// cross basso/teso: swing orizzontale, nessun follow-through alto
              hero._lR.rotation.x=-2.4*sw;hero.rotation.y=Math.sin(u*Math.PI)*0.35;hero._aL.rotation.x=0.7*sw;hero._aR.rotation.x=-0.4*sw;hero._lL.rotation.x=0.3*sw;
            }else{// near_post/far_post: swing pieno + rotazione corpo (default)
              hero._lR.rotation.x=-2.2*sw;hero.rotation.y=Math.sin(u*Math.PI)*0.55;hero._aL.rotation.x=0.8*sw;hero._aR.rotation.x=-0.3*sw;hero._lL.rotation.x=0.4*sw;
            }
          }
          else if(actType==="penalty"){
            const _ku=u<0.35?u/0.35:1;
            if(P.hlVariant==="penalty_panenka"){// cucchiaio/Panenka: tocco delicatissimo, nessuna potenza, salto minimo
              hero._lR.rotation.x=-1.6*Math.sin(_ku*Math.PI);hero._lL.rotation.x=0.5*sw;hero._aL.rotation.x=0.8*sw;hero._aR.rotation.x=-0.3*sw;hero.position.y=sw*0.1;if(hero._torso)hero._torso.rotation.y=sw*0.12;
            }else{// rigore normale: rincorsa caricata + kick potente
              hero._lR.rotation.x=-3.2*Math.sin(_ku*Math.PI);hero._lL.rotation.x=0.8*sw;hero._aL.rotation.x=1.3*sw;hero.position.y=sw*0.2;if(hero._torso)hero._torso.rotation.y=sw*0.3;
            }
          }
          else if(actType==="freekick"){hero._lR.rotation.x=-2.5*sw;hero._lL.rotation.x=0.6*sw;hero._aL.rotation.x=1.4*sw;hero._aR.rotation.x=-0.7*sw;hero.position.y=sw*0.15;}
          else if(actType==="header"){
            if(P.hlVariant==="header_diving"){// tuffo rasoterra: salto basso, braccia tese in avanti, torso inclinato
              hero.position.y=sw*0.85;if(hero._hd)hero._hd.rotation.x=sw*1.2;hero._aL.rotation.x=-2.8*sw;hero._aR.rotation.x=-2.8*sw;if(hero._torso)hero._torso.rotation.x=sw*0.45;
            }else if(P.hlVariant==="header_far_post"){// secondo palo: salto più alto, corpo ruota verso il palo lontano
              hero.position.y=sw*2.5;if(hero._hd)hero._hd.rotation.x=sw*0.8;hero._aL.rotation.x=-2.2*sw;hero._aR.rotation.x=-2.2*sw;hero.rotation.y=Math.sin(u*Math.PI)*0.4;
            }else{// near_post default: salto standard + nod testa
              hero.position.y=sw*2.2;if(hero._hd)hero._hd.rotation.x=sw*0.7;hero._aL.rotation.x=-2.0*sw;hero._aR.rotation.x=-2.0*sw;
            }
          }
          else if(actType==="tackle"){
            /* [7.242.0 gi34 «Non si vede il gesto tecnico specifico»] tre pose per le tre famiglie
               difensive (defGesto bakato in S()): slide = scivolata a terra (storica) · lunge =
               AFFONDO in piedi, gamba tesa sulla linea e braccia larghe da equilibrio (intercetto/
               anticipo/muro/deviazione) · press = ADDOSSO al portatore, busto avanti e braccio a
               schermare, tocco di punta sul pallone (pressing/finta/recupero). Tutto scalato da sw
               (auto-azzerante), fallito = perdita d'equilibrio comune (leggibile per tutte). */
            {const _dg42=(sr.current._dgFar440===P.hlSitKey)?'press':P.hlDefGesto,_fl42=(P.hlSuccess===true)?0:1;/* [gi146] famiglia degradata a press quando il gesto e' partito con la palla oltre 6,5u (vedi latch 7.420) */
              /* [7.243.0 batch PO «non si vede il gesto tecnico» sui FALLITI] il TENTATIVO è lo stesso gesto
                 del successo — nel calcio la scivolata fallita è comunque una scivolata: la posa famiglia vale
                 per entrambi gli esiti, il fallimento aggiunge lo SBILANCIAMENTO (yaw wobble) e l'esito lo
                 racconta la palla che prosegue col portatore. Prima il fail cadeva nel vacillamento generico. */
              /* [7.244.0] inviluppo a TENUTA: salita rapida (0-0.18), posa TENUTA (0.18-0.72 ≈0.9s a terra),
                 recupero morbido (0.72-1). Auto-azzerante a u=1 come il seno — nessun cleanup nuovo. */
              const _swH=u<0.18?Math.sin((u/0.18)*Math.PI/2):(u<0.72?1:Math.max(0,Math.cos(((u-0.72)/0.28)*Math.PI/2)));
              const _wb42=Math.sin(u*Math.PI*2)*0.26*_fl42;
              if(_dg42==="lunge"){hero.rotation.z=0.55*_swH;hero.position.y=-0.18*_swH;hero._lR.rotation.x=2.0*_swH;hero._lR.rotation.z=0.5*_swH;hero._aL.rotation.z=-0.9*_swH;hero._aR.rotation.z=0.9*_swH;hero.rotation.y=_wb42;}
              else if(_dg42==="press"){hero.rotation.z=0.25*_swH+0.2*_swH*_fl42;hero.position.y=-0.06*_swH;hero._aR.rotation.x=-1.1*_swH;hero._aR.rotation.z=0.55*_swH;hero._aL.rotation.x=0.4*_swH;hero._lR.rotation.x=1.0*_swH;hero.rotation.y=Math.sin(u*Math.PI)*0.22+_wb42;}
              else if(_dg42==="slide"){hero.rotation.z=1.4*_swH;hero.position.y=-0.35*_swH;hero._lR.rotation.x=2.4*_swH;hero._lL.rotation.x=-0.8*_swH;hero.rotation.y=_wb42;}
              /* [7.361.0] AERIAL = STACCO: si SALE, non si scende. La y positiva passa anche al root CH38
                 (quella negativa no, per il fix 7.246 sulle pose che affondavano nel prato), quindi il salto
                 si vede in entrambe le modalita'. Braccia in alto per l'equilibrio, gambe raccolte. */
              else if(_dg42==="aerial"){hero.position.y=1.15*_swH;hero._aL.rotation.x=-1.5*_swH;hero._aR.rotation.x=-1.5*_swH;hero._aL.rotation.z=-0.5*_swH;hero._aR.rotation.z=0.5*_swH;hero._lR.rotation.x=-0.55*_swH;hero._lL.rotation.x=0.25*_swH;hero.rotation.x=-0.18*_swH;hero.rotation.y=_wb42;}
              /* [7.361.0] CALL = CHIAMATA: il corpo NON fa niente di tecnico — resta in piedi, gira il busto
                 verso il compagno e alza il braccio a indicare. Nessuna y, nessun rollio: era esattamente il
                 tuffo di troppo che il PO vedeva su «Chiama il portiere». */
              else if(_dg42==="call"){hero._aR.rotation.x=-2.3*_swH;hero._aR.rotation.z=0.4*_swH;hero._aL.rotation.x=0.3*_swH;hero.rotation.y=Math.sin(u*Math.PI)*0.42+_wb42;}
              else if(P.hlSuccess===true){hero.rotation.z=1.4*_swH;hero.position.y=-0.35*_swH;hero._lR.rotation.x=2.4*_swH;hero._lL.rotation.x=-0.8*_swH;}// tackle senza famiglia: scivolata storica (stessa tenuta)
              else{hero.rotation.z=0.8*_swH;hero.position.y=-0.12*_swH;hero._lR.rotation.x=1.5*_swH;hero._lL.rotation.x=-0.3*_swH;hero.rotation.y=Math.sin(u*Math.PI*2)*0.28;}// fail generico storico (nessuna famiglia)
            }
          }
          else if(actType==="dribble"){
            if(P.hlVariant==="dribble_inside"){// rientro interno: anca che entra, corpo si inclina verso l'interno
              hero.rotation.z=Math.sin(u*Math.PI*3)*0.5;hero.rotation.y=Math.sin(u*Math.PI*2)*0.45;hero._lR.rotation.x=Math.sin(u*Math.PI*2)*0.8;
            }else if(P.hlVariant==="dribble_outside"){// sterzata esterna: corpo si apre verso l'esterno, piede fuori
              hero.rotation.z=Math.sin(u*Math.PI*3)*(-0.42);hero.rotation.y=Math.sin(u*Math.PI*2)*(-0.38);hero._lL.rotation.x=Math.sin(u*Math.PI*2)*0.7;
            }else{// feint default: oscillazione doppia (finta-contro-finta)
              hero.rotation.z=Math.sin(u*Math.PI*3)*0.35;hero.rotation.y=Math.sin(u*Math.PI*2)*0.28;
            }
          }
          else if(actType==="pass"){hero._aL.rotation.x=-1.8*sw;hero._aL.rotation.z=-0.5*sw;hero._aR.rotation.x=0.6*sw;hero.rotation.y=Math.sin(u*Math.PI)*0.32;hero._lR.rotation.x=0.5*sw;}
          else if(actType==="build"){// costruzione/neutro: breve gesto di passaggio corto, nessuna potenza
            hero._aL.rotation.x=-0.9*sw;hero._aR.rotation.x=0.3*sw;hero.rotation.y=Math.sin(u*Math.PI)*0.2;hero._lR.rotation.x=0.3*sw;
          }
          // 3D-LOCO (Sprint B): wind-up — breve caricamento all'indietro della gamba calciante prima dello
          //   swing (i tiri/cross/punizioni guadagnano anticipo fisico). Additivo, svanisce entro u=0.22 → 0 a fine azione, nessun cleanup.
          if(u<0.22&&(actType==="shot"||actType==="cross"||actType==="penalty"||actType==="freekick")){
            hero._lR.rotation.x+=(0.22-u)/0.22*0.7;
          }
          if(u>=1){if(typeof window!=='undefined'&&window.__CPM_VITA512!==undefined){try{window.__CPM_VITA512.push({g:actType,v:+actT.toFixed(2)});}catch(_e){}}/* armamento col flag DEDICATO (pattern BGSYNC): armarlo con __CPM_REC accendeva anche lo scrittore per-frame di __CPM_ARC (r.~12687) che sovrascrive il testimone degli archi usato da questo stesso guardiano *//* [7.512.0 R2] testimone della VITA del gesto, sulla riga dove muore: la sonda dagli effetti (salto, arti) non discriminava — il rosso 7.467 e il verde davano la stessa finestra. Si misura dove il numero vive. */actType=null;if(hero._hd)hero._hd.rotation.x*=0.7;if(hero._torso){hero._torso.rotation.x=0;}}
        }
        // 3DV-4: barriera freekick — i 3 giocatori più vicini saltano
        sr.current.players.forEach(pp=>{if(pp.mesh&&pp.mesh._wallJumpT!=null&&pp.mesh._wallJumpT>=0){pp.mesh._wallJumpT+=aDt;const wu=Math.min(pp.mesh._wallJumpT/0.55,1),wsw=Math.sin(wu*Math.PI);pp.mesh.position.y=wsw*1.5;pp.mesh._aL.rotation.x=-wsw*1.6;pp.mesh._aR.rotation.x=-wsw*1.6;if(wu>=1){pp.mesh.position.y=0;pp.mesh._wallJumpT=null;}}});
        // 3DV-14b: animazione "riceve e tira" del compagno nel triangolo (passaggio → assist_shot)
        sr.current.players.forEach(pp=>{if(pp.mesh&&pp.mesh._rcvT!=null&&pp.mesh._rcvT>=0){pp.mesh._rcvT+=aDt;const ru=Math.min(pp.mesh._rcvT/0.52,1),rsw=Math.sin(ru*Math.PI);
          /* [7.527.0 collaudo PO ×2 «il compagno ha tirato/segnato con il corpo ALL'INDIETRO rispetto alla
             porta» (#47/#163)] IL FINALIZZATORE GUARDA LA PORTA. Questo canale (riceve-e-tira, 3DV-14b)
             congela di proposito il driver di corsa — ma nessuno girava la mesh: restava la rotazione
             dell'ultima corsa (5.43.11), e chi arrivava incontro al pallone concludeva di spalle. Stessa
             cura dell'aim-latch 7.517 dell'eroe: slerp rapido verso lo specchio (48,0) durante il gesto.
             Rosso __CPM_NO531 = niente rotazione (comportamento storico). */
          const _err531=()=>{const _b=Math.atan2(48-pp.mesh.position.x,0-pp.mesh.position.z);let _e=_b-pp.mesh.rotation.y;while(_e>Math.PI)_e-=2*Math.PI;while(_e<-Math.PI)_e+=2*Math.PI;return Math.abs(_e);};
          if(typeof window!=='undefined'&&window.__CPM_FIN531!==undefined&&pp.mesh._e0531==null){try{pp.mesh._e0531=_err531();}catch(_e2){}}/* errore a INIZIO gesto: la prova del rosso e' «nessuna correzione» (e1≈e0), robusta a ogni direzione d'arrivo — il rosso a 14° su chi arrivava gia' girato l'ha insegnato */
          if(!(typeof window!=='undefined'&&window.__CPM_NO531)){const _ty531=Math.atan2(48-pp.mesh.position.x,0-pp.mesh.position.z);let _dy531=_ty531-pp.mesh.rotation.y;while(_dy531>Math.PI)_dy531-=2*Math.PI;while(_dy531<-Math.PI)_dy531+=2*Math.PI;pp.mesh.rotation.y+=_dy531*Math.min(1,aDt*9);}
          if(typeof window!=='undefined'&&window.__CPM_FIN531!==undefined&&ru>=0.5&&!pp.mesh._f531){pp.mesh._f531=1;try{window.__CPM_FIN531.push({e0:+(pp.mesh._e0531||0).toFixed(2),e1:+_err531().toFixed(2)});}catch(_e2){}}
          pp.mesh._lR.rotation.x=-rsw*2.6;pp.mesh._lL.rotation.x=rsw*0.7;pp.mesh._aL.rotation.x=rsw*1.2;pp.mesh._aR.rotation.x=-rsw*0.4;pp.mesh.position.y=rsw*0.35;if(ru>=1){pp.mesh.position.y=0;pp.mesh._lR.rotation.x=0;pp.mesh._lL.rotation.x=0;pp.mesh._rcvT=null;pp.mesh._runToX=null;pp.mesh._runToZ=null;pp.mesh._f531=0;pp.mesh._e0531=null;}}});
        // 5.43.2: compagno che fa il MOVIMENTO VERTICALE su passaggio FALLITO — corre in profondità (run-cycle reale) anche se la palla viene intercettata
        sr.current.players.forEach(pp=>{if(pp.mesh&&pp.mesh._failRunT!=null&&pp.mesh._failRunT>=0){pp.mesh._failRunT+=aDt;if(pp.mesh._runToX!=null){const _rtz=(pp.mesh._runToZ!=null?pp.mesh._runToZ:pp.mesh.position.z);animOne(pp.mesh,pp.mesh._runToX,_rtz,aDt,ak,pp.mesh._runToX,_rtz);}if(pp.mesh._failRunT>=1.05){pp.mesh._failRunT=null;pp.mesh._runToX=null;pp.mesh._runToZ=null;}}});
      /* [7.523.0 — IL PORTATORE: direttiva PO priorita' ALTISSIMA «il pallone e' scollegato dall'azione,
         INGUARDABILE»] MISURATO prima del rimedio: in cronaca la palla ha un giocatore entro 3u solo nel
         32,0% dei campioni (mediana della distanza dal piu' vicino: 4,3u) — due terzi del tempo rotola nel
         vuoto, perche' in `playing` NESSUN sistema possiede la palla: i giocatori seguono la formazione,
         la palla logica deriva (R1), gli archi del testo volano verso punti di zona vuoti. Qui nasce il
         modello: OGNI fotogramma di cronaca ha un PORTATORE (la mesh di movimento del lato in possesso piu'
         vicina alla palla logica, con isteresi 2u), che CORRE sulla palla col canale dedicato _carry526
         (de-registrato dal driver di formazione, pattern _failRunT) — e la palla, quando lo raggiunge, gli
         si incolla ai piedi (blocco palla, scrittore 'portatore'). I passaggi del testo mirano a RICEVENTI
         reali (consumer bgAction) e a fine volo il ricevente diventa il nuovo portatore. __CPM_NO526=rosso. */
      if(_curPh==='playing'&&!(typeof window!=='undefined'&&window.__CPM_NO526)&&!P.ceremony&&!P.shootout&&!replaying){
        const _lbx6=G2X(P.ballX||50),_lbz6=G2Z(P.ballY||50);
        const _lato6=sr.current._lato526||'home';
        /* [taratura 4 — PALLA VAGANTE: la gioca chi e' piu' vicino] La diagnosi per-fotogramma ha inchiodato
           il plateau (52%): nei frame scoperti il portatore CORRE (canale attivo 79%) ma e' a mediana 7,9u,
           p90 29,6 — la palla deriva dove il lato in possesso non ha uomini, mentre i PRESSATORI avversari
           le sono gia' addosso per AI. Regola calcistica: preferenza al lato in possesso entro 12u,
           altrimenti il piu' vicino di CHIUNQUE (contrasto/anticipo visivo); il lato del portatore diventa
           il suo. Tick logico intatto: matchPlayers ha Math.random e ancorarvi la deriva romperebbe il replay. */
        let _bm6=null,_bd6=1e9,_bmAny6=null,_bdAny6=1e9,_anySide6=null;
        sr.current.players.forEach((pp,ii)=>{const src=all[ii];if(!src||src.gk)return;
          const _m=pp.mesh;if(!_m)return;const _d=Math.hypot(_m.position.x-_lbx6,_m.position.z-_lbz6);
          if(_d<_bdAny6){_bdAny6=_d;_bmAny6=_m;_anySide6=(src.team==='away')?'away':'home';}
          if((_lato6==='away')!==(src.team==='away'))return;
          if(_d<_bd6){_bd6=_d;_bm6=_m;}});
        if(_bd6>12&&_bmAny6&&_bdAny6<_bd6){_bm6=_bmAny6;_bd6=_bdAny6;sr.current._lato526=_anySide6;}
        /* [taratura 2] L'EROE e' portatore SOLO se e' gia' sulla palla (<3u): non ha il canale di corsa
           (driver logico suo) e sceglierlo da lontano lasciava la palla non accudita — misurato 47-49%. */
        if(_lato6==='home'&&hero&&hero.visible&&!P.hlDef){const _dh6=Math.hypot(hero.position.x-_lbx6,hero.position.z-_lbz6);if(_dh6<3&&_dh6<_bd6){_bd6=_dh6;_bm6=hero;}}
        /* [7.556.0 P2] il passatore DICHIARATO batte l'indovinello finche' e' plausibilmente sulla palla
           (12u): l'isteresi qui sotto protegge un portatore *eletto*, questo protegge un portatore *detto*. */
        {const _at6=sr.current._att556;
         if(_at6&&!(typeof window!=='undefined'&&window.__CPM_NO556)){
           const _da6=Math.hypot(_at6.position.x-_lbx6,_at6.position.z-_lbz6);
           if(_da6<12){_bm6=_at6;_bd6=_da6;} else sr.current._att556=null;}}
        const _cur6=sr.current._por526;
        if(_cur6&&_cur6.mesh&&_cur6.mesh!==_bm6&&_cur6.lato===_lato6){
          const _dc6=Math.hypot(_cur6.mesh.position.x-_lbx6,_cur6.mesh.position.z-_lbz6);
          if(_bd6>_dc6-2){_bm6=_cur6.mesh;_bd6=_dc6;}/* isteresi: il portatore non sfarfalla */}
        sr.current._por526=_bm6?{mesh:_bm6,lato:_lato6}:null;
        if(_bm6&&_bm6!==hero&&!ballArcActive){
          const _pv6=_bm6._pp526;if(_pv6){_bm6._pvx526=(_bm6.position.x-_pv6.x)/Math.max(aDt,0.001);_bm6._pvz526=(_bm6.position.z-_pv6.z)/Math.max(aDt,0.001);}
          _bm6._pp526={x:_bm6.position.x,z:_bm6.position.z};
          const _bp6=sr.current.ball;
          /* [taratura 3 — LA CONDUZIONE] Lontano dalla palla si corre sulla MESH (raggiungila); da
             INCOLLATO (<1,6u) si cammina verso il punto LOGICO: palla ai piedi e uomo viaggiano INSIEME
             col drift del possesso — senza questo, il portatore raggiungeva la palla, si fermava su di
             lei, il logico derivava via e il glue si staccava (ciclo attacca/stacca, plateau 49-52%). */
          const _db6c=_bp6?Math.hypot(_bp6.position.x-_bm6.position.x,_bp6.position.z-_bm6.position.z):99;
          if(_db6c<1.6){_bm6._carry526={x:_lbx6,z:_lbz6,t:0.4};}
          else{_bm6._carry526={x:_bp6?_bp6.position.x:_lbx6,z:_bp6?_bp6.position.z:_lbz6,t:0.4};}}
        if(typeof window!=='undefined'&&window.__CPM_POR526!==undefined){try{const _w=window.__CPM_POR526;_w.tot=(_w.tot||0)+1;const _bp=sr.current.ball;
          const _dcb=(_bp&&_bm6)?Math.hypot(_bp.position.x-_bm6.position.x,_bp.position.z-_bm6.position.z):null;
          if(_dcb!=null&&_dcb<=3)_w.acc=(_w.acc||0)+1;
          if((_w.tot%5)===0&&(_w.dg=_w.dg||[]).length<800)_w.dg.push({d:_dcb==null?-1:+_dcb.toFixed(1),h:_bm6===hero?1:0,l:_lato6==='away'?1:0,c:(_bm6&&_bm6._carry526)?1:0,dl:_bm6?+Math.hypot(_bm6.position.x-_lbx6,_bm6.position.z-_lbz6).toFixed(1):-1,db:_bp?+Math.hypot(_bp.position.x-_lbx6,_bp.position.z-_lbz6).toFixed(1):-1});
        }catch(_e){}}
      }
      sr.current.players.forEach(pp=>{const _m=pp.mesh;if(_m&&_m._carry526){_m._carry526.t-=aDt;
        animOne(_m,_m._carry526.x,_m._carry526.z,aDt,ak,_m._carry526.x,_m._carry526.z);
        if(_m._carry526&&_m._carry526.t<=0)_m._carry526=null;}});// 5.43.11: il compagno guarda la DIREZIONE DI CORSA (non la palla) → niente più "ballerino" che gira su se stesso
        // QW-C: esultanza post-gol eroe (braccia alzate + salto, 2.4s, sovrascrive actType)
        /* [7.371.0 direttiva PO «esultanze dopo i gol»] ESECUZIONE DELL'ESULTANZA.
           Cosa c'era prima: un salto verticale piu' uno swing di `hero._aL/_aR.rotation`. Sotto il CH38
           — cioe' nel renderer di DEFAULT — di quelle due cose se ne vedeva UNA: `animOne` ritorna
           subito sui mesh `_glbDriven` e le rotazioni degli arti procedurali non arrivano allo schermo.
           Il PO vedeva un saltello muto senza braccia, e l'ha letto come «esultanze non presenti».
           Ora l'esultanza si esprime in cose che il GLB RENDE: la CLIP (`lift` = braccia al cielo, la
           sola animazione di gioia che esista fra gli asset — la stessa dell'alzata del trofeo), la
           CORSA (locomozione vera, quindi anche gambe animate) e la POSIZIONE del corpo (salto,
           scivolata: sono quote, non rotazioni di arti). Le pose procedurali restano come rete per
           chi gioca GLB-OFF.
           Il moto passa da `animOne`: eredita inerzia, sterzata limitata e punta per giocatore (7.198),
           percio' non ci sono teletrasporti ne' inversioni istantanee (direttiva §9/§11). */
        /* [7.384.0 collaudo PO «le esultanze non funzionano»] IL PIANO PRIMA DEL CRONOMETRO.
           L'esultanza si arma dal cambio di `waveEvent` e legge il COME da `celebPlan`: sono due
           aggiornamenti di stato distinti, e il renderer vede l'onda per primo. Con `celebPlan` ancora
           nullo il blocco gira lo stesso ma senza clip, senza corsa e senza durata vera — e su una
           macchina lenta, dove pochi fotogrammi coprono l'intera esultanza, quei fotogrammi sono TUTTI:
           misurata una scena (gi0) con zero per cento di clip su otto fotogrammi, cioe' un'esultanza
           interamente muta. Ora il cronometro non parte finche' il piano non c'e', con un'attesa massima
           di 1,2 s oltre la quale si procede comunque: meglio l'esultanza povera di ieri che nessuna. */
        if(celebT>=0){celebT+=aDt;
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{/* [7.384.0] i canali CORPOREI misurati dove accadono: spostamento percorso e quota massima. Senza, «l'esultanza non si vede» resta un giudizio. */
            const _pp84=window.__CPM_CELPOS;if(_pp84){const _st84=Math.hypot(hero.position.x-_pp84[0],hero.position.z-_pp84[1]);window.__CPM_CELDX=(window.__CPM_CELDX||0)+_st84;window.__CPM_CELSTEP=Math.max(window.__CPM_CELSTEP||0,_st84);}
            window.__CPM_CELPOS=[hero.position.x,hero.position.z];
            window.__CPM_CELY=Math.max(window.__CPM_CELY||0,Math.abs(hero.position.y||0));
            window.__CPM_CELN=(window.__CPM_CELN||0)+1;}catch(_e){}}
          const _pl=(P.celebPlan||((typeof window!=='undefined'&&window.__CPM_NO392)?null:sr.current._celPlan393))||null,_cdur=(_pl&&_pl.dur)||2.4,_cdel=(_pl&&_pl.delay)||0;/* [7.393.0] prima il prop (fresco), poi la copia; l'interruttore di prova esclude la copia per dimostrare il rosso */
          const _cu=Math.min(celebT/_cdur,1);
          const _act=celebT>=_cdel;/* §9: prima si lascia finire il follow-through del tiro */
          const _cp1=Math.min(Math.max(celebT-_cdel,0)/0.5,1),_cp3=Math.min(Math.max(celebT-(_cdur-0.6),0)/0.6,1);
          /* [7.373.0 direttiva PO §7 «NON rendere automaticamente l'eroe protagonista di ogni gol»]
             QUANDO SEGNA UN COMPAGNO, IL PROTAGONISTA E' LUI. Il piano gia' distingueva `by:'mate'`
             (l'eroe ha fatto l'assist) ma a esultare era comunque l'eroe: la scena diceva una cosa e il
             tabellone un'altra. Il gesto del marcatore passa dal canale che esiste gia' per il compagno
             che conclude (`sr.current._mateFx` → `_mateWant` nella selezione delle clip), quindi non c'e'
             nessun sistema nuovo: e' lo stesso binario del compagno che riceve e tira.
             L'eroe, in quel caso, fa la parte che gli tocca davvero: gli CORRE INCONTRO. */
          const _scorer373=(_pl&&_pl.by==="mate")?(passTargetMesh&&passTargetMesh.parent?passTargetMesh:null):null;
          if(_act&&_scorer373&&_cu<0.9){try{sr.current._mateFx={mesh:_scorer373,name:"lift",t:0.6};}catch(_e373){}}
          /* (a) CLIP GLB — riusa il canale gia' esistente dell'alzata del trofeo */
          sr.current._celLift371=(_act&&_pl&&_pl.clip==="lift"&&!_scorer373&&_cu<((_pl&&_pl.quiet)?0.70:0.94))?1:0;/* [7.373.0] col gol del compagno le braccia al cielo sono SUE: l'eroe corre a raggiungerlo *//* [7.372.0] la versione SOBRIA tiene le braccia al cielo per meno tempo: con una sola clip di gioia la differenza fra esultare e contenersi la fanno durata e immobilita', non l'assenza del gesto */
          /* (b) CORSA verso la curva / i compagni / la bandierina. Il bersaglio resta DENTRO il campo e
                 lontano dai pali: una corsa non deve mai finire dentro la porta (§11). */
          if(_act&&_pl&&(_pl.run>0||_scorer373)){
            let _ctx371=null,_ctz371=null;
            if(_scorer373){/* [7.373.0] verso il marcatore, fermandosi ACCANTO a lui e non dentro */
              const _dx=_scorer373.position.x-hero.position.x,_dz=_scorer373.position.z-hero.position.z,_dd=Math.max(0.1,Math.hypot(_dx,_dz));
              const _k=Math.max(0,(_dd-2.4))/_dd;_ctx371=hero.position.x+_dx*_k;_ctz371=hero.position.z+_dz*_k;}
            const _sd371=(hero.position.z>=0)?1:-1;
            if(!_scorer373){/* [7.373.0] col marcatore-compagno il bersaglio e' gia' deciso: la catena per fascia/bandierina non deve sovrascriverlo */
            if(_pl.toward==="mates"){let _bd=1e9,_bm=null;
              sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];
                if(!src||src.team!=="home"||src.gk||!pp.mesh||pp.mesh===hero)return;
                const _d=Math.hypot(pp.mesh.position.x-hero.position.x,pp.mesh.position.z-hero.position.z);
                if(_d<_bd){_bd=_d;_bm=pp.mesh;}});
              if(_bm){const _dx=_bm.position.x-hero.position.x,_dz=_bm.position.z-hero.position.z,_dd=Math.max(0.1,Math.hypot(_dx,_dz));
                const _k=Math.max(0,(_dd-2.4))/_dd;/* ci si ferma ACCANTO al compagno, non dentro */
                _ctx371=hero.position.x+_dx*_k;_ctz371=hero.position.z+_dz*_k;}}
            else if(_pl.toward==="corner"){_ctx371=Math.min(hero.position.x+_pl.run,GOAL_LINE_X-6);_ctz371=_sd371*Math.min(Math.abs(hero.position.z)+8,26);}
            else{/* curva: verso la linea di fondo avversaria, ma MAI nella bocca della porta */
              _ctx371=Math.min(hero.position.x+_pl.run,GOAL_LINE_X-7);
              _ctz371=(Math.abs(hero.position.z)<5.5)?_sd371*7:hero.position.z;}
            }
            if(_ctx371!=null){_ctx371=clamp(_ctx371,-GOAL_LINE_X+6,GOAL_LINE_X-6);_ctz371=clamp(_ctz371,-27,27);
              animOne(hero,_ctx371,_ctz371,aDt,ak,_ctx371,_ctz371);}}
          /* (c) CORPO — quota: salto e scivolata si vedono anche col GLB (sono posizione) */
          const _jmp=(_pl&&_pl.jump)?_pl.jump:((_pl&&_pl.run>0)?0:((_pl&&_pl.quiet)?0.35:1.2));
          if(_act&&!(_pl&&_pl.slide))hero.position.y=Math.sin(Math.min(Math.max(celebT-_cdel,0)/0.5,1)*Math.PI)*_jmp*(1-_cp3);
          else if(_act&&_pl&&_pl.slide)hero.position.y=-0.35*Math.min(Math.max(celebT-_cdel,0)/0.35,1)*(1-_cp3);/* ginocchia: il corpo si abbassa */
          /* (d) rete di sicurezza GLB-OFF: la posa procedurale di sempre */
          hero._aL.rotation.x=-2.2*Math.min(_cp1,1-_cp3*0.8);hero._aR.rotation.x=-2.2*Math.min(_cp1,1-_cp3*0.8);
          hero._aL.rotation.z=-0.5+Math.sin(celebT*4)*0.4;hero._aR.rotation.z=0.5-Math.sin(celebT*4)*0.4;
          /* (e) REAZIONE DEI COMPAGNI — progressiva, MAI tutti insieme (§10). Chi parte e quando dipende
                 dalla DISTANZA: il vicino si muove quasi subito, il lontano parte tardi e semplicemente
                 non fa in tempo ad arrivare, invece di comparire dal nulla accanto al marcatore. */
          if(_act&&_pl&&_pl.heat>=1){
            sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];
              if(!src||src.team!=="home"||src.gk||!pp.mesh||pp.mesh===hero)return;
              const _dx=hero.position.x-pp.mesh.position.x,_dz=hero.position.z-pp.mesh.position.z,_d=Math.hypot(_dx,_dz);
              if(_d>26||_d<3)return;/* troppo lontano: non arriverebbe mai — resta dov'e' */
              const _start=_cdel+0.12+_d*0.035;/* scaglionamento per distanza */
              if(celebT<_start||_cu>=0.95)return;
              const _k=Math.max(0,(_d-2.6))/Math.max(0.1,_d);/* si fermano ATTORNO, non dentro il marcatore */
              const _tx=pp.mesh.position.x+_dx*_k,_tz=pp.mesh.position.z+_dz*_k;
              pp.mesh._celT371=1;animOne(pp.mesh,_tx,_tz,aDt,ak,_tx,_tz);});}
          if(_cu>=1&&typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_CELDONE84=1;}catch(_e84){}}/* [7.384.0] il gioco DICHIARA la fine dell'esultanza: una sonda che aspetta a orologio non sa quanto tempo-scena abbia comprato */
          if(_cu>=1){celebT=-1;hero.position.y=0;sr.current._celPlan393=null;hero._aL.rotation.x=0;hero._aR.rotation.x=0;hero._aL.rotation.z=0;hero._aR.rotation.z=0;sr.current._celLift371=0;
            sr.current.players.forEach(pp=>{if(pp.mesh)pp.mesh._celT371=0;});}// [6.76.0 LMV-A4] assegnamenti assoluti → cleanup esplicito
          actType=null;}
        // 5.49.23: CERIMONIA TROFEO sul campo — eroe alza il trofeo, coriandoli su tutto il campo, fuochi d'artificio, compagni in festa
        // [6.88.0 collaudo PO «maggiore scenografia all'ingresso»] FINALE/big match massimo: fuochi d'artificio
        //   già durante l'INGRESSO in campo (riusa il sistema pirotecnico della cerimonia, cadenza più lenta).
        if(isWalk&&(props.isFinal||props.seasonPresentation||(props.matchImportance||5)>=9)&&!P.ceremony){ceremonyFwT-=aDt;
          if(ceremonyFwT<=0&&!fwActive){ceremonyFwT=0.9+Math.random()*0.8;
            const _fx=(Math.random()-0.5)*46,_fy=8+Math.random()*7,_fz=(Math.random()-0.5)*30;
            for(let i=0;i<FW_N;i++){const _th=Math.random()*Math.PI*2,_cph=2*Math.random()-1,_sph=Math.sqrt(1-_cph*_cph),_sp=4.5+Math.random()*4;fwPos[i*3]=_fx;fwPos[i*3+1]=_fy;fwPos[i*3+2]=_fz;fwVel[i*3]=_sph*Math.cos(_th)*_sp;fwVel[i*3+1]=_cph*_sp;fwVel[i*3+2]=_sph*Math.sin(_th)*_sp;}
            fwGeo.attributes.position.needsUpdate=true;fwHue=(fwHue+0.27)%1;fwMat.color.setHSL(fwHue,0.9,0.62);fwMat.opacity=1;fwActive=true;fwT=0;}}
        if(P.ceremony){
          // [7.2.0] PREMIAZIONE 3D a 4 beat: (B1) esultanza sul posto + alzata trofeo · (B2) GIRO DI CAMPO verso la
          //   Curva Sud (x=+) con il trofeo alzato, i compagni al seguito · (B3) SOTTO LA CURVA: raduno + salti verso
          //   i tifosi, il pubblico risponde a ondate · (B4) PODIO a centrocampo: l'eroe sale, alza il trofeo,
          //   apice di coriandoli e fuochi. Solo visivo, deterministico nel percorso (random solo su coriandoli/fuochi).
          if(ceremonyT<0){ceremonyT=0;trophyGrp.visible=!(P.ceremony&&(P.ceremony.light||P.ceremony.kind==="promo"));/* [7.425.0] la promozione festeggia SENZA coppa: il premio e' la categoria *//* [7.42.0] big-win: festa SENZA coppa */_cerHx0=hero.position.x;_cerHz0=hero.position.z;
            try{ball.visible=false;ballHalo.visible=false;}catch(_e429){}/* [7.429.0 collaudo PO «palla che va appresso all'eroe» in premiazione] il pallone non partecipa alla cerimonia: la partita e' finita */}
          ceremonyT+=aDt;
          /* [7.429.0 strumentazione] WARP del clock cerimonia (test-only): in headless il ritmo dei frame
             crolla (~4fps) e aDt e' cappato, quindi il clock dei beat corre a ~1/10 del reale mentre il
             timer React della fase corre in millisecondi VERI: la sonda vedeva morire la cerimonia dentro
             il primo beat (misurato: cert 2.3s quando la fase e' finita). Sul dispositivo a 60fps i due
             orologi coincidono. Il warp permette al collaudo di CENTRARE ogni beat; mai attivo in gioco. */
          if(typeof window!=='undefined'&&window.__CPM_CERT_SET!=null&&(_CPM_TEST||_SIT_TEST)){ceremonyT=+window.__CPM_CERT_SET||0;window.__CPM_CERT_SET=null;}
          const _ct=ceremonyT;
          /* [7.422.0 evolutiva PO «cerimonia 3D diversa in base alla competizione, molto scenografica»]
             LA FESTA HA LA FIRMA DELLA COPPA. `ceremony.kind` esisteva dal 7.2 e il renderer lo
             ignorava: stessa cerimonia per scudetto, coppa e Champions. Ora ogni competizione ha la
             sua: SCUDETTO = coriandoli nei COLORI DEL CLUB (la festa di popolo, giro di campo pieno);
             COPPA NAZIONALE = cerimonia formale, il podio arriva prima e dura di piu', fuochi
             bianco/oro; CHAMPIONS = la notte d'oro — coriandoli dorati, fuochi a cadenza doppia,
             bagliore dorato sul podio; NAZIONALE = azzurro. Tutto deterministico nei beat, il random
             resta su coriandoli/fuochi come prima. */
          const _ck422=(P.ceremony&&P.ceremony.kind)||"league";
          if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){window.__CPM_CERT=_ct;window.__CPM_CERX=hero.position.x;}/* [7.278.0] +x eroe: la probe del lato curva la misura */// [7.2.0] collaudo: tempo cerimonia per screenshot per-beat
          actType=null;celebT=-1;sr.current._celPlan393=null;heroPostT=-1;subEntryT=-1;// la premiazione ha priorità su ogni altra posa/coreografia
          // compagni di casa (outfield, non portiere, non eroe)
          const _cel=[];sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(pp.mesh&&pp.mesh!==hero&&src&&src.team==="home"&&!src.gk)_cel.push(pp.mesh);});
          const _cSgn=(propsRef.current.heroStandHome===false)?-1:1;sr.current._cerSgn=_cSgn;/* [7.278.0 collaudo PO «il festeggiamento del trofeo deve avvenire sotto la curva dei propri tifosi»] La Curva Sud (x=+) ospita i tifosi della squadra di CASA REALE (lato-tribuna, lezione 7.52.2): in trasferta i tuoi stanno nella curva opposta, e il giro di campo andava sotto quella sbagliata. */
          const _NC=Math.max(1,_cel.length),CURVA_X=_cSgn*(AWAY_GOAL_X-6);
          /* [7.425.0 EVOLUTIVA CELEBRAZIONI — direttiva PO «ogni grande traguardo deve essere un
             momento memorabile: una Coppa deve sembrare una Coppa, uno Scudetto uno Scudetto, una
             promozione una promozione»] LA CERIMONIA E' UNO SCRIPT DI BEAT PER COMPETIZIONE, seedato
             per stagione (varianti di ordine/durata: dopo qualche stagione non si prevede ogni
             secondo). Vocabolario dei beat — burst (esplosione al fischio), hug (l'abbraccio: i
             compagni CONVERGONO sull'eroe, qualcuno in ginocchio), coach (il MISTER arriva con calma
             e abbraccia), lap (giro di campo col trofeo), curva (sotto i propri tifosi, ola), present
             (la consegna al podio), lift (il sollevamento), fest (celebrazione collettiva a ruoli).
             I compagni hanno RUOLI seedati (saltatore/abbracciatore/inginocchiato/corridore/
             applauditore): mai cloni sincronizzati. Gli attuatori sono quelli esistenti (animOne,
             pose procedurali, trofeo alle mani vere 7.24.2, coriandoli/fuochi firmati 7.422). */
          if(!sr.current._cer425||sr.current._cer425.k!==(P.ceremony.name||"")+(P.ceremony.kind||"")){
            const _seed=Math.abs(hashStr((P.ceremony.name||"t")+"|"+(propsRef.current.season||1)+"|"+_ck422))>>>0;
            const _r425=(n)=>{let x=Math.sin((_seed%9973+n)*127.1)*43758.5453;return x-Math.floor(x);};
            const _mk=(k,d)=>({k,d:d*(0.9+_r425(k.length*7+d*13)*0.25)});
            let _bs;
            if(_ck422==="cup")_bs=[_mk("burst",2.2),_mk("hug",2.6),_mk("present",3.0),_mk("lift",3.4),_mk("fest",3.2)];
            else if(_ck422==="promo")_bs=[_mk("burst",2.8),_mk("hug",3.2),_mk("coach",2.6),_mk("curva",4.2),_mk("fest",3.6)];
            else if(_ck422==="int")_bs=[_mk("burst",2.4),_mk("hug",2.4),_mk("coach",2.2),_mk("present",2.8),_mk("lift",3.8),_mk("lap",4.2),_mk("curva",2.8),_mk("fest",3.0)];
            else if(_ck422==="bigwin")_bs=[_mk("burst",2.4),_mk("hug",2.8),_mk("fest",3.0)];
            else _bs=[_mk("burst",2.4),_mk("hug",2.6),_mk("present",2.6),_mk("lift",3.6),_mk("lap",4.0),_mk("curva",3.0),_mk("fest",3.0)];/* league: la festa di popolo, completa — [7.426.0] IL GIRO DI CAMPO VA DOPO LA CONSEGNA, col trofeo in mano: prima la coppa girava il campo prima di essere consegnata */
            if(_r425(3)<0.5&&_bs.length>2&&_bs[1].k==="hug"&&_bs[2].k==="coach"){const _t=_bs[1];_bs[1]=_bs[2];_bs[2]=_t;}/* variante: il mister puo' arrivare prima dell'abbraccio */
            const _roles=[];for(let ri=0;ri<24;ri++)_roles.push(["salta","abbraccia","ginocchio","corre","applaude"][(_seed>>ri%16)%5===undefined?0:Math.floor(_r425(ri*3)*5)%5]);
            sr.current._cer425={k:(P.ceremony.name||"")+(P.ceremony.kind||""),beats:_bs,roles:_roles,camv:Math.floor(_r425(11)*3)};
            /* il TROFEO della competizione: la coppa classica resta; per lo scudetto un PIATTO d'oro
               con corona d'alloro, per l'internazionale la coppa GRANDE dalle orecchie larghe; la
               promozione festeggia SENZA coppa (il premio e' la categoria) */
            try{if(trophyGrp._extra425){trophyGrp.remove(trophyGrp._extra425);}
              const _ex=new THREE.Group();trophyGrp._extra425=_ex;trophyGrp.add(_ex);
              trophyGrp.children.forEach(ch=>{if(ch!==_ex)ch.visible=true;});trophyGrp.scale.setScalar(0.62);
              if(_ck422==="league"){trophyGrp.children.forEach(ch=>{if(ch!==_ex)ch.visible=false;});
                /* [7.429.0 collaudo PO «scudetto e trofeo non bene impugnato»] la targa stava a y=1.0
                   LOCALE (la quota del corpo della coppa): con l'aggancio alle mani vere (7.24.2) il
                   gruppo sta alle mani ma la targa fluttuava un metro sopra la testa — lo screenshot del
                   PO. Ora il piatto sta a y=0.14: nel punto in cui le mani lo stringono. */
                const _pl=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.07,24),_goldMat);_pl.rotation.x=Math.PI/2;_pl.position.y=0.14;_ex.add(_pl);
                const _rim=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.05,10,26),_goldMat);_rim.position.y=0.14;_ex.add(_rim);
                const _hub=new THREE.Mesh(new THREE.SphereGeometry(0.16,12,9),_goldMat);_hub.position.set(0,0.14,0.06);_ex.add(_hub);}
              else if(_ck422==="int"){trophyGrp.scale.setScalar(0.68);/* [collaudo PO nazionale «la coppa e' enorme»] 0,8 era il trofeo piu' grosso di tutti: resta il maggiore (0,62 standard) ma da sollevare, non da abitare */
                /* [7.474.0] l'estremo superiore di queste orecchie stava a y=1,35, cioe' SOPRA il bordo della coppa (1,25): un manico agganciato al vuoto. Rientrate sul profilo, silhouette larga conservata. */
                const _earL=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.06,10,18,Math.PI),_goldMat);_earL.position.set(-0.30,0.98,0);_earL.rotation.z=Math.PI/2;_ex.add(_earL);
                const _earR=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.06,10,18,Math.PI),_goldMat);_earR.position.set(0.30,0.98,0);_earR.rotation.z=-Math.PI/2;_ex.add(_earR);}
            }catch(_e425){}
            /* il MISTER: costruito pigro alla prima cerimonia — abito scuro, corporatura civile */
            /* [7.429.0 collaudo PO «premiazione con mister che e' un burattino»] il primo mister era un
               manichino: torso 0,8 di lato (piu' largo di un giocatore), testa-sfera color latte SENZA
               capelli, sempre in primo piano (vedi il fix del corridoio camera sotto). Ora: corporatura
               civile snella, incarnato caldo, CAPELLI, colletto — un signore in abito a bordo campo. */
            if(!sr.current._cerCoachGrp){try{const _cg=new THREE.Group();
              const _lp=new THREE.Group();/* [7.434.0] il low-poly diventa il FALLBACK GLB-OFF: sotto CH38 il mister e' un attore vero */
              const _suit=new THREE.MeshLambertMaterial({color:0x2b3442});
              const _to=new THREE.Mesh(new THREE.BoxGeometry(0.6,1.0,0.32),_suit);_to.position.y=1.32;_lp.add(_to);
              const _col=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.14,0.06),new THREE.MeshLambertMaterial({color:0xf2f2f2}));_col.position.set(0,1.72,0.17);_lp.add(_col);
              const _hd=new THREE.Mesh(new THREE.SphereGeometry(0.225,12,9),new THREE.MeshLambertMaterial({color:0xb98559}));_hd.position.y=2.0;_lp.add(_hd);
              const _hr=new THREE.Mesh(new THREE.SphereGeometry(0.235,12,9),new THREE.MeshLambertMaterial({color:0x35302a}));_hr.scale.set(1,0.62,1);_hr.position.y=2.1;_lp.add(_hr);
              const _lg=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.92,0.28),new THREE.MeshLambertMaterial({color:0x1a212c}));_lg.position.y=0.46;_lp.add(_lg);
              const _mkArm=(sx)=>{const a=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.82,0.16),_suit);a.geometry.translate(0,-0.41,0);a.position.set(sx,1.78,0);_lp.add(a);return a;};
              _cg._aL=_mkArm(-0.42);_cg._aR=_mkArm(0.42);_cg.add(_lp);_cg._lp434=_lp;
              _cg.visible=false;scene.add(_cg);sr.current._cerCoachGrp=_cg;
              /* [7.434.0 collaudo PO «non ci devono essere burattini nelle scene 3D!» (screenshot: il
                 manichino grigio accanto agli uomini GLB della premiazione)] GLB-ON IL MISTER E' UN
                 ATTORE VERO: actor-presenter.glb (l'uomo in abito del drop-in 7.141), scalato dalle
                 OSSA (lezione 7.141: il bbox dei SkinnedMesh mente), piedi a terra, braccia ABBASSATE
                 dal T-pose con la rotazione world-space della sala stampa (7.142). I gesti (applauso,
                 abbraccio) scrivono delta-euler dalla base catturata — il pattern del saluto 7.430. */
              if((typeof window==="undefined"||window.__CPM_GLB!==false)&&typeof loadGLB==="function"&&THREE.SkeletonUtils&&THREE.SkeletonUtils.clone){
                loadGLB('./assets/actor-presenter.glb').then(_g=>{try{
                  if(!_g||!_g.scene)return;
                  const av=THREE.SkeletonUtils.clone(_g.scene);
                  av.updateMatrixWorld(true);
                  let _yMin=Infinity,_yMax=-Infinity;const _bv=new THREE.Vector3();
                  av.traverse(b=>{if(!b.isBone)return;b.getWorldPosition(_bv);if(_bv.y<_yMin)_yMin=_bv.y;if(_bv.y>_yMax)_yMax=_bv.y;});
                  let hh=_yMax-_yMin;
                  if(!(hh>0.01)){const bb=new THREE.Box3().setFromObject(av);hh=Math.max(0.1,bb.max.y-bb.min.y);}
                  const sc=1.88/hh;av.scale.setScalar(sc);
                  av.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});
                  av.updateMatrixWorld(true);
                  {let xm=Infinity,xM=-Infinity,ym=Infinity,zm=Infinity,zM=-Infinity;
                   av.traverse(b=>{if(!b.isBone)return;b.getWorldPosition(_bv);if(_bv.x<xm)xm=_bv.x;if(_bv.x>xM)xM=_bv.x;if(_bv.y<ym)ym=_bv.y;if(_bv.z<zm)zm=_bv.z;if(_bv.z>zM)zM=_bv.z;});
                   if(isFinite(xm)){av.position.x+=-(xm+xM)/2;av.position.z+=-(zm+zM)/2;av.position.y+=-ym;av.updateMatrixWorld(true);}}
                  let _aLb=null,_aRb=null,_fLb=null,_fRb=null,_tLb=null,_tRb=null;/* [7.476.0] +cosce: senza gambe il mister non cammina, trasla */
                  av.traverse(b=>{if(!b.isBone)return;const bn=(b.name||"").replace(/[:_. ]/g,"").toLowerCase();/* matcher 7.142: mixamo E Biped (actor-presenter e' Rocketbox: Bip01_R_UpperArm) */
                    if(/rightforearm$|rforearm$/.test(bn))_fRb=b;else if(/leftforearm$|lforearm$/.test(bn))_fLb=b;
                    else if(/rightarm$|rupperarm$/.test(bn))_aRb=b;else if(/leftarm$|lupperarm$/.test(bn))_aLb=b;
                    else if(/rightupleg$|rightthigh$|rthigh$/.test(bn))_tRb=b;else if(/leftupleg$|leftthigh$|lthigh$/.test(bn))_tLb=b;});
                  /* braccia giu' dal T-pose (world-space, una volta): stessa rotazione della sala stampa */
                  const _axF=new THREE.Vector3(0,0,1);
                  const _rotW=(bone,axis,ang)=>{if(!bone||!bone.parent)return;av.updateMatrixWorld(true);
                    const pw=new THREE.Quaternion();bone.parent.getWorldQuaternion(pw);
                    const rq=new THREE.Quaternion().setFromAxisAngle(axis,ang);
                    bone.quaternion.copy(pw.clone().invert().multiply(rq).multiply(pw).multiply(bone.quaternion.clone()));};
                  _rotW(_aLb,_axF,-1.25);_rotW(_aRb,_axF,1.25);
                  _cg._lp434.visible=false;_cg.add(av);_cg._glb434=av;
                  if(_aLb&&_aRb){_cg._aL=_aLb;_cg._aR=_aRb;_cg._fL434=_fLb;_cg._fR434=_fRb;_cg._glbArms434=true;}
                  if(_tLb&&_tRb){_cg._tL476=_tLb;_cg._tR476=_tRb;}
                }catch(_e434){}}).catch(()=>{});}
              }catch(_e){}}
            if(sr.current._cerCoachGrp){sr.current._cerCoachGrp.visible=true;sr.current._cerCoachGrp.position.set(_cerHx0-_cSgn*9,0,_cerHz0-4.5);}/* [collaudo PO nazionale «il mister vola»] spawn gia' sul lato di scena che i bersagli di follow usano (z-4,5, fuori dal corridoio camera): prima partiva a z+6 e attraversava l'inquadratura in planata */
            /* [collaudo PO finale NAZIONALE «i giocatori sembra che si riscaldano... i compagni non
               festeggiano»] L'APERTURA DELLA CERIMONIA E' UNO STACCO: la nazionale ci arriva dalla
               lotteria dei rigori coi giocatori SPARSI per il campo (misurato GLB-ON: al beat hug
               l'eroe era solo, zero compagni entro 15u — e 2,4s di hug non bastano a raggiungerlo),
               e lo stesso puo' capitare a fine partita normale. La camera taglia comunque sulla
               scena nuova: i compagni di squadra si RI-PIAZZANO sull'anello della festa attorno
               all'eroe (3,5-6u, mai dentro il futuro palco), gli avversari restano dove sono. */
            try{let _ri439=0;sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];
              if(!pp.mesh||pp.mesh===hero||!src||src.team!=="home"||src.gk)return;
              const _dh439=Math.hypot(pp.mesh.position.x-_cerHx0,pp.mesh.position.z-_cerHz0);
              if(_dh439>7){const _a439=(_ri439/9)*Math.PI*2+0.7,_rr439=3.5+(_ri439%3)*1.2;
                pp.mesh.position.x=_cerHx0+Math.cos(_a439)*_rr439;pp.mesh.position.z=_cerHz0+Math.sin(_a439)*_rr439;
                pp.mesh.rotation.y=Math.atan2(_cerHx0-pp.mesh.position.x,_cerHz0-pp.mesh.position.z);}
              _ri439++;});}catch(_e439){}
            /* [7.426.0] LE BANDIERE DELLA CURVA: durante la cerimonia la curva dei tuoi espone dieci
               bandiere nei colori del club che sventolano — costruite pigre una volta, riusate, mai
               attive fuori dalla premiazione (zero costo in partita). */
            if(!sr.current._cerFlags426){try{const _fg=new THREE.Group();
              for(let fi=0;fi<10;fi++){const _t=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.5),new THREE.MeshLambertMaterial({color:new THREE.Color(fi%2===0?((typeof heroKitCol!=="undefined"&&heroKitCol)||"#dc2626"):"#ffffff"),side:THREE.DoubleSide}));
                _t.position.set(0,0,0);_fg.add(_t);}
              _fg.visible=false;scene.add(_fg);sr.current._cerFlags426=_fg;}catch(_e){}}
            if(sr.current._cerFlags426){const _fg=sr.current._cerFlags426;_fg.visible=true;
              _fg.children.forEach((t,fi)=>{t.position.set(_cSgn*(AWAY_GOAL_X+2.5),6+(fi%3)*4+((fi*7)%5)*0.9,(fi-4.5)*6.2);t.rotation.y=-_cSgn*Math.PI/2;});}
            /* [7.429.0 direttiva PUBBLICO della spec celebrazioni: «bandiere, sciarpe, TELEFONI»] i
               telefonini della curva: 70 punti di luce fredda sparsi sulla tribuna dei tuoi che
               tremolano (la gente riprende la festa). Lazy, riusati, mai attivi fuori dalla cerimonia. */
            if(!sr.current._cerPhones429){try{
              const _pn=70,_pp=new Float32Array(_pn*3);
              for(let pi=0;pi<_pn;pi++){const _r1=Math.sin(pi*12.9898)*43758.5453,_f1=_r1-Math.floor(_r1);const _r2=Math.sin(pi*78.233)*12543.21,_f2=_r2-Math.floor(_r2);
                _pp[pi*3]=0;_pp[pi*3+1]=4.5+_f1*12;_pp[pi*3+2]=(_f2-0.5)*56;}
              const _pg=new THREE.BufferGeometry();_pg.setAttribute('position',new THREE.BufferAttribute(_pp,3));
              const _pm=new THREE.PointsMaterial({color:0xcfe8ff,size:0.5,transparent:true,opacity:0.85,sizeAttenuation:true,depthWrite:false});
              const _pt=new THREE.Points(_pg,_pm);_pt.visible=false;scene.add(_pt);sr.current._cerPhones429=_pt;}catch(_e){}}
            if(sr.current._cerPhones429){const _pt=sr.current._cerPhones429;_pt.visible=true;_pt.position.set(_cSgn*(AWAY_GOAL_X+3.2),0,0);}
            if(typeof window!=="undefined"&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_CER425={kind:_ck422,beats:_bs.map(b=>b.k),beatsD:_bs.map(b=>+(b.d||0).toFixed(2)),coach:!!sr.current._cerCoachGrp};}catch(_e){}}/* [7.429.0] +beatsD (durate): la sonda del collaudo deve poter centrare la META' di ogni beat — coi soli nomi scattava alla cieca */
          }
          const _SC=sr.current._cer425;let _acc=0,_bi425=_SC.beats.length-1,_bp=1;
          for(let i=0;i<_SC.beats.length;i++){if(_ct<_acc+_SC.beats[i].d){_bi425=i;_bp=(_ct-_acc)/_SC.beats[i].d;break;}_acc+=_SC.beats[i].d;}
          const _bk=_SC.beats[_bi425].k;
          let _htx=hero.position.x,_htz=hero.position.z,_armsUp=true,_onPodium=false;
          if(_bk==="burst"||_bk==="hug"||_bk==="coach"){_htx=_cerHx0;_htz=_cerHz0;}
          else if(_bk==="lap"){_htx=_cerHx0+(CURVA_X-_cerHx0)*_bp;_htz=_cerHz0*(1-_bp)+Math.sin(_bp*Math.PI)*(_cerHz0>=0?9:-9);_armsUp=false;}
          else if(_bk==="curva"){_htx=CURVA_X;_htz=0;if(crowdOhT<0&&Math.sin(_ct*3)>0.9)crowdOhT=0;}
          else if(_bk==="present"){_htx=-_cSgn*2.3;_htz=1.4;podiumGrp.visible=true;}/* [7.429.0 collaudo PO «eroe che sprofonda nel palco»] alla consegna si sta ACCANTO al podio (il bersaglio (0,0) lo piantava DENTRO il cilindro); ci si sale solo al sollevamento */
          else if(_bk==="lift"){_htx=0;_htz=0;_onPodium=true;podiumGrp.visible=true;}
          else{_htx=(_ck422==="promo"?CURVA_X*0.7:0);_htz=0;}/* fest: la promozione resta coi tifosi */
          animOne(hero,_htx,_htz,aDt,ak,_htx,_htz);// muove l'eroe (gambe animate quando cammina)
          /* [7.476.0 collaudo PO «entrano nel palco»] IL PODIO E' UN SOLIDO, NON UN DISEGNO SUL PRATO.
             Il BERSAGLIO della consegna era gia' fuori (il 7.429 l'aveva spostato accanto al podio dopo
             «l'eroe sprofonda nel palco»), ma nessuno guardava il TRAGITTO: misurato col testimone di
             cerimonia, l'eroe passa a 1,04 unita' dal centro con il piede a quota 0,17 — dentro il corpo
             del podio, che ha raggio 1,7. Correggere il bersaglio non serviva a niente: quello era gia'
             giusto, e' la strada che attraversava il solido. Ora, finche' il podio e' in scena e non e' il
             beat in cui ci si sale, chi ci finisce dentro viene spinto sul BORDO lungo il proprio raggio
             — una deviazione, non un teletrasporto: la traiettoria gira attorno al palco come farebbe un
             uomo. Vale per l'eroe e per il mister, che ha lo stesso problema per lo stesso motivo. */
          {const _PR476=2.15;/* raggio del corpo (1,7) + mezzo passo d'ingombro */
           const _fuori476=(o)=>{if(!o)return;const _d=Math.hypot(o.position.x-podiumGrp.position.x,o.position.z-podiumGrp.position.z);
             if(_d>0.001&&_d<_PR476){const _k=_PR476/_d;
               o.position.x=podiumGrp.position.x+(o.position.x-podiumGrp.position.x)*_k;
               o.position.z=podiumGrp.position.z+(o.position.z-podiumGrp.position.z)*_k;}};
           if(podiumGrp.visible&&!_onPodium&&!(typeof window!=='undefined'&&window.__CPM_NO476))_fuori476(hero);}
          /* il MISTER: nel beat coach cammina verso l'eroe e lo abbraccia; altrove applaude a bordo scena */
          if(sr.current._cerCoachGrp){const _co=sr.current._cerCoachGrp;
            /* [7.429.0] FUORI DAL CORRIDOIO DI RIPRESA: il bersaglio di follow (eroe-6, z+5) stava
               ESATTAMENTE fra la camera (eroe-8..-11, z+6..8) e il soggetto — il mister gigante in primo
               piano degli screenshot del PO (misurato: dCam 5-7u costanti in ogni beat). Ora segue il
               gruppo DIETRO l'eroe sul lato opposto alla camera (z-4,5) e alla consegna sta oltre il
               podio (z-4,2), mai fra l'obiettivo e la scena. */
            const _cto=(_bk==="coach")?{x:hero.position.x-_cSgn*1.3,z:hero.position.z}:(_bk==="lift"||_bk==="present")?{x:-_cSgn*2.6,z:-4.2}:{x:hero.position.x-_cSgn*2.2,z:hero.position.z-4.5};
            /* [collaudo PO nazionale «il mister vola, si muove con il teletrasporto»] il lerp
               proporzionale (aDt*1.4) su un bersaglio a 10-15u produceva passi da 4-6u/s in PLANATA,
               senza gambe: un signore che levita attraverso il campo. Ora cammina a VELOCITA' UMANA
               costante (3,2 u/s, poi rallenta sotto il metro) con una falcata verticale leggera
               mentre e' in moto — a destinazione sta fermo e la falcata muore. */
            {const _cdx=_cto.x-_co.position.x,_cdz=_cto.z-_co.position.z,_cdl=Math.hypot(_cdx,_cdz);
             if(_cdl>0.05){const _cst=Math.min(_cdl,(_cdl<1?1.4:3.2)*aDt);_co.position.x+=_cdx/_cdl*_cst;_co.position.z+=_cdz/_cdl*_cst;
               _co._walk439=(_co._walk439||0)+aDt;_co.position.y=Math.abs(Math.sin(_co._walk439*7))*0.05;_co._mv476=1;}
             else {_co._walk439=0;_co.position.y=0;_co._mv476=0;}
             /* [7.476.0] anche il mister sta fuori dal solido del podio (stessa regola dell'eroe) */
             if(podiumGrp.visible&&!(typeof window!=='undefined'&&window.__CPM_NO476)){
               const _dp476=Math.hypot(_co.position.x-podiumGrp.position.x,_co.position.z-podiumGrp.position.z);
               if(_dp476>0.001&&_dp476<2.15){const _k476=2.15/_dp476;
                 _co.position.x=podiumGrp.position.x+(_co.position.x-podiumGrp.position.x)*_k476;
                 _co.position.z=podiumGrp.position.z+(_co.position.z-podiumGrp.position.z)*_k476;}}}
            _co.rotation.y=Math.atan2(hero.position.x-_co.position.x,hero.position.z-_co.position.z);
            if(_co._glbArms434){/* [7.434.0] ossa GLB in WORLD-SPACE (lezione 7.340: gli euler per-rig su Biped cadono male): base in quaternione catturata dopo la posa, rotazione attorno all'asse LATERALE del personaggio */
              const _ry434=_co.rotation.y,_lat434=new THREE.Vector3(Math.cos(_ry434),0,-Math.sin(_ry434));
              const _gW=(b,ang)=>{if(!b||!b.parent)return;if(!b._q434)b._q434=b.quaternion.clone();
                if(!ang){b.quaternion.copy(b._q434);return;}
                b.parent.updateWorldMatrix(true,false);
                const _pw=new THREE.Quaternion();b.parent.getWorldQuaternion(_pw);
                const _rq=new THREE.Quaternion().setFromAxisAngle(_lat434,ang);
                b.quaternion.copy(_pw.clone().invert().multiply(_rq).multiply(_pw).multiply(b._q434.clone()));};
              /* [7.476.0 collaudo PO «il mister vola»] LA CAUSA NON ERA LA VELOCITA', ERANO LE GAMBE.
                 Il 7.439 aveva gia' portato lo spostamento a passo d'uomo (3,2 u/s) — misurato oggi, e'
                 esattamente quello — ma il mister e' `actor-presenter.glb` POSATO A OSSA: nessun mixer,
                 nessuna clip di locomozione. Un uomo che si sposta a velocita' giusta con le gambe ferme
                 non cammina: plana. Ora, mentre si sposta, le cosce oscillano in controfase con la stessa
                 macchina world-space gia' usata per le braccia — nessun asset nuovo, nessun mixer, e a
                 destinazione la falcata muore da sola perche' l'ampiezza segue `_mv476`. */
              {const _sw476=(_co._mv476?Math.sin((_co._walk439||0)*7)*0.55:0);
               if(_co._tL476)_gW(_co._tL476,_sw476);if(_co._tR476)_gW(_co._tR476,-_sw476);}
              if(_bk==="coach"){_gW(_co._aL,-1.5);_gW(_co._aR,-1.5);_gW(_co._fL434,0);_gW(_co._fR434,0);}
              else if(_bk==="lift"||_bk==="fest"){const _cl=Math.sin(_ct*7)>0?-0.5:-0.9;_gW(_co._aL,_cl);_gW(_co._aR,_cl);_gW(_co._fL434,-0.3);_gW(_co._fR434,-0.3);}
              else{_gW(_co._aL,-0.1);_gW(_co._aR,-0.1);_gW(_co._fL434,0);_gW(_co._fR434,0);}}
            else if(_bk==="coach"){_co._aL.rotation.x=-1.4;_co._aR.rotation.x=-1.4;_co._aL.rotation.z=0.35;_co._aR.rotation.z=-0.35;}/* abbraccio */
            else if(_bk==="lift"||_bk==="fest"){const _cl=Math.sin(_ct*7)>0?0.5:0.9;_co._aL.rotation.x=-_cl;_co._aR.rotation.x=-_cl;_co._aL.rotation.z=0;_co._aR.rotation.z=0;}/* applauso */
            else{_co._aL.rotation.x=-0.3;_co._aR.rotation.x=-0.3;_co._aL.rotation.z=0;_co._aR.rotation.z=0;}}
          /* [7.476.0] TESTIMONE DELLA CERIMONIA (solo sotto test). Le quattro note del PO sulla premiazione
             — «l'eroe saltella come se si stesse riscaldando», «il mister vola», «entrano nel palco», «la
             coppa e' troppo grande» — sono tutte GRANDEZZE, non impressioni: la clip che l'eroe sta
             suonando, la velocita' del mister per secondo, la distanza dei due dal cilindro del podio, e
             l'altezza del trofeo RAPPORTATA a quella dell'eroe (che e' cio' che rende una coppa «troppo
             grande»: non i suoi centimetri, il suo rapporto con l'uomo che la alza). */
          if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{
            const _cw=(window.__CPM_CER476=window.__CPM_CER476||[]);
            if(_cw.length<400){
              const _co2=sr.current._cerCoachGrp;
              const _pod=podiumGrp&&podiumGrp.visible?podiumGrp.position:null;
              const _tb=new THREE.Box3().setFromObject(trophyGrp),_hb=new THREE.Box3().setFromObject(hero);
              const _th=(_tb.max.y-_tb.min.y),_hh=(_hb.max.y-_hb.min.y);
              const _cv2=_co2?Math.hypot(_co2.position.x-(_co2._px476!=null?_co2._px476:_co2.position.x),_co2.position.z-(_co2._pz476!=null?_co2._pz476:_co2.position.z))/Math.max(aDt,1e-3):0;
              if(_co2){_co2._px476=_co2.position.x;_co2._pz476=_co2.position.z;}
              _cw.push({t:+_ct.toFixed(2),beat:_bk,
                hero:{x:+hero.position.x.toFixed(2),z:+hero.position.z.toFixed(2),y:+hero.position.y.toFixed(2),clip:(hero._gName||null),h:+_hh.toFixed(2)},
                coach:_co2?{x:+_co2.position.x.toFixed(2),z:+_co2.position.z.toFixed(2),v:+_cv2.toFixed(2),vis:!!_co2.visible}:null,
                trofeo:{vis:!!trophyGrp.visible,h:+_th.toFixed(2),rap:_hh>0.2?+(_th/_hh).toFixed(2):null},
                podio:_pod?{x:+_pod.x.toFixed(2),z:+_pod.z.toFixed(2),
                  dHero:+Math.hypot(hero.position.x-_pod.x,hero.position.z-_pod.z).toFixed(2),
                  dCoach:_co2?+Math.hypot(_co2.position.x-_pod.x,_co2.position.z-_pod.z).toFixed(2):null}:null});
            }}catch(_e476){}}
          /* la REGIA per beat: primo piano sull'emozione, media sui personaggi, largo su squadra e curva */
          {const _hx3=hero.position.x,_hz3=hero.position.z,_cv=_SC.camv;
           let _shot;
           if(_bk==="burst"||_bk==="coach")_shot={x:_hx3-_cSgn*(5.5+_cv),y:2.5,z:_hz3+3.5,lx:_hx3,ly:1.6,lz:_hz3};
           else if(_bk==="hug")_shot={x:_hx3-_cSgn*8,y:3.6+_cv*0.4,z:_hz3+6,lx:_hx3,ly:1.4,lz:_hz3};
           else if(_bk==="lap")_shot={x:_hx3-_cSgn*11,y:5,z:_hz3+8,lx:_hx3,ly:1.5,lz:_hz3};
           else if(_bk==="curva")_shot={x:_hx3-_cSgn*20,y:8.5,z:_hz3+(_cv-1)*4,lx:_hx3+_cSgn*8,ly:4,lz:0};
           else if(_bk==="present")_shot={x:-_cSgn*10,y:3.2,z:8,lx:0,ly:2.0,lz:0};
           else if(_bk==="lift")_shot={x:-_cSgn*(9+_bp*6),y:3.4+_bp*3,z:6+_bp*4,lx:0,ly:2.4,lz:0};
           else _shot={x:_hx3-_cSgn*16,y:7,z:_hz3+10,lx:_hx3,ly:2,lz:_hz3};
           sr.current._cerCam=_shot;}
          if(sr.current._cerFlags426&&sr.current._cerFlags426.visible)sr.current._cerFlags426.children.forEach((t,fi)=>{t.rotation.z=Math.sin(_ct*2.4+fi*1.3)*0.28;t.rotation.x=Math.sin(_ct*1.7+fi)*0.12;});
          if(sr.current._cerPhones429&&sr.current._cerPhones429.visible){const _pm429=sr.current._cerPhones429.material;_pm429.opacity=0.55+Math.sin(_ct*9)*0.2+Math.sin(_ct*23.7)*0.12;}/* [7.429.0] il tremolio dei telefonini */
          const _hop=(_bk==="lap")?0:Math.abs(Math.sin(_ct*(_onPodium?4:3.4)))*0.22;
          /* [7.429.0] MAI DENTRO IL PALCO: se l'eroe attraversa il cilindro del podio (es. il fest che lo
             richiama al centro dopo il giro) la quota sale sul piano del podio invece di sprofondarci */
          const _nearPod429=podiumGrp.visible&&Math.hypot(hero.position.x,hero.position.z)<1.7;
          if(_onPodium||_nearPod429)hero.position.y=1.05+_hop; else hero.position.y=Math.max(0,_hop);
          if(_armsUp){hero._aL.rotation.x=-2.5;hero._aR.rotation.x=-2.5;hero._aL.rotation.z=-0.35;hero._aR.rotation.z=0.35;}
          else{hero._aR.rotation.x=-2.6;hero._aR.rotation.z=0.35;hero._aL.rotation.x=-0.2;hero._aL.rotation.z=0;}// cammina col trofeo alzato (destra) — braccia PROCEDURALI (fallback GLB off)
          // [7.24.1 collaudo PO «non alza la coppa con le mani, gli vola in testa!»] col CH38 le braccia
          //   procedurali sono nascoste → l'eroe restava in idle. Ora nei beat a braccia alzate il GLB tiene la
          //   POSA della rimessa (clip anim-throwin CONGELATA all'apice = due mani sopra la testa, vedi loop
          //   mixer _cerLift) e il TROFEO è agganciato al PUNTO MEDIO delle MANI vere (ossa mixamorig) — non
          //   più a quota fissa sopra la testa. Fallback (GLB off): formula storica 7.5.1.
          /* [7.426.0] LA COPPA ARRIVA ALLA PREMIAZIONE: negli script con `present` il trofeo resta
             invisibile fino alla consegna (prima girava il campo gia' in mano dall'esplosione); nel
             beat present sta SUL PODIO e vola alle mani nell'ultimo terzo. La posa GLB d'alzata
             (_cerLift) parte solo da quando la coppa e' davvero in mano — prima l'eroe esulta libero. */
          const _hasPres=_SC.beats.some(b=>b.k==="present");
          const _presIdx=_SC.beats.findIndex(b=>b.k==="present");
          const _trofeoInMano=trophyGrp.visible&&(!_hasPres||_bi425>_presIdx);
          /* [7.476.0 collaudo PO «l'eroe saltella come se si stesse riscaldando»] «PRIMA L'EROE ESULTA
             LIBERO» NON E' SOPRAVVISSUTO AL CH38. L'intenzione del 7.426 era che nei primi beat il
             protagonista festeggiasse senza la posa d'alzata; ma «esultare libero» era una posa
             PROCEDURALE, e sotto il CH38 le pose procedurali NON SI VEDONO — parlano solo le clip
             (direttiva PO 2026-07-29). Senza clip richiesta l'attore ricade sulla locomozione di
             partita, cioe' il misto fermo/corsa: MISURATO col testimone di cerimonia, sui beat burst,
             hug e present la clip dell'attore e' `null` con peso 0, e quello che si vede e' un uomo che
             sgambetta sul posto — «come se si stesse riscaldando», appunto.
             Ora la posa d'alzata (braccia al cielo, la clip `lift` che l'attore ha gia': nessun asset
             nuovo, che su mobile e' un vincolo) copre TUTTA la cerimonia. Il TROFEO non anticipa di un
             fotogramma: la consegna la governa `_trofeoInMano`, che e' un'altra variabile e non si
             tocca. */
          const _no476c=(typeof window!=='undefined'&&window.__CPM_NO476C);
          sr.current._cerLift=(_trofeoInMano||(_bk==="present"&&_bp>0.5)||(!_no476c&&(_bk==="burst"||_bk==="hug"||_bk==="present"||_bk==="fest"))/* NON su `lap` e `curva`: li' l'eroe CORRE (giro di campo, sotto la curva) e la locomozione e' la cosa giusta — misurato, forzando la posa la clip non attecchiva comunque perche' stava contendendo con la corsa */)?(_armsUp?1:2):0;
          const _liftU=Math.min(_ct/1.5,1);
          let _thSet=false;
          try{const _hAv=(glbAvatars&&glbAvatars[0]&&glbAvatars[0].proc===hero)?glbAvatars[0]:null;
            if(_hAv&&_hAv._handL&&_hAv._handR){
              const _v1=sr.current._thv1||(sr.current._thv1=new THREE.Vector3()),_v2=sr.current._thv2||(sr.current._thv2=new THREE.Vector3());
              _v1.setFromMatrixPosition(_hAv._handL.matrixWorld);_v2.setFromMatrixPosition(_hAv._handR.matrixWorld);
              trophyGrp.position.set((_v1.x+_v2.x)/2,(_v1.y+_v2.y)/2+0.10,(_v1.z+_v2.z)/2);_thSet=true;
            }}catch(_e){}
          if(!_thSet)trophyGrp.position.set(hero.position.x+(_armsUp?0:0.22),hero.position.y+1.75+_liftU*0.22,hero.position.z+(_armsUp?0.12:0.08));
          if(_hasPres&&!_trofeoInMano){if(_bk==="present"){const _pw426=Math.min(1,Math.max(0,(_bp-0.6)/0.4));
              const _hx4=trophyGrp.position.x,_hy4=trophyGrp.position.y,_hz4=trophyGrp.position.z;/* bersaglio mani: l'attacco qui sopra l'ha gia' scritto */
              trophyGrp.position.set(_hx4*_pw426,1.35+(_hy4-1.35)*_pw426,_hz4*_pw426);}
            else{trophyGrp.position.set(0,-50,0);}}/* prima della consegna la coppa non c'e' ancora: arriva SUL PODIO e vola alle mani nell'ultimo tratto */
          trophyGrp.rotation.y+=aDt*1.3;
          _goldMat.emissiveIntensity=0.4+Math.sin(now*0.006)*0.28;
          /* COMPAGNI A RUOLI (seedati): la stessa scena, ventidue reazioni — mai cloni sincronizzati.
             Nel beat HUG convergono sull'eroe (gli abbracciatori addosso, gli inginocchiati a terra,
             i corridori arrivano da lontano); nel LAP seguono; in CURVA fila sotto i tifosi; in
             PRESENT/LIFT arco attorno al podio; in FEST ognuno fa il suo. */
          _cel.forEach((m,ci)=>{const _off=(ci/_NC-0.5);const _role=_SC.roles[ci%_SC.roles.length];let _mx,_mz;
            if(_bk==="burst"){_mx=_cerHx0-_cSgn*(4+Math.abs(_off)*5)+Math.sin(ci*2.7)*2;_mz=_cerHz0+_off*18;}
            else if(_bk==="hug"||_bk==="coach"){const _rr=(_role==="abbraccia")?1.4:(_role==="ginocchio")?2.2:(_role==="corre")?(3.5+(1-_bp)*10):3.0;const _a2=(ci/_NC)*Math.PI*2+0.4;_mx=hero.position.x+Math.cos(_a2)*_rr;_mz=hero.position.z+Math.sin(_a2)*_rr;}
            else if(_bk==="lap"){_mx=hero.position.x-_cSgn*(6+Math.abs(_off)*4);_mz=hero.position.z+_off*16;}
            else if(_bk==="curva"){_mx=CURVA_X-_cSgn*(2+Math.abs(_off)*3);_mz=_off*24;}
            else if(_bk==="present"||_bk==="lift"){const _a2=(ci/_NC)*Math.PI*2;_mx=Math.cos(_a2)*6.5;_mz=Math.sin(_a2)*7.5;}
            else{const _a2=(ci/_NC)*Math.PI*2;_mx=hero.position.x+Math.cos(_a2)*(5+(ci%3)*2.5);_mz=hero.position.z+Math.sin(_a2)*(6+(ci%2)*3);}
            animOne(m,_mx,_mz,aDt,ak,_mx,_mz);
            /* [7.429.0 collaudo PO — un compagno mezzo AFFONDATO nel podio negli screenshot] il viaggio
               verso l'arco della consegna puo' attraversare il cilindro: spinta radiale fuori dal palco */
            if(podiumGrp.visible){const _dp429=Math.hypot(m.position.x,m.position.z);
              if(_dp429<2.5&&_dp429>0.01){const _s429=2.5/_dp429;m.position.x*=_s429;m.position.z*=_s429;}}
            /* la POSA del ruolo: braccia/salto/ginocchio diversi per uomo, fasi sfalsate */
            const _ph=_ct*(3.4+(ci%5)*0.35)+ci*1.1;
            if(_role==="ginocchio"&&(_bk==="hug"||_bk==="burst")){m.position.y=-0.35;if(m._lR)m._lR.rotation.x=1.5;m._aL.rotation.x=-1.1;m._aR.rotation.x=-1.1;m._aL.rotation.z=0;m._aR.rotation.z=0;}
            else if(_role==="applaude"&&_bk!=="curva"){m.position.y=Math.abs(Math.sin(_ph))*0.08;const _cl=Math.sin(_ct*7+ci)>0?0.5:0.95;m._aL.rotation.x=-_cl;m._aR.rotation.x=-_cl;m._aL.rotation.z=0.15;m._aR.rotation.z=-0.15;if(m._lR)m._lR.rotation.x=0;}
            else if(_role==="abbraccia"&&(_bk==="hug"||_bk==="coach")){m.position.y=0;m._aL.rotation.x=-1.5;m._aR.rotation.x=-1.5;m._aL.rotation.z=0.4;m._aR.rotation.z=-0.4;if(m._lR)m._lR.rotation.x=0;m.rotation.y=Math.atan2(hero.position.x-m.position.x,hero.position.z-m.position.z);}
            else{const _cj=(_bk==="curva")?0.34:0.22;m._aL.rotation.x=-2.0;m._aR.rotation.x=-2.0;m._aL.rotation.z=-0.3;m._aR.rotation.z=0.3;m.position.y=Math.abs(Math.sin(_ph))*_cj;if(m._lR)m._lR.rotation.x=0;}});
          // coriandoli continui multicolore su tutto il campo
          if(!confActive||confMat.opacity<0.4){for(let i=0;i<CONF_N;i++){confPos[i*3]=(Math.random()-0.5)*62;confPos[i*3+1]=8+Math.random()*9;confPos[i*3+2]=(Math.random()-0.5)*38;confVel[i*3]=(Math.random()-0.5)*4;confVel[i*3+1]=-1-Math.random()*3;confVel[i*3+2]=(Math.random()-0.5)*4;}confGeo.attributes.position.needsUpdate=true;confMat.opacity=0.95;confActive=true;
            /* [7.422.0] il COLORE dei coriandoli e' la firma: scudetto = i colori del club che si
               alternano (la citta' in festa), Champions = pioggia d'ORO, coppa = bianco/oro,
               nazionale = azzurro, big-win/altro = arcobaleno storico */
            if(_ck422==="league"){try{confMat.color.set(((now/700|0)%2===0)?((typeof heroKitCol!=="undefined"&&heroKitCol)||(typeof homeCol!=="undefined"&&homeCol)||"#dc2626"):"#ffffff");}catch(_e){confMat.color.setHSL((now*0.0004)%1,0.85,0.6);}}
            else if(_ck422==="euro")confMat.color.setHSL(0.125,0.92,0.58);
            else if(_ck422==="cup")confMat.color.setHSL(((now/800|0)%2===0)?0.13:0.0,((now/800|0)%2===0)?0.85:0.0,((now/800|0)%2===0)?0.6:0.93);
            else if(_ck422==="int")confMat.color.setHSL(0.58,0.85,0.6);
            else confMat.color.setHSL((now*0.0004)%1,0.85,0.6);}
          // fuochi d'artificio periodici (più fitti sul podio finale)
          ceremonyFwT-=aDt;
          if(ceremonyFwT<=0&&!fwActive){ceremonyFwT=((_onPodium?0.32:0.5)+Math.random()*0.4)*(_ck422==="euro"?0.55:1);/* [7.422.0] Champions: la notte d'oro ha i fuochi a cadenza quasi doppia */
            const _fx=(Math.random()-0.5)*46,_fy=7+Math.random()*7,_fz=(Math.random()-0.5)*30;
            for(let i=0;i<FW_N;i++){const _th=Math.random()*Math.PI*2,_cph=2*Math.random()-1,_sph=Math.sqrt(1-_cph*_cph),_sp=4.5+Math.random()*4;fwPos[i*3]=_fx;fwPos[i*3+1]=_fy;fwPos[i*3+2]=_fz;fwVel[i*3]=_sph*Math.cos(_th)*_sp;fwVel[i*3+1]=_cph*_sp;fwVel[i*3+2]=_sph*Math.sin(_th)*_sp;}
            fwGeo.attributes.position.needsUpdate=true;fwHue=(fwHue+0.27)%1;
            if(_ck422==="euro")fwMat.color.setHSL(0.10+Math.random()*0.05,0.95,0.6);/* [7.422.0] fuochi ORO per la Champions */
            else if(_ck422==="cup")fwMat.color.setHSL(Math.random()<0.5?0.13:0.0,Math.random()<0.5?0.9:0.0,Math.random()<0.5?0.6:0.92);/* bianco/oro formale */
            else if(_ck422==="int")fwMat.color.setHSL(0.55+Math.random()*0.08,0.9,0.62);/* azzurro nazionale */
            else fwMat.color.setHSL(fwHue,0.9,0.62);
            fwMat.opacity=1;fwActive=true;fwT=0;
            goalBurstLight.position.set(_fx,_fy,_fz);goalBurstLight.intensity=_ck422==="euro"?4.2:3.2;}
          if(goalBurstLight.intensity>0.05)goalBurstLight.intensity*=(1-aDt*1.8);
        } else if(ceremonyT>=0){ceremonyT=-1;trophyGrp.visible=false;trophyGrp.position.y=-50;podiumGrp.visible=false;sr.current._cerLift=0;sr.current._cer425=null;sr.current._cerCam=null;if(sr.current._cerCoachGrp)sr.current._cerCoachGrp.visible=false;if(sr.current._cerFlags426)sr.current._cerFlags426.visible=false;try{ball.visible=true;ballHalo.visible=true;}catch(_e429b){}if(sr.current._cerPhones429)sr.current._cerPhones429.visible=false;/* [7.425.0/7.426.0/7.429.0] script, regia, mister, bandiere e telefonini non sopravvivono alla cerimonia; il pallone torna */}
        // [7.31.0 direttiva PO] CALCI DI RIGORE 3D dal dischetto (turni KO pareggiati) — scena guidata dal
        //   prop shootout.kick {key,side,dir,high,scored,wide}: porta AWAY (x=+46), spot a ~11u; run-up del
        //   kicker (eroe sui tuoi, un avversario vero sui loro), volo palla in rete/parata/fuori, tuffo del
        //   portiere COERENTE con l'esito (sul gol si butta dal lato sbagliato, sulla parata VA sulla palla),
        //   squadre schierate a centrocampo. Solo presentazione (fase dedicata, gate-cieco → collaudo dal vivo).
        if(P.shootout){
          const _bl=sr.current.ball;const _k=P.shootout.kick;
          actType=null;celebT=-1;sr.current._celPlan393=null;heroPostT=-1;subEntryT=-1;
          sr.current.players.forEach((pp,ii)=>{const src=(P.allPlayers||[])[ii];if(!pp.mesh||!src)return;
            if(pp.mesh===sr.current._soKicker)return;/* il kicker è guidato sotto */
            if(src.gk&&src.team==='away')return;/* il portiere che para è guidato sotto */
            if(src.gk){animOne(pp.mesh,-8,14,aDt,ak,-8,14);return;}
            const _line=src.team==='away'?1:0;const _ix=ii%11;
            const _mx=-2-_line*4.5,_mz=(_ix-5)*3.4;
            animOne(pp.mesh,_mx,_mz,aDt,ak,_mx,_mz);
            if(pp.mesh._aL&&pp.mesh._aR){pp.mesh._aL.rotation.x=-0.5;pp.mesh._aR.rotation.x=-0.5;}/* abbracciati in fila */
          });
          if(sr.current._soKicker!==hero)animOne(hero,-2,8.6,aDt,ak,-2,8.6);/* [7.33.1 collaudo PO «non scompaiono mai dalla scena»] l'eroe (mesh separato, fuori dal loop qui sopra) torna in FILA quando non calcia */
          const _gkS=awayGkMesh;
          /* [7.168.0 collaudo PO «durante i rigori il portiere deve rimanere FERMO SULLA LINEA in attesa del tiro,
             come da regolamento FIFA»] prima aspettava a x=45.4 (~3m DAVANTI alla linea: i pali sono a 48.6) e
             nella fase d'annuncio restava dove l'aveva lasciato il tuffo precedente. Ora: attesa SULLA linea
             (x=48.0, z=0, eretto) anche tra un rigore e l'altro; il tuffo resta solo laterale (z) → mai avanti. */
          if(_gkS&&!_k){_gkS.position.x+=(48.0-_gkS.position.x)*Math.min(aDt*3,1);_gkS.position.z+=(0-_gkS.position.z)*Math.min(aDt*3,1);_gkS.position.y=0;_gkS.rotation.z=0;}
          if(_k&&sr.current._soKey!==_k.key){
            sr.current._soKey=_k.key;sr.current._soT0=now;sr.current._soShook=false;
            if(_bl)_bl.position.set(35,0.35,0);
            if(_gkS){_gkS.position.set(48.0,0,0);_gkS.rotation.z=0;_gkS.position.y=0;}/* [7.168.0] SULLA linea (FIFA) */
            /* [7.33.1 collaudo PO «i rigoristi sono sempre gli stessi 2»] kicker scelto per INDICE del rigore:
               l'i-esimo mesh outfield della squadra (l'eroe calcia il 5° della sua serie, come da design 7.31.0;
               in sudden death la rotazione riparte). Il kicker PRECEDENTE rientra in fila da solo (loop sopra)
               dopo il reset della posa qui sotto. */
            const _idx=Math.floor((_k.key||0)/2);
            const _pickT=(team)=>{const arr=[];sr.current.players.forEach((pp,ii)=>{const s=(P.allPlayers||[])[ii];if(s&&s.team===team&&!s.gk&&pp.mesh)arr.push(pp.mesh);});return arr;};
            let _km=hero;
            if(_k.side==="A"){const arr=_pickT('away');_km=arr.length?arr[_idx%arr.length]:hero;}
            else{const arr=_pickT('home');_km=(_idx%5===4||!arr.length)?hero:arr[_idx%arr.length];}
            const _old=sr.current._soKicker;
            if(_old&&_old!==_km){if(_old._hd)_old._hd.rotation.x=0;if(_old._aL){_old._aL.rotation.x=-0.5;_old._aR.rotation.x=-0.5;}_old.position.y=0;}
            sr.current._soKicker=_km;
            _km.position.set(32.8,0,1.1);_km._px=32.8;_km._pz=1.1;_km._vx=0;_km._vz=0;
          }
          if(_k&&sr.current._soT0!=null){
            const _u=(now-sr.current._soT0)/1000;const _km=sr.current._soKicker||hero;
            _km.rotation.y=Math.atan2(46-_km.position.x,0-_km.position.z);
            if(_u<0.55){_km.position.y=Math.abs(Math.sin(_u*6))*0.02;}
            else if(_u<0.85){const _r=(_u-0.55)/0.30;_km.position.x=32.8+(34.6-32.8)*_r;_km.position.z=1.1*(1-_r);_km.position.y=0;}
            else{
              const _f=Math.min((_u-0.85)/0.5,1);
              const _dir=_k.dir||0;const _zT=_k.wide?((_dir||1)*5.1):(_dir===0?0.35:_dir*2.65);
              const _yT=_k.high?1.85:0.55;
              if(_bl){
                if(_f<1||_k.scored===undefined){}
                if(_f<=1){
                  _bl.position.x=35+((_k.wide?48.4:48.2)-35)*_f;/* [7.168.0] il tiro arriva alla LINEA (48.2), non 2m prima */
                  _bl.position.z=_zT*_f;
                  _bl.position.y=0.35+(_yT-0.35)*_f+Math.sin(_f*Math.PI)*0.5;
                }
                if(_k.scored&&_f>=1){_bl.position.x=48.8;/* [7.168.0] il gol si assesta DENTRO la rete (oltre 48.6) */_bl.position.y=Math.max(0.45,_bl.position.y-aDt*2);_bl.position.z=clamp(_zT,-3.2,3.2);}
                if(!_k.scored&&!_k.wide&&_f>=0.8){_bl.position.x=47.3;/* [7.168.0] la parata respinge davanti al GK sulla linea */_bl.position.z=_zT*0.86;_bl.position.y=Math.max(0.3,_bl.position.y-aDt*3.2);}
                if(_k.wide&&_f>=1){_bl.position.x=Math.min(_bl.position.x+aDt*6,49.6);_bl.position.y=Math.max(0.3,_bl.position.y-aDt*2.4);}
              }
              if(_gkS&&_f>0.10){const _gu=Math.min((_f-0.10)/0.75,1);const _gs=_gu*_gu*(3-2*_gu);/* [7.33.1 collaudo PO «i portieri non si tuffano in maniera fluida»] smoothstep (via le rampe lineari) + finestra più ampia */
                const _gDir=(!_k.scored&&!_k.wide)?(_zT>=0?1:-1):-((_dir||1));
                const _gzT=(!_k.scored&&!_k.wide)?_zT*0.86:_gDir*2.5;
                _gkS.position.z=_gzT*_gs;
                _gkS.position.y=Math.sin(Math.min(_gs*1.25,1)*Math.PI)*((!_k.scored&&!_k.wide)?0.62:0.5);
                _gkS.rotation.z=(_gzT>=0?-1:1)*_gs*1.15;
              }
              if(_f>=1&&!sr.current._soShook){sr.current._soShook=true;
                if(_k.scored){shakePow=0.5;crowdOhT=0;}else{crowdOhT=0;}
              }
              if(_f>=1&&_u>=1.35){const _e=Math.min((_u-1.35)/0.6,1);
                if(_km._aL&&_km._aR){
                  if(_k.scored){_km._aL.rotation.x=-2.2*_e;_km._aR.rotation.x=-2.2*_e;_km.position.y=Math.abs(Math.sin(_u*6))*0.18*_e;}
                  else{if(_km._hd)_km._hd.rotation.x=-0.8*_e;}
                }
              }
            }
          }
        } else if(sr.current._soKey!=null){sr.current._soKey=null;sr.current._soT0=null;sr.current._soKicker=null;if(awayGkMesh){awayGkMesh.rotation.z=0;awayGkMesh.position.y=0;}}
        // 3DV-13/14: reazione eroe post-azione — miss (testa bassa) o fist (pugno vittoria)
        if(heroPostT>=0){heroPostT+=aDt;const _hpu=Math.min(heroPostT/1.6,1),_hsw=Math.sin(_hpu*Math.PI);
          if(heroPostType==="miss"){if(hero._hd)hero._hd.rotation.x=-_hsw*0.9;hero._aL.rotation.z=_hsw*1.3;hero._aR.rotation.z=-_hsw*1.3;hero.position.y=0;}
          else if(heroPostType==="fist"){const _fu=Math.min(_hpu*2,1),_fd=Math.max(0,_hpu*2-1);hero._aR.rotation.x=-_fu*(1-_fd)*2.2;hero._aR.rotation.z=_fu*(1-_fd)*0.6;hero.position.y=_fu*(1-_fd)*0.3;}// 3DV-14: braccio destro su, poi giù
          else if(heroPostType==="recv"){/* [7.311.0] CONTROLLO: chi si e' smarcato ADDOMESTICA il pallone —
             piede che va sulla palla e braccia che bilanciano. Tutto scalato da _hsw = sin(u·π) → si azzera
             da solo a u=1 (invariante CINE-VAR), nessun cleanup assoluto necessario. GLB-ON domina comunque
             la clip `receive` che l'actType «build» gia' richiede. */
            if(hero._lR)hero._lR.rotation.x=-_hsw*0.55;if(hero._aL)hero._aL.rotation.z=_hsw*0.5;if(hero._aR)hero._aR.rotation.z=-_hsw*0.35;hero.position.y=0;}
          if(_hpu>=1){heroPostT=-1;heroPostType=null;if(hero._hd)hero._hd.rotation.x=0;hero._aL.rotation.z=0;hero._aR.rotation.z=0;hero._aR.rotation.x=0;hero.position.y=0;}}
        // 3DV-FIX3: esultanza compagni sul gol di casa — braccia alzate + saltello (home outfield = indici 1-9)
        if(goalBurstHome&&goalBurstT>=0){const _ta=Math.min(goalBurstT/0.5,1)*Math.max(0,1-goalBurstT/1.8);
          sr.current.players.forEach((pp,ii)=>{if(ii>0&&ii<10&&pp.mesh){pp.mesh._aL.rotation.x=-2.0*_ta;pp.mesh._aR.rotation.x=-2.0*_ta;pp.mesh._aL.rotation.z=-0.4*_ta;pp.mesh._aR.rotation.z=0.4*_ta;pp.mesh.position.y=Math.abs(Math.sin(goalBurstT*6+ii*1.3))*0.38*_ta;}});}
        // CINE-6: gonfiamento rete al gol — rilevamento fronte di salita su hlInNetFlashed (vale per ogni handler in_net)
        if(hlInNetFlashed&&!prevInNet){netBulgeT=0;const _ogn=propsRef.current.onGoalInNet;if(_ogn)try{_ogn();}catch(e){}}// 5.43.4: segnala alla UI che la palla è ENTRATA → l'esultanza/"GOL" parte solo ora (no accavallamento con l'azione)
        prevInNet=hlInNetFlashed;
        if(netBulgeT>=0&&sr.current.goalNet){netBulgeT+=aDt;const _nu=Math.min(netBulgeT/0.8,1);
          const _bulge=Math.sin(Math.min(_nu,0.5)*Math.PI)*Math.exp(-_nu*2.0);// spinge in fuori poi si calma
          const _gn=sr.current.goalNet,_rx=_gn._restX!==undefined?_gn._restX:_gn.position.x;
          _gn.position.x=_rx+_bulge*1.5;_gn.material.opacity=0.42+_bulge*0.45;
          if(_nu>=1){_gn.position.x=_rx;_gn.material.opacity=0.42;netBulgeT=-1;}}
        // CINE-6: delusione portiere avversario al gol subìto — testa bassa + braccia sconsolate
        if(concededT>=0&&awayGkMesh){concededT+=aDt;const _cu=Math.min(concededT/2.0,1),_csw=Math.sin(_cu*Math.PI);
          if(awayGkMesh._hd)awayGkMesh._hd.rotation.x=_csw*1.0;
          awayGkMesh._aL.rotation.z=_csw*0.6;awayGkMesh._aR.rotation.z=-_csw*0.6;
          if(_cu>=1){concededT=-1;if(awayGkMesh._hd)awayGkMesh._hd.rotation.x=0;awayGkMesh._aL.rotation.z=0;awayGkMesh._aR.rotation.z=0;}}
        // 3DV-13: portiere si rialza e alza le braccia dopo la parata
        if(gkSaveCelebT>=-0.12){gkSaveCelebT+=aDt;if(gkSaveCelebT>=0&&gkSaveMesh){const _gcu=Math.min(gkSaveCelebT/1.1,1),_gcsw=Math.sin(_gcu*Math.PI);
          gkSaveMesh.position.y=_gcsw*0.65;const _arm=_gcsw*1.5;gkSaveMesh._aL.rotation.z=-_arm;gkSaveMesh._aR.rotation.z=_arm;gkSaveMesh._aL.rotation.x=-_gcsw*0.7;gkSaveMesh._aR.rotation.x=-_gcsw*0.7;
          if(_gcu>=1){gkSaveCelebT=-1;gkSaveMesh.position.y=0;gkSaveMesh.rotation.z=0;gkSaveMesh._aL.rotation.z=0;gkSaveMesh._aR.rotation.z=0;gkSaveMesh._aL.rotation.x=0;gkSaveMesh._aR.rotation.x=0;gkSaveMesh=null;}}}/* [6.74.0 3D-12] rimosso lo snap position.z=_divePz (teletrasporto fino a ±9u a fine esultanza): il rientro in posizione lo fa il target off-ball con lerp naturale */
        // [6.38.0 collaudo PO «i replay nel live match eliminali»] REPLAY DISABILITATO: il riavvolgimento a
        //   fine esito (camera-replay alta laterale + overlay «REPLAY») è rimosso su richiesta. La macchina a
        //   stati resta dormiente (replaying mai true → driveReplay/overlay/camera-replay mai attivi).
        //   [6.76.0 LMV-P1] anche recordSnap è SPENTO (scriveva ~53 float/frame in un ring buffer che nessuno
        //   consuma — i replay non torneranno per direttiva PO). Per riabilitare: `if(isHL)recordSnap();` +
        //   trigger 3DV-12 `if(isResult&&!replaying&&!replayDone&&resultT>=3.2&&repCount>=25){…setReplayOn(true);}`.
      }

      // ---- Camera: scorrimento sul walkout, broadcast in gioco, stacco ravvicinato negli highlight ----
      const hx=hero.position.x,hz=hero.position.z;
      // Sprint 3D-6b: a fine azione (hl_result) la regia "va sulla palla" — focus automatico sull'esito
      bf+=((isResult?1:0)-bf)*Math.min(dt*2.5,1);
      const wBall=0.6+0.30*bf; // palla più pesante nel centro azione durante l'esito
      const ax=bx*wBall+hx*(1-wBall),az=bz*wBall+hz*(1-wBall);
      // 3DV-5: blend target per fase — intro 55%, move/choose 82%, result 100%
      const _ph5=P.matchPhase;const _hlTgt=isResult?1.0:(_ph5==="hl_move"||_ph5==="hl_choose")?0.82:_ph5==="hl_intro"?0.55:0;
      camHL+=(_hlTgt-camHL)*Math.min(dt*(_hlTgt>=camHL?3.2:1.7),1);// 4.86.0: zoom-IN reattivo, zoom-OUT più morbido → niente cambi bruschi tra highlight
      /* [7.228.0 #48 collaudo PO «non si vede il movimento dell'eroe con la palla» ×12] LO STACCO ATTERRA
         SULL'INQUADRATURA NUOVA. Lo snap di scena tagliava la POSIZIONE camera ma al blend WIDE↔CLOSE ancora
         largo (camHL≈0 al primo frame della scena): il taglio finiva su un campo totale da (-85,53) e la regia
         LERPAVA fino alla camera ravvicinata in ~2-4s — l'intera azione (dribbling, esterno, tacco) si giocava
         durante il viaggio, con l'eroe minuscolo. Una regia vera non zooma dopo il taglio: taglia già composta. */
      /* [7.503.1 F6/1] IL TESTIMONE VIVE SU `sr.current`, NON IN UNA `const` LOCALE. La prima stesura lo
         dichiarava dentro il ramo degli highlight e raccoglieva subito dopo il `guinzaglio` — cosi' le tre
         passate che girano PIU' A VALLE (arretramento per bisezione, guardia sullo snap, clamp sulla vista
         reale) restavano fuori dal conto, e il censimento diceva 5 su 8 senza poter fare di meglio. Qui si
         azzera una volta per fotogramma e si raccoglie alla fine, quando tutte hanno parlato. */
      sr.current._tocc503=[];sr.current._leg563=0;/* [7.563.0] quante reti di LEGALITA' hanno gia' scritto in questo fotogramma */
      if(sr.current._cutZoomSnap){camHL=_hlTgt;sr.current._cutZoomSnap=false;}
      let tPx,tPy,tPz,tLx,tLy,tLz,kp,kl;
      if(isWalk){
        // [6.89.0 collaudo PO «all'ingresso mostra l'intero stadio a 360°, non solo curva casalinga e distinti»]
        //   GIRO COMPLETO: la camera ORBITA attorno al centro del campo (ellisse: lo stadio è più largo che
        //   profondo) con quota che scende, sguardo verso la tribuna OPPOSTA attraverso il campo → in un giro
        //   si vedono TUTTE e quattro le tribune (curve comprese) con tifo/coreografie. Nell'ultimo tratto
        //   converge sulla carrellata bassa della fila che entra (transizione morbida al kickoff).
        const prog=Math.min(walkT/WALK_DUR,1);
        if(prog<0.85){
          const _th=-Math.PI/2+(prog/0.85)*Math.PI*2;// partenza dietro la porta di casa, giro completo antiorario
          const _rad=46-6*prog,_hgt=26-9*prog;// orbita DENTRO il catino (sopra il bordo campo, mai dentro le tribune)
          tPx=Math.cos(_th)*_rad;tPy=_hgt;tPz=Math.sin(_th)*_rad*0.60;
          tLx=Math.cos(_th+Math.PI)*40;tLy=8-4*prog;tLz=Math.sin(_th+Math.PI)*26;// sguardo alla tribuna OPPOSTA: campo+anello in quadro
          kp=Math.min(dt*1.9,1);kl=Math.min(dt*1.9,1);// [6.90.0] lerp più morbido: movimento lento, mai frenetico
        } else {// chiusura: carrellata bassa lungo la fila dei giocatori che entrano
          const panZ=-32+64*prog;tPx=-42;tPy=9.5;tPz=panZ;tLx=-11;tLy=2.0;tLz=panZ*0.5;
          kp=Math.min(dt*2.0,1);kl=Math.min(dt*2.6,1);
        }
      } else {
        // WIDE — broadcast dietro la porta di casa, segue il centro azione con leggero parallasse
        // 3DV-5: attack zoom — camera avanza/scende quando palla in area avanzata (bx>0→bx>42)
        /* [7.561.0 — LA CRONACA SEGUE L'AZIONE ANCHE QUANDO ATTACCA L'AVVERSARIO, E CAMBIA CAMPO A META']
           Collaudo PO 24 ago: «il pallone spesso esce fuori dalla scena, la telecamera non segue l'azione;
           le giocate offensive avversarie sono nascoste dalla curva e tribuna». Censimento `quadro-561` su
           2396 fotogrammi di cronaca: FUORI QUADRO il 41,3% dei fotogrammi quando attacca l'avversario,
           lo 0,0% quando attacchiamo noi, con `ndc.y` fino a -102 — e -102 non e' «un po' fuori»: e' il
           pallone DIETRO la camera. La causa sono due costanti che si sommano, entrambe scritte per il
           verso offensivo e mai riviste per l'altro:
             (1) lo zoom d'attacco (6.76.0) fu reso «simmetrico» usando |bx|, quindi quando la palla scende
                 nella NOSTRA meta' la camera AVANZA verso il centro (fino a +6) mentre il pallone va
                 all'estremo opposto: si allontanano l'uno dall'altra;
             (2) il punto di fuoco e' clampato a -34 mentre il pallone arriva a -48,6 (linea di porta).
           Insieme: camera a -38, fuoco a -34, pallone a -48 → il pallone e' dieci unita' DIETRO l'obiettivo.
           Qui lo zoom d'attacco diventa asimmetrico per davvero — avanza quando attacchiamo, ARRETRA
           quando ci attaccano — e il fuoco puo' seguire il pallone fin sulla linea.
           E il CAMBIO CAMPO chiesto dal PO: nella ripresa tutto il calcolo gira su coordinate ruotate di
           180 gradi (x e z, cosi' e' una rotazione e non uno specchio: le tribune si scambiano di posto
           invece di ribaltarsi) e il risultato si riporta indietro. La simulazione non viene toccata.
           __CPM_NO561 = rosso: camera del 7.560, nessun cambio campo. */
        const _r561=!(typeof window!=='undefined'&&window.__CPM_NO561)&&P.matchPhase==="playing"&&!P.ceremony&&!P.shootout&&!replaying;
        const _m561=(_r561&&P.half===2)?-1:1;/* +1 primo tempo · -1 ripresa (rotazione di 180°) */
        const bxq=bx*_m561,bzq=bz*_m561,axq=ax*_m561,azq=az*_m561;/* coordinate canoniche: la camera sta sempre dietro la porta a x negativo */
        const _bAttk=P.matchPhase==="playing"?clamp(Math.abs(bxq)/42,0,1):0;/* [6.76.0 LMV-C2] zoom SIMMETRICO: prima solo bx>0 → quando l'avversario attaccava la porta di casa niente zoom e fuoco clampato a -8 mentre l'azione era a -46 (difesa sotto-inquadrata) */
        const wPxq=(-51+(_r561?(bxq>=0?_bAttk*13:-_bAttk*7):_bAttk*(bxq>=0?13:6)))+clamp(axq,-50,50)*0.14+Math.sin(now*0.00025)*2.5,/* [7.561.0] con la palla nella NOSTRA meta' la camera arretra (fino a -58) invece di avanzare: e' l'unico verso che avvicina inquadratura e azione *//* 1.0a-CAM3: avanti -88→-74; [7.525.0] -74→-67. [7.528.0] -67→-62 · [7.529.0 PO «più vicina al campo!»] -62→-56 · [7.532.0 PO secondo giro «in cronaca un po' più vicina»] -56→-51 (avanzata 14→13) */
              wPy0=(32-_bAttk*7)+Math.sin(now*0.00018)*1.8,/* 1.0a-CAM3: 54→47; [7.525.0] 47→42 · [7.528.0] 42→39 · [7.529.0] 39→35 · [7.532.0] 35→32 (piu' vicina = anche un filo piu' bassa) */
              wPzq=azq*0.34;
        // [7.54.1 BL-10 · CAM-LEAD] ANTICIPAZIONE BROADCAST: in "playing" il fuoco della WIDE non insegue più
        //   la palla in ritardo (fuoco = posizione corrente) ma la PRECEDE nella direzione del moto — velocità
        //   EMA dt-corretta, bounded (±9u x · ±6u z), azzerata sui teleport di setup (cut di scena, non moto).
        //   SOLO in "playing": nelle fasi HL la regia è autoriale per-tipo (e la firma golden resta intatta).
        {const _cs9=sr.current;
         if(_cs9._camPbx==null){_cs9._camPbx=bxq;_cs9._camPbz=bzq;_cs9._camVbx=0;_cs9._camVbz=0;}
         if(Math.abs(bxq-_cs9._camPbx)>12||Math.abs(bzq-_cs9._camPbz)>12){_cs9._camVbx=0;_cs9._camVbz=0;}/* il cambio campo a meta' partita e' un salto di 2x: questa guardia lo tratta gia' come un teleport e azzera l'anticipo, che e' quello che serve */
         else if(dt>0){const _ka9=Math.min(dt*4,1);
           _cs9._camVbx+=(clamp((bxq-_cs9._camPbx)/dt,-40,40)-_cs9._camVbx)*_ka9;
           _cs9._camVbz+=(clamp((bzq-_cs9._camPbz)/dt,-40,40)-_cs9._camVbz)*_ka9;}
         _cs9._camPbx=bxq;_cs9._camPbz=bzq;}
        const _ld9=(P.matchPhase==="playing"&&!P.ceremony&&!P.shootout)?1:0;
        const _ldx9=clamp((sr.current._camVbx||0)*0.30,-9,9)*_ld9,_ldz9=clamp((sr.current._camVbz||0)*0.30,-6,6)*_ld9;
        const wLxq=clamp(clamp(axq*0.5+bxq*_bAttk*0.2+(bxq>=0?14:4),bxq<0?(_r561?Math.max(-47,Math.min(-34,bxq-2)):-34):-8,52)+_ldx9,_r561?-49:-38,54)+Math.sin(now*0.00031)*1.2,wLy=1.4,wLzq=azq*0.6+_ldz9;/* [7.561.0] con la palla nella nostra meta' il fuoco la SEGUE fin sulla linea (-47) invece di fermarsi a -34 lasciandola fuori */
        /* [7.561.0] si torna dalle coordinate canoniche al mondo: nella ripresa e' una rotazione di 180° */
        /* [7.561.0] E IL FUOCO SEGUE DAVVERO. Contenere non basta: col fuoco ancorato all'eroe (formula
           storica) il pallone nella nostra meta' restava a diciassette unita' dal punto guardato e la
           camera compensava ARRETRANDO — l'azione finiva incollata al bordo basso del quadro. Piu' il
           gioco scende verso la nostra porta, piu' il fuoco si sposta SUL pallone (un filo davanti):
           a meta' campo non cambia niente, sulla nostra linea il fuoco e' il pallone. */
        const _seg561=_r561?clamp((-bxq)/34,0,1)*0.85:0;
        const wLxr=wLxq+((bxq+6)-wLxq)*_seg561,wLzr=wLzq+(bzq*0.9-wLzq)*_seg561;
        /* [7.564.0 — IMPIANTO CAMERA DELLA CRONACA: LA TRIBUNA EST. Scelta del PO, dopo aver guardato i
           provini del 7.561: «impianto camera vero ed inversione di campo tra primo e secondo tempo».
           PERCHE' SERVIVA UN IMPIANTO E NON UNA TARATURA. Da dietro la porta la geometria e' asimmetrica
           per costruzione: l'azione nella propria meta' finisce quasi SOTTO la camera, e il 7.561 poteva
           solo contenerla (fuori quadro 30,6% -> 1,2%), non renderla grande. Di lato le due meta' del
           campo sono equivalenti: la stessa azione si vede uguale da una parte e dall'altra.
           IL VINCOLO CHE HA DECISO I NUMERI e' il quadro VERTICALE del telefono. Il semiquadro
           ORIZZONTALE vale atan(tan(fov/2)*aspect): a fov 46 e aspect 0,45 sono ~11 gradi, e alla distanza
           della tribuna significano ~20 unita' di lunghezza di campo — troppo poche. Il rimedio non e'
           allontanare la camera (fuori c'e' la tribuna) ma APRIRE L'OTTICA: a fov 64 il semiquadro
           orizzontale sale a ~15 gradi e si inquadrano ~33 unita' di lunghezza, mentre in VERTICALE ci
           sta l'INTERA larghezza del campo (66 unita', entrambe le linee laterali). E' la composizione
           che il formato verticale sa reggere: tutta la larghezza, un terzo della lunghezza, il pallone
           al centro. L'ottica si apre SOLO qui: negli highlight resta 46 e la firma golden non si muove.
           QUOTA E DISTANZA sono prese dalla geometria REALE dello stadio (`_curveGeo`), non da costanti:
           z sul fronte della tribuna, y fra il primo e il secondo anello — sopra i cartelloni a bordo
           campo, sotto il tetto. Il maxischermo sta a x=+55, dietro la porta: non entra in questa linea
           di vista (e il cartellone della competizione, che ci finiva in mezzo, e' stato tolto nel 7.562).
           INVERSIONE DI CAMPO: la rotazione di 180 gradi del 7.561 vale anche qui — nella ripresa la
           camera passa alla tribuna opposta, quindi chi attaccava verso destra attacca verso sinistra.
           __CPM_NO564 = rosso: torna la camera da dietro la porta del 7.561. */
        let wPy=wPy0;/* [7.564.0] la quota della regia larga smette di essere una costante della formula: l'impianto laterale la ricalcola dalla geometria dello stadio */
        let wPx=wPxq*_m561,wPz=wPzq*_m561,wLx=wLxr*_m561,wLz=wLzr*_m561;
        let _fov564=46;
        if(_r561&&!(typeof window!=='undefined'&&window.__CPM_NO564)){
          const _cg=sr.current._curveGeo||null;
          const _ez=(_cg&&_cg.endZ)||50,_eh=(_cg&&_cg.hEnd)||13;
          const _lead=clamp((sr.current._camVbx||0)*0.22,-7,7);
          /* [7.565.0 collaudo PO «la copertura della tribuna impalla la camera»] LA CAMERA STA DAVANTI AL
             FILO DELLA FALDA, e il filo non si indovina: lo esporta buildStadium. La copertura vera (7.437)
             e' a SBALZO — sporge verso il campo di 0,40-0,62 volte la profondita' del settore — quindi negli
             impianti grandi arrivava DAVANTI alla camera del 7.564 e ne tagliava la linea di vista. Qui la
             camera si appende due unita' e mezzo PIU' AVANTI del filo, come una gru sotto la pensilina:
             cosi' il tetto resta sempre alle sue spalle, per costruzione e per ogni taglia di stadio,
             invece che per una quota scelta a occhio. Se un impianto non ha copertura, non c'e' vincolo. */
          const _rf=(_cg&&_cg.roofEnd)||null;
          const _zc=Math.min(_ez-1.5,_rf?(_rf.frontZ-2.5):1e9);
          wPz=_zc*_m561;
          if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST)){try{window.__CPM_RIG565={camZ:+_zc.toFixed(2),roofZ:_rf?+_rf.frontZ.toFixed(2):null,roofY:_rf?+_rf.top.toFixed(2):null,endZ:+_ez.toFixed(2),endH:+_eh.toFixed(2),davanti:_rf?(_zc<_rf.frontZ?1:0):1};}catch(_e){}}/* [7.565.0] l'invariante si puo' CONTROLLARE, non solo guardare: la camera deve stare piu' vicina al campo del filo della falda */
          /* [7.564.0 — LA QUOTA E L'OTTICA SI SCELGONO GUARDANDO, E IL PRIMO GIRO ERA SBAGLIATO.
             Con la camera a quota 15-26 e ottica 64 il provino mostrava un terzo di schermo occupato da
             tetto e cielo e, in basso, i cartelloni della linea vicina dentro l'inquadratura. La causa e'
             angolare e si calcola: la depressione verso il pallone era ~21 gradi contro un semiquadro
             verticale di 32 — quindi il bordo alto puntava 11 gradi SOPRA l'orizzonte e il bordo basso
             cadeva a 53, cioe' sulle strutture vicine. Alzando la camera la depressione cresce e il quadro
             scende sul campo; chiudendo l'ottica il bordo basso risale sopra i cartelloni (a 58 gradi di
             fov il bordo si ferma a ~59, i cartelloni vicini stanno a ~62: fuori per costruzione). */
          wPy=clamp(_eh*0.9+16,24,32);
          wPx=(clamp(bxq+_lead,-42,42))*_m561;/* [7.564.0] LA CORSA DEL CARRELLO, e un'ipotesi mia smentita dalla sua misura. Avevo attribuito le 61 uscite «di lato» del censimento al fermo del carrello a ±30 (linea di porta a ±48,6): allargato a ±42, le uscite di lato sono rimaste 64. NON era quello. Il residuo (2,5% dei fotogrammi) e' il RITARDO dei lerp — camera e sguardo inseguono il bersaglio con una costante di tempo, e su un pallone a 34u/s lo scarto vale una decina di unita', che a questa distanza e' il bordo del quadro. La corsa a ±42 resta comunque, ma per la ragione giusta: un carrello che accompagna l'azione fin dentro l'area tiene il gioco al centro invece di guardarlo da lontano. */
          wLx=bx;wLz=bz*0.30;
          _fov564=58;
        }
        if(camera&&Math.abs((camera.fov||46)-_fov564)>0.01){camera.fov=_fov564;camera.updateProjectionMatrix();}/* 1.0a-CAM3: fuoco un filo più avanti+basso; [6.76.0 LMV-C2] lato difensivo: fuoco fino a -34 (l'azione resta in quadro), path offensivo INVARIATO; [7.54.1] +lead di anticipazione */
        // CLOSE — stacco ravvicinato; il punto di fuoco scivola dall'eroe alla palla a fine azione
        /* [7.363.0 collaudo PO #76 «sul corner la camera e' troppo lontana»] IL FUOCO ABBANDONAVA L'EROE.
           La regia CLOSE interpola il punto di fuoco dall'eroe ALLA PALLA (`bf` cresce durante l'azione):
           su un corner la palla sta sulla bandierina e l'eroe in area, quindi il fuoco ci finisce sopra.
           MISURATO su otto scene da fondo: il fuoco arriva fino a 74,6 unita' mondo dall'eroe (gi36) e
           l'eroe resta FUORI QUADRO per 190 fotogrammi su 192; su gi76, la scena della nota, 27,0 unita' e
           55 fotogrammi su 210 fuori quadro. E non e' un difetto dei soli corner: il controllo gi44, una
           difensiva sulla propria area, sta a 63,3 unita' con 164 fotogrammi su 168 fuori quadro. Le scene
           sane stanno fra 16 e 20 (gi0 20,4 · gi26 16,1 · gi8 19,5).
           Il tetto sta dove finiscono le scene sane: il fuoco puo' scivolare verso la palla ma non oltre 18
           unita' dall'eroe (12,6 in profondita', dove il campo e' compresso di 0,68). Non e' una regola per
           i corner — e' la regola generale che mancava: chi guardiamo e' il protagonista, la palla decide
           solo la DIREZIONE dello sguardo. */
        const _fc63=18;
        const fX=hx+clamp((bx-hx)*bf,-_fc63,_fc63),fZ=hz+clamp((bz-hz)*bf,-_fc63*0.7,_fc63*0.7);
        let cPx=clamp(fX-25.5,-66,22),cPy=11.9-bf*2.2,cPz=fZ*0.50;/* [7.532.0 PO terzo giro «zoom highlights minore, camera ancora più lontana»] -23→-25,5 · 11,2→11,9 — il censimento framing (mediana ≥0,11) resta il pavimento *//* 1.0a-CAM2 · [6.78.0 PO «zooma meno»]: -13→-16, 8.0→9.2 · [7.525.0] -16→-18 · [7.528.0] -18→-20 · [7.529.0 PO «più lontana!»] -20→-23, 10.4→11.2 — il censimento (taglia mediana ≥0,11) resta il pavimento — il censimento framing (mediana taglia >=0,11) e' il guardiano che impedisce di comprare larghezza con un eroe minuscolo */
        let cLx=fX+13,cLy=1.2-bf*0.4,cLz=fZ*0.82;/* 1.0a-CAM2: sguardo ancora più basso (1.7→1.2) → pitch giù, taglia di più la banda di cielo morto */
        // Sprint 3D-7: camera dedicata su rigore/punizione — bassa, dietro la palla verso la porta
        if(isHL&&(P.hlType==="penalty"||P.hlType==="freekick")){
          /* [7.233.0 #50 revisione percettiva «non si capisce nulla» su gi15, confermata a vista sui fogli-provini]
             LA PUNIZIONE DALLA FASCIA GUARDA L'AREA, NON LA TRIBUNA. La regia unica (cPz=bz*0.7 · cLz=bz*0.5)
             è pensata per la palla CENTRALE: sulla fascia (|bz|>14) l'asse ottico finiva ~13u più interno del
             battitore — l'eroe sul bordo del quadro e il centro dell'inquadratura sulla tribuna di fronte col
             maxischermo. Ora la camera si mette leggermente ESTERNA alla palla e l'asse taglia il campo verso
             l'AREA: battitore in primo piano, la zona dove la palla andrà a cadere nel quadro, erba (non spalti). */
          const _fkZ50=((P.playerY!=null?P.playerY:50)-50)*0.68;/* fascia del BATTITORE (statica per tutta la scena): il primo tentativo leggeva la z VIVA della palla e a metà esito — palla in volo verso l'interno — il ramo flippava alla regia centrale con la camera che ruotava sulla tribuna (misurato: cam z 26→12 in-scena) */
          if(P.hlType==="freekick"&&Math.abs(_fkZ50)>14){
            /* stessa inquadratura COLLAUDATA del cross dal secondo palo (FAR_POST_CROSS): la punizione dalla
               fascia È un cross — laterale alta che abbraccia battitore e area, asse verso il lato opposto
               (l'erba riempie il quadro, non la tribuna di fronte: il tentativo «camera esterna + asse
               interno» a tilt basso riempiva il viewport verticale di spalti, misurato e buttato). */
            cPx=clamp(bx-8,-66,22);cPy=7.5;cPz=clamp(_fkZ50*1.25+(_fkZ50>=0?14:-14),-30,30);
            cLx=AWAY_GOAL_X-8;cLy=2.4;cLz=-_fkZ50*0.4;
          } else {
            cPx=clamp(bx-18,-96,-4);cPy=6.5;cPz=bz*0.7;cLx=bx+24;cLy=1.4;cLz=bz*0.5;
          }
        } else if(isHL&&P.hlType==="header"){
          // CINE-2: camera dedicata per variante testa
          if(P.hlVariant==="header_diving"){cPx=clamp(fX-16,-80,16);cPy=3.2;cLy=0.8;}/* rasoterra — accompagna il tuffo */
          else{cPy=Math.max(cPy,7);cLy=3.8;}/* near/far post — guarda su */
        } else if(isHL&&P.hlType==="tackle"){cPx=clamp(fX-12,-80,18);cPy=4.0-bf;cLy=1.2;}
        else if(isHL&&P.hlType==="cross"){
          // CINE-5: regia per-pattern del cross — side tracking che segue il volo verso l'area
          const _pat=P.hlPattern;
          if(_pat==="FAR_POST_CROSS"){cPx=clamp(fX-6,-66,22);cPy=7.5;cPz=clamp(fZ*1.25+(fZ>=0?14:-14),-30,30);cLx=AWAY_GOAL_X-8;cLy=2.4;cLz=-fZ*0.4;}/* laterale alta — abbraccia l'area fino al secondo palo · [6.74.0 3D-10] clamp ±30: da corsia estrema il target camera finiva a ±37 (radente bandierina/dugout) */
          else if(_pat==="CUTBACK"){cPx=clamp(fX-14,-74,14);cPy=4.2;cPz=fZ*0.9+(fZ>=0?6:-6);cLx=30;cLy=1.4;cLz=fZ*0.3;}/* bassa dietro — guarda il rimorchio sul dischetto */
          else{cPx=clamp(fX-10,-72,18);cPy=5.0;cPz=fZ*1.1+(fZ>=0?8:-8);cLx=fX+18;cLy=2.0;cLz=fZ*0.55;}/* NEAR_POST — ravvicinata sul primo palo */
        }
        else if(isHL&&P.hlType==="shot"){
          // CINE-2: camera dedicata per variante tiro
          if(P.hlVariant==="shot_chip"){cPy=Math.max(cPy,12);cLy=Math.max(cLy,4.5);}/* alta — segue la traiettoria alta */
          else if(P.hlVariant==="shot_one_on_one"){cPx=clamp(fX-14,-80,16);cPy=Math.min(cPy,5.5);cLy=1.8;}/* bassa ravvicinata — porta in visuale */
          else if(P.hlVariant==="shot_volley"){cPy=Math.max(cPy,8.5);cLy=2.8;}/* leggermente alta — valorizza il gesto atletico */
        }
        else if(isHL&&P.hlType==="pass"){
          // CINE-5: filtrante/combinazione — camera più larga che accompagna la corsa verso la porta
          if(P.hlPattern==="THROUGH_BALL"){cPx=clamp(fX-24,-86,8);cPy=Math.max(cPy,9);cLx=fX+22;cLy=1.6;}/* arretrata e alta — segue l'imbucata e lo scatto */
          else{cPx=clamp(fX-18,-82,12);cPy=Math.max(cPy,8);cLx=fX+16;cLy=1.8;}/* COMBINATION — segue il triangolo */
        }
        else if(isHL&&P.hlType==="dribble"){cPx=clamp(fX-12,-76,16);cPy=4.6;cLx=fX+14;cLy=1.4;}/* CINE-5: dribbling — camera bassa e stretta che insegue l'eroe */
        // [6.74.0 3D-9] «SPARITA LA PORTA» (thread PO): nelle fasi di LETTURA (choose/move) delle azioni a
        //   conclusione l'asse ottico seguiva la corsia dell'eroe (cLz=fZ*0.82) e su viewport portrait la porta
        //   usciva dal bordo. Blend del lookAt verso la porta REALE + z d'inquadratura più stretta.
        /* [7.503.0 F6/1 — QUANTE MANI TOCCANO L'INQUADRATURA, per fotogramma. OSSERVAZIONE, non arbitrato.
           La selezione della regia sopra e' pulita: una catena `if/else if` MUTUAMENTE ESCLUSIVA (walkout ·
           rigore/punizione · testa · tackle · cross · tiro · filtrante · dribbling). Il problema sta qui
           sotto: otto passate correttive INDIPENDENTI, ognuna nata in una release diversa per chiudere un
           sintomo diverso, che si sommano nello stesso fotogramma e possono disfare il lavoro l'una
           dell'altra. Due di esse — `bordo-lift` e `bordo-tanh` — scattano sulla STESSA condizione
           (`isHL && tPx < -46`): sono due correzioni allo stesso sintomo, scritte in momenti diversi.
           Qui non si cambia nulla: si CONTA, per sapere quante ingaggiano insieme prima di metterle sotto
           un arbitro con priorita' dichiarate. Prova del rosso: `__CPM_NO503` spegne il conteggio. */
        const _tc503=(nm)=>{try{if(typeof window!=='undefined'&&!window.__CPM_NO503&&sr.current._tocc503)sr.current._tocc503.push(nm);}catch(_e){}};
        if(isHL&&!isResult&&(P.hlType==="shot"||P.hlType==="cross"||P.hlType==="header"||P.hlType==="dribble")){_tc503('porta');
          /* [7.194.0 S1] la compressione dell'asse ottico verso la porta è ADATTIVA: con l'eroe sulla corsia
             esterna (|z|>14) comprimere del 30% lo spingeva oltre il bordo su viewport verticale. Finché l'eroe
             restava indietro nella corsa di avvicinamento il difetto era mascherato — ora che si posiziona
             davvero dov'è l'azione, va corretto: più l'eroe è largo, meno si comprime. */
          const _wd=clamp((Math.abs(hz)-13)/13,0,1);
          cLx=cLx*0.70+GOAL_LINE_X*0.30;cLz*=(0.70+0.26*_wd);
        }
        // 3DV-5: GK tracking — lookat si sposta verso il portiere su tiro/rigore/testa
        /* [7.581.0 — DUE INTENTI DI INQUADRATURA, NESSUN ARBITRO, rosso __CPM_NO581]
           COLLAUDO PO (appunti 7.578, SIT #155 e #115): «lo SGUARDO oscilla — 4,5 inversioni al secondo,
           ampiezza 7,7°, ultima passata per fotogramma: guinzaglio 45% + gk 31%». La bozza automatica
           nomina la coppia, e le due passate vogliono due cose diverse sulla STESSA scena di tiro:
           questa tira lo sguardo VERSO IL PORTIERE (35%), il guinzaglio (r. piu' sotto) lo riaggancia
           entro 22 unita' DALL'EROE. Su un tiro da fuori area l'eroe e il portiere sono piu' lontani di
           cosi': una tira fuori, l'altra riporta dentro, ogni fotogramma.
           NON E' UN CONFLITTO DA ARBITRARE, E' UNA COMPOSIZIONE DA FARE. In una regia vera quella non e'
           una scelta fra due soggetti: e' UN'INQUADRATURA SOLA che li contiene entrambi. Qui la meta si
           costruisce gia' dentro il guinzaglio — si punta verso il portiere ma non oltre il raggio che
           l'eroe concede, con un margine — quindi quando il guinzaglio arriva non trova piu' niente da
           correggere: una mano sola sullo sguardo, e il tiro alla fune sparisce per costruzione.
           ⚠️ NON MISURABILE QUI, come il 7.580: 4,5 inversioni al secondo contro 7fps headless, Nyquist
           le nasconde. Il giudice e' il dispositivo del PO, e la sua bozza NOMINA la coppia — quindi
           l'attribuzione resta possibile anche con due rimedi alla camera in volo insieme. */
        if(isHL&&awayGkMesh&&(P.hlType==="shot"||P.hlType==="penalty"||P.hlType==="header")){_tc503('gk');
          let _gx581=cLx*0.65+awayGkMesh.position.x*0.35,_gz581=cLz*0.65+awayGkMesh.position.z*0.35;
          if(!(typeof window!=='undefined'&&window.__CPM_NO581)){
            const _R581=22*0.92,_dx581=_gx581-hx,_dz581=_gz581-hz,_d581=Math.hypot(_dx581,_dz581);
            if(_d581>_R581){const _k581=_R581/_d581;_gx581=hx+_dx581*_k581;_gz581=hz+_dz581*_k581;}
          }
          cLx=_gx581;cLz=_gz581;}
        // 5.43.10: alla CONCLUSIONE d'attacco la camera INQUADRA LA PORTA + IL PORTIERE (la parata/il gol devono vedersi). Solo isResult → la firma golden (catturata al framing choose) NON cambia; resta sopra il campo.
        if(isResult&&!P.hlDef&&awayGkMesh&&(P.hlType==="shot"||P.hlType==="penalty"||P.hlType==="header"||P.hlType==="freekick")&&!(P.hlOutcomeKind==="wide"||P.hlOutcomeKind==="out"||P.hlOutcomeKind==="corner")){/* [7.90.0] !P.hlDef: su HL difensivo NON inquadrare la porta AVVERSARIA (era la palla «verso la porta sbagliata») */
          // [6.76.0 LMV-C1] su tiro FUORI/deviato in angolo NON inchiodare il lookAt sul portiere fermo (la palla
          //   che esce finiva ai bordi/fuori quadro — la regia perdeva il pallone): in quei casi resta il fuoco-palla.
          const _gx=awayGkMesh.position.x,_gz=awayGkMesh.position.z;
          cPx=clamp(_gx-36,-34,30);cPy=Math.max(cPy,8.4);cPz=clamp(_gz*0.5+(_gz>=0?12:-12),-22,22);/* [6.78.0] reframe d'esito piu' largo: si vedono sia chi conclude sia la porta */
          cLx=_gx-1;cLy=1.7;cLz=_gz*0.7;
        }
        else if(isResult&&!P.hlDef&&awayGkMesh&&P.hlType==="cross"){
          // [6.25.0 collaudo PO «si vede partire il cross ma non il compagno che finalizza»] su un cross la
          //   conclusione la fa un RICEVENTE in area: NON stacchiamo di colpo sul portiere (che taglia fuori il
          //   finalizzatore) ma teniamo in quadro il FUOCO-PALLA (fX/fZ = ricevente che attacca il pallone)
          //   INSIEME alla porta (mira al punto medio finalizzatore↔porta) → si vede il colpo di testa/volo in rete.
          const _gx=awayGkMesh.position.x,_gz=awayGkMesh.position.z;
          cPx=clamp(fX-22,-44,18);cPy=Math.max(cPy,8.5);cPz=clamp(fZ*0.62+(fZ>=0?17:-17),-27,27);
          cLx=(fX+_gx)*0.5+6;cLy=1.9;cLz=(fZ+_gz*0.7)*0.5;
        }
        else if(isResult&&awayGkMesh&&(P.hlType==="pass"||P.hlType==="dribble"||P.hlType==="build"||!P.hlType)&&P.hlSuccess===true&&!P.hlDef){
          // [6.74.0 3D-9] anche la FINALIZZAZIONE di imbucata/dribbling/costruzione (assist_shot/in_net) deve
          //   avere la porta in quadro: prima il THROUGH_BALL gonfiava la rete FUORI dall'inquadratura.
          const _gx=awayGkMesh.position.x,_gz=awayGkMesh.position.z;
          cPx=clamp(fX-24,-48,16);cPy=Math.max(cPy,8.0);cPz=clamp(fZ*0.6+(fZ>=0?15:-15),-26,26);
          cLx=(fX+_gx)*0.5+4;cLy=1.8;cLz=(fZ+_gz*0.7)*0.5;
        }
        else if(isResult&&P.hlDef){
          // [7.90.0 collaudo PO «le azioni difensive/gol subìto non si vedono bene: mostra l'intera azione, zooma meno»]
          //   HL DIFENSIVO: camera più LARGA e ALTA (meno zoom) che abbraccia tutta l'azione — dalla propria area a
          //   dove finisce la palla — con lo sguardo verso la PROPRIA metà (l'azione avversaria è lì), MAI verso la
          //   porta avversaria. Solo isResult → firma golden (catturata a hl_choose) invariata; abovePitch preservato.
          /* [7.398.0 collaudo PO #33 «si vede la curva da dietro in primo piano»] LA CAMERA RESTA NELLO
             STADIO. Il clamp a -70 comprava campo ARRETRANDO: con l'azione avversaria profonda (fX -45)
             la camera finiva a -65, cioe' DENTRO e DIETRO la Curva Nord (faccia interna a x -51,3) — e
             quello che arrivava allo schermo era il retro della gradinata in primo piano, non l'azione.
             Misurato su 30 scene difensive: 12 fuori dallo stadio, gi33 (la scena della nota) a -67,5
             per 59/82 fotogrammi d'esito, gi44/gi45 per TUTTO l'esito. L'arretramento che la curva nega
             si converte in QUOTA (fino a +9): e' l'inquadratura larga vera di uno stadio — dall'alto,
             non da fuori. L'asse non degenera mai in verticale perche' cPz tiene la camera ad almeno
             10 unita' laterali dal fuoco. Solo isResult → firma golden invariata. */
          {const _bk33=fX-20;cPx=clamp(_bk33,-46,20);cPy=Math.max(cPy,12.5+Math.min(9,(cPx-_bk33)*0.45));}cPz=clamp(fZ*0.7+(fZ>=0?10:-10),-32,32);
          cLx=clamp(fX-4,-46,30);cLy=1.5;cLz=fZ*0.55;
        }
        /* [7.194.0 S1] con la palla che ora nasce lontano (bandierina/fascia/portiere) la tentazione è allargare
           per tenere in quadro palla ED eroe: su viewport verticale è impossibile (fov orizzontale ~±11°) e
           l'effetto è spingere FUORI proprio il protagonista. La scelta è quella della regia vera: sul corner si
           inquadra L'AREA, non la bandierina — il fuoco resta sull'eroe (bf≈0 in lettura) e il pallone entra in
           campo visivo arrivando. Qui perciò NON si tocca il framing: si taglia soltanto (vedi _sceneCut). */
        // [7.63.0 BL-10 · STACCO D'ESITO + ZOOM DINAMICO] regia broadcast sull'esito drammatico (gol/parata/palo):
        //   uno STACCO netto (snap una tantum all'ingresso in isResult) + un PUNCH-IN che stringe sull'azione ~1.1s.
        //   SOLO isResult → la firma golden (catturata a hl_choose) resta INTATTA per costruzione.
        {const _cs63=sr.current,_ok63=P.hlOutcomeKind;
         const _dram63=isResult&&!P.hlDef&&(_ok63==="in_net"||_ok63==="in_net_high"||_ok63==="saved"||_ok63==="post");/* [7.90.0] niente punch-in (zoom) sull'HL difensivo → il PO vuole «meno zoom» sull'intera azione */
         if(!isResult){_cs63._cutArmed=false;_cs63._cutSnap=false;_cs63._punchT=-1;}
         else if(_dram63&&!_cs63._cutArmed){_cs63._cutArmed=true;_cs63._cutSnap=true;_cs63._punchT=0;}
         if(_cs63._punchT>=0&&_cs63._punchT<1.1){_cs63._punchT+=dt;
           const _pf=Math.min(_cs63._punchT/1.1,1),_pz=_pf*_pf*(3-2*_pf);/* smoothstep */
           cPx+=(cLx-cPx)*0.16*_pz;cPy-=1.3*_pz;cPz+=(cLz-cPz)*0.10*_pz;/* dolly-in verso il fuoco d'esito, leggermente più basso = cinematografico */
         }}
        tPx=wPx+(cPx-wPx)*camHL;tPy=wPy+(cPy-wPy)*camHL;tPz=wPz+(cPz-wPz)*camHL;
        tLx=wLx+(cLx-wLx)*camHL;tLy=wLy+(cLy-wLy)*camHL;tLz=wLz+(cLz-wLz)*camHL;
        /* [7.650.0 - LA REGIA STA IN TRIBUNA EST. Rosso __CPM_NO650]
           DIRETTIVA PO (collaudo 28/08, SIT #56): "la regia deve stare sempre dalla tribuna est,
           si invertono di campo solo le squadre tra primo e secondo tempo". E' anche la cura
           RADICALE del codice 007 (20+ note, 12-20 inversioni/s dell'asse ottico): il duello
           lerp/vista-reale/bisezione vive perche' la regia dinamica porta il soggetto sul filo
           del quadro e le reti commutano a frequenza di frame; da tribuna, con posa vincolata a
           UN lato (z sempre >= 16: MAI attraversare il campo) e pan/zoom morbidi, il soggetto
           sta comodo nel quadro e le reti a valle (bordo, lift, bisezione, richiami) non hanno
           piu' motivo d'ingaggiare - restano come sicurezze, e le loro etichette (_tocc503) e
           i contatori (BIS584) diventano il testimone che il meccanismo e' morto. Lo SGUARDO
           (tL*) resta l'autorita' dei registi: qui si vincola solo DA DOVE si guarda. Il
           punch-in d'esito (7.63) rivive come zoom DALLA tribuna (legge sr._punchT). Playing/
           cerimonia/rigori NON toccati (la wide broadcast di gioco resta quella storica): la
           cronaca ambientale migra in una release dedicata dopo il collaudo PO di questa. */
        if((isHL||P.matchPhase==="playing")&&!P.ceremony&&!P.shootout&&!replaying&&!(typeof window!=='undefined'&&window.__CPM_NO650)){/* [7.650.0 v2] ANCHE LA CRONACA: la broadcast dietro-porta con rotazione al 2o tempo (7.561) era esattamente cio che la direttiva vieta — misurato: la camera partiva dal lato playing e ATTRAVERSAVA il campo in transito a ogni apertura di scena (31 percento dei campioni hl sotto z16, z fino a -52,5) */
          try{if(sr.current._tocc503)sr.current._tocc503.push('tribuna650');}catch(_e650){}/* etichetta col pattern sicuro dello snap: _tc503 e' una const di un blocco interno e nei percorsi forzati del validatore qui non esiste (misurato: 10 PAGEERROR nel check visual) */
          /* [7.654.0 v2 - NEGLI HIGHLIGHT TORNA LA REGIA STORICA, CON MENO ZOOM-IN]
             Chiarimento finale del PO (terza iterazione, stavolta con le sue parole esatte):
             «la camera verticale negli highlights: come era PRIMA della modifica full tribuna
             est ma con meno zoom in». La fusione wide/close storica (gia' verticale da
             dietro-porta per costruzione) NON si tocca: l'unico intervento e' un DOLLY-OUT del
             18% lungo l'asse camera-fuoco (meno zoom-in, la sua sola richiesta). In PLAYING
             resta la tribuna laterale (7.650, mai contestata) col suo clamp z>=16. */
          if(isHL){
            tPx+=(tPx-tLx)*0.18;tPy+=(tPy-tLy)*0.18;tPz+=(tPz-tLz)*0.18;
          }else{
            tPz=38;
            tPy=20;
            tPx=clamp(tLx*0.85,-36,36);/* pan cronaca: il liscio kp a valle da' l'inerzia */
          }
        }
        /* [7.398.0 collaudo PO #33 «si vede la curva da dietro in primo piano»] LA CAMERA RESTA NELLO
           STADIO — e il pavimento sta DOPO la fusione, dove nessun ramo puo' aggirarlo (stessa lezione
           del tetto 7.363: il primo fix sul solo ramo d'esito difensivo ha lasciato 6 scene rosse su 14,
           perche' anche la regia di LETTURA sfonda: base close a -64, ramo tackle a -80, e il blend con
           la wide — che sta a x -74 ma ad ALTA quota, sopra la curva — trascina il tratto basso della
           fusione dentro la gradinata: misurato gi132 a x -71, quota 12, per tutta la lettura). La Curva
           Nord comincia a x -51,3: una camera oltre il confine e sotto il bordo ha la gradinata fra se'
           e il campo. L'arretramento negato si converte in QUOTA (fino a +9): la stessa azione, vista da
           sopra il catino invece che da fuori. Vale solo per la regia HL: la wide di gioco vive a -74
           ma a quota 38-47, sopra la curva, ed e' la regia broadcast legittima. */
        /* [7.400.0 collaudo PO gi132/gi168 «traballa ed e' troppo alta la camera» in hl_intro] IL PAVIMENTO
           HA AUTORITA' SOLO SOTTO IL BORDO DELLA CURVA. La versione 7.398 clampava SEMPRE sotto x -46 e
           convertiva in quota anche le pose dell'INTRO, che il blend con la wide tiene gia' a 26-30: il
           risultato era una camera spinta fino a ~34 — «troppo alta» — per proteggerla da una gradinata che
           a quella quota sta comunque SOTTO l'asse ottico. Ora il peso della correzione scala con la quota:
           pieno sotto y 18 (le pose basse di lettura/esito, il difetto originale), zero sopra il bordo
           curva (y 26), liscio in mezzo — una soglia secca farebbe saltare la x di ±12 col respiro
           sinusoidale della wide, cioe' il traballio che si sta togliendo. */
        /* [7.614.0 — IL SOLLEVATORE DI BORDO NON RESPIRA. Rosso __CPM_NO614]
           COLLAUDO PO su build 7.612 (SIT #44 e altri due appunti): «lo SGUARDO oscilla: 5,0 inversioni/s,
           ampiezza 7,9° — ultima passata per fotogramma: bordo-lift 64% + lerp 26%». La causa e' leggibile
           qui senza misura nuova: questa passata convertiva lo sconfinamento oltre il confine curva
           (tPx<-46) in QUOTA, ricalcolata OGNI FRAME sull'overshoot ISTANTANEO — e la base respira
           sinusoidalmente attorno a -46 (nota 7.415), quindi la quota pompava su e giu' al ritmo del
           respiro e l'asse ottico oscillava. In piu' tirava anche la x (tPx+=overshoot), duplicando il
           bordo-tanh qui sotto che scatta sulla STESSA condizione (duplicazione gia' denunciata dal
           censimento 7.503): nona istanza del pattern «piu' autorita' sulla stessa grandezza».
           Ora: la x appartiene al SOLO tanh; la quota insegue lo sconfinamento LISCIATO (~2,5/s), cosi'
           il respiro della base non arriva piu' all'asse ottico. Etichetta solo quando corregge (7.581).
           ⚠️ NON MISURABILE IN LABORATORIO: 5 inv/s contro 7 fps headless (Nyquist), e nei provini la
           classe non si riproduce (l'ultima mano esce vista-reale/gk/guinzaglio, non bordo-lift: la posa
           profonda nasce transitando dal LIVE). Riparato per costruzione come il 7.581; il giudice e' il
           dispositivo del PO, la cui bozza nomina l'ultima passata. */
        if(isHL&&!(typeof window!=='undefined'&&window.__CPM_NO524)){
          if(typeof window!=='undefined'&&window.__CPM_NO614){
            if(tPx<-46){_tc503('bordo-lift');const _w33=clamp((26-tPy)/8,0,1);
              if(_w33>0){tPy+=Math.min(9,(-46-tPx)*0.45)*_w33;tPx+=(-46-tPx)*_w33;}}
          }else{
            const _st614=sr.current._lift614||(sr.current._lift614={ov:0});
            _st614.ov+=(Math.max(0,-46-tPx)-_st614.ov)*Math.min(1,dt*2.5);
            if(_st614.ov>0.05){_tc503('bordo-lift');const _w33=clamp((26-tPy)/8,0,1);
              if(_w33>0)tPy+=Math.min(9,_st614.ov*0.45)*_w33;}
          }
        }
        /* [7.415.0 collaudo PO gi148 «traballa» in intro/lettura] ANCHE SOPRA IL BORDO, LA CAMERA NON
           VA DIETRO IL MURO. Il pavimento 7.400 pesa zero sopra y 26 di proposito («a quella quota la
           gradinata sta sotto l'asse ottico») — ma non prevede la camera 10 unita' DIETRO la curva:
           misurato su 12 scene, QUATTRO (gi148/79/168/132, tutte con palla profonda nella meta' campo
           propria) tengono la lettura a x -52…-60 con quota 25-27, cioe' rasente/dentro la cima della
           gradinata (bordo 23-26): bandiere, ringhiere e folla attraversano il near-plane — il
           «traballa». Compressione MORBIDA post-blend: tanh con asintoto a -49,5 (la faccia interna
           della curva sta a -51,3), derivata 1 sul bordo -46 — niente soglia secca, e il respiro
           sinusoidale della wide agli estremi si spegne invece di oscillare. */
        if(isHL&&tPx<-46&&!(typeof window!=='undefined'&&window.__CPM_NO524)){_tc503('bordo-tanh');const _ov414=-46-tPx;tPx=-46-3.5*Math.tanh(_ov414/3.5);}/* ⚠️ STESSA CONDIZIONE della passata qui sopra: due correzioni allo stesso sintomo */
        /* [7.363.0] IL TETTO VA DOVE NESSUN RAMO PUO' AGGIRARLO. Il tetto messo sul punto di fuoco della
           regia CLOSE (`fX/fZ`) copriva solo la strada principale: gli override di regia per-tipo
           (punizione dalla fascia, pattern di cross, corner) riscrivono `cLx/cLz` DOPO, e quattro scene
           restavano fuori — misurate a 33,8 (gi42), 40,8 (gi50), 27,5 (gi82) e 24,8 (gi76) unita' mondo
           dall'eroe. Qui la fusione e' gia' avvenuta e il valore e' quello definitivo. 22 unita' e' sopra
           tutte le scene sane misurate (gi0 20,8 · gi8 19,1 · gi26 15,9), quindi per loro e' l'identita'.
           ⚠️ Non si applica quando il soggetto e' la PALLA: se l'esito la porta a piu' di 10 unita'
           dall'eroe il motore passa deliberatamente il soggetto (`_subjBall50`, 7.237) e la camera deve
           poter seguire il pallone — la stessa condizione, ricalcolata qui perche' quella variabile nasce
           piu' a valle. */
        /* [7.581.0] L'ETICHETTA SI SPINGE QUANDO IL GUINZAGLIO TIRA, NON QUANDO SI SVEGLIA. E' la stessa
           disciplina gia' scritta per la bisezione nel 7.563, e senza di essa il censimento delle mani non
           puo' misurare questo rimedio: il guinzaglio risultava una mano sullo sguardo anche nei fotogrammi
           in cui non correggeva nulla, quindi «due mani» non distingueva un tiro alla fune da un passaggio
           di consegne. L'etichetta all'azione vale SEMPRE, anche col rosso acceso: e' strumentazione, e
           un rosso che cambia insieme il rimedio e il metro misurerebbe lo strumento invece del gioco. */
        if(isHL&&!(isResult&&Math.hypot(bx-hx,bz-hz)>10)){const _fl63=22,_dlx63=tLx-hx,_dlz63=tLz-hz,_dll63=Math.hypot(_dlx63,_dlz63);
          if(_dll63>_fl63){_tc503('guinzaglio');const _sc63=_fl63/_dll63;tLx=hx+_dlx63*_sc63;tLz=hz+_dlz63*_sc63;}}
        /* [7.503.0 F6/1] RACCOLTA. Quante passate correttive hanno toccato l'inquadratura in QUESTO
           fotogramma, e quali insieme. Sta qui e non piu' a valle per restare nello stesso scope di
           `_tocc503`: un contatore che lancia un ReferenceError non conta niente. */
        kp=Math.min(dt*1.8,1);kl=Math.min(dt*2.4,1);
      }
      // Sprint 3D-8b: durante il replay la regia passa a una camera alta laterale che segue la palla
      if(replaying){const rbx=ball.position.x,rbz=ball.position.z;
        tPx=clamp(rbx-30,-96,-8);tPy=30;tPz=rbz*0.45+32;tLx=rbx+6;tLy=1.3;tLz=rbz*0.6;
        kp=Math.min(dt*2.2,1);kl=Math.min(dt*2.8,1);}
      // item 2 (5.49.6): regia dell'INGRESSO SUBENTRANTE — camera bassa che inquadra l'eroe alla linea e poi mentre entra in campo.
      if(subEntryT>=0){const _hx2=hero.position.x,_hz2=hero.position.z,_near=subEntryT<1.5?1:0;/* [6.5.2] soglia allineata al nuovo beat istruzioni */
        tPx=_hx2-12;tPy=5.0+_near*0.6;tPz=_hz2-11;// bassa, lato campo verso l'eroe + la panchina
        tLx=_hx2+3;tLy=1.7;tLz=_hz2+2;kp=Math.min(dt*2.4,1);kl=Math.min(dt*3,1);}
      // [7.127.0] REGIA USCITA: la camera SEGUE l'eroe che cammina verso il dugout (altrimenti l'uscita resta fuori quadro)
      if(subExitT>=0){const _hx3=hero.position.x,_hz3=hero.position.z;
        tPx=_hx3-13;tPy=5.4;tPz=_hz3-12;// bassa, lato campo, segue l'eroe verso l'area tecnica
        tLx=_hx3+2;tLy=1.7;tLz=_hz3+1;kp=Math.min(dt*2.2,1);kl=Math.min(dt*2.8,1);}
      // [7.2.0] REGIA PREMIAZIONE — camera per beat: davanti all'eroe (B1) → carrellata laterale sul giro (B2) →
      //   dietro la squadra verso la curva (B3) → orbita bassa attorno al podio (B4). Legge hero.position aggiornata dal blocco ceremony.
      if(P.ceremony){const _ctc=ceremonyT<0?0:ceremonyT,_hxc=hero.position.x,_hzc=hero.position.z;
        const _cs=sr.current._cerSgn||1;/* [7.278.0] la regia segue il giro anche quando la curva è dall'altra parte */
        if(_ctc<2.5){tPx=_hxc-12*_cs;tPy=6.4;tPz=_hzc+7;tLx=_hxc;tLy=2.4;tLz=_hzc;}// davanti/basso sull'alzata trofeo
        else if(_ctc<7.0){tPx=_hxc-9*_cs;tPy=7.6;tPz=_hzc+15;tLx=_hxc+5*_cs;tLy=2.0;tLz=_hzc;}// side-track sul giro di campo
        else if(_ctc<10.2){tPx=_hxc-17*_cs;tPy=9.5;tPz=_hzc*0.4;tLx=_hxc+22*_cs;tLy=3.6;tLz=_hzc*0.3;}// dietro la squadra verso la Curva Sud
        else{const _oa=(_ctc-10.2)*0.65;tPx=Math.cos(_oa)*16;tPy=7.2;tPz=Math.sin(_oa)*12;tLx=0;tLy=2.6;tLz=0;}// orbita attorno al podio
        kp=Math.min(dt*1.7,1);kl=Math.min(dt*2.0,1);}
      // [7.31.0] REGIA RIGORI — camera arretrata e leggermente laterale: kicker, dischetto e porta nello stesso quadro
      if(P.shootout){tPx=23.5;tPy=7.2;tPz=11.5;tLx=43.5;tLy=1.3;tLz=-0.4;
        kp=Math.min(dt*2.0,1);kl=Math.min(dt*2.4,1);}
      /* [7.220.0 revisione PO «non si vede l'eroe che effettua il dribbling» ×10] IL PROTAGONISTA RESTA IN QUADRO.
         Misurato proiettando l'eroe nello spazio schermo durante l'azione: su una scena di dribbling era FUORI
         dall'inquadratura all'apertura (ndc 1.70, il bordo è 1.0) e rientrava solo a metà; su un tiro dal limite
         restava fuori per TUTTI i campioni. Non era il dribbling reso male: era che chi dribbla non si vedeva.
         Ogni regia per-tipo punta il proprio fuoco (la porta, il portiere, il pallone) e nessuna garantiva che
         l'eroe ci stesse dentro. Qui, a valle di tutte, l'asse ottico viene RICHIAMATO quel tanto che basta a
         tenerlo nel quadro — si sposta solo il PUNTO GUARDATO, mai la posizione della camera (che è nella firma
         golden), quindi la regia di ciascun tipo resta la sua e il gate non cambia. */
      /* [7.225.0 critico automatico: 14 scene con il protagonista fuori quadro a fine azione, derive fino a
         ndc -6.75 — evoluzione del richiamo 7.220.0] IL RICHIAMO USA LA PROIEZIONE VERA. I margini in unità
         MONDO non sanno nulla della geometria: ±10u laterali sono metà schermo con la camera lontana e tre
         schermi con la camera addosso — per questo gi8 restava fuori e le scene difensive derivavano. Ora si
         misura l'ANGOLO reale fra l'asse ottico e il protagonista (fov e aspect letti dalla camera, non
         cablati) e, se sfora il quadro utile, si RUOTA il punto guardato quel tanto che basta a riportarlo
         dentro — yaw e pitch, mai la posizione della camera (che resta della regia per-tipo, ed è ciò che la
         firma golden osserva via abovePitch). Il lerp del lookAt smussa la correzione: niente colpi di frusta. */
      /* [7.237.0 #50 — ricostruito dai numeri: look z misurato 42-46 = fuori dal campo] IL PASSAGGIO DI
         SOGGETTO. Dopo una consegna (punizione dalla fascia, lancio, tiro respinto) il richiamo-eroe
         continuava a trascinare l'asse ottico sul BATTITORE rimasto sulla fascia — angolarmente estremo
         rispetto alla camera — e il quadro finiva sulla tribuna mentre la palla volava in area dall'altra
         parte (gi15 FALLITO: palla fuori quadro in 8/10 campioni di volo, ndc fino a −22). Nella regia
         vera il protagonista resta il soggetto FINCHÉ È NELLA GIOCATA: quando la palla se n'è andata
         lontana (>18u world), il soggetto diventa LA PALLA — i richiami-eroe (target 7.225 e vista reale
         7.226) cedono, e la guardia-palla (sotto) tiene il volo in quadro. */
      /* [7.482.1 LA MIRA — SU UN INTERVENTO DIFENSIVO LA STORIA E' L'EROE, NON DOVE FINISCE IL PALLONE]
         Il censimento del 7.482 ha misurato NOVE scene in cui l'eroe sta fuori dal quadro per oltre meta'
         della conclusione, due al 100% (gi168 «Tackle duro», gi138 «Allineamento difensivo»), e la lista
         e' quasi tutta DIFENSIVA: il giocatore legge «Grande intervento!» e non si vede mai fare
         l'intervento. Contando gli ingaggi delle reti (`__CPM_HY478`) la prima causa e' questa riga: dopo
         un recupero il pallone se ne va lontano, `_subjBall50` scatta e la regia passa il soggetto ALLA
         PALLA — su gi33 (fuori 14/14) e gi168 la rete anti-fuoriquadro sull'eroe non ingaggia MAI, perche'
         e' spenta. Il passaggio del soggetto e' giusto quando il viaggio del pallone E' la storia (un tiro
         che vola in porta); su un intervento difensivo la storia e' chi l'ha fatto, e il pallone che
         rotola via non la racconta. `hlDef` e' il flag strutturale gia' usato altrove per questo. */
      /* [7.520.0 R4/1 — IL SOGGETTO E' UNO STATO, NON UN BOOLEANO ISTANTANEO: audit «basta un fotogramma
         oltre soglia perche' la camera cambi protagonista, e uno sotto perche' lo riprenda» — e il passaggio
         di soggetto spegne IN BLOCCO tutte le reti che tengono l'eroe in quadro (taglia F6/3, mira, bersaglio
         legale 7.507, rete post-lerp): il flicker le spegne e riaccende, e l'eroe esce (gi138 76%, gi168 62%
         di fotogrammi fuori misurati al 7.519)] Ora si passa alla palla solo se resta oltre 10u per piu' di
         0,35s, e si torna all'eroe sotto 7u per piu' di 0,25s (isteresi doppia: soglie E permanenza).
         L'esenzione difensiva 7.482.1 resta identica. __CPM_NO520 = rosso (booleano istantaneo di prima). */
      let _subjBall50;
      {const _d520=Math.hypot(bx-hx,bz-hz);const _ex520=P.hlDef&&!(typeof window!=='undefined'&&window.__CPM_NO482);
       if(typeof window!=='undefined'&&window.__CPM_NO520){_subjBall50=isResult&&_d520>10&&!_ex520;}
       else{const _st=sr.current._subj520||(sr.current._subj520={ball:false,acc:0});
         /* [7.522.0 R4/3 — SULLA CONSEGNA IL VIAGGIO E' LA STORIA: collaudo PO codice 008 su «uno-due e
            smista», confermato A VISTA sulla strip gi118: banner ASSIST al frame 3, poi QUATTRO fotogrammi
            di palla da sola in primo piano mentre la camera resta sull'eroe — il ricevente mai inquadrato.
            L'attesa di 0,35s dell'isteresi (giusta per i casi ambigui) e' TROPPA per un volo di 0,5s: qui
            il passaggio di soggetto e' IMMEDIATO quando l'arco di una consegna e' vivo. __CPM_NO525=rosso. */
         const _volo525=ballArcActive&&!(typeof window!=='undefined'&&window.__CPM_NO525);
         if(!isResult||_ex520){_st.ball=false;_st.acc=0;}
         else if(!_st.ball){if(_volo525&&_d520>6){_st.ball=true;_st.acc=0;}
           else if(_d520>10){_st.acc+=dt;if(_st.acc>0.35){_st.ball=true;_st.acc=0;}}else _st.acc=0;}
         else{if(!_volo525&&_d520<7){_st.acc+=dt;if(_st.acc>0.25){_st.ball=false;_st.acc=0;}}else _st.acc=0;}
         _subjBall50=_st.ball;}}
      /* [7.505.0 F6/3 — LA TAGLIA E' REGIA: 0,18 · decisione delegata dal PO, presa con lo sweep sulle 191]
         Lo sweep (7.503) ha dato la curva completa: a taglia 0 la mediana e' 0,054 con l'86% delle scene
         sotto 0,08 («figurina») e il 100% sotto 0,15 (la soglia sotto cui il censimento stesso dichiara il
         gesto non distinguibile — la famiglia di note «non si vede il gesto tecnico» viene da qui). 0,18
         sta sopra 0,15 con margine, senza pagare il 15,8% di fuori quadro della taglia 0,28.
         PERCHE' QUI e non nella manopola di prova in fondo al blocco: la manopola (`__CPM_FRAMET480`)
         sposta la camera REALE dopo tutti i lerp e tutte le reti — cosi' le reti anti-fuoriquadro miravano
         con la camera vecchia, ed e' il motivo per cui stringere da solo TRIPLICAVA il fuori quadro
         (4,7%→12,2% a 0,20). Qui invece si stringe il BERSAGLIO, subito prima del richiamo target-level
         del 7.225: la mira lavora sul quadro gia' stretto, e taglia e mira sono decise insieme — che era
         la condizione posta dall'audit fin dall'inizio.
         Esente quando il soggetto e' la PALLA (`_subjBall50`): stringere sull'eroe mentre la storia e' il
         viaggio del pallone taglierebbe fuori la storia. Pesata su `camHL` (il blend largo→stretto della
         regia): a inquadratura larga non si stringe. Spenta sotto la manopola di prova, che deve poter
         misurare da sola. PROVA DEL ROSSO: `__CPM_NO505` rimette la distanza di prima. */
      if(isHL&&!_subjBall50&&hero&&!P.ceremony&&!P.shootout&&!replaying
         &&!(typeof window!=='undefined'&&(window.__CPM_NO505||window.__CPM_ZOOM480||window.__CPM_FRAMET480))){
        const _hx5=hero.position.x,_hy5=hero.position.y+0.9,_hz5=hero.position.z;
        const _vx5=tPx-_hx5,_vy5=tPy-_hy5,_vz5=tPz-_hz5;
        const _d5=Math.hypot(_vx5,_vy5,_vz5)||1;
        const _tf5=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
        /* ⚠️ LA COSTANTE E' TARATA SUL PERCORSO DI PRODUZIONE, NON SULLA MANOPOLA: il bersaglio viene
           mediato dal blend `camHL` e dalle reti a valle, quindi rende ~0,75 di quanto chiede.
           [7.509.0] La taglia decisa ora e' quella del COLLAUDO PO, non della formula: con 0,24 (mediana
           reale 0,17) il verdetto dal dispositivo e' stato «lo zoom e' troppo stretto durante gli
           highlights» — e il telefono comanda sull'headless (lezione 007). Si torna al punto di taratura
           gia' misurato 0,18 → mediana reale ~0,136: l'eroe resta ~2,4x il pre-F6 (mediana 0,053 a taglia
           spenta), ma il quadro guadagna ~43% di area. Non e' un tetto sulle code: la distribuzione a
           0,24 era TUTTA stretta (q10 0,138 → max 0,267, zero scene sopra 0,30), quindi la correzione e'
           globale. */
        const _want5=Math.max(3.5,1.75/(2*0.18*_tf5));
        if(_d5>_want5){
          const _sc5=1-(1-_want5/_d5)*camHL;
          tPx=_hx5+_vx5*_sc5;tPy=Math.max(2.1,_hy5+_vy5*_sc5);tPz=_hz5+_vz5*_sc5;
          /* la mira accompagna la taglia: piu' si stringe, piu' lo sguardo converge sul soggetto — e' la
             stessa correzione che la manopola di prova aveva dovuto imparare (7.480, «9 riquadri su 12
             con l'eroe fuori»), qui a livello di bersaglio cosi' il richiamo 7.225 e le reti a valle
             partono gia' allineati */
          const _wL5=clamp(1-_sc5,0,1)*0.85;
          tLx+=(_hx5-tLx)*_wL5;tLy+=((_hy5+0.2)-tLy)*_wL5;tLz+=(_hz5-tLz)*_wL5;
        }
      }/* soglia 10u: a 18 la panoramica partiva a volo già a metà (misurati ancora 3-4 campioni fuori quadro nel primo secondo); sotto i 10u palla ed eroe stanno comunque nello stesso quadro */
      if(isHL&&!_subjBall50&&!P.ceremony&&!P.shootout&&!replaying&&subEntryT<0&&subExitT<0&&hero&&hero.visible){
        const _dxC=hero.position.x-tPx,_dzC=hero.position.z-tPz,_dyC=(hero.position.y+1.1)-tPy;
        const _lxC=tLx-tPx,_lzC=tLz-tPz,_lyC=tLy-tPy;
        const _hlC=Math.hypot(_lxC,_lzC)||1;
        const _tanHV=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
        const _azL=Math.atan2(_lzC,_lxC),_azH=Math.atan2(_dzC,_dxC);
        let _dAz=_azH-_azL;while(_dAz>Math.PI)_dAz-=2*Math.PI;while(_dAz<-Math.PI)_dAz+=2*Math.PI;
        const _azMax=Math.atan(_tanHV*((camera&&camera.aspect)||0.75))*(isResult?0.80:0.72);/* quadro utile: sull'esito più largo (deve entrare la porta), in lettura più stretto */
        /* [7.410.0 collaudo PO «traballa» — FINALMENTE COI NUMERI del testimone 7.408: «lo SGUARDO della
           camera oscilla, 4,9-32,6 inversioni/s, ampiezza ~6°» su gi148/gi176/gi43, a camera FERMA] LA
           CORREZIONE E' UNA RAMPA, NON UN INTERRUTTORE. La soglia secca era bistabile: eroe un pelo oltre
           il bordo → sguardo pinnato a 0,92·max; un pelo dentro → regia cruda. Con l'eroe che balla
           ATTORNO alla soglia il bersaglio saltava di ~6° a fotogrammi alterni — a 60fps e' il dondolio
           che il PO segnala da sei release, a 5fps headless converge in un frame ed e' per questo che
           nessuno strumento locale l'ha mai visto. Ora il peso della correzione sale liscio da 0 (al 72%
           del quadro) a 1 (al bordo): il bersaglio e' CONTINUO nella posizione dell'eroe, e senza
           discontinuita' non c'e' niente da far oscillare. Stessa cura su elevazione e sul richiamo-palla. */
        {const _ovA=(Math.abs(_dAz)-_azMax*0.72)/(_azMax*0.28);
         if(_ovA>0){const _wA=Math.min(_ovA,1),_pinA=_azL+(_dAz-Math.sign(_dAz)*_azMax*0.92);
           const _az2=_azL+( _pinA-_azL)*_wA;tLx=tPx+Math.cos(_az2)*_hlC;tLz=tPz+Math.sin(_az2)*_hlC;}}
        const _gdC=Math.hypot(_dxC,_dzC)||1;
        const _elL=Math.atan2(_lyC,_hlC),_elH=Math.atan2(_dyC,_gdC);
        const _elMax=Math.atan(_tanHV)*(isResult?0.72:0.62);
        const _dEl=_elH-_elL;
        {const _ovE=(Math.abs(_dEl)-_elMax*0.72)/(_elMax*0.28);
         if(_ovE>0){const _wE=Math.min(_ovE,1),_pinE=_elL+(_dEl-Math.sign(_dEl)*_elMax*0.9);
           const _el2=_elL+(_pinE-_elL)*_wE;tLy=clamp(tPy+Math.tan(_el2)*_hlC,0.4,26);}}
      }
      /* [7.237.0 #50] RICHIAMO-PALLA A LIVELLO TARGET: quando il soggetto è passato alla palla, la stessa
         rotazione del richiamo 7.225 gira sul PALLONE — così il lerp del lookAt lavora A FAVORE della
         panoramica (la sola guardia real-view, rate-capped, combatteva il lerp e il rientro tardava). */
      if(_subjBall50&&!P.ceremony&&!P.shootout&&!replaying){
        const _dxD=ball.position.x-tPx,_dzD=ball.position.z-tPz,_dyD=(ball.position.y+0.2)-tPy;
        const _lxD=tLx-tPx,_lzD=tLz-tPz,_lyD=tLy-tPy;
        const _hlD=Math.hypot(_lxD,_lzD)||1;
        const _tanHD=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
        const _azLD=Math.atan2(_lzD,_lxD),_azBD=Math.atan2(_dzD,_dxD);
        let _dAD=_azBD-_azLD;while(_dAD>Math.PI)_dAD-=2*Math.PI;while(_dAD<-Math.PI)_dAD+=2*Math.PI;
        const _azMD=Math.atan(_tanHD*((camera&&camera.aspect)||0.75))*0.85;
        /* [7.410.0] stessa rampa liscia del richiamo-eroe: niente soglia bistabile, niente dondolio */
        {const _ovAD=(Math.abs(_dAD)-_azMD*0.72)/(_azMD*0.28);
         if(_ovAD>0){const _wAD=Math.min(_ovAD,1),_pinAD=_azLD+(_dAD-Math.sign(_dAD)*_azMD*0.92);
           const _az2D=_azLD+(_pinAD-_azLD)*_wAD;tLx=tPx+Math.cos(_az2D)*_hlD;tLz=tPz+Math.sin(_az2D)*_hlD;}}
        const _gdD=Math.hypot(_dxD,_dzD)||1;
        const _elLD=Math.atan2(_lyD,_hlD),_elBD=Math.atan2(_dyD,_gdD);
        const _elMD=Math.atan(_tanHD)*0.80;const _dED=_elBD-_elLD;
        {const _ovED=(Math.abs(_dED)-_elMD*0.72)/(_elMD*0.28);
         if(_ovED>0){const _wED=Math.min(_ovED,1),_pinED=_elLD+(_dED-Math.sign(_dED)*_elMD*0.9);
           const _el2D=_elLD+(_pinED-_elLD)*_wED;tLy=clamp(tPy+Math.tan(_el2D)*_hlD,0.4,26);}}
      }
      // Sprint 3D-11A: camera shake al gol — rumore sul target, decade in ~0.4s
      if(shakePow>0.01){tPx+=Math.sin(now*24)*shakePow*0.7;tPz+=Math.cos(now*18)*shakePow*0.7;shakePow*=(1-dt*6);}else shakePow=0;
      // [7.63.0 BL-10] STACCO d'esito: al primo frame drammatico TAGLIO NETTO (niente lerp) → regia TV, poi il punch-in stringe
      /* [7.306.0 collaudo PO «azione con rimorchio, un vero casino... la palla vola!» — chiude il residuo
         dichiarato nel 7.305.0] L'INQUADRATURA CONTIENE L'AZIONE. La rete del 7.305.0 agisce sul solo
         `camLook` e ha un pavimento (`y>=0.4`): quando il pallone sta quasi SOTTO la camera — piu' vicino di
         dove essa guarda, come in «Inserimento da centrocampo in area», dove la palla e' col compagno 18u
         dietro l'eroe — nessun angolo di sguardo lo riporta dentro, e restava a ndc.y ~ -1.3 per l'intera
         scena. L'unica leva e' la DISTANZA: arretrando la camera lungo il proprio asse il pallone si allontana
         e il suo scarto angolare rientra nel semiquadro. Qui, sul TARGET (prima dei lerp, cosi' il movimento
         resta morbido), una bisezione deterministica cerca l'arretramento MINIMO che lo fa entrare. */
      if(isHL&&!P.ceremony&&!P.shootout&&!replaying&&ball&&ball.position){
        const _bx6=ball.position.x,_by6=ball.position.y+0.2,_bz6=ball.position.z;
        const _t6=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
        const _eM6=Math.atan(_t6*0.90),_aM6=Math.atan(_t6*((camera&&camera.aspect)||0.75))*0.90;
        /* fuori quadro = eccede il semiquadro VERTICALE **oppure** quello ORIZZONTALE: arretrare la camera
           riduce entrambi gli scarti angolari, quindi una sola bisezione risolve i due casi. Correggere qui
           (sul TARGET) invece che solo dopo i lerp toglie anche il tiro alla fune con la regia, che ogni frame
           richiama lo sguardo sul proprio punto: era il motivo per cui gli sfori laterali si assestavano
           appena FUORI dal bordo invece di rientrare. */
        /* [7.520.0 — LA BISEZIONE MIRA AL CUSCINO, NON AL BORDO: radice del codice 007 misurata alla
           sorgente] Il testimone __CPM_OSC521 sui casi del taccuino PO (gi33: un'inversione del bersaglio
           ogni ~4,5 fotogrammi, ampiezza 9,1° — che a 60fps sono ESATTAMENTE le 13-16 inversioni/s
           misurate dal telefono) ha inchiodato il tiro alla fune: questa ricerca trovava l'arretramento
           MINIMO — palla esattamente sul bordo del quadro — e al fotogramma dopo la regia base ritirava
           la camera avanti: bang-bang a frequenza di frame. Ora l'INGRESSO resta al margine largo (0,90)
           ma la ricerca converge sul CUSCINO (x0,86, ~78% del semiquadro): dopo la correzione la palla e'
           comoda dentro, e la deriva della regia impiega molti fotogrammi a riportarla fuori — la
           frequenza crolla per costruzione. __CPM_NO522 = rosso (bordo esatto di prima). */
        const _out6=(px,py,pz,mf)=>{const _m=(mf||1);const lx=tLx-px,lz=tLz-pz,ly=tLy-py,hl=Math.hypot(lx,lz)||1;
          const dx=_bx6-px,dz=_bz6-pz,dy=_by6-py,gd=Math.hypot(dx,dz)||1;
          if(Math.abs(Math.atan2(dy,gd)-Math.atan2(ly,hl))>_eM6*_m)return true;
          let da=Math.atan2(dz,dx)-Math.atan2(lz,lx);while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
          return Math.abs(da)>_aM6*_m;};
        /* ⚠️ RIMEDIO CONFUTATO E RITIRATO: il cuscino 0,86 e' stato misurato (OSC521, gi33/130/127/189)
           e NON riduce le inversioni (verde 0,15 vs rosso 0,158 su gi33): la bisezione non e' l'oscillatore
           dominante. La costante resta 1 (bordo storico); la parametrizzazione di _out6 resta per il
           prossimo esperimento, l'attribuzione per-inversione decide il vero colpevole. */
        const _cusc522=1;
        /* [7.584.0 — LA BISEZIONE SI ACCENDE E SI SPEGNE SUL FILO, rosso __CPM_NO584]
           COLLAUDO PO (appunti 7.581): dopo il 7.580 e il 7.581 lo sguardo e' sceso a UNA mano per
           fotogramma (da 3,6 e 2,5) e le inversioni da 29-30 al secondo a 3,0 — ma il residuo c'e' ancora,
           e lo scrittore dominante e' ora `bisezione` all'87%.
           LA CAUSA E' UN INTERRUTTORE SENZA ISTERESI. La rete si ingaggia su un booleano secco: appena la
           camera e' rientrata nel cono, `_out6` diventa falso, la rete molla, la camera riesce e la rete
           riprende — un ciclo limite sul filo della soglia, che e' esattamente cio' che si vede come
           tremolio. Non e' un conflitto fra due scrittori (quelli sono chiusi): e' UNO scrittore che
           commuta. Il cuscino del 7.522 non poteva curarlo, e la sua nota lo dice: «cambiava l'ATTERRAGGIO,
           non l'INGAGGIO».
           IL RIMEDIO NON INVENTA PARAMETRI: `_out6` prende gia' un moltiplicatore sui margini angolari.
           Quando la rete e' ingaggiata il cono si stringe (0,82), cioe' per mollare il soggetto deve essere
           rientrato CON MARGINE, non appena appena. E' l'isteresi con cui si cura ogni interruttore che
           sfarfalla, e qui si esprime in un numero solo.
           MISURA: non la frequenza (3 inversioni al secondo contro 7fps headless sono invisibili) ma le
           COMMUTAZIONI della rete, che sono un conteggio e non una frequenza — `__CPM_BIS584`. */
        const _lat584=(sr.current._bis584K===sr.current._actSitKey403)&&(sr.current._bis584===true);
        const _mf584=(typeof window!=='undefined'&&window.__CPM_NO584)?1:(_lat584?0.82:1);
        const _eng584=_out6(tPx,tPy,tPz,_mf584);
        if(typeof window!=='undefined'&&(_CPM_TEST||window.__CPM_REC)){try{if(_eng584!==_lat584){const _B=(window.__CPM_BIS584=window.__CPM_BIS584||{comm:0,frame:0});_B.comm++;}const _B2=(window.__CPM_BIS584=window.__CPM_BIS584||{comm:0,frame:0});_B2.frame++;}catch(_e584){}}
        sr.current._bis584=_eng584;sr.current._bis584K=sr.current._actSitKey403;
        if(_eng584&&!(typeof window!=='undefined'&&window.__CPM_NO523)){/* [7.503.1] *//* [caccia 007] __CPM_NO523: bisezione SPENTA del tutto — il cuscino ne cambiava l'atterraggio, non l'ingaggio: scagionarla richiede questo interruttore */
          const ux=tPx-tLx,uz=tPz-tLz,ul=Math.hypot(ux,uz)||1;
          let lo6=0,hi6=34;
          /* [7.398.0 collaudo PO #33] L'ARRETRAMENTO SI FERMA AL CONFINE DELLO STADIO. Questo blocco gira
             DOPO il pavimento post-fusione ed era il terzo scrittore che la misura ha scovato (gli altri
             due: il ramo d'esito difensivo e la regia di lettura): sul gol subìto la palla sta nella
             propria rete, fuori quadro, e la bisezione arretrava la camera lungo l'asse fin dentro la
             Curva Nord (clamp a -112: misurato gi33 inchiodata a x -51 per 28 fotogrammi, gi132 in deriva
             fino a -54). Oltre x -46 non si arretra: se non basta, vale la regola gia' scritta qui sotto —
             si lascia fare alla rete su camLook. */
          if(ux<0)hi6=Math.min(hi6,Math.max(0,(tPx+46)*ul/(-ux)));
          for(let it6=0;it6<9;it6++){const md6=(lo6+hi6)/2;
            if(_out6(tPx+ux/ul*md6,tPy,tPz+uz/ul*md6,_cusc522))lo6=md6;else hi6=md6;}
          /* se nemmeno il massimo arretramento inquadra (pallone praticamente alle spalle) si lascia fare
             alla rete su camLook: meglio nessuno spostamento che una camera spedita a 34u per nulla. */
          if(!_out6(tPx+ux/ul*hi6,tPy,tPz+uz/ul*hi6,_cusc522)){
            tPx=clamp(tPx+ux/ul*hi6,-112,44);tPz=clamp(tPz+uz/ul*hi6,-74,74);sr.current._leg563=(sr.current._leg563|0)+1;
            try{if(sr.current._tocc503)sr.current._tocc503.push('bisezione');}catch(_e){}/* [7.563.0] l'etichetta si spinge quando la rete AGISCE, non quando si sveglia: prima bastava l'ingaggio, e il censimento non distingueva una doppia scrittura da un passaggio di consegne */
          } else {
            try{if(sr.current._tocc503)sr.current._tocc503.push('bisezione-ceduta');}catch(_e){}/* svegliata ma il soggetto e' praticamente alle spalle: CEDE alla rete su camLook. E' un passaggio di consegne, non un conflitto — e il censimento ora sa distinguerli. *//* [7.563.0] la legalita' ha parlato per questo fotogramma */}
        }
      }
      /* [7.425.0 evolutiva celebrazioni] LA REGIA DELLA CERIMONIA: durante la premiazione i bersagli
         di camera li scrive lo SCRIPT dei beat (primi piani per le emozioni, medie per i personaggi,
         larghi per squadra e pubblico) — il liscio kp/kl a valle resta lo stesso, quindi i movimenti
         sono morbidi per costruzione, mai tagli secchi. */
      if(P.ceremony&&sr.current._cerCam){const _cc=sr.current._cerCam;tPx=_cc.x;tPy=Math.max(2.1,_cc.y);tPz=_cc.z;tLx=_cc.lx;tLy=_cc.ly;tLz=_cc.lz;}
      /* [7.471.0 codice 007 «la CAMERA salta», direttiva PO «e' gravissimo, non e' tollerabile»] UN
         TELETRASPORTO DELLA CAMERA DEVE STARE DENTRO UNO STACCO. Questa riga e' l'unico punto in cui la
         camera si sposta di colpo: `camera.position.set`. Lo stacco NERO che dovrebbe coprirlo
         (`setCutFx`) viene armato altrove e SOLO SULLE AZIONI RIUSCITE (r.~20085, `if(ok)`), mentre lo
         snap drammatico del 7.63 (r.~15788) si arma anche su PARATA e PALO — che sono esiti falliti.
         Li' la camera salta a vista, ed e' il «passo di 18,0 unita' a 725 u/s» che il PO misura: 18
         unita' in un fotogramma a ~40fps, cioe' un salto, non un tremolio (e il valore IDENTICO su note
         diverse dice che e' una transizione fissa, non rumore).
         Ora: si misura la distanza dello snap; se e' grande e NON c'e' uno stacco vivo, si CHIEDE lo
         stacco al gioco (`onCutNeeded`) e si RIMANDA il salto di ~120ms — il tempo che il nero entri in
         scena — tenendo la camera ferma invece di lasciarla scivolare verso un bersaglio lontano. Uno
         snap gia' mascherato passa immediato come prima: il percorso sano non cambia. */
      /* [7.689.0 direttiva PO: «le azioni salienti mostrale con camera orizzontale dalla tribuna est»]
         LA REGIA DELLA SCENA SALIENTE. In telecronaca la camera sta gia' in tribuna est (7.650) ma alta
         e inclinata: guarda il campo dall'alto, che va bene per seguire un pallone e non per guardare
         un'azione. Qui scende a quota nove e punta all'altezza del gioco — l'occhio di chi sta in
         tribuna, non del dirigibile. Segue il pallone lungo la linea laterale restando parallela al
         campo: e' la ripresa da bordo campo di una partita in TV. */
      if(P.salienteOn&&!P.ceremony&&!P.shootout&&!replaying&&!(typeof window!=='undefined'&&window.__CPM_NO689C)){
        const _bx689=ball?ball.position.x:0,_bz689=ball?ball.position.z:0;
        /* ⚠️ [7.695.0 — FOTOGRAFATA. Collaudo PO sul 7.694: «le azioni pericolose, gol e tentativi non si
           vedono»] Per quattro release ho misurato NUMERI del pallone e li ho visti salire: in area 6 su 9,
           avanzata mediana 86. Poi ho SCATTATO durante una finestra col pallone a gx 91, e il difetto era
           tutto li': la camera a quota 9 e a quaranta metri riempiva mezzo fotogramma di tribuna e cielo,
           il gioco stava in una striscia sottile in mezzo, e il look-at tappato a 34 lasciava PORTA E AREA
           FUORI INQUADRATURA proprio quando il pallone ci arrivava. Il pallone c'era davvero: non si vedeva.
           Nessuna sonda numerica poteva accorgersene — misuravano il campo, non il fotogramma.
           Ora: piu' vicina (27 invece di 40) e piu' bassa (6,5 invece di 9), cosi' il prato riempie il
           quadro; e il look-at arriva a 46, cioe' fino al palo, seguendo il pallone anche in profondita'. */
        tPx=clamp(_bx689*0.92,-42,42);tPy=6.5;tPz=27;
        tLx=clamp(_bx689,-46,46);tLy=1.4;tLz=clamp(_bz689*0.9,-18,18);
        try{if(sr.current._tocc503)sr.current._tocc503.push('saliente689');}catch(_e){}
      }
      else if((isHL||P.matchPhase==="playing")&&!P.ceremony&&!P.shootout&&!replaying&&!(typeof window!=='undefined'&&window.__CPM_NO650)){if(!isHL&&tPz<16){try{if(sr.current._tocc503)sr.current._tocc503.push('tribuna-clamp650');}catch(_e650b){}tPz=16;}}/* [7.654.0 v2] il clamp resta solo sulla CRONACA in tribuna (z>=16): negli HL comanda la regia storica, come chiesto dal PO *//* [7.650.0 v3] IL VINCOLO E' L'ULTIMA PAROLA: misurato un residuo deterministico a z -5,2 (24 percento dei campioni hl sotto 16) scritto da una mano A VALLE dell'override (bisezione con soggetto oltre il piano tribuna) — il clamp sta dopo TUTTE le mani, prima di snap e lerp: da qui la camera non attraversa MAI */
      if(sr.current._cutSnap||sr.current._sceneCut){try{if(sr.current._tocc503)sr.current._tocc503.push('snap');}catch(_e){}/* [7.503.1] */
        const _dSnap=Math.hypot(tPx-camera.position.x,tPy-camera.position.y,tPz-camera.position.z);
        const _no471=(typeof window!=='undefined'&&window.__CPM_NO471);const _nowMs471=performance.now();
        /* «c'e' un nero vivo?»: il timbro dello stacco REALE (`_CUT471`, scritto da LiveMatch) piu' quello
           della richiesta appena fatta da qui — il commit React arriva un fotogramma dopo, e senza il
           secondo timbro la richiesta non si vedrebbe nel fotogramma in cui e' partita. */
        const _mask=(_nowMs471-Math.max(_CUT471.at,(sr.current._cutAt471||-1e9)))<Math.max(300,_CUT471.dur||0);
        if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{const _c4=(window.__CPM_CAM471=window.__CPM_CAM471||[]);if(_c4.length<120&&!(sr.current._snapT471>_nowMs471))_c4.push({d:+_dSnap.toFixed(1),mask:!!_mask,src:(sr.current._cutSnap?(sr.current._sceneCut?"both":"esito"):"scena"),ph:P.matchPhase||null,kind:P.hlOutcomeKind||null,held:!!(!_no471&&!_mask&&_dSnap>6)});}catch(_e){}}
        if(sr.current._snapT471>_nowMs471){
          /* ⚠️ DUE TRAPPOLE, tutte e due misurate e non indovinate:
             (1) l'attesa va CONSUMATA QUI DENTRO, non in un blocco a valle: la prima stesura armava lo
                 stacco e il fotogramma dopo trovava `_mask` vero — l'aveva appena acceso lei — e cadeva
                 nel ramo «snappa subito»: l'attesa c'era e non serviva a niente.
             (2) si conta in TEMPO REALE, non in `dt`: il clock di scena e' tappato a 0,05s per
                 fotogramma, quindi 0,12 «secondi di scena» sono tre fotogrammi che su un dispositivo
                 lento durano quasi un secondo vero. Misurato headless: lo stacco veniva richiesto TRE
                 volte per la stessa apertura di scena, perche' la maschera scadeva prima dell'attesa.
                 Un nero e' una cosa che l'occhio guarda: si misura sull'orologio dell'occhio. */
          kp=0;kl=0;/* durante l'attesa la camera NON insegue: ferma e' meno visibile che scivolare verso un bersaglio lontano */
        }else if(!_no471&&!_mask&&_dSnap>6){
          /* 120ms: lo stacco (`blackCut`) e' pieno nero fra il 18% e il 52% della sua durata, cioe'
             61-177ms su 340, meno il commit React. Si salta a meta' di quella finestra. */
          sr.current._snapT471=_nowMs471+120;try{if(P.onCutNeeded)P.onCutNeeded();sr.current._cutAt471=_nowMs471;}catch(_e471){}
          kp=0;kl=0;
        }else{
          sr.current._cutSnap=false;sr.current._sceneCut=false;sr.current._snapT471=0;
          try{camera.position.set(tPx,tPy,tPz);camLook.set(tLx,tLy,tLz);}catch(_e){}
        }
      }
      /* [7.660.0 - LA CRONACA VISUALE FULL SI SPEGNE. Rosso __CPM_NO660]
         Decisione di prodotto del PO (a domanda esplicita, 28/08 sera): durante il playing lo
         schermo mostra TESTO in primo piano + STADIO di sfondo vivo (atmosfera, tifo, luci)
         SENZA i 22 simulati - "nessun pallone che vaga". Qui si spegne solo la RESA: il modello
         logico (turni, macchine, cronaca, punteggio) continua identico, le mesh restano
         aggiornate ma invisibili (le sonde leggono le position come prima); nelle scene
         dell'eroe, in cerimonia, nei rigori e nel walkout tutto riappare. Il visible di ogni
         mesh viene salvato all'ingresso e ripristinato all'uscita (un sistema che avesse
         nascosto qualcuno per suo conto lo ritrova com'era). */
      /* [7.689.0] durante una SCENA SALIENTE i corpi tornano in campo: e' il punto della scena. Fuori
         di li' la telecronaca resta com'e' — solo pallone e ombra, come il PO ha chiesto nel 7.660. */
      {const _off660=!(typeof window!=='undefined'&&window.__CPM_NO660)&&P.matchPhase==="playing"&&!P.ceremony&&!P.shootout&&!replaying&&!P.salienteOn;
       /* [7.665.0 v2 — LA MISURA HA BOCCIATO LA v1: 45 corpi ancora in campo con GLB acceso.
          Causa vera: lo spegnimento agiva SOLO alla transizione di fase, ma i personaggi GLB si
          agganciano in modo ASINCRONO qualche secondo dopo il fischio, e l'aggancio RIACCENDE il
          corpo (r.476: «proc.visible=true» — il modello GLB e' figlio del procedurale). La mia
          decisione veniva sovrascritta da un evento che arrivava dopo. Ora, finche' la telecronaca
          e' in corso, lo spegnimento si RIAPPLICA a ogni fotogramma: e' idempotente e costa
          quarantacinque assegnazioni, e nessun aggancio tardivo puo' piu' rimettere in campo i
          ventidue. Il ripristino resta alla transizione, com'era. */
       if(_off660||_off660!==!!sr.current._off660was){sr.current._off660was=_off660;
         /* [7.665.0 collaudo PO «durante la telecronaca si vedono ancora i giocatori, si deve vedere
            SOLO il pallone con la sua ombra»] DUE DIFETTI IN UNA RIGA SOLA, e li dichiaro tutti e due.
            (1) IL 7.660 SPEGNEVA I FANTASMI. La lista prendeva `pp.mesh` = il corpo PROCEDURALE, che
            con i personaggi GLB (il default del gioco, il modo in cui il PO gioca) e' gia' nascosto da
            `_hideProc`: spegnevo cio' che era gia' spento e lasciavo in campo i ventidue veri, che
            vivono in `glbAvatars[].root`. Il gate gira GLB-OFF per velocita' — ecco perche' le mie
            fotografie mostravano il campo vuoto e il telefono del PO no: la sonda non vedeva il mondo
            in cui il difetto esisteva. Ora si spengono ENTRAMBE le anagrafi.
            (2) IL PALLONE DEVE RESTARE. Era nella lista degli spenti: il PO lo vuole in campo con la
            sua ombra (quella ambra del 7.537, che dice dove ricade) — e' l'unica cosa che si muove
            mentre si legge la cronaca. Fuori dalla lista lui e fuori l'ombra; restano spenti i
            segnalini (diamante dell'eroe, alone, anello di zona): sono didascalie, non pallone. */
         try{const _all660=[...(sr.current.players||[]).map(pp=>pp&&(pp.mesh||pp)),...((glbAvatars||[]).map(a=>a&&a.root)),typeof refMesh!=='undefined'?refMesh:null,hero,typeof heroMark!=='undefined'?heroMark:null,typeof ballHalo!=='undefined'?ballHalo:null,typeof zoneRing!=='undefined'?zoneRing:null];
           /* ⚠️ [7.688.0 collaudo PO: «non si vedono piu' le sostituzioni in ingresso ed uscita
              dell'eroe»] E' UNA REGRESSIONE MIA, del 7.660/7.665. Quel blocco spegne i corpi durante la
              telecronaca — che e' cio' che il PO aveva chiesto, «si deve vedere solo il pallone con la
              sua ombra» — ma nella lista degli spenti c'e' anche `hero`, e la cerimonia d'ingresso e
              d'uscita del subentrante (5.49.6) si svolge PROPRIO in fase `playing`. Risultato: gli si
              spegneva il protagonista mentre entrava in campo.
              Durante la sequenza l'eroe resta acceso — lui e il suo avatar GLB, che e' figlio del mesh
              procedurale ma ha una visibilita' sua e va riacceso a parte (lezione del 7.665). Il resto
              del campo rimane spento: una sostituzione non e' una scusa per rimettere in scena i
              ventidue. `__CPM_NO688` ripristina il comportamento vecchio per la prova del rosso. */
           const _subVivo688=!(typeof window!=='undefined'&&window.__CPM_NO688)&&(subEntryT>=0||subExitT>=0);
           const _heroGlb688=(()=>{try{const a=(glbAvatars||[]).find(x=>x&&x.proc===hero);return a?a.root:null;}catch(_e){return null;}})();
           for(const _m of _all660){if(!_m)continue;
             if(_subVivo688&&(_m===hero||(_heroGlb688&&_m===_heroGlb688))){
               if(_m._vis660!==undefined)delete _m._vis660;
               _m.visible=true;continue;}
             /* [7.665.0 v3 — IL GATE HA BOCCIATO LA v2: 191 rossi «22 giocatori non renderizzati»,
                cioe' i corpi restavano spenti ANCHE nelle scene dell'eroe. Causa: riapplicando a ogni
                fotogramma, il valore da ripristinare veniva RISALVATO gia' spento (false), e al
                ripristino tornava false per sempre. Lo stato d'origine si fotografa UNA volta sola,
                la prima; poi si spegne e basta. La v2 senza questa riga era una perdita di memoria
                del valore vero — la stessa classe di difetto del pallone con due padroni. */
             if(_off660){if(_m._vis660===undefined)_m._vis660=_m.visible;_m.visible=false;}
             else{_m.visible=(_m._vis660!==undefined)?_m._vis660:true;delete _m._vis660;}}
           if(_off660){if(ball){ball.visible=true;if(ball._vis660!==undefined)delete ball._vis660;}
             if(typeof _bShadow534!=='undefined'&&_bShadow534){_bShadow534.visible=true;if(_bShadow534._vis660!==undefined)delete _bShadow534._vis660;}}
           }catch(_e660){}}}
      /* [7.665.0] LA MISURA DOV'E' IL FENOMENO: il guardiano contava solo i procedurali
         (__CPM_PROCVIS, 7.264) — con GLB acceso quel numero e' zero anche a campo pieno. Questo
         censimento conta ENTRAMBE le anagrafi piu' pallone e ombra: e' cio' che il PO vede. */
      if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&!window.__CPM_VIS665){try{window.__CPM_VIS665=()=>{let _pc=0,_gc=0;
        try{((sr.current&&sr.current.players)||[]).forEach(pp=>{if(pp&&pp.mesh&&pp.mesh.visible)_pc++;});if(hero&&hero.visible)_pc++;}catch(_x){}
        try{(glbAvatars||[]).forEach(a=>{if(a&&a.root&&a.root.visible)_gc++;});}catch(_x){}
        return{proc:_pc,glb:_gc,ball:!!(ball&&ball.visible),ombra:!!(typeof _bShadow534!=='undefined'&&_bShadow534&&_bShadow534.visible),fase:(propsRef.current&&propsRef.current.matchPhase)||null};};}catch(_e){}}
      /* [7.675.0 — LO STRUMENTO CHE MANCAVA: UNA FINESTRA SUL MONDO GLB.
         Tre difetti diversi segnalati dal PO nello stesso giorno (7.665 i giocatori che non sparivano,
         7.672 la volee' recitata come rovesciata, 7.674 il portiere con due gesti sovrapposti) avevano
         la stessa radice: il rimedio andava nel ramo PROCEDURALE — l'unico che le sonde sanno leggere —
         mentre il gioco vero gira sui personaggi GLB. E due rimedi di fila (7.673, 7.674) li ho dovuti
         spedire DICHIARANDOLI non verificati, perche' nessuna sonda riesce nemmeno a esercitare quel
         ramo. Curare al buio proprio la parte che il PO guarda non e' sostenibile: prima dello stesso
         rimedio viene lo strumento.
         Questo censimento dice, per ogni personaggio GLB in campo: quale CLIP sta suonando e con che
         peso, se il corpo procedurale sotto e' nascosto o no, e la posa vera (quota, inclinazione,
         imbardata) — cioe' esattamente le grandezze su cui vivono le note del PO. Test-only: fuori dal
         collaudo la funzione non esiste e non costa niente. */
      if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&!window.__CPM_GLBPOSE675){try{window.__CPM_GLBPOSE675=()=>{
        const out={pronti:!!(typeof window!=='undefined'&&window.__CPM_GLB_READY),avatar:0,att:[],gk:null,eroe:null};
        try{(glbAvatars||[]).forEach((a,i)=>{if(!a||!a.root)return;out.avatar++;
          /* le gestures sono AnimationAction dirette (r.521: out[k]=a), non oggetti che le contengono:
             la prima stesura leggeva `g.action` e non trovava mai niente — lo strumento vedeva il mondo
             e lo dichiarava vuoto. Si legge anche `_gName`/`_gw`, che il loop tiene aggiornati. */
          /* [7.675.0 v2] SI CONTANO LE CLIP SULLO STESSO CORPO. La prima lettura restituiva una clip
             per avatar e la sonda sommava scene intere: «kick + dive + tackle» sembrava un gesto
             triplo ma erano tre PERSONE diverse — l'attaccante che tira, il portiere che vola, il
             difensore che entra. Cioe' calcio normale. Il doppio gesto vero e' DUE CLIP SULLO STESSO
             PERSONAGGIO, e per vederlo serve l'elenco, non il massimo. */
          let _cl=null,_w=0;const _sopra=[];
          try{for(const k in (a.gestures||{})){const g=a.gestures[k];
            const _pw=(g&&typeof g.getEffectiveWeight==='function')?g.getEffectiveWeight():0;
            if(_pw>0.25)_sopra.push(k+':'+_pw.toFixed(2));/* [7.677.0] la soglia di giudizio sta nella sonda, non qui: il censimento riporta, non decide */
            if(_pw>_w){_w=_pw;_cl=k;}}}catch(_e){}
          if(!_cl&&a._gName){_cl=a._gName;_w=+(a._gw||0);}
          const _p=a.proc||{};
          const rec={i,clip:_cl,peso:+_w.toFixed(2),sopra:_sopra,procVis:!!(_p&&_p.visible),
            y:+((_p.position&&_p.position.y)||0).toFixed(2),rz:+((_p.rotation&&_p.rotation.z)||0).toFixed(3),ry:+((_p.rotation&&_p.rotation.y)||0).toFixed(2)};
          if(_w>0.05)out.att.push(rec);
          if(a._isGk&&_p===awayGkMesh)out.gk=rec;
          if(i===0)out.eroe=rec;});}catch(_e){}
        return out;};}catch(_e){}}
      if(sr.current._led657){
        const _weT662=(P.waveEvent&&P.waveEvent.t)||0;
        if(_weT662&&_weT662!==sr.current._ledWeSeen662){sr.current._ledWeSeen662=_weT662;sr.current._ledGoalUntil662=performance.now()+6000;}/* [7.661.0] il GOL si festeggia anche sul cartellone */
        const _golOn662=(sr.current._ledGoalUntil662||0)>performance.now();
        for(const _tl of sr.current._led657){const _o=_tl.tex?_tl:{tex:_tl,texGol:null,mat:null};
          if(_o.mat){_o.mat.map=(_golOn662&&_o.texGol)?_o.texGol:_o.tex;_o.mat.opacity=_golOn662?(0.62+0.36*Math.abs(Math.sin(performance.now()*0.012))):0.98;}
          const _t=_o.mat?_o.mat.map:_o.tex;if(_t)_t.offset.x=(_t.offset.x+dt*(_golOn662?0.18:0.045))%1;}}
      camera.position.x+=(tPx-camera.position.x)*kp;camera.position.y+=(tPy-camera.position.y)*kp;camera.position.z+=(tPz-camera.position.z)*kp;
      /* [7.507.0 codice 007 — IL BERSAGLIO DELLO SGUARDO E' LEGALE PRIMA DEL LERP]
         Il meccanismo dell'oscillazione, gia' letto nel 7.475/7.478C ma mai chiuso alla radice: il lerp
         trascina `camLook` verso un bersaglio che puo' lasciare il soggetto FUORI dal quadro reale, la
         rete post-lerp (`vista-reale`) lo riporta dentro con un tetto di velocita', e il fotogramma dopo
         il lerp tira di nuovo fuori — un interruttore che scatta a frequenza di FRAME-RATE. Per questo
         scala coi fps: invisibile in headless (8-25 fps, e infatti la' il sospetto fu scagionato con
         0 inversioni su 152 fotogrammi), reale sul telefono (misurato dal taccuino PO: 6,4-20,8
         inversioni/s contro una banda sana di 0,1-0,3). La banda d'isteresi del 7.478C ha ridotto il
         sintomo, non il meccanismo: le due forze continuano a spingere in direzioni opposte.
         Qui il bersaglio viene reso LEGALE prima del lerp, con la stessa geometria della rete post-lerp
         ma calcolata dalla POSIZIONE REALE della camera di questo fotogramma: da qui in poi lerp e rete
         spingono nella STESSA direzione, e il tiro alla fune sparisce per costruzione — la rete resta
         come paracadute e il suo ingaggio (24,2% dei fotogrammi alla baseline, contatore `vista-reale`
         in `__CPM_CAM503`) e' il numero che deve crollare. Stesse esenzioni della rete: soggetto-palla,
         cerimonie, rigori, ingressi. PROVA DEL ROSSO `__CPM_NO507`: bersaglio libero come prima. */
      if(isHL&&!_subjBall50&&!P.ceremony&&!P.shootout&&!replaying&&subEntryT<0&&subExitT<0&&hero&&hero.visible
         &&!(typeof window!=='undefined'&&window.__CPM_NO507)){
        const _cx7=camera.position.x,_cy7=camera.position.y,_cz7=camera.position.z;
        const _dx7=hero.position.x-_cx7,_dz7=hero.position.z-_cz7,_dy7=(hero.position.y+1.1)-_cy7;
        const _lx7=tLx-_cx7,_lz7=tLz-_cz7,_ly7=tLy-_cy7;
        const _hl7=Math.hypot(_lx7,_lz7)||1;
        const _tH7=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
        const _aL7=Math.atan2(_lz7,_lx7),_aH7=Math.atan2(_dz7,_dx7);
        let _dA7=_aH7-_aL7;while(_dA7>Math.PI)_dA7-=2*Math.PI;while(_dA7<-Math.PI)_dA7+=2*Math.PI;
        const _aM7=Math.atan(_tH7*((camera&&camera.aspect)||0.75))*0.90;
        if(Math.abs(_dA7)>_aM7){const _a27=_aL7+(_dA7-Math.sign(_dA7)*_aM7);
          tLx=_cx7+Math.cos(_a27)*_hl7;tLz=_cz7+Math.sin(_a27)*_hl7;
          if(!(typeof window!=='undefined'&&window.__CPM_NO619))sr.current._leg563=(sr.current._leg563|0)+1;/* [7.619.0] lo sguardo-pre ENTRA nel conteggio delle reti di legalita': era l'unica mano legale che scriveva senza registrarsi (audit regia) — bisezione, vista-reale e guardia-palla potevano scrivere nello stesso frame sopra di lui */
          try{if(sr.current._tocc503)sr.current._tocc503.push('sguardo-pre');}catch(_e){}}
        const _gd7=Math.hypot(_dx7,_dz7)||1;
        const _eL7=Math.atan2(_ly7,Math.hypot(tLx-_cx7,tLz-_cz7)||1),_eH7=Math.atan2(_dy7,_gd7);
        const _eM7=Math.atan(_tH7)*0.90;
        if(Math.abs(_eH7-_eL7)>_eM7){const _e27=_eH7-Math.sign(_eH7-_eL7)*_eM7;
          tLy=_cy7+Math.tan(_e27)*(Math.hypot(tLx-_cx7,tLz-_cz7)||1);}
      }
      /* [7.521.0 R4/2 — L'ARBITRO D'INERZIA SUI BERSAGLI: la radice del 007, chiusa dove nasce] La caccia
         strumentata (OSC521/A+B, attribuzione, 6 bracci di esclusione) ha dato questo verdetto: il tremore
         non ha UN colpevole — bisezione, coppia bordo, taglia e sguardo legale, spenti uno a uno e in
         coppia, non muovono il tasso aggregato (0,14-0,20 flip/frame su 10 scene, = 12 inv/s a 60fps, i
         numeri del taccuino PO). E' RUMORE DI BERSAGLIO DISTRIBUITO: tracking del soggetto, rami d'esito e
         passate sommano micro-alternanze che i lerp kp/kl attenuano ma non spengono. Il rimedio e' quello
         che l'audit prescriveva: UN arbitro a valle di tutte le passate — inerzia EMA (tau ~150ms) sui sei
         bersagli, col BYPASS sui tagli di regia (salto oltre 25u/30u = stacco voluto: si salta secco, il
         montaggio resta libero). Il respiro lento della wide (periodi 20-35s) passa intatto: l'inerzia
         taglia il tremore di frame, non il movimento. __CPM_NO521A = rosso (bersagli crudi di prima). */
      if(!(typeof window!=='undefined'&&window.__CPM_NO521A)&&!P.ceremony&&!P.shootout&&!replaying){
        const _in5=sr.current._iner521||(sr.current._iner521={px:tPx,py:tPy,pz:tPz,lx:tLx,ly:tLy,lz:tLz});
        const _cut5=Math.hypot(tPx-_in5.px,tPz-_in5.pz)>25||Math.hypot(tLx-_in5.lx,tLz-_in5.lz)>30;
        if(_cut5){_in5.px=tPx;_in5.py=tPy;_in5.pz=tPz;_in5.lx=tLx;_in5.ly=tLy;_in5.lz=tLz;}
        else{const _k5=Math.min(dt/0.15,1);
          _in5.px+=(tPx-_in5.px)*_k5;_in5.py+=(tPy-_in5.py)*_k5;_in5.pz+=(tPz-_in5.pz)*_k5;
          _in5.lx+=(tLx-_in5.lx)*_k5;_in5.ly+=(tLy-_in5.ly)*_k5;_in5.lz+=(tLz-_in5.lz)*_k5;
          tPx=_in5.px;tPy=_in5.py;tPz=_in5.pz;tLx=_in5.lx;tLy=_in5.ly;tLz=_in5.lz;}
      }
      /* [7.520.0 — TESTIMONE 007 ALLA SORGENTE] Il taccuino PO misura sul telefono 13-16 inversioni/s
         dell'asse ottico ANCHE dopo il 7.507: il rimedio e' fallito sul dispositivo. L'headless non puo'
         vedere le inversioni rese (servono ~69fps), ma il MECCANISMO si' : se il BERSAGLIO finale dello
         sguardo (tLx/tLz, dopo tutte le passate) alterna direzione fra fotogrammi consecutivi, le passate
         si stanno contendendo l'asse — e l'oscillazione resa e' inevitabile a qualunque fps. Qui, sulla
         riga del lerp, si conta il tasso di inversioni del bersaglio: e' la misura d'ingresso dell'arbitro
         di composizione (R4). Flag dedicato __CPM_OSC521. */
      if(typeof window!=='undefined'&&window.__CPM_OSC521!==undefined){try{const _o=window.__CPM_OSC521;
        const _al521=Math.atan2(tLx-camera.position.x,tLz-camera.position.z);
        const _hands521=(sr.current._tocc503||[]).join('+')||'nessuna';
        if(_o.p!=null){let _dA521=((_al521-_o.p+Math.PI*3)%(Math.PI*2))-Math.PI;
          if(Math.abs(_dA521)>0.009){const _sg=_dA521>0?1:-1;
            if(_o.s!=null&&_sg!==_o.s){_o.flips=(_o.flips||0)+1;if(Math.abs(_dA521)>(_o.amp||0))_o.amp=+Math.abs(_dA521).toFixed(4);
              if(_o.att){const _k=(_o.hPrev||'?')+' -> '+_hands521;_o.att[_k]=(_o.att[_k]||0)+1;}}
            _o.s=_sg;}}
        _o.p=_al521;_o.hPrev=_hands521;_o.f=(_o.f||0)+1;}catch(_e){}}
      /* [7.580.0 — LA GUARDIA CORREGGE LA MIRA, NON LA FOTOGRAFIA, rosso __CPM_NO580]
         COLLAUDO PO (appunti 7.578, quattro scene su quattro): «lo SGUARDO della camera oscilla —
         29,1 e 30,6 inversioni al secondo, ampiezza 7,6-7,8°, ultima passata per fotogramma:
         vista-reale 56% + lerp 34%, 3,6 passate per fotogramma». Trenta inversioni al secondo sono un
         flip A OGNI FOTOGRAMMA, e la bozza automatica nomina la coppia che se lo contende.
         LA CAUSA, e si legge nell'ordine delle righe. La guardia del quadro reale (7.226) scrive
         `camLook` DIRETTAMENTE, cioe' corregge l'immagine gia' composta. Il fotogramma dopo, il lerp
         qui sotto ricalcola `camLook` dal bersaglio `tL*`, che di quella correzione non sa niente: la
         butta via, il soggetto riesce dal quadro, la guardia ricorregge. Due mani sullo stesso valore,
         una per fotogramma ciascuna, per sempre. E' la stessa classe del doppio scrittore sul pallone
         che il 7.556 ha chiuso eleggendo un padrone unico — qui il padrone non si elegge, si cambia
         COSA scrive la guardia: la MIRA (`tL*`), non la fotografia (`camLook`).
         Il bias e' angolare, si accumula finche' la guardia insiste e DECADE quando smette (0,86 a
         fotogramma, ~0,3s di memoria): senza il decadimento la camera resterebbe storta dopo che il
         soggetto e' rientrato. Con questo il lerp non ha piu' niente da disfare: converge.
         ⚠️ NON MISURABILE IN LABORATORIO, e va detto: l'oscillazione e' a frequenza di fotogramma e
         headless gira a 7fps — Nyquist la rende invisibile (lo dichiara gia' il 7.526). Cio' che SI
         misura headless e' la CAUSA invece dell'effetto: quante mani toccano l'asse dello sguardo per
         fotogramma (`_tocc503`), che e' un conteggio e non una frequenza. La prova sul difetto resta
         al dispositivo del PO. Solo `camLook`/`tL*`, mai la posizione camera: firma golden intatta. */
      if(!(typeof window!=='undefined'&&window.__CPM_NO580)){
        const _b580=sr.current._bias580||(sr.current._bias580={a:0,e:0});
        if(_b580.a||_b580.e){
          const _cx580=camera.position.x,_cy580=camera.position.y,_cz580=camera.position.z;
          const _dx580=tLx-_cx580,_dz580=tLz-_cz580,_h580=Math.hypot(_dx580,_dz580)||1;
          const _a580=Math.atan2(_dz580,_dx580)+_b580.a;
          tLx=_cx580+Math.cos(_a580)*_h580;tLz=_cz580+Math.sin(_a580)*_h580;
          tLy=clamp(_cy580+Math.tan(Math.atan2(tLy-_cy580,_h580)+_b580.e)*_h580,0.4,26);
        }
        _b580.a*=0.86;_b580.e*=0.86;
        if(Math.abs(_b580.a)<1e-4)_b580.a=0;if(Math.abs(_b580.e)<1e-4)_b580.e=0;
      }
      /* ⚠️ [7.696.0 — RIMEDIO SCRITTO, MISURATO, REVOCATO. Il codice 007 resta aperto, con tre cose
         in meno da provare.] L'ipotesi era buona e la causa e' confermata: `camLook` e' persistente e
         ogni fotogramma si avvicina a `tL`, che il regista RICALCOLA DA ZERO; le reti di legalita'
         (vista-reale) correggono `camLook` e non toccano `tL`, quindi il fotogramma dopo la morbidezza
         ritira lo sguardo verso lo stesso bersaglio fuori quadro e la rete ricorregge — 2,2-4,5 passate
         per fotogramma sull'asse ottico, che e' esattamente cio' che il PO vede tremare.
         Avevo reso la correzione PERSISTENTE SUL BERSAGLIO: accumulata in un offset che ruotava `tL`
         prima della morbidezza. MISURA APPAIATA, sette scene per braccio, stesso laboratorio: scene
         sopra soglia da 1/7 (rosso) a 3/7 (verde), massimo da 3,29 a 11,90 inversioni/s, passate per
         fotogramma da 2,19 a 2,64. PEGGIORA, e si capisce perche': accumulando, la rete rimisura
         l'inquadratura GIA' corretta, decide che serve ancora e ne aggiunge — retroazione positiva,
         non smorzamento. Curato il sintomo giusto col segno sbagliato. Revocato.
         CIO' CHE RESTA A VERBALE, perche' vale piu' del codice tolto: (1) il laboratorio PUO' misurare
         il codice 007 — la mia nota del 7.598 («solo il telefono puo' collaudarlo») era sbagliata, nel
         regime storico il difetto si vede con la stessa firma del dispositivo; (2) il freno del 7.671
         non puo' funzionare, e si dimostra col conto: taglia a 150 gradi/s e il tremore viaggia a
         66-120 gradi/s, quindi non si accende mai; (3) la strada «correzione persistente» e' chiusa di
         principio finche' la rete rimisura cio' che ha gia' corretto, non e' questione di taratura. */
      /* ⚠️ [7.702.0 — SECONDO RIMEDIO STRUTTURALE SUL CODICE 007, SCRITTO, MISURATO E REVOCATO.]
         Dopo l'accumulo sul bersaglio (revocato: retroazione positiva), il tentativo opposto: se nel
         fotogramma precedente una rete correttiva aveva scritto sull'asse ottico, la morbidezza rallentava
         a un terzo — la correzione restava in piedi invece di essere strattonata via. MISURA APPAIATA sul
         banco ripetibile (avversario fisso, GLB spenti — il regime va DICHIARATO nel comando: una passata
         l'ho buttata perche' il default GLB della sonda era rimasto acceso da un altro esperimento, e a
         2 fps il filtro temporale scarta tutto e il banco e' cieco in tutt'e due i bracci):
         inversioni/s mediana 0,24 contro 0,21, scene sopra soglia 2/7 contro 1/7, campioni di tremore
         108 contro 105. NON SCENDE NIENTE: le reti si riarmano a qualunque passo della morbidezza.
         La lezione, dopo due bocciature simmetriche: il duello non si spegne A VALLE — ne' aggiungendo
         energia al bersaglio ne' togliendone alla morbidezza. Va tolto il motivo per cui la rete si
         riarma: il regista che ricalcola `tL` DA ZERO a ogni fotogramma, cieco alle correzioni del
         fotogramma prima. E' un lavoro sul regista, non sui freni, e resta a verbale come strada. */
      camLook.x+=(tLx-camLook.x)*kl;camLook.y+=(tLy-camLook.y)*kl;camLook.z+=(tLz-camLook.z)*kl;
      /* [7.226.0 #43] GUARDIA SUL QUADRO REALE. Il richiamo 7.225.0 garantisce che l'eroe stia nel quadro della
         camera TARGET — ma la camera REALE lo insegue coi lerp (posizione kp, sguardo kl): durante uno stacco
         d'esito col punch-in in dolly e l'eroe in sprint, la vista reale resta indietro e per ~0.5-1s l'eroe
         sfora il bordo anche se il quadro target lo conterrebbe (misurato: rientri da ndc 1.32 e −1.12 in
         hl_result, più un'esplosione di proiezione a 4.41 con l'eroe vicino al piano camera). Qui, DOPO i lerp,
         la stessa matematica angolare gira sulla vista reale e CLAMPA camLook: identità finché l'eroe è dentro
         il 94% del semiquadro (il richiamo target-level resta il regista; questa è solo la rete), correzione
         limitata in velocità (dt-corretta) perché il caso patologico eroe-dietro-camera diventi una panoramica
         rapida e non un colpo di frusta. Solo camLook, mai la posizione → firma golden intatta per costruzione. */
      /* [7.563.0 — CODICE 007: LA LEGALITA' PARLA UNA VOLTA SOLA PER FOTOGRAMMA]
         La nota PO dal telefono porta la firma esatta: «ultima passata per fotogramma: vista-reale 51% +
         bisezione 49% · 2,5 passate/fotogramma». Sono DUE reti di legalita' che scrivono lo stesso asse
         nello stesso fotogramma, una sul BERSAGLIO (bisezione, prima dei lerp) e una sulla VISTA RESA
         (vista-reale, dopo): la prima porta il bersaglio dentro il quadro, la seconda giudica la vista che
         il lerp non ha ancora raggiunto e la ritira indietro — e al fotogramma dopo si scambiano i ruoli.
         E' lo stesso difetto che il pallone aveva prima del 7.556: due padroni, nessuna elezione. Il
         censimento in laboratorio lo conferma dal lato strutturale: il 51,3% dei fotogrammi di highlight
         ha PIU' DI UNA passata di camera.
         Qui l'elezione: se la bisezione ha gia' sistemato il BERSAGLIO in questo fotogramma, la rete sulla
         vista resa TACE — il bersaglio e' gia' legale, quello che resta e' solo il ritardo del lerp, e
         correggerlo ogni fotogramma E' il tremore. La rete resta come paracadute per i fotogrammi in cui
         la bisezione non ha avuto niente da dire.
         ⚠️ LIMITE DICHIARATO, e vale piu' del rimedio: QUESTA MISURA IN LABORATORIO NON VEDE IL FENOMENO.
         L'asse reso inverte 0,2 volte al secondo headless contro le 41,5 misurate sul telefono del PO:
         duecento volte meno. Il motivo e' che le reti correggono per FOTOGRAMMA con tetti dt-corretti, e
         a 7 fps headless il moto reale domina il passo mentre a 60 fps dominano le microcorrezioni. Il
         numero che si puo' difendere qui e' quello STRUTTURALE (passate per fotogramma); la conferma sul
         tremore la puo' dare solo il collaudo sul dispositivo. __CPM_NO563 = rosso. */
      let _gCor50=false;
      if(isHL&&!_subjBall50&&!P.ceremony&&!P.shootout&&!replaying&&subEntryT<0&&subExitT<0&&hero&&hero.visible
         &&!((sr.current._leg563|0)>0&&!(typeof window!=='undefined'&&window.__CPM_NO563))){/* [7.237.0 #50] col soggetto passato alla palla anche la guardia reale sull'eroe cede */
        const _cxG=camera.position.x,_cyG=camera.position.y,_czG=camera.position.z;
        const _dxG=hero.position.x-_cxG,_dzG=hero.position.z-_czG,_dyG=(hero.position.y+1.1)-_cyG;
        const _lxG=camLook.x-_cxG,_lzG=camLook.z-_czG,_lyG=camLook.y-_cyG;
        const _hlG=Math.hypot(_lxG,_lzG)||1;
        const _tHG=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
        const _aLG=Math.atan2(_lzG,_lxG),_aHG=Math.atan2(_dzG,_dxG);
        let _dAG=_aHG-_aLG;while(_dAG>Math.PI)_dAG-=2*Math.PI;while(_dAG<-Math.PI)_dAG+=2*Math.PI;
        const _aMG=Math.atan(_tHG*((camera&&camera.aspect)||0.75))*0.94;
        /* ⚠️ [7.704.0 — L'ELEZIONE CHE MANCAVA: LA VISTA-REALE NON GIUDICA UNA VISTA IN VIAGGIO.
           Rosso __CPM_NO704] La nota qui sotto (7.556-bis) aveva gia' scritto la diagnosi con le parole
           del pallone: «una rete sul BERSAGLIO (bisezione, prima dei lerp) e una sulla VISTA RESA
           (vista-reale, dopo): la prima porta il bersaglio dentro il quadro, la seconda giudica la vista
           che il lerp NON HA ANCORA RAGGIUNTO e la ritira indietro — due padroni, nessuna elezione».
           Dopo che DUE rimedi a valle sono stati bocciati dalla misura (accumulo sul bersaglio: peggiora;
           freno sulla morbidezza: non muove niente), l'elezione si fa qui, alla radice: se il soggetto
           sta gia' dentro il quadro del BERSAGLIO verso cui la vista converge, questa rete ASPETTA — la
           convergenza e' la correzione, e strattonare una vista in viaggio e' il tremore stesso. Si
           accende solo quando anche il bersaglio e' fuori (soggetto praticamente alle spalle), che e' il
           caso d'emergenza per cui era nata. Direttiva PO: «sto tremore deve essere risolto
           definitivamente, mi raccomando!». */
        const _viaggia704=(()=>{try{if(typeof window!=='undefined'&&window.__CPM_NO704)return false;
          const _lxT=tLx-_cxG,_lzT=tLz-_czG;const _aLT=Math.atan2(_lzT,_lxT);
          let _dAT=_aHG-_aLT;while(_dAT>Math.PI)_dAT-=2*Math.PI;while(_dAT<-Math.PI)_dAT+=2*Math.PI;
          return Math.abs(_dAT)<=_aMG;}catch(_e){return false;}})();
        /* [7.478.0 codice 007 — L'OSCILLAZIONE DELLO SGUARDO, con l'ISTERESI che il 7.475 aveva prescritto e
           non fatto] Il 7.475 ha censito la banda sana (0,1-0,3 inversioni/s) e provato che gli 8,8 e 34,7
           del dispositivo sono reali, 30-300 volte quella banda; ha anche stabilito che nessuna sonda di
           questo repo puo' esprimere quel numero, perche' il testimone campiona una volta per fotogramma e
           servirebbero 69 fps. Ma la CAUSA non ha bisogno di quel numero per essere letta qui: questa rete
           riportava il soggetto al 98% del semiquadro — cioe' appena dentro il bordo — e il lerp verso il
           bersaglio (poche righe sopra) lo rispingeva fuori nel fotogramma seguente. Un interruttore che si
           accende e si spegne a ogni fotogramma ha per definizione la frequenza del frame-rate: ecco perche'
           il ping-pong scala coi fps e in headless (8-25 fps) non si vede. Ora c'e' una BANDA: si entra al
           bordo, si corregge fino all'80% del semiquadro e si esce solo sotto quella soglia — il soggetto
           deve DERIVARE (tempo di gioco, non fotogrammi) per far riaccendere la rete. Solo camLook, mai la
           posizione camera → firma golden intatta per costruzione. `__CPM_NO478C` rimette il comportamento
           di prima (prova del rosso). */
        /* [7.598.0 — UNA SOLA RETE PER FOTOGRAMMA, anche questa. Rosso __CPM_NO598]
           COLLAUDO PO su SIT #3: «codice 007 - lo sguardo oscilla: 26,1 inversioni/s, ampiezza 6,3 gradi -
           vista-reale 51% + lerp 49% · 3,5 passate/fotogramma». Le due voci che si alternano sono nominate
           dal gioco stesso, e 3,5 passate per fotogramma contro l'1,0 misurato dal PO sul 7.581 dicono
           dov'e' il problema: piu' reti riscrivono lo SGUARDO nello stesso fotogramma, l'ultima vince, e
           a fotogrammi alterni vince l'altra. E' la firma dell'oscillazione, ed e' la stessa classe di
           difetto trovata oggi altre tre volte - piu' autorita' sulla stessa grandezza.
           Il principio esiste gia' nel file: `_leg563` conta le reti di legalita' che hanno gia' scritto,
           e una guardia lo rispetta. Questa rete no. Ora lo rispetta: se una rete ha gia' corretto lo
           sguardo in questo fotogramma, la rete del quadro aspetta il prossimo. Non rinuncia a
           correggere, rinuncia a correggere DUE VOLTE nello stesso istante.
           ⚠️ IL GUADAGNO NON E' MISURATO, e va detto. Il laboratorio gira a ~7 fps e ventisei inversioni
           al secondo stanno oltre Nyquist: non le vede. E non riproduce nemmeno la causa - qui le passate
           per fotogramma valgono 1,2 su SIT #3, 1,4 su #155 e 1,5 su #45, contro i 3,5 del dispositivo.
           Cio' che il laboratorio SA misurare e' il fuori quadro (portato dal 41,3% al 3,0% nel 7.545), ed
           e' quello che questa modifica potrebbe rompere: quel numero e' il collaudo che ho fatto prima di
           spedire. Le inversioni le puo' collaudare solo il PO sul telefono. */
        if(Math.abs(_dAG)>_aMG&&!_viaggia704&&!((sr.current._leg563|0)>0&&!(typeof window!=='undefined'&&window.__CPM_NO598))){_gCor50=true;sr.current._leg563=(sr.current._leg563|0)+1;try{if(sr.current._tocc503)sr.current._tocc503.push('vista-reale');}catch(_e){}/* [7.503.1] l'ottava passata: la rete che riporta il soggetto dentro il quadro REALE, dopo i lerp */
          /* ⚠️ [7.483.0] QUI C'ERA LA SECONDA MODIFICA, ED E' STATA REVOCATA. L'ipotesi era che su gi138
             la rete fosse solo TROPPO LENTA (ingaggia 13 volte e non recupera), curabile con un tetto di
             velocita' che cresce con quanto il soggetto e' fuori. Misurata a tre bracci su 3 passate
             (mediana della quota fuori quadro): col solo cambio di soggetto gi168 sta al 43%, aggiungendo
             il tetto adattivo sale al 60% — peggiora, e sulle altre non muove nulla (35→35, 50→52,
             48→48). Ipotesi caduta, codice revocato: questa riga e' quella di prima, byte per byte. */
          let _corA=_dAG-Math.sign(_dAG)*_aMG*0.98;const _capA=Math.min(Math.abs(_corA),dt*2.5);_corA=Math.sign(_corA)*_capA;
          _hyBump478(sr,'g',_corA);
          const _a2G=_aLG+_corA;camLook.x=_cxG+Math.cos(_a2G)*_hlG;camLook.z=_czG+Math.sin(_a2G)*_hlG;
          if(!(typeof window!=='undefined'&&window.__CPM_NO580)){const _b=sr.current._bias580||(sr.current._bias580={a:0,e:0});_b.a=clamp(_b.a+_corA,-0.5,0.5);}/* [7.580.0] la correzione entra nella MIRA: il fotogramma dopo il lerp parte gia' corretto invece di disfarla */}
        const _gdG=Math.hypot(_dxG,_dzG)||1;
        const _eLG=Math.atan2(_lyG,_hlG),_eHG=Math.atan2(_dyG,_gdG);
        const _eMG=Math.atan(_tHG)*0.90;const _dEG=_eHG-_eLG;
        if(Math.abs(_dEG)>_eMG){_gCor50=true;
          let _corE=_dEG-Math.sign(_dEG)*_eMG*0.98;const _capE=Math.min(Math.abs(_corE),dt*1.8);_corE=Math.sign(_corE)*_capE;
          _hyBump478(sr,'ge',_corE);
          camLook.y=clamp(_cyG+Math.tan(_eLG+_corE)*_hlG,0.4,26);
          if(!(typeof window!=='undefined'&&window.__CPM_NO580)){const _b=sr.current._bias580||(sr.current._bias580={a:0,e:0});_b.e=clamp(_b.e+_corE,-0.5,0.5);}/* [7.580.0] idem per l'elevazione */}
      }
      /* [7.237.0 #50 misurato su gi15 «punizione dalla fascia» FALLITA: palla fuori quadro in 8/10 campioni
         di volo, ndc x fino a −22 — la regia del punto di battuta non segue il pallone respinto verso l'area]
         LA REGIA NON PERDE MAI IL PALLONE DURANTE L'ESITO: stessa matematica angolare della guardia-eroe
         (7.226) ma sul PALLONE, attiva solo in hl_result — identità finché la palla è dentro il 97% del
         semiquadro, panoramica rate-capped quando lo sfora (mai un colpo di frusta). L'eroe ha PRIORITÀ:
         se la guardia-eroe ha corretto in questo frame, quella palla aspetta il frame dopo (niente tiro
         alla fune). Solo camLook, mai la posizione camera → firma golden intatta per costruzione. */
      /* [7.305.0 collaudo PO «azione con rimorchio, un vero casino… la palla vola!»] la rete sul pallone
         era armata SOLO in `hl_result`, ma il pallone puo' uscire dal quadro gia' nella fase di LETTURA:
         misurato sulle 191 situations, 5 hanno il pallone fuori inquadratura a `hl_choose` (gi 6 · 37 · 77 ·
         79 · 133) — fra queste proprio «Schema! Inserimento da centrocampo in area», il caso del collaudo,
         dove la palla sta a ndc.y −1.37 (sotto il bordo inferiore) per l'INTERA scena. Ora la guardia vale
         su tutte le fasi dell'highlight: l'eroe mantiene la priorita' (se ha corretto lui, la palla aspetta
         il frame dopo) e la correzione resta rate-capped e solo su camLook → posizione camera intatta. */
      if(isHL&&!_gCor50&&!P.ceremony&&!P.shootout&&!replaying&&!((sr.current._leg563|0)>0&&!(typeof window!=='undefined'&&window.__CPM_NO619))){/* [7.619.0 — LA GUARDIA-PALLA RISPETTA CHI HA GIA' SCRITTO. Rosso __CPM_NO619] COLLAUDO PO su 7.615 (SIT #21/#184): «5,8-6,4 inversioni/s — ultima passata: bisezione ~50% + lerp». L'audit regia aveva gia' nominato il buco: la guardia-palla consultava solo _gCor50 (la correzione di vista-reale) ma NON _leg563 — in un frame in cui la BISEZIONE ha agito (vista-reale tace per disciplina 7.563) la guardia-palla scriveva comunque camLook: e' la coppia bersaglio<->vista-resa che il 7.563 ha chiuso per l'eroe e che sul pallone restava aperta. Ora, se una rete di legalita' ha gia' scritto in questo frame, la palla aspetta il frame dopo — la stessa frase che il codice usa per l'eroe. ⚠️ NON MISURABILE a 7 fps (Nyquist, come 7.581/7.614): giudice il dispositivo, la cui bozza nomina l'ultima passata. */
        const _cxB=camera.position.x,_cyB=camera.position.y,_czB=camera.position.z;
        const _dxB=ball.position.x-_cxB,_dzB=ball.position.z-_czB,_dyB=(ball.position.y+0.2)-_cyB;
        const _lxB=camLook.x-_cxB,_lzB=camLook.z-_czB,_lyB=camLook.y-_cyB;
        const _hlB=Math.hypot(_lxB,_lzB)||1;
        const _tHB=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
        const _aLB=Math.atan2(_lzB,_lxB),_aBB=Math.atan2(_dzB,_dxB);
        let _dAB=_aBB-_aLB;while(_dAB>Math.PI)_dAB-=2*Math.PI;while(_dAB<-Math.PI)_dAB+=2*Math.PI;
        const _aMB=Math.atan(_tHB*((camera&&camera.aspect)||0.75))*0.97;
        if(Math.abs(_dAB)>_aMB){
          let _corB=_dAB-Math.sign(_dAB)*_aMB*0.98;const _capB=Math.min(Math.abs(_corB),dt*2.8);_corB=Math.sign(_corB)*_capB;
          _hyBump478(sr,'b',_corB);
          const _a2B=_aLB+_corB;camLook.x=_cxB+Math.cos(_a2B)*_hlB;camLook.z=_czB+Math.sin(_a2B)*_hlB;}
        const _gdB=Math.hypot(_dxB,_dzB)||1;
        const _eLB=Math.atan2(_lyB,_hlB),_eBB=Math.atan2(_dyB,_gdB);
        const _eMB=Math.atan(_tHB)*0.92;const _dEB=_eBB-_eLB;
        if(Math.abs(_dEB)>_eMB){
          let _corE2=_dEB-Math.sign(_dEB)*_eMB*0.98;const _capE2=Math.min(Math.abs(_corE2),dt*2.0);_corE2=Math.sign(_corE2)*_capE2;
          _hyBump478(sr,'be',_corE2);
          camLook.y=clamp(_cyB+Math.tan(_eLB+_corE2)*_hlB,0.4,26);}
      }
      /* [7.481.0] MANOPOLA DI PROVA PER L'INQUADRATURA (test-only, spenta in produzione). Il censimento
         del 7.480 ha misurato che l'eroe occupa il 5,7% dell'altezza schermo (mediana su 191 scene) e che
         il 99% sta sotto la soglia di leggibilita' del gesto. Ma «stringere» e' una decisione di regia, e
         una decisione si prende guardando: questa manopola avvicina la camera al punto che guarda,
         lasciando invariata la direzione — cosi' si producono i provini alla stessa scena e si sceglie il
         numero, invece di discuterlo. Nessun effetto senza `__CPM_ZOOM480`. */
      /* ⚠️ PRIMA STESURA SBAGLIATA E CORRETTA: avvicinava la camera al PUNTO GUARDATO, che e' l'azione e
         non l'eroe — cosi' a k=0,3 la camera gli passava attraverso e la proiezione esplodeva (altezze
         misurate 34, 47, 251: numeri impossibili, l'eroe era dietro il piano camera). Ora si accorcia la
         distanza DALL'EROE, con un fondo di 3,5 unita' sotto il quale non si scende: la direzione resta
         quella scelta dalla regia, cambia solo quanto e' vicino il soggetto. */
      /* ⚠️ TERZA CORREZIONE, e nasce dalla misura precedente: lo STESSO moltiplicatore da' inquadrature
         diverse a ogni scena (k=0,55 misura 0,115 su gi0 e 0,455 su gi7, perche' la camera non parte
         dalla stessa distanza). Un regista non sceglie un moltiplicatore, sceglie una TAGLIA: con
         `__CPM_FRAMET480` si chiede l'altezza apparente voluta e la distanza si ricava invertendo la
         proiezione — d = h / (2·altezza·tan(fov/2)) — cosi' la stessa riga vale su tutte e 191. */
      if(typeof window!=='undefined'&&(window.__CPM_ZOOM480||window.__CPM_FRAMET480)&&isHL&&hero){
        const _kZ=+window.__CPM_ZOOM480||0,_tgZ=+window.__CPM_FRAMET480||0;
        if((_kZ>0&&_kZ<1)||(_tgZ>0&&_tgZ<1)){const _hx=hero.position.x,_hy=hero.position.y+0.9,_hz=hero.position.z;
          const _vx=camera.position.x-_hx,_vy=camera.position.y-_hy,_vz=camera.position.z-_hz;
          const _d=Math.hypot(_vx,_vy,_vz)||1;
          const _tfZ=Math.tan(((camera&&camera.fov)||46)*Math.PI/360);
          const _t=_tgZ>0?Math.max(3.5,1.75/(2*_tgZ*_tfZ)):Math.max(3.5,_d*_kZ),_sc=_t/_d;
          camera.position.set(_hx+_vx*_sc,_hy+_vy*_sc,_hz+_vz*_sc);
          /* ⚠️ SECONDA CORREZIONE, misurata: spostare la camera non basta. Le due reti anti-fuoriquadro
             qui sopra hanno mirato con la camera VECCHIA, quindi dopo lo spostamento il loro conto non
             vale piu' — e il primo giro di provini e' uscito con l'eroe FUORI DAL QUADRO in 9 riquadri
             su 12, cioe' chiedendo al PO di scegliere fra immagini in cui il soggetto non c'e'. Ora,
             stringendo, si guarda anche piu' verso di lui: e' quello che fa un operatore vero. */
          const _wZ=clamp(1-_sc,0,1);camLook.x+=(_hx-camLook.x)*_wZ;camLook.y+=(_hy-camLook.y)*_wZ;camLook.z+=(_hz-camLook.z)*_wZ;}}
      /* [7.503.1 F6/1] RACCOLTA, a fine blocco: qui hanno parlato TUTTE le passate, comprese le tre che
         girano dopo la fusione (bisezione · snap · vista-reale). */
      try{if(typeof window!=='undefined'&&!window.__CPM_NO503&&isHL&&sr.current._tocc503){
        const _t503=sr.current._tocc503;
        const _w503=(window.__CPM_CAM503=window.__CPM_CAM503||{f:0,tocchi:0,multi:0,combo:{},per:{}});
        _w503.f++; _w503.tocchi+=_t503.length;
        for(const _n of _t503)_w503.per[_n]=(_w503.per[_n]||0)+1;
        if(_t503.length>1){_w503.multi++;const _k=_t503.join('+');_w503.combo[_k]=(_w503.combo[_k]||0)+1;}
      }}catch(_e503){}
      /* ⚠️ [7.544.0 collaudo PO codice 007, 11 note] PROVATO E REVOCATO CON LE SUE MISURE — ma la
         DIAGNOSI resta, ed e' il pezzo che vale.
         PUNTO DI PARTENZA: il 7.521 aveva scritto il rimedio giusto — «UN arbitro a valle di TUTTE le
         passate», inerzia EMA sui bersagli — ma l'ordine del codice lo smentisce: l'arbitro gira qui sopra
         (~17245) e le reti post-lerp (`bisezione`, `snap`, `vista-reale`) ~60 righe piu' giu'. Un arbitro
         che non ha l'ultima parola non e' un arbitro. MISURA coi due testimoni gia' in produzione
         (OSC521 = bersaglio prima del rendering · OSC521B = asse RESO): su gi130 il bersaglio inverte 0,2
         volte al secondo e l'asse reso 5,3 — VENTISEI volte tanto.
         QUATTRO TARATURE, tutte misurate in ENTRAMBI i versi (oscillazione dell'asse e fuori quadro, con
         il riferimento rimisurato nello stesso giro a rimedio spento: 6,5%):
           inerzia su tutto, tau 120ms      asse 0,0 inv/s   fuori quadro 22,9%  (soglia 10)
           + legalita' esente               asse 0,0         fuori quadro 10,7%
           + tau 60ms                       asse 0,0         fuori quadro 10,1%
           + isteresi 0,33s sulla legalita' asse 0,3 · MA gi130 sale a 11,3 (peggio del 5,3 di partenza)
         L'ultima riga e' il verdetto: su gi130 la rete di legalita' ingaggia quasi OGNI fotogramma
         (`bisezione x47 · bisezione+vista-reale x42`), quindi l'isteresi tiene l'arbitro zitto per sempre.
         E quel dato dice la cosa che conta davvero: li' COMPOSIZIONE e LEGALITA' SI CONTRADDICONO a ogni
         fotogramma — la prima vuole inquadrare un punto che la seconda dichiara illegale, e il ping-pong
         E' il tremore. Non e' un problema di smorzamento e nessuna taratura dell'inerzia lo chiude.
         IL PROSSIMO PASSO, che segue da qui: quando la rete di legalita' ingaggia in modo RIPETUTO, non
         va corretto il bersaglio ogni fotogramma — va cambiata la COMPOSIZIONE (arretrare/allargare finche'
         il soggetto e' legale, cosa che la bisezione a ~17105 sa gia' fare) e poi tenerla ferma. Un
         arbitro che decide una volta, non due passate che si correggono a vicenda sessanta volte al
         secondo. */
      /* [testimone B 007] l'asse RESO, dopo lerp E reti post-lerp: e' cio' che lo schermo vede. */
      if(typeof window!=='undefined'&&window.__CPM_OSC521B!==undefined){try{const _ob=window.__CPM_OSC521B;
        const _alB=Math.atan2(camLook.x-camera.position.x,camLook.z-camera.position.z);
        const _handsB=(sr.current._tocc503||[]).join('+')||'nessuna';
        if(_ob.p!=null){let _dB=((_alB-_ob.p+Math.PI*3)%(Math.PI*2))-Math.PI;
          if(Math.abs(_dB)>0.009){const _sgB=_dB>0?1:-1;
            if(_ob.s!=null&&_sgB!==_ob.s){_ob.flips=(_ob.flips||0)+1;if(Math.abs(_dB)>(_ob.amp||0))_ob.amp=+Math.abs(_dB).toFixed(4);
              if(_ob.att){_ob.att[_handsB]=(_ob.att[_handsB]||0)+1;}}
            _ob.s=_sgB;}}
        _ob.p=_alB;_ob.f=(_ob.f||0)+1;}catch(_e){}}
      /* [7.671.0 — CODICE 007: L'OCCHIO NON PUO' GIRARE PIU' IN FRETTA DI COSI'. Rosso __CPM_NO671.
         VENTI E PIU' NOTE DEL PO, sei solo nell'ultimo collaudo, sempre la stessa firma: «lo sguardo
         oscilla, 10-30 inversioni al secondo, ampiezza 6-8 gradi — lerp 52-75% + vista-reale 19-33%,
         da 2,2 a 4,5 passate per fotogramma». Cinque volte (7.475, 7.478, 7.563, 7.598, 7.619) ho
         tolto un contendente alla volta all'asse ottico, e ogni volta ne restava un altro: e' una
         gara fra scrittori che si rincorrono a frequenza di fotogramma, e vincerla togliendo pezzi
         significa rifare il conto ogni volta che nasce una rete nuova.
         CAMBIO DI STRATEGIA, e stavolta non riguarda CHI scrive ma QUANTO IN FRETTA si puo' girare.
         Qualunque sia l'ultima mano del fotogramma, l'asse reso non ruota piu' di 150 gradi al
         secondo: un ping-pong di sei gradi a venti hertz chiederebbe 240 gradi al secondo e viene
         schiacciato in una panoramica continua, mentre una panoramica vera (che sta ampiamente sotto)
         passa intatta. E' un limite di VELOCITA', non una correzione di posizione: non sposta il
         bersaglio, non decide dove guardare, non tocca la posizione della camera — quindi la firma
         golden resta intatta per costruzione, come nel 7.478 e nel 7.563.
         ESENZIONI, perche' un limite senza eccezioni diventa un difetto: i TAGLI di scena (dove
         l'occhio DEVE saltare) e il primo fotogramma dopo uno stacco, riconosciuti dalla distanza —
         oltre mezzo radiante non e' oscillazione, e' un cambio d'inquadratura.
         ⚠️ IL GUADAGNO NON E' MISURABILE QUI, e lo dichiaro come nel 7.598: il laboratorio gira a
         7 fps e vede 0,2 inversioni al secondo dove il telefono del PO ne misura 41 — servirebbero
         69 fps per esprimere quel numero. Cio' che il laboratorio PUO' dire e' che la panoramica
         legittima non viene rallentata (metro: la camera raggiunge il bersaglio entro la scena) e
         che nessun test cambia colore. Il verdetto sul tremore lo da' il dispositivo. */
      {const _no671=(typeof window!=='undefined'&&window.__CPM_NO671);
       const _cs671=sr.current;
       const _ax671=Math.atan2(camLook.x-camera.position.x,camLook.z-camera.position.z);
       const _ay671=Math.atan2(camLook.y-camera.position.y,Math.hypot(camLook.x-camera.position.x,camLook.z-camera.position.z));
       if(!_no671&&_cs671._ax671!=null&&dt>0&&dt<0.5){
         let _dax=((_ax671-_cs671._ax671+Math.PI*3)%(Math.PI*2))-Math.PI;
         let _day=_ay671-_cs671._ay671;
         /* ⚠️ [7.697.0 — IL TETTO GIUSTO, MISURATO INVECE CHE STIMATO. Rosso __CPM_NO697C]
            Il tetto del 7.671 (150 gradi/s) non si e' MAI acceso su questo difetto: le note del PO danno
            5,1-7,5 gradi d'ampiezza a 13-16 inversioni/s, cioe' 66-120 gradi/s, sempre sotto. L'avevo
            scelto a stima, dichiarando che non sapevo misurarlo.
            CENSIMENTO (sguardo-696, sette scene, 1151 campioni di yaw separati in due popolazioni):
            la PANORAMICA legittima — fotogrammi senza inversione, n 1060 — sta a mediana 0 gradi/s,
            p90 16, p99 63; il TREMORE — fotogrammi con inversione, n 91 — sta a mediana 85, p90 120.
            Le due popolazioni si sfiorano solo nell'1% piu' veloce delle panoramiche: il tetto giusto
            esiste e vale ~70 gradi/s.
            Non lo si puo' pero' applicare a tutto: ci sono panoramiche legittime fino a 239 gradi/s e
            schiacciarle a 70 le renderebbe lente. Il tetto stretto vale SOLO quando il movimento
            INVERTE rispetto al fotogramma precedente — che e' esattamente il criterio con cui le due
            popolazioni sono separate. Una spazzata continua passa a 150 com'era; un ping-pong viene
            schiacciato a 70. E qui il rimedio TOGLIE energia: il tentativo revocato nel 7.696 ne
            aggiungeva, ed era quello il suo difetto di segno. */
         const _inv697=(!(typeof window!=='undefined'&&window.__CPM_NO697C)&&_cs671._sgn671&&Math.sign(_dax)!==0&&Math.sign(_dax)!==_cs671._sgn671);
         const _max671=(_inv697?1.22:2.62)*dt;/* 70 gradi/s sulle inversioni, 150 sulle panoramiche */
         const _taglio671=(Math.abs(_dax)>0.5||!!_cs671._cutSnap||!!_cs671._sceneCut);
         if(!_taglio671&&(Math.abs(_dax)>_max671||Math.abs(_day)>_max671)){
           const _axC=_cs671._ax671+Math.max(-_max671,Math.min(_max671,_dax));
           const _ayC=_cs671._ay671+Math.max(-_max671,Math.min(_max671,_day));
           const _r671=Math.hypot(camLook.x-camera.position.x,camLook.z-camera.position.z)||1;
           camLook.x=camera.position.x+Math.sin(_axC)*_r671;
           camLook.z=camera.position.z+Math.cos(_axC)*_r671;
           camLook.y=camera.position.y+Math.tan(Math.max(-1.2,Math.min(1.2,_ayC)))*_r671;
           try{if(_cs671._tocc503)_cs671._tocc503.push('freno671');}catch(_e){}
           if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{window.__CPM_FRENO671=(window.__CPM_FRENO671||0)+1;}catch(_e){}}
         }
       }
       {const _nx697=Math.atan2(camLook.x-camera.position.x,camLook.z-camera.position.z);
        if(_cs671._ax671!=null){let _d697=((_nx697-_cs671._ax671+Math.PI*3)%(Math.PI*2))-Math.PI;
          if(Math.abs(_d697)>0.006)_cs671._sgn671=Math.sign(_d697);}}/* [7.697.0] il verso dell'ultimo movimento VERO reso a schermo: e' il riferimento su cui si riconosce l'inversione, e i micro-movimenti sotto la soglia del detector non lo sporcano */
       _cs671._ax671=Math.atan2(camLook.x-camera.position.x,camLook.z-camera.position.z);
       _cs671._ay671=Math.atan2(camLook.y-camera.position.y,Math.hypot(camLook.x-camera.position.x,camLook.z-camera.position.z));}
      camera.lookAt(camLook.x,camLook.y,camLook.z);

      // ---- Meteo: caduta particelle + flash temporale ----
      if(wParticles){
        const wp=wParticles,arr=wp.pos;const fall=wp.vy*dt;
        for(let i=0;i<wp.N;i++){
          arr[i*3+1]-=fall;
          if(wp.snow){arr[i*3]+=Math.sin(now*0.001+i)*0.03;arr[i*3+2]+=Math.cos(now*0.0012+i)*0.02;}
          if(arr[i*3+1]<0){arr[i*3+1]=64;arr[i*3]=(Math.random()-0.5)*132;arr[i*3+2]=(Math.random()-0.5)*92;}
        }
        wp.pts.geometry.attributes.position.needsUpdate=true;
      }
      if(flashLight){
        if(flashLight.userData.t<=0&&Math.random()<0.004)flashLight.userData.t=0.2;
        if(flashLight.userData.t>0){flashLight.intensity=7;flashLight.userData.t-=dt;}else flashLight.intensity=0;
      }

      // ---- Scia palla 3D — Sprint 3D-BALL (HL intensa + mini-trail in gioco) ----
      trailHist.push(ball.position.x,ball.position.y,ball.position.z);
      if(trailHist.length>TRAIL_N*3)trailHist.splice(0,trailHist.length-TRAIL_N*3);
      // 3DV-1: scia sempre bianca — rimossi arancione/giallo/cyan; scale e opacità ridotti (no palla di fuoco)
      const _showTrail=isHL||(P.matchPhase==="playing"&&moved>0.5);
      for(let i=0;i<TRAIL_N;i++){const d=trailDots[i],j=i*3;
        if(_showTrail&&j<trailHist.length){d.visible=true;d.position.set(trailHist[j],trailHist[j+1],trailHist[j+2]);d.material.color.setHex(0xffffff);
          const age=(i+1)/TRAIL_N;
          if(isHL){d.material.opacity=0.06+age*0.24;d.scale.setScalar(0.20+age*0.36);}
          else{d.material.opacity=0.03+age*0.10;d.scale.setScalar(0.12+age*0.20);}
        }else d.visible=false;}
      // === [6.71.0] SCIA "banana" — update per-frame (ball.position già definitiva: x/z sopra, y dall'arco). Legge _struckArc VERBATIM, nessuno stato logico scritto. ===
      if(_TRAIL_ON){
        const _atHt=(propsRef.current&&propsRef.current.hlType)||null;// [6.71.0] in hl_result la conclusione vola con ballArcIsBG=true (arco flaggato BG) → NON usare _struckArc (che lo esclude): in hl_result l'arco È la conclusione; la cronaca ambientale sta in "playing" (isResult=false)
        const _atActive=isResult&&ballArcActive&&(_atHt==="shot"||_atHt==="header"||_atHt==="penalty"||_atHt==="freekick");// SOLO conclusioni COLPITE, robusto al flag BG
        _atFade+=((_atActive?1:0)-_atFade)*Math.min(1,aDt*(_atActive?14:6));// envelope: salita rapida, discesa dolce → dissolvenza pulita
        if(_atActive){
          const _lp=_atHist.length?_atHist[_atHist.length-1]:null;// spaziatura minima 0.28u → punti distanziati (niente grumi a palla lenta)
          if(!_lp||((ball.position.x-_lp.x)**2+(ball.position.y-_lp.y)**2+(ball.position.z-_lp.z)**2)>0.078){
            _atHist.push({x:ball.position.x,y:ball.position.y,z:ball.position.z});if(_atHist.length>ATRAIL_LEN)_atHist.shift();}
        } else if(_atHist.length&&_atFade<0.02){_atHist.length=0;}// reset a dissolvenza completa → nessuno scatto al prossimo arco
        const _atN=_atHist.length;
        if(_atFade>0.01&&_atN>=2){
          for(let i=0;i<_atN;i++){const p=_atHist[i],j=i*3;_atPos[j]=p.x;_atPos[j+1]=p.y;_atPos[j+2]=p.z;
            const _t=i/(_atN-1),k=Math.pow(_t,2.2)*_atFade;// coda(0)→testa(1): il bagliore abbraccia la palla, la coda→nero(invisibile)
            _atCol[j]=_atHead.r*k;_atCol[j+1]=_atHead.g*k;_atCol[j+2]=_atHead.b*k;}
          _atGeo.setDrawRange(0,_atN);_atGeo.attributes.position.needsUpdate=true;_atGeo.attributes.color.needsUpdate=true;arcTrail.visible=true;
        }else arcTrail.visible=false;
      }
      // Sprint 3D-G1: sweep cromatico cartelloni LED (onda lenta, tinte club, leggermente più viva negli HL)
      const _ledPhase=now*0.0011,_ledOff=Math.floor(_ledPhase);
      const _ledBoost=(isHL?0.18:0)+(goalBurstT>0?Math.max(0,1-goalBurstT/1.8)*0.55:0);// Sprint 3D-G3B: LED boost sul gol
      for(let i=0;i<LED_SEG;i++){const c=_ledCols[(i+_ledOff)%3],kbr=Math.min(0.42+_ledBoost+0.28*Math.sin(_ledPhase*3+i*0.5),0.82);// 3DV-2: cap 0.82, ridotti (era max 1.63 → saturazione)
        ledStrips[i].material.color.copy(c).multiplyScalar(kbr);ledStrips[i+LED_SEG].material.color.copy(c).multiplyScalar(kbr);}
      // item 1 (5.49.9): TABELLONE — ridisegna solo quando cambia punteggio o minuto (economico)
      if(_sbDraw){const _h=P.scoreHome||0,_a=P.scoreAway||0,_c=(P.matchClock||0)|0;if(_h!==_sbLastH||_a!==_sbLastA||_c!==_sbLastC){_sbLastH=_h;_sbLastA=_a;_sbLastC=_c;_sbDraw(homeAbbr,awayAbbr,_h,_a,_c);_sbTex.needsUpdate=true;}}
      // 3DV-7: scorrimento banner competizione LED (UV offset su RepeatWrapping)
      {const _bs=now*0.000032;compBanner1.material.map.offset.x=_bs;compBanner2.material.map.offset.x=-_bs;}
      heroMark.position.set(hero.position.x,3.0+Math.sin(now*0.004)*0.12,hero.position.z);
      heroMark.rotation.y+=dt*1.1;
      heroMark.material.opacity=isHL?0.85+Math.sin(now*0.012)*0.15:0.62;
      heroMark.scale.setScalar(isHL?1.0+Math.sin(now*0.012)*0.08:0.9);
      // 1.0b: sync avatar GLB (posizione/velocità→blend idle↔corsa) + gesti one-shot: EROE (actType) + PORTIERE (oppActType). No-op se flag spento.
      if(glbAvatars){
        // EROE: mappa actType→gesto (volée se variante shot_volley; cross/freekick riusano 'kick'). dribble/pass/build → solo locomozione.
        let _gName=null;
        /* [7.534.0 MP-1 — LA CLIP DAL VOCABOLARIO, rosso __CPM_NO547] la catena if famiglia→clip diventa
           il lookup della tabella GESTI: stessa risoluzione di prima riga per riga (shot_volley→volley,
           lunge→kick, press/call→locomozione, aerial→header...), ma ora la mappa e' UN dato consultabile
           — dal guardiano gesto-vocabolario, dalle colonne future (contactAt/foot) e da MP-2. Le note
           storiche della catena (7.245/7.361/6.40/6.41, gi146) vivono nella tabella e in questo commento. */
        if(actType==='tackle'){const _dgG=(sr.current._dgFar440===((propsRef.current&&propsRef.current.hlSitKey)))?'press':(propsRef.current&&propsRef.current.hlDefGesto);/* [gi146] gesto partito lontano → press = locomozione anche GLB-ON. E la clip parte SOLO col gesto (actT>0): durante l'attesa 7.415 la mappa montava comunque la scivolata al momento della risoluzione */
          if(actT<=0)_gName=null;else{const _gg=gestoDi('tackle',(_dgG==='lunge'||_dgG==='press'||_dgG==='call'||_dgG==='aerial'||_dgG==='slide')?_dgG:null);_gName=(_gg&&_gg.clip)||null;}}
        else if(actType){const _gg=gestoDi(actType,(propsRef.current&&propsRef.current.hlVariant)||null);_gName=(_gg&&_gg.clip)||null;
          /* [7.672.0 — collaudo PO, SETTIMA segnalazione: «la volee' e' una rovesciata al contrario»
             (SIT #88, azione «Volee' di collo potente»). LA DISTINZIONE C'ERA, MA SOLO NEL MONDO
             SBAGLIATO. Il 7.569 aveva gia' separato le due giocate — volee' fronte alla porta in
             piedi, rovesciata acrobatica spalle alla porta — leggendo l'etichetta dell'azione: ma
             quella separazione vive nella posa PROCEDURALE, e il gioco vero usa i personaggi GLB,
             dove `shot_volley` sceglie la clip `volley` per ENTRAMBE. La clip e' acrobatica, quindi
             ogni volee' veniva recitata come una rovesciata — con il corpo rovesciato all'indietro e
             il piede rivolto dalla parte opposta alla porta, esattamente la frase del PO.
             Stessa lezione della 7.665 sui giocatori che non sparivano: avevo curato il ramo che le
             mie sonde vedono, non quello che il PO guarda.
             Qui la stessa etichetta decide anche la CLIP: acrobatica solo se l'azione lo dice, e per
             la volee' il tiro normale in piedi. __CPM_NO672 = rosso. */
          if(_gName==='volley'&&!(typeof window!=='undefined'&&window.__CPM_NO672)){
            const _lbl672=String((propsRef.current&&propsRef.current.hlActLbl)||"");
            if(!/rovesciat|sforbiciat|acrobat/i.test(_lbl672)){_gName='kick';
              if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{(window.__CPM_GEST672=window.__CPM_GEST672||[]).push({lbl:_lbl672.slice(0,40),clip:'kick'});}catch(_e){}}}
            else if(typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)){try{(window.__CPM_GEST672=window.__CPM_GEST672||[]).push({lbl:_lbl672.slice(0,40),clip:'volley'});}catch(_e){}}
          }}
        /* [7.403.0 collaudo PO gi52 «fa prima un tiro poi tenta il colpo di testa» · gi184 «sembra un
           ballerino»] IL GESTO DELLA SCENA VECCHIA NON SI MONTA. `actType` e' una variabile del renderer
           che resta quella della scena PRECEDENTE finche' `fireConclusion` non scatta — e scatta a fine
           build-up: per tutta la costruzione la mappa montava la clip vecchia (misurato col collettore
           GLB-ON: su gi52, azione di testa, prima clip `tackle` — residuo della difensiva prima — poi
           `header`; su gi184, tackle, prima `header` poi `kick`). Il gesto dell'Eroe si monta solo se
           l'azione appartiene a QUESTA scena. */
        if(sr.current._actSitKey403!==P.hlSitKey)_gName=null;
        // PORTIERE avversario: la parata è segnalata da oppActType==='gk_dive' (oppMesh=awayGkMesh). La traslazione laterale/verticale
        // resta guidata dalla reazione procedurale; il GLB ci sovrappone la CLIP di tuffo per gli arti.
        const _gkWant=(oppActType==='gk_dive')?'dive':(oppActType==='gk_catch')?'catch':(oppActType==='gk_block')?'block':null;// [5.83.0 IA-3] clip catch GLB finalmente usata · [7.203.0] clip BLOCK finalmente usata (era scaricata a ogni partita e mai suonata)
        for(let _ai=0;_ai<glbAvatars.length;_ai++){const _a=glbAvatars[_ai],_p=_a.proc,_gdx=_p.position.x-_a.lx,_gdz=_p.position.z-_a.lz,_gsp=Math.hypot(_gdx,_gdz);
          _a.root.position.set(_p.position.x,(_ai===0&&_p.position.y<0)?0:_p.position.y,_p.position.z);/* [7.246.0 batch PO «l'eroe si butta a terra da posizione sbagliata»] le pose difensive procedurali AFFONDANO y (-0.18/-0.35) perché GLB-OFF il corpo è RUOTATO orizzontale (scivolata) — ma il root CH38 copia SOLO la y, non la rotazione → modello conficcato nel prato fino alle ginocchia su lunge/press. La y negativa dell'eroe non passa al GLB (le clip fanno da sole la discesa); la y POSITIVA (salto di testa, esultanza) resta */
          // facing GRADUALE verso la direzione di movimento (turn-rate cap) — NIENTE snap per-frame (era la causa principale del "twitch schizofrenico"
          // degli avatar). Soglia di movimento più alta (0.02 vs 0.003) → non rifà il facing per micro-movimenti. Fermo durante il tuffo GK.
          /* [7.518.0 R3/3 — SELETTORE DI LOCOMOZIONE DIREZIONALE] L'angolo fra moto e facing sceglie il
             canale: avanti=run · dietro=jog-back · fianco=strafe. Lo scambio avviene RIPUNTANDO `_a.run`
             (tutte le scritture esistenti di peso/timeScale seguono il canale attivo) con dissolvenza
             ESPLICITA del canale precedente — lezione 7.516: un canale abbandonato con peso alto resta
             impresso. Isteresi a tempo (0,25s di permanenza minima) contro lo sfarfallio ai confini.
             Pigrizia: l'AnimationAction nasce al primo uso. __CPM_NO518 = rosso (solo run, pattinate). */
          if(_a._locoFade){const _lf=_a._locoFade;_lf.t-=dt;_lf.act.weight*=Math.max(0,1-dt*8);if(_lf.t<=0){try{_lf.act.stop();}catch(_e){}_a._locoFade=null;}}
          if(_a._locoClips&&!_a._isGk&&!_a._isRef&&!(typeof window!=='undefined'&&window.__CPM_NO518)){
            _a._locoDwell=Math.max(0,(_a._locoDwell||0)-dt);
            if(_gsp>0.03&&_a._locoDwell<=0){
              const _mvA=Math.atan2(_gdx,_gdz);let _rel=((_mvA-_a.root.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;
              const _wantL=Math.abs(_rel)<0.9?'run':Math.abs(_rel)>2.35?'back':(_rel>0?'strL':'strR');
              const _curL=_a._locoName||'run';
              if(_wantL!==_curL){
                let _na=null;
                if(_wantL==='run'){_na=_a._runFwd||_a.run;}
                else{const _cl=_a._locoClips[_wantL];
                  if(_cl){_a._locoActs=_a._locoActs||{};_na=_a._locoActs[_wantL]||(_a._locoActs[_wantL]=_a.mx.clipAction(_cl));}}
                if(_na&&_na!==_a.run){
                  if(!_a._runFwd)_a._runFwd=_a.run;/* il canale avanti originale si conserva */
                  const _ow=_a.run?_a.run.weight:0;
                  _a._locoFade={act:_a.run,t:0.22};
                  _na.play();_na.weight=_ow;_na.timeScale=_a.run?_a.run.timeScale:1;
                  _a.run=_na;_a._locoName=_wantL;_a._locoDwell=0.25;
                  if(typeof window!=='undefined'&&window.__CPM_LOCO518!==undefined){try{window.__CPM_LOCO518[_wantL]=(window.__CPM_LOCO518[_wantL]||0)+1;}catch(_e){}}
                }
              }
            }
          }
          /* [7.636.0 — LA MIRA SI LATCHA ANCHE IN RITARDO. Rosso __CPM_NO636]
             Collaudo PO (3 segnalazioni): «il marcatore segna col corpo non rivolto alla porta».
             Il latch 7.517 si arma SOLO se l'arco e' gia' vivo al montaggio del gesto — ma il gesto
             di calcio monta PRIMA che la palla parta: `ballArcActive` false, mira nulla, e il corpo
             resta col facing dell'avvicinamento (misurato sul gemello procedurale: 134-151 gradi dal
             tiro al decollo). Qui la mira si arma PIGRA: al primo fotogramma del gesto in cui l'arco
             esiste. Esclusi GK e gesti non direzionali, come nel 7.517. */
          if(_a._gName&&_a._tgt517==null&&!_a._isGk&&ballArcActive&&_a._gName!=='lift'&&_a._gName!=='receive'&&!(typeof window!=='undefined'&&window.__CPM_NO636)){
            _a._tgt517=Math.atan2(ballArcTgtX-_p.position.x,ballArcTgtZ-_p.position.z);
            _a._aim517=(typeof window!=='undefined'&&window.__CPM_NO517)?null:_a._tgt517;}
          if(_a._gName&&_a._aim517!=null&&!_a._isGk){/* [7.517.0 R3/2] durante il gesto comanda la MIRA
            latchata al montaggio: prima la rotazione si spegneva sotto ~1,8 u/s (gate _gsp) e il tiro si
            giocava col facing dell'avvicinamento. Turn-rate dedicato, continuo per tutto il gesto. */
            let _da=((_a._aim517-_a.root.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;_a.root.rotation.y+=_da*Math.min(dt*7,1);}
          else if(_gsp>0.03&&!_a._isGk){const _ta=Math.atan2(_gdx,_gdz);let _da=((_ta-_a.root.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;_a.root.rotation.y+=_da*Math.min(dt*5.5,1);}
          else if(_ai===0&&!_a._gName&&propsRef.current&&(propsRef.current.hlType==="penalty"||propsRef.current.hlType==="freekick"||propsRef.current.hlSetPiece)){
            /* [7.311.0 collaudo PO «postura sbagliata sulle punizioni»] il CH38 ruota SOLO col movimento: fermo
               sul pallone del piazzato non si girava mai. Qui eredita il facing del modello procedurale, che
               dal 7.311.0 punta la porta — stesso smorzamento, nessuno snap. */
            let _dsp=((_p.rotation.y-_a.root.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;_a.root.rotation.y+=_dsp*Math.min(dt*4,1);}
          else if(_a._isGk&&!_a._gName){const _bp166=sr.current.ball&&sr.current.ball.position;if(_bp166){const _ta2=Math.atan2(_bp166.x-_p.position.x,_bp166.z-_p.position.z);let _da2=((_ta2-_a.root.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;_a.root.rotation.y+=_da2*Math.min(dt*4,1);}}/* [7.166.0 collaudo PO «il portiere a volte è di spalle/in diagonale»] il GK GLB non eredita mai il facing dallo shuffle laterale: guarda SEMPRE la palla (fermo durante il tuffo, come prima) */// item 5 (5.49.1): facing GLB più morbido (turn-rate 8→5.5, soglia 0.02→0.03) → rotazioni fluide, niente twitch
          _a.lx=_p.position.x;_a.lz=_p.position.z;
          // Step D: blend locomozione da velocità SMUSSATA (EMA τ≈0.12s) + crossfade (τ≈0.14s) → niente flicker idle↔corsa.
          // Stride (timeScale della corsa) scala con la velocità → meno foot-slide. (Sostituisce il vecchio _gsp*55 grezzo.)
          const _spd=_gsp/Math.max(dt,0.001);
          _a._spS=(_a._spS==null)?_spd:_a._spS+(_spd-_a._spS)*Math.min(dt*6,1);// item 5 (5.49.1): velocità smussata più dolce (EMA τ≈0.17s)
          // #4: EROE (_ai===0) con dead-zone più ampio → il micro-jitter del target NON fa entrare la corsa ("palleggio"/marcia sul posto)
          const _idleHero=_CPM_IDLE&&_ai===0;
          const _bt=_idleHero?Math.min(Math.max((_a._spS-0.6)/1.0,0),1):Math.min(Math.max((_a._spS-0.12)/0.7,0),1);
          _a._locB=(_a._locB==null)?_bt:_a._locB+(_bt-_a._locB)*Math.min(dt*5,1);// item 5: transizione idle↔corsa più graduale (τ≈0.2s) → crossfade animazioni fluido
          if(_idleHero&&_a.idle)_a.idle.timeScale=0.5;// #4: idle dell'Eroe rallentato → posizione d'attesa calma, non palleggio
          /* [7.206.0 direttiva PO «mai movimenti robotici»] LA CADENZA DEL PASSO SEGUE LA VELOCITÀ. Un piede
             non slitta quando il ritmo del ciclo di corsa è PROPORZIONALE alla velocità reale; qui la cadenza
             era `0.55 + blend·0.40`, e il blend SATURA già a ~0.8 u/s → sopra quella soglia il ritmo restava
             quasi fermo a 0.95 mentre la velocità continuava a crescere. Misurato con la probe `footslide-test`
             (hook `__CPM_STRIDE`, GLB attivi, frame di setup scartati): il rapporto velocità/cadenza derivava
             ×3.14 fra la fascia lenta e quella veloce — a 6.3 u/s le gambe girano solo il 21% più veloce che a
             1.7 u/s, cioè il giocatore pattina. Il termine additivo P2 del 5.55.0 mitigava solo oltre 3 u/s e
             al massimo di +0.55. Ora la cadenza è PROPORZIONALE con banda di sicurezza (0.62-2.15: sotto è
             comunque il blend a tenere il passo calmo, sopra ~8 u/s si è nel pieno sprint e più di così il
             ciclo diventa frenetico). Il flag `?cpmcarry=0` continua a riportare al comportamento storico. */
          const _lb=_a._locB;if(_a.run)_a.run.timeScale=_CPM_CARRY?clamp(0.62+_a._spS*0.185,0.62,2.15):(0.55+_lb*0.40);// 5.47.17: stride calmo (base max ~0.95) + P2: oltre la saturazione del blend la cadenza sale con la velocità reale (max +0.55 → ~1.5) → meno foot-slide in conduzione veloce, feel calmo a bassa velocità invariato
          if(_CPM_TEST&&typeof window!=='undefined'&&_a.run){try{const _sb=window.__CPM_STRIDE||(window.__CPM_STRIDE=[]);if(_a._spS>1&&_sb.length<4000)_sb.push([+_a._spS.toFixed(2),+_a.run.timeScale.toFixed(3)]);}catch(_e){}}/* [7.206.0] campionamento velocita<->cadenza del passo per la probe foot-slide */
          /* [7.209.0] richiesta di gesto PER-MESH: chi conclude un'azione (il compagno che finalizza l'assist,
             chi incorna il cross) chiede il proprio calcio/colpo di testa tramite `sr.current._mateFx`. */
          const _mfx=sr.current._mateFx;
          const _mateWant=(_mfx&&_mfx.mesh===_a.proc&&_mfx.t>0)?_mfx.name:null;
          /* [7.516.0 R3/1 — IL RILASCIO NON DIPENDE DALLA CONDIZIONE D'INGRESSO: audit critica «il compagno
             resta deformato per il resto della partita»] Il decadimento del peso del gesto (righe _gw piu'
             sotto) vive DENTRO questo ramo: quando il timer _mateFx scadeva, il compagno non entrava piu' e
             _gAct.weight restava all'ultimo valore (~1) con clampWhenFinished — posa del calcio congelata su
             tutte le 53 ossa, mediata col jog, per il resto della partita. Ora l'avatar entra anche quando ha
             ancora un gesto montato o peso residuo (_gName o _gw>0.02): dentro, _want=null lo rilascia e il
             peso decade fino a zero. __CPM_NO516 = rosso (ingresso solo con _mateWant, orfani di nuovo
             possibili). Testimone __CPM_ORF516: conta gli avatar fuori dal ramo con peso >0,5. */
          const _ent516=_a.gestures&&(_ai===0||_a._isGk||_mateWant||(!(typeof window!=='undefined'&&window.__CPM_NO516)&&(_a._gName||(_a._gw||0)>0.02)));
          if(typeof window!=='undefined'&&window.__CPM_ORF516!==undefined&&_a.gestures&&!_ent516&&_a._gAct&&_a._gAct.weight>0.5){try{window.__CPM_ORF516.push(_ai);}catch(_e){}}
          if(_ent516){// EROE, PORTIERE o COMPAGNO che conclude (o in RILASCIO): gesto one-shot in crossfade con la locomozione
            // [6.76.0 LMV-A1] il gesto GK va SOLO al portiere che sta davvero reagendo (_a.proc===oppMesh):
            //   prima _gkWant era globale → su ogni parata/presa si tuffavano ENTRAMBI i portieri (anche quello a 100m).
            const _g=(_ai===0)?((sr.current._cerLift===1||sr.current._celLift371===1)?'lift':_gName):(_a._isGk?((_a.proc===oppMesh)?_gkWant:null):_mateWant);let _want=(_g&&_a.gestures[_g])?_g:null;/* [7.24.1] cerimonia: posa alzata di coppa (throwin congelata) · [7.24.2] ===1: nel giro di campo (2) corre e le braccia le rialza l'override quaternioni */
            if(_want&&_want!=='tackle'&&_a._gName===_want&&_a._gAct&&_a._gAct.getClip&&_a._gAct.time>=_a._gAct.getClip().duration-0.03)_want=null;
            /* [7.396.0 collaudo PO codice 000, tre segnalazioni: «intervento in ritardo, alza in maniera
               scoordinata due volte la gamba» · «sembra che fa una piroetta con la gamba alzata»]
               UN'AZIONE HA UN GESTO SOLO. La clip del gesto viene scelta a ogni fotogramma dalla mappa
               (actType + gesto difensivo dichiarato), e quando la clip finisce PRIMA della finestra
               dell'azione la ri-selezione puo' montarne UN'ALTRA nella stessa azione: misurato GLB-ON su
               tre scene difensive — `tackle` (1,55s effettivi) seguito da `kick` (0,54s), entrambi con
               l'azione ancora `tackle`. Una scivolata seguita da un'estensione di gamba a vuoto e'
               esattamente la «doppia alzata scoordinata» del PO. Il gesto SPESO resta speso finche' vive
               la stessa istanza d'azione (tipo + scena): un'azione nuova riapre la porta, l'esultanza
               (`lift`) non passa da qui e non e' toccata. */
            /* ⚠️ misurato: il secondo montaggio arriva PRIMA che la prima clip finisca — e' il gesto
               DICHIARATO che cambia a meta' azione (la risoluzione difensiva riscrive `hlDefGesto`), non
               il rilascio della clip. Quindi la guardia non e' «dopo la fine niente di nuovo»: e' «un
               montaggio per istanza d'azione», per il solo EROE — i compagni hanno catene legittime a due
               gesti (ricevi→tira) che vivono su azioni diverse e non c'entrano col codice 000. */
            {const _gk396=(actType||'')+'|'+((propsRef.current&&propsRef.current.hlSitKey)||'');
             /* [7.582.0 — CONTARE I GESTI DELL'EROE PER SCENA, e farlo contare AL GIOCO.
                Collaudo PO (appunti 7.578, SIT #45): «codice 000 — gesto scoordinato». La guardia del
                7.396 concede UN montaggio per istanza d'azione, ma la chiave include `actType`: quando
                l'esito si risolve il tipo d'azione cambia, la chiave cambia con lui e la porta si RIAPRE.
                Un secondo gesto dentro la stessa scena e' esattamente la «doppia alzata» del PO.
                PERCHE' IL CONTEGGIO STA QUI E NON IN UNA SONDA: GLB-ON headless gira a ~0,3 fotogrammi al
                secondo (lezione 7.372, stessa ragione del contatore delle esultanze) — una sonda che
                campiona da fuori vede due fotogrammi per scena e conclude sempre «un gesto solo». Il gioco
                invece lo sa fotogramma per fotogramma. Sola strumentazione: nessun comportamento cambia. */
             if(_ai===0&&typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&_want&&_want!=='lift'&&_a._gName!==_want){try{
               const _sc582=String((propsRef.current&&propsRef.current.hlSitKey)||'?');
               const _G=(window.__CPM_G000=window.__CPM_G000||{});
               const _e=(_G[_sc582]=_G[_sc582]||{n:0,gesti:[],tipi:[]});
               _e.n++;if(_e.gesti.length<8)_e.gesti.push(String(_want));
               const _t582=String(actType||'-');if(_e.tipi[_e.tipi.length-1]!==_t582)_e.tipi.push(_t582);
             }catch(_e582){}}
             if(_ai===0&&_want&&_want!=='lift'&&_a._gKey396===_gk396&&_a._gName!==_want)_want=null;
             if(_ai===0&&_want&&_a._gName!==_want)_a._gKey396=_gk396;}/* [7.247.0 gi33 «sembra uno zombie che vola»] una clip BREVE finita (kick 0.54s) restava CLAMPATA sull'ultimo frame per il resto della finestra actType (fino a 1.2s) mentre il corpo continuava a muoversi = statua che plana. A clip conclusa il gesto si rilascia (fade 0.22s) e la locomozione riprende; la scivolata (tackle, riscalata 1.75x per riempire la finestra) tiene la sua posa */
            /* [7.372.0] CONTATORE STICKY del gesto d'esultanza (test-only). Campionare __CPM_GST da
               node non basta: GLB-ON headless gira a ~0,3 fps e una celebrazione da 2,2s di tempo-scena
               dura due fotogrammi — la sonda concludeva «nessun gesto» su celebrazioni che c'erano.
               Qui il conteggio lo fa il gioco, fotogramma per fotogramma: o e' stato montato o non lo e'. */
            if(_ai===0&&typeof window!=='undefined'&&(_CPM_TEST||_SIT_TEST)&&sr.current._celLift371===1){try{window.__CPM_CELGST=(window.__CPM_CELGST||0)+((_want==='lift'||_a._gName==='lift')?1:0);window.__CPM_CELFR=(window.__CPM_CELFR||0)+1;
              /* [7.384.0 collaudo PO «le esultanze non funzionano»] LA CLIP VA MISURATA MENTRE SUONA.
                 Il contatore sticky del 7.372 diceva se il gesto era MONTATO, non COME veniva suonato — e
                 il difetto stava proprio li': la finestra temporale dei gesti tecnici (0,55s) applicata a una
                 clip da 2,75s produce una scala 5x e un ri-armo a ogni fine clip. Due numeri in piu', scritti
                 dentro il loop perche' headless GLB-ON gira a frazioni di fotogramma al secondo e qualunque
                 campionamento da fuori misurerebbe il caso. */
              /* la scala si legge dal valore DECISO al montaggio: dopo il congelamento all'apice
                 `getEffectiveTimeScale()` torna 0 e la misura si auto-assolverebbe. */
              if(_a._gName==='lift')window.__CPM_CELTS=Math.max(window.__CPM_CELTS||0,+(_a._celTs84||0));
              if(_a._gName==='lift'&&window.__CPM_CELPREV!=='lift')window.__CPM_CELARM=(window.__CPM_CELARM||0)+1;
              window.__CPM_CELPREV=_a._gName||null;}catch(_e){}}
            if(_ai===0&&typeof window!=='undefined'&&window.__CPM_REC){try{const _bm46=sr.current.ball;window.__CPM_GST={g:_g,want:_want,has:_g?!!_a.gestures[_g]:null,cur:_a._gName,ts:(function(){try{return +_a._gAct.getEffectiveTimeScale().toFixed(2);}catch(_e){return null;}})(),cdur:(function(){try{return +_a._gAct.getClip().duration.toFixed(2);}catch(_e){return null;}})(),/* [7.356.0] scala e durata della clip: senza, «il gesto e' troncato» non e' verificabile dal vivo */w:_a._gw!=null?+_a._gw.toFixed(2):null,at:actType||null,aT:+(actT||0).toFixed(2),ry:+_a.root.position.y.toFixed(2),py:+_p.position.y.toFixed(2),db:_bm46?+Math.hypot(_p.position.x-_bm46.position.x,_p.position.z-_bm46.position.z).toFixed(1):null};}catch(_e){}}/* [7.245.0 strumentazione permanente, solo __CPM_REC] stato del gesto GLB dell'EROE: ha inchiodato la classe «il gesto tecnico finale non si vede GLB-ON» · [7.246.0] +ry/py (affondo root vs proc) e db (distanza eroe-palla) per «posizione sbagliata» */
            if(_a._isGk&&typeof window!=='undefined'&&window.__CPM_REC){try{const _bm46b=sr.current.ball;const _tl46=window.__CPM_GKTL||(window.__CPM_GKTL=[]);if(_tl46.length<600)_tl46.push({opp:oppActType||null,oppT:oppActType?+(oppActT||0).toFixed(2):null,isOpp:_a.proc===oppMesh,want:_gkWant,cur:_a._gName||null,w:_a._gw!=null?+_a._gw.toFixed(2):null,pz:+_p.position.z.toFixed(1),tz:_p._diveToZ!=null?+_p._diveToZ.toFixed(1):null,py:+_p.position.y.toFixed(2),/* [7.465.0 codice 111/112 «il portiere non si tuffa nel tempo giusto, sincronizzato col pallone»] IL PALLONE ENTRA NEL COLLETTORE. Finora qui c'era SOLO il portiere: si poteva vedere che il tuffo partiva e dove arrivava, ma non se arrivasse IN TEMPO — e «fuori tempo rispetto alla traiettoria del pallone» e' una relazione fra due corpi, non una proprieta' di uno. Senza la palla, il difetto del PO non era nemmeno esprimibile in numeri. */t:+performance.now().toFixed(0),bx:+_bm46b.position.x.toFixed(1),bz:+_bm46b.position.z.toFixed(1),by:+_bm46b.position.y.toFixed(2),arcT:+(+ballArcT).toFixed(2),arcD:+(+ballArcDur).toFixed(2),dvD:_p._diveDur!=null?+_p._diveDur.toFixed(2):null,gx:+_p.position.x.toFixed(1)});}catch(_e){}}/* [collaudo PO «il portiere sembra imbabolato»] gemello di __CPM_GST per il PORTIERE: trigger logico vs gesto GLB montato vs traslazione del tuffo, fotogramma per fotogramma dentro il loop (headless GLB-ON gira a frazioni di fps: campionare da fuori misura il caso) */
            if(_want&&_a._gName!==_want){
              /* [7.675.0 — RIMEDIO TENTATO E REVOCATO, con la sua misura. La sonda GLB (nuova, qui
                 sotto) ha trovato la causa del codice 113: su 164 campioni con un gesto attivo,
                 TREDICI hanno due clip sopra soglia sullo STESSO personaggio, e la piu' frequente e'
                 «dive 0,87 + block 0,48» — il portiere che si tuffa e para basso nello stesso istante,
                 esattamente la nota del PO. Ho provato a rendere secca la transizione fra gesti
                 esclusivi (due modi di parare, due modi di calciare: non c'e' niente da fondere).
                 MISURA APPAIATA: 17 casi col rimedio contro 20 col rosso — dentro il rumore, nessun
                 guadagno. Quindi la riga non resta: le due clip del portiere non passano da questa
                 transizione, e la caccia continua dove nasce `_gkWant`. Lo STRUMENTO invece resta, ed
                 e' il vero guadagno del giro: adesso questo difetto si misura. */
              /* [7.676.0 — CODICE 113, LA CAUSA VERA: UNA CLIP CHE RESTA APPESA. Rosso __CPM_NO676.
                 La sonda GLB (7.675) misura il difetto — «dive 0,87 + block 0,48» sullo stesso corpo —
                 e il primo rimedio (transizione secca fra gesti esclusivi) non l'ha spostato: 17 contro
                 20, dentro il rumore. Guardando qui si capisce perche': lo slot del gesto precedente e'
                 UNO SOLO. Quando un terzo gesto arriva mentre il secondo sta ancora sfumando, questa
                 riga SOVRASCRIVE `_gPrev` — e la clip che c'era prima resta accesa al suo peso, senza
                 piu' nessuno che la spenga, perche' l'unico che lo fa e' il fade di `_gPrev`. Il
                 portiere che si tuffa, poi para basso, poi si rialza lascia dietro un tuffo a mezzo
                 peso: e' il doppio gesto del PO, ed e' una perdita di riferimento, non un problema di
                 fusione. Ora chi viene sfrattato dallo slot si spegne prima di uscire. */
              if(_a._gAct&&_a._gw>0.05){
                if(!(typeof window!=='undefined'&&window.__CPM_NO676)&&_a._gPrev&&_a._gPrev!==_a._gAct){try{_a._gPrev.setEffectiveWeight(0);_a._gPrev.stop();}catch(_e676){}}
                _a._gPrev=_a._gAct;_a._gPw=_a._gw;}
              /* [7.676.0 — AFFONDO PROVATO E REVOCATO: spegnere, all'avvio di un gesto, TUTTE le clip
                 di quel personaggio tranne la nuova e quella in uscita. Sembrava la regola definitiva
                 («un corpo, una clip») e invece la misura la boccia: 12 casi contro i 10 della stesura
                 semplice, cioe' peggio. Ipotesi su cosa succede, non verificata: spegnere di forza una
                 clip che il mixer sta ancora fondendo la fa ripartire al retrigger successivo con peso
                 pieno. Resta la stesura semplice — chi viene sfrattato dallo slot si spegne — che il
                 rosso conferma: 10 contro 17. */// [7.49.0 BL-06] il gesto precedente non si azzera di colpo (pop): sfuma in _gPrev
              _a._gName=_want;_a._gAct=_a.gestures[_want];_a._gAct.reset().play();
              /* [7.517.0 R3/2 — LA MIRA SI LATCHA AL MONTAGGIO: audit «il corpo non e' orientato verso la
                 direzione del passaggio/tiro»] Al montaggio del gesto si fissa la direzione VERSO il bersaglio
                 dell'arco (se vivo): il driver di facing la usera' al posto del moto residuo. Esclusi GK
                 (guarda la palla per suo conto) e gesti non direzionali (lift/receive). */
              _a._tgt517=(!_a._isGk&&ballArcActive&&_want!=='lift'&&_want!=='receive')?Math.atan2(ballArcTgtX-_p.position.x,ballArcTgtZ-_p.position.z):null;/* il BERSAGLIO si registra in entrambi i bracci: il testimone al rilascio misura l'errore anche col rosso */
              _a._aim517=(typeof window!=='undefined'&&window.__CPM_NO517)?null:_a._tgt517;
              /* [7.356.0 collaudo PO gi167 «Controbalzo improvviso in area»: «il gesto non e' sincronizzato
                 col gol»] LA CLIP DEVE STARE NELLA SUA FINESTRA. Il 7.245 aveva scoperto il difetto sul
                 tackle (2,71s in una finestra da 1,7s) e l'aveva corretto A MANO, solo li'. La stessa misura
                 ripetuta su tutte le clip dice che erano troncate anche le altre: volley 2,75s in 0,55s =
                 20% (SOLO il caricamento, il colpo non arrivava mai), header 1,88s in 0,75s = 40%, penalty
                 1,50s in 0,70s = 47%. Invece di altri tre numeri a mano, la scala si RICAVA: durata della
                 clip diviso finestra del gesto, cosi' una clip nuova non puo' piu' nascere troncata in
                 silenzio. Restano espliciti i due casi in cui la scelta NON e' «mostrala tutta»: tackle
                 (1,75, collaudato) e ricezione (3,2: si vuole il solo TRAP dentro il beat, non 4,96s). */
              const _wT56=(_a._isGk&&_a.proc===oppMesh&&oppMesh&&oppMesh._diveDur&&!(typeof window!=='undefined'&&window.__CPM_NO512))?oppMesh._diveDur:gwOf(actType,"clip");/* [7.512.0 R2 — LA CLIP DEL PORTIERE SUONA SUL SUO TUFFO: audit 111/112] `_wT56` leggeva actType (variabile dell'EROE) e veniva applicata a TUTTI gli avatar: anim-gk-dive girava alla velocita' del tiro dell'eroe, non alla durata del tuffo calcolata dal 7.465. Ora il portiere che sta reagendo scala la clip su `_diveDur` — lo stesso orologio dell'estensione procedurale. __CPM_NO512 = rosso (clip di nuovo sull'orologio dell'eroe). Le altre famiglie leggono la tabella unica. */
              const _cd56=(function(){try{const c=_a._gAct.getClip();return c&&c.duration?c.duration:0;}catch(_e){return 0;}})();
              const _fit56=(_cd56>_wT56+0.02)?Math.min(_cd56/_wT56,6):1;
              /* [7.384.0 collaudo PO «le esultanze non funzionano»] UNA CLIP DI GIOIA NON E' UN GESTO
                 TECNICO. La scala temporale si ricava dalla FINESTRA del gesto in corso (7.356), e durante
                 l'esultanza `actType` viene azzerato a ogni fotogramma: la finestra vale percio' 0,55s, la
                 durata standard di un tocco. Applicata alla clip di gioia — 2,75s, la stessa dell'alzata del
                 trofeo — produce una scala 5,0x: misurata esattamente cosi' su cinque esultanze su sei col
                 nuovo guardiano celebration-visible-test.mjs. Il giocatore non vedeva «braccia al cielo»
                 tenute per due secondi: vedeva una rimessa laterale completa (carica, lancio, braccia giu')
                 ripetuta a velocita' quintupla e ri-armata a ogni fine clip. Sui gol piu' comuni, dove le
                 esultanze disponibili hanno come unico altro canale un saltello, questo E' «non si vede
                 niente». L'esultanza e la cerimonia condividono la stessa clip e la stessa esigenza: suonarla
                 alla sua velocita' e tenerla all'apice. */
              const _cel84=(_want==='lift'&&(sr.current._cerLift===1||sr.current._celLift371===1));
              _a._celTs84=(_cel84?1:(_want==='tackle'?1.75:_want==='receive'?3.2:_fit56));/* [7.384.0] la scala DECISA, conservata per la misura */
              _a._gAct.setEffectiveTimeScale(_a._celTs84);/* [7.251.0] receive 4.96s → a 3.2× il TRAP iniziale vive nel beat di ricezione (0.55s) *//* [7.245.0 batch PO «non si vede il gesto tecnico finale»] MISURATO: anim-tackle dura 2.71s ma la vita del gesto (actType) è 1.7s — la clip veniva TRONCATA prima/durante la fase a terra (con la vecchia finestra 0.6s se ne vedeva solo il 22% = il passo di caricamento). A 1.75× la scivolata COMPLETA (caduta+terra+recupero) vive dentro la finestra e il verdetto arriva a gesto leggibile. Le altre clip restano a velocità naturale (kick 0.54s ci sta già) */
              if(_a._gPrev===_a._gAct){_a._gPrev=null;_a._gPw=0;}}// retrigger dello stesso action: niente conflitto di pesi
            else if(!_want&&_a._gName){
              if(_a._tgt517!=null&&typeof window!=='undefined'&&window.__CPM_AIM517!==undefined){try{const _e5=((_a._tgt517-_a.root.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;window.__CPM_AIM517.push({ai:_ai,err:+Math.abs(_e5).toFixed(2)});}catch(_e){}}/* [7.517.0] errore di facing AL RILASCIO, misurato in entrambi i bracci */
              _a._gName=null;_a._aim517=null;_a._tgt517=null;}
            // [7.49.0 BL-06] attack/release ASIMMETRICI: ingresso rapido (il calcio parte subito, τ≈0.1s), rilascio
            //   morbido (τ≈0.22s) — clampWhenFinished tiene la posa finale estrema e il ritorno secco era uno snap.
            const _gTgt=_a._gName?1:0;_a._gw+=(_gTgt-_a._gw)*Math.min(dt*(_gTgt>_a._gw?10:4.5),1);
            if(_a._gAct)_a._gAct.weight=_a._gw;
            /* [7.678.0 — IPOTESI PROVATA E REVOCATA, e con lei una lezione sullo strumento.
               Col metro del 7.677 il residuo del 113 sembrava tutto nel CROSSFADE fra due parate
               («dive + block»): ho reso il fade quattro volte piu' rapido per il solo portiere e la
               mediana e' scesa a 9. Sembrava fatta. Poi la prova del rosso: SENZA il rimedio la stessa
               build misura 10. Nove contro dieci: nessun guadagno. E il numero che conta di piu' e' un
               altro — la stessa build che ieri dava mediana 16 oggi ne da' 10, quindi la varianza
               residua della sonda vale ancora quanto l'effetto che cerco di misurare. Riga tolta, e
               prima di attaccare di nuovo il 113 va stretta la sonda, non il codice. */
            if(_a._gPrev){_a._gPw+=(0-_a._gPw)*Math.min(dt*7,1);_a._gPrev.weight=_a._gPw;if(_a._gPw<0.02){_a._gPrev.setEffectiveWeight(0);_a._gPrev=null;_a._gPw=0;}}
            if(_ai===0&&(sr.current._cerLift===1||sr.current._celLift371===1)&&_a._gName==='lift'&&_a._gAct){/* [7.384.0] il congelamento all'apice esisteva SOLO per la cerimonia: senza, la clip d'esultanza arrivava in fondo, veniva rilasciata e ri-armata al fotogramma dopo — misurato un ri-armo per esultanza anche a scala corretta. Braccia al cielo si TENGONO. */const _ld=_a._gAct.getClip().duration||1;_a._gAct.paused=true;_a._gAct.time=Math.min((_a._gAct.time||0)+aDt*1.4,_ld*0.34);}/* [7.24.1] avanza fino all'APICE della rimessa (mani sopra la testa) e CONGELA — niente lancio */
            {const _gTot=Math.min(1,_a._gw+(_a._gPw||0)),_lbW=_lb*_lb*(3-2*_lb);/* [7.49.0 BL-06] smoothstep sul blend idle↔corsa (estremi morbidi) + il totale gesto include il prev in fade → pesi sempre ≈1 */
            if(_a.run)_a.run.weight=_lbW*(1-_gTot);if(_a.idle)_a.idle.weight=(1-_lbW)*(1-_gTot);}
            if(_a.mx)_a.mx.update(aDt);
            // [7.24.2 collaudo PO «la coppa deve rimanere nelle mani anche quando corre!»] cerimonia:
            //   in B1/B3/B4 (posa congelata) CAMPIONA i quaternioni delle ossa delle braccia; nel giro di
            //   campo (B2, run normale) li RIAPPLICA dopo il mixer → gambe che corrono, braccia in alto
            //   con la coppa (che è già agganciata alle mani vere).
            if(_ai===0&&_a._armB){const _cl=sr.current._cerLift;
              if(_cl===1&&_a._gw>0.85){if(!_a._cerQ)_a._cerQ={};for(const k in _a._armB){const b=_a._armB[k];if(b)(_a._cerQ[k]=_a._cerQ[k]||new THREE.Quaternion()).copy(b.quaternion);}_a._cerQHas=true;}
              else if(_cl===2&&_a._cerQHas){for(const k in _a._armB){const b=_a._armB[k];if(b&&_a._cerQ[k])b.quaternion.copy(_a._cerQ[k]);}}
            }
            /* [7.166.0 collaudo PO «il GK non è in posizione di guardia, sembra che si riscaldi sul posto»] READY
               STANCE del portiere GLB: il 7.153.0 posava solo il modello procedurale (animOne) ma col CH38 gli arti
               sono guidati dalla clip idle («riscaldamento») → posa di GUARDIA additiva POST-MIXER (pattern wind-up):
               busto in avanti, braccia larghe e avambracci pronti; svanisce quando corre o parte il tuffo/presa
               (pesata su 1-gesto e 1-locomozione) + idle rallentata (0.35) = fermo concentrato, non nervoso. */
            if(_a._isGk){
              if(!_a._gkB){const _R=_a.root;const _gb=(n)=>_R.getObjectByName(n)||null;_a._gkB={sp:_gb('mixamorigSpine1')||_gb('mixamorigSpine'),aL:_gb('mixamorigLeftArm'),aR:_gb('mixamorigRightArm'),fL:_gb('mixamorigLeftForeArm'),fR:_gb('mixamorigRightForeArm')};}
              const _kg=(1-Math.min(1,_a._gw+(_a._gPw||0)))*(1-_lb);
              if(_kg>0.02){const _B=_a._gkB;
                if(_B.sp)_B.sp.rotation.x+=0.26*_kg;
                if(_B.aL)_B.aL.rotation.z+=0.5*_kg;
                if(_B.aR)_B.aR.rotation.z-=0.5*_kg;
                if(_B.fL)_B.fL.rotation.x-=0.55*_kg;
                if(_B.fR)_B.fR.rotation.x-=0.55*_kg;
              }
              if(_a.idle)_a.idle.timeScale=0.35;
            }
            continue;// [6.76.0 LMV-A2] il gesto rispetta il bullet-time (aDt, non dt): prima la gamba calciava a 3.5× mentre corpo+palla andavano in slow-mo
          }
          if(_a.mx){const _lbW=_lb*_lb*(3-2*_lb);if(_a.run)_a.run.weight=_lbW;if(_a.idle)_a.idle.weight=1-_lbW;_a.mx.update(aDt);}/* [7.49.0 BL-06] smoothstep anche sugli off-ball */
        }
        // 5.49.19: NUMERI DI MAGLIA sul DORSO ANIMATO — seguono l'osso della schiena (non si staccano più durante corsa/ingresso).
        const _nv=sr.current._numV||(sr.current._numV=new THREE.Vector3());
        for(let _ai=0;_ai<glbAvatars.length;_ai++){const _a=glbAvatars[_ai],_np=_a.numPlane;if(!_np)continue;
          const _yaw=_a.root.rotation.y,_fx=Math.sin(_yaw),_fz=Math.cos(_yaw);
          if(_a.spine){_a.spine.getWorldPosition(_nv);_np.position.set(_nv.x-_fx*0.15,_nv.y+0.04,_nv.z-_fz*0.15);}
          else _np.position.set(_a.root.position.x-_fx*0.15,1.3,_a.root.position.z-_fz*0.15);
          _np.rotation.set(0,_yaw+Math.PI,0);// fronte rivolto all'indietro → leggibile da dietro (la vista più comune)
        }
      }
      // Sprint 3D-H3 MT-5: bandiere — ampiezza 2.5× al gol, ritorno graduale in 2.5s
      // 3DV-8: bandiere — onde sequenziali più veloci al gol, ampiezza 2.5×
      {const _gsB=goalBurstT>=0?(goalBurstStadHome?1:-1):0;const _olaP=_olaOn?(-32+((now*_olaSpd)%1)*64):-999;/* [7.125.0] ola: fronte che spazza z da -32 a +32 */flagGroups.forEach((fg,fi)=>{const mine=_gsB===0?0:((fg._home&&_gsB>0)||(!fg._home&&_gsB<0)?1:-1);const _ex=Math.max(mine>0?_goalExcite:0,_walkExc),_fAmp=0.55+_ex*1.50,_fSpd=0.003+_ex*0.006;fg._fl.rotation.y=Math.sin(now*_fSpd+fi*0.72)*_fAmp;let _ola=0;if(_olaOn){const _dz=fg.position.z-_olaP;_ola=Math.exp(-_dz*_dz/22)*0.6;}/* onda messicana: bump gaussiano che segue il fronte */fg._fl.rotation.x=(mine<0?-0.5*_goalExcite:0)+Math.sin(now*_fSpd*0.65+fi*0.55)*(0.08+_ex*0.24)-_ola;fg.position.y=_ola*0.5;});}// 5.45.2: esultanza per LATO; item 7: tifo pre-partita su ENTRAMBI i lati · [7.125.0] +ola tier≥2
      // 3DV-TIFO: onda sciarpe sulle curve — saliscendi lento, ampiezza maggiore al gol
      {const _gsB=goalBurstT>=0?(goalBurstStadHome?1:-1):0;scarfMs.forEach((m,si)=>{const mine=_gsB===0?0:((m._home&&_gsB>0)||(!m._home&&_gsB<0)?1:-1);const _ex=Math.max(mine>0?_goalExcite:0,_walkExc),_scA=0.28+_ex*0.9,by=m._baseY||3.0;m.position.y=(mine<0?by-0.5*_goalExcite:by)+Math.sin(now*0.0026+si*0.85)*_scA;m.rotation.z=Math.sin(now*0.0017+si)*0.05;});}// 5.45.2: esultanza per LATO; item 7: tifo pre-partita · [7.124.0] onda coordinata (phase più stretta → muro che ondeggia insieme)
      // [7.124.0] TELO COREOGRAFICO — onda traveling sui vertici (drappo appeso in alto → ondeggia sul bordo basso), si accende al gol/ingresso
      if(teloMs.length){const _tw=now*0.0017;const _gsT=goalBurstT>=0?(goalBurstStadHome?1:-1):0;teloMs.forEach(m=>{const mine=_gsT===0?0:((m._home&&_gsT>0)||(!m._home&&_gsT<0)?1:-1);const ex=Math.max(mine>0?_goalExcite:0,_walkExc);const amp=0.32+ex*0.85;const pa=m.geometry.attributes.position,base=m._base;for(let vi=0;vi<pa.count;vi++){const bx=base[vi*3],byv=base[vi*3+1];const wgt=(3.5-byv)/7;/* 0 in alto (appeso) → 1 in basso (bordo libero) */pa.array[vi*3+2]=base[vi*3+2]+Math.sin(bx*0.42+_tw)*amp*wgt;}pa.needsUpdate=true;});}
      // Sprint 3D-G3: coriandoli — fisica gravità + fade
      if(confActive){for(let i=0;i<CONF_N;i++){confPos[i*3]+=confVel[i*3]*dt;confPos[i*3+1]+=confVel[i*3+1]*dt;confVel[i*3+1]-=12*dt;confPos[i*3+2]+=confVel[i*3+2]*dt;}
        confMat.opacity*=(1-dt*1.4);confGeo.attributes.position.needsUpdate=true;
        if(confMat.opacity<0.02){confActive=false;confMat.opacity=0;}}
      // 5.49.23: fuochi d'artificio della cerimonia — esplosione radiale + gravità leggera + fade
      if(fwActive){fwT+=dt;for(let i=0;i<FW_N;i++){fwPos[i*3]+=fwVel[i*3]*dt;fwPos[i*3+1]+=fwVel[i*3+1]*dt;fwVel[i*3+1]-=5.5*dt;fwPos[i*3+2]+=fwVel[i*3+2]*dt;}
        fwGeo.attributes.position.needsUpdate=true;fwMat.opacity=Math.max(0,1-fwT/1.3);
        if(fwMat.opacity<=0.01){fwActive=false;fwMat.opacity=0;}}

      /* [7.478.0] LETTURA DEL VARCO, a valle di OGNI scrittura del pallone del fotogramma. Si registra solo
         il salto (>=6u, la stessa soglia con cui il 7.471 ha giudicato la camera), con la sua ETICHETTA e
         con lo stato dello stacco nero: un teletrasporto dentro il nero e' regia, fuori dal nero e' il
         difetto che il PO rivede nel taccuino. Solo strumenti accesi: in produzione il varco resta nullo. */
      /* [7.480.0 — «non si vede il gesto tecnico», da impressione a NUMERO] QUANTO E' GRANDE L'EROE NEL
         QUADRO. Due revisori indipendenti sono arrivati alla stessa riga nello stesso giorno: il modello
         di vista su gi0 («camera troppo lontana per apprezzare un uno-contro-uno») e la lettura dei
         fogli-provini («in 16 fotogrammi su 16 il gesto non e' leggibile»). Ma «lontana» non si corregge:
         si corregge un numero. Qui si proietta l'eroe dai piedi alla testa nello spazio NORMALIZZATO
         della camera e si tiene la sua ALTEZZA APPARENTE come frazione dell'altezza del quadro. E' una
         grandezza adimensionale — non dipende da risoluzione, fps o dispositivo — quindi headless e
         telefono dicono lo stesso numero, ed e' confrontabile fra tutte le 191 scene. Solo strumenti
         accesi: due proiezioni per fotogramma, zero allocazioni (vettori riusati). */
      if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST)&&hero&&hero.visible&&isHL){try{
        const _F=(sr.current._fr480||(sr.current._fr480={a:new THREE.Vector3(),b:new THREE.Vector3()}));
        _F.a.set(hero.position.x,hero.position.y,hero.position.z).project(camera);/* piedi */
        _F.b.set(hero.position.x,hero.position.y+1.75,hero.position.z).project(camera);/* testa: statura del rig */
        const _h480=Math.abs(_F.b.y-_F.a.y)/2;/* NDC va da -1 a +1 → /2 = frazione dell'altezza del quadro */
        const _dentro=Math.abs(_F.a.x)<=1&&Math.abs(_F.a.y)<=1&&_F.a.z<1;
        const _g=(window.__CPM_FRAME480=window.__CPM_FRAME480||{n:0,min:9,max:0,fuori:0,ultimo:0});
        _g.n++;_g.ultimo=+_h480.toFixed(4);if(_h480<_g.min)_g.min=+_h480.toFixed(4);if(_h480>_g.max)_g.max=+_h480.toFixed(4);
        if(!_dentro)_g.fuori++;
        _g.fase=P.matchPhase||null;
      }catch(_e480){}}
      /* [7.561.0 missione — IL PALLONE ESCE DALL'INQUADRATURA, E IN CRONACA NESSUNO LO RIPORTA DENTRO]
         Collaudo PO del 24 agosto: «il pallone spesso esce fuori dalla scena, la telecamera non segue
         l'azione. Le giocate offensive avversarie sono nascoste dalla curva e tribuna». La rete che tiene
         il soggetto nel quadro (`_out6`, r.~5984) e' gated su `isHL`: negli highlight gira, in CRONACA no —
         e in cronaca la camera larga sta SEMPRE dietro la nostra porta (wPx ~ -51..-38), quindi quando
         l'avversario attacca la nostra area l'azione finisce sotto il bordo basso del quadro. Qui si conta,
         separando le due meta' del campo: senza questo numero «segue l'azione» resta un'impressione. */
      /* [7.571.0 — LA TRACCIA DEL PALLONE A PASSO DI MINUTO, e non a orologio da parete]
         Il giudice della cronaca dava 40/48, 36/48 e 35/48 su tre passate con gli STESSI SEMI: il gioco e'
         deterministico, i suoi numeri no. La causa e' la stessa che il 7.554 aveva trovato in `fatti-546` e
         che continuo a incontrare: la sonda campiona la traccia con un `setInterval` a 60 ms di orologio
         REALE, mentre la partita avanza a TICK. Quanti campioni cadano dentro un minuto di gioco dipende
         quindi dalla velocita' della macchina, e ogni verdetto costruito su estremi o minimi di quei
         campioni eredita quella variabilita'. Non e' rumore simmetrico: piu' campioni = estremi piu' larghi.
         Qui la traccia la scrive IL GIOCO, un campione per MINUTO DI GIOCO — l'ultimo fotogramma del minuto,
         cioe' la posizione con cui quel minuto si chiude. Il conteggio dei campioni sparisce dal giudizio, e
         con esso la sua deriva. Sola strumentazione: nessun comportamento cambia. */
      if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST)&&ball&&P.matchPhase==='playing'){try{
        const _o571=window.__CPM_OWN&&window.__CPM_OWN();
        if(_o571&&_o571.c!=null){const _T=(window.__CPM_TR571=window.__CPM_TR571||[]);
          const _u=_T[_T.length-1];
          const _l571=(_o571.i>=10?1:0);
          if(_u&&_u.c===_o571.c){_u.x=+_o571.x.toFixed(2);_u.y=+_o571.y.toFixed(2);
            if(_o571.x>_u.xmax)_u.xmax=+_o571.x.toFixed(2);if(_o571.x<_u.xmin)_u.xmin=+_o571.x.toFixed(2);
            if(_o571.y>_u.ymax)_u.ymax=+_o571.y.toFixed(2);if(_o571.y<_u.ymin)_u.ymin=+_o571.y.toFixed(2);
            if(_l571!==_u.l)_u.lmix=1;/* [7.571.0] il cambio di lato DENTRO il minuto va conservato: la prima stesura teneva solo l'ultimo proprietario e la famiglia `possesso` del giudice e' crollata da 5/5 a 0/5 — un campione per minuto non deve voler dire perdere cio' che nel minuto e' successo */
            _u.n++;}
          else if(_T.length<4000)_T.push({c:_o571.c,x0:+_o571.x.toFixed(2),y0:+_o571.y.toFixed(2),x:+_o571.x.toFixed(2),y:+_o571.y.toFixed(2),xmax:+_o571.x.toFixed(2),xmin:+_o571.x.toFixed(2),ymax:+_o571.y.toFixed(2),ymin:+_o571.y.toFixed(2),l:_l571,lmix:0,n:1});}
      }catch(_e571){}}
      if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST)&&ball&&camera&&P.matchPhase==='playing'){try{
        const _Q=(sr.current._q561||(sr.current._q561={v:new THREE.Vector3()}));
        _Q.v.set(ball.position.x,ball.position.y+0.2,ball.position.z).project(camera);
        const _dentro=Math.abs(_Q.v.x)<=1&&Math.abs(_Q.v.y)<=1&&_Q.v.z<1;
        const _nostra=(ball.position.x<0);/* la nostra porta e' a x negativo: qui attacca l'avversario */
        const _w=(window.__CPM_QUADRO561=window.__CPM_QUADRO561||{f:0,fuori:0,nostra:{f:0,fuori:0},loro:{f:0,fuori:0},sotto:0,sopra:0,lati:0,ymin:9,ymax:-9});
        _w.f++;const _b=_nostra?_w.nostra:_w.loro;_b.f++;
        if(_Q.v.y<_w.ymin)_w.ymin=+_Q.v.y.toFixed(2);if(_Q.v.y>_w.ymax)_w.ymax=+_Q.v.y.toFixed(2);
        if(!_dentro){_w.fuori++;_b.fuori++;
          if(_Q.v.y<-1)_w.sotto++;else if(_Q.v.y>1)_w.sopra++;else _w.lati++;}
      }catch(_e561){}}
      if(sr.current._bj0){const _b0=sr.current._bj0;sr.current._bj0=null;try{window.__CPM_BJN478=(window.__CPM_BJN478||0)+1;
        /* [7.497.0 F2 — OSSERVAZIONE, NON ARBITRATO] Quanti sistemi hanno scritto il pallone in QUESTO
           fotogramma. L'audit ha contato 62 righe che ne scrivono la posizione senza un arbitro; qui si
           misura quante volte piu' d'una scrive davvero nello stesso fotogramma — che e' la definizione
           operativa di conflitto — e quanti fotogrammi il pallone si muove senza che NESSUNO si sia
           dichiarato. Nessun comportamento cambia: si conta soltanto. L'arbitro vero arriva dopo, con
           questo numero in mano. */
        /* PROVA DEL ROSSO `__CPM_NO497`: spegne il conteggio. ⚠️ Il primo tentativo usava `__CPM_REC` come
           interruttore ed e' FALLITO contando 2762 fotogrammi «a strumenti spenti»: l'armamento del varco
           accetta anche `_CPM_TEST`, e l'harness apre sempre con `?cpmtest=1`. Un interruttore che non
           spegne non prova nulla — ne serviva uno suo, esplicito. */
        if(!(typeof window!=='undefined'&&window.__CPM_NO497)){
        const _nW=(_b0.srcs?_b0.srcs.length:0);
        const _w=(window.__CPM_OWN497=window.__CPM_OWN497||{f:0,dich:0,multi:0,mosso:0,anon:0,coppie:{}});
        _w.f++; if(_nW>0)_w.dich++;
        if(_nW>1){_w.multi++;const _k=_b0.srcs.slice(0,3).join('+');_w.coppie[_k]=(_w.coppie[_k]||0)+1;}
        const _mv=Math.hypot(ball.position.x-_b0.x,ball.position.z-_b0.z);
        if(_mv>0.05){_w.mosso++; if(_nW===0)_w.anon++;}
        /* [7.555.0 MISSIONE — IL CENSIMENTO SEPARA LE FASI. Il numero aggregato non serviva a niente: la
           cronaca e gli highlight hanno scrittori diversi e problemi diversi, e sommarli nascondeva
           entrambi. E' la stessa lezione della sonda dei compagni, che misurava i giocatori mentre
           camminavano fuori scena perche' non distingueva il transito dalla scena. */
        {const _ph=((propsRef.current&&propsRef.current.matchPhase)||'?');
         const _pf=(_w.perFase=_w.perFase||{});const _b=(_pf[_ph]=_pf[_ph]||{f:0,mosso:0,anon:0,multi:0});
         _b.f++; if(_nW>1)_b.multi++; if(_mv>0.05){_b.mosso++; if(_nW===0)_b.anon++;}}
        }
        }catch(_e){}/* [7.478.0] fotogrammi VISTI dal varco: «zero salti» non vale niente se il varco non ha guardato (la trappola del censimento che leggeva una chiave inesistente) */
        const _dBJ=Math.hypot(ball.position.x-_b0.x,ball.position.z-_b0.z);
        /* la soglia si abbassa da fuori (`__CPM_BJMIN`): «zero salti» vale come misura solo se si e' prima
           provato che il varco VEDE il pallone. La lezione e' del censimento stesso, che leggeva una chiave
           inesistente e restituiva zero — un verde che non voleva dire niente. */
        if(_dBJ>=((typeof window!=='undefined'&&+window.__CPM_BJMIN)||6)){try{const _aBJ=(window.__CPM_BJ478=window.__CPM_BJ478||[]);
          if(_aBJ.length<300){const _nBJ=performance.now();
            _aBJ.push({d:+_dBJ.toFixed(1),src:_b0.src||'continuo',n:(_b0.srcs?_b0.srcs.length:0),tutti:(_b0.srcs&&_b0.srcs.length>1)?_b0.srcs.slice(0,4).join('+'):null,ph:P.matchPhase||null,sk:(P.hlSitKey!=null?+P.hlSitKey:null),
              mask:((_nBJ-Math.max(_CUT471.at,(sr.current._cutAt471||-1e9)))<Math.max(300,_CUT471.dur||0))});}}catch(_eBJ){}}}
      renderer.render(scene,camera);
    };
    loop();

    const onR=()=>{const w=mount.clientWidth||W,h=mount.clientHeight||H;if(w<2||h<2)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
    window.addEventListener('resize',onR);
    // 5.70.1 — osserva il RIDIMENSIONAMENTO del CONTENITORE (non solo window.resize): quando il layout si
    //   assesta e il mount passa da 0 alla sua altezza reale (es. avvio provino), il canvas si adatta subito →
    //   niente più fascia nera in basso (il canvas non resta bloccato sulla dimensione-fallback iniziale).
    let _ro=null;try{_ro=new ResizeObserver(()=>onR());_ro.observe(mount);}catch(_e){}

    return()=>{
      window.removeEventListener('resize',onR);
      try{if(_ro)_ro.disconnect();}catch(_e){}
      cancelAnimationFrame(sr.current.raf);
      // [5.75.0 BUG-4] dispose PROFONDO a fine partita: texture canvas (folla 2048×512/tabellone/bandiere),
      //   materiali e geometrie procedurali venivano ricreati ad ogni match senza rilasciare i precedenti.
      //   Le geometrie dei GLB (skinned, condivise con la cache _glbCache) NON si toccano; le texture disposte
      //   condivise vengono ri-caricate automaticamente da three al prossimo uso (pattern standard, sicuro).
      try{scene.traverse(o=>{
        try{if(o.geometry&&!o.isSkinnedMesh)o.geometry.dispose();}catch(_e){}
        const _ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
        _ms.forEach(m=>{try{Object.keys(m).forEach(k=>{const v=m[k];if(v&&v.isTexture){try{v.dispose();}catch(_e){}}});m.dispose();}catch(_e){}});
      });}catch(_e){}
      try{renderer.forceContextLoss();}catch(e){}try{renderer.dispose();}catch(e){}// 5.69.3: rilascia il contesto WebGL della partita a fine match → non si accumula tra una partita e l'altra
      if(typeof window!=='undefined')window.__CPM_MATCH_ACTIVE=false;// 5.69.3: fine partita → i ritratti possono di nuovo renderizzare
      if(mount.contains(renderer.domElement))mount.removeChild(renderer.domElement);
    };
  },[]);// eslint-disable-line

  // Sprint 3D-1: il walkout cinematico resta gestito dall'overlay React WalkoutOverlay
  // (nessuna chiamata onWalkoutDone qui per evitare doppia transizione di fase).

  return(
    <div style={isDesktop
      ?{position:"relative",width:"100%",height:"100%",background:"#050810",borderRadius:"0 0 12px 12px",overflow:"hidden"}
      :{position:"absolute",inset:0,background:"#050810",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
      <div ref={mountRef} style={{width:"100%",height:"100%"}}/>
      {replayOn&&<React.Fragment>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"10%",background:"#000",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"10%",background:"#000",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"12%",left:"5%",color:"#fff",fontWeight:800,fontSize:"13px",letterSpacing:"1px",textShadow:"0 1px 4px #000",pointerEvents:"none",display:"flex",alignItems:"center",gap:"5px"}}><span style={{color:"#ff4444"}}>⏺</span> REPLAY</div>
      </React.Fragment>}
      {/* ATE-3: etichetta azione — overlay breve sincronizzata con arco palla */}
      {actionLabel&&<div style={{position:"absolute",bottom:"16%",left:"50%",transform:"translateX(-50%)",
        background:"rgba(0,0,0,0.62)",color:ATE3_ARCCOL[bgAction?.type]||"#fff",
        padding:"3px 13px",borderRadius:18,fontSize:10,fontWeight:800,letterSpacing:"1.8px",
        pointerEvents:"none",border:"1px solid rgba(255,255,255,0.12)",whiteSpace:"nowrap",
        textShadow:"0 1px 3px #000"}}>{actionLabel}</div>}
    </div>
  );
}


