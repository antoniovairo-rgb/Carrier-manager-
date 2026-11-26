# Rapporto giro 394 — PO-529 «il browser del banco non parla con Google»

Ramo `sviluppo/giro394-privacy-banco`, partito da `lavoro/201` (872aba4). Giro di **controlli**: nessuna riga di `src/`,
`CARRIER-MANAGER-AV.html`, `GAME_VERSION` o `docs/governo` è cambiata.

Voce: PO-529 (BACKLOG riga 101, dubbi dei giri 187 · 237 · 271). Decisione PO 18/11 17:15: «Spegnerlo».

---

## 1. Misura prima di toccare (No Blind Fix)

**Strumento.** `page.on('request')` vede solo le richieste della pagina; mtalk e simili partono dal **processo browser**. Ho quindi
letto il **NetLog** di Chromium (`--log-net-log`, cattura anche il processo browser) e l'ho confrontato con le richieste della
pagina: un host del NetLog che la pagina non ha chiesto, tolto il loopback, è un host **del browser**.

**Sonda tipica:** `startServer` + `launchBrowser` + `installCdnRoutes` + `openMatch` (Nuova carriera → nome → provino → partita in
`playing`) + N secondi di partita.

**Una scoperta sull'ambiente, prima dei numeri.** In questa immagine cloud `/opt/pw-browsers/chromium` (il `CPM_CHROME` del banco)
**non è Chromium**: è uno script dell'immagine che, sui lanci headless, aggiunge già `--gcm-mcs-endpoint=https://127.0.0.1:9`
(mtalk), `--component-updater=url-source=https://127.0.0.1:9/` e `--disable-features=…AutofillServerCommunication…`. Sul treno
(GitHub Actions) invece `CPM_CHROME` è il Chromium di Playwright **senza** quello script (`verifica-guardiani.yml` r. 167-170). Per
misurare quello che gira davvero sul treno ho chiesto il Chromium «come distribuito» con `CHROMIUM_FULL_AS_SHIPPED=1` (variabile letta
solo da quello script).

| Browser · opzioni | Durata partita | Host del gioco | Host del **browser** |
|---|---|---|---|
| Chromium «come distribuito» · opzioni di prima | 60 s | localhost · cdnjs.cloudflare.com · cdn.jsdelivr.net (intercettate) | **content-autofill.googleapis.com** (9 voci) |
| Chromium «come distribuito» · opzioni di prima | 300 s | idem | **content-autofill.googleapis.com** (9 voci) |
| Chromium con lo script dell'immagine · opzioni di prima | 60 s | idem | nessuno |
| headless shell (default di Playwright) · opzioni di prima | 300 s | idem | nessuno |
| Chromium «come distribuito» · **opzioni 394** | 25 s · 240 s | idem | **nessuno** |
| Chromium «come distribuito» · opzioni di prima (braccio rosso) | 25 s · 240 s | idem | **content-autofill.googleapis.com** ×10 |

`content-autofill.googleapis.com` è il servizio di **riempimento automatico dei moduli**: parte quando la sonda scrive il nome nel
campo di testo di «Nuova carriera». Playwright mette già `--disable-background-networking`, che **non** lo copre.

**mtalk.google.com: non riprodotto qui.** In nessuna misura (fino a 5 minuti di partita) è comparso `mtalk.google.com:5228`, che i giri
187 e 237 avevano visto **dal proxy**. Non posso confermare perché allora c'era e oggi no: l'ipotesi più vicina (non verificata) è che
le corse di allora usassero un browser o un'immagine senza lo script che oggi devia GCM. Le opzioni 394 lo spengono comunque alla
sorgente (vedi sotto), ma **il guardiano non può provare il rosso su mtalk**: la sua prova del rosso poggia sul servizio che oggi si
vede (riempimento automatico).

## 2. Correzione: un punto solo, `tests/visual/lib/privacy-394.mjs`

