/* [7.1.2] AUDIT MASSIVO situations ↔ rappresentazione 3D — cerca le incongruenze della classe «ciò che la
   situation DICHIARA (tipo/reward) ≠ ciò che il post-arco 3D RAPPRESENTA». Il gate valida gli invarianti CINE
   (testa⟹aerea) ma è cieco su questa classe (post-arco fuori dall'arcBlock). Per ogni situation × ogni azione:
   deriveHL(type,variant) · deriveIntent · hlBallState · rew(success) · fail → applica le regole di congruenza. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const browser=await launchBrowser();const page=await browser.newPage();
await installCdnRoutes(page);await page.addInitScript(()=>{window.__CPM_GLB=false;});
await openMatch(page,port);await sleep(300);

const res=await page.evaluate(()=>{
  const SITS=window.__CPM_SITS,dHL=window.deriveHL,dI=window.deriveIntent,bs=window.hlBallState;
  if(!SITS||!dHL)return{err:'hook mancanti'};
  const rows=[];
  SITS.forEach((sit,gi)=>{
    const intent=(()=>{try{return dI(sit);}catch(e){return '?';}})();
    const ball=(()=>{try{return bs(sit);}catch(e){return '?';}})();
    (sit.actions||[]).forEach((act,ai)=>{
      let hl={};try{hl=dHL(sit,act)||{};}catch(e){hl={err:e.message};}
      rows.push({gi,ai,text:(sit.text||'').slice(0,42),label:(act.label||'').slice(0,30),
        type:hl.type||null,variant:hl.variant||null,intent,ball,rew:act.rew||null,fail:act.fail||null,
        zones:(sit.zones||[]).join('/')});
    });
  });
  return{rows,nSit:SITS.length};
});
await browser.close();srv.close();
if(res.err){console.error('❌ '+res.err);process.exit(2);}

// ── REGOLE DI CONGRUENZA reward ↔ rappresentazione 3D (post-arco, ThreeMatchView) ──
//   conclusioni-in-rete: shot/header/penalty/freekick → in_net (l'EROE segna)
//   pass → assist_recv→assist_shot (COMPAGNO segna, tu assisti)
//   cross → cross_goal (compagno incorna) · chance → deflect
//   build/dribble/tackle + goal → in_net · + assist → assist_recv (7.1.1) · else → fist
const CONCL=new Set(['shot','header','penalty','freekick']);
const flags=[];
for(const r of res.rows){
  const t=r.type,rew=r.rew;
  // (A) azione-CONCLUSIONE (shot/header/penalty/freekick) con reward ASSIST → il 3D mette la palla IN RETE
  //     (l'eroe "segna") ma l'esito è un ASSIST (dovrebbe segnare il COMPAGNO) → incongruenza.
  if(CONCL.has(t)&&rew==='assist')flags.push({...r,cls:'A conclusione→in_net ma reward ASSIST'});
  // (B) azione PASS con reward GOAL → il 3D mostra il COMPAGNO che finalizza (assist_shot) ma il reward è GOL
  //     dell'eroe → dovrebbe entrare l'eroe, non il compagno.
  if(t==='pass'&&rew==='goal')flags.push({...r,cls:'B pass ma reward GOAL (eroe)'});
  // (C) azione CROSS con reward GOAL diretto ma variant di rimessa/scarico? (cross→gol diretto è raro ma legittimo:
  //     stacco dell'eroe). Segnalo solo se cross+goal per revisione manuale.
  if(t==='cross'&&rew==='goal')flags.push({...r,cls:'C cross reward GOAL (verifica: stacco eroe diretto?)'});
  // (D) build/dribble/tackle con reward GOAL ma zona propria/difesa (x basso) → gol da centrocampo/difesa (assurdo)
  if(['build','dribble','tackle'].includes(t)&&rew==='goal'&&/propria|difesa|centro/.test(r.zones))flags.push({...r,cls:'D build/dribble→GOAL da propria metà/difesa'});
  // (E) hlBallState aerial ma type NON aereo con reward gol (il gate copre header⟹aerial; qui incrocio inverso)
  //     — informativo.
}
// dedup per classe+gi+ai
console.log(`AUDIT — ${res.nSit} situations · ${res.rows.length} coppie (situation×azione) classificate\n`);
// distribuzione type×reward
const dist={};
for(const r of res.rows){const k=(r.type||'?')+' → '+(r.rew||'?');dist[k]=(dist[k]||0)+1;}
console.log('Distribuzione type → reward:');
Object.entries(dist).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log('  '+k.padEnd(28)+v));
console.log('\n── INCONGRUENZE CANDIDATE ('+flags.length+') ──');
const byCls={};for(const f of flags){(byCls[f.cls]=byCls[f.cls]||[]).push(f);}
for(const [cls,arr] of Object.entries(byCls)){
  console.log(`\n[${cls}] ×${arr.length}`);
  arr.slice(0,12).forEach(f=>console.log(`   gi${f.gi}.${f.ai} «${f.text}» — «${f.label}» (type=${f.type} rew=${f.rew} zone=${f.zones})`));
  if(arr.length>12)console.log(`   …e altre ${arr.length-12}`);
}
process.exit(0);
