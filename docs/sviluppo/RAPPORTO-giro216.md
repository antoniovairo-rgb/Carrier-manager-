# Rapporto giro 216 — la striscia della lotteria con l'eroe a sinistra (PO-482)

Ramo `sviluppo/giro216-striscia`, partito da `lavoro/195` (6be6158, contiene i giri 214 e 215). `GAME_VERSION` non toccata, roadmap
non toccata. Rosso unico del giro: `window.__CPM_NO_G216` (= comportamento del 214). Ogni numero qui sotto è **misurato** con la
sonda o il guardiano indicato; dove non lo è lo scrivo. Foto in `docs/sviluppo/giro216/` (telefono 375×667, PC 1366×768).

Riprende il dubbio 1 del giro 214 (`RAPPORTO-giro214.md`): in trasferta, durante la lotteria, la striscia in alto leggeva «1 - 2»
(casa a sinistra) mentre il tabellone «CALCI DI RIGORE» sotto leggeva «2 — 1» (eroe a sinistra).

## 0. In breve

| Punto | Prima (codice di `lavoro/195` = rosso `__CPM_NO_G216`) | Dopo | Guardiano |
|---|---|---|---|
| Striscia in trasferta, durante la lotteria | eroe a **destra** in tutti i campioni (telefono 11/11, PC 8/8); ordine opposto al tabellone leggibile in tutti i campioni con la serie non pari (telefono 4/4, PC 2/2) | eroe a **sinistra** in tutti i campioni giudicati (telefono 12/12, PC 9/9), stesso ordine del tabellone in tutti | `tabellone-214` (corse B, D, E) |
| Sigle/stemmi rispetto ai numeri | coerenti (il 214 girava tutto insieme) | coerenti in tutti i campioni: si specchia la barra intera, stemmi, nomi e numeri insieme | `tabellone-214` |
| Fine della lotteria (cerimonia) | casa a sinistra | casa a sinistra (in trasferta torna «FC Valmora 1-1 FC Salernum») | `tabellone-214` |
| In casa | eroe a sinistra | invariato (telefono 12/12, PC 9/9) | `tabellone-214` (corsa A) |

## 1. Misura prima

Sonda `tests/visual/sonda-214.mjs` estesa (nessuna soglia cambiata): a ogni campione legge anche
- l'**ordine della striscia**: i due blocchi squadra (`data-cpm="scudo-casa"` / `"scudo-ospiti"`, stemma + nome) ordinati per posizione
  sullo schermo, e il testo di quello a sinistra e di quello a destra;
- l'**ordine del tabellone**: la prima sigla («SAL») e il punteggio («2—1»).

L'eroe è FC Salernum (sigla SAL), l'avversario FC Valmora. Misurato sul codice di `lavoro/195` (modifica messa da parte con
`git stash`, `check-src` IDENTICO sul vecchio contenuto), 4 corse: telefono/PC × casa/trasferta.

- **In casa** (telefono 11 campioni, PC 8): «FC Salernum *serie eroe*–*serie avversario* FC Valmora», tabellone «SAL …» con lo stesso
  ordine: 11/11 e 8/8.
- **In trasferta** (telefono 11, PC 8): striscia «FC Valmora 0–1 FC Salernum» mentre il tabellone dice «SAL 1—0». Eroe a sinistra
  nella striscia **0/11** e **0/8**; ordine opposto visibile (serie non pari) 4 campioni su 4 e 2 su 2. Le sigle erano già coerenti
  coi numeri (11/11, 8/8): il numero di sinistra stava sempre sotto la squadra che l'aveva segnato.
- Una seconda coppia di corse in trasferta con la foto presa al primo punteggio **non pari** (`CPM_FOTO_DIVERSA=1`): telefono 0/11,
  ordine opposto 5/5; PC 0/9, ordine opposto 3/3.

