# Giro 352 — eventi settimanali legati all'età e agli anni nel club (PO-613)

**Base:** `lavoro/201` (= 7.999.208) · **Ramo:** `sviluppo/giro352-eventi-eta` · **Voce:** PO-613 (collegate PO-436, PO-586)
**Foto PO:** `docs/collaudo-po/201-evento-scarpini-veterano.jpg` — «Fuori luogo per l'età dell'eroe, ha oltre 30 anni!»
GAME_VERSION non toccata (rilascio automatico).

## Il difetto

`vita_scherzo_scarpe` (VITA_EVENTS) **non aveva condizione**: lo scherzo del veterano al giovane («domani tocca a te
scegliere la vittima») poteva uscire a qualunque età. A un eroe di 33 anni, che nello spogliatoio è lui il veterano.

## Censimento (src/03, cinque mazzi settimanali: 334 voci)

Ho letto i testi **risolti** (anche quelli che sono funzioni) di WEEKLY_EVENTS (112), WEEKLY_RANDOM_EVENTS (52),
SPOGLIATOIO_MOMENTS (10), WEEKLY_IMPULSES (130), VITA_EVENTS (30). Classificati dal giudice del guardiano: **23 eventi**.

| Evento | Presuppone | Prima | Dopo |
|---|---|---|---|
| `vita_scherzo_scarpe` | giovane / nuovo arrivato | nessuna condizione | vittima ≤25 anni (o nuovo nel club ≤27); **variante del veterano ≥30** |
| `vita_consiglio_veterano` («Il capitano ti trattiene…») | giovane | solo ovr<78 | ≤25, non capitano; **variante del veterano ≥30** (sei tu a trattenere il ragazzo) |
| WE «Un veterano dello spogliatoio ti svela segreti del mestiere» | giovane | nessuna | ≤25; **voce nuova dal lato del veterano ≥30** («Un ragazzo ti chiede i segreti del mestiere») |
| `wi_veterano_allenamento` | giovane | solo «pro» | pro e ≤25 (il lato del veterano c'è già: `wi_giovane`, `wi_giovane_aiuto`) |
| WE «Cena col presidente. Ti promette un futuro da titolare» | giovane | non titolare/capitano | + ≤27 |
| WR «definito 'il talento del momento'» | giovane | nessuna | ≤26 |
| WE «Il capitano ti porta in giro per la città» | nuovo arrivato | nessuna | prima stagione nel club, non capitano |
| WE «Trovi casa vicino al centro sportivo» | nuovo arrivato | nessuna | prima stagione nel club |
| WE «Inizi a studiare la lingua locale» | nuovo arrivato | nessuna | prima stagione nel club |
| `vita_bimbo_maglia` («non c'erano ancora le tue») | nuovo arrivato | nessuna | prima stagione nel club |
| `wi_orologio` («sei l'unico senza l'orologio della squadra») | nuovo arrivato | non capitano | + prima stagione nel club |
| `vita_famiglia_stadio` («per la prima volta nello stadio grande») | primi anni | popolarità ≥30 | + primi due anni da pro |
| WE «per la prima volta in una lista ufficiale della nazionale» | prima convocazione | pro, ovr ≥68 | + zero presenze in Nazionale |
| `wi_seg_lite_mister` («chiede ai più esperti… guarda te») | esperienza | seguito | + ≥22 anni (non misurabile nella sonda: è un seguito) |

Già giusti (riconosciuti dal giudice, nessuna modifica): miglior giovane del mese/della lega, top list giovani europei,
under-23, auto dopo il primo contratto, gli esordi `wi_es_*` (stagione 1), il primo anno da pro `wi_pro_*` (`proSeason`).
Neutri dichiarati nel guardiano (nominano età ma non la presuppongono nell'eroe): il ragazzo della Primavera che chiede
aiuto a te, il vecchio idolo/massaggiatore, i ragazzi della scuola calcio, il karaoke dei nuovi (l'eroe guarda).

**Regole condivise** (testa di src/03): `eta352`, `anniClub352` (stagioni CHIUSE di fila nel club attuale, dallo storico
con `clubId`; la Primavera dello stesso club conta, perché ha lo stesso id), `giovane352` (≤25), `veterano352` (≥30),
`nuovo352` (0 stagioni chiuse nel club), `primiAnni352`. Nessun campo nuovo nel salvataggio, nessun bump SAVE: tutto si
legge da `age`, `history`, `proSeason`, `nationalCaps` che esistono già.

## Misura prima / dopo (guardiano `eta-352`)

16 carriere sintetiche × 22 stagioni × 38 settimane (16→37 anni, salto fra i pro, metà carriere cambia club al salto,
tre trasferimenti, capitano da 28-31 anni in due terzi, Nazionale da 22 anni in metà). Condizioni e tabelle **vere**
della pagina; estrazioni **vere** del motore di vita (`pickVitaEvent` + `markVitaEvent`, 15% a settimana, seme fisso).
Il giudice è indipendente dalle condizioni: legge il testo risolto e lo confronta con l'età e gli anni nel club che la
sonda conosce per costruzione (soglie del giudice più larghe delle condizioni: giovane ≤27, veterano ≥27).

| | Prima (rosso `__CPM_NO_G352` = codice di prima) | Dopo |
|---|---|---|
| Eventi eleggibili fuori età | **13** distinti · 91.390 settimane-evento | **0** |
| Uscite attese fuori età (una pescata a settimana per mazzo) | 791 | 0 |
| Estrazioni vere di vita fuori età | **152 su 2.032** (scherzo 93 · consiglio 28 · maglia 22 · famiglia 9) | **0 su 2.035** |
| Varianti dal lato del veterano per i ≥30 | 0 | eleggibili 14.592 settimane-evento · **137 uscite vere** |

## Guardiano

`npm run eta-352` (= `CPM_PROVA_ROSSO=1 node eta-352.mjs`, ~16 s), nella riga della MAPPA di src/03. Quattro controlli:
A nessun evento eleggibile all'età sbagliata · B nessuna estrazione vera di vita fuori età (sotto 500 estrazioni =
non giudicato = rosso) · C copertura: ogni testo dei cinque mazzi che parla di età/anzianità è classificato o neutro
dichiarato, e il giudice riconosce almeno 20 eventi · D i trentenni hanno varianti del veterano eleggibili e uscite.
Il rosso `__CPM_NO_G352` deve far cadere A e B/D: cade (vedi tabella). Chi aggiunge un evento con «veterano», «giovane»,
«prima volta», «esordiente»… senza classe fa diventare rosso C.

## Catena del giro

`node ci-runner.mjs giro eta-352 career-critical` (+ sentinelle) sul build del ramo: **18/18 verdi**, nessun passo
ripetuto (eta-352 16 s · test:logic · save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile ·
render-3d-023 · tunnel-285 · home-298 · web-237 · career-critical 362 s · battito-264 · partita-vera 691 s · gk-dive-sync ·
schermate-97 · mappa-unica).

## Per PO-646 (non fatto ora, solo elencato)

- `vita_primo_stipendio` è un **evento morto**: la condizione legge `p.salary`, campo che nessuna parte del gioco scrive
  (grep: unica occorrenza è la condizione stessa) → non esce mai.
- Gli eventi senza scelta di VITA_EVENTS/WEEKLY_EVENTS sono testo + effetto: non li ho rivisti (PO-646).
- «Inizi a studiare la lingua locale» ora vale al primo anno nel club, ma non guarda se il club è all'estero: un eroe
  italiano in un club italiano la «inizia» lo stesso. Non c'è un aiuto «estero» in src/03; fuori dal criterio età.
- «Il capitano elogia il tuo impegno» (WR) esce anche all'eroe capitano: non è età, lo lascio a PO-646.

## Dubbi

1. **Soglie dell'età (giovane ≤25, veterano ≥30; fra 26 e 29 lo scherzo e la lezione del capitano non escono, salvo
   nuovo arrivato).** Opzioni: **(a, consigliata)** tenere così — fra 26 e 29 l'eroe non è né la vittima né il veterano;
   (b) spostare il veterano a 28, come `careerPhase` che chiama «veterano» da 32 (più tardi ancora, quindi no); (c) usare
   gli anni nel club invece dell'età per il veterano (un 27enne con 6 stagioni nel club è il veterano).
2. **PO-586 («un equilibrio che dura da anni» al primo anno)** non è in src/03: il testo è nella «Tua storia» (rivalità),
   fuori dall'ambito del giro. Opzioni: **(a, consigliata)** giro a parte che usi gli stessi anni di carriera
   (`season`/`proSeason`); (b) esporre `anniClub352`/`primiAnni352` da src/03 e usarli lì; (c) lasciare in coda.
3. **PO-436 (settimane da trentenne):** questo giro dà ai trentenni tre varianti del veterano, non un mazzo proprio.
   Opzioni: **(a, consigliata)** chiudere qui il criterio età e fare il mazzo dei trentenni dentro PO-646 (ogni scelta
   produce un fatto); (b) aggiungere subito 4-5 impulsi del veterano; (c) usare `careerPhase` per pesare i mazzi.
