# Giro 184 — licenze (PO-374) e clip Rohr 180d (13/11/2026)

Ramo `sviluppo/giro184-licenze`, partito da `lavoro/192` (`498bf93`). **Nessun cambio a `src/`** (`check-src`: IDENTICO BYTE PER
BYTE, 7.316.484 byte), `GAME_VERSION` non toccata. Nessun force push.

## In una riga

**A)** Gli originali CGTrader (`originals/` + `TEXTURES.zip`, 12 file, ~115 MB) sono tolti dall'albero: nessuno li usava (grep e
rete del browser), `build-dist` li esclude sempre, nuovo guardiano `licenze-184` verde con prova del rosso 4/4.
**B)** `assets/cgtrader-clip-rohr.glb` rifatto: **28 clip** (erano 24). Rientrano defending-01, goalkeeper-save-03, dribble-03 e
juggling-03; swaying-arms sul tratto più mosso. **`clip-180` è ROSSO su un solo controllo: il peso (3,30 MB contro il tetto di 3,0)**;
il tetto non l'ho alzato (§B.6, dubbio per la madre).

---

## A. PO-374 — originali CGTrader fuori dal repo

### A.1 Verifica prima di togliere (misura)

- **Grep** su `src/`, `CARRIER-MANAGER-AV.html`, `sw.js`, `tools/`, `tests/`, `.github/` dei nomi dei 12 file (`CHARACTER.fbx/.obj/.mtl`,
  `Earring.fbx`, `HANDS/HEAD/LEGS/SHORTS/TEE.fbx|.glb`, `NORMAL+RIG.fbx`, `UNREAL+RIG.fbx`, `TEXTURES.zip`) e di `originals`: nessun
  codice li apre. Gli unici riscontri sono documenti storici (`tests/character-lab/POC_STORICO.md`, `CGTRADER_ASSET_GATE.md`,
  `MODEL_ACCEPTANCE_GATE.md`) e un commento di `tools/build-dist.mjs`.
- Gli script Python di `tools/` che leggono `assets/source/` aprono **solo** `CHARACTER.glb` e `BLENDER+RIG.blend` (cartella madre,
  fuori dalla decisione): `render_cgtrader_hero_profile_card.py`, `render_makehuman_bodyparts05/06_face_fit.py`.
- **`dist/` e `dist-web/`**: `build-dist` escludeva già tutta `assets/source/` dal giro 116 (PO-322); ricostruite, 1.223 file ciascuna,
  zero originali.
- **Rete del browser** (guardiano `licenze-184`, misura 4, eseguita PRIMA della rimozione): GLB acceso, contesto nuovo, service
  worker bloccato. home 35 richieste distinte (29 .glb), plancia di carriera 37 (29), partita vera 46 (30): **nessuna** ad
  `assets/source/` né a un'estensione vietata.

Esito: nessuno li usa → tolti.

### A.2 Cosa ho fatto

- `git rm -r` di `assets/source/cgtrader-soccer-player/originals/` (11 file) e di `assets/source/cgtrader-soccer-player/TEXTURES.zip`.
  Il mandato diceva «la cartella originals/» ma la decisione PO (BACKLOG PO-374) elenca anche `TEXTURES.zip`, che sta **nella
  cartella madre**, non in `originals/`: l'ho tolto perché nominato nella decisione e perché il guardiano chiesto vieta gli zip in
  `assets/`. Restano nella storia git (nessun force push, decisione PO).
- `tools/build-dist.mjs`: nuovo filtro **sempre attivo**, anche con `CPM_DIST_CON_SORGENTI=1` (che prima rimetteva tutta
  `assets/source/` nel pacchetto): cartelle `originals/`, estensioni `fbx|obj|mtl|bvh|uasset|zip|7z|rar`, nomi `*_ue5.*`/`*_iclone.*`.
  Provato con `CPM_DIST_CON_SORGENTI=1`: build verde, nessun originale.
