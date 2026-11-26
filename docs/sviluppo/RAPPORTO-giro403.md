# Rapporto giro 403 — peso dei GLB (PO-579)

Ramo: `sviluppo/giro403-peso-glb` (base `lavoro/201`, ccbed19). Non tocca `GAME_VERSION` né `docs/governo`.

## In una riga

Le texture dentro i GLB passano da PNG a **WebP qualità 90** (`EXT_texture_webp`, che il GLTFLoader r128 legge **senza
nessun decoder in più**): GLB del pacchetto **94,33 → 52,20 MiB (−45%)**, GLB scaricati da una partita al telefono
**22,40 → 15,25 MiB (−32%)**, al PC **38,8 → circa 18 MiB**. Differenza visiva misurata: PSNR ≥ 44 dB sui modelli, in
partita pari al rumore del banco. Nessuna riga di codice di gioco toccata.

## 1. Cosa supporta davvero GLTFLoader r128

Letto da `tests/visual/node_modules/three/examples/js/loaders/GLTFLoader.js` (three 0.128.0, lo stesso che il gioco
carica da CDN e che `build-dist` inlina):

| Metodo | Estensione glTF | r128 | Cosa serve in più |
|---|---|---|---|
| Texture WebP | `EXT_texture_webp` | **sì, nativo** | niente (il browser decodifica; Chromium/WebView Android sì) |
| Quantizzazione | `KHR_mesh_quantization` | sì, nativo | niente al caricamento, **ma** `BufferAttribute.getX` in r128 NON denormalizza (`return this.array[index*itemSize]`, src/core/BufferAttribute.js:283): chi legge vertici (8 punti in src/11-12-16 leggono `attributes.position`) leggerebbe interi |
| meshopt | `EXT_meshopt_compression` | sì, con `setMeshoptDecoder` | `examples/js/libs/meshopt_decoder.js` (WASM in base64) da aggiungere a pagina e build |
| Draco | `KHR_draco_mesh_compression` | sì, con `setDRACOLoader` | `examples/js/loaders/DRACOLoader.js` + `libs/draco/` (wasm), decodifica in worker |
| KTX2 / Basis | `KHR_texture_basisu` | escluso dal PO | — |

## 2. Tabella file → peso per metodo (MiB)

Misurata con gltf-transform 4 (`dedup/prune/resample` = «pulizia», `textureCompress` webp con sharp, `quantize`,
`meshopt` livello medium, `draco`) sui **53 GLB che entrano nel pacchetto** (stesse regole di `tools/build-dist.mjs`).
Script della misura: scratchpad della sessione (non nel repo: dipende da gltf-transform/sharp, che il repo non installa).

| File (pacchetto) | Attuale MiB | pulizia | WebP q90 | WebP lossless | quantizz. | meshopt | Draco |
|---|---:|---:|---:|---:|---:|---:|---:|
| cgtrader-review-lod0-kit-adapter.glb | 16.38 | 16.08 | 4.57 | 9.70 | 15.70 | 15.09 | 15.15 |
| cgtrader-review-lod0-ajax-kit-review.glb | 14.80 | 14.49 | 4.49 | 8.94 | 14.13 | 13.50 | 13.57 |
| cgtrader-review-lod1-kit-adapter.glb | 6.95 | 6.67 | 3.55 | 4.99 | 6.57 | 6.16 | 6.34 |
| hyper-casual-korward-football-authored-black.glb | 6.26 | 4.49 | 4.65 | 5.44 | 6.17 | 4.50 | 6.01 |
| hyper-casual-korward-football-authored-brown.glb | 6.26 | 4.49 | 4.65 | 5.47 | 6.17 | 4.50 | 6.01 |
| hyper-casual-korward-football-authored-red.glb | 6.26 | 4.49 | 4.65 | 5.49 | 6.17 | 4.50 | 6.01 |
| hyper-casual-korward-football-authored.glb | 6.26 | 4.49 | 4.65 | 5.64 | 6.17 | 4.50 | 6.01 |
| cgtrader-review-lod2-kit-adapter.glb | 4.13 | 3.86 | 3.04 | 3.44 | 3.87 | 3.55 | 3.76 |
| actor-journalist.glb | 4.13 | 3.23 | 0.89 | 2.50 | 2.98 | 2.84 | 2.79 |
| actor-presenter-f.glb | 3.98 | 3.11 | 0.83 | 2.43 | 2.87 | 2.73 | 2.68 |
| actor-presenter.glb | 3.31 | 2.57 | 0.65 | 1.98 | 2.40 | 2.30 | 2.27 |
| cgtrader-clip-mixamo.glb | 2.90 | 1.77 | 2.83 | 2.83 | 2.83 | 2.00 | 2.83 |
| korward-regular-player-slim.glb | 2.09 | 1.89 | 2.09 | 2.09 | 1.37 | 0.67 | 0.24 |
| korward-regular-player.glb | 2.09 | 1.89 | 2.09 | 2.09 | 1.37 | 0.67 | 0.24 |
| korward-regular-player-stocky.glb | 2.09 | 1.89 | 2.09 | 2.09 | 1.37 | 0.67 | 0.24 |
| cgtrader-clip-rohr.glb | 1.79 | 2.10 | 1.74 | 1.74 | 1.74 | 1.14 | 1.74 |
| altri 37 file (clip, < 1 MB) | 4.61 | 4.14 | 4.30 | 4.30 | 4.13 | 3.72 | 4.30 |
| **TOTALE 53 GLB del pacchetto** | **94.33** | **81.66** | **51.74** | **71.16** | **86.00** | **73.04** | **80.18** |

