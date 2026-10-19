# Rapporto giro 60 — residui L1-bis su esiti e gesti dell'eroe (PO-218 · PO-240 · PO-250 · PO-258 · PO-068 · PO-143)

Ramo `sviluppo/esiti-gesti-giro60`, partito da `lavoro/172` (46cdcdc, 7.999.172). `GAME_VERSION` e `SAVE_VERSION` invariati,
zona G non toccata. File di gioco toccati: `src/14-motore-possesso.jsx`, `src/15-live-match.jsx` (+ ricomposizione di
`CARRIER-MANAGER-AV.html`). Fonti lette: righe del BACKLOG delle sei voci, DECISIONI (05/10, 06/10, 15/10 notte), rapporti
dei giri 17, 27, 40, 41, 42, 43, 45, 50, 53.

Misure sulla 172 in un primo momento su **quattro processi paralleli** (carico medio 8-15 su 4 CPU): due guardiani sono usciti
rossi solo in quelle condizioni e verdi rigiocati da soli (vedi le voci). Le misure «dopo» delle correzioni sono su un worktree
separato con la build del ramo, scene forzate, **GLB acceso**, pagina nuova per scena.

## Sintesi per voce

| voce | stato misurato sulla 172 | cosa ho fatto | dopo |
|---|---|---|---|
| PO-218 | guardiani del filone verdi (esiti-241, esiti-218, cross-218, lessico-218). **Buco di misura**: il censimento esiti-241 escludeva le scene difensive. Incluse: 2 difetti nuovi | 2 correzioni, guardiano `esiti-60` | verde 0/8 + 0/2, rosso 5/8 + 2/2 |
| PO-240 | (a) chiuso dal collaudo 166; (b) «miss ma in rete» non riprodotto (giro 41: 0/47); (c) 001: 7/20 aperture oltre 3u, ma la sonda non separa «in volo» da «fermo» | sonda `sonda-001-60` che prova a separarli | **non concluso** (vedi Non verificato) |
| PO-250 | chiuso dal giro 41 (nella 171): `esiti-241` parte B verde su gi14 «Cross basso teso» (punizione «palla in area») | nulla | — |
| PO-258 | `parata-258` **instabile sotto carico**: rosso 1/4 e 1/6 con 3-4 browser in parallelo (due modi diversi), verde 6/6 da solo | nulla (No Blind Fix: causa non isolata) | — |
| PO-068 | `gesti-motore-068` verde 24/26 (invariato dai giri 17/45); il resto richiede clip o decisioni PO | nulla: decisione scritta sotto | — |
| PO-143 | `pressing-143` verde; `testa-143` rosso sotto carico, verde da solo. Residuo del giro 43 confermato: «Stacco difensivo» fallito raccontato come tiro parato | 1 correzione (la stessa di PO-218 B) | verde 0/2, rosso 2/2 |

## PO-218 — esiti «bugiardi»

### Misura prima
Guardiani del filone sulla 172: `esiti-241` ✅ (A1 0/2 · A2 0/16 · A3 contrasto · B 0/3), `esiti-218` ✅, `cross-218` ✅,
`lessico-218` ✅ (0/138, rosso 138/138).

Il censimento `esiti-241-censimento.mjs` scartava le situations `type:'def'` (`famigliaDi`: `if (sit.type === 'def') return null`).
Le ho incluse con `CPM_DIF=1` (573 candidate, di cui 86 contrasti, 3 colpi di testa e 1 cross difensivi). Prima corsa (8 esecuzioni):

| scena | esito | riquadro | motore (`__CPM_RES218.ev`) |
|---|---|---|---|
| gi36/0 «Stacco di testa» (def) | riuscita | «Serranda abbassata!» «💪 Muro invalicabile — il tiro non passa!» | **tiro:saved dell'eroe, rammarico** |
| gi44/0 «Stacco di testa deciso» (def) | riuscita | «Porta salvata!» «🛡️ SALVATO! Che intervento!» | **tiro:saved dell'eroe, rammarico** |
| gi136/0 «Blocca il cross con il corpo» (def) | fallita | «Gol subito» | **cross, fuori** dell'eroe, poi tiro:goal e gol avversario |
| gi31/0 contrasto | riuscita / fallita | coerenti | coerenti |

