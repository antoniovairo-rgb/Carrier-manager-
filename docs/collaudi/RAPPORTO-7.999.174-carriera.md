# Rapporto di collaudo — CPM 7.999.174 (carriera)

- **Versione collaudata:** 7.999.174 (`GAME_VERSION` in `CARRIER-MANAGER-AV.html`, verificata con grep)
- **Base:** `main` @ f6a73df · **Ramo di collaudo:** `collaudo/7.999.174-carriera`
- **Ambiente:** Chromium `/opt/pw-browsers/chromium` (`CPM_CHROME`), headless, Playwright da `tests/visual/node_modules`
- **Perimetro:** sola verifica. Nessun file di prodotto modificato (`CARRIER-MANAGER-AV.html`, `src/`, `tests/` intatti).
- **Dove stanno le prove:** ogni sonda ha il suo output in `docs/collaudi/<nome>.txt`; le foto in `docs/collaudi/foto-7.999.174-carriera/`.

## 1. Esito in sintesi

Nessun difetto di prodotto confermato. Tutte le voci di carriera della 174 elencate nel brief hanno almeno una sonda verde, e ogni sonda verde è accompagnata dal rosso di controllo che dimostra che la sonda distingue il difetto dal buono (dove lo strumento lo prevede).

Due problemi emersi sono dello **strumento**, non del gioco (vedi §3, righe F1 e F2).

## 2. Tabella di gravità

Scala: **Bloccante** (impedisce la pubblicazione) · **Alta** (funzione rotta visibile) · **Media** (funzione corretta ma degradata) · **Bassa** (cosmetico o di strumento) · **Nessuna** (verificato, conforme).

| ID | Gravità | Area | Esito | Prova (file) |
|---|---|---|---|---|
| F1 | Bassa (strumento) | sonda `difficolta-156` sotto carico | Primo giro ROSSO per 2 carriere «Target page… has been closed»; rilancio VERDE | `docs/collaudi/difficolta-156-rilancio.txt` |
| F2 | Bassa (strumento) | tempi di `career-critical` e `recovery-competition` | Catena intera oltre 540 s in una chiamata (exit 124); recovery oltre 130 s al primo giro (exit 124); rilanciate e verdi | `career-critical.txt`, `recovery-competition.txt`, `cc-*.txt` |
| F3 | Osservazione, **non confermata** | Home 412 px, card «Prossima partita» | Nella foto sembra una «1ª» vicina al bordo destro della riga «Ultima 5». Non ho ingrandito né misurato: non posso confermarlo | `docs/collaudi/foto-7.999.174-carriera/412-01-home.png` |
| — | Nessuna | PO-155 Nazionale | Verde | output sul terminale, non salvato (`npm run nazionale-155`) |
| — | Nessuna | PO-156 difficoltà | Verde | `difficolta-156-rilancio.txt` |
| — | Nessuna | PO-281 / PO-157 acquisti e investimenti | Verde, 6/6 | `acquisti-281.txt` |
| — | Nessuna | PO-154 / PO-224 impulsi e seguiti | Verde | `impulsi-memoria-154.txt`, `popup-224.txt` |
| — | Nessuna | PO-167 copia di riserva | Verde | `backup-167.txt` |
| — | Nessuna | PO-168 gestore errori | Verde | `errori-168.txt` |
| — | Nessuna | barra in basso 360 px | Verde | `barra-360-72.txt`, foto `360-*.png` |
| — | Nessuna | ritratto dell'eroe | Verde | `ritratto-171-72.txt` |
| — | Nessuna | home, riquadri e schede | Verde | `home-riquadri.txt`, `slot-card-layout.txt` |
| — | Nessuna | salvataggi, compatibilità, ricaricamento | Verde | `save-compat.txt`, `save-monotonic.txt` |
| — | Nessuna | coppe e recupero per competizione | Verde | `coppa-intera.txt`, `recovery-competition.txt`, `cc-cup-final-replay.txt`, `cc-coppa-nazioni.txt` |
| — | Nessuna | invarianti carriera e simulazione 2 stagioni | Verde | output sul terminale, non salvato (`career-invariants`, `career-sim-test`, vedi §3) |

