/* ========================================================================
 * KORWARD ELITE — frammento n° 14  (dei 21, numerati da 00 a 20)
 * src/14-motore-possesso.jsx
 *
 * IL MOTORE DEL POSSESSO — la simulazione del gioco ambientale
 *
 * Direttiva PO 10/09 («hai carta bianca, puoi anche ricominciare da zero ed
 * eseguire una vera ristrutturazione» · «l'obiettivo e' rilasciare un gioco
 * CREDIBILE, DIVERTENTE, IMMERSIVO, REALISTICO»).
 *
 * PRINCIPIO: prima la simulazione, poi le parole. Qui vive UNO STATO SOLO del
 * pallone e dei ventidue: chi ha la palla, dove va, in che fase. Il motore
 * decide (conduce, passa, tira, perde, fischia) ed EMETTE EVENTI con nomi e
 * luoghi veri; la telecronaca li racconta a valle. Nessun altro scrive la
 * posizione del pallone durante il gioco vivo.
 *
 * E' JavaScript puro, deterministico (seme), senza React e senza DOM: si
 * collauda in node (tests/visual/test/logic/motore-possesso.test.mjs).
 *
 * Coordinate: campo 0-100 x 0-100; la squadra di casa attacca verso x=100,
 * gli ospiti verso x=0. Porta fra y 45 e 55. Un tick = un tocco (~1,7 s).
 *
 * Indici: 0-9 casa (0 portiere), 10-20 ospiti (10 portiere), 21 l'eroe (casa).
 * ----------------------------------------------------------------------
 * Le frasi della cronaca NON stanno qui: qui ci sono solo fatti.
 * ======================================================================== */
