# Rapporto giro 99 — chiusura della 178

Ramo `sviluppo/giro99-chiusura` (da `lavoro/178`, 55879106: 7.999.178 con i giri 90-98 uniti). `GAME_VERSION` e `docs/governo/*`
non toccati.

## D9 MEDIA — «GOOOOL!» poco leggibile (collaudo grafico PO-299)
- **Misura prima** (`chiusura-99` parte D9, braccio rosso `__CPM_NO_G99D9`; 6 gol veri dell'eroe, telefono 412x915, colore del club
  vero più cinque colori forzati col testimone di sola prova `__CPM_G99COL`: bianco, giallo, rosso, blu, verde). Contrasto WCAG
  della lettera contro ciò che le sta dietro (alone/contorno, «locale») e contro il quadro 3D sotto («quadro»); si giudica il
  minimo dei due: **mediana 1,28**, 5 gol su 6 sotto 3 (club 1,04 · rosso 1,28 · blu 1,02 · verde 1,24 · giallo 2,19; solo la
  maglia bianca 3,27).
- **Causa:** `goalCinema` (src/15) scriveva col colore del club, in corsivo, con l'alone dello STESSO colore (30 e 60 px): la
  lettera si confondeva col proprio alone e con cartelloni/maglie del club.
- **Correzione** (src/15): bianco pieno, contorno scuro 2 px (`paint-order: stroke fill`), ombra nera, niente corsivo, pillola scura
  (`rgba(6,10,20,0.72)`, raggio `RAD.md`) dietro la scritta; il colore del club resta solo come filetto sotto la pillola. La
  scritta era già centrata nel riquadro 3D (`inset:0`, flex centrato): invariato. Vale anche per «ASSIST!».
- **Misura dopo:** **mediana 5,29**, minimo 4,62 (giallo), nessun gol sotto 3. Il «quadro» è conservativo: confronta la lettera col
  campo SENZA la pillola.

## Ricevente dell'assist nel 3D (aperto dal giro 98, D1)
- **Misura prima** (`chiusura-99` parte RIC, partite vere dal salvataggio S12, pilota «assist», `__CPM_PRESENT=1`, 4 semi; braccio
  rosso `__CPM_NO_G99RIC`): compagno servito nel 3D = ricevente nominato dal cast **6/12 (50%)**.
- **Causa misurata** (diagnosi di sola prova `__CPM_G99DIAG` nel testimone B4): in tutti e sei i casi mancati il nominato stava
  **dietro la palla** (8-15 u) o lontano (18-40 u) al momento del passaggio, sul suo slot di formazione; il ramo del passaggio
  (src/12) lo scartava (vincolo «mai all'indietro» 7.475 / 40 u) e sceglieva per geometria.
- **Correzione** (src/12): nelle scene d'attacco il ricevente del cast ha un **punto di ricezione credibile davanti all'eroe**
  (12 u avanti e 9 verso il centro; oltre x 80, 6 avanti e 14 di lato), preso allo snap d'apertura (stacco nero: nessun
  teletrasporto visibile) e poi tenuto col moto normale (`animOne`, stesso canale del portatore difensivo del giro 31); il ramo del
  passaggio serve il nominato portato lì anche oltre i 40 u, sempre solo se è davanti alla palla.
- **Misura dopo:** **12/12 (100%)** sugli stessi 4 semi.
- ⚠️ **Lezione di misura:** senza `__CPM_PRESENT` (sotto `cpmtest` lo snap di presentazione è spento) la correzione non si vede
  (1234: 0/3) perché il nominato deve correre 30-40 u nei pochi istanti di scelta del pilota automatico. La sonda gira nel regime
  del giocatore. `assist-nome-98` misura senza `__CPM_PRESENT`: il suo «3D ricevente = cast» resta nel regime di prova.

## Guardiano
`tests/visual/chiusura-99.mjs` (parti D9 e RIC, verde + rosso nello stesso giro; esce ≠0 se un rosso non si vede o la passata è
cieca). In `ci-runner.mjs`: catene carriera e completa, MAPPA `src/12-|13-` e `src/15-`, tra i LENTI; in `package.json`.
Durata: D9 ~5 min per braccio, RIC ~9 min per braccio con 2 semi.

