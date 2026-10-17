# Rapporto sviluppo — giro 37 · zona G, PO-263 · PO-264 · PO-265

- **Ramo:** `sviluppo/zona-g-263-265-giro37`, partito da `sviluppo/zona-g-222-223-giro33` (`a471401`: 7.999.170 + PO-222/223).
- **Decisione PO (15/10 notte):** eccezione al congelamento della zona G estesa alle tre voci del §4 del giro 33 — «Correggi tutte e tre». Nient'altro della zona G è stato corretto; quanto trovato per strada è al §4.
- **Versioni:** `GAME_VERSION` (7.999.170) e `SAVE_VERSION` (9) **invariati**. Nessun campo nuovo nel salvataggio.
- **Metodo:** handler veri di `window.__CPM_CAREER` (`?cpmtest=1`), stato letto da `localStorage['cpm-v3']`, una pagina nuova per braccio (come `squalifica-222`/`investimento-223`). «Prima» = stesso guardiano con l'interruttore rosso acceso, che ripristina il codice di prima.
- ⚠️ Le righe PO-263/264/265 indicate dalla consegna **non esistevano** in `docs/governo/BACKLOG.md` (né su questo ramo né sugli altri remoti): ho lavorato sul §4 del giro 33 e sul testo della consegna, e le ho aggiunte al backlog.
- Righe: sorgente **dopo** la modifica.

---

## Sintesi

| Voce | Prima (misurato, rosso) | Dopo (misurato) | Interruttore | Guardiano |
|---|---|---|---|---|
| **PO-263** chi non gioca, su «Simula» | squalificato / non convocato / svincolato: **infortunati** (contusione 2 sett.) e fatica **90→100** come il sano; a fatica 60: 60→70 come il sano | nessun infortunio; fatica da settimana senza gara (90→84, 60→54) | `__CPM_NO_SIM263` | `infortunio-263` verde · rosso exit 1, **11** controlli falliti |
| **PO-264** svincolato in Europa simulata | voce non marcata con voto: girone **5,7**, ottavi **5,9** (e Coppa **5,0**) | voce `svincolato`, `rating:null`, come in lega | `__CPM_NO_EU264` | `svincolato-264` verde · rosso exit 1, **3** controlli falliti |
| **PO-265** «Investo metà del conto» | **40.000€ fissi** (con 150.000€ e con 60.000€); spenta sotto 40.000€ | esce la **metà del saldo** (75.000 / 30.000 / 15.000); spenta sotto 10.000€ e lo dice | `__CPM_NO_META265` | `meta-conto-265` verde · rosso exit 1, **7** controlli falliti |

---

## PO-263 — chi non scende in campo non si infortuna né si stanca su «Simula»

### Misura prima della correzione (era una lettura del codice: ora è misurata)

Il tiro d'infortunio delle gare simulate è **seedato** (`simInjuryRoll`, seme `standingsSeed(club,stagione,settimana)+7` in lega, `+11` in coppa) e scatta solo a fatica alta (carico virtuale >82, probabilità 7%). Una misura su una settimana qualunque sarebbe cieca: il guardiano replica il tiro nella pagina, trova la settimana in cui a fatica 90 **scatta** (stagione 2: lega **W4**; coppa **W3**) e verifica che il braccio sano di controllo si infortuni davvero.

**Si riproduce**, ed è più largo di quanto letto nel giro 33: lo stesso difetto c'era identico nel **ramo coppa** di `simulateAndAdvance` (`_injCup79`/`_fatC79`).

### Come tratta il dal vivo chi non gioca

Il dal vivo non ha un caso equivalente: il «Gioca» è bloccato a squalificato, non convocato e svincolato (giro 33, `src/18 ~1052`), quindi non c'è partita vissuta, né tiro d'infortunio né fatica di partita. La settimana di chi non gioca è quindi, nel gioco, una **settimana senza gara**: in `doAdvanceWeek` la fatica scende di `6 + nutrizionista` (`naturalFat`, `src/18 ~4760`) e non c'è alcun tiro. È lo schema che ho applicato.

### Correzione (`src/18-career-app.jsx`, solo dentro l'updater di `simulateAndAdvance`)

- `:3203` `_fuori263` = svincolato (`contractExpired`) **o** `_out222` (squalificato / non convocato del giro 33); `:3204` `_recFat263` = recupero di una settimana senza gara, stessa formula di `doAdvanceWeek` (compreso il ramo `__CPM_NO_STAFF24`).
- **Lega** `:3340-3342`: con `_fuori263` niente `simInjuryRoll` (quindi nemmeno il toast d'infortunio) e fatica `_recFat263` al posto di `+6…11`.
- **Coppa** `:3316-3318`: stessa regola. ⚠️ **Estensione dichiarata**: la consegna parlava del ramo lega; la coppa ha lo stesso difetto sugli stessi tre stati, misurato, e l'ho corretto sotto lo stesso interruttore (come il giro 33 fece con l'infortunato in Coppa per PO-222). Si revoca con una riga se il PO non la vuole.
- Non toccati: forma (deriva e malus di rientro restano com'erano), crescita settimanale (allenamento automatico), Europa e Nazionale (le loro gare simulate **non** hanno tiro d'infortunio, e l'Europa già recupera −14 di fatica per tutti).

### Prima / dopo — `npm run infortunio-263` (stagione 2; coppa iniettata in W3 al posto della giornata di lega)

`sessionsThisWeek:3` nel salvataggio: l'allenamento automatico non parte, così la fatica attesa è **esatta** (alla prima stesura il confronto col sano era falsato da «Vivi la settimana», che a volte porta la fatica 60→68, e dalle fasce dell'allenamento automatico).

