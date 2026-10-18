# RAPPORTO giro 66 — PO-154 «Memoria + seguiti + contesto» · PO-224 riquadri in finestra

Ramo `sviluppo/impulsi-154-giro66`, base `lavoro/172` (`46cdcdc`, 7.999.172). Lavoro per la 7.999.173.
`GAME_VERSION` **non** cambiato (resta `7.999.172`, come da incarico). `SAVE_VERSION` non cambiato.

Fonti della decisione: `docs/governo/DECISIONI.md` (16/10 notte, punto 2: PO-154 «Memoria + seguiti + contesto»;
16/10 mattina: eccezione zona G per gli impulsi; 10-11/10: PO-224) e `docs/governo/PROPOSTA-L6.md` §1
(ramo `analisi/proposta-l6-giro38`), che riporta i numeri di `docs/collaudi/RAPPORTO-carriere-l6.md` §2.

## 1. PO-154 — cosa è cambiato

| Pezzo | Dove | Cosa fa |
|---|---|---|
| Memoria | `src/03-eventi-narrativi.jsx` (helper `impMem154`, `absW154`); `src/18-career-app.jsx` pescaggio in `liveCurrentWeek` e `handleImpulseChoice` | campo opzionale `p.impMem` `{id → {c, s, w, a}}`: `c` = indice della scelta (−1 = mostrato senza risposta), `a` = settimana assoluta `(stagione−1)·38+settimana`. Scritto solo nei due punti in cui un impulso nasce e si risolve. Anche `apriImpulso` (varco di collaudo) porta `impId`. |
| Seguiti | `src/03` (25 voci con `seg:{da,c,min,max,ctx}`, regola `segOk154`) | un seguito è idoneo solo se l'impulso `da` è stato risolto con la scelta `c` fra `min` e `max` settimane fa e non è già stato seguito dopo quella scelta. Nel pescaggio passano davanti a tutto (a parità, l'origine più vecchia). Due catene di secondo livello: `wi_seg_docu_puntata → wi_seg_docu_premio`, `wi_seg_lite_clan → wi_seg_lite_mister`. `wi_carita_anonima` (la donazione anonima scoperta) diventa il seguito di «Dono in silenzio» di `wi_ospedale`. Etichetta in finestra: «Il seguito», icona 🧵. |
| Contesto | `src/03`, 38 voci con `cond:_cx154(...)` | le 40 voci senza condizione ne ricevono una (forma, ruolo in rosa, risultati recenti, età, conto, gara in settimana/trasferta, stagione delle piogge); `wi_carita_anonima` passa ai seguiti; `wi_scommessa_amici` dichiarata universale (`IMP_UNIVERSALI154`). |

Nessun seguito tocca l'esito di un investimento: quello resta del rollover (PO-223). Il testo del seguito della
cripto è volutamente neutro («montagne russe»), perché l'esito vero è deciso a fine stagione.

Interruttori rossi: `__CPM_NO154` (memoria non scritta, seguiti mai idonei) · `__CPM_NO154C` (le 38 condizioni nuove
tornano sempre vere).

### Misure prima/dopo

**A. Catalogo contro 8 profili sintetici** (guardiano `impulsi-memoria-154`, dalla Primavera S1 al veterano in crisi):

| | Prima (rosso `NO154`+`NO154C`) | Dopo |
|---|---|---|
| Voci senza condizione | 40 su 106 (PROPOSTA-L6 §1.1) | **1** (`wi_scommessa_amici`, dichiarata) |
| Voci idonee per **tutti** gli 8 profili | 39 | **3** (`wi_cena_squadra`, `wi_compagno_lite`, `wi_scommessa_amici`) |
| Pool idoneo, Primavera S1 / S2 | 54 / 48 | **25 / 26** |
| Pool idoneo, pro riserva / titolare / leader / veterano / svincolato / sosta | 54 / 70 / 69 / 74 / 60 / 64 | 44 / 65 / 64 / 70 / 42 / 55 |
| Seguiti nel catalogo | 0 | **25** (24 giudicati sulla regola, 1 saltato dal profilo per contesto) |
| Scelte con un seguito nel tempo | 3 su 221 (solo `flag:"investment"`) | 3 + 25 scelte d'origine con seguito |

