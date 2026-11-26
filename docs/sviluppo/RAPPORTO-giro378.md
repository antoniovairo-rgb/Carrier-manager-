# Giro 378 — Il rivale dice le stagioni vere (PO-656 · PO-657)

**Base:** `lavoro/201` (punta 8543a9cc = 7.999.215 + giro 364) · **Ramo:** `sviluppo/giro378-rivale`
**Decisioni PO applicate:** «Sempre il numero» (giro 362) per l'intervista del rivale (PO-656); «Riscriverle col numero»
per «ormai» / «col tempo» nel capitolo del rivale della «Tua storia» (PO-657).
GAME_VERSION e `docs/governo` non toccati. **Nessun campo nuovo nel salvataggio, nessun sorteggio nuovo** (le liste di
testi hanno la stessa lunghezza; la domanda dell'intervista è scelta come prima, cambia solo il testo all'uscita).

## La regola (la stessa del giro 362)

Le stagioni vere della rivalità sono il minore fra le stagioni da professionista (`season − proSeason + 1`) e le
stagioni del rivale (`rival.seasons`) — `_anni355` in src/18, ora anche `anniRivale378(p)` in src/07 con la stessa formula.
Dalla 3ª stagione «N stagioni»; in 2ª «dalla scorsa stagione»; in 1ª nessuna frase sugli anni.

| Dove | Prima | Ora |
|---|---|---|
| Intervista dopo la gara col club del rivale (vittoria/pareggio), src/07 | «Di fronte c'era il tuo rivale **di sempre**. Quanto conta…» (anche in 1ª stagione) | 3ª+: «…il tuo rivale **da N stagioni**.» · 2ª: «…il tuo rivale **dalla scorsa stagione**.» · 1ª: «Di fronte c'era il tuo rivale.» |
| «Tua storia», rivale amico, src/18 | «Fuori dal campo **ormai** vi sentite: siete cresciuti nella stessa corsa…» | 3ª+: «**In N stagioni** fuori dal campo siete diventati amici: siete cresciuti nella stessa corsa…» · 2ª: «**Dalla scorsa stagione** fuori dal campo vi sentite: state crescendo nella stessa corsa…» · 1ª: «Fuori dal campo vi sentite: state crescendo…» |
| «Tua storia», rivale rispettato, src/18 | «**Col tempo** tra voi è nato il rispetto, quello vero…» | 3ª+: «**In N stagioni** tra voi è nato il rispetto…» · 2ª: «**Dalla scorsa stagione** tra voi è nato il rispetto…» · 1ª: «Tra voi c'è rispetto, quello vero…» |

(Nella carriera vera la relazione amico/rispettato nasce al passaggio di stagione, quindi il ramo «1ª» è una rete di
sicurezza: il guardiano non lo vede mai e non lo dichiara giudicato.)

## File e funzioni toccati

- `src/07-versione-save-interviste.jsx`: nuovi `_no378`, `anniRivale378`, `testoRivale378` (prima di `hIv183`);
  `hIv183` hasha `q._q378` se c'è (il testo del catalogo), così la memoria della stagione resta la stessa domanda;
  `intervista183`: `const q=testoRivale378(p,scegliPost183(...))`.
- `src/18-career-app.jsx`: `storyChapter`, ramo `rivw1`, le due frasi amico/rispettato (`_vago378`).
- `CARRIER-MANAGER-AV.html` ricomposto (`build-src`, `check-src` verde).
- `tests/visual/rivale-378.mjs` (nuovo), `tests/visual/package.json` (script `rivale-378`),
  `tests/visual/ci-runner.mjs` (MAPPA: `rivale-378` nella riga di src/18 e in quella di src/0[0-8], dove vive src/07).

## Misura — prima / dopo (No Blind Fix)

Sonda = guardiano `npm run rivale-378`: funzioni **vere** del gioco (`intervista183` con `posta165` vera, `storyChapter`
vera) su carriere **sintetiche** (dichiarato): 48 rivali × 6 stagioni da pro, un rivale su tre con 2 stagioni in più
di quelle da pro (il numero vero è il minore, non coincide per costruzione con `rival.seasons`); intervista dopo
vittoria e pareggio; capitolo della storia su 6 settimane diverse dalla 2ª stagione (1.440 capitoli).
Il braccio rosso `window.__CPM_NO_G378` è il «prima».

| | interviste del rivale | «di sempre» | «di sempre» in 1ª stagione | frasi amico/rispetto | «ormai»/«col tempo» | numeri giudicati (iv · storia) |
|---|---|---|---|---|---|---|
| prima (rosso) | 576 | **576** (100%) | **96 su 96** | 385 | **385** (100%, nessuna col numero) | — |
| dopo (verde) | 576 | **0** | **0** | 385 | **0** | 384 · 288, tutti uguali alle stagioni vere |

Memoria della stagione: registrata la domanda, la stessa partita non la ripropone (0 ripetute su 576 prove).
Guardiani vicini rigirati: `storia-362` verde + rosso (il suo controllo B — nessun «N stagioni» sotto 3 — è il motivo
per cui la 2ª stagione dice «dalla scorsa stagione» e non «in 2 stagioni»).
`mappa-unica` verde. `node ci-runner.mjs giro rivale-378` (guardiano + 17 sentinelle): esito in fondo.

⚠️ Non misurato con `career-sim-test`: quella sonda non produce interviste né capitoli della storia (avanza settimane
sugli handler veri senza aprire le finestre); il conteggio è fatto sulle funzioni vere che decidono quei testi.

## Guardiani della zona NON girati (li giudica il treno)

`interviste-183`, `intervista-231`, `coerenza-235`, `storia-355`, `interviste-211`/`222`/`239` e gli altri delle righe
di src/07 e src/18 della MAPPA.

## Dubbi per il PO (la consigliata è la prima, già applicata)

1. **Intervista alla prima stagione.** (a) **«Di fronte c'era il tuo rivale.»** senza anni — applicata; (b) «…il tuo
   rivale, per la prima volta da professionisti» — falso se vi siete già affrontati all'andata; (c) togliere la domanda
   in 1ª stagione (resta solo quella sulla sconfitta) — meno varietà.
2. **Seconda stagione.** (a) **«dalla scorsa stagione»** — applicata, è la regola del 362 e il suo guardiano vieta un
   numero sotto 3; (b) «da 2 stagioni» — servirebbe cambiare la regola del 362; (c) «da due stagioni» in lettere.
3. **Incroci e gol (PO-657 cita «stagioni, incroci, gol»).** (a) **solo le stagioni** nelle frasi «ormai»/«col tempo»
   — applicata: gol e classifica stanno già negli altri angoli del capitolo, e gli incroci di carriera non sono nel
   salvataggio (`history` non tiene gli avversari); (b) contare gli incroci della sola stagione in corsa
   (`matchHistory`) — numero vero ma parziale, e in apertura di stagione vale 0; (c) campo nuovo `rival.incroci` —
   richiede migration e SAVE bump.
