#!/usr/bin/env node
// Aggrega esclusivamente output misurati; i punti senza campione restano "non verificato".
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const src=(process.env.CPM_INPUTS||'carriere-fase1-sintetiche-a.json').split(',').filter(Boolean);
const load=f=>{const bytes=fs.readFileSync(path.join(root,'tests/codex',f));return JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(bytes):bytes);};
const runs=src.map(file=>({file,data:load(file)}));
const old=JSON.parse(zlib.gunzipSync(execFileSync('git',['-c',`safe.directory=${root.replaceAll('\\','/')}`,'show','codex/2026-10-collaudo-carriere:tests/codex/collaudo-carriere.json.gz'],{cwd:root,maxBuffer:30*1024*1024})));
const newCareers=runs.flatMap(x=>x.data.careers||[]);
const newIssues=runs.flatMap(x=>x.data.anomalies||[]);
const oldCareers=old.careers||[];
const count=(a,p)=>a.filter(p).length;
const sum=(a,f)=>a.reduce((n,x)=>n+(+f(x)||0),0);
const q=s=>String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
const table=(headers,rows)=>`| ${headers.join(' | ')} |\n| ${headers.map(()=> '---').join(' | ')} |\n${rows.map(row=>`| ${row.map(q).join(' | ')} |`).join('\n')}\n`;
const typeCounts=(issues)=>Object.entries(issues.reduce((m,x)=>(m[x.type]=(m[x.type]||0)+1,m),{})).sort((a,b)=>b[1]-a[1]);
const parentErr=c=>count(c.pageErrors||[],e=>/parentClub/i.test(e));
const eventCount=new Map();
for(const c of newCareers)for(const w of c.weeklyObservations||[])for(const field of ['impulses','vita','moments'])for(const id of w[field]||[]){const k=`${field}:${id}`;eventCount.set(k,(eventCount.get(k)||0)+1);}
const repeats=[...eventCount].filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]);
const firstNat=newCareers.map(c=>{const s=(c.seasonStats||[]).find(x=>(x.nationalCaps||0)>0);return s?{seed:c.seed,age:s.age,ovr:s.ovr,caps:s.nationalCaps}:null;}).filter(Boolean);
const bands=[['17–20',17,20],['21–25',21,25],['26–30',26,30],['31+',31,99]].map(([name,lo,hi])=>{const s=newCareers.flatMap(c=>c.seasonStats||[]).filter(x=>x.age>=lo&&x.age<=hi);return{name,n:s.length,rating:s.filter(x=>x.rating!=null).length?+(sum(s,x=>x.rating)/s.filter(x=>x.rating!=null).length).toFixed(2):null,ga:s.length?+(sum(s,x=>(x.goals||0)+(x.assists||0))/Math.max(1,sum(s,x=>x.matches))).toFixed(2):null};});
const base={file:'codex/2026-10-collaudo-carriere:tests/codex/collaudo-carriere.json.gz',version:old.version,commit:old.commit,careers:oldCareers.length,seasons:sum(oldCareers,c=>c.seasonsDone)};
const raw={baseline:base,runs:runs.map(x=>({file:x.file,data:x.data})),summary:{newCareers:newCareers.length,newSeasons:sum(newCareers,c=>c.seasonsDone),newIssues:newIssues.length}};
fs.writeFileSync(path.join(root,'tests/codex/carriere-fase1.json.gz'),zlib.gzipSync(JSON.stringify(raw)));
const md=[];
md.push('# Collaudo carriere — fase 1 (rapporto intermedio)');
md.push('');
md.push(`**Stato: NON COMPLETO.** ${newCareers.length} carriere nuove sulla ${runs.map(x=>x.data.version).filter(Boolean).join(', ')||'versione non verificata'}, ${sum(newCareers,c=>c.seasonsDone)} stagioni concluse; ${oldCareers.length} carriere precedenti sulla ${old.version||'versione non verificata'} (${base.seasons} stagioni). Le 14 carriere precedenti non sono prove sulla nuova build. Mancano il campione di almeno 30 carriere, i percorsi naturali validi, i ritiri e le prove biforcate richieste dalla scheda.`);
md.push('');
md.push('## Fonti e riproduzione');
md.push('');
md.push(table(['Grezzo','Versione','Commit','Carriere','Stagioni','Durata misurata','Comando'],runs.map(({file,data})=>[file,data.version,data.commit,data.careers?.length||0,sum(data.careers||[],c=>c.seasonsDone),`${data.durationMs||0} ms`,`$env:CPM_SEEDS='${data.env?.CPM_SEEDS||''}'; $env:CPM_MAX_SEASONS='${data.env?.CPM_MAX_SEASONS||''}'; $env:CPM_TIME_LIMIT_MS='${data.env?.CPM_TIME_LIMIT_MS||''}'; $env:CPM_OUTPUT='${data.env?.CPM_OUTPUT||''}'; node tests/codex/career-matrix.mjs`])));
md.push(`Base precedente: \`${base.file}\`, versione ${base.version}, commit \`${base.commit}\`. Aggregazione: \`$env:CPM_INPUTS='${src.join(',')}'; node tests/codex/carriere-fase1-report.mjs\`.`);
md.push('');
md.push('## Campione e stabilità');md.push('');
md.push(table(['Seme','Percorso','Ruolo','Stagioni/10','Stato','Errori JS','Interventi harness'],newCareers.map(c=>[c.seed,c.natural?'normale':'sintetico',c.matrix?.position||'non verificato',c.seasonsDone,c.status,c.pageErrors?.length||0,c.interventions?.length||0])));
md.push(`Totale con 10 stagioni: ${count(newCareers,c=>c.seasonsDone>=10)}. Carriere dal percorso normale: ${count(newCareers,c=>c.natural)}. Fino al ritiro: ${count(newCareers,c=>c.status==='retired')}. Portiere nel percorso normale: non verificato; il ruolo è fisso ad Attaccante nella creazione UI di questa build.`);
md.push('');
md.push('## Piloti non inclusi nel campione principale');md.push('');
const pilotFiles=['carriere-fase1-portiere-pilot.json','carriere-fase1-natural-pilot.json','carriere-fase1-natural-pilot2.json'];
const pilots=pilotFiles.map(f=>({file:f,data:load(f)}));
md.push(table(['Grezzo','Carriere','Stagioni','Esito','Errore o limite osservato','Riproducibilità'],pilots.map(({file,data})=>[file,(data.careers||[]).length,sum(data.careers||[],c=>c.seasonsDone),(data.careers||[]).map(c=>c.status).join(', ')||'nessuna carriera',data.failures?.[0]?.error?.split('\n')[0]||((data.careers||[]).length===0?'causa non registrata':'nessuno'),data.env?.CPM_NATURAL_SEEDS?'non ripetibile con il matrix attualmente salvato':'$env:CPM_SEEDS=\''+(data.env?.CPM_SEEDS||'')+'\'; $env:CPM_GOALKEEPER_SEEDS=\''+(data.env?.CPM_GOALKEEPER_SEEDS||'')+'\'; $env:CPM_MAX_SEASONS=\''+(data.env?.CPM_MAX_SEASONS||'')+'\'; $env:CPM_OUTPUT=\''+(data.env?.CPM_OUTPUT||'')+'\'; node tests/codex/career-matrix.mjs'])));
md.push('Il primo pilota naturale si è fermato per un timeout del banco nella creazione; il secondo ha prodotto zero carriere e non ha registrato la causa. Il file `career-matrix.mjs` conservato in questo ramo non legge `CPM_NATURAL_SEEDS`: le due esecuzioni naturali precedenti non sono oggi ripetibili con quel comando. Questi risultati non dimostrano un errore del percorso normale del gioco. Il pilota portiere ha completato una stagione sintetica: non soddisfa né il requisito di dieci stagioni né quello del percorso naturale.');md.push('');
const uiPilot=load('creazione-naturale-pilot.json');
md.push(`Pilota UI separato: comando $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; $env:CPM_SEED='30'; node tests/codex/creazione-naturale-pilot.mjs. Creato il personaggio ${uiPilot.create?.name||'non verificato'} dall’interfaccia, ${uiPilot.trials?.filter(x=>x.ended).length||0} provini conclusi. Il guardiano memoria ha interrotto il browser: memoryAbort=${!!uiPilot.memoryAbort}, durata ${uiPilot.elapsedMs||0} ms. Fonte: tests/codex/creazione-naturale-pilot.json. Il clic sul primo provino non è arrivato a completamento; questo è un limite della macchina e del banco, non un difetto di gioco verificato.`);md.push('');
md.push('## Anomalie osservate');md.push('');
md.push(table(['Tipo','Conteggio','Primo esempio'],typeCounts(newIssues).map(([type,n])=>{const e=newIssues.find(x=>x.type===type);return[type,n,`seme ${e.seed}, S${e.season??'?'} / W${e.week??'?'}: ${String(e.observed).slice(0,180)}`]})));
md.push('I conteggi sono osservazioni ripetute nei passaggi settimanali, non contratti o salvataggi distinti. Le differenze di reload non sono qui classificate come perdite. Le anomalie sono fatti del test automatico; un difetto visibile nell’interfaccia resta non verificato se non è stato riprodotto lì.');md.push('');
md.push('## Confronto con 7.999.86');md.push('');
md.push(table(['Segnale','7.999.86','Build attuale'],[
  ['Errori JS parentClub',sum(oldCareers,parentErr),sum(newCareers,parentErr)],
  ['Osservazioni GF/GA',count(old.anomalies||[],x=>x.type==='standings-goals'),count(newIssues,x=>x.type==='standings-goals')],
  ['Carriere con differenze al reload',count(oldCareers,c=>(c.saveChecks||[]).some(x=>!x.equal)),count(newCareers,c=>(c.saveChecks||[]).some(x=>!x.equal))],
  ['Stagioni a zero presenze',sum(oldCareers,c=>count(c.seasonStats||[],s=>s.matches===0)),sum(newCareers,c=>count(c.seasonStats||[],s=>s.matches===0))]
]));
md.push('I campioni sono di versioni e semi diversi: le differenze di conteggio non dimostrano da sole una correzione.');md.push('');
md.push('## 4. Scelte biforcate');md.push('');md.push('20 coppie su due stagioni: **non verificato** finché non sono presenti nel grezzo due rami dello stesso salvataggio con una sola scelta diversa.');md.push('');
md.push('## 5. Gemelli economici');md.push('');md.push('5 coppie staff/accademia/investimenti contro controllo: **non verificato**.');md.push('');
md.push('## 6. Impulsi ed eventi');md.push('');
md.push(`Identificativi osservati nei campioni nuovi: ${eventCount.size}; ripetuti almeno due volte: ${repeats.length}. La condizione dichiarata e il seguito causale sono **non verificati** da questi contatori.`);
md.push(table(['ID','Occorrenze'],repeats.slice(0,15)));
md.push('');md.push('## 7. Nazionale');md.push('');
md.push(table(['Seme','Età prima stagione con presenze','OVR','Presenze a fine stagione'],firstNat.map(x=>[x.seed,x.age,x.ovr,x.caps])));
md.push('Il primo anno con presenze non è necessariamente la prima convocazione. Le convocazioni senza presenze e la variante senza `__CPM_SIM_NAT=1` restano **non verificate**.');md.push('');
md.push('## 8. Difficoltà');md.push('');
md.push(table(['Fascia età','Stagioni osservate','Voto medio','Gol+assist/partita'],bands.map(x=>[x.name,x.n,x.rating??'non verificato',x.ga??'non verificato'])));
md.push('Titolare %, trofei per fascia, dominio del percorso normale: **non verificato** senza relativo campione.');md.push('');
md.push('## 9. Economia e Ufficio');md.push('');md.push('Gli effetti di ciascuna voce entro due stagioni e le voci mai usate sono **non verificati** senza gemelli economici.');md.push('');
md.push('## 10. Ricontrollo classifica e fine prestito');md.push('');
md.push(`Errori JS con «parentClub» nei campioni nuovi: ${sum(newCareers,parentErr)}. Osservazioni GF/GA: ${count(newIssues,x=>x.type==='standings-goals')}. Ogni caso deve essere letto nel grezzo prima di attribuire una causa.`);
md.push('');
fs.writeFileSync(path.join(root,'reports/codex/2026-10-01-carriere-fase1.md'),md.join('\n'));
console.log(JSON.stringify(raw.summary));
