#!/usr/bin/env node
// Render the measured JSON as the external QA report. No game file is changed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(root,'reports/codex');
const d=JSON.parse(fs.readFileSync(path.join(dir,'2026-09-28-fluidita-3d.json'),'utf8'));
const ids=[...new Set([...d.counts.selectedIds,...d.mandatory])];
const fmt=x=>x==null?'—':String(x);
const foot=(s,k)=>{const f=s.heroFeet[k];return f.n?`${f.median} (${f.n}${f.n<20?'*':''})`:`— (0)`;};
const row=g=>{
  const s=g===38?d.rerun38:d.scenes[g];
  const dist=s.carry.near.n?`${s.carry.near.median}/${s.carry.near.p95}/${s.carry.near.max}`:'—';
  const jump=s.jumps.length?`${s.jumps.length} / ${Math.max(...s.jumps.map(j=>j.distance))}`:'0';
  const gesture=s.heroGesture.perSecond==null?'—':`${s.heroGesture.changes}/${s.heroGesture.perSecond}/${s.heroGesture.under0_15.length}`;
  return `| ${g}${g===38?'†':''} | ${s.fpsMedian} | ${s.valid?'sì':'no'} | ${s.carry.seconds} / ${s.carry.heroFrames} | ${dist} / ${s.carry.over1_5.length} | ${jump} | ${fmt(s.hero.carryAccelerationP99)} / ${s.hero.carryInversions.length} | ${gesture} | ${s.dt.median}/${s.dt.p95}/${s.dt.over50.length} |`;
};
const rows=ids.map(row).join('\n');
const feetRows=ids.map(g=>{const s=g===38?d.rerun38:d.scenes[g];return `| ${g}${g===38?'†':''} | ${['0-3','3-6','6-9','9+'].map(k=>foot(s,k)).join(' | ')} |`;}).join('\n');
const opRows=d.openingNoProfiler.openings.map(o=>`| ${o.index} | ${o.longTaskMaxMs} | ${o.longTaskSumMs} | ${Math.round(o.rafMaxGapMs*10)/10} |`).join('\n');
const top=d.opening.profileFunctions.map((x,i)=>`| ${i+1} | \`${x.name}\` | ${x.ownMs} |`).join('\n');
const worst=d.video.groups.find(g=>g.name==='peggiori');
const best=d.video.groups.find(g=>g.name==='confronto');
const iso=d.isolatedVideo.groups[0].scenes[0];
const slow=d.counts.selectedIds.flatMap(g=>d.scenes[g].dt.over50);
const slowFirstGesture=slow.filter(x=>x.firstGesture).length;
const slowCut=slow.filter(x=>x.cut).length;
const slowCameraOver2=slow.filter(x=>x.cameraStep>2).length;
const videoRows=[...worst.scenes.map(s=>({group:'peggiori',...s})),...best.scenes.map(s=>({group:'confronto',...s}))]
  .map(s=>`| ${s.gi} | ${s.group} | ${s.offsetSec} | ${s.fpsMedian} | ${s.gi===87?'**esclusa: usare ripresa isolata**':'valida per confronto visivo'} |`).join('\n');
