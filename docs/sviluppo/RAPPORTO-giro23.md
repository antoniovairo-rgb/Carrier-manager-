# Rapporto giro 23 — decisioni PO del 14/10 sera e del 15/10 notte (PO-245, coppa e prestito, PO-247, PO-251)

Ramo `sviluppo/decisioni-245`, partito da `lavoro/169` (7.999.169). Nessun cambio di `GAME_VERSION`.
Fonti delle decisioni: `docs/governo/DECISIONI.md`, voci «14/10 sera — questionario» (PO-251) e «15/10 notte — questionario
(rilievi del giro 19)» (punti 1-3). ⚠️ Quelle due voci **non sono sul ramo `lavoro/169`**: le ho trovate sul ramo remoto
`poc/marioprada-character-system` (commit «CODA-SESSIONI: giro 23»). Le ho lette lì e non le ho copiate in questo ramo.

Browser: `CPM_CHROME=/opt/pw-browsers/chromium`. Build: `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs`
(«IDENTICO BYTE PER BYTE»).

| Consegna | Esito | File:riga | Rosso | Guardiano |
|---|---|---|---|---|
| 1 · PO-245 ingresso «Camminata vera, ingresso più lungo» | fatta | `src/12-three-match-view.jsx:1843` (fila), `:3031` (`WALK_DUR` variabile, `WALK_V245=1.8`), `:3042` (tetto del passo), `:5945-5948` (durata calcolata), `:5983-5985` (bambini), `:8851-8862` (regia), `:10434-10441` (canale «walk»), `:1042`/`:1278`/`:1359`/`:1518`/`:1543`/`:1610` (clip) | `__CPM_NO_CAMM245` | `ingresso-camminata-245` (nuovo) · `ingresso-245` (finestra d'attesa allungata) |
| 2 · Coppa e prestito «Resta in coppa» (zona G, eccezione PO) | fatta | `src/18-career-app.jsx:5722-5737` | `__CPM_NO_COPPA_PRESTITO` | `coppa-prestito-245` (nuovo) + 4 guardiani carriera |
| 3 · PO-247 premi «Dopo l'intervista» | fatta | `src/18-career-app.jsx:382-389` (coda ferma), `:392` (voce marcata), `:405-410` (apertura/chiusura), `:6073` (`Notif`) | `__CPM_NO_IV247` | `toast-intervista-247` (nuovo) · `toast-247` adattato |
| 4 · PO-251 «Oro da festa» | fatta | `src/01-bootstrap-tema-avatar.jsx:91` e `:221` (token), `src/11-ui-kit-highlight.jsx:78` (`Btn v="festa"`), `src/theme.js:98` (design system), `src/18-career-app.jsx:6928-6929` (pulsante), `:1335` (varco di collaudo) | `__CPM_NO_ORO251` | `festa-oro-251` (nuovo) · `design-system` verde |

## 1) PO-245 — ingresso in campo a passo di camminata

**Misura prima** (guardiano del giro 19 `ingresso-245`, GLB acceso, build di partenza): stesso tunnel z −36 per le due squadre,
velocità massima **6,5 u/s** per entrambe, ingresso di **10,5 s di scena**, tutti al posto. Il rosso del giro 19
(`__CPM_NO_ING245`) dà 160-172 u/s e ospiti da z +36. Come diceva il rapporto del giro 19, 6,5 u/s è un passo svelto.

**Cosa ho cambiato.**
- **Passo**: tetto 1,8 u/s (era 6,5) in `animWalk`.
- **Fila**: con il passo più lento, 0,2 s fra un'uscita e l'altra metterebbero due calciatori a 0,36 u l'uno dall'altro, cioè uno
  dentro l'altro. Ora sono 0,65 s, circa 1,2 u di fila.
- **Durata**: `WALK_DUR` non è più una costante. All'avvio dell'ingresso vale il momento in cui arriva l'ultimo (ritardo d'uscita
  più strada a 1,8 u/s) più 2 s per fermarsi e girarsi, mai meno dei 10,5 s di prima. Sul salvataggio S12 fa **38,1 s**. Il più
  lontano percorre circa 64 u, dal tunnel fino all'estremo della fila.
