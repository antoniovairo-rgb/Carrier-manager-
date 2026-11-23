# Rapporto giro 332 — guardiani instabili resi stabili (PO-620)

Base: `lavoro/201` punta `55a500d5` (7.999.205). Ramo: `sviluppo/giro332-instabili-ui`. `GAME_VERSION` non toccato (rilascio
automatico acceso). Banco: sessione cloud, 4 cpu, `CPM_CHROME=/opt/pw-browsers/chromium`. Soglie: nessuna cambiata.

Regola seguita (PROCESSO.md, «Controlli instabili»): prima la causa misurata, poi la correzione, poi 5 corse di fila col braccio rosso
che resta rosso. Due dei quattro «falsi rossi» non erano falsi: erano **difetti veri del gioco** che il banco veloce vedeva di rado.

| guardiano | causa misurata | dove si corregge | corse verdi di fila (dopo) | rosso |
|---|---|---|---|---|
| `scelte-201` | 8,8 % delle interviste ha una domanda con `cond` (funzione): la finestra non si salvava | **gioco** (src/18) + sonda | 5/5 (`npm run scelte-201`) | `__CPM_NO_G201` bocciato 5/5 · `__CPM_NO_G332` bocciato 5/5 |
| `nomi-182` | lampo di un fotogramma: la scala dei nomi scendeva in un compito dopo il ResizeObserver | **gioco** (src/11) + sonda | 5/5 + 1 a CPU ×4 | `CPM_ROSSO258` 5/5 · `CPM_ROSSO332` 5/5 (3/3 ripetizioni) |
| `diagonali-210` | i tasti via CDP passano dal ciclo dei fotogrammi (~400-500 ms sul banco); lettura dell'eroe e della fase a tempo di parete | sonda | 5/5 + 1 | `__CPM_NO_G210` bocciato 6/6 (3,54u, 4 tasti, pad sparito) |
| `rigori-296` C | il gol del compagno a volte cade **in scena**: la ripresa schiera per la regola del giro 27 in entrambi i bracci | sonda (caso non valido → si ritenta) | 5/5 (A+B+C) | «compagno» rosso: fuori 7-8, hold 2 in 5/5 |

## 1. scelte-201 — «intervista: aperta · dopo il ricaricamento NON TORNA» (treno 45050383306)

**Causa (misurata, non ipotizzata).** Log del runner scaricato: solo il caso `intervista` rosso, tutti gli altri verdi, tempi per caso
uguali al banco (~13 s): il runner non era lento. Sul banco, con la sonda originale sotto carico (due corse insieme): **3 «NON TORNA» su
16** (`d2/d3`, 23/11). Testimone aggiunto alla sonda (copia in memoria e nello slot, sei letture prima del ricaricamento): nei casi rossi
`-/-/V` — finestra a schermo ma `player.scelte201` **mai scritto**, né in memoria né sul disco. Sonda `CPM_FN332` (600 estrazioni di
`pickInterviewByCtx` sul salvataggio del guardiano): **53/600 (8,8 %)** domande portano `cond` (funzione: «voci di mercato», «Nazionale»,
«capitano», «leadership», «pressione»…). `_j201` vede la funzione e scarta **tutta** l'intervista. Un giocatore vero che chiude l'app
durante una di quelle interviste la perde: difetto del gioco, non del runner (il runner ha solo pescato la domanda sbagliata).

**Correzione nel gioco** (`src/18-career-app.jsx`, `_iv332`): nella copia salvata dell'intervista si toglie `cond` (serve solo a
scegliere la domanda, src/07). Rosso `window.__CPM_NO_G332` = come prima.

