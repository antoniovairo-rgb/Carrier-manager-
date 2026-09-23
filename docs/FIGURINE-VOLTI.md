# Le figurine — il contratto dei volti

> Direttiva PO, 22/09/2026: «Inizia a predisporre lo spazio dei volti rettangolari in verticale, sto
> predisponendo con il team codex delle figurine stile panini con i volti dei giocatori, mister,
> avversari, intervistatori, giornalisti, ecc.»

Questo documento è **il contratto fra chi disegna e chi monta**. Il gioco ha già lo SPAZIO (7.966): i
riquadri sono al loro posto, col rapporto giusto, e mostrano un ripiego finché l'arte non arriva.
Quando arrivano i file, **non si tocca una sola schermata**: si pubblica il manifesto e le figurine
compaiono.

---

## 1. Il formato

| voce | valore | perché |
|---|---|---|
| **rapporto** | **5 : 7 verticale** (0,714) — **CONFERMATO DAL PO il 22/09: «rapporto va bene adesso»** | è il rapporto della figurina da album, 50×70 mm |
| consegna **2x** | **320 × 448 px** | copre ogni riquadro del gioco su schermo a densità 2 |
| consegna **4x** | **640 × 896 px** | telefoni a densità 3-4 (l'Android del PO è in questa fascia) |
| formato file | **webp** (png accettato) | peso: il gioco è un file unico, ogni KB si paga all'avvio |
| peso per figurina | **≤ 30 KB a 2x** | 200 volti × 30 KB = 6 MB, già quanto pesa tutto il gioco oggi |

Il rapporto vive in **un posto solo** nel codice (`const FIG={w:5,h:7,…}`). **Il PO l'ha confermato il
22/09** — quindi è questo il formato su cui disegnare: 5:7 verticale, consegne a 320×448 e 640×896.
(Se un domani dovesse cambiare, si cambia quella riga e **tutte** le figurine del gioco seguono.)

## 1-bis. Cosa c'è DENTRO l'arte (dalla figurina d'esempio del PO, 22/09)

L'esempio ricevuto mostra che la figurina è **completa in sé**: cornice granata con gli angoli ornati,
**KORWARD** in alto, il ritratto, e in basso la **fascia col nome** (`MATTEO RINALDI`) più la riga
`ATTACCANTE · 24 ANNI`. Da qui due regole del riquadro, già in codice:

1. il riquadro monta l'immagine con **`object-fit: contain`**, non `cover`: ritagliare anche solo il 3 %
   dell'altezza taglierebbe la fascia col nome, che sta a filo del bordo inferiore. Il fondo del riquadro
   è bianco, quindi un eventuale margine di `contain` è invisibile;
2. il riquadro **non sovrappone più nulla** quando l'arte c'è — niente fascia del nome del componente,
   niente banda colorata in alto: sarebbe un secondo nome sopra il primo.

> ⛔ **SUPERATO dall'handoff del 22/09 sera — ed era un errore mio.** Il PO ha girato
> `tests/character-lab/FIGURINE_MERGE_HANDOFF.md` (ramo `poc/marioprada-character-system-local`), che dice
> l'opposto e ne spiega il motivo: **«Marco Rinaldi e il suo ruolo sono soltanto testo dimostrativo»** —
> il file che avevo letto come specifica è un **mock-up**. La regola vera è:
> **nome, cognome e ruolo li fornisce IL GIOCO**, dai dati di carriera; il catalogo dei volti «non deve
> inventare né conservare nomi, ruoli, statistiche o biografie», e non si scrive sulla figurina
> «carnagione, statura o altre caratteristiche tecniche».
> **Cosa cambia in codice**: la fascia col nome del componente torna a disegnarsi **anche quando l'arte
> c'è** (prima la sopprimevo per non fare «un secondo nome sopra il primo» — ma quel primo nome non
> esisteva, era il mock-up). `object-fit: contain` **resta**: serve comunque a non tagliare la cornice.
> **Rischio oggi: zero**, perché in produzione non è montata nessuna arte (volti resi = 0).

Corollario per chi disegna, **nella versione corretta**: sull'arte vanno **cornice, marchio e ritratto**;
**il nome e il ruolo li stampa il gioco** sopra la fascia bassa. Chi disegna deve quindi lasciare
quell'ultima fascia **leggibile e libera**, non riempirla di testo.

⚠️ **Da confermare**: l'esempio sembra leggermente più alto del 5:7 (≈ 0,69 contro 0,714). Non ho il file
sorgente, solo l'immagine in chat, quindi non posso misurarlo al pixel. Serve **la dimensione esatta in
pixel** del file (o il file stesso in `assets/volti/`): con `contain` la differenza non rompe niente, ma il
rapporto dichiarato deve essere quello vero.

## 2. L'inquadratura

