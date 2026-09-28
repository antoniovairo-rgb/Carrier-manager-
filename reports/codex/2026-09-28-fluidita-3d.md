# Fluidità degli highlight 3D — collaudo esterno

Versione verificata nel file: **GAME_VERSION=7.999.39**, commit `901cca1786247d40d1de4894d4619101653dc22c`, ramo `codex/2026-09-28-fluidita-3d`. Il ramo discende da `origin/main` usato all'avvio. Dopo la misura, `git fetch origin main` ha restituito una versione successiva: i risultati qui descrivono **solo il commit testato**. Nessun file del gioco è stato modificato.

**Esito principale.** Con Chrome e GPU Direct3D11, corpi GLB accesi, la scansione ha completato 191 scene forzate (azione 0, esito success): 171 valide a FPS mediano ≥45 e 20 escluse. Le 15 scene con ≥1 s di scrittore palla 4/14 e portatore eroe hanno FPS mediano 58.48–59.88. Il problema osservato non si esaurisce nel framerate mediano: 95 intervalli rAF >50 ms in 14 di tali scene, scivolamento d'appoggio misurabile, e due grandi riallineamenti della palla durante la conduzione. Sono **candidati**, non difetti confermati in partita naturale o su telefono.

## Riproduzione e condizioni

Eseguire dalla radice del repository in PowerShell. Questi sono i comandi completi che generano tutti i numeri nelle tabelle; i file JSON conservano gli stessi valori per fotogramma. Il log integrale della scansione è in `reports/codex/2026-09-28-fluidita-3d-scan.json.gz` e si legge con `node:zlib.gunzipSync`. Le sintesi di accelerazione e gesti nel log compresso furono calcolate prima della correzione del clock e del troncamento; **usare le tracce grezze lì e le sintesi corrette nel JSON finale**.

```powershell
git show -s --format='%H %s' HEAD
rg -n 'const GAME_VERSION=' CARRIER-MANAGER-AV.html
rg -n '__CPM_TIRO34_REC|__CPM_WS38_REC|__CPM_PIEDI_REC|_WS524' src/12-three-match-view.jsx src/10-folla-stadi-ritiro.jsx
rg -n 'renderer.setSize|_ws524=14|_ws524=4' src/12-three-match-view.jsx
node tools/build-src.mjs --check
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'
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
```

Chrome è avviato con `--headless=new --use-gl=angle --use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`; le riprese video usano Chrome headed con D3D11. Renderer verificato: `ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00003EA0) Direct3D11 vs_5_0 ps_5_0, D3D11)`. Viewport 412×915, deviceScaleFactor 2; la tela WebGL misurata all'apertura è 615×1185 pixel interni. GLB `true`, `__CPM_MXCLIP=63`, override `__CPM_GLB` non imposto. La pagina è aperta con `openMatch` come l'harness di `tests/visual`; prima di risolvere l'azione attende le clip. `__CPM_CINE=1` è indispensabile nel test `?cpmtest=1` per far correre il buildup: la prima scansione senza tale flag non misurava la conduzione ed è stata scartata. Il testimone addizionale `__CPM_PIEDI_REC` è disattivato per limitare l'effetto della sonda sul framerate; `sl` proviene da `__CPM_TIRO34`.

La durata di conduzione è quella dello scrittore palla 4/14; la distanza piede-palla e il pattinamento si calcolano soltanto nei fotogrammi in cui `owner=-2` o `pori=-2` identifica l'eroe. Il testimone definisce `dL/dR`, `sl` e `v` in `src/12-three-match-view.jsx:10058-10069`; `sl` è la velocità orizzontale minima di un piede appoggiato (osso sotto 0,12 u in due fotogrammi consecutivi). Lo scrittore WS38 è registrato in `src/12-three-match-view.jsx:3155`, con i codici in `src/10-folla-stadi-ritiro.jsx:558`. Il codice 14 porta ancora l'etichetta storica «testa», ma `src/12-three-match-view.jsx:6674-6763` lo usa anche per la palla incollata al portatore del beat; il codice 4 può riguardare un portatore diverso dall'eroe. FPS = 1000 / mediana dei `dt` rAF nella fase `hl_result`. Salto candidato = spostamento palla > `85 u/s × dt dello scrittore + 0,5 u`; 85 u/s è una soglia operativa conservativa, non il limite fisico del gioco (cfr. `src/10-folla-stadi-ritiro.jsx:615`). Accelerazione e inversione si calcolano dalle posizioni dell'eroe e dal **tempo del testimone 3D**; l'orologio rAF intercalato generava falsi picchi ed è stato escluso.

