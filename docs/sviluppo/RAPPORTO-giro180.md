# Rapporto giro 180 — clip Anderson Rohr (PO-367)

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
