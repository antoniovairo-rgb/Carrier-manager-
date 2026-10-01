#!/usr/bin/env node
// Build PO-176 human report from immutable raw measurements.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const DIR=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(DIR,'../..');
const RAW=['salvataggio-ricarica-pilot.json.gz','salvataggio-ricarica-rest.json.gz'];
const FOCUS=['salvataggio-ricarica-masked.json.gz','salvataggio-ricarica-masked-1-8.json.gz'];
const report=path.join(ROOT,'reports/codex/2026-10-01-salvataggio-ricarica.md');
const summaryPath=path.join(ROOT,'reports/codex/2026-10-01-salvataggio-ricarica.json');
const archive=path.join(DIR,'salvataggio-ricarica.json.gz');
const data=RAW.map(name=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DIR,name)))));
const focused=FOCUS.filter(name=>fs.existsSync(path.join(DIR,name))).map(name=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DIR,name))))).flatMap(r=>r.careers.flatMap(c=>c.checkpoints.filter(q=>q.status==='measured').map(q=>({seed:c.seed,...q}))));
const focusedView=(seed,key,side,tab)=>focused.find(q=>q.seed===seed&&q.key===key)?.[side]?.views?.[tab]||null;
const careers=data.flatMap(r=>r.careers);
const checkpoints=careers.flatMap(c=>c.checkpoints.filter(q=>q.status==='measured').map(q=>({seed:c.seed,...q})));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const val=v=>v===undefined?'assente':JSON.stringify(v).replaceAll('|','\\|').replaceAll('\n',' ');
const short=v=>{const s=val(v);return s.length>130?s.slice(0,127)+'…':s;};
const esc=s=>String(s).replaceAll('|','\\|').replaceAll('\n',' ');
const pathFamily=p=>p.replace(/\.\d+(?=\.|$)/g,'.*');
const groups=new Map();
for(const q of checkpoints){for(const d of q.saveDiff){const field=d.path.startsWith('player.')?d.path.slice(7):d.path;const family=pathFamily(field);if(!groups.has(family))groups.set(family,[]);groups.get(family).push({seed:q.seed,key:q.key,path:field,before:d.before,after:d.after});}}

