# Rapporto sviluppo — giro 41 · esiti «bugiardi» dell'eroe (PO-218 · PO-240 · PO-250)

Ramo `sviluppo/esiti-218-giro41`, partito da `lavoro/171-base` (5eb5500, 7.999.170 + giro 22). `GAME_VERSION` e `SAVE_VERSION`
invariati. Zona G non toccata. Fonti lette: `docs/governo/BACKLOG.md` righe PO-218, PO-240, PO-248, PO-250; rapporto del
collaudo 166 (`docs/collaudi/RAPPORTO-release-166.md` sul ramo `collaudo/release-166`, rilievo N1); banco PO-248
(`docs/sviluppo/BANCO-highlight-248.md`, nota 3: col tipo d'esito forzato il riquadro non segue).

## 1. Lo strumento

- **Testimone 3D `__CPM_V241`** (`src/12-three-match-view.jsx:5790`, solo sonde: si arma con `window.__CPM_V241={}`): per ogni
  scena d'esito registra il post-arco (`deflect`, `assist_shot`, `cross_goal`, `hit_post`, `in_net`…), i gesti del portiere e dei
  difensori (`oppActType` + canale `_mateFx` con la squadra di chi lo suona), la variante d'esito, dove finisce il pallone e se entra
  in rete (sotto la traversa e dentro la profondità della rete). Nessun moto cambiato.
- **Censimento forzato** `tests/visual/esiti-241-censimento.mjs`: pagina **nuova per scena**, GLB acceso, esito **naturale** (si forza
  solo riuscita/fallimento: il tipo lo decide il motore), riquadro (`__CPM_OUTCOME`: titolo + riga) contro motore (`__CPM_RES218.ev`)
  contro 3D (`__CPM_V241`). Filtri `CPM_FAM`, `CPM_ONLY=gi/k,…`, `CPM_ESITI`; `CPM_KIND` forza il tipo **solo per giudicare il 3D**;
  `CPM_ROSSO=1` = braccio rosso; `rapporto` aggrega. Classificatore condiviso in `tests/visual/lib/esiti-241.mjs`.
- **Censimento sul flusso vero** `tests/visual/esiti-241-partite.mjs` (partite intere dal salvataggio S12, pilota seedato).

## 2. Misura prima della correzione (tabella delle contraddizioni per famiglia)

Base 5eb5500, scene forzate, esito naturale.

| famiglia | esecuzioni | contraddizioni | cosa |
|---|---|---|---|
| cross (riuscito → chance) | 4 | 2 | riga «Che apertura! Il primo tentativo è murato» ma nel 3D la consegna rimbalza in area: nessun tiro, nessun difensore, nessun portiere |
| punizione «palla in area» (riuscita → chance) | 4 | 2 | **PO-250**: «⚡ Filtrante perfetto! La conclusione è respinta» su un cross da punizione; e il **portiere si tuffa** su una consegna che va a un compagno (gk_dive 3 su 3) — «murato» scritto sopra una parata |
| fallo cercato (gi150 «Dribbling provocatorio — il fallo c'è!») | 4 | 3 | riuscito: motore «fallo», ma riquadro «Palla d'oro!» + «il compagno non riesce a concludere» e nel 3D l'eroe **passa** a un compagno che tira (assist_recv → assist_shot → in_net, tuffo del portiere). Fallito: «Passaggio intercettato» su un dribbling, motore «tiro:blocked» |
| dribbling / passaggio | 6 | 0 | — |
| tiro, testa, volée, punizione, rigore (sbagliati) | 27 | 0 | riquadro, motore e 3D concordi (fuori, parata, palo/traversa, murato) |

Due cause **alla sorgente**:
1. la riga della chance era `pick(OUTCOME_TX.chance)` — **Math.random**, fuori dal seme — fra quattro frasi che affermano fatti diversi,
   mentre il 3D ne mostra uno solo (`src/15-live-match.jsx`, costruzione di `txt`);
2. il ramo d'esito del 3D non conosceva il fallo cercato riuscito (premio `assist` → consegna al compagno), e il cancello del tuffo del
   portiere non escludeva la consegna in area (chance con premio assist).

Difetto in più trovato col tipo forzato (solo 3D, lecito): sul **tiro/testa murati** il pallone si ferma 2,2-7,5u davanti all'eroe ma
**nessun difensore fa un gesto** (2 su 2: la reazione di reparto 7.519 cerca entro 9u dall'eroe e spesso non trova nessuno). Il riquadro
dice «Murato dalla difesa» contro il nulla.

## 3. Correzioni (una famiglia alla volta, ognuna col suo rosso; `__CPM_NO_ESITI241` le spegne tutte)

| rosso | dove | cosa cambia |
|---|---|---|
| `__CPM_NO_CHANCE241` | `src/05:316` pool `_CHANCE_TX241`; `src/15:9094-9103` | la riga della chance segue ciò che il 3D mostra: **consegna in area** (cross, punizione «palla in area», chainOn aereo) · **filtrante** (etichetta da filtrante/imbucata) · **respinta del portiere** (altri assist) · **uno-due** (il pallone torna all'eroe). Scelta col seme del riquadro, non più Math.random |
| `__CPM_NO_GKCH241` | `src/12:5494` | niente tuffo del portiere sulla consegna in area (chance + premio assist) |
| `__CPM_NO_FALLO241` | `src/05:441`, `src/15:9097`, `src/12:4759` | fallo cercato riuscito: riquadro della famiglia fallo («Subisce il fallo»), riga «Steso da un avversario: calcio piazzato»; nel 3D il difensore più vicino entra sull'eroe e il pallone resta lì (niente passaggio né tiro) |
| `__CPM_NO_DRIB241` | `src/05:426`, `src/14:1555` | dribbling fermato (non tiro, non passaggio, **non cross**): lessico del dribbling invece di «Passaggio intercettato»; nel motore un contrasto anche senza difensore nel cast, non più «tiro murato» |
| `__CPM_NO_MURO241` | `src/12:5326-5338` | tiro/testa murati: il difensore più vicino al **punto del muro** (entro 18u) ci scivola col passo dell'intercetto (7.999.10) e suona il contrasto |

## 4. Misura dopo

- Censimento forzato finale (cross, passaggio, dribbling, punizione crossata, fallo cercato; riuscito + sbagliato):
  **verde 0 contraddizioni su 20** · **rosso 6 su 20** (filtrante su cross, portiere sulla consegna ×2, fallo senza fallo ×2, palla persa
  su un tiro murato nel motore).
- Tiri sbagliati (27 esecuzioni su 5 famiglie): 0 contraddizioni.
- Muro (tipo forzato, solo 3D): difensore che si oppone **2/2** verde, **0/2** rosso.
- Prima stesura bocciata da `cross-218` («Cross dopo dribbling», «Finta di corpo e cross» finivano nel lessico del tiro: 18 su 40):
  corretta escludendo i cross dalla regola del dribbling, poi verde.

## 5. Guardiano nuovo `esiti-241` (package.json, MAPPA di `ci-runner.mjs` per src/05·12·14·15, catena `completa`, LENTI no)

`tests/visual/esiti-241.mjs`: A1 fallo cercato (enumerazione) · A2 dribbling fermato (enumerazione) · A3 motore vero · B tre scene
forzate nuove (gi14, gi16, gi150 riusciti) col classificatore del censimento · C 3D del muro (gi0 tiro, gi7 testa, tipo forzato).
Ultima corsa: **verde** A1 0/2 · A2 0/16 · A3 contrasto · B 0/3 · C 2/2; **rosso** A1 2/2 · A2 16/16 · A3 tiro · B 2/3 · C 0/2 → ✅.

## 6. Guardiani girati sul build finale (a54698c)

| suite | esito |
|---|---|
| esiti-241 | ✅ verde e rosso visibile |
| esiti-218 | ✅ verde 12 scene 0 contraddizioni · rosso 2 |
| cross-218 | ✅ (dopo la correzione del dribbling-cross) |
| lessico-218 | ✅ 0 su 138 · rosso 138 su 138 |
| conduci-242 | ✅ |
| scene-221 | ✅ 6 partite, 6,17 scene a partita |
| replay | ✅ 8 highlight completi e coerenti |
| validate-situations | ✅ PASS, 14 categorie, fingerprint 00001505 |
| seme-a | ❌ **rosso, identico sulla base 5eb5500** (worktree separato, stesso guardiano): giro 1 «sorteggi del motore diversi dal 18'» su `chiedi.riprendi`. Preesistente, famiglia **PO-262** (determinismo); non causato da questo giro |

## 7. Cosa NON è chiuso (dichiarato)

- **PO-240 (b) «miss ma in rete»**: **non riprodotto**. 0 fallimenti con pallone in rete su 47 esecuzioni sbagliate forzate e 12 scene
  di partite vere (esiti-218). Ricordo che la bozza del taccuino ha già avuto quattro falsi «in rete» (nota 7.420): senza la registrazione
  di quella scena non posso confermare che fosse un difetto del gioco.
- **PO-240 (c) codice 001 all'apertura**: non lavorato in questo giro (è nel banco PO-248, colonna 001).
- **Flusso vero, 3D**: su partite vere sotto `?cpmtest=1` il testimone 3D non vede il post-arco (la finestra d'esito si chiude prima
  dell'arco, nota 7.460): lì riquadro↔motore è giudicato (esiti-218, 0/12), il 3D no.
- **Etichette `{P}`** negli eventi del motore nelle scene forzate del provino: nomi non risolti, solo cosmetico negli strumenti.
- Il muro: misurato che il difensore **arriva a fare il gesto**; non misurato quanto vicino arrivi al pallone al contatto (headless).
- Il cross «riuscito» con chance (gi16): nel 3D un difensore attacca il cross (reazione 7.519), la riga ora non nomina né muro né portiere.
- Collaudo del PO sul telefono: da fare (testi nuovi della chance e del fallo cercato, difensore sul muro).

## 8. Stato alla consegna

Tutto ciò che è nel §3 è verde sulle suite richieste tranne `seme-a`, rosso già sulla base (PO-262). Il rapporto del collaudo e il
taccuino del PO sul telefono restano il giudice dei testi nuovi. Strumenti per rimisurare:
`node esiti-241-censimento.mjs <da> <a>` (+ `rapporto`), `node esiti-241-partite.mjs <semi>`, `npm run esiti-241`.
