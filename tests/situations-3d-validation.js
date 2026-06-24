#!/usr/bin/env node
/* ============================================================================
   CPM — SUITE DI VALIDAZIONE AUTOMATICA SITUATIONS (motore 3D)
   ----------------------------------------------------------------------------
   Esegue logicamente OGNI situation × azione del database e valida:
     • classificazione highlight (deriveHL reale)
     • traiettoria + fisica del pallone (formule d'arco REALI, eval dal sorgente)
     • sincronizzazione testo→variante→traiettoria→outcome
     • coerenza tattica (far/near post, cutback, one-on-one…)
     • regia (camera tiene palla/eroe in campo, sopra il terreno, non dentro l'azione)
     • completezza post-highlight (goal/save/post/wide/blocked)
     • realism score per sottosistema + complessivo
   Output: report markdown + json con classifica delle peggiori.

   LIMITE NOTO: questo ambiente non ha browser/WebGL. Screenshot reali, replay
   video e raycast camera-dentro-mesh a livello di pixel NON sono prodotti qui
   (richiedono una harness puppeteer+WebGL — vedi sezione "browser-only" nel report).
   Tutto il resto è validato analiticamente sulle formule reali del motore.
   ============================================================================ */
const fs=require('fs');
const HTML='/home/user/Carrier-manager-/CARRIER-MANAGER-AV.html';
const src=fs.readFileSync(HTML,'utf8');
const L=src.split('\n');

// ---------- util ----------
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function findLine(re,from=0){for(let i=from;i<L.length;i++)if(re.test(L[i]))return i;return -1;}
function sliceFn(startRe,endRe){const a=findLine(startRe);if(a<0)return null;for(let i=a;i<L.length;i++)if(endRe.test(L[i]))return L.slice(a,i+1).join('\n');return null;}