Foto: `prima-telefono-trasferta-diversa-serie.png` (la differenza si vede), `prima-*-serie.png` (primo campione con almeno un rigore:
cadono su un pari 1–1, quindi l'ordine dei numeri non si distingue, si vede quello dei nomi), `prima-*-fine.png`/`prima-*-dopo.png`
(fine serie e cerimonia). La corsa PC in trasferta con `CPM_FOTO_DIVERSA` non ha prodotto la foto: i campioni non pari erano tutti
sotto lo stacco nero fra due rigori (la sonda non fotografa lì).

## 2. Correzione (solo `src/15-live-match.jsx`; `__CPM_NO_G216` la spegne)

- `_so216 = phase==="shootout" && soState && !isMatchHome` (spento anche da `__CPM_NO_G214`, perché senza il 214 la striscia non
  mostra la serie).
- Con `_so216` vero, `_swap893` (lo specchio della barra del 7.893, oggi spento di norma da `_fisse297`) vale **vero**: la barra intera si
  gira — stemmi e nomi (`flexDirection: row-reverse`) e numeri (`_swap893 ? _aVal901 : _hVal901`) insieme, quindi mai numeri girati
  sotto sigle non girate. Vale per la barra nuova e per quella vecchia (`__CPM_NO901`), che usano lo stesso `_swap893`.
- Fuori dalla fase `shootout` `_so216` è falso e `_swap893` torna al suo valore di prima: in cerimonia casa a sinistra col risultato
  della partita. In casa `_so216` è sempre falso: nulla cambia.
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**.

**Effetto collaterale visto e misurato:** quando la barra si specchia (all'inizio della serie e all'inizio della cerimonia, in
trasferta) gli stemmi rimontano e scorrono per 0,6 s (`cpmSwapCasa905`, l'animazione già esistente del 7.905). In una corsa PC un
campione è caduto proprio lì e leggeva ancora «FC Valmora 0–0 FC Salernum»: con `getAnimations()` la sonda ha confermato che gli
stemmi stavano scorrendo. Ora un campione preso durante lo scorrimento non è giudicato sull'ordine e si conta a parte
(`scorrimento216`: 0 o 1 per corsa).

## 3. Misura dopo

Sonda, 4 corse + 2 con foto «non pari»:
- in casa telefono 12/12, PC 9/9 (eroe a sinistra, stesso ordine del tabellone, sigle coerenti);
- in trasferta telefono 12/12, PC 9/9 (una corsa PC: 9/10 col campione dello scorrimento, poi giudicato a parte); ordine opposto 0;
- dopo la serie, in cerimonia: in trasferta «FC Valmora 1–1 FC Salernum», in casa «FC Salernum 1–1 FC Valmora».

Foto: `dopo-telefono-trasferta-diversa-serie.png` e `dopo-pc-trasferta-diversa-serie.png` (serie non pari: striscia e tabellone
con SAL a sinistra), `dopo-*-serie.png`, `dopo-*-fine.png`, `dopo-*-dopo.png` (cerimonia tornata casa a sinistra).

## 4. Guardiano (nessuna soglia abbassata)

**`tabellone-214`** aggiornato: tutte le soglie del 214 restano; il punteggio «orientato» atteso ora ha l'eroe a sinistra anche in
trasferta (decisione PO). Corse: A verde telefono in casa · B verde PC in trasferta · C rosso `__CPM_NO_G214` · **D** verde telefono
in trasferta (nuova) · **E** rosso `__CPM_NO_G216`, telefono in trasferta (nuova). Soglie aggiunte, scritte nel file:
- **verde (A, B, D)**: almeno 5 campioni giudicati e almeno 1 con la serie non pari (altrimenti l'ordine non si vede = non giudicato
  = rosso); in **ogni** giudicato numero e nome/stemma dell'eroe a sinistra nella striscia, tabellone con l'eroe a sinistra, cioè stesso
  ordine; sigle coerenti coi numeri; ordine opposto 0; in cerimonia casa a sinistra.
- **rosso (E)**: nessun giudicato nello stesso ordine, almeno 1 con l'ordine opposto visibile, sigle coerenti, almeno 5 giudicati.

Esito (corsa unica, ~13 min, uscita 0):
- A: giudicati 13 (scorrimento 0, serie non pari 5) · eroe a sinistra 13 · stesso ordine 13 · sigle coerenti 13 · dopo «FC Salernum |
  FC Valmora»; tutte le misure del 214 verdi (pixel del 3D attraverso il tabellone max 0).
- B: giudicati 8 (scorrimento 1, non pari 5) · 8 · 8 · 8 · dopo «FC Valmora | FC Salernum».
- C: rosso del 214 visto («RIGORI» 0/12, pixel del 3D fino a 35.830).
- D: giudicati 11 (scorrimento 1, non pari 5) · 11 · 11 · 11 · dopo «FC Valmora | FC Salernum».
- E: giudicati 13 · eroe a sinistra 0 · stesso ordine 0 · ordine opposto 6 · sigle coerenti 13.

`ci-runner.mjs` non toccato: `tabellone-214` vi è già una volta in `completa` e una in `carriera`, e nella MAPPA di `src/15`.
Durata cresciuta da ~8 a ~13 minuti (vedi dubbio 3).

## 5. Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `CPM_CI_PAR=0`, `free -m`/`df -h` prima di ciascuno)

| Controllo | Esito | Durata |
|---|---|---|
| `tabellone-214` | ✅ verdi A, B, D · rossi C, E visti | ~13 min |
| `piazzato-204` | ⚠️ **instabile, non per questo giro**: 3 rossi e 1 verde (vedi dubbio 1) | 7 min a corsa |
| `lotteria-191` | ✅ (verdi, tre rossi visti) | 324 s |
| `rigore-191` | ✅ (verde-prod, verde-banco, rosso visto) | 265 s |
| `hud-c3` | ✅ uscita 0 | 393 s |
| `sigle-203` | ✅ uscita 0 (VERDE 18/0 e 8/0, braccio rosso «il difetto si vede») | 575 s |
| `career-critical` | ✅ uscita 0, 5 «✅ PASS», nessun ❌ | 747 s |
| `test:logic` | ✅ pass 51 · fail 0 | 3 s |
| `save-compat` | ✅ 12 pass · 0 fail | 14 s |

Nota: all'inizio la sonda non partiva (`node_modules` assenti nel container): `npm install` in `tests/visual`, poi rifatte da capo.

## 6. Dubbi per il PO

1. **`piazzato-204` è instabile già su `lavoro/195`.** Il braccio «verde maxischermo» chiede almeno 300 pixel bianchi della scritta
   «RIGORI» in **ogni** campione fuori dallo stacco nero. Quattro corse: con la mia modifica rosso (minimo 0, massimo 1.176), rosso
   (0 / 1.170), **sul codice di partenza senza la mia modifica** rosso (0 / 1.175), poi di nuovo con la modifica **verde** (1.138 /
   1.185). La lotteria di quel guardiano è **in casa** (`isHome: true` in `sonda-90-204.mjs`), dove `_so216` è spento per costruzione,
   e la correzione tocca solo il DOM della striscia, non il maxischermo 3D. Ogni rosso ha un solo campione a 0 fra nove sopra 1.100.
   Non l'ho riparato (non era il giro, e la regola dice «un guardiano instabile due volte si ripara»: da decidere quando). Non ho
   trovato la causa; non posso confermare se la corsa verde (lanciata con `CPM_CLIP`, che scrive i ritagli su disco e rallenta il
   giro) sia stata verde per caso o per il rallentamento.
2. **Lo scorrimento di 0,6 s degli stemmi** (animazione del 7.905, nata per il cambio di campo) ora si vede anche in trasferta
   all'inizio della lotteria e all'inizio della cerimonia, quando la barra si gira. Mi sembra coerente (è lo stesso gesto del cambio di
   campo), ma è un movimento in più sulla striscia nel momento in cui parte la serie. Toglierlo solo in lotteria è una riga.
3. **Durata di `tabellone-214`**: da ~8 a ~13 minuti con le due corse in trasferta. Sfora il tetto di una chiamata (10 minuti):
   nella catena va eseguito con l'attesa in primo piano sul file, come gli altri lunghi.
4. **Il 2D (`Riserva2D205`)**: la striscia in alto è la stessa barra, quindi anche lì in trasferta ora si gira; non l'ho misurato
   (riserva2d-205 non era nella lista dei controlli del giro).
