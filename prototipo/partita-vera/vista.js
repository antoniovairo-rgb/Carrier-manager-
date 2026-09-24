/* Fase 2 «partita vera» — LA VISTA 3D. Legge SOLO lo stream del motore (fotogrammi + eventi) e lo disegna.
   Non decide nessun fatto: posizioni, esiti, gol, cartellini e cambi vengono da partita.js / motore-v2.js.
   Le uniche scelte della vista sono estetiche (camera, pubblico, esultanza), con un generatore a seme proprio. */
(function(){
'use strict';
const T0=performance.now();
const $=(id)=>document.getElementById(id);
const errore=(msg)=>{const e=$('err');e.style.display='flex';e.innerHTML=msg;window.__PV=Object.assign(window.__PV||{},{errore:msg});};
/* ---------- 0. il CDN: senza Three non si parte, e lo si dice chiaro ---------- */
if(!window.THREE){errore('<div><b>Three.js non si è caricato.</b><br>Controllati: cdnjs r128 e jsdelivr 0.128.0. Verifica la connessione e ricarica.</div>');return;}
if(THREE.REVISION!=='128')console.warn('Three.js atteso r128, trovato r'+THREE.REVISION);
const erroriConsole=[];window.addEventListener('error',(e)=>erroriConsole.push(String(e.message||e)));

/* ---------- 1. parametri (dall'indirizzo) ---------- */
const Q=new URLSearchParams(location.search);
const semeIn=(+Q.get('seed')>>>0)||20260924;
const squadra=(s,def)=>{const p=(s||def).split(':');return{sigla:p[0],forza:+p[1]||70,c1:p[2]||'#1e40af',c2:p[3]||'#ffffff'};};
const casa=squadra(Q.get('casa'),'TOR:72:#8a1538:#f8fafc'),osp=squadra(Q.get('osp'),'MIL:70:#111827:#e11d48');
const eroeLato=Q.get('lato')==='away'?'away':'home';
const SERA=Q.get('ora')!=='giorno';
const MOSTRA_FPS=Q.get('fps')!=='0';
const lcg=(s)=>{s=(s>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
const COGN=['Rossi','Bianchi','Ferri','Galli','Conti','Marino','Greco','Bruno','Costa','Fontana','Rinaldi','Moretti','Barbieri','Lombardi','Serra','Villa','Longo','Leone','Colombo','Martini','Sala','Testa','Caruso','Fabbri','Pellegrini','Silvestri','Vitale','Neri','Ruggiero','Monti'];
const rosa=(sig,s)=>{const r=lcg(s);return Array.from({length:11},()=>COGN[Math.floor(r()*COGN.length)]);};
casa.rosa=rosa(casa.sigla,semeIn^11);osp.rosa=rosa(osp.sigla,semeIn^29);
const nomeEroe=Q.get('eroe')||'Vairo';

/* ---------- 2. la partita: la stessa funzione della simulazione rapida ---------- */
const scelteUtente={};
const P=creaPartita({seed:semeIn,casa,ospite:osp,eroeLato,eroe:{nome:nomeEroe,ovr:78,profilo:{tiro:80,dribbling:76,passaggio:72}},scelte:scelteUtente});
const G=P.motore._g;/* nomi e ruoli correnti (cambiano coi cambi): li scrive il motore/regista, qui si leggono */
const tE=P.squadre.eroe,tA=P.squadre.avv;
const coloreLato=(l)=>l==='home'?tE:tA;/* lato del MOTORE: home = squadra dell'eroe */
const FR=P.stato.frames,EV=[];/* EV[i] = eventi nati al fotogramma i */
let ultimoAttesa=null;
const BATT=window.PARTITA_BATTITI;
function genera(fino,chiedi){while(!P.stato.finita&&FR.length<fino){const r=P.passo({chiedi});if(!r)break;if(r.attesa){ultimoAttesa=r.attesa;return false;}EV[FR.length-1]=r.eventi;}return true;}

/* ---------- 3. la scena ---------- */
const W=(ex,ey)=>({x:(ey-50)*0.68,z:(50-ex)*1.05});/* campo 105 x 68: x del motore sulla lunghezza, la porta avversaria in alto */
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=SERA?1.05:1.0;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('scena').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(SERA?0x0b1220:0x9cc3e6);scene.fog=new THREE.Fog(scene.background,160,320);
const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,0.5,600);
const rC=lcg(semeIn^0xa5a5);/* generatore ESTETICO: pubblico, erba, esultanze. Non tocca il motore */

/* luci: emisfero + sole con ombre; di sera i quattro fari (luci dinamiche: si alzano sul gol) */
const hemi=new THREE.HemisphereLight(SERA?0x9fb4d9:0xdfefff,SERA?0x1b2a17:0x3a5a2a,SERA?0.55:0.75);scene.add(hemi);
const sole=new THREE.DirectionalLight(SERA?0xdfe8ff:0xfff1d6,SERA?0.9:1.6);sole.castShadow=true;sole.shadow.mapSize.set(2048,2048);
Object.assign(sole.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:10,far:260});sole.shadow.bias=-0.0006;scene.add(sole);scene.add(sole.target);
const fari=[];if(SERA){for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const L=new THREE.SpotLight(0xf3f6ff,0.9,260,0.62,0.55,1.2);L.position.set(sx*62,48,sz*72);L.target.position.set(sx*8,0,sz*10);scene.add(L);scene.add(L.target);fari.push(L);}}

/* il prato: tosatura a strisce, rumore di colore, usura in area e al centro, linee regolamentari. Tutto disegnato qui */
function prato(){const PXM=12,LW=126,LL=132;/* texture su 126 x 132 m (campo + fasce) */const cw=LW*PXM|0,ch=LL*PXM|0;
  const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.round(1024*ch/cw);const k=cv.width/LW;const c=cv.getContext('2d');
  const X=(m)=>(m+LW/2)*k,Z=(m)=>(m+LL/2)*k;
  const base=SERA?[46,110,52]:[58,128,58];
  for(let i=0;i<24;i++){const z0=-LL/2+i*LL/24;const s=i%2?1.06:0.94;c.fillStyle=`rgb(${base[0]*s|0},${base[1]*s|0},${base[2]*s|0})`;c.fillRect(0,Z(z0),cv.width,LL/24*k+1);}
  const img=c.getImageData(0,0,cv.width,cv.height),d=img.data;for(let i=0;i<d.length;i+=4){const n=(rC()-0.5)*16;d[i]+=n*0.6;d[i+1]+=n;d[i+2]+=n*0.5;}c.putImageData(img,0,0);
  const usura=(x,z,rx,rz,a)=>{const gr=c.createRadialGradient(X(x),Z(z),0,X(x),Z(z),rx*k);gr.addColorStop(0,`rgba(120,105,70,${a})`);gr.addColorStop(1,'rgba(120,105,70,0)');c.save();c.translate(X(x),Z(z));c.scale(1,rz/rx);c.translate(-X(x),-Z(z));c.fillStyle=gr;c.beginPath();c.arc(X(x),Z(z),rx*k,0,7);c.fill();c.restore();};
  usura(0,-50,7,4,0.45);usura(0,50,7,4,0.45);usura(0,0,6,6,0.18);usura(0,-41.5,2.5,2.5,0.3);usura(0,41.5,2.5,2.5,0.3);
  c.strokeStyle='rgba(250,250,245,0.92)';c.lineWidth=0.12*k*1.4;const L=52.5,Wd=34;
  const rett=(x0,z0,x1,z1)=>{c.strokeRect(X(x0),Z(z0),(x1-x0)*k,(z1-z0)*k);};
  rett(-Wd,-L,Wd,L);c.beginPath();c.moveTo(X(-Wd),Z(0));c.lineTo(X(Wd),Z(0));c.stroke();
  c.beginPath();c.arc(X(0),Z(0),9.15*k,0,7);c.stroke();
  for(const s of [-1,1]){rett(-20.16,s<0?-L:L-16.5,20.16,s<0?-L+16.5:L);rett(-9.16,s<0?-L:L-5.5,9.16,s<0?-L+5.5:L);
    c.beginPath();c.arc(X(0),Z(s*(L-11)),0.25*k,0,7);c.fillStyle='rgba(250,250,245,0.92)';c.fill();
    c.beginPath();const a0=s<0?0.93:Math.PI+0.93,a1=s<0?Math.PI-0.93:2*Math.PI-0.93;c.arc(X(0),Z(s*(L-11)),9.15*k,a0,a1);c.stroke();
    for(const sx of [-1,1]){c.beginPath();c.arc(X(sx*Wd),Z(s*L),1*k,0,7);c.stroke();}}
  c.beginPath();c.arc(X(0),Z(0),0.25*k,0,7);c.fill();
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const m=new THREE.Mesh(new THREE.PlaneGeometry(LW,LL),new THREE.MeshStandardMaterial({map:t,roughness:0.92,metalness:0}));m.rotation.x=-Math.PI/2;m.receiveShadow=true;scene.add(m);}
prato();

/* porte 7,32 x 2,44 con rete */
function porta(s){const g=new THREE.Group();const bianco=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.35});const r=0.06;
  const palo=(x)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,2.44,12),bianco);m.position.set(x,1.22,0);m.castShadow=true;g.add(m);};palo(-3.66);palo(3.66);
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(r,r,7.44,12),bianco);tr.rotation.z=Math.PI/2;tr.position.set(0,2.44,0);tr.castShadow=true;g.add(tr);
  const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.strokeStyle='rgba(255,255,255,0.85)';c.lineWidth=2;for(let i=0;i<=64;i+=8){c.beginPath();c.moveTo(i,0);c.lineTo(i,64);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(64,i);c.stroke();}
  const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
  const rete=(w,h,rep)=>{const t=tx.clone();t.needsUpdate=true;t.repeat.set(rep[0],rep[1]);return new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,depthWrite:false});};
  const fondo=new THREE.Mesh(new THREE.PlaneGeometry(7.32,2.44),rete(7.32,2.44,[18,6]));fondo.position.set(0,1.22,-2);g.add(fondo);
  const tetto=new THREE.Mesh(new THREE.PlaneGeometry(7.32,2),rete(7.32,2,[18,5]));tetto.rotation.x=Math.PI/2;tetto.position.set(0,2.44,-1);g.add(tetto);
  for(const sx of [-1,1]){const lato=new THREE.Mesh(new THREE.PlaneGeometry(2,2.44),rete(2,2.44,[5,6]));lato.rotation.y=Math.PI/2;lato.position.set(sx*3.66,1.22,-1);g.add(lato);}
  g.position.set(0,0,s*52.5);if(s<0)g.rotation.y=0;else g.rotation.y=Math.PI;scene.add(g);}
