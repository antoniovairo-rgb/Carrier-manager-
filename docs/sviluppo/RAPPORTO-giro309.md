# Giro 309 — Bilanciamento dei risultati: sola misura (PO-596 · PO-560 · PO-583 · PO-584)

Ramo `sviluppo/giro309-bilanciamento`, partito da `lavoro/200` (1cbc414b = 7.999.199). **Nessuna modifica al gioco**:
`src/` e `CARRIER-MANAGER-AV.html` non sono stati toccati, `GAME_VERSION` nemmeno. Tutto ciò che segue è misurato con
le funzioni VERE del gioco, chiamate in una pagina headless senza partita 3D (nessun highlight, nessun GLB).

Script (cartella `tests/visual/`, uscite in `tests/visual/out/misura-309/`, non versionate):

| script | cosa misura |
|---|---|
| `misura-309-sonda.mjs` | apre la pagina in carriera (nessuna grafica) ed espone le funzioni globali |
| `misura-309-stampo.mjs` | le giornate passate inventate all'arrivo in un club a stagione in corso |
| `misura-309-motore.mjs` + `misura-309-analisi.mjs` | punteggi e strisce del motore, 4.080 partite × 4 percorsi |
| `misura-309-calendario.mjs` | probabilità esatta di 8 sconfitte di fila, ordine vero del calendario contro rimescolato |
| `misura-309-eroe.mjs` · `misura-309-scarto.mjs` | eroe e squadra nelle simulate contro il motore coi parametri del live, per OVR |
| `misura-309-carriera.mjs` | carriere da bandiera sugli handler veri (`__CPM_CAREER.step`): Simula/Avanza, 8–15 stagioni |
| `misura-309-cartellini.mjs` | cartellini che il motore già produce nelle simulate, e squalifiche con una regola proposta |

---

## In breve

1. **PO-596, i punteggi a stampo esistono e sono la causa della foto.** Quando l'eroe arriva in un club a stagione in
   corso (dalla Primavera o con un trasferimento), le giornate già passate **non vengono simulate**: le inventa
   `legaDopoTrasferimento212` (`src/09-audio-scout-anagrafiche.jsx` r.1912-1916) con **tre soli punteggi** — 2-0, 1-1,
   0-1 — scelti da un hash che dà valori quasi uguali a giornate vicine. La sonda riproduce **esattamente** la foto del
   PO (sett. 1–7 «N 1-1», poi «V 2-0» in casa e «V 0-2» in trasferta). Il «girone d'andata da 5ª» era quindi finto:
   35 punti in 17 giornate inventati, contro i ~17 che il motore dà a un club di quel prestigio.
2. **PO-596, le 8 sconfitte di fila sono rare ma non anomale.** Per FC Augusta (prestigio 66, 14° su 18 della lega per
   prestigio, non di metà classifica) la probabilità di almeno 8 sconfitte di fila in una stagione è **4,3%** col motore;
   un riferimento Poisson indipendente con le stesse forze dà lo stesso ordine (3,1–3,8%). Nessun effetto a cascata:
   P(sconfitta | sconfitta prima) = 0,46 contro P(sconfitta) = 0,48. Il calendario non ammucchia le big (4,3% contro
   4,6% rimescolato).
3. **PO-560, la squadra simulata non è più severa del motore del live a parità di forza** (1,04–1,13 punti a partita in
   quattro bracci, rumore ±0,05). Severo resta il **voto** (6,2–6,3 sotto OVR 72, contro 6,60/7,20 misurati dal vivo al
   giro 156); sopra OVR 78 la simulata è anzi **più generosa** del live (fino a +0,5 punti a partita), perché solo la
   simulata aggiunge la forza dell'eroe alla squadra.
4. **PO-583**: vedi §4 (carriere da bandiera, Lega B → Europa).
5. **PO-584, infortuni e squalifiche quasi assenti per costruzione**: vedi §5.