`ARGS_PRIVACY_394` + `conPrivacy394(opts)`: manda ogni servizio del browser a un indirizzo locale chiuso (`https://127.0.0.1:9`, lo
stesso schema dello script dell'immagine), più gli spegnimenti espliciti:

- `--autofill-server-url` (riempimento automatico — **misurato**) · `--gcm-mcs-endpoint` (mtalk) · `--gcm-checkin-url` ·
  `--gcm-registration-url` · `--component-updater=url-source=…` · `--disable-component-update`;
- `--disable-background-networking` · `--disable-domain-reliability` · `--disable-client-side-phishing-detection` ·
  `--safebrowsing-disable-auto-update` · `--no-pings` · `--disable-sync` · `--no-first-run` · `--metrics-recording-only`.

**Niente `--disable-features`**: Chromium obbedisce solo all'ULTIMO `--disable-features` e Playwright ne mette già uno suo (16 voci,
fra cui `HttpsUpgrades`, `ThirdPartyStoragePartitioning`, `PaintHolding`); aggiungerne un altro le avrebbe cancellate e avrebbe
cambiato il comportamento delle sonde. Le opzioni scelte toccano solo servizi del browser: pagina, disegno e tempi restano quelli.
`conPrivacy394` non duplica un'opzione già presente (alcune sonde codex passano già `--disable-background-networking`).
`CPM_NO_G394=1` la spegne (opzioni di prima).

**Chi la usa — tutti i lanci del repo:**

- `tests/visual/lib/harness.mjs` · `launchBrowser()` (usata da ~1.275 file): ora `launchBrowser({ args = [], privacy394 = true } = {})`.
  Chiamata senza argomenti = lancio di sempre + opzioni 394 (nessun chiamante passava argomenti: verificato con grep).
- I 28 lanci diretti `chromium.launch(X)` → `chromium.launch(conPrivacy394(X))` + import, un lancio per file, sintassi controllata con
  `node --check`:
  `tests/visual/{clip-180-foto, provino-schermate, run-3d-validation, run-force-all, prova-area-213, memoria-275, proposte-242-foto,
  run-golden}.mjs` · `tests/codex/{apertura-gpu, video-fluidita-3d, creazione-naturale-pilot, rilievi-27b-replay, fluidita-3d,
  salti-naturali, rilievi-26-27-census, apertura-dist, goleade-credibilita, conduzione-bracci}.mjs` ·
  `tests/character-lab/hyper-{full,lineup,hero}-smoke.mjs` · `tools/{validate-dist, gen-pwa-icons}.mjs` ·
  `tools/avatar-build/{shot, shot2, shoth, shoti}.mjs`.
- `launchPersistentContext`: nessun uso nel repo.

## 3. Guardiano `npm run privacy-394`

`tests/visual/privacy-394.mjs` (~2 min): due bracci sulla stessa sonda breve (provino aperto + 25 s di partita, `CPM_SEC394` per
allungare), Chromium «come distribuito».

- **verde**: `launchBrowser` con le opzioni 394 → **zero** host del browser;
- **rosso (dentro il guardiano)**: `launchBrowser({ privacy394:false })` → deve vedere almeno un host del browser, altrimenti il
  guardiano è **cieco** ed esce rosso;
- `CPM_NO_G394=1` → anche il verde gira con le opzioni di prima → esce rosso (misurato: «braccio verde: 1 host del browser
  (content-autofill.googleapis.com)»);
- «non giudicato» (NetLog vuoto o partita non raggiunta) = rosso.

MAPPA: nella riga esistente della **macchina del treno** (la riga che già raccoglie strumenti del banco fuori da `src/`): aggiunti
alla sua espressione `tests/visual/privacy-394.mjs` e `tests/visual/lib/privacy-394.mjs` e alla sua lista `privacy-394`.
`npm run mappa-unica` verde. ⚠️ `lib/harness.mjs` non ha una riga: chi lo tocca (come questo vagone) fa girare il **treno completo**
(regola del giro 317), ed è giusto così, perché le opzioni di lancio riguardano tutti i guardiani.