Causa (`src/14`, `risolviEroe.eventi`): la scena difensiva è riconosciuta solo se la famiglia del gesto è `tackle`. Gli stacchi
difensivi hanno famiglia `header` (da `deriveHL`) e chiave `save`, quindi cadevano nel ramo del tiro (`key==='save'` →
`tiroEroe('saved')` + `parata` + `rammarico`): **un salvataggio difensivo contava come tiro in porta dell'eroe** (le statistiche
`tiri`/`inPorta` leggono questi eventi, `src/14:326/358`). Il cross difensivo cadeva in `famPass`.

Seconda causa, su un'azione d'attacco (residuo dichiarato del giro 43): gi126/1 «💪 Stacco difensivo deciso» (premio `recovery`)
fallito → 2/2 «Tentativo respinto — ❌ Tiro debole, para comodo» e nel 3D il portiere avversario para (`gk_block`, `gk_dive`) un
pallone colpito a centrocampo. `_outKind` usciva `saved` dalla lente-tiro di `decideExecution` (intento `shot` per ogni testa).

### Correzioni
| rosso | dove | cosa cambia |
|---|---|---|
| `__CPM_NO_DIF60` | `src/14` `risolviEroe.eventi` (`famDefX`, solo famiglia `header`/`cross`); `src/15` passa `def` (sit.type) al motore | scena difensiva di testa o di cross: `spazzata` dell'eroe se riesce, l'avversario che prosegue (`conduzione`) se fallisce; il gol subito resta del blocco `goal_against` |
| `__CPM_NO_STACCO60` | `src/15` `handleAction`, chokepoint M1 accanto al remap 7.247 | stacco di testa con premio recupero/possesso fallito → `_outKind` `intercepted`: riquadro, 3D e cronaca lo leggono da lì |

### Misura dopo (scene forzate, GLB acceso)
- gi36/0 e gi44/0 riusciti: motore `spazzata` (niente tiro, niente rammarico); gi136/0 fallito: niente cross dell'eroe.
- gi126/1 fallito, 2/2: «Palla persa» «❌ Palla persa nel contrasto.», nessun gesto del portiere. Rosso: 2/2 «Tiro debole, para
  comodo» con `gk_dive`.

### Prima stesura bocciata da `difesa-220-giro31`
La prima versione (c12c842) prendeva ogni scena difensiva con famiglia **diversa da** `tackle`. Le scene difensive **generate dal
motore** (quelle di `difesa-220-giro31`: «Chiusura immediata», «Raddoppio coordinato col compagno») possono avere famiglia vuota
da `deriveHL`, e il loro contrasto riuscito diventava una `spazzata`: casi «forti» (riquadro e 3D in disaccordo a +2 s) **29%,
29%, 36%** in tre corse del ramo contro **15%** della base 172 (stesso guardiano, worktree della base). Ristretta a `header`/`cross`
(4b3109c): **14%**, verde. Le 86 azioni difensive di `SITUATIONS` sono tutte `tackle`/`header`/`cross` (enumerazione), quindi
l'enumerazione di `esiti-60` non poteva vedere questo caso: lo vede `difesa-220-giro31`, che è nella MAPPA di `src/15`.

### Guardiano nuovo `esiti-60` (package.json; MAPPA `src/14` e `src/15`; catena `completa`)
A: enumerazione sul motore vero di tutte le azioni delle situations difensive non-contrasto (8 esecuzioni) · B: scena forzata
gi126/1 fallita ×2. Ultima corsa: **verde A 0/8 · B 0/2 · rosso A 5/8 · B 2/2** → ✅.

## PO-240 — «sfiora il vantaggio sul 3-0», «miss ma in rete», codice 001

- (a) chiusa dal collaudo 166 (BACKLOG).
- (b) non riprodotta nemmeno qui: nei censimenti di questo giro 0 esecuzioni fallite col pallone in rete (classificatore
  `contraddizioni`, regola «fallito ma IN RETE»). Il giro 41 ne aveva 0 su 47.
- (c) `sonda-001-60.mjs` (= `sonda-001-42` + traccia del pallone nella finestra di scena 0,3-1,0 s): 3 partite vere, 20 aperture
  dal gioco fluido, **7/20 con il pallone oltre 3u** dal corpo più vicino (il giro 42 ne contava 5/15). Ma in 15 aperture su 20 la
  finestra conteneva **un solo campione** (tempo di scena che avanza a scatti in headless con altri browser accesi): da lì non si
  separa «in volo verso l'eroe» da «fermo senza padrone». Sulle 5 aperture con ≥10 campioni (tutte nella partita 2): 1 oltre 3u, in volo; 0 ferme.
  **Non posso confermare** che il 001 sia un difetto del gioco; nessuna correzione.

