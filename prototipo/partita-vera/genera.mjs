/* Fase 2 «partita vera» — GENERATORE DEL MOTORE v2.
   Il motore del prototipo NON e' una riscrittura: e' src/14-motore-possesso.jsx del gioco con un elenco
   di patch con nome. Ogni patch cerca un testo esatto e fallisce se non lo trova (una volta sola),
   cosi' quando il gioco cambia il generatore se ne accorge. In Fase 3 le stesse patch entrano nel gioco.
   Con cfg.v2 falso il motore generato si comporta come quello del gioco (e' il «rosso»).
   Uso: node prototipo/partita-vera/genera.mjs  → scrive prototipo/partita-vera/motore-v2.js */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(QUI, '..', '..');
let src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
src = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + 26, src.indexOf('if(typeof window!==\'undefined\'){try{window.__CPM_MOTORE_CREA'));
const PATCH = [];
const patch = (nome, da, a) => PATCH.push({ nome, da, a });

/* V2-0 · le grandezze nuove: chi gioca in casa nello stadio (il motore mette sempre l'eroe «home») e il vantaggio di forza */
patch('V2-0 vantaggio', `  const attrsDi=(p)=>{`,
`  const V2=!!cfg.v2;
  /* [v2] lo STADIO: nel motore «home» e' sempre la squadra dell'eroe (il verso del campo); qui si dice chi gioca davvero in casa */
  const STADIO=(cfg.stadio==='home'||cfg.stadio==='away')?cfg.stadio:null;
  const K2=Object.assign({/* taratura del banco da 1000 partite (fase 2): ogni valore e' misurato, non preso da una fonte */pTiro:0.3,pAtt:0.085,sete:2.0,xg0:-1.25,xgAng:1.0,xgDist:0.06,testa:0.55,pOn0:0.20,pOnXg:1.1,forzaTiro:0.012,forzaXg:0.006,perdita:0.03,forzaPerdita:0.004,perditaMax:0.2,forzaPass:0.02,campo:6,gestione:0.03,gestioneAdv:70,cornerParata:0.38,cornerMurato:0.45,cornerSpazzata:0.45,rossoDiretto:0.004,gialli:1.2},cfg.k2||{});
  const vantDi=(l)=>V2?((forza[l]-forza[l==='home'?'away':'home'])+(STADIO===l?K2.campo:STADIO&&STADIO!==l?-K2.campo:0)):0;
  const attrsDi=(p)=>{`);

/* V2-1 · l'espulso esce davvero: non tocca piu' palla, non riceve, non difende (oggi il motore lo lascia in campo, src/14:399-414) */
patch('V2-1 espulso fuori', `  const attivo=(p)=>!!p&&(!p.eroe||eroeAttivo);`,
`  const attivo=(p)=>!!p&&(!p.eroe||eroeAttivo)&&!(V2&&S&&S.cartellini&&S.cartellini[p.i]&&S.cartellini[p.i].r);`);

/* V2-2 · l'xG lo decide il tiro: il gol e' l'esito del tiro, estratto dal SUO xG. Niente gol negati (src/14:357), niente gol richiesti */
patch('V2-2 gol dagli xG', `  const esitoTiro=(P,intent,ctx)=>{`,
`  /* [v2] xG del tiro: logistica su angolo della porta e distanza in metri (campo 105 x 68). Coefficienti TARATI sulle bande
     (gol per tiro 11,1 % su 4.337 partite vere), non presi da una fonte. Rigore 0,76 e punizione 0,06: ipotesi dichiarate. */
  const xgV2=(P,intent,press)=>{const l=P.team;if(intent==='penalty')return 0.76;
    const adv=advDi(P.x,l);const mx=Math.max(0.5,(100-adv)*1.05),my=Math.abs(P.y-50)*0.68;const dist=Math.hypot(mx,my);
    const ang=Math.max(0.02,Math.atan2(7.32*mx,mx*mx+my*my-3.66*3.66<0?0.01:mx*mx+my*my-3.66*3.66));
    let x=1/(1+Math.exp(-(K2.xg0+K2.xgAng*ang-K2.xgDist*dist)));
    if(intent==='freekick')x=Math.min(x,0.06);if(intent==='header')x*=K2.testa;
    x*=(press<2?0.75:press<4?0.9:1);x*=Math.exp(K2.forzaXg*vantDi(l));return clamp(x,0.005,0.9);};
  const esitoTiroV2=(P,intent,ctx)=>{const pr=(ctx&&ctx.pressRaw!=null)?ctx.pressRaw:4;const xg=xgV2(P,intent,pr);S._xgV2=xg;
    if(rnd()<xg)return "goal";
    const pOn=clamp(K2.pOn0+xg*K2.pOnXg,0.12,0.8);if(rnd()<pOn)return "saved";
    const r=rnd();return r<0.06?"post":r<0.40?"blocked":"wide";};
  const esitoTiro=(P,intent,ctx)=>{if(V2)return esitoTiroV2(P,intent,ctx);`);