## 4. Rituale

`node ci-runner.mjs giro privacy-394` (guardiano + 17 sentinelle) sul commit 6f72729: **18/18 verdi**, nessuna riprova
(somma dei passi 2.554 s; privacy-394 92 s, partita-vera 676 s, career-critical 401 s). Prima il guardiano da solo: verde con 25 s
e con 240 s di partita; `CPM_NO_G394=1` rosso. Dopo la corsa ho rimesso com'erano i file che il runner riscrive da solo fuori dal mio
ambito (`docs/governo/STABILITA.json`, le schermate di `docs/collaudo-grafico/g0/360/`): non fanno parte di questa consegna.

## 5. Dubbi per il PO (la consigliata è già applicata)

**D1 — Dove vivono le opzioni.**
1. **(consigliata, applicata)** Un modulo condiviso `lib/privacy-394.mjs`, usato da `launchBrowser` e da ogni lancio diretto.
2. Solo in `launchBrowser`: tocca 1 file invece di 29, ma i 28 lanci diretti (compresa `validate-dist`, che gira nel deploy)
   resterebbero scoperti.
3. Riscrivere i 28 lanci diretti perché passino tutti da `launchBrowser`: un punto solo davvero, ma cambia opzioni di disegno e
   GPU di sonde che oggi ne usano di diverse (codex su Windows con `d3d11`): rischio di cambiare il comportamento.

**D2 — Come spegnere il riempimento automatico.**
1. **(consigliata, applicata)** `--autofill-server-url=https://127.0.0.1:9/`: indirizzo chiuso, nessun effetto sulle altre opzioni.
2. `--disable-features=AutofillServerCommunication` fuso con la lista di Playwright: va tenuta allineata a mano a ogni versione di
   Playwright (la lista è interna, non esportata).
3. Un profilo con le preferenze di riempimento spente (`launchPersistentContext`): cambia il modo di aprire il browser in tutte le
   sonde.

**D3 — mtalk non riprodotto.**
1. **(consigliata, applicata)** Spegnerlo comunque alla sorgente (`--gcm-*`) e dichiarare che la prova del rosso poggia sul
   riempimento automatico, l'unico servizio visto oggi.
2. Aggiungere al guardiano un braccio con un profilo «vissuto» e una finestra più lunga per provocare GCM: costo e durata alti, esito
   incerto (5 minuti non sono bastati).
3. Bloccare in più ogni host esterno con `--host-resolver-rules="MAP * ~NOTFOUND, EXCLUDE localhost"`: chiuderebbe anche ciò che
   oggi non conosciamo, ma rompe le sonde che scaricano davvero qualcosa (provider di visione, modelli) e va escluso caso per caso.

**D4 — Il guardiano dipende dal Chromium completo.** Con la headless shell (default di Playwright senza `CPM_CHROME`) il browser non
contatta nessuno nemmeno con le opzioni di prima, quindi il braccio rosso esce cieco e il guardiano rosso.
1. **(consigliata, applicata)** Lasciarlo così: sul treno e in `ci-runner` `CPM_CHROME` è sempre il Chromium completo; un rosso «cieco»
   è un rosso onesto, non un verde falso.
2. Saltare il guardiano senza `CPM_CHROME`: diventerebbe verde a vuoto.
3. Far scegliere al guardiano il Chromium completo da solo: lega il guardiano ai percorsi delle macchine.

## 6. File toccati

- nuovo: `tests/visual/lib/privacy-394.mjs` (opzioni condivise), `tests/visual/privacy-394.mjs` (guardiano), questo rapporto;
- `tests/visual/lib/harness.mjs` · `launchBrowser` (firma con argomenti facoltativi + `conPrivacy394`), import;
- `tests/visual/package.json` (script `privacy-394`), `tests/visual/ci-runner.mjs` (riga MAPPA della macchina del treno);
- i 28 file con lancio diretto elencati al §2 (solo import + `conPrivacy394(...)` attorno alle opzioni).
