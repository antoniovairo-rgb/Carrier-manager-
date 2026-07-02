# AUDIT QA MASSIVO v2 — Career Player Manager (Elevora)
**Versione auditata: CPM 5.94.0 (commit 0863d6a) · 2026-07-02 · SOLO ANALISI (zero modifiche al codice di gioco)**
**Team: Lead QA Engineer · Software Architect · Game Director + 5 workstream specialistici paralleli**

---

## 0. METODOLOGIA E PERIMETRO

Audit condotto con **esecuzione reale**, non solo lettura:

| Batteria | Volume | Strumento |
|---|---|---|
| Distribuzione risultati `simulateMatch` | **120.000 partite** (6 scenari × 20.000, seed avalanche) | estrazione funzioni reali in node |
| Stagioni complete `updateStandings` | **300 stagioni × 34 giornate** (~183.000 partite di lega) | node, seed canonici del gioco |
| G/A del giocatore in auto-sim (`_pSimStats`) | **2.000 stagioni** (4 profili OVR × 500) | node |
| Micro-sim di sfondo `bgMicroTick` | 4.000 partite × 90' (baseline esistente rieseguita) | Playwright |
| Partite REALI end-to-end (clock vero, HL giocati) | 2 match completi ~90' con driver tastiera | Playwright + probe |
| Stress salvataggio/migrazione | 100 migrazioni consecutive su save "15 stagioni" gonfio ai cap | Playwright + `__CPM_MIGRATE` |
| Repair coppe post-trasferimento | test dedicato 2 scenari (W33 stretto / W10 ampio) | Playwright |
| Config stadi | 298 entità (252 club + 36 U18 + 10 nazionali) eseguite su `stadiumConfigFor` | node |
| Screenshot UI | mobile 390×844 + desktop 1280×800, schermate principali | Playwright + ispezione visiva |
| Analisi statica | census Math.random (171), catch vuoti (45), updater impuri (11), dead code, cap array, dispose 3D, XSS | grep/read sistematici |
| Quality gate ufficiale | 14/14 verde su questa build (2 run indipendenti) | suite Playwright del repo |

**Nota di trasparenza:** le simulazioni massive coprono i path *deterministici/estraibili* (motore risultati, classifiche, config). La **carriera multi-stagione end-to-end** (100 stagioni con training/eventi/mercato reali) NON è automatizzabile oggi: la logica vive dentro updater React non esposti. È il primo gap di testabilità segnalato (§9).

---

## 1. EXECUTIVE SUMMARY

**Giudizio complessivo: 7/10 — beta avanzata solida, non ancora standard commerciale.**

Il progetto ha fatto un salto di qualità enorme negli ultimi 20 rilasci (5.75→5.94): i 4 pilastri che a inizio ciclo erano rotti — soft-lock del match, determinismo delle classifiche, coerenza esito 3D/overlay/cronaca, robustezza del boot — oggi sono **verificati sani sotto stress**: 2 partite reali complete senza un singolo pageerror, heap stabile (~67-70MB, nessun leak tra match), 100 migrazioni consecutive senza crescita del save, somma GF=GA garantita in 300 stagioni simulate, gate 14/14.

Le distanze dallo «standard commerciale» sono concentrate in **quattro fasce**:

