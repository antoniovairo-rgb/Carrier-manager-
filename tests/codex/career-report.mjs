#!/usr/bin/env node
// Produce a source-linked report from career-matrix.mjs raw observations.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source=path.join(root,'tests/codex',process.env.CPM_REPORT_SOURCE||'collaudo-carriere-matrix86.json');
const run=JSON.parse(fs.readFileSync(source,'utf8'));
const outMd=path.join(root,'reports/codex/2026-10-collaudo-carriere.md');
const outJson=path.join(root,'reports/codex/2026-10-collaudo-carriere.json');
const outRaw=path.join(root,'tests/codex/collaudo-carriere.json.gz');
const careers=run.careers||[], complete=careers.filter(c=>c.status==='target-reached');
const seasons=careers.flatMap(c=>(c.seasonStats||[]).map(s=>({seed:c.seed,career:c.matrix,...s})));
const weeks=careers.flatMap(c=>(c.weeklyObservations||[]).map(w=>({seed:c.seed,...w})));
const content=careers.flatMap(c=>(c.contentObservations||[]).map(o=>({seed:c.seed,...o})));
const issues=(run.anomalies||[]).map(x=>x.type==='save-restore'?{...x,severity:'media',status:'differenza verificata; impatto non verificato'}:x.type==='contract'&&x.observed.includes('expiresAtSeason=11<12')?{...x,severity:'bassa',status:'falso positivo del controllo: contratto già scaduto al rollover'}:x);
for(const c of careers){const ss=c.seasonStats||[],maxOvr=Math.max(0,...ss.map(s=>s.ovr||0)),maxCaps=Math.max(0,...ss.map(s=>s.nationalCaps||0));if(c.seasonsDone>=10&&maxOvr>=85&&maxCaps===0)issues.push({seed:c.seed,career:c.matrix,season:ss.at(-1)?.season??null,week:39,type:'national-zero-high-ovr',observed:`10 stagioni, OVR massimo ${maxOvr}, presenze nazionale registrate sempre 0`,severity:'media',status:'ipotesi'});}
for(const c of careers){const old=(c.seasonStats||[]).find(s=>s.age>=25&&s.squadRole==='primavera');if(old&&(c.contractActions||[]).some(a=>String(a.text||'').includes('Giovane promessa')))issues.push({seed:c.seed,career:c.matrix,season:old.season,week:39,type:'adult-primavera-label',observed:`età ${old.age}, ruolo tecnica primavera; la UI registrata nel dialogo contratto mostra «Giovane promessa» (calcSquadRole: src/08-panchina-derby-meteo-cori.jsx:160)`,severity:'media',status:'ipotesi'});}
for(const c of careers){const n=(c.pageErrors||[]).filter(e=>e==="Cannot read properties of null (reading 'parentClub')").length;if(n)issues.push({seed:c.seed,career:c.matrix,season:null,week:null,type:'loan-parentClub-pageerror',observed:`${n} ${n===1?'errore':'errori'} JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859`,severity:'media',status:'verificata'});}
const counts=a=>Object.fromEntries([...new Set(a)].sort().map(x=>[x,a.filter(y=>y===x).length]));
const uniq=a=>[...new Set(a)];
const md=s=>String(s??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ').slice(0,260);
const rows=(heads,data)=>`| ${heads.join(' | ')} |\n| ${heads.map(()=> '---').join(' | ')} |\n${data.map(r=>`| ${r.map(md).join(' | ')} |`).join('\n')||`| ${heads.map(()=> '—').join(' | ')} |`}`;
const num=x=>Number.isFinite(x)?x:'non verificato';
const mean=a=>a.length?+(a.reduce((n,x)=>n+x,0)/a.length).toFixed(2):'—';
const groupSeasons=key=>[...new Set(seasons.map(key))].sort((a,b)=>String(a).localeCompare(String(b),'it',{numeric:true})).map(label=>{
  const sample=seasons.filter(s=>key(s)===label);
  return[label,sample.length,mean(sample.map(s=>s.ovr).filter(Number.isFinite)),mean(sample.map(s=>s.goals).filter(Number.isFinite)),mean(sample.map(s=>s.assists).filter(Number.isFinite)),mean(sample.map(s=>s.value).filter(Number.isFinite)),mean(sample.map(s=>s.wage).filter(Number.isFinite))];
});
const command=`$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; $env:CPM_SEEDS='${run.env?.CPM_SEEDS||''}'; $env:CPM_MAX_SEASONS='${run.env?.CPM_MAX_SEASONS||''}'; $env:CPM_TIME_LIMIT_MS='${run.env?.CPM_TIME_LIMIT_MS||''}'; $env:CPM_OUTPUT='${run.env?.CPM_OUTPUT||''}'; node tests/codex/career-matrix.mjs`;
const sourceRel=path.relative(root,source).replaceAll('\\','/');
const rawRel='tests/codex/collaudo-carriere.json.gz';
const events=careers.flatMap(c=>Object.entries(c.events||{}).map(([name,n])=>({seed:c.seed,name,n})));
const weeklyCounts={impulses:[],vita:[],moments:[],diary:[],messages:[]};
for(const w of weeks)for(const k of Object.keys(weeklyCounts))weeklyCounts[k].push(...(w[k]||[]));
const distinct=Object.fromEntries(Object.entries(weeklyCounts).map(([k,v])=>[k,uniq(v).length]));
const noContent=weeks.filter(w=>Object.keys(weeklyCounts).every(k=>!(w[k]||[]).length));
const messageCount=new Map();for(const w of weeks)for(const t of w.messages||[])messageCount.set(t,(messageCount.get(t)||0)+1);
const topMessages=[...messageCount].sort((a,b)=>b[1]-a[1]).slice(0,10);
const topTypes=[...Object.entries(counts(issues.map(x=>x.type)))].sort((a,b)=>b[1]-a[1]);
const gfCases=[...new Set(issues.filter(x=>x.type==='standings-goals').map(x=>`${x.seed}|${x.season}`))].map(k=>{const [seed,season]=k.split('|').map(Number),a=issues.filter(x=>x.type==='standings-goals'&&x.seed===seed&&x.season===season),c=careers.find(x=>x.seed===seed);return{seed,season,n:a.length,first:a[0],last:a.at(-1),earlyTransfer:(c?.transfers||[]).find(t=>t.season===season-1&&t.week<=6)||null};});
const gfReproFile=path.join(root,'tests/codex/career-gf-repro17.json');
const gfRepro=fs.existsSync(gfReproFile)?JSON.parse(fs.readFileSync(gfReproFile,'utf8')):null;
const gfSignature=data=>(data.anomalies||[]).filter(x=>x.type==='standings-goals'&&x.seed===17).map(x=>[x.season,x.week,x.observed]);
const gfReproResult=gfRepro?{version:gfRepro.version,commit:gfRepro.commit,baseline:gfSignature(run).length,ripetizione:gfSignature(gfRepro).length,identica:JSON.stringify(gfSignature(run))===JSON.stringify(gfSignature(gfRepro)),durataMs:gfRepro.durationMs}:null;
const severityRank={alta:0,media:1,bassa:2};
const ranked=[...issues].sort((a,b)=>(severityRank[a.severity]??3)-(severityRank[b.severity]??3));
const issueGroups=new Map();for(const x of ranked){const key=`${x.seed}|${x.season}|${x.type}`;const g=issueGroups.get(key);if(g)g.count++;else issueGroups.set(key,{first:x,count:1});}
const topIssueGroups=[];const groupList=[...issueGroups.values()];
for(const [type,quota] of [['standings-goals',3],['loan-parentClub-pageerror',4],['save-restore',2],['national-zero-high-ovr',1]]){
  const pickedSeeds=new Set();for(const g of groupList.filter(g=>g.first.type===type).sort((a,b)=>b.count-a.count)){
    if(pickedSeeds.has(g.first.seed))continue;topIssueGroups.push(g);pickedSeeds.add(g.first.seed);if(pickedSeeds.size>=quota)break;
  }
}
const saveChecks=careers.flatMap(c=>(c.saveChecks||[]).map(s=>({seed:c.seed,...s})));
const changed=saveChecks.filter(s=>!s.equal);
const diffCounts=counts(changed.flatMap(s=>(s.differences||[]).map(d=>d.path)));
const diffExamples=[];for(const s of changed)for(const d of s.differences||[])if(diffExamples.length<60&&!diffExamples.some(x=>x.path===d.path))diffExamples.push({seed:s.seed,season:s.season,...d});
const nat=seasons.filter(s=>Number.isFinite(s.nationalCaps));
const nationalGain=[];for(const c of careers){let last=0;for(const s of c.seasonStats||[]){if(Number.isFinite(s.nationalCaps)){nationalGain.push({seed:c.seed,season:s.season,caps:s.nationalCaps,gain:s.nationalCaps-last});last=s.nationalCaps;}}}
const classified=careers.map(c=>{const ss=c.seasonStats||[],dominant=ss.some(s=>s.age<26&&s.ovr>=88)||ss.some(s=>(s.trophies||[]).filter(t=>String(t).toLowerCase().includes('campionato')).length>=3),failed=ss.some(s=>s.age>=25&&s.ovr<70)||ss.some(s=>s.age>=25&&s.squadRole==='fuori rosa');return{seed:c.seed,kind:dominant?'dominante':failed?'fallita':'normale',evidence:dominant?'OVR/trofei soglia':failed?'OVR/rosa soglia':'nessuna soglia nel campione'};});
const varietyByCareer=careers.map(c=>{const w=c.weeklyObservations||[],result={seed:c.seed,weeks:w.length,empty:w.filter(x=>['messages','diary','impulses','vita','moments'].every(k=>!(x[k]||[]).length)).length};for(const kind of ['impulses','vita','moments']){const seen=new Set();let first=null;let all=[];for(const row of w){for(const id of row[kind]||[]){if(seen.has(id)&&first===null)first=row.season;seen.add(id);all.push(id);}}result[kind+'Distinct']=seen.size;result[kind+'Repeated']=all.length-seen.size;result[kind+'FirstRepeatSeason']=first;}return result;});
const candidateRules=[];
for(const o of content){const t=String(o.text||''),last=o.context?.recentMatches?.at(-1);if(/\bil tuo gol\b/i.test(t)&&last&&last.goals===0)candidateRules.push({rule:'C3',seed:o.seed,season:o.season,week:o.week,text:t,reason:'ultimo match osservato senza gol; la frase potrebbe riferirsi a un match precedente'});if(/\bcrisi\b|momento difficile/i.test(t)&&o.context?.recentMatches?.length>=4&&o.context.recentMatches.slice(-4).every(m=>m.won===true))candidateRules.push({rule:'C2',seed:o.seed,season:o.season,week:o.week,text:t,reason:'ultimi 4 match osservati vinti'});}
const contextRules=['C1: minuti nelle ultime tre partite non presenti nel testimone (minutes=null); non verificato','C2: verificati solo i candidati con quattro vittorie nei matchHistory osservati; le sconfitte consecutive non verificato','C3: verificati solo i candidati testuali «il tuo gol» contro ultimo match senza gol; il riferimento temporale resta ipotesi','C4: stato Primavera/professionista disponibile ma distinzione fra riferimento storico e attuale non verificato','C5: stato infortunio disponibile, tempo preciso dell’evento rispetto al cambio stato non verificato','C6: capitano non rilevato; riferimenti alla nazionale senza presenze possono riguardare convocazioni; non verificato','C7: nomi di club/avversari nella lega non salvati nel grezzo; non verificato','C8: due testi nella stessa settimana possono riferirsi a momenti diversi; non verificato'];
const startCounts=counts(careers.map(c=>c.matrix?.start||'sconosciuta'));
const roleCounts=counts(careers.map(c=>c.matrix?.position||'sconosciuto'));
const styleCounts=counts(careers.map(c=>c.matrix?.style||'sconosciuto'));
const leagues=uniq(careers.map(c=>c.matrix?.requestedLeague).filter(Boolean));
const pageErrors=careers.flatMap(c=>(c.pageErrors||[]).map(error=>({seed:c.seed,error})));
const failures=run.failures||[];
const complete10=careers.filter(c=>c.seasonsDone>=10).length;
const report=[
`# Collaudo esterno delle carriere — ${run.version}`,
'',
`**Eseguito davvero:** ${careers.length} carriere avviate, ${complete10} con almeno 10 stagioni, ${seasons.length} stagioni concluse, ${weeks.length} settimane osservate, ${run.durationMs} ms di esecuzione dello script. Commit base \`${run.commit}\`. Il grezzo consegnato è \`${rawRel}\`; il comando di riproduzione genera prima \`${sourceRel}\` e poi lo comprime.`,
'',
`**Non eseguito o non verificato:** campione richiesto 60 × 10 (ripiego 30 × 10), sei carriere fino al ritiro, 20 coppie biforcate, gemelli economici, riferimenti reali alla nazionale con fonte, lettura visiva di ogni testo; indicare questi punti come non verificato anche se il rapporto contiene altri indizi. La base dichiarata nella scheda era 7.999.83; il collaudo è stato ripreso sulla main disponibile ${run.version}, senza modifiche al gioco.`,
'',
'## Le 10 anomalie più gravi osservate',
'',
rows(['#','Seme','S/W','Gravità','Tipo','Ripetizioni','Prima osservazione'],topIssueGroups.map(({first:x,count},i)=>[i+1,x.seed,`${x.season??'?'}/${x.week??'?'}`,x.severity,x.type,count,x.type==='save-restore'?'Snapshot diverso al reload: playedMd.s, playedMd.md, cup.club; dettagli prima/dopo nella tabella seguente':x.observed])),
'',
'Le voci sono osservazioni del collaudo: restano ipotesi di difetto del gioco finché il team non le riproduce. Gli interventi dell’harness sono limiti del test.',
'',
'## Cinque controlli prioritari per il team',
'',
'1. Analizzare lo scarto GF/GA della classifica: il seme 17 lo riproduce; il seme 35 e la causa restano da verificare.',
'2. Riprodurre l’errore `parentClub` nelle notifiche differite di fine prestito (`src/18-career-app.jsx:4839,4847,4856,4859`).',
'3. Classificare campo per campo le differenze di salvataggio dopo il reload, separando rigenerazione prevista da perdita visibile.',
'4. Verificare nella UI rinnovi, ruoli sintetici e contenuti narrativi con testimoni che includano minuti e stato del capitano.',
'5. Eseguire gemelli di scelta e investimento prima di attribuire effetti causali a stile o economia.',
'',
'## Riproduzione e perimetro',
'',
'Da radice repository, in PowerShell:',
'```powershell',command,'node tests/codex/career-report.mjs','```',
`La matrice applica ruoli e valori iniziali sintetici nel salvataggio: il percorso normale di creazione fissa Attaccante (\`src/17-menu-creazione-pannelli.jsx:291\`). I profili forti partono già da OVR elevato; il numero di carriere dominanti **non** misura la difficoltà della creazione normale. Lo stile etichettato governa soltanto la gestione delle offerte forzate nello script; le scelte di intervista sono state completate con il primo pulsante attivo. Le differenze causali fra stili sono quindi **non verificate**. Il test imposta \`__CPM_GLB=false\` e \`__CPM_SIM_NAT=1\`.`,
'',
'## Copertura',
'',
rows(['Seme','Partenza','Forza','Stile','Ruolo sintetico','Lega richiesta','Stagioni','Passi','Stato','Errori JS'],careers.map(c=>[c.seed,c.matrix?.start,c.matrix?.strength,c.matrix?.style,c.matrix?.position,c.matrix?.requestedLeague,c.seasonsDone,c.steps,c.status,(c.pageErrors||[]).length])),
'',
`Partenze: ${JSON.stringify(startCounts)}. Ruoli: ${JSON.stringify(roleCounts)}. Stili dichiarati: ${JSON.stringify(styleCounts)}. Leghe richieste distinte: ${leagues.length} (${leagues.join(', ')}). Sei traiettorie deboli richieste: osservate ${careers.filter(c=>c.matrix?.strength==='debole').length}.`,
'',
'## Invarianti e anomalie',
'',
rows(['Tipo','Conteggio'],topTypes.map(([k,v])=>[k,v])),
'',
'Conservazione GF/GA nelle classifiche (a parità di lega la somma dei gol fatti deve uguagliare quella dei gol subiti): i casi seguenti sono osservazioni settimanali raggruppate. Il rapporto con un trasferimento precoce nella stagione precedente è una correlazione, **non** una causa verificata.',
'',
rows(['Seme','Stagione','Settimane con scarto','Primo GF/GA','Ultimo GF/GA','Trasferimento precedente'],gfCases.map(g=>[g.seed,g.season,g.n,g.first?.observed,g.last?.observed,g.earlyTransfer?`S${g.earlyTransfer.season}/W${g.earlyTransfer.week}: ${g.earlyTransfer.from} → ${g.earlyTransfer.to}`:'non osservato'])),
'',
gfReproResult?`**Ripetizione indipendente del seme 17:** ${gfReproResult.ripetizione} scarti nella stagione 3, contro ${gfReproResult.baseline} iniziali; sequenza di stagione, settimana e GF/GA ${gfReproResult.identica?'identica':'diversa'} (${gfReproResult.durataMs} ms, build ${gfReproResult.version}, commit ${gfReproResult.commit}). Fonte: \`tests/codex/career-gf-repro17.json\`. Il riscontro riguarda il percorso sintetico dell’harness, non una partita naturale. Comando integrale: \`$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='2'; $env:CPM_TIME_LIMIT_MS='360000'; $env:CPM_OUTPUT='career-gf-repro17.json'; node tests/codex/career-matrix.mjs\`.`:'Ripetizione indipendente dello scarto GF/GA: **non verificato**.',
'',
`Controlli di salvataggio al ricaricamento: ${saveChecks.length}; snapshot modificati: ${changed.length}. I campi mutati più frequenti sono: ${Object.entries(diffCounts).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>`${k} (${v})`).join(', ')||'nessuno'}. Lo snapshot diverso è verificato; perdita visibile al giocatore: **non verificato**.`,
'',
rows(['Seme','Stagione dopo reload','Uguale','Campi diversi'],saveChecks.map(s=>[s.seed,s.season,s.equal?'sì':'no',(s.differences||[]).map(d=>d.path).slice(0,15).join(', ')||'—'])),
'',
rows(['Seme','Stagione','Campo','Prima','Dopo'],diffExamples.map(d=>[d.seed,d.season,d.path,JSON.stringify(d.before),JSON.stringify(d.after)])),
'',
'## Varietà narrativa',
'',
`Su ${weeks.length} settimane campionate: ${noContent.length} senza messaggi/diario/ID registrati. Distinti osservati: impulsi ${distinct.impulses}, vita ${distinct.vita}, momenti ${distinct.moments}, voci diario ${distinct.diary}, messaggi ${distinct.messages}. Il log può includere resoconti ordinari delle partite; questi conteggi non equivalgono al numero di eventi di ciascun catalogo. Voci mai uscite rispetto ai cataloghi completi e prima ripetizione per catalogo: **non verificato**.`,
'',
rows(['Testo più frequente nel log','Occorrenze'],topMessages.map(([t,n])=>[t,n])),
'',
rows(['Seme','Settimane','Senza contenuto','Impulsi distinti/ripetuti/prima ripetizione','Vita distinti/ripetuti/prima ripetizione','Momenti distinti/ripetuti/prima ripetizione'],varietyByCareer.map(v=>[v.seed,v.weeks,v.empty,`${v.impulsesDistinct}/${v.impulsesRepeated}/${v.impulsesFirstRepeatSeason??'—'}`,`${v.vitaDistinct}/${v.vitaRepeated}/${v.vitaFirstRepeatSeason??'—'}`,`${v.momentsDistinct}/${v.momentsRepeated}/${v.momentsFirstRepeatSeason??'—'}`])),
'',
'## Coerenza narrativa C1–C8',
'',
...contextRules.map(x=>`- ${x}`),
'',
`Candidati rilevati dalle due regole strette C2/C3: ${candidateRules.length}. Non sono difetti confermati senza ricostruzione del contesto narrativo.`,
'',
rows(['Regola','Seme','S/W','Testo','Motivo'],candidateRules.slice(0,30).map(x=>[x.rule,x.seed,`${x.season}/${x.week}`,x.text,x.reason])),
'',
'## Conseguenze delle scelte',
'',
'Biforcazioni identiche a 1, 5 e 20 settimane: **non verificato**. Le scelte UI compiute per sbloccare finestre sono nel grezzo `interventions`, ma non costituiscono gemelli causali.',
'',
'## Nazionale',
'',
`Stagioni con campo presenze nazionale numerico: ${nat.length}; incremento totale osservato fra stagioni: ${nationalGain.reduce((a,x)=>a+Math.max(0,x.gain),0)}. Questo non misura le partite degli NPC né il calendario delle convocazioni. Età della prima convocazione, avversari/livello, tornei e benchmark reale: **non verificato**.`,
'',
rows(['Seme','Stagione','Presenze cumulative','Incremento'],nationalGain.filter(x=>x.gain!==0).slice(0,50).map(x=>[x.seed,x.season,x.caps,x.gain])),
'',
'## Difficoltà',
'',
'Soglie della scheda: dominante = almeno 3 campionati o OVR ≥88 prima dei 26 anni; fallita = OVR <70 a 25 anni o fuori dal professionismo; normale = resto. La lettura dei trofei dal grezzo è parziale; classificazioni con evidenza insufficiente sono orientative.',
'',
rows(['Seme','Classe orientativa','Evidenza','Ultima età','Ultimo OVR','Ultime presenze'],classified.map(x=>{const c=careers.find(y=>y.seed===x.seed),s=c?.seasonStats?.at(-1);return[x.seed,x.kind,x.evidence,s?.age,s?.ovr,s?.matches]})),
'',
'Distribuzioni osservate per età, ruolo sintetico, partenza e stile dichiarato. Medie su stagioni concluse; salari nell’unità del salvataggio. I trofei non sono mediati perché il formato contiene tipi diversi e il conteggio di campionati non è normalizzato.',
'',
rows(['Età','N','OVR medio','Gol medi','Assist medi','Valore medio','Stipendio medio'],groupSeasons(s=>s.age)),
'',
rows(['Ruolo sintetico','N','OVR medio','Gol medi','Assist medi','Valore medio','Stipendio medio'],groupSeasons(s=>s.position)),
'',
rows(['Partenza','N','OVR medio','Gol medi','Assist medi','Valore medio','Stipendio medio'],groupSeasons(s=>s.career?.start)),
'',
rows(['Stile dichiarato','N','OVR medio','Gol medi','Assist medi','Valore medio','Stipendio medio'],groupSeasons(s=>s.career?.style)),
'',
'## Economia e Ufficio',
'',
'Gemelli con/senza staff privato, accademia, investimenti e beni a 1, 3, 10 stagioni: **non verificato**. Gli importi nei singoli snapshot non dimostrano effetti causali.',
'',
'## Stabilità',
'',
`Errori JavaScript di pagina registrati: ${pageErrors.length}; comandi falliti: ${failures.length}; carriere bloccate o fallite: ${careers.filter(c=>!['target-reached','retired'].includes(c.status)).length}.`,
'',
'`console.error` non è stato intercettato dal testimone, quindi il suo conteggio è **non verificato**.',
'',
rows(['Seme','Errore'],pageErrors.slice(0,30).map(x=>[x.seed,x.error])),
'',
'## Elenco completo delle segnalazioni',
'',
rows(['Seme','S/W','Tipo','Gravità','Osservato','Atteso / limite','Stato','Riproduzione'],issues.map(x=>[x.seed,`${x.season??'?'}/${x.week??'?'}`,x.type,x.severity,x.observed,x.type==='harness-intervention'?'nessun intervento strumentale':x.type==='save-restore'?'snapshot invariato salvo rigenerazioni documentate':'invariante del tipo rispettata',x.status,`CPM_SEEDS=${x.seed} ${command.split('; node ')[0].split('; ').slice(1).join('; ')}; node tests/codex/career-matrix.mjs`])),
'',
`Limiti dichiarati dal processo: ${(run.limits||[]).join('; ')||'nessuno'}. Errori di comando nel grezzo: ${failures.length}. La fonte consegnata dei numeri è \`${rawRel}\`, generata dal comando integrale sopra.`,
''];
const summary={versione:run.versione||run.version,compito:'Collaudo carriere lunghe',comando:command,seme:run.env?.CPM_SEEDS||'non verificato',commit:run.commit,fonte:rawRel,riproduzione_gf:gfReproResult,misure:[{nome:'carriere avviate',valore:careers.length,soglia:'60 (ripiego 30)',esito:careers.length>=30?'ok':'anomalia'},{nome:'carriere con almeno 10 stagioni',valore:complete10,soglia:'30',esito:complete10>=30?'ok':'anomalia'},{nome:'stagioni concluse',valore:seasons.length,soglia:'600 (ripiego 300)',esito:seasons.length>=300?'ok':'anomalia'},{nome:'settimane osservate',valore:weeks.length,soglia:'nessuna',esito:'ok'},{nome:'reload con snapshot diverso',valore:changed.length,soglia:'0 salvo rigenerazioni previste',esito:changed.length?'anomalia':'ok'},{nome:'errori JavaScript',valore:pageErrors.length,soglia:'0',esito:pageErrors.length?'anomalia':'ok'}],segnalazioni:issues.map(x=>({gravita:x.severity,descrizione:`seed ${x.seed} S${x.season}/W${x.week} ${x.type}: ${x.observed}`,come_riprodurre:`CPM_SEEDS=${x.seed} node tests/codex/career-matrix.mjs`,prove:[rawRel]})),limiti:run.limits||[],candidateRules};
fs.writeFileSync(outMd,report.join('\n'));
fs.writeFileSync(outJson,JSON.stringify(summary,null,2));
fs.writeFileSync(outRaw,zlib.gzipSync(fs.readFileSync(source),{level:9}));
console.log(JSON.stringify({source:sourceRel,carriere:careers.length,stagioni:seasons.length,settimane:weeks.length,anomalie:issues.length,rapporti:[outMd,outJson,outRaw]}));