## PO-250 — punizione crossata chiamata «filtrante»
Corretta dal giro 41 (in 171). Sulla 172 `esiti-241` parte B giudica gi14/0 «↗️ Cross basso teso» riuscito: «Palla d'oro!»
«↗️ Pallone messo in mezzo: mischia in area…», 0 contraddizioni. Nessun lavoro.

## PO-258 — portiere fuori tempo sulla punizione parata (codice 111)
`parata-258` sulla 172:
- in parallelo con altri tre browser: **rosso 1/4** (scena x84: portiere senza gesto, pallone 3,28u oltre di lui) e, rilanciato,
  **rosso 1/6** (scena x83: portiere non ancora uscito, x 42,68, arco finito 6,9u davanti a lui, distesa 21%);
- da solo: **verde 6/6** (pallone 0,0-0,7u dalle mani).
Due modi diversi, mai sulla stessa scena, solo sotto carico: è la firma della precedenza tempo reale ↔ tempo di scena (7.460),
ma **non l'ho dimostrato** (servirebbe la traccia per fotogramma di una scena rossa: una copia di `parata-258` che la stampa, girata da sola,
ha dato 6/6 verdi e nessun rosso da tracciare). Nessuna correzione. Rischio per la catena: `parata-258` può uscire «instabile».

## PO-068 — gesti P1-b, P2, P3

### Stato sulla 172
- `gesti-motore-068` ✅ verde 24/26 varianti raggiunte dal motore (mai `tackle/press`, `tackle/call`: clip nulla per scelta),
  dal catalogo 26/26. Invariato dai giri 17 e 45.
- Dal giro 45 (non rigiocato qui, codice dei gesti non toccato dopo): varianti con lo stesso corpo (5 tiri sulla stessa rincorsa,
  3 teste sulla stessa clip, cross e passaggi a due clip); `contactAt`/`foot` vivono per clip in `CONTATTO_CLIP`, non per variante;
  `cross_rabona` e `heel` tolti finché non arriva una clip (`src/12:3055`, decisione 06/10); stacco da fermo `mx-header-stand`
  sospeso perché peggiora il contatto testa-pallone (3,0-3,3u contro 1,1u, `src/12:11183`).
