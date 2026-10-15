# Rapporto giro 24 — PO-253 «Cornice del procuratore non standard»

Ramo `sviluppo/procuratore-253`, base `main` = 7.999.169. `GAME_VERSION` **non toccata** (la fissa la sessione principale).
Zona G (carriera, economia) ferma: si tocca solo la cornice grafica; le funzioni che cambiano lo stato (`agentCheckinApply`,
`agentHirePatch`, `agentRemember`) sono chiamate con gli stessi argomenti di prima.

> La foto del PO `docs/governo/foto/po253-confronto-procuratore.jpg` **non è nel repository** di questo ramo: non posso
> confermare di aver visto la stessa schermata del PO. Ho misurato la finestra aprendola con lo stato `player.agentCheckin.due`.

## Cosa non era standard (misura prima, 412 e 360 px)
Sonda: `tests/visual/procuratore-253.mjs`, salvataggio S12, procuratore creato con `agentHirePatch`. Riferimento standard:
il verdetto del patto col mister in finestra (`[data-cpm=finestra230]`, via `cardInFinestra230`).

| | riferimento finestra230 | «Il confronto» prima | «Il primo incontro» prima |
|---|---|---|---|
| titolo nella testa | «Il patto col mister — verdetto» | **nessuno** | **nessuno** |
| occhiello maiuscolo nel corpo | 0 | **1** («IL CONFRONTO») | **1** («IL PRIMO INCONTRO») |
| testa col filo / piede | sì / sì | **no / no** | **no / no** |
| pulsanti nel corpo (stato 1 → stato 2) | 0 | **4 → 1** | **5 → 2** |
| raggio · padding corpo · larghezza max | 20 · 20 · 440px | 20 · 20 · 440px | 20 · 20 · 440px |

Uguali a 412 e 360 px. Lo scrim e il pannello erano già quelli del `Modal` (raggio e fondo giusti): mancava la **struttura**.

## Cosa cambia
- `src/18-career-app.jsx:7714-7740` — «Il confronto» passa nel `Modal` con `title="Il confronto"` (cioè la testa di
  `ModalPannello`, `src/11-ui-kit-highlight.jsx:266`); nel corpo figurina e parole; nel `footer` le quattro risposte
  (stessi `Btn v="secondary"`) o, dopo la scelta, «Chiudi» (`v="primary"`). Il gestore di «Chiudi» è uno solo (`_chiudi377`),
  usato da entrambe le cornici.
- `src/18-career-app.jsx:7792-7826` — «Il primo incontro» uguale: titolo in testa; nel piede le quattro ambizioni + «Ci penso
  ancora», poi «Firma · …€»/«Iniziamo» + «Torna indietro». Gestore unico `_firma376` + etichetta `_firmaLbl376`.
- Rosso **`window.__CPM_NO_PROC253`**: le due finestre tornano alla cornice di prima (il vecchio JSX resta, con i gestori condivisi).
- `src/18-career-app.jsx:1332` — aggancio di prova `__CPM_CAREER.apriIntro253()` (solo per il guardiano: apre il primo incontro).
- `data-cpm="confronto23"` / `"procuratore23"` restano (li usa `popup-224`); i pannelli hanno ora `confronto253` / `procuratore253`.
- Testo identico: il guardiano confronta i testi dei nodi foglia fra cornice nuova e vecchia, in tutti e quattro gli stati — uguali.

## Misura dopo
| | «Il confronto» dopo | «Il primo incontro» dopo |
|---|---|---|
| titoli | 1 («Il confronto») | 1 («Il primo incontro») |
| occhielli | 0 | 0 |
| testa col filo | sì | sì |
| pulsanti nel piede / nel corpo (stato 1 · stato 2) | 4/0 · 1/0 | 5/0 · 2/0 |
| misure (raggio 20 · testa 16/20 · titolo 17px 700 · corpo 20 · piede 12/20 con filo) | = riferimento | = riferimento |
| scroll orizzontale | no | no |

A 412 e a 360 px. Foto in `docs/sviluppo/foto-giro24/`: `prima-*` (codice di main), `dopo-*-verde-*` e `dopo-*-rosso-*`
(stato 1 = domanda, stato 2 = dopo la scelta), `*-riferimento`.

## Guardiano
`npm run procuratore-253` — registrato in `package.json`, nella catena `completa` di `ci-runner.mjs` e nella `MAPPA` alla riga
di `src/18-` (quindi anche nella catena `mirata` quando si tocca `src/18`).
- **Verde**: ✅ un titolo in testa, pulsanti nel piede, misure del ModalPannello, a 412 e 360 px.
- **Rosso** (`__CPM_NO_PROC253`): occhiello nel corpo, nessuna testa, 4/5 pulsanti nel corpo — il guardiano lo riconosce.

## Esiti dei rituali
| passo | esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` | ricomposto da 21 frammenti |
| `node tools/check-src.mjs` | ✓ identico byte per byte |
| `procuratore-253` (verde + rosso) | ✅ |
| `finestra-230` | ✅ |
| `popup-224` | ✅ (attesa: la finestra-impulso aspetta il confronto, `confronto:true`) |
| `design-system` | ✅ sistema grafico OK |
| `career-critical` | ✅ 11 passi, uscita 0, nessun ❌ |

## Fuori ambito
Nessun cambio a testi, logica del procuratore, economia, salvataggio (nessun campo nuovo, nessun bump SAVE). Le altre finestre
del procuratore (cambio procuratore `_sw379`, già standard dal 7.992) non sono toccate.