porta(-1);porta(1);

/* tribune a gradoni con pubblico disegnato, cartelloni, bandierine */
function stadio(){const folla=(w,h)=>{const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.fillStyle=SERA?'#1a2233':'#46556e';c.fillRect(0,0,512,128);
    const pal=[casa.c1,casa.c2,osp.c1,'#d9dde6','#2b3446','#9aa4b8','#c9a26b'];for(let i=0;i<2600;i++){c.fillStyle=pal[Math.floor(rC()*pal.length)];c.globalAlpha=0.55+rC()*0.45;c.fillRect(rC()*512,rC()*128,2.2,2.6);}c.globalAlpha=1;
    const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.repeat.set(w/40,1);return t;};
  const mat=(w)=>new THREE.MeshStandardMaterial({map:folla(w),roughness:1});
  const anello=(dist,lung,orient)=>{for(let k=0;k<3;k++){const h=4,d=6;const m=new THREE.Mesh(new THREE.BoxGeometry(lung+k*12,h,d),mat(lung));m.position.y=h/2+k*3.4;
      if(orient==='z'){m.position.z=dist+k*5.2;}else if(orient==='-z'){m.position.z=-(dist+k*5.2);}else if(orient==='x'){m.rotation.y=Math.PI/2;m.position.x=dist+k*5.2;}else{m.rotation.y=Math.PI/2;m.position.x=-(dist+k*5.2);}
      m.receiveShadow=true;scene.add(m);}};
  anello(66,130,'z');anello(66,130,'-z');anello(46,150,'x');anello(46,150,'-x');
  const cv=document.createElement('canvas');cv.width=1024;cv.height=64;const c=cv.getContext('2d');const sp=['KORWARD ELITE','CARRIERA','PARTITA VERA',casa.sigla+' · '+osp.sigla];
  for(let i=0;i<4;i++){c.fillStyle=i%2?casa.c1:'#0b1220';c.fillRect(i*256,0,256,64);c.fillStyle='#fff';c.font='bold 30px Segoe UI,Roboto,sans-serif';c.textAlign='center';c.fillText(sp[i],i*256+128,43);}
  const tb=new THREE.CanvasTexture(cv);tb.encoding=THREE.sRGBEncoding;tb.wrapS=THREE.RepeatWrapping;
  const cart=(lung,x,z,ry)=>{const t=tb.clone();t.needsUpdate=true;t.repeat.set(lung/40,1);const m=new THREE.Mesh(new THREE.BoxGeometry(lung,0.9,0.15),new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:SERA?0.45:0.15}));m.position.set(x,0.45,z);m.rotation.y=ry;scene.add(m);};
  cart(110,0,-57,0);cart(110,0,57,0);cart(120,-39,0,Math.PI/2);cart(120,39,0,Math.PI/2);
  for(const sx of [-1,1])for(const sz of [-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.5,6),new THREE.MeshStandardMaterial({color:0xeeeeee}));a.position.set(sx*34,0.75,sz*52.5);scene.add(a);
    const b=new THREE.Mesh(new THREE.PlaneGeometry(0.45,0.3),new THREE.MeshStandardMaterial({color:0xf5c542,side:THREE.DoubleSide}));b.position.set(sx*34+0.23,1.35,sz*52.5);scene.add(b);}
  for(const sx of [-1,1])for(const sz of [-1,1]){const t=new THREE.Mesh(new THREE.BoxGeometry(1.2,46,1.2),new THREE.MeshStandardMaterial({color:0x5b6475}));t.position.set(sx*62,23,sz*72);scene.add(t);
    const p=new THREE.Mesh(new THREE.BoxGeometry(8,4,0.6),new THREE.MeshStandardMaterial({color:0x222222,emissive:SERA?0xf3f6ff:0x000000,emissiveIntensity:SERA?1.4:0}));p.position.set(sx*62,48,sz*72);p.lookAt(0,0,0);scene.add(p);}}
stadio();

/* il pallone: 0,22 m di diametro, la misura vera */
const palla=(()=>{const cv=document.createElement('canvas');cv.width=128;cv.height=64;const c=cv.getContext('2d');c.fillStyle='#fafafa';c.fillRect(0,0,128,64);c.fillStyle='#1f2937';for(let i=0;i<9;i++){c.beginPath();c.arc((i*41)%128,(i*23)%64,6,0,7);c.fill();}
  const m=new THREE.Mesh(new THREE.SphereGeometry(0.11,20,14),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),roughness:0.45}));m.castShadow=true;scene.add(m);return m;})();

