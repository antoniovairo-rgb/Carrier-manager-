/* Fase 2 «partita vera» — LA PARTITA: un solo oggetto, usato uguale dalla simulazione rapida e dalla vista 3D.
   Gira il motore v2 a 22 battiti al minuto (la cadenza del gioco), registra lo STREAM (eventi) e i FOTOGRAMMI
   (posizioni che il motore ha deciso), e da quelli soli calcola tabellino, risultato e impronta.
   Niente Math.random: tutto nasce dal seme. */
(function(root){
  const BATTITI=22;
  const lcg=(s)=>{s=(s>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
  const fnv=(str)=>{let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return('00000000'+h.toString(16)).slice(-8);};
  /* undici per lato nelle posizioni di partenza del 4-3-3 (le stesse del banco del gioco, tests/brain/_carica.mjs); l'eroe e' l'undicesimo di casa */
  const schiera=(casa,osp)=>{
    const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
    const a=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
    const R=(i)=>i===0?'POR':i<=4?'DIF':i<=7?'CEN':'ATT';
    return h.map((p,i)=>({team:'home',gk:!!p[2],name:(casa.rosa&&casa.rosa[i])||(casa.sigla+' '+(i+1)),rl:R(i),x:p[0],y:p[1]}))
      .concat(a.map((p,i)=>({team:'away',gk:!!p[2],name:(osp.rosa&&osp.rosa[i])||(osp.sigla+' '+(i+1)),rl:R(i),x:p[0],y:p[1]})));};
  /* recupero: regola MIA (non da fonte), deterministica: 1 minuto base nel primo tempo e 3 nel secondo, +0,5 per gol, +0,3 per cartellino e cambio */
  const recupero=(ev,t0,t1,base,max)=>{let g=0,c=0;for(const e of ev){if(e.min<t0||e.min>t1)continue;if(e.t==='gol')g++;else if(e.t==='ammonizione'||e.t==='espulsione'||e.t==='sostituzione')c++;}return Math.max(base,Math.min(max,Math.round(base+g*0.5+c*0.3)));};

  function creaPartita(o){
    const crea=o.crea||root.creaMotoreV2;
    const eroeLato=o.eroeLato==='away'?'away':'home';/* dove gioca l'eroe nello STADIO */
    /* nel motore la squadra dell'eroe e' sempre «home» (verso del campo): lo stadio lo dice cfg.stadio */
    const tE=eroeLato==='home'?o.casa:o.ospite,tA=eroeLato==='home'?o.ospite:o.casa;
    const M=crea({v2:o.v2!==false,seed:o.seed>>>0,stadio:eroeLato==='home'?'home':'away',giocatori:schiera(tE,tA),
      eroe:{name:(o.eroe&&o.eroe.nome)||'EROE',x:58,y:50,attivo:true,ovr:(o.eroe&&o.eroe.ovr)||74,profilo:(o.eroe&&o.eroe.profilo)||null},
      forza:{home:tE.forza,away:tA.forza},tattica:o.tattica||null,scelte:o.scelte||{},k2:o.k2||null,decidi:o.decidi||undefined});
    const G=M._g;const rs=lcg((o.seed^0x9e3779b9)>>>0);/* flusso SEPARATO per i cambi: non sposta il motore */
    const cambi={home:[],away:[]};for(const l of ['home','away']){const usati={};for(const fin of [[57,64],[67,74],[77,83]]){const min=fin[0]+Math.floor(rs()*(fin[1]-fin[0]+1));
      let i;do{i=(l==='home'?1:11)+Math.floor(rs()*9);}while(usati[i]);usati[i]=1;cambi[l].push({min,i});}}
    const S={min:1,battito:0,tempo:1,fine1:45,fine2:90,finita:false,eventi:[],frames:[],gol:{home:0,away:0},attesa:null};
    const segna=(e)=>{S.eventi.push(e);if(e.t==='gol')S.gol[e.lato]++;};
    /* il fotogramma legge lo stato del motore senza copiarlo tutto (stato() clona i contatori a ogni chiamata) */
    const MS=M._S;
    const foto=()=>{const p=new Float32Array(44);for(let i=0;i<22;i++){p[i*2]=G[i].x;p[i*2+1]=G[i].y;}const po=MS.poss;
      return{m:S.min+S.battito/BATTITI,t:S.tempo,b:[MS.palla.x,MS.palla.y],p,s:po.stato,l:po.lato,pd:po.padrone,vo:po.stato==='volo'&&po.a?[po.a.x,po.a.y]:null,esp:M.espulsi?M.espulsi():[]};};
    /* un passo = un battito (1/22 di minuto). Se l'eroe sta per avere un'occasione e il chiamante vuole scegliere, si ferma PRIMA */
    function passo(opz){opz=opz||{};if(S.finita)return null;
      {const occ=M.occasione?M.occasione(S.min):null;
        if(occ&&opz.chiedi&&!(o.scelte&&o.scelte[occ.k])){S.attesa=occ;return{attesa:occ};}
        S.attesa=null;}
      if(S.battito===0){
        for(const l of ['home','away'])for(const c of cambi[l])if(c.min===S.min&&!c.fatto){c.fatto=true;const q=G[c.i];const esce=q.name;q.name=(l==='home'?tE:tA).sigla+' '+(12+cambi[l].indexOf(c));
          segna({t:'sostituzione',min:S.min,lato:l,esce,entra:q.name,i:c.i});}
      }
      const ev=M.tick({min:S.min,dt:1/BATTITI,dec:true});/* 22 decisioni al minuto: la cadenza del gioco (src/15) */for(const e of ev)segna(e);
      const f=o.registra===false?null:foto();if(f)S.frames.push(f);
      S.battito++;if(S.battito>=BATTITI){S.battito=0;S.min++;
        if(S.tempo===1&&S.min===46){S.fine1=45+recupero(S.eventi,1,45,1,4);}
        if(S.tempo===1&&S.min>S.fine1){S.tempo=2;S.min=46;segna({t:'intervallo',min:S.fine1});M.chiedi.riprendi({centro:true,lato:'away'});}
        else if(S.tempo===2&&S.min===91){S.fine2=90+recupero(S.eventi,46,90,3,7);}
        if(S.tempo===2&&S.min>S.fine2){S.finita=true;segna({t:'fischio_finale',min:S.fine2});}}
      return{frame:f,eventi:ev};}
    function scegli(k,azione){o.scelte=o.scelte||{};o.scelte[k]=azione;S.attesa=null;}
    /* simulazione rapida: la stessa partita, con le scelte automatiche */
    function tuttaSubito(){while(!S.finita)passo();return risultato();}
    function risultato(){const T=M.tabellino();
      const eroeGol=S.gol.home,avvGol=S.gol.away;/* motore: home = squadra dell'eroe */
      const casaGol=eroeLato==='home'?eroeGol:avvGol,ospGol=eroeLato==='home'?avvGol:eroeGol;
      const firma=S.eventi.map(e=>[e.t,e.min,e.lato||'',e.esito||'',e.chi?e.chi.i:'',e.x!=null?e.x:(e.from?e.from.x:''),e.y!=null?e.y:(e.from?e.from.y:'')].join(':')).join('|');
      return{casa:casaGol,ospite:ospGol,eroe:{fatti:eroeGol,subiti:avvGol},homeScore:eroeGol,awayScore:avvGol,isHome:eroeLato==='home',
        tab:{eroe:T.home,avv:T.away},durata:{primo:S.fine1,secondo:S.fine2},impronta:fnv(firma),nEventi:S.eventi.length};}
    return{passo,scegli,tuttaSubito,risultato,stato:S,motore:M,cambi,eroeLato,squadre:{eroe:tE,avv:tA}};}
  root.creaPartita=creaPartita;root.PARTITA_BATTITI=BATTITI;root.impronta=fnv;
})(typeof window!=='undefined'?window:globalThis);