- **Clip**: il pacchetto dei corpi di default (CGTrader) contiene già una clip `walk`, che il gioco non usava. Nell'ingresso il
  canale di locomozione passa sulla camminata con lo stesso meccanismo del selettore 7.518 (si ripunta `_a.run` e il canale lasciato
  sfuma). La cadenza si ricalcola sulla clip nuova come velocità vera divisa per la velocità naturale della clip
  (`_passoNaturale7`), così il piede d'appoggio non scivola. Finito l'ingresso si torna al canale avanti. Per il ripiego CH38 ho
  caricato `regular-anim-walk.glb`.
- **Bambini (PO-236)**: anche loro usano la clip `walk`, con la cadenza misurata sul loro corpo (1,25 di altezza). ⚠️ Nel ramo
  CH38 dei bambini, che non è quello di default, resta la corsa rallentata di prima.
- **Regia**: scalare il giro a 360° su 38 s avrebbe dato più di mezzo minuto di tribune senza calciatori. Ora i tempi sono
  assoluti: giro dello stadio in 12 s (prima circa 9), poi la camera bassa accompagna la testa della fila, dove l'eroe esce per
  primo, e negli ultimi 6 s c'è la carrellata lungo la fila schierata di sempre (stessa formula).

**Dopo** (`ingresso-camminata-245`, GLB acceso, build finale):

| | velocità max casa / ospiti | lontani dal posto a fine ingresso | durata (scena) | canale «walk» | cadenza in movimento |
|---|---|---|---|---|---|
| verde | 1,82 / 1,82 u/s | 0 / 0 | 38,1 s | 100% di 16.830 letture | 0,86 (velocità naturale della clip 2,07 u/s) |
| rosso `__CPM_NO_CAMM245` | 6,52 / 6,52 u/s | 0 / 0 | 10,5 s | 0 | — |

Soglie del guardiano: velocità ≤ 2,3 u/s, nessuno lontano più di 1 u dal posto, canale «walk» ≥ 90%, cadenza fra 0,7 e 1,8.
Tempo reale: circa 105 s per il verde da solo, 214 s con un'altra sonda in parallelo.

**Foto GLB-ON** (sei fotogrammi a 13, 17, 22, 28, 33 e 37,5 s di scena, telefono 412×915): dopo il giro dello stadio si vedono le
due colonne coi bambini per mano camminare verso la linea. Nella carrellata finale, che non ho cambiato, i calciatori restano
piccoli come prima. Il primo tentativo di camera d'accompagnamento (26 u di distanza) li inquadrava troppo piccoli e decentrati:
l'ho avvicinata a 13 u, a 4,2 u d'altezza. Le foto sono servite solo a decidere: non sono nel repo.

**Effetto su `ingresso-245` (giro 19).** Aspettava la fine dell'ingresso per al massimo 90 s reali: si fermava a 33 s di scena e
trovava un calciatore per squadra non ancora arrivato. Ho portato la finestra d'attesa a 480 s, come nel guardiano nuovo. Le soglie
sono invariate. Dopo: verde (stesso tunnel, 1,8 u/s, 0 lontani su 38,1 s), il rosso si vede.

⚠️ **Sul telefono non l'ho visto.** La durata di 38 s è una conseguenza della scelta del PO: tutti arrivano camminando, e la fila
schierata è larga 56 u. Se al collaudo sembrasse lunga, le leve sono la larghezza della fila o il passo, entrambe decisioni del PO.
Il pulsante «Salta» resta.

## 2) Coppa Nazionale e prestito — «Resta in coppa» (zona G)

**Prima** (`src/18-career-app.jsx`, ramo coppa di `acceptTransfer`): `_place7` cerca prima la settimana del turno e poi la prima
settimana LIBERA del calendario del club nuovo. Se non ne trova una, la coppa si chiudeva con «🏆 Coppa Nazionale: fuori dopo il
trasferimento» (`active:false, eliminated:true`).

**Ora** il turno va alla settimana del turno, se è ancora futura, altrimenti alla prima settimana utile, **anche se c'è già una gara
di campionato** (doppio impegno, come per le gare europee del girone). Si evitano solo le settimane che hanno già un'altra gara di
coppa, Europa o Nazionale riportata nel nuovo calendario. La chiusura resta solo se non c'è più nessuna settimana entro la 37. Il
registro dice «il cammino continua col nuovo club (Semifinale, settimana 29 insieme al campionato)». Prima di toccare ho verificato
che il flusso settimanale regge due gare nella stessa settimana: `_pendingSim` tiene ferma la settimana finché resta una gara di
coppa.

