# Rapporto giro 302 — tre ritocchi del PO (20/11) sulla 7.999.198

Ramo `sviluppo/giro302-ritocchi`, partito da `prova/198-blocco2` (afd61ac3). `GAME_VERSION` non toccata. `src/12` non toccato.
Rosso unico dei tre ritocchi: `window.__CPM_NO_G302`. Guardiano nuovo: `npm run ritocchi-302` (verde col verde, rosso col rosso).

## Cosa è cambiato

| | Prima (misurato col rosso) | Dopo (misurato col verde) | Dove |
|---|---|---|---|
| **PO-552 cambiata** «Toglierli» | Home da PC: riga con tre pulsanti «1 2 3» e la scritta «salvataggi» | riga assente (0 righe, 0 tasti, scritta assente); le tre schede dei salvataggi ci sono; il tasto 1 della tastiera apre la carriera, il tasto 2 la creazione | `src/17` |
| **PO-589** striscia «Scarico i giocatori 3D · NN%» | fondo `rgba(5,8,20,.94)`, testo bianco 11 px, riempimento ambra al 38% alto quanto la striscia, alta 19 px | fondo `TINTE.sup`, testo `TINTE.testo` 13 px, contrasto testo/fondo **14,79**, barra di 3 px in basso (binario `TINTE.tasto`) con sfumatura nel colore del tasto principale, alta **16 px**, non prende i tocchi | `src/11` `_pillola233` |
| PO-589, schermata «Caricamento dei giocatori» | binario `rgba(255,255,255,.14)`, riempimento `#f59e0b` | binario `TINTE.tasto`, riempimento con la stessa sfumatura (solo i colori della barra) | `src/11` `copri233` |
| **PO-590** fascia di riserva | «C» al titolare con l'«attitudine» più alta ricavata dal nome | «C» al titolare più anziano, «VC» al secondo (prima restano eroe e spogliatoio, come nel 299) | `src/18` `fascia299` + `eta302` |

### Note di misura

- **Colore d'accento della striscia.** È quello della regola del tasto principale (giro 235, `tasto235`): crema fuori dalla carriera,
  colore del club in carriera. Misurato: Home → barra `rgb(244,241,234)` = fondo del tasto «Continua →» a schermo; club chiaro
  `#f5f5f5` → barra `rgb(245,245,245)`; club nero `#0f0f0f` (FC Frankfurt) → il nero sul fondo della striscia avrebbe contrasto 1,15,
  quindi la barra è alzata a `rgb(157,157,157)` (contrasto 6,15) con la funzione già esistente `legCol944`.
- **Altezza.** Una prima stesura a 25 px copriva la scritta della versione nella Home del telefono; a 19 px (come prima) la
  striscia copriva 3 px del riquadro dei tasti in alto («Home» da PC, «Salva» e «Opzioni» in carriera, che cominciano a 16 px) —
  e questo succedeva già prima del giro (stessa misura col rosso). A 16 px non copre più niente di disegnato.