/* CMAV-SRC-HEADER-END */
function creaMotorePossesso(cfg){
  cfg=cfg||{};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hyp=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
  let _s=(((cfg.seed|0)>>>0)||7)>>>0;
  /* [22/09 testimone · sola lettura] QUANTI SORTEGGI CONSUMA IL MOTORE IN OGNI MINUTO. Il flusso e' CON
     STATO (LCG seedato alla costruzione): se in un giro un ramo consuma un sorteggio in piu', tutta la
     partita che segue e' un'altra partita. La sonda `prima-divergenza` accende `window.__CPM_RND14`. */
  const rnd=()=>{if(typeof window!=='undefined'&&window.__CPM_RND14){try{const _m=(S&&S.min)|0;window.__CPM_RND14[_m]=(window.__CPM_RND14[_m]|0)+1;}catch(_e14){}}_s=(Math.imul(_s,1664525)+1013904223)>>>0;return _s/4294967296;};
  const seme32=()=>(Math.floor(rnd()*4294967295)>>>0)||1;
  const decidi=(typeof cfg.decidi==='function')?cfg.decidi:((typeof decideExecution==='function')?decideExecution:null);
  const GOAL_Y0=45,GOAL_Y1=55;
  const HOME='home',AWAY='away';
  const altro=(l)=>l===HOME?AWAY:HOME;
  const dirDi=(l)=>l===HOME?1:-1;
  const advDi=(x,l)=>l===HOME?x:100-x;
  const xDa=(adv,l)=>l===HOME?adv:100-adv;
  const zonaDi=(adv,y)=>(adv>=84&&Math.abs(y-50)<=22)?"area":adv>=70?"limite":adv>=56?"trequarti":adv>=34?"centro":"dietro";

  /* ---------- i ventidue ---------- */
  const g=(cfg.giocatori||[]).map((p,i)=>({i,team:p.team===AWAY?AWAY:HOME,gk:!!p.gk,name:String(p.name||""),rl:String(p.rl||""),x:clamp(+p.x||50,2,98),y:clamp(+p.y||50,3,97),eroe:false}));
  while(g.length<21){const i=g.length;g.push({i,team:i<10?HOME:AWAY,gk:(i===0||i===10),name:"",rl:"",x:i<10?30:70,y:50,eroe:false});}
  /* [7.874] i ruoli dal campo: il live match passa i ventidue senza `rl` (matchPlayers non lo porta), e tutte le regole per ruolo (punte al limite, difensori che restano, battitore del rigore) erano lettera morta in browser. Se manca, il ruolo si legge dalla posizione di partenza: i quattro piu' arretrati DF, i tre seguenti MF, gli altri AT */
  for(const l of [HOME,AWAY]){const c=g.filter(q=>q.team===l&&!q.gk);if(c.some(q=>q.rl))continue;c.sort((a,b)=>advDi(a.x,l)-advDi(b.x,l));c.forEach((q,k)=>{q.rl=k<4?"DF":k<7?"MF":"AT";});}
  const HERO=21;
  g[HERO]={i:HERO,team:HOME,gk:false,name:String((cfg.eroe&&cfg.eroe.name)||"EROE"),rl:"AT",x:clamp(+(cfg.eroe&&cfg.eroe.x)||58,2,98),y:clamp(+(cfg.eroe&&cfg.eroe.y)||50,3,97),eroe:true};
  let eroeAttivo=!(cfg.eroe&&cfg.eroe.attivo===false);
  const forza={home:clamp(+(cfg.forza&&cfg.forza.home)||68,40,95),away:clamp(+(cfg.forza&&cfg.forza.away)||68,40,95)};
  const attrsDi=(p)=>{const f=p.eroe?clamp((+(cfg.eroe&&cfg.eroe.ovr)||forza.home),40,95):forza[p.team];const v=Math.round(f);return{tiro:v,tecnica:v,passaggio:v,dribbling:v,velocità:v,fisico:v,mentalità:v,posizionamento:v};};
  /* posti di modulo (per indice): casa 0-9 + eroe, ospiti 10-20 */
  const SLOT_H=[{x:5,y:50},{x:18,y:14},{x:18,y:38},{x:18,y:62},{x:18,y:86},{x:38,y:25},{x:38,y:50},{x:38,y:75},{x:56,y:22},{x:56,y:78}];
  const SLOT_A=[{x:95,y:50},{x:82,y:14},{x:82,y:38},{x:82,y:62},{x:82,y:86},{x:62,y:25},{x:62,y:50},{x:62,y:75},{x:44,y:20},{x:40,y:50},{x:44,y:80}];
  const SLOT_EROE={x:60,y:50};
  const slotDi=(p)=>p.eroe?SLOT_EROE:(p.team===HOME?SLOT_H[p.i]:SLOT_A[p.i-10]);
  const attivo=(p)=>!!p&&(!p.eroe||eroeAttivo);
  const mio=(p,l)=>attivo(p)&&p.team===l;

  /* ---------- lo stato ---------- */
  const S={
    tick:0,min:0,
    palla:{x:50,y:50},
    poss:{stato:"kickoff",lato:(cfg.lato===AWAY?AWAY:HOME),padrone:null,ricevente:null,da:null,a:null,t:0,tipo:null,esito:null,icpt:null,icptA:0,ultimoPassatore:null},
    fermo:null,        /* {kind,lato,x,y,t,tot,rigore} */
    rete:null,         /* {lato,t} */
    kickoff:{lato:(cfg.lato===AWAY?AWAY:HOME),t:0},
    scena:false,
    richieste:{gol:null,turno:null,verso:null,att:{home:0,away:0}},
    eventi:[],
    arco:null,
    conta:{tenuta:0,volo:0,libero:0,fermo:0,rete:0,kickoff:0,scena:0,passaggi:0,tiri:0,gol:{home:0,away:0},falli:0,fuori:0,corner:0,contrasti:0,intercetti:0,conduzioni:0,ricezioniHero:0,golNegati:0,golForzati:0,rami:{}},
    quota:{home:0,away:0},
    inseguitore:null,
    /* [7.898 A2 v3] IL MINUTO HA UNA FASE. tick({min,dt}) con dt<1 e' un SOTTO-TICK: la decisione (chi
       passa, chi tira, chi conduce) si prende solo al primo sotto-tick del minuto (fase 0); i sotto-tick
       successivi muovono soltanto la fisica: il pallone in volo avanza di v·dt, i ventidue corrono v·dt,
       il portatore avanza sul suo piano di conduzione (cond: bersaglio e passo del minuto). Con dt=1 il
       motore e' IDENTICO a prima (un tick = un minuto = un tocco). */
    fase:0,dt:1,cond:null,
  };
  /* [7.912.0 — A9 v2, IL TEMPO DEL MONDO] Il pallone vola quattro volte piu' rapido. Misurato al banco il
     15/09 alle 21:58: portando il motore da 1 a 11 decisioni al minuto i passaggi salivano solo da 12,2 a 46,1
     (3,8 volte, non 11) perche' il pallone era IN VOLO nel 74,9 % delle chiamate — il motore trovava la palla in
     aria e non poteva decidere nulla. Col volo x4 le chiamate che producono un evento passano dal 31,4 al 55,3 %
     e il tabellino si avvicina al vero: tiri 3,5 -> 7,3 (vero 12,8), tiri in porta 2,2 -> 4,2 (vero 4,3), falli
     12,5 -> 16,4 (vero 13). Oltre il quadruplo i tiri non crescono piu' (7,30 -> 7,28 a x8), quindi quattro e'
     il punto. Un passaggio di 15 unita' smette di durare mezzo minuto di gioco. Rosso __CPM_NO912. */
  const _v912=()=>(typeof window!=='undefined'&&window&&window.__CPM_NO912)?1:4;
  /* [7.914.0 — IL TABELLINO LO TIENE IL MOTORE] Le statistiche di gara vivevano nel live e venivano da due
     sorgenti diverse (le righe di cronaca e le azioni dell'eroe): quattro voci, nessuna delle quali contava
     davvero cio' che succedeva in campo. Il PO, guardando il post-partita: «ci deve essere il tabellino delle
     statistiche completo altrimenti non riesco a capirne l'andamento». Qui il conto si tiene dove passano TUTTI
     gli eventi — una funzione sola, per entrambe le squadre — e chi vuole le statistiche le chiede al motore.
     Serve al post-partita e servira' alla partita 2D, che le mostrera' in sovrimpressione. */
  const _TAB0=()=>({tiri:0,inPorta:0,legni:0,murati:0,fuori:0,gol:0,xg:0,corner:0,falli:0,ammonizioni:0,espulsioni:0,rigori:0,parate:0,passaggi:0,passOk:0,cross:0,rimesse:0,contrasti:0,intercetti:0,spazzate:0,fuorigioco:0,assist:0,possesso:0});
  S.tab={home:_TAB0(),away:_TAB0()};
  /* [7.918.0 — F3 · LE PAGELLE NASCONO DAGLI EVENTI] Richiesta del PO (16/09): «le statistiche della partita,
     pagelle, ecc durante la partita 2D devono essere ben visibili». Una pagella inventata sarebbe una seconda
     verita': qui il voto si costruisce SOLO da cio' che il giocatore ha fatto, perche' ogni evento del motore
     porta gia' il suo autore (`e.chi.i`). Il conto e' incrementale — un tick, un evento, nessuna passata sui
     ventimila eventi della partita. */
  const _PAG0=()=>({passaggi:0,passOk:0,ricezioni:0,tiri:0,inPorta:0,gol:0,assist:0,contrasti:0,intercetti:0,spazzate:0,parate:0,falli:0,amm:0,esp:0,subiti:0,tocchi:0});
  S.pag={};
  const _pag=(i)=>{if(i==null||i<0||i>=g.length)return null;if(!S.pag[i])S.pag[i]=_PAG0();return S.pag[i];};
  const _XG914=(e)=>{const z=e.zona||'fuori';const b=z==='areaPiccola'?0.34:z==='area'?0.14:z==='limite'?0.06:0.03;const pr=typeof e.press==='number'?e.press:4;return Math.min(0.9,b*(pr<2?1.35:pr<4?1.0:0.72));};
  const _conta914=(e)=>{try{
    const l=(e.chi&&e.chi.team)||e.per||e.lato;const A=S.tab[l];if(!A)return;const B=S.tab[l==='home'?'away':'home'];
    switch(e.t){
      case 'passaggio': A.passaggi++;if(!e.fuori)A.passOk++;break;
      case 'cross': A.passaggi++;A.passOk++;A.cross++;break;
      case 'tiro': A.tiri++;A.xg=Math.round((A.xg+_XG914(e))*100)/100;
        if(e.esito==='goal'||e.esito==='saved')A.inPorta++;else if(e.esito==='post')A.legni++;else if(e.esito==='blocked')A.murati++;else A.fuori++;break;
      case 'gol': A.gol++;if(e.assist&&e.assist.team&&S.tab[e.assist.team])S.tab[e.assist.team].assist++;break;
      case 'corner': A.corner++;break;
      case 'fallo': A.falli++;break;
      case 'rigore': A.rigori++;break;
      case 'rimessa': A.rimesse++;break;
      case 'fuorigioco': A.fuorigioco++;break;/* [7.932] la voce esiste anche nel tabellino a schermo, non solo al banco */
      case 'ammonizione': A.ammonizioni++;break;
      case 'espulsione': A.espulsioni++;break;
      case 'parata': if(B)B.parate++;break;
      case 'spazzata': A.spazzate++;break;
      case 'intercetto': A.intercetti++;
        /* [7.923] UN PASSAGGIO INTERCETTATO NON E UN PASSAGGIO RIUSCITO. Il conto contava riuscito ogni
           passaggio che non finiva FUORI dal campo: e da li che veniva la precisione al 95-98 per cento
           che il PO ha fotografato. Lintercetto toglie il punto a chi lo ha giocato, squadra e uomo. */
        if(e.da&&e.da.team&&S.tab[e.da.team])S.tab[e.da.team].passOk=Math.max(0,(S.tab[e.da.team].passOk|0)-1);
        if(e.da&&e.da.i!=null){const _Q=_pag(e.da.i);if(_Q)_Q.passOk=Math.max(0,(_Q.passOk|0)-1);}
        break;
      case 'contrasto': case 'recupero': A.contrasti++;break;
    }
    /* [7.922 — IL DIFETTO CHE RENDEVA PIATTE LE PAGELLE. Collaudo PO 16/09: «i voti sono assolutamente
       sballati, completamente sbilanciati».] MISURATO prima di toccare: su 22 giocatori, SEDICI avevano
       esattamente 6,0 e zero eventi intestati, mentre il tabellino di squadra contava 27 passaggi. La causa
       non era la formula del voto: era che l'evento `passaggio` (e `cross`) porta l'autore in `da`, non in
       `chi` — e questo contatore guardava solo `chi`. Quindi NESSUN passaggio finiva nella pagella di
       nessuno. Qui l'autore si legge da dove sta davvero, e chi riceve si prende la sua ricezione. */
    const _aut=(e.chi&&e.chi.i!=null)?e.chi.i:(((e.t==='passaggio'||e.t==='cross')&&e.da&&e.da.i!=null)?e.da.i:null);
    const P=_pag(_aut);
    if(P){P.tocchi++;
      switch(e.t){
        case 'passaggio': P.passaggi++;if(!e.fuori)P.passOk++;break;
        case 'cross': P.passaggi++;P.passOk++;break;
        case 'tiro': P.tiri++;if(e.esito==='goal'||e.esito==='saved')P.inPorta++;break;
        case 'gol': P.gol++;break;
        case 'fallo': P.falli++;break;
        case 'ammonizione': P.amm++;break;
        case 'espulsione': P.esp++;break;
        case 'spazzata': P.spazzate++;break;
        case 'intercetto': P.intercetti++;break;
        case 'contrasto': case 'recupero': P.contrasti++;break;
      }
    }
    if(e.t==='gol'){
      if(e.assist&&e.assist.i!=null){const Q=_pag(e.assist.i);if(Q)Q.assist++;}
      /* il portiere che lo subisce: e' l'unica voce che non nasce da un suo gesto */
      const _gkSub=_pag(l==='home'?10:0);if(_gkSub)_gkSub.subiti++;
    }
    if(e.t==='parata'){const K=_pag((e.gk&&e.gk.i!=null)?e.gk.i:((e.chi&&e.chi.i!=null)?e.chi.i:null));if(K)K.parate++;}
    if((e.t==='passaggio'||e.t==='cross')&&e.a&&e.a.i!=null){const R=_pag(e.a.i);if(R){R.ricezioni++;R.tocchi++;}}
  }catch(_e){}};
  const ev=(t,o)=>{const e={t,tick:S.tick,min:S.min,lato:S.poss.lato};if(o)for(const k in o)e[k]=o[k];if(!o||o.lato==null){const w=e.chi||e.gk;if(w&&w.team&&/^(contrasto|intercetto|recupero|spazzata|parata|presa|murato)$/.test(t))e.lato=w.team;}S.eventi.push(e);_conta914(e);return e;};
  const nome=(p)=>p?(p.eroe?"{P}":(p.name||(p.gk?"il portiere":"un giocatore"))):"";
  const chi=(p)=>p?{i:p.i,nome:nome(p),eroe:!!p.eroe,gk:!!p.gk,team:p.team,x:+p.x.toFixed(1),y:+p.y.toFixed(1)}:null;

  /* ---------- geometria ---------- */
  const pressioneSu=(p)=>{let d=99;for(const q of g){if(!attivo(q)||q.team===p.team||q.gk)continue;const dd=hyp(q.x,q.y,p.x,p.y);if(dd<d)d=dd;}return d;};
  const piuVicino=(x,y,l,opt)=>{opt=opt||{};let b=null,bd=1e9;for(const q of g){if(!attivo(q))continue;if(l&&q.team!==l)continue;if(opt.noGk&&q.gk)continue;if(opt.escl!=null&&q.i===opt.escl)continue;const d=hyp(q.x,q.y,x,y);if(d<bd){bd=d;b=q;}}return b?{p:b,d:bd}:null;};
  const corsiaLibera=(ax,ay,bx,by,l)=>{const L=hyp(ax,ay,bx,by)||1;let blk=0;for(const q of g){if(!attivo(q)||q.team===l||q.gk)continue;const t=clamp(((q.x-ax)*(bx-ax)+(q.y-ay)*(by-ay))/(L*L),0,1);if(t<0.15||t>0.9)continue;const px=ax+(bx-ax)*t,py=ay+(by-ay)*t;if(hyp(q.x,q.y,px,py)<2.6)blk++;}return blk;};
  const spazioAvanti=(p)=>{const d=dirDi(p.team);let s=12;for(const q of g){if(!attivo(q)||q.team===p.team||q.gk)continue;const fw=(q.x-p.x)*d;if(fw<-1||fw>12)continue;if(Math.abs(q.y-p.y)>4.5)continue;if(fw<s)s=fw;}return s;};
  const nomeLatoOpp=(l)=>altro(l);
  const portiereDi=(l)=>g[l===HOME?0:10];

  /* ---------- transizioni ---------- */
  const tenuta=(p,perche)=>{S.poss.stato="tenuta";S.cond=null;S.poss.lato=p.team;S.poss.padrone=p.i;S.poss.ricevente=null;S.poss.t=0;S.poss.tipo=null;S.poss.a=null;S.poss.da=null;S.poss.icpt=null;
    S.palla.x=clamp(p.x+dirDi(p.team)*0.5,0,100);S.palla.y=p.y;
    if(S.richieste.turno===p.team)S.richieste.turno=null;
    if(perche)ev(perche,{chi:chi(p)});};
  const libero=(x,y)=>{S.poss.stato="libero";S.cond=null;S.poss.padrone=null;S.poss.ricevente=null;S.poss.t=0;S.poss.tipo=null;S.palla.x=clamp(x,0,100);S.palla.y=clamp(y,0,100);};
  const volo=(o)=>{S.poss.stato="volo";S.cond=null;S.poss.tipo=o.tipo;S.poss.da={x:S.palla.x,y:S.palla.y};S.poss.a={x:o.x,y:o.y};S.poss.ricevente=o.ricevente!=null?o.ricevente:null;S.poss.esito=o.esito||null;
    /* [7.928 M1a — IL PALLONE ARRIVA DENTRO IL BATTITO]
       MISURATO (banco catene, 30 partite, 11 battiti al minuto): un passaggio di 23 metri restava in aria
       15,5 s di tempo di gioco, cioe' 1,5 m/s — piu' lento di un uomo che cammina, contro i 15-20 m/s di un
       passaggio rasoterra vero. E la palla faceva 7,9u per battito invece dei 18,2 nominali, perche' il
       bersaglio insegue il ricevente che si muove. Conseguenza: il motore stava in volo nel 50,3 % delle
       chiamate, e ogni battito speso a guardare il pallone fluttuare e' un battito NON speso in un
       contrasto, una spazzata, un altro passaggio — le voci che stanno a un centesimo del vero.
       Il vincolo vero non e' la velocita' nominale: e' che un battito VALE 5,45 s di partita, quindi un
       passaggio da un secondo non si puo' rappresentare in piu' di un battito senza rallentare il gioco.
       Qui si impone quello: la velocita' e' ALMENO quella che copre la distanza in un battito. */
    {const _dd=hyp(S.palla.x,S.palla.y,o.x,o.y),_dt=S.dt||1;
      const _min=(_dd/Math.max(1e-6,_dt))*1.04;/* 4 % di margine: la soglia d'arrivo e' un confronto, non un'uguaglianza */
      if(!(typeof window!=='undefined'&&window.__CPM_NO928)&&(o.tipo==="passaggio"||o.tipo==="cross"||o.tipo==="fuori"))o.v=Math.max(+o.v||22,_min);}
    S.poss.v=o.v||22;S.poss.t=0;S.poss.icpt=o.icpt!=null?o.icpt:null;S.poss.icptA=o.icptA||0;S.poss.tiratore=o.tiratore!=null?o.tiratore:null;S.poss.kind=o.kind||null;
    S.arco={type:o.arco||"pass",from:{x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)},to:{x:+o.x.toFixed(1),y:+o.y.toFixed(1)},actor:o.actor||null,rcv:o.rcv||null,lato:S.poss.lato,dur:+(Math.ceil(hyp(S.palla.x,S.palla.y,o.x,o.y)/((o.v||22)*(S.dt||1))-1e-9)*(S.dt||1)).toFixed(3)};/* [7.898] dur: minuti di volo attesi */
    {const _le=S.eventi[S.eventi.length-1];if(_le&&/^(passaggio|cross|tiro)$/.test(_le.t)&&_le.dur==null)_le.dur=S.arco.dur;}/* [7.898] il fatto che ha lanciato il pallone porta la durata del volo: il renderer fa durare l'arco quanto il volo logico */
    S.poss.padrone=null;};
  /* [7.881] LA RIMESSA SI BATTE SUBITO. Scheda n° 12: le interruzioni della 7.878 hanno portato i minuti
     a gioco fermo a 19-21 contro un tetto di 15, in 3 partite su 4. Il rimedio non e' togliere le rimesse
     (il pallone DEVE uscire: e' calcio) ma accorciare la pausa: una rimessa laterale e un rinvio si
     battono in un tick, angolo e rigore restano a 3 perche' la squadra si deve schierare. */
  const fermoSet=(kind,lato,x,y,opt)=>{opt=opt||{};
    /* [7.881 v2] e anche la PUNIZIONE lontana dalla porta si batte in fretta: nel calcio vero si riparte
       subito, la barriera si forma solo vicino all'area. Misurato sulla scheda n° 12: a Vairo i 20 minuti
       di palla ferma non erano rimesse ma punizioni. Vicino all'area (avanzamento >= 70) restano due tick. */
    const _advF=(kind==="foul")?(lato===HOME?clamp(x,0,100):100-clamp(x,0,100)):0;
    const tot=kind==="corner"?3:kind==="pen"?3:(kind==="throw"||kind==="goal_kick")?1:(kind==="foul"&&_advF<70)?1:2;S.fermo={kind,lato,x:clamp(x,0,100),y:clamp(y,0,100),t:0,tot,batt:null};S.cond=null;
    {let B=null;if(kind==="goal_kick")B=portiereDi(lato);else if(kind==="pen"){let bs=-1e9;for(const q of g){if(!mio(q,lato)||q.gk)continue;const sc=(q.rl==="AT"?10:0)+(q.eroe?6:0)+rnd()*4;if(sc>bs){bs=sc;B=q;}}}else{const T=piuVicino(S.fermo.x,S.fermo.y,lato,{noGk:true});B=T?T.p:null;}S.fermo.batt=B?B.i:null;
      /* [7.938] e se il battitore e' lontano, gli si da' il TEMPO di arrivarci invece di teletrasportarlo:
         un battito copre al massimo 11 unita'. Nel calcio vero e' cosi' — una punizione a meta' campo si
         batte piu' tardi di una sulla trequarti, perche' qualcuno ci deve andare. */
      if(B){const _dB=hyp(B.x,B.y,S.fermo.x,S.fermo.y);const _need=Math.ceil(_dB/11);if(_need>S.fermo.tot)S.fermo.tot=Math.min(12,_need);}}S.poss.stato="fermo";S.poss.lato=lato;S.poss.padrone=null;S.poss.ricevente=null;S.poss.t=0;S.palla.x=S.fermo.x;S.palla.y=S.fermo.y;
    if(S.richieste.turno===lato)S.richieste.turno=null;S.conta.fermo++;
    ev(kind==="foul"?"fallo":kind==="pen"?"rigore":kind==="corner"?"corner":kind==="throw"?"rimessa":"rinvio",Object.assign({x:+S.fermo.x.toFixed(1),y:+S.fermo.y.toFixed(1),per:lato},opt));};

  /* ---------- scelte ---------- */
  const scegliRicevente=(P,opt)=>{opt=opt||{};const l=P.team,d=dirDi(l);const golReq=opt.golReq;let best=null,bs=-1e9;
    let _pen943=null;/* la linea si calcola una volta sola per chiamata, e solo se serve */
    for(const q of g){if(!mio(q,l)||q.i===P.i)continue;if(q.gk&&!opt.conGk)continue;
      const dd=hyp(q.x,q.y,P.x,P.y);if(dd<5||dd>46)continue;
      const fw=(q.x-P.x)*d;const advQ=advDi(q.x,l);
      const mk=piuVicino(q.x,q.y,altro(l),{noGk:true});const marc=mk?mk.d:99;
      const blk=corsiaLibera(P.x,P.y,q.x,q.y,l);
      let sc=fw*1.2-Math.abs(dd-24)*0.2-(marc<3?14:marc<5?6:0)-blk*9+(rnd()-0.5)*6;
      /* [7.878] LA FASCIA E' UNO SBOCCO VERO. Misurato: rimesse laterali 0,02 a partita contro le ~40 di
         una partita vera, perche' il pallone sta sulla fascia solo il 10 % del tempo e il premio all'uomo
         largo valeva 4 punti su un punteggio dove la marcatura ne toglie 14. Il premio ora conta davvero,
         vale su tutto il campo in avanti, e cresce quando chi ha la palla e' pressato: lo scarico sull'ala
         e' la giocata che il calcio fa quando il centro e' chiuso. */
      if(Math.abs(q.y-50)>=24&&fw>-4)sc+=(advDi(P.x,l)>=50?9:6)+(pressioneSu(P)<3?5:0);
      if(golReq){sc+=Math.max(0,advQ-advDi(P.x,l))*0.8+(advQ>=70?8:0);}
      if(q.eroe){let _b879=S.richieste.scenaEroe?26:0;
        /* [23/09 POC — punto 4] con un TIPO chiesto il bonus pieno scatta solo quando l'eroe e' gia' dove quel tipo nasce (entro 9u dal
           suo punto): prima gli arrivava il pallone ovunque fosse, e l'occasione nasceva sempre sulla soglia della trequarti.
           Rosso __CPM_NO_B7POS. */
        const _tq=S.richieste.scenaEroe&&S.richieste.scenaTipo;
        if(_tq&&!(typeof window!=='undefined'&&window.__CPM_NO_B7POS)){const l=q.team;const a=advDi(q.x,l);
          const pronto=_tq==="conclusione"?a>=80:_tq==="fascia"?(a>=62&&Math.abs(q.y-50)>=24):_tq==="spalle"?a>=74:_tq==="fra-le-linee"?(a>=60&&a<76):a<60;
          if(!pronto)_b879=2;}
        sc+=((cfg.eroe&&cfg.eroe.bonus)||2)+_b879;}/* [7.879] chiesta la scena, l'eroe diventa la prima scelta */
      if(fw<-12)sc-=6;
      /* [7.943 — CHI PASSA GUARDA LA LINEA. Rosso __CPM_NO943]
         La scelta del ricevente pesava avanzamento, marcatura e corsia, ma MAI il fuorigioco: il motore
         sceglieva il compagno oltre l'ultimo difensore e poi `passa()` lo puniva. Cioe' il fuorigioco era
         una lotteria a valle, mentre la direttiva del motore dice che gli eventi sono CONSEGUENZE.
         Un giocatore vero la linea la vede, e infatti nel calcio vero i fuorigioco sono 1,70: il residuo
         dei tempi sbagliati, non l'esito ordinario del passaggio in avanti.
         MISURATO che serviva: alzando la cadenza da 11 a 22 decisioni al minuto i passaggi fanno 1,93x
         ma il fuorigioco 5,08x — superlineare, perche' l'attaccante piu' avanti passa da 8 unita' dietro
         la linea a 1,9 e quindi vive sul filo. Prima avevo accusato la spinta anti-ammucchiata non scalata
         da dt: REVOCATA, non batteva la misura (5,08x -> 4,80x, cioe' il 5 % dell'effetto). */
      if(!(typeof window!=='undefined'&&window&&window.__CPM_NO943)&&!q.gk&&advQ>50){
        if(_pen943==null){const _av=[];for(const z of g){if(mio(z,l)||!attivo(z))continue;_av.push(advDi(z.x,l));}
          _av.sort((a,b)=>b-a);_pen943=_av.length>=2?_av[1]:999;}
        /* due casi diversi, e vanno trattati diversamente: chi e' NETTAMENTE oltre la linea non
           riceve il pallone (nessuno lo serve, e infatti nel calcio vero quel passaggio non parte),
           chi e' SUL FILO lo riceve ancora spesso — ed e' li' che il fuorigioco nasce davvero, dai
           tempi sbagliati. Un veto secco su tutt'e due porterebbe la voce a zero, che e' il difetto
           opposto e altrettanto falso. */
        if(advQ>_pen943+1.5)sc-=40; else if(advQ>_pen943)sc-=18;
      }
      if(sc>bs){bs=sc;best=q;}}
    if(!best&&opt.conGk!==true){const gk=portiereDi(l);if(gk&&hyp(gk.x,gk.y,P.x,P.y)<=40&&!P.gk)best=gk;}
    return best;};
  const piuAvanzato=(l,escl)=>{let best=null,ba=-1;for(const q of g){if(!mio(q,l)||q.gk||q.i===escl||!attivo(q))continue;const a=advDi(q.x,l)+(q.eroe?2:0);if(a>ba){ba=a;best=q;}}return best;};
  const tipoPassaggio=(P,R)=>{const d=dirDi(P.team);const fw=(R.x-P.x)*d,dd=hyp(P.x,P.y,R.x,R.y);
    if(dd>30)return"lancio";if(fw<-4)return"appoggio";if(Math.abs(R.y-P.y)>24)return"cambio";if(fw>13&&advDi(R.x,P.team)>=68)return"filtrante";if(fw>6)return"verticale";return"corto";};
  const passa=(P,R,opt)=>{opt=opt||{};const l=P.team;const kind=opt.kind||tipoPassaggio(P,R);
    /* [7.923 - A12 v1: LA DIFESA DIFENDE. Collaudo PO 16/09: i difensori non toccano mai il pallone.]
       Il banco a 11 decisioni al minuto dice dove sta il buco, e non e il retropassaggio (quel rimedio e
       stato misurato e revocato): sono le TRE VOCI DIFENSIVE - spazzate 0,53 contro 17, intercetti 0,55
       contro 8,5, contrasti 2,52 contro 16,5. I difensori non toccano il pallone perche nel motore non
       esiste il gesto con cui un difensore entra in partita. Lintercetto aveva due cancelli in serie: una
       probabilita base di 0,04 sul passaggio corto, e poi la pretesa che luomo fosse gia entro 4,5 unita
       dal punto dintercetto quando la palla ci passa - ma nel frattempo tutti si sono mossi. Risultato:
       0,7 per cento dei passaggi contro il 10 per cento di una partita vera. Si allargano tutti e tre i
       numeri insieme, perche allargarne uno solo lascia laltro a fare da tappo. Rosso __CPM_NO923. */
    const _no923i=(typeof window!=='undefined'&&window.__CPM_NO923);
    const pIcpt=(_no923i?(kind==="lancio"?0.11:kind==="filtrante"?0.12:kind==="cambio"?0.07:0.04):(kind==="lancio"?0.22:kind==="filtrante"?0.24:kind==="cambio"?0.15:0.11))+(pressioneSu(P)<2?0.05:0)+corsiaLibera(P.x,P.y,R.x,R.y,l)*0.10;
    let icpt=null,icptA=0;
    if(!opt.sicuro&&rnd()<pIcpt){const m=piuVicino((P.x+R.x)/2,(P.y+R.y)/2,altro(l),{noGk:true});if(m&&m.d<(_no923i?9:12)){icpt=m.p.i;icptA=0.45+rnd()*0.35;}}/* [7.923] il candidato si cerca piu largo: a 9 unita dal mezzo della linea di passaggio restava fuori mezzo reparto */
    /* [7.878] IL PALLONE PUO' USCIRE, e piu' spesso quanto piu' il bersaglio e' vicino alla linea: nel
       calcio vero la rimessa laterale e' l'interruzione piu' comune (~40 a partita), qui ne usciva 0,02
       perche' la probabilita' scattava solo oltre |y-50|>=34, dove il gioco non arriva quasi mai. */
    if(!opt.sicuro&&rnd()<Math.min(0.42,Math.max(0,(Math.abs(R.y-50)-14)/26)*((kind==="lancio"||kind==="cambio")?0.34:0.22))){S.poss.ultimoPassatore=P.i;S.conta.passaggi++;ev("passaggio",{da:chi(P),a:chi(R),kind,from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+R.x.toFixed(1),y:+R.y.toFixed(1)},fuori:true});volo({tipo:"fuori",kind,x:clamp(R.x,2,98),y:R.y>=50?100:0,ricevente:null,v:20,arco:"pass",actor:nome(P),rcv:nome(R)});return;}
    /* [7.932 — IL FUORIGIOCO ESISTE. Direttiva REAL MATCH ENGINE: gli eventi sono CONSEGUENZE]
       La voce era a ZERO contro 1,70 vera, e non per una taratura: nel motore la parola «fuorigioco» non
       compariva affatto. Qui si guarda dove stanno davvero i ventidue NEL MOMENTO in cui parte il passaggio
       — che e' l'istante in cui la regola si applica — e si confronta il ricevente con il PENULTIMO
       avversario (il portiere conta come uno dei due). Vale solo oltre meta' campo e solo se il ricevente
       e' davanti al pallone: un passaggio all'indietro non e' mai fuorigioco. Rosso __CPM_NO932
       (il 931 non si riusa: e' il numero della corsa verso l'area, revocata poche righe piu' sotto). */
    if(!(typeof window!=='undefined'&&window&&window.__CPM_NO932)&&!opt.sicuro&&kind!=="appoggio"){
      const _aR=advDi(R.x,l),_aP=advDi(P.x,l);
      if(_aR>50&&_aR>_aP+1){
        const _av=[];for(const q of g){if(mio(q,l)||!attivo(q))continue;_av.push(advDi(q.x,l));}
        _av.sort((a,b)=>b-a);/* decrescente: [0] e' l'avversario piu' arretrato (di solito il portiere) */
        const _pen=_av.length>=2?_av[1]:null;/* il PENULTIMO: la linea che decide */
        if(_pen!=null&&_aR>_pen+0.6){
          S.conta.passaggi++;S.poss.ultimoPassatore=P.i;
          ev("passaggio",{da:chi(P),a:chi(R),kind,from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+R.x.toFixed(1),y:+R.y.toFixed(1)},fuorigioco:true});
          ev("fuorigioco",{chi:chi(R),da:chi(P),x:+R.x.toFixed(1),y:+R.y.toFixed(1),lato:l});
          fermoSet("foul",altro(l),clamp(R.x,4,96),clamp(R.y,4,96));/* punizione per chi difende, dal punto del fuorigioco */
          return;}}}
    const lead=Math.min(4,hyp(P.x,P.y,R.x,R.y)*0.12);const tx=clamp(R.x+dirDi(l)*lead*(kind==="appoggio"?0:1),2,98),ty=clamp(R.y,3,97);
    S.poss.ultimoPassatore=P.i;S.conta.passaggi++;
    ev("passaggio",{da:chi(P),a:chi(R),kind,from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+tx.toFixed(1),y:+ty.toFixed(1)}});
    volo({tipo:"passaggio",kind,x:tx,y:ty,ricevente:R.i,v:(kind==="lancio"?48:kind==="cambio"?48:50)*_v912(),icpt,icptA,arco:"pass",actor:nome(P),rcv:nome(R)});};
  const cross=(P,R,opt)=>{opt=opt||{};const l=P.team;S.poss.ultimoPassatore=P.i;S.conta.passaggi++;
    const tx=clamp(xDa(88+rnd()*6,l),2,98),ty=clamp(50+(rnd()-0.5)*16,3,97);
    ev("cross",{da:chi(P),a:chi(R),from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+tx.toFixed(1),y:+ty.toFixed(1)},corner:!!opt.corner});
    volo({tipo:"cross",kind:"cross",x:tx,y:ty,ricevente:R?R.i:null,v:48*_v912(),arco:"cross",actor:nome(P),rcv:R?nome(R):null});};
  const esitoTiro=(P,intent,ctx)=>{const golReq=S.richieste.gol&&S.richieste.gol.lato===P.team?S.richieste.gol:null;
    let out=null;
    if(decidi){try{out=decidi(intent,Object.assign({attrs:attrsDi(P),seed:seme32(),x:advDi(P.x,P.team)},ctx||{})).outcome;}catch(_e){out=null;}}
    /* [7.929 — IL LEGNO E' UN TASSO SUI TIRI, e i tiri ora sono giusti] Il sorteggio base dava «post» all'8 %
       dei tiri. Nel calcio vero i legni sono 0,30 su 12,8 tiri, cioe' il 2,3 %. Il difetto c'era da sempre,
       ma con 7,9 tiri a partita restava mascherato (0,43 legni, 1,44x); portati i tiri a 12,6 con la 7.928
       e' venuto fuori intero: 0,97 contro 0,30, TRE VOLTE E MEZZO il vero. La soglia scende da 0,78 a
       0,7225 (2,25 % dei tiri); la quota tolta va a «wide», che e' dove finisce davvero un tiro sbagliato. */
    if(!out){const r=rnd();const _sPost=(typeof window!=='undefined'&&window&&window.__CPM_NO929B)?0.78:0.7225;
      out=r<0.28?"goal":r<0.58?"saved":r<0.70?"blocked":r<_sPost?"post":"wide";}
    if(out==="wall_blocked")out="blocked";
    /* [7.925 - LA MIRA DIPENDE DA DOVE SI TIRA. Direttiva REAL MATCH ENGINE §9.] MISURATO: 5,57 tiri in
       porta su 8,18, cioe il 68 per cento, contro il 34 per cento di una partita vera — il motore tira il
       doppio piu preciso di un professionista, e da fuori area come da dentro. Da qui anche i rinvii dal
       fondo a 1,35 contro 7: se non si tira mai fuori, il pallone non esce mai sul fondo, il portiere non
       rilancia e la difesa non tocca palla. Ora lo specchio si guadagna: dall area piccola si centra il 62
       per cento delle volte, dall area il 45, dal limite il 30, da fuori il 18 — e sotto pressione si
       sbaglia di piu. Non e un dado nuovo: e il dado di prima corretto dal CONTESTO, che e quello che la
       direttiva chiede. Rosso __CPM_NO925. */
    if(!(typeof window!=='undefined'&&window.__CPM_NO925)&&(out==='goal'||out==='saved')){
      const _advT=advDi(P.x,P.team);const _zT=zonaDi(_advT,P.y);const _prT=(ctx&&ctx.pressure)||2;
      let _pOn=(_zT==='areaPiccola')?0.70:(_zT==='area')?0.56:(_zT==='limite')?0.40:0.31;/* [7.925 taratura] la prima prova (0,62/0,45/0,30/0,18) portava i tiri fuori a 3,25 ma faceva crollare le PARATE da 3,93 a 0,73 contro 3,2 vere: il 34 per cento vero e la MEDIA su tutte le zone, e questo motore tira quasi solo da fuori, quindi il valore di fuori deve stare vicino a quella media. */
      _pOn*=(_prT===1?0.80:_prT===2?0.92:1);
      if(rnd()>_pOn)out=(rnd()<0.72)?'wide':'blocked';
    }
    if(golReq){if(golReq.t>=3||rnd()<0.62){out="goal";}else if(out==="saved"||out==="wide"||out==="goal"){out=rnd()<0.5?"post":"blocked";}}
    else if(out==="goal"){out="saved";S.conta.golNegati++;}
    return out;};
  const tira=(P,opt)=>{opt=opt||{};const l=P.team;const press=pressioneSu(P);const intent=opt.intent||"shot";
    const out=esitoTiro(P,intent,{pressure:press<2?3:press<4?2:1,gkOut:false});
    const gx=l===HOME?100.6:-0.6;let ty=50+(rnd()-0.5)*8,tx=gx;
    const adv=advDi(P.x,l);const zona=zonaDi(adv,P.y);
    if(out==="wide"){ty=rnd()<0.5?(GOAL_Y0-2-rnd()*6):(GOAL_Y1+2+rnd()*6);}
    else if(out==="post"){ty=rnd()<0.5?GOAL_Y0+0.4:GOAL_Y1-0.4;}
    else if(out==="blocked"){const m=piuVicino(P.x+dirDi(l)*3,P.y,altro(l),{noGk:true});if(m&&m.d<7){tx=m.p.x;ty=m.p.y;}else{tx=clamp(P.x+dirDi(l)*6,2,98);}}
    S.conta.tiri++;
    ev("tiro",{chi:chi(P),zona,intent,from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+tx.toFixed(1),y:+ty.toFixed(1)},esito:out,press:+press.toFixed(1)});
    volo({tipo:"tiro",kind:intent,x:tx,y:ty,ricevente:null,v:44*_v912(),esito:out,tiratore:P.i,arco:"shot",actor:nome(P)});};
  const conduci=(P,opt)=>{opt=opt||{};const d=dirDi(P.team);const _sp900=!!opt.spinta;const passo=(5+rnd()*3)+(_sp900?3:0);/* tetto 11u: il passo umano resta sotto i 12u del guardiano */const adv=advDi(P.x,P.team);/* [7.900 A4] spinta: al limite con la strada libera il portatore PUNTA LA PORTA (passo +4u, rientro deciso verso il centro) */
    /* [7.876] chi conduce sulla fascia non rientra per abitudine: punta il fondo e rientra solo in area */
    let ty=P.y+(50-P.y)*0.06+(rnd()-0.5)*2;if(_sp900)ty=P.y+(50-P.y)*0.5;else if(adv>=86&&Math.abs(P.y-50)>18)ty=P.y+(50-P.y)*0.35;
    else if(adv>=60&&Math.abs(P.y-50)>=20)ty=P.y+(P.y-50)*0.05+(rnd()-0.5)*2;
    let nx=clamp(P.x+d*passo,3,97),ny=clamp(ty,4,96);
    /* [7.891 v2] IL PASSO DELLA CONDUZIONE E' UMANO ANCHE QUANDO RIENTRA: il rientro in area del 7.876 sommava
       al passo in avanti (5-8u) fino a 16u di taglio verso il centro — misurato 13,0u in un tick (test «passi
       umani», seme 11, t43, i18: da 11,3/20,2 a 3,6/30,6). Il vettore intero resta entro il passo. */
    {const _ddx=nx-P.x,_ddy=ny-P.y,_dl=Math.hypot(_ddx,_ddy);if(_dl>passo){nx=clamp(P.x+_ddx/_dl*passo,3,97);ny=clamp(P.y+_ddy/_dl*passo,4,96);}}
    ev("conduzione",{chi:chi(P),from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+nx.toFixed(1),y:+ny.toFixed(1)}});
    /* [7.898 A2 v3] il passo del minuto si compie in frazioni: qui la prima (passo·dt), il resto nei sotto-tick (avanzaCond). Con dt=1 il portatore arriva subito, come prima. */
    {const _dt=S.dt||1;const _cx=nx-P.x,_cy=ny-P.y,_cl=Math.hypot(_cx,_cy);const _st=Math.min(_cl,passo*_dt);if(_cl>1e-9){P.x=P.x+_cx/_cl*_st;P.y=P.y+_cy/_cl*_st;}S.cond=(_st<_cl-1e-6)?{tx:nx,ty:ny,v:passo}:null;}
    S.palla.x=clamp(P.x+d*0.5,0,100);S.palla.y=P.y;S.conta.conduzioni++;};
  const perdi=(P,come)=>{const l=P.team;const m=piuVicino(P.x,P.y,altro(l),{noGk:true});
    if(!m||m.d>4.5){ev("palla_persa",{chi:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1)});
      const T=(S.richieste.turno&&S.richieste.turno!==l)?piuVicino(P.x,P.y,altro(l),{noGk:true}):null;
      if(T&&T.d<=9){libero(clamp(P.x+(T.p.x-P.x)*0.7,2,98),clamp(P.y+(T.p.y-P.y)*0.7,3,97));return;}
      libero(clamp(P.x+dirDi(l)*(2+rnd()*4),2,98),clamp(P.y+(rnd()-0.5)*6,3,97));return;}
    const W=m.p;S.conta.contrasti++;
    /* [7.875] il contrasto vicino alla linea manda spesso il pallone fuori: la rimessa laterale e' l'interruzione piu' comune del calcio vero (~40 a partita), qui ne mancava quasi del tutto */
    if(Math.abs(P.y-50)>=30&&rnd()<(Math.abs(P.y-50)>=40?0.55:0.30)){ev("contrasto",{chi:chi(W),su:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1),fuori:true});fuoriCampo(P.x,P.y,rnd()<0.5?l:altro(l),"throw");return;}
    ev("contrasto",{chi:chi(W),su:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1)});
    W.x=clamp(P.x+dirDi(W.team)*0.8,2,98);W.y=P.y;tenuta(W,null);};
  /* [7.913.0 — A10] L'ARBITRO TIRA FUORI I CARTELLINI, E NON SOLO PER L'EROE. I gialli esistevano gia', ma
     vivevano nel live e SOLO per il protagonista (heroYellowsRef): gli altri ventuno potevano falciare per
     novanta minuti senza che l'arbitro battesse ciglio, e il tabellino del PO segnava «ammonizioni 0» dopo
     quindici falli subiti. Qui il cartellino nasce dove nasce il fallo, per chiunque lo commetta. Tarature dal
     calcio vero: 2,4 ammonizioni per squadra su ~13 falli, cioe' un giallo ogni 5-6 falli; il fallo che ferma
     un'azione promettente (avversario gia' avanzato) pesa di piu'; alla SECONDA ammonizione e' rosso, e i rossi
     veri sono 0,11 a squadra. Chi e' gia' espulso non puo' prendere altri cartellini. Rosso __CPM_NO913. */
  const _cart913=(W,P,adv)=>{try{
    if(typeof window!=='undefined'&&window&&window.__CPM_NO913)return;
    if(!W||W.gk)return;/* il portiere prende cartellini troppo di rado perche' valga la pena */
    S.cartellini=S.cartellini||{};const _k=W.i;const _st=S.cartellini[_k]||(S.cartellini[_k]={g:0,r:false});
    if(_st.r)return;
    /* La prima misura dava gialli 1,45 (vero 2,4) e rossi 0,38 (vero 0,11): troppi pochi cartellini e troppe
       espulsioni, perche' i falli si concentrano sugli stessi difensori e il secondo giallo arrivava subito.
       Nel calcio vero un ammonito gioca piu' attento e l'arbitro e' piu' tollerante. Il fattore e' stato TARATO in
       due passate: a 0,22 i gialli tornavano giusti (2,08 su 2,4) ma i rossi restavano al doppio del vero
       (0,25 su 0,11); a 0,09 rientrano entrambi. Il secondo giallo costa undici volte il primo. */
    const _p=(0.16+(adv>=60?0.05:0)+(adv>=78?0.05:0))*(_st.g>=1?0.09:1);/* NON si normalizza: si sorteggia una volta per FALLO, e i falli sono gia' normalizzati */
    if(rnd()>=_p)return;
    _st.g++;
    if(_st.g>=2){_st.r=true;ev("espulsione",{chi:chi(W),su:chi(P),per:"seconda ammonizione",lato:W.team});}
    else ev("ammonizione",{chi:chi(W),su:chi(P),lato:W.team});
  }catch(_e){}};
  const fallo=(P)=>{const l=P.team;const m=piuVicino(P.x,P.y,altro(l),{noGk:true});const adv=advDi(P.x,l);
    const rig=adv>=84&&Math.abs(P.y-50)<=20;S.conta.falli++;
    _cart913(m?m.p:null,P,adv);
    if(rig)fermoSet("pen",l,xDa(89,l),50,{chi:chi(m?m.p:null),su:chi(P)});
    else fermoSet("foul",l,P.x,P.y,{chi:chi(m?m.p:null),su:chi(P),adv:+adv.toFixed(0)});};
  const fuoriCampo=(x,y,lPer,kind)=>{S.conta.fuori++;
    if(kind==="corner"){S.conta.corner++;fermoSet("corner",lPer,xDa(99,lPer),y>=50?98:2);}
    else if(kind==="goal_kick")fermoSet("goal_kick",lPer,xDa(6,lPer),50);
    else fermoSet("throw",lPer,clamp(x,6,94),y>=50?99:1);};

  /* ---------- il tick ---------- */
  /* [7.936 — IL MOTORE NON DEVE DIPENDERE DA QUANTO SPESSO LO SI CHIAMA]
     MISURATO: portando il banco da 11 a 22 decisioni al minuto, tiri 12,1 → 27,5 e falli 14,3 → 28,8 —
     esattamente il doppio. Non e' un caso: fallo e tiro si sorteggiano UNA VOLTA PER DECISIONE, quindi il
     loro numero a partita dipende da quante volte il chiamante interroga il motore, non da cosa succede in
     campo. E' lo stesso difetto che stanotte ho trovato nel banco (`tabellino-vero` misurava a 1 decisione
     al minuto una partita che se ne gioca 11) e che ho gia' dovuto rattoppare a mano nella 7.929, quando
     M1a aveva cambiato la frequenza delle decisioni di tenuta e i falli erano saliti a 19,1.
     Un fallo non e' «il 15 per cento per decisione»: e' un tot al minuto. Qui si normalizza: le probabilita'
     per decisione si moltiplicano per il tempo che quella decisione rappresenta, preso a 11 battiti al
     minuto (la cadenza della produzione di oggi). A 11 battiti il fattore vale 1 e NIENTE cambia — la
     7.933.1 in produzione resta numero per numero; a 22 ogni decisione pesa meta'. Rosso __CPM_NO936. */
  const _cad936=()=>{if(typeof window!=='undefined'&&window&&window.__CPM_NO936)return 1;
    /* Il fattore non sale MAI sopra 1: normalizza chi chiama piu' spesso di 11 volte al minuto, non
       amplifica chi chiama di meno. Cosi' i due regimi gia' spediti — il banco di test/logic a una
       decisione al minuto e la produzione a undici — restano identici al numero, e un metro spedito non
       si tocca per far passare una modifica. Che il motore non sia invariante anche SOTTO gli 11 battiti
       resta vero ed e' dichiarato: non serve a nessuno oggi, perche' la produzione sta a 11. */
    const _dt=S.dt||1;return Math.min(1,clamp(_dt*11,0.25,4));};
  const ramo=(k)=>{S.conta.rami[k]=(S.conta.rami[k]|0)+1;};
  function decidiTenuta(){
    const P=g[S.poss.padrone];if(!P){libero(S.palla.x,S.palla.y);return;}
    const l=P.team,d=dirDi(l);S.poss.t++;S.conta.tenuta++;S.quota[l]++;
    const press=pressioneSu(P),adv=advDi(P.x,l),zona=zonaDi(adv,P.y);
    const golReq=(S.richieste.gol&&S.richieste.gol.lato===l)?S.richieste.gol:null;
    if(golReq)golReq.t++;
    const att=S.richieste.att[l]||0;
    if(P.gk){ramo("gk");if(S.poss.t<2&&rnd()<0.5)return;const R=scegliRicevente(P,{});if(R)passa(P,R,{kind:hyp(R.x,R.y,P.x,P.y)>26?"lancio":"corto",sicuro:true});else{const R2=piuVicino(P.x,P.y,l,{noGk:true,escl:P.i});if(R2)passa(P,R2.p,{sicuro:true});}return;}
    if(S.richieste.turno&&S.richieste.turno!==l&&!golReq&&S.poss.t>=1){ramo("turno");if(rnd()<0.6)perdi(P,"contrasto");else{const R=scegliRicevente(P,{});if(R){const m=piuVicino((P.x+R.x)/2,(P.y+R.y)/2,altro(l),{noGk:true});passa(P,R,{sicuro:true});if(m){S.poss.icpt=m.p.i;S.poss.icptA=0.5;}}else perdi(P,"contrasto");}return;}
    /* [7.879] l'eroe ha il pallone e la scena e' stata chiesta: si dichiara l'occasione e si TIENE il
       pallone per questo tick, cosi' il live match puo' aprire la scena sul fatto invece che sul minuto */
    /* [23/09 POC — punto 4: IL BRAIN COSTRUISCE L'OCCASIONE CHIESTA. Misurato: 13 occasioni su 14 «fra le linee», perche'
       l'occasione scattava appena l'eroe superava la soglia della trequarti. Se il live chiede un tipo, il brain aspetta che la
       situazione in campo sia davvero quella (fino a 8 occasioni utili), poi accetta la prima: la scena nasce sempre dal motore.
       Nessun sorteggio in piu' (la partita resta riproducibile). Rosso: il live non chiede tipi (__CPM_NO_B7TIPO). */
    const _tipoOcc=(zz,pp,yy)=>(zz==="area"||zz==="limite")?(pp<3?"conclusione":"spalle"):(zz==="trequarti"?(Math.abs(yy-50)>=22?"fascia":"fra-le-linee"):"costruzione");
    if(S.richieste.scenaEroe&&P.eroe&&adv>=52&&S.richieste.scenaTipo&&_tipoOcc(zona,press,P.y)!==S.richieste.scenaTipo&&(S.richieste.scenaAttese|0)<8){S.richieste.scenaAttese=(S.richieste.scenaAttese|0)+1;}
    else     if(S.richieste.scenaEroe&&P.eroe&&adv>=52){const _z=zona,_pr=+press.toFixed(1);/* [7.879] una scena si apre dove c'e' una storia: mai dalla propria meta' campo */S.conta.occEroe=(S.conta.occEroe|0)+1;
      ev("occasione_eroe",{chi:chi(P),zona:_z,press:_pr,x:+P.x.toFixed(1),y:+P.y.toFixed(1),chiesto:S.richieste.scenaTipo||null,attese:S.richieste.scenaAttese|0,
        tipo:(_z==="area"||_z==="limite")?(press<3?"conclusione":"spalle"):(_z==="trequarti"?(Math.abs(P.y-50)>=22?"fascia":"fra-le-linee"):"costruzione"),
        liberi:g.filter(q=>mio(q,l)&&!q.gk&&q.i!==P.i&&advDi(q.x,l)>adv&&(piuVicino(q.x,q.y,altro(l),{noGk:true})||{d:99}).d>=4).length,
        /* [23/09 POC — B4: IL CAST DELLA SCENA LO DICHIARA IL MOTORE. Direttiva PO «il 3D parla solo col brain».] Chi riceve, chi
           difende, quale portiere: SOLO letture deterministiche (nessun rnd(): il flusso dei sorteggi non si sposta, la partita
           resta riproducibile). Ricevente = il compagno di movimento libero (avversario piu' vicino >= 4) col miglior
           avanzamento meno meta' della distanza dall'eroe; se nessuno e' libero, il compagno piu' vicino. */
        cast:(()=>{try{let R=null,rs=-1e9;for(const q of g){if(!mio(q,l)||q.gk||q.i===P.i)continue;const lib=(piuVicino(q.x,q.y,altro(l),{noGk:true})||{d:99}).d>=4;const sc=advDi(q.x,l)-0.5*hyp(q.x,q.y,P.x,P.y)+(lib?20:0);if(sc>rs){rs=sc;R=q;}}
          const D=piuVicino(P.x,P.y,altro(l),{noGk:true});const K=g.find(q=>q.gk&&q.team===altro(l)&&attivo(q))||null;
          return {ricevente:chi(R),difensore:D?chi(D.p):null,portiere:chi(K)};}catch(_eC){return null;}})()});
      ev("controllo",{chi:chi(P),press:_pr,zona:_z});return;}
    /* [7.894] IL PRIMO TOCCO NON E' SEMPRE UNA SOSTA. Il «controllo» al primo tick di ogni possesso (7.870) fermava
       il pallone ai piedi per un minuto intero in un possesso su due: banco 8 partite, rami.controllo 19 su 92
       tick, 21 passaggi e 2,9 tiri a partita, 0 azioni da tre passaggi — e sul telefono il PO vede «un pallone
       senza proprietario e nessuna azione». Nel calcio vero il primo tocco e il passaggio stanno nello stesso
       secondo: la sosta resta solo sotto pressione o quando non c'e' nessuno a cui dare la palla. Rosso __CPM_NO894. */
    const _sosta894=(typeof window!=='undefined'&&window&&window.__CPM_NO894)?true:(press>=2.6||rnd()<0.22||!scegliRicevente(P,{}));
    if(S.poss.t===1&&!golReq&&_sosta894&&!(press>=4&&adv>=56&&rnd()<0.6)){ramo("controllo");
      if(zona==="area"&&press>=2.2&&rnd()<0.55){ramo("tiro1");tira(P);return;}
      if(press<1.8&&rnd()<0.12){ramo("persa1");perdi(P);return;}
      ev("controllo",{chi:chi(P),press:+press.toFixed(1),zona});return;/* controllo: il pallone sta ai piedi un tick */
    }
    /* [7.875 l'arbitro esiste] In una partita vera il gioco si ferma di continuo: ~25 falli, ~40 rimesse,
       ~10 angoli. Il motore ne faceva 3,5 a partita (un'interruzione ogni 24 minuti di gioco) e la banda
       del guardiano (>=3 per partita) usciva rossa o verde a caso. Il fischio ora c'e' anche mentre il
       gol e' decretato, a meta' probabilita' e solo finche' il tetto ha margine (t<=4): la punizione fa
       parte della costruzione, non la sospende. */
    /* [7.900.0 — A4: LA SQUADRA TIRA. Rosso __CPM_NO900] Diagnosi al banco (16 partite, dt=1/3, 57 decisioni di tenuta a partita):
       tiri 3,5 a partita (area 1,3, quasi tutti di testa su cross); il portatore decide in area l'1-2 % delle volte e al limite
       tira nel 3 % dei casi. Il FALLO e' il primo modo in cui muore un attacco: 17 % di tutte le decisioni (23 % al limite,
       21 % in trequarti, 9,5 a partita), perche' la 7.875 lo sorteggia PRIMA del tiro con 0,26 sotto pressione e 0,14 anche
       senza nessuno vicino. Qui: (a) il fallo pesa 0,18 sotto pressione (un avversario entro 3u) e 0,05 altrimenti;
       (b) al limite e in area il fallo si sorteggia DOPO il tiro; (c) al limite con la strada libera la conduzione punta la
       porta (passo +4u, rientro al centro). Metro al banco: tiri, tiri dall'area, falli, decisioni in area. */
    const _no900=(typeof window!=='undefined'&&window&&window.__CPM_NO900);
    const _dopo900=!_no900&&(zona==="limite"||zona==="area")&&!golReq;
    const _no903=(typeof window!=='undefined'&&window&&window.__CPM_NO903);/* [7.903] l'arbitro esiste: la 7.900 aveva portato la banda «arbitro-esiste» del ci sul filo (6 → 4-6 interruzioni in 2 partite); sotto pressione 0,18 → 0,22, libero 0,05 → 0,08 (decisione PO 15/09: costa 0,3 tiri a partita al banco) */
    /* [7.929 — IL CONTO DEI FALLI DOPO M1a] Il fallo si sorteggia a OGNI decisione di tenuta. La 7.928 ha
       portato le decisioni di tenuta dal 34,9 % al 50,1 % delle chiamate (×1,436) e i falli sono saliti da
       13,3 a 19,1 per squadra: 13,3 × 1,436 = 19,1, il conto torna alla virgola. Non e' cambiato niente
       nell'arbitro — sono cambiate le occasioni di fischiare. La probabilita' per singola decisione va
       quindi riportata indietro dello stesso fattore: 13,0 / 19,1 = 0,68. I rami dei rossi storici
       (__CPM_NO900, __CPM_NO903) restano com'erano, altrimenti non riprodurrebbero piu' il loro difetto. */
    const _k929=(typeof window!=='undefined'&&window&&window.__CPM_NO929)?1:0.68;
    const _fallo900=()=>{const r=rnd();const pFb=(_no900?((press<3?0.26:0.10)+(adv>=56?0.04:0)):(_no903?((press<3?0.18:0.05)+(adv>=56?0.03:0)):((press<3?0.22:0.08)+(adv>=56?0.03:0))*_k929))*_cad936();
      const pF=golReq?((golReq.t|0)<=3?pFb*0.5:0):pFb;
      if(pF>0&&r<pF){ramo(golReq?"falloGol":"fallo");fallo(P);return true;}
      /* [7.933 — L'INTERVENTO PULITO ESISTE, non solo il fallo]
         MISURATO: contrasti vinti 1,38 contro 16,5 veri, mentre i falli stanno a 14,5 su 13. Il difensore
         interviene eccome — «fallo» e' il ramo difensivo piu' battuto della partita — ma l'esito e' quasi
         sempre il fischio: 9 % di interventi puliti contro il 56 % del calcio vero (16,5 contrasti vinti
         contro 13 falli). La fascia che porta al contrasto era larga 0,06 fisso e chiedeva un avversario
         entro 2,2 unita'; ora e' proporzionale a quella del fallo (x1,27, il rapporto vero fra le due voci)
         e usa la stessa soglia di pressione del fallo. Rosso __CPM_NO933. */
      const _no933=(typeof window!=='undefined'&&window&&window.__CPM_NO933);
      const _pT933=_no933?0.06:pFb*1.27;/* 1,27 e il rapporto vero fra contrasti vinti (16,5) e falli (13); provato anche 0,85, peggiore su tutti i fronti */
      if(!golReq&&press<(_no933?2.2:3)&&r<pF+_pT933){ramo("contrasto");perdi(P);return true;}return false;};
    if(!_dopo900&&_fallo900())return;
    const verso=S.richieste.verso;
    /* [7.950 — IL TIRO E' UNA DECISIONE, NON UN RIFLESSO. Rosso __CPM_NO950]
       In area si calciava l'85 % delle volte. Misurato alla cadenza spedita: 22,5 tiri contro 12,8 veri
       (1,76x) e 11,3 tiri FUORI contro 4,5 (2,51x), la voce peggiore rimasta — mentre i passaggi stanno
       ancora a 0,50x. Nel calcio vero da dentro l'area si passa eccome, e la direttiva del motore dice
       che gli eventi sono CONSEGUENZE di una scelta, non l'esito ordinario dell'essere in una zona.
       Le quote scendono e cio' che si toglie al tiro torna al passaggio, che e' la voce affamata. */
    const _t950=(typeof window!=='undefined'&&window&&window.__CPM_NO950);
    let pTiro=(zona==="area"?(_t950?0.85:0.55):zona==="limite"?(_t950?0.45:0.30):zona==="trequarti"?(_t950?0.12:0.08):0)*_cad936();
    pTiro*=(1+0.35*att);if(press<2.4)pTiro*=0.6;if(verso)pTiro*=0.3;
    /* [7.884.0 — IL TIRO GUARDA L'ANGOLO. MISURATO al banco (48 partite, che cosa fa il portatore banda
       per banda): sotto 70 il portatore controlla, passa e conduce; appena supera 70 il 35 % delle sue
       decisioni e' un TIRO (tiroGol 20 % + tiro 15 %) e la conduzione crolla dal 16 al 10 %. Oltre
       avanzamento 90 ci arriva 11 volte in 48 partite. La squadra non e' che non sale: SMETTE DI SALIRE
       perche' tira. E la ragione e' nella formula qui sopra — pTiro e' un sorteggio piatto per zona
       (area 0,85 · limite 0,45 · trequarti 0,12) che non guarda DOVE si e': un esterno a y=20, con la
       porta di taglio, tira comunque 45 volte su 100. E' lo stesso difetto che il PO chiama «tiro da
       distanza enorme» e «6 conclusioni su 9 da fuori area».
       Qui non si abbassa una costante: si aggiunge la grandezza che mancava. Dal fondo non si tira —
       si mette in mezzo o si rientra — e piu' si e' larghi meno la porta e' un bersaglio. Dentro il
       corridoio centrale (|y-50| <= 12) nulla cambia. Rosso appaiato: __CPM_NO884. */
    {const _no884=(typeof window!=='undefined'&&window&&window.__CPM_NO884);
     if(!_no884&&zona!=="area"){const _lar=Math.abs(P.y-50);
       if(_lar>12)pTiro*=Math.max(0.12,1-(_lar-12)/26);}}
    /* [7.888.0 — DAL LIMITE SI TIRA QUANDO NON SI PUO' ENTRARE.
       MISURATO al banco (48 partite, 188 conclusioni): trequarti 22 % · **limite 61 %** · area 17 %.
       In una partita vera dall'area parte circa la meta' dei tiri; qui ne parte un sesto, ed e' la
       nota del PO «6 conclusioni su 9 partono da fuori area». La causa e' nell'ORDINE delle decisioni:
       `spazioAvanti` si calcola alla riga 251, ma il tiro si decide alla 236 — il portatore spara
       PRIMA di sapere se ha strada per entrare in area. Non si abbassa la probabilita' del limite:
       le si da' l'informazione che le mancava. Con la strada libera davanti si entra; murati, si
       calcia. Rosso appaiato: __CPM_NO888. */
    {const _no888=(typeof window!=='undefined'&&window&&window.__CPM_NO888);
     if(!_no888&&zona==="limite"&&!golReq){const _sp888=spazioAvanti(P);
       if(_sp888>=4)pTiro*=0.35;else if(_sp888>=2)pTiro*=0.6;}}
    if(golReq){if(zona==="area"||zona==="limite"||(zona==="trequarti"&&golReq.t>=5)){ramo("tiroGol");tira(P);return;}
      /* [7.872] il gol decretato si COSTRUISCE fino all'area: mai un tiro da centrocampo o dalla propria meta' (banco 7.871: 68 tiri col decreto su 130 partivano da «dietro»). Chi ha la palla lancia il compagno piu' avanzato o porta palla; il tiro parte dal limite, dall'area, o dalla trequarti solo dopo cinque tick */
      const M=piuAvanzato(l,P.i);
      if(M&&advDi(M.x,l)>=adv+6&&hyp(M.x,M.y,P.x,P.y)>=5){ramo("lancioGol");passa(P,M,{kind:hyp(M.x,M.y,P.x,P.y)>26?"lancio":"verticale",sicuro:golReq.t>=2});return;}
      if(adv<86){ramo("conduciGol");conduci(P);return;}}
    else if(rnd()<pTiro){ramo("tiro");tira(P);return;}
    if(_dopo900&&_fallo900())return;/* [7.900] il fallo, dopo il tiro */
    const spazio=spazioAvanti(P);
    const largo=Math.abs(P.y-50)>=22;
    /* [diag 7.930] il cross chiede TRE cose insieme: portatore avanzato (adv>=72), portatore largo
       (|y-50|>=22) e un compagno GIA' in area (adv>=78, |y-50|<=20). Al banco i cross sono 2,12 contro 15:
       questi tre contatori dicono quale delle tre manca, invece di farlo indovinare. */
    if(!golReq&&adv>=72)ramo("cross_avanti");
    if(!golReq&&adv>=72&&largo)ramo("cross_largo");
    if(!golReq&&adv>=72&&largo&&rnd()<0.55){let R=null,bs=-1e9;for(const q of g){if(!mio(q,l)||q.i===P.i||q.gk)continue;const aq=advDi(q.x,l);if(aq<78||Math.abs(q.y-50)>20)continue;const sc=aq+(q.eroe?4:0)+rnd()*6;if(sc>bs){bs=sc;R=q;}}if(R){ramo("cross");cross(P,R);return;}ramo("cross_senzaRicevente");}
    if(verso&&!golReq){const dv=hyp(P.x,P.y,verso.x,verso.y);if(dv>10){let R=null,bs=1e9;for(const q of g){if(!mio(q,l)||q.i===P.i||q.gk)continue;const dq=hyp(q.x,q.y,verso.x,verso.y);const dd=hyp(q.x,q.y,P.x,P.y);if(dd<5||dd>40)continue;if(dq<bs){bs=dq;R=q;}}if(R&&bs<dv-4){passa(P,R,{sicuro:true});return;}}}
    /* [7.888 v2 — CHI ARRIVA AL LIMITE CON LA STRADA LIBERA PUO' ENTRARE.
       MISURATO al banco (48 partite, 188 conclusioni): trequarti 22 % · limite 61 % · area 17 %, cioe'
       la nota del PO «6 conclusioni su 9 partono da fuori area». La v1 abbassava il tiro dal limite con
       la strada libera e ha FALLITO la sua stessa misura (limite 115→106 ma area 32→28): toglieva tiri
       senza che nessuno entrasse. La causa vera e' qui: `pCond` vale ZERO oltre il terzo tick di
       possesso e oltre avanzamento 86, quindi chi arriva al limite dopo tre tocchi non puo' condurre —
       puo' solo passare o calciare — e nell'area non ci entra mai nessuno palla al piede.
       Qui la conduzione resta come prima, MA chi e' al limite con la strada davvero libera (spazio >= 4)
       puo' portarla dentro anche oltre il terzo tick, fino ad avanzamento 90. Rosso: __CPM_NO888. */
    const _no888b=(typeof window!=='undefined'&&window&&window.__CPM_NO888);
    const _entra888=!_no888b&&zona==="limite"&&spazio>=4&&adv<90;
    const pCond=(_entra888||(S.poss.t<=3&&adv<86))?((spazio>=2?(S.poss.t===2?0.55:0.32):(S.poss.t===2?0.40:0.20))+(golReq?0.10:0)+(P.eroe?0.08:0)+(_entra888?0.30:0)):0;
    if(rnd()<pCond){if(press<3&&spazio<2&&rnd()<0.22){if(rnd()<0.35){ramo("dribblingFallo");fallo(P);return;}ramo("dribblingPerso");perdi(P);return;}
      if(Math.abs(P.y-50)>=38&&rnd()<0.42){ramo("conduzioneFuori");ev("fuori",{chi:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1)});fuoriCampo(P.x,P.y,altro(l),"throw");return;}
      ramo("conduci");conduci(P,{spinta:_entra888});return;}
    const R=scegliRicevente(P,{golReq});
    if(R){ramo("passa");passa(P,R);return;}
    if(spazio>=3&&adv<90){ramo("conduci2");conduci(P);return;}
    ramo("ripiego");const R2=piuVicino(P.x,P.y,l,{escl:P.i});if(R2)passa(P,R2.p,{sicuro:true});else perdi(P);
  }
  function muoviVolo(){
    const p=S.poss;const _dt=S.dt||1;if(S.fase<=1e-9)S.conta.volo++;p.t+=_dt;/* [7.898] il volo avanza di v·dt per chiamata; t conta minuti */
    const R=p.ricevente!=null?g[p.ricevente]:null;
    if(p.tipo==="passaggio"&&R&&attivo(R)){const _k=Math.pow(0.5,_dt);p.a.x=clamp(R.x+(p.a.x-R.x)*_k,2,98);p.a.y=clamp(R.y+(p.a.y-R.y)*_k,3,97);}
    const dx=p.a.x-S.palla.x,dy=p.a.y-S.palla.y,dd=Math.hypot(dx,dy);
    const passo=Math.min(dd,p.v*_dt);
    let arrivato=false;
    if(p.icpt!=null){const tot=hyp(p.da.x,p.da.y,p.a.x,p.a.y)||1;const fatto=hyp(p.da.x,p.da.y,S.palla.x,S.palla.y);const frazDopo=(fatto+passo)/tot;
      if(frazDopo>=p.icptA){const W=g[p.icpt];const ix=p.da.x+(p.a.x-p.da.x)*p.icptA,iy=p.da.y+(p.a.y-p.da.y)*p.icptA;if(W&&attivo(W)&&hyp(W.x,W.y,ix,iy)<=((typeof window!=='undefined'&&window.__CPM_NO923)?4.5:7)){/* [7.923] da 4,5 a 7: il difensore ALLUNGA la gamba, non aspetta che il pallone gli arrivi addosso */W.x=clamp(ix,2,98);W.y=clamp(iy,3,97);S.conta.intercetti++;ev("intercetto",{chi:chi(W),da:chi(g[p.ultimoPassatore]),x:+ix.toFixed(1),y:+iy.toFixed(1)});tenuta(W,null);return;}}}
    if(dd<=p.v*_dt+0.01){S.palla.x=p.a.x;S.palla.y=p.a.y;arrivato=true;}
    else{S.palla.x+=dx/dd*passo;S.palla.y+=dy/dd*passo;}
    if(!arrivato){if(p.t>=4-1e-9){libero(S.palla.x,S.palla.y);}return;}
    /* arrivo */
    if(p.tipo==="tiro"){arrivoTiro();return;}
    if(p.tipo==="fuori"){ev("fuori",{x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1),da:chi(p.ultimoPassatore!=null?g[p.ultimoPassatore]:null)});fuoriCampo(S.palla.x,S.palla.y,altro(p.lato),"throw");return;}
    if(p.tipo==="cross"){arrivoCross();return;}
    if(R&&attivo(R)&&hyp(R.x,R.y,S.palla.x,S.palla.y)<=4.5){R.x=clamp(S.palla.x-dirDi(R.team)*0.4,2,98);R.y=S.palla.y;if(R.eroe)S.conta.ricezioniHero++;ev("ricezione",{chi:chi(R),kind:p.kind||null,da:chi(p.ultimoPassatore!=null?g[p.ultimoPassatore]:null),from:p.da?{x:+p.da.x.toFixed(1),y:+p.da.y.toFixed(1)}:null,to:{x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)}});tenuta(R,null);return;}
    libero(S.palla.x,S.palla.y);
  }
  function arrivoTiro(){const p=S.poss;const P=g[p.tiratore];const l=p.lato,out=p.esito;const gk=portiereDi(altro(l));
    if(out==="goal"){S.rete={lato:l,t:0};S.poss.stato="rete";S.conta.gol[l]++;const gr=S.richieste.gol;if(gr&&gr.lato===l){if(gr.t>=5)S.conta.golForzati++;S.richieste.gol=null;}
      ev("gol",{chi:chi(P),assist:chi(p.ultimoPassatore!=null&&p.ultimoPassatore!==p.tiratore?g[p.ultimoPassatore]:null),lato:l,x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)});return;}
    if(out==="saved"){const corner=rnd()<0.35;ev("parata",{gk:chi(gk),chi:chi(P),corner});if(corner)fuoriCampo(S.palla.x,S.palla.y,l,"corner");else{gk.x=xDa(5,altro(l));gk.y=clamp(S.palla.y,42,58);tenuta(gk,null);S.poss.t=0;}return;}
    /* [7.913.0 — A8] I CORNER. Il tabellino del PO segnava «calci d'angolo 0» a fine partita, e il banco dava
       1,45 per squadra contro i 4,9 veri. Nel calcio vero il corner nasce quasi sempre da una deviazione: un
       tiro murato che sbatte sul difensore e finisce sul fondo, un palo che rimbalza fuori, una spazzata di
       testa in angolo. Qui il tiro MURATO e il PALO possono finire in angolo, come succede in campo. */
    const _no913c=(typeof window!=='undefined'&&window&&window.__CPM_NO913);
    if(out==="post"){ev("palo",{chi:chi(P)});if(!_no913c&&rnd()<0.34){fuoriCampo(S.palla.x,S.palla.y,l,"corner");return;}libero(xDa(93,l),clamp(S.palla.y+(rnd()-0.5)*14,30,70));return;}
    if(out==="blocked"){const m=piuVicino(S.palla.x,S.palla.y,altro(l),{noGk:true});ev("murato",{chi:chi(m?m.p:null),su:chi(P)});
      if(!_no913c&&rnd()<0.40){fuoriCampo(S.palla.x,S.palla.y,l,"corner");return;}/* [7.913 A8] la deviazione in angolo */
      libero(clamp(S.palla.x-dirDi(l)*(3+rnd()*6),2,98),clamp(S.palla.y+(rnd()-0.5)*10,4,96));return;}
    ev("fuori",{chi:chi(P),x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)});fuoriCampo(S.palla.x,S.palla.y,altro(l),"goal_kick");
  }
  function arrivoCross(){const p=S.poss;const l=p.lato;const R=p.ricevente!=null?g[p.ricevente]:null;
    const A=piuVicino(S.palla.x,S.palla.y,l,{noGk:true});const D=piuVicino(S.palla.x,S.palla.y,altro(l),{noGk:true});
    const att=(R&&attivo(R)&&hyp(R.x,R.y,S.palla.x,S.palla.y)<6)?R:(A&&A.d<6?A.p:null);
    const dif=(D&&D.d<4)?D.p:null;
    /* [diag] le spazzate stanno a 0,17 contro 17 vere, e l'unico punto che ne produce e' questo.
       Tre contatori per sapere QUALE dei tre pezzi manca, invece di tarare al buio: quante volte
       un cross arriva, quanto e' lontano il difensore piu' vicino, quante volte entra nel raggio. */
    ramo("spazz_arrivo");
    if(D){S.conta.spazzDist=(S.conta.spazzDist||0)+D.d;S.conta.spazzN=(S.conta.spazzN||0)+1;
      if(D.d<4)ramo("spazz_difVicino"); else if(D.d<8)ramo("spazz_dif4_8"); else ramo("spazz_difLontano");}
    else ramo("spazz_nessunDif");
    if(dif&&(!att||rnd()<0.5)){dif.x=S.palla.x;dif.y=S.palla.y;const corner=rnd()<0.30;const _lat=!corner&&rnd()<0.20;ev("spazzata",{chi:chi(dif),corner});if(corner)fuoriCampo(S.palla.x,S.palla.y,l,"corner");else if(_lat){/* [7.878] la spazzata finisce spesso in rimessa laterale */fuoriCampo(clamp(S.palla.x-dirDi(l)*(6+rnd()*10),6,94),S.palla.y,l,"throw");return;}else libero(clamp(S.palla.x-dirDi(l)*(14+rnd()*10),4,96),clamp(S.palla.y+(rnd()-0.5)*30,6,94));return;}
    if(att){att.x=S.palla.x;att.y=S.palla.y;if(rnd()<0.62){tira(att,{intent:"header"});return;}tenuta(att,null);ev("ricezione",{chi:chi(att),kind:"cross"});return;}
    const gk=portiereDi(altro(l));if(hyp(gk.x,gk.y,S.palla.x,S.palla.y)<9){ev("presa",{gk:chi(gk)});gk.x=xDa(5,altro(l));gk.y=clamp(S.palla.y,42,58);tenuta(gk,null);return;}
    libero(S.palla.x,S.palla.y);
  }
  function tickLibero(sub){if(!sub){S.conta.libero++;S.poss.t++;}/* [7.898] sub: sotto-tick, solo la raccolta */
    const n=piuVicino(S.palla.x,S.palla.y,null,{noGk:true});const gk=piuVicino(S.palla.x,S.palla.y,null,{});
    let c=(gk&&gk.p.gk&&gk.d<4)?gk:n;
    if(S.richieste.turno){const w=piuVicino(S.palla.x,S.palla.y,S.richieste.turno,{noGk:true});if(w&&w.d<=5&&(!c||w.d<=c.d+2))c=w;}
    if(c&&c.d<=3.2){const P=c.p;if(P.team!==S.poss.lato){S.conta.contrasti++;ev("recupero",{chi:chi(P),x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)});}P.x=S.palla.x-dirDi(P.team)*0.4;P.y=S.palla.y;tenuta(P,null);return;}
    if(!sub&&S.poss.t>=6&&c&&c.d<=4.5){c.p.x=S.palla.x;c.p.y=S.palla.y;tenuta(c.p,null);}
  }
  function tickFermo(){const f=S.fermo;S.poss.t++;f.t++;S.conta.fermo++;S.palla.x=f.x;S.palla.y=f.y;
    if(f.t<f.tot)return;
    const l=f.lato;S.poss.lato=l;
    const B0=f.batt!=null?g[f.batt]:null;if(B0&&attivo(B0)&&hyp(B0.x,B0.y,f.x,f.y)>5&&f.t<f.tot+3)return;/* il battitore sta ancora arrivando */
    if(f.kind==="throw"){const T=(B0&&attivo(B0))?{p:B0}:piuVicino(f.x,f.y,l,{noGk:true});if(!T){libero(f.x,f.y);return;}T.p.x=f.x;T.p.y=clamp(f.y,2,98);S.fermo=null;const R=scegliRicevente(T.p,{})||(piuVicino(f.x,f.y,l,{noGk:true,escl:T.p.i})||{}).p;ev("battuta",{kind:"throw",chi:chi(T.p)});if(R){S.palla.x=f.x;S.palla.y=f.y;passa(T.p,R,{sicuro:true,kind:"corto"});}else tenuta(T.p,null);return;}
    if(f.kind==="goal_kick"){const gk=portiereDi(l);gk.x=f.x;gk.y=f.y;S.fermo=null;ev("battuta",{kind:"goal_kick",chi:chi(gk)});S.palla.x=f.x;S.palla.y=f.y;const R=scegliRicevente(gk,{});if(R)passa(gk,R,{sicuro:true,kind:hyp(R.x,R.y,gk.x,gk.y)>26?"lancio":"corto"});else tenuta(gk,null);return;}
    if(f.kind==="corner"){const T=(B0&&attivo(B0))?{p:B0}:piuVicino(f.x,f.y,l,{noGk:true});if(!T){libero(f.x,f.y);return;}T.p.x=f.x;T.p.y=f.y;S.fermo=null;S.palla.x=f.x;S.palla.y=f.y;let R=null,bs=-1e9;for(const q of g){if(!mio(q,l)||q.i===T.p.i||q.gk)continue;const sc=advDi(q.x,l)-Math.abs(q.y-50)*0.5+(q.eroe?3:0)+rnd()*5;if(sc>bs){bs=sc;R=q;}}ev("battuta",{kind:"corner",chi:chi(T.p)});cross(T.p,R,{corner:true});return;}
    if(f.kind==="pen"){const T=(B0&&attivo(B0))?B0:null;if(!T){libero(f.x,f.y);return;}T.x=f.x-dirDi(l)*1.5;T.y=f.y;S.fermo=null;S.palla.x=f.x;S.palla.y=f.y;ev("battuta",{kind:"pen",chi:chi(T)});tira(T,{intent:"penalty"});return;}
    /* punizione */
    const T=(B0&&attivo(B0))?{p:B0}:piuVicino(f.x,f.y,l,{noGk:true});if(!T){libero(f.x,f.y);return;}T.p.x=f.x-dirDi(l)*1.2;T.p.y=f.y;S.fermo=null;S.palla.x=f.x;S.palla.y=f.y;
    const adv=advDi(f.x,l);ev("battuta",{kind:"foul",chi:chi(T.p),adv:+adv.toFixed(0)});
    if(adv>=72&&Math.abs(f.y-50)<=26&&rnd()<0.7){tira(T.p,{intent:"freekick"});return;}
    if(adv>=62&&rnd()<0.5){let R=null,bs=-1e9;for(const q of g){if(!mio(q,l)||q.i===T.p.i||q.gk)continue;const aq=advDi(q.x,l);if(aq<76)continue;const sc=aq+rnd()*6;if(sc>bs){bs=sc;R=q;}}if(R){cross(T.p,R);return;}}
    const R=scegliRicevente(T.p,{});if(R)passa(T.p,R,{sicuro:true});else tenuta(T.p,null);
  }
  function tickRete(){S.rete.t++;S.conta.rete++;S.poss.t++;if(S.rete.t>=2){const l=altro(S.rete.lato);S.rete=null;S.kickoff={lato:l,t:0};S.poss.stato="kickoff";S.poss.lato=l;S.poss.padrone=null;S.palla.x=50;S.palla.y=50;ev("centro",{lato:l});}}
  function tickKickoff(){const k=S.kickoff;k.t++;S.conta.kickoff++;S.poss.t++;S.palla.x=50;S.palla.y=50;S.poss.lato=k.lato;
    if(k.t<2)return;
    const l=k.lato;let A=null,B=null,da=1e9,db=1e9;for(const q of g){if(!mio(q,l)||q.gk)continue;const d=hyp(q.x,q.y,50,50);if(d<da){db=da;B=A;da=d;A=q;}else if(d<db){db=d;B=q;}}
    if(!A){libero(50,50);return;}
    if(hyp(A.x,A.y,50,50)>6&&k.t<5)return;
    A.x=50-dirDi(l)*0.8;A.y=50;if(B&&hyp(B.x,B.y,50,50)<=8){B.x=50-dirDi(l)*3;B.y=53;}else B=null;
    S.poss.padrone=A.i;S.poss.stato="tenuta";ev("calcio_inizio",{chi:chi(A),lato:l});
    if(B)passa(A,B,{sicuro:true,kind:"appoggio"});else tenuta(A,null);
  }

  /* ---------- il movimento dei ventidue ---------- */
  function muoviTutti(){
    const _rj=()=>S._rjScena?S._rjScena():rnd();/* [23/09 POC B3] in scena le oscillazioni usano un generatore locale: il flusso della partita non dipende dal tempo di lettura */
    const st=S.poss.stato,l=S.poss.lato,d=dirDi(l);
    const bx=S.palla.x,by=S.palla.y;
    const padrone=S.poss.padrone!=null?g[S.poss.padrone]:null;
    const ric=S.poss.ricevente!=null?g[S.poss.ricevente]:null;
    /* inseguitore: il difendente piu' vicino alla palla; copertura: il secondo */
    let ins=null,cop=null,di=1e9,dc=1e9;
    if(st==="tenuta"||st==="volo"||st==="libero"){for(const q of g){if(!attivo(q)||q.gk)continue;if(st!=="libero"&&q.team===l)continue;if(st==="libero"&&S.richieste.turno&&q.team!==S.richieste.turno)continue;const dd=hyp(q.x,q.y,bx,by);if(dd<di){dc=di;cop=ins;di=dd;ins=q;}else if(dd<dc){dc=dd;cop=q;}}}
    S.inseguitore=ins?ins.i:null;
    /* appoggi: i due compagni piu' vicini al padrone, davanti a lui */
    /* [7.924 M1] IL SOSTEGNO SI FORMA MENTRE LA PALLA VIAGGIA, non dopo. Misurato: il sostegno esisteva solo con qualcuno che teneva il pallone (33 per cento del tempo) e il passaggio partiva subito dopo, quindi i compagni non facevano in tempo ad avvicinarsi — a 5 unita al minuto si spostano di mezza unita per battito. Ora il riferimento e il RICEVENTE quando la palla e in volo: i compagni si mettono a posto mentre arriva. */
    const _m924=!(typeof window!=='undefined'&&window.__CPM_NO924);
    const _rif924=padrone||((_m924&&st==="volo"&&S.poss.ricevente!=null)?g[S.poss.ricevente]:null);
    const app=[];if(_rif924&&(st==="tenuta"||(_m924&&st==="volo"))){const c=[];for(const q of g){if(!mio(q,l)||q.gk||q.i===_rif924.i)continue;c.push({q,d:hyp(q.x,q.y,_rif924.x,_rif924.y)});}c.sort((a,b)=>a.d-b.d);for(let i=0;i<Math.min(_m924?3:2,c.length);i++)app.push(c[i].q);}
    const advB=advDi(bx,l);
    for(const p of g){if(!attivo(p))continue;
      if(p.i===S.poss.padrone&&st==="tenuta")continue;/* il padrone si muove solo con la conduzione */
      const sl=slotDi(p);let tx,ty,v=4.5;
      const inPoss=(p.team===l)&&(st==="tenuta"||st==="volo"||st==="kickoff");
      const dp=dirDi(p.team);
      if(p.gk){tx=sl.x+dp*(inPoss?1.5:0);ty=50+(by-50)*0.18;v=2.5;}
      else{
        const spinta=inPoss?clamp((advB-40)*(p.rl==="AT"?0.55:0.35),-4,(p.rl==="AT"?26:14)):clamp((advDi(bx,p.team)-50)*0.30,-10,4);
        tx=sl.x+dp*spinta+(bx-50)*0.35;
        /* [7.876 il campo e' largo quanto il campo] La squadra si SPOSTA verso il pallone mantenendo la
           forma, non COLLASSA sul pallone: con `sl.y+(by-sl.y)*0.22` ogni giocatore veniva tirato verso
           la y della palla, che parte da 50 e non esce mai — risultato misurato: pallone nel corridoio
           27-74 per il 95 % del tempo, rimesse laterali ZERO in 48 partite. Ora il blocco trasla
           (`(by-50)*0.30`) e le corsie restano: chi parte largo resta largo. */
        ty=sl.y+(by-50)*0.30;
        if(p.rl==="DF"&&!inPoss){tx=sl.x+dp*Math.min(spinta,0)+(bx-50)*0.25;}
        /* [7.872] col gol decretato le punte di quel lato salgono al limite dell'area: il lancio ha un bersaglio */
        {const gr=S.richieste.gol;if(gr&&p.team===gr.lato&&p.rl==="AT"&&st!=="fermo"&&advDi(tx,p.team)<80){tx=xDa(80+(p.i%3)*2,p.team);ty=sl.y+(by-sl.y)*0.35;v=6;}}
        /* [23/09 POC — punto 4: IL BRAIN PORTA L'EROE DOVE NASCE L'OCCASIONE CHIESTA. Rosso __CPM_NO_B7POS] Misurato: senza questo,
           nessuna «conclusione» e nessuna «fascia» in 9 scene — l'eroe stava sempre al suo posto (x 60, y 50) e l'occasione nasceva
           sulla soglia della trequarti. Con la scena chiesta e la squadra in possesso, l'eroe senza palla va dove quel tipo nasce:
           in area (conclusione), largo sul suo lato (fascia), al limite (spalle), fra le linee o piu' indietro (costruzione). */
        {const tq=S.richieste.scenaEroe&&S.richieste.scenaTipo;
         if(tq&&p.eroe&&inPoss&&st!=="fermo"&&!(typeof window!=='undefined'&&window.__CPM_NO_B7POS)){
           if(tq==="conclusione"){tx=xDa(84,p.team);ty=50+(p.y>=50?6:-6);}
           else if(tq==="fascia"){tx=xDa(72,p.team);ty=p.y>=50?84:16;}
           else if(tq==="spalle"){tx=xDa(79,p.team);ty=50;}
           else if(tq==="fra-le-linee"){tx=xDa(68,p.team);ty=50+(p.y>=50?4:-4);}
           else if(tq==="costruzione"){tx=xDa(46,p.team);ty=p.y;}
           v=6;}}
        /* [7.883 v2 — L'AREA LA RIEMPIE CHI STA DAL LATO OPPOSTO AL PALLONE.
           MISURATO al banco (16 partite): cross in gioco aperto 0,38 a partita. La condizione che il
           motore richiede (portatore avanzato e largo) ricorre 2,81 volte a partita, ma in 27 casi su
           45 (60 %) non c'e' un compagno dentro il corridoio centrale a >= 78. La causa e' la
           traslazione della 7.876: con la palla larga il blocco SEGUE la fascia invece di attaccare i
           pali. Qui si muove SOLO chi parte dal lato opposto al pallone: il lato della palla resta
           intatto e l'area si riempie dal lato cieco, come nel calcio vero.
           ⚠️ LEZIONE DELLO STRUMENTO, prima delle cifre: la prima tornata di misure sorteggiava i gol
           decretati con Math.random(), e due corse DELLO STESSO codice davano 0,50 e 0,19 cross in
           gioco aperto. Su quel rumore avevo revocato la v1 (area riempita da entrambi i lati)
           attribuendole di svuotare la fascia: con la sonda resa ripetibile (seme fisso) e 48 partite
           la v1 NON svuota niente (la condizione resta 3,21 contro 3,15) e non peggiora i cross
           (0,35 contro 0,31). Quella revoca era sbagliata, e la sua spiegazione pure.
           MISURE APPAIATE, 48 partite, sonda ripetibile — cross in gioco aperto · condizione · occasioni
           senza ricevente:  rosso 0,31 · 3,15 · 58 %   |   v1 0,35 · 3,21 · 49 %   |   v2 0,48 · 3,19 · 43 %. */
        {const _no883=(typeof window!=='undefined'&&window&&window.__CPM_NO883);
         const _oppo=(by>50)?(sl.y<=50):(sl.y>=50);
         if(!_no883&&inPoss&&st!=="fermo"&&advB>=70&&Math.abs(by-50)>=20&&_oppo&&(p.rl==="AT"||p.rl==="MF")){
           const _po=(p.rl==="AT")?{a:85,y:(by>50?44:56)}:{a:80,y:50};
           /* [7.939 — CHI ATTACCA L'AREA CI ARRIVA PRIMA CHE FINISCA L'AZIONE. Sbloccata dal PO il 17/09]
              MISURATO: il portatore e' avanzato E largo 33,5 volte a partita, ma in 17,9 casi su 18,1 il cross
              muore perche' in area non c'e' nessuno; i cross riusciti sono 0,20 contro 15 veri. La regola
              della 7.883 manda gia' in area chi sta dal lato cieco, ma ci andava a `v=6`, cioe' 6 unita' al
              MINUTO: 0,55 per battito, e per le 25 unita' che separano un trequartista dal secondo palo
              servirebbero 45 battiti mentre un'azione ne dura due o tre.
              Era ferma dal 17/09 perche' accendeva il guardiano «un pallone, un padrone». Il guardiano aveva
              ragione, ma per un altro motivo: misurava a una decisione al minuto una partita che se ne gioca
              undici. Sistemato quello (7.938) e tolto il teletrasporto del battitore, il tetto vero e' 12
              unita' PER BATTITO — 2,2 m/s — e la corsa in area ci sta sotto: 11 u/battito, 2,0 m/s. */
           const _v939=(typeof window!=='undefined'&&window&&window.__CPM_NO939)?6:Math.min(60,12/(S.dt||1));/* [7.939 v2] META' della corsa massima: a 121 il pallone restava senza padrone il 57 % del tempo e la banda del guardiano ne chiede almeno il 60 — quella soglia non e' fra quelle che il PO ha autorizzato a toccare */
           if(advDi(tx,p.team)<_po.a-2){tx=xDa(_po.a,p.team);ty=_po.y;v=_v939;}}}
        /* [7.945 — SUL CROSS I DIFENSORI ATTACCANO IL PALLONE. Rosso __CPM_NO945]
           Le spazzate stavano a 0,17 contro 17 vere, e non per una taratura: l'unico punto che ne produce
           chiede un difensore entro 4 unita' dal pallone, e MISURATO (30 partite) su 12,40 cross che
           arrivano in 10,77 — l'87 % — il difensore piu' vicino sta oltre 8 unita'. Cioe' in area non
           difendeva nessuno: la 7.883 e la 7.939 mandano in area gli ATTACCANTI, la squadra che difende no.
           Nel calcio vero, quando il cross parte, i centrali attaccano il punto dove cade il pallone.
           Qui i DUE difensori piu' vicini al punto d'arrivo ci vanno, con lo stesso passo concesso alla
           corsa in area (meta' del tetto del guardiano «un pallone, un padrone»), e solo mentre un cross
           e' davvero in volo verso la nostra meta' campo. */
        if(!(typeof window!=='undefined'&&window&&window.__CPM_NO945)&&st==="volo"&&S.poss.tipo==="cross"
                &&p.team!==l&&!p.gk&&S.poss.a&&advDi(S.poss.a.x,p.team)<=30){
          const _bx=S.poss.a.x,_by=S.poss.a.y;
          let _rango=0;for(const q of g){if(q.team!==p.team||q.gk||!attivo(q)||q.i===p.i)continue;
            if(hyp(q.x,q.y,_bx,_by)<hyp(p.x,p.y,_bx,_by))_rango++;}
          if(_rango<2){const _v945=(typeof window!=='undefined'&&window&&window.__CPM_NO945)?4.5:Math.min(60,12/(S.dt||1));
            tx=_bx;ty=_by;v=_v945;}
        }
      }
      if(st==="fermo"&&S.fermo&&S.fermo.batt===p.i){const f=S.fermo;tx=f.x-dp*(f.kind==="pen"?1.5:0.8);ty=f.kind==="corner"?f.y:f.y;
        /* [7.938 — CHI VA A BATTERE CI VA COI PIEDI] MISURATO alla cadenza vera (5 partite, 11 battiti al
           minuto): 54 salti oltre 12 unita' per battito, il piu' lungo 53,8u — mezzo campo — e TUTTI nel
           battito in cui si batte un piazzato. La causa non e' il possesso: e' che il battitore designato si
           avvicinava alla palla a 8 unita' al MINUTO, cioe' 0,73 per battito, e con uno o tre battiti di
           attesa ne copriva due; il resto glielo faceva fare `T.p.x=f.x` alla battuta, di colpo. Nel campo
           2D il PO lo vede come un teletrasporto. Ora corre: il passo resta sotto le 12 unita' per battito
           in ogni regime (a dt=1, il banco di test/logic, vale esattamente 12), quindi il metro «i passi
           sono umani» non si tocca — si rispetta. */
        v=Math.min(121,12/(S.dt||1));}
      else if(st==="fermo"&&S.fermo){const f=S.fermo;
        if(f.kind==="corner"||f.kind==="pen"){const atk=(p.team===f.lato);const gx=xDa(f.kind==="pen"?89:92,f.lato);const k=p.i%11;
          if(f.kind==="pen"){if(p.gk){tx=xDa(3,altro(f.lato))===p.x?p.x:(p.team===f.lato?slotDi(p).x:xDa(2,altro(f.lato)));ty=50;}else{tx=xDa(80,f.lato)+(k%2)*dirDi(f.lato)*-2;ty=18+(k%10)*6.4;}}
          else if(!p.gk){if(atk){if(k<=5){tx=gx-dirDi(f.lato)*(2+(k%4)*2);ty=36+(k%4)*9;}else{tx=xDa(66,f.lato);ty=30+(k%4)*12;}}else{if(k<=6){tx=gx+dirDi(f.lato)*(1+(k%6)*1.2);ty=32+(k%6)*7;}else{tx=xDa(70,f.lato);ty=34+(k%3)*12;}}}
          v=6;}
        /* [7.891] LA PUNIZIONE VICINO ALLA PORTA HA IL SUO SCHIERAMENTO (prima solo corner e rigore): muro
           di quattro a 9,15u sulla linea palla-porta, linea difensiva davanti all'area, tre attaccanti al
           limite, i compagni del battitore dietro la palla. Deterministico (k = indice mod 11). */
        else if(f.kind==="foul"&&!p.gk&&advDi(f.x,f.lato)>=62){const atk=(p.team===f.lato);const gx=xDa(100,f.lato);
          const ddx=gx-f.x,ddy=50-f.y,dd=Math.hypot(ddx,ddy)||1,ux=ddx/dd,uy=ddy/dd;const k=p.i%11;const advF=advDi(f.x,f.lato);
          if(atk){if(k<=2){tx=f.x-dirDi(f.lato)*(3+k*2);ty=f.y+(k-1)*6;}
            else if(k<=6){tx=xDa(Math.min(advF+10,92),f.lato);ty=30+(k-3)*13;}
            else{tx=xDa(Math.max(advF-14,45),f.lato);ty=30+(k-7)*13;}}
          else{if(k<=3){const wx=f.x+ux*9.15,wy=f.y+uy*9.15,px=-uy,py=ux;tx=wx+px*(k-1.5)*1.6;ty=wy+py*(k-1.5)*1.6;}
            else if(k<=7){tx=xDa(Math.min(advF+14,94),f.lato);ty=34+(k-4)*8;}
            else{tx=xDa(Math.min(advF+6,90),f.lato);ty=25+(k-8)*25;}}
          tx=clamp(tx,2,98);ty=clamp(ty,3,97);v=6;}
      }
      if(st==="volo"&&ric&&p.i===ric.i){tx=S.poss.a.x-dp*0.4;ty=S.poss.a.y;v=6;}
      else if((st==="tenuta"||st==="libero")&&ins&&p.i===ins.i){if(st==="tenuta"){tx=bx-d*3;ty=by;}else{tx=bx;ty=by;}v=5.5;}
      else if(st==="volo"&&S.poss.icpt!=null&&p.i===S.poss.icpt){tx=S.poss.da.x+(S.poss.a.x-S.poss.da.x)*S.poss.icptA;ty=S.poss.da.y+(S.poss.a.y-S.poss.da.y)*S.poss.icptA;v=6;}
      else if(st==="volo"&&ins&&p.i===ins.i&&S.poss.tipo!=="tiro"){tx=S.poss.a.x;ty=S.poss.a.y;v=5;}
      else if((st==="tenuta"||st==="volo")&&cop&&p.i===cop.i){const gx=xDa(6,p.team);tx=bx+(gx-bx)*0.35;ty=by+(50-by)*0.4;v=5;}
      else if(app.indexOf(p)>=0&&_rif924){const k=app.indexOf(p);const R=_rif924;/* [7.924 M1] tre uomini a sostegno invece di due, a 7-17 unita invece di 12-24, e con le GAMBE per arrivarci: 9 unita al minuto restano sotto il tetto di 12 del guardiano, con margine: a 11 il guardiano si accendeva a volte si e a volte no (14,3u), perche il passo dipende anche dal jitter e dalla sequenza dei dadi, e un guardiano che passa a seconda del seme non e un guardiano `un pallone, un padrone`, che a 22 si e acceso: il tetto e spedito, non lo si alza per far passare una modifica. */tx=R.x+d*(_m924?(7+k*5):(12+k*6));ty=R.y+(k===0?-1:1)*((_m924?7:12)+_rj()*(_m924?4:6))*(R.y>50?1:-1)*(k===0?-1:1);v=_m924?9:5;}
      if(st==="kickoff"){const k=S.kickoff;if(p.gk){tx=sl.x;ty=50;}else{const casa=p.team===HOME;tx=casa?Math.min(sl.x,46):Math.max(sl.x,54);ty=sl.y;if(p.team===k.lato){const c=[];for(const q of g){if(!mio(q,k.lato)||q.gk)continue;c.push({q,d:hyp(q.x,q.y,50,50)});}c.sort((a,b)=>a.d-b.d);if(c[0]&&c[0].q.i===p.i){tx=50-dp*0.8;ty=50;}else if(c[1]&&c[1].q.i===p.i){tx=50-dp*3;ty=53;}}}v=8;}
      if(st==="rete"){v=1.2;}
      tx=clamp(tx,2,98);ty=clamp(ty,3,97);
      if(p.gk){tx=clamp(tx,p.team===HOME?2:88,p.team===HOME?12:98);ty=clamp(ty,30,70);}
      const _dt898=S.dt||1;v*=_dt898;/* [7.898] la corsa del minuto si compie in frazioni */
      const dx=tx-p.x,dy=ty-p.y,dd=Math.hypot(dx,dy);
      const jx=(_rj()-0.5)*0.3*_dt898,jy=(_rj()-0.5)*0.3*_dt898;
      if(dd<=v){p.x=clamp(tx+jx,2,98);p.y=clamp(ty+jy,3,97);}
      else{p.x=clamp(p.x+dx/dd*v+jx,2,98);p.y=clamp(p.y+dy/dd*v+jy,3,97);}
    }
    /* anti-ammucchiata: due compagni mai a meno di 2,2u */
for(let a=0;a<g.length;a++){const p=g[a];if(!attivo(p)||p.gk)continue;for(let b=a+1;b<g.length;b++){const q=g[b];if(!attivo(q)||q.gk||q.team!==p.team)continue;const dd=hyp(p.x,p.y,q.x,q.y);if(dd<2.2&&dd>0.001){const push=(2.2-dd)/2;const ux=(q.x-p.x)/dd,uy=(q.y-p.y)/dd;if(q.i!==S.poss.padrone){q.x=clamp(q.x+ux*push,2,98);q.y=clamp(q.y+uy*push,3,97);}if(p.i!==S.poss.padrone){p.x=clamp(p.x-ux*push,2,98);p.y=clamp(p.y-uy*push,3,97);}}}}
    if(padrone&&st==="tenuta"){S.palla.x=clamp(padrone.x+d*0.5,0,100);S.palla.y=padrone.y;}
  }

  /* [7.898 A2 v3] il portatore compie il resto del passo di conduzione deciso al primo sotto-tick del minuto */
  function avanzaCond(){const c=S.cond;if(!c)return;const P=S.poss.padrone!=null?g[S.poss.padrone]:null;if(!P||S.poss.stato!=="tenuta"){S.cond=null;return;}
    const dx=c.tx-P.x,dy=c.ty-P.y,dl=Math.hypot(dx,dy);const st=Math.min(dl,c.v*(S.dt||1));if(dl>1e-9){P.x=clamp(P.x+dx/dl*st,3,97);P.y=clamp(P.y+dy/dl*st,4,96);}
    if(st>=dl-1e-6)S.cond=null;S.palla.x=clamp(P.x+dirDi(P.team)*0.5,0,100);S.palla.y=P.y;}

  /* ---------- API ---------- */
  function tick(ctx){ctx=ctx||{};const _dt=(ctx.dt>0&&ctx.dt<1)?+ctx.dt:1;S.dt=_dt;
    /* [7.914.0] il possesso e' tempo, non eventi: si accumula qui, dove si sa chi ha la palla */
    try{const _s=S.poss.stato;if((_s==='tenuta'||_s==='volo')&&S.tab[S.poss.lato])S.tab[S.poss.lato].possesso+=_dt;}catch(_e){}/* dec: il chiamante puo' dire quale chiamata decide (il live: il battito del minuto); senza, decide la fase */const _dec=(ctx.dec!=null)?!!ctx.dec:!(S.fase>1e-9);if(ctx.dec)S.fase=0;
    const _fine=()=>{S.fase+=_dt;if(S.fase>=1-1e-9)S.fase=0;const out=S.eventi;S.eventi=[];return out;};
    /* [7.898 A2 v3] SOTTO-TICK (fase>0): nessuna decisione, nessun contatore; solo la fisica del minuto in corso */
    if(!_dec){if(ctx.min!=null)S.min=ctx.min|0;S.arco=null;if(S.scena)return[];
      const st=S.poss.stato;
      if(st==="volo")muoviVolo();else if(st==="libero")tickLibero(true);else if(st==="tenuta")avanzaCond();else if(st==="fermo"&&S.fermo){S.palla.x=S.fermo.x;S.palla.y=S.fermo.y;}
      muoviTutti();
      if(S.poss.stato==="tenuta"&&S.poss.padrone!=null){const P=g[S.poss.padrone];S.palla.x=clamp(P.x+dirDi(P.team)*0.5,0,100);S.palla.y=P.y;}
      return _fine();}
    S.tick++;S.cond=null;if(ctx.min!=null)S.min=ctx.min|0;S.arco=null;/* [diag] quanti tick con una richiesta pendente: per leggere in browser cio' che il banco non vede */if(S.richieste.gol)S.conta.golReqTick=(S.conta.golReqTick|0)+1;if(S.richieste.turno)S.conta.turnoReqTick=(S.conta.turnoReqTick|0)+1;if(S.richieste.verso)S.conta.versoTick=(S.conta.versoTick|0)+1;if(S.scena)S.conta.scenaTick=(S.conta.scenaTick|0)+1;
    if(S.scena){S.conta.scena++;return[];}
    if(S.richieste.gol&&S.richieste.gol.lato!==S.poss.lato){const gr=S.richieste.gol;gr.t=(gr.t|0)+1;if(!S.richieste.turno)S.richieste.turno=gr.lato;
      if(S.poss.stato==="tenuta"&&S.poss.padrone!=null&&S.poss.t>=1){const P=g[S.poss.padrone];if(P&&!P.gk){perdi(P);}}}
    /* tetto duro del decreto: al nono tick il gol entra da dove sta la palla (a fine partita non puo' restare appeso) */
    if(S.richieste.gol&&(S.richieste.gol.t|0)>=9&&S.poss.stato!=="rete"&&S.poss.stato!=="kickoff"&&!S.scena){const gr=S.richieste.gol;const W=piuVicino(S.palla.x,S.palla.y,gr.lato,{noGk:true});if(W&&S.poss.stato!=="volo"){if(S.poss.padrone!==W.p.i){W.p.x=clamp(S.palla.x-dirDi(gr.lato)*0.4,2,98);W.p.y=S.palla.y;S.fermo=null;tenuta(W.p,null);}S.poss.t=2;gr.t=Math.max(gr.t,9);
      const zW=zonaDi(advDi(W.p.x,gr.lato),W.p.y);const M=(zW==="area"||zW==="limite"||zW==="trequarti")?null:piuAvanzato(gr.lato,W.p.i);
      if(M&&advDi(M.x,gr.lato)>=advDi(W.p.x,gr.lato)+6&&hyp(M.x,M.y,W.p.x,W.p.y)>=5){S.conta.rami.lancioTetto=(S.conta.rami.lancioTetto|0)+1;passa(W.p,M,{kind:"lancio",sicuro:true});}/* [7.872] anche al tetto: prima il lancio in avanti, il tiro al tick dopo da dove arriva */
      else tira(W.p);muoviTutti();return _fine();}}
    const st=S.poss.stato;
    if(st==="rete")tickRete();
    else if(st==="kickoff")tickKickoff();
    else if(st==="fermo")tickFermo();
    else if(st==="volo")muoviVolo();
    else if(st==="libero")tickLibero();
    else decidiTenuta();
    muoviTutti();
    if(S.poss.stato==="tenuta"&&S.poss.padrone!=null){const P=g[S.poss.padrone];S.palla.x=clamp(P.x+dirDi(P.team)*0.5,0,100);S.palla.y=P.y;}
    return _fine();}
  const chiedi={
    gol(lato){S.richieste.gol={lato:lato===AWAY?AWAY:HOME,t:0};S.richieste.verso=null;},
    /* [7.879] LA SCENA DELL'EROE SI CHIEDE, NON SI IMPONE. Il live match dice «fra poco tocca a lui»:
       il motore porta il pallone all'eroe con le sue regole (il compagno lo sceglie come ricevente) e
       quando ce l'ha davvero emette `occasione_eroe`. La scena si apre SU QUEL FATTO, non su un minuto. */
    /* [23/09 POC — B3: IN SCENA I VENTIDUE LI MUOVE IL BRAIN. Direttiva PO «render 3D da motore unico». Rosso lato live __CPM_NO_B3MUOVI]
       Durante gli highlight il motore era fermo e i ventidue li muoveva uno scrittore del live (pressing a orologio). Qui il brain
       fa un passo del SUO posizionamento (`muoviTutti`) con la palla tenuta dall'eroe, partendo dalle posizioni attuali in campo
       (continuita'), con un generatore LOCALE a seme di scena (il flusso della partita non si sposta), e poi ripristina lo stato
       del possesso: la scena non cambia la partita, ne muove solo i corpi. */
    scenaMuovi(o){o=o||{};const salva={padrone:S.poss.padrone,stato:S.poss.stato,lato:S.poss.lato,ricevente:S.poss.ricevente,dt:S.dt,px:S.palla.x,py:S.palla.y,ins:S.inseguitore};
      /* [v2] MISURATO (match-sequence): anche ripristinando il possesso la partita divergeva dalla riga 19 — muoviTutti modifica i giocatori del motore, e quanti passi avvengono dipende dal tempo reale della scena. Ora l'intero stato dei giocatori si fotografa e si rimette com'era: la scena muove i CORPI, non la partita. */
      const _foto=g.map(q=>q?Object.assign({},q):q);
      try{let seme=((o.seme>>>0)||1)>>>0;S._rjScena=()=>{seme=(Math.imul(seme,1664525)+1013904223)>>>0;return seme/4294967296;};
        if(o.gioc&&o.gioc.length){for(let i=0;i<Math.min(21,o.gioc.length);i++){const q=o.gioc[i];if(q&&q.x!=null&&g[i]){g[i].x=clamp(+q.x,2,98);g[i].y=clamp(+q.y,3,97);}}}
        const H=g[HERO];if(o.eroe&&o.eroe.x!=null){H.x=clamp(+o.eroe.x,2,98);H.y=clamp(+o.eroe.y,3,97);}
        S.poss.padrone=HERO;S.poss.lato=H.team;S.poss.stato='tenuta';S.poss.ricevente=null;S.dt=Math.max(0.05,Math.min(1,+o.dt||0.3));
        S.palla.x=o.palla&&o.palla.x!=null?+o.palla.x:H.x;S.palla.y=o.palla&&o.palla.y!=null?+o.palla.y:H.y;
        const _np=Math.max(1,Math.min(12,(o.passi|0)||1));for(let k=0;k<_np;k++)muoviTutti();/* [v3] posizioni = funzione pura di (partenza, passi): la scena converge e non dipende dal tempo reale */
        return g.slice(0,21).map(q=>({x:+q.x.toFixed(2),y:+q.y.toFixed(2)}));
      }catch(_e){return null;}
      finally{for(let i=0;i<g.length;i++){if(g[i]&&_foto[i]){for(const k in g[i])if(!(k in _foto[i]))delete g[i][k];Object.assign(g[i],_foto[i]);}}S.poss.padrone=salva.padrone;S.poss.stato=salva.stato;S.poss.lato=salva.lato;S.poss.ricevente=salva.ricevente;S.dt=salva.dt;S.palla.x=salva.px;S.palla.y=salva.py;S.inseguitore=salva.ins;S._rjScena=null;}},
    scenaEroe(on,tipo){S.richieste.scenaEroe=!!on;S.richieste.scenaTipo=on?(tipo||null):null;S.richieste.scenaAttese=0;if(!on)S.conta.occEroe=0;},/* [23/09 POC] il live puo' chiedere un TIPO di occasione */
    urgenza(){if(S.richieste.gol)S.richieste.gol.t=Math.max(S.richieste.gol.t|0,9);},
    turno(lato){const l=lato===AWAY?AWAY:HOME;if(S.poss.lato!==l)S.richieste.turno=l;},
    verso(o){S.richieste.verso=o?{x:clamp(+o.x||50,2,98),y:clamp(+o.y||50,3,97)}:null;if(o&&o.lato)chiedi.turno(o.lato);},
    atteggiamento(lato,v){S.richieste.att[lato===AWAY?AWAY:HOME]=clamp(+v||0,-1,1);},
    eroe(on){eroeAttivo=!!on;if(!eroeAttivo&&S.poss.padrone===HERO){libero(S.palla.x,S.palla.y);}if(!eroeAttivo&&S.poss.ricevente===HERO)S.poss.ricevente=null;},
    scena(){S.scena=true;S.richieste.verso=null;S.arco=null;},
    riprendi(o){o=o||{};S.scena=false;S.fermo=null;S.rete=null;S.richieste.verso=null;
      if(o.gioc&&o.gioc.length){for(let i=0;i<Math.min(21,o.gioc.length);i++){const q=o.gioc[i];if(q&&q.x!=null){g[i].x=clamp(+q.x,2,98);g[i].y=clamp(+q.y,3,97);}}}
      if(o.eroe&&o.eroe.x!=null){g[HERO].x=clamp(+o.eroe.x,2,98);g[HERO].y=clamp(+o.eroe.y,3,97);}
      const l=o.lato===AWAY?AWAY:HOME;const x=clamp(+o.x||50,2,98),y=clamp(+o.y||50,3,97);
      if(o.centro){S.kickoff={lato:l,t:0};S.poss.stato="kickoff";S.poss.lato=l;S.poss.padrone=null;S.palla.x=50;S.palla.y=50;return;}
      const W=piuVicino(x,y,l,{noGk:true});if(W){W.p.x=x-dirDi(l)*0.4;W.p.y=y;S.palla.x=x;S.palla.y=y;tenuta(W.p,null);S.poss.t=1;}else libero(x,y);},
    posiziona(x,y){S.palla.x=clamp(+x,0,100);S.palla.y=clamp(+y,0,100);},
    /* [7.891] IL CALCIO PIAZZATO DELLA SCENA LO SCHIERA IL MOTORE. Il live match, due minuti prima di una
       scena a palla ferma (rigore, corner, punizione dell'eroe), non chiede piu' «vai verso quel punto»
       ma «fischia un piazzato li', con questo battitore»: il motore ferma il pallone, nomina il battitore
       (l'eroe) e porta i ventidue nella formazione da palla ferma con le sue regole (tick dopo tick,
       corsa vera, niente teletrasporto). Tiene la palla ferma per `hold` tick (6): se la scena non si
       apre, il piazzato lo batte lui e il gioco continua. */
    piazzato(o){o=o||{};const l=o.lato===AWAY?AWAY:HOME;const kind=(o.kind==="pen"||o.kind==="corner")?o.kind:"foul";
      S.richieste.verso=null;fermoSet(kind,l,+o.x||50,+o.y||50,{scena:1});
      if(S.fermo){S.fermo.tot=Math.max(S.fermo.tot|0,o.hold?clamp(o.hold|0,1,12):6);
        if(o.batt!=null&&g[o.batt]&&!g[o.batt].gk&&mio(g[o.batt],l)&&(o.batt!==HERO||eroeAttivo))S.fermo.batt=o.batt;}},
  };
  function stato(){const p=S.poss;const pad=p.padrone!=null?g[p.padrone]:null;
    return{tick:S.tick,palla:{x:+S.palla.x.toFixed(2),y:+S.palla.y.toFixed(2)},
      poss:{stato:p.stato,lato:p.lato,padrone:p.padrone,ricevente:p.ricevente,tipo:p.tipo,t:p.t,eroe:pad?!!pad.eroe:false,a:(p.stato==="volo"&&p.a)?{x:+p.a.x.toFixed(2),y:+p.a.y.toFixed(2)}:null},
      fermo:S.fermo?{kind:S.fermo.kind,lato:S.fermo.lato,x:S.fermo.x,y:S.fermo.y,t:S.fermo.t,tot:S.fermo.tot}:null,
      rete:S.rete?{lato:S.rete.lato,t:S.rete.t}:null,kickoff:p.stato==="kickoff"?{lato:S.kickoff.lato,t:S.kickoff.t}:null,
      scena:S.scena,fase:+S.fase.toFixed(3),dt:S.dt,cond:!!S.cond,gioc:g.slice(0,21).map(q=>({x:+q.x.toFixed(2),y:+q.y.toFixed(2),t:(q.team===AWAY?1:0),gk:q.gk?1:0,rl:q.rl||""}))/* [7.917.1] il campo dall'alto deve sapere DI CHI e' il pallino: fino a qui `stato()` dava solo x/y e la vista 2D leggeva `p.team`, che qui dentro non esiste — i ventidue uscivano tutti dello stesso colore (fotografato). Squadra, portiere e ruolo vengono dal motore, che e' l'unico a saperli. */,eroe:{x:+g[HERO].x.toFixed(2),y:+g[HERO].y.toFixed(2),attivo:eroeAttivo},
      arco:S.arco,inseguitore:S.inseguitore,richieste:{gol:S.richieste.gol?{lato:S.richieste.gol.lato,t:S.richieste.gol.t}:null,turno:S.richieste.turno,verso:S.richieste.verso},
      conta:JSON.parse(JSON.stringify(S.conta)),quota:{home:S.quota.home,away:S.quota.away}};}
  /* [7.914.0] il tabellino di gara, per entrambe le squadre. Il possesso si ricava dai minuti in cui ciascun
     lato ha avuto il pallone, non da una stima: e' l'unica voce che non nasce da un evento. */
  const tabellino=()=>{const h=S.tab.home,a=S.tab.away;
    const _pt=(h.possesso||0)+(a.possesso||0);
    const _p=(q)=>_pt>0?Math.round(100*q/_pt):50;
    return{home:Object.assign({},h,{possesso:_p(h.possesso||0)}),away:Object.assign({},a,{possesso:_p(a.possesso||0)})};};
  /* [7.915.0 — IL TABELLINO VEDE ANCHE GLI HIGHLIGHT] Il PO ha fotografato una partita vinta 3-0 con il
     tabellino che dichiarava 4 tiri e 2 in porta per la sua squadra: i suoi tre gol non erano contati. Non era
     un errore di conteggio — era la seconda sorgente di verita' che la direttiva del motore unico vuole
     togliere: i gol e i tiri dell'eroe nascono negli HIGHLIGHT, che il motore non vede. Finche' B0 non fara'
     nascere l'highlight DAL motore, questo e' il ponte: il live dichiara al motore cosa e' successo nella
     scena, e il tabellino torna a essere uno solo. Un ponte dichiarato e' meglio di due verita' silenziose. */
  const registra=(tipo,lato,dati)=>{try{
    const A=S.tab[lato==='away'?'away':'home'];if(!A)return false;const B=S.tab[lato==='away'?'home':'away'];
    const d=dati||{};
    /* [7.918.0] IL PONTE PORTA ANCHE IL NOME. Le scene dell'highlight sono dell'EROE (il live chiama
       `registra` dal suo esito): senza questa riga i suoi gol finivano nel tabellino della squadra ma non
       nella sua pagella, e il PO avrebbe visto l'attaccante che segna tre gol con 6,0 in pagella. */
    const _P=_pag(d.chi!=null?d.chi:HERO);
    if(_P){switch(tipo){
      case 'tiro': _P.tiri++;if(d.esito==='gol'){_P.inPorta++;_P.gol++;}else if(d.esito==='parato')_P.inPorta++;break;
      case 'gol': _P.gol++;break;
      case 'assist': _P.assist++;break;
      case 'passaggio': _P.passaggi++;if(d.ok!==false)_P.passOk++;break;
      case 'fallo': _P.falli++;break;
      case 'ammonizione': _P.amm++;break;
      case 'parata': _P.parate++;break;
    }}
    switch(tipo){
      case 'tiro': A.tiri++;if(d.xg)A.xg=Math.round((A.xg+(+d.xg||0))*100)/100;
        if(d.esito==='gol'){A.inPorta++;A.gol++;}else if(d.esito==='parato'){A.inPorta++;if(B)B.parate++;}
        else if(d.esito==='legno')A.legni++;else if(d.esito==='murato')A.murati++;else A.fuori++;break;
      case 'gol': A.gol++;break;
      case 'assist': A.assist++;break;
      case 'passaggio': A.passaggi++;if(d.ok!==false)A.passOk++;break;
      case 'fallo': A.falli++;break;
      case 'falloSubito': if(B)B.falli++;break;
      case 'corner': A.corner++;break;
      case 'ammonizione': A.ammonizioni++;break;
      case 'parata': A.parate++;break;
      default: return false;
    }
    return true;
  }catch(_e){return false;}};
  /* [7.922 — IL VOTO HA UN REPARTO E UN RISULTATO] Collaudo del PO: «i voti sono assolutamente sballati,
     completamente sbilanciati». Misurato: 16 giocatori su 22 a 6,0 esatto. La prima causa era il difetto qui
     sopra (i passaggi non arrivavano a nessuno); la seconda e' che il voto guardava SOLO i gesti, e in una
     partita il centrale che non sbaglia niente non fa quasi gesti — sui giornali prende 6,5 lo stesso, perche'
     la sua squadra non ha subito gol. Quindi il voto nasce da tre cose che il motore sa davvero:
       · il RISULTATO della sua squadra (vinta, pari, persa);
       · il REPARTO, dedotto dallo schieramento iniziale (0 portiere · 1-4 difesa · 5-7 centrocampo · 8+ attacco),
         con la porta inviolata che pesa sul portiere e sulla difesa, e il digiuno che pesa sull'attacco;
       · i GESTI intestati a lui, che ora arrivano davvero.
     Nessun numero casuale: la stessa partita da' la stessa pagella. Cosa NON c'e' e va detto: i minuti giocati
     (il motore non li tiene), i duelli vinti e la distanza percorsa. */
  const _rep=(i)=>{const k=(i>=21)?8:(i<10?i:i-10);return k===0?'P':(k<=4?'D':(k<=7?'C':'A'));};
  const pagelle=()=>{const out=[];
    const _T={home:S.tab.home,away:S.tab.away};
    const _pt=(_T.home.possesso||0)+(_T.away.possesso||0);
    for(let i=0;i<g.length;i++){const p=g[i];if(!p)continue;const q=S.pag[i]||_PAG0();
      const mio=p.team===AWAY?'away':'home',suo=mio==='home'?'away':'home';
      const gf=_T[mio].gol|0,gs=_T[suo].gol|0;
      const poss=_pt>0?Math.round(100*(_T[mio].possesso||0)/_pt):50;
      const r=_rep(i);
      let v=6;
      /* il risultato della squadra */
      v+=gf>gs?0.25:(gf<gs?-0.25:0);
      /* il reparto */
      if(r==='P'){v+=gs===0?0.50:-0.30*gs;v+=0.15*q.parate;}
      else if(r==='D'){v+=gs===0?0.35:-0.18*gs;v+=0.10*(q.contrasti+q.intercetti+q.spazzate);}
      else if(r==='C'){v+=0.08*(q.contrasti+q.intercetti);v+=(poss>=56?0.15:(poss<=44?-0.15:0));}
      else{v+=(gf===0?-0.25:0);}
      /* i suoi gesti */
      v+=q.gol*0.95+q.assist*0.65+q.inPorta*0.10-Math.max(0,q.tiri-q.inPorta)*0.04;
      v+=q.passOk*0.03-Math.max(0,q.passaggi-q.passOk)*0.05+q.ricezioni*0.012;
      v+=(q.contrasti+q.intercetti)*0.07+q.spazzate*0.04;
      v-=q.falli*0.08+q.amm*0.25+q.esp*1.40;
      v=Math.max(4,Math.min(9.5,Math.round(v*10)/10));
      out.push({i:i,team:p.team,gk:!!p.gk,eroe:!!p.eroe,rl:p.rl||"",rep:r,nome:p.name||"",voto:v,
        gol:q.gol,assist:q.assist,tiri:q.tiri,inPorta:q.inPorta,passaggi:q.passaggi,passOk:q.passOk,
        ricezioni:q.ricezioni,contrasti:q.contrasti,intercetti:q.intercetti,spazzate:q.spazzate,parate:q.parate,
        falli:q.falli,amm:q.amm,esp:q.esp,subiti:q.subiti,tocchi:q.tocchi});}
    return out;};
  /* [23/09 POC — B2: IL BRAIN RISOLVE LA SCELTA DELL'EROE. Direttiva PO «il brain deve essere il motore unico» + carta bianca
     sulle situazioni.] Prima l'esito della scena lo tirava un dado a parte in LiveMatch (seme dal testo della scheda) e il motore
     riceveva solo un resoconto (`registra`). Ora:
       · `dado(p)` — il dado e' QUELLO DEL MOTORE (stesso flusso seedato della partita); la probabilita' la calcola ancora
         LiveMatch con la formula di sempre (succRate e modificatori), quindi la difficolta' non cambia;
       · `eventi(key,d)` — la scelta risolta diventa una CATENA DI EVENTI VERI del motore con gli attori del cast (eroe,
         ricevente, difensore, portiere): passano da `ev`, quindi tabellino e pagelle li conta il motore come ogni altro fatto.
     ⚠️ Il dado consuma il flusso del motore: da qui in poi la partita e' un'altra rispetto a prima del rimedio (sempre
     riproducibile a parita' di scelte). */
  const risolviEroe={
    /* [23/09 POC — punto 5] IL SEGUITO DELL'AZIONE LO DECIDE IL BRAIN: la catena (sponda, mischia, seconda palla, colpo di testa)
       si sceglie col dado seedato del motore, non piu' con un sorteggio libero, ed e' un fatto registrato (`seguito`). */
    seguito(opzioni){try{const a=(opzioni||[]).filter(Boolean);if(!a.length)return null;const k=Math.floor(rnd()*a.length)%a.length;
      const e=ev('seguito',{scena:true,tipo:(a[k]&&a[k]._id)||k});S.eventi.splice(S.eventi.indexOf(e),1);return a[k];}catch(_e){return null;}},
    dado(p){const r=rnd();return r<Math.max(0.02,Math.min(0.98,+p||0));},
    eventi(key,d){d=d||{};const out=[];const _n0=S.eventi.length;try{
      const H=g[HERO];if(!H)return out;const C=d.cast||{};const G=w=>(w&&w.i!=null&&g[w.i])?g[w.i]:null;
      const R=G(C.ricevente),D=G(C.difensore),K=G(C.portiere);
      const E=(t,o)=>{const e=ev(t,Object.assign({scena:true,fam:d.tipo||null,variante:d.variante||null},o));out.push(e);return e;};/* famiglia e variante della scena: il gesto che il giocatore ha scelto */
      const da=q=>({x:+q.x.toFixed(1),y:+q.y.toFixed(1)});const rew=d.rew||'';const ok=!!d.ok;
      /* [23/09 POC — punto 3] la FAMIGLIA del gesto della scena (scelta dal giocatore) entra negli eventi: il tiro porta la sua
         intenzione (testa/volee/rigore/punizione), il dribbling e' una conduzione, un passaggio riuscito ha la sua ricezione. */
      const fam=d.tipo||'',vr=d.variante||'';
      if(!d.intent)d.intent=(fam==='header'||/header/.test(vr))?'header':fam==='penalty'?'penalty':fam==='freekick'?'freekick':/volley/.test(vr)?'volley':null;
      /* [23/09 POC — punto 3, v2] PRIMA IL GESTO SCELTO, POI LE CONSEGUENZE. Misurato (scena-gesti): l'eroe passava la palla in
         scena mentre il brain registrava un tiro, perche' gli eventi seguivano solo l'ESITO. Ora: 1) il gesto dell'eroe secondo la
         famiglia dell'opzione (passaggio/cross, conduzione, tiro, contrasto); 2) le conseguenze (ricezione, gol del compagno,
         intercetto o contrasto del difensore, tuffo del portiere su ogni tiro verso la porta, pressione del difensore). */
      /* il PUNTO NELLO SPECCHIO lo decide il motore (dado seedato): gol verso un angolo, parata vicino al centro, palo sul
         legno, fuori oltre il palo. y in coordinate di campo (0-100), pali a 50±4,9 (= |z| 3,35 del 3D, G2Z=(y-50)·0,68). */
      const porta=(es)=>{const s=rnd()<0.5?-1:1;const y=es==='goal'?50+s*(2.0+rnd()*2.4):es==='saved'?50+s*rnd()*2.4:es==='post'?50+s*4.9:es==='fuori'?50+s*(5.9+rnd()*6):50;return{x:100,y:+y.toFixed(2)};};
      const famPass=(fam==='pass'||fam==='cross'||(!fam&&rew==='assist')),famDrib=fam==='dribble',famDef=fam==='tackle';
      /* [23/09 POC — gesti evoluti] contrasto in piedi o in scivolata: deciso dalla situazione (distanza dalla porta propria di chi
         interviene, niente sorteggio). In scivolata quando si difende vicino alla propria area, in piedi altrove. */
      const modo=(q)=>{try{return (q&&advDi(q.x,q.team)<32)?'scivolata':'piedi';}catch(_e){return 'scivolata';}};
      const MIO_GK=g.find(q=>q&&q.gk&&q.team===H.team)||null;
      const tiroEroe=(es,extra)=>{const to=es==='blocked'?null:porta(es);if(K&&es!=='blocked'&&es!=='saved'&&to&&Math.abs(to.y-50)<=12)E('tuffo',{gk:chi(K)});/* il portiere reagisce se il pallone passa entro 12 unita' dal centro porta */E('tiro',Object.assign({chi:chi(H),zona:d.zona||null,intent:d.intent||null,from:da(H),to,esito:es},extra||{}));};
      if(famPass){
        E(fam==='cross'?'cross':'passaggio',{da:chi(H),a:chi(R),kind:'corto',from:da(H),to:R?da(R):null,fuori:!ok});
        if(!ok&&key==='intercept'&&D)E('intercetto',{chi:chi(D),da:chi(H),x:+H.x.toFixed(1),y:+H.y.toFixed(1)});
        else if(!ok&&fam==='cross'&&D)E('spazzata',{chi:chi(D),corner:false});
        if(ok&&R){if(!(key==='assist'||key==='goal'))E('ricezione',{chi:chi(R),da:chi(H)});/* chi conclude di prima non controlla: niente ricezione */
          if(key==='assist'||key==='goal'){if(K)E('tuffo',{gk:chi(K)});E('tiro',{chi:chi(R),from:da(R),intent:fam==='cross'?'header':null,to:porta('goal'),esito:'goal'});E('gol',{chi:chi(R),assist:chi(H),lato:R.team,x:+R.x.toFixed(1),y:+R.y.toFixed(1)});}}
        if(fam==='cross'&&D)E('pressione',{chi:chi(D),su:chi(R||H)});
      }
      else if(famDef){
        if(ok&&D)E('contrasto',{modo:modo(H),chi:chi(H),su:chi(D),x:+H.x.toFixed(1),y:+H.y.toFixed(1)});
        else if(D)E('conduzione',{chi:chi(D),from:da(D)});/* l'avversario la scampa e prosegue */
      }
      else{
        if(famDrib)E('conduzione',{chi:chi(H),from:da(H)});
        if(key==='goal'){tiroEroe('goal');E('gol',{chi:chi(H),assist:null,lato:H.team,x:+H.x.toFixed(1),y:+H.y.toFixed(1)});}
        else if(key==='assist'){E('passaggio',{da:chi(H),a:chi(R),kind:'corto',from:da(H),to:R?da(R):null});if(ok&&R){if(K)E('tuffo',{gk:chi(K)});E('tiro',{chi:chi(R),from:da(R),to:porta('goal'),esito:'goal'});E('gol',{chi:chi(R),assist:chi(H),lato:R.team,x:+R.x.toFixed(1),y:+R.y.toFixed(1)});}}
        else if(!ok&&key==='intercept'&&famDrib&&D)E('contrasto',{modo:modo(D),chi:chi(D),su:chi(H),x:+H.x.toFixed(1),y:+H.y.toFixed(1)});/* il dribbling fermato e' un contrasto */
        else if(!ok&&key==='intercept'){tiroEroe('blocked');if(D)E('murato',{chi:chi(D),su:chi(H)});}
        else if(key==='save'||key==='miss'||key==='miss_easy'||key==='post'||(rew==='goal'&&!ok)){/* un'«occasione» riuscita (chance) NON e' un tiro */
          const es=key==='save'?'saved':key==='post'?'post':'fuori';tiroEroe(es);
          if(key==='save'&&K)E('parata',{gk:chi(K),chi:chi(H),corner:false});else if(key==='post')E('palo',{chi:chi(H)});}
        else if(ok&&(key==='recovery'||key==='intercept'||key==='tackle')&&D)E('contrasto',{modo:modo(H),chi:chi(H),su:chi(D),x:+H.x.toFixed(1),y:+H.y.toFixed(1)});
      }

      if(K&&out.some(e=>e.t==='tiro'))out.unshift((()=>{const e=ev('pronto',{scena:true,fam:d.tipo||null,gk:chi(K)});return e;})());/* il portiere si mette in posizione prima del tiro */
      if(!famDef&&(!ok||out.some(e=>e.t==='tiro'&&e.chi&&e.chi.i===HERO&&(e.esito==='fuori'||e.esito==='post'||e.esito==='saved'))))E('rammarico',{chi:chi(H)});/* l'eroe si prende la testa fra le mani quando la sua giocata non riesce */
      if(d.gkCall&&MIO_GK&&ok){E('presa',{gk:chi(MIO_GK)});E('rilancio',{gk:chi(MIO_GK)});}/* chiamato il portiere: presa e rilancio con le mani */
      if(D&&out.some(e=>e.t==='tiro'&&e.chi&&e.chi.i===HERO&&e.esito!=='blocked'))E('pressione',{chi:chi(D),su:chi(H)});/* il difensore del cast chiude sul tiro dell'eroe (il 3D lo mostra con la reazione del reparto) */
      if(key==='fouled'||key==='win_freekick')E('fallo',{per:H.team===HOME?AWAY:HOME,x:+H.x.toFixed(1),y:+H.y.toFixed(1)});
      else if(key==='foul')E('fallo',{chi:chi(H),x:+H.x.toFixed(1),y:+H.y.toFixed(1)});
      if(d.corner)E('corner',{per:H.team,x:+H.x.toFixed(1),y:+H.y.toFixed(1)});
    }catch(_eR){}
    /* MISURATO (tabellino-coerenza, prima stesura): lasciati in S.eventi, questi fatti uscivano dal tick successivo, la cronaca
       li raccontava come un gol NUOVO e il tabellone contava due volte (6-2 contro 3-2 del motore). Sono gia' contati da `ev`
       e il chiamante li riceve qui: dalla coda del tick si tolgono. */
    S.eventi.splice(_n0);return out;}
  };
  return{tick,chiedi,stato,tabellino,pagelle,registra,risolviEroe,HERO,_g:g,_S:S};
}
if(typeof window!=='undefined'){try{window.__CPM_MOTORE_CREA=creaMotorePossesso;}catch(_e){}}
/* CMAV-MOTORE-END */