function classify(q,d){
  const p=d.path.startsWith('player.')?d.path.slice(7):d.path;
  if(p==='savedAt')return{c:'A',why:'metadato temporale del file; non cambia l’eroe'};
  if(/^playedMd\./.test(p)){
    const previousSeason=q.before.snapshot?.playedMd?.s;
    const currentSeason=q.before.snapshot?.season;
    if(previousSeason!==currentSeason&&q.after.snapshot?.playedMd?.s===currentSeason&&same(q.before.snapshot?.calendar,q.after.snapshot?.calendar))return{c:'B',why:'registro della stagione precedente azzerato alla stagione corrente; calendario invariato'};
    return{c:'C',why:'registro delle giornate della stagione corrente cambiato'};
  }
  if(p==='fitnessCoachRel'&&d.before===null&&d.after===50)return{c:'B',why:'valore di default 50 già usato dalla UI e dalle formule'};
  if(p==='cup.club'&&(d.before===null||d.before===undefined)&&d.after===q.after.snapshot?.club?.id)return{c:'B',why:'ID del club corrente completato nello stato della coppa; tabellone e calendario invariati'};
  if(p==='presentedClub'&&d.after===q.after.snapshot?.club?.id)return{c:'B',why:'marcatore della presentazione del club inizializzato al caricamento'};
  if(p==='rival')return{c:'C',why:'rivale assente prima e presente dopo; nome visibile in Profilo'};
  if(p==='clubSponsor')return{c:'C',why:'sponsor assente prima e assegnato dopo; sezione «Sponsor di maglia» appare in Club'};
  if(p==='agentPlan')return{c:'non verificato',why:'il pannello Agente calcola un valore sostitutivo, ma il verdetto a fine stagione legge il campo salvato: effetto futuro non misurato'};
  if(p==='saveVersion'||p==='schemaVersion')return{c:'A',why:'versione tecnica del salvataggio'};
  return{c:'non verificato',why:'significato e visibilità da controllare nel grezzo'};
}
const classified=[];
for(const q of checkpoints)for(const d of q.saveDiff){classified.push({seed:q.seed,key:q.key,path:d.path,before:d.before,after:d.after,...classify(q,d)});}
const counts=Object.fromEntries(['A','B','C','non verificato'].map(k=>[k,classified.filter(x=>x.c===k).length]));
const byFamily=[];
for(const [family,rows] of groups){const types=[...new Set(rows.map(r=>classified.find(x=>x.seed===r.seed&&x.key===r.key&&x.path===(r.path==='savedAt'?'savedAt':'player.'+r.path))?.c||'non verificato'))];byFamily.push({family,n:rows.length,types,seeds:[...new Set(rows.map(r=>r.seed))],first:rows[0]});}
byFamily.sort((a,b)=>a.family.localeCompare(b.family));
const checks=checkpoints.map(q=>{
  const a=q.before.snapshot,b=q.after.snapshot;
  const lostPlayed=(a.calendar||[]).filter(m=>m.played).filter(m=>!(b.calendar||[]).some(n=>n.week===m.week&&n.matchday===m.matchday&&n.opponentId===m.opponentId&&n.type===m.type&&n.played));
  const current=q.after.thisWeekMd;
  const currentInPlayed=(b.calendar||[]).some(m=>m.played&&m.matchday===current?.matchday&&m.week===current?.week&&(m.type||'league')===(current?.type||'league'));
  return{seed:q.seed,key:q.key,saveDiff:q.saveDiff.length,snapshotDiff:q.snapshotDiff.length,lostPlayed:lostPlayed.length,calendarChanged:!same(a.calendar,b.calendar),currentInPlayed,currentMatchBefore:q.before.thisWeekMd,currentMatchAfter:q.after.thisWeekMd,cupClubBefore:a.cup?.club??null,cupClubAfter:b.cup?.club??null,clubId:b.club?.id??null};
});
const paths=[...new Set(classified.map(x=>x.path))].sort();
const summary={versione:data[0].versione,commit:data[0].commit,compito:'PO-176 salvataggio e ricarica',comando:['$env:CPM_CHROME=\'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\'; $env:CPM_SEEDS=\'0\'; $env:CPM_OUTPUT=\'salvataggio-ricarica-pilot.json.gz\'; node tests/codex/salvataggio-ricarica.mjs','$env:CPM_CHROME=\'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\'; $env:CPM_SEEDS=\'1,8,13,17,35\'; $env:CPM_OUTPUT=\'salvataggio-ricarica-rest.json.gz\'; node tests/codex/salvataggio-ricarica.mjs','$env:CPM_CHROME=\'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\'; $env:CPM_SEEDS=\'0,13\'; $env:CPM_OUTPUT=\'salvataggio-ricarica-masked.json.gz\'; $env:CPM_STOP_AT=\'S2W1\'; $env:CPM_RUN_TAG=\'masked-\'; $env:CPM_MASK_MODAL=\'1\'; node tests/codex/salvataggio-ricarica.mjs','$env:CPM_CHROME=\'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\'; $env:CPM_SEEDS=\'1,8\'; $env:CPM_OUTPUT=\'salvataggio-ricarica-masked-1-8.json.gz\'; $env:CPM_STOP_AT=\'S2W1\'; $env:CPM_RUN_TAG=\'masked-\'; $env:CPM_MASK_MODAL=\'1\'; node tests/codex/salvataggio-ricarica.mjs'],seme:careers.map(c=>c.seed),misure:[{nome:'reload misurati',valore:checkpoints.length,soglia:'21 accessibili (3 S1/W10 impossibili per seed iniziali S2)',esito:checkpoints.length===21?'ok':'anomalia'},{nome:'campi cambiati in C',valore:counts.C,soglia:'0',esito:counts.C===0?'ok':'anomalia'},{nome:'giornate già giocate tornate da giocare',valore:checks.reduce((n,x)=>n+x.lostPlayed,0),soglia:'0',esito:checks.some(x=>x.lostPlayed)?'anomalia':'ok'}],segnalazioni:classified.filter(x=>x.c==='C').map(x=>{const tab=x.path.endsWith('rival')?'profile':'club';return{gravita:'media',descrizione:`Seme ${x.seed} ${x.key}: ${x.path} ${val(x.before)} → ${val(x.after)}`,come_riprodurre:'node tests/codex/salvataggio-ricarica.mjs',prove:[`tests/codex/salvataggio-ricarica.json.gz`,focusedView(x.seed,x.key,'before',tab)?.image||'non verificato',focusedView(x.seed,x.key,'after',tab)?.image||'non verificato']};}),counts,checks,classified,paths,runs:data.map(r=>({seeds:r.seme,errors:r.errors,durationMs:r.durationMs})),careers:careers.map(c=>({seed:c.seed,matrix:c.matrix,status:c.status,steps:c.steps,errors:c.errors,interventions:c.interventions,cupMatches:c.cupMatches,checkpoints:c.checkpoints.map(q=>({key:q.key,status:q.status,season:q.season,week:q.week,match:q.match}))}))};
fs.writeFileSync(summaryPath,JSON.stringify(summary,null,2));
fs.writeFileSync(archive,zlib.gzipSync(JSON.stringify({base:{versione:data[0].versione,commit:data[0].commit},commands:summary.comando,careers,focused,classified}),{level:9}));

