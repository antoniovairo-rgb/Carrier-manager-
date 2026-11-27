# Rapporto giro 425 — PO-658: pagella dell'eroe e risultato nelle goleade (residuo di PO-190)

**Base:** `main` 2e084dc. **Ramo:** `sviluppo/giro425-pagella-goleade`. GAME_VERSION e `docs/governo` non toccati.
**Codice di gioco: NON toccato** (nessun difetto da correggere: vedi §2). Licenze invariate.
**Decisione PO 25/11:** «prima si verifica se si vede ancora; se non si riproduce si chiude con i numeri della misura».

## 1. Cosa c'era già (per non rifare il lavoro di un altro giro)

- **Giro 75** (su main): il difetto d'origine dal vivo — pagella del motore 2 gol, risultato registrato 1 (gol dell'eroe in gioco
  fluido non accreditato) — corretto in `src/15` (`_gEroe75`, rosso `__CPM_NO_PAGELLA75`), guardato da `pagella-75` (3 semi).
- **Giro 379** (ramo `sviluppo/giro379-residui`, 23e57c0, **non ancora su main**: «consegnato, attende treno»): ha misurato
  PO-658 sulle partite **simulate** («Simula»). Trovato un solo caso, l'eroe **espulso** in una goleada vinta (voto 5,6 senza la
  causa a schermo), corretto in `src/10` (`_pSimStats`/`_heroSimLine` dicono «espulso», rosso `__CPM_NO_G379A`), guardiano
  `residui-379`. Il suo rapporto lascia esplicitamente fuori «la verifica delle goleade giocate DAL VIVO».

Questo giro quindi misura **le goleade giocate dal vivo** (LiveMatch + motore del possesso) e ricontrolla le simulate sull'attuale
main senza toccare i file del 379 (`src/10`, `src/18`).

## 2. Misura — il difetto NON si riproduce

### 2a. Partite giocate dal vivo (nuova misura di questo giro)

Sonda/guardiano `tests/visual/pagella-425.mjs`. Salvataggio `fixtures/save-190-s12-ovr93.json` (S12 W38, OVR 93, FC Merseyside
prestigio 96). Ogni partita: nome dell'eroe diverso (seme di partita diverso), avversario fra le sei ultime della classifica del
salvataggio (FC Dorset, Swans, Hornets, Selhurst, Goodison, Griffin), casa/fuori alternati, autoplay seedato, velocità 2×, fino al
fischio finale (una partita non finita = NON GIUDICATO). Regole scritte prima della misura, in testa al file:

| Regola | Cosa giudica |
|---|---|
| L1 | gol e assist dell'eroe: pagella del motore == risultato registrato (`_buildEndResult`) |
| L2 | voto registrato == voto della pagella (a 0,1) |
| L3 | tabellino del motore == punteggio registrato |
| L4 | goleada (scarto ≥ 3) vinta, eroe in campo fino alla fine → voto ≥ 6,0 |
| L5 | goleada vinta con doppietta o più → voto ≥ 7,0 |
| L6 | goleada persa senza gol né assist dell'eroe → voto ≤ 6,5 |
| L7 | almeno 3 goleade giudicate, altrimenti NON GIUDICATO (= rosso) |

**Censimento: 24 partite giocate, 14 goleade, 0 violazioni** (registro completo in `tests/visual/out/pagella-425/censimento.log`,
non versionato; righe riportate qui):

| Esiti (24) | |
|---|---|
| goleade (14) | 4-0 · 3-0 · 4-0 · 4-0 · 6-0 · 4-0 · 5-1 · 5-0 · 3-0 · 3-0 · 4-0 · 4-0 · 5-0 · 5-0 |
| voti dell'eroe nelle goleade | 7,0 · 7,7 · 7,7 · 7,7 · 7,9 · 8,0 · 8,1 · 8,1 · 8,2 · 8,4 · 8,6 · 8,7 · 8,8 · 8,8 (min 7,0 · mediana 8,1) |
| goleade con doppietta+ (L5) | 8 su 14, voti 8,1–8,8 |
| pagella = registrato (L1, L2) | 24 su 24 (gol, assist e voto) |
| tabellino = punteggio (L3) | 24 su 24 |
| goleade perse | 0 (non esercitata: la squadra è prima con 30 punti di vantaggio) |
| eroe espulso dal vivo | 0 su 24 |
| gol dell'eroe in gioco fluido | 0 su 24 (dal giro 154 / PO-357 l'eroe segna solo nelle scene) |

### 2b. Partite simulate (ricontrollo su main con la sonda del giro 379, non importata nel ramo)

