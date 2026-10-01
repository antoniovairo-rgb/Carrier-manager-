import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const rawPath=path.join(root,'tests/codex/ricollaudo-difesa-3d.json');
const gzPath=rawPath+'.gz';
const raw=fs.existsSync(rawPath)?fs.readFileSync(rawPath):zlib.gunzipSync(fs.readFileSync(gzPath));
const data=JSON.parse(raw);
const previous=JSON.parse(fs.readFileSync(path.join(root,'tests/codex/precedente-difesa-84.json')));
const codesByCase={
 '133:0:fail':['002'],
 '138:0:success':['001','002'],'138:0:fail':['001','002'],
 '168:0:fail':['002'],'31:0:fail':['002'],
 '32:0:success':['002'],'32:0:fail':['002'],
 '36:0:success':['001','002'],'36:0:fail':['001'],
 '45:0:success':['001'],'45:0:fail':['001']
};
const round=n=>Number.isFinite(n)?Math.round(n*100)/100:null;
const valid=data.runs.filter(r=>r.valid===true);
const cases=valid.map(r=>{
 const key=`${r.gi}:${r.ai}:${r.outcome}`;
 const s=r.defenseSamples||[];
 const opening=r.frames[0]?.after?.last;
 const heroBallDistance=opening&&[opening.x,opening.z,opening.hx,opening.hz].every(Number.isFinite)?Math.hypot(opening.x-opening.hx,opening.z-opening.hz):null;
 let meanOutfieldDisplacement=null;
 if(s.length>=2){
  const a=s[0].players||[],b=s.at(-1).players||[];
  const movements=a.filter(p=>!p.gk).map(p=>{const q=b.find(t=>t.i===p.i);return q?Math.hypot(q.x-p.x,q.y-p.y):NaN}).filter(Number.isFinite);
  if(movements.length)meanOutfieldDisplacement=round(movements.reduce((a,b)=>a+b,0)/movements.length);
 }
 return {key,gi:r.gi,ai:r.ai,outcome:r.outcome,action:r.label,observed:r.observedAction?.key||null,outcomeMatched:r.outcomeMatched,
  openingHeroBallDistance:round(heroBallDistance),openingNearestPlayerDistance:round(opening?.md),codes84:previous[key]?.codes||[],codes91:codesByCase[key]||[],
  frames:r.frames.map(f=>f.png),contactTrigger:r.contactTrigger||null,
  defensePreContact:s.map(t=>({ms:t.ms,ball:{x:round(t.ball?.x),y:round(t.ball?.y)}})),meanOutfieldDisplacement};
});
const counts=Object.fromEntries(['000','001','002','003','004','005','006','007','009','010','011','012','014','111','113'].map(code=>[code,cases.filter(c=>c.codes91.includes(code)).length]));
const summary={versione:data.versione,baseCommit:data.baseCommit,compito:'Ricollaudo visivo difesa 3D: 16 scene, success/fail, pagina nuova per caso',
 comando:"$env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs",
 seme:'scene forzate con un nome di partita distinto per indice',
 misure:[{nome:'casi previsti',valore:data.plan.length,soglia:'32',esito:data.plan.length===32?'ok':'anomalia'},
 {nome:'casi validi',valore:valid.length,soglia:'32',esito:valid.length===32?'ok':'anomalia'},
 {nome:'tentativi non validi',valore:data.runs.length-valid.length,soglia:'conservati nel grezzo',esito:'ok'},
 {nome:'esiti ActionResolved concordi',valore:cases.filter(c=>c.outcomeMatched).length,soglia:'32',esito:cases.every(c=>c.outcomeMatched)?'ok':'anomalia'}],
 codeCounts:counts,cases,
 limiti:'Le foto sono campioni headless; i fotogrammi etichettati contatto includono proxy e non certificano un contatto fisico. Nessun giudizio su FPS o fluidità.'};