**Banco** (`coppa-prestito-245`, salvataggio S12):
- eroe alla settimana 24 con la coppa viva, semifinale a calendario in settimana 28;
- le settimane libere del calendario del club nuovo, calcolate con `legaDopoTrasferimento212` (la stessa funzione del
  trasferimento), sono la 28 e la 35: le ho occupate con amichevoli della Nazionale, così che non ne resti nessuna;
- offerta di **prestito** vera (`setOffer`, tipo «prestito») e «Accetta»;
- poi la carriera avanza con gli handler veri (`step`, Nazionale simulata) fino a dopo la settimana del turno.

| | coppa dopo la firma | turno a calendario | avanzando |
|---|---|---|---|
| verde | attiva, non eliminata, turno 3 | settimana 29, insieme al campionato | semifinale **giocata** (0-1, risultato registrato, terzo risultato in `cup.results`): eliminato sul campo |
| rosso `__CPM_NO_COPPA_PRESTITO` | `active:false, eliminated:true` | nessuno | — («fuori dopo il trasferimento») |

⚠️ Un falso verde che ho trovato e corretto nel banco: la prima stesura segnava la voce di coppa «giocata» **senza risultato**. La
causa era il banco. Il salvataggio S12 ha già giocato la sua vera semifinale della stagione 12 (giornata 993), che è registrata in
`playedMd`, quindi il rilevatore unico `_isStaleMd` trattava la voce del banco come già giocata. Il banco ora toglie dal registro le
giornate di coppa 990-999, e il guardiano pretende **voce giocata con risultato e un risultato in più in `cup.results`**.

**Guardiani carriera** (build finale, zona G): `tripath-chokepoint` ✅ · `career-invariants` ✅ (252 club, 0 errori di pagina) ·
`stab-nat-trigger` ✅ · `career-sim` ✅ (2 stagioni).

## 3) PO-247 — avviso dei premi solo dopo l'intervista

**Prima**: dal giro 19 il toast, con l'intervista aperta, si spostava in alto (`Notif alto`). Non copriva più le risposte ma copriva
la riga del punteggio. Misura con il guardiano nuovo, braccio rosso: toast visibile in **10 campioni su 10** con l'intervista a
schermo.

**Ora** la coda dei toast (`_drainNotif`) si ferma finché l'intervista è aperta e riparte 350 ms dopo la chiusura. `Notif` non
mostra niente mentre l'intervista è a schermo. Se un toast è già visibile quando l'intervista si apre, torna in testa alla coda e lo
si rivede dopo. Le voci accodate durante l'intervista non vengono scartate come «stantie» se nel frattempo cambia la settimana:
il giocatore non le ha ancora viste.

**Dopo** (`toast-intervista-247`, telefono 412×915): verde **0 campioni su 10** con il toast durante l'intervista. Dopo due
risposte e «Chiudi», il toast «💪+3 ⚡+14 ⭐+12» compare. Rosso `__CPM_NO_IV247`: 10 su 10.
`toast-247` (giro 19) gira ora con `__CPM_NO_IV247` in entrambi i bracci, perché collauda il collocamento in alto, che resta come
ripiego: verde 0 px² di sovrapposizione, rosso 3.419 px².

## 4) PO-251 — «Oro da festa»

**Prima**: alla festa del trofeo il pulsante «🎉 Festeggia» prendeva il colore del titolo, verde `#34d399` per «CAMPIONI!» della
Nazionale e oro piatto per campionato e coppa.

**Ora** c'è una **variante ufficiale «festa» del kit**: token `TH.festaGrad`, `TH.festaInk` e `TH.festaGlow` (uguali in chiaro e in
scuro, perché la festa sta sempre su fondo notte), `Btn v="festa"`, e la voce `highlight.festa` nel design system (`src/theme.js`).
Il pulsante della festa usa la variante per ogni trofeo. Il titolo della festa mantiene il suo colore: non era nella richiesta.

