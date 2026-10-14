# Rapporto giro 22 — highlight dell'eroe (PO-248 → PO-252)

**14/10/2026 · ramo `sviluppo/highlight-252` · base `lavoro/168` (7.999.168) · nessun bump di `GAME_VERSION` · toccato solo
`src/12-three-match-view.jsx` (+ build `CARRIER-MANAGER-AV.html`) e `tests/visual/`.**

Direttiva PO 14/10 come riportata nel compito: «Puntiamo molto alla fluidità, credibilità degli highlights dell'eroe a tutto
tondo!». Base di misura: il banco del giro 21 (`docs/sviluppo/BANCO-highlight-248.md`, `tests/visual/banco-highlight-248.mjs`,
portati su questo ramo dal ramo `sviluppo/banco-highlight-248`).

> ⚠️ **Fonte non trovata.** La riga **PO-252** non compare in `docs/governo/BACKLOG.md` né su `lavoro/168`, né su `origin/main`,
> né su `sviluppo/banco-highlight-248` (verificato con `grep` su tutti e tre i rami il 14/10). Ho lavorato sull'elenco del
> compito e sui numeri del banco. **Non posso confermare** il testo della riga PO-252.

Regole rispettate: misura prima di correggere, GLB acceso in tutte le sonde, pagina nuova per ogni scena (CLAUDE.md «pagina
stanca»), nessun testo nuovo visibile al giocatore (PO-249), zona G (carriera/economia) non toccata, scrittori del pallone firmati
(nessuno scrittore nuovo: le correzioni 2 e 6 cambiano **come** scrivono due scrittori esistenti, `_golInRete811`/`buildup-aereo`).

---

## 1. Le sei voci corrette

Ogni voce: causa misurata · correzione (file:riga sul ramo) · interruttore rosso · guardiano con i due bracci.
I guardiani girano GLB acceso, una pagina nuova per scena, e giudicano in **tempo di scena** (lezione 7.460).

### 1 · Piedi dell'eroe che pattinano nella conclusione — `__CPM_NO_PIEDI252`, `npm run piedi-252`

**Misura della causa** (sonda `tests/visual/sonda-piedi-252.mjs`, testimone di dettaglio `__CPM_PIEDI_EROE` aggiunto al blocco
del 7.999.7, sola lettura): il pattinamento sta **nella corsa d'avvicinamento**, non nel gesto — gi0 20 fotogrammi su 29 con la
radice in moto, gi1 33 su 41; nei fotogrammi di gesto (kick/volley/cross) quasi zero.

Tre ipotesi verificate e scartate con la misura prima della causa vera:
1. *stima della velocità in ritardo* (media esponenziale `_spS`): resa pronta, **nessun effetto** (mediana 0,494 in entrambi i
   bracci) → tolta (No Blind Fix);
2. *cadenza sbagliata*: moltiplicatore di prova sulla velocità naturale (0,6 / 0,8 / 1,25) → **nessun effetto**, perché in corsa
   la cadenza era sempre al **tetto 2,5**;
3. *strumento*: corsa sintetica perfettamente sincronizzata (gancio di prova `__CPM_PIEDI_SINT252`) → criterio del testimone a
   0,04-0,10: lo strumento regge.

**Cause trovate:**
- `_rap7` (velocità naturale della clip) si calcolava **una volta**, sul canale a cui `_a.run` puntava in quel momento — e dal
  7.518 `_a.run` viene ripuntato a corsa indietro/laterale. Sull'eroe valeva 1,804 (o 2,07 su un'altra pagina) contro 1,081 della
  «jog» che suona davvero.
- Anche corretta, la «jog» ha velocità naturale ~1,83 u/s: col tetto di cadenza 2,5 si sincronizza solo fino a **4,6 u/s**, mentre
  nell'avvicinamento l'eroe corre a **8-10 u/s**.

**Correzione:** velocità naturale letta dalla clip **attiva** (`src/12-three-match-view.jsx:10530-10538`, cache per clip già
esistente) e, per il solo eroe, **clip di corsa vera** `regular-anim-running.glb` (negli asset, mai caricata: caricamento
facoltativo a `:1055-1058`) sopra 5 u/s, con isteresi a 4 u/s, dissolvenza ~0,14 s e cadenza propria (`:10539-10549`, pesi a
`:10759`).