1. **Rischio store/legale (l'unico CRITICO):** il gate copyright — dichiarato bloccante per il rilascio — è **cieco su stadi, allenatori e combinazioni di nomi**: «Stade Vélodrome B» (termine presente nella blocklist!) è realmente assegnato in-game, insieme a decine di stadi reali letterali («Volksparkstadion», «Westfalen Stadion»…), **10 allenatori reali** («Mister Gattuso», Conte, Allegri, Capello…), nomi-brand di club (QPR, Betis, Standard…) e **calciatori reali generabili per nome+cognome** (Thomas Müller, Sergio Ramos, Bruno Fernandes…). Il «0 hit ✅» attuale è un falso negativo.
2. **Contenuto troncato senza che nessuno se ne sia accorto:** la fase KO europea per club **salta i Quarti di finale** (ottavi→semifinale, con notifica che mente: «Ai quarti di finale!»); `euroMondiale.active` e `nationsCupQueue.active` non vengono mai resettati → **un solo Europeo/Mondiale e una sola Coppa delle Nazioni per TUTTA la carriera** (il design ne prevede uno ogni 4/2 stagioni); la prima stagione da professionista è priva di coppa e d'Europa.
3. **Calibrazione statistica fuori dal calcio reale (misurata, non opinata):** 2,17 gol/partita (reale ~2,7), 0-0 all'11% (reale ~7%), **campione di lega a 64 punti medi su 34 giornate** (reale 75-85) — l'IA di lega è compressa verso la mediocrità, il che rende il club del giocatore percepito come dominante «gratis»; capocannonieri IA sintetici scollegati dai risultati di lega; tetto ~13 gol/stagione per l'eroe in auto-sim contro i 19-32 attribuiti agli NPC.
4. **Economia e contratti con exploit e promesse non mantenute:** lo svincolato continua a percepire lo stipendio e a «giocare» in simulazione; spam di rinnovi da 1 anno = +8 morale illimitato e stipendio al tetto; il task agente «Prepara rinnovo» accumula un bonus che NON viene mai applicato (dead code); OGNI prestito termina con uno svincolo automatico (il contratto col club madre viene perso); l'«investimento immobiliare» da −40.000€ promette una rendita mai implementata.
5. **Debito architetturale circoscritto ma reale:** 480 righe di logica di dominio dentro UN updater React (`advanceWeek`) con 16 Math.random e 17 setTimeout interni; 45 catch vuoti (alcuni sul path di salvataggio); ~700 righe di dead code (incluso un intero motore match 2D mai montato); `onMatchEnd` non transazionale (13 setPlayer sequenziali).
6. **UI: il CTA più importante del gioco è rotto.** Il bottone «Gioca →» del calendario è testo bianco su grigio chiaro (contrasto 1,15:1 — un bug di spread degli stili, non una scelta); il badge versione copre la tab-bar su OGNI schermata mobile; la label del modulo avversario è illeggibile (testo scuro su pannello scuro); 7 classi di touch target sotto i 40px.

Audio: **assente per design** (nessun sistema sonoro nel codice) — per uno standard commerciale è un gap di prodotto, non un bug.

**Voti per macro-area:** Motore partita 8 · Robustezza/stabilità 8,5 · Persistenza 8 · Simulazione lega 5,5 · Carriera/economia 6 · Competizioni 6 · Database/contenuti 6,5 (4 in ottica store) · UI/UX 7 · Grafica 7,5 · Audio n/d (assente) · Architettura 6.

**Se si fanno solo 5 cose:** (1) estendere il gate copyright a stadi+nomi combinati e bonificare; (2) inserire i Quarti europei + reset `active` dei tornei nazionali; (3) ricalibrare λ del motore risultati (+0,25 circa) e la forza dei top club; (4) spezzare `advanceWeek` in logica pura testabile; (5) tap-to-skip e pacing della partita (4+ minuti reali con 2 highlight nel provino è troppo).

---

## 2. RISULTATI DELLE BATTERIE STATISTICHE (numeri misurati)

### 2.1 Distribuzione risultati (`simulateMatch`, 120.000 partite)
| Scenario | W/D/L | Gol/match | 0-0 | GD≥5 |
|---|---|---|---|---|
| Pari 70v70, casa | 47,0 / 28,5 / 24,5% | **2,17** | **11,3%** | 0,7% |
| Pari 70v70, trasferta | 31,4 / 29,4 / 39,2% | 2,17 | 11,3% | 0,5% |
| Big 85v60, casa | 68,8 / 21,7 / 9,5% | 2,23 | 10,6% | 2,5% |
| Piccola 60v85, trasferta | 14,1 / 25,7 / 60,2% | 2,14 | 12,0% | 1,4% |
| Star OVR90 in lega debole, casa | 58,3 / 25,3 / 16,3% | 2,23 | 10,5% | 1,4% |

**Confronto col calcio reale:** gol/match ~2,7-2,9 (qui **2,17: −20%**); 0-0 ~7-8% (qui **11-12%**); vantaggio casa e gerarchia prestigio realistici; goleade rare al punto giusto. Il motore è **sotto-produttivo di gol in modo sistematico** (λ base 1,15/1,00). Nota: il path NON seedato (`poissonGoals`) cappa a **5 gol** per squadra mentre quello seedato arriva a 8 — due fisiche diverse per la stessa partita a seconda del chiamante.

### 2.2 Stagioni complete (300 stagioni, lega 18 squadre)
| Metrica | Misurato | Calcio reale (34 giornate) |
|---|---|---|
| Punti del campione | **56–81, media 64** | 75–85 |
| Punti sedicesima (salvezza) | 28–41, media 35 | ~35-40 ✓ |
| Quota pareggi | 28,8% | ~25% |
| GD del campione | media +20 (min +2!) | +35/+50 |
| Somma GF = GA di lega | **300/300 ✓** | — |
| Titoli ai top-3 prestigio | ~51% | ~80-90% |

**Diagnosi:** l'ecosistema di lega è **troppo compresso**: i top club non dominano (campione a 64 punti, GD +20) e chiunque può vincere. Questo ha due effetti percepiti: (a) il club del GIOCATORE che gioca bene stacca il gruppo in modo innaturale (il «+26 sulla seconda» segnalato dal PO è per metà un problema dell'IA, non del giocatore); (b) l'albo d'oro è casuale, senza dinastie.

### 2.3 G/A del giocatore in auto-sim (2.000 stagioni)
OVR 65: 4,2 gol/stagione · OVR 75 bomber: 8,8 · OVR 85 bomber: 10,9 · OVR 95 bomber: **13,1 (max 25)**. I capocannonieri IA del pannello premi ricevono invece **19-35 gol sintetici**: un giocatore che si fa simulare le partite NON può statisticamente vincere la classifica marcatori nemmeno a OVR 95 — mentre giocando a mano ne segna 15-25. Tre economie del gol scollegate (played / auto-sim / leaderboard sintetica).

### 2.4 Robustezza runtime (partite reali complete, driver tastiera)
2/2 match completati: **0 pageerror, clock mai bloccato, heap stabile 67-70MB (nessun leak tra match), timeline coerente** (ogni HighlightForced ha il suo ActionResolved con chiave valida). ⚠️ Pacing: una partita di provino dura **~4,5 minuti reali con soli 2 highlight** — l'85% del tempo è cronaca passiva a schermo.

### 2.5 Stress persistenza
100 migrazioni consecutive su save gonfio: dimensione **stabile a 67KB** (nessuna crescita), tutti i cap rispettati (matchHistory 200, log 60, diary 80). ⚠️ La migrazione **non converge mai** (`changed=true` 100/100) quando l'id del club non esiste nel pool: rigenera calendario+classifica AD OGNI CARICAMENTO. Con i club attuali converge; se un id di club venisse mai rinominato, i save esistenti perderebbero la stagione in corso a ogni load, in silenzio.

### 2.6 Latenti misurati
`seededRng` (xorshift32) con seed piccoli (<10⁴) produce prime estrazioni fortemente distorte verso 0 — oggi TUTTI i call-site passano seed hashati (verificati uno a uno), ma basta un futuro `seededRng(week)` per introdurre bias invisibile. Consigliato un avalanche-mix nel costruttore.

---

## 3. FINDINGS DETTAGLIATI PER AREA

> Formato: ogni finding ha gravità/probabilità/impatto/causa/fix. Le righe di codice citate si riferiscono a CARRIER-MANAGER-AV.html @ 5.94.0. Qui i cluster principali; l'elenco completo ordinato è in §4-7.

