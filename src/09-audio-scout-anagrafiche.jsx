/* ========================================================================
 * KORWARD ELITE — frammento n° 09  (dei 20, numerati da 00 a 19)
 * src/09-audio-scout-anagrafiche.jsx
 *
 * AUDIO · SCOUTING · ANAGRAFICHE · CALENDARIO
 *
 * Il comparto audio completo (AudioMgr: musica, sfx, ambiente, impostazioni, cache,
 * dispatcher — sorgenti procedurali, zero asset binari), i report di scouting, i
 * serbatoi di nomi e cognomi per nazionalità, i marchi/nomi da evitare per copyright e
 * la costruzione del calendario e delle classifiche.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 6976-8432   ·   1457 righe di 41427
 * La prima riga dopo questa intestazione è la riga 6976 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 6951 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
/* ============================================================================
   COMPARTO AUDIO — AudioManager centralizzato (7.62.0)
   ---------------------------------------------------------------------------
   Web Audio API, sorgenti PROCEDURALI (sintetizzate): zero asset binari →
   offline/PWA/Capacitor-safe, 0 peso store, 0 rischio copyright (come stadio/folla).
   REGOLA: nessun componente suona direttamente — tutto passa da AudioMgr.
   Sotto-sistemi: Music · Sfx · Ambient(folla) · Settings · Cache/Preload · Dispatcher.
   Catalogo ESTENDIBILE: ogni voce {synth} può diventare {url:'assets/audio/…'} senza
   toccare il codice (basta registrare l'URL e associarla all'evento) → asset reali
   sostituibili in futuro senza modifiche strutturali.
   GATE-SAFE: no-op silenzioso sotto _CPM_TEST/_SIT_TEST (headless, determinismo); tutto
   in try/catch; AudioContext creato/resumed SOLO al primo gesto utente (autoplay policy).
   ============================================================================ */