/* ---------- 4. i corpi: CGTrader lod2 (4.190 triangoli l'uno), maglia tinta per squadra, clip vere + gesti fatti nel codice ---------- */
const N=22;const corpi=[];let pacchetto=null,clipMx=[];
const ALTEZZA=1.82;
function tinta(root,kit){root.traverse(o=>{if(!o.isMesh&&!o.isSkinnedMesh)return;o.castShadow=true;o.frustumCulled=false;const mats=Array.isArray(o.material)?o.material:[o.material];
  const nuovi=mats.map(m=>{const n=m.clone();const nm=(m.name||'');if(/Shirt/i.test(nm)){n.color=new THREE.Color(kit.maglia).convertSRGBToLinear();n.map=null;}else if(/Shorts/i.test(nm)){n.color=new THREE.Color(kit.pant).convertSRGBToLinear();n.map=null;}else if(/Leg/i.test(nm)){n.color=new THREE.Color(kit.calze).convertSRGBToLinear();n.map=null;}if(/Shirt|Shorts|Leg/i.test(nm)&&n.emissive)n.emissive.setRGB(0,0,0);n.needsUpdate=true;return n;});
  o.material=Array.isArray(o.material)?nuovi:nuovi[0];});}
const kitDi=(i)=>{if(i===22)return{maglia:'#111111',pant:'#111111',calze:'#111111'};const l=(i<10||i===21)?'home':'away';const t=coloreLato(l);const gk=(i===0||i===10);
  return gk?{maglia:l==='home'?'#16a34a':'#f59e0b',pant:'#111827',calze:l==='home'?'#16a34a':'#f59e0b'}:{maglia:t.c1,pant:t.c2,calze:t.c1};};
function corpoSemplice(kit){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CapsuleGeometry?new THREE.CapsuleGeometry(0.25,1.2,4,8):new THREE.CylinderGeometry(0.25,0.25,1.7,10),new THREE.MeshStandardMaterial({color:kit.maglia}));m.position.y=0.9;m.castShadow=true;g.add(m);return g;}
function creaCorpo(i){const kit=kitDi(i);let obj,mixer=null,azioni={},ossa={};
  if(pacchetto){obj=THREE.SkeletonUtils.clone(pacchetto.scene);tinta(obj,kit);
    /* altezza dalle OSSA, come il gioco (src/12:996 _skeletonWorldHeight): il riquadro di una mesh con scheletro non e' affidabile */
    obj.updateMatrixWorld(true);let lo=1e9,hi=-1e9;const _w=new THREE.Vector3();obj.traverse(n=>{if(!n.isBone)return;n.getWorldPosition(_w);lo=Math.min(lo,_w.y);hi=Math.max(hi,_w.y);});
    const h=(hi>lo)?hi-lo:1.8;obj.scale.multiplyScalar(ALTEZZA*0.93/h);obj.updateMatrixWorld(true);lo=1e9;obj.traverse(n=>{if(!n.isBone)return;n.getWorldPosition(_w);lo=Math.min(lo,_w.y);});if(lo<1e8)obj.position.y-=lo-0.04;
    mixer=new THREE.AnimationMixer(obj);for(const c of pacchetto.animations.concat(clipMx)){azioni[c.name]=mixer.clipAction(c);}
    obj.traverse(o=>{if(o.isBone)ossa[o.name]=o;});}
  else obj=corpoSemplice(kit);
  const radice=new THREE.Group();radice.add(obj);scene.add(radice);
  const c={i,radice,obj,mixer,azioni,ossa,loco:null,gesto:null,gestoFine:0,dir:0,px:0,pz:0,v:0,proc:null,procT:0,cart:null};
  if(azioni.idle){azioni.idle.play();c.loco='idle';}
  return c;}
function suona(c,nome,opz){opz=opz||{};const a=c.azioni[nome];if(!a)return false;
  if(c.gesto&&c.azioni[c.gesto]&&c.gesto!==nome)c.azioni[c.gesto].fadeOut(0.12);
  a.reset();a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.timeScale=opz.vel||1;a.time=Math.max(0,opz.da||0);a.fadeIn(0.1).play();
  c.gesto=nome;c.gestoFine=performance.now()+1000*Math.max(0.25,(a.getClip().duration-a.time)/a.timeScale);return true;}
/* locomozione: il ciclo delle gambe segue la velocita' VISTA sullo schermo, cosi' i piedi non scivolano */
const NATIVA={walk:1.4,jog:3.2,jogging:3.2,running:6.2};
function locomuovi(c,v){const nome=v<0.35?'idle':v<2.2?'walk':v<4.6?'jog':'running';const a=c.azioni[nome];if(!a)return;
  if(c.loco!==nome){const b=c.azioni[c.loco];a.reset().play();if(b)a.crossFadeFrom(b,0.2,false);c.loco=nome;}
  a.timeScale=nome==='idle'?1:Math.min(2.4,Math.max(0.5,v/NATIVA[nome]));
  const pesoGesto=(c.gesto&&performance.now()<c.gestoFine)?0.25:1;a.setEffectiveWeight(pesoGesto);}
/* gesti fatti nel codice (scelta PO): l'osso punta una direzione del mondo. Esultanza, cartellino dell'arbitro, il «cinque» del cambio */
const _q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_v3=new THREE.Vector3();
function punta(osso,figlio,dir,peso){if(!osso||!figlio)return;osso.getWorldPosition(_v1);figlio.getWorldPosition(_v2);_v2.sub(_v1).normalize();_v3.copy(dir).normalize();
  _q.setFromUnitVectors(_v2,_v3);osso.getWorldQuaternion(_q2);const target=_q.multiply(_q2);const pq=new THREE.Quaternion();osso.parent.getWorldQuaternion(pq);pq.invert().multiply(target);osso.quaternion.slerp(pq,peso);}
function procedurale(c,t){if(!c.proc)return;const O=c.ossa;const k=Math.min(1,(t-c.procT)/250);const fine=c.procT+c.procDur;const w=t>fine?Math.max(0,1-(t-fine)/300):k;if(w<=0){c.proc=null;if(c.cart)c.cart.visible=false;return;}
  const f=c.dir,fx=Math.sin(f),fz=Math.cos(f);
  if(c.proc==='esulta'){const s=0.2*Math.sin(t/120);punta(O.upperarm_l,O.lowerarm_l,new THREE.Vector3(-0.35*fz+s,1,0.35*fx),w);punta(O.upperarm_r,O.lowerarm_r,new THREE.Vector3(0.35*fz-s,1,-0.35*fx),w);
    punta(O.lowerarm_l,O.hand_l,new THREE.Vector3(-0.2*fz,1,0.2*fx),w);punta(O.lowerarm_r,O.hand_r,new THREE.Vector3(0.2*fz,1,-0.2*fx),w);}
  else if(c.proc==='cartellino'){punta(O.upperarm_r,O.lowerarm_r,new THREE.Vector3(0.15*fz+0.1*fx,1,-0.15*fx+0.1*fz),w);punta(O.lowerarm_r,O.hand_r,new THREE.Vector3(0.05*fz,1,0),w);if(c.cart)c.cart.visible=w>0.6;}
  else if(c.proc==='cinque'){punta(O.upperarm_r,O.lowerarm_r,new THREE.Vector3(0.2*fz+0.4*fx,0.9,-0.2*fx+0.4*fz),w);}
  else if(c.proc==='proteste'){punta(O.upperarm_l,O.lowerarm_l,new THREE.Vector3(-fz+0.5*fx,-0.2,fx+0.5*fz),w);punta(O.upperarm_r,O.lowerarm_r,new THREE.Vector3(fz+0.5*fx,-0.2,-fx+0.5*fz),w);}}
