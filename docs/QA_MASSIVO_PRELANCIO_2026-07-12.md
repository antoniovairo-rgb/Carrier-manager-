# QA MASSIVO PRE-LANCIO PLAY STORE — 2026-07-12 (CPM 7.8.27 → 7.8.28)

Direttiva PO: «distruggere il gioco dal punto di vista QA» prima della pubblicazione. Metodo: intera batteria
di validazione esistente + audit adversariale multi-agente su 4 dimensioni (voto/statistiche · economia/contratti ·
nazionale/tornei · infortuni/training/crescita), ogni finding **verificato sul codice** prima del fix, regression
completa dopo il batch. Charter LMQP rispettato: QA First · No Blind Fix · Zero Regression · Determinism First.

## 1 · Batteria eseguita (baseline 7.8.27)

| Suite | Esito |
|---|---|
| Quality gate 14/14 (`validate-situations`, 179 sit) | ✅ PASS · fingerprint `00001505` · 0 failure |
| `career-invariants` / `stab-nat-trigger` / `career-sim` (2 stagioni) | ✅ 3/3 |
| `test:logic` (16 test node, Decision Engine) | ✅ 16/16 |
| `engine-mass-sweep` (37.908 ctx ×2) · `def-mass-sweep` (16.488 ctx) | ✅ |
| `bg-microsim` · `defensive-outcome` · `dup-fixture` · `cup-zombie` · `cup-transfer` | ✅ |
| `attendance-sim` (252×4284) · `club-evolution-sim` · `crowd-context` · `stadium-coherence` | ✅ |
| `credit-live-audit` (1074 esiti) · `def-credit-audit` | ✅ (1 warn taxonomy → fixato) |
| `live-validator` trial+career (6 partite reali, autoplay) | ✅ 12/12 HL PASS · 0 stalli · 0 pageerror |
| Suite analitica `situations-3d-validation` (537 combo) | ⚠️ exit 2 per 2 guardie stantie → **fixate**, ora exit 0 |
| `kit-diversity-test` (63.252 incontri) | ❌ crash estrazione → **fixato**, ora ✅ 0 violazioni |
| Stress carriera ESTESO (3 profili × 4 stagioni, invarianti profondi) | vedi §4 |

## 2 · Bug CONFERMATI e FIXATI in 7.8.28 (23 nel gioco + 3 test-infra)

### Carriera / Economia
| # | Gravità | Bug | Fix |
|---|---|---|---|
| B1 | ALTA | `rng(a,b)` è un generatore di **interi**: i jitter wage frazionari `rng(-0.1,0.1)` producevano {−10%, **+90%**} → ~17% delle offerte con stipendio ×1.9 (5 siti: 3211/3239/3242/3252/3263) | nuovo helper float `rngF` |
| B2 | ALTA | Il path LIVE (`onMatchEnd`) non azzerava `sessionsThisWeek`/`sessionLog` → la settimana dopo il TrainPanel vedeva `allDone` e l'auto-training saltava: **crescita da training congelata per chi gioca dal vivo ogni settimana** | reset nel return (gated `!_pendingOther`) |
| B3 | MEDIA | `weeklyStaffRel(p)` a fine `doAdvanceWeek` calcolato dal `p` originale e spread dopo `updP` → **clobberava** i delta di fiducia dello stesso tick (cessione respinta −8, task agente +6, eventi): il toast mentiva | `weeklyStaffRel(updP)` |
| B4 | MEDIA | 2 return di `simulateAndAdvance` (no-match / avversario non risolto) avanzavano la settimana **senza stipendio né staff-rel** (classe STAB-7) | spread aggiunti + decremento `returnPenaltyWeeks` |
| B5 | MEDIA | SVINCOLATO con OVR<70 riceveva SOLO offerte «prestito»: club madre = chi l'ha scaricato, `parentContract` = contratto SCADUTO → a fine stagione **rientro d'ufficio con contratto fantasma** | `contractExpired` ⇒ solo trasferimenti definitivi (ratio STAB-10) |
| B6 | MEDIA | U18 in prestito: `parentClub` = club U18 → al rientro un **PRO tornava nel pool Primavera** bypassando `ProTransitionScreen` | U18 ⇒ solo trasferimenti definitivi |
| B7 | MEDIA | `acceptTransfer` non rigenerava `seasonObjectives` → obiettivo classifica valutato sul club sbagliato + obiettivo gol impossibile (goals azzerati, target pieno) | rigenerati sul nuovo club |
| B8 | BASSA | Rinnovo via offerta (`isRenewal`) non attivava il cooldown `renewalSeason`; trasferimento non lo resettava | entrambi corretti |
| B9 | BASSA | `weeklyStaffRel` non girava nelle settimane di infortunio via Avanza (coachTrust 100 congelato per tutto lo stop) | spread sui 2 return infortunio |

