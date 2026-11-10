# Giro 142b — Serata di presentazione: squadra, postura, marchio (PO-343 + D23 di PO-337)

Ramo `sviluppo/giro142-presentazione` (da `lavoro/188`). `GAME_VERSION` non toccata, nessun campo nuovo nel salvataggio.

## Segnalazione
Foto PO `187-presentazione-squadra.jpg`: «sono tutti uguali e sembrano manichini», «hanno pure una posa da impiccato»;
nella barra in basso il marchio si legge «K O rward Elite».

## Misura prima (GLB acceso, `tests/visual/presentazione-142-misura.mjs`, 7 corpi in fila)
| grandezza | prima | dopo |
|---|---|---|
| testa dei capelli | testa di serie del GLB su tutti (`Material.002`) | variante da `appearanceFromSeed` (es. brown ×5, auburn ×2 sul club di prova) |
| corporatura (x/y) | 1,000 su tutti | 0,94–1,07 |
| statura | 1,76–1,78 (seme locale) | 1,80 come in partita (eroe: la sua) |
| clip / tempo | `idle` in pausa a 5,67–6,75 s, quasi lo stesso per tutti | `idle` in pausa su tempi diversi scelti fra quelli con i due piedi in appoggio (es. 0,13 · 0,38 · 0,64 · 6,03 · 6,80) |
| testa rispetto al busto (scarto dalla posa di riposo) | 26–53° (guardiano: max 35,6° sul fotogramma misurato) | ≤ 10,3° (comprende lo sguardo che gira) |
| punta del piede (inclinazione rispetto al riposo) | −25…−53° (punte all'ingiù) | entro ±2° |
| quota della punta più bassa sul prato | −7…−9 cm (dentro l'erba), l'altro piede fino a +19 cm | 0…+1,5 cm |
| mani rispetto all'osso del bacino | +3…+12 cm (braccia lungo i fianchi) | +2…+12 cm (invariato: braccia rilassate) |
| fermo più lungo (tempo di scena) | 4,3 s, cioè tutta la finestra: nessuno si muoveva | 0,19 s |
| marchio letto dal DOM | «K rward Elite» | «Korward Elite» |

Cause misurate: (1) l'aspetto non arrivava ai corpi CGTrader della presentazione — le funzioni della partita (variante capelli,
corporatura) erano chiuse dentro `ThreeMatchView`; (2) il tempo di pausa veniva da un passo di LCG su semi consecutivi, quindi quasi
uguale per tutti, e cadeva in un tratto della clip `idle` con testa giù, punte all'ingiù e un piede alzato; (3) la clip era ferma;
(4) nella striscia delle cerimonie «K», il cerchietto e «rward» erano tre figli di un contenitore flex con spazio di 3 px.

## Cosa cambia
- `src/12`: `cgVarianteCapelli`, `cgCorporatura` portate a livello di modulo con lo stesso corpo di prima; la partita le chiama
  (nessuna seconda logica). `cgCapelli142` applica la stessa testa alle cerimonie (immagine già decodificata `__CPM_TESTE237`, altrimenti
  caricata; la testa del GLB resta finché la mappa non c'è).
- `src/16` (`PresentationStage3D`, ramo CGTrader): seme della partita `hashStr(club.id + '_' + indice)` (indici 1..9, giocatori di
  movimento di casa), `_posa142`: posa base con i piedi in appoggio, collo e testa in asse col busto, punta del piede all'inclinazione
  di riposo, appoggio al prato, poi vita leggera (respiro, peso, sguardo, braccia) scritta in assoluto sulla base a ogni fotogramma,
  frequenze e fasi dal seme (`_mix32`). Nessun `Math.random` nuovo.
- `StrisciaScena948`: «Korward» è un solo testo, la «o» è una lettera vera disegnata come anello; vale per tutte le cerimonie che
  usano la striscia (gala, sala stampa, presentazione, parata).
- Rossi: `__CPM_NO_G142` (squadra e postura di prima), `__CPM_NO_G142M` (marchio di prima).
- Guardiano nuovo `npm run presentazione-142` (soglie fissate dopo la misura: aspetti ≥ 5 su 7, testa ≤ 15°, punta più bassa in
  [−2, +3] cm e l'altra ≤ +5 cm, punta ≤ 5°, fermo ≤ 1,0 s di scena, marchio = «Korward Elite»). Verde e rosso stampati per ultimi; il
  rosso cade su tutti e cinque i punti.

## Foto prima/dopo
`docs/sviluppo/giro142/` — `prima|dopo-360x800(.png|-beat3.png)`, `prima|dopo-1440x900(.png|-beat3.png)` (beat 1 = la squadra,
beat 3 = il chiamato). Tutte le foto del giro in `tests/visual/out/g142/` (anche beat 0 e 8).

## Altre schermate con un marchio composto a pezzi (non toccate in questo giro)
- `src/16` r.~281 — piastrelle del pannello della sala stampa: stesso schema «K» + cerchietto + «rward» in un flex con spazio 2 px.
- `src/16` r.~917 — tovaglia del tavolo della conferenza (SVG): «K●rward», il DOM legge il simbolo «●» al posto della «o».
- `src/17` r.~276 — titolo della schermata iniziale: «K⚽rward» (pallone emoji, scelta di stile; il DOM legge l'emoji).
- I cartelloni a bordo campo disegnano il marchio su canvas (`src/11` r.~1016): lì è un disegno, non testo.

## Limiti dichiarati
- Il volto è lo stesso su tutti: il corpo CGTrader ha una sola testa modellata; variano solo le quattro texture dei capelli. È così
  anche in partita. Volti diversi richiedono asset nuovi.
- Sul club di prova escono due varianti di capelli su quattro: dipende dai semi del club (`HAIR_COLS` → variante).
- La vita della fila non è una clip: sono piccole rotazioni procedurali sopra una posa ferma. La direttiva 7.419 («dovrebbero stare
  fermi») è rispettata nel senso che nessuno cammina o ondeggia di peso con i piedi; si muovono busto, testa e braccia.

## Catena (un controllo alla volta, GLB acceso dove serve, build f55de32)
| controllo | esito |
|---|---|
| presentazione-142 | verde (aspetti 6/7 · testa max 10,3° · piedi 0 fuori · fermo max 0,19 s · «Korward Elite»); rosso cade su 5 punti |
| intro-118 | verde |
| scena3d-96 tel / pc / tabv / tabo | verde 16/16 · 9/9 · 3/3 · 3/3 (la prima corsa pc ha sforato il tetto di 590 s ed e' stata chiusa a meta': non vale, rifatta da capo, verde) |
| griglia-mobile | uscita 0; stampa «NON misurato: prepartita: playMatch → nomatch» (scena della partita non aperta dal suo salvataggio: non toccata da questo giro, da guardare a parte). Il suo rapporto in `docs/collaudo-grafico/g0` cambiava solo per un selettore della privacy (a → button), non per questo giro: non committato |
| design-system | verde |
| career-critical | verde |
| test:logic | verde |
| save-compat | verde 12/12 |
| audit-copyright | verde, 0 riferimenti |

## Domande aperte per il PO
1. Il marchio composto a pezzi compare anche nella sala stampa (piastrelle e tovaglia): lo correggo nel prossimo giro con la stessa
   regola, o la tovaglia col «●» è voluta?
2. Lo sguardo della fila gira lentamente (6–11°) verso la tribuna: va bene così o preferisce tutti fermi con lo sguardo dritto?
3. Il chiamato fa il passo avanti ma non saluta (sul corpo CGTrader il saluto non è mai stato collegato): lo vuole?
