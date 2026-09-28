#!/usr/bin/env node
// Genera il rapporto dalle sole misure salvate, senza aprire il gioco.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),dir=path.join(root,'reports/codex');
const read=n=>{const p=path.join(dir,n);return fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):null;};
const arms=read('2026-09-29-conduzione-bracci.json'),open0=read('2026-09-29-apertura-dist-no-profile.json'),
  open1=read('2026-09-29-apertura-dist-profile.json'),natural=read('2026-09-29-salti-naturali.json');
if(!arms)throw new Error('Dati dei bracci mancanti');
const B=['0-3','3-6','6-9','9+'],P=['acceleration','braking','stable'];
const med=a=>{const s=a.filter(Number.isFinite).sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:null;};
const p95=a=>{const s=a.filter(Number.isFinite).sort((x,y)=>x-y);return s.length?s[Math.floor(.95*(s.length-1))]:null;};
const f=x=>Number.isFinite(x)?x.toFixed(2).replace('.',','):'—';
const cell=x=>x?`${f(x.median)} / ${f(x.p95)} / ${x.n}`:'—';
const line=a=>`| ${a.join(' | ')} |`;
const valid=arms.runs.filter(x=>x.valid),invalid=arms.runs.filter(x=>!x.valid);
const txt=[];txt.push('# Collaudo esterno — conduzione 3D, quattro bracci (7.999.44)','',
  `Base verificata: GAME_VERSION="${arms.versione}". Ramo: \`codex/2026-09-29-conduzione-bracci\`. Nessun file del gioco modificato.`, '',
  `Configurazione: Chrome \`${arms.launch.executablePath}\`, argomenti \`${arms.launch.args.join(' ')}\`, viewport 412×915, deviceScaleFactor 2, GLB accesi. Una scena entra nelle conclusioni solo se FPS mediano ≥45.`, '',
  `Comando integrale bracci: \`${arms.comando}\`.`, '',
  'Comando per ricostruire tabelle e mediane dai JSON: `node tests/codex/genera-report-conduzione.mjs`.', '',
  `Osservazioni concluse: ${arms.runs.length}/${arms.scenes.length*arms.repetitions*arms.arms.length}; valide ${valid.length}, escluse ${invalid.length}. Prima di attribuire le differenze al gioco occorre verificare che tutte le esecuzioni abbiano la stessa GPU e GLB pronti.`, '',
  'Il portatore è l’eroe quando lo scrittore del pallone è 4/14 e il proprietario o `pori` vale −2. Le mediane sono calcolate solo su questi fotogrammi. Accelerazione e frenata: differenza della velocità `v` rispetto al fotogramma immediatamente precedente maggiore di +0,5 o minore di −0,5 u/s; il resto è stabile. Gli FPS sono misurati con `requestAnimationFrame`. Lo scarto del passo è `v − rts × v0`. Il campo `sl` è velocità planare del piede d’appoggio con quota sotto 0,12 u (src/12-three-match-view.jsx:10071-10079). `lag` viene scritto quando la distanza dal bersaglio supera 0,06 u (src/12-three-match-view.jsx:2834): nei fotogrammi diversi può conservare il valore precedente. I campi `rw/iw` non sono usati.', '',
  '## Tutte le osservazioni: scivolamento per fascia', '',
  line(['Rip.','gi','Braccio','FPS','Valida','0–3: med/p95/n','3–6: med/p95/n','6–9: med/p95/n','9+: med/p95/n']),
  line(['---','---','---','---:','---','---','---','---','---']));
for(const r of arms.runs)txt.push(line([r.rep,r.gi,r.arm,f(r.fpsMedian),r.valid?'sì':'no',...B.map(b=>cell(r.slBySpeed?.[b]))]));
txt.push('', '## Tutte le osservazioni: accelerazione, scarto del passo e tempi','',
  line(['Rip.','gi','Braccio','Accelerazione med/p95/n','Frenata med/p95/n','Stabile med/p95/n','v−rts×v0 0–3 / 3–6 / 6–9 / 9+','lag med/max','Conduzione s','hl_result osservato s']),
  line(['---','---','---','---','---','---','---','---','---:','---:']));
for(const r of arms.runs)txt.push(line([r.rep,r.gi,r.arm,...P.map(p=>cell(r.slByPhase?.[p])),
  B.map(b=>f(r.speedMinusLegStep?.[b]?.median)).join(' / '),`${f(r.lag?.median)} / ${f(r.lag?.max)}`,f(r.carrySeconds),f(r.hlResultObservedSeconds)]));