Compatibilità r128 per colonna: pulizia **sì** · WebP **sì** · quantizzazione **sì ma rischio sul codice che legge i
vertici** · meshopt **sì con decoder da aggiungere** · Draco **sì con decoder + wasm da aggiungere**.

Note: la pulizia **ingrandisce** `cgtrader-clip-rohr.glb` (1,79 → 2,10) e cambia i fotogrammi chiave delle clip
(resample con tolleranza): tocca i tempi dei gesti, quindi è un lavoro da motore, non da peso. Draco su
`korward-regular-player*.glb` (2,09 → 0,24 MiB, il corpo che OGNI partita scarica) è il secondo risparmio più grosso.

### Cosa scarica davvero il gioco (sonda `misura-403.mjs rete`, partita vera fino alla prima scena, GLB acceso)

| | prima | dopo |
|---|---:|---:|
| Telefono 412×915 (lod1+lod2 + corpo regular + clip + presentatore, 28 file) | 22,40 MiB | 15,25 MiB |
| PC 1280×720 (anche lod0, 29 file) | 38,78 MiB | ~19,5 MiB (stima: lod0 16,38 → 4,57) |

## 3. Differenza visiva misurata

**A. Modello per modello** (`confronta-403.mjs`: three r128 + GLTFLoader r128, posa di riposo, camera fissa, tre viste:
fronte, tre quarti, viso; ogni versione disegnata due volte → «rumore» deve essere ~0). Originali estratti da git (fbcd482).