### 3.1 STORE / COPYRIGHT (Critica — blocca il rilascio)
- **CR-1 · Gate copyright cieco su stadi/allenatori/nomi combinati** — `_auditCopyrightSafety` (r.4939-4951) non scansiona `CLUB_STADIUMS`/`STADIUM_POOLS`/`STADIUMS` né `COACH_NAMES` né le COMBINAZIONI dei pool nomi. Conseguenze VERIFICATE in-game: «Stade Vélodrome B» assegnato a FC Berlin/FC Stuttgart (e «Vélodrome» È in `_CR_BRANDS`!); «Volksparkstadion» al FC Bruges; «Westfalen Stadion», «Amsterdam Arena», «Gewiss Arena Nord», «Giuseppe Meazza Est» nei pool; «Mister Gattuso/Conte/Allegri/Capello…» (10 allenatori reali su 16, r.4199); rose generabili con «Thomas Müller», «Sergio Ramos», «Bruno Fernandes», «Jordan Henderson»… (nome+cognome nello stesso pool nazionale). Il «0 hit» del gate 1.5 è un falso negativo: **il gioco NON è oggi pubblicabile sotto il proprio standard dichiarato**. Fix: estendere lo scan alle 4 sorgenti mancanti + scan combinatorio su lista full-name + bonifica dati.
- **CR-2 · De-branding club incompleto** — ~127/252 nomi con toponimi/brand; top rischio: FC QPR, AT Madrid, FC Standard, FC Betis, FC Willem, FC Casa Pia, FC Rio Ave, FC Cambuur (nomi-identità, non città). In `LEAGUE_RECORDS`: **«Paris FC»** è il nome esatto di un club reale; «AC Roma» quasi. Gravità Alta.

### 3.2 COMPETIZIONI (Alta)
- **CP-1 · KO europeo senza Quarti** — `_KNX={r16:"sf",...}` (r.14844, 15481): ottavi→semifinale. La notifica r.14867 dice «Ai quarti di finale!» mentre schedula la semifinale. L'euroMondiale nazionale invece HA i quarti (asimmetria interna).
- **CP-2 · Un solo Europeo/Mondiale per carriera** — `euroMondiale.active` mai riportato a false dopo `done:true` (r.14757/14740); il trigger `!active` (r.15406) fallisce per sempre. Idem **CP-3** per `nationsCupQueue.active` (r.14818/15394). Due tornei che il design prevede ricorrenti si giocano UNA volta nella vita.
- **CP-4 · Prima stagione pro senza coppa né Europa** — `onProChoose` (r.16166-16180) non inizializza `cup`/`euro`; nascono solo in `doStartNewSeason`.
- **CP-5 · KO europeo schedulabile oltre W38 senza clamp** (r.14859) → gara orfana nella stagione corrente.
- **CP-6 · Rigori/spareggi al 55% fisso pro-giocatore** (r.14609, 14718, 14902, 15476, 15500) — indipendenti da OVR/stat: pareggiare in coppa è statisticamente conveniente.

