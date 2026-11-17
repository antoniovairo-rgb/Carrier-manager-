# Giro 236 — PO-430 (G189-18, sei difetti del primo impatto) e PO-322 (pronti per il test chiuso su Google Play)

Ramo `sviluppo/giro236-store`, partito da `lavoro/197` (`c58c5a9`). `GAME_VERSION` non toccata (resta `7.999.196` nel sorgente).
Nessun force push. Nessun account creato, nessun accesso alla Play Console, nessuna credenziale del PO, nulla inviato a Google,
nessuna chiave di firma generata o committata. Rosso unico del giro: `window.__CPM_NO_G236`.

## In una riga

I sei difetti di G189-18 sono chiusi (uno, il punto 2, lo era già dal giro 224: qui solo verificato) e coperti dal guardiano nuovo
`store-236` (**verde 13/13, prova del rosso 13/13**). In `docs/store/` ci sono testi della scheda, bozze di categoria / classificazione /
pubblico / sicurezza dati, elenco immagini con **5 screenshot telefono 1080×1920 (9:16)** dal banco, permessi con motivazione,
istruzioni del pacchetto con la firma a segnaposto e la **checklist della Play Console col parere legale sui nomi dei club come primo
punto**. **L'AAB non l'ho compilato**: l'installazione dell'SDK Android in sessione è stata negata dal controllo dei permessi (§3).

## 1. PO-430 — i sei difetti (misura → correzione → guardiano)