**Dopo** (`festa-oro-251`): verde, gradiente oro `#ffe08a → #f5c542 → #c98a1a` con inchiostro `#2a1a02` su Nazionale, campionato e
coppa. Rosso `__CPM_NO_ORO251`: Nazionale `rgb(52, 211, 153)` (il verde). `design-system` ✅ (nessun corpo sotto 11 px, nessun
raggio a mano). Il pulsante non ha scritte tecniche (PO-249).

## Cosa resta fuori

- La carrellata finale dell'ingresso è la stessa di prima, con calciatori piccoli.
- I bambini del ramo CH38 non di default mantengono la corsa rallentata.
- `docs/governo/ROADMAP.md`: nessuna riga, perché non è una release (niente cambio di versione). La riga va scritta quando questi
  cambi entreranno in una versione.

## Catena mirata

Comando: `node ci-runner.mjs mirata`, sul commit 8e7e5aaf (versione 7.999.169). Il confronto con `main` vede toccati
`src/01, 04, 07, 09, 11, 12, 13, 14, 15, 17, 18` e `theme.js`, perché la base `lavoro/169` porta anche i giri 16-20 non ancora su
`main`: in tutto **81 passi**, più di 6 ore di catena. Registro in `docs/governo/STABILITA.json`.

**Esito: 79 verdi su 81**, 2 rossi preesistenti, 2 passi «instabili» (verdi alla seconda prova).

- I quattro guardiani nuovi sono verdi: `ingresso-camminata-245` (373 s), `coppa-prestito-245` (43 s), `toast-intervista-247` (59 s),
  `festa-oro-251`. Verdi anche quelli adattati: `ingresso-245` (155 s) e `toast-247`. Verdi i guardiani dell'ingresso degli altri
  giri, che girano coi corpi GLB su tutto l'ingresso: `fila-227` (407 s) e `bambini-236` (1.359 s). Verdi anche `design-system`,
  `save-compat`, `career-critical`, `validate-situations` e `partita-vera`.
- ❌ **`tabellino-228`**, rosso in due prove. Il verde coincide (1-0 su tabellino, tabellone e motore); il rosso **coincide anch'esso**,
  perché la «prova» che ricrea il gol in coda dopo il fischio non segna (`prova {gol:0}`), quindi il difetto non si vede.
  **A/B sul build di partenza** (`lavoro/169`, CARRIER-MANAGER-AV.html di HEAD~1, macchina libera): fallisce **identico** («prova
  gol 0 → COINCIDE» in entrambi i bracci). È preesistente e non viene da questo giro. In `STABILITA.json` c'era già un rosso con la
  stessa firma il 12/10.
- ❌ **`schede-246`**, rosso in due prove: «verde p0: partita non finita · nessuna scheda comparsa, guardiano cieco». Rilanciato da
  solo: stesso esito. **A/B sul build di partenza: fallisce identico** («fine false · schede a schermo 0 · timer armati/scaduti 1/0»).
  È preesistente. Il guardiano non attraversa l'ingresso vero (niente `__CPM_WALKTEST74`), quindi la durata dell'ingresso non lo
  tocca. La causa non l'ho indagata: è fuori dall'ambito di questo giro, e per la regola PO del 13/10 un guardiano rosso va riparato,
  non ripetuto.
- ⚠️ **`esiti-218`** instabile: il primo rosso è la scena 2021 «🌀 Roulette e tiro», «tiro blocked raccontato come saved». Era già
  instabile l'11/10 (3 prove) e il 12/10 (2 prove). Questo giro non tocca il racconto degli esiti.
- ⚠️ **`difesa-220-scena`** instabile, verde alla seconda prova (contatto del gesto difensivo negli highlight). Non ha storico in
  questo `STABILITA.json`, quindi **non posso confermare** che fosse già instabile. Le mie modifiche in `src/12` agiscono solo nella
  fase `walkout`, e il contatore `__CPM_CAMM245` solo con il suo flag di collaudo.

Per la regola «un guardiano instabile due volte si ripara», `tabellino-228` e `schede-246` sono da riparare in un giro dedicato
(oggi non sono rossi per colpa di questo giro). La pubblicazione non spetta a questa sessione.
