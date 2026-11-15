# Rapporto giro 214 — la lotteria dei rigori: tabellone opaco e striscia «RIGORI» (PO-477)

Ramo `sviluppo/giro214-tabellone`, partito da `lavoro/195` (39ada80, contiene i giri 204 e 208). `GAME_VERSION` non toccata, roadmap
non toccata. Rosso unico del giro: `window.__CPM_NO_G214`. Ogni numero qui sotto è **misurato** con la sonda o il guardiano indicato;
dove non lo è lo scrivo. Foto in `docs/sviluppo/giro214/` (telefono 375×667, PC 1366×768).

Riprende i dubbi 2 e 3 del giro 208 (`RAPPORTO-giro208.md`): la scritta «RIGORI» del maxischermo si leggeva in trasparenza dietro il
tabellone DOM, e la striscia in alto mostrava ancora «1 - 1» e «90'».

## 0. In breve

| Punto | Prima (= rosso `__CPM_NO_G214`) | Dopo | Guardiano |
|---|---|---|---|
| (1) Tabellone della lotteria opaco | nel rettangolo del tabellone **1.253 – 96.301** pixel cambiano se si toglie la tela 3D (sfumatura trasparente: si vedono folla, maxischermo, «RIGORI»); pixel bianchi comparsi solo col 3D nella fascia sotto il punteggio fino a **419** | **0 pixel** che cambiano su tutti i campioni giudicati (telefono 10, PC 9), **0** pixel bianchi | `tabellone-214` |
| (2) Striscia in alto durante la lotteria | «**90'**» (o «91'») e «**1–1**» in tutti i campioni (telefono 10/10, PC 7/7) | «**RIGORI**» e il punteggio della **serie** in tutti i campioni (10/10 telefono in casa, 9/9 PC in trasferta), aggiornato a ogni tiro (0–0 → 5–4), nessun minuto | `tabellone-214` |
| Fine della lotteria | — | in cerimonia la striscia torna al risultato della partita «1–1» con «🏆», nessun «RIGORI» | `tabellone-214` |

## 1. Misura prima

Sonda nuova **`tests/visual/sonda-214.mjs`** (`npm run sonda-214`; `CPM_PC=1`, `CPM_TRASFERTA=1`, `CPM_FINALE=1`, `CPM_ROSSO=1`,
`CPM_FOTO=<prefisso>`). Partita: finale di Coppa Nazionale Salernum–Valmora forzata all'1-1 al 90' (`__CPM_SO_FORCE`), serie vinta
5-4 dall'eroe, poi cerimonia (la striscia resta in vista: è il caso in cui si può vedere se «torna normale»).

- **Trasparenza.** Nel rettangolo del tabellone «CALCI DI RIGORE» due foto nello stesso istante, con la tela 3D e con la tela nascosta;
  i pixel che cambiano (scarto > 24 su un canale) sono 3D visto attraverso il tabellone. Prima: telefono 1.253–42.407, PC fino a
  96.301 pixel; i pixel bianchi comparsi solo col 3D nella fascia del maxischermo (la scritta) fino a 419. Foto
  `prima-telefono-serie.png`, `prima-pc-serie.png` (la folla si vede dietro il punteggio e i pallini).
- **Striscia.** `data-cpm="risultato-v2"` e `data-cpm="minuto-v2"` letti a ogni campione contro lo stato vero della serie
  (`__CPM_SO_STATE`): «90'|1–1» per tutta la serie (letture «90'|1–1|serie 0–0 … 5–4»).

### Due inciampi della sonda (dichiarati, correzioni della sonda e non delle soglie)
1. Le due foto durano più di un tiro: alla prima stesura **tutti** i campioni avevano il testo del tabellone cambiato fra la foto con e
   quella senza 3D (es. «2 — 1» → «2 — 2»), e la differenza era del DOM. Ora, per la durata della coppia, il tabellone è sostituito da
   una **copia congelata** (`cloneNode`: stessi stili scritti, quindi stessa opacità), così fra le due foto cambia solo il 3D.
