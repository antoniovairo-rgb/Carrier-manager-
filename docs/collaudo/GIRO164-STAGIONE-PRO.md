# GIRO164 — La stagione da professionista: partita dopo partita o «momenti salienti»?

**Giro 164 · PO-364 · solo misura (nessuna modifica a `src/`, al file di gioco o ai guardiani) · 11/11/2026**

> «Pensi che sia vincente anche per la carriera professionistica gestire a "momenti salienti" e non partita
> dopo partita? Non vorrei che diventi noioso il gioco alla lunga.»

Il PO ha deciso: **prima si misura, poi decide lui.** Questo documento misura e propone tre opzioni con i
numeri attesi. **Non decide.**

Base misurata: `GAME_VERSION 7.999.190`, `SAVE_VERSION 9`, commit `4f9363a`.
Metodo di riferimento: progetto Primavera, `docs/progetto/PRIMAVERA-153.md` (ramo `progetto/giro153-primavera`).

---

## 0. In una tabella

| | Primavera (1 stagione) | Pro, club basso | Pro, club medio | Pro, club alto (titolare / riserva) |
|---|---|---|---|---|
| Settimane | 39 | 39 | 39 | 39 |
| Partite nella stagione | 34 | 38-40 | 40-41 | 44-53 |
| Settimane senza partita | 5 | 1 | 1 | 1-3 |
| Riquadri settimanali con una scelta (≥2 pulsanti) | 32 | 22-28 | 25-29 | 22-26 |
| Settimane senza **nessuna** scelta (percorso simulato) | 6 | 10-17 | 8-14 | 12-17 |
| Partite con posta (regola §5, senza amichevoli della Nazionale) | 4 (12%) | 1-4 (3-10%) | 5 (12-13%) | 14-17 (30-36%) |
| Partite di campionato senza posta (peso ≤ 2) | 23 / 34 | 30 / 34 | 24-28 / 34 | 20-26 / 34 |
| Highlight già visti nella stessa stagione (pre-selezione, N=4 → N=6) | 28% → 38% | 31-32% → 43-44% | 33-35% → 43-45% | 35-41% → 48-49% |
| Tempo stimato tutto dal vivo, 1x | ≈ 1 h 55 | ≈ 2 h 05 – 2 h 15 | ≈ 2 h 15 | ≈ 2 h 30 – 2 h 55 |
| Tempo stimato tutto dal vivo, 2x | ≈ 1 h 15 | ≈ 1 h 20 – 1 h 30 | ≈ 1 h 25 | ≈ 1 h 35 – 1 h 55 |
| Tempo stimato tutto simulato | ≈ 10-15 min | ≈ 10-15 min | ≈ 10-15 min | ≈ 10-15 min |

Lettura asciutta, senza giudizio: da professionista la stagione è **più lunga** della Primavera (4-19 partite
in più), ha **meno settimane con una scelta**, e la **maggior parte delle partite di campionato non ha posta**
secondo la funzione che il gioco stesso usa per pesarle. Su un club di prestigio basso le partite con posta
sono quasi zero.

---

## 1. Strumento e metodo

**Sonda nuova** `tests/visual/stagione-pro-164.mjs` (non guardiano, non gate). Stessa impostazione della
sonda 153: salvataggio sintetico, stagione giocata sugli handler **veri** (`window.__CPM_CAREER.step()` →
`liveCurrentWeek` / `simulateAndAdvance` / `doAdvanceWeek`; a fine stagione `startNewSeason()`), con
`__CPM_SIM_NAT=1` perché anche i tornei della Nazionale si simulino con la funzione del bottone «Simula».

```bash
cd tests/visual
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node stagione-pro-164.mjs            # 4 profili pro, 3 stagioni
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node stagione-pro-164.mjs primavera  # confronto
```
Risultati in `tests/visual/out/stagione-pro-164.json` (non versionato). Durata: 4-5 minuti per due profili.

**Profili** (tutti attaccanti, Lega A, partenza a stagione 3 settimana 1, contratto fino alla stagione 6):

| Profilo | Club (prestigio) | OVR iniziale | Fiducia del mister |
|---|---|---|---|
| `basso-tit` | FC Salento (62) | 72 | 75 |
| `medio-tit` | FC Brenvar (77) | 78 | 72 |
| `alto-tit` | Torino Athletic (95) | 86 | 80 |
| `alto-ris` | Torino Athletic (95) | 68 | 40 |
| `primavera` | AC Dorvelli Primavera (Primavera 1) | 66 | 60 |

