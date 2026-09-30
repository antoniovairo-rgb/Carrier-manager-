import "./highlight-famiglie-raw.mjs";
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const raw=read('tests/codex/highlight-famiglie.json');
const audit=read('reports/codex/highlight-famiglie/audit.json');
const reviews=read('reports/codex/highlight-famiglie/review.json');
const codes=read('reports/codex/highlight-famiglie/codici.json');
const label=new Map(codes.codes);
const key=r=>`${r.gi}:${r.ai}:${r.outcome}`;
const latest=new Map(raw.runs.map(r=>[key(r),r]));
const esc=s=>String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
const frameLink=f=>`[${f.label}](highlight-famiglie/${path.basename(f.png)})`;
const caseCmd=c=>`$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; $env:CPM_CASES='${key(c)}'; $env:CPM_CAPTURE_TAG='riproduzione'; node tests/codex/highlight-famiglie.mjs`;

const findings=[];
const freq=new Map();
for(const c of raw.plan){
  const r=latest.get(key(c)),v=reviews[key(c)];
  if(!r?.valid||v?.startedAt!==r.startedAt)continue;
  for(const code of v.codes||[])freq.set(code,(freq.get(code)||0)+1);
  if(v.codes?.length||v.severity==='media'||v.severity==='alta')findings.push({key:key(c),codes:v.codes||[],descrizione:v.note,gravita:v.severity||'media',prove:v.evidence||[],comando:caseCmd(c)});
}
const rank={alta:0,media:1,bassa:2};
findings.sort((a,b)=>(rank[a.gravita]??3)-(rank[b.gravita]??3));
const lines=[
  '# Collaudo highlight 3D — famiglie di scene',
  '',
  `**Base verificata:** CPM ${raw.versione}, commit \`${raw.baseCommit}\` di \`main\`. Data esecuzione: 30 settembre 2026; il nome sostituisce il segnaposto richiesto \`2026-10-XX\` con la data reale.`,
  `**Stato:** ${audit.summary.valid}/${audit.summary.planned} casi validi; ${audit.summary.attempts} tentativi, ${audit.summary.invalid} casi con ultimo tentativo non valido, ${audit.summary.reviewed} revisioni visive, ${audit.summary.missingImages} immagini mancanti.`,
  '',
  'Lettura: viewport 412×915; pagina nuova per ogni caso; corpi GLB, presentazione e cinema attivi. Esito verificato con `window.__CPM_TIMELINE()` → `ActionResolved`. I casi senza corrispondenza restano visibili e non sono contati come validi. Campioni headless: **nessuna conclusione su fluidità, FPS o tempi di risposta**. La presenza in partita naturale è non verificata.',
  '',
  'Comandi di acquisizione: `node tests/codex/highlight-famiglie.mjs`; lotti sequenziali: `node tests/codex/highlight-famiglie-lotti.mjs`; fogli: `node tests/codex/highlight-famiglie-sheet.mjs`; controllo: `node tests/codex/highlight-famiglie-audit.mjs`; rapporto: `node tests/codex/highlight-famiglie-report.mjs`.',
  '',
  'Le anomalie fotografiche sono osservazioni del revisore esterno: restano ipotesi di difetto finche il team non le riproduce. Il codice 003 riguarda la rappresentazione o il testo visibile, non una discordanza fra esito richiesto e ActionResolved. I due tentativi interrotti restano nel grezzo; i trenta casi finali sono validi. Dati completi compressi: tests/codex/highlight-famiglie.json.gz (ripristino automatico da parte degli script).',
  '',
  '## Codici per frequenza',
  '',
  '| Codice | Significato ufficiale | Casi | Tre casi peggiori verificati |',
  '|---|---|---:|---|',
];
const freqs=[...freq].sort((a,b)=>b[1]-a[1]);
if(!freqs.length)lines.push('| — | Nessun codice provato dalle immagini finora | 0 | — |');
for(const [code,n] of freqs){
  const cited=findings.filter(f=>f.codes.includes(code)).slice(0,3).map(f=>f.key).join(', ');
  lines.push(`| ${code} | ${esc(label.get(code)||'non presente nel menu')} | ${n} | ${cited} |`);
}
lines.push('','','## Tutti i casi previsti','','| gi | Azione richiesta e indice | Esito | Verifica | Codici | Fotogrammi |','|---:|---|---|---|---|---|');
for(const c of raw.plan){
  const r=latest.get(key(c)),v=reviews[key(c)],reviewed=!!(v&&v.startedAt===r?.startedAt);
  const status=!r?'da acquisire':r.valid?`valido: ${r.observedAction?.ok?'success':'fail'}`:`non valido: ${esc(r.stopReason||r.skipped||r.error?.split('\n')[0]||'causa non verificata')}`;
  const uiIndex=r?.visibleActionIndex>=0?r.visibleActionIndex:'non verificato';
  const idx=r?`indice catalogo ${r.canonicalIndex??'—'}, risolutore ${r.resolverIndex??'—'}, UI ${uiIndex}`:'indice non verificato';
  const codeCell=!reviewed?'non revisionato':v.codes.length?v.codes.join(', '):v.severity==='media'||v.severity==='alta'?'anomalia fotografica senza codice':'nessun difetto provato';
  lines.push(`| ${c.gi} | ${esc(c.label)} (${idx}) | ${c.outcome} | ${status} | ${codeCell} | ${(r?.frames||[]).map(frameLink).join(' · ')||'—'} |`);
}
lines.push('','','## Note per scena','');
for(const c of raw.plan){
  const r=latest.get(key(c)),v=reviews[key(c)],reviewed=!!(v&&v.startedAt===r?.startedAt);
  lines.push(`### [KE ${raw.versione}] SIT #${c.gi} [${c.intent}]: «${esc(c.text)}» · AZIONE «${esc(c.label)}» → ${c.outcome}`,'');
  if(!r){lines.push('NOTA: caso ancora da acquisire.','');continue;}
  lines.push(`NOTA: ${reviewed?esc(v.note):'revisione visiva non verificata'} ${reviewed?(v.codes.length?`Codici ${v.codes.join(', ')}.`:'Nessun codice assegnato.'):'Nessun codice assegnato.'}`);
  lines.push(`Esito osservato da ActionResolved: ${r.observedAction?`${r.observedAction.ok?'success':'fail'}, etichetta «${esc(r.observedAction.label)}»`:'non verificato'}; corrispondenza ${r.outcomeMatched?'sì':'no/non verificata'}; acquisizione ${r.valid?'valida':'non valida'}.`);
  if(r.visibleActionButtons)lines.push(`Pulsanti azione visibili: ${r.visibleActionButtons.map(esc).join(' / ')}. Alias del pulsante scelto: ${esc(r.displayAlias||'non verificato')}; posizione: ${r.visibleActionIndex??'non verificata'}.`);
  if(r.draft)lines.push(`Bozza automatica (dato grezzo, richiede controllo visivo): ${esc(r.draft)}`);
  lines.push(`Foto: ${(r.frames||[]).map(frameLink).join(' · ')||'nessuna'}.`, '');
}
lines.push('## Tentativi non validi conservati','');
const invalid=raw.runs.filter(r=>!r.valid);
if(!invalid.length)lines.push('Nessuno.');
for(const r of invalid)lines.push(`- ${key(r)} (${r.startedAt}): ${esc(r.stopReason||r.skipped||r.error?.split('\n')[0]||'non verificato')}; ${r.frames?.length||0} foto.`);
lines.push('','','## Cinque segnalazioni più gravi','');
if(!findings.length)lines.push('Nessuna segnalazione con prova visiva verificata finora.');
for(const f of findings.slice(0,5))lines.push(`- **${f.gravita}, ${f.codes.length?'codici '+f.codes.join(', '):'senza codice del menu'}, ${f.key}** — ${esc(f.descrizione)} Prove: ${f.prove.map(p=>`[foto](highlight-famiglie/${path.basename(p)})`).join(', ')}. Da radice del repository: \`${f.comando}\`.`);
lines.push('','','## Limiti del campionamento','',
  '- Il primo pilota della rovesciata aveva anticipato il frame di contatto. Due acquisizioni supplementari con trigger foot-near-impact lo sostituiscono nella tabella finale; i tentativi originali restano nei dati grezzi. La precisione del contatto resta non verificata dalle sole fotografie.',
  '- I codici sono quelli del menu in `src/15-live-match.jsx:10483`; una bozza automatica da sola non basta per trasformare una possibilità in difetto confermato.',
  '- Quando un caso non esiste o l’azione attesa manca, il registro lo conserva con il motivo; non viene sostituito con un’altra scena.',
  '- Il confronto con partite naturali e il collaudo su telefono non fanno parte di questo lotto: non verificati.',
  '');