## Scene misurate

In tabella: «conduzione» = secondi writer 4/14 / fotogrammi con eroe portatore; «piede» = distanza dal piede più vicino mediana/p95/massimo, poi fotogrammi >1,5 u; «salti» = conteggio / massimo in u nell'intero `hl_result`; «strappi» = p99 u/s² durante conduzione dell'eroe / inversioni >90°; «gesti» = cambi / cambi al secondo / segmenti completi <0,15 s; «dt» = mediana/p95 ms / fotogrammi >50 ms. †: gi38 esclusa dalla passata unica a 31.45 FPS, ma valida nel rerun isolato a 59.88 FPS. «—» indica dato non misurabile, non zero.

| gi | FPS | valida | conduzione s / frame eroe | piede med/p95/max / >1,5 | salti n/max | strappi p99 / inversioni | gesti cambi/s/<0,15 | dt med/p95/>50 |
|---:|---:|:---:|---:|---:|---:|---:|---:|---:|
| 0 | 59.88 | sì | 1.12 / 66 | 0.86/1.18/1.21 / 0 | 0 | 616.61 / 0 | 1/0.89/0 | 16.7/16.8/3 |
| 16 | 59.88 | sì | 1.34 / 78 | 0.83/1.19/1.73 / 1 | 1 / 1.59 | 71.42 / 0 | 0/0/0 | 16.7/33.3/0 |
| 17 | 59.88 | sì | 1.35 / 73 | 0.92/1.19/1.81 / 1 | 0 | 85.67 / 0 | 0/0/0 | 16.7/33.3/2 |
| 42 | 59.88 | sì | 1.36 / 63 | 0.94/1.17/1.46 / 0 | 0 | 40.61 / 0 | 0/0/0 | 16.7/33.4/6 |
| 46 | 59.88 | sì | 1.34 / 68 | 0.9/1.14/1.19 / 0 | 1 / 2.3 | 72.95 / 0 | 0/0/0 | 16.7/50/9 |
| 50 | 59.88 | sì | 1.36 / 76 | 0.86/1.14/1.88 / 1 | 2 / 31.38 | 65.88 / 0 | 0/0/0 | 16.7/33.6/5 |
| 82 | 59.88 | sì | 1.35 / 68 | 0.94/1.13/1.91 / 1 | 0 | 40.69 / 0 | 0/0/0 | 16.7/33.4/4 |
| 83 | 59.88 | sì | 1.35 / 71 | 0.86/1.17/1.19 / 0 | 1 / 2.02 | 73.13 / 0 | 0/0/0 | 16.7/33.4/1 |
| 84 | 59.88 | sì | 1.36 / 70 | 0.94/1.18/1.87 / 1 | 2 / 1.72 | 58.9 / 0 | 0/0/0 | 16.7/33.4/1 |
| 87 | 59.88 | sì | 1.35 / 58 | 0.9/1.19/1.74 / 1 | 3 / 39.43 | 81.03 / 0 | 0/0/0 | 16.7/33.7/4 |
| 91 | 59.88 | sì | 1.06 / 36 | 0.87/1.18/1.75 / 1 | 0 | 36.92 / 0 | 0/0/0 | 16.7/50.1/14 |
| 96 | 59.88 | sì | 1.36 / 61 | 0.97/1.17/1.19 / 0 | 1 / 3.34 | 35.99 / 0 | 0/0/0 | 16.7/50/7 |
| 100 | 59.88 | sì | 1.38 / 66 | 0.92/1.17/1.35 / 0 | 3 / 3.37 | 63.02 / 0 | 0/0/0 | 16.7/50.1/14 |
| 102 | 59.88 | sì | 1.37 / 68 | 0.87/1.1/1.18 / 0 | 0 | 60.14 / 0 | 0/0/0 | 16.7/33.6/6 |
| 148 | 58.48 | sì | 1.35 / 46 | 0.86/1.13/1.2 / 0 | 0 | 36.24 / 0 | 0/0/0 | 17.1/66.6/19 |
| 64 | 59.88 | sì | 0.41 / 0 | — / 0 | 0 | — / 0 | — | 16.7/33.3/2 |
| 81 | 59.88 | sì | 0 / 0 | — / 0 | 0 | — / 0 | — | 16.7/33.4/3 |
| 38† | 59.88 | sì | 0.45 / 7 | 0.86/1.09/1.09 / 0 | 0 | 195.57 / 0 | 1/2.22/0 | 16.7/50/12 |
| 152 | 59.88 | sì | 0.41 / 7 | 0.83/1.14/1.14 / 0 | 0 | 354.32 / 0 | 1/2.44/0 | 16.7/50.2/14 |
| 176 | 59.88 | sì | 0.45 / 8 | 0.98/1.2/1.2 / 0 | 6 / 4.06 | 201.5 / 0 | 1/2.22/0 | 16.7/50.1/15 |
| 92 | 59.88 | sì | 0.47 / 20 | 0.78/0.89/0.89 / 0 | 2 / 4.4 | 25.33 / 0 | 1/2.13/0 | 16.7/50.1/12 |
| 25 | 59.88 | sì | 0.67 / 0 | — / 0 | 2 / 10.81 | — / 0 | — | 16.7/33.3/1 |