function avviaProc(c,tipo,durMs){c.proc=tipo;c.procT=performance.now();c.procDur=durMs;}

/* l'arbitro: il 23esimo corpo, segue l'azione a distanza (estetica: non tocca il pallone e non decide) */
let arbitro=null;

/* ---------- 5. il regista della vista: tempo, anticipo, eventi → gesti ---------- */
const VEL=[1,2,4,8];let iVel=0;const SEC_MIN=10;/* ×1 = un minuto di partita in 10 secondi */
let tR=0;/* indice (con frazione) del fotogramma disegnato */
let pausa=false,congela=0,fase='gioco';/* gioco | esulta | replay | cambio | scelta | fine */
let replay=null,esultaDi=null,cambio=null;const coda=[];/* eventi già disegnati */
let scegliIo=true;const ANTICIPO=BATT;/* il motore gira un minuto avanti: serve ad anticipare i gesti (contatto piede-palla) */
const CONTATTO={pass:0.38,kick:0.42,volley:0.45,header:0.5,tackle:0.45,'slide-tackle':0.4,throwin:0.55,penalty:0.5,'gk-dive':0.45,'gk-block':0.4,'gk-high-catch':0.45,receive:0.3,'mx-soccer-trip':0.35};/* frazioni STIMATE a vista: da misurare sulle clip */
/* AZIONI SALIENTI (scelta PO): la partita scorre veloce e rallenta alla velocita' scelta poco prima di tiri, gol, cartellini, rigori,
   cambi e occasioni dell'eroe. Guarda avanti nei fotogrammi gia' decisi dal motore: la vista non decide, sceglie solo il ritmo */
let modoSalienti=Q.get('modo')!=='integrale',velAtt=1;
const SALIENTE=(e)=>/^(tiro|gol|ammonizione|espulsione|occasione_eroe|sostituzione|intervallo|fischio_finale)$/.test(e.t)||(e.t==='battuta'&&(e.kind==='pen'||e.kind==='corner'));
function velBersaglio(){const base=VEL[iVel];if(!modoSalienti)return base;const i=Math.floor(tR);
  for(let k=i-4;k<=i+12;k++)for(const e of EV[k]||[])if(SALIENTE(e))return base;
  if(ultimoAttesa&&FR.length-1-tR<12)return base;return Math.min(base*8,40);}
const secFr=()=>SEC_MIN/BATT/velAtt;/* secondi reali per fotogramma */
const cron=[];const segnaCron=(min,t)=>{cron.unshift(`${min}' ${t}`);if(cron.length>60)cron.pop();};
const nomeDi=(i)=>i==null?'':(i===21?nomeEroe:(G[i]&&G[i].name)||'');
const numDi=(i)=>i===21?10:i===0||i===10?1:(i<10?i+1:i-9);
const ruoloDi=(i)=>i===21?'ATT':((G[i]&&G[i].rl)||'');
const etichetteExtra=new Map();/* i -> scadenza: chi ha appena fatto qualcosa ha il nome in evidenza */
function gestoDaEvento(e,anticipo){const cI=(x)=>x&&x.i!=null?corpi[x.i]:null;const ts=Math.min(2.2,Math.max(1,1.6/(secFr()*BATT/10)));
  const avvia=(c,clip)=>{if(!c)return;const a=c.azioni[clip];if(!a)return;const dur=a.getClip().duration;const da=Math.max(0,(CONTATTO[clip]||0.4)*dur-anticipo*ts);suona(c,clip,{vel:ts,da});};
  switch(e.t){
    case 'passaggio':avvia(cI(e.da),e.kind==='lancio'||e.kind==='cambio'?'kick':'pass');break;
    case 'cross':avvia(cI(e.da),'kick');break;
    case 'tiro':{const c=cI(e.chi);avvia(c,e.intent==='header'?'header':e.intent==='penalty'?'penalty':(e.from&&Math.abs(e.from.y-50)<14&&rC()<0.3?'volley':'kick'));break;}
    case 'parata':{const k=cI(e.gk);if(k)avvia(k,e.corner?'gk-dive':(rC()<0.5?'gk-high-catch':'gk-block'));break;}
    case 'presa':avvia(cI(e.gk),'gk-high-catch');break;
    case 'contrasto':case 'recupero':avvia(cI(e.chi),Math.abs((e.y||50)-50)>30?'slide-tackle':'tackle');break;
    case 'intercetto':avvia(cI(e.chi),'receive');break;
    case 'battuta':if(e.kind==='throw')avvia(cI(e.chi),'throwin');else if(e.kind==='goal_kick')avvia(cI(e.chi),'gk-goal-kick');else avvia(cI(e.chi),'kick');break;
    case 'spazzata':avvia(cI(e.chi),'header');break;
  }}
function faiEvento(e){const t=performance.now();PV.eventiVisti=(PV.eventiVisti||0)+1;PV.ultimo={t:e.t,min:e.min,quando:t};(PV.visti=PV.visti||{})[e.t]={min:e.min,quando:t};const c=(x)=>x&&x.i!=null?corpi[x.i]:null;
  if(e.chi&&e.chi.i!=null)etichetteExtra.set(e.chi.i,t+1800);
  switch(e.t){
    case 'gol':{const lato=e.lato;const S=P.stato;segnaCron(e.min,`⚽ GOL di ${nomeDi(e.chi&&e.chi.i)}${e.assist&&e.assist.i!=null?' (assist '+nomeDi(e.assist.i)+')':''}`);
      banner('GOL!',`${nomeDi(e.chi&&e.chi.i)} · ${e.min}'`,2600);fase='esulta';esultaDi={i:e.chi.i,lato,k:Math.floor(tR),t0:t};congela=t+3400;
      for(const L of fari)L.intensity=1.6;const sc=c(e.chi);if(sc){avviaProc(sc,'esulta',3200);}
      const gk=corpi[lato==='home'?10:0];if(gk&&gk.azioni['missed-chance'])suona(gk,'missed-chance');break;}
    case 'fallo':{const f=c(e.chi),s=c(e.su);segnaCron(e.min,`Fallo di ${nomeDi(e.chi&&e.chi.i)} su ${nomeDi(e.su&&e.su.i)}`);
      if(s&&s.azioni['mx-soccer-trip']){suona(s,'mx-soccer-trip',{vel:1.3});setTimeout(()=>{if(s.azioni['mx-standing-up'])suona(s,'mx-standing-up',{vel:1.4});},900);}
      if(f){if(f.azioni.tackle)suona(f,'tackle');setTimeout(()=>avviaProc(f,'proteste',1100),450);}break;}
    case 'ammonizione':case 'espulsione':{const rosso=e.t==='espulsione';segnaCron(e.min,`${rosso?'🟥':'🟨'} ${nomeDi(e.chi&&e.chi.i)}${e.per?' ('+e.per+')':''}`);
      banner(rosso?'ESPULSO':'AMMONITO',`${nomeDi(e.chi&&e.chi.i)} · ${e.min}'`,2200,rosso?'#dc2626':'#facc15');
      if(arbitro){if(arbitro.cart)arbitro.cart.material.color.set(rosso?'#dc2626':'#facc15');avviaProc(arbitro,'cartellino',1900);}break;}
    case 'sostituzione':{segnaCron(e.min,`🔁 ${coloreLato(e.lato).sigla}: esce ${e.esce}, entra ${e.entra}`);banner('SOSTITUZIONE',`${e.esce} ↔ ${e.entra}`,2400,'#38bdf8');
      const q=corpi[e.i];if(q){fase='cambio';cambio={i:e.i,t0:t};congela=t+2600;avviaProc(q,'cinque',2200);}break;}
    case 'intervallo':segnaCron(e.min,'Fine primo tempo');banner('INTERVALLO',`${$('ris').textContent}`,2400);congela=t+2000;break;
    case 'fischio_finale':segnaCron(e.min,'Fischio finale');break;
    case 'tiro':if(e.esito!=='goal')segnaCron(e.min,`Tiro di ${nomeDi(e.chi&&e.chi.i)}: ${({saved:'parato',wide:'fuori',blocked:'murato',post:'palo'})[e.esito]||e.esito} · xG ${(e.xg||0).toFixed(2)}`);break;
    case 'occasione_eroe':segnaCron(e.min,`⭐ ${nomeEroe}: ${e.scelta}${e.scelta===e.auto?'':' (il profilo diceva '+e.auto+')'}`);break;
  }}
