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

¹ Il «prima» sceglie con `Math.random`: in un secondo giro sullo stesso codice di prima (braccio rosso del
guardiano) la stagione da professionista ha dato **7 ripetute su 39 (17,9%)** e 2 domande sui fatti (5,9%).
La Primavera è risultata identica nei due giri (13 ripetute). Il «dopo» è seedato: nessuna variazione.

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
| `interviste-183` (nuovo) — verde: 0 ripetute, post ≤ 45% delle partite, fatti ≥ 60%; rosso deve fallire; «non giudicato» = rosso | ESITO_183 |
| `intervista-231` (non rompere) | ESITO_231 |
| `box-fischio-169` (non rompere) | ESITO_169 |
| `momento-173` (non rompere) | ESITO_173 |
| altri dell'area | ESITO_ALTRI |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE** dopo ogni modifica a src/.

## Foto

Tre domande nuove (derby vinto, gol all'ex club, rimonta), telefono 412×915 e PC 1280×900, in
`docs/sviluppo/giro183/` (sonda `tests/visual/foto-183.mjs`, hook di prova `__CPM_CAREER.forceIv183`).

FOTO_ELENCO

## Dubbi e cose fuori ambito (per il PO, nessuna decisione presa)

- **Frequenza in Primavera molto bassa**: 4 interviste post partita su 34 (in Primavera la posta è rara:
  niente coppe europee, Nazionale, contratti). È coerente con la regola decisa, ma è un calo forte rispetto
  a 34. Se è troppo poco, la leva è la sorpresa (1 su 8 oggi): da decidere.
- **Rigore sbagliato ed errore dell'eroe**: richiesti fra i fatti, ma **non** sono nel risultato registrato
  della partita (`_buildEndResult` in src/15 porta gol, assist, voto, rimonta, espulsione, panchina). Per
  chiederli bisogna aggiungere quei campi in `LiveMatch` (src/15): non fatto, perché toccare src/15 apre la
  catena del motore.
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
