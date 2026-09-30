import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const d=JSON.parse(fs.readFileSync(ROOT+'tests/codex/highlight-mirato.json'));
const notes=JSON.parse(fs.readFileSync(ROOT+'reports/codex/highlight-mirato/review.json'));
const ok=d.runs.filter(r=>!r.error&&r.wallMs&&r.sixFrames&&r.outcomeMatched&&r.methodVersion!==2),errors=d.runs.filter(r=>r.error);
const key=r=>`${r.gi}:${r.ai}:${r.outcome}`;
const md=['# Collaudo mirato degli highlight — 7.999.61','','**Materiale preliminare V1: include una scena di riscaldamento forzata. Non è il rapporto definitivo del campione.**',
`Piano: ${d.plan.length} combinazioni. Acquisite senza errore: ${ok.length}. Tentativi con errore: ${errors.length}. Note presenti: ${Object.keys(notes).length}.`,
'','Fonte dei conteggi: [checkpoint](../../tests/codex/highlight-mirato.json). Comando completo di riepilogo:',
'```powershell','node tests/codex/highlight-mirato-report.mjs','```',
'','Acquisizione, dalla radice:',
'```powershell',"$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'","$env:CPM_BATCH='1'",'node tests/codex/highlight-mirato.mjs','node tests/codex/highlight-mirato-sheet.mjs','```',
'','## Metodo e limiti','',
'Pagina nuova per caso; viewport 412×915, GLB/PRESENT/CINE accesi; service worker bloccati. Chrome headless tramite harness SwiftShader. Il clock viene fermato dopo il riscaldamento e la scena viene avanzata a passi simulati. Nessuna misura di FPS, fluidità, durata reale del gesto o prestazioni mobile è valida con questo metodo. Il contatto è il primo campione con il testimone di avvio traiettoria: non certifica il contatto anatomico. Apertura e scelta possono riprendere la stessa fase; il difetto non va attribuito al gioco senza una prova indipendente.',
'','## Note e prove','',
'| gi | Azione | Esito richiesto | Esito corrisponde | Immagini | Nota |','|---:|---|---|---|---:|---|'];
const freq=new Map();for(const r of ok)for(const c of notes[key(r)]?.codes||[]){if(!freq.has(c))freq.set(c,[]);freq.get(c).push(key(r));}
md.splice(4,0,'','## Codici osservati nel campione','', '| Codice | Casi | Riferimenti (gi:azione:esito) |','|---|---:|---|',...[...freq.entries()].sort((a,b)=>b[1].length-a[1].length).map(([c,rs])=>`| ${c} | ${rs.length} | ${rs.join(', ')} |`),'','I codici descrivono quanto visto nei casi forzati; non sono una misura di frequenza nelle partite naturali.');
for(const r of ok){const n=notes[key(r)];md.push(`| ${r.gi} | ${r.label} | ${r.outcome} | ${r.outcomeMatched} | ${r.frames.length} | ${n?.note||'non verificato'} |`);}
for(const r of ok){md.push('',`### gi ${r.gi}, azione ${r.ai}, ${r.outcome}`,'',`[KE ${d.versione}] SIT #${r.gi} [${r.intent}]: «${r.text}» · AZIONE «${r.label}» → ${r.outcome}`,'',`NOTA: ${notes[key(r)]?.note||'non verificato'}`,`Codici: ${(notes[key(r)]?.codes||[]).join(', ')||'nessuno attribuito'}. Riferimenti: ${(notes[key(r)]?.source||[]).join('; ')||'solo immagini'}.`,'',...r.frames.map(f=>`- [${f.label}](${f.png.replace('reports/codex/','')})`),'',`Bozza automatica, non verdetto: ${r.draft||'assente'}`);}
md.push('','## Errori di acquisizione','');
for(const r of errors)md.push(`- ${key(r)}: ${r.error.split('\n')[0]}; durata ${r.wallMs} ms. Fonte: runs[].error / wallMs nel checkpoint.`);
md.push('','## Cosa resta non verificato','','Confronto con partite naturali, contatto esatto per ogni gesto, stabilità del comportamento sotto tempo reale e tutte le combinazioni non elencate. I valori FPS visibili nelle immagini sono alterati dal clock di prova. Gli errori del runner non sono difetti del gioco.');
fs.writeFileSync(ROOT+'reports/codex/2026-09-30-highlight-mirato.md',md.join('\n')+'\n');
fs.writeFileSync(ROOT+'reports/codex/2026-09-30-highlight-mirato.json',JSON.stringify({versione:d.versione,compito:d.compito,comando:'node tests/codex/highlight-mirato-report.mjs',seme:'nomi Mirato+gi+esito',misure:[{nome:'casi acquisiti senza errore',valore:ok.length,soglia:d.plan.length,esito:ok.length===d.plan.length?'ok':'anomalia'},{nome:'tentativi falliti',valore:errors.length,soglia:0,esito:errors.length?'anomalia':'ok'}],segnalazioni:Object.entries(notes).filter(([,n])=>n.codes?.length).map(([k,n])=>({gravita:n.severity||'media',descrizione:n.note,come_riprodurre:'Caso forzato '+k+' con lo script del campione; riproduzione naturale non verificata',prove:n.evidence,source:n.source||[]})),noteVisive:notes,fonte:'tests/codex/highlight-mirato.json'},null,2));
console.log(JSON.stringify({acquisiti:ok.length,piano:d.plan.length,errori:errors.length,note:Object.keys(notes).length}));