| File | vista | rumore (A/A) max | scarto medio /255 | pixel > 8 | scarto max | PSNR dB | errori |
|---|---|---:|---:|---:|---:|---:|---:|
| actor-journalist | fronte | 1 | 0.085 | 0.031% | 29 | 56 | 0 |
| actor-journalist | tq | 0 | 0.083 | 0.049% | 36 | 55.7 | 0 |
| actor-journalist | viso | 0 | 0.965 | 0.183% | 40 | 44.8 | 0 |
| actor-presenter-f | fronte | 0 | 0.074 | 0% | 14 | 58.4 | 0 |
| actor-presenter-f | tq | 0 | 0.074 | 0% | 10 | 58.4 | 0 |
| actor-presenter-f | viso | 0 | 0.685 | 0.02% | 16 | 46.7 | 0 |
| actor-presenter | fronte | 0 | 0.091 | 0.001% | 13 | 57 | 0 |
| actor-presenter | tq | 0 | 0.088 | 0.002% | 12 | 57 | 0 |
| actor-presenter | viso | 1 | 0.956 | 0.09% | 16 | 44.4 | 0 |
| cgtrader-review-lod0-ajax-kit-review | fronte | 0 | 0.099 | 0.225% | 98 | 45.5 | 0 |
| cgtrader-review-lod0-ajax-kit-review | tq | 0 | 0.094 | 0.214% | 105 | 46.5 | 0 |
| cgtrader-review-lod0-ajax-kit-review | viso | 0 | 0 | 0% | 0 | ∞ (identico) | 0 |
| cgtrader-review-lod0-kit-adapter | fronte | 0 | 0.115 | 0.277% | 98 | 44.7 | 0 |
| cgtrader-review-lod0-kit-adapter | tq | 0 | 0.112 | 0.286% | 105 | 45.4 | 0 |
| cgtrader-review-lod0-kit-adapter | viso | 0 | 0 | 0% | 0 | ∞ (identico) | 0 |
| cgtrader-review-lod1-kit-adapter | fronte | 0 | 0.116 | 0.245% | 136 | 45.6 | 0 |
| cgtrader-review-lod1-kit-adapter | tq | 0 | 0.116 | 0.251% | 100 | 46 | 0 |
| cgtrader-review-lod1-kit-adapter | viso | 0 | 0 | 0% | 0 | ∞ (identico) | 0 |
| cgtrader-review-lod2-kit-adapter | fronte | 3 | 0.14 | 0.28% | 142 | 45.8 | 0 |
| cgtrader-review-lod2-kit-adapter | tq | 0 | 0.136 | 0.278% | 196 | 46.1 | 0 |
| cgtrader-review-lod2-kit-adapter | viso | 0 | 0 | 0% | 0 | ∞ (identico) | 0 |
| hyper-casual-korward-football-authored-black | fronte | 0 | 0.045 | 0% | 6 | 61 | 0 |
| hyper-casual-korward-football-authored-black | tq | 0 | 0.048 | 0.001% | 184 | 55.3 | 0 |
| hyper-casual-korward-football-authored-black | viso | 0 | 0.54 | 0% | 122 | 49.7 | 0 |
| hyper-casual-korward-football-authored-brown | fronte | 0 | 0.037 | 0% | 5 | 61.8 | 0 |
| hyper-casual-korward-football-authored-brown | tq | 0 | 0.038 | 0.001% | 148 | 56.6 | 0 |
| hyper-casual-korward-football-authored-brown | viso | 0 | 0.539 | 0% | 122 | 49.7 | 0 |
| hyper-casual-korward-football-authored-red | fronte | 0 | 0.039 | 0% | 6 | 61.6 | 0 |
| hyper-casual-korward-football-authored-red | tq | 0 | 0.041 | 0.001% | 128 | 57 | 0 |
| hyper-casual-korward-football-authored-red | viso | 0 | 0.541 | 0% | 122 | 49.7 | 0 |
| hyper-casual-korward-football-authored | fronte | 0 | 0.038 | 0% | 5 | 61.7 | 0 |
| hyper-casual-korward-football-authored | tq | 0 | 0.038 | 0.001% | 128 | 59.4 | 0 |
| hyper-casual-korward-football-authored | viso | 0 | 0.54 | 0% | 124 | 49.7 | 0 |

⚠️ La vista «viso» dei corpi CGTrader esce **identica perché vuota** (la camera ravvicinata calcolata sulle ossa non
inquadra la testa): per quei quattro file la misura vale sulle viste fronte e tre quarti, che contengono la testa
intera. Non giudicata da vicino. Lo scarto massimo alto (98-196) è di pochi pixel sui bordi delle cuciture/numeri
(pixel > 8: 0,2-0,3%); lo scarto medio resta sotto 1/255 ovunque.

**B. In partita, stessa scena** (`misura-403.mjs foto`, GLB acceso, notte, scene forzate 3/41/77, fotogramma congelato):
la partita non è identica fra due aperture, quindi si confronta prima/dopo contro prima/prima.

| Scena | rumore prima/prima | prima/dopo |
|---|---|---|
| gi3 | PSNR 30,5 dB · 4,48% pixel > 8 | PSNR 29,5 dB · 4,57% |
| gi41 | PSNR 23,3 dB · 10,33% | PSNR 22,0 dB · 12,35% |
| gi77 | PSNR 33,0 dB · 0,93% | PSNR 32,3 dB · 1,04% |

Foto: `docs/sviluppo/giro403/partita-gi3-prima-dopo.jpg`, `partita-gi41-prima-dopo.jpg`,
`lod2-prima-dopo-diffx8.png` (prima · dopo · differenza amplificata ×8).

## 4. Cosa è stato applicato

- 11 file, **solo le texture** (WebP q90), stessi nomi, nessuna riga di codice: `actor-journalist`, `actor-presenter`,
  `actor-presenter-f`, `cgtrader-review-lod0-kit-adapter`, `cgtrader-review-lod0-ajax-kit-review`,
  `cgtrader-review-lod1-kit-adapter`, `cgtrader-review-lod2-kit-adapter`, `hyper-casual-korward-football-authored{,-black,-brown,-red}`.
- Gli originali **non** restano nel ramo (la build non li usa): stanno nella storia git (commit fbcd482 e precedenti).
- Non toccati: file senza texture (clip, corpo regular), file già fuori dal pacchetto (CH38, `hyper-casual` non
  «authored», `cgtrader-review-lod1/2.glb`, `cgtrader-unreal-…`).