- `.gitignore`: rete di sicurezza `assets/**/originals/`, `assets/**/*.fbx|obj|mtl|bvh|zip`.
- `docs/governo/CREDITI-fonti.md` e `tests/character-lab/CLIP_REGISTRY.md`: nota «originali tolti il 13/11 su decisione PO,
  conservati dal PO nel suo acquisto CGTrader». `docs/governo/BACKLOG.md`: PO-374 «FATTO sul ramo, da unire».
  `docs/governo/governo.html` (generato) **non** rigenerato.

### A.3 Guardiano `npm run licenze-184` (nuovo, nella catena `completa`)

Quattro misure giudicate: (1) `git ls-files assets`; (2) disco `assets/`, `dist/`, `dist-web/` con le due build **rifatte dal
guardiano** (assenti = «non giudicato» = rosso); (3) sorgenti del gioco senza riferimenti ad `assets/source/` né a file con
estensione vietata fra virgolette; (4) rete del browser su home, carriera, partita, con copertura minima 3 .glb.

| Braccio | Esito |
|---|---|
| prima della rimozione | ROSSO: git 12 originali, assets/ 12 originali; dist/ dist-web/ rete puliti |
| verde (dopo) | ✅ git 1.272 file · assets 1.272 · dist 1.223 · dist-web 1.223 · sorgenti 25 · rete 35/37/46 richieste, 0 originali (eseguito 2 volte) |
| prova del rosso `CPM_PROVA_ROSSO=1` | ✅ il guardiano vede 4/4: `.fbx` di prova in assets/ (git + disco), `.zip` in dist-web/, richiesta a `assets/source/…/HEAD.fbx` nella partita |

Nota: alla prima prova del rosso il file `.fbx` di prova non entrava in git perché la nuova riga di `.gitignore` lo rifiutava (la
rete funziona); il guardiano ora lo aggiunge con `git add -N -f` e lo toglie nel `finally`.

### A.4 Dubbi per la madre (non decisi)