| Braccio | Percorso | Prima (rosso): fatica · infortunio | Dopo: fatica · infortunio |
|---|---|---|---|
| sano, W4 fatica 90 (controllo) | bottone «Simula» | 90→100 · contusione 2 sett. | 98→100 · contusione 2 sett. (invariato) |
| **squalificato**, W4 fatica 90 | bottone «Simula» | 90→100 · **contusione 2 sett.** | 90→**84** · nessuno |
| **non convocato**, W4 fatica 90 | bottone «Simula» | 90→100 · **contusione 2 sett.** | 90→**84** · nessuno |
| **svincolato**, W4 fatica 90 | `step()` | 90→100 · **contusione 2 sett.** | 90→**84** · nessuno |
| sano, W5 fatica 60 (controllo) | bottone | 60→70 | 60→70 (invariato) |
| squalificato, W5 fatica 60 | bottone | **60→70** | 60→**54** |
| non convocato, W5 fatica 60 | bottone | **68→78** | 60→**54** |
| svincolato, W5 fatica 60 | `step()` | **60→70** | 60→**54** |
| sano, Coppa W3 fatica 90 (controllo) | bottone | 90→96 · contusione 1 sett. | 90→96 · contusione 1 sett. (invariato) |
| **squalificato, Coppa** | bottone | 90→96 · **contusione 1 sett.** | 90→**84** · nessuno |
| **svincolato, Coppa** | `step()` | 90→96 · **contusione 1 sett.** | 90→**84** · nessuno |

(La fatica di partenza è letta dopo «Vivi la settimana»: 98 e 68 sono quella settimana che sposta la fatica, non la partita.) Esito: verde col fix; `CPM_ROSSO=1` esce 1 con **11 controlli falliti**.

---

## PO-264 — lo svincolato nelle competizioni simulate: stesso schema della lega

### Misura prima

Iniettata in W9 (settimana libera, stagione 2) una gara di **girone europeo**, di **ottavi europei** e di **Coppa**, simulata con `step()`; lega in W3 come riferimento.

| Competizione | Sano (controllo) | Svincolato prima (rosso) | Svincolato dopo |
|---|---|---|---|
| Lega (riferimento) | voto 5,3, presenza +1 | `svincolato`, voto nullo, presenza 0 | identico (invariato) |
| **Girone europeo** | voto 6,1, 1 gol, presenza +1 | voce **non marcata, voto 5,7**, presenza 0 | `svincolato`, **voto nullo**, presenza 0 |
| **Ottavi europei** | voto 5,4, presenza +1 | voce **non marcata, voto 5,9**, presenza 0 | `svincolato`, **voto nullo**, presenza 0 |
| **Coppa** | voto 5,0, presenza +1 | voce **non marcata, voto 5,0**, presenza 0 | `svincolato`, **voto nullo**, presenza 0 |

