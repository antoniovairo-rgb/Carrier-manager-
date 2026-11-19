# Rapporto giro 291 — PO-550 «quando si intercetta il pallone l'eroe corre nella direzione sbagliata»

Ramo `sviluppo/giro291-intercetto`, partito da `lavoro/198` (abb83d5, gioco 7.999.197). `GAME_VERSION` non toccata.
File di gioco toccato: solo `src/12-three-match-view.jsx` (poi `node tools/build-src.mjs`).

## In breve

- **Il difetto c'è ed è misurato**: nelle scene difensive riuscite in cui il pallone resta all'eroe, l'eroe lo portava
  **verso la propria porta**: da 2 a 38 unità di corsa all'indietro in circa 4 secondi di scena, coseno con la retta
  eroe→porta avversaria fra −0,94 e −1. Scene colpite: **10 su 10** di quelle portate dall'eroe.
- **Non è nato nella 197**: la 7.999.196 (3076a1b7) dà lo stesso risultato sulle stesse scene (10 su 10).
  La causa è del giro 31 (PO-220): il «vincitore dell'esito» (`_post31`).
- **Causa** (letta dal testimone `__CPM_G291W`, che dice chi scrive il bersaglio dell'eroe): a scrivere è il vincitore
  dell'esito, col verso `_via31` = «lontano dal portatore battuto». Il portatore battuto sta davanti all'eroe (fra lui e la
  porta avversaria), quindi «lontano da lui» è la nostra porta. Verso misurato: (−1 ; 0) in tutte le scene sbagliate.
  Non c'entrano il punto di ripresa di `handleContinue`, la mira latchata `_aim517`, l'appoggio `_hold31` né il driver
  di formazione: nel tratto sbagliato lo scrittore è sempre e solo «vincitore-piede».
- **Correzione**: il verso dell'eroe vincitore è la **porta avversaria** (x crescente, z verso il centro della porta),
  ricalcolato a ogni fotogramma e inseguito con inerzia. La protezione del pallone voluta dal giro 31 resta come
  **scarto laterale**: finché il portatore battuto è davanti e vicino (entro 4,5 u lungo la corsa, 2,2 u di lato)
  l'eroe lo aggira dal lato scelto una volta sola. Rosso `window.__CPM_NO_G291` (torna al verso del giro 31).
- **Dopo**: 10 scene portate su 10 verso la porta avversaria (coseno 1, 34-37 u in avanti), 5 famiglie.
  Braccio rosso: 9 su 9 nella direzione sbagliata.

## Come si è misurato

Sonda e guardiano: `tests/visual/intercetto-291.mjs` (`npm run intercetto-291` = guardiano).
GLB acceso, `__CPM_PRESENT=1`, `__CPM_CINE=1` (sotto `?cpmtest=1` il vincitore dell'esito è spento senza questo),
tempo di scena reale (`__CPM_DTREAL`), **una pagina nuova per scena**.
16 scene difensive (SITUATIONS di tipo `def`) di 5 famiglie, forzate e risolte riuscite (`__CPM_FORCE_OUTCOME='success'`),
più partite vere dal salvataggio S12 (autoplay seedato, `__CPM_DIF220_OGNI`).

Per scena si leggono dal registratore del gioco (`__CPM_REC_BUF`) eroe e pallone fotogramma per fotogramma, e dal
testimone nuovo `__CPM_G291W` (solo sonde, armato da `__CPM_G291ON`, scrive in entrambi i bracci): chi scrive il bersaglio
dell'eroe (copione · esultanza · vincitore · vincitore col pallone al piede · appoggio · ordinario), il verso del vincitore,
il suo bersaglio, la posizione del portatore battuto, l'orientamento del corpo, il gesto attivo, l'esito.

- **Tratto «pallone al piede»** = fotogrammi dell'esito dopo l'arco con pallone entro 1,6 u dall'eroe.
- **Verdetto**: «avanti» se l'eroe si sposta di almeno 1 u con coseno ≥ 0,5 rispetto alla retta eroe→porta avversaria
  (entro 60°); «sbagliata» se si sposta ma col coseno sotto 0,5; «ferma» sotto 1 u; «non portata» se il pallone
  non resta all'eroe (lo prende un compagno o esce: non è la nota del PO).
- **Lato e tempo**: il campo di gioco è centrato sull'eroe, la sua squadra attacca sempre x crescente; alla ripresa gira
  lo stadio, non il verso (7.732). Verificato nelle partite vere coi portieri: nostro a x 5-6, loro a x 94-95 sia nel
  primo tempo sia al 49'. Quindi **il lato non cambia fra i due tempi** e la prova nei due tempi coincide.

## Tabella «196 / 197 prima / dopo» (scene forzate riuscite, spostamento dell'eroe col pallone al piede lungo x)

«197 prima» = braccio rosso `__CPM_NO_G291` sulla build del giro (stesso codice della 197 per costruzione); le prime tre
scene misurate anche sul codice vero della base prima della correzione: gi31 −28,6 u, gi32 −37,4 u, gi35 −19,3 u (uguali
al braccio rosso entro 0,2 u).

| gi | famiglia | azione (esito) | 7.999.196 | 197 prima | dopo |
|---|---|---|---|---|---|
| 31 | portatore | Scivolata netta (recovery) | sbagliata · −28,4 u · cos −1 | sbagliata · −28,4 u · cos −1 | avanti · +34,9 u · cos 1 |
| 34 | portatore | Pressing aggressivo (recovery) | sbagliata · −36,7 u · cos −1 | sbagliata · −37,5 u · cos −1 | avanti · +36,4 u · cos 1 |
| 127 | portatore | Contrasto duro sull'avversario (recovery) | sbagliata · −36,9 u · cos −0,98 | sbagliata · −37,2 u · cos −0,98 | avanti · +36,7 u · cos 1 |
| 168 | portatore | Tackle duro — rischio rosso (recovery) | sbagliata · −19,3 u · cos −1 | sbagliata · −19,4 u · cos −1 | avanti · +36,0 u · cos 1 |
| 54 | portatore | Pressing aggressivo (recovery) | sbagliata · −37,3 u · cos −0,99 | sbagliata · −37,6 u · cos −0,99 | avanti · +35,1 u · cos 1 |
| 131 | portatore | Fallo intelligente in zona (save) | non portata | non portata | non portata |
| 32 | linea di passaggio | Anticipo di posizione (recovery) | sbagliata · −38,4 u · cos −0,98 | sbagliata · −37,3 u · cos −0,98 | avanti · +36,9 u · cos 1 |
| 130 | linea di passaggio | Anticipo sulla traiettoria (recovery) | non portata | non portata | non portata |
| 155 | linea di passaggio | Anticipi la giocata avversaria (recovery) | non portata | non portata | non portata |
| 35 | rientro/copertura | Sprint di rientro (recovery) | sbagliata · −19,4 u · cos −1 | sbagliata · −19,4 u · cos −1 | avanti · +36,3 u · cos 1 |
| 133 | rientro/copertura | Sprint disperato sulla linea (save) | non portata | non portata | non portata |
| 135 | rientro/copertura | Copro la sua posizione (save) | sbagliata · −14,4 u · cos −0,99 | sbagliata · −14,4 u · cos −0,99 | avanti · +36,5 u · cos 1 |
| 33 | tiro in volo | Blocca con il corpo (save) | non portata | non portata | non portata |
| 45 | tiro in volo | Corpo sulla traiettoria (save) | sbagliata · −2,2 u · cos −0,96 | sbagliata · −2,1 u · cos −0,94 | avanti · +36,0 u · cos 1 |
| 36 | aereo | Stacco di testa (save) | sbagliata · −6,1 u · cos −1 | non portata | avanti · +33,8 u · cos 1 |
| 44 | aereo | Stacco di testa deciso (save) | non portata | non portata | non portata |

| | 7.999.196 | 197 prima (rosso) | dopo |
|---|---|---|---|
| scene riuscite | 16 | 16 | 16 |
| portate dall'eroe | 10 | 9 | 10 |
| verso la porta avversaria | **0** | **0** | **10** |
| direzione sbagliata | **10** | **9** | **0** |
| eroe verso la propria metà (oltre 1 u) | 10 | 9 | 0 |
| non portate (pallone a un compagno o fuori) | 6 | 7 | 6 |
| non giudicate | 0 | 0 | 0 |

Le corse più corte all'indietro (−2 u, −14 u, −19 u) sono scene che partono vicino alla nostra linea di fondo: l'eroe
arrivava al limite del campo (x −47) e lì si fermava.
Orientamento del corpo: nel tratto sbagliato il corpo guarda dove corre (scarto dalla porta avversaria 168°-180° in 5 scene
su 9; nelle altre l'eroe è già fermo sul limite e si è rigirato); dopo la correzione lo scarto è 1°-3° (29° in gi54).

### Partite vere (build del giro, braccio verde, due partite, una scena difensiva ogni 4 minuti)

9 scene difensive, tutte nel primo tempo (le partite non sono finite entro il tetto di 450 s della sonda): 4 riuscite,
5 fallite. Delle 4 riuscite, **1 col pallone all'eroe: «avanti»** (+19,5 u, coseno 1, scrittore «vincitore col pallone
al piede», verso (0,99 ; −0,15)); nelle altre 3 il pallone lo prende un compagno e l'eroe resta sul suo appoggio
(spostamento totale fra −2,8 e +0,2 u). Nelle 5 fallite il pallone va all'avversario verso la nostra porta, com'è giusto.
In una corsa precedente (stessi semi, una scena ogni 6 minuti) una scena al 49' conferma lato e verso nel secondo tempo
(scena fallita, quindi senza corsa dell'eroe da giudicare).

## Correzione nel gioco (`src/12-three-match-view.jsx`)

1. `_verso291(m, cm, sd, bl)` accanto a `_GLX`: funzione pura delle posizioni (nessun sorteggio). Verso = retta
   eroe→centro della porta avversaria; con il portatore battuto davanti e vicino aggiunge uno scarto laterale (al più
   ~50° dalla porta) dal lato scelto una volta (`sd`: opposto al portatore; se è in asse, il lato dove sta già il pallone).
2. Elezione del vincitore al lancio dell'arco d'esito: `_via31(hero)` restituisce il verso nuovo (per l'eroe soltanto);
   il tocco del pallone «di lato e appena dietro» usa lo stesso verso. `_post31` ricorda il lato (`sd291`).
3. Driver del vincitore: per l'eroe vincitore su scena riuscita il verso si ricalcola a ogni fotogramma e si insegue con
   inerzia (guadagno 5/s), poi il resto del driver è quello del giro 31 (pallone 0,6 u davanti, bersaglio 3 u avanti).
4. Testimone `__CPM_G291W` (solo con `__CPM_G291ON`).

Non cambia: scene fallite (il pallone resta al portatore, verso la nostra porta), vincitore compagno (già verso avanti),
gesto del contrasto, appoggio `_hold31`, arco d'esito, punto di ripresa di `handleContinue`.
Sotto `?cpmtest=1` senza `__CPM_CINE` il vincitore dell'esito è spento come prima: il gate non vede questa modifica.

## Guardiano `npm run intercetto-291`

Due bracci sulle stesse 16 scene. **Verde**: almeno 8 scene portate dall'eroe, almeno 4 famiglie, tutte «avanti» (N su N;
«ferma» e «non giudicata» contano come rosso). **Rosso** (`__CPM_NO_G291`): almeno 8 scene portate e almeno metà
«sbagliata». Durata misurata: circa 22 minuti. Registrato nella catena `completa` e nella prima riga della MAPPA di `src/12`.

Esito: vedi «Controlli».

## Controlli

Eseguiti a mano, uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, sulla build finale del ramo.

CONTROLLI_QUI

## Rapporto col giro 286 (portatore avanti e indietro PRIMA della scelta)

Causa **non comune**, per quanto misurato qui: il difetto di PO-550 nasce DOPO l'esito, nel driver del vincitore
(`_post31`, fase `hl_result`), che prima della scelta non esiste. Non ho toccato né misurato la fase prima della scelta.
Un punto di contatto da tenere presente nell'unione: entrambi i giri possono toccare `src/12` vicino a `_c31`
(il portatore della scena difensiva), che questa correzione **legge soltanto**.

## Dubbi per il PO

1. **Quanto corre l'eroe dopo il recupero.** Ora porta il pallone verso la porta avversaria a passo di conduzione per
   tutta la durata dell'esito (nella sonda, che tiene la scena aperta 5,5 s, fa 34-37 u; nel gioco la finestra d'esito
   è più corta). La velocità e la distanza sono quelle del giro 31, ho cambiato solo il verso. Se la corsa va accorciata
   o fermata dopo pochi metri è una scelta del PO.
2. **Scarto attorno al portatore battuto.** L'eroe lo aggira di lato invece di passargli attraverso. Lo scarto è una mia
   scelta tecnica per non perdere la protezione del pallone del giro 31; ampiezze (4,5 u, 2,2 u, ~50°) da confermare a occhio
   sul telefono.
3. **Gli altri avversari sulla strada non sono considerati**: l'eroe aggira solo il portatore battuto. Nelle 10 scene
   misurate non è stato misurato se attraversa altri corpi.
4. **Recupero riuscito ma pallone a un compagno** (6 scene forzate su 16, 3 su 4 nelle partite vere): l'eroe resta fermo sul
   suo appoggio e non corre. In 2 scene vere il pallone del compagno va di 5-10 u verso la nostra metà. Non è la nota
   PO-550 (non è l'eroe a correre) e non l'ho toccato; se il PO vuole che anche lì l'azione riparta in avanti è un altro lavoro.
5. **gi36 «Stacco di testa»** cambia vincitore fra una corsa e l'altra (eroe nella 196 e nel verde, compagno nel rosso):
   l'elezione del vincitore dipende dalle posizioni dei compagni all'atterraggio, che fra corse non sono identiche.
6. **Secondo tempo nelle partite vere**: verificato solo che lato e verso non cambiano (portieri, scena al 49'); nessuna
   scena riuscita con l'eroe portatore è capitata nel secondo tempo nel campione.
7. **Sul telefono non è stato provato**: tutte le misure sono su Chromium senza scheda grafica (headless).
