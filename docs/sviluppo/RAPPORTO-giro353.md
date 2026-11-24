# Giro 353 — i tre rossi nuovi del treno 45406157539 (7.999.209)

Base: `lavoro/201` punta **09e6de36** (treno della 7.999.209: vagoni 351 offerte di mercato e 352 eventi/impulsi legati all'età,
sopra la 7.999.208). Confronto: **04d2b4be** (7.999.208) e l'unione intermedia **e566d14** (solo il 351). Banco: sessione cloud,
`CPM_CHROME=/opt/pw-browsers/chromium`, ogni guardiano con `npm run`, base e unione in worktree a parte. Ramo di consegna:
`sviluppo/giro353-rossi-209`. `GAME_VERSION` non toccato.

**Esito in una riga:** nessuna regressione del gioco. Un rosso è il guardiano che non sapeva della decisione sulle età del giro 352
(caso b), due sono verdi stabili sul banco (caso c, `solo_runner`).

| guardiano | punta 09e6de36 | 7.999.208 (04d2b4be) | vagone responsabile | causa | correzione |
|---|---|---|---|---|---|
| impulsi-memoria-154 (parte 16) | **rosso** sul banco, come sul runner: «spogliatoio: … (incoerenti: wi_seg_lite_mister)» | verde · unione e566d14 (solo 351) verde · punta col rosso `__CPM_NO_G352` verde | **352** (caso b) | il giro 352 ha dato a `wi_seg_lite_mister` («il mister chiede ai più esperti») la condizione età ≥22, accettata dal PO il 24/11 13:50 («soglie età 25/30», tutte le consigliate). La sonda D del guardiano costruisce un pro alla quinta stagione **senza età**: `eta352` vale 18 e il seguito si spegneva per l'età, non per il club che la sonda vuole giudicare | **guardiano**: il giocatore della sonda D ha `age: 24`. Nessuna soglia toccata, la regola del 352 resta. Verde sulla punta; il rosso SPO (`CPM_ROSSO_SPO=1`) resta rosso (10 seguiti escono nel club nuovo) |
| render-3d-023 (parte 15) | verde 3 passate: p95 **133 · 150 · 133 ms** | verde 3 passate: p95 **100 · 133 · 133 ms** | **nessuno** (caso c) | sul runner p95 750 ms > 600. I due vagoni cambiano solo src/03 e src/06 (nessun 3D); sul banco le due versioni hanno la stessa distribuzione, lontana dal pavimento. È una misura di tempo reale: lentezza della macchina | riga `solo_runner` in ROSSI-DICHIARATI |
| guardalinee-222 (parte 23) | verde 3 passate su 3 (gambe del guardalinee 1 in festa-pc **761 · 451 · 757 px**) + festa-pc da solo verde | verde (472 px) | **nessuno** (caso c) | sul runner, un solo tentativo: maglia 1132 px e pantaloncini 1192 px misurati, gambe **0 px**. Ipotesi: la foto della maschera magenta presa dopo 120 ms fissi, prima che il gioco ridisegni. **Non posso confermarla**: con la CPU rallentata ×6 e ×20 (CDP) la versione di prima resta verde — il rallentatore CDP non rallenta il disegno della scheda grafica software, quindi non equivale al runner | riga `solo_runner`; **guardiano irrobustito** senza toccare soglie: dopo la pittura e dopo il ripristino aspetta due fotogrammi veri della pagina (regola «un evento, mai un tempo fisso» di PROCESSO.md); sotto 30 px stampa `maschera353` (pixel magenta prima del filtro: 0 = magenta non disegnato, >0 = fascia dei calzettoni vuota) e `y0/y1`; `CPM_CPU_LENTO=N` per misura. Verde e rosso `__CPM_NO_G222` rosso (6 verdetti) |

## Cosa ho misurato, in ordine

1. `npm run impulsi-memoria-154` sulla punta: rosso, lo stesso guasto del runner. Sulla 7.999.208 e sull'unione e566d14 (solo 351): verde.
   Il guardiano di prima sulla punta col rosso `__CPM_NO_G352` acceso: verde → la causa è la condizione del 352.
2. Lettura della condizione (`src/03` r. 904: `eta352(p)>=22`) e della sonda D (giocatore sintetico senza `age`). Correzione, verde, rosso SPO rosso.
3. `render-3d-023` tre volte per parte (sopra). Diff dei vagoni: solo src/03 e src/06 (+ ricomposto).
4. `guardalinee-222` sulla punta tre volte (verde) e sulla base (verde); log della parte 23 (job 138488074721): un solo tentativo, gambe 0 px.
   Prova provocata con CPU ×6 e ×20 sulla versione di prima: verde. Causa non confermata.

## Decisioni del PO toccate

24/11 13:50 (soglie età 25/30, giro 352): il guardiano `impulsi-memoria-154` è stato allineato dando un'età al giocatore sintetico,
non abbassando una soglia né togliendo la condizione.

## Rigiocata dopo le correzioni

Catena del giro: `node ci-runner.mjs giro impulsi-memoria-154 render-3d-023 guardalinee-222 eta-352 offerte-351 career-critical`
(+ sentinelle, 21 passi), sulla punta del ramo 5f68ca12: **21/21 verdi**, nessun passo ripetuto — impulsi-memoria-154 41 s ·
render-3d-023 36 s · guardalinee-222 472 s · eta-352 11 s · offerte-351 3 s · career-critical 303 s · partita-vera 681 s ·
battito-264 401 s · tunnel-285 257 s · gk-dive-sync 189 s · griglia-mobile 172 s · home-298 119 s · schermate-97 115 s · replay 48 s ·
web-237 45 s · migrazione-194 24 s · tema-unico 14 s · test:logic · save-compat · design-system · mappa-unica. Esito registrato in
`docs/governo/STABILITA.json`. (Il runner stampa «su 7.999.208»: è la `GAME_VERSION` del file, non toccata.) Le foto rigenerate
dalla sentinella grafica in `docs/collaudo-grafico/g0` non sono state committate.

## Da sapere (fuori ambito)

- `ROSSI-DICHIARATI.json` è cambiato solo sul ramo: il rilascio lo legge da **main**. Non l'ho portato su main.
- Se `guardalinee-222` torna rosso sul runner, il campo `maschera353` dirà quale dei due casi è: se è 0, l'attesa a fotogrammi non è
  bastata e serve un testimone del fotogramma disegnato dal gioco.