let banTimer=0;function banner(t,s,ms,col){$('banTit').textContent=t;$('banTit').style.color=col||'#fff';$('banSub').textContent=s;$('banner').classList.add('on');clearTimeout(banTimer);banTimer=setTimeout(()=>$('banner').classList.remove('on'),ms);}

/* ---------- 6. altezza del pallone: dal volo del motore (partenza, arrivo, tipo) ---------- */
let volo=null;
function altezzaPalla(i){const f=FR[i];if(!f)return 0.11;if(f.s!=='volo'||!f.vo){volo=null;return 0.11;}
  if(!volo||volo.a[0]!==f.vo[0]||volo.a[1]!==f.vo[1]){let tipo='corto',esito=null;for(let k=i;k>=Math.max(0,i-3);k--){const ev=EV[k]||[];for(const e of ev){if(e.t==='passaggio')tipo=e.kind||'corto';else if(e.t==='cross')tipo='cross';else if(e.t==='tiro'){tipo=e.intent==='header'?'testa':'tiro';esito=e.esito;}else if(e.t==='spazzata')tipo='spazzata';}}
    volo={da:[f.b[0],f.b[1]],a:[f.vo[0],f.vo[1]],tipo,esito,hFine:esito==='goal'?0.4+rC()*1.6:esito==='saved'?0.3+rC()*1.4:esito==='wide'?0.5+rC()*2.2:0.11};}
  const tot=Math.hypot(volo.a[0]-volo.da[0],volo.a[1]-volo.da[1])||1;const u=Math.min(1,Math.hypot(f.b[0]-volo.da[0],f.b[1]-volo.da[1])/tot);
  const picco={lancio:7,cambio:6,cross:5.5,spazzata:9,tiro:0.9,testa:0.6,filtrante:0.4,verticale:0.6}[volo.tipo]||0.25;
  const base=volo.tipo==='tiro'||volo.tipo==='testa'?(volo.tipo==='testa'?2.1:0.15)+(volo.hFine-(volo.tipo==='testa'?2.1:0.15))*u:0.11;
  return Math.max(0.11,base+picco*4*u*(1-u));}

/* ---------- 7. HUD ---------- */
$('sigC').textContent=casa.sigla;$('sigO').textContent=osp.sigla;$('colC').style.background=casa.c1;$('colO').style.background=osp.c1;
const lbl=[];function etichetta(i){let d=lbl[i];if(!d){d=document.createElement('div');d.className='lbl'+(i===21?' eroe':'');document.body.appendChild(d);lbl[i]=d;}return d;}
function aggiornaHud(i){const f=FR[Math.min(FR.length-1,i|0)];if(!f)return;
  let gc=0,go=0;for(let k=0;k<=Math.min(EV.length-1,i|0);k++)for(const e of EV[k]||[])if(e.t==='gol'){const casaStadio=(e.lato==='home')===(eroeLato==='home');if(casaStadio)gc++;else go++;}
  $('ris').textContent=`${gc} – ${go}`;const m=Math.floor(f.m);const S=P.stato;
  const fin=f.t===1?45:90;$('ora').textContent=(m>fin?fin:m)+"'";const rec=m>fin?m-fin:0;$('rec').style.display=rec>0?'block':'none';$('rec').textContent='+'+rec;
  window.__PV.risultato=[gc,go];}
const _p=new THREE.Vector3();
function aggiornaEtichette(i){const f=FR[i|0];if(!f)return;const t=performance.now();const vis=new Set([21]);if(f.pd!=null&&f.s==='tenuta')vis.add(f.pd);for(const [k,s] of etichetteExtra)if(s>t)vis.add(k);
  const rett=[];for(let k=0;k<22;k++){const d=lbl[k];if(!vis.has(k)||!corpi[k]||(f.esp||[]).includes(k)){if(d)d.style.display='none';continue;}
    const c=corpi[k];_p.set(c.radice.position.x,ALTEZZA+0.45,c.radice.position.z).project(camera);if(_p.z>1){if(d)d.style.display='none';continue;}
    const x=(_p.x+1)/2*innerWidth,y=(1-_p.y)/2*innerHeight;const e=etichetta(k);e.style.display='block';
    const lato=(k<10||k===21)?'home':'away';e.style.borderLeftColor=k===21?'#f5c542':coloreLato(lato).c1;
    const testo=`${numDi(k)} ${nomeDi(k).toUpperCase()}`;if(e._t!==testo+ruoloDi(k)){e.innerHTML=`${testo}<small>${ruoloDi(k)}</small>`;e._t=testo+ruoloDi(k);}
    e.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;rett.push({k,x,y,w:e.offsetWidth,h:e.offsetHeight});}
  /* nomi mai sovrapposti: se due etichette si toccano, la seconda sale */
  rett.sort((a,b)=>a.y-b.y);for(let a=0;a<rett.length;a++)for(let b=a+1;b<rett.length;b++){const A=rett[a],B=rett[b];if(Math.abs(A.x-B.x)<(A.w+B.w)/2&&Math.abs(A.y-B.y)<A.h){B.y=A.y-A.h-2;lbl[B.k].style.transform=`translate(${B.x.toFixed(1)}px,${B.y.toFixed(1)}px) translate(-50%,-100%)`;}}
  window.__PV.etichette=rett.map(r=>({k:r.k,x:Math.round(r.x),y:Math.round(r.y),w:r.w,h:r.h}));}
function pannello(){const T=P.motore.tabellino();const c=eroeLato==='home'?T.home:T.away,o=eroeLato==='home'?T.away:T.home;
  const r=[['Possesso %',c.possesso,o.possesso],['Tiri',c.tiri,o.tiri],['In porta',c.inPorta,o.inPorta],['xG',c.xg.toFixed(2),o.xg.toFixed(2)],['Passaggi',c.passaggi,o.passaggi],['Precisione %',c.passaggi?Math.round(100*c.passOk/c.passaggi):0,o.passaggi?Math.round(100*o.passOk/o.passaggi):0],['Falli',c.falli,o.falli],['Corner',c.corner,o.corner],['Gialli',c.ammonizioni,o.ammonizioni],['Rossi',c.espulsioni,o.espulsioni],['Parate',c.parate,o.parate]];
  $('pannello').innerHTML=`<h4>Dal motore · in tempo reale</h4><table>${r.map(x=>`<tr><td>${x[1]}</td><td>${x[0]}</td><td>${x[2]}</td></tr>`).join('')}</table><h4>Cronaca</h4><div class="cron">${cron.map(s=>`<div>${s}</div>`).join('')}</div>`;}

