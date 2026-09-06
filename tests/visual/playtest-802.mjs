/* [PLAYTEST CRITICO — direttiva PO 06/09] LA CARRIERA DI UN ATTACCANTE, MISURATA.
   Metodo in docs/PLAYTEST-ATTACCANTE.md. Qui si producono i NUMERI della seconda passata:
   ritmo e vuoto · coinvolgimento dell'eroe · causalita' ed eventi ISOLATI · azioni extra-eroe
   e loro funzione narrativa · telecronaca (ripetitivita' ed enfasi) · varieta'.

   IL CRITERIO DEGLI EVENTI ISOLATI e' quello testuale del PO — «se un evento potrebbe essere
   spostato in qualsiasi minuto della partita senza cambiare nulla, e' troppo scollegato» —
   reso operativo su tre condizioni simultanee: la riga non afferma niente (muta:1), niente
   la prepara nei 2 minuti prima, niente ne discende nei 2 minuti dopo.

   Sola lettura. Partite intere, regime del gioco, GLB ON. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const NOMI=(process.env.CPM_NOMI||'Rossi,Bianchi,Verdi,Neri').split(',');
const SEMI=NOMI.map((_,g)=>8200+g*911);
const GLB=process.env.CPM_GLB!=='0';
const ENFASI=/(!|incredibil|clamoros|pazzesc|spettacolar|straordinari|magnific|meravigli|prodigios|fantastic|stupend|super[bo])/i;

const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return +w[Math.min(w.length-1,Math.floor(p*w.length))].toFixed(2);};
const med=v=>q(v,0.5);
const media=v=>v.length?+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(2):NaN;
const pc=(a,b)=>b?Math.round(100*a/b)+'%':'n/d';

const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const P=[];   /* una voce per partita */

for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((glb)=>{window.__CPM_GLB=glb;window.__CPM_REC=true;window.__CPM_CRO802=[];},GLB);
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);

  /* SERIE DI STATO: per ogni minuto, cosa dice la simulazione. Serve per chiedersi se
     un'azione extra-eroe arriva in un momento che la giustifica o su uno stato neutro. */
  const stato={};const EV=[];
  let min=0;
  for(let k=0;k<900;k++){
    await sleep(700);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const e=(window.__CPM_EV&&window.__CPM_EV())||[];
      if(window.__CPM_EV_RESET)window.__CPM_EV_RESET();
      /* ⚠️ IL MATCH STATE NON HA `shots`/`oppShots` — la prima stesura li leggeva e prendeva
         SEMPRE zero, cioe' «nessuno domina mai»: uno zero silenzioso, il difetto che ho gia'
         fatto due volte. I campi che esistono davvero sono momentum, pressione, poss, superiorita. */
      return {ms:ms?{min:ms.min|0,h:(ms.score&&ms.score.h)|0,a:(ms.score&&ms.score.a)|0,
                     mom:ms.momentum|0,poss:ms.poss|0,sup:ms.superiorita|0,
                     press:(ms.pressione&&ms.pressione.addosso)|0,
                     turn:ms.turn|0,bx:ms.ball?+ms.ball.x.toFixed(1):null}:null,e};
    });
    if(s.e&&s.e.length)EV.push(...s.e);
    if(s.ms){min=s.ms.min;if(stato[min]==null)stato[min]=s.ms;else stato[min]=s.ms;}
    if(min>=89)break;
  }
  const fine=await page.evaluate(()=>{
    const e=(window.__CPM_EV&&window.__CPM_EV())||[];
    return {e,cro:window.__CPM_CRO802||[],occ:window.__CPM_OCC695||null,apri:window.__CPM_APRI789||null};
  });
  EV.push(...(fine.e||[]));
  P.push({nome:NOMI[g],seme:SEMI[g],min,EV,stato,cro:fine.cro||[],occ:fine.occ,apri:fine.apri});
  console.log('['+NOMI[g]+' · seme '+SEMI[g]+'] min '+min+' · righe di telecronaca '+(fine.cro||[]).length
    +' · voci di registro '+EV.length);
  await ctx.close();
}
await b.close();srv.close();