- Licenze invariate: CGTrader Royalty Free standard, Rocketbox MIT, Mixamo (docs/governo/CREDITI-fonti.md). Ricodificare
  le texture è una modifica dello stesso tipo dei file `kit-adapter`/LOD che il repo già deriva dal pacchetto. Se la
  licenza CGTrader standard lo permetta testualmente: Non posso confermarlo dal repo (non c'è il testo della licenza);
  il repo già distribuisce file derivati da quel pacchetto.
- Nessun `window.__CPM_NO_G403`: il caricamento non è toccato (il GLTFLoader r128 legge WebP da sé).

## 5. Guardiano `npm run peso-403`

Tetti dichiarati nel commit fbcd482, **prima** della compressione, e misurati rossi sugli originali:

| | tetto | originali (fbcd482) | dopo (1ab2f7c) |
|---|---:|---:|---:|
| A. GLB del pacchetto | 60 MiB | 94,33 ❌ | 52,20 ✅ |
| B. GLB di una partita al telefono | 16 MiB | 22,40 ❌ | 15,25 ✅ |
| C. ogni GLB chiesto caricato, corpi pronti, 0 errori | — | 28/28 ✅ | 28/28 ✅ |

Braccio rosso (`CPM_PROVA_ROSSO=1`): A conta anche i file esclusi come non referenziati (109,79 MiB ❌) e il primo corpo
CGTrader chiesto arriva troncato (C: «1 GLB chiesto e mai caricato» ❌). Nella MAPPA nella riga che esiste già
`/src\/1[17]-/` (src/11 ospita `loadGLB`/GLTFLoader). Sonde neutre: `misura-403.mjs`, `confronta-403.mjs`.

**Giro** (`node ci-runner.mjs giro peso-403`, 26/11, sul commit 1ab2f7c): **18/18 verdi** — peso-403 + 17 sentinelle
(mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico, griglia-mobile, render-3d-023,
tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97). Le schermate
di `docs/collaudo-grafico` riscritte dalle sentinelle sono state riportate allo stato del ramo (non fanno parte del giro).
⚠️ Le sentinelle non comprendono i guardiani che giudicano i COLORI dei corpi (`pelle-240`, `maglie-numero`, `serata-*`):
la ricodifica cambia i pixel delle texture di meno di 1/255 in media, ma quei guardiani li gira il treno sulla riga
`src/1[17]`, non questo giro.

## 6. Dubbi per il PO

**D1. Quanto comprimere le texture?**
1. **WebP q90 sui GLB con texture (APPLICATA)** — −42 MiB nel pacchetto, −7 MiB per partita al telefono, nessuna riga
   di codice, differenza sotto la soglia visibile.
2. WebP lossless — differenza zero per costruzione, ma risparmia meno della metà (94,33 → 71,16).
3. WebP q80 — qualche MiB in più di risparmio, non misurato visivamente: andrebbe rifatto il confronto.

**D2. Il corpo «regular» (2,09 MiB, scaricato in ogni partita) e le clip?**
1. **Lasciarli così per ora (consigliata)** — il guadagno vero (Draco 0,24 / meshopt 0,67 MiB) chiede un decoder nella
   pagina e nella build e una verifica di tutto il codice che legge i vertici: è un giro da caricatore, con rosso
   `__CPM_NO_G403`.
2. meshopt sul solo corpo regular + clip (decoder 1 file JS, WASM incluso) — 2,09 → 0,67 e clip −10/30%.
3. Draco sul corpo regular — 2,09 → 0,24, ma wasm + worker e decodifica più lenta su telefoni poveri.

**D3. Le quattro varianti `hyper-casual-…-authored` (4 × 4,65 MiB) nel pacchetto?**
1. **Tenerle compresse come ora (consigliata)** — il gioco le nomina (ramo di riserva in src/12), toglierle è una
   decisione di prodotto.
2. Escluderle dalla build se il PO conferma che il ramo non si usa più (−18,6 MiB).
3. Unire le quattro in un file con quattro materiali (stessa animazione 3,9 MB ripetuta 4 volte) — lavoro di asset.

**D4.** Restano fuori da questo giro le **texture non GLB** del pacchetto (`portraits/` 17,4 MiB, `hair-colors/`
10,8 MiB, `audio/` 9,1 MiB): stesso metodo applicabile, misura da fare.
