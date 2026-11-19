# Rapporto giro 276 — riparazione di `memoria-275` (nato rosso nella 197)

Ramo `sviluppo/giro276-memoria`, partito da `lavoro/197` a `a81ebb10`. `GAME_VERSION` non toccata.
Decisioni di riferimento: PO-516 (18/11 14:10, un rosso nato nella 197 si ripara prima di uscire) e PO 18/11 22:15 (di notte si ripara, si pubblica al mattino).

## Esito in una riga

Il difetto era nel GIOCO, non nel controllo. Corretto con un rilascio allo smontaggio della partita (rosso `window.__CPM_NO_G276`).
`memoria-275`: verde 2 su 2 col verde, rosso 2 su 2 col rosso. Soglie e controllo invariati.

## Tabella «196 / 197 prima / dopo»

Tappa giudicata: `avvio-2-senza-__CPM` (seconda partita avviata, agganci di prova `window.__CPM*` tolti, GC forzato).

| | scene | renderer | corpi animati | Object3D | heap dopo GC | esito |
|---|---|---|---|---|---|---|
| 7.999.196 (`3076a1b7`, misura della verifica V1b, non rifatta qui) | 1 | 2→2 | 962→976 | — | 370 MB | verde |
| 197 prima (`a81ebb10`, rifatta qui) | 2 | 2→3 | 869→1846 | 13222→26481 | 303 MB | ROSSO |
| 197 dopo, corsa 1 (`f0c794da`) | 1 | 2→2 | 869→883 | 13222→13421 | 194 MB | verde |
| 197 dopo, corsa 2 | 1 | 2→2 | 869→883 | — | 196 MB | verde |
| 197 dopo con `__CPM_NO_G276`, corsa 1 | 2 | 2→3 | 869→1846 | 13222→26481 | 305 MB | rosso come atteso |
| 197 dopo con `__CPM_NO_G276`, corsa 2 | 2 | 2→3 | 869→1846 | — | 304 MB | rosso come atteso |

Gli heap assoluti di 196 e 197 non sono confrontabili fra loro (già annotato dalla verifica); dentro la 197 il residuo scende da 303 a 194 MB.

## Chi tratteneva la scena (misurato, non dedotto)

Istantanea dell'heap presa alla tappa giudicata sulla 197 (`CPM_SNAP275`), cammino più corto dalle radici alla scena vecchia:

`_MASC240` (costante di modulo, src/16) → `u.value` (texture della maschera del viso) → `_listeners.dispose` → chiusura del renderer della
partita finita → contesto WebGL → tela → ascoltatori della tela → scena.

La maschera del viso del giro 240 è una texture unica per pagina, passata allo shader della testa come *uniform*. Il renderer della partita
la carica e vi registra il proprio ascoltatore `dispose`. Lo smontaggio libera le texture che trova come proprietà dei materiali
(e, dal giro 53, quelle di `_glbCache` e `_kitTexCache`), ma un uniform non è una proprietà del materiale: l'ascoltatore restava.
È la stessa classe dei due trattenitori del giro 53, terzo caso.

## Commit che lo fa nascere

`6755567d` — «giro 240 (in corso): pelle e capelli dalla figurina con maschera del viso…» (è il commit che introduce `_MASC240`,
`git log -S"_MASC240" origin/main..lavoro/197`). Confermato con la sonda del guardiano:

| commit | esito | misura |
|---|---|---|
| `821af2a6` (il precedente) | verde | scene 1 · renderer 2→2 · corpi animati 962→976 |
| `6755567d` | rosso | corpi animati 962→1939 · Object3D 13532→26793 alla tappa giudicata |

Limite dichiarato: su `6755567d` la corsa ha superato il mio tetto di 590 s e i tre conteggi finali (scene, renderer, tele) sono usciti
«err»; il rosso si legge dai corpi animati e dagli Object3D raddoppiati nella stessa tappa (alla tappa prima: scene 2, renderer 3).
Non ho fatto la bisezione sugli altri 94 commit: l'istantanea indicava già l'oggetto e i due commit a cavallo lo confermano.

## Correzione