`misura-379.mjs` (dal ramo del 379) sull'attuale main, 5.000 simulate: **1.272 goleade vinte, 1 con voto < 6 (0,08%)**, ed è la
simulata n. 348 con l'**eroe espulso dal motore** (3-0, 2 assist, voto 5,6) — lo stesso caso, con lo stesso numero, che il giro
379 ha corretto. Senza espulsione: 0. Istogramma dei voti delle goleade vinte: 5,5:1 · 6:35 · 6,5:264 · 7:229 · 7,5:308 · 8:294 ·
8,5:130 · 9:11. Espulsioni dell'eroe: 27 su 5.000.

### Conclusione

Dal vivo il difetto pagella/risultato del giro 75 **non si vede più** (0 su 24 partite, 0 su 14 goleade). Sulle simulate resta
solo il caso dell'eroe espulso, già corretto dal giro 379 e in attesa del treno. **Consigliato: chiudere PO-658** quando il
vagone del 379 è su main (vedi §5, dubbio 1).

## 3. Guardiano `npm run pagella-425`

- Sei semi che nel censimento finiscono in goleada (1, 6, 10, 11, 14, 16) nel braccio verde + due nel braccio rosso, `PAR=4`,
  ~20 min. Riga MAPPA esistente `src/15-` di `ci-runner.mjs` (dove nasce il risultato registrato e vive la correzione del giro 75);
  `npm run mappa-unica` verde.
- **Rosso `__CPM_NO_G425`:** non essendoci una correzione nuova nel gioco, il braccio rosso riarma i due difetti storici della
  famiglia — `__CPM_NO_PAGELLA75` (il gol dell'eroe in gioco fluido non arriva al registrato, ricreato con `__CPM_NO_G154`/
  `__CPM_NO_C3D2` come fa `pagella-75`) e `__CPM_NO_VOTO20` (il voto registrato torna alla vecchia formula delle scene) — e deve
  vederli: almeno una partita con L1 o L2 violata, altrimenti il guardiano guarda a vuoto. `__CPM_NO_G425` è impostato nel braccio
  rosso come etichetta; nel gioco non c'è un ramo che lo legga (non c'è codice nuovo da spegnere).
- Esito della prima esecuzione: **verde** 6/6 partite, 6 goleade (6-0 v8,4 · 4-0 v8,1 · 4-0 v7,7 · 4-0 v8,8 · 5-1 v8,6 · 4-0 v8,2),
  0 violazioni · **rosso visto 2/2** (k1 4-0: pagella 7,8 ≠ registrato 7,2; k6 4-0: 8,8 ≠ 8,5).
- ⚠️ **Determinismo parziale, misurato:** 5 semi su 6 rifanno lo stesso risultato del censimento; il seme 16 ha dato 5-0 (0 g, 3 a)
  nel censimento e 4-0 (1 g, 2 a) nel guardiano. La soglia di copertura è 3 goleade su 6 semi, non 6: un seme che cambia esito non
  fa diventare rosso il guardiano, mentre uno scenario senza goleade lo fa (NON GIUDICATO).

## 4. GLB (corpi CGTrader) — acceso, come chiede la regola

Il guardiano gira con `__CPM_GLB=true` per default (`GLB=0` lo spegne). Storia della misura, per non ripetere l'errore:
- prima prova a GLB acceso scartata: 640 s senza fischio finale. **Causa: la sonda chiedeva velocità 4, che non esiste**
  (`MATCH_SPEEDS = [1, 1.5, 2]`, `readMatchSpeed` la riscrive a 1×). Anche `pagella-75` chiede 4 e quindi gira a 1×;
- a 2× una partita a GLB acceso chiude in 372 s da sola e in 389–626 s con quattro in parallelo, con **lo stesso risultato**
  di GLB spento (seme 1: 4-0, 1 gol, 1 assist, voto 7,7 in tutte e tre le letture).
- Il censimento da 24 partite (§2a) è stato fatto **a GLB spento**; il guardiano (6 + 2) è stato eseguito in entrambi i modi:
  GLB spento dentro `ci-runner giro` (§8) e **GLB acceso da solo** dopo il passaggio al nuovo default — verde 6/6 goleade
  (4-0 v8,1 · 6-0 v8,4 · 4-0 v7,7 · 4-0 v8,8 · 5-1 v8,6 · 4-0 v8,2), 0 violazioni, rosso 2/2 (7,8 ≠ 7,2 · 8,8 ≠ 8,5).

## 5. Dubbi per il PO (la consigliata è la prima e quella applicata)