patch('V2-2b pressione grezza al tiro', `const out=esitoTiro(P,intent,{pressure:press<2?3:press<4?2:1,gkOut:false});`,
`const out=esitoTiro(P,intent,{pressure:press<2?3:press<4?2:1,gkOut:false,pressRaw:press});`);
patch('V2-2c xG sull\'evento', `ev("tiro",{chi:chi(P),zona,intent,`, `if(V2){S._ultTiroV2=S._ultTiroV2||{};S._ultTiroV2[l]=S.min;}ev("tiro",{chi:chi(P),zona,intent,xg:V2?+(S._xgV2||0).toFixed(3):undefined,`);
patch('V2-2d tabellino xG dall\'evento', `case 'tiro': A.tiri++;A.xg=Math.round((A.xg+_XG914(e))*100)/100;`,
`case 'tiro': A.tiri++;A.xg=Math.round((A.xg+(typeof e.xg==='number'?e.xg:_XG914(e)))*1000)/1000;`);
patch('V2-3 nessun gol richiesto', `    gol(lato){S.richieste.gol=`, `    gol(lato){if(V2)return;S.richieste.gol=`);

/* V2-4 · la forza si vede: chi e' piu' forte perde meno palloni (possesso) e crea di piu' (tiri). Oggi 85 contro 55 non cambia il possesso */
patch('V2-4 forza nel possesso', `    const att=S.richieste.att[l]||0;
    if(P.gk){`,
`    const att=S.richieste.att[l]||0;
    /* [v2] L'OCCASIONE DELL'EROE: la scelta e' un INGRESSO del motore. Stessa condizione di occasione(), che e' pura, ed e' il PRIMO
       controllo del battito: annunciata l'occasione, si gioca subito. Misurato: col pressing prima, il pallone perso e ripreso quattro
       battiti dopo consumava la scelta fatta per l'occasione precedente, e sim rapida e partita guardata divergevano */
    if(V2&&P.eroe&&_occV2Pronta(P)){eseguiOccV2(P);return;}
    if(V2&&!P.gk){const pP=clamp(K2.perdita-K2.forzaPerdita*vantDi(l),0.004,K2.perditaMax)*_cad936();if(rnd()<pP){ramo("pressingV2");perdi(P,"contrasto");return;}}
    if(P.gk){`);
patch('V2-4b forza nei tiri', `    pTiro*=(1+0.35*att);`, `    pTiro*=(1+0.35*att);if(V2)pTiro*=K2.pTiro*Math.exp(K2.forzaTiro*vantDi(l));`);

/* V2-7 · chi e' piu' forte sbaglia meno passaggi: l'intercetto scala col vantaggio di forza. E' la leva che decide il possesso */
patch('V2-7 forza nei passaggi', `    let icpt=null,icptA=0;
    if(!opt.sicuro&&rnd()<pIcpt){`, `    let icpt=null,icptA=0;const pIcpt2=V2?Math.min(0.6,pIcpt*Math.exp(-K2.forzaPass*vantDi(l))):pIcpt;
    if(!opt.sicuro&&rnd()<pIcpt2){`);

