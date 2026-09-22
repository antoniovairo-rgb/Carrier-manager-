/* [B1] TABELLINO AL BANCO — il tabellino che il motore (src/14) sa produrre oggi, per SQUADRA e a partita,
   affiancato al tabellino di una partita vera. Serve al cantiere «partita 2D credibile»: il campo dall'alto
   mostrera' questi numeri in sovrimpressione, quindi ogni riga deve reggere il confronto col calcio vero.
   Nessun browser, sola lettura. CPM_PARTITE (30), CPM_ROSSO, CPM_SRC14. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
function loadMotore(){const src=fs.readFileSync(process.env.CPM_SRC14||path.join(ROOT,'src','14-motore-possesso.jsx'),'utf8');const i=src.indexOf('/* CMAV-SRC-HEADER-END */');const code=src.slice(i+'/* CMAV-SRC-HEADER-END */'.length);const W=(process.env.CPM_ROSSO||'').split(',').filter(Boolean).reduce((o,k)=>(o[k]=true,o),{});return Function('decideExecution','window',code+'\nreturn creaMotorePossesso;')(undefined,Object.keys(W).length?W:undefined);}
const crea=loadMotore();
const giocatori=()=>{const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));const a=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));return h.concat(a);};
const N=+(process.env.CPM_PARTITE||30),MIN=92;
/* CPM_DEC: quante DECISIONI al minuto. Il motore accetta gia' ctx.dec su ogni sotto-tick, quindi la
   frequenza si misura senza toccare src/14.
   [16/09] IL DEFAULT ERA 1 E DICEVA «com'e' in produzione»: non e' piu' vero dalla 7.912, che ha portato
   il live match a `_SUB898=11` con OGNI battito che decide. Un banco a 1 decisione al minuto misurava una
   partita che nessuno gioca — e le sue voci (passaggi 10,1) non erano quelle del telefono del PO. Il
   default ora e' la cadenza VERA della produzione; per rivedere i vecchi numeri, CPM_DEC=1. */