Pattinamento `sl` (u/s): ogni cella mostra **mediana (campioni)** per fascia di velocità `v` dell'eroe. L'asterisco marca fasce sotto 20 campioni, senza conclusione per quella scena.

| gi | 0–3 u/s | 3–6 u/s | 6–9 u/s | 9+ u/s |
|---:|---:|---:|---:|---:|
| 0 | 3.54 (12*) | 4.72 (17*) | 2.49 (37) | — (0) |
| 16 | 0.95 (12*) | 4.07 (11*) | 2.5 (46) | 1.75 (9*) |
| 17 | 1.14 (13*) | 3.88 (11*) | 2.43 (40) | 1.86 (9*) |
| 42 | 0.9 (13*) | 4.66 (10*) | 2.7 (33) | 2.36 (7*) |
| 46 | 4.03 (3*) | 6.04 (7*) | 3.59 (47) | 1.84 (11*) |
| 50 | 0.79 (12*) | 4.43 (11*) | 3.06 (43) | 2.68 (10*) |
| 82 | 3 (5*) | 3.75 (11*) | 2.11 (47) | 2.59 (5*) |
| 83 | 1.15 (8*) | 4.66 (10*) | 2.87 (42) | 1.72 (11*) |
| 84 | 0.69 (12*) | 3.72 (12*) | 2.32 (38) | 1.58 (8*) |
| 87 | — (0) | 5.43 (10*) | 2.82 (39) | 1.49 (9*) |
| 91 | 4.61 (2*) | 4.05 (13*) | 3.29 (21) | — (0) |
| 96 | 1.36 (9*) | 2.51 (10*) | 2.34 (33) | 1.74 (9*) |
| 100 | 1.85 (11*) | 3.61 (9*) | 2.35 (38) | 2.03 (8*) |
| 102 | 1.3 (12*) | 4.64 (10*) | 3.31 (40) | 2.35 (6*) |
| 148 | 2.98 (8*) | 3.68 (7*) | 2.97 (25) | 1.72 (6*) |
| 64 | — (0) | — (0) | — (0) | — (0) |
| 81 | — (0) | — (0) | — (0) | — (0) |
| 38† | 6.56 (1*) | — (0) | — (0) | 2.54 (6*) |
| 152 | 8.6 (1*) | — (0) | — (0) | 6.56 (6*) |
| 176 | 4.48 (1*) | — (0) | — (0) | 3.81 (7*) |
| 92 | 1.59 (7*) | 2.01 (9*) | 3.41 (4*) | — (0) |
| 25 | — (0) | — (0) | — (0) | — (0) |

