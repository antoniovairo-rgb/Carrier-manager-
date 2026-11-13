# Rapporto giro 183b — interviste meno frequenti e più varie (PO-375)

Ramo `sviluppo/giro183-interviste`, partito da `origin/lavoro/192`. Rifacimento del giro 183 (la sessione
precedente si era fermata senza salvare). `GAME_VERSION` **non toccato** (regola fissa del giro).

## La domanda del PO

> «le interviste non pensi che siano troppe? non vorrei che annoiassero il player, alla lunga sono sempre le
> stesse cose da dire»

Decisioni del PO («Meno e più varie»): (1) intervista solo dopo le partite con posta, più rare interviste a
sorpresa; (2) domande legate ai fatti veri della partita; (3) mai la stessa domanda nella stessa stagione.

## Come si è misurato

Sonda nuova `tests/visual/interviste-183.mjs` (è anche il guardiano). Gioca **una stagione di Primavera**
(Primavera 2, stagione 1) e **una da professionista** (Deutsche Liga, stagione 2) con gli handler veri della
carriera (`__CPM_CAREER.step`, partite simulate, Nazionale simulata). Dopo ogni partita chiede al gioco se
ci sarebbe l'intervista e con quale domanda — la stessa funzione del percorso vero (`intervista183`) — e si
porta dietro la memoria della stagione come farebbe il salvataggio. Conta anche le interviste della
settimana (15% da professionista, 4% in Primavera: tasso del gioco, sorteggio seedato dalla sonda).

«Legata ai fatti» = domanda del catalogo nuovo dei fatti (`IV_FATTI183`) oppure domanda vecchia con una
condizione che legge la partita (`cond` su `matchResult`/`isHome`, es. «Il tuo gol è stato decisivo»).

⚠️ Limite dichiarato della misura: le partite sono **simulate**, quindi il risultato registrato non porta
`wasBehind` né l'espulsione (le domande «rimonta» ed «espulso» non possono uscire nella sonda, ma escono dal
vivo). Le interviste vere dopo una partita giocata sono provate da `intervista-231` (sotto).

## Tabella prima / dopo

Una stagione per riga, 34 partite ciascuna.

| Stagione | | Interviste post partita | % delle partite | Interviste della settimana | Domande totali | Domande diverse | Ripetute nella stagione | Legate ai fatti (post partita) |
|---|---|---|---|---|---|---|---|---|
| Primavera | **prima** | 34 | 100% | 2 | 36 | 23 | **13 (36,1%)** | 0 (0%) |
| Primavera | **dopo** | 4 | 11,8% | 2 | 6 | 6 | **0** | 4 (100%) |
| Professionista | **prima** | 34 | 100% | 5 | 39 | 37 | **2 (5,1%)** ¹ | 0 (0%) |
| Professionista | **dopo** | 14 | 41,2% | 5 | 19 | 19 | **0** | 13 (92,9%) |

¹ Il «prima» sceglie con `Math.random`, e le partite simulate hanno risultati casuali: i numeri si muovono
fra un giro e l'altro. Quattro giri in tutto (uno sul codice di partenza, tre come braccio rosso del guardiano):

| | Giro | Post partita | Ripetute | Fatti |
|---|---|---|---|---|
| Primavera prima | 1 · 2 · 3 · 4 | 34 sempre | 13 · 13 · 11 · 14 (su 36) | 0% sempre |
| Professionista prima | 1 · 2 · 3 · 4 | 34 sempre | 2 · 7 · 2 · 3 (su 39) | 0% · 5,9% · 5,9% · 5,9% |
| Primavera dopo | 1 · 2 · 3 | 4 · 4 · 4 | 0 · 0 · 0 | 100% · 100% · 100% |
| Professionista dopo | 1 · 2 · 3 | 14 · 17 · 15 (41-50%) | 0 · 0 · 0 | 92,9% · 76,5% · 100% |

Nel «dopo» la scelta della domanda e la sorpresa sono seedate; cambia solo quante partite hanno posta,
perché la classifica della stagione simulata cambia (nel giro con 17 la squadra era in testa: 6 «corsa al
titolo» e 5 «scontro al vertice»).