Presenza, gol e assist erano già a zero (7.419); il difetto era solo la voce. ⚠️ **Estensione dichiarata**: anche qui la **Coppa** aveva lo stesso difetto (il giro 33 l'aveva letto solo nei rami europei); corretta sotto lo stesso interruttore.

### Correzione

`src/18-career-app.jsx:3207` `_sv264`; voce di storico del girone (`:3256`), del KO (`:3287`) e della coppa (`:3320`): `svincolato:true, rating:null` dopo l'infortunato e prima di squalificato/non convocato — lo stesso ordine della lega. Esito: verde col fix; `CPM_ROSSO=1` esce 1 con **3 controlli falliti**.

---

## PO-265 — «Investo metà del conto» toglie la metà del conto

### Correzione

- **Catalogo** (`src/03-eventi-narrativi.jsx:393`): la scelta dichiara `quotaConto265:0.5`. Il `bank:-40000` resta **solo** per l'interruttore rosso. Testo della scelta **invariato**: «Investo metà del conto» ora dice esattamente ciò che fa.
- **Regola** (`src/18-career-app.jsx:140-150`, `META265_MIN`/`bank265`/`efConto265`/`sotto265`): la scelta costa `round(saldo × 0,5)`, calcolato sul saldo su cui il giocatore ha cliccato. **Minimo dichiarato: puntata di 5.000€**, cioè servono almeno **10.000€** sul conto; sotto, la scelta è spenta e dentro il bottone dice «🔒 Serve almeno 10.000 € sul conto · hai …». Il minimo è una **mia scelta di progetto** (un investimento immobiliare da poche centinaia di euro non ha senso); si cambia con la sola costante.
- **Applicazione** (`:3961-3962`, `handleImpulseChoice`): l'uscita dal conto usa la cifra risolta; il registro `investimenti223` (PO-223) la registra già come differenza vera del saldo, quindi **la resa a fine stagione segue la metà vera** senza altre modifiche. Spegnimento e testo del lucchetto nei due blocchi delle scelte (`:6307-6314`, `:6367`).

### Prima / dopo — `npm run meta-conto-265` (pop-up vero `apriImpulso('wi_investimento')`, clic sulla scelta)

| Saldo | Prima (rosso) | Dopo | Registro `investimenti223` dopo |
|---|---|---|---|
| 150.000€ | esce **40.000€** | esce **75.000€** | 75.000€ prudente |
| 60.000€ | esce **40.000€** | esce **30.000€** | 30.000€ prudente |
| 30.000€ | **spenta** («Costa 40.000 €») | esce **15.000€** | 15.000€ prudente |
| 8.000€ | spenta («Costa 40.000 €») | spenta («Serve almeno 10.000 € sul conto») | — |

Esito: verde col fix; `CPM_ROSSO=1` esce 1 con **7 controlli falliti**. `investimento-223` resta verde con **gli stessi numeri del giro 33**: lavora con 80.000€, la cui metà è proprio 40.000€.

---

## Guardiani fatti girare (sul build finale, dentro il turno, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Guardiano | Esito | Tempo |
|---|---|---|
| `infortunio-263` (nuovo) | ✅ verde · rosso `CPM_ROSSO=1`: exit 1, 11 controlli falliti | < 10 min (non cronometrato) |
| `svincolato-264` (nuovo) | ✅ verde · rosso `CPM_ROSSO=1`: exit 1, 3 controlli falliti | < 10 min (non cronometrato) |
| `meta-conto-265` (nuovo) | ✅ verde · rosso `CPM_ROSSO=1`: exit 1, 7 controlli falliti | 106 s (braccio rosso) |
| `squalifica-222` | ✅ verde | 209 s |
| `investimento-223` | ✅ verde (numeri identici al giro 33) | 303 s |
| `test:logic` | ✅ | 4 s |
| `save-compat` | ✅ 12 pass · 0 fail | 16 s |
| `migrazione-194` | ✅ verde | 114 s |
| `replay` | ✅ PASS | 61 s |
| `classifica-102` | ✅ PASS | 50 s |
| `career-critical` (11 passi, uno per uno) | ✅ 11/11: recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry, career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera | ~15 min |
| `node tools/check-src.mjs` | ✅ identico byte per byte | — |

Registrazioni: `tests/visual/package.json` (`infortunio-263`, `svincolato-264`, `meta-conto-265`); `tests/visual/ci-runner.mjs` — catena `carriera`, MAPPA `src/18-|src/16-|src/10-` (tutti e tre) e `src/03-` (`meta-conto-265`).

Non eseguiti: gate `validate-situations`, `partita-vera` e le catene di motore/grafica (nessun file di partita o di grafica toccato).

---

## §4 Trovati e NON corretti (zona G ferma — solo annotati)

1. **Forma di chi non gioca su «Simula»**: lega e coppa applicano ancora a squalificato/non convocato/svincolato la deriva di forma «da partita» (`_formS79`/`_formC79`, incluso il malus di rientro −6), mentre una settimana senza gara di `doAdvanceWeek` usa `naturalForm` (media verso 65). Lettura del codice, non misurato; fuori dalle tre voci.
2. **Europa simulata: −14 di fatica per tutti** (`_fatE`), anche per chi gioca, mentre lega e coppa caricano +6…11 (7.178 RC-18 non l'aveva portato lì). Lettura del codice.
3. **Strumento:** «Vivi la settimana» (`step()`) può spostare la fatica di qualche punto (misurato: 60→68, 90→98) prima della gara: chi misura la fatica deve leggerla **dopo** quel passo, come fa `infortunio-263`.
4. Restano aperti i due difetti di strumento del giro 33 (`step()` che dichiara «simulated» su `openingGate`, `step()` che non sconta la squalifica).

---

## Riepilogo per il PO

- **PO-263:** chi non scende in campo (squalificato, non convocato, svincolato) non si infortuna più su «Simula» e non prende fatica di partita: la sua settimana è una settimana senza gara (fatica −6, come «Avanza»). Riprodotto prima della correzione, e valeva **anche in Coppa** (corretta con lo stesso interruttore — da confermare).
- **PO-264:** lo svincolato in Europa (girone e KO) ha ora la voce marcata `svincolato` senza voto, come in lega. Anche qui **la Coppa** aveva lo stesso difetto (corretta, da confermare).
- **PO-265:** «Investo metà del conto» toglie davvero la metà del saldo; la resa a fine stagione segue quella cifra. Minimo 5.000€ di puntata (10.000€ sul conto): **da confermare o ritarare** (`META265_MIN`).