## Guardiani non eseguiti dopo 96b e 98 (uno alla volta, sulla build unita + giro 99)
| Guardiano | Esito | Durata | Note |
|---|---|---|---|
| validate-situations | ✅ verde | 619 s | fingerprint 00001505, 0 failure (B15 non rompe il gate) |
| pagella-75 | ✅ verde | 843 s | |
| voto-79 | ✅ verde | 303 s | |
| tabellino-228 | ✅ verde | 296 s | |
| pc-tablet-292 | ✅ verde | 784 s | |
| partita-vera | ✅ verde | 504 s | |
| difficolta-156 | ✅ verde | 773 s | |
| catalogo-022 | ✅ verde | 281 s | |
| esiti-60 | ✅ verde | 167 s | |
| esito-280 | ✅ verde | 328 s | |
| nomi-219 | ✅ verde | 2597 s | lento (verde vicini 89%, rosso 59%) |
| cross-218 | ✅ verde | 207 s | |
| highlight-95 | ❌ **preesistente, instabile** | >3000 s (tetto) | verde 120 highlight, 3 difetti D3 «para il portiere ma il pallone non arriva al portiere entro 1,5 s»: s5/7 «Servi SEIFERT libero» (min 20,7), s5/2021 «Filtrante per ROTH» (17,9), s5/7 «Palla in area» (6,8). Rigiocato s5 con `CPM_FLAG=__CPM_NO_G99RIC` (correzione del ricevente spenta): SEIFERT ricompare (min 19,9) → non nato dal giro 99; è il difetto già segnalato preesistente nel giro 98 (stesso 20,7). ROTH e «Palla in area» non si riproducono sulla corsa ridotta né accesi né spenti. Rosso «D4 non si vede» sul braccio rosso finito al tetto (giro 96b: bracci rossi già incompleti). Aggiunto `CPM_FLAG` alla sonda per isolare le cause. |
| assist-298 | ✅ verde | 1893 s | (girato in parallelo con due riprove di highlight-95: verde lo stesso) |
| scena3d-96 | ❌ **instabile, non dal giro 99** | 1307 s | unico rosso: tel-gi16 «eroe figurina a fine scena» 0,059 (soglia 0,06). Rigiocato da solo due volte: 0,107 e 0,092, verde. Scene forzate = nessun cast → la correzione del ricevente è inerte; il D9 è DOM. Variabilità al limite su pagina riusata (lezione 7.483). Soglia non toccata. |
| esiti-96 | ✅ verde | 789 s | |
| assist-nome-98 | ⏱ verde completo, rosso interrotto | >3000 s (tetto) | solo lento. Verde: D1 nome coerente 100% su 14, **3D ricevente = cast 11/14** (giro 98: 5/12), D3 0, D4 0, B ok. |
| schermate-97 | ✅ verde | 288 s | |

## Punti aperti
1. **highlight-95 D3 «il portiere dice no / para il portiere»: il pallone del tiro del compagno non arriva al portiere** (SEIFERT,
   preesistente e instabile, giro 98 n.2; ROTH e «Palla in area» visti una volta). Regola PO: difetto d'highlight = almeno medio,
   blocca il rilascio. Non corretto qui: non riproducibile in modo stabile e non nato da questo giro; serve un giro dedicato con
   sonda mirata sulla scena (pagina nuova, `__CPM_PRESENT`).
2. **assist-nome-98 e highlight-95 oltre i 50 minuti**: bracci rossi non completati in questa sessione (solo tempo).
3. **chiusura-99 RIC** misura nel regime del giocatore (`__CPM_PRESENT=1`); senza (sotto `cpmtest`) il nominato deve correre e il
   3D lo serve 11/14 (assist-nome-98). La scelta prudente è stata non toccare `_asIfPlay`.
4. chiusura-99 completo (D9 + RIC, due bracci, default 2 semi) non rigirato in un colpo solo: le parti sono state misurate
   separatamente (D9 verde+rosso nella stessa corsa; RIC rosso 6/12, verde 12/12 su 4 semi).
5. D9: giudizio finale sul telefono del PO (pillola scura e filetto del club sono una scelta di regia).
