# Giro 155: correzioni dei bassi trovati dal giro 140, più PO-358 e PO-359

Branch `sviluppo/giro155-bassi`, partito da `lavoro/189` (commit `0d4915e`). `GAME_VERSION` non è stato toccato.
Nel salvataggio non c'è nessun campo nuovo: `cup.club`, `playedMd` e `matchHistory[].season` esistevano già, e ora vengono scritti nel momento in cui il dato nasce. Il Legacy Score non è salvato: si ricalcola dal giocatore ogni volta.

**Interruttore rosso unico:** `window.__CPM_NO_G155` spegne tutte le correzioni insieme.
Il sotto-codice `window.__CPM_NO_G155_<codice>` ne spegne una sola. I codici sono B1, B2, B3, B6, B8, B10, B11, B12, B13, D9, D10, D14, D15, D17, D21, L358 e T359.

**Guardiano nuovo:** `npm run bassi-155` (`tests/visual/bassi-155-test.mjs`) riunisce le 17 prove e le gira in tre bracci:
- **A, verde:** nessun interruttore acceso.
- **B, rosso per codice:** per ogni prova si accende solo il suo sotto-codice, nella stessa pagina.
- **C, rosso unico:** `__CPM_NO_G155` acceso dal caricamento della pagina.

Il guardiano passa solo se tutte le prove sono verdi in A e rosse sia in B che in C.
Una prova «non giudicata» conta come rossa in A e come «rosso non caduto» in B e C.
Il guardiano controlla anche, leggendo l'HTML, che ogni funzione provata sia davvero usata nel punto dove viveva il difetto.
Il risultato completo è in `docs/sviluppo/giro155/bassi-155.json`.

| Braccio | B1 | B2 | B3 | B6 | B8 | B10 | B11 | B13 | D9 | D10 | D14 | D15 | L358 | T359 | B12 | D17 | D21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A verde | V | V | V | V | V | V | V | V | V | V | V | V | V | V | V | V | V |
| B rosso per codice | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R |
| C rosso unico | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R |

## 1. Difetti: prima, dopo e prova

La colonna «prima» è la misura con la correzione spenta (braccio B), che riproduce il codice della 7.999.188 visto dal giro 140. La colonna «dopo» è il braccio A.