---

## 1. Da dove vengono i risultati (PO-596, punto 1)

| percorso | chi calcola il risultato | file e riga |
|---|---|---|
| Partita giocata intera | motore del possesso dal vivo (`creaMotorePossesso`), forza = **prestigio puro** del club e dell'avversario (`_heroP`, `oppPrestige`), seme della partita | `src/15-live-match.jsx` r.6686-6688 |
| «Solo momenti salienti» (giro 166) | **lo stesso battito** della partita intera, fatto correre a lotti dentro `flushSync`: stessi sorteggi, stesso libro mastro (commento del giro 166 e giro 264: 0 divergenze su 20 confronti) | `src/15-live-match.jsx` r.3147-3152, r.9714-9725 |
| Simula (tasto) / Avanza con auto-sim | `simulateMatch(...,{motore:true})` → `simulaPartitaMotore` (lo stesso motore senza grafica), forza = prestigio **+ `clubPrestigeShifts` + bonus dell'eroe** (`_fz156`), seme `standingsSeed(club,stagione,settimana)+giornata·31+1` | `src/10-folla-stadi-ritiro.jsx` r.921-958; chiamanti `src/18-career-app.jsx` r.3802, 5162, 5377 |
| Risultati del club **prima che l'eroe ci arrivi** (era in Primavera o in un altro club) | **nessuna simulazione**: `legaDopoTrasferimento212` inventa le giornate passate con 2-0 / 1-1 / 0-1 | `src/09-audio-scout-anagrafiche.jsx` r.1900-1937 |
| Le altre partite della lega | Poisson per prestigio (`updateStandings`), non il motore | `src/09-audio-scout-anagrafiche.jsx` r.1762-1830 |

### 1a. Lo stampo (causa delle sett. 1–18 della foto)

```js
const _hr=Math.abs(hashStr(String(seed)+"_"+e.matchday))%100/100;
_pastR74[e.matchday]=_hr<_wp?{won:true,...,homeScore:2,awayScore:0}
                    :_hr<_wp+0.27?{drew:true,homeScore:1,awayScore:1}
                    :{homeScore:0,awayScore:1};
```

Tre difetti sovrapposti, tutti misurati (`misura-309-stampo.mjs`, 2.520 casi = tutti i club di prima e seconda divisione × 10
stagioni, arrivo alla settimana 20, 42.840 giornate):