Perché è uscita l'intervista, stagione da professionista «dopo»: sorpresa 3 · scontro diretto 2 · sfida
alla capolista 2 · corsa al titolo 2 · finale di stagione 2 · scontro al vertice 1 · rivale 1 · primo match
dopo l'infortunio 1. Primavera «dopo»: scontro diretto 2 · finale di stagione 1 · sorpresa 1.

## Cosa è cambiato

Tutto in `src/07` (logica e catalogo), `src/18` (i quattro punti dove nasce un'intervista), `src/17`
(migrazione).

1. **Quando**: l'intervista post partita esce solo se la partita ha **posta** (`posta165` di src/08: coppe,
   coppe europee, Nazionale, derby, ex club, rivale, scontro al vertice / sfida alle prime tre, corsa al
   titolo, salvezza, scontro diretto, finale di stagione, traguardi di presenze e gol, primo match dopo
   l'infortunio, contratto in bilico), oppure dopo una **tripletta**, oppure **a sorpresa una volta su otto**
   nelle altre partite. La sorpresa è seedata su nome + stagione + settimana + avversario (nessun
   `Math.random`: ricaricando la partita non cambia).
2. **Cosa si chiede**: catalogo nuovo `IV_FATTI183` di **37 domande** in italiano, tre risposte ciascuna
   (diplomatico / diretto / umile, con effetti nello stesso ordine di grandezza delle domande esistenti),
   nessuna persona reale. Fatti coperti: derby (vinto / perso / pari), rivale, ex club (e gol all'ex club),
   classifica (vertice, titolo, salvezza, scontro diretto, finale di stagione), traguardi (presenze, gol),
   rientro dall'infortunio, contratto, coppa, Europa, Nazionale (e gol in Nazionale), tripletta, doppietta,
   gol, assist, voto alto, voto basso, rimonta, espulsione. 30 sono marcate adatte alla Primavera (`y:1`).
   L'ordine di scelta: fatti della **posta** → fatti della **tua partita** → domande vecchie del risultato
   che leggono la partita → domande vecchie del risultato. Le domande generiche della settimana non escono
   più dopo una partita.
3. **Mai due volte nella stagione**: memoria `player.ivMem183 = {s: stagione, h: [hash delle domande]}` nel
   salvataggio. Vale per il post partita, per le interviste della settimana e per la conferenza
   pre-partita. Con la stagione nuova la memoria vale vuota. A catalogo esaurito l'intervista **salta**
   invece di ripetersi. Migrazione idempotente in `migratePlayer` (campo assente o malformato → vuoto),
   nessun bump di `SAVE_VERSION`.

Rosso: `window.__CPM_NO_G183` = comportamento di prima (intervista dopo ogni partita, scelta col ricordo
delle sole ultime 10 domande, che si perdeva al ricaricamento).

## Guardiani

| Guardiano | Esito |
|---|---|
| `interviste-183` (nuovo) — verde: 0 ripetute; ogni intervista ha un motivo (posta, tripletta, sorpresa) e non dopo ogni partita; sorprese ≤ ¼ delle partite senza posta; fatti ≥ 60%. Il rosso `__CPM_NO_G183` deve fallire; «non giudicato» (meno di 20 partite o zero interviste) = rosso | **verde**, rosso visibile (ultimo giro sul build finale) ² |
| `intervista-231` (non rompere) | primo giro **rosso**: il suo braccio rosso (`__CPM_NO_IV231`) non si vedeva più, perché la decisione nuova scavalcava l'interruttore. Corretto (con `__CPM_NO_IV231` torna il sorteggio di prima) → **verde**, i due rossi si vedono ³ |
| `box-fischio-169` (non rompere) | **rosso** due volte sul ramo (un caso «PC/sconfitta riquadro non trovato» su 51; poi foto del riquadro larga zero). Provato sul codice di base `origin/lavoro/192` in una copia separata: **rosso anche lì**, sullo stesso caso PC/sconfitta (foto del riquadro vuota, contrasto 1,15). Il guardiano usa una partita aperta senza carriera e il riquadro sta in src/15, non toccato: instabilità preesistente, non riparata (fuori ambito) |
| `momento-173` (non rompere) | **verde** (19 verdi, 0 rossi) |
| `conferenza-192` | primo giro **rosso** («filtro non trovato in src/18»: il guardiano rilegge la riga del filtro della conferenza e la mia aggiunta l'aveva cambiata). Spostata la memoria su una riga separata, riga originale intatta → **verde** |
| `toast-intervista-247` · `migrazione-194` · `save-compat` (12/0) · `test:logic` (51/0) · `career-critical` | **verdi** |
| `foto-183` (sonda delle foto, non guardiano) | 6 foto, finestra aperta e domanda giusta in tutte |

² Il criterio di frequenza all'inizio era «post partita ≤ 45% delle partite», fissato da me su un solo giro:
al secondo giro il professionista ha dato 50% (classifica diversa, non un difetto). Non ho alzato la soglia:
l'ho **sostituita** con la regola decisa dal PO (motivo di ogni intervista + quota di sorprese), verificata
sui dati di tutti e tre i giri (verde passa, rosso cade). Lo segnalo perché è un cambio di criterio dopo la
misura.

³ `intervista-231` è stato eseguito sul build prima di due ritocchi successivi (memoria della conferenza
pre-partita su riga separata, hook di prova `forceIv183`), che non toccano l'intervista post partita: non
l'ho rieseguito.

`node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** dopo ogni modifica a src/.

## Foto

Tre domande nuove (derby vinto, gol all'ex club, rimonta), telefono 412×915 e PC 1280×900, in
`docs/sviluppo/giro183/` (sonda `tests/visual/foto-183.mjs`, hook di prova `__CPM_CAREER.forceIv183`).

- `intervista-derby-vinto-telefono.png` · `intervista-derby-vinto-pc.png` — «Il derby è vostro. Cosa significa vincere una partita così davanti alla vostra gente?»
- `intervista-gol-ex-club-telefono.png` · `intervista-gol-ex-club-pc.png` — «Hai segnato al tuo ex club. Perché hai scelto di esultare così?»
- `intervista-rimonta-telefono.png` · `intervista-rimonta-pc.png` — «Eravate sotto e l'avete ribaltata. Cosa vi siete detti nello spogliatoio?»

Nota: nel gioco il tono «diretto» si legge «AMBIZIOSO» (etichetta già esistente, non toccata).

## Dubbi e cose fuori ambito (per il PO, nessuna decisione presa)

- **Frequenza in Primavera molto bassa**: 4 interviste post partita su 34 (in Primavera la posta è rara:
  niente coppe europee, Nazionale, contratti). È coerente con la regola decisa, ma è un calo forte rispetto
  a 34. Se è troppo poco, la leva è la sorpresa (1 su 8 oggi): da decidere.
- **Rigore sbagliato ed errore dell'eroe**: richiesti fra i fatti, ma **non** sono nel risultato registrato
  della partita (`_buildEndResult` in src/15 porta gol, assist, voto, rimonta, espulsione, panchina). Per
  chiederli bisogna aggiungere quei campi in `LiveMatch` (src/15): non fatto, perché toccare src/15 apre la
  catena del motore.
- **Rituale non completo**: nessun bump di versione (regola del giro), nessuna promozione su `main`, nessuna riga di roadmap scritta: il lavoro è sul ramo `sviluppo/giro183-interviste`.
- **Catena mirata**: l'esecutore (`ci-runner.mjs mirata`, base `origin/lavoro/192`) per i file toccati
  calcola **87 passi**, fra cui `highlight-95`, che le regole fisse di questo giro vietano se non si toccano
  src/04, 12, 14, 15. Ho eseguito uno alla volta i guardiani dell'area interviste/carriera (tabella sopra)
  invece della mirata intera: la mirata completa **non è stata eseguita**.
- **Interviste della settimana**: la loro frequenza (15% / 4%) non è cambiata — la decisione del PO
  riguardava il post partita. Ora non ripetono più domande nella stagione.
- La conferenza pre-partita (solo partite con peso ≥ 7) ha 7 domande: con la memoria, dopo 7 conferenze in
  una stagione la conferenza salta. Non misurato quante volte succede.
- Ho aggiunto `interviste-183` alla catena `carriera`, alla lista dei lenti e alla mappa dei file `src/0*`
  e `src/18` di `ci-runner.mjs` (e `intervista-231` alla mappa `src/0*`, perché ora src/07 decide
  l'intervista).