**B. Flusso vero** (stesso guardiano): pop-up vero di `wi_ospedale`, clic su «Ci vado con i regali» → memoria
`{"c":0,"s":3,"w":6,"a":82}`; il seguito `wi_seg_ospedale_lettera` esce **dopo 4 settimane** (finestra 4-14).
Rosso: memoria `null`, seguito mai uscito in 12 settimane.

**C. Una stagione vissuta** (sonda `tests/visual/stagione-154.mjs`, `step()` per 38 settimane, risposta alternata
prima/seconda scelta, 1 carriera pro S3 + 1 Primavera S1):

| | Pro verde | Pro rosso | Primavera verde | Primavera rosso |
|---|---|---|---|---|
| Impulsi in stagione | 20 | 22 | 28 | 29 |
| Ripetizioni | 0 | 0 | 0 | 0 |
| Seguiti usciti | **5** (ospedale, lite_clan, mental, cena, cripto) | 0 | **2** (scommessa, accademia) | 0 |
| Dalle ex 40 «universali» | 10 (50%) | 12 (55%) | 12 (43%) | 17 (59%) |
| Scelte ricordate in `impMem` | 20 | 0 | 26 | 0 |

Una carriera per braccio: è un campione minimo, non una stima di frequenza.

## 2. PO-224 — cosa è cambiato

Il censimento (`docs/sviluppo/PO224-censimento-home.md`) e il codice dicono che fino alla 7.999.172 passavano per la
finestra `_pop224`: patto col mister (proposta e verdetto), spogliatoio, «La tua storia», scelte narrative, esonero,
procuratore (ingaggio, boutique/global), «Il mondo fuori», «Il conto delle parole». Restavano **riquadri in home con
un pulsante di scelta o di presa d'atto** quattro voci: «Il progetto del club», «Sponsor» (`stanceShift`),
«Vita privata» (`lifeView`), «Non mi era mai successo» (`onceView`). Ora passano anche loro da `_pop224`
(`_pop224B` in `src/18-career-app.jsx`). Letto prima di farlo: tutti e quattro hanno un pulsante che scrive il
proprio marcatore (`clubProjSeen`, `stanceSeen`, `life`, `onceSeen`) e quindi chiudono la finestra, che è non
chiudibile — nessuno dei quattro può restare bloccato aperto.

Rosso `__CPM_NO_POP224B` (tornano riquadri). Guardiano nuovo `popup-224b` (S12 riportato alla W14, prese d'atto
riaperte, 8 settimane con `step()`, risposta col primo pulsante della finestra):
verde **0** letture in home dei quattro titoli, 2 finestre (`La tua storia`, `Il progetto del club`);
rosso **16** letture in home.

**Confine con la zona G.** Il cambio è di sola presentazione: nessuna condizione, effetto o pulsante dei quattro
riquadri è stato toccato (la decisione del 10/10 sera concede la presentazione). PO-154, invece, è comportamento di
zona G ed è coperto dall'eccezione del 16/10 mattina.

**Non toccato** (resta in home, decisione da prendere — §5): le notizie («Ultime notizie», «Notizie della settimana»,
«Voci di mercato», «Classifica»), che sono informative e senza scelta.

## 3. Catene e guardiani

| Passo | Esito |
|---|---|
| `impulsi-memoria-154` (nuovo) | verde PASS · rosso `CPM_ROSSO=1` FAIL 4 guasti (atteso) |
| `popup-224b` (nuovo) | PASS (verde 0 in home, rosso 16) |
| `impulsi-contesto` (esistente) | PASS |
| `test:logic` | 43/43 |
| `tripath-chokepoint-test` | PASS |
| `stab-nat-trigger-test` | PASS |
| `career-sim-test` | PASS (2 stagioni, 0 pageerror) |
| `ci-runner.mjs mirata origin/lavoro/172` (nucleo + MAPPA di src/03 e src/18: 48 passi) | 47/48; il rosso `pro-rivale-176` è della sonda, corretto, poi 3/3 verde (§3.1) |

Registrati: `impulsi-memoria-154` e `popup-224b` in `package.json` e nella MAPPA di `ci-runner.mjs`
(src/03 → `impulsi-memoria-154`, `impulsi-contesto`; src/18 → `impulsi-memoria-154`, `popup-224b`; src/11·17 → `popup-224b`).