**1. Chiusura di PO-658**
1. **(applicata come proposta)** Chiudere PO-658 con questi numeri (dal vivo 0/24 partite, 0/14 goleade; simulate 0 fuori dal caso
   espulso) quando il vagone del giro 379 (che corregge il caso espulso nelle simulate) arriva su main; `pagella-425` e
   `residui-379` restano come guardiani.
2. Chiuderla subito, senza aspettare il 379: il caso espulso è 1 su 1.272 goleade simulate e il voto è comunque una pagella
   calcistica corretta; manca solo la causa a schermo.
3. Tenerla aperta finché non si è misurata anche una goleada **persa** dal vivo (L6 non è esercitata: con questo salvataggio la
   squadra dell'eroe non perde mai largo).

**2. Velocità della partita nelle sonde**
1. **(applicata)** Il guardiano chiede 2×, la velocità più alta che il gioco accetta; il censimento lo ha mostrato fattibile anche
   a GLB acceso.
2. Correggere anche `pagella-75` (oggi chiede 4 e gira a 1×, tre volte più lento del necessario): fuori ambito di questo giro,
   da assegnare.
3. Aggiungere una velocità da banco (solo sotto `?cpmtest=1`) per accorciare i guardiani dal vivo: tocca `src/15`, va deciso.

**3. Il guardiano gioca contro le sei ultime della classifica**
1. **(applicata)** Avversario fra le sei ultime (nella copia del salvataggio si tolgono i precedenti contro di loro, altrimenti le
   guardie anti-loop di `getThisWeekMatchday` rifiutano la gara): goleade in 14 partite su 24, copertura garantita.
2. Lasciare l'avversario del salvataggio (FC Tyneside): nelle tre partite finite prima del cambio 2-1, 0-1, 2-0 — nessuna goleada,
   il guardiano sarebbe NON GIUDICATO.
3. Un salvataggio nuovo con un eroe in una squadra debole, per esercitare anche le goleade perse (L6).

## 6. File toccati

- `tests/visual/pagella-425.mjs` (nuovo: sonda + guardiano), `tests/visual/package.json` (script `pagella-425`),
  `tests/visual/ci-runner.mjs` (riga MAPPA `src/15-`).
- `docs/collaudo-po/425-*.png` (foto), `docs/sviluppo/RAPPORTO-giro425.md`.
- Nessun file di gioco (`src/`, `CARRIER-MANAGER-AV.html`), nessun `docs/governo`.

## 7. Foto

Non c'è un «prima/dopo» del gioco, perché il gioco non è cambiato. Le foto sono le schermate di fine partita del guardiano
(telefono 412×915, GLB spento):
- `docs/collaudo-po/425-goleada-4-0-verde-risultato.png`: seme 1, FC Swans–FC Merseyside 0-4, pagina 1/4 del riepilogo (risultato e tabellino).
- `docs/collaudo-po/425-goleada-5-1-verde-pagella.png`: seme 14, 5-1, pagina 2/4: eroe 2 gol e 1 assist, **pagella 8,6**; il risultato
  registrato (quello che va in carriera) è 2 gol, 1 assist, voto 8,6.
- `docs/collaudo-po/425-goleada-4-0-rosso-pagella.png`: braccio rosso, seme 1, 0-4, pagina 2/4: a schermo **pagella 7,8**, mentre il
  risultato registrato con il difetto storico riarmato (`__CPM_NO_VOTO20`) è **7,2**. È la forma che il difetto avrebbe: la schermata
  dice una cosa e la carriera ne registra un'altra; nel verde le due coincidono.

## 8. Giro `node ci-runner.mjs giro pagella-425`

Base 7.999.217 (il main di partenza). **18/18 verdi, nessun passo riprovato:** pagella-425 1.170 s · mappa-unica · test:logic ·
save-compat · replay 50 s · migrazione-194 27 s · design-system · tema-unico 15 s · griglia-mobile 201 s · render-3d-023 38 s ·
tunnel-285 213 s · home-298 122 s · web-237 63 s · career-critical 373 s · battito-264 410 s · partita-vera 703 s · gk-dive-sync 178 s ·
schermate-97 120 s. Le immagini rigenerate dalle sentinelle in `docs/collaudo-grafico/g0/` e `docs/governo/STABILITA.json` sono state
riportate allo stato di main (non sono di questo giro).
NON eseguiti (li giudica il treno): gli altri guardiani della riga `src/15-`, che non hanno motivo di cambiare perché il gioco non è
stato toccato; `residui-379` e `pagella-75` non rigirati.
