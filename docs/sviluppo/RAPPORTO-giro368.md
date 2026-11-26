# Giro 368 — PO-417 «Nomi senza equivoci»

**Base:** `lavoro/201` (punta `ca852f31` = 7.999.215) · **Ramo:** `sviluppo/giro368-nomi`
**Voce:** PO-417 — «mai lo stesso cognome nelle due squadre in campo, mai frasi come «TESTA addosso», stadi con un nome solo».
GAME_VERSION non toccata (rilascio automatico), docs/governo non toccato, nessun campo nuovo nel salvataggio (le rose sono
derivate, non salvate: nessuna migration).

## Misura (prima → dopo)

Sonda `tests/visual/misura-368.mjs` (funzioni vere del gioco, seme = id del club, deterministica) e guardiano `nomi-368`.

| Cosa | Prima (base 7.999.215, = braccio rosso) | Dopo |
|---|---|---|
| Incontri di lega (CLUBS + Primavera, 3 stagioni, 13.770 coppie ordinate) con almeno un cognome uguale fra i due **undici** | **9.100 (66%)** | **0** |
| … fra le due **rose intere** (23 + eroe) | 13.425 (97%) | 0 |
| Guardiano: 13.970 coppie (lega + 120 coppe fra leghe + ogni coppia di nazionali) | 9.531 / 13.487 | 0 / 0 |
| Cognomi generati (38.640 giocatori, tutte le rose, stagioni 1-6) che sono parole dei testi della partita | testa 53 · cross 27 · mediano 3 | 0 |
| Partite vere con cognome in comune nei due undici | provino «Luca Testa»: Colombo, Spada · pro S12: Bailey | nessuno |
| Primavera: nomi dello stesso stadio fra scheda della giornata e insegna dell'ingresso | 2 («Arena Primavera» casuale · «Stadio Altoadige · Campo Primavera») | 1 |

**Dove escono le parole-cognome (misurato sui testi del gioco, `BG_MATCH`/`SITUATIONS`/`CHAIN_SITS`/`COACH_SHOUTS`):** fra
tutti i cognomi dei pool, solo **Testa** (28 occorrenze di «testa» nei testi) e **Cross** (27 di «cross») sono parole del
racconto. Esempi reali di riga: «la difesa di {A} libera **di testa**», «Ancora un angolo: {A} respinge **di testa**» → con
{A}=Testa diventa «Testa respinge di testa»; «rientro sul mancino e **cross** velenoso» con {H}=Cross. Nei letterali del
narratore (src/14-15) compaiono anche «mediano» (segnaposto di ruolo, e il cognome «Mediano» esiste nel pool italiano),
«franco» («contrasto franco») e «quaranta» («traversone di quaranta metri»). Esempio di collisione misurata: Lega A S1,
FC Zebre contro FC Biancocelesti, «Toni Romano» e «Nico Fiore» hanno il cognome di un giocatore dell'altro undici.

**Stadi:** la scheda della giornata (`stadium` in LiveMatch) per una Primavera e per il provino era `pick(STADIUMS)` —
**casuale a ogni partita** — mentre l'insegna dell'ingresso leggeva il nome dell'impianto del padrone di casa
(`stadiumConfigFor(...).name`). In finale: «Stadio Internazionale — Finale» sulla scheda, «Stadio Nazionale — Finale»
sull'insegna. Per i club pro i due nomi coincidevano già (misurato: «Tyne Park» in entrambi).

## Correzione (alla sorgente, deterministica, rosso `window.__CPM_NO_G368`)

1. **`src/09` `generateTeamRoster`** — un cognome che è parola della cronaca (`_equivoco368`, lessico `_PAROLE368`:
   testa, cross, mediano, franco, quaranta + il lessico del calcio usato nei testi) scala al cognome successivo del pool,
   con gli stessi controlli già presenti (doppione in rosa, nome di un calciatore reale). Cambia **solo** chi lo portava.