| guardiano `piedi-252` (quota eroe sopra 0,5 m/s col piede a terra) | verde | rosso |
|---|---|---|
| tiro gi0 | 0,157 | 0,294 |
| testa gi1 | 0,298 | 0,488 |
| cross gi16 | 0,193 | 0,644 |
| passaggio gi3 | 0,465 ¹ | 0,225 |
| **mediana** | **0,298** | **0,488** |

¹ su gi3 lo scatto non entra (velocità sotto 4,6 u/s): in una ripetizione con la sonda lo stesso caso ha dato 0,22; è
variabilità della messa in scena di quella scena, non un effetto della correzione. Soglie del guardiano: verde ≤ 0,36, rosso ≥
verde + 0,08.

⚠️ **Non chiuso:** il banco conta ancora **117/117** esecuzioni sopra la soglia 0,10 (tabella in §2). Le mediane scendono in 9
famiglie su 10, ma restano sopra la fascia buona. Residui misurati: la corsa oltre ~8,8 u/s satura anche la clip di scatto
(tetto 2,5), i passaggi fra clip (gesto→riposo) fanno scorrere il piede a radice ferma, e la punizione non cambia (0,57 → 0,58).
Il numero assoluto in headless va validato sul telefono (limite già dichiarato dal banco).

### 2 · Pallone che si teletrasporta in rete al gol — `__CPM_NO_RETE252`, `npm run rete-252`

**Causa** (dal banco, confermata nel codice): al gol accreditato `_golInRete811` (`src/15-live-match.jsx:3050-3066`) afferma il
punto logico 100,6 → x mondo **50,6**, oltre la rete di fondo (49,4, `src/12-three-match-view.jsx:283`, commento di `GOAL_LINE_X`), e il blocco che scrive
per ultimo lo scriveva in un colpo solo.
**Correzione** (`src/12-three-match-view.jsx:11092-11100`): bersaglio **dentro** la rete (x 49,0) e scivolamento a 14 u/s
(≤ 0,7u per fotogramma di scena).

| `rete-252` (gol forzati gi0, gi66, gi113, gi9) | verde | rosso |
|---|---|---|
| passo massimo a ridosso della porta | **0,66-0,72u** | **2,01-4,40u** |
| pallone finale in rete | 4/4 | 4/4 |

### 3 · Eroe immobile negli interventi difensivi — `__CPM_NO_DIF252`, `npm run difesa-252`

**Causa misurata** (sonda fotogramma per fotogramma): l'attesa del contrasto del 7.415 (`src/12-three-match-view.jsx:7717`) tiene
il gesto finché il pallone è oltre 5u — giusto — ma il corpo restava **fermo**: 1,3-1,5 s su gi31/gi130, 2,0 s su gi133 (pallone
a 53u).
**Correzione** (`:7725-7740`, offset applicato a `:6826-6831` sul driver ordinario): durante l'attesa il bersaglio dell'eroe va
verso il punto della traiettoria più vicino (la proiezione del 7.427), fermandosi a 2u; se è già sulla linea va **incontro** al
pallone fino a 3u; tetto 9u, avvicinamento smussato; l'offset resta per la scena (nessun ritorno quando parte il gesto).

| `difesa-252` (quota «fermo e senza gesto» nei primi 2 s) | verde | rosso |
|---|---|---|
| gi133 riesce / sbaglia | 0,07 / 0,05 (9,3 / 10,5u percorsi) | 1 / 1 (0u) |
| gi31 riesce | 0,07 (8,5u) | 1 (0u) |
| gi130 riesce | 0,07 (7,1u) | 0,75 (2,7u) |

Residuo: su gi133 «sbaglia» il gesto degrada a pressing (`_dgFar440`, voluto dal 7.440): l'eroe corre ma non monta una clip — il
banco lo conta ancora come «senza gesto» (1 su 8 in difesa).

### 4 · Rinvio difensivo troppo veloce — `__CPM_NO_RINVIO252`, `npm run rinvio-252`

**Causa:** `resolveDefensiveOutcome` (`src/11-ui-kit-highlight.jsx:2357-2369`) dà a ogni esito una durata d'arco fissa
(0,32-0,60 s) qualunque sia la distanza.
**Correzione** (`src/12-three-match-view.jsx:5421-5429`): durata ≥ distanza / 26 u/s (tetto 1,6 s), arco più alto sui lanci
lunghi; esclusi presa del portiere e gol subito.

