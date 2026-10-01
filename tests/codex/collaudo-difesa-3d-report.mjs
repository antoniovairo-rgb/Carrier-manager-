import "./collaudo-difesa-3d-raw.mjs";
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const raw=read('tests/codex/collaudo-difesa-3d.json');
const audit=read('reports/codex/collaudo-difesa-3d/audit.json');
const reviews=read('reports/codex/collaudo-difesa-3d/review.json');
const codes=read('reports/codex/collaudo-difesa-3d/codici.json');
const previous=read('reports/codex/collaudo-difesa-3d/prima-7999-69.json');
const previous82=read('reports/codex/collaudo-difesa-3d/review-7999-82.json');
const label=new Map(codes.codes);
const key=r=>`${r.gi}:${r.ai}:${r.outcome}`;
const latest=new Map(raw.runs.map(r=>[key(r),r]));
const esc=s=>String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
const frameLink=f=>`[${f.label}](collaudo-difesa-3d/${path.basename(f.png)})`;
const orderedFrames=r=>[...(r?.frames||[])].sort((a,b)=>Number.parseInt(a.label,10)-Number.parseInt(b.label,10));
const openingDistance=r=>{const p=r?.frames?.[0]?.before?.last;return p&&[p.x,p.z,p.hx,p.hz].every(Number.isFinite)?Math.hypot(p.x-p.hx,p.z-p.hz).toFixed(2)+' u':'non verificato';};
const blackOpenings=raw.runs.flatMap(r=>(r.openingAttempts||[]).filter(a=>a.blackFraction===1));
const caseCmd=c=>`$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; $env:CPM_CASES='${key(c)}'; $env:CPM_CAPTURE_TAG='riproduzione'; node tests/codex/collaudo-difesa-3d.mjs`;

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
  `# Collaudo difesa 3D — CPM ${raw.versione}`,
  '',
  `**Base verificata:** CPM ${raw.versione}, commit \`${raw.baseCommit}\` di \`main\`.`,
  `**Stato:** ${audit.summary.valid}/${audit.summary.planned} casi validi; ${audit.summary.attempts} tentativi, ${audit.summary.invalid} casi con ultimo tentativo non valido, ${audit.summary.reviewed} revisioni visive, ${audit.summary.missingImages} immagini mancanti.`,
  '',
  'Lettura: viewport 412×915; pagina nuova per ogni caso; corpi GLB, presentazione e cinema attivi. Esito verificato con `window.__CPM_TIMELINE()` → `ActionResolved`. I casi senza corrispondenza restano visibili e non sono contati come validi. Campioni headless: **nessuna conclusione su fluidità, FPS o tempi di risposta**. La presenza in partita naturale è non verificata.',
  `Durante l'acquisizione ${blackOpenings.length} prime foto di apertura erano interamente nere (misura blackFraction=1): la foto 01 e stata ripetuta prima della revisione. I tentativi neri restano nel dato grezzo e fra le immagini; non dimostrano una schermata nera nel gioco sul telefono.`,
  '',
  'Comandi di acquisizione: `node tests/codex/collaudo-difesa-3d.mjs`; lotti sequenziali: `node tests/codex/collaudo-difesa-3d-lotti.mjs`; fogli: `node tests/codex/collaudo-difesa-3d-sheet.mjs`; controllo: `node tests/codex/collaudo-difesa-3d-audit.mjs`; rapporto: `node tests/codex/collaudo-difesa-3d-report.mjs`.',
  '',
  'Le anomalie fotografiche sono ipotesi finché il team non le riproduce. Il codice 003 riguarda la rappresentazione o il testo visibile, non una discordanza fra esito richiesto e ActionResolved. Le sei foto non provano la continuità del movimento. Dati completi compressi: tests/codex/collaudo-difesa-3d.json.gz. I comandi di riproduzione richiedono il gioco su main al commit indicato, con gli script di questo collaudo in tests/codex/.',
  '',
  `## Prima (7.999.69), intermedio (7.999.82) → adesso (${raw.versione})`,
  '',
  '| Scena | 7.999.69 success | 7.999.82 success | Adesso success | 7.999.69 fail | 7.999.82 fail | Adesso fail |',
  '|---:|---|---|---|---|---|---|',
];
for(const gi of [33,133,134,138,168]){
  const now=outcome=>{const r=latest.get(`${gi}:0:${outcome}`),v=reviews[`${gi}:0:${outcome}`];return r?.valid&&v?.startedAt===r.startedAt?(v.codes.join(', ')||'nessuno'):'non verificato';};
  const old82=outcome=>previous82[`${gi}:0:${outcome}`]?.codes?.join(', ')||'nessuno';
  lines.push(`| ${gi} | ${previous[gi]?.success?.join(', ')||'nessuno'} | ${old82('success')} | ${now('success')} | ${previous[gi]?.fail?.join(', ')||'nessuno'} | ${old82('fail')} | ${now('fail')} |`);
}
lines.push('','I codici precedenti provengono dai rapporti 7.999.69 e 7.999.82. Il confronto non prova da solo una correzione o una regressione.','','## Codici per frequenza','','| Codice | Significato ufficiale | Casi | Tre casi peggiori verificati |','|---|---|---:|---|');
const freqs=[...freq].sort((a,b)=>b[1]-a[1]);
if(!freqs.length)lines.push('| — | Nessun codice provato dalle immagini finora | 0 | — |');
for(const [code,n] of freqs){
  const cited=findings.filter(f=>f.codes.includes(code)).slice(0,3).map(f=>f.key).join(', ');
  lines.push(`| ${code} | ${esc(label.get(code)||'non presente nel menu')} | ${n} | ${cited} |`);
}
lines.push('','','## Tutti i casi previsti','','| gi | Azione richiesta e indice | Esito | Verifica | Distanza eroe–pallone foto 01 | Codici | Fotogrammi |','|---:|---|---|---|---:|---|---|');
for(const c of raw.plan){
  const r=latest.get(key(c)),v=reviews[key(c)],reviewed=!!(v&&v.startedAt===r?.startedAt);
  const status=!r?'da acquisire':r.valid?`valido: ${r.observedAction?.ok?'success':'fail'}`:`non valido: ${esc(r.stopReason||r.skipped||r.error?.split('\n')[0]||'causa non verificata')}`;
  const uiIndex=r?.visibleActionIndex>=0?r.visibleActionIndex:'non verificato';
  const idx=r?`indice catalogo ${r.canonicalIndex??'—'}, risolutore ${r.resolverIndex??'—'}, UI ${uiIndex}`:'indice non verificato';
  const codeCell=!reviewed?'non revisionato':v.codes.length?v.codes.join(', '):v.severity==='media'||v.severity==='alta'?'anomalia fotografica senza codice':'nessun difetto provato';
  lines.push(`| ${c.gi} | ${esc(c.label)} (${idx}) | ${c.outcome} | ${status} | ${openingDistance(r)} | ${codeCell} | ${orderedFrames(r).map(frameLink).join(' · ')||'—'} |`);
}
lines.push('','','## Note per scena','');
for(const c of raw.plan){
  const r=latest.get(key(c)),v=reviews[key(c)],reviewed=!!(v&&v.startedAt===r?.startedAt);
  lines.push(`### [KE ${raw.versione}] SIT #${c.gi} [${c.intent}]: «${esc(c.text)}» · AZIONE «${esc(c.label)}» → ${c.outcome}`,'');
  if(!r){lines.push('NOTA: caso ancora da acquisire.','');continue;}
  lines.push(`NOTA: ${reviewed?esc(v.note):'revisione visiva non verificata'} ${reviewed?(v.codes.length?`Codici ${v.codes.join(', ')}.`:'Nessun codice assegnato.'):'Nessun codice assegnato.'}`);
  lines.push(`01 Apertura: ${reviewed?esc(v.opening):'non verificato'} Distanza eroe–pallone dal testimone: ${openingDistance(r)}.`);
  lines.push(`03–05 Inquadratura: ${reviewed?esc(v.framing):'non verificato'}`);
  lines.push(`06 Esito visibile: ${reviewed?esc(v.outcome):'non verificato'}`);
  lines.push(`Gesto scelto: ${reviewed?esc(v.gesture):'non verificato'}`);
  lines.push(`Esito osservato da ActionResolved: ${r.observedAction?`${r.observedAction.ok?'success':'fail'}, etichetta «${esc(r.observedAction.label)}»`:'non verificato'}; corrispondenza ${r.outcomeMatched?'sì':'no/non verificata'}; acquisizione ${r.valid?'valida':'non valida'}.`);
  if(r.visibleActionButtons)lines.push(`Pulsanti azione visibili: ${r.visibleActionButtons.map(esc).join(' / ')}. Alias del pulsante scelto: ${esc(r.displayAlias||'non verificato')}; posizione: ${r.visibleActionIndex??'non verificata'}.`);
  if(r.draft)lines.push(`Bozza automatica (dato grezzo, richiede controllo visivo): ${esc(r.draft)}`);
  lines.push(`Foto: ${orderedFrames(r).map(frameLink).join(' · ')||'nessuna'}.`, '');
}
lines.push('## Tentativi non validi conservati','');
const invalid=raw.runs.filter(r=>!r.valid);
if(!invalid.length)lines.push('Nessuno.');
for(const r of invalid)lines.push(`- ${key(r)} (${r.startedAt}): ${esc(r.stopReason||r.skipped||r.error?.split('\n')[0]||'non verificato')}; ${r.frames?.length||0} foto.`);
lines.push('','','## Cinque segnalazioni più gravi','');
if(!findings.length)lines.push('Nessuna segnalazione con prova visiva verificata finora.');
const topFive=['133:0:fail','133:0:success','157:0:fail','33:0:fail','134:0:fail'].map(k=>findings.find(f=>f.key===k)).filter(Boolean);
for(const f of topFive.length===5?topFive:findings.slice(0,5))lines.push(`- **${f.gravita}, ${f.codes.length?'codici '+f.codes.join(', '):'senza codice del menu'}, ${f.key}** — ${esc(f.descrizione)} Prove: ${f.prove.map(p=>`[foto](collaudo-difesa-3d/${path.basename(p)})`).join(', ')}. Da radice del repository: \`${f.comando}\`.`);
lines.push('','','## Limiti del campionamento','',
  '- Sei foto campionano ciascuna scena: movimento fra le foto, sincronismo esatto e continuità non verificati.',
  '- I codici sono quelli del menu in `src/15-live-match.jsx:10547`; una bozza automatica da sola non basta per trasformare una possibilità in difetto confermato.',
  '- Quando un caso non esiste o l’azione attesa manca, il registro lo conserva con il motivo; non viene sostituito con un’altra scena.',
  '- Il confronto con partite naturali e il collaudo su telefono non fanno parte di questo lotto: non verificati.',
  '');