- **Testo e barra.** La gamba della «g» finiva a 14 px, uno dentro la barra (che comincia a 13): testo alzato di 1 px, ora finisce a 13.
- **Età dei compagni.** MISURATO nel codice: la rosa (`generateTeamRoster`) porta solo nome e ruolo, il gioco non ha un'età per i
  compagni. Per applicare «il più anziano» l'età è ricavata, fissa e senza campi nel salvataggio: età d'arrivo dal nome (18–28)
  + gli anni già passati nel posto in rosa (0–6, la stessa fase d'ingaggio con cui la rosa cambia i giocatori) → 18–34, e cresce
  di uno a stagione finché il giocatore resta (verificato: 4307 casi su 4307). In Primavera 16–18 dal nome. A pari età: chi è nel
  club da più anni, poi ordine alfabetico.

## Guardiano `ritocchi-302` (ultima corsa)

- **VERDE: ok.** A riga assente e scorciatoie attive · B quattro scene (Home PC, Home telefono, carriera con club nero, carriera con
  club chiaro): contrasto 14,79, striscia 16 px, niente coperto · C regola «C» 756/756 e «VC» 756/756 (252 club × 3 stagioni),
  Primavera 18/18; a schermo: FC Frankfurt senza capitano → C Nico Günther, VC Werner Wendel; Primavera → C Giacomo Luzi, VC Vincenzo Costa.
- **ROSSO (`__CPM_NO_G302`): cade su A (1 rilievo), B (31), C (7).** Con l'attitudine la «C» coincide col più anziano solo in 85 casi su 756.

## Guardiani aggiornati

- `prepartita-pc-300`, braccio C: ora chiede che da PC la riga NON ci sia e che i tasti 1 e 2 della tastiera aprano ancora slot e
  creazione (tolti i clic sui pulsanti, che non esistono più). Il suo rosso `__CPM_NO_G300` fa tornare la riga e C cade.
- `homepc-284`, H5: da «tre tasti ≥ 44 px» a «riga assente»; H5 tolto dall'elenco di ciò che il rosso del 284 deve far cadere
  (col rosso del 284 la riga non torna: la toglie il 302).
- `rosa-angoli-299`, braccio A: quarto salvataggio **senza «capitano» nello spogliatoio** (dubbio 2 del giro 299); l'atteso
  (i due titolari più anziani) lo ordina la sonda. Il controllo «casi coperti» ora pretende sia il caso dallo spogliatoio sia quello
  senza capitano. Esito: «C» su Jacopo Rosi (32 anni), «VC» su Nino Parodi (31).
- `ci-runner.mjs`: `ritocchi-302` aggiunto alla mappa (src/01, 11, 17, 18). `package.json`: script `ritocchi-302`.

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito | Durata | Ultima riga / nota |
|---|---|---|---|
| `ritocchi-302` (nuovo) | verde col verde, rosso col rosso | ~55 s | ✅ ritocchi-302 VERDE |
| `rosa-angoli-299` | verde (uscita 0) | 604 s | verde: 0 falliti su 24 · rosso: cade su A, B, C · non giudicati 0. Un primo lancio fermato a 580 s dal tetto della chiamata non vale ed è stato rifatto da capo |
| `prepartita-pc-300` | verde (uscita 0) | 124 s | VERDE ✓ · ROSSO cade su Apc Atel Bpc Cpc Dpc Dtel (15 rilievi) |
| `homepc-284` (verde + rosso) | verde (uscita 0) | 21 s | ✅ homepc-284 VERDE |
| `home-298` (verde + rosso) | verde (uscita 0) | 119 s | rosso come atteso: tornano i cinque difetti (63 rilievi) |
| `glb-pronti-232` | verde (uscita 0) | 154 s | ✅ verde (e il rosso si vede) |
| `attesa-241` | verde (uscita 0) | 60 s | ✅ VERDE |
| `design-system` | verde (uscita 0) | <1 s | ✅ SISTEMA GRAFICO OK |
| `tema-unico` (verde + rosso) | verde (uscita 0) | 17 s | rosso atteso ok |
| `griglia-mobile` | verde (uscita 0) | 187 s | misura completa: 14 schermate × 5 larghezze |
| `test:logic` | verde (uscita 0) | 2 s | |
| `save-compat` | verde (uscita 0) | 1 s | ✅ PASS |
| `avvio-233` | **non concluso** | — | fermato a 225 s dal tetto di tempo durante la prima misura: non vale, né verde né rosso |

`node tools/build-src.mjs` e `node tools/check-src.mjs` dopo ogni modifica a `src/` (file ricomposto dai frammenti; la differenza
dal commit precedente è quella delle modifiche, poi committata).

### NON eseguiti

- Per regola del giro: `highlight-95`, `ingresso-206`, `career-critical`, `node ci-runner.mjs mirata`.
- Per tempo, dalla mappa dei file toccati (src/01, 11, 17, 18): `avvio-233` (da rifare: legge la striscia di scarico, è il più
  vicino al ritocco PO-589), `rosa-228`, `spogliatoio-182`, `nomi-182`, `crea-home-295`, `accessibilita-234`, `rigorista-257`,
  `patto-227`, `patto-238`, `pc-tablet-292`, `schermate-97`, `spazio-296`, `grafica-v2`, `partita-v2`, `momenti-v2`, `simula-v2`,
  `patrimonio-303`, `carriera3-94`, `salienti-229/243/246/253`, `pulsanti-263`, `coerenza-235`, `testata-209`, e tutti gli altri
  della mappa non elencati nella tabella sopra. Nessuno di questi è stato lanciato: non posso confermarne l'esito.
- Il gate `validate-situations` e la catena completa non sono stati eseguiti (giro di soli ritocchi grafici/di carriera, tetto di tempo).

## Ambiente

- `tests/visual/node_modules` non era installato. `npm install` falliva: il registro risponde 404 sul pacchetto
  `@babel/standalone` 7.29.15. Installato con `npm install --no-save --no-package-lock @babel/standalone@7.29.14`
  (dentro il vincolo `^7.23.6` di `package.json`, che non è stato modificato). Nessun `playwright install`.
- Foto rigenerate da altri controlli (`docs/sviluppo/giro284/`, `docs/collaudo-grafico/g0/`) rimesse con `git restore`.

## Foto

`docs/sviluppo/giro302/`: `prima-*` (rosso `__CPM_NO_G302`) e `dopo-*` — Home da PC e telefono (A), striscia in quattro scene con
ritaglio dei primi 70 px e schermata d'attesa (B), Rosa pro e Primavera senza capitano (C). Nelle foto la striscia è allo 0%
perché la sonda trattiene i modelli in rete: la barra si vede appena (minimo 2% di larghezza).

## Dubbi per il PO

1. **L'età dei compagni non esiste nel gioco: l'ho ricavata.** «Il più anziano» oggi è un'età calcolata dal nome e dagli anni nel
   posto in rosa (vedi «Note di misura»), non mostrata in nessuna schermata. Va bene così, o preferisci che «più anziano» voglia dire
   «da più anni nel club» (dato che la rosa ha già), oppure che l'età compaia da qualche parte (per esempio nella riga della Rosa)?
2. **L'eroe non entra nel conto dei più anziani.** Come nel 299, la fascia di riserva va solo ai compagni: l'eroe la porta se l'ha
   guadagnata (capitano) o per il premio del patto (vice). Se l'eroe ha 34 anni e nessuno sa chi è il capitano, la «C» va comunque a un compagno.
3. **Vice quando il capitano è noto.** Se il capitano viene dallo spogliatoio o è l'eroe, e il vice non è noto, la «VC» va al
   titolare più anziano diverso dal capitano (stessa regola estesa). Non era scritto nella decisione.
4. **Primavera.** Età 16–18: molti pari età, quindi spesso decide l'anzianità nel club e poi l'alfabeto.
5. **Barra della striscia: un filo di 3 px, non più un riempimento a tutta altezza.** Col riempimento pieno il testo chiaro sarebbe
   finito sopra il colore del tasto (crema fuori carriera, o un club chiaro) e non si sarebbe letto. La sfumatura va dal colore al 45% al colore pieno.
6. **Club scuri.** Per i club col colore che non si vede sul fondo (i neri) la barra è un grigio alzato dallo stesso colore, non il nero del tasto.
7. **Striscia più bassa di prima (16 px contro 19).** Scelta per non coprire i tasti in alto; il testo è comunque più grande (13 px contro 11).
8. **Schermata «Caricamento dei giocatori».** Ho cambiato solo binario e riempimento della barra; il titolo resta ambra `#f59e0b`
   scritto a mano. Lo porto ai colori del tema?
9. **`homepc-284` H5 ora non ha più un braccio rosso suo** (l'assenza della riga è coperta in rosso da `ritocchi-302` e da `prepartita-pc-300`).
10. **`avvio-233` va rifatto** con un tetto più lungo prima dell'unione: non l'ho concluso.
