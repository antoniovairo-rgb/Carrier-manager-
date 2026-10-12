# PO-230 — finestre in primo piano: cornice standard · collaudo 161

**Build:** 7.999.161 (base `poc/marioprada-character-system`, `a42920b`) · ramo `collaudo/sessione-collaudatrice-161`
**Salvataggio:** `tests/visual/fixtures/save-190-s12-ovr93.json` (stagione 12, settimana 38)
**Sonde:** `tests/visual/collaudo-230-finestre.mjs` (360 e 412 px) · modulo `tests/visual/lib/collaudo161.mjs`
**Dati grezzi:** `docs/collaudi/PO230-dati-360.json`, `docs/collaudi/PO230-dati-412.json` · **foto:** `docs/collaudi/foto/PO230-*.png`

## Cosa è stato fatto e come (e le deviazioni)

- Il cammino è stato giocato **cliccando** i pulsanti visibili. Nessun `__CPM_CAREER.dismiss` nel ciclo di gioco.
- **Deviazione 1 — `?cpmtest=1`:** l'hook `__CPM_CAREER` (lettura dello stato) esiste solo con quel parametro (`src/18-career-app.jsx:1291`, `_CPM_TEST`). Senza, la sonda non legge né settimana né partite. Per avvicinarsi alla produzione ho armato `__CPM_POP224=1` (gli impulsi sotto cpmtest sono bloccati senza, `src/18-career-app.jsx:1924`) e `__CPM_PRESENT=1` (il teatro è spento in cpmtest, come da CLAUDE.md).
- **Deviazione 2 — velocità:** `localStorage cpm-match-speed = 4` (la stessa impostazione della sonda `intervista-231` del repo) per accorciare la partita. Il tempo di gioco non è quindi quello di un giocatore a 1x.
- **Deviazione 3 — GLB OFF:** le finestre sono UI 2D e la cornice non dipende dal 3D, ma la direttiva PO chiede GLB-ON per le verifiche percettive. Dichiaro lo scostamento.
- **Misure:** `scanOverlays` legge per ogni overlay `position:fixed` con z≥900 il pannello (primo discendente con fondo), i valori computati di fondo, raggio, ombra, bordo, la posizione, il testo tagliato (overflow/ellipsis) e i pulsanti.
- **Limite dello strumento:** il controllo automatico «cornice standard» confronta il bordo con «1px». Le finestre chiare misurano **0,89 px** con il colore del divisore corretto (causa non verificata). Ho quindi giudicato per **valori** (colore, raggio, ombra, spessore arrotondato), non per il solo confronto automatico.

## Il percorso effettivamente giocato

Stagione 12 · settimana 38 → **partita giocata** (35→36) → **chiusura stagione** (la settimana 39 della stagione 12 mostra «🏁 Chiudi la stagione S.1», non «Vivi la Settimana») → **stagione 13, settimana di apertura** (`SETTIMANA DI APERTURA · STAGIONE 13`). Il giro dei riquadri ha cliccato «Obiettivi personali», «Agente», «Club», «Carriera», «Ufficio», «Stagione» senza aprire nuove finestre attribuibili con certezza.

**Quindi «2 settimane + 1 partita» è stato coperto solo in parte:** una partita, una settimana regolare e il passaggio di stagione. La stagione del salvataggio finisce subito dopo la partita della settimana 38.

## Finestre misurate

Legenda: **Std-valori** = fondo, raggio, ombra e bordo coincidono con i token (`TH`/`TH_DARK`, `RAD.xl`, `el3`, `divider`). **Via finestraStd()** = la cornice è chiamata esplicitamente nel codice.