**Correzione della sonda** (`tests/visual/scelte-201.mjs`): caso nuovo `intervista-cond` che **provoca** una domanda condizionata
(forceInterview finché a schermo c'è una domanda con `cond`, tetto 120); ricaricamento solo a **salvataggio allineato** alla memoria
(due letture uguali a 800 ms, tetto 25 s) invece di 1,5 s fissi; scelta attesa come **evento** (tetto 8 s) prima e dopo il
ricaricamento. Braccio rosso nuovo `CPM_ROSSO332=1` (solo `intervista-cond`, deve uscire 1), aggiunto allo script npm. `CPM_CPU=<n>`
rallenta la CPU via CDP.

**Prima/dopo:** prima 3/16 rossi sotto carico sul caso casuale; dopo 5 corse intere consecutive verdi (592-598 s) + 1 a CPU ×4 (1081 s) (`intervista` e `intervista-cond`
verdi in tutte), rosso G201 «4 scelte su 16 tornano» 5/5, rosso G332 «intervista-cond NON TORNA» 5/5.

## 2. nomi-182 — «slot-club-182 · FC Biancocelesti Primavera (tagliato, 142>75px)» a 412 px (treno 45066026690)

**Causa.** Log del runner: la riga del salvataggio della Home mostra alla fine «Biancocelesti» (livello 3), ma il censimento aveva
fotografato una volta il nome intero tagliato. Riprodotto sul banco carico (corsa 1, «142>76px») e con una sonda a grana fine
(`slot332.mjs`, MutationObserver + rAF + campioni a 50 ms + ResizeObserver strumentato): **6/6 caricamenti** mostrano la sequenza
genitore 237→134 px, nome intero tagliato, poi la discesa. Due difetti distinti:
1. **Gioco**: il ResizeObserver di `NomeSquadra182` chiedeva il nuovo giro a React con un `setState` normale, eseguito in un compito
   successivo: il fotogramma veniva disegnato col nome tagliato. Un telefono lento lo vede.
2. **Sonda**: anche dopo la correzione, il campione (setInterval che forza il layout) può cadere **fra** il cambio del DOM e il passo di
   disegno in cui il ResizeObserver corregge: misurato «letto a t+0 ms, corretto dal ResizeObserver a t+2 ms», stato mai disegnato.

**Correzione nel gioco** (`src/11-ui-kit-highlight.jsx`, `_sub332`): dentro il callback del ResizeObserver la discesa si fa con
`ReactDOM.flushSync`: la scala arriva al gradino giusto prima del disegno. Rosso `window.__CPM_NO_G332`.

**Correzione della sonda** (`tests/visual/nomi-182.mjs`): (a) parte 4 nuova, il caso **provocato** e indipendente dalla velocità: la
riga si allarga (scala al nome intero), poi si stringe; un secondo ResizeObserver creato dopo quello della scala legge testo e larghezze
nello stesso fotogramma (3 ripetizioni). Verde «Biancocelesti livello 3, 79,2/79,2 px» 3/3; rosso `CPM_ROSSO332=1` «FC Biancocelesti
Primavera livello 0, 159,5/91,8 px» 3/3. (b) il censimento conta un taglio solo se **sopravvive a un fotogramma** (rAF + compito, stesso
testo, ancora tagliato) e dichiara a parte gli «stati transitori mai disegnati» (visti 0-1 per corsa). Vedi dubbio 1.

**Prima/dopo:** prima rosso sul runner e 1/1 sul banco carico; dopo 5/5 verdi consecutive + 1 a CPU ×4 (339 s), rosso 258 bocciato 5/5,
rosso 332 bocciato 5/5.

## 3. diagonali-210 — invio dei tasti dipendente dalla macchina (VERIFICA202)

**Causa.** `keyboard.down(a)` atteso, poi `keyboard.down(b)`: Playwright aspetta la risposta del renderer al primo tasto prima di spedire
il secondo; sul banco carico la pagina vedeva i tasti a 166-196 ms (chiesti 0/20/40) e, aspettando anche la risposta prima del rilascio,
li vedeva **tenuti 352-417 ms**, oltre la pausa di 400 ms fra due passi: «2 passi, 2 mosse» (9 difetti su 12 accordi nella prima
corsa corretta a metà). Il gioco fa la cosa giusta per due frecce premute a 400 ms. Seconda instabilità trovata nella corsa 2 delle
cinque: «P ◣: l'eroe si è spostato di 19,51u invece di 2,5u» con passo, direzione e mosse giusti — la distanza si misurava fra una
lettura prima del tocco e una 700 ms di parete dopo, mentre la scena forzata stava ancora sistemando l'eroe.

Tre tentativi di consegna via CDP misurati e scartati, con un contatore di fotogrammi nella pagina (`__RAF210`): (1) invii senza
attesa: secondo tasto a 166-196 ms se chiesti 20/40 ms; (2) rilascio dopo uno o due fotogrammi: il rilascio arriva solo col fotogramma
dopo, tenuta 600-1700 ms, «non giudicato» a ogni ritentativo; (3) criterio «fotogrammi entro 400 ms»: 2 passi in 12 accordi su 12. Un
`setTimeout` dentro la pagina slittava di 300-1100 ms (filo principale occupato dai fotogrammi). Una terza instabilità: «T: dopo la
prima mossa fase hl_move» (fase letta a 700 ms fissi; il passaggio a hl_choose arriva da un timer del gioco).

**Correzione (sonda, `tests/visual/diagonali-210.mjs`).** L'accordo si **suona dentro la pagina**: i due `keydown` partono dallo stesso
compito, separati da `delta` ms di `performance.now` (attesa attiva), sullo stesso `document` dove ascolta il gioco; il rilascio sta nel
rAF del primo fotogramma dopo i due tasti, registrato dopo il ciclo del passo del gioco: il ciclo li vede in quel fotogramma, il
successivo no. Il `keyup` si registra (`__KU210`). Se l'intervallo visto supera delta+20 ms si ritenta (fino a 4), poi «non giudicato».
Lo spostamento dell'eroe si misura sul **suo passo** (testimone `__CPM_PASSO210.mk` contro il punto logico letto appena il passo è
arrivato); sul telefono il passaggio a hl_choose si **aspetta** come evento (tetto 3 s dal tocco). Il pad sul telefono e sul PC resta
col tocco/clic vero (`touchscreen.tap`/`mouse.click`).

**Corse:** 5/5 verdi consecutive (168-195 s, 12/12 accordi da 2,5u in ogni corsa, nessun ritentativo) + 1 in più; rosso `__CPM_NO_G210`
bocciato in tutte (G 4 tasti, T pad sparito, K 3,54u). ⚠️ `CPM_CPU` non è collegato a questa sonda: la sesta corsa è una corsa normale.