/* ---------- 8. la scelta dell'eroe: un INGRESSO del motore, non un esito ---------- */
const NOMI_SC={tiro:'Tira',passaggio:'Passa',dribbling:'Dribbla',cross:'Cross'};
function mostraScelta(a){fase='scelta';const box=$('scelta');box.style.display='block';$('sceltaTit').textContent=`${nomeEroe} ha la palla · ${({area:'in area',limite:'al limite',trequarti:'sulla trequarti'})[a.zona]||a.zona}`;
  $('sceltaSub').textContent=`Il profilo consiglia: ${NOMI_SC[a.auto]}. L'esito lo decide il motore.`;
  $('sceltaOp').innerHTML='';for(const k of ['tiro','passaggio','dribbling','cross']){const b=document.createElement('button');b.textContent=NOMI_SC[k]+(k===a.auto?' ★':'');if(k===a.auto)b.className='auto';b.dataset.pv='scelta-'+k;
    b.onclick=()=>{P.scegli(a.k,k);scelteUtente[a.k]=k;box.style.display='none';ultimoAttesa=null;fase='gioco';};$('sceltaOp').appendChild(b);}}

/* ---------- 9. camera ---------- */
const ZOOM=[{n:'intera',w:74,incl:58},{n:'media',w:40,incl:47},{n:'vicina',w:20,incl:34}];let iZoom=1;
const camT=new THREE.Vector3(0,0,0),camP=new THREE.Vector3(0,60,60);let camInit=false;
function camera3(f,dt,modo){const bx=W(f.b[0],f.b[1]);const asp=innerWidth/innerHeight;
  if(modo==='replay'&&replay){const l=replay.lato;const zg=l==='home'?-52.5:52.5;const s=l==='home'?-1:1;
    camT.set(bx.x*0.6,0.4,bx.z);const des=new THREE.Vector3(bx.x*0.4+6,7,zg-s*-12);camP.lerp(des,1-Math.pow(0.02,dt));camera.fov=40;}
  else{const w=ZOOM[iZoom].w;const hfov=2*Math.atan(Math.tan(THREE.MathUtils.degToRad(36)/2)*asp);const dist=(w/2)/Math.tan(hfov/2);
    const incl=THREE.MathUtils.degToRad(ZOOM[iZoom].incl);const maxX=Math.max(0,34+4-w/2);const tx=THREE.MathUtils.clamp(bx.x,-maxX,maxX);const tz=THREE.MathUtils.clamp(bx.z,-38,38);
    const avanti=w*0.12;/* la palla sta un po' sotto il centro: si vede dove va l'azione */const des=new THREE.Vector3(tx,Math.sin(incl)*dist,tz-avanti+Math.cos(incl)*dist);const desT=new THREE.Vector3(tx,0,tz-avanti);
    if(!camInit){camP.copy(des);camT.copy(desT);camInit=true;}const k=1-Math.pow(0.12,dt);camP.lerp(des,k);camT.lerp(desT,k);camera.fov=36;}
  camera.position.copy(camP);camera.lookAt(camT);camera.updateProjectionMatrix();
  sole.position.set(camT.x+40,90,camT.z+30);sole.target.position.copy(camT);}

/* ---------- 10. misure: FPS, caricamento, compenetrazioni, proporzioni ---------- */
const PV=window.__PV={versione:'fase2-proto',seme:semeIn,fps:0,fpsMin1:0,caricamentoMs:null,compenetrazioni:{corpi:0,palla:0,fotogrammi:0},errori:erroriConsole,three:THREE.REVISION};
const tempi=[];let ultimo=performance.now();
function misuraFps(t){const dt=t-ultimo;ultimo=t;/* una pausa della pagina (screenshot, cambio app) non e' un fotogramma lento: si conta a parte */if(dt>250){PV.pause=(PV.pause||0)+1;return;}tempi.push(dt);if(tempi.length>600)tempi.shift();
  if(tempi.length>30){const m=tempi.reduce((a,b)=>a+b,0)/tempi.length;const s=tempi.slice().sort((a,b)=>b-a);const p1=s[Math.max(0,Math.floor(s.length*0.01))];PV.fps=+(1000/m).toFixed(1);PV.fpsMin1=+(1000/p1).toFixed(1);}
  if(MOSTRA_FPS)$('fps').textContent=`${PV.fps||'…'} fps · 1% ${PV.fpsMin1||'…'}\ncarico ${PV.caricamentoMs!=null?(PV.caricamentoMs/1000).toFixed(1)+' s':'…'}`;}

/* ---------- 11. il ciclo ---------- */
function posa(i){/* posizioni interpolate fra due fotogrammi del motore */const a=FR[Math.floor(i)],b=FR[Math.min(FR.length-1,Math.floor(i)+1)]||a;const u=i-Math.floor(i);
  const out=new Array(22);for(let k=0;k<22;k++){const ex=a.p[k*2]+(b.p[k*2]-a.p[k*2])*u,ey=a.p[k*2+1]+(b.p[k*2+1]-a.p[k*2+1])*u;out[k]=W(ex,ey);}
  const bx=W(a.b[0]+(b.b[0]-a.b[0])*u,a.b[1]+(b.b[1]-a.b[1])*u);return{g:out,b:bx,f:a};}
