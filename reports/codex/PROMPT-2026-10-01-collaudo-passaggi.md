# Prompt per Codex — Collaudo passaggi e combinazioni (PO-147, taccuino #38 «Dai e vai»)

Il PO ha segnato su #38 «Dai e vai! Schema rapido in trequarti» i codici 005 (palla da biliardo), 014 (palla flipper), 012 (verticalizzazione all'indietro) e 011 (palla congelata). Il team li ha misurati ma non li ha ancora corretti. Serve sapere su quali scene di passaggio succedono, quanto spesso e in quale momento.

## Base
- Ramo `main`, ultimo commit (scrivi commit e `GAME_VERSION` nel rapporto).
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-collaudo-passaggi`. Non toccare `src/`, `tools/`, altri test, `main`.

## Casi
Scene (gi = indice del catalogo, ordine delle righe `S("` in `src/04-situazioni-zone-piazzati.jsx`): **25** (filtrante per il centravanti), **27** (triangolazione), **38** (dai e vai), **61** (sponda e rimorchio), **120** (verticale filtrante di prima), **121** (triangolo 3 contro 2), **152** (doppio dai e vai), **174** (verticalizzazione), **179** (uno-due in verticale), **180** (triangolo al limite).
Per ogni scena: ogni azione di passaggio/combinazione offerta, esiti `success` e `fail`, **2 ripetizioni** (pagina nuova ogni volta).

## Metodo
- Viewport 412×915, `__CPM_GLB=true`, `__CPM_PRESENT=1`, `window.__CPM_DTREAL=1` (la scena avanza col tempo reale anche in headless).
- Forza con `__CPM_FORCE_SIT(gi,…)`, `__CPM_FORCE_OUTCOME`, `__CPM_RESOLVE(i)`; caso valido solo se `__CPM_TIMELINE()` → `ActionResolved` coincide.
- Campiona ogni 50 ms dalla scelta all'esito: pallone (`__CPM_STATE().ball`: x/y logici, `worldY`), eroe, compagno destinatario (il giocatore di casa più vicino al pallone all'arrivo).
- Definizioni da applicare ai campioni (misura, non giudizio a occhio):
  - **005 palla da biliardo**: il pallone cambia direzione di oltre 60° senza che un giocatore sia entro 1,5u.
  - **014 palla flipper**: due o più cambi di direzione oltre 60° in meno di 400 ms.
  - **012 verticalizzazione all'indietro**: in un'azione che il titolo chiama filtrante/verticale, lo spostamento del pallone verso la porta avversaria (x crescente) è negativo.
  - **011 palla congelata**: il pallone resta entro 0,3u per più di 500 ms mentre l'azione è in corso (fuori dalla scelta).
  - Salti: passi oltre 2u in 50 ms.
- 6 foto per caso: scelta, partenza del passaggio, metà strada, ricezione, ritorno (nel dai e vai), esito.
- Allega `__CPM_DRAFTNOTE` come dato grezzo.

## Rapporto
`reports/codex/2026-10-01-collaudo-passaggi.md`:
- tabella per scena e azione: casi validi, conteggio di 005/014/012/011 e salti, istante del primo evento (ms dalla scelta);
- per #38 il dettaglio caso per caso con la traiettoria del pallone;
- le 5 segnalazioni più gravi con comando di riproduzione e foto.
Dati grezzi in `tests/codex/collaudo-passaggi.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca. Niente conclusioni su FPS dall'headless. Le anomalie restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi.
