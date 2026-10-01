# Prompt per Codex — Collaudo approfondito: colpo di testa sul cross (PO-077) e conduzione dell'eroe (PO-079)

Il PO ha chiesto il 01/10 un collaudo **approfondito** di due difetti che il team considera chiusi o in parte chiusi:
- **PO-077** «I colpi di testa non sono sincronizzati con la velocità del cross» (lavori 7.999.33, 7.999.64, 7.999.76; guardiani `testa-vera-63`, `testa-76`).
- **PO-079** «Movimenti poco fluidi quando l'eroe avanza con la palla» e «si perde il pallone per strada» (7.999.37 non riprodotto, 7.999.44).

## Base
- Ramo `main`, ultimo commit (scrivilo nel rapporto con il numero `GAME_VERSION`).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-collaudo-testa-conduzione`. Non toccare `src/`, `tools/`, altri test, `main`.

## Parte 1 — Colpo di testa (PO-077)
Scene (gi = indice del catalogo, ordine delle righe `S("` in `src/04-situazioni-zone-piazzati.jsx`):
**6** (corner, secondo palo), **7** (cross in area), **39** (inserimento sul cross), **55** (cross teso, palo lontano), **64** (testa da centro area), **86** (cross al secondo palo), **90** (testa dalla trequarti), **171** (stacca di testa in corsa).
Per ogni scena: l'azione di testa (se la scena ne ha più d'una, tutte), esiti `success` e `fail` forzati, **3 ripetizioni** per caso (pagina nuova ogni volta).

Per ogni caso misura dai testimoni (non a occhio), a passi di 50 ms dal via del cross fino all'esito:
1. **Contatto**: istante in cui il pallone è più vicino alla testa dell'eroe; distanza pallone–testa in quel momento (u) e quota del pallone (m). Il contatto è credibile sotto 0,6u.
2. **Sincronia**: differenza fra l'istante di quel minimo e l'istante del picco dello stacco (quota massima del corpo). Sopra 150 ms: non sincronizzato.
3. **Velocità**: velocità del pallone nei 200 ms prima del contatto contro velocità nei 200 ms dopo; segnala rallentamenti sotto il 30% della velocità del cross prima del contatto («il pallone aspetta la testa»).
4. **Salti**: passi del pallone oltre 2u in 50 ms (teletrasporti).
5. 6 foto per caso: cross in partenza, metà volo, 100 ms prima del contatto, contatto, 100 ms dopo, esito.

## Parte 2 — Conduzione (PO-079)
Scene: **18**, **19**, **21**, **22**, **47**, **96**, **104**, **112**, **178**. Per ogni scena: azione 0 e un'azione di conduzione o dribbling, esiti `success` e `fail`, **3 ripetizioni**.
Misura a passi di 50 ms dall'inizio della corsa dell'eroe fino all'esito:
1. **Pallone ai piedi**: distanza pallone–piede più vicino dell'eroe; percentuale di campioni sotto 1,2u; il massimo; quanti tratti oltre 2u durano più di 300 ms («si perde per strada»).
2. **Pallone dietro**: quante volte il pallone sta dietro il corpo rispetto alla direzione di marcia.
3. **Fluidità**: variazione di velocità dell'eroe fra passi successivi (scatti), rapporto di pattinamento dei piedi se il testimone lo dà, cambi di direzione oltre 60° in 100 ms.
4. Foto ogni 300 ms durante la corsa.

## Metodo
- Viewport 412×915, GLB + presentazione + cinema attivi (`__CPM_GLB=true`, `__CPM_PRESENT=1`).
- Forza con `__CPM_FORCE_SIT(gi,…)`, `__CPM_FORCE_OUTCOME`, `__CPM_RESOLVE(i)`; un caso vale solo se `__CPM_TIMELINE()` → `ActionResolved` coincide con l'esito chiesto. I tentativi non validi restano nel grezzo.
- Pallone e corpi: `__CPM_STATE()` (`S.ball` ha già x/y logici e ndc), `__CPM_BALL3()`; per la testa e i piedi usa i testimoni esistenti dei guardiani `testa-76` e `testa-vera-63` (leggili, non modificarli). Se un testimone che ti serve non esiste, scrivilo «non misurabile» e dillo: non stimare dalle foto.
- Allega `__CPM_DRAFTNOTE` come dato grezzo, distinto dal tuo giudizio.

## Rapporto
`reports/codex/2026-10-01-collaudo-testa-conduzione.md`:
- per PO-077 una tabella per scena (casi, contatto medio/peggiore, sincronia media/peggiore, rallentamenti, salti) e il verdetto: **chiuso / ancora presente / non misurabile**;
- per PO-079 la stessa tabella (pallone ai piedi %, tratti persi, pallone dietro, scatti) e il verdetto;
- le 5 segnalazioni più gravi con il comando per riprodurle e le foto.
Dati grezzi compressi in `tests/codex/collaudo-testa-conduzione.json.gz`.

## Regole
- Italiano. Non inventare: se un dato non c'è, «non verificato».
- Headless: nessuna conclusione su FPS o tempi reali sul telefono; misura solo grandezze relative.
- Le anomalie restano ipotesi finché il team non le riproduce; non proporre patch al codice del gioco.
- Non usare credenziali di terzi.
