# Prompt per Codex — collaudi serali 02/10 (base: `main` ≥ 7.999.111)

Sei il collaudatore di Carrier Manager (repo `antoniovairo-rgb/Carrier-manager-`). **Non modifichi il gioco.** Scrivi solo in `reports/codex/` e `tests/codex/`, su un ramo nuovo `codex/2026-10-02-collaudi-serali` creato da `main` aggiornato. Ogni rilievo è un'ipotesi finché il team non lo riproduce: riporta numeri, comando esatto, commit e `GAME_VERSION` letti dal file, foto come supporto (il verdetto viene dai testimoni numerici). Se un punto non è misurabile scrivi «non verificato» e perché. Memoria libera sotto 3,5 GB: fermati, registra lo stato e riprendi dopo; non ridurre il campione senza dirlo.

Ordine di priorità: A, B, C, D. Un rapporto per compito: `reports/codex/2026-10-02-<compito>.md` + grezzo `.json`.

## A — Ricollaudo colpo di testa sulla base nuova (PO-077)
Il tuo rapporto `2026-10-01-collaudo-testa-conduzione.md` misurava la base **7.999.103**: scena 171, 591 ms tra contatto e picco dello stacco. Nella **7.999.109** il team ha anticipato lo stacco del tuffo di testa (`header_diving`), con rosso `__CPM_NO_TUFFO109`.
1. Ripeti con `tests/codex/collaudo-testa-conduzione.mjs` (`CPM_KIND=header`, `CPM_FORCE_RERUN=1`) le scene **171, 6, 7, 55, 64, 86, 90**: tutte le azioni di testa di ogni scena, **3 ripetizioni success + 3 fail**.
2. Per la 171 esegui anche il braccio rosso (`window.__CPM_NO_TUFFO109=1` via `addInitScript`, valore passato come argomento, non da `process.env`): il ritardo deve tornare vicino a 591 ms. Se non torna, il tuo testimone e il nostro guardiano `tests/visual/testa-tempismo` (picco cercato entro ±1 s dal contatto, esclusa la fase `lift`) misurano cose diverse: descrivi la differenza.
3. Soglia: sincronia ≤ 150 ms, minimo pallone–testa < 0,6u.

## B — Difesa 3D con l'orologio corretto (compito A del banco deterministico)
Prosegui sul ramo `codex/2026-10-02-banco-deterministico` (commit `a995f118`, orologio che avanza una volta per fotogramma). Prima verifica in Chromium che l'orologio sia davvero di 1 passo per fotogramma (conta i passi in 300 fotogrammi). Poi completa la difesa 3D: la sonda risolve **solo** in fase `hl_choose`; risoluzione forzata dopo 45 fotogrammi, scarti dichiarati. Tieni separati i 7 tentativi validi precedenti dalla nuova serie. Per ogni tentativo: eroe in quadro, pallone in quadro (letture su totale), GLB sì/no.

## C — Goleade e gol dell'eroe in una carriera avanzata (PO-190)
Collaudo PO: stagione 12, eroe attaccante OVR 93 all'FC Merseyside (Premier Division). Nelle 29 partite registrate la squadra ha segnato 2,90 gol a partita e ne ha subiti 0,55; l'eroe ha fatto 48 gol in 35 presenze. Ci sono 4 partite con 6+ gol fatti: 8-0, 10-0, 6-1, 6-0. Il tuo collaudo goleade del 01/10 copriva il motore senza occasioni dell'eroe (parte A) e solo provini a inizio carriera (parte B): **questo caso non è mai stato misurato**.
1. Con `tests/codex/career-matrix.mjs` o un banco nuovo, porta almeno **3 carriere naturali** (attaccante, scelte automatiche) fino alla stagione ≥ 6. Per ogni stagione registra: gol, presenze e OVR dell'eroe; gol fatti e subiti della squadra a partita; partite con 6+ gol fatti; scarti ≥ 5; quota dei gol dell'eroe sui gol di squadra.
2. Distingui le partite **vissute** (`__CPM_CAREER.playMatch()` + `__CPM_AUTOPLAY(true,{seed,policy:'seeded'})`) da quelle **simulate** (`simulated: true` in `matchHistory`), e per le vissute la fonte di ogni gol (motore oppure highlight dell'eroe, `MATCH_EV` via `__CPM_EV()`).
3. Riferimento reale da citare nel rapporto senza inventare: indica solo le fonti che puoi verificare. Non tarare nulla: misura.

## D — Premiazione 3D (PO-191)
Foto del PO: «Campioni Premier Division». Compagni che **attraversano il palco**, eroe in **posa sbagliata** (gamba alzata, trofeo davanti) e che **vola** sopra il palco.
1. Apri la cerimonia con `window.__CPM_FORCE_CEREMONY({name:'CAMPIONI PREMIER DIVISION',kind:'league'})` dopo `openMatch` (vista 3D, `__CPM_GLB=true`), 412×915. Ripeti con `kind` `cup` ed `euro` se il gioco li accetta (altrimenti scrivi quali `kind` esistono leggendo `src/12-three-match-view.jsx`, senza modificarlo).
2. Per 10 s a 20 Hz registra per ogni corpo: posizione, altezza dei piedi rispetto al piano del palco, se il bacino entra nel volume del palco senza esserci salito (attraversamento), clip in esecuzione. Per l'eroe: distanza minima piede–palco (vola se > 0,15u per più di 300 ms), clip e fase, posizione del trofeo rispetto al volto.
3. Foto a 0, 2, 5 e 8 s. Elenca i casi con tempo e corpo.

## Note di metodo
- Un torneo della Nazionale in corso (Europeo dentro la settimana 21) **non** è una «settimana ferma».
- Lo svincolato (`contractExpired`) è uno stato previsto, non un difetto.
- Variabili utili: `CPM_CHROME`, `PLAYWRIGHT_BROWSERS_PATH`. Mai `pkill -f` con uno schema contenuto nel proprio comando.
- Alla fine: commit e push sul tuo ramo, poi un riepilogo in 10 righe con link ai rapporti.
