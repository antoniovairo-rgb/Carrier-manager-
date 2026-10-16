# Rapporto collaudo carriere L6 — fase 1-bis (banco corretto, giro 49)

**Data:** 16/10/2026 · **Ramo:** `collaudo/carriere-l6-bis-giro49` (base `analisi/proposta-l6-giro38`)
**Decisione che lo richiede:** PO 16/10, «Banco corretto, poi Nazionale» (`docs/governo/DECISIONI.md` sul ramo `poc/marioprada-character-system`, voce «Questionario sulla proposta L6»), attuazione di `docs/governo/PROPOSTA-L6.md` §7 passo 0.
**Gioco misurato:** `GAME_VERSION` **7.999.170**, preso da `origin/lavoro/170` al commit **`20dfe60baf9b871dba71a901a0be2e92d33c27bc`**
(`git show origin/lavoro/170:CARRIER-MANAGER-AV.html > CM170.html`, file non versionato; **sha256 `e0265f27f157905a4fc8c18a4967f60c7a97f367dc4bb35017711f2abc6d4950`**). La versione è letta a runtime (`GAME_VERSION`) in ogni JSON.
**Browser:** Chromium 1194 via `CPM_CHROME=/opt/pw-browsers/chromium`, headless.
**Modalità:** sola misura. Nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`.
**Dati grezzi:** `docs/collaudi/dati-carriere-l6-bis/` — `syn-NN.json` (30), `u18-NN.json` (10), `naz-NN.json` (5), `gem-NN-<voce>.json` (22), `ufficio-puro.json`, `riepilogo-bis.json` (aggregato), `stagioni-bis.json` (una riga per stagione). Prove di messa a punto in `prove/` (non usate nei numeri).
**Script:** `tests/visual/collaudo-l6/career-bis.mjs` (banco), `riepilogo-bis.mjs` (aggregazione), `ufficio-puro.mjs` (sonda deterministica dell'Ufficio).

Ogni numero porta la fonte: `R.<gruppo>.<campo>` = campo di `riepilogo-bis.json`; «F1» = rapporto di fase 1 (`RAPPORTO-carriere-l6.md`) o i suoi JSON ricalcolati (`R.fase1`); `src/…:riga` = sorgente di `origin/lavoro/170`. «Non posso confermarlo» dove il dato manca.

---

## 0. Come leggere

- **Verificato**: numero dai dati grezzi o riga di sorgente, riproducibile.
- **Ipotesi / da verificare**: interpretazione non ancora provata. Marcata così.
- **Non posso confermarlo**: i dati raccolti non permettono l'affermazione.

---

## 1. Il banco: cosa è cambiato rispetto alla fase 1

| # | Richiesta (§7 passo 0) | Fase 1 (`career-run.mjs`) | Fase 1-bis (`career-bis.mjs`) |
|---|---|---|---|
| 1 | Rinnovo accettato quando offerto | `C.dismiss()` a ogni passo; nessun rinnovo | Pulsante vero **«Negozia rinnovo»** (tab Agente, guardia del gioco `src/18-career-app.jsx:10924`: ultimo anno, entro W35, non svincolato/in prestito, non già rinnovato; da svincolato la card Home `:8289`) → **«Accetta l'offerta del club»**. Se il club rifiuta («Il club non intende rinnovare», `:5519`) si registra e si riprova ogni 4 settimane. Offerte di trasferimento: lette dal modale `offerta23` e risolte coi bottoni veri (**Accetta** solo da svincolato o dopo un rifiuto di rinnovo nella stagione, altrimenti **Rifiuta** col suo handler `declineTransferOffer`) |
| 2 | Solo gli 8 archetipi, stat della creazione, fattori indipendenti | 12 «archetipi» (4 inesistenti), stat tutte = OVR, archetipo/ruolo/livello dallo stesso indice | Solo `ARCHETYPES` (8). Stat = `baseStats(arc)` del gioco (Math.random seedato per carriera), poi traslate di un intero finché `calcOvr` = OVR del livello (60/68/76). Archetipo, ruolo e livello da **tre permutazioni indipendenti** (semi 4901/4902/4903) |
| 3 | 10 carriere dalla creazione normale | nessuna | «Nuova carriera» → nome, nazione, archetipo → **provini giocati in autoplay** → offerta Primavera → carriera U18 → passaggio pro («Accetta →») |
| 4 | 5 carriere con la Nazionale giocata | Nazionale sempre simulata (`__CPM_SIM_NAT=1`) | Le **amichevoli** si giocano: `playMatch()` → schermata `nationalCallup` → «Gioca la partita» → partita live in autoplay a 2x. Tornei (Coppa delle Nazioni, Europeo/Mondiale) ancora simulati |
| 5 | Gemelli economici dell'Ufficio | nessuno | 11 bracci × 2 carriere base × 4 stagioni, voce attivata coi **bottoni veri** del tab Ufficio (`data-cpm` staff24/invest24/bene24/accademia24), saldo iniziale 2 000 000 € in tutti i bracci; **più** una sonda deterministica sulle funzioni pure del gioco (§9) |
| 6 | Minuti e titolarità; presenze da svincolato | non misurati | Per ogni gara di campionato: `calcCoachDecision` (`src/08-panchina-derby-meteo-cori.jsx:187`, la stessa del prompt partita) → titolare/panchina/non convocato e minuti teorici. Testimone della convocazione del gioco `window.__CPM_CALLUP` acceso, presenze incrociate con lo stato «svincolato» della settimana |

**Scelte del banco da tenere presenti (dichiarate):**
- **Math.random della pagina sostituito da un generatore seedato** per carriera (serve ai gemelli). È una scelta del banco, non del gioco.
- **Pop-up della settimana (impulsi) ancora chiusi con `dismiss()`**, come in fase 1, per confrontabilità: le conseguenze delle scelte d'impulso **non** sono misurate.
- **In creazione la posizione è sempre «Attaccante»** (`CreateScreen`, `newPlayerBase.position`): le 10 U18 non variano il ruolo.
- Le carriere sintetiche partono con contratto `{duration:3, wage:6000, expiresAtSeason:5}` come in fase 1.

---

## 2. Campione

| Gruppo | Carriere | Stagioni | Fine `ok` | `pageerror` | Fonte |
|---|---|---|---|---|---|
| Sintetiche (pro) | 30 | 300 | 30/30 | 0 | `R.syn.fine`, `R.syn.pageerrors` |
| Creazione normale (U18 → pro) | 10 | 100 | 10/10 | 0 | `R.u18` |
| Nazionale giocata | 5 | 50 | 5/5 | 0 | `R.naz` |
| Gemelli Ufficio | 22 | 88 | 22/22 | 0 | `gem-*.json` |
| **Totale** | **67** | **538** | | **0** | |

Fase 1: 30 carriere, 300 stagioni, 0 errori (F1 §1).

**Indipendenza dei fattori (verificato, ma imperfetta).** Con 30 posti e tre permutazioni casuali i fattori non sono più aliasati, ma le celle sono piccole e sbilanciate: `velocista` è «forte» in 3 carriere su 4, `centravanti` non è mai «forte», il ruolo `Portiere` è «forte» in 5 carriere su 7 (tabella incrociata dai `cfg` dei `syn-*.json`). Ogni confronto per archetipo va quindi letto **dentro** il livello (§5.3).

---

## 3. Contratto e rinnovo (numeri per l'eccezione «rinnovo»)

| Misura | Fase 1 | Fase 1-bis sintetiche | 1-bis U18 | 1-bis Naz. | Fonte 1-bis |
|---|---|---|---|---|---|
| Stagioni con durata 0 / svincolato | **210 / 300** (S4→S10 di tutte) | **4 / 300** a fine stagione | 5 / 100 | 0 / 50 | `R.*.contratto.stagioniScaduteAFine`; F1: `R.fase1.durataZero` |
| Settimane da svincolato | ≈ 210 stagioni intere | **430** (su ≈ 11 700) | 416 | 0 | `R.*.contratto.settimaneDaSvincolato` |
| Partite da svincolato (eroe non schierato) | 970-990 per coorte S4+ (PROPOSTA §0.1) | **136 / 11 470** | 170 / 3 563 | 0 / 2 161 | `R.*.contratto.partiteDaSvincolato` |
| Carriere con almeno un rinnovo accettato | 0 / 30 | **29 / 30** | **10 / 10** | 5 / 5 | `R.*.rinnovi.carriereConAccettato` |
| **Carriere in cui il rinnovo non arriva mai** | — | **1 / 30** (`syn-00`: 33 tentativi, 33 rifiuti, fiducia scesa fino a 12) | **0 / 10** | 0 / 5 | `R.*.rinnovi.carriereSenzaOffertaDettaglio` |
| Pulsante di rinnovo assente quando il gioco dovrebbe offrirlo | — | **0** su 314 tentativi | 0 / 140 | 0 / 37 | `R.*.rinnovi.ctaAssente` |
| Tentativi · accettati · rifiutati dal club | — | 314 · 138 · 176 | 140 · 56 · 84 | 37 · 28 · 9 | `R.*.rinnovi` |
| Carriere con almeno un rifiuto del club | — | 14 / 30 (35 stagioni) | — | — | ricalcolo dai `syn-*.json` |
| Fiducia del mister media: rifiuto / accettazione | — | **30,6 / 83,4** | 34,0 / 71,4 | 42,1 / 93,9 | `R.*.rinnovi.trustRifiuti/trustAccettati` |
| Durata accettata (1 · 2 · 3 anni) | — | 36 · 37 · 65 | 17 · 22 · 17 | 7 · 7 · 14 | `R.*.rinnovi.durataAccettata` |

**Verificato — il rinnovo funziona nel gioco.** Il rinnovo è offerto (pulsante presente) in tutte le 491 prove in cui la guardia del gioco lo prevede; il «saldo fermo» e lo «0 gol da S4» della fase 1 erano figli del banco, come anticipato da PROPOSTA §0.1.

**Difetto verificato — il rinnovo di un anno firmato nell'ultimo anno non aggiunge stagioni.**
- **Dati:** 29 rinnovi su 29 (sintetiche) di durata 1, firmati con 1 anno residuo, sono seguiti da una stagione da svincolato (`R.syn.rinnovi.unAnnoInutile` = 29; incrocio con i rinnovi «da svincolato» o le settimane `exp` della stagione dopo, ricalcolo dai `syn-*.json`). U18: 15, Nazionale: 6.
- **Sorgente:** la durata proposta è `1+(hash%3)` (`src/18-career-app.jsx:5527`); `_acceptNegoWage` scrive `duration` = durata proposta (`:5541`); al cambio stagione la durata scala di uno e `contractExpired = duration<=0` (`:5041`). Un contratto «1 anno» firmato nell'ultimo anno vale quindi **zero** stagioni in più: il giocatore paga la trattativa e si ritrova svincolato.
- È in zona G (contratti). Nessuna proposta di correzione qui.

**Il rifiuto del club è comportamento voluto** (`:5519`, fiducia < 40, o riserva con fiducia < 52). Da notare per il PO: in 5 carriere la fiducia del mister è scesa sotto 15 (minimi 12, 5, 4, 5, 14: `syn-00/01/12/22/24`), e lì il rinnovo è rifiutato per intere stagioni. **Non posso confermare** perché la fiducia crolli in quelle carriere (non ho misurato la catena fiducia ← voti/impulsi chiusi senza scelta).

---

## 4. Economia: saldo

| Misura | Fase 1 | Fase 1-bis sintetiche | 1-bis U18 | 1-bis Naz. | Fonte |
|---|---|---|---|---|---|
| Stagioni con variazione del saldo = 0 | **210 / 270** | **4 / 300** | 5 / 90 (stagioni pro) | 0 / 50 | `R.*.saldo.stagioniVariazioneZero`; F1 §6 |
| Variazione media per stagione | +210 600 nelle prime 3, poi 0 | **+549 688 €** | +577 079 € | +282 151 € | `R.*.saldo.variazioneMedia` |
| Saldo finale medio / massimo | 626 400 € (max) | **5 496 879 € / 18 440 268 €** | 5 193 710 € / 13 874 824 € | 2 821 508 € / 2 919 084 € | `R.*.saldo` |

Le carriere Nazionale guadagnano meno perché nessuna ha cambiato club (0 offerte accettate, §6); il saldo sale con gli stipendi dei club nuovi. **Verificato:** il saldo fermo della fase 1 era lo svincolo da banco; con i rinnovi, il saldo si ferma solo nelle 4 stagioni da svincolato.

---

## 5. Gol e difficoltà per fascia d'età, livello, archetipo, ruolo

### 5.1 Per fascia d'età (sintetiche)

| Fascia | Stagioni | OVR | Gol eroe F1 | **Gol eroe 1-bis** | Gol per gara giocata F1 | **1-bis** | Fonte |
|---|---|---|---|---|---|---|---|
| Gavetta 17-20 | 40 | 71,2 | 8,25 | **8,90** | 0,255 | **0,254** | `R.syn.perFascia`, `R.fase1.perFascia` |
| Affermazione 21-25 | 131 | 76,1 | 3,69 | **11,44** | 0,222 | **0,315** | idem |
| Élite 26-30 | 110 | 80,9 | 0,24 | **13,81** | 0,045 | **0,353** | idem |
| Declino 31+ | 19 | 80,2 | 0 | **13,00** | 0 | **0,335** | idem |

Per indice di stagione: gol 8,4 (S1) → 12,3 (S4) → 16,1 (S10); OVR 70,0 → 82,7 (`R.syn.perIndice`). U18 (creazione): gol 6,6 (S1) → 9,7 (S10), OVR 65,7 → 81,0 (`R.u18.perIndice`); nessuna U18 supera i 26 anni in 10 stagioni (partono a 17).

**Verificato:** il crollo dei gol con l'età della fase 1 (8,25 → 0,24) era il contratto scaduto. Con i rinnovi i gol **crescono** con l'età e l'OVR. Il declino 31+ ha 19 stagioni: campione piccolo, **non posso confermare** una curva di declino.

### 5.2 Per livello di partenza (sintetiche, 100 stagioni ciascuno)

| Livello | OVR medio F1 | **1-bis** | Gol/stagione F1 | **1-bis** | Gol per gara giocata 1-bis | Fonte |
|---|---|---|---|---|---|---|
| Debole (p 48, OVR 60) | 75 | **71,4** | 1,98 | **7,63** | 0,221 | `R.syn.perLivello`; F1 §4 |
| Media (p 60, OVR 68) | 81 | **76,7** | 1,86 | **9,32** | 0,270 | idem |
| Forte (p 95, OVR 76) | 87 | **84,3** | 4,56 | **19,25** | 0,447 | idem |

### 5.3 Per archetipo, dentro il livello (gol per gara giocata; tra parentesi le carriere)

| Livello | Valori | Fonte |
|---|---|---|
| Debole | bomber 0,28 (1) · enfant 0,25 (2) · centravanti 0,25 (2) · tuttocampista 0,21 (1) · fantasista 0,20 (1) · trequartista 0,20 (1) · velocista 0,17 (1) · leader 0,16 (1) | `stagioni-bis.json` |
| Media | bomber 0,32 (1) · tuttocampista 0,31 (2) · fantasista 0,29 (1) · centravanti 0,29 (2) · trequartista 0,25 (2) · leader 0,19 (2) | idem |
| Forte | bomber 0,51 (2) · trequartista 0,49 (1) · velocista 0,44 (3) · fantasista 0,42 (2) · enfant 0,41 (1) · leader 0,40 (1) | idem |

**Impressione (da verificare):** `leader` è ultimo in tutti e tre i livelli e `bomber` primo in tutti e tre; è coerente con `_pSimStats(sim,ovr,archId,rng)` che legge l'archetipo (`src/10-folla-stadi-ritiro.jsx:900`). Con 1-3 carriere per cella **non è una misura**: serve un disegno con almeno 3 carriere per archetipo e per livello (72 carriere) per dirlo.

### 5.4 Per posizione (sintetiche)

| Posizione | Gol per gara giocata | Livello forte | Fonte |
|---|---|---|---|
| Attaccante | 0,328 | 0,449 | `R.syn.perPosizione`; incrocio dai `syn-*.json` |
| Centrocampista | 0,261 | 0,362 | idem |
| Difensore | 0,273 | 0,401 | idem |
| **Portiere** | **0,424** | **0,473** | idem |

**Verificato:** nelle partite simulate la posizione **non pesa**: un portiere del livello forte segna 0,47 gol a partita giocata, più di un attaccante dello stesso livello (0,45). La firma `_pSimStats(sim,ovr,archId,rng)` (`src/10-folla-stadi-ritiro.jsx:900`) non riceve la posizione. Lo stesso valeva in fase 1, ma lì era nascosto dal confondente. È rilevante per PO-156 (difficoltà) e PO-098 (stili).

### 5.5 Quota gol dell'eroe

| Misura | Fase 1 | Sintetiche 1-bis | U18 | Naz. | Fonte |
|---|---|---|---|---|---|
| Gol eroe per partita | 0,076 | **0,316** | 0,252 | 0,441 | `R.*.partita`; `R.fase1` |
| Quota gol eroe / gol squadra | 7,7% | **28,5%** | 26,6% | 29,2% | idem |

Tiri e xG restano **non misurabili** sul percorso simulato (F1 §5.3).

---

## 6. Offerte di trasferimento

| Misura | Fase 1 | Sintetiche 1-bis | U18 | Naz. | Fonte |
|---|---|---|---|---|---|
| Offerte arrivate (modale `offerta23`) | 0 registrate (chiuse da `dismiss`) | **179** | 76 | 14 | `R.*.offerte.totali` |
| Carriere con almeno un'offerta | 0 | **29 / 30** | 10 / 10 | 4 / 5 | `R.*.offerte.carriereConOfferta` |
| Offerte per carriera | 0 | 5,97 | 7,6 | 2,8 | `R.*.offerte.perCarriera` |
| Accettate (solo da svincolato o dopo rifiuto del rinnovo) | — | 21 (tutte con cambio club) | 7 | 0 | `R.*.offerte.accettate` |
| Cambi di club fra due stagioni | 0 | **23** | 17 | 0 | `R.*.offerte.cambiClubStagionali` |

Offerte per indice di stagione (sintetiche): 11, 15, 16, 19, 22, 20, 17, 17, 21, 21 (`R.syn.offerte.perStagione`). **Non misurato:** le offerte annunciate come «radio mercato» (`transferSaga`) che si aprono solo dal bottone «Ascolta l'offerta» della Home non sono state aperte dal banco. Le offerte usano `Math.random` (`src/18-career-app.jsx:1216`, `:4574`): qui seedato dal banco.

---

## 7. Minuti e titolarità

Il percorso simulato **non ha minuti**: in `simulateAndAdvance` l'eroe è sempre in campo salvo svincolo o infortunio (nessun campo `minutesPlayed` nelle voci simulate; F1 §4). Ho quindi registrato, per ogni gara di campionato, la decisione che il gioco **mostrerebbe** al giocatore (`calcCoachDecision`, `src/08-panchina-derby-meteo-cori.jsx:187`). Minuti teorici: titolare 90, panchina 90 − minuto d'ingresso, non convocato 0.

| Misura | Sintetiche | U18 | Naz. | Fonte |
|---|---|---|---|---|
| Gare valutate (con contratto, non infortunato) | 9 892 | 3 210 | 1 691 | `R.*.titolarita.conContratto` |
| Titolare | **91,1%** | 93,0% | 90,9% | `R.*.titolarita.titolare` |
| Panchina | 8,9% | 7,0% | 9,1% | idem |
| Non convocato | **0%** | 0% | 0% | idem |
| Minuti teorici medi | **84,2** | 85,3 | 84,2 | `R.*.titolarita.minutiTeoriciMedi` |
| Titolare per stagione (min–max) | 85,8% (S3) – 94,7% (S7) | 81,9% (S10) – 100% (S1) | 58,2% (S1) – 100% (S5-S10) | `R.*.titolarita.perStagione` |

**Verificato:** l'eroe è titolare in 9 gare su 10 anche col ruolo «riserva» (91,5% su 5 772 gare, `R.syn.titolarita.perRuoloSquadra`), e non è mai «non convocato» in 14 793 gare. **Verificato** che le partite simulate ignorano questa decisione (l'eroe gioca sempre). Per PO-156: la gerarchia di squadra pesa pochissimo sulla titolarità, e nulla sul percorso simulato.

**Anomalia (da verificare):** 18 stagioni di carriere pro chiudono con `squadRole = "primavera"` (`R.syn.perRuoloSquadra`), che `calcSquadRole` restituisce solo a `proStatus==="u18"` (`src/08-panchina-derby-meteo-cori.jsx:169`). **Non posso confermare** la causa (ipotesi: ruolo non ricalcolato dopo uno svincolo o un trasferimento).

---

## 8. Nazionale (numeri per l'eccezione «Nazionale da svincolato»)

| Misura | Fase 1 | Sintetiche 1-bis | U18 | Naz. (giocata) | Fonte |
|---|---|---|---|---|---|
| Carriere con almeno una presenza | 20 / 30 | **14 / 30** | **0 / 10** | 4 / 5 | `R.*.nazionale.carriereConPresenza`; `R.fase1` |
| Presenze totali | — (135 da svincolato, PROPOSTA §0.2) | 54 | 0 | 14 | `R.*.nazionale.presenzeTot` |
| Presenze massime in una carriera | 20 | 12 | 0 | 6 | `R.*.nazionale.presenzeMax` |
| **Presenze guadagnate da svincolato** | **135** (65 stagioni su 73) | **0** su 68 voci `natHistory` | 0 | 0 | incrocio `natHistory.week` × settimane `exp` (ricalcolo) |
| Prima presenza: età / OVR | 18-32 / 77-88 | 21-31 / 79-90 (14 casi) | — | 21-31 / 80-87 | `R.*.nazionale.primaPresenza` |
| Schermate di convocazione | 0 / 300 stagioni | (simulata) | (simulata) | **8 su 8 amichevoli giocate** | `R.naz.nazionaleGiocata` |
| di cui «prima convocazione» | — | — | — | 4 | idem |
| Presenza contata dopo la gara live | — | — | — | 8 / 8 | idem |

**Verificato — la schermata di convocazione esiste e funziona** quando la gara si gioca: 8 amichevoli, 8 schermate `nationalCallup`, 8 partite live arrivate in campo, 8 presenze contate (durata media 138,5 s a 2x, `R.naz.nazionaleGiocata.msMedi`). Lo «0 schermate» della fase 1 era il banco (PROPOSTA §0.2).

**Verificato — il cancello della convocazione gira solo nelle settimane senza partita di club.** Nel sorgente `_tryNatCallup` ha **una sola** chiamata, dentro `doAdvanceWeek` (`src/18-career-app.jsx:4862`, definizione `:4183`); `simulateAndAdvance` (`:3143`) non la chiama. Il commento a `:4862` dice «chiamata da OGNI percorso», ma il codice non lo fa. Misura col testimone `__CPM_CALLUP`: **2,02 valutazioni per stagione pro** (606 in 300 stagioni), tutte nelle settimane **28 (220), 35 (219), 19 (137), 9 (30)** (`R.syn.nazionale.settimaneValutate`); tutte le 8 amichevoli giocate cadono in settimana 35. Il tetto «fino a otto finestre» del 7.783 è quindi irraggiungibile nel percorso misurato. **Non posso confermare** che valga identico quando la partita di club si gioca dal vivo (non ho seguito quel percorso fino all'avanzamento della settimana).

**Per l'eccezione «niente Nazionale da svincolato» (PO-155 A):**
- Il difetto di codice resta verificato: il cancello non guarda il contratto (`src/18-career-app.jsx:4194`: `!isInU18&&!_callupBusyWk&&!player.injured`).
- La sua **frequenza** però era gonfiata dal banco: con i rinnovi, in **846 settimane da svincolato** (430 sintetiche + 416 U18) le presenze da svincolato sono **0**. Con ~2 valutazioni a stagione e lo svincolo raro, il caso esiste ma è poco probabile in una carriera normale.
- U18: **0 presenze in 10 carriere** (OVR finale fino a 81, `R.u18.perIndice`), con 22 valutazioni passate al cancello (`R.u18.nazionale.valutazioniPassate`) e nessun tiro di dado vinto. **Non posso confermare** se sia sfortuna o taratura (campione piccolo).
- Gemelli giocata/simulata (stessa carriera): presenze 2/1, 5/1, 6/12, 1/6, 0/0 (`R.nazVsSyn`). Le carriere divergono (rumore, §9.3): non è un confronto pulito.

**Non posso confermarlo:** se la gara live della Nazionale venga registrata in `matchHistory`: l'ultima voce dopo la partita porta `simulated:true` e nessun contesto (`R.naz.nazionaleGiocata.dettaglio`), mentre `natHistory` la registra con `sim:false`.

---

## 9. Ufficio (numeri per l'eccezione «Ufficio»)

### 9.1 Effetto per voce, misurato sulle funzioni vere del gioco (deterministico)

Fonte: `ufficio-puro.json` (stesso salvataggio, stessi semi nei bracci con e senza la voce; funzioni esposte dall'harness `__CPM_CAREER`).

| Voce | Effetto dichiarato dal gioco | **Effetto misurato** | Costo misurato (stipendio 6 000 €/sett.) |
|---|---|---|---|
| Personal trainer L1/L2/L3 | +10/15/20% allenamento | punti statistica per settimana di auto-allenamento: **0,759 → 0,837 / 0,878 / 0,915** (fatica 20), cioè **+10% / +16% / +21%**; a fatica 40: 0,518 → 0,620 (+20%) | L3: **1 960 €/sett.** (saldo settimanale +5 400 → +3 440) |
| Nutrizionista L3 | recupero fatica +4/sett. | **non misurabile con le funzioni esposte**: il recupero vive **solo dentro `doAdvanceWeek`** (`src/18-career-app.jsx:4703`), cioè solo nelle settimane senza partita di club (~2-4 a stagione nel percorso misurato, §8) | L3: 1 400 €/sett. |
| Fisioterapista L1/L2/L3 | infortuni −8/16/24% | tasso d'infortunio per gara simulata a fatica 70: **6,82% → 6,27 / 5,74 / 5,17%** (−8,1/−15,9/−24,2%); a fatica ≤45: **0%** con o senza (40 000 semi per braccio) | L3: 1 400 €/sett. |
| Mental coach L1/L3 | morale +0,5/+1,5 a sett. | una settimana da 60: **60 → 61 / 62**; equilibrio dopo 60 settimane senza eventi: **60 → 81** (L3) | L3: 1 120 €/sett. |
| Casa + barca | morale +0,5 ciascuno | equilibrio dopo 60 settimane: **60 → 71** | una tantum 950 000 € |
| Auto · Fondazione | pop +3, fiducia −2 · pop +6, fiducia +2, eredità +10 | una tantum (tabella `BENI24`); fondazione conta nell'eredità | 150 000 € · 300 000 € |
| Tutti e 4 lo staff L3 | — | — | saldo settimanale **−480 €** (in perdita con 6 000 €/sett.) |
| Accademia | +2/+4 popolarità a stagione, ragazzi nell'eredità | (gemelli, §9.2: 3 ragazzi in 4 stagioni, eredità +9) | fondazione 150 000 €, poi 400 €/sett. |
| Investimenti (30 nomi × 10 stagioni) | prudente +2..+5% · bilanciato −4..+10% · rischioso −20..+30% | resa media **+3,52% / +3,02% / +3,54%**; stagioni negative 0 / 81 / 133 su 300 | 25% del saldo bloccato per una stagione |

Da svincolato `weeklyEconomyFields` non accredita nulla (`src/18-career-app.jsx:1550`; misurato: «nessun accredito»).

### 9.2 Gemelli di carriera (4 stagioni, 2 carriere base, saldo iniziale 2 M€)

Fonte: `R.gemelli.righe` / `R.gemelli.delta` e `gem-*.json`.

| Voce | Effetto visibile coerente in entrambe le basi | Fonte |
|---|---|---|
| Investimento prudente | patrimonio netto (saldo + capitale investito) **+57 284 € / +61 134 €** sul gemello nella stessa traiettoria | `gem-0{1,6}-invest-prudente.json` (`legacy.pat.netto`), `investHist24` |
| Investimento rischioso | **−49 367 € / +3 564 €** (rese stagionali −52 703/−5 199/+8 535 e −100 000/+22 747/+80 817) | idem |
| Mental coach L3 | morale medio settimanale **+2,0 / +1,9** sul gemello nella stessa traiettoria | `moraleMedia` |
| Personal trainer L3 | somma statistiche finale **+7** sul gemello nella stessa traiettoria (base 6); base 1 +15 ma su una traiettoria diversa (solo indicativo) | `statsFine` |
| Beni (tutti e 4) | saldo **−2,0 M€ / −1,4 M€** (il costo, 1,4 M€); eredità +56 / +9 rispetto a «nessuna» (traiettorie diverse: solo indicativo) | `saldoFine`, `legacy` |
| Accademia | **3 ragazzi** in 4 stagioni in entrambe; eredità ragazzi +9 | `academy24.tot` |
| Fisioterapista L3 | **nessuna differenza** in 4 stagioni (settimane d'infortunio identiche al gemello: 18 e 18) | `settimaneInfortunio` |
| Nutrizionista L3 | fatica media **+0,6 / +1,4** (più alta, non più bassa); **non posso confermare** la causa | `fatigueMedia` |

### 9.3 Il rumore dei gemelli (da leggere prima della §9.2)

I due bracci **identici** «nessuna» e «nessuna2» divergono: OVR 76/75, somma statistiche 579/574, settimane d'infortunio **2/18**, popolarità 82/71, fiducia 33/22, saldo 3,93/3,13 M€ (base 1); popolarità 63/81 e fiducia 63/73 (base 6) (`R.gemelli.righe`). Anche con Math.random seedato, la carriera intera si biforca (tempi di React e `setTimeout`) e cade su due o tre traiettorie. Per questo la §9.2 confronta ogni braccio col gemello che segue la **stessa traiettoria** (stesse settimane d'infortunio e stessa popolarità prima della voce), e i numeri «puliti» sono quelli della §9.1. **Non posso confermare** con le carriere intere gli effetti sotto queste soglie (≈ ±1 OVR, ±6 statistiche, ±16 settimane d'infortunio, ±18 popolarità, ±0,8 M€ di saldo in 4 stagioni).

**Lettura per il PO (Ufficio):** trainer, fisioterapista, mental coach, investimenti, beni e accademia **fanno ciò che dichiarano** nelle funzioni del gioco (§9.1). Due punti verificati da decidere:
1. il **nutrizionista** agisce solo nelle settimane senza partita (`:4703` in `doAdvanceWeek`), quindi quasi mai nel percorso misurato — e nei gemelli la fatica non scende;
2. il **fisioterapista** non ha effetto a fatica ≤ 45 e vale −24% relativo sopra: con le fatiche medie misurate (37-39, `fatigueMedia`) incide poco in una carriera reale.

---

## 10. Impulsi senza condizione (PO-154)

| Misura | Fase 1 | Sintetiche 1-bis | U18 | Naz. | Fonte |
|---|---|---|---|---|---|
| Voci del catalogo / senza condizione | 106 / 40 | 106 / 40 | 106 / 40 | 106 / 40 | `R.*.impulsi.catalogo/senzaCondizioneCatalogo` |
| Eventi osservati | 3 760 (12,5 a stagione) | **6 835 (22,8 a stagione)** | 2 396 (24,0) | 1 171 (23,4) | `R.*.impulsi.eventi/perStagione` |
| **Quota di eventi senza condizione** | **≈ 47%** (1 763) | **47,5%** (3 246) | 47,0% | 47,2% | `R.*.impulsi.quotaSenzaCondizione` |
| Impulsi unici per carriera | 90,3 | 92,0 | 92,8 | 92,2 | `R.*.impulsi.unicPerCarriera` |
| Ripetizioni (stesso id nella stessa carriera) | 1 052 (28%) | 4 076 (60%) | 1 468 | 710 | `R.*.impulsi.ripetizioni` |

**Verificato:** la quota di impulsi senza condizione è **stabile al 47%** con il banco corretto; il numero di PO-154 regge.
**Da verificare:** gli eventi raddoppiano anche nelle stagioni 1-3, dove il contratto era valido in entrambe le fasi (F1: 372-385 per stagione-coorte; 1-bis: 656-677; ricalcolo dagli `impEvents`). **Ipotesi:** il campionamento (il banco 1-bis legge lo stato 60 ms dopo il passo, la fase 1 nello stesso istante) coglie impulsi che la fase 1 perdeva; il conteggio resta un **limite inferiore** in entrambe. **Non posso confermare** che il ritmo degli impulsi sia cambiato fra 7.999.169 e 7.999.170. Le ripetizioni crescono perché il catalogo (106) si esaurisce: con ~23 eventi a stagione, dopo 4-5 stagioni ogni evento nuovo è una ripetizione.
Le conseguenze delle scelte d'impulso **non sono misurate** (pop-up chiusi senza scelta, §1).

---

## 11. Creazione normale (U18)

| Misura | Valore | Fonte |
|---|---|---|
| Carriere create e completate | 10 / 10, 0 errori | `R.u18.fine` |
| Provini giocati | **3** in tutte | `R.u18.creazione[].provini` |
| Durata creazione + provini (headless, 2x) | 352-416 s | `R.u18.creazione[].ms` |
| OVR iniziale | 63-64 | `R.u18.creazione[].ovr` |
| Club di partenza | Primavera, prestigio 23-37 | `R.u18.creazione[].club/clubP` |
| Stagioni da U18 | **1** in tutte (passaggio pro a fine S1, «Accetta →») | `R.u18.creazione[].pro` |
| OVR a S10 (età 26) | 81,0 medio | `R.u18.perIndice` |
| Gol per gara giocata S1 → S10 | 0,196 → 0,336 | `R.u18.perIndice` |

Rinnovi, saldo e offerte delle U18 seguono le sintetiche (§3, §4, §6). **Non posso confermare** se un solo anno da U18 sia voluto: il riepilogo di fine stagione dice «Questa è la tua ultima stagione U18 disponibile» già alla prima (`proTrans[].txt`).

---

## 12. Numeri per le eccezioni che il PO deve concedere

| Eccezione | Numero chiave | Fonte |
|---|---|---|
| **Rinnovo** | Il rinnovo arriva: 0 pulsanti mancanti su 491 prove; manca in 1 carriera su 45 (fiducia crollata a 12). **Difetto verificato:** 50 rinnovi di 1 anno firmati nell'ultimo anno (29+15+6) lasciano svincolato la stagione dopo, 29 su 29 nelle sintetiche. Il club rifiuta in 14 carriere su 30, a fiducia media 30,6 | §3 |
| **Nazionale da svincolato** | Difetto di codice confermato (`:4194` non guarda il contratto), ma **0 presenze da svincolato** su 846 settimane da svincolato con il banco corretto (fase 1: 135, artefatto del banco). In più: il cancello gira solo ~2 volte a stagione (`:4862` solo in `doAdvanceWeek`), il che pesa sulla Nazionale **più** dello svincolo | §8 |
| **Impulsi** | 47% degli eventi senza condizione, stabile fra fase 1 e 1-bis; catalogo esaurito dopo 4-5 stagioni (60% di ripetizioni su 10 stagioni) | §10 |
| **Ufficio** | Trainer +21%, fisio −24% sopra fatica 45, mental +1,5/sett., investimenti +3,0..+3,5% medi: funzionano. Nutrizionista solo nelle settimane senza partita; 4 staff L3 = −480 €/sett. con stipendio 6 000 | §9 |

---

## 13. Cosa non posso confermare (limiti)

- **Partite di club live**: non giocate (solo amichevoli della Nazionale). Tiri, xG e PO-190 restano fuori.
- **Conseguenze delle scelte d'impulso** e degli eventi settimanali: pop-up chiusi senza scelta.
- **Offerte «radio mercato»** (`transferSaga`): non aperte.
- **Tornei della Nazionale** (Coppa delle Nazioni, Europeo/Mondiale): ancora simulati anche nelle 5 carriere «giocate».
- **Archetipo**: celle da 1-3 carriere; non separabile in modo affidabile dal livello (§5.3).
- **Ruolo in creazione**: sempre «Attaccante».
- **Gemelli di carriera**: rumore superiore a molti effetti (§9.3); gli effetti affidabili sono quelli della sonda deterministica.
- **Percorso del cancello di convocazione con partita live**: non seguito.
- **Ritiro / voce «addio»**: nessuna carriera ha raggiunto i 34 anni (età massima 33 sintetiche, 26 U18).

---

## 14. Chiusura

**Passo 0 della PROPOSTA L6 (banco corretto): ESEGUITO.** I sei punti del §7 passo 0 sono nel banco e misurati.

Cosa cambia per le decisioni:
- I tre numeri-guida della fase 1 che PROPOSTA §0 indicava come artefatti **lo erano**: saldo fermo (210 → 4 stagioni), gol a zero da S4 (0,24 → 13,8 a 26-30 anni), schermata di convocazione assente (0 → 8 su 8 gare giocate).
- Restano **difetti verificati**, in zona G: rinnovo di un anno inutile (§3); cancello della Nazionale che non guarda il contratto (§8) e che gira solo nelle settimane senza partita (§8); nutrizionista attivo solo nelle stesse settimane (§9); posizione ignorata nelle partite simulate (§5.4).
- Il numero di PO-154 (47% di impulsi senza condizione) regge.