2. Nel guardiano, il PC in trasferta è uscito rosso con 48.967 pixel su **un** campione (gli altri 0): la cerimonia era partita fra le
   due foto e «TITOLO VINTO!» compariva in una sola. Ora un campione vale solo se a fine coppia si è ancora nella lotteria
   (`r.fermo`); gli scarti si contano (`pixelScartatiFase`).

## 2. Correzione (solo `src/15-live-match.jsx`; `__CPM_NO_G214` la spegne)

- **Tabellone** (`data-cpm="tabellone214"`): lo sfondo passa dalla sfumatura `rgba(5,10,22,0.86) → 0` a **`TINTE.bg`** pieno, con un
  filo `TINTE.bordo` sotto. Stesse dimensioni, stesso contenuto, stessa posizione: cambia solo l'opacità.
- **Striscia in alto**: `_so214 = phase==="shootout" && soState`. In lotteria `_hVal901/_aVal901` (i numeri della striscia, usati sia
  dalla barra nuova sia da quella vecchia `__CPM_NO901`) diventano la serie — `isMatchHome ? soState.hs : soState.as` per la squadra di
  casa, come per il punteggio della partita (hs = la serie dell'eroe, come nel tabellone) — e il minuto diventa «RIGORI». I numeri
  arrivano dallo stesso stato del tabellone, quindi si aggiornano allo stesso istante (a ogni esito mostrato).
- Fuori dalla fase `shootout` niente cambia: in cerimonia e a fine partita tornano risultato della partita e «🏆»/«FT».
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**.

## 3. Misura dopo

`tabellone-214` (tre corse in fila sullo stesso browser, ~8 minuti):

- **A · verde, telefono, in casa**: «RIGORI» 10/10 · minuto 0 · serie 10/10 · «1–1» 0 · capovolta 0 · letture 0–0, 1–0, 1–1, 2–2,
  3–3, 4–3, 4–4, 5–4 · pixel del 3D attraverso il tabellone **max 0** su 10 campioni (6 fuori stacco) · dopo la serie: cerimonia «1–1 🏆».
- **B · verde, PC, in trasferta**: «RIGORI» 9/9 · serie 9/9 (orientata: Valmora a sinistra, la serie dell'eroe a destra, es. «4–5») ·
  capovolta 0 · pixel **max 0** su 9 campioni (6 fuori stacco) · cerimonia «1–1 🏆».
- **C · rosso `__CPM_NO_G214`**: «RIGORI» 0/11 · minuto 11/11 · «1–1» della partita 10 · pixel del 3D fino a **35.691**.

Foto: `dopo-telefono-serie.png` (serie 1–1: coincide per caso col risultato della partita, ma sotto c'è «RIGORI»), `dopo-pc-serie.png`, `dopo-pc-trasferta-serie.png` (lotteria) e `dopo-*-dopo.png` (cerimonia con la
striscia tornata «1 - 1»).

## 4. Guardiano (nessuna soglia abbassata)

**`tabellone-214`** (nuovo, `npm run tabellone-214`). Soglie dichiarate nel file:
- **verde (A e B)**: 0 errori; ≥ 5 campioni e ≥ 3 letture diverse; in **ogni** campione «RIGORI», nessun minuto, punteggio uguale alla
  serie orientata, mai «1–1» della partita, mai capovolto; **0 pixel** del 3D attraverso il tabellone in **tutti** i campioni
  giudicati, ≥ 3 fuori dallo stacco nero; dopo la serie cerimonia con «1–1» e senza «RIGORI».
- **rosso (C)**: mai «RIGORI», minuto in tutti i campioni (≥ 5), ≥ 1.000 pixel del 3D su ≥ 3 campioni fuori stacco.
- Meno campioni, o fase dopo la serie diversa dalla cerimonia = **non giudicato = rosso**.

`ci-runner.mjs`: `tabellone-214` **una volta** in `completa` e **una volta** in `carriera` (quindi una volta in `notte`, che le unisce
senza doppioni), nella MAPPA di `src/15` (mirata) e fra i LENTI. `node --check` verde. `piazzato-204` non è toccato: le sue misure (il
maxischermo col tabellone tolto) restano valide.

## 5. Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m`/`df -h` prima)

| Controllo | Esito | Durata |
|---|---|---|
| `tabellone-214` | ✅ verde A, B · rosso C visto | ~8 min |
| `piazzato-204` | ✅ (ramo «già calciato», lotteria del 204, maxischermo del 208: verdi e rossi visti) | 6m58s |
| `lotteria-191` | ✅ (verdi telefono/PC, tre rossi visti) | 5m19s |
| `rigore-191` | ✅ (verde-prod, verde-banco, rosso visto) | 4m11s |
| `riserva2d-205` | ✅ «verde col verde, rosso col rosso» | 8m36s |
| `hud-c3` | ✅ uscita 0, tutte le misure nelle bande | 6m23s |
| `griglia-mobile` | ✅ uscita 0, «misura completa: 14 schermate × 5 larghezze» | 4m15s |
| `career-critical` | ✅ uscita 0, 5 «✅ PASS», nessun ❌ (oltre i 10 minuti: la prima corsa, interrotta dal tetto della chiamata, non vale; rifatta da capo in un'esecuzione seguita fino alla riga FINE) | >10 min |
| `test:logic` | ✅ pass 51 · fail 0 | 3 s |
| `save-compat` | ✅ 12 pass · 0 fail (una prima corsa senza `CPM_CHROME` non è partita: browser non trovato; rifatta) | 12 s |

Note: `griglia-mobile` riscrive le foto di `docs/collaudo-grafico/g0/`; non fanno parte del giro e le ho riportate allo stato del ramo.
Durante la preparazione ho avviato per errore `ci-runner.mjs` importandolo per una prova di sintassi: fermato dopo pochi secondi,
nessun processo rimasto, l'unico file toccato (una foto del giro 212) riportato com'era.

## 6. Dubbi per il PO

1. **Orientamento in trasferta.** Ho seguito «come il resto»: la striscia ha la squadra di casa a sinistra, quindi in trasferta la
   serie dell'eroe sta a **destra** (foto `dopo-pc-trasferta-serie.png`: striscia «1 - 2», Valmora–Salernum). Il tabellone della
   lotteria invece mette **sempre** l'eroe a sinistra («SAL … VAL», «2 — 1»). Nello stesso istante si leggono quindi «1 - 2» in alto
   e «2 — 1» sotto: numeri coerenti squadra per squadra, ma in ordine opposto. Se si preferisce l'ordine del tabellone, va girato uno
   dei due.
2. **Il banner finale della serie** («✅ PASSI IL TURNO!» / «DAL DISCHETTO ALLA GLORIA!», ~3,6 s) è ancora fase di lotteria: lì la
   striscia dice ancora «RIGORI» col punteggio finale della serie; torna «1–1» quando parte la cerimonia. Se «finita la lotteria» va
   inteso dal banner finale, è una riga.
3. **Altezza del tabellone ora opaco.** Sul telefono copre ~120 px sotto la striscia (prima la parte bassa sfumava sul 3D); in quella
   fascia ora non si vede la folla/il maxischermo. Era la decisione; lo segnalo perché cambia l'inquadratura percepita.
4. **Lotteria in 2D (`Riserva2D205`)**: la striscia in alto è la stessa, quindi anche lì mostra «RIGORI» e la serie (riserva2d-205 resta
   verde). Il tabellone opaco vale anche lì. Non l'ho misurato con una sonda dedicata.
5. **Scena di sola visione del rigore già calciato (dubbio 1 del giro 208)**: non è una lotteria, non è toccata (striscia col minuto).
6. **Barra vecchia (`__CPM_NO901`)**: riceve la stessa correzione (stessi valori), ma il guardiano misura solo la barra attuale.
