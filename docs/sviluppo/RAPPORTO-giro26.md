# Rapporto giro 26 — PO-255 (badge versione) e PO-256 (toast sopra il Modal)

Ramo `sviluppo/badge-toast-255`, gioco 7.999.169 (quella pubblicata). `GAME_VERSION` **non** cambiata, come
chiesto dal giro. Zona G ferma: nessun calcolo di carriera o economia toccato. PO-256 cambia solo **quando**
compare un toast, non cosa dice né cosa accredita. Fonte dei difetti: rapporto di collaudo
`docs/collaudi/RAPPORTO-release-7.999.169-carriera.md` (ramo `collaudo/release-7.999.169-carriera`), difetti
D1 e D3.

| voce | file toccati | interruttore rosso | guardiano |
|---|---|---|---|
| PO-255 | `src/19-app-root.jsx` | `__CPM_NO_BADGE255` | `badge-255` (nuovo) |
| PO-256 | `src/11-ui-kit-highlight.jsx`, `src/18-career-app.jsx` | `__CPM_NO_TOAST256` | `toast-256` (nuovo) |

Tutti e due i guardiani sono registrati in `tests/visual/package.json`, nella catena `completa` di
`ci-runner.mjs` e nella `MAPPA` di `ci-runner.mjs`. Nella MAPPA `toast-256` sta nelle righe di src/11-17 e
src/16-18-10. `src/19` ha ora una riga propria con `badge-255` e `toast-256` più l'intera catena `completa`.
Prima della modifica src/19 non aveva una riga, quindi la catena mirata ci metteva già la completa: la copertura
non si riduce.

---

## 1. PO-255 — al giocatore resta solo «v 7.999.169»

**Prima.** In basso a destra c'erano due etichette: «TEST» su fondo arancio, oppure «PROD» su fondo verde sul
sito, e «KE 7.999.169». Svanivano dopo circa 8 secondi (animazione `cpmBadgeFade`, 9 s).

**Correzione** (`src/19-app-root.jsx`, dentro lo stesso contenitore fisso, quindi la dissolvenza è la stessa):
resta una sola etichetta, `data-cpm="badge255"`, col testo `v {GAME_VERSION}`. Il testo è bianco all'85% su un
fondo nero al 35%, più piccolo e meno marcato di prima (niente grassetto 800, niente alone). `APP_ENV` resta nel
codice (`src/07`) per gli usi interni, ma il badge non lo legge più. Con `__CPM_NO_BADGE255` torna il badge di
prima.

**Misura** (`npm run badge-255`, pagina della home, letture a ~1 s e dopo altri 10 s):

| viewport | braccio | testo a ~1 s | dimensioni | dopo 10 s |
|---|---|---|---|---|
| 412×915 | verde | `v 7.999.169` | 91×15 px | opacità 0, nascosto |
| 412×915 | rosso | `TEST KE 7.999.169` | 149×17 px | opacità 0, nascosto |
| 360×800 | verde | `v 7.999.169` | 91×15 px | opacità 0, nascosto |
| 360×800 | rosso | `TEST KE 7.999.169` | 149×17 px | opacità 0, nascosto |

Il verde controlla tre cose: il testo è esattamente `v <GAME_VERSION letta dall'HTML>`, non contiene le parole
PROD, TEST o KE, ed è visibile all'avvio ma nascosto dopo 10 s. Il rosso controlla che compaiano PROD o TEST e KE.

**Limiti.**
- In locale `APP_ENV` vale sempre «TEST», quindi il rosso ha mostrato «TEST» e non «PROD». Non posso confermare
  a schermo la versione su github.io. Il ramo verde però non legge `APP_ENV`, quindi su qualunque dominio
  disegna lo stesso testo.
- La posizione non è cambiata: a 360 px il badge si sovrappone per pochi secondi alla voce «Opzioni» della barra
  in basso, come già prima (foto `badge-360-dopo.png`). È più piccolo di prima (91 px di larghezza contro 149) e
  non riceve tocchi (`pointerEvents:none`). Non l'ho spostato perché la voce chiedeva di farlo svanire «come
  oggi».

## 2. PO-256 — un toast non copre mai un Modal aperto

**Prima** (`toast-412-prima.png`). A 412 px il toast «L'investimento immobiliare rende: +55.000€ sul conto!»
stava sopra l'ultima risposta del confronto col procuratore («Voglio cambiare completamente aria.»). Misura
del braccio rosso: il toast si sovrapponeva al pannello del Modal per 19.256 px², e alle 4 risposte per
9.156 px². A 360 px i valori erano 18.945 e 13.727 px².

