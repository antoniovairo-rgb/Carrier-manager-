# Rapporto giro 134 — PO-334 «Dentro l'app» · PO-335 «Sì»

Ramo `sviluppo/giro134-privacy-poi`, partito da `sviluppo/giro133-amichevoli` (contiene i giri 131 e 133) con
`main` portato dentro (merge, nessun force push): su `main` c'era già il commit 89616e8 che toglie da
`privacy.html` la mail personale e mette il contatto korward.devteam@gmail.com (scritto in entità HTML).
Senza quel merge il ramo avrebbe avuto la `privacy.html` vecchia. `privacy.html` in questo giro **non è stata
toccata**. GAME_VERSION non toccata, nessun campo nuovo nel salvataggio.

## PO-334 — l'informativa sulla privacy dentro il gioco

**Prima** (misurato con il braccio rosso `__CPM_NO_G134P`, che è il codice di prima): Opzioni → «Informativa
sulla privacy» chiama `openPrivacy()` → `window.open(PRIVACY_URL)`: nella sonda si apre **una nuova scheda**
verso github.io, e dentro la pagina non compare nulla. Foto: `foto-giro134/privacy134-s360-rosso.png`,
`privacy134-pc-rosso.png` (Opzioni resta com'è, l'informativa è uscita fuori).

**Dopo**: la voce è un bottone che apre `Privacy134` (src/19, accanto a `SettingsScreen`): la finestra
standard del gioco (`Modal`, gli stessi token TH/FS/FW/SP/RAD dei Crediti), titolo «Informativa sulla privacy»,
× nella testa e «Chiudi» nel piede; Esc la chiude (su PC) senza chiudere anche Opzioni. Chiusa, si resta in
Opzioni. Foto: `privacy134-s360-verde.png`, `privacy134-pc-verde.png`.

**Fonte unica del testo (scelta fatta).** Il testo nel gioco non è scritto a mano: `tools/privacy-testo.mjs`
legge `privacy.html` (il blocco `div.card` più il piè di pagina) e genera la costante `PRIVACY134` in
`src/07-versione-save-interviste.jsx`, fra i marcatori `PRIVACY134-INIZIO` / `PRIVACY134-FINE`. Due blocchi
contro la divergenza:
- `tools/check-src.mjs` ora rifiuta (esce 1) se `PRIVACY134` non è quello che si genera oggi da `privacy.html`.
  Chi cambia `privacy.html` deve lanciare `node tools/privacy-testo.mjs && node tools/build-src.mjs`.
- il guardiano `privacy-134` confronta il testo mostrato con `privacy.html` estratto **in modo indipendente**
  dal generatore (tag tolti, entità decodificate).

**Mail.** Nel sorgente del gioco non c'è nessun indirizzo in chiaro: il link mailto della pagina diventa il
segnaposto `["m"]` e il gioco lo ricompone con `_feedbackTo()` (codici di carattere, già esistente). Il
generatore **si ferma** se la mail di `privacy.html` non coincide con quella di `_feedbackTo()`, e se nel
testo generato restasse una `@`.

**Senza rete**: il testo è dentro il gioco (anche in `dist/` e nella cache di `sw.js`), nessuna richiesta.

Guardiano nuovo `npm run privacy-134` (360x800 tocco, 1440x900 mouse, rete bloccata con prova del blocco):
- VERDE: 0 difetti — 3 aperture (360 Chiudi, 1440 Chiudi, 1440 Esc), 2206 caratteri uguali a privacy.html,
  contiene korward.devteam@gmail.com, non contiene l'indirizzo personale, nessuna nuova scheda e nessun
  `window.open`, finestra dentro lo schermo, si torna a Opzioni.
- ROSSO `__CPM_NO_G134P`: cade — «si apre FUORI dall'app (nuove schede 1, window.open 1)» e «nessuna
  finestra della privacy dentro la pagina», in tutti e due i formati.