const AudioMgr=(function(){
  const SILENT=()=>((typeof _CPM_TEST!=='undefined'&&_CPM_TEST)||(typeof _SIT_TEST!=='undefined'&&_SIT_TEST)||(typeof window!=='undefined'&&!!window.__CPM_REVIEW));/* [7.243.0 direttiva PO «Elimina audio ed effetti sonori dal wizard!»] FUNZIONE, non costante: il flag __CPM_REVIEW nasce quando si ENTRA in revisione (non al boot) → va letto a ogni chiamata; copre musica, sfx, folla, fischietto e campioni */
  const LSK='cpm-audio';
  const CATS=['music','match','sfx','crowd','referee'];// bus reali; tel/vibr = predisposti (nessun bus)
  const DEF={master:0.85,
    vol:{music:0.3,match:0.85,sfx:0.75,crowd:0.85,referee:0.7},/* [7.64.0] musica menu più bassa di default (era troppo presente) */
    on:{music:true,match:true,sfx:true,crowd:true,referee:true,tel:false,vibr:false},
    mute:false};
  let cfg;
  try{const j=JSON.parse((typeof safeLS!=='undefined'?safeLS.get(LSK):null)||'null');
    cfg=j?{...DEF,...j,vol:{...DEF.vol,...(j.vol||{})},on:{...DEF.on,...(j.on||{})}}:{...DEF};}catch(_e){cfg={...DEF};}
  cfg.master=1;// [7.97.0 collaudo PO «il volume generale è già gestito dal dispositivo, è ridondante»] slider master RIMOSSO: il master resta SEMPRE a pieno (le voci per-categoria sono il controllo, il volume complessivo lo dà il device). Ripara anche i save con master basso.
  const persist=()=>{try{if(typeof safeLS!=='undefined')safeLS.set(LSK,JSON.stringify(cfg));}catch(_e){}};

  let ctx=null,master=null,bus={},ready=false,unlocked=false,noiseBuf=null;
  let inMatch=false,_pendingScene=null,_curPhase=null;
  // [7.70.0] DROP-IN CAMPIONI REALI: mappa evento→URL. Se un file esiste in assets/audio/, viene DECODIFICATO e sostituisce
  //   il synth (crowdRoar lo preferisce). Registrare qui l'URL è l'UNICO passo per usare un campione royalty-free reale.
  // [7.71.1] PRE-REGISTRATO e attivo-al-drop: appena un file `goal-roar.(ogg|mp3|wav)` compare in assets/audio/sfx/crowd/
  //   il boato del gol suona il campione REALE (crowdRoar lo preferisce). Finché il file NON c'è, il fetch fallisce e si
  //   ricade sul synth (comportamento attuale). Nessun altro passo di codice: basta caricare il file nel repo.
  // [7.72.1] campioni REALI forniti dal PO (Freesound/Mixkit) — priorità sui fallback generati:
  //   crowd.roar = boato di gioia allo stadio (Mixkit) · crowd.bed = brusio di folla da calcio (Freesound).
  const URL_SFX={
    'crowd.roar':['assets/audio/sfx/crowd/mixkit-stadium-joy-shouting-crowd-3022.wav','assets/audio/sfx/crowd/goal-roar.ogg','assets/audio/sfx/crowd/goal-roar.mp3','assets/audio/sfx/crowd/goal-roar.wav'],
    'crowd.bed':['assets/audio/sfx/crowd/freesound_community-football-crowd-3-69245.mp3']
  };
  const _urlBufs={};let _samplesTried=false;
  function _tryFetchDecode(urls,i,onOk){
    if(!ctx||i>=urls.length)return;
    fetch(urls[i]).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(ab=>ctx.decodeAudioData(ab)).then(buf=>onOk(buf)).catch(()=>_tryFetchDecode(urls,i+1,onOk));
  }
  function loadSamples(){
    if(_samplesTried||SILENT()||!ready)return;_samplesTried=true;
    try{Object.keys(URL_SFX).forEach(k=>{const v=URL_SFX[k];_tryFetchDecode(Array.isArray(v)?v:[v],0,buf=>{_urlBufs[k]=buf;if(k==='crowd.bed'&&inMatch&&bed&&!bed.real)_swapBedToReal();});});}catch(_e){}
  }
  function playSample(key,peak,cat,dur){
    if(!ready||!_urlBufs[key])return false;
    try{const s=ctx.createBufferSource();s.buffer=_urlBufs[key];const g=ctx.createGain();const pk=peak==null?0.85:peak;g.gain.value=pk;
      s.connect(g);g.connect(dest(cat||'crowd'));
      const bd=_urlBufs[key].duration;
      if(dur&&dur>0.25&&dur<bd){const t=now();g.gain.setValueAtTime(pk,t+dur-0.5);g.gain.linearRampToValueAtTime(0.0001,t+dur);s.start(t);s.stop(t+dur+0.05);}/* [7.72.1] campione lungo → suona solo i primi `dur`s con fade (il boato Mixkit dura 15s) */
      else s.start();
      s.onended=()=>{try{s.disconnect();g.disconnect();}catch(_e){}};return true;}catch(_e){return false;}
  }
  const _last={};                 // anti-ripetizione varianti
  let _played=0;                  // debug: sfx totali suonati
  const now=()=>ctx?ctx.currentTime:0;

  // ---- INIT (lazy, al primo gesto) --------------------------------------
  function mkNoise(sec){
    const len=Math.floor(ctx.sampleRate*sec),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);
    let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=last*3.0;}// rumore brownish
    return b;
  }
  function ensureCtx(){
    if(ready||SILENT())return ready;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
      ctx=new AC();
      master=ctx.createGain();master.gain.value=cfg.mute?0:cfg.master;master.connect(ctx.destination);
      CATS.forEach(c=>{const g=ctx.createGain();g.gain.value=cfg.on[c]?cfg.vol[c]:0;g.connect(master);bus[c]=g;});
      noiseBuf=mkNoise(2.0);
      ready=true;
    }catch(_e){ready=false;}
    return ready;
  }
  function applyBus(){
    if(!ready)return;
    try{master.gain.setTargetAtTime(cfg.mute?0:cfg.master,now(),0.05);
      CATS.forEach(c=>bus[c].gain.setTargetAtTime(cfg.on[c]?cfg.vol[c]:0,now(),0.06));}catch(_e){}
  }
  const dest=c=>bus[c]||master;

  // ---- PRIMITIVE SINTESI -------------------------------------------------
  function osc(c,{type='sine',f0=440,f1=null,dur=0.2,peak=0.5,a=0.005,pan=0}={}){
    if(!ready)return;
    try{
      const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,now());
      if(f1!=null)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),now()+dur);
      const g=ctx.createGain();g.gain.setValueAtTime(0.0001,now());
      g.gain.exponentialRampToValueAtTime(peak,now()+a);
      g.gain.exponentialRampToValueAtTime(0.0001,now()+dur);
      let node=g;
      if(pan&&ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;g.connect(p);node=p;}
      o.connect(g);node.connect(dest(c));o.start(now());o.stop(now()+dur+0.03);
      o.onended=()=>{try{o.disconnect();g.disconnect();}catch(_e){}};
    }catch(_e){}
  }
  function noise(c,{dur=0.2,peak=0.5,a=0.004,type='bandpass',f=1200,q=1,pan=0}={}){
    if(!ready)return;
    try{
      const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;
      const flt=ctx.createBiquadFilter();flt.type=type;flt.frequency.value=f;flt.Q.value=q;
      const g=ctx.createGain();g.gain.setValueAtTime(0.0001,now());
      g.gain.exponentialRampToValueAtTime(peak,now()+a);
      g.gain.exponentialRampToValueAtTime(0.0001,now()+dur);
      let node=g;
      if(pan&&ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;g.connect(p);node=p;}
      s.connect(flt);flt.connect(g);node.connect(dest(c));s.start(now());s.stop(now()+dur+0.03);
      s.onended=()=>{try{s.disconnect();flt.disconnect();g.disconnect();}catch(_e){}};
    }catch(_e){}
  }
  const pickVar=(k,n)=>{let i=Math.floor(Math.random()*n);if(n>1&&i===_last[k])i=(i+1)%n;_last[k]=i;return i;};
  const NOTE={C:523.25,D:587.33,E:659.25,F:698.46,G:783.99,A:880,B:987.77,C2:1046.5,D2:1174.7,E2:1318.5,F2:1396.9,G2:1568};
  function arp(names,c,step,peak){if(!ready)return;names.forEach((n,i)=>setTimeout(()=>osc(c,{type:'triangle',f0:NOTE[n]||440,dur:0.28,peak:peak||0.16,a:0.005}),i*step*1000));}
  function fanfare(big){
    if(!ready)return;
    const seq=[['C',0],['E',0.11],['G',0.22],['C2',0.33],['G',0.46],['C2',0.58]];
    seq.forEach(([n,t])=>setTimeout(()=>{osc('sfx',{type:'sawtooth',f0:NOTE[n],dur:0.55,peak:big?0.2:0.16,a:0.01});osc('sfx',{type:'triangle',f0:NOTE[n]/2,dur:0.55,peak:0.1});},t*1000));
    if(big)crowdApplause(2.2,0.5);
  }
  // fischietto arbitro: bandpass noise + FM warble (kind 1=corto,2=doppio,3=lungo finale)
  function refWhistle(kind){
    if(!ready)return;
    const blow=(t0,dur)=>{try{
      const base=2100,o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(base,now()+t0);
      const lfo=ctx.createOscillator();lfo.type='sine';lfo.frequency.value=17;const lg=ctx.createGain();lg.gain.value=55;lfo.connect(lg);lg.connect(o.frequency);
      const n=ctx.createBufferSource();n.buffer=noiseBuf;n.loop=true;const nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=base;nf.Q.value=9;
      const g=ctx.createGain();g.gain.setValueAtTime(0.0001,now()+t0);g.gain.exponentialRampToValueAtTime(0.32,now()+t0+0.02);
      g.gain.setValueAtTime(0.32,now()+t0+Math.max(0.03,dur-0.05));g.gain.exponentialRampToValueAtTime(0.0001,now()+t0+dur);
      o.connect(g);n.connect(nf);nf.connect(g);g.connect(dest('referee'));
      o.start(now()+t0);o.stop(now()+t0+dur+0.03);lfo.start(now()+t0);lfo.stop(now()+t0+dur+0.03);n.start(now()+t0);n.stop(now()+t0+dur+0.03);
      o.onended=()=>{try{o.disconnect();g.disconnect();n.disconnect();nf.disconnect();lfo.disconnect();lg.disconnect();}catch(_e){}};
    }catch(_e){}};
    if(kind===2){blow(0,0.15);blow(0.2,0.15);}
    else if(kind===3){blow(0,0.5);blow(0.55,0.5);blow(1.12,0.75);}
    else blow(0,0.22);
  }

  // ---- FOLLA (letto continuo + reazioni) --------------------------------
  let bed=null,_matchHushed=false;/* [7.104.0] a partita finita (schermata GIORNALE) il letto-folla resta SPENTO anche se l'utente tocca lo schermo (unlock non lo riavvia) */
  const _bedGain=t=>1.6+t*2.4;// [7.72.1] il brusio reale (Freesound) è registrato QUIETO (peak .13) → boost; peak out resta <0.6 (no clip)
  function _startRealBed(base){// letto = registrazione REALE di folla in loop (Freesound), fornita dal PO
    const src=ctx.createBufferSource();src.buffer=_urlBufs['crowd.bed'];src.loop=true;
    const g=ctx.createGain();g.gain.value=0.0001;
    src.connect(g);g.connect(dest('crowd'));src.start();
    bed={src,lp:null,g,level:base||0.28,real:true};
    g.gain.setTargetAtTime(_bedGain(base||0.28),now(),1.2);
  }
  function _swapBedToReal(){// il file del letto arriva DOPO l'avvio partita → crossfade synth→reale
    try{const old=bed;bed=null;_startRealBed(old?old.level:0.28);
      if(old){old.g.gain.setTargetAtTime(0.0001,now(),0.8);setTimeout(()=>{try{old.src.stop();old.src.disconnect();old.g.disconnect();if(old.lp)old.lp.disconnect();}catch(_e){}},1600);}
    }catch(_e){}
  }
  function crowdStart(base){
    if(!ready||bed)return;
    _matchHushed=false;
    try{
      if(_urlBufs['crowd.bed']){_startRealBed(base);return;}
      // fallback SYNTH (finché il file reale non è caricato/assente): rumore filtrato
      const src=ctx.createBufferSource();src.buffer=noiseBuf;src.loop=true;
      const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=120;
      const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=760;lp.Q.value=0.3;
      const g=ctx.createGain();g.gain.value=0.0001;
      src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(dest('crowd'));src.start();
      bed={src,lp,g,level:base||0.28,real:false};
      g.gain.setTargetAtTime(0.10+(base||0.28)*0.4,now(),1.0);
    }catch(_e){}
  }
  function crowdLevel(v){
    if(!bed)return;try{const t=Math.max(0.03,Math.min(1,v));bed.level=t;
      if(bed.real){bed.g.gain.setTargetAtTime(_bedGain(t),now(),0.5);}
      else{bed.g.gain.setTargetAtTime(0.09+t*0.45,now(),0.5);if(bed.lp)bed.lp.frequency.setTargetAtTime(560+t*1700,now(),0.6);}}catch(_e){}
  }
  // [7.64.0 collaudo PO «il gol sembra la musichetta di wonder woman»] la vecchia crowdSwell usava un BANDPASS a
  //   frequenza fissa mid-high → rumore filtrato tonale = "whoosh" ansiogeno/magico. Ora la reazione folla è
  //   BROADBAND (highpass+lowpass larghi, nessuna colorazione tonale) con modulazione d'ampiezza «a voci».
  function crowdSwell(dur,peak,bright){
    if(!ready)return;try{
      const src=ctx.createBufferSource();src.buffer=noiseBuf;src.loop=true;
      const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=180;
      const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=bright||1400;lp.Q.value=0.4;
      const g=ctx.createGain();g.gain.setValueAtTime(0.0001,now());
      g.gain.linearRampToValueAtTime(peak||0.5,now()+dur*0.3);g.gain.exponentialRampToValueAtTime(0.0001,now()+dur);
      src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(dest('crowd'));src.start();src.stop(now()+dur+0.06);
      src.onended=()=>{try{src.disconnect();hp.disconnect();lp.disconnect();g.disconnect();}catch(_e){}};
    }catch(_e){}
  }
  function crowdApplause(dur,peak){
    if(!ready)return;try{
      const src=ctx.createBufferSource();src.buffer=noiseBuf;src.loop=true;
      const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=1600;
      const g=ctx.createGain();g.gain.setValueAtTime(0.0001,now());
      g.gain.linearRampToValueAtTime(peak||0.4,now()+0.12);g.gain.setTargetAtTime(0.0001,now()+dur*0.5,dur*0.35);
      // flicker "battito di mani" via LFO (triangle morbido) — rate variato 9-12Hz e profondità ridotta: naturale, non "motore"
      const lfo=ctx.createOscillator();lfo.type='triangle';lfo.frequency.value=9+Math.random()*3;const lg=ctx.createGain();lg.gain.value=(peak||0.4)*0.38;lfo.connect(lg);lg.connect(g.gain);
      src.connect(hp);hp.connect(g);g.connect(dest('crowd'));src.start();src.stop(now()+dur+0.1);lfo.start();lfo.stop(now()+dur+0.1);
      src.onended=()=>{try{src.disconnect();hp.disconnect();g.disconnect();lfo.disconnect();lg.disconnect();}catch(_e){}};
    }catch(_e){}
  }
  // [7.70.0 collaudo PO «gli effetti del gol non sono all'altezza, trova ALTRE STRADE» — 4ª segnalazione] CAMBIO DI TECNICA.
  //   Le 3 versioni precedenti erano rumore filtrato: gli mancava il CARATTERE UMANO (un boato è migliaia di GOLE che fanno
  //   «AAAH» → ha FORMANTI VOCALI). Il bandpass singolo suonava tonale («wonder woman»); il rumore puro suonava sintetico.
  //   Nuova strada: SINTESI A FORMANTI — N voci (oscillatori) a pitch RANDOM su ampio range, con DRIFT lento per voce
  //   (glissando → nessuna nota stabile = boato, non accordo), passate per 2 FORMANTI vocali «ah» (F1~750 · F2~1200, Q basso
  //   = larghi, che SALGONO un filo = bocche che si aprono). Le voci sono il COLORE UMANO, tenute SOTTO un corpo broadband
  //   DOMINANTE (che maschera ogni residuo tonale) + applausi in cima. Preferisce un campione reale se registrato ({url}).
  function crowdRoar(){
    if(!ready)return;
    // strada 1 (preferita): campione REALE di boato (Mixkit joy crowd, fornito dal PO). Dura ~15s → ne suono i primi
    //   ~4.2s con fade (l'esplosione iniziale). Niente synth sopra: la registrazione è completa.
    if(_urlBufs['crowd.roar']){try{playSample('crowd.roar',0.95,'crowd',4.2);vibrate(60);return;}catch(_e){}}
    try{
      const t0=now(),T=3.4;
      // --- CORPO broadband (dominante, nessun tono): 3 bande, «AH» che si apre (attacco scalato) + fluttuazione a voci ---
      [[70,420,0.44,0.09],[300,1500,0.50,0.14],[1300,4200,0.28,0.20]].forEach(([hpf,lpf,pk,at])=>{
        const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;s.playbackRate.value=0.7+Math.random()*0.6;
        const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=hpf;hp.Q.value=0.25;
        const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lpf;lp.Q.value=0.25;
        const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t0);
        g.gain.linearRampToValueAtTime(pk,t0+at);g.gain.setValueAtTime(pk,t0+1.1);g.gain.exponentialRampToValueAtTime(0.0001,t0+T);
        const mS=ctx.createBufferSource();mS.buffer=noiseBuf;mS.loop=true;const mLp=ctx.createBiquadFilter();mLp.type='lowpass';mLp.frequency.value=6;const mG=ctx.createGain();mG.gain.value=pk*0.26;mS.connect(mLp);mLp.connect(mG);mG.connect(g.gain);
        s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(dest('crowd'));
        s.start(t0);s.stop(t0+T+0.1);mS.start(t0);mS.stop(t0+T+0.1);
        s.onended=()=>{try{s.disconnect();hp.disconnect();lp.disconnect();g.disconnect();mS.disconnect();mLp.disconnect();mG.disconnect();}catch(_e){}};
      });
      // --- VOCI a FORMANTI (carattere umano): pitch random + drift → boato, sotto il corpo (mascherato) ---
      const vBus=ctx.createGain();vBus.gain.setValueAtTime(0.0001,t0);
      vBus.gain.linearRampToValueAtTime(0.15,t0+0.24);vBus.gain.setValueAtTime(0.15,t0+1.0);vBus.gain.exponentialRampToValueAtTime(0.0001,t0+T*0.9);
      const f1=ctx.createBiquadFilter();f1.type='bandpass';f1.frequency.setValueAtTime(640,t0);f1.frequency.linearRampToValueAtTime(820,t0+0.55);f1.Q.value=1.3;
      const f2=ctx.createBiquadFilter();f2.type='bandpass';f2.frequency.setValueAtTime(1040,t0);f2.frequency.linearRampToValueAtTime(1320,t0+0.55);f2.Q.value=1.5;
      const fMix=ctx.createGain();f1.connect(fMix);f2.connect(fMix);fMix.connect(vBus);vBus.connect(dest('crowd'));
      const voices=[];
      for(let i=0;i<12;i++){const o=ctx.createOscillator();o.type=i%3?'sawtooth':'triangle';
        const base=95+Math.random()*155;o.frequency.setValueAtTime(base,t0);
        o.frequency.linearRampToValueAtTime(base*(0.88+Math.random()*0.34),t0+T);/* drift lento random → nessuna nota stabile */
        const og=ctx.createGain();og.gain.value=0.08+Math.random()*0.05;o.connect(og);og.connect(f1);og.connect(f2);
        o.start(t0);o.stop(t0+T+0.05);voices.push({o,og});}
      setTimeout(()=>{try{voices.forEach(v=>{v.o.disconnect();v.og.disconnect();});f1.disconnect();f2.disconnect();fMix.disconnect();vBus.disconnect();}catch(_e){}},(T+0.35)*1000);
      // --- APPLAUSI (grana umana in cima), due strati desincronizzati ---
      crowdApplause(2.6,0.34);
      setTimeout(()=>{try{crowdApplause(2.1,0.26);}catch(_e){}},300);
    }catch(_e){}
    vibrate(60);
  }
  function crowdStop(){
    if(!bed)return;try{const b=bed;bed=null;b.g.gain.setTargetAtTime(0.0001,now(),0.6);
      setTimeout(()=>{try{b.src.stop();b.src.disconnect();if(b.lp)b.lp.disconnect();b.g.disconnect();}catch(_e){}},1500);}catch(_e){}
  }

  // [7.101.0 collaudo PO «l'audio folla è disattivato, cosa attivare per rendere il gioco più avvolgente?»]
  //   AMBIENCE nei MENU (fuori dal match): letto SOTTILE di brusio "da stadio/club" (molto più basso del letto-folla
  //   della partita) + eventi lontani sparsi (applauso/coro ovattato ogni ~18-36s) → le schermate non sono più mute
  //   sotto la musica, ma vive. Categoria 'crowd' (rispetta il toggle Folla delle Impostazioni). Mai durante il match.
  let amb=null,ambTimer=null;
  function ambienceStart(){
    if(!ready||amb||inMatch)return;
    try{
      const src=ctx.createBufferSource();src.buffer=noiseBuf;src.loop=true;
      const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=90;
      const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=480;lp.Q.value=0.2;
      const g=ctx.createGain();g.gain.value=0.0001;
      src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(dest('crowd'));src.start();
      g.gain.setTargetAtTime(0.05,now(),2.2);// brusio da concourse: appena percepibile, mai invadente
      amb={src,g};
      const _fire=()=>{ if(!amb||inMatch)return; try{ if(cfg.on.crowd&&!cfg.mute)(Math.random()<0.5?crowdApplause(1.4,0.09):crowdSwell(1.6,0.09,900)); }catch(_e){} ambTimer=setTimeout(_fire,18000+Math.random()*18000); };
      ambTimer=setTimeout(_fire,9000+Math.random()*9000);
    }catch(_e){}
  }
  function ambienceStop(){
    if(ambTimer){clearTimeout(ambTimer);ambTimer=null;}
    if(!amb)return;try{const a=amb;amb=null;a.g.gain.setTargetAtTime(0.0001,now(),0.8);
      setTimeout(()=>{try{a.src.stop();a.src.disconnect();a.g.disconnect();}catch(_e){}},1500);}catch(_e){}
  }

  // ---- MUSICA MENU — [7.96.0 collaudo PO «musica stile FIFA 98, energica»] LOOP RITMICO generativo (era un pad
  //   ambient lento e "assente"): batteria (kick four-on-the-floor + rullante 2&4 + hi-hat 8vi) + basso pulsante +
  //   RIFF di lead brillante su una progressione energica (i-VI-III-VII: Am-F-C-G). ~124 BPM, sintetizzato, loop
  //   perfetto per costruzione, 0 KB. Il volume resta sotto il controllo del cursore Musica del menu Impostazioni.
  const SCENES={
    home:  {bpm:126, bassOct:[110,87.31,130.81,98.00], lead:1.0},   // arioso, lead più presente
    career:{bpm:120, bassOct:[98.00,87.31,110,130.81], lead:0.85},  // più raccolto
    menu:  {bpm:124, bassOct:[110,87.31,130.81,98.00], lead:0.95},
  };
  // [7.101.0 collaudo PO «la musica delle schermate deve essere sempre diversa ed allegra»] più PROGRESSIONI
  //   solari che RUOTANO ogni 8 barre → il loop EVOLVE (non è più lo stesso giro di 4 accordi all'infinito).
  //   Ogni variante = 4 triadi (Hz, una per barra) + walk di basso + pattern del riff di lead. Tutte "maggiori/allegre".
  const _MUS_PROG=[
    {tri:[[440,523.25,659.25],[349.23,440,523.25],[523.25,659.25,783.99],[392,493.88,587.33]],bass:[110,87.31,130.81,98.00],seq:[0,1,2,1,0,1,2,2]},   // Am-F-C-G (energico)
    {tri:[[523.25,659.25,783.99],[392,493.88,587.33],[440,523.25,659.25],[349.23,440,523.25]],bass:[130.81,98.00,110,87.31],seq:[2,1,0,1,2,2,1,0]},   // C-G-Am-F (solare)
    {tri:[[349.23,440,523.25],[523.25,659.25,783.99],[392,493.88,587.33],[440,523.25,659.25]],bass:[87.31,130.81,98.00,110],seq:[0,2,1,2,0,1,2,1]},   // F-C-G-Am (trionfale)
    {tri:[[392,493.88,587.33],[440,523.25,659.25],[349.23,440,523.25],[523.25,659.25,783.99]],bass:[98.00,110,87.31,130.81],seq:[1,2,2,1,0,1,2,0]},   // G-Am-F-C (spinta)
  ];
  const _KICK=[1,0,0,0, 1,0,0,0, 1,0,0,1, 1,0,0,0], _SNARE=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], _BASS=[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0];
  let mus=null,musScene=null,musTimer=null;
  function _nz(g,t,dur,peak,freq,type){try{if(!noiseBuf){noiseBuf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.5),ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    const b=ctx.createBufferSource();b.buffer=noiseBuf;const f=ctx.createBiquadFilter();f.type=type||'highpass';f.frequency.value=freq;const k=ctx.createGain();k.gain.setValueAtTime(peak,t);k.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    b.connect(f);f.connect(k);k.connect(g);b.start(t);b.stop(t+dur+0.02);b.onended=()=>{try{b.disconnect();f.disconnect();k.disconnect();}catch(_e){}};}catch(_e){}}
  function musicStart(key){
    if(!ready||!cfg.on.music)return;
    if(mus&&musScene===key)return;
    musicStop(true);musScene=key;
    try{
      const S=SCENES[key]||SCENES.menu;const g=ctx.createGain();g.gain.value=0.0001;g.connect(dest('music'));
      g.gain.setTargetAtTime(0.20,now(),0.6);/* presente ma sotto il cursore Musica */
      const stepMs=60000/S.bpm/4;// 16 semicrome per barra
      mus={g,S,step:0,key};
      const kick=(t)=>{const o=ctx.createOscillator(),k=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(48,t+0.10);k.gain.setValueAtTime(0.0001,t);k.gain.exponentialRampToValueAtTime(0.95,t+0.004);k.gain.exponentialRampToValueAtTime(0.0001,t+0.17);o.connect(k);k.connect(g);o.start(t);o.stop(t+0.2);o.onended=()=>{try{o.disconnect();k.disconnect();}catch(_e){}};};
      const snare=(t)=>{_nz(g,t,0.15,0.5,1500,'highpass');const o=ctx.createOscillator(),k=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(200,t);k.gain.setValueAtTime(0.28,t);k.gain.exponentialRampToValueAtTime(0.0001,t+0.11);o.connect(k);k.connect(g);o.start(t);o.stop(t+0.13);o.onended=()=>{try{o.disconnect();k.disconnect();}catch(_e){}};};
      const bass=(t,f,dur)=>{const o=ctx.createOscillator(),k=ctx.createGain(),lp=ctx.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(f,t);lp.type='lowpass';lp.frequency.value=560;k.gain.setValueAtTime(0.0001,t);k.gain.exponentialRampToValueAtTime(0.5,t+0.012);k.gain.setTargetAtTime(0.0001,t+dur*0.6,0.06);o.connect(lp);lp.connect(k);k.connect(g);o.start(t);o.stop(t+dur+0.05);o.onended=()=>{try{o.disconnect();lp.disconnect();k.disconnect();}catch(_e){}};};
      const lead=(t,f,dur,peak)=>{const o=ctx.createOscillator(),o2=ctx.createOscillator(),k=ctx.createGain(),lp=ctx.createBiquadFilter();o.type='square';o2.type='sawtooth';o.frequency.setValueAtTime(f,t);o2.frequency.setValueAtTime(f*1.005,t);lp.type='lowpass';lp.frequency.value=2100;k.gain.setValueAtTime(0.0001,t);k.gain.exponentialRampToValueAtTime(peak,t+0.012);k.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(lp);o2.connect(lp);lp.connect(k);k.connect(g);o.start(t);o2.start(t);o.stop(t+dur+0.03);o2.stop(t+dur+0.03);o.onended=()=>{try{o.disconnect();o2.disconnect();lp.disconnect();k.disconnect();}catch(_e){}};};
      const _v0={home:0,career:1,menu:2}[key]||0;// ogni schermata parte da una progressione diversa
      const advance=()=>{ if(!mus||musScene!==key)return;const s=mus.step%16,bar=Math.floor(mus.step/16)%4,t=now()+0.03;
        const P=_MUS_PROG[(_v0+Math.floor(mus.step/(16*8)))%_MUS_PROG.length];// la progressione RUOTA ogni 8 barre → loop che evolve
        if(mus.step>0&&mus.step%(16*8)===0)_nz(g,t,1.1,0.15,6000,'highpass');// crash morbido al cambio di sezione (freschezza)
        if(_KICK[s])kick(t);
        if(_SNARE[s])snare(t);
        if(s%2===0)_nz(g,t,s%4===2?0.10:0.045,s%4===2?0.11:0.16,8500,'highpass');// hi-hat: aperto sugli 8vi in levare
        if(_BASS[s]){const r=P.bass[bar];bass(t,s%8===0?r:(s%4===0?r*1.5:r),stepMs/1000*1.2);}// basso pulsante col walk d'ottava
        // RIFF di lead: arpeggio della triade della progressione CORRENTE sugli 8vi (step pari), accento sul battere
        if(s%2===0){const tri=P.tri[bar],n=P.seq[(s/2)|0];lead(t,tri[n],stepMs/1000*(s%4===0?2.0:1.4),(s%4===0?0.16:0.11)*S.lead);}
        mus.step++; };
      advance();musTimer=setInterval(advance,stepMs);
    }catch(_e){}
  }
  function musicStop(fade){
    if(!mus){if(musTimer){clearInterval(musTimer);musTimer=null;}return;}
    try{const m=mus;mus=null;musScene=null;if(musTimer){clearInterval(musTimer);musTimer=null;}
      m.g.gain.setTargetAtTime(0.0001,now(),fade?0.4:0.15);
      setTimeout(()=>{try{m.g.disconnect();}catch(_e){}},fade?900:300);// le note sono one-shot e si auto-dispongono
    }catch(_e){}
  }

  // ---- VIBRAZIONE (predisposizione mobile) ------------------------------
  function vibrate(ms){ try{ if(cfg.on.vibr&&!cfg.mute&&navigator&&navigator.vibrate)navigator.vibrate(ms); }catch(_e){} }

  // ---- CATALOGO SFX (nome logico → sintesi; sostituibile con {url}) ------
  const SFX={
    'ui.click':()=>{const v=pickVar('click',3);osc('sfx',{type:'sine',f0:[520,560,600][v],f1:[470,510,550][v],dur:0.055,peak:0.10,a:0.002});},
    'ui.nav':()=>{const v=pickVar('nav',2);osc('sfx',{type:'triangle',f0:[620,680][v],f1:[760,820][v],dur:0.08,peak:0.11});},
    'ui.back':()=>osc('sfx',{type:'sine',f0:360,f1:290,dur:0.09,peak:0.11}),
    'ui.confirm':()=>{osc('sfx',{type:'sine',f0:560,f1:840,dur:0.14,peak:0.15});},
    'ui.error':()=>osc('sfx',{type:'square',f0:210,f1:150,dur:0.2,peak:0.13}),
    'ui.popup':()=>osc('sfx',{type:'sine',f0:440,f1:640,dur:0.12,peak:0.12}),
    'ui.close':()=>osc('sfx',{type:'sine',f0:520,f1:380,dur:0.1,peak:0.11}),
    'notify.pos':()=>{osc('sfx',{type:'sine',f0:660,f1:990,dur:0.15,peak:0.16});setTimeout(()=>osc('sfx',{type:'sine',f0:990,f1:1320,dur:0.15,peak:0.13}),90);},
    'notify.neg':()=>osc('sfx',{type:'triangle',f0:400,f1:290,dur:0.24,peak:0.14}),
    'notify.info':()=>osc('sfx',{type:'sine',f0:700,f1:700,dur:0.1,peak:0.11}),
    'ball.kick':()=>{const v=pickVar('kick',4);noise('match',{dur:0.09,peak:0.5,type:'lowpass',f:[900,1100,800,1000][v],q:0.7});osc('match',{type:'sine',f0:180,f1:55,dur:0.09,peak:0.24});},
    'ball.pass':()=>noise('match',{dur:0.06,peak:0.28,type:'lowpass',f:1400}),
    'ball.header':()=>{noise('match',{dur:0.07,peak:0.34,type:'lowpass',f:700,q:1});osc('match',{type:'sine',f0:150,f1:75,dur:0.07,peak:0.17});},
    'ball.net':()=>{noise('match',{dur:0.2,peak:0.3,type:'highpass',f:1500});osc('match',{type:'sine',f0:120,f1:70,dur:0.07,peak:0.13});},/* [7.64.0] fruscio della rete + tonfo morbido del pallone (era un "tss" acuto sottile) */
    'ball.post':()=>{const v=pickVar('post',2);osc('match',{type:'triangle',f0:[190,220][v],f1:[150,168][v],dur:0.5,peak:0.4});noise('match',{dur:0.04,peak:0.4,type:'bandpass',f:2000});},
    'ball.bounce':()=>noise('match',{dur:0.05,peak:0.2,type:'lowpass',f:600}),
    'gk.save':()=>{noise('match',{dur:0.12,peak:0.4,type:'bandpass',f:2400,q:0.8});osc('match',{type:'sine',f0:140,f1:70,dur:0.1,peak:0.18});},
    'ref.whistle':()=>refWhistle(1),
    'ref.whistle2':()=>refWhistle(2),
    'ref.whistle_final':()=>refWhistle(3),
    'crowd.ohh':()=>crowdSwell(0.6,0.55,1800),
    'crowd.applause':()=>crowdApplause(1.6,0.5),
    'crowd.cheer':()=>crowdApplause(1.1,0.6),
    'crowd.roar':()=>crowdRoar(),
    'career.contract':()=>arp(['C','E','G','C2'],'sfx',0.11,0.18),
    'career.renew':()=>arp(['C','E','G'],'sfx',0.1,0.16),
    'career.trophy':()=>fanfare(true),
    'career.record':()=>arp(['G','B','D2','G2'],'sfx',0.1,0.2),
    'career.callup':()=>arp(['C','G','C2','E2'],'sfx',0.12,0.16),
    'career.milestone':()=>arp(['C','E','G','C2'],'sfx',0.09,0.17),
    'career.levelup':()=>arp(['C','E','G'],'sfx',0.09,0.16),
    'season.promotion':()=>fanfare(true),
    'season.relegation':()=>osc('sfx',{type:'triangle',f0:300,f1:150,dur:0.7,peak:0.2}),
    'week.advance':()=>{const v=pickVar('week',2);osc('sfx',{type:'sine',f0:[560,600][v],f1:[720,760][v],dur:0.1,peak:0.11});},
    'gala.envelope':()=>noise('sfx',{dur:0.4,peak:0.18,type:'highpass',f:3000}),
    'gala.reveal':()=>arp(['C','E','G','C2','E2'],'sfx',0.08,0.2),
    'gala.winner':()=>fanfare(true),
    'gala.trophy':()=>fanfare(true),
  };

  // ---- API pubblica ------------------------------------------------------
  function play(name){
    if(SILENT()||!ready)return;
    try{const fn=SFX[name];if(fn){_played++;fn();}}catch(_e){}
  }
  function scene(phase){
    _curPhase=phase;
    if(SILENT())return;
    if(!ready){_pendingScene=phase;return;}
    if(phase==='career'){ if(!inMatch){musicStart('career');ambienceStart();} }
    else if(phase==='home'||phase==='offers'){ musicStart('home');ambienceStart(); }
    else if(phase==='create'||phase==='trial'){ musicStart('menu');ambienceStart(); }
    else { musicStop(true);ambienceStop(); }// loading/cinematic → silenzio
  }
  function enterMatch(){ if(SILENT())return; inMatch=true; _matchHushed=false; if(!ready)return; musicStop(true);ambienceStop(); crowdStart(0.30); }
  function exitMatch(){ if(SILENT())return; inMatch=false; crowdStop(); if(ready&&_curPhase==='career'){musicStart('career');ambienceStart();} }
  // [7.102.0 collaudo PO «rumore folla ed effetti della partita devono spegnersi nella schermata del giornale»]
  //   al FISCHIO FINALE (fase 'ended' = rassegna stampa) il letto-folla si SPEGNE (gli effetti di partita sono one-shot
  //   su evento → a ended non ne parte più nessuno). inMatch resta true: la musica menu riparte solo all'uscita reale.
  function hushMatch(){ if(SILENT())return; _matchHushed=true; try{crowdStop();ambienceStop();}catch(_e){} }
  function event(e){
    if(SILENT()||!ready)return;
    try{
      const t=e&&e.type;
      if(t==='ActionResolved'){
        const h=e.hlType;
        if(h==='shot'||h==='freekick'||h==='penalty')play('ball.kick');
        else if(h==='header')play('ball.header');
        else if(h==='cross'||h==='pass'||h==='build'||h==='dribble')play('ball.pass');
        else if(h==='tackle'||h==='def')play('ball.bounce');
        if(bed)crowdLevel(Math.min(1,(bed.level||0.3)+0.12));// azione offensiva → letto sale
      } else if(t==='CoherenceCheck'){
        const k=e.outKind;
        if(k==='post'){play('ball.post');crowdSwell(0.6,0.55,2000);}
        else if(k==='saved'){play('gk.save');crowdSwell(0.5,0.45,2200);}
        else if(k==='corner'){play('ref.whistle');crowdSwell(0.4,0.3,1400);}
        else if(k==='wide'||k==='blocked'){crowdSwell(0.5,0.35,1600);}
        else if(k==='foul'){play('ref.whistle');}
        else if(k==='offside'){play('ref.whistle2');}
      } else if(t==='GoalHero'){ play('ball.net');crowdRoar(); }
      else if(t==='GoalTeam'){ play('ball.net');crowdRoar(); }
      else if(t==='GoalAgainst'){ crowdSwell(2.2,0.4,900); }
      else if(t==='HalfTime'){ refWhistle(2);crowdLevel(0.18); }
      else if(t==='MatchEnd'){ refWhistle(3); }
      else if(t==='GalaCue'){ const c=e.cue;
        if(c==='envelope_open')play('gala.envelope');
        else if(c==='winner_reveal')play('gala.reveal');
        else if(c==='winner_enter')play('gala.winner');
        else if(c==='trophy_lift')play('gala.trophy'); }
    }catch(_e){}
  }
  function notifyCue(msg,color){
    if(SILENT()||!ready)return;
    try{const m=String(msg||'');const TC=(typeof TH!=='undefined')?TH:{};
      if(color===TC.danger||/❌|⚠️|infortun|svincol|retroces|eliminat|sconfitt|mancat/i.test(m))play('notify.neg');
      else if(/🏆|trofeo|campion|scudetto|record/i.test(m))play('career.trophy');
      else if(/✅|firma|contratt|rinnov|convocat|promoss|qualificat/i.test(m)||color===TC.success)play('notify.pos');
      else play('notify.info');
    }catch(_e){}
  }
  function unlock(){
    if(SILENT())return;
    if(!ready)ensureCtx();
    try{if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});}catch(_e){}
    unlocked=true;loadSamples();/* [7.70.0] carica i campioni reali registrati (se presenti) al primo gesto */
    if(_pendingScene){const p=_pendingScene;_pendingScene=null;scene(p);}
    else if(_curPhase&&!inMatch)scene(_curPhase);
    if(inMatch&&!bed&&!_matchHushed)crowdStart(0.30);/* [7.104.0] non riavviare il letto-folla dopo il fischio finale (schermata giornale) */
  }
  // settings
  function setOn(c,v){cfg.on[c]=!!v;applyBus();persist();}
  function setVol(c,v){if(cfg.vol[c]!=null)cfg.vol[c]=Math.max(0,Math.min(1,v));applyBus();persist();}
  function setMaster(v){cfg.master=Math.max(0,Math.min(1,v));applyBus();persist();}
  function toggleMute(){cfg.mute=!cfg.mute;applyBus();persist();return cfg.mute;}
  // [7.89.0 collaudo PO «se l'app è in background gli effetti sonori devono essere messi in pausa»] sospende/riprende
  //   l'INTERO AudioContext (musica + letto-folla + sfx in un colpo). Riprende SOLO se l'audio era già stato sbloccato
  //   da un gesto (unlocked) → non forza l'avvio dell'audio al primo foreground. No-op sotto test / senza ctx.
  function setSuspended(v){if(!ctx)return;/* [7.243.0] NON gated da SILENT(): entrando nel wizard il flag e gia alzato e la sospensione deve comunque passare (sotto gate ctx non nasce mai → safe) */try{if(v){if(ctx.state==='running')ctx.suspend().catch(()=>{});}else{if(ctx.state==='suspended'&&unlocked)ctx.resume().catch(()=>{});}}catch(_e){}}
  function getCfg(){try{return JSON.parse(JSON.stringify(cfg));}catch(_e){return {...DEF};}}
  function preview(c){ if(!ready)return; if(c==='music'){arp(['C','E','G'],'music',0.12,0.14);} else if(c==='crowd')crowdSwell(0.7,0.5,1800); else if(c==='referee')refWhistle(1); else if(c==='match')play('ball.kick'); else play('ui.confirm'); }
  function debug(){ return {ready,unlocked,silent:SILENT(),ctx:ctx?ctx.state:'none',inMatch,scene:musScene,bed:!!bed,played:_played,cfg:getCfg(),catalog:Object.keys(SFX)}; }

  return {unlock,play,scene,enterMatch,exitMatch,hushMatch,event,crowd:crowdLevel,notifyCue,vibrate,setSuspended,
    ui:{click:()=>play('ui.click'),nav:()=>play('ui.nav'),back:()=>play('ui.back')},
    setOn,setVol,setMaster,toggleMute,getCfg,preview,debug,catalog:()=>Object.keys(SFX),cats:CATS};
})();
// [7.89.0 collaudo PO] AUDIO IN PAUSA IN BACKGROUND: quando la scheda/app va in background (visibilitychange→hidden
//   o pagehide) l'AudioContext viene SOSPESO → musica ed effetti tacciono; al ritorno in foreground si riprende
//   (solo se l'audio era stato sbloccato da un gesto). Listener globale unico, sopravvive per tutta la vita della pagina.
try{if(typeof document!=='undefined'){
  document.addEventListener('visibilitychange',()=>{try{AudioMgr.setSuspended(!!document.hidden);}catch(_e){}});
  window.addEventListener('pagehide',()=>{try{AudioMgr.setSuspended(true);}catch(_e){}});
  window.addEventListener('pageshow',()=>{try{AudioMgr.setSuspended(false);}catch(_e){}});
}}catch(_e){}
let _aiMockMode=safeLS.get("cpm-ai-mock")==="true";

