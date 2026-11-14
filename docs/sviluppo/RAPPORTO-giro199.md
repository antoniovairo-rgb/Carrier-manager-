# Rapporto giro 199 — PO-408 (scelte in cima alla Home) · PO-409 (figurina compatta)

Ramo `sviluppo/giro199-home`, partito da `lavoro/195` (contiene il giro 198: «Da fare ora» nell'Agente e «Sei svincolato»
in cima alla Home, entrambi rispettati). `GAME_VERSION` non toccato (resta `7.999.193` nel codice).
Rosso unico: `window.__CPM_NO_G199` (spegne entrambe le correzioni).

## PO-408 — i riquadri con una scelta da fare

**Misura prima** (sonda `tests/visual/misura-199.mjs`, gioco vero `?cpmtest=1`, salvataggio sintetico stagione 3 sett. 30,
scelte accese con `__CPM_CAREER.patch`: 1 = saga di mercato all'offerta, 2 = + shooting nella settimana europea,
3 = + fisioterapista a fatica 80). Posizione dall'alto della pagina, a scorrimento zero.

| Vista | scelte | saga | shooting | allenamento | tasto del momento |
|---|---|---|---|---|---|
| 375×667 | 1 | 1105 px · 1,66 schermi | – | – | 119 px |
| 375×667 | 3 | 1037 · 1,55 | 1347 · 2,02 | 1696 · 2,54 | 119 |
| 390×844 | 3 | 1037 · 1,23 | 1347 · 1,60 | 1696 · 2,01 | 119 |
| 1366×768 | 3 | 922 · 1,20 | 1213 · 1,58 | 1489 · 1,94 | 126 |

