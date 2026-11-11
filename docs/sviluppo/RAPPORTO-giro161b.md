# Rapporto giro 161b — fuori il file Mixkit (PO-351, verso la 7.999.191)

Ramo `sviluppo/giro161-audio` (dopo il giro 161, commit `8cddd75`). Decisione PO dell'11/11 sera: «Togliere il file».
`GAME_VERSION` non toccata. Promozione su `main` non fatta (non richiesta dal compito).

## 1. Misure prima/dopo

| | prima (`8cddd75`) | dopo |
|---|---|---|
| `assets/audio/` nel repo | 9.544.790 byte · 110 file audio | **6.763.036 byte** · 109 file audio (−2.781.754 byte; il `.wav` da solo pesava 2.781.290) |
| `dist-web/assets/audio` appena costruita | 9.537.394 byte, file Mixkit presente | **6.755.650 byte**, nessun file Mixkit |
| `dist/assets/audio` appena costruita | (stessa copia di `assets/`, file presente) | **6.755.650 byte**, nessun file Mixkit |
| Gol col rosso `__CPM_NO_G149` (browser, dist-web) | 1 richiesta al file Mixkit · 1 filtro creato dal gol (il campione) | **0 richieste Mixkit · 14 filtri** (boato sintetizzato a formanti) · 3 richieste ai vecchi `goal-roar.*` con 404, attese |
| Registrazione «prima» del gol, pagina d'ascolto del giro 149 | picco −2,3 dB · RMS −21,1 dB · −17,5 LUFS (conteneva il boato Mixkit) | picco −10,7 dB · RMS −26,9 dB · −22,4 LUFS (boato sintetizzato) |

Audio scaricato dal sito al primo avvio (`sw-cache-120`): 2,5 MB, invariato (il file non si scaricava già dal giro 149 nel verde).

## 2. Cosa ho cambiato

- **File tolto:** `git rm assets/audio/sfx/crowd/mixkit-stadium-joy-shouting-crowd-3022.wav`. Di conseguenza esce da `dist/` e
  `dist-web/` (`build-dist` copia `assets/`) e, quando `main` sarà promosso, dal sito.
- **Rosso `__CPM_NO_G149`** — `src/09-audio-scout-anagrafiche.jsx` r. 59-60, 68-70, 120, 281-282: tolto l'indirizzo del file da
  `URL_SFX['crowd.roar']`; restano i tre `goal-roar.*` (vecchio aggancio «basta caricare il file», non presenti) e quindi `crowdRoar`
  ricade sulla **sintesi a formanti** (il «sintetizzato di prima», opzione indicata dal compito). Solo commenti nelle altre righe.
  Il verde non cambia: il gol suona i boati CC0 del giro 149.
- **Crediti nel gioco** — `src/17-menu-creazione-pannelli.jsx`: col rosso `__CPM_NO_G149` la sezione Suoni non mostra più la voce
  Mixkit (lista vuota, r. 176-178); tolta la voce Mixkit anche dal contenuto vecchio del rosso `__CPM_NO_CREDITI254` (r. 141).