Aggregando solo gli 968 fotogrammi di conduzione dell'eroe delle 15 scene valide: `sl` è >3 u/s in 450 campioni, >5 in 173, >10 in 16; massimo 14.43 u/s. Per fascia: 0–3, n=132, mediana 1.45, p95 4.38; 3–6, n=159, mediana 4.15, p95 6.66; 6–9, n=569, mediana 2.69, p95 7.62; 9+, n=108, mediana 1.94, p95 11.05. Ogni fascia aggregata supera 20 campioni. La misura conferma movimento del piede appoggiato rispetto al terreno; **non conferma da sola quanto sia visibile** alla camera mobile.

I fotogrammi con distanza >1,5 u sono 7 su 968, uno per ciascuna delle scene gi16,17,50,82,84,87,91, attorno alla fine del tratto di conduzione. L'arco normale della palla e la distanza dal centro della sfera rendono il criterio un indicatore, non una collisione esatta. Il p99 dell'accelerazione nella conduzione è 65.39 u/s² su 955 campioni; non risultano inversioni >90°. Il picco gi0/frame 86 a t=1,578 s, 616.61 u/s², coincide con il montaggio di `kick` e un singolo fotogramma in cui la radice dell'eroe resta ferma; è una frenata da verificare visivamente, non una diagnosi certa di errore.

Nei tratti di conduzione non ho osservato segmenti **completi** di gesto sotto 0,15 s. I gesti che iniziano sull'ultimo frame di conduzione sono censurati a destra, quindi non vengono chiamati «brevi». Il campo `g=null` indica assenza di un gesto d'azione one-shot; la clip ciclica `run` non è rappresentata da `g` (cfr. `src/12-three-match-view.jsx:9809-9811,10069`). La continuità visiva della clip di corsa rimane **non verificata** dal solo conteggio di `g`.

## Taccuino PO e salti del pallone

Sono state misurate anche le scene obbligatorie gi64,81,38,152,176,92,25. Nella finestra `hl_result` gi64,81,38 (rerun) e152 non presentano salti secondo la soglia; gi176 ne ha 6 (massimo 4,06 u, frame 39 a 0,959 s, scrittore 13→13), gi92 ne ha 2 (massimo 4,4 u, frame 81 a 1,814 s, 13→12), gi25 ne ha 2 (massimo 10,81 u, frame 72 a 1,302 s, 13→13). Questo **non smentisce** le osservazioni del PO nella partita naturale: `__CPM_FORCE_SIT` salta la continuità fra scene. Nei log integrali appaiono anche riposizionamenti da cambio scena prima di `hl_result`, da non attribuire al gioco naturale.

Fra le 15 scene di conduzione lunga, il criterio segnala 14 salti nell'intero risultato, ma soltanto due cadono mentre il portatore è l'eroe: gi50/frame 2, 31,38 u a 0,043 s (scrittore 0→14), e gi87/frame 15, 39,43 u a 0,299 s (14→14). In gi50 la palla parte dalla posizione precedente e si allinea all'eroe all'inizio del risultato: probabile artefatto di scena forzata, **non verificato** in partita naturale. In gi87 la palla resta per più frame a (50,6; −0,68) mentre l'eroe è altrove e poi si sposta ai suoi piedi; l'identità del portatore registrata passa da 10 a −2 al frame precedente. È un candidato più forte a un handoff tardivo, ma il taglio forzato e il flag camera-cut sono ancora attivi. **Ipotesi di codice**, non fix proposto: transizione di portatore in `src/12-three-match-view.jsx:6674-6679` e scrittura aderente in `:6761-6763`; il riposizionamento di scena è in `:3355`. Per gi25 e gi176 il candidato è la scrittura del buildup in `:6626-6632`; per gi92 è la transizione 13→12. Occorre un guardiano in partita naturale che confermi questi punti prima di intervenire nel gioco.