// ---------- 1. estrai codice REALE: S, A, SITUATIONS, deriveHL ----------
const sIdx=findLine(/^const S=\(text,zones,mz,sz,actions/);
const aIdx=findLine(/^const A=\(label,stat,bon,rew,fail,nrg\)/);
const sitStart=findLine(/^const SITUATIONS=\[/);
let sitEnd=-1;for(let i=sitStart;i<L.length;i++){if(/^\];/.test(L[i])){sitEnd=i;break;}}
const dhStart=findLine(/^function deriveHL\(sit,act\)\{/);
let dhEnd=-1;for(let i=dhStart;i<dhStart+120;i++){if(L[i].trim()==='return{type,pattern,variant};'){dhEnd=i+1;break;}}

let SITUATIONS,deriveHL;
try{
  const combo=
    L.slice(sIdx,aIdx+1).join('\n').replace(/const /g,'var ')+'\n'+
    L.slice(sitStart,sitEnd+1).join('\n').replace('const SITUATIONS','var SITUATIONS')+'\n'+
    L.slice(dhStart,dhEnd+1).join('\n')+'\n'+
    'globalThis.__S=SITUATIONS;globalThis.__D=deriveHL;';
  (0,eval)(combo);
  SITUATIONS=globalThis.__S;deriveHL=globalThis.__D;
}catch(e){console.error('FATAL extract S/A/SIT/deriveHL:',e.message);process.exit(1);}

// ---------- 2. estrai blocco REALE di lancio-arco (eval, zero paraphrasi) ----------
// dal blocco "const _rz=(Math.random()-.5);" fino alla chiusura del ramo cross.
const rzIdx=findLine(/const _rz=\(Math\.random\(\)-\.5\)/);
// includi tutti i rami: penalty, shot, header, cross E freekick (l'ultimo del blocco)
let arcEnd=-1;for(let i=rzIdx;i<rzIdx+50;i++){if(/else if\(t==="freekick"\)\{ballArcH/.test(L[i])){arcEnd=i;break;}}
if(arcEnd<0){console.error('FATAL: ramo freekick dell\'arco non trovato — il blocco potrebbe essere cambiato');process.exit(1);}
const arcBlock=L.slice(rzIdx,arcEnd+1).join('\n');
function computeArc(t,variant,playerY,rnd,playerX=50){
  // arcBlock usa Math.random(): lo shadowiamo passandolo come parametro a una IIFE
  // (niente "var Math" nello scope esterno → evita il trap di hoisting che lo rende undefined).
  const fn=`(function(t,P,AWAY_GOAL_X,RND){
    var ballArcH=0,ballArcDur=0,ballArcTgtX=0,ballArcTgtZ=0,ballArcT=0,ballArcActive=false;
    (function(Math){
      ${arcBlock}
    })(Object.assign(Object.create(globalThis.Math),{random:RND}));
    return {ballArcH,ballArcDur,ballArcTgtX,ballArcTgtZ};
  })`;
  return (0,eval)(fn)(t,{hlVariant:variant,playerY,playerX},46,rnd);
}

// ---------- 3. guardie di consistenza (il modello non può divergere in silenzio) ----------
const guards=[];
const guard=(name,ok)=>guards.push({name,ok});
guard('AWAY_GOAL_X=46 nel sorgente', /const AWAY_GOAL_X=46/.test(src));
guard('G2X=(gx-50)', /G2X=gx=>\(gx-50\)/.test(src));
guard('parabola y=0.65+sin(u*PI)*ballArcH', /ball\.position\.y=0\.65\+Math\.sin\(u\*Math\.PI\)\*ballArcH/.test(src));
guard('outcome: goal→in_net/in_net_high', /hlPostArcType=\(_hv==="shot_chip"\|\|_hv==="shot_volley"\)\?"in_net_high":"in_net"/.test(src));
guard('outcome: cross→cross_goal', /_ht==="cross"\)\{hlPostArcT=0;hlPostArcType="cross_goal"/.test(src));
guard('outcome: pass→assist_shot', /_ht==="pass"\)\{hlPostArcT=0;hlPostArcType="assist_shot"/.test(src));
guard('outcome fail: palo 20% (hit_post)', /_roll<0\.20\)\{[\s\S]*?hlPostArcType="hit_post"/.test(src));
guard('outcome fail: save/wide split 0.85', /_roll<0\.85\?"save":"wide"/.test(src));
guard('camera FAR_POST_CROSS side-tracking', /_pat==="FAR_POST_CROSS"\)\{cPx=clamp\(fX-6/.test(src));
guard('arc cross_far_post tgtZ=-_side*(11..)', /cross_far_post"\)\{ballArcH=4\.2;ballArcDur=0\.90;ballArcTgtX=AWAY_GOAL_X-9/.test(src));
guard('fix: dribble/build/tackle-gol → in_net', /\(_ht==="dribble"\|\|_ht==="build"\|\|_ht==="tackle"\)&&P\.hlReward==="goal"\)\{hlPostArcT=0;hlOutcomeVariant="goal";hlPostArcType="in_net"/.test(src));
guard('fix: hlReward passato come prop', /hlReward=\{chosenAct\?\.rew\|\|null\}/.test(src));
guard('fix: shot_curled palo lontano usa -_side', /shot_curled.*ballArcTgtZ=-_side\*/.test(src));
guard('fix: header_far_post usa -_side', /header_far_post.*ballArcTgtZ=-_side\*/.test(src));
guard('fix: near_post_cross clamp TgtX byline+speed', /_cp\+45/.test(src));
guard('fix: penalty_panenka arco alto', /penalty_panenka.*ballArcH=9\.0/.test(src));

// ---------- 4. modello outcome (puro: dipende solo da success,type,variant,roll) ----------
function outcomePostHL(success,type,variant,roll,reward){
  const isShot=type==='shot'||type==='penalty'||type==='freekick'||type==='header';
  if(success){
    if(isShot)return{post:(variant==='shot_chip'||variant==='shot_volley'||variant==='penalty_panenka')?'in_net_high':'in_net',outcome:'goal'};
    if(type==='cross')return{post:'cross_goal',outcome:'goal'};
    if(type==='pass')return{post:'assist_shot',outcome:'assist'};
    // dribbling/costruzione/pressing che valgono un gol → palla in rete; altrimenti pugno
    if((type==='dribble'||type==='build'||type==='tackle')&&reward==='goal')return{post:'in_net',outcome:'goal'};
    return{post:'hero_fist',outcome:'win_duel'};
  }
  if(isShot&&roll<0.20)return{post:'hit_post',outcome:'post'};
  if(isShot)return{post:'deflect',outcome:roll<0.85?'save':'wide'};
  return{post:'deflect',outcome:'blocked'};
}
// completezza post-HL: ogni outcome deve avere una catena di animazione gestita
const POSTHL_HANDLED={in_net:1,in_net_high:1,cross_goal:1,assist_shot:1,hero_fist:1,hit_post:1,deflect:1};
const OUTCOME_PHASES={ // passaggi visivi attesi → usati per lo score di sincronizzazione
  goal:['arrivo_palla','contatto','traiettoria_in_rete','rete_si_muove','esultanza'],
  post:['impatto_palo','rimbalzo','reazione'],
  save:['tuffo_portiere','contatto_palla','respinta','recupero'],
  wide:['conclusione','palla_esce'],
  blocked:['difensore','deviazione'],
  assist:['passaggio','corsa_compagno','conclusione'],
  win_duel:['contrasto','recupero_palla'],
};

// ---------- 5. mappa di campo (reale) ----------
const G2X=gx=>(gx-50), G2Z=gy=>(gy-50)*0.68;
const FIELD={xMin:-50,xMax:50,zMin:-34,zMax:34}; const AWAY_GOAL_X=46;
const zoneCenter=z=>z?{x:(z.x[0]+z.x[1])/2,y:(z.y[0]+z.y[1])/2}:{x:50,y:50};

// ---------- 6. simulazione traiettoria + validatori ----------
const ARC_TYPES=new Set(['shot','cross','header','penalty','freekick']);
function simulate(sit,act){
  const cls=deriveHL(sit,act); // {type,pattern,variant}
  const sz=sit.startZone||sit.zones&&null;
  const start=zoneCenter(sit.startZone);              // game coords del punto d'avvio (eroe+palla)
  const S={x:G2X(start.x),y:0.65,z:G2Z(start.y)};
  const issues=[];                                    // {cat,sev,msg}
  const add=(cat,sev,msg)=>issues.push({cat,sev,msg});

  // --- HERO presente e in campo ---
  if(start.x<2||start.x>99||start.y<1||start.y>99)add('hero','warn','posizione iniziale eroe ai limiti del campo');
  // l'eroe è sempre l'attore della situation → presenza garantita per costruzione

  // --- ARCO + FISICA PALLONE ---
  let arc=null,samples=[];
  if(ARC_TYPES.has(cls.type)){
    try{arc=computeArc(cls.type,cls.variant,start.y,()=>0.5,start.x);}catch(e){add('ball','fail','computeArc ha lanciato: '+e.message);}
    if(arc){
      const{ballArcH,ballArcDur,ballArcTgtX,ballArcTgtZ}=arc;
      const T={x:ballArcTgtX,z:ballArcTgtZ};
      // campiona la parabola reale
      const N=24,maxSpeed=[];
      let prev=null;
      for(let i=0;i<=N;i++){const u=i/N;
        const x=S.x+(T.x-S.x)*u, z=S.z+(T.z-S.z)*u, y=0.65+Math.sin(u*Math.PI)*ballArcH;
        const p={x,y,z,u};samples.push(p);
        if(prev){const d=Math.hypot(p.x-prev.x,p.y-prev.y,p.z-prev.z);maxSpeed.push(d/(ballArcDur/N));}
        prev=p;
      }
      // visibile: mai sotto il terreno, mai assurdamente alta
      if(samples.some(p=>p.y<0))add('ball','fail','pallone sotto il terreno (y<0)');
      if(ballArcH>14)add('ball','warn','altezza arco eccessiva ('+ballArcH.toFixed(1)+'m) — poco realistica');
      // in campo: target non oltre la porta+rete, non fuori dai lati
      if(ballArcTgtX>48.5)add('ball','fail','target X oltre la linea di porta/rete ('+ballArcTgtX.toFixed(1)+')');
      if(Math.abs(ballArcTgtZ)>FIELD.zMax)add('ball','fail','target Z fuori dal campo ('+ballArcTgtZ.toFixed(1)+')');
      // direzione: tiri/cross/colpi di testa progrediscono verso la porta avversaria (+x)
      if(ballArcTgtX<=S.x)add('ball','warn','la palla non avanza verso la porta avversaria (tgtX<=startX)');
      // velocità plausibile (m/s sul modello): 6–60
      const vmax=Math.max(...maxSpeed,0);
      if(vmax>75)add('ball','warn','velocità di picco non plausibile ('+vmax.toFixed(0)+' u/s)');
      if(ballArcDur<0.2)add('ball','warn','durata arco troppo breve ('+ballArcDur+'s) — rischio scatto/teletrasporto');
      // no teletrasporto: passo massimo tra campioni coerente
      const steps=samples.slice(1).map((p,i)=>Math.hypot(p.x-samples[i].x,p.y-samples[i].y,p.z-samples[i].z));
      const stepMax=Math.max(...steps),stepAvg=steps.reduce((a,b)=>a+b,0)/steps.length;
      if(stepMax>stepAvg*4)add('ball','warn','discontinuità di passo (possibile scatto)');
    }
  }

  // --- SINCRONIZZAZIONE testo/label → variante → traiettoria ---
  const lbl=(act.label||'').toLowerCase(), txt=(sit.text||'').toLowerCase();
  const mentionsFar=/secondo palo|palo lontano/.test(lbl)||/secondo palo|palo lontano/.test(txt);
  if(mentionsFar&&cls.type==='cross'&&cls.variant!=='cross_far_post')
    add('sync','fail','testo dice "secondo palo" ma il cross non è far_post (è '+cls.variant+')');
  if(mentionsFar&&cls.type==='header'&&cls.variant!=='header_far_post')
    add('sync','fail','testo dice "secondo palo" ma il colpo di testa non è far_post (è '+cls.variant+')');
  if(mentionsFar&&arc){ // la palla deve davvero arrivare sul lato lontano
    const side=(start.y<50)?-1:1; // lato di provenienza
    if(Math.sign(arc.ballArcTgtZ)===Math.sign(side)&&Math.abs(arc.ballArcTgtZ)>1)
      add('sync','warn','far post dichiarato ma target Z sullo stesso lato di partenza');
  }
  if(/rientr|a rientrare/.test(lbl)&&cls.type==='cross'&&cls.variant!=='cross_cutback')
    add('sync','warn','"a rientrare" ma variante non cutback ('+cls.variant+')');
  if(/pallonett|cucchiaio|scavin/.test(lbl)&&cls.type==='shot'&&cls.variant!=='shot_chip')
    add('sync','warn','"pallonetto/cucchiaio" ma variante non chip ('+cls.variant+')');
  if(/pallonett|cucchiaio/.test(lbl)&&cls.type==='penalty'&&cls.variant!=='penalty_panenka')
    add('sync','warn','rigore con cucchiaio/pallonetto ma variant non penalty_panenka');
  if(/pallonett|cucchiaio/.test(lbl)&&arc&&arc.ballArcH<6)
    add('sync','warn','pallonetto con arco basso ('+arc.ballArcH+'m) — poco riconoscibile');
  if(/rigore/.test(txt)&&cls.type!=='penalty')add('sync','fail','testo "rigore" ma type non penalty ('+cls.type+')');

  // --- OUTCOME + POST-HIGHLIGHT (entrambi i rami: successo=rew, fallimento=fail) ---
  const rew=act.rew, fail=act.fail;
  const successOut=outcomePostHL(true,cls.type,cls.variant,0.5,act.rew);
  const failOut=outcomePostHL(false,cls.type,cls.variant,0.10); // ramo palo
  const failOut2=outcomePostHL(false,cls.type,cls.variant,0.50);// ramo save/blocked
  [successOut,failOut,failOut2].forEach(o=>{
    if(!POSTHL_HANDLED[o.post])add('posthl','fail','post-HL "'+o.post+'" privo di handler animazione');
  });
  // coerenza outcome dichiarato (rew) vs catena post-HL
  // cross_goal e assist_shot sono percorsi di gol validi (cross diretto in rete / combinazione → tiro → gol)
  const _GOAL_POSTS=new Set(['in_net','in_net_high','cross_goal','assist_shot']);
  if(rew==='goal'&&!_GOAL_POSTS.has(successOut.post))add('posthl','warn','azione "goal" ma post-HL successo non è una rete ('+successOut.post+')');
  if(rew==='assist'&&successOut.post!=='assist_shot'&&cls.type==='pass')add('posthl','warn','azione "assist" ma post-HL non assist_shot');

  // --- REGIA (modello camera CINE-5, fase risultato bf→1: fuoco ≈ target palla) ---
  let cam=null;
  if(arc){
    const fX=arc.ballArcTgtX, fZ=arc.ballArcTgtZ;
    cam=camFor(cls,fX,fZ);
    if(cam){
      if(cam.cPy<0.5)add('camera','fail','camera sotto/again al terreno (cPy='+cam.cPy.toFixed(1)+')');
      const dBall=Math.hypot(cam.cPx-fX,cam.cPy-0.65,cam.cPz-fZ);
      if(dBall<5)add('camera','warn','camera troppo vicina alla palla (rischio dentro i modelli, d='+dBall.toFixed(1)+')');
      if(dBall>130)add('camera','warn','camera troppo lontana (palla poco leggibile, d='+dBall.toFixed(0)+')');
      const dLook=Math.hypot(cam.cLx-fX,cam.cLz-fZ);
      if(dLook>30)add('camera','warn','lookAt distante dalla palla ('+dLook.toFixed(0)+') — palla rischia fuori campo visivo');
    }
  }

  // --- SCORE per sottosistema (0-100) ---
  const pen=(cat)=>issues.filter(i=>i.cat===cat).reduce((s,i)=>s+(i.sev==='fail'?45:i.sev==='warn'?15:5),0);
  const sub={
    animazione:clamp(100-pen('hero'),0,100),
    fisica_palla:clamp(100-pen('ball'),0,100),
    sincronizzazione:clamp(100-pen('sync'),0,100),
    regia:clamp(100-pen('camera'),0,100),
    post_hl:clamp(100-pen('posthl'),0,100),
  };
  sub.realismo=Math.round((sub.animazione*0.15+sub.fisica_palla*0.30+sub.sincronizzazione*0.25+sub.regia*0.12+sub.post_hl*0.18));
  return {cls,arc,cam,issues,sub};
}

// modello camera (rispecchia il dispatch CINE-2/5/7 in fase risultato)
function camFor(cls,fX,fZ){
  const t=cls.type,pat=cls.pattern,v=cls.variant;
  let cPx=clamp(fX-20,-80,16),cPy=8.5-2.5,cPz=fZ*0.58, cLx=fX+12,cLy=2.2-0.5,cLz=fZ*0.82;
  if(t==='penalty'||t==='freekick'){cPx=clamp(fX-18,-96,-4);cPy=6.5;cPz=fZ*0.7;cLx=fX+24;cLy=1.4;cLz=fZ*0.5;}
  else if(t==='header'){if(v==='header_diving'){cPx=clamp(fX-16,-80,16);cPy=3.2;cLy=0.8;}else{cPy=Math.max(cPy,7);cLy=3.8;}}
  else if(t==='tackle'){cPx=clamp(fX-12,-80,18);cPy=4.0;cLy=1.2;}
  else if(t==='cross'){
    if(pat==='FAR_POST_CROSS'){cPx=clamp(fX-6,-66,22);cPy=7.5;cPz=fZ*1.25+(fZ>=0?14:-14);cLx=AWAY_GOAL_X-8;cLy=2.4;cLz=-fZ*0.4;}
    else if(pat==='CUTBACK'){cPx=clamp(fX-14,-74,14);cPy=4.2;cPz=fZ*0.9+(fZ>=0?6:-6);cLx=30;cLy=1.4;cLz=fZ*0.3;}
    else{cPx=clamp(fX-10,-72,18);cPy=5.0;cPz=fZ*1.1+(fZ>=0?8:-8);cLx=fX+18;cLy=2.0;cLz=fZ*0.55;}
  }
  else if(t==='shot'){if(v==='shot_chip'){cPy=Math.max(cPy,12);cLy=Math.max(cLy,4.5);}else if(v==='shot_one_on_one'){cPx=clamp(fX-14,-80,16);cPy=Math.min(cPy,5.5);cLy=1.8;}else if(v==='shot_volley'){cPy=Math.max(cPy,8.5);cLy=2.8;}}
  return{cPx,cPy,cPz,cLx,cLy,cLz};
}

// ---------- 7. esegui su tutto il catalogo ----------
const results=[];
SITUATIONS.forEach((sit,si)=>(sit.actions||[]).forEach((act,ai)=>{
  const r=simulate(sit,act);
  results.push({si,ai,sit:sit.text,act:act.label,...r});
}));

const totalCombos=results.length;
const allIssues=results.flatMap(r=>r.issues);
const byCat=c=>allIssues.filter(i=>i.cat===c);
const fails=results.filter(r=>r.issues.some(i=>i.sev==='fail'));
const warns=results.filter(r=>r.issues.some(i=>i.sev==='warn')&&!r.issues.some(i=>i.sev==='fail'));
const clean=results.filter(r=>r.issues.length===0);
const avg=k=>Math.round(results.reduce((s,r)=>s+r.sub[k],0)/results.length);
const worst=[...results].sort((a,b)=>a.sub.realismo-b.sub.realismo).slice(0,50);

// ---------- 8. report ----------
const pct=(n)=>((n/totalCombos)*100).toFixed(1)+'%';
let md=`# CPM — Report Validazione Automatica Situations (motore 3D)\n\n`;
md+=`_GAME_VERSION ${(src.match(/GAME_VERSION="([\d.]+)"/)||[])[1]||'?'}_\n\n`;
md+=`## Sommario\n`;
md+=`| Metrica | Valore |\n|---|---|\n`;
md+=`| Situations nel database | ${SITUATIONS.length} |\n`;
md+=`| Combinazioni situation×azione testate | ${totalCombos} |\n`;
md+=`| ✅ Pulite (0 problemi) | ${clean.length} (${pct(clean.length)}) |\n`;
md+=`| 🟡 Solo warning | ${warns.length} (${pct(warns.length)}) |\n`;
md+=`| 🔴 Con FAIL | ${fails.length} (${pct(fails.length)}) |\n\n`;
md+=`### Realism Score medio (0-100)\n`;
md+=`| Sottosistema | Score |\n|---|---|\n`;
['animazione','fisica_palla','sincronizzazione','regia','post_hl','realismo'].forEach(k=>md+=`| ${k} | ${avg(k)} |\n`);
md+=`\n## Anomalie per categoria\n`;
md+=`| Categoria | fail | warn |\n|---|---|---|\n`;
['ball','sync','camera','posthl','hero'].forEach(c=>{const ii=byCat(c);md+=`| ${c} | ${ii.filter(i=>i.sev==='fail').length} | ${ii.filter(i=>i.sev==='warn').length} |\n`;});

// guardie
md+=`\n## Guardie di consistenza modello↔sorgente\n`;
md+=guards.every(g=>g.ok)?`✅ Tutte le ${guards.length} guardie superate — il modello rispecchia il motore reale.\n`:`⚠️ ALCUNE GUARDIE FALLITE — il modello potrebbe essere disallineato dal motore:\n`;
guards.filter(g=>!g.ok).forEach(g=>md+=`- ❌ ${g.name}\n`);

// raccomandazioni azionabili (derivate dai pattern di anomalia)
md+=`\n## Raccomandazioni azionabili\n`;
const recs=[];
const goalNotNet=results.filter(r=>r.issues.some(i=>/non è una rete/.test(i.msg)));
if(goalNotNet.length)recs.push(`**${goalNotNet.length} azioni "goal" da dribbling/costruzione mostrano solo l'esultanza (fist), non la palla in rete.** L'outcome dispatch (hl_result) per \`type==="dribble"/"build"\` non conosce \`act.rew\`. Proposta: passare il reward all'esito così un dribbling-gol instradi un post-HL "in_net" (porta vuota) invece del solo pugno.`);
const chipLow=results.filter(r=>r.issues.some(i=>/pallonetto con arco basso/.test(i.msg)));
if(chipLow.length)recs.push(`**${chipLow.length} pallonetti** con arco < 6m: poco riconoscibili come "cucchiaio". Verificare che la label mappi a \`shot_chip\` (ballArcH=8.5).`);
const farSame=results.filter(r=>r.issues.some(i=>/far post dichiarato ma target Z sullo stesso lato/.test(i.msg)));
if(farSame.length)recs.push(`**${farSame.length} cross "secondo palo"** con target Z sullo stesso lato di partenza: rivedere il segno di \`_side\` per quelle situations.`);
if(!recs.length)recs.push('Nessuna raccomandazione critica — catalogo coerente.');
recs.forEach((r,i)=>md+=`${i+1}. ${r}\n`);

// top problemi raggruppati
md+=`\n## Problemi più frequenti\n`;
const msgCount={};allIssues.forEach(i=>{const k=`[${i.sev}] (${i.cat}) ${i.msg.replace(/\([^)]*\)/g,'(…)')}`;msgCount[k]=(msgCount[k]||0)+1;});
Object.entries(msgCount).sort((a,b)=>b[1]-a[1]).slice(0,20).forEach(([k,n])=>md+=`- **${n}×** ${k}\n`);

// classifica peggiori 50
md+=`\n## Classifica — 50 situations peggiori (per Realism Score)\n`;
md+=`| # | Realism | Situation | Azione | type/variant | Problemi |\n|---|---|---|---|---|---|\n`;
worst.forEach((r,i)=>{
  const probs=r.issues.map(x=>`${x.sev==='fail'?'🔴':x.sev==='warn'?'🟡':'⚪'}${x.msg}`).join('; ')||'—';
  md+=`| ${i+1} | ${r.sub.realismo} | ${r.sit.slice(0,30).replace(/\|/g,'/')} | ${r.act.slice(0,26).replace(/\|/g,'/')} | ${r.cls.type}/${r.cls.variant||'-'} | ${probs.slice(0,140)} |\n`;
});

// browser-only
md+=`\n## Non coperto qui (richiede harness browser+WebGL)\n`;
md+=`- Screenshot/replay reali dei frame\n- Raycast camera-dentro-mesh a livello di pixel\n- Clipping pallone↔giocatori per-frame (qui validato solo a livello di traiettoria/bounds)\n- "Ice skating" reale (velocità piedi vs traslazione) — qui approssimato da velocità di traslazione\n`;
md+=`\n_Per abilitarli: aggiungere puppeteer + esecuzione headless con SwiftShader e hook su \`sr.current\`/THREE meshes._\n`;

fs.writeFileSync('/home/user/Carrier-manager-/docs/SITUATIONS_VALIDATION_REPORT.md',md);
fs.writeFileSync('/home/user/Carrier-manager-/docs/situations_validation.json',JSON.stringify({totalCombos,clean:clean.length,warns:warns.length,fails:fails.length,scores:{animazione:avg('animazione'),fisica_palla:avg('fisica_palla'),sincronizzazione:avg('sincronizzazione'),regia:avg('regia'),post_hl:avg('post_hl'),realismo:avg('realismo')},guards,worst:worst.map(r=>({si:r.si,ai:r.ai,realismo:r.sub.realismo,sit:r.sit,act:r.act,cls:r.cls,issues:r.issues}))},null,2));

// console summary
console.log('=== CPM SITUATIONS VALIDATION ===');
console.log('situations:',SITUATIONS.length,' combos:',totalCombos);
console.log('clean:',clean.length,' warn-only:',warns.length,' FAIL:',fails.length);
console.log('scores:',{anim:avg('animazione'),ball:avg('fisica_palla'),sync:avg('sincronizzazione'),cam:avg('regia'),post:avg('post_hl'),REAL:avg('realismo')});
console.log('guards:',guards.every(g=>g.ok)?'ALL OK':'FAILED: '+guards.filter(g=>!g.ok).map(g=>g.name).join(', '));
console.log('report → docs/SITUATIONS_VALIDATION_REPORT.md');
if(guards.some(g=>!g.ok))process.exit(2);