/* V2-8 · i corner: nel gioco sono ~5 a partita contro 9,8 veri. Nascono da parate, tiri murati e spazzate: le tre quote diventano parametri */
patch('V2-8a corner da parata', `if(out==="saved"){const corner=rnd()<0.35;`, `if(out==="saved"){const corner=rnd()<(V2?K2.cornerParata:0.35);`);
patch('V2-8b corner da murato', `if(!_no913c&&rnd()<0.40){fuoriCampo(S.palla.x,S.palla.y,l,"corner");return;}/* [7.913 A8] la deviazione in angolo */`,
  `if(!_no913c&&rnd()<(V2?K2.cornerMurato:0.40)){fuoriCampo(S.palla.x,S.palla.y,l,"corner");return;}/* [7.913 A8] la deviazione in angolo */`);
patch('V2-8c corner da spazzata', `const corner=rnd()<0.30;const _lat`, `const corner=rnd()<(V2?K2.cornerSpazzata:0.30);const _lat`);

/* V2-9 · I TIRI NASCONO DAL TEMPO PASSATO NELL'ULTIMO TERZO. Misurato: la palla sta negli ultimi terzi il 58-72 % del tempo in
   OGNI partita, ma i tiri vanno da 1 a 38 (deviazione 8,0 su 12,6; nel calcio vero 6,0 su 25,4) perche' nascono quasi solo da una
   geometria precisa (cross con un compagno in area: correlazione 0,75). Qui ogni decisione nell'ultimo terzo ha una probabilita' di
   concludere pesata dalla zona e dalla forza; le vie di prima restano, ridotte da K2.pTiro. */
patch('V2-9 tiro dal terzo', `    if(golReq){if(zona==="area"||zona==="limite"`,
`    /* [v2] L'IMPAZIENZA: piu' minuti senza tirare, piu' si cerca la conclusione. Misurato: gli 0-0 erano partite «morte» (16 tiri, xG 1,25
       contro 25 e 2,84), con lunghe siccita' di tiri. Nessun numero-obiettivo: si accorciano solo le siccita' */
    if(V2&&!golReq&&adv>=66){const _sec=S.min-((S._ultTiroV2&&S._ultTiroV2[l]!=null)?S._ultTiroV2[l]:0);const pS=K2.pAtt*Math.exp(K2.forzaTiro*vantDi(l))*_cad936()*(zona==="area"?1.6:zona==="limite"?1.0:0.45)*(Math.abs(P.y-50)>22?0.45:1)*(press<2?0.7:1)*(1+K2.sete*Math.max(0,_sec-5)/10);
      if(rnd()<pS){ramo("tiroV2");tira(P);return;}}
    if(golReq){if(zona==="area"||zona==="limite"`);

/* V2-10 · IL CROSS HA SEMPRE CHI ATTACCA L'AREA. Misurato: nelle partite da 3 tiri la squadra tiene palla sulla fascia nell'ultimo terzo
   per ~700 battiti ma nessuno e' gia' in area (cross 0); in quelle da 30 un attaccante c'e' e i cross sono 25-33. Il cross chiedeva
   un compagno GIA' dentro (avanzamento >= 78): ora basta chi arriva al limite (>= 66, entro 28 dal centro), che corre sul punto d'arrivo */
patch('V2-10 cross con chi attacca', `const aq=advDi(q.x,l);if(aq<78||Math.abs(q.y-50)>20)continue;`, `const aq=advDi(q.x,l);if(aq<(V2?66:78)||Math.abs(q.y-50)>(V2?28:20))continue;`);

/* V2-11 · CHI E' PIU' FORTE GESTISCE IL PALLONE. Misurato: con intercetti e perdite scalati sulla forza il possesso di 85 contro 55
   resta 51 %: le perdite in piu' del debole si recuperano subito. La squadra forte, nella sua meta' campo e senza pressione, tiene
   e fa girare palla invece di verticalizzare: aggiunge tempo, non tiri */
patch('V2-11 gestione del forte', `    if(V2&&P.eroe&&_occV2Pronta(P)){eseguiOccV2(P);return;}`,
`    if(V2&&P.eroe&&_occV2Pronta(P)){eseguiOccV2(P);return;}
    if(V2&&!P.gk&&advDi(P.x,l)<K2.gestioneAdv){const vq=vantDi(l);if(vq>0&&pressioneSu(P)>=2.4&&rnd()<Math.min(0.45,K2.gestione*vq)){ramo("gestioneV2");ev("controllo",{chi:chi(P),press:+pressioneSu(P).toFixed(1),zona:zonaDi(advDi(P.x,l),P.y),gestione:true});return;}}`);

