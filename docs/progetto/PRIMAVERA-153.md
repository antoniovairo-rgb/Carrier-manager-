# PRIMAVERA-153 — La Primavera come corsa verso la prima squadra

**Giro 153 · progetto (nessuna modifica a `src/`, al file di gioco o ai guardiani) · richiesta PO-356 del 10/11/2026**

> «L'anno della primavera è troppo limitante, non vorrei che i player si annoino alla prima stagione.»
> Il PO ha scelto **tutte e quattro** le idee proposte. Decisione: **«Progetto prima, poi 191»**.

Questo documento **non decide** le questioni del PO: dove serve una scelta (numeri, gusto) ci sono le
opzioni e quella consigliata, e in fondo l'elenco delle domande aperte (§14).

Base del codice misurato: `GAME_VERSION 7.999.189`, `SAVE_VERSION 9` (ramo `lavoro/189`, commit `0d4915e`).

---

## 0. Tabella riassuntiva per il PO

| # | Idea | Cosa vede il giocatore | Cosa c'è già da riusare | Cosa serve di nuovo | Rischio per la carriera | Giri stimati |
|---|---|---|---|---|---|---|
| **F** | *Fondamenta*: «Indice Primavera» (IP) | Barra «Corsa alla prima squadra» sulla home | voti in `matchHistory`, forma, fiducia, OVR | una funzione pura `indicePrimavera(p)`, nessun campo salvato | basso (sola lettura) | 1 |
| **1** | Chiamate in prima squadra | Telefonata del mister della prima squadra → panchina → debutto nel finale (gioco dal vivo) | `LiveMatch` con `benchStart`/`entryMinute`, `calcCoachDecision`, calendario senior deterministico (`legaDopoTrasferimento212`) | voce di calendario `type:"prima_squadra"`, blocco `p.ps153` | **alto** (calendario, classifiche, conteggi di lega) | 3 |
| **2** | Salto a gennaio | Nelle settimane 19-23, con IP alto: «Il club ti promuove in prima squadra» o offerta esterna, accetti o resti | `acceptTransfer` (già porta un U18 a pro a metà stagione, `proSeason` 7.435), `seasonCarry` con lega (7.336), finestra W19-23 | un chokepoint deterministico che sostituisce il tiro casuale di oggi | **alto** (cambio di club a stagione in corso) | 2 |
| **3** | Primavera più corta | Pulsante «Vai al prossimo momento importante» che salta le settimane senza scelte | `simulateAndAdvance`/`doAdvanceWeek` (i tre percorsi veri) | solo un ciclo con condizioni di arresto | medio (tri-path) | 1 |
| **4** | Obiettivi e tornei giovanili | Obiettivi Primavera sulla home · torneo europeo giovanile (girone + finali) · Nazionale Under 19 nelle soste | premi Primavera a fine stagione (capocannoniere/campione, `src/18` r.4514+), macchina coppa (`type:"cup"`), finestre-sosta (`natFinestre155`), `NAT_CLUB_DATA`, lobby convocazione | tipi di calendario `youth_euro`, `u19`; contatori separati dalle presenze senior | **alto** per i tornei (calendario + nazionale), basso per gli obiettivi | 3 + 2 |

**Ordine consigliato (§11):** F → 3 → 4a (obiettivi) → 1 → 2 → 4c (Under 19) → 4b (torneo europeo).
Totale stimato: **12-13 giri**, tutti in area carriera ⇒ **catena completa** a ogni rilascio.

---

## 1. Come è oggi la prima stagione — misure

### 1.1 Strumento

Sonda nuova **`tests/visual/primavera-misura-153.mjs`** (non guardiano, non gate). Gioca una stagione
Primavera intera sugli handler veri (`window.__CPM_CAREER.step()` → `liveCurrentWeek` /
`simulateAndAdvance` / `doAdvanceWeek`) con un salvataggio sintetico (AC Dorvelli Primavera, Primavera 1,
attaccante, tre profili OVR 58/66/74), registra ogni settimana il riquadro settimanale (testo e numero di
pulsanti, letto da `[data-cpm="settimana23"]`), la giornata, le saghe di mercato, e a fine stagione le
offerte di `generateProContracts`. Risultati in `tests/visual/out/primavera-153.json` (non versionato).

```bash
cd tests/visual
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node primavera-misura-153.mjs 58 66 74
```

⚠️ Limiti dichiarati della sonda: le partite sono **simulate** (percorso «Simula»), non giocate dal vivo;
i riquadri vengono **chiusi senza scegliere** (`dismiss`), quindi gli effetti delle scelte non entrano;
un solo campione per profilo; il mercato oggi usa `Math.random()` non seedato (§1.4), quindi quel
numero varia fra esecuzioni.

### 1.2 Calendario e ritmo

| Grandezza | Valore misurato | Fonte |
|---|---|---|
| Squadre in Primavera 1 / Primavera 2 | 18 / 18 (club di Lega A / Lega B con suffisso «Primavera») | `src/02` r.295-301 |
| Giornate di campionato | **34** (andata e ritorno speculari) | sonda, tutti e tre i profili |
| Settimane della stagione | **39** vissute (1-38 + una settimana 39 senza partita prima della schermata di fine Under 18) | sonda; `src/18` r.4514 (`weekVal>38`) |
| Settimane senza partita | 9 · 19 · 28 · 35 (soste `_CAL_BREAKS`) + 39 | sonda; `src/09` r.1098 |
| Altre competizioni per il Primavera | **nessuna**: niente Coppa (`cup` assente), niente Nazionale (`_tryNatCallup` richiede `!isInU18`, `src/18` r.4400), niente Coppa Nazioni/Europeo (r.4630-4655, tutte `!isInU18`) | sonda (`nat`/`em`/`cup` mai attivi) + codice |
| Partite giocabili dal vivo | 34 (solo campionato) | idem |
| Riquadro settimanale | 38 settimane su 39 ne hanno uno: **30 impulsi con scelta**, 7 eventi senza scelta, 1 momento di spogliatoio | sonda, profilo OVR 66 |
| Pulsanti nel riquadro | 1 pulsante: 7 · 2 pulsanti: 29 · 3 pulsanti: 2 | idem |
| Righe nuove nel registro (`log`) in tutta la stagione | 1-2 (procuratore a W1, eventuale saga di mercato) | sonda |

