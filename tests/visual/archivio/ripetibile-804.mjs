/* [banco] LA STESSA PARTITA, GIOCATA PIU' VOLTE, E' LA STESSA PARTITA?
   Il confronto appaiato del regista (7.802) ha dato due risultati diversi nel regime ROSSO —
   stesso codice, stessi semi, stessi nomi: 12 momenti contro 11. Se il rosso non e' identico a
   se stesso, ogni misura fine e' rumore e ogni revoca e' una scommessa.
   Qui si gioca N volte LA STESSA partita e si conta quanto cambia: punteggio, momenti dell'eroe,
   righe di telecronaca, gol. Nessun rimedio in mezzo: solo il banco che si guarda allo specchio. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOME=process.env.CPM_NOME||'Conti';
const SEME=+(process.env.CPM_SEME||8200);
const GIRI=+(process.env.CPM_GIRI||4);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const R=[];
for(let g=0;g<GIRI;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];});
  await openMatch(page,port,{skipLoadAll:true,name:NOME});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEME);
  let min=0;
  for(let k=0;k<900;k++){await sleep(700);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const r=await page.evaluate(()=>{
    const ms=window.__CPM_MS&&window.__CPM_MS();
    const ev=(window.__CPM_EV&&window.__CPM_EV())||[];
    const hl=(window.__CPM_HLTIMES&&window.__CPM_HLTIMES())||[];
    const cro=window.__CPM_CRO802||[];
    return {h:(ms&&ms.score&&ms.score.h)|0,a:(ms&&ms.score&&ms.score.a)|0,
            tacche:hl.slice(),esiti:ev.filter(e=>e.ev==='esito').map(e=>e.min|0),
            righe:cro.length,primaRiga:(cro[0]&&cro[0].txt)||'',minRighe:cro.map(c=>c.t)};
  });
  R.push(r);
  console.log('  giro '+(g+1)+': '+r.h+'-'+r.a
    +' · tacche ['+r.tacche.join(',')+']'
    +' · scene ['+r.esiti.join(',')+']'
    +' · righe '+r.righe);
  await ctx.close();
}
await b.close();srv.close();
const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
const base=R[0];
let ugPunt=0,ugTac=0,ugSce=0,ugRig=0;
for(let i=1;i<R.length;i++){
  if(R[i].h===base.h&&R[i].a===base.a)ugPunt++;
  if(eq(R[i].tacche,base.tacche))ugTac++;
  if(eq(R[i].esiti,base.esiti))ugSce++;
  if(R[i].righe===base.righe)ugRig++;
}
const n=R.length-1;
console.log('\n=== LA STESSA PARTITA, '+R.length+' VOLTE (nome '+NOME+', seme '+SEME+') ===');
console.log('  punteggio identico al primo giro     '+ugPunt+'/'+n);
console.log('  calendario (tacche) identico         '+ugTac+'/'+n+'   ← e\' calcolato dal seme: DEVE essere 100%');
console.log('  minuti delle scene identici          '+ugSce+'/'+n);
console.log('  numero di righe identico             '+ugRig+'/'+n);
const righe=R.map(x=>x.righe);
console.log('  righe per giro: ['+righe.join(',')+']  spread '+(Math.max(...righe)-Math.min(...righe)));
const verdetto=(ugTac===n&&ugPunt===n&&ugSce===n&&ugRig===n);
console.log('');
console.log(verdetto?'  ✅ IL BANCO E\' RIPETIBILE — la stessa partita e\' la stessa partita.'
  :'  ⚠️  IL BANCO NON E\' RIPETIBILE. Ogni misura fine su poche partite e\' rumore, e va rifatta con piu\' campione o con un motore a passo fisso.');
