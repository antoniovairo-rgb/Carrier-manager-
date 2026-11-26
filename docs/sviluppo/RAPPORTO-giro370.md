# Giro 370 — «Sostieni il progetto» anche nell'app di Play

**Decisione PO 26/11 01:30** (questionario, dopo l'avviso sulla norma «Pagamenti» di Google Play): «Mostralo subito, come PLINTO».
Annulla la decisione del 17/11 (giro 260, «Toglierlo nell'app store»).

## Prima / dopo
| | Sito | App (TWA, `?app=twa` / referrer `android-app://com.korward.elite`) |
|---|---|---|
| Prima (giro 260) | «☕ Sostieni il progetto» + «💡 Idee e feedback» col filo | solo «Idee e feedback», senza filo |
| Dopo (giro 370) | invariato | come il sito: «Sostieni» + «Idee» col filo a sinistra |

Nessun'altra differenza sito/app toccata: il criterio `window.__CPM_APP_TWA` (giro 120) resta e governa il resto (AI spenta, Indietro ecc.).

Foto della barra in basso, deviceScaleFactor 2, 390×844 (scattate dal guardiano, braccio verde; la plancia e' velata da una finestra
della settimana aperta, la barra e' identica nei due casi):
- sito: `docs/sviluppo/giro370/store-370-barra-sito.png`
- app: `docs/sviluppo/giro370/store-370-barra-app.png`

## File toccati
- `src/07-versione-save-interviste.jsx` — `donazioneVisibile260`: nell'app il tasto si nasconde solo col rosso `window.__CPM_NO_G370`;
  commento del giro 260 conservato, nota del 370 aggiunta (`__CPM_NO_G260` non governa piu' il tasto; resta per le altre parti del 260).
- `src/18-career-app.jsx` — solo il commento accanto al filo di «Idee e feedback» (la logica segue `donazioneVisibile260`).
- `CARRIER-MANAGER-AV.html` — ricomposto con `tools/build-src.mjs` (check-src: identico).
- `tests/visual/store-236.mjs` — S9 rovesciato: «Sostieni» presente su sito E app, «Idee» col filo su entrambi; rosso `__CPM_NO_G370`;
  foto della barra a dsf 2.
- `tools/store-screenshots-236.mjs` — si fermava se trovava «Sostieni» nella plancia scattata come app; ora si ferma se MANCA.
  Screenshot dello store NON rifatti (quelli in archivio sono senza il tasto: da rifare quando il PO lo chiede).

## Misure
- `npm run store-236` verde: **15/15**, S9 «sito: Sostieni 1 · Idee 1 (filo si) — app: app true · Sostieni 1 · Idee 1 (filo si)».
- Rosso (`CPM_PROVA_ROSSO=1` → `__CPM_NO_G370`): S9 cade («app: Sostieni 0 · filo no»), PROVA DEL ROSSO OK.
- `node ci-runner.mjs giro store-236` (store-236 + 17 sentinelle): **18/18 verdi** su 7.999.215 (griglia-mobile, design-system, career-critical, partita-vera, schermate-97 compresi).

## Guardiani della zona non girati (li giudica il treno)
- `twa-120` (usa il tasto «Sostieni» come segnale di plancia caricata: non cambia comportamento, ma non girato qui).
- `sw-cache-120`, `coerenza-235` (usano `__CPM_NO_G260` per altre parti del giro 260, non toccate).
- `design-system`, `griglia-mobile` (la barra in app torna alla disposizione del sito, gia' coperta sul sito).