/* ============================ A. RITMO E VUOTO ============================ */
console.log('\n================ A · RITMO E VUOTO ================');
console.log('  «Anche il non accadere nulla deve essere credibile.»');
const vuotiTot=[],maxVuoti=[],dens=[],gapHL=[];
for(const p of P){
  const perMin={};p.cro.forEach(c=>{perMin[c.t]=(perMin[c.t]||0)+1;});
  const fine=Math.max(1,p.min);
  let vuoti=0,run=0,maxRun=0;
  for(let m=1;m<=fine;m++){if(!perMin[m]){vuoti++;run++;if(run>maxRun)maxRun=run;}else run=0;}
  vuotiTot.push(vuoti);maxVuoti.push(maxRun);dens.push(+(p.cro.length/fine).toFixed(2));
  /* momenti salienti: gol, tiri, scene dell'eroe */
  const hl=p.EV.filter(e=>e.ev==='goal'||e.ev==='esito'||(e.ev==='chronicle'&&e.ef)).map(e=>e.min|0).sort((a,b)=>a-b);
  for(let i=1;i<hl.length;i++)gapHL.push(hl[i]-hl[i-1]);
  const q1=p.cro.filter(c=>c.t<=15).length,q4=p.cro.filter(c=>c.t>fine-15).length;
  console.log('  '+p.nome.padEnd(8)+' minuti vuoti '+String(vuoti).padStart(2)+'/'+fine
    +'  ('+pc(vuoti,fine)+')  · vuoto piu\' lungo '+maxRun+"'"
    +' · righe/minuto '+(p.cro.length/fine).toFixed(2)
    +' · primi 15\' '+q1+' righe vs ultimi 15\' '+q4);
}
console.log('  ---');
console.log('  minuti vuoti: mediana '+med(vuotiTot)+' · vuoto piu\' lungo: mediana '+med(maxVuoti)+"' · max "+Math.max(...maxVuoti)+"'");
console.log('  densita\' righe/minuto: mediana '+med(dens)+' (spread '+Math.min(...dens)+'-'+Math.max(...dens)+')');
if(gapHL.length)console.log('  intervallo fra momenti salienti: mediana '+med(gapHL)+"' · p90 "+q(gapHL,0.9)+"' · max "+Math.max(...gapHL)+"'");
console.log('  BUGIA DA CERCARE: densita\' piatta. Se lo spread fra partite e fra tempi e\' nullo,');
console.log('  la partita non respira — e\' un metronomo.');

/* ====================== B. COINVOLGIMENTO DELL'EROE ====================== */
console.log('\n================ B · COINVOLGIMENTO DELL\'EROE ================');
console.log('  «L\'eroe e\' protagonista quando la partita lo rende protagonista.»');
const scene=[],quote=[],vuotiEroe=[];
for(const p of P){
  const cog=p.nome;
  const rEroe=p.cro.filter(c=>c.txt.indexOf(cog)>=0);
  const sc=p.EV.filter(e=>e.ev==='esito').map(e=>e.min|0).sort((a,b)=>a-b);
  const tocchi=[...new Set(rEroe.map(c=>c.t).concat(sc))].sort((a,b)=>a-b);
  let maxG=tocchi.length?tocchi[0]:p.min,prev=tocchi.length?tocchi[0]:0;
  tocchi.forEach(t=>{if(t-prev>maxG)maxG=t-prev;prev=t;});
  if(tocchi.length&&p.min-prev>maxG)maxG=p.min-prev;
  scene.push(sc.length);quote.push(p.cro.length?+(rEroe.length/p.cro.length).toFixed(2):0);vuotiEroe.push(maxG);
  const gol=p.EV.filter(e=>e.ev==='esito'&&e.key==='goal'&&e.ok).length;
  console.log('  '+p.nome.padEnd(8)+' scene interattive '+String(sc.length).padStart(2)
    +' · righe che lo nominano '+String(rEroe.length).padStart(3)+'/'+p.cro.length+' ('+pc(rEroe.length,p.cro.length)+')'
    +' · piu\' lungo silenzio '+maxG+"'"
    +' · gol '+gol
    +(sc.length?' · minuti scene ['+sc.join(',')+']':''));
}
console.log('  ---');
console.log('  scene per partita: '+scene.join(' / ')+'  → mediana '+med(scene)+' · spread '+(Math.max(...scene)-Math.min(...scene)));
console.log('  quota di righe sull\'eroe: '+quote.join(' / ')+'  → mediana '+med(quote));
console.log('  silenzio piu\' lungo dell\'eroe: mediana '+med(vuotiEroe)+"' · max "+Math.max(...vuotiEroe)+"'");
console.log('  BUGIA DA CERCARE: coinvolgimento COSTANTE. Se lo spread fra partite e\' 0-1,');
console.log('  non e\' la partita a renderlo protagonista: e\' il programma.');
if(Math.max(...scene)-Math.min(...scene)<=1)console.log('  ⚠️  SPREAD '+(Math.max(...scene)-Math.min(...scene))+': nessuna giornata anonima. P1.');