/* V2-12 · IL ROSSO DIRETTO. Oggi il rosso arriva solo col secondo giallo (0,07 a partita contro 0,18 veri, 4.337 partite):
   manca l'espulsione diretta per il fallo grave */
patch('V2-12 rosso diretto', `    if(rnd()>=_p)return;`, `    if(V2&&rnd()<K2.rossoDiretto){_st.r=true;ev("espulsione",{chi:chi(W),su:chi(P),per:"rosso diretto",lato:W.team});return;}
    if(rnd()>=_p)return;`);

/* V2-13 · I GIALLI: 3,47 a partita contro 4,25 veri (4.337 partite). Il fallo resta com'e', cresce solo la quota di ammonizioni */
patch('V2-13 gialli', `const _p=(0.16+(adv>=60?0.05:0)+(adv>=78?0.05:0))*(_st.g>=1?0.09:1);`, `const _p=(0.16+(adv>=60?0.05:0)+(adv>=78?0.05:0))*(_st.g>=1?0.09:1)*(V2?K2.gialli:1);`);

/* V2-5 · il cross conta come passaggio riuscito solo se arriva a un compagno (oggi sempre, src/14:116) */
patch('V2-5 cross riuscito', `      case 'cross': A.passaggi++;A.passOk++;A.cross++;break;`,
`      case 'cross': A.passaggi++;if(!V2)A.passOk++;A.cross++;break;`);
patch('V2-5b cross arrivato', `    switch(e.t){
      case 'passaggio': A.passaggi++;`,
`    if(V2&&((e.t==='ricezione'&&e.kind==='cross')||(e.t==='tiro'&&e.intent==='header')))A.passOk++;
    switch(e.t){
      case 'passaggio': A.passaggi++;`);

/* V2-6 · l'occasione dell'eroe e la sua scelta automatica «dal profilo» (scelta PO) */
patch('V2-6 occasione eroe', `  function muoviVolo(){`,
`  /* [v2] un'occasione ogni 5 minuti al massimo, quando l'eroe ha palla da avanzamento 64 in su. Funzione PURA (nessun sorteggio):
     il chiamante la puo' interrogare prima del battito per fermarsi e chiedere la scelta, e il motore la rivaluta identica. */
  function _occV2Pronta(P){if(!V2||!P||!P.eroe||!eroeAttivo)return false;if(S.poss.stato!=="tenuta"||S.poss.padrone!==HERO)return false;
    return advDi(P.x,P.team)>=64&&(S.min-(S._ultOccV2==null?-99:S._ultOccV2))>=5;}
  /* la scelta automatica: la giocata che il profilo dell'eroe rende piu' sensata in quel punto. Regola MIA, dichiarata */
  function sceltaAutoV2(P){const l=P.team,adv=advDi(P.x,l),zona=zonaDi(adv,P.y),press=pressioneSu(P),spazio=spazioAvanti(P);
    const pr=(cfg.eroe&&cfg.eroe.profilo)||{};const v=(k)=>(+pr[k]||+(cfg.eroe&&cfg.eroe.ovr)||70)/70;
    const s={tiro:(zona==="area"?1.0:zona==="limite"?0.45:0.12)*v("tiro")*(press<2?0.75:1),cross:(adv>=72&&Math.abs(P.y-50)>=22)?0.85*v("passaggio"):0,
      dribbling:(spazio>=3?0.62:0.30)*v("dribbling"),passaggio:0.55*v("passaggio")};
    let best="passaggio",bs=-1;for(const k of ["tiro","cross","dribbling","passaggio"])if(s[k]>bs){bs=s[k];best=k;}return best;}
  function eseguiOccV2(P){const k=(S._nOccV2|0);S._nOccV2=k+1;S._ultOccV2=S.min;const auto=sceltaAutoV2(P);
    const sc=(cfg.scelte&&cfg.scelte[k])||auto;const l=P.team,adv=advDi(P.x,l);
    ev("occasione_eroe",{k,auto,scelta:sc,chi:chi(P),zona:zonaDi(adv,P.y),x:+P.x.toFixed(1),y:+P.y.toFixed(1)});
    if(sc==="tiro"){tira(P);return;}
    if(sc==="cross"){let R=null,bs=-1e9;for(const q of g){if(!mio(q,l)||q.i===P.i||q.gk)continue;const aq=advDi(q.x,l);if(aq<74)continue;const s2=aq-Math.abs(q.y-50)*0.3+rnd()*6;if(s2>bs){bs=s2;R=q;}}
      if(R){cross(P,R);return;}const R2=scegliRicevente(P,{});if(R2)passa(P,R2);else conduci(P);return;}
    if(sc==="dribbling"){let D=null,dd=99;for(const q of g){if(!attivo(q)||q.team===P.team||q.gk)continue;const d=hyp(q.x,q.y,P.x,P.y);if(d<dd){dd=d;D=q;}}
      const a=attrsDi(P),b=D?attrsDi(D):a;const pOk=clamp(0.46+((a.dribbling+a.velocità)/2-(b.fisico+b.posizionamento)/2)*0.012,0.2,0.8);
      if(S.tab)S.tab[l].dribbling++;if(rnd()<pOk){if(S.tab)S.tab[l].dribblingOk++;ev("dribbling",{chi:chi(P),su:chi(D),ok:true});conduci(P,{spinta:true});return;}
      ev("dribbling",{chi:chi(P),su:chi(D),ok:false});if(rnd()<0.3){fallo(P);return;}perdi(P,"contrasto");return;}
    const R=scegliRicevente(P,{});if(R)passa(P,R);else conduci(P);}
  function muoviVolo(){`);
