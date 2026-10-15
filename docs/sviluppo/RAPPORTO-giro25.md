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
