# Rapporto giro 52 — scheda del pari dal fatto del finale · residui PO-260 / PO-246 / PO-234 / PO-226

Ramo `sviluppo/schede-finale-giro52`, base `lavoro/172-base` (7.999.171). `GAME_VERSION` e `SAVE_VERSION` **non** cambiate
(il rilascio lo fa la sessione di rilascio). Zona G non toccata. Toccati: `src/14-motore-possesso.jsx`, `src/15-live-match.jsx`,
il guardiano nuovo `schede-finale`, il banco di `schede-259` (una prova in più, un caso aggiornato) e lo strumento `sonda-promessa52`.

Condizioni di tutte le misure in partita (le stesse del giro 44): salvataggio `fixtures/save-194-primavera-w38.json`, partita vera
di carriera (`playMatch`), pilota automatico seedato, velocità 4, GLB spento, `?cpmtest=1`, headless, scheda scelta i%3 dopo 1,5 s.
Ogni build è stata congelata in una copia di lavoro separata (`git worktree`) prima di misurarla. Strumento: `misura-226.mjs` +
`analizza-226.mjs`, **30 partite per braccio** (stessi 30 nomi, quindi stessi semi). Dati in `docs/sviluppo/dati-giro52/`.

## In breve

| | esito |
|---|---|
| **Fatto del finale + rete** (decisione PO 16/10) | fatto. La scheda del pari nasce da un tiro pericoloso o da un'occasione dopo il 75'; senza fatto, all'81'. Interruttore `__CPM_NO_FIN252b`, guardiano `schede-finale` verde e rosso riconosciuto. |
| **PO-260** scheda sopra highlight/cerimonia | rimisurata sulla 171: **0** campioni fuori dal gioco su 30 partite. Niente da correggere. |
| **PO-246** scheda senza risposta | rimisurata sulla 171: 35 schede, 35 scelte arrivate al motore, `schede-246` verde. Niente da correggere. |
| **PO-234** indicazioni e 3 opzioni | rilette le schede vive (INT259): 8 su 8 con 3 opzioni, nessun «ordine del mister». Niente da correggere. |
| **PO-226** promessa vuota | **misurata la causa e corretta in parte** (interruttore `__CPM_NO_PROM52`); un secondo caso (tetto di 7 scene) va deciso dal PO. |

## 1) La scheda del pari nasce da un fatto del finale

**Prima** (base 171, 30 partite): 10 schede «pari nel finale» — **75' sette volte**, 76' due volte, 81' una volta. È il primo minuto
ammesso: un orologio (lo stesso quadro del giro 44, 6 su 8 al 75').

**La regola nuova** (`INT259.finale`, src/14; il live data il fatto, src/15):
- il **fatto** è un tiro in porta, un legno o un tiro pericoloso (xG ≥ 0,2) di una delle due squadre, oppure un'occasione dell'eroe nel
  motore, **dal 75' in poi**. Si legge dal tabellino del motore confrontando un minuto col precedente: nessun sorteggio;
- la scheda del pari si apre se il fatto è **recente** (al massimo tre minuti, come gli altri fatti rari di PO-259);
- se il fatto non arriva, la **rete di sicurezza** apre la scheda all'**81'**;
- il testo dice il fatto: «Pari al 79': ci hanno appena fatto tremare…» (tiro loro) oppure «…quell'occasione ha acceso lo stadio…»
  (occasione nostra); dalla rete resta il testo di prima.
I valori 75' / 81' / tre minuti / xG 0,2 sono una **scelta di progetto dichiarata**, non vengono da una fonte.

**Dopo** (build finale, stesse 30 partite):

| minuto | base 171 | giro 52 |
|---|---|---|
| 75' | 7 | 2 (entrambe con un fatto al 75': un tiro loro, un'occasione nostra) |
| 76' | 2 | 1 (tiro loro al 75') |
| 79' | 0 | 2 (tiro loro al 79', occasione nostra al 79') |
| 81' | 1 | 3 (una dopo un tiro loro al 79', due dalla rete) |
| **totale** | 10 | 8 |

