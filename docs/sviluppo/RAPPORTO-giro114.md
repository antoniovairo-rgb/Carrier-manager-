# Rapporto giro 114 — lotto 7.999.184, PO-320 «Sfrutta tutta l'altezza nelle schermate!»

Ramo `sviluppo/giro114-altezza` (base `lavoro/184` = `main` = 7.999.183). `GAME_VERSION` **non toccata** (la bump spetta alla madre).
Sessione figlia: nessuna decisione di prodotto; le scelte prudenti sono in fondo.

## Cosa è stato fatto

**Regola unica «schermata piena», scritta una volta** (src/19, blocco CSS dopo le regole di `.cpm-scroll`; helper `_g114()`/`piena114()` in src/01):
- `.cpm-piena` — figlio diretto di `.cpm-scroll`: prende l'area utile (vista meno barra e safe-area); il blocco principale cresce (`flex:1 0 auto`);
- `.cpm-piena-az` — le azioni, ancorate in fondo (`margin-top:auto`);
- senza barra di navigazione i 80 px di riserva in fondo (`.cpm-scroll`) scendono a 16 px + safe-area;
- `.cpm-foglio114` — sul telefono (<900 px) la finestra è un foglio ancorato in basso (raggio solo in alto, safe-area), centrata da 900 px. `Modal` ha la prop `foglio`;
- anteprime (Coppe vuota): la carta cresce e centra il contenuto (`:has([data-cpm="anteprima-sezione"])`).
Nessun testo ingrandito. Dove la pagina scorre non cambia niente.

**Applicata a** (perimetro): G184-01/35 pre-partita (`MatchdayCard` + contenitore di `LiveMatch` + effetto di `.cpm-match-wrap`; i tasti Analisi/Salta/Simula/Torna a 44 px reali) · G184-03 offerte (carte che crescono, stemma 64 px) · G184-04 menu (testata che cresce, il resto in fondo) · G184-05/34 Opzioni (blocco Audio che cresce e distribuisce le righe; ✕ 44x44 anche sotto 640 px; interruttori con `cpm-t40` → 44 px di tocco) · G184-06 finestre settimana (3 tipi) e partita (2 `Modal`) come foglio · G184-07 «momento» come foglio (le feste e il gala restano scenografia, non toccati) · G184-08 Coppe vuota e passaggio ai professionisti (PC) · G184-35 «Gioca ›» del calendario a 44 px.

**Interruttore rosso** `__CPM_NO_G114` = il comportamento della 183 (ogni punto toccato è sotto `_g114()` o sotto `piena114()`).

**Guardiano nuovo** `npm run altezza-114` → file `tests/visual/altezza-114.mjs` (script `npm run altezza-114`). Per ognuna delle 13 schermate del perimetro, nei 3 formati (360x800 · 412x915 · 1440x900): vuoto ≤12% dell'area utile **oppure** pagina che scorre (metro `ALTEZZA()` del collaudo, in `c184-lib.mjs`), più il tocco ≥44 px (area effettiva, rettangolo ∪ `::after`) di ✕ e interruttori delle Opzioni, tasti del pre-partita, «Gioca ›». Braccio rosso `__CPM_NO_G114`: deve far fallire (11, 12 e 6 schermate fuori regola nei tre formati). Braccio e motivo stampati per ultimi.
Sonde del collaudo copiate dal ramo `collaudo/184-altezza-flussi`: `c184-altezza.mjs`, `c184-lib.mjs`, `c184-provini.mjs`, `c184-sintesi.py`.

## Tabella schermata · formato · vuoto prima · vuoto dopo

(«prima» = braccio rosso, cioè il comportamento della 183, misurato dal guardiano; le offerte sono quelle sintetiche del guardiano — 3 offerte — e per questo il «prima» differisce dal collaudo, che ne aveva 2.)

| schermata | formato | vuoto prima (183) | vuoto dopo (giro 114) |
|---|---|---|---|
| menu | 360x800 | 32.1% | 10.9% |
| menu | 412x915 | 43.8% | 8.8% |
| menu | 1440x900 | 47% | 2.4% |
| opzioni | 360x800 | 43% | 1.8% |
| opzioni | 412x915 | 50.2% | 1.5% |
| opzioni | 1440x900 | 49.3% | 1.6% |
| offerte | 360x800 | 50.8% | 3.5% |
| offerte | 412x915 | 58.3% | 3.1% |
| offerte | 1440x900 | 66.7% | 3.1% |
| momento-la-telefonata-del-ct | 360x800 | 22.5% | 0% |
| momento-la-telefonata-del-ct | 412x915 | 27.3% | 0% |
| momento-la-telefonata-del-ct | 1440x900 | 31% | 31% (finestra centrata da 900 px: voluto) |
| calendario | 360x800 | scorre | scorre |
| calendario | 412x915 | scorre | scorre |
| calendario | 1440x900 | scorre | scorre |
| coppe-vuota | 360x800 | 4.3% | 4.3% |
| coppe-vuota | 412x915 | 19.7% | 5% |
| coppe-vuota | 1440x900 | 2% | 2% |
| settimana-impulso | 360x800 | 23.4% | 0% |
| settimana-impulso | 412x915 | 27.8% | 0% |
| settimana-impulso | 1440x900 | 28.7% | 28.7% (finestra centrata da 900 px: voluto) |
| settimana-spogliatoio | 360x800 | 27.3% | 0% |
| settimana-spogliatoio | 412x915 | 31.3% | 0% |
| settimana-spogliatoio | 1440x900 | 31% | 31% (finestra centrata da 900 px: voluto) |
| settimana-vissuta | 360x800 | 28.3% | 0% |
| settimana-vissuta | 412x915 | 31% | 0% |
| settimana-vissuta | 1440x900 | 31.9% | 31.9% (finestra centrata da 900 px: voluto) |
| partita-titolare | 360x800 | 25.5% | 0% |
| partita-titolare | 412x915 | 29.7% | 0% |
| partita-titolare | 1440x900 | 29.4% | 29.4% (finestra centrata da 900 px: voluto) |
| partita-panchina | 360x800 | 25.5% | 0% |
| partita-panchina | 412x915 | 29.7% | 0% |
| partita-panchina | 1440x900 | 29.4% | 29.4% (finestra centrata da 900 px: voluto) |
| passaggio-pro | 360x800 | scorre | scorre |
| passaggio-pro | 412x915 | scorre | scorre |
| passaggio-pro | 1440x900 | 32.9% | 2% |
| prepartita | 360x800 | 22.1% | 3.5% |
| prepartita | 412x915 | 33.9% | 3.1% |
| prepartita | 1440x900 | 34.2% | 2.2% |