```
┌──────────────┐  ← margine di sicurezza 6% per lato:
│   ╭──────╮   │    la cornice arrotonda gli angoli e ci mette
│   │      │   │    un velo in alto — niente di importante lì
│   │  ◉  ◉│   │  ← OCCHI a ~38% dall'alto
│   │   ▽  │   │
│   ╰──┬───╯   │
│   ╱  │  ╲    │  ← spalle TAGLIATE dal bordo basso, mai sospese
└──────┴───────┘  ← fascia col nome: ultimo 18% coperto da un velo scuro
```

- **volto nel terzo superiore**, occhi a circa il **38 %** dall'alto: è l'allineamento che tiene
  quando le figurine stanno in fila (rosa, candidati procuratore, formazione).
- **spalle tagliate dal bordo basso**: una figura sospesa in mezzo al riquadro sembra un errore.
- **margine di sicurezza 6 %** per lato: il riquadro arrotonda gli angoli (`RAD.xs`, 6 px) e stampa
  in alto una banda col secondo colore del club.
- **fondo pieno o sfumato, MAI trasparente**: sopra ci va il velo del nome, e un fondo trasparente
  lascerebbe vedere il gradiente del riquadro attraverso il viso.

## 3. I nomi dei file

```
assets/volti/<tipo>/<chiave>.webp
```

- `tipo` ∈ `giocatore · mister · avversario · giornalista · arbitro · procuratore · dirigente`
- `chiave` = il nome della persona **normalizzato**: minuscolo, senza accenti, spazi → trattini,
  tutto ciò che non è `a-z0-9` → trattino, al massimo 48 caratteri.
  `"Andrea D'Amico"` → `andrea-d-amico` · `"Élena Greco"` → `elena-greco`

La stessa normalizzazione è nel codice (`_slugVolto`): se il file si chiama così, viene trovato.

## 4. Come si accendono (nessuna modifica alle schermate)

Il gioco cerca il volto in **due posti, in quest'ordine**:

1. **il manifesto** `window.__CPM_VOLTI` — un oggetto `{ "<tipo>/<chiave>": "<url>" }`:
   ```js
   window.__CPM_VOLTI = {
     "procuratore/elena-greco": "assets/volti/procuratore/elena-greco.webp",
     "mister/ruben-ortiz":      "assets/volti/mister/ruben-ortiz.webp"
   };
   ```
   È la via consigliata: si pubblica un file di manifesto e basta. Chi non è nel manifesto continua a
   mostrare il ripiego — **si può quindi consegnare l'arte a lotti**, senza aspettare che sia completa.
2. **niente**: finché non c'è manifesto il gioco **non chiede nulla alla rete** e mostra il ripiego
   (il volto tondo di oggi, dentro la cornice, su fondo col colore del club).

## 5. Dove sono già i riquadri (7.966)

| schermata | chi | larghezza |
|---|---|---|
| Agente · scheda del procuratore | procuratore | 40 px |
| Agente · i tre candidati | procuratore | 34 px |
| Agente · iniziativa e reminder | procuratore | 44 px / 28 px |

Gli altri ventidue punti in cui oggi vive un volto tondo (rosa, rivale, mister, giornalisti,
formazione, HUD di partita) si convertono **uno alla volta, con la loro misura** — la partita per
ultima, perché lì la catena dei rituali è quella completa.

## 5-bis. Il percorso è già provato (22/09)

Il contratto dice «basta pubblicare il manifesto e le figurine compaiono». Finché non arriva l'arte vera
quella è una **promessa**: ora è una **misura**. La sonda `tests/visual/figurina-percorso.mjs` accende il
manifesto con una carta di prova 5:7 (`fixtures/figurina-prova.svg`, stessa struttura dell'esempio:
cornice, marchio, fascia col nome a filo del bordo) e verifica quattro cose:

| controllo | esito |
|---|---|
| il riquadro monta davvero l'immagine (non il bianco) | **1/1** |
| il rapporto reso resta 5:7 — l'arte non si deforma | scarto **0,4 %** |
| il riquadro non sovrappone niente sopra l'arte | **0** |
| l'arte non viene ritagliata (`contain`, non `cover`) | **0** |
| errori di pagina | **0** |

```bash
CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node tests/visual/figurina-percorso.mjs
```

Quando arriva il primo lotto vero, questa sonda è il collaudo: se passa, l'arte è montata bene.

## 6. Il guardiano

La griglia mobile ha una tabella nuova, **9-sexies · lo spazio delle figurine**: conta le figurine per
schermata e registra lo **scarto peggiore dal rapporto 5:7**. Se qualcuno monta l'arte in un riquadro
storto, il numero lo dice prima del PO.

```bash
CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node tests/visual/griglia-mobile.mjs
# → docs/collaudo-grafico/g0/REPORT.md, tabella «9-sexies»
```