| # | Difetto (G189-18) | Misura / causa | Correzione | Controllo |
|---|---|---|---|---|
| 1 | figurina vuota nella scheda di fine Primavera | Sul banco, con la rete aperta, il volto c'è (sonda: `volto-0605.webp` caricato a 300 ms). Il riquadro **vuoto** si ottiene chiudendo la rete sulle foto: `FigurinaKorward23` carica il volto pigro (`loading="lazy"`) e, finché non arriva o se non arriva, mostra un rettangolo scuro senza niente. La foto del collaudo 189 è identica a quel rettangolo. **Perché il volto non sia arrivato nel collaudo 189 non posso confermarlo** (rete lenta, primo fotogramma o foto mancante: non riprodotto). | sotto il volto ci sono le iniziali del calciatore, disegnate dal CSS (`.fig236::before`, fuori da `innerText`); se il volto fallisce si nasconde. A volto caricato il volto sta sopra (misurato: elemento in cima = `IMG`). Vale per tutte le figurine: nessuna resta vuota. | G1: verde «TQ» · rosso «riquadro VUOTO» |
| 2 | «⚽ Tuo punizione al 72'» | già corretto dal giro 224 (PO-488, `momentoPiazzato224`) | nessuna | G2: «⚽ Tuo gol su punizione al 72'» (rosso col `__CPM_NO_G224` del giro 224) |
| 3 | «Il 0-0 riflette…», «Il FC Cremona» | i testi della rassegna mettono «il» fisso davanti a punteggio e club (`src/09`, `generateLocalPressAnalysis`) | `artClub236`, stesso metodo di `artNaz94`: si corregge la frase finita. Punteggio: «lo 0-0», «l'1-1», «l'8-0», «il 2-1» (anche «dello/dell'/del»…; corregge anche «dopo lo 2-1»). Sigle lette con la vocale: «l'FC Cremona», «dell'FC», «all'FC» (FC, AC, AS, AT, SC…; non CF) | G3: 14 rassegne, nessuna forma sbagliata · rosso: «Il FC · Il 0-0 · Il 1-1 · del FC» |
| 4 | «Sconosciuto» sopra il tuo nome nel duello della stagione | la pillola del rapporto col rivale (`relLabel`) scriveva «Sconosciuto» quando il rapporto non è ancora nato | la pillola non si scrive (il codice del 7.999.49 la nasconde già quando è vuota); stessa cosa nella scheda del rivale del Profilo («Sconosciuto · 19 anni» → «19 anni») | G4 |
| 5 | coro «FC CREMONA CAMPIONI! 🏆» sullo 0-0, squadra nona | i pool dei cori (`home`, `pressure`, `winning`… in tutte le lingue) contengono cori del titolo, pescati senza guardare la classifica | `filtraCoriTitolo236` in `chantFor`: i cori che proclamano il titolo escono solo se la squadra è **prima** con almeno una giornata giocata; mai con la nazionale. Se un pool resta vuoto (es. «CHAMPIONS!» unico coro `winning` della Championship) si canta il tifo di casa della stessa lingua | G5: nona → 0 cori del titolo su 6 leghe × 6 tipi; prima → 14 tenuti · rosso: 14 cori del titolo da nona |
| 6 | «Under 18», «U18», «Primavera» nella stessa scheda | 5 scritte diverse nella scheda di fine Primavera (titolo, avviso, limite, barra, opzione «resta» e pillola) | tutto «Primavera»: «Se resti in Primavera…», «Stagioni in Primavera: 1 di 2», «Resta in Primavera», «Protagonista in Primavera», «Ultima stagione in Primavera». Interpretazione mia della decisione PO-396 (vedi Dubbi) | G6 |

Foto: `docs/sviluppo/giro236/punto1-prima-giro189.png` (dal collaudo 189) e `punto1-scheda-senza-volto-dopo.png` (rete chiusa sulle
foto: iniziali al posto del vuoto, e un solo nome «Primavera»). Per gli altri cinque punti la prova è testuale (guardiano), non ho
fatto una foto per ciascuno.

## 2. PO-322 — `docs/store/`

| File | Contenuto |
|---|---|
| `CHECKLIST-PLAY-CONSOLE.md` | 13 passi del PO; **passo 1: parere legale sui nomi dei club**, con le due frasi testuali della pagina Google «Proprietà intellettuale» (letta oggi), senza interpretarle |
| `SCHEDA-PLAY.md` | nome 30/30, breve 78/80, completa 1.492/4.000 caratteri; categoria; bozze IARC, pubblico, sicurezza dei dati |
| `IMMAGINI.md` + `screenshots/` | icona 512 RGBA, grafica 1024×500, 5 screenshot 1080×1920 (`tools/store-screenshots-236.mjs`, GLB acceso) |
| `PERMESSI.md` | TWA: nessun permesso dichiarato; Capacitor: `INTERNET` (misurato al giro 116) |
| `PACCHETTO.md` | due pacchetti possibili (Capacitor offline / TWA), comandi, firma a segnaposto, segreti CI letti dal workflow |

Privacy: `https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html` risponde **HTTP 200, 5.274 byte** (curl, 17/11/2026),
uguale al file del repo; contatto `korward.devteam@gmail.com` (codificato a entità HTML); nessun altro indirizzo email in
`privacy.html`, `PRIVACY_POLICY.md` e `docs/store/` (S4).

## 3. Pacchetto: cosa è costruibile e cosa no

- `tools/build-dist.mjs` rifatto dal guardiano: `dist/index.html` 7.367.058 byte, 0 script da CDN (S7). Identità
  `com.korward.elite` uguale in Capacitor, TWA e Bubblewrap; TWA `targetSdk 36`; `@capacitor/android ^8` (S1).
- **AAB non compilato in questo giro.** La rete verso `dl.google.com`, `maven.google.com`, `services.gradle.org`,
  `repo.maven.apache.org` rispondeva 200, ma il comando che scaricava e installava l'SDK Android in `/opt/android-sdk` è stato
  **negato dal controllo dei permessi della sessione**; non l'ho aggirato. Le ultime misure dell'AAB sono dei giri 116 (Capacitor,
  109.731.296 byte, targetSdk 36) e 120 (TWA, 3.798.657 byte): per la versione di oggi **non posso confermarle**.

## 4. Controlli (uno alla volta, `free -m` e `df -h` prima)

| Controllo | Esito |
|---|---|
| `build-src` + `check-src` | ✅ IDENTICO BYTE PER BYTE (7.769.613 byte) · privacy del gioco = `privacy.html` |
| `store-236` verde | ✅ 13/13 (eseguito 3 volte durante la messa a punto, ultime 2 verdi sulla build finale) |
| `store-236` rosso (`CPM_PROVA_ROSSO=1`) | ✅ 13/13 controlli cadono (2 volte) |
| `piccoli-85` (verde + rosso) | ✅ — adattato: leggeva la scritta «Stagioni Under 18», ora normalizza «Stagioni in Primavera» (stessa misura, nessuna soglia cambiata) |
| `licenze-184` (verde + rosso) | ✅ verde; prova del rosso 4/4 misure accese |
| `design-system` | ✅ SISTEMA GRAFICO OK (corpi 97,9 %, raggi 96,2 % dal sistema; nessun raggio a mano che duplichi un token) |
| `griglia-mobile` | ✅ uscita 0, 14 schermate × 5 larghezze; foto rigenerate in `docs/collaudo-grafico/g0/` rimesse con `git checkout --`, non committate |
| `test:logic` | ✅ 51/51 |
| `save-compat` | ✅ 12 pass · 0 fail |

### 4.1 Fuori dalla consegna

`store-236` aggiunto una volta alla catena `completa` di `tests/visual/ci-runner.mjs` (`node --check` ok). `docs/governo/BACKLOG.md` e la roadmap **non** sono su questo ramo (vivono su `poc/marioprada-character-system`): stato di PO-430/PO-322 da aggiornare all'unione, nessuna versione parte da qui.

Non eseguiti: le catene lunghe e i guardiani della MAPPA dei file `src/` toccati (01, 06, 09, 15, 16, 18: decine di guardiani, molti
oltre i 20 minuti) che non sono nella consegna, come da regola PO-504 A; li esegue la verifica di rilascio. Fra quelli che potrebbero
risentire delle modifiche: `figurina-199` (figurine), `rassegna-*` (testi della rassegna), `cori-291` (cori), `carriera3-94`
(articoli delle nazionali, stessa funzione di rassegna).

## 5. Dubbi per il PO

1. **Punto 6, quale nome.** G189-18 dice «va deciso un nome solo»; ho applicato «Primavera» per esteso (la decisione PO-396 accorcia
   in «U19» solo dove il nome non entra). Fuori da quella scheda restano «Under 18»/«U18» in altri punti del gioco (Profilo «Status
   Under 18», Nazionale «Sei in Under 18 · stagione 1 di 2», Coppa, diario «Resto in Under 18», avviso «🔄 Resti in Under 18!»):
   **non li ho cambiati** perché fuori dal punto segnalato. Uniformarli tutti è una decisione del PO (e c'è anche «U18» contro «U19»).
2. **Punto 3, «l'FC Cremona».** Ho scelto l'elisione (la sigla si legge «effe-ci»). L'alternativa è togliere l'articolo davanti ai club
   («FC Cremona la spunta…»). Scelta di lingua: la decide il PO.
3. **Punto 5, quando il coro del titolo è lecito.** Ho scelto «prima in classifica con almeno una giornata giocata»; non ho
   considerato il campione uscente (il salvataggio non tiene un campo «campione in carica» semplice da leggere). Con la nazionale il
   coro del titolo non esce mai.
4. **Punto 1, causa nel collaudo 189.** La correzione rende impossibile il riquadro vuoto, ma il motivo per cui quel volto non era
   arrivato non l'ho riprodotto.
5. **Pacchetto da caricare**: Capacitor (offline, ~105 MB) o TWA (~4 MB, sito). Il mandato dice «offline», ma il giro 120 aveva
   seguito la decisione PO dell'08/11 «lo stesso sistema di PLINTO» (TWA). Da confermare quale.
6. **Pulsante «Sostieni il progetto»** visibile nella plancia e quindi negli screenshot: tenerlo nella versione store?
7. **La frase «nomi di fantasia»** in `privacy.html` (piè di pagina) e in `STORE_LISTING.md`: l'ho tolta dalla nuova descrizione
   della scheda e lasciata nei due file; va riletta col parere legale.
8. **Screenshot**: mostrano la versione 7.999.196 e la plancia con dati di prova (FC Cremona, 2° posto): da rifare sulla versione che
   si carica (`node tools/store-screenshots-236.mjs`).
9. **`versionName` della TWA** fermo a `7.999.184` in `twa/android/app/build.gradle`: non toccato.
10. **AAB**: per compilarlo in sessione serve il permesso di installare l'SDK Android; altrimenti sul PC del PO o col workflow
    (`docs/store/PACCHETTO.md`).
11. **Coordinamento col giro 235 (grafica)**: le mie modifiche grafiche sono la figurina (`src/01`, `FigurinaKorward23`) e una regola
    CSS in `src/00`. Se il 235 tocca le stesse righe, all'unione va tenuto lo strato `.fig236` sotto l'immagine.