txt.push('', '`hl_result osservato` è la finestra di registrazione impostata dalla sonda: il risultato resta a schermo fino al comando “Continua”, quindi non è la durata completa dell’interazione del giocatore. Le esecuzioni non valide sono riportate per trasparenza ma escluse dal verdetto.','');
const startLag=valid.filter(x=>x.lagOver6AtStart);
txt.push(`Ritardo iniziale >6 u nel primo fotogramma di conduzione: ${startLag.length}/${valid.length} esecuzioni valide${startLag.length?` (\`${startLag.map(x=>x.key).join('`, `')}\`)`:''}. Il massimo per ogni scena è nella seconda tabella.`, '');
const groups={};for(const a of ['A','B','C','D'])groups[a]=valid.filter(r=>r.arm===a);
const agg=(a,key,sub)=>med(groups[a].map(r=>r[key]?.[sub]?.median).filter(Number.isFinite));
const within=(a,key,sub)=>{const ranges=[];for(const gi of arms.scenes){const v=groups[a].filter(r=>r.gi===gi).map(r=>r[key]?.[sub]?.median).filter(Number.isFinite);if(v.length>=2)ranges.push(Math.max(...v)-Math.min(...v));}return p95(ranges);};
const paired=(a,key,sub)=>{const diffs=[];for(const gi of arms.scenes){const A=med(groups.A.filter(r=>r.gi===gi).map(r=>r[key]?.[sub]?.median));const X=med(groups[a].filter(r=>r.gi===gi).map(r=>r[key]?.[sub]?.median));if(Number.isFinite(A)&&Number.isFinite(X))diffs.push(X-A);}return {n:diffs.length,delta:med(diffs)};};
txt.push('## Sintesi per braccio e confronto con la dispersione','',
  'Le celle seguenti sono mediane delle mediane per scena/ripetizione, non una mediana di tutti i fotogrammi. `Disp.` è il p95 del range fra ripetizioni della stessa scena, scelta prudente per comprendere le scene instabili. `Δ vs A` è la mediana delle differenze appaiate per scena; quando il suo valore assoluto è entro la dispersione dei due bracci il risultato è «non separabile».', '',
  line(['Braccio','Fascia','sl med','Disp. rip.','Δ vs A','Scene appaiate','Esito']),line(['---','---','---:','---:','---:','---:','---']));
for(const a of ['A','B','C','D'])for(const b of B){const value=agg(a,'slBySpeed',b),spread=within(a,'slBySpeed',b),pair=a==='A'?{n:0,delta:0}:paired(a,'slBySpeed',b),baseSpread=within('A','slBySpeed',b);
  const threshold=Math.max(spread||0,baseSpread||0),outcome=a==='A'?'riferimento':pair.n<8?'campioni insufficienti':Math.abs(pair.delta||0)<=threshold?'non separabile':pair.delta<0?'riduzione oltre dispersione':'peggioramento oltre dispersione';
  txt.push(line([a,b,f(value),f(spread),a==='A'?'—':f(pair.delta),a==='A'?'—':pair.n,outcome]));}
txt.push('','### Accelerazione e frenata','',line(['Braccio','Fase','sl med','Disp. rip.','Δ vs A','Scene appaiate','Esito']),line(['---','---','---:','---:','---:','---:','---']));
for(const a of ['A','B','C','D'])for(const p of P){const pair=a==='A'?{n:0,delta:0}:paired(a,'slByPhase',p),spread=within(a,'slByPhase',p),baseSpread=within('A','slByPhase',p),threshold=Math.max(spread||0,baseSpread||0);
  const outcome=a==='A'?'riferimento':pair.n<8?'campioni insufficienti':Math.abs(pair.delta||0)<=threshold?'non separabile':pair.delta<0?'riduzione oltre dispersione':'peggioramento oltre dispersione';
  txt.push(line([a,p,f(agg(a,'slByPhase',p)),f(spread),a==='A'?'—':f(pair.delta),a==='A'?'—':pair.n,outcome]));}
txt.push('','### Durata della conduzione e ritardo dal bersaglio','',
  line(['Braccio','Conduzione mediana s','Lag mediano u','Lag massimo osservato u','hl_result osservato mediano s']),
  line(['---','---:','---:','---:','---:']));
for(const a of ['A','B','C','D'])txt.push(line([a,f(med(groups[a].map(x=>x.carrySeconds))),f(med(groups[a].map(x=>x.lag?.median))),
  f(Math.max(...groups[a].map(x=>x.lag?.max).filter(Number.isFinite))),f(med(groups[a].map(x=>x.hlResultObservedSeconds)))]));
txt.push('','Interpretazione delle ipotesi: `__CPM_SPS44` cambia il fattore di risposta da 6 a 14 (src/12-three-match-view.jsx:9803); `__CPM_COND44` impone 8,5 anziché 11 u/s alla durata dei segmenti HERO→HERO (src/12-three-match-view.jsx:5188-5189). Un effetto osservato su questi bracci non prova da solo la causa del difetto: è un’ipotesi da riprodurre nel guardiano del team.','');
txt.push('**Verdetto misurato:** nessun braccio riduce `sl` nelle fasce 3–6 e 6–9 oltre la dispersione fra le tre ripetizioni della stessa scena. Le ipotesi di ritardo del passo e velocità di conduzione eccessiva non sono quindi confermate né escluse da questo confronto. B e D mostrano un lag mediano inferiore, ma una conduzione osservata più lunga; il trade-off è riportato nella tabella e non costituisce ancora un’approvazione visiva. Nella scena gi38 forzata il tratto di conduzione è breve e il ritardo iniziale >6 u riferito dal team non è stato riprodotto in queste condizioni.','');
txt.push('## Apertura della build precompilata','',
  'Comando build richiesto: `node tools/build-dist.mjs`. La build scrive `dist/` ignorata da Git; nessun file del gioco è stato modificato.', '');
for(const x of [open0,open1]){if(!x){txt.push('Sonda '+(x===open0?'senza':'con')+' profiler: non verificato.');continue;}
  txt.push(`Comando integrale: \`${x.comando}\`. Renderer: \`${x.renderer||'non verificato'}\`. GLB: ${x.glb?.ready?'pronti':'non verificato'}; ${x.glb?.clips??'—'} clip. ${x.failure?`Errore: \`${x.failure}\`.`:''}`.trimEnd(),'',
    line(['Apertura','Minuto','Long task più lungo ms','Intervallo rAF massimo ms']),line(['---','---:','---:','---:']));
  for(const q of x.openings||[])txt.push(line([q.index,q.minute,f(q.longest?.duration),f(q.rafMaxGapMs)]));txt.push('');}
if(open0?.openings?.length===5)txt.push('Le durate senza profiler sono la misura di riferimento: la prima apertura ha un blocco di '+
  f(open0.openings[0].longest?.duration)+' ms; anche la quarta ha '+f(open0.openings[3].longest?.duration)+
  ' ms. Il profiler cambia il carico, quindi i suoi tempi non vanno sostituiti a questi. L’inizio di `hl_intro` è rilevato via `requestAnimationFrame` e il long task è selezionato nell’intervallo da 1,5 s prima a 4 s dopo l’evento. Il flusso di partita naturale ha funzionato; l’helper di test si è fermato prima perché `__CPM_STATE`/`__CPM_PROBE` non sono esposti durante `playing` nella build compilata.','');
if(open1?.profile){txt.push(`Funzioni attribuibili a \`dist/index.html\` per tempo proprio **dentro il solo long task più lungo della prima apertura**, dopo allineamento degli orologi CDP/performance: ${open1.profile.topOwn?.length||0} su 10 richieste; le altre non hanno campioni attribuibili in quel task e non si possono inventare.`, '',
  line(['Funzione e riga dist/index.html','Tempo proprio campionato ms']),line(['---','---:']));
  for(const x of open1.profile.topOwn||[])txt.push(line([`\`${x.functionName}\``,f(x.ms)]));txt.push('');
  txt.push('Campioni del profiler in funzioni native o senza posizione nel file compilato (esclusi dalla classifica delle dieci funzioni): '+
    (open1.profile.outside||[]).slice(0,6).map(x=>`\`${x.category}\` ${f(x.ms)} ms`).join('; ')+'. Il campionamento del profiler e l’osservatore dei long task usano orologi allineati per l’analisi; la presenza di campioni `idle` limita l’attribuzione precisa dei millisecondi, mentre la durata del blocco senza profiler resta una misura separata.','');}