## 3. Prova per riga

**Tutte le sonde sono nel repo come script `npm run <nome>` in `tests/visual/package.json`. Ogni rosso di controllo è il braccio che deve cadere.**

### Novità della 174

- **PO-155 Nazionale per finestre e CT.** Sonda `nazionale-155`, verde. Braccio A (titolare): convocazioni nelle soste 9, 19, 28, 35; amichevoli solo nelle soste; 4 presenze; il CT decide in 4 finestre su 4. Braccio B (svincolato): 0 convocazioni, 0 presenze. Il trigger dei tornei Nazionali è verde in `stab-nat-trigger-test` («trigger tornei Nazionali coerente da tutti i path»).
- **PO-156 difficoltà per fase.** Sonda `difficolta-156`, rilancio verde: 24 carriere × 2 stagioni, **20/20 celle** dentro tolleranza su voto, gol, vittorie, minuti e titolarità nelle quattro fasi (gavetta, affermazione, élite, declino). Controllo rosso (`__CPM_NO_156`): **8/20** fuori, quindi la sonda distingue. Il primo giro era rosso solo per F1.
- **PO-154 impulsi con memoria; PO-224 seguiti che si spengono al trasferimento.** Sonda `impulsi-memoria-154`, verde: memoria con il club, seguiti dello spogliatoio pronti nello stesso club e spenti in un altro (incoerenti: nessuno), trasferimento avvenuto, il seguito del vecchio spogliatoio non esce nel club nuovo in 12 settimane. Finestra d'impulsi `popup-224` verde (finestra centrata, chiusa dalla scelta, patto «kept»; il rosso riporta il riquadro in home).
- **PO-281 / PO-157 acquisti e investimenti.** Sonda `acquisti-281`, verde 6/6: T1 trainer (tiro da 72 a 72 con il rosso che cade), T2 preparatore atletico (rientro e fatica), T3 mental coach (pressione −0,03 nelle partite pesanti), T4 investimenti (rischio leggibile in Ufficio con percentuali), T5 beni (reazioni nel tempo), T6 vita_casa/vita_auto. Ogni rosso `__CPM_NO_*281` fa cadere la propria voce e lascia verdi le altre cinque.
- **PO-167 copia di riserva.** Sonda `backup-167`, verde: con quota piena l'avviso dice «Salvataggio non riuscito: la tua carriera è al sicuro nella copia di riserva» senza testo tecnico; durante il guasto nulla si perde (slot 2222, riserva 1000); tolto il guasto il salvataggio riparte (4444 / 2222).
- **PO-168 gestore errori.** Sonda `errori-168`, verde: errore di render → schermata di recupero (niente pagina bianca); offre «Esporta registro errori»; registro con stack dei componenti; limite di 40 voci.
- **Barra in basso a 360 px.** Sonda `barra-360-72`, verde: sette schede, spazio minimo fra etichette 17,6 px a 360 px e 25,1 px a 412 px (soglia 15), nessuna etichetta fuori dal bottone, scroll orizzontale 0. La foto `360-06-ufficio.png` (aperta e guardata) mostra le sette schede leggibili.
- **Ritratto dell'eroe.** Sonda `ritratto-171-72`, verde: ritratto caricato in home e in carriera, zero immagini CH38, zero immagini rotte. Il rosso (`volti negati 1`) fa sparire il ritratto.

### Giro generale (2 stagioni, un trasferimento)

