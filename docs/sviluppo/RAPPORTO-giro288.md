# Rapporto giro 288 — PO-547 «togli lo 0 ovunque dai pulsanti»

Ramo `sviluppo/giro288-zero`, partito da `lavoro/198`. `GAME_VERSION` non toccata (come da consegna).

## Censimento (prima di correggere)

Ricerca in tutto `src/` di ogni scritta (stringa tra virgolette o testo JSX, commenti esclusi) che contenga
«[0]» o «(0)» a parola intera, come fa il guardiano statico. **Un solo punto** trovato:

| File | Riga | Scritta | Dove si vede |
|---|---|---|---|
| `src/15-live-match.jsx` | 12942 | `✅ Pronto [0]` | highlight dell'eroe, riquadro delle mosse (fase `hl_move`), solo PC (a tocco era già nascosto dal giro 90, `_dito292`) |

Nessun «(0)» usato come suggerimento di tasto: le occorrenze di «(0)» in `src/` sono CSS (`translateY(0)`),
codice (`charAt(0)`) o commenti.

## Punti toccati

1. `src/15-live-match.jsx:12942` — la scritta diventa «✅ Pronto». Il suffisso « [0]» torna solo con il rosso
   `window.__CPM_NO_G288` (e solo dove tornava prima, cioè non a tocco).
2. `CARRIER-MANAGER-AV.html` ricomposto con `node tools/build-src.mjs`; `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.
3. Nuovo guardiano `tests/visual/zero-288.mjs` + script `npm run zero-288` in `tests/visual/package.json`.

**Scorciatoia non toccata:** il gestore `keydown` di `LiveMatch` (tasto `0`/`Numpad0` in `hl_move` → prenota la
prima giocata e passa a `hl_choose`; in `hl_choose` → prima giocata) è invariato. Anche il tasto 0 della
dashboard (avanza settimana, `src/18-career-app.jsx:798`) è invariato: non aveva alcun suggerimento a schermo.

## Guardiano `npm run zero-288`

- **S statico** su `src/`: nessuna scritta con «[0]»/«(0)» a parola intera, commenti esclusi; deve esistere
  esattamente un ramo rosso guardato da `__CPM_NO_G288`. Verificato anche sul sorgente di prima: trova la riga 12942.
- **B browser** (PC 1366×768, GLB spento): scena dell'eroe forzata in `hl_move` → il pulsante «Pronto» c'è e
  nessun pulsante a schermo contiene «[0]»; tasto 0 → l'azione arriva a `hl_result` come prima.
- Esito misurato: **VERDE ✓** (gi8 · «✅ Pronto» · hl_move→hl_choose→hl_result) · **ROSSO ✓** (gi8 · «✅ Pronto [0]»
  visto dal guardiano · tasto 0 → hl_result). «Non giudicato» = rosso.

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito |
|---|---|
| `zero-288` | ✓ verde + rosso |
| `typing-shortcuts` | ✅ PASS |
| `test:logic` | 51 pass · 0 fail |
| `save-compat` | 12 pass · 0 fail |
| `griglia-mobile` | uscita 0 · misura completa 14 schermate × 5 larghezze (foto rigenerate in docs/collaudo-grafico rimesse con git checkout) |
| `career-critical` | uscita 0 (tutti gli 11 passi della catena) |

Guardiani che leggono il testo «Pronto» (grep in `tests/visual`): `lib/partita-v2.mjs` (cerca `/Pronto/`, non
«[0]»: invariato), `misura-213.mjs` (non cerca «[0]»), `pc-tablet-292.mjs` (pretende l'ASSENZA di «[0]»/WASD a
tocco: la modifica va nella sua stessa direzione). Nessuno cercava «[0]» come presenza: nessun adeguamento
necessario, nessuna soglia toccata.

## Dubbi per il PO

Altri suggerimenti di tasti oggi visibili in pagina (NON toccati, come da consegna) — **togliere anche questi?**

1. **Numeri delle giocate nell'highlight** (`src/15-live-match.jsx:12979`): su PC ogni giocata ha davanti un
   riquadrino con «1», «2», «3» (tasti 1-3).
2. **Rigori e punizioni** (giro 90 PO-292 D6): gli stili numerati 1-3 sul PC.
3. **«WASD»** nell'highlight: «📍 zona · WASD» sotto il pad (`src/15-live-match.jsx:12918`) e il consiglio
   «💡 Muoviti (WASD) per cambiare le opzioni d'azione.» (`:12970`), solo PC.
4. **«Diagonali: due frecce insieme»** (giro 210), solo PC.
5. **Home**: «[1] [2] [3] salvataggi» (`src/17-menu-creazione-pannelli.jsx:365`) e il numero dello slot davanti
   a ogni salvataggio (`:616`), solo PC.
6. **Barra di navigazione**: le lettere ([M], [C], [L], [U]…) non sono più nella scritta dal 7.955, ma restano
   nel `title` (suggerimento al passaggio del mouse) — non è la scritta del pulsante, l'ho lasciato.

Nota: «[0]» non compariva in nessun altro pulsante; se il PO vede ancora uno «0» in un pulsante che non è
fra questi, è probabilmente un dato vero (contatore/punteggio) e non un suggerimento di tasto: servirebbe la foto.