const report=`# Fluidità degli highlight 3D — collaudo esterno

Versione verificata nel file: **GAME_VERSION=7.999.39**, commit \`901cca1786247d40d1de4894d4619101653dc22c\`, ramo \`codex/2026-09-28-fluidita-3d\`. Il ramo discende da \`origin/main\` usato all'avvio. Dopo la misura, \`git fetch origin main\` ha restituito una versione successiva: i risultati qui descrivono **solo il commit testato**. Nessun file del gioco è stato modificato.

**Esito principale.** Con Chrome e GPU Direct3D11, corpi GLB accesi, la scansione ha completato ${d.counts.scanned} scene forzate (azione 0, esito success): ${d.counts.valid} valide a FPS mediano ≥45 e ${d.counts.invalid} escluse. Le ${d.counts.selected} scene con ≥1 s di scrittore palla 4/14 e portatore eroe hanno FPS mediano ${d.counts.minSelectedFps}–${d.counts.maxSelectedFps}. Il problema osservato non si esaurisce nel framerate mediano: ${d.counts.longFrames} intervalli rAF >50 ms in ${d.counts.longScenes} di tali scene, scivolamento d'appoggio misurabile, e due grandi riallineamenti della palla durante la conduzione. Sono **candidati**, non difetti confermati in partita naturale o su telefono.

## Riproduzione e condizioni

Eseguire dalla radice del repository in PowerShell. Questi sono i comandi completi che generano tutti i numeri nelle tabelle; i file JSON conservano gli stessi valori per fotogramma. Il log integrale della scansione è in \`reports/codex/2026-09-28-fluidita-3d-scan.json.gz\` e si legge con \`node:zlib.gunzipSync\`. Le sintesi di accelerazione e gesti nel log compresso furono calcolate prima della correzione del clock e del troncamento; **usare le tracce grezze lì e le sintesi corrette nel JSON finale**.

\`\`\`powershell
git show -s --format='%H %s' HEAD
rg -n 'const GAME_VERSION=' CARRIER-MANAGER-AV.html
rg -n '__CPM_TIRO34_REC|__CPM_WS38_REC|__CPM_PIEDI_REC|_WS524' src/12-three-match-view.jsx src/10-folla-stadi-ritiro.jsx
rg -n 'renderer.setSize|_ws524=14|_ws524=4' src/12-three-match-view.jsx
node tools/build-src.mjs --check
$env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
$env:CPM_GPU_MODE='headless-d3d11'
$env:CPM_TASK='scan'
$env:CPM_SCENE_MS='6000'
Remove-Item Env:CPM_FEET -ErrorAction SilentlyContinue
node tests/codex/fluidita-3d.mjs
$env:CPM_TASK='pilot'
$env:CPM_GI='38'
node tests/codex/fluidita-3d.mjs
$env:CPM_GLB='1'
$env:CPM_ATTESA='15000'
$env:CPM_SCENES='5'
node tests/codex/apertura-gpu.mjs
$env:CPM_PROFILE='0'
node tests/codex/apertura-gpu.mjs
Remove-Item Env:CPM_PROFILE -ErrorAction SilentlyContinue
$env:CPM_HEADED='1'
Remove-Item Env:CPM_VIDEO_IDS -ErrorAction SilentlyContinue
Remove-Item Env:CPM_VIDEO_NAME -ErrorAction SilentlyContinue
node tests/codex/video-fluidita-3d.mjs
$env:CPM_VIDEO_IDS='87'
$env:CPM_VIDEO_NAME='prova-headed-87'
node tests/codex/video-fluidita-3d.mjs
node tests/codex/riepilogo-fluidita-3d.mjs
node tests/codex/genera-report-fluidita-3d.mjs
\`\`\`

Chrome è avviato con \`--headless=new --use-gl=angle --use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist\`; le riprese video usano Chrome headed con D3D11. Renderer verificato: \`${d.renderer.renderer}\`. Viewport 412×915, deviceScaleFactor 2; la tela WebGL misurata all'apertura è 615×1185 pixel interni. GLB \`true\`, \`__CPM_MXCLIP=${d.glb.mxclip}\`, override \`__CPM_GLB\` non imposto. La pagina è aperta con \`openMatch\` come l'harness di \`tests/visual\`; prima di risolvere l'azione attende le clip. \`__CPM_CINE=1\` è indispensabile nel test \`?cpmtest=1\` per far correre il buildup: la prima scansione senza tale flag non misurava la conduzione ed è stata scartata. Il testimone addizionale \`__CPM_PIEDI_REC\` è disattivato per limitare l'effetto della sonda sul framerate; \`sl\` proviene da \`__CPM_TIRO34\`.

La durata di conduzione è quella dello scrittore palla 4/14; la distanza piede-palla e il pattinamento si calcolano soltanto nei fotogrammi in cui \`owner=-2\` o \`pori=-2\` identifica l'eroe. Il testimone definisce \`dL/dR\`, \`sl\` e \`v\` in \`src/12-three-match-view.jsx:10058-10069\`; \`sl\` è la velocità orizzontale minima di un piede appoggiato (osso sotto 0,12 u in due fotogrammi consecutivi). Lo scrittore WS38 è registrato in \`src/12-three-match-view.jsx:3155\`, con i codici in \`src/10-folla-stadi-ritiro.jsx:558\`. Il codice 14 porta ancora l'etichetta storica «testa», ma \`src/12-three-match-view.jsx:6674-6763\` lo usa anche per la palla incollata al portatore del beat; il codice 4 può riguardare un portatore diverso dall'eroe. FPS = 1000 / mediana dei \`dt\` rAF nella fase \`hl_result\`. Salto candidato = spostamento palla > \`85 u/s × dt dello scrittore + 0,5 u\`; 85 u/s è una soglia operativa conservativa, non il limite fisico del gioco (cfr. \`src/10-folla-stadi-ritiro.jsx:615\`). Accelerazione e inversione si calcolano dalle posizioni dell'eroe e dal **tempo del testimone 3D**; l'orologio rAF intercalato generava falsi picchi ed è stato escluso.

## Scene misurate

In tabella: «conduzione» = secondi writer 4/14 / fotogrammi con eroe portatore; «piede» = distanza dal piede più vicino mediana/p95/massimo, poi fotogrammi >1,5 u; «salti» = conteggio / massimo in u nell'intero \`hl_result\`; «strappi» = p99 u/s² durante conduzione dell'eroe / inversioni >90°; «gesti» = cambi / cambi al secondo / segmenti completi <0,15 s; «dt» = mediana/p95 ms / fotogrammi >50 ms. †: gi38 esclusa dalla passata unica a ${d.scenes[38].fpsMedian} FPS, ma valida nel rerun isolato a ${d.rerun38.fpsMedian} FPS. «—» indica dato non misurabile, non zero.

| gi | FPS | valida | conduzione s / frame eroe | piede med/p95/max / >1,5 | salti n/max | strappi p99 / inversioni | gesti cambi/s/<0,15 | dt med/p95/>50 |
|---:|---:|:---:|---:|---:|---:|---:|---:|---:|
${rows}

Pattinamento \`sl\` (u/s): ogni cella mostra **mediana (campioni)** per fascia di velocità \`v\` dell'eroe. L'asterisco marca fasce sotto 20 campioni, senza conclusione per quella scena.

| gi | 0–3 u/s | 3–6 u/s | 6–9 u/s | 9+ u/s |
|---:|---:|---:|---:|---:|
${feetRows}

Aggregando solo gli ${d.counts.carryFrames} fotogrammi di conduzione dell'eroe delle ${d.counts.selected} scene valide: \`sl\` è >3 u/s in ${d.counts.slipOver3} campioni, >5 in ${d.counts.slipOver5}, >10 in ${d.counts.slipOver10}; massimo ${d.counts.slipMax} u/s. Per fascia: 0–3, n=${d.counts.slBySpeed['0-3'].n}, mediana ${d.counts.slBySpeed['0-3'].median}, p95 ${d.counts.slBySpeed['0-3'].p95}; 3–6, n=${d.counts.slBySpeed['3-6'].n}, mediana ${d.counts.slBySpeed['3-6'].median}, p95 ${d.counts.slBySpeed['3-6'].p95}; 6–9, n=${d.counts.slBySpeed['6-9'].n}, mediana ${d.counts.slBySpeed['6-9'].median}, p95 ${d.counts.slBySpeed['6-9'].p95}; 9+, n=${d.counts.slBySpeed['9+'].n}, mediana ${d.counts.slBySpeed['9+'].median}, p95 ${d.counts.slBySpeed['9+'].p95}. Ogni fascia aggregata supera 20 campioni. La misura conferma movimento del piede appoggiato rispetto al terreno; **non conferma da sola quanto sia visibile** alla camera mobile.

I fotogrammi con distanza >1,5 u sono ${d.counts.farFrames} su ${d.counts.carryFrames}, uno per ciascuna delle scene gi16,17,50,82,84,87,91, attorno alla fine del tratto di conduzione. L'arco normale della palla e la distanza dal centro della sfera rendono il criterio un indicatore, non una collisione esatta. Il p99 dell'accelerazione nella conduzione è ${d.counts.heroAccelerationP99} u/s² su ${d.counts.heroAccelerationSamples} campioni; non risultano inversioni >90°. Il picco gi0/frame 86 a t=1,578 s, ${d.heroAccelerationOutliers[0].acceleration} u/s², coincide con il montaggio di \`kick\` e un singolo fotogramma in cui la radice dell'eroe resta ferma; è una frenata da verificare visivamente, non una diagnosi certa di errore.

Nei tratti di conduzione non ho osservato segmenti **completi** di gesto sotto 0,15 s. I gesti che iniziano sull'ultimo frame di conduzione sono censurati a destra, quindi non vengono chiamati «brevi». Il campo \`g=null\` indica assenza di un gesto d'azione one-shot; la clip ciclica \`run\` non è rappresentata da \`g\` (cfr. \`src/12-three-match-view.jsx:9809-9811,10069\`). La continuità visiva della clip di corsa rimane **non verificata** dal solo conteggio di \`g\`.

## Taccuino PO e salti del pallone

Sono state misurate anche le scene obbligatorie gi64,81,38,152,176,92,25. Nella finestra \`hl_result\` gi64,81,38 (rerun) e152 non presentano salti secondo la soglia; gi176 ne ha 6 (massimo 4,06 u, frame 39 a 0,959 s, scrittore 13→13), gi92 ne ha 2 (massimo 4,4 u, frame 81 a 1,814 s, 13→12), gi25 ne ha 2 (massimo 10,81 u, frame 72 a 1,302 s, 13→13). Questo **non smentisce** le osservazioni del PO nella partita naturale: \`__CPM_FORCE_SIT\` salta la continuità fra scene. Nei log integrali appaiono anche riposizionamenti da cambio scena prima di \`hl_result\`, da non attribuire al gioco naturale.

Fra le ${d.counts.selected} scene di conduzione lunga, il criterio segnala ${d.counts.jumps} salti nell'intero risultato, ma soltanto due cadono mentre il portatore è l'eroe: gi50/frame 2, 31,38 u a 0,043 s (scrittore 0→14), e gi87/frame 15, 39,43 u a 0,299 s (14→14). In gi50 la palla parte dalla posizione precedente e si allinea all'eroe all'inizio del risultato: probabile artefatto di scena forzata, **non verificato** in partita naturale. In gi87 la palla resta per più frame a (50,6; −0,68) mentre l'eroe è altrove e poi si sposta ai suoi piedi; l'identità del portatore registrata passa da 10 a −2 al frame precedente. È un candidato più forte a un handoff tardivo, ma il taglio forzato e il flag camera-cut sono ancora attivi. **Ipotesi di codice**, non fix proposto: transizione di portatore in \`src/12-three-match-view.jsx:6674-6679\` e scrittura aderente in \`:6761-6763\`; il riposizionamento di scena è in \`:3355\`. Per gi25 e gi176 il candidato è la scrittura del buildup in \`:6626-6632\`; per gi92 è la transizione 13→12. Occorre un guardiano in partita naturale che confermi questi punti prima di intervenire nel gioco.

## Regolarità e blocco all'apertura

Nei tratti selezionati i \`dt\` mediani sono circa 16,7 ms, ma sono registrati ${d.counts.longFrames} frame >50 ms. ${slowFirstGesture} coincidono con il primo cambio di gesto e ${slowCut} con il flag di camera-cut; ${slowCameraOver2} con uno spostamento di camera >2 u nel campione. Esempio: gi42/frame 279, t=4,649 s, dt=185,3 ms, nessun nuovo gesto né taglio di camera; gi148/frame 7, t=0,206 s, dt=116,8 ms, camera-cut attivo. La causa dei singoli gap resta **non verificata**: il rAF misura la pagina e include l'eventuale costo dei testimoni.

La sonda di apertura usa una **partita naturale**, GLB pronto e ulteriori 15 s di attesa, poi misura cinque scene nella stessa partita; procede con i pulsanti reali \`Scegli\` e \`Continua\`. Il renderer è D3D11. Una prima versione della sonda si fermava in \`hl_move\`: era un difetto del **test**, non del gioco, ed è stata corretta prima dei numeri seguenti. La tabella usa la replica **senza profiler CPU**; il profilo è stato raccolto in un'altra replica.

| Apertura | long task massimo ms | somma long task ms nella finestra | massimo gap rAF ms |
|---:|---:|---:|---:|
${opRows}

La finestra va da 1,5 s prima a 4 s dopo il primo \`hl_intro\` rilevato. La prima apertura supera 100 ms anche con la GPU; la seconda misura ${d.openingNoProfiler.openings[1].longTaskMaxMs} ms, poi le successive restano sotto 100 ms. Il gap rAF può essere maggiore del singolo long task perché include più operazioni e attese. Nella replica **con** profiler i massimi alle prime due aperture erano ${d.opening.openings[0].longTaskMaxMs} e ${d.opening.openings[1].longTaskMaxMs} ms: l'overhead del profiler è una possibile spiegazione della differenza, non una prova. Profilo CPU campionato dalla richiesta della prima scena fino a 4 s dopo l'apertura: dieci funzioni per **tempo proprio**, escluse le pseudo-voci \`idle\`, \`program\`, \`garbage collector\` e \`root\`. Le righe con URL vuoto appartengono al bundle compilato e non identificano con certezza una funzione sorgente; \`three.min.js:6\` è minificato.

| # | Funzione nel profilo | tempo proprio ms |
|---:|---|---:|
${top}

Il profilo non isola perfettamente il singolo long task: comprende anche l'intervallo fra richiesta e apertura. \`renderer.setSize\` compare in \`src/12-three-match-view.jsx:10335\` al resize e in \`:369\` al montaggio, ma **non è dimostrato** qui che sia la causa dominante del blocco; nei campioni CPU compaiono anche attraversamento dei mesh, matrici e caricamento texture. L'ipotesi va verificata dal team con un profilo ristretto. Questa è una GPU Intel UHD 620 su Windows; l'impatto su un telefono resta **non verificato**.

## Video per giudizio a occhio

Playwright \`recordVideo\` ha registrato cinque scene peggiori (salti/cadenza/distanza) e due confronti migliori. Gli offset sono il tempo **prima** di \`__CPM_RESOLVE\`, quindi cercare l'evento alcuni fotogrammi dopo \`offset + t\`; i tempi \`t\` qui sotto sono quelli misurati dal testimone **dall'avvio di hl_result**. Il video di gruppo per gi87 scende sotto 45 FPS: escluderlo dal giudizio e usare la ripresa isolata headed, valida a ${iso.fpsMedian} FPS.

| gi | video | offset approssimativo s | FPS mediano durante ripresa | uso |
|---:|---|---:|---:|---|
${videoRows}
| 87 | prova-headed-87 | ${iso.offsetSec} | ${iso.fpsMedian} | valida, ripresa isolata |

- [Cinque scene peggiori](video-fluidita-3d/peggiori.webm): gi50 guardare 0,043 s dall'avvio scena; gi25 1,302 s; gi92 1,814 s; gi176 0,959 s. Gi87 in questo video non è valido a causa del framerate della registrazione.
- [Gi87 isolata](video-fluidita-3d/prova-headed-87.webm): guardare 0,299 s dall'avvio della scena, dopo l'offset approssimativo ${iso.offsetSec} s.
- [Due scene di confronto](video-fluidita-3d/confronto.webm): gi0 e gi42; la conduzione inizia poco dopo l'offset di ciascuna scena. [Manifesto video](video-fluidita-3d/manifest.json) e [manifesto gi87](video-fluidita-3d/manifest-prova-headed-87.json) riportano offset e FPS.

## Priorità per frequenza × gravità

1. **Alta, blocco di apertura:** prima scena long task ${d.openingNoProfiler.openings[0].longTaskMaxMs} ms e seconda ${d.openingNoProfiler.openings[1].longTaskMaxMs} ms con GPU D3D11 e profiler spento. Impatto diretto sulla fluidità percepita; causa sorgente **non verificata**. Esaminare il profilo allegato e \`src/12-three-match-view.jsx:10335\` solo come ipotesi.
2. **Alta, pattinamento durante la conduzione:** ${d.counts.slipOver3}/${d.counts.carryFrames} campioni di piede appoggiato >3 u/s; tutte le fasce aggregate hanno almeno 20 campioni. Ipotesi: cadenza della clip \`run\` e velocità del mesh in \`src/12-three-match-view.jsx:9809-9811\`. La visibilità a schermo è da confermare col PO.
3. **Alta/media, salti di allineamento:** due salti >30 u mentre l'eroe porta, gi50/frame 2 e gi87/frame 15. Gi50 è probabilmente un artefatto della forzatura; gi87 resta da riprodurre in partita naturale. Righe sospette, come ipotesi: \`src/12-three-match-view.jsx:3355,6674-6679,6761-6763\`.
4. **Media, cadute di cadenza:** ${d.counts.longFrames} frame >50 ms in ${d.counts.longScenes}/${d.counts.selected} scene valide nonostante FPS mediano alto. Causa non verificata; la sonda stessa può incidere sul carico.
5. **Bassa/media, distanza dal piede:** ${d.counts.farFrames}/${d.counts.carryFrames} frame >1,5 u, tutti isolati vicino alla fine della conduzione. La geometria del centro palla e delle ossa del piede richiede verifica visiva; scrittura sospetta, **ipotesi**, \`src/12-three-match-view.jsx:6761-6763\`.
6. **Non confermato, cambi gesto:** nessun segmento completo <0,15 s nella conduzione; \`g\` non descrive la clip ciclica di corsa. Il difetto soggettivo dei passaggi di animazione resta non verificato con questo testimone.

File di prova: [JSON leggibile](2026-09-28-fluidita-3d.json), [log integrale compresso](2026-09-28-fluidita-3d-scan.json.gz), [misura aperture senza profiler](2026-09-28-apertura-gpu-no-profiler.json), [profilo CPU](2026-09-28-apertura-gpu.cpuprofile). Il JSON include le 191 sintesi, le tracce per fotogramma delle scene selezionate e obbligatorie, il rerun di gi38 e gli offset video. Non ho modificato il gioco, né eseguito merge, deploy o pubblicazione.
`;
const target=path.join(dir,'2026-09-28-fluidita-3d.md');
fs.writeFileSync(target,report);
console.log(JSON.stringify({file:path.relative(root,target),bytes:fs.statSync(target).size,sceneRows:ids.length,footRows:ids.length,openingRows:d.openingNoProfiler.openings.length,profileRows:d.opening.profileFunctions.length}));
