/* ========================================================================
 * KORWARD ELITE — frammento n° 04  (dei 21, numerati da 00 a 20)
 * src/04-situazioni-zone-piazzati.jsx
 *
 * SITUATIONS · ZONE · PIAZZATI · TELECRONACA
 *
 * Il cuore dichiarativo del Live Match: i costruttori S() e A(), la tabella SITUATIONS
 * (originale r.2854), la mappa ZONES (r.3305), i piazzati SP_PEN / SP_FK_NEAR /
 * SP_FK_FAR, i TELECRONISTI e COMMENTO_TECNICO.
 * ⚠ tests/situations-3d-validation.js estrae blocchi da QUI ancorandosi alle righe
 * del file generato: l’identità byte per byte è ciò che lo tiene in piedi.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 2753-3500   ·   748 righe di 41427
 * La prima riga dopo questa intestazione è la riga 2753 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 2727 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
const S=(text,zones,mz,sz,actions,lock=false,mm=-1,intro="",type="off",ctx=null,tactic=null)=>{
  const z0=zones[0];
  const inferredMM=mm>=0?mm:z0==="area"?2:z0==="bordo"?2:3;
  const obj={text,zones,moveZone:mz,startZone:sz,actions,lockMovement:lock,maxMoves:lock?0:inferredMM,intro,type,ctx,tactic};
  obj.intent=(typeof deriveIntent==="function")?deriveIntent(obj,null):null; // ENGINE Step 1: ogni situation nasce con la sua INTENZIONE (sorgente unica)
  obj.ballState=(typeof deriveBallState==="function")?deriveBallState(obj):null; // CINE-DECOUPLE: congela lo stato palla (no parsing testo a runtime)
  obj.cine=(typeof deriveSitCine==="function")?deriveSitCine(obj):null; // CINE-DECOUPLE: congela i segnali cinematici
  obj.chainOn=/cross|traversone|corner|angolo|punizione|rimessa|cross in area|dal fondo|in mezzo/i.test(text||"")?"aerial":null; // [6.3.2 R1a] catena su assist CONGELATA come campo (la regex vive solo qui, mai piu a runtime)
  obj.gkOutSit=(/portiere esce|portiere in uscita|portiere uscito|davanti al portiere|scavalc\w* il portiere|dribbling portiere/i.test(text||"")||!!(obj.cine&&obj.cine.oneOnOne))||null;/* [7.249.0] +«portiere uscito»/«dribbling portiere» (gi66) *//* [7.248.0 gi52 «Non si vede il portiere che esce»] la scena che DICHIARA l'uscita del portiere la deve mostrare: flag strutturale congelato in factory (patto chainOn) → il 3D piazza il GK avversario FUORI dalla linea per tutto l'highlight */
  /* [7.238.0 batch PO gi44 «Non c'è intervento del portiere!»] le azioni difensive «Chiama/Avvisa il portiere»
     promettono un'USCITA DEL PORTIERE: flag strutturale CONGELATO in factory (stesso patto di chainOn — la
     regex sul testo vive solo qui, mai a runtime) → su successo il 3D consegna la palla al portiere di casa
     col gesto di presa, non una spazzata anonima dell'eroe. */
  if(type==="def")actions.forEach(a=>{if(a&&/portiere/i.test(a.label||""))a.gkCall=true;});
  /* [7.999.38 collaudo PO, taccuino SIT #150 «Guadagna una punizione!»: «nel dribbling il pallone e l'eroe si separano», codici 009
     direzione sbagliata e 000 gesto scoordinato] L'azione che PROMETTE il fallo subito («Dribbling provocatorio — il fallo c'e'!»)
     ha premio `assist`: il gioco la rendeva come un passaggio a un compagno (regole 7.784/7.798) e il pallone andava indietro a un
     compagno e tornava, mentre il fallo non si vedeva mai. Il flag si congela qui, come gkCall: la regex vive solo in factory. */
  if(type!=="def")actions.forEach(a=>{if(a&&/il fallo c'è|provocator|guadagna\w* (il |la |un |una )?(fallo|punizione)|cerca\w* il fallo|si lascia cadere/i.test(a.label||""))a.falloCercato=true;});
  /* [7.245.0 batch PO gi36 «Guida i compagni» RIUSCITO «Non c'è alcuna parata»] su palla AEREA avversaria,
     l'azione di ORGANIZZAZIONE (guida/organizza) che promette una PARATA (rew save) si risolve col portiere
     che esce in presa — l'eroe comanda, il portiere agisce. Stesso patto di chainOn/gkCall: regex solo qui. */
  if(type==="def")actions.forEach(a=>{if(a&&!a.gkCall&&a.rew==="save"&&/guida|organizza/i.test(a.label||"")&&(obj.ballState==="aerial"||/corner|cross|angolo/i.test(text||"")))a.gkCall=true;});
  /* [7.242.0 batch PO gi34 «Non si vede il gesto tecnico specifico»] OGNI azione difensiva deriva
     `tackle/-` senza variante: il gesto era UNO (scivolata) per tutto — pressing, anticipo, muro.
     Tre famiglie STRUTTURALI congelate in factory (stesso patto di chainOn/gkCall: la regex vive
     solo qui): slide (scivolata/disperato) · lunge (intercetto/anticipo/deviazione/muro/corpo) ·
     press (pressing/finta/copertura/rientro). Il 3D dà a ciascuna la sua posa. */
  if(type==="def")actions.forEach(a=>{if(!a||a.defGesto)return;const _l=a.label||"";
    if(/scivolat|disperat/i.test(_l))a.defGesto="slide";
    /* [7.467.0 collaudo PO #137 «Si e' tuffato, poco realistico» su «⚡ Tackle in corsa preciso»] UN
       TACKLE IN CORSA NON E' UNA SCIVOLATA — lo dice l'etichetta. Quella label non incrocia nessuna
       delle tre regex (non c'e' «scivolat», non c'e' «intercett/anticip/...», e «preciso» non e'
       «press»), quindi cadeva sul default a valle, che e' la clip `tackle`: una scivolata a terra. E'
       la stessa classe chiusa dal 7.361 per le chiamate e gli stacchi — un gruppo che il
       classificatore non prevedeva. `lunge` e' la famiglia giusta: gamba tesa a portare via il
       pallone mentre si corre, che e' quello che l'etichetta promette. La regola sta DOPO quella
       della scivolata, cosi' una «scivolata in corsa» resta una scivolata. */
    else if(/in corsa|in allungo|di puntone|in scatto/i.test(_l)&&!/stacc|testa|incorn|aere|volo/i.test(_l))a.defGesto="lunge";/* la guardia sugli AEREI non e' cosmetica: «✈️ Stacco in corsa potente» sarebbe finito in `lunge`, cioe' una gamba tesa al posto di un colpo di testa — la regressione gemella di quella che si sta correggendo */
    else if(/intercett|anticip|devia|blocc|corpo|muro|spalla/i.test(_l))a.defGesto="lunge";
    else if(/press|finta|recuper|sprint|rientro|posizion|organizza|guida|copertura|copri|contrasto|linea/i.test(_l))a.defGesto="press";
    /* [7.361.0 collaudo PO #136 «non prova a deviare», #138 «azione difensiva indefinita»] 21 AZIONI
       DIFENSIVE SU 90 NON AVEVANO FAMIGLIA, e chi non ce l'ha cade sul default a valle: la clip `tackle`,
       cioe' una SCIVOLATA A TERRA. Fra queste c'era gi136 k2 «📣 Chiama il portiere» — una CHIAMATA che a
       schermo diventava un tuffo: e' letteralmente la nota del PO. Gli scoperti erano tre gruppi che il
       classificatore non prevedeva affatto: le chiamate (8), gli stacchi di testa (4) e le letture di
       posizione (4), piu' cinque duelli di contatto con parole nuove.
       Questo quarto passaggio gira SOLO su chi e' rimasto senza famiglia, quindi le tre regex sopra restano
       byte-identiche e le 69 azioni gia' classificate non si spostano di un millimetro: si copre il buco,
       non si ridisegna la mappa. Due famiglie nuove — `call` (nessuna clip: si RESTA in corsa e si indica,
       perche' chiamare il portiere non e' un gesto tecnico) e `aerial` (clip di testa: uno stacco aereo
       chiuso con una scivolata era il caso piu' assurdo dei 21). L'ultimo ripiego e' `press`, cioe'
       locomozione: chiudere sul portatore e' sempre piu' vero di un tuffo a caso. */
    if(!a.defGesto){
      if(/chiam|avvis|comunic|📣/i.test(_l))a.defGesto="call";
      else if(/stacco|di testa|aere/i.test(_l))a.defGesto="aerial";
      else if(/tackle|scivolat|fallo (tattico|intelligente)|duro/i.test(_l))a.defGesto="slide";
      else if(/gettati|traiettoria/i.test(_l))a.defGesto="lunge";
      else a.defGesto="press";
    }});/* [7.244.0] +copri/linea: «Copri la linea» (gi31 k2) non aveva famiglia → cadeva nel gesto generico */
  // 5.72.0 — OFF-BALL: situazione offensiva in cui l'EROE è SENZA palla (si smarca/taglia/inserisce per RICEVERE).
  //   Rilevata dalle azioni (movimento-a-ricevere prevalente sulle azioni con palla) e SOLO con palla a terra.
  //   Congelata come campo (sorgente unica per gioco + gate): serve a piazzare la palla su un COMPAGNO invece che
  //   sui piedi dell'eroe → il prompt "Smarcati per ricevere" combacia con ciò che si vede.
  /* [7.194.0 S1 · direttiva PO «ogni highlight deve sembrare un'azione televisiva»] DOV'È LA PALLA PRIMA DELL'AZIONE.
     Fino al 7.193 la palla veniva INCOLLATA ai piedi dell'eroe in ogni highlight offensivo (unica deroga: offBall):
     sul prompt «Corner! Attacca il secondo palo» si vedeva l'eroe fermo in area col pallone a terra sui piedi e
     nessuno alla bandierina. Ora la situation dichiara DOVE nasce la palla e chi la mette in gioco:
       hero   = ai piedi dell'eroe (conduzione, tiro, punizione battuta da lui)
       mate   = su un compagno più arretrato (l'eroe si smarca per ricevere)
       corner = sulla bandierina del calcio d'angolo, battuta da un compagno
       throw  = sulla linea laterale (rimessa)
       gk     = sui piedi del proprio portiere (rinvio/costruzione dal basso)
       opp    = sull'avversario portatore (azione difensiva)
     Campo BAKATO alla costruzione (come chainOn/ballState): a runtime nessun parsing del testo. */
  obj.ballAt=(function(){
    if(type==="def")return "opp";
    const t=String(text||"");
    if(/\bcorner\b|calcio d.angolo|dalla bandierina/i.test(t))return "corner";
    if(/rimessa laterale|fallo laterale|rimessa dalla linea/i.test(t))return "throw";
    if(/rinvio|rilancio del portiere|il portiere rilancia|costruzione dal basso|dal portiere/i.test(t))return "gk";
    /* ⚠️ LE CONSEGNE AEREE (cross dalla fascia, inserimento su lancio) RESTANO PER ORA SUI PIEDI DELL'EROE.
       Portarle sul crossatore è corretto e già scritto (bastava restituire "wing"/"mate" qui), ma il Live Match
       Validator ha misurato che la macchina d'esito a valle non regge la distanza in più: il pallone parte 16-20u
       più indietro e un gol può chiudersi con la palla ancora a metà strada (controprova sugli stessi seed: 8/8
       PASS prima, 7/1 dopo). Il difetto NON è la posizione di partenza, è che manca un ARCO DI CONSEGNA distinto
       dall'arco di conclusione: la palla oggi può fare un solo volo per highlight. Si sblocca nella slice sulla
       fisica del pallone (durata ∝ distanza + consegna e conclusione come due archi in sequenza). */
    return null;/* null = deciso a runtime dall'euristica offBall (compagno) o eroe */
  })();
  obj.offBall=(function(){
    if(type==="def"||obj.ballState!=="feet")return false;
    const _OFF=/smarcat|taglio|inseri|\boffr|scatto per|attacca lo spazio|ricever|chiedi palla|dai .*soluzion|libera(ti)? per/i;
    const _ON=/tir[oaie]|conclu|dribbl|finta|cross|traverson|passaggi|filtrant|imbucat|pallonett|cucchiaio|rovesciat|punizion|rigore|lancio|servi|scarico|va al|porta palla|conduc/i;
    const a=actions||[];if(!a.length)return false;
    const off=a.filter(x=>_OFF.test(x.label||"")).length,on=a.filter(x=>_ON.test(x.label||"")).length;
    return off>on&&off>=Math.ceil(a.length/2);
  })();
  /* [7.351.0] congela «e' una RICEZIONE». Va per ULTIMO, e la posizione e' il fix: messo accanto a
     ballState leggeva `ballAt`/`offBall` prima che esistessero (li scrivono i due blocchi qui sopra), le
     sue esclusioni non scattavano e 4 situations a nascita gia' dichiarata — corner, rimessa, rinvio —
     finivano classificate ricezioni. Misurato: 41 ricezioni aeree invece delle 37 reali. */
  obj.recv=(typeof deriveReception==="function")?deriveReception(obj):null;
  /* [7.999.97 PO-086 passo 2] la scheda e ogni azione DICHIARANO i gesti promessi che il 3D non ha ancora (campo `richiede`,
     congelato qui come chainOn: la regex sul testo vive solo in factory). Sorgente: GESTI_PROMESSI, sotto. */
  obj.richiede=richiedeDi(text+" "+(intro||""));
  actions.forEach(a=>{if(!a)return;let rq=richiedeDi(a.label||"");if(a.gkCall)rq=rq.filter(k=>k!=="comando");if(a.defGesto==="call"&&!a.gkCall&&rq.indexOf("comando")<0)rq.push("comando");a.richiede=rq;});
  return obj;
};
/* [7.999.97 PO-086 «nessuna scena deve promettere un gesto che il 3D non mostra» — passi 2-3 del piano in
   tests/character-lab/SCENE_DISEGNABILI.md] GESTI_PROMESSI: le parole che promettono un gesto SENZA clip (le voci «n» del
   censimento `censimento-scene.mjs`). GESTI_COLLEGATI: chiave → clip montata davvero sul corpo. Una scheda il cui testo promette
   un gesto non collegato, o con meno di due azioni disegnabili, e' SOSPESA dalla pesca; un'azione non disegnabile sparisce
   dalle opzioni (se ne restano almeno due). RIATTIVAZIONE AUTOMATICA: quando una clip arriva basta scriverla in
   GESTI_COLLEGATI (o, a runtime, in window.__CPM_GESTI_COLLEGATI) e scheda e azione tornano da sole — nessun elenco di schede
   da mantenere. La sospensione agisce sulla PESCA e sulle OPZIONI: SITUATIONS resta intatto (il gate le forza per indice e
   un salvataggio a meta' partita conserva le sue). Rosso __CPM_NO_RICHIEDE. Guardiano `scene-disegnabili`. */
const GESTI_PROMESSI=[
  ['hocus_pocus',/hocus|pocus/i],
  ['elastico',/elastic|flip.?flap/i],
  ['tunnel',/tunnel|in mezzo alle gambe|fra le gambe|tra le gambe/i],
  ['sombrero',/sombrero|scavalc\w* (il|l')?(difensor|avversari|marcat)|sopra la testa/i],
  ['rabona',/rabona/i],
  ['tacco',/\btacc(o|hetto)\b|colpo di tacco/i],
  ['petto',/di petto|stop di petto|controllo di petto|col petto/i],
  ['coscia',/di coscia/i],
  ['velo',/\bvelo\b|lascia scorrere|finta di (ricevere|calciare) e lascia/i],
  ['comando',/organizza la difesa|guida i compagni|chiama il compagno|chiamo il compagno|urla|comunic|comand|dirig|sistema la difesa|copri la linea|linea alta|tieni la linea|allineati/i],
];
const GESTI_COLLEGATI={};
function richiedeDi(t){const out=[];for(const [k,re] of GESTI_PROMESSI)if(re.test(t||""))out.push(k);return out;}
function gestoCollegato(k){if(GESTI_COLLEGATI[k])return true;try{const w=typeof window!=='undefined'&&window.__CPM_GESTI_COLLEGATI;return !!(w&&w[k]);}catch(_e){return false;}}
function _noRichiede(){return typeof window!=='undefined'&&!!window.__CPM_NO_RICHIEDE;}
function azioneDisegnabile(a){if(!a||_noRichiede())return true;return (a.richiede||[]).every(gestoCollegato);}
function sitSospesa(sit){if(!sit||_noRichiede())return false;if((sit.richiede||[]).some(k=>!gestoCollegato(k)))return true;
  const acts=sit.actions||[];if(acts.length<2)return false;return acts.filter(azioneDisegnabile).length<2;}
function soloDisegnabili(actions){if(!actions||!actions.length||_noRichiede())return actions;const g=actions.filter(azioneDisegnabile);return (g.length>=2||g.length===actions.length)?g:actions;}
const A=(label,stat,bon,rew,fail,nrg)=>({label,stat,bon,rew,fail,nrg});
const SITUATIONS=[
/* === AREA — CONCLUSIONI === */
S("⚡ Solo davanti al portiere!",["area"],{x:[80,98],y:[25,75]},{x:[82,92],y:[30,70]},[
  A("🦵 Tiro angolato","tiro",10,"goal","miss_easy",16),A("🎯 Piazzato basso","tecnica",4,"goal","miss",12),A("🤸 Pallonetto","tecnica",-8,"goal","miss_easy",10)],false,1,"⚡ Sei solo! Decidi in frazione di secondo.","off",null,
  {pressure:"high",support:0,nearby_def:1,lanes:["central_run"],box:{att:1,def:1,near:false,far:false},bs:"feet",cn:{oneOnOne:true}}),
S("🤸 Rovesciata spettacolare!",["area"],{x:[76,94],y:[22,78]},{x:[78,88],y:[28,72]},[
  A("🤸 Rovesciata!","tecnica",-6,"goal","miss",22),A("✈️ Stacco di testa","fisico",3,"goal","miss",15),A("🦵 Tiro di prima","tiro",2,"goal","miss",12)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("⚡ Tap-in! Porta quasi vuota.",["area"],{x:[84,98],y:[28,72]},{x:[86,94],y:[33,67]},[
  A("🦵 Spingila dentro!","tiro",18,"goal","miss_easy",8),A("🎯 Precisione","tecnica",12,"goal","miss",8),A("🦶 Deviazione di prima","fisico",8,"goal","miss",10)],false,-1,"","off",null,{pressure:"high",support:0,nearby_def:1,lanes:["central_run"],cn:{tapIn:true}}),
S("🌀 Con palla in area — un difensore tra te e la porta!",["area"],{x:[80,97],y:[20,80]},{x:[82,90],y:[26,74]},[
  A("🦵 Tiro a giro","tiro",8,"goal","miss",14),A("🌀 Dribbling portiere e tiro","tecnica",3,"goal","miss_easy",18),A("🎯 Assist retropassaggio","passaggio",5,"assist","intercept",10)],false,-1,"","off",null,{pressure:"high",support:0,nearby_def:1,lanes:["central_run"]}),
S("🎯 Deviazione ravvicinata!",["area"],{x:[78,96],y:[25,75]},{x:[80,90],y:[30,70]},[
  A("🦵 Deviazione istintiva","tecnica",5,"goal","miss",12),A("🦶 Deviazione di piede","fisico",3,"goal","miss",12),A("🌀 Prima intenzione","tiro",0,"goal","miss",14)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:1,lanes:["central_run"],cn:{tapIn:true}}),
S("🔴 RIGORE! Sul dischetto.",["area"],{x:[88,89],y:[48,52]},{x:[88,89],y:[49,51]},[
  A("💥 Angolato rasoterra","tiro",10,"goal","miss",10),A("🎯 Cucchiaio","tecnica",-4,"goal","miss_easy",8),A("⚡ Centro-alto","tiro",5,"goal","miss",10)],true,0,"🤫 Il silenzio dello stadio è assordante. Tutto fermo. Solo tu e il portiere.",`off`,null,{pressure:"none",support:0,nearby_def:0,lanes:[]}),

/* === AREA — SET PIECES === */
S("🏳️ Corner! Attacca il secondo palo.",["area"],{x:[76,96],y:[20,80]},{x:[78,88],y:[30,70]},[
  A("✈️ Stacco di testa","fisico",5,"goal","miss",16),A("🦵 Tiro al volo","tiro",-4,"goal","miss",14),A("🤝 Sponda per compagno","passaggio",5,"assist","nothing",7)],false,-1,"","off",null,{pressure:"high",support:3,nearby_def:3,lanes:[],cn:{fpCross:true,fpHeader:true}}),
S("✈️ Cross in area! Attacca il pallone.",["area"],{x:[74,96],y:[18,82]},{x:[76,86],y:[28,72]},[
  A("✈️ Colpo di testa","fisico",5,"goal","miss",15),A("🦵 Tiro di prima","tiro",-2,"goal","miss",13),A("🤸 Deviazione di prima","tecnica",-8,"goal","miss",10)],false,-1,"","off",null,{pressure:"high",support:2,nearby_def:3,lanes:[]}),

/* === BORDO AREA — TIRI === */
S("💥 Tiro dal limite!",["bordo","area"],{x:[70,88],y:[22,78]},{x:[72,82],y:[28,72]},[
  A("💥 Tiro di potenza","tiro",-5,"goal","miss",14),A("🎯 Piazzato angolato","tecnica",3,"goal","miss",12),A("🏃 Avanza in area","velocità",3,"goal","intercept",16)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["central_run"]}),
S("⚽ Tiro al volo dal limite!",["bordo"],{x:[68,86],y:[22,78]},{x:[70,82],y:[28,72]},[
  A("⚽ Volée potente","tiro",-6,"goal","miss",16),A("🎯 Mezza volée","tecnica",-2,"goal","miss",14),A("🦵 Controllo e tiro","tecnica",4,"goal","miss",12)],false,-1,"","off",null,{pressure:"medium",support:0,nearby_def:1,lanes:["central_run"],bs:"aerial"}),
S("🎯 Pallonetto su portiere in uscita!",["bordo","area"],{x:[72,90],y:[25,75]},{x:[74,84],y:[30,70]},[
  A("🎯 Pallonetto preciso","tecnica",3,"goal","miss",10),A("💥 Tiro di potenza","tiro",-2,"goal","miss",14),A("🌀 Dribbling portiere e tiro","tecnica",-3,"goal","miss_easy",18)],false,-1,"","off",null,{pressure:"high",support:0,nearby_def:1,lanes:["central_run"],cn:{oneOnOne:true}}),
S("💥 Conclusione di collo pieno!",["bordo","area"],{x:[68,88],y:[22,78]},{x:[70,82],y:[28,72]},[
  A("💥 Collo pieno!","tiro",5,"goal","miss",15),A("🎯 Interno precisione","tecnica",2,"goal","miss",13),A("🌀 Finta e tiro","tecnica",0,"goal","miss",16)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["central_run"]}),
S("🦵 Tiro con l'esterno del piede!",["bordo","area"],{x:[70,90],y:[20,80]},{x:[72,84],y:[26,74]},[
  A("🦵 Esterno a giro","tiro",3,"goal","miss",13),A("🎯 Rientra e tira","tecnica",5,"goal","miss",14),A("🤸 Colpo d'esterno","tiro",-3,"goal","miss",12)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["central_run"]}),

/* === SET PIECES CENTRALI === */
/* [7.684.0 collaudo PO su SIT #15: «Punizione da oltre meta' campo»] LE PUNIZIONI SI BATTEVANO
   TROPPO LONTANO. Censito con `punizioni-683`: «dal limite — tiro diretto» apriva col pallone a gx 66,
   cioe' TRENTAQUATTRO unita' dalla porta, quando il limite dell'area sta a 84; «dalla fascia» a 37-38.
   Per confronto, le due che leggono bene stanno a 17-20 («posizione defilata», «guadagna una
   punizione»). Non era un difetto del piazzamento — quello onora la zona dichiarata, verificato
   confrontando bersaglio logico e mesh — erano i DATI a mandare la palla a meta' campo.
   Le nuove distanze sono quelle del calcio: tiro diretto a 20-24 unita' (una ventina di metri), fascia
   a 26-30, indiretta al limite dell'area a 19-23, punizione a effetto a 24-28. Il muro a 9 metri (gi81,
   27 u) era gia' giusto e non si tocca.
   ⚠️ Cambiando la zona di partenza cambia la FIRMA GOLDEN di queste scene: la baseline va rigenerata,
   e il diff dev'essere limitato a loro — se tocca altro, la rigenerazione sta mascherando una
   regressione, ed e' esattamente il rischio di aggiornare un golden. */
S("📐 Punizione dal limite — tiro diretto!",["trequarti","bordo"],{x:[76,82],y:[46,54]},{x:[77,80],y:[48,52]},[
  A("🎯 Punizione a giro","tiro",8,"goal","miss",10),A("💥 Tiro rasoterra","tiro",4,"goal","miss",10),A("↗️ Palla in area","passaggio",5,"assist","miss",8)],true,-1,"","off",null,{pressure:"none",support:1,nearby_def:0,lanes:[]}),
S("📐 Punizione dalla fascia sinistra!",["trequarti"],{x:[70,75],y:[8,14]},{x:[71,74],y:[9,12]},[
  A("↗️ Cross basso teso","passaggio",6,"assist","intercept",8),A("↗️ Cross alto","passaggio",4,"assist","miss",8),A("🌀 Giocata corta","tecnica",3,"assist","nothing",6)],true,-1,"","off",null,{pressure:"none",support:2,nearby_def:0,lanes:["overlap_left"]}),
S("📐 Punizione dalla fascia destra!",["trequarti"],{x:[70,75],y:[86,92]},{x:[71,74],y:[87,91]},[
  A("↗️ Cross basso teso","passaggio",6,"assist","intercept",8),A("↗️ Cross alto","passaggio",4,"assist","miss",8),A("🌀 Giocata corta","tecnica",3,"assist","nothing",6)],true,-1,"","off",null,{pressure:"none",support:2,nearby_def:0,lanes:["overlap_right"]}),

/* === CROSS E FASCE === */
S("⚡ Cross dalla fascia sinistra!",["bordo","trequarti"],{x:[62,88],y:[3,28]},{x:[64,80],y:[5,22]},[
  A("↗️ Cross teso","passaggio",6,"assist","intercept",10),A("↗️ Cross a rientrare","tecnica",4,"assist","miss",10),A("🦵 Tiro a giro","tiro",3,"goal","miss",13)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:["overlap_left"],box:{att:2,def:1,near:true,far:false}}),
S("⚡ Cross dalla fascia destra!",["bordo","trequarti"],{x:[62,88],y:[72,97]},{x:[64,80],y:[78,93]},[
  A("↗️ Cross teso","passaggio",6,"assist","intercept",10),A("↗️ Cross a rientrare","tecnica",4,"assist","miss",10),A("🦵 Tiro a giro","tiro",3,"goal","miss",13)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:["overlap_right"],box:{att:2,def:1,near:false,far:true}}),

/* === DRIBBLING E 1v1 === */
S("🌀 Dribbling! Terzino sul lato sinistro.",["trequarti","bordo"],{x:[55,86],y:[3,32]},{x:[58,76],y:[5,26]},[
  A("🌀 Dribbling netto e assist","tecnica",5,"assist","nothing",16),A("⚡ Sterzata e assist","velocità",3,"assist","nothing",14),A("💥 Tiro a giro","tiro",3,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_left"]}),
S("🌀 Dribbling! Terzino sul lato destro.",["trequarti","bordo"],{x:[55,86],y:[68,97]},{x:[58,76],y:[74,92]},[
  A("🌀 Dribbling netto e assist","tecnica",5,"assist","nothing",16),A("⚡ Sterzata e assist","velocità",3,"assist","nothing",14),A("💥 Tiro a giro","tiro",3,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_right"]}),
S("🤼 Duello fisico! Liberati.",["bordo","area"],{x:[65,92],y:[20,80]},{x:[68,84],y:[28,72]},[
  A("🌀 Dribbling netto e tiro","tecnica",5,"goal","nothing",16),A("⚡ Scatto e tiro","velocità",4,"goal","nothing",14),A("↩️ Dai e vai","passaggio",3,"assist","intercept",10)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[]}),
S("⚡ Doppio dribbling in velocità!",["bordo","area"],{x:[68,92],y:[20,80]},{x:[70,84],y:[26,74]},[
  A("⚡ Doppio passo esplosivo e tiro","velocità",7,"goal","intercept",22),A("🌀 Finta e tiro","tecnica",3,"goal","miss",18),A("🎯 Assist a sorpresa","passaggio",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:0,nearby_def:2,lanes:[]}),

/* === TREQUARTI — GIOCATE OFFENSIVE === */
S("🏃 Contropiede! Campo aperto.",["trequarti","bordo"],{x:[50,92],y:[20,80]},{x:[52,65],y:[30,70]},[
  A("⚡ Sprint e tiro","velocità",4,"goal","miss",22),A("🎯 Assist filtrante","passaggio",5,"assist","intercept",10),A("🌀 Dribbling GK e tiro","tecnica",-3,"goal","miss",16)],false,-1,"","off",null,{pressure:"none",support:1,nearby_def:0,lanes:["central_run","through_ball_lane"]}),
S("⚡ Scatto in profondità!",["trequarti"],{x:[52,84],y:[20,80]},{x:[54,68],y:[28,72]},[
  A("⚡ Scatto e tiro","velocità",5,"goal","intercept",20),A("🎯 Filtrante per compagno","passaggio",6,"assist","intercept",10),A("🌀 Dribbling difensore e tiro","tecnica",3,"goal","intercept",16)],false,-1,"","off",null,{pressure:"low",support:1,nearby_def:0,lanes:["through_ball_lane","central_run"],cn:{fpCross:true,fpHeader:true}}),
S("🧠 Ricezione tra le linee!",["trequarti","bordo"],{x:[55,82],y:[20,80]},{x:[58,74],y:[28,72]},[
  A("🎯 Assist filtrante","passaggio",8,"assist","intercept",10),A("⚡ Accelera verso porta","velocità",3,"goal","intercept",18),A("💥 Tiro dal limite","tiro",-8,"goal","miss",14)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["through_ball_lane"]}),
S("🎯 Filtrante per il centravanti!",["trequarti","bordo"],{x:[55,82],y:[20,80]},{x:[58,74],y:[28,72]},[
  A("🎯 Filtrante millimetrico","passaggio",10,"assist","intercept",10),A("↩️ Dai e vai","tecnica",5,"assist","intercept",12),A("💥 Tiro dal limite","tiro",-6,"goal","miss",14)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:["through_ball_lane"]}),
S("💫 Appoggio di prima per il compagno! Giocata geniale.",["area","bordo"],{x:[72,92],y:[25,75]},{x:[74,84],y:[30,70]},[
  A("💫 Appoggio di prima preciso","tecnica",-3,"assist","intercept",10),A("🦵 Tiro di prima","tiro",2,"goal","miss",12),A("🔄 Doppio passo e tiro","tecnica",4,"goal","nothing",16)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:["central_run"]}),
S("🎯 Triangolazione perfetta!",["trequarti","bordo"],{x:[55,84],y:[20,80]},{x:[58,74],y:[28,72]},[
  A("🎯 Triangolo e tiro","tecnica",6,"goal","intercept",14),A("↩️ Dai e vai","passaggio",7,"assist","intercept",10),A("💥 Tiro di prima","tiro",2,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:3,nearby_def:1,lanes:["central_run","through_ball_lane"]}),

/* === CENTROCAMPO === */
S("🎮 Palla a centrocampo. Costruisci.",["centro","trequarti"],{x:[35,65],y:[20,80]},{x:[38,58],y:[28,72]},[
  A("⚡ Verticale","passaggio",3,"assist","intercept",8),A("🔄 Scarico sulla fascia","passaggio",5,"assist","intercept",6),A("🏃 Avanza e servi il taglio","velocità",2,"assist","intercept",15)],false,-1,"","off",null,{pressure:"none",support:4,nearby_def:0,lanes:["central_run","through_ball_lane","overlap_left","overlap_right"],bs:"feet",it:"progression"}),// 5.43.0: it="progression" — "Costruisci" da centrocampo è progressione, non cross (le lanes di sovrapposizione facevano cadere deriveIntent su "cross")
S("⚡ Palla contesa a centrocampo — pressa e riconquista!",["difesa","centro"],{x:[18,60],y:[20,80]},{x:[22,42],y:[28,72]},[
  A("🏃 Lancia il contropiede","velocità",6,"assist","intercept",20),A("🎯 Lancio lungo","passaggio",4,"assist","intercept",10),A("🌀 Riconquista e conserva","tecnica",2,"recovery","intercept",16)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["central_run","through_ball_lane"]}),
S("🌀 Sfida 1v1 a centrocampo!",["centro","trequarti"],{x:[35,68],y:[22,78]},{x:[38,58],y:[28,72]},[
  A("🌀 Dribbling centrale e conduci","tecnica",5,"recovery","intercept",14),A("⚡ Scatto e servi il compagno","velocità",4,"assist","intercept",16),A("↩️ Triangolo","passaggio",5,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
/* === DIFESA — INTERCETTI E TACKLE === */
S("🛡️ Avversario porta palla — sfida in scivolata!",["difesa","centro"],{x:[20,55],y:[15,85]},{x:[25,45],y:[30,70]},[
  A("🛡️ Scivolata netta","fisico",6,"recovery","foul",16),A("✋ Intercetta di piede","tecnica",4,"recovery","through",12),A("📣 Copri la linea","velocità",2,"recovery","through",8)],false,2,"⚠️ L'avversario punta la porta! Sei l'ultimo ostacolo prima della difesa.","def",null,{pressure:"high",support:1,nearby_def:1,lanes:[]}),
S("✋ Anticipa il passaggio filtrante!",["centro","difesa"],{x:[25,58],y:[20,80]},{x:[30,50],y:[32,68]},[
  A("✋ Anticipo di posizione","tecnica",7,"recovery","through",10),A("🏃 Sprint di copertura","velocità",5,"recovery","through",14),A("💪 Contrasto fisico","fisico",3,"recovery","foul",12)],false,2,"👁️ Vedi il passaggio prima che parta. Anticipalo!","def",null,{pressure:"high",support:2,nearby_def:1,lanes:[]}),
S("🧱 Muro in area! Blocca il tiro.",["propria","difesa"],{x:[5,25],y:[25,75]},{x:[8,20],y:[35,65]},[
  A("🧱 Blocca con il corpo","fisico",8,"save","goal_against",14),A("✋ Devia col piede","tecnica",5,"save","goal_against",12),A("📣 Chiama il portiere","tecnica",2,"save","goal_against",6)],false,1,"💥 Tiro in arrivo! Buttati sulla traiettoria!","def",null,{pressure:"high",support:0,nearby_def:2,lanes:[]}),
S("🏃 Pressing alto! Ostacola la costruzione.",["trequarti","centro"],{x:[45,72],y:[20,80]},{x:[50,65],y:[30,70]},[
  A("🏃 Pressing aggressivo","velocità",6,"recovery","through",18),A("✋ Intercetta il retropassaggio","tecnica",4,"recovery","through",12),A("🌀 Finta e recupera palla","tecnica",3,"recovery","through",10)],false,2,"😤 Il portiere ha palla! Pressa, costringilo all'errore!","def",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),/* [6.43.0] COLLAUDO PO «gol subito assegnato all'eroe»: la 3ª azione di questa situazione DIFENSIVA (type:def) premiava un ASSIST all'eroe (rew:"assist",fail:"nothing") → un highlight difensivo faceva scattare score.home+1 + esultanza LATO-CASA (la "rete assegnata alla squadra dell'eroe con festeggiamento sbagliato"). Riportata a un esito difensivo coerente con le altre due (recovery/through): pressando il portiere RECUPERI palla, niente gol-eroe fasullo. Unica anomalia su 179 situazioni (audit def-credit-audit.mjs). */
S("⚡ Contropiede avversario! Torna in difesa.",["centro","difesa"],{x:[15,50],y:[20,80]},{x:[20,40],y:[30,70]},[
  A("⚡ Sprint di rientro","velocità",8,"recovery","through",22),A("🛡️ Posizione preventiva","fisico",5,"recovery","through",14),A("📣 Organizza la difesa","tecnica",3,"recovery","through",8)],false,3,"🚨 Contropiede! Tre avversari puntano la porta, rientra!","def",null,{pressure:"high",support:0,nearby_def:3,lanes:[]}),
S("💪 Duello aereo su corner avversario!",["propria","difesa"],{x:[5,22],y:[25,75]},{x:[8,18],y:[35,65]},[
  A("✈️ Stacco di testa","fisico",7,"save","goal_against",16),A("🤼 Contrasto fisico","fisico",4,"save","goal_against",12),A("📣 Guida i compagni","tecnica",5,"save","goal_against",8)],false,1,"🏳️ Corner avversario! Attacca il pallone in area!","def",null,{pressure:"high",support:2,nearby_def:3,lanes:[],bs:"aerial"}),
/* === SCHEMA — INSERIMENTI E COMBINAZIONI === */
S("📐 Schema! Inserimento da centrocampo in area.",["trequarti","bordo"],{x:[38,88],y:[28,72]},{x:[40,52],y:[38,62]},[
  A("⚡ Taglio in profondità e rimorchio","velocità",8,"assist","intercept",22),A("🎯 Taglio sul secondo palo e sponda","tecnica",6,"assist","miss",18),A("↩️ Dai e vai corto","passaggio",5,"assist","intercept",10)],false,4,"📐 Schema di movimento! Parti da centrocampo e taglia verso l'area in diagonale.","off",null,{pressure:"low",support:3,nearby_def:0,lanes:["central_run"]}),
S("🔄 Dai e vai! Schema rapido in trequarti.",["trequarti","bordo"],{x:[55,85],y:[22,78]},{x:[58,68],y:[32,68]},[
  A("↩️ Dai e vai preciso","passaggio",8,"assist","intercept",12),A("⚡ Accelera in profondità","velocità",6,"goal","intercept",18),A("🎯 Tiro di prima","tiro",-2,"goal","miss",14)],false,3,"🔄 Dai e vai! Scarica e rilanciati immediatamente nello spazio.","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["central_run","through_ball_lane"]}),
S("⚡ Corsa di inserimento sul cross!",["trequarti","bordo"],{x:[55,90],y:[18,82]},{x:[58,68],y:[25,40]},[
  A("📐 Sponda per il rimorchio","fisico",7,"assist","intercept",16),A("🦵 Tiro di prima","tiro",4,"goal","miss",14),A("🌀 Controllo e tiro","tecnica",3,"goal","miss",12)],false,4,"🏃 Il cross sta per arrivare! Inserisciti con i tempi giusti per attaccare il pallone.","off",null,{pressure:"medium",support:2,nearby_def:2,lanes:["overlap_left","overlap_right"]}),
S("🌀 Difensore di fronte — come lo superi?",["bordo","area"],{x:[72,95],y:[20,80]},{x:[75,88],y:[30,70]},[
  A("🌀 Dribbling stretto e tiro","dribbling",12,"goal","loose",22),A("⚡ Finta, scatto e tiro","velocità",8,"goal","intercept",16),A("🔙 Retropassaggio sicuro","passaggio",2,"assist","intercept",8)],false,2,"🌀 Hai il difensore di fronte. Prova il dribbling stretto per saltarlo!","special",null,{pressure:"high",support:0,nearby_def:1,lanes:[]}),
S("🔄 Il cross arriva alto — tentazione assoluta in area!",["area"],{x:[84,97],y:[25,75]},{x:[85,94],y:[35,65]},[
  A("🔄 Rovesciata spettacolare","fisico",14,"goal","miss",22),A("🦵 Colpo di testa normale","fisico",4,"goal","miss",14),A("🔙 Controllo e appoggio","tecnica",1,"assist","intercept",6)],true,0,"🔄 Il cross arriva alto. Tenti la rovesciata? Alta difficoltà, massima gloria!","special",null,{pressure:"high",support:2,nearby_def:3,lanes:[]}),
S("🦶 Fascia chiusa — cross difficile, angolo stretto!",["trequarti","bordo"],{x:[60,85],y:[10,30]},{x:[65,78],y:[15,40]},[
  A("🦶 Cross d'esterno","passaggio",10,"assist","miss",18),A("⚡ Cross normale","passaggio",3,"assist","intercept",10),A("🎯 Tiro a giro","tiro",5,"goal","miss",14)],false,3,"🦶 Hai spazio sulla fascia. Tenti il cross d'esterno per sorprendere la difesa?","special",null,{pressure:"medium",support:0,nearby_def:2,lanes:["overlap_left"]}),

/* === NUOVE SITUATIONS SPRINT 27 === */
/* Tiro da 30 metri */
S("💥 Tiro da 30 metri! Nessuno si aspetta questa scelta.",["trequarti","centro"],{x:[55,72],y:[25,75]},{x:[68,76],y:[30,70]},[/* [7.751.0 collaudo PO «tiri da distanza siderale»: la partenza sta a portata del testo (30 m ≈ x 71) */
  A("💥 Botta col collo pieno","tiro",-12,"goal","miss",16),A("🎯 Destro rasoterra","tiro",-8,"goal","miss",14),A("🔄 Serve in area","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"none",support:2,nearby_def:0,lanes:["central_run"]}),
/* Colpo di testa difensivo */
S("✈️ Cross avversario in area! Allontana!",["propria","difesa"],{x:[8,24],y:[20,80]},{x:[10,20],y:[30,70]},[
  A("✈️ Stacco di testa deciso","fisico",8,"save","goal_against",16),A("🛡️ Chiudi di spalla","fisico",4,"save","goal_against",12),A("📣 Chiama il portiere","tecnica",2,"save","goal_against",6)],false,1,"✈️ Cross pericoloso in area! Allontana con la testa!","def",null,{pressure:"high",support:1,nearby_def:3,lanes:[],bs:"aerial"}),
/* Salvataggio sulla linea */
S("🧱 Tiro avversario in arrivo sulla linea! Intervieni.",["propria"],{x:[2,10],y:[30,70]},{x:[3,8],y:[38,62]},[
  A("🧱 Corpo sulla traiettoria","fisico",12,"save","goal_against",20),A("✋ Devia col piede","tecnica",8,"save","goal_against",16),A("😱 Tentativo disperato","fisico",3,"save","goal_against",12)],false,0,"🚨 Il pallone sta per entrare! Sei l'ultimo uomo!","def",null,{pressure:"high",support:0,nearby_def:2,lanes:[]}),
/* Inserimento del terzino in sovrapposizione */
S("⚡ Sovrapposizione! Il terzino è lanciato in fascia.",["trequarti","bordo"],{x:[58,88],y:[5,20]},{x:[62,78],y:[5,15]},[
  A("↗️ Cross al centro","passaggio",8,"assist","intercept",12),A("⚡ Taglio verso l'area","velocità",5,"goal","intercept",18),A("↩️ Appoggio corto","passaggio",3,"assist","nothing",6)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:["overlap_left"],bs:"feet"}),
/* Contropiede 2v1 */
S("🚀 Contropiede 2 contro 1! Supera il difensore!",["trequarti","bordo"],{x:[52,88],y:[25,75]},{x:[55,68],y:[35,65]},[
  A("🎯 Assist al compagno","passaggio",10,"assist","intercept",10),A("⚡ Scatta e tira","velocità",6,"goal","intercept",20),A("🌀 Finta e tiro","tecnica",4,"goal","miss",16)],false,-1,"","off",null,{pressure:"none",support:1,nearby_def:1,lanes:["central_run","through_ball_lane"]}),
/* Tap-in da rimbalzo */
S("🔄 Rimbalzo in area! Arrivaci per primo.",["area"],{x:[82,97],y:[22,78]},{x:[84,93],y:[28,72]},[
  A("🦵 Spinta di prima","tiro",14,"goal","miss_easy",10),A("✈️ Di testa","fisico",8,"goal","miss",12),A("🌀 Controllo e tiro","tecnica",4,"goal","miss",14)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:["central_run"]}),
/* Cross basso teso */
S("↘️ Cross basso teso! Devia verso la porta.",["area","bordo"],{x:[74,94],y:[15,35]},{x:[76,86],y:[18,28]},[
  A("🦵 Deviazione al volo","tecnica",6,"goal","miss",14),A("↗️ Sponda per compagno","passaggio",5,"assist","intercept",8),A("💥 Tiro potente","tiro",2,"goal","miss",13)],false,-1,"","off",null,{pressure:"high",support:2,nearby_def:2,lanes:["central_run"]}),
/* Schema da calcio d'angolo — corto */
S("📐 Schema corto da corner! Sorpresa tattica.",["trequarti","bordo"],{x:[58,86],y:[85,97]},{x:[60,74],y:[86,95]},[
  A("🎯 Triangolo e cross","passaggio",7,"assist","intercept",10),A("💥 Tiro a giro","tiro",4,"goal","miss",14),A("🌀 Dribbling e cross","tecnica",5,"assist","nothing",12)],false,3,"📐 Schema! Angolo corto — sorprendi la difesa con il triangolo.","off",null,{pressure:"low",support:2,nearby_def:1,lanes:["overlap_right"]}),
/* Punizione indiretta in area */
S("📐 Punizione indiretta a 5 metri dall'area!",["trequarti"],{x:[77,82],y:[44,56]},{x:[78,81],y:[46,54]},[
  A("↗️ In area per l'incornata del compagno","passaggio",8,"assist","intercept",8),A("💥 Bordata sotto la barriera","tiro",6,"goal","miss",12),A("🌀 Giocata corta","tecnica",5,"assist","nothing",6)],true,-1,"","off",null,{pressure:"none",support:2,nearby_def:0,lanes:[]}),// 5.43.5: label chiarita — l'eroe BATTE la punizione in area, è il COMPAGNO a incornare (prima "per il colpo di testa" sembrava l'eroe a giocare di testa su palla ferma)
/* Uscita alta portiere avversario */
S("✈️ Lancio lungo! Il portiere esce. Attacca la palla!",["area","bordo"],{x:[74,96],y:[30,70]},{x:[76,86],y:[35,65]},[
  A("✈️ Colpo di testa sulla porta","fisico",6,"goal","miss",14),A("🌀 Scavalco il portiere","tecnica",3,"goal","miss_easy",18),A("🎯 Pallone al compagno","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:1,lanes:[],bs:"aerial"}),
/* Palo e tap-in */
S("💥 Tiro sul palo — la palla rimbalza in area!",["area"],{x:[83,98],y:[28,72]},{x:[85,95],y:[33,67]},[
  A("🦵 Prima intenzione!","tiro",16,"goal","miss_easy",10),A("✈️ Di testa al volo","fisico",10,"goal","miss",12),A("🤝 Sponda per compagno","passaggio",6,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:["central_run"],bs:"aerial"}),
/* Pressing alto — recupero in trequarti avversaria */
S("🏃 Pressing alto in trequarti — portatore avversario sotto pressione!",["trequarti"],{x:[55,72],y:[20,80]},{x:[58,68],y:[28,72]},[
  A("🏃 Pressing aggressivo","velocità",8,"recovery","through",20),A("✋ Intercetta il retropassaggio","tecnica",5,"recovery","through",14),A("📣 Copri le linee di passaggio","mentalità",4,"recovery","through",10)],false,2,"😤 Il portiere avversario ha palla! Pressa immediatamente!","def",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
/* Colpo di testa su punizione laterale */
S("✈️ Cross teso dalla fascia — attacca il palo lontano!",["area"],{x:[76,96],y:[18,28]},{x:[78,88],y:[22,26]},[
  A("✈️ Stacco sul palo lontano","fisico",7,"goal","miss",16),A("🦵 Mezza rovesciata","tecnica",-4,"goal","miss",20),A("🤝 Sponda indietro","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:2,nearby_def:3,lanes:[],cn:{fpCross:true,fpHeader:true}}),
/* Lancio lungo per lo scatto */
S("🎯 Lancio lungo millimetrico! Scatta in profondità.",["trequarti","centro"],{x:[40,72],y:[25,75]},{x:[42,58],y:[30,70]},[
  A("⚡ Scatto perfetto e tiro","velocità",8,"goal","intercept",22),A("🎯 Controlla e tira","tecnica",5,"goal","intercept",16),A("↩️ Rimanda al mittente","passaggio",2,"assist","intercept",8)],false,-1,"","off",null,{pressure:"low",support:1,nearby_def:0,lanes:["through_ball_lane","central_run"],bs:"aerial",cn:{fpCross:true,fpHeader:true}}),
/* Duello in velocità sulla fascia */
S("⚡ Velocità contro posizione — 1 vs 1 sulla fascia!",["bordo","trequarti"],{x:[60,88],y:[3,22]},{x:[62,76],y:[5,18]},[
  A("⚡ Spunto e assist","velocità",8,"assist","intercept",20),A("🌀 Dribbling di tecnica e assist","tecnica",5,"assist","nothing",16),A("💥 Tiro cross teso","tiro",3,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_left"],bs:"feet"}),
/* Rigore nel finale */
S("🔴 RIGORE! Sul dischetto a 5' dalla fine. Respira. Tira.",["area"],{x:[84,90],y:[44,56]},{x:[86,89],y:[47,53]},[
  A("💥 Angolo basso — potenza","tiro",12,"goal","miss_easy",10),A("🌀 Cucchiaio — glaciale","tecnica",2,"goal","miss_easy",20),A("⚡ Incrociato rasoterra","velocità",6,"goal","miss",14)],true,0,"⏱ Cinque minuti alla fine. Il rigore che vale tutto. Respira.","off",null,{pressure:"none",support:0,nearby_def:0,lanes:[],minClock:80}),// [5.79.0 SIT-5] «a 5' dalla fine» può uscire SOLO nel finale
/* Rimonta — sotto di due gol */
S("🔙 Sotto nel punteggio. L'attacco cerca il gol della speranza.",["trequarti","bordo"],{x:[55,80],y:[25,75]},{x:[58,72],y:[30,70]},[
  A("🔥 Prendo in mano la squadra","mentalità",8,"goal","through",18),A("⚡ Scatto in verticale e tiro","velocità",6,"goal","intercept",16),A("🎯 Lancio smarcante","passaggio",5,"assist","intercept",12)],false,-1,"","off","losing",{pressure:"low",support:2,nearby_def:1,lanes:[]}),
/* Doppia marcatura */
S("👥 Doppia marcatura! Due difensori ti raddoppiano.",["trequarti"],{x:[55,70],y:[20,80]},{x:[58,68],y:[28,72]},[
  A("🌀 Li salto e servo il compagno libero","tecnica",10,"assist","intercept",18),A("↩️ Dai e ricevi — smarca il compagno","passaggio",7,"assist","intercept",14),A("⚡ Scatto diagonale — esci dal raddoppio","velocità",5,"recovery","intercept",16)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[]}),

/* === SPRINT 55 — 100+ NUOVE SITUAZIONI === */

/* AREA — VARIAZIONI AVANZATE */
S("🤝 Sponda e rimorchio in area!",["area"],{x:[82,97],y:[25,75]},{x:[84,94],y:[30,70]},[
  A("🤝 Sponda corta e tira","tecnica",6,"goal","miss",14),A("🦵 Prima intenzione","tiro",4,"goal","miss_easy",12),A("↩️ Retropassaggio al limite","passaggio",3,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:2,nearby_def:2,lanes:["central_run"]}),
S("💨 Prima intenzione su cross basso!",["area"],{x:[80,97],y:[22,78]},{x:[82,92],y:[28,72]},[
  A("💥 Tiro di prima potente","tiro",6,"goal","miss",16),A("🎯 Deviazione controllata","tecnica",4,"goal","miss",13),A("🤝 Sponda al compagno","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[]}),
S("🎯 Tiro ad incrociare sul palo lontano!",["bordo","area"],{x:[75,95],y:[20,45]},{x:[78,88],y:[25,40]},[
  A("🎯 Incrociato sul palo lontano","tiro",8,"goal","miss",14),A("🌀 Finta e interno piede","tecnica",5,"goal","miss",13),A("↗️ Cross basso sul secondo palo","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["overlap_left"],bs:"feet",cn:{fpCross:true,fpHeader:true}}),
S("✈️ Colpo di testa potente da centro area!",["area"],{x:[78,96],y:[28,72]},{x:[80,90],y:[33,67]},[
  A("✈️ Testa potente angolato","fisico",8,"goal","miss",16),A("🎯 Testa preciso al centro","fisico",4,"goal","miss",13),A("🌀 Colpo di testa smorzato per compagno","tecnica",2,"assist","intercept",11)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:3,lanes:["central_run"]}),
S("🛑 Controllo e tiro fulmineo!",["area","bordo"],{x:[76,95],y:[22,78]},{x:[78,88],y:[28,72]},[
  A("🛑 Stop e tiro netto","tecnica",7,"goal","miss",14),A("💥 Volée immediata","tiro",4,"goal","miss",13),A("↩️ Controllo e serve il compagno","passaggio",3,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("↘️ Portiere uscito sul lato — il secondo palo è libero!",["area"],{x:[84,98],y:[20,40]},{x:[86,96],y:[22,36]},[
  A("↘️ Tocco sotto morbido","passaggio",8,"assist","intercept",10),A("🦵 Tiro a porta semiaperta","tiro",5,"goal","miss",13),A("🌀 Dribbling portiere e appoggia","tecnica",3,"assist","miss_easy",16)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[],bs:"feet",cn:{fpCross:true,fpHeader:true}}),
S("🦶 Tiro col mancino a sorpresa!",["bordo","area"],{x:[73,94],y:[22,78]},{x:[76,86],y:[28,72]},[
  A("🦶 Mancino angolato","tiro",5,"goal","miss",14),A("🌀 Finta e mancino","tecnica",3,"goal","miss",13),A("↗️ Cross col mancino","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["overlap_right"],bs:"feet"}),
S("⚡ Sforbiciata acrobatica!",["area"],{x:[78,96],y:[22,78]},{x:[80,90],y:[28,72]},[
  A("⚡ Sforbiciata al volo","fisico",-3,"goal","miss",22),A("🦵 Tiro di collo","tiro",4,"goal","miss",14),A("🎯 Controllo e tira","tecnica",6,"goal","miss",12)],false,-1,"","off",null,{pressure:"high",support:0,nearby_def:3,lanes:[],bs:"aerial"}),
S("🔄 Spalle alla porta in area — come ti giri?",["area"],{x:[82,97],y:[25,75]},{x:[84,93],y:[30,70]},[
  A("🔄 Deviazione di prima in porta","tecnica",-5,"goal","miss_easy",22),A("🔙 Retropassaggio all'accorrente","passaggio",3,"assist","intercept",10),A("🌀 Giratone e tiro","tecnica",0,"goal","miss",14)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:["central_run"]}),
S("🦵 Cucchiaio in area!",["area","bordo"],{x:[76,96],y:[25,75]},{x:[78,88],y:[30,70]},[
  A("🦵 Cucchiaio rasoterra","tecnica",-2,"goal","miss_easy",18),A("💥 Tiro diretto","tiro",4,"goal","miss",13),A("🎯 Pallonetto morbido","tecnica",0,"goal","miss",12)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[]}),
S("🌀 Finta di esterno e tiro interno!",["area","bordo"],{x:[74,95],y:[22,78]},{x:[76,86],y:[28,72]},[
  A("🌀 Finta e interno","tecnica",6,"goal","miss",15),A("🦵 Esterno subito","tiro",3,"goal","miss",13),A("↗️ Scarica per il compagno","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:[]}),
S("💥 Tiro di potenza sul palo corto!",["bordo","area"],{x:[73,94],y:[18,42]},{x:[76,86],y:[22,36]},[
  A("💥 Potenza sul palo corto","tiro",5,"goal","miss",16),A("🎯 Piazzato sul palo lontano","tecnica",4,"goal","miss",13),A("↗️ Cross sul secondo palo","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["overlap_left"],bs:"feet"}),
S("🤸 Rovesciata in corsa!",["area"],{x:[80,97],y:[25,75]},{x:[82,92],y:[30,70]},[
  A("🤸 Acrobazia istintiva in porta","tecnica",-8,"goal","miss",22),A("🦵 Tiro di collo d'istinto","tiro",2,"goal","miss",14),A("🎯 Controllo e conclude","tecnica",5,"goal","miss",13)],false,-1,"","off",null,{pressure:"high",support:0,nearby_def:3,lanes:[],bs:"aerial"}),
S("⚽ Portiere fuori posizione! L'area piccola è scoperta.",["area"],{x:[84,98],y:[28,72]},{x:[86,96],y:[33,67]},[
  A("⚽ Prima intenzione — dentro!","tiro",20,"goal","miss_easy",8),A("🎯 Piazzata angolata","tecnica",14,"goal","miss",10),A("🦶 Spinta di sicurezza","fisico",10,"goal","miss",12)],false,-1,"","off",null,{pressure:"medium",support:0,nearby_def:1,lanes:["central_run"]}),
S("😱 Il portiere lascia sfuggire la palla! Approfitta.",["area"],{x:[84,98],y:[28,72]},{x:[86,96],y:[33,67]},[
  A("🦵 Prima intenzione subito!","tiro",16,"goal","miss_easy",8),A("🎯 Tocco preciso per il gol","tecnica",12,"goal","miss",10),A("🌀 Dribbla il portiere e segna","dribbling",8,"goal","miss",14)],false,-1,"","off",null,{pressure:"medium",support:0,nearby_def:1,lanes:[]}),

/* SET PIECES — VARIAZIONI */
S("🏳️ Corner sul primo palo!",["area","bordo"],{x:[76,96],y:[75,90]},{x:[78,88],y:[76,88]},[
  A("🦵 Tiro di prima all'angolino","tiro",4,"goal","miss",16),A("🔄 Appoggio di prima verso il compagno","tecnica",-2,"assist","intercept",12),A("✈️ Stacco sul primo palo","fisico",5,"goal","miss",14)],false,-1,"","off",null,{pressure:"high",support:3,nearby_def:3,lanes:["central_run"]}),
S("⚡ Corner basso teso — devia!",["area"],{x:[78,96],y:[25,75]},{x:[80,90],y:[30,70]},[
  A("🦵 Deviazione rasoterra","tecnica",6,"goal","miss",14),A("💥 Prima intenzione potente","tiro",4,"goal","miss",13),A("🤝 Sponda per il compagno","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:2,nearby_def:3,lanes:[]}),
S("📐 Punizione a effetto — curva!",["trequarti"],{x:[72,78],y:[40,60]},{x:[73,77],y:[43,57]},[
  A("📐 Curva a rientrare","tiro",8,"goal","miss",12),A("💥 Tiro piatto rasoterra","tiro",5,"goal","miss",11),A("↗️ Palla sul secondo palo","passaggio",6,"assist","miss",8)],true,-1,"","off",null,{pressure:"none",support:2,nearby_def:0,lanes:[]}),
S("⚡ Rimessa rapida dal portiere!",["difesa","centro"],{x:[5,30],y:[30,70]},{x:[8,22],y:[38,62]},[
  A("⚡ Scatto in profondità e ultimo passaggio","velocità",7,"assist","intercept",18),A("🎯 Posizionamento smarcato","posizionamento",5,"recovery","intercept",14),A("🔄 Schema combinato rapido","passaggio",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:[]}),
S("📐 Angolo sul secondo palo!",["area"],{x:[76,96],y:[20,30]},{x:[78,88],y:[22,28]},[
  A("✈️ Taglio sul secondo palo","fisico",7,"goal","miss",16),A("💥 Tiro di prima al volo","tiro",3,"goal","miss",14),A("🤝 Sponda verso il centro dell'area","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:3,nearby_def:3,lanes:["central_run"],cn:{fpCross:true,fpHeader:true}}),
S("📐 Punizione — muro a 9 metri!",["trequarti","bordo"],{x:[68,76],y:[44,56]},{x:[70,75],y:[46,54]},[
  A("💥 Botta sopra la barriera","tiro",6,"goal","miss",13),A("↗️ Tocco per il compagno","passaggio",5,"assist","miss",8),A("🎯 Tiro a girare sul palo","tecnica",2,"goal","miss",14)],true,-1,"","off",null,{pressure:"none",support:2,nearby_def:0,lanes:[]}),
S("🏳️ Angolo corto — triangola!",["trequarti","bordo"],{x:[60,80],y:[88,97]},{x:[62,74],y:[89,96]},[
  A("🎯 Cross a rientrare","passaggio",7,"assist","intercept",10),A("💥 Tiro a giro verso il palo lontano","tiro",5,"goal","miss",14),A("🌀 Dribbling e cross in area","tecnica",4,"assist","nothing",12)],false,3,"📐 Angolo corto! Sorprendi la difesa con il triangolo.","off",null,{pressure:"low",support:2,nearby_def:1,lanes:["overlap_right"],bs:"aerial"}),
S("↗️ Ricevi la rimessa del compagno!",["trequarti"],{x:[55,78],y:[14,34]},{x:[58,70],y:[18,30]},[
  A("↗️ Cross immediato in area","passaggio",5,"assist","intercept",10),A("⚡ Scatto sul secondo palo e tiro","velocità",4,"goal","intercept",16),A("↩️ Giocata corta con triangolo","tecnica",6,"assist","nothing",12)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:["overlap_left"],bs:"feet"}),// 5.43.6: eroe RICEVENTE in campo (non più sulla linea) — la rimessa la batte un compagno; testo/posizione chiariscono che l'eroe non batte

/* CROSS — VARIAZIONI */
S("🎯 Cross a rientrare dalla destra!",["bordo","trequarti"],{x:[64,88],y:[72,97]},{x:[66,82],y:[74,95]},[
  A("🎯 Cross a rientrare perfetto","passaggio",7,"assist","miss",11),A("🦵 Tiro a giro forte sul portiere","tiro",4,"goal","miss",14),A("↗️ Cross alto sul primo palo","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["overlap_right"]}),
S("↘️ Cross rasoterra al centro!",["bordo","area"],{x:[72,94],y:[18,82]},{x:[74,86],y:[20,78]},[
  A("↘️ Rasoterra preciso al compagno","passaggio",8,"assist","intercept",10),A("💥 Tiro diretto in porta","tiro",3,"goal","miss",13),A("🤸 Deviazione acrobatica di prima","tecnica",-4,"goal","miss",16)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["overlap_left"]}),
S("✈️ Cross al secondo palo — attacca!",["area","bordo"],{x:[74,96],y:[65,90]},{x:[76,88],y:[70,88]},[
  A("✈️ Stacco sul secondo palo","fisico",7,"goal","miss",16),A("🦵 Tiro di prima al volo","tiro",4,"goal","miss",14),A("🤝 Sponda verso il centro","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:2,nearby_def:2,lanes:["central_run"],cn:{fpCross:true,fpHeader:true}}),
S("⚡ Cross di prima senza guardare!",["fascia","trequarti"],{x:[60,84],y:[2,30]},{x:[64,80],y:[5,22]},[
  A("⚡ Cross cieco di prima","passaggio",5,"assist","intercept",13),A("🎯 Cross a rientrare guardato","passaggio",7,"assist","miss",10),A("🦵 Tiro senza pensarci","tiro",-5,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["overlap_left"]}),
S("⚽ Volée su cross alzato!",["area"],{x:[78,96],y:[22,78]},{x:[80,90],y:[28,72]},[
  A("⚽ Volée di collo potente","tiro",2,"goal","miss",16),A("✈️ Colpo di testa al volo","fisico",4,"goal","miss",14),A("🎯 Controllo e tiro fermo","tecnica",6,"goal","miss",12)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[]}),
S("🌀 Cross d'esterno su cross basso!",["bordo","area"],{x:[74,94],y:[8,28]},{x:[76,86],y:[10,24]},[
  A("🌀 Esterno a rientrare","passaggio",5,"assist","intercept",11),A("💥 Tiro dall'angolo stretto","tiro",2,"goal","miss",14),A("↗️ Cross interno normale","passaggio",6,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["overlap_left"]}),
S("✈️ Testa su cross dalla trequarti!",["area","bordo"],{x:[76,96],y:[30,70]},{x:[78,88],y:[35,65]},[
  A("✈️ Testa di potenza","fisico",6,"goal","miss",16),A("🎯 Testa piazzata all'angolo","fisico",4,"goal","miss",13),A("🌀 Testa smorzata per il compagno","tecnica",2,"assist","intercept",10)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:["central_run"]}),
S("⚡ Cross dal fondo — angolo stretto!",["area"],{x:[84,98],y:[12,28]},{x:[86,96],y:[14,24]},[
  A("↗️ Cross sul primo palo","passaggio",5,"assist","intercept",12),A("🦵 Tiro da posizione impossibile","tiro",-8,"goal","miss",18),A("↘️ Rasoterra rasente il palo","passaggio",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["overlap_left"]}),

/* DRIBBLING — AVANZATO */
S("🔄 Roulette sul difensore!",["bordo","trequarti"],{x:[62,90],y:[20,80]},{x:[64,78],y:[28,72]},[
  A("🔄 Roulette e tiro","tecnica",7,"goal","intercept",20),A("⚡ Finta, scatto e tiro","velocità",5,"goal","intercept",16),A("↩️ Appoggio sicuro al compagno","passaggio",2,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🌀 Finta a rientrare in area!",["area","bordo"],{x:[75,96],y:[20,80]},{x:[78,88],y:[28,72]},[
  A("🌀 Finta a rientrare e tiro netto","dribbling",4,"goal","intercept",20),A("💥 Tiro diretto senza finte","tiro",3,"goal","miss",13),A("↗️ Cross dopo dribbling","passaggio",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["overlap_right"],bs:"feet",it:"cross"/* [7.999.95 PO-087] titolo nuovo approvato dal PO; la parola «finta» spostava l'intento a dribbling: resta cross come prima */}),
S("🦵 Step-over e via!",["bordo","trequarti"],{x:[60,88],y:[20,80]},{x:[62,76],y:[28,72]},[
  A("🦵 Step-over e scatto e tiro","velocità",6,"goal","intercept",18),A("🌀 Step-over e cross","dribbling",4,"assist","intercept",14),A("💥 Finta e tiro immediato","tiro",3,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_right"],bs:"feet"}),
S("💨 Finta di corpo e scatto!",["trequarti","bordo"],{x:[58,88],y:[20,80]},{x:[60,76],y:[28,72]},[
  A("💨 Finta rapida e scatto e tiro","velocità",6,"goal","intercept",18),A("🌀 Finta di corpo e cross","dribbling",4,"assist","intercept",14),A("🎯 Assist dopo la finta","passaggio",5,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_right"]}),
S("🏃 Dribbling sulla linea di fondo!",["area"],{x:[82,98],y:[10,25]},{x:[84,96],y:[12,22]},[
  A("↗️ Cross al centro da fondo","passaggio",6,"assist","intercept",12),A("🌀 Scarta il portiere da fondo","dribbling",-2,"goal","miss_easy",18),A("🦵 Tiro da angolo impossibile","tiro",-8,"goal","miss",14)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_left"]}),
S("🌀 Scarta il portiere in uscita!",["area","bordo"],{x:[76,96],y:[28,72]},{x:[78,88],y:[33,67]},[
  A("🌀 Scarta col dribbling e tiro","dribbling",4,"goal","miss_easy",20),A("💥 Tiro diretto sul portiere","tiro",-4,"goal","miss",12),A("↗️ Assist al compagno libero","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[],cn:{oneOnOne:true}}),
S("🌀 Dribbling stretto in area!",["area"],{x:[80,97],y:[25,75]},{x:[82,92],y:[30,70]},[
  A("🌀 Dribbling stretto e tiro netto","dribbling",8,"goal","loose",22),A("🦵 Tiro diretto più sicuro","tiro",3,"goal","miss",13),A("↩️ Retropassaggio fuori area","passaggio",2,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[]}),
S("⚡ Scatto puro — nessuno ti segue!",["trequarti","bordo"],{x:[55,88],y:[20,80]},{x:[58,72],y:[28,72]},[
  A("⚡ Scatto esplosivo in profondità e tiro","velocità",9,"goal","intercept",22),A("🎯 Controllo e conclude","tecnica",5,"goal","intercept",16),A("↗️ Cross al volo in corsa","passaggio",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"low",support:1,nearby_def:0,lanes:["overlap_right"],bs:"feet"}),
S("🔄 Finta e cross dalla fascia!",["bordo","trequarti"],{x:[60,88],y:[5,30]},{x:[62,76],y:[8,25]},[
  A("🔄 Finta e cross","dribbling",5,"assist","intercept",22),A("⚡ Finta sulla fascia e assist","velocità",4,"assist","intercept",16),A("💥 Tiro a giro sul portiere","tiro",3,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_left"],bs:"feet",it:"cross"/* [7.999.95 PO-087] titolo nuovo approvato dal PO; la parola «finta» spostava l'intento a dribbling: resta cross come prima */}),
S("🌀 Cambio di direzione a 180°!",["bordo","trequarti"],{x:[58,88],y:[20,80]},{x:[60,74],y:[28,72]},[
  A("🌀 Virata, scatto e tiro","velocità",6,"goal","intercept",18),A("🎯 Giro e cross","dribbling",4,"assist","intercept",14),A("💥 Tiro dopo la virata","tiro",2,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_right"],bs:"feet"}),
S("🦵 Uno contro uno col terzino in fascia — spazio per il cross!",["bordo","trequarti"],{x:[60,88],y:[68,97]},{x:[62,78],y:[72,95]},[
  A("🌀 Dribbling netto e cross","dribbling",5,"assist","intercept",18),A("⚡ Scatto in velocità e assist","velocità",4,"assist","intercept",16),A("↗️ Cross immediato senza dribblare","passaggio",6,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_right"],bs:"feet"}),/* [7.113.0 audit massivo · fix A2] era bs:"aerial" (paste dalla sit acrobatica successiva): questo è un DRIBBLING col terzino (palla al piede) → feet, coerente coi 3 gemelli i176/177/178 */
S("🤸 Controllo acrobatico e tiro!",["area","bordo"],{x:[74,96],y:[22,78]},{x:[76,88],y:[28,72]},[
  A("🤸 Controllo acrobatico e tira","tecnica",3,"goal","miss",18),A("✈️ Testa al volo","fisico",4,"goal","miss",14),A("🦵 Tiro di prima","tiro",2,"goal","miss",13)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("🌀 Dribbling in spazio ristretto!",["area","bordo"],{x:[75,97],y:[22,78]},{x:[78,90],y:[28,72]},[
  A("🌀 Dribbling stretto e tiro","dribbling",8,"goal","intercept",18),A("⚡ Tiro rapido senza dribblare","tiro",3,"goal","miss",14),A("↗️ Serve il compagno libero","passaggio",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"high",support:0,nearby_def:3,lanes:[]}),

/* TREQUARTI — AVANZATO */
S("🔄 Cambio gioco rapido 50 metri!",["centro","trequarti"],{x:[40,70],y:[20,80]},{x:[42,60],y:[28,72]},[
  A("🔄 Lancio lungo di prima","passaggio",5,"assist","intercept",10),A("⚡ Avanza e cambia lato","velocità",3,"goal","intercept",15),A("🎯 Passaggio corto e triangolo","tecnica",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:[]}),
S("🎯 Chip pass oltre la difesa!",["trequarti","bordo"],{x:[56,84],y:[22,78]},{x:[58,74],y:[28,72]},[
  A("🎯 Chip millimetrico","tecnica",6,"assist","intercept",13),A("⚡ Lancio piatto in profondità","passaggio",4,"assist","intercept",10),A("🌀 Avanza e crea spazio","velocità",3,"goal","intercept",16)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:["through_ball_lane"]}),
S("🕳️ Palla al buco tra i centrali!",["trequarti"],{x:[55,78],y:[25,75]},{x:[58,70],y:[30,70]},[
  A("🕳️ Filtrante tra i centrali","passaggio",9,"assist","intercept",12),A("💥 Tiro dal limite invece","tiro",-5,"goal","miss",14),A("⚡ Avanza tu stesso","velocità",4,"goal","intercept",16)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:["through_ball_lane"]}),
S("✈️ Spizzata aerea per il compagno!",["trequarti","bordo"],{x:[55,84],y:[25,75]},{x:[58,74],y:[30,70]},[
  A("✈️ Spizzata di testa","fisico",5,"assist","intercept",11),A("🎯 Colpo di testa mirato","fisico",3,"assist","miss",10),A("🔙 Retropassaggio per riorganizzare","passaggio",2,"assist","intercept",6)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["central_run"],bs:"aerial"}),
S("🎯 Stop e tiro fulmineo!",["trequarti","bordo"],{x:[60,82],y:[25,75]},{x:[68,78],y:[30,70]},[/* [7.751.0 collaudo PO «tiri da distanza siderale»: la partenza sta a portata del testo (30 m ≈ x 71) */
  A("🎯 Stop e tiro preciso","tecnica",5,"goal","miss",14),A("💥 Prima intenzione senza stop","tiro",2,"goal","miss",13),A("↩️ Controlla e serve","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🏃 Fai il velo per il compagno!",["trequarti","bordo"],{x:[58,84],y:[22,78]},{x:[60,74],y:[28,72]},[
  A("🏃 Faccio il velo e attacco","posizionamento",5,"goal","intercept",16),A("↩️ Ricevo dopo il velo","passaggio",6,"assist","intercept",10),A("⚡ Scatto oltre il velo e tiro","velocità",4,"goal","intercept",14)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["central_run"]}),
S("⚡ Assist rasoterra in area piccola!",["area"],{x:[82,98],y:[22,78]},{x:[84,94],y:[28,72]},[
  A("⚡ Rasoterra preciso per il compagno","passaggio",9,"assist","intercept",10),A("🦵 Tiro di prima invece","tiro",5,"goal","miss_easy",12),A("🤸 Appoggio di prima per il compagno libero","tecnica",-2,"assist","intercept",14)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:1,lanes:["central_run"]}),
S("🌀 Penetrazione centrale in dribbling!",["trequarti","bordo"],{x:[58,86],y:[35,65]},{x:[60,72],y:[38,62]},[
  A("🌀 Dribbling centrale e tiro","dribbling",5,"goal","intercept",18),A("⚡ Spunto esplosivo verso porta e tiro","velocità",4,"goal","intercept",16),A("↩️ Dai e vai in verticale","passaggio",5,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:[]}),
S("🎯 Assist di prima al compagno libero!",["trequarti","bordo"],{x:[58,86],y:[22,78]},{x:[60,74],y:[28,72]},[
  A("🎯 Assist di prima senza guardare","passaggio",7,"assist","intercept",12),A("💥 Tiro a sorpresa senza assist","tiro",2,"goal","miss",14),A("🌀 Finta e serve dopo la finta","tecnica",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:[]}),
S("↩️ Rimorchio al limite dell'area!",["trequarti","bordo"],{x:[60,84],y:[22,78]},{x:[62,76],y:[28,72]},[
  A("↩️ Rimorchio e tiro","tecnica",5,"goal","miss",14),A("🎯 Rimorchio e serve il compagno","passaggio",6,"assist","intercept",10),A("⚡ Rimorchio, scatto e tiro","velocità",4,"goal","intercept",15)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
/* [7.680.0 collaudo PO su SIT #115: «il tacco non puo' essere un tiro, cambia eventualmente nome
   all'azione da scegliere»]. Ha ragione sulla ZONA: questa scena vive fra bordo e trequarti (gx 62-84),
   e un tacco scagliato in porta da fuori area non e' un colpo di classe, e' una cosa che non si vede.
   Il tacco resta dov'e' vero — lo SCARICO per il compagno libero, terza opzione, invariata — e la
   conclusione diventa quella che da li' si tenta davvero. NON tocco l'altra «Tacco in porta» (scena
   «Spalle alla porta in area»): li' il gesto e' al posto giusto, in area e con le spalle girate.
   ⚠️ E IL TITOLO DELLA SCENA NON SI TOCCA: avevo provato a riscriverlo «scarico o conclusione?» e il
   gate ha trovato la firma golden divergente su gi115 — l'INTENTO si deriva dal testo (7.318), e la
   parola «scarico» faceva leggere la scena come un uno-due invece che come un tiro, cambiandone la
   meccanica. Il PO ha chiesto di cambiare il nome dell'AZIONE: si cambia quello e basta. */
S("🦶 Appoggio di prima al limite! Colpo di classe.",["bordo","trequarti"],{x:[62,84],y:[25,75]},{x:[64,76],y:[30,70]},[
  A("🌀 Tiro a giro sul secondo palo","tecnica",-3,"goal","miss",20),A("🦵 Tiro interno piede classico","tiro",3,"goal","miss",13),A("↩️ Appoggio di prima per il compagno libero","passaggio",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
S("💡 Smarcamento improvviso!",["trequarti","bordo"],{x:[55,84],y:[22,78]},{x:[58,72],y:[28,72]},[
  A("💡 Finta e scarta il difensore e tiro","dribbling",6,"goal","intercept",16),A("⚡ Taglio improvviso diagonale","velocità",5,"goal","intercept",14),A("🎯 Schema concordato coi compagni","passaggio",6,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
S("🎯 Taglio diagonale e tiro!",["trequarti","bordo"],{x:[58,86],y:[22,78]},{x:[66,76],y:[28,72]},[/* [7.751.0 collaudo PO «tiri da distanza siderale»: la partenza sta a portata del testo (30 m ≈ x 71) */
  A("🎯 Taglio diagonale e tiro","velocità",6,"goal","intercept",18),A("🌀 Dribbling dopo il taglio e tiro","dribbling",4,"goal","intercept",14),A("↩️ Appoggio per il compagno","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),

/* CENTROCAMPO — AVANZATO */
S("⚡ Smistamento rapidissimo a un tocco!",["centro","trequarti"],{x:[38,65],y:[22,78]},{x:[40,56],y:[28,72]},[
  A("⚡ Uno-due e smista subito","passaggio",7,"assist","intercept",8),A("🔄 Cambia lato rapidamente","passaggio",5,"assist","intercept",6),A("🏃 Avanza col pallone e conserva","velocità",3,"recovery","intercept",14)],false,-1,"","off",null,{pressure:"medium",support:3,nearby_def:1,lanes:[]}),
S("📏 Cambio di gioco lungo 50 metri!",["centro","difesa"],{x:[30,60],y:[20,80]},{x:[33,52],y:[28,72]},[
  A("📏 Lancio lungo 50m di prima","passaggio",5,"assist","intercept",10),A("🔄 Cambio campo 30m","passaggio",4,"assist","intercept",8),A("↩️ Mantieni il possesso sicuro","passaggio",2,"assist","nothing",5)],false,-1,"","off",null,{pressure:"low",support:3,nearby_def:0,lanes:[]}),
S("🎯 Verticale filtrante di prima!",["centro","trequarti"],{x:[38,65],y:[22,78]},{x:[40,56],y:[28,72]},[
  A("🎯 Verticale filtrante di prima","passaggio",8,"assist","intercept",11),A("⚡ Avanza in profondità e servi","velocità",5,"assist","intercept",16),A("🌀 Dribbling e conduci","dribbling",3,"recovery","intercept",13)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["through_ball_lane"]}),
S("🔥 Triangolo veloce 3 contro 2!",["trequarti","bordo"],{x:[55,84],y:[22,78]},{x:[58,72],y:[28,72]},[
  A("🔥 Triangolo e vai","tecnica",7,"goal","intercept",18),A("↩️ Dai e vai subito","passaggio",6,"assist","intercept",10),A("⚡ Scatto in verticale e tiro","velocità",5,"goal","intercept",16)],false,-1,"","off",null,{pressure:"medium",support:3,nearby_def:2,lanes:["central_run","through_ball_lane"],bs:"feet"}),/* [7.113.0 audit massivo · fix A1] era bs:"aerial" su un TRIANGOLO/dai-e-vai a terra (nessun elemento aereo) → feet */
S("🌀 Parabola d'esterno — cambio gioco!",["centro","difesa"],{x:[30,58],y:[20,80]},{x:[33,50],y:[28,72]},[
  A("🌀 Parabola d'esterno 40m","passaggio",6,"assist","intercept",10),A("📏 Lancio lungo di collo","passaggio",4,"assist","intercept",8),A("↩️ Passaggio sicuro corto","passaggio",2,"assist","nothing",5)],false,-1,"","off",null,{pressure:"low",support:3,nearby_def:0,lanes:[]}),
S("🏃 Ricezione di spalle e giratone!",["centro"],{x:[38,60],y:[28,72]},{x:[42,54],y:[32,68]},[
  A("🌀 Giratone e conduci","tecnica",5,"recovery","intercept",14),A("↩️ Dai e ricevi subito","passaggio",4,"assist","intercept",8),A("💥 Sventagliata improvvisa dopo il giratone","tiro",-6,"assist","miss",14)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
S("🎯 Lanci lunghi — alzati e controlla!",["difesa","centro"],{x:[15,45],y:[22,78]},{x:[18,38],y:[28,72]},[
  A("✈️ Colpo di testa e smista","fisico",5,"assist","intercept",8),A("🛑 Stop di petto e conserva","tecnica",4,"recovery","intercept",12),A("⚡ Controlla al volo e lancia","velocità",3,"assist","intercept",14)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:[],bs:"aerial"}),
S("⚡ Break verticale — lancia la transizione!",["centro","trequarti"],{x:[40,68],y:[22,78]},{x:[42,58],y:[28,72]},[
  A("⚡ Lancio in profondità immediato","passaggio",7,"assist","intercept",11),A("🏃 Avanza col pallone di corsa","velocità",5,"goal","intercept",16),A("🔄 Smista sul lato libero","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:["through_ball_lane"]}),
S("🧠 Gioco aereo a centrocampo!",["centro","trequarti"],{x:[38,68],y:[22,78]},{x:[40,58],y:[28,72]},[
  A("✈️ Stacco e indirizza il compagno","fisico",6,"assist","intercept",10),A("💪 Stacco difensivo deciso","fisico",4,"recovery","through",12),A("🤝 Sponda per il compagno","passaggio",2,"assist","nothing",8)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:2,lanes:[],bs:"aerial"}),
S("💪 Pressing aggressivo a centrocampo — sfida sul portatore!",["centro","trequarti"],{x:[38,70],y:[20,80]},{x:[42,60],y:[28,72]},[
  A("💪 Contrasto duro sull'avversario","fisico",5,"recovery","foul",16),A("✋ Intercetta la traiettoria","tecnica",4,"recovery","through",12),A("🏃 Sprint di copertura","velocità",6,"recovery","through",14)],false,2,"💪 L'avversario parte in transizione! Bloccalo subito!","def",null,{pressure:"high",support:2,nearby_def:1,lanes:[]}),

/* DIFESA — AVANZATA */
S("🛑 Chiusura urgente sull'attaccante!",["difesa","propria"],{x:[15,45],y:[20,80]},{x:[18,38],y:[28,72]},[
  A("🛑 Chiusura immediata","velocità",8,"recovery","through",20),A("💪 Contrasto fisico deciso","fisico",5,"recovery","foul",16),A("📣 Posizionamento strategico","posizionamento",4,"recovery","through",12)],false,2,"🚨 L'attaccante è solo in campo aperto! Chiudigli la strada!","def",null,{pressure:"high",support:1,nearby_def:1,lanes:[]}),
S("🤼 Raddoppio difensivo!",["difesa","centro"],{x:[18,55],y:[20,80]},{x:[22,42],y:[28,72]},[
  A("🤼 Raddoppio coordinato col compagno","tecnica",6,"recovery","through",14),A("🏃 Sprint di copertura urgente","velocità",5,"recovery","through",16),A("📣 Chiamo il compagno a raddoppiare","tecnica",3,"recovery","nothing",8)],false,2,"🤝 Raddoppia sul portatore! Superiamo l'emergenza.","def",null,{pressure:"high",support:2,nearby_def:1,lanes:[]}),
S("✋ Intercetto in verticale!",["centro","difesa"],{x:[22,58],y:[22,78]},{x:[26,46],y:[28,72]},[
  A("✋ Anticipo sulla traiettoria","tecnica",8,"recovery","through",13),A("⚡ Sprint anticipato","velocità",6,"recovery","through",16),A("💪 Contrasto di spalla","fisico",4,"recovery","foul",12)],false,2,"👁️ Il passaggio sta per partire! Anticipalo!","def",null,{pressure:"high",support:1,nearby_def:1,lanes:[]}),
S("🛡️ Fallo tattico — ferma il contropiede!",["centro","trequarti"],{x:[38,70],y:[20,80]},{x:[40,58],y:[28,72]},[
  A("🛡️ Fallo intelligente in zona","mentalità",5,"save","foul",10),A("⚡ Recupero in velocità invece","velocità",6,"recovery","through",18),A("💪 Contrasto pulito senza fallo","fisico",3,"recovery","foul",14)],false,2,"🧠 Meglio un fallo tattico che un gol subito!","def",null,{pressure:"high",support:1,nearby_def:1,lanes:[]}),
S("🧱 Blocco del tiro in area!",["propria"],{x:[5,22],y:[22,78]},{x:[7,18],y:[30,70]},[
  A("🧱 Blocco col corpo sulla traiettoria","fisico",9,"save","goal_against",16),A("✋ Devia col piede sul palo","tecnica",5,"save","goal_against",12),A("😱 Tentativo disperato","fisico",3,"save","goal_against",10)],false,0,"💥 Tiro in arrivo! Mettiti sulla traiettoria!","def",null,{pressure:"high",support:1,nearby_def:2,lanes:[]}),
S("🏃 Recupero sulla linea di fondo!",["propria"],{x:[2,15],y:[10,30]},{x:[4,12],y:[12,26]},[
  A("🏃 Sprint disperato sulla linea","velocità",7,"save","goal_against",20),A("✋ Intercetto prima del fondo","tecnica",5,"save","goal_against",14),A("📣 Chiamo il portiere","tecnica",2,"save","goal_against",8)],false,1,"⚡ Palla verso il fondo — ultima chance!","def",null,{pressure:"high",support:0,nearby_def:1,lanes:[]}),
S("✈️ Sfida aerea su lancio lungo!",["propria","difesa"],{x:[8,30],y:[22,78]},{x:[10,25],y:[28,72]},[
  A("✈️ Stacco dominante","fisico",8,"save","goal_against",14),A("💪 Contrasto fisico in volo","fisico",5,"save","goal_against",12),A("📣 Chiamo il portiere","tecnica",4,"save","goal_against",8)],false,1,"✈️ Lancio lungo in area! Vinci il duello aereo!","def",null,{pressure:"high",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("🤝 Copertura del compagno fuori posizione!",["difesa","propria"],{x:[5,35],y:[20,80]},{x:[8,28],y:[28,72]},[
  A("🤝 Copro la sua posizione","posizionamento",7,"save","through",12),A("⚡ Sprint per coprire lo spazio","velocità",5,"save","through",16),A("📣 Comunico la situazione","tecnica",4,"save","through",8)],false,2,"🤝 Il compagno è fuori posizione! Copri tu!","def",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🛑 Cross basso in area — intercetta!",["propria","difesa"],{x:[8,28],y:[22,78]},{x:[10,22],y:[28,72]},[
  A("🛑 Blocca il cross con il corpo","fisico",6,"save","goal_against",14),A("✋ Devia in corner","tecnica",5,"save","goal_against",12),A("📣 Chiama il portiere","tecnica",3,"save","goal_against",8)],false,1,"⚠️ Cross basso pericoloso in area! Intercetta prima che arrivi al centro!","def",null,{pressure:"high",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("⚡ Tackle in corsa — è più veloce!",["difesa","centro"],{x:[22,55],y:[20,80]},{x:[25,44],y:[28,72]},[
  A("⚡ Tackle in corsa preciso","fisico",6,"recovery","foul",16),A("🌀 Indirizza verso il fallo laterale","tecnica",4,"recovery","through",12),A("🏃 Sprint puro di rientro","velocità",5,"recovery","through",14)],false,2,"🏃 L'attaccante fugge in velocità! Raggiungerlo?","def",null,{pressure:"high",support:1,nearby_def:1,lanes:[]}),
S("📣 Allineati con la difesa — linea alta!",["propria","difesa"],{x:[5,30],y:[22,78]},{x:[8,24],y:[28,72]},[
  A("📣 Allineamento difensivo immediato","mentalità",6,"save","through",10),A("💪 Contrasto fisico duro","fisico",4,"save","goal_against",14),A("⚡ Pressing immediato sul portatore","velocità",5,"recovery","through",12)],false,1,"📣 Linea alta! Allineati con i compagni e non farti sorprendere in offside!","def",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
S("🏃 Pressing coordinato — recupera!",["trequarti","centro"],{x:[40,72],y:[20,80]},{x:[44,62],y:[28,72]},[
  A("🏃 Pressing a zona coordinato","velocità",6,"recovery","through",16),A("✋ Intercetta il passaggio","tecnica",5,"recovery","through",12),A("💪 Contrasto duro sull'avversario","fisico",3,"recovery","foul",14)],false,2,"😤 Pressing alto! Recupera nella loro metà!","def",null,{pressure:"high",support:2,nearby_def:1,lanes:[]}),

/* SITUAZIONI NARRATIVE E SPECIALI */
S("🔥 Siamo in vantaggio — gestisci!",["trequarti","centro"],{x:[38,75],y:[22,78]},{x:[42,62],y:[28,72]},[
  A("🔥 Porta palla nell'angolo","tecnica",5,"recovery","nothing",12),A("↩️ Passaggio sicuro laterale","passaggio",4,"recovery","nothing",6),A("💥 Rilancio offensivo in profondità","velocità",3,"goal","intercept",14)],false,-1,"","off","winning",{pressure:"low",support:2,nearby_def:1,lanes:[]}),/* [6.44.0 RC] gestire il vantaggio = TENERE palla: portarla alla bandierina o passaggio sicuro davano GOAL/ASSIST fasulli (score+1 + esultanza) → ora "recovery" (mantieni possesso). Il 3° resta l'opzione offensiva (contropiede) con "goal". Stessa classe del fix 6.43.0. */
S("🔥 Caccia al gol — attacca!",["trequarti","bordo"],{x:[55,88],y:[22,78]},{x:[58,74],y:[28,72]},[
  A("💥 Tiro dalla distanza!","tiro",-3,"goal","miss",14),A("⚡ Sprint verso la porta","velocità",6,"goal","intercept",18),A("🎯 Assist preciso","passaggio",5,"assist","intercept",12)],false,3,"🔥 Spingi forte — serve il gol!","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),// 5.43.17: rimosso il riferimento al "tempo residuo" (non sincronizzato col clock reale) → urgenza generica
S("🌧️ Campo pesante — pioggia torrenziale!",["trequarti","bordo"],{x:[55,88],y:[22,78]},{x:[58,74],y:[28,72]},[
  A("🌧️ Tiro rasoterra sul bagnato","tiro",5,"goal","miss",14),A("💪 Usa il fisico — campo pesante","fisico",4,"goal","miss",13),A("🎯 Passaggio corto e sicuro","passaggio",4,"assist","intercept",8)],false,-1,"","off","is_wet",{pressure:"medium",support:1,nearby_def:1,lanes:[]}),/* [7.117.0] ctx=is_wet → «campo pesante/pioggia» solo col campo bagnato (rain/snow), non più in giornate serene */
S("🏟️ Derby cittadino! Intensità massima.",["bordo","trequarti"],{x:[58,88],y:[22,78]},{x:[60,76],y:[28,72]},[
  A("🔥 Tiro potente — adrenalina pura","tiro",4,"goal","miss",16),A("🌀 Dribbling tecnico da campione e tiro","dribbling",3,"goal","miss",15),A("🎯 Assist preciso — vinci il derby","passaggio",5,"assist","intercept",10)],false,3,"🏟️ È il derby! Sessantamila tifosi. Solo tu e il pallone.","off","is_derby",{pressure:"medium",support:1,nearby_def:1,lanes:[]}),/* [7.116.0 collaudo PO «il derby cittadino nel 99% dei casi non è vero»] ctx=is_derby → l'highlight con testo/azione/mister che nominano il DERBY appare SOLO in una gara di derby REALE (isDerby club↔avversario), come is_ex_club. Prima era ungated → falso derby ~99% delle volte. */
S("💔 Davanti alla tua ex squadra — momento decisivo.",["bordo","area"],{x:[70,96],y:[22,78]},{x:[72,86],y:[28,72]},[
  A("💥 Gol dell'ex — silenzio assoluto","tiro",6,"goal","miss",18),A("🎯 Assist gelido e decisivo","passaggio",5,"assist","intercept",12),A("⚡ Scatto senza rimpianti e tiro","velocità",4,"goal","intercept",16)],false,3,"💔 È la partita contro la tua ex squadra. Cosa fai?","off","is_ex_club",{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🌟 Stadio in delirio! Fai il gol dell'anno.",["bordo","area"],{x:[72,96],y:[22,78]},{x:[74,88],y:[28,72]},[
  A("🌟 Gol dell'anno — ci provo!","tiro",3,"goal","miss",20),A("🎯 Assist decisivo per la vittoria","passaggio",5,"assist","intercept",12),A("⚡ Gioco sul sicuro","velocità",4,"goal","intercept",14)],false,3,"🌟 Lo stadio è in delirio! Fai la cosa più difficile!","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🛡️ Assalto avversario! Difendi con tutto.",["difesa","centro"],{x:[18,55],y:[20,80]},{x:[22,42],y:[28,72]},[
  A("🛡️ Blocca con tutto il fisico","fisico",7,"recovery","foul",14),A("⚡ Sprint disperato di copertura","velocità",6,"recovery","through",18),A("🧠 Intelligenza tattica — posizionati","mentalità",5,"recovery","nothing",12)],false,2,"🛡️ L'avversario spinge a testa bassa. Ogni pallone è oro.","def",null,{pressure:"high",support:1,nearby_def:1,lanes:[]}),/* [7.117.0 congruenza] era «Siamo in dieci uomini!/Espulsione» ma NON esiste uno stato di espulsione PROPRIA in partita → falso claim in ogni gara. Neutralizzato a stand difensivo ad alta pressione (stesso type/azioni). */
S("🎯 Superiorità numerica — sfruttala!",["trequarti","bordo"],{x:[55,88],y:[22,78]},{x:[58,74],y:[28,72]},[
  A("🎯 Sfrutta lo spazio in più","passaggio",7,"assist","intercept",10),A("⚡ Scatto senza pressione e tiro","velocità",5,"goal","intercept",16),A("💥 Tiro con fiducia","tiro",3,"goal","miss",14)],false,-1,"","off","is_opp_red",{pressure:"low",support:3,nearby_def:0,lanes:[]}),/* [7.117.0] ctx=is_opp_red → «superiorità numerica» solo dopo un'espulsione avversaria REALE (oppRedRef) */
S("🏃 Rimessa dal portiere — verticale!",["difesa","centro"],{x:[10,40],y:[25,75]},{x:[12,32],y:[30,70]},[
  A("🏃 Scatto in profondità e cross basso","velocità",6,"assist","intercept",16),A("🎯 Triangolo col portiere","passaggio",4,"assist","intercept",8),A("🧠 Costruisci con qualità","tecnica",3,"assist","nothing",6)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:[]}),
S("⚡ Rimessa rapida del compagno — sorpresa!",["trequarti","centro"],{x:[42,72],y:[14,34]},{x:[45,62],y:[18,30]},[
  A("⚡ Ricevi e scatta in profondità","velocità",6,"goal","intercept",16),A("↗️ Chiama il lancio in area","passaggio",5,"assist","intercept",10),A("🎯 Triangola dalla rimessa","tecnica",6,"assist","nothing",12)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:[]}),// 5.43.6: eroe RICEVENTE in campo — la rimessa la batte un compagno; label riscritte (l'eroe riceve, non batte)
S("🎭 Guadagna una punizione!",["bordo","area"],{x:[73,96],y:[22,78]},{x:[75,88],y:[28,72]},[
  A("🌀 Dribbling provocatorio — il fallo c'è!","dribbling",4,"assist","intercept",12),A("⚡ Scatto improvviso provocatorio","velocità",4,"assist","through",12),A("💥 Tiro potente invece","tiro",3,"goal","miss",14)],false,-1,"","off",null,{it:"dribble",pressure:"medium",support:1,nearby_def:1,lanes:[]}),/* [6.44.0 RC] override intento: il testo «Guadagna una PUNIZIONE» faceva scattare deriveIntent→"freekick" (regex /unizione/) → questa situazione DI GIOCO APERTO mostrava la griglia di mira del rigore invece delle sue 3 azioni. it:"dribble" corto-circuita la regex (è un dribbling provocatorio per farsi fare fallo, non una punizione battuta). */
/* [7.999.79 taccuino PO SIT #151: «l'eroe entra troppo nella porta, si accavalla con il palo» e «il palo e' in primo piano mentre festeggiano»] MISURATO: la partenza arrivava a x 96 (2,6u dalla linea) e z -8 — l'eroe nasceva sulla linea di fondo ACCANTO al palo e ci restava per tutta la scena. Una ribattuta libera in area si gioca davanti alla porta: partenza al centro dell'area, fra il dischetto e l'area piccola. */
S("🔴 Ribattuta libera in area — arrivaci per primo!",["area"],{x:[84,94],y:[34,66]},{x:[86,92],y:[38,62]},[
  A("⚡ Arriva di sprint sulla ribattuta","velocità",12,"goal","miss_easy",12),A("🦵 Tiro di prima sul rimbalzo","tiro",8,"goal","miss",12),A("🤝 Servi il compagno libero","passaggio",6,"assist","intercept",10)],false,0,"🔴 Il portiere ha parato! La palla rimbalza in area!","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("📋 Schema doppio dai e vai!",["trequarti","bordo"],{x:[55,85],y:[22,78]},{x:[58,72],y:[28,72]},[
  A("📋 Schema a tre — dai, ricevi, tira","passaggio",9,"goal","intercept",18),A("⚡ Primo triangolo e scatta","velocità",6,"goal","intercept",16),A("🎯 Terzo uomo smarcato","passaggio",7,"assist","intercept",12)],false,4,"📋 Schema a tre! Dai, ricevi, dai ancora e arriva in porta.","off",null,{pressure:"low",support:3,nearby_def:1,lanes:[]}),
S("💥 Bordata da centrocampo!",["trequarti"],{x:[55,72],y:[28,72]},{x:[57,68],y:[32,68]},[
  A("💥 Bordata potente","tiro",-10,"goal","miss",18),A("🎯 Tiro controllato","tiro",-5,"goal","miss",14),A("↗️ Serve in area per il compagno","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🌀 Azione individuale — porta il pallone!",["trequarti","bordo"],{x:[55,88],y:[22,78]},{x:[58,74],y:[28,72]},[
  A("🌀 Dribbling individuale feroce e tiro","dribbling",5,"goal","intercept",18),A("⚡ Sprint verso la porta","velocità",4,"goal","intercept",16),A("🎯 Serve un compagno smarcato","passaggio",5,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:[]}),
S("🧠 Anticipo tattico — leggi il gioco!",["centro","trequarti"],{x:[38,70],y:[22,78]},{x:[40,58],y:[28,72]},[
  A("🧠 Anticipi la giocata avversaria","mentalità",7,"recovery","through",12),A("⚡ Sprint anticipato","velocità",5,"recovery","through",14),A("↩️ Posizionamento preventivo","posizionamento",4,"recovery","nothing",8)],false,-1,"","def",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),// 5.41.0: situazione DIFENSIVA (azioni premiano recovery) → type "def" così deriveIntent restituisce "anticipate" e la cinematica è difensiva (prima cadeva su "shot").
S("🎯 Lancio millimetrico in profondità!",["centro","difesa"],{x:[28,60],y:[22,78]},{x:[30,50],y:[28,72]},[
  A("🎯 Lancio in profondità perfetto","passaggio",8,"assist","intercept",12),A("⚡ Avanza di corsa e lancia","velocità",5,"assist","intercept",10),A("💥 Missile a scavalcare la difesa","tiro",-15,"assist","miss",16)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:0,lanes:["through_ball_lane"],cn:{fpCross:true,fpHeader:true}}),
S("🛡️ Il tiro è in porta — gettati sulla traiettoria!",["propria","difesa"],{x:[5,25],y:[22,78]},{x:[7,20],y:[28,72]},[
  A("🤸 Gettati sulla traiettoria","fisico",8,"save","goal_against",20),A("✋ Devia di piede sul palo","tecnica",6,"save","goal_against",14),A("📣 Avvisa il portiere","tecnica",3,"save","goal_against",8)],false,0,"💥 Il tiro è in porta! Mettiti sulla traiettoria e para con il corpo!","def",null,{pressure:"high",support:0,nearby_def:1,lanes:[]}),
S("🔙 Costruzione dal basso!",["propria","difesa"],{x:[5,30],y:[25,75]},{x:[8,22],y:[30,70]},[
  A("🔙 Smarcati per ricevere","posizionamento",5,"assist","intercept",8),A("⚡ Scatto, gli dai una soluzione e assist","velocità",4,"assist","intercept",10),A("💪 Offri il fisico per la palla lunga","fisico",3,"assist","intercept",6)],false,-1,"","off",null,{pressure:"low",support:3,nearby_def:0,lanes:[]}),
S("⚽ Taglio sul cross al palo lontano — tempismo!",["area","bordo"],{x:[76,96],y:[30,50]},{x:[78,88],y:[33,48]},[
  A("⚽ Taglio preciso sul palo lontano","velocità",7,"goal","miss",18),A("✈️ Testa in profondità","fisico",5,"goal","miss",15),A("↩️ Serve il compagno al centro","passaggio",4,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:["central_run"],bs:"aerial",cn:{fpCross:true,fpHeader:true}}),
S("🌀 Portiere in uscita — scartalo!",["area","bordo"],{x:[75,96],y:[28,72]},{x:[77,88],y:[32,68]},[
  A("⚡ Tiro immediato prima che esca","tiro",4,"goal","miss",14),A("🌀 Scarta il portiere in uscita","dribbling",5,"goal","miss_easy",20),A("↗️ Passa al compagno a porta vuota","passaggio",7,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[],cn:{oneOnOne:true}}),
S("📐 Punizione da posizione defilata!",["bordo","trequarti"],{x:[70,85],y:[10,25]},{x:[72,82],y:[12,22]},[
  A("📐 Punizione a rientrare","tiro",5,"goal","miss",13),A("↗️ Cross sul secondo palo","passaggio",6,"assist","miss",8),A("🎯 Palla sul primo palo","passaggio",4,"assist","intercept",8)],true,-1,"","off",null,{pressure:"none",support:2,nearby_def:0,lanes:["overlap_left"]}),
S("🎯 Assist d'esterno piede!",["trequarti","bordo"],{x:[58,86],y:[22,78]},{x:[60,74],y:[28,72]},[
  A("🎯 Esterno piede preciso","passaggio",6,"assist","intercept",12),A("💥 Tiro d'esterno a sorpresa","tiro",2,"goal","miss",14),A("🌀 Finta e assist d'interno","tecnica",4,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:[]}),
S("💥 Bordata dal limite!",["trequarti"],{x:[55,72],y:[28,72]},{x:[57,68],y:[32,68]},[
  A("💥 Collo pieno potente","tiro",-8,"goal","miss",18),A("🎯 Tiro controllato","tiro",-4,"goal","miss",14),A("↗️ Serve in area per il compagno","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),

/* === SPRINT 78 — NUOVE SITUATIONS === */
S("⚡ Taglio dal lato destro verso il centro!",["bordo","area"],{x:[74,96],y:[58,97]},{x:[76,88],y:[62,92]},[
  A("🌀 Rientra e tira col sinistro","tecnica",6,"goal","miss",14),A("🎯 Cross teso verso il secondo palo","passaggio",5,"assist","intercept",10),A("💥 Tiro di collo pieno","tiro",2,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["overlap_right"]}),
S("⚡ Taglio dal lato sinistro verso il centro!",["bordo","area"],{x:[74,96],y:[3,42]},{x:[76,88],y:[8,38]},[
  A("🌀 Rientra e tira col destro","tecnica",6,"goal","miss",14),A("🎯 Cross teso verso il secondo palo","passaggio",5,"assist","intercept",10),A("💥 Tiro di collo pieno","tiro",2,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:["overlap_left"]}),
S("🌀 Slalom in area! Tre difensori da superare.",["area"],{x:[80,96],y:[22,78]},{x:[82,92],y:[28,72]},[
  A("🌀 Slalom completato e tiro","dribbling",8,"goal","miss",20),A("⚡ Scatto nello stretto e tiro","velocità",4,"goal","miss",16),A("🎯 Assist per il compagno smarcato","passaggio",6,"assist","intercept",10)],false,2,"🌀 Slalom tra i difensori! Salta tutti e vai.","special",null,{pressure:"high",support:1,nearby_def:3,lanes:[]}),
S("🦵 Controbalzo improvviso in area!",["area","bordo"],{x:[74,96],y:[22,78]},{x:[76,88],y:[28,72]},[
  A("🦵 Controbalzo secco al volo","tiro",7,"goal","miss",15),A("🎯 Controllo e tira","tecnica",5,"goal","miss",13),A("↩️ Serve il compagno","passaggio",3,"assist","intercept",8)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("🛡️ Ultimo uomo! Devi fermare l'avversario.",["propria","difesa"],{x:[5,28],y:[20,80]},{x:[8,22],y:[30,70]},[
  A("🛡️ Tackle duro — rischio rosso","fisico",10,"recovery","foul",16),A("⚡ Sprint laterale preventivo","velocità",7,"recovery","through",14),A("📣 Guida i compagni e copri","mentalità",5,"recovery","through",10)],false,2,"🚨 Sei l'ultimo! Se passa, è gol sicuro.","def",null,{pressure:"high",support:0,nearby_def:1,lanes:[]}),
S("😱 Il portiere è fuori dai pali! Tira da lontano.",["trequarti","bordo"],{x:[55,78],y:[28,72]},{x:[62,72],y:[32,68]},[/* [7.751.0 collaudo PO «tiri da distanza siderale»: la partenza sta a portata del testo (30 m ≈ x 71) */
  A("💥 Tiro da distanza sul palo lontano","tiro",5,"goal","miss",16),A("🎯 Pallonetto morbido — gol dell'anno","tecnica",3,"goal","miss_easy",14),A("🎯 Assist per il compagno in area","passaggio",6,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🔥 CI CREDIAMO! La rimonta è iniziata.",["bordo","area"],{x:[72,96],y:[22,78]},{x:[74,88],y:[28,72]},[
  A("🔥 Tiro di rabbia — per i tifosi","tiro",6,"goal","miss",16),A("💥 Potenza esplosiva dal limite","tiro",2,"goal","miss",14),A("🌟 Assist da campione","passaggio",7,"assist","intercept",12)],false,3,"🔥 La rimonta è viva. Un gol adesso e tutto è possibile!","special","losing",{pressure:"medium",support:1,nearby_def:1,lanes:[]}),
S("🏃 Corsa in area — stacca di testa in corsa!",["area"],{x:[78,96],y:[22,78]},{x:[80,92],y:[28,72]},[
  A("✈️ Stacco in corsa potente","fisico",6,"goal","miss",16),A("🎯 Colpo di testa angolato","fisico",4,"goal","miss",14),A("🦵 Lascia passare e tira di piede","tecnica",3,"goal","miss",12)],false,-1,"","off",null,{pressure:"high",support:1,nearby_def:2,lanes:["central_run"],bs:"aerial"}),
S("⚡ Ultima linea difensiva da superare — sei in area con spazio!",["area"],{x:[80,97],y:[22,78]},{x:[82,93],y:[28,72]},[
  A("🦵 Tiro sul palo più lontano","tiro",8,"goal","miss",12),A("🎯 Piazzato nell'angolo basso","tecnica",6,"goal","miss",12),A("⚡ Tiro di prima — istinto","velocità",4,"goal","miss",15)],false,-1,"","off",null,{pressure:"medium",support:0,nearby_def:1,lanes:["central_run"]}),
S("🎯 Cucchiaio a giro sul palo lontano!",["bordo","area"],{x:[72,92],y:[20,42]},{x:[74,86],y:[23,38]},[
  A("🎯 Cucchiaio a giro angolato","tecnica",5,"goal","miss",14),A("💥 Tiro di collo pieno invece","tiro",3,"goal","miss",13),A("↗️ Cross sul secondo palo","passaggio",5,"assist","intercept",8)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_left"],bs:"feet",cn:{fpCross:true,fpHeader:true}}),
S("🧠 Verticalizzazione prima del difensore!",["centro","trequarti"],{x:[38,68],y:[22,78]},{x:[40,58],y:[28,72]},[
  A("🎯 Verticalizzazione precisa","passaggio",9,"assist","intercept",10),A("⚡ Avanza e servi in corsa","velocità",5,"assist","intercept",16),A("🌀 Finta e supera il pressing","tecnica",5,"recovery","intercept",14)],false,-1,"","off",null,{pressure:"low",support:2,nearby_def:1,lanes:["through_ball_lane"]}),
S("🧤 Errore del portiere! Ribattuta in area.",["area"],{x:[84,98],y:[28,72]},{x:[86,96],y:[33,67]},[
  A("⚡ Arriva in tempo sulla ribattuta","velocità",10,"goal","miss_easy",10),A("🦵 Tiro immediato sul rimbalzo","tiro",8,"goal","miss",12),A("🤝 Serve il compagno più vicino","passaggio",6,"assist","intercept",8)],false,0,"😱 Il portiere ha lasciato sfuggire il pallone!","off",null,{pressure:"medium",support:1,nearby_def:2,lanes:[],bs:"aerial"}),
S("⚡ Sprint sulla fascia sinistra — supera il terzino!",["fascia","trequarti"],{x:[60,82],y:[2,28]},{x:[62,76],y:[5,22]},[
  A("🌀 Sterzata d'esterno sul fondo e assist","dribbling",5,"assist","intercept",12),A("↗️ Cross al volo senza dribblare","passaggio",3,"assist","intercept",9),A("💥 Tiro a giro dall'angolo stretto","tiro",1,"goal","miss",14)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_left"],bs:"feet"}),
S("🌀 Marca stretta sul lato destro — finta e apri lo spazio!",["fascia","trequarti"],{x:[60,82],y:[72,96]},{x:[62,76],y:[74,92]},[
  A("🌀 Sterzata esterna, fuga sul fondo e assist","dribbling",5,"assist","intercept",12),A("↗️ Cross immediato di prima","passaggio",3,"assist","intercept",9),A("🦵 Tiro verso il palo vicino","tiro",1,"goal","miss",13)],false,-1,"","off",null,{pressure:"medium",support:1,nearby_def:1,lanes:["overlap_right"]}),
S("🏃 Accelerazione sulla fascia — il recupero avversario è lento!",["fascia","trequarti"],{x:[55,78],y:[5,25]},{x:[58,72],y:[7,22]},[
  A("⚡ Sterzata d'esterno, brucia il terzino e assist","dribbling",6,"assist","nothing",14),A("🎯 Cross preciso al secondo palo","passaggio",5,"assist","intercept",9),A("🎯 Tiro a giro sul palo lontano","tiro",3,"goal","miss",15)],false,-1,"","off",null,{pressure:"low",support:1,nearby_def:0,lanes:["overlap_left"],bs:"feet"}),
/* [7.56.0 PHASE 3 — FOOTBALL REALISM · VARIETÀ SITUATIONS] 6 nuove situations mirate ai POOL PIÙ SOTTILI
   (audit distribuzione: onetwo 5 · switch 3 · anticipate 2 · intercept 2 = i più ripetitivi quando escono) →
   aggiunte in coda (indici 179-184 → gli esistenti 0-178 restano invariati, golden per-indice preservato).
   Ognuna con `it:"<intent>"` ESPLICITO (intento bulletproof + text-free, elimina il rischio parola→intento
   sbagliato) e `bs:"feet"` (palla a terra → invarianti aerei CINE non toccati). */
S("↩️ Uno-due in verticale — dai e vai!",["trequarti","centro"],{x:[50,80],y:[30,70]},{x:[54,68],y:[35,65]},[
  A("↩️ Dai e vai in verticale","passaggio",6,"assist","intercept",12),A("⚡ Scatta dopo lo scarico","velocità",5,"goal","intercept",14),A("🔺 Triangolo stretto e servi","tecnica",5,"assist","intercept",10)],false,-1,"","off",null,{pressure:"medium",support:3,nearby_def:1,lanes:["central_run"],bs:"feet",it:"onetwo"}),
S("🔺 Triangolo al limite — combina e concludi!",["bordo","trequarti"],{x:[58,82],y:[32,68]},{x:[68,78],y:[36,64]},[/* [7.751.0 collaudo PO «tiri da distanza siderale»: la partenza sta a portata del testo (30 m ≈ x 71) */
  A("🔺 Combinazione stretta e tiro","tecnica",4,"goal","miss",14),A("↩️ Scarico e ricevi in area","passaggio",6,"assist","intercept",11),A("⚡ Parete e inserimento centrale","velocità",5,"goal","intercept",13)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:2,lanes:["central_run"],bs:"feet",it:"onetwo"}),
S("↔️ Cambio di gioco — ribalta sul lato debole!",["centro","trequarti"],{x:[40,68],y:[30,70]},{x:[44,60],y:[35,65]},[
  A("↔️ Lancio diagonale a cambiare fronte","passaggio",7,"assist","intercept",12),A("🎯 Apri il gioco sull'esterno smarcato","tecnica",5,"assist","intercept",10),A("⚡ Guida e sposta il pallone di lato","velocità",4,"assist","nothing",9)],false,-1,"","off",null,{pressure:"low",support:3,nearby_def:1,lanes:["overlap_right","overlap_left"],bs:"feet",it:"switch"}),
S("🔄 Ribaltamento veloce — l'altro lato è sguarnito!",["trequarti","centro"],{x:[46,74],y:[28,72]},{x:[50,64],y:[33,67]},[
  A("🔄 Palla lunga a ribaltare l'azione","passaggio",6,"assist","intercept",12),A("🎯 Cambio d'ala rasoterra","tecnica",5,"assist","intercept",10),A("↗️ Apri largo per la sovrapposizione","passaggio",4,"assist","nothing",8)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["overlap_left"],bs:"feet",it:"switch"}),
S("🧠 Anticipo sulla punta — leggi il passaggio!",["centro","difesa"],{x:[30,60],y:[25,75]},{x:[34,52],y:[30,70]},[
  A("🧠 Anticipa il pallone sulla punta","mentalità",7,"recovery","through",12),A("⚡ Esci in pressione sul portatore","velocità",5,"recovery","through",13),A("↩️ Chiudi la linea e temporeggia","posizionamento",4,"recovery","nothing",8)],false,-1,"","def",null,{pressure:"medium",support:1,nearby_def:2,lanes:[],bs:"feet",it:"anticipate"}),
S("✋ Lettura della linea di passaggio — intercetta!",["centro","difesa"],{x:[28,58],y:[25,75]},{x:[32,50],y:[30,70]},[
  A("✋ Intercetta il filtrante","posizionamento",7,"recovery","through",12),A("⚡ Scatta sulla linea di passaggio","velocità",5,"recovery","through",13),A("🧠 Leggi e taglia il corridoio","mentalità",6,"recovery","nothing",10)],false,-1,"","def",null,{pressure:"medium",support:1,nearby_def:1,lanes:[],bs:"feet",it:"intercept"}),
  /* [7.60.0 PHASE 3 · varietà situations] +6 nei pool più sottili (onetwo 7→9 · switch 5→7 · anticipate 3→4 ·
     intercept 3→4 = 191): append in CODA (indici 185-190 → gli esistenti 0-184 invariati, golden per-indice
     preservato), ognuna con `it` esplicito (intento bulletproof/text-free) + `bs:"feet"` (invarianti aerei CINE intatti). */
  S("🔁 Uno-due sull'esterno — riparti in velocità!",["trequarti","fascia"],{x:[48,78],y:[18,44]},{x:[52,66],y:[22,42]},[
    A("🔁 Scarico e ricevi sul fondo","passaggio",6,"assist","intercept",12),A("⚡ Parete e sfonda in fascia","velocità",5,"goal","intercept",13),A("🎯 Triangolo veloce e cross","tecnica",5,"assist","nothing",10)],false,-1,"","off",null,{pressure:"medium",support:3,nearby_def:1,lanes:["overlap_right"],bs:"feet",it:"onetwo"}),
  S("👟 Muro di prima e scatto — dai e vai in area!",["bordo","trequarti"],{x:[56,80],y:[34,66]},{x:[60,74],y:[38,62]},[
    A("👟 Appoggio di prima e inserimento","tecnica",5,"goal","intercept",13),A("↩️ Sponda corta e ricevi in area","passaggio",6,"assist","intercept",11),A("⚡ Uno-due e conclusione al volo","velocità",4,"goal","miss",14)],false,-1,"","off",null,{pressure:"high",support:2,nearby_def:2,lanes:["central_run"],bs:"feet",it:"onetwo"}),
  S("🎯 Apertura a scavalcare — l'ala è isolata sul lato debole!",["centro","trequarti"],{x:[42,70],y:[30,70]},{x:[46,62],y:[35,65]},[
    A("🎯 Palla filtrante a scavalcare","passaggio",7,"assist","intercept",12),A("↔️ Cambio di fronte teso","tecnica",5,"assist","intercept",10),A("↗️ Guida e servi l'esterno","velocità",4,"assist","nothing",9)],false,-1,"","off",null,{pressure:"low",support:3,nearby_def:1,lanes:["overlap_right","overlap_left"],bs:"feet",it:"switch"}),
  S("🔀 Inverti il fronte — sposta il gioco e accelera!",["centro","trequarti"],{x:[44,72],y:[26,74]},{x:[48,62],y:[32,68]},[
    A("🔀 Sposta il pallone sul lato opposto","passaggio",6,"assist","intercept",12),A("🎯 Diagonale rasoterra a cambiare","tecnica",5,"assist","intercept",10),A("⚡ Conduci e allarga per la corsa","velocità",4,"assist","nothing",8)],false,-1,"","off",null,{pressure:"medium",support:2,nearby_def:1,lanes:["overlap_left"],bs:"feet",it:"switch"}),
  S("🧠 Anticipo in copertura — brucia la punta sul tempo!",["difesa","centro"],{x:[26,56],y:[25,75]},{x:[30,48],y:[30,70]},[
    A("🧠 Anticipa sul primo controllo","mentalità",7,"recovery","through",12),A("⚡ Esci in pressione e ruba il tempo","velocità",5,"recovery","through",13),A("↩️ Accorcia e chiudi lo specchio","posizionamento",4,"recovery","nothing",8)],false,-1,"","def",null,{pressure:"high",support:1,nearby_def:2,lanes:[],bs:"feet",it:"anticipate"}),
  S("✋ Chiudi il corridoio centrale — leggi lo scambio!",["centro","difesa"],{x:[28,58],y:[28,72]},{x:[32,50],y:[33,67]},[
    A("✋ Intercetta lo scarico centrale","posizionamento",7,"recovery","through",12),A("🧠 Leggi il triangolo e rompi il gioco","mentalità",6,"recovery","through",11),A("⚡ Scatta sul portatore e recupera","velocità",5,"recovery","nothing",10)],false,-1,"","def",null,{pressure:"medium",support:1,nearby_def:2,lanes:[],bs:"feet",it:"intercept"}),
];

const ZONES={
  propria:  {label:"Difesa propria",x:[0,20]},
  difesa:   {label:"Centrocampo basso",x:[20,38]},
  centro:   {label:"Centrocampo",x:[38,55]},
  trequarti:{label:"Trequarti",x:[55,72]},
  bordo:    {label:"Bordo area",x:[72,84]},
  area:     {label:"Area avversaria",x:[84,100]},
  fascia:   {label:"Fascia laterale",x:[-1,-1]},// [5.75.0 BUG-13] zona AUTORIALE (usata solo in sit.zones come trigger dell'intent cross in deriveIntent/deriveHL, mai derivata dalla posizione): range nullo → getZone non la restituisce mai
};
const getZone=x=>{for(const[k,v]of Object.entries(ZONES))if(x>=v.x[0]&&x<v.x[1])return k;return"area";};
// Sprint 171: filter situation actions by current player position for realism
// TACT-FILTER (4.74.0): filtro azioni con prerequisiti tattici strutturati.
// sit.tactic.lanes: array di corsie disponibili — se assente, usa euristica posizionale.
// sit.tactic.nearby_def: numero difensori vicini — se 0, il dribbling non ha avversario da superare.
function filterSitActions(actions,px,sit){
  if(!actions||!actions.length)return actions;
  actions=soloDisegnabili(actions);/* [7.999.97 PO-086] via le azioni che promettono un gesto senza clip */
  const tactic=sit?.tactic||null;
  // 5.49.4 — COERENZA STATO-PALLA: se il pallone NON è aereo (a terra/ai piedi o palla ferma), NON proporre MAI giocate AEREE
  //   (colpo di testa, rovesciata, sforbiciata, stacco, di petto). Guard runtime su TUTTE le situazioni → niente azione incoerente col contesto.
  const _bs=(typeof hlBallState==="function")?hlBallState(sit):"feet";
  // giocata AEREA DELL'EROE = testa/rovesciata/sforbiciata/stacco/di petto, MA non quando l'eroe CROSSA per la testa di un COMPAGNO
  //   (in quel caso l'azione dell'eroe è un cross/passaggio a terra → coerente con palla non aerea).
  const _isAerialLbl=l=>(/\btesta\b|incornat|colpo di testa|\bstacco\b|rovesciat|sforbiciat|di petto/.test(l))&&!/compagn|cross|traversone|crossa|assist|servi|pennell/.test(l);
  const f=actions.filter(a=>{
    const lbl=(a.label||"").toLowerCase();
    if(_bs!=="aerial"&&_isAerialLbl(lbl))return false;// palla non aerea → via le giocate aeree
    if(a.rew!=="goal")return true;         // non-goal actions always available
    // 5.49.12 — niente CONCLUSIONI A RETE da distanza IRREALE ("siderale"): soglie di distanza realistiche per le azioni-gol.
    //   x cresce verso la porta avversaria (x=100). Aeree solo in area; tiro normale solo da ~34m e meno; tiro esplicito "da fuori" da ~38m e meno; mai da centrocampo/difesa.
    const isHead=lbl.includes("testa")||lbl.includes("incorn");
    const isAerial=isHead||/vol[eé]e|al volo|rovesciat|sforbiciat|girata al volo/.test(lbl);
    const isLong=/distanza|fuori area|da fuori|da lontano|bordata|mancino dai|destro dai/.test(lbl);
    if(isAerial){ if(px<73)return false; }      // colpo di testa / volée / rovesciata → solo in area
    else if(isLong){ if(px<62)return false; }   // tiro dalla distanza esplicito → da ~38m e meno, MAI da metà campo/difesa
    else { if(px<66)return false; }             // conclusione a rete normale → da ~34m e meno (niente tiri da distanza siderale)
    // TACT-4: prerequisito cross — richiede corsia laterale o posizione wide
    if(/cross|traversone/.test(lbl)){
      if(tactic?.lanes&&!tactic.lanes.includes("overlap_left")&&!tactic.lanes.includes("overlap_right"))return false;
    }
    // TACT-4: prerequisito filtrante — richiede corsia di profondità
    if(/filtrante|imbucata|verticale/.test(lbl)&&a.stat==="passaggio"){
      if(tactic?.lanes&&!tactic.lanes.includes("through_ball_lane"))return false;
    }
    // TACT-4: prerequisito dribbling — richiede avversario da superare
    if(/dribbl|sfida|supera/.test(lbl)&&a.stat==="dribbling"){
      if(tactic?.nearby_def===0)return false;
    }
    return true;
  });
  if(f.length>=2)return f;
  // fallback: garantisci ≥2 azioni, ma NON re-introdurre giocate AEREE su palla non aerea né CONCLUSIONI A RETE da metà campo/difesa (px<58) — coerenza prioritaria
  const _pool=actions.filter(a=>{const l=(a.label||"").toLowerCase();if(_bs!=="aerial"&&_isAerialLbl(l))return false;if(a.rew==="goal"&&px<58)return false;return true;});
  if(f.length===1){const extra=_pool.find(a=>a!==f[0])||actions.find(a=>a!==f[0]);return extra?[f[0],extra]:f;}
  return (_pool.length>=2?_pool:(f.length?f:_pool.length?_pool:actions)).slice(-2);
}
// TACT-MM (4.80.0): movement cap interamente data-driven da sit.tactic.pressure.
// Tutte le SITUATIONS (185/185) e i CHAIN_SITS sono annotati; l'euristica testuale
// di fallback è stata rimossa. Il default copre "none" e ogni edge senza tactic.
function cappedMM(sit){
  if(!sit||sit.lockMovement)return 0;
  switch(sit.tactic?.pressure){
    case "high":   return 0;
    case "medium": return 1;
    case "low":    return 2;
    default:       return sit.maxMoves??2; // "none" o tactic assente
  }
}
// 5.49.0 — item 3: il CURSORE DIREZIONALE (DPad di movimento) non deve comparire negli highlight DENTRO l'area di rigore,
//   tranne sui RIGORI (dove l'aim resta). Un highlight in area = conclusione: si sceglie subito, niente passo di movimento.
function isPenaltySit(sit){return !!(sit&&(sit.intent!=null?sit.intent==="penalty":/rigore|dischetto|\bpenalty\b/i.test(sit.text||"")));}/* [6.3.2 R1a] intent = sorgente primaria (equivalenza verificata 0 divergenze su 179); regex solo per oggetti senza intent */
function inBoxHL(sit){if(!sit)return false;const z=sit.zones&&sit.zones[0];const sz=sit.startZone;const sx=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:null;return z==="area"||(sx!=null&&sx>=80);}
function hideDirCursor(sit){return inBoxHL(sit)&&!isPenaltySit(sit);}
/* [6.38.0 collaudo PO] il GRIGLIA di mira a 6 celle (Alto/Basso × SX/CTR/DX + handleRigore) è un minigame
   da SET-PIECE: appare SOLO per i RIGORI e — al massimo — per le PUNIZIONI. Prima usciva per OGNI situation
   con lockMovement=true (es. la rovesciata sul cross alto, intent="insertion") → cursori direzionali + scoring
   da rigore su un'azione che NON è un set-piece. Ora quelle situazioni cadono sui normali bottoni azione. */
function isAimSit(sit){
  if(!sit)return false;
  if(isPenaltySit(sit))return true;
  // [7.8.9 collaudo PO «azioni a catena dove alla prima il pallone entra in porta erroneamente»] la GRIGLIA DI
  //   MIRA (minigioco di TIRO, handleRigore) è per i RIGORI e le punizioni DA TIRO DIRETTO (azione primaria =
  //   conclusione, rew "goal"). Le punizioni di CONSEGNA (cross / palla in area / indirette: azione primaria =
  //   assist) usavano comunque il minigioco → handleRigore le risolveva come un TIRO DIRETTO che ENTRAVA IN PORTA,
  //   invece di consegnare in area e far decidere il gol alla CATENA aerea. Ora quelle usano i BOTTONI normali →
  //   handleAction (consegna→chance→stacco di testa), niente più falso gol sulla battuta.
  if(sit.intent==="freekick")return !!(sit.actions&&sit.actions[0]&&sit.actions[0].rew==="goal");
  return false;
}

/* ============================================================================
   [7.51.0 SET-PIECE 2.0 — direttiva PO «via il cursore: scelte tattiche»]
   Rigori e punizioni dirette NON si mirano più con la griglia: il giocatore
   sceglie LO STILE D'ESECUZIONE (come ogni altra azione) e il motore decide
   l'esito da statistiche (curva NON lineare), pressione psicologica del
   contesto (minuto/punteggio/importanza/decisivo — la mentalità la smorza),
   profilo del PORTIERE (riflessi/piazzamento/intuizione/freddezza/esperienza,
   seedato dal prestigio avversario) e rischio della scelta. Nessuna scelta è
   dominante: precisa = specchio quasi garantito ma il grande portiere ci
   arriva · potente = imprendibile ma l'errore sale · incrocio = imparabile
   nello specchio ma palo/fuori dietro l'angolo · cucchiaio (solo per chi ha
   tecnica+freddezza) = bluff puro sul portiere. Tutto SEEDATO/deterministico.
   Il gate resta sul contratto storico (__CPM_RESOLVE → handleAction sulle
   azioni statiche della situation) → percorso di validazione INVARIATO.     */
const SP_PEN=[
 {id:"pen_precise",icon:"🎯",label:"Tiro angolato e preciso",desc:"D'interno, rasoterra sull'angolo: quasi sempre nello specchio — ma un grande portiere può arrivarci.",w:{tecnica:0.40,tiro:0.25,"mentalità":0.35},err:0.055,post:0.30,sv0:0.16,svGk:0.17,nrg:7},
 {id:"pen_power",icon:"💥",label:"Tiro potente",desc:"Di collo pieno, forte e teso: difficilissimo da trattenere — ma il rischio di sbagliare mira sale.",w:{tiro:0.45,fisico:0.20,"mentalità":0.35},err:0.165,post:0.30,sv0:0.115,svGk:0.12,nrg:8},
 {id:"pen_top",icon:"🚀",label:"Potente all'incrocio",desc:"La sassata sotto l'incrocio: se esce bene è imparabile — palo, traversa e fuori dietro l'angolo.",w:{tecnica:0.35,tiro:0.35,"mentalità":0.30},err:0.26,post:0.42,sv0:0.03,svGk:0.05,nrg:9},
 {id:"pen_chip",icon:"🥄",label:"Cucchiaio",desc:"Lo scavetto di chi ha ghiaccio nelle vene: o gloria o figuraccia.",w:{tecnica:0.45,"mentalità":0.45,dribbling:0.10},err:0.10,post:0.10,chip:true,nrg:6,req:{tecnica:76,"mentalità":72}},
];
const SP_FK_NEAR=[
 {id:"fk_curl",icon:"🌀",label:"Giro sopra la barriera",desc:"A scavalcare il muro, verso l'angolo alto: la classica dello specialista.",w:{tecnica:0.50,tiro:0.20,"mentalità":0.30},err:0.20,post:0.34,sv0:0.30,svGk:0.22,nrg:8},
 {id:"fk_power",icon:"💥",label:"Bordata potente",desc:"Dritta e fortissima, anche attraverso la barriera: il portiere può solo respingere.",w:{tiro:0.50,fisico:0.20,"mentalità":0.30},err:0.30,post:0.26,sv0:0.24,svGk:0.18,nrg:9},
 {id:"fk_under",icon:"⚡",label:"Rasoterra sotto la barriera",desc:"Il colpo furbo: se il muro salta, passa sotto. Serve tempismo e faccia tosta.",w:{tecnica:0.35,posizionamento:0.30,"mentalità":0.35},err:0.24,post:0.14,sv0:0.34,svGk:0.16,nrg:7},
];
const SP_FK_FAR=[
 {id:"fk_far",icon:"🚀",label:"Tiro potente dalla distanza",desc:"La conclusione da lontano che sorprende tutti: serve una botta vera.",w:{tiro:0.55,fisico:0.20,"mentalità":0.25},err:0.34,post:0.22,sv0:0.34,svGk:0.18,nrg:9},
 {id:"fk_soft",icon:"🎈",label:"Palla morbida sul secondo palo",desc:"Scende sul palo lontano, tra il tiro e il cross: il portiere deve scegliere.",w:{tecnica:0.45,passaggio:0.30,"mentalità":0.25},err:0.26,post:0.18,sv0:0.38,svGk:0.14,nrg:8},
];
function spSkill(attrs,w){let S=0,T=0;for(const k in w){S+=((attrs&&attrs[k])||55)*w[k];T+=w[k];}S=T>0?S/T:55;const sk=clamp((S-42)/50,0,1);return sk*sk*(3-2*sk);}/* smoothstep: il fuoriclasse si SENTE, il mediocre pure */
function spGk(prestige,seed){const s=(seed>>>0)||1;const r=n=>{const v=(Math.imul((s+Math.imul(n,2654435761))>>>0,1664525)+1013904223)>>>0;return v/4294967296;};
  const base=clamp(46+(prestige||60)*0.42,48,88);
  const g={riflessi:clamp(base+(r(1)-0.5)*14,45,94),piazzamento:clamp(base+(r(2)-0.5)*14,45,94),intuizione:clamp(base+(r(3)-0.5)*16,42,94),freddezza:clamp(base+(r(4)-0.5)*14,45,94),esperienza:clamp(base+(r(5)-0.5)*18,40,94)};
  g.q=clamp(((g.riflessi*0.34+g.piazzamento*0.22+g.intuizione*0.20+g.freddezza*0.12+g.esperienza*0.12)-48)/44,0,1);return g;}
function spPressure(c){c=c||{};let p=0;
  if((c.clock||0)>=80)p+=0.30;else if((c.clock||0)>=60)p+=0.12;
  if(Math.abs(c.scoreDiff||0)<=1)p+=0.18;
  p+=clamp(((c.mw||5)-5)/10,0,0.30);
  if(c.derby)p+=0.10;if(c.decisive)p+=0.25;
  p+=clamp((60-(c.morale!=null?c.morale:60))/160,-0.10,0.20);
  p+=clamp((68-(c.form!=null?c.form:70))/220,-0.08,0.14);
  const cold=clamp((((c.attrs&&c.attrs["mentalità"])||55)-52)/64,0,0.78);/* la freddezza smorza la pressione */
  return clamp(p,0,1)*(1-cold);}
function setPieceChoices(kind,attrs){
  if(kind==="penalty")return SP_PEN.filter(c=>!c.req||Object.keys(c.req).every(k=>((attrs&&attrs[k])||0)>=c.req[k]));
  return kind==="fk_far"?SP_FK_FAR:SP_FK_NEAR;}
function resolveSetPieceShot(kind,choice,ctx){
  ctx=ctx||{};const seed=(ctx.seed>>>0)||1;const rr=n=>{const v=(Math.imul((seed+Math.imul(n,0x9e3779b9))>>>0,1664525)+1013904223)>>>0;return v/4294967296;};
  const sk=spSkill(ctx.attrs,choice.w),gk=spGk(ctx.oppPrestige,(seed^0x51ed270b)>>>0),pr=spPressure({...ctx});
  const fat=clamp((ctx.fatigue||0)/140,0,0.5),isPen=kind==="penalty";
  let pErr=choice.err*(1.30-sk)*(1+0.85*pr+0.5*fat);if(!isPen)pErr=Math.min(0.55,pErr*1.25);
  let pSave,chipStay=false;
  if(choice.chip){const stay=clamp(0.14+gk.q*0.30-sk*0.16,0.06,0.44);chipStay=rr(3)<stay;pSave=chipStay?0.86:0.05;
    choice._svEV=stay*0.86+(1-stay)*0.05;}
  else{pSave=clamp((choice.sv0||0.14)+(choice.svGk||0.15)*gk.q-sk*0.10+pr*0.06,0.02,0.72);choice._svEV=pSave;
    if(!isPen)pSave=clamp(pSave*1.35+0.10,0.10,0.80);}
  const r1=rr(1),r2=rr(2);let outKind;
  if(r1<pErr)outKind=rr(4)<(choice.post||0.3)?"post":"wide";
  else if(r2<pSave)outKind="saved";
  else outKind="goal";
  const dirs=["tl","tc","tr","bl","bc","br"];const gkDir=dirs[Math.floor(rr(6)*6)%6];
  const pGoalEV=+(((1-pErr)*(1-(isPen||choice.chip?choice._svEV:clamp(choice._svEV*1.35+0.10,0.10,0.80))))).toFixed(3);
  return{outKind,ok:outKind==="goal",chipStay,skill:+sk.toFixed(3),gk,pressure:+pr.toFixed(3),pGoalEV,pErr:+pErr.toFixed(3),gkDir};}/* [7.999.3] pErr esposto: il motore decide il gol e poi, se sbaglia, fra errore di mira e parata nella stessa proporzione */
function pickSetPieceChoiceAI(kind,attrs,ctx,seed){
  const list=setPieceChoices(kind,attrs);const s=(seed>>>0)||1;let best=list[0],bv=-1;
  for(let i=0;i<list.length;i++){const c=list[i];
    const r=resolveSetPieceShot(kind,c,{...(ctx||{}),attrs,seed:(s+i*97)>>>0});
    let v=r.pGoalEV+(spSkill(attrs,c.w)-0.5)*0.10;
    if(((ctx&&ctx.scoreDiff)||0)<0&&((ctx&&ctx.clock)||0)>=75)v+=(c.err||0)*0.25;/* sotto nel finale: rischio accettabile più alto */
    v+=((Math.imul((s+Math.imul(i+11,2654435761))>>>0,1664525)>>>9)%97)/2400;/* personalità implicita seedata */
    if(v>bv){bv=v;best=c;}}
  return best;}
function setPieceOptions(sit,player,px){
  const attrs=(player&&player.stats)||{};
  if(isPenaltySit(sit))return setPieceChoices("penalty",attrs).map(c=>({...c,kind:"shot",spKind:"penalty"}));
  const far=(px!=null?px:66)<64;/* battuta reale: sotto x64 è "distante" */
  const base=setPieceChoices(far?"fk_far":"fk_near",attrs).map(c=>({...c,kind:"shot",spKind:far?"fk_far":"fk_near"}));
  const del=(sit&&sit.actions||[]).find(a=>a&&a.rew==="assist");
  if(del)base.push({id:"fk_delivery",kind:"delivery",act:del,icon:"↗️",label:del.label,desc:far?"Palla in area per lo stacco: la decide il compagno.":"La mira è sul compagno, non sulla porta.",nrg:del.nrg||7});
  return base;}
if(typeof window!=='undefined'){window.__CPM_SP={setPieceChoices,setPieceOptions,resolveSetPieceShot,pickSetPieceChoiceAI,spSkill,spGk,spPressure};}

/* [7.486.0 direttiva PO «inventa anche i telecronisti»] LE VOCI DELLA PARTITA. Una telecronaca ha due
   persone: chi racconta l'azione e chi la spiega. Sono INVENTATE — nomi, emittente e modi — perche' il
   gate di de-branding (`npm run audit-copyright`) vieta qualsiasi riferimento al mondo reale, e perche'
   una voce inventata puo' avere un carattere che una imitata non avrebbe.
   La coppia e' SEEDATA sulla partita (avversario + stagione + settimana): la stessa gara ha sempre gli
   stessi telecronisti, come un palinsesto vero, e non serve salvare nulla. */
const TELECRONISTI=[
  {v:"Corrado Bertelli",t:"Nadia Fracassi",em:"Korward Sport",st:"pacato"},
  {v:"Silvio Maraldi",t:"Bruno Cascioli",em:"Rete Elite",st:"caldo"},
  {v:"Gloria Sanfilippo",t:"Remo Vitaliani",em:"Korward Sport",st:"tecnico"},
  {v:"Ettore Lombrassa",t:"Wanda Trevisiol",em:"Canale Nord",st:"caldo"},
  {v:"Damiano Ferrucci",t:"Ilaria Bonomelli",em:"Rete Elite",st:"pacato"},
  {v:"Ninetta Ravasio",t:"Ugo Sartorello",em:"Canale Nord",st:"tecnico"}
];
/* [23/09 POC — domanda PO «Wanda Trevisiol e' una giornalista, la si vede mai? ha una sua figurina?»] chi e' donna fra le voci:
   serve alla figurina (volto femminile) accanto alla riga del commento tecnico. */
const TELECRONISTE_F23=new Set(["Nadia Fracassi","Gloria Sanfilippo","Wanda Trevisiol","Ilaria Bonomelli","Ninetta Ravasio"]);
/* Il commento tecnico non racconta l'azione — la LEGGE. Esce di rado, e solo dopo che la voce principale
   ha parlato: e' la seconda voce di una telecronaca, non una riga di cronaca in piu'. */
/* [7.882.0 — LA SECONDA VOCE SI RIPETE. MISURATO sulle quattro partite della scheda n° 13: 61 battute
   del commento tecnico e 13 frasi diverse in tutto; dentro UNA partita 14-16 battute per 8-11 frasi
   (57-69 % diverse) e la piu' ripetuta detta 3-4 volte. Due cause, ed entrambe qui sotto o accanto:
   il repertorio era di TRE frasi per situazione, e la scelta era un hash senza memoria di cio' che la
   voce aveva appena detto. Qui il repertorio raddoppia (3 -> 6); la memoria e' in 15-live-match. */
const COMMENTO_TECNICO={
  /* [7.885.0 — LA SECONDA VOCE NON PUO' ELOGIARE CIO' CHE NON E' SUCCESSO.
     VISTO nella scheda n° 14 (Moretti, 15'): «💥 Colombo ci prova da lontanissimo!» e subito sotto
     «🎧 Bruno Cascioli: Cross col contagiri, difficile fare meglio.» L'azione era un TIRO DA FUORI e la
     seconda voce ha elogiato un CROSS che non esisteva. La causa: la frase si pesca per ZONA (ev.pd),
     non per cio' che e' accaduto, quindi il repertorio di `wide_right` nomina il cross anche dopo un
     tiro. E' una bugia del gioco, del tipo che il PO riconosce a colpo d'occhio.
     Rimedio: le frasi che PRESUPPONGONO un gesto lo dichiarano in `se`, e la scelta le scarta quando
     quel gesto non c'e' stato. Le frasi neutre (stringhe semplici) restano sempre disponibili, cosi'
     la voce non ammutolisce mai. */
  attack:["Bella l'ampiezza, la squadra si allarga bene.","Qui la differenza la fa il tempo dell'inserimento.","Attenzione al terzo uomo, è lì che si apre.","Il difensore è girato: basta attaccargli la spalla.","Stanno uno contro uno dietro, è un rischio che si prendono.",{t:"Quel movimento chiede palla subito, non dopo.",se:"pass"}],
  attack_goal:["Su questa palla bisogna crederci sempre.",{t:"Il movimento è giusto: da lì conta il tocco, non la forza.",se:"shot"},"In area serve freddezza, non forza.","Dentro l'area il primo tocco decide tutto.",{t:"Il portiere ha coperto il palo, restava l'altro.",se:"save"},{t:"Un metro prima o un metro dopo, lì cambia tutto.",se:"shot"}],
  wide_right:["La corsia è libera, e loro non scalano.",{t:"Cross col contagiri, difficile fare meglio.",se:"cross"},"Il quinto sta salendo ogni volta: è una scelta.","Il terzino è rimasto solo: prima o poi la paghi.",{t:"Palla messa dietro il difensore, è quella giusta.",se:"cross"},"Da lì serve la testa alzata, non il cross e via."],
  midfield:["Si gioca tutto qui in mezzo, è una partita di reparti.","Il palleggio serve a far muovere loro, non la palla.","Ritmo basso, ma non è un male: si ordina la squadra.",{t:"Chi vince il secondo pallone qui, vince la partita.",se:"tackle"},"Manca l'uomo fra le linee: così si gira e basta.",{t:"Due tocchi in meno e si esce dalla pressione.",se:"pass"}],
  retreat:["Squadra corta, così si concede poco.",{t:"Bene la scalata, nessuno si fa saltare.",se:"tackle"},"Meglio rischiare la rimessa che la giocata.","Linea alta e tempi giusti: è lavoro di settimane.","Qui si riparte da dietro solo se sei sicuro.","Il reparto scivola insieme, non c'e' un buco."],
  defend_goal:["Qui conta solo spazzare, niente fronzoli.",{t:"Il portiere comanda la linea, si sente.",se:"save"},"Momento da soffrire, capita in ogni partita.","Primo palo coperto, è l'unica cosa che conta adesso.",{t:"Serve un fallo tattico, non un eroismo.",se:"tackle"},{t:"Se esci male su questa, è gol: meglio restare.",se:"save"}]
};
function pickTelecronisti(seed){const i=Math.abs(hashStr(String(seed||"x")))%TELECRONISTI.length;return TELECRONISTI[i];}
/* [7.999.147 PO-022 Passo 6, strato 1 — decisione PO 07/10 «Passo 6 completo»] LA SCENA NASCE DAL MOTORE: CONCLUSIONE.
   Prima il motore dichiarava l'occasione (tipo, zona, posizione, pressione, compagni liberi, cast) e il gioco cercava la
   scheda scritta piu' simile fra 16 pescate: la scena poteva promettere un compagno che non c'era, un 1 contro 1 con tre
   difensori addosso, una zona diversa da quella dove stava l'eroe. Qui la scena si COSTRUISCE dall'occasione, con la stessa
   fabbrica S() (intent, ballState, cine e `richiede` restano derivati come per le schede):
   - posizione: la zona di partenza contiene il punto del motore (niente clamp, l'eroe resta dov'e');
   - contesto: pressione e difensori vicini dalla pressione del motore; supporto dai compagni liberi; 1 contro 1 solo in area
     senza pressione;
   - opzioni: 3 dal registro qui sotto, tutte disegnabili (nessuna parola di GESTI_PROMESSI); l'assist solo se il motore ha
     un ricevente libero, e porta il suo nome; il pallonetto solo nell'1 contro 1; pesi dalle statistiche dell'eroe;
   - testo e intro: modelli con i nomi del cast. Scelta seminata (seed): la partita resta riproducibile.
   Rosso __CPM_NO_P6C (si torna alla scheda scritta). */
const P6_CONCLUSIONE=[
  {k:'potenza',l:'💥 Tiro di potenza',st:'tiro',b:-3,rew:'goal',fail:'miss',n:14,w:(c)=>1.2},
  {k:'piazzato',l:'🎯 Piazzato nell\'angolo basso',st:'tecnica',b:4,rew:'goal',fail:'miss',n:12,w:(c)=>c.press<1.5?1.4:0.9},
  {k:'giro',l:'🦵 Tiro a giro',st:'tecnica',b:2,rew:'goal',fail:'miss',n:13,w:(c)=>c.limite?1.4:0.7},
  {k:'prima',l:'⚡ Conclusione di prima',st:'tiro',b:0,rew:'goal',fail:'miss',n:12,w:(c)=>c.press>=1.5?1.3:0.6},
  {k:'finta',l:'🌀 Finta e tiro',st:'dribbling',b:0,rew:'goal',fail:'intercept',n:16,w:(c)=>c.press>=1?1.1:0.5},
  {k:'pallonetto',l:'🎯 Pallonetto sul portiere',st:'tecnica',b:-4,rew:'goal',fail:'miss_easy',n:10,w:(c)=>c.uno?1.5:0},
  {k:'assist',l:(c)=>'🤝 Servi '+c.ric+' libero',st:'passaggio',b:4,rew:'assist',fail:'intercept',n:8,w:(c)=>c.ric?1.3:0},
];
/* [7.999.148 Passo 6, strato 2] costruttore comune degli strati: posizione dal motore, pesi dalle statistiche, scelta seminata.
   Ogni strato porta il suo registro di opzioni, i suoi titoli e il suo contesto. Rosso globale __CPM_NO_P6 (tutti gli strati). */
function _p6Costruisci(occ,player,seed,REG,c,titoli,intro,zones,ctx,tipo){
  let h=(seed>>>0)||1;const rnd=()=>{h=(Math.imul(h^(h>>>15),2246822507)+0x9e3779b9)>>>0;return (h>>>8)/16777216;};
  const stat=(k)=>{try{return +((player&&player.stats&&player.stats[k])||60);}catch(_e){return 60;}};
  const pool=REG.map(t=>({t,w:t.w(c)*(0.6+stat(t.st)/100)})).filter(o=>o.w>0);
  const scelte=[];
  while(scelte.length<3&&pool.length){const tot=pool.reduce((a,o)=>a+o.w,0);let r=rnd()*tot,i=0;for(;i<pool.length-1;i++){r-=pool[i].w;if(r<=0)break;}
    scelte.push(pool[i].t);pool.splice(i,1);}
  if(scelte.length<2)return null;
  if(!(typeof window!=='undefined'&&(window.__CPM_NO_221||window.__CPM_NO_PASS221))&&!/^(difesa|rigore)$/.test(tipo||'')&&!scelte.some(t=>t.rew==='assist')){/* [7.999.156 PO-221, decisione PO 09/10] ogni scena offensiva offre almeno un'opzione di passaggio/assist: la piu' pesante disponibile prende il posto dell'ultima scelta (nessun sorteggio in piu') */
    const _c221=REG.filter(t=>t.rew==='assist'&&t.w(c)>0&&scelte.indexOf(t)<0).sort((a,b)=>b.w(c)-a.w(c));if(_c221.length)scelte[scelte.length-1]=_c221[0];}
  const actions=scelte.map(t=>A(typeof t.l==='function'?t.l(c):t.l,t.st,t.b,t.rew,t.fail,t.n));
  if(!(typeof window!=='undefined'&&window.__CPM_NO_GESTO220))actions.forEach((a,i)=>{if(a&&scelte[i]&&scelte[i].g)a.defGesto=scelte[i].g;});/* [7.999.155 PO-220 «l'eroe nelle scene difensive sembra fare una passeggiata»] il gesto difensivo lo dichiara la scena: chiusura, contrasto e raddoppio finivano nel ripiego «press» (sola locomozione). Rosso __CPM_NO_GESTO220 */
  const text=titoli[Math.floor(rnd()*titoli.length)%titoli.length];
  const x=+occ.x,y=+occ.y;
  const sz={x:[clamp(x-2,2,96),clamp(x+2,4,98)],y:[clamp(y-3,3,95),clamp(y+3,5,97)]};
  const mz={x:[clamp(x-8,2,90),clamp(x+8,10,98)],y:[clamp(y-12,3,85),clamp(y+12,15,97)]};
  const _man=_p6Manovra(occ);/* [7.999.150 strato 5] la manovra vera apre l'introduzione */
  const _pz=(tipo==='punizione'||tipo==='rigore');/* [7.999.153 strato 8a] il piazzato si batte da fermo */
  const s=S(text,zones,_pz?sz:mz,sz,actions,_pz,_pz?0:-1,_man?(_man.txt+' '+intro).trim():intro,tipo==='difesa'?'def':'off',null,ctx);/* [7.999.152] la scena difensiva nasce type def */
  s._p6=tipo;s._p6seed=seed>>>0;s._p6man=_man?_man.k:null;
  return s;
}
/* [7.999.150 PO-030/PO-022 Passo 6, strato 5] LA MANOVRA VERA APRE LA SCENA. Il motore consegna con l'occasione gli ultimi passaggi
   del possesso (preludio): qui diventano la prima frase della scena, coi nomi veri — uno-due (l'eroe la da' e la riceve dallo stesso
   compagno), giro a tre (A per B, B per l'eroe), oppure il passaggio che l'ha servito, col suo tipo. Se l'ultimo passaggio non arriva
   all'eroe (pallone recuperato o portato da solo) la scena non inventa niente. Rosso __CPM_NO_P6M. */
function _p6Manovra(occ){
  if(typeof window!=='undefined'&&window.__CPM_NO_P6M)return null;
  const P=(occ&&Array.isArray(occ.preludio))?occ.preludio:[];if(!P.length)return null;
  const nm=(p)=>(p&&p.nome)?String(p.nome).split(' ').slice(-1)[0]:'un compagno';
  const u=P[P.length-1];if(!u||!u.a||!u.a.eroe||!u.da||u.da.eroe)return null;
  const v=P.length>1?P[P.length-2]:null;
  if(v&&v.da&&v.da.eroe&&v.a&&v.a.i===u.da.i)return {k:'uno-due',txt:'Uno-due con '+nm(u.da)+': te la ridà.'};
  if(v&&v.a&&v.a.i===u.da.i&&v.da&&!v.da.eroe)return {k:'giro-a-tre',txt:nm(v.da)+' apre per '+nm(u.da)+', che ti serve.'};
  const tipi={lancio:'Lancio lungo di ',filtrante:'Filtrante di ',cambio:'Cambio di gioco di ',verticale:'Verticalizzazione di ',appoggio:'Appoggio di ',corto:'Passaggio corto di '};
  return {k:'servito',txt:(tipi[u.kind]||'Passaggio di ')+nm(u.da)+' per te.'};
}
function _p6Nomi(occ){const cast=occ.cast||{};const nm=(p)=>(p&&p.nome)?String(p.nome).split(' ').slice(-1)[0]:null;
  return {ric:((occ.liberi|0)>0)?nm(cast.ricevente):null,ricVicino:nm(cast.ricevente),dif:nm(cast.difensore),gk:nm(cast.portiere)};}
/* [7.999.148 PO-022 Passo 6, strato 2] SPALLE ALLA PORTA: occasione in area o al limite con pressione >= 3 (il motore la dichiara
   «spalle»). Con il marcatore addosso le giocate vere sono la girata, la protezione della palla con lo scarico al compagno, la
   sponda di prima, il fallo cercato resistendo alla carica; il tiro di potenza resta ma pesa poco. Il compagno citato e' il
   ricevente del motore: se non e' libero lo scarico resta (e' un appoggio corto), la sponda «per il compagno libero» no.
   Rosso __CPM_NO_P6S. */
const P6_SPALLE=[
  {k:'girata',l:'🔄 Girata secca e tiro',st:'tecnica',b:-2,rew:'goal',fail:'miss',n:14,w:(c)=>1.3},
  {k:'protegge',l:(c)=>'🛡️ Proteggi palla e scarica su '+(c.ricVicino||'un compagno'),st:'fisico',b:5,rew:'assist',fail:'intercept',n:10,w:(c)=>1.1},
  {k:'sponda',l:(c)=>'🤝 Sponda di prima per '+c.ric,st:'passaggio',b:3,rew:'assist',fail:'intercept',n:8,w:(c)=>c.ric?1.2:0},
  {k:'fallo',l:'😤 Resisti alla carica e cerca il fallo',st:'fisico',b:2,rew:'assist',fail:'intercept',n:9,w:(c)=>0.9},/* come «Dribbling provocatorio — il fallo c'è!» del catalogo: rew assist, falloCercato dal factory */
  {k:'potenza',l:'💥 Tiro di potenza di prima',st:'tiro',b:-6,rew:'goal',fail:'miss',n:14,w:(c)=>0.6},
];
function scenaDalMotoreSpalle(occ,player,seed){
  try{if(typeof window!=='undefined'&&(window.__CPM_NO_P6S||window.__CPM_NO_P6))return null;}catch(_e){}
  if(!occ||occ.tipo!=='spalle'||occ.x==null||occ.y==null)return null;
  const N=_p6Nomi(occ),limite=occ.zona==='limite';
  const c={press:+occ.press||0,limite,ric:N.ric,ricVicino:N.ricVicino};
  const titoli=[(N.dif?N.dif+' ti è addosso':'Il marcatore ti è addosso')+': spalle alla porta!','🧱 Spalle alla porta, marcatura stretta!'];
  const intro=N.ric?(N.ric+' si smarca per lo scarico.'):'Nessun compagno libero vicino: decidi tu.';
  const ctx={pressure:'high',support:Math.min(occ.liberi|0,3),nearby_def:2,lanes:[]};
  return _p6Costruisci(occ,player,seed,P6_SPALLE,c,titoli,intro,limite?['bordo','area']:['area'],ctx,'spalle');
}
/* [7.999.149 PO-022 Passo 6, strati 3-4] FASCIA e FRA LE LINEE nascono dall'occasione del motore (trequarti: esterno se il motore
   vede l'eroe a 22 o piu' dal centro, centrale altrimenti). Fascia: cross (primo palo, secondo palo, basso teso), fondo e cross,
   rientro e tiro, appoggio al compagno del cast. Fra le linee: filtrante solo per un compagno LIBERO del motore, uno-due col
   compagno piu' vicino, tiro da fuori, conduzione e tiro. Nessuna parola di GESTI_PROMESSI. Rossi __CPM_NO_P6F, __CPM_NO_P6L. */
const P6_FASCIA=[
  {k:'cross1',l:'↗️ Cross sul primo palo',st:'passaggio',b:2,rew:'assist',fail:'intercept',n:10,w:(c)=>1.1},
  {k:'cross2',l:'↗️ Cross sul secondo palo',st:'passaggio',b:0,rew:'assist',fail:'intercept',n:11,w:(c)=>1.1},
  {k:'teso',l:'⚡ Cross basso teso',st:'tecnica',b:1,rew:'assist',fail:'intercept',n:10,w:(c)=>c.press<2?1:0.7},
  {k:'fondo',l:'🌀 Dribbling sul fondo e cross',st:'dribbling',b:-2,rew:'assist',fail:'intercept',n:15,w:(c)=>c.press>=1?1:0.6},
  {k:'rientro',l:'🎯 Rientra e tira',st:'tecnica',b:-3,rew:'goal',fail:'miss',n:14,w:(c)=>0.8},
  {k:'appoggio',l:(c)=>'🤝 Appoggio corto per '+(c.ricVicino||'il compagno'),st:'passaggio',b:5,rew:'assist',fail:'intercept',n:7,w:(c)=>0.7},
];
const P6_LINEE=[
  {k:'filtrante',l:(c)=>'🎯 Filtrante per '+c.ric,st:'passaggio',b:2,rew:'assist',fail:'intercept',n:10,w:(c)=>c.ric?1.5:0},
  {k:'unodue',l:(c)=>'🔁 Uno-due con '+(c.ricVicino||'il compagno'),st:'passaggio',b:3,rew:'assist',fail:'intercept',n:9,w:(c)=>1},
  {k:'fuori',l:'💥 Tiro da fuori',st:'tiro',b:-6,rew:'goal',fail:'miss',n:14,w:(c)=>c.press<2?1:0.6},
  {k:'conduci',l:'🏃 Conduci palla al piede e tira',st:'velocità',b:-2,rew:'goal',fail:'intercept',n:16,w:(c)=>c.press<1.5?1:0.5},
  {k:'finta',l:'🌀 Finta e cambio di passo',st:'dribbling',b:0,rew:'assist',fail:'intercept',n:14,w:(c)=>c.press>=1?1:0.6},
];
function scenaDalMotoreFascia(occ,player,seed){
  try{if(typeof window!=='undefined'&&(window.__CPM_NO_P6F||window.__CPM_NO_P6))return null;}catch(_e){}
  if(!occ||occ.tipo!=='fascia'||occ.x==null||occ.y==null)return null;
  const N=_p6Nomi(occ);const c={press:+occ.press||0,ric:N.ric,ricVicino:N.ricVicino};
  const titoli=['↗️ Palla sulla fascia: metti in mezzo?','↗️ Sei sulla fascia, '+(N.dif?N.dif+' ti chiude':'il terzino ti chiude')+'!'];
  const intro=N.ric?(N.ric+' attacca l\'area.'):'In area c\'è poca gente: scegli bene.';
  const ctx={pressure:c.press>=1.5?'high':c.press>=0.5?'medium':'low',support:Math.min(occ.liberi|0,3),nearby_def:c.press>=1.5?2:1,lanes:['wing']};
  return _p6Costruisci(occ,player,seed,P6_FASCIA,c,titoli,intro,['fascia'],ctx,'fascia');
}
function scenaDalMotoreLinee(occ,player,seed){
  try{if(typeof window!=='undefined'&&(window.__CPM_NO_P6L||window.__CPM_NO_P6))return null;}catch(_e){}
  if(!occ||occ.tipo!=='fra-le-linee'||occ.x==null||occ.y==null)return null;
  const N=_p6Nomi(occ);const c={press:+occ.press||0,ric:N.ric,ricVicino:N.ricVicino};
  const titoli=['🧠 Ricevi fra le linee: hai spazio!','🧠 Fra le linee, '+(N.dif?N.dif+' esce in ritardo':'il mediano esce in ritardo')+'!'];
  const intro=N.ric?(N.ric+' taglia alle spalle della difesa.'):'Nessun taglio in profondità: valuta il tiro o il dai e vai.';
  const ctx={pressure:c.press>=1.5?'high':c.press>=0.5?'medium':'low',support:Math.min(occ.liberi|0,3),nearby_def:c.press>=1.5?2:1,lanes:['central_run']};
  return _p6Costruisci(occ,player,seed,P6_LINEE,c,titoli,intro,['trequarti'],ctx,'fra-le-linee');
}
/* [7.999.151 PO-022 Passo 6, strato 6] CROSS E ANGOLO NASCONO DALL'OCCASIONE DEL MOTORE. Il motore dichiara il cross (o l'angolo) destinato
   all'eroe con la sua origine: chi crossa e da dove. Prima la scena si pescava dall'intero catalogo fra le schede «aeree»; ora si
   costruisce: titolo col nome del crossatore vero, intento fissato a inserimento e pallone dichiarato alto (tactic.it/bs: il 3D non
   indovina dal testo), opzioni prese dalle azioni del catalogo che il 3D sa gia' disegnare (testa di potenza, testa piazzata, volee,
   controllo e tiro). Sull'angolo il titolo dice «calcio d'angolo», cosi' la palla parte dalla bandierina (ballAt corner). Nessun
   assist: sul cross il motore non dichiara compagni liberi (liberi 0). Rosso __CPM_NO_P6X. */
const P6_CROSS=[
  {k:'testa-potenza',l:'✈️ Testa di potenza',st:'fisico',b:6,rew:'goal',fail:'miss',n:16,w:(c)=>1.2},
  {k:'testa-angolo',l:'🎯 Testa piazzata all\'angolo',st:'fisico',b:4,rew:'goal',fail:'miss',n:13,w:(c)=>1.0},
  {k:'volee',l:'⚽ Volée di collo potente',st:'tiro',b:2,rew:'goal',fail:'miss',n:16,w:(c)=>c.angolo?0.6:1.0},
  {k:'controllo',l:'🎯 Controllo e tiro fermo',st:'tecnica',b:6,rew:'goal',fail:'miss',n:12,w:(c)=>c.angolo?0.3:(c.press>=1.5?0.5:1.0)},
];
function scenaDalMotoreCross(occ,player,seed){
  try{if(typeof window!=='undefined'&&(window.__CPM_NO_P6X||window.__CPM_NO_P6))return null;}catch(_e){}
  if(!occ||(occ.tipo!=='cross'&&occ.tipo!=='angolo')||occ.x==null||occ.y==null)return null;
  const angolo=occ.tipo==='angolo';const cast=occ.cast||{};
  const nm=(p)=>(p&&p.nome)?String(p.nome).split(' ').slice(-1)[0]:null;
  const cr=nm(cast.crossatore)||nm(occ.origine&&occ.origine.chi);const dif=nm(cast.difensore);
  const c={press:+occ.press||0,angolo};
  const titoli=angolo?['🚩 Calcio d\'angolo'+(cr?' di '+cr:'')+': attacca il pallone!','🚩 Calcio d\'angolo: il pallone spiove in area!']
                     :['✈️ Cross'+(cr?' di '+cr:'')+': attacca il pallone in area!','✈️ Il cross'+(cr?' di '+cr:'')+' arriva alto in area!'];
  const intro=dif?(dif+' ti marca stretto.'):'Sei solo sul pallone: scegli bene.';
  const ctx={pressure:c.press>=1.5?'high':c.press>=0.5?'medium':'low',support:1,nearby_def:dif?2:1,lanes:['central_run'],it:'insertion',bs:'aerial'};
  return _p6Costruisci(occ,player,seed,P6_CROSS,c,titoli,intro,['area'],ctx,angolo?'angolo':'cross');
}
/* [7.999.152 PO-022 Passo 6, strato 7 — decisione PO 08/10: al massimo una scena difensiva a partita, in aggiunta] LA DIFESA NASCE
   DALL'OCCASIONE DEL MOTORE. Il motore dichiara la prima volta che il portatore avversario arriva entro 4 u dall'eroe (pressing alto,
   quasi sempre nella meta' campo avversaria): la scena e' difensiva (type def, pallone all'avversario), nomina il portatore vero e
   offre azioni difensive che il catalogo usa gia' (chiusura, contrasto pulito, scivolata, anticipo, raddoppio). L'esito lo racconta il
   motore (contrasto riuscito, oppure l'avversario la scampa e prosegue). Rosso __CPM_NO_P6D. */
const P6_DIFESA=[
  {k:'chiusura',g:'lunge',l:'🛑 Chiusura immediata',st:'velocità',b:8,rew:'recovery',fail:'through',n:20,w:(c)=>1.2},
  {k:'contrasto',g:'lunge',l:'💪 Contrasto pulito senza fallo',st:'fisico',b:3,rew:'recovery',fail:'foul',n:14,w:(c)=>1.0},
  {k:'scivolata',g:'slide',l:'🛡️ Scivolata netta',st:'fisico',b:6,rew:'recovery',fail:'foul',n:16,w:(c)=>c.press>=2?1.0:0.6},
  {k:'anticipo',g:'lunge',l:'🧠 Anticipa sul primo controllo',st:'mentalità',b:7,rew:'recovery',fail:'through',n:12,w:(c)=>1.0},
  {k:'raddoppio',g:'lunge',l:'🤼 Raddoppio coordinato col compagno',st:'tecnica',b:6,rew:'recovery',fail:'through',n:14,w:(c)=>c.press>=1?0.8:0.3},
];
function scenaDalMotoreDifesa(occ,player,seed){
  try{if(typeof window!=='undefined'&&(window.__CPM_NO_P6D||window.__CPM_NO_P6))return null;}catch(_e){}
  if(!occ||occ.tipo!=='difesa'||occ.x==null||occ.y==null)return null;
  const cast=occ.cast||{};const nm=(p)=>(p&&p.nome)?String(p.nome).split(' ').slice(-1)[0]:null;
  const av=nm(cast.portatore)||nm(cast.difensore);const x=+occ.x;
  const c={press:+occ.press||0};
  const titoli=x>=60?['🔥 Pressing alto su '+(av||'il portatore')+': riconquista palla!','🔥 '+(av||'Il loro portatore')+' esce palla al piede: aggredisci!']
                    :['🛡️ '+(av||'Il portatore')+' ti punta a centrocampo: fermalo!','🛡️ Ripiegamento: '+(av||'il portatore')+' prova a ripartire!'];
  const intro='Sei il più vicino: tocca a te.';
  const zones=x>=67?['trequarti']:x>=45?['centro']:['propria'];
  const ctx={pressure:c.press>=1.5?'high':c.press>=0.5?'medium':'low',support:1,nearby_def:1,lanes:[]};
  return _p6Costruisci(occ,player,seed,P6_DIFESA,c,titoli,intro,zones,ctx,'difesa');
}
/* [7.999.153 PO-022 Passo 6, strato 8a — decisione PO 08/10: prima i piazzati, poi la chiusura] RIGORE E PUNIZIONE NASCONO
   DALL'OCCASIONE DEL MOTORE. Misurato: rigori e punizioni erano il 29% delle azioni dell'eroe (11 su 38 in 4 partite vere) e venivano
   tutti dal catalogo (schedePiazzato: 3 schede di punizione diretta). Ora la punizione parte dal punto vero del fallo dichiarato dal
   motore, il titolo dice la distanza e il portiere vero, le opzioni pesano la geometria (vicina e centrale: giro, botta, curva;
   lontana o defilata: palla in area); il rigore e' sul dischetto col portiere vero. Azioni del catalogo, gia' disegnate dal 3D.
   Movimento bloccato come nelle schede. Rosso __CPM_NO_P6P. */
const P6_PUNIZIONE=[
  {k:'giro',l:'🎯 Punizione a giro',st:'tiro',b:8,rew:'goal',fail:'miss',n:10,w:(c)=>c.vicina&&c.centrale?1.4:c.vicina?0.9:0.3},
  {k:'botta',l:'💥 Botta sopra la barriera',st:'tiro',b:6,rew:'goal',fail:'miss',n:13,w:(c)=>c.vicina?1.1:0.5},
  {k:'curva',l:'📐 Curva a rientrare',st:'tiro',b:8,rew:'goal',fail:'miss',n:12,w:(c)=>c.centrale?1.0:0.5},
  {k:'rasoterra',l:'💥 Tiro rasoterra',st:'tiro',b:4,rew:'goal',fail:'miss',n:10,w:(c)=>c.vicina?0.7:0.3},
  {k:'area',l:'↗️ Palla in area',st:'passaggio',b:5,rew:'assist',fail:'miss',n:8,w:(c)=>(!c.vicina||!c.centrale)?1.4:0.5},
];
const P6_RIGORE=[
  {k:'angolato',l:'💥 Angolato rasoterra',st:'tiro',b:10,rew:'goal',fail:'miss',n:10,w:(c)=>1.2},
  {k:'potenza',l:'💥 Angolo basso — potenza',st:'tiro',b:12,rew:'goal',fail:'miss_easy',n:10,w:(c)=>1.0},
  {k:'centro',l:'⚡ Centro-alto',st:'tiro',b:5,rew:'goal',fail:'miss',n:10,w:(c)=>0.9},
  {k:'cucchiaio',l:'🎯 Cucchiaio',st:'tecnica',b:-4,rew:'goal',fail:'miss_easy',n:8,w:(c)=>0.5},
];
function scenaDalMotorePiazzato(occ,player,seed){
  try{if(typeof window!=='undefined'&&(window.__CPM_NO_P6P||window.__CPM_NO_P6))return null;}catch(_e){}
  if(!occ||(occ.tipo!=='punizione'&&occ.tipo!=='rigore'))return null;
  const cast=occ.cast||{};const nm=(p)=>(p&&p.nome)?String(p.nome).split(' ').slice(-1)[0]:null;const gk=nm(cast.portiere);
  if(occ.tipo==='rigore'){
    const o2=Object.assign({},occ,{x:88.5,y:50});
    const titoli=['🔴 RIGORE! Sul dischetto.','🔴 RIGORE per noi! Il pallone è tuo.'];
    const intro=gk?(gk+' si muove sulla linea. Solo tu e lui.'):'Tutto fermo. Solo tu e il portiere.';
    return _p6Costruisci(o2,player,seed,P6_RIGORE,{},titoli,intro,['area'],{pressure:'none',support:0,nearby_def:0,lanes:[]},'rigore');}
  if(occ.x==null||occ.y==null)return null;
  const x=+occ.x,y=+occ.y;const m=Math.round(Math.hypot(100-x,50-y)*1.05);const c={vicina:m<=27,centrale:Math.abs(y-50)<=12};
  if(x<62)return null;/* da troppo lontano non e' una punizione da scena */
  const titoli=['📐 Punizione a '+m+' metri'+(gk?': '+gk+' sistema la barriera!':'!'),'📐 Punizione dal limite, '+m+' metri: tocca a te!'];
  const intro=c.vicina&&c.centrale?'Posizione ideale per calciare in porta.':'Da qui anche il pallone in area è un\'idea.';
  return _p6Costruisci(occ,player,seed,P6_PUNIZIONE,c,titoli,intro,x>=78?['bordo']:['trequarti'],{pressure:'none',support:1,nearby_def:0,lanes:[]},'punizione');
}
function scenaDalMotore(occ,player,seed){
  try{if(typeof window!=='undefined'&&window.__CPM_NO_P6)return null;}catch(_e){}
  if(!occ)return null;
  if(occ.tipo==='conclusione')return scenaDalMotoreConclusione(occ,player,seed);
  if(occ.tipo==='spalle')return scenaDalMotoreSpalle(occ,player,seed);
  if(occ.tipo==='fascia')return scenaDalMotoreFascia(occ,player,seed);
  if(occ.tipo==='fra-le-linee')return scenaDalMotoreLinee(occ,player,seed);
  if(occ.tipo==='cross'||occ.tipo==='angolo')return scenaDalMotoreCross(occ,player,seed);
  if(occ.tipo==='difesa')return scenaDalMotoreDifesa(occ,player,seed);
  if(occ.tipo==='punizione'||occ.tipo==='rigore')return scenaDalMotorePiazzato(occ,player,seed);
  return null;
}
function scenaDalMotoreConclusione(occ,player,seed){
  try{if(typeof window!=='undefined'&&(window.__CPM_NO_P6C||window.__CPM_NO_P6))return null;}catch(_e){}
  if(!occ||occ.tipo!=='conclusione'||occ.x==null||occ.y==null)return null;
  const x=+occ.x,y=+occ.y,press=+occ.press||0,limite=occ.zona==='limite';
  const cast=occ.cast||{};const nm=(p)=>(p&&p.nome)?String(p.nome).split(' ').slice(-1)[0]:null;
  const ric=((occ.liberi|0)>0)?nm(cast.ricevente):null,dif=nm(cast.difensore),gk=nm(cast.portiere);
  const uno=!limite&&press<1;
  const c={press,limite,uno,ric};
  let h=(seed>>>0)||1;const rnd=()=>{h=(Math.imul(h^(h>>>15),2246822507)+0x9e3779b9)>>>0;return (h>>>8)/16777216;};
  const stat=(k)=>{try{return +((player&&player.stats&&player.stats[k])||60);}catch(_e){return 60;}};
  const pool=P6_CONCLUSIONE.map(t=>({t,w:t.w(c)*(0.6+stat(t.st)/100)})).filter(o=>o.w>0);
  const scelte=[];
  while(scelte.length<3&&pool.length){const tot=pool.reduce((a,o)=>a+o.w,0);let r=rnd()*tot,i=0;for(;i<pool.length-1;i++){r-=pool[i].w;if(r<=0)break;}
    scelte.push(pool[i].t);pool.splice(i,1);}
  if(!scelte.some(t=>t.rew==='goal'))return null;
  const actions=scelte.map(t=>A(typeof t.l==='function'?t.l(c):t.l,t.st,t.b,t.rew,t.fail,t.n));
  const TIT=uno?['⚡ Solo davanti a '+(gk||'al portiere')+'!','⚡ Hai solo il portiere davanti!']
    :limite?['💥 Spazio per il tiro dal limite!','💥 Palla buona al limite dell\'area!']
    :press>=1.5?['🎯 Palla in area, '+(dif||'il difensore')+' addosso!','🎯 In area con il marcatore alle costole!']
    :['🎯 Palla buona in area!','🎯 Pallone giusto in area: è il momento!'];
  const text=TIT[Math.floor(rnd()*TIT.length)%TIT.length];
  const intro=ric?(ric+' è libero sul secondo palo.'):(dif?(dif+' prova a chiudere.'):'');
  const sz={x:[clamp(x-2,2,96),clamp(x+2,4,98)],y:[clamp(y-3,3,95),clamp(y+3,5,97)]};
  const mz={x:[clamp(x-8,2,90),clamp(x+8,10,98)],y:[clamp(y-12,3,85),clamp(y+12,15,97)]};
  const ctx={pressure:press>=1.5?'high':press>=0.5?'medium':'low',support:Math.min(occ.liberi|0,3),nearby_def:press>=1.5?2:press>=0.5?1:0,lanes:['central_run'],cn:uno?{oneOnOne:true}:undefined};
  const s=S(text,limite?['bordo','area']:['area'],mz,sz,actions,false,-1,intro,'off',null,ctx);
  s._p6='conclusione';s._p6seed=seed>>>0;
  return s;
}