- P2/P3 (protezione col corpo, reazioni dei compagni al gol, barriera dell'eroe, infortunio in scena): ancora non toccati.

### Decisione da prendere (non presa qui)
Ciò che resta di PO-068 non si chiude con codice senza clip nuove o senza rivedere decisioni già prese dal PO.
1. **Chiudere PO-068 per la parte «motore» e aprire una voce clip** (consigliata): P1-b dichiarato fatto per quanto possibile
   con le clip attuali (24/26, la variante scelta arriva al corpo dal giro 45); varianti distinguibili, rabona, tacco e P2/P3
   passano a una voce nuova legata a PO-070 (procurare clip), fuori dalla fase di stabilità.
2. **Un solo P2/P3 adesso**: per esempio la barriera dell'eroe sulle punizioni contro, con clip esistenti; stima 3-4 h con
   guardiano, rischio di regressione sugli highlight in fase di stabilità.
3. **Tiro di prima senza rincorsa** (1 h): riporta il «kick da fermo» bocciato dal PO nel 7.999.34 (rosso di `tiro-caricato`);
   da fare solo se il PO rivede quella decisione.

## PO-143 — dribbling fasullo, esiti in rete, pallone che arretra
- `pressing-143` ✅ verde e rosso visibile.
- `testa-143`: rosso alla prima corsa (in parallelo: «bersaglio del colpo di testa null», arco non osservato), **verde da solo**
  (#126/1 bersaglio 16,3 contro rosso 42,2; arretramento in fila 0,9-1,9u).
- Residuo «Stacco difensivo fallito: lessico del tiro su un recupero» (giro 43): corretto qui, vedi PO-218 (`__CPM_NO_STACCO60`).
- Resta aperto (giro 43): su #126 il pallone nasce sull'eroe e il cross arriva da un compagno più avanti; il rimedio tocca
  l'apertura della scena e le firme golden. Non fatto.

## Rituali

`node ci-runner.mjs mirata origin/lavoro/172` (file toccati `src/14`, `src/15` → 50 passi: nucleo `test:logic`, `save-compat`,
`design-system`, `typing-shortcuts`, `career-critical` + MAPPA delle due parti, compresi `validate-situations`, `partita-vera`,
`esiti-60`, `difesa-220-giro31`).

**Prima corsa, build c12c842 — fermata a 37/50 e NON valida** (build corretto dopo): verdi fra gli altri `validate-situations`
(14/14, fingerprint 00001505), `career-critical`, `partita-vera`, `esiti-218`, `esiti-241`, `esiti-60`, `catalogo-022`,
`pressing-143`, `spot-266`, `tecnica-045`, `tabellino-228`; instabili `pallino-278`, `esito-280`; rossi:
- `tempo-138` ❌ «rosso: il difetto non si vede» (braccio rosso cieco) — **identico sulla base 172** (worktree di
  `origin/lavoro/172`: verde pagato 308/308, rosso 198/198, stesso verdetto). Preesistente, non di questo giro.
- `difesa-220-giro31` ❌ — **causato dalla prima stesura**, corretto in 4b3109c (vedi PO-218).

**Seconda corsa, build 4b3109c:** **47/50 verdi** (giro composto: il container si è riavviato due volte,
alle ~23:08 e ~01:39 UTC; rifatti solo i passi mancanti sullo stesso build, `CPM_CI_FATTI`, regola PO 14/10; registrato in
`docs/governo/STABILITA.json`). Verdi fra gli altri: `validate-situations` 14/14 (fingerprint 00001505), `test:logic`,
`save-compat`, `design-system`, `career-critical`, `partita-vera`, `esiti-60`, `esiti-241`, `esiti-218`, `cross-218`,
`lessico-218`, `catalogo-022`, `scene-221`, `nomi-219`, `tecnica-045`, `spot-266`, `conduci-242`, `interazioni-226`.
Instabili (verdi alla seconda prova): `difesa-220-giro31` (casi forti 21% alla prima, tutti contrasti lunge/slide: ramo non
toccato; la base sta sulla soglia, 15%), `difesa-220`.

**I tre rossi, tutti rossi anche sulla base 172** (worktree di `origin/lavoro/172`, stesso guardiano):
| guardiano | ramo | base 172 |
|---|---|---|
| `tempo-138` | rosso 3 catene: braccio rosso cieco (pagato = aperto) | rosso: verde 308/308, rosso 198/198, «il difetto non si vede» |
| `pressing-143` | rosso in catena (3 volte); da solo verde 2/2 | rosso 2/2 da solo («marcatore a 3,94 m», «marcatore vicino anche spento 2,91 m»), 2/2 sotto carico (3,52-3,53 m) |
| `schede-259` | rosso (parte C) | rosso: «A: momento decisivo muto pari al 77 dopo un tiro loro al 76» |

Nessuno dei tre tocca il codice cambiato qui (debito di tempo, marcatore 3D in `src/12`, schede del pari); vanno nel giro dei
rossi preesistenti.

## Non verificato

- **Sul telefono**: testi nuovi («Palla persa nel contrasto» sullo stacco fallito), spazzata dell'eroe nella cronaca dopo uno
  stacco difensivo riuscito. Giudice: collaudo/taccuino del PO.
- **Statistiche di carriera**: la correzione A toglie un tiro in porta all'eroe per ogni salvataggio difensivo di testa riuscito.
  Non ho misurato quanto si spostano i tiri dell'eroe a stagione (né su `partita-vera` oltre il suo esito di catena).
- **PO-258**: la causa dei due rossi sotto carico non è isolata; non so se sul telefono lento si presenti.
- **PO-240 (c)**: la sonda non ha abbastanza campioni per separare «in volo» da «fermo»; servirebbe una corsa a carico basso o
  il campionamento per fotogramma dentro il gioco (testimone nel render-loop).
- **PO-240 (b)**: senza la registrazione della scena del taccuino 14/10 non posso dire se fosse un difetto del gioco.
- **PO-068**: `gesti-firme-045` non rigiocato su questa build (codice dei gesti non toccato); le varianti «con lo stesso corpo»
  sono il dato del giro 45.
- Le scene difensive di contrasto (86) le ho censite solo su gi31; le correzioni non le toccano (`famDef` invariato).