## Regolarità e blocco all'apertura

Nei tratti selezionati i `dt` mediani sono circa 16,7 ms, ma sono registrati 95 frame >50 ms. 2 coincidono con il primo cambio di gesto e 5 con il flag di camera-cut; 0 con uno spostamento di camera >2 u nel campione. Esempio: gi42/frame 279, t=4,649 s, dt=185,3 ms, nessun nuovo gesto né taglio di camera; gi148/frame 7, t=0,206 s, dt=116,8 ms, camera-cut attivo. La causa dei singoli gap resta **non verificata**: il rAF misura la pagina e include l'eventuale costo dei testimoni.

La sonda di apertura usa una **partita naturale**, GLB pronto e ulteriori 15 s di attesa, poi misura cinque scene nella stessa partita; procede con i pulsanti reali `Scegli` e `Continua`. Il renderer è D3D11. Una prima versione della sonda si fermava in `hl_move`: era un difetto del **test**, non del gioco, ed è stata corretta prima dei numeri seguenti. La tabella usa la replica **senza profiler CPU**; il profilo è stato raccolto in un'altra replica.

| Apertura | long task massimo ms | somma long task ms nella finestra | massimo gap rAF ms |
|---:|---:|---:|---:|
| 1 | 755 | 2167 | 766.5 |
| 2 | 150 | 439 | 134 |
| 3 | 79 | 391 | 100 |
| 4 | 86 | 151 | 83.3 |
| 5 | 74 | 124 | 99.9 |

La finestra va da 1,5 s prima a 4 s dopo il primo `hl_intro` rilevato. La prima apertura supera 100 ms anche con la GPU; la seconda misura 150 ms, poi le successive restano sotto 100 ms. Il gap rAF può essere maggiore del singolo long task perché include più operazioni e attese. Nella replica **con** profiler i massimi alle prime due aperture erano 1053 e 532 ms: l'overhead del profiler è una possibile spiegazione della differenza, non una prova. Profilo CPU campionato dalla richiesta della prima scena fino a 4 s dopo l'apertura: dieci funzioni per **tempo proprio**, escluse le pseudo-voci `idle`, `program`, `garbage collector` e `root`. Le righe con URL vuoto appartengono al bundle compilato e non identificano con certezza una funzione sorgente; `three.min.js:6` è minificato.

| # | Funzione nel profilo | tempo proprio ms |
|---:|---|---:|
| 1 | `(anonima) @:3359` | 3839.03 |
| 2 | `(anonima) @three.min.js:6` | 1926.6 |
| 3 | `traverse @three.min.js:6` | 1013.21 |
| 4 | `_dec918 @:8563` | 955.68 |
| 5 | `updateMatrixWorld @three.min.js:6` | 719.15 |
| 6 | `(anonima) @:7948` | 479.51 |
| 7 | `updateWorldMatrix @three.min.js:6` | 351.12 |
| 8 | `At @three.min.js:6` | 249.84 |
| 9 | `fill @:0` | 192.69 |
| 10 | `texImage2D @:0` | 175.1 |

Il profilo non isola perfettamente il singolo long task: comprende anche l'intervallo fra richiesta e apertura. `renderer.setSize` compare in `src/12-three-match-view.jsx:10335` al resize e in `:369` al montaggio, ma **non è dimostrato** qui che sia la causa dominante del blocco; nei campioni CPU compaiono anche attraversamento dei mesh, matrici e caricamento texture. L'ipotesi va verificata dal team con un profilo ristretto. Questa è una GPU Intel UHD 620 su Windows; l'impatto su un telefono resta **non verificato**.

## Video per giudizio a occhio

Playwright `recordVideo` ha registrato cinque scene peggiori (salti/cadenza/distanza) e due confronti migliori. Gli offset sono il tempo **prima** di `__CPM_RESOLVE`, quindi cercare l'evento alcuni fotogrammi dopo `offset + t`; i tempi `t` qui sotto sono quelli misurati dal testimone **dall'avvio di hl_result**. Il video di gruppo per gi87 scende sotto 45 FPS: escluderlo dal giudizio e usare la ripresa isolata headed, valida a 59.88 FPS.