fs.writeFileSync(gzPath,zlib.gzipSync(raw,{level:9}));
const observations={
 '33:0:success':['eroe, attaccante e pallone visibili','eroe e pallone restano leggibili','0–0; salvataggio dichiarato','blocco col corpo parziale'],
 '33:0:fail':['eroe, attaccante e pallone visibili','palla e difensore leggibili; 0–0 in 03–05','0–1 in 06; arrivo in rete non verificato','blocco fallito parziale'],
 '133:0:success':['eroe, portatore e palla sopra la scheda','eroe e pallone visibili in 04–05','0–0; salvataggio dichiarato','sprint visibile; contatto non isolato'],
 '133:0:fail':['eroe, portatore e palla sopra la scheda','palla fuori quadro in 04–05; eroe visibile','0–1 in 06; traiettoria finale non verificata','sprint visibile; contatto non isolato'],
 '134:0:success':['protagonisti visibili','protagonisti visibili; contatto aereo non isolato','0–0; salvataggio dichiarato','stacco parziale'],
 '134:0:fail':['protagonisti visibili','palla a terra in 04–05; traiettoria aerea non chiarita','0–1 in 06; nesso col gesto non verificato','contatto non misurato: proxy temporale'],
 '138:0:success':['pallone e portatore assenti; eroe vicino alla scheda','pallone assente in 04–05','0–0; salvataggio dichiarato senza intervento visibile','allineamento non verificato'],
 '138:0:fail':['pallone e portatore assenti; eroe vicino alla scheda','palla esce in basso a sinistra in 05','0–0; superamento dichiarato','allineamento parziale'],
 '168:0:success':['eroe, avversario e palla visibili','palla al margine sinistro in 04–05','0–0; recupero dichiarato','tackle parziale'],
 '168:0:fail':['eroe, avversario e palla visibili','palla esce a sinistra in 05; eroe a terra','0–0; fallo e ammonizione dichiarati','scivolata visibile'],
 '31:0:success':['portatore e difensori sopra la scheda','palla al margine destro in 05','0–0; recupero dichiarato','scivolata parziale'],
 '31:0:fail':['portatore e difensori sopra la scheda','palla esce a sinistra in 05; eroe a terra','0–0; fallo dichiarato','scivolata visibile'],
 '32:0:success':['palla al margine sinistro; eroe al centro','eroe parzialmente tagliato a sinistra in 05','0–0; recupero dichiarato','anticipo parziale'],
 '32:0:fail':['palla al margine sinistro; eroe al centro','eroe tagliato a destra e palla assente in 05','0–0; passaggio filtrante riuscito dichiarato','anticipo fallito non isolato'],
 '36:0:success':['attaccante tagliato a destra; palla non riconoscibile','palla assente in 04–05; eroe nel quadro','0–0; salvataggio dichiarato','colpo di testa non isolato'],
 '36:0:fail':['attaccante tagliato a destra; palla non riconoscibile','palla presso testa dell’eroe in 05','0–1 in 06; arrivo in rete non verificato','stacco parziale'],
 '44:0:success':['attaccante, difensori e palla leggibili','eroe e traiettoria in quadro','0–0; salvataggio dichiarato','stacco parziale'],
 '44:0:fail':['attaccante, difensori e palla leggibili','eroe e palla in quadro in 05','0–1 in 06; rete non mostrata','stacco parziale'],
 '45:0:success':['attaccante tagliato a sinistra; palla non distinguibile','eroe e palla in quadro in 04–05','0–0; blocco dichiarato','corpo sulla traiettoria parziale'],
 '45:0:fail':['attaccante tagliato a sinistra; palla non distinguibile','eroe e palla in quadro in 04–05','0–1 e palla presso la rete in 06','corpo sulla traiettoria parziale'],
 '128:0:success':['eroe, attaccante e palla visibili','palla e protagonisti in quadro in 04','0–0; recupero dichiarato','chiusura parziale'],
 '128:0:fail':['eroe, attaccante e palla visibili','palla e protagonisti in quadro in 04','0–0; superamento dichiarato','chiusura parziale'],
 '137:0:success':['eroe, portatore e palla visibili','contrasto e palla nel quadro in 04–05','0–0; recupero dichiarato','tackle parziale'],
 '137:0:fail':['eroe, portatore e palla visibili','contrasto nel quadro','0–0; fallo dichiarato','tackle parziale'],
 '157:0:success':['eroe, portatore e palla visibili','eroe e palla nel quadro in 03–05','0–0; salvataggio dichiarato','tuffo non isolato dai sei scatti'],
 '157:0:fail':['eroe, portatore e palla visibili','eroe e palla in quadro in 05','0–1 in 06; rete non mostrata','tuffo non isolato dai sei scatti'],
 '184:0:success':['eroe e portatore visibili durante la mossa','palla al piede dell’eroe in 04','0–0; intercetto dichiarato','intercetto parziale'],
 '184:0:fail':['eroe e portatore visibili durante la mossa','eroe in quadro; palla finale non leggibile','0–0; passaggio riuscito dichiarato','intercetto fallito non isolato'],
 '24:0:success':['eroe, difensore e palla visibili','sviluppo verso porta in quadro','1–0 in 06; assist dichiarato','passaggio parziale'],
 '24:0:fail':['eroe, difensore e palla visibili','sviluppo nel quadro','0–0; conclusione murata dichiarata','passaggio parziale'],
 '2:0:success':['eroe e palla vicino alla porta','palla verso la porta in 05','1–0 e palla in porta in 06','tiro visibile'],
 '2:0:fail':['eroe e palla vicino alla porta','palla sulla destra della porta in 05','0–0; parata dichiarata, tocco del portiere non isolato','tiro visibile']
};
const dir='ricollaudo-difesa-3d/';
const img=(c,i)=>`[${String(i+1).padStart(2,'0')}](${dir}${path.basename(c.frames[i])})`;
const code=c=>c.length?c.join(', '):'—';
const lines=[
 '# Ricollaudo difesa 3D — CPM 7.999.91',
 '',
 `Base verificata: main ${data.baseCommit}, GAME_VERSION=${data.versione}; ramo codex/2026-10-01-ricollaudo-difesa-3d. Le 16 scene con azione canonica 0 sono state provate con success e fail, una pagina nuova per caso, GLB/PRESENT/CINE accesi, 412×915.`,
 '',
 '## Esito e metodo',
 '',
 `Casi **${valid.length}/${data.plan.length} validi**, **${cases.filter(c=>c.outcomeMatched).length}/${cases.length}** con ActionResolved concorde con l’esito richiesto; ${data.runs.length-valid.length} tentativi non validi conservati nel grezzo. I codici sono giudizi sui sei PNG selezionati, non difetti confermati in partita naturale. La bozza __CPM_DRAFTNOTE è conservata nel grezzo e non è stata copiata nei codici visivi.`,
 '',
 'Comandi completi da PowerShell, dalla radice del repository:',
 '',
 '```powershell',
 "node --check tests/codex/ricollaudo-difesa-3d.mjs",
 "$env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs",
 'node tests/codex/ricollaudo-difesa-3d-sintesi.mjs',
 '```',
 '',
 'La sonda esegue i casi ancora privi di prova valida; per ciascuno forza la scena e l’esito, poi verifica ActionResolved. La prima foto è scattata a 900 ms simulati dall’avvio della scena; quando il frame era ancora nero è stato conservato il tentativo e scelta la ripresa 32 ms dopo. Le 03–05 sono campioni distinti; «04-contatto» è in diversi casi un proxy temporale o d’arco, non la misura di un impatto fisico. Due tentativi invalidi sono rimasti nel grezzo: arresto per RAM e ordine errato delle foto. Il banco è headless: nessuna conclusione su fluidità, FPS o telefono.',
 '',
 '## Codici assegnati sui 32 casi',
 '',
 '| Codice | Casi | Evidenza |', '| --- | ---: | --- |',
 `| 001 apertura senza contesto | ${counts['001']} | gi138 success/fail, gi36 success/fail, gi45 success/fail: foto 01. |`,
 `| 002 eroe o pallone fuori quadro | ${counts['002']} | gi133 fail, gi138 success/fail, gi168 fail, gi31 fail, gi32 success/fail, gi36 success: foto 04–05. |`,
 '| 003 esito bugiardo | 0 | Nessuna contraddizione dimostrata dagli scatti; la traiettoria completa di alcuni gol non è verificata. |',
 '| Altri codici del menu (000, 004–012, 014, 111, 113) | 0 assegnati | Le sei foto non permettono di escludere difetti fra i campioni. |',
 '',
 '## Prima (7.999.84) → adesso (7.999.91)',
 '',
 'Le celle riportano success / fail. «—» significa nessun codice assegnato, non assenza dimostrata di ogni difetto.',
 '',
 '| gi | 7.999.84 success / fail | 7.999.91 success / fail |', '| ---: | --- | --- |'
];
for(const gi of [33,133,134,138,168,31,32,36,44,45,128,137,157,184,24,2]){
 const a=cases.find(c=>c.gi===gi&&c.outcome==='success'),b=cases.find(c=>c.gi===gi&&c.outcome==='fail');
 lines.push(`| ${gi} | ${code(a.codes84)} / ${code(b.codes84)} | ${code(a.codes91)} / ${code(b.codes91)} |`);
}
lines.push('',
 '## Schede per caso',
 '',
 'La distanza eroe–palla è calcolata in pianta con `Math.hypot(last.x-last.hx,last.z-last.hz)` sul testimone della foto 01 (unità del gioco). Il campo `md` misura invece il compagno di movimento più vicino alla palla (`src/12-three-match-view.jsx:3256–3260`) e non viene usato come distanza dell’eroe. In «quadro», «esito» e «gesto» un giudizio parziale resta tale. Le sei foto esatte di ogni riga sono nel JSON di sintesi; qui sono collegate apertura, momento centrale e risultato.',
 '',
 '| gi | Esito richiesto → ActionResolved | eroe–palla (u) | 01 apertura | 03–05 quadro | 06 esito | Gesto | Codici | Foto |',
 '| ---: | --- | ---: | --- | --- | --- | --- | --- | --- |');
