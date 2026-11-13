#!/usr/bin/env node
/* [giro 172 · PO-369/370] REGISTRA la pagina d'ascolto docs/sviluppo/giro172/ascolto.html dal GIOCO VERO (sito dist-web, volumi di
   categoria di default): «prima» = rosso __CPM_NO_G172 sullo stesso build (audio del giro 161b), «dopo» = giro 172.
   Uso: node tools/build-dist.mjs --web && node ascolto-172.mjs   (scrive prima/*.mp3, dopo/*.mp3, misure.json e la pagina) */
import fs from 'node:fs';
import path from 'node:path';
import { sito, apriSito, registra, aMp3, loud, sleep, ROOT } from './lib/audio-172.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const OUT = path.join(ROOT, 'docs/sviluppo/giro172');
const W = ms => `await new Promise(r=>setTimeout(r,${ms}));`;
/* [id, etichetta, gruppo, codice (async, nella pagina), durata ms] */
const EVENTI = [
  ['letto', 'Letto della folla, 20 s senza azioni', 'Pubblico', "AudioMgr.enterMatch(5)", 20000],
  ['occasione', 'Letto + occasione: tiro, la curva si scalda, tiro fuori («ohh»)', 'Pubblico', `(async()=>{AudioMgr.enterMatch(6);${W(5000)}AudioMgr.event({type:'ActionResolved',hlType:'shot'});${W(2500)}AudioMgr.event({type:'CoherenceCheck',outKind:'wide'});})()`, 16000],
  ['gol', 'Gol: rete + boato, poi lo stadio si calma da solo', 'Pubblico', `(async()=>{AudioMgr.enterMatch(7);${W(4000)}AudioMgr.event({type:'GoalHero'});})()`, 16000],
  ['gol-subito', 'Gol subito: fischi della curva', 'Pubblico', `(async()=>{AudioMgr.enterMatch(8);${W(4000)}golSubito161('ascolto');})()`, 9000],
  ['fallo', 'Fallo: fischietto + fischi', 'Pubblico', `(async()=>{AudioMgr.enterMatch(9);${W(4000)}AudioMgr.event({type:'CoherenceCheck',outKind:'foul'});})()`, 8000],
  ['ohh-x3', 'Tre tiri fuori di fila: le varianti dell\'«ohh»', 'Pubblico', `(async()=>{AudioMgr.enterMatch(10);${W(3000)}for(let i=0;i<3;i++){AudioMgr.event({type:'CoherenceCheck',outKind:'wide'});${W(4500)}}})()`, 17000],
  ['tocchi', 'Menu: 10 tocchi di navigazione', 'Menu', `(async()=>{AudioMgr.scene('home');const el=[...document.querySelectorAll('button,[role="button"],a[href],label')].filter(e=>e.getBoundingClientRect().width>4);for(let i=0;i<10;i++){el[i%el.length].dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));${W(380)}}})()`, 5000],
  ['conferma', 'Menu: conferma importante', 'Menu', "AudioMgr.play('ui.confirm')", 1200],
  ['finestra', 'Menu: apertura di una finestra principale', 'Menu', "AudioMgr.play('ui.popup')", 1200],
  ['notifica-pos', 'Notifica positiva', 'Menu', "AudioMgr.play('notify.pos')", 1400],
  ['notifica-neg', 'Notifica negativa', 'Menu', "AudioMgr.play('notify.neg')", 1400],
  ['notifica-info', 'Notifica informativa', 'Menu', "AudioMgr.play('notify.info')", 1400],
];
const MIS = {};
const { srv, url } = sito();
for (const rosso of [true, false]) {
  const S = await apriSito(url, { rosso });
  if (!S.monta) throw new Error('la pagina non monta');
  const dir = path.join(OUT, rosso ? 'prima' : 'dopo'); fs.mkdirSync(dir, { recursive: true });
  for (const [id, , , codice, ms] of EVENTI) {
    const mp3 = aMp3(await registra(S.p, codice, ms, { dopo: "AudioMgr.hushMatch()" }), path.join(dir, id + '.mp3'));
    const m = loud(mp3); MIS[id] = MIS[id] || {}; MIS[id][rosso ? 'prima' : 'dopo'] = { picco_db: m.picco_db == null ? null : +m.picco_db.toFixed(1), rms_db: m.rms_db == null ? null : +m.rms_db.toFixed(1), lufs: m.lufs, m_mediana: m.m_mediana };
    console.log(`${rosso ? 'prima' : 'dopo '} ${id.padEnd(14)} ${JSON.stringify(MIS[id][rosso ? 'prima' : 'dopo'])}`);
    await sleep(300);
  }
  await S.b.close();
}
srv.close();
const dati = EVENTI.map(([id, nome, gruppo]) => ({ id, nome, gruppo, ...MIS[id] }));
fs.writeFileSync(path.join(OUT, 'misure.json'), JSON.stringify({ _nota: 'registrazioni del master dal gioco vero (dist-web), volumi di default: picco/RMS dBFS, LUFS integrati, loudness momentanea mediana', eventi: dati }, null, 1));
const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ascolto audio 172</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#16202b;--mute:#5b6775;--line:#dde2e8;--acc:#1f6feb;--prima:#8a5a00;--dopo:#0a7a3e}
@media (prefers-color-scheme:dark){:root{--bg:#0e1319;--card:#161d26;--ink:#e6edf3;--mute:#9aa7b4;--line:#2a3441;--acc:#58a6ff;--prima:#e3b341;--dopo:#3fb950}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:860px;margin:0 auto;padding:20px 16px 48px}
h1{font-size:22px;margin:0 0 4px}
p.sub{color:var(--mute);margin:0 0 16px;font-size:14px}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--mute);margin:24px 0 8px}
.ev{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0;display:grid;grid-template-columns:1fr auto auto;gap:8px 10px;align-items:center}
.ev .n{font-weight:600}
.ev .m{grid-column:1/-1;color:var(--mute);font-size:12.5px;font-variant-numeric:tabular-nums}
button{font:inherit;font-size:14px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);padding:8px 14px;min-height:40px;cursor:pointer}
button.p{border-color:var(--prima);color:var(--prima)}
button.d{border-color:var(--dopo);color:var(--dopo)}
button.on{background:var(--acc);border-color:var(--acc);color:#fff}
.top{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 4px}
.nota{font-size:13px;color:var(--mute);border-left:3px solid var(--line);padding-left:10px;margin:12px 0}
@media (max-width:420px){.ev{grid-template-columns:1fr 1fr}.ev .n{grid-column:1/-1}}
</style>
</head>
<body>
<main>
<h1>Audio del giro 172 — pubblico e menu, prima e dopo</h1>
<p class="sub">Registrati dal gioco vero, con i volumi di categoria di default. «Prima» è l'audio del giro 161b (letto della folla sintetico in loop da 23,8 s, un suono a ogni tocco); «dopo» è il giro 172.</p>
<div class="top"><button id="tutti-p" class="p">▶ Tutti «prima»</button><button id="tutti-d" class="d">▶ Tutti «dopo»</button><button id="stop">■ Ferma</button></div>
<p class="nota">Il letto nuovo è la registrazione CC0 dello Stade de France (Romainbehar, Wikimedia Commons) senza il tratto dell'«ohh», suonata a porzioni che cambiano. I tagli sono stati scelti misurando inviluppo e creste, non all'ascolto: vanno giudicati qui. Il secondo «ohh» è derivato dal primo (stessa registrazione, un po' più grave e lento). «10 tocchi di navigazione» dopo è silenzio di proposito: il menu suona solo su conferme, finestre principali e notifiche.</p>
<div id="lista"></div>
</main>
<script>
var EV=${JSON.stringify(dati)};
var lista=document.getElementById('lista'),cur=null,coda=[],gruppo='';
function suona(src,btn){ferma();cur=new Audio(src);if(btn){btn.classList.add('on');cur.onended=function(){btn.classList.remove('on');prossimo();};}else cur.onended=prossimo;cur.play().catch(function(){});cur._b=btn;}
function ferma(){if(cur){cur.pause();if(cur._b)cur._b.classList.remove('on');cur=null;}}
function prossimo(){if(coda.length){var x=coda.shift();suona(x[0],x[1]);}}
var f=function(x){return (x&&x.picco_db!=null)?('picco '+x.picco_db+' · RMS '+x.rms_db+(x.lufs!=null?' · '+x.lufs+' LUFS':'')):'silenzio';};
EV.forEach(function(e){
  if(e.gruppo!==gruppo){gruppo=e.gruppo;var h=document.createElement('h2');h.textContent=gruppo;lista.appendChild(h);}
  var d=document.createElement('div');d.className='ev';d.id='ev-'+e.id;
  d.innerHTML='<span class="n"></span><button class="p">▶ prima</button><button class="d">▶ dopo</button><span class="m"></span>';
  d.querySelector('.n').textContent=e.nome;d.querySelector('.m').textContent='prima: '+f(e.prima)+'   ·   dopo: '+f(e.dopo);
  var bp=d.querySelector('.p'),bd=d.querySelector('.d');
  bp.onclick=function(){coda=[];suona('prima/'+e.id+'.mp3',bp);};
  bd.onclick=function(){coda=[];suona('dopo/'+e.id+'.mp3',bd);};
  lista.appendChild(d);
});
function tutti(q){coda=EV.map(function(e){return [q+'/'+e.id+'.mp3',document.querySelector('#ev-'+e.id+' .'+(q==='prima'?'p':'d'))];});prossimo();}
document.getElementById('tutti-p').onclick=function(){tutti('prima');};
document.getElementById('tutti-d').onclick=function(){tutti('dopo');};
document.getElementById('stop').onclick=function(){coda=[];ferma();};
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'ascolto.html'), html);
console.log('scritta docs/sviluppo/giro172/ascolto.html');