patch('V2-6b api', `  return{tick,chiedi,stato,tabellino,pagelle,registra,risolviEroe,HERO,_g:g,_S:S};`,
`  const occasione=(min)=>{const P=g[HERO];const m0=S.min;if(min!=null)S.min=min|0;const ok=V2&&!S.scena&&_occV2Pronta(P);S.min=m0;
    return ok?{k:(S._nOccV2|0),auto:sceltaAutoV2(P),zona:zonaDi(advDi(P.x,P.team),P.y),x:+P.x.toFixed(1),y:+P.y.toFixed(1)}:null;};
  const espulsi=()=>Object.keys(S.cartellini||{}).filter(k=>S.cartellini[k].r).map(Number);
  return{tick,chiedi,stato,tabellino,pagelle,registra,risolviEroe,HERO,_g:g,_S:S,occasione,espulsi,v2:V2};`);

/* dalla 7.999.2 le patch vivono DENTRO src/14 (motore unico nel gioco): se ci sono gia', il generatore copia e basta.
   --applica: scrive le patch in src/14 (una volta sola). */
const GIA = src.includes('const V2=!!cfg.v2;');
if (!GIA) { for (const p of PATCH) { const n = src.split(p.da).length - 1; if (n !== 1) { console.error(`✗ patch «${p.nome}»: trovato ${n} volte`); process.exit(1); } src = src.replace(p.da, () => p.a); } }
if (!GIA && process.argv.includes('--applica')) {
  const f = path.join(ROOT, 'src', '14-motore-possesso.jsx'); const orig = fs.readFileSync(f, 'utf8');
  const a = orig.indexOf('/* CMAV-SRC-HEADER-END */') + 26, b = orig.indexOf("if(typeof window!=='undefined'){try{window.__CPM_MOTORE_CREA");
  fs.writeFileSync(f, orig.slice(0, a) + src + orig.slice(b)); console.log('✓ patch scritte in src/14-motore-possesso.jsx');
}
const out = `/* GENERATO da prototipo/partita-vera/genera.mjs a partire da src/14-motore-possesso.jsx — non modificare a mano.
   Patch: ${GIA ? 'gia\' dentro src/14' : PATCH.map(p => p.nome).join(' · ')} */
(function(root){
${src}
root.creaMotoreV2=creaMotorePossesso;
})(typeof window!=='undefined'?window:globalThis);
`;
fs.writeFileSync(path.join(QUI, 'motore-v2.js'), out);
console.log(`✓ motore-v2.js scritto: ${PATCH.length} patch, ${out.length} byte`);