let tPrec=performance.now(),disegnati=-1;
function ciclo(t){requestAnimationFrame(ciclo);const dt=Math.min(0.1,(t-tPrec)/1000);tPrec=t;misuraFps(t);if(fase!=='gioco')$('velTag').style.display='none';
  if(!pausa&&fase!=='fine'){
    if(fase==='gioco'){
      if(!P.stato.finita&&!ultimoAttesa)genera(Math.floor(tR)+ANTICIPO+2,scegliIo);
      const limite=FR.length-1;
      if(ultimoAttesa&&tR>=limite-0.001){mostraScelta(ultimoAttesa);}
      else if(tR<limite){const vb=velBersaglio();velAtt+= (vb-velAtt)*Math.min(1,dt*(vb<velAtt?6:2));$('velTag').style.display=velAtt>VEL[iVel]*2?'block':'none';tR=Math.min(limite,tR+dt/secFr());}
      else if(P.stato.finita&&tR>=limite){fine();}
      while(disegnati<Math.floor(tR)){disegnati++;for(const e of EV[disegnati]||[])faiEvento(e);}
      /* gesti anticipati: gli eventi dei prossimi due fotogrammi partono ora, allineati al contatto */
      for(let k=Math.floor(tR)+1;k<=Math.floor(tR)+2;k++){for(const e of EV[k]||[]){if(e._g)continue;e._g=1;gestoDaEvento(e,(k-tR)*secFr());}}}
    else if(fase==='esulta'&&t>congela){replay={lato:esultaDi.lato,da:Math.max(0,esultaDi.k-9),a:esultaDi.k+1,t:0};tR=replay.da;fase='replay';$('replayTag').style.display='block';for(const L of fari)L.intensity=0.9;
      for(let k=replay.da;k<=replay.a;k++)for(const e of EV[k]||[])e._g=0;}
    else if(fase==='replay'){/* il replay ha un passo SUO (0,6 s a fotogramma), indipendente dalla velocita' scelta */const RP=SEC_MIN/BATT*1.3;tR+=dt/RP;for(let k=Math.floor(tR)+1;k<=Math.floor(tR)+2&&k<=replay.a;k++){for(const e of EV[k]||[]){if(e._g)continue;e._g=1;gestoDaEvento(e,(k-tR)*RP);}}
      if(tR>=replay.a){fase='gioco';tR=replay.a;$('replayTag').style.display='none';replay=null;esultaDi=null;rientro=performance.now();}}
    else if(fase==='cambio'&&t>congela){fase='gioco';cambio=null;}
  }
  if(!FR.length){renderer.render(scene,camera);return;}
  const i=Math.max(0,Math.min(FR.length-1,tR));const S=posa(i);
  /* esultanza: il marcatore corre verso la bandierina, i compagni lo raggiungono (estetica, a cronometro fermo) */
  const off=new Array(22).fill(null);
  if(fase==='esulta'&&esultaDi){const q=Math.min(1,(t-esultaDi.t0)/2600);const sc=S.g[esultaDi.i];const zB=esultaDi.lato==='home'?-50:50;const xB=sc.x>=0?30:-30;
    const dx=(xB-sc.x)*0.55*q,dz=(zB-sc.z)*0.55*q;off[esultaDi.i]={x:dx,z:dz};for(let k=0;k<22;k++){const mio=(k<10||k===21)===(esultaDi.lato==='home');if(!mio||k===esultaDi.i||k===0||k===10)continue;const tx=sc.x+dx+(k%3-1)*1.4,tz=sc.z+dz+((k>>2)%3-1)*1.4;const dd=Math.hypot(tx-S.g[k].x,tz-S.g[k].z);const qq=Math.min(1,q*1.3)*(dd<25?0.85:0.3);off[k]={x:(tx-S.g[k].x)*qq,z:(tz-S.g[k].z)*qq};}}
  const r0=typeof rientro==='number'?Math.max(0,1-(t-rientro)/700):0;
  for(let k=0;k<22;k++){const c=corpi[k];if(!c)continue;let x=S.g[k].x,z=S.g[k].z;
    if(off[k]){x+=off[k].x;z+=off[k].z;c._off=off[k];}else if(r0>0&&c._off){x+=c._off.x*r0;z+=c._off.z*r0;}else c._off=null;
    const vx=x-c.px,vz=z-c.pz;const dist=Math.hypot(vx,vz);const vReal=dt>0?dist/dt:0;c.v=c.v*0.8+vReal*0.2;
    const guardaPalla=Math.atan2(S.b.x-x,S.b.z-z);const verso=dist>0.02?Math.atan2(vx,vz):guardaPalla;let dd=verso-c.dir;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;c.dir+=dd*Math.min(1,dt*8);
    c.radice.position.set(x,0,z);c.radice.rotation.y=c.dir;c.px=x;c.pz=z;const esp=(S.f.esp||[]).includes(k);c.radice.visible=!esp;
    if(c.mixer){locomuovi(c,c.v);c.mixer.update(dt);procedurale(c,t);}}
  /* separazione estetica (sotto 0,6 m): sposta i CORPI, non la partita. Si contano le compenetrazioni prima e dopo */
  let nC=0;for(let a=0;a<22;a++)for(let b=a+1;b<22;b++){const A=corpi[a],B=corpi[b];if(!A||!B||!A.radice.visible||!B.radice.visible)continue;const dx=B.radice.position.x-A.radice.position.x,dz=B.radice.position.z-A.radice.position.z;const d=Math.hypot(dx,dz);
    if(d<0.6){const s=(0.6-d)/2/(d||1);A.radice.position.x-=dx*s;A.radice.position.z-=dz*s;B.radice.position.x+=dx*s;B.radice.position.z+=dz*s;}
    const d2=Math.hypot(B.radice.position.x-A.radice.position.x,B.radice.position.z-A.radice.position.z);if(d2<0.55)nC++;}
  const hb=altezzaPalla(Math.floor(i));palla.position.set(S.b.x,hb,S.b.z);palla.rotation.x+=dt*4;
  let nP=0;if(hb<1.9)for(let k=0;k<22;k++){const c=corpi[k];if(!c||!c.radice.visible||k===S.f.pd)continue;if(Math.hypot(c.radice.position.x-S.b.x,c.radice.position.z-S.b.z)<0.18)nP++;}
  if(Math.floor(i)!==PV._ult){PV._ult=Math.floor(i);PV.compenetrazioni.fotogrammi++;PV.compenetrazioni.corpi+=nC?1:0;PV.compenetrazioni.palla+=nP?1:0;}
  if(arbitro){const pos=new THREE.Vector3(S.b.x+9,0,S.b.z+6);const ax=arbitro.radice.position;const vx=pos.x-ax.x,vz=pos.z-ax.z;const d=Math.hypot(vx,vz);const st=Math.min(d,dt*7);if(d>0.05){ax.x+=vx/d*st;ax.z+=vz/d*st;}
    arbitro.dir=Math.atan2(S.b.x-ax.x,S.b.z-ax.z);arbitro.radice.rotation.y=arbitro.dir;if(arbitro.mixer){locomuovi(arbitro,d>0.3?Math.min(6,st/dt):0);arbitro.mixer.update(dt);procedurale(arbitro,t);}}
  camera3(S.f,dt,fase==='replay'?'replay':'gioco');
  aggiornaHud(fase==='replay'&&esultaDi?esultaDi.k:i);aggiornaEtichette(i);
  if($('pannello').style.display==='block'&&(t|0)%500<20)pannello();
  renderer.render(scene,camera);
  if(PV.caricamentoMs==null&&corpi.length){PV.caricamentoMs=Math.round(performance.now()-T0);$('carica').style.display='none';}
  PV.fase=fase;PV.fotogramma=+i.toFixed(2);PV.minuto=S.f.m;}
let rientro=null;