| # | Finestra (`data-cpm`) | Dove (file:riga) | Fondo | Raggio | Ombra | Cornice standard? | Difetti |
|---|---|---|---|---|---|---|---|
| 1 | `settimana23` — impulso «SETTIMANA 38/39» | `18-career-app.jsx:6175` (contenitore; il pannello è una `Card`) | bianco | 20px | `0 12px 40px rgba(0,0,0,.18)` | **sì** (valori), non via `finestraStd()` | nessuno |
| 2 | `partita23` — «Gioca la partita» | `18-career-app.jsx:6629` | bianco | 20px | come sopra | **sì** (valori), non via `finestraStd()` | nessuno |
| 3 | `discorso215` — «Discorso pre-partita» | `18-career-app.jsx:5970`, `:6322` | bianco | 20px | come sopra | **sì** (valori) | nessuno |
| 4 | `pop224` — «La tua storia» (impulso) | `18-career-app.jsx:1925` | bianco | 20px | come sopra | **sì, via `finestraStd()`** | nessuno |
| 5 | `anon` — «SETTIMANA DI APERTURA · STAGIONE 13» | sorgente non identificata | bianco | 20px | come sopra | **sì** (valori) | nessuno |
| 6 | `pop919` — scelta in partita (mister / avversario / tu / compagno) | `15-live-match.jsx:1015-1017` | `rgb(33,48,74)` = `TH_DARK.surface3` | 20px | `0 12px 48px rgba(0,0,0,.6)` | **sì** (valori TH_DARK), **NON via `finestraStd()`**: stile ripetuto a mano | nessuno visibile (vedi nota) |
| 7 | `intervista231` — CONFERENZA STAMPA / IL GIORNALISTA INCALZA / COM'È ANDATA | `18-career-app.jsx:6362` (portale) | bianco | **12px** (RAD.md) | **`0 2px 12px rgba(0,0,0,.07)`** (el1) | **NO** | raggio, ombra e bordo (`#e7e3dc`, non `#e9e5de`) diversi dalla cornice |
| 8 | `intervista231` — «INTERVISTA» (foglio dal basso, settimana 39) | `18-career-app.jsx:6362`, ramo `_iv3d` | bianco | 18px | ombra verso l'alto `0 -12px 40px` | **NO** | foglio dal basso: forma diversa dalla cornice |
| 9 | `toast23` — avviso «🏕️» | `11-ui-kit-highlight.jsx:104` | bianco | **12px** | `0 12px 40px` | **NO** | raggio 12 invece di 20 |
| 10 | `gala51` — cerimonia premi | `16-scene-3d-cerimonie.jsx:2311` | nessuno (schermo pieno `#07060c`) | 8px | — | **NO** (non è una finestra a pannello) | **testo tagliato** «Capocannoniere · MVP della stagione · Re dei Bombe…» (ellipsis) a 360 e 412 px |

Avvisi senza pulsante (`toast23` «⚡», «💪», «🆕», «🎯 RECORD PERSONALE», ecc.): non sono finestre da chiudere, scompaiono da sole. Non valutati come finestre.

**Fuori dallo schermo:** nessuna finestra misurata esce dal riquadro (`fuori=false` in tutte le misure, 360 e 412). **Scorrimento orizzontale della pagina:** assente.

## Elenco delle finestre SENZA la cornice standard (file:riga)

1. **Intervista post/pre partita** — `src/18-career-app.jsx:6362` (raggio 12, ombra el1, bordo non divisore). Ramo foglio dal basso `_iv3d` nello stesso blocco, `:6362-6370`.
2. **Avviso con raggio 12** — `src/11-ui-kit-highlight.jsx:104` (`toast23`).
3. **Cerimonia premi** — `src/16-scene-3d-cerimonie.jsx:2311` (testo tagliato; non è un pannello).

## Finestre con la cornice «per valori» ma non via `finestraStd()`

- **Scelta in partita** — `src/15-live-match.jsx:1017`: i valori sono quelli giusti, ma il codice non chiama `finestraStd()` e li ripete a mano (`TH_DARK`). La descrizione del compito (scelta in partita «passa da finestraStd») **non corrisponde al codice**. Oggi funziona per valori; se cambia un token, la scelta in partita non lo segue.
- **Impulso settimana e partita pre-gara** — `src/18-career-app.jsx:6175`, `:6629`: il pannello è una `Card`, non `finestraStd()`.

## Finestre previste ma NON osservate (non chiuso)

Non sono comparse nel cammino giocato: **tutorial** (`src/17-menu-creazione-pannelli.jsx:1739-1740`), **momento di carriera** (`src/18-career-app.jsx:6297`), **procuratore** (`data-cpm="procuratore23"`), **mercato** (`data-cpm="offerta23"`), **pagella del mese**, **Modal del kit**. Il giro dei riquadri non le ha aperte (le voci «Ascolta l'offerta», «Festeggia», «Voci di mercato», «Record watch» non erano visibili nel punto in cui il giro le ha cercate). Su queste la verifica **non è stata fatta**.

## Esito

- Verificato: 10 gruppi di finestre misurati su 360 e 412 px; cornice standard **per valori** in 6 casi; **via `finestraStd()`** solo `pop224`.
- Difetti reali: intervista (raggio/ombra/bordo diversi), avviso 12px, testo tagliato nella cerimonia premi.
- Discrepanza col compito: la scelta in partita non passa da `finestraStd()`.

**STATO: NON CHIUSO — motivo:** il percorso ha coperto una partita, una settimana regolare e il passaggio di stagione. Non sono comparsi tutorial, momento di carriera, procuratore, mercato, pagella del mese e Modal del kit: servono altri percorsi (creazione di un nuovo personaggio per il tutorial, pulsanti del menu di carriera che il giro non ha raggiunto). Il controllo automatico della cornice ha un falso negativo sul bordo (0,89 px) e va corretto prima di usarlo come verdetto.

---
_Collaudo eseguito dalla collaudatrice (sola lettura sul gioco). Nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`._