const DEC=Math.max(1,Math.round(+(process.env.CPM_DEC||22)));/* [21/09] il default diceva 11 mentre la produzione gira a 22 dal 7.943, e il commento qui sopra dichiarava gia' «la cadenza VERA della produzione»: chi lanciava il banco senza variabili misurava una partita che non esiste piu' (9 voci fuori banda invece di 2). Stessa famiglia del test di logica riparato nel 7.950. */
const VUOTA=()=>({gol:0,tiri:0,inPorta:0,legno:0,fuori:0,murati:0,xg:0,passaggi:0,passOk:0,cross:0,corner:0,falli:0,rimesse:0,rinvii:0,rigori:0,parate:0,spazzate:0,intercetti:0,contrasti:0,conduzioni:0,pallePerse:0,possesso:0,ammoniti:0,espulsi:0,fuorigioco:0,assist:0});
/* expected goal derivati dalla zona e dalla pressione, come li deriveremmo a schermo */
const XG=(e)=>{const z=e.zona||'fuori';const base=z==='area'?0.14:z==='areaPiccola'?0.34:z==='limite'?0.06:0.03;const pr=typeof e.press==='number'?e.press:4;const k=pr<2?1.35:pr<4?1.0:0.72;return Math.min(0.9,base*k);};
function partita(seed){
  const m=crea({seed,giocatori:giocatori(),eroe:{name:'EROE',x:58,y:50,attivo:true,ovr:74},forza:{home:70,away:66}});
  const T={home:VUOTA(),away:VUOTA()};let vivo=0;const STA={};let chiamate=0,conEv=0;
  for(let t=1;t<=MIN;t++){
   /* [correzione dello strumento] i gol li decreta la CARRIERA, non il motore: senza decreti il banco misurava
      zero gol e zero assist e li dichiarava «mancanti», mentre il motore li produce eccome. Qui se ne chiedono
      quattro (due per lato) come fa il banco stati-sub, cosi' gol e assist diventano misurabili. */
   if(t===18||t===64)m.chiedi.gol('home');
   if(t===36||t===78)m.chiedi.gol('away');
   for(let k=0;k<DEC;k++){
    const evs=DEC>1?m.tick({min:t,dt:1/DEC,dec:true}):m.tick({min:t});const st=m.stato();
    chiamate++;if(evs&&evs.length)conEv++;STA[st.poss.stato]=(STA[st.poss.stato]||0)+1;
    const s=st.poss.stato;if(s==='tenuta'||s==='volo'||s==='libero'){vivo++;if(st.poss.lato&&T[st.poss.lato])T[st.poss.lato].possesso+=(s==='tenuta'?1:s==='volo'?1:0.5);}
    for(const e of evs){
      const l=(e.chi&&e.chi.team)||e.per||e.lato;const A=T[l]||null,B=T[l==='home'?'away':'home']||null;
      if(!A)continue;
      switch(e.t){
        case 'passaggio': A.passaggi++;if(!e.fuori)A.passOk++;break;
        case 'cross': A.passaggi++;A.cross++;A.passOk++;break;
        case 'tiro': {A.tiri++;A.xg+=XG(e);if(e.esito==='goal'||e.esito==='saved')A.inPorta++;else if(e.esito==='post')A.legno++;else if(e.esito==='blocked')A.murati++;else A.fuori++;break;}
        case 'gol': {A.gol++;
          /* [correzione dello strumento] l'assist NON e' un evento a se': e' un campo dentro l'evento del gol
             (`assist`), e cercandolo come evento il banco dichiarava zero su una voce che il motore produce da
             sempre. Dichiarare zero su qualcosa che esiste porta a implementarlo due volte. */
          if(e.assist&&e.assist.team&&T[e.assist.team])T[e.assist.team].assist++;break;}
        case 'corner': A.corner++;break;
        case 'fallo': A.falli++;break;
        case 'rigore': A.rigori++;break;
        case 'rimessa': A.rimesse++;break;
        case 'rinvio': A.rinvii++;break;
        case 'parata': if(B)B.parate++;else A.parate++;break;
        case 'spazzata': A.spazzate++;break;
        case 'intercetto': A.intercetti++;
          /* [7.923] un passaggio INTERCETTATO non e un passaggio riuscito: il banco contava riuscito ogni
             passaggio che non finiva fuori dal campo, ed e da li che veniva la precisione al 95 per cento.
             Il motore ora scala il punto a chi lo ha giocato: il banco deve contare allo stesso modo, o i
             due numeri divergono e non si sa piu quale dei due mente. */
          if(e.da&&e.da.team&&T[e.da.team])T[e.da.team].passOk=Math.max(0,(T[e.da.team].passOk|0)-1);
          break;
        case 'contrasto': case 'recupero': A.contrasti++;break;
        case 'conduzione': A.conduzioni++;break;
        case 'palla_persa': A.pallePerse++;break;
        case 'ammonizione': A.ammoniti++;break;
        case 'espulsione': A.espulsi++;break;
        case 'fuorigioco': A.fuorigioco++;break;
      }
    }
   }
  }
  const tp=T.home.possesso+T.away.possesso;if(tp>0){T.home.possesso=100*T.home.possesso/tp;T.away.possesso=100*T.away.possesso/tp;}
  T._sta=STA;T._chiamate=chiamate;T._conEv=conEv;
  return T;
}
const A=[];for(let g=0;g<N;g++)A.push(partita(1000+g*131));
const med=(k)=>{const v=[];for(const p of A){v.push(p.home[k]);v.push(p.away[k]);}return v.reduce((s,x)=>s+x,0)/v.length;};
/* riferimenti di una partita vera, per squadra e a partita (medie di campionato, arrotondate) */
const VERO={gol:[1.3,'gol'],tiri:[12.8,'tiri'],inPorta:[4.3,'tiri in porta'],legno:[0.3,'legni'],murati:[3.0,'tiri murati'],fuori:[4.5,'tiri fuori'],xg:[1.3,'expected goal'],possesso:[50,'possesso %'],passaggi:[450,'passaggi'],passOk:[375,'passaggi riusciti'],cross:[15,'cross'],corner:[4.9,'corner'],falli:[13,'falli commessi'],rimesse:[22,'rimesse laterali'],rinvii:[7,'rinvii dal fondo'],rigori:[0.13,'rigori'],parate:[3.2,'parate'],spazzate:[17,'spazzate'],intercetti:[8.5,'intercetti'],contrasti:[16.5,'contrasti vinti'],ammoniti:[2.4,'ammonizioni'],espulsi:[0.11,'espulsioni'],fuorigioco:[1.7,'fuorigioco'],assist:[1.0,'assist']};
const f=(x)=>x>=100?Math.round(x).toString():x>=10?x.toFixed(1):x.toFixed(2);
console.log(`\n=== TABELLINO per squadra, media su ${N} partite (${2*N} tabellini) — ${DEC} decision${DEC===1?'e':'i'} al minuto — contro la partita vera ===`);
console.log('  voce                    oggi        vero      rapporto');
let buchi=0,lontani=0,dist=0;
for(const k in VERO){const [rif,nome]=VERO[k];const o=med(k);const r=rif>0?o/rif:0;
  /* [7.945] LA DISTANZA TOTALE DAL VERO, perche' il CONTEGGIO delle voci fuori banda e' cieco.
     Misurato: facendo attaccare il pallone ai difensori sul cross, le spazzate fanno x6 e altre tre voci
     si avvicinano, ma nessuna ATTRAVERSA la banda — il conteggio resta identico e non vede un
     miglioramento del 15 %. Qui si somma |log(rapporto)| su tutte le voci: zero e' la partita vera,
     e una voce che passa da 0,01x a 0,06x conta, anche se resta lontana. */
  if(rif>0)dist+=Math.abs(Math.log(Math.max(r,1e-3)));
  const stato=o===0&&rif>0.05?'  ← MANCA':(r<0.5||r>2)?'  ← lontano':'';
  if(o===0&&rif>0.05)buchi++;else if(r<0.5||r>2)lontani++;
  console.log(`  ${nome.padEnd(22)} ${f(o).padStart(7)} ${f(rif).padStart(11)} ${(rif>0?r.toFixed(2)+'x':'-').padStart(10)}${stato}`);}
{const S={};let ch=0,ce=0;for(const p of A){ch+=p._chiamate;ce+=p._conEv;for(const k in p._sta)S[k]=(S[k]||0)+p._sta[k];}
 const righe=Object.keys(S).sort((a,b)=>S[b]-S[a]).map(k=>`${k} ${(100*S[k]/ch).toFixed(1)} %`).join(' · ');
 console.log(`\n  dove sta il motore quando lo si chiama: ${righe}`);
 console.log(`  chiamate che producono almeno un evento: ${(100*ce/ch).toFixed(1)} % (${Math.round(ch/(N*MIN)*10)/10} chiamate al minuto)`);}
console.log(`\n  voci a zero che nel calcio vero esistono: ${buchi} · voci fuori dal doppio/meta': ${lontani} · voci su ${Object.keys(VERO).length}`);
console.log(`  distanza totale dal vero: ${dist.toFixed(3)} (somma di |log rapporto|; 0 = partita vera)`);