/* ===================== C. CAUSALITA' ED EVENTI ISOLATI ===================== */
console.log('\n================ C · CAUSALITA\' ED EVENTI ISOLATI ================');
console.log('  Isolato = (1) non afferma niente · (2) niente lo prepara nei 2\' prima · (3) niente ne discende nei 2\' dopo.');
let isoTot=0,cronTot=0;
for(const p of P){
  const cro=p.EV.filter(e=>e.ev==='chronicle');
  const pesa=e=>!!(e.ef||e.poss||e.sp||(e.ms&&1)||e.at);
  const iso=cro.filter(e=>{
    if(e.muta!==1)return false;
    const m=e.min|0;
    const vicini=cro.filter(x=>x!==e&&Math.abs((x.min|0)-m)<=2&&pesa(x));
    return vicini.length===0;
  });
  isoTot+=iso.length;cronTot+=cro.length;
  const mute=cro.filter(e=>e.muta===1).length;
  console.log('  '+p.nome.padEnd(8)+' righe di registro '+String(cro.length).padStart(3)
    +' · mute (non affermano niente) '+String(mute).padStart(3)+' ('+pc(mute,cro.length)+')'
    +' · ISOLATE '+String(iso.length).padStart(3)+' ('+pc(iso.length,cro.length)+')'
    +(iso.length?' · minuti ['+iso.slice(0,12).map(e=>e.min).join(',')+(iso.length>12?'…':'')+']':''));
}
console.log('  ---');
console.log('  EVENTI ISOLATI: '+isoTot+'/'+cronTot+' ('+pc(isoTot,cronTot)+') — potrebbero stare in qualsiasi minuto senza cambiare nulla.');

/* ====================== D. AZIONI EXTRA-EROE ====================== */
console.log('\n================ D · AZIONI EXTRA-EROE ================');
console.log('  «Devono avere una funzione narrativa: raccontare che la squadra soffre o domina.»');
let exTot=0,exCtx=0;
for(const p of P){
  const arm=(p.occ&&p.occ.armate)|0;
  /* un'occasione extra-eroe e' CONTESTUALIZZATA se lo stato del suo minuto la giustifica:
     la squadra sta soffrendo (tiri subiti > fatti) o dominando (tiri fatti > subiti)
     o il punteggio le chiede qualcosa (sotto, o pari nell'ultimo quarto). */
  const min=(p.occ&&p.occ.min)||[];
  let ctx=0,neutri=0;
  min.forEach(m=>{
    const s=p.stato[m|0]||p.stato[(m|0)-1]||null;if(!s){neutri++;return;}
    const dGol=(s.h|0)-(s.a|0);
    /* momentum e' l'inerzia della partita (segno = chi spinge), pressione.addosso quanti
       avversari stanno addosso al portatore, superiorita' lo squilibrio numerico. */
    const soffre=(s.mom|0)<0||dGol<0||(s.press|0)>=2, domina=(s.mom|0)>0&&dGol>=0, serve=(dGol<=0&&m>=67);
    if(soffre||domina||serve)ctx++;else neutri++;
  });
  exTot+=arm;exCtx+=ctx;
  console.log('  '+p.nome.padEnd(8)+' occasioni extra-eroe armate '+String(arm).padStart(2)
    +(min.length?' · con un minuto noto '+min.length+' → contestualizzate '+ctx+' · su stato neutro '+neutri:' · minuti non registrati'));
}
console.log('  ---');
console.log('  extra-eroe per partita: '+(exTot/P.length).toFixed(2)+(exTot?' · contestualizzate '+pc(exCtx,exTot):''));
if(!exTot)console.log('  ⚠️  ZERO occasioni extra-eroe: o il registro non le vede, o non ce ne sono. MISURA MANCATA, non un verde.');