/* ---------- 12. la fine: impronta della partita guardata contro la simulazione rapida con gli stessi ingressi ---------- */
function fine(){if(fase==='fine')return;fase='fine';const r=P.risultato();
  const Q2=creaPartita({registra:false,seed:semeIn,casa,ospite:osp,eroeLato,eroe:{nome:nomeEroe,ovr:78,profilo:{tiro:80,dribbling:76,passaggio:72}},scelte:Object.assign({},scelteUtente)});const s=Q2.tuttaSubito();
  const ok=s.impronta===r.impronta;PV.impronta={guardata:r.impronta,rapida:s.impronta,identiche:ok,scelte:Object.assign({},scelteUtente)};
  const gol=[];EV.forEach((ev,k)=>(ev||[]).forEach(e=>{if(e.t==='gol')gol.push({k,e});}));
  const c=r.tab[eroeLato==='home'?'eroe':'avv'],o=r.tab[eroeLato==='home'?'avv':'eroe'];
  $('fineBox').innerHTML=`<h2>${casa.sigla} ${r.casa} – ${r.ospite} ${osp.sigla}</h2>
   <div style="color:#a9b3c7">Fine ${r.durata.secondo}' · xG ${c.xg.toFixed(2)} – ${o.xg.toFixed(2)} · tiri ${c.tiri} – ${o.tiri} · possesso ${c.possesso}% – ${o.possesso}%</div>
   <div class="imp">Impronta partita guardata: <b>${r.impronta}</b><br>Simulazione rapida, stesso seme e stesse scelte: <b>${s.impronta}</b><br>${ok?'<span style="color:#34d399">✓ identiche: un solo motore</span>':'<span style="color:#f87171">✗ diverse</span>'}</div>
   ${gol.map(g=>`<div>⚽ ${g.e.min}' ${nomeDi(g.e.chi&&g.e.chi.i)} <button data-k="${g.k}" data-l="${g.e.lato}" style="padding:4px 8px;margin-left:6px">Rivedi</button></div>`).join('')||'<div style="color:#a9b3c7">Nessun gol.</div>'}
   <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button id="bNuova">Nuova partita</button><button id="bChiudi">Chiudi</button></div>`;
  $('fine').style.display='flex';
  $('fineBox').querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>{$('fine').style.display='none';const k=+b.dataset.k;esultaDi={i:(EV[k].find(e=>e.t==='gol').chi||{}).i,lato:b.dataset.l,k,t0:performance.now()};replay={lato:b.dataset.l,da:Math.max(0,k-9),a:k+1};tR=replay.da;for(let q=replay.da;q<=replay.a;q++)for(const e of EV[q]||[])e._g=0;fase='replay';$('replayTag').style.display='block';
    const torna=setInterval(()=>{if(fase==='gioco'){clearInterval(torna);fase='fine';$('fine').style.display='flex';}},200);});
  $('bNuova').onclick=()=>{const u=new URL(location.href);u.searchParams.set('seed',String((semeIn+1)>>>0));location.href=u.toString();};$('bChiudi').onclick=()=>{$('fine').style.display='none';};}

/* ---------- 13. comandi ---------- */
$('bPlay').onclick=()=>{pausa=!pausa;$('bPlay').textContent=pausa?'▶ Gioca':'⏸ Pausa';};
$('bModo').onclick=()=>{modoSalienti=!modoSalienti;$('bModo').classList.toggle('on',modoSalienti);$('bModo').textContent=modoSalienti?'Solo salienti':'Partita intera';};
$('bVel').onclick=()=>{iVel=(iVel+1)%VEL.length;$('bVel').textContent='Velocità ×'+VEL[iVel];};
$('bZoom').onclick=()=>{iZoom=(iZoom+1)%ZOOM.length;$('bZoom').textContent='Vista: '+ZOOM[iZoom].n;};
$('bScelte').onclick=()=>{scegliIo=!scegliIo;$('bScelte').classList.toggle('on',scegliIo);$('bScelte').textContent=scegliIo?'Scelgo io':'Scelte automatiche';
  if(!scegliIo&&ultimoAttesa){P.scegli(ultimoAttesa.k,ultimoAttesa.auto);scelteUtente[ultimoAttesa.k]=ultimoAttesa.auto;ultimoAttesa=null;$('scelta').style.display='none';fase='gioco';}};
$('bStat').onclick=()=>{const p=$('pannello');p.style.display=p.style.display==='block'?'none':'block';if(p.style.display==='block')pannello();};
$('bFine').onclick=()=>{/* «vai al 90'»: il motore gioca i minuti che mancano, senza grafica. Nessun salto del cronometro senza partita */
  if(ultimoAttesa){P.scegli(ultimoAttesa.k,ultimoAttesa.auto);scelteUtente[ultimoAttesa.k]=ultimoAttesa.auto;ultimoAttesa=null;$('scelta').style.display='none';}
  scegliIo=false;while(!P.stato.finita){const r=P.passo({chiedi:false});if(r&&r.eventi)EV[FR.length-1]=r.eventi;}
  for(let k=disegnati+1;k<FR.length;k++)for(const e of EV[k]||[]){if(e.t!=='gol'&&e.t!=='ammonizione'&&e.t!=='espulsione'&&e.t!=='sostituzione')continue;const m=e.min;segnaCron(m,e.t==='gol'?`⚽ ${nomeDi(e.chi&&e.chi.i)}`:e.t);}
  disegnati=FR.length-1;tR=FR.length-1;fase='gioco';};
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
/* collaudo: le sonde possono pilotare la vista senza toccare il motore */
PV.comandi={modo:(m)=>{modoSalienti=m!=='integrale';},vel:(v)=>{iVel=Math.max(0,VEL.indexOf(v));},vaiAlFischio:()=>$('bFine').onclick(),scegli:(k)=>{const b=document.querySelector(`[data-pv="scelta-${k}"]`);if(b)b.click();},auto:()=>{if(scegliIo)$('bScelte').onclick();},zoom:(n)=>{iZoom=Math.max(0,ZOOM.findIndex(z=>z.n===n));$('bZoom').textContent='Vista: '+ZOOM[iZoom].n;}};
PV.proporzioni={campo:[105,68],porta:[7.32,2.44],giocatore:ALTEZZA,palla:0.22};

/* ---------- 14. partenza: corpi dal pacchetto del gioco; se non arrivano, sagome semplici (la partita resta la stessa) ---------- */
const avvia=()=>{for(let i=0;i<N;i++)corpi.push(creaCorpo(i));
  arbitro=creaCorpo(22);if(arbitro.ossa&&arbitro.ossa.hand_r){const cart=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.1,0.005),new THREE.MeshBasicMaterial({color:'#facc15'}));cart.position.set(0,0.1,0);cart.visible=false;arbitro.ossa.hand_r.add(cart);cart.scale.multiplyScalar(1/arbitro.obj.scale.x);arbitro.cart=cart;}
  /* ?da=MIN: i minuti prima li gioca il motore senza grafica (scelte automatiche), la vista parte da li'. Serve al collaudo e a «salta a» */
  const da=+Q.get('da')||0;if(da>1){while(!P.stato.finita&&(FR.length===0||FR[FR.length-1].m<da)){const r=P.passo({chiedi:false});if(r&&r.eventi)EV[FR.length-1]=r.eventi;}
    for(let k=0;k<FR.length;k++)for(const e of EV[k]||[]){e._g=1;if(e.t==='gol'||e.t==='ammonizione'||e.t==='espulsione'||e.t==='sostituzione')segnaCron(e.min,e.t==='gol'?'⚽ '+nomeDi(e.chi&&e.chi.i):e.t);}
    tR=FR.length-1;disegnati=FR.length-1;}
  genera(Math.floor(tR)+ANTICIPO+2,scegliIo);for(let k=0;k<22;k++){const c=corpi[k];const f=FR[Math.floor(tR)];if(!f)continue;const w=W(f.p[k*2],f.p[k*2+1]);c.px=w.x;c.pz=w.z;}
  /* tutto sulla scheda grafica PRIMA del fischio: shader e texture mai inquadrati prima causavano lo scatto (1% a 30 fps al 45', misura PO) */
  try{renderer.compile(scene,camera);scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)for(const k of ['map','emissiveMap'])if(m[k])renderer.initTexture(m[k]);});}catch(_e){}
  requestAnimationFrame(ciclo);};
const base=(Q.get('asset')||'../../assets/');const lod=Q.get('lod')==='1'?'lod1':'lod2';
if(!THREE.GLTFLoader||!THREE.SkeletonUtils||Q.get('corpi')==='0'){console.warn('GLTFLoader assente: sagome semplici');avvia();}
else{const L=new THREE.GLTFLoader();let pronti=0;const fatto=()=>{if(++pronti===2)avvia();};
  L.load(base+'cgtrader-review-'+lod+'-kit-adapter.glb',(g)=>{pacchetto=g;fatto();},undefined,(e)=>{console.warn('corpi non caricati',e);fatto();});
  L.load(base+'cgtrader-clip-mixamo.glb',(g)=>{clipMx=(g.animations||[]).filter(c=>/trip|fallen|standing|throw-in/.test(c.name));fatto();},undefined,()=>fatto());}
})();