const stem='reports/codex/2026-09-30-collaudo-difesa-3d';
fs.writeFileSync(path.join(root,stem+'.md'),lines.map(line=>line.trimEnd()).join('\n'));
const report={versione:raw.versione,compito:'Collaudo mirato difesa 3D, 16 scene success/fail',comando:'node tests/codex/collaudo-difesa-3d-lotti.mjs; node tests/codex/collaudo-difesa-3d-audit.mjs; node tests/codex/collaudo-difesa-3d-report.mjs',seme:'pagina nuova per caso; nome Difesa3D<gi>',misure:[{nome:'Casi validi',valore:audit.summary.valid,soglia:32,esito:audit.summary.valid===32?'ok':'anomalia'},{nome:'Revisioni fotografiche',valore:audit.summary.reviewed,soglia:32,esito:audit.summary.reviewed===32?'ok':'anomalia'},{nome:'Immagini mancanti',valore:audit.summary.missingImages,soglia:0,esito:audit.summary.missingImages===0?'ok':'anomalia'}],segnalazioni:findings.map(f=>({gravita:f.gravita,descrizione:`${f.codes.join(', ')||'senza codice'} ${f.key}: ${f.descrizione}`,come_riprodurre:f.comando,prove:f.prove})),audit:audit.summary,confronto:{prima69:previous,intermedia82:Object.fromEntries(Object.entries(previous82).map(([k,v])=>[k,v.codes]))},plan:raw.plan,raw:'tests/codex/collaudo-difesa-3d.json.gz'};
fs.writeFileSync(path.join(root,stem+'.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({valid:audit.summary.valid,findings:findings.length,md:stem+'.md'}));