for(const c of cases){
 const n=observations[c.key]||['non verificato','non verificato','non verificato','non verificato'];
 lines.push(`| ${c.gi} | ${c.outcome} → ${c.observed} | ${c.openingHeroBallDistance?.toFixed(2)??'n.v.'} | ${n[0]} | ${n[1]} | ${n[2]} | ${n[3]} | ${code(c.codes91)} | ${img(c,0)} ${img(c,3)} ${img(c,4)} ${img(c,5)} |`);
}
lines.push('',
 '## Campioni a 250 ms nei fail con gol subito',
 '',
 'La posizione è `__CPM_STATE().ball.x/y` così come restituita dal gioco. La sonda ha raccolto campioni ogni 250 ms fino al trigger di contatto; in cinque scene il trigger arriva prima di un secondo campione, quindi lo spostamento medio dei giocatori di movimento è **non verificato**. Il campione non dimostra che il reparto fosse fermo (006).',
 '',
 '| gi | Pallone: ms → x,y | Spostamento medio giocatori fra primo e ultimo campione (u) |',
 '| ---: | --- | ---: |');
for(const c of cases.filter(c=>c.outcome==='fail'&&c.observed==='goal_against')){
 lines.push(`| ${c.gi} | ${c.defensePreContact.map(s=>`${s.ms} → ${s.ball.x?.toFixed(2)??'n.v.'},${s.ball.y?.toFixed(2)??'n.v.'}`).join('; ')} | ${c.meanOutfieldDisplacement===null?'non verificato':c.meanOutfieldDisplacement.toFixed(2)} |`);
}
lines.push('',
 '## Cinque casi da sottoporre per primi al team',
 '',
 'Sono ipotesi visive, ordinate per perdita di contesto dell’azione. Ogni comando rifà **un solo caso** in pagina nuova e richiede RAM libera; il suffisso `-verifica` conserva le foto del tentativo.',
 '');