**Le due stagioni consecutive misurate sono la 4 e la 5.** La stagione 3 (la prima del salvataggio
sintetico) **non è rappresentativa**: Coppa e coppe europee si creano in `startNewSeason`, quindi nella prima
stagione di un salvataggio sintetico il calendario ha soltanto il campionato (34 voci). La riporto solo dove
serve come contrasto.

Per ogni settimana la sonda registra: voci di calendario, gara servita (`thisWeekMd`), risultato del passo,
riquadri aperti nel DOM (`settimana23` col numero di pulsanti, `intervista231`, `offerta23`/`offerta-v2`,
`rinnovo94`, `convocazione235`), l'impulso (`recentImpulses`), il **peso della partita** con
`calcMatchWeight` (`src/08-panchina-derby-meteo-cori.jsx:305`), la **pre-selezione degli highlight** con
`selectContextualSituations` (`src/13-prepartita-formazioni.jsx:1329`) e il seed vero della partita
(`src/15-live-match.jsx:1986`), e la domanda d'intervista che `pickInterviewByCtx`
(`src/07-versione-save-interviste.jsx:1288`) pescherebbe. I riquadri si chiudono **senza scegliere** (come
nella 153); le interviste col primo pulsante.

Cataloghi letti dalla pagina (stesso build): `SITUATIONS` 191 (2 sospese) · `BG_MATCH` 223 righe ·
`INTERVIEW_QS` 211 domande (91 post-partita, 45 per la vittoria) · `WEEKLY_IMPULSES` 130 · `WEEKLY_EVENTS` 112
· `MATCH_TICK_MS` 1700.

---

## 2. Calendario

Partite **servite** nella stagione (passi `simulated` per tipo di voce, più i passi `nat:` dei tornei della
Nazionale):

| Profilo | Stag. | Campionato | Coppa | Girone europeo | Europa KO | Amichevoli Naz. | Torneo Naz. (Europeo/Mondiale) | **Totale** | Sett. senza partita |
|---|---|---|---|---|---|---|---|---|---|
| basso-tit | 4 | 34 | 4 | – | – | 2 | – | **40** | 1 |
| basso-tit | 5 | 34 | 1 | – | – | 3 | – | **38** | 1 |
| medio-tit | 4 | 34 | 3 | – | – | 2 | 2 | **41** | 1 |
| medio-tit | 5 | 34 | 4 | – | – | 2 | – | **40** | 1 |
| alto-tit | 4 | 34 | 4 | 6 | 1 | 2 | 6 | **53** | 1 |
| alto-tit | 5 | 34 | 1 | 6 | 2 | 3 | – | **46** | 1 |
| alto-ris | 4 | 34 | 4 | 6 | 2 | – | – | **46** | 1 |
| alto-ris | 5 | 34 | 2 | 6 | 2 | – | – | **44** | 3 |
| *primavera* | *1* | *34* | – | – | – | – | – | ***34*** | *5* |

- Settimane: **39** in tutte le stagioni (1-38 + la 39 di chiusura).
- Le soste del campionato (`_CAL_BREAKS`, `src/09-audio-scout-anagrafiche.jsx:1136`) sono riempite da Coppa,
  Europa e Nazionale: da professionista resta in pratica **una sola settimana senza partita**, contro le
  cinque della Primavera.
- **Coppe europee** solo per il club alto (prestigio 95; qualificato dal piazzamento). Basso e medio non le
  hanno mai avute in due stagioni.
- **Nazionale**: amichevoli (`type:"national"`) 2-3 a stagione per chi è convocato; un torneo
  Europeo/Mondiale (6 gare per alto-tit, 2 per medio-tit) nella stagione 4. Coppa delle Nazioni: **mai
  osservata** in queste due stagioni.
- **Amichevoli di club** (ritiro precampionato): la sonda le fa risolvere da `resolveOpening()` e **non le
  conta**. Non posso confermarne il numero da questa misura.
- La Coppa varia da 1 a 4 gare a seconda di quando si esce.

---

## 3. Durata stimata

⚠️ **Stima derivata, non misurata sul telefono**, con le stesse componenti della 153 (§1.3):
- 90' di gioco fluido a `MATCH_TICK_MS` = 1700 ms ≈ **153 s** a 1x, ≈ 76 s a 2x;
- highlight a cronometro fermo ≈ **34 s** a partita (misurato 7.494-7.500), non dipendono dalla velocità;
- ⇒ **≈ 3,1 min a partita a 1x, ≈ 1,9 min a 2x**, **più** prepartita, formazioni, ingresso in campo,
  intervista e dopo-partita, che **non ho misurato** (quindi i totali sono un pavimento);