**Correzione.** Ho applicato lo stesso principio di popup-224 e di PO-247: si aspetta la chiusura, non ci si
sposta. L'ho esteso a tutti i Modal.
1. **Registro dei modali aperti** (`src/11`, `_modali256`). `ModalPannello` incrementa un contatore quando
   compare e lo decrementa quando sparisce, poi avvisa chi è in ascolto. `Modal` disegna sempre un
   `ModalPannello`, e lo fanno anche le finestre-impulso della home (`_pop224` con PO-230). Quindi il registro
   copre tutti i Modal e tutti i ModalPannello. `modaleAperto256()` vale falso con `__CPM_NO_TOAST256`.
2. **Coda dei toast** (`src/18`, `_drainNotif`). Se un Modal è aperto, la coda non fa partire il toast
   successivo e lo tiene in attesa. In quel momento `notifPending` resta vero, come per qualunque coda non
   vuota. Quando l'ultimo Modal si chiude, chi ascolta il registro fa ripartire la coda.
3. **Toast già in scena.** Se un Modal si apre mentre un toast è visibile, il toast si nasconde. Allo scadere
   torna una sola volta in testa alla coda (`rip256`), per non andare perso. Restano valide le regole di prima
   della coda: il tetto di 8 avvisi e lo scarto degli avvisi minori di una settimana già passata.

**Misura** (`npm run toast-256`, salvataggio `save-190-s12-ovr93.json`. Il confronto si apre con
`patch({agentCheckin:{due:true}})` e il toast arriva da `notify247`. Poi il confronto si chiude con
`due:false`):

| viewport | braccio | Modal aperto: toast visibile? | sovrapposizione pannello / risposte | dopo la chiusura |
|---|---|---|---|---|
| 412×915 | verde | no | 0 / 0 | toast visibile, testo dell'investimento |
| 412×915 | rosso | sì | 19.256 / 9.156 px² | — |
| 360×800 | verde | no | 0 / 0 | toast visibile, testo dell'investimento |
| 360×800 | rosso | sì | 18.945 / 13.727 px² | — |

Il guardiano controlla anche che il toast **non si perda**: dopo la chiusura del Modal deve comparire
l'avviso dell'investimento.

**Limiti.**
- Il guardiano misura il caso del collaudo: il toast arriva quando il Modal è già aperto. Non misura il caso in
  cui un Modal si apre mentre un toast è già in scena (punto 3). Quel ramo è scritto ma non ha una prova
  dedicata: non posso confermarlo con un numero.
- Il registro conta solo `ModalPannello`. Le finestre fatte a mano con `position:fixed` restano fuori: ad
  esempio l'intervista `intervista231`, coperta da PO-247 che sposta il toast in alto, e la fine stagione.
  Le stesse finestre-impulso cadono nel `div` di ripiego quando c'è `__CPM_NO_FIN230`. Non ho censito
  overlay per overlay quali altri restino fuori.
- Se un Modal resta aperto a lungo, i toast aspettano. Con il tetto di 8 e lo scarto degli avvisi stantii, gli
  avvisi minori di una settimana passata vengono scartati e restano nel registro delle notizie, come già
  avveniva prima.

## 3. Verifiche eseguite

| passo | esito |
|---|---|
| `CPM_FORZA_BUILD=1 node tools/build-src.mjs` | HTML ricomposto da 21 frammenti (7.208.503 byte) |
| `node tools/check-src.mjs` | ✓ identico byte per byte |
| `badge-255` verde + rosso, 412 e 360 | ✅ |
| `toast-256` verde + rosso, 412 e 360 | ✅ |
| `toast-247` (stessa coda dei toast) | ✅ verde, rosso visibile (6.851 px²) |
| `popup-224` | ✅ |
| `finestra-230` | ✅ |
| `fps-249` | ✅ |
| `design-system` | ✅ sistema grafico OK |
| `career-critical` | ✅ uscita 0, 11 suite (la prima corsa ha sforato i 10 minuti di una chiamata ed è stata rifatta da capo, per intera) |

## 4. Foto (in `docs/sviluppo/foto-giro26/`)

«Prima» è il braccio rosso, «dopo» il verde, sullo stesso build.
- Badge: `badge-412-prima.png`, `badge-412-dopo.png`, `badge-360-prima.png`, `badge-360-dopo.png`
- Toast: `toast-412-prima.png` (toast sopra l'ultima risposta), `toast-412-dopo.png` (confronto leggibile,
  nessun toast), `toast-412-dopo-chiusura.png` (il toast compare dopo la chiusura), e le stesse tre a 360.

Ho guardato con l'occhio `toast-412-prima.png`, `toast-412-dopo.png` e `badge-360-dopo.png`. Per le altre foto
mi baso sui numeri dei guardiani.