## 7. Cosa NON fa questa versione

- non porta nessun disegno: porta lo spazio e il contratto;
- non tocca la schermata dell'intervista, dove il PO ha chiesto **nessun volto** («togli i visi,
  lascia solo una scenografia 2D molto carina»): se e quando i giornalisti avranno la loro figurina,
  quella decisione la prende lui;
- non tocca l'HUD di partita.

---

## 9. L'handoff del team character-lab (22/09 sera) — quello che vincola ME

Fonte: `tests/character-lab/FIGURINE_MERGE_HANDOFF.md`, ramo locale `poc/marioprada-character-system-local`.
Riportato qui perché **cambia il contratto** scritto sopra. Quello che segue è il vincolo, non un commento.

**Lo stato reale del catalogo, da non gonfiare.** Esistono **40 ritratti 2D** in dieci fogli JPEG 2×2 sotto
`assets/portraits/`: 4 eroi, 12 compagni, 12 avversari, 12 figure di contorno. Esiste un **mock-up
statico** `tests/character-lab/previews/figurina-korward-marco-rinaldi.png`, 900×1260 (**5:7 confermato al
pixel**, finalmente: 900/1260 = 0,714). **Non esiste ancora una figurina dinamica pronta al merge.**
Quaranta volti **non sono mille**, le collisioni sono possibili e vanno evitate almeno dentro la stessa
rosa o la stessa scena; l'obiettivo dei mille resta aperto e non va raccontato come fatto.

**La chiave dell'identità cambia, e la ragione è buona.** Nel codice recuperabile il ritratto si sceglieva
con un hash del **nome visibile**. L'handoff chiede un **ID persistente salvato nella carriera**, perché
col nome «una rinomina cambierebbe il volto». **Questo tocca il mio `voltoUrl(tipo, chiave)`**, che oggi
semina proprio sul nome normalizzato (§4): va portato sull'ID, e l'assegnazione va **scritta nel
salvataggio** — quindi è un campo nuovo e passa da `save-compat`, non è una riga di stile.

**La persistenza è un requisito, non un desiderio**: la stessa identità deve tenere lo stesso volto in
profilo, dialoghi, interviste, cerimonie, premiazioni e scene degli highlight, **anche dopo salvataggio e
ricarica**. Un **cambio di club cambia la cornice, non il volto**. Mister, agenti, giornalisti e
giornaliste hanno diritto a un volto stabile come i calciatori; chi non ha club prende la **palette
Korward** invece dei colori sociali.

**Quello che NON si fa**: sostituire la sorgente corrente con la copia compattata di recupero
(`tests/character-lab/recovery/…/CARRIER-MANAGER-AV.compacted-before-recovery.html`) — da lì si recuperano
**solo le parti utili**, adattate e riprovate; **niente renderer WebGL in più nel live match** per le
figurine; **niente CH38, Quaternius o gesti scartati** riaccesi; **niente ZIP, file di ricerca o asset non
approvati** nel merge; **non si tocca `main` né la GitHub Pages principale** da quel ramo.

**Sul 3D**: i metadati visivi possono guidare carnagione, capelli, altezza e corporatura nel modello
CGTrader **nei limiti che quel modello supporta davvero** — e **non si promette** una corrispondenza
facciale esatta fra ritratto 2D e mesh 3D. Per l'eroe **vince sempre l'avatar scelto dal giocatore**: se
manca un ritratto coerente si usa il suo ritratto locale come ripiego.

**Prima di proporre il merge** vanno verificati: persistenza del volto, correttezza dei dati testuali,
cornice del club, leggibilità su mobile, **assenza di quadranti sprite sbagliati** (i fogli sono 2×2:
un ritaglio sbagliato mostra mezza faccia di un altro), coerenza minima con l'eroe CGTrader, e
**provenienza e licenza** degli asset. I quality gate di animazione, palla, transizioni e prestazioni
mobile **restano separati e aperti**.

---

## 23/09 13:52 — I 1000 VOLTI SONO NEL GIOCO (ramo POC, non in produzione)