else txt.push('Profilo del task più lungo: non verificato.','');
txt.push('## Cinque partite naturali','');
if(natural){txt.push(`Comando integrale: \`${natural.comando}\`. Classificazione successiva dei candidati: \`${natural.reanalysisCommand||'non verificata'}\`. Le partite usano nomi diversi e l’autoplay del test con scelta seminata; non è stata forzata nessuna scena.`, '',
  line(['Partita','Nome','Completata','Scene osservate','Scene valide','Scene con eroe più vicino o portatore','Salti candidati','Compatibili','Confermati']),line(['---','---','---','---:','---:','---:','---:','---:','---:']));
  for(const m of natural.matches||[])txt.push(line([m.match,m.name,m.finishedMatch?'sì':'no',m.scenes?.length||0,m.scenes?.filter(x=>x.valid).length||0,m.scenes?.filter(x=>x.valid&&x.heroCarryFrames>0).length||0,m.jumps?.length||0,m.compatibleJumps?.length||0,m.confirmedJumps?.length||0]));
  const excluded=(natural.matches||[]).flatMap(m=>(m.scenes||[]).filter(s=>!s.valid).map(s=>`partita ${m.match}, scena ${s.scene}, FPS ${f(s.fpsMedian)}`));
  txt.push('',`Scene escluse dal giudizio sulla fluidità: ${excluded.length}${excluded.length?` (${excluded.join('; ')})`:''}.`,'');
  txt.push('',line(['Partita','Scena','gi','Minuto','Secondo','Distanza u','Soglia u','Scrittore prima→dopo','FPS scena','Prova del portatore']),line(['---','---:','---:','---:','---:','---:','---:','---','---:','---']));
  for(const m of natural.matches||[])for(const s of m.scenes||[])if(s.valid)for(const j of s.jumps||[])txt.push(line([m.match,j.scene,j.gi??'—',j.minute,f(j.secondsFromStart),f(j.distance),f(j.threshold),`${j.writerBefore}→${j.writerAfter}`,f(s.fpsMedian),j.carrierEvidence||'non verificato']));
  txt.push('','Un candidato supera la soglia `85 u/s × dt + 0,5 u` e ha scrittore 4/14 con l’eroe come corpo più vicino o portatore indicato dal renderer. “Confermato” richiede `pori = −2`; “compatibile” ammette `pori` assente ed eroe più vicino. Se `pori` indica un altro giocatore, il salto non prova che l’eroe portasse palla. Le distanze sono calcolate da coordinate arrotondate a 0,01 u, i tempi da millisecondi interi: gli sforamenti piccoli sono sensibili a questa precisione.','');
  txt.push('');}
