# Rapporto giro 25 — PO-254 Crediti (ramo `sviluppo/crediti-254`)

Richiesta PO 15/10 (foto `docs/governo/foto/po254-crediti-link.jpg` e `po254-crediti-contenuto.jpg`):
«Crediti, pulsante/link troppo minimale ed il contenuto non è stato aggiornato (tutte le fonti sono state individuate)».
Decisione PO: «Pulsante del kit in home» (DECISIONI.md, riga PO-254).
Base: gioco 7.999.169. `GAME_VERSION` **non toccato**.

## Cosa è cambiato

File: `src/17-menu-creazione-pannelli.jsx` (+ `CARRIER-MANAGER-AV.html` ricomposto da `tools/build-src.mjs`).

1. **Accesso.** Il link sottile sottolineato «Crediti» è sostituito da un `Btn` del kit, `v="secondary"`, `fw` (tutta
   larghezza), con icona `ℹ️` passata alla prop `icon` del `Btn`. Sta nella stessa posizione di prima, cioè sotto il
   bottone «Nuova carriera» e sotto la card di presentazione. Selettore: `data-cpm="crediti254-pulsante"`.
2. **Contenuto.** Nuova tabella `CREDITI254`, che riprende **solo** le 11 righe di `docs/governo/CREDITI-fonti.md`:
   - Modelli 3D: giocatori 3D «Soccer Player - Rigged» (CGTrader), autore Hisenberg, Royalty Free (standard) dichiarata dal PO,
     ordine #17876008 del 20/09/2026. **Il nome del prodotto è confermato dalla foto** `po238-ordine-cgtrader.jpg`:
     «Soccer Player - Rigged», Author: Hisenberg, Purchased on 2026-09-20, Order ID #17876008. Il vecchio nome
     «Realistic Soccer Player v2 rigged» non compare nella foto ed è stato tolto. Poi il corpo «Regular Male» (Mixamo, Adobe).
   - Illustrazioni: ritratti delle figurine (generati con l'API a pagamento di OpenAI), DiceBear «Avataaars» (Pablo Stanley),
     DiceBear «Micah» (Micah Lanier, CC BY 4.0, attribuzione obbligatoria).
   - Caratteri: Great Vibes (Robert Leuschke, SIL OFL 1.1), Barlow e Barlow Condensed (Jeremy Tribby, SIL OFL 1.1).
   - Suoni: «Stadium joy shouting crowd» (Mixkit 3022, Mixkit Sound Effects Free License), brusio di folla (generato per Korward Elite).
   - Librerie: DiceBear (Florian Körner, MIT); React/ReactDOM 18.2.0, Three.js r128, Babel standalone 7.23.6 (MIT).
   - «Non posso confermarlo», in grigio (`TH.muted`, `data-cpm="crediti254-nonconf"`), compare in quattro punti.
     Due vengono dal documento: l'autore del Mixkit 3022 e la licenza esatta di Avataaars.
     Due sono una mia scelta di resa: la licenza del corpo «Regular Male» e quella dei ritratti OpenAI. In quelle
     due righe la colonna Licenza del documento è «—», cioè il documento non indica nessuna licenza. **Va confermato dal PO**:
     l'alternativa è non mostrare la riga Licenza per quelle due voci.
   - Nessuna voce porta più «Fonte da completare». La frase introduttiva sulle voci «in verifica» è stata tolta: ora dice solo
     «Le risorse di terze parti usate in Korward Elite.».
3. **Interruttore rosso** `window.__CPM_NO_CREDITI254`: tornano il link sottile e il contenuto PO-238, cioè la tabella
   `CREDITI238`, lasciata intatta. `__CPM_NO_CREDITI238` continua a far sparire la voce.

## Guardiano `crediti-254` (sostituisce `crediti-238`)

`tests/visual/crediti-254.mjs`, `npm run crediti-254`, a 360 e 412 px su pagina pulita. Controlla tre cose.

1. Il pulsante del kit: è un `<button>`, largo almeno il 90% della colonna, ha l'icona, non è sottolineato, sta sotto «Nuova carriera».
2. Non ci sono «Fonte da completare». Ci sono almeno tanti «Non posso confermarlo» quanti ne ha il documento (2), e tutti hanno il
   colore grigio della descrizione.
3. Ogni riga del documento è presente. Il guardiano legge la tabella di `CREDITI-fonti.md` e si dichiara rosso anche quando il
   documento cambia numero di righe, perché una riga nuova non deve passare inosservata.

In più tiene i controlli di `crediti-238`: Modal standard, niente scorrimento orizzontale, «Chiudi» chiude.

- `crediti-238.mjs` è stato spostato in `tests/visual/archivio/`. Il suo controllo «almeno una fonte da completare» è ora
  falso per costruzione. Gli script `npm` e `ci-runner.mjs` (catena `completa` e MAPPA `src/1[17]-`) puntano a `crediti-254`.
- `brusio-238.mjs` apriva i Crediti dal vecchio selettore. Ora usa il pulsante nuovo, con ripiego sul link vecchio.

## Esiti (eseguiti in questo turno, sul build ricomposto)

| Passo | Esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` | ricomposto da 21 frammenti, 7210488 byte |
| `node tools/check-src.mjs` | ✓ identico byte per byte |
| `crediti-254` verde | ✅ uscita 0. A 360 px: pulsante 347/347 px. A 412 px: 394/394 px. Su entrambe: 11 voci, 0 da completare, 4 non confermabili, orizzontale 0/0 |
| `crediti-254` rosso (`CPM_ROSSO=__CPM_NO_CREDITI254`) | ❌ uscita 1: pulsante assente, 7 «Fonte da completare», voci del documento mancanti |
| `crediti-254` sul build **prima** della modifica | ❌ uscita 1, con le stesse mancanze del rosso |
| `brusio-238` | ✅ |
| `design-system` | ✅ SISTEMA GRAFICO OK |
| `popup-224` | ✅ verde e rosso visibile |
| `finestra-230` | ✅ verde e i due rossi visibili |
| `node tools/audit-copyright.mjs` | ✅ uscita 0, «nessun riferimento al mondo reale». Lo strumento non stampa un conteggio: 0 hit dedotto dall'esito OK |

Non eseguiti: il gate 14/14 e la catena completa. Il turno non ha toccato motore, partita o carriera. Secondo la direttiva PO
del 22/09 qui servono i passi grafici e i guardiani sopra. Non ho eseguito `griglia-mobile`, `career-critical`, `test:logic`
e `save-compat` della catena «solo grafica»: restano da fare al rilascio.

## Foto (`docs/sviluppo/foto-giro25/`)

`prima-home-{360,412}.png`, `prima-crediti-{360,412}.png` (link sottolineato, voci rosse) ·
`dopo-home-{360,412}.png`, `dopo-crediti-{360,412}.png`, `dopo-crediti-{360,412}-fondo.png`.
Le foto sono della home **senza carriere salvate**. Con salvataggi presenti il pulsante sta nella stessa posizione, dopo gli
slot, ma non l'ho fotografato.

## Risorse usate dal gioco che NON sono in `CREDITI-fonti.md`

Le ho tolte dai Crediti, come chiede l'istruzione «SOLO i dati del documento», e non ne ho inventato i dati. La provenienza
indicata qui sotto è quella che dichiarava la vecchia schermata PO-238, con la sua fonte. Non l'ho riverificata in questo giro.

1. **Microsoft Rocketbox**: giornalista e presentatori delle cerimonie (`assets/actor-journalist.glb`,
   `actor-presenter.glb`, `actor-presenter-f.glb`). La vecchia schermata dava licenza MIT, fonte
   `docs/archivio/EXTRA-FIELD-MODELS.md`. ⚠️ Se la licenza è davvero MIT, l'avviso di copyright va riportato:
   toglierla dai Crediti potrebbe essere un passo indietro. **Decisione PO.**
2. **Animazioni Mixamo** (`assets/anim-*.glb`, `cgtrader-clip-mixamo.glb`, `cgtrader-clip-po*.glb`) e **modello CH38**
   (`assets/footballer*.glb`). La vecchia schermata le attribuiva a Mixamo con la FAQ Adobe, fonte
   `tests/character-lab/CLIP_REGISTRY.md`. Il documento nomina Mixamo solo per il corpo «Regular Male».
3. **GLTFLoader e SkeletonUtils** (esempi di three@0.128.0, caricati da `src/00-head.html`). Il documento dice solo «Three.js r128».
4. **Effetti sonori sintetizzati con Web Audio**, e **icone dell'app e grafiche dello store** (`tools/gen-pwa-icons.mjs`,
   `tools/gen-store-graphics.mjs`). Per la vecchia schermata erano «realizzati per Korward Elite». Non sono di terzi,
   ma non sono nel documento.
5. Altri file in `assets/` di cui non posso confermare l'origine: `avatar-0..11.png`, `hero-highlight-portrait-v1.*`,
   `hyper-casual-korward-*.glb`, `hair-colors/`, `korward-regular-anims/`, `portraits/`. Potrebbero rientrare in righe già
   presenti, per esempio «ritratti delle figurine» o «Regular Male», ma non posso confermarlo.

## Fuori ambito

- `BACKLOG.md` e la roadmap non sono stati aggiornati, perché questo giro non è un rilascio (`GAME_VERSION` invariato).
  La riga di roadmap si scrive quando la versione parte.
- Nessun push su `main`.

---

# Giro 25b — decisioni PO del 15/10 (ramo `sviluppo/crediti-254`)

Base: commit `72ffe742` (giro 25). `GAME_VERSION` **non toccato** (resta 7.999.169).

## Decisioni applicate

1. **«Rimettile con la loro fonte».** Cinque voci tolte nel giro 25 tornano nei Crediti (`CREDITI254` in
   `src/17-menu-creazione-pannelli.jsx`) e, con la loro fonte, come righe nuove in fondo a `docs/governo/CREDITI-fonti.md`
   (16 righe, erano 11). Documento e gioco dicono le stesse cose.

   | Voce | Sezione nel gioco | Autore | Licenza | Fonte nel repo |
   |---|---|---|---|---|
   | Microsoft Rocketbox (`assets/actor-journalist.glb`, `actor-presenter.glb`, `actor-presenter-f.glb`) | Modelli 3D e animazioni | Microsoft (github.com/microsoft/Microsoft-Rocketbox) | MIT | `docs/archivio/EXTRA-FIELD-MODELS.md` righe 5-7 e 96 |
   | Animazioni Mixamo (`assets/anim-*.glb`, `cgtrader-clip-mixamo.glb`, `cgtrader-clip-po*.glb`) e modello CH38 (`assets/footballer*.glb`) | Modelli 3D e animazioni | Mixamo (Adobe) | «royalty free for personal, commercial, and non-profit projects, including creating video games» (FAQ Adobe) | `tests/character-lab/CLIP_REGISTRY.md` righe 10, 26, 53 + FAQ helpx.adobe.com/creative-cloud/faq/mixamo-faq.html |
   | GLTFLoader e SkeletonUtils (esempi di three@0.128.0) | Librerie software | three.js authors | MIT — «Copyright © 2010-2021 three.js authors» | `src/00-head.html` righe 64-65; LICENSE del pacchetto npm `three` 0.128.0 (devDependency di `tests/visual/package.json`) |
   | Effetti sonori sintetizzati con Web Audio | Suoni | realizzati per Korward Elite | — | `assets/audio/README.md` righe 6-7 |
   | Icone dell'app e grafiche dello store | Illustrazioni e immagini | realizzate per Korward Elite | — | `tools/gen-pwa-icons.mjs`, `tools/gen-store-graphics.mjs` |

   **Avviso di copyright di Microsoft Rocketbox: Non posso confermarlo.** Il testo esatto della LICENSE MIT di Rocketbox
   (la riga «Copyright (c) …») non è nel repo. `EXTRA-FIELD-MODELS.md` dice solo «licenza MIT dal 12/2020» e cita il README
   del repository Microsoft. Nel repo non ci sono file LICENSE di Rocketbox né la frase «Copyright … Microsoft»
   (cercata con `grep -rn -i "Copyright.*Microsoft"` fuori da `node_modules`: nessun risultato). Per questo i Crediti mostrano «Licenza: MIT» e
   **non** riportano l'avviso. La licenza MIT chiede che l'avviso accompagni le copie del software: va recuperato dalla
   LICENSE del repository Microsoft e aggiunto. **Decisione PO** su chi lo recupera.

   Altre due cose che ho verificato e che è giusto dire:
   - **GLTFLoader / SkeletonUtils.** La riga di copyright viene dal file `node_modules/three/LICENSE` installato da
     `npm install` (three 0.128.0, la stessa versione che carica il gioco). Il pacchetto contiene anche `examples/js/loaders/GLTFLoader.js`
     e `examples/js/utils/SkeletonUtils.js`. Il PO aveva indicato «licenza MIT come Three.js»: la LICENSE lo conferma per il pacchetto.
   - **CH38.** `CLIP_REGISTRY.md` non nomina il CH38 né `footballer*.glb`. L'attribuzione a Mixamo del CH38 è in
     `docs/LIVE_MATCH_ENGINE_ANALYSIS.md` riga 268 («`footballer.glb` (CH38 Mixamo)») e in CLAUDE.md. L'ho aggiunta come fonte
     nel documento. `cgtrader-clip-po.glb` in `CLIP_REGISTRY.md` riga 53 contiene clip `mx-*`, che lo stesso registro dà come FBX Mixamo.

2. **«Senza riga licenza».** «Regular Male» e i ritratti OpenAI mostrano autore e provenienza, senza riga «Licenza» e senza
   «Non posso confermarlo». Ho applicato la stessa regola alle due voci nuove con Licenza «—» nel documento (effetti
   Web Audio, icone e grafiche). «Non posso confermarlo» in grigio resta solo dove lo dice il documento: autore del Mixkit
   3022 e licenza esatta di Avataaars. Conteggio nella finestra: 2 (erano 4).

3. **File d'origine non confermata.** Non sono nei Crediti, restano da chiarire: `assets/avatar-0..11.png`,
   `assets/hero-highlight-portrait-v1.*`, `assets/hyper-casual-korward-*.glb`, `assets/hair-colors/`,
   `assets/korward-regular-anims/`, `assets/portraits/`. Non posso confermarne l'origine.

## Guardiano `crediti-254`

- `ATTESI` passa da 11 a 16 righe (le cinque nuove, nell'ordine del documento).
- Nuovo controllo 4: le voci `SENZA_LIC` («Regular Male», «Ritratti delle figurine», «Web Audio», «Icone dell'app») non devono
  contenere «Licenza:» né «Non posso confermarlo». Le voci `CON_NC` («Mixkit 3022», «Avataaars») devono contenere il grigio.

## Esiti (eseguiti in questo turno, sul build ricomposto)

| Passo | Esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` | ricomposto da 21 frammenti, 7211555 byte |
| `node tools/check-src.mjs` | ✓ identico byte per byte |
| `crediti-254` verde | ✅ uscita 0. 360 px: pulsante 347/347, 16 voci, 0 da completare, 2 non confermabili, orizzontale 0/0. 412 px: 394/394, stessi numeri |
| `crediti-254` rosso (`CPM_ROSSO=__CPM_NO_CREDITI254`) | ❌ uscita 1: pulsante assente, 7 «Fonte da completare», voci del documento mancanti, controlli 4 rossi |
| `crediti-254` sul build del giro 25 (`72ffe74`) | ❌ uscita 1: le cinque voci nuove mancano; «Regular Male» e ritratti mostrano la riga Licenza |
| `design-system` | ✅ SISTEMA GRAFICO OK |
| `node tools/audit-copyright.mjs` | ✅ uscita 0, «nessun riferimento al mondo reale» |
| `griglia-mobile` | ✅ uscita 0, 65 scatti, testo fuori colonna 0 su tutte le larghezze. «NON misurato: prepartita: playMatch → nomatch» è già nel report committato (preesistente). Le foto e il report che la sonda riscrive in `docs/collaudo-grafico/g0/` non sono stati committati |
| `test:logic` | ✅ 43/43 |
| `save-compat` | ✅ 12 pass · 0 fail |
| `career-critical` | ✅ 11/11 passi (recovery-competition · save-monotonic · playing-mdref · double-tap · stale-matchday · playedmd-registry · career-invariants · pending-mr-durable · cup-final-replay · coppa-nazioni · coppa-intera), lanciati uno per uno in due gruppi con gli stessi comandi dello script npm |

Non eseguiti: il gate 14/14 e la catena completa. Il turno ha toccato solo i Crediti (testo e grafica della home), quindi vale
la catena «solo grafica» della direttiva PO del 22/09, eseguita tutta qui sopra.

## Foto (`docs/sviluppo/foto-giro25b/`)

`home-{360,412}.png` · `crediti-{360,412}-{1,2,3}.png`. Sono tre scatti per larghezza, scorrendo la finestra dall'inizio alla
fine, così si vedono tutte le 16 voci. Foto della home **senza carriere salvate**.

## Fuori ambito

- `GAME_VERSION`, roadmap e `BACKLOG.md` non sono stati toccati, perché non è un rilascio. Nessun push su `main`.
- L'avviso di copyright di Rocketbox: vedi il punto 1. Non posso confermarlo.