2. **`src/09` `contro368(opp, own, club, season)`** (nuova, accanto a `generateTeamRoster`) — la rosa AVVERSARIA cede:
   chi ha il cognome di uno della tua squadra (eroe compreso, cognome letto con `_surnBG` come la cronaca) prende il primo
   cognome libero del pool della sua nazione (ordine seedato dal club e dalla stagione), poi delle nazioni vicine
   (`_VICINI368`: il pool belga ha 30 cognomi e una rosa ne vieta 23 — misurato: senza ripiego restavano 298 incontri della
   Liga Belga), poi di tutte. Nome di battesimo intatto, la tua squadra non cambia mai.
3. **`src/15` LiveMatch** — `_contro368` applicato agli undici avversari (`homeRoster`/`awayRoster`, i due rami
   «avversario») e alla serie dei rigori (`_rosA`); `_stadio368` dà un solo nome a scheda (`MatchdayCard stadium=`) e
   insegna (lower-third dell'ingresso): club → nome dell'impianto vero del padrone di casa; provino e finale → il nome della
   scheda. Testimoni solo-collaudo (con `window.__CPM_TEST368`): `__CPM_ROSE368`, `__CPM_STADIO368`.

## File e funzioni toccati

| File | Cosa |
|---|---|
| `src/09-audio-scout-anagrafiche.jsx` | `generateTeamRoster` (una riga prima di `_usati49.add`); nuove `_no368`, `_PAROLE368`, `_equivoco368`, `_VICINI368`, `contro368` (prima di `seededShuffle`) |
| `src/15-live-match.jsx` | `LiveMatch`: nuova `_contro368` (prima di `homeRoster`), rami avversario di `homeRoster`/`awayRoster`, testimone `__CPM_ROSE368`; `_stadio368` (dopo `crowdCtx`); `stadium=` di `MatchdayCard`; insegna dello stadio nel lower-third; `_rosA` della serie dei rigori |
| `CARRIER-MANAGER-AV.html` | ricomposto (`build-src` + `check-src` IDENTICO) |
| `tests/visual/nomi-368.mjs` | guardiano nuovo |
| `tests/visual/misura-368.mjs` | sonda di misura (neutra: nessuno script la nomina) |
| `tests/visual/package.json` | script `nomi-368` (= verde + `CPM_PROVA_ROSSO=1`) |
| `tests/visual/ci-runner.mjs` | `nomi-368` nella riga MAPPA esistente `src/05|src/09` e in testa alla riga `src/15` |

Nessun file toccato in src/12, 13, 14 (giri 364/367) né nel profilo del calciatore.

## Guardiano `npm run nomi-368` (verde + rosso, ~5 min)

- **A · coppie** (puro, funzioni vere): 13.970 coppie, zero cognomi uguali negli undici e nelle rose, cambia solo chi
  collideva, nome di battesimo intatto, due chiamate identiche; sotto 10.000 coppie = non giudicato.
- **B · parole**: nessun cognome generato (38.640 giocatori) è una parola dei testi della partita letti dal gioco o del
  lessico del guardiano (copia indipendente).
- **C · partite vere**: provino (eroe «Luca Testa») e partite di carriera da salvataggio (pro S12, Primavera W38) fino
  all'ingresso in campo: due undici senza cognomi in comune, un nome solo dello stadio. Fasi `matchday`+`walkout` non viste
  o testimoni vuoti = non giudicato = rosso.
- **Rosso** (`__CPM_NO_G368`): A 9.531 incontri, B testa/cross/mediano, C stadio della Primavera con due nomi → tutti rossi.

Esiti: guardiano verde + rosso visto rosso; `mappa-unica` verde; `node tools/audit-copyright.mjs` 0 hit;
sentinelle `node ci-runner.mjs giro nomi-368`: **18/18 verdi** sul build esatto (nomi-368 301 s · mappa-unica · test:logic ·
save-compat · replay · migrazione-194 · design-system · tema-unico · griglia-mobile · render-3d-023 · tunnel-285 · home-298 ·
web-237 · career-critical · battito-264 · partita-vera 605 s · gk-dive-sync · schermate-97), nessun passo ripetuto.
Le scritture del runner in `docs/governo/STABILITA.json` e `docs/collaudo-grafico/` sono state scartate (non toccare docs/governo).

## Guardiani della zona NON girati (li giudica il treno)

Righe MAPPA `src/05|src/09` e `src/15` tranne `nomi-368` e le sentinelle: in particolare `nomi-182`, `nomi-190`,
`nomi-211`, `nomi-248`, `nomi-251`, `cronaca-nomi-190`, `marcatore-325`, `rigori-296`, `rigore-191`, `lotteria-191`,
`formazioni-262`, `rigorista-249/257`, `spogliatoio-182`, `assist-nome-98`, `partita-vera`, `partita-336`, `coerenza-235`,
`validate-situations` (gate 14/14). Rischio dichiarato: le firme golden non contengono nomi; i guardiani che confrontano
nomi della rosa avversaria fra schermate fuori partita e partita (vedi dubbio 2) sono quelli da guardare.

## Dubbi per il PO (la consigliata è la prima ed è GIÀ APPLICATA)

**1. Chi cambia nome quando i cognomi coincidono?**
- **(a) APPLICATA — l'avversario, solo in quella partita.** La tua squadra resta quella che conosci; l'avversario con lo
  stesso cognome di un tuo compagno gioca con un altro cognome (stabile: stessa partita = stesso nome).
- (b) Nessuno cambia: nelle righe si aggiunge la squadra («Romano dei Granata»). Più lungo, la riga va riscritta ovunque.
- (c) Cognomi unici per lega alla generazione: impossibile coi pool attuali (lega da 20 club × 23 = 460 nomi, il pool
  italiano ne ha 169); richiederebbe pool tre volte più grandi.

**2. Il cognome cambiato si vede anche fuori dalla partita?**
- **(a) APPLICATA — solo in partita** (formazioni, cronaca, tabellino, rigori). Nelle schermate fuori partita (analisi
  dell'avversario, storico) l'avversario mostra la sua rosa di sempre: in quei posti non c'è la tua squadra accanto.
- (b) Applicarlo anche alle schermate pre-partita che nominano giocatori avversari (più punti toccati, src/13/18).
- (c) Rinominare per sempre il giocatore avversario dopo il primo incrocio (servirebbe un campo nel salvataggio).

**3. Quali parole contano come «equivoche»?**
- **(a) APPLICATA — quelle misurate nei testi della partita (testa, cross, mediano, franco, quaranta) più un lessico fisso
  del calcio** (palla, porta, rete, tiro, palo, angolo, fallo, area, punta, ala, terzino, regista, libero, rigore…).
  Oggi nei pool ne cadono solo cinque cognomi: Testa, Cross, Mediano, Franco, Quaranta; i giocatori che li portavano
  (pochi per rosa) prendono il cognome successivo del pool — i nomi già scritti nei salvataggi (marcatori nello storico)
  restano come erano.
- (b) Solo testa e cross (le sole parole nei dati della cronaca), lasciando Mediano/Franco/Quaranta.
- (c) Lessico più largo (anche parole comuni: re, guerra, rosa, conti…): più giocatori rinominati per equivoci rari.

**4. Lo stadio della Primavera: «Stadio X · Campo Primavera» in partita, «Stadio X» nelle schermate di carriera.**
- **(a) APPLICATA — in partita il nome con «· Campo Primavera»** (è il campo satellite del club madre, giro 7.0.1).
- (b) Togliere il suffisso anche in partita: un solo nome identico ovunque, ma si perde «gioca al campo della Primavera».
- (c) Aggiungere il suffisso anche nelle schermate di carriera della Primavera (src/16/18, fuori dal mio ambito).

Restano fuori ambito e dichiarati: il **rivale** di carriera (nome fisso, entra nell'undici avversario dopo `contro368`: se
il suo cognome coincide con quello di un tuo compagno resta così); il **nome dell'eroe** (scelto dal giocatore: se è una
parola, es. «Luca Testa», resta).