/* ====================== E. TELECRONACA ====================== */
console.log('\n================ E · TELECRONACA ================');
console.log('  «Non deve inventare una partita diversa da quella simulata.»');
const distinte=[],ripetute=[],enf=[];
for(const p of P){
  const t=p.cro.map(c=>c.txt.replace(/\d+/g,'#').trim());
  const conta={};t.forEach(x=>{conta[x]=(conta[x]||0)+1;});
  const chiavi=Object.keys(conta).sort((a,b)=>conta[b]-conta[a]);
  const dst=chiavi.length,top=chiavi.length?conta[chiavi[0]]:0;
  const e=p.cro.filter(c=>ENFASI.test(c.txt)).length;
  const merita=p.EV.filter(x=>x.ev==='goal'||(x.ev==='esito'&&x.ok)).length;
  distinte.push(p.cro.length?+(dst/p.cro.length).toFixed(2):0);ripetute.push(top);enf.push(p.cro.length?+(e/p.cro.length).toFixed(2):0);
  console.log('  '+p.nome.padEnd(8)+' righe '+String(p.cro.length).padStart(3)
    +' · distinte '+String(dst).padStart(3)+' ('+pc(dst,p.cro.length)+')'
    +' · la piu\' ripetuta '+top+'×'
    +' · enfasi '+e+' righe ('+pc(e,p.cro.length)+') contro '+merita+' eventi che la meritano');
  if(chiavi.length)console.log('        piu\' ripetuta: «'+chiavi[0].slice(0,90)+'»');
}
console.log('  ---');
console.log('  voci distinte: mediana '+med(distinte)+' · la piu\' ripetuta: mediana '+med(ripetute)+'× · max '+Math.max(...ripetute)+'×');
console.log('  enfasi: mediana '+med(enf));
console.log('  BUGIA DA CERCARE: enfasi superiore alla sostanza.');

/* ====================== F. VARIETA' ====================== */
console.log('\n================ F · VARIETA\' ================');
for(const p of P){
  const cro=p.EV.filter(e=>e.ev==='chronicle');
  const perRk={};cro.forEach(e=>{const k=e.rk||'(nessuna)';perRk[k]=(perRk[k]||0)+1;});
  const ord=Object.keys(perRk).sort((a,b)=>perRk[b]-perRk[a]);
  const topQ=cro.length?perRk[ord[0]]/cro.length:0;
  console.log('  '+p.nome.padEnd(8)+' tipi '+ord.length+' · il piu\' frequente «'+ord[0]+'» '+perRk[ord[0]]+' ('+Math.round(100*topQ)+'% di tutto)');
  console.log('        '+ord.slice(0,6).map(k=>k+' '+perRk[k]).join(' · '));
}

/* ====================== SCORECARD ====================== */
console.log('\n================ SCORECARD — da compilare con questi numeri ================');
console.log('  docs/PLAYTEST-ATTACCANTE.md §3. Un voto senza il numero che lo sostiene e\' un\'opinione.');
console.log('  Le voci 1-2-11-12 (realismo, credibilita\' da attaccante, immersione, carriera) NON sono');
console.log('  misurabili da qui: le assegna la passata da player. Questa sonda copre 3,4,5,6,7,8.');