(Coerente con l'1,74 schermi del giro 195: il valore esatto dipende da quali riquadri ci sono sopra.)
Ordine misurato prima: testata → tasto del momento (`corsa163`) → prossima partita → stagione → eroe → Fiducia/Popolarità →
riquadri di scelta mescolati agli altri.

**Correzione** (`src/18-career-app.jsx`, solo presentazione: stessi riquadri, stessi pulsanti, stesso stato).
I riquadri della Home che chiedono una scelta e **non** passano già dalla finestra `_pop224` si calcolano una volta prima
del `return` e si disegnano nel blocco `data-cpm="scelte199"`, fra «Sei svincolato» e il tasto del momento:
saga di mercato (solo quando chiede la risposta ai media o porta l'offerta; l'episodio 1 «indiscrezione» e la presa d'atto
restano al posto di prima), shooting nella settimana sbagliata, la riconquista, «Dal campo d'allenamento», rinnovo
(`rinnovo94`). In testa al blocco il segno **«⚡ Da decidere N»** (`data-cpm="scelta199-segno"`, colori e raggi dai token).
Nessuna finestra nuova. Col rosso i riquadri tornano esattamente dov'erano.

**Misura dopo**

| Vista | 1 scelta | 2 scelte | 3 scelte | tasto del momento (1/2/3) |
|---|---|---|---|---|
| 375×667 | saga 144 px · 0,22 | + shooting 314 · 0,47 | + allenamento 513 · 0,77 | 314 / 513 / 696 |
| 390×844 | 144 · 0,17 | 314 · 0,37 | 513 · 0,61 | 314 / 513 / 696 |
| 1366×768 | 150 · 0,20 | 300 · 0,39 | 427 · 0,56 | 300 / 427 / 573 |

Con 0 scelte la Home è identica a prima (tasto del momento a 119/119/126 px, nessun segno).
Da svincolato con 2 scelte (375×667): svincolato 119 px → blocco 338 → tasto del momento 733.

## PO-409 — la figurina di Carriera › Profilo

**Soglie fissate prima di correggere** (scritte nel guardiano): spazio vuoto fra la riga alta (OVR + volto) e la fascia del
nome ≤ **16 px** su tutte le viste; altezza ≤ **0,42 schermi** a 375×667 e 390×844, ≤ **0,40** a 1366×768; la riga
«anni · club» dentro il primo schermo a 375×667.

| Vista | prima: altezza · quota · vuoto | dopo: altezza · quota · vuoto | riga «anni» prima → dopo |
|---|---|---|---|
| 375×667 | 365 px · 0,547 · 94 px | 266 px · 0,400 · 13 px | 606 → 507 px |
| 390×844 | 380 · 0,450 · 102 | 271 · 0,321 · 13 | 621 → 512 |
| 1366×768 | 392 · 0,510 · 110 | 277 · 0,360 · 13 | 640 → 524 |

**Correzione**: `FiguraV2` grande (`src/11-ui-kit-highlight.jsx`) non ha più l'altezza fissa `w×1,4`: è alta quanto il
contenuto e la fascia del nome segue la riga alta a 12 px (prima era spinta in fondo con `marginTop:auto`, da qui la fascia
rossa vuota). Larghezza in Profilo: 54% della finestra con tetto 220 px (prima 62% / 250).
⚠️ La larghezza misurata (227 px a 375) è più grande del valore calcolato (0,54×375 = 203): la differenza c'era anche prima
(261 contro 232). Non ho trovato da dove venga; non cambia il giudizio, che è sull'altezza e sul vuoto misurati.

## Guardiani nuovi

- `npm run home-199` — verde a 375×667, 390×844, 1366×768 con 0/1/2/3 scelte + caso svincolato; rosso `__CPM_NO_G199`
  bocciato a 375×667 (3 scelte) e 1366×768 (2 scelte). Giudica: ogni scelta comincia nel primo schermo e la prima ci sta
  tutta; segno sopra la prima scelta col numero giusto; ordine svincolato → segno → scelte → tasto del momento; nessuna
  finestra in più rispetto alla Home senza scelte; zero errori. Elemento mancante = rosso.
- `npm run figurina-199` — verde sulle tre viste, rosso bocciato sulle tre.
- Registrati in `package.json` e in `ci-runner.mjs` (catene `completa` e `carriera`, mirata per `src/18-`, `figurina-199`
  anche per `src/1[17]-`, `home-199` fra i passi lenti). Nessun doppione per riga (`node --check` + controllo).

## Controlli eseguiti (uno alla volta, CPM_CI_PAR=0, free -m e df -h prima di ognuno)

| Controllo | Esito |
|---|---|
| home-199 | verde, rosso bocciato |
| figurina-199 | verde, rosso bocciato |
| agente-198 | verde, rossi bocciati |
| svincolato-198 | verde, rossi bocciati |
| momento-194 | verde, rossi bocciati |
| gioca-188 | verde (6 ok, 0 ko) |
| griglia-mobile | uscita 0 · misura completa 14 schermate × 5 larghezze |
| design-system | SISTEMA GRAFICO OK |
| career-critical | verde, eseguito in quattro tranche: la catena intera ha sforato i 10 minuti di una chiamata dopo 8 passi verdi (recovery-competition … pending-mr-durable), poi cup-final-replay, coppa-nazioni, coppa-intera eseguiti a parte, tutti PASS |
| test:logic | 51 pass, 0 fail |
| save-compat | 12 pass, 0 fail |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: IDENTICO BYTE PER BYTE.

## Foto (docs/sviluppo/giro199/, dpr 2)

`prima-home-3-scelte-375.png` (rosso) · `dopo-home-3-scelte-375.png` · `dopo-home-3-scelte-pc.png` ·
`dopo-home-svincolato-375.png` · `prima-figurina-{375,390,pc}.png` (rosso) · `dopo-figurina-{375,390,pc}.png`.
Le foto «prima» sono il braccio rosso, che ripristina il codice di prima.

## Dubbi per il PO (nessuna decisione presa)

1. **Il tasto del momento scende** quando ci sono scelte: a 375×667 con 3 scelte comincia a 696 px, cioè appena sotto il
   primo schermo. È la conseguenza dell'ordine chiesto (svincolato → scelte → tasto); non l'ho cambiato.
2. **Il tasto principale appiccicato** (`avanza23`, «Vivi la settimana») nelle settimane senza partita resta il primo
   elemento della Home, sopra lo svincolato e le scelte (decisione 6.5.4 «sempre visibile»). Non l'ho spostato.
3. **Quali riquadri contano come «scelta»**: ho incluso i cinque che hanno pulsanti di decisione e non passano dalla finestra
   `_pop224`. La riconquista nello stato finale («vinta/persa») ha solo un pulsante di presa d'atto: l'ho inclusa insieme
   allo stato iniziale. Il riquadro «Mercato invernale aperto · Vai dal procuratore» è un collegamento, non una scelta: resta
   dov'era. I riquadri che nel gioco vero sono già finestre (`_pop224`: patto col mister, progetto del club, sponsor, vita
   privata, procuratore…) **non** sono stati toccati: sotto `?cpmtest=1` restano riquadri, nel gioco vero restano finestre.
4. Il testo dello shooting dice «settimana del big match» anche in settimana europea: testo preesistente, non toccato.
5. Roadmap e `GAME_VERSION` non aggiornati (regola del giro: non toccare `GAME_VERSION`); la riga di roadmap va scritta
   quando il giro viene promosso.