| Difetto | Dove | Prima | Dopo | Prova |
|---|---|---|---|---|
| **B1** Trofeo d'Oro, ordine non spiegato | `src/16` `trofeiOro155`, riga del podio del gala e della scheda «chi ti ha battuto» | Riga senza trofei (`""`) | `· 🏆 campione · coppa nazionale`: ora la riga mostra tutte e quattro le voci del sottotitolo (OVR, gol, assist, trofei) | bassi-155 B1 |
| **B2** «Sotto il mercato» con stipendio sopra la stima | `src/06` `sottopagato155`, agente `src/18` | Stima 67.308 a settimana, stipendio 70.673 → **sottopagato** | Stessa coppia → **non sottopagato**. Il giudizio ora usa la stima mostrata (con il prestigio del club): sottopagato vuol dire sotto l'80% di quella stima | bassi-155 B2 |
| **B3** Impulso «TV la sera prima della gara» a stagione chiusa | `src/03` `wi_tv_primaserata` | Esce a W39 senza gare | Esce solo se `_gara154(p)` (c'è una gara questa settimana); con la gara esce ancora | bassi-155 B3 |
| **B6** (prima metà) Popolarità dichiarata ≠ applicata | `src/05` `popAvviso155`, avviso dell'impulso `src/18` | L'avviso diceva `+3`, il gioco applicava `+1` | L'avviso dice `+1`, cioè `popGain` + tetto: lo stesso numero applicato | bassi-155 B6 |
| **B8** «Prima parte con il FC …» | `src/16` `etichettaPrimaParte155`, `src/18` | «Prima parte con il FC Clermont:» | «Prima parte: FC Clermont —», senza articolo (prima delle due formule proposte dal rapporto 140) | bassi-155 B8 |
| **B10** «CAMPIONI D'EUROPA!» insieme a «IN EUROPA! … qualificato» | `src/16` `bannerEuropa155` | «🎉 IN EUROPA! 🎉 / qualificato in Coppa dei Campioni!» | Con la coppa europea appena vinta: «🏆 E L'ANNO PROSSIMO SI DIFENDE IL TITOLO / … di nuovo in Coppa dei Campioni.» (su un'altra coppa: «🏆 DI NUOVO IN EUROPA»). Senza coppa vinta il banner non cambia | bassi-155 B10 |
| **B11** (seconda metà) Stagioni nella lettera d'addio | `src/17` `stagioniLettera155` | Lettera 17, intestazione 18 | Lettera 18, intestazione 18 (stesso `stagioniGiocate94`) | bassi-155 B11 |
| **B12** Tasto di fine stagione sotto la piega | `src/16`, piede `data-cpm="fine155-piede"` fisso in basso (`position:sticky`, sfondo `TH.bg`, token `SP.sm`) | Telefono 412×915: tasto a top **1341** px, non toccabile | Tasto a top **756**, bottom **816** su 915, toccabile in prima vista. Vale anche per «Il giorno dell'addio», che sta nello stesso contenitore | bassi-155 B12 (`apriFine302('stagione')`, misura DOM + `elementFromPoint`) |
| **B13** Partite europee senza `season` | `src/06` `stagioneVoce155`, voce `matchHistory` della gara europea dal vivo in `src/18` | `{}` | `{season:7}` | bassi-155 B13 |
| **D9** (prima metà) Controfferta senza il netto alla firma | `src/06` `nettoFirma155`/`nettoMostrato155`, modale di rinnovo `src/18` | Mostrato: nulla. Firmato: 1.265 su 1.000 | Riga «Alla firma: … (procuratore +15% · «Prepara rinnovo» +N%)» uguale al firmato (1.265). `_acceptNegoWage` usa la stessa funzione, quindi le due cifre non possono più divergere | bassi-155 D9 |
| **D10** «Titolare affermato» in Home, «Riserva» nel Profilo | `src/16` `getCareerPhase` | «Titolare affermato» | «Anni della maturità» (esempio del rapporto 140) | bassi-155 D10 |
| **D14** «Prossimo gradino — Leader» con tre condizioni su sei | `src/08` `gradinoLeader155`, profilo `src/18` | Scritte: età, presenze, fiducia | Scritte anche OVR 80+, OVR non sotto il livello della squadra e popolarità 58+, con il valore attuale di ciascuna; più una nota che la fascia arriva nelle settimane successive, non subito | bassi-155 D14 |
| **D15** Frase di fiducia a 0 presenze; mister che ignora la Coppa | `src/03` `SEASON_END_COACH` (`minMatches:10` + 2 frasi `cup`), `src/16` `classeMister155`/`poolMister155` | Classe «good» con la Coppa vinta; frase di fiducia anche a 0 presenze | Classe «cup» (2 frasi); la frase di fiducia esce solo da 10 presenze in su | bassi-155 D15 |
| **D17** Il registro `playedMd` e `cup.club` nascevano solo al caricamento | `src/18`: specchio del registro (stessa regola del caricamento 7.312) e Coppa nuova timbrata alla nascita (rollover e passaggio pro) | Sonda c140 (S12 W11→W39): **34** differenze fra stato vivo e ricaricato. bassi-155: 3 giornate mancanti nel registro, `cup.club` null | Sonda c140: **0** differenze vivo≠ricaricato e 0 vivo≠salvato. bassi-155: 0 mancanti, `cup.club` = club | `c140-ricarica.mjs` (`docs/sviluppo/giro155/d17-ricarica-prima.json` / `-dopo.json`) + bassi-155 D17 |
| **D21** Bottoni del «⭐ Club dei sogni» a 4,5 px | `src/17` elenco `data-cpm="sogni155"`, `gap: SP.sm` | Mediana 4,5 px, minimo 4,5 (252 bottoni) | Mediana 9, minimo 9 | bassi-155 D21 (soglia 7,5) |

## 2. Decisioni del PO del 10/11

| Voce | Cosa ho fatto | Prima | Dopo | Prova |
|---|---|---|---|---|
| **PO-358** Legacy Score con un tetto per ogni voce | `src/17` `LEGACY_TETTI358`: gol 300, assist 100, **trofei 140**, Nazionale 150, OVR 150, stagioni 100, patrimonio 60, per un totale esatto di 1000. Il valore per trofeo resta 80: è cambiato solo il tetto | La carriera del D18 (319 gol, 119 assist, 6 trofei, OVR 90, 16 stagioni) faceva **1000** | Stessa carriera: **745**. Una carriera al massimo su tutte le voci fa 1000; la stessa carriera senza trofei fa 860 | bassi-155 L358 |
| **PO-359** Testi | Arco «Il ragazzo della Primavera» → **«Il tuo allievo»** (`titoloAllievo359`, campo `lab` dell'arco). Derby `mun-liv` → **«Derby fra Mersey e Manchester»** (`isDerby`, tabella `DERBIES`) | Vecchi nomi | Nomi nuovi. `node tools/audit-copyright.mjs`: **✅ OK, nessun riferimento al mondo reale** | bassi-155 T359 + audit-copyright |

Sul PO-359: i nomi dei due club sono «FC Merseyside» e «Manchester Rovers», e Mersey e Manchester sono nomi di luoghi **veri**, non città inventate. Il nome nuovo usa solo ciò che c'è già nei nomi dei due club, e l'audit copyright è verde. Se il PO preferisce un nome tutto inventato, è una sola riga in `src/08` (vedi domanda 6).
«Il ragazzo della Primavera» compare anche in altri testi che **non sono l'arco**: impulsi, la saga «Il ragazzo» e il ripiego del nome dell'erede. Li ho lasciati, perché lì indica davvero un giovane della Primavera.

## 3. Difetti non corretti

| Voce | Perché |
|---|---|
| **D20**, pavimento del testo a 11 px | Alzarlo vuol dire cambiare la scala tipografica (`FS.caption`, 1.342 usi). Il rapporto 140 la indica come scelta del PO → domanda 1. |
| **B4**, contratto «1 stagione» che scade a fine della stagione successiva | Il rapporto 140 chiede una decisione del PO sul significato di «1 stagione» firmata a metà stagione → domanda 2. |
| **D9** (seconda metà), proposta iniziale a −3% a inizio stagione | «Usare i gol della stagione scorsa a inizio stagione» richiede una soglia che il rapporto non fissa (0 partite giocate? le prime N settimane?) → domanda 3. |
| **B6** (seconda metà), 100/100 di popolarità a 19 anni | Non verificata nemmeno nel giro 140 (serve una carriera simulata). Lasciata. |
| **B11** (prima metà), 701 presenze comprese quelle in Primavera | Il rapporto non propone una regola → domanda 4. |
| **B5, B9** | Non verificabili (istruzione del giro: lasciarli). |
| **D23** | Già corretto nei giri 142b/144: non toccato. |
| **D13, D16** | Risolti o non riprodotti già nel giro 140. |

## 4. Scelte di testo e di grafica fatte fra le opzioni del rapporto 140 (reversibili col sotto-codice)

- **B8:** ho scelto «Prima parte: X —» fra le due formule proposte.
- **B10:** ho scelto la frase «si difende il titolo», non la rimozione del banner.
- **B12:** ho scelto il tasto fisso in fondo, non lo spostamento in testa.
- **D10:** ho usato «Anni della maturità», l'esempio del rapporto.
- **D15:** le due frasi del mister sulla Coppa le ho scritte io.
- **PO-359:** il nome del derby l'ho scelto io.

## 5. Catena dei controlli (un controllo alla volta, `CPM_CI_PAR=0`, `free -m` e `df -h` prima di ognuno)

Log in `/tmp/claude-0/ci155/*.log`.

| Controllo | Esito |
|---|---|
| bassi-155 | ✅ 17/17 verdi; ogni rosso cade (per codice e unico) |
| career-critical, gruppo 1 (recovery-competition, save-monotonic, playing-mdref, double-tap, stale-matchday, playedmd-registry) | ✅ |
| career-critical, gruppo 2 (career-invariants, pending-mr-durable, cup-final-replay, coppa-nazioni, coppa-intera) | ✅ |
| career-invariants | ✅ |
| tripath-chokepoint | ✅ |
| stab-nat-trigger | ✅ |
| griglia-mobile | ✅ (14 schermate × 5 larghezze; le foto rigenerate in `docs/collaudo-grafico/g0` non sono committate) |
| design-system | ✅ |
| altezza-114 | ✅ (verde + rosso) |
| pc-tablet-292 | ✅ |
| albo-122 | ✅ (verde + rosso) |
| audit-copyright | ✅ 0 riferimenti |
| validate-situations | ✅ PASS 14/14, fingerprint `00001505` (corsa rifatta da capo dopo il riavvio) |
| test:logic | ✅ |
| save-compat | ✅ 12 pass, 0 fail |

La prima corsa di validate-situations è stata interrotta dal riavvio del container. Non vale: la seconda, da capo e sullo stesso build (`e261f59`), è verde.

## 6. Domande aperte per il PO

1. **D20:** alzare il pavimento del testo da 11 a 12 px (`FS.caption`)? Tocca 1.342 punti del gioco: serve un giro corto più la catena grafica.
2. **B4:** «1 stagione» firmata a metà stagione vuol dire fino alla fine della stagione in corso o fino alla fine della prossima? Nel passaggio pro, dove si firma a inizio stagione, va bene `scadenza = stagione + durata − 1`?
3. **D9:** per la proposta di rinnovo a inizio stagione, quando valgono i gol della stagione scorsa al posto di quelli correnti (zero partite giocate, le prime N settimane)?
4. **B11:** il totale presenze della lettera d'addio deve contare anche le partite in Primavera?
5. **PO-358:** con 80 punti per trofeo, il tetto di 140 si raggiunge già con 2 trofei. Va bene così, o il PO vuole un valore per trofeo più basso (per esempio 14 per trofeo fino a 10 trofei) perché il tetto dei trofei distingua anche le carriere molto vincenti?
6. **PO-359:** «Derby fra Mersey e Manchester» usa luoghi reali presenti nei nomi dei club. Va bene, o va inventato anche il luogo?
7. **Roadmap:** questo giro non è un rilascio (versione non toccata, niente promozione su `main`), quindi non ho scritto righe in `docs/governo/ROADMAP.md`. La riga si scrive quando la 190 parte.

**Sintesi:** 15 bassi corretti (B1 B2 B3 B6a B8 B10 B11b B12 B13 D9a D10 D14 D15 D17 D21) più PO-358 e PO-359; guardiano `bassi-155` verde con ogni rosso che cade; catena completa verde; 7 domande aperte per il PO.
