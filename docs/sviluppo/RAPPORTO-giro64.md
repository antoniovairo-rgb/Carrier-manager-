# Rapporto giro 64 — grafica e cerimonie (PO-061 · PO-276 · PO-071 resto · PO-002 · PO-137)

Ramo `sviluppo/grafica-cerimonie-giro64`, base `lavoro/172` (7.999.172, commit 46cdcdc). Toccati `src/10`, `src/12`, `src/13`,
`src/15`, `src/18` (solo grafica, regia dell'ingresso e cerimonia; niente motore di partita, carriera, economia, zona G).
GAME_VERSION e SAVE_VERSION invariati (li scrive l'integrazione). Nessun asset nuovo: tutto procedurale (canvas + geometrie base).
Riga di ROADMAP e stato BACKLOG: non scritti da qui (come i giri 47/48), proposta in §8.

Interruttori rossi nuovi: `__CPM_NO_ING276` · `__CPM_NO_ADK064` · `__CPM_NO_ETI071` · `__CPM_NO_PALCO064`.
Guardiani nuovi: `npm run ingresso-276`, `npm run stadi-064` (+ `stadi-064:rosso`), entrambi nella MAPPA (`src/12-|src/13-`).

## 1. PO-276 — ingresso: fotogrammi a campo vuoto (FATTO) e file lontane (misurato, invariato)

Strumento: `tests/visual/ingresso-276.mjs` — percorso vero (salvataggio `save-190-s12-ovr93` → partita → walkout), **GLB acceso**,
412×915, ora congelata (`CPM_TOD`). Ogni 150 ms legge il tempo di scena dell'ingresso (`__CPM_WALK245`, ingresso accorciato del
giro 54 = 23,96 s) e proietta i 22 + l'eroe sulla camera vera: quanti calciatori sono nel quadro e quanto sono alti (frazione
dell'altezza dell'immagine, adimensionale).

**Causa misurata.** La regia (giro 23/46) ha tre tempi: bocca del tunnel 0–3,2 s, orbita a 360° 3,2–12 s, poi accompagnamento e
carrellata finale. Nell'orbita lo sguardo andava alla **tribuna opposta** mentre la colonna usciva alle spalle o di lato alla camera.

**Correzione** (`src/12`, ramo `prog<0.85` della camera dell'ingresso): stessa orbita, stessa quota per tipologia, stessi tempi; lo
sguardo punta per il 75% al **baricentro della colonna che entra** (eroe + corpi visibili, ciclo senza allocazioni), quota 2,6. La
camera sta fuori e guarda dentro, quindi dietro ai calciatori la tribuna opposta resta in quadro (richiesta 6.89.0 «tutto lo stadio»
rispettata).

| finestra di scena | misura | rosso `__CPM_NO_ING276` (giorno · notte) | verde (giorno · notte) |
|---|---|---|---|
| 0–3,2 s (tunnel) | campioni con 0 calciatori | 2,5% · 1,6% | 1,6% · 1,4% |
| **3,2–12 s (orbita)** | **campioni con 0 calciatori** | **74,8% · 75,4%** | **0% · 0%** |
| 3,2–12 s | calciatori medi nel quadro | 4,0 · 3,9 | 16,7 · 16,4 |
| 3,2–12 s | altezza apparente mediana | 0 · 0 | 0,033 · 0,036 |
| ultimi 4 s (fila) | altezza apparente mediana | 0,065 · 0,065 | 0,065 · 0,065 |

(prima misura sul build di partenza, braccio verde senza correzione: orbita 74,6% vuota, coda 0,065 — coincide col rosso.)

Guardiano `npm run ingresso-276`: verde se nei primi 12 s la quota «vuoto» è ≤ 10% e a fine ingresso la fila ha altezza mediana
≥ 0,045; rosso deve violare almeno una delle due. Esiti: `✅ ingresso-276 verde … e il rosso si vede` (giorno e notte).

**File lontane:** la carrellata finale del giro 54 dà 0,065 (la fila è alta il 6,5% dello schermo). **Non l'ho cambiata**: il giro
54 l'ha già avvicinata e non ho un riferimento del PO per dire che 0,065 è ancora «lontano». Vedi decisione D3.
Nota: durante l'orbita i calciatori sono piccoli (0,033–0,036): ci sono, ma in campo lungo.

Foto (`foto-giro64/ingresso-{rosso,verde}-{day,night}-{1,5,9,22}s.jpg`): a 9 s il rosso mostra prato e tribuna vuoti, il verde le
due file in cammino con la tribuna dietro.

## 2. PO-071 resto — etichetta della tipologia e cartelloni per tipologia (FATTO)

**Etichetta** (`src/10` `stadiumKindLabel`, rosso `__CPM_NO_ETI071`): «Campo di paese» · «Catino» · «Storico in mattoni» · «Arena».
Solo dove l'impianto ha un'architettura propria (`kind` del giro 46); gli altri template non ricevono etichetta (un nome generico
sarebbe rumore). Mostrata in due posti: **MatchdayCard** (sotto il nome dello stadio, in entrambe le impaginazioni, sorgente
`crowdCtx.stadiumTpl.kind` = lo stesso impianto costruito in 3D) e **schermata Club → fisarmonica «Stadio»** (sotto il nome).

**Cartelloni** (`src/12` `_mkBrandTexK064`, rosso `__CPM_NO_ADK064`): stessi marchi di fantasia e stessa lingua di chi ospita, ma
la fattura segue la tipologia — borgo: insegne dipinte su legno (fondo chiaro, assi, cornice marrone, caratteri con grazie,
**materiale illuminato dalla scena**, non LED); mattoni: smalto d'epoca (verde/blu/bordeaux scuro, doppia cornice crema,
illuminato); arena: LED pregiato (nero, scritta col bagliore, bande nel colore del club); catino e template storici invariati.