- `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** (7.189.840 byte, 21 frammenti).
- **Registro** `assets/audio/LICENZE.json`: tolta la riga in `altri`. **Generatore** `tools/audio-149/prepara-audio.py` r. 137: tolta
  la stessa riga (al suo posto un commento). `tools/audio-149/sorgenti.json` **non conteneva** il file Mixkit (cercato: 0 occorrenze),
  quindi non è stato toccato.
- **Crediti (documento)** `docs/governo/CREDITI-fonti.md`: tolta la riga «Stadium joy shouting crowd» (Mixkit 3022) e aggiunta una
  nota di testa che lo dice (senza la parola, perché il guardiano nuovo pretende zero occorrenze lì).
- **README** `assets/audio/README.md` e `assets/audio/sfx/crowd/README.md`: tolta la riga del file e le frasi che lo descrivevano.
- **Pagina d'ascolto del giro 149** (`docs/sviluppo/giro149/`, pubblicata su `prototipi/audio-149/`): la registrazione `prima/gol.mp3`
  **conteneva il boato Mixkit** (era il rosso di allora). L'ho riregistrata col rosso di oggi (boato sintetizzato) e aggiornato
  `misure.json` solo per quella voce (le altre 25 registrazioni «prima» sono byte per byte identiche, verificato con md5) + una frase
  nella pagina che lo spiega. Per farlo `tests/visual/ascolto-149.mjs` accetta `CPM_SOLO=<id,...>` e `CPM_SOLO_PRIMA=1`.
  La pagina del giro 161 non conteneva Mixkit (il suo «prima» è il rosso `__CPM_NO_G161`, cioè l'audio del giro 149).
- **Guardiano `crediti-254`** (`tests/visual/crediti-254.mjs`): era **già rosso prima di questo giro** (misurato su `8cddd75`: «il
  documento ha 21 righe, il guardiano ne conosce 16», più le voci Mixkit pretese nella finestra, che il verde non mostra dal giro 149).
  Allineato `ATTESI` al documento: via la riga Mixkit, dentro le cinque righe del giro 149 con i testi che la finestra mostra.
  Nessuna soglia toccata.
- **Guardiano nuovo `npm run audio-161b`** (`tests/visual/audio-161b.mjs`): (1) nessun file Mixkit in `assets/`; (2) nessuna
  occorrenza «mixkit» in `src/`, `CARRIER-MANAGER-AV.html`, `sw.js`, `LICENZE.json`, i due README, `tools/audio-149/`,
  `CREDITI-fonti.md` (31 file letti); (3) nessun file Mixkit in `dist-web/` e `dist/` appena costruite (cartella mancante = non
  giudicato = rosso); (4) verde: il gol suona il boato da file, 0 richieste Mixkit; (5) rosso `__CPM_NO_G149`: la pagina monta, il gol
  suona, boato non da file e ≥6 filtri (sintesi), 0 richieste Mixkit, 0 errori.
  **Braccio rosso:** un file tolto non si può rimettere con un interruttore `window.__CPM_NO_G…` senza rimettere il file nel repo, che è
  ciò che la decisione esclude. Il rosso del guardiano è quindi `CPM_ROSSO161B=1`: giudica l'albero del commit di prima
  (`CPM_BASE161B`, default `8cddd75`) e, con `CPM_DIST161B=<dist-web costruita da quel commit>`, anche il browser su quella build.

## 3. Esito dei controlli (uno alla volta, `free -m` e `df -h` prima di ognuno: ~12 GB liberi di RAM, 28 GB di disco)

| Controllo | Esito |
|---|---|
| `audio-161b` verde | ✅ 6/6 (31 file letti, 0 occorrenze · dist-web e dist 1197 file, 109 audio, 0 Mixkit · verde boato da file 1 · rosso G149: 14 filtri, 76 collegamenti, 0 richieste Mixkit, 0 errori) |
| `audio-161b` rosso statico (`CPM_ROSSO161B=1`, albero `8cddd75`) | ✅ cade (uscita 1): 1 file in `assets/`, occorrenze in src/09 (5), src/17 (4), HTML (9), LICENZE.json (4), README… |
| `audio-161b` rosso anche nel browser (build di `8cddd75` in un worktree) | ✅ cade: la 5 dà 1 richiesta Mixkit e 1 filtro |
| `audio-149` | ✅ verde 8/8 (109 file con riga di licenza, 54 CC0, 5,40 MB, 54/54 decodificati anche senza rete, 37/37 eventi da file) · rosso `__CPM_NO_G149` cade su 6 e 7 (0/54) |
| `audio-161` | ✅ verde · rosso cade su 4-8, sequenza identica 297/297 voci |
| `crediti-254` | ✅ verde (20 righe del documento, 23 voci nella finestra a 360 e 412 px) · rosso `__CPM_NO_CREDITI254` cade (uscita 1) |
| `brusio-238` | ✅ verde (brusio decodificato in 614 ms, giunto 1,06 dB) |
| `sw-cache-120` | ✅ verde (audio al primo avvio 2,5 MB, terza apertura senza rete monta, 0 richieste fallite) · rosso ✅ |
| `twa-120` | ✅ 12/12 |
| build web e store (`build-dist --web`, `build-dist`) + `validate-dist` | ✅ dist offline funzionante, 0 richieste esterne, 0 errori console |
| `audit-copyright` | ✅ 0 riferimenti al mondo reale |
| `test:logic` | ✅ 43/43 |
| `save-compat` | ✅ 12/12 |
<!--CATENA-->

Dichiarato: la prima esecuzione di `validate-dist` è caduta **prima di giudicare** perché lanciata senza `CPM_CHROME` (Playwright cercava
una build di Chromium non presente); rilanciata da capo con `CPM_CHROME=/opt/pw-browsers/chromium`, verde. Il guardiano nuovo ha avuto
due stesure prima del verde: la prima trovava la parola «mixkit» nei miei stessi commenti (in `prepara-audio.py` e nella nota di
`CREDITI-fonti.md`, riscritti senza la parola) e contava i nodi collegati direttamente all'uscita, che sono zero perché i suoni vanno ai
bus di categoria (ora conta tutti i collegamenti). Nessuna soglia abbassata.

## 4. Occorrenze «mixkit» rimaste (`git grep -i mixkit`)

- `docs/sviluppo/giro161/mixkit-sfx-free-license.txt`, `mixkit-user-terms.txt`: testi di licenza, restano come documentazione (compito).
- `docs/sviluppo/RAPPORTO-giro15.md`, `-giro25.md`, `-giro149.md`, `-giro161.md`: rapporti storici.
- `docs/RELEASE_HISTORY.md` r. 2957-2958: cronologia (7.72.0/7.72.1).
- `docs/governo/BACKLOG.md` r. 39 (PO-351), `docs/governo/DECISIONI.md` r. 323, `docs/governo/ROADMAP.md` (riga del giro 161):
  registri storici, non toccati.
- `docs/governo/governo.html` r. 65: dati generati dalla pagina di governo (copia del backlog), si rigenera da sola.
- `tests/character-lab/recovery/2026-09-22-source-recovery/CARRIER-MANAGER-AV.compacted-before-recovery.html`: copia d'archivio
  del 22/09 del vecchio sorgente (contiene solo il nome del file nel codice, non l'audio).
- `tests/visual/crediti-254.mjs` r. 31 e 60: due commenti che spiegano perché la riga è uscita.
- `tests/visual/audio-161b.mjs`: il guardiano stesso (cerca la parola).

## 5. Domande aperte per la sessione madre

1. **Storia di git.** `git rm` toglie il file dall'albero, non dalla storia: il `.wav` resta scaricabile dai commit vecchi su GitHub
   (repo pubblico). Toglierlo anche da lì richiede una riscrittura della storia e un force push, vietati in questa sessione. Serve una
   decisione del PO se la decisione «Togliere il file» comprende anche la storia.
2. **Sito.** Il file esce da GitHub Pages solo quando questo ramo arriva su `main` e il deploy riparte.
3. **Cache dei giocatori.** Chi ha giocato prima della 7.999.190 aveva il file nella cache del service worker; la cache è legata a
   `GAME_VERSION` e l'attivazione cancella le cache vecchie, quindi sparisce al primo avvio della prossima versione pubblicata.
   Non posso confermarlo sui telefoni reali: è ciò che dice `sw.js` (r. 18 e 42), non una misura sul dispositivo.
4. **Pagina d'ascolto del giro 149.** Ho riregistrato `prima/gol.mp3` col boato sintetizzato perché la registrazione vecchia era il
   suono Mixkit; il «prima» del gol quindi non è più quello che il PO ha ascoltato l'11/11. Se si preferisce togliere quella voce
   invece di riregistrarla, è una riga.
5. **Crediti del giro 161.** I tre suoni CC0 del giro 161 («ohh» di Romainbehar, «Triumphant», «The World Is Ours») sono nei Crediti del
   gioco ma **non** in `docs/governo/CREDITI-fonti.md`, quindi `crediti-254` non li controlla. Non li ho aggiunti (fuori ambito).