| `rinvio-252` (v arco, interventi riusciti) | verde | rosso |
|---|---|---|
| gi133 · gi31 · gi130 · gi31 az.1 · gi146 | 25,0 · 24,8 · 23,9 · 20,7 · 24,8 | 61,1 · 40,4 · 36,4 · 17,9 · 78,1 |

Nel banco resta in difesa un massimo di 58,6 u/s: è il **tiro avversario** del gol subito su gi133 (ramo `toOwnGoal`, 7.773),
non un rinvio — escluso di proposito, va trattato a parte.

### 5 · Portiere tardi o dal lato opposto (111/112) — `__CPM_NO_GK252`, `npm run portiere-252`

**Causa:** su parata e gol la scelta riflesso/tuffo, il lato e il bersaglio del tuffo si decidevano sulla z **finale** dell'arco;
il punto in cui il pallone attraversa il piano del portiere (`_zp229`, già calcolato per tutti gli esiti a
`src/12-three-match-view.jsx:5455`) era usato solo su fuori/palo (7.999.162).
**Correzione** (`:5473-5493`): vale il piano anche su parata/gol; riflesso solo col pallone entro 1,2u (la regola del 7.999.162:
a 1,3-1,5u il riflesso, che trasla poco, arrivava tardi).

| `portiere-252` (criterio identico al banco) | verde | rosso |
|---|---|---|
| portieri in difetto (tardi / lato opposto / fermo) | **0/7** | **3/7** (gi13 lato opposto; gi15 riflesso tardi a 1,27u, ×2) |

Su gi16 (cross intercettato) il portiere non è giudicabile (bruciapelo < 0,20 s) in nessuno dei due bracci.

### 6 · Pallone che «torna indietro» nel build-up aereo — `__CPM_NO_AER252`, `npm run aereo-252`

**Causa misurata** (testimone `__CPM_AER252`): la consegna a fine costruzione aerea (`src/12-three-match-view.jsx:7019` sul
ramo base) scriveva il pallone 3u prima del contatto **da dovunque fosse**. Su gi65 il pallone stava 4,8-5,2u prima del contatto
e 1,9-2,1u di lato: la scrittura era un salto di ~3u **in avanti e di lato** (il banco lo leggeva come «indietro»; resta un
teletrasporto).
**Correzione** (`:7019-7028`): se il pallone è già entro 8u dal contatto lungo la linea del cross (3u di lato), non si riscrive —
la planata esistente `_aerIn52` lo porta al contatto.

| `aereo-252` (salti isolati del pallone, gi65 tre esiti) | verde | rosso |
|---|---|---|
| esecuzioni con salto | **0/3** | **3/3** (2,95-3,15u) |

---

## 2. Banco rigiocato a fine giro (stesso strumento, stessa scelta di scene)

`npm run banco-248:<famiglia>` × 10 + `banco-248:rapporto`, build finale del ramo, 14/10 22:06-22:50. Copertura minima rispettata
in tutte le famiglie (117/118 giudicate, come al giro 21).

| famiglia | pattin. eroe med **prima → dopo** | sopra 0,10 | congelato | salti pallone | portiere KO | v arco max | fuori quadro med |
|---|---|---|---|---|---|---|---|
| tiro | 0,40 → **0,18** | 15/15 | 0 → 0 | 3 → **0** | 0/4 → 0/4 | 21,4 → 21,6 | 0,011 → 0,011 |
| testa | 0,68 → **0,54** | 15/15 | 0 → 0 | 0 → 0 | 1/7 → 2/10 | 10,0 → 10,2 | 0,118 → 0,136 |
| volée | 0,35 → **0,19** | 15/15 | 0 → 0 | 6 → **0** | 1/12 → **0/11** | 29,6 → 29,0 | 0 → 0 |
| cross | 0,85 → **0,21** | 12/12 | 0 → 0 | 0 → 0 | 2/3 → 1/2 | 39,6 → 48,1 ² | 0,023 → 0,067 |
| passaggio | 0,79 → 0,63 | 12/12 | 0 → 0 | 2 → **0** | — | 25,7 → 26,1 | 0,291 → 0,244 |
| dribbling | 0,52 → 0,33 | 8/8 | 0 → 0 | 0 → 0 | — | 21,8 → 22,0 | 0 → 0 |
| contrasto | 0,63 → 0,51 | 8/8 | 1 → **0** | 0 → 0 | — | 51,4 → **26,7** | 0 → 0,102 |
| rigore | 0,26 → 0,25 | 10/10 | 0 → 0 | 0 → 0 | 0/6 → 0/6 | 32,2 → 34,9 | 0 → 0 |
| punizione | 0,57 → 0,58 | 14/14 | 0 → 0 | 0 → 0 | 4/11 → **1/11** | 36,9 → 35,3 | 0,023 → 0,022 |
| difesa | 0,61 → **0,44** | 8/8 | 3 → **0** | 0 → 1 ³ | — | 92,0 → **58,6** ³ | 0,069 → 0 |