- riquadri: 39 a stagione × 10-20 s (stima, come nella 153) ≈ 7-13 min.

| Profilo (stag. 4-5) | Partite | Dal vivo 1x | Dal vivo 2x | Tutto simulato |
|---|---|---|---|---|
| basso-tit | 38-40 | 118-124 min + 7-13 ≈ **2 h 05 – 2 h 15** | 72-76 min + 7-13 ≈ **1 h 20 – 1 h 30** | ≈ 10-15 min |
| medio-tit | 40-41 | 124-127 min + 7-13 ≈ **2 h 10 – 2 h 20** | 76-78 + 7-13 ≈ **1 h 25 – 1 h 30** | ≈ 10-15 min |
| alto-tit/ris | 44-53 | 136-164 min + 7-13 ≈ **2 h 25 – 2 h 55** | 84-101 + 7-13 ≈ **1 h 30 – 1 h 55** | ≈ 10-15 min |
| primavera | 34 | 105 + 7-13 ≈ **1 h 55** | 65 + 7-13 ≈ **1 h 15** | ≈ 10-15 min |

Il tempo «tutto simulato» è quello umano di leggere i riquadri; il tempo macchina della sonda per una
stagione è 70-110 s in headless, che non dice niente sul giocatore.

---

## 4. Scelte vere per stagione

| Profilo | Stag. | Riquadri con scelta (≥2 pulsanti) | Riquadri a un pulsante | Offerte di mercato | Rinnovo | Interviste settimanali | **Settimane senza nessuna scelta** |
|---|---|---|---|---|---|---|---|
| basso-tit | 4 / 5 | 22 / 28 | 6 / 5 | 2 / 1 | – / 1 | 0 / 0 | **17 / 10** |
| medio-tit | 4 / 5 | 25 / 29 | 6 / 3 | 0 / 1 | – / 1 | 0 / 0 | **14 / 8** |
| alto-tit | 4 / 5 | 24 / 26 | 5 / 5 | 1 / 0 | – / 1 | 0 / 0 | **15 / 12** |
| alto-ris | 4 / 5 | 22 / 22 | 4 / 5 | 2 / 0 | – / 1 | 0 / 0 | **17 / 17** |
| primavera | 1 | 32 | 6 | 0 | – | 1 | **6** |

Scelte che la sonda **non vede** perché gioca il percorso simulato, e che si aggiungono giocando dal vivo:
- **intervista post-partita**: esce **sempre** dopo una partita giocata (decisione PO 12/10, PO-231,
  `src/18-career-app.jsx:3651-3657`) ⇒ +38-53 scelte a stagione, una per partita;
- **conferenza pre-partita** se il peso della gara è ≥ 7 (`src/18-career-app.jsx:1192`) ⇒ 0-3 a stagione
  (distribuzione dei pesi, §5);
- le scelte **dentro** la partita (le azioni degli highlight, ≈ 4 a partita).

Altro:
- **Allenamento**: non è una scelta. La vista «Allenamento» è stata tolta il 03/10 (decisione PO), la
  crescita è automatica a fine settimana (`src/18-career-app.jsx:10131`).
- Il **rinnovo** alla settimana 27 della stagione 5 dipende dal contratto del salvataggio (scadenza alla
  stagione 6): è un effetto del profilo, non una frequenza. Il riquadro resta visibile per molte settimane
  (la sonda lo vede 24-25 volte): l'ho contato **una volta**.
- Le **offerte** (0-2 a stagione) nascono da `Math.random()` non seedato (`offerProb`,
  `src/18-career-app.jsx:1344` e `:4809`): il numero varia fra esecuzioni.
- Le **interviste settimanali** sono 0 nelle stagioni 4-5 e 1-2 nella stagione 3. La sonda le legge dal DOM
  240-420 ms dopo il passo: non posso escludere di averne persa qualcuna.

---

## 5. Posta in gioco

**Regola dichiarata.** Una partita ha posta se:
- è di una competizione diversa dal campionato (Coppa, girone o fase finale europea, torneo della
  Nazionale), **oppure**
- il suo peso `calcMatchWeight` è **≥ 5**. È la funzione del gioco (derby +3, ex club +2, lotta per il
  titolo dalla settimana 28 +3, salvezza dalla 25 +2, scontro diretto fra le prime tre +1, finale di stagione
  +1/+3, rivale +2; tetto 10), e 5 è la soglia a cui il gioco stesso aggiunge un highlight
  (`src/15-live-match.jsx:1811`); a 7 apre la conferenza stampa.