### Coppa / classifiche di lega
| # | Gravità | Bug | Fix |
|---|---|---|---|
| B10 | **CRITICA** | La gara di Coppa giocata dal VIVO non aveva `cup:true` in `matchHistory` → (1) capocannonieri Coppa dell'eroe sempre 0 (7.8.18 rotto); (2) la **guardia anti-loop 6.98/HEAL2 la contava come gara di LEGA** vs lo stesso avversario → il ritorno di campionato veniva rimosso al reload (**stagione a 33 gare**, classe «loop/partite mancanti» 6.91→7.5.2); (3) forma «ultime 5 di lega» sporcata | flag `cup:true,cupRound` sull'entry live |
| B11 | ALTA | `player.goals` (TUTTE le competizioni) alimentava classifica marcatori di LEGA, premio capocannoniere, MVP e record di lega — i candidati sono stimati sulle sole gare di lega → **gol di coppa doppio-conteggiati** e premi falsati | `leagueGoalsOf/leagueAssistsOf` (tally da matchHistory filtrata) in `generateLeagueScorers` + `generateSeasonAwards` |
| B12 | MEDIA | Gare europee auto-simulate da Avanza: presenza contata ma **nessuna entry** in `matchHistory` (il path SIMULA la scriveva) → «ultime 5»/H2H/lista partite bucati | entry `simulated:true,euro:true` in entrambi i rami (girone+KO) |

### Nazionale / tornei
| # | Gravità | Bug | Fix |
|---|---|---|---|
| B13 | ALTA | Le pending-guard (`_pendingSim`/`_pendingEuro`/`_pendingOther`) **non includevano `national`** → simulare l'altra gara della settimana strandava l'amichevole → **convocazioni bloccate fino al rollover** (guardia 18589) | `national` nelle 3 guardie |
| B14 | MEDIA | La SIMULA dell'amichevole avanzava la settimana ignorando coppa/euro pendenti → **competizione congelata** | pending-check nel ramo national |
| B15 | MEDIA | Il trasferimento CANCELLAVA in silenzio l'amichevole prenotata (contraddice «la convocazione non si salta MAI») | voci `national` riportate nel nuovo calendario (`_keptComp7`) |
| B16 | MEDIA | INFORTUNATO accreditava **cap+gol+morale** dalle amichevoli auto-simulate (Avanza e Simula) | convocazione saltata: voce marcata, niente crediti |
| B17 | MEDIA | Gara europea simulata da infortunato: **infortunio NON decrementava** («Skip and recover» mentiva) + presenza accreditata all'infortunato | `injBase` spread + presenze gated |
| B18 | BASSA | Semifinale Europeo/Mondiale ai rigori titolava «il turno» (chiave `sf` vs `semi` di `EM_KO_ORDER`) | chiave corretta |
| B19 | BASSA | Notify «il torneo inizia alla settimana 24» ma il girone parte SUBITO | testo corretto |
| B20 | BASSA | Pass automatico W27 escludeva **Brasile/Argentina** (le 2 nazioni più forti, NAT_LEVEL 92/90) → brasiliano infortunato sempre auto-eliminato dal Mondiale | inclusi in `_topNat` |
| B21 | BASSA | Squalifica di CAMPIONATO/svincolo bloccavano la partita di NAZIONALE live | guardie skippate per `type:national` |
| B22 | BASSA | Save legacy `phase:"qualificazioni"&&qualDone`: si giocava una 3ª qualificazione FANTASMA (avversario fallback «Portogallo») che poteva ribaltare l'esito | guardia in `startEuroMondialeMatch` |

