# Rapporto giro 180 — clip Anderson Rohr (PO-367)

> **Aggiornamento 180c (12/11/2026):** 16 clip nuove (su 21 provate), correzione delle mani, clip accorciate ad anello: sezione **«180c»** in fondo.
>
> **Aggiornamento 180b (12/11/2026):** il PO ha scaricato lui i due pacchetti; le clip sono state importate. Vedi la sezione **«180b»** in fondo. Le sezioni 1-6 qui sotto sono il resoconto del primo tentativo (fermo all'email) e restano come storia.

## (180, primo tentativo) — FERMO: lo scaricamento chiede un'email

Ramo `sviluppo/giro180-animazioni-rohr`, partito da `lavoro/191` (`13fa539`). Data: **12/11/2026, ~11:20 ora di Roma**.
Decisione PO di riferimento (12/11): «Usa il pacchetto Anderson Rohr» (pack 05 Soccer + pack 04 Crowd Reactions per le esultanze sobrie).

## In una riga

**Non ho importato nessuna clip.** Il pacchetto si ottiene solo passando dal carrello Gumroad a prezzo 0, e il
carrello chiede un **indirizzo email** (protetto da reCAPTCHA di Google). Il vincolo duro del giro dice di
fermarsi: mi sono fermato prima di scrivere qualsiasi cosa nel modulo. Serve che **il PO scarichi lui** i due
pacchetti; poi il giro 180 si può rifare da capo con i file in mano.

## 1. Cosa chiede lo scaricamento (verificato il 12/11/2026)

| Passo | Pagina | Cosa chiede |
|---|---|---|
| 1 | <https://andersonrohr.gumroad.com/l/mocap_pack5> (pack 05) e <https://andersonrohr.gumroad.com/l/mocap_pack4> (pack 04) | Prezzo «$0+». Testo della pagina: «It's free (just enter 0 and add it to the cart).» Pulsante «I want this!» |
| 2 | Il pulsante porta a `https://gumroad.com/checkout?product=vqlel&quantity=1&price=0` (pack 05) e `…?product=muxdl…` (pack 04) | Modulo «Checkout»: totale **US$0**, un solo campo **«Email address»** e il pulsante **«Get»**; sotto: «This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.» |

Come l'ho verificato: pagina prodotto letta con `curl`; pagina del carrello aperta in Chromium headless in
sola lettura, elencando i campi del modulo (`input type=email` + `g-recaptcha-response`). **Non ho scritto
nulla nel campo email, non ho premuto «Get», non ho accettato termini.** Non ho provato se il modulo accetti
un'email vuota: per saperlo avrei dovuto premere «Get», cioè inviare un ordine (accettazione dei termini
Gumroad) e far partire il reCAPTCHA.

⚠️ Da dichiarare: **aprire** la pagina del carrello carica da sé lo script reCAPTCHA di Google (lo dice la
pagina stessa). Non ho inviato dati miei né del PO, ma il semplice caricamento della pagina ha contattato
Google come fa per ogni visitatore. Le foto del carrello stanno solo nello scratchpad della sessione, non nel
repo (la pagina non dichiara una licenza per le proprie immagini, stessa regola del giro 179).

Fonti alternative senza email (specchi, ricaricamenti di terzi): **non le ho cercate né usate** — sarebbero
proprio la ridistribuzione che la licenza vieta, e la decisione PO riguarda il pacchetto originale.

## 2. Licenza riletta alla fonte (12/11/2026)

Testo **identico** sulle due pagine, sezione «Licensing», copiato parola per parola:

