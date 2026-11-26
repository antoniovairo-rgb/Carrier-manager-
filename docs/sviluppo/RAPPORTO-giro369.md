# Rapporto giro 369 — PO-419 «Calciatore coerente»

Voce di backlog: «stessa statura e peso ovunque (visti 187/80 e 170/63), piede preferito mostrato e scelto alla creazione».
Base: `lavoro/201` (ca852f31, 7.999.215). Ramo: `sviluppo/giro369-profilo`. GAME_VERSION e `docs/governo` non toccati.

## 1. Misura (prima di correggere)

Sonda nuova `tests/visual/misura-369.mjs`: gioco vero, telefono 412×915, cinque carriere (aspetto 0, 3, 5, 8, 9 con nomi e
nazioni diverse). Per ognuna legge statura/peso nella **creazione**, nella **figurina ingrandita della testata** e in
**Carriera › Profilo**, piu' il piede.

**Dove compaiono statura e peso dell'eroe.** Un solo punto del codice li scrive: `datiFigurina23` (src/01), la riga
«NNN cm · NN kg» della figurina Korward. Si legge solo dalle figurine da 96 px in su, cioe' in due schermate: la creazione
(143 px) e la figurina della testata ingrandita (fino a 260 px). Le figurine piccole (partita, cerimonie, interviste) non
hanno spazio per quella riga; la figurina del Profilo (`FiguraV2`) non scriveva ne' statura ne' piede.

**Da dove venivano i numeri (due sorgenti):**
- creazione: la figurina ha la chiave `"avatar-N"` e la carriera non c'e' ancora (`__CPM_EROE23` vuoto), quindi l'eroe non
  viene riconosciuto e il numero esce da `appearanceFromSeed(hashStr("giocatore/avatar-N"))`, un seme qualunque;
- carriera: l'eroe e' riconosciuto e il numero viene dall'aspetto del corpo 3D (`_heroAppr`: statura 1,86-2,02,
  corporatura 0,97-1,07 da `avatarId`).

| aspetto · nome | creazione | testata (carriera) | profilo |
|---|---|---|---|
| 0 · Luca Ferri | **187/80** | **170/63** | — |
| 3 · Marco Bellini | 193/85 | 174/72 | — |
| 5 · Jonas Weber | 187/78 | 183/77 | — |
| 8 · Diego Ramos | 175/68 | 187/80 | — |
| 9 · Pierre Lafont | 173/72 | 181/77 | — |

**5 coppie di schermate diverse su 5.** L'aspetto 0 (il primo, preselezionato) da' proprio il «187/80 e 170/63» del PO.

**Piede:** `player.foot` esiste (F8, 22% mancini da nome+nazione) ma non si poteva scegliere e non era scritto in nessuna
schermata.

## 2. Correzione

- **Sorgente unica** `fisicoEroe369(avatarId)` (src/01): la stessa formula del corpo 3D, quindi i numeri che la carriera
  mostrava gia' restano quelli. Il risultato si **salva** in `player.altezzaCm` / `player.pesoKg`:
  - alla creazione (src/17, `CreateScreen.go`);
  - con una **migration additiva** per i salvataggi che non li hanno (src/17, `migratePlayer`, accanto a quella del piede):
    nessun bump di `SAVE_VERSION`, stesso schema di `foot`.
- **Figurina dell'eroe** (src/01, `datiFigurina23`): legge il campo salvato pubblicato in `__CPM_EROE23` (src/18 aggiunge
  `cm`/`kg`); la creazione passa il valore con la proprieta' `fisico369` di `Figurina` (tolta da `rest` nel corpo, la riga di
  firma del componente non e' cambiata).