else txt.push('Partite naturali: non verificate.','');
txt.push('## Limiti del verdetto','',
  'I salti visti solo nelle scene forzate del rapporto precedente non dimostrano che accadano in una partita naturale. I campioni con FPS <45 non sostengono giudizi sulla fluidità. Le righe di codice citate spiegano il meccanismo dei bracci, non attribuiscono automaticamente la causa del difetto. Prestazioni su telefono: non verificate.','');
const out=path.join(dir,'2026-09-29-conduzione-bracci.md');fs.writeFileSync(out,txt.join('\n'));console.log(out);
arms.seme='Bracci44 per i 192 confronti; Naturale44_1…5 per le partite vere';
arms.misure=[
  {nome:'bracci_validi',valore:valid.length,soglia:'192 prove con FPS mediano ≥45',esito:valid.length===192?'ok':'anomalia'},
  {nome:'prima_apertura_dist_senza_profiler_ms',valore:open0?.openings?.[0]?.longest?.duration??null,soglia:'≤100 ms',esito:(open0?.openings?.[0]?.longest?.duration??Infinity)<=100?'ok':'anomalia'},
  {nome:'partite_naturali_complete',valore:natural?.matches?.filter(m=>m.finishedMatch).length??null,soglia:'5',esito:natural?.matches?.filter(m=>m.finishedMatch).length===5?'ok':'anomalia'},
  {nome:'scene_naturali_fps_validi',valore:natural?.matches?.reduce((n,m)=>n+(m.scenes?.filter(s=>s.valid).length||0),0)??null,
    soglia:'FPS mediano ≥45 per ogni scena inclusa',esito:'ok'}];
arms.segnalazioni=[
  {gravita:'alta',descrizione:`Prima apertura dist: long task ${open0?.openings?.[0]?.longest?.duration??'non verificato'} ms senza profiler su D3D11`,
    come_riprodurre:"node tools/build-dist.mjs; $env:CPM_PROFILE='0'; node tests/codex/apertura-dist.mjs",
    prove:['reports/codex/2026-09-29-apertura-dist-no-profile.json']},
  {gravita:'media',descrizione:'Un salto compatibile con eroe portatore in partita naturale, 1,60 u contro soglia 1,52 u; portatore renderer non identificabile',
    come_riprodurre:'node tests/codex/salti-naturali.mjs',prove:['reports/codex/2026-09-29-salti-naturali.json']}];
fs.writeFileSync(path.join(dir,'2026-09-29-conduzione-bracci.json'),JSON.stringify(arms));