- Le **amichevoli della Nazionale** le conto a parte (le riporto con e senza).

| Profilo | Stag. | Partite | Con posta (senza amichevoli Naz.) | Con posta (con amichevoli Naz.) | Campionato con peso ≤ 2 |
|---|---|---|---|---|---|
| basso-tit | 4 / 5 | 40 / 38 | 4 (10%) / 1 (3%) | 6 (15%) / 4 (11%) | 30 / 30 su 34 |
| medio-tit | 4 / 5 | 41 / 40 | 5 (12%) / 5 (13%) | 7 (17%) / 7 (18%) | 28 / 24 su 34 |
| alto-tit | 4 / 5 | 53 / 46 | 17 (32%) / 14 (30%) | 19 (36%) / 16 (35%) | 26 / 20 su 34 |
| alto-ris | 4 / 5 | 46 / 44 | 15 (33%) / 16 (36%) | 15 (33%) / 16 (36%) | 26 / 23 su 34 |
| primavera | 1 | 34 | 4 (12%) | 4 (12%) | 23 su 34 |

Lettura: nel **campionato** quasi nessuna partita supera il peso 5 (0-6 su 34): la lotta per il titolo pesa
solo dalla settimana 28 e per chi è fra le prime quattro, la salvezza solo per le ultime tre. Per un club di
metà classifica senza derby il campionato è, per la funzione del gioco, **34 partite con la stessa posta**. La
posta del club alto viene quasi tutta dalle coppe.

---

## 6. Ripetizione

### 6.1 Riquadri settimanali
Su due stagioni (4+5) i riquadri sono 53-63 per profilo; quelli **con lo stesso testo** (cifre tolte, primi
90 caratteri) sono **1-2**. Il motivo è nel codice: l'impulso non si ripesca finché è negli ultimi 40
(`recentImpulses.slice(-40)`), su un catalogo di 130 impulsi + 112 eventi.
⚠️ Due stagioni sono 78 settimane, appena oltre la finestra di 40: **non posso confermare** cosa succede
dalla terza stagione in poi.

### 6.2 Domande d'intervista post-partita
Stima, non misura: `pickInterviewByCtx` usa il caso, e la sonda la interroga col solo contesto «vittoria».
Su due stagioni (78-93 partite) le domande **già uscite prima** sono il **23-33%** (18-30 ripetizioni). Il
catalogo ha 91 domande post-partita, 45 per la vittoria: con una intervista a partita e 40-53 partite a
stagione, la ripetizione cresce per costruzione.

### 6.3 Highlight
Quota di scene **già comparse prima nella stessa stagione**, sulla **pre-selezione** degli highlight
(`selectContextualSituations` col seed vero di ogni partita):

| Profilo | Stag. | N=4 scene a partita | N=6 scene a partita | Scene distinte usate |
|---|---|---|---|---|
| basso-tit | 4 / 5 | 31,3% / 32,2% | 43,3% / 43,9% | 103-136 |
| medio-tit | 4 / 5 | 34,6% / 32,5% | 44,9% / 42,5% | 102-138 |
| alto-tit | 4 / 5 | 40,4% / 34,8% | 48,9% / 48,2% | 112-144 |
| alto-ris | 4 / 5 | 38,0% / 40,9% | 48,2% / 48,5% | 104-143 |
| primavera | 1 | 27,9% | 37,7% | 98-122 |

⚠️ Limiti: il numero vero di scene a partita è 2-6 e lo decide `tassoOccasioni28` al calcio d'inizio e poi
minuto per minuto (`src/15-live-match.jsx:1816`), per questo riporto N=4 e N=6 come due bracci; le scene
aggiunte in corsa (coda reattiva, 60' e 72') **non sono contate**. Il filtro anti-ripetizione del gioco vale
**dentro una partita** (`src/13-prepartita-formazioni.jsx:1355`), non nella stagione.

### 6.4 Righe di cronaca
**Non misurate** in questo giro (servirebbe giocare dal vivo ogni partita). Solo aritmetica: con 23-29 righe a
partita (misura 7.542) e 38-53 partite si scrivono **870-1.540 righe** a stagione da un catalogo di **223
righe base** ⇒ ogni riga base esce in media **4-7 volte a stagione**, e almeno il **74-86%** delle righe di
una stagione è una riga base già letta (i nomi dei giocatori cambiano il testo, non la riga). Non posso
confermare la distribuzione vera.