- **Creazione** (src/17): nuovo blocco «Piede preferito» con due tasti, Destro / Sinistro (`data-cpm="crea-piede369"`).
  Preselezionato il piede di oggi (F8, segue nome e nazione finche' non lo si tocca); quello scelto finisce in `player.foot`.
- **Profilo** (src/18, Carriera › Profilo): sotto «anni · club · ruolo» una riga «170 cm · 63 kg · piede destro»
  (`data-cpm="profilo369"`), dal salvataggio.
- Rosso `window.__CPM_NO_G369` = comportamento di prima (niente campi, niente scelta, niente riga nel Profilo, figurina
  della creazione sul seme).

### Dopo (stessa sonda)

| aspetto | creazione | testata | profilo | salvato | piede creazione (atteso) | piede profilo |
|---|---|---|---|---|---|---|
| 0 | 170/63 | 170/63 | 170/63 | 170/63 | R (R) | destro |
| 3 | 174/72 | 174/72 | 174/72 | 174/72 | L (L) | sinistro |
| 5 | 183/77 | 183/77 | 183/77 | 183/77 | R (R) | destro |
| 8 | 187/80 | 187/80 | 187/80 | 187/80 | R (R) | destro |
| 9 | 181/77 | 181/77 | 181/77 | 181/77 | R (R) | destro |

**0 coppie diverse su 15.** I valori della carriera sono identici a prima: e' cambiata solo la creazione, che prima era
l'unica schermata a mostrare un numero diverso dal corpo 3D.

## 3. Guardiano

`npm run profilo-369` (`tests/visual/profilo-369.mjs`), nella riga della MAPPA `src/01-|src/1[178]-` (`mappa-unica` verde).
- verde: per tre carriere (aspetto 0, 3, 8) creazione = testata = profilo, tutti e tre presenti (uno mancante = non giudicato
  = rosso); salvataggio vecchio migrato ai numeri che la testata mostrava sulla base; piede preselezionato = F8; piede nel
  Profilo = piede salvato; creazione vera (si sceglie il piede opposto e si preme «Crea»: il calciatore salvato ha quel piede
  e la statura); zero errori di pagina. **4/4 verdi.**
- rosso `__CPM_NO_G369`: **bocciato su 4 prove su 4** (creazione 187/80 contro testata 170/63, nessun campo salvato, nessuna
  scelta del piede, piede assente nel Profilo).

Altre prove: `save-compat` 12 pass · 0 fail. `node ci-runner.mjs giro profilo-369`: vedi sezione 6.

## 4. File e funzioni toccati

| file | dove | cosa |
|---|---|---|
| `src/01-bootstrap-tema-avatar.jsx` | nuove `fisicoEroe369`, `piedeTesto369`; `Figurina` (corpo, non la firma); `datiFigurina23` (param. `fis369`); `FigurinaKorward23` | sorgente unica e lettura del campo salvato |
| `src/17-menu-creazione-pannelli.jsx` | `CreateScreen` (stato `piede369`, `go`, figurina grande, blocco piede); `migratePlayer` (riga dopo quella di `foot`) | scelta del piede, campi salvati, migration |
| `src/18-career-app.jsx` | `CareerApp` (`window.__CPM_EROE23` + `cm`/`kg`); tab `profile` (riga `profilo369`) | Profilo |
| `CARRIER-MANAGER-AV.html` | ricomposto con `tools/build-src.mjs` (`check-src` IDENTICO) | — |
| `tests/visual/misura-369.mjs`, `profilo-369.mjs`, `package.json`, `ci-runner.mjs` (riga MAPPA) | — | sonda, guardiano, script, mappa |
| `docs/sviluppo/giro369/` | foto | prima/dopo |

Non toccati: generazione dei nomi, `GAME_VERSION`, `SAVE_VERSION`, `docs/governo`, il motore e la partita 3D (src/12-16).

## 5. Foto (telefono 412×915, deviceScaleFactor 2) — `docs/sviluppo/giro369/`

- `prima-creazione-aspetto0.png` (187 cm · 80 kg, nessuna scelta del piede) → `dopo-creazione-aspetto0.png` (170 cm · 63 kg,
  «Piede preferito: Destro | Sinistro»);
- `prima-carriera-aspetto0-testata.png` → `dopo-carriera-aspetto0-testata.png` (170/63 in entrambe: la carriera non cambia);
- `prima-carriera-aspetto0-profilo.png` (nessuna statura, nessun piede) → `dopo-carriera-aspetto0-profilo.png`
  («170 cm · 63 kg · piede destro»).

## 6. Rituale e guardiani della zona NON girati

Girati: `profilo-369` (verde + rosso), `mappa-unica`, `save-compat`, `node ci-runner.mjs giro profilo-369` (guardiano + 17
sentinelle): ESITO_GIRO.

Non girati da me (consegna rapida, li giudica il treno): gli altri **140** guardiani delle righe della MAPPA che toccano
src/01, src/17 e src/18, fra cui i piu' vicini a questa modifica: `figurina-199`, `crea-home-295`, `home-199`,
`grafica-v2`, `design-system`, `griglia-mobile`, `ritocchi-302`, `migrazione-194`, `nomi-salvati-190`,
`career-critical`, `test:logic`, `accessibilita-234`. Il blocco del piede usa i token del tema (`RAD.sm`, `TH.*`, `FS.small`,
`FW.bold`): nessun raggio o colore scritto a mano.

## 7. Dubbi per il PO (la consigliata e' la prima ed e' GIA' APPLICATA)

**D1 — Quale statura e' quella vera.**
1. **(applicata)** Quella che la carriera mostrava gia', che e' la statura del corpo 3D: cambia solo la creazione. Nessuna
   carriera in corso vede cambiare il proprio numero.
2. Quella che mostrava la creazione: cambierebbe il numero in tutte le carriere in corso e non corrisponderebbe piu' al corpo 3D.
3. Statura scelta dal giocatore alla creazione (cursore 170-190): il corpo 3D dovrebbe seguirla (oggi dipende dall'aspetto) e
   tocca la partita 3D, dove lavorano i giri 364/367.

**D2 — Come si chiamano i due piedi.**
1. **(applicata)** «Destro / Sinistro» nella creazione, «piede destro / piede sinistro» nel Profilo.
2. «Destro / Mancino».
3. Aggiungere «Ambidestro»: il motore (F8) conosce solo `R`/`L`, servirebbe una regola nuova per il piede debole.

**D3 — Dove scrivere statura, peso e piede nel Profilo.**
1. **(applicata)** Una riga sotto «anni · club · ruolo», accanto alla figurina.
2. Dentro la figurina V2 del Profilo (che oggi porta OVR e sei attributi: va ridisegnata).
3. Solo nella figurina della testata, come prima (il piede resterebbe invisibile).

**Nota per il PO, fuori ambito:** nelle cerimonie 3D (src/16) il corpo dell'eroe e' limitato a 1,95 unita' di scena
(`Math.min(1.95, heroAppr.height)`), quindi gli aspetti piu' alti (fino a 190 cm) appaiono un po' piu' bassi li' che in
partita. Non e' un numero scritto, e src/16 non l'ho toccato.