> This pack can be used for free in both personal and commercial projects.
> Attribution is not required, but feel free to tag me (my socials: https://linktr.ee/andersonrohr). I'd love to see what you create with it.
> **You may not redistribute, resell, or repackage this pack as a standalone product.**

Descrizione (entrambe): «This pack is part of a series of free motion capture packs for the community. You can
use it in your games, cinematics, 3D/VFX , or any other creative work.»

- **Credito nel gioco:** la licenza dice «Attribution is not required» → **non richiesto** (confermato quanto
  scritto dal giro 179). Una riga di cortesia nei Crediti resta una scelta, non un obbligo.
- **Rischio repo pubblico:** invariato rispetto al 179 §3.2 (il GLB convertito sarebbe scaricabile da
  `raw.githubusercontent.com`); il PO lo ha accettato il 12/11. Da registrare in `CREDITI-fonti.md` **quando**
  le clip entreranno — oggi non c'è nulla da registrare.

Dati tecnici dalla pagina (non verificati sui file, che non ho):

| | pack 05 Soccer | pack 04 Crowd Reactions |
|---|---|---|
| Animazioni | 21 | 22 |
| Durata totale dichiarata | 5 min 55 s | 5 min 55 s (⚠️ identica al pack 05: possibile copia sulla pagina, Non posso confermarlo) |
| Formato · scheletri · fps | FBX · Rokoko Default, iClone, Manny (UE5) · 60 fps | uguale |
| Identificativo prodotto Gumroad | `vqlel` | `muxdl` |
| Clip che il giro 180 doveva prendere — presenti nell'elenco | 08_Side_Foot_Kick · 09_Power_Kick · 10/11_Penalty_Kick_01/02 · 12/13/14_Goal_Celebration_01..03 · 18/19_Defending_01/02 (**tutte presenti**) | 03_Clapping_Hands_Up · 05_Fist_Up_Cheering · 17_Pointing_Up_Cheering (**tutte presenti**) |

## 3. Tabella per il PO

| Clip | Cosa dovrebbe mostrare (dal nome) | Usabile? | Foto |
|---|---|---|---|
| 08_Side_Foot_Kick | tiro di piatto | **non valutata** — file non scaricato | — |
| 09_Power_Kick | tiro di collo | non valutata | — |
| 10_Penalty_Kick_01 · 11_Penalty_Kick_02 | rigore | non valutata | — |
| 12/13/14_Goal_Celebration_01..03 | esultanze | non valutata | — |
| 18_Defending_01 · 19_Defending_02 | difesa | non valutata | — |
| 05_Fist_Up_Cheering · 17_Pointing_Up_Cheering · 03_Clapping_Hands_Up (pack 04) | esultanze sobrie | non valutata | — |

## 4. Cosa NON è stato fatto (e perché)

Punti 1-5 del mandato: **nessuno eseguito**, tutti dipendono dai file.
- Nessun `assets/cgtrader-clip-rohr.glb`, nessuna foto in `docs/sviluppo/giro180/`, nessuna misura di piedi/compenetrazioni.
- Nessuna riga in `CLIP_REGISTRY.md` / `CREDITI-fonti.md` (registrare una clip che non c'è sarebbe falso).
- Nessun guardiano `clip-180` (senza file non ha nulla da guardare; scriverlo vuoto lo farebbe passare a vuoto).
- **Nessuna modifica a `src/` né ad `assets/`**, `GAME_VERSION` non toccata → `build-src`/`check-src`,
  `design-system`, `test:logic`, `save-compat`, `validate-dist` **non eseguiti**: il ramo aggiunge solo questo
  rapporto, nessun byte del gioco cambia. Roadmap non aggiornata: non c'è una versione che parte.

## 5. Per ripartire (quando il PO avrà i file)

1. Il PO scarica dal proprio browser i due pacchetti (pagine del §1, prezzo 0, la sua email o quella di squadra
   `korward.devteam@gmail.com` — scelta sua) e li mette a disposizione della sessione **fuori dal repo**
   (es. allegati alla sessione o una cartella condivisa), scegliendo lo scheletro **Manny (UE5)**, il più
   vicino al nostro.
2. Annotare data dello scaricamento e sha256 dei file sorgente (andranno nel registro, modello `assets/audio/LICENZE.json`).
3. Rifare il giro 180 dal punto 1 del mandato. Nota tecnica già nota dal 179 §2: in queste sessioni **`bpy`
   (Blender) non è installato**; il passaggio FBX → GLB va o fatto dove c'è Blender, o con un convertitore
   FBX installabile dai registri di pacchetti (da verificare in quel giro: Non posso confermarlo che esista
   uno strumento adatto senza Blender).

## 6. Domande per la sessione madre

1. Chi scarica i pacchetti e con quale email (PO o casella di squadra)? Decisione del PO, io non l'ho presa.
2. Dove consegnare i file sorgente alla sessione del giro 180-bis, visto che **non devono entrare nel repo**?
3. Va bene che il riadattamento (FBX → GLB) si faccia in una sessione con Blender, o si vuole tentare un
   convertitore senza Blender (da verificare)?


---

# 180b — Importazione delle clip (12/11/2026, ~12:45-13:40 ora di Roma)

Ramo `sviluppo/giro180-animazioni-rohr`. **Nessun cambio a `src/`**, `GAME_VERSION` non toccata, clip **non collegate** ai gesti.

## In una riga

**9 clip su 12 sono nel nuovo file `assets/cgtrader-clip-rohr.glb` (2,04 MB, 30 fps, scheletro CGTrader a 75 ossa, solo
animazioni).** Le altre 3 (i due rigori e «Defending 02») le ha **scartate il cancello anatomico** e non sono nel file. Dei 9:
6 usabili così come sono (3 da accorciare), 3 da sistemare prima di collegarle.

## Tabella per il PO

Foto: tre momenti chiesti (inizio · metà · fine) **più un quarto, «gesto»** = l'istante in cui piede o mano si muovono più
veloci (il colpo, il braccio alzato), perché la metà della clip può cadere fuori dal gesto. Ogni clip ha un foglio PC (4 riquadri
in fila) e uno telefono (gli stessi 4 riquadri in colonna, 400 px di larghezza ciascuno); sfondo grigio neutro, griglia a terra da
50 cm per vedere i piedi.

| Clip | Cosa mostra (visto sui provini) | Usabile? | Foto |
|---|---|---|---|
| `rohr-side-foot-kick` (08) | tiro di piatto da fermo, gamba che accompagna, poi ritorno in piedi | **sì** | [PC](giro180/rohr-side-foot-kick-pc.jpg) · [telefono](giro180/rohr-side-foot-kick-telefono.jpg) |
| `rohr-power-kick` (09) | tiro di collo con passo di rincorsa e braccio d'equilibrio largo; nel finale si gira e cammina via | **da sistemare**: tagliare la coda (dopo il tiro) | [PC](giro180/rohr-power-kick-pc.jpg) · [telefono](giro180/rohr-power-kick-telefono.jpg) |
| `rohr-goal-celebration-01` (12) | corsa breve, scivolata in ginocchio, braccia e indici al cielo | **da sistemare**: in ginocchio le gambe affondano 5-6 cm nel suolo | [PC](giro180/rohr-goal-celebration-01-pc.jpg) · [telefono](giro180/rohr-goal-celebration-01-telefono.jpg) |
| `rohr-goal-celebration-02` (13) | in piedi, braccia alzate e indici in alto, sguardo al cielo | **sì** | [PC](giro180/rohr-goal-celebration-02-pc.jpg) · [telefono](giro180/rohr-goal-celebration-02-telefono.jpg) |
| `rohr-goal-celebration-03` (14) | saltello con un braccio teso di lato e l'altra mano alzata vicino alla testa, poi si volta e si allontana | **sì** (la rotazione finale va tenuta presente) | [PC](giro180/rohr-goal-celebration-03-pc.jpg) · [telefono](giro180/rohr-goal-celebration-03-telefono.jpg) |
| `rohr-defending-01` (18) | postura difensiva bassa, piccoli passi laterali, braccia larghe | **sì** come postura; **non** è un blocco col corpo (riga 12 del 179) | [PC](giro180/rohr-defending-01-pc.jpg) · [telefono](giro180/rohr-defending-01-telefono.jpg) |
| `rohr-clapping-hands-up` (pack 04, 03) | applauso con le mani alte davanti al viso, sul posto | **sì, da accorciare** (14,1 s, 331 KB) | [PC](giro180/rohr-clapping-hands-up-pc.jpg) · [telefono](giro180/rohr-clapping-hands-up-telefono.jpg) |
| `rohr-fist-up-cheering` (pack 04, 05) | pugno alzato ripetuto, sul posto | **sì, da accorciare** (21,8 s, 593 KB: è il 29% del file) | [PC](giro180/rohr-fist-up-cheering-pc.jpg) · [telefono](giro180/rohr-fist-up-cheering-telefono.jpg) |
| `rohr-pointing-up-cheering` (pack 04, 17) | indice destro puntato in alto, sul posto | **sì, da accorciare** (12,9 s) | [PC](giro180/rohr-pointing-up-cheering-pc.jpg) · [telefono](giro180/rohr-pointing-up-cheering-telefono.jpg) |
| 10_Penalty_Kick_01 | rigore | **no, scartata dal cancello** (30,3° contro soglia 30°) | — |
| 11_Penalty_Kick_02 | rigore | **no, scartata dal cancello** (39,8°) | — |
| 19_Defending_02 | difesa | **no, scartata dal cancello** (35,1°) | — |

«Usabile» = il gesto si legge sul nostro corpo senza difetti visibili nei provini e nelle misure qui sotto. Il giudizio vero (a
velocità reale, in partita) si potrà dare solo collegando le clip, che questo giro non fa.

## 1. Lo scaricamento

Zip dalla cartella Drive del PO con `curl` (link pubblico, nessun login, nessun dato inviato): pack 05 **135.824.549 byte**
(identico a quanto dichiarato dalla sessione madre), sha256 `1a26159823911a0b…`; pack 04 **161.335.621 byte**, sha256
`56fcdcc77ceb7d45…` (hash completi in `CREDITI-fonti.md`). Tenuti in `/tmp/rohr` (fuori dal clone), estratti in due cartelle
nuove e vuote, **solo i 12 FBX dello scheletro UE5** che servono (estrazione selettiva per nome). Contenuto degli zip, dall'elenco:
FBX in tre varianti di scheletro (iClone, Rokoko_Default, UE5), un PDF «Importing_into_UE5.pdf» e (pack 04) una cartella
`RTG_RKK_to_MH/` con file `.uasset` di Unreal. **Nessuno script** del pacchetto è stato eseguito né aperto; i file sono stati
letti solo dall'importatore FBX di Blender. Nomi reali verificati: coincidono con quelli del mandato (suffisso `_ue5`).

## 2. Strada di conversione FBX → GLB: Blender 5.3 come modulo Python (`bpy` da PyPI)

- `pip download bpy` → `bpy-5.3.0-cp313-cp313-manylinux_2_28_x86_64.whl` (427 MB) da PyPI, che in questa sessione è
  raggiungibile; installato in un ambiente virtuale separato in `/tmp` (fuori dal repo). Funziona headless, senza GPU.
- **Perché questa:** è lo stesso strumento dei riadattamenti precedenti (`tools/retarget_cgtrader_clip.py` richiede `bpy`),
  quindi stesso importatore FBX, stesso esportatore glTF, stesse matrici; il rapporto 179 §2 diceva «bpy non installato» —
  **era vero per l'immagine della sessione, ma il pacchetto si installa da pip** (Python 3.13 della sessione = versione richiesta
  dalla ruota). FBX2glTF non l'ho provato: non serviva e avrebbe richiesto un secondo passaggio per il riadattamento, che si fa
  comunque in Blender.
- Script: `tools/rohr-180/riadatta_rohr.py` (nessun dato del pacchetto dentro; legge gli FBX da percorsi passati in argomento).
  Uso scritto in testa al file. Python lanciato sempre con `-I`.

## 3. Riadattamento UE5 (Manny, 79 ossa) → CGTrader UE4 (75 ossa)

Misurato sugli FBX: armatura `root` in centimetri (scala 0,01), 79 ossa con nomi UE5, **60 fps**, durate 3,2-21,8 s.

- **Mappa:** stessi nomi per bacino, clavicole, braccia, mani, gambe, piedi, `ball_*` e **tutte le dita** (40); la colonna a 5
  vertebre → 3 (`spine_01→spine_01`, `spine_03→spine_02`, `spine_05→spine_03`), il collo a 2 → 1 (`neck_01`, il segmento
  arriva alla testa passando per `neck_02`). Ossa di torsione non mappate (restano a riposo rispetto al genitore, come le clip Mixamo).
- **Metodo:** (a) bacino: variazione mondiale dal riposo della sorgente applicata al riposo del bersaglio; (b) ogni altro osso:
  variazione **rispetto al genitore**; (c) correzione di swing: l'asse dell'osso che a riposo punta al figlio si allinea al
  segmento della sorgente; (d) bacino traslato in scala con l'altezza dell'anca (0,975), **rincorsa e spostamenti conservati**
  (nessuna clip portata sul posto); (e) un fotogramma su due → **30 fps**.
- **Due difetti trovati sui provini e corretti prima di chiudere** (No Blind Fix: visto → misurato → corretto → rivisto):
  1. **il primo fotogramma di ogni FBX è una posa di riferimento** a braccia aperte: la mano salta di 13-118 cm al fotogramma
     dopo, contro ~1 cm fra i successivi. Ora si riconosce dal **rapporto** dei salti (il primo oltre 8 volte il secondo e oltre
     5 cm; una prima soglia fissa a 30 cm lasciava passare il tiro di collo, 13 cm) ed è escluso: 12 clip su 12 riconosciute.
     Suolo e scala si tarano sul **riposo** della sorgente, non sul primo fotogramma (un'esultanza può cominciare in salto).
  2. **dita piegate all'indietro**: la prima versione trasferiva la rotazione delle dita in coordinate mondo, quindi le dita non
     seguivano la mano del bersaglio. Passando alla variazione relativa al genitore le mani sono tornate naturali (indici tesi
     nelle esultanze, dita rilassate). Il cancello non lo vedeva (misura le posizioni di mani/piedi/testa, non le dita).
- **Cancello anatomico** (stesso criterio e stesse soglie dello script Mixamo, mediana ≤ 10°, massimo ≤ 30°: direzione di
  mani, piedi e testa rispetto al bacino, bersaglio contro sorgente). **Non ho toccato le soglie.**

### Perché sono state scartate tre clip

In tutte e tre il massimo cade sulla **mano sinistra quando è vicina al bacino** (11-14 cm): su un vettore così corto pochi
centimetri diventano molti gradi. Diagnosi misurata (non usata come cancello): la stessa mano misurata **rispetto alla spalla**
sbaglia al massimo **5,1°** → gli angoli del braccio sono riprodotti; lo scarto viene dalle **proporzioni** (braccio della
sorgente 0,278 + 0,273 m contro 0,199 + 0,240 del nostro corpo). Le mediane per estremità lo confermano: piedi 0,7-1,0°, mani
14-18° in modo simmetrico (non è un difetto del solo braccio sinistro). Rimetterle dentro vorrebbe dire cambiare il cancello o
aggiungere una correzione delle mani (IK): **decisione della sessione madre** (§6).

## 4. Misure sul nostro corpo

Due strumenti: lo script di riadattamento misura sulle **ossa** (in Blender), la sonda `tests/visual/clip-180-foto.mjs` misura
sui **vertici deformati** del corpo CGTrader LOD1 con three r128 (lo stesso motore del gioco), un campione ogni 0,1 s.

| Clip | Bacino si sposta (max) | Piede in appoggio che scivola: mediana · 90° percentile | Sotto il suolo, vertici (max · quota di campioni oltre 1 cm) | Mano-testa min, nostro / sorgente |
|---|---|---|---|---|
| side-foot-kick | 0,67 m | 0,03 · 0,83 m/s | 1,1 cm · 4% | 46 / 53 cm |
| power-kick | 2,34 m | 0,05 · 0,48 m/s | 1,0 cm · 4% | 41 / 49 cm |
| goal-celebration-01 | 1,06 m | 0,02 · 0,16 m/s | **5,8 cm** (a 3,4 s, in ginocchio) · 14% | 33 / 39 cm |
| goal-celebration-02 | 1,31 m | 0,01 · 0,12 m/s | 0 cm · 0% | 21 / 25 cm |
| goal-celebration-03 | 1,68 m | 0,09 · 0,54 m/s | 0,6 cm · 0% | 14 / 14 cm |
| defending-01 | 1,03 m | 0,08 · 1,20 m/s | 1,0 cm · 0% | 30 / 36 cm |
| clapping-hands-up | 0,01 m | 0,003 · 0,01 m/s | 1,6 cm · **100%** (costante) | 21 / 27 cm |
| fist-up-cheering | 0,05 m | 0,007 · 0,02 m/s | 0 cm · 0% | 21 / 24 cm |
| pointing-up-cheering | 0,03 m | 0,003 · 0,01 m/s | 1,4 cm · 12% | 26 / 32 cm |

Come leggerle:
- **Scivolamento**: velocità in pianta di un piede considerato in appoggio (entro 4 cm dalla sua altezza da fermo per due campioni
  di fila). La mediana è sotto 0,1 m/s ovunque; i 90° percentili alti (difesa 1,2 m/s, tiro di piatto 0,8) cadono nei passi
  veloci, dove il criterio «entro 4 cm» conta come appoggio anche un piede che si sta già staccando: **è un limite della misura**,
  nei provini non si vede pattinare.
- **Compenetrazione col suolo**: solo la scivolata in ginocchio (celebrazione 01) supera 2 cm, ed è visibile nella foto finale.
  L'1,6 cm costante dell'applauso è uno scalino fisso di taratura del suolo (non un movimento).
- **Compenetrazione mano-viso**: misurata solo come distanza osso-mano ↔ osso-testa (non fra le superfici). Sul nostro corpo le
  mani arrivano **4-8 cm più vicine alla testa** che nella sorgente (3,7 cm il pugno alzato; uguale nella celebrazione 03) (braccia più corte a parità di angoli). Nei provini
  dell'applauso le mani stanno davanti alla bocca: un contatto col viso **Non posso confermarlo né escluderlo** con questa misura.

## 5. File, peso, guardiano, controlli

- **`assets/cgtrader-clip-rohr.glb`**: 2.042.300 byte, 9 clip, 1 skin a 75 ossa (nomi e ordine identici a
  `cgtrader-review-lod1-kit-adapter.glb`), nessuna mesh/materiale/immagine; peso per clip: tiri ~110 KB, esultanze 78-86 KB,
  difesa 153 KB, le tre del pubblico 319-593 KB (sono lunghe 13-22 s). **Il gioco non lo carica**: nessuna riga in `src/`
  (non è servito nemmeno l'interruttore spento: la sonda carica il file da sé).
- **Peso in `dist/`**: `build-dist` copia l'intera cartella `assets/`, quindi il file **entra in `dist/` anche se inutilizzato**:
  `dist/` 143,27 MB, di cui 2,04 MB questo file (+1,4%). Da decidere se tenerlo fuori dalla build finché non è collegato (§6).
- **Guardiano `npm run clip-180`** (`tests/visual/clip-180.mjs`, statico, ~1 s, aggiunto alla catena `completa` di
  `ci-runner.mjs`): GLB valido, peso ≤ 2,5 MB, 75 ossa uguali al corpo, solo animazioni, 9 clip attese con durata ±1 fotogramma e
  30 fps esatti, canali tutti sullo skin, **parse vero col GLTFLoader di three r128** (9 clip, 475 tracce legate a ossa).
  **Verde.** Prova del rosso: `CPM_CLIP180=assets/cgtrader-clip-po.glb npm run clip-180` → **rosso, 8 controlli falliti, uscita 1**.
- **Sonda dei provini** `npm run clip-180-foto` (rigenera `docs/sviluppo/giro180/` e `misure-mesh.json`).
- **Controlli eseguiti, uno alla volta, memoria e disco controllati prima di ciascuno:** `check-src` (src allineato, nessuna
  modifica) · `design-system` ✅ · `test:logic` 51/51 ✅ · `save-compat` 12/12 ✅ · `build-dist` ✅ (nessuna CDN residua) ·
  `validate-dist` ✅ (offline, 0 errori) · `crediti-254` ✅ (vedi sotto). Gate 14/14 e catena completa **non** eseguiti: nessun
  byte del gioco è cambiato (direttiva PO 22/09 sulla catena per ciò che si è toccato).
- **`crediti-254` è stato rosso una volta per colpa mia**: conta ogni riga di `CREDITI-fonti.md` che comincia con «|», e la mia
  sezione era una tabella (29 righe contro 20). Riscritta come elenco → verde. Per lo stesso motivo **Rohr non è nella tabella
  dei Crediti**: lì ogni riga deve comparire nella finestra Crediti del gioco, che sta in `src/` (vietato in questo giro).
- **Igiene licenza:** `.gitignore` ha ora una rete sui nomi del pacchetto (`[0-9][0-9]_*.fbx`, `*_ue5.fbx`, `*_iclone.fbx`,
  `*.uasset`, `mocap/`, `RTG_RKK_to_MH/`, `Importing_into_UE5.pdf`). **Non** ho messo un `*.fbx` globale: nel repo sono già
  tracciati FBX originali **CGTrader** in `assets/source/cgtrader-soccer-player/originals/` (altra fonte, fuori dal mio ambito;
  lo segnalo in §6). Verifiche finali in §7.
- **Roadmap:** non aggiornata — nessuna versione parte (GAME_VERSION invariata per mandato).

## 6. Domande per la sessione madre

1. **Le tre clip scartate** (rigori 01/02, difesa 02): restano fuori come vuole il cancello, oppure si apre un giro per
   correggere le mani vicino al bacino (IK sulle mani o cancello misurato rispetto alla spalla)? Io non ho cambiato soglie.
2. **Rigore**: con i due rigori scartati, il rigore resta sulle clip attuali; il tiro di collo `rohr-power-kick` (rincorsa 2,3 m)
   può fare da base dopo il taglio della coda?
3. **Accorciare** le tre clip del pubblico (13-22 s, 1,24 MB su 2,04) a un ciclo di 3-4 s prima di collegarle?
4. **`dist/`**: tenere fuori dalla build il file finché il gioco non lo usa (oggi +2,04 MB su 143 MB)?
5. **Crediti**: quando le clip entreranno nel gioco, aggiungere una riga di cortesia nella finestra Crediti (la licenza non lo
   chiede) e spostare la registrazione nella tabella di `CREDITI-fonti.md`, allineando `crediti-254`?
6. Fuori ambito, solo segnalato: nel repo pubblico sono tracciati **FBX originali CGTrader** (`assets/source/cgtrader-soccer-player/originals/*.fbx`
   e `TEXTURES.zip`). La licenza CGTrader citata nel registro clip vieta che il prodotto sia scaricabile «in the form in which it
   is downloaded from the Site»: se quei file sono gli originali scaricati, il rischio è maggiore di quello dei GLB convertiti.
   Non posso confermarlo (non ho confrontato quei file con l'acquisto).

## 7. Verifiche finali di igiene (dopo il commit)

Eseguite dopo il commit `13d7b45` (12/11):
- `git status`: pulito. Diff del commit: nessun `.fbx`, `.zip`, `.uasset`, `.pdf`, `mocap/`, `RTG_RKK_to_MH/`.
- `git ls-files` cercando i nomi del pacchetto (`_ue5`, `_iclone`, `Side_Foot`, `Power_Kick`, `Penalty_Kick`, `Goal_Celebration`,
  `Defending_0`, `Clapping`, `Fist_Up`, `Pointing_Up`, `Importing_into`, `RTG_RKK`, `.uasset`, `pack04/05`): gli unici riscontri sono
  i **nostri** provini `docs/sviluppo/giro180/rohr-clapping-hands-up-*.jpg` (foto del corpo CGTrader). Storia di tutti i rami:
  nessun FBX/zip/uasset del pacchetto.
- `dist/` dopo `build-dist`: nessun file del pacchetto originale (contiene solo il GLB convertito, vedi §5).
- **`/tmp/rohr` cancellata** (zip, FBX estratti), insieme all'ambiente Python temporaneo con Blender e alla ruota scaricata.

# 180c — Altre clip, correzione delle mani, anelli (12/11/2026, ~13:40-14:40 ora di Roma)

Ramo `sviluppo/giro180-animazioni-rohr`. **Nessun cambio a `src/`** (check-src: IDENTICO BYTE PER BYTE), `GAME_VERSION` non
toccata, clip **ancora non collegate** ai gesti.

## In una riga

**`assets/cgtrader-clip-rohr.glb` ha ora 24 clip (2,76 MB)** su 33 provate. La correzione delle mani chiesta (IK del braccio
rispetto alla spalla) è fatta e porta il polso esattamente dove lo vuole la sorgente rispetto alla spalla (scarto da 5,1° a
**0,0°**), **ma il cancello invariato misura le mani rispetto al bacino e con la correzione peggiora** su quasi tutte le clip
(massimo +0,2…+4,9° su 30 clip): nessuna delle tre scartate rientra, e **`rohr-defending-01`, che era dentro, ora esce** (28,6° → 33,3°).
Domanda per la sessione madre in §6.

## Tabella per il PO

Fogli dei provini: 4 momenti (inizio · metà · «gesto» = istante più veloce di mano o piede · fine), PC (in fila) e telefono (in
colonna), in `docs/sviluppo/giro180/<clip>-pc.jpg` e `-telefono.jpg`. Tutti rigenerati (la correzione delle mani tocca ogni clip).

| Clip | Cosa mostra (visto sui provini) | Giudizio | Foto |
|---|---|---|---|
| `rohr-side-foot-kick` | tiro di piatto (invariato a occhio) | **usabile** | [PC](giro180/rohr-side-foot-kick-pc.jpg) · [telefono](giro180/rohr-side-foot-kick-telefono.jpg) |
| `rohr-power-kick` | tiro di collo, **coda tagliata a 2,6 s**: finisce col piede appoggiato dopo il tiro, braccio d'equilibrio ancora largo | **usabile** (la coda non c'è più) | [PC](giro180/rohr-power-kick-pc.jpg) · [telefono](giro180/rohr-power-kick-telefono.jpg) |
| `rohr-goal-celebration-01` | scivolata in ginocchio, indici al cielo: **ginocchia sul suolo** (5,8 → 0 cm) | **usabile** | [PC](giro180/rohr-goal-celebration-01-pc.jpg) · [telefono](giro180/rohr-goal-celebration-01-telefono.jpg) |
| `rohr-goal-celebration-02` | braccia alzate, sguardo al cielo | **usabile** | [PC](giro180/rohr-goal-celebration-02-pc.jpg) · [telefono](giro180/rohr-goal-celebration-02-telefono.jpg) |
| `rohr-goal-celebration-03` | saltello, braccio teso, poi si volta | **usabile** (rotazione finale) | [PC](giro180/rohr-goal-celebration-03-pc.jpg) · [telefono](giro180/rohr-goal-celebration-03-telefono.jpg) |
| `rohr-goalkeeper-save-01` | portiere in attesa, poi **stacco in alto con le due mani** (presa alta), poi si rialza e cammina | **usabile** come presa alta; il bacino si sposta 1,9 m | [PC](giro180/rohr-goalkeeper-save-01-pc.jpg) · [telefono](giro180/rohr-goalkeeper-save-01-telefono.jpg) |
| `rohr-goalkeeper-save-02` | portiere in attesa, **passo laterale con braccio teso** (parata in piedi, non un tuffo), poi si raddrizza | **usabile** | [PC](giro180/rohr-goalkeeper-save-02-pc.jpg) · [telefono](giro180/rohr-goalkeeper-save-02-telefono.jpg) |
| `rohr-throw-in` | rimessa laterale: si china, porta le mani sopra la testa, lancia, si raddrizza | **usabile, serve il pallone** fra le mani (la clip non ce l'ha) | [PC](giro180/rohr-throw-in-pc.jpg) · [telefono](giro180/rohr-throw-in-telefono.jpg) |
| `rohr-yellow-card` | braccio destro alzato dritto sopra la testa (il cartellino), poi giù | **usabile, serve il cartellino** in mano | [PC](giro180/rohr-yellow-card-pc.jpg) · [telefono](giro180/rohr-yellow-card-telefono.jpg) |
| `rohr-yellow-red-card` | due volte il braccio alzato (giallo, poi rosso) | **usabile, servono i cartellini** | [PC](giro180/rohr-yellow-red-card-pc.jpg) · [telefono](giro180/rohr-yellow-red-card-telefono.jpg) |
| `rohr-juggling-01` | palleggio di piede, sul posto; **anello di 3,13 s** | **usabile, serve il pallone** | [PC](giro180/rohr-juggling-01-pc.jpg) · [telefono](giro180/rohr-juggling-01-telefono.jpg) |
| `rohr-juggling-02` | palleggio di coscia/piede alternati; **anello di 3,73 s** | **usabile, serve il pallone**; la chiusura dell'anello qui lavora di più (salto 12,9 cm riassorbito, §3) | [PC](giro180/rohr-juggling-02-pc.jpg) · [telefono](giro180/rohr-juggling-02-telefono.jpg) |
| `rohr-clapping-hands-up` | applauso con le mani alte; **3,9 s ad anello** (era 14,1) | **usabile** | [PC](giro180/rohr-clapping-hands-up-pc.jpg) · [telefono](giro180/rohr-clapping-hands-up-telefono.jpg) |
| `rohr-fist-up-cheering` | pugno alzato; **3,7 s** (era 21,8) | **usabile** | [PC](giro180/rohr-fist-up-cheering-pc.jpg) · [telefono](giro180/rohr-fist-up-cheering-telefono.jpg) |
| `rohr-pointing-up-cheering` | indice in alto; **4,0 s** (era 12,9) | **usabile** | [PC](giro180/rohr-pointing-up-cheering-pc.jpg) · [telefono](giro180/rohr-pointing-up-cheering-telefono.jpg) |
| `rohr-sitting-clapping` | **seduto** che applaude | **usabile solo con un sedile sotto** (seduto nel vuoto: in gradinata va allineato al seggiolino) | [PC](giro180/rohr-sitting-clapping-pc.jpg) · [telefono](giro180/rohr-sitting-clapping-telefono.jpg) |
| `rohr-standing-clapping` | in piedi, applauso a mani basse, piccolo | **usabile** | [PC](giro180/rohr-standing-clapping-pc.jpg) · [telefono](giro180/rohr-standing-clapping-telefono.jpg) |
| `rohr-clapping-and-agree` | applauso e cenno della testa | **usabile** | [PC](giro180/rohr-clapping-and-agree-pc.jpg) · [telefono](giro180/rohr-clapping-and-agree-telefono.jpg) |
| `rohr-clap-twice-hand-up` | due battute di mani e braccia su | **usabile** | [PC](giro180/rohr-clap-twice-hand-up-pc.jpg) · [telefono](giro180/rohr-clap-twice-hand-up-telefono.jpg) |
| `rohr-swaying-arms` | dondolio delle braccia; **nei 4 fotogrammi quasi immobile** (il tratto scelto è calmo) | **da sistemare**: da rivedere in movimento, forse va scelto un altro tratto | [PC](giro180/rohr-swaying-arms-pc.jpg) · [telefono](giro180/rohr-swaying-arms-telefono.jpg) |
| `rohr-hands-up-swaying` | mani alte che ondeggiano | **usabile** | [PC](giro180/rohr-hands-up-swaying-pc.jpg) · [telefono](giro180/rohr-hands-up-swaying-telefono.jpg) |
| `rohr-hands-up-looking-up` | mani alte, testa all'indietro, sguardo al cielo | **usabile** | [PC](giro180/rohr-hands-up-looking-up-pc.jpg) · [telefono](giro180/rohr-hands-up-looking-up-telefono.jpg) |
| `rohr-standing-selfie` | braccio teso in alto (il telefono), l'altro aperto | **usabile, serve il telefono** in mano | [PC](giro180/rohr-standing-selfie-pc.jpg) · [telefono](giro180/rohr-standing-selfie-telefono.jpg) |
| `rohr-sitting-phone-video` | seduto, mani davanti al petto (riprende col telefono) | **usabile solo con sedile e telefono** | [PC](giro180/rohr-sitting-phone-video-pc.jpg) · [telefono](giro180/rohr-sitting-phone-video-telefono.jpg) |
| 18_Defending_01 (era `rohr-defending-01`) | — | **fuori: scartata dal cancello DOPO la correzione delle mani** (28,6° → 33,3°); provini del 180b tolti | — |
| 10/11_Penalty_Kick_01/02 · 19_Defending_02 | — | **ancora fuori** (31,6° · 41,5° · 39,4° dopo la correzione) | — |
| 17_Goalkeeper_Save_03 | — | **fuori** (28,3° senza correzione → 30,1° con) | — |
| 01/02/03_Dribble | — | **fuori** (31,6° · 35,9° · 28,9° senza → 35,0° · 37,3° · 31,3° con) | — |
| 06_Juggling_03 | — | **fuori**: la chiusura dell'anello deve riassorbire un salto di 15,7 cm e il cancello sui fotogrammi della rampa arriva a 33,9° | — |

«Usabile» = il gesto si legge sul nostro corpo senza difetti visibili nei provini e nelle misure. Il giudizio vero, a velocità
reale e in partita, resta da dare quando le clip verranno collegate. Gli oggetti (pallone, cartellini, telefono, sedile) **non sono
nelle clip**: vanno aggiunti dal gioco.

## 1. Scaricamento, estrazione, strumenti

- Zip dalla cartella Drive del PO (`curl`, nessun login): **sha256 identici** a quelli registrati in `CREDITI-fonti.md`
  (pack 05 `1a26159823911a0b…`, pack 04 `56fcdcc77ceb7d45…`). In `/tmp/rohr`, fuori dal clone.
- Estrazione **selettiva** dei soli 33 FBX dello scheletro UE5 che servono (21 dal pack 05, 12 dal pack 04), per nome, in due
  cartelle nuove e vuote. Nessuno script del pacchetto eseguito né aperto. Gli sha256 dei 12 FBX già usati coincidono col 180b.
- Blender 5.3 (`bpy` da PyPI) in un ambiente virtuale in `/tmp/rohr-venv`. Nota pratica: `pip install bpy` scaricava a
  ~100 KB/s (stimata un'ora); la ruota è stata scaricata a 16 pezzi in parallelo da `files.pythonhosted.org` (stesso file, sha256
  verificato contro quello pubblicato da PyPI, `5850cd39369e4cd8…`) e installata dal file locale.

## 2. La correzione delle mani (decisione madre §6.1) — fatta, misurata, non basta

**Cosa fa** (`tools/rohr-180/riadatta_rohr.py`, funzione `ik_braccio`, sempre attiva, `CPM_IK=0` la spegne): dopo il
riadattamento di ogni fotogramma, per ciascun braccio, il polso va a `spalla + (polso − spalla della sorgente) × (omero+avambraccio
nostro) / (omero+avambraccio della sorgente)`; IK a due ossa (legge del coseno), piano del gomito preso dal riadattamento,
orientamento della mano (e quindi delle dita) preso dalla sorgente. Spostamento del polso: 0,5-4,1 cm. Verifica: lo scarto
**mano-rispetto-alla-spalla** passa dal 5,1° del 180b a **0,0°** su tutte le clip (nessun fotogramma saltato per gomito degenere).

**Cosa dice il cancello invariato** (mani, piedi, testa **rispetto al bacino**, mediana ≤ 10°, massimo ≤ 30°): prima/dopo per ogni
clip nella tabella di §4. Il massimo **sale** su 31 clip su 33 (da +0,2° a +4,9°; +12,3° su \`juggling-03\`, dove però pesa la rampa
dell'anello, §3) e scende su 2 (\`clapping-hands-up\` 8,4° → 7,3°, \`goal-celebration-02\` 6,2° → 5,1°); le mediane non si muovono
(±0,1°). Per gli anelli il «prima» non comprende la rimisura dei fotogrammi della rampa, il «dopo» sì.

**Perché** (misurato, non supposto): il nostro braccio è più corto in proporzione (0,439 m contro 0,551, rapporto 0,80, mentre
l'altezza dell'anca dà 0,973). Rendere esatta la direzione spalla→polso accorcia la portata in modo uniforme e, vista dal bacino,
la mano vicina al fianco si sposta di più in direzione. Diagnostica di controllo, **solo misura e non usata per il file**
(`CPM_IK_RIF=bacino`, polso mandato nel punto della sorgente rispetto al bacino, cioè proprio dove guarda il cancello): rigori
01/02 e difesa 02 scendono a 26,2° · 33,6° · 23,5° di massimo, ma la mediana delle mani resta 13-15° perché quel punto
**non è raggiungibile** con un braccio più corto (la IK si ferma a braccio teso). Cioè: nessuna IK sul nostro braccio rende
uguali le direzioni dal bacino; le tre clip sono fuori per le proporzioni del corpo, non per un errore d'angolo.

**Applicata alla lettera** ("ripassa tutte le clip dal cancello invariato; entrano solo quelle che lo passano"): con la correzione
escono `defending-01` (che c'era), `goalkeeper-save-03` e `dribble-03` (che senza la passerebbero). Vedi §6, domanda 1.

## 3. Le altre correzioni

- **Coda del tiro di collo** (`rohr-power-kick:a=2.6`): misurato sul file del 180b, piede destro più veloce a 2,2-2,3 s (il
  colpo), piede giù a 2,5 s, il bacino comincia a girarsi dopo 2,6 s (da −92° a −173° fino a 3,2 s, poi se ne va). Taglio a
  **2,6 s**: 4,43 → 2,60 s, 111 → 64 KB.
- **Ginocchia nella scivolata** (`rohr-goal-celebration-01:suolo`): per ogni fotogramma Blender valuta i **vertici deformati** del
  nostro corpo e, se il più basso scende sotto il suo livello a riposo, alza il bacino di quella differenza. Alzata massima
  6,4 cm; misura indipendente sui vertici con three r128 (sonda): **5,8 → 0,0 cm**, quota di campioni oltre 1 cm 14% → 0%. Il
  rovescio: mentre le ginocchia toccano, le punte dei piedi possono stare qualche centimetro più su di prima (nei provini non si
  vede staccata). Applicata **solo** a questa clip: nessun'altra supera 2 cm sotto il suolo (max 1,5 cm, §4).
- **Anelli di 3-4 s** (decisione madre §6.3) per le 3 clip del pubblico già dentro, le 9 nuove del pack 04 e i 3 palleggi
  (`ciclo=3-4`): (1) nella sorgente si cerca la finestra di 3-4 s il cui ultimo fotogramma somiglia di più al primo (posizione
  **e** velocità di bacino, mani, gomiti, piedi, ginocchia, testa); (2) la differenza residua si riassorbe sugli ultimi 10
  fotogrammi (0,33 s) con una rampa liscia, così l'ultimo fotogramma coincide col primo; (3) il cancello si **rimisura** sui
  fotogrammi della rampa. Misura della giunzione: salto prima della chiusura → 0, e passo massimo **dentro** la rampa contro il passo
  massimo **fuori** (se il primo non supera il secondo, la rampa non si vede come uno scatto). Su 14 anelli: in 9 il passo in rampa
  è ≤ di quello fuori; in 5 lo supera di poco (hands-up-swaying 4,2 contro 3,5 cm; hands-up-looking-up 0,7 contro 0,5;
  standing-selfie 0,7 contro 0,4; fist-up 2,2 contro 2,0; pointing-up 2,4 contro 2,4) — in valore assoluto sono movimenti
  sotto il centimetro per fotogramma o comunque nel ritmo del gesto. Il guardiano controlla la chiusura (§5).
- **Sonda dei provini**: il riquadro «fine» della parata 01 era **vuoto**. Causa: three ritaglia la mesh con la sfera della posa
  di riposo, e il corpo si era spostato di 1,9 m. Corretto nella sonda (`frustumCulled=false`); non riguarda la clip. Nel gioco
  la stessa cosa può succedere a una clip con molto spostamento del bacino: da tenere presente quando verranno collegate.

## 4. Misure, per clip

Cancello: mediana / massimo in gradi, **prima** e **dopo** la correzione delle mani. Suolo: vertice più basso sotto il livello a
riposo (sonda three r128 sui vertici). Scivolamento del piede in appoggio: mediana · 90° percentile (m/s, stessi limiti di misura
del 180b §4: i percentili alti cadono nei passi veloci). Mano-testa: distanza minima osso-osso, nostro / sorgente in scala (cm).
Giunzione: solo per gli anelli.

| Clip | FBX (sha256, primi 16) | Durata | Cancello prima | Cancello dopo | Nel file | Sotto suolo | Scivolamento | Mano-testa | Giunzione | Opzioni |
|---|---|---|---|---|---|---|---|---|---|---|
|`rohr-side-foot-kick`|08_Side_Foot_Kick_ue5 (`e2baf0928c0f5da7…`)|4,5 s|3,77° / 18,27°|3,77° / 19,58°|sì|1,1 cm|0,025 · 0,827|47,0 / 52,9|—|—|
|`rohr-power-kick`|09_Power_Kick_ue5 (`2dcadd8d78b58469…`)|2,6 s|5,06° / 16,78°|5,06° / 18,49°|sì|0,7 cm|0,043 · 0,503|48,3 / 55,1|—|a=2.6|
|`rohr-goal-celebration-01`|12_Goal_Celebration_01_ue5 (`3d33fb8ebba86261…`)|3,467 s|4,05° / 21,23°|4,05° / 22,49°|sì|0 cm|0,014 · 0,137|34,5 / 38,7|—|suolo|
|`rohr-goal-celebration-02`|13_Goal_Celebration_02_ue5 (`b43fae915f4244bc…`)|3,5 s|1,42° / 6,17°|1,33° / 5,13°|sì|0 cm|0,006 · 0,116|22,4 / 24,6|—|—|
|`rohr-goal-celebration-03`|14_Goal_Celebration_03_ue5 (`64508912d21cea94…`)|3,167 s|4,19° / 22,46°|4,28° / 23,24°|sì|0,6 cm|0,09 · 0,544|15,4 / 13,6|—|—|
|— (rohr-defending-01)|18_Defending_01_ue5 (`ed9789d1c8f4cb49…`)|6,233 s|7,45° / 28,58°|7,53° / 33,31°|**no**|—|0,08 · 1,202|31,8 / 35,6|—|—|
|`rohr-clapping-hands-up`|03_Clapping_Hands_Up_ue5 (`0174b0b26b952522…`)|3,9 s|3,35° / 8,43°|3,35° / 7,32°|sì|1,5 cm|0,004 · 0,014|24,7 / 28,1|0,61 → 0 cm (rampa 0,29 · fuori 0,46)|ciclo=3-4|
|`rohr-fist-up-cheering`|05_Fist_Up_Cheering_ue5 (`7bf69a418c9dbb07…`)|3,7 s|3,72° / 16,2°|3,72° / 17,2°|sì|0 cm|0,005 · 0,011|28,5 / 31,6|0,92 → 0 cm (rampa 2,15 · fuori 2,03)|ciclo=3-4|
|`rohr-pointing-up-cheering`|17_Pointing_Up_Cheering_ue5 (`ef5b6c2fc3cf941e…`)|4 s|3,46° / 15,52°|3,47° / 18,85°|sì|1,1 cm|0,003 · 0,012|28,5 / 32,1|3,24 → 0 cm (rampa 2,44 · fuori 2,43)|ciclo=3-4|
|— (rohr-penalty-kick-01)|10_Penalty_Kick_01_ue5 (`4bd04c128d1f36d3…`)|10,533 s|4,88° / 30,33°|4,88° / 31,62°|**no**|—|0,061 · 0,708|27,5 / 33,5|—|—|
|— (rohr-penalty-kick-02)|11_Penalty_Kick_02_ue5 (`045c5bea65085b93…`)|8,733 s|5,36° / 39,78°|5,36° / 41,46°|**no**|—|0,053 · 0,709|29,0 / 35,0|—|—|
|— (rohr-defending-02)|19_Defending_02_ue5 (`af5f864fc7ec475b…`)|8,45 s|7,71° / 35,6°|7,64° / 39,36°|**no**|—|0,109 · 1,605|23,5 / 28,5|—|—|
|`rohr-goalkeeper-save-01`|15_Goalkeeper_Save_01_ue5 (`1e265d0fe409b2df…`)|7,167 s|7,38° / 27,34°|7,38° / 28,79°|sì|0,8 cm|0,012 · 0,416|17,9 / 23,1|—|—|
|`rohr-goalkeeper-save-02`|16_Goalkeeper_Save_02_ue5 (`17fea4c6aacd806a…`)|4,367 s|6,35° / 18,83°|6,46° / 20,5°|sì|1,3 cm|0,024 · 0,291|29,7 / 34,2|—|—|
|— (rohr-goalkeeper-save-03)|17_Goalkeeper_Save_03_ue5 (`519a22f817339044…`)|8,9 s|7,63° / 28,32°|7,63° / 30,1°|**no**|—|0,013 · 0,302|38,0 / 46,0|—|—|
|— (rohr-dribble-01)|01_Dribble_01_ue5 (`77f2f953aef1a4ba…`)|5,917 s|6,32° / 31,64°|6,32° / 35,03°|**no**|—|0,105 · 1,69|49,9 / 55,9|—|—|
|— (rohr-dribble-02)|02_Dribble_02_ue5 (`a4fbfc1f2b6759c4…`)|9,017 s|6,62° / 35,91°|6,62° / 37,33°|**no**|—|0,048 · 0,868|39,0 / 44,1|—|—|
|— (rohr-dribble-03)|03_Dribble_03_ue5 (`25559ae92624a132…`)|3,383 s|6,12° / 28,94°|6,14° / 31,32°|**no**|—|0,115 · 1,007|43,0 / 48,7|—|—|
|`rohr-throw-in`|07_Throw_In_ue5 (`7c0493fed556ce41…`)|7,933 s|3,02° / 27,81°|2,96° / 29,47°|sì|1 cm|0,014 · 0,099|17,9 / 20,7|—|—|
|`rohr-yellow-card`|20_Yellow_Card_ue5 (`7273daef858baa30…`)|2,867 s|2,47° / 21,05°|2,47° / 21,22°|sì|1,1 cm|0,003 · 0,008|23,7 / 25,5|—|—|
|`rohr-yellow-red-card`|21_Yellow_And_Red_Card_ue5 (`20c2d68e5ca5d92b…`)|5,7 s|2,97° / 18,82°|2,97° / 18,98°|sì|1,2 cm|0,005 · 0,031|25,3 / 27,1|—|—|
|`rohr-juggling-01`|04_Juggling_01_ue5 (`6e067597e6c525d6…`)|3,133 s|6,37° / 19,06°|6,37° / 20,41°|sì|0,2 cm|0,01 · 0,092|57,5 / 64,9|6,23 → 0 cm (rampa 2,32 · fuori 5,16)|ciclo=3-4|
|`rohr-juggling-02`|05_Juggling_02_ue5 (`d1ef01b574a80bc9…`)|3,733 s|5,62° / 17,42°|5,63° / 18,65°|sì|0,6 cm|0,029 · 0,467|59,1 / 66,9|12,91 → 0 cm (rampa 6,28 · fuori 12,93)|ciclo=3-4|
|— (rohr-juggling-03)|06_Juggling_03_ue5 (`c0dca47ce5989044…`)|3,0 s|6,7° / 21,62°|6,77° / 33,89°|**no**|—|0,011 · 0,349|55,2 / 62,2|15,73 → 0 cm (rampa 10,55 · fuori 7,68)|ciclo=3-4|
|`rohr-sitting-clapping`|01_Sitting_Clapping_ue5 (`f934a0f3e581a57b…`)|3,167 s|6,51° / 15,91°|6,49° / 16,45°|sì|0 cm|nessun appoggio rilevato|33,3 / 37,7|0,56 → 0 cm (rampa 0,8 · fuori 0,84)|ciclo=3-4|
|`rohr-standing-clapping`|02_Standing_Clapping_ue5 (`b2e15ae9e4f83700…`)|3,5 s|3,68° / 14,34°|3,68° / 15,51°|sì|0,8 cm|0,003 · 0,009|41,3 / 46,9|0,35 → 0 cm (rampa 0,58 · fuori 0,6)|ciclo=3-4|
|`rohr-clapping-and-agree`|04_Clapping_And_Agree_ue5 (`a6f141cf08bac419…`)|3,033 s|3,32° / 12,38°|3,34° / 13,42°|sì|1,1 cm|0,002 · 0,004|38,9 / 44,2|1,15 → 0 cm (rampa 0,59 · fuori 0,64)|ciclo=3-4|
|`rohr-clap-twice-hand-up`|15_Clap_Twice_Hand_Up_ue5 (`c7237e92553dc34d…`)|3,367 s|3,73° / 11,84°|3,72° / 12,04°|sì|0 cm|0,025 · 0,063|24,7 / 25,6|1,68 → 0 cm (rampa 4,97 · fuori 5,97)|ciclo=3-4|
|`rohr-swaying-arms`|06_Swaying_Arms_ue5 (`3f8572d7642ddc6a…`)|3,9 s|3,4° / 18,6°|3,4° / 19,12°|sì|0 cm|0,021 · 0,031|61,2 / 70,1|1,4 → 0 cm (rampa 1,42 · fuori 2,26)|ciclo=3-4|
|`rohr-hands-up-swaying`|07_Hands_Up_Swaying_ue5 (`e38cfb1e946364e4…`)|4 s|3,44° / 5,84°|3,48° / 6,06°|sì|1,5 cm|0,013 · 0,031|28,6 / 33,2|4,57 → 0 cm (rampa 4,21 · fuori 3,51)|ciclo=3-4|
|`rohr-hands-up-looking-up`|08_Hands_Up_Looking_Up_ue5 (`128ff7a324d5501a…`)|3,767 s|1,54° / 4,06°|1,55° / 4,87°|sì|1,2 cm|0,005 · 0,015|40,1 / 46,9|3,44 → 0 cm (rampa 0,71 · fuori 0,49)|ciclo=3-4|
|`rohr-standing-selfie`|12_Standing_Selfie_ue5 (`48dfa0ed7ae51642…`)|4 s|3,99° / 5,25°|3,87° / 5,72°|sì|0 cm|0,002 · 0,009|58,9 / 66,1|3,92 → 0 cm (rampa 0,67 · fuori 0,44)|ciclo=3-4|
|`rohr-sitting-phone-video`|13_Sitting_Phone_Video_ue5 (`84a482a0963e1ddf…`)|3,367 s|6,7° / 22,98°|6,7° / 27,84°|sì|0 cm|nessun appoggio rilevato|30,6 / 37,1|2,32 → 0 cm (rampa 0,6 · fuori 0,34)|ciclo=3-4|

Note: le mani arrivano ancora **3-9 cm più vicine alla testa** che nella sorgente (braccio più corto); come nel 180b, un contatto
mano-viso **Non posso confermarlo né escluderlo** con una misura osso-osso. Lo scalino costante di ~1,5 cm sotto il suolo di alcune
clip del pubblico è la taratura del suolo (180b §4), non un movimento. Sui provini delle pose accosciate (portiere, palleggi) si
vede in qualche fotogramma la pelle della coscia attraverso i pantaloncini: è la pelle del nostro modello in piegamento forte, non
la clip (la stessa cosa c'è nei provini del 180b); Non posso confermarlo oltre il provino.

## 5. File, peso, `dist/`, guardiano, controlli

- **`assets/cgtrader-clip-rohr.glb`**: **2.764.540 byte** (era 2.042.300), 24 clip, 75 ossa uguali al corpo, solo animazioni.
  Peso per clip (circa, KB): tiri 64-111 · esultanze 78-86 · portiere 107-203 · rimessa 224 · cartellini 68-148 · palleggi 77-92 ·
  pubblico 73-98. Le tre del pubblico già dentro pesavano 1,24 MB, ora **278 KB**.
- **Fuori da `dist/`** (decisione madre §6.4): `tools/build-dist.mjs` lo mette nell'elenco dei file non referenziati;
  `tools/validate-dist.mjs` ha un controllo nuovo «clip Rohr non collegate fuori dal pacchetto». Verde; **prova del rosso**: copiato
  a mano il file in `dist/assets/` → «❌ presente», uscita 1. Quando il gioco lo caricherà, vanno tolte entrambe le righe.
- **Guardiano `npm run clip-180`** aggiornato: 24 clip attese con durata ±1 fotogramma, peso ≤ 3,0 MB, e **nuovo controllo
  d'anello** sui 14 anelli (primo e ultimo valore di ogni canale: < 0,5° e < 1 mm). Verde (giunzioni 0,03-0,14°). Prova del rosso:
  sul file del 180b → rosso, 9 controlli falliti fra cui i tre anelli aperti (25° · 92° · 19°), uscita 1; sul file `cgtrader-clip-po.glb`
  → rosso, 8.
- **Controlli, uno alla volta, memoria e disco controllati prima di ciascuno:** `check-src` IDENTICO BYTE PER BYTE · `test:logic`
  51/51 · `save-compat` 12/12 · `build-dist` ✅ (nessuna CDN) · `validate-dist` ✅ (offline, 0 errori, Rohr fuori) · `crediti-254` ✅ ·
  `design-system` ✅ · `clip-180` ✅. Gate 14/14 e catena completa **non** eseguiti: nessun byte del gioco cambiato.
- Roadmap non aggiornata: nessuna versione parte (`GAME_VERSION` invariata per mandato).

## 6. Domande per la sessione madre

1. **La correzione delle mani peggiora il cancello.** Applicata alla lettera, fa uscire `defending-01` (era dentro, giudicata
   usabile come postura) e tiene fuori `goalkeeper-save-03` e `dribble-03`, che senza correzione passerebbero (28,6° · 28,3° · 28,9°).
   Strade possibili, nessuna presa: (a) tenere così; (b) correzione delle mani solo dove non peggiora il cancello; (c) nessuna
   correzione (dal «prima» della tabella §4 entrerebbero 27-28 clip: 28 se anche \`juggling-03\` regge la rampa senza correzione,
   cosa non misurata); (d) un cancello misurato rispetto alla spalla, che la sessione madre ha già
   escluso. Lo script rifà qualsiasi variante in ~1 minuto (`CPM_IK=0`), ma servono di nuovo gli zip.
2. **`rohr-swaying-arms`**: il tratto scelto per l'anello sembra calmo nei provini. Va scelto un tratto più mosso (es. finestra con
   più movimento delle mani a parità di giunzione)?
3. **Clip con oggetti** (rimessa, cartellini, selfie, video col telefono, palleggi) e **seduti** (sitting-clapping, sitting-phone-video):
   servono pallone/cartellini/telefono/sedile dal gioco. Si tengono nel file anche se oggi nessuna scena ha quegli oggetti?
4. **`juggling-03`** è fuori solo per la chiusura dell'anello (senza chiusura passa a 23,3°, ma con un salto di 15,7 cm): accettare un
   anello di più di 4 s, o lasciarla fuori?

## 7. Crediti (decisione madre §6.5) — preparato, NON attivato

Da fare **quando** le clip entreranno nel gioco (oggi no, `src/` intoccato):
1. in `src/17-menu-creazione-pannelli.jsx`, elenco della finestra Crediti (accanto alla voce «Animazioni Mixamo e modello CH38»),
   la riga di cortesia, pronta da incollare nello stesso formato delle voci vicine:
   `{n:"Animazioni Anderson Rohr",d:"Esultanze, tiri, parate, rimessa, cartellini, palleggi e gesti del pubblico.",aut:"Anderson Rohr",lic:"«This pack can be used for free in both personal and commercial projects. Attribution is not required» (andersonrohr.gumroad.com)"}`
   (va verificato il formato esatto delle voci di quel blocco al momento di incollarla);
2. in `docs/governo/CREDITI-fonti.md` spostare la registrazione Rohr dall'elenco «FUORI dalla tabella» a una riga della tabella;
3. rilanciare `npm run crediti-254` (conta le righe della tabella e le cerca nella finestra Crediti): deve restare verde;
4. togliere `cgtrader-clip-rohr.glb` dall'esclusione di `build-dist.mjs` e il controllo in `validate-dist.mjs` (§5).

## 8. Verifiche finali di igiene

Eseguite dopo il commit \`1edbee8\` (12/11):
- \`git status\`: pulito. File del commit: nessun \`.fbx\`, \`.zip\`, \`.uasset\`, \`.pdf\`, \`mocap/\`, \`RTG_RKK_to_MH/\`.
- \`git ls-files\` coi nomi del pacchetto (\`_ue5\`, \`_iclone\`, i nomi delle 33 clip, \`Importing_into\`, \`RTG_RKK\`, \`.uasset\`, \`pack04/05\`):
  gli unici riscontri sono i **nostri** provini \`docs/sviluppo/giro180/rohr-*-pc/telefono.jpg\`. Storia di tutti i rami: nessun FBX/zip/uasset.
- \`dist/\` dopo \`build-dist\`: nessun file del pacchetto e **nemmeno il GLB convertito** (escluso, §5).
- **Cancellati** \`/tmp/rohr\` (zip, FBX estratti, file di prova), l'ambiente \`/tmp/rohr-venv\` con Blender e la ruota scaricata.