- `src/16-scene-3d-cerimonie.jsx`: nuova `_rilascia276()` accanto a `_maschera240` — chiama `dispose()` sulla texture della maschera
  (toglie l'ascoltatore; l'immagine resta e il renderer successivo la ricarica al primo uso). Rosso `window.__CPM_NO_G276`.
- `src/12-three-match-view.jsx`: una chiamata nel secondo passo dello smontaggio rimandato (`_p2_219`), dopo i rilasci del giro 53.
- `tests/visual/package.json`: script `memoria-275:rosso276` (braccio rosso). `memoria-275.mjs` e `ci-runner.mjs` non toccati.
- `tools/build-src.mjs` + `tools/check-src.mjs`: IDENTICO BYTE PER BYTE (7864077 byte).

## Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

| controllo | esito | nota |
|---|---|---|
| memoria-275 (verde) | ✅ 2 su 2 | vedi tabella |
| memoria-275 (rosso `__CPM_NO_G276`) | ✅ rosso 2 su 2 | vedi tabella |
| test:logic | ✅ | 3 s |
| save-compat | ✅ PASS | 1 s |
| tocco3d-219 | ❌ rosso (verde 4/9 · rosso bocciato 6/6) | «G3 compito lungo … fra tocco e scena chiusa». **Rosso anche su `a81ebb10` senza la mia modifica** (rifatto qui, solo braccio verde: 5 bocciature su 9, stessa causa) e già «dichiarato, rosso anche sulla 196» nella verifica V1b. Non nasce da questo giro. |
| pelle-240 | ❌ rosso 2 su 2 sul mio ramo, ✅ verde 1 su 1 su `a81ebb10` | vedi dubbio 1 |

Non eseguiti per il tetto del giro (circa 3 ore): `serata-261`, `presentazione-225`, `render-3d-023`, `scena3d-96`, `camera-241`.
Non toccato src/15: `solo-highlight-166` e `battito-264` non dovuti. Non eseguiti, come da regola: `highlight-95`, `ingresso-206`, `career-critical`.

## Dubbi per il PO

1. **`pelle-240` è rosso sul mio ramo per un solo viso della serata, di misura.** Unica bocciatura: «serata: Gary Howard … → 12,4»
   contro soglia 12 (capelli sbagliati 0 in tutte le scene: la maschera funziona). Massimo della serata misurato:
   col mio ramo 12,4 · 12,4 · 13,5 · 12,2 · 10,6 · 11,8; con i sorgenti di `a81ebb10` 11,3 · 10,8 · 9,2 · 7,2 · 12,0.
   Quello che posso confermare: nel guardiano la serata gira su una pagina nuova aperta dalla carriera, senza partita, e
   `_rilascia276` è chiamata solo dallo smontaggio di `ThreeMatchView` (unico punto, verificato col grep); quindi in quella pagina il
   codice aggiunto non viene eseguito. Quello che NON posso confermare: che la differenza fra le due serie sia solo rumore. Le serie
   sono corte (6 contro 5), la misura oscilla di suo (da 7,2 a 12,0 sui sorgenti di partenza) e la sonda che doveva contare le chiamate
   durante la serata non è andata a buon fine (le mancava il salvataggio di prova). Serve una decisione: accettare `pelle-240` come
   instabile preesistente sulla serata, oppure un giro dedicato che lo misuri con più corse prima di pubblicare.
2. **Stessa classe nelle altre scene 3D.** La maschera viene caricata anche dai renderer di serata, parata e cerimonie (src/16) e del
   ritratto (src/01), che hanno i loro smontaggi. Non ho misurato se anche lì la scena chiusa resta trattenuta: `memoria-275` giudica
   solo le due partite, e il lotto è chiuso. Da valutare in un giro successivo.
3. **`tocco3d-219`** resta rosso come nella verifica V1b (anche sulla 196): non è di questo giro, ma è nella mappa mirata di src/12.
4. **Cinque guardiani mirati non eseguiti** (elenco sopra) per il tetto di tempo: se servono prima della pubblicazione, vanno lanciati.
5. Nessuna voce in `DECISIONI.md`: il controllo non è stato modificato. Roadmap non aggiornata (lotto chiuso, versione non toccata).