### 3.3 CARRIERA / ECONOMIA (Alta)
- **EC-1 · Svincolato stipendiato e schierato in sim** (r.15688-15694, 15456-15533): a contratto scaduto si blocca solo il tasto GIOCA. — **EC-2 · Spam rinnovi**: nessun cooldown, +8 morale a click, `baseDur` rerollabile (r.19400, 16261, 16243). — **EC-3 · Bonus task «Prepara rinnovo» mai applicato**: consumato solo da un ramo (`isRenewal`) che nessun codice genera più; `_acceptNegoWage` lo azzera senza usarlo (r.15583, 16274-16279, 16261). — **EC-4 · Ogni prestito termina in svincolo**: contratto col club madre perso alla partenza, mai ripristinato (r.2935+15977+16143). — **EC-5 · «Investimento immobiliare» senza rendita** (r.1231: −40k, payoff inesistente nel file). — **EC-6 · Spese-evento gratis a saldo 0** (r.15110, `Math.max(0,…)` senza check). — **EC-7 · Counter agente sempre accettato** (+20% wage +1 anno, r.16966-16973). — **EC-8 · Finestre di mercato aggirabili** (transferListed 28%/settimana tutto l'anno, r.15541 — BIL-6 ancora aperto). — **EC-9 · Denaro senza sink**: a OVR alto si accumulano 60-270k/settimana contro spese ~19% del wage; il patrimonio è un contatore. — **EC-10 · Agente non licenziabile** (nessun `hasAgent:false`).

### 3.4 MOTORE PARTITA (Media)
- **MP-1 · Il path «⚡CATENA» (25%) bypassa selezione contestuale, exclude e clock** (r.10630 vs 10019): situation pescata dal set pre-kickoff a ctx neutro, minuto non avanzato. — **MP-2 · Lo skip da tastiera scavalca i trigger a minuto esatto** 28'/45'/63'/75'/85' (ordini mister, intervallo) perché sono su `===` (r.10705 vs 9905+). — **MP-3 · I tiri dell'eroe non incrementano `shots`** (solo eventi BG, r.10146): «3 gol, 1 tiro» con xG tracciato → incoerenza interna. — **MP-4 · Eventi al 91-92' senza recupero implementato** (min+1 anti-collisione, r.10427). — **MP-5 · `opp_red` cosmetico e ripetibile** (nessun effetto su λ, nessuna rimozione, dedup solo testuale). — **MP-6 · Cori con punteggio stale da closure** (r.10162 vs pattern corretto r.10156). — **MP-7 · Penalità punizione via regex sul testo** della situation (r.10343). — **MP-8 · Rigore: la parata non legge le stat** (`saved=dir===gkDir` a monte del motore, r.10556). — **MP-9 · Movimento DPad gratis** (+12 `defDist` a mossa, nessun costo energia → muoversi sempre è dominante, r.10315-10326). — **MP-10 · Pacing**: ~4,5 min reali per un provino con 2 HL.

### 3.5 SIMULAZIONE LEGA (Alta per il realismo)
- **SL-1 · λ sotto-calibrate** (2,17 gol/match, 0-0 11%). — **SL-2 · Campione a 64 punti / GD+20** (top club troppo deboli: serve un boost gerarchico, es. λ scalate su (p-65) più ripide o home advantage per prestigio). — **SL-3 · Capocannonieri sintetici scollegati** dai risultati di lega e dal tetto dell'eroe in auto-sim (§2.3). — **SL-4 · Doppio cap Poisson 5/8** tra path seedato e non. — **SL-5 · Bye fantasma con «altre» dispari** (oggi latente: 14 leghe × 18 club pari; si attiva con pool dispari da fallback). — **SL-6 · Accoppiamenti altrui casuali ogni settimana** (nessun calendario per le altre 16: una squadra può incontrare la stessa avversaria N volte). — **SL-7 · `opponentId` non trovato → fallback silenzioso** che reintroduce l'incoerenza pre-MOT-3 (r.5164).

### 3.6 SISTEMI ASSENTI O DI CARTONE (realismo)
- **SA-1 · Cartellini/squalifiche dell'eroe**: `isSuspended` esiste (r.16916) e i cartellini rollano post-match (r.14910-14911), ma NESSUN accumulo visibile né regola 5-gialli; da completare e documentare (CLAUDE.md non lo cita). — **SA-2 · Recupero/injury time assente**. — **SA-3 · Infortuni di compagni/avversari assenti** (solo flavor BG). — **SA-4 · Sostituzioni in-match dell'eroe** (panchina implementata: watching→warmup→entering; ma niente uscita dal campo per scelta tecnica/infortunio). — **SA-5 · `returnPenaltyWeeks` decorativo** (settato e decrementato, mai consumato nel roll). — **SA-6 · Ricaduta declassata sempre a «medio»** (r.14438). — **SA-7 · Record di lega statici e senza tracking live** (superamento comunicato solo a fine stagione; i record NPC non evolvono mai). — **SA-8 · Classifica marcatori live inesistente** (appare solo nel pannello premi a fine stagione). — **SA-9 · Audio completamente assente** (nessun AudioContext nel file). — **SA-10 · 4 leghe senza promozione/retrocessione** (PT/NL/BE/TR: vicolo cieco di carriera non comunicato).

### 3.7 DATABASE (Alta)
- **DB-1 · `CLUB_STADIUMS`: 19 chiavi morte + collisione `mon`** → FC Monaco gioca al «Brianza Stadium», FC Leipzig al «Mersey Stadium»; **148/190 club in fallback hanno stadio in lingua sbagliata** (pool multinazionali non segmentati per nazione). — **DB-2 · Brasile/Argentina con rose italiane** (`NAME_BY_NAT` senza 🇧🇷/🇦🇷, fallback 🇮🇹, r.4960). — **DB-3 · Record: «AC Roma»/«Paris FC» club inesistenti in CLUBS + 3 leghe seconda divisione senza record** (fallback con nomi italiani in Germania/Francia/Spagna). — **DB-4 · Pool nomi piccoli con duplicati interni** (🇧🇪 28 cognomi unici per 18×23 giocatori). — **Sano:** 252 club senza duplicati id/nome/abbr-in-lega, nat↔lega coerenti 100%, contrasto kit ≥109 RGB, derby validi, capienze 3.000-81.000 tutte in banda, zero piste d'atletica.

### 3.8 ARCHITETTURA (v. §6)
Sintesi: ARC-3/4/5/6 del precedente audit **chiusi e verificati**; ARC-2 aperto a metà (doppio stato standings rimosso; **updater impuri restano**: advanceWeek 480 righe con 16 random+17 timer+18 setState interni). 45 catch vuoti; `migratePlayer` senza try/catch al mount; errore-storage indistinguibile da slot vuoto; `onMatchEnd` = 13 setPlayer sequenziali senza transazione; ~700 righe dead code (`FootballMatch`, `calcAttendance`, `toThree`…); duplicazione formula training (r.13808 vs 15658); flush `pagehide` con storage nativo async non garantito su Capacitor; ancore fragili in build-dist. **Sano:** timer/listener puliti, dispose 3D profondo che copre anche S2/CROWD, XSS di fatto nullo, save 50-120KB con cap ovunque, gating store-build effettivo.

### 3.9 UI/UX (v. §7)
Sintesi: CTA «Gioca →» a contrasto 1,15:1 (bug spread `style` in `Btn`, r.~17918); badge versione sopra la tab-bar mobile ovunque (r.20671); «4-2-3-1» illeggibile su pannello scuro; 7 classi di touch target <40px (pausa 15×17!); tabellone «Selezione … 0-0 Selezione …»; stacchi neri ~1-3s a inizio match percepibili come freeze; overlay esito rosso su cielo azzurro; «0anni» e tre formati valuta diversi nella stessa card; hint tastiera mostrati su touch; forma «L-L-L-L-L» a zero partite. **Sano:** zero overflow orizzontale su ~50 schermate × 2 viewport, zero pageerror, modali e gerarchie tipografiche ordinate.

---

## 4. TOP 50 BUG (per priorità)

> P = probabilità di accadimento · Legenda aree: ST store, CP competizioni, EC economia/carriera, MP motore partita, SL simulazione lega, DB database, UI interfaccia, AR architettura.

| # | Bug | Gravità | P | Area |
|---|-----|---------|---|------|
| 1 | Gate copyright cieco su stadi/allenatori/nomi combinati — «Stade Vélodrome B», «Mister Gattuso», «Thomas Müller» generabili (CR-1) | **Critica** | certa | ST |
| 2 | Fase KO europea per club SENZA Quarti di finale (r16→sf) + notifica che mente (CP-1) | Alta | certa | CP |
| 3 | `euroMondiale.active` mai resettato → un solo Europeo/Mondiale per carriera (CP-2) | Alta | certa | CP |
| 4 | `nationsCupQueue.active` mai resettato → una sola Coppa delle Nazioni (CP-3) | Alta | certa | CP |
| 5 | Svincolato: stipendio accreditato e presenze/gol simulati col club che ti ha scaricato (EC-1) | Alta | certa | EC |
| 6 | Ogni prestito termina con svincolo automatico — contratto col club madre perso (EC-4) | Alta | certa | EC |
| 7 | Task agente «Prepara rinnovo»: bonus accumulato e MAI applicato (ramo consumer = dead code) (EC-3) | Alta | certa | EC |
| 8 | Spam rinnovi 1-anno senza cooldown: +8 morale illimitato, wage al tetto, durata rerollabile (EC-2) | Alta | alta | EC |
| 9 | CTA «Gioca →» del calendario a contrasto 1,15:1 (bug spread style in `Btn`) | Alta | certa | UI |
| 10 | `CLUB_STADIUMS`: 19 chiavi morte + collisione `mon` → Leipzig al «Mersey Stadium», 148/190 stadi in lingua errata (DB-1) | Alta | certa | DB |
| 11 | De-branding incompleto: QPR/Betis/Standard/Willem/«Paris FC» nei dati (CR-2) | Alta | media | ST |
| 12 | Badge versione fisso sopra la tab-bar mobile su ogni schermata (anche PROD) | Alta | certa | UI |
| 13 | Label modulo avversario illeggibile in FormationView (testo scuro su pannello scuro) | Alta | certa | UI |
| 14 | Motore risultati sotto-calibrato: 2,17 gol/match, 0-0 all'11% (SL-1) | Alta | certa | SL |
| 15 | Ecosistema lega compresso: campione a 64 punti medi, GD +20, titoli quasi casuali (SL-2) | Alta | certa | SL |
| 16 | Prima stagione da professionista senza Coppa né Europa (CP-4) | Media | certa | CP |
| 17 | «⚡CATENA» 25%: bypassa selezione contestuale/exclude e non avanza il clock (MP-1) | Media | alta | MP |
| 18 | Capocannonieri IA sintetici scollegati da risultati di lega e dal tetto eroe in auto-sim (SL-3) | Media | certa | SL |
| 19 | «Investimento immobiliare» −40k: la rendita promessa non esiste nel codice (EC-5) | Media | certa | EC |
| 20 | Counter dell'agente sulle offerte SEMPRE accettato: +20% wage +1 anno gratis (EC-7) | Media | certa | EC |
| 21 | Spese-evento gratis a saldo 0 (`Math.max(0,…)` senza check fondi) (EC-6) | Media | alta | EC |
| 22 | Skip da tastiera scavalca ordini mister 28'/63'/75'/85' e intervallo (trigger a `===`) (MP-2) | Media | media | MP |
| 23 | Tiri dell'eroe non conteggiati in `shots` → «3 gol, 1 tiro» con xG>0 (MP-3) | Media | certa | MP |
| 24 | Finestre di mercato aggirabili: listed = offerte 28%/settimana tutto l'anno (BIL-6 aperto) (EC-8) | Media | alta | EC |
| 25 | Rinnovo firmabile col club di PRESTITO (contratto incoerente al rientro) (A4) | Media | media | EC |
| 26 | Offerta durante il prestito: il club madre viene orfanizzato (`parentClub` sovrascritto) (B3) | Media | media | EC |
| 27 | Rigori/spareggi coppa al 55% fisso pro-giocatore, stat ignorate (CP-6) | Media | certa | CP |
| 28 | KO europeo schedulabile oltre W38 senza clamp → gara orfana (CP-5) | Media | bassa | CP |
| 29 | Migrazione non convergente con club-id ignoto: calendario/classifica rigenerati A OGNI load | Media | bassa | AR |
| 30 | `migratePlayer` senza try/catch al mount: save malformato = crash CareerApp (solo ErrorBoundary) | Media | bassa | AR |
| 31 | Errore storage in load indistinguibile da slot vuoto → rischio sovrascrittura save (F3) | Media | bassa | AR |
| 32 | `onMatchEnd` non transazionale: 13 setPlayer sequenziali, crash a metà = save parziale | Media | bassa | AR |
| 33 | Record superato: nessuna notifica live; record NPC statici per sempre (SA-7) | Media | certa | CP |
| 34 | Brasile/Argentina: rose e nazionali con nomi italiani (DB-2) | Media | certa | DB |
| 35 | Record di lega citano club inesistenti («AC Roma», «Paris FC») + 3 leghe senza record (DB-3) | Media | certa | DB |
| 36 | `returnPenaltyWeeks` (rientro graduale) decorativo: mai consumato (SA-5) | Media | certa | EC |
| 37 | Eventi settimanali fuori contesto: «ritiro pre-campionato» a marzo, «escluso dai titolari» senza panchina, eventi mercato in U18 (D2) | Media | media | EC |
| 38 | Anti-ripetizione eventi solo su 1 pool su 3 (impulsi/random senza memoria) (D1) | Media | media | EC |
| 39 | Doppio cap Poisson (5 vs 8 gol) tra path seedato e non (SL-4) | Media | certa | SL |
| 40 | Tabellone «Selezione … 0-0 Selezione …» nel provino + troncamenti aggressivi HUD | Media | certa | UI |
| 41 | Stacco nero 1-3s a inizio match percepibile come freeze su mobile | Media | media | UI |
| 42 | Touch target sotto soglia: pausa 15×17px, chip leghe h21, salva h17 (7 classi) | Media | certa | UI |
| 43 | `opp_red` cosmetico e ripetibile: due espulsioni con 11 in campo, λ invariate (MP-5) | Bassa | media | MP |
| 44 | Cori/chant leggono il punteggio stale dalla closure (MP-6) | Bassa | media | MP |
| 45 | Eventi partita al 91'-92' senza recupero implementato (MP-4) | Bassa | media | MP |
| 46 | Penalità punizione dipendente da regex sul TESTO della situation (MP-7) | Bassa | latente | MP |
| 47 | Bye fantasma: con «altre» squadre dispari la somma GF≠GA di lega (oggi latente) (SL-5) | Bassa | latente | SL |
| 48 | `windowOfferUsed` non resettato a inizio stagione (B6) | Bassa | media | EC |
| 49 | `buyClause` mostrata ma mai usata nella risoluzione del prestito (B2) | Bassa | certa | EC |
| 50 | id impulso duplicato `wi_cena_squadra` + duplicati nei pool nomi 🇧🇪/🇳🇱/🇹🇷 (D3, DB-4) | Bassa | certa | DB |

---

## 5. TOP 50 MIGLIORIE DI REALISMO

1. Ricalibrare le λ del motore risultati (+0,25 circa: target 2,6-2,8 gol/match, 0-0 ≤8%).
2. Gerarchia di lega: λ più ripide sul prestigio + forma stagionale per club → campioni a 75-85 punti e dinastie.
3. Quarti di finale nelle coppe europee per club (allineare a euroMondiale).
4. Europeo/Mondiale e Coppa delle Nazioni RICORRENTI (fix reset `active`).
5. Recupero/injury time reale (1'-6') con eventi dedicati e tensione narrativa.
6. Cartellini dell'eroe completi: gialli visibili, accumulo → squalifica, diffida.
7. Espulsione avversaria con effetto reale: λ ridotta, 10 uomini visibili in campo.
8. Infortuni dei compagni con impatto su gerarchie e convocazioni.
9. Sostituzione dell'eroe in-match (stanchezza/scelta tecnica) con reazione morale.
10. Rientro graduale post-infortunio EFFETTIVO (consumare `returnPenaltyWeeks` nel roll).
11. Classifica marcatori live consultabile in stagione, derivata dai risultati veri.
12. Record di lega vivi: tracking live del superamento + record NPC che evolvono.
13. Calci d'angolo/rimesse come micro-eventi giocabili (oggi solo cronaca).
14. Supplementari e rigori VERI nei KO (minigame rigori già esistente: riusarlo) invece del 55% flat.
15. Mercato AI tra club NPC (trasferimenti visibili nelle news → mondo vivo).
16. Sink economici veri: casa, famiglia, multe, investimenti CON rendita, beneficenza con ritorno reputazionale.
17. Stipendi a scaglioni realistici per lega/prestigio (oggi wage cresce solo col rinnovo).
18. Prestito con recall di gennaio e contratto-madre persistente.
19. Clausole contrattuali: bonus gol/presenze, clausola rescissoria che le offerte rispettano.
20. Conferenze stampa/interviste con conseguenze (spec §9.4, oggi assenti).
21. Gerarchie di spogliatoio (U18→riserva→titolare→leader) con effetti su minutaggio.
22. Ritiro pre-campionato reale alle W-2/-1 (spec §9.1) — e i relativi eventi solo lì.
23. Convocazioni club intelligenti complete (matchStatus/minutesPlayed della spec §8).
24. Nazionale: amichevoli periodiche oltre ai tornei; ritiro dalla nazionale a fine carriera.
25. Seconde divisioni PT/NL/BE/TR o playoff, per eliminare i vicoli ciechi di carriera.
26. Meteo con effetto meccanico percepibile e comunicato (oggi micro-penalità nascosta).
27. Derby con build-up narrativo settimanale e pressione extra (momentum iniziale).
28. Forma «ultime 5» reale del club avversario nel pre-match (oggi placeholder).
29. Squadra dell'anno con XI vero (11 nomi visibili, non solo badge per il giocatore).
30. Trofeo d'Oro: rimuovere il gate rigido `isChampion` (podio possibile da non-campione).
31. Giovane dell'anno: confronto REALE con gli NPC candidati, non solo soglia.
32. Albo d'oro consultabile di TUTTE le competizioni (storico campioni per stagione).
33. Statistiche carriera avanzate: xG stagionale, conversion rate, minuti, cartellini.
34. Pressione dei media/tifosi variabile per prestigio club (aspettative dinamiche).
35. Rivalità personale con arco narrativo (il rivale cresce/cala, duelli diretti).
36. Morale di SQUADRA distinto dal morale personale, mosso dai risultati.
37. Capitano: responsabilità reali (rigori, interviste) quando si ha la fascia.
38. Momentum di carriera: hot-streak/slump con effetti e narrazione dedicata.
39. Età realistiche in rosa: compagni che invecchiano/si ritirano tra stagioni.
40. Allenatori NPC con carriera: esoneri visibili, ritorni, «il mister che ti ha lanciato».
41. Mercato di gennaio dei CLUB (rosa avversaria che cambia a metà stagione).
42. Infortuni in-match (uscita al 30' con sostituzione) oltre a quelli post-partita.
43. Fatica direzionale: trasferte lunghe/nazionale che pesano sulla settimana dopo.
44. Premi mensili (POTM) per riempire il vuoto narrativo tra le giornate.
45. Statistiche di squadra di fine partita credibili (possesso/tiri coerenti con l'andamento).
46. Cerimonia premiazione coppa/Europa dedicata (il trofeo 3D esiste: usarlo per ogni titolo).
47. Tifosi in trasferta proporzionali a distanza/rivalità (oggi solo derby/fill).
48. Voci di mercato su COMPAGNI (il bomber che parte a gennaio cambia la stagione).
49. Contratti dello staff personale con qualità/level-up (oggi 2 perk flat).
50. Suono: anche solo un layer ambience+fischi+boato gol trasformerebbe la percezione (oggi zero audio).

---

## 6. TOP 50 MIGLIORIE TECNICHE (architettura)

1. Estrarre `advanceWeek` in `nextWeekState(p, rolls) → {newP, effects[]}` puro e testabile (480 righe fuori dall'updater).
2. Stessa estrazione per `seasonEnd` e post-match growth (gli altri updater impuri).
3. Pre-calcolare i roll FUORI dagli updater (o seedarli con `hashStr(season,week)`): StrictMode/concurrent-safe.
4. `onMatchEnd` transazionale: un solo updater (o reducer) al posto di 13 setPlayer sequenziali.
5. try/catch attorno a `migratePlayer` al mount con fallback «carica senza migrare + avviso».
6. Distinguere errore-storage da slot vuoto (`{_error:true}` come già fatto per `_corrupted`).
7. `console.warn` nei 45 catch vuoti dei path di persistenza (telemetria minima).
8. Guard di convergenza nella migrazione: club-id ignoto → ripara UNA volta e logga, non a ogni load.
9. Avalanche-mix nel costruttore di `seededRng` (elimina il bias da seed piccoli, latente).
10. Unificare i due cap Poisson (5 vs 8) in una sola funzione parametrica.
11. Seedare i 5 roll «vittoria su pareggio» di coppa/Europa (riproducibilità dei bug report).
12. Rimuovere `FootballMatch` + 10 simboli morti (~700 righe, −peso store).
13. De-duplicare la formula training (r.13808 vs 15658) in un helper unico.
14. `slice(-40)` sui 5 siti `worldMemory` non cappati (igiene).
15. `fxTimeout` gemello in CareerApp (105 setTimeout fire-and-forget).
16. Ancore dedicate `<!-- CPM:CDN-START/END -->` in build-dist (oggi ancorata a un commento versionato).
17. Gating store per `__CPM_CROWD_OVERRIDE` e flag query estetici (ARC-5 al 100%).
18. Su Capacitor: scrivere ANCHE su localStorage sync come cache del flush `pagehide`.
19. Harness carriera headless: esporre (test-only) `cpmSimulateSeason(n)` che attraversa la VERA logica → abilita il test «100 stagioni» oggi impossibile.
20. Suite di non-regressione carriera (§11 CLAUDE.md) PRIMA del refactor updater.
21. Save fuzzer: 1.000 save mutati casualmente contro `__CPM_MIGRATE` in CI.
22. Soak test CI: 5 partite reali consecutive con soglia heap (la batteria di questo audit, stabilizzata).
23. Screenshot-diff sulle 10 schermate chiave (il bug «Gioca →» era visibile a occhio da mesi).
24. Estendere il gate copyright: stadi + allenatori + scan combinatorio nome+cognome (CR-1) e bloccare la CI store.
25. Fingerprint del run-summary in trend (il campo esiste: memorizzarlo tra run CI).
26. Config di bilanciamento estratta in tabella dati unica (λ, soglie premi, curve età) — oggi 60+ magic number sparsi.
27. Schema JSONSchema del save + validazione in import/export.
28. Versionare le migration in mappa `{v7:fn, v8:fn}` invece del blocco monolitico da 281 righe.
29. Error boundary per-schermata (oggi solo globale) con recovery mirato.
30. Telemetria opt-in degli errori (contatore locale + export nel report bug).
31. Bus eventi unico per notify/toast (oggi 15 notify dentro logica di dominio).
32. Tipizzare `player` con JSDoc typedef completo (autocomplete + check senza build step).
33. Estrarre i testi in tabella i18n-ready (oggi stringhe hardcoded ovunque).
34. Split del file sorgente in moduli con build-step di concatenazione (runtime resta single-file).
35. Precompilare il JSX anche per il dev (Babel runtime solo come fallback): −3,8s di avvio web.
36. requestIdleCallback per l'autosave (oggi debounce 600ms su ogni change).
37. Web worker per le simulazioni di lega (updateStandings fuori dal main thread).
38. InstancedMesh per TUTTA la folla LOD1 (oggi solo prime file).
39. Texture atlas per i badge club (oggi canvas per-club).
40. Pool di materiali riusabili per i kit GLB (riduce compile shader al primo match).
41. `renderer.info` nel perf-monitor (draw call e triangoli in CI, non solo FPS).
42. Cap dinamico della qualità (DPR/ombre) da FPS misurato sul device.
43. LMQP Replay Engine: persistere seed+scelte di un match per riprodurlo (fondazioni già in timeline).
44. Semantic validator della cronaca (testo↔stato: estendere bg-coherence al runtime).
45. Lint custom: vietare `Math.random` nei file-range di dominio (enforcement di ARC-6).
46. Budget bundle in CI (peso dist con soglia).
47. CI: eseguire anche `validate-dist` + `audit-copyright` su ogni push main (oggi solo gate).
48. Feature flag centralizzati (oggi 8 query-param sparsi con regex duplicate).
49. Documentare le API test (`__CPM_*`) in un README del gate.
50. ADR (architecture decision record) leggero per le decisioni PO vincolanti (training auto, niente pista, ecc.) — oggi vivono solo in CLAUDE.md.

---

## 7. TOP 50 MIGLIORIE UX/UI

1. Fix contrasto CTA «Gioca →» (bug spread in `Btn` — 1 riga).
2. Badge versione: nasconderlo su mobile in gioco (o spostarlo nel menu impostazioni).
3. Fix label modulo avversario su pannello scuro (colore chiaro).
4. Touch target ≥44px: pausa, chip leghe, salva, sub-tab, ATTIVA, elimina, frecce avatar.
5. Pacing partita: comprimere la cronaca passiva (target 2-2,5 min) o slider velocità ×1/×2/×4.
6. Tap-to-skip della cronaca BG (oggi solo skip totale da tastiera, nascosto ai touch).
7. Stacco nero d'inizio match: vignetta con logo/stemma invece del nero pieno.
8. Overlay esito: sfondo scuro semi-trasparente dietro il testo grande (leggibilità sul cielo).
9. Nomi squadra HUD: abbreviazioni intelligenti invece del troncamento «Selezione …».
10. Forma pre-match «–» quando non ci sono partite (mai L-L-L-L-L a W1).
11. Formati numerici unificati (€ it-IT ovunque; mai «9,000€» e «€468k» insieme).
12. «0anni» → «Ultimo anno» con stile warning dedicato.
13. Onboarding match sul touch: 3 tooltip one-shot su pad/azioni/energia (il contatore esiste già).
14. Hint tastiera solo su desktop (nascondere «[Enter]» sul touch).
15. Affordance di scroll sulle righe orizzontali (fade + freccia sui chip leghe/avatar).
16. Empty-state con CTA: «Coppe — il torneo parte dalla W9» invece del solo testo.
17. Modale conferma su azioni irreversibili (elimina slot, accetta trasferimento, forza rientro).
18. Indicatore di salvataggio effettivo (toast «salvato» dopo flush, non solo timestamp).
19. Home: griglia slot uniforme (lo slot pieno oggi è compresso).
20. Settimana corrente sempre visibile nell'header carriera (oggi solo nel sub-header stagione).
21. Calendario: filtro competizione + colori per tipo gara (lega/coppa/Europa già parziale).
22. Classifica: evidenziare zone (titolo/Europa/retrocessione) con legenda compatta — già parziale, estendere alle leghe estere.
23. Tab «Marcatori» in classifica (dipende dalla miglioria realismo #11).
24. Bacheca trofei visuale (grid di coppe con anno, oggi lista testuale).
25. Timeline di carriera (grafico OVR/valore per stagione nel profilo).
26. Notifiche raggruppate: oggi 3-5 toast in sequenza a fine settimana si sovrappongono.
27. Il diario merita un tab dedicato con filtri (oggi sepolto nel profilo).
28. Ricerca/ordinamento nella cronologia partite.
29. Contratto: countdown visivo «scade tra N stagioni» con warning progressivo.
30. Patrimonio: grafico entrate/uscite settimanali (oggi solo saldo).
31. Agente: mostrare CHIARAMENTE il 10% settimanale trattenuto (oggi implicito).
32. Mercato: lista offerte ricevute/rifiutate della stagione (offerHistory esiste già nei dati).
33. Panchina: esperienza dedicata (vista riscaldamento, ordine del mister) — la meccanica c'è, manca la scena.
34. Rigori: animazione portiere sincronizzata alla direzione scelta (feedback del duello).
35. Replay del gol (la scena 3D lo consente: rewind 3s con angolo alternativo).
36. Impostazioni: pagina unica per flag grafici (GLB, qualità, velocità cronaca) oggi solo query-param.
37. Modalità daltonici per le fasce colore azioni (verde/rosso → pattern+icone).
38. Scala font accessibile (rispettare prefers-reduced-motion e font-size OS su mobile).
39. Feedback aptico su mobile (gol, cartellino, fischio) via Vibration API.
40. Safe-area iOS/Android per la tab-bar (notch/gesture bar).
41. Loading: skeleton della dashboard invece dello spinner globale al boot.
42. Transizione salvataggio→carriera senza flash bianco.
43. Wordmark «elevoRA» del banner sostegno: allineamento e a-capo del «di» orfano.
44. «Tattica deterministica (AI non disponibile)» → linguaggio utente («Analisi del mister»).
45. Bottone «Parla col Mister»: stato disabled con motivo quando non disponibile.
46. Chip energia in hl_choose: aggiungere trend (freccia giù se sotto 30).
47. Cronaca: distinguere visivamente eventi chiave (gol/rosso) con card più grandi.
48. Momentum: legenda one-shot al primo match («la barra spinge le tue probabilità»).
49. Ridurre la densità della MatchdayCard desktop (metà inferiore vuota, contenuto compresso in alto).
50. Coerenza lingua: eliminare i resti EN («LVL» nell'OvrRing, «Selezione») in favore dell'italiano.

---

## 8. ROADMAP CONSIGLIATA

### Quick Wins (1 sprint, rischio ~zero, valore alto)
1. Fix CTA «Gioca →» + label modulo + badge versione mobile (3 fix UI da poche righe).
2. Reset `active` di euroMondiale/nationsCup (2 righe) → tornei ricorrenti.
3. Bonus rinnovo agente applicato in `_acceptNegoWage` (1 riga).
4. `shots` incrementato in handleAction (1 riga).
5. Cooldown rinnovi (1 flag stagionale) + check fondi sugli eventi bank.
6. Notifica «Ai quarti!» corretta in attesa dei veri quarti.
7. Trigger mister/intervallo a soglia `>=` con flag (pattern halfFiredRef).
8. `windowOfferUsed` reset stagionale + id impulso duplicato + dedup pool nomi.

### Sprint 1 — «Store-ready» (il blocco CRITICO)
- Gate copyright esteso (stadi+coach+combinazioni) in CI bloccante.
- Bonifica dati: pool stadi segmentati per nazione + rimappa `CLUB_STADIUMS` (19 chiavi + `mon`), COACH_NAMES di fantasia, cognomi distintivi rimossi dai pool, top-20 club rinominati, «Paris FC»/«AC Roma» corretti, pool 🇧🇷/🇦🇷.
- Rendere il badge PROD invisibile in produzione.

### Sprint 2 — «Il calcio torna calcio» (calibrazione + competizioni)
- λ +0,25 e gerarchia prestigio più ripida (validati con la batteria di questo audit come baseline CI).
- Quarti europei per club; clamp W38 sui KO; prima stagione pro con coppe.
- Rigori KO col minigame reale (o probabilità stat-based); scorer leaderboard live derivata.
- CATENA: riusare selectContextualSituations + avanzamento clock.

### Sprint 3 — «Contratti e mercato onesti»
- Svincolato senza stipendio/presenze; contratto-madre persistente nei prestiti (parentContract); blocco rinnovo in prestito; counter agente probabilistico; finestre reali (chiudere BIL-6); rendita investimento; sink economici (2-3 nuovi); agente licenziabile.
- Eventi: cond su week/proStatus mancanti + anti-repeat sugli altri 2 pool.

### Refactoring (parallelo, dietro la suite di non-regressione carriera)
- Estrazione logica pura dagli updater (advanceWeek → seasonEnd → post-match), onMatchEnd transazionale, migration versionata + guard, dead code via (~700 righe), catch con warn.

### Ottimizzazioni
- Precompilazione JSX del web (−3,8s avvio), worker per updateStandings, atlas badge, renderer.info nel perf-monitor, budget bundle CI.

### Rifinitura finale (pre-lancio)
- Pacing partita + skip touch + stacchi con vignetta; touch target; formati numerici; safe-area; audio minimo (ambience+boato); onboarding touch; bacheca trofei; POTM.

---

## 9. AREE NON SUFFICIENTEMENTE TESTABILI (dichiarazione esplicita)

| Area | Perché non testata a fondo | Strumento necessario |
|---|---|---|
| Carriera 100 stagioni end-to-end | la logica vive in updater React non esposti; l'unico driver è l'UI reale (minuti/stagione) | hook test-only `cpmSimulateSeason(n)` che attraversa la VERA advanceWeek (§6.19) |
| Panchina/coachDecision su lunga carriera | richiede stati di trust/forma costruiti in molte stagioni | stesso harness carriera |
| Feel del 3D (animazioni, camera, GLB) | il gate cattura frame; il giudizio resta umano | collaudo dal vivo + AI Vision (esiste, provider-based) su sequenze |
| Audio | assente nel prodotto | n/d (feature da costruire) |
| Performance su device mobile reale | l'ambiente cloud è headless software-rendered (FPS 6,8 non indicativo) | device farm fisica o BrowserStack con `perf-monitor` |
| Multi-slot concorrenti / storage quota reale su WebView Android | ambiente cloud ≠ WebView Capacitor | build AAB su device (BLK-3: serve SDK Android locale) |

## 10. REGRESSION ANALYSIS (cosa risulta SANO, verificato)

Confermati chiusi e stabili sotto stress: BLK-1 (soft-lock tick), MOT-1/2/3/4 (microsim, momentum attuatore, risultato speculare, intervallo), BUG-6/ARC-6 (determinismo classifiche: 300/300 stagioni GF=GA, 14 call-site seedati), ARC-3 (timer/dispose: 0 leak misurato su match reali consecutivi), ARC-4 (boot robusto, flush presente), ARC-5 (store gating effettivo, con 2 residui estetici), BUG-4 (dispose 3D copre anche i sistemi post-5.75), M1/M3 (coerenza esito: timeline 100% coerente nei match reali), 5.93 BIL-7 (repair coppe verificato nei 2 scenari), MVP 5.93 (candidati = veri marcatori), fix «curva bianca», golden/determinismo (2 run indipendenti identiche senza monkey-patch). Il quality gate 14/14 resta verde su questa build. **Nessuna regressione rilevata rispetto al ciclo 5.75→5.94.**

---
*Report generato da audit multi-agente con esecuzione reale (~305.000 partite simulate, 52 screenshot, 2 match reali completi, 100 cicli di migrazione). Nessun file di gioco modificato.*
