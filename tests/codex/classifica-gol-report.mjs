#!/usr/bin/env node
// Read the three reproducible PO-175 traces and explain the first unequal GF/GA week.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const files=['classifica-gol-17.json','classifica-gol-35-4.json','classifica-gol-4.json'];
const archive=path.join(root,'tests/codex/classifica-gol.json.gz');
const runs=files.every(name=>fs.existsSync(path.join(root,'tests/codex',name)))
  ?files.map(name=>JSON.parse(fs.readFileSync(path.join(root,'tests/codex',name),'utf8')))
  :JSON.parse(zlib.gunzipSync(fs.readFileSync(archive))).attempts;
const careers=[...runs[0].careers,runs[1].careers[0],runs[2].careers[0]];
const version=runs[0].version,commit=runs[0].commit;
if(runs.some(r=>r.version!==version||r.commit!==commit))throw Error('Build diverse nei grezzi');
const bySeed=new Map(careers.map(c=>[c.seed,c]));
const hashStr=s=>{let h=5381;for(let i=0;i<s.length;i++){h=((h<<5)+h)^s.charCodeAt(i);h=h>>>0;}return h;};
const seededRng=seed=>{let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};};
const delta=(after,before,id)=>{const a=after.standings.find(x=>x.id===id),b=before.standings.find(x=>x.id===id);return a&&b?{gf:(a.gf||0)-(b.gf||0),ga:(a.ga||0)-(b.ga||0)}:null;};
function analyzeWeek(c,after){
 const before=c.trace.find(x=>x.season===after.season&&x.week===after.week-1);
 if(!before)return{season:after.season,week:after.week,error:'stato precedente assente'};
 const fixture=after.calendar.find(x=>x.week===after.week-1&&(!x.type||x.type==='league'))||null;
 const heroId=after.club?.id,opp=fixture?.opponentId||null;
 const opponentDelta=opp?delta(after,before,opp):null;
 const others=before.standings.filter(x=>x.id!==heroId&&x.n!==heroId&&x.id!==opp).map(x=>x.id);
 const rng=seededRng((hashStr(heroId||'club')+after.season*100003+(after.week-1)*9973)>>>0);
 for(let i=others.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const byeId=others.length%2?others.at(-1):null;
 const byeDelta=byeId?delta(after,before,byeId):null;
 const added=after.delta-before.delta;
 const explained=opponentDelta&&byeDelta?opponentDelta.gf-opponentDelta.ga+byeDelta.gf-byeDelta.ga:null;
 return{season:after.season,week:after.week,priorGF:before.gf,priorGA:before.ga,gf:after.gf,ga:after.ga,added,heroId,heroInStandings:after.standings.some(x=>x.id===heroId),fixture,history:after.matchHistory.find(x=>x.season===after.season&&x.week===after.week-1&&x.opponent===fixture?.opponentName)||null,opponentId:opp,opponentDelta,unpairedTeamId:byeId,unpairedDelta:byeDelta,unpairedDerivation:'ricostruzione deterministica di updateStandings; non una partita in calendario',explained,exact:explained===added};
}
const cases=careers.map(c=>{
 const first=c.firstMismatch,prevSeason=first?c.trace.filter(x=>x.season===first.season-1).at(-1):null;
 const opening=first?c.trace.find(x=>x.season===first.season&&x.week===1):null;
 const windows=first?c.trace.filter(x=>x.season===first.season&&x.week>=first.week&&x.week<=first.week+(c.seed===17?3:0)).map(x=>analyzeWeek(c,x)):[];
 const id=first?c.trace.find(x=>x.season===first.season&&x.week===first.week)?.club?.id:null;
 const promoMessages=Object.keys(c.messages||{}).filter(x=>/PROMOSSA|RETROCESSA/.test(x)&&x.includes(c.trace.find(y=>y.season===first?.season&&y.week===first?.week)?.club?.n||'~')).map(x=>x.slice(x.indexOf('|')+1));
 return{seed:c.seed,matrix:c.matrix,status:c.status,first,traceWeeks:c.trace.length,heroClub:opening?.club||null,priorClubRank:prevSeason?prevSeason.standings.findIndex(x=>x.id===id)+1:null,priorClubLeague:prevSeason?.club?.lg||null,openingClubLeague:opening?.club?.lg||null,clubInOpening:opening?opening.standings.some(x=>x.id===id):null,removedFromPrior:prevSeason&&opening?prevSeason.standings.filter(x=>!opening.standings.some(y=>y.id===x.id)).map(x=>x.id):[],addedAtOpening:prevSeason&&opening?opening.standings.filter(x=>!prevSeason.standings.some(y=>y.id===x.id)).map(x=>x.id):[],promoMessages,windows};
});
const firstTeamRows=cases.flatMap(c=>{
 if(!c.first||!c.windows.length)return[];
 const f=c.first,w=c.windows[0],raw=bySeed.get(c.seed),before=raw.trace.find(x=>x.season===f.season&&x.week===f.week-1),after=raw.trace.find(x=>x.season===f.season&&x.week===f.week);
 const state=(snapshot,id)=>{const t=snapshot.standings.find(x=>x.id===id);return t?`G${t.played} GF${t.gf} GA${t.ga}`:'assente';};
 return[[c.seed,'eroe',w.heroId,state(before,w.heroId),state(after,w.heroId)],[c.seed,'avversario',w.opponentId,state(before,w.opponentId),state(after,w.opponentId)],[c.seed,'riga isolata*',w.unpairedTeamId,state(before,w.unpairedTeamId),state(after,w.unpairedTeamId)]];
});
const raw={versione:version,commit,comandi:runs.map(r=>({command:r.command,env:r.env,startedAt:r.startedAt,durationMs:r.durationMs})),attempts:runs,analysis:cases,method:'classifica-gol.mjs copia il setup seedato del collaudo carriere; le righe di classifica e calendario vengono lette da __CPM_CAREER.snapshot(); unpairedTeamId è ricostruito con standingsSeed e lo shuffle di updateStandings'};
const rawRel='tests/codex/classifica-gol.json.gz';
fs.writeFileSync(path.join(root,rawRel),zlib.gzipSync(Buffer.from(JSON.stringify(raw)),{level:9}));
const cmd=seed=>`$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; $env:CPM_SEEDS='${seed}'; $env:CPM_MAX_SEASONS='5'; $env:CPM_TIME_LIMIT_MS='900000'; $env:CPM_OUTPUT='classifica-gol-${seed}.json'; node tests/codex/classifica-gol.mjs`;
const combinedCmd=`$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; $env:CPM_SEEDS='35,4'; $env:CPM_MAX_SEASONS='5'; $env:CPM_TIME_LIMIT_MS='1500000'; $env:CPM_OUTPUT='classifica-gol-35-4.json'; node tests/codex/classifica-gol.mjs`;
const fmt=n=>n==null?'non verificato':String(n);
const rows=(head,data)=>`| ${head.join(' | ')} |\n| ${head.map(()=> '---').join(' | ')} |\n${data.map(r=>`| ${r.map(x=>String(x??'—').replaceAll('|','\\|').replaceAll('\n',' ')).join(' | ')} |`).join('\n')}`;
const lines=[
 `# PO-175 — Classifica: gol fatti e subiti su CPM ${version}`,'',
 `**Base misurata:** \`main\` al commit \`${commit}\`, \`GAME_VERSION=${version}\`. Dati grezzi: \`${rawRel}\`. Il gioco non è stato modificato.`,
 '',
 '**Esito:** il difetto si riproduce nei semi 17 e 35 alla stagione 3, settimana 2. Nel seme 4 non si è riprodotto in cinque stagioni. La prima apertura del seme 4 ha dato un timeout (errore integrale nel grezzo); il tentativo su pagina nuova è terminato senza errore. Il campione usa salvataggi e offerte seedati dallo script, quindi la frequenza nelle carriere naturali è non verificata.',
 '',
 '## Prima settimana con scarto', '',
 rows(['Seme','Prima divergenza','GF','GA','Scarto','Stato'],cases.map(c=>[c.seed,c.first?`S${c.first.season}/W${c.first.week}`:'nessuna in 5 stagioni',c.first?.gf??'—',c.first?.ga??'—',c.first?c.first.gf-c.first.ga:'—',c.status])),
 '',
 '## Squadre e giornata responsabile', '',
 rows(['Seme','Club iniziale','Club eroe dopo trasferimento','Posizione prima','Messaggio promozione/retrocessione','Lega del club nel nuovo save','Presente nella nuova classifica','Uscite / entrate nella lega'],cases.map(c=>[c.seed,c.matrix?.club||'—',c.heroClub?.n||'non verificato',fmt(c.priorClubRank),c.promoMessages.join('; ')||'non osservato',c.openingClubLeague||'non verificato',c.clubInOpening===null?'non verificato':c.clubInOpening?'sì':'no',c.removedFromPrior.length?`${c.removedFromPrior.join(', ')} / ${c.addedAtOpening.join(', ')}`:'non verificato'])),
 '',
 rows(['Seme','Ruolo','ID squadra','Classifica S3/W1','Classifica S3/W2'],firstTeamRows),
 '',
 'Nei semi 17 e 35 il calendario e lo storico contano **una** partita dell’eroe, non due. La riga dell’eroe manca nella classifica della lega che il suo club dichiara; la riga dell’avversario riceve il risultato. Non risulta un punteggio diverso nel tabellino della partita dell’eroe. Nel seme 17 anche il vecchio club (`boc`) esce dalla lega superiore per retrocessione; nel seme 35 il vecchio club (`and`) appartiene a un’altra lega, mentre è il club nuovo (`gui`) a essere promosso. Non ho osservato righe con dati importati direttamente da un’altra lega, ma non posso confermare tutte le gare degli altri club: il calendario salvato contiene solo quelle dell’eroe.',
 '',
  rows(['Seme','S/W','Partita calendario/storico','Riga avversario ΔGF/ΔGA','Squadra simulata senza controparte* ΔGF/ΔGA','Scarto della settimana','Δ scarto','Somma spiegata'],cases.flatMap(c=>c.windows.map(w=>[c.seed,`S${w.season}/W${w.week}`,`${w.heroId}–${w.opponentId}: ${w.fixture?.result?.homeScore??'?'}–${w.fixture?.result?.awayScore??'?'}`,`${w.opponentId} ${w.opponentDelta?.gf??'?'} / ${w.opponentDelta?.ga??'?'}`,`${w.unpairedTeamId||'?'} ${w.unpairedDelta?.gf??'?'} / ${w.unpairedDelta?.ga??'?'}`,w.gf-w.ga,w.added,w.exact?'sì':'non verificato']))),
 '',
 '*La «squadra senza controparte» non è una partita di calendario. Il suo ID deriva dallo shuffle seedato di `updateStandings` (`src/09-audio-scout-anagrafiche.jsx:1428-1438`); l’incremento GF/GA è letto nelle due classifiche consecutive. Questa combinazione spiega esattamente lo scarto misurato, ma l’attribuzione della singola partita simulata resta una ricostruzione del codice.',
 '',
 '## Meccanismo probabile (ipotesi da riprodurre dal team)', '',
 'A fine stagione l’override sposta il club promosso/retrocesso. Se un prestito con obbligo diventa definitivo, `_loanStayClub` copia `p.club` con la vecchia `lg` (`src/18-career-app.jsx:4856`); `nextClub84` dà precedenza a quella copia rispetto a `_nextClubPre` già aggiornata (`:4866`). `getLeagueClubs` prende la `lg` del club per selezionare la lega ma rispetta gli override delle squadre (`src/06-archetipi-agenti-sponsor.jsx:110-122`): così la classifica viene inizializzata senza il club dell’eroe (`src/18-career-app.jsx:4867-4868`). Alla partita successiva `updateStandings` non trova la riga dell’eroe, ma trova l’avversario e ne applica il risultato; poi, con 17 squadre rimaste, simula anche una riga isolata (`src/09-audio-scout-anagrafiche.jsx:1410-1438`). Il differenziale di quelle due righe coincide con ogni aumento misurato dello scarto. La causalità del prestito è un’ipotesi sostenuta dal codice e dai due tracciati, non una correzione testata.',
 '',
 '## Riproduzione', '',
 'Da radice repository, con Chrome locale e dipendenze di `tests/visual` già installate:',
 '```powershell',cmd(17),combinedCmd,cmd(4),'node tests/codex/classifica-gol-report.mjs','```',
 'I comandi sopra producono un JSON locale per ogni seme; il rapporto usa anche il file del primo tentativo combinato (`classifica-gol-35-4.json`) per conservare il timeout, incluso nell’archivio compresso. Lo script si arresta dopo tre settimane aggiuntive nel seme 17 e alla prima divergenza nei semi 35/4.',
 '',
 '## Limiti', '',
 '- Il seme 4 resta **non riprodotto su questa build**, non «corretto»: il percorso di carriera può essere diverso.',
 '- Non ho alterato i dati del gioco per isolare l’override né eseguito un test con il fix: la riga precisa che causa il bug resta un’ipotesi.',
 '- Il grezzo registra anche gli interventi dell’harness e il timeout; questi non sono difetti della classifica.',
 '- Nessun giudizio sulla frequenza nelle partite naturali o sulla UI mobile.',
 '',
];
const reportRel='reports/codex/2026-10-01-classifica-gol';
fs.writeFileSync(path.join(root,reportRel+'.md'),lines.join('\n'));
const summary={versione:version,compito:'PO-175 classifica GF/GA',comando:cmd(17),seme:'17,35,4',commit,misure:[{nome:'semi con scarto riprodotto',valore:cases.filter(c=>c.first).length,soglia:'3',esito:cases.filter(c=>c.first).length===3?'ok':'anomalia'},{nome:'prime settimane con scarto',valore:cases.map(c=>({seed:c.seed,first:c.first})),soglia:'nessuna',esito:'anomalia'},{nome:'giornate seme 17 dopo primo scarto',valore:cases[0].windows.length,soglia:4,esito:cases[0].windows.length===4?'ok':'anomalia'}],segnalazioni:cases.filter(c=>c.first).map(c=>({gravita:'alta',descrizione:`Seme ${c.seed} S${c.first.season}/W${c.first.week}: GF=${c.first.gf}, GA=${c.first.ga}; club eroe assente dalla classifica dopo promozione/retrocessione`,come_riprodurre:cmd(c.seed),prove:[rawRel]})),raw:rawRel,limiti:['Seme 4 non riprodotto su cinque stagioni','Primo tentativo combinato seme 4: timeout navigazione, registrato nel grezzo','Meccanismo del prestito con obbligo: ipotesi da confermare dal team']};
fs.writeFileSync(path.join(root,reportRel+'.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({version,commit,first:cases.map(c=>({seed:c.seed,first:c.first})),report:reportRel+'.md',raw:rawRel}));