---

## 7. Limiti dichiarati

1. Partite **simulate**, non giocate: nulla in §2-§6 viene dal flusso dal vivo, tranne le misure di tempo
   prese dalle release citate.
2. **Titolare e riserva non si distinguono** sul percorso simulato: `alto-ris` (OVR 68, fiducia 40) ha giocato
   44-46 partite e segnato 14-19 gol. Il mister che lascia in panchina (`calcCoachDecision`) agisce sul
   percorso dal vivo. Non posso confermare quante partite giocherebbe davvero una riserva.
3. Un campione per profilo e per stagione; offerte, interviste e alcuni eventi usano `Math.random()`.
4. Riquadri chiusi **senza scegliere**: gli effetti delle scelte non entrano nella misura.
5. Amichevoli del ritiro non contate; Coppa delle Nazioni mai uscita nelle due stagioni.
6. I tempi sono un pavimento (manca tutto ciò che sta attorno alla partita).

---

## 8. Tre opzioni di prodotto (senza decidere)

Calcolate sulle stagioni 4-5 con la regola di posta del §5 (senza amichevoli della Nazionale).

### Opzione A — Nessun cambio
Ogni partita resta giocabile dal vivo o simulabile una per una, come oggi.

| | basso | medio | alto |
|---|---|---|---|
| Partite dal vivo | 38-40 | 40-41 | 44-53 |
| Tempo 1x / 2x | ≈ 2 h 10 / 1 h 25 | ≈ 2 h 15 / 1 h 25 | ≈ 2 h 30-2 h 55 / 1 h 35-1 h 55 |
| Highlight già visti (N=4) | 31-32% | 33-35% | 35-41% |

Costo zero, rischio zero. Resta il quadro misurato: la maggior parte delle partite senza posta, ripetizione
degli highlight che sale col numero di partite.

### Opzione B — Tasto «Vai al prossimo momento» opzionale
Lo stesso dell'idea 3 del progetto Primavera (`PRIMAVERA-153.md`), esteso ai professionisti: simula di fila
le settimane senza posta e si ferma alla prossima partita con posta, a una scelta, a un'offerta o a un rinnovo.
Il giocatore può sempre non usarlo.

| | basso | medio | alto |
|---|---|---|---|
| Partite dal vivo (se usa sempre il tasto) | **1-4** | **5** | **14-17** |
| Tempo 1x (dal vivo + riquadri) | ≈ 10-25 min | ≈ 25-30 min | ≈ 55 min – 1 h 05 |
| Highlight già visti (N=4, solo partite con posta) | 0% | 0-5% | 11-20% |

⚠️ Con la regola di oggi, per un club basso la stagione diventa **quasi tutta simulata** (1-4 partite): la
regola di «posta» andrebbe allargata (traguardi personali, ex club, partita dopo un infortunio, rinnovo in
bilico…) prima di poterla usare come fermata. Riusa `simulateAndAdvance`/`doAdvanceWeek` (area carriera,
tri-path ⇒ catena completa).

### Opzione C — «Momenti salienti» solo per le partite senza posta
Le partite con posta si giocano intere; quelle senza posta si giocano a **soli highlight** (si salta il
gioco fluido, restano le scene con le loro scelte e l'intervista). Durata di una partita a soli highlight:
≈ 34 s di scene + intro ed esito, **stima ≈ 0,8 min, non misurata**.

| | basso | medio | alto |
|---|---|---|---|
| Partite intere / a soli highlight | 1-4 / 36-37 | 5 / 35-36 | 14-17 / 28-36 |
| Tempo 1x (+ riquadri) | ≈ 40-55 min | ≈ 50-60 min | ≈ 1 h 15 – 1 h 35 |
| Highlight già visti (N=4) | 31-32% (invariato) | 33-35% (invariato) | 35-41% (invariato) |

Le scelte per stagione restano tutte (incluse le interviste post-partita). La ripetizione degli highlight
**non cambia**, perché le scene giocate sono le stesse: è la voce che l'opzione C non tocca. Richiede una
modalità di partita che oggi non esiste (area motore + partita ⇒ catena completa).

### Cosa i numeri non dicono
Quale delle tre renda il gioco meno noioso **non è misurabile con questa sonda**: misura quantità (partite,
scelte, ripetizioni, minuti), non il piacere. Il gioco non registra se i giocatori giocano dal vivo o
simulano: non posso confermare quale strada scelgano oggi.
