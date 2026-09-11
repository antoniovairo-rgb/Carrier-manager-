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
  const rnd=()=>{_s=(Math.imul(_s,1664525)+1013904223)>>>0;return _s/4294967296;};
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
  };
  const ev=(t,o)=>{const e={t,tick:S.tick,min:S.min,lato:S.poss.lato};if(o)for(const k in o)e[k]=o[k];if(!o||o.lato==null){const w=e.chi||e.gk;if(w&&w.team&&/^(contrasto|intercetto|recupero|spazzata|parata|presa|murato)$/.test(t))e.lato=w.team;}S.eventi.push(e);return e;};
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
  const tenuta=(p,perche)=>{S.poss.stato="tenuta";S.poss.lato=p.team;S.poss.padrone=p.i;S.poss.ricevente=null;S.poss.t=0;S.poss.tipo=null;S.poss.a=null;S.poss.da=null;S.poss.icpt=null;
    S.palla.x=clamp(p.x+dirDi(p.team)*0.5,0,100);S.palla.y=p.y;
    if(S.richieste.turno===p.team)S.richieste.turno=null;
    if(perche)ev(perche,{chi:chi(p)});};
  const libero=(x,y)=>{S.poss.stato="libero";S.poss.padrone=null;S.poss.ricevente=null;S.poss.t=0;S.poss.tipo=null;S.palla.x=clamp(x,0,100);S.palla.y=clamp(y,0,100);};
  const volo=(o)=>{S.poss.stato="volo";S.poss.tipo=o.tipo;S.poss.da={x:S.palla.x,y:S.palla.y};S.poss.a={x:o.x,y:o.y};S.poss.ricevente=o.ricevente!=null?o.ricevente:null;S.poss.esito=o.esito||null;S.poss.v=o.v||22;S.poss.t=0;S.poss.icpt=o.icpt!=null?o.icpt:null;S.poss.icptA=o.icptA||0;S.poss.tiratore=o.tiratore!=null?o.tiratore:null;S.poss.kind=o.kind||null;
    S.arco={type:o.arco||"pass",from:{x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)},to:{x:+o.x.toFixed(1),y:+o.y.toFixed(1)},actor:o.actor||null,rcv:o.rcv||null,lato:S.poss.lato};
    S.poss.padrone=null;};
  const fermoSet=(kind,lato,x,y,opt)=>{opt=opt||{};const tot=kind==="corner"?3:kind==="pen"?3:2;S.fermo={kind,lato,x:clamp(x,0,100),y:clamp(y,0,100),t:0,tot,batt:null};
    {let B=null;if(kind==="goal_kick")B=portiereDi(lato);else if(kind==="pen"){let bs=-1e9;for(const q of g){if(!mio(q,lato)||q.gk)continue;const sc=(q.rl==="AT"?10:0)+(q.eroe?6:0)+rnd()*4;if(sc>bs){bs=sc;B=q;}}}else{const T=piuVicino(S.fermo.x,S.fermo.y,lato,{noGk:true});B=T?T.p:null;}S.fermo.batt=B?B.i:null;}S.poss.stato="fermo";S.poss.lato=lato;S.poss.padrone=null;S.poss.ricevente=null;S.poss.t=0;S.palla.x=S.fermo.x;S.palla.y=S.fermo.y;
    if(S.richieste.turno===lato)S.richieste.turno=null;S.conta.fermo++;
    ev(kind==="foul"?"fallo":kind==="pen"?"rigore":kind==="corner"?"corner":kind==="throw"?"rimessa":"rinvio",Object.assign({x:+S.fermo.x.toFixed(1),y:+S.fermo.y.toFixed(1),per:lato},opt));};

  /* ---------- scelte ---------- */
  const scegliRicevente=(P,opt)=>{opt=opt||{};const l=P.team,d=dirDi(l);const golReq=opt.golReq;let best=null,bs=-1e9;
    for(const q of g){if(!mio(q,l)||q.i===P.i)continue;if(q.gk&&!opt.conGk)continue;
      const dd=hyp(q.x,q.y,P.x,P.y);if(dd<5||dd>46)continue;
      const fw=(q.x-P.x)*d;const advQ=advDi(q.x,l);
      const mk=piuVicino(q.x,q.y,altro(l),{noGk:true});const marc=mk?mk.d:99;
      const blk=corsiaLibera(P.x,P.y,q.x,q.y,l);
      let sc=fw*1.2-Math.abs(dd-24)*0.2-(marc<3?14:marc<5?6:0)-blk*9+(rnd()-0.5)*6;
      if(advDi(P.x,l)>=50&&advDi(P.x,l)<80&&Math.abs(q.y-50)>=24&&fw>0)sc+=4;/* la fascia come sbocco nella trequarti */
      if(golReq){sc+=Math.max(0,advQ-advDi(P.x,l))*0.8+(advQ>=70?8:0);}
      if(q.eroe)sc+=(cfg.eroe&&cfg.eroe.bonus)||2;
      if(fw<-12)sc-=6;
      if(sc>bs){bs=sc;best=q;}}
    if(!best&&opt.conGk!==true){const gk=portiereDi(l);if(gk&&hyp(gk.x,gk.y,P.x,P.y)<=40&&!P.gk)best=gk;}
    return best;};
  const tipoPassaggio=(P,R)=>{const d=dirDi(P.team);const fw=(R.x-P.x)*d,dd=hyp(P.x,P.y,R.x,R.y);
    if(dd>30)return"lancio";if(fw<-4)return"appoggio";if(Math.abs(R.y-P.y)>24)return"cambio";if(fw>13&&advDi(R.x,P.team)>=68)return"filtrante";if(fw>6)return"verticale";return"corto";};
  const passa=(P,R,opt)=>{opt=opt||{};const l=P.team;const kind=opt.kind||tipoPassaggio(P,R);
    const pIcpt=(kind==="lancio"?0.11:kind==="filtrante"?0.12:kind==="cambio"?0.07:0.04)+(pressioneSu(P)<2?0.05:0)+corsiaLibera(P.x,P.y,R.x,R.y,l)*0.10;
    let icpt=null,icptA=0;
    if(!opt.sicuro&&rnd()<pIcpt){const m=piuVicino((P.x+R.x)/2,(P.y+R.y)/2,altro(l),{noGk:true});if(m&&m.d<9){icpt=m.p.i;icptA=0.45+rnd()*0.35;}}
    if(!opt.sicuro&&Math.abs(R.y-50)>=36&&rnd()<((kind==="lancio"||kind==="cambio")?0.18:0.10)){S.poss.ultimoPassatore=P.i;S.conta.passaggi++;ev("passaggio",{da:chi(P),a:chi(R),kind,from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+R.x.toFixed(1),y:+R.y.toFixed(1)},fuori:true});volo({tipo:"fuori",kind,x:clamp(R.x,2,98),y:R.y>=50?100:0,ricevente:null,v:20,arco:"pass",actor:nome(P),rcv:nome(R)});return;}
    const lead=Math.min(4,hyp(P.x,P.y,R.x,R.y)*0.12);const tx=clamp(R.x+dirDi(l)*lead*(kind==="appoggio"?0:1),2,98),ty=clamp(R.y,3,97);
    S.poss.ultimoPassatore=P.i;S.conta.passaggi++;
    ev("passaggio",{da:chi(P),a:chi(R),kind,from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+tx.toFixed(1),y:+ty.toFixed(1)}});
    volo({tipo:"passaggio",kind,x:tx,y:ty,ricevente:R.i,v:kind==="lancio"?48:kind==="cambio"?48:50,icpt,icptA,arco:"pass",actor:nome(P),rcv:nome(R)});};
  const cross=(P,R,opt)=>{opt=opt||{};const l=P.team;S.poss.ultimoPassatore=P.i;S.conta.passaggi++;
    const tx=clamp(xDa(88+rnd()*6,l),2,98),ty=clamp(50+(rnd()-0.5)*16,3,97);
    ev("cross",{da:chi(P),a:chi(R),from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+tx.toFixed(1),y:+ty.toFixed(1)},corner:!!opt.corner});
    volo({tipo:"cross",kind:"cross",x:tx,y:ty,ricevente:R?R.i:null,v:48,arco:"cross",actor:nome(P),rcv:R?nome(R):null});};
  const esitoTiro=(P,intent,ctx)=>{const golReq=S.richieste.gol&&S.richieste.gol.lato===P.team?S.richieste.gol:null;
    let out=null;
    if(decidi){try{out=decidi(intent,Object.assign({attrs:attrsDi(P),seed:seme32(),x:advDi(P.x,P.team)},ctx||{})).outcome;}catch(_e){out=null;}}
    if(!out){const r=rnd();out=r<0.28?"goal":r<0.58?"saved":r<0.70?"blocked":r<0.78?"post":"wide";}
    if(out==="wall_blocked")out="blocked";
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
    volo({tipo:"tiro",kind:intent,x:tx,y:ty,ricevente:null,v:44,esito:out,tiratore:P.i,arco:"shot",actor:nome(P)});};
  const conduci=(P)=>{const d=dirDi(P.team);const passo=5+rnd()*3;const adv=advDi(P.x,P.team);
    let ty=P.y+(50-P.y)*0.12+(rnd()-0.5)*2;if(adv>=74&&Math.abs(P.y-50)>18)ty=P.y+(50-P.y)*0.3;
    const nx=clamp(P.x+d*passo,3,97),ny=clamp(ty,4,96);
    ev("conduzione",{chi:chi(P),from:{x:+P.x.toFixed(1),y:+P.y.toFixed(1)},to:{x:+nx.toFixed(1),y:+ny.toFixed(1)}});
    P.x=nx;P.y=ny;S.palla.x=clamp(P.x+d*0.5,0,100);S.palla.y=P.y;S.conta.conduzioni++;};
  const perdi=(P,come)=>{const l=P.team;const m=piuVicino(P.x,P.y,altro(l),{noGk:true});
    if(!m||m.d>4.5){ev("palla_persa",{chi:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1)});
      const T=(S.richieste.turno&&S.richieste.turno!==l)?piuVicino(P.x,P.y,altro(l),{noGk:true}):null;
      if(T&&T.d<=9){libero(clamp(P.x+(T.p.x-P.x)*0.7,2,98),clamp(P.y+(T.p.y-P.y)*0.7,3,97));return;}
      libero(clamp(P.x+dirDi(l)*(2+rnd()*4),2,98),clamp(P.y+(rnd()-0.5)*6,3,97));return;}
    const W=m.p;S.conta.contrasti++;
    if(Math.abs(P.y-50)>=42&&rnd()<0.45){ev("contrasto",{chi:chi(W),su:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1),fuori:true});fuoriCampo(P.x,P.y,rnd()<0.5?l:altro(l),"throw");return;}
    ev("contrasto",{chi:chi(W),su:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1)});
    W.x=clamp(P.x+dirDi(W.team)*0.8,2,98);W.y=P.y;tenuta(W,null);};
  const fallo=(P)=>{const l=P.team;const m=piuVicino(P.x,P.y,altro(l),{noGk:true});const adv=advDi(P.x,l);
    const rig=adv>=84&&Math.abs(P.y-50)<=20;S.conta.falli++;
    if(rig)fermoSet("pen",l,xDa(89,l),50,{chi:chi(m?m.p:null),su:chi(P)});
    else fermoSet("foul",l,P.x,P.y,{chi:chi(m?m.p:null),su:chi(P),adv:+adv.toFixed(0)});};
  const fuoriCampo=(x,y,lPer,kind)=>{S.conta.fuori++;
    if(kind==="corner"){S.conta.corner++;fermoSet("corner",lPer,xDa(99,lPer),y>=50?98:2);}
    else if(kind==="goal_kick")fermoSet("goal_kick",lPer,xDa(6,lPer),50);
    else fermoSet("throw",lPer,clamp(x,6,94),y>=50?99:1);};

  /* ---------- il tick ---------- */
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
    if(S.poss.t===1&&!golReq&&!(press>=4&&adv>=56&&rnd()<0.6)){ramo("controllo");
      if(zona==="area"&&press>=2.2&&rnd()<0.55){ramo("tiro1");tira(P);return;}
      if(press<1.8&&rnd()<0.12){ramo("persa1");perdi(P);return;}
      ev("controllo",{chi:chi(P),press:+press.toFixed(1),zona});return;/* controllo: il pallone sta ai piedi un tick */
    }
    if(!golReq){const r=rnd();const pF=(press<3?0.17:0.06)+(adv>=56?0.03:0);/* ~3-4 falli a partita: la palla morta e' il respiro della partita (7.843: 4-7 fermi). Non durante il gol decretato: la punizione allungava l'attesa oltre il tetto (test node rosso, 10/09) */if(r<pF){ramo("fallo");fallo(P);return;}if(press<2.2&&r<pF+0.06){ramo("persa");perdi(P);return;}}
    const verso=S.richieste.verso;
    let pTiro=zona==="area"?0.85:zona==="limite"?0.45:zona==="trequarti"?0.12:0;
    pTiro*=(1+0.35*att);if(press<2.4)pTiro*=0.6;if(verso)pTiro*=0.3;
    if(golReq){if(zona==="area"||zona==="limite"||golReq.t>=5){ramo("tiroGol");tira(P);return;}}
    else if(rnd()<pTiro){ramo("tiro");tira(P);return;}
    const spazio=spazioAvanti(P);
    const largo=Math.abs(P.y-50)>=22;
    if(!golReq&&adv>=72&&largo&&rnd()<0.55){let R=null,bs=-1e9;for(const q of g){if(!mio(q,l)||q.i===P.i||q.gk)continue;const aq=advDi(q.x,l);if(aq<78||Math.abs(q.y-50)>20)continue;const sc=aq+(q.eroe?4:0)+rnd()*6;if(sc>bs){bs=sc;R=q;}}if(R){ramo("cross");cross(P,R);return;}}
    if(verso&&!golReq){const dv=hyp(P.x,P.y,verso.x,verso.y);if(dv>10){let R=null,bs=1e9;for(const q of g){if(!mio(q,l)||q.i===P.i||q.gk)continue;const dq=hyp(q.x,q.y,verso.x,verso.y);const dd=hyp(q.x,q.y,P.x,P.y);if(dd<5||dd>40)continue;if(dq<bs){bs=dq;R=q;}}if(R&&bs<dv-4){passa(P,R,{sicuro:true});return;}}}
    const pCond=(S.poss.t<=3&&adv<86)?((spazio>=2?(S.poss.t===2?0.55:0.32):(S.poss.t===2?0.40:0.20))+(golReq?0.10:0)+(P.eroe?0.08:0)):0;
    if(rnd()<pCond){if(press<3&&spazio<2&&rnd()<0.22){if(rnd()<0.35){ramo("dribblingFallo");fallo(P);return;}ramo("dribblingPerso");perdi(P);return;}
      if(Math.abs(P.y-50)>=40&&rnd()<0.30){ramo("conduzioneFuori");ev("fuori",{chi:chi(P),x:+P.x.toFixed(1),y:+P.y.toFixed(1)});fuoriCampo(P.x,P.y,altro(l),"throw");return;}
      ramo("conduci");conduci(P);return;}
    const R=scegliRicevente(P,{golReq});
    if(R){ramo("passa");passa(P,R);return;}
    if(spazio>=3&&adv<90){ramo("conduci2");conduci(P);return;}
    ramo("ripiego");const R2=piuVicino(P.x,P.y,l,{escl:P.i});if(R2)passa(P,R2.p,{sicuro:true});else perdi(P);
  }
  function muoviVolo(){
    const p=S.poss;S.conta.volo++;p.t++;
    const R=p.ricevente!=null?g[p.ricevente]:null;
    if(p.tipo==="passaggio"&&R&&attivo(R)){const lead=Math.min(3,hyp(R.x,R.y,p.a.x,p.a.y)*0.3);p.a.x=clamp(R.x+(p.a.x-R.x)*0.5,2,98);p.a.y=clamp(R.y+(p.a.y-R.y)*0.5,3,97);}
    const dx=p.a.x-S.palla.x,dy=p.a.y-S.palla.y,dd=Math.hypot(dx,dy);
    const passo=Math.min(dd,p.v);
    let arrivato=false;
    if(p.icpt!=null){const tot=hyp(p.da.x,p.da.y,p.a.x,p.a.y)||1;const fatto=hyp(p.da.x,p.da.y,S.palla.x,S.palla.y);const frazDopo=(fatto+passo)/tot;
      if(frazDopo>=p.icptA){const W=g[p.icpt];const ix=p.da.x+(p.a.x-p.da.x)*p.icptA,iy=p.da.y+(p.a.y-p.da.y)*p.icptA;if(W&&attivo(W)&&hyp(W.x,W.y,ix,iy)<=4.5){W.x=clamp(ix,2,98);W.y=clamp(iy,3,97);S.conta.intercetti++;ev("intercetto",{chi:chi(W),da:chi(g[p.ultimoPassatore]),x:+ix.toFixed(1),y:+iy.toFixed(1)});tenuta(W,null);return;}}}
    if(dd<=p.v+0.01){S.palla.x=p.a.x;S.palla.y=p.a.y;arrivato=true;}
    else{S.palla.x+=dx/dd*passo;S.palla.y+=dy/dd*passo;}
    if(!arrivato){if(p.t>=4){libero(S.palla.x,S.palla.y);}return;}
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
    if(out==="post"){ev("palo",{chi:chi(P)});libero(xDa(93,l),clamp(S.palla.y+(rnd()-0.5)*14,30,70));return;}
    if(out==="blocked"){const m=piuVicino(S.palla.x,S.palla.y,altro(l),{noGk:true});ev("murato",{chi:chi(m?m.p:null),su:chi(P)});libero(clamp(S.palla.x-dirDi(l)*(3+rnd()*6),2,98),clamp(S.palla.y+(rnd()-0.5)*10,4,96));return;}
    ev("fuori",{chi:chi(P),x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)});fuoriCampo(S.palla.x,S.palla.y,altro(l),"goal_kick");
  }
  function arrivoCross(){const p=S.poss;const l=p.lato;const R=p.ricevente!=null?g[p.ricevente]:null;
    const A=piuVicino(S.palla.x,S.palla.y,l,{noGk:true});const D=piuVicino(S.palla.x,S.palla.y,altro(l),{noGk:true});
    const att=(R&&attivo(R)&&hyp(R.x,R.y,S.palla.x,S.palla.y)<6)?R:(A&&A.d<6?A.p:null);
    const dif=(D&&D.d<4)?D.p:null;
    if(dif&&(!att||rnd()<0.5)){dif.x=S.palla.x;dif.y=S.palla.y;const corner=rnd()<0.35;ev("spazzata",{chi:chi(dif),corner});if(corner)fuoriCampo(S.palla.x,S.palla.y,l,"corner");else libero(clamp(S.palla.x-dirDi(l)*(14+rnd()*10),4,96),clamp(S.palla.y+(rnd()-0.5)*30,6,94));return;}
    if(att){att.x=S.palla.x;att.y=S.palla.y;if(rnd()<0.62){tira(att,{intent:"header"});return;}tenuta(att,null);ev("ricezione",{chi:chi(att),kind:"cross"});return;}
    const gk=portiereDi(altro(l));if(hyp(gk.x,gk.y,S.palla.x,S.palla.y)<9){ev("presa",{gk:chi(gk)});gk.x=xDa(5,altro(l));gk.y=clamp(S.palla.y,42,58);tenuta(gk,null);return;}
    libero(S.palla.x,S.palla.y);
  }
  function tickLibero(){S.conta.libero++;S.poss.t++;
    const n=piuVicino(S.palla.x,S.palla.y,null,{noGk:true});const gk=piuVicino(S.palla.x,S.palla.y,null,{});
    let c=(gk&&gk.p.gk&&gk.d<4)?gk:n;
    if(S.richieste.turno){const w=piuVicino(S.palla.x,S.palla.y,S.richieste.turno,{noGk:true});if(w&&w.d<=5&&(!c||w.d<=c.d+2))c=w;}
    if(c&&c.d<=3.2){const P=c.p;if(P.team!==S.poss.lato){S.conta.contrasti++;ev("recupero",{chi:chi(P),x:+S.palla.x.toFixed(1),y:+S.palla.y.toFixed(1)});}P.x=S.palla.x-dirDi(P.team)*0.4;P.y=S.palla.y;tenuta(P,null);return;}
    if(S.poss.t>=6&&c&&c.d<=4.5){c.p.x=S.palla.x;c.p.y=S.palla.y;tenuta(c.p,null);}
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
    const st=S.poss.stato,l=S.poss.lato,d=dirDi(l);
    const bx=S.palla.x,by=S.palla.y;
    const padrone=S.poss.padrone!=null?g[S.poss.padrone]:null;
    const ric=S.poss.ricevente!=null?g[S.poss.ricevente]:null;
    /* inseguitore: il difendente piu' vicino alla palla; copertura: il secondo */
    let ins=null,cop=null,di=1e9,dc=1e9;
    if(st==="tenuta"||st==="volo"||st==="libero"){for(const q of g){if(!attivo(q)||q.gk)continue;if(st!=="libero"&&q.team===l)continue;if(st==="libero"&&S.richieste.turno&&q.team!==S.richieste.turno)continue;const dd=hyp(q.x,q.y,bx,by);if(dd<di){dc=di;cop=ins;di=dd;ins=q;}else if(dd<dc){dc=dd;cop=q;}}}
    S.inseguitore=ins?ins.i:null;
    /* appoggi: i due compagni piu' vicini al padrone, davanti a lui */
    const app=[];if(padrone&&st==="tenuta"){const c=[];for(const q of g){if(!mio(q,l)||q.gk||q.i===padrone.i)continue;c.push({q,d:hyp(q.x,q.y,padrone.x,padrone.y)});}c.sort((a,b)=>a.d-b.d);for(let i=0;i<Math.min(2,c.length);i++)app.push(c[i].q);}
    const advB=advDi(bx,l);
    for(const p of g){if(!attivo(p))continue;
      if(p.i===S.poss.padrone&&st==="tenuta")continue;/* il padrone si muove solo con la conduzione */
      const sl=slotDi(p);let tx,ty,v=4.5;
      const inPoss=(p.team===l)&&(st==="tenuta"||st==="volo"||st==="kickoff");
      const dp=dirDi(p.team);
      if(p.gk){tx=sl.x+dp*(inPoss?1.5:0);ty=50+(by-50)*0.18;v=2.5;}
      else{
        const spinta=inPoss?clamp((advB-40)*0.35,-4,14):clamp((advDi(bx,p.team)-50)*0.30,-10,4);
        tx=sl.x+dp*spinta+(bx-50)*0.35;
        ty=sl.y+(by-sl.y)*0.22;
        if(p.rl==="DF"&&!inPoss){tx=sl.x+dp*Math.min(spinta,0)+(bx-50)*0.25;}
      }
      if(st==="fermo"&&S.fermo&&S.fermo.batt===p.i){const f=S.fermo;tx=f.x-dp*(f.kind==="pen"?1.5:0.8);ty=f.kind==="corner"?f.y:f.y;v=8;}
      else if(st==="fermo"&&S.fermo){const f=S.fermo;
        if(f.kind==="corner"||f.kind==="pen"){const atk=(p.team===f.lato);const gx=xDa(f.kind==="pen"?89:92,f.lato);const k=p.i%11;
          if(f.kind==="pen"){if(p.gk){tx=xDa(3,altro(f.lato))===p.x?p.x:(p.team===f.lato?slotDi(p).x:xDa(2,altro(f.lato)));ty=50;}else{tx=xDa(80,f.lato)+(k%2)*dirDi(f.lato)*-2;ty=18+(k%10)*6.4;}}
          else if(!p.gk){if(atk){if(k<=5){tx=gx-dirDi(f.lato)*(2+(k%4)*2);ty=36+(k%4)*9;}else{tx=xDa(66,f.lato);ty=30+(k%4)*12;}}else{if(k<=6){tx=gx+dirDi(f.lato)*(1+(k%6)*1.2);ty=32+(k%6)*7;}else{tx=xDa(70,f.lato);ty=34+(k%3)*12;}}}
          v=6;}
      }
      if(st==="volo"&&ric&&p.i===ric.i){tx=S.poss.a.x-dp*0.4;ty=S.poss.a.y;v=6;}
      else if((st==="tenuta"||st==="libero")&&ins&&p.i===ins.i){if(st==="tenuta"){tx=bx-d*3;ty=by;}else{tx=bx;ty=by;}v=5.5;}
      else if(st==="volo"&&S.poss.icpt!=null&&p.i===S.poss.icpt){tx=S.poss.da.x+(S.poss.a.x-S.poss.da.x)*S.poss.icptA;ty=S.poss.da.y+(S.poss.a.y-S.poss.da.y)*S.poss.icptA;v=6;}
      else if(st==="volo"&&ins&&p.i===ins.i&&S.poss.tipo!=="tiro"){tx=S.poss.a.x;ty=S.poss.a.y;v=5;}
      else if((st==="tenuta"||st==="volo")&&cop&&p.i===cop.i){const gx=xDa(6,p.team);tx=bx+(gx-bx)*0.35;ty=by+(50-by)*0.4;v=5;}
      else if(app.indexOf(p)>=0&&padrone){const k=app.indexOf(p);tx=padrone.x+d*(12+k*6);ty=padrone.y+(k===0?-1:1)*(12+rnd()*6)*(padrone.y>50?1:-1)*(k===0?-1:1);v=5;}
      if(st==="kickoff"){const k=S.kickoff;if(p.gk){tx=sl.x;ty=50;}else{const casa=p.team===HOME;tx=casa?Math.min(sl.x,46):Math.max(sl.x,54);ty=sl.y;if(p.team===k.lato){const c=[];for(const q of g){if(!mio(q,k.lato)||q.gk)continue;c.push({q,d:hyp(q.x,q.y,50,50)});}c.sort((a,b)=>a.d-b.d);if(c[0]&&c[0].q.i===p.i){tx=50-dp*0.8;ty=50;}else if(c[1]&&c[1].q.i===p.i){tx=50-dp*3;ty=53;}}}v=8;}
      if(st==="rete"){v=1.2;}
      tx=clamp(tx,2,98);ty=clamp(ty,3,97);
      if(p.gk){tx=clamp(tx,p.team===HOME?2:88,p.team===HOME?12:98);ty=clamp(ty,30,70);}
      const dx=tx-p.x,dy=ty-p.y,dd=Math.hypot(dx,dy);
      const jx=(rnd()-0.5)*0.3,jy=(rnd()-0.5)*0.3;
      if(dd<=v){p.x=clamp(tx+jx,2,98);p.y=clamp(ty+jy,3,97);}
      else{p.x=clamp(p.x+dx/dd*v+jx,2,98);p.y=clamp(p.y+dy/dd*v+jy,3,97);}
    }
    /* anti-ammucchiata: due compagni mai a meno di 2,2u */
    for(let a=0;a<g.length;a++){const p=g[a];if(!attivo(p)||p.gk)continue;for(let b=a+1;b<g.length;b++){const q=g[b];if(!attivo(q)||q.gk||q.team!==p.team)continue;const dd=hyp(p.x,p.y,q.x,q.y);if(dd<2.2&&dd>0.001){const push=(2.2-dd)/2;const ux=(q.x-p.x)/dd,uy=(q.y-p.y)/dd;if(q.i!==S.poss.padrone){q.x=clamp(q.x+ux*push,2,98);q.y=clamp(q.y+uy*push,3,97);}if(p.i!==S.poss.padrone){p.x=clamp(p.x-ux*push,2,98);p.y=clamp(p.y-uy*push,3,97);}}}}
    if(padrone&&st==="tenuta"){S.palla.x=clamp(padrone.x+d*0.5,0,100);S.palla.y=padrone.y;}
  }

  /* ---------- API ---------- */
  function tick(ctx){ctx=ctx||{};S.tick++;if(ctx.min!=null)S.min=ctx.min|0;S.arco=null;
    if(S.scena){S.conta.scena++;return[];}
    if(S.richieste.gol&&S.richieste.gol.lato!==S.poss.lato){const gr=S.richieste.gol;gr.t=(gr.t|0)+1;if(!S.richieste.turno)S.richieste.turno=gr.lato;
      if(S.poss.stato==="tenuta"&&S.poss.padrone!=null&&S.poss.t>=1){const P=g[S.poss.padrone];if(P&&!P.gk){perdi(P);}}}
    /* tetto duro del decreto: al nono tick il gol entra da dove sta la palla (a fine partita non puo' restare appeso) */
    if(S.richieste.gol&&(S.richieste.gol.t|0)>=9&&S.poss.stato!=="rete"&&S.poss.stato!=="kickoff"&&!S.scena){const gr=S.richieste.gol;const W=piuVicino(S.palla.x,S.palla.y,gr.lato,{noGk:true});if(W){if(S.poss.padrone!==W.p.i){W.p.x=clamp(S.palla.x-dirDi(gr.lato)*0.4,2,98);W.p.y=S.palla.y;S.fermo=null;tenuta(W.p,null);}S.poss.t=2;gr.t=Math.max(gr.t,9);tira(W.p);muoviTutti();const out=S.eventi;S.eventi=[];return out;}}
    const st=S.poss.stato;
    if(st==="rete")tickRete();
    else if(st==="kickoff")tickKickoff();
    else if(st==="fermo")tickFermo();
    else if(st==="volo")muoviVolo();
    else if(st==="libero")tickLibero();
    else decidiTenuta();
    muoviTutti();
    if(S.poss.stato==="tenuta"&&S.poss.padrone!=null){const P=g[S.poss.padrone];S.palla.x=clamp(P.x+dirDi(P.team)*0.5,0,100);S.palla.y=P.y;}
    const out=S.eventi;S.eventi=[];return out;}
  const chiedi={
    gol(lato){S.richieste.gol={lato:lato===AWAY?AWAY:HOME,t:0};S.richieste.verso=null;},
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
  };
  function stato(){const p=S.poss;const pad=p.padrone!=null?g[p.padrone]:null;
    return{tick:S.tick,palla:{x:+S.palla.x.toFixed(2),y:+S.palla.y.toFixed(2)},
      poss:{stato:p.stato,lato:p.lato,padrone:p.padrone,ricevente:p.ricevente,tipo:p.tipo,t:p.t,eroe:pad?!!pad.eroe:false},
      fermo:S.fermo?{kind:S.fermo.kind,lato:S.fermo.lato,x:S.fermo.x,y:S.fermo.y,t:S.fermo.t,tot:S.fermo.tot}:null,
      rete:S.rete?{lato:S.rete.lato,t:S.rete.t}:null,kickoff:p.stato==="kickoff"?{lato:S.kickoff.lato,t:S.kickoff.t}:null,
      scena:S.scena,gioc:g.slice(0,21).map(q=>({x:+q.x.toFixed(2),y:+q.y.toFixed(2)})),eroe:{x:+g[HERO].x.toFixed(2),y:+g[HERO].y.toFixed(2),attivo:eroeAttivo},
      arco:S.arco,inseguitore:S.inseguitore,richieste:{gol:S.richieste.gol?{lato:S.richieste.gol.lato,t:S.richieste.gol.t}:null,turno:S.richieste.turno,verso:S.richieste.verso},
      conta:JSON.parse(JSON.stringify(S.conta)),quota:{home:S.quota.home,away:S.quota.away}};}
  return{tick,chiedi,stato,HERO,_g:g,_S:S};
}
if(typeof window!=='undefined'){try{window.__CPM_MOTORE_CREA=creaMotorePossesso;}catch(_e){}}
/* CMAV-MOTORE-END */