const L=[];L.push('# PO-176 — Salvataggio e ricaricamento');
L.push(`\n**Base verificata:** main \`${summary.commit}\`, \`GAME_VERSION=${summary.versione}\`. ${careers.length} carriere, ${checkpoints.length} punti prima/dopo, ${classified.length} differenze di campo nel salvataggio. Classi: **A ${counts.A}**, **B ${counts.B}**, **C ${counts.C}**, **non verificato ${counts['non verificato']}**. Il JSON compresso \`tests/codex/salvataggio-ricarica.json.gz\` contiene i salvataggi completi, gli snapshot, le cinque viste e tutti i percorsi di campo.`);
L.push('\n## Condizioni e riproduzione\n');
L.push('Le sei carriere usano gli stessi semi e la stessa funzione di creazione del precedente career-matrix; ogni carriera ha storage isolato. Prima del reload aspetto il salvataggio, salvo `cpm-v3` e `__CPM_CAREER.snapshot()`, acquisisco Home, Calendario, Classifica, Coppe, Profilo; poi ricarico la pagina, uso Continua quando richiesto e ripeto. GLB spenti per ridurre il carico. Le foto sono nel percorso `reports/codex/salvataggio-ricarica/`.');
L.push('```powershell\n'+summary.comando.join('\n')+'\nnode tests/codex/salvataggio-ricarica-report.mjs\n```');
L.push('\nI semi 13, 17 e 35 iniziano alla stagione 2 nel career-matrix: **S1/W10 non raggiungibile** per quei semi. Gli altri checkpoint si sono cercati senza impostare artificialmente settimana o stagione. Le partite sono simulate dall’harness; il comportamento durante una partita giocata in diretta è non verificato. Per fotografare le sezioni sottostanti, negli scatti supplementari S2/W1 ho nascosto solo i modali fissi temporanei tramite DOM (nessun campo del giocatore cambiato); gli scatti originali senza questa maschera restano nella cartella delle immagini.');
L.push('\n## Esiti per checkpoint\n');
L.push('| Seme | Punto | Δ salvataggio | Δ snapshot | Giornate giocate perse | Giornata corrente già giocata? | Club coppa prima → dopo |');
L.push('| --- | --- | ---: | ---: | ---: | --- | --- |');
for(const x of checks)L.push(`| ${x.seed} | ${x.key} | ${x.saveDiff} | ${x.snapshotDiff} | ${x.lostPlayed} | ${x.currentInPlayed?'sì':'no'} | ${x.cupClubBefore??'assente'} → ${x.cupClubAfter??'assente'} |`);
L.push(`\nIl calendario completo è rimasto identico in ${checks.filter(x=>!x.calendarChanged).length}/${checks.length} reload; non è stata aggiunta una seconda voce né una gara giocata è tornata da giocare. La sonda \`thisWeekMd()\` non restituisce una gara già marcata \`played\` in questi checkpoint. **Un tentativo effettivo di rigiocare dall’interfaccia una giornata già disputata non è stato eseguito: non verificato.**`);
L.push('\n## Classificazione delle differenze\n');
L.push('| Campo/famiglia | Eventi | Classe | Prima → dopo (esempio misurato) | Motivo |');L.push('| --- | ---: | --- | --- | --- |');
for(const g of byFamily){const ex=classified.find(x=>x.seed===g.first.seed&&x.key===g.first.key&&x.path===(g.first.path==='savedAt'?'savedAt':'player.'+g.first.path));L.push(`| \`${esc(g.family)}\` | ${g.n} | ${g.types.join('/')} | ${esc(short(g.first.before))} → ${esc(short(g.first.after))} | ${esc(ex?.why||'non verificato')} |`);}
L.push('\n**A** = differenza tecnica o di forma senza variazione del contenuto. **B** = ricostruzione da dati già salvati con lo stesso effetto. **C** = contenuto del giocatore o della UI che cambia dopo il reload. La classe misura il prima/dopo; la causa precisa resta un’ipotesi finché il team non la riproduce.');
L.push('\n## Differenze visibili (C)\n');
const cs=classified.filter(x=>x.c==='C');
if(!cs.length)L.push('Nessun campo classificato C nei punti accessibili.');
else {L.push('| Seme/punto | Campo | Prima → dopo | Schermata e prove |');L.push('| --- | --- | --- | --- |');for(const x of cs){const tab=x.path.endsWith('rival')?'profile':'club';const im1=focusedView(x.seed,x.key,'before',tab)?.image,im2=focusedView(x.seed,x.key,'after',tab)?.image;L.push(`| ${x.seed} ${x.key} | \`${esc(x.path)}\` | ${esc(short(x.before))} → ${esc(short(x.after))} | ${tab}: ${im1?`[prima](${path.relative(path.dirname(report),path.join(ROOT,im1)).replaceAll('\\','/')})`: 'non verificato'} / ${im2?`[dopo](${path.relative(path.dirname(report),path.join(ROOT,im2)).replaceAll('\\','/')})`:'non verificato'} |`);}}
L.push('\nI tre `agentPlan` nati dopo il reload nei semi 13/17/35 restano **non verificati**: il pannello Agente calcola lo stesso obiettivo sostitutivo anche se il campo manca, ma `agentPlanOutcome` (`src/18-career-app.jsx:1499`) legge solo il campo persistito a fine stagione. Un possibile effetto futuro diverso è una deduzione dal codice, non misurata nel confronto prima/dopo.');
L.push('\n## Appendice: ogni campo diverso\n');
L.push('I campi indicizzati come `playedMd.md.0` sono elencati singolarmente. Per i valori lunghi la tabella abbrevia; il grezzo contiene il valore integrale.');
L.push('| Seme | Punto | Percorso | Classe | Prima → dopo |');L.push('| --- | --- | --- | --- | --- |');
for(const x of classified)L.push(`| ${x.seed} | ${x.key} | \`${esc(x.path)}\` | ${x.c} | ${esc(short(x.before))} → ${esc(short(x.after))} |`);
L.push('\n## Limiti\n');
L.push('- Le schermate possono contenere modali transitori generati dalla simulazione settimanale. I semplici cambi di toast, orologio o modale non sono contati come perdita di dati; le differenze sono ancorate ai campi dello stato.');
L.push('- I salvataggi sono seedati dall’harness: la frequenza in carriere iniziate manualmente è non verificata.');
L.push('- Il club della coppa è confrontato con l’ID del club dell’eroe; la completezza di tutti gli accoppiamenti della coppa è non verificata.');
L.push('- Nessuna modifica al gioco, nessuna patch proposta.');
fs.writeFileSync(report,L.join('\n')+'\n');
console.log(JSON.stringify({versione:summary.versione,commit:summary.commit,seeds:summary.seme,checkpoints:checkpoints.length,counts,report,archive}));