1. **`assets/source/cgtrader-soccer-player/BLENDER+RIG.blend`** è un originale CGTrader (puntatore Git LFS, oggetto da 124.194.792
   byte). Non è nella decisione PO né nella lista del guardiano (FBX, OBJ, zip): **lasciato**. Che l'oggetto LFS sia scaricabile dal
   repository pubblico: Non posso confermarlo (non l'ho provato).
2. **`assets/source/cgtrader-soccer-player/CHARACTER.glb`** (14 MB, usato da `tools/render_cgtrader_hero_profile_card.py`): se sia il
   GLB originale del pacchetto o una conversione nostra: Non posso confermarlo. Lasciato (fuori dalla decisione, ed è un GLB).
3. Su GitHub Pages i file tolti spariscono solo quando `main` riceverà questo commit.

---

## B. Giro 180d — clip Rohr rifatte (decisioni madre 12/11 16:00)

### B.0 Strumenti

- Zip dalla cartella Drive del PO (`curl`, senza login): **sha256 identici** a `CREDITI-fonti.md` (pack 05 `1a26159823911a0b…`,
  pack 04 `56fcdcc77ceb7d45…`). Estratti **solo** i 33 FBX UE5 delle clip (21 + 12) in due cartelle nuove di `/tmp/rohr`; nessuno
  script del pacchetto aperto o eseguito. sha256 dei FBX di defending-01 e dribble-03 uguali ai primi 16 caratteri del 180c.
- `bpy` 5.3.0 da PyPI (ruota scaricata in 16 pezzi, sha256 `5850cd39369e4cd8…` uguale a quello pubblicato da PyPI) in un venv
  `/tmp/rohr-venv`.
- **Alla fine cancellati** `/tmp/rohr` (zip, FBX, prove, provini), `/tmp/rohr-venv` e `/tmp/rohr-whl`. Nel commit nessun FBX/zip.

### B.1 Mani: versione col massimo più basso, per clip (decisione §6.1)

Script: nuova opzione per clip `ik=0|1` (vince sull'ambiente). Metodo: **due passate intere** sulle 33 clip, `CPM_IK=0` e `CPM_IK=1`,
stesso cancello e stesse soglie (mediana ≤ 10°, massimo ≤ 30°); per ogni clip si tiene la versione col massimo **dopo** (cioè
compresa la rimisura dei fotogrammi della rampa per gli anelli) più basso. Correzione tenuta su 5 clip: goal-celebration-02
(5,13 contro 6,17), juggling-02 (18,65 contro 19,14), clapping-hands-up (7,32 contro 8,59), hands-up-looking-up (4,87 contro
5,46), standing-selfie (5,72 contro 6,05). Spenta sulle altre. Le scelte sono scritte in `tools/rohr-180/clip-184.txt`
(`tools/rohr-180/rifai-184.sh` rifà il file).

**Rientrano: defending-01 28,58° · goalkeeper-save-03 28,34° · dribble-03 28,94°.** Restano fuori (anche senza correzione):
penalty-kick-01 30,30° · penalty-kick-02 39,81° · defending-02 35,08° · dribble-01 31,64° · dribble-02 35,90°.

Prova di riproducibilità: le 5 clip con `ik=1` escono **identiche** a quelle del 180c (scarto 0,000 su ogni canale campionato a 30 fps).

### B.2 swaying-arms, tratto più mosso (§6.2)

Nuova opzione `mosso=<k>`: fra le finestre d'anello la cui giunzione costa al più k volte la migliore, quella con più moto delle
mani rispetto al bacino (cammino medio per fotogramma). Misurato:

| k | finestra (s) | moto mani (cm/fot) | rampa / fuori (cm) | cancello max |
|---|---|---|---|---|
| — (180c) | — | 2,80 | 1,42 / 2,26 | 18,61 |
| 1,5 | 6,73-10,67 | 3,19 | 1,87 / 3,13 | 20,60 |
| 2 | 7,63-11,47 | 3,32 | 2,16 / 3,13 | 20,39 |
| 5 | 7,87-11,43 | 3,48 | 2,11 / 3,13 | 20,39 |
| 10 = 30 = 1000 | 7,93-11,33 | **3,51** | 2,17 / 3,13 | 20,39 |

Scelto il tratto **più mosso di tutta la clip** (`mosso=10`, uguale al massimo assoluto), durata 3,4 s, giunzione senza scatto
(passo in rampa sotto il passo fuori). **Onestamente:** il guadagno è +25% e la sorgente è calma ovunque (nessuna finestra di 3-4 s
supera 3,51 cm/fot). Nei nuovi provini a 4 fotogrammi la clip **sembra ancora quasi ferma**: che a velocità reale si legga «più
mossa» Non posso confermarlo. Se serve un dondolio più ampio, non c'è in questa sorgente.

### B.3 Clip con oggetti o sedute (§6.3)

Restano tutte nel file: rimessa, cartellini, palleggi, selfie, video col telefono, sitting-clapping, sitting-phone-video.

### B.4 juggling-03 (§6.4)

Con `ciclo=3-5`: finestra **4,7 s** (11,5-16,2 s della sorgente), salto prima della chiusura 11,45 cm, **passo massimo in rampa
9,59 cm contro 11,39 fuori** → la chiusura non si vede come uno scatto (criterio del 180c §3). Cancello 6,45° / 24,74° (senza
correzione; con: 25,21°). **Entra.** Interpretazione mia di «giunzione senza salto»: rampa ≤ passo fuori + anello chiuso nel
guardiano (0,04°, 0,00 mm). Il salto sorgente di 11,45 cm è riassorbito dalla rampa, non è zero.

### B.5 Misure finali (28 clip)

Cancello: mediana / massimo in gradi. Scivolamento piede in appoggio: mediana · 90° percentile (m/s). Anelli: salto prima della chiusura
e passo massimo in rampa / fuori (cm). Foto: `docs/sviluppo/giro180/<clip>-pc.jpg` e `-telefono.jpg`.

| Clip | Durata | Cancello | Mani | Scivolamento | Anello | Stato |
|---|---|---|---|---|---|---|
| rohr-side-foot-kick | 4,5 | 3,77 / 18,27 | no | 0,025 · 0,827 | — | cambiata |
| rohr-power-kick | 2,6 | 5,06 / 16,78 | no | 0,043 · 0,503 | — | cambiata |
| rohr-goal-celebration-01 | 3,467 | 4,05 / 21,23 | no | 0,014 · 0,137 | — | cambiata |
| rohr-goal-celebration-02 | 3,5 | 1,33 / 5,13 | sì | 0,006 · 0,116 | — | uguale |
| rohr-goal-celebration-03 | 3,167 | 4,19 / 22,47 | no | 0,09 · 0,544 | — | cambiata |
| **rohr-defending-01** | 6,233 | 7,45 / 28,58 | no | 0,08 · 1,202 | — | **nuova** |
| rohr-goalkeeper-save-01 | 7,167 | 7,38 / 27,28 | no | 0,012 · 0,416 | — | cambiata |
| rohr-goalkeeper-save-02 | 4,367 | 6,35 / 18,83 | no | 0,024 · 0,291 | — | cambiata |
| **rohr-goalkeeper-save-03** | 8,9 | 7,63 / 28,34 | no | 0,013 · 0,302 | — | **nuova** |
| **rohr-dribble-03** | 3,367 | 6,12 / 28,94 | no | 0,115 · 1,007 | — | **nuova** |
| rohr-throw-in | 7,933 | 3,02 / 27,81 | no | 0,014 · 0,099 | — | cambiata |
| rohr-yellow-card | 2,867 | 2,47 / 21,05 | no | 0,003 · 0,008 | — | cambiata |
| rohr-yellow-red-card | 5,7 | 2,97 / 18,82 | no | 0,005 · 0,031 | — | cambiata |
| rohr-juggling-01 | 3,133 | 6,37 / 19,07 | no | 0,01 · 0,092 | 6,06 · 2,32/5,16 | cambiata |
| rohr-juggling-02 | 3,733 | 5,63 / 18,65 | sì | 0,029 · 0,467 | 12,91 · 6,28/12,93 | uguale |
| **rohr-juggling-03** | 4,7 | 6,45 / 24,74 | no | 0,012 · 0,188 | 11,45 · 9,59/11,39 | **nuova** |
| rohr-clapping-hands-up | 3,9 | 3,35 / 7,32 | sì | 0,004 · 0,014 | 0,61 · 0,29/0,46 | uguale |
| rohr-fist-up-cheering | 3,7 | 3,72 / 16,80 | no | 0,005 · 0,011 | 0,9 · 2,4/2,27 | cambiata |
| rohr-pointing-up-cheering | 4,0 | 3,48 / 18,59 | no | 0,003 · 0,012 | 3,26 · 2,53/2,51 | cambiata |
| rohr-sitting-clapping | 3,167 | 6,49 / 15,91 | no | nessun appoggio | 0,56 · 0,89/0,94 | cambiata |
| rohr-standing-clapping | 3,5 | 3,68 / 14,14 | no | 0,003 · 0,009 | 0,36 · 0,63/0,66 | cambiata |
| rohr-clapping-and-agree | 3,033 | 3,34 / 12,32 | no | 0,002 · 0,004 | 1,18 · 0,65/0,7 | cambiata |
| rohr-clap-twice-hand-up | 3,367 | 3,74 / 11,85 | no | 0,025 · 0,063 | 1,85 · 4,85/5,84 | cambiata |
| rohr-swaying-arms | 3,4 | 3,54 / 20,39 | no | 0,027 · 0,045 | 1,96 · 2,17/3,13 | cambiata (tratto nuovo) |
| rohr-hands-up-swaying | 4,0 | 3,50 / 6,00 | no | 0,013 · 0,031 | 4,5 · 4,3/3,6 | cambiata |
| rohr-hands-up-looking-up | 3,767 | 1,55 / 4,87 | sì | 0,005 · 0,015 | 3,44 · 0,71/0,49 | uguale |
| rohr-standing-selfie | 4,0 | 3,87 / 5,72 | sì | 0,002 · 0,009 | 3,92 · 0,67/0,44 | uguale |
| rohr-sitting-phone-video | 3,367 | 6,70 / 27,09 | no | nessun appoggio | 2,32 · 0,64/0,33 | cambiata |

«cambiata» = scarto > 0,5° (o 0,5 cm) su qualche canale rispetto al file del 180c, misurato campionando a 30 fps: con la correzione
spenta cambiano le braccia. Sotto il suolo (sonda three r128 sui vertici, `misure-mesh.json`): massimo 1,5 cm (hands-up-swaying,
lo scalino di taratura già noto), le 4 nuove 0,6-1,0 cm. Come nel 180c, nelle pose accosciate (difesa, portiere) si vede la pelle
della coscia attraverso i pantaloncini nei provini: è il nostro modello, non la clip. Il bacino di dribble-03 si sposta di 2,56 m e
di defending-01 di 1,03 m: da tenere presente quando le clip verranno collegate (ritaglio della sfera, 180c §3).

Foto: rigenerate tutte; **copiate nel repo solo le 23 cambiate o nuove** (46 file), le 5 «uguali» restano quelle del 180c.
Viste a occhio le 4 nuove e swaying-arms: il gesto atteso si legge (palleggio, difesa bassa, portiere che scatta di lato, conduzione).

### B.6 Guardiano `clip-180` e peso — DUBBIO

Aggiornato: 28 clip attese (durate dal file), juggling-03 fra gli anelli, swaying-arms 3,4 s. Esito: **tutto verde (scheletro 75
ossa, 28 clip a 30 fps, 15 anelli chiusi a 0,03-0,14°, GLTFLoader r128 28 clip / 1.439 tracce) tranne il peso: 3.298.744 byte
contro `PESO_MAX` 3,0 MB → ROSSO.** Prova del rosso (`cgtrader-clip-po.glb`) ancora rossa, 8 controlli.
Il tetto di 3,0 MB l'aveva messo il 180c sul suo peso dichiarato (2,76 MB); le 4 clip rientrate per decisione madre pesano +0,53 MB.
**Non ho alzato il tetto** (regola: mai allentare una soglia). Il file è fuori da `dist/` (validate-dist ✅ «clip Rohr non collegate
fuori dal pacchetto»). Strade possibili, nessuna presa: alzare il tetto a un valore deciso dalla madre; accorciare le clip lunghe
(goalkeeper-save-03 8,9 s, defending-01 6,2 s); togliere clip.

---

## Controlli (uno alla volta, `free -m` e `df -h` prima di ciascuno)

| Controllo | Esito |
|---|---|
| `build-src` + `check-src` | ✅ IDENTICO BYTE PER BYTE (nessun frammento cambiato) |
| `test:logic` | ✅ 51/51 |
| `save-compat` | ✅ 12/12 |
| `crediti-254` | ✅ (20 righe di CREDITI-fonti.md tutte nella finestra Crediti) |
| `build-dist` / `build-dist --web` | ✅ (anche con `CPM_DIST_CON_SORGENTI=1`) |
| `validate-dist` | ✅ offline, 0 errori, Rohr fuori |
| `licenze-184` verde / rosso | ✅ / ✅ (4/4) |
| `clip-180` | ❌ solo peso (§B.6) |
| `node --check ci-runner.mjs` | ✅ (`licenze-184` presente una sola volta) |

Gate 14/14 e catene complete **non** eseguiti: nessun byte del gioco cambiato (limite settimanale: solo i controlli dell'area).
Roadmap non aggiornata: nessuna versione parte.
