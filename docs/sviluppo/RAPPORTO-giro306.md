# Rapporto giro 306 — `testi-190` rosso sull'unione (7.999.198)

Ramo `sviluppo/giro306-testi`, partito da `prova/198-finale` (0f0b13d8). Nessuna modifica a `src/`, a `CARRIER-MANAGER-AV.html`
o a `GAME_VERSION`: la correzione è **solo nella sonda**. `src/12` e `src/15` non toccati.

## In breve

- `testi-190` era rosso sull'unione **perché la sonda restava ferma sul tasto audio della serata di presentazione**
  (aggiunto dal giro 299), non perché il giocatore non vedesse la scheda del contratto o non potesse cliccare la scelta dell'impulso.
- La regola degli angoli del 299 (`[data-corpo299]`, overflow/raggio 16) **non c'entra**: la scheda del contratto non era tagliata né
  coperta, semplicemente la sonda non era mai arrivata alle schede.
- Il giocatore vede e clicca tutto: misurato con tocchi veri (vedi sotto). **Nessuna correzione nel gioco → nessun rosso
  `__CPM_NO_G306`** (non c'è niente nel gioco da spegnere).
- Sonda aggiornata senza abbassare nulla, anzi con **una voce in più** (15 voci invece di 14).
- `testi-190`: **VERDE 3 corse di fila** sull'unione (15 ok · 0 ko ciascuna).

## 1. Riproduzione

`node testi-190.mjs` su 0f0b13d8, sonda originale: **ROSSO (10 ok · 4 ko)**. Le quattro voci:

```
✗ scheda del contratto vista: «»
✗ il contratto non dice «trascorso»
✗ impulso «wi_dieta_ferrea» aperto (true) e scelta «🥗 La seguo alla lettera» (morale -3) cliccata (false)
✗ accanto al morale negativo: nessuna faccina vista (non giudicato)
```

La quarta voce (non scritta nell'incarico) è «accanto al morale negativo: nessuna faccina vista (non giudicato)»: conseguenza della
terza (scelta mai cliccata → nessuna faccina).

Nota: il ramo `sviluppo/verifica198-r2` non era sul remoto al momento del lavoro (`git ls-remote` non lo elenca), quindi il rapporto
`VERIFICA198-R2.md` **non l'ho potuto leggere**; ho lavorato dalla riproduzione diretta.

## 2. Il meccanismo (misurato)

La sonda attraversa l'apertura di stagione cliccando, a ogni passo, un tasto col nome atteso («Avanza», «Avanti»…); se non lo trova
**ripiega sul primo tasto della pagina che ha del testo**. Dal giro 299 la serata ha in alto a destra il tasto audio
(`data-cpm="audio-serata299"`, testo «🔊»), che nell'ordine della pagina viene **prima** di «Avanti →».

Sonda `tests/visual/misura-306.mjs`, ripiego com'era (`CPM_VECCHIO=1`) — file `docs/sviluppo/giro306/misura-prima.txt`:

```
passo 5: avanzato RIPIEGO su «🏟️ Vai allo stadio»
passo 6: avanzato RIPIEGO su «🔊» {audio-serata299}
passo 7 … 13: avanzato RIPIEGO su «🔊» {audio-serata299}     (otto passi di fila sullo stesso tasto)
strati fissi a tutto schermo dopo l'apertura: serata (z 9997) + audio-pannello (z 9000)
scheda dashboard / carriera / profile / agente / ufficio / club: scheda del contratto assente (sotto c'è ancora la serata)
impulso wi_dieta_ferrea aperto true · tasti con il testo della scelta: 0
```

Cioè: al passo 6 il ripiego apre il pannello dell'audio, e nei passi successivi ri-clicca lo stesso tasto (che non fa più niente, il
pannello è già aperto). I 14 passi finiscono con la serata ancora aperta. `goTab` cambia scheda **sotto** la serata; l'impulso viene
«aperto» dal gancio ma non si mostra finché la serata è su. Da qui le quattro voci rosse.

Con `__CPM_NO_G299` il tasto audio non c'è, il primo tasto torna a essere «Avanti →»: è il motivo per cui la base lavoro/198 era verde
e per cui la verifica ha attribuito il rosso al 299 (attribuzione giusta, ma la causa è il tasto audio, non gli angoli).

### Il giocatore non ha il problema

Sonda `tests/visual/giocatore-306.mjs`, tocchi veri (`page.mouse.click` al centro del tasto), 412×915:

| Cosa | Misura |
|---|---|
| Tasti della serata, cosa c'è al loro centro | «🔊» 49×49 · «Avanti →» 287×45 · «Salta» 76×45 — tutti e tre «se stessi» (niente sopra) |
| Tocco sul tasto audio | pannello aperto, 412×915, **sopra** la serata al centro dello schermo |
| Tocco su «Chiudi» | pannello chiuso |
| Tocchi su «Avanti» | 7 tocchi, si arriva all'ultima scena «🎉 Che la stagione cominci →» |

E con la sonda aggiornata (`misura-dopo.txt`): scheda del contratto 365×29 px, `display:flex`, `visibility:visible`, opacità 1,
nessun antenato che la taglia, al suo centro c'è «se stessa»; il tasto «🥗 La seguo alla lettera» 365×54 px, al suo centro «se stesso».

## 3. Cosa ho cambiato (solo `tests/visual/testi-190.mjs`)

1. **Il ripiego non tocca i comandi che non fanno avanzare**: scarta i tasti `data-cpm="audio-…"` e quelli dentro il pannello
   dell'audio; se trova un pannello dell'audio aperto lo chiude dal suo «Chiudi».
2. **Voce nuova**: «apertura conclusa, niente resta sopra le schede» — rossa se dopo i passi restano la serata, il pannello dell'audio
   o la settimana di apertura. Così un prossimo blocco di questo tipo si legge col suo nome, non come «scheda del contratto vuota».
3. Sotto `CPM_DEBUG` la sonda dice quale tasto ha preso il ripiego e perché un clic è fallito.

Nessuna soglia toccata, nessuna voce tolta: le 14 voci di prima sono identiche, più una.

## 4. Foto

Cartella `docs/sviluppo/giro306/`:

| File | Cosa mostra |
|---|---|
| `scheda-agente-prima.png` | PRIMA (sonda vecchia): sulla scheda Agente c'è ancora la serata col pannello dell'audio; il contratto non si vede |
| `contratto-pagina-dopo.png` | DOPO: la scheda Agente con «Il tuo contratto» — «Contratto in corso · scade a fine St. 9 · 3 stagioni» |
| `contratto-dopo.png` | DOPO: il solo riquadro `contratto-v2` |
| `impulso-prima.png` | PRIMA: l'impulso «aperto» ma a schermo c'è il pannello dell'audio sulla serata |
| `impulso-dopo.png` | DOPO: il foglio «Impulso della settimana» con le due scelte cliccabili |

«Prima» e «dopo» qui sono **la stessa versione del gioco**: cambia solo il percorso della sonda. Non esiste una foto «prima/dopo» del
gioco perché il gioco non è cambiato.

## 5. Controlli

Eseguiti uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`.

| Controllo | Esito |
|---|---|
| `testi-190` (sonda originale, riproduzione) | ROSSO 10 ok · 4 ko |
| `testi-190` corsa 1 / 2 / 3 (sonda aggiornata) | VERDE · VERDE · VERDE (15 ok · 0 ko) |
| `test:logic` | VERDE (51 pass · 0 fail) |
| `save-compat` | VERDE (12 pass · 0 fail) |
| `tema-unico` (verde + rosso atteso) | VERDE |
| `design-system` | VERDE |
| `griglia-mobile` | VERDE (uscita 0, 14 schermate × 5 larghezze) |
| `rosa-angoli-299` | VERDE (verde: 0 falliti su 24 · rosso: cade su A, B, C · non giudicati 0) — 10 min 26 s |
| `ritocchi-302` | VERDE (rosso atteso: cade su A, B, C) |

`build-src` / `check-src` non eseguiti: `src/` non è stato toccato. Le foto di `docs/collaudo-grafico/` e di `docs/sviluppo/giro302/` rigenerate da
`griglia-mobile` e `ritocchi-302` sono state rimesse con `git restore`.

## Dubbi per il PO

1. **Il rosso `__CPM_NO_G306` non esiste**, perché non c'è una correzione nel gioco. Se si preferisce comunque un interruttore, va
   deciso cosa dovrebbe spegnere.
2. **Ordine dei tasti nella serata.** Il tasto audio è il primo tasto della serata nell'ordine della pagina. Col tocco non cambia
   nulla; con tastiera o lettore di schermo è il primo che si incontra, prima di «Avanti». Non l'ho misurato come difetto e non l'ho
   toccato: è una scelta.
3. **Altre sonde con lo stesso ripiego.** Non ho censito se altri controlli che attraversano l'apertura di stagione usano un ripiego
   «primo tasto della pagina». Se ce ne sono, possono fermarsi sul tasto audio allo stesso modo.
4. **Colore del bordo del corpo «Il tuo contratto».** Nella foto `contratto-pagina-dopo.png` il corpo della fisarmonica ha un filo
   rossastro ai lati e sotto, la testata no. Solo osservato in foto, non misurato; non so se è voluto (stato «sottopagato») o un
   residuo della regola degli angoli.
5. **`VERIFICA198-R2.md` non letto** (ramo non presente sul remoto): se conteneva altre voci oltre `testi-190`, qui non sono trattate.