### Live match / voto / achievement
| # | Gravità | Bug | Fix |
|---|---|---|---|
| B23 | MEDIA | Voto live matematicamente **cappato a 8.45** (`min(rb,20)*0.115+0.35`): «voto 10», «Prestazione storica» (≥9) e achievement `perfect` IRRAGGIUNGIBILI; tripletta+2 assist = un gol+2 assist | scala `min(rb,30)*0.13` (4 siti, media quasi invariata: rb10 7.30→7.45) |
| B24 | MEDIA | Achievement «Rimonta» logicamente impossibile (`won && homeScore<awayScore` = contraddizione) | flag `wasBehind` reale tracciato in-match |
| B25 | MEDIA | `debut_pro` impossibile (`totalMatches===0` mai vero: i provini lo incrementano); «Bomber Azzurro» mai (contesti nazionali early-return prima del blocco); `captain` con solo trust≥90 (incoerente con la fascia guadagnata 7.5.0) | condizioni riparate |
| B26 | MEDIA | La cronaca ambientale poteva stampare «⚽ Gol di 〈Eroe〉» per un gol del microsim **non suo** (tabellino 2 gol, pagella 1) | eroe escluso dal pool marcatori BG |
| B27 | BASSA | Rigore sbagliato NEUTRO in pagella (segnato +5, sbagliato 0) | −2 (come miss_easy) |
| B28 | BASSA | Titolo stampa «clean sheet e vittoria» anche sul 3-2 | condizione `as===0` |
| B29 | BASSA | Tornei nazionali risolti da `onMatchEnd` con `result.simulated` perdevano il flag `sim` in `natHistory` | `sim:!!result.simulated` (4 siti) |

### Test-infra (3)
- Suite analitica: 2 guardie-regex stantie (pre-7.1.2) facevano exit 2 su motore sano → allineate all'invariante semantico.
- `kit-diversity-test`: `kitsClash` multi-linea rompeva l'estrazione (`SyntaxError`, suite morta) → `extractArrow`.
- `credit-live-audit`: fail-key `loose` mancante dalla lista KNOWN (già nella taxonomy del gate).

## 3 · Falsi positivi scartati (verifica adversariale)
- «Sweeper extras accredita gol di coppa/euro»: FALSO — la guardia 6.74.0 QA-2 rimanda le speciali di 1 settimana, il crediting tocca solo la lega.
- Jitter posizionali `rng(-1.5,1.5)` ecc.: quantizzati ma **simmetrici e in-range** (il bug B1 esiste solo dove `b-a+1` produce valori FUORI range).
- Bottoni bianchi `#fff` + `TH.primary`: leggibili in entrambi i temi (primary resta granata scuro in dark).
- `calcMarketValue`: nessun NaN possibile (default + floor verificati). `bankBalance`: nessuna sottrazione non guardata.

## 4 · Deferiti con motivazione (backlog, non regressioni)
| Item | Perché deferito |
|---|---|
| Declino 31+/auto-training/morale-drift/value SOLO in `doAdvanceWeek` (path live/sim li saltano) | stessa classe strutturale STAB ma il fix muove il **bilanciamento della carriera** (parabola 3.1 tarata) → serve sprint dedicato con collaudo PO su run lunga |
| I due blocchi training sono divergiti (`_acMult` vice-mister assente nell'auto-training; recuperi diversi) | estrazione helper unico = refactor; effetto piccolo |
| Infortuni/cartellini nascono SOLO giocando live (meta: «simula sempre» = zero stop) | decisione di design del PO |
| Candidati premi con nomi/formula diversi dalla classifica marcatori vista in stagione (il tally eroe ora è coerente, B11) | fix richiede rifattorizzare `generateSeasonAwards` su `generateLeagueScorers` |
| Rientro anticipato dall'infortunio: `returnPenaltyWeeks=max(3,originalInjuryWeeks)` (12 settimane di malus su stop da 12) | probabile refuso di design, da confermare col PO |
| Penalità «rientro graduale −6 form» solo sul path Avanza | balance nit |
| Coppa delle Nazioni non simulabile (unica competizione live-only) | feature, non bug |
| `FootballMatch` dead-code con rating scala 30-99 | rimozione da fare in uno sprint di pulizia |
| Voto medio: una SIM (cap 9.5) può superare una live media | mitigato da B23 (live ora arriva a 10) |
| Capocannonieri Coppa dell'eroe si azzerano al trasferimento (matchHistory reset) | edge-case cosmetico |

## 5 · Regression post-fix
Vedi esito in coda a questo documento / log di sessione: gate 14/14 + career-invariants + stab-nat + career-sim
+ stress esteso (3 profili × 4 stagioni con invarianti profondi: cap 34 gare, no fixture duplicate, età/fatica/
morale/valore in range, ΣGF=ΣGA, banca ≥0) devono essere TUTTI verdi prima del push.