### 3.1 Catena mirata

`node ci-runner.mjs mirata origin/lavoro/172` sul commit `2787548`: **47/48 verdi** (nucleo `test:logic`, `save-compat`,
`design-system`, `typing-shortcuts`, `career-critical` 846 s compreso `career-invariants`; poi la MAPPA di src/03 e src/18,
fra cui `impulsi-memoria-154`, `impulsi-contesto`, `investimento-223`, `meta-conto-265`, `popup-224b`, `popup-224`,
`finestra-230`, `procuratore-253`, `intervista-231`, `home-066`, `squalifica-222`, `svincolato-264`, `testata-209`).

L'unico rosso, **`pro-rivale-176`**, è della sonda e non del gioco. Misurato: la sonda arriva alle offerte di fine
Primavera cliccando pulsanti per parola chiave e non sa rispondere a un impulso. Sulla base `lavoro/172` passava perché a
W39 il pescaggio (seme di prova) dava sempre `wi_procuratore`, il cui «⏳ Aspettiamo» è nella lista delle parole (verificato
2/2 sulla base, con traccia dei clic). Col pool nuovo esce `wi_riposo` («Mi alleno da solo»/«Mi riposo davvero»), la
finestra resta aperta e «Chiudi la stagione» non parte (traccia: 30 clic a vuoto). Correzione nella sonda
(`tests/visual/pro-rivale-176.mjs`): a settimana vissuta, sulla home, a W39, chiude la finestra della settimana
(`dismiss()`). Dopo: **verde 3/3** (col rosso `__CPM_NO_PRO176` che si vede). La catena mirata **non** è stata rifatta da
capo dopo la correzione della sonda: rifarla è compito della catena di rilascio.

Il registro `docs/governo/STABILITA.json` e le foto rigenerate da `toast-256` (`docs/sviluppo/foto-giro26/`) non sono
nel commit, per non creare conflitti con la sessione principale.

## 4. Non verificato

- **Collaudo 160 «una sola finestra su sei, il patto forzato non compare»**: non riprodotto. Il guardiano `popup-224`
  che forza il patto è nella catena; la causa del rilievo non è stata misurata. **Non posso confermarlo.**
- Frequenza su carriere lunghe: la stagione vissuta è una per braccio (§1 C). Effetto sul banco L6 (12,5 impulsi a
  stagione, 28% di ripetizioni) **non rimisurato**: servirebbe il banco L6-bis con le risposte alle scelte.
- Il pool della Primavera scende da 54 a 25: nella stagione vissuta le ripetizioni restano 0 (28 impulsi), ma su più
  stagioni di Primavera le ripetizioni possono salire. Non misurato.
- Un seguito che parla dello spogliatoio dopo un **cambio di club** nella finestra (es. `wi_seg_lite_pace`) non è
  filtrato: le finestre sono brevi (≤ 10 settimane per quelli di spogliatoio), il caso non è stato misurato.
- Resa visiva della finestra dei quattro riquadri: verificata solo dal DOM (presenza/assenza), nessuna foto a 360-412 px.
- `impMem` non ha tetto: cresce al massimo di una chiave per voce del catalogo (130), nessuna misura del peso.

## 5. Decisioni per la sessione principale

**D1 — Pool della Primavera dimezzato dal contesto (54 → 25).**
1. Tenerlo così: è il contesto chiesto dal PO (niente podcast a un diciassettenne), con 0 ripetizioni misurate in una stagione. **(consigliata)**
2. Allargare per la Primavera 5-6 voci (ospedale, donazione, tifoso fisso, podcast) con soglie più basse.
3. Rimisurare prima col banco L6-bis su 3 stagioni di Primavera.

**D2 — Notizie della home (PO-224 punto 3 del censimento).**
1. Restano in home: sono informative, una finestra per ciascuna moltiplicherebbe le interruzioni. **(consigliata)**
2. Una sola finestra «Novità della settimana» dentro «Vivi la Settimana».

**D3 — Seguiti e cambio di club.**
1. Lasciare com'è (finestre brevi). **(consigliata per ora)**
2. Aggiungere alla memoria l'id del club e spegnere i seguiti di spogliatoio dopo un trasferimento.
