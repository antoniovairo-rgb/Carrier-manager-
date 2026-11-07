# RAPPORTO — giro 109 · PO-312 «spalti 2D coi colori dei club» (correttiva 7.999.181)

Ramo `sviluppo/giro109-spalti`, da `lavoro/181` (21a7dc7 = `main` = 7.999.180). Decisione PO 07/11 «Solo spalti, subito».
`GAME_VERSION` e `docs/governo/*` **non toccati** (li aggiorna la sessione madre). Sessione figlia: nessuna decisione di
prodotto; le scelte prudenti fatte sono elencate in fondo.

## Il difetto (foto PO `docs/collaudo-po/180-partita2d-spalti-merseyside.jpg`, ramo `poc/marioprada-character-system`)

Telefono, partita 2D, FC Merseyside (#dc2626) contro FC Craven (#f5f5f5/#0f0f0f), 5'. Tribuna blu notte con puntini bianchi
e grigi, cartelloni bianco/blu/notte: **il rosso del Merseyside non c'è**.

## Causa misurata

Letta la tavolozza che `_spalti297` (src/15) restituisce per MER in casa contro CRA: `casa: ["#f5f5f5","#a5a7ae","#e5e7eb"]`,
`osp: ["#9f9f9f","#7c7c7c","#828488"]`. Tre cause, tutte nel codice del giro 92:

1. **La regola di leggibilità `colori286` (contrasto ≥ 3:1) applicata a dei puntini.** Sul fondo dei gradoni `#26324a` il rosso
   `#dc2626` fa **2,6:1** → scartato, al suo posto il secondo colore (bianco). Il «secondo colore» del bianco è poi un grigio.
   Gli ospiti CRA (bianco, troppo vicino al bianco di casa) finiscono su varianti grigie. La regola è giusta per un TESTO, non
   per un tifoso: un puntino deve solo staccarsi dal fondo.
2. **Terza tinta fissa `#e5e7eb`** (bianco) per i tifosi di casa di ogni club: estranea a chi non ha il bianco.
3. **Cartelloni** `[casa0,"#0f172a","#f1f5f9",casa1,"#1d4ed8","#0f172a"]`: blu `#1d4ed8` e notte fissi, estranei a entrambi i club.
   E il fondo `#26324a` è un blu saturo (saturazione 0,49), da cui il «blu notte» della foto.

## Come è misurato — guardiano nuovo `npm run spalti-109` (`tests/visual/spalti-109.mjs`)

Monta il **Campo2D vero** (stessa funzione della partita) coi colori che la partita gli passa (`selectMatchKits` sulla coppia
vera casa/ospiti → `homeShirt/homeAccent/awayShirt/awayAccent`), in una tela della taglia della partita, dpr 2, su **sette
coppie di club veri** × **tre formati** (360x800 e 412x915 a tocco, 1440x900 a mouse):

| coppia (casa v ospiti) | famiglia |
|---|---|
| MER v CRA, CRA v MER | rosso / bianco — la coppia del PO, nei due versi |
| WLV v TYN | giallo-oro / nero |
| VEL v CAL | azzurro / verde |
| WOL v FFT | verde / nero-rosso |
| TYN v SLN | nero / giallo |
| HAR v ACR | bianco / rosso |

Ogni pixel della tribuna (fuori dall'erba esterna e dai cartelloni) e dei cartelloni va alla famiglia più vicina in distanza
redmean, con lo «smiscelamento» dei puntini sfumati (base + a·(colore − base), anche scuriti dalla luce degli angoli):
**CASA** = colori sociali del club di casa (c, c2) e della divisa che indossa; **CASA principale** = c / maglia; **OSPITI** =
idem; **BASE** = fondo scuro; **ALTRO** = il resto. Nello spicchio ospiti, a parità, vince la famiglia ospite (il bianco è sia
il secondo colore MER sia il primo CRA).

**Criterio** (fissato dopo la misura della 180, quote fra i pixel colorati, base esclusa):

- **T1** tribuna di casa: CASA ≥ 55%, CASA ≥ 2× OSPITI, colore **principale** di casa ≥ 30% (esenti i club col primo colore
  quasi invisibile sul fondo, < 1,6:1 — nero, blu notte: dichiarato nella riga, oggi TYN);
- **T2** settore ospiti: OSPITI ≥ 55%;
- **T3** tifosi estranei (ALTRO) ≤ 25%;
- **T4** cartelloni estranei ≤ 20%;
- **T5** fondo dei gradoni scuro e neutro: luminanza ≤ 0,06, saturazione ≤ 0,45.

E una fase **partita vera** (salvataggio `fixtures/save-194-primavera-w38.json`, strada di `partita2d-297`) per i rilievi del
punto 3, su 360x720 · 412x830 (telefono con barra di stato e di navigazione, come quello del PO) · 360x800 · 412x915.

## Prima / dopo (misurato sul build finale)

Coppia del PO, MER in casa contro CRA:

| formato | | casa | **principale (rosso)** | ospiti nello spicchio | estranei tribuna | cartelloni estranei | fondo |
|---|---|---|---|---|---|---|---|
| 360x800 | prima (`__CPM_NO_G109`) | 89% | **0%** | 98% | 3% | 17% | #26324a sat 0,49 |
| 360x800 | dopo | 94% | **66%** | 97% | ≤ 3% | 2% | `TINTE.tasto` #262b37 |
| 412x915 | prima / dopo | 93% / 95% | **0% / 69%** | 100% / 100% | | 17% / 4% | |
| 1440x900 | prima / dopo | 99% / 100% | **0% / 70%** | 100% / 100% | | 16% / 4% | |

Su tutte le 21 misure (7 coppie × 3 formati): **verde 21/21 nel criterio, rosso 21/21 fuori criterio** (coppia del PO compresa
in ogni formato). Il colore principale di casa passa da 0-2% a 66-70% su MER e WOL; WLV 38-45% → 63-70%. ⚠️ Nel settore ospiti della coppia
del PO il rosso misura già 98-100%: lì il classificatore conta come «ospiti» anche i grigi della 180 (vicini al bianco/nero
CRA), quindi T2 non separa su questa coppia — separa su CRA v MER e WOL v FFT. Righe
complete in `tests/visual/out/spalti-109.json` dopo ogni giro.

⚠️ Detto onestamente: **T4 da solo non separa** i bracci (nel rosso i cartelloni stanno a 16-17% di estranei, sotto la soglia
20%: il notte `#0f172a` viene contato vicino al nero degli ospiti CRA). A far cadere il rosso sono T1, T2 e T5. Il criterio sui
cartelloni resta come guardia sulla direzione giusta, non come prova.

Foto in `docs/sviluppo/foto-giro109/`: `prima|dopo-{t360,pc}-{liv-ful,wol-new,wob-fra}.png` (tre coppie, telefono e PC, tela
del Campo2D vero montata sopra la home) e `prima|dopo-partita-{t360c,t412c,t360,t412}.png` (partita vera).

## La correzione (src/15, solo disegno, rosso `__CPM_NO_G109` = la 7.999.180)

`_spalti297` delega a `_spalti109` quando l'interruttore è spento:

- i tifosi portano **maglia e secondo colore del club così come sono**; solo un colore che non si stacca dal fondo (< 1,6:1:
  neri, blu notte) si schiarisce tenendo la tinta;
- se la maglia è quasi invisibile e il secondo colore è vero e visibile (FC Frankfurt nero/rosso), la maggioranza porta il
  **secondo** colore e il nero schiarito resta seconda tinta (settore ospiti FFT a WOL: rosso 28-44%, con la sola regola della maglia 47-53%, dopo 77-81%);
- terza tinta = la maglia più scura, **mai** un bianco inventato;
- ospiti col colore di casa (rosso contro rosso): nel loro spicchio vince il loro secondo colore, se diverso;
- fondo dei gradoni = token **`TINTE.tasto`** (#262b37, scuro e poco saturo: tema unico, il campo resta l'unica cosa chiara);
- tifosi un po' più grandi (lato 0,60 del passo, era 0,46) e pesi 44/26/18%, 12% posti vuoti invariati;
- cartelloni = `[casa, fondoClub106(casa), secondo, fondoClub106(secondo), casa, ospiti]` (la regola del giro 106 per smorzare
  il colore sociale verso la notte).

Il campo, le pedine, il prato, le righe e il lampo del gol non cambiano (il lampo legge già le tinte da `SP`). Costo: lo
sfondo è disegnato una volta, come prima.

## I due rilievi della stessa foto (punto 3)

1. **Sigla «CRA» sopra la porta che sporge sotto la barra Statistiche/Pagelle — CORRETTO** (banale e sicuro: solo la quota di
   disegno). La sigla sta 3,6 m oltre la linea di porta, che sui telefoni con viewport corto cade dentro il margine riservato
   alla barra (`_t12`). Riprodotto: **360x720 sporge 6 px, 412x830 8 px** (360x800 e 412x915 no, hanno 16-24 px di spazio
   libero, ecco perché il collaudo non l'aveva visto). Ora in verticale la sigla si tiene fra `_t12` e `H − _b12`. Rosso
   `__CPM_NO_G109_ETI`, giudicato dalla fase partita di `spalti-109` (verde 0 px su 4 formati, rosso sporge su 2).
2. **«Vairo» e «Nash» sovrapposti sopra il pallone — CORRETTO, ma non provato dal vivo.** Il cognome del portatore e quello
   dell'eroe, quando i due sono vicini, finiscono nello stesso rettangolo e l'eroe (disegnato dopo) copre il portatore. Ora, se
   i due rettangoli si toccano, il portatore porta il nome **sotto** il suo pallino; se si toccano anche così vince il nome
   dell'eroe. Solo disegno, rosso `__CPM_NO_G109_NOMI`, testimone `__CPM_NOMI109` (conta disegni, «vicini», saltati).
   ⚠️ **Non posso confermare l'effetto sulla scena del PO**: dipende da dove sono i giocatori, e nelle partite della sonda il
   caso «vicini» non si è presentato (`vicini` assente nel testimone su 4 formati). Il codice è letto e la regola è semplice,
   ma non c'è una prova pixel; va guardato al prossimo collaudo dal telefono.

## Rituali (in sequenza, un controllo alla volta, `CPM_CI_PAR=0`, build finale)

Vedi tabella in fondo, aggiornata a catena chiusa.

## Scelte prudenti (sessione figlia, nessuna decisione di prodotto)

- Soglia di «staccarsi dal fondo» a 1,6:1 per i tifosi (non 3:1): un puntino non è un testo. I testi non cambiano.
- Il settore ospiti resta dov'era (spicchio in alto a destra in verticale): spostarlo è una scelta di regia, non presa.
- Club scuri (TYN nero/bianco in casa): la tribuna è soprattutto bianca col nero schiarito; il nero puro su un fondo scuro non
  si vede. Dichiarato come esenzione di T1, non nascosto.
- Nessun bump di versione, nessuna riga di roadmap (sessione madre).
