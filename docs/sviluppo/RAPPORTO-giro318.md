# Rapporto giro 318 · PO-605 — due testi

Ramo `sviluppo/giro318-testi` (da `lavoro/201`, treno 7.999.201). GAME_VERSION non toccata (rilascio automatico del vagone).

## Cosa cambia
| Dove | Prima | Dopo |
|---|---|---|
| `src/18-career-app.jsx:6637`, ultimo tasto della serata di presentazione | «🎉 Che la stagione cominci →» | «🎉 Si comincia! →» |
| `src/11-ui-kit-highlight.jsx:124`, `AvvisoSalienti290` | «Nella pre-partita puoi giocare solo i momenti salienti» | «Vuoi giocare solo i momenti salienti? Lo scegli nel pre-partita» |

Rosso `window.__CPM_NO_G318` = i due testi vecchi. Il rosso `__CPM_NO_G290` resta «nessuna riga» (invariato).

## Altri punti che mostravano o controllavano le frasi
grep in `src/` e `tests/visual/` (esclusi `archivio/`, `character-lab/`, `out/`, `node_modules/`):
- `tests/visual/avviso-290.mjs`: il testo atteso (`TESTO`) e il commento di testa aggiornati al testo nuovo. Nessuna soglia toccata; il confronto resta a testo esatto.
- Nessun altro guardiano cercava «Che la stagione cominci» (lo usavano solo due sonde di `archivio/`, lasciate com'erano).

## Guardiano nuovo: `npm run testi-318`
Carriera vera a 360x800 (deviceScaleFactor 2): finestra della settimana da titolare, poi la serata aperta all'ultimo passo. Per ogni testo
controlla il testo esatto e la misura (dentro lo schermo e dentro la scatola, al massimo 2 righe, niente scorrimento orizzontale).
Se un elemento non viene trovato il controllo è «non giudicato», quindi rosso.

Misurato:
- **verde**: riga dell'avviso su **2 righe** (larga 280 px, scatola 280, alta 34 = 34) · tasto «SI COMINCIA! →» su **1 riga** (285 px = 285) · nessun errore di pagina → PASSA
- **rosso** (`__CPM_NO_G318`): tornano entrambi i testi vecchi (avviso su 1 riga) → CADE come deve

Foto (deviceScaleFactor 2): `docs/sviluppo/giro318/verde-finestra-settimana.png`, `verde-serata-ultimo-tasto.png` e le due rosse.

## Controlli
- `node tools/build-src.mjs` + `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.
- `node ci-runner.mjs giro testi-318` (guardiano + sentinelle): ESITO_GIRO
- `avviso-290` (8 percorsi × verde/rosso): non eseguito in questo giro per il tetto di tempo; lo esegue il treno (riga della mappa). Ho cambiato soltanto la stringa attesa, e la stessa riga, col testo nuovo, è misurata da `testi-318`.

## Dubbi per il PO
1. Il tasto della serata è in maiuscolo per stile (componente `Btn`), quindi a schermo si legge «🎉 SI COMINCIA! →». Il testo scritto è quello deciso, «Si comincia!».
2. A 360 px la riga dell'avviso va a capo dopo «Lo scegli nel» e lascia «pre-partita» da solo sulla seconda riga (vedi la foto). Non c'è niente di tagliato. Se preferisce andare a capo dopo il punto di domanda, si può fare con un ritorno a capo voluto.