- **Solo 5 punteggi possibili** (contando l'orientamento): 1-1 27,0% · 0-1 20,1% · 1-0 20,1% · 2-0 16,3% · 0-2 16,4%.
- **L'hash è quasi lineare nella giornata.** `hashStr` è djb2 con XOR: cambiando solo l'ultima cifra della giornata
  l'hash cambia di pochi punti, quindi `%100` dà valori vicini a giornate vicine. Nella foto: giornate 1–7 → 40, 43,
  42, 45, 44, 47, 46 (tutte nella fascia «pareggio»); giornate 10–17 → 16…23 (tutte nella fascia «vittoria», anche
  contro FC Westfalen 93 e FC Leipzig 88). Striscia più lunga di esiti identici: **media 10,1 giornate** contro 3,4
  attese con esiti indipendenti e le stesse probabilità; striscia ≥5 nel **98,1%** dei casi contro il 14,1%.
- **Orientamento rovesciato in trasferta.** Lo stampo scrive il risultato in ordine casa-ospiti
  (`_disp=e.isHome?_r:{...homeScore:_r.awayScore,awayScore:_r.homeScore}`), mentre ovunque altrove `homeScore` è il
  club dell'eroe e la legenda del calendario dice «prima i gol della tua squadra». Da qui le «V 0-2»: **7.041 vittorie
  su 14.035** dello stampo appaiono al rovescio. Effetto collaterale: la riconciliazione della classifica
  (`src/09` r.1886-1888) somma `homeScore` come gol fatti e su queste giornate trova numeri sbagliati (si spegne da sola,
  ritorna `null`: nessun danno, ma non ripara).

**La foto riprodotta** (FC Augusta, stagione 1, arrivo alla settimana 20; seme dello stampo 3287979684):
md 1–7 N 1-1 · md 8 V 2-0 · md 9 (sett. 10) N 1-1 · md 10–17 V 2-0 in casa / V 0-2 in trasferta. Identico alla foto.

### 1b. Il motore non collassa su pochi punteggi e i semi non si ripetono

`misura-309-motore.mjs`: 5 club della metà bassa della Deutsche Liga (Augusta 66, Köln 65, Mainz 68, Kraichgau 70,
Weser 72) × 20–40 stagioni = **4.080 partite** con il calendario vero, ognuna giocata in 4 percorsi:

| | A · Simula (semi del gioco) | B · stesso motore, semi indipendenti | V · motore coi parametri del live | P · Poisson storico (motore spento) |
|---|---|---|---|---|
| V / N / P | 26,9 / 24,6 / 48,5% | 28,0 / 25,7 / 46,3% | 29,5 / 23,8 / 46,6% | 30,8 / 23,9 / 45,2% |
| gol fatti / subiti | 0,88 / 1,36 | 0,92 / 1,32 | 1,00 / 1,40 | 1,14 / 1,48 |
| punteggi distinti | 36 | 37 | 38 | 48 |
| punteggio più frequente | 0-1 14,1% | 0-1 13,4% | 0-1 11,5% | 1-1 11,3% |
| entropia (bit) | 3,93 | 3,96 | 4,08 | 4,27 |
| striscia di punteggio **identico** più lunga (media · massimo) | 2,15 · 4 | 2,16 · 4 | 2,05 · 3 | 1,88 · 3 |

Il percorso A (semi del gioco, che cambiano di poco fra una giornata e l'altra) e il percorso B (semi indipendenti) sono
indistinguibili: **nessuna ripetizione dovuta ai semi**. Sette «1-1» di fila col motore: la probabilità per partita è
~11,6%, quindi sette di fila ≈ 3·10⁻⁷. Quella sequenza non può venire dal motore: viene dallo stampo.

⚠️ Gol a partita: A 2,24 · V 2,40 per queste squadre, contro **3,22** della Bundesliga 2023/24 (985 gol in 306 partite,
fonte: [Wikipedia, 2023–24 Bundesliga](https://en.wikipedia.org/wiki/2023%E2%80%9324_Bundesliga)). Il motore segna
meno del calcio vero; è già noto (banda di `sim-motore` 2,3–3,5) e non è oggetto di questo giro.

### 1c. Due forze diverse per la stessa partita (difetto, non della foto)

Il live usa `forza = club.p` puro (`src/15` r.6686); la simulata usa `club.p + clubPrestigeShifts + _fz156` (`src/10`
r.926, 956). Nella stagione 1 gli spostamenti sono zero, quindi non spiega la foto; da una stagione in poi, giocare o
simulare la stessa partita significa affrontarla con forze diverse (fino a ±24, o fino a +50 col tetto allargato
dall'albo d'oro, più fino a +15 per l'OVR dell'eroe).

## 2. Strisce di sconfitte (PO-596, punto 2)

Striscia di sconfitte più lunga per stagione (120 stagioni di club della metà bassa), contro due riferimenti costruiti
sulle STESSE partite: Poisson indipendente con le medie gol del motore per gradino di forza (5 punti) e casa/trasferta,
e Bernoulli indipendente con le stesse probabilità di sconfitta (40 repliche, 4.800 stagioni):

| | media | stagioni con ≥5 | stagioni con ≥8 | massimo |
|---|---|---|---|---|
| A · Simula | 4,08 | 31,7% | 1,7% | 12 |
| riferimento Poisson (forze di A) | 4,20 | 35,4% | 3,8% | — |
| V · come il live | 4,18 | 30,8% | 5,0% | 9 |
| riferimento Poisson (forze di V) | 4,02 | 30,1% | 3,1% | — |
| riferimento Bernoulli (V) | 4,00 | 30,5% | 2,8% | — |
| P · Poisson storico | 3,53 | 18,3% | 0,8% | 11 |

- **Nessun meccanismo a cascata nei risultati.** P(sconfitta | sconfitta alla giornata prima) = 0,464 contro
  P(sconfitta) = 0,484 (A); 0,455 contro 0,465 (V). Nel codice la forza della squadra non legge morale, forma, fatica o
  fiducia: nel live la forza è il prestigio (`src/15` r.6686); morale e forma entrano solo nel peso con cui il motore
  cerca l'eroe (`BONUS_EROE`, `src/14` r.302) e, nella simulata, nella scelta titolare/panchina (`calcCoachDecision`).
- **Il calendario non ammucchia le big** (`misura-309-calendario.mjs`, probabilità esatta col programma dinamico, 10
  stagioni per club): FC Augusta P(≥8 di fila) **4,28%** nell'ordine vero contro **4,59%** rimescolato; per tutti i 18
  club l'ordine vero è uguale o un po' più favorevole del rimescolato.
- **La sequenza della foto** (Werkstadt t, Leipzig c, Westfalen t, Köpenick t, Frankfurt t, Berlin c, Weser t,
  Friburgo c): probabilità di perderle tutte e otto col motore del live = 0,74·0,56·0,74·0,42·0,62·0,54·0,51·0,41 =
  **0,9%**. Sei avversari su otto sono più forti di 6–27 punti.
- **«Solo momenti salienti» non la rende più probabile**: è lo stesso battito del live (§1). Resta fuori misura una
  cosa sola, le scelte del giocatore negli highlight, che il motore senza grafica non può rifare.
- **Dati di realtà**: non ho una fonte verificata sulla frequenza delle strisce di 8 sconfitte nei campionati veri.
  Non posso confermare un confronto con la realtà; il confronto valido qui è col riferimento indipendente.

**Conclusione.** 8 di fila per un club da 66 in una lega dove 13 avversari su 17 sono più forti è un evento da circa
una stagione su 23 (Augusta), una su 8 per le ultime della lega (Darmstadt 58: 12,9%). Rara, non sistematica. Quello che
l'ha resa **sorprendente** è lo stampo: il PO vedeva la sua squadra quinta con 35 punti finti e si aspettava di restarci.

## 3. PO-560 — l'eroe simulato contro giocato, per OVR

`misura-309-eroe.mjs` (150 partite per OVR, FC Augusta contro tutta la Deutsche Liga, stessi semi per ogni OVR) e
`misura-309-scarto.mjs` (680 partite, OVR 66, quattro bracci sullo stesso motore).

| OVR | Simula: punti/partita | Simula: gol / assist eroe | Simula: voto | motore coi parametri del live: punti/partita | gol / assist eroe | voto |
|---|---|---|---|---|---|---|
| 60 | 0,97 | 0,11 / 0,07 | 6,22 | 1,22 | 0,09 / 0,20 | 6,35 |
| 66 | 0,95 | 0,19 / 0,09 | 6,31 | 1,32 | 0,11 / 0,19 | 6,38 |
| 72 | 1,01 | 0,21 / 0,11 | 6,32 | 1,17 | 0,09 / 0,20 | 6,33 |
| 78 | 1,40 | 0,39 / 0,17 | 6,63 | 1,11 | 0,12 / 0,25 | 6,37 |
| 84 | 1,65 | 0,53 / 0,19 | 6,84 | 1,17 | 0,14 / 0,23 | 6,41 |
| 90 | 1,51 | 0,51 / 0,17 | 6,77 | 1,01 | 0,10 / 0,21 | 6,35 |

⚠️ Le sei righe usano gli stessi semi e gli stessi avversari: non sono sei prove indipendenti. Lo scarto di squadra a OVR
≤72 (0,16–0,37) **non regge** al campione più grande: a OVR 66 su 680 partite i quattro bracci stanno fra 0,98 e 1,13
(tattica dell'avversario sì/no, seme della Simula o del live): differenze dentro l'errore (±0,05). La squadra simulata
non è più severa del motore a parità di forza.

Cosa resta, e dove:

- **Il voto**: simulato 6,22–6,32 sotto OVR 72, contro 6,60 (Primavera) e 7,20 (prima squadra) misurati dal vivo col
  pilota automatico al giro 156 (`docs/sviluppo/RAPPORTO-giro158.md`, campione piccolo: 5 partite per salvataggio).
  Anche il motore coi parametri del live dà ~6,35: il voto alto del vivo viene dagli highlight scelti dal giocatore, che
  il motore senza grafica non ha.
- **L'OVR conta solo nella simulata**: `_fz156 = (OVR−70)·quota minuti`, da 0 a +15 alla forza della squadra
  (`src/10` r.952). Dal vivo la forza è il prestigio puro. Sopra OVR 78 la simulata vale +0,3/+0,5 punti a partita più
  del motore del live: simulare è **conveniente** per un campione, **neutro** per un giovane.
- **La sensazione di severità** viene da altro: il club giovane del PO è nella metà bassa per prestigio (Augusta 66:
  0,99 punti a partita = ~34 punti a stagione) e, nella foto, dallo stampo che aveva gonfiato la prima metà.

## 4. PO-583 — carriera da bandiera dalla seconda divisione

`misura-309-carriera.mjs`: FC Ciociaro (Lega B, prestigio 47, mediana della lega), eroe attaccante di 20 anni che non
cambia mai club (contratto rinnovato d'ufficio a ogni stagione, offerte mai accettate), settimane avanzate con gli
handler veri (`__CPM_CAREER.step`: settimana vissuta + Simula). Cinque carriere con fatica gestita (OVR iniziale 68,
stagione di partenza 1, 4, 10, 13; una con OVR 78 dalla 7) e una con fatica trascurata. 14 stagioni ciascuna (la 15ª
cade al ritiro dei 34 anni ed è esclusa). I «semi» diversi sono le stagioni di partenza: il seme di ogni partita
dipende da club, stagione e settimana, **non dal nome dell'eroe** (`standingsSeed`, `src/09` r.1848), quindi due
carriere nello stesso club e nella stessa stagione danno gli stessi risultati salvo l'effetto dell'eroe.

Per stagione: lega+posizione · prestigio effettivo (base 47 + `clubPrestigeShifts`) · coppa europea giocata (`!` = vinta).

| carriera | percorso | promozione (stagione) | prima Europa | primo trofeo di club |
|---|---|---|---|---|
| partenza 1 | B7·47 B3·48 **A18·56** B3·50 A12·56 A11·57 A14·58 A14·55 A8·52 A12·55 A10·54 A17·56 B7·48 B1·47 | 2ª | mai | 14ª (Lega B + Coppa) |
| partenza 4 | B9·47 B7·59 B1·59 A17·64 B5·57 B1·58 A5·63 A6·69·UEL A5·74·UEL A6·76·UEL A3·80·**UEL!** A3·88·UCL A1·88·UCL A1·88·UCL | 3ª | 8ª | 2ª (Coppa) |
| partenza 10 | B4·47 B4·50 B4·53 B3·53 A18·56 B8·49 B2·49 A16·56 B9·50 B8·49 B3·48 A15·56 A18·54 B14·48 | 4ª | mai | mai |
| partenza 13 | B5·47 B4·50 B4·52 B5·54 B4·56 B2·57 A13·61 A12·59 A11·61·UEL A9·65·UEL A9·66 A11·65 A5·64 A8·67·UEL | 6ª | 9ª | 8ª |
| OVR 78, partenza 7 | B1·47 A15·56 A16·53 B1·47 A15·56 A17·55·UEL B1·51 A9·59 A9·60 A11·60 A10·59 A8·59 A10·60 A11·59 | 1ª | 6ª | 1ª (Lega B) |

**Numeri.** Promozione: 1–6 stagioni (mediana 3). Prima Europa: 3 carriere su 5, dopo 6–9 stagioni; 2 su 5 mai in 14.
Primo trofeo di club: 1–14 stagioni, una carriera mai. Trofeo europeo: 1 carriera su 5 (UEL alla 11ª).
Retrocessione subito dopo la promozione: **4 volte su 11 promozioni**, entro due stagioni 7 su 11.

**Il prestigio cresce davvero, ma con due motori diversi:**

- Alla promozione il club sale d'ufficio a 56 effettivi («ultima della classe», `src/18` r.~5846-5852,
  `_need200`, tetto +12). Poi la deriva normale (attese contro piazzamento, decadimento 8%, tetto ±24 che l'albo d'oro
  allarga fino a +50, `src/18` r.5815-5835) **lo riporta giù** se il club non sta stabilmente sopra il suo rango: la
  carriera «partenza 10» resta fra 47 e 56 per 14 anni, con 3 promozioni e 3 retrocessioni.
- **Ciò che fa davvero la differenza è l'OVR dell'eroe**, non la rosa: nella simulata la squadra riceve
  `(OVR−70)·quota minuti`, fino a +15 (`src/10` r.952). Con l'eroe a 84–87 il club gioca come se avesse 12–15 punti di
  prestigio in più; quando il club arriva in Europa e vince, i bonus europei (+3/+5/+8, `src/18` r.~5786) e il tetto
  allargato innescano la salita (carriera «partenza 4»: da 47 a 88 effettivi, due titoli di Lega A di fila).
- **La rosa non ha valori.** `generateTeamRoster` (`src/09` r.1321-1352) produce solo nomi e ruoli (la rosa cambia ~3
  nomi a stagione); non esiste un OVR dei compagni che possa crescere. La forza del club è solo prestigio + spostamenti
  (+ eroe nelle simulate).
- **Le traiettorie divergono moltissimo** con la sola stagione di partenza: da «mai in Europa in 14 anni» a «UEL vinta
  e due titoli di Lega A». Con 5 carriere i numeri qui sopra sono un ordine di grandezza, non una media.

## 5. PO-584 — infortuni e squalifiche

**Infortuni dell'eroe.** Due sole regole, uguali nella simulata (`simInjuryRoll`, `src/18` r.2238-2251) e nella
giocata (`src/18` r.4338-4340): infortunio solo se la fatica DI PARTITA supera 68 (3%) o 82 (7%). La fatica di partita è
quella della settimana + 12…22 (simulata) o + 8…14 (giocata). Con la settimana vissuta normale la fatica sta a ~38
(misurata, media di stagione 37–41 in tutte le carriere gestite) → fatica di partita 50–60 → **probabilità zero**.

| | stagioni | infortuni dell'eroe | settimane fuori | squalifiche |
|---|---|---|---|---|
| fatica gestita (5 carriere) | 70 | **6** (0,09 a stagione) | 23 | **0** |
| fatica trascurata (fatica forzata a 78 prima di ogni settimana) | 8 | **13** (1,6 a stagione) | 65 | **0** |

Con la fatica trascurata l'OVR resta fermo (72→73 in 8 stagioni, contro 74→85 delle carriere gestite) e il voto cade a
5,1–6,7. Riferimento reale: nei club professionistici europei un giocatore subisce in media **2,0 infortuni a stagione**
e l'incidenza in partita è **27,5 per 1.000 ore** (≈4% per partita giocata) — UEFA Injury Study, Ekstrand et al.,
[BJSM 2011](https://bjsm.bmj.com/content/45/7/553.long); la meta-analisi 2023 su 44 studi dà 36/1.000 h in partita
([PMC9929604](https://pmc.ncbi.nlm.nih.gov/articles/PMC9929604)). Sono infortuni con perdita di tempo, molti di pochi
giorni: il confronto è sull'ordine di grandezza, non sulla durata.

**Infortuni dei compagni: non esistono.** La rosa non ha stato fisico (§4); nessuna riga del gioco infortuna un compagno.

**Squalifiche: nelle simulate non possono esistere.** Il motore senza grafica produce già i cartellini per tutti
(`_cart913`, `src/14` r.747-769, tarati sul calcio vero): misurato su 680 partite (`misura-309-cartellini.mjs`) l'eroe
prende **0,275 gialli a partita** e 0,004 rossi; la squadra 2,20 gialli e 0,075 rossi, l'avversario 2,08 e 0,068
(Bundesliga 2023/24: 1.269 gialli in 306 partite = 2,07 a squadra, fonte: DFB datencenter via
[Wikipedia](https://en.wikipedia.org/wiki/2023%E2%80%9324_Bundesliga)). Ma `simulateMatch` legge solo i gol e la
pagella: **i cartellini delle simulate si buttano**. Nella giocata la squalifica nasce solo dal rosso vero dell'eroe
(`src/15` r.10448-10466); non c'è squalifica per somma di gialli in nessun percorso (cercata, non trovata).
⚠️ L'eroe prende quasi il doppio dei gialli di un giocatore medio (2,07 a squadra divisi su ~14 giocatori ≈ 0,15):
è un dato del motore, da tenere presente prima di introdurre una regola sui gialli.

## 6. Proposte di taratura (nessuna applicata)

| # | dove | proposta | effetto atteso, misurato |
|---|---|---|---|
| T1 · PO-596 | `legaDopoTrasferimento212`, `src/09` r.1912-1922 | Le giornate passate si **simulano** invece di inventarle: `simulateMatch(club, avv, ovr, isHome, standingsSeed(club,stagione,settimana)+giornata·31+1, shifts, {motore:true})`, cioè lo stesso seme della Simula; risultato salvato con `homeScore` = gol del club (mai rovesciato in trasferta). Ripiego senza costo: il Poisson di `updateStandings` con le stesse forze | Percorso A di §1b: 36 punteggi distinti invece di 5, punteggio più frequente 14% invece di 27%, striscia di punteggio identico media 2,15 invece di 10,1; FC Augusta stagione 1, giornate 1–17: **10 punti** invece dei 35 inventati. Costo misurato: 58 ms a partita in headless (17 giornate ≈ 1 s alla firma; sul telefono da misurare). Il Poisson storico: 48 punteggi distinti, costo nullo. Va riparato anche il seme delle altre giornate della classifica (`seed:hashStr(...)`) |
| T2 · PO-596 | nessuna | Le strisce **non** si correggono: il motore è in linea col riferimento indipendente (§2) | — |
| T3 · PO-596/560 | `src/15` r.6686 oppure `src/10` r.926/956 | Una sola forza per la stessa partita: o il live legge anche `clubPrestigeShifts` e `_fz156`, o la simulata smette di aggiungerli | Non misurato sul live (servono partite 3D). A parità di semi, la differenza fra A e V sulla squadra con `_fz156` acceso vale fino a +0,5 punti a partita a OVR 84 (§3) |
| T4 · PO-560 | `votoSimEroe`/base 158, `src/10` r.975-990 | Nessun ritocco alla squadra. Sul voto: spostare la base di +0,3 vale lo scarto rispetto al vivo misurato in Primavera | Voto simulato sotto OVR 72: 6,22–6,32 → 6,52–6,62 (6,60 dal vivo, giro 156); in prima squadra resta −0,3/−0,6 dal vivo (7,20). Calcolo diretto sulla tabella di §3 |
| T5 · PO-584 | `simInjuryRoll` `src/18` r.2238 e r.4340 | Rischio di base per partita giocata **1,0% + 0,04% per punto** di fatica di partita sopra 40, più il +3% sopra 82 di oggi | `misura-309-proposte.mjs` (10.000 stagioni da 38 partite): fatica 38 → **0,59 infortuni a stagione** (oggi 0), il 54% delle stagioni senza; fatica 78 → 2,02 (oggi 2,24). La variante «1,5% + 0,05%» dà 0,81 e 2,31 |
| T6 · PO-584 | `simulateMatch` `src/10` + chiamanti `src/18` | Leggere `amm`/`esp` della pagella dell'eroe (già calcolati) e contarli: 5 gialli = 1 giornata, rosso = 1 giornata, anche nella giocata | `misura-309-cartellini.mjs`, 20 stagioni da 34: **1,70 squalifiche a stagione** (min 1, max 3). Con un giallo-eroe allineato al medio (0,15) sarebbe circa la metà: dipende da cosa decide il PO sul tasso |
| T7 · PO-584 | rosa (`src/09` r.1321) | Infortuni dei compagni (con lo stesso rischio di T5 su 11 titolari) | Calcolo diretto: 11 × 38 × ~1,5% ≈ 6 infortuni di compagni a stagione. Serve prima uno stato per giocatore della rosa: oggi non c'è |

## 7. Dubbi per il PO

1. **Lo stampo va sostituito col motore (coerente, ~1 s alla firma) o col Poisson (immediato)?** Con il motore la classifica
   che trovi arrivando è fatta come le partite che simuli dopo; col Poisson è come quella delle altre squadre.
2. **Una forza o due?** Oggi giocare e simulare la stessa partita usa forze diverse (§1c). Se l'OVR dell'eroe deve
   alzare la squadra anche dal vivo, va aggiunto al live; se no, va tolto dalla simulata — e allora la carriera da
   bandiera (§4) diventa molto più lenta, perché è proprio quel bonus che porta il club in alto.
3. **Ritmo della bandiera.** Oggi: promozione in ~3 stagioni, Europa in 6–9 per 3 carriere su 5, e 4 promosse su 11 tornano giù
   l'anno dopo (7 entro due anni). È il ritmo voluto? Lo «yo-yo» nasce dal salto d'ufficio a 56 che poi la deriva riassorbe.
4. **Quanti infortuni vuoi vedere?** Il riferimento reale (~2 a stagione, molti di pochi giorni) è più del doppio di
   quanto proporrei per un gioco; T5 dà ~0,6 con la fatica curata.
5. **Squalifiche per somma di gialli**: la regola (5 gialli = 1 giornata) è una mia proposta, non verificata sul
   regolamento di una lega precisa in questo giro. E il tasso di gialli dell'eroe (quasi doppio del medio) va prima
   deciso.
6. **La foto delle 8 sconfitte**: quelle partite le hai giocate tu (momenti salienti). Il motore dice 0,9% per quella
   sequenza; le tue scelte negli highlight non le posso rifare senza grafica. Se vuoi una prova sul dispositivo, il
   salvataggio di quella stagione permetterebbe di rigiocare le stesse giornate.

## 8. Limiti dichiarati

- Nessuna partita 3D: il percorso «giocato» è il motore coi parametri del live, non le scelte di un giocatore.
- Campioni: 4.080 partite per i punteggi; 150 partite per OVR (stessi semi fra OVR) e 680 per lo scarto; 5 carriere da
  14 stagioni per PO-583 (ordine di grandezza); 8 stagioni con fatica trascurata.
- La fatica «trascurata» è forzata a 78 prima di ogni settimana: un caso limite, non un giocatore reale.
- `ci-runner`, gate e guardiani non eseguiti: nessun file del gioco è stato modificato.