## 4. rigori-296 parte C — braccio rosso «compagno» che non mostra il difetto

**Causa.** Testimone `__CPM_KO207` aggiunto all'uscita della sonda (`sch`, `scena`, `eroe`, `rig296`). 3+3 corse del solo rosso
(23/11): quando il rigore del compagno entra **con il motore ancora in scena** (`scena: true`) la ripresa schiera i ventidue per la
regola del giro 27 in **entrambi** i bracci → rosso «fuori 0, hold 11»; quando entra fuori scena il rosso mostra il difetto («fuori 6»,
«fuori 7», «fuori 8», hold 2). Il verde, in quei casi, passava senza aver esercitato la correzione del giro 296.

**Correzione (sonda, `tests/visual/ripartenza-piazzato-27.mjs`).** Il caso «compagno» si giudica solo con `scena false` e `eroe false`;
altrimenti il tentativo è «non valido» e si ritenta (tentativi 5→6, come già si faceva col rigore parato). Il verde, in più, deve essere
passato dalla regola del 296 (`rig296: true`), altrimenti «non giudicato». Nessuna soglia cambiata.

**Corse:** `npm run rigori-296` (A+B+C) 5/5 verdi consecutive (1113-1267 s); in tutte il caso compagno: verde `rig296 true`, hold 11,
fuori 0; rosso hold 2, fuori 7 o 8 (soglia ≥5). In queste cinque il rosso è arrivato valido al terzo tentativo (gol provocato fuori scena);
il caso «in scena» era uscito 1 volta su 3 nelle corse di misura.

## ROSSI-DICHIARATI.json

Nel ramo: tolti `diagonali-210` e `rigori-296` da `banco`, `scelte-201` e `nomi-182` da `solo_runner`, con la riga `_giro332`. Gli altri
rossi dichiarati restano com'erano (non toccati, non misurati qui).

## Dubbi per il PO

**Dubbio 1 — nomi-182: un taglio «a schermo» è quello che sopravvive a un fotogramma?** Il censimento campionava con un compito che
forza il layout e poteva leggere stati mai disegnati. Ora conta solo ciò che resta dopo un fotogramma; il lampo di un solo fotogramma
lo giudica la parte 4 provocata.
1. **(consigliata)** Tenere così: censimento = tagli che restano a schermo; lampo di un fotogramma = parte 4 provocata, deterministica,
   con rosso `CPM_ROSSO332`. Ogni nuova fonte di lampo (non ResizeObserver) va provocata nella parte 4.
2. Tornare al criterio «ogni campione»: più severo, ma rosso a caso sul runner per stati che il telefono non disegna.
3. Censimento a campioni presi solo dentro i ResizeObserver (dopo la scala): esatto sul disegno, ma cieco a tagli che non cambiano
   dimensione.

**Dubbio 2 — rigori-296 C: il gol del compagno che cade in scena.** È un caso di gioco reale (il rigore del compagno entra mentre il motore
è ancora in scena) e lì la ripresa schiera per il giro 27 comunque: corretto per il calcio, ma non è il caso che il 296 ha corretto.
1. **(consigliata)** Lasciarlo fuori dal giudizio del 296 (come ora) e dichiararlo nel testimone: il 296 riguarda il gol fuori scena.
2. Aggiungere un braccio dedicato «compagno in scena» che pretende la schiera (verde) e la stessa schiera col rosso (nessun rosso
   possibile → braccio solo verde, dichiarato).
3. Provocare sempre il gol fuori scena dalla sonda (esito del motore forzato fuori scena), togliendo i tentativi naturali: più veloce,
   ma non esercita più il dado vero del motore.

**Dubbio 3 — diagonali-210: «0 ms» non è consegnabile.** Il banco consegna i due tasti a 0-2 ms (accordo «a 0») ma a 166-196 ms quando si
chiedono 20 o 40 ms (il `sleep` di node fra due invii senza attesa). Ora quei campioni si ritentano.
1. **(consigliata)** Tenere i tre accordi e il ritentativo con tetto: il criterio resta «come vede la pagina».
2. Sostituire 20/40 ms con eventi sintetici con `timeStamp` imposto: deterministico, ma non passa dalla via d'ingresso vera.
3. Tenere solo l'accordo a 0 ms sul banco e 20/40 ms nel collaudo su dispositivo.

## Giro

`node ci-runner.mjs giro scelte-201 nomi-182 diagonali-210 rigori-296 ripartenza-piazzato` (guardiani toccati + 17 sentinelle) sul
build del ramo: **22/22 verdi**, nessun passo «instabile» (nessuna seconda prova), scritto in `docs/governo/STABILITA.json`.
Le 5 corse di stabilità per guardiano sono state fatte a parte, con `npm run <guardiano>` (verde + bracci rossi dello script).

## Cosa non è stato fatto

- ROADMAP non aggiornata: nessuna versione spedita da questo ramo (GAME_VERSION invariato, lo fa il rilascio automatico).