Lettura: la stagione Primavera è **34 partite uguali** (stesso campionato, stesso tipo di posta) più un
riquadro a settimana. Nessun «secondo binario» (coppa, nazionale, prima squadra) esiste prima della
settimana 39.

### 1.3 Tempo reale stimato per completarla a 1x

⚠️ **Stima derivata, non misurata sul telefono.** Componenti:
- tick della partita `MATCH_TICK_MS` = 1700 ms per minuto di gioco (CLAUDE.md, verificato 12/10) → 90'
  di gioco fluido ≈ **153 s**;
- tempo negli highlight (cronometro fermo): misurato 7.494-7.500 al vecchio tick da 900 ms ≈ 31% di
  111 s ≈ **34 s** a partita, che non dipende dal tick;
- quindi ≈ **3,1 min a partita a 1x** (≈ 1,9 min a 2x), **più** pre-partita, formazioni, ingresso in
  campo e dopo-partita, che **non ho misurato**.

| Modo di giocare | 34 partite | + 39 riquadri (stima 10-20 s l'uno) | Totale |
|---|---|---|---|
| Tutte dal vivo a 1x | ≈ 105 min | ≈ 7-13 min | **≈ 1 h 55 – 2 h** (più i pre-partita) |
| Tutte dal vivo a 2x | ≈ 65 min | ≈ 7-13 min | **≈ 1 h 15** |
| Tutte simulate | pochi secondi | ≈ 7-13 min | **≈ 10-15 min** |

Non posso confermare quanti giocatori scelgano l'una o l'altra strada: il gioco non registra questa
statistica.

### 1.4 Mercato durante la Primavera — asimmetria trovata

Oggi un giocatore della Primavera **può** ricevere un'offerta a stagione in corso, ma solo per un
percorso:
- il blocco mercato dentro `doAdvanceWeek` (`src/18` r.4792-4818) **non** esclude l'Under 18;
- l'effetto «market-pulse» che copre le settimane chiuse dagli altri due percorsi esce subito per
  l'Under 18 (`if((player.proStatus||"u18")!=="pro")return;`, `src/18` r.1318).

Le settimane avanzate da `doAdvanceWeek` sono quelle **senza partita**; nella finestra invernale (19-23)
è solo la **19**. Quindi oggi il «salto a gennaio» esiste come **un solo tiro di dado** a ~12-15%
(`offerProb`, `Math.random()` non seedato), non legato al rendimento in Primavera, sempre verso un club
**esterno** (`generateTransferOffer`), mai verso la prima squadra del proprio club. Nella sonda: 1 saga
su 3 profili (OVR 58, FC Morbihan, settimana 20).
⚠️ La misura è sul percorso simulato; sul percorso dal vivo (`onMatchEnd`) **non l'ho verificata**.
Questo progetto **non la corregge** (giro di progetto); l'idea 2 la sostituisce con una regola unica.

### 1.5 Fine stagione — misurato

| Profilo | Piazzamento | Gol/partite | OVR inizio → fine | `perf` | Offerte di `generateProContracts` |
|---|---|---|---|---|---|
| OVR 58 | 4° | 3 / 34 | 58 → 63 | 7,3 | prima squadra **non confermato** (`isNonConfirmed`, «Aggregato alla rosa»), esterna, club minore, resta in Under 18 |
| OVR 66 | 1°-3° (due esecuzioni) | 4-5 / 33-34 | 66 → 70-71 | 8,7-9,3 | **primo contratto** col club madre, esterna, club minore, resta |
| OVR 74 | 6° | 15 / 33 | 74 → 79 | 10 (tetto) | primo contratto, esterna, club minore, resta |

Regole che producono questo (`src/06` r.729-793):
- primo contratto in prima squadra se `ovr ≥ 64` **e** `perf ≥ 3,5`, con
  `perf = min(10, gol·0,35 + presenze·0,12 + (ovr−50)/6)` → con 34 presenze `perf` vale già ≥ 4 a
  prescindere dai gol: **il cancello vero è l'OVR 64**;
- offerta esterna se `perf > 2` (sempre, di fatto);
- «Resta in Under 18» finché `u18Seasons < 2`; alla seconda stagione si deve uscire (`forced`);
- premi Primavera (`src/18` r.4519-4526): capocannoniere se `gol ≥ 8` **e** `gol/presenze ≥ 0,55`;
  campione se primo in classifica. Il profilo OVR 74 con 15 gol in 33 gare (0,45) **non** è
  capocannoniere per la regola del rapporto.

Lettura: il rendimento in Primavera pesa poco su ciò che succede dopo — decide quasi tutto l'OVR, e
l'OVR cresce di +5 in una stagione per tutti i profili misurati.

---

## 2. Cosa esiste già e si può riusare

| Pezzo | Dove | Uso nel progetto |
|---|---|---|
| `generateSeasonCalendar(club, lega, seme)` | `src/09` r.1099 | calendario della prima squadra **deterministico**: è la sorgente delle partite di convocazione (idea 1) |
| `legaDopoTrasferimento212(p, club, ov)` | `src/09` r.1623 | ricostruisce calendario e classifica della lega senior a stagione in corso (seme `(s·7919+s²·31)+hashStr(club.id)·17`, risultati passati da hash): **è ciò che rende coerente il salto a gennaio** (idea 2) — va esteso per rispettare le partite che l'eroe ha davvero giocato da convocato |
| `acceptTransfer` | `src/18` r.5828 | porta già un Under 18 a professionista a metà stagione (`proStatus:"pro"`, `proSeason` 7.435, `seasonCarry` con `lgName` 7.336: i gol di Primavera **non** finiscono nella lega senior) |
| `generateProContracts` | `src/06` r.729 | offerte seedate (7.262) — schema da riusare per la promozione di gennaio |
| `generateTransferOffer` | `src/06` r.660 | offerta esterna (filtri prestigio/credibilità) |
| `LiveMatch` con `benchStart` + `entryMinute` | `src/15` r.1820-2249 | panchina e subentro già giocabili: è il **debutto a fine partita** |
| `calcCoachDecision` | `src/08` r.352 | logistica seedata titolare/panchina (PO-156) — modello per la decisione «convocato / non convocato» |
| Finestre-sosta `natFinestre155` | `src/18` r.2484 | settimane 9·19·28·35: le soste sono le finestre della Nazionale Under 19 (idea 4c) |
| Lobby convocazione nazionale (`nationalCallupData`, `startNationalMatch`, contesto `national`) | `src/18` r.1132 | schermata e partita dell'Under 19 |
| `NAT_CLUB_DATA` | `src/17` r.812 | nazioni con bandiere e colori → avversarie Under 19 |
| Macchina della coppa (`type:"cup"`, `matchday` 990+turno, avanzamento turni) | `src/18` r.3409-3419, `src/17` r.2316 | modello del torneo europeo giovanile (idea 4b) |
| Premi Primavera a fine stagione | `src/18` r.4519-4526 | base degli obiettivi Primavera (idea 4a) |
| Saghe a episodi (`sagas`, `forceSaga`) | `src/18` r.~2897 («Il ragazzo della Primavera», ma è una saga **da professionista**, `once:"career"`) | forma narrativa per «la telefonata del mister» |
| `generateSeasonObjectives` | `src/06` r.795 (chiamata anche alla creazione, `src/17` r.2436) | obiettivi di stagione — da affiancare con quelli Primavera |

---

## 3. Fondamenta comuni: l'Indice Primavera (IP)

Tutte e quattro le idee leggono **lo stesso numero**, così si combinano senza regole duplicate.

`indicePrimavera(p)` — funzione **pura**, nessun campo salvato, valore 0-100:

| Componente | Peso | Normalizzazione |
|---|---|---|
| Voto medio delle ultime 5 partite di Primavera (`matchHistory`, solo lega) | 35% | 5,0 → 0 · 8,0 → 100 |
| Contributo: (gol + assist·0,6) / partita, ultime 10 | 25% | ruolo-dipendente: ATT 0,7 → 100 · CEN 0,45 · DIF 0,2 |
| Forma | 15% | `form` 30 → 0 · 95 → 100 (come `calcCoachDecision`) |
| Fiducia del mister | 15% | `coachTrust` 0-100 |
| OVR rispetto al livello della prima squadra | 10% | `ovr − (prestigio club madre − 20)`, −10 → 0 · +10 → 100 |

- Cancello minimo: **almeno 6 partite di Primavera** giocate nella stagione (prima non si giudica).
- Valore mostrato al giocatore: una barra a 5 tacche («Ti stanno guardando» → «La prima squadra ti
  aspetta»), **mai il numero**.
- I pesi sono una proposta: vanno **tarati con la sonda** (§12) sui tre profili prima di fissarli.

Tutte le probabilità di questo documento si estraggono come in PO-156:
`u = (|hashStr("ps153|<regola>|" + nome + "|" + stagione + "|" + settimana)| % 1000) / 1000`
→ stessa partita, stessa scelta, su ogni percorso (prompt, simulazione, banco) e dopo un ricarico.
**Mai `Math.random()`** in queste regole.

---

## 4. Idea 1 — Chiamate in prima squadra

### 4.1 Regola

**Quando si valuta.** All'arrivo in ogni settimana con giornata di Primavera, dalla 8 alla 36, in un
**chokepoint unico** chiamato dai tre percorsi settimana (stessa forma di `weeklyEconomyFields`) — mai in
un percorso solo (classe STAB).

**Condizioni.** `proStatus==="u18"` · nessun infortunio · non svincolato · IP ≥ soglia di chiamata ·
al massimo una chiamata ogni 2 settimane · tetto stagionale.

**Probabilità.** `P = 1/(1+exp(−(IP − centro)/6))` estratta con `u` della §3.

| Parametro | Opzione A (prudente) | **Opzione B (consigliata)** | Opzione C (generosa) |
|---|---|---|---|
| soglia IP | 72 | **65** | 58 |
| centro della logistica | 80 | **75** | 70 |
| tetto chiamate a stagione | 4 | **6** | 10 |
| bersaglio (da tarare): prima chiamata entro la sett. 20 | OVR 74: ~60% · OVR 66: ~15% | **OVR 74: ~85% · OVR 66: ~40% · OVR 58: ≤10%** | OVR 66: ~70% |

I bersagli sono **obiettivi di taratura**, non misure: oggi IP non esiste.

**Partita.** La convocazione **non** inventa un avversario: prende la giornata di quella settimana dal
calendario **deterministico** della prima squadra (`generateSeasonCalendar` con lo **stesso seme** di
`legaDopoTrasferimento212` sul club madre senior). Così, se poi l'eroe salta in prima squadra a gennaio
(idea 2), la partita in cui ha debuttato **c'è** nel calendario ricostruito, con lo stesso avversario,
la stessa sede e — con l'estensione di §6.3 — lo stesso risultato.

**Ruolo in partita** (seedato, `u` dedicato):

| Esito | Probabilità proposta | Cosa succede |
|---|---|---|
| Solo panchina, non entra | 35% | la partita si **simula** (non è la partita dell'eroe) e si racconta in un riquadro |
| Entra nel finale | 55% | `LiveMatch` con `benchStart:true`, `entryMinute` 70-88 seedato |
| Entra prima (infortunio di un titolare) | 10% | `entryMinute` 46-69 |

Dopo il **debutto** (prima volta in campo) le chiamate successive spostano le probabilità verso
«entra» (+15 punti) se il voto del debutto è ≥ 6,5.

### 4.2 Cosa succede alla Primavera quella settimana

Due opzioni, **scelta del PO**:
- **A (consigliata) — la convocazione sostituisce la Primavera.** Una partita a settimana, come oggi.
  La gara di Primavera di quella settimana si **simula senza l'eroe** con il seme della Simula
  (classifica Primavera vera, nessuna gara saltata). Motivo: rispetta l'invariante «una sola gara di lega
  giocata per settimana» (`getThisWeekMatchday`, 7.5.2) e non aggiunge tempo alla stagione.
- **B — entrambe.** Sabato Primavera, domenica prima squadra: due partite nella stessa settimana.
  Più calcio, ma +3 min reali a convocazione e due voci nella stessa settimana da gestire nelle guardie
  anti-doppione.

La regola «ogni competizione è giocabile» resta vera in entrambe: la partita di Primavera simulata in A
**non è la partita dell'eroe** (lui è con la prima squadra), come oggi per una gara saltata per
infortunio.

### 4.3 Cosa vede il giocatore (testi proposti)

1. **Riquadro della settimana** (finestra standard, non chiudibile senza scelta):
   «📞 *Ti chiama il mister della prima squadra.* "Domenica vieni con noi a {Avversario}. Porta gli
   scarpini, non si sa mai." — Rispondi: «Sono pronto» · «Grazie mister, darò tutto»» (scelte di tono,
   effetti piccoli su morale/fiducia).
2. **Pre-partita**: testata «PRIMA SQUADRA · {Lega A} · Giornata N» con la maglia del club madre (non
   quella della Primavera), stato «In panchina».
3. **Partita** dal vivo con il subentro già esistente («Tieniti pronto, il mister ti chiamerà»).
4. **Dopo**: diario «🌟 Esordio in prima squadra: {Avversario}, {minuti}'» (capitolo una tantum) e, se
   segna, «Il primo gol tra i grandi».
5. **Home**: la barra «Corsa alla prima squadra» mostra «Convocazioni 2 · Presenze 1 · Gol 0».

### 4.4 Effetti

| Effetto | Proposta |
|---|---|
| Crescita | `growthBoost` +5% fino a fine stagione dal debutto (non cumulabile) |
| Popolarità / morale | +4 / +5 al debutto, +3 / +3 al primo gol |
| Fiducia del mister della Primavera | invariata (lui ti ha lanciato) |
| Contratto | **nessuno** finché non c'è il salto (idea 2) o la fine stagione |
| Conteggi | **separati** (§9): presenze/gol in prima squadra non entrano in `goals`/`matches` della Primavera, né nella classifica Primavera |
| Fine stagione | `generateProContracts`: ogni presenza in prima squadra alza `perf` (+0,6) e una o più presenze sbloccano il «Primo contratto» anche con OVR 62-63 (opzione, §14 D13) |

---

## 5. Idea 3 — Primavera più corta

Tre strade, misurate contro la §1.2.

| Opzione | Cosa fa | Effetto sul tempo | Rischio | Giudizio |
|---|---|---|---|---|
| **A — «Vai al prossimo momento importante» (consigliata)** | un tocco avanza settimana dopo settimana sui **percorsi veri** (`liveCurrentWeek` → `simulateAndAdvance`/`doAdvanceWeek`) finché non arriva un **arresto** | con tutte le partite simulate: da 39 conferme a ~8-12 tocchi; chi vuole giocare dal vivo si ferma sulle partite che sceglie | medio: è un ciclo sui tre percorsi, va coperto dal tri-path e da `double-tap` | consigliata |
| B — «Partite chiave» | all'inizio della stagione il giocatore sceglie «gioca dal vivo solo derby, scontri diretti e convocazioni»; le altre si simulano da sole con l'opzione A | stagione dal vivo ≈ 8-12 partite ≈ 30-40 min a 1x | medio | da aggiungere sopra A se il PO vuole |
| C — Girone ridotto (es. 12 squadre, 22 giornate) | meno partite vere | −35% partite | **alto**: cambia le leghe Primavera, il calendario e la classifica a 18 righe che i guardiani carriera danno per scontata; la stagione resta comunque di 38 settimane (mercato, soste, Nazionali sono agganciati alla settimana) | **sconsigliata** |

**Arresti dell'opzione A** (sempre, nell'ordine): partita che il giocatore ha segnato «da giocare dal
vivo» · riquadro con una scelta (impulso, spogliatoio, saga) · chiamata in prima squadra · finestra di
mercato con offerta · convocazione Under 19 · partita del torneo giovanile · infortunio · obiettivo
raggiunto · fine stagione. Le settimane «tranquille» (riquadro senza scelta + partita da simulare) passano
da sole e finiscono in un **riepilogo** («Tre settimane: 2 vittorie, 1 pareggio, 1 gol. Il mister: "Bene
così."»).

Misura attesa (da confermare con la sonda): sul profilo OVR 66 i riquadri **senza scelta** sono 7 su 38 e
le soste 5, quindi senza toccare gli impulsi il risparmio è piccolo; il guadagno vero arriva se gli
impulsi di routine **non** fermano il ciclo (domanda al PO, §13 D5).

Disponibilità: **solo in Primavera** o **sempre** — scelta del PO (consigliata: solo Primavera al primo
rilascio, poi si misura).

---

## 6. Idea 2 — Salto a gennaio

### 6.1 Regola

**Quando.** Arrivo nella settimana 19 (apertura della finestra invernale), valutazione **una volta**, nel
chokepoint unico di §4.1. Una seconda occasione alla 22 solo se nel frattempo c'è stato un debutto.

**Condizioni e uscite** (seedate):

| Condizione | Esito proposto |
|---|---|
| IP ≥ 82 **e** almeno 1 presenza in prima squadra | **Promozione**: il club madre ti offre il primo contratto (stessi numeri di `generateProContracts`, `contractType:"Promosso in prima squadra"`) |
| IP ≥ 78 senza presenze, oppure OVR ≥ prestigio club madre − 8 | **Offerta esterna** (club senior compatibile, `generateTransferOffer` con tetto prestigio della prima stagione) |
| IP 70-77 | solo «voci» (saga a episodi senza offerta) — tiene viva la corsa |
| sotto | niente |

**Probabilità** di ciascuna uscita: `P` logistica sull'IP con `u` dedicato; bersagli proposti da tarare:
OVR 74 ~45% di salto · OVR 66 ~10% · OVR 58 ~0%.
Opzione PO sul **tetto**: salto possibile solo verso la prima squadra del club madre (più «storia»), o
anche verso club esterni (più libertà) — consigliata: **entrambi**, con la promozione mostrata per prima.

### 6.2 Cosa vede il giocatore

- Settimana 19: «📩 Mercato di gennaio — Il direttore sportivo: "Il mister della prima squadra ti vuole
  con sé da subito. Ti offriamo il primo contratto."» con due pulsanti: **«Firmo, vado in prima squadra»**
  · **«Resto in Primavera fino a giugno»**.
- Se firma: schermata di presentazione già esistente del trasferimento, poi la home della lega senior con
  calendario e classifica **ricostruiti** (`legaDopoTrasferimento212`) e una riga «Con la Primavera: N
  presenze, G gol» (`seasonCarry`).
- Se resta: morale −2 (dispiacere breve), fiducia del mister della Primavera +4, la corsa continua (le
  chiamate restano possibili), e a giugno l'offerta del club madre è garantita se IP resta ≥ 75.

### 6.3 Coerenza — cosa va esteso

1. **Partite già giocate da convocato**: `legaDopoTrasferimento212` oggi assegna i risultati passati da
   hash (`_pastR74`). Va esteso: per le giornate presenti in `p.ps153.partite` usa il **risultato vero**.
   Senza questa estensione l'eroe vedrebbe in classifica una sconfitta nella partita che ha vinto col suo
   gol. È la regola «la classifica resta vera».
2. **Fine della stagione Primavera**: il blocco `isInU18&&weekVal>38` non scatta più (l'eroe è `pro`);
   serve una voce in `history` per la mezza stagione in Primavera (club «… Primavera», così
   `proCareerOf`/`_isYouthClubName` la scorporano dai totali da professionista) — **da verificare** che
   `acceptTransfer` la scriva già per l'Under 18 (non l'ho verificato).
3. **Classifica Primavera**: dopo il salto l'eroe non c'è più; la classifica Primavera non si aggiorna più
   (non è più la sua lega). I premi Primavera (capocannoniere/campione) **non** si assegnano a chi è
   uscito a gennaio — o sì, sui numeri fino a gennaio: scelta PO (consigliata: no, il premio è di chi
   finisce la stagione).
4. **Prestito**: un Under 18 non va in prestito (STAB-10, `src/06` r.715): il salto è sempre una firma
   definitiva. Non riaprire il prestito qui.
5. **Il tiro casuale di oggi** (§1.4) va **sostituito** da questa regola, non affiancato: altrimenti un
   Primavera avrebbe due mercati diversi a seconda del percorso.

---

## 7. Idea 4 — Obiettivi e tornei giovanili

### 7.1 (4a) Obiettivi della Primavera

Card «I tuoi traguardi in Primavera» sulla home (sostituisce, solo per l'Under 18, gli obiettivi di club
pensati per i professionisti — da verificare cosa mostra oggi `generateSeasonObjectives` a un Primavera).

| Traguardo | Regola | Premio proposto |
|---|---|---|
| Capocannoniere Primavera | primo nella classifica marcatori della Primavera (oggi la regola è `≥8 gol` **e** `≥0,55` a partita) | +5 popolarità, trofeo personale |
| Scudetto Primavera | primo in classifica | trofeo di squadra |
| Prima convocazione in prima squadra | idea 1 | capitolo di diario |
| Esordio / primo gol tra i grandi | idea 1 | capitolo + crescita |
| Convocato in Under 19 | idea 4c | capitolo |
| Vincere il torneo europeo giovanile | idea 4b | trofeo |

Opzione PO sul capocannoniere: **A** tenere la soglia del rapporto 0,55 (oggi il profilo con 15 gol in 33
gare non lo vince) · **B (consigliata)** «primo nella classifica marcatori» calcolata sugli stessi
marcatori generati per la lega, così il premio corrisponde a ciò che si vede in classifica.

### 7.2 (4b) Torneo europeo giovanile

Nome **inventato** (es. «Coppa Europea Giovani» o «Trofeo Continentale Under 19» — scelta PO); **niente
nomi reali** ⇒ `node tools/audit-copyright.mjs` a 0 riscontri prima del rilascio.

| Aspetto | Proposta |
|---|---|
| Chi partecipa | la Primavera dell'eroe se il club madre senior è da coppa europea (stessa regola di prestigio `_euTier287`: ≥ 71) — opzione PO: oppure le prime 2 della Primavera della stagione prima (per la stagione 1: per prestigio) |
| Formato | girone da 4 (3 gare di sola andata, sorteggio seedato fra Primavere di club stranieri) → semifinale → finale secca: **massimo 5 partite** |
| Settimane | girone 12 · 16 · 23, semifinale 31, finale 37 (settimane con giornata di Primavera: due gare in quella settimana come la coppa per i professionisti) — opzione: usare le soste (9 · 28 · 35) ma lì c'è l'Under 19 |
| Calendario | voci `type:"youth_euro"` con `matchday` riservato (come 990+turno della coppa) |
| Giocabilità | ogni partita **dal vivo** o simulata, come la coppa |
| Classifica | tabella di girone propria, **mai** nella classifica Primavera |

### 7.3 (4c) Nazionale Under 19

| Aspetto | Proposta |
|---|---|
| Finestre | le soste del calendario (9 · 19 · 28 · 35) — `natFinestre155`, già il punto in cui il CT decide per i professionisti |
| Convocazione | IP ≥ 70 **oppure** OVR ≥ soglia nazionale senior − 14; probabilità seedata; prima chiamata annunciata dal «selezionatore Under 19» |
| Partite | 1 per sosta (amichevole o qualificazione), avversaria da `NAT_CLUB_DATA` con forza ridotta; lobby e partita col flusso della Nazionale |
| Ciclo | stagione 1: 4 finestre = 4 partite massimo; opzione PO: «Europeo Under 19» a fine stagione (2-4 partite in più alle settimane 36-38) |
| Conteggi | **separati** dalle presenze senior: `nationalCaps`, `natHistory` e il capitolo «La prima maglia» (`natdebut`, `src/18` r.3153) restano dei **grandi** |

⚠️ È la parte più delicata: il flusso Nazionale scrive `nationalCaps`/`natHistory` e attiva capitoli e
tornei (Coppa Nazioni, Europeo/Mondiale). L'Under 19 deve usare un **contesto proprio** (`national_u19`) o
un flag che ogni scrittura rispetta; mai riusare il contesto `national` così com'è.

---

## 8. Come si combinano — il percorso tipo

```
Settimane 1-7    Primavera normale (l'IP si forma dalla 6ª partita)
Settimana 8+     IP sale ──► prima chiamata in prima squadra (idea 1) ──► debutto nel finale
Sosta 9          Under 19 se IP ≥ 70 (idea 4c)
Settimana 12-16  girone del torneo europeo giovanile (idea 4b)
Settimana 19     MERCATO DI GENNAIO (idea 2):
                   ├─ promozione in prima squadra → professionista da subito (la Primavera finisce qui)
                   ├─ offerta esterna             → idem, altro club
                   └─ resti                        → la corsa continua, offerta di giugno garantita se IP ≥ 75
Settimane 20-38  chiamate, Under 19 (28·35), semifinale e finale del torneo (31·37)
Fine stagione    traguardi Primavera (4a) + offerte di fine Under 18, con presenze in prima squadra che pesano
In tutto questo  «Vai al prossimo momento importante» (idea 3) salta le settimane tranquille
```

**Precedenze nella stessa settimana** (una sola cosa da giocare dal vivo per volta):
torneo europeo giovanile > chiamata in prima squadra > Primavera. In una settimana con partita del
torneo **non** si valuta la chiamata.

**Regole di esclusione**: dopo il salto (idea 2) finiscono 1, 4b, 4c (non si è più in Primavera) — scelta
PO per l'Under 19: un professionista di 18 anni può essere ancora Under 19 (consigliata: **sì**, finché
l'età lo permette e non è convocato con i grandi).

---

## 9. Salvataggio

**Un solo blocco nuovo, opzionale**, con il pattern già usato nel repo («campo nuovo opzionale, assente =
nulla di nuovo, nessun bump», es. `impMem` PO-154):

```js
p.ps153 = {
  s: 1,                         // stagione a cui si riferisce (scade da solo al cambio stagione)
  conv: [{w:12, md:7, esito:"in_campo", min:18, g:0, a:0, voto:6.6, ris:{h:2,a:1}}],
  partite: { 7:{h:2,a:1} },     // giornate senior giocate: le legge legaDopoTrasferimento212 (§6.3)
  debut: {s:1, w:12, opp:"…"} , // una volta per carriera
  u19: {caps:2, g:1, hist:[…]}, // contatori Under 19, separati dalla Nazionale senior
  ye: {fase:"girone", girone:[…], el:false, champ:false},  // torneo europeo giovanile
  salto: null | {w:19, tipo:"promozione"|"esterna", club:"…", rifiutato:false}
}
```

- **SAVE_VERSION**: la mia proposta è **non** alzarla (blocco opzionale: un salvataggio senza `ps153` si
  comporta come oggi). Va alzata (9 → 10) **solo** se il PO vuole riempire `ps153` per i salvataggi in
  Primavera a metà stagione (es. far partire subito la barra dell'IP): in quel caso migration nel
  `useEffect` di mount di `CareerApp`, `if(!('ps153' in newP)&&(newP.proStatus||"u18")==="u18"){…}`.
- **Calendario**: le voci nuove (`prima_squadra`, `youth_euro`, `u19`) hanno `type` esplicito e
  `matchday` riservato; un salvataggio di una versione vecchia che le ignora non deve trovarle come
  «gare di lega» (vedi §10).
- **Compatibilità all'indietro**: aprire con la versione nuova un salvataggio vecchio = nessun `ps153`,
  IP calcolato al volo dai dati che ci sono già. Aprire con una versione **vecchia** un salvataggio nuovo
  (rollback) = le voci con `type` sconosciuto devono essere ignorate; **da verificare** con `save-compat`.

---

## 10. Rischi per i guardiani della carriera

| Guardiano | Cosa può rompere | Mitigazione nel progetto |
|---|---|---|
| `tripath-chokepoint` | una regola (chiamata, salto, Under 19, ciclo dell'idea 3) messa in un solo percorso settimana | ogni regola in **un helper** chiamato dai tre percorsi; aggiungere l'helper a `REQUIRED` del guardiano (modifica del guardiano: giro di realizzazione, non questo) |
| `career-invariants` | classifica Primavera con gare in più, calendario con due voci per settimana, `standings` ≠ 18 | voci nuove sempre con `type`; mai `updateStandings` per partite non di lega; la Primavera simulata senza l'eroe (opzione 4.2-A) passa dal percorso della Simula |
| `career-critical` (`stale-matchday`, `playedmd-registry`, `playing-mdref`, `double-tap`, `recovery-competition`, `cup-final-replay`…) | il rilevatore di giornate stantie e il registro delle giornate trattano come «lega» le voci **senza** `type` — molte guardie usano `!m.type` o `!h.cup&&!h.euro&&!h.national` | voci e storico con flag espliciti; **censire con `grep` ogni filtro `!h.cup&&!h.euro&&!h.national`** (sono decine) e decidere voce per voce — è il lavoro più grosso e il rischio maggiore dell'idea 1 |
| `stab-nat-trigger` | l'Under 19 che attiva Coppa Nazioni/Europeo o scrive `nationalCaps` | contesto e contatori propri (§7.3); il trigger tornei senior resta `!isInU18` |
| `save-compat` / `replay` | salvataggi senza `ps153`, rollback con tipi di calendario sconosciuti | §9 |
| `career-sim-test` | due stagioni sugli handler veri: il salto a gennaio cambia lega a metà | aggiungere un profilo Primavera alla simulazione (giro di realizzazione) |
| `audit-copyright` | nome del torneo europeo e del selezionatore Under 19 | nomi inventati, audit a 0 |

---

## 11. Ordine di realizzazione, stima e catena

| Giro | Contenuto | Prova del rosso | Catena |
|---|---|---|---|
| 1 | **F**: `indicePrimavera` pura + barra sulla home + sonda di taratura (`primavera-misura-153` estesa con IP settimanale) | `__CPM_NO_IP153` (barra spenta) | completa |
| 2 | **3**: «Vai al prossimo momento importante» + riepilogo delle settimane tranquille | `__CPM_NO_SALTA153` | completa |
| 3 | **4a**: traguardi Primavera sulla home, regola del capocannoniere scelta dal PO | `__CPM_NO_OBJ153` | completa |
| 4-6 | **1**: censimento dei filtri «lega» (giro 4, solo misura) → convocazione e debutto (5) → effetti e conteggi separati, guardiano `prima-squadra-153` (6) | `__CPM_NO_CONV153` | completa |
| 7-8 | **2**: chokepoint del mercato Primavera che sostituisce il tiro casuale (7) → estensione di `legaDopoTrasferimento212` con i risultati veri + voce `history` (8), guardiano `salto-gennaio-153` | `__CPM_NO_SALTO153` | completa |
| 9-10 | **4c**: Under 19 nelle soste, contesto e contatori propri | `__CPM_NO_U19153` | completa + `stab-nat-trigger` |
| 11-13 | **4b**: torneo europeo giovanile (calendario, girone, finali, nome, audit) | `__CPM_NO_YE153` | completa + `audit-copyright` |

Totale **12-13 giri**. Tutto è area **carriera** ⇒ per la direttiva PO 22/09 **catena completa**
(`npm run ci` / `node ci-runner.mjs notte` per il rilascio delle 00), mai la catena grafica. Ogni giro: un
guardiano nuovo col suo braccio rosso, la riga di roadmap alla partenza, bump `GAME_VERSION` (non in
questo giro).

Perché quest'ordine: F e 3 sono a basso rischio e danno subito un effetto sulla noia misurata (§1.2);
4a dà obiettivi senza toccare il calendario; 1 e 2 sono la «corsa» vera ma toccano calendario, storico e
lega e vanno fatti con le fondamenta già misurate; 4c e 4b aggiungono partite e sono i più costosi.

---

## 12. Cosa misurare dopo (e con cosa)

| Domanda | Strumento | Bersaglio da far decidere al PO |
|---|---|---|
| Quando arriva la prima chiamata, per profilo | sonda estesa, 20 carriere seedate per profilo (nomi diversi: il seme nasce dal nome) | §4.1 opzione B |
| Quanti salti a gennaio, per profilo | idem | §6.1 |
| Quanti tocchi servono per finire la Primavera con l'idea 3 | contatore delle conferme nella sonda | da 39 a ≤ 12 |
| Minuti reali della stagione dal vivo a 1x/2x | misura vera sul flusso (`partita-vera`) su 3 partite, da sommare ai riquadri | oggi stima ~2 h a 1x (§1.3) |
| Varietà della prima stagione | numero di «tipi di settimana» diversi (Primavera, prima squadra, torneo, Under 19, mercato) | oggi 1 tipo di partita |
| Classifica Primavera e senior coerenti dopo il salto | `career-invariants` + guardiano `salto-gennaio-153`: la giornata del debutto ha lo stesso risultato prima e dopo | 100% |
| Nessuna presenza giovanile nei totali da professionista | `proCareerOf` sul salvataggio dopo una stagione con convocazioni | invariante 7.272 |

---

## 13. Cosa NON fare

1. **Non toccare le classifiche con partite che non sono di quella lega**: la partita di prima squadra non
   entra nella classifica Primavera; il torneo giovanile e l'Under 19 non entrano in nessuna classifica
   di lega.
2. **Non inventare risultati** che poi il calendario ricostruito smentisce (§6.3, `_pastR74`).
3. **Non usare `Math.random()`** nelle regole nuove: tutto da `hashStr` (determinismo, ricarico, banco).
4. **Non mettere una regola in un solo percorso settimana** (classe STAB, guardiano tri-path).
5. **Non riusare il contesto `national`** per l'Under 19 senza separare i contatori (capitoli e tornei
   senior leggono `nationalCaps`).
6. **Non simulare d'ufficio una partita dell'eroe**: ogni partita sua (Primavera, prima squadra, torneo,
   Under 19) resta giocabile; si simula solo ciò che l'eroe **non** gioca (Primavera nella settimana della
   convocazione, opzione 4.2-A) o ciò che lui sceglie di simulare.
7. **Non accorciare la stagione in settimane** (resta 1-38): mercato, soste e Nazionali sono agganciati
   alla settimana.
8. **Non riaprire il prestito per l'Under 18** (STAB-10).
9. **Non sommare i gol di Primavera alla lega senior** (invariante 7.336 di `seasonCarry`).
10. **Non lasciare vivo il tiro casuale di oggi** accanto alla regola nuova del mercato di gennaio (§1.4).
11. **Non usare nomi reali** per tornei, selezionatori, emittenti.

---

## 14. Domande aperte al PO

Per ognuna: opzioni e quella consigliata. Nessuna è decisa in questo documento.

| # | Domanda | Opzioni | Consigliata |
|---|---|---|---|
| D1 | Quanto devono essere frequenti le chiamate? | A prudente · B media · C generosa (§4.1) | **B** |
| D2 | Nella settimana della chiamata si gioca anche la Primavera? | A no, la Primavera si simula senza l'eroe · B si giocano entrambe | **A** |
| D3 | Le presenze in prima squadra prima del salto contano nei totali di carriera da professionista? | A sì · B no, contatore a parte «presenze da aggregato» | **A**, se il PO accetta il lavoro sui filtri §10; altrimenti B al primo rilascio |
| D4 | Il salto a gennaio solo verso il club madre o anche verso club esterni? | A solo club madre · B entrambi | **B** |
| D5 | Il pulsante dell'idea 3 si ferma sugli impulsi di routine con scelta? | A sì, sempre · B solo su impulsi «importanti» (saghe, mercato, tensione) e gli altri si scelgono da soli col «tono» dell'archetipo · C chiede all'inizio | **B** (è dove sta il risparmio, §5) — ma cambia il carattere del gioco: è gusto del PO |
| D6 | L'idea 3 vale solo in Primavera o sempre? | A solo Primavera · B sempre | **A** al primo rilascio |
| D7 | Regola del capocannoniere Primavera | A soglia attuale (≥8 gol e ≥0,55 a partita) · B primo nella classifica marcatori | **B** |
| D8 | Chi esce a gennaio vince i premi Primavera sui numeri fino a gennaio? | A sì · B no | **B** |
| D9 | Nome del torneo europeo giovanile | proposte: «Coppa Europea Giovani» · «Trofeo Continentale Under 19» · altro | gusto PO (vincolo: inventato, audit a 0) |
| D10 | Chi partecipa al torneo giovanile | A club madre da coppa europea (prestigio ≥ 71) · B prime 2 della Primavera precedente | **A** (vale già alla stagione 1) |
| D11 | Europeo Under 19 a fine stagione? | A no (solo 4 finestre) · B sì, 2-4 partite alle settimane 36-38 | **A** al primo rilascio |
| D12 | Under 19 anche dopo il salto tra i professionisti? | A sì finché l'età lo permette · B no | **A** |
| D13 | Una presenza in prima squadra sblocca il primo contratto a giugno anche sotto OVR 64? | A sì (da 62) · B no, resta OVR 64 | **A** — rende il rendimento più importante dell'OVR, che è il difetto misurato in §1.5 |
| D14 | Bump di SAVE_VERSION per far partire subito la corsa sui salvataggi già in Primavera? | A no (blocco opzionale) · B sì, 9 → 10 | **A** |

---

*Sonda di misura: `tests/visual/primavera-misura-153.mjs` (nuova, non guardiano). Nessuna modifica a
`src/`, a `CARRIER-MANAGER-AV.html`, ai guardiani né a `GAME_VERSION`.*