**Guardiano del giro 118 (`intro-118`) aggiornato**, perché pretendeva proprio il comportamento che il PO ha
chiesto di togliere: `<a href=…privacy.html target=_blank>` e il clic che chiama `window.open` con quell'URL.
Ora la parte B controlla: voce presente, tocco ≥ 44 px, al clic la finestra si apre nella pagina e nessun
`window.open`. La parte A (portiere dell'intro) è intatta. Verde: VERDE (privacy 298x44 / 350x44 / 698x44);
rosso `__CPM_NO_G118P + __CPM_NO_G118`: cade (voce assente in Opzioni + piedi del portiere a 0,115-0,116).
`__CPM_NO_G118P` resta com'era (toglie la voce); `openPrivacy()` e `PRIVACY_URL` restano, usati dal rosso 134.

## PO-335 — il pulsante dell'amichevole dice anche «poi»

**Prima** (braccio rosso `__CPM_NO_G134A`): «🏳️ Gioca vs Portogallo · Nazionale · Amichevole internazionale»,
mentre la card sopra diceva già «Poi: FC Bruzio · sett. 20 · casa». Foto `prossima131-amichevole-*-rosso134.png`.

**Dopo**: «Nazionale · Amichevole internazionale · poi: FC Bruzio W.20», stessa forma di Coppa Nazioni/Euro.
La gara del club viene da `prossimaClubDopo133(md)`, lo stesso helper della riga «Poi:» della card: una fonte
sola. Foto `prossima131-amichevole-*-verde.png`.

`prossima-131` esteso: nel caso amichevole il comando deve contenere «poi: <club> W.N» con lo stesso club e la
stessa settimana della riga «Poi:». Esito:
- VERDE 10/10 · ROSSO `__CPM_NO_G131` 6/10, cade sul primo caso · ROSSO `__CPM_NO_G133` cade solo
  sull'amichevole · ROSSO nuovo `__CPM_NO_G134A` 2/10, cade **solo** sull'amichevole (comando senza «poi»).

## Catena (un controllo alla volta, `free -m`/`df -h` prima di ciascuno: memoria libera 15,2-15,5 GB, disco 29 GB)

| controllo | esito |
|---|---|
| privacy-134 | verde · rosso cade |
| prossima-131 | verde 10/10 · tre rossi cadono come devono |
| intro-118 (aggiornato) | verde · rosso cade |
| twa-120 | VERDE 12/12 |
| sw-cache-120 | verde + rosso ✅ (al primo giro rosso per un motivo d'ambiente: mancava la cartella ignorata `tests/visual/out/` nel clone nuovo; creata, rilanciato, verde) |
| build-web (`build-dist --web`) | ✅ dist offline |
| build-dist + validate-dist | ✅ DIST OFFLINE FUNZIONANTE |
| griglia-mobile | esito 0 (unica differenza nel rapporto: la voce privacy ora è `button` invece di `a`; il «NON misurato: prepartita» c'era già prima). Artefatti rigenerati non committati. |
| design-system | ✅ SISTEMA GRAFICO OK |
| career-critical (tre gruppi) | tutti ✅ |
| test:logic | 43/43 |
| save-compat | 12 pass · 0 fail |
| audit-copyright | ✅ OK |

## Domande aperte per il PO (non decise qui)

1. A 360 px il pulsante dell'amichevole va a capo e «W.20» finisce da solo sull'ultima riga (vedi
   `prossima131-amichevole-s360-verde.png`). È lo stesso comportamento di Coppa Nazioni/Euro, che usano la
   stessa forma. Va bene così o si vuole tenere «club W.N» sulla stessa riga (spazio non separabile)?
2. Il testo di privacy.html parla di «aprire un link esterno» solo per le donazioni: resta vero. Il paragrafo 7
   dice che gli aggiornamenti «saranno pubblicati a questo stesso indirizzo»: dentro il gioco la frase si legge
   identica (fonte unica). Serve una versione diversa per l'app o va bene il testo identico?
3. Nella finestra lunga il pulsante «Chiudi» è in fondo al testo (si scorre); in testa c'è sempre la ×.
   Va bene, o si vuole il piede fisso?
