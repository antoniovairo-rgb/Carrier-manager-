/* [7.805 misura] IL PALLONE SPARISCE CON LA TELECRONACA TESTUALE, E TORNA QUANDO SERVE.
   Direttiva PO 07/09: «nascondi il pallone durante la telecronaca testuale».
   Tre numeri, e devono valere INSIEME:
     1. durante la telecronaca testuale (fase `playing`, nessuna azione saliente) il pallone NON si vede;
     2. durante un HIGHLIGHT il pallone si vede — altrimenti si e' rotta la scena dell'eroe;
     3. durante un'AZIONE SALIENTE il pallone si vede — quella e' un'azione mostrata.
   Misura appaiata ON / ROSSO (__CPM_NO814). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Fa,Fb,Fc').split(',');
const SEMI=NOMI.map((_,g)=>7000+g*911);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const OUT={};
for(const R of [{n:'ON   ',no:false},{n:'ROSSO',no:true}]){
  let testo=0,testoVis=0,hl=0,hlVis=0,sal=0,salVis=0;
  for(let g=0;g<NOMI.length;g++){
    const ctx=await b.newContext({viewport:{width:412,height:915}});
    const page=await ctx.newPage();await installCdnRoutes(page);
    await page.addInitScript((no)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;if(no)window.__CPM_NO814=1;},R.no);
    await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
    await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
    let min=0;
    for(let k=0;k<1600;k++){await sleep(250);
      const s=await page.evaluate(()=>{
        const ms=window.__CPM_MS&&window.__CPM_MS();
        /* ⚠️ __CPM_PROBE restituisce `ball` come OGGETTO ({onScreen,ndc,world}): leggerlo come
           booleano dava SEMPRE vero, in tutti e due i regimi, e faceva sembrare che il rimedio non
           funzionasse mentre girava 404 fotogrammi su 404. Il testimone della VISIBILITA' e'
           __CPM_VIS665, che espone `ball:!!(ball&&ball.visible)`. Ottavo strumento sbagliato della
           sessione — e il secondo che nasconde un rimedio che funziona. */
        const vs=window.__CPM_VIS665&&window.__CPM_VIS665();
        return {min:ms?(ms.min|0):0, ball:vs?!!vs.ball:null, fase:(vs&&vs.fase)||((window.__CPM_PHASE&&window.__CPM_PHASE())||'?'),
                sal:!!(vs&&vs.saliente)};});
      if(!s||s.ball==null)continue;min=s.min;
      if(/^hl/.test(s.fase)){hl++;if(s.ball)hlVis++;}
      else if(s.sal){sal++;if(s.ball)salVis++;}
      else if(s.fase==='playing'){testo++;if(s.ball)testoVis++;}
      if(min>=89)break;}
    await ctx.close();
  }
  OUT[R.n.trim()]={testo,testoVis,hl,hlVis,sal,salVis};
  console.log('  '+R.n+' telecronaca testuale '+testoVis+'/'+testo+' col pallone visibile · highlight '+hlVis+'/'+hl+' · saliente '+salVis+'/'+sal);
}
await b.close();srv.close();
const A=OUT.ON,B=OUT.ROSSO;
const pc=(x,y)=>y?Math.round(100*x/y)+'%':'n/d';
console.log('\n=== IL PALLONE SI VEDE SOLO DOVE IL GIOCO LO RACCONTA? ===');
console.log('                                        ON          ROSSO');
console.log('  telecronaca testuale (deve sparire)  '+String(pc(A.testoVis,A.testo)).padStart(6)+String(pc(B.testoVis,B.testo)).padStart(14));
console.log('  highlight (deve vedersi)             '+String(pc(A.hlVis,A.hl)).padStart(6)+String(pc(B.hlVis,B.hl)).padStart(14));
console.log('  azione saliente (deve vedersi)       '+String(pc(A.salVis,A.sal)).padStart(6)+String(pc(B.salVis,B.sal)).padStart(14));
console.log('');
const ok=(A.testo>0&&A.testoVis===0)&&(A.hl===0||A.hlVis===A.hl);
console.log(ok?'  ✅ il pallone sparisce col testo e resta dove il gioco lo mostra.'
  :'  ⚠️  '+(A.testoVis?A.testoVis+' fotogrammi di telecronaca col pallone ancora visibile':'')
    +(A.hl&&A.hlVis<A.hl?'  ·  '+(A.hl-A.hlVis)+' fotogrammi di highlight SENZA pallone: rotta la scena dell\'eroe':''));