Classifica dei difetti (frequenza) prima → dopo: pattinamento 117 → 117 (mediane giù) · teletrasporto del pallone in rete
4/13 gol → **0** · eroe immobile in difesa 4/16 → **0/16** (senza gesto 2 → 1) · portiere 111/112 **8/43 → 4/43** · passo del
pallone nel build-up aereo 5/42 → **0** · fuori quadro 15 → 13 · reazioni avversarie mancanti 5 → 5 · salti di camera 3 → 3.

² cross v arco max 48,1: un'esecuzione, non attribuita; la correzione 4 non tocca i cross (`P.hlDef` falso). **Non posso
confermare** se sia variabilità della scelta del ricevente o altro.
³ difesa: il salto e i 58,6 u/s sono la stessa esecuzione (gi133 «sbaglia», tiro avversario del gol subito, varco `arco` a passi
continui 3,0-3,2u = volo veloce, non teletrasporto). Fuori dall'ambito della voce 4 (rinvio).

Portiere residuo: testa gi1 e gi53 (riflesso a 0,73-0,78u, il portiere si sposta poi dalla parte opposta), cross gi67 (lato),
punizione gi13 (riflesso tardi a 1,65u: probabilmente il ramo `_closeShot203` o un arco non lineare — **non verificato**).

## 3. Voci non affrontate (7-10) e perché

- **7 · eroe fuori quadro** (13/117): sul passaggio è regia voluta (7.522); su punizione/tiro serve prima attribuire quale passata
  di camera sposta il soggetto. Non toccata per non mescolare la regia con questo giro.
- **8 · nessuna reazione avversaria** (5/54): il canale 7.519 dà il gesto solo entro 9u, tetto voluto contro i gesti
  teletrasportati; oltre servirebbe una reazione di **movimento**. Non ho misurato le distanze vere su gi148/gi66: niente rimedio
  cieco.
- **9 · salto isolato della camera** (3/117, tiro gi0/gi66 5,3-5,8u, cross gi16 3,5u — riprodotti identici nel banco di fine giro):
  va prima attribuita la passata che scrive dopo l'arbitro d'inerzia (`__CPM_CAM503`).
- **10 · 001 in catena**: il compito chiede di dimostrare prima che sia il gioco e non lo strumento; non fatto in questo giro.

## 4. Strumenti lasciati

- `tests/visual/lib/scena-252.mjs` — pagina GLB-ON + scena forzata con esito + campionatore per fotogramma in tempo di scena
  (riusato dai sei guardiani).
- Guardiani: `piedi-252`, `rete-252`, `difesa-252`, `rinvio-252`, `portiere-252`, `aereo-252` (script npm, registrati nella mappa
  di `ci-runner.mjs` per `src/12-`). Ognuno esce ≠0 se il braccio rosso non mostra il difetto (prova che il guardiano vede).
- Sonda di diagnosi `sonda-piedi-252.mjs`; testimoni di sola prova `__CPM_PIEDI_EROE`, `__CPM_PIEDI_SINT252`, `__CPM_AER252`,
  `__CPM_RINVIO252`, `__CPM_DIF252`.
- Script npm del banco `banco-248:*` aggiunti a `tests/visual/package.json`.

⚠️ Lezione di strumento del giro: il `rev` di coreutils su righe con caratteri UTF-8 della build è andato in ciclo infinito
(5 processi al 100% di CPU per ~30 minuti, mentre giravano due misure del guardiano dei piedi): quelle due misure non sono
state usate.

## 5. Catena `mirata`

(vedi sezione successiva, aggiornata a fine catena)