function toggleAIMock(){
  _aiMockMode=!_aiMockMode;
  safeLS.set("cpm-ai-mock",String(_aiMockMode));
  console.log("[CPM-AI] Mock mode:",_aiMockMode);
  return _aiMockMode;
}

async function callClaudeAPI(systemPrompt,userMessage){
  // roadmap 1.6: nella BUILD STORE (tools/build-dist.mjs imposta window.__CPM_STORE_BUILD) la feature AI è DISATTIVATA →
  //   nessuna chiamata di rete esterna, Data Safety "nessun dato raccolto". Nella versione web resta opt-in con chiave utente.
  if(typeof window!=='undefined'&&window.__CPM_STORE_BUILD){return{success:false,error:"disabled_store_build"};}
  const key=safeLS.get("cpm-api-key")||window.__CPM_API_KEY||"";
  if(!key){return{success:false,error:"no_key"};}/* [6.45.0 RC] via il console.log: sul web senza chiave partiva a OGNI highlight (spam) */
  const now=Date.now();
  if(now-_lastClaudeCall<CLAUDE_MIN_INTERVAL){return{success:false,error:"rate_limited"};}
  _lastClaudeCall=now;
  try{
    if(typeof window!=='undefined'&&window.__CPM_AI_DEBUG)console.log("[CPM-AI] →",userMessage.slice(0,80));
    const resp=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:CLAUDE_MODEL,max_tokens:CLAUDE_MAX_TOKENS,system:systemPrompt,messages:[{role:"user",content:userMessage}]}),
      signal:AbortSignal.timeout(12000),
    });
    if(!resp.ok){const t=await resp.text().catch(()=>"");console.warn("[CPM-AI] HTTP",resp.status,t.slice(0,120));return{success:false,error:`http_${resp.status}`};}
    const data=await resp.json();
    const text=data.content?.[0]?.text||"";
    if(typeof window!=='undefined'&&window.__CPM_AI_DEBUG)console.log("[CPM-AI] ←",text.slice(0,200));
    try{const m=text.match(/\{[\s\S]*\}/);if(m)return{success:true,data:JSON.parse(m[0])};}catch{}
    return{success:true,data:text};
  }catch(e){console.warn("[CPM-AI] Error:",e.message);return{success:false,error:e.message};}
}

async function generateOpponentTactic(opponentClub,playerStats,gameWeek){
  if(_aiMockMode){
    const fms=["4-3-3","4-4-2","3-5-2","4-2-3-1","5-3-2"];
    const f=fms[Math.floor((opponentClub.p||65)/20)%fms.length];
    return{formation:f,pressure:clamp(40+(opponentClub.p||65)/2,40,95),reasoning:"Tattica simulata (mock mode)."};
  }
  const sys="Sei un assistente tattico di calcio. Rispondi SOLO con JSON valido, nessun testo extra.";
  const msg=`Partita di calcio:\n- Avversario: ${opponentClub.n} (Prestige: ${opponentClub.p||65}/99, Lega: ${opponentClub.lg||"–"})\n- Settimana: ${gameWeek}\n- Stats giocatore: tecnica ${playerStats.tecnica||60}, velocità ${playerStats.velocità||60}, tiro ${playerStats.tiro||60}, passaggio ${playerStats.passaggio||60}\n\nScegli formazione e pressing. JSON: {"formation":"4-3-3","pressure":75,"reasoning":"frase tattica"}`;
  const res=await callClaudeAPI(sys,msg);
  if(res.success&&typeof res.data==="object"){
    return{formation:res.data.formation||"4-4-2",pressure:clamp(Number(res.data.pressure)||65,30,100),reasoning:res.data.reasoning||"Tattica standard."};
  }
  const fms=["4-4-2","4-3-3","3-5-2","4-2-3-1","5-3-2"];
  return{formation:fms[Math.floor((opponentClub.p||65)/20)%fms.length],pressure:clamp(40+(opponentClub.p||65)/2,40,95),reasoning:"Tattica deterministica (AI non disponibile)."};
}

async function generateHighlightCommentary(situation,action,result,playerStats,zone){
  if(_aiMockMode){
    const ok=result.ok;
    const mocks=ok?["Giocata perfetta! Il pubblico esplode di gioia!","Tecnica sopraffina, nessuno poteva fermarlo.","Istinto puro — reazione da campione!","Che tocco! La difesa non ha visto la palla."]:["Palla persa, la difesa non perdona.","Pressione sbagliata, l'avversario ne approfitta subito.","Errore di valutazione in zona pericolosa.","Il portiere para tutto oggi."];
    return{commentary:pick(mocks),reaction:ok?"😮":"😤"};
  }
  const sys="Sei un telecronista di calcio italiano. Scrivi commenti vividi e brevi. Rispondi SOLO con JSON valido.";
  const msg=`Evento:\n- Situazione: ${situation?.text||"Azione"}\n- Azione: ${action?.label||"–"}\n- Esito: ${result.ok?"SUCCESSO":"FALLIMENTO"}\n- Zona: ${zone}\n- Tecnica: ${playerStats.tecnica||60}, Velocità: ${playerStats.velocità||60}\n\nJSON: {"commentary":"1-2 frasi vivide in italiano","reaction":"emoji"}`;
  const res=await callClaudeAPI(sys,msg);
  if(res.success&&typeof res.data==="object"){
    return{commentary:res.data.commentary||(result.ok?"Bella giocata!":"Palla persa."),reaction:res.data.reaction||(result.ok?"✅":"❌")};
  }
  return{commentary:result.ok?"Bella giocata!":"Palla persa.",reaction:result.ok?"✅":"❌"};
}