- **Settimane e rollover:** `career-sim-test` verde, 159 passi, due rollover (S2→S3, S3→S4), standings a 18 righe, GF=GA, banca ≥0, OVR in range, pageerror 0.
- **Invarianti di carriera:** `career-invariants` verde («tutti gli invarianti di carriera tengono», 252 club). Output solo a terminale, non salvato in file.
- **Trasferimento:** verificato dentro `impulsi-memoria-154` («trasferimento vero avvenuto»).
- **Nazionale:** `nazionale-155` verde (vedi sopra).
- **Coppe:** `coppa-intera` verde (il trofeo si alza una volta sola, nell'ultima gara); `cup-final-replay` e `coppa-nazioni` verdi; `recovery-competition` verde (la Coppa si committa in Coppa, il campionato resta intatto).
- **Salvataggi e ricaricamento:** `save-compat` 12 pass · 0 fail; `save-monotonic` verde («il più recente vince sempre»).
- **Catena carriera:** `career-critical` (11 passi) con tutti i passi verdi, eseguiti a gruppi: `recovery-competition`, `save-monotonic`, `playing-mdref`, `double-tap`, `stale-matchday`, `playedmd-registry`, `career-invariants`, `pending-mr-durable`, `cup-final-replay`, `coppa-nazioni`, `coppa-intera`. Output in `docs/collaudi/cc-*.txt`.
- **Triplo percorso settimana:** `tripath-chokepoint-test` PASS (onMatchEnd, doAdvanceWeek e gli altri percorsi delegano a ogni chokepoint condiviso).

### Schermate (foto)

- 16 foto in `docs/collaudi/foto-7.999.174-carriera/`: 412 px e 360 px, avvio + 7 schede (Home, Stagione, Club, Carriera, Agente, Ufficio, Opzioni), generate da `collaudo-174-foto.mjs`. Nessun errore di pagina; scroll orizzontale 0 in entrambi i giri (misurato sulla pagina, non per singola scheda).
- **Ho aperto e guardato 2 foto su 16** (`360-06-ufficio.png` e `412-01-home.png`). Le altre le ho solo generate: il loro controllo visivo è da fare (vedi §4).

## 4. Non verificato

Ciò che non ho potuto confermare. Lo dichiaro qui, non lo do per buono.

- **Partita giocata a mano.** Nessuna partita è stata giocata da un giocatore. Le sonde forzano situazioni o simulano. La resa di gioco dal vivo resta da collaudare sul dispositivo.
- **Mercato dedicato.** Non ho lanciato un guardiano dedicato a offerte e trattative. Il mercato è verificato solo indirettamente (un trasferimento avviene dentro `impulsi-memoria-154`; `career-sim` non gioca offerte esplicite).
- **Foto a occhio.** 14 foto su 16 non le ho aperte: non posso dire che siano pulite sovrapposizioni o ritagli oltre a quanto misurato dalle sonde.
- **F3 (card «Prossima partita» a 412 px).** Osservazione non confermata: non l'ho ingrandita né misurata.
- **Ricaricamento manuale.** `save-monotonic` copre la persistenza su scritture concorrenti e browser/bridge. Non ho fatto un ricaricamento a pagina in mezzo a una partita in corso.
- **Coerenza 360 px fuori dalla barra.** A 360 px ho verificato la barra e il ritratto (tramite sonde), non tutte le schermate.
- **Dataset di Nazionale.** `nazionale-155` usa il suo profilo di prova. Non ho verificato la realtà dei dati dei tornei oltre quanto la sonda controlla.

## 5. Scelte per la sessione principale

Nessun difetto di prodotto richiede una decisione. Per F1 e F2, lo strumento:

1. **Retry del browser nella sonda `difficolta-156`** (consigliata): una sola ripetizione quando la pagina chiude sotto carico. Costo minimo, toglie il falso rosso.
2. Ridurre il parallelismo a 12 carriere: più lento, ma meno chiusure del browser.
3. Dividere `career-critical` in due gruppi nella catena notte: più sicuro sul tempo, ma cambia la catena già usata.

## 6. Note di metodo

- Le sonde di controllo rosso (`__CPM_NO_*`) confermano che il verde non è cieco. Dove la sonda non ha un rosso, lo dichiaro in tabella come assenza.
- Un rosso è stato classificato come strumentale solo dopo un rilancio che lo ha confermato. Nessun rosso è stato ignorato.
- Non ho modificato alcun file di prodotto. Un'immagine tracciata (`tests/character-lab/home-riquadri-30.png`) è stata riscritta da una sonda e ripristinata da git prima del commit.
- Attribuzione del commit: non includo l'identificativo del modello, come da CLAUDE.md, che prevale sul promemoria di attribuzione.