const priorities=[
 ['138:0:success','001 e 002: all’apertura non si vedono portatore e palla; in 04–05 la palla non è in quadro.'],
 ['138:0:fail','001 e 002: stessa apertura senza contesto; in 05 la palla esce dal basso a sinistra.'],
 ['36:0:success','001 e 002: attaccante tagliato e palla non riconoscibile in 01; palla assente in 04–05 durante lo stacco.'],
 ['36:0:fail','001: avvio del duello aereo con attaccante tagliato e palla non riconoscibile; il gol è dichiarato in 06.'],
 ['45:0:fail','001: la palla in arrivo è indistinta e l’attaccante è tagliato nell’apertura; in 06 il gol subito è coerente con la palla presso la rete.']
];
for(let i=0;i<priorities.length;i++){
 const [k,description]=priorities[i],c=cases.find(c=>c.key===k);
 lines.push(`${i+1}. **gi${c.gi}, azione 0, ${c.outcome}:** ${description} Prove: ${img(c,0)}, ${img(c,4)}, ${img(c,5)}. Riproduzione: \`$env:CPM_CASES='${k}'; $env:CPM_CAPTURE_TAG='verifica'; $env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs\`.`);
}
summary.segnalazioni=priorities.map(([key,description],i)=>{
 const c=cases.find(c=>c.key===key);
 return {gravita:i<2?'alta':'media',descrizione:`gi${c.gi} ${c.outcome}: ${description}`,
  come_riprodurre:`$env:CPM_CASES='${key}'; $env:CPM_CAPTURE_TAG='verifica'; $env:CPM_BATCH='1'; $env:CPM_MIN_START_GB='3.3'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`,
  prove:[c.frames[0],c.frames[4],c.frames[5]]};
});
lines.push('',
 '## Limiti e file di prova',
 '',
 'Il giudizio riguarda una sola ripetizione valida per esito sulla 7.999.91. Le scene sono forzate; il comportamento in una partita naturale e su telefono è **non verificato**. Anche dove un testo di gol o salvataggio coincide con ActionResolved, la traiettoria fisica completa può essere non verificata. Le foto nere iniziali e i due tentativi invalidi restano nel grezzo per distinguere un limite del banco da un difetto del gioco. Nessuna patch al gioco è stata prodotta.',
 '',
 '- Dati grezzi completi, bozze automatiche e tentativi: `tests/codex/ricollaudo-difesa-3d.json.gz`.',
 '- Indice JSON leggibile con confronti, codici, foto e misure: `reports/codex/2026-10-01-ricollaudo-difesa-3d.json`.',
 '- PNG: `reports/codex/ricollaudo-difesa-3d/`.',
 '');
fs.writeFileSync(path.join(root,'reports/codex/2026-10-01-ricollaudo-difesa-3d.md'),lines.join('\n'));
fs.writeFileSync(path.join(root,'reports/codex/2026-10-01-ricollaudo-difesa-3d.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({planned:data.plan.length,valid:valid.length,invalid:data.runs.length-valid.length,matched:cases.filter(c=>c.outcomeMatched).length,codes:counts,rawBytes:raw.length,gzipBytes:fs.statSync(gzPath).size},null,2));