// [7.88.0 collaudo PO «l'analisi del mister deve dare indicazioni REALI per facilitare la vittoria»] PROFILO
//   TATTICO dell'avversario, DETERMINISTICO per club+stagione: 2 punti deboli SFRUTTABILI (uno di difesa, uno del
//   portiere) mappati su FAMIGLIE d'AZIONE reali + 1 reparto forte. `handleAction` premia l'azione che colpisce il
//   punto debole (+9%) e penalizza quella sul reparto forte (−5%) → seguire il consiglio AUMENTA davvero la riuscita.
//   Le rx classificano l'azione scelta dal LABEL (i label delle SITUATIONS sono descrittivi: «Cross teso», «Tiro
//   potente», «Scavetto», «Palla filtrante», «Salta l'uomo», «Colpo di testa»…). Puro/seedato → zero Math.random.
const SCOUT_EXPLOITS=[
  {key:"cross",  cat:"def",fam:"Cross tesi dal fondo",   rx:/cross|traversone|fondo|secondo palo|pennell|in mezzo|crossa/i, tip:"la loro difesa va in affanno: appena arrivi sul fondo, mettila tesa in mezzo."},
  {key:"through",cat:"def",fam:"Palle filtranti",        rx:/filtrant|vertical|profondit|imbucat|lancio|apertura|dietro la linea|in verticale/i, tip:"si abbassano tardi in transizione: verticalizza dietro la difesa."},
  {key:"dribble",cat:"def",fam:"Dribbling nell'1v1",     rx:/dribbl|salta l'uomo|punta l'uomo|1v1|uno contro uno|finta|salta il|elude/i, tip:"i terzini si fanno saltare: punta l'uomo nell'uno-contro-uno sulla trequarti."},
  {key:"header", cat:"def",fam:"Gioco aereo",            rx:/testa|incornata|stacco|di petto|colpo di testa/i, tip:"sono deboli in mezzo all'area: attacca di testa quando arriva il cross."},
  {key:"power",  cat:"gk", fam:"Tiri potenti",           rx:/potent|bordata|sassata|cannonata|di potenza|forte|di prima|secco/i, tip:"il portiere è insicuro: quando puoi, calcia forte e teso."},
  {key:"finesse",cat:"gk", fam:"Scavetto e tiro a giro", rx:/scavett|cucchiaio|pallonett|a giro|d'esterno|piazzat|preciso|sul palo|angolin/i, tip:"il portiere esce a vuoto: puniscilo con lo scavetto o a giro nell'angolino."},
];
const SCOUT_SOLID=[
  {key:"aerial", strDesc:"Reparto arretrato dominante nel gioco aereo", rx:/testa|incornata|stacco|cross alto/i, tip:"attenzione: sono forti di testa, evita i palloni alti e gioca basso."},
  {key:"press",  strDesc:"Pressing alto e organizzato",                 rx:/tiene palla|palleggia|controlla|aspetta|gestisce|temporeggia/i, tip:"attenzione: pressano alto, non attardarti sul palleggio e scarica veloce."},
  {key:"tackle", strDesc:"Centrocampo fisico e aggressivo nei contrasti",rx:/contrasto|duello|forza|fisic|spalla|protegge/i, tip:"attenzione: centrocampo fisico, evita i duelli e gioca sul movimento."},
];
function oppMatchProfile(club,season){
  const seed=Math.abs(hashStr(((club&&(club.id||club.n))||"x")+"|scout|"+(season||1)))>>>0;
  const defs=SCOUT_EXPLOITS.filter(e=>e.cat==="def"),gks=SCOUT_EXPLOITS.filter(e=>e.cat==="gk");
  const defWeak=defs[seed%defs.length],gkWeak=gks[(seed>>>4)%gks.length];/* >>> UNSIGNED: con >> i seed col bit alto settato davano indice NEGATIVO → gkWeak undefined */
  const solidPool=SCOUT_SOLID.filter(sd=>!(sd.key==="aerial"&&defWeak.key==="header"));/* mai «debole di testa» E «forte di testa» insieme */
  const solid=solidPool[(seed>>>8)%solidPool.length];
  const p=(club&&(club.p||club.prestige))||65;
  return{defWeak,gkWeak,solid,difficulty:clamp(Math.round(28+(p/99)*67),18,95)};
}
// esito del roll d'azione: +9% se colpisce un punto debole avversario, −5% se attacca il reparto forte, 0 altrimenti
function scoutActionMod(action,prof){
  if(!prof||!action)return{mod:0,cause:null};
  const s=((action.label||"")+" "+(action.rew||""));
  if((prof.defWeak&&prof.defWeak.rx.test(s))||(prof.gkWeak&&prof.gkWeak.rx.test(s)))return{mod:0.09,cause:"🎯 Punto debole avversario colpito (analisi del mister)"};
  if(prof.solid&&prof.solid.rx.test(s))return{mod:-0.05,cause:"🛡️ Hai attaccato il loro reparto più forte"};
  return{mod:0,cause:null};
}
function generateLocalScoutReport(opponentClub,playerStats,recentMatches,player){
  const p=opponentClub.p||65;
  const name=opponentClub.n||"Avversario";
  const lg=opponentClub.lg||"";
  const difficulty=clamp(Math.round(28+(p/99)*67),18,95);
  // Previous encounters vs this opponent
  const prevH2H=(recentMatches||[]).filter(m=>m.opponent===name);
  const h2hW=prevH2H.filter(m=>m.won).length,h2hD=prevH2H.filter(m=>m.drew).length,h2hL=prevH2H.length-h2hW-h2hD;
  // worldMemory context
  const wm=player?.worldMemory||[];
  const memExClub=wm.find(m=>m.type==="ex_club"&&(m.clubId===opponentClub.id||m.club===name));
  const memRecord=wm.find(m=>m.type==="record_club"&&(m.clubId===opponentClub.id||m.club===name));
  const memNote=memExClub?`⚠️ Attenzione: hai già giocato per il ${name} (S.${memExClub.season}). Questa è una gara speciale.`
    :memRecord?`🏅 Hai segnato il record di gol con il ${name} (${memRecord.value} in S.${memRecord.season}).`
    :null;
  const h2hNote=prevH2H.length>0?`${h2hW}V-${h2hD}P-${h2hL}S nei precedenti`:"Prima volta vs questa squadra";
  // Weaknesses pool stratified by prestige
  const wkLow=[
    "Difesa alta e vulnerabile agli scatti in profondità",
    "Portiere poco sicuro sulle palle alte",
    "Transizioni difensive lente dopo il 60°",
    "Difficoltà nel reparto basso sulle rimesse laterali veloci",
    "Centrocampo poco fisico — si aprono spazi larghi",
    "Terzini sbilanciati in avanti — fasce scoperte",
    "Bassa concentrazione sulle situazioni di palla inattiva",
    "Pressing disorganizzato — facilmente superati con uno-due veloci",
  ];
  const wkMid=[
    "Difesa a zona con lacune tra linee su palle filtranti",
    "Difficoltà nella marcatura su attaccanti che si abbassano",
    "Transizioni: squadra che si abbassa tardi dopo palla persa",
    "Cross dalla destra poco efficaci, lato debole sfruttabile",
    "Primo pressing alto ma facilmente superabile con rilancio lungo",
    "Scarso pressing nella propria metà campo nelle ultime azioni",
  ];
  const wkHigh=[
    "Linea difensiva alta — il fuorigioco è un rischio calcolato",
    "Coperture parziali sulle fasce nei momenti di possesso prolungato",
    "Difficoltà psicologica nei finali di gara tirati",
    "Attaccante di riferimento troppo dipendente dal gioco sulle spalle",
    "Pressing aggressivo — lascia spazio in fase di non possesso",
  ];
  // [7.88.0] i pool wk* restano solo come materiale storico: i punti deboli mostrati ora derivano dal profilo tattico (sotto).
  void(wkLow,wkMid,wkHigh);
  // Strengths pool by prestige
  const stLow=["Squadra compatta in fase difensiva","Buona organizzazione sulle palle inattive","Entusiasmo e voglia di lottare"];
  const stMid=["Centrocampo fisico e aggressivo","Buona costruzione dal basso","Attaccanti rapidi in ripartenza","Pressing organizzato per 60 minuti"];
  const stHigh=["Costruzione dal basso di altissimo livello","Pressing intenso per tutti i 90 minuti","Attaccanti tecnici e imprevedibili","Difesa collaudata e difficile da superare","Ampiezza di gioco con terzini offensivi di qualità"];
  const stPool=p<55?stLow:p<78?stMid:stHigh;
  // [7.88.0 collaudo PO] i PUNTI DEBOLI ora sono i DUE REALI del profilo tattico (difesa + portiere) → le stesse
  //   famiglie d'azione che handleAction PREMIA in campo (seguire il consiglio aumenta davvero la riuscita). Il 2°
  //   punto forte è un pescaggio DETERMINISTICO dal pool (niente più Math.random → coerente tra reload).
  const prof=oppMatchProfile(opponentClub,(player&&player.season)||1);
  const _sSeed=Math.abs(hashStr((opponentClub.id||name)+"|str|"+((player&&player.season)||1)))>>>0;
  const weaknesses=[`${prof.defWeak.fam}: ${prof.defWeak.tip}`,`${prof.gkWeak.fam}: ${prof.gkWeak.tip}`];
  const strengths=[prof.solid.strDesc,stPool[_sSeed%stPool.length]];
  const recBase=`Il piano del mister: cerca ${prof.defWeak.fam.toLowerCase()} e ${prof.gkWeak.fam.toLowerCase()} — sono i loro punti deboli. ${prof.solid.tip[0].toUpperCase()+prof.solid.tip.slice(1)} `;
  const recSuffix=p>=80?`Il ${name} è di alto livello: servirà la gara perfetta, ma se colpisci lì puoi far male. ${h2hNote}.`
    :p>=60?`Con un approccio compatto e ripartenze veloci, sfruttando quelle debolezze, puoi impensierire il ${name}. ${h2hNote}.`
    :`Il ${name} è alla tua portata: colpisci i loro punti deboli e resta concentrato. ${h2hNote}.`;
  return{weaknesses,strengths,recommendation:recBase+recSuffix,difficulty:prof.difficulty,league:lg,h2h:prevH2H.length>0?{w:h2hW,d:h2hD,l:h2hL,total:prevH2H.length}:null,memNote:memNote||null,exploits:[prof.defWeak,prof.gkWeak],solid:prof.solid};
}
async function generateScoutReport(opponentClub,playerStats,recentMatches){
  if(_aiMockMode){
    return generateLocalScoutReport(opponentClub,playerStats,recentMatches,arguments[3]);
  }
  const last5=(recentMatches||[]).slice(-5).map(m=>`${m.opponent} ${m.homeScore}-${m.awayScore} (${m.won?"V":m.drew?"P":"S"})`).join(", ")||"Nessuna partita";
  const sys="Sei uno scout calcistico esperto. Analizza tatticamente con precisione. Rispondi SOLO con JSON valido.";
  const msg=`Scout report:\n- Avversario: ${opponentClub.n} (Prestige: ${opponentClub.p||65}/99)\n- Ultime 5 del giocatore: ${last5}\n- Stats: tecnica ${playerStats.tecnica||60}, velocità ${playerStats.velocità||60}, tiro ${playerStats.tiro||60}, passaggio ${playerStats.passaggio||60}\n\nJSON: {"weaknesses":["debole 1","debole 2"],"strengths":["forte 1","forte 2"],"recommendation":"consiglio tattico","difficulty":65}`;
  const res=await callClaudeAPI(sys,msg);
  if(res.success&&typeof res.data==="object"){
    // [7.88.0] anche sul path AI attacco il PROFILO tattico deterministico: exploits/solid alimentano il pannello
    //   inline «come vincerla» e restano coerenti con il bonus di handleAction (che legge sempre oppMatchProfile).
    const _pf=oppMatchProfile(opponentClub,(arguments[3]&&arguments[3].season)||1);
    return{weaknesses:res.data.weaknesses||["Da analizzare"],strengths:res.data.strengths||["Da analizzare"],recommendation:res.data.recommendation||"Preparati al meglio.",difficulty:clamp(Number(res.data.difficulty)||50,10,99),exploits:[_pf.defWeak,_pf.gkWeak],solid:_pf.solid};
  }
  return generateLocalScoutReport(opponentClub,playerStats,recentMatches,arguments[3]);
}

// ---- LOCAL PRESS ANALYSIS (always available, no API needed) ----
function generateLocalPressAnalysis(matchResult,playerPerf,playerCtx={}){
  const won=matchResult.won,drew=matchResult.drew,lost=!won&&!drew;
  const goals=playerPerf.goals||0,assists=playerPerf.assists||0;
  const rating=playerPerf.rating||6.0;
  const name=playerPerf.name||"Il giocatore";
  const club=playerPerf.club||"la squadra";
  const opp=matchResult.opponent||"l'avversario";
  const hs=matchResult.homeScore??0,as=matchResult.awayScore??0;
  const score=`${hs}-${as}`;
  const starPerf=goals>=2||assists>=2||rating>=8;
  const badPerf=goals===0&&assists===0&&rating<6;
  const isDerby=(matchResult.isDerby)||false;

  // Historical memory context
  const arc=ARCHETYPES.find(a=>a.id===(playerCtx.archetype?.id||playerCtx.archetype));
  const arcName=arc?arc.name:null;
  const recs=playerCtx.records||{topSeasonGoals:0,topSeasonAssists:0,topOvr:60};
  const isGB=(playerCtx.goldenBoys||[]).length>0;
  const season=playerCtx.season||1;
  const age=playerCtx.age||20;
  // [6.31.1 collaudo PO «miglior giovane, ho 28 anni!»]: il «Miglior Giovane» (premio U21) e' un titolo del PASSATO;
  //   non va usato come descrittore ATTUALE su un giocatore non piu' giovane. Lo applichiamo solo se e' ancora giovane.
  const isYoungGB=isGB&&age<=23;
  // Streak from matchHistory
  const recent=(playerCtx.matchHistory||[]).slice(-4);
  let streakType=won?"win":drew?"draw":"loss",streakLen=1;
  for(let i=recent.length-1;i>=0;i--){const r=recent[i];const rt=r.won?"win":r.drew?"draw":"loss";if(rt===streakType)streakLen++;else break;}
  const onStreak=streakLen>=3;
  // MVP surname from roster (fallback pool)
  const FALLBACK_SURNAMES=["Ferrari","Ricci","De Rossi","Galli","Mancini","Colombo","Bianchi","Greco","Conti","Pellegrini"];
  const roster=(playerPerf.homeRoster||[]).filter(r=>r.name&&!r.name.includes(name));
  // [7.277.0 collaudo PO «dopo il primo caricamento cambiano i contenuti, c'e' una sorta di refresh!» + «le parole
  //   del protagonista cambiano sempre»] La rassegna era rigenerata a OGNI render (il pannello ended di LiveMatch la
  //   chiama inline, senza memo) e pescava a caso: migliore in campo, flop, citazione del mister e citazione dell'eroe
  //   cambiavano da soli sotto gli occhi del giocatore. Stessa classe delle offerte pro (7.262.0): la cura e' il SEED,
  //   non il memo — cosi' il testo resta identico anche fra un reload e l'altro. Chiave = i fatti della gara.
  const _prSeed=hashStr([name,club,opp,hs,as,goals,assists,rating,playerCtx.season||1,playerCtx.week??"",won?"W":drew?"D":"L"].join("|"));
  const _prPick=(arr,salt)=>arr[hashStr(salt+"|"+_prSeed)%arr.length];
  const pickSurname=(salt)=>{if(roster.length>0)return _surnBG(_prPick(roster,salt).name)||"";return _prPick(FALLBACK_SURNAMES,salt);};

  // Memoria tag
  const memoriaTag=recs.topSeasonGoals>=10?`🏅 Record: ${recs.topSeasonGoals} gol in una stagione`:
    isYoungGB?`🏆 Miglior Giovane d'Europa S.${(playerCtx.goldenBoys||[])[0]||season}`:
    age<=19?`✨ Enfant prodige (${age} anni)`:
    season>=5?`📖 Veterano — ${season}ª stagione`:null;

  // SPRINT (epico)
  const headA=won
    ?(isDerby?`🔥 DERBY VINTO! ${club} domina ${opp} ${score} — la città esplode`
      :onStreak?`${streakLen}ª VITTORIA DI FILA! Il ${club} è inarrestabile: ${score}`
      :starPerf&&arcName?`${arcName} in stato di grazia: ${name} trascina il ${club} ${score}`
      :`Vittoria di carattere: ${club} supera ${opp} ${score}`)
    :drew
    ?(starPerf?`${name} salva il pari: ${club}–${opp} ${score} con una giocata decisiva`
      :`Pari combattuto: ${club} e ${opp} dividono la posta ${score}`)
    :(isDerby?`🖤 Derby perso ${score} — giornata nera per il ${club}`
      :badPerf?`Serata da dimenticare: ${club} cede ${score}, serve di più da ${name}`
      :`Sconfitta che brucia: ${opp} vince ${score}`);

  // CRONACA (critico/analitico)
  const headB=won
    ?(isYoungGB?`Miglior Giovane ${name} ancora decisivo: ${goals>0?goals+" gol":"assist"} e ${club} avanti S.${season}`
      :goals>0?`${name} decide — ${goals} reti e ${club} conquista 3 punti (voto ${rating})`
      :as===0?`Solidità premia il ${club}: clean sheet e vittoria ${score} su ${opp}`
      :`Il ${club} la spunta ${score} su ${opp}: vittoria di carattere`)/* [7.8.28 QA] «clean sheet» solo se davvero non si è subito gol (usciva anche sul 3-2) */
    :drew
    ?(recs.topSeasonGoals>0?`${name} a quota ${goals} gol stagionali ma il ${club} non va oltre ${score}`
      :`Equilibrio totale: ${club}–${opp} ${score}, la classifica non sorride`)
    :(badPerf?`Sotto analisi: ${name} al minimo (${rating}/10), il ${club} deve reagire`
      :`Il ${club} cede ${score} a ${opp}: il mister è sotto esame`);

  // CALCIO TOTALE (drammatico/emotivo)
  const headC=won
    ?(isDerby?`RIVALI KO! ${score} — il ${club} domina il derby, che serata!`
      :starPerf?`SPETTACOLO! ${name} è un fenomeno: ${club} vince ${score}`
      :`VITTORIA FONDAMENTALE! ${club} ${score} — tre punti d'oro!`)
    :drew
    ?`Rimpianto enorme! Il ${club} non sfonda: finisce ${score} con ${opp}`
    :(onStreak&&streakLen>=2?`SPIRALE NEGATIVA: ${streakLen}ª senza vittoria — ${score} la condanna`
      :`ALLARME ROSSO! ${club} cade ${score} — serve una scossa`);

  // RETE SPORT (analitico/tattico)
  const headD=won
    ?(goals>0&&assists>0?`Dati: ${name} con ${goals}G+${assists}A — efficienza da top player per il ${club}`
      :goals>0?`Analisi: ${goals} reti e posizionamento premiato nel ${score}`
      :`Tattica vincente: il ${club} domina e porta a casa i 3 punti vs ${opp}`)
    :drew
    ?`Il ${score} riflette l'equilibrio tattico: ${club} e ${opp} si equivalgono`
    :`Studio: lacune difensive del ${club} sfruttate da ${opp}, ${score}`;

  // DIRETTA TV (diretto/telegraphic)
  const headE=won
    ?`✅ ${club} ${score} ${opp}${goals>0?` | ${name} x${goals}`:""} | +3pts`
    :drew
    ?`🟡 ${club} ${score} ${opp} | Pari | ${name} ${rating}★`
    :`❌ ${club} ${score} ${opp} | Sconfitta | ${name} ${rating}★`;

  // Player rating
  const ratingLabel=rating>=9?"FENOMENALE":rating>=8?"OTTIMO":rating>=7?"BUONO":rating>=6?"SUFFICIENTE":rating>=5?"INSUFFICIENTE":"DA DIMENTICARE";
  const ratingColor=rating>=8?"#16a34a":rating>=6?"#d97706":"#dc2626";

  // MVP: real surname from roster when possible
  const motmSurname=pickSurname("motm");
  const motm=starPerf?name:won?motmSurname:motmSurname;

  // Flop
  const flopMsg=badPerf?`${name} — prestazione opaca, fatica a incidere`
    :lost?`La difesa collettiva — troppi errori nel reparto arretrato`
    :"Nessun flop evidente — giornata da archiviare";

  // Tactical note
  const tactNote=won
    ?(goals>0?`Il pressing alto ha soffocato ${opp}. ${name} ha sfruttato ogni spazio.`
      :`Blocco difensivo impeccabile. Il contropiede ha fatto la differenza.`)
    :drew?`Partita tatticamente chiusa. Entrambe le squadre hanno preferito non rischiare.`
    :`${opp} ha sfruttato le transizioni rapide. Il ${club} ha sofferto in fase difensiva.`;

  const fanReactions=won
    ?["I tifosi esultano: serata perfetta!","Tre punti che valgono oro! Avanti così!"]
    :drew?["Tifosi divisi: punto guadagnato o due persi?","Si poteva vincere, ma un punto è pur sempre un punto."]
    :["Fischi a fine partita — i tifosi chiedono di più.","Delusione in curva: servono risposte immediate."];

  const _mWin=[`"${name} ha fatto la differenza stasera. Sono orgoglioso della squadra."`,`"Prestazione maiuscola. Questo gruppo non smette mai di sorprendermi."`,`"Tre punti meritatissimi. ${name} ha giocato a un livello superiore."`,`"Avevamo preparato bene la partita e si è visto in campo."`,`"Non era semplice, ma i ragazzi hanno risposto presente. Bravi tutti."`,`"${name} è in un momento di grazia. Continuiamo così."`];
  const _pWin=[`"Vittoria di squadra. Andiamo avanti step by step."`,`"Tre punti fondamentali. Il lavoro paga sempre."`,`"Dedico questa vittoria ai tifosi che ci hanno sostenuto."`,`"Volevamo questi tre punti e li abbiamo conquistati con sacrificio."`,`"Stiamo crescendo come gruppo. È bello farne parte."`,`"Il mister ci ha dato le indicazioni giuste. Abbiamo eseguito alla perfezione."`];
  const _mDraw=[`"Ci mancava quel guizzo finale. Portiamo a casa un punto."`,`"Pareggio che può starci, ma sappiamo di poter fare di più."`,`"Non siamo stati cinici sotto porta. Dobbiamo migliorare lì."`,`"Un punto in trasferta ha il suo valore. Testa alla prossima."`,`"La squadra ha lottato fino alla fine. Posso rimproverare poco."`,`"Avremmo meritato di più, ma il calcio è anche questo."`];
  const _pDraw=[`"Non sono soddisfatto del pareggio, ma la squadra ha lottato."`,`"Volevamo i tre punti. Dobbiamo essere più concreti."`,`"Un punto è un punto. Guardiamo avanti con fiducia."`,`"Mi aspettavo di vincere, ma rispetto il risultato. Prossima volta."`,`"Abbiamo creato tanto, ci è mancato il gol. Continueremo a provarci."`,`"Il pareggio brucia, ma la prestazione c'è stata. Testa bassa e lavoro."`];
  const _mLoss=[`"Dobbiamo analizzare gli errori e reagire subito."`,`"Partita da dimenticare in fretta. Ci alleneremo duro questa settimana."`,`"Abbiamo subito gol evitabili. Serve più concentrazione difensiva."`,`"Non accetto prestazioni del genere. Parleremo chiaramente in spogliatoio."`,`"Sconfitta meritata. Prendiamoci le responsabilità e ripartiamo."`,`"Il risultato fa male, ma ci aiuterà a crescere. Torneremo più forti."`];
  const _pLoss=[`"Sconfitta che fa male. Ci rifaremo la prossima settimana."`,`"Non eravamo al 100%. Ma le scuse non servono, serve lavorare."`,`"Abbiamo deluso i tifosi. Ce lo meritiamo. Torneremo più cattivi."`,`"Partita storta. Succede. L'importante è rialzarsi subito."`,`"Non sono riuscito a incidere come volevo. Lavorerò per migliorare."`,`"Brucia tanto. Ma questa è la spinta giusta per la settimana di allenamento."`];
  const quotes=won
    ?[_prPick(_mWin,"m")+` — Mister`,_prPick(_pWin,"p")+` — ${name}`]
    :drew
    ?[_prPick(_mDraw,"m")+` — Mister`,_prPick(_pDraw,"p")+` — ${name}`]
    :[_prPick(_mLoss,"m")+` — Mister`,_prPick(_pLoss,"p")+` — ${name}`];

  const trending=won
    ?(goals>0?`#${name.replace(/\s/g,"")}Gol🔥`:`#${club.replace(/\s/g,"")}Vince`)
    :drew?`#${club.replace(/\s/g,"")}Pareggio`:`#${club.replace(/\s/g,"")}Riparti`;

  // [6.61.0 collaudo PO «dopo una vittoria della UCL mi aspetto un titolone / maggiore enfasi»] TITOLONE del TROFEO:
  //   se la partita VINCE una competizione (finale KO), la rassegna titola la conquista, non un generico "vittoria".
  const titleWon=!!playerCtx.titleWon,titleName=playerCtx.titleName||"il trofeo";
  const _titleHeads=titleWon?[
    `🏆 CAMPIONI! ${club} CONQUISTA ${String(titleName).toUpperCase()}! ${score} contro ${opp}`,
    `${club} CAMPIONE: ${titleName} è realtà — ${score} su ${opp}`,
    `TRIONFO! ${name} alza ${titleName} al cielo: ${club} piega ${opp} ${score}`,
    `NOTTE DA LEGGENDA: il ${club} vince ${titleName} (${score}). Città in delirio!`,
    `🏆 ${club} ${score} ${opp} | ${titleName} CONQUISTATA${goals>0?` | ${name} x${goals}`:""}`,
  ]:null;
  // [6.85.0 collaudo PO «non mi ha comunicato chi ha vinto la semifinale ai rigori»] KO pareggiato ⇒ la rassegna
  //   titola l'ESITO DEI RIGORI (chi passa), non un generico pareggio. titleWon (finale vinta) ha la precedenza.
  const _koPen=(!titleWon&&drew&&playerCtx.koPen)?playerCtx.koPen:null;
  const _koHeads=_koPen?(_koPen.won?[
    `RIGORI SENZA FIATO: ${club} la spunta dal dischetto — ${opp} battuto dopo lo ${score}, superat${/finale/i.test(_koPen.label||"")?"a":"i"} ${_koPen.label||"il turno"}!`,
    `${club} AVANTI AI RIGORI! La lotteria degli undici metri premia i ragazzi dopo lo ${score} con ${opp}`,
    `Decide il dischetto: ${club} passa, ${opp} eliminato — ${score} dopo 90' di battaglia`,
  ]:[
    `BEFFA DAL DISCHETTO: ${club} eliminato ai rigori da ${opp} dopo lo ${score}`,
    `${club} fuori ai rigori — la lotteria degli undici metri premia ${opp} (${score})`,
    `Rigori fatali: il cammino del ${club} si ferma dagli undici metri contro ${opp}`,
  ]):null;
  return{
    headlines:_titleHeads||_koHeads||[headA,headB,headC,headD,headE],
    titleWon,titleName:titleWon?titleName:null,
    papers:NEWSPAPERS.map(p=>p.name),
    paperColors:NEWSPAPERS.map(p=>p.color),
    paperEmojis:NEWSPAPERS.map(p=>p.e),
    playerRating:{value:rating,label:ratingLabel,color:ratingColor,goals,assists},
    motm,flop:flopMsg,tacticalNote:tactNote,
    fanReactions:titleWon?["Città in festa: notte indimenticabile!","I tifosi sognano — che trionfo!"]:fanReactions,
    quotes,trending:titleWon?`#${club.replace(/\s/g,"")}Campione🏆`:trending,memoriaTag,
    isLocal:true,
  };
}

async function generatePressAnalysis(matchResult,playerPerf,playerCtx={}){
  if(_aiMockMode||playerCtx.titleWon||playerCtx.koPen){/* [6.61.0] una vittoria di competizione usa SEMPRE il titolone deterministico (niente parafrasi AI che lo annacqua) · [6.85.0] idem per l'esito ai rigori */
    return generateLocalPressAnalysis(matchResult,playerPerf,playerCtx);
  }
  const sys="Sei un giornalista sportivo italiano. Scrivi reazioni media post-partita. Rispondi SOLO con JSON valido.";
  const msg=`Post-partita:\n- Risultato: ${matchResult.homeScore}-${matchResult.awayScore} (${matchResult.won?"Vittoria":matchResult.drew?"Pareggio":"Sconfitta"})\n- Giocatore: ${playerPerf.name}, ${playerPerf.club}, ${playerPerf.goals} gol, ${playerPerf.assists} assist, voto ${playerPerf.rating}/10\n- Avversario: ${matchResult.opponent} (Prestige: ${playerPerf.oppPrestige||65}/99)\n\nJSON: {"headlines":["titolo 1","titolo 2"],"quotes":["citazione"],"trending":"hashtag"}`;
  const res=await callClaudeAPI(sys,msg);
  if(res.success&&typeof res.data==="object"){
    const local=generateLocalPressAnalysis(matchResult,playerPerf,playerCtx);/* [6.45.0 RC] passa playerCtx anche sul path AI-enriched (prima perdeva memoriaTag e i descrittori storici) */
    return{...local,...res.data,isLocal:false};
  }
  return generateLocalPressAnalysis(matchResult,playerPerf,playerCtx);
}

/* ========================================
   NAME POOLS + ROSTER HELPERS  (BUG 3,8)
======================================== */
const FIRSTNAMES_IT=["Marco","Luca","Andrea","Francesco","Giovanni","Matteo","Davide","Roberto","Michele","Antonio","Paolo","Riccardo","Stefano","Alberto","Nicola","Giorgio","Filippo","Lorenzo","Emanuele","Federico","Simone","Christian","Daniele","Alessandro","Giacomo","Leonardo","Edoardo","Gabriele","Enrico","Fabio","Claudio","Massimo","Gianluca","Vincenzo","Pietro","Salvatore","Dario","Valerio","Nico","Bruno","Sergio","Cristian","Diego","Manuel","Mauro","Cesare","Pierluigi","Samuele","Umberto","Carlo","Luigi","Mario","Giuseppe","Franco","Gino","Aldo","Renzo","Dino","Sandro","Damiano","Tullio","Mirko","Mattia","Ottavio","Jacopo","Tommaso","Giulio","Martino","Ettore","Nino","Toni","Beppe","Zeno","Rocco","Cosimo","Eros","Ivan","Alex","Omar","Kevin","Bryan","Nicolas","Denis","Karim","Ibrahim","Adam"];
const SURNAMES_IT=["Rossi","Ferrari","Bianchi","Romano","Conti","Bruno","Ricci","Russo","Gallo","Farina","Esposito","Ferrara","Leone","Fontana","Caruso","Costa","Amato","Marini","Greco","Colombo","Marchetti","Barbieri","Longo","Poli","Mancini","Gentile","Testa","Ferraro","Vitale","Pellegrini","De Luca","Moretti","Bernardi","Galli","Rizzi","Valente","Cattaneo","Monti","Sala","Sorrentino","Bianco","Villa","Ferri","Riva","Neri","Rinaldi","Santoro","Palumbo","Giordano","D'Angelo","Piras","Melis","Coppola","Lombardi","Napolitano","Fiore","Grassi","Sanna","Basile","De Santis","Serra","Ferretti","Milani","Martini","Antonelli","Parisi","De Rosa","Mazza","Landi","Carbone","Silvestri","Santini","Agostini","Battaglia","Benedetti","Caputo","Catalano","Cristiano","D'Amico","Damiani","Di Mauro","Di Stefano","Fabbri","Fiorentino","Franco","Giannico","Giannini","Giovannini","Guerra","Iannone","Luzi","Madonna","Mantovani","Marra","Masi","Mastroianni","Merlo","Milanese","Molinari","Monaco","Montanari","Morano","Nardi","Negri","Orlando","Pace","Pagano","Paoletti","Paone","Parodi","Pastorino","Pecoraro","Pepe","Piccolo","Pinna","Pinto","Pirrone","Pisani","Porcu","Pozzi","Pucci","Quaranta","Quattrocchi","Ragusa","Raimondi","Rallo","Randazzo","Ratti","Re","Rizzo","Robustelli","Rosi","Ruggiero","Sacco","Saladino","Salerno","Salvi","Sanguinetti","Sassone","Savino","Schiavone","Scotti","Semeraro","Simonetti","Sinibaldi","Sisto","Sodano","Soriano","Spada","Spagnolo","Stanco","Stella","Taddei","Tarantino","Tedesco","Terzi","Tirone","Toscano","Toti","Traverso","Trivellato","Trovato","Tucci","Turchi","Ursino","Valentino","Vallone","Vecchio","Veneziano"];
const FIRSTNAMES_EN=["James","John","Michael","David","Steven","Daniel","Thomas","Jack","Harry","Oliver","George","Callum","Luke","Ryan","Adam","Peter","Matthew","Nathan","Sam","Lee","Chris","Rob","Wayne","Gary","Dean","Aaron","Bradley","Jake","Kyle","Lewis","Conor","Liam","Ethan","Josh","Owen","Kieran","Declan","Tyler","Marcus","Ben","Alfie","Archie","Toby","Rory","Jamie","Shaun","Glen","Reece","Jordan","Cole","Mason","Logan","Aiden","Noah","Elijah","Jackson","Sebastian","Carter","Wyatt","Hudson","Landon","Dylan","Caleb","Hunter","Henry","Evan","Max","Leo","Isaac","Ian","Alex","Zach","Connor","Brandon","Austin","Blake","Nate","Cam","Finn","Theo","Oscar","Felix","Charlie","Elliot","Jasper","Rupert","Nigel","Clive","Stuart","Derek","Keith","Alan","Colin","Barry","Trevor","Gerald","Norman","Roger","Donald"];
const SURNAMES_EN=["Smith","Jones","Williams","Brown","Davis","Wilson","Taylor","Johnson","Clarke","Evans","Thomas","Roberts","Walker","White","Hall","Martin","King","Lewis","Harris","Wright","Scott","Young","Turner","Hill","Baker","Allen","Parker","Mitchell","Collins","Edwards","Carter","Wood","Morris","Richardson","Watson","Gray","James","Henderson","Butler","Cooper","Bell","Reed","Bailey","Kelly","Hughes","Stone","Russell","Spencer","Webb","Murray","Campbell","Black","Shaw","Chapman","Ferguson","Hamilton","Graham","Simpson","Harvey","Stevens","Grant","Griffiths","Jenkins","Bradley","Burke","Howard","Mason","Pierce","Foster","Archer","Barker","Bishop","Bolton","Boyd","Brett","Carr","Chambers","Clayton","Cook","Cross","Douglas","Drake","Duncan","Fowler","Garrett","Gibson","Giles","Goodwin","Gordon","Hammond","Hanson","Hart","Hawkins","Hayes","Haynes","Holmes","Hudson","Hunt","Hurley","Hyde","Ingram","Jennings","Kerr","Lamb","Lane","Lawrence","Lawson","Leach","Lloyd","Long","Lynch","Marsh","Marshall","Maxwell","McCarthy","McDonald","McKay","McLean","McMahon","Miles","Mills","Monroe","Morton","Nash","Neal","Nichols","Nixon","O'Brien","O'Connor","O'Neill","Osborne","Owen","Page","Palmer","Parsons","Payne","Pearce","Perkins","Phillips","Porter","Price","Quinn","Ramsey","Reeves","Rhodes","Rice","Rogers","Ross","Savage","Simmons","Sims","Sinclair","Slater","Stanley","Stephens","Stevenson","Stewart","Sutton","Sweeney","Thornton","Tucker","Underwood","Vaughan","Wade","Walsh","Warren","Watts","Weaver","Webster","Welch","West","Wilkins","Windsor"];
const FIRSTNAMES_ES=["Carlos","Miguel","José","Luis","Alejandro","Pedro","Jorge","Sergio","Manuel","Adrián","Javier","David","Pablo","Víctor","Diego","Álvaro","Fernando","Rubén","Raúl","Antonio","Iker","Iñaki","Unai","Dani","Marc","Pau","Gerard","Óscar","Iván","Rafael","Rodrigo","Hugo","Borja","Nicolás","Kepa","Mikel","Jon","Asier","Oier","Endika","Yeray","Kike","Brais","Fran","Santi","Gonzalo","Nacho","Cosme","Paco","Juanmi","Ángel","Emilio","César","Tomás","Ignacio","Enrique","Valentín","Mario","Roberto","Alberto","Marcos","Cristian","Arnau","Aitor","Ander","Ibai","Beñat","Markel","Aritz","Julen","Gorka","Iago","Norberto","Ismael","Kiko","Gaizka","Xacobo","Xoel","Andres","Quique","Pelayo","Toni","Joan","Leandro","Galo","Fermin","Pelegrín","Genaro","Baldo","Cubas","Fortún"];
const SURNAMES_ES=["García","Martínez","López","Sánchez","González","Rodríguez","Hernández","Pérez","Ruiz","Torres","Jiménez","Díaz","Moreno","Álvarez","Romero","Serrano","Molina","Blanco","Castro","Ortiz","Domínguez","Gil","Vargas","Navarro","Ramos","Herrera","Medina","Ibáñez","Cano","Vega","Llorente","Piquer","Busquet","Alonso","Arboleda","Puyal","Juárez","Bartrina","Cazares","Mata","Silva","Villa","Iniestra","Moradas","Aspar","Callejas","Sastre","Soler","Aguilar","Aguirre","Alcalá","Alcázar","Alcántara","Almeida","Alvarado","Andrade","Arias","Arjona","Arroyo","Báez","Ballesteros","Bautista","Bermejo","Bermúdez","Borrego","Bravo","Caballero","Cabello","Cabrera","Calvo","Campos","Cárdenas","Carrasco","Casado","Castellano","Castillo","Castaño","Cifuentes","Cobos","Contreras","Cordero","Correa","Cortés","Crespo","Cruz","Cuartero","Cuesta","De la Fuente","Del Río","Delgado","Durán","Espinosa","Estévez","Esteban","Fernández","Figueroa","Flores","Fuentes","Garrido","Giménez","Guerrero","Gutiérrez","Hidalgo","Hurtado","Iglesias","Lara","León","Lozano","Luna","Marcos","Marín","Mediano","Millán","Miranda","Molero","Montero","Morales","Muñoz","Naranjo","Nieto","Núñez","Ochoa","Ojeda","Olivares","Olmedo","Ortega","Osorio","Palomar","Pena","Peñalver","Prieto","Quesada","Raya","Reyes","Rico","Rivero","Robles","Rojas","Roldan","Rueda","Salazar","Salinas","Salvador","Seoane","Suárez","Tejada","Trujillo","Valero","Vallejo","Vázquez","Vera","Vidal","Zamora","Zapatero"];
const FIRSTNAMES_DE=["Thomas","Michael","Stefan","Andreas","Markus","Klaus","Lukas","Florian","Tobias","Felix","Jan","Kevin","Marco","Niklas","Leon","Jonas","Julian","Simon","Christian","Patrick","Nico","Sven","Tim","Tom","Björn","Lars","Dennis","Kai","René","Jens","Ralf","Bernd","Thorsten","Uwe","Dieter","Armin","Hans","Wolfgang","Bastian","Manuel","Timo","Lennart","Sönke","Robin","Emil","Ulrich","Joshua","Matthias","Mats","Thilo","Erik","Nils","Moritz","Paul","Max","Luca","Noah","Ben","Luis","Elias","David","Alexander","Daniel","Fabian","Sebastian","Maximilian","Dominik","Philipp","Christoph","Benedikt","Johannes","Raphael","Sascha","Jörg","Frank","Heiko","Holger","Stephan","Dirk","Oliver","Torsten","Carsten","Joachim","Werner","Helmut","Kurt","Ernst","Günter","Friedrich","Rudolf","Horst","Willi","Heinz","Gerhard","Konrad","Ingo","Rico","Danny","Tony","Tommy"];
const SURNAMES_DE=["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Hoffmann","Kraus","Koch","Richter","Klein","Wolf","Schröder","Neumann","Schwarz","Zimmermann","Braun","Krüger","Hartmann","Lange","Huber","Schulze","Maier","Walter","Lehmann","Schmitt","Mayer","Herrmann","Kaiser","Fuchs","Lang","Keller","Roth","Frank","Albrecht","Haas","Jung","Möller","Winkler","Brandt","Vogt","Werner","Sommer","Rüdel","Gündel","Drechsel","Kistner","Görlitz","Bauer","Bergmann","Böhm","Brunner","Busch","Conrad","Dittrich","Ebert","Engel","Ernst","Graf","Groß","Günther","Hahn","Hanke","Hartwig","Heinze","Henning","Herzog","Hesse","Hofer","Holm","Horn","Hübner","Jacobi","Janke","Junge","Keil","Kettner","Kirsch","Knapp","Knecht","Knoll","Köhler","König","Körner","Kraft","Kramer","Krebs","Krieger","Kruse","Kühn","Kunz","Kurz","Langer","Lehr","Lindner","Link","Lux","Marx","Metz","Neubert","Neuhaus","Nickel","Nitzsche","Noll","Ott","Peters","Pohl","Rau","Riedel","Rieger","Rohde","Rose","Runge","Sachs","Schäfer","Scharf","Schenk","Schiller","Schmid","Schreiber","Schuh","Schuler","Schulte","Seifert","Siegel","Singer","Spengler","Sperling","Stern","Stock","Strauch","Strube","Theis","Vogel","Voigt","Volkmann","Wahl","Weiss","Wendel","Winter","Witte","Wolff","Wulf","Ziegler","Zimmer"];
const FIRSTNAMES_FR=["Thomas","Nicolas","Antoine","Maxime","Clément","Romain","Hugo","Lucas","Pierre","Mathieu","Alexandre","Guillaume","Julien","Adrien","Baptiste","Kevin","Jonathan","Alexis","Florian","Valentin","Quentin","Augustin","Kamel","Paul","Blaise","Raphaël","Olivier","Benjamin","Wilhem","Loïc","Kléber","Corentin","Moussa","Nabil","Amine","Samir","Yohan","Franck","Djibril","Sidney","Thierry","Zacharie","Patrick","Didier","David","Lenny","Edmond","Vincent","Jordan","Sofiane","Rayan","Wahbi","Reda","Hakim","Azzedine","Bilal","Rachid","Sébastien","Stéphane","Frédéric","Philippe","Christophe","Laurent","Benoît","Eric","Cédric","Damien","François","Jean","Louis","Henri","Charles","Bernard","Michel","Alain","Claude","René","Jacques","Marcel","Gérard","Robert","André","Roger","Maurice","Raymond","Gaston","Fernand","Lucien","Léon"];
const SURNAMES_FR=["Martin","Bernard","Dubois","Thomas","Robert","Richard","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefebvre","Michel","David","Bertrand","Roux","Vincent","Fournier","Morel","Girard","Mercier","Dupont","Lambert","Bonnet","Francois","Legrand","Garnier","Faure","Rousseau","Guerin","Chevalier","Robin","Masson","Gauthier","Perrin","Renaud","Colin","Vidal","Caron","Picard","Roger","Roussel","Brun","Leclerc","Guillaume","Lecomte","Marchand","Dumas","Marie","Noel","Meyer","Dufour","Meunier","Brunet","Blanchard","Giraud","Joly","Riviere","Gautier","Lacroix","Pons","Berger","Royer","Aubert","Charpentier","Renard","Hamon","Gaillard","Barbier","Leduc","Marechal","Buisson","Leblanc","Rey","Maillard","Hubert","Devaux","Carlier","Pasquier","Bigot","Delaunay","Marty","Hardy","Pruvost","Gillet","Etienne","Germain","Tanguy","Lemoine"];
const FIRSTNAMES_PT=["João","Pedro","Rui","Bruno","André","Miguel","Diogo","Tiago","Ricardo","Nuno","Filipe","Luís","Rafael","José","Sérgio","Gonçalo","Carlos","Manuel","Paulo","Fernando","Bernardo","Cristóvão","Rodolfo","Danilo","Pércio","Wilson","Vasco","Plácido","Olavo","Dário","Matheus","Rodrigo","Renato","Prazeres","Domingos","Beto","Gualter","Tristão","Francisco","Hélder","Abel","Rúben","Edgar","Fábio","Belmiro","Mário","Macário","Célio","Godofredo","Serafim","Joel","Aurélio","Hugo","Norberto","Quim","Décio","Salvador","Patrício","Frederico","Edmundo","Romão","Caetano","Bonifácio","Marcelo","Constâncio","Petit","Armando","Agostinho","Eurico","Casimiro","Bento","Faustino","Dimas","Octávio","Vitor","Antonio","Helder","Joao","Alberto","Artur","Augusto","Aurelio","Bettencourt","Duarte"];
const SURNAMES_PT=["Silva","Santos","Ferreira","Pereira","Oliveira","Costa","Rodrigues","Martins","Jesus","Sousa","Carvalho","Lopes","Gomes","Marques","Pinto","Correia","Neves","Pires","Ribeiro","Alves","Dias","Fernandes","Carmona","Gusmão","Galvão","Trindade","Januário","Macedo","Damião","Neto","Severino","Valim","Ramos","Anselmo","Veiga","Moreira","Teixeira","Coelho","Baptista","Figueiredo","Vieira","Castro","Monteiro","Melo","Mendes","Tavares","Abreu","Aguiar","Almada","Amaro","Andrade","Antunes","Araújo","Assunção","Azevedo","Basto","Borges","Bragança","Branco","Brandão","Braz","Brites","Cabral","Campos","Carneiro","Casanova","Coutinho","Cruz","Cunha","Dinis","Domingos","Dourado","Durão","Esteves","Estrada","Faria","Feio","Figueira","Fonseca","Freitas","Gaspar","Gavilha","Gonçalves","Graça","Grosso","Henriques","Horta","Jorge","Lameiras","Leão","Lima","Lobo","Loureiro","Madeira","Magalhães","Maia","Malheiro","Manso","Marcelino","Mata","Medeiros","Miranda","Morais","Moura","Narciso","Nunes","Osei","Pacheco","Padrão","Paiva","Palma","Pedroso","Peixoto","Pena","Pinheiro","Portela","Prata","Queirós","Quintela","Raposo","Rego","Reis","Rocha","Rosa","Rua","Sá","Saraiva","Seabra","Serra","Soares","Taveira","Tomás","Torres","Valente","Vaz","Vicente","Vilar","Xavier"];
const NAME_BY_NAT={
  "🇮🇹":{first:FIRSTNAMES_IT,last:SURNAMES_IT},
  "🏴󠁧󠁢󠁥󠁮󠁧󠁿":{first:FIRSTNAMES_EN,last:SURNAMES_EN},
  "🇪🇸":{first:FIRSTNAMES_ES,last:SURNAMES_ES},
  "🇩🇪":{first:FIRSTNAMES_DE,last:SURNAMES_DE},
  "🇫🇷":{first:FIRSTNAMES_FR,last:SURNAMES_FR},
  "🇵🇹":{first:FIRSTNAMES_PT,last:SURNAMES_PT},
  "🇧🇷":{first:["Thiago","Matheus","Gabriel","Lucas","Vinícius","Caio","Rafinha","Éverton","Wallace","Douglas","Wesley","Anderson","Igor","Yago","Talles","Murilo","Kaique","Davi","Jean","Robson","Maicon","Adriano","Juninho","Renan","Cauã","Emerson","Iago","Wendel","Luan","Breno"],last:["da Silva","dos Santos","Oliveira","Souza","Pereira","Costa","Rodrigues","Almeida","Nascimento","Carvalho","Araújo","Ribeiro","Barbosa","Cardoso","Teixeira","Moreira","Correia","Cavalcanti","Monteiro","Batista","Freitas","Camargo","Sales","Peixoto","Guimarães","Sacramento","Furtado","Vasconcelos","Brandão","Farias"]},
  "🇦🇷":{first:["Mateo","Santiago","Joaquín","Tomás","Facundo","Bautista","Thiago","Lucio","Franco","Ramiro","Nahuel","Gonzalo","Ezequiel","Ignacio","Agustín","Maximiliano","Julián","Emiliano","Lisandro","Valentín","Bruno","Marcos","Alan","Leandro","Cristian","Matías","Gastón","Iván","Damián","Nicolás"],last:["Fernández","González","Rodríguez","López","Martínez","Sosa","Romero","Villagra","Torres","Ruiz","Acosta","Medina","Herrera","Aguirre","Molina","Ortega","Silva","Juárez","Cabrera","Vega","Ledesma","Quiroga","Villalba","Ponce","Chaparro","Bustos","Farías","Ocampo","Peralta","Arce"]},// [5.96.0 DB-2] Brasile/Argentina non pescano più i nomi ITALIANI
  "🇳🇱":{first:["Freek","Victor","Mathijs","Daniël","Mees","Arnoud","Wesselt","Robin","Rafael","Gerwin","Daan","Cas","Xavi","Steven","Nathan","Tyrell","Jurgen","Siem","Nigel","Jelte","Ryan","Marten","Joshua","Luuk","Vincent","Patrick","Luis","Quinten","Jorrit","Barry","Roy","Mark","Rink","Joep","Edgar","Clemens","Thom","Michael","John","Arend","Kees","Dirk","Jan","Sander","Rob","Tom","Paul","Tim","Maarten"],last:["de Jong","Janssen","de Vries","van den Berg","Bakker","Visser","Smit","Meijer","Mulder","Kuiper","van Dale","Vermeer","Post","Hoek","Boer","van der Veen","Roosen","Smeets","van Nieuwkerk","Daniëls","Steenbergen","Gulpen","Rijnders","Klundert","Cremers","Kerkhoffs","van Leeuwen","Boerhave","Oosterhof","Stomp","Brink","van Gelder","Aalbers","Reinders","Wouters","van Brederode","van der Velde","van Duiven","Hooglander","Stroop","Maas","Claassen","Velthuis","Wieringa","Fledderus","Brouwer","Zwart","Kuils","Coolen","Steenbeek","van Buren","Bosman","Verhagen","van der Wal","Veenhuis","Terpstra","Drost","Does","Meerkerk","Tjon"]},
  "🇧🇪":{first:FIRSTNAMES_FR,last:["Martens","Claes","Wouters","Peeters","Janssens","Maes","Jacobs","Leclercq","Fontaine","Dubois","Simon","Herman","Willems","Lemmens","Raes","Hanssen","De Backer","Vermeulen","Coppens","Verhaegen","Aerts","Goossens","Luyckx","Michiels","Claessens","Thys","Charlier","Franssen","Declercq","Nys"]},
  "🇹🇷":{first:["Can","Burak","Serdar","Aras","Emre","Ozan","Hakan","Cengiz","Orkun","Salih","Baris","Kerem","Haluk","Ferdi","Umut","Çağatay","Zeki","Metin","Ufuk","Altay","Mert","Dorukhan","Taylan","Yunus","Kaan","Ahmet","Mehmet","Ali","Mustafa","Murat","Ibrahim","Ismail","Yusuf","Abdullah","Furkan","Berkay","Tolgay","Oguzhan","Cenk","Sinan","Olcan","Gokhan","Nuri","Selcuk","Hamit","Tuncay","Yildiray","Bulent","Nihat"],last:["Yilmaz","Tosun","Arslan","Turan","Demir","Kabakci","Cigerci","Akbas","Ince","Karaman","Sahin","Aydin","Kaya","Kurt","Celik","Soyer","Caliskan","Yazici","Kokmen","Demirhan","Bozok","Yalcin","Akgül","Altinel","Avci","Babacan","Bakirci","Balta","Baysal","Bayrak","Bayram","Bostanci","Cengiz","Ciftci","Colak","Dogan","Dursun","Erkin","Gunes","Guven","Karaca","Karadeniz","Kerimoglu","Kilicarslan","Koybasi","Kucukdeveci","Mustafa","Onder","Onur","Ozbay","Ozdemir","Ozer","Ozturk","Pekel","Polat","Sarı","Simşek","Teber","Tekdemir","Topal","Tore","Turuc","Ucan","Ucal","Ugur","Uluc","Unsal","Uraz","Uzun","Veysel","Volkan","Yildiz","Yuksel","Zengin","Zeybek"]},
};
// ===== Fase 4: Copyright anti-regression validator (centralised, dev-only) =====
// BRANDS: substring scan on club/league/stadium/record fields. PLAYERS: exact-token scan on name pools.
const _CR_BRANDS=["Liverpool","Arsenal","Chelsea","Tottenham","Bournemouth","Juventus","Sevilla","Villarreal","Bayern","Dortmund","Wolfsburg","Leverkusen","Schalke","Galatasaray","Fenerbahçe","Beşiktaş","Bundesliga","Eredivisie","Süper Lig","Primeira Liga","Primera División","Segunda División","Pro League","Serie A","Premier League","Ligue 1","Anfield","Wembley","Camp Nou","Bernabéu","San Siro","Old Trafford","Stamford Bridge","Allianz","Signal Iduna","Maradona","Vélodrome",
  // 5.49.3 — media/competizioni/premi/federazioni reali (giornali + altro): de-branding bloccante
  "Gazzetta dello Sport","Tuttosport","TuttoSport","Corriere dello Sport","Sky Sport","La Repubblica","FootballItalia","Sport24","Champions League","Europa League","Conference League","Golden Boy","FIFA","UEFA",
  // [6.74.0 QA-P0] club reali sfuggiti all'audit (l'ultracode li ha trovati in DB/record): token che NON collidono
  // coi nomi fantasia attuali ("Porto" NON si può bloccare: substring di "FC Portomar")
  "Eindhoven","Sochaux","Bruges","Anderlecht","Brugge","Feyenoord","Ajax","Benfica","Sporting CP","Olympique"];/* "Braga" escluso: substring del cognome PT "Bragança" (falso positivo sui coach) */
const _CR_PLAYERS=["Mbappé","Benzema","Salah","Neymar","Haaland","Cruyff","Hazard","De Bruyne","Lukaku","Lewandowski","Vlahovic","Dybala","Pogba","Zidane","Mbappe","Dzeko","Immobile","Lacazette","Kimmich","Gündogan","Piqué","Busquets","Iniesta","Morata","Cancelo","Moutinho","van Dijk","Robben","Sneijder","Calhanoglu","Soyuncu"];
// [5.96.0 CR-1] combinazioni nome+cognome di calciatori REALI: mai generarle nei roster
//   (i pool restano ricchi di nomi comuni; è la COPPIA a essere bloccata, in generazione e in audit).
const _CR_FULLNAMES=new Set(["thomas müller","timo werner","manuel neuer","marco reus","toni kroos","leon goretzka","joshua kimmich","sergio ramos","marcos alonso","david silva","fernando torres","marcos llorente","nacho fernández","sergio busquets","jordan henderson","kyle walker","luke shaw","aaron ramsey","dean henderson","harry kane","jack grealish","cenk tosun","nuri sahin","hamit altintop","altay bayindir","salih ucan","mert gunok","yusuf yazici","hakan calhanoglu","mark van bommel","steven berghuis","luuk de jong","vincent janssen","memphis depay","frenkie de jong","virgil van dijk","bruno fernandes","rúben dias","bernardo silva","rafael leão","nuno mendes","andré silva","joão félix","diogo jota","kevin de bruyne","eden hazard","romelu lukaku","kylian mbappé","antoine griezmann","olivier giroud","lautaro martínez","julián álvarez","lisandro martínez","emiliano martínez","gabriel jesus","vinícius júnior"]);
function _auditCopyrightSafety(){
  const hits=[];
  const subScan=(label,arr)=>{(arr||[]).forEach(s=>{const t=typeof s==="string"?s:((s&&(s.n||s.name||s.club))||"");if(!t)return;_CR_BRANDS.forEach(b=>{if(t.indexOf(b)>=0)hits.push(label+": \""+t+"\" ~ "+b);});});};
  const eqScan=(label,arr)=>{(arr||[]).forEach(t=>{if(typeof t!=="string")return;if(_CR_PLAYERS.indexOf(t)>=0)hits.push(label+": \""+t+"\"");});};
  try{
    subScan("CLUB",CLUBS.map(c=>c.n)); subScan("LEAGUE",[...new Set(CLUBS.map(c=>c.lg))]);
    Object.values(EURO_COMP_WINNERS||{}).forEach(a=>subScan("EURO",a.map(x=>x.club)));
    Object.entries(LEAGUE_RECORDS||{}).forEach(([k,v])=>{subScan("REC_KEY",[k]);subScan("REC",[v.allTimeScorer,v.seasonRecord]);});
    Object.values(NAME_BY_NAT||{}).forEach(o=>{eqScan("FIRST",o.first);eqScan("LAST",o.last);});
    // 5.49.3 — giornali/media: scan delle testate (NEWSPAPERS) e dei giornali dei giornalisti (JOURNALIST_POOL) contro i brand reali
    if(typeof NEWSPAPERS!=="undefined")subScan("NEWS",NEWSPAPERS.map(n=>n.name+" "+(n.short||"")));
    if(typeof JOURNALIST_POOL!=="undefined")subScan("JOURNO",JOURNALIST_POOL.map(j=>j.paper));
    // [5.96.0 CR-1] scope ESTESO: stadi (pool+assegnazioni+U18), allenatori, e ROSTER GENERATI
    //   contro le combinazioni full-name (prima il gate era cieco: «Stade Vélodrome B» era assegnato in-game)
    if(typeof STADIUMS!=="undefined")subScan("STADIUM",[...STADIUMS,...STADIUM_POOLS.flatMap(sp=>sp.s),...Object.values(CLUB_STADIUMS)]);
    if(typeof COACH_NAMES!=="undefined"){subScan("COACH",COACH_NAMES);eqScan("COACH",COACH_NAMES);}
    /* [7.298.0 domanda PO «le iniziali possono essere quelle delle squadre reali? o c'e' rischio copyright?»]
       LE SIGLE. L'audit guardava solo i NOMI: il campo `a` (la sigla sullo stemma, visibile in ogni classifica,
       tabellone e calendario) non lo scansionava nessuno — quindi un club con nome di fantasia poteva mostrare
       la sigla della squadra VERA e il gate restava verde a zero hit. Non e' teoria: e' successo due volte, sui
       77 club del 7.263.0 e su altri 60 rimasti nelle seconde divisioni (H96 di Hannover, KSC, TSG, PNE, STK…
       e perfino DDR su Dresda). Qui la regola e' STRUTTURALE e non ha liste da mantenere aggiornate: la sigla
       dev'essere ricavabile dal NOME MOSTRATO, cioe' esserne una sottosequenza di lettere. Se non lo e', viene
       da un'altra parte — ed e' esattamente il caso da bloccare. */
    {const _nrm=t=>String(t||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
     CLUBS.forEach(c=>{const ab=_nrm(c.a),nm=_nrm(c.n);let i=0,ok=!!ab;
       for(const ch of ab){i=nm.indexOf(ch,i);if(i<0){ok=false;break;}i++;}
       if(!ok)hits.push("SIGLA: \""+(c.a||"")+"\" non deriva dal nome mostrato \""+(c.n||"")+"\"");});}
    if(typeof _CR_FULLNAMES!=="undefined"&&typeof generateTeamRoster==="function"){
      CLUBS.forEach(c=>{for(let se=1;se<=2;se++){generateTeamRoster(c,se).forEach(pl=>{if(_CR_FULLNAMES.has(pl.name.toLowerCase()))hits.push("ROSTER-FULLNAME ("+c.id+" S"+se+"): \""+pl.name+"\"");});}});
    }
  }catch(e){console.warn("[ELEVORA-COPYRIGHT] audit error",e);}
  if(hits.length)console.warn("[ELEVORA-COPYRIGHT] "+hits.length+" potential real-world reference(s):\n"+hits.join("\n"));
  else console.log("[ELEVORA-COPYRIGHT] OK — no blocklisted references.");
  return hits;
}
if(typeof window!=="undefined"){window._auditCopyright=_auditCopyrightSafety;try{if(localStorage.getItem("cpm-debug")==="1")_auditCopyrightSafety();}catch(e){}}
function hashStr(s){let h=5381;for(let i=0;i<s.length;i++){h=((h<<5)+h)^s.charCodeAt(i);h=h>>>0;}return h;}
function generateTeamRoster(club,season){
  const nat=club?.nat||"🇮🇹";
  const names=NAME_BY_NAT[nat]||NAME_BY_NAT["🇮🇹"];
  // 11 titolari + 12 panchina = 23 giocatori
  const roles=[
    "Portiere","Difensore","Difensore","Terzino","Terzino","Mediano","Centrocampista","Trequartista","Ala","Ala","Centravanti",
    "Portiere","Difensore","Difensore","Terzino","Mediano","Centrocampista","Mezzala","Ala","Centravanti","Attaccante","Jolly","Under-21"
  ];
  // [7.8.16 collaudo tester «la rosa cambia COMPLETAMENTE ogni stagione? è sbagliato, nel mercato ci sono movimenti
  //   ma non tutta la squadra»] prima il seed includeva la STAGIONE → ogni anno TUTTI i 23 nomi cambiavano (rosa
  //   nuova di zecca). Ora il seed è dal SOLO club → la rosa è STABILE nel tempo; il mercato muove POCHI elementi:
  //   ogni slot "cambia giocatore" ogni ~7 stagioni con una fase sfalsata (`_gen`), così ~3 movimenti a stagione
  //   (23/7) e un giocatore resta in media ~7 anni. Deterministico e save-safe (la rosa è derivata, non salvata).
  const base=hashStr(club?.id||club?.n||"x");
  const firstPool=seededShuffle([...names.first],base);
  const lastPool=seededShuffle([...names.last],base^0x9E3779B9);
  const ss=Math.max(1,season||1),_TEN=7;/* anni medi di permanenza in uno slot */
  return roles.map((role,i)=>{
    const _ph=Math.abs(hashStr((club?.id||"x")+"_ph_"+i))%_TEN;// fase d'ingaggio dello slot (sfalsa i rinnovi)
    const _gen=Math.floor((ss+_ph)/_TEN);// "generazione" del titolare dello slot: cambia solo ogni ~7 stagioni
    const _off=_gen*13;// offset nel pool → nome diverso SOLO quando cambia la generazione (mercato), altrimenti stabile
    const _fn=firstPool[(i+_off)%firstPool.length];let _ln=lastPool[(i+_off)%lastPool.length];
    if(typeof _CR_FULLNAMES!=="undefined"&&_CR_FULLNAMES.has((_fn+" "+_ln).toLowerCase()))_ln=lastPool[(i+_off+7)%lastPool.length];// [5.96.0 CR-1] mai un nome+cognome di calciatore reale in rosa
    return{name:`${_fn} ${_ln}`,role};});
}
function seededShuffle(arr,seed){
  const a=[...arr];let s=(seed*1664525+1013904223)>>>0;
  for(let i=a.length-1;i>0;i--){s=(s*1664525+1013904223)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
// calendar-driven match scheduling — 34 matchdays (18 clubs), 4 rest weeks spread evenly
const _CAL_BREAKS=new Set([7,16,24,30]); // after these 0-based indices → 1 extra rest week
function generateSeasonCalendar(playerClub,leagueClubs,seed){
  if(!playerClub||!leagueClubs?.length)return[];
  const opps=leagueClubs.filter(c=>c.id!==playerClub.id&&c.n!==playerClub.n);
  if(!opps.length)return[];
  const s=seed||1;
  // [6.52.0 collaudo PO «due partite ravvicinate con la stessa squadra! il calendario deve essere realistico e
  //   ragionato»] ANDATA/RITORNO SPECULARE (mirrored double round-robin), come i campionati veri: un UNICO ordine
  //   di avversari; il girone di RITORNO ripete lo stesso ordine con le SEDI invertite → ogni squadra si affronta
  //   a distanza ESATTA di N giornate (mai più due gare ravvicinate col medesimo avversario). Prima due shuffle
  //   INDIPENDENTI (home/away) lasciavano cadere andata e ritorno a poche giornate (es. FC Balear a W16 e W18).
  //   Sedi in stretta alternanza per leg → zero soste-sede innaturali + bilanciamento casa/trasferta esatto.
  const ord=seededShuffle([...opps],s);
  const N=ord.length;
  const startHome=(Math.abs(hashStr('venue'+s))%2)===0;// varietà seedata del pattern di partenza
  const all=[];
  for(let i=0;i<N;i++){const home=((i%2)===0)?startHome:!startHome;all.push({opp:ord[i],isHome:home});}     // ANDATA (giornate 1..N)
  for(let i=0;i<N;i++){const home=((i%2)===0)?startHome:!startHome;all.push({opp:ord[i],isHome:!home});}    // RITORNO (giornate N+1..2N, sedi invertite)
  const cal=[];let week=1;
  for(let i=0;i<all.length&&week<=38;i++){
    cal.push({matchday:i+1,week,opponentId:all[i].opp.id,opponentName:all[i].opp.n||all[i].opp.name,isHome:all[i].isHome,played:false,result:null});
    week+=1+(_CAL_BREAKS.has(i)?1:0);
  }
  return cal;
}
// ===== Sprint 49/134: Season Awards Generator =====
/* [7.8.28 QA] gol/assist di SOLA LEGA dalla matchHistory stagionale (entry cup/euro flaggate): player.goals somma
   TUTTE le competizioni → gonfiava classifica marcatori di lega, capocannoniere, MVP e record di lega con gol di
   coppa (doppio conteggio vs le classifiche per competizione 7.8.18). Fallback: history vuota ⇒ player.goals. */
/* [7.120.0 audit economia] fallback a player.goals SOLO se matchHistory è del tutto vuota (save vecchio senza
   storico); se ci sono gare ma NESSUNA di lega (es. 1ª gara post-trasferimento è una coppa → matchHistory=[{cup}])
   ritorna 0, altrimenti gonfiava i gol di lega col gol di coppa. */
/* [7.272.0 collaudo PO «non sono 50 partite da professionista, le partite in primavera non devono
   rientrare nel conteggio»] Le presenze GIOVANILI finivano nei totali di carriera e da li' nei testi che
   parlano esplicitamente di professionismo (il traguardo delle 50 partite, la biografia del ritiro). Qui
   si scorporano: le stagioni in Primavera si riconoscono dal nome del club salvato nello storico (i club
   giovanili sono «<club> Primavera», vedi U18_CLUBS) e, se sei ancora in Primavera, anche la stagione in
   corso e' giovanile. Derivato, nessun campo nuovo, nessun bump SAVE. */
const _isYouthClubName=(n)=>/\bPrimavera\b|\bU18\b/i.test(String(n||""));
const proCareerOf=(p)=>{try{
  const h=(p&&p.history)||[];
  let ym=0,yg=0,ya=0,ys=0;
  h.forEach(x=>{if(x&&_isYouthClubName(x.club)){ym+=x.matches||0;yg+=x.goals||0;ya+=x.assists||0;ys++;}});
  const u18=(p&&(p.proStatus||"u18")==="u18");
  if(u18){ym+=(p.matches||0);yg+=(p.goals||0);ya+=(p.assists||0);}
  return{matches:Math.max(0,((p&&p.totalMatches)||0)-ym),goals:Math.max(0,((p&&p.totalGoals)||0)-yg),
    assists:Math.max(0,((p&&p.totalAssists)||0)-ya),seasons:Math.max(0,Math.max(0,((p&&p.season)||1)-1)-ys)};
}catch(_e){return{matches:(p&&p.totalMatches)||0,goals:(p&&p.totalGoals)||0,assists:(p&&p.totalAssists)||0,seasons:Math.max(0,((p&&p.season)||1)-1)};}};
/* [7.293.0 #118] Il bilancio della stagione GIA' GIOCATA con un'altra maglia (`seasonCarry`, scritto da
   `acceptTransfer`): lo storico partite riparte da zero col club nuovo, questi due sono i CHOKEPOINT che
   definiscono «gol/assist di campionato in questa stagione» — sommando qui il travaso, capocannonieri, MVP,
   premi, record watch, duello e aspettative vedono la stagione INTERA con una sola riga a testa. */
const _scOf=(p)=>{const c=p&&p.seasonCarry;if(!(c&&c.season===(p.season||1)))return null;
  if(c.lgName&&p.club&&p.club.lg&&c.lgName!==p.club.lg)return{...c,lg:0,la:0};/* [7.336.0] difesa in profondità: se la lega del carry non è quella del club corrente, il travaso di lega non conta (gli spells restano per il display) */
  return c;};
/* [7.336.0 collaudo PO «vengono conteggiati anche i gol con la primavera... la cosa più assurda e grave è il
   pallone d'oro!!!!!!»] IL TRAVASO CONOSCE LA LEGA. Il bilancio-stagione che segue il giocatore nel cambio di
   maglia (7.293) sommava i gol di LEGA della maglia precedente QUALUNQUE fosse la lega — compresa la PRIMAVERA
   del primo contratto pro firmato a metà stagione: il capocannoniere/MVP/record della lega pro si trovavano in
   pancia i gol del campionato giovanile (screenshot PO: 30 «gol di lega» alla S.1, in gran parte U18 → tutti i
   premi del gala). Come nei campionati veri: gennaio nella STESSA lega somma, cambiare campionato azzera il
   conteggio del capocannoniere. Gli spells restano completi (display «con la maglia precedente» + obiettivi
   pro-rata leggono quelli, non lg/la); il carry ricorda la lega di destinazione (`lgName`) e _scOf la verifica. */
const buildSeasonCarry=(p,newClub)=>{
  const _pSC=(p.seasonCarry&&p.seasonCarry.season===(p.season||1))?p.seasonCarry:null;
  const _pSp=(_pSC&&_pSC.spells)||[];
  const _sum=(k)=>_pSp.reduce((x,y)=>x+(y[k]||0),0);
  const _mhLg=(p.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national);
  const _sameLg=!!(p.club&&newClub&&p.club.lg===newClub.lg&&(p.proStatus||"u18")==="pro");
  const _prevOk=_pSC&&(!_pSC.lgName||_pSC.lgName===(newClub&&newClub.lg));
  /* [7.538.0 collaudo PO «e i gol con l'altra squadra non li conti. errore anche gala della classifica
     capocannonieri»] IL CAPOCANNONIERE DI LEGA E QUELLO D'EUROPA NON SONO LO STESSO NUMERO.
     `lg` e' il travaso per la classifica DELLA PROPRIA LEGA e resta a zero quando si cambia campionato:
     e' corretto (7.336) — chi arriva dall'Eredivisie non porta i suoi gol nella classifica di Lega A, e
     nel salvataggio del PO gli 8 gol del duello capocannoniere sono giusti. Ma i premi EUROPEI (Re dei
     Bomber, Trofeo d'Oro) confrontano l'intera stagione europea, e li' i 26 gol segnati prima del
     trasferimento CONTANO: la classifica europea mostrava 8 invece di 34. `lgAll` e' quel secondo numero —
     gol di LEGA di ogni maglia della stagione, indipendentemente dal campionato — scritto qui una volta e
     letto da `euroSeasonGoalsOf`. `lg` NON cambia: nessuna classifica di lega si muove. */
  const _lgAllPrev=_pSC?((_pSC.lgAll!=null)?_pSC.lgAll:(_pSC.lg||0)):0;
  const _laAllPrev=_pSC?((_pSC.laAll!=null)?_pSC.laAll:(_pSC.la||0)):0;
  const _proNow=(p.proStatus||"u18")==="pro";/* la Primavera non entra in Europa (invariante 7.336) */
  return{season:p.season||1,lgName:(newClub&&newClub.lg)||null,
    lg:_sameLg?((_prevOk?(_pSC.lg||0):0)+_mhLg.reduce((x,m)=>x+(m.goals||0),0)):0,
    la:_sameLg?((_prevOk?(_pSC.la||0):0)+_mhLg.reduce((x,m)=>x+(m.assists||0),0)):0,
    lgAll:_lgAllPrev+(_proNow?_mhLg.reduce((x,m)=>x+(m.goals||0),0):0),
    laAll:_laAllPrev+(_proNow?_mhLg.reduce((x,m)=>x+(m.assists||0),0):0),
    spells:[..._pSp,{n:(p.club&&p.club.n)||"",g:Math.max(0,(p.goals||0)-_sum("g")),a:Math.max(0,(p.assists||0)-_sum("a")),m:Math.max(0,(p.matches||0)-_sum("m"))}]};};
const leagueGoalsOf=(p)=>{const c=_scOf(p),h=(p.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national);/* [7.115.0 audit · +!m.national] trappola latente: se un risultato di Nazionale entrasse in matchHistory di club gonfierebbe il capocannoniere/MVP di lega */
  if(h.length)return (c?(c.lg||0):0)+h.reduce((s,m)=>s+(m.goals||0),0);
  if(c)return c.lg||0;/* appena trasferito: lo storico e' vuoto, contano solo i gol travasati (non `p.goals`, che include coppe ed Europa) */
  return (p.matchHistory||[]).length?0:(p.goals||0);};
/* [7.538.0] LA STAGIONE EUROPEA. Somma i gol di LEGA di TUTTE le maglie vestite quest'anno (non solo di
   quella attuale): e' il numero che serve al Re dei Bomber e al Trofeo d'Oro, dove il campo di gara e'
   l'Europa e non un singolo campionato. Su `leagueGoalsOf` non si tocca niente.
   ⚠️ SALVATAGGI GIA' IN CORSO: `lgAll` nasce oggi, quindi per una carriera gia' a stagione inoltrata al
   momento dell'aggiornamento non esiste. In quel caso — e SOLO in quello — si ripiega sul totale dello
   spell precedente (`spells[].g`, che include coppe ed Europa): e' una STIMA PER ECCESSO, dichiarata,
   perche' la ripartizione lega/coppe della maglia precedente non e' mai stata salvata e inventarla sarebbe
   peggio che approssimarla in modo trasparente. Dalla prossima cessione il numero e' esatto. */
const euroSeasonGoalsOf=(p)=>{try{
  const c=(p&&p.seasonCarry&&p.seasonCarry.season===(p.season||1))?p.seasonCarry:null;
  const h=(p.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national);
  const _qui=h.reduce((s,m)=>s+(m.goals||0),0);
  if(!c)return h.length?_qui:(p.goals||0);
  let _prima=c.lgAll;
  if(_prima==null){const sp=c.spells||[];_prima=sp.slice(0,Math.max(0,sp.length-1)).reduce((s,x)=>s+(x.g||0),0)||(c.lg||0);}
  return _prima+(h.length?_qui:0);
}catch(_e){return (typeof leagueGoalsOf==="function")?leagueGoalsOf(p):(p.goals||0);}};
const euroSeasonAssistsOf=(p)=>{try{
  const c=(p&&p.seasonCarry&&p.seasonCarry.season===(p.season||1))?p.seasonCarry:null;
  const h=(p.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national);
  const _qui=h.reduce((s,m)=>s+(m.assists||0),0);
  if(!c)return h.length?_qui:(p.assists||0);
  let _prima=c.laAll;
  if(_prima==null){const sp=c.spells||[];_prima=sp.slice(0,Math.max(0,sp.length-1)).reduce((s,x)=>s+(x.a||0),0)||(c.la||0);}
  return _prima+(h.length?_qui:0);
}catch(_e){return (typeof leagueAssistsOf==="function")?leagueAssistsOf(p):(p.assists||0);}};
const leagueAssistsOf=(p)=>{const c=_scOf(p),h=(p.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national);
  if(h.length)return (c?(c.la||0):0)+h.reduce((s,m)=>s+(m.assists||0),0);
  if(c)return c.la||0;
  return (p.matchHistory||[]).length?0:(p.assists||0);};
/* [7.294.0 direttiva PO «anche obiettivo seconda squadra»] GLI OBIETTIVI SONO DEL CLUB, LA STAGIONE E' TUA.
   Col 7.293.0 la stagione non si azzera piu' cambiando maglia — giusto per record, classifiche e premi, ma
   produceva un effetto collaterale: arrivando a gennaio con 43 gol l'obiettivo del club NUOVO («Segna 19 gol»)
   risultava centrato prima ancora di scendere in campo. Ora il club che ti ingaggia a stagione in corso ti
   chiede quel che puoi fare DA QUI IN POI: al trasferimento il bersaglio si riscala sulle giornate rimaste e
   l'obiettivo diventa `clubScoped`, cioe' misurato sulla produzione con QUESTA maglia (totale di stagione meno
   quanto gia' fatto con le precedenti — i numeri per spell li ha `seasonCarry`). Le classifiche restano
   integrali. `objCurrent` e' l'UNICO punto che dice «a che punto sono»: lo usano cruscotto, verdetto di fine
   stagione, promessa d'apertura, presidente e le notifiche di traguardo, cosi' non possono divergere. */
const _objSpent=(p)=>{const c=p&&p.seasonCarry;if(!c||c.season!==(p.season||1))return{g:0,a:0,m:0};
  const sp=c.spells||[];return{g:sp.reduce((s,x)=>s+(x.g||0),0),a:sp.reduce((s,x)=>s+(x.a||0),0),m:sp.reduce((s,x)=>s+(x.m||0),0)};};
const objCurrent=(obj,tot,spent,pos)=>{const b=(obj&&obj.clubScoped)?(spent||{g:0,a:0,m:0}):{g:0,a:0,m:0};
  return obj.type==="goals"?Math.max(0,(tot.g||0)-(b.g||0))
    :obj.type==="assists"?Math.max(0,(tot.a||0)-(b.a||0))
    :obj.type==="matches"?Math.max(0,(tot.m||0)-(b.m||0)):pos;};
const objDone=(obj,cur)=>obj.type==="standing"?cur<=obj.target:cur>=obj.target;
/* [7.296.0 collaudo PO «obiettivi personali non allineati con la stessa logica al cambio club»] La quota di
   stagione giocata con la maglia ATTUALE, in UN solo criterio: giornate di campionato dell'eroe su giornate
   del suo club. La usano il bersaglio degli obiettivi di club e quello dei personali, cosi' non possono
   divergere — nello screenshot il club chiedeva «9 gol col nuovo club» (centrato) mentre lo stesso cruscotto,
   due centimetri sotto, misurava il record personale su 49 gol pieni contando solo i 14 di questa maglia.
   Vale SOLO a stagione spezzata da un trasferimento (`clubScoped`): chi resta tutto l'anno non viene toccato,
   e nemmeno chi salta mezza stagione per infortunio — quello non e' un cambio di maglia. */
const seasonSplitShare=(p)=>{try{
  if(!p||(p.proStatus||"u18")!=="pro"||!p.club)return 1;
  if(!((p.seasonObjectives||[]).some(o=>o&&o.clubScoped)))return 1;
  const mh=(p.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national).length;
  const row=[...(p.standings||[])].find(t=>t&&(t.id===p.club.id||(t.n||t.name)===p.club.n));
  const pl=(row&&row.played)||0;
  if(!(pl>0)||!(mh>0)||mh>=pl)return 1;
  return clamp(mh/pl,0.2,1);
}catch(_e){return 1;}};
/* [7.285.0 #108 collaudo PO «18 a 1 in che senso? dopo la prima giornata ha gia' fatto 18 gol??»] I GOL DEL
   RIVALE MATURANO DURANTE LA STAGIONE. `rival.goals` era scritto UNA volta sola, al rollover (`rng(7,20)`, per
   giunta scollegato dal suo valore): durante l'anno restava fermo sul totale della stagione PRECEDENTE, mentre
   chi lo leggeva lo confrontava coi gol di QUESTA — da cui il «18 a 1» alla terza giornata. Ora il conto e'
   DERIVATO settimana per settimana dalle giornate realmente giocate, con un ritmo che dipende dal suo OVR
   (il rivale forte segna di piu': prima era un dado), e il rollover archivia esattamente il totale maturato —
   quindi cio' che si legge in corsa e cio' che finisce nell'albo coincidono per costruzione. Puro/seedato,
   monotono, nessun campo salvato nuovo. */
/* [7.288.0 collaudo PO «alla vittoria matematica del campionato ci devono essere grandi festeggiamenti!» +
   «i festeggiamenti 3D non li ho mai visti, il festeggiamento deve essere anche in 2D nella dashboard»]
   LA MATEMATICA, DERIVATA DALLA CLASSIFICA VERA. La cerimonia 3D (7.2.0) esiste dal 7.2.0 ma vive DENTRO
   `LiveMatch`: la festa parte solo se, DOPO che il titolo e' aritmeticamente certo, giochi ancora una gara
   DAL VIVO. Ed e' proprio la gara che nessuno gioca — a titolo vinto le ultime giornate si simulano, e sul
   percorso simulato `titleStakesRef` viene azzerato apposta. Risultato: la festa poteva non arrivare mai.
   Questa funzione dice se il primo posto (o, in seconda divisione, la promozione) e' IRRAGGIUNGIBILE dagli
   altri con le giornate che restano, e non dipende da come risolvi la settimana: la usa la card 2D della
   dashboard, che parte su OGNI percorso. La cerimonia 3D resta, come premio in piu' a chi scende in campo. */
/* [7.291.0] «Eliminato al Ottavi di Finale» non e' italiano: la preposizione dipende dal turno. */
function _roundPrep91(r){const t=String(r||"");
  if(/^Ottavi/i.test(t))return"agli "+t;
  if(/^Quarti/i.test(t))return"ai "+t;
  if(/^Semifinal/i.test(t))return"in "+t;
  if(/^Finale/i.test(t))return"in "+t;
  return"al "+t;}
function titleClinchedNow(p){try{
  if(!p||(p.proStatus||"u18")!=="pro"||!p.club)return null;
  const st=p.standings||[];if(st.length<2)return null;
  const cal=(p.calendar||[]).filter(m=>m&&(!m.type||m.type==="league"));
  const leagueN=cal.length;if(!leagueN)return null;
  const mine=st.find(c=>c&&(c.id===p.club.id||(c.n||c.name)===(p.club.n||p.club.name)));
  if(!mine)return null;
  const rem=Math.max(0,leagueN-(mine.played||0));/* giornate ancora da giocare */
  const others=st.filter(c=>c!==mine),myPts=mine.pts||0;
  const second=others.reduce((m,o)=>Math.max(m,o.pts||0),0);
  const _pair=LEAGUE_PAIRS.find(([u,l])=>l===(p.club.lg));/* seconda divisione: vincerla vale anche la PROMOZIONE */
  if(others.length&&others.every(o=>myPts>(o.pts||0)+3*rem))return{kind:"title",name:p.club.lg||"Campionato",promoTo:_pair?_pair[0]:null,gap:myPts-second,rem};
  if(_pair&&others.filter(o=>(o.pts||0)+3*rem>myPts).length<=2)return{kind:"promo",name:_pair[0],gap:myPts-second,rem};
  return null;
}catch(_e){return null;}}
function rivalSeasonGoals(p,opts){try{
  const r=p&&p.rival;if(!r||!r.name)return 0;
  const cal=(p.calendar||[]).filter(m=>m&&!m.type);
  const M=Math.max(1,cal.length||34);
  const played=(opts&&opts.full)?M:Math.max(0,Math.min(M,cal.length?cal.filter(m=>m.played).length:Math.round((((p.week||1)-1)*M)/38)));
  const ovr=r.ovr||70;
  const rate=clamp(0.30+(ovr-70)*0.012,0.16,0.62);/* ~6 gol a OVR 60 · ~10 a 70 · ~16 a 85 su 34 giornate */
  const p2=Math.round(1000*rate*0.11),p1=Math.round(1000*rate*0.78);/* attesa per giornata = rate */
  const seed=(r.name||"r")+"|"+(p.season||1)+"|"+ovr;
  /* ⚠️ `hashStr(seed+"|md"+k)%1000` su indici ADIACENTI e' CLUSTERATO (misurato: 34 giornate tutte fra 188 e
     471) → senza avalanche il rivale segnava un gol a ogni singola giornata. Stessa trappola del 7.174.0 sui
     nomi degli ultras: `_mix32` decorrela i bucket. */
  const _rr=(k)=>{const v=hashStr(seed+"|md"+k);return((typeof _mix32==="function")?_mix32(v):Math.abs(v))%1000;};
  let g=0;for(let k=1;k<=played;k++){const h=_rr(k);if(h<p2)g+=2;else if(h<p2+p1)g+=1;}
  return g;
}catch(_e){return (p&&p.rival&&p.rival.goals)||0;}}
function generateSeasonAwards(player, finalStandings){
  const lg=player.club?.lg||"Lega A";
  let lgRec=LEAGUE_RECORDS[lg]||_LR_DEFAULT;
  // [6.74.0 QA-24] i record di lega battuti dal giocatore vengono PERSISTITI (player.leagueRecordOverrides):
  // prima il confronto leggeva sempre la costante → «Record stagionale battuto!» rigenerato OGNI stagione
  // sopra la soglia statica anche se il vero primatista eri già tu con un numero più alto.
  const _lrOvr74=(player.leagueRecordOverrides||{})[lg];
  if(_lrOvr74&&_lrOvr74.goals>(lgRec.seasonRecord?.goals||0))lgRec={...lgRec,seasonRecord:{name:_lrOvr74.name,goals:_lrOvr74.goals,club:_lrOvr74.club,season:_lrOvr74.season}};
  const myGoals=leagueGoalsOf(player);/* [7.8.28 QA] premi di LEGA su gol di LEGA (i candidati sono stimati sulle sole gare di lega) */
  const myAssists=leagueAssistsOf(player);
  const myOvr=player.ovr||60;
  const isChampion=finalStandings?.length>0&&(finalStandings[0]?.id===player.club?.id||finalStandings[0]?.n===player.club?.n);
  const leaguePrestige=player.club?.p||65;
  const season=player.season||1;
  const _h=n=>Math.abs(hashStr(lg+"_"+season+"_"+n))%100;

  // Sprint 134: names from real club rosters (deterministic via generateTeamRoster)
  const _clubFwd=(club,seedStr)=>{
    if(!club)return null;
    const roster=generateTeamRoster(club,season);
    const fwdRoles=["Centravanti","Attaccante","Ala","Trequartista"];
    const fwds=roster.filter(p=>fwdRoles.includes(p.role));
    const si=Math.abs(hashStr(seedStr))%(fwds.length||roster.length);
    return(fwds.length?fwds[si]:roster[si])?.name||roster[0]?.name||null;
  };
  const _clubYoung=(club,seedStr)=>{
    if(!club)return null;
    const roster=generateTeamRoster(club,season);
    return(roster.find(p=>p.role==="Under-21")||roster[roster.length-1])?.name||null;
  };

  // === PREMI DI LEGA ===

  // 1. Capocannoniere della lega — [7.9.2 collaudo PO, screenshot «premiato capocannoniere ma in classifica ero 5°»]
  //   i candidati del premio sono ORA la STESSA classifica marcatori vista in stagione (generateLeagueScorers a W38:
  //   stessi seed → stessi nomi/club/gol della tabella Capocannonieri), non più un generatore parallelo che inventava
  //   6 rivali con altra formula → il premio è coerente PER COSTRUZIONE con ciò che l'utente ha visto tutto l'anno.
  const allLeagueScorers=(typeof generateLeagueScorers==="function"?generateLeagueScorers(player,{week:38,fullClub:true,all:true}):[])
    .filter(Boolean);
  if(!allLeagueScorers.some(s=>s.isPlayer))allLeagueScorers.push({name:player.name,goals:myGoals,club:player.club?.n,isPlayer:true}),allLeagueScorers.sort((a,b)=>b.goals-a.goals);
  const playerLeagueScorerPos=allLeagueScorers.findIndex(s=>s.isPlayer);
  const playerWinsLeagueTopScorer=playerLeagueScorerPos===0;

  // 2. MVP della Stagione (miglior calciatore del campionato)
  // [6.8.2 FIX PO «non credo di averlo meritato, rivedi i criteri»] la PRODUZIONE (gol+assist) domina; l'OVR è
  //   solo un modificatore. Prima l'OVR pesava troppo (×0.40) e quello dei candidati era sottostimato → un 7° in
  //   classifica marcatori con 23 gol e OVR alto batteva i capocannonieri da 33-34 gol. Ora vince chi produce di
  //   più, con GUARDIA DURA: l'eroe è MVP solo se ha il punteggio migliore E la sua produzione regge il confronto.
  const _mvpScore=(g,a,ovr,champ)=>(g*2.0)+(a*1.3)+((clamp(ovr,50,99)-70)*0.35)+(champ?7:0);
  const playerMvpScore=_mvpScore(myGoals,myAssists,myOvr,isChampion);
  //   i candidati MVP restano i VERI capocannonieri del campionato (stessi nomi/gol del pannello capocannoniere).
  const simLeagueMvp=allLeagueScorers.filter(sc=>!sc.isPlayer).slice(0,3).map((sc,i)=>{
    const cOvr=clamp(leaguePrestige+Math.round((_h(i*13+7)%14)-3),68,96);
    const cAssists=Math.round(_h(i*7+4)%8)+2;
    const cChamp=i===0&&!isChampion;
    return{name:sc.name,club:sc.club,ovr:cOvr,goals:sc.goals,assists:cAssists,score:_mvpScore(sc.goals,cAssists,cOvr,cChamp)};
  });
  const allLeagueMvp=[...simLeagueMvp,{name:player.name,club:player.club?.n,ovr:myOvr,goals:myGoals,assists:myAssists,score:playerMvpScore,isPlayer:true}]
    .sort((a,b)=>b.score-a.score);
  // GUARDIA produzione: l'eroe vince l'MVP solo se è primo per punteggio, ha una produzione minima reale, e i suoi
  //   (gol+assist) sono entro 3 dal miglior candidato OPPURE è lui il capocannoniere. Blocca il caso «7° in classifica
  //   marcatori ma MVP grazie all'OVR».
  const _mvpTopContrib=Math.max(0,...simLeagueMvp.map(c=>(c.goals||0)+(c.assists||0)));
  const playerWinsLeagueMvp=allLeagueMvp[0].isPlayer&&myOvr>=70&&(myGoals>=12||myAssists>=12)&&((myGoals+myAssists)>=_mvpTopContrib-3||playerWinsLeagueTopScorer);

  // 3. Giovane dell'Anno della lega (U23)
  const isYoung=(player.age||17)<=23;
  const youngLgClub=finalStandings?.[Math.abs(_h(88))%Math.max(1,Math.min(5,finalStandings?.length||1))];
  const youngLgName=(youngLgClub?_clubYoung(youngLgClub,`lgyoung_${season}`):null)||lgRec.topScorers?.[2]?.name||"Giovane Talento";
  const youngLgGoals=Math.max(6,Math.round(_h(88)%9+6));
  const youngLgAssists=Math.round(_h(55)%7)+2;
  // [7.120.0 audit economia] premio COMPARATIVO come MVP/capocannoniere (prima soglia ASSOLUTA: un U23 a 5+5 in
  //   una squadra retrocessa vinceva anche se il miglior U23 della lega ne aveva 15). Ora la produzione dell'eroe
  //   deve reggere il confronto col miglior U23 rivale (entro 2), con floor storico 5 gol / 10 contributi.
  const _youngRivalContrib=youngLgGoals+youngLgAssists;
  const playerWinsLeagueYoung=isYoung&&myGoals>=5&&(myGoals+myAssists)>=Math.max(10,_youngRivalContrib-2);
  const leagueYoungWinner=playerWinsLeagueYoung
    ?{name:player.name,goals:myGoals,assists:myAssists,isPlayer:true}
    :{name:youngLgName,goals:youngLgGoals,assists:youngLgAssists,isPlayer:false};

  // 4. Squadra dell'Anno della lega
  // [7.15.0 collaudo PO «squadra dell'anno NON meritata — 13 gol, 18° marcatore, stagione in chiaroscuro»]
  //   il criterio era ASSOLUTO (OVR≥78 + 10 gol): un veterano con OVR alto entrava nell'XI ideale anche da 18°
  //   marcatore mentre i migliori ne facevano 28. Ora la selezione è RELATIVA alla lega (come MVP 6.8.2): la tua
  //   produzione (gol + 0.7·assist) deve reggere il confronto col 3° marcatore VERO del campionato (l'XI ha ~3
  //   slot offensivi) — o sei capocannoniere/MVP. Un anno in chiaroscuro non ti mette nell'XI.
  const _toy3rdGoals=(allLeagueScorers.filter(sc=>!sc.isPlayer)[2]?.goals)||14;
  const playerInTeamOfYear=myOvr>=74&&((myGoals+myAssists*0.7)>=Math.max(14,_toy3rdGoals*0.85)||playerWinsLeagueTopScorer||playerWinsLeagueMvp);

  // === PREMI EUROPEI (cross-league, molto più rari) ===

  // Candidati europei da altri campionati (nomi da roster reali)
  const _euLeagues=["Lega A","Premier Division","Deutsche Liga","Ligue Nationale","Liga Ibérica"].filter(l=>l!==lg);
  const _euClubs=_euLeagues.map((euLg,li)=>{
    const ec=CLUBS.filter(c=>c.lg===euLg).sort((a,b)=>b.p-a.p);
    return ec[Math.abs(_h(li*31+7))%Math.min(3,ec.length)]||ec[0]||null;
  }).filter(Boolean);

  /* [7.336.0 collaudo PO «la cosa più assurda e grave è il pallone d'oro!!!!!!» — Trofeo d'Oro vinto alla S.1
     dalla Liga Ibérica 2] I PREMI EUROPEI SI GIOCANO SOLO NELLE MASSIME DIVISIONI: Re dei Bomber (Scarpa d'Oro)
     e Trofeo d'Oro confrontano «i migliori d'Europa» — un campionato di 2ª serie (o la Primavera) non entra nel
     campo. I premi DELLA PROPRIA lega (capocannoniere/MVP/giovane/XI) restano pienamente vincibili in ogni tier. */
  const _topFl=(typeof LEAGUE_PAIRS!=="undefined")&&LEAGUE_PAIRS.some(pr=>pr[0]===lg);
  // Re dei Bomber: capocannoniere in Europa
  const euScorerCands=_euClubs.map((club,i)=>{
    const name=_clubFwd(club,`eusc_${i}_${season}`)||club.n;
    const goals=Math.max(18,Math.round(club.p*0.30+(_h(i*19+5)%14)));
    return{name,goals,club:club.n,league:club.lg};
  });
  const myEuGoals=(typeof euroSeasonGoalsOf==="function")?euroSeasonGoalsOf(player):myGoals;/* [7.538.0] in Europa contano i gol di lega di TUTTE le maglie della stagione */
  const allEuScorers=[...euScorerCands,...(_topFl?allLeagueScorers.filter(s=>!s.isPlayer).slice(0,3).map(s=>({...s,league:lg})):[]),/* [7.9.2] i 3 top di lega per la Scarpa d'Oro ora vengono dalla STESSA classifica marcatori (coerenza premi⟺tabella) · [7.336.0] solo se la lega è massima divisione */
    ...(_topFl?[{name:player.name,goals:myEuGoals,club:player.club?.n,league:lg,isPlayer:true}]:[])]
    .sort((a,b)=>b.goals-a.goals);
  const euScorerPos=allEuScorers.findIndex(s=>s.isPlayer);
  const playerWinsScarpaOro=euScorerPos===0&&myEuGoals>=28; // 28+ gol E primo in Europa

  /* [7.289.0 collaudo PO «ha davvero meritato il trofeo d'oro?»] L'EUROPA È UNA SOLA. I candidati al Trofeo
     d'Oro erano GENERATI UNA SECONDA VOLTA, con nomi e formula diversi da quelli del Re dei Bomber (qui
     `club.p*0.24+0..9` = 22-30 gol, là `club.p*0.30+0..13` = 27-40): il premio di miglior giocatore d'Europa
     si assegnava quindi in un campo PIÙ DEBOLE di quello dei marcatori, e nello screenshot il podio (30-28-23)
     non conteneva nessuno dei tre che avevano segnato di più (39-37-33). Ora il campo è lo STESSO: gli stessi
     uomini, con gli stessi gol, più assist/OVR/bacheca stimati. E la bacheca conta per tutti, non solo per
     l'eroe: prima ogni candidato fittizio incassava un +18 FISSO mentre il protagonista lo prendeva solo da
     campione — un confronto truccato in entrambe le direzioni. */
  const _EU_TROF=[{b:0,t:null},{b:0,t:null},{b:8,t:"coppa nazionale"},{b:18,t:"campione"},{b:26,t:"doppietta"}];
  const euPalCands=allEuScorers.filter(c=>!c.isPlayer).map((c,i)=>{
    const cOvr=clamp(84+Math.round((_h(i*23+11)%10)-2),82,97);
    const cAssists=Math.round(_h(i*9+6)%8)+3;
    const _tr=_EU_TROF[_h(i*29+13)%_EU_TROF.length];
    return{name:c.name,club:c.club,league:c.league,ovr:cOvr,goals:c.goals,assists:cAssists,trofei:_tr.t,score:cOvr*0.38+c.goals*1.1+cAssists*0.75+_tr.b};
  });
  const _myTrofei=(isChampion?18:0)+(player.cup?.champion?8:0)+(player.euro?.champion?10:0);
  const _myTrLbl=[isChampion?"campione":null,player.cup?.champion?"coppa nazionale":null,player.euro?.champion?"Europa":null].filter(Boolean).join(" · ")||null;
  const myEuAssists=(typeof euroSeasonAssistsOf==="function")?euroSeasonAssistsOf(player):myAssists;
  const playerPalScore=myOvr*0.38+myEuGoals*1.1+myEuAssists*0.75+_myTrofei;/* [7.538.0] il Trofeo d'Oro gioca nello STESSO campo del Re dei Bomber (invariante 7.289): se li' contano i gol di tutta la stagione europea, qui non possono contarne meno */
  const allEuPal=[...euPalCands,...(_topFl?[{name:player.name,club:player.club?.n,league:lg,ovr:myOvr,goals:myEuGoals,assists:myEuAssists,trofei:_myTrLbl,score:playerPalScore,isPlayer:true}]:[])]/* [7.336.0] il Trofeo d'Oro non si vince (né si compare nel podio) da una 2ª divisione */
    .sort((a,b)=>b.score-a.score);
  const _euPalTop5=allEuPal.slice(0,5).some(c=>c.isPlayer);
  // Requisiti eccezionali: OVR≥85, campione, 22+ gol O (18+ gol + 10+ assist)
  const playerWinsPalloneOro=allEuPal[0].isPlayer&&_euPalTop5&&myOvr>=85&&isChampion&&
    (myEuGoals>=22||(myEuGoals>=18&&myEuAssists>=10));

  // --- Record stagionale ---
  const beatSeasonRecord=myGoals>lgRec.seasonRecord.goals;
  const nearSeasonRecord=!beatSeasonRecord&&myGoals>=lgRec.seasonRecord.goals-4&&myGoals>0;

  // --- Posizione all-time ---
  const playerCareerGoals=player.totalGoals||0;
  let allTimePos=lgRec.topScorers.findIndex(s=>playerCareerGoals>=s.goals);
  if(allTimePos===-1)allTimePos=lgRec.topScorers.length;
  const beatAllTime=playerCareerGoals>lgRec.allTimeScorer.goals;

  // --- Rivale ---
  const rival=player.rival;
  const rivalGoals=rivalSeasonGoals(player);/* [7.285.0] era `rival.goals` = il totale della stagione PRECEDENTE, confrontato coi gol di questa */

  return{
    // Europei
    palloneOro:{winner:allEuPal[0],playerWins:playerWinsPalloneOro,top3:allEuPal.slice(0,3)},
    scarpaOro:{winner:allEuScorers[0],playerWins:playerWinsScarpaOro,top3:allEuScorers.slice(0,3),playerPos:euScorerPos,playerGoals:myEuGoals},/* [7.289.0] il numero mostrato dev'essere QUELLO su cui si fa la classifica (gol di lega): la riga stampava `player.goals` di TUTTE le competizioni, quindi si leggeva «5ª con 48 gol» sotto un podio che partiva da 39 */
    // Di lega (Sprint 134)
    leagueMvp:{winner:allLeagueMvp[0],playerWins:playerWinsLeagueMvp,top3:allLeagueMvp.slice(0,3)},
    leagueTopScorer:{winner:allLeagueScorers[0],playerWins:playerWinsLeagueTopScorer,top3:allLeagueScorers.slice(0,3),playerPos:playerLeagueScorerPos},
    leagueYoung:{winner:leagueYoungWinner,playerWins:playerWinsLeagueYoung,isYoungEligible:isYoung},
    leagueTeamOfYear:playerInTeamOfYear,
    youngPlayer:{winner:leagueYoungWinner,playerWins:playerWinsLeagueYoung,isYoungEligible:isYoung}, // compat
    seasonRecord:{record:lgRec.seasonRecord,playerGoals:myGoals,beaten:beatSeasonRecord,near:nearSeasonRecord},
    allTime:{record:lgRec.allTimeScorer,playerCareerGoals,beaten:beatAllTime,position:allTimePos},
    rival:rival?{name:rival.name,goals:rivalGoals,playerGoals:myGoals,playerWins:myGoals>rivalGoals,tie:myGoals===rivalGoals,/* [7.462.0 collaudo PO «e' in parita'!»] IL PAREGGIO NON E' UNA SCONFITTA. `playerWins` e' un booleano su `>`, quindi 17-17 cadeva nel ramo «ti ha superato» — col tuo numero in rosso e quello del rivale in verde. Il confronto ha TRE esiti, non due. */relLabel:{sconosciuto:"Sconosciuto",rivale:"🔥 Rivale",rispettato:"🤝 Rispettato",amico:"👥 Amico"}[rival.relationship||"sconosciuto"]}:null,
    leagueRecords:lgRec,
    playerLeagueGoals:myGoals,playerLeagueAssists:myAssists,/* [7.289.0] per le righe di riepilogo dei premi europei */
  };
}

// standings start at zero each season, updated incrementally via updateStandings
function initStandings(clubs){
  return[...clubs].map(c=>({...c,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,pts:0}));
}
// simulate all other matches when player matchday ends; prestigeShifts = {clubId: delta}
// [5.76.0 BUG-6/MOT-3] opts={opponentId,seed}: (a) l'avversario REALE riceve il risultato SPECULARE ed è
//   ESCLUSO dagli accoppiamenti casuali (prima "rigiocava" un'altra partita nella stessa giornata → somma
//   gf≠ga di lega, sconfitta mai registrata); (b) con seed la giornata è RIPRODUCIBILE (seededRng/
//   seededPoissonGoals, stessa infrastruttura di calcWorldStandings) — la lega del giocatore era l'UNICA
//   non deterministica del gioco. Senza opts il comportamento resta identico a prima (compat).
function updateStandings(standings,playerClubId,playerResult,prestigeShifts,opts){
  if(!standings?.length)return[];
  /* [6.3.3 BUG-STAND] INVARIANTE double round-robin: in una lega a N squadre ogni squadra gioca 2*(N-1)
     partite. Se una squadra è GIÀ al massimo, la stagione di lega è completa → nessun turno aggiuntivo
     (previene il 35° turno segnalato dal PO: over-count emergente da interazioni live/sim/coppa). Zero
     regressione sul flusso corretto (34<=34 non scatta mai); si applica solo allo stato impossibile. */
  /* [7.162.0 super-test CAL-F6] il guard 6.3.3 abortiva l'INTERO update se UNA squadra era al tetto → in un save
     legacy (35 gare) anche il risultato REALE del giocatore veniva scartato per il resto della stagione (classifica
     congelata coi V che si accumulavano in calendario). Ora il tetto è PER-SQUADRA: chi è al cap non gioca il turno
     simulato, gli altri (incluso il giocatore) continuano a contare. Flusso pulito invariato (nessuno tocca il cap). */
  const _mxG=standings.length>1?2*(standings.length-1):9999;
  const _capped=(t)=>(t.played||0)>=_mxG;
  const sh=prestigeShifts||{};
  const _o=opts||{};
  const _rng=_o.seed!=null?seededRng((_o.seed>>>0)||1):Math.random;
  const _pg=l=>_o.seed!=null?seededPoissonGoals(l,_rng):poissonGoals(l);
  const s=standings.map(t=>({...t}));
  let oppT=null;
  if(playerResult){
    const pt=s.find(t=>t.id===playerClubId||t.n===playerClubId);
    if(pt&&!_capped(pt)){/* [7.162.0 CAL-F6] tetto per-squadra */
      pt.played++;pt.gf+=playerResult.homeScore;pt.ga+=playerResult.awayScore;
      if(playerResult.won){pt.wins++;pt.pts+=3;}else if(playerResult.drew){pt.draws++;pt.pts+=1;}else{pt.losses++;}
      pt.gd=pt.gf-pt.ga;
    }
    if(_o.opponentId){
      oppT=s.find(t=>t!==pt&&(t.id===_o.opponentId||t.n===_o.opponentId))||null;
      if(!oppT&&typeof console!=="undefined")console.warn("[CPM] updateStandings: opponentId non in classifica:",_o.opponentId);/* [6.0.0 SL-7] */
      if(oppT&&_capped(oppT))oppT=null;/* [7.162.0 CAL-F6] */
      if(oppT){// risultato speculare: i gol dell'eroe sono i subiti dell'avversario, e viceversa
        oppT.played++;oppT.gf+=playerResult.awayScore;oppT.ga+=playerResult.homeScore;
        if(playerResult.won){oppT.losses++;}else if(playerResult.drew){oppT.draws++;oppT.pts+=1;}else{oppT.wins++;oppT.pts+=3;}
        oppT.gd=oppT.gf-oppT.ga;
      }
    }
  }
  const myId=playerClubId;
  const others=s.filter(t=>t.id!==myId&&t.n!==myId&&t!==oppT&&!_capped(t));/* [7.162.0 CAL-F6] chi è al tetto salta il turno simulato, gli altri continuano */
  const paired=[...others];
  // Sprint 131: shuffle pairings so teams don't always face the same opponent
  for(let _si=paired.length-1;_si>0;_si--){const _sj=Math.floor(_rng()*(_si+1));[paired[_si],paired[_sj]]=[paired[_sj],paired[_si]];}
  if(paired.length%2!==0){
    const byeTeam=paired[paired.length-1];
    const byeP=clamp((byeTeam.p||65)+(sh[byeTeam.id||byeTeam.n]||0),30,99);
    const diff=clamp((byeP-65)/30,-1,1);
    const lH=clamp(1.40+diff*1.00,0.25,2.6);const lA=clamp(1.22-diff*0.85,0.20,2.4);// [5.97.0 SL-1/SL-2] λ calibrate (sweep: 2.63 gol/match, campione ~74pt)
    const bG=_pg(lH),gG=_pg(lA);
    byeTeam.played++;byeTeam.gf+=bG;byeTeam.ga+=gG;byeTeam.gd=byeTeam.gf-byeTeam.ga;
    if(bG>gG){byeTeam.wins++;byeTeam.pts+=3;}else if(bG<gG){byeTeam.losses++;}
    else{byeTeam.draws++;byeTeam.pts++;}
    paired.pop();
  }
  for(let i=0;i+1<paired.length;i+=2){
    const h=paired[i],a=paired[i+1];
    const hP=clamp((h.p||65)+(sh[h.id||h.n]||0),30,99);
    const aP=clamp((a.p||65)+(sh[a.id||a.n]||0),30,99);
    const diff=clamp((hP-aP)/34,-1,1);
    /* [7.200.0] stessa curva e stessi pavimenti di simulateMatch: il pavimento 0.25 (un gol ogni 4 gare)
       schiacciava le piccole a ~16 punti a stagione — nel calcio vero l'ultima ne fa 25-30. */
    const lambdaH=clamp(1.42+diff*0.95,0.62,2.55);
    const lambdaA=clamp(1.26-diff*0.82,0.55,2.45);
    const hG=_pg(lambdaH);const aG=_pg(lambdaA);
    h.played++;a.played++;h.gf+=hG;h.ga+=aG;h.gd=h.gf-h.ga;
    a.gf+=aG;a.ga+=hG;a.gd=a.gf-a.ga;
    if(hG>aG){h.wins++;h.pts+=3;a.losses++;}else if(hG<aG){a.wins++;a.pts+=3;h.losses++;}
    else{h.draws++;h.pts++;a.draws++;a.pts++;}
  }
  return s.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}
// [5.76.0] seed canonico della giornata di lega: stabile per (club, stagione, settimana) → ricaricare un
//   save e riavanzare produce la STESSA classifica (pattern di calcWorldStandings).
function standingsSeed(clubId,season,week){return(hashStr(String(clubId||"club"))+(season||1)*100003+(week||1)*9973)>>>0;}
// Sprint 46 — World League ecosystem: deterministic week-by-week standings for all leagues
// Seeded xorshift32 PRNG: same seed → same sequence, no Math.random()
function seededRng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
// Poisson goals with external RNG (same lambda logic as updateStandings / poissonGoals)
function seededPoissonGoals(lambda,rng){const L=Math.exp(-Math.min(lambda,6));let k=0,p=1;do{k++;p*=rng();}while(p>L&&k<9);return Math.max(0,k-1);}
// Compute world league standings deterministically for (lg, season, currentWeek)
// Calling twice with same args always returns identical result — safe to compute on-demand
function calcWorldStandings(lg,season,currentWeek,overrides){
  // [6.98.0 collaudo PO «Serie B sbagliata! siamo saliti insieme a Doria e Cremona»] la lega EFFETTIVA di un club
  //   rispetta gli spostamenti promozione/retrocessione (player.leagueOverrides) — prima leggeva il campo lg
  //   STATICO: i club promossi comparivano in DUE classifiche (nella vecchia lega e nella nuova).
  const _ov=overrides||{};
  const clubs=CLUBS.filter(c=>((_ov[c.id])||c.lg)===lg&&!c.isU18);
  if(clubs.length<2)return[];
  const st=clubs.map(c=>({...c,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,pts:0}));
  const lgH=hashStr(lg)>>>0;
  const _mxW=clubs.length>1?2*(clubs.length-1):38;/* [7.162.0 super-test CAL-F4] cap double-round-robin: il tab Classifica mostrava le ALTRE leghe a G=38 mentre la tua chiude a 34 */
  const wMax=Math.min(currentWeek||1,38,_mxW);
  for(let w=1;w<=wMax;w++){
    const rng=seededRng((lgH+season*100003+w*9973)>>>0);
    // Fisher-Yates shuffle with seeded rng to get this week's pairings
    const ord=clubs.map((_,i)=>i);
    for(let i=ord.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]];}
    for(let i=0;i+1<ord.length;i+=2){
      const h=st[ord[i]],a=st[ord[i+1]];
      const pd=clamp(((h.p||50)-(a.p||50))/30,-1,1);
      const lH=clamp(1.40+pd*1.00,0.3,2.6),lA=clamp(1.22-pd*0.85,0.25,2.4);// [5.97.0] allineato a updateStandings
      const hG=seededPoissonGoals(lH,rng),aG=seededPoissonGoals(lA,rng);
      h.played++;a.played++;h.gf+=hG;h.ga+=aG;h.gd=h.gf-h.ga;
      a.gf+=aG;a.ga+=hG;a.gd=a.gf-a.ga;
      if(hG>aG){h.wins++;h.pts+=3;a.losses++;}
      else if(hG<aG){a.wins++;a.pts+=3;h.losses++;}
      else{h.draws++;h.pts++;a.draws++;a.pts++;}
    }
  }
  return[...st].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}