Su 8 schede: **6 nate da un fatto** (4 tiri loro, 2 occasioni nostre), **2 dalla rete**. Minuti distinti: 2 → 4.
⚠️ Le due colonne non giocano esattamente le stesse partite: le partite divergono fra due giri già prima di ogni scheda (il rosso
preesistente di `seme-a`, giro 44). Due pari della base (p16, p28) nel giro 52 non c'erano più al 75' (p16 2-1 → 1-2 con
un'espulsione loro all'81'; p28 sotto di uno all'81'). Il confronto vale come distribuzione, non partita per partita.
⚠️ Due schede su otto nascono ancora al 75': il fatto è caduto proprio fra il 74' e il 75'. È la regola, non l'orologio (il testimone
porta il fatto e il suo minuto), ma su 30 partite **non posso confermare** quanto spesso capiterà.

**Guardiano `schede-finale`** (`npm run schede-finale`):
- (A) regola pura in node: 5/5 pari senza fatto restano muti (75', 80', fatto vecchio, fatto prima del 75', 1-0 con un tiro), 4/4 con
  fatto o rete aprono la scheda; il testo cambia col fatto. Rosso `__CPM_NO_FIN252b`: pari al 75' senza fatto → scheda (riconosciuto).
- (B) 4 partite vere: ogni scheda del pari ha un fatto datato o è nata dalla rete. Verde: 1 scheda (79', dopo un tiro loro al 79'), 0
  senza fatto. Rosso (`CPM_ROSSO=1`, stesse partite): 1 scheda al 75' senza fatto → riconosciuto.
  ⚠️ 4 partite danno poche schede del pari (1 per braccio): la parte B è un controllo di coerenza, la prova vera è la parte A.
`schede-259` (A) aggiornato: il caso «pari al 77'» ora porta un fatto al 76' (la regola nuova lo pretende).

## 2) PO-260 e PO-246 — rimisurati sulla 171, già a posto

Censimento base 171, 30 partite: 35 schede · **35 scelte arrivate al motore** · 35 racconti · **0 campioni con la scheda a schermo
fuori dal gioco fluido** (highlight o cerimonia). Build finale: 34 / 34 / 34 / 0. Guardiani sulla build finale: `schede-260` verde
(0 campioni fuori dal gioco, 2 partite) e rosso riconosciuto (31 campioni dentro l'highlight del 71'); `schede-246` verde (0 minuti a
scheda aperta) e rosso riconosciuto (70'→74'). Il giro 44 è entrato nella 7.999.171 e i difetti misurati allora non si ripresentano.
⚠️ Le misure sono col pilota: **non posso confermare** cosa vede una persona sul telefono, il collaudo 3D del PO resta il giudice.

## 3) PO-234 — rilette le schede vive

Il sistema vivo è INT259 (PO-259). Lette in node tutte le 8 schede: **3 opzioni ciascuna**, ciascuna con premio e rischio; la parola
«ordine» compare una volta sola, in «rimettiamo ordine col pallone» (rigore contro), che non è un ordine del mister. `schede-234`
(che custodisce il vecchio sistema SCHEDE226, ancora vivo sotto rosso) verde. Niente da correggere.

## 4) PO-226 — perché la promessa «la risolvo io» resta vuota

**Misura di partenza** (base 171, 30 partite): dopo la scelta «eroe» il prossimo highlight dell'eroe arriva **8 volte su 13** (mediana
4'); l'occasione dell'eroe nel motore entro 5' **5 su 13**.

**La causa, misurata** con una sonda nuova (`sonda-promessa52.mjs`: minuto per minuto, dal motore, chi ha palla, dove sta l'eroe,
ultima occasione, richiesta della scheda) sulle tre partite in cui la promessa era vuota (p2, p5, p17; base 171):
1. **p2, p5**: dopo la scelta l'eroe la palla la riceve, ma **sulla trequarti** (x 57-61), e l'occasione dell'eroe nasce solo dall'ultimo
   terzo (avanzamento ≥ 64). p5: palla all'eroe all'82' e all'84' a x 57-61, nessuna occasione fino al 87' e oltre; p2: occasione
   all'85', 10' dopo la scelta. La leva del giro 44 (i compagni lo cercano) funziona, ma la palla gli arriva troppo indietro.
2. **p17**: l'occasione nel motore arriva (82'), ma l'eroe aveva già giocato **7 scene**: il tetto PO di 7 (PO-221) non apre la scena.
   La promessa è mantenuta dal motore e resta invisibile.
(Il possesso della squadra, nei campioni con un padrone, è 15-21% per tutta la partita anche prima della scelta: non è la scelta che
toglie palla. ⚠️ Il campione conta solo la palla con un padrone, quindi è una misura parziale del possesso.)

**Correzione del caso 1** (rosso `__CPM_NO_PROM52`, src/14 `_occV2Pronta`): finché la promessa è aperta, la palla buona è quella
ricevuta **dalla trequarti** (soglia 56 invece di 64). Valore di progetto dichiarato. Si spegne anche col rosso del giro 44
(`__CPM_NO_PROM44`), perché è la stessa promessa.
- Banco (`schede-259` B, 192 partite per braccio, stessi semi): attesa della prossima occasione dell'eroe **2,0'** contro **3,1'** col
  rosso; occasioni 132 contro 130. Il banco ora lo pretende (prova nuova, verde).
- Partita vera (30 partite, indicativo): prossimo highlight dopo «eroe» **9 su 13** (mediana 3') contro 8 su 13 (4'); occasione nel motore
  entro 5' 5 su 13 come prima. Lo spostamento è piccolo e le partite divergono fra due giri: **non posso confermare** un miglioramento
  in partita vera da questi numeri; il guardiano della leva resta il banco.

**Il caso 2 è una decisione del PO, non applicata**: quando l'eroe ha già giocato 7 scene, l'opzione «Voglio il pallone, ci penso io»
promette una palla che il tetto non lascerà mai vedere. Proposte: (a) la scheda non offre la promessa a tetto raggiunto (terza opzione
diversa); (b) la promessa vale una scena oltre il tetto; (c) il premio scritto cambia a tetto raggiunto. Frequenza misurata: 1 caso su 13
scelte «eroe» nella base.

## Esiti dei guardiani

Tutti sulla **build finale congelata** (file di gioco identico al commit consegnato), dentro il turno.

| guardiano | esito |
|---|---|
| `schede-finale` (nuovo) | ✅ verde · rosso `__CPM_NO_FIN252b` riconosciuto (A e B) |
| `schede-259` | ✅ verde — A 9/9 e 7/7 · B banco: 0 premi smentiti, leva 132 contro 115, soglia della trequarti 2,0' contro 3,1' · C 4 partite, 1,25 schede/partita, motore 5/5, racconti 5/5 · rosso riconosciuto. ⚠️ La prima corsa è caduta in C su 3 pagine mai caricate (`__CPM_CAREER` assente, tre guardiani insieme sulla macchina): parte C rifatta da sola (`CPM_SOLO_BROWSER=1`), verde |
| `schede-260` | ✅ verde · rosso riconosciuto |
| `schede-246` | ✅ verde · rosso riconosciuto |
| `schede-234` (parti A-B) | ✅ verde |
| `interazioni-226` (parti node) | ✅ verde |
| `test:logic` | ✅ 43/43 |
| `replay` | ✅ verde (8 highlight) |
| `tempo-138` | ✅ verde (e il rosso si vede) |
| `partita-vera` | ✅ verde — «le bande d'accettazione tengono» |

Log in `docs/sviluppo/dati-giro52/catena/`. Nota di metodo: nella misura a 30 partite della prima build una pagina (p16) non si è caricata: rifatta da sola. `seme-a` non eseguito (rosso preesistente, giro 44).

`node tools/check-src.mjs`: file ricomposto identico byte per byte ai frammenti.

## Cosa resta aperto

- **Tetto di 7 scene e promessa dell'eroe** (sopra): decisione del PO.
- Le altre schede di punteggio restano a soglia di minuto: «sotto di uno» al 70' (5 su 8 nella base, le altre 71'-75'), «avanti di uno» all'82'-83' (8 su 8).
  La decisione del PO del 16/10 riguarda il pari; estendere il fatto del finale anche a queste è una proposta, **non applicata**.
- Misure headless col pilota: il «quanto si sente» va collaudato dal PO.