| gi | video | offset approssimativo s | FPS mediano durante ripresa | uso |
|---:|---|---:|---:|---|
| 87 | peggiori | 49.54 | 30.12 | **esclusa: usare ripresa isolata** |
| 50 | peggiori | 56.52 | 59.88 | valida per confronto visivo |
| 25 | peggiori | 63.3 | 59.88 | valida per confronto visivo |
| 92 | peggiori | 70.02 | 59.88 | valida per confronto visivo |
| 176 | peggiori | 76.72 | 59.88 | valida per confronto visivo |
| 0 | confronto | 26.73 | 59.88 | valida per confronto visivo |
| 42 | confronto | 33.77 | 59.88 | valida per confronto visivo |
| 87 | prova-headed-87 | 38.5 | 59.88 | valida, ripresa isolata |

- [Cinque scene peggiori](video-fluidita-3d/peggiori.webm): gi50 guardare 0,043 s dall'avvio scena; gi25 1,302 s; gi92 1,814 s; gi176 0,959 s. Gi87 in questo video non è valido a causa del framerate della registrazione.
- [Gi87 isolata](video-fluidita-3d/prova-headed-87.webm): guardare 0,299 s dall'avvio della scena, dopo l'offset approssimativo 38.5 s.
- [Due scene di confronto](video-fluidita-3d/confronto.webm): gi0 e gi42; la conduzione inizia poco dopo l'offset di ciascuna scena. [Manifesto video](video-fluidita-3d/manifest.json) e [manifesto gi87](video-fluidita-3d/manifest-prova-headed-87.json) riportano offset e FPS.

## Priorità per frequenza × gravità

1. **Alta, blocco di apertura:** prima scena long task 755 ms e seconda 150 ms con GPU D3D11 e profiler spento. Impatto diretto sulla fluidità percepita; causa sorgente **non verificata**. Esaminare il profilo allegato e `src/12-three-match-view.jsx:10335` solo come ipotesi.
2. **Alta, pattinamento durante la conduzione:** 450/968 campioni di piede appoggiato >3 u/s; tutte le fasce aggregate hanno almeno 20 campioni. Ipotesi: cadenza della clip `run` e velocità del mesh in `src/12-three-match-view.jsx:9809-9811`. La visibilità a schermo è da confermare col PO.
3. **Alta/media, salti di allineamento:** due salti >30 u mentre l'eroe porta, gi50/frame 2 e gi87/frame 15. Gi50 è probabilmente un artefatto della forzatura; gi87 resta da riprodurre in partita naturale. Righe sospette, come ipotesi: `src/12-three-match-view.jsx:3355,6674-6679,6761-6763`.
4. **Media, cadute di cadenza:** 95 frame >50 ms in 14/15 scene valide nonostante FPS mediano alto. Causa non verificata; la sonda stessa può incidere sul carico.
5. **Bassa/media, distanza dal piede:** 7/968 frame >1,5 u, tutti isolati vicino alla fine della conduzione. La geometria del centro palla e delle ossa del piede richiede verifica visiva; scrittura sospetta, **ipotesi**, `src/12-three-match-view.jsx:6761-6763`.
6. **Non confermato, cambi gesto:** nessun segmento completo <0,15 s nella conduzione; `g` non descrive la clip ciclica di corsa. Il difetto soggettivo dei passaggi di animazione resta non verificato con questo testimone.

File di prova: [JSON leggibile](2026-09-28-fluidita-3d.json), [log integrale compresso](2026-09-28-fluidita-3d-scan.json.gz), [misura aperture senza profiler](2026-09-28-apertura-gpu-no-profiler.json), [profilo CPU](2026-09-28-apertura-gpu.cpuprofile). Il JSON include le 191 sintesi, le tracce per fotogramma delle scene selezionate e obbligatorie, il rerun di gi38 e gli offset video. Non ho modificato il gioco, né eseguito merge, deploy o pubblicazione.
