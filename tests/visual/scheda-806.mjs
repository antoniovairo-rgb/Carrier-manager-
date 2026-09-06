/* [7.803 misura] LA SCHEDA SI CHIUDE SEMPRE, E LA TELECRONACA TORNA A PARLARE.
   Misura appaiata ON / ROSSO (__CPM_NO806) sugli stessi semi. Quattro numeri:
     1. schede in sospeso contro timer SCATTATI — devono pareggiare;
     2. righe RIFIUTATE da `addCom` — devono crollare;
     3. righe a banner nel SECONDO tempo — devono risalire verso quelle del registro;
     4. il rapporto secondo/primo tempo, che nel rosso e' -88%. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Ba,Bb,Bc,Bd,Be,Bf').split(',');
const SEMI=NOMI.map((_,g)=>7700+g*613);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const OUT={};
for(const R of [{n:'ON   ',no:false},{n:'ROSSO',no:true}]){
  let pend=0,fire=0,ref=0,r1=0,r2=0,reg1=0,reg2=0;
  for(let g=0;g<NOMI.length;g++){
    const ctx=await b.newContext({viewport:{width:412,height:915}});
    const page=await ctx.newPage();await installCdnRoutes(page);
    /* ⚠️ IL BANCO CORRE DIECI VOLTE PIU' DEL REALE (tickMs 300: un minuto di gioco dura 3 s), e le
       schede arrivano ogni ~10 minuti di gioco = ~30 s di orologio vero, MENO dei 35 s del tempo di
       lettura: cosi' ogni scheda nuova scadeva prima che scadesse la precedente, e la misura contava
       come difetto del gioco cio' che era la velocita' del banco. Si accorcia il tempo di lettura
       nella STESSA proporzione (3,5 s invece di 35), cosi' il rapporto fra le due durate e' quello
       della partita vera. */
    await page.addInitScript((no)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];window.__CPM_SCMS681=3500;if(no)window.__CPM_NO806=1;},R.no);
    await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
    await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
    const reg=[];let min=0;
    for(let k=0;k<1200;k++){await sleep(600);
      const c=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();
        const e=((window.__CPM_EV&&window.__CPM_EV())||[]).filter(x=>x.ev==='chronicle');
        if(window.__CPM_EV_RESET)window.__CPM_EV_RESET();
        return {min:ms?(ms.min|0):0,e};});
      if(c.e&&c.e.length)reg.push(...c.e);min=c.min;
      if(min>=89)break;}
    const r=await page.evaluate(()=>({
      pend:window.__CPM_SC681_PEND|0,
      fire:(window.__CPM_SC806_FIRE|0)+(window.__CPM_SC681_FIRE|0),
      ref:window.__CPM_SC681_REF|0, cro:window.__CPM_CRO802||[]}));
    pend+=r.pend;fire+=r.fire;ref+=r.ref;
    r1+=r.cro.filter(c=>c.t<=45).length; r2+=r.cro.filter(c=>c.t>45).length;
    reg1+=reg.filter(x=>(x.min|0)<=45).length; reg2+=reg.filter(x=>(x.min|0)>45).length;
    console.log('  '+R.n+' '+NOMI[g].padEnd(3)+' schede '+r.pend+' · timer scattati '+r.fire
      +' · rifiutate '+String(r.ref).padStart(3)
      +' · righe a banner 1T '+String(r.cro.filter(c=>c.t<=45).length).padStart(3)
      +' / 2T '+String(r.cro.filter(c=>c.t>45).length).padStart(3));
    await ctx.close();
  }
  OUT[R.n.trim()]={pend,fire,ref,r1,r2,reg1,reg2};
}
await b.close();srv.close();
const A=OUT.ON,B=OUT.ROSSO;
const pc=(x,y)=>y?Math.round(100*(x-y)/y)+'%':'—';
console.log('\n=== LA SCHEDA SI CHIUDE, LA CRONACA PARLA? ('+NOMI.length+' partite per regime) ===');
console.log('                                   ON        ROSSO');
console.log('  schede messe in sospeso    '+String(A.pend).padStart(8)+String(B.pend).padStart(13));
console.log('  timer SCATTATI             '+String(A.fire).padStart(8)+String(B.fire).padStart(13)
  +(A.fire>=A.pend?'   ✅ tutte chiuse':'   ⚠️  '+(A.pend-A.fire)+' schede appese'));
console.log('  righe RIFIUTATE            '+String(A.ref).padStart(8)+String(B.ref).padStart(13));
console.log('  righe a banner  1T         '+String(A.r1).padStart(8)+String(B.r1).padStart(13));
console.log('  righe a banner  2T         '+String(A.r2).padStart(8)+String(B.r2).padStart(13));
console.log('  registro (scritte) 2T      '+String(A.reg2).padStart(8)+String(B.reg2).padStart(13));
console.log('');
console.log('  secondo tempo contro primo:  ON '+pc(A.r2,A.r1)+'   ·   ROSSO '+pc(B.r2,B.r1));
console.log('  quota di righe scritte che ARRIVA a banner nel 2T:  ON '
  +(A.reg2?Math.round(100*A.r2/A.reg2)+'%':'n/d')+'   ·   ROSSO '+(B.reg2?Math.round(100*B.r2/B.reg2)+'%':'n/d'));