### Come funziona
| Pezzo | Dove | Cosa fa |
| --- | --- | --- |
| Indice leggero | `assets/portraits/ai/indice.json` (69 KB, da `tools/ritratti/indice-volti.mjs`) | numero, file, età, carnagione e capelli (solo per l'eroe), in due gruppi: 930 giocatori, 70 staff. Il manifest completo (505 KB) non si scarica mai. |
| Caricamento | `_caricaVolti23` (src/01) | l'indice si scarica **una volta**; le immagini solo quando una figurina appare (`loading="lazy"`). Misurato: 7-9 ritratti scaricati in una sessione con dashboard, Club e intervista. |
| Assegnazione | `voltoId23(tipo, chiave)` | hash di tipo+chiave sul gruppo del tipo: **stabile per costruzione** (stesso attore → stesso volto dopo riapertura e caricamento). Gruppi disgiunti: giocatori/compagni metà A, avversari metà B; staff in fette per mister (30%), procuratori, giornalisti, arbitri, dirigenti. |
| Eroe | `player.voltoEroe` (salvato) · `voltoEroeId23` | scelto alla creazione fra i candidati coerenti con l'aspetto 3D (carnagione e colore capelli di AVATARS); senza scelta (salvataggi vecchi) il primo candidato. Il volto dell'eroe è **riservato**: nessun altro lo riceve. Le chiavi nome / «eroe-N» / «avatar-N» portano allo stesso volto. |
| Una persona, una faccia | `ScenaVolti23` | nella stessa scena, se un volto è già di un'altra persona, si passa al successivo del gruppo. Attivo in festa di fine partita, scelte in partita, premiazioni. |
| Figurina | `Figurina` → `FigurinaKorward23` | 5:7, cornice nei colori del club (col/col2), altrimenti colori del gioco; marchio KORWARD in alto; ritratto quadrato su fondo bianco; nome e ruolo come testo del gioco. Nessun dato impresso nell'immagine, carnagione mai mostrata. |

### Scene collegate (tutte quelle che già usavano `Figurina`)
Creazione (anteprima + griglia + «Altro volto») · testata della dashboard · slot di salvataggio · modale intervista (giornalista) · dialogo e scheda Club del mister · mister in panchina durante la partita (chiave allineata al nome del mister) · incontri, scheda e catalogo del procuratore · premiazioni · festa di fine partita · scelte in partita (mister, compagno, avversario, arbitro, eroe) · parata e presentazione 2D · transizione pro · fine stagione.

### Limiti dichiarati
- **Il catalogo non ha volti femminili segnati:** le giornaliste (`f:true`) restano col riquadro neutro, invece di ricevere un volto maschile.
- **3D:** il modello CGTrader ha pelle e volto fissi; la coerenza col ritratto passa solo da carnagione e capelli dell'aspetto scelto. Il volto 3D non è il ritratto.
- **Collisioni fuori scena:** due NPC dello stesso tipo possono condividere un volto se non compaiono mai insieme (probabilità ~1/465 per coppia); nella stessa scena la regola le separa.
- I 99 sfondi leggermente fuori soglia e le 3 possibili somiglianze del pilota restano nel catalogo, già tracciati nel manifest.
- Campo 2D, walkout 3D, gala e sala stampa non mostrano volti (scelta di prima, non toccata).

### Verifiche (sonde `tests/character-lab/figurine-verifica.mjs`, `figurine-creazione.mjs`, 412×915)
- Volto dell'eroe stabile dopo il ricaricamento; volto scelto (47) salvato e usato; riservato: 0 collisioni su 300 chiavi.
- Nella stessa scena due chiavi in collisione → volti diversi (89/91); fuori scena restano 89/89; rosso `__CPM_NO_SCENA23` → 89/89.
- Rosso `__CPM_NO_VOLTI23` → nessun ritratto e 0 richieste di rete.
- Creazione: 10 volti in griglia, «Altro volto» 18 alternative per l'aspetto.
- Guardiani: design-system verde · save-compat 12/12 · test logici 43/43 · career-critical verde.
- **Non verificato:** il telefono vero; le scene di fine stagione e festa aperte dal flusso reale (collegate per costruzione, non fotografate).


## Aggiornamento 23/09 sera — figurina completa (direttiva PO)

- **Il PO chiede altezza e peso sulla figurina**: supera la riga «non scrivere statura» dell'handoff del 22/09.
  Altezza e peso NON sono dati di carriera: si derivano dallo stesso aspetto che usa il corpo 3D
  (eroe: `_heroAppr`, altri: `appearanceFromSeed(hashStr(tipo/chiave))`), quindi sono stabili e coerenti col campo.
- Scheda completa da 96 px di larghezza: nome, COGNOME, ruolo (pastiglia nel colore del club), `cm | kg`.
  52-95 px: cognome e ruolo. Sotto 52 px: solo ritratto. In testata la miniatura si tocca e apre la figurina intera.
- Colori: eroe dal club (`__CPM_EROE23`), in partita compagni/avversari dalle maglie in campo (`__CPM_PARTITA23`).
- **Il sesso dei volti non è nell'indice.** I 70 volti dello staff sono stati classificati A VISTA: 40 uomini, 25 donne,
  5 incerti (esclusi). Il mister pesca solo fra gli uomini con età ≥ 52; «giornalista_f» fra le donne.
  I 930 volti dei giocatori non sono stati classificati (a vista sembrano tutti uomini: non verificato uno per uno).