Misura (`npm run stadi-064`, notte, tipologia forzata, 23 cartelloni a bordo campo):

| tipologia | verde: materiale · luminanza media texture | rosso: materiale · luminanza |
|---|---|---|
| borgo | 23 illuminati · 0,741 | 23 LED · 0,394 |
| mattoni | 23 illuminati · 0,238 | 23 LED · 0,394 |
| arena | 23 LED · 0,161 | 23 LED · 0,394 |
| catino | 23 LED · 0,394 | 23 LED · 0,394 |

Verde: `✅ PASS stadi-064`; rosso: `✅ ROSSO come atteso` (quattro firme identiche, nessuna etichetta, nessun fondale).

Foto GLB-ON 412×915 dietro la porta (`foto-giro64/cartelloni-<tipologia>-<ora>-<prima|dopo>.jpg`): mattoni e arena di notte
leggibili e diversi da prima. ⚠️ **Giudizio onesto:** la differenza si vede ma è contenuta (a distanza di camera il cartellone è
una striscia sottile); e nelle foto le tribune paiono uguali fra tipologie forzate — l'inquadratura di collaudo guarda il solo
bordo campo. Alcune foto «dopo» non sono state scritte (sonda fermata dal tetto di 10 minuti mentre girava `career-critical`):
vedi «Non verificato».

## 3. PO-002 / PO-137 — palco della premiazione di squadra (FATTO il fondale; resto già del giro 47)

Stato trovato: il giro 47 aveva già il capitano che alza la coppa e la **passa** all'eroe (beat `pass`, rosso
`__CPM_NO_PASSA137`), le sequenze diverse per campionato/coppa/Nazionale (rosso `__CPM_NO_VARIA137`) e uno striscione col nome
della competizione: un piano 6×1,1 su due pali sottili, che da vicino si legge come un cartello.

Correzione (`src/12`, rosso `__CPM_NO_PALCO064`): **fondale da premiazione** — parete con spessore 7,4×3,3, pannello col nome
della competizione in grande con alone oro, tre stelle, filetto, riga «CAMPIONI/VINCITORI · STAGIONE N», doppia cornice oro, due
colonne di luce ai lati e cimasa. Una sola texture 1024×448, nessun asset. Testimone `__CPM_PALCO064` (solo `cpmtest`):
misurato `{nome:"COPPA DI LEGA", sub:"VINCITORI · STAGIONE 1", w:7.4, h:3.3}`; col rosso assente.

**Branch `wip/cerimonie-differenziate` — valutato, NON unito.** Il suo unico commit (d818261f, 30/09, base 7.999.83) differenzia le
sequenze per competizione con `__CPM_NO_CERDIFF83`; il giro 47 (già nella 172) ha fatto la stessa cosa con `__CPM_NO_VARIA137` e
il guardiano `cerimonie` ha già i rossi `CPM_ROSSO=__CPM_NO_VARIA137`/`__CPM_NO_PASSA137`. Il ramo non ha base comune con la
storia attuale (`git diff lavoro/172...wip` → «no merge base») e il suo cambio tocca la stessa riga dei copioni `_team23`:
unirlo riscriverebbe le sequenze del giro 47. Decisione D1.

## 4. PO-061 — kit (misurato; nessuna correzione spedita)

Provino `provino-kit061.mjs lod2` primo piano (`foto-giro64/g64-prima-lod2-vicino.jpg`): sulle maglie si vedono sbavature
chiare irregolari (scollo, fine manica, orlo) anche sulle tinte unite.

1. **Ipotesi «pixel fuori dall'isola UV col fondo chiaro» — SMENTITA dalla misura**: ho riempito col colore della maglia ogni
   pixel non coperto dal corpo e contato quanti cambiavano: **0** su tutte le maglie tranne la banda verticale (26,2%, dove il
   fondo è il secondo colore). Foto dopo identica alla prima (`g64-dopo-lod2-vicino.jpg`). Correzione **ritirata** (No Blind Fix).