Foto prima/dopo: `docs/sviluppo/foto-giro114/<schermata>-<formato>-rosso.png` (prima) e `-verde.png` (dopo).

## Tocco ≥44 px

| controllo | formato | prima | dopo |
|---|---|---|---|
| opzioni | 360x800 | «✕» 34x34, «» 42x24, «» 42x24, «» 42x24, «» 42x24, «» 42x24, «» 42x24 | tutti ≥44 px |
| calendario | 360x800 | «Gioca ›» 70x40 | tutti ≥44 px |
| prepartita | 360x800 | «Analisi dell'avversario» 170x40, «Salta e gioca» 170x40, «Torna alla home» 348x40 | tutti ≥44 px |
| opzioni | 412x915 | «✕» 34x34, «» 42x24, «» 42x24, «» 42x24, «» 42x24, «» 42x24, «» 42x24 | tutti ≥44 px |
| calendario | 412x915 | «Gioca ›» 70x40 | tutti ≥44 px |
| prepartita | 412x915 | «Analisi dell'avversario» 202x40, «Salta e gioca» 202x40, «Torna alla home» 412x40 | tutti ≥44 px |
| opzioni | 1440x900 | «✕» 34x34 | tutti ≥44 px |
| calendario | 1440x900 | «Gioca ›» 70x40 | tutti ≥44 px |
| prepartita | 1440x900 | «Analisi dell'avversario» 546x40, «Salta e gioca» 546x40, «Torna alla home» 1100x40 | tutti ≥44 px |

(Sul PC col mouse l'`::after` di `cpm-t40` non esiste: gli interruttori si giudicano solo nei formati a tocco; ✕, tasti del pre-partita e «Gioca ›» hanno altezza reale 44 e valgono ovunque.)

## Scelte prudenti (da confermare)

1. **Finestre centrate a PC (≥900 px)**: restano centrate, come da decisione della madre; il guardiano le esonera esplicitamente (vuoto sopra e sotto voluto).
2. **Feste, gala, presentazioni, saga, intro, provini**: non toccati (scenografia o perimetro del giro 115). La festa della Nazionale resta al 32% di vuoto.
3. **Menu iniziale**: la testata marchio prende lo spazio che avanza (centrata); è la lettura più semplice di «il blocco principale cresce». Se il PO preferisce un marchio di taglia fissa con più respiro, è una modifica di sola disposizione.
4. **Stemmi delle offerte 44→64 px**: unico ingrandimento (non è testo); si toglie in un punto solo (`size={_g114()?64:44}`, src/17).
5. **Offerte nel guardiano**: la schermata si apre scrivendo `cpm-trial-prog` con `ph:"offers"` (ripresa, fuori da `?cpmtest=1`); non attraversa i provini.

## Verifiche (un controllo alla volta, `CPM_CI_PAR=0`)

Tutto verde sul build del ramo (`check-src` IDENTICO, `build-src` allineato):
- `altezza-114` — verde 3 formati × 13 schermate; rosso `__CPM_NO_G114` cade (11 · 12 · 6 schermate fuori regola);
- `collaudo-110` ✅ · `lineetta-181` ✅ · `scorri-113` ✅ (0 difetti, rosso 18) · `formazioni-204` ✅ · `pc-tablet-292` ✅ (VERDE, il rosso cade) · `griglia-mobile` ✅ (esce 0; la riga «NON misurato: prepartita: playMatch → nomatch» è del suo percorso, non del pre-partita nuovo, misurato qui da `altezza-114`) · `partita-v2` ✅ (verde 4,93:1, rosso atteso) · `career-critical` ✅ · `test:logic` 43/43 · `save-compat` 12/12 · `validate-situations` ✅ PASS (14 categorie).
- `griglia-mobile` riscrive `docs/collaudo-grafico/g0/*`: ripristinato (`git checkout`), non committato.
- Lunghi: `collaudo-110` 5'42", `pc-tablet-292` >8', `partita-v2` >9', `career-critical` >10', `validate-situations` >10' — girati in sottofondo con attesa in primo piano dentro il turno.

## Da fare dalla madre

- `altezza-114` è già nel `package.json` (script `npm run altezza-114`); resta da inserirlo nella catena `ci:grafica` di `ci-runner.mjs` (non toccata);
- riga di ROADMAP e `GAME_VERSION` (7.999.184).