const stem='reports/codex/2026-09-30-collaudo-highlight-famiglie';
fs.writeFileSync(path.join(root,stem+'.md'),lines.map(line=>line.trimEnd()).join('\n'));
const report={versione:raw.versione,compito:'Collaudo mirato di 15 famiglie highlight 3D, success/fail',comando:'node tests/codex/highlight-famiglie-lotti.mjs; node tests/codex/highlight-famiglie-audit.mjs; node tests/codex/highlight-famiglie-report.mjs',seme:'pagina nuova per caso; nome Famiglie<gi>',misure:[{nome:'Casi validi',valore:audit.summary.valid,soglia:30,esito:audit.summary.valid===30?'ok':'anomalia'},{nome:'Immagini mancanti',valore:audit.summary.missingImages,soglia:0,esito:audit.summary.missingImages===0?'ok':'anomalia'}],segnalazioni:findings.map(f=>({gravita:f.gravita,descrizione:`${f.codes.join(', ')||'senza codice'} ${f.key}: ${f.descrizione}`,come_riprodurre:f.comando,prove:f.prove})),audit:audit.summary,plan:raw.plan,raw:'tests/codex/highlight-famiglie.json.gz'};
fs.writeFileSync(path.join(root,stem+'.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({valid:audit.summary.valid,findings:findings.length,md:stem+'.md'}));