2. **Diagnosi**: nascondendo ogni mesh non-«Hyper» (`CPM_DIAG=pelle`) le sbavature restano → non è il corpo che buca. Sono i
   **polsini e il collo a contrasto** del giro 48 (soglia sull'altezza della manica/scollatura, frastagliata sulla geometria
   povera del lod2) e i **pantaloncini bianchi** visibili all'orlo.

Non ho corretto: serve una scelta (D2). Il kit resta quello del giro 48 (guardiano `kit-061` invariato).

## 5. Rituali (build di questo ramo)

| Passo | Esito |
|---|---|
| `test:logic` | verde, 43 pass · 0 fail |
| `save-compat` | verde, 12 pass · 0 fail |
| `design-system` | verde («SISTEMA GRAFICO OK», nessun raggio a mano) |
| `griglia-mobile` | verde, overflow 0 px a 360/375/390/412/430 su tutte le schermate; «prepartita non misurato» è preesistente (identico nel report di HEAD). Scatti rigenerati NON committati |
| `career-critical` | verde, exit 0, zero ❌ |
| `validate-situations` | verde, `✅ PASS`, fingerprint 00001505, 0 failure |
| `audit-copyright` | verde, 0 riferimenti al mondo reale |
| `cerimonie`, `stadi-071`, `ingresso-277` (verde+salta, rete del banco) | verdi (MAPPA) |
| `ingresso-276` (nuovo) | verde + rosso visibile, giorno e notte |
| `stadi-064` (nuovo) | verde; rosso visibile |

Guardiani della MAPPA per `src/12-|src/13-` (60+ voci), `src/15-`, `src/10-|src/18-`: **non eseguiti tutti** (vedi sotto).

## 6. Non verificato

- **Foto mancanti**: `cartelloni-mattoni-day-dopo` e `cartelloni-arena-day-prima` (lo screencast non ha consegnato fotogrammi in
  due giri). Presenti: borgo giorno/notte prima-dopo, mattoni e arena notte prima-dopo, palco giorno/notte prima-dopo
  (`palco-*.jpg`, camera di collaudo puntata sul fondale: prima la striscia «COPPA DI LEGA» sui pali, dopo il fondale con stelle,
  alone e «VINCITORI · STAGIONE 1»).
- Etichetta della tipologia **non fotografata** nella MatchdayCard né nella schermata Club: verificata la funzione (guardiano) e
  il passaggio della prop; `griglia-mobile` fotografa Club con la fisarmonica Stadio e resta a overflow 0, ma il club del
  salvataggio di prova potrebbe non avere una tipologia propria. Non posso confermare la resa a schermo.
- Guardiani della MAPPA non eseguiti: tutti tranne quelli in §5 (in particolare `ingresso-245`, `ingresso-camminata-245`,
  `stadi-071-ingresso`, `kit-061`, `partita-vera`, `fps-249`; `ingresso-277` senza i bracci rosso e salta-secco).
  La correzione dell'ingresso cambia solo il punto guardato nell'orbita (non posizioni, tempi o velocità), ma non l'ho provato.
- Costo sul telefono: cartelloni con materiale illuminato (borgo/mattoni) e una texture in più per il fondale: non misurato in fps.
- Collaudo del PO sul dispositivo: passaggio della coppa (PO-002 «Non ancora, la provo»), leggibilità dei cartelloni.

## 7. Decisioni per la sessione principale

**D1 — `wip/cerimonie-differenziate`.** (a) **non unirlo e archiviarlo** — superato dal giro 47 *(consigliata)*; (b) recuperare
solo la sonda fotografica `_cer83.mjs` come strumento; (c) unirlo risolvendo il conflitto sui copioni (rischio di regressione sul
passaggio della coppa).

**D2 — rifiniture del kit sul lod2 (PO-061).** (a) **collo e polsini solo su lod0/lod1**, lod2 a tinta pulita (a distanza i
polsini sono 1-2 pixel e sul lod2 diventano macchie) *(consigliata)*; (b) bordo dei polsini/collo levigato con una soglia per
angolo come per la scollatura; (c) lasciare così e chiudere PO-061 col collaudo del PO.

**D3 — «file lontane» a fine ingresso (PO-276).** (a) **chiudere PO-276 col collaudo sul telefono** (oggi 0,065 dell'altezza
schermo) *(consigliata)*; (b) avvicinare ancora la carrellata finale (es. obiettivo 0,09) col rischio di tagliare la coda della fila.

## 8. Proposta di riga per BACKLOG/ROADMAP (per l'integratore)

PO-276 «campo vuoto nell'orbita 74,8% → 0% (guardiano `ingresso-276`), file a fine ingresso invariate 0,065: da collaudare»;
PO-071 «etichetta della tipologia (MatchdayCard, Club) e cartelloni per tipologia (guardiano `stadi-064`)»; PO-002/PO-137
«fondale del palco col nome della competizione»; PO-061 «lod2: misurata la causa delle sbavature (polsini/collo), decisione D2».
